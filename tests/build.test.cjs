const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { game } = require("./helpers.cjs");

test("offline build embeds every asset and starts a playable game", (t) => {
  const root = path.resolve(__dirname, "..");
  execFileSync(process.execPath, [path.join(root, "scripts/build.mjs")]);
  const html = fs.readFileSync(
    path.join(root, "dist/math-garden.html"),
    "utf8",
  );
  assert.doesNotMatch(html, /<script[^>]*\bsrc=|<link[^>]*rel="stylesheet"/);
  assert.match(html, /<style>/);
  const g = game({ built: true });
  t.after(g.close);
  assert.equal(g.document.querySelectorAll("#cards .card").length, 8);
  g.run("startRound('sub');ctl.correct()");
  assert.equal(g.run("S.stars"), 1);
  assert.equal(
    g.document.querySelector("#nextBtn").classList.contains("show"),
    true,
  );
});
