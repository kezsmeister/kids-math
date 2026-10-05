"use strict";

/* =====================================================================  Engine */
let R = null;
const ctl = {};
// A timer belongs to one round, one question, and one assistance generation.
function later(fn, ms) {
  const round = R,
    question = round && round.q;
  if (!round || !question) return;
  const epoch = question.epoch;
  const id = setTimeout(() => {
    round.pending.delete(id);
    if (R === round && round.q === question && question.epoch === epoch) fn();
  }, ms);
  round.pending.add(id);
  return id;
}
function cancelQuestionWork() {
  if (!R) return;
  R.pending.forEach(clearTimeout);
  R.pending.clear();
  if (R.q) {
    R.q.epoch++;
    R.q.cancel.forEach((fn) => fn());
  }
  stopSpeaking();
}
function seqRun(list, fn, gap, start = 300) {
  list.forEach((x, i) => later(() => fn(x, i), start + i * gap));
}
const countGap = () => 700;
function show(id) {
  document
    .querySelectorAll(".screen")
    .forEach((screen) => screen.classList.toggle("on", screen.id === id));
  const screen = document.getElementById(id);
  screen.setAttribute("tabindex", "-1");
  screen.focus({ preventScroll: true });
}
function lvDots(n) {
  return [1, 2, 3]
    .map((i) => `<i aria-hidden="true" class="lvd${i <= n ? " on" : ""}"></i>`)
    .join("");
}

