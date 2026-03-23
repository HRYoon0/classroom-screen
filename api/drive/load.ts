import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getValidSession } from '../_lib/session';

const FILE_NAME = 'classboard-data.json';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const result = await getValidSession(req.headers.cookie);
  if (!result) return res.status(401).json({ error: 'Not authenticated' });

  if (result.newCookie) res.setHeader('Set-Cookie', result.newCookie);

  const { accessToken } = result.session;

  try {
    // 파일 찾기
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${FILE_NAME}'&fields=files(id)`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const searchData = await searchRes.json();
    const fileId = searchData.files?.[0]?.id;

    if (!fileId) return res.status(200).json({ data: null });

    // 파일 내용 로드
    const fileRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!fileRes.ok) return res.status(200).json({ data: null });

    const data = await fileRes.json();
    return res.status(200).json({ data });
  } catch {
    return res.status(500).json({ data: null });
  }
}
