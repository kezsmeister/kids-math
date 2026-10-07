const test = require("node:test");
const assert = require("node:assert/strict");
const { game } = require("./helpers.cjs");
function setup(t, { level = 1, seed = 7, saved, reducedMotion = false } = {}) {
  const g = game({ seed, saved, reducedMotion });
  t.after(g.close);
  g.run(
    `unlockSpeech();learningRecord('sub.story').level=${level};startRound('sub','sub.story')`,
  );
  return g;
}
function quantities(g) {
  return g.run("R.q.note").match(/\d+/g).map(Number);
}
function balloons(g) {
  return [...g.document.querySelectorAll(".take-balloon")];
}
function popRequired(g) {
  const [, taken] = quantities(g);
  balloons(g)
    .slice(0, taken)
    .forEach((b) => b.click());
}

test("Take Away starts with real tappable balloons and a short spoken action", (t) => {
  const g = setup(t);
  const [total, taken] = quantities(g);
  assert.equal(balloons(g).length, total);
  assert.ok(
    balloons(g).every(
      (b) => b.tagName === "BUTTON" && !b.disabled && !b.hidden,
    ),
  );
  assert.equal(g.document.querySelectorAll(".take-balloon.popped").length, 0);
  assert.equal(g.document.querySelectorAll(".take-goal-mark").length, taken);
  assert.equal(g.document.querySelector(".take-answers").hidden, true);
  assert.ok(
    [...g.document.querySelectorAll(".take-answers button")].every(
      (b) => b.disabled,
    ),
  );
  assert.equal(g.document.querySelector("#checkBtn,.substory,.eq,.gone"), null);
  g.tick(300);
  assert.match(g.spoken.at(-1), /^Pop (one|two|three|four|five) balloons?\.$/);
  assert.equal(g.run("R.q.assisted"), false);
});

test("only the requested number pop, then the remaining balloons can be counted", (t) => {
  const g = setup(t);
  g.run("Math.random=()=>.5;startRound('sub','sub.story')");
  const [total, taken, left] = quantities(g);
  const all = balloons(g);
  for (let i = 0; i < taken; i++) {
    all[i].focus();
    all[i].click();
    all[i].click(); // A repeated tap must not remove another balloon.
    assert.equal(
      g.document.querySelectorAll(".take-balloon.popped").length,
      i + 1,
    );
    assert.equal(all[i].disabled, true);
    assert.notEqual(g.document.activeElement, all[i]);
    assert.equal(
      g.document.querySelector(".take-answers").hidden,
      i + 1 < taken,
    );
    if (i + 1 < taken) assert.match(g.run("R.q.questionSpeech"), /^Pop /);
  }
  all.forEach((b) => b.click());
  assert.equal(
    g.document.querySelectorAll(".take-balloon:not(.popped)").length,
    left,
  );
  assert.equal(
    g.document.querySelectorAll(".take-balloon.popped").length,
    taken,
  );
  assert.equal(all.length, total);
  assert.equal(g.document.querySelector(".take-goal").hidden, true);
  assert.ok(all.every((b) => b.disabled));
  assert.match(g.run("R.q.questionSpeech"), /How many balloons are left/);
  g.tick(300);
  assert.match(g.spoken.at(-1), /How many balloons are left/);
  g.document.querySelector(`[data-v="${left}"]`).click();
  assert.equal(g.run("R.q.done"), true);
  assert.equal(g.run("learningRecord('sub.story').independent"), 1);
});

test("question replay preserves progress and describes the current action", (t) => {
  const g = setup(t, { saved: { voice: false } });
  g.run("Math.random=()=>.5;startRound('sub','sub.story')");
  const [, taken] = quantities(g);
  assert.ok(taken > 1, "seed supplies more than one pop");
  balloons(g)[0].click();
  const current = g.run("R.q.questionSpeech");
  g.document.querySelector("#replayBtn").click();
  assert.equal(g.spoken.at(-1), current);
  assert.equal(g.document.querySelectorAll(".take-balloon.popped").length, 1);
  balloons(g)
    .slice(1, taken)
    .forEach((b) => b.click());
  g.document.querySelector("#replayBtn").click();
  assert.match(g.spoken.at(-1), /How many balloons are left/);
  assert.equal(g.run("R.q.assisted"), false);
  g.tick(60000);
  assert.equal(
    g.document.querySelectorAll(".take-balloon.popped").length,
    taken,
  );
});

