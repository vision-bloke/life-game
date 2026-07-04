// ═══ 2EZi LIFE — UI layer ═══
import { state, tierInfo, tierProgress, level, lifePath, passiveIncome, livingExpenses, freedomRatio } from './state.js';
import { QUESTS, SHOP, RANKS, COACH, ASSETS, BUYT_REWARDS } from './data.js';
import { claimQuest, questState, buy, qoinRatio, buyAsset, redeemBuyt } from './economy.js';

const $ = (id) => document.getElementById(id);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ── header ── */
export function renderHeader() {
  setVal('scoreVal', state.score);
  setVal('coinVal', state.coin);
  setVal('entriesVal', state.entries);
  setVal('streakVal', state.streak);
  setVal('levelVal', level());
  $('tierName').textContent = tierInfo().name;
  $('worldTier').textContent = tierInfo().name;
  $('moodBadge').textContent = tierInfo().mood;
  $('tierFill').style.width = `${tierProgress() * 100}%`;
  $('qoinPct').textContent = `${Math.round(qoinRatio() * 100)}%`;
  $('qoinFill').style.width = `${qoinRatio() * 100}%`;
  renderCashflow();
}

/* ── freedom / cashflow panel ── */
function renderCashflow() {
  const passive = passiveIncome();
  const expenses = livingExpenses();
  const salary = lifePath().salary;
  const ratio = freedomRatio();
  $('freedomPct').textContent = `${Math.min(999, Math.round(ratio * 100))}%`;
  $('freedomFill').style.width = `${Math.min(100, ratio * 100)}%`;
  $('cfSalary').textContent = `+${salary}`;
  $('cfPassive').textContent = `+${passive}`;
  $('cfExpenses').textContent = `−${expenses}`;
  const net = salary + passive - expenses;
  $('cfNet').textContent = `${net >= 0 ? '+' : ''}${net} 🪙`;
  $('freedomMeter').classList.toggle('free', state.escaped);
  $('escapedBadge').classList.toggle('hidden', !state.escaped);
}

/* ── assets tab ── */
export function renderAssets() {
  const list = $('assetList');
  list.innerHTML = '';
  for (const asset of ASSETS) {
    const count = state.assets.filter((id) => id === asset.id).length;
    const div = document.createElement('div');
    div.className = `asset-item ${count ? 'owned' : ''}`;
    div.innerHTML = `
      <div class="s-icon">${asset.icon}</div>
      <div class="s-body">
        <div class="s-name">${asset.name} ${count ? `<span class="a-count">×${count}</span>` : ''}</div>
        <div class="s-desc">${asset.desc}</div>
        <div class="a-passive">+${asset.passive} 🪙 / payweek${count ? ` (earning +${asset.passive * count})` : ''}</div>
      </div>
      <button class="shop-buy" ${state.coin < asset.cost ? 'disabled' : ''}>${asset.cost} 🪙</button>`;
    div.querySelector('.shop-buy').onclick = () => buyAsset(asset);
    list.appendChild(div);
  }
}

/* ── Buyt real rewards ── */
export function renderBuyt() {
  const list = $('buytList');
  list.innerHTML = '';
  for (const r of BUYT_REWARDS) {
    const done = state.redeemed.includes(r.id);
    const div = document.createElement('div');
    div.className = `shop-item ${done ? 'owned' : ''}`;
    div.innerHTML = `
      <div class="s-icon">${r.icon}</div>
      <div class="s-body">
        <div class="s-name">${r.name}</div>
        <div class="s-aud">Real item — $${r.aud.toFixed(2)} AUD on buyt.com.au</div>
      </div>
      <button class="shop-buy" ${done || state.coin < r.cost ? 'disabled' : ''}>${done ? 'REDEEMED' : `${r.cost} 🪙`}</button>`;
    if (!done) div.querySelector('.shop-buy').onclick = () => redeemBuyt(r);
    list.appendChild(div);
  }
}

/* ── life update modal ── */
export function showLifeUpdate() {
  const ratio = freedomRatio();
  $('updateTitle').textContent = state.playerName ? `${state.playerName}, your bank data just landed` : 'Your bank data just landed';
  $('updScore').textContent = state.score;
  $('updStreak').textContent = state.streak;
  $('updPassive').textContent = `+${passiveIncome()} 🪙`;
  $('updFreedom').textContent = `${Math.min(999, Math.round(ratio * 100))}%`;
  $('updateVerdict').innerHTML =
    state.escaped || ratio >= 1 ? '🏆 <b>You are OUT of the rat race.</b> Everything from here is stacking wealth.'
    : ratio >= 0.6 ? `You're <b>${Math.round(ratio * 100)}%</b> of the way out of the rat race. A couple more assets and your bills pay themselves.`
    : state.score >= 700 ? 'Spending looks sharp — now put that coin to work in the <b>Assets</b> tab.'
    : 'Rough patch in the data. Small moves: pay one bill on time, bank $50, skip one punt.';
  $('updateModal').classList.remove('hidden');
}
$('btnUpdateClose')?.addEventListener('click', () => $('updateModal').classList.add('hidden'));
function setVal(id, val) {
  const el = $(id);
  if (String(el.textContent) !== String(val)) {
    el.textContent = val;
    el.classList.remove('bump');
    void el.offsetWidth;         // restart animation
    el.classList.add('bump');
  }
}

