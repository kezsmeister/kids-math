"use strict";

// Two animal kinds distinguish patterns without relying on colour or reading.
const PATTERN_TOKENS = [
  ["🐱", "cat"],
  ["🐶", "dog"],
  ["🐸", "frog"],
  ["🐰", "rabbit"],
];
const patternName = (t) => PATTERN_TOKENS.find((x) => x[0] === t)?.[1] || t;
function patternRow(sequence, unitLength) {
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
      "span",
      "pattern-slot" + (!token ? " blank" : ""),
      token || "?",
    );
    cell.setAttribute(
      "aria-label",
      `Position ${i + 1}: ${token ? patternName(token) : "empty"}`,
    );
    row.lastElementChild.appendChild(cell);
  });
  return row;
}
function makePattern(c, st) {
  st.dataset.type = "pattern-extend";
  const tokens = shuffle(PATTERN_TOKENS.map((x) => x[0]));
  const kind = c.lvl < 3 ? "AB" : pick(["AB", "AAB", "ABB"]);
  const unit = [...kind].map((letter) => tokens[letter.charCodeAt(0) - 65]);
  const sequence = [...unit, ...unit, ...unit];
  R.q.mathKey = `extend:${kind}:${unit.join("")}`;
  ctl.ask("What comes next?", "Tap an item for the next empty place.");
  const note = `${unit.map(patternName).join(", ")} repeats.`;
  ctl.note(note, note);
  const panel = el("div", "pattern-play answer-widget");
  const row = patternRow([...sequence, null], unit.length);
  const blank = row.querySelector(".blank");
  const fill = () => {
    blank.textContent = unit[0];
    blank.classList.remove("blank");
    blank.setAttribute("aria-label", patternName(unit[0]));
  };
  panel.appendChild(row);
  makeChoices(panel, shuffle(tokens.slice(0, c.lvl === 1 ? 2 : 3)), unit[0], {
    btnCls: "pattern-option",
    label: patternName,
    onRight: fill,
    onReveal: fill,
  });
  ctl.hint(() => {
    row.classList.add("showunits");
    showTeaching("Look back at the first group. Follow the same order.");
  });
  ctl.reveal(() => {
    fill();
    row.classList.add("showunits");
  });
  st.appendChild(panel);
}
