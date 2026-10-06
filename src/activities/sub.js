"use strict";

/* 7. SUBTRACT */
ACTS.sub = {
  name: "Take Away",
  color: ["#7c8cff", "#4b58d6"],
  icon: '<div style="font-size:.8em;text-shadow:0 3px 0 #0003;white-space:nowrap">🐥➖🐥</div>',
  skill: "Subtraction as taking away visible objects",
  note: "Crossed-out objects show what was taken away. Count those left; replay the action with counting help if wanted.",
  make(c, st) {
    st.classList.add("sub-st");
    const hi = HI[c.lvl];
    const zero = Math.random() < 0.18;
    const n = rnd(2, hi);
    const k = zero && n <= 5 ? n : rnd(1, Math.min(5, n - 1));
    const left = n - k;
    st.dataset.type = "sub-story";
    R.q.mathKey = `sub:${n}:${k}`;
    const o = pick(OBJ);
    ctl.note(
      `${n} − ${k} = ${left}`,
      `${W[n]} take away ${W[k]} leaves ${W[left]}`,
    );
    ctl.ask("How many left?", `${W[n]}. Take away ${W[k]}. How many are left?`);
    // The model is the question itself, visible before help and without a timer.
    const pictures = el("div", "sub-pictures");
    pictures.setAttribute("role", "img");
    const items = [];
    for (let i = 0; i < n; i++) {
      const item = mkItem(o.e);
      if (i >= left) item.classList.add("gone");
      items.push(item);
      pictures.appendChild(item);
    }
    const caption = el("p", "sub-caption");
    const demonstration = el("div", "sub-demo");
    pictures.setAttribute(
      "aria-label",
      `${n} ${o.p}, ${k} crossed out. How many left?`,
    );
    demonstration.append(pictures, caption);
    st.appendChild(demonstration);
    // Replay can cancel the demonstration between restoring and removing
    // objects. Always leave the original question's picture intact.
    R.q.cancel.push(() => {
      items.forEach((item, i) => {
        item.classList.toggle("gone", i >= left);
        item.classList.remove("counted");
        item.querySelector(".badge")?.remove();
      });
      pictures.setAttribute(
        "aria-label",
        `${n} ${o.p}, ${k} crossed out. How many left?`,
      );
      caption.textContent = "";
    });
    makeChoices(st, numOpts(left, 0, hi, nChoices(c)), left);
    const show = countTogether(
      st,
      () => {
        demonstration.hidden = false;
        pictures.hidden = false;
        items.forEach((item) => {
          item.classList.remove("gone", "counted");
          item.querySelector(".badge")?.remove();
        });
        pictures.setAttribute("aria-label", `${n} ${o.p}. Take away ${k}.`);
        caption.textContent = `Start with ${n}. Take away ${k}.`;
        helpSpeak(caption.textContent);
        later(() => {
          items.slice(left).forEach((item) => item.classList.add("gone"));
          pictures.setAttribute(
            "aria-label",
            `${n} ${o.p}, ${k} crossed out, ${left} left.`,
          );
          caption.textContent = `${n} − ${k} = ${left}. ${left} left!`;
          if (left) countAll(items.slice(0, left));
          else showTeaching("None left. That is zero.");
        }, helpDelay(1200));
      },
      () => 1500 + left * countGap(),
      "Take away with me",
    );
    ctl.hint(show);
    ctl.reveal(show);
  },
};
