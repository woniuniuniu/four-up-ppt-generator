const board = document.querySelector('#board');
const template = document.querySelector('#cardTemplate');
const form = document.querySelector('#generateForm');
const button = document.querySelector('#generateButton');
const idea = document.querySelector('#idea');
const configPanel = document.querySelector('#configPanel');
const configToggle = document.querySelector('#configToggle');
const themeToggle = document.querySelector('#themeToggle');
const configHelp = document.querySelector('#configHelp');
const THEME_KEY = 'four-up-ppt-theme';
const fields = {
  provider: document.querySelector('#provider'),
  model: document.querySelector('#model'),
  baseUrl: document.querySelector('#baseUrl'),
  reasoningEffort: document.querySelector('#reasoningEffort'),
  apiKey: document.querySelector('#apiKey'),
};

let variants = [];
let serverApiKeyConfigured = false;

applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
init();

async function init() {
  const config = await fetchJson('/api/config');
  variants = config.variants;
  serverApiKeyConfigured = Boolean(config.model?.apiKeyConfigured);
  fillConfig(config.model);
  setConfigPanelVisible(!serverApiKeyConfigured);
  renderCards(variants);
}

configToggle.addEventListener('click', () => {
  setConfigPanelVisible(configPanel.hidden);
});

themeToggle.addEventListener('click', () => {
  const nextTheme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
  applyTheme(nextTheme, true);
});

idea.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
    form.requestSubmit();
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const prompt = idea.value.trim();
  if (!prompt) {
    idea.focus();
    return;
  }

  const settings = collectSettings();
  const settingsError = validateSettings(settings, serverApiKeyConfigured);
  if (settingsError) {
    setConfigPanelVisible(true);
    setGlobalError(settingsError.message);
    settingsError.field?.focus();
    return;
  }

  renderCards(variants);
  button.disabled = true;
  button.textContent = '执行中';
  setAllCardsQueued();

  try {
    await streamGenerate(prompt, settings);
    button.disabled = false;
    button.textContent = '执行 4X';
  } catch (error) {
    setGlobalError(error.message);
    button.disabled = false;
    button.textContent = '执行 4X';
  }
});

function fillConfig(model) {
  fields.provider.value = model.provider || 'StepFun';
  fields.model.value = model.model || 'step-3.7-flash';
  fields.baseUrl.value = model.baseUrl || 'https://api.stepfun.com/v1';
  fields.reasoningEffort.value = model.reasoningEffort || 'medium';
  fields.apiKey.value = '';
  fields.apiKey.placeholder = model.apiKeyConfigured ? '留空使用托管版默认模型' : '填写你自己的 API Key（不会保存）';
  if (configHelp) {
    configHelp.textContent = model.apiKeyConfigured
      ? '线上托管版默认可直接生成；填写 API Key 后才会改用你自己的模型配置。'
      : '开源/自部署版本需要填写自己的模型名称、Base URL 和 API Key，不写入服务器配置。';
  }
}

function collectSettings() {
  return Object.fromEntries(
    Object.entries(fields)
      .map(([key, field]) => [key, field.value.trim()])
      .filter(([, value]) => value),
  );
}

function validateSettings(settings, hasServerApiKey) {
  if (!settings.baseUrl && !hasServerApiKey) {
    return { message: '请先填写模型服务 Base URL。', field: fields.baseUrl };
  }
  if (settings.baseUrl) {
    try {
      const url = new URL(settings.baseUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return { message: 'Base URL 只支持 http 或 https。', field: fields.baseUrl };
      }
    } catch {
      return { message: 'Base URL 格式不正确。', field: fields.baseUrl };
    }
  }
  if (!settings.model && !hasServerApiKey) {
    return { message: '请先填写模型名称。', field: fields.model };
  }
  if (!settings.apiKey && !hasServerApiKey) {
    return { message: '请先填写你自己的模型 API Key。', field: fields.apiKey };
  }
  return null;
}

function applyTheme(theme, persist = false) {
  const normalized = theme === 'light' ? 'light' : 'dark';
  document.body.dataset.theme = normalized;
  themeToggle.textContent = normalized === 'light' ? '黑色主题' : '白色主题';
  themeToggle.setAttribute('aria-pressed', normalized === 'light' ? 'true' : 'false');
  if (persist) localStorage.setItem(THEME_KEY, normalized);
}

function setConfigPanelVisible(isVisible) {
  configPanel.hidden = !isVisible;
  configToggle.textContent = isVisible ? '隐藏模型配置' : '模型配置';
}

