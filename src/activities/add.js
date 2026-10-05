"use strict";

ACTS.add = {
  name: "Add",
  color: ["#ff6fa3", "#d13e78"],
  icon: '<div style="font-size:.8em;text-shadow:0 3px 0 #0003;white-space:nowrap">🦆➕🦆</div>',
  m20: true,
  m20name: "Add to Ten",
  skill: "Addition as putting together (picture stories, groups, equations)",
  note: 'Picture story (3 ducks + 2 more) or the number sentence 3 + 2 = ? with two colour-coded groups shown in dice / ten-frame layouts; optional "count together" button; later a missing addend. 11–20: 10 + ones. No tapping or dragging of items.',
  make(c, st) {
    st.classList.add("add-st");
    if (c.m20) return addTeen(c, st);
    const hi = HI[c.lvl];
    const tot = rnd(2, hi);
    const a = rnd(1, tot - 1),
      b = tot - a;
    const r = Math.random();
    const type =
      c.lvl === 1
        ? "story"
        : c.lvl === 2
          ? r < 0.5
            ? "story"
            : "eq"
          : r < 0.15
            ? "story"
            : r < 0.6
              ? "eq"
              : "miss";
    st.dataset.type = "add-" + type;
    const o = pick(OBJ);
    ctl.note(`${a} + ${b} = ${tot}`, `${W[a]} plus ${W[b]} equals ${W[tot]}`);
    const gap = () => countGap();
    if (type === "miss") {
      ctl.ask(
        `<b>${a}</b> + <b class="big">?</b> = <b>${tot}</b>`,
        `${W[a]} and how many more make ${W[tot]}? You can press the button and we will count together.`,
      );
      const eq = el(
        "div",
        "eq",
        `<span class="a">${a}</span><span class="op">+</span><span class="q">?</span><span class="op">=</span><span>${tot}</span>`,
      );
      st.appendChild(eq);
      const row = el("div", "cntrow");
      const cn = [];
      for (let i = 0; i < tot; i++) {
        const x = el("span", "cnt " + (i < a ? "red" : "empty"));
        row.appendChild(x);
        cn.push(x);
      }
      st.appendChild(row);
      const hint = countTogether(
        st,
        () => {
          cn.slice(a).forEach((x) => {
            x.className = "cnt empty";
            x.replaceChildren();
          });
          seqRun(
            cn.slice(a),
            (x, i) => {
              x.className = "cnt yellow";
              x.appendChild(badgeEl(i + 1, "b2"));
              sfx.tap(i + 1);
              say(W[i + 1]);
            },
            gap(),
          );
        },
        () => b * gap() + 300,
      );
      const fillQ = () => {
        const q = $(".q", eq);
        q.textContent = b;
        q.classList.add("filled");
      };
      makeChoices(st, numOpts(b, 1, tot, nChoices(c)), b, {
        onRight: fillQ,
        onReveal: fillQ,
      });
      ctl.hint(hint);
      ctl.reveal(hint);
      return;
    }
    const kind = Math.max(a, b) <= 6 ? pick(["dice", "frame"]) : "frame";
    let grp,
      eq = null;
    if (type === "story") {
      ctl.ask(
        `<span class="emo">${o.e}</span> How many altogether?`,
        `${W[a]} ${plu(a, o)}. ${W[b]} more ${plu(b, o)} come. How many ${o.p} altogether? You can press the button and we will count together.`,
      );
      grp = addGroups(a, b, o.e, o.e, kind);
      st.appendChild(grp.row);
      st.appendChild(
        el(
          "div",
          "fbtext",
          `<span style="font-size:.6em;opacity:.7">${a} ${plu(a, o)} and ${b} more</span>`,
        ),
      );
    } else {
      ctl.ask(
        `<b>${a}</b> + <b>${b}</b> = <b class="big">?</b>`,
        `${W[a]} plus ${W[b]} equals how many? You can press the button and we will count together.`,
      );
      eq = el(
        "div",
        "eq",
        `<span class="a">${a}</span><span class="op">+</span><span class="b">${b}</span><span class="op">=</span><span class="q">?</span>`,
      );
      st.appendChild(eq);
      grp = addGroups(
        a,
        b,
        '<span class="cnt red"></span>',
        '<span class="cnt yellow"></span>',
        kind,
      );
      st.appendChild(grp.row);
    }
    const items = grp.items;
    const hint = countTogether(
      st,
      () => countAll(items, grp.split),
      () => items.length * gap() + 300,
    );
    const fillQ = () => {
      if (eq) {
        const q = $(".q", eq);
        q.textContent = tot;
        q.classList.add("filled");
      }
    };
    makeChoices(st, numOpts(tot, 2, Math.max(hi, tot + 1), nChoices(c)), tot, {
      onRight: fillQ,
      onReveal: fillQ,
    });
    ctl.hint(hint);
    ctl.reveal(hint);
  },
};
function addTeen(c, st) {
  const hi = hiOf(c);
  const n = rnd(11, hi),
    k = n - 10;
  st.dataset.type = "add-teen";
  ctl.note(`10 + ${k} = ${n}`, `ten plus ${W[k]} equals ${W[n]}`);
  ctl.ask(
    `<b>10</b> + <b>${k}</b> = <b class="big">?</b>`,
    `Ten plus ${W[k]} equals how many? You can press the button and we will count together.`,
  );
  const wrap = el("div", "tfpair");
  const f1 = tenFrame({ n: 10 }),
    f2 = tenFrame({ n: k });
  const mkw = (f, l) => {
    const w = el("div", "tfwrap");
    w.appendChild(f.el);
    w.appendChild(el("div", "lbl", l));
    return w;
  };
  wrap.append(mkw(f1, "ten"), mkw(f2, "ones"));
  st.appendChild(wrap);
  const eq = el(
    "div",
    "eq",
    `<span class="a">10</span><span class="op">+</span><span class="b">${k}</span><span class="op">=</span><span class="q">?</span>`,
  );
  st.appendChild(eq);
  const gap = () => countGap() * 0.8;
  const hint = countTogether(
    st,
    () => {
      f1.clearBadges();
      f2.clearBadges();
      seqRun(
        [...Array(n).keys()],
        (i) => {
          i < 10 ? f1.badge(i, i + 1) : f2.badge(i - 10, i + 1, "b2");
          sfx.tap(i + 1);
          say(W[i + 1]);
        },
        gap(),
      );
    },
    () => n * gap() + 300,
  );
  const fillQ = () => {
    const q = $(".q", eq);
    q.textContent = n;
    q.classList.add("filled");
  };
  makeChoices(st, numOpts(n, 11, 20, nChoices(c)), n, {
    onRight: fillQ,
    onReveal: fillQ,
  });
  ctl.hint(hint);
  ctl.reveal(hint);
}
