const test = require("node:test");
const assert = require("node:assert/strict");
const { game } = require("./helpers.cjs");

const retired = [
  "count.compose",
  "tenframe20.ones",
  "tenframe20.build",
  "order.sort",
  "order20.next",
  "order20.missing",
  "order20.before",
  "order20.sort",
  "order20.bigger",
  "add.eq",
  "add.miss",
  "add20.teen",
  "sub.eq",
  "shapes.unit",
  "shapes.repair",
  "shapes.create",
];
const approved = [
  "count.count",
  "count.collect",
  "count.conserve",
  "count.quick",
  "count.give",
  "count20.count",
  "tenframe.read",
  "tenframe.build",
  "tenframe.more",
  "tenframe20.read",
  "bonds.whole",
  "bonds.part",
  "compare.quantity",
  "compare.length",
  "compare.height",
  "compare.size",
  "order.next",
  "order.missing",
  "order.before",
  "order.bigger",
  "add.story",
  "sub.story",
  "shapes.find",
  "shapes.sides",
  "shapes.extend",
];
function setup(t, options) {
  const g = game(options);
  t.after(g.close);
  return g;
}
function start(g, topic, level) {
  const activity = topic.split(".")[0];
  g.run(
    `S.mode=${activity.endsWith("20") ? 20 : 10}; learningRecord('${topic}').level=${level}; startRound('${activity.replace(/20$/, "")}','${topic}')`,
  );
}

test("only the 25 reviewed skills are available in play and parent practice", (t) => {
  const g = setup(t);
  assert.deepEqual(
    Array.from(g.run("Object.keys(TOPICS)")).sort(),
    approved.slice().sort(),
  );
  g.run("renderParent()");
  const practice = [...g.document.querySelectorAll("[data-practice]")].map(
    (b) => b.dataset.practice,
  );
  assert.deepEqual(practice.sort(), approved.slice().sort());
  for (const topic of retired) {
    start(g, topic, 3);
    assert.ok(
      approved.includes(g.run("R.q.topic")),
      `Old focus ${topic} resolves to an active skill`,
    );
    assert.equal(g.run("R.idx"), 0);
  }
});

test("retired saved follow-ups cannot reappear and earned rewards survive", (t) => {
  for (const topic of retired) {
    const activity = topic.split(".")[0];
    const g = setup(t, {
      saved: {
        mode: 20,
        stars: 42,
        stickers: ["🐸"],
        pendingPractice: { [activity]: { topic, signature: "old-task" } },
        learning: { [topic]: { level: 3, history: [] } },
      },
    });
    g.run(`startRound('${activity.replace(/20$/, "")}')`);
    assert.ok(approved.includes(g.run("R.q.topic")), topic);
    assert.equal(g.run("Object.keys(S.pendingPractice).length"), 0);
    assert.equal(g.run("S.stars"), 42);
    assert.equal(g.run("S.stickers[0]"), "🐸");
  }
});

test("the optional 11–20 mode offers only counting visible quantities", (t) => {
  const g = setup(t);
  g.document.querySelector("#m20").click();
  assert.deepEqual(
    [...g.document.querySelectorAll("[data-act]")].map((b) => b.dataset.act),
    ["count", "tenframe"],
  );
  for (const topic of ["count20.count", "tenframe20.read"]) {
    start(g, topic, 3);
    assert.match(g.run("R.q.questionSpeech"), /^How many/);
    assert.ok(g.document.querySelectorAll(".item,.tf-cell.on").length >= 11);
    assert.doesNotMatch(
      g.document.querySelector("#stage").textContent,
      /leftover|ones|tens|=|\+/,
    );
  }
});

test("small groups remain visible at all levels through waiting and replay", (t) => {
  const g = setup(t);
  for (const level of [1, 2, 3]) {
    start(g, "count.quick", level);
    const dots = g.document.querySelector(".quick-dots");
    g.tick(60000);
    g.document.querySelector("#replayBtn").click();
    g.tick(60000);
    assert.equal(dots.classList.contains("covered"), false);
    assert.equal(g.document.querySelector("#showAgain"), null);
    assert.equal(g.run("R.q.assisted"), false);
    g.document.querySelector("[data-correct]").click();
    assert.equal(g.run("R.q.done"), true);
  }
});

