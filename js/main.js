// ═══ 2EZi LIFE — main orchestrator ═══
import { state, save, tierIndex } from './state.js';
import { GOOD_ACTIONS, BAD_ACTIONS, SAVER_ACTIONS } from './data.js';
import { applyTransaction, startAmbient, startCycles, checkEscape, on } from './economy.js';
import { initScene, loadAvatar, setTier, applyOwned, celebrate, setMood, react, playEmote } from './scene3d.js';
import {
  renderHeader, addFeedItem, renderQuests, renderShop, renderRanks,
  renderAssets, renderBuyt, showLifeUpdate,
  coachSay, toast, showChest, confetti, initTabs,
} from './ui.js';

const $ = (id) => document.getElementById(id);

/* ── build action buttons ── */
function actionButton(a, kind) {
  const btn = document.createElement('button');
  btn.className = `action-btn ${kind}`;
  const fx = kind === 'bad'
    ? `${a.score}`
    : `+${a.score} · +${a.coin} 🪙`;
  const amt = a.amount !== undefined
    ? (a.amount >= 0 ? `+$${a.amount}` : `-$${Math.abs(a.amount)}`)
    : (a.sub || '');
  btn.innerHTML = `
    <span class="a-icon">${a.icon}</span>
    <span class="a-body">${a.label}<div class="a-amt">${amt}</div></span>
    <span class="a-fx">${fx}</span>`;
  return btn;
}

function buildActions() {
  for (const a of GOOD_ACTIONS) {
    const btn = actionButton(a, 'good');
    btn.onclick = () => applyTransaction({
      ...a, kind: 'good',
      questId: a.id === 'save50' ? 'save' : undefined,
    });
    $('goodActions').appendChild(btn);
  }
  for (const a of BAD_ACTIONS) {
    const btn = actionButton(a, 'bad');
    btn.onclick = () => applyTransaction({ ...a, kind: 'bad' });
    $('badActions').appendChild(btn);
  }
  for (const a of SAVER_ACTIONS) {
    const btn = actionButton(a, 'saver');
    if (state.saversUsed.includes(a.id)) btn.classList.add('used');
    btn.onclick = () => {
      state.saversUsed.push(a.id);
      save();
      btn.classList.add('used');
      applyTransaction({ ...a, amount: 0, kind: 'good', questId: 'saver1' });
      toast(`💡 ${a.label} — ${a.sub}. Nice one!`, 'gold');
    };
    $('saverActions').appendChild(btn);
  }
}

/* ── game events → UI + world ── */
function wireEvents() {
  on('tx', (tx) => {
    addFeedItem(tx);
    renderHeader();
    renderQuests();
    renderShop(onBuy);
    renderAssets();
    renderBuyt();
    renderRanks();
    if (tx.source !== 'ambient') {
      react(tx.kind, tx.score || 0);
      if (tx.kind === 'good' && (tx.score || 0) >= 15) confetti(60);
    }
    if (tx.kind === 'bad' && (tx.score || 0) <= -15) {
      toast(`${tx.icon} ${tx.label}: <b style="color:#ff5d6c">${tx.score} LifeScore</b>`, 'red');
    }
  });

  on('tierUp', (tier) => {
    setTier(tier, state.owned);
    playEmote('Dance', 3200);
    confetti(220);
    coachSay('tierUp');
    toast('🏆 <b>WORLD UPGRADED</b> — your real-life spending just levelled up your character\'s life!', 'gold');
  });

  on('tierDown', (tier) => {
    setTier(tier, state.owned);
    coachSay('tierDown');
    toast('📉 Your world just downgraded…', 'red');
  });

  on('levelUp', (lvl) => {
    confetti(120);
    toast(`⭐ <b>LEVEL ${lvl}</b> — keep stacking those smart spends!`, 'gold');
  });

  on('chest', (reward) => {
    showChest(reward);
    confetti(100);
    renderHeader();
  });

  on('coach', (topic) => coachSay(topic));

  on('quests', () => { renderQuests(); renderHeader(); });

  on('questClaimed', (def) => {
    confetti(90);
    toast(`✅ Quest complete: <b>${def.label}</b> +${def.coin} 🪙 +${def.entries} 🌴`, 'gold');
  });

  on('coin', () => renderHeader());

  on('bought', () => {});   // handled via onBuy for scene updates

  /* ── rat race events ── */
  on('assetBought', (asset) => {
    renderAssets();
    renderHeader();
    react('good', 15);      // buying assets deserves a dance
    confetti(90);
    toast(`${asset.icon} <b>${asset.name}</b> acquired — +${asset.passive} 🪙 every payweek, forever.`, 'gold');
    addFeedItem({ icon: asset.icon, label: `Bought asset: ${asset.name}`, amount: 0, score: 0, kind: 'good', coinEarned: 0 });
  });

  on('cycle', ({ salary, passive, expenses, net }) => {
    renderHeader();
    renderAssets();
    addFeedItem({
      icon: '💼',
      label: `Payweek: salary +${salary}, assets +${passive}, expenses −${expenses}`,
      amount: 0, score: 0,
      kind: net >= 0 ? 'good' : 'bad',
      coinEarned: Math.max(0, net),
    });
  });

  on('escaped', () => {
    renderHeader();
    playEmote('Dance', 5000);
    confetti(300);
    coachSay('escaped');
    toast('🏆 <b>OUT OF THE RAT RACE!</b> Passive income now covers your life. +10 Bali entries!', 'gold');
  });

  on('lifeUpdateReady', () => {
    $('btnLifeUpdate').classList.remove('hidden');
    coachSay('lifeUpdate');
  });

  on('buytRedeemed', (r) => {
    renderBuyt();
    renderHeader();
    react('good', 15);
    confetti(80);
    toast(`${r.icon} <b>${r.name}</b> redeemed! Voucher sent to your 2EZi wallet — pick it up on buyt.com.au.`, 'gold');
  });
}

