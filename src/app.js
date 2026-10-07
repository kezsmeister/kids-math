"use strict";

/* ---------- wiring ---------- */
$("#tSound").onclick = () => {
  S.sound = !S.sound;
  save();
  renderHome();
  if (S.sound) {
    ac();
    sfx.ok();
  }
};
$("#tVoice").onclick = () => {
  S.voice = !S.voice;
  if (!S.voice) stopSpeaking();
  save();
  renderHome();
};
$("#m10").onclick = () => {
  S.mode = 10;
  save();
  renderHome();
};
$("#m20").onclick = () => {
  S.mode = 20;
  save();
  renderHome();
};
$("#stkBtn").onclick = () => {
  renderStickers();
  show("stk");
};
$("#stkBack").onclick = goHome;
$("#parBack").onclick = goHome;
$("#homeBtn").onclick = goHome;
function readQuestion() {
  if (!R?.q?.questionSpeech || R.q.done) return;
  cancelQuestionWork();
  unlockSpeech();
  speak(R.q.questionSpeech);
}
$("#readQuestionBtn").onclick = readQuestion;
$("#replayBtn").onclick = readQuestion;
$("#nextBtn").onclick = () => {
  if (R && R.q && R.q.done) advance();
};
["pointerup", "touchend", "click"].forEach((ev) =>
  document.addEventListener(
    ev,
    () => {
      ac();
      unlockSpeech();
    },
    { capture: true, passive: true },
  ),
);

(function () {
  /* parent corner: hold 3 seconds */
  const b = $("#parentBtn");
  let iv = null,
    t0 = 0;
  const stop = () => {
    if (iv) {
      clearInterval(iv);
      iv = null;
    }
    b.style.setProperty("--p", "0deg");
  };
  b.addEventListener("click", (e) => {
    if (e.detail === 0) {
      stop();
      renderParent();
      show("par");
    }
  });
  b.addEventListener("pointerdown", () => {
    stop();
    t0 = performance.now();
    iv = setInterval(() => {
      const p = Math.min(1, (performance.now() - t0) / 3000);
      b.style.setProperty("--p", p * 360 + "deg");
      if (p >= 1) {
        stop();
        renderParent();
        show("par");
      }
    }, 40);
  });
  ["pointerup", "pointerleave", "pointercancel"].forEach((ev) =>
    b.addEventListener(ev, stop),
  );
})();

renderHome();