function renderCards(items) {
  for (const card of board.querySelectorAll('.deck-card')) {
    clearPreviewFrame(card);
    revokeBlobUrl(card);
  }
  board.replaceChildren();
  for (const [index, item] of items.entries()) {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.variant = item.id;
    node.dataset.state = 'idle';
    node.dataset.page = '0';
    node.dataset.autoFollow = 'true';
    node.dataset.slideCount = '6';
    node.dataset.slot = String(index + 1).padStart(2, '0');
    node.querySelector('.code').textContent = `${item.code} / ${item.subtitle}`;
    node.querySelector('h2').textContent = item.title;
    node.querySelector('.card-foot p').textContent = '等待输入';
    board.appendChild(node);
  }
}

board.addEventListener('click', (event) => {
  const button = event.target.closest('.preview-nav button');
  if (!button) return;
  const card = button.closest('.deck-card');
  navigatePreview(card, Number(button.dataset.dir || 0));
});

function setAllCardsQueued() {
  for (const card of board.querySelectorAll('.deck-card')) {
    card.dataset.state = 'running';
    card.querySelector('.status').textContent = '排队';
    card.querySelector('.card-foot p').textContent = '准备并发生成';
    card.querySelector('.meter i').style.width = '8%';
    const waiting = card.querySelector('.waiting strong');
    waiting.textContent = '排队';
  }
}

function updateJob(job) {
  for (const [id, item] of Object.entries(job.variants || {})) {
    const card = board.querySelector(`[data-variant="${id}"]`);
    if (!card) continue;
    card.dataset.state = item.status;
    card.dataset.slideCount = String(item.slideCount || 6);
    card.querySelector('.status').textContent = statusLabel(item.status);
    card.querySelector('.meter i').style.width = `${item.progress || 0}%`;
    const generated = item.generatedSlides ? `${item.generatedSlides}/${item.slideCount || 6} 页 · ` : '';
    card.querySelector('.card-foot p').textContent = item.error || `${generated}${item.message || ''}`;

    const currentSlide = Number(item.currentSlide || item.generatedSlides || 0);
    if (currentSlide > 0 && card.dataset.autoFollow !== 'false') {
      const slideCount = Number(item.slideCount || 6);
      card.dataset.page = String(Math.max(0, Math.min(slideCount - 1, currentSlide - 1)));
    }

    const waiting = card.querySelector('.waiting strong');
    if (waiting) {
      waiting.textContent = item.status === 'done' ? '完成' : item.status === 'error' ? '错误' : '运行中';
    }

    if (item.html && item.generatedSlides > 0) {
      showPreviewHtml(card, item.html, item.version || 0);
      setHtmlActions(card, id, item.html);
    } else if (item.url && item.generatedSlides > 0) {
      showPreview(card, item.url, item.version || 0);
      const open = card.querySelector('.open-link');
      const download = card.querySelector('.download-link');
      open.hidden = false;
      download.hidden = false;
      open.href = item.url;
      download.href = item.url;
      download.setAttribute('download', `${id}.html`);
    }
  }
}

async function streamGenerate(prompt, settings) {
  const response = await fetch('/api/generate-stream', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ idea: prompt, settings }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `请求失败：${response.status}`);
  }

  if (!response.body) {
    throw new Error('浏览器不支持流式生成。');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line);
      if (event.job) updateJob(event.job);
    }
  }

  if (buffer.trim()) {
    const event = JSON.parse(buffer);
    if (event.job) updateJob(event.job);
  }
}

function showPreview(card, url, version) {
  const preview = card.querySelector('.preview');
  const nav = card.querySelector('.preview-nav');
  let iframe = preview.querySelector('iframe');
  const src = `${url}?v=${encodeURIComponent(version)}`;
  if (!iframe) {
    const waiting = preview.querySelector('.waiting');
    if (waiting) waiting.remove();
    iframe = document.createElement('iframe');
    iframe.addEventListener('load', () => syncPreviewPage(card));
    preview.prepend(iframe);
  }

  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  if (iframe.dataset.src !== src) {
    iframe.dataset.src = src;
    iframe.src = src;
  }

  iframe.title = card.querySelector('h2').textContent;
  iframe.loading = 'lazy';
  nav.hidden = false;
  updatePreviewLabel(card);
}

