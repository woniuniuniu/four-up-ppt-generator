import { readFileSync } from 'node:fs';
import path from 'node:path';
import { upstreamDir } from './config.mjs';

export const variants = [
  {
    id: 'executive',
    code: 'A',
    title: '高端商务版',
    subtitle: '瑞士风、战略叙事、克莱因蓝',
    style: 'swiss',
    coverLayout: 'swiss-hero',
    visualSystem: 'Swiss Style',
    accentLabel: 'IKB 克莱因蓝',
    theme: 'ikb',
    tone: '冷静、可信、像给董事会或投资人看的战略汇报',
    contentLens: '从产业拐点、资本配置、竞争壁垒、规模化节奏来思考。',
    openingMove: '封面要像董事会判断，不要照抄用户题目；用一句观点标题切入。',
    avoidLens: '不要写成产品发布会、内部周报或故事散文。',
    promptHint: '更商务，更像决策层汇报。强调市场判断、关键抓手、可执行路径。',
    temperature: 0.62,
  },
  {
    id: 'launch',
    code: 'B',
    title: '产品展示版',
    subtitle: '杂志风、发布会节奏、墨水经典',
    style: 'magazine',
    coverLayout: 'magazine-frontpage',
    visualSystem: 'Magazine Ink',
    accentLabel: '墨水经典',
    theme: 'monocle',
    tone: '明快、年轻、有现场展示感，但仍保持高级克制',
    contentLens: '从用户场景、演示节奏、亮点瞬间、观众记忆点来思考。',
    openingMove: '封面要像一场发布会开场，给观众一个鲜明卖点。',
    avoidLens: '不要写成董事会投资判断、项目周报或长篇叙事。',
    promptHint: '更适合拿去做展示。强调场景、体验、亮点、观众记忆点。',
    temperature: 0.78,
  },
  {
    id: 'briefing',
    code: 'C',
    title: '内部汇报版',
    subtitle: '瑞士风、路线图、柠檬绿',
    style: 'swiss',
    coverLayout: 'swiss-ledger',
    visualSystem: 'Swiss Style',
    accentLabel: '高亮柠檬绿',
    theme: 'lemonGreen',
    tone: '务实、清晰、适合周会或项目汇报',
    contentLens: '从工作流、里程碑、风险依赖、下一步决策来思考。',
    openingMove: '封面要像项目作战图，不要像发布会广告。',
    avoidLens: '不要写成宏大战略、观众 wow point 或散文式演讲。',
    promptHint: '更像内部项目汇报。强调进展、问题、下一步和资源请求。',
    temperature: 0.56,
  },
  {
    id: 'story',
    code: 'D',
    title: '叙事演讲版',
    subtitle: '杂志风、故事弧线、牛皮纸',
    style: 'magazine',
    coverLayout: 'magazine-zine',
    visualSystem: 'Magazine Ink',
    accentLabel: '牛皮纸',
    theme: 'kraft',
    tone: '更有观点、更有节奏，适合分享会或私享会演讲',
    contentLens: '从人物、冲突、转折、时代情绪、最后一句记忆点来思考。',
    openingMove: '封面要像私享会演讲的题眼，带一点反差或悬念。',
    avoidLens: '不要写成投资汇报、产品功能清单或项目周报。',
    promptHint: '更像公开演讲。强调钩子、反差、观点推进和最后的记忆句。',
    temperature: 0.84,
  },
];

export const slideTypes = ['cover', 'metrics', 'argument', 'chart', 'grid', 'process', 'comparison', 'roadmap', 'close'];
export const DECK_SLIDE_COUNT = slideTypes.length;

const themeVars = {
  ikb: {
    '--paper': '#fafaf8',
    '--paper-rgb': '250,250,248',
    '--ink': '#0a0a0a',
    '--ink-rgb': '10,10,10',
    '--grey-1': '#f0f0ee',
    '--grey-2': '#d4d4d2',
    '--grey-3': '#737373',
    '--accent': '#002FA7',
    '--accent-rgb': '0,47,167',
    '--accent-on': '#ffffff',
  },
  lemon: {
    '--paper': '#fafaf8',
    '--paper-rgb': '250,250,248',
    '--ink': '#0a0a0a',
    '--ink-rgb': '10,10,10',
    '--grey-1': '#f0f0ee',
    '--grey-2': '#d4d4d2',
    '--grey-3': '#737373',
    '--accent': '#FFD500',
    '--accent-rgb': '255,213,0',
    '--accent-on': '#0a0a0a',
  },
  lemonGreen: {
    '--paper': '#fafaf8',
    '--paper-rgb': '250,250,248',
    '--ink': '#0a0a0a',
    '--ink-rgb': '10,10,10',
    '--grey-1': '#f0f0ee',
    '--grey-2': '#d4d4d2',
    '--grey-3': '#737373',
    '--accent': '#C5E803',
    '--accent-rgb': '197,232,3',
    '--accent-on': '#0a0a0a',
  },
  safetyOrange: {
    '--paper': '#fafaf8',
    '--paper-rgb': '250,250,248',
    '--ink': '#0a0a0a',
    '--ink-rgb': '10,10,10',
    '--grey-1': '#f0f0ee',
    '--grey-2': '#d4d4d2',
    '--grey-3': '#737373',
    '--accent': '#FF6B35',
    '--accent-rgb': '255,107,53',
    '--accent-on': '#ffffff',
  },
};

const magazineThemeVars = {
  monocle: {
    '--ink': '#0a0a0b',
    '--ink-rgb': '10,10,11',
    '--paper': '#f1efea',
    '--paper-rgb': '241,239,234',
    '--paper-tint': '#e8e5de',
    '--ink-tint': '#18181a',
  },
  indigoPorcelain: {
    '--ink': '#0a1f3d',
    '--ink-rgb': '10,31,61',
    '--paper': '#f1f3f5',
    '--paper-rgb': '241,243,245',
    '--paper-tint': '#e4e8ec',
    '--ink-tint': '#152a4a',
  },
  kraft: {
    '--ink': '#2a1e13',
    '--ink-rgb': '42,30,19',
    '--paper': '#eedfc7',
    '--paper-rgb': '238,223,199',
    '--paper-tint': '#e0d0b6',
    '--ink-tint': '#3a2a1d',
  },
};

export function renderSwissDeck(plan, variant) {
  const normalized = normalizePlan(plan, variant);
  const templatePath = path.join(upstreamDir, 'assets', 'template-swiss.html');
  let html = readFileSync(templatePath, 'utf8');
  const slidesHtml = renderSlides(normalized, variant);

  html = html.replace(
    '[必填] 替换为 PPT 标题 · Deck Title',
    `${escapeText(normalized.title)} · ${escapeText(variant.title)}`,
  );
  html = injectTheme(html, variant.theme);
  html = injectDeck(html, slidesHtml);
  html = html.replace('</body>', provenanceComment() + '\n</body>');
  return html;
}

export function renderDeck(plan, variant) {
  return variant.style === 'magazine' ? renderMagazineDeck(plan, variant) : renderSwissDeck(plan, variant);
}

export function renderMagazineDeck(plan, variant) {
  const normalized = normalizePlan(plan, variant);
  const templatePath = path.join(upstreamDir, 'assets', 'template.html');
  let html = readFileSync(templatePath, 'utf8');
  const slidesHtml = renderMagazineSlides(normalized, variant);

  html = html.replace(
    '[必填] 替换为 PPT 标题 · Deck Title',
    `${escapeText(normalized.title)} · ${escapeText(variant.title)}`,
  );
  html = injectMagazineTheme(html, variant.theme);
  html = injectDeck(html, slidesHtml);
  html = html.replace('</body>', provenanceComment() + '\n</body>');
  return html;
}

