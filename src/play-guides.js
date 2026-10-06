"use strict";

// Control demonstrations use separate examples, never the current answer.
// They are instruction, so they do not call ctl.assist or ctl.wrong.
const shownPlayGuides = new Set();
const PLAY_GUIDES = {
  choice: [
    ["Look, then tap your answer.", "👀", "◻️ ◇ ○", "👆"],
    ["Tap the arrow for the next question.", "✓", "⭐", "➜"],
  ],
  collect: [
    ["Tap an object to put it in the basket.", "★ ★ ★", "👆 →", "🧺 ★"],
    [
      "Tap it in the basket to put it back. Press Check when you are ready.",
      "★ ← 👆",
      "🧺",
      "✓",
    ],
  ],
  compose: [
    [
      "Tap a counter to move it to the other bowl.",
      "( ● ● ● )",
      "👆 →",
      "( ● )",
    ],
    [
      "Press Check to keep a picture. Then make a different pair.",
      "📷 ( ● ● ) ( ● ● )",
      "↓",
      "( ● ● ● ) ( ● )  ✓",
    ],
  ],
  frame: [
    ["Tap a box to add a counter.", "□ □ □", "👆", "● □ □"],
    [
      "Tap again to take it away. Press Check when you are ready.",
      "● □ □",
      "👆",
      "□ □ □  ✓",
    ],
  ],
  conserve: [
    [
      "Tap the moving arrows to spread the objects out.",
      "★ ★ ★",
      "↔",
      "★　★　★",
    ],
    ["Look, then tap your answer.", "👀", "★　★　★", "👆"],
  ],
  quick: [
    ["Tap the eyes when you are ready to look.", "👀", "● ●", "👆"],
    [
      "The dots will hide. Tap your answer, or tap the eyes to look again.",
      "▧",
      "👆",
      "👀",
    ],
  ],
  create: [
    [
      "Tap items to make your group. Tap the arrow when your group is ready.",
      "👆 ★ ◆",
      "★ ◆",
      "➜",
    ],
    [
      "Keep your group in the same order. Tap items to fill the empty places.",
      "★ ◆",
      "★ ◆  □ □  □ □",
      "👆",
    ],
    [
      "The back arrow takes away the last item. Press Check when you are ready.",
      "★ ◆  ★ ◆  ★ ◆",
      "↶",
      "✓",
    ],
  ],
  repair: [
    ["First tap the item that breaks the pattern.", "★ ◆ ★ ◆ ○ ◆", "👆 ○", "↓"],
    ["Then tap its replacement.", "○ → ?", "👆 ★", "★ ◆ ★ ◆ ★ ◆"],
  ],
  extend: [
    [
      "Tap an item for the next empty place.",
      "★ ◆ ★ ◆ □ □",
      "👆 ★",
      "★ ◆ ★ ◆ ★ □",
    ],
    [
      "Keep going until the empty places are full.",
      "★ ◆ ★ ◆ ★ □",
      "👆 ◆",
      "★ ◆ ★ ◆ ★ ◆",
    ],
  ],
  unit: [
    [
      "Look for the smallest group that repeats. Tap one of the picture cards.",
      "★ ◆ ★ ◆ ★ ◆",
      "[ ★ ◆ ]   [ ◆ ★ ]",
      "👆",
    ],
  ],
  sort: [
    [
      "Tap the numbers from smallest to biggest. Each tap fills the next space.",
      "□ □ □",
      "👆 1  2  3",
      "1 □ □",
    ],
  ],
};
function playGuideFamily() {
  const { topic } = R.q;
  const variant = topic.split(".")[1];
  if (topic.startsWith("tenframe") && variant === "build") return "frame";
  if (PLAY_GUIDES[variant]) return variant;
  return "choice";
}
function pictureControl(button, icon, label, caption = label) {
  button.setAttribute("aria-label", label);
  button.innerHTML = `<span class="control-icon" aria-hidden="true">${icon}</span><span>${caption}</span>`;
  return button;
}
function hidePlayGuide() {
  $("#playDemo").hidden = true;
  $(".stageOuter").hidden = false;
  $(".promptbar").hidden = false;
  $(".lesson-help").hidden = false;
  $(".fb").hidden = false;
}
function mountPlayGuide() {
  hidePlayGuide();
  $("#demoBtn").hidden = false;
  $("#demoBtn").onclick = () => showPlayGuide(true);
  R.q.cancel.push(hidePlayGuide);
}
function offerPlayGuide() {
  if (!R?.q || R.q.done) return;
  R.guidesEnabled = true;
  const family = playGuideFamily();
  if (shownPlayGuides.has(family)) return;
  shownPlayGuides.add(family);
  showPlayGuide(S.voice);
}
function showPlayGuide(read = true) {
  if (!R?.q || R.q.done) return;
  cancelQuestionWork();
  const steps = PLAY_GUIDES[playGuideFamily()];
  const panel = $("#playDemo");
  panel.replaceChildren();
  panel.hidden = false;
  $(".stageOuter").hidden = true;
  $(".promptbar").hidden = true;
  $(".lesson-help").hidden = true;
  $(".fb").hidden = true;
  const title = el("h2", "", "👆 Show me");
  title.tabIndex = -1;
  const examples = el("div", "demo-examples");
  // All steps remain visible. With reduced motion this is a static storyboard.
  steps.forEach(([speech, ...pictures], i) => {
    const step = el("div", "demo-step");
    step.setAttribute("aria-label", `Example ${i + 1}. ${speech}`);
    const art = el("div", "demo-art");
    art.setAttribute("aria-hidden", "true");
    pictures.forEach((picture) => art.appendChild(el("div", "", picture)));
    step.append(art, el("p", "", speech));
    examples.appendChild(step);
  });
  const controls = el("div", "demo-controls");
  const replay = pictureControl(
    el("button", "text-button"),
    "🔊↻",
    "Replay example",
    "Again",
  );
  replay.id = "demoReplay";
  replay.onclick = () => showPlayGuide(true);
  const done = pictureControl(
    el("button", "bigbtn"),
    "▶",
    "My turn",
    "My turn",
  );
  done.id = "demoDone";
  done.onclick = () => {
    cancelQuestionWork();
    $("#prompt").focus({ preventScroll: true });
    // A new learner hears even an otherwise visual task after the example.
    if (S.voice) speak(R.q.questionSpeech);
  };
  controls.append(replay, done);
  panel.append(title, examples, controls);
  title.focus({ preventScroll: true });
  let delay = 0;
  steps.forEach(([speech], i) => {
    const showStep = () => {
      if (!reducedMotion()) {
        [...examples.children].forEach((step, index) =>
          step.classList.toggle("demo-active", index === i),
        );
      }
      if (read) speak(speech);
    };
    if (i === 0) showStep();
    else later(showStep, delay);
    delay += speechDuration(speech) + 500;
  });
}
