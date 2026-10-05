"use strict";

// Question recordings are bundled with both the hosted and offline game.
// They do not depend on speechSynthesis voices or a network service.
const voiceWords = (text) =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const recordedCues = QUESTION_VOICE_DATA.clips
  .map(([text, offset, duration]) => ({
    text,
    words: voiceWords(text),
    offset,
    duration,
  }))
  .sort((a, b) => b.words.length - a.words.length);
let recordedBuffer = null,
  recordingGeneration = 0,
  recordingSources = [];

function recordedPlan(text) {
  let remaining = voiceWords(text);
  const plan = [];
  while (remaining) {
    const cue = recordedCues.find(
      (c) => remaining === c.words || remaining.startsWith(c.words + " "),
    );
    if (!cue) return null;
    plan.push(cue);
    remaining = remaining.slice(cue.words.length).trim();
  }
  return plan.length ? plan : null;
}
function speechStatus(message = "") {
  const status = document.getElementById("speechStatus");
  if (status) status.textContent = message;
}
function stopRecording() {
  recordingGeneration++;
  recordingSources.forEach((source) => {
    source.onended = null;
    try {
      source.stop();
    } catch {}
    source.disconnect();
  });
  recordingSources = [];
  speechStatus();
}
function loadRecording(context) {
  if (!recordedBuffer) {
    const bytes = Uint8Array.from(atob(QUESTION_VOICE_DATA.audio), (c) =>
      c.charCodeAt(0),
    );
    recordedBuffer = context.decodeAudioData(bytes.buffer).catch((error) => {
      recordedBuffer = null;
      throw error;
    });
  }
  return recordedBuffer;
}
function playRecording(text) {
  const plan = recordedPlan(text);
  if (!plan) return false;
  const context = ac();
  if (!context) return false;
  stopSpeaking();
  const generation = recordingGeneration;
  speechStatus("Getting the voice ready…");
  // resume() must run in the tap handler when the browser requires a gesture.
  const start = async () => {
    const ready =
      context.state === "running" ? Promise.resolve() : context.resume();
    const [, buffer] = await Promise.all([ready, loadRecording(context)]);
    if (generation !== recordingGeneration) return;
    if (context.state !== "running") throw new Error("Audio needs a tap");
    let when = context.currentTime + 0.02;
    plan.forEach(({ offset, duration }, index) => {
      const source = context.createBufferSource();
      source.buffer = buffer;
      // Spoken words bypass the quiet, low-pass sound-effect channel.
      source.connect(context.destination);
      recordingSources.push(source);
      source.onended = () => {
        source.disconnect();
        if (generation === recordingGeneration && index === plan.length - 1) {
          recordingSources = [];
          speechStatus();
        }
      };
      source.start(when, offset, duration);
      when += duration;
    });
    speechStatus("Reading aloud…");
  };
  start().catch(() => {
    if (generation !== recordingGeneration) return;
    stopRecording();
    speechStatus("Audio couldn’t start. Tap Read question to try again.");
  });
  return true;
}
