import type { VercelRequest, VercelResponse } from '@vercel/node';

const FILE_NAME = 'classboard-data.json';

function getSession(cookieHeader: string | undefined) {
  if (!cookieHeader) return null;
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((c) => {
    const [key, ...rest] = c.trim().split('=');
    if (key) cookies[key] = rest.join('=');
  });
  const val = cookies['cb_session'];
  if (!val) return null;
  try { return JSON.parse(Buffer.from(val, 'base64').toString()); }
  catch { return null; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const session = getSession(req.headers.cookie);
    if (!session?.accessToken) return res.status(401).json({ data: null });

    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${FILE_NAME}'&fields=files(id)`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    );
    const searchData = await searchRes.json();
    const fileId = searchData.files?.[0]?.id;

    if (!fileId) return res.status(200).json({ data: null });

    const fileRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    );
    if (!fileRes.ok) return res.status(200).json({ data: null });

    const data = await fileRes.json();
    return res.status(200).json({ data });
  } catch {
    return res.status(500).json({ data: null });
  }
}
