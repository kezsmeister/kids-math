import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
let html = await readFile(path.join(root, "index.html"), "utf8");
const css = await readFile(path.join(root, "styles/game.css"), "utf8");
html = html.replace(
  /<link\s+rel="stylesheet"\s+href="styles\/game\.css"\s*\/?\s*>/,
  () => `<style>\n${css}\n</style>`,
);
for (const match of [
  ...html.matchAll(/<script defer src="([^"]+)"><\/script>/g),
]) {
  const code = await readFile(path.join(root, match[1]), "utf8");
  html = html.replace(match[0], () => `<script>\n${code}\n</script>`);
}
await mkdir(path.join(root, "dist"), { recursive: true });
await writeFile(path.join(root, "dist/math-garden.html"), html);
console.log("Built dist/math-garden.html (self-contained, no network assets)");
