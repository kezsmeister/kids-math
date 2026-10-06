"use strict";

ACTS.add = {
  name: "Add",
  color: ["#ff6fa3", "#d13e78"],
  icon: '<div style="font-size:.8em;text-shadow:0 3px 0 #0003;white-space:nowrap">🦆➕🦆</div>',
  skill: "Addition as joining visible groups",
  note: "Join two small picture groups and choose how many altogether. Counting together is always available.",
  make(c, st) {
    st.classList.add("add-st");
    const hi = HI[c.lvl];
    const tot = rnd(2, hi);
    const a = Math.random() < 0.12 ? 0 : rnd(1, tot - 1),
      b = tot - a;
    R.q.mathKey = `add:${a}:${b}`;
    st.dataset.type = "add-story";
    const o = pick(OBJ);
    ctl.note(`${a} + ${b} = ${tot}`, `${W[a]} plus ${W[b]} equals ${W[tot]}`);
    const gap = () => countGap();
    const kind = Math.max(a, b) <= 6 ? pick(["dice", "frame"]) : "frame";
    ctl.ask(
      `<span class="emo">${o.e}</span> How many altogether?`,
      `${W[a]} and ${W[b]} more. How many altogether?`,
    );
    const grp = addGroups(a, b, o.e, o.e, kind);
    st.appendChild(grp.row);
    const items = grp.items;
    const hint = countTogether(
      st,
      () => {
        if (c.lvl === 1) countAll(items, grp.split);
        else {
          const first = items.slice(0, grp.split),
            second = items.slice(grp.split);
          countOn(
            a >= b ? first : second,
            a >= b ? second : first,
            Math.max(a, b),
          );
        }
      },
      () => items.length * gap() + 1600,
    );
    if (c.lvl > 1)
      countTogether(
        st,
        () => countAll(items, grp.split),
        () => items.length * gap(),
        "Count each one",
      );
    makeChoices(st, numOpts(tot, 0, hi, nChoices(c)), tot);
    ctl.hint(hint);
    ctl.reveal(hint);
  },
};