test("help points out the action first and counts only remaining balloons afterwards", (t) => {
  const g = setup(t, { saved: { voice: false } });
  g.document.querySelector("#hintBtn").click();
  assert.match(g.spoken.at(-1), /Tap.*balloons/i);
  assert.equal(g.document.querySelectorAll(".take-balloon.popped").length, 0);
  popRequired(g);
  const [, , left] = quantities(g);
  g.spoken.length = 0;
  g.document.querySelector("#hintBtn").click();
  g.tick(30000);
  assert.equal(
    g.document.querySelectorAll(".take-balloon.popped .badge").length,
    0,
  );
  assert.equal(
    g.document.querySelectorAll(".take-balloon:not(.popped) .badge").length,
    left,
  );
  assert.ok(g.spoken.length > 0);
  g.document.querySelector("[data-correct]").click();
  assert.equal(g.run("learningRecord('sub.story').supported"), 1);
});

test("all levels stay within five balloons and include a real empty result", (t) => {
  const g = setup(t);
  let foundZero = false;
  for (const level of [1, 2, 3])
    for (let sample = 0; sample < 24; sample++) {
      g.run(
        `learningRecord('sub.story').level=${level};startRound('sub','sub.story')`,
      );
      const [total, taken, left] = quantities(g);
      assert.ok(total >= 2 && total <= 5);
      assert.ok(taken >= 1 && taken <= total);
      assert.equal(left, total - taken);
      popRequired(g);
      assert.equal(
        g.document.querySelectorAll(".take-balloon:not(.popped)").length,
        left,
      );
      if (left === 0) {
        foundZero = true;
        assert.ok(g.document.querySelector('[data-v="0"][data-correct]'));
        g.document.querySelector("#hintBtn").click();
        assert.match(
          g.document.querySelector("#helpStatus").textContent,
          /None left.*zero/i,
        );
      }
      g.document.querySelector("[data-correct]").click();
      assert.equal(g.run("R.q.done"), true);
    }
  assert.ok(foundZero);
});

test("both phases and requested help have offline recordings", (t) => {
  const g = setup(t);
  for (let sample = 0; sample < 20; sample++) {
    g.run("startRound('sub','sub.story')");
    const check = () =>
      assert.ok(
        g.run("recordedPlan(R.q.questionSpeech)?.length > 0"),
        g.run("R.q.questionSpeech"),
      );
    check();
    for (const balloon of balloons(g)) {
      if (balloon.disabled) continue;
      balloon.click();
      check();
    }
    assert.match(g.run("R.q.questionSpeech"), /How many balloons are left/);
  }
});

test("wrong answers keep the completed action visible and schedule fresh practice", (t) => {
  const g = setup(t);
  popRequired(g);
  const [total, taken, left] = quantities(g);
  const wrong = [
    ...g.document.querySelectorAll(".take-answers button:not([data-correct])"),
  ];
  wrong[0].click();
  g.tick(4000);
  assert.equal(g.run("R.q.done"), false);
  wrong[1].click();
  assert.equal(g.run("R.q.done"), true);
  assert.equal(
    g.document.querySelectorAll(".take-balloon.popped").length,
    taken,
  );
  assert.equal(
    g.document.querySelectorAll(".take-balloon:not(.popped)").length,
    left,
  );
  const old = g.run("R.q.signature");
  g.document.querySelector("#nextBtn").click();
  assert.equal(g.run("R.q.topic"), "sub.story");
  assert.notEqual(g.run("R.q.signature"), old);
  assert.equal(g.document.querySelectorAll(".take-balloon.popped").length, 0);
});

test("calm mode needs no animation or waiting to complete taking away", (t) => {
  const g = setup(t, { reducedMotion: true });
  popRequired(g);
  assert.equal(g.document.querySelector(".take-answers").hidden, false);
  g.document.querySelector("[data-correct]").click();
  assert.equal(g.run("R.q.done"), true);
});
