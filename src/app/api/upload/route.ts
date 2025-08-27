import { put } from '@vercel/blob';
import { v4 as uuid } from 'uuid';

export async function POST(req: Request) {
  const body = await req.arrayBuffer();
  const filename = `${uuid()}.png`;

  const { url } = await put(filename, body, { access: 'public' });
  return Response.json({ url });
}
