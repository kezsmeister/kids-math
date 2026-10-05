"use strict";

/* ---------- shared widgets ---------- */
function makeChoices(parent, opts, ans, o = {}) {
  const box = el("div", "choices" + (o.cls ? " " + o.cls : ""));
  const btns = [];
  let correctBtn = null;
  const correctBtns = [];
  opts.forEach((v, i) => {
    const b = el(
      "button",
      "numbtn c" + (i % 5) + (o.btnCls ? " " + o.btnCls : ""),
      o.render ? o.render(v, i) : String(v),
    );
    b.setAttribute("aria-label", o.label ? o.label(v) : String(v));
    b.type = "button";
    b.dataset.v = v;
    const accepted = o.accept ? o.accept(v) : v === ans;
    if (accepted) {
      b.dataset.correct = "1";
      correctBtn ||= b;
      correctBtns.push(b);
    }
    const act = () => {
      if (b.disabled || !R || R.q.done) return;
      sfx.pop();
      if (accepted) {
        b.classList.add("right");
        if (o.onRight) o.onRight(b);
        ctl.correct();
      } else {
        b.classList.add("soft");
        b.disabled = true;
        ctl.wrong();
      }
    };
    b.addEventListener("click", () => {
      if (b._sup) return;
      act();
    });
    if (o.drop) enableDrag(b, o.drop, act);
    box.appendChild(b);
    btns.push(b);
  });
  parent.appendChild(box);
  R.q.glow = () => {
    correctBtns.forEach((b) => b.classList.add("glow"));
    if (o.onReveal) o.onReveal();
  };
  return { box, btns, correctBtn };
}
function enableDrag(b, target, act) {
  let sx = 0,
    sy = 0,
    moved = false,
    id = null;
  b.style.touchAction = "none";
  const over = (e) => {
    const r = target.getBoundingClientRect(),
      m = 30;
    return (
      e.clientX > r.left - m &&
      e.clientX < r.right + m &&
      e.clientY > r.top - m &&
      e.clientY < r.bottom + m
    );
  };
  b.addEventListener("pointerdown", (e) => {
    if (b.disabled) return;
    id = e.pointerId;
    sx = e.clientX;
    sy = e.clientY;
    moved = false;
    try {
      b.setPointerCapture(id);
    } catch (_) {}
  });
  b.addEventListener("pointermove", (e) => {
    if (id !== e.pointerId) return;
    const dx = e.clientX - sx,
      dy = e.clientY - sy;
    if (!moved && Math.hypot(dx, dy) > 12) {
      moved = true;
      b.classList.add("dragging");
    }
    if (moved) {
      b.style.transform = `translate(${dx}px,${dy}px) scale(1.15)`;
      target.classList.toggle("over", over(e));
    }
  });
  b.addEventListener("pointerup", (e) => {
    if (id !== e.pointerId) return;
    id = null;
    target.classList.remove("over");
    if (moved) {
      const ok = over(e);
      b.classList.remove("dragging");
      b.style.transform = "";
      b._sup = true;
      setTimeout(() => (b._sup = false), 80);
      if (ok) act();
    }
  });
  b.addEventListener("pointercancel", () => {
    id = null;
    moved = false;
    b.classList.remove("dragging");
    b.style.transform = "";
    target.classList.remove("over");
  });
}
function checkBtn(parent, fn) {
  const w = el("div", "checkrow");
  const b = el("button", "bigbtn", "✓");
  b.id = "checkBtn";
  b.type = "button";
  b.setAttribute("aria-label", "Check");
  b.addEventListener("click", () => {
    if (!R || R.q.done) return;
    sfx.pop();
    fn();
  });
  w.appendChild(b);
  parent.appendChild(w);
  return b;
}
function tenFrame(o = {}) {
  const f = el("div", "tf");
  const cells = [];
  f.setAttribute("role", "group");
  f.setAttribute("aria-label", o.label || "Ten frame");
  for (let i = 0; i < 10; i++) {
    const c = el(o.interactive ? "button" : "div", "tf-cell");
    if (o.interactive) {
      c.type = "button";
      c.setAttribute("aria-label", `Counter position ${i + 1}`);
      c.setAttribute("aria-pressed", "false");
    }
    f.appendChild(c);
    cells.push(c);
  }
  const api = {
    el: f,
    cells,
    set(i, on, cls = "red") {
      const c = cells[i];
      c.innerHTML = "";
      c.classList.toggle("on", on);
      if (o.interactive) c.setAttribute("aria-pressed", String(on));
      if (on) c.appendChild(el("span", "cnt " + cls));
    },
    count() {
      return cells.filter((c) => c.classList.contains("on")).length;
    },
    fill(n, cls = "red") {
      for (let i = 0; i < 10; i++) api.set(i, i < n, cls);
    },
    badge(i, n, c) {
      const cell = cells[i];
      const old = cell.querySelector(".badge");
      if (old) old.remove();
      cell.appendChild(badgeEl(n, c));
    },
    clearBadges() {
      cells.forEach((c) => {
        const b = c.querySelector(".badge");
        if (b) b.remove();
      });
    },
  };
  if (o.n != null) api.fill(o.n, o.cls);
  if (o.interactive) f.classList.add("tf-int");
  if (o.interactive)
    cells.forEach((c, i) =>
      c.addEventListener("click", () => {
        if (!R || R.q.done) return;
        api.set(i, !c.classList.contains("on"), "red");
        sfx.tap(api.count());
      }),
    );
  return api;
}
function miniDots(n) {
  const d = el("div", "mdots");
  for (let i = 0; i < n; i++) d.appendChild(el("i", i >= 10 ? "t" : ""));
  return d;
}
function field(n, emoji, o = {}) {
  const cols = o.cols || 5,
    rows = o.rows || 2;
  const f = el("div", "field");
  f.style.gridTemplateColumns = `repeat(${cols},calc(var(--obj)*1.25))`;
  const total = cols * rows;
  const ids = o.scatter
    ? shuffle([...Array(total).keys()]).slice(0, n)
    : [...Array(n).keys()];
  const set = new Set(ids);
  const items = [];
  for (let i = 0; i < total; i++) {
    if (set.has(i)) {
      const it = el("div", "item", '<span class="emo">' + emoji + "</span>");
      if (o.scatter)
        it.style.transform = `translate(${rnd(-5, 5)}px,${rnd(-5, 5)}px) rotate(${rnd(-12, 12)}deg)`;
      f.appendChild(it);
      items.push(it);
    } else if (o.showEmpty !== false) {
      f.appendChild(el("div", "slot"));
    }
  }
  return { el: f, items };
}
function countAll(items, split) {
  items.forEach((i) => {
    i.classList.remove("counted");
    const b = i.querySelector(".badge");
    if (b) b.remove();
  });
  seqRun(
    items,
    (it, i) => {
      it.classList.add("counted");
      it.appendChild(badgeEl(i + 1, split != null && i >= split ? "b2" : ""));
      sfx.tap(i + 1);
      say(W[i + 1]);
    },
    countGap(),
  );
}
const DICE = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};
function mkItem(e) {
  return el("div", "item", '<span class="emo">' + e + "</span>");
}
function diceEl(n, e, items) {
  const d = el("div", "dice");
  const on = new Set(DICE[n]);
  for (let i = 0; i < 9; i++) {
    if (on.has(i)) {
      const it = mkItem(e);
      d.appendChild(it);
      items.push(it);
    } else d.appendChild(el("div", ""));
  }
  return d;
}
function frameEl(n, e, items) {
  const f = el("div", "tf");
  for (let i = 0; i < 10; i++) {
    const c = el("div", "tf-cell");
    if (i < n) {
      const it = mkItem(e);
      c.appendChild(it);
      items.push(it);
    }
    f.appendChild(c);
  }
  return f;
}
function rowEl(n, e, items, gap) {
  const r = el("div", "frow" + (gap ? " gap" : ""));
  for (let i = 0; i < 5; i++) {
    if (i < n) {
      const it = mkItem(e);
      r.appendChild(it);
      items.push(it);
    } else r.appendChild(el("div", "slot"));
  }
  return r;
}
/* kind: dice (1-6) | two (two dice, up to 12) | frame (ten frame, up to 10) | fives (rows of five) | teen (two ten frames, 11-20) */
function layoutFor(n, kind, e) {
  const items = [];
  const w = el("div", "lay");
  if (n === 0) {
    w.appendChild(
      el(
        "div",
        "item",
        '<span class="emo" style="font-size:var(--obj)">🍽️</span>',
      ),
    );
    return { el: w, items };
  }
  if (kind === "dice") w.appendChild(diceEl(n, e, items));
  else if (kind === "two") {
    const a = Math.ceil(n / 2),
      b = n - a;
    w.appendChild(diceEl(a, e, items));
    w.appendChild(diceEl(b, e, items));
  } else if (kind === "frame") w.appendChild(frameEl(n, e, items));
  else if (kind === "teen") {
    const p = el("div", "tfpair");
    const wrap = (x) => {
      const q = el("div", "tfwrap");
      q.appendChild(x);
      return q;
    };
    p.appendChild(wrap(frameEl(10, e, items)));
    p.appendChild(wrap(frameEl(n - 10, e, items)));
    w.appendChild(p);
  } else {
    const f = el("div", "fives");
    const rows = Math.ceil(n / 5);
    for (let r = 0; r < rows; r++)
      f.appendChild(rowEl(Math.min(5, n - r * 5), e, items, n > 10 && r === 1));
    w.appendChild(f);
  }
  return { el: w, items };
}
function kindsFor(c, n) {
  if (c.m20)
    return c.lvl === 1 ? ["teen", "fives"] : ["teen", "fives", "fives"];
  if (c.lvl === 1) return n <= 5 ? ["dice", "fives"] : ["frame"];
  if (c.lvl === 2)
    return n <= 6 ? ["dice", "frame", "fives"] : ["frame", "two", "fives"];
  return n <= 6 ? ["dice", "frame", "two"] : ["frame", "two", "fives"];
}
/* one gentle count-together button: runs fn() (which highlights + speaks); can't be double-started */
function countTogether(st, fn, duration, label = "Count with me") {
  const cb = el(
    "button",
    "cbtn help-button",
    `<span aria-hidden="true">☝️</span> ${label}`,
  );
  cb.type = "button";
  cb.id = st.querySelector("#countBtn") ? "countAllBtn" : "countBtn";
  cb.setAttribute("aria-label", label);
  const round = R,
    question = R.q;
  let busy = false;
  const reset = () => {
    busy = false;
    cb.disabled = false;
    cb.classList.remove("busy");
    cb.setAttribute("aria-busy", "false");
  };
  question.cancel.push(reset);
  const run = () => {
    if (R !== round || R.q !== question || busy) return;
    ctl.assist();
    cancelQuestionWork();
    busy = true;
    cb.disabled = true;
    cb.classList.add("busy");
    cb.setAttribute("aria-busy", "true");
    fn();
    later(reset, duration() + 600);
  };
  cb.addEventListener("click", () => {
    sfx.pop();
    run();
  });
  st.appendChild(cb);
  return run;
}

