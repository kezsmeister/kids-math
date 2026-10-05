const test = require("node:test");
const assert = require("node:assert/strict");
const { game } = require("./helpers.cjs");
function setup(t, topic, saved) {
  const g = game({ saved });
  t.after(g.close);
  g.run(
    `Math.random=()=>.5;unlockSpeech();startRound('shapes','shapes.${topic}')`,
  );
  g.tick(300);
  g.spoken.length = 0;
  return g;
}

test("pattern questions read the visible sequence aloud without supplying missing items", (t) => {
  const g = setup(t, "extend");
  g.document.querySelector("#replayBtn").click();
  assert.match(g.spoken.at(-1), /cat, rabbit, cat, rabbit, cat, rabbit/i);
  assert.match(g.spoken.at(-1), /empty|blank|space/i);
  assert.equal(
    g.run("R.q.assisted"),
    false,
    "Reading the visible question is an accommodation, not a mathematical hint",
  );
});
test("creating a pattern speaks selected items and the next instruction", (t) => {
  const g = setup(t, "create");
  const bank = [...g.document.querySelectorAll(".pattern-bank button")];
  assert.equal(bank[0].getAttribute("aria-label"), "cat");
  assert.equal(bank[1].getAttribute("aria-label"), "rabbit");
  bank[0].click();
  assert.match(g.spoken.at(-1), /cat/i);
  bank[1].click();
  g.document.querySelector("#useUnit").click();
  assert.match(g.spoken.at(-1), /cat, rabbit.*twice more/i);
  g.spoken.length = 0;
  g.document.querySelector("#replayBtn").click();
  assert.match(g.spoken.at(-1), /twice more/i);
  assert.equal(g.run("R.q.assisted"), false);
});
test("the final pattern item prompts checking, and Undo updates spoken instructions", (t) => {
  const g = setup(t, "create");
  const bank = [...g.document.querySelectorAll(".pattern-bank button")];
  bank[0].click();
  bank[1].click();
  g.document.querySelector("#useUnit").click();
  for (let i = 0; i < 4; i++) bank[i % 2].click();
  assert.match(g.spoken.at(-1), /press Check/i);
  [...g.document.querySelectorAll("button")]
    .find((b) => b.textContent === "Undo last item")
    .click();
  assert.match(g.spoken.at(-1), /removed.*rabbit/i);
  g.document.querySelector("#replayBtn").click();
  assert.match(g.spoken.at(-1), /empty|blank|space|finish/i);
});
test("shape help explains the requested shape out loud", (t) => {
  const g = setup(t, "find");
  g.document.querySelector("#hintBtn").click();
  assert.match(g.spoken.at(-1), /triangle.*three.*straight/i);
  assert.equal(g.run("R.q.assisted"), true);
});
test("pattern repair replay describes the replacement step after finding the mistake", (t) => {
  const g = setup(t, "repair");
  g.document.querySelector("[data-mistake]").click();
  g.spoken.length = 0;
  g.document.querySelector("#replayBtn").click();
  assert.match(g.spoken.at(-1), /choose.*(belongs|replace|replacement)/i);
  assert.doesNotMatch(g.spoken.at(-1), /tap the item that breaks/i);
});
test("muting voice silences automatic pattern narration but explicit replay still works", (t) => {
  const g = setup(t, "create", { voice: false });
  const bank = [...g.document.querySelectorAll(".pattern-bank button")];
  bank[0].click();
  bank[1].click();
  g.document.querySelector("#useUnit").click();
  assert.equal(g.spoken.length, 0);
  g.document.querySelector("#replayBtn").click();
  assert.match(g.spoken.at(-1), /twice more/i);
  assert.equal(g.run("S.voice"), false);
});
test("replay stops an old side-count narration and reads finished feedback", (t) => {
  const g = setup(t, "sides");
  g.document.querySelector("#hintBtn").click();
  g.document.querySelector("#replayBtn").click();
  const afterReplay = g.spoken.length;
  g.tick(10000);
  assert.equal(
    g.spoken.length,
    afterReplay,
    "Scheduled counting must not interrupt replay",
  );
  g.document.querySelector("[data-correct]").click();
  g.spoken.length = 0;
  g.document.querySelector("#replayBtn").click();
  assert.match(g.spoken.at(-1), /four sides/i);
  assert.doesNotMatch(g.spoken.at(-1), /how many/i);
});

test("a worked side-count example does not interrupt its spoken feedback", (t) => {
  const g = setup(t, "sides");
  g.run("ctl.wrong();ctl.wrong()");
  assert.match(g.spoken.at(-1), /four sides/i);
  const count = g.spoken.length;
  g.tick(10000);
  assert.equal(g.spoken.length, count);
});
test("Undo on an empty pattern explains that no item has been added", (t) => {
  const g = setup(t, "create");
  [...g.document.querySelectorAll("button")]
    .find((b) => b.textContent === "Undo last item")
    .click();
  assert.match(g.spoken.at(-1), /empty.*choose/i);
});
test("an early pattern selection cancels the delayed initial voice prompt", (t) => {
  const g = setup(t, "create");
  g.run("startRound('shapes','shapes.create')");
  g.document.querySelector(".pattern-bank button").click();
  const count = g.spoken.length;
  g.tick(1000);
  assert.equal(g.spoken.length, count);
  g.run("goHome()");
  g.tick(10000);
  assert.equal(g.spoken.length, count);
});
