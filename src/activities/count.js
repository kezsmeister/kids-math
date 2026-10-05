"use strict";

ACTS.count = {
  name: "Count",
  color: ["#ff7a6b", "#d4493a"],
  icon: "🍎",
  m20: true,
  skill:
    "Counting objects and subitising (dice patterns, ten frames, groups of five)",
  note: 'Objects are shown in dice / ten-frame / groups-of-five layouts so she can see the number at a glance. A "count together" button highlights each object in turn; then she picks the numeral. Also "which group has N?" and zero.',
  make(c, st) {
    if (["collect", "compose", "conserve", "quick"].includes(c.variant))
      return makeNumberPlay(c, st);
    const lo = loOf(c),
      hi = hiOf(c);
    const o = pick(OBJ);
    const type =
      c.variant ||
      (!c.m20 && c.lvl >= 2 && Math.random() < 0.3 ? "give" : "count");
    st.dataset.type = type;
    if (type === "count") {
      const n = !c.m20 && Math.random() < 0.12 ? 0 : rnd(lo, hi);
      R.q.mathKey = `count:${n}`;
      const kind = pick(kindsFor(c, n));
      st.dataset.kind = kind;
      st.classList.add("cnt-st");
      ctl.ask(
        `<span class="emo">${o.e}</span> How many?`,
        n === 0
          ? `How many ${o.p} are on the plate?`
          : `How many ${o.p} can you see? You can press the button and we will count together.`,
      );
      ctl.note(
        n === 0 ? "0 – none!" : `${n} ${plu(n, o)}`,
        n === 0 ? "zero, none at all" : `${W[n]} ${plu(n, o)}`,
      );
      const lay = layoutFor(n, kind, o.e);
      const items = lay.items;
      st.appendChild(lay.el);
      const run = countTogether(
        st,
        () => {
          if (n === 0) showTeaching("There are none. That is zero.");
          else if (c.m20) countOn(items.slice(0, 10), items.slice(10), 10);
          else if (c.lvl > 1 && n > 5)
            countOn(items.slice(0, 5), items.slice(5), 5);
          else countAll(items);
        },
        () => 1600 + items.length * countGap(),
      );
      if (c.m20 || (c.lvl > 1 && n > 5))
        countTogether(
          st,
          () => countAll(items),
          () => items.length * countGap(),
          "Count each one",
        );
      makeChoices(
        st,
        numOpts(
          n,
          c.m20 ? 11 : 0,
          c.m20 ? 20 : Math.max(hi, n + 2),
          nChoices(c),
        ),
        n,
      );
      ctl.hint(run);
      ctl.reveal(run);
    } else {
      /* "which group has N?" - choose between 2-3 groups, no per-object tapping */
      const t = rnd(2, Math.min(hi, c.lvl === 2 ? 6 : 9));
      R.q.mathKey = `give:${t}`;
      const k = c.lvl === 1 ? 2 : 3;
      const cand = [];
      for (let x = 1; x <= Math.min(hi, 10); x++)
        if (x !== t) cand.push({ x, d: Math.abs(x - t) + Math.random() * 1.5 });
      cand.sort((a, b) => a.d - b.d);
      const nums = shuffle([t, ...cand.slice(0, k - 1).map((q) => q.x)]);
      const kind = nums.every((x) => x <= 6)
        ? pick(["dice", "frame"])
        : "frame";
      ctl.ask(
        `Find <b class="big">${t}</b> <span class="emo">${o.e}</span>`,
        `Which group has ${W[t]} ${o.p}? Tap the group.`,
      );
      ctl.note(`${t} ${plu(t, o)}`, `${W[t]} ${plu(t, o)}`);
      const box = el("div", "gpick");
      const groups = [];
      nums.forEach((x) => {
        const g = el("button", "gbtn");
        g.type = "button";
        const lay = layoutFor(x, kind, o.e);
        g.appendChild(lay.el);
        g.dataset.n = x;
        if (x === t) g.dataset.correct = "1";
        groups.push({ g, items: lay.items, x });
        box.appendChild(g);
        g.addEventListener("click", () => {
          if (R.q.done || g.classList.contains("soft")) return;
          sfx.pop();
          if (x === t) {
            g.classList.add("right");
            ctl.correct();
          } else {
            g.classList.add("soft");
            ctl.wrong();
          }
        });
      });
      st.appendChild(box);
      const target = groups.find((q) => q.x === t);
      const cnt = () => countAll(target.items);
      ctl.hint(cnt);
      ctl.reveal(cnt);
      R.q.glow = () => {
        target.g.classList.add("glow");
      };
    }
  },
};
