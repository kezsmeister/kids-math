# Math Garden

A playful math game with eight activities, adaptive difficulty, spoken help, stars, and stickers. The browser app has no runtime packages, backend, tracking, or external assets.

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

The build creates `dist/math-garden.html`, a self-contained file that can be opened without a server or network connection. Node and jsdom are only used during development. Shapes & Patterns includes recorded English narration, so its questions work without browser text-to-speech voices. Other activities use the device's available voices.

## How play works

- Choose 0–10 or 11–20 and an activity. Individual skills develop separately: shape recognition, pattern repair, missing parts, collecting quantities, and the other question types have their own records.
- Press **Help**, **Count with me**, **Count each one**, or **Show me** whenever needed. Help can be replayed. Counting strategies include a known five, a full ten, and counting on from the larger addend.
- A wrong answer offers a hint. A second wrong answer shows a solution and schedules a fresh question on that skill, including across rounds and reloads. Press **Next** when ready; answers and explanations have no deadline.
- Count includes collecting an exact amount, making a number in two different ways, rearranging objects without changing their number, and recognizing small groups. The brief-look task starts when the child chooses **Look at the dots**; **Show again** leaves the dots visible as support.
- Pattern tasks continue a complete repeat, identify the smallest repeating group, repair a mistake, and create a repeating pattern. Examples show three complete repeats before the unfinished or incorrect group.
- Shapes & Patterns reads sequences aloud, names items as a child builds a pattern, and speaks each new step. Shape hints explain their properties. The speaker button repeats the current instruction or completed explanation, including when automatic Read aloud is off.
- **Read question** always repeats the original Shapes & Patterns question, including after using Help. Its bundled recordings also work offline. Reading a question does not count as mathematical help. Playback stops when leaving or answering a question; a blocked audio start shows a retry instruction.
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
| `src/audio.js`                                     | Sound effects, speech, and motion preferences                                |
| `src/dom.js`, `src/questions.js`, `src/widgets.js` | Shared helpers, question data, and controls                                  |
| `src/activities/`                                  | Activity generators plus shared number-construction and pattern tasks        |
| `src/screens.js`, `src/app.js`                     | Screens, settings, and startup wiring                                        |
| `scripts/build.mjs`                                | Offline single-file packaging                                                |
| `tests/`                                           | Deterministic DOM, timer, persistence, accessibility, and build tests        |

Classic scripts intentionally retain a fixed order and direct-file support. If adding a source file, add its script tag to `index.html`; the builder follows that same order.

The checked-in `src/shape-voice-data.js` contains the English recordings and cue timings; `src/recorded-voice.js` schedules those cues through Web Audio. Normal builds need no speech tools or downloads. To regenerate the recordings on macOS, edit `scripts/shape-narration.json` and run `python3 scripts/record-shape-narration.py` with the Samantha voice installed. The generator checks every compressed cue for non-silent audio. The bundled voice is fixed; Parent Corner's device-voice selection applies to browser text-to-speech.

Progress uses the existing `mathgarden.v1` local-storage key. Valid fields are preserved when neighboring fields are malformed. Progress stays in the browser and origin where it was earned; an offline file and a hosted page may have separate storage. If storage is unavailable, play continues without persistence.

## Verification

See [the verification record](docs/verification.md) for regression coverage, browser checks, and the remaining physical-device speech check.
