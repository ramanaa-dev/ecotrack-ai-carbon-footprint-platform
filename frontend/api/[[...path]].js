const getBackendBaseUrl = () => {
  const url = process.env.BACKEND_URL || process.env.VITE_API_URL;
  if (!url) {
    return '';
  }

  return url.replace(/\/api\/?$/, '').replace(/\/$/, '');
};

const buildTargetUrl = (req, backendBaseUrl) => {
  const pathSegments = req.query.path;
  const path = Array.isArray(pathSegments)
    ? pathSegments.join('/')
    : typeof pathSegments === 'string'
      ? pathSegments
      : '';

  const targetUrl = new URL(`${backendBaseUrl}/api/${path}`);

  for (const [key, value] of Object.entries(req.query)) {
    if (key !== 'path') {
      if (Array.isArray(value)) {
        value.forEach((item) => targetUrl.searchParams.append(key, String(item)));
      } else if (value !== undefined) {
        targetUrl.searchParams.append(key, String(value));
      }
    }
  }

  return targetUrl;
};

const readRequestBody = async (req) => {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return undefined;
  }

  if (req.body !== undefined) {
    if (Buffer.isBuffer(req.body)) {
      return req.body;
    }

    if (typeof req.body === 'string') {
      return req.body;
    }

    if (typeof req.body === 'object' && req.body !== null) {
      return JSON.stringify(req.body);
    }
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return undefined;
  }

  return Buffer.concat(chunks);
};

export default async function handler(req, res) {
  const backendBaseUrl = getBackendBaseUrl();

  if (!backendBaseUrl) {
    res.status(500).json({
      message:
        'Missing BACKEND_URL environment variable. Set it to your Render backend URL, for example https://your-app.onrender.com.',
    });
    return;
  }

  const targetUrl = buildTargetUrl(req, backendBaseUrl);
  const headers = { ...req.headers };
  delete headers.host;
  delete headers['content-length'];

  const body = await readRequestBody(req);

  const upstreamResponse = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
    redirect: 'manual',
  });

  res.status(upstreamResponse.status);

  upstreamResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'transfer-encoding') {
      res.setHeader(key, value);
    }
  });

  const buffer = Buffer.from(await upstreamResponse.arrayBuffer());
  res.send(buffer);
}
