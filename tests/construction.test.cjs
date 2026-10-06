const test = require("node:test");
const assert = require("node:assert/strict");
const { game } = require("./helpers.cjs");
function setup(t, topic) {
  const g = game();
  t.after(g.close);
  g.run(`Math.random=()=>.5; startRound('${topic.split(".")[0]}','${topic}')`);
  return g;
}
test("collecting requires exactly the requested quantity from a larger pool", (t) => {
  const g = setup(t, "count.collect");
  const target = Number(
    g.document.querySelector("[data-target]").dataset.target,
  );
  const items = [...g.document.querySelectorAll(".collection button")];
  assert.ok(items.length > target);
  items.slice(0, target - 1).forEach((b) => b.click());
  g.document.querySelector("#checkBtn").click();
  g.tick(200);
  assert.equal(g.run("R.q.done"), false);
  assert.match(g.document.querySelector("#fbtext").textContent, /1 more/);
  items[target - 1].click();
  g.document.querySelector("#checkBtn").click();
  assert.equal(g.run("R.q.done"), true);
  assert.equal(g.run("learningRecord('count.collect').supported"), 1);
});
test("making a number two ways requires two distinct decompositions", (t) => {
  const g = setup(t, "count.compose");
  const target = Number(
    g.document.querySelector("[data-target]").dataset.target,
  );
  g.document.querySelector("#checkBtn").click();
  assert.equal(g.run("R.q.done"), false);
  g.document.querySelector("#checkBtn").click();
  assert.equal(g.run("R.q.done"), false);
  g.document.querySelector(".part-counters button").click();
  g.document.querySelector("#checkBtn").click();
  assert.equal(g.run("R.q.done"), true);
  assert.match(
    g.document.querySelector("#fbtext").textContent,
    new RegExp(`${target} =`),
  );
});
test("rearranging a collection preserves every object before asking how many", (t) => {
  const g = setup(t, "count.conserve");
  const before = g.document.querySelectorAll(".conservation .item").length;
  assert.ok(before > 0);
  assert.equal(g.document.querySelector(".choices").hidden, true);
  g.document.querySelector("#moveObjects").click();
  assert.equal(
    g.document.querySelectorAll(".conservation .item").length,
    before,
  );
  assert.equal(g.document.querySelector(".choices").hidden, false);
  g.document.querySelector(`.choices [data-v="${before}"]`).click();
  assert.equal(g.run("R.q.done"), true);
});

test("pattern continuation shows three complete repeats and requires a whole further repeat", (t) => {
  const g = setup(t, "shapes.extend");
  assert.equal(
    g.document.querySelectorAll(".pattern-repeat.complete").length,
    3,
  );
  const blanks = g.document.querySelectorAll(".pattern-slot.blank");
  assert.equal(blanks.length, 2);
  g.document.querySelector("[data-correct]").click();
  assert.equal(g.run("R.q.done"), false);
  g.document.querySelector("[data-correct]").click();
  assert.equal(g.run("R.q.done"), true);
});
test("the repeating unit can be selected independently of shape recognition", (t) => {
  const g = setup(t, "shapes.unit");
  assert.equal(
    g.document.querySelectorAll(".pattern-repeat.complete").length,
    3,
  );
  g.document.querySelector("[data-correct]").click();
  assert.equal(g.run("learningRecord('shapes.unit').independent"), 1);
  assert.equal(g.run("learningRecord('shapes.find').independent"), 0);
});
test("repairing a pattern requires finding and replacing its incorrect item", (t) => {
  const g = setup(t, "shapes.repair");
  const bad = g.document.querySelector(".repair-item[data-mistake]");
  assert.ok(bad);
  bad.click();
  assert.equal(g.run("R.q.done"), false);
  g.document.querySelector(".pattern-bank [data-correct]").click();
  assert.equal(g.run("R.q.done"), true);
});
test("children create a unit and repeat their own pattern three times", (t) => {
  const g = setup(t, "shapes.create");
  const bank = [...g.document.querySelectorAll(".pattern-bank button")];
  bank[0].click();
  bank[1].click();
  g.document.querySelector("#useUnit").click();
  assert.equal(g.run("R.q.done"), false);
  for (let i = 0; i < 4; i++) bank[i % 2].click();
  g.document.querySelector("#checkBtn").click();
  assert.equal(g.run("R.q.done"), true);
  assert.match(g.document.querySelector("#fbtext").textContent, /three times/);
});

test("moving a counter keeps keyboard focus on that counter", (t) => {
  const g = setup(t, "count.compose");
  const b = g.document.querySelector(".part-counters button");
  b.focus();
  b.click();
  assert.equal(g.document.activeElement, b);
  assert.match(b.getAttribute("aria-label"), /part 2/);
});

test("using a pattern unit moves keyboard focus to the next available control", (t) => {
  const g = setup(t, "shapes.create");
  const bank = [...g.document.querySelectorAll(".pattern-bank button")];
  bank[0].click();
  bank[1].click();
  const use = g.document.querySelector("#useUnit");
  use.focus();
  use.click();
  assert.equal(g.document.activeElement, bank[0]);
});
