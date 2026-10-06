"use strict";

/* 2. TEN FRAME */
ACTS.tenframe = {
  name: "Ten Frame",
  color: ["#3fbf7f", "#278f5b"],
  icon: '<svg viewBox="0 0 100 46"><rect x="2" y="2" width="96" height="42" rx="6" fill="#fff"/><g stroke="#3fbf7f" stroke-width="3"><path d="M22 2v42M41 2v42M60 2v42M79 2v42M2 23h96"/></g><g fill="#ff5a5f"><circle cx="12" cy="12" r="6"/><circle cx="31" cy="12" r="6"/><circle cx="50" cy="12" r="6"/><circle cx="69" cy="12" r="6"/><circle cx="88" cy="12" r="6"/><circle cx="12" cy="34" r="6"/><circle cx="31" cy="34" r="6"/></g></svg>',
  m20: true,
  m20name: "Tens & Ones",
  skill: "Ten frames: reading, building, making 10 (11–20: tens and ones)",
  note: "Reads and builds numbers on a ten frame and finds how many more make 10. In 11–20 mode: one full ten plus ones.",
  make(c, st) {
    if (c.m20) return teenFrames(c, st);
    const hi = HI[c.lvl],
      r = Math.random();
    let type;
    if (c.variant) type = c.variant;
    else if (c.lvl === 1) type = r < 0.5 ? "read" : "build";
    else if (c.lvl === 2) type = r < 0.3 ? "read" : r < 0.65 ? "build" : "more";
    else type = r < 0.2 ? "read" : r < 0.5 ? "build" : "more";
    st.dataset.type = type;
    if (type === "read") {
      const n = rnd(0, hi);
      const f = tenFrame({ n });
      ctl.ask(
        'How many <span class="emo">🔴</span>?',
        "How many counters are there?",
      );
      ctl.note(`${n}`, W[n]);
      st.appendChild(f.el);
      makeChoices(st, numOpts(n, 0, Math.max(hi, n + 2), nChoices(c)), n);
      const hint = () => {
        f.clearBadges();
        if (n === 0) {
          showTeaching("The frame is empty. No counters means zero.");
          return;
        }
        seqRun(
          f.cells.slice(0, n),
          (cell, i) => {
            f.badge(i, i + 1);
            sfx.tap(i + 1);
            helpSpeak(W[i + 1]);
          },
          countGap(),
        );
      };
      ctl.hint(hint);
      ctl.reveal(hint);
    } else if (type === "build") {
      const n = rnd(0, hi);
      const f = tenFrame({ interactive: true });
      ctl.ask(
        `Make <b class="big">${n}</b>`,
        `Make ${W[n]}. Tap the boxes to put counters on the ten frame, then press the check.`,
      );
      ctl.note(`${n}`, W[n]);
      st.dataset.target = n;
      st.appendChild(f.el);
      checkBtn(st, () => {
        f.count() === n ? ctl.correct() : ctl.wrong();
      });
      const hint = () => buildingHint(f.count(), n);
      ctl.hint(hint);
      ctl.reveal(() => {
        f.fill(n);
      });
    } else {
      const n = rnd(c.lvl === 2 ? 4 : 1, 9),
        m = 10 - n;
      const f = tenFrame({ n });
      ctl.ask(
        `<b>${n}</b> + <b class="big">?</b> = <b>10</b>`,
        `${W[n]} and how many more make ten?`,
      );
      ctl.note(`${n} + ${m} = 10`, `${W[n]} plus ${W[m]} makes ten`);
      st.appendChild(f.el);
      makeChoices(st, numOpts(m, 1, 10, nChoices(c)), m);
      const hint = () => {
        seqRun(
          [...Array(m).keys()],
          (k) => {
            const i = n + k;
            f.set(i, true, "ghost");
            f.badge(i, k + 1, "b2");
            sfx.tap(k + 1);
            helpSpeak(W[k + 1]);
          },
          countGap(),
        );
      };
      ctl.hint(hint);
      ctl.reveal(hint);
    }
  },
};
function teenFrames(c, st) {
  const hi = hiOf(c),
    n = rnd(11, hi),
    k = n - 10;
  const r = Math.random();
  const type =
    c.variant ||
    (c.lvl === 1
      ? r < 0.5
        ? "read"
        : "ones"
      : r < 0.3
        ? "read"
        : r < 0.6
          ? "ones"
          : "build");
  st.dataset.type = "teen-" + type;
  const wrap = el("div", "tfpair");
  const mkw = (f, l) => {
    const w = el("div", "tfwrap");
    w.appendChild(f.el);
    w.appendChild(el("div", "lbl", l));
    return w;
  };
  const tens = n === 20 ? 2 : 1,
    ones = n === 20 ? 0 : k;
  ctl.note(
    n === 20 ? "20 = 2 tens and 0 ones" : `${n} = 10 + ${k}`,
    n === 20
      ? "Twenty is two tens and zero leftover ones."
      : `${W[n]} is one ten and ${W[k]} ones`,
  );
  st.appendChild(
    el(
      "p",
      "math-message",
      n === 20 ? "2 tens in full frames." : "Each full frame is one ten.",
    ),
  );
  if (type === "build") {
    const f1 = tenFrame({ interactive: true, label: "First ten frame" }),
      f2 = tenFrame({ interactive: true, label: "Ones frame" });
    wrap.append(
      mkw(f1, "first ten"),
      mkw(f2, n === 20 ? "second ten" : "extra ones"),
    );
    st.appendChild(wrap);
    ctl.ask(
      `Make <b class="big">${n}</b>`,
      `Make ${W[n]}. Fill the first ten frame, then add ones. Then press the check.`,
    );
    st.dataset.target = n;
    checkBtn(st, () => {
      f1.count() === 10 && f2.count() === k ? ctl.correct() : ctl.wrong();
    });
    const hint = () => {
      if (f1.count() + f2.count() !== n)
        buildingHint(f1.count() + f2.count(), n);
      else
        showTeaching(
          "You have the right total. Move counters to fill the first ten frame.",
          true,
        );
    };
    ctl.hint(hint);
    ctl.reveal(() => {
      f1.fill(10);
      f2.fill(k);
    });
    return;
  }
  const f1 = tenFrame({ n: 10 }),
    f2 = tenFrame({ n: k });
  wrap.append(
    mkw(f1, "first ten"),
    mkw(f2, n === 20 ? "second ten" : "extra ones"),
  );
  st.appendChild(wrap);
  if (type === "read") {
    ctl.ask(
      'How many <span class="emo">🔴</span>?',
      "How many counters are there altogether?",
    );
    makeChoices(st, numOpts(n, 11, 20, nChoices(c)), n);
    const hint = () => {
      f1.clearBadges();
      f2.clearBadges();
      showTeaching(
        n === 20
          ? "Two full frames make two tens: twenty."
          : "One full frame is ten. Count on from ten.",
      );
      if (n !== 20)
        seqRun(
          [...Array(k).keys()],
          (i) => {
            f2.badge(i, 11 + i);
            sfx.tap(11 + i);
            helpSpeak(W[11 + i]);
          },
          countGap(),
          helpDelay(1500),
        );
    };
    ctl.hint(hint);
    ctl.reveal(hint);
  } else {
    ctl.ask(
      n === 20
        ? `20 has 2 tens and <b class="big">?</b> leftover ones`
        : `<b>${n}</b> = 10 + <b class="big">?</b>`,
      n === 20
        ? "Twenty has two full tens. How many leftover ones?"
        : `${W[n]} is ten and how many ones?`,
      n === 20,
    );
    makeChoices(st, numOpts(ones, 0, 9, nChoices(c)), ones);
    const hint = () => {
      f2.clearBadges();
      if (n === 20) {
        showTeaching(
          "Both frames are full tens. There are zero leftover ones.",
        );
        return;
      }
      seqRun(
        [...Array(k).keys()],
        (i) => {
          f2.badge(i, i + 1);
          sfx.tap(i + 1);
          helpSpeak(W[i + 1]);
        },
        countGap(),
      );
    };
    ctl.hint(hint);
    ctl.reveal(hint);
  }
}