test("subtraction starts with a visible concrete model and at most five removed objects", (t) => {
  const g = setup(t);
  for (const level of [1, 2, 3])
    for (let sample = 0; sample < 30; sample++) {
      start(g, "sub.story", level);
      const pictures = g.document.querySelector(".sub-pictures");
      assert.equal(pictures.hidden, false);
      assert.equal(pictures.closest(".sub-demo").hidden, false);
      const [total, taken, left] = g.run("R.q.note").match(/\d+/g).map(Number);
      assert.equal(pictures.querySelectorAll(".item").length, total);
      assert.equal(pictures.querySelectorAll(".gone").length, taken);
      assert.equal(total - taken, left);
      assert.ok(taken <= 5);
      assert.equal(g.document.querySelector("#stage .eq"), null);
      assert.equal(g.run("R.q.assisted"), false);
    }
});

test("patterns ask for a single next item with an immediately usable answer", (t) => {
  const g = setup(t);
  for (const level of [1, 2, 3])
    for (let sample = 0; sample < 12; sample++) {
      start(g, "shapes.extend", level);
      assert.equal(
        g.document.querySelectorAll(".pattern-slot.blank").length,
        1,
      );
      const sequence = [
        ...g.document.querySelectorAll(".pattern-slot:not(.blank)"),
      ].map((b) => b.textContent);
      assert.equal(new Set(sequence).size, 2);
      assert.ok(sequence.length >= 6 && sequence.length <= 9);
      assert.equal(
        g.document.querySelector("#useUnit,#checkBtn,.repair-item"),
        null,
      );
      g.document.querySelector("[data-correct]").click();
      assert.equal(g.run("R.q.done"), true);
      assert.equal(
        g.document.querySelectorAll(".pattern-slot.blank").length,
        0,
      );
    }
});

test("replaying a subtraction question during help restores the crossed-out objects", (t) => {
  const g = setup(t);
  start(g, "sub.story", 3);
  const removed = Number(g.run("R.q.note").match(/\d+/g)[1]);
  g.document.querySelector("#countBtn").click();
  g.tick(100);
  g.document.querySelector("#replayBtn").click();
  g.tick(30000);
  assert.equal(
    g.document.querySelectorAll(".sub-pictures .gone").length,
    removed,
  );
  assert.equal(g.run("R.q.assisted"), true);
});

test("number paths and numeral comparisons supply quantity pictures before help", (t) => {
  const g = setup(t);
  for (const level of [1, 2, 3])
    for (const topic of [
      "order.next",
      "order.missing",
      "order.before",
      "order.bigger",
    ]) {
      start(g, topic, level);
      if (topic === "order.bigger") {
        for (const button of g.document.querySelectorAll(".choices button"))
          assert.ok(button.querySelector(".mdots"));
      } else {
        for (const cell of g.document.querySelectorAll(".pcell"))
          assert.equal(
            !!cell.querySelector(".mdots"),
            !cell.querySelector(".blank"),
          );
      }
      assert.equal(g.run("R.q.assisted"), false);
    }
});

test("missing-part questions stay within five and empty-frame questions name the spaces", (t) => {
  const g = setup(t);
  for (const level of [1, 2, 3])
    for (let sample = 0; sample < 20; sample++) {
      start(g, "bonds.part", level);
      assert.ok(g.document.querySelectorAll(".cntrow .cnt").length <= 5);
      assert.equal(g.run("TOPICS[R.q.topic].narrate"), true);
      start(g, "tenframe.more", level);
      assert.match(g.run("R.q.questionSpeech"), /empty spaces/);
      assert.doesNotMatch(
        g.document.querySelector("#prompt").textContent,
        /[+=]/,
      );
      assert.equal(g.run("TOPICS[R.q.topic].narrate"), true);
    }
});

test("every retained skill can be completed through its visible controls at every level", (t) => {
  const g = setup(t);
  for (const topic of approved)
    for (const level of [1, 2, 3]) {
      start(g, topic, level);
      if (topic === "count.collect" || topic === "tenframe.build") {
        const target =
          +g.document.querySelector("[data-target]").dataset.target;
        const selector =
          topic === "count.collect"
            ? ".collection-source button"
            : ".tf-int .tf-cell";
        [...g.document.querySelectorAll(selector)]
          .slice(0, target)
          .forEach((b) => b.click());
        g.document.querySelector("#checkBtn").click();
      } else {
        if (topic === "count.conserve")
          g.document.querySelector("#moveObjects").click();
        const answer = g.document.querySelector("#stage [data-correct]");
        assert.ok(answer, topic);
        assert.equal(answer.closest("[hidden]"), null, topic);
        answer.click();
      }
      assert.equal(g.run("R.q.done"), true, `${topic}/${level}`);
      assert.equal(g.run("R.q.assisted"), false, `${topic}/${level}`);
      assert.ok(
        g.document.querySelector("#nextBtn").classList.contains("show"),
      );
      g.document.querySelector("#nextBtn").click();
      assert.equal(g.run("R.idx"), 1);
      assert.equal(g.run("R.q.topic"), topic);
    }
});
