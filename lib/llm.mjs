import { runtimeModelConfig, redactSecrets } from './config.mjs';
import { slideTypes } from './deckRenderer.mjs';
import { jsonrepair } from 'jsonrepair';

const RPM_LIMIT = 24;
const RPM_WINDOW_MS = 62_000;
const STREAM_IDLE_TIMEOUT_MS = 90_000;
const REQUEST_RETRIES = 3;
const RETRYABLE_STATUS_CODES = new Set([408, 409, 425, 429, 500, 502, 503, 504]);
const requestTimes = [];
let rateGate = Promise.resolve();

export async function streamDeckPlan({ idea, variant, settings, diversitySeed, onSlide }) {
  const config = runtimeModelConfig(settings);
  if (!config.apiKey) {
    throw new Error('模型 API key 还没有配置。');
  }

  const first = streamRequestBody({ idea, variant, config, strictRetry: false, diversitySeed });
  const retry = streamRequestBody({ idea, variant, config, strictRetry: true, diversitySeed });
  let lastError;

  for (const body of [first, retry]) {
    try {
      const seenIndexes = new Set();
      await postStreamingChatCompletions(config, body, async (line) => {
        const parsed = parseJsonObject(line);
        if (Array.isArray(parsed?.slides)) {
          for (const [index, candidate] of parsed.slides.slice(0, 6).entries()) {
            const slideIndex = resolveSlideIndex(candidate.index, candidate, index);
            if (slideIndex === null || seenIndexes.has(slideIndex)) continue;
            seenIndexes.add(slideIndex);
            await onSlide({
              index: slideIndex,
              deckTitle: stringOrEmpty(parsed.deckTitle || parsed.deck_title || parsed.title),
              deckSubtitle: stringOrEmpty(parsed.deckSubtitle || parsed.deck_subtitle || parsed.subtitle),
              slide: { ...candidate, type: slideTypes[slideIndex] },
            });
          }
          return;
        }
        const slide = parsed.slide && typeof parsed.slide === 'object' ? parsed.slide : parsed;
        let index = resolveSlideIndex(parsed.index, slide);
        if (index === null && slideTypes.includes(parsed.type)) {
          const typeIndex = slideTypes.indexOf(parsed.type);
          if (hasUsableSlide(slide, typeIndex)) index = typeIndex;
        }
        if (index === null || seenIndexes.has(index)) return;
        seenIndexes.add(index);
        await onSlide({
          index,
          deckTitle: stringOrEmpty(parsed.deckTitle || parsed.deck_title || parsed.title),
          deckSubtitle: stringOrEmpty(parsed.deckSubtitle || parsed.deck_subtitle || parsed.subtitle),
          slide: { ...slide, type: slideTypes[index] },
        });
      });
      if (seenIndexes.size >= 6) return;
      throw new Error(`模型只流式返回了 ${seenIndexes.size} 页。`);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

function streamRequestBody({ idea, variant, config, strictRetry, diversitySeed }) {
  const body = {
    model: config.model,
    stream: true,
    messages: [
      {
        role: 'system',
        content: [
          '你是资深中文商业演示策划和信息设计师。',
          '你要按页流式输出一个 6 页网页 PPT 的内容。',
          '只输出一个 JSON object，里面必须有 deckTitle、deckSubtitle、slides。不要 Markdown，不要解释，不要代码块。',
          'slides 数组里必须连续写 6 个 slide object；每个对象一完成就继续输出下一个对象，不要停在第 1 页。',
          '在 6 个 slide object 写完前，不要关闭 slides 数组，不要结束整个 JSON。',
          '所有文案要短、准、有演讲感。标题尽量 6 到 16 个中文字符。',
          strictRetry ? '这次是格式修复重试：必须输出一个 JSON object，slides 数组里必须有 6 个完整对象，所有字符串必须用双引号，不能漏逗号。' : '',
        ].join('\n'),
      },
      {
        role: 'user',
        content: buildStreamPrompt({ idea, variant, diversitySeed }),
      },
    ],
    temperature: strictRetry ? 0.24 : variant.temperature,
    max_tokens: 3400,
  };

  if (!strictRetry && config.reasoningEffort) {
    body.reasoning_effort = config.reasoningEffort;
  }

  return body;
}

function buildStreamPrompt({ idea, variant, diversitySeed }) {
  return `PPT 想法：
${idea}

版本方向：
${variant.title}

视觉系统：
${variant.visualSystem} / ${variant.accentLabel}

语气：
${variant.tone}

内容视角：
${variant.contentLens}

特殊要求：
${variant.promptHint}

必须避开：
${variant.avoidLens}

本轮差异化种子：
${diversitySeed || `${variant.code}-stream`}
这个种子只用于改变思考角度和措辞，不要写进页面。

请输出一个 JSON object，格式如下：
{
  "deckTitle": "整份 deck 标题",
  "deckSubtitle": "一句总副标题",
  "slides": [
    {"index":0,"kicker":"OPENING","title":"封面标题","subtitle":"封面副标题","footer":"场景说明"},
    {"index":1,"kicker":"WHY NOW","title":"三点判断页标题","subtitle":"一句说明","stats":[{"label":"短标签","value":"短值","unit":"","note":"一句说明"},{"label":"短标签","value":"短值","unit":"","note":"一句说明"},{"label":"短标签","value":"短值","unit":"","note":"一句说明"}]},
    {"index":2,"kicker":"CORE ARGUMENT","title":"核心观点页标题","body":"一段 30 到 60 字说明","points":["短观点一","短观点二","短观点三"]},
    {"index":3,"kicker":"FOUR DIRECTIONS","title":"四宫格页标题","cards":[{"eyebrow":"01 / 标签","title":"卡片标题","body":"一句说明"},{"eyebrow":"02 / 标签","title":"卡片标题","body":"一句说明"},{"eyebrow":"03 / 标签","title":"卡片标题","body":"一句说明"},{"eyebrow":"04 / 标签","title":"卡片标题","body":"一句说明"}]},
    {"index":4,"kicker":"WORKFLOW","title":"流程页标题","subtitle":"一句说明","steps":[{"title":"步骤一","body":"一句说明"},{"title":"步骤二","body":"一句说明"},{"title":"步骤三","body":"一句说明"},{"title":"步骤四","body":"一句说明"}]},
    {"index":5,"kicker":"TAKEAWAYS","title":"收束页标题","body":"一段 30 到 60 字收束","takeaways":["记忆点一","记忆点二","记忆点三"]}
  ]
}

重要：严格输出这个对象，不要输出任何额外文字。slides 数组必须写满 6 个对象。`;
}

async function postStreamingChatCompletions(config, body, onJsonLine) {
  const endpoint = chatCompletionsEndpoint(config.baseUrl);
  const attempts = [
    body,
    body.reasoning_effort ? without(body, 'reasoning_effort') : null,
  ].filter(Boolean);

  let lastError = '';
  for (const attempt of attempts) {
    for (let retry = 0; retry < REQUEST_RETRIES; retry += 1) {
      await waitForRateSlot();
      const controller = new AbortController();
      let idleTimer;
      const refreshIdleTimer = () => {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => controller.abort(), STREAM_IDLE_TIMEOUT_MS);
      };
      refreshIdleTimer();
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify(attempt),
          signal: controller.signal,
        });

        if (response.ok) {
          await readChatStream(response, onJsonLine, refreshIdleTimer);
          return;
        }

        lastError = await response.text();
        if (response.status === 400) break;
        if (isRetryableStatus(response.status) && retry < REQUEST_RETRIES - 1) {
          await waitBeforeRetry(retry);
          continue;
        }
        break;
      } catch (error) {
        lastError = requestErrorMessage(error);
        if (retry < REQUEST_RETRIES - 1) {
          await waitBeforeRetry(retry);
          continue;
        }
        break;
      } finally {
        clearTimeout(idleTimer);
      }
    }
  }

  throw new Error(redactSecrets(lastError || '模型流式请求失败。', config));
}

