# Math Garden

A playful math game with eight activities, adaptive difficulty, picture-led instructions, offline narration, stars, and stickers. The browser app has no runtime packages, backend, tracking, or external assets.

## Play and develop

Serve this directory with any static server, for example:

```sh
python3 -m http.server 8765
```

Open `http://localhost:8765`. Static hosting can continue to use `index.html` at the repository root. Keep `src/` and `styles/` alongside it.

For development checks, use Node.js 20 or newer:

```sh
npm ci
npm test
npm run build
```

The build creates `dist/math-garden.html`, a self-contained file that can be opened without a server or network connection. Node and jsdom are only used during development. All narrated questions include recorded English audio and can play without browser text-to-speech voices.

## How play works

- Eight activity cards lead to 25 reviewed skills. Begin within five and extend within ten through varied independent practice. The optional 11–20 mode contains only counting visible objects and counters in two frames.
- Activities open directly on the task, with one short prompt and usable answer controls. There are no tutorial pages to read or dismiss; home cards show only the icon and challenge name.
- Count includes reading quantities, collecting an exact amount in a basket, matching a group, and rearranging objects without changing their number. Small-group questions show one to five dots at every level, with no hiding timer.
- Ten frames support counting, building a quantity, and counting empty spaces. Number bonds use counters, with missing parts limited to wholes within five. Number paths and numeral comparisons show quantity pictures before help.
- Addition joins two picture groups. Subtraction shows the starting objects with the removed objects crossed out immediately; it never removes more than five. Equations appear only as feedback where useful, not as separate questions.
- Shapes include varied sizes and orientations; squares are accepted when a rectangle is requested. Side counting starts with three or four sides. Patterns ask for **one next item**: AB at the first two levels, with AAB/ABB also available at the third.
- The two-decomposition challenge, symbolic equations/missing addends, formal teen-number tasks, sorting sequences of numerals, and multi-stage pattern puzzles have been retired. See [the complete question review](docs/age-five-review.md) for all 41 original variants and the reasons for each decision.
- Press **Help**, **Count with me**, **Count each one**, or **Take away with me** for mathematical support. Requested help speaks even when automatic question reading is off. A first wrong answer offers help; a second shows a solution and schedules a fresh question on that skill. Press **Next** when ready.
- Automatic narration reads instructions needed to choose an action, including comparisons, named shapes, sides, number bonds, empty spaces and construction. Visible counting and number/pattern gaps stay quiet. **Listen** / 🔊 repeats every unfinished question on request, without counting as mathematical help.
- Questions and requested-help recordings work offline. Routine taps, automatic hints and praise remain quiet. Playback stops when leaving or answering; a blocked audio start shows a retry instruction.
- Every solved question earns a star, including corrections and supported answers. Completing a round earns another star and a sticker.
- Hold the Parents button for three seconds, or focus it and press Enter. Parent Corner offers focused practice, activities to try together, and voice, sound, round-length and reduced-motion settings. Removed questions do not appear here or in saved follow-ups.

Progress distinguishes **independent** (correct without a wrong answer or mathematical help), **supported** (correct with help or a retry), and **shown** (the game demonstrated the solution). Difficulty increases after four independent answers among the latest five at that level, with at least three distinct mathematical questions. A successful independent check on a later day is recorded separately from same-day progress. These are practice observations, not a formal assessment or evidence of educational effectiveness.

Existing stars, stickers, activity totals, and valid historical records for retired skills are retained. Earlier first-answer accuracy may include help and is not reclassified as independent learning.

## Source layout

| File or directory                                  | Responsibility                                                               |
| -------------------------------------------------- | ---------------------------------------------------------------------------- |
| `index.html`                                       | Screen structure and explicit deferred script order                          |
| `styles/game.css`                                  | Shared components, teaching aids, responsive layout, and calm mode           |
| `src/curriculum.js`, `src/learning.js`             | Skill catalog, evidence, progression, retention checks and practice guidance |
| `src/state.js`                                     | Validated preferences and progress persistence                               |
| `src/engine.js`                                    | Round lifecycle, owned timers, scoring, follow-ups, and rewards              |
| `src/audio.js`                                     | Sound effects, speech, and motion preferences                                |
| `src/dom.js`, `src/questions.js`, `src/widgets.js` | Shared helpers, question data, and controls                                  |
| `src/activities/`                                  | Activity generators plus shared number-construction and pattern tasks        |
| `src/screens.js`, `src/app.js`                     | Screens, settings, and startup wiring                                        |
| `scripts/build.mjs`                                | Offline single-file packaging                                                |
| `tests/`                                           | Deterministic DOM, timer, persistence, accessibility, and build tests        |

Classic scripts intentionally retain a fixed order and direct-file support. If adding a source file, add its script tag to `index.html`; the builder follows that same order.

The checked-in `src/question-voice-data.js` contains the English recordings and cue timings; `src/recorded-voice.js` schedules those cues through Web Audio. Normal builds need no speech tools or downloads. To regenerate the recordings on macOS, edit `scripts/question-narration.json` and run `python3 scripts/record-question-narration.py` with the Samantha voice installed. The generator checks every compressed cue for non-silent audio. The bundled voice is fixed; Parent Corner's backup selection applies when device text-to-speech is needed.

`NARRATED_TOPICS` in `src/curriculum.js` records the question-level decisions. `ctl.ask` can override the decision for a specific question, and `ctl.instruction` updates a required new task without reading feedback. Automatic reading uses that policy; both reader buttons remain available for every unfinished question. Requested help has a separate speech flag that is cleared on cancellation.

Progress uses the existing `mathgarden.v1` local-storage key. Valid fields are preserved when neighboring fields are malformed. Progress stays in the browser and origin where it was earned; an offline file and a hosted page may have separate storage. If storage is unavailable, play continues without persistence.

## Verification

See [the verification record](docs/verification.md) for regression coverage, browser checks, and the remaining physical-device speech check.
