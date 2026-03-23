import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getValidSession } from '../_lib/session';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const result = await getValidSession(req.headers.cookie);

  if (!result) {
    return res.status(200).json({ loggedIn: false });
  }

  // 갱신된 쿠키가 있으면 설정
  if (result.newCookie) {
    res.setHeader('Set-Cookie', result.newCookie);
  }

  return res.status(200).json({
    loggedIn: true,
    user: result.session.user,
  });
}
