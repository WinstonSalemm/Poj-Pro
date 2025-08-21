const base = "https://poj-pro-production.up.railway.app";
const paths = [
  "/api/health",
  "/api/health/db",
  "/api/products?locale=ru",
  "/api/categories?locale=ru",
];

for (const p of paths) {
  const u = base + p;
  try {
    const res = await fetch(u);
    const ct = res.headers.get("content-type");
    const cc = res.headers.get("cache-control");
    const text = await res.text();
    console.log(u, "->", res.status, "| CT:", ct, "| CC:", cc);
    try {
      const json = JSON.parse(text);
      console.log("keys:", Object.keys(json), "\n");
    } catch {
      console.log("NOT JSON. first bytes:\n", text.slice(0, 200), "\n");
      process.exitCode = 1;
    }
  } catch (e) {
    console.error("Request failed:", u, e);
    process.exitCode = 1;
  }
}
