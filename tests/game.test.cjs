const test = require("node:test");
const assert = require("node:assert/strict");
const { game } = require("./helpers.cjs");

function useGame(t, options) {
  const g = game(options);
  t.after(g.close);
  return g;
}

test("a corrected retry records one question and does not immediately lower difficulty", (t) => {
  const g = useGame(t);
  g.run("sk('sub').lvl=2; startRound('sub'); ctl.wrong(); ctl.correct()");
  assert.equal(g.run("S.skills.sub.att"), 1);
  assert.equal(g.run("S.skills.sub.miss"), 1);
  assert.equal(g.run("S.skills.sub.lvl"), 2);
});

test("a callback from an abandoned round cannot overwrite the next round", (t) => {
  const g = useGame(t);
  g.run(
    "startRound('sub'); later(()=>document.querySelector('#fbtext').textContent='stale hint', 100); goHome(); startRound('add','add.story')",
  );
  g.tick(110);
  assert.notEqual(
    g.document.querySelector("#fbtext").textContent,
    "stale hint",
  );
});

test("answer feedback remains until the child chooses Next", (t) => {
  const g = useGame(t);
  g.run("startRound('sub'); ctl.correct()");
  g.tick(30000);
  assert.equal(g.run("R.idx"), 0);
  assert.equal(
    g.document.querySelector("#nextBtn").classList.contains("show"),
    true,
  );
});

test("addition counting can be replayed after finishing", (t) => {
  const g = useGame(t);
  g.run("startRound('add','add.story')");
  const button = g.document.querySelector("#countBtn");
  button.click();
  g.tick(20000);
  assert.ok(g.document.querySelectorAll("#stage .badge").length > 0);
  button.click();
  assert.equal(
    g.document.querySelectorAll("#stage .badge").length,
    0,
    "replay begins by clearing the previous highlights",
  );
  g.tick(20000);
  assert.ok(g.document.querySelectorAll("#stage .badge").length > 0);
});

test("answering correctly cancels counting before it interrupts the feedback", (t) => {
  const g = useGame(t);
  g.run("startRound('add','add.story')");
  g.document.querySelector("#countBtn").click();
  g.run("ctl.correct()");
  g.tick(2000);
  assert.equal(g.document.querySelectorAll("#stage .badge").length, 0);
});

test("revealing a group after an interrupted hint counts every object", (t) => {
  const g = useGame(t);
  g.run(
    "Math.random=()=>.2; learningRecord('count.give').level=3; startRound('count','count.give')",
  );
  const wrong = [...g.document.querySelectorAll(".gbtn:not([data-correct])")];
  assert.equal(wrong.length, 2);
  wrong[0].click();
  g.tick(500);
  const target = g.document.querySelector(".gbtn[data-correct]");
  assert.equal(target.querySelectorAll(".badge").length, 1);
  wrong[1].click();
  g.tick(20000);
  assert.equal(
    target.querySelectorAll(".badge").length,
    Number(target.dataset.n),
  );
});

test("voice selection exposes its state and retains keyboard focus", (t) => {
  const g = useGame(t);
  g.window.speechSynthesis.getVoices = () => [
    { name: "Samantha", lang: "en-US" },
  ];
  g.document.querySelector("#parentBtn").click();
  const chosen = g.document.querySelector('[data-vi="0"]');
  chosen.focus();
  chosen.click();
  assert.equal(
    g.document.querySelector('[data-vi="0"]').getAttribute("aria-pressed"),
    "true",
  );
  assert.equal(
    g.document.querySelector('[data-vi="-1"]').getAttribute("aria-pressed"),
    "false",
  );
  assert.equal(g.document.activeElement.dataset.vi, "0");
});

test("changing parent settings keeps focus on the chosen control", (t) => {
  const g = useGame(t);
  g.document.querySelector("#parentBtn").click();
  for (const selector of ['[data-pr="6"]', "#pSound", "#pVoice"]) {
    const button = g.document.querySelector(selector);
    button.focus();
    button.click();
    assert.equal(
      g.document.activeElement,
      g.document.querySelector(selector),
      selector,
    );
  }
});

