# Learning update verification

Reviewed against merged main `fc55b9d8bf9b168c0cb879f8fd20705ddd67e082`.

## Automated checks

72 tests pass using the actual application scripts, jsdom, seeded question generation and a controllable timer queue. The normal development commands remain `npm ci`, `npm test` and `npm run build`. GitHub Actions runs the same tests and build.

Coverage includes:

- Independent, supported and shown evidence; once-only recording; old saves; malformed values; rewards for correction; later-day retention; follow-ups across a round boundary.
- 984 generated questions: all 41 skill variants at all three levels, eight samples each, with complete prompts and valid, distinct choices.
- Enough mathematical variety to advance comparison and number-sequence skills; signatures describe quantities, relations and missing positions.
- Squares accepted as rectangles; missing-part hints count the missing amount; counting on from a larger addend or a full ten; zero and twenty; reversed equations.
- Exact collections including zero, distinct decompositions, conservation, a child-initiated brief look with untimed answers, pattern continuation/unit/repair/creation, and help before an error.
- Keyboard focus after moving counters and starting a pattern; timer cancellation; explicit zero hints; supported feedback; state persistence and offline packaging.
- Existing regression checks for speech/counting cancellation, ten-frame buttons, settings focus, comparison sizing, reduced motion and round rewards.

New defects were reproduced as failing tests before fixes. An independent whole-branch review identified unreachable progression in seven skill variants, lost counter focus, and an empty-frame hint that did nothing; all were fixed with regression coverage.

## Shapes & Patterns narration

Ten additional speech regression tests verify visible-sequence narration, selected item names, current-step replay, Undo, repair guidance, property hints, mute preferences, and cancellation of stale or overlapping narration. Reading the visible question does not count as mathematical assistance. Tests observe text sent to the browser speech interface; physical-device audio quality remains unverified.

### Recorded question playback fix

The user reported that even explicit replay produced no speech. The old reader only called browser text-to-speech and silently returned when unavailable; its tests did not exercise audio playback. Shapes & Patterns now uses 79 bundled English recordings (144.7 seconds, about 1.2 MB encoded) through Web Audio. The generator encoded, decoded and checked every cue for non-silent audio. Both hosted and single-file builds include the same recordings without network requests.

Eight additional regressions check playback scheduling with `speechSynthesis` entirely absent, complete recording coverage for all six question types at all three levels, explicit question reading with automatic voice disabled, preservation of the original question after hints, cancellation during decoding and replay, and visible failure messages for decode failure, suspended audio and rejected audio activation. The Web Audio boundary is simulated in jsdom; these checks verify application behavior, not physical speaker output. The offline-build test also checks the bundled recording data and question reader.

The new **Read question** control always repeats the question. The existing speaker control still repeats the current instruction or explanation. Reading does not change learning evidence. The complete 72-test suite and offline build pass. Browser-tool access to the user's open local file was blocked by URL policy, so this update's audible playback in that embedded browser remains unverified.

## Browser checks

Tested the learning update through the desktop app browser:

- **390 × 844:** Parent Corner, focused practice, collecting a target quantity, precise “one more” feedback and a corrected answer earning a star.
- **320 × 568:** keyboard construction of two decompositions, a child-created pattern repeated three times, and accessible scrolling. No horizontal overflow in the checked activities. Rechecked focus after the counter-movement fix.
- **844 × 390:** constructive activity layout and scrolling.
- Independent focused re-review: 54/54 tests pass; all seven previously blocked skills advance; fresh follow-ups, focus, zero hints and assistance tracking pass.

## Limits

Responsive browser checks do not substitute for physical iPhone/iPad speech testing. First-tap speech unlock, installed voices, interruption and background/resume behavior still need a physical-device check. No claim of a complete screen-reader/WCAG audit or measured learning effectiveness is made. Progress remains local to the browser and origin; hosted and offline copies may use separate storage.
