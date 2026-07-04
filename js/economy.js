// ═══ 2EZi LIFE — transaction engine ═══
// Central place every "real world" transaction flows through.
// When Tailfin is wired in, its webhook events land here as {label, amount, score}
// and the whole game reacts with zero other changes.

import { state, save, clampScore, tierIndex, level, lifePath, passiveIncome, livingExpenses, freedomRatio } from './state.js';
import { AMBIENT, QUESTS, ASSETS, BUYT_REWARDS } from './data.js';

const listeners = {};
export const on = (ev, fn) => (listeners[ev] = listeners[ev] || []).push(fn);
const emit = (ev, data) => (listeners[ev] || []).forEach((fn) => fn(data));

let recentKinds = [];   // sliding window for coach pattern detection

export function applyTransaction(tx) {
  // tx: { icon, label, amount, score, coin?, kind: 'good'|'bad'|'neutral', source? }
  const prevScore = state.score;
  const prevTier = tierIndex();
  const prevLevel = level();

  state.score = clampScore(state.score + (tx.score || 0));

  let coinEarned = tx.coin || 0;

  if (tx.kind === 'good') {
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    // streak multiplier: +10% coin per streak step, capped at 2x
    coinEarned = Math.round(coinEarned * Math.min(2, 1 + state.streak * 0.1));
    state.xp += Math.abs(tx.score || 0);
  } else if (tx.kind === 'bad') {
    state.streak = 0;
  }

  state.coin += coinEarned;
  if (tx.amount < 0) state.cashSpent += Math.abs(tx.amount);

  // quest progress
  if (tx.kind === 'good') bumpQuest('smart3');
  if (tx.questId) bumpQuest(tx.questId);
  if (state.streak >= 5) setQuestAtLeast('streak5', state.streak);

  recentKinds.push(tx.kind);
  if (recentKinds.length > 5) recentKinds.shift();

  save();

  emit('tx', { ...tx, coinEarned });
  if (coinEarned > 0) emit('coin', coinEarned);

  const tier = tierIndex();
  if (tier > prevTier) emit('tierUp', tier);
  if (tier < prevTier) emit('tierDown', tier);
  if (level() > prevLevel) emit('levelUp', level());

  // ── coach triggers ──
  if (tx.id === 'punt') emit('coach', 'gamble');
  else if (recentKinds.slice(-3).every((k) => k === 'bad') && recentKinds.length >= 3) emit('coach', 'badRun');
  else if (state.streak === 5) emit('coach', 'streak');
  else if (state.score < 400 && prevScore >= 400) emit('coach', 'lowScore');

  // ── variable reward: chest chance on good spends (the slot-machine hook) ──
  if (tx.kind === 'good') {
    const chance = 0.22 + Math.min(0.2, state.streak * 0.03);
    if (Math.random() < chance) emit('chest', rollChest());
  }
}

function rollChest() {
  const r = Math.random();
  if (r < 0.55) {
    const coin = 40 + Math.floor(Math.random() * 160);
    state.coin += coin; save();
    return { emoji: '🪙', title: 'Coin drop!', text: `+${coin} coin` };
  } else if (r < 0.9) {
    const entries = 1 + Math.floor(Math.random() * 4);
    state.entries += entries; save();
    return { emoji: '🌴', title: 'Bali draw entries!', text: `+${entries} entries into this week's Bali draw` };
  }
  const coin = 250;
  state.coin += coin; save();
  return { emoji: '💎', title: 'RARE DROP!', text: `Jackpot — +${coin} coin` };
}

// ── quests ──
function q(id) {
  if (!state.quests[id]) state.quests[id] = { progress: 0, claimed: false };
  return state.quests[id];
}
function bumpQuest(id) {
  const def = QUESTS.find((x) => x.id === id);
  if (!def) return;
  const quest = q(id);
  if (quest.claimed) return;
  quest.progress = Math.min(def.target, quest.progress + 1);
  emit('quests');
}
function setQuestAtLeast(id, val) {
  const def = QUESTS.find((x) => x.id === id);
  if (!def) return;
  const quest = q(id);
  if (quest.claimed) return;
  quest.progress = Math.min(def.target, Math.max(quest.progress, val));
  emit('quests');
}
export function claimQuest(id) {
  const def = QUESTS.find((x) => x.id === id);
  const quest = q(id);
  if (!def || quest.claimed || quest.progress < def.target) return false;
  quest.claimed = true;
  state.coin += def.coin;
  state.entries += def.entries;
  save();
  emit('quests');
  emit('coin', def.coin);
  emit('questClaimed', def);
  return true;
}
export const questState = (id) => q(id);

// ── shop ──
export function buy(item) {
  if (state.owned.includes(item.id) || state.coin < item.cost) return false;
  state.coin -= item.cost;
  state.coinSpent += item.cost;
  state.owned.push(item.id);
  save();
  emit('bought', item);
  return true;
}

/* ── rat race: assets, payweek cycle, escape ── */
export function buyAsset(asset) {
  if (state.coin < asset.cost) return false;
  const firstEver = state.assets.length === 0;
  state.coin -= asset.cost;
  state.coinSpent += asset.cost;
  state.assets.push(asset.id);
  save();
  emit('assetBought', asset);
  if (firstEver) emit('coach', 'firstAsset');
  checkEscape();
  return true;
}

export function redeemBuyt(reward) {
  if (state.coin < reward.cost || state.redeemed.includes(reward.id)) return false;
  state.coin -= reward.cost;
  state.coinSpent += reward.cost;
  state.redeemed.push(reward.id);
  save();
  emit('buytRedeemed', reward);
  return true;
}

export function checkEscape() {
  if (!state.escaped && freedomRatio() >= 1) {
    state.escaped = true;
    state.entries += 10;      // escape bonus: 10 Bali entries
    save();
    emit('escaped');
  }
}

// One payweek: salary + passive − expenses. This is the CASHFLOW heartbeat.
export function runCycle() {
  const salary = lifePath().salary;
  const passive = passiveIncome();
  const expenses = livingExpenses();
  const net = salary + passive - expenses;
  state.coin = Math.max(0, state.coin + net);
  state.cycleCount += 1;
  // every 3rd payweek a Life Update lands (mirrors the 3×/week Tailfin feed)
  if (state.cycleCount % 3 === 0) {
    state.updateReady = true;
    emit('lifeUpdateReady');
  }
  save();
  emit('cycle', { salary, passive, expenses, net });
  checkEscape();
}

export function startCycles() {
  setInterval(runCycle, 60000);
}

// share of spend flowing through coin instead of cash — the Qoin transition metric
export function qoinRatio() {
  const total = state.cashSpent + state.coinSpent;
  return total === 0 ? 0 : state.coinSpent / total;
}

// ── ambient feed: keeps the bank feed alive between user actions ──
const pool = AMBIENT.flatMap((t) => Array(t.weight).fill(t));
export function startAmbient() {
  setInterval(() => {
    const t = pool[Math.floor(Math.random() * pool.length)];
    applyTransaction({
      ...t,
      kind: t.score > 1 ? 'good' : t.score < 0 ? 'bad' : 'neutral',
      coin: t.score > 1 ? Math.round(t.score * 2) : 0,
      source: 'ambient',
    });
  }, 14000);
}
