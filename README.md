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

- Choose 0–10 or 11–20 and an activity. Individual skills develop separately: shape recognition, pattern repair, missing parts, collecting quantities, and the other question types have their own records.
- **Show me** opens a separate picture example of the controls, with short spoken steps. Each new interaction is introduced once per session. **Again** replays the example and **My turn** returns to the question. Examples never fill the current answer or affect learning evidence. Calm mode keeps the pictures still.
- Press **Help**, **Count with me**, **Count each one**, or **Take away with me** for mathematical support. Requested help speaks even when automatic question reading is off. Counting strategies include a known five, a full ten, and counting on from the larger addend.
- A wrong answer offers a hint. A second wrong answer shows a solution and schedules a fresh question on that skill, including across rounds and reloads. Press **Next** when ready; answers and explanations have no deadline.
- Count includes moving an exact amount into a basket (tap again to return), making a number in two bowls with a retained picture of the first arrangement, rearranging objects without changing their number, and recognizing small groups. The brief-look task starts when the child chooses **Look at the dots**; **Show again** leaves the dots visible as support.
- Pattern tasks continue a complete repeat, identify the smallest repeating group, repair a mistake, and create a repeating pattern. Creation first builds a two- or three-item unit, then repeats it with the chosen unit kept above as a reference. Repair first finds the mistake, then offers replacements. Finding the repeating unit does not show grouping boundaries before help.
- Automatic narration is limited to questions where words convey the task: comparisons, named shapes, counting sides, identifying/repairing/creating a repeating group, sorting, and construction instructions. Picture counting, equations, and visible number/pattern gaps stay quiet. The question about leftover ones in two full tens is read because that distinction is expressed in words.
- **Listen** / 🔊 is available on every unfinished question, even when automatic reading is off. It repeats the current task rather than an answer or hint. In multi-step construction or repair it updates when the task changes. Routine taps, visible animal sequences, automatic hints, praise and completed answers stay quiet.
- Question, example and requested-help recordings work offline. Reading a question or replaying a control example does not count as mathematical help. Playback stops when leaving or answering a question; a blocked audio start shows a retry instruction.
- Shapes include varied and rotated triangles. Squares are accepted when a rectangle is requested. Zero, equations with the total on either side, and twenty as two tens with no leftover ones are included.
- Every solved question earns a star, including corrections and supported answers. Finishing a round earns another star and a sticker.
- Hold the Parents button for three seconds, or focus it and press Enter. Parent Corner shows each skill, a physical activity to try together, and a **Practice** button. It also includes voice, sound, round length, and reduced-motion settings.

Progress distinguishes **independent** (correct without a wrong answer or mathematical help), **supported** (correct with help or a retry), and **shown** (the game demonstrated the solution). Difficulty increases after four independent answers among the latest five at that level, with at least three distinct mathematical questions. A successful independent check on a later day is recorded separately from same-day progress. These are practice observations, not a formal assessment or evidence of educational effectiveness.

Existing stars, stickers, and activity totals are retained. Earlier first-answer accuracy may include help and is not reclassified as independent learning.

## Source layout

| File or directory                                  | Responsibility                                                               |
| -------------------------------------------------- | ---------------------------------------------------------------------------- |
| `index.html`                                       | Screen structure and explicit deferred script order                          |
| `styles/game.css`                                  | Shared components, teaching aids, responsive layout, and calm mode           |
| `src/curriculum.js`, `src/learning.js`             | Skill catalog, evidence, progression, retention checks and practice guidance |
| `src/state.js`                                     | Validated preferences and progress persistence                               |
| `src/engine.js`                                    | Round lifecycle, owned timers, scoring, follow-ups, and rewards              |
| `src/play-guides.js`                               | Separate control examples, picture controls and first-use guidance           |
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
