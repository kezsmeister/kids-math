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
      `Choose exactly ${W[n]} ${o.p}. Tap an object to choose it or put it back. Then press Check.`,
    );
    panel.appendChild(
      el("p", "instruction", "Tap to choose. Tap again to put back."),
    );
    const bank = el("div", "collection");
    const selected = new Set();
    for (let i = 0; i < n + 3; i++) {
      const b = activityButton(o.e, () => {
        if (selected.has(i)) selected.delete(i);
        else selected.add(i);
        b.setAttribute("aria-pressed", String(selected.has(i)));
      });
      b.setAttribute("aria-label", `${o.s} ${i + 1}`);
      b.setAttribute("aria-pressed", "false");
      bank.appendChild(b);
    }
    panel.appendChild(bank);
    checkBtn(panel, () => (selected.size === n ? ctl.correct() : ctl.wrong()));
    ctl.note(`You collected ${n}.`, `${W[n]} ${plu(n, o)}.`);
    ctl.hint(() => buildingHint(selected.size, n));
    ctl.reveal(() => {
      [...bank.children].forEach((b, i) =>
        b.setAttribute("aria-pressed", String(i < n)),
      );
      showTeaching(`Choose ${n}; leave the rest.`);
    });
  } else if (c.variant === "compose") {
    ctl.ask(
      `Make <b class="big">${n}</b> two ways`,
      `Split ${W[n]} counters into two parts. Then make a different pair of parts.`,
    );
    const description = el(
      "p",
      "instruction",
      "Move counters between the two parts. Then press Check.",
    );
    const previous = el("p", "math-message");
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
    panel.append(description, previous, parts);
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
        description.textContent =
          "Keep the same total. Make a different pair of parts.";
        showTeaching("Now make a different pair of parts.");
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
      `Here are ${W[n]} ${o.p}. Move them around. Does the number change?`,
    );
    const objects = el("div", "conservation");
    for (let i = 0; i < n; i++) objects.appendChild(mkItem(o.e));
    panel.appendChild(objects);
    const move = activityButton("Move them around", () => {
      objects.classList.toggle("spread");
      choices.box.hidden = false;
      ctl.ask("How many now?", "How many are there now?");
      move.textContent = "Move them again";
    });
    move.id = "moveObjects";
    panel.appendChild(move);
    const choices = makeChoices(panel, numOpts(n, 0, max + 1, nChoices(c)), n);
    choices.box.hidden = true;
    ctl.note(
      `Still ${n} — none added, none taken away.`,
      `${W[n]}. Moving objects does not change how many there are.`,
    );
    ctl.hint(() => {
      showTeaching("We moved them. We did not add any or take any away.");
      countAll([...objects.children]);
    });
    ctl.reveal(() => showTeaching(`Still ${n}. None added, none taken away.`));
  } else {
    ctl.ask(
      "How many did you see?",
      "Press Look at the dots when you are ready. How many do you see? You can look again whenever you want.",
    );
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
    }
    dots.setAttribute("role", "img");
    dots.setAttribute("aria-label", `${n} dots`);
    panel.appendChild(dots);
    const cover = () => {
      dots.classList.add("covered");
      dots.setAttribute("aria-label", "Dots covered. You can show them again.");
    };
    let started = false;
    cover();
    const reveal = () => {
      cancelQuestionWork();
      dots.classList.remove("covered");
      dots.setAttribute("aria-label", `${n} dots`);
      started = true;
      choices.box.hidden = false;
      show.textContent = "Show again";
    };
    const show = activityButton("Look at the dots", () => {
      const first = !started;
      if (!first) ctl.assist();
      reveal();
      if (first) later(cover, 2500);
    });
    show.id = "showAgain";
    panel.appendChild(show);
    const choices = makeChoices(panel, numOpts(n, 0, 6, nChoices(c)), n);
    choices.box.hidden = true;
    ctl.note(`${n} dots.`, `${W[n]} dots.`);
    ctl.hint(reveal);
    ctl.reveal(reveal);
  }
}
