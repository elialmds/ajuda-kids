import type { IncomingMessage, ServerResponse } from 'http';
import { createFamilyApiHandler } from '../server/familyApiMiddleware';

export const config = {
  api: {
    bodyParser: false
  }
};

const apiHandler = createFamilyApiHandler({
  rootDir: process.cwd()
});

function normalizeVercelApiUrl(req: IncomingMessage): void {
  const rawUrl = String(req.url || '/api');
  if (rawUrl.startsWith('/api/[...path]') || rawUrl.startsWith('/api/%5B...path%5D')) {
    const parsed = new URL(rawUrl, 'http://localhost');
    const pathSegments = parsed.searchParams.getAll('path');
    parsed.searchParams.delete('path');
    const qs = parsed.searchParams.toString();
    req.url = `/api/${pathSegments.join('/')}${qs ? `?${qs}` : ''}`;
  } else if (!rawUrl.startsWith('/api')) {
    req.url = `/api${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  normalizeVercelApiUrl(req);
  await apiHandler(req, res, () => {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'API route not found' }));
  });
}
