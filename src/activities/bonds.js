"use strict";

/* 3. NUMBER BONDS */
ACTS.bonds = {
  name: "Number Bonds",
  color: ["#a98bff", "#7455d6"],
  icon: '<svg viewBox="0 0 100 80"><g stroke="#fff" stroke-width="6"><path d="M50 22L24 56M50 22L76 56"/></g><circle cx="50" cy="20" r="17" fill="#fff"/><circle cx="24" cy="58" r="17" fill="#ff5a5f"/><circle cx="76" cy="58" r="17" fill="#ffd23f"/></svg>',
  skill: "Part-whole thinking with number bonds",
  note: "Finds the missing part or whole in a number bond circle diagram, with counters shown. Drag (or tap) the answer tile.",
  make(c, st) {
    const hi = HI[c.lvl];
    const w = rnd(c.lvl === 1 ? 2 : 3, hi);
    const zeroOk = c.lvl === 3 && Math.random() < 0.12;
    const a = zeroOk ? rnd(0, w) : rnd(1, w - 1);
    const b = w - a;
    const r = Math.random();
    const miss =
      c.lvl === 1
        ? r < 0.5
          ? "w"
          : r < 0.75
            ? "a"
            : "b"
        : r < 0.3
          ? "w"
          : r < 0.65
            ? "a"
            : "b";
    st.dataset.type = "bond-" + miss;
    const ans = miss === "w" ? w : miss === "a" ? a : b;
    const vals = { w, a, b };
    const bond = el("div", "bond");
    bond.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none"><g stroke="#b7a7e6" stroke-width="5" stroke-linecap="round"><line x1="50" y1="22" x2="22" y2="78" vector-effect="non-scaling-stroke"/><line x1="50" y1="22" x2="78" y2="78" vector-effect="non-scaling-stroke"/></g></svg>`;
    const mk = (k, cls) => {
      const d = el("div", "bc " + cls, miss === k ? "?" : vals[k]);
      if (miss === k) d.classList.add("blank");
      return d;
    };
    const cw = mk("w", "whole"),
      ca = mk("a", "pa"),
      cb = mk("b", "pb");
    bond.append(cw, ca, cb);
    const blank = miss === "w" ? cw : miss === "a" ? ca : cb;
    st.appendChild(bond);
    const row = el("div", "cntrow");
    const cnts = [];
    const build = (reveal) => {
      row.innerHTML = "";
      cnts.length = 0;
      for (let i = 0; i < w; i++) {
        if (i === a && a > 0) row.appendChild(el("span", "sp"));
        let cls;
        if (miss === "w" || reveal) cls = i < a ? "red" : "yellow";
        else if (miss === "a") cls = i < a ? "ghost" : "yellow";
        else cls = i < a ? "red" : "ghost";
        const x = el("span", "cnt " + cls);
        row.appendChild(x);
        cnts.push(x);
      }
    };
    build(false);
    st.appendChild(row);
    if (miss === "w")
      ctl.ask(
        "Put the parts together",
        "The two parts. What do they make together? Drag the number to the question mark.",
      );
    else
      ctl.ask(
        "Find the missing part",
        "The whole is " +
          W[w] +
          ". One part is " +
          W[miss === "a" ? b : a] +
          ". What is the missing part? Drag the number to the question mark.",
      );
    ctl.note(`${a} + ${b} = ${w}`, `${W[a]} and ${W[b]} make ${W[w]}`);
    const fill = () => {
      blank.textContent = ans;
      blank.classList.remove("blank");
      blank.classList.add("filled");
    };
    makeChoices(
      st,
      numOpts(
        ans,
        miss === "w" ? 1 : 0,
        miss === "w" ? Math.max(hi, w) + 1 : w,
        nChoices(c),
      ),
      ans,
      { drop: blank, onRight: fill, onReveal: fill },
    );
    ctl.hint(() => {
      build(true);
      seqRun(
        cnts,
        (x, i) => {
          x.appendChild(badgeEl(i + 1));
          sfx.tap(i + 1);
          say(W[i + 1]);
        },
        countGap(),
      );
    });
    ctl.reveal(() => {
      build(true);
    });
  },
};