function startRound(id, focus = null) {
  cancelQuestionWork();
  const a = ACTS[id];
  const m20 = S.mode === 20 && !!a.m20;
  const key = id + (m20 ? "20" : "");
  const pending = S.pendingPractice[key];
  R = {
    id,
    a,
    focus,
    usedTopics: new Set(),
    followUp: pending && (!focus || focus === pending.topic) ? pending : null,
    avoidSignature: null,
    m20,
    key,
    idx: 0,
    total: S.perRound,
    ok: 0,
    marks: [],
    token: 0,
    q: null,
    pending: new Set(),
  };
  show("act");
  nextQ();
}
function drawProgress() {
  const p = $("#progress");
  p.innerHTML = "";
  for (let i = 0; i < R.total; i++) {
    const d = el("div", "pd");
    d.setAttribute("aria-hidden", "true");
    if (R.marks[i]) {
      d.classList.add("done");
      d.textContent = R.marks[i] === 2 ? "⭐" : "💛";
    } else if (i === R.idx) d.classList.add("cur");
    p.appendChild(d);
  }
  const level = R.q?.level || 1;
  $("#lvpill").innerHTML = lvDots(level);
  $("#lvpill").setAttribute("aria-label", `Level ${level} of 3`);
  $("#lvpill").title = `Level ${level} of 3`;
  p.setAttribute("aria-label", `Question ${R.idx + 1} of ${R.total}`);
  $("#roundLabel").textContent = `${R.idx + 1} / ${R.total}`;
}
function nextQ() {
  cancelQuestionWork();
  R.token++;
  if (R.idx >= R.total) return finishRound();
  const st = $("#stage");
  st.innerHTML = "";
  st.className = "";
  st.removeAttribute("data-type");
  $("#prompt").innerHTML = "";
  $("#fbtext").innerHTML = "";
  $("#helpStatus").textContent = "";
  $("#nextBtn").classList.remove("show");
  const selected = chooseLearning(R);
  R.q = {
    ...selected,
    level: selected.lvl,
    assisted: false,
    learningRecorded: false,
    tries: 0,
    done: false,
    recorded: false,
    epoch: 0,
    cancel: [],
    hint: null,
    reveal: null,
    glow: null,
    note: "",
    speech: "",
    nsay: "",
    mathKey: "",
  };
  $("#skillLabel").textContent = TOPICS[selected.topic].label;
  drawProgress();
  const c = { ...selected, m20: R.m20, idx: R.idx };
  if (R.m20) st.classList.add("small");
  try {
    for (let attempt = 0; attempt < 20; attempt++) {
      if (attempt) {
        cancelQuestionWork();
        st.replaceChildren();
        R.q.cancel = [];
        R.q.mathKey = "";
        R.q.hint = null;
        R.q.reveal = null;
        R.q.glow = null;
        R.q.note = "";
        R.q.nsay = "";
      }
      R.a.make(c, st);
      R.q.signature = (
        R.q.mathKey ||
        R.q.note ||
        $("#prompt").textContent
      ).slice(0, 180);
      if (R.q.signature !== R.avoidSignature) break;
    }
    R.avoidSignature = null;
    organize(st);
    $("#hintBtn").hidden = !R.q.hint;
    $("#hintBtn").onclick = () => {
      if (!R?.q || R.q.done) return;
      cancelQuestionWork();
      R.q.hint?.();
    };
  } catch (e) {
    console.error("question error", e);
    R.marks[R.idx] = 1;
    R.idx++;
    later(nextQ, 50);
  }
}
/* Split every question into a calm QUESTION CARD (look, don't press) and a bright ANSWER TRAY (press these). */
const ANS_SEL = ".choices,.gpick,.cmp,.mh,.mv,.checkrow,.numbtn,.answer-widget";
function organize(st) {
  const kids = [...st.children];
  const card = el("div", "qcard"),
    tray = el("div", "atray");
  kids.forEach((k) => {
    const isAns =
      k.matches(ANS_SEL) ||
      k.matches(".frame-guide") ||
      k.matches(".tf-int") ||
      !!k.querySelector(".tf-int");
    (isAns ? tray : card).appendChild(k);
  });
  const t = st.dataset.type || "";
  if (![...card.children].some((child) => !child.hidden))
    card.classList.add("empty");
  if (!tray.children.length) tray.classList.add("empty");
  st.append(card, tray);
  $("#prompt").focus({ preventScroll: true });
}
function refreshQuestionReader() {
  const available = !!R?.q?.questionSpeech && !R.q.done;
  $("#readQuestionBtn").hidden = !available;
  $("#replayBtn").hidden = !available;
}
ctl.instruction = (speech, essential = TOPICS[R.q.topic].narrate) => {
  const q = R.q;
  clearTimeout(q.narrationTimer);
  R.pending.delete(q.narrationTimer);
  stopSpeaking();
  q.questionSpeech = essential ? speech || "" : "";
  refreshQuestionReader();
  if (q.questionSpeech)
    q.narrationTimer = later(() => {
      if (S.voice && !q.done) speak(q.questionSpeech);
    }, 250);
};
ctl.ask = (html, speech, essential) => {
  $("#prompt").innerHTML = html;
  R.q.speech = speech || "";
  ctl.instruction(speech, essential);
};
ctl.assist = () => {
  if (R?.q && !R.q.done) R.q.assisted = true;
};
ctl.hint = (fn) => {
  const round = R,
    question = R.q;
  question.hint = () => {
    if (R !== round || R.q !== question) return;
    ctl.assist();
    fn();
  };
};
ctl.reveal = (fn) => {
  R.q.reveal = fn;
};
ctl.note = (n, s) => {
  R.q.note = n || "";
  R.q.nsay = s || "";
};
ctl.correct = () => {
  const q = R.q;
  if (q.done) return;
  cancelQuestionWork();
  q.done = true;
  $("#helpStatus").textContent = "";
  const first = q.tries === 0;
  R.ok++;
  S.stars++;
  recSkill(first);
  const independent = first && !q.assisted;
  recordLearning(independent ? "independent" : "supported");
  R.marks[R.idx] = independent ? 2 : 1;
  sfx.ok();
  burst();
  const pr = q.tries
    ? "You checked and tried again!"
    : pick([
        "Great job!",
        "Wonderful!",
        "You did it!",
        "Lovely!",
        "That is right!",
        "Yay, well done!",
        "Super!",
      ]);
  $("#fbtext").innerHTML =
    `<span class="praise">${pr}</span>${q.note ? `<span class="note">${q.note}</span>` : ""}`;
  finishQ();
};
ctl.wrong = () => {
  const q = R.q;
  if (q.done) return;
  q.tries++;
  if (q.tries === 1) {
    recSkill(false);
    sfx.oops();
    $("#fbtext").innerHTML = `<span class="oops">Let’s look together 💛</span>`;
    if (q.hint) later(q.hint, 150);
  } else {
    cancelQuestionWork();
    q.done = true;
    R.marks[R.idx] = 1;
    sfx.oops();
    recordLearning("shown");
    if (q.reveal) q.reveal();
    if (q.glow) q.glow();
    $("#fbtext").innerHTML =
      `<span class="oops">Here it is!</span>${q.note ? `<span class="note">${q.note}</span>` : ""}`;
    finishQ();
  }
};
function finishQ() {
  refreshQuestionReader();
  $("#hintBtn").hidden = true;
  $("#nextBtn").classList.add("show");
  // Explanations and counting have no time limit. The child chooses Next.
}
function advance() {
  if (!R) return;
  R.idx++;
  nextQ();
}
/* Historical activity totals; progression uses the separate learning records. */
function recSkill(first) {
  if (R.q.recorded) return;
  R.q.recorded = true;
  const s = sk(R.key);
  if (first) {
    s.att++;
    s.ok++;
    s.streak++;
    s.miss = 0;
  } else {
    if (R.q.tries <= 1) s.att++;
    s.miss++;
    s.streak = 0;
  }
  save();
}
function toast(t) {
  const d = el("div", "toast", t);
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 2100);
}
function burst() {
  if (reducedMotion()) return;
  const fx = $("#fx");
  const em = ["⭐", "✨", "🌟", "💖", "🎉", "🌈"];
  for (let i = 0; i < 14; i++) {
    const p = el("div", "confetti", pick(em));
    p.style.left = 35 + Math.random() * 30 + "%";
    p.style.top = 40 + Math.random() * 10 + "%";
    fx.appendChild(p);
    const dx = (Math.random() - 0.5) * innerWidth * 0.8,
      dy = -(Math.random() * innerHeight * 0.4) - 40;
    if (p.animate) {
      const an = p.animate(
        [
          { transform: "translate(0,0) scale(.4)", opacity: 1 },
          {
            transform: `translate(${dx}px,${dy}px) scale(1.3) rotate(${rnd(-90, 90)}deg)`,
            opacity: 1,
            offset: 0.6,
          },
          {
            transform: `translate(${dx * 1.1}px,${dy + innerHeight * 0.5}px) scale(1)`,
            opacity: 0,
          },
        ],
        { duration: 1400 + Math.random() * 500, easing: "ease-out" },
      );
      an.onfinish = () => p.remove();
    }
    setTimeout(() => p.remove(), 2200);
  }
}
function finishRound() {
  cancelQuestionWork();
  const s = sk(R.key);
  s.rounds++;
  S.stars += 1;
  const left = STICKERS.filter((x) => !S.stickers.includes(x));
  let newSt = null;
  if (left.length) {
    newSt = pick(left);
    S.stickers.push(newSt);
  }
  save();
  const id = R.id,
    ok = R.ok;
  const stars = ok + 1;
  let h = `<div class="bigtitle">🎉 Well done! 🎉</div><div class="starsrow">`;
  for (let i = 0; i < stars; i++)
    h += `<span style="animation-delay:${i * 0.12}s">⭐</span>`;
  h += `</div>`;
  if (newSt)
    h += `<div class="stkbig">${newSt}</div><div class="bigtitle" style="font-size:clamp(22px,5vmin,40px)">New sticker!</div>`;
  else
    h += `<div class="stkbig">🏆</div><div class="bigtitle" style="font-size:clamp(22px,5vmin,40px)">You have all the stickers!</div>`;
  h += `<div class="row"><button class="bigbtn" id="againBtn" aria-label="Play again">🔁</button><button class="bigbtn blue" id="resHome" aria-label="Home">🏠</button></div>`;
  $("#resBody").innerHTML = h;
  R.token++;
  R = null;
  show("res");
  sfx.win();
  burst();
  $("#againBtn").onclick = () => startRound(id);
  $("#resHome").onclick = goHome;
}
function goHome() {
  cancelQuestionWork();
  R = null;
  renderHome();
  show("home");
}
