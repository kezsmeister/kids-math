# Verification record

Implementation reviewed against baseline commit `878dd7090186940014a331217ca9e7f23ce00cab`.

## Automated coverage

All 20 tests passed. The test suite uses Node's test runner, jsdom, seeded question generation, and a controllable timer queue. It exercises the real application source in its declared script order. GitHub Actions runs tests and builds on pull requests and pushes to main.

- One attempted question for a wrong answer followed by a correction; no premature difficulty decrease.
- Old-round callbacks and delayed hints cannot overwrite current feedback.
- Feedback remains until Next; answering cancels counting; help can be replayed.
- Revealing a group restarts and completes an interrupted count.
- Native, labeled ten-frame buttons; named shape choices; keyboard Parent Corner access.
- Voice selected state and keyboard focus after changing settings.
- Subtraction demonstration removes exactly the stated number of objects.
- Comparison proportions remain distinct at 320, 375, and 390 pixels wide.
- 432 generated questions across all activities, supported number ranges, and three difficulty levels have valid choices and complete content.
- Round rewards, persistence, malformed data, unavailable storage, and reduced motion.
- Offline build embeds assets in the right order and starts a playable game.

The initial baseline run failed 13 of 16 checks. Three further review findings were reproduced as failing tests before their fixes. The cancellation test was tightened to observe counting before the old automatic-advance deadline.

On this machine, dependency/source reads under Documents intermittently stalled. Verification was also run against an exact copy in a temporary directory with the same jsdom 26.1.0 dependency. This was a local filesystem workaround; the normal commands remain `npm ci`, `npm test`, and `npm run build`.

## Browser checks

Checked in the desktop app's browser using responsive viewport sizes:

- **320 × 568:** two-column activity cards; footer controls stay outside the scrolling cards.
- **390 × 844:** subtraction Show me, keyboard ten-frame completion, first-use instructions, settings selected state, and keyboard focus retention.
- **844 × 390:** larger teen-count objects and complete groups of five arranged in two columns; counting replay clears and restores highlights; answering cancels counting; full-round rewards remain reachable.
- **960 × 720:** home and offline build smoke check.

The offline build loaded with no browser warnings or errors during the smoke check.

Completed a six-question round through the UI. Seven stars and one sticker were awarded; reloading preserved the resulting totals of 21 stars and 2 stickers in the local test profile.

## Physical-device follow-up

Responsive desktop checks do not substitute for an iPhone/iPad speech check. On a physical device, verify first-tap speech unlock, an installed English voice, interruption by a correct answer or Home, and replay after returning from the background. This was not physically tested here. No claim of a complete screen-reader or WCAG audit is made.
