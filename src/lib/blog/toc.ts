export function extractToc(html: string): { id: string; text: string; depth: number }[] {
  // naive extraction of h2/h3 with id attributes
  const re = /<h([23]) id="([^"]+)">([^<]+)<\/h[23]>/g;
  const toc: { id: string; text: string; depth: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    toc.push({ id: m[2], text: m[3], depth: Number(m[1]) });
  }
  return toc;
}
