"use strict";

/* 4. COMPARE */
ACTS.compare = {
  name: "More or Fewer",
  color: ["#ffb02e", "#d1830a"],
  icon: "⚖️",
  skill: "Comparing: more / fewer / same, longer / shorter, bigger / smaller",
  note: "Compares two groups by matching one-to-one, and compares length, height and size.",
  make(c, st) {
    if (c.variant ? c.variant!=="quantity" : Math.random() < (c.lvl === 1 ? 0.3 : 0.4)) return measureQ(c, st);
    const hi = HI[c.lvl];
    const same = c.lvl > 1 && Math.random() < (c.lvl === 2 ? 0.15 : 0.22);
    let a = rnd(1, hi),
      b;
    if (same) b = a;
    else {
      do {
        b = rnd(1, hi);
      } while (b === a || (c.lvl === 1 && Math.abs(a - b) < 2));
    }
    const o1 = pick(OBJ);
    let o2;
    do {
      o2 = pick(OBJ);
    } while (o2 === o1);
    const more = c.lvl === 1 ? Math.random() < 0.75 : Math.random() < 0.5;
    st.dataset.type = "cmp-" + (more ? "more" : "fewer");
    const ans =
      a === b ? "same" : more ? (a > b ? "a" : "b") : a < b ? "a" : "b";
    ctl.ask(
      more
        ? 'Which has <b class="more">more</b>?'
        : 'Which has <b class="less">fewer</b>?',
      (more ? "Which group has more?" : "Which group has fewer?") +
        (c.lvl > 1 ? " Or are they the same?" : ""),
    );
    ctl.note(
      a === b ? `${a} = ${b}  same!` : `${a} and ${b}`,
      a === b
        ? `Both groups have ${W[a]}. They are the same.`
        : `${W[a]} and ${W[b]}. ${more ? W[Math.max(a, b)] + " is more" : W[Math.min(a, b)] + " is fewer"}`,
    );
    const cols = Math.max(a, b, 5);
    const wrap = el("div", "cmp");
    wrap.style.setProperty("--cols", cols);
    const mkRow = (n, e, side) => {
      const r = el("button", "crow");
      r.type = "button";
      r.dataset.side = side;
      if (side === ans) r.dataset.correct = "1";
      r.style.gridTemplateColumns = `repeat(${cols},1fr)`;
      for (let i = 0; i < cols; i++)
        r.appendChild(i < n ? el("div", "item", e) : el("div", "slot"));
      return r;
    };
    const ra = mkRow(a, o1.e, "a"),
      rb = mkRow(b, o2.e, "b");
    const mid = el("div", "cmid");
    mid.style.gridTemplateColumns = `repeat(${cols},1fr)`;
    const lines = [];
    for (let i = 0; i < cols; i++) {
      const l = el("i");
      mid.appendChild(l);
      lines.push(l);
    }
    wrap.append(ra, mid, rb);
    st.appendChild(wrap);
    const rows = [ra, rb];
    let sameBtn = null;
    const pickIt = (side, node) => {
      if (R.q.done || node.classList.contains("soft")) return;
      sfx.pop();
      if (side === ans) {
        node.classList.add("right");
        ctl.correct();
      } else {
        node.classList.add("soft");
        ctl.wrong();
      }
    };
    rows.forEach((r) =>
      r.addEventListener("click", () => pickIt(r.dataset.side, r)),
    );
    if (c.lvl > 1) {
      const sb = el("button", "numbtn wide c4", "＝ same");
      sb.type = "button";
      if (ans === "same") sb.dataset.correct = "1";
      sb.style.fontSize = "clamp(26px,6vmin,46px)";
      sb.addEventListener("click", () => {
        if (R.q.done || sb.classList.contains("soft")) return;
        sfx.pop();
        if (ans === "same") {
          sb.classList.add("right");
          ctl.correct();
        } else {
          sb.classList.add("soft");
          ctl.wrong();
        }
      });
      st.appendChild(sb);
      sameBtn = sb;
    }
    ctl.hint(() => {
      const m = Math.min(a, b);
      seqRun(
        [...Array(m).keys()],
        (i) => {
          lines[i].classList.add("on");
          sfx.tap(i + 1);
        },
        250,
        200,
      );
      later(
        () => {
          [
            [ra, a],
            [rb, b],
          ].forEach(([r, n]) => {
            if (n > m)
              [...r.querySelectorAll(".item")]
                .slice(m)
                .forEach((x) => x.classList.add("extra"));
          });
        },
        250 + m * 250,
      );
    });
    R.q.glow = () => {
      const t =
        ans === "same" ? sameBtn : rows.find((r) => r.dataset.side === ans);
      if (t) t.classList.add("glow");
    };
  },
};
function measureQ(c, st) {
  const kinds = [
    ["longer", "h"],
    ["shorter", "h"],
    ["taller", "v"],
    ["shorter", "v"],
    ["bigger", "s"],
    ["smaller", "s"],
  ];
  const category={length:"h",height:"v",size:"s"}[c.variant];
  const [word, kind] = pick(category?kinds.filter(k=>k[1]===category):kinds);
  st.dataset.type = "meas-" + word;
  const gap = c.lvl === 1 ? 28 : 14;
  const p1 = rnd(35, 92);
  let p2;
  do {
    p2 = rnd(30, 95);
  } while (Math.abs(p1 - p2) < gap);
  const isMore = word === "longer" || word === "taller" || word === "bigger";
  const want = isMore ? Math.max(p1, p2) : Math.min(p1, p2);
  const ans = p1 === want ? "a" : "b";
  const short = Math.min(p1, p2);
  ctl.ask(
    `Which is <b class="${isMore ? "more" : "less"}">${word}</b>?`,
    `Which one is ${word}?`,
  );
  ctl.note(`${word}!`, `This one is ${word}.`);
  const nodes = [];
  const guide = el("div", "guide");
  const hook = (n, side) => {
    n.dataset.side = side;
    if (side === ans) n.dataset.correct = "1";
    nodes.push(n);
    n.addEventListener("click", () => {
      if (R.q.done || n.classList.contains("soft")) return;
      sfx.pop();
      if (side === ans) {
        n.classList.add("right");
        ctl.correct();
      } else {
        n.classList.add("soft");
        ctl.wrong();
      }
    });
  };
  if (kind === "h") {
    const cols = shuffle([
      "#ff86b9",
      "#5cc6ff",
      "#ffb340",
      "#a98bff",
      "#4fd08a",
    ]);
    const cap = pick(["🐍", "🐛", "🚂"]);
    const box = el("div", "mh");
    [
      [p1, cols[0], "a"],
      [p2, cols[1], "b"],
    ].forEach(([p, col, side]) => {
      const r = el("button", "mrow");
      r.type = "button";
      r.setAttribute(
        "aria-label",
        side === "a" ? "Top length" : "Bottom length",
      );
      const bar = el("div", "bar");
      bar.style.width = p + "%";
      bar.style.setProperty("--bc", col);
      bar.innerHTML = `<span class="cap">${cap}</span>`;
      r.appendChild(bar);
      hook(r, side);
      box.appendChild(r);
    });
    st.appendChild(box);
    ctl.hint(() => {
      box.appendChild(guide);
      guide.style.left = `calc(17px + (100% - 34px) * ${short / 100})`;
    });
  } else {
    const box = el("div", "mv");
    const H = "var(--measure-height)";
    if (kind === "v") {
      const fl = shuffle(["🌷", "🌻", "🌼", "🌸"]);
      [
        [p1, "a", fl[0]],
        [p2, "b", fl[1]],
      ].forEach(([p, side, f]) => {
        const b = el("button", "mcol");
        b.type = "button";
        b.setAttribute(
          "aria-label",
          side === "a" ? "Left flower" : "Right flower",
        );
        const hh = el("div", "");
        hh.style.cssText = `height:calc(${H} * ${p / 100});display:flex;align-items:flex-end`;
        hh.innerHTML = `<div class="vbar"><span class="vtop">${f}</span></div>`;
        b.appendChild(hh);
        hook(b, side);
        box.appendChild(b);
      });
      ctl.hint(() => {
        box.appendChild(guide);
        guide.style.bottom = `calc(${H} * ${short / 100})`;
      });
    } else {
      const e = pick(["🐻", "🐘", "🦁", "🐶", "🐱", "🐸"]);
      [
        [p1, "a"],
        [p2, "b"],
      ].forEach(([p, side]) => {
        const h = measurementUnits(p);
        const b = el("button", "msz", e);
        b.type = "button";
        b.setAttribute(
          "aria-label",
          side === "a" ? "Left animal" : "Right animal",
        );
        b.style.fontSize = `min(${h}vmin, ${h * 7}px, ${(h / measurementUnits(95)) * 30}vw)`;
        hook(b, side);
        box.appendChild(b);
      });
      ctl.hint(() => {
        box.appendChild(guide);
        const sh = measurementUnits(short);
        guide.style.bottom = `min(${sh}vmin, ${sh * 7}px, ${(sh / measurementUnits(95)) * 30}vw)`;
      });
    }
    st.appendChild(box);
  }
  R.q.glow = () => {
    const t = nodes.find((n) => n.dataset.side === ans);
    if (t) t.classList.add("glow");
  };
}
