# Learning update verification

## Current checks — Take Away remake, 2026-10-07

81 tests pass using the actual application scripts, jsdom, seeded question generation and a controlled timer queue. Standard commands: `npm ci`, `npm test`, `npm run build`. GitHub Actions runs the same tests and build.

The complete [question review](age-five-review.md) covers all 41 original variants and levels 1–3. Sixteen formats were removed; 25 remain. Eight targeted regressions failed against the preceding version, then passed after implementation. The subsequent Take Away remake added eight regressions that first failed against the crossed-out-object version. The replacement tests cover the new action and counting phases; the obsolete static-picture tests were removed.

Coverage includes:

- The exact active catalog and parent practice entries, including safe fallback from all sixteen retired focused topics.
- Old saved follow-ups cannot restore removed questions; earned rewards survive. Valid retired learning records remain historical only.
- 11–20 home cards offer only visible-object and two-frame counting.
- Dots stay visible through waiting and question replay at every level; there is no hiding timer.
- Take Away opens with 2–5 tappable balloons. Each tap pops exactly one; rapid repeated taps cannot remove extras. Only after the requested number is popped do number choices become available.
- Both action and counting instructions are automatically spoken when enabled, and Listen always repeats the current instruction. Replay does not reset popped balloons. Requested help first points out the tapping action, then counts only remaining balloons, including an empty result. Keyboard focus moves off popped balloons. No timer or animation completion is required.
- Pattern continuation needs one next item, with two animal kinds; all three levels can be completed in one choice.
- Known number-path quantities and numeral-comparison dots appear before help. Missing-part wholes never exceed five. Empty-frame questions explicitly ask for empty spaces and are narrated.
- All 25 retained skills can be completed through actual visible controls at all three levels, then advance to a new question without assistance being incorrectly recorded.
- 600 seeded generated questions (25 skills × 3 levels × 8 samples), valid answer choices, exact collections and zero, conservation, square/rectangle inclusion, missing parts and counting on.
- Independent/supported/shown evidence, varied practice, later-day retention, follow-ups, rewards, saves, keyboard focus, audio cancellation and offline packaging.

Tests for deliberately retired generators were removed. Catalog, route, save and replacement-behavior tests cover their exclusion. Home cards still show only an icon and challenge name; there are no tutorial pages.

## Offline narration

Automatic question reading remains selective; Listen is available on every unfinished question. Number bonds, counting empty spaces and both Take Away phases are automatically read because their required action depends on words. Requested mathematical help speaks even when automatic reading is off. Routine taps, automatic hints and praise remain quiet.

The voice bundle contains 180 cues and 268.6 seconds of audio (2,229,836 bytes including metadata). The generator encoded, decoded and checked each compressed cue for sound, including the five balloon-pop instructions, the remaining-balloon question and the tap instruction. Recording-plan coverage includes 300 generated question/help combinations (25 × 3 × 4), shape-property descriptions, all active topics at every level, and each phase of Take Away. Unused recordings from retired questions/tutorials remain in the bundle but have no active question path.

Web Audio tests simulate the device boundary to verify scheduling, replay, cancellation during decoding, and error handling. They do not verify physical speaker output.

## Browser verification limit

The browser tool blocked access to the open local-file URL during the earlier audio fix. The block was not bypassed. **The latest layout and audible playback in the embedded browser remain unverified.** The supplied screenshots informed the content and interaction review.

Earlier browser checks covered 320×568, 390×844 and 844×390 before the direct-play and age-five changes; they do not establish that the current layout was visually checked. Physical iPhone/iPad speech activation, interruption and resume behavior still need a device check.

No claim of a complete accessibility audit, clinical assessment, classroom trial or measured educational effectiveness is made. Progress stays in the browser and origin where it was earned; hosted and offline copies may use separate storage.
