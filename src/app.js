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
  if (S.voice) {
    unlockSpeech();
    say("Hello, friend! Let us play with numbers together.");
  }
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
$("#replayBtn").onclick = () => {
  if (R && R.q) {
    const v = S.voice;
    S.voice = true;
    say(R.q.speech);
    S.voice = v;
  }
};
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
