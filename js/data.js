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
};
