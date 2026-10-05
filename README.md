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

The build creates `dist/math-garden.html`, a self-contained file that can be opened without a server or network connection. Node and jsdom are only used during development. Available speech voices depend on the browser and device.

## How play works

- Choose a number range and activity. Difficulty adapts after three correct first answers or two missed questions in a row.
- Use **Count with me** or **Show me** whenever needed. Help can be replayed. A successful answer stops pending help so it cannot interrupt feedback.
- A wrong answer offers a hint. A second wrong answer shows the solution. Press **Next** when ready; explanations have no time limit.
- Ten-frame boxes are native buttons: tap, click, or use Tab and Space to add or remove a counter. **How to play** includes a separate example.
- Each correct first answer earns a star, and finishing a round earns another star and a sticker.
- Hold the Parents button for three seconds, or focus it and press Enter, to open Parent Corner. It includes progress, sound and voice settings, round length, and an animation preference. The default follows the device's reduced-motion setting.

“Correct on first answer” means no wrong answer was submitted for that question. Counting help and demonstrations are allowed and do not count as a miss.

## Source layout

| File or directory                                  | Responsibility                                                        |
| -------------------------------------------------- | --------------------------------------------------------------------- |
| `index.html`                                       | Screen structure and explicit deferred script order                   |
| `styles/game.css`                                  | Shared components, teaching aids, responsive layout, and calm mode    |
| `src/state.js`                                     | Validated preferences and progress persistence                        |
| `src/engine.js`                                    | Round lifecycle, owned timers, scoring, difficulty, and rewards       |
| `src/audio.js`                                     | Sound effects, speech, and motion preferences                         |
| `src/dom.js`, `src/questions.js`, `src/widgets.js` | Shared helpers, question data, and controls                           |
| `src/activities/`                                  | One file per activity                                                 |
| `src/screens.js`, `src/app.js`                     | Screens, settings, and startup wiring                                 |
| `scripts/build.mjs`                                | Offline single-file packaging                                         |
| `tests/`                                           | Deterministic DOM, timer, persistence, accessibility, and build tests |

Classic scripts intentionally retain a fixed order and direct-file support. If adding a source file, add its script tag to `index.html`; the builder follows that same order.

Progress uses the existing `mathgarden.v1` local-storage key. Valid fields are preserved when neighboring fields are malformed. Progress stays in the browser and origin where it was earned; an offline file and a hosted page may have separate storage. If storage is unavailable, play continues without persistence.

## Verification

See [the verification record](docs/verification.md) for regression coverage, browser checks, and the remaining physical-device speech check.
