const test = require("node:test");
const assert = require("node:assert/strict");
const { game } = require("./helpers.cjs");
function setup(t) {
  const g = game();
  t.after(g.close);
  g.run("unlockSpeech()");
  return g;
}

test("home cards open playable activities without a tutorial blocking the task", (t) => {
  const g = setup(t);
  for (const activity of [
    "count",
    "tenframe",
    "bonds",
    "compare",
    "order",
    "add",
    "sub",
    "shapes",
  ]) {
    g.run("goHome()");
    g.document.querySelector(`[data-act="${activity}"]`).click();
    assert.equal(
      g.document.querySelector(".stageOuter").hidden,
      false,
      activity,
    );
    assert.ok(g.document.querySelector("#stage button"), activity);
    assert.equal(
      g.document.querySelector("#act").classList.contains("on"),
      true,
    );
    assert.equal(g.run("R.q.assisted"), false);
  }
});

test("a beginner sees small groups and answers immediately with no hiding timer", (t) => {
  const g = setup(t);
  g.run("startRound('count','count.quick')");
  const dots = g.document.querySelector(".quick-dots");
  assert.equal(dots.classList.contains("covered"), false);
  assert.equal(g.document.querySelector(".choices").hidden, false);
  g.tick(30000);
  assert.equal(dots.classList.contains("covered"), false);
  assert.ok(g.spoken.some((text) => /how many/i.test(text)));
  assert.ok(
    g.document.querySelector("#showAgain") === null ||
      g.document.querySelector("#showAgain").hidden,
  );
  g.document.querySelector("[data-correct]").click();
  assert.equal(g.run("learningRecord('count.quick').independent"), 1);
});

test("requested small-group help counts the real dots aloud", (t) => {
  const g = setup(t);
  g.run("startRound('count','count.quick')");
  g.tick(300);
  g.spoken.length = 0;
  g.document.querySelector("#hintBtn").click();
  g.tick(15000);
  assert.ok(g.spoken.includes("one"));
  const target = +g.document.querySelector("[data-target]").dataset.target;
  assert.equal(
    g.document.querySelectorAll(".quick-dots .counted").length,
    target,
  );
  g.document.querySelector("[data-correct]").click();
  assert.equal(g.run("learningRecord('count.quick').supported"), 1);
});

test("successful varied practice changes layouts while keeping the dots visible", (t) => {
  const g = setup(t);
  for (const value of [0.1, 0.35, 0.65, 0.9]) {
    g.run(`Math.random=()=>${value};startRound('count','count.quick')`);
    g.tick(10000);
    assert.equal(
      g.document.querySelector(".quick-dots").classList.contains("covered"),
      false,
    );
    g.document.querySelector("[data-correct]").click();
  }
  assert.equal(g.run("learningRecord('count.quick').level"), 2);
  g.run("startRound('count','count.quick')");
  assert.equal(g.document.querySelector(".stageOuter").hidden, false);
  g.tick(10000);
  assert.equal(
    g.document.querySelector(".quick-dots").classList.contains("covered"),
    false,
  );
});
