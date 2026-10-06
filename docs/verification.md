# Learning update verification

Reviewed against merged main `fc55b9d8bf9b168c0cb879f8fd20705ddd67e082`.

## Automated checks

84 tests pass using the actual application scripts, jsdom, seeded question generation and a controllable timer queue. The normal development commands remain `npm ci`, `npm test` and `npm run build`. GitHub Actions runs the same tests and build.

Coverage includes:

- Independent, supported and shown evidence; once-only recording; old saves; malformed values; rewards for correction; later-day retention; follow-ups across a round boundary.
- 984 generated questions: all 41 skill variants at all three levels, eight samples each, with complete prompts and valid, distinct choices.
- Enough mathematical variety to advance comparison and number-sequence skills; signatures describe quantities, relations and missing positions.
- Squares accepted as rectangles; missing-part hints count the missing amount; counting on from a larger addend or a full ten; zero and twenty; reversed equations.
- Exact collections including zero, distinct decompositions, conservation, a child-initiated brief look with untimed answers, pattern continuation/unit/repair/creation, and help before an error.
- Keyboard focus after moving counters and starting a pattern; timer cancellation; explicit zero hints; supported feedback; state persistence and offline packaging.
- Existing regression checks for speech/counting cancellation, ten-frame buttons, settings focus, comparison sizing, reduced motion and round rewards.

New defects were reproduced as failing tests before fixes. An independent whole-branch review identified unreachable progression in seven skill variants, lost counter focus, and an empty-frame hint that did nothing; all were fixed with regression coverage.

## Non-reader play update — 2026-10-06

The new interaction checks first failed against `9d28bc4`, then passed after implementation. They cover a real basket with focus-preserving object movement, an immutable picture of the first decomposition, empty pattern-unit slots, staged repair, three-item units with Undo/restart, always-available instruction replay, and separate control examples that do not mark assistance or change answers. First-use examples start from the home cards and stop on Home; calm mode keeps their storyboard still. Opening an example during a brief look covers the dots so cancelled timers cannot expose them indefinitely without recording support. A fresh reviewer found that a routine pattern tap could inherit speech from earlier requested help. A failing regression reproduced it; only hint callbacks now preserve permission to speak.

Automatic reading remains selective across all 41 skills, including the special leftover-ones question at twenty. Explicit Listen works on every unfinished question. Explicit mathematical help and counting are spoken, even with automatic reading off; automatic hints, routine taps and praise remain quiet. Instruction replay interrupts counting while preserving the supported learning record. Count-on sequences wait for the introductory sentence before speaking the numbers.

The offline voice contains 171 cues, 257.7 seconds, 2,141,045 bytes including audio and metadata. The generator encoded, decoded and verified sound in every compressed cue. Regression coverage checks recorded plans for all control examples and shape descriptions, plus 492 generated question/help combinations across all 41 skills and three levels, and the forced twenty-leftover-ones case. Hosted and single-file builds use the same recordings without network requests.

Playback regressions simulate the Web Audio boundary: missing browser speech support, explicit replay with automatic reading off, cancellation during decoding and replay, and visible retry messages for failed decoding or blocked activation. These verify application scheduling and cleanup, not physical speaker output.

Browser-tool access to the open local file was blocked by URL policy during the previous audio fix. That block was not bypassed. **Audible playback and the latest non-reader UI in the embedded browser remain unverified.** The browser checks below describe the earlier learning update, before these changes.

## Browser checks

Tested the learning update through the desktop app browser:

- **390 × 844:** Parent Corner, focused practice, collecting a target quantity, precise “one more” feedback and a corrected answer earning a star.
- **320 × 568:** keyboard construction of two decompositions, a child-created pattern repeated three times, and accessible scrolling. No horizontal overflow in the checked activities. Rechecked focus after the counter-movement fix.
- **844 × 390:** constructive activity layout and scrolling.
- Independent focused re-review: 54/54 tests pass; all seven previously blocked skills advance; fresh follow-ups, focus, zero hints and assistance tracking pass.

## Limits

Responsive browser checks do not substitute for physical iPhone/iPad speech testing. First-tap speech unlock, installed voices, interruption and background/resume behavior still need a physical-device check. No claim of a complete screen-reader/WCAG audit or measured learning effectiveness is made. Progress remains local to the browser and origin; hosted and offline copies may use separate storage.
