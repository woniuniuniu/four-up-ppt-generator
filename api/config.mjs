import { publicModelConfig } from '../lib/config.mjs';
import { DECK_SLIDE_COUNT, variants } from '../lib/deckRenderer.mjs';

export default function handler(_request, response) {
  response.status(200).json({
    model: publicModelConfig(),
    slideCount: DECK_SLIDE_COUNT,
    variants: variants.map(({ id, code, title, subtitle, visualSystem, accentLabel }) => ({
      id,
      code,
      title,
      subtitle,
      visualSystem,
      accentLabel,
    })),
  });
}
