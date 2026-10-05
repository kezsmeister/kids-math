"use strict";

/* 5. ORDER / NUMBER PATH */
ACTS.order = {
  name: "Number Path",
  color: ["#22b8cf", "#0f8ca0"],
  icon: '<svg viewBox="0 0 120 40"><rect x="2" y="4" width="32" height="32" rx="8" fill="#ff86b9"/><rect x="44" y="4" width="32" height="32" rx="8" fill="#ffd23f"/><rect x="86" y="4" width="32" height="32" rx="8" fill="#fff"/><text x="18" y="29" font-size="26" fill="#fff" text-anchor="middle" font-weight="900">1</text><text x="60" y="29" font-size="26" fill="#fff" text-anchor="middle" font-weight="900">2</text><text x="102" y="29" font-size="26" fill="#22b8cf" text-anchor="middle" font-weight="900">?</text></svg>',
  m20: true,
  skill:
    "Number sequence, missing numbers, before/after, ordering, bigger/smaller number",
  note: "Number path: what comes next, missing number, what comes before, order small to big, which number is bigger.",
  make(c, st) {
    const hi = hiOf(c);
    const r = Math.random();
    const lo2 = c.m20 ? 11 : 0;
    let type;
    if (c.lvl === 1) type = r < 0.4 ? "next" : r < 0.8 ? "missing" : "sort";
    else
      type =
        r < 0.2
          ? "next"
          : r < 0.5
            ? "missing"
            : r < 0.65
              ? "before"
              : r < 0.85
                ? "sort"
                : "bigger";
    if (c.variant) type = c.variant;
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
      makeChoices(
        st,
        numOpts(
          ans,
          c.m20 ? 11 : 0,
          Math.min(20, Math.max(hi, ans + 2)),
          nChoices(c),
        ),
        ans,
        { drop: blankEl, onRight: fill, onReveal: fill },
      );
      ctl.hint(() => {
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
    } else if (type === "sort") {
      const cnt = c.lvl === 1 ? 3 : c.lvl === 2 ? 4 : 5;
      const vals = shuffle(
        [...Array(hi - lo2 + 1).keys()].map((i) => i + lo2),
      ).slice(0, cnt);
      const sorted = vals.slice().sort((a, b) => a - b);
      ctl.ask(
        'Small <span class="emo">🐭</span> ➜ Big <span class="emo">🐘</span>',
        "Tap the numbers in order, from the smallest to the biggest.",
      );
      ctl.note(sorted.join(" &lt; "), sorted.map((v) => W[v]).join(", "));
      const slots = el("div", "slots");
      const sl = sorted.map(() => {
        const s = el("div", "slot2");
        slots.appendChild(s);
        return s;
      });
      st.appendChild(slots);
      const bank = el("div", "choices");
      let placed = 0;
      const tiles = [];
      vals.forEach((v, i) => {
        const b = el("button", "numbtn c" + (i % 5), String(v));
        b.type = "button";
        b.dataset.v = v;
        tiles.push(b);
        b.addEventListener("click", () => {
          if (R.q.done || b.disabled) return;
          if (v === sorted[placed]) {
            sfx.tap(placed + 1);
            b.disabled = true;
            b.style.visibility = "hidden";
            const s = sl[placed];
            s.classList.add("full");
            s.style.background = "#4fd08a";
            s.textContent = v;
            placed++;
            say(W[v]);
            if (placed === cnt) ctl.correct();
          } else {
            sfx.pop();
            b.classList.remove("wob");
            void b.offsetWidth;
            b.classList.add("wob");
            ctl.wrong();
          }
        });
        bank.appendChild(b);
      });
      st.appendChild(bank);
      ctl.hint(() => {
        const t = tiles.find((b) => +b.dataset.v === sorted[placed]);
        if (t) t.classList.add("glow");
      });
      ctl.reveal(() => {
        for (let i = placed; i < cnt; i++) {
          const s = sl[i];
          s.classList.add("full");
          s.style.background = "#4fd08a";
          s.textContent = sorted[i];
        }
        tiles.forEach((t) => (t.style.visibility = "hidden"));
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
      ctl.hint(() => {
        ch.btns.forEach((bt) => {
          if (!bt.querySelector(".mdots"))
            bt.appendChild(miniDots(+bt.dataset.v));
        });
      });
    }
  },
};
