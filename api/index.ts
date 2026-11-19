import type { IncomingMessage, ServerResponse } from 'http';
import { createFamilyApiHandler } from '../server/familyApiMiddleware.js';

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
  const parsed = new URL(rawUrl, 'http://localhost');
  const rewrittenPath =
    parsed.searchParams.get('__path') || parsed.searchParams.getAll('path').join('/');

  if (
    parsed.pathname === '/api/index' ||
    parsed.pathname === '/api' ||
    parsed.pathname === '/api/' ||
    parsed.pathname.startsWith('/api/[') ||
    parsed.pathname.startsWith('/api/%5B')
  ) {
    parsed.searchParams.delete('__path');
    parsed.searchParams.delete('path');
    const cleanSubPath = rewrittenPath.replace(/^\/+/, '');
    const qs = parsed.searchParams.toString();
    req.url = `/api/${cleanSubPath}${qs ? `?${qs}` : ''}`;
  } else {
    parsed.searchParams.delete('__path');
    const qs = parsed.searchParams.toString();
    const base = parsed.pathname.startsWith('/api')
      ? parsed.pathname
      : `/api${parsed.pathname.startsWith('/') ? '' : '/'}${parsed.pathname}`;
    req.url = `${base}${qs ? `?${qs}` : ''}`;
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
