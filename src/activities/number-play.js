"use strict";

function activityButton(text, fn, cls = "text-button") {
  const b = el("button", cls, text);
  b.type = "button";
  b.addEventListener("click", () => {
    if (R && !R.q.done) fn(b);
  });
  return b;
}
function makeNumberPlay(c, st) {
  st.dataset.type = c.variant;
  const max = hiOf(c),
    o = pick(OBJ);
  const n =
    c.variant === "quick"
      ? rnd(1, 5)
      : rnd(c.variant === "collect" ? 0 : 2, max);
  R.q.mathKey = `${c.variant}:${n}`;
  const panel = el("div", "number-play answer-widget");
  panel.dataset.target = n;
  st.appendChild(panel);
  if (c.variant === "collect") {
    ctl.ask(
      `Collect <b class="big">${n}</b> ${o.e}`,
      `Put ${W[n]} in the basket. Then press Check.`,
    );
    const bank = el("div", "collection");
    const source = el("div", "collection-source");
    const basket = el("div", "collection-basket");
    source.setAttribute("aria-label", "Objects to collect");
    basket.setAttribute(
      "aria-label",
      "Your basket. Tap an object to return it.",
    );
    basket.setAttribute("role", "group");
    const symbol = el("span", "basket-symbol", "🧺");
    symbol.setAttribute("aria-hidden", "true");
    basket.appendChild(symbol);
    bank.append(source, basket);
    const selected = new Set();
    const buttons = [];
    for (let i = 0; i < n + 3; i++) {
      const b = activityButton(o.e, () => {
        cancelQuestionWork();
        const focused = document.activeElement === b;
        if (selected.has(i)) selected.delete(i);
        else selected.add(i);
        b.setAttribute("aria-pressed", String(selected.has(i)));
        (selected.has(i) ? basket : source).appendChild(b);
        if (focused) b.focus({ preventScroll: true });
      });
      b.setAttribute("aria-label", `${o.s} ${i + 1}`);
      b.setAttribute("aria-pressed", "false");
      source.appendChild(b);
      buttons.push(b);
    }
    panel.appendChild(bank);
    checkBtn(panel, () => (selected.size === n ? ctl.correct() : ctl.wrong()));
    ctl.note(`You collected ${n}.`, `${W[n]} ${plu(n, o)}.`);
    ctl.hint(() => buildingHint(selected.size, n));
    ctl.reveal(() => {
      buttons.forEach((b, i) => {
        b.setAttribute("aria-pressed", String(i < n));
        (i < n ? basket : source).appendChild(b);
      });
      showTeaching(`Choose ${n}; leave the rest.`);
    });
  } else if (c.variant === "conserve") {
    ctl.ask(
      `Here are <b>${n}</b> ${o.e}`,
      "Move the objects around. Does the number change?",
    );
    const objects = el("div", "conservation");
    for (let i = 0; i < n; i++) objects.appendChild(mkItem(o.e));
    panel.appendChild(objects);
    const move = activityButton("", () => {
      cancelQuestionWork();
      objects.classList.toggle("spread");
      choices.box.hidden = false;
      ctl.ask("How many now?", "How many are there now?", false);
      pictureControl(move, "↔", "Move them again", "Move again");
    });
    move.id = "moveObjects";
    pictureControl(move, "↔", "Move them around", "Move");
    panel.appendChild(move);
    const choices = makeChoices(panel, numOpts(n, 0, max + 1, nChoices(c)), n);
    choices.box.hidden = true;
    ctl.note(
      `Still ${n} — none added, none taken away.`,
      `${W[n]}. Moving objects does not change how many there are.`,
    );
    ctl.hint(() => {
      showTeaching("We moved them. We did not add any or take any away.");
      countAll([...objects.children], undefined, helpDelay());
    });
    ctl.reveal(() => showTeaching(`Still ${n}. None added, none taken away.`));
  } else {
    ctl.ask("How many?", "How many?");
    const dots = el("div", "quick-dots");
    const items = [];
    if (c.lvl === 1) dots.appendChild(diceEl(n, "●", items));
    else {
      const layout = field(n, "●", {
        cols: 3,
        rows: 3,
        scatter: true,
        showEmpty: true,
      });
      dots.appendChild(layout.el);
      items.push(...layout.items);
    }
    dots.setAttribute("role", "img");
    dots.setAttribute("aria-label", `${n} dots`);
    panel.appendChild(dots);
    // A visible quantity task at every level; no memory or speed requirement.
    makeChoices(panel, numOpts(n, 0, 5, nChoices(c)), n);
    ctl.note(`${n} dots.`, `${W[n]} dots.`);
    ctl.hint(() => {
      countAll(items);
    });
    ctl.reveal(() => countAll(items));
  }
}
