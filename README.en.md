# Four-up PPT Generator

Language: [简体中文](README.md) | English

Four-up PPT Generator is a Chinese-first HTML presentation generator. Give it one topic, and it generates four differentiated decks in parallel, each with its own content angle, visual system, and live page-by-page preview.

Live demo:

- https://4ppt.vercel.app/
- https://guizang-four-up-generator.vercel.app/

## Preview

<table>
  <tr>
    <td width="50%">
      <img src="docs/images/four-up-ppt-light-theme.png" alt="Four-up PPT Generator light theme preview" />
    </td>
    <td width="50%">
      <img src="docs/images/four-up-ppt-dark-theme.png" alt="Four-up PPT Generator dark theme preview" />
    </td>
  </tr>
  <tr>
    <td align="center">Light theme</td>
    <td align="center">Dark theme</td>
  </tr>
</table>

Source:

- https://github.com/woniuniuniu/four-up-ppt-generator

## Acknowledgements

This project is built on top of [op7418/guizang-ppt-skill](https://github.com/op7418/guizang-ppt-skill), an open-source PPT Skill by op7418 / 歸藏. The upstream project provides the core Agent Skill concept, HTML deck templates, visual systems, layout references, theme guidance, and quality checklist that made this project possible.

Please read and support the upstream project first:

- Upstream repository: <https://github.com/op7418/guizang-ppt-skill>
- Author: op7418 / 歸藏
- Upstream license: AGPL-3.0

This repository keeps the upstream link, license notice, and a snapshot of the upstream main branch under `vendor/guizang-ppt-skill/` for attribution, traceability, and license compliance. This is an independent derivative project, not an official release of the upstream project. If any attribution, wording, or compliance detail can be improved, corrections are welcome and will be prioritized.

## Features

- Four parallel generations: A/B/C/D decks are generated through independent model requests instead of one shared outline with four skins.
- Live page-by-page preview: each slide appears as soon as the model stream produces it.
- Differentiated narratives: executive strategy, product launch, internal briefing, and storytelling presentation directions.
- HTML decks: scripts, animation, WebGL, and deck interactions are preserved.
- Light and dark UI themes.
- Dual key strategy: hosted demos can use a server-side environment variable; self-hosted/open-source use can ask users to enter their own model configuration.

## Model Configuration

The default target model is Step 3.7 Flash, called through an OpenAI-compatible `chat/completions` interface. The project is mainly adapted for StepFun; other compatible providers may work, but are best-effort.

Two usage modes are supported:

- Hosted demo: the deployer can configure an API key in Vercel environment variables so visitors can try the product directly.
- Self-hosted/open-source mode: the repository contains no real API key. If no server-side key is configured, the page asks users to enter a model name, Base URL, and API key.

User-entered API keys are forwarded only for the current generation request. They are not written to files, databases, or this repository. Do not commit `.env`, `.vercel`, account credentials, or real API keys.

## Development and Self-hosting

Requirements:

- Node.js 18+
- A compatible model API key

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Default local URL:

```text
http://localhost:5177/
```

Optional environment variables:

| Variable | Description |
| --- | --- |
| `STEPFUN_PROVIDER` | Provider name, defaults to `StepFun` |
| `STEPFUN_MODEL` | Model name, defaults to `step-3.7-flash` |
| `STEPFUN_BASE_URL` | Model server URL, defaults to `https://api.stepfun.com/v1` |
| `STEPFUN_API_KEY` | Server-side API key for hosted demos; do not commit it |
| `STEPFUN_REASONING_EFFORT` | Reasoning effort, defaults to `medium` |
| `PORT` | Local port, defaults to `5177` |

When deploying to Vercel, non-secret defaults are optional. Configure `STEPFUN_API_KEY` only if you want a hosted demo that visitors can use directly.

## Project Structure

```text
api/                         Vercel serverless API
lib/                         generation, rendering, model calls, and streaming sync
public/                      frontend page, styles, and preview interaction
vendor/guizang-ppt-skill/        snapshot of the upstream main branch
NOTICE.md                    attribution and source notice
LICENSE                      AGPL-3.0 license
```

## License

This project is released under AGPL-3.0-only. Because it is based on an AGPL-3.0 upstream project, public deployments and redistributions should preserve upstream attribution, the upstream repository link, license notices, and access to the corresponding source code.

This project is provided as-is, without warranty. Users are responsible for model usage costs, deployment security, and API key management.