/* ── feed ── */
export function addFeedItem(tx) {
  const list = $('feedList');
  const div = document.createElement('div');
  div.className = `feed-item ${tx.kind}`;
  const amt = tx.amount >= 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`;
  const scoreTxt = tx.score ? `${tx.score > 0 ? '+' : ''}${tx.score}` : '±0';
  const coinTxt = tx.coinEarned ? `<small>+${tx.coinEarned} 🪙</small>` : '';
  div.innerHTML = `
    <div class="f-icon">${tx.icon}</div>
    <div class="f-label">${tx.label}<div class="f-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ${amt}</div></div>
    <div class="f-delta">${scoreTxt}${coinTxt}</div>`;
  list.prepend(div);
  while (list.children.length > 40) list.lastChild.remove();
}

/* ── quests ── */
export function renderQuests() {
  const list = $('questList');
  list.innerHTML = '';
  for (const def of QUESTS) {
    const qs = questState(def.id);
    const done = qs.progress >= def.target;
    const div = document.createElement('div');
    div.className = `quest ${done ? 'done' : ''} ${qs.claimed ? 'claimed' : ''}`;
    div.innerHTML = `
      <div class="quest-head"><span>${def.label}</span><span class="quest-reward">+${def.coin} 🪙 · +${def.entries} 🌴</span></div>
      <div class="quest-bar"><div class="quest-fill" style="width:${(qs.progress / def.target) * 100}%"></div></div>
      ${done && !qs.claimed ? '<button class="quest-claim">CLAIM</button>' : ''}`;
    if (done && !qs.claimed) {
      div.querySelector('.quest-claim').onclick = () => claimQuest(def.id);
    }
    list.appendChild(div);
  }
}

/* ── shop ── */
export function renderShop(onBuy) {
  const list = $('shopList');
  list.innerHTML = '';
  for (const item of SHOP) {
    const owned = state.owned.includes(item.id);
    const div = document.createElement('div');
    div.className = `shop-item ${owned ? 'owned' : ''}`;
    div.innerHTML = `
      <div class="s-icon">${item.icon}</div>
      <div class="s-body"><div class="s-name">${item.name}${item.irl ? ' 🌏' : ''}</div><div class="s-desc">${item.desc}</div></div>
      <button class="shop-buy" ${owned || state.coin < item.cost ? 'disabled' : ''}>${owned ? 'OWNED' : `${item.cost} 🪙`}</button>`;
    if (!owned) {
      div.querySelector('.shop-buy').onclick = () => {
        if (buy(item)) onBuy(item);
      };
    }
    list.appendChild(div);
  }
}

/* ── ranks ── */
export function renderRanks() {
  const rows = [...RANKS, { name: 'You', score: state.score, me: true }]
    .sort((a, b) => b.score - a.score);
  const list = $('rankList');
  list.innerHTML = '';
  rows.forEach((r, i) => {
    const div = document.createElement('div');
    div.className = `rank-row ${r.me ? 'me' : ''} ${i < 3 ? 'top' : ''}`;
    const medal = ['🥇', '🥈', '🥉'][i] || `${i + 1}`;
    div.innerHTML = `<div class="r-pos">${medal}</div><div class="r-name">${r.name}</div><div class="r-score">${r.score}</div>`;
    list.appendChild(div);
  });
}

/* ── coach ── */
let coachTimer;
export function coachSay(topic) {
  const lines = COACH[topic];
  if (!lines) return;
  $('coachText').innerHTML = pick(lines);
  $('coachBubble').classList.remove('hidden');
  clearTimeout(coachTimer);
  coachTimer = setTimeout(() => $('coachBubble').classList.add('hidden'), 9000);
}

/* ── toasts ── */
export function toast(msg, cls = '') {
  const div = document.createElement('div');
  div.className = `toast ${cls}`;
  div.innerHTML = msg;
  $('toasts').appendChild(div);
  setTimeout(() => div.remove(), 3500);
}

/* ── chest modal ── */
export function showChest(reward) {
  $('chestEmoji').textContent = reward.emoji;
  $('chestTitle').textContent = reward.title;
  $('chestReward').textContent = reward.text;
  $('chestModal').classList.remove('hidden');
}
$('btnChestClaim')?.addEventListener('click', () => $('chestModal').classList.add('hidden'));

/* ── confetti ── */
const cCanvas = $('confetti');
const ctx = cCanvas.getContext('2d');
let pieces = [];
export function confetti(n = 120) {
  const w = (cCanvas.width = cCanvas.clientWidth);
  cCanvas.height = cCanvas.clientHeight;
  for (let i = 0; i < n; i++) {
    pieces.push({
      x: Math.random() * w, y: -20 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 4,
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
      color: pick(['#00d4b8', '#ffc94d', '#ff5d6c', '#3ddc84', '#4f6fc9']),
      size: 5 + Math.random() * 6,
    });
  }
  if (!confettiRunning) runConfetti();
}
let confettiRunning = false;
function runConfetti() {
  confettiRunning = true;
  const h = cCanvas.height;
  ctx.clearRect(0, 0, cCanvas.width, h);
  pieces = pieces.filter((p) => p.y < h + 20);
  if (pieces.length === 0) { confettiRunning = false; return; }
  for (const p of pieces) {
    p.x += p.vx; p.y += p.vy; p.rot += p.vr;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    ctx.restore();
  }
  requestAnimationFrame(runConfetti);
}

/* ── tabs ── */
export function initTabs() {
  document.querySelectorAll('.tab').forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-page').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`page-${btn.dataset.tab}`).classList.add('active');
    };
  });
}