function onBuy(item) {
  applyOwned(state.owned);
  renderHeader();
  renderShop(onBuy);
  react('good', 15);   // dance for a new toy
  confetti(80);
  toast(`${item.icon} <b>${item.name}</b> is yours!`, 'gold');
  if (item.irl) toast('☕ Voucher sent to your 2EZi wallet — redeem at any Bite café.', 'gold');
}

/* ── Avaturn selfie → 3D avatar ──
   Free integration: project subdomain from developer.avaturn.me.
   Tim's project: lifegame.avaturn.dev */
const AVATURN_SUBDOMAIN = 'lifegame';
let avaturnSdk = null;

async function openAvaturn(onAvatar) {
  $('avaturnOverlay').classList.remove('hidden');
  try {
    const { AvaturnSDK } = await import('https://cdn.jsdelivr.net/npm/@avaturn/sdk/dist/index.js');
    avaturnSdk = new AvaturnSDK();
    await avaturnSdk.init($('avaturn-sdk-container'), { url: `https://${AVATURN_SUBDOMAIN}.avaturn.dev` });
    avaturnSdk.on('export', (data) => {
      closeAvaturn();
      onAvatar(data.url);
    });
  } catch (err) {
    closeAvaturn();
    toast('📸 Selfie creator unavailable right now — pick EZI or AXEL for today.', 'red');
  }
}
function closeAvaturn() {
  $('avaturnOverlay').classList.add('hidden');
  try { avaturnSdk?.destroy(); } catch {}
  avaturnSdk = null;
  $('avaturn-sdk-container').innerHTML = '';
}

/* ── character-select onboarding ── */
function initOnboarding() {
  if (state.onboarded) {
    $('onboarding').classList.add('hidden');
    return;
  }
  let chosenUrl = state.avatarUrl;
  let chosenColor = state.avatarColor;
  let chosenPath = state.path;

  document.querySelectorAll('.path-card').forEach((card) => {
    card.onclick = () => {
      document.querySelectorAll('.path-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      chosenPath = card.dataset.path;
    };
  });

  document.querySelectorAll('.char-card[data-char]').forEach((card) => {
    card.onclick = () => {
      document.querySelectorAll('.char-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      chosenUrl = card.dataset.char;
      // colour only applies to EZI (the robot has a tintable primary material)
      $('swatchRow').style.visibility = chosenUrl.includes('robot') ? 'visible' : 'hidden';
    };
  });

  $('btnAvaturn').onclick = () => {
    openAvaturn((url) => {
      document.querySelectorAll('.char-card').forEach((c) => c.classList.remove('selected'));
      $('btnAvaturn').classList.add('selected');
      chosenUrl = url;
      $('swatchRow').style.visibility = 'hidden';
      toast('📸 <b>Looking good!</b> Hit Start my life.', 'gold');
    });
  };
  $('btnAvaturnClose').onclick = closeAvaturn;
  document.querySelectorAll('.swatch').forEach((sw) => {
    sw.onclick = () => {
      document.querySelectorAll('.swatch').forEach((s) => s.classList.remove('selected'));
      sw.classList.add('selected');
      chosenColor = sw.dataset.color;
    };
  });

  $('btnStartLife').onclick = async () => {
    const changed = chosenUrl !== state.avatarUrl || chosenColor !== state.avatarColor;
    // data: URLs are multi-MB — load them this session but don't blow the localStorage quota
    if (!chosenUrl.startsWith('data:')) state.avatarUrl = chosenUrl;
    state.avatarColor = chosenColor;
    state.path = chosenPath;
    state.playerName = $('playerName').value.trim();
    // life path sets your starting money
    const path = (await import('./data.js')).LIFE_PATHS.find((p) => p.id === chosenPath);
    if (path) state.coin = path.startCoin;
    state.onboarded = true;
    save();
    $('onboarding').classList.add('hidden');
    if (changed) await loadAvatar(chosenUrl, state.avatarColor);
    toast('✨ <b>Character ready.</b> Now make them proud.', 'gold');
    coachSay('welcome');
  };
}

/* ── demo reset ── */
$('btnReset').onclick = () => {
  if (confirm('Reset the demo and start a fresh life?')) {
    localStorage.clear();
    location.reload();
  }
};

/* ── boot ── */
async function boot() {
  initTabs();
  buildActions();
  wireEvents();
  renderHeader();
  renderQuests();
  renderShop(onBuy);
  renderAssets();
  renderBuyt();
  renderRanks();

  $('btnLifeUpdate').onclick = () => {
    state.updateReady = false;
    save();
    $('btnLifeUpdate').classList.add('hidden');
    showLifeUpdate();
  };
  if (state.updateReady) $('btnLifeUpdate').classList.remove('hidden');

  initScene($('scene'));
  setTier(tierIndex(), state.owned);

  initOnboarding();

  await loadAvatar(state.avatarUrl, state.avatarColor);
  if (state.onboarded) coachSay('welcome');

  startAmbient();
  startCycles();
  checkEscape();   // saves loaded already free get their badge immediately
  setTimeout(() => { if (state.onboarded && state.assets.length === 0) coachSay('ratrace'); }, 25000);

  // leaderboard drift — fake players move a little so ranks feel alive
  setInterval(renderRanks, 20000);
}

boot();
