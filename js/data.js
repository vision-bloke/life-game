// ═══ 2EZi LIFE — game data ═══
// Score deltas modelled on a Tailfin-style 0–1500 behavioural credit score.

export const TIERS = [
  { min: 0,    name: 'Struggle Street', mood: '😞' },
  { min: 400,  name: 'Getting There',   mood: '😐' },
  { min: 700,  name: 'On the Up',       mood: '🙂' },
  { min: 1000, name: 'Thriving',        mood: '😎' },
  { min: 1300, name: 'Legend',          mood: '🤩' },
];

export const GOOD_ACTIONS = [
  { id: 'groceries', icon: '🛒', label: 'Groceries',              amount: -86,  score: +8,  coin: 15 },
  { id: 'gym',       icon: '💪', label: 'Gym session',            amount: -15,  score: +10, coin: 20 },
  { id: 'course',    icon: '📚', label: 'Online course',          amount: -49,  score: +15, coin: 35 },
  { id: 'save50',    icon: '🏦', label: 'Transfer $50 to savings', amount: -50, score: +20, coin: 40 },
  { id: 'paybill',   icon: '⚡', label: 'Pay power bill on time',  amount: -180, score: +12, coin: 25 },
  { id: 'invest',    icon: '📈', label: 'Invest $100',            amount: -100, score: +18, coin: 45 },
  { id: 'reno',      icon: '🔨', label: 'Home reno supplies',     amount: -120, score: +10, coin: 22 },
];

export const BAD_ACTIONS = [
  { id: 'pub',      icon: '🍻', label: 'Big night at the pub',     amount: -140, score: -12 },
  { id: 'punt',     icon: '🎰', label: 'Punt on the races',        amount: -100, score: -25 },
  { id: 'bnpl',     icon: '🛍️', label: 'BNPL splurge',             amount: -220, score: -15 },
  { id: 'latefee',  icon: '⏰', label: 'Ignore the bill (late fee)', amount: -35, score: -18 },
  { id: 'takeaway', icon: '🍔', label: 'Third takeaway this week', amount: -32,  score: -5  },
];

// One-time "money saver" wins — this is where the 2EZi business model lives:
// we broker the swap, user banks the saving, character banks the coin.
export const SAVER_ACTIONS = [
  { id: 'energy', icon: '💡', label: 'Swap energy plan',          sub: 'saves $340/yr', score: +25, coin: 150 },
  { id: 'phone',  icon: '📱', label: 'Swap phone plan',           sub: 'saves $180/yr', score: +15, coin: 90 },
  { id: 'subs',   icon: '✂️', label: 'Cancel unused subscriptions', sub: 'saves $210/yr', score: +12, coin: 70 },
];

// Ambient transactions streamed automatically to make the bank feed feel alive
export const AMBIENT = [
  { icon: '☕', label: 'Coffee',              amount: -4.5,  score: -1, weight: 4 },
  { icon: '⛽', label: 'Fuel',                amount: -62,   score: 0,  weight: 3 },
  { icon: '🎵', label: 'Music subscription',  amount: -12,   score: 0,  weight: 1 },
  { icon: '🚌', label: 'Public transport',    amount: -4.8,  score: +1, weight: 2 },
  { icon: '💰', label: 'Pay day!',            amount: +1450, score: +5, weight: 1 },
  { icon: '🏦', label: 'Savings interest',    amount: +3.2,  score: +2, weight: 1 },
  { icon: '🥪', label: 'Lunch',               amount: -14,   score: 0,  weight: 3 },
];

export const SHOP = [
  { id: 'plant',   icon: '🪴', name: 'Monstera plant',   desc: 'Your room, but alive',            cost: 120 },
  { id: 'lamp',    icon: '🛋️', name: 'Designer lamp',    desc: 'Warm mood lighting',              cost: 180 },
  { id: 'art',     icon: '🖼️', name: 'Wall art',         desc: 'Gallery-grade taste',             cost: 250 },
  { id: 'tv',      icon: '📺', name: 'Big screen TV',    desc: '75 inches of glory',              cost: 350 },
  { id: 'dog',     icon: '🐕', name: 'Loyal dog',        desc: 'A best mate for your character',  cost: 600 },
  { id: 'aura',    icon: '✨', name: 'Golden aura',      desc: 'Legendary cosmetic — flex hard',  cost: 1000 },
  { id: 'car',     icon: '🏎️', name: 'Sports car',       desc: 'The ultimate flex',               cost: 1500 },
  { id: 'bite',    icon: '☕', name: 'Bite café voucher', desc: 'Real coffee, real world — IRL spend', cost: 80, irl: true },
];

// ═══ RAT RACE layer (CASHFLOW-style) ═══
// Every cycle ("payweek", 60s real time): coin += salary + passive − expenses.
// ESCAPE THE RAT RACE when passive income ≥ living expenses.

export const LIFE_PATHS = [
  { id: 'student', icon: '🎓', name: 'Student',  desc: 'Broke but hungry. Low costs, big upside.',  salary: 22, expenses: 16, startCoin: 200 },
  { id: 'tradie',  icon: '👷', name: 'Tradie',   desc: 'Good money, tools to pay off.',             salary: 38, expenses: 28, startCoin: 300 },
  { id: 'office',  icon: '💼', name: 'Office',   desc: 'Steady 9-to-5. Comfortable trap.',          salary: 32, expenses: 24, startCoin: 250 },
  { id: 'hustler', icon: '🚀', name: 'Hustler',  desc: 'Irregular income, lives lean.',             salary: 26, expenses: 18, startCoin: 350 },
];

