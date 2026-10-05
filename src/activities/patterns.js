"use strict";

// Different objects remain distinguishable without relying on colour alone.
const PATTERN_TOKENS = [
  ["🐱", "cat"],
  ["🐶", "dog"],
  ["🐸", "frog"],
  ["🐰", "rabbit"],
];
const patternName = (t) => PATTERN_TOKENS.find((x) => x[0] === t)?.[1] || t;
// Reading visible items is access to the question, not a mathematical hint.
const spokenPattern = (sequence) =>
  sequence
    .map((token) => (token ? patternName(token) : "empty space"))
    .join(", ");
function patternVoice(text, replay = text) {
  cancelQuestionWork();
  R.q.speech = replay;
  say(text);
}
function patternStep(text, feedback = false) {
  cancelQuestionWork();
  R.q.speech = text;
  showTeaching(text, feedback);
}
function patternRow(sequence, unitLength, interactive = false) {
  const row = el("div", "pattern-row");
  sequence.forEach((token, i) => {
    if (i % unitLength === 0)
      row.appendChild(
        el(
          "div",
          "pattern-repeat" +
            (sequence.slice(i, i + unitLength).every(Boolean)
              ? " complete"
              : ""),
        ),
      );
    const cell = el(
      interactive ? "button" : "span",
      "pattern-slot" + (!token ? " blank" : ""),
      token || "?",
    );
    if (interactive) cell.type = "button";
    cell.setAttribute(
      "aria-label",
      `Position ${i + 1}: ${token ? patternName(token) : "empty"}`,
    );
    row.lastElementChild.appendChild(cell);
  });
  return row;
}
function makePattern(c, st) {
  st.dataset.type = "pattern-" + c.variant;
  const tokens = shuffle(PATTERN_TOKENS.map((x) => x[0]));
  if (c.variant === "create") return createPattern(c, st, tokens);
  const kind = pick(
    c.lvl === 1
      ? ["AB"]
      : c.lvl === 2
        ? ["AB", "AAB", "ABB"]
        : ["AAB", "ABB", "ABC"],
  );
  const unit = [...kind].map((letter) => tokens[letter.charCodeAt(0) - 65]);
  const sequence = [...unit, ...unit, ...unit];
  R.q.mathKey = `${c.variant}:${kind}:${unit.join("")}`;
  const panel = el("div", "pattern-play answer-widget");
  st.appendChild(panel);
  const note = `${unit.map(patternName).join(", ")} repeats.`;
  ctl.note(note, note);
  if (c.variant === "unit") {
    ctl.ask(
      "Which part repeats?",
      `Listen to the pattern: ${spokenPattern(sequence)}. Start at the beginning. Choose the smallest group that repeats over and over.`,
    );
    const row = patternRow(sequence, unit.length);
    panel.appendChild(row);
    const opts = [
      unit.join(""),
      [...unit].reverse().join(""),
      tokens[0] + tokens[2],
    ];
    makeChoices(panel, shuffle([...new Set(opts)]), unit.join(""), {
      btnCls: "pattern-option",
      label: (v) =>
        [...v]
          .filter((t) => t !== "\ufe0f")
          .map(patternName)
          .join(", "),
    });
    ctl.hint(() => {
      row.classList.add("showunits");
      patternStep("Find the smallest group that starts again.");
    });
    ctl.reveal(() => row.classList.add("showunits"));
    return;
  }
  if (c.variant === "repair") {
    sequence.push(...unit);
    const bad = rnd(unit.length * 3, sequence.length - 1),
      correct = sequence[bad];
    sequence[bad] = tokens[3];
    R.q.mathKey += `:${bad}`;
    ctl.ask(
      "Find the pattern mistake",
      `Listen to the pattern: ${spokenPattern(sequence)}. Tap the item that breaks the pattern, then choose its replacement.`,
    );
    const row = patternRow(sequence, unit.length, true);
    const cells = [...row.querySelectorAll("button")];
    const bank = el("div", "pattern-bank");
    bank.hidden = true;
    let selected = false;
    cells.forEach((b, i) => {
      b.classList.add("repair-item");
      if (i === bad) b.dataset.mistake = "1";
      b.onclick = () => {
        if (R.q.done) return;
        if (i !== bad) {
          ctl.wrong();
          return;
        }
        selected = true;
        b.classList.add("selected");
        bank.hidden = false;
        bank.querySelector("button")?.focus({ preventScroll: true });
        patternStep("Choose what belongs in this place.");
      };
    });
    tokens.slice(0, 3).forEach((token) => {
      const b = activityButton(token, () => {
        if (!selected) return;
        if (token !== correct) {
          ctl.wrong();
          return;
        }
        cells[bad].textContent = correct;
        cells[bad].setAttribute(
          "aria-label",
          `Position ${bad + 1}: ${patternName(correct)}`,
        );
        ctl.note("You repaired the repeating pattern.", note);
        ctl.correct();
      });
      b.setAttribute("aria-label", patternName(token));
      if (token === correct) b.dataset.correct = "1";
      bank.appendChild(b);
    });
    panel.append(row, bank);
    ctl.hint(() => {
      row.classList.add("showunits");
      patternStep("Compare each group with the first group.");
    });
    ctl.reveal(() => {
      cells[bad].textContent = correct;
      cells[bad].setAttribute(
        "aria-label",
        `Position ${bad + 1}: ${patternName(correct)}`,
      );
      row.classList.add("showunits");
    });
    return;
  }
  ctl.ask(
    "Keep the pattern going",
    `Listen to the pattern: ${spokenPattern(sequence)}. There are ${unit.length} empty spaces. Fill them to make one more complete repeat.`,
  );
  const row = patternRow([...sequence, ...unit.map(() => null)], unit.length);
  panel.appendChild(row);
  const blanks = [...row.querySelectorAll(".blank")];
  let index = 0;
  const bank = el("div", "pattern-bank");
  const buttons = tokens.slice(0, 3).map((token) => {
    const b = activityButton(token, () => {
      if (token !== unit[index]) {
        ctl.wrong();
        return;
      }
      blanks[index].textContent = token;
      blanks[index].classList.remove("blank");
      blanks[index].setAttribute("aria-label", patternName(token));
      index++;
      if (index === unit.length) {
        ctl.note("You continued a whole repeat.", note);
        ctl.correct();
      } else {
        markNext();
        patternStep(`${patternName(token)}. Keep going to finish the group.`);
      }
    });
    b.setAttribute("aria-label", patternName(token));
    bank.appendChild(b);
    return b;
  });
  function markNext() {
    buttons.forEach((b, i) => {
      delete b.dataset.correct;
      if (tokens[i] === unit[index]) b.dataset.correct = "1";
    });
  }
  markNext();
  panel.appendChild(bank);
  ctl.hint(() => {
    row.classList.add("showunits");
    patternStep("Look back at the first group. Follow the same order.");
  });
  ctl.reveal(() => {
    blanks.forEach((b, i) => {
      b.textContent = unit[i];
      b.classList.remove("blank");
      b.setAttribute("aria-label", patternName(unit[i]));
    });
    row.classList.add("showunits");
  });
}
function createPattern(c, st, tokens) {
  const previous = R.avoidSignature?.startsWith("create:")
    ? R.avoidSignature.slice(7)
    : null;
  R.q.mathKey = `create-palette:${tokens.join("")}`;
  const limit = c.lvl === 1 ? 2 : 3;
  const initialInstruction = `Choose ${limit === 2 ? "two" : "two or three"} items for your repeating group. Use at least two different items.`;
  ctl.ask("Make your own pattern", initialInstruction);
  const panel = el("div", "pattern-play answer-widget"),
    message = el(
      "p",
      "instruction",
      "Choose 2 or 3 items. Use at least two different items.",
    );
  const preview = el("div", "pattern-preview");
  let unit = [],
    sequence = [],
    building = false;
  const bank = el("div", "pattern-bank");
  message.textContent = `Choose ${limit === 2 ? "2" : "2 or 3"} items. Use at least two different items.`;
  const render = () => {
    preview.replaceChildren(
      patternRow(
        building
          ? [
              ...sequence,
              ...Array(unit.length * 3 - sequence.length).fill(null),
            ]
          : unit,
        unit.length || 1,
      ),
    );
  };
  const currentSpeech = () => {
    if (!building)
      return unit.length
        ? `Your group is ${spokenPattern(unit)}. ${unit.length < 2 ? "Choose another item." : "Press Use this group when you are ready, or Undo to change an item."}`
        : initialInstruction;
    const remaining = unit.length * 3 - sequence.length;
    return `Your repeating group is ${spokenPattern(unit)}. ${remaining ? `Your pattern is ${spokenPattern([...sequence, ...Array(remaining).fill(null)])}. Repeat your group twice more, then press Check.` : "Every space is filled. Press Check to see whether your pattern repeats."}`;
  };
  tokens.slice(0, 3).forEach((token) => {
    const b = activityButton(token, () => {
      const target = building ? sequence : unit,
        max = building ? unit.length * 3 : limit;
      if (target.length >= max) {
        patternVoice(currentSpeech());
        return;
      }
      target.push(token);
      render();
      const action =
        building && sequence.length === unit.length * 3
          ? "Every space is filled. Press Check."
          : !building && unit.length === limit
            ? "Press Use this group when you are ready."
            : "Choose the next item.";
      patternVoice(`${patternName(token)}. ${action}`, currentSpeech());
    });
    b.setAttribute("aria-label", patternName(token));
    bank.appendChild(b);
  });
  const use = activityButton("Use this group", () => {
    if (unit.length < 2 || new Set(unit).size < 2) {
      patternStep("Choose at least two different items for your group.", true);
      return;
    }
    if (unit.join("") === previous) {
      patternStep("Try a different repeating group this time.", true);
      return;
    }
    R.q.signature = `create:${unit.join("")}`;
    building = true;
    sequence = [...unit];
    use.hidden = true;
    check.parentElement.hidden = false;
    message.textContent = "Repeat your group twice more. Then press Check.";
    render();
    bank.querySelector("button").focus({ preventScroll: true });
    patternVoice(
      `Your group is ${spokenPattern(unit)}. Repeat your group twice more, then press Check.`,
      currentSpeech(),
    );
  });
  use.id = "useUnit";
  const undo = activityButton("Undo last item", () => {
    const removed = building
      ? sequence.length > unit.length
        ? sequence.pop()
        : null
      : unit.pop();
    render();
    patternVoice(
      removed
        ? `Removed ${patternName(removed)}. ${building ? "Fill the empty space to finish your pattern." : "Choose another item for your group."}`
        : building
          ? "Your first group stays in place. Choose a new group to change it."
          : "Your group is empty. Choose an item to start.",
      currentSpeech(),
    );
  });
  const restart = activityButton("Choose a new group", () => {
    building = false;
    unit = [];
    sequence = [];
    use.hidden = false;
    check.parentElement.hidden = true;
    message.textContent = `Choose ${limit === 2 ? "2" : "2 or 3"} items. Use at least two different items.`;
    render();
    patternVoice(initialInstruction);
  });
  panel.append(message, preview, bank, use, undo, restart);
  const check = checkBtn(panel, () => {
    if (sequence.length !== unit.length * 3) {
      patternStep("Fill every empty place before checking.", true);
      return;
    }
    if (!sequence.every((token, i) => token === unit[i % unit.length])) {
      ctl.wrong();
      return;
    }
    R.q.signature = `create:${unit.join("")}`;
    ctl.note(
      "Your group repeats three times!",
      `${unit.map(patternName).join(", ")} repeats three times.`,
    );
    ctl.correct();
  });
  check.parentElement.hidden = true;
  ctl.note("Repeat the same group in the same order.");
  ctl.hint(() => {
    preview.classList.add("showunits");
    patternStep(
      building
        ? "Compare the second and third groups with your first group. Undo to change an item."
        : "Choose two different items. Each tap adds an item to your group.",
      true,
    );
  });
  ctl.reveal(() => {
    sequence = [...unit, ...unit, ...unit];
    render();
    preview.classList.add("showunits");
  });
  st.appendChild(panel);
  render();
}
