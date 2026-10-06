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
  const g = setup(t, "add.story", { saved: { voice: false } });
  assert.equal(g.document.querySelector("#replayBtn").hidden, false);
  g.document.querySelector("#replayBtn").click();
  assert.match(g.spoken.at(-1), /altogether/);
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
});

test("a normal pattern tap stays quiet after requested help", (t) => {
  const g = setup(t, "shapes.extend", { saved: { voice: false } });
  g.document.querySelector("#hintBtn").click();
  assert.ok(g.spoken.length > 0);
  g.spoken.length = 0;
  g.document.querySelector(".pattern-play [data-correct]").click();
  assert.equal(g.run("R.q.done"), true);
  assert.deepEqual(g.spoken, []);
  assert.equal(g.run("R.q.spokenHelp"), false);
});
