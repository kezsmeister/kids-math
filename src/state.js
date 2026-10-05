"use strict";

// Keep the original key so existing gardens survive this update.
const KEY = "mathgarden.v1";
const STICKERS = [
  "🦄",
  "🐶",
  "🐱",
  "🐰",
  "🦋",
  "🐞",
  "🐢",
  "🐙",
  "🦁",
  "🐼",
  "🐸",
  "🐥",
  "🌈",
  "🌻",
  "🍓",
  "🍦",
  "🚀",
  "🎈",
  "🎨",
  "👑",
  "🐬",
  "🦊",
  "🐝",
  "🍭",
];
const SKILL_KEYS = [
  "count",
  "tenframe",
  "bonds",
  "compare",
  "order",
  "add",
  "sub",
  "shapes",
  "count20",
  "tenframe20",
  "order20",
  "add20",
];
const DEFAULTS = () => ({
  stars: 0,
  stickers: [],
  skills: {},
  sound: true,
  voice: true,
  voiceName: "",
  mode: 10,
  perRound: 8,
  motion: "system",
  frameHelpSeen: false,
});
const newSkill = () => ({
  lvl: 1,
  streak: 0,
  miss: 0,
  att: 0,
  ok: 0,
  rounds: 0,
});
const boundedInt = (value, fallback, min = 0, max = Number.MAX_SAFE_INTEGER) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.max(min, Math.min(max, Math.floor(value)))
    : fallback;

function normalizeState(raw) {
  const state = DEFAULTS();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return state;
  state.stars = boundedInt(raw.stars, 0);
  state.stickers = Array.isArray(raw.stickers)
    ? [...new Set(raw.stickers.filter((x) => STICKERS.includes(x)))]
    : [];
  for (const key of ["sound", "voice", "frameHelpSeen"])
    if (typeof raw[key] === "boolean") state[key] = raw[key];
  if (typeof raw.voiceName === "string")
    state.voiceName = raw.voiceName.slice(0, 200);
  if ([10, 20].includes(raw.mode)) state.mode = raw.mode;
  if ([6, 8, 10].includes(raw.perRound)) state.perRound = raw.perRound;
  if (["system", "calm", "full"].includes(raw.motion))
    state.motion = raw.motion;
  for (const key of SKILL_KEYS) {
    const value = raw.skills && raw.skills[key];
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    const att = boundedInt(value.att, 0);
    state.skills[key] = {
      lvl: boundedInt(value.lvl, 1, 1, 3),
      streak: boundedInt(value.streak, 0, 0, 2),
      miss: boundedInt(value.miss, 0, 0, 1),
      att,
      ok: boundedInt(value.ok, 0, 0, att),
      rounds: boundedInt(value.rounds, 0),
    };
  }
  return state;
}
function load() {
  try {
    return normalizeState(JSON.parse(localStorage.getItem(KEY)));
  } catch {
    return DEFAULTS();
  }
}
let S = load();
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
  } catch {}
}
function sk(key) {
  return S.skills[key] || (S.skills[key] = newSkill());
}
