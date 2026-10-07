# Non-reader play implementation plan

> Implement inline with the executing-plans workflow; obtain a fresh review after implementation.

**Goal:** A five-year-old can start, understand, correct and complete the existing mathematical activities without an adult reading the screen.

**Approved design:** The user's preceding request approved the seven exercise adaptations in this conversation: basket collection, two bowls and a picture of the first decomposition, staged pattern creation/repair, visual repeating-unit choices, separate frame demonstrations, and spoken shape/comparison vocabulary. Preserve all mathematical learning goals and evidence rules.

**Architecture:** Keep classic scripts and the offline builder. Add a shared play-guide module for picture controls and separate picture examples with synchronized highlighting. Keep question replay separate from explicit mathematical-help speech. Task generators own their visual stages and answer validation.

**Constraints:** No external runtime dependencies or network audio. Retain existing saves and skill progression. Demonstrations and instruction replay do not mark assistance; hints/counting do. Never highlight the current correct answer during a control demonstration. Respect reduced motion. Preserve keyboard focus when moving objects. Work on the existing isolated feature branch; update the existing draft PR, not main.

**Review focus:** Pending audio after navigation; first-use demonstrations competing with question speech; saved pattern units after Undo/restart; zero and twenty; focus/overflow with large collections and three-item repeating units.

## Task 1: Shared non-reader interaction and speech

Files: `src/play-guides.js`, `src/engine.js`, `src/widgets.js`, `src/app.js`, `src/audio.js`, `src/recorded-voice.js`, `index.html`, `styles/game.css`, `tests/non-reader.test.cjs`.

- [x] Add failing tests: every unfinished task exposes instruction replay; opening/replaying a separate guide leaves `R.q.assisted` false and answer state unchanged; leaving cancels guide timers; explicit Help/counting speaks while an automatic hint stays quiet.
- [x] Run `node --test tests/non-reader.test.cjs` with the existing jsdom runtime; confirm those new assertions fail.
- [x] Implement `pictureControl(button, icon, label)`, `mountPlayGuide()` and a separate example board with a hand cue, large replay and return-to-task controls. Use owned question timers and static end states for reduced motion.
- [x] Add `helpSpeak(text)` and `helpDelay(silentDelay)` for requested mathematical help. Keep one instruction speaker on every question; reader buttons share `readQuestion()`. Explicit hint handlers enable help speech; cancellation clears it. Keep praise and routine taps silent.
- [x] Update obsolete narration tests for always-available replay and requested help. Run the full suite.

## Task 2: Concrete activities and complete offline speech

Files: `src/activities/number-play.js`, `src/activities/patterns.js`, `src/activities/shapes.js`, counting/ten-frame/bond activities, `scripts/question-narration.json`, `src/question-voice-data.js`, documentation and construction tests.

- [x] Add failing tests: selected collection objects move into a basket and retain focus; first decomposition remains as a picture; creation starts with visible empty unit slots and stage-specific controls; repair disables the old selection stage after choosing an item.
- [x] Implement the basket, bowl snapshot and staged pattern controls. Keep choices neutral until mathematical help is requested, preserve two/three-item unit options and distinct decomposition validation.
- [x] Shorten question speech, add spoken help for the existing visual teaching actions and pair frame/shape help with its visual demonstration. Keep independent answer reasoning intact.
- [x] Regenerate local recordings and verify compressed cues contain audio. Check all generated questions and explicit help have complete recorded coverage.
- [x] Run the full suite, build and diff checks. Have a fresh reviewer inspect behavior and educational invariants while preparing the deliverable and docs. Fix substantive findings with regressions.
- [x] Atomically replace `outputs/math-garden.html` and prepare the reviewed change for the existing PR. The PR records the final commit, publication and CI status. Browser-tool access to the current local-file URL is blocked; do not bypass it or claim an audible/browser visual check.

## Progress

- Plan created from the approved in-chat design. Existing worktree clean at `9d28bc4`.

- Initial eight regression tests failed, then passed. Existing 78-test suite passed; expanded 83-test suite passed. Fresh review identified one speech-state leak from Help to ordinary pattern taps; reproduced with a failing test and fixed. Final 84-test suite passes; build and diff checks pass; the same reviewer approved the fix. Offline deliverable replaced and verified byte-for-byte.
