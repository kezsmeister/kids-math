"use strict";

function learningRecord(key) {
  return S.learning[key] || (S.learning[key] = newLearning());
}
function chooseLearning(round) {
  const keys = Object.keys(TOPICS).filter(
    (key) => TOPICS[key].activity === round.key,
  );
  let topic;
  if (round.followUp && keys.includes(round.followUp.topic)) {
    topic = round.followUp.topic;
    round.avoidSignature = round.followUp.signature;
    round.followUp = null;
  } else if (keys.includes(round.focus)) topic = round.focus;
  else {
    const due = keys.filter((key) => {
      const r = learningRecord(key);
      return r.history.length && r.lastSeen !== learningDay();
    });
    const available = keys.filter((key) => !round.usedTopics.has(key));
    const pool =
      round.idx === 0 && due.length ? due : available.length ? available : keys;
    const least = Math.min(
      ...pool.map((key) => learningRecord(key).history.length),
    );
    topic = pick(
      pool.filter((key) => learningRecord(key).history.length === least),
    );
  }
  round.usedTopics.add(topic);
  const record = learningRecord(topic);
  const reviewLevel =
    record.lastSeen !== learningDay()
      ? record.history
          .filter(
            (item) =>
              item.outcome === "independent" &&
              item.level > record.verifiedLevel,
          )
          .reduce((lowest, item) => Math.min(lowest, item.level), record.level)
      : record.level;
  return { topic, variant: TOPICS[topic].variant, lvl: reviewLevel };
}
function recordLearning(outcome) {
  const q = R.q;
  if (q.learningRecorded) return;
  q.learningRecorded = true;
  const r = learningRecord(q.topic),
    day = learningDay();
  r[outcome]++;
  r.lastSeen = day;
  r.history.push({ outcome, day, level: q.level, signature: q.signature });
  r.history = r.history.slice(-20);
  const atLevel = r.history.filter((item) => item.level === q.level);
  const recent = atLevel.slice(-5);
  const independent = recent.filter((item) => item.outcome === "independent");
  const varied = new Set(independent.map((item) => item.signature)).size >= 3;
  if (independent.length >= 4 && varied) {
    if (
      outcome === "independent" &&
      new Set(
        atLevel
          .filter((item) => item.outcome === "independent")
          .map((item) => item.day),
      ).size >= 2
    )
      r.verifiedLevel = Math.max(r.verifiedLevel, q.level);
    if (r.level === q.level && r.level < 3) r.level++;
  }
  if (outcome === "shown") {
    R.followUp = { topic: q.topic, signature: q.signature };
    S.pendingPractice[R.key] = R.followUp;
  } else if (S.pendingPractice[R.key]?.topic === q.topic)
    delete S.pendingPractice[R.key];
  save();
}
function learningSummary(key) {
  const r = learningRecord(key);
  if (!r.history.length) return "Not explored yet";
  const last = r.history.slice(-5);
  const count = last.filter((item) => item.outcome === "independent").length;
  if (
    last.some(
      (item) => item.outcome === "supported" || item.outcome === "shown",
    )
  )
    return "Growing with support";
  if (count >= 3) return "Solving independently";
  return "Beginning to solve independently";
}
function learningRange(key, level) {
  const { activity, variant } = TOPICS[key];
  if (activity === "shapes") {
    if (variant === "find")
      return level === 1
        ? "Circles, squares and varied triangles"
        : level === 2
          ? "Including rectangles and squares"
          : "Including hexagons and stars";
    if (variant === "sides")
      return level < 3
        ? "Shapes with 3 or 4 straight sides"
        : "Shapes with 3, 4 or 6 straight sides";
    return level < 3
      ? "One next item in an AB pattern"
      : "One next item in an AB, AAB or ABB pattern";
  }
  if (activity === "sub") return "Pop and count balloons within 5";
  if (variant === "quick")
    return level === 1
      ? "Visible groups of 1–5 in familiar layouts"
      : "Visible groups of 1–5 in varied layouts";
  if (activity === "bonds" && variant === "part")
    return "Parts of numbers within 5";
  if (activity === "compare" && variant !== "quantity")
    return [
      "",
      "Clear differences",
      "Closer comparisons",
      "Subtler differences",
    ][level];
  if (activity === "tenframe" && variant === "more")
    return "Count empty spaces in a ten frame";
  return activity.endsWith("20")
    ? `Numbers 11–${[0, 14, 17, 20][level]}`
    : `Numbers within ${HI[level]}`;
}
