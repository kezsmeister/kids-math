const test = require("node:test");
const assert = require("node:assert/strict");
const { game } = require("./helpers.cjs");

// Web Audio is an external device boundary absent from jsdom. Keep its
// asynchronous decoding/resume and scheduled-source lifecycle in this fixture.
function audioGame(
  t,
  {
    saved,
    decodeFails = false,
    blocked = false,
    resumeFails = false,
    built = false,
  } = {},
) {
  const sources = [];
  const g = game({
    saved,
    built,
    beforeScripts(window) {
      delete window.speechSynthesis;
      delete window.SpeechSynthesisUtterance;
      window.AudioContext = class {
        state = "suspended";
        currentTime = 10;
        destination = {};
        async resume() {
          if (resumeFails) throw new Error("Audio is blocked");
          if (!blocked) this.state = "running";
        }
        createBiquadFilter() {
          return { frequency: {}, Q: {}, connect() {} };
        }
        createGain() {
          return { gain: {}, connect() {} };
        }
        async decodeAudioData(bytes) {
          assert.ok(
            bytes.byteLength > 10000,
            "Decodes bundled audio, not an empty unlock sound",
          );
          if (decodeFails) throw new Error("Decode failed");
          return { duration: 1000 };
        }
        createBufferSource() {
          const source = {
            connect() {},
            disconnect() {},
            start(when, offset, duration) {
              assert.ok(duration > 0 && offset >= 0);
              this.scheduled = { when, offset, duration };
            },
            stop() {
              this.stopped = true;
            },
          };
          sources.push(source);
          return source;
        }
      };
    },
  });
  t.after(g.close);
  return { g, sources };
}
const settle = () => new Promise((resolve) => setImmediate(resolve));

test("shape questions start recorded audio even when browser speech is unavailable", async (t) => {
  const { g, sources } = audioGame(t);
  g.run("unlockSpeech();startRound('shapes','shapes.find')");
  g.tick(300);
  await settle();
  assert.ok(
    sources.some((s) => s.scheduled),
    "A real question recording must be scheduled",
  );
  assert.match(
    g.document.querySelector("#speechStatus").textContent,
    /reading/i,
  );
  assert.equal(g.run("R.q.assisted"), false);
});

test("every Shapes & Patterns question has complete recorded coverage at every level", (t) => {
  const { g } = audioGame(t);
  assert.equal(
    g.run("typeof recordedPlan"),
    "function",
    "Offline question reader exists",
  );
  for (const variant of [
    "find",
    "sides",
    "extend",
    "unit",
    "repair",
    "create",
  ]) {
    for (const lvl of [1, 2, 3]) {
      for (let i = 0; i < 12; i++) {
        g.run(
          `startRound('shapes','shapes.${variant}');cancelQuestionWork();ACTS.shapes.make({variant:'${variant}',lvl:${lvl}},document.querySelector('#stage'))`,
        );
        assert.ok(
          g.run("recordedPlan(R.q.speech)?.length > 0"),
          `${variant} level ${lvl}: ${g.run("R.q.speech")}`,
        );
      }
    }
  }
});

test("Read question works while automatic reading is off and keeps the original question after help", async (t) => {
  const { g, sources } = audioGame(t, { saved: { voice: false } });
  g.run("startRound('shapes','shapes.find')");
  g.tick(300);
  await settle();
  assert.equal(sources.length, 0);
  const original = g.run("R.q.speech");
  g.document.querySelector("#hintBtn").click();
  const button = g.document.querySelector("#readQuestionBtn");
  assert.ok(button, "An explicit Read question button is available");
  button.click();
  await settle();
  assert.ok(sources.some((s) => s.scheduled));
  assert.equal(g.run("R.q.questionSpeech"), original);
  assert.equal(g.run("S.voice"), false);
});

test("leaving during audio decoding prevents stale question playback", async (t) => {
  const { g, sources } = audioGame(t);
  g.run("unlockSpeech();startRound('shapes','shapes.extend')");
  g.tick(300);
  g.run("goHome()");
  await settle();
  assert.equal(sources.filter((s) => s.scheduled).length, 0);
});

test("replay replaces all scheduled pattern clips and Home stops them", async (t) => {
  const { g, sources } = audioGame(t);
  g.run("unlockSpeech();startRound('shapes','shapes.extend')");
  g.tick(300);
  await settle();
  assert.ok(
    sources.length > 3,
    "The complete pattern has multiple recorded segments",
  );
  const previous = [...sources];
  g.document.querySelector("#replayBtn").click();
  await settle();
  assert.ok(previous.every((s) => s.stopped));
  g.run("goHome()");
  assert.ok(sources.every((s) => s.stopped));
});

for (const failure of ["decodeFails", "blocked", "resumeFails"]) {
  test(`audio ${failure} gives a visible retry instruction instead of silent success`, async (t) => {
    const { g, sources } = audioGame(t, { [failure]: true });
    g.run("unlockSpeech();startRound('shapes','shapes.find')");
    g.tick(300);
    await settle();
    assert.equal(sources.filter((s) => s.scheduled).length, 0);
    assert.match(
      g.document.querySelector("#speechStatus")?.textContent || "",
      /tap.*read question/i,
    );
  });
}
