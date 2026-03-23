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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const session = getSession(req.headers.cookie);
    if (!session?.accessToken) return res.status(401).json({ ok: false });

    const body = JSON.stringify(req.body);

    // 기존 파일 찾기
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${FILE_NAME}'&fields=files(id)`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    );
    const searchData = await searchRes.json();
    const fileId = searchData.files?.[0]?.id;

    if (fileId) {
      const updateRes = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' },
          body,
        }
      );
      return res.status(200).json({ ok: updateRes.ok });
    } else {
      const metadata = JSON.stringify({ name: FILE_NAME, parents: ['appDataFolder'] });
      const boundary = '---classboard-boundary---';
      const multipartBody =
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
        `--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`;

      const createRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body: multipartBody,
        }
      );
      return res.status(200).json({ ok: createRes.ok });
    }
  } catch {
    return res.status(500).json({ ok: false });
  }
}
