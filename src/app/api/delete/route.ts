import { del } from '@vercel/blob';

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  if (!url) return new Response('Missing URL', { status: 400 });

  await del(url);
  return new Response('Deleted', { status: 200 });
}
