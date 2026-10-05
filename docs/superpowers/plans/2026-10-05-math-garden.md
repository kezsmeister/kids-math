# Math Garden Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans. Steps use checkboxes for tracking.

**Goal:** Implement all approved code and UI review recommendations.
**Architecture:** Dependency-free classic scripts with explicit load order, grouped by responsibility; single-file build for offline distribution. Question-owned scheduling, once-only outcome recording, and shared replayable assistance control protect game state.
**Tech Stack:** HTML, CSS, browser JavaScript; Node test runner and jsdom for development tests.
**Spec:** docs/superpowers/specs/2026-10-05-math-garden-design.md

## Global Constraints
- Preserve all eight activities and mathgarden.v1 saved progress.
- No runtime dependency, backend, tracking, or external font.
- Next is child-controlled; help remains replayable and stops on completion/navigation.
- First-answer accuracy means correct before submitting a wrong answer; help is allowed.

## Review Focus
- Old timers must not write into another question or round.
- Valid progress must survive malformed neighboring fields.
- Counting must finish or cancel coherently without silencing answer feedback.
- Phone resizing must preserve meaningful visual size differences.
- Keyboard users must complete building questions and access settings.

### Task 1: Reproduce defects and stabilize game behavior
Files: tests/game.test.cjs, tests/helpers.cjs, package.json, index.html (then src/state.js, src/engine.js, src/widgets.js, src/activities/add.js).
- [x] Build deterministic jsdom loader with seeded randomness and a controllable timer queue.
- [x] Assert wrong then correct leaves one attempted question and preserves level 2; old round hint cannot write to new feedback; a second counting run highlights items again; final feedback survives >7 seconds; malformed saved fields normalize safely.
- [x] Run `npm test`; confirm these fail against current behavior.
- [x] Fix once-only recording, round and question ownership/cancellation, manual advancement, replayable help and validated persistence. Run `npm test` to green.

### Task 2: Organize source and improve teaching/accessibility/layout
Files: index.html, styles/game.css, src/{dom,questions,state,audio,engine,widgets,screens}.js, src/activities/*.js, scripts/build.mjs.
- [x] Extract responsibilities and retain explicit deferred script order; build original-equivalent source without a framework.
- [x] Add semantic tests for labeled ten-frame buttons, shape choices and progress, subtraction Show me removal, and finite/valid generated questions at every level/mode.
- [x] Implement native cell controls, tutorial/demo, Show me subtraction, clear Count with me and Next controls, keyboard parent access, progress descriptions and accessible toggle state.
- [x] Make comparison size constraints proportional; enlarge teaching objects, keep small phones two-column, wrap pattern groups as complete units, consolidate CSS responsive overrides, strengthen text contrast, permit zoom, and honor calm/system reduced motion.
- [x] Run `npm test`, syntax checks, and `npm run build`.

### Task 3: Verify, review, and package
Files: README.md, docs/verification.md, release single-file HTML.
- [x] Browser checks: 320×568, 390×844, 844×390, 960×720; keyboard build/parent settings, repeated counting, subtraction demonstration, complete round, reload persistence, no runtime errors.
- [x] Fresh independent code review and fixes with regression evidence.
- [x] Document test commands, source layout, offline build and manual iOS speech check.
- [x] Commit changes on the feature branch and provide a reviewable PR or local deliverables if remote writing is unavailable. Draft PR: https://github.com/kezsmeister/kids-math/pull/1. Offline HTML also provided.
