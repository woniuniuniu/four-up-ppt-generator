import { publicModelConfig } from '../lib/config.mjs';
import { variants } from '../lib/deckRenderer.mjs';

export default function handler(_request, response) {
  response.status(200).json({
    model: publicModelConfig(),
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
