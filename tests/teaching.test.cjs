const test = require("node:test");
const assert = require("node:assert/strict");
const { game } = require("./helpers.cjs");
function setup(t) {
  const g = game();
  t.after(g.close);
  return g;
}
test("a square is accepted when the question asks for a rectangle", (t) => {
  const g = setup(t);
  g.run("learningRecord('shapes.find').level=2");
  for (let i = 0; i < 100; i++) {
    g.run("startRound('shapes','shapes.find')");
    if (g.document.querySelector("#prompt").textContent.includes("rectangle"))
      break;
  }
  assert.match(g.document.querySelector("#prompt").textContent, /rectangle/);
  g.document.querySelector('.shb[data-v="square"]').click();
  assert.equal(g.run("R.q.tries"), 0);
  assert.equal(g.run("R.q.done"), true);
  assert.match(
    g.document.querySelector("#fbtext").textContent,
    /square.*rectangle/i,
  );
});
test("missing-part help counts the missing part rather than the whole", (t) => {
  const g = setup(t);
  g.run("Math.random=()=>.5;startRound('bonds','bonds.part');R.q.hint()");
  g.tick(5000);
  assert.equal(g.document.querySelectorAll(".cntrow .badge").length, 2);
  assert.equal(g.document.querySelectorAll(".cntrow .cnt").length, 4);
});
test("teen addition help recognizes the ten and counts on from eleven", (t) => {
  const g = setup(t);
  g.run(
    "S.mode=20;Math.random=()=>.5;startRound('add','add20.teen');unlockSpeech()",
  );
  g.spoken.length = 0;
  g.document.querySelector("#countBtn").click();
  g.tick(20000);
  assert.ok(g.spoken.some((text) => text === "eleven"));
  assert.match(
    g.document.querySelector("#helpStatus").textContent,
    /full frame.*ten/i,
  );
  assert.equal(g.document.querySelectorAll(".known-ten .badge").length, 0);
  assert.equal(g.document.querySelectorAll(".tfpair .badge").length, 3);
});
test("building feedback tells the child how many more are needed", (t) => {
  const g = setup(t);
  g.run("Math.random=()=>.5;startRound('tenframe','tenframe.build')");
  g.document.querySelector(".tf-int .tf-cell").click();
  g.document.querySelector("#checkBtn").click();
  g.tick(200);
  assert.match(
    g.document.querySelector("#fbtext").textContent,
    /made 1.*2 more/i,
  );
  assert.equal(
    g.document.querySelectorAll(".tf-int .tf-cell.on").length,
    1,
    "hint must leave the child in control",
  );
});
test("twenty is represented as two tens with zero leftover ones", (t) => {
  const g = setup(t);
  g.run(
    "S.mode=20;learningRecord('tenframe20.ones').level=3;Math.random=()=>.999;startRound('tenframe','tenframe20.ones')",
  );
  assert.match(g.document.querySelector("#prompt").textContent, /20/);
  assert.match(g.document.querySelector("#stage").textContent, /2 tens/);
  assert.ok(g.document.querySelector('.choices [data-v="0"][data-correct]'));
  assert.equal(g.document.querySelectorAll(".tf-cell.on").length, 20);
});
test("zero quantities and taking away all are available at the first level", (t) => {
  const g = setup(t);
  let empty = false,
    noneLeft = false;
  for (let i = 0; i < 70; i++) {
    g.run("startRound('count','count.count')");
    empty ||= g.run('R.q.note.startsWith("0")');
    g.run("startRound('sub','sub.story')");
    noneLeft ||= g.run("/= 0$/.test(R.q.note)");
  }
  assert.equal(empty, true);
  assert.equal(noneLeft, true);
});
test("counting on starts with the larger addend and counting each object stays available", (t) => {
  const g = setup(t);
  g.run(
    "learningRecord('add.story').level=2;Math.random=()=>.5;startRound('add','add.story');unlockSpeech()",
  );
  const [a, b] = g.run("R.q.note").match(/\d+/g).map(Number);
  g.spoken.length = 0;
  g.document.querySelector("#countBtn").click();
  g.tick(20000);
  assert.match(
    g.document.querySelector("#helpStatus").textContent,
    new RegExp(`Start with ${Math.max(a, b)}`),
  );
  assert.equal(
    g.document.querySelectorAll("#stage .badge").length,
    Math.min(a, b),
  );
  g.document.querySelector("#countAllBtn").click();
  g.tick(20000);
  assert.equal(g.document.querySelectorAll("#stage .badge").length, a + b);
});
test("equations can show the total on the left", (t) => {
  const g = setup(t);
  let reverse = false;
  for (let i = 0; i < 50; i++) {
    g.run("startRound('add','add.eq')");
    const eq = g.document.querySelector(".eq");
    if (eq.textContent.startsWith("?=")) {
      g.document.querySelector("[data-correct]").click();
      assert.match(eq.textContent, /^\d+=\d+\+\d+$/);
      reverse = true;
      break;
    }
  }
  assert.equal(reverse, true);
});
test("a zero collection can be submitted without choosing an object", (t) => {
  const g = setup(t);
  g.run("Math.random=()=>0;startRound('count','count.collect')");
  g.document.querySelector("#checkBtn").click();
  assert.equal(g.run("R.q.done"), true);
  assert.equal(g.run("learningRecord('count.collect').independent"), 1);
});
test("pattern mistakes reveal a complete solution and the next question stays fresh", (t) => {
  const g = setup(t);
  g.run("startRound('shapes','shapes.extend')");
  const old = g.run("R.q.signature");
  g.run("ctl.wrong();ctl.wrong()");
  assert.equal(g.document.querySelectorAll(".pattern-slot.blank").length, 0);
  g.run("advance()");
  assert.equal(g.run("R.q.topic"), "shapes.extend");
  assert.notEqual(g.run("R.q.signature"), old);
  g.tick(10000);
  assert.equal(g.run("R.q.assisted"), false);
});

test("an empty ten-frame hint explains zero explicitly", (t) => {
  const g = setup(t);
  g.run(
    "Math.random=()=>0;startRound('tenframe','tenframe.read');unlockSpeech();R.q.hint()",
  );
  g.tick(1000);
  assert.match(
    g.document.querySelector("#helpStatus").textContent,
    /empty.*zero/i,
  );
  assert.equal(g.spoken.filter((text) => text.trim()).length, 0);
});
test("a child can request help before submitting a wrong answer", (t) => {
  const g = setup(t);
  g.run("startRound('count','count.collect')");
  g.document.querySelector("#hintBtn").click();
  assert.equal(g.run("R.q.assisted"), true);
  assert.equal(g.run("R.q.tries"), 0);
});
