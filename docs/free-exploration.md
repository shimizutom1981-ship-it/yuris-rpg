# Norvik free exploration — v1.3.0

Original game-only vignette, not a change to novel canon. Inspired by the freedom of classic world-interaction RPGs, with no imported maps, text, music or art.

- Existing episodes and automatic tap navigation remain unchanged.
- Stand next to one of five townspeople and choose **話題** to ask about work or the broken streetlight. The ordinary tap interaction still advances the main story/shop.
- Four new inspectable objects south of the square: notice, worktable, permitted scrap box, streetlight.
- Noncombat optional repair can be solved by borrowing a coil from the innkeeper or crafting one from scrap after studying the plan. Order is free; reward is once only.
- Repair visibly lights the lamp. It can be turned off/on for inspection.
- Journal tracks chosen solution; existing version-1 saves remain compatible; new module is precached for offline play.

Validation: full `npm test`, including both routes, prerequisites, repeated-reward protection, save roundtrip and tap UI through inspect/craft/repair/toggle/topic conversation. Real screenshot verification was attempted but Chromium could not start in this sandbox (socket restriction); responsive layout not claimed visually verified.