function chatCompletionsEndpoint(baseUrl) {
  if (/\/chat\/completions\/?$/i.test(baseUrl)) return baseUrl.replace(/\/+$/, '');
  return `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
}

function isRetryableStatus(status) {
  return RETRYABLE_STATUS_CODES.has(status);
}

function requestErrorMessage(error) {
  if (error?.name === 'AbortError') {
    return `模型流超过 ${Math.round(STREAM_IDLE_TIMEOUT_MS / 1000)} 秒没有新内容，已自动重试。`;
  }
  const message = String(error?.message || error || '');
  if (/fetch failed|network|socket|ECONN|ENOTFOUND|ETIMEDOUT|UND_ERR/i.test(message)) {
    return '模型网络连接失败，已自动重试。';
  }
  return message || '模型请求失败。';
}

function waitBeforeRetry(retry) {
  return new Promise((resolve) => setTimeout(resolve, 900 * (retry + 1)));
}

async function readChatStream(response, onJsonLine, onActivity = () => {}) {
  if (!response.body) throw new Error('模型没有返回可读取的流。');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let sseBuffer = '';
  let contentBuffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    onActivity();
    sseBuffer += decoder.decode(value, { stream: true });
    const events = sseBuffer.split(/\r?\n\r?\n/);
    sseBuffer = events.pop() || '';

    for (const event of events) {
      const dataLines = event
        .split(/\r?\n/)
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim());

      for (const data of dataLines) {
        if (!data || data === '[DONE]') continue;
        const parsed = JSON.parse(data);
        const delta = parsed?.choices?.[0]?.delta?.content
          ?? parsed?.choices?.[0]?.message?.content
          ?? '';
        if (!delta) continue;
        contentBuffer += delta;
        const extracted = extractJsonObjects(contentBuffer);
        contentBuffer = extracted.rest;
        for (const objectText of extracted.objects) {
          await onJsonLine(objectText);
        }
      }
    }
  }

  const extracted = extractJsonObjects(contentBuffer);
  for (const objectText of extracted.objects) {
    await onJsonLine(objectText);
  }
}

function extractJsonObjects(input) {
  const objects = [];
  const stack = [];
  let inString = false;
  let escape = false;
  let lastConsumed = 0;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (escape) {
      escape = false;
      continue;
    }
    if (inString && char === '\\') {
      escape = true;
      continue;
    }
    if (stack.length && char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === '{') {
      stack.push(index);
      continue;
    }

    if (char === '}') {
      const start = stack.pop();
      if (start === undefined) {
        lastConsumed = index + 1;
        continue;
      }
      const objectText = input.slice(start, index + 1);
      if (isSlideLikeObject(objectText)) {
        objects.push(objectText);
        lastConsumed = index + 1;
      }
      continue;
    }

    if (!stack.length) lastConsumed = index + 1;
  }

  return {
    objects,
    rest: objects.length ? input.slice(lastConsumed) : input.slice(stack[0] ?? lastConsumed),
  };
}

function isSlideLikeObject(objectText) {
  return /"(?:index|slide|slides)"\s*:/.test(objectText);
}

async function waitForRateSlot() {
  const run = rateGate.then(async () => {
    while (true) {
      const now = Date.now();
      while (requestTimes.length && now - requestTimes[0] > RPM_WINDOW_MS) {
        requestTimes.shift();
      }
      if (requestTimes.length < RPM_LIMIT) {
        requestTimes.push(Date.now());
        return;
      }
      const delay = Math.max(250, RPM_WINDOW_MS - (now - requestTimes[0]));
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  });
  rateGate = run.catch(() => {});
  return run;
}

function without(object, key) {
  const clone = { ...object };
  delete clone[key];
  return clone;
}

function hasUsableSlide(slide, slideIndex) {
  if (!slide || typeof slide !== 'object') return false;
  if (typeof slide.title !== 'string' || !slide.title.trim()) return false;
  if (slideIndex === 1) return Array.isArray(slide.stats) && slide.stats.length >= 3;
  if (slideIndex === 2) return Array.isArray(slide.points) && slide.points.length >= 3;
  if (slideIndex === 3) return Array.isArray(slide.cards) && slide.cards.length >= 4;
  if (slideIndex === 4) return Array.isArray(slide.steps) && slide.steps.length >= 4;
  if (slideIndex === 5) return Array.isArray(slide.takeaways) && slide.takeaways.length >= 3;
  return true;
}

function resolveSlideIndex(value, slide, fallbackIndex) {
  const number = Number(value);
  const candidates = [];
  if (Number.isInteger(number)) {
    candidates.push(number, number - 1);
  }
  if (Number.isInteger(fallbackIndex)) {
    candidates.push(fallbackIndex);
  }

  for (const candidate of candidates) {
    if (candidate >= 0 && candidate < slideTypes.length && hasUsableSlide(slide, candidate)) {
      return candidate;
    }
  }

  return null;
}

function stringOrEmpty(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseJsonObject(content) {
  const clean = String(content)
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(clean);
  } catch {
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
      throw new Error('模型返回的内容不是 JSON。');
    }
    const objectText = clean.slice(start, end + 1);
    try {
      return JSON.parse(objectText);
    } catch {
      return JSON.parse(jsonrepair(objectText));
    }
  }
}
