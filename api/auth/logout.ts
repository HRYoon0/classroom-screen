import type { VercelRequest, VercelResponse } from '@vercel/node';
import { deleteSessionCookie } from '../_lib/session';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Set-Cookie', deleteSessionCookie());
  res.status(200).json({ ok: true });
}
