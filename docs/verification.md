# Learning update verification

Reviewed against merged main `fc55b9d8bf9b168c0cb879f8fd20705ddd67e082`.

## Automated checks

54 tests pass using the actual application scripts, jsdom, seeded question generation and a controllable timer queue. A clean offline dependency install in an exact temporary copy succeeded; tests, the self-contained build and JavaScript syntax checks passed. The normal development commands remain `npm ci`, `npm test` and `npm run build`. GitHub Actions runs the same tests and build.

Coverage includes:

- Independent, supported and shown evidence; once-only recording; old saves; malformed values; rewards for correction; later-day retention; follow-ups across a round boundary.
- 984 generated questions: all 41 skill variants at all three levels, eight samples each, with complete prompts and valid, distinct choices.
- Enough mathematical variety to advance comparison and number-sequence skills; signatures describe quantities, relations and missing positions.
- Squares accepted as rectangles; missing-part hints count the missing amount; counting on from a larger addend or a full ten; zero and twenty; reversed equations.
- Exact collections including zero, distinct decompositions, conservation, a child-initiated brief look with untimed answers, pattern continuation/unit/repair/creation, and help before an error.
- Keyboard focus after moving counters and starting a pattern; timer cancellation; explicit zero hints; supported feedback; state persistence and offline packaging.
- Existing regression checks for speech/counting cancellation, ten-frame buttons, settings focus, comparison sizing, reduced motion and round rewards.

New defects were reproduced as failing tests before fixes. An independent whole-branch review identified unreachable progression in seven skill variants, lost counter focus, and an empty-frame hint that did nothing; all were fixed with regression coverage.

## Browser checks

Tested the learning update through the desktop app browser:

- **390 × 844:** Parent Corner, focused practice, collecting a target quantity, precise “one more” feedback and a corrected answer earning a star.
- **320 × 568:** keyboard construction of two decompositions, a child-created pattern repeated three times, and accessible scrolling. No horizontal overflow in the checked activities. Rechecked focus after the counter-movement fix.
- **844 × 390:** constructive activity layout and scrolling.
- Independent focused re-review: 54/54 tests pass; all seven previously blocked skills advance; fresh follow-ups, focus, zero hints and assistance tracking pass.

## Limits

Responsive browser checks do not substitute for physical iPhone/iPad speech testing. First-tap speech unlock, installed voices, interruption and background/resume behavior still need a physical-device check. No claim of a complete screen-reader/WCAG audit or measured learning effectiveness is made. Progress remains local to the browser and origin; hosted and offline copies may use separate storage.
