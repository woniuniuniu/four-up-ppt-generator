import { renderDeck, variants } from '../lib/deckRenderer.mjs';
import { reviseDeckPlan } from '../lib/llm.mjs';
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
    const plan = await reviseDeckPlan({
      idea: String(payload.idea || '').trim(),
      variant,
      plan: payload.plan,
      instruction: payload.instruction,
      settings,
    });
    response.status(200).json({
      id: variant.id,
      status: 'done',
      message: '修改完成',
      generatedSlides: plan.slides.length,
      slideCount: plan.slides.length,
      currentSlide: 1,
      version: Date.now(),
      plan,
      html: renderDeck(plan, variant),
    });
  } catch (error) {
    response.status(500).json({ error: redactSecrets(error.message || error, settings) });
  }
}