export function createEmptyPlan(idea, variant) {
  const cleanIdea = text(idea, '四宫格 PPT 生成器');
  const title = cleanIdea.length > 18 ? cleanIdea.slice(0, 18) : cleanIdea;
  return {
    title,
    subtitle: `${variant.title}`,
    slides: slideTypes.map((type) => ({ type, blank: true })),
  };
}

export function normalizePlan(plan = {}, variant = variants[0]) {
  const title = text(plan.title, '四宫格 PPT 生成器');
  const subtitle = text(plan.subtitle, variant.subtitle);
  const sourceSlides = Array.isArray(plan.slides) ? plan.slides : [];
  const slides = slideTypes.map((_, index) => sourceSlides[index] || {});

  return {
    title,
    subtitle,
    slides: [
      slides[0].blank ? { type: 'cover', blank: true } :
      {
        type: 'cover',
        kicker: text(slides[0].kicker, 'OPENING FIELD NOTE'),
        title: text(slides[0].title, title),
        subtitle: text(slides[0].subtitle, subtitle),
        footer: text(slides[0].footer, 'Generated with StepFun × 歸藏 Skill'),
      },
      slides[1].blank ? { type: 'metrics', blank: true } :
      {
        type: 'metrics',
        kicker: text(slides[1].kicker, 'WHY NOW'),
        title: text(slides[1].title, '先把问题压缩成三个判断'),
        subtitle: text(slides[1].subtitle, '用少量数字或短语建立共识。'),
        stats: normalizeStats(slides[1].stats),
      },
      slides[2].blank ? { type: 'argument', blank: true } :
      {
        type: 'argument',
        kicker: text(slides[2].kicker, 'CORE ARGUMENT'),
        title: text(slides[2].title, '关键不是多做一份，而是并行分化'),
        body: text(slides[2].body, '同一个想法可以同时长出不同的叙事角度，让选择发生在生成之后。'),
        points: normalizeList(slides[2].points, ['同题异构', '并行试错', '快速选择'], 3),
      },
      slides[3].blank ? { type: 'chart', blank: true } :
      {
        type: 'chart',
        kicker: text(slides[3].kicker, 'RELATIVE SIGNAL'),
        title: text(slides[3].title, '把判断放进同一把尺'),
        subtitle: text(slides[3].subtitle, '使用相对评分表达优先级，不冒充真实统计数据。'),
        chart: normalizeChart(slides[3].chart || slides[3]),
      },
      slides[4].blank ? { type: 'grid', blank: true } :
      {
        type: 'grid',
        kicker: text(slides[4].kicker, 'FOUR DIRECTIONS'),
        title: text(slides[4].title, '四种版本各有用处'),
        cards: normalizeCards(slides[4].cards),
      },
      slides[5].blank ? { type: 'process', blank: true } :
      {
        type: 'process',
        kicker: text(slides[5].kicker, 'WORKFLOW'),
        title: text(slides[5].title, '从一句想法到四份成稿'),
        subtitle: text(slides[5].subtitle, '把排队式生成改成同时探索。'),
        steps: normalizeSteps(slides[5].steps),
      },
      slides[6].blank ? { type: 'comparison', blank: true } :
      {
        type: 'comparison',
        kicker: text(slides[6].kicker, 'TRADE-OFF'),
        title: text(slides[6].title, '关键取舍要放在同一页'),
        subtitle: text(slides[6].subtitle, '比较不是为了平均，而是为了让选择更清楚。'),
        columns: normalizeColumns(slides[6].columns),
      },
      slides[7].blank ? { type: 'roadmap', blank: true } :
      {
        type: 'roadmap',
        kicker: text(slides[7].kicker, 'NEXT MOVES'),
        title: text(slides[7].title, '下一步要能落到动作'),
        subtitle: text(slides[7].subtitle, '把愿景压成可执行的节奏。'),
        steps: normalizeRoadmap(slides[7].steps),
      },
      slides[8].blank ? { type: 'close', blank: true } :
      {
        type: 'close',
        kicker: text(slides[8].kicker, 'TAKEAWAYS'),
        title: text(slides[8].title, '最后只需要选一个最喜欢的'),
        body: text(slides[8].body, '速度足够快时，创意选择就会从稀缺变成日常。'),
        takeaways: normalizeList(slides[8].takeaways, ['生成不是终点', '并行带来比较', '选择保留审美'], 3),
      },
    ],
  };
}

function renderSlides(plan, variant) {
  const total = plan.slides.length;
  return [
    renderCover(plan, variant, total),
    renderMetrics(plan, variant, total),
    renderArgument(plan, variant, total),
    renderChart(plan, variant, total),
    renderGrid(plan, variant, total),
    renderProcess(plan, variant, total),
    renderComparison(plan, variant, total),
    renderRoadmap(plan, variant, total),
    renderClose(plan, variant, total),
  ].join('\n\n');
}

function renderMagazineSlides(plan, variant) {
  const total = plan.slides.length;
  return [
    renderMagazineCover(plan, variant, total),
    renderMagazineMetrics(plan, variant, total),
    renderMagazineArgument(plan, variant, total),
    renderMagazineChart(plan, variant, total),
    renderMagazineGrid(plan, variant, total),
    renderMagazineProcess(plan, variant, total),
    renderMagazineComparison(plan, variant, total),
    renderMagazineRoadmap(plan, variant, total),
    renderMagazineClose(plan, variant, total),
  ].join('\n\n');
}

function renderSwissBlank() {
  return `<section class="slide light" data-layout="S01"><div class="canvas-card"></div></section>`;
}

function renderMagazineBlank() {
  return `<section class="slide light"></section>`;
}

