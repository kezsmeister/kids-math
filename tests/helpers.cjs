const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { JSDOM } = require(process.env.MATH_GARDEN_JSDOM || "jsdom");
const root = process.env.MATH_GARDEN_SOURCE || path.resolve(__dirname, "..");

function game({
  seed = 7,
  saved,
  reducedMotion = false,
  built = false,
  beforeScripts,
} = {}) {
  const html = fs.readFileSync(
    path.join(root, built ? "dist/math-garden.html" : "index.html"),
    "utf8",
  );
  const dom = new JSDOM(html, {
    url: "https://math-garden.test/",
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  const { window } = dom;
  if (saved !== undefined)
    window.localStorage.setItem(
      "mathgarden.v1",
      typeof saved === "string" ? saved : JSON.stringify(saved),
    );
  let clock = 0,
    nextId = 0,
    random = seed >>> 0;
  const timers = new Map(),
    spoken = [];
  window.setTimeout = (fn, delay = 0) => {
    const id = ++nextId;
    timers.set(id, { fn, at: clock + delay });
    return id;
  };
  window.clearTimeout = (id) => timers.delete(id);
  window.setInterval = (fn, delay) => {
    const id = ++nextId;
    timers.set(id, { fn, at: clock + delay, interval: delay });
    return id;
  };
  window.clearInterval = window.clearTimeout;
  window.Math.random = () =>
    (random = (1664525 * random + 1013904223) >>> 0) / 4294967296;
  window.matchMedia = () => ({ matches: reducedMotion, addEventListener() {} });
  window.speechSynthesis = {
    getVoices: () => [],
    addEventListener() {},
    cancel() {},
    resume() {},
    speak: (u) => spoken.push(u.text),
  };
  window.SpeechSynthesisUtterance = function (text) {
    this.text = text;
  };
  beforeScripts?.(window);
  const context = dom.getInternalVMContext();
  const run = (source) => vm.runInContext(source, context);
  for (const script of window.document.querySelectorAll("script")) {
    const file = script.getAttribute("src");
    run(
      file
        ? fs.readFileSync(path.join(root, file), "utf8")
        : script.textContent,
    );
  }
  function tick(ms) {
    const until = clock + ms;
    for (let limit = 0; limit < 10000; limit++) {
      const due = [...timers]
        .filter(([, t]) => t.at <= until)
        .sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) {
        clock = until;
        return;
      }
      const [id, timer] = due;
      clock = timer.at;
      timers.delete(id);
      if (timer.interval)
        timers.set(id, { ...timer, at: clock + timer.interval });
      timer.fn();
    }
    throw new Error("Runaway timer queue");
  }
  return {
    dom,
    window,
    document: window.document,
    run,
    tick,
    spoken,
    close: () => dom.window.close(),
  };
}
module.exports = { game };
