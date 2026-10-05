"use strict";

/* 7. SUBTRACT */
ACTS.sub = {
  name: "Take Away",
  color: ["#7c8cff", "#4b58d6"],
  icon: '<div style="font-size:.8em;text-shadow:0 3px 0 #0003;white-space:nowrap">🐥➖🐥</div>',
  skill: "Subtraction as taking away with optional picture support",
  note: "Read a story or equation, then choose how many are left. Show me crosses out the objects taken away and counts those remaining.",
  make(c, st) {
    st.classList.add("sub-st");
    const hi = HI[c.lvl];
    const zero = c.lvl === 3 && Math.random() < 0.1;
    const n = rnd(2, hi);
    const k = zero ? n : rnd(1, n - 1);
    const left = n - k;
    const eqType = c.variant ? c.variant==="eq" : c.lvl > 1 && Math.random() < (c.lvl === 2 ? 0.4 : 0.6);
    st.dataset.type = eqType ? "sub-eq" : "sub-story";
    const o = pick(OBJ);
    ctl.note(
      `${n} − ${k} = ${left}`,
      `${W[n]} take away ${W[k]} leaves ${W[left]}`,
    );
    if (!eqType) {
      ctl.ask(
        `<b class="big">${k}</b> <span class="emo">${o.e}</span> 💨 How many left?`,
        `${W[n]} ${o.p}. ${W[k]} ${o.v}. How many are left?`,
      );
      st.appendChild(
        el(
          "div",
          "substory",
          `<span class="emo">${o.e}</span> ${n} ${plu(n, o)}, ${k} ${o.v}`,
        ),
      );
    } else {
      ctl.ask(
        `<b>${n}</b> − <b>${k}</b> = <b class="big">?</b>`,
        `${W[n]} take away ${W[k]} equals how many?`,
      );
    }
    const eq = el(
      "div",
      "eq",
      `<span class="a">${n}</span><span class="op">−</span><span class="b">${k}</span><span class="op">=</span><span class="q">?</span>`,
    );
    st.appendChild(eq);
    const fillQ = () => {
      const q = $(".q", eq);
      q.textContent = left;
      q.classList.add("filled");
    };
    makeChoices(st, numOpts(left, 0, Math.max(hi, n), nChoices(c)), left, {
      onRight: fillQ,
      onReveal: fillQ,
    });
    // Optional concrete model: retain the starting group, cross out the removed
    // objects, then count only those left. Every replay restores the same story.
    const pictures = el("div", "sub-pictures");
    pictures.hidden = true;
    pictures.setAttribute("role", "img");
    const items = [];
    for (let i = 0; i < n; i++) {
      const item = mkItem(o.e);
      items.push(item);
      pictures.appendChild(item);
    }
    const caption = el("p", "sub-caption");
    const demonstration = el("div", "sub-demo");
    demonstration.hidden = true;
    demonstration.append(pictures, caption);
    st.appendChild(demonstration);
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
        say(`Start with ${W[n]} ${o.p}. Take away ${W[k]}.`);
        later(() => {
          items.slice(left).forEach((item) => item.classList.add("gone"));
          pictures.setAttribute(
            "aria-label",
            `${n} ${o.p}, ${k} crossed out, ${left} left.`,
          );
          caption.textContent = `${n} − ${k} = ${left}. ${left} left!`;
          if (left) countAll(items.slice(0, left));
          else say("None left. That is zero.");
        }, 1200);
      },
      () => 1500 + left * countGap(),
      "Show me",
    );
    ctl.hint(show);
    ctl.reveal(show);
  },
};
