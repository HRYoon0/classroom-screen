import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getValidSession } from '../_lib/session';

const FILE_NAME = 'classboard-data.json';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const result = await getValidSession(req.headers.cookie);
  if (!result) return res.status(401).json({ error: 'Not authenticated' });

  if (result.newCookie) res.setHeader('Set-Cookie', result.newCookie);

  const { accessToken } = result.session;
  const body = JSON.stringify(req.body);

  try {
    // 기존 파일 찾기
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${FILE_NAME}'&fields=files(id)`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const searchData = await searchRes.json();
    const fileId = searchData.files?.[0]?.id;

    if (fileId) {
      // 업데이트
      const updateRes = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body,
        }
      );
      return res.status(200).json({ ok: updateRes.ok });
    } else {
      // 생성 — multipart/related 수동 구성 (Node.js 호환)
      const metadata = JSON.stringify({ name: FILE_NAME, parents: ['appDataFolder'] });
      const boundary = '---classboard-boundary---';
      const multipartBody =
        `--${boundary}\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        `${metadata}\r\n` +
        `--${boundary}\r\n` +
        `Content-Type: application/json\r\n\r\n` +
        `${body}\r\n` +
        `--${boundary}--`;

      const createRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
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
