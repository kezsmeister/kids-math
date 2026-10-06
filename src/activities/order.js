"use strict";

/* 5. ORDER / NUMBER PATH */
ACTS.order = {
  name: "Number Path",
  color: ["#22b8cf", "#0f8ca0"],
  icon: '<svg viewBox="0 0 120 40"><rect x="2" y="4" width="32" height="32" rx="8" fill="#ff86b9"/><rect x="44" y="4" width="32" height="32" rx="8" fill="#ffd23f"/><rect x="86" y="4" width="32" height="32" rx="8" fill="#fff"/><text x="18" y="29" font-size="26" fill="#fff" text-anchor="middle" font-weight="900">1</text><text x="60" y="29" font-size="26" fill="#fff" text-anchor="middle" font-weight="900">2</text><text x="102" y="29" font-size="26" fill="#22b8cf" text-anchor="middle" font-weight="900">?</text></svg>',
  skill: "Number sequence and numeral comparison with quantity pictures",
  note: "Fill one gap in a short number path or compare two numbers, with visible dot quantities.",
  make(c, st) {
    const hi = HI[c.lvl];
    const lo2 = 0;
    const type = ["next", "missing", "before", "bigger"].includes(c.variant)
      ? c.variant
      : "next";
    st.dataset.type = "path-" + type;
    if (type === "next" || type === "missing" || type === "before") {
      let nums, blank, ans;
      if (type === "next") {
        const len = c.lvl === 1 ? 1 : 3;
        const s = rnd(lo2, hi - len);
        nums = [...Array(len + 1).keys()].map((i) => s + i);
        blank = len;
        ans = nums[blank];
        ctl.ask("What comes <b>next</b>?", "What number comes next?");
      } else if (type === "missing") {
        const len = c.lvl === 1 ? 3 : 5;
        const s = rnd(lo2, Math.max(lo2, hi - len + 1));
        nums = [...Array(len).keys()].map((i) => s + i);
        blank = rnd(0, len - 1);
        ans = nums[blank];
        ctl.ask("Find the <b>missing</b> number", "Which number is missing?");
      } else {
        const s = rnd(lo2, hi - 1);
        nums = [s, s + 1];
        blank = 0;
        ans = s;
        ctl.ask(
          "What comes <b>before</b>?",
          "What number comes before " + W[s + 1] + "?",
        );
      }
      R.q.mathKey = `${type}:${nums.join(",")}:${blank}`;
      const p = el("div", "path");
      const boxes = [];
      nums.forEach((v, i) => {
        const cell = el("div", "pcell");
        const b = el("div", "pbox pc" + (i % 4), i === blank ? "?" : v);
        if (i === blank) b.classList.add("blank");
        cell.appendChild(b);
        if (i !== blank) cell.appendChild(miniDots(v));
        p.appendChild(cell);
        boxes.push({ cell, v });
      });
      st.appendChild(p);
      ctl.note(nums.join(", "), nums.map((v) => W[v]).join(", "));
      const blankEl = boxes[blank].cell.firstChild;
      const fill = () => {
        blankEl.textContent = ans;
        blankEl.classList.remove("blank");
        blankEl.classList.add("filled");
      };
      makeChoices(st, numOpts(ans, 0, hi, nChoices(c)), ans, {
        drop: blankEl,
        onRight: fill,
        onReveal: fill,
      });
      ctl.hint(() => {
        showTeaching("Use the dots to count along the number path.");
        boxes.forEach((bx, i) =>
          later(
            () => {
              if (!bx.cell.querySelector(".mdots")) {
                bx.cell.appendChild(miniDots(bx.v));
                sfx.tap(i + 1);
              }
            },
            i * 350 + 100,
          ),
        );
      });
    } else {
      let a = rnd(lo2, hi),
        b;
      do {
        b = rnd(lo2, hi);
      } while (b === a);
      const big = Math.random() < 0.6;
      const ans = big ? Math.max(a, b) : Math.min(a, b);
      ctl.ask(
        `Which number is <b class="${big ? "more" : "less"}">${big ? "bigger" : "smaller"}</b>?`,
        `Which number is ${big ? "bigger" : "smaller"}?`,
      );
      ctl.note(
        `${Math.min(a, b)} &lt; ${Math.max(a, b)}`,
        `${W[Math.min(a, b)]} is less than ${W[Math.max(a, b)]}`,
      );
      R.q.mathKey = `numerals:${a}:${b}:${big}`;
      const ch = makeChoices(st, [a, b], ans, { btnCls: "huge" });
      ch.btns.forEach((bt) => bt.appendChild(miniDots(+bt.dataset.v)));
      ctl.hint(() => {
        showTeaching("Compare the dots under each number.");
        ch.btns.forEach((bt) => {
          if (!bt.querySelector(".mdots"))
            bt.appendChild(miniDots(+bt.dataset.v));
        });
      });
    }
  },
};
