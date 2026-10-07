const test = require("node:test");
const assert = require("node:assert/strict");
const { game } = require("./helpers.cjs");
function setup(t, saved) {
  const g = game({ saved });
  t.after(g.close);
  g.run("unlockSpeech()");
  g.spoken.length = 0;
  return g;
}
function start(g, topic) {
  const activity = topic.split(".")[0];
  g.run(
    `S.mode=${activity.endsWith("20") ? 20 : 10};startRound('${activity.replace(/20$/, "")}','${topic}')`,
  );
  g.spoken.length = 0;
  g.tick(300);
}

test("word-dependent tasks are read; quantities and visible gaps stay quiet", (t) => {
  const g = setup(t);
  const spoken = [
    "count.collect",
    "count.conserve",
    "count.quick",
    "tenframe.build",
    "tenframe.more",
    "bonds.whole",
    "bonds.part",
    "compare.quantity",
    "compare.length",
    "compare.height",
    "compare.size",
    "order.bigger",
    "shapes.find",
    "shapes.sides",
    "sub.story",
  ];
  const quiet = [
    "count.count",
    "count.give",
    "count20.count",
    "tenframe.read",
    "tenframe20.read",
    "order.next",
    "order.missing",
    "order.before",
    "add.story",
    "shapes.extend",
  ];
  for (const [topics, expected] of [
    [spoken, true],
    [quiet, false],
  ]) {
    for (const topic of topics) {
      start(g, topic);
      assert.equal(g.spoken.length, expected ? 1 : 0, topic);
      assert.equal(
        g.document.querySelector("#readQuestionBtn").hidden,
        false,
        topic,
      );
      assert.equal(g.document.querySelector("#replayBtn").hidden, false, topic);
      assert.equal(g.run("R.q.assisted"), false, topic);
    }
  }
});

test("praise, answers and automatic hints do not speak after an answer", (t) => {
  const g = setup(t);
  for (const topic of ["shapes.find", "compare.quantity", "add.story"]) {
    start(g, topic);
    g.spoken.length = 0;
    g.run("ctl.wrong();ctl.correct()");
    g.tick(10000);
    assert.equal(g.spoken.length, 0, topic);
    assert.equal(g.document.querySelector("#readQuestionBtn").hidden, true);
    g.document.querySelector("#replayBtn").click();
    assert.equal(g.spoken.length, 0);
  }
});

test("Read question repeats the task after spoken help, even with automatic reading off", (t) => {
  const g = setup(t, { voice: false });
  start(g, "shapes.find");
  g.document.querySelector("#hintBtn").click();
  assert.ok(g.spoken.length > 0);
  g.document.querySelector("#readQuestionBtn").click();
  assert.match(g.spoken.at(-1), /^Tap the/);
  assert.doesNotMatch(g.spoken.at(-1), /corners|straight sides/);
  assert.equal(g.run("S.voice"), false);
});

test("switching to a visual-only subquestion cancels its earlier spoken instruction", (t) => {
  const g = setup(t);
  g.run("startRound('count','count.conserve')");
  g.document.querySelector("#moveObjects").click();
  g.tick(1000);
  assert.equal(g.spoken.length, 0);
  assert.equal(g.document.querySelector("#readQuestionBtn").hidden, false);
});

test("all narrated tasks have offline recordings at every level", (t) => {
  const g = setup(t);
  for (const topic of g.run("Object.keys(TOPICS)")) {
    for (const level of [1, 2, 3]) {
      g.run(`learningRecord('${topic}').level=${level}`);
      start(g, topic);
      const speech = g.run("R.q.questionSpeech");
      if (speech)
        assert.ok(
          g.run("recordedPlan(R.q.questionSpeech)?.length > 0"),
          `${topic}: ${speech}`,
        );
    }
  }
});