// A separate example teaches the gesture without changing the child's answer.
function frameGuide(st) {
  const guide = el("div", "frame-guide");
  const details = el("details");
  details.open = !S.frameHelpSeen;
  const summary = el("summary", "", "How to play");
  details.append(
    summary,
    el(
      "p",
      "",
      "Tap a box to add a counter. Tap it again to remove it. Then press Check.",
    ),
  );
  const demo = el("div", "demo-frame");
  demo.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 3; i++) demo.appendChild(el("span", "demo-cell"));
  const button = el("button", "text-button", "Show how");
  button.type = "button";
  button.onclick = () => {
    cancelQuestionWork();
    demo.children[0].classList.add("on");
    $("#helpStatus").textContent = "Tap once to add a counter.";
    say("Tap once to add a counter. Tap again to remove it.");
    later(() => {
      demo.children[0].classList.remove("on");
      $("#helpStatus").textContent = "Tap again to remove it.";
    }, 1500);
  };
  R.q.cancel.push(() => {
    demo.children[0].classList.remove("on");
    $("#helpStatus").textContent = "";
  });
  details.append(demo, button);
  guide.appendChild(details);
  st.appendChild(guide);
  S.frameHelpSeen = true;
  save();
}
function addGroups(a, b, e1, e2, kind) {
  const mk = (n, e, cls) => {
    const items = [];
    const g = el("div", "agrp " + cls);
    const l = layoutFor(n, kind, e);
    g.appendChild(l.el);
    return { g, items: l.items };
  };
  const A = mk(a, e1, "ga"),
    B = mk(b, e2, "gb");
  const row = el("div", "row arow");
  row.append(A.g, el("div", "plus", "＋"), B.g);
  return { row, items: [...A.items, ...B.items], split: A.items.length };
}

