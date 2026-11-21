const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = (x) => x * x * (3 - 2 * x);
const lerp = (a, b, k) => a + (b - a) * k;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const topBar = $('#top');

// ---------- 1. 첫 화면: 흩어진 조각, 남길 것에만 형광펜 ----------
// [html, x%, y%, 속도, 종류, 남김]
const FRAGS = [
  ['<b>발화</b><span class="pen">[예시 답변 ①] 쉬는 날에는…</span>', 6, 16, 0.55, 'q', 1],
  ['같은 내용 92%', 72, 13, 0.8, 'blue', 0],
  ['<b>관점</b><span class="pen">좋아함 · 산책</span>', 80, 33, 0.4, '', 1],
  ['Q. 요즘 뭐 하세요?', 3, 44, 0.7, '', 0],
  ['✕ 원문과 다름', 74, 56, 0.6, 'red', 0],
  ['<b>사실</b><span class="pen">열다섯 살 가을에 데뷔</span>', 4, 80, 0.9, '', 1],
  ['30대 초반 88%', 64, 79, 0.45, 'red', 0],
  ['✓ 원문 일치', 30, 9, 0.3, 'green', 0],
  ['<span class="pen">"할머니가 제일 먼저…"</span>', 84, 74, 0.75, 'q', 1],
  ['모순 83%', 16, 91, 0.5, 'red', 0],
  ['어린 시절 2%', 58, 92, 0.65, '', 0],
  ['<b>발화</b>[예시 답변 ③]', 88, 7, 0.4, 'q', 0],
];
const fragWrap = $('#frags');
const frags = FRAGS.map(([html, x, y, speed, cls, keep], i) => {
  const el = document.createElement('div');
  el.className = `frag${cls ? ` ${cls}` : ''}`;
  el.innerHTML = html;
  el.style.left = `${x}%`;
  el.style.top = `${y}%`;
  if (!reduceMotion) el.animate([{ opacity: 0, translate: '0 14px' }, { opacity: 1, translate: '0 0' }], { duration: 600, delay: 120 + i * 70, easing: 'cubic-bezier(.3,1.3,.5,1)', fill: 'backwards' });
  if (y > 12 && y < 86) el.classList.add('mid');
  fragWrap.append(el);
  return { el, speed, x, keep };
});
const heroCore = $('#heroCore');

function updateHero(y, vh) {
  const k = y / vh;
  for (const f of frags) {
    const drift = (f.x < 50 ? -1 : 1) * k * 110 * f.speed;
    f.el.style.transform = `translate(${drift}px, ${-y * f.speed}px)`;
    // 남길 조각은 형광펜이 칠해지며 오래 남고, 나머지는 먼저 흐려진다
    f.el.style.opacity = String(clamp(1 - k * (f.keep ? 1.2 : 2.6)));
    f.el.style.setProperty('--pen', String(clamp(k * 6 - f.speed * 0.6)));
  }
  heroCore.style.transform = `translateY(${y * 0.35}px)`;
  heroCore.style.opacity = String(clamp(1 - k * 1.3));
}

// ---------- 2. 장면 ----------
const show = $('#show');
const device = $('#device');
const deviceWrap = $('#deviceWrap');
const captions = $$('#captions li');
const bars = $$('#progress i');
const lines = $$('.line');
const cards = $$('.card');
const tabs = $$('.d-tab[data-tab]');
const pending = $('#pending');
const vInput = $('#vInput');
const vReview = $('#vReview');
const vGoals = $('#vGoals');
const extra = $('#extra');
const fix = $('#fix');
const fixBtn = $('#fixBtn');
const badState = $('#badState');
const dupSame = $('#dupSame');
const dupContra = $('#dupContra');
const approve = $('#approve');
const gRows = $$('.g-row');
const cursor = $('#cursor');
const toast = $('#toast');
let scale = 1;
let extraW = 0;
let fixH = 0;

