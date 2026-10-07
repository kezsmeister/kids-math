"use strict";

/* 2. TEN FRAME */
ACTS.tenframe = {
  name: "Ten Frame",
  color: ["#3fbf7f", "#278f5b"],
  icon: '<svg viewBox="0 0 100 46"><rect x="2" y="2" width="96" height="42" rx="6" fill="#fff"/><g stroke="#3fbf7f" stroke-width="3"><path d="M22 2v42M41 2v42M60 2v42M79 2v42M2 23h96"/></g><g fill="#ff5a5f"><circle cx="12" cy="12" r="6"/><circle cx="31" cy="12" r="6"/><circle cx="50" cy="12" r="6"/><circle cx="69" cy="12" r="6"/><circle cx="88" cy="12" r="6"/><circle cx="12" cy="34" r="6"/><circle cx="31" cy="34" r="6"/></g></svg>',
  m20: true,
  m20name: "Two Frames",
  skill: "Count counters, build a quantity, and count empty spaces",
  note: "Count or build within ten. Count empty spaces to explore parts of ten. Optional two-frame counting to twenty.",
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
      ctl.ask("How many empty spaces?", "How many empty spaces?");
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
  const n = rnd(11, hiOf(c));
  st.dataset.type = "teen-read";
  R.q.mathKey = `two-frames:${n}`;
  const wrap = el("div", "tfpair");
  const f1 = tenFrame({ n: 10 }),
    f2 = tenFrame({ n: n - 10 });
  wrap.append(f1.el, f2.el);
  st.appendChild(wrap);
  ctl.ask(
    'How many <span class="emo">🔴</span>?',
    "How many counters are there altogether?",
  );
  ctl.note(String(n), W[n]);
  const hint = () => {
    f1.clearBadges();
    f2.clearBadges();
    seqRun(
      [...Array(n).keys()],
      (i) => {
        (i < 10 ? f1 : f2).badge(i % 10, i + 1);
        sfx.tap(i + 1);
        helpSpeak(W[i + 1]);
      },
      countGap(),
    );
  };
  countTogether(st, hint, () => n * countGap(), "Count each one");
  makeChoices(st, numOpts(n, 11, 20, nChoices(c)), n);
  ctl.hint(hint);
  ctl.reveal(hint);
}
