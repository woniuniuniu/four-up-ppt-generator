import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const rootDir = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
export const generatedDir = path.join(rootDir, 'generated');
export const publicDir = path.join(rootDir, 'public');
export const upstreamDir = path.join(rootDir, 'upstream-guizang-ppt-skill');

function readDotEnv() {
  const file = path.join(rootDir, '.env');
  if (!existsSync(file)) return {};

  return Object.fromEntries(
    readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .flatMap((line) => {
        const index = line.indexOf('=');
        if (index === -1) {
          if (isIgnoredSecretEnvKey(line)) return [];
          return [[line, '']];
        }
        const key = line.slice(0, index).trim();
        if (isIgnoredSecretEnvKey(key)) return [];
        const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
        return [[key, value]];
      }),
  );
}

const env = { ...readDotEnv(), ...process.env };

export function defaultModelConfig() {
  return {
    provider: env.STEPFUN_PROVIDER || 'StepFun',
    model: env.STEPFUN_MODEL || 'step-3.7-flash',
    baseUrl: env.STEPFUN_BASE_URL || 'https://api.stepfun.com/v1',
    apiKey: env.STEPFUN_API_KEY || '',
    reasoningEffort: env.STEPFUN_REASONING_EFFORT || 'medium',
  };
}

export function runtimeModelConfig(overrides = {}) {
  const defaults = defaultModelConfig();
  const clientApiKey = clean(overrides.apiKey);
  const usingClientConfig = Boolean(clientApiKey);
  const config = {
    provider: usingClientConfig ? clean(overrides.provider) || defaults.provider : defaults.provider,
    model: usingClientConfig ? clean(overrides.model) || defaults.model : defaults.model,
    baseUrl: normalizeBaseUrl(usingClientConfig ? clean(overrides.baseUrl) || defaults.baseUrl : defaults.baseUrl),
    apiKey: clientApiKey || defaults.apiKey,
    reasoningEffort: usingClientConfig ? clean(overrides.reasoningEffort) || defaults.reasoningEffort : defaults.reasoningEffort,
  };

  if (!config.apiKey) {
    throw new Error('请填写你自己的模型 API key。');
  }
  if (!config.model) {
    throw new Error('请填写模型名称。');
  }

  return config;
}

export function publicModelConfig() {
  const config = defaultModelConfig();
  return {
    provider: config.provider,
    model: config.model,
    baseUrl: config.baseUrl,
    reasoningEffort: config.reasoningEffort,
    apiKeyConfigured: Boolean(config.apiKey),
  };
}

export function serverPort() {
  return Number(env.PORT || 5177);
}

export function redactSecrets(value, config = {}) {
  let text = String(value ?? '');
  for (const secret of [config.apiKey, env.STEPFUN_API_KEY].filter(Boolean)) {
    text = text.split(secret).join('[redacted-api-key]');
  }
  text = text.replace(/Bearer\s+[A-Za-z0-9._~+/=-]{8,}/gi, 'Bearer [redacted-api-key]');
  return text;
}

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isIgnoredSecretEnvKey(key) {
  return key === 'STEPFUN_API_KEY';
}

function normalizeBaseUrl(value) {
  if (!value) throw new Error('请填写模型服务 Base URL。');

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Base URL 格式不正确。');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Base URL 只支持 http 或 https。');
  }
  if (url.username || url.password) {
    throw new Error('Base URL 不要包含账号或密码。');
  }

  url.hash = '';
  url.search = '';
  return url.toString().replace(/\/+$/, '');
}
