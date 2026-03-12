/* =========================================================
   EcoPulse AI — script.js
   Green Computing Dashboard Logic
   ========================================================= */

'use strict';

// ── Utility ──────────────────────────────────────────────
const $ = id => document.getElementById(id);

// ── Particle Generator ───────────────────────────────────
(function spawnParticles() {
  const canvas = document.querySelector('.bg-canvas');
  const count = 28;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.setProperty('--dur', (6 + Math.random() * 10) + 's');
    p.style.setProperty('--delay', (Math.random() * 10) + 's');
    p.style.setProperty('--drift', (Math.random() * 120 - 60) + 'px');
    p.style.opacity = (0.15 + Math.random() * 0.5).toString();
    canvas.appendChild(p);
  }
})();

// ── Live Stats Simulation ────────────────────────────────
const stats = {
  cpu:    { val: 42, target: 42 },
  carbon: { val: 78, target: 78 },
  net:    { val: 91, target: 91 }
};

function lerp(a, b, t) { return a + (b - a) * t; }

function formatCPU(v) {
  const pct = Math.round(v);
  let color = 'green', sub = 'Optimal — low thermal load';
  if (pct > 70) { color = 'red';   sub = 'High load — consider optimization'; }
  else if (pct > 45) { color = 'amber'; sub = 'Moderate — within safe range'; }
  $('cpuVal').textContent   = pct + '%';
  $('cpuVal').className     = 'stat-value ' + color;
  $('cpuSub').textContent   = sub;
  $('cpuBar').style.width   = pct + '%';
  $('cpuBar').className     = 'prog-fill ' + color;
}

function formatCarbon(v) {
  const pct = Math.round(v);
  $('carbonVal').textContent  = pct + 'g';
  $('carbonSub').textContent  = 'CO₂ offset this session';
  $('carbonBar').style.width  = Math.min(pct, 100) + '%';
}

function formatNet(v) {
  const pct = Math.round(v);
  let color = 'green', sub = 'Excellent packet efficiency';
  if (pct < 50) { color = 'red';   sub = 'Low — potential bottleneck'; }
  else if (pct < 70) { color = 'amber'; sub = 'Fair — some packet loss'; }
  $('netVal').textContent  = pct + '%';
  $('netVal').className    = 'stat-value ' + color;
  $('netSub').textContent  = sub;
  $('netBar').style.width  = pct + '%';
  $('netBar').className    = 'prog-fill ' + color;
}

// Animate stat values smoothly
function animateStats() {
  stats.cpu.val    = lerp(stats.cpu.val,    stats.cpu.target,    0.08);
  stats.carbon.val = lerp(stats.carbon.val, stats.carbon.target, 0.08);
  stats.net.val    = lerp(stats.net.val,    stats.net.target,    0.08);
  formatCPU(stats.cpu.val);
  formatCarbon(stats.carbon.val);
  formatNet(stats.net.val);
  requestAnimationFrame(animateStats);
}
animateStats();

// Randomise targets every few seconds to simulate live data
function jitterStats() {
  stats.cpu.target    = 20  + Math.random() * 75;
  stats.carbon.target = 55  + Math.random() * 45;
  stats.net.target    = 60  + Math.random() * 38;
}
jitterStats();
setInterval(jitterStats, 4200);

// ── Carbon Analyzer ──────────────────────────────────────

