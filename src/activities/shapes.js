"use strict";

/* 8. SHAPES & PATTERNS */
const SHAPE_COL = [
  "#ff86b9",
  "#5cc6ff",
  "#ffb340",
  "#a98bff",
  "#4fd08a",
  "#ff6b6b",
];
const POLY = {
  triangle: [
    [50, 10],
    [92, 86],
    [8, 86],
  ],
  square: [
    [12, 12],
    [88, 12],
    [88, 88],
    [12, 88],
  ],
  rectangle: [
    [4, 26],
    [96, 26],
    [96, 74],
    [4, 74],
  ],
  hexagon: [
    [50, 6],
    [89, 28],
    [89, 72],
    [50, 94],
    [11, 72],
    [11, 28],
  ],
};
function starPts() {
  const p = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 19 : 46,
      a = -Math.PI / 2 + (i * Math.PI) / 5;
    p.push([50 + r * Math.cos(a), 52 + r * Math.sin(a)]);
  }
  return p;
}
function shapeSVG(name, fill, rot = 0, extra = "") {
  let inner;
  const st = `fill="${fill}" stroke="#0002" stroke-width="3" stroke-linejoin="round"`;
  if (name === "circle") inner = `<circle cx="50" cy="50" r="42" ${st}/>`;
  else if (name === "star")
    inner = `<polygon points="${starPts()
      .map((p) => p.join(","))
      .join(" ")}" ${st}/>`;
  else
    inner = `<polygon points="${POLY[name].map((p) => p.join(",")).join(" ")}" ${st}/>`;
  return `<svg viewBox="0 0 100 100"><g transform="rotate(${rot} 50 50)">${inner}</g>${extra}</svg>`;
}
const TOKENS = [
  ["🔴", "🔵", "🟡", "🟢", "🟣", "🟠"],
  ["🐱", "🐶", "🐸", "🐰", "🐥", "🐟"],
  ["🍎", "🍌", "🍇", "🍓", "🍊"],
  ["🔺", "🟦", "⭕", "⭐", "💗", "🟩"],
];
ACTS.shapes = {
  name: "Shapes & Patterns",
  color: ["#f0b429", "#c48a00"],
  icon: '<svg viewBox="0 0 120 50"><circle cx="20" cy="26" r="18" fill="#ff86b9"/><rect x="45" y="8" width="34" height="34" rx="4" fill="#5cc6ff"/><polygon points="102,6 120,44 84,44" fill="#4fd08a"/></svg>',
  skill:
    "Shapes (circle, square, triangle, rectangle…) and repeating patterns (AB, AAB, ABB, ABC)",
  note: "Finds named shapes, counts sides, and completes AB / AAB / ABB / ABC patterns.",
  make(c, st) {
    const r = Math.random();
    const type =
      c.lvl < 3
        ? r < 0.35
          ? "find"
          : "pat"
        : r < 0.3
          ? "find"
          : r < 0.45
            ? "sides"
            : "pat";
    st.dataset.type = "shape-" + type;
    if (type === "find") {
      const pool =
        c.lvl === 1
          ? ["circle", "square", "triangle"]
          : c.lvl === 2
            ? ["circle", "square", "triangle", "rectangle"]
            : ["circle", "square", "triangle", "rectangle", "hexagon", "star"];
      const k = c.lvl === 1 ? 3 : 4;
      const opts = shuffle(pool).slice(0, k);
      const ans = pick(opts);
      const cols = shuffle(SHAPE_COL);
      ctl.ask(`Tap the <b class="big">${ans}</b>`, `Tap the ${ans}.`);
      ctl.note(ans, `This is a ${ans}`);
      const rots = {};
      opts.forEach((o) => {
        rots[o] =
          c.lvl === 3
            ? rnd(-25, 25)
            : o === "rectangle" && Math.random() < 0.5
              ? 90
              : 0;
      });
      const ch = makeChoices(st, opts, ans, {
        btnCls: "shb",
        render: (v, i) => shapeSVG(v, cols[i], rots[v]),
      });
      const lab = () =>
        ch.btns.forEach((b) => {
          if (!b.querySelector(".lab"))
            b.appendChild(el("span", "lab", b.dataset.v));
        });
      ctl.hint(lab);
      ctl.reveal(lab);
    } else if (type === "sides") {
      const nm = pick(["triangle", "square", "rectangle", "hexagon"]);
      const n = POLY[nm].length;
      ctl.ask(
        "How many <b>sides</b>?",
        "How many sides does this shape have? Count along the edges.",
      );
      ctl.note(`${n} sides`, `${W[n]} sides`);
      const pts = POLY[nm];
      let extra = "";
      pts.forEach((p, i) => {
        const q = pts[(i + 1) % pts.length];
        const mx = (p[0] + q[0]) / 2,
          my = (p[1] + q[1]) / 2;
        extra += `<g class="sb" data-i="${i}"><circle cx="${mx}" cy="${my}" r="9" fill="#a98bff"/><text x="${mx}" y="${my + 5}" font-size="14" font-weight="900" fill="#fff" text-anchor="middle">${i + 1}</text></g>`;
      });
      const big = el(
        "div",
        "shapebig",
        shapeSVG(nm, pick(SHAPE_COL), 0, extra),
      );
      st.appendChild(big);
      makeChoices(st, numOpts(n, 3, 6, nChoices(c)), n);
      const hint = () => {
        [...big.querySelectorAll(".sb")].forEach((g) =>
          g.classList.remove("vis"),
        );
        seqRun(
          [...Array(n).keys()],
          (i) => {
            big.querySelector(`.sb[data-i="${i}"]`).classList.add("vis");
            sfx.tap(i + 1);
            say(W[i + 1]);
          },
          countGap(),
        );
      };
      ctl.hint(hint);
      ctl.reveal(hint);
    } else {
      const units =
        c.lvl === 1
          ? ["AB"]
          : c.lvl === 2
            ? ["AB", "AAB", "ABB"]
            : ["AAB", "ABB", "ABC", "AB"];
      const u = pick(units);
      const toks = shuffle(pick(TOKENS));
      const map = { A: toks[0], B: toks[1], C: toks[2] };
      const total = Math.max(6, u.length * 2);
      const seq = [];
      for (let i = 0; i < total; i++) seq.push(map[u[i % u.length]]);
      const bi = c.lvl === 1 ? total - 1 : rnd(u.length, total - 1);
      const ans = seq[bi];
      ctl.ask(
        bi === total - 1
          ? "What comes <b>next</b>?"
          : "What is <b>missing</b>?",
        bi === total - 1
          ? "What comes next in the pattern?"
          : "What is missing in the pattern?",
      );
      ctl.note("It repeats!", "The pattern repeats.");
      const pat = el("div", "pat");
      let unit = null,
        blank = null;
      seq.forEach((t, i) => {
        if (i % u.length === 0) {
          unit = el("div", "punit");
          pat.appendChild(unit);
        }
        const x = el("div", "ptok", i === bi ? "?" : t);
        if (i === bi) {
          x.classList.add("blank");
          blank = x;
        }
        unit.appendChild(x);
      });
      st.appendChild(pat);
      const uniq = [...new Set(u.split("").map((k) => map[k]))];
      const dis = toks.find((t) => !uniq.includes(t));
      const opts = [...uniq, dis];
      const fill = () => {
        blank.textContent = ans;
        blank.classList.remove("blank");
        blank.classList.add("filled");
      };
      makeChoices(st, shuffle(opts), ans, {
        btnCls: "tok",
        drop: blank,
        onRight: fill,
        onReveal: fill,
      });
      const units2 = () => pat.classList.add("showunits");
      ctl.hint(units2);
      ctl.reveal(units2);
    }
  },
};
