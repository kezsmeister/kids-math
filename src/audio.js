"use strict";

/* ---------- audio (soft sine/triangle chimes; started only after a user tap) ---------- */
let AC = null,
  MASTER = null;
function ac() {
  if (!AC) {
    try {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      const lp = AC.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 2200;
      lp.Q.value = 0.3;
      MASTER = AC.createGain();
      MASTER.gain.value = 0.9;
      MASTER.connect(lp);
      lp.connect(AC.destination);
    } catch (e) {
      AC = null;
      MASTER = null;
    }
  }
  if (AC && AC.state !== "running") {
    try {
      AC.resume().catch(() => {});
    } catch (e) {}
  }
  return AC;
}
/* one soft note: slow attack, gentle exponential release, optional quiet 2nd harmonic for a "chime" colour */
function tone(
  f,
  t = 0,
  d = 0.35,
  type = "sine",
  v = 0.05,
  att = 0.04,
  bell = 0,
) {
  if (!S.sound) return;
  const a = ac();
  if (!a || !MASTER) return;
  if (type !== "triangle") type = "sine";
  try {
    const t0 = a.currentTime + t + 0.005;
    const voice = (freq, vol) => {
      const o = a.createOscillator(),
        g = a.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(vol, t0 + att);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + att + d);
      o.connect(g);
      g.connect(MASTER);
      o.start(t0);
      o.stop(t0 + att + d + 0.05);
    };
    voice(f, v);
    if (bell) voice(f * 2, v * bell);
  } catch (e) {}
}
const NT = {
  A4: 440,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
  A5: 880,
  C6: 1046.5,
  E6: 1318.5,
};
const sfx = {
  tap(i = 0) {
    tone(392 + Math.min(i, 20) * 22, 0, 0.22, "sine", 0.04, 0.03);
  },
  pop() {
    tone(523.25, 0, 0.14, "sine", 0.035, 0.02);
  },
  ok() {
    [NT.C5, NT.E5, NT.G5].forEach((f, i) =>
      tone(f, i * 0.13, 0.8, "sine", 0.05, 0.05, 0.25),
    );
  },
  oops() {
    tone(220, 0, 0.6, "sine", 0.03, 0.12);
  },
  win() {
    [NT.C5, NT.E5, NT.G5, NT.C6].forEach((f, i) =>
      tone(f, i * 0.18, 1.0, "sine", 0.05, 0.06, 0.25),
    );
  },
  up() {
    [NT.G5, NT.C6, NT.E6].forEach((f, i) =>
      tone(f, i * 0.14, 0.7, "sine", 0.04, 0.05, 0.2),
    );
  },
};

/* ---------- device speech fallback and voice previews ---------- */
const EN_LANG = /^en[-_](us|gb|au|ie|za|in)$/i;
/* known female voices, best first (iOS/macOS, Google, Microsoft) */
const VOICE_PREF = [
  "samantha",
  "ava",
  "allison",
  "susan",
  "karen",
  "moira",
  "tessa",
  "serena",
  "kate",
  "fiona",
  "nicky",
  "zoe",
  "victoria",
  "joelle",
  "catherine",
  "google uk english female",
  "google us english",
  "zira",
  "aria",
  "jenny",
  "michelle",
  "sonia",
];
/* known male voices - never used automatically */
const MALE_RE =
  /(^|[^a-z])(daniel|alex|fred|oliver|rishi|aaron|arthur|gordon|tom|lee|ralph|evan|reed|david|mark|george|guy|ryan|eric|thomas|junior|bruce|nathan|eddy|rocko|grandpa)([^a-z]|$)/i;
/* Eloquence / novelty voices - never used */
const NOVELTY_RE =
  /eloquence|(^|[^a-z])(bells|bad\s+news|bahh|boing|bubbles|cellos|good\s+news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|albert|deranged|hysterical|pipe\s+organ|flo|sandy|shelley|grandma|grandpa|eddy|reed|rocko)([^a-z]|$)/i;
const isMaleName = (n) =>
  MALE_RE.test(n) || (/male/i.test(n) && !/female/i.test(n));
const isNovelty = (n) => NOVELTY_RE.test(n);
const vQuality = (v) =>
  /premium/i.test(v.name)
    ? 3
    : /enhanced|natural|neural|online/i.test(v.name)
      ? 2
      : /compact/i.test(v.name)
        ? 0
        : 1;