test("a stale scheduled hint cannot appear after a quick correct retry", (t) => {
  const g = useGame(t);
  g.run("startRound('sub'); ctl.wrong(); ctl.correct()");
  const feedback = g.document.querySelector("#fbtext").textContent;
  g.tick(200);
  assert.equal(g.document.querySelector("#fbtext").textContent, feedback);
});

test("saved fields are repaired independently without losing valid progress", (t) => {
  const g = useGame(t, {
    saved: {
      stars: 17,
      stickers: ["🐶", "🐶", "bogus"],
      mode: 99,
      perRound: -2,
      sound: "false",
      skills: { count: { lvl: 8, att: 4, ok: 9, rounds: 2 }, bad: null },
    },
  });
  assert.equal(g.run("S.stars"), 17);
  assert.equal(g.run("S.stickers.length"), 1);
  assert.equal(g.run("S.mode"), 10);
  assert.equal(g.run("S.perRound"), 8);
  assert.equal(g.run("S.sound"), true);
  assert.equal(g.run('sk("count").lvl'), 3);
  assert.equal(g.run('sk("count").ok'), 4);
});

test("ten-frame cells can be activated as labeled native buttons", (t) => {
  const g = useGame(t);
  g.run(
    "startRound('tenframe'); document.querySelector('#stage').replaceChildren(tenFrame({interactive:true}).el)",
  );
  const cells = g.document.querySelectorAll("#stage .tf-cell");
  assert.equal(cells[0].tagName, "BUTTON");
  assert.ok(cells[0].getAttribute("aria-label"));
  assert.equal(cells[0].getAttribute("aria-pressed"), "false");
  cells[0].click();
  assert.equal(cells[0].getAttribute("aria-pressed"), "true");
  cells[0].click();
  assert.equal(cells[0].getAttribute("aria-pressed"), "false");
});

test("subtraction help removes the stated quantity and shows what remains", (t) => {
  const g = useGame(t);
  g.run("startRound('sub','sub.story')");
  const equation = g.document
    .querySelector(".eq")
    .textContent.match(/(\d+)−(\d+)=/);
  const total = Number(equation[1]),
    removed = Number(equation[2]);
  const show = [...g.document.querySelectorAll("button")].find((b) =>
    b.textContent.includes("Show me"),
  );
  assert.ok(show, "A visible demonstration is available");
  show.click();
  g.tick(1500);
  assert.equal(
    g.document.querySelectorAll(".sub-pictures .item").length,
    total,
  );
  assert.equal(
    g.document.querySelectorAll(".sub-pictures .gone").length,
    removed,
  );
  assert.match(
    g.document.querySelector(".sub-caption").textContent,
    new RegExp(`${total - removed} left`),
  );
});

test("shape choices have names before any hint is requested", (t) => {
  const g = useGame(t);
  for (
    let attempt = 0;
    attempt < 30 && !g.document.querySelector(".shb");
    attempt++
  )
    g.run("startRound('shapes')");
  const choices = [...g.document.querySelectorAll(".shb")];
  assert.ok(choices.length >= 3);
  choices.forEach((b) =>
    assert.ok(
      ["circle", "square", "triangle", "rectangle", "hexagon", "star"].includes(
        b.getAttribute("aria-label"),
      ),
    ),
  );
});

test("native keyboard activation opens Parent Corner", (t) => {
  const g = useGame(t);
  g.document.querySelector("#parentBtn").click();
  assert.equal(g.document.querySelector("#par").classList.contains("on"), true);
});

