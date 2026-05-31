import { streamDeckPlan } from './llm.mjs';
import { createEmptyPlan, DECK_SLIDE_COUNT, renderDeck, variants } from './deckRenderer.mjs';
import { redactSecrets } from './config.mjs';

const STREAM_RECONNECTS = 2;

export function createStreamJob(id, idea) {
  const now = new Date().toISOString();
  return {
    id,
    idea,
    status: 'running',
    createdAt: now,
    updatedAt: now,
    variants: Object.fromEntries(
      variants.map((variant) => [
        variant.id,
        {
          id: variant.id,
          code: variant.code,
          title: variant.title,
          subtitle: variant.subtitle,
          status: 'queued',
          progress: 0,
          generatedSlides: 0,
          slideCount: DECK_SLIDE_COUNT,
          version: 0,
          message: '等待生成',
        },
      ]),
    ),
  };
}

export function snapshotJob(job, htmlVariantId = '') {
  return {
    ...job,
    variants: Object.fromEntries(
      Object.entries(job.variants).map(([id, item]) => {
        const copy = { ...item };
        if (id !== htmlVariantId) delete copy.html;
        return [id, copy];
      }),
    ),
  };
}

export async function runStreamJob(job, settings, onUpdate = async () => {}) {
  await onUpdate(job);
  await Promise.all(variants.map((variant) => runStreamVariant(job, variant, settings, onUpdate)));

  const failedFirstPass = variants.filter((variant) => job.variants[variant.id].status === 'error');
  for (const variant of failedFirstPass) {
    await runStreamVariant(job, variant, settings, onUpdate, true);
  }

  const failed = Object.values(job.variants).filter((item) => item.status === 'error').length;
  job.status = failed ? 'error' : 'done';
  job.updatedAt = new Date().toISOString();
  await onUpdate(job);
}

async function runStreamVariant(job, variant, settings, onUpdate, isRetry = false) {
  const item = job.variants[variant.id];
  const started = Date.now();
  const plan = createEmptyPlan(job.idea, variant);
  const diversitySeed = `${job.id.slice(0, 8)}-${variant.code}-${Date.now().toString(36)}`;

  const update = async (changes = {}, includeHtml = false) => {
    Object.assign(item, changes);
    job.updatedAt = new Date().toISOString();
    await onUpdate(job, includeHtml ? variant.id : '');
  };

  try {
    await update({
      status: 'running',
      progress: 2,
      generatedSlides: 0,
      slideCount: plan.slides.length,
      version: Date.now(),
      message: isRetry ? '正在重连模型流并同步预览' : '模型流输出中，收到内容即同步预览',
      startedAt: new Date().toISOString(),
      error: undefined,
    });

    let lastStreamError;
    for (let reconnect = 0; reconnect < STREAM_RECONNECTS; reconnect += 1) {
      try {
        await streamDeckPlan({
          idea: job.idea,
          variant,
          settings,
          diversitySeed: `${diversitySeed}-stream-${reconnect + 1}`,
          onSlide: (result) => publishSlide({
            plan,
            variant,
            update,
            result,
          }),
        });
      } catch (error) {
        lastStreamError = error;
      }

      if (countGeneratedSlides(plan) >= plan.slides.length) break;
      if (reconnect < STREAM_RECONNECTS - 1) {
        await update({
          progress: Math.max(item.progress || 0, progressForSlide(countGeneratedSlides(plan), plan.slides.length)),
          message: '模型流中断，正在重连并继续展示已收到内容',
          error: undefined,
        });
      }
    }

    const generatedSlides = plan.slides.filter((candidate) => !candidate.blank).length;
    if (generatedSlides < plan.slides.length) {
      throw lastStreamError || new Error(`模型流只输出了 ${generatedSlides}/${plan.slides.length} 页。`);
    }

    await update({
      status: 'done',
      progress: 100,
      message: '生成完成',
      html: renderDeck(plan, variant),
      generatedSlides: plan.slides.length,
      slideCount: plan.slides.length,
      version: Date.now(),
      durationMs: Date.now() - started,
      completedAt: new Date().toISOString(),
    }, true);
  } catch (error) {
    await update({
      status: 'error',
      progress: 100,
      message: '生成失败',
      error: redactSecrets(error.message || error, settings),
      completedAt: new Date().toISOString(),
    });
  }
}

async function publishSlide({ plan, variant, update, result }) {
  const index = normalizeSlideIndex(result.index, plan.slides.length);
  if (result.deckTitle) plan.title = result.deckTitle;
  if (result.deckSubtitle) plan.subtitle = result.deckSubtitle;
  plan.slides[index] = result.slide;

  const generatedSlides = countGeneratedSlides(plan);
  await update({
    status: 'running',
    progress: progressForSlide(generatedSlides, plan.slides.length),
    generatedSlides,
    slideCount: plan.slides.length,
    deckTitle: plan.title,
    html: renderDeck(plan, variant),
    message: `第 ${index + 1} 页已同步到预览`,
    currentSlide: index + 1,
    version: Date.now(),
    error: undefined,
  }, true);
}

function countGeneratedSlides(plan) {
  return plan.slides.filter((candidate) => candidate && !candidate.blank).length;
}

function progressForSlide(generatedSlides, slideCount) {
  if (!slideCount) return 4;
  return Math.min(96, Math.max(4, Math.round((generatedSlides / slideCount) * 92)));
}

function normalizeSlideIndex(index, slideCount) {
  const number = Number(index);
  if (Number.isInteger(number) && number >= 0 && number < slideCount) return number;
  return Math.min(slideCount - 1, Math.max(0, number || 0));
}
