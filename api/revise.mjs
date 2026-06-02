import { renderDeck, variants } from '../lib/deckRenderer.mjs';
import { reviseDeckSlide } from '../lib/llm.mjs';
import { redactSecrets, runtimeModelConfig } from '../lib/config.mjs';

export const config = {
  maxDuration: 180,
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const payload = request.body || {};
  const variant = variants.find((candidate) => candidate.id === payload.variantId);
  if (!variant) {
    response.status(400).json({ error: '没有找到要修改的 PPT 版本。' });
    return;
  }

  const settings = payload.settings || {};
  try {
    runtimeModelConfig(settings);
  } catch (error) {
    response.status(400).json({ error: redactSecrets(error.message || error, settings) });
    return;
  }

  try {
    const plan = await reviseDeckSlide({
      idea: String(payload.idea || '').trim(),
      variant,
      plan: payload.plan,
      pageNumber: payload.pageNumber,
      instruction: payload.instruction,
      settings,
    });
    response.status(200).json({
      id: variant.id,
      status: 'done',
      message: `第 ${Number(payload.pageNumber)} 页已修改`,
      generatedSlides: plan.slides.length,
      slideCount: plan.slides.length,
      currentSlide: Number(payload.pageNumber),
      version: Date.now(),
      plan,
      html: renderDeck(plan, variant),
    });
  } catch (error) {
    response.status(500).json({ error: redactSecrets(error.message || error, settings) });
  }
}
