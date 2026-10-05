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
function shapeSVG(name, fill, rot = 0, extra = "", points = null) {
  let inner;
  const st = `fill="${fill}" stroke="#0002" stroke-width="3" stroke-linejoin="round"`;
  if (name === "circle") inner = `<circle cx="50" cy="50" r="42" ${st}/>`;
  else if (name === "star")
    inner = `<polygon points="${starPts()
      .map((p) => p.join(","))
      .join(" ")}" ${st}/>`;
  else
    inner = `<polygon points="${(points || POLY[name]).map((p) => p.join(",")).join(" ")}" ${st}/>`;
  return `<svg viewBox="-15 -15 130 130"><g transform="rotate(${rot} 50 50)">${inner}</g>${extra}</svg>`;
}
const SHAPE_DESCRIPTION = {
  circle: "A circle has a curved edge and no corners.",
  triangle: "A triangle has three straight sides and three corners.",
  square:
    "A square has four equal straight sides and four right-angle corners.",
  rectangle:
    "A rectangle has four straight sides and four right-angle corners. A square is a special rectangle too.",
  hexagon: "A hexagon has six straight sides.",
  star: "This star has five points. Look for the pointed tips.",
};
ACTS.shapes = {
  name: "Shapes & Patterns",
  color: ["#f0b429", "#c48a00"],
  icon: '<svg viewBox="0 0 120 50"><circle cx="20" cy="26" r="18" fill="#ff86b9"/><rect x="45" y="8" width="34" height="34" rx="4" fill="#5cc6ff"/><polygon points="102,6 120,44 84,44" fill="#4fd08a"/></svg>',
  skill:
    "Shapes (circle, square, triangle, rectangle…) and repeating patterns (AB, AAB, ABB, ABC)",
  note: "Finds named shapes, counts sides, and completes AB / AAB / ABB / ABC patterns.",
  make(c, st) {
    if (["extend", "unit", "repair", "create"].includes(c.variant))
      return makePattern(c, st);
    const r = Math.random();
    const type = c.variant
      ? c.variant === "extend"
        ? "pat"
        : c.variant
      : c.lvl < 3
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
      ctl.note(ans, `This is a ${ans}. ${SHAPE_DESCRIPTION[ans]}`);
      const rots = {};
      opts.forEach((o) => {
        rots[o] = rnd(-180, 180);
      });
      const ch = makeChoices(st, opts, ans, {
        btnCls: "shb",
        accept: (v) => v === ans || (ans === "rectangle" && v === "square"),
        onRight: (b) => {
          if (ans === "rectangle" && b.dataset.v === "square")
            ctl.note(
              "A square is a rectangle too.",
              "A square is a special rectangle. It has four right-angle corners.",
            );
        },
        render: (v, i) =>
          shapeSVG(
            v,
            cols[i],
            rots[v],
            "",
            v === "triangle"
              ? pick([
                  POLY.triangle,
                  [
                    [15, 15],
                    [15, 85],
                    [85, 85],
                  ],
                  [
                    [50, 5],
                    [66, 88],
                    [34, 88],
                  ],
                  [
                    [10, 65],
                    [88, 82],
                    [69, 12],
                  ],
                ])
              : null,
          ),
      });
      const lab = () =>
        ch.btns.forEach((b) => {
          if (!b.querySelector(".lab"))
            b.appendChild(el("span", "lab", b.dataset.v));
        });
      ctl.hint(() => {
        lab();
        R.q.speech = SHAPE_DESCRIPTION[ans];
        showTeaching(R.q.speech);
      });
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
        R.q.speech = `Count the straight sides: ${Array.from({ length: n }, (_, i) => W[i + 1]).join(", ")}. ${W[n]} sides.`;
        showTeaching("Let’s count each straight side once.");
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
          2000,
        );
      };
      ctl.hint(hint);
      ctl.reveal(() => {
        big
          .querySelectorAll(".sb")
          .forEach((side) => side.classList.add("vis"));
      });
    }
  },
};