const prefIndex = (v) => {
  const n = v.name;
  for (let i = 0; i < VOICE_PREF.length; i++) {
    if (
      new RegExp("(^|[^a-z])" + VOICE_PREF[i].replace(/ /g, "\\s+"), "i").test(
        n,
      )
    )
      return i;
  }
  return -1;
};
let voiceObj = null,
  voiceFemale = true,
  speechOK = "speechSynthesis" in window,
  speechUnlocked = false,
  lastUtt = null;
function englishVoices() {
  let all = [];
  try {
    all = speechSynthesis.getVoices() || [];
  } catch (e) {}
  return all.filter((v) => EN_LANG.test(v.lang || ""));
}
/* auto choice: best known female voice; otherwise best-quality English voice that isn't male/novelty (then pitch is raised) */
function autoVoice(en) {
  const ok = en.filter((v) => !isNovelty(v.name) && !isMaleName(v.name));
  const known = ok
    .filter((v) => prefIndex(v) >= 0)
    .sort(
      (x, y) =>
        prefIndex(x) - prefIndex(y) ||
        vQuality(y) - vQuality(x) ||
        (/^en[-_]us$/i.test(y.lang) ? 1 : 0) -
          (/^en[-_]us$/i.test(x.lang) ? 1 : 0),
    );
  if (known.length) return { v: known[0], female: true };
  const rest = ok.slice().sort((x, y) => vQuality(y) - vQuality(x));
  return rest.length
    ? { v: rest[0], female: /female/i.test(rest[0].name) }
    : null;
}
function pickVoice() {
  if (!speechOK) return;
  try {
    const en = englishVoices();
    if (!en.length) return;
    let v = null,
      female = true;
    if (S.voiceName) {
      const m = en.filter((x) => x.name === S.voiceName);
      if (m.length) {
        v = m[0];
        female = prefIndex(v) >= 0 || /female/i.test(v.name);
      }
    }
    if (!v) {
      const a = autoVoice(en);
      if (a) {
        v = a.v;
        female = a.female;
      }
    }
    if (v) {
      voiceObj = v;
      voiceFemale = female;
    }
  } catch (e) {}
}
try {
  pickVoice();
  const onv = () => {
    pickVoice();
    if (typeof refreshVoiceList === "function") refreshVoiceList();
  };
  if (speechSynthesis.addEventListener)
    speechSynthesis.addEventListener("voiceschanged", onv);
  else speechSynthesis.onvoiceschanged = onv;
  [300, 1000, 2500].forEach((ms) =>
    setTimeout(() => {
      if (!voiceObj) onv();
    }, ms),
  ); /* iOS/Safari may load voices lazily without an event */
} catch (e) {
  speechOK = false;
}
/* iOS only allows speech after a real tap: speak one silent utterance on the first tap to unlock it */
function unlockSpeech() {
  if (speechUnlocked || !speechOK) return;
  speechUnlocked = true;
  try {
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    speechSynthesis.speak(u);
  } catch (e) {}
}
/* speak text; voice/female override is used by the parent corner's sample buttons */
function speak(t, v, female) {
  if (!t) return;
  if (!v && R?.q && playRecording(t)) return;
  stopRecording();
  if (!speechOK || !speechUnlocked) {
    if (R?.q?.questionSpeech)
      speechStatus("Audio couldn’t start. Tap Read question to try again.");
    return;
  }
  try {
    if (!v) {
      if (!voiceObj) pickVoice();
      v = voiceObj;
      female = voiceFemale;
    }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(
      String(t)
        .replace(/−/g, " minus ")
        .replace(/\+/g, " plus ")
        .replace(/=/g, " equals "),
    );
    u.rate = 0.85;
    u.pitch = v && female === false ? 1.25 : 1.1;
    u.volume = 1;
    if (v) {
      u.voice = v;
      u.lang = v.lang || "en-US";
    } else {
      u.lang = "en-US";
      u.pitch = 1.25;
    }
    lastUtt =
      u; /* keep a reference: Safari can drop utterances that get garbage-collected */
    speechSynthesis.speak(u);
    if (speechSynthesis.paused) speechSynthesis.resume();
  } catch (e) {}
}
function stopSpeaking() {
  stopRecording();
  try {
    speechSynthesis.cancel();
  } catch {}
}
const motionQuery = window.matchMedia
  ? window.matchMedia("(prefers-reduced-motion: reduce)")
  : null;
function reducedMotion() {
  return (
    S.motion === "calm" || (S.motion === "system" && !!motionQuery?.matches)
  );
}
function applyMotion() {
  document.documentElement.classList.toggle("calm", reducedMotion());
}
if (motionQuery?.addEventListener)
  motionQuery.addEventListener("change", applyMotion);
