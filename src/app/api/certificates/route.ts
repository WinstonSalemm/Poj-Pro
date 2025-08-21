import type { NextRequest } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const origin = new URL(req.url).origin;
    const url = `${origin}/certificates.json`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      // Gracefully degrade to empty list to avoid 500 on the page
      return new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      });
    }

    const text = await res.text();
    return new Response(text, {
      status: 200,
      headers: {
        'content-type': res.headers.get('content-type') ?? 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('[api/certificates][GET] error', error);
    // Graceful fallback as well
    return new Response(JSON.stringify({ items: [] }), {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }
}
