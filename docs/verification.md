# Learning update verification

## Current checks — direct play correction, 2026-10-06

85 tests pass using the actual application scripts, jsdom, seeded question generation and a controlled timer queue. The standard commands are `npm ci`, `npm test` and `npm run build`; GitHub Actions runs the same tests and build.

The tutorial removal and direct-play changes were tested against `56cb0df`: four new behavioral checks failed before implementation, then passed. Requested small-group counting help was also reproduced as a failing test before adding it. Coverage verifies:

- All eight home cards open a playable activity with the task visible, without a tutorial blocking it.
- Beginner small-group questions show dots and choices immediately, play the short question, and never hide the dots on a timer. An independent answer stays independent.
- Varied independent practice advances the existing learning record. Later-level brief looks show dots immediately and cover them after four seconds, leaving an untimed answer and another-look control. Another look is recorded as support.
- Requested help counts the actual dots aloud. Replaying the question during a brief look cannot leave an untracked unlimited exposure.
- Bowl and pattern construction show one prompt instead of repeated instruction paragraphs. Picture references and staged answer controls remain available.
- Existing mathematical coverage remains: 984 generated questions across 41 skills and three levels; exact collections including zero; distinct unordered decompositions; conservation; complete patterns; square/rectangle inclusion; missing parts; counting on; reversed equations; twenty as two tens and zero leftover ones.
- Independent/supported/shown evidence, varied practice, later-day retention, follow-up questions, rewards, saves, keyboard focus, audio cancellation and offline packaging.

The former tutorial-example tests were removed with that feature. Home-card, visible-dot and progression checks exercise its replacement. The home cards show only an icon and challenge name. Tutorial code, controls and styles were removed, along with the extra skill heading above each question.

## Offline narration

Automatic question reading remains selective, and Listen remains available on every unfinished question. Requested mathematical help speaks even when automatic reading is off. Routine taps, automatic hints and praise remain quiet.

The voice bundle contains 172 cues and 258.4 seconds of audio (2,145,969 bytes including metadata). The generator encoded, decoded and verified sound in every compressed cue, including the new “How many?” prompt. Recording-plan coverage includes 492 generated question/help combinations, shape-property descriptions, and the forced twenty-leftover-ones case. Some unused recordings from the removed tutorials remain in the bundle; no tutorial UI or playback path remains.

Web Audio tests simulate the device boundary to verify scheduling, replay, cancellation during decoding, and error handling. They do not verify physical speaker output.

## Browser verification limit

The browser tool blocked access to the open local-file URL during the earlier audio fix. The block was not bypassed. **The latest layout and audible playback in the embedded browser remain unverified.** The supplied screenshots were used as evidence of the tutorial design problem.

Earlier browser checks of the learning update covered 320×568, 390×844 and 844×390 before the tutorial and direct-play changes. Those checks covered scrolling, focus, construction, practice and correction feedback; they do not establish that the current layout was visually checked. Physical iPhone/iPad speech activation, interruption and resume behavior still need a device check.

No claim of a complete accessibility audit or measured educational effectiveness is made. Progress stays in the browser and origin where it was earned; hosted and offline copies may use separate storage.