function renderCover(plan, variant, total) {
  const slide = plan.slides[0];
  if (slide.blank) return renderSwissBlank();
  if (variant.coverLayout === 'swiss-ledger') return renderSwissLedgerCover(plan, variant, total);
  return `<section class="slide accent" data-layout="SWISS-COVER-ASCII" data-animate="hero">
  <div class="canvas-card">
    <canvas class="ascii-bg" aria-hidden="true"></canvas>
    ${chrome(plan, variant, 1, total, true)}
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr auto;gap:2.6vh">
      <div data-anim="kicker" class="t-meta" style="color:rgba(255,255,255,.78);letter-spacing:.22em">${escapeText(slide.kicker)}</div>
      <h1 data-anim="title" style="align-self:center;font-family:var(--sans),var(--sans-zh);font-weight:200;font-size:min(10vw,17vh);line-height:.96;color:#fff">${lineBreakTitle(slide.title)}</h1>
      <div data-anim="bottom" style="display:grid;gap:1.6vh;border-top:1px solid rgba(255,255,255,.22);padding-top:2vh">
        <div class="lead" style="max-width:56ch;color:rgba(255,255,255,.86)">${escapeText(slide.subtitle)}</div>
        <div style="display:flex;justify-content:space-between;align-items:end;gap:2vw">
          <div class="t-meta" style="color:rgba(255,255,255,.6)">${escapeText(slide.footer)}</div>
          <div class="t-meta" style="color:rgba(255,255,255,.6)">${escapeText(variant.title)}</div>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function renderSwissLedgerCover(plan, variant, total) {
  const slide = plan.slides[0];
  return `<section class="slide light" data-layout="S01" data-animate="grid-reveal">
  <div class="canvas-card">
    ${chrome(plan, variant, 1, total)}
    <div style="flex:1;display:grid;grid-template-columns:1.08fr .92fr;gap:4vw;align-items:stretch">
      <div style="display:grid;grid-template-rows:auto 1fr auto;gap:3vh;padding-top:2vh">
        <div data-anim class="t-meta" style="color:var(--accent);letter-spacing:.24em">${escapeText(slide.kicker)}</div>
        <div style="align-self:start;margin-top:5vh;display:grid;gap:2.2vh">
          <h1 data-anim style="font-family:var(--sans),var(--sans-zh);font-weight:650;font-size:min(8vw,14vh);line-height:.9;color:var(--ink);max-width:9ch">${lineBreakTitle(slide.title)}</h1>
          <p data-anim class="lead" style="max-width:42ch;color:var(--text-secondary)">${escapeText(slide.subtitle)}</p>
        </div>
        <div data-anim class="t-meta" style="display:flex;justify-content:space-between;border-top:2px solid var(--ink);padding-top:1.6vh;color:var(--text-helper)">
          <span>${escapeText(slide.footer)}</span>
          <span>${escapeText(variant.accentLabel)}</span>
        </div>
      </div>
      <aside data-anim style="background:var(--accent);color:var(--accent-on);padding:4.4vh 3.2vw;display:grid;grid-template-rows:auto 1fr auto;min-height:62vh">
        <div class="t-meta" style="color:var(--accent-on);opacity:.78">INTERNAL RUNWAY</div>
        <div style="align-self:end;display:grid;gap:3vh">
          <div style="font-family:var(--mono);font-size:min(16vw,28vh);font-weight:700;line-height:.8;letter-spacing:-.08em">01</div>
          <div style="display:grid;gap:1.4vh;border-top:2px solid currentColor;padding-top:2.2vh">
            <div class="t-h-prod" style="font-size:max(22px,2vw);font-weight:650">里程碑控制台</div>
            <div class="t-body-sm" style="color:inherit;opacity:.78">进展 / 风险 / 依赖 / 下一步</div>
          </div>
        </div>
        <div class="t-meta" style="color:var(--accent-on);opacity:.72">BRIEFING MODE · ${escapeText(variant.code)}</div>
      </aside>
    </div>
  </div>
</section>`;
}

function renderMetrics(plan, variant, total) {
  const slide = plan.slides[1];
  if (slide.blank) return renderSwissBlank();
  if (variant.coverLayout === 'swiss-ledger') return renderSwissLedgerMetrics(plan, variant, total);
  const stats = slide.stats.slice(0, 3).map((item, index) => `<div class="stat-card ${index === 1 ? 'accent-top' : 'thin'}" data-anim>
    <div class="stat-label">${escapeText(item.label)}</div>
    <div class="stat-nb">${escapeText(item.value)}${item.unit ? `<span class="stat-unit">${escapeText(item.unit)}</span>` : ''}</div>
    <div class="stat-note">${escapeText(item.note)}</div>
  </div>`).join('');

  return `<section class="slide light" data-layout="S04" data-animate="grid-reveal">
  <div class="canvas-card">
    ${chrome(plan, variant, 2, total)}
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr auto;gap:3vh">
      ${head(slide.kicker, slide.title, slide.subtitle)}
      <div class="grid-3" style="align-content:center">${stats}</div>
      ${foot('Signal / Compression', variant)}
    </div>
  </div>
</section>`;
}

function renderSwissLedgerMetrics(plan, variant, total) {
  const slide = plan.slides[1];
  const stats = slide.stats.slice(0, 3).map((item, index) => `<div data-anim style="display:grid;grid-template-columns:7vw 1fr auto;gap:2vw;align-items:center;border-top:1px solid var(--border-subtle);padding:2.5vh 0">
    <div class="t-meta" style="color:var(--accent)">${String(index + 1).padStart(2, '0')}</div>
    <div>
      <div class="t-h-prod" style="font-size:max(24px,2vw);font-weight:650">${escapeText(item.label)}</div>
      <div class="t-body-sm" style="margin-top:.8vh;color:var(--text-secondary)">${escapeText(item.note)}</div>
    </div>
    <div style="font-family:var(--mono);font-size:min(6vw,10vh);font-weight:700;color:var(--ink);letter-spacing:-.06em">${escapeText(item.value)}${item.unit ? `<span style="font-size:.28em;margin-left:.12em">${escapeText(item.unit)}</span>` : ''}</div>
  </div>`).join('');

  return `<section class="slide light" data-layout="S04" data-animate="grid-reveal">
  <div class="canvas-card">
    ${chrome(plan, variant, 2, total)}
    <div style="flex:1;display:grid;grid-template-columns:.34fr 1fr;gap:4vw;align-items:start">
      <aside data-anim style="background:var(--accent);color:var(--accent-on);padding:3vh 2vw;display:grid;align-content:end">
        <div class="t-meta" style="color:inherit;opacity:.7">STATUS</div>
        <div style="font-family:var(--mono);font-size:min(8vw,14vh);line-height:.82;font-weight:800;letter-spacing:-.08em">03</div>
      </aside>
      <div style="display:grid;grid-template-rows:auto 1fr auto;gap:3vh">
        ${head(slide.kicker, slide.title, slide.subtitle)}
        <div style="align-self:start;margin-top:4vh">${stats}</div>
        ${foot('Milestone Ledger', variant)}
      </div>
    </div>
  </div>
</section>`;
}

function renderArgument(plan, variant, total) {
  const slide = plan.slides[2];
  if (slide.blank) return renderSwissBlank();
  const points = slide.points.map((point, index) => `<div style="display:grid;grid-template-columns:auto 1fr;gap:1.6vw;align-items:start;padding:2.2vh 0;border-top:1px solid var(--border-subtle)" data-anim>
    <div class="t-meta" style="color:var(--accent)">${String(index + 1).padStart(2, '0')}</div>
    <div>
      <div class="t-h-prod" style="font-size:max(18px,1.55vw);font-weight:400">${escapeText(point)}</div>
      <div class="t-body-sm" style="margin-top:.8vh;color:var(--text-secondary)">${escapeText(argumentNote(index, variant))}</div>
    </div>
  </div>`).join('');

  return `<section class="slide split" data-layout="S10" data-animate="split-statement">
  <div class="canvas-card">
    <div class="split-half">
      <div class="half b-ink">
        ${chrome(plan, variant, 3, total, true)}
        <div data-anim="manifesto" style="margin-top:auto;margin-bottom:auto;display:flex;flex-direction:column;gap:2.4vh">
          <div class="t-meta" style="color:rgba(255,255,255,.62)">${escapeText(slide.kicker)}</div>
          <h2 style="font-family:var(--sans),var(--sans-zh);font-size:min(6.4vw,11vh);line-height:.96;font-weight:200;color:var(--paper)">${lineBreakTitle(slide.title)}</h2>
          <p class="t-body" style="max-width:42ch;color:rgba(255,255,255,.78)">${escapeText(slide.body)}</p>
        </div>
      </div>
      <div class="half b-grey r-border">
        <div style="margin-top:auto;margin-bottom:auto">${points}</div>
      </div>
    </div>
  </div>
</section>`;
}

function renderChart(plan, variant, total) {
  const slide = plan.slides[3];
  if (slide.blank) return renderSwissBlank();
  const items = slide.chart.items.slice(0, 5);
  const bars = items.map((item, index) => `<div data-anim style="display:grid;grid-template-columns:minmax(7vw,10vw) 1fr auto;gap:1.4vw;align-items:center;padding:1.7vh 0;border-top:1px solid var(--border-subtle)">
    <div>
      <div class="t-meta" style="color:var(--text-helper)">${String(index + 1).padStart(2, '0')}</div>
      <div class="t-body-sm" style="margin-top:.5vh;color:var(--text-secondary)">${escapeText(item.label)}</div>
    </div>
    <div style="height:3.2vh;background:var(--grey-1);position:relative;overflow:hidden">
      <div style="position:absolute;inset:0 auto 0 0;width:${chartWidth(item.score)}%;background:${index === 0 ? 'var(--accent)' : 'var(--ink)'}"></div>
    </div>
    <div style="text-align:right;min-width:5.4vw">
      <div style="font-family:var(--mono);font-size:max(22px,2vw);font-weight:800;letter-spacing:-.04em;color:var(--ink)">${escapeText(item.value)}</div>
      <div class="t-meta" style="color:var(--text-helper)">${escapeText(item.unit)}</div>
    </div>
  </div>`).join('');

  return `<section class="slide light" data-layout="S07" data-animate="grid-reveal">
  <div class="canvas-card">
    ${chrome(plan, variant, 4, total)}
    <div style="flex:1;display:grid;grid-template-columns:.82fr 1.18fr;gap:4vw;align-items:start">
      <div style="display:grid;gap:2.4vh">
        ${head(slide.kicker, slide.title, slide.subtitle)}
        <div data-anim style="border:2px solid var(--ink);padding:2.4vh 2vw;display:grid;gap:1vh">
          <div class="t-meta" style="color:var(--accent)">CHART NOTE</div>
          <p class="t-body-sm" style="margin:0;color:var(--text-secondary)">${escapeText(slide.chart.note)}</p>
        </div>
      </div>
      <div style="align-self:center">${bars}</div>
    </div>
    ${foot('Relative Chart', variant)}
  </div>
</section>`;
}

function renderGrid(plan, variant, total) {
  const slide = plan.slides[4];
  if (slide.blank) return renderSwissBlank();
  const cards = slide.cards.slice(0, 4).map((card, index) => `<div class="${index === 0 ? 'card-accent' : 'card-fill'}" style="padding:3.2vh 2vw;display:flex;flex-direction:column;gap:1.6vh;min-height:24vh" data-anim>
    <div class="t-meta">${escapeText(card.eyebrow)}</div>
    <div class="t-h-prod" style="font-size:max(20px,1.8vw);font-weight:400;line-height:1.15">${escapeText(card.title)}</div>
    <p class="t-body-sm" style="margin:0;line-height:1.55">${escapeText(card.body)}</p>
  </div>`).join('');

  return `<section class="slide light" data-layout="S15" data-animate="grid-reveal">
  <div class="canvas-card">
    ${chrome(plan, variant, 5, total)}
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr auto;gap:2.8vh">
      ${head(slide.kicker, slide.title)}
      <div class="grid-4">${cards}</div>
      ${foot('Four-up / Variant Space', variant)}
    </div>
  </div>
</section>`;
}

function renderProcess(plan, variant, total) {
  const slide = plan.slides[5];
  if (slide.blank) return renderSwissBlank();
  if (variant.coverLayout === 'swiss-ledger') return renderSwissLedgerProcess(plan, variant, total);
  const steps = slide.steps.slice(0, 4).map((step, index) => `<div class="step ${index === 0 ? 'accent-top' : ''}" data-anim="step">
    <div class="step-nb">${String(index + 1).padStart(2, '0')}</div>
    <div class="step-title">${escapeText(step.title)}</div>
    <div class="step-desc">${escapeText(step.body)}</div>
  </div>`).join('');

  return `<section class="slide dark" data-layout="S13" data-animate="progression">
  <div class="canvas-card">
    ${chrome(plan, variant, 6, total)}
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr auto;gap:3.4vh">
      ${head(slide.kicker, slide.title, slide.subtitle, true)}
      <div class="pipeline-section">
        <div class="pipeline-label">INPUT → PARALLEL RUN → FOUR HTML DECKS → PICK ONE</div>
        <div class="pipeline" data-cols="4">${steps}</div>
      </div>
      ${foot('Concurrent Generation', variant)}
    </div>
  </div>
</section>`;
}

function renderSwissLedgerProcess(plan, variant, total) {
  const slide = plan.slides[5];
  const steps = slide.steps.slice(0, 4).map((step, index) => `<div data-anim="step" style="display:grid;grid-template-columns:5vw 1fr;gap:2vw;align-items:start;padding:2.4vh 0;border-top:1px solid var(--border-subtle)">
    <div style="width:3.2vw;height:3.2vw;min-width:42px;min-height:42px;background:${index === 0 ? 'var(--accent)' : 'var(--grey-1)'};color:${index === 0 ? 'var(--accent-on)' : 'var(--ink)'};display:grid;place-items:center;font-family:var(--mono);font-weight:800">${String(index + 1).padStart(2, '0')}</div>
    <div>
      <div class="t-h-prod" style="font-size:max(22px,1.9vw);font-weight:650">${escapeText(step.title)}</div>
      <div class="t-body-sm" style="margin-top:1vh;color:var(--text-secondary)">${escapeText(step.body)}</div>
    </div>
  </div>`).join('');

  return `<section class="slide light" data-layout="S13" data-animate="progression">
  <div class="canvas-card">
    ${chrome(plan, variant, 6, total)}
    <div style="flex:1;display:grid;grid-template-columns:1fr .9fr;gap:4vw;align-items:start">
      <div>
        ${head(slide.kicker, slide.title, slide.subtitle)}
        <div style="margin-top:4vh">${steps}</div>
      </div>
      <aside data-anim style="height:62vh;border:2px solid var(--ink);display:grid;grid-template-rows:1fr auto;background:linear-gradient(90deg,var(--accent) 0 16%,transparent 16%)">
        <div style="padding:3vh 2vw;display:grid;align-content:end">
          <div class="t-meta">NEXT 90 DAYS</div>
          <div style="font-family:var(--mono);font-size:min(12vw,21vh);line-height:.78;font-weight:800;letter-spacing:-.08em;color:var(--ink)">04</div>
        </div>
        <div class="t-meta" style="border-top:2px solid var(--ink);padding:2vh 2vw">Decision / Dependency / Risk</div>
      </aside>
    </div>
  </div>
</section>`;
}

function renderComparison(plan, variant, total) {
  const slide = plan.slides[6];
  if (slide.blank) return renderSwissBlank();
  const columns = slide.columns.slice(0, 2).map((column, index) => `<div data-anim style="border:${index === 0 ? '2px solid var(--ink)' : '1px solid var(--border-subtle)'};padding:3.4vh 2.3vw;display:grid;grid-template-rows:auto auto 1fr;gap:2vh;background:${index === 0 ? 'var(--grey-1)' : 'transparent'}">
    <div class="t-meta" style="color:${index === 0 ? 'var(--accent)' : 'var(--text-helper)'}">${String(index + 1).padStart(2, '0')} / OPTION</div>
    <div>
      <div class="t-h-prod" style="font-size:max(28px,2.5vw);line-height:1;font-weight:650">${escapeText(column.title)}</div>
      <p class="t-body-sm" style="margin:1.2vh 0 0;color:var(--text-secondary)">${escapeText(column.body)}</p>
    </div>
    <div style="align-self:end;display:grid;gap:1.1vh">${column.points.map((point) => `<div style="border-top:1px solid var(--border-subtle);padding-top:1vh" class="t-body-sm">${escapeText(point)}</div>`).join('')}</div>
  </div>`).join('');

  return `<section class="slide light" data-layout="S16" data-animate="grid-reveal">
  <div class="canvas-card">
    ${chrome(plan, variant, 7, total)}
    <div style="flex:1;display:grid;grid-template-rows:auto 1fr auto;gap:3vh">
      ${head(slide.kicker, slide.title, slide.subtitle)}
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2vw">${columns}</div>
      ${foot('Trade-off Matrix', variant)}
    </div>
  </div>
</section>`;
}

function renderRoadmap(plan, variant, total) {
  const slide = plan.slides[7];
  if (slide.blank) return renderSwissBlank();
  const steps = slide.steps.slice(0, 4).map((step, index) => `<div data-anim="step" style="display:grid;grid-template-columns:auto 1fr;gap:1.6vw;align-items:start">
    <div style="width:4vw;height:4vw;min-width:48px;min-height:48px;display:grid;place-items:center;background:${index === 0 ? 'var(--accent)' : 'var(--grey-1)'};color:${index === 0 ? 'var(--accent-on)' : 'var(--ink)'};font-family:var(--mono);font-weight:800">${String(index + 1).padStart(2, '0')}</div>
    <div style="border-top:2px solid ${index === 0 ? 'var(--accent)' : 'var(--border-subtle)'};padding-top:1.6vh">
      <div class="t-meta" style="color:var(--text-helper)">${escapeText(step.time)}</div>
      <div class="t-h-prod" style="margin-top:.7vh;font-size:max(22px,1.8vw);font-weight:650">${escapeText(step.title)}</div>
      <div class="t-body-sm" style="margin-top:.8vh;color:var(--text-secondary)">${escapeText(step.body)}</div>
    </div>
  </div>`).join('');

  return `<section class="slide dark" data-layout="S18" data-animate="progression">
  <div class="canvas-card">
    ${chrome(plan, variant, 8, total)}
    <div style="flex:1;display:grid;grid-template-rows:auto 1fr auto;gap:3.4vh">
      ${head(slide.kicker, slide.title, slide.subtitle, true)}
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4vh 3vw;align-content:center">${steps}</div>
      ${foot('Roadmap / Next Moves', variant)}
    </div>
  </div>
</section>`;
}

function renderClose(plan, variant, total) {
  const slide = plan.slides[8];
  if (slide.blank) return renderSwissBlank();
  const takeaways = slide.takeaways.map((takeaway, index) => `<div style="display:grid;grid-template-columns:auto 1fr;gap:2vw;align-items:start;padding:2.6vh 0;border-top:1px solid var(--border-subtle);${index === 2 ? 'border-bottom:2px solid var(--accent)' : ''}" data-anim>
    <div class="t-meta" style="color:${index === 2 ? 'var(--accent)' : 'var(--text-helper)'}">${String(index + 1).padStart(2, '0')}</div>
    <div class="t-h-prod" style="font-size:max(19px,1.7vw);font-weight:400;line-height:1.2">${escapeText(takeaway)}</div>
  </div>`).join('');

  return `<section class="slide split" data-layout="SWISS-CLOSING-ASCII" data-animate="split-statement">
  <div class="canvas-card">
    <div class="split-half">
      <div class="half b-accent">
        <canvas class="ascii-bg" aria-hidden="true"></canvas>
        ${chrome(plan, variant, 9, total, true)}
        <div data-anim="manifesto" style="position:relative;z-index:1;margin-top:auto;margin-bottom:auto;display:flex;flex-direction:column;gap:2.2vh">
          <div class="t-meta" style="color:var(--accent-on);opacity:.74">${escapeText(slide.kicker)}</div>
          <h2 style="font-family:var(--sans),var(--sans-zh);font-size:min(6vw,10.4vh);line-height:.96;font-weight:200;color:var(--accent-on)">${lineBreakTitle(slide.title)}</h2>
          <p class="t-body" style="max-width:38ch;color:var(--accent-on);opacity:.82">${escapeText(slide.body)}</p>
        </div>
      </div>
      <div class="half">
        <div style="margin-top:auto;margin-bottom:auto">${takeaways}</div>
      </div>
    </div>
  </div>
</section>`;
}

function renderMagazineCover(plan, variant, total) {
  const slide = plan.slides[0];
  if (slide.blank) return renderMagazineBlank();
  if (variant.coverLayout === 'magazine-frontpage') return renderMagazineFrontpageCover(plan, variant, total);
  if (variant.coverLayout === 'magazine-zine') return renderMagazineZineCover(plan, variant, total);
  return `<section class="slide hero dark" data-animate="hero">
  ${magChrome(plan, variant, 1, total)}
  <div class="frame" style="display:grid;gap:4vh;align-content:center;min-height:80vh">
    <div class="kicker" data-anim>${escapeText(slide.kicker)}</div>
    <h1 class="h-hero" data-anim>${lineBreakTitle(slide.title)}</h1>
    <p class="lead" style="max-width:58vw" data-anim>${escapeText(slide.subtitle)}</p>
    <div class="meta-row" data-anim>
      <span>${escapeText(slide.footer)}</span><span>·</span><span>${escapeText(variant.title)}</span>
    </div>
  </div>
  ${magFoot('Opening Note', variant)}
</section>`;
}

function renderMagazineFrontpageCover(plan, variant, total) {
  const slide = plan.slides[0];
  return `<section class="slide light" data-animate="hero">
  ${magChrome(plan, variant, 1, total)}
  <div class="frame" style="display:grid;grid-template-columns:1.25fr .75fr;gap:5vw;align-items:stretch;min-height:78vh">
    <div style="display:grid;grid-template-rows:auto 1fr auto;gap:3vh;border-right:1px solid rgba(var(--ink-rgb),.22);padding-right:4vw">
      <div class="kicker" data-anim>${escapeText(slide.kicker)}</div>
      <div style="align-self:center;display:grid;gap:3vh">
        <h1 class="h-hero" style="font-size:7.2vw;line-height:.92;color:var(--ink)" data-anim>${lineBreakTitle(slide.title)}</h1>
        <p class="lead" style="max-width:48vw;color:rgba(var(--ink-rgb),.66)" data-anim>${escapeText(slide.subtitle)}</p>
      </div>
      <div class="meta-row" data-anim>
        <span>${escapeText(slide.footer)}</span><span>·</span><span>${escapeText(variant.accentLabel)}</span>
      </div>
    </div>
    <aside data-anim style="display:grid;grid-template-rows:auto 1fr auto;gap:3vh">
      <div style="height:1px;background:var(--ink)"></div>
      <div style="align-self:center;display:grid;gap:2vh">
        <div class="meta">DEMO ISSUE / ${escapeText(variant.code)}</div>
        <div style="font-family:var(--serif);font-size:min(10vw,17vh);font-weight:800;line-height:.82;color:var(--ink)">LIVE<br/>SHOW</div>
        <p class="body-zh" style="color:rgba(var(--ink-rgb),.68)">把一个主题拆成可展示、可感知、可记住的现场节奏。</p>
      </div>
      <div style="border:1px solid rgba(var(--ink-rgb),.24);padding:2.2vh 1.4vw">
        <div class="meta">COVER NOTE</div>
        <div class="h3-zh" style="margin-top:1vh">${escapeText(variant.title)}</div>
      </div>
    </aside>
  </div>
  ${magFoot('Frontpage', variant)}
</section>`;
}

function renderMagazineZineCover(plan, variant, total) {
  const slide = plan.slides[0];
  return `<section class="slide light" data-animate="quote">
  ${magChrome(plan, variant, 1, total)}
  <div class="frame" style="display:grid;grid-template-rows:auto 1fr auto;gap:4vh;min-height:78vh">
    <div data-anim style="display:flex;justify-content:space-between;align-items:center;border-top:2px solid var(--ink);border-bottom:2px solid var(--ink);padding:1.4vh 0">
      <span class="kicker">${escapeText(slide.kicker)}</span>
      <span class="meta">${escapeText(variant.accentLabel)} · FIELD TALK</span>
    </div>
    <div style="align-self:center;display:grid;grid-template-columns:.25fr 1fr;gap:4vw;align-items:center">
      <div data-anim style="writing-mode:vertical-rl;font-family:var(--mono);font-size:max(14px,1.1vw);letter-spacing:.24em;opacity:.58">STORY ARC / ${escapeText(variant.code)} / ${String(total).padStart(2, '0')} PAGES</div>
      <div style="display:grid;gap:3vh">
        <h1 class="h-hero" style="font-size:8.4vw;line-height:.9;color:var(--ink);max-width:9ch" data-anim>${lineBreakTitle(slide.title)}</h1>
        <p class="lead" style="max-width:52vw;color:rgba(var(--ink-rgb),.72);border-left:4px solid var(--ink);padding-left:2vw" data-anim>${escapeText(slide.subtitle)}</p>
      </div>
    </div>
    <div data-anim style="display:grid;grid-template-columns:1fr auto;gap:4vw;align-items:end">
      <p class="body-zh" style="max-width:46vw;color:rgba(var(--ink-rgb),.66)">${escapeText(slide.footer)}</p>
      <div style="border:2px solid var(--ink);padding:1.8vh 1.4vw;font-family:var(--mono);font-weight:700">PRIVATE<br/>SESSION</div>
    </div>
  </div>
  ${magFoot('Zine Cover', variant)}
</section>`;
}

function renderMagazineMetrics(plan, variant, total) {
  const slide = plan.slides[1];
  if (slide.blank) return renderMagazineBlank();
  const stats = slide.stats.slice(0, 3).map((item) => `<div class="stat" data-anim>
    <div class="m">${escapeText(item.label)}</div>
    <div class="n">${escapeText(item.value)}${item.unit ? `<span style="font-size:.24em;margin-left:.16em">${escapeText(item.unit)}</span>` : ''}</div>
    <div class="l">${escapeText(item.note)}</div>
  </div>`).join('');
  return `<section class="slide light">
  ${magChrome(plan, variant, 2, total)}
  <div class="frame" style="gap:5vh">
    <div data-anim>
      <div class="kicker">${escapeText(slide.kicker)}</div>
      <h2 class="h1-zh">${escapeText(slide.title)}</h2>
      <p class="body-zh" style="max-width:56vw;margin-top:2vh">${escapeText(slide.subtitle)}</p>
    </div>
    <div class="grid-3">${stats}</div>
  </div>
  ${magFoot('Signal / Compression', variant)}
</section>`;
}

function renderMagazineArgument(plan, variant, total) {
  const slide = plan.slides[2];
  if (slide.blank) return renderMagazineBlank();
  if (variant.coverLayout === 'magazine-zine') return renderMagazineZineArgument(plan, variant, total);
  const points = slide.points.map((point, index) => `<div class="rowline" data-anim>
    <div class="meta">0${index + 1}</div>
    <div class="h3-zh">${escapeText(point)}</div>
    <div class="meta">${escapeText(variant.code)} / ${String(index + 1).padStart(2, '0')}</div>
  </div>`).join('');
  return `<section class="slide dark">
  ${magChrome(plan, variant, 3, total)}
  <div class="frame" style="gap:5vh">
    <div data-anim>
      <div class="kicker">${escapeText(slide.kicker)}</div>
      <h2 class="h1-zh" style="max-width:70vw">${lineBreakTitle(slide.title)}</h2>
      <p class="lead" style="max-width:58vw;margin-top:3vh">${escapeText(slide.body)}</p>
    </div>
    <div style="margin-top:auto">${points}</div>
  </div>
  ${magFoot('Core Argument', variant)}
</section>`;
}

function renderMagazineZineArgument(plan, variant, total) {
  const slide = plan.slides[2];
  const points = slide.points.map((point, index) => `<div data-anim style="border-top:1px solid rgba(var(--ink-rgb),.28);padding:2.2vh 0;display:grid;grid-template-columns:auto 1fr;gap:2vw">
    <div class="meta">0${index + 1}</div>
    <div class="h3-zh">${escapeText(point)}</div>
  </div>`).join('');
  return `<section class="slide light">
  ${magChrome(plan, variant, 3, total)}
  <div class="frame" style="display:grid;grid-template-columns:.95fr 1.05fr;gap:5vw;align-items:center">
    <div data-anim style="border:2px solid var(--ink);padding:4vh 3vw">
      <div class="kicker">${escapeText(slide.kicker)}</div>
      <h2 class="h-hero" style="font-size:5.8vw;line-height:.95;margin-top:3vh;color:var(--ink)">${lineBreakTitle(slide.title)}</h2>
      <p class="body-zh" style="margin-top:3vh;color:rgba(var(--ink-rgb),.7)">${escapeText(slide.body)}</p>
    </div>
    <div>${points}</div>
  </div>
  ${magFoot('Story Spine', variant)}
</section>`;
}

function renderMagazineChart(plan, variant, total) {
  const slide = plan.slides[3];
  if (slide.blank) return renderMagazineBlank();
  const items = slide.chart.items.slice(0, 5);
  const rows = items.map((item, index) => `<div data-anim style="display:grid;grid-template-columns:minmax(8vw,12vw) 1fr minmax(5vw,7vw);gap:1.4vw;align-items:center;border-top:1px solid rgba(var(--ink-rgb),.24);padding:1.8vh 0">
    <div>
      <div class="meta">0${index + 1}</div>
      <div class="body-zh" style="margin-top:.5vh;color:rgba(var(--ink-rgb),.72)">${escapeText(item.label)}</div>
    </div>
    <div style="height:3.4vh;background:rgba(var(--ink-rgb),.1);position:relative">
      <div style="position:absolute;inset:0 auto 0 0;width:${chartWidth(item.score)}%;background:var(--ink)"></div>
    </div>
    <div style="text-align:right">
      <div style="font-family:var(--mono);font-size:max(24px,2.3vw);font-weight:800;letter-spacing:-.04em">${escapeText(item.value)}</div>
      <div class="meta">${escapeText(item.unit)}</div>
    </div>
  </div>`).join('');

  return `<section class="slide light" data-animate="grid-reveal">
  ${magChrome(plan, variant, 4, total)}
  <div class="frame" style="display:grid;grid-template-columns:.86fr 1.14fr;gap:5vw;align-items:center">
    <div data-anim style="display:grid;gap:2.6vh">
      <div class="kicker">${escapeText(slide.kicker)}</div>
      <h2 class="h1-zh">${lineBreakTitle(slide.title)}</h2>
      <p class="body-zh" style="color:rgba(var(--ink-rgb),.7)">${escapeText(slide.subtitle)}</p>
      <div style="border:2px solid var(--ink);padding:2.2vh 1.6vw">
        <div class="meta">RELATIVE INDEX</div>
        <p class="body-zh" style="margin-top:1vh;color:rgba(var(--ink-rgb),.68)">${escapeText(slide.chart.note)}</p>
      </div>
    </div>
    <div>${rows}</div>
  </div>
  ${magFoot('Relative Chart', variant)}
</section>`;
}

function renderMagazineGrid(plan, variant, total) {
  const slide = plan.slides[4];
  if (slide.blank) return renderMagazineBlank();
  if (variant.coverLayout === 'magazine-zine') return renderMagazineZineGrid(plan, variant, total);
  const cards = slide.cards.slice(0, 4).map((card) => `<div class="plat" data-anim>
    <div class="meta">${escapeText(card.eyebrow)}</div>
    <h3 class="h3-zh" style="margin-top:2vh">${escapeText(card.title)}</h3>
    <p class="body-zh" style="margin-top:1.4vh">${escapeText(card.body)}</p>
  </div>`).join('');
  return `<section class="slide light">
  ${magChrome(plan, variant, 5, total)}
  <div class="frame" style="gap:5vh">
    <div data-anim>
      <div class="kicker">${escapeText(slide.kicker)}</div>
      <h2 class="h1-zh">${escapeText(slide.title)}</h2>
    </div>
    <div class="grid-4">${cards}</div>
  </div>
  ${magFoot('Four Directions', variant)}
</section>`;
}

function renderMagazineZineGrid(plan, variant, total) {
  const slide = plan.slides[4];
  const cards = slide.cards.slice(0, 4).map((card, index) => `<div data-anim style="padding:2.8vh 2vw;border:${index === 0 ? '2px' : '1px'} solid var(--ink);background:${index === 0 ? 'var(--ink)' : 'transparent'};color:${index === 0 ? 'var(--paper)' : 'var(--ink)'}">
    <div class="meta" style="color:inherit;opacity:.72">${escapeText(card.eyebrow)}</div>
    <h3 class="h3-zh" style="margin-top:2vh">${escapeText(card.title)}</h3>
    <p class="body-zh" style="margin-top:1.4vh;color:inherit;opacity:.72">${escapeText(card.body)}</p>
  </div>`).join('');
  return `<section class="slide light">
  ${magChrome(plan, variant, 5, total)}
  <div class="frame" style="gap:4vh">
    <div data-anim style="display:flex;justify-content:space-between;gap:4vw;align-items:end;border-bottom:2px solid var(--ink);padding-bottom:2vh">
      <div>
        <div class="kicker">${escapeText(slide.kicker)}</div>
        <h2 class="h1-zh">${escapeText(slide.title)}</h2>
      </div>
      <div class="meta">FOUR SCENES / NOT FOUR BULLETS</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2vh 1.4vw">${cards}</div>
  </div>
  ${magFoot('Narrative Board', variant)}
</section>`;
}

function renderMagazineProcess(plan, variant, total) {
  const slide = plan.slides[5];
  if (slide.blank) return renderMagazineBlank();
  const steps = slide.steps.slice(0, 4).map((step, index) => `<div class="step" data-anim="step">
    <div class="step-nb">0${index + 1}</div>
    <div class="step-title">${escapeText(step.title)}</div>
    <div class="step-desc">${escapeText(step.body)}</div>
  </div>`).join('');
  return `<section class="slide light" data-animate="pipeline">
  ${magChrome(plan, variant, 6, total)}
  <div class="frame" style="gap:5vh">
    <div data-anim>
      <div class="kicker">${escapeText(slide.kicker)}</div>
      <h2 class="h1-zh">${escapeText(slide.title)}</h2>
      <p class="body-zh" style="max-width:58vw;margin-top:2vh">${escapeText(slide.subtitle)}</p>
    </div>
    <div class="pipeline-section">
      <div class="pipeline-label">PROCESS / SEQUENCE</div>
      <div class="pipeline" data-cols="4">${steps}</div>
    </div>
  </div>
  ${magFoot('Workflow', variant)}
</section>`;
}

function renderMagazineComparison(plan, variant, total) {
  const slide = plan.slides[6];
  if (slide.blank) return renderMagazineBlank();
  const columns = slide.columns.slice(0, 2).map((column, index) => `<div data-anim style="border:${index === 0 ? '2px' : '1px'} solid var(--ink);padding:3.2vh 2vw;min-height:50vh;display:grid;grid-template-rows:auto auto 1fr;gap:2.2vh;background:${index === 0 ? 'var(--ink)' : 'transparent'};color:${index === 0 ? 'var(--paper)' : 'var(--ink)'}">
    <div class="meta" style="color:inherit;opacity:.7">OPTION 0${index + 1}</div>
    <div>
      <h3 class="h3-zh">${escapeText(column.title)}</h3>
      <p class="body-zh" style="margin-top:1.4vh;color:inherit;opacity:.72">${escapeText(column.body)}</p>
    </div>
    <div style="align-self:end">${column.points.map((point) => `<div class="rowline" style="grid-template-columns:auto 1fr;border-top-color:currentColor;color:inherit"><div class="meta" style="color:inherit;opacity:.58">•</div><div class="body-zh" style="color:inherit">${escapeText(point)}</div></div>`).join('')}</div>
  </div>`).join('');

  return `<section class="slide light">
  ${magChrome(plan, variant, 7, total)}
  <div class="frame" style="gap:4vh">
    <div data-anim>
      <div class="kicker">${escapeText(slide.kicker)}</div>
      <h2 class="h1-zh">${escapeText(slide.title)}</h2>
      <p class="body-zh" style="max-width:58vw;margin-top:2vh;color:rgba(var(--ink-rgb),.68)">${escapeText(slide.subtitle)}</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2vw">${columns}</div>
  </div>
  ${magFoot('Trade-off', variant)}
</section>`;
}

function renderMagazineRoadmap(plan, variant, total) {
  const slide = plan.slides[7];
  if (slide.blank) return renderMagazineBlank();
  const steps = slide.steps.slice(0, 4).map((step, index) => `<div data-anim="step" style="border-top:${index === 0 ? '3px' : '1px'} solid var(--ink);padding-top:2vh;display:grid;gap:1.1vh">
    <div class="meta">${escapeText(step.time)} / 0${index + 1}</div>
    <div class="h3-zh">${escapeText(step.title)}</div>
    <p class="body-zh" style="color:rgba(var(--ink-rgb),.68)">${escapeText(step.body)}</p>
  </div>`).join('');

  return `<section class="slide light" data-animate="pipeline">
  ${magChrome(plan, variant, 8, total)}
  <div class="frame" style="display:grid;grid-template-rows:auto 1fr;gap:5vh">
    <div data-anim style="display:grid;grid-template-columns:1fr auto;gap:4vw;align-items:end;border-bottom:2px solid var(--ink);padding-bottom:2vh">
      <div>
        <div class="kicker">${escapeText(slide.kicker)}</div>
        <h2 class="h1-zh">${escapeText(slide.title)}</h2>
        <p class="body-zh" style="max-width:58vw;margin-top:1.8vh;color:rgba(var(--ink-rgb),.68)">${escapeText(slide.subtitle)}</p>
      </div>
      <div style="font-family:var(--mono);font-size:min(8vw,14vh);line-height:.8;font-weight:800;letter-spacing:-.08em">NEXT</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:2vw;align-items:start">${steps}</div>
  </div>
  ${magFoot('Roadmap', variant)}
</section>`;
}

function renderMagazineClose(plan, variant, total) {
  const slide = plan.slides[8];
  if (slide.blank) return renderMagazineBlank();
  const takeaways = slide.takeaways.map((item, index) => `<div class="rowline" data-anim>
    <div class="meta">0${index + 1}</div>
    <div class="h3-zh">${escapeText(item)}</div>
    <div class="meta">TAKEAWAY</div>
  </div>`).join('');
  return `<section class="slide hero dark" data-animate="quote">
  ${magChrome(plan, variant, 9, total)}
  <div class="frame" style="gap:5vh;justify-content:center">
    <div data-anim>
      <div class="kicker">${escapeText(slide.kicker)}</div>
      <h2 class="h-hero" style="font-size:8vw">${lineBreakTitle(slide.title)}</h2>
      <p class="lead" style="max-width:62vw;margin-top:3vh">${escapeText(slide.body)}</p>
    </div>
    <div>${takeaways}</div>
  </div>
  ${magFoot('Closing', variant)}
</section>`;
}

function chrome(plan, variant, page, total, inverse = false) {
  const style = inverse ? ' style="color:rgba(255,255,255,.62)"' : '';
  return `<div class="chrome-min"${style}>
    <div class="l">${escapeText(plan.title)} · ${escapeText(variant.title)}</div>
    <div class="r">${escapeText(variant.code)} · ${String(page).padStart(2, '0')} / ${String(total).padStart(2, '0')}</div>
  </div>`;
}

function magChrome(plan, variant, page, total) {
  return `<div class="chrome">
    <div class="left"><span>${escapeText(plan.title)}</span><span class="sep"></span><span>${escapeText(variant.title)}</span></div>
    <div class="right"><span>${escapeText(variant.code)} · ${String(page).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span></div>
  </div>`;
}

function magFoot(label, variant) {
  return `<div class="foot">
    <div class="title">${escapeText(label)}</div>
    <div>${escapeText(variant.visualSystem)} · ${escapeText(variant.accentLabel)}</div>
  </div>`;
}

function head(kicker, title, subtitle = '', inverse = false) {
  const color = inverse ? 'color:rgba(255,255,255,.68)' : '';
  const titleColor = inverse ? 'color:var(--paper)' : 'color:var(--text-primary)';
  const body = subtitle ? `<p class="t-body" style="max-width:58ch;margin:0;${inverse ? 'color:rgba(255,255,255,.74)' : 'color:var(--text-secondary)'}">${escapeText(subtitle)}</p>` : '';
  return `<div data-anim="head" style="display:flex;flex-direction:column;gap:1.4vh">
    <div class="t-meta" style="${color}">${escapeText(kicker)}</div>
    <h2 class="h-xl-zh" style="${titleColor}">${escapeText(title)}</h2>
    ${body}
  </div>`;
}

function foot(label, variant) {
  return `<div class="t-meta" style="display:flex;justify-content:space-between;border-top:1px solid var(--border-subtle);padding-top:1.6vh;color:var(--text-helper)">
    <span>${escapeText(label)}</span>
    <span>${escapeText(variant.subtitle)}</span>
  </div>`;
}

function injectDeck(html, slidesHtml) {
  const open = '<div id="deck">';
  const nav = '<div id="nav"></div>';
  const start = html.indexOf(open);
  const end = html.indexOf(nav, start);
  if (start === -1 || end === -1) {
    throw new Error('Guizang template deck container was not found.');
  }
  return `${html.slice(0, start + open.length)}\n${slidesHtml}\n</div>\n\n${html.slice(end)}`;
}

function injectTheme(html, themeName) {
  const theme = themeVars[themeName] || themeVars.ikb;
  const css = Object.entries(theme).map(([key, value]) => `${key}:${value};`).join('');
  return html.replace('</head>', `<style>:root{${css}}</style>\n</head>`);
}

function injectMagazineTheme(html, themeName) {
  const theme = magazineThemeVars[themeName] || magazineThemeVars.monocle;
  const css = Object.entries(theme).map(([key, value]) => `${key}:${value};`).join('');
  return html.replace('</head>', `<style>:root{${css}}</style>\n</head>`);
}

function provenanceComment() {
  return '<!-- Generated locally with the Guizang PPT Skill template. Source: https://github.com/op7418/guizang-ppt-skill -->';
}

function normalizeStats(stats) {
  const fallback = [
    { label: '并行版本', value: '4', unit: '份', note: '同一主题同时分化' },
    { label: '选择成本', value: '低', unit: '', note: '先生成，再挑选' },
    { label: '交付形态', value: 'HTML', unit: '', note: '浏览器直接演示' },
  ];
  return normalizeItems(stats, fallback, (item, backup) => ({
    label: text(item.label, backup.label),
    value: text(item.value, backup.value),
    unit: text(item.unit, backup.unit),
    note: text(item.note, backup.note),
  }), 3);
}

function normalizeChart(chart) {
  const source = chart && typeof chart === 'object' ? chart : {};
  const fallback = [
    { label: '清晰度', score: 5, value: '5', unit: '/5', note: '最先建立共识' },
    { label: '差异化', score: 4, value: '4', unit: '/5', note: '决定版本选择' },
    { label: '记忆点', score: 4, value: '4', unit: '/5', note: '影响传播效率' },
    { label: '可执行', score: 3, value: '3', unit: '/5', note: '落到下一步动作' },
    { label: '风险感', score: 3, value: '3', unit: '/5', note: '避免过度承诺' },
  ];
  return {
    unit: text(source.unit, '/5'),
    note: text(source.note, '相对评分仅用于表达本页判断，不代表外部真实统计。'),
    items: normalizeItems(source.items || source.rows, fallback, (item, backup) => {
      const score = normalizedScore(item.score ?? item.value, backup.score);
      return {
        label: text(item.label, backup.label),
        score,
        value: text(item.value, String(score)),
        unit: text(item.unit, source.unit || backup.unit),
        note: text(item.note, backup.note),
      };
    }, 5),
  };
}

function normalizeCards(cards) {
  const fallback = [
    { eyebrow: '01 / BOARDROOM', title: '商务判断', body: '压缩成管理层能快速判断的结构。' },
    { eyebrow: '02 / STAGE', title: '展示记忆点', body: '把概念变成观众能带走的一句话。' },
    { eyebrow: '03 / REPORT', title: '汇报路径', body: '进展、阻塞、下一步清楚摆开。' },
    { eyebrow: '04 / TALK', title: '叙事弧线', body: '用反差、转折和收束建立节奏。' },
  ];
  return normalizeItems(cards, fallback, (item, backup) => ({
    eyebrow: text(item.eyebrow, backup.eyebrow),
    title: text(item.title, backup.title),
    body: text(item.body, backup.body),
  }), 4);
}

function normalizeColumns(columns) {
  const fallback = [
    {
      title: '先做聚焦版',
      body: '把最重要的受众和判断先打穿，减少表达噪音。',
      points: ['更快形成结论', '更适合决策场景', '对取舍要求更高'],
    },
    {
      title: '保留探索版',
      body: '把更多可能性同时放出来，用比较换取更稳的选择。',
      points: ['更容易发现新角度', '适合早期讨论', '需要后续收敛'],
    },
  ];
  return normalizeItems(columns, fallback, (item, backup) => ({
    title: text(item.title, backup.title),
    body: text(item.body, backup.body),
    points: normalizeList(item.points, backup.points, 3),
  }), 2);
}

function normalizeSteps(steps) {
  const fallback = [
    { title: '输入想法', body: '一句话描述主题、受众或场景。' },
    { title: '并行拆解', body: '四个方向同时规划叙事结构。' },
    { title: '套入模板', body: '内容进入歸藏 HTML PPT 版式。' },
    { title: '预览选择', body: '打开四份结果，保留最喜欢的一份。' },
  ];
  return normalizeItems(steps, fallback, (item, backup) => ({
    title: text(item.title, backup.title),
    body: text(item.body, backup.body),
  }), 4);
}

function normalizeRoadmap(steps) {
  const fallback = [
    { time: 'NOW', title: '先确定判断', body: '把主题压成一个清楚的问题。' },
    { time: 'NEXT', title: '再比较版本', body: '让四种角度同时暴露优缺点。' },
    { time: 'SOON', title: '补足证据', body: '把最强版本加上数据、案例和限制条件。' },
    { time: 'FINAL', title: '交付演讲', body: '保留节奏、视觉和最后一句记忆点。' },
  ];
  return normalizeItems(steps, fallback, (item, backup) => ({
    time: text(item.time, backup.time),
    title: text(item.title, backup.title),
    body: text(item.body, backup.body),
  }), 4);
}

function normalizeItems(items, fallback, mapper, count) {
  const source = Array.isArray(items) ? items : [];
  return Array.from({ length: count }, (_, index) => mapper(source[index] || {}, fallback[index]));
}

function normalizeList(items, fallback, count) {
  const source = Array.isArray(items) ? items : [];
  return Array.from({ length: count }, (_, index) => text(source[index], fallback[index]));
}

function argumentNote(index, variant) {
  const notes = [
    `这一版保持${variant.tone}。`,
    '同一个输入被拆成不同的表达路径。',
    '比较发生在四份成稿之间，而不是在空白页前犹豫。',
  ];
  return notes[index] || notes[0];
}

function normalizedScore(value, fallback = 3) {
  const number = typeof value === 'number'
    ? value
    : Number(String(value ?? '').match(/-?\d+(?:\.\d+)?/)?.[0]);
  if (!Number.isFinite(number)) return fallback;
  if (number <= 5) return Math.max(1, Math.min(5, Math.round(number)));
  if (number <= 10) return Math.max(1, Math.min(5, Math.round(number / 2)));
  return Math.max(1, Math.min(5, Math.round(number / 20)));
}

function chartWidth(score) {
  return Math.max(16, Math.min(100, (Number(score) || 1) * 20));
}

function lineBreakTitle(value) {
  const clean = text(value, '');
  if (clean.includes('\n')) {
    return clean.split(/\n+/).slice(0, 3).map(escapeText).join('<br/>');
  }
  if (clean.length <= 11) return escapeText(clean);
  const pivot = Math.min(Math.max(6, Math.ceil(clean.length / 2)), 12);
  return `${escapeText(clean.slice(0, pivot))}<br/>${escapeText(clean.slice(pivot))}`;
}

function text(value, fallback) {
  if (typeof value === 'number') return String(value);
  if (typeof value !== 'string') return fallback;
  const clean = value.replace(/\s+/g, ' ').trim();
  return clean || fallback;
}

function escapeText(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
