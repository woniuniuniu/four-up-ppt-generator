import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { DECK_SLIDE_COUNT, variants } from './lib/deckRenderer.mjs';
import { createStreamJob, runStreamJob, snapshotJob } from './lib/streamRunner.mjs';
import {
  generatedDir,
  publicDir,
  publicModelConfig,
  redactSecrets,
  rootDir,
  runtimeModelConfig,
  serverPort,
} from './lib/config.mjs';

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

    if (request.method === 'GET' && url.pathname === '/api/config') {
      return json(response, {
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

    if (request.method === 'POST' && url.pathname === '/api/generate-stream') {
      const payload = await readJson(request);
      const idea = String(payload.idea || '').trim();
      if (!idea) return json(response, { error: '请输入 PPT 想法。' }, 400);
      const settings = payload.settings || {};
      try {
        runtimeModelConfig(settings);
      } catch (error) {
        return json(response, { error: redactSecrets(error.message || error, settings) }, 400);
      }

      response.writeHead(200, {
        'content-type': 'application/x-ndjson; charset=utf-8',
        'cache-control': 'no-cache, no-transform',
        connection: 'keep-alive',
      });

      const job = createStreamJob(crypto.randomUUID(), idea);
      const send = (type, currentJob, htmlVariantId = '') => {
        response.write(`${JSON.stringify({ type, job: snapshotJob(currentJob, htmlVariantId) })}\n`);
      };

      try {
        send('job', job);
        await runStreamJob(job, settings, async (currentJob, htmlVariantId = '') => {
          send('job', currentJob, htmlVariantId);
        });
        send('done', job);
      } catch (error) {
        job.status = 'error';
        job.error = redactSecrets(error.message || error, settings);
        job.updatedAt = new Date().toISOString();
        send('error', job);
      } finally {
        response.end();
      }
      return;
    }

    if (request.method === 'GET' && url.pathname.startsWith('/generated/')) {
      return serveFile(response, path.join(rootDir, decodeURIComponent(url.pathname)));
    }

    if (request.method === 'GET') {
      const filePath = url.pathname === '/'
        ? path.join(publicDir, 'index.html')
        : path.join(publicDir, decodeURIComponent(url.pathname));
      return serveFile(response, filePath);
    }

    json(response, { error: 'Method not allowed' }, 405);
  } catch (error) {
    json(response, { error: redactSecrets(error.message || error) }, 500);
  }
});

server.listen(serverPort(), () => {
  console.log(`Four-up PPT generator is running at http://localhost:${serverPort()}`);
});

async function serveFile(response, filePath) {
  const resolved = path.resolve(filePath);
  const allowedRoots = [publicDir, generatedDir];
  if (!allowedRoots.some((dir) => resolved === dir || resolved.startsWith(`${dir}${path.sep}`))) {
    return json(response, { error: 'Not found' }, 404);
  }

  try {
    const info = await stat(resolved);
    if (!info.isFile()) return json(response, { error: 'Not found' }, 404);
    response.writeHead(200, { 'content-type': mimeType(resolved) });
    createReadStream(resolved).pipe(response);
  } catch {
    json(response, { error: 'Not found' }, 404);
  }
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error('请求内容太大。'));
      }
    });
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('JSON 格式不正确。'));
      }
    });
    request.on('error', reject);
  });
}

function json(response, data, status = 200) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(data));
}

function mimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
  }[ext] || 'application/octet-stream';
}