export const ASSETS = [
  { id: 'shares',  icon: '📊', name: 'Blue-chip shares',   desc: 'Steady dividends',            cost: 300,  passive: 6 },
  { id: 'etf',     icon: '🌐', name: 'Index ETF parcel',   desc: 'The boring millionaire move', cost: 600,  passive: 14 },
  { id: 'hustle',  icon: '🛠️', name: 'Side hustle',        desc: 'Weekend income machine',      cost: 900,  passive: 24 },
  { id: 'rental',  icon: '🏠', name: 'Rental unit',        desc: 'Tenant pays you every week',  cost: 2000, passive: 58 },
  { id: 'duplex',  icon: '🏘️', name: 'Duplex',             desc: 'Two doors, double rent',      cost: 3800, passive: 120 },
  { id: 'cafe',    icon: '☕', name: 'Café franchise',     desc: 'Your own Buyt-listed café',   cost: 6000, passive: 210 },
];

// Real products live on buyt.com.au — the coin-to-real-world bridge
export const BUYT_REWARDS = [
  { id: 'b-lunch',  icon: '🥪', name: 'QC Bakery Lunch Deal',            cost: 150,  aud: 7.5 },
  { id: 'b-shed',   icon: '🧵', name: 'She Shed Embroidery $10 Voucher', cost: 200,  aud: 10 },
  { id: 'b-wine',   icon: '🍷', name: 'Gisborne Food & Wine $10 Voucher', cost: 200, aud: 10 },
  { id: 'b-curry',  icon: '🍛', name: 'Curry @ Corio $30 Voucher',       cost: 550,  aud: 30 },
  { id: 'b-lamp',   icon: '🦉', name: 'Owl Salt Lamp',                   cost: 1100, aud: 67 },
  { id: 'b-piano',  icon: '🎹', name: 'Intro to Piano — Level 1',        cost: 1400, aud: 86 },
];

export const QUESTS = [
  { id: 'smart3',  label: 'Make 3 smart spends',      target: 3, coin: 30, entries: 1 },
  { id: 'save',    label: 'Bank $50 into savings',    target: 1, coin: 40, entries: 2 },
  { id: 'saver1',  label: 'Use a money saver',        target: 1, coin: 50, entries: 3 },
  { id: 'streak5', label: 'Hit a 5-streak',           target: 5, coin: 60, entries: 2 },
];

export const RANKS = [
  { name: 'Jess M.',    score: 1284 },
  { name: 'Deano',      score: 1191 },
  { name: 'Sarah K.',   score: 1043 },
  { name: 'Big Tommo',  score: 918 },
  { name: 'Mel C.',     score: 872 },
  { name: 'Nath',       score: 731 },
  { name: 'Kylie R.',   score: 604 },
  { name: 'Shano',      score: 449 },
];

export const COACH = {
  gamble: [
    "That punt cost you <b>25 LifeScore</b>, mate. The house always wins — your character knows it.",
    "🎰 again? Every $100 punted is a week of coffee your character never gets back.",
  ],
  badRun: [
    "Rough patch — 3 risky spends in a row. Quick win: hit a <b>Money Saver</b> on the left for instant coin.",
    "Your character's world is slipping. One savings transfer turns this around: <b>+20 score, +40 coin</b>.",
  ],
  streak: [
    "🔥 <b>5 smart moves straight.</b> This is how compounding starts. Keep the run alive.",
    "You're on a heater — every spend on this streak earns <b>bonus coin</b>.",
  ],
  tierUp: [
    "🎉 <b>Level up in life.</b> Look at that place. Real-world you did that.",
    "New tier unlocked. This is what your bank statement looks like as a home.",
  ],
  tierDown: [
    "Your world just <b>downgraded</b>. Transactions did that — transactions can fix it.",
  ],
  lowScore: [
    "Score's under 400. Real talk: swap your energy plan, cancel dead subs, bank $50 — that's <b>+57 score</b> sitting right there.",
  ],
  welcome: [
    "G'day! I'm your money coach. Every real-life transaction moves your <b>LifeScore</b>. Smart spends earn coin — waste drains your world. Try a smart move on the left.",
  ],
  ratrace: [
    "See that <b>FREEDOM</b> meter? Buy assets in the Assets tab — when your passive income beats your living expenses, you've <b>escaped the rat race</b>.",
    "Your job pays the bills. Your <b>assets</b> buy your freedom. Stack them.",
  ],
  firstAsset: [
    "🎉 Your first asset! It now pays you <b>every payweek, forever</b>. This is the game rich people play.",
  ],
  escaped: [
    "🏆 <b>YOU'VE ESCAPED THE RAT RACE.</b> Your assets now pay for your life — your salary is optional. This is financial freedom.",
  ],
  lifeUpdate: [
    "📊 Your <b>Life Update</b> is in — that's your real bank data talking. Check the damage (or the glory).",
  ],
};