function measure() {
  extra.style.width = '';
  fix.style.height = '';
  extraW = extra.offsetWidth;
  fixH = fix.offsetHeight;
  const stage = deviceWrap.parentElement;
  const capH = innerWidth <= 900 ? $('#captions').offsetHeight + 30 : 0;
  scale = Math.min(1, deviceWrap.clientWidth / device.offsetWidth, (stage.clientHeight - capH - 110) / device.offsetHeight);
  device.style.transform = `scale(${scale})`;
  deviceWrap.style.height = `${device.offsetHeight * scale}px`;
  for (const r of gRows) r.querySelector('u').style.left = `${(Number(r.dataset.goal) / 0.5) * 100}%`;
}

function rectOf(el) {
  const d = device.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return { x: (r.left - d.left) / scale, y: (r.top - d.top) / scale, w: r.width / scale, h: r.height / scale };
}

const START = { x: 520, y: 470 };
function moveCursor(target, k, pressed, visible) {
  const r = rectOf(target);
  const x = lerp(START.x, r.x + r.w * 0.5, ease(k));
  const y = lerp(START.y, r.y + r.h * 0.55, ease(k));
  cursor.style.opacity = visible ? '1' : '0';
  cursor.style.transform = `translate(${x}px, ${y}px) scale(${pressed ? 0.82 : 1})`;
}

function say(text) {
  toast.classList.toggle('on', !!text);
  if (text) toast.textContent = text;
}

function showCard(el, k) {
  el.style.opacity = String(k);
  el.style.transform = `translateX(${(1 - k) * 26}px)`;
}

function view(el, k) {
  el.style.opacity = String(k);
  el.style.pointerEvents = k > 0.5 ? 'auto' : 'none';
}

function scene(i, t) {
  let lineOn = 6;
  let hl = -1;
  const cardK = [0, 0, 0, 0];
  let fixK = 0; // 0: 원문과 다름, 1: 되돌림
  let rev = 0, goals = 0, same = 0, contra = 0;
  let tab = 1;
  let n = 0;
  let cur = null;
  let msg = '';

  if (i === 0) { // 원문 붙여넣기
    lineOn = Math.floor(seg(t, 0.05, 0.8) * 6.999);
  } else if (i === 1) { // 세 갈래
    const at = [0.1, 0.38, 0.66];
    at.forEach((a, c) => { cardK[c] = ease(seg(t, a, a + 0.16)); });
    if (t > 0.1) hl = 1;
    if (t > 0.66) hl = 5;
    n = cardK.filter((k) => k > 0.9).length;
  } else if (i === 2) { // 원문 대조
    cardK[0] = cardK[1] = cardK[2] = 1;
    cardK[3] = ease(seg(t, 0, 0.18));
    hl = 3;
    cur = { el: fixBtn, k: seg(t, 0.22, 0.5), pressed: t > 0.52 && t < 0.6, show: t > 0.18 && t < 0.88 };
    fixBtn.classList.toggle('press', t > 0.52 && t < 0.6);
    fixK = ease(seg(t, 0.58, 0.78));
    if (t > 0.66) msg = '원문으로 되돌렸어요';
    n = t > 0.75 ? 4 : 3;
  } else if (i === 3) { // 겹침·모순
    cardK[0] = cardK[1] = cardK[2] = cardK[3] = 1; fixK = 1; n = 4;
    rev = ease(seg(t, 0, 0.14));
    tab = rev > 0.5 ? 2 : 1;
    same = ease(seg(t, 0.18, 0.32));
    contra = ease(seg(t, 0.46, 0.6));
    if (t > 0.66) msg = '모순은 알리기만 하고, 판단은 사람이';
    approve.classList.toggle('glow', t > 0.82);
  } else { // 분포
    cardK[0] = cardK[1] = cardK[2] = cardK[3] = 1; fixK = 1; n = 4;
    rev = 1; same = 1; contra = 1;
    goals = ease(seg(t, 0, 0.14));
    tab = goals > 0.5 ? 0 : 2;
    const g = ease(seg(t, 0.16, 0.6));
    for (const r of gRows) {
      const v = Number(r.dataset.v);
      const goal = Number(r.dataset.goal);
      r.querySelector('b').style.width = `${(v / 0.5) * 100 * g}%`;
      r.querySelector('em').textContent = `${Math.round(v * 100 * g)}%`;
      r.classList.toggle('over', t > 0.66 && v > goal * 1.5);
      r.classList.toggle('under', t > 0.66 && v < goal * 0.5);
    }
  }
  if (i !== 3) approve.classList.remove('glow');
  if (i !== 2) fixBtn.classList.remove('press');
  if (i !== 4) for (const r of gRows) { r.querySelector('b').style.width = '0'; r.querySelector('em').textContent = ''; r.classList.remove('over', 'under'); }

  lines.forEach((l, k) => { l.classList.toggle('on', k < lineOn); l.classList.toggle('hl', k === hl); });
  cards.forEach((c, k) => showCard(c, cardK[k]));
  extra.style.width = `${extraW * (1 - fixK)}px`;
  extra.style.opacity = String(1 - fixK);
  fix.style.height = `${fixH * (1 - fixK)}px`;
  fix.style.marginTop = `${7 * (1 - fixK)}px`;
  fix.style.opacity = String(1 - fixK);
  const fixed = fixK > 0.5;
  badState.textContent = fixed ? '✓ 원문 일치' : '✕ 원문과 다름';
  badState.className = fixed ? 'ok' : 'ng';
  $('#badCard').classList.toggle('bad', !fixed);

  view(vInput, 1 - Math.max(rev, goals));
  view(vReview, rev * (1 - goals));
  view(vGoals, goals);
  for (const [el, k] of [[dupSame, same], [dupContra, contra]]) {
    el.style.opacity = String(k);
    el.style.transform = `translateY(${(1 - k) * 10}px)`;
  }
  tabs.forEach((el) => el.classList.toggle('on', Number(el.dataset.tab) === tab));
  if (pending.textContent !== String(n)) {
    pending.textContent = String(n);
    pending.classList.add('bump');
    setTimeout(() => pending.classList.remove('bump'), 180);
  }
  if (cur) moveCursor(cur.el, cur.k, cur.pressed, cur.show);
  else cursor.style.opacity = '0';
  say(msg);
}

