"use strict";

/* =====================================================================  Screens */
const ORDER = [
  "count",
  "tenframe",
  "bonds",
  "compare",
  "order",
  "add",
  "sub",
  "shapes",
];
function renderHome() {
  applyMotion();
  $("#starCount").textContent = S.stars;
  $("#stkCount").textContent = S.stickers.length;
  $("#stkTotal").textContent = STICKERS.length;
  $("#tSound").classList.toggle("off", !S.sound);
  $("#tSound").textContent = S.sound ? "🔔" : "🔕";
  $("#tSound").setAttribute("aria-pressed", String(S.sound));
  $("#tVoice").setAttribute("aria-pressed", String(S.voice));
  $("#tVoice").classList.toggle("off", !S.voice);
  $("#tVoice").textContent = S.voice ? "🗣️" : "🤐";
  $("#m10").classList.toggle("on", S.mode === 10);
  $("#m20").classList.toggle("on", S.mode === 20);
  $("#m10").setAttribute("aria-pressed", String(S.mode === 10));
  $("#m20").setAttribute("aria-pressed", String(S.mode === 20));
  const box = $("#cards");
  box.innerHTML = "";
  ORDER.forEach((id) => {
    const a = ACTS[id];
    if (S.mode === 20 && !a.m20) return;
    const b = el("button", "card");
    b.type = "button";
    b.dataset.act = id;
    b.style.setProperty("--c", a.color[0]);
    b.style.setProperty("--d", a.color[1]);
    b.innerHTML = `<div class="ic">${a.icon}</div><div class="nm">${S.mode === 20 && a.m20name ? a.m20name : a.name}</div>`;
    b.setAttribute(
      "aria-label",
      `${S.mode === 20 && a.m20name ? a.m20name : a.name}`,
    );
    b.addEventListener("click", () => {
      ac();
      unlockSpeech();
      startRound(id);
    });
    box.appendChild(b);
  });
}
function renderStickers() {
  $("#starCount2").textContent = S.stars;
  const g = $("#stkGrid");
  g.innerHTML = "";
  STICKERS.forEach((s) => {
    const sticker = el(
      "div",
      "stk" + (S.stickers.includes(s) ? "" : " lock"),
      s,
    );
    sticker.setAttribute("role", "img");
    sticker.setAttribute(
      "aria-label",
      `${s} ${S.stickers.includes(s) ? "earned" : "not earned yet"}`,
    );
    g.appendChild(sticker);
  });
}
/* parent corner: voice picker (Auto + every English voice, each with a sample button) */
const SAMPLE = "Hello! Let us count together.";
function refreshVoiceList() {
  const box = document.getElementById("voiceList");
  if (!box) return;
  const focusedLabel = box.contains(document.activeElement)
    ? document.activeElement.getAttribute("aria-label")
    : null;
  const en = englishVoices().filter((v) => !isNovelty(v.name));
  const auto = autoVoice(englishVoices());
  const row = (label, sel, idx, sub) =>
    `<div class="vrow${sel ? " on" : ""}"><button class="vsel" data-vi="${idx}" aria-pressed="${sel}" aria-label="Use ${escapeHTML(label)}">${sel ? "✅" : "⚪"} <b>${escapeHTML(label)}</b>${sub ? ` <small>${escapeHTML(sub)}</small>` : ""}</button><button class="vplay" data-vp="${idx}" aria-label="Play ${escapeHTML(label)} sample">▶ Play sample</button></div>`;
  let h = row(
    "Auto",
    !S.voiceName,
    -1,
    auto ? "(now: " + auto.v.name + ")" : "",
  );
  if (!en.length)
    h +=
      '<div class="small-note">No extra device voices found. Built-in question recordings can still play.</div>';
  en.forEach((v, i) => {
    h += row(
      v.name,
      S.voiceName === v.name,
      i,
      v.lang.replace("_", "-") + (isMaleName(v.name) ? " · male" : ""),
    );
  });
  box.innerHTML = h;
  box.querySelectorAll(".vsel").forEach(
    (b) =>
      (b.onclick = () => {
        const i = +b.dataset.vi;
        S.voiceName = i < 0 ? "" : en[i].name;
        save();
        pickVoice();
        refreshVoiceList();
      }),
  );
  box.querySelectorAll(".vplay").forEach(
    (b) =>
      (b.onclick = () => {
        unlockSpeech();
        const i = +b.dataset.vp;
        if (i < 0) {
          const a = autoVoice(englishVoices());
          a ? speak(SAMPLE, a.v, a.female) : speak(SAMPLE);
        } else
          speak(
            SAMPLE,
            en[i],
            prefIndex(en[i]) >= 0 || /female/i.test(en[i].name),
          );
      }),
  );
  if (focusedLabel)
    [...box.querySelectorAll("button")]
      .find((b) => b.getAttribute("aria-label") === focusedLabel)
      ?.focus({ preventScroll: true });
}
function renderParent(focusSelector) {
  const active = document.activeElement;
  if (!focusSelector && $("#parBody").contains(active)) {
    if (active.id) focusSelector = "#" + active.id;
    else if (active.dataset.pr)
      focusSelector = `[data-pr="${active.dataset.pr}"]`;
  }
  const sections = Object.entries(CURRICULUM)
    .map(([activity, skills]) => {
      const id = activity.replace(/20$/, ""),
        a = ACTS[id];
      const rows = skills
        .map(([variant, label, home]) => {
          const key = `${activity}.${variant}`,
            r = learningRecord(key);
          const range = learningRange(key, r.level);
          const retention = r.verifiedLevel
            ? `Checked independently on different days: ${learningRange(key, r.verifiedLevel)}.`
            : "Check again on another day to see what is remembered.";
          return `<article class="learning-skill" data-learning="${key}"><div><h3>${label}</h3><p class="learning-summary">${learningSummary(key)}</p><p>${range}</p><p class="small-note">${r.independent} independent · ${r.supported} supported · ${r.shown} shown</p>${r.history.length ? `<p class="small-note">${retention}</p>` : ""}<p class="home-practice"><b>Try together:</b> ${home}</p></div><button class="text-button" data-practice="${key}" aria-label="Practice ${label}${activity.endsWith("20") ? " with numbers 11 to 20" : ""}">Practice</button></article>`;
        })
        .join("");
      return `<details class="learning-section"><summary>${activity.endsWith("20") ? "11–20 · " : ""}${a.name}</summary>${rows}</details>`;
    })
    .join("");
  const totals = Object.entries(S.skills)
    .filter(([, r]) => r.att)
    .map(
      ([key, r]) =>
        `<tr><td>${key.endsWith("20") ? "11–20 · " : ""}${ACTS[key.replace(/20$/, "")].name}</td><td>${r.rounds}</td><td>${r.att}</td><td>${Math.round((100 * r.ok) / r.att)}%</td></tr>`,
    )
    .join("");
  $("#parBody").innerHTML = `
   <p class="small-note">Progress is saved on this device. Independent means correct without a wrong answer, hint or counting help. Supported includes help and successful retries. Shown means the game demonstrated the solution after two tries; the next practice question checks that skill again.</p>
   <p class="small-note">Difficulty grows after at least four independent answers among the latest five at that level, covering at least three different questions. A later-day independent check is recorded separately. These observations guide practice; they are not a formal assessment.</p>
   <div class="learning-sections">${sections}</div>
   <details class="learning-section"><summary>Activity totals, including earlier play</summary><p class="small-note">These totals preserve earlier progress. First-answer accuracy can include counting help, so it does not measure independence.</p><div class="table-scroll"><table class="ptable"><tr><th>Activity</th><th>Rounds</th><th>Questions</th><th>Correct on first answer</th></tr>${totals || '<tr><td colspan="4">No completed questions yet.</td></tr>'}</table></div></details>
   <div class="pset"><b>⭐ ${S.stars}</b> stars · <b>🎁 ${S.stickers.length}/${STICKERS.length}</b> stickers</div>
   <div class="pset"><span>Questions per round:</span>${[6, 8, 10].map((n) => `<button class="modebtn${S.perRound === n ? " on" : ""}" aria-pressed="${S.perRound === n}" data-pr="${n}">${n}</button>`).join("")}</div>
   <div class="pset"><button class="modebtn${S.sound ? " on" : ""}" id="pSound" aria-pressed="${S.sound}">🔔 Sounds ${S.sound ? "on" : "off"}</button><button class="modebtn${S.voice ? " on" : ""}" id="pVoice" aria-pressed="${S.voice}">🗣️ Read essential questions ${S.voice ? "on" : "off"}</button></div>
   <div class="pset vpick"><b>🗣️ Backup voice</b><p class="small-note">Questions use the built-in voice when available. Choose a backup voice below.</p><div id="voiceList" class="vlist"></div>
    <div class="small-note">On iPhone: Settings &gt; Accessibility &gt; Spoken Content &gt; Voices &gt; English &gt; download Samantha (Enhanced)</div></div>
   <p class="small-note">Every solved question earns a star, including corrections and answers with help. Completing a round earns another star and a sticker until the collection is full. During play, stars mark independent answers; hearts mark supported or shown answers. The three dots show the current skill’s challenge level.</p>
   <div class="pset"><label for="motionChoice">Animation:</label><select id="motionChoice"><option value="system">Follow device preference</option><option value="calm">Calm · less motion</option><option value="full">Playful · full motion</option></select></div>
   <div class="pset" id="resetArea"><button class="bigbtn orange" id="resetBtn" style="font-size:20px">Reset all progress</button></div>`;
  $("#parBody")
    .querySelectorAll("[data-practice]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          const key = b.dataset.practice,
            activity = TOPICS[key].activity;
          S.mode = activity.endsWith("20") ? 20 : 10;
          save();
          unlockSpeech();
          startRound(activity.replace(/20$/, ""), key);
        }),
    );
  $("#parBody")
    .querySelectorAll("[data-pr]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          S.perRound = +b.dataset.pr;
          save();
          renderParent();
        }),
    );
  $("#pSound").onclick = () => {
    S.sound = !S.sound;
    save();
    renderParent();
  };
  $("#pVoice").onclick = () => {
    S.voice = !S.voice;
    if (!S.voice) stopSpeaking();
    save();
    renderParent();
  };
  $("#motionChoice").value = S.motion;
  $("#motionChoice").onchange = (e) => {
    S.motion = e.target.value;
    save();
    applyMotion();
  };
  refreshVoiceList();
  $("#resetBtn").onclick = () => {
    $("#resetArea").innerHTML =
      `<span>Erase stars, stickers and progress?</span><button class="bigbtn orange" id="resetYes" style="font-size:20px">Yes, erase</button><button class="bigbtn gray" id="resetNo" style="font-size:20px">Cancel</button>`;
    $("#resetYes").onclick = () => {
      const keep = {
        sound: S.sound,
        voice: S.voice,
        voiceName: S.voiceName,
        perRound: S.perRound,
        motion: S.motion,
        frameHelpSeen: S.frameHelpSeen,
      };
      S = Object.assign(DEFAULTS(), keep);
      save();
      renderParent("#resetBtn");
      renderHome();
    };
    $("#resetNo").onclick = () => renderParent("#resetBtn");
    $("#resetNo").focus();
  };
  if (focusSelector)
    $("#parBody").querySelector(focusSelector)?.focus({ preventScroll: true });
}