function navigatePreview(card, dir) {
  const count = Number(card.dataset.slideCount || 6);
  const current = Number(card.dataset.page || 0);
  const next = Math.max(0, Math.min(count - 1, current + dir));
  card.dataset.page = String(next);
  card.dataset.autoFollow = 'false';
  updatePreviewLabel(card);
  syncPreviewPage(card);
}

function showPreviewHtml(card, html, version) {
  const preview = card.querySelector('.preview');
  const nav = card.querySelector('.preview-nav');
  let iframe = preview.querySelector('iframe');
  const src = `srcdoc-preview:${version}`;
  if (!iframe) {
    const waiting = preview.querySelector('.waiting');
    if (waiting) waiting.remove();
    iframe = document.createElement('iframe');
    iframe.addEventListener('load', () => syncPreviewPage(card));
    preview.prepend(iframe);
  }

  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  if (iframe.dataset.src !== src) {
    iframe.dataset.src = src;
    iframe.removeAttribute('src');
    iframe.srcdoc = html;
  }

  iframe.title = card.querySelector('h2').textContent;
  iframe.loading = 'lazy';
  nav.hidden = false;
  updatePreviewLabel(card);
}

function setHtmlActions(card, id, html) {
  revokeBlobUrl(card);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  card.dataset.blobUrl = url;

  const open = card.querySelector('.open-link');
  const download = card.querySelector('.download-link');
  open.hidden = false;
  download.hidden = false;
  open.href = url;
  download.href = url;
  download.setAttribute('download', `${id}.html`);
}

function revokeBlobUrl(card) {
  if (!card?.dataset?.blobUrl) return;
  URL.revokeObjectURL(card.dataset.blobUrl);
  delete card.dataset.blobUrl;
}

function clearPreviewFrame(card) {
  const iframe = card?.querySelector?.('iframe');
  if (!iframe) return;
  iframe.removeAttribute('src');
  iframe.srcdoc = '';
  iframe.remove();
}

function updatePreviewLabel(card) {
  const label = card.querySelector('.preview-nav b');
  if (!label) return;
  const page = Number(card.dataset.page || 0) + 1;
  const count = Number(card.dataset.slideCount || 6);
  label.textContent = `${page} / ${count}`;
}

function syncPreviewPage(card) {
  const iframe = card.querySelector('iframe');
  if (!iframe?.contentWindow) return;
  const page = Number(card.dataset.page || 0);
  try {
    const win = iframe.contentWindow;
    if (typeof win.go === 'function') {
      win.go(page);
      window.setTimeout(() => {
        if (win.__currentSlideIndex !== page && typeof win.go === 'function') win.go(page);
      }, 760);
      return;
    }
    syncStaticPreviewPage(iframe, page);
  } catch {
    // Preview navigation is best-effort while the iframe is hot-reloading.
  }
}

function syncStaticPreviewPage(iframe, page) {
  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  const deck = doc?.querySelector('#deck');
  const slides = [...(doc?.querySelectorAll('.slide') || [])];
  if (!deck || !slides.length) return;

  const current = Math.max(0, Math.min(slides.length - 1, page));
  const active = slides[current];
  deck.style.width = `${slides.length * 100}vw`;
  deck.style.transition = 'none';
  deck.style.transform = `translate3d(-${current * 100}vw, 0, 0)`;
  iframe.contentWindow.__currentSlideIndex = current;

  doc.body.classList.toggle('dark-bg', active?.classList.contains('dark'));
  doc.body.classList.toggle(
    'light-bg',
    Boolean(active && !active.classList.contains('dark')),
  );
  slides.forEach((slide, index) => {
    slide.toggleAttribute('aria-hidden', index !== current);
  });
}

window.addEventListener('pagehide', () => {
  for (const card of board.querySelectorAll('.deck-card')) {
    clearPreviewFrame(card);
    revokeBlobUrl(card);
  }
});

function setGlobalError(message) {
  for (const card of board.querySelectorAll('.deck-card')) {
    card.dataset.state = 'error';
    card.querySelector('.status').textContent = '错误';
    card.querySelector('.card-foot p').textContent = message;
    card.querySelector('.meter i').style.width = '100%';
    const waiting = card.querySelector('.waiting strong');
    if (waiting) waiting.textContent = '错误';
  }
}

function statusLabel(status) {
  return {
    queued: '排队',
    running: '生成中',
    done: '完成',
    error: '错误',
    idle: '等待',
  }[status] || status;
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `请求失败：${response.status}`);
  return data;
}
