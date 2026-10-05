"use strict";

/* ---------- objects ---------- */
const OBJ = [
  { e: "🦆", s: "duck", p: "ducks", v: "swim away" },
  { e: "🐥", s: "chick", p: "chicks", v: "fly away" },
  { e: "🐟", s: "fish", p: "fish", v: "swim away" },
  { e: "🍎", s: "apple", p: "apples", v: "get eaten" },
  { e: "🎈", s: "balloon", p: "balloons", v: "pop" },
  { e: "🐸", s: "frog", p: "frogs", v: "hop away" },
  { e: "🦋", s: "butterfly", p: "butterflies", v: "fly away" },
  { e: "🍓", s: "strawberry", p: "strawberries", v: "get eaten" },
  { e: "🐞", s: "ladybug", p: "ladybugs", v: "fly away" },
  { e: "🌸", s: "flower", p: "flowers", v: "get picked" },
  { e: "⭐", s: "star", p: "stars", v: "fall down" },
  { e: "🍪", s: "cookie", p: "cookies", v: "get eaten" },
  { e: "🐰", s: "bunny", p: "bunnies", v: "hop away" },
  { e: "🐱", s: "kitten", p: "kittens", v: "run away" },
];
const plu = (n, o) => (n === 1 ? o.s : o.p);
/* counting highlight: a soft ring around the object - deliberately NO numbers/sequence strip */
const badgeEl = (n, c) => el("span", "badge" + (c ? " " + c : ""), "");

function numOpts(ans, lo, hi, k) {
  const pool = [];
  for (let x = lo; x <= hi; x++)
    if (x !== ans) pool.push({ x, k: Math.abs(x - ans) + Math.random() * 1.6 });
  pool.sort((a, b) => a.k - b.k);
  return shuffle([ans, ...pool.slice(0, k - 1).map((p) => p.x)]);
}
const HI = [0, 5, 8, 10];
const hiOf = (c) => (c.m20 ? [0, 14, 17, 20][c.lvl] : HI[c.lvl]);
const loOf = (c) => (c.m20 ? 11 : 1);
const nChoices = (c) => (c.lvl === 1 ? 3 : 4);

const ACTS = {};

// Every responsive constraint uses this same ratio; clamping cannot make
// two distinct generated measurement values visually equal.
function measurementUnits(value) {
  return 14 + value * 0.3;
}
