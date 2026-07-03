# 2EZi LIFE — prototype

**Your money builds your character.** Real-life bank transactions (Tailfin feed) drive a
LifeScore (0–1500). Smart spending earns 2EZi coin and levels up the character's world;
wasteful spending visibly degrades it.

## Run it
```
npx http-server . -p 4173
```
Open http://localhost:4173 — no build step, no install. Needs internet once (three.js from CDN);
character models are bundled in `assets/`.

Demo tips: the ↺ button (top right) resets to a fresh life. Punt on the races to watch the
character collapse; three smart spends in a row starts the streak multiplier.

## What's in the loop (the addiction stack)
- **LifeScore tiers** — the room, lighting and skyline upgrade/degrade across 5 tiers
  (Struggle Street → Legend). Loss aversion: bad spending visibly downgrades the world.
- **Streaks** — Duolingo-style, with a coin multiplier (up to 2×) that resets on any bad spend.
- **Variable rewards** — chest drops on ~22%+ of smart spends (coin / Bali entries / rare).
- **Daily quests** — reward coin + entries into the existing weekly Bali draw.
- **Shop** — coin buys world items (TV, dog, car, golden aura) + IRL Bite café vouchers.
- **Qoin Economy meter** — tracks the user's cash→coin spending transition.
- **AI money coach** — scripted for now; wire LONA/Claude here for real budgeting advice,
  energy/phone plan swaps, subscription audits.
- **Character reactions** — dances on wins, collapses on gambling. This is the emotional hook.

## Architecture
- `js/economy.js` — every transaction flows through `applyTransaction()`. **Tailfin webhook
  events plug in here** ({label, amount, score}) and the entire game reacts. Nothing else changes.
- `js/scene3d.js` — Three.js world + rigged GLB avatars with animation mixer.
- `js/state.js` — localStorage save. Swap for an API when going multi-user.
- No framework, no build — static files, hostable anywhere (S3/Netlify/agent-hub).

## ⚠️ Avatar platform note (July 2026)
Ready Player Me **no longer exists** — Netflix acquired it Dec 2025 and shut all public
APIs on Jan 31, 2026. Do not plan around it. Current character system uses bundled rigged
GLBs (CC-licensed from the three.js examples library). For production-grade custom human
avatars evaluate: **Avaturn** (selfie → 3D avatar, web SDK), **MetaPerson / Avatar SDK**,
or **Genies**. Any GLB URL drops into `loadAvatar()` unchanged.

## Roadmap to production
1. Tailfin sandbox feed → `applyTransaction()` (the game is already event-driven)
2. Real Qoin wallet balance + Bite marketplace redemption
3. LONA/Claude-powered coach with real bill-swap actions
4. Accounts + server-side state, real leaderboard
5. Character customisation depth (outfits as coin sinks — the Fortnite revenue model)
6. Explorable neighbourhood with in-game Bite cafés (phase 2)
