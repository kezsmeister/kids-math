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
  } else if (c.variant === "compose") {
    ctl.ask(
      `Make <b class="big">${n}</b> two ways`,
      `Share ${W[n]} counters between the bowls. Then press Check.`,
    );
    const previous = el("p", "math-message");
    const snapshot = el("div", "decomposition-snapshot");
    snapshot.hidden = true;
    const parts = el("div", "part-counters");
    const groups = [el("div", "part-group"), el("div", "part-group")];
    const labels = groups.map((g, i) => {
      const label = el("div", "lbl", `Part ${i + 1}`);
      g.appendChild(label);
      return label;
    });
    const sides = Array(n).fill(0);
    let first = null;
    const buttons = sides.map((_, i) =>
      activityButton("●", () => {
        cancelQuestionWork();
        sides[i] = 1 - sides[i];
        render();
      }),
    );
    function render() {
      const focused = document.activeElement;
      groups.forEach((group, side) => {
        group.replaceChildren(labels[side]);
        buttons.forEach((b, i) => {
          if (sides[i] === side) {
            b.setAttribute(
              "aria-label",
              `Counter ${i + 1}, part ${side + 1}. Move to part ${2 - side}`,
            );
            group.appendChild(b);
          }
        });
      });
      if (buttons.includes(focused)) focused.focus({ preventScroll: true });
    }
    render();
    parts.append(...groups);
    panel.append(snapshot, previous, parts);
    const pair = () => {
      const a = sides.filter((s) => s === 0).length;
      return [a, n - a];
    };
    checkBtn(panel, () => {
      const [a, b] = pair(),
        key = Math.min(a, b);
      if (first === null) {
        first = key;
        previous.textContent = `${n} = ${a} + ${b}`;
        snapshot.hidden = false;
        snapshot.setAttribute("role", "img");
        snapshot.setAttribute(
          "aria-label",
          `Your first way: ${a} and ${b}. Make a different pair below.`,
        );
        snapshot.appendChild(el("span", "snapshot-camera", "📷"));
        [a, b].forEach((amount) => {
          const bowl = el("div", "snapshot-bowl");
          for (let i = 0; i < amount; i++)
            bowl.appendChild(el("span", "snapshot-counter", "●"));
          snapshot.appendChild(bowl);
        });
        ctl.ask(
          "Make another pair",
          "Now make a different pair of parts. Then press Check.",
        );
        return;
      }
      if (key === first) {
        ctl.wrong();
        return;
      }
      ctl.note(
        `${previous.textContent}; ${n} = ${a} + ${b}. Two ways!`,
        `${W[n]} has two different pairs of parts.`,
      );
      ctl.correct();
    });
    ctl.note(`${n} stays the whole.`, `${W[n]} is the whole.`);
    ctl.hint(() =>
      showTeaching(
        first === null
          ? "Move a counter to the other part. Both parts still make the whole."
          : "Try a different number in each part. Swapping the same two amounts is the same pair.",
        true,
      ),
    );
    ctl.reveal(() => {
      const a = first === 0 ? 1 : 0;
      sides.fill(1);
      for (let i = 0; i < a; i++) sides[i] = 0;
      render();
      showTeaching(`${n} = ${a} + ${n - a}. The whole stays ${n}.`);
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
    // Beginners answer with the real objects in view. Later levels introduce
    // a brief look; the answer itself never has a time limit.
    let briefLook = c.lvl > 1;
    const cover = () => {
      briefLook = false;
      dots.classList.add("covered");
      dots.setAttribute("aria-label", "Dots covered. You can show them again.");
      show.hidden = false;
    };
    const reveal = () => {
      cancelQuestionWork();
      dots.classList.remove("covered");
      dots.setAttribute("aria-label", `${n} dots`);
      show.hidden = true;
    };
    const show = activityButton("", () => {
      ctl.assist();
      reveal();
      choices.box.querySelector("button")?.focus({ preventScroll: true });
    });
    show.id = "showAgain";
    pictureControl(show, "👀", "Show the dots again", "Show dots");
    show.hidden = true;
    panel.appendChild(show);
    const choices = makeChoices(panel, numOpts(n, 0, 6, nChoices(c)), n);
    R.q.cancel.push(() => {
      if (briefLook) cover();
    });
    if (briefLook) later(cover, 4000);
    ctl.note(`${n} dots.`, `${W[n]} dots.`);
    ctl.hint(() => {
      const spoken = R.q.spokenHelp;
      reveal();
      R.q.spokenHelp = spoken;
      countAll(items);
    });
    ctl.reveal(reveal);
  }
}
