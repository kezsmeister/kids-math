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

test("pattern continuation shows three complete repeats and asks for one next item", (t) => {
  const g = setup(t, "shapes.extend");
  assert.equal(
    g.document.querySelectorAll(".pattern-repeat.complete").length,
    3,
  );
  const blanks = g.document.querySelectorAll(".pattern-slot.blank");
  assert.equal(blanks.length, 1);
  g.document.querySelector("[data-correct]").click();

  assert.equal(g.run("R.q.done"), true);
});