test("different measurement values stay visibly different on narrow portrait screens", (t) => {
  const g = useGame(t);
  g.run(`startRound('compare'); document.querySelector('#stage').replaceChildren();
    { const samples=[.7, (78-35+.5)/58, (94-30+.5)/66, .1];
      Math.random=()=>samples.length?samples.shift():.1;
      measureQ({lvl:3}, document.querySelector('#stage')); }`);
  const animals = [...g.document.querySelectorAll(".msz")];
  assert.equal(animals.length, 2);
  function pixels(style, width, height) {
    const parts = style.match(/[\d.]+(?:vmin|vw|px)/g);
    return Math.min(
      ...parts.map(
        (value) =>
          parseFloat(value) *
          (value.endsWith("vmin")
            ? Math.min(width, height) / 100
            : value.endsWith("vw")
              ? width / 100
              : 1),
      ),
    );
  }
  for (const width of [320, 375, 390]) {
    const small = pixels(animals[0].style.fontSize, width, 844);
    const large = pixels(animals[1].style.fontSize, width, 844);
    assert.ok(
      large - small > 8,
      `Meaningful size difference at ${width}px (got ${large - small})`,
    );
  }
});

test("every activity generates complete questions with valid distinct answer choices", (t) => {
  const g = useGame(t);
  for (const topic of g.run("Object.keys(TOPICS)")) {
    const activity = topic.split(".")[0],
      id = activity.replace(/20$/, "");
    for (const level of [1, 2, 3])
      for (let sample = 0; sample < 8; sample++) {
        g.run(
          `S.mode=${activity.endsWith("20") ? 20 : 10};learningRecord('${topic}').level=${level};startRound('${id}','${topic}')`,
        );
        assert.equal(
          g.run("R.idx"),
          0,
          `${topic}/${level} must generate a question`,
        );
        assert.equal(g.run("R.q.level"), level);
        assert.ok(g.document.querySelector("#prompt").textContent.trim());
        const choices = [...g.document.querySelectorAll(".choices button")].map(
          (b) => b.dataset.v,
        );
        assert.equal(new Set(choices).size, choices.length, topic);
        choices
          .filter((v) => !Number.isNaN(Number(v)))
          .forEach((v) =>
            assert.ok(
              Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) <= 21,
              topic,
            ),
          );
        assert.equal(
          g.document.querySelector("#stage").textContent.includes("NaN"),
          false,
          topic,
        );
        assert.equal(
          g.document.querySelector("#stage").textContent.includes("undefined"),
          false,
          topic,
        );
      }
  }
});

test("a complete round awards once and reload preserves its stars, sticker, and accuracy", (t) => {
  const g = useGame(t);
  g.run("S.perRound=6; startRound('sub')");
  for (let i = 0; i < 6; i++) g.run("ctl.correct(); advance()");
  assert.equal(g.run("S.stars"), 7);
  assert.equal(g.run("S.stickers.length"), 1);
  assert.equal(g.run("S.skills.sub.att"), 6);
  assert.equal(g.run("S.skills.sub.ok"), 6);
  const restored = useGame(t, {
    saved: g.window.localStorage.getItem("mathgarden.v1"),
  });
  assert.equal(restored.run("S.stars"), 7);
  assert.equal(restored.run("S.skills.sub.rounds"), 1);
});

test("malformed storage and unavailable persistence do not prevent play", (t) => {
  for (const saved of [
    "{broken",
    "null",
    "[]",
    '{"skills":null,"stickers":false}',
  ]) {
    const g = useGame(t, { saved });
    g.run("startRound('count')");
    assert.equal(g.run("R.idx"), 0);
  }
  const g = useGame(t);
  g.window.Storage.prototype.setItem = () => {
    throw new Error("storage unavailable");
  };
  assert.doesNotThrow(() => g.run("startRound('sub');ctl.correct()"));
});

test("calm mode follows the system and suppresses confetti without affecting scoring", (t) => {
  const g = useGame(t, { reducedMotion: true });
  assert.equal(g.document.documentElement.classList.contains("calm"), true);
  g.run("startRound('sub');ctl.correct()");
  assert.equal(g.document.querySelectorAll(".confetti").length, 0);
  assert.equal(g.run("S.stars"), 1);
  g.run("S.motion='full';applyMotion()");
  assert.equal(g.document.documentElement.classList.contains("calm"), false);
});
