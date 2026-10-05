# Math Garden improvements

The user approved implementation of every recommendation in the code/UI review of 878dd70. Preserve the eight activities, saved progress, playful visual identity, and dependency-free browser runtime.

Fix first-answer double recording, round/question timer ownership, size comparison ratios, keyboard ten-frame controls, repeatable counting, and interrupted explanations. Children advance with Next; successful answers cancel pending assistance. Manual help remains eligible for “correct on first answer”, explicitly described in Parent Corner.

Add optional pictorial subtraction help, a first-use ten-frame demonstration, descriptive counting controls, accessible progress/toggle/shape labels, keyboard-accessible Parent Corner, reduced-motion preference, browser zoom, stronger contrast, two-column small-phone navigation, and larger teaching objects in landscape. Preserve pattern groups across line breaks.

Separate styles, state, audio, engine, widgets, question helpers, screens, and activities into focused source files. Classic deferred scripts retain direct-file support; a dependency-free build produces a single offline HTML. Validate/migrate saved state without discarding valid progress. Add deterministic DOM regression tests with a development-only DOM emulator, seeded question tests, browser checks, and run/build documentation.

No production dependencies, tracking, external fonts, or backend. Preserve the mathgarden.v1 storage key. Keep the production deployment entry point index.html. Changes live on a separate branch and are reviewable before integration.