const ANTI_PATTERNS = [
  { pattern: /for\s*\(.*;\s*.*;\s*.*\)/gi,           penalty: 12, label: 'Deep loop detected — consider array methods or memoization.' },
  { pattern: /while\s*\(true\)/gi,                   penalty: 18, label: 'Infinite `while(true)` loop — ensure a proper exit condition.' },
  { pattern: /setTimeout|setInterval/gi,             penalty:  8, label: 'Recurring timers found — use event-driven patterns where possible.' },
  { pattern: /document\.getElementById|querySelector/gi, penalty: 6, label: 'Repeated DOM queries — cache selectors to reduce reflows.' },
  { pattern: /fetch|XMLHttpRequest|axios/gi,         penalty:  5, label: 'Network requests detected — batch calls and cache responses.' },
  { pattern: /console\.log/gi,                       penalty:  3, label: '`console.log` calls left in — remove before production.' },
  { pattern: /new\s+Array|\.map\(|\.filter\(|\.reduce\(/gi, penalty: 4, label: 'Array allocations found — evaluate in-place mutations for hot paths.' },
  { pattern: /import\s+\*/gi,                        penalty:  7, label: 'Wildcard imports detected — use named imports for tree-shaking.' },
  { pattern: /eval\s*\(/gi,                          penalty: 20, label: '`eval()` detected — extremely energy-inefficient and a security risk.' },
  { pattern: /innerHTML/gi,                          penalty:  8, label: '`innerHTML` usage — prefer `textContent` or DOM methods to avoid repaints.' },
  { pattern: /\.forEach\(.*\.forEach\(/gs,           penalty: 14, label: 'Nested `forEach` loops — O(n²) complexity has significant energy cost.' },
  { pattern: /async|await|Promise/gi,                bonus:    6, label: 'Async patterns found — non-blocking I/O is energy-efficient.' },
  { pattern: /const|let\b/g,                         bonus:    4, label: '`const`/`let` usage — proper scoping aids engine optimisation.' },
  { pattern: /\/\/ cache|\/\/ memo|useMemo|useCallback/gi, bonus: 8, label: 'Memoisation hints detected — great for reducing redundant computation.' },
  { pattern: /\.lazy\(|React\.lazy|import\(/gi,     bonus:    7, label: 'Lazy loading patterns — reduces initial bundle energy cost.' }
];

const GRADE_MAP = [
  { min: 85, grade: 'A+', label: 'Ultra-Green',  color: '#39ff64',  bg: 'rgba(57,255,100,0.15)' },
  { min: 70, grade: 'A',  label: 'Excellent',    color: '#39ff64',  bg: 'rgba(57,255,100,0.1)'  },
  { min: 55, grade: 'B',  label: 'Good',         color: '#a3e635',  bg: 'rgba(163,230,53,0.12)' },
  { min: 40, grade: 'C',  label: 'Average',      color: '#ffc14f',  bg: 'rgba(255,193,79,0.12)' },
  { min: 25, grade: 'D',  label: 'Inefficient',  color: '#ff8c4f',  bg: 'rgba(255,140,79,0.12)' },
  { min:  0, grade: 'F',  label: 'Critical',     color: '#ff4f64',  bg: 'rgba(255,79,100,0.12)' }
];

/**
 * analyzeCode — Carbon Analyzer core function.
 * Scores 0-100 based on detected patterns. Higher = more efficient.
 */
function analyzeCode(text) {
  if (!text.trim()) return null;

  const len     = text.length;
  const lines   = text.split('\n').filter(l => l.trim()).length;
  const density = Math.min(lines / 40, 1); // code density factor

  let score   = 72; // baseline
  const tips  = [];

  for (const rule of ANTI_PATTERNS) {
    const matches = (text.match(rule.pattern) || []).length;
    if (matches > 0) {
      if (rule.penalty) {
        score -= rule.penalty * Math.min(matches, 3);
        tips.push({ text: `[×${matches}] ${rule.label}`, type: 'warn' });
      } else if (rule.bonus) {
        score += rule.bonus * Math.min(matches, 2);
        tips.push({ text: `[+] ${rule.label}`, type: 'good' });
      }
    }
  }

  // Length heuristics
  if (len > 4000) { score -= 8;  tips.push({ text: 'Large script — consider code splitting.',    type: 'warn' }); }
  if (len > 1500) { score -= 4; }
  if (len < 200 && lines > 1) { score += 5; }

  // Density bonus
  if (density < 0.3) score += 6;

  score = Math.round(Math.max(0, Math.min(100, score)));

  const grade = GRADE_MAP.find(g => score >= g.min) || GRADE_MAP[GRADE_MAP.length - 1];

  // Ensure there are always some tips
  if (tips.length === 0) {
    tips.push({ text: 'No major anti-patterns detected — code looks clean!', type: 'good' });
    tips.push({ text: 'Continue using const/let, async patterns, and lazy loading.', type: 'good' });
  }

  // Always add a general eco-tip
  const ecoTips = [
    'Consider hosting on renewable-energy powered infrastructure.',
    'Minify and compress assets before deployment to reduce transfer energy.',
    'Use a CDN to reduce network hops and lower latency energy costs.',
    'Profile with Chrome DevTools to find high CPU tasks in the main thread.',
    'Dark-mode UIs consume up to 40% less energy on OLED screens.'
  ];
  tips.push({ text: '💡 Eco tip: ' + ecoTips[Math.floor(Math.random() * ecoTips.length)], type: 'tip' });

  return { score, grade, tips };
}

function renderResult(result) {
  const panel = $('resultPanel');
  if (!result) { panel.classList.remove('show'); return; }

  const { score, grade, tips } = result;

  // Score number with animated count-up
  countUp($('scoreVal'), score, grade.color);

  // Grade chip
  const gradeEl = $('scoreGrade');
  gradeEl.textContent = `${grade.grade} — ${grade.label}`;
  gradeEl.style.color = grade.color;
  gradeEl.style.background = grade.bg;
  gradeEl.style.border = `1px solid ${grade.color}44`;

  // Score bar
  const bar = $('scoreBar');
  bar.style.width = '0%';
  requestAnimationFrame(() => {
    setTimeout(() => {
      bar.style.width = score + '%';
      const r = score < 40 ? 255 : score < 65 ? 255 : 57;
      const g = score < 40 ? 79  : score < 65 ? 193 : 255;
      bar.style.background = `linear-gradient(90deg, #0e4a1e, rgb(${r},${g},${score < 40 ? 100 : 57}))`;
      bar.style.boxShadow  = `0 0 8px rgb(${r},${g},57)`;
    }, 80);
  });

  // Tips
  const list = $('tipsList');
  list.innerHTML = '';
  tips.forEach(tip => {
    const li = document.createElement('li');
    li.textContent = tip.text;
    if (tip.type === 'good') li.style.color = 'var(--green)';
    if (tip.type === 'tip')  li.style.color = 'var(--text)';
    list.appendChild(li);
  });

  panel.classList.add('show');
}

function countUp(el, target, color) {
  let current = 0;
  const step  = Math.ceil(target / 30);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    el.style.color = color;
    if (current >= target) clearInterval(timer);
  }, 28);
}

// ── Analyzer Events ──────────────────────────────────────
$('analyzeBtn').addEventListener('click', () => {
  const text   = $('codeInput').value;
  const result = analyzeCode(text);
  renderResult(result);

  // Jitter system stats to react to analysis
  stats.cpu.target    = 55 + Math.random() * 30;
  stats.carbon.target = Math.max(30, stats.carbon.target - 5 + Math.random() * 12);
  stats.net.target    = 65 + Math.random() * 30;
});

$('clearBtn').addEventListener('click', () => {
  $('codeInput').value = '';
  $('resultPanel').classList.remove('show');
});

// Real-time debounced analysis as user types
let debounceTimer;
$('codeInput').addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const text = $('codeInput').value;
    if (text.trim().length > 30) {
      renderResult(analyzeCode(text));
    }
  }, 700);
});

// ── Ultra-Green Mode Toggle ──────────────────────────────
let ultraGreen = false;
$('ecoToggle').addEventListener('click', () => {
  ultraGreen = !ultraGreen;
  document.body.classList.toggle('ultra-green', ultraGreen);
  $('ecoToggleLabel').textContent = ultraGreen ? 'Exit Ultra-Green' : 'Ultra-Green Mode';
  $('ecoToggle').style.background = ultraGreen ? 'var(--green)' : '';
  $('ecoToggle').style.color      = ultraGreen ? '#000' : '';
});