// Count a known group as one amount, then count the additional objects.
function countOn(known, extra, start) {
  [...known, ...extra].forEach((item) => {
    item.classList.remove("counted");
    item.querySelector(".badge")?.remove();
  });
  known.forEach((item) => item.classList.add("counted"));
  showTeaching(`Start with ${start}. Count on ${extra.length} more.`, false);
  say(`Start with ${W[start]}. Count on.`);
  seqRun(
    extra,
    (item, i) => {
      item.classList.add("counted");
      item.appendChild(badgeEl(start + i + 1, "b2"));
      say(W[start + i + 1]);
      sfx.tap(start + i + 1);
    },
    countGap(),
    1300,
  );
}
function showTeaching(text, feedback = false) {
  const target = feedback ? $("#fbtext") : $("#helpStatus");
  target.textContent = text;
  say(text);
}
function buildingHint(current, target) {
  const difference = target - current;
  const text =
    difference > 0
      ? `You made ${current}. Add ${difference} more to make ${target}.`
      : difference < 0
        ? `You made ${current}. Take away ${-difference} to make ${target}.`
        : `You made ${target}. Count once more, then press Check.`;
  showTeaching(text, true);
}
function equationHTML(a, op, b, answer = "?", reverse = false) {
  const lhs = `<span class="a">${a}</span><span class="op">${op}</span><span class="b">${b}</span>`;
  const rhs =
    answer === "?" ? '<span class="q">?</span>' : `<span>${answer}</span>`;
  return reverse
    ? `${rhs}<span class="op">=</span>${lhs}`
    : `${lhs}<span class="op">=</span>${rhs}`;
}
