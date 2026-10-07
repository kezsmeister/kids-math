"use strict";

ACTS.sub = {
  name: "Take Away",
  color: ["#7c8cff", "#4b58d6"],
  icon: '<div style="font-size:.8em;white-space:nowrap">🎈👆</div>',
  skill: "Act out subtraction with small groups",
  note: "Pop the requested balloons, then count those still there. The child controls the action; groups stay within five.",
  make(c, st) {
    st.classList.add("sub-st");
    st.dataset.type = "sub-story";
    const n = rnd(2, 5);
    const k = Math.random() < 0.2 ? n : rnd(1, n - 1);
    const left = n - k;
    const round = R,
      question = R.q;
    question.mathKey = `sub:${n}:${k}`;
    ctl.note(
      `${n} − ${k} = ${left}`,
      `${W[n]} take away ${W[k]} leaves ${W[left]}`,
    );

    const panel = el("div", "take-play answer-widget");
    const goal = el("div", "take-goal");
    goal.setAttribute("role", "img");
    const hand = el("span", "take-hand", "👆");
    hand.setAttribute("aria-hidden", "true");
    goal.appendChild(hand);
    const marks = Array.from({ length: k }, () => {
      const mark = el("span", "take-goal-mark", "🎈");
      mark.setAttribute("aria-hidden", "true");
      goal.appendChild(mark);
      return mark;
    });
    const scene = el("div", "take-scene");
    scene.setAttribute("role", "group");
    scene.setAttribute("aria-label", "Balloons to pop");
    panel.append(goal, scene);
    st.appendChild(panel);

    let popped = 0;
    let counting = false;
    const balloons = [];
    const popPrompt = (automatic) => {
      const remaining = k - popped;
      goal.setAttribute(
        "aria-label",
        `${remaining} ${remaining === 1 ? "balloon" : "balloons"} to pop`,
      );
      ctl.ask(
        `Pop <b class="big">${remaining}</b> 🎈`,
        `Pop ${W[remaining]} ${remaining === 1 ? "balloon" : "balloons"}.`,
        automatic,
      );
    };
    for (let i = 0; i < n; i++) {
      const balloon = el(
        "button",
        "take-balloon",
        '<span aria-hidden="true">🎈</span>',
      );
      balloon.type = "button";
      balloon.setAttribute("aria-label", `Pop balloon ${i + 1}`);
      balloon.addEventListener("click", () => {
        if (
          R !== round ||
          R.q !== question ||
          question.done ||
          counting ||
          balloon.disabled
        )
          return;
        const focused = document.activeElement === balloon;
        cancelQuestionWork();
        $("#helpStatus").textContent = "";
        scene.classList.remove("show-tap");
        balloon.disabled = true;
        balloon.classList.add("popped");
        balloon.setAttribute("aria-hidden", "true");
        marks[popped].textContent = "✓";
        marks[popped].classList.add("done");
        popped++;
        sfx.pop();
        if (popped === k) {
          counting = true;
          goal.hidden = true;
          balloons.forEach((b) => {
            b.disabled = true;
            if (!b.classList.contains("popped"))
              b.setAttribute("aria-label", "Balloon remaining");
          });
          scene.classList.add("counting");
          scene.setAttribute(
            "aria-label",
            "Balloons remaining. How many are left?",
          );
          answers.box.hidden = false;
          answers.btns.forEach((b) => (b.disabled = false));
          ctl.ask("How many left?", "How many balloons are left?");
          if (focused) answers.btns[0].focus({ preventScroll: true });
        } else {
          // The next tap and Listen refer to what still needs to be popped.
          // Routine taps stay quiet; entering the counting phase is narrated.
          popPrompt(false);
          if (focused)
            balloons.find((b) => !b.disabled)?.focus({ preventScroll: true });
        }
      });
      scene.appendChild(balloon);
      balloons.push(balloon);
    }
    const answers = makeChoices(panel, numOpts(left, 0, 5, nChoices(c)), left, {
      cls: "take-answers",
    });
    answers.box.hidden = true;
    answers.btns.forEach((b) => (b.disabled = true));
    popPrompt(TOPICS[question.topic].narrate);

    const help = () => {
      if (!counting) {
        scene.classList.add("show-tap");
        showTeaching("Tap the balloons to pop them.");
        return;
      }
      if (!left) showTeaching("None left. That is zero.");
      else countAll(balloons.filter((b) => !b.classList.contains("popped")));
    };
    ctl.hint(help);
    ctl.reveal(help);
  },
};
