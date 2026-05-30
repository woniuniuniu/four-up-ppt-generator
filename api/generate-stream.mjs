import crypto from 'node:crypto';
import { createStreamJob, runStreamJob, snapshotJob } from '../lib/streamRunner.mjs';
import { redactSecrets, runtimeModelConfig } from '../lib/config.mjs';

export const config = {
  maxDuration: 300,
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const idea = String(request.body?.idea || '').trim();
  if (!idea) {
    response.status(400).json({ error: '请输入 PPT 想法。' });
    return;
  }

  const settings = request.body?.settings || {};
  try {
    runtimeModelConfig(settings);
  } catch (error) {
    response.status(400).json({ error: redactSecrets(error.message || error, settings) });
    return;
  }

  response.writeHead(200, {
    'content-type': 'application/x-ndjson; charset=utf-8',
    'cache-control': 'no-cache, no-transform',
    'x-accel-buffering': 'no',
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
}
