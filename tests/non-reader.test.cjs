const test = require("node:test");
const assert = require("node:assert/strict");
const { game } = require("./helpers.cjs");
function setup(t, topic, options = {}) {
  const g = game(options);
  t.after(g.close);
  const activity = topic.split(".")[0];
  g.run(
    `unlockSpeech();startRound('${activity.replace(/20$/, "")}','${topic}')`,
  );
  g.tick(300);
  g.spoken.length = 0;
  return g;
}
test("every unfinished task can be heard even when its automatic prompt is quiet", (t) => {
  const g = setup(t, "add.eq", { saved: { voice: false } });
  assert.equal(g.document.querySelector("#replayBtn").hidden, false);
  g.document.querySelector("#replayBtn").click();
  assert.match(g.spoken.at(-1), /plus/);
  assert.equal(g.run("R.q.assisted"), false);
});

test("requested help speaks and counts, while instruction replay remains unassisted", (t) => {
  const g = setup(t, "count.count", { saved: { voice: false } });
  g.document.querySelector("#replayBtn").click();
  assert.equal(g.run("R.q.assisted"), false);
  g.spoken.length = 0;
  g.document.querySelector("#countBtn").click();
  g.tick(15000);
  assert.ok(g.spoken.some((x) => /one|zero/.test(x)));
  assert.equal(g.run("R.q.assisted"), true);
});
test("collection uses a real basket and keeps keyboard focus when moving an object", (t) => {
  const g = setup(t, "count.collect");
  const basket = g.document.querySelector(".collection-basket");
  assert.ok(basket);
  const b = g.document.querySelector(".collection-source button");
  b.focus();
  b.click();
  assert.ok(basket.contains(b));
  assert.equal(g.document.activeElement, b);
  b.click();
  assert.ok(g.document.querySelector(".collection-source").contains(b));
  assert.equal(g.document.activeElement, b);
});
test("the first decomposition stays visible as objects while making a different pair", (t) => {
  const g = setup(t, "count.compose");
  const counter = g.document.querySelector(".part-counters button");
  counter.click();
  g.document.querySelector("#checkBtn").click();
  const snapshot = g.document.querySelector(".decomposition-snapshot");
  assert.ok(snapshot);
  const picture = snapshot.innerHTML;
  assert.equal(
    snapshot.querySelectorAll(".snapshot-counter").length,
    +g.document.querySelector(".number-play").dataset.target,
  );
  counter.click();
  assert.equal(snapshot.innerHTML, picture);
  assert.equal(g.run("R.q.done"), false);
});
test("pattern creation shows empty unit spaces and only the current stage controls", (t) => {
  const g = setup(t, "shapes.create");
  assert.equal(g.document.querySelectorAll(".unit-builder .blank").length, 2);
  const use = g.document.querySelector("#useUnit");
  assert.ok(use.querySelector(".control-icon"));
  assert.equal(g.document.querySelector("#restartUnit").hidden, true);
  const bank = g.document.querySelectorAll(".pattern-bank button");
  bank[0].click();
  bank[1].click();
  use.click();
  assert.equal(use.hidden, true);
  assert.equal(g.document.querySelector("#restartUnit").hidden, false);
  assert.ok(g.document.querySelector(".unit-reference"));
});
test("repair choices appear only after finding the mistake and old selection is disabled", (t) => {
  const g = setup(t, "shapes.repair");
  assert.equal(g.document.querySelector(".pattern-bank").hidden, true);
  g.document.querySelector("[data-mistake]").click();
  assert.equal(g.document.querySelector(".pattern-bank").hidden, false);
  assert.ok(
    [...g.document.querySelectorAll(".repair-item")].every((b) => b.disabled),
  );
  assert.ok(g.document.querySelector(".repair-target"));
  assert.equal(g.run("R.q.assisted"), false);
});

test("a three-item pattern keeps its unit through Undo and can restart cleanly", (t) => {
  const g = setup(t, "shapes.create");
  g.run(
    "learningRecord('shapes.create').level=3;startRound('shapes','shapes.create')",
  );
  const bank = [...g.document.querySelectorAll(".pattern-bank button")];
  assert.ok(g.document.querySelector(".optional-slot"));
  bank.forEach((b) => b.click());
  g.document.querySelector("#useUnit").click();
  const reference = g.document.querySelector(".unit-reference").textContent;
  bank[0].click();
  g.document.querySelector("#undoPattern").click();
  assert.equal(
    g.document.querySelector(".unit-reference").textContent,
    reference,
  );
  assert.equal(
    g.document.querySelectorAll(".pattern-preview .blank").length,
    6,
  );
  g.document.querySelector("#restartUnit").click();
  assert.equal(g.document.querySelector(".unit-reference"), null);
  assert.equal(g.document.querySelectorAll(".unit-builder .blank").length, 2);
  assert.equal(g.document.querySelector("#useUnit").hidden, false);
  assert.equal(
    g.document.querySelector("#checkBtn").parentElement.hidden,
    true,
  );
  assert.equal(g.document.activeElement, bank[0]);
});

test("replaying the task stops requested counting and preserves its learning evidence", (t) => {
  const g = setup(t, "count.count");
  g.document.querySelector("#countBtn").click();
  g.tick(500);
  g.document.querySelector("#replayBtn").click();
  const speech = g.spoken.length;
  g.tick(30000);
  assert.equal(g.spoken.length, speech);
  assert.equal(g.run("R.q.assisted"), true);
});

test("questions and requested teaching have bundled recordings", (t) => {
  const g = game({ seed: 81, saved: { voice: false } });
  t.after(g.close);
  g.run("unlockSpeech()");
  const check = (text, where) =>
    assert.ok(
      g.run(`recordedPlan(${JSON.stringify(text)})?.length > 0`),
      `${where}: ${text}`,
    );
  g.run("Object.values(SHAPE_DESCRIPTION)").forEach((text) =>
    check(text, "shape properties"),
  );
  for (const topic of g.run("Object.keys(TOPICS)")) {
    const activity = topic.split(".")[0];
    for (const level of [1, 2, 3])
      for (let sample = 0; sample < 4; sample++) {
        g.run(
          `S.mode=${activity.endsWith("20") ? 20 : 10};learningRecord('${topic}').level=${level};startRound('${activity.replace(/20$/, "")}','${topic}')`,
        );
        check(g.run("R.q.questionSpeech"), topic);
        g.spoken.length = 0;
        g.document.querySelector("#hintBtn").click();
        g.tick(40000);
        g.spoken.forEach((text) => check(text, topic));
      }
  }
  g.run(
    "S.mode=20;learningRecord('tenframe20.ones').level=3;Math.random=()=>.999;startRound('tenframe','tenframe20.ones')",
  );
  check(g.run("R.q.questionSpeech"), "twenty leftover ones");
  g.document.querySelector("#hintBtn").click();
  check(g.spoken.at(-1), "twenty help");
});

test("a normal pattern tap stays quiet after requested help", (t) => {
  const g = setup(t, "shapes.extend", { saved: { voice: false } });
  g.document.querySelector("#hintBtn").click();
  assert.ok(g.spoken.length > 0);
  g.spoken.length = 0;
  g.document.querySelector(".pattern-bank [data-correct]").click();
  assert.equal(g.run("R.q.done"), false);
  assert.deepEqual(g.spoken, []);
  assert.equal(g.run("R.q.spokenHelp"), false);
});
