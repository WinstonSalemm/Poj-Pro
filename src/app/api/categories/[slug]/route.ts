export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, ctx: { params: { slug: string } }) {
  const url = new URL(req.url);
  const locale = url.searchParams.get('locale') || 'ru';
  const res = await fetch(new URL(`/categories.${ctx.params.slug}.${locale}.json`, url));
  return new Response(res.body, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=60'
    }
  });
}
