// ═══ 2EZi LIFE — game state + persistence ═══
import { TIERS } from './data.js';

const KEY = '2ezi-life-v1';

export const DEFAULT_AVATAR = 'assets/robot.glb';

const fresh = () => ({
  avatarUrl: DEFAULT_AVATAR,
  avatarColor: '#00d4b8',
  playerName: '',
  path: 'office',      // life path id → salary/expenses
  score: 650,
  coin: 250,
  entries: 0,
  streak: 0,
  bestStreak: 0,
  xp: 0,
  cashSpent: 0,
  coinSpent: 0,
  owned: [],
  assets: [],          // owned asset ids (repeats allowed — buy multiples)
  redeemed: [],        // Buyt reward ids
  escaped: false,      // out of the rat race
  saversUsed: [],
  quests: {},          // id -> { progress, claimed }
  cycleCount: 0,
  updateReady: false,  // a Life Update is waiting to be opened
  onboarded: false,
});

export let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = { ...fresh(), ...JSON.parse(raw) };
      // migrate saves that pointed at Ready Player Me (service shut down Jan 2026)
      if (s.avatarUrl.startsWith('http')) s.avatarUrl = DEFAULT_AVATAR;
      return s;
    }
  } catch (e) { /* corrupted save — start over */ }
  return fresh();
}

export function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function reset() {
  state = fresh();
  save();
}

export const clampScore = (s) => Math.max(0, Math.min(1500, Math.round(s)));

export function tierIndex(score = state.score) {
  let idx = 0;
  TIERS.forEach((t, i) => { if (score >= t.min) idx = i; });
  return idx;
}

export function tierInfo(score = state.score) {
  return TIERS[tierIndex(score)];
}

// Progress through the current tier, 0..1 (for the header bar)
export function tierProgress(score = state.score) {
  const i = tierIndex(score);
  const lo = TIERS[i].min;
  const hi = TIERS[i + 1] ? TIERS[i + 1].min : 1500;
  return Math.min(1, (score - lo) / (hi - lo));
}

export const level = () => Math.floor(state.xp / 100) + 1;

/* ── rat race cashflow (CASHFLOW-style) ── */
import { LIFE_PATHS, ASSETS } from './data.js';

export function lifePath() {
  return LIFE_PATHS.find((p) => p.id === state.path) || LIFE_PATHS[2];
}

export function passiveIncome() {
  return state.assets.reduce((sum, id) => {
    const a = ASSETS.find((x) => x.id === id);
    return sum + (a ? a.passive : 0);
  }, 0);
}

// lifestyle creep: higher tiers cost more to run — just like real life
export function livingExpenses() {
  const tierBump = [0, 4, 10, 18, 30][tierIndex()];
  return lifePath().expenses + tierBump;
}

// 0..1+ progress toward passive income covering expenses
export function freedomRatio() {
  return passiveIncome() / Math.max(1, livingExpenses());
}