let lastIdx = -1;
function updateShow(y, vh) {
  const p = clamp((y - show.offsetTop) / (show.offsetHeight - vh));
  const scaled = Math.min(p * 5, 4.9999);
  const idx = Math.floor(scaled);
  const t = scaled - idx;
  if (idx !== lastIdx) {
    captions.forEach((c, k) => c.classList.toggle('on', k === idx));
    lastIdx = idx;
  }
  bars.forEach((b, k) => b.style.setProperty('--p', k < idx ? 1 : k === idx ? t : 0));
  scene(idx, t);
}

// ---------- 3. 실제 화면: 두 줄이 반대로 흐름 ----------
const reel = $('#reel');
const reelRows = $$('.reel-row');
function updateReel(y, vh) {
  const r = reel.getBoundingClientRect();
  const k = clamp((vh - r.top) / (vh + r.height));
  for (const row of reelRows) {
    const range = Math.max(0, row.scrollWidth - innerWidth) + 120;
    const x = Number(row.dataset.dir) < 0 ? -k * range : -(1 - k) * range;
    row.style.transform = `translateX(${x}px)`;
  }
}

// ---------- 4. 내보내기 파일 ----------
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) e.target.classList.add('on');
}, { threshold: 0.4 });
$$('.file').forEach((f) => io.observe(f));

// ---------- 루프 ----------
let ticking = false;
function frame() {
  ticking = false;
  const y = scrollY;
  const vh = innerHeight;
  topBar.classList.toggle('scrolled', y > 10);
  if (!reduceMotion) updateHero(y, vh);
  updateShow(y, vh);
  if (!reduceMotion) updateReel(y, vh);
}
function request() {
  if (!ticking) { ticking = true; requestAnimationFrame(frame); }
}
addEventListener('scroll', request, { passive: true });
addEventListener('resize', () => { measure(); request(); });
addEventListener('load', () => { measure(); request(); });
(document.fonts?.ready || Promise.resolve()).then(() => { measure(); request(); });
measure();
frame();
