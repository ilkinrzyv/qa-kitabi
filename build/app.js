(function () {
'use strict';

/* =========================================================
   1. Data
   ========================================================= */
document.documentElement.lang = 'az';
const BOOK = window.QA_BOOK || JSON.parse(document.getElementById('book-data').textContent);
const PWA = window.QA_PWA || null; // offline app build: own API key, local storage only
const CHAPTERS = BOOK.chapters;
const chById = {}, secById = {}, secCh = {}, taskById = {}, selfById = {};
CHAPTERS.forEach(c => {
  chById[c.id] = c;
  c.sections.forEach(s => {
    secById[s.id] = s; secCh[s.id] = c.id;
    if (s.kind === 'tasks') s.tasks.forEach((t, i) => { taskById[t.id] = { t, n: i + 1, sec: s.id, ch: c.id }; });
    if (s.kind === 'selfcheck') s.items.forEach((q, i) => { selfById[q.id] = { q, n: i + 1, sec: s.id, ch: c.id }; });
  });
});
const MAIN = CHAPTERS.filter(c => c.kind === 'chapter');
const LEARNABLE = [];
MAIN.forEach(c => c.sections.forEach(s => LEARNABLE.push(s.id)));
const ALL_TASKS = Object.keys(taskById);
const GLOSS = BOOK.glossary;
const glById = {}; GLOSS.forEach(g => { glById[g.id] = g; });
const QUIZ = BOOK.quizzes;
const AI_MODEL = { model: 'claude-opus-5-5', modelTier: 'complex', effort: 'high' };
// mini-examples ("Sənin növbən" inside each text section) — answers live in ans-<chapter> next to the tasks
const MINI = {};
MAIN.forEach(c => c.sections.forEach(s => { if (s.x) MINI[s.x.ex.id] = { s, ch: c.id }; }));
const ALL_MINI = Object.keys(MINI);
const LVLS = [['short', 'Qısa'], ['std', 'Standart'], ['deep', 'Dərin']];

/* =========================================================
   2. Utilities
   ========================================================= */
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const pad2 = n => String(n).padStart(2, '0');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const today = () => { const d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000); };
const pct = (a, b) => b ? Math.round(a * 100 / b) : 0;
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function fold(s) {
  return String(s || '').toLocaleLowerCase('az').replace(/̇/g, ' ')
    .replace(/ə/g, 'e').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u')
    .replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g');
}
const ICONS = {
  book: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.3"/>',
  spark: '<path d="M12 3l1.9 4.6 4.6 1.9-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z"/><path d="M19 15l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z"/>',
  chart: '<path d="M4 20V11"/><path d="M10 20V5"/><path d="M16 20v-7"/><path d="M21 20H3"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/>',
  sliders: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r=".9"/><circle cx="4.5" cy="12" r=".9"/><circle cx="4.5" cy="18" r=".9"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  send: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  stop: '<rect x="7" y="7" width="10" height="10" rx="2"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v5h-5"/>',
  pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  cards: '<rect x="3" y="7" width="13" height="14" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v12"/>',
  abc: '<path d="M3 19l4-12 4 12M4.5 15h5"/><path d="M14 7h3.5a2.5 2.5 0 0 1 0 5H14zM14 12h4a2.5 2.5 0 0 1 0 5h-4z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.2a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .9-1 1.6v.4"/><path d="M12 17h.01"/>',
  save: '<path d="M6 3h12v18l-6-4-6 4z"/><path d="M12 7v6M9 10h6"/>',
  play: '<path d="M8 5v14l11-7z"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  checklist: '<path d="M4 6l1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17"/><path d="M11 6h9M11 12h9M11 18h9"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  chev: '<path d="M9 6l6 6-6 6"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M16 4.6a3.2 3.2 0 0 1 0 6.3M18 14.8c1.9.6 3 2.4 3 5.2"/>',
  steps: '<path d="M4 19h5v-5h5V9h6"/><path d="M17 6l3 3-3 3"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16.5 6.5l3 3M14 9l2 2"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/>',
  upload: '<path d="M12 20V9M7 14l5-5 5 5"/><path d="M5 4h14"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.6 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L21.5 8H6.2"/>',
  print: '<path d="M7 9V3h10v6"/><path d="M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7z"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
  bug: '<rect x="7" y="7" width="10" height="13" rx="5"/><path d="M9 7a3 3 0 0 1 6 0M12 11v9M3 13h4M17 13h4M4 8l3 2M20 8l-3 2M4 19l3-2M20 19l-3-2"/>'
};
const icon = (n, cls) => `<svg class="i${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

let toastTimer = null;
function toast(msg) {
  let t = $('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2400);
}

function htmlToText(html) {
  const d = document.createElement('div');
  d.innerHTML = html;
  d.querySelectorAll('figure.diagram').forEach(f => {
    const cap = (f.querySelector('figcaption') || {}).textContent || '';
    const labels = Array.from(f.querySelectorAll('svg text')).map(t => t.textContent.trim()).filter(Boolean).join('; ');
    f.replaceWith(document.createTextNode(`\n[Diaqram: ${cap}. Yazılar: ${labels}]\n`));
  });
  d.querySelectorAll('tr').forEach(tr => {
    const cells = Array.from(tr.children).map(c => c.textContent.replace(/\s+/g, ' ').trim());
    tr.replaceWith(document.createTextNode('| ' + cells.join(' | ') + ' |\n'));
  });
  d.querySelectorAll('li').forEach(li => li.insertAdjacentText('afterbegin', '• '));
  d.querySelectorAll('p,li,pre,h1,h2,h3,h4,div,ul,ol,table').forEach(el => el.insertAdjacentText('beforeend', '\n'));
  return d.textContent.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
const textCache = {};
function secText(s) {
  if (textCache[s.id]) return textCache[s.id];
  let h = '';
  if (s.kind === 'example') h = s.task + '<p>Həll:</p>' + s.steps.map((u, i) => `<p>Addım ${i + 1}:</p>${u}`).join('');
  else if (s.kind === 'tasks') h = (s.intro || '') + '<ol>' + s.tasks.map(t => `<li>${t.html}</li>`).join('') + '</ol>';
  else if (s.kind === 'selfcheck' || s.kind === 'checklist') h = '<ul>' + s.items.map(t => `<li>${t.html}</li>`).join('') + '</ul>';
  else h = s.html || '';
  return (textCache[s.id] = htmlToText(h));
}
function chText(c, max) {
  let out = c.intro ? htmlToText(c.intro) + '\n\n' : '';
  for (const s of c.sections) { out += '## ' + secLabel(s) + '\n' + secText(s) + '\n\n'; if (max && out.length > max) break; }
  return max ? out.slice(0, max) : out;
}
const chLabel = c => c.num ? `Fəsil ${c.num}. ${c.title}` : c.fullTitle;
const secLabel = s => s.num ? `${s.num}. ${s.title}` : s.title;
const chCode = c => c.num ? pad2(c.num) : (c.id === 'c0' ? '00' : c.id === 'ga' ? 'A' : 'B');
const partOf = c => BOOK.parts.find(p => p.id === c.part);
function partLabel(p) { if (!p) return ''; const m = p.title.match(/^(\S+) hissə — (.*)$/); return m ? { pn: m[1], name: m[2], full: p.title } : { pn: '', name: p.title, full: p.title }; }

/* markdown for Claude's answers */
function mdToHtml(text) {
  let html;
  try {
    if (window.marked && window.DOMPurify) {
      html = window.DOMPurify.sanitize(window.marked.parse(String(text || ''), { gfm: true, breaks: false }), { USE_PROFILES: { html: true } });
    }
  } catch (e) { html = null; }
  if (html == null) html = miniMd(text);
  const d = document.createElement('div'); d.innerHTML = html;
  d.querySelectorAll('table').forEach(t => { if (!t.parentElement.classList.contains('tbl')) { const w = document.createElement('div'); w.className = 'tbl'; t.replaceWith(w); w.appendChild(t); } });
  d.querySelectorAll('pre').forEach(p => p.classList.add('code'));
  d.querySelectorAll('a').forEach(a => { a.target = '_blank'; a.rel = 'noopener'; });
  return d.innerHTML;
}
function miniMd(src) {
  const lines = esc(src || '').split('\n');
  let out = '', inCode = false, list = null;
  const inline = s => s.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  const closeList = () => { if (list) { out += `</${list}>`; list = null; } };
  for (const ln of lines) {
    if (/^```/.test(ln)) { closeList(); out += inCode ? '</code></pre>' : '<pre><code>'; inCode = !inCode; continue; }
    if (inCode) { out += ln + '\n'; continue; }
    let m;
    if ((m = ln.match(/^\s*[-*•]\s+(.*)/))) { if (list !== 'ul') { closeList(); out += '<ul>'; list = 'ul'; } out += `<li>${inline(m[1])}</li>`; continue; }
    if ((m = ln.match(/^\s*\d+[.)]\s+(.*)/))) { if (list !== 'ol') { closeList(); out += '<ol>'; list = 'ol'; } out += `<li>${inline(m[1])}</li>`; continue; }
    closeList();
    if ((m = ln.match(/^#{1,4}\s+(.*)/))) { out += `<h4>${inline(m[1])}</h4>`; continue; }
    if (ln.trim()) out += `<p>${inline(ln)}</p>`;
  }
  closeList(); if (inCode) out += '</code></pre>';
  return out;
}
function splitGrade(text) {
  const m = String(text || '').match(/^\s*[*_]*\s*Q[İIi]YM[ƏE]T\s*[*_]*\s*:?\s*[*_]*\s*(Əla|Yaxşı|Yenidən cəhd et)[^\n]*(\n|$)/iu);
  if (!m) return { grade: null, body: text };
  const raw = m[1].toLocaleLowerCase('az');
  const grade = raw.startsWith('əla') ? 'Əla' : raw.startsWith('yax') ? 'Yaxşı' : 'Yenidən cəhd et';
  return { grade, body: text.slice(m[0].length) };
}
const gradeChip = g => !g ? '' : `<span class="chip ${g === 'Əla' ? 'pass' : g === 'Yaxşı' ? 'warn' : 'fail'}">${g === 'Yenidən cəhd et' ? icon('refresh') : icon('check')}${esc(g)}</span>`;

/* =========================================================
   3. Store — db per user, localStorage cache/fallback
   ========================================================= */
const LS = 'qa-kitab:v1:';
const lsGet = k => { try { const v = localStorage.getItem(LS + k); return v ? JSON.parse(v) : null; } catch (e) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(LS + k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } };
const lsKeys = () => { const out = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(LS) && k !== LS + '_owner') out.push(k.slice(LS.length)); } } catch (e) { } return out; };
function defFor(key) {
  if (key === 'prefs') return { theme: 'system', fs: 17, dir: 'en', lvl: 'std' };
  if (key === 'roleplay') return { s: {} };
  if (key === 'progress') return { learned: {}, last: null, quiz: {} };
  if (key === 'cards') return { c: {} };
  if (key === 'checks') return { k: {} };
  if (key === 'chat') return { ctx: 'c1', turns: [] };
  if (key.startsWith('notes-')) return { n: {} };
  if (key.startsWith('ans-')) return { a: {} };
  return {};
}
let DB = null, UID = null;
const Store = {
  docs: {}, timers: {}, pending: new Set(), inflight: {}, again: {}, remote: false, readOnly: false, sync: 'local',
  doc(key) {
    if (!this.docs[key]) { const l = lsGet(key); this.docs[key] = l && typeof l === 'object' ? Object.assign(defFor(key), l) : defFor(key); }
    return this.docs[key];
  },
  changed(key, delay) {
    const d = this.doc(key); d._ts = Date.now(); lsSet(key, d);
    this.pending.add(key);
    clearTimeout(this.timers[key]);
    this.timers[key] = setTimeout(() => this.flush(key), delay || 900);
  },
  async flush(key, retried) {
    clearTimeout(this.timers[key]);
    if (!this.remote || this.readOnly || !DB) return;
    if (this.inflight[key]) { this.again[key] = true; return; }
    this.pending.delete(key);
    this.inflight[key] = true;
    try {
      await DB.doc(`data/users/${UID}/${key}`).set(JSON.parse(JSON.stringify(this.doc(key))));
      this.sync = 'cloud';
    } catch (e) {
      const code = e && e.code;
      if (code === 'unavailable' && !retried) { this.inflight[key] = false; setTimeout(() => this.flush(key, true), 1200 + Math.random() * 1800); return; }
      if (code === 'invalid_argument') { this.readOnly = true; this.sync = 'local'; }
      else if (code === 'quota_exceeded') { toast('Yaddaş limiti dolub — bəzi dəyişikliklər yalnız bu cihazda qaldı.'); }
      else if (code === 'revoked' || code === 'not_granted' || code === 'capability_disabled' || code === 'capability_removed') { this.remote = false; this.sync = 'local'; }
      else { this.pending.add(key); }
    } finally {
      this.inflight[key] = false;
      if (this.again[key]) { this.again[key] = false; this.flush(key); }
    }
  },
  flushAll() { Array.from(this.pending).forEach(k => this.flush(k)); }
};
const P = () => Store.doc('progress');
const PREF = () => Store.doc('prefs');
const notesDoc = cid => Store.doc('notes-' + cid);
const ansDoc = cid => Store.doc('ans-' + cid);

async function initRemote() {
  const cl = window.claude;
  if (!cl || typeof cl.use !== 'function') return;
  let db = null, user = null;
  try { [db, user] = await Promise.all([cl.use('db'), cl.use('user')]); } catch (e) { return; }
  if (!db || !user) return;
  let uid = null;
  try { uid = await user.id(); } catch (e) { uid = null; }
  if (!uid) return;
  DB = db; UID = uid;
  let owner = null; try { owner = localStorage.getItem(LS + '_owner'); } catch (e) { }
  if (owner && owner !== uid) {
    lsKeys().forEach(k => { try { localStorage.removeItem(LS + k); } catch (e) { } });
    Store.docs = {};
  }
  try { localStorage.setItem(LS + '_owner', uid); } catch (e) { }
  await pullRemote(true);
}
async function pullRemote(first) {
  if (!DB || !UID) return;
  let snap;
  try { snap = await DB.collection('data/users/' + UID).get(); } catch (e) { return; }
  let changed = false;
  const seen = new Set();
  snap.docs.forEach(d => {
    const key = d.id; seen.add(key);
    const r = d.data() || {};
    const l = Store.docs[key] || lsGet(key);
    if (Store.pending.has(key) || Store.inflight[key]) return;
    if (!l || (r._ts || 0) > (l._ts || 0)) {
      Store.docs[key] = Object.assign(defFor(key), JSON.parse(JSON.stringify(r)));
      lsSet(key, Store.docs[key]); changed = true;
    } else if ((l._ts || 0) > (r._ts || 0)) Store.pending.add(key);
  });
  if (first) lsKeys().forEach(k => { if (!seen.has(k)) { Store.doc(k); Store.pending.add(k); } });
  Store.remote = true; Store.sync = 'cloud';
  Store.flushAll();
  if (changed) { applyPrefs(); rerender(); }
}

/* =========================================================
   4. Claude (sample)
   ========================================================= */
const AI = {
  fn: null, state: 'pending', modelNote: '',
  async init() {
    if (PWA) { this.fn = PWA.sample; this.modelNote = PWA.modelLabel(); this.setState('on'); return; }
    let fn = null;
    try { fn = window.claude && typeof window.claude.use === 'function' ? await window.claude.use('sample') : null; } catch (e) { fn = null; }
    this.fn = fn; this.setState(fn ? 'on' : 'off');
  },
  setState(s) { this.state = s; document.documentElement.setAttribute('data-ai', s); },
  async call(input, opts) {
    if (this.state === 'pending' && this.ready) await this.ready;
    if (!this.fn) throw { code: 'not_granted', message: 'sample unavailable' };
    if (PWA) { const st = PWA.status(); if (st !== 'ok') throw { code: st, message: st }; }
    const res = await this.fn(input, Object.assign({}, AI_MODEL, opts || {}));
    this.modelNote = PWA ? PWA.modelLabel() : res && res.modelApplied ? 'Claude Opus 5.5 · maksimum düşünmə' : ('Claude · ' + ((res && res.modelTierApplied) || 'complex') + ' səviyyəsi');
    return res;
  }
};
function aiErr(e) {
  switch (e && e.code) {
    case 'not_granted': case 'sampling_disabled': case 'not_declared': case 'capability_disabled': case 'capability_removed':
      AI.setState('off');
      return 'Claude bu görünüşdə əlçatan deyil: icazə verilməyib və ya hesabda söndürülüb.';
    case 'rate_limited': return 'Hazırda çox sorğu var və ya istifadə limitinə çatmısan. Bir az sonra yenidən cəhd et.';
    case 'session_expired': return 'Sessiyanın vaxtı bitib — yenidən daxil ol.';
    case 'refused': return 'Claude bu sorğuya cavab vermədi. Sualı başqa cür yaz.';
    case 'empty_completion': return 'Cavab boş gəldi. Sualı qısalt və ya sadələşdir.';
    case 'prompt_too_large': return 'Mətn çox uzundur. Daha qısa hissə seç.';
    case 'no_key': return 'API açarı yoxdur — bu bölməni claude.ai versiyasında aç, Claude orada öz hesabınla işləyir.';
    case 'offline': return 'İnternet yoxdur. Claude yalnız onlayn işləyir; kitab, testlər və kartlar offline da işləyir.';
    case 'auth': case 'permission': return 'API açarı qəbul edilmədi (yanlışdır və ya ləğv edilib). Claude ayarlarında açarı yoxla.';
    case 'credit': return 'Anthropic API hesabında kredit qalmayıb. Console-da (platform.claude.com) Billing bölməsindən balansı artır.';
    case 'model': return 'Seçilmiş model bu açarla əlçatan deyil. Claude ayarlarında başqa model seç.';
    case 'overloaded': return 'Claude hazırda çox yüklüdür. Bir az sonra yenidən cəhd et.';
    case 'network': return 'Claude-a qoşulmaq alınmadı. İnterneti yoxla və yenidən cəhd et.';
    case 'bad_request': return 'Sorğu qəbul edilmədi' + (e.message ? ': ' + e.message : '.');
    default: return 'Bağlantıda xəta baş verdi. Yenidən cəhd et.';
  }
}
// error box + (offline app) a way out: open Claude settings or the claude.ai version
function aiErrHTML(e) {
  let html = `<div class="ai-err">${esc(aiErr(e))}</div>`;
  if (PWA && e && ['no_key', 'auth', 'permission', 'credit', 'model'].includes(e.code)) {
    html += `<div class="row ai-fix"><button class="btn sm" data-act="claude-setup">${icon('key')}Claude ayarları</button><a class="btn sm ghost" href="${esc(PWA.artifactLink(artHash()))}" target="_blank" rel="noopener">claude.ai-da aç${icon('ext')}</a></div>`;
  }
  return html;
}
// which part of the claude.ai version matches what is on screen
function artHash() {
  if (S.view === 'reader' && S.params.ch) return S.params.ch;
  if (S.view === 'quiz' && S.params.ch) return 'c' + S.params.ch;
  if ((S.view === 'konspekt' || S.view === 'summary') && chById[S.params.ch]) return S.params.ch;
  if (S.view === 'tutor') return S.tutorMode === 'rp' ? 'rol' : 'muellim';
  if (S.view === 'progress') return 'progress';
  if (S.view === 'store') return 'magaza';
  if (S.view === 'glossary' || S.view === 'cards') return 'ga';
  if (S.view === 'practice') return 'mesq';
  return '';
}
// offline app: stop before an AI action when Claude cannot answer here. Without a key the action moves to the
// claude.ai version, where Claude runs on the reader's own claude.ai account (no API key)
let PENDING = null;
function claudeGate(resume, ctx) {
  if (!PWA) return false;
  const st = PWA.status();
  if (st === 'ok') return false;
  if (st === 'offline') { toast('İnternet yoxdur — Claude yalnız onlayn işləyir.'); return true; }
  openOnClaudeAi(Object.assign({ resume }, ctx || {}));
  return true;
}
// what the reader typed or selected never goes into the link (anyone could craft one); it goes to the clipboard
const COPY = { answer: ['Cavabın', 'Cavabımı'], question: ['Sualın', 'Sualımı'], message: ['Mesajın', 'Mesajımı'], selection: ['Seçdiyin hissə', 'Seçdiyim hissəni'] };
function openOnClaudeAi(ctx) {
  const kind = COPY[ctx.copyKind] ? ctx.copyKind : 'answer';
  if (ctx.copy) { try { navigator.clipboard.writeText(ctx.copy).catch(() => { }); } catch (e) { } }
  const w = window.open(PWA.artifactLink(ctx.hash || artHash()), '_blank');
  if (!w) { openClaudeSetup(ctx); return; } // pop-up blocked: the setup sheet has the same link
  try { w.opener = null; } catch (e) { }
  toast(ctx.copy ? `${COPY[kind][0]} kopyalandı — claude.ai-da yapışdır. Claude orada öz hesabınla işləyir.` : 'claude.ai versiyası açıldı — Claude orada öz hesabınla işləyir.');
}
const RULES = `Sən QA (proqram təminatının testi) üzrə təcrübəli və səbirli müəllimsən. Tələbə QA-nı sıfırdan öyrənir: proqramlaşdırma təcrübəsi yoxdur, kursla yanaşı “QA Kitabı: Sıfırdan Peşəkar Testerə” kitabını interaktiv formada oxuyur.
Qaydalar:
- Həmişə Azərbaycan dilində (latın əlifbası) yaz. İngiliscə termini ilk dəfə işlədəndə mötərizədə ver, məsələn: reqressiya testi (regression testing).
- Sadə, aydın cümlələr qur; anlayışı gündəlik həyatdan misalla bağla.
- Kitabın terminologiyasına və yanaşmasına uyğun danış. Kitabdan kənar fakt deyəndə dəqiq ol; əmin deyilsənsə, bunu açıq de.
- Formatlama: markdown — qısa abzaslar, lazım olanda siyahı, cədvəl və ya kod bloku. Böyük başlıqlardan qaçın.`;
const xCache = {};
function secExtra(s) {
  if (!s.x) return '';
  if (xCache[s.id]) return xCache[s.id];
  const x = s.x;
  return (xCache[s.id] = `Yadda saxla:\n${x.keys.map(k => '• ' + htmlToText(k)).join('\n')}\n\nDərindən (əlavə izah):\n${htmlToText(x.deep)}`);
}
function secCtx(sid, max) {
  const s = secById[sid], c = chById[secCh[sid]];
  max = max || 7000;
  const main = secText(s).slice(0, max);
  const extra = s.x ? secExtra(s).slice(0, Math.max(0, Math.round(max * 0.6))) : '';
  return `Fəsil: ${chLabel(c)}\nBölmə: ${secLabel(s)}\n\n<bölmə_mətni>\n${main}\n</bölmə_mətni>` + (extra ? `\n\n<əlavə_qat>\n${extra}\n</əlavə_qat>` : '');
}
const MODES = {
  simple: { kicker: 'Sadə izah', ask: 'Bu bölməni daha sadə dillə yenidən izah et.\n- Gündəlik həyatdan bir analogiya ilə başla.\n- Əsas anlayışları addım-addım aç, ən çətin yeri xüsusi izah et.\n- Sonda “Əsas fikir:” ilə başlayan 2–3 cümləlik xülasə yaz.\nHəcm: 180–300 söz.', cache: true },
  example: { kicker: 'Başqa misal', ask: 'Bu bölmədəki anlayış üçün kitabdakı misallardan FƏRQLİ, yeni bir praktik misal ver. Mümkünsə Azərbaycan reallığından götür (bank, taksi, onlayn mağaza, kommunal ödəniş, dövlət xidməti, mobil oyun). Misalı addım-addım aç və tester-in burada konkret nəyi yoxlayacağını göstər (lazım olsa, kiçik cədvəl). Həcm: 180–300 söz.' },
  quizme: { kicker: 'Məni yoxla', ask: 'Bu bölmə üzrə biliyimi yoxla. Mənə BİR sual ver — kiçik real ssenari üzərində tətbiqi sual olsun. Cavabı yazma, yalnız sualı ver və sonda “Cavabını aşağıda yaz.” cümləsini əlavə et.\nMən cavab yazandan sonra: əvvəlcə cavabımı qiymətləndir (nə düzgündür, nə çatışmır), qısa izah ver, sonra növbəti, bir az daha çətin sualı ver.' },
  lesson: { kicker: 'Addım-addım dərs', ask: LESSON_ASK('bölməni', '4–6') }
};
function LESSON_ASK(what, n) {
  return `Mənə bu ${what} addım-addım dərs kimi keç (Sokrat üsulu ilə). Mövzunu ${n} kiçik addıma böl.
- Hər mesajda yalnız BİR addım ver. Mesajın ilk sətri: “**Addım N/M — qısa başlıq**”.
- Addımda qısa izah (60–130 söz) və mümkünsə gündəlik həyatdan və ya real proqramdan misal olsun.
- Addımın sonunda mənə BİR yoxlama sualı ver və cavabımı gözlə. Sualın cavabını özün yazma.
- Mən cavab verəndən sonra əvvəlcə 1–3 cümlə ilə qiymətləndir: düzgündürsə — niyə düzgündür; səhv və ya natamamdırsa — düzgün fikri izah et. Sonra növbəti addıma keç.
- Mən “bilmirəm” və ya “ipucu” yazsam, sualı sadələşdir və ipucu ver.
- Son addımdan sonra “**Yadda saxla**” başlığı ilə 3 bəndlik xülasə yaz və bitir.
İndi Addım 1-dən başla.`;
}

/* =========================================================
   5. App state & navigation
   ========================================================= */
const S = { view: 'home', params: {}, tab: 'book', stack: [], quiz: null, cards: null, glq: '', tutorBusy: null, tutorMode: 'chat', rp: null, rpBusy: null };
const EX = {}; // revealed steps per example / mini-example (session only)
const LV = {}; // per-section depth override (session only)
const OPEN = {}; // open <details> panels (session only)
const lvlOf = sid => LV[sid] || PREF().lvl || 'std';
let observer = null;

function applyPrefs() {
  const p = PREF();
  const root = document.documentElement;
  if (p.theme === 'light' || p.theme === 'dark') root.setAttribute('data-app-theme', p.theme); else root.removeAttribute('data-app-theme');
  root.style.setProperty('--fs', clamp(p.fs || 17, 15, 21) + 'px');
}
function go(view, params, opts) {
  opts = opts || {};
  if (opts.push !== false && S.view) S.stack.push({ view: S.view, params: S.params });
  if (S.stack.length > 30) S.stack.shift();
  S.view = view; S.params = params || {};
  if (opts.tab) S.tab = opts.tab;
  render(opts);
}
function goTab(tab) {
  S.stack = []; S.tab = tab;
  const map = { book: 'home', practice: 'practice', tutor: 'tutor', progress: 'progress' };
  S.view = map[tab]; S.params = {};
  render({ top: true });
}
function back() {
  const prev = S.stack.pop();
  if (!prev) { goTab(S.tab); return; }
  S.view = prev.view; S.params = prev.params;
  if (prev.view === 'reader') { const l = P().last; S.params = Object.assign({}, prev.params, { sec: l && l.ch === prev.params.ch ? l.sec : prev.params.sec }); }
  render({ back: true });
}
function rerender() { render({ keepScroll: true }); }

function setHeader(cfg) {
  const h = $('#topbar .wrap');
  const left = cfg.back ? `<button class="ibtn" data-act="back" aria-label="Geri">${icon('back')}</button>` : '';
  const right = (cfg.right || []).map(r => `<button class="ibtn" data-act="${r.act}" aria-label="${esc(r.label)}">${icon(r.icon)}</button>`).join('');
  h.innerHTML = `${left}<div class="tb-title"${cfg.back ? '' : ' style="padding-left:2px"'}><span class="tb-kicker">${esc(cfg.kicker || '')}</span><span class="tb-name">${esc(cfg.name || '')}</span></div>${right}<div class="readbar"${cfg.readbar ? '' : ' hidden'}><i></i></div>`;
  $$('#tabbar .tab').forEach(t => t.setAttribute('aria-current', String(t.dataset.tab === S.tab)));
}
function render(opts) {
  opts = opts || {};
  const y = window.scrollY;
  if (observer) { observer.disconnect(); observer = null; }
  hideSelPill();
  const v = $('#view');
  const views = { home: vHome, reader: vReader, practice: vPractice, quiz: vQuiz, cards: vCards, glossary: vGlossary, tutor: vTutor, progress: vProgress, konspekt: vKonspekt, summary: vSummary, store: vStore };
  (views[S.view] || vHome)(v);
  if (opts.keepScroll) window.scrollTo(0, y);
  else if (!(S.view === 'reader' && S.params.sec)) window.scrollTo(0, 0);
}

/* =========================================================
   6. Views
   ========================================================= */
function chStats(c) {
  const learned = P().learned;
  const total = c.sections.length;
  const done = c.sections.filter(s => learned[s.id]).length;
  const q = P().quiz[c.num];
  return { total, done, q };
}
function overall() {
  const learned = P().learned;
  const done = LEARNABLE.filter(id => learned[id]).length;
  const quizDone = MAIN.filter(c => P().quiz[c.num]).length;
  const scores = MAIN.map(c => P().quiz[c.num]).filter(Boolean).map(q => q.best / q.n);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) * 100 / scores.length) : 0;
  let answered = 0;
  let minis = 0, retry = 0;
  MAIN.forEach(c => { const a = ansDoc(c.id).a; Object.keys(a).forEach(k => {
    if (!a[k] || !(a[k].t || '').trim()) return;
    if (taskById[k]) answered++; else if (MINI[k]) { answered++; minis++; }
    if ((taskById[k] || MINI[k]) && a[k].g === 'Yenidən cəhd et') retry++;
  }); });
  const cs = Store.doc('cards').c; const t = today();
  let learnedCards = 0, due = 0, seen = 0;
  GLOSS.forEach(g => { const e = cs[g.id]; if (e) { seen++; if (e[0] >= 4) learnedCards++; if (e[1] <= t) due++; } });
  return { done, total: LEARNABLE.length, quizDone, avg, answered, minis, retry, tasks: ALL_TASKS.length + ALL_MINI.length, learnedCards, due, seen, newCards: GLOSS.length - seen };
}

/* ---------- home ---------- */
function vHome(v) {
  setHeader({ kicker: 'QA Kitabı', name: 'Sıfırdan Peşəkar Testerə', right: [{ act: 'search', icon: 'search', label: 'Axtarış' }, { act: 'settings', icon: 'sliders', label: 'Ayarlar' }] });
  const o = overall();
  const last = P().last;
  let cont;
  if (last && chById[last.ch]) {
    const c = chById[last.ch], s = secById[last.sec];
    cont = `<button class="cont" data-act="continue"><div class="t"><div class="k">Qaldığın yerdən davam et</div><div class="n">${esc(chLabel(c))}</div><div class="s">${esc(s ? secLabel(s) : '')}</div></div>${icon('arrow')}</button>`;
  } else {
    cont = `<button class="cont" data-act="open-ch" data-ch="c0"><div class="t"><div class="k">Başla</div><div class="n">Bu kitabı necə oxumalı</div><div class="s">Sonra Fəsil 1 — QA nədir və tester nə iş görür</div></div>${icon('arrow')}</button>`;
  }
  let parts = '';
  BOOK.parts.forEach(p => {
    const pl = partLabel(p);
    const rows = p.chapters.map(cid => {
      const c = chById[cid];
      if (c.kind === 'glossary') return `<button class="chrow" data-act="glossary"><span class="id">A</span><span class="tt"><b>${esc(c.title)}</b><span class="muted" style="font-size:13px">${GLOSS.length} termin · axtarış və fleş kartlar</span></span><span class="side">${icon('arrow')}</span></button>`;
      if (c.kind === 'appendix') return `<button class="chrow" data-act="open-ch" data-ch="${c.id}"><span class="id">B</span><span class="tt"><b>${esc(c.title)}</b><span class="muted" style="font-size:13px">4 şablon · 7 interaktiv checklist</span></span><span class="side">${icon('arrow')}</span></button>`;
      const st = chStats(c);
      const per = pct(st.done, st.total);
      const qchip = st.q ? `<span class="chip ${st.q.best / st.q.n >= 0.7 ? 'pass' : 'warn'}">${st.q.best}/${st.q.n}</span>` : '';
      return `<button class="chrow${per === 100 ? ' done' : ''}" data-act="open-ch" data-ch="${c.id}"><span class="id">${chCode(c)}</span><span class="tt"><b>${esc(c.title)}</b><div class="meter${per === 100 ? ' pass' : ''}"><i style="width:${per}%"></i></div></span><span class="side"><span class="pct">${st.done}/${st.total}</span>${qchip}</span></button>`;
    }).join('');
    parts += `<section class="part"><div class="part-h">${pl.pn ? `<span class="pn">${esc(pl.pn)}</span>` : ''}<h2>${esc(pl.name)}</h2></div><div class="chlist">${rows}</div></section>`;
  });
  v.innerHTML = `
  <div class="hero">
    <div class="kicker">İnteraktiv kitab · 21 fəsil</div>
    <h1 class="h1">QA-nı sıfırdan, addım-addım</h1>
    <p>Hər bölmədə üç səviyyəli izah — qısa, standart, dərin — həll olunmuş mini-nümunə və sənin növbən. Claude ilə addım-addım dərs, səhvlərinin izahı və real iş söhbətləri üzrə rol oyunları.</p>
    <div class="runline">
      <span class="chip ${o.done ? 'pass' : ''}">${icon('check')}${o.done}/${o.total} bölmə</span>
      <span class="chip">${o.quizDone}/21 test</span>
      <span class="chip ${o.due ? 'acc' : ''}">${o.due ? o.due + ' kart təkrar' : o.newCards + ' yeni termin'}</span>
    </div>
  </div>
  <div class="block">${cont}</div>${installCard()}
  <section class="part"><div class="part-h"><span class="pn">0</span><h2>Giriş</h2></div><div class="chlist"><button class="chrow" data-act="open-ch" data-ch="c0"><span class="id">00</span><span class="tt"><b>Bu kitabı necə oxumalı</b><span class="muted" style="font-size:13px">Quruluş, terminlər, oxu sırası</span></span><span class="side">${icon('arrow')}</span></button></div></section>
  ${parts}`;
}

// offline app: one quiet invitation to install it, until dismissed
function installCard() {
  if (!PWA || PREF().pwaHint) return '';
  const st = PWA.installState();
  if (st !== 'prompt' && st !== 'ios') return '';
  const body = st === 'prompt' ? 'Ana ekrandan bir toxunuşla aç və internetsiz oxu.' : 'Safari-də Paylaş düyməsinə toxun, sonra “Ana ekrana əlavə et” (Add to Home Screen).';
  return `<div class="block"><div class="card pwa-inst">${icon('phone')}<div class="t"><b>Tətbiq kimi quraşdır</b><span>${body}</span>${st === 'prompt' ? `<div class="row"><button class="btn sm primary" data-act="pwa-install">Quraşdır</button></div>` : ''}</div><button class="ibtn" data-act="pwa-hint-off" aria-label="Gizlət">${icon('x')}</button></div></div>`;
}

/* ---------- reader ---------- */
function kindTag(s) {
  return ({ pitfalls: 'Diqqət', example: 'Nümunə', tasks: 'Praktika', selfcheck: 'Təkrar', checklist: 'Checklist', template: 'Şablon' })[s.kind] || 'Giriş';
}
function footerHTML(c, s) {
  const learnable = c.kind === 'chapter';
  const learned = !!P().learned[s.id];
  const note = (notesDoc(c.id).n[s.id] || '');
  const label = (s.kind === 'tasks' || s.kind === 'selfcheck') ? 'Tamamladım' : 'Öyrəndim';
  let r1 = '';
  if (learnable) r1 += `<button class="learn" data-act="learn" data-sec="${s.id}" aria-pressed="${learned}"><span class="box">${icon('check')}</span>${label}</button>`;
  if (s.kind === 'template') r1 += `<button class="btn sm" data-act="copy-tpl" data-sec="${s.id}">${icon('copy')}Kopyala</button>`;
  if (s.kind === 'checklist') r1 += `<button class="btn sm ghost" data-act="chk-reset" data-sec="${s.id}">${icon('refresh')}Sıfırla</button>`;
  r1 += `<button class="btn sm ghost notebtn${note ? ' has' : ''}" data-act="note" data-sec="${s.id}">${icon('pencil')}${note ? 'Qeydim' : 'Qeyd'}</button>`;
  const ai = `<div class="ai-row ai-only">
      ${s.x ? `<button class="aib" data-act="ai" data-mode="lesson" data-sec="${s.id}">${icon('steps')}Dərs</button>` : ''}
      <button class="aib" data-act="ai" data-mode="simple" data-sec="${s.id}">${icon('spark')}Sadə izah</button>
      <button class="aib" data-act="ai" data-mode="example" data-sec="${s.id}">${icon('spark')}Başqa misal</button>
      <button class="aib" data-act="ai" data-mode="quizme" data-sec="${s.id}">${icon('help')}Məni yoxla</button>
    </div>`;
  return `<footer class="sec-f"><div class="r1">${r1}</div>${ai}
    <div class="notebox" data-notebox="${s.id}" hidden><textarea data-note="${s.id}" data-ch="${c.id}" placeholder="Bu bölmə üçün qeydin…">${esc(note)}</textarea><div class="meta"><span>Avtomatik saxlanılır</span><span data-notest="${s.id}"></span></div></div>
  </footer>`;
}
function exampleHTML(s) {
  const n = s.steps.length;
  const shown = Math.min(EX[s.id] || 0, n);
  const steps = s.steps.slice(0, shown).map(u => `<li><div class="prose">${u}</div></li>`).join('');
  return `<div class="ex-task prose">${s.task}</div>
  <div class="ex-try">${icon('bulb')}<span>Əvvəlcə özün fikirləş: necə həll edərdin? Sonra həlli addım-addım aç.</span></div>
  <ol class="ex-steps" data-steps="${s.id}">${steps}</ol>
  <div class="ex-ctrl" data-exctrl="${s.id}">${exCtrl(s.id, n, shown)}</div>`;
}
const stepsFor = key => secById[key] ? secById[key].steps : MINI[key].s.x.ex.steps;
function exCtrl(key, n, shown) {
  if (shown >= n) return `<button class="btn sm ghost" data-act="ex-reset" data-sec="${key}">${icon('refresh')}Həlli gizlət</button>`;
  return `<button class="btn sm primary" data-act="ex-next" data-sec="${key}">${shown ? 'Növbəti addım' : 'Həlli aç'} · ${shown + 1}/${n}</button><button class="btn sm ghost" data-act="ex-all" data-sec="${key}">Hamısını göstər</button>`;
}
/* depth layers: short / standard / deep */
function lvlCtl(sid, cur, act) {
  return `<div class="lvl" role="group" aria-label="İzah səviyyəsi">${LVLS.map(([v, l]) => `<button data-act="${act || 'lvl'}" data-sec="${sid || ''}" data-v="${v}" aria-pressed="${cur === v}">${l}</button>`).join('')}</div>`;
}
function keysHTML(x) {
  return `<div class="keys"><div class="keys-h">${icon('bulb')}Yadda saxla</div><ol>${x.keys.map(k => `<li><span>${k}</span></li>`).join('')}</ol></div>`;
}
function deepHTML(s, open) {
  const k = 'd:' + s.id;
  return `<details class="deep" data-open="${k}"${open || OPEN[k] ? ' open' : ''}><summary>${icon('layers')}<span class="st">Dərindən<span class="sub">əlavə izah, incəliklər, tipik yanlışlar</span></span>${icon('chev', 'chev')}</summary><div class="dbody prose">${s.x.deep}</div></details>`;
}
function miniHTML(c, s, open) {
  const ex = s.x.ex, id = ex.id, k = 'm:' + id;
  const a = ansDoc(c.id).a[id] || {};
  const n = ex.steps.length, shown = Math.min(EX[id] || 0, n);
  const done = a.g === 'Əla' || a.g === 'Yaxşı';
  return `<details class="mini${done ? ' done' : ''}" data-open="${k}" data-mini="${id}"${open || OPEN[k] ? ' open' : ''}><summary>${icon('target')}<span class="st">Mini-nümunə<span class="sub">həll olunmuş misal və sənin növbən</span></span>${done ? `<span class="chip pass">${icon('check')}${esc(a.g)}</span>` : ''}${icon('chev', 'chev')}</summary>
    <div class="dbody">
      <div class="mini-k">Həll olunmuş nümunə</div>
      <div class="ex-task prose">${ex.task}</div>
      <ol class="ex-steps" data-steps="${id}">${ex.steps.slice(0, shown).map(u => `<li><div class="prose">${u}</div></li>`).join('')}</ol>
      <div class="ex-ctrl" data-exctrl="${id}">${exCtrl(id, n, shown)}</div>
      <div class="turn"><div class="mini-k">${icon('pencil')}Sənin növbən</div><div class="prose">${ex.try}</div>
        <textarea class="field" data-ans="${id}" data-ch="${c.id}" rows="4" placeholder="Cavabını bura yaz…">${esc(a.t || '')}</textarea>${swBox(id, ex.try, a.t)}
        <div class="task-ctrl"><span class="st" data-st="${id}">${a.t ? 'Saxlanıb' : ''}</span>
          <button class="btn sm ghost ai-only" data-act="task-hint" data-task="${id}">${icon('bulb')}İpucu</button>
          <button class="btn sm primary ai-only" data-act="task-check" data-task="${id}">${icon('check')}Yoxla</button></div>
        <div class="fb" data-fb="${id}"${a.fb || a.h ? '' : ' hidden'}>${fbHTML(a)}</div></div>
    </div></details>`;
}
// good / bad cards (compare.json): the wrong and the right way to write one field; "Niyə?" opens the reason
function cmpHTML(s) {
  if (!s.cmp || !s.cmp.length) return '';
  return `<div class="cmp"><div class="cmp-k">${icon('checklist')}Pis və yaxşı yazılış</div>${s.cmp.map((k, i) => {
    const o = `cmp:${s.id}:${i}`;
    return `<div class="cmp-card"><div class="cmp-tag">${esc(k.tag)}</div>
      <div class="cmp-pair"><div class="cmp-side bad"><span class="cmp-m">${icon('x')}Pis</span><p>${esc(k.bad)}</p></div>
        <div class="cmp-side good"><span class="cmp-m">${icon('check')}Yaxşı</span><p>${esc(k.good)}</p></div></div>
      <details class="cmp-why" data-open="${o}"${OPEN[o] ? ' open' : ''}><summary>${icon('help')}Niyə?</summary><p>${esc(k.why)}</p></details></div>`;
  }).join('')}</div>`;
}
/* sorting exercises (sorting.json): put the steps in order or sort cards into groups. Drag with a mouse or a finger
   (pointer events, so it works on phones), or tap a card and then a group; ▲▼ move a step without dragging. */
const SRT = {};
function srtState(k) {
  if (SRT[k]) return SRT[k];
  const [sid, i] = k.split(':'), ex = secById[sid].srt[+i], idx = ex.items.map((_, j) => j);
  let order = shuffle(idx); while (order.every((v, p) => v === p)) order = shuffle(idx);
  return (SRT[k] = ex.type === 'order' ? { order, checked: false } : { seq: order, at: idx.map(() => -1), pick: null, checked: false });
}
function srtInner(k) {
  const [sid, i] = k.split(':'), ex = secById[sid].srt[+i], st = srtState(k), G = ex.groups || [];
  const ok = j => ex.type === 'order' ? st.order.indexOf(j) === j : st.at[j] === G.indexOf(ex.items[j].g);
  const mark = j => st.checked ? (ok(j) ? ' ok' : ' bad') : '';
  const why = j => st.checked ? `<span class="srt-why">${ok(j) ? '' : ex.type === 'order' ? `Düzgün yeri: ${j + 1}. ` : `Düzgün qrup: ${esc(ex.items[j].g)}. `}${esc(ex.items[j].why)}</span>` : '';
  let body;
  if (ex.type === 'order') {
    body = `<ol class="srt-list">${st.order.map((j, p) => `<li class="srt-item${mark(j)}" data-j="${j}">
      <span class="srt-grip" data-drag="${j}" aria-hidden="true">⠿</span><span class="srt-n">${p + 1}</span>
      <span class="srt-t">${esc(ex.items[j].t)}${why(j)}</span>
      <span class="srt-move"><button class="ibtn" data-act="srt-move" data-k="${k}" data-p="${p}" data-d="-1" aria-label="Yuxarı"${p ? '' : ' disabled'}>▲</button><button class="ibtn" data-act="srt-move" data-k="${k}" data-p="${p}" data-d="1" aria-label="Aşağı"${p < st.order.length - 1 ? '' : ' disabled'}>▼</button></span></li>`).join('')}</ol>`;
  } else {
    const chip = j => `<button class="srt-chip${mark(j)}${st.pick === j ? ' picked' : ''}" data-act="srt-pick" data-k="${k}" data-j="${j}" data-drag="${j}" aria-pressed="${st.pick === j}">${esc(ex.items[j].t)}${why(j)}</button>`;
    const pool = st.seq.filter(j => st.at[j] === -1);
    body = `<div class="srt-pool srt-zone" data-act="srt-put" data-k="${k}" data-g="-1">${pool.length ? pool.map(chip).join('') : '<span class="muted">Bütün kartlar yerləşdirilib.</span>'}</div>
      <div class="srt-groups">${G.map((g, gi) => `<div class="srt-group srt-zone" data-act="srt-put" data-k="${k}" data-g="${gi}"><div class="srt-gh">${esc(g)}</div>${st.seq.filter(j => st.at[j] === gi).map(chip).join('')}</div>`).join('')}</div>`;
  }
  const n = ex.items.length, good = ex.items.filter((_, j) => ok(j)).length;
  return `<div class="srt-k">${icon('target')}Sürüklə-burax · ${esc(ex.title)}</div><p class="srt-hint">${esc(ex.hint || '')}</p>${body}
    <div class="row srt-ctl"><button class="btn sm primary" data-act="srt-check" data-k="${k}">${icon('check')}Yoxla</button><button class="btn sm ghost" data-act="srt-reset" data-k="${k}">${icon('refresh')}Yenidən qarışdır</button>
    ${st.checked ? `<span class="srt-score${good === n ? ' all' : ''}">${good}/${n} düzdür${good === n ? ' — əla!' : ''}</span>` : ''}</div>`;
}
const srtHTML = s => s.srt ? s.srt.map((ex, i) => `<div class="srt" data-srt="${s.id}:${i}" data-type="${ex.type}">${srtInner(s.id + ':' + i)}</div>`).join('') : '';
function srtRedraw(k) { const el = document.querySelector(`[data-srt="${k}"]`); if (el) el.innerHTML = srtInner(k); }
function srtDrop(k, j, to) { // order: to = new position; group: to = group index or -1 (back to the pool)
  const st = srtState(k);
  if ('order' in st) { const o = st.order.filter(v => v !== j); o.splice(to, 0, j); st.order = o; }
  else { st.at[j] = to; st.seq = st.seq.filter(v => v !== j).concat(j); st.pick = null; }
  st.checked = false; srtRedraw(k);
}
let DRAG = null;
document.addEventListener('pointerdown', ev => {
  const h = ev.target.closest('.srt [data-drag]'); if (!h || ev.button > 0) return;
  const card = h.closest('.srt-item, .srt-chip'), r = card.getBoundingClientRect();
  DRAG = { k: h.closest('.srt').dataset.srt, j: +h.dataset.drag, card, x: ev.clientX, y: ev.clientY, dx: ev.clientX - r.left, dy: ev.clientY - r.top, w: r.width, ghost: null };
});
function srtTarget(ev) {
  const el = document.elementFromPoint(ev.clientX, ev.clientY), box = el && el.closest(`[data-srt="${DRAG.k}"]`);
  if (!box) return null;
  if (box.dataset.type === 'order') { // new position = how many other steps sit above the pointer
    const items = [...box.querySelectorAll('.srt-item')].filter(e => +e.dataset.j !== DRAG.j);
    const to = items.filter(e => { const r = e.getBoundingClientRect(); return r.top + r.height / 2 < ev.clientY; }).length;
    return { to, el: items[Math.min(to, items.length - 1)] };
  }
  const z = el.closest('.srt-zone'); return z ? { to: +z.dataset.g, el: z } : null;
}
// while a card is held near the top or bottom edge the page scrolls, so a group below the screen can be reached
function srtAutoScroll() {
  if (!DRAG || !DRAG.ghost) return;
  const y = DRAG.cy, v = y < 90 ? -14 : y > window.innerHeight - 110 ? 14 : 0;
  if (v) window.scrollBy(0, v);
  requestAnimationFrame(srtAutoScroll);
}
document.addEventListener('pointermove', ev => {
  if (!DRAG) return;
  DRAG.cy = ev.clientY;
  if (!DRAG.ghost) {
    if (Math.hypot(ev.clientX - DRAG.x, ev.clientY - DRAG.y) < 6) return;
    DRAG.ghost = DRAG.card.cloneNode(true); DRAG.ghost.classList.add('srt-ghost'); DRAG.ghost.style.width = DRAG.w + 'px';
    document.body.appendChild(DRAG.ghost); DRAG.card.classList.add('srt-lift');
    requestAnimationFrame(srtAutoScroll);
  }
  ev.preventDefault();
  DRAG.ghost.style.transform = `translate(${ev.clientX - DRAG.dx}px,${ev.clientY - DRAG.dy}px)`;
  $$('.srt-over').forEach(e => e.classList.remove('srt-over'));
  const t = srtTarget(ev); if (t && t.el) t.el.classList.add('srt-over');
}, { passive: false });
function srtEnd(ev, drop) {
  if (!DRAG) return;
  const d = DRAG; let t = null;
  if (d.ghost && drop) t = srtTarget(ev);
  DRAG = null;
  if (d.ghost) {
    d.ghost.remove(); d.card.classList.remove('srt-lift'); $$('.srt-over').forEach(e => e.classList.remove('srt-over'));
    // swallow only the click that the browser sends right after this pointerup, not the next real tap
    const stop = e => { e.stopPropagation(); e.preventDefault(); };
    window.addEventListener('click', stop, { capture: true, once: true });
    setTimeout(() => window.removeEventListener('click', stop, { capture: true }), 0);
  }
  if (t) srtDrop(d.k, d.j, t.to);
}
document.addEventListener('pointerup', ev => srtEnd(ev, true));
document.addEventListener('pointercancel', ev => srtEnd(ev, false));
/* interactive diagrams (interactive.json): a BVA number line with a slider and a "buggy code" switch, a state machine
   driven by event buttons, a decision table driven by condition switches. State lives in memory; SVG uses theme tokens. */
const IX = {};
const ixHTML = s => s.ix ? `<div class="ix" data-ix="${s.id}" data-type="${s.ix.type}">${ixInner(s.id)}</div>` : '';
function ixRedraw(sid) { const el = document.querySelector(`[data-ix="${sid}"]`); if (el) el.innerHTML = ixInner(sid); }
function ixInner(sid) {
  const c = secById[sid].ix;
  return `<div class="ix-k">${icon('play')}İnteraktiv · ${esc(c.title)}</div><p class="ix-hint">${esc(c.hint || '')}</p>`
    + (c.type === 'bva' ? bvaHTML(sid, c) : c.type === 'state' ? stHTML(sid, c) : dtHTML(sid, c));
}
// BVA: the slider re-renders only the picture and the verdict, so dragging it is never interrupted
function bvaHTML(sid, c) {
  const st = IX[sid] || (IX[sid] = { v: c.ep, three: false, bug: false });
  return `<input type="range" class="bva-range" min="${c.from}" max="${c.to}" step="1" value="${st.v}" data-ix-range="${sid}" aria-label="${esc(c.label)}">
    <div class="bva-out">${bvaOut(sid, c)}</div>
    <div class="ix-tgs"><label><input type="checkbox" data-ix-tg="three" data-sid="${sid}"${st.three ? ' checked' : ''}> 3 dəyərli BVA</label>
      ${c.bug ? `<label><input type="checkbox" data-ix-tg="bug" data-sid="${sid}"${st.bug ? ' checked' : ''}><span>Proqramçının səhv kodu: <code>${esc(c.bug.code)}</code></span></label>` : ''}</div>`;
}
function bvaOut(sid, c) {
  const st = IX[sid], v = st.v, W = 340, P = 16, X = n => P + (n - c.from) * (W - 2 * P) / (c.to - c.from);
  const pts = st.three ? [c.min - 1, c.min, c.min + 1, c.max - 1, c.max, c.max + 1] : [c.min - 1, c.min, c.max, c.max + 1];
  const ticks = []; for (let n = Math.ceil(c.from / 10) * 10; n <= c.to; n += 10) ticks.push(n);
  const valid = v >= c.min && v <= c.max;
  const cls = v < c.min ? `invalid sinif (${c.min}-dən kiçik)` : v > c.max ? `invalid sinif (${c.max}-dən böyük)` : `valid sinif (${c.min}–${c.max})`;
  const role = v === c.min - 1 || v === c.max + 1 ? 'sərhəddən kənar qonşu' : v === c.min || v === c.max ? 'sərhədin özü'
    : v === c.min + 1 || v === c.max - 1 ? 'sərhədin içəridəki qonşusu (3 dəyərli BVA)' : v === c.ep ? 'EP: valid sinifdən bir dəyər' : '';
  const actual = c.bug && st.bug ? v >= c.bug.lo && v <= c.bug.hi : valid;
  const yn = ok => `<b class="${ok ? 'ix-ok' : 'ix-bad'}">${ok ? 'Qəbul' : 'Xəta'}</b>`;
  const svg = `<svg class="ix-svg" viewBox="0 0 ${W} 76" role="img" aria-label="${esc(c.label)} ${v}: ${esc(cls)}">
    <rect class="bva-bad" x="${P}" y="30" width="${X(c.min - 0.5) - P}" height="10" rx="3"/>
    <rect class="bva-good" x="${X(c.min - 0.5)}" y="30" width="${X(c.max + 0.5) - X(c.min - 0.5)}" height="10" rx="3"/>
    <rect class="bva-bad" x="${X(c.max + 0.5)}" y="30" width="${W - P - X(c.max + 0.5)}" height="10" rx="3"/>
    ${pts.map(n => `<line class="bva-pt" x1="${X(n)}" y1="24" x2="${X(n)}" y2="46"/>`).join('')}
    ${ticks.map(n => `<text class="bva-tl" x="${X(n)}" y="62" text-anchor="middle">${n}</text>`).join('')}
    <text class="bva-tl b" x="${X(c.min)}" y="74" text-anchor="middle">${c.min}</text><text class="bva-tl b" x="${X(c.max)}" y="74" text-anchor="middle">${c.max}</text>
    <path class="bva-cur" d="M${X(v) - 6} 8 L${X(v) + 6} 8 L${X(v)} 20 Z"/>
  </svg>`;
  const chips = [c.ep].concat(pts).map(n => `<button class="chip${n === v ? ' acc' : ''}" data-act="ix-set" data-sid="${sid}" data-v="${n}">${n}${n === c.ep ? ' · EP' : ''}</button>`).join('');
  return `${svg}<div class="row bva-chips">${chips}</div>
    <div class="ix-info"><div><b>${esc(c.label)}: ${v}</b> — ${esc(cls)}${role ? ` · ${esc(role)}` : ''}</div>
      <div>Gözlənilən nəticə: ${yn(valid)}</div>
      ${c.bug && st.bug ? `<div>Faktiki nəticə (<code>${esc(c.bug.code)}</code>): ${yn(actual)} — ${actual !== valid ? `<b class="ix-found">Defekt tapıldı!</b> Düzgün kod: <code>${esc(c.bug.fix)}</code>` : 'fərq yoxdur, bu dəyər səhvi tapmır.'}</div>` : ''}</div>`;
}
// state machine: nodes and edges are drawn from the config; the current state, the last edge and the table row light up
function stHTML(sid, c) {
  const st = IX[sid] || (IX[sid] = { cur: c.start, log: [] });
  const S = Object.fromEntries(c.states.map(s => [s.id, s])), W = 64, H = 30, mid = s => [s.x + W / 2, s.y + H / 2];
  const edge = (a, b) => { // clip the centre-to-centre line to both boxes
    const [ax, ay] = mid(a), [bx, by] = mid(b), dx = bx - ax, dy = by - ay;
    const t = (w, h) => Math.min(dx ? w / 2 / Math.abs(dx) : 1e9, dy ? h / 2 / Math.abs(dy) : 1e9);
    const ta = t(W + 6, H + 6), tb = t(W + 10, H + 10);
    return [ax + dx * ta, ay + dy * ta, bx - dx * tb, by - dy * tb];
  };
  const evName = Object.fromEntries(c.events.map(e => [e.id, e.label.split(' ')[0].toLocaleLowerCase('az')]));
  const last = st.log[st.log.length - 1];
  const edges = [];
  Object.entries(c.moves).forEach(([f, mm]) => Object.entries(mm).forEach(([e, m]) => { if (m[0] !== f) edges.push([f, m[0], e]); }));
  // a pair of opposite edges is drawn as two parallel lines; labels sit on one side, near the start of the edge
  const svgEdges = edges.map(([f, t, e]) => {
    const back = edges.some(x => x[0] === t && x[1] === f), [x1, y1, x2, y2] = edge(S[f], S[t]);
    const len = Math.hypot(x2 - x1, y2 - y1) || 1, nx = (y2 - y1) / len, ny = -(x2 - x1) / len, o = back ? 4 : 0;
    const on = last && last.from === f && last.to === t, flat = Math.abs(nx) < 0.35, k = back || flat ? 0.5 : 0.32, lo = back ? 11 : 6;
    const anchor = flat ? 'middle' : nx > 0 ? 'start' : 'end'; // the label grows away from its line, never across it
    return `<line class="st-edge${on ? ' on' : ''}" x1="${x1 + nx * o}" y1="${y1 + ny * o}" x2="${x2 + nx * o}" y2="${y2 + ny * o}" marker-end="url(#ixa-${sid}${on ? '-on' : ''})"/>
      <text class="st-el" x="${x1 + (x2 - x1) * k + nx * lo}" y="${y1 + (y2 - y1) * k + ny * lo + 3}" text-anchor="${anchor}">${esc(evName[e])}</text>`;
  }).join('');
  const loops = c.states.filter(s => Object.values(c.moves[s.id] || {}).some(m => m[0] === s.id)).map(s => {
    const on = last && last.from === s.id && last.to === s.id;
    return `<path class="st-edge${on ? ' on' : ''}" d="M${s.x + 18} ${s.y - 1} C ${s.x + 18} ${s.y - 16}, ${s.x + 46} ${s.y - 16}, ${s.x + 46} ${s.y - 3}" fill="none" marker-end="url(#ixa-${sid}${on ? '-on' : ''})"/>`;
  }).join('');
  const nodes = c.states.map(s => `<g class="st-node${s.id === st.cur ? ' on' : ''}"><rect x="${s.x}" y="${s.y}" width="${W}" height="${H}" rx="9"/><text x="${s.x + W / 2}" y="${s.y + H / 2 + 4}" text-anchor="middle">${esc(s.short)}</text></g>`).join('');
  const maxY = Math.max(...c.states.map(s => s.y)) + H + 8;
  const svg = `<svg class="ix-svg" viewBox="0 -10 348 ${maxY + 10}" role="img" aria-label="Hazırkı vəziyyət: ${esc(S[st.cur].label)}">
    <defs><marker id="ixa-${sid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto"><path class="st-arr" d="M0 0L10 5L0 10z"/></marker>
      <marker id="ixa-${sid}-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto"><path class="st-arr on" d="M0 0L10 5L0 10z"/></marker></defs>
    ${svgEdges}${loops}${nodes}</svg>`;
  const btns = c.events.map(e => `<button class="btn sm" data-act="ix-ev" data-sid="${sid}" data-e="${e.id}"${(c.moves[st.cur] || {})[e.id] ? '' : ' disabled'}>${esc(e.label)}</button>`).join('');
  const table = `<div class="tbl st-tbl"><table><thead><tr><th>Hazırkı vəziyyət</th>${c.events.map(e => `<th>${esc(e.label)}</th>`).join('')}</tr></thead><tbody>${c.states.map(s => `<tr class="${s.id === st.cur ? 'on' : ''}"><td>${esc(s.label)}</td>${c.events.map(e => {
    const m = (c.moves[s.id] || {})[e.id];
    return `<td class="${m && m[2] === 'warn' ? 'warn' : ''}">${m ? (m[0] === s.id ? `${esc(S[m[0]].label)} qalır` : esc(S[m[0]].label)) : '—'}</td>`;
  }).join('')}</tr>`).join('')}</tbody></table></div>`;
  const log = st.log.length ? `<ol class="st-log">${st.log.slice(-6).map(l => `<li class="${l.warn ? 'warn' : ''}"><b>${esc(S[l.from].short)}</b> — ${esc(l.ev)} → <b>${esc(S[l.to].short)}</b>. ${esc(l.note)}</li>`).join('')}</ol>` : '';
  return `${svg}<div class="ix-info"><div>Hazırkı vəziyyət: <b>${esc(S[st.cur].label)}</b></div></div>
    <div class="row st-btns">${btns}<button class="btn sm ghost" data-act="ix-reset" data-sid="${sid}">${icon('refresh')}Yenidən başla</button></div>${log}${table}`;
}
// decision table: the switches pick a combination, the matching rule's column lights up; "—" conditions are dimmed
function dtHTML(sid, c) {
  const st = IX[sid] || (IX[sid] = { v: Object.fromEntries(c.conditions.map(k => [k.id, true])) });
  const ri = c.rules.findIndex(r => c.conditions.every(k => r.when[k.id] === null || r.when[k.id] === st.v[k.id]));
  const rule = c.rules[ri], free = c.conditions.filter(k => rule && rule.when[k.id] === null);
  const yn = b => b === null ? '—' : b ? 'Bəli' : 'Xeyr';
  const sw = c.conditions.map(k => `<div class="dt-sw${free.includes(k) ? ' dim' : ''}"><span class="lb">${esc(k.label)}${free.includes(k) ? ' <i>(bu qaydada fərqi yoxdur)</i>' : ''}</span>
    <div class="seg">${[true, false].map(b => `<button data-act="ix-dt" data-sid="${sid}" data-c="${k.id}" data-v="${b ? 1 : 0}" aria-pressed="${st.v[k.id] === b}">${yn(b)}</button>`).join('')}</div></div>`).join('');
  const table = `<div class="tbl dt-tbl"><table><thead><tr><th></th>${c.rules.map((_, i) => `<th class="${i === ri ? 'on' : ''}">Qayda ${i + 1}</th>`).join('')}</tr></thead><tbody>
    ${c.conditions.map(k => `<tr><td>${esc(k.label)}</td>${c.rules.map((r, i) => `<td class="${i === ri ? 'on' : ''}">${yn(r.when[k.id])}</td>`).join('')}</tr>`).join('')}
    <tr class="res"><td>Nəticə</td>${c.rules.map((r, i) => `<td class="${i === ri ? 'on' : ''}">${esc(r.result)}</td>`).join('')}</tr></tbody></table></div>`;
  const n = c.conditions.length;
  return `<div class="dt-sws">${sw}</div>
    <div class="ix-info"><div>Bu kombinasiya → <b>Qayda ${ri + 1}</b>: ${esc(rule ? rule.result : '?')}</div>
      <div class="muted">2<sup>${n}</sup> = ${2 ** n} kombinasiya → ${c.rules.length} qayda, yəni ${c.rules.length} test.</div></div>${table}`;
}
function textBody(c, s) {
  const lv = lvlOf(s.id);
  if (lv === 'short') {
    return `<div class="short"><div class="short-k">Qısa</div><div class="prose">${s.x.short}</div></div>${cmpHTML(s)}${srtHTML(s)}${ixHTML(s)}${simHTML(s)}${trHTML(s)}${keysHTML(s.x)}
      <button class="btn sm ghost more" data-act="lvl" data-sec="${s.id}" data-v="std">${icon('book')}Tam mətni oxu</button>${miniHTML(c, s, false)}`;
  }
  return `<div class="prose">${s.html}</div>${cmpHTML(s)}${srtHTML(s)}${ixHTML(s)}${simHTML(s)}${trHTML(s)}${keysHTML(s.x)}${deepHTML(s, lv === 'deep')}${miniHTML(c, s, lv === 'deep')}`;
}
function fbHTML(a) {
  let h = '';
  if (a && a.fb) h += `<div class="fb-h">${gradeChip(a.g)}<span>Claude rəyi</span></div><div class="prose">${mdToHtml(a.fb)}</div>`;
  if (a && a.h) h += `<div class="fb-h" style="${a.fb ? 'margin-top:12px' : ''}">${icon('bulb')}<span>İpucu</span></div><div class="prose">${mdToHtml(a.h)}</div>`;
  return h;
}
/* screen words: answers that describe results get an instant, offline hint when they use opinion, ability, inference,
   "should" or description words instead of what is visible on screen */
const SW_TASK = /gözlənilən|faktiki|bug report|test case|checklist|ssenari/i;
const SW_ON = '(?<!\\p{L})', SW_OFF = '(?!\\p{L})';
const swRe = src => new RegExp(src, 'gu');
const SW_RULES = [
  { kind: 'rəy', re: swRe(`${SW_ON}(düzgün\\s+işlə\\p{L}*|işlə(mir|mədi|məyəcək)|normal(dır|\\s+işlə\\p{L}*)?|qaydasındadır|problemsiz|problem\\s+yoxdur|uğurla|yaxşı\\s+işlə\\p{L}*)${SW_OFF}`),
    tip: 'Bu, rəydir — oxuyan ekranda nəyə baxacağını bilmir. Görünəni yaz: hansı səhifə açılır, hansı mətn çıxır.' },
  { kind: 'bacarıq', re: swRe(`${SW_ON}\\p{L}+[aə]\\s+bil(irəm|ərəm|dim|ir|ər)${SW_OFF}`),
    tip: '“…a bilirəm” sənin bacarığındır, ekranın vəziyyəti deyil. Məsələn: “Your Cart” səhifəsi açılır, siyahıda Sauce Labs Backpack görünür.' },
  { kind: 'çıxarış', re: swRe(`${SW_ON}(sıfırlan\\p{L}*|qəbul\\s+(edil|olun)\\p{L}*|yadda\\s+saxlan\\p{L}*|əlavə\\s+olun\\p{L}*)${SW_OFF}`),
    tip: 'Bu, nəticə çıxarışıdır — bunu ekranda nədən gördün? Məsələn: səbət nişanında 1 görünür, düymənin yazısı “Remove” olur.' },
  { kind: 'gözlənti', re: swRe(`${SW_ON}\\p{L}+(malı|məli)(dır|dir)?${SW_OFF}`),
    tip: '“-malıdır” nə olmalı olduğunu deyir. Nəticəni ekran sözü ilə yaz: “açılır”, “görünür” (“açılmalıdır” yox).' },
  { kind: 'təsvir', re: swRe(`${SW_ON}(düzgün|yanlış|səhv|etibarlı|keçərli|uyğun|mövcud|real)\\s+(parol|şifrə|username|istifadəçi\\s+adı|login|e-?poçt|e-?mail|məlumat|data|dəyər|ad|soyad|kod|nömrə)${SW_OFF}`),
    tip: 'Bu, təsvirdir — klaviaturada olduğu kimi yaza bilməzsən. Konkret dəyər yaz: standard_user, secret_sauce, ali@mail.az.' }
];
const SW_NEG = swRe(`${SW_ON}(açılmır|görünmür|çıxmır|dəyişmir|gəlmir|yüklənmir)${SW_OFF}`);
const SW_POS = /(?<!\p{L})(açılır|görünür|qalır|yazılıb|çıxır|olur|dəyişir)(?!\p{L})/u;
function swFind(text, neg = true) {
  // quoted text is copied from the screen on purpose («Sifarişiniz uğurla qəbul edildi»), so it is not checked
  const t = (text || '').toLocaleLowerCase('az').replace(/“[^”\n]*”|«[^»\n]*»|"[^"\n]*"|„[^“”\n]*[“”]/g, ' '), seen = new Set(), out = [];
  const add = (w, kind, tip) => { const k = kind + '|' + w; if (!seen.has(k) && out.length < 6) { seen.add(k); out.push({ w, kind, tip }); } };
  SW_RULES.forEach(r => { for (const m of t.matchAll(r.re)) add(m[0], r.kind, r.tip); });
  // a negation alone says what is missing, not what the screen shows (the practice store checks those facts itself)
  if (neg) t.split('\n').forEach(line => { if (SW_POS.test(line)) return; for (const m of line.matchAll(SW_NEG)) add(m[0], 'inkar', 'Yalnız inkar yazılıb. Ekranda əvəzinə nə olduğunu da yaz: məsələn, “Checkout: Your Information” səhifəsində qalır.'); });
  return out;
}
const swInner = text => swList(swFind(text));
function swList(f) {
  if (!f.length) return '';
  return `<div class="swc-h">${icon('eye')}<span>Ekran sözləri</span></div><ul>${f.map(x => `<li><mark>${esc(x.w)}</mark><span class="chip warn">${x.kind}</span><span class="tip">${esc(x.tip)}</span></li>`).join('')}</ul>
    <div class="swc-f">Ekranda görünəni yazan sözlər: açılır · görünür · yox olur · çıxır · yazılıb · qalır</div>`;
}
const swBox = (id, itemHtml, text) => SW_TASK.test(itemHtml) ? `<div class="swc" data-swc="${id}" aria-live="polite"${swFind(text).length ? '' : ' hidden'}>${swInner(text)}</div>` : '';
function swUpdate(t) {
  const box = document.querySelector(`[data-swc="${t.dataset.ans}"]`); if (!box) return;
  const h = swInner(t.value); box.innerHTML = h; box.hidden = !h;
}
function tasksHTML(c, s) {
  const A = ansDoc(c.id).a;
  const head = (s.intro ? `<div class="prose">${s.intro}</div>` : '') +
    `<p class="muted" style="margin:0;font-size:14px">Cavabların avtomatik saxlanılır.<span class="ai-only"> “Yoxla” — Claude rəyi, “İpucu” — həlli açmadan istiqamət.</span></p>`;
  return head + s.tasks.map((t, i) => {
    const a = A[t.id] || {};
    const done = a.g === 'Əla' || a.g === 'Yaxşı';
    return `<div class="task${done ? ' done' : ''}" id="${t.id}">
      <div class="task-q"><span class="task-n">${i + 1}</span><div class="prose">${t.html}</div></div>
      <textarea class="field" data-ans="${t.id}" data-ch="${c.id}" rows="4" placeholder="Cavabını bura yaz…">${esc(a.t || '')}</textarea>${swBox(t.id, t.html, a.t)}
      <div class="task-ctrl"><span class="st" data-st="${t.id}">${a.t ? 'Saxlanıb' : ''}</span>
        <button class="btn sm ghost ai-only" data-act="task-hint" data-task="${t.id}">${icon('bulb')}İpucu</button>
        <button class="btn sm primary ai-only" data-act="task-check" data-task="${t.id}">${icon('check')}Yoxla</button></div>
      <div class="fb" data-fb="${t.id}"${a.fb || a.h ? '' : ' hidden'}>${fbHTML(a)}</div>
    </div>`;
  }).join('');
}
function selfHTML(c, s) {
  const A = ansDoc(c.id).a;
  return s.items.map(q => {
    const a = A[q.id] || {};
    return `<div class="selfq" id="${q.id}"><div class="q prose" style="font-family:var(--f-ui);font-size:15.5px">${q.html}</div>
      <textarea class="field" data-ans="${q.id}" data-ch="${c.id}" rows="2" placeholder="Qısa cavabın…">${esc(a.t || '')}</textarea>${swBox(q.id, q.html, a.t)}
      <div class="task-ctrl"><span class="st" data-st="${q.id}">${a.t ? 'Saxlanıb' : ''}</span><button class="btn sm primary ai-only" data-act="self-check" data-q="${q.id}">${icon('check')}Yoxla</button></div>
      <div class="fb" data-fb="${q.id}"${a.fb ? '' : ' hidden'}>${fbHTML(a)}</div></div>`;
  }).join('');
}
function checklistHTML(s) {
  const K = Store.doc('checks').k;
  const done = s.items.filter(i => K[i.id]).length;
  return `<p class="muted" style="margin:0 0 4px;font-size:13.5px" data-chkcount="${s.id}">${done}/${s.items.length} yoxlanılıb</p><ul class="checklist">` +
    s.items.map(i => `<li><label><input type="checkbox" data-chk="${i.id}" data-sec="${s.id}"${K[i.id] ? ' checked' : ''}><span>${i.html}</span></label></li>`).join('') + '</ul>';
}
function secHTML(c, s) {
  const learned = !!P().learned[s.id];
  let body;
  if (s.kind === 'example') body = exampleHTML(s) + trHTML(s);
  else if (s.kind === 'tasks') body = tasksHTML(c, s);
  else if (s.kind === 'selfcheck') body = selfHTML(c, s);
  else if (s.kind === 'checklist') body = checklistHTML(s);
  else if (s.x) body = textBody(c, s);
  else body = `<div class="prose">${s.html}</div>${cmpHTML(s)}${srtHTML(s)}${ixHTML(s)}${simHTML(s)}${trHTML(s)}`;
  return `<section class="sec${learned ? ' learned' : ''}" id="${s.id}" data-sec="${s.id}" data-kind="${s.kind}">
    <header class="sec-h"><span class="sec-num">${esc(s.num || kindTag(s).toLocaleUpperCase('az'))}</span><h2>${esc(s.title)}</h2>${s.x ? lvlCtl(s.id, lvlOf(s.id)) : ''}</header>
    ${body}${footerHTML(c, s)}</section>`;
}
function refreshSec(sid) {
  const el = document.getElementById(sid); if (!el) return;
  const c = chById[secCh[sid]], s = secById[sid];
  const tmp = document.createElement('div'); tmp.innerHTML = secHTML(c, s);
  const nu = tmp.firstElementChild;
  el.replaceWith(nu);
  if (observer) observer.observe(nu);
  $$('.dg-scroll', nu).forEach(d => { if (d.scrollWidth > d.clientWidth + 4) d.closest('figure').classList.add('wide'); });
  return nu;
}
function vReader(v) {
  const c = chById[S.params.ch] || chById.c0;
  if (c.kind === 'glossary') { S.view = 'glossary'; vGlossary(v); return; }
  const p = partOf(c);
  const pl = partLabel(p);
  const kicker = c.num ? `Fəsil ${pad2(c.num)}${pl ? ' · ' + pl.pn + ' hissə' : ''}` : (c.id === 'c0' ? 'Giriş' : 'Əlavə B');
  setHeader({ back: true, kicker, name: c.title, right: [{ act: 'toc', icon: 'list', label: 'Mündəricat' }, { act: 'search', icon: 'search', label: 'Axtarış' }], readbar: true });
  const st = chStats(c);
  const stats = c.kind === 'chapter' ? `<div class="ch-stats">
      <span class="chip ${st.done === st.total ? 'pass' : ''}">${icon('check')}${st.done}/${st.total} bölmə</span>
      ${st.q ? `<span class="chip ${st.q.best / st.q.n >= .7 ? 'pass' : 'warn'}">Test ${st.q.best}/${st.q.n}</span>` : `<span class="chip">Test: ${QUIZ[c.num] ? QUIZ[c.num].length : 0} sual</span>`}
    </div>` : '';
  const idx = CHAPTERS.indexOf(c);
  const prev = CHAPTERS.slice(0, idx).reverse().find(x => x.kind !== 'glossary');
  const next = CHAPTERS.slice(idx + 1).find(x => x.kind !== 'glossary');
  const q = c.kind === 'chapter' && QUIZ[c.num];
  const rpId = c.kind === 'chapter' && RP_LINKS[c.num];
  const rp = rpId && RP.find(x => x.id === rpId);
  const end = `<div class="ch-end">
    ${q ? `<button class="quizcta" data-act="quiz" data-ch="${c.num}">${icon('target')}<div style="flex:1;min-width:0"><b>Fəsil testi</b><span>${q.length} sual · izahlı cavablar${st.q ? ' · ən yaxşı nəticə ' + st.q.best + '/' + st.q.n : ''}</span></div>${icon('arrow')}</button>` : ''}
    ${c.kind === 'chapter' ? `<button class="quizcta alt" data-act="konspekt" data-ch="${c.id}">${icon('list')}<div style="flex:1;min-width:0"><b>Fəslin konspekti</b><span>hər bölmədən 3 əsas fikir, tipik səhvlər və terminlər</span></div>${icon('arrow')}</button>
    <button class="quizcta alt" data-act="sum" data-ch="${c.id}">${icon('print')}<div style="flex:1;min-width:0"><b>Xülasə vərəqi</b><span>fəsil bir səhifədə: əsas fikirlər, sxem, terminlər · çap et və ya PDF kimi saxla</span></div>${icon('arrow')}</button>` : ''}
    ${rp ? `<button class="quizcta alt ai-only" data-act="rp-open" data-rp="${rp.id}">${icon('users')}<div style="flex:1;min-width:0"><b>Rol oyunu: ${esc(rp.title)}</b><span>${esc(rp.who)} ilə real iş söhbətini məşq et — sonda Claude rəy verir</span></div>${icon('arrow')}</button>` : ''}
    <div class="nav2">${prev ? `<button data-act="open-ch" data-ch="${prev.id}"><div class="k">← Əvvəlki</div><div class="n">${esc(prev.title)}</div></button>` : '<span></span>'}
    ${next ? `<button class="next" data-act="open-ch" data-ch="${next.id}"><div class="k">Növbəti →</div><div class="n">${esc(next.title)}</div></button>` : '<span></span>'}</div></div>`;
  const tools = c.kind === 'chapter' ? `<div class="ch-tools">
      <div class="ch-lvl"><span class="lb">İzah səviyyəsi</span>${lvlCtl('', PREF().lvl || 'std', 'lvl-all')}</div>
      <div class="row"><button class="btn sm" data-act="konspekt" data-ch="${c.id}">${icon('list')}Konspekt</button><button class="btn sm" data-act="sum" data-ch="${c.id}">${icon('print')}Xülasə vərəqi</button><button class="btn sm ai-only" data-act="ch-lesson" data-ch="${c.id}">${icon('steps')}Fəsil üzrə dərs</button></div>
    </div>` : '';
  v.innerHTML = `<header class="ch-hero"><div class="kicker"><b>${c.num ? 'Fəsil ' + pad2(c.num) : (c.id === 'c0' ? 'Giriş' : 'Əlavə B')}</b>${pl && pl.pn ? ' · ' + esc(pl.name) : ''}</div>
    <h1 class="h1">${esc(c.title)}</h1>${stats}${tools}
    ${c.intro ? `<div class="prose ch-intro">${c.intro}</div>` : ''}</header>
    ${c.sections.map(s => secHTML(c, s)).join('')}${end}`;
  // reading position
  const target = S.params.sec && ((S.params.focus === 'deep' && document.querySelector(`#${S.params.sec} details.deep`)) || document.getElementById(S.params.sec));
  if (target) requestAnimationFrame(() => { target.scrollIntoView({ block: 'start' }); });
  observer = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        const sid = en.target.id; const p = P();
        if (!p.last || p.last.sec !== sid || p.last.ch !== c.id) { p.last = { ch: c.id, sec: sid }; Store.changed('progress', 2500); }
      }
    });
  }, { rootMargin: '-35% 0px -60% 0px' });
  $$('.sec', v).forEach(el => observer.observe(el));
  $$('.dg-scroll', v).forEach(d => { if (d.scrollWidth > d.clientWidth + 4) d.closest('figure').classList.add('wide'); });
  if (!target && (!P().last || P().last.ch !== c.id)) { P().last = { ch: c.id, sec: c.sections[0] ? c.sections[0].id : null }; Store.changed('progress', 2500); }
  onScroll();
}
/* ---------- chapter summary (konspekt) ---------- */
function konspektText(c) {
  let out = `${chLabel(c)} — konspekt\n\n`;
  c.sections.filter(s => s.x).forEach(s => { out += `${secLabel(s)}\n${s.x.keys.map(k => '  • ' + htmlToText(k)).join('\n')}\n\n`; });
  const pit = c.sections.find(s => s.kind === 'pitfalls');
  if (pit) out += 'Tez-tez edilən səhvlər\n' + htmlToText(pit.html) + '\n\n';
  const terms = GLOSS.filter(g => g.ch.includes(c.num));
  if (terms.length) out += 'Terminlər\n' + terms.map(g => `  • ${g.en} — ${g.az}: ${g.def}`).join('\n') + '\n';
  return out.trim();
}
function vKonspekt(v) {
  const c = chById[S.params.ch] || MAIN[0];
  setHeader({ back: true, kicker: `Konspekt · Fəsil ${pad2(c.num)}`, name: c.title, right: [{ act: 'kon-copy', icon: 'copy', label: 'Konspekti kopyala' }] });
  const L = P().learned;
  const secs = c.sections.filter(s => s.x);
  const pit = c.sections.find(s => s.kind === 'pitfalls');
  const terms = GLOSS.filter(g => g.ch.includes(c.num));
  v.innerHTML = `<header class="ch-hero"><div class="kicker"><b>Fəsil ${pad2(c.num)}</b> · konspekt</div><h1 class="h1">${esc(c.title)}</h1>
      <p class="muted" style="margin:8px 0 0;font-size:14.5px">Hər bölmədən 3 əsas fikir. Bölməyə toxunsan, oxu ekranında açılacaq.</p>
      <div class="row" style="margin-top:12px"><button class="btn sm" data-act="kon-copy">${icon('copy')}Kopyala</button><button class="btn sm" data-act="sum" data-ch="${c.id}">${icon('print')}Xülasə vərəqi</button><button class="btn sm ai-only" data-act="kon-quiz" data-ch="${c.id}">${icon('help')}Konspekt üzrə məni yoxla</button></div></header>
    <div class="kon">${secs.map(s => `<div class="ksec${L[s.id] ? ' ok' : ''}"><button class="ksec-h" data-act="goto-sec" data-sec="${s.id}"><span class="n">${esc(s.num)}</span><b>${esc(s.title)}</b>${L[s.id] ? `<span class="ok">${icon('check')}</span>` : ''}</button>
      <ol>${s.x.keys.map(k => `<li>${k}</li>`).join('')}</ol></div>`).join('')}</div>
    ${pit ? `<section class="block"><div class="block-h"><h2>Tez-tez edilən səhvlər</h2></div><div class="card kon-pit prose">${pit.html}</div></section>` : ''}
    ${terms.length ? `<section class="block"><div class="block-h"><h2>Fəslin terminləri</h2><span class="muted" style="font-size:13px">${terms.length}</span></div><div class="row">${terms.map(g => `<button class="chip" data-act="gt" data-g="${g.id}">${esc(g.en)}</button>`).join('')}</div></section>` : ''}
    <div class="qz-act" style="margin-top:22px"><button class="btn primary" data-act="quiz" data-ch="${c.num}">${icon('target')}Fəsil testi</button><button class="btn ghost" data-act="open-ch" data-ch="${c.id}">${icon('book')}Fəslə qayıt</button></div>`;
}
/* ---------- summary sheet: one chapter on one printed A4 page ---------- */
// the offline app on GitHub Pages: the claude.ai frame may ignore print(), so its fallback links there
const SITE = 'https://ilkinrzyv.github.io/qa-kitabi/';
const dgCache = {};
function chDiagram(c) { // the chapter's first diagram, as rendered in the reader
  if (dgCache[c.id] === undefined) {
    const s = c.sections.find(x => /<figure class="diagram/.test(x.html || ''));
    dgCache[c.id] = s ? s.html.match(/<figure class="diagram[\s\S]*?<\/figure>/)[0] : '';
  }
  return dgCache[c.id];
}
const unP = h => String(h || '').replace(/<\/?p>/g, ' ').trim();
function sumHTML(c, hl) {
  const L = P().learned, st = chStats(c);
  const secs = c.sections.filter(s => s.x);
  const pit = c.sections.find(s => s.kind === 'pitfalls');
  const self = c.sections.find(s => s.kind === 'selfcheck');
  const terms = GLOSS.filter(g => g.ch.includes(c.num));
  const dg = chDiagram(c), pl = partLabel(partOf(c)), q = QUIZ[c.num];
  const shape = !dg ? 'dg-0' : /^<figure class="diagram narrow/.test(dg) ? 'dg-n' : 'dg-w';
  return `<article class="sum ${shape}" data-ch="${c.id}">
    <header class="sum-h"><div class="sum-hl"><div class="sum-k">QA Kitabı · Fəsil ${pad2(c.num)}${pl && pl.pn ? ' · ' + esc(pl.full) : ''}</div><${hl} class="sum-t">${esc(c.title)}</${hl}></div>
      <div class="sum-meta"><span class="chip">${secs.length} əsas fikir</span>${terms.length ? `<span class="chip">${terms.length} termin</span>` : ''}
        <span class="chip${st.done === st.total ? ' pass' : ''}">${icon('check')}${st.done}/${st.total} öyrənildi</span>
        ${q ? `<span class="chip${st.q ? (st.q.best / st.q.n >= .7 ? ' pass' : ' warn') : ''}">${st.q ? `Test ${st.q.best}/${st.q.n}` : `Test: ${q.length} sual`}</span>` : ''}</div></header>
    <section class="sum-ideas"><h3 class="sum-l">${icon('bulb')}Əsas fikirlər</h3><ol>${secs.map(s => `<li${L[s.id] ? ' class="ok"' : ''}><span class="n">${esc(s.num)}</span><div><b>${esc(s.title)}.</b> ${unP(s.x.short)}</div></li>`).join('')}</ol></section>
    ${dg ? `<section class="sum-dg"><h3 class="sum-l">${icon('layers')}Sxem</h3>${dg}</section>` : ''}
    ${pit ? `<section class="sum-pit"><h3 class="sum-l">${icon('x')}Tez-tez edilən səhvlər</h3><div class="sum-pit-b">${pit.html}</div></section>` : ''}
    ${self ? `<section class="sum-self"><h3 class="sum-l">${icon('help')}Özünü yoxla</h3><ul>${self.items.map(i => `<li>${unP(i.html)}</li>`).join('')}</ul></section>` : ''}
    ${terms.length ? `<section class="sum-terms"><h3 class="sum-l">${icon('abc')}Terminlər</h3><ul>${terms.map(g => `<li><button class="gt" data-act="gt" data-g="${g.id}">${esc(g.en)}</button> — ${esc(g.az)}</li>`).join('')}</ul></section>` : ''}
    <footer class="sum-f"><span>${esc(SITE.replace(/^https:\/\//, ''))}#${c.id}</span>${q ? `<span>Fəsil testi: ${q.length} sual</span>` : ''}</footer>
  </article>`;
}
function vSummary(v) {
  const all = S.params.ch === 'all';
  const c = all ? null : MAIN.find(x => x.id === S.params.ch) || MAIN[0];
  setHeader({ back: true, kicker: all ? 'Xülasə vərəqləri' : `Xülasə vərəqi · Fəsil ${pad2(c.num)}`, name: all ? `Bütün fəsillər · ${MAIN.length} səhifə` : c.title, right: [{ act: 'sum-print', icon: 'print', label: 'Çap et və ya PDF kimi saxla' }] });
  const i = all ? -1 : MAIN.indexOf(c), prev = MAIN[i - 1], next = MAIN[i + 1];
  v.innerHTML = `<div class="sum-bar"><p class="muted">${all ? `Hər fəsil bir A4 səhifəsində, cəmi ${MAIN.length} səhifə.` : 'Fəsil bir A4 səhifəsində.'} Çap pəncərəsində printer kimi «PDF kimi saxla» (Save as PDF) seçsən, PDF faylı alınar.</p>
      <div class="row"><button class="btn primary" data-act="sum-print">${icon('print')}${all ? `Hamısını çap et (${MAIN.length} səhifə)` : 'Çap et / PDF'}</button>${all ? '' : `<button class="btn ghost" data-act="konspekt" data-ch="${c.id}">${icon('list')}Konspekt</button><button class="btn ghost" data-act="open-ch" data-ch="${c.id}">${icon('book')}Fəslə qayıt</button>`}</div></div>
    <div class="sums">${(all ? MAIN : [c]).map(x => sumHTML(x, all ? 'h2' : 'h1')).join('')}</div>
    ${all ? '' : `<div class="nav2 sum-nav">${prev ? `<button data-act="sum" data-ch="${prev.id}" data-replace="1"><div class="k">← Fəsil ${prev.num} vərəqi</div><div class="n">${esc(prev.title)}</div></button>` : '<span></span>'}
      ${next ? `<button class="next" data-act="sum" data-ch="${next.id}" data-replace="1"><div class="k">Fəsil ${next.num} vərəqi →</div><div class="n">${esc(next.title)}</div></button>` : '<span></span>'}</div>`}`;
}
// print: .paper gives each sheet its A4 layout; --k shrinks a long chapter's sheet until it fits one page
const PAGE_H = 270 * 96 / 25.4; // A4 height without the 12 mm @page margins, minus 3 mm of slack, in CSS px
function fitSheet(el) {
  el.style.setProperty('--k', '1');
  let lo = 0.6, hi = 1;
  if (el.offsetHeight > PAGE_H) {
    for (let n = 0; n < 7; n++) { const k = (lo + hi) / 2; el.style.setProperty('--k', k.toFixed(3)); if (el.offsetHeight <= PAGE_H) lo = k; else hi = k; }
    el.style.setProperty('--k', lo.toFixed(3));
  } else lo = 1;
  el.dataset.k = lo.toFixed(3);
}
function paperOn() { $$('#view .sum').forEach(el => { el.classList.add('paper'); fitSheet(el); }); }
function paperOff() { $$('#view .sum.paper').forEach(el => el.classList.remove('paper')); }
window.addEventListener('beforeprint', paperOn); // also for the browser's own Print menu
window.addEventListener('afterprint', paperOff);
function printSheets() {
  let opened = false;
  const mark = () => { opened = true; };
  window.addEventListener('beforeprint', mark);
  paperOn();
  try { window.print(); } catch (e) { }
  // a sandboxed frame (the claude.ai version) can ignore print() without an error: then no beforeprint follows
  setTimeout(() => { window.removeEventListener('beforeprint', mark); if (!opened) { paperOff(); printHelp(); } }, 1200);
}
function printHelp() {
  const hash = MAIN.some(c => c.id === S.params.ch) ? S.params.ch + '-xulase' : 'xulase';
  openSheet(sheetHead('Çap', 'Çap pəncərəsi açılmadı') + `<div class="sheet-body">
    <p style="margin:0 0 12px">${PWA ? 'Brauzerin menyusundan «Çap et» (Print) seç. PDF üçün printer siyahısında «PDF kimi saxla» (Save as PDF) seç.'
      : 'claude.ai bu pəncərədən çapa icazə verməyə bilər. Vərəqi oflayn tətbiqdə aç və orada çap et və ya PDF kimi saxla.'}</p>
    ${PWA ? '' : `<a class="btn primary" href="${esc(SITE + '#' + hash)}" target="_blank" rel="noopener">${icon('ext')}Oflayn tətbiqdə aç</a>`}</div>`, 'compact');
}
/* ---------- practice store (store.json): a small shop modelled on saucedemo.com. The reader runs a test case in it and
   writes the actual result; the book compares that text with the screen as it was right after the last step ---------- */
const STORE = BOOK.store;
const prodById = Object.fromEntries(STORE.products.map(p => [p.id, p]));
const scById = Object.fromEntries(STORE.scenarios.map(s => [s.id, s]));
const SM_PAGES = { login: '', products: 'Products', cart: 'Your Cart', info: 'Checkout: Your Information', overview: 'Checkout: Overview', complete: 'Checkout: Complete!' };
const SM_SORTS = [['az', 'Name (A to Z)'], ['za', 'Name (Z to A)'], ['lohi', 'Price (low to high)'], ['hilo', 'Price (high to low)']];
const SM_FIELDS = { user: 'Username', pass: 'Password', first: 'First Name', last: 'Last Name', zip: 'Zip/Postal Code' };
const SM_BUG = { noAdd: ['bolt', 'fleece'], noRemove: ['bikelight'] }; // problem_user's planted bugs; their labels are in store.json
const SM = { id: undefined, found: {}, passed: {} }; // session only
const money = n => '$' + n.toFixed(2);
const tcName = id => id.replace(/^tc/, 'TC-');
const smFresh = s0 => ({ page: s0.page, user: s0.user || '', cart: (s0.cart || []).slice(), sort: 'az', order: 'az', err: '', menu: false, f: { user: '', pass: '', first: '', last: '', zip: '' } });
function smStart(id) {
  const sc = scById[id] || null, nid = sc ? id : null;
  // a restart keeps the open bug report: reproducing the bug again is how its frequency (3/3) is measured
  Object.assign(SM, { id: nid, sc, done: 0, off: false, snap: null, fb: null, ans: '', status: '', title: '', touched: {}, st: smFresh(sc ? sc.start : { page: 'login' }),
    rep: SM.id === nid ? SM.rep : null });
}
function smOrder(st) {
  const name = (a, b) => a.name.localeCompare(b.name, 'en');
  const by = { az: name, za: (a, b) => name(b, a), lohi: (a, b) => a.price - b.price || name(a, b), hilo: (a, b) => b.price - a.price || name(a, b) };
  return STORE.products.slice().sort(by[st.order]);
}
const smSig = st => [st.page, st.user, st.cart.join(), st.order].join('|');
function smEvent(e) {
  const before = smSig(SM.st);
  smApply(SM.st, e, SM.found);
  smStep(e, before);
}
// the shop itself: one event changes one state (the practice store's, or the code tracer's browser); planted bugs that
// fire are noted in `found`
function smApply(st, e, found) {
  const prob = st.user === 'problem_user';
  switch (e.ev) {
    case 'login': {
      const u = st.f.user.trim(), p = st.f.pass; Object.assign(e, { user: u, pass: p });
      st.err = !u ? 'Epic sadface: Username is required' : !p ? 'Epic sadface: Password is required'
        : !STORE.users.includes(u) || p !== STORE.password ? 'Epic sadface: Username and password do not match any user in this service'
        : u === 'locked_out_user' ? 'Epic sadface: Sorry, this user has been locked out.' : '';
      if (!st.err) Object.assign(st, { user: u, page: 'products' });
      break;
    }
    case 'add': if (prob && SM_BUG.noAdd.includes(e.item)) found.add = (found.add || 0) + 1; else if (!st.cart.includes(e.item)) st.cart.push(e.item); break;
    case 'remove': if (prob && e.where === 'products' && SM_BUG.noRemove.includes(e.item)) found.remove = (found.remove || 0) + 1; else st.cart = st.cart.filter(x => x !== e.item); break;
    case 'sort': st.sort = e.v; if (!prob) st.order = e.v; else if (e.v !== 'az') found.sort = (found.sort || 0) + 1; break;
    case 'cart': Object.assign(st, { page: 'cart', menu: false }); break;
    case 'shop': Object.assign(st, { page: 'products', menu: false }); break;
    case 'checkout': Object.assign(st, { page: 'info', err: '' }); Object.assign(st.f, { first: '', last: '', zip: '' }); break;
    case 'cancel': Object.assign(st, { page: st.page === 'info' ? 'cart' : 'products', err: '' }); break;
    case 'continue': {
      const f = st.f; Object.assign(e, { first: f.first, last: f.last, zip: f.zip });
      st.err = !f.first ? 'Error: First Name is required' : !f.last ? 'Error: Last Name is required' : !f.zip ? 'Error: Postal Code is required' : '';
      if (!st.err) st.page = 'overview';
      break;
    }
    case 'finish': Object.assign(st, { page: 'complete', cart: [] }); break;
    case 'home': st.page = 'products'; break;
    case 'logout': Object.assign(st, { page: 'login', user: '', err: '', menu: false }); Object.assign(st.f, { user: '', pass: '' }); break;
    case 'reset': Object.assign(st, { cart: [], sort: 'az', order: 'az', menu: false }); break;
    case 'menu': st.menu = !st.menu; break;
    case 'err-x': st.err = ''; break;
  }
}
// steps tick in order: a typing step checks the field, an action step needs this event; an action that is not the next
// step and changes the page, the cart or the order spoils the run (the screen would no longer be the test case's)
function smStep(e, before) {
  const sc = SM.sc;
  if (!sc || SM.snap || SM.off) return;
  let used = false;
  for (let s = sc.steps[SM.done]; s; s = sc.steps[SM.done]) {
    const on = s.on;
    if (on.ev === 'type' ? (on.v !== undefined ? SM.st.f[on.f] === on.v : SM.touched[on.f]) : !used && Object.keys(on).every(k => on[k] === e[k])) { used = used || on.ev !== 'type'; SM.done++; }
    else break;
  }
  if (!used && !['type', 'menu', 'err-x'].includes(e.ev)) {
    if (smSig(SM.st) !== before) SM.off = true;
    else if (e.ev === 'login' || e.ev === 'continue') toast('Addım sayılmadı: sahələrdəki dəyərləri test data ilə tutuşdur.');
  }
  if (SM.done === sc.steps.length) SM.snap = smSnap();
}
function smType(t) {
  const st = SM.st, f = t.dataset.smF;
  SM.touched[f] = true;
  if (f === 'last' && st.user === 'problem_user' && t.value) { // planted bug: Last Name's letters land in First Name
    st.f.first = t.value.slice(-1); st.f.last = ''; t.value = ''; SM.found.last = (SM.found.last || 0) + 1;
    const fi = $('#sm-dev [data-sm-f="first"]'); if (fi) fi.value = st.f.first;
  } else st.f[f] = t.value;
  smEvent({ ev: 'type', f, v: st.f[f] });
  smRedraw(true);
}
// what the screen shows for one item of the expected result
function smVal(k) {
  const st = SM.st, [a, b] = k.split(':');
  if (a === 'title') return SM_PAGES[st.page];
  if (a === 'badge') return st.page === 'login' ? 0 : st.cart.length;
  if (a === 'error') return st.err;
  if (a === 'header') return st.page === 'complete' ? 'Thank you for your order!' : '';
  if (a === 'first') return st.page === 'products' ? smOrder(st)[0].name : '';
  if (a === 'btn') return st.cart.includes(b) ? 'Remove' : 'Add to cart';
  if (a === 'item') return st.page === 'cart' && st.cart.includes(b);
  return st.f[b];
}
function smSnap() { const o = {}; Object.keys(SM.sc.expect).concat(SM.sc.see || []).forEach(k => { o[k] = smVal(k); }); return o; }
function smLabel(k) {
  const [a, b] = k.split(':'), p = prodById[b];
  return { title: 'Səhifə başlığı', badge: 'Səbət nişanı', error: 'Xəta mesajı', header: 'Mesaj', first: 'Siyahıda birinci məhsul',
    btn: p && `${p.name} düyməsi`, item: p && `Səbət siyahısında ${p.name}`, field: `${SM_FIELDS[b]} sahəsi` }[a];
}
function smShow(k, v) {
  const a = k.split(':')[0];
  if (a === 'badge') return v ? String(v) : 'görünmür';
  if (a === 'item') return v ? 'var' : 'yoxdur';
  if (a === 'first') return v ? `${v} (${money(STORE.products.find(p => p.name === v).price)})` : '—';
  return v ? `«${v}»` : a === 'field' ? 'boş' : 'yoxdur';
}
const smList = o => Object.keys(o).map(k => `${smLabel(k)}: ${smShow(k, o[k])}`).join('; ');
// comparing the written actual result with the screen: folded text, quotes ignored; a short value must stand alone
const fz = s => fold(s).replace(/[«»“”"'’„`]/g, '').replace(/\s+/g, ' ').trim();
const SM_NO = /(yox|gorunmur|itdi|itir|silin|cixdi|qalmadi|qalmir|bos)/;
function smHas(T, v) {
  const x = fz(v).replace(/[.!]+$/, '');
  return x.length < 3 ? new RegExp(`(^|[^a-z0-9])${x.replace(/[^a-z0-9]/g, '\\$&')}([^a-z0-9]|$)`).test(T) : T.includes(x);
}
function smNear(T, v) { const w = fz(v).split(/[^a-z0-9]+/).filter(x => x.length > 2); return w.length > 2 && w.filter(x => T.includes(x)).length / w.length >= 0.6; }
function smJudge(T, k, v, exp) {
  const [a, b] = k.split(':'), r = { k, v, ok: false, note: '' };
  if (a === 'badge') {
    const zero = /(nisan|badge|ikon)[^.;\n]{0,25}\b0\b/.test(T);
    if (v) r.ok = smHas(T, String(v)) && !zero;
    else r.ok = !zero && (/(nisan|badge|ikon)[^.;\n]{0,40}(yox|gorunmur|it(di|ir)|silin|bos|qalm)/.test(T) || /(yox|gorunmur)[^.;\n]{0,30}(nisan|badge)/.test(T));
    if (zero) r.note = 'Ekranda “0” yox idi: nişan ümumiyyətlə görünmürdü. “Səbət nişanı görünmür” yaz.';
    else if (!r.ok && exp && exp !== v && smHas(T, String(exp))) r.note = `${exp} gözlənilən idi — ekranda nişan görünmürdü.`;
    return r;
  }
  if (a === 'item') { const n = smHas(T, prodById[b].name); r.ok = v ? n : n && SM_NO.test(T); return r; }
  if (a === 'field') { const l = T.includes(fz(SM_FIELDS[b])); r.ok = l && (v ? smHas(T, v) : SM_NO.test(T)); return r; }
  if (!v) { r.ok = /(xeta|error)[^.;\n]{0,30}(yox|cixmir|gorunmur)/.test(T); return r; }
  r.ok = smHas(T, v) || (smNear(T, v) && 'near');
  if (!r.ok && typeof exp === 'string' && exp && exp !== v && smHas(T, exp)) r.note = `«${exp}» gözlənilən idi — ekranda ${smShow(k, v)} idi.`;
  return r;
}
// "what happens" needs the object and a behaviour on screen (folded verbs: düşür, dəyişmir, görünür, qalır, açılır, basanda…)
const SM_ACT = /(dus|deyis|gorun|qal|cix|acil|yox|silin|elave|kec|olur|olmur|getmir|gedir|yazil|itir|azal|artir|basanda|secilende)/;
function smBugParts(t, bug) {
  const T = fz(t), has = arr => arr.some(x => T.includes(fz(x)));
  return [['Harada', has(bug.where)], ['Nə baş verir', has(bug.what) && SM_ACT.test(T)], ['Hansı şərtdə', has(bug.when)]];
}
function smCheck() {
  const sc = SM.sc;
  if (!SM.snap) { toast('Əvvəlcə addımları mağazada icra et.'); return; }
  if (!SM.ans.trim()) { toast('Faktiki nəticəni yaz.'); return; }
  if (!SM.status) { toast('Status seç: Passed və ya Failed.'); return; }
  const T = fz(SM.ans);
  const rows = Object.keys(SM.snap).map(k => smJudge(T, k, SM.snap[k], sc.expect[k]));
  const truth = Object.keys(sc.expect).every(k => SM.snap[k] === sc.expect[k]) ? 'Passed' : 'Failed';
  const bug = truth === 'Failed' && SM.status === 'Failed' && sc.bug ? { parts: smBugParts(SM.title, sc.bug), sw: swFind(SM.title, false), empty: !SM.title.trim() } : null;
  const good = rows.every(r => r.ok === true) && SM.status === truth && (!bug || (!bug.empty && bug.parts.every(p => p[1])));
  SM.fb = { rows, truth, sw: swFind(SM.ans, false), bug, good };
  if (good) SM.passed[sc.id] = 1;
  const el = $('#sm-fb'); if (el) el.innerHTML = smFbHTML();
  if (SM.rep) brRedraw();
}
const smMark = ok => ok === true ? `<span class="sm-ok">${icon('check')}</span>` : ok === 'near' ? '<span class="sm-near">≈</span>' : `<span class="sm-no">${icon('x')}</span>`;
function smFbHTML() {
  const f = SM.fb, sc = SM.sc; if (!f) return '';
  const rows = f.rows.map(r => `<li>${smMark(r.ok)}<div><b>${esc(smLabel(r.k))}</b> — ekranda: ${esc(smShow(r.k, r.v))} · ${r.ok === true ? 'yazmısan' : r.ok === 'near' ? 'mətn tam dəqiq deyil, ekrandakı kimi köçür' : 'faktiki nəticədə yoxdur'}${r.note ? `<div class="sm-note">${esc(r.note)}</div>` : ''}</div></li>`).join('');
  const diff = Object.keys(sc.expect).filter(k => SM.snap[k] !== sc.expect[k]).map(k => `${smLabel(k)}: gözlənilən ${smShow(k, sc.expect[k])}, ekranda ${smShow(k, SM.snap[k])}`);
  const stOk = SM.status === f.truth, b = f.bug;
  return `<div class="sm-fb-h">Faktiki nəticə ekranla tutuşduruldu</div><ul class="sm-rows">${rows}</ul>
    ${f.sw.length ? `<div class="swc">${swList(f.sw)}</div>` : ''}
    <div class="sm-st ${stOk ? 'ok' : 'no'}">${smMark(stOk)}<div><b>Status: ${f.truth}</b> — ${f.truth === 'Passed' ? 'faktiki nəticə gözlənilənlə üst-üstə düşür.' : `faktiki nəticə gözləniləndən fərqlidir. ${esc(diff.join('; '))}.`}${stOk ? '' : ` Sən ${SM.status} seçmisən.`}</div></div>
    ${b ? `<div class="sm-bug"><div class="sm-fb-h">Bug başlığı: [harada] + [nə baş verir] + [hansı şərtdə]</div>
      ${b.empty ? '<p class="muted">Başlıq yazılmayıb.</p>' : `<ul class="sm-rows">${b.parts.map(([n, ok]) => `<li>${smMark(ok)}<div><b>${n}</b>${ok ? '' : ' — başlıqda yoxdur'}</div></li>`).join('')}</ul>`}
      ${b.sw.length ? `<div class="swc">${swList(b.sw)}</div>` : ''}
      ${SM.rep ? '' : `<div class="row" style="margin-top:10px"><button class="btn" data-act="br-open" data-b="${sc.bug.r}">${icon('bug')}Tam bug report yaz</button></div>`}</div>` : ''}
    ${f.good ? `<div class="sm-good">${icon('check')}Əla — faktiki nəticə ekranla, status gözlənilənlə uyğundur.</div>` : ''}
    <details class="cmp-why sm-model"><summary>${icon('eye')}Ekranda nə vardı? (nümunə cavab)</summary><p>${esc(smList(SM.snap))}.</p>
      ${sc.bug && f.truth === 'Failed' ? `<p><b>Bug başlığı:</b> ${esc(sc.bug.model)}</p>` : ''}</details>`;
}
function smDevHTML(st = SM.st) {
  const n = st.cart.length, pg = st.page;
  const btn = (e, label, cls, extra) => `<button class="sm-btn${cls ? ' ' + cls : ''}" data-act="sm" data-e="${e}"${extra || ''}>${label}</button>`;
  const err = st.err ? `<div class="sm-err" role="alert"><span>${esc(st.err)}</span><button data-act="sm" data-e="err-x" aria-label="Bağla">✕</button></div>` : '';
  const inp = (f, type) => `<input class="sm-in${st.err ? ' bad' : ''}" data-sm-f="${f}" type="${type || 'text'}" placeholder="${SM_FIELDS[f]}" value="${esc(st.f[f])}" autocomplete="off" autocapitalize="off" spellcheck="false">`;
  const line = (p, b) => `<div class="sm-item">${pg === 'products' ? '' : '<span class="sm-qty">1</span>'}<div><div class="sm-name">${esc(p.name)}</div><div class="sm-price">${money(p.price)}</div></div>${b || ''}</div>`;
  const items = st.cart.map(id => prodById[id]);
  const total = items.reduce((a, p) => a + p.price, 0), tax = Math.round(total * 8) / 100;
  if (pg === 'login') return `<div class="sm-logo big">Mini Store</div><div class="sm-body">${inp('user')}${inp('pass', 'password')}${err}${btn('login', 'Login', 'main')}
    <div class="sm-cred"><b>Accepted usernames are:</b><br>${STORE.users.join('<br>')}<br><b>Password for all users:</b><br>${esc(STORE.password)}</div></div>`;
  const body = {
    products: () => smOrder(st).map(p => line(p, st.cart.includes(p.id) ? btn('remove', 'Remove', 'rm', ` data-item="${p.id}" data-where="products"`) : btn('add', 'Add to cart', '', ` data-item="${p.id}" data-where="products"`))).join(''),
    cart: () => `<div class="sm-ch"><span>QTY</span><span>Description</span></div>${items.map(p => line(p, btn('remove', 'Remove', 'rm', ` data-item="${p.id}" data-where="cart"`))).join('')}
      <div class="sm-acts">${btn('shop', 'Continue Shopping')}${btn('checkout', 'Checkout', 'main')}</div>`,
    info: () => `${inp('first')}${inp('last')}${inp('zip')}${err}<div class="sm-acts">${btn('cancel', 'Cancel')}${btn('continue', 'Continue', 'main')}</div>`,
    overview: () => `<div class="sm-ch"><span>QTY</span><span>Description</span></div>${items.map(p => line(p)).join('')}
      <div class="sm-sum">Payment Information: <b>Test card #0001</b><br>Item total: ${money(total)}<br>Tax: ${money(tax)}<br><b>Total: ${money(total + tax)}</b></div>
      <div class="sm-acts">${btn('cancel', 'Cancel')}${btn('finish', 'Finish', 'main')}</div>`,
    complete: () => `<div class="sm-done-h">Thank you for your order!</div><p class="sm-done-p">Your order has been dispatched.</p>${btn('home', 'Back Home', 'main')}`
  }[pg]();
  return `<div class="sm-bar"><button class="sm-ib" data-act="sm" data-e="menu" aria-label="Open Menu">☰</button><span class="sm-logo">Mini Store</span>
      <button class="sm-ib sm-cart" data-act="sm" data-e="cart" aria-label="Səbət">${icon('cart')}${n ? `<span class="sm-badge">${n}</span>` : ''}</button></div>
    ${st.menu ? `<div class="sm-menu"><button data-act="sm" data-e="shop">All Items</button><button data-act="sm" data-e="logout">Logout</button><button data-act="sm" data-e="reset">Reset App State</button></div>` : ''}
    <div class="sm-ph"><span class="sm-title">${SM_PAGES[pg]}</span>${pg === 'products' ? `<select class="sm-sort" data-sm-sort aria-label="Sıralama">${SM_SORTS.map(([v, l]) => `<option value="${v}"${st.sort === v ? ' selected' : ''}>${l}</option>`).join('')}</select>` : ''}</div>
    <div class="sm-body">${body}</div>`;
}
function smCaseHTML() {
  const sc = SM.sc;
  if (!sc) {
    const ids = Object.keys(STORE.bugs), got = ids.filter(k => SM.found[k]);
    return `<div class="card sm-case"><div class="sm-id">Exploratory testing</div><h2 class="sm-t">${esc(STORE.free.title)}</h2><p class="sm-p">${esc(STORE.free.charter)}</p>
      <div class="sm-state${got.length === ids.length ? ' ok' : ''}">Tapılan bug-lar: <b>${got.length}/${ids.length}</b>${got.length ? `<ul class="sm-found">${got.map(k => `<li>${icon('check')}<div><span>${esc(STORE.bugs[k])}</span>${SM.rep && SM.rep.bid === k ? '' : `<button class="btn sm" data-act="br-open" data-b="${k}">${icon('bug')}Bug report yaz</button>`}</div></li>`).join('')}</ul>` : '<br>Bug tapanda burada görünəcək. Hər tapıntı üçün tam bug report yaz: başlıq 12.2-dəki formula ilə.'}</div>
      <div class="row" style="margin-top:10px"><button class="btn sm ghost" data-act="sm-restart">${icon('refresh')}Mağazanı sıfırla</button></div></div>`;
  }
  const n = sc.steps.length;
  const state = SM.off ? `<div class="sm-state off">${icon('x')}Bu hərəkət növbəti addım deyildi və ekranı dəyişdi — nəticə artıq bu test case-in nəticəsi deyil. “Yenidən başla” bas.</div>`
    : SM.snap ? `<div class="sm-state ok">${icon('check')}Son addımdan sonrakı ekran qeydə alındı. İndi faktiki nəticəni yaz: ekranda nə görünür?</div>`
    : `<div class="sm-state">Addımları aşağıdakı mağazada icra et: ${SM.done}/${n}.</div>`;
  return `<div class="card sm-case"><div class="sm-id">${tcName(sc.id)}</div><h2 class="sm-t">${esc(sc.title)}</h2>
    <dl class="sm-dl"><dt>İlkin şərt</dt><dd>${esc(sc.pre)}</dd>
      ${sc.data.length ? `<dt>Test data</dt><dd><table class="sm-data">${sc.data.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table></dd>` : ''}
      <dt>Addımlar</dt><dd><ol class="sm-steps">${sc.steps.map((s, i) => `<li class="${i < SM.done ? 'done' : i === SM.done && !SM.snap ? 'cur' : ''}">${esc(s.t)}${i < SM.done ? ` ${icon('check')}` : ''}</li>`).join('')}</ol></dd>
      <dt>Gözlənilən nəticə</dt><dd>${esc(smList(sc.expect))}</dd></dl>
    ${state}<div class="row" style="margin-top:10px"><button class="btn sm ghost" data-act="sm-restart">${icon('refresh')}Yenidən başla</button></div></div>`;
}
function smResHTML() {
  return `<div class="sm-fb-h">Faktiki nəticə</div>
    <textarea class="field" data-sm-ans rows="3" placeholder="Ekranda nə görünür? Məsələn: səhifə başlığı, düymənin yazısı, səbət nişanı">${esc(SM.ans)}</textarea>
    <div class="sm-fb-h" style="margin-top:12px">Status</div>
    <div class="seg sm-seg">${['Passed', 'Failed'].map(v => `<button data-act="sm-status" data-v="${v}" aria-pressed="${SM.status === v}">${v}</button>`).join('')}</div>
    <div id="sm-bt"${SM.status === 'Failed' ? '' : ' hidden'}><div class="sm-fb-h" style="margin-top:12px">Bug report başlığı</div>
      <input class="field sm-title-in" data-sm-title placeholder="[harada] + [nə baş verir] + [hansı şərtdə]" value="${esc(SM.title)}"></div>
    <div class="row" style="margin-top:12px"><button class="btn primary" data-act="sm-check">${icon('check')}Yoxla</button></div>
    <div id="sm-fb" class="sm-fb" aria-live="polite">${smFbHTML()}</div>`;
}
function smRedraw(typing) {
  const cs = $('#sm-case'); if (cs) cs.innerHTML = smCaseHTML();
  const dv = $('#sm-dev'); if (dv && !typing) dv.innerHTML = smDevHTML();
}
function vStore(v) {
  const id = scById[S.params.sc] ? S.params.sc : null;
  if (SM.id !== id) smStart(id);
  const sc = SM.sc;
  setHeader({ back: true, kicker: 'Məşq mağazası', name: sc ? `${tcName(sc.id)} · ${sc.title}` : STORE.free.title });
  const pick = [`<button class="chip${sc ? '' : ' acc'}" data-act="sm-open" data-sc="">${icon('search')}Kəşfiyyat</button>`]
    .concat(STORE.scenarios.map(x => `<button class="chip${x === sc ? ' acc' : SM.passed[x.id] ? ' pass' : ''}" data-act="sm-open" data-sc="${x.id}">${SM.passed[x.id] ? icon('check') : ''}${tcName(x.id)}</button>`)).join('');
  v.innerHTML = `<p class="muted sm-intro">Mini Store — saucedemo.com-dakı mağazaya bənzəyən sadələşdirilmiş model (real sayt deyil). Test case-in addımlarını burada icra et, faktiki nəticəni yaz: kitab onu ekranda olanla tutuşdurur.</p>
    <div class="sm-pick">${pick}</div><div id="sm-case">${smCaseHTML()}</div><div class="sm-dev" id="sm-dev">${smDevHTML()}</div>
    ${sc ? `<div class="card sm-res">${smResHTML()}</div>` : ''}<div id="br">${brHTML()}</div>`;
}
/* full bug report (store.json "reports"): every field of 12.1 for one planted bug, checked field by field. The screenshot
   is the shop's screen at that moment, so it proves the bug only after the bug happened, on the page where it shows ---------- */
const REP = STORE.reports;
const BR_SEV = ['Blocker', 'Critical', 'Major', 'Minor', 'Trivial'], BR_PRI = ['High', 'Medium', 'Low'];
const BR_F = { title: 'Başlıq (Summary)', env: 'Mühit (Environment)', sev: 'Severity', pri: 'Priority (təklif)', pre: 'İlkin şərtlər',
  steps: 'Təkrarlama addımları', exp: 'Gözlənilən nəticə', act: 'Faktiki nəticə', freq: 'Təkrarlanma tezliyi', shot: 'Əlavələr (sübut)' };
const BR_SEEN = { add: st => st.page === 'products', remove: st => st.page === 'products' && st.cart.includes('bikelight'),
  sort: st => st.page === 'products' && st.sort !== 'az', last: st => st.page === 'info' && !st.f.last };
const BR_ENV = /(chrome|firefox|safari|edge|opera|yandex|brauzer|windows|android|ios|iphone|ipad|macos|mac os|linux)/;
function brOpen(bid) {
  const sc = !!(SM.sc && SM.sc.bug && SM.sc.bug.r === bid);
  SM.rep = { bid, sc, f: { title: sc ? SM.title : '', env: '', sev: '', pri: '', pre: '', steps: '', exp: '', act: '', freq: '' }, shot: null, fb: null };
}
const brSteps = t => String(t || '').split(/\n+|\s+(?=\d+[).]\s)/).map(x => x.replace(/^\s*\d+[).]\s*/, '').trim()).filter(Boolean);
const brMiss = (T, groups) => groups.filter(g => !g.k.some(k => smHas(T, k))).map(g => g.l);
function uaEnv() {
  const u = navigator.userAgent, v = re => (u.match(re) || [])[1];
  const b = v(/Edg\/(\d+)/) ? 'Edge ' + v(/Edg\/(\d+)/) : v(/OPR\/(\d+)/) ? 'Opera ' + v(/OPR\/(\d+)/) : v(/Firefox\/(\d+)/) ? 'Firefox ' + v(/Firefox\/(\d+)/)
    : v(/Chrome\/(\d+)/) ? 'Chrome ' + v(/Chrome\/(\d+)/) : v(/Version\/(\d+)[^]*Safari/) ? 'Safari ' + v(/Version\/(\d+)[^]*Safari/) : '';
  const os = /Android/.test(u) ? 'Android' : /iPhone|iPad/.test(u) ? 'iOS' : /Windows/.test(u) ? 'Windows' : /Mac OS X/.test(u) ? 'macOS' : /Linux/.test(u) ? 'Linux' : '';
  return [os, b].filter(Boolean).join(', ') || 'ƏS və brauzer';
}
function brShot() {
  const r = SM.rep, st = JSON.parse(JSON.stringify(SM.st));
  const d = new Date();
  r.shot = { st, ok: !!SM.found[r.bid] && st.user === 'problem_user' && BR_SEEN[r.bid](st), at: [d.getHours(), d.getMinutes(), d.getSeconds()].map(pad2).join(':') };
}
function brCheck() {
  const r = SM.rep, R = REP[r.bid], f = r.f, rows = [];
  const row = (k, ok, note) => rows.push({ k, ok: !!ok, note: note || '' });
  const T = k => fz(f[k]);
  // title: the formula of 12.2, facts without emotion (12.7)
  const parts = smBugParts(f.title, R).filter(p => !p[1]).map(p => p[0].toLowerCase());
  const emo = /!{2,}/.test(f.title) || /(tecili|dehset|berbad|rezil|biabir)/.test(T('title'));
  row('title', f.title.trim() && !parts.length && !emo, !f.title.trim() ? 'Başlıq yazılmayıb.' : emo ? 'Emosiya yox, fakt yaz: “!!!”, “təcili” kimi sözləri çıxar (12.7).'
    : parts.length ? `Formulda çatışmır: ${parts.join(', ')}. Formul: [harada] + [nə baş verir] + [hansı şərtdə].` : '');
  const envOk = BR_ENV.test(T('env'));
  row('env', envOk, !envOk ? `Brauzeri və əməliyyat sistemini yaz. Sənin mühitin: ${uaEnv()}.` : !/\d/.test(f.env) ? 'Versiyanı da yaz: Chrome-da chrome://version, Firefox-da about:support.' : '');
  row('sev', R.sev.includes(f.sev), f.sev ? R.sevWhy : 'Severity seç.');
  row('pri', R.pri.includes(f.pri), f.pri ? R.priWhy : 'Priority seç: tester təklif verir, qərarı adətən Product Owner verir.');
  const preMiss = brMiss(T('pre'), R.pre);
  row('pre', !preMiss.length, preMiss.length ? `İlkin şərtlərdə yoxdur: ${preMiss.join(', ')}.` : '');
  const steps = brSteps(f.steps), needMiss = brMiss(T('pre') + ' ' + T('steps'), R.need), vague = /(nese|bir sey|ve s\.|ve sair|filan)/.test(T('steps'));
  row('steps', steps.length && !needMiss.length && !vague, !steps.length ? 'Addımları yaz: hər sətirdə bir hərəkət.' : needMiss.length ? `Addımlarda yoxdur: ${needMiss.join(', ')}.`
    : vague ? '“nəsə”, “və s.” yox — konkret hərəkət yaz.' : steps.length > R.model.steps.length + 3 ? 'Defekti təkrarlamaq üçün lazım olmayan addımları çıxar (12.7).' : '');
  const act = r.sc ? SM.ans : f.act, expMiss = brMiss(T('exp'), R.exp), same = T('exp') && T('exp') === fz(act);
  row('exp', T('exp') && !expMiss.length && !same, !T('exp') ? 'Gözlənilən nəticəni yaz: tələbə görə nə olmalı idi.' : same ? 'Gözlənilən və faktiki nəticə eynidir — onda baq yoxdur.'
    : expMiss.length ? `Gözlənilən nəticədə yoxdur: ${expMiss.join(', ')}.` : '');
  let sw = swFind(f.title, false);
  if (r.sc) {
    const ok = !!(SM.fb && SM.fb.rows.every(x => x.ok === true));
    row('act', ok, !SM.fb ? 'Faktiki nəticəni yuxarıda yaz və “Yoxla” bas.' : ok ? 'Yuxarıda ekranla tutuşdurulub.' : 'Yuxarıdakı faktiki nəticə ekranla tam uyğun deyil — orada düzəlt və yenidən yoxla.');
  } else {
    const actMiss = brMiss(T('act'), R.act), s2 = swFind(f.act, false);
    sw = sw.concat(s2);
    row('act', T('act') && !actMiss.length && !s2.length, !T('act') ? 'Faktiki nəticəni yaz: ekranda əslində nə görünür?' : actMiss.length ? `Faktiki nəticədə yoxdur: ${actMiss.join(', ')}.`
      : s2.length ? 'Rəy və ya çıxarış sözü var — ekranda görünəni yaz.' : '');
  }
  const m = f.freq.match(/(\d+)\s*\/\s*(\d+)/), n = SM.found[r.bid] || 0;
  const freqOk = m && +m[2] > 0 && +m[1] <= +m[2] && +m[1] <= n;
  row('freq', freqOk, !m ? 'Tezliyi “3/3” kimi yaz: neçə cəhddən neçəsində təkrarlandı.' : +m[1] > +m[2] ? 'Birinci ədəd cəhdlərin sayından çox ola bilməz.'
    : +m[1] > n ? `Baq bu sessiyada ${n} dəfə baş verdi, sən ${m[1]} yazmısan. Neçə dəfə təkrarlamısansa, onu yaz.` : n === 1 ? 'Bir dəfə azdır: 2–3 dəfə təkrarla ki, baqın sabit olduğu görünsün.' : '');
  row('shot', r.shot && r.shot.ok, !r.shot ? 'Baq ekranda görünəndə “Ekran şəkli” bas.' : r.shot.ok ? '' : 'Ekran şəkli baqı göstərmir: baq baş verəndən sonra, onun göründüyü səhifədə çək.');
  r.fb = { rows, sw };
}
function brMd() {
  const r = SM.rep, f = r.f, cell = s => String(s || '—').replace(/\|/g, '\\|').replace(/\s*\n+\s*/g, ' ');
  const rows = [['Başlıq', f.title], ['Mühit', f.env], ['Severity', f.sev], ['Priority', f.pri && f.pri + ' (təklif)'], ['İlkin şərtlər', f.pre],
    ['Addımlar', brSteps(f.steps).map((s, i) => `${i + 1}) ${s}`).join(' ')], ['Gözlənilən nəticə', f.exp], ['Faktiki nəticə', r.sc ? SM.ans : f.act],
    ['Təkrarlanma', f.freq], ['Əlavələr', r.shot ? 'Ekran şəkli' : '']];
  return '| Sahə | Dəyər |\n| --- | --- |\n' + rows.map(([a, b]) => `| ${a} | ${cell(b)} |`).join('\n');
}
function brFbHTML() {
  const r = SM.rep, b = r && r.fb; if (!b) return '';
  const m = REP[r.bid].model, n = b.rows.filter(x => x.ok).length;
  const model = [['Başlıq', m.title], ['Mühit', `${uaEnv()}; Mini Store (kitabdakı model)`], ['Severity', m.sev], ['Priority', m.pri + ' (təklif)'], ['İlkin şərtlər', m.pre],
    ['Addımlar', m.steps.map((s, i) => `${i + 1}) ${s}`).join(' ')], ['Gözlənilən nəticə', m.exp], ['Faktiki nəticə', m.act], ['Təkrarlanma', m.freq], ['Əlavələr', 'Baq görünən ekranın şəkli']];
  return `<div class="sm-fb-h">Hesabat yoxlandı: ${n}/${b.rows.length} sahə qaydasındadır</div>
    <ul class="sm-rows">${b.rows.map(x => `<li>${smMark(x.ok)}<div><b>${BR_F[x.k]}</b>${x.note ? `<div class="sm-note${x.ok ? ' i' : ''}">${esc(x.note)}</div>` : ''}</div></li>`).join('')}</ul>
    ${b.sw.length ? `<div class="swc">${swList(b.sw)}</div>` : ''}
    ${n === b.rows.length ? `<div class="sm-good">${icon('check')}Əla — proqramçı bu report ilə defekti səndən heç nə soruşmadan təkrarlaya bilər.</div>` : ''}
    <details class="cmp-why sm-model br-model"><summary>${icon('eye')}Nümunə hesabat</summary><div class="tbl"><table><tbody>${model.map(([a, v]) => `<tr><td>${a}</td><td>${esc(v)}</td></tr>`).join('')}</tbody></table></div></details>`;
}
function brHTML() {
  const r = SM.rep; if (!r) return '';
  const f = r.f;
  const fld = (k, ctl) => `<label class="br-f"><span class="br-l">${BR_F[k]}</span>${ctl}</label>`;
  const inp = (k, ph) => fld(k, `<input class="field br-in" data-br-f="${k}" value="${esc(f[k])}" placeholder="${esc(ph)}" autocomplete="off" spellcheck="false">`);
  const ta = (k, ph, n) => fld(k, `<textarea class="field br-ta" data-br-f="${k}" rows="${n}" placeholder="${esc(ph)}">${esc(f[k])}</textarea>`);
  const sel = (k, opts) => fld(k, `<select class="field br-sel" data-br-f="${k}"><option value="">— seç —</option>${opts.map(o => `<option${f[k] === o ? ' selected' : ''}>${o}</option>`).join('')}</select>`);
  const act = r.sc ? `<div class="br-f"><span class="br-l">${BR_F.act}</span><div class="br-ro">${SM.ans.trim() ? esc(SM.ans) : '<span class="muted">Yuxarıdakı “Faktiki nəticə” sahəsində yaz.</span>'}</div></div>`
    : ta('act', 'Ekranda əslində nə görünür', 2);
  const shot = r.shot ? `<div class="br-shot${r.shot.ok ? '' : ' bad'}"><div class="br-shot-img" inert aria-hidden="true"><div class="sm-dev">${smDevHTML(r.shot.st)}</div></div>
    <div class="br-shot-m">${icon('camera')}Ekran şəkli · ${esc(r.shot.at)}</div></div>` : '';
  return `<div class="card br"><div class="br-h">${icon('bug')}<div><div class="sm-id">Bug report${r.sc ? ' · ' + tcName(SM.sc.id) : ' · kəşfiyyat'}</div>
      <p class="sm-p">Proqramçı defekti səndən heç nə soruşmadan təkrarlaya bilməlidir (12.1). Hər sahəni doldur, sonra yoxla.</p></div></div>
    ${inp('title', '[harada] + [nə baş verir] + [hansı şərtdə]')}${inp('env', 'Məsələn: Windows 11, Chrome 141, Mini Store')}
    <div class="br-two">${sel('sev', BR_SEV)}${sel('pri', BR_PRI)}</div>
    ${ta('pre', 'Hansı istifadəçi ilə, hansı səhifədə, səbətdə nə var', 2)}${ta('steps', '1) …\n2) …\nHər sətirdə bir hərəkət', 4)}
    ${ta('exp', 'Tələbə görə nə olmalı idi', 2)}${act}${inp('freq', 'Neçə cəhddən neçəsində: məsələn, 3/3')}
    <div class="br-f"><span class="br-l">${BR_F.shot}</span><div class="row"><button class="btn sm" data-act="br-shot">${icon('camera')}Ekran şəkli</button><span class="muted br-hint">Mağaza ekranını olduğu kimi çəkir</span></div>${shot}</div>
    <div class="row br-acts"><button class="btn primary" data-act="br-check">${icon('check')}Hesabatı yoxla</button><button class="btn" data-act="br-copy">${icon('copy')}Markdown kimi kopyala</button><button class="btn ghost" data-act="br-close">Bağla</button></div>
    <div id="br-fb" class="sm-fb" aria-live="polite">${brFbHTML()}</div></div>`;
}
function brRedraw() { const el = $('#br'); if (el) el.innerHTML = brHTML(); }
const simHTML = s => s.sim ? `<div class="sm-link"><div class="srt-k">${icon('play')}Məşq mağazası</div><p class="srt-hint">Bu test case-ləri mağaza modelində icra et və faktiki nəticəni yaz — kitab onu ekranda olanla tutuşdurur.</p>
  <div class="sm-links">${s.sim.map(id => id === 'free' ? `<button class="btn sm" data-act="sm-open" data-sc="">${icon('search')}${esc(STORE.free.title)}</button>`
    : `<button class="btn sm" data-act="sm-open" data-sc="${id}"><b>${tcName(id)}</b> ${esc(scById[id].title)}</button>`).join('')}</div></div>` : '';
/* ---------- code tracer (trace.json): JavaScript runs line by line with its variables and console; a Playwright test runs
   against the practice store's shop, its lines coloured by role (locator, action, assertion) ---------- */
const TR = {}; // steps taken per program (session only)
const trById = {}, TR_LIST = [];
CHAPTERS.forEach(c => c.sections.forEach(s => (s.tr || []).forEach(p => { trById[p.id] = p; TR_LIST.push({ sid: s.id, p }); })));
const TR_URL = { login: '/', products: '/inventory.html', cart: '/cart.html', info: '/checkout-step-one.html', overview: '/checkout-step-two.html', complete: '/checkout-complete.html' };
const trHTML = s => (s.tr || []).map(p => `<div class="tr" data-tr="${p.id}">${trInner(p.id)}</div>`).join('');
function trRedraw(id) { const el = document.querySelector(`[data-tr="${id}"]`); if (el) el.innerHTML = trInner(id); }
function trCheck(st, c) {
  const nf = 'element(s) not found';
  if (c.expect === 'url') { const u = TR_URL[st.page]; return { ok: new RegExp(c.re).test(u), m: 'toHaveURL', exp: `/${c.re}/`, got: `"${u}"` }; }
  if (c.expect === 'error') return { ok: st.err.includes(c.text), m: 'toContainText', exp: `"${c.text}"`, got: st.err ? `"${st.err}"` : nf };
  if (c.expect === 'badge') { const n = st.page === 'login' ? 0 : st.cart.length; return { ok: String(n) === c.text, m: 'toHaveText', exp: `"${c.text}"`, got: n ? `"${n}"` : nf }; }
  const ok = c.expect === 'visible' ? SM_PAGES[st.page] === c.text : st.page === 'products' && st.cart.includes(c.item); // btn: the item's Remove button
  return { ok, m: 'toBeVisible', exp: 'visible', got: ok ? 'visible' : nf };
}
// replay the first i steps; a failed expect ends a Playwright test there, as the test runner does
function trRun(p, i) {
  const r = { vars: {}, changed: [], out: [], lines: new Set(), checks: [], st: null, stop: 0 };
  for (let k = 0; k < i; k++) {
    const s = p.steps[k]; r.lines.add(s.l); r.changed = Object.keys(s.v || {});
    (s.x || []).forEach(n => { delete r.vars[n]; });
    Object.assign(r.vars, s.v);
    if (s.o !== undefined) r.out.push(s.o);
    if (s.a) {
      if (s.a.ev === 'goto') r.st = smFresh({ page: 'login' });
      else if (s.a.ev === 'type') r.st.f[s.a.f] = s.a.v;
      else smApply(r.st, Object.assign({ where: 'products' }, s.a), {});
    }
    if (s.c) { const c = Object.assign({ l: s.l }, trCheck(r.st, s.c)); r.checks.push(c); if (!c.ok) { r.stop = k + 1; break; } }
  }
  return r;
}
const trLast = p => trRun(p, p.steps.length).stop || p.steps.length;
function trInner(id) {
  const p = trById[id], N = trLast(p), i = Math.min(TR[id] || 0, N), r = trRun(p, i), cur = i ? p.steps[i - 1] : null, pw = p.lang === 'pw';
  const lines = p.hl.map((h, k) => {
    const n = k + 1, chk = r.checks.filter(c => c.l === n).pop();
    return `<span class="tr-ln${cur && cur.l === n ? ' cur' : ''}${r.lines.has(n) ? ' run' : ''}${chk ? (chk.ok ? ' ok' : ' bad') : ''}"><span class="tr-no">${n}</span>${h || ' '}</span>`;
  }).join('');
  const btn = (d, label, on, cls) => `<button class="btn sm${cls ? ' ' + cls : ''}" data-act="tr" data-tr="${id}" data-d="${d}"${on ? '' : ' disabled'}>${label}</button>`;
  const ctl = `<div class="row tr-ctl">${btn('0', icon('refresh') + 'Başa', i, 'ghost')}${btn('-1', icon('back') + 'Geri', i)}${btn('1', (i ? 'Növbəti addım' : 'Başla') + icon('chev'), i < N, 'primary')}${btn('end', 'Sona', i < N, 'ghost')}<span class="tr-pos">${i}/${N}</span></div>`;
  const note = `<div class="tr-note">${cur ? esc(cur.n || `Sətir ${cur.l} icra olundu.`) : '“Başla” düyməsinə bas: kod sətir-sətir icra olunacaq.'}</div>`;
  let panes;
  if (pw) {
    const failed = r.checks.some(c => !c.ok);
    const checks = r.checks.map(c => `<div class="tr-chk">${smMark(c.ok)}<div>Sətir ${c.l}: <code>${c.m}</code>${c.ok ? ' — keçdi' : `<pre class="tr-err">Error: expect(${c.m === 'toHaveURL' ? 'page' : 'locator'}).${c.m}(expected)\nExpected: ${esc(c.exp)}\nReceived: ${esc(c.got)}</pre>`}</div></div>`).join('');
    panes = `<div class="tr-box"><div class="tr-h">Brauzer · Məşq mağazası modeli</div><div class="tr-url">${r.st ? TR_URL[r.st.page] : 'about:blank'}</div>
        ${r.st ? `<div class="sm-dev tr-dev" inert>${smDevHTML(r.st)}</div>` : '<div class="tr-empty tr-blank">Səhifə hələ açılmayıb</div>'}</div>
      <div class="tr-box"><div class="tr-h">Test nəticəsi</div>${checks || '<div class="tr-empty">Hələ yoxlama yoxdur.</div>'}
        ${i === N ? `<div class="tr-sum ${failed ? 'bad' : 'ok'}">${failed ? '1 failed' : '1 passed'}</div>` : ''}</div>`;
  } else {
    const names = Object.keys(r.vars);
    panes = `<div class="tr-box"><div class="tr-h">Dəyişənlər</div>${names.length ? `<table class="tr-vars">${names.map(n => `<tr${r.changed.includes(n) ? ' class="ch"' : ''}><td>${esc(n)}</td><td>${esc(r.vars[n])}</td></tr>`).join('')}</table>` : '<div class="tr-empty">Hələ yoxdur.</div>'}</div>
      <div class="tr-box"><div class="tr-h">Konsol</div><pre class="tr-out">${r.out.map(esc).join('\n')}</pre></div>`;
  }
  return `<div class="srt-k">${icon('play')}Kod izləyicisi · ${esc(p.title)}</div>
    <p class="srt-hint">${pw ? 'Testi addım-addım icra et: hər sətirdə brauzerdə nə baş verdiyini və yoxlamanın nəticəsini gör.' : 'Kodu addım-addım icra et: hər addımda işləyən sətir, dəyişənlərin dəyəri və konsol görünür.'}</p>
    ${pw ? '<div class="tr-legend"><span class="tr-loc">lokator</span> elementi tapır · <span class="tr-act">hərəkət</span> onunla nə edir · <span class="tr-as">yoxlama</span> nəticəni yoxlayır</div>' : ''}
    <pre class="code tr-code">${lines}</pre>${ctl}${note}<div class="tr-panes">${panes}</div>`;
}
/* ---------- glossary term popover ---------- */
// interview.json: how to say the term in a job interview, one or two sentences
const sayHTML = g => g.say ? `<div class="say"><div class="say-k">${icon('chat')}Müsahibədə belə de</div><p>${esc(g.say)}</p></div>` : '';
function openTerm(gid) {
  const g = glById[gid]; if (!g) return;
  openSheet(sheetHead('Termin', g.en) + `<div class="sheet-body"><div class="term-az">${esc(g.az)}</div><p class="term-def">${esc(g.def)}</p>${sayHTML(g)}
    <div class="row">${g.ch.map(n => `<button class="chip" data-act="open-ch" data-ch="c${n}">Fəsil ${n}</button>`).join('')}</div>
    <div class="row" style="margin-top:14px"><button class="btn sm primary ai-only" data-act="ai-term" data-g="${g.id}">${icon('spark')}Claude ilə izah</button><button class="btn sm" data-act="search-gl" data-q="${esc(g.en)}">${icon('abc')}Lüğətdə aç</button></div></div>`, 'compact');
}
function onScroll() {
  if (S.view !== 'reader') return;
  const bar = $('#topbar .readbar i'); if (!bar) return;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = (h > 0 ? clamp(window.scrollY / h, 0, 1) * 100 : 0) + '%';
}

/* ---------- practice ---------- */
function vPractice(v) {
  setHeader({ kicker: 'Məşq', name: 'Testlər, kartlar, lüğət', right: [{ act: 'search', icon: 'search', label: 'Axtarış' }, { act: 'settings', icon: 'sliders', label: 'Ayarlar' }] });
  const o = overall();
  const cells = MAIN.map(c => {
    const q = P().quiz[c.num];
    const n = QUIZ[c.num] ? QUIZ[c.num].length : 0;
    const good = q && q.best / q.n >= .7;
    return `<button class="qcell${good ? ' p' : ''}" data-act="quiz" data-ch="${c.num}" title="${esc(chLabel(c))}"><span class="id">Fəsil ${pad2(c.num)}</span><span class="sc">${q ? q.best + '/' + q.n : '—'}</span><span class="muted" style="font-size:12px">${n} sual</span></button>`;
  }).join('');
  v.innerHTML = `
  <section><div class="block-h"><h2>Fleş kartlar</h2><span class="muted" style="font-size:13px">${GLOSS.length} termin</span></div>
    <div class="card">
      <div class="row" style="justify-content:space-between;align-items:flex-start">
        <div><div style="font-weight:600;font-size:17px">${o.due ? o.due + ' kart təkrar gözləyir' : (o.newCards ? 'Yeni terminlərlə başla' : 'Bu günlük hamısı təkrarlanıb')}</div>
        <div class="muted" style="font-size:13.5px;margin-top:2px">Bilmədiyin kart tez-tez, bildiyin isə getdikcə seyrək çıxır.</div></div>
      </div>
      ${boxesHTML()}
      <div class="row" style="margin-top:14px"><button class="btn primary" data-act="cards">${icon('play')}Başla</button><button class="btn ghost" data-act="glossary">${icon('abc')}Lüğət</button></div>
    </div></section>
  <section class="block"><div class="block-h"><h2>Fəsil testləri</h2><span class="muted" style="font-size:13px">${o.quizDone}/21 · orta ${o.avg}%</span></div>
    <div class="qgrid">${cells}</div></section>
  <section class="block"><div class="block-h"><h2>Məşq mağazası</h2><span class="muted" style="font-size:13px">${Object.keys(SM.passed).length}/${STORE.scenarios.length} test case</span></div>
    <div class="card"><div class="muted" style="font-size:13.5px">saucedemo.com-a bənzəyən kiçik mağaza modeli. Test case-in addımlarını icra et, faktiki nəticəni yaz — kitab onu ekranda olanla tutuşdurur. problem_user-də gizli bug-lar var: tapdığın hər biri üçün tam bug report yaz.</div>
      <div class="row" style="margin-top:12px"><button class="btn primary" data-act="sm-open" data-sc="tc01">${icon('play')}Test case-lərlə başla</button><button class="btn" data-act="sm-open" data-sc="">${icon('search')}Kəşfiyyat sessiyası</button></div></div></section>
  <section class="block"><div class="block-h"><h2>Kod izləyicisi</h2><span class="muted" style="font-size:13px">${TR_LIST.length} proqram</span></div>
    <div class="card"><div class="muted" style="font-size:13.5px">JavaScript kodunu sətir-sətir icra et və dəyişənlərin dəyərini gör. Playwright testində lokator, hərəkət və yoxlamanı ayırd et.</div>
      <div class="sm-links" style="margin-top:12px">${TR_LIST.map(({ sid, p }) => `<button class="btn sm" data-act="goto-sec" data-sec="${sid}"><b>${esc(secById[sid].num || 'Fəsil ' + chById[secCh[sid]].num)}</b> ${esc(p.title)}</button>`).join('')}</div></div></section>
  <section class="block"><div class="block-h"><h2>Xülasə vərəqləri</h2><span class="muted" style="font-size:13px">fəsil başına 1 səhifə</span></div>
    <div class="card"><div class="muted" style="font-size:13.5px">Əsas fikirlər, sxem, tipik səhvlər, “Özünü yoxla” sualları və terminlər bir A4 səhifəsində. Təkrar və müsahibəyə hazırlıq üçün çap et və ya PDF kimi saxla.</div>
      <div class="row" style="margin-top:12px"><button class="btn primary" data-act="sum" data-ch="all">${icon('print')}Bütün vərəqlər (${MAIN.length})</button></div>
      <div class="qgrid sum-grid">${MAIN.map(c => `<button class="qcell" data-act="sum" data-ch="${c.id}" title="${esc(chLabel(c))}"><span class="id">Fəsil ${pad2(c.num)}</span><span class="t">${esc(c.title)}</span></button>`).join('')}</div></div></section>
  <section class="block"><div class="block-h"><h2>Hazır checklist-lər</h2></div>
    <button class="chrow card" style="border-radius:14px" data-act="open-ch" data-ch="gb"><span class="id">B</span><span class="tt"><b>Şablonlar və checklist-lər</b><span class="muted" style="font-size:13px">Login, qeydiyyat, axtarış, fayl, ödəniş, mobil, API</span></span><span class="side">${icon('arrow')}</span></button></section>`;
}
function boxesHTML() {
  const cs = Store.doc('cards').c;
  const cnt = [0, 0, 0, 0, 0, 0];
  GLOSS.forEach(g => { const e = cs[g.id]; cnt[e ? clamp(e[0], 1, 5) : 0]++; });
  const names = ['yeni', '1', '2', '3', '4', '5'];
  return `<div class="boxes" aria-label="Kart qutuları">${cnt.map((n, i) => `<div><b>${n}</b><span>${i === 0 ? 'yeni' : 'qutu ' + names[i]}</span></div>`).join('')}</div>`;
}

/* ---------- quiz ---------- */
function startQuiz(num, onlyWrong) {
  let qs = QUIZ[num] || [];
  if (onlyWrong) { const w = (P().quiz[num] || {}).wrong || []; qs = qs.filter(q => w.includes(q.id)); if (!qs.length) qs = QUIZ[num]; }
  S.quiz = { num, onlyWrong: !!onlyWrong, items: qs.map(q => ({ q, perm: shuffle([0, 1, 2, 3]), pick: null })), i: 0, done: false };
}
function vQuiz(v) {
  const Z = S.quiz;
  if (!Z) { goTab('practice'); return; }
  const c = MAIN.find(x => x.num === Z.num);
  setHeader({ back: true, kicker: `Fəsil ${pad2(Z.num)} · test`, name: c.title });
  if (Z.done) { v.innerHTML = quizResultHTML(Z, c); return; }
  const it = Z.items[Z.i], q = it.q;
  const dots = Z.items.map((x, k) => `<i class="${k === Z.i ? 'cur' : x.pick == null ? '' : (x.pick === x.q.a ? 'ok' : 'no')}"></i>`).join('');
  const L = 'ABCD';
  const opts = it.perm.map((oi, k) => {
    let cls = '';
    if (it.pick != null) { if (oi === q.a) cls = ' right'; else if (oi === it.pick) cls = ' wrong'; }
    return `<button class="opt${cls}" data-act="qz-pick" data-o="${oi}"${it.pick != null ? ' disabled' : ''}><span class="l">${L[k]}</span><span>${esc(q.o[oi])}</span></button>`;
  }).join('');
  let ex = '';
  if (it.pick != null) {
    const ok = it.pick === q.a; const s = secById[q.sec];
    ex = `<div class="qz-ex"><div class="verdict ${ok ? 'ok' : 'no'}">${icon(ok ? 'check' : 'x')}${ok ? 'Düzdür' : 'Səhvdir'}</div><p>${esc(q.e)}</p>
      <div class="qz-act">${s ? `<button class="btn sm ghost" data-act="goto-sec" data-sec="${s.id}">${icon('book')}${esc(s.num || 'Bölmə')}-ə bax</button>` : ''}
      <button class="btn sm ghost ai-only" data-act="qz-ask">${icon('spark')}Claude izah etsin</button></div></div>
      <div class="qz-act" style="justify-content:flex-end"><button class="btn primary" data-act="qz-next">${Z.i + 1 < Z.items.length ? 'Növbəti sual' : 'Nəticəyə bax'}${icon('arrow')}</button></div>`;
  }
  v.innerHTML = `<div class="qz-top"><div class="qz-dots">${dots}</div><span class="kicker">${Z.i + 1}/${Z.items.length}</span></div>
    <div class="qz-q">${esc(q.q)}</div><div class="opts">${opts}</div>${ex}`;
}
function quizResultHTML(Z, c) {
  const n = Z.items.length, ok = Z.items.filter(x => x.pick === x.q.a).length;
  const wrong = Z.items.filter(x => x.pick !== x.q.a);
  const rec = P().quiz[Z.num];
  const list = wrong.map(x => { const s = secById[x.q.sec]; return `<div class="res-item"><span class="chip fail">${icon('x')}</span><div><div>${esc(x.q.q)}</div>${s ? `<button data-act="goto-sec" data-sec="${s.id}">${esc(secLabel(s))} →</button>` : ''}</div></div>`; }).join('');
  return `<div class="result card"><div class="kicker">Test run nəticəsi</div>
    <div class="big">${ok}<span class="muted" style="font-size:28px">/${n}</span></div>
    <div class="row" style="justify-content:center;margin-top:6px"><span class="chip pass">${icon('check')}${ok} keçdi</span><span class="chip ${wrong.length ? 'fail' : ''}">${wrong.length} düşdü</span>${rec ? `<span class="chip">ən yaxşı ${rec.best}/${rec.n}</span>` : ''}</div>
    <p class="muted" style="margin:12px 0 0">${ok === n ? 'Əla! Bütün suallar düzgündür.' : ok / n >= .7 ? 'Yaxşı nəticədir. Səhv olan mövzulara bir də bax.' : 'Bu fəsli bir də oxumağa dəyər — səhv olan bölmələrdən başla.'}</p></div>
    ${wrong.length ? `<button class="quizcta ai-only" style="margin-top:14px" data-act="qz-explain">${icon('spark')}<div style="flex:1;min-width:0;text-align:left"><b>Səhvlərimi izah et</b><span>Claude səhvlərini səbəblərə görə qruplaşdırır, izah edir və 2 yeni sualla yoxlayır</span></div>${icon('arrow')}</button>` : ''}
    ${wrong.length ? `<div class="block"><div class="block-h"><h2>Təkrar oxu</h2></div><div class="res-list">${list}</div></div>` : ''}
    <div class="qz-act" style="margin-top:18px">${wrong.length ? `<button class="btn primary" data-act="qz-wrong" data-ch="${Z.num}">${icon('refresh')}Yalnız səhvləri təkrarla</button>` : ''}
    <button class="btn" data-act="quiz" data-ch="${Z.num}">${icon('refresh')}Yenidən başla</button>
    <button class="btn ghost" data-act="open-ch" data-ch="c${Z.num}">${icon('book')}Fəslə qayıt</button></div>`;
}
function finishQuiz() {
  const Z = S.quiz; Z.done = true;
  const n = QUIZ[Z.num].length;
  const ok = Z.items.filter(x => x.pick === x.q.a).length;
  const p = P(); const prev = p.quiz[Z.num];
  let wrong = Z.items.filter(x => x.pick !== x.q.a).map(x => x.q.id);
  if (Z.onlyWrong && prev) {
    const fixed = Z.items.filter(x => x.pick === x.q.a).map(x => x.q.id);
    wrong = (prev.wrong || []).filter(id => !fixed.includes(id)).concat(wrong.filter(id => !(prev.wrong || []).includes(id)));
    p.quiz[Z.num] = Object.assign({}, prev, { wrong, at: Date.now(), best: Math.max(prev.best, n - wrong.length), last: n - wrong.length, n });
  } else {
    p.quiz[Z.num] = { best: Math.max(prev ? prev.best : 0, ok), last: ok, n, at: Date.now(), wrong };
  }
  Store.changed('progress');
}

/* ---------- flashcards ---------- */
const INTERVAL = [0, 1, 2, 4, 8, 16];
function startCards() {
  const cs = Store.doc('cards').c, t = today();
  const due = shuffle(GLOSS.filter(g => cs[g.id] && cs[g.id][1] <= t));
  const fresh = GLOSS.filter(g => !cs[g.id]).slice(0, 10);
  const queue = due.concat(fresh).slice(0, 20).map(g => g.id);
  S.cards = { queue, i: 0, flip: false, again: {}, know: 0, miss: 0 };
}
function vCards(v) {
  setHeader({ back: true, kicker: 'Fleş kartlar', name: PREF().dir === 'az' ? 'Azərbaycanca → ingiliscə' : 'İngiliscə → azərbaycanca', right: [{ act: 'cards-dir', icon: 'refresh', label: 'İstiqaməti dəyiş' }] });
  const K = S.cards;
  if (!K || !K.queue.length) {
    v.innerHTML = `<div class="empty"><div style="font-weight:600;color:var(--ink);font-size:16px">Bu gün üçün kart qalmayıb</div><p style="margin:6px 0 12px">Sabah təkrar vaxtı çatan kartlar burada görünəcək.</p><button class="btn" data-act="glossary">${icon('abc')}Lüğətə bax</button></div>${boxesHTML()}`;
    return;
  }
  if (K.i >= K.queue.length) {
    v.innerHTML = `<div class="result card"><div class="kicker">Sessiya bitdi</div><div class="big">${K.know}<span class="muted" style="font-size:28px">/${K.know + K.miss}</span></div>
      <p class="muted">Bildiyin kartlar növbəti qutuya keçdi, bilmədiklərin sabah yenidən çıxacaq.</p>${boxesHTML()}
      <div class="qz-act" style="justify-content:center;margin-top:16px"><button class="btn primary" data-act="cards">${icon('refresh')}Yeni sessiya</button><button class="btn ghost" data-act="tab" data-tab="practice">Məşqə qayıt</button></div></div>`;
    return;
  }
  const g = glById[K.queue[K.i]];
  const az = PREF().dir === 'az';
  const front = az ? `<div class="kicker">Azərbaycanca</div><div class="term">${esc(g.az)}</div><div class="sub">${esc(g.def)}</div>` : `<div class="kicker">İngiliscə termin</div><div class="term">${esc(g.en)}</div><div class="sub">Fəsil ${g.ch.join(', ')}</div>`;
  const backS = az ? `<div class="kicker">İngiliscə</div><div class="term">${esc(g.en)}</div><div class="sub">${esc(g.az)} · Fəsil ${g.ch.join(', ')}</div>` : `<div class="kicker">Azərbaycanca</div><div class="term">${esc(g.az)}</div><div class="def">${esc(g.def)}</div><div class="sub mono" style="font-size:13px">${esc(g.en)} · Fəsil ${g.ch.join(', ')}</div>`;
  v.innerHTML = `<div class="qz-top"><div class="qz-dots">${K.queue.map((x, k) => `<i class="${k === K.i ? 'cur' : k < K.i ? 'ok' : ''}"></i>`).join('')}</div><span class="kicker">${K.i + 1}/${K.queue.length}</span></div>
    <div class="fc-wrap"><div class="fc${K.flip ? ' flip' : ''}" data-act="card-flip" role="button" tabindex="0" aria-label="Kartı çevir">
      <div class="fc-face fc-front">${front}<div class="hintline">Toxun — cavabı gör</div></div>
      <div class="fc-face fc-back">${backS}</div></div></div>
    <div id="fcbtns">${cardBtns(g)}</div>`;
}
function cardBtns(g) {
  if (!S.cards.flip) return `<div class="fc-btns"><button class="btn primary" style="grid-column:1/-1" data-act="card-flip">Cavabı göstər</button></div>`;
  return `${sayHTML(g)}<div class="fc-btns"><button class="btn no" data-act="card-no">${icon('x')}Bilmirdim</button><button class="btn yes" data-act="card-yes">${icon('check')}Bilirdim</button></div>
    <div class="row" style="justify-content:center;margin-top:10px"><button class="btn sm ghost ai-only" data-act="ai-term" data-g="${g.id}">${icon('spark')}Claude ilə izah</button>${g.ch[0] ? `<button class="btn sm ghost" data-act="open-ch" data-ch="c${g.ch[0]}">${icon('book')}Fəsil ${g.ch[0]}</button>` : ''}</div>`;
}
function cardAnswer(know) {
  const K = S.cards; const id = K.queue[K.i];
  const cs = Store.doc('cards').c; const t = today();
  const e = cs[id] || [0, t];
  if (know) { const b = clamp((e[0] || 0) + 1, 1, 5); cs[id] = [b, t + INTERVAL[b]]; K.know++; }
  else { cs[id] = [1, t + 1]; K.miss++; if (!K.again[id]) { K.again[id] = 1; K.queue.push(id); } }
  Store.changed('cards');
  K.i++; K.flip = false; render({ keepScroll: false });
}

/* ---------- glossary ---------- */
function vGlossary(v) {
  setHeader({ back: S.stack.length > 0, kicker: 'Əlavə A', name: 'Terminlər lüğəti', right: [{ act: 'cards', icon: 'cards', label: 'Fleş kartlar' }] });
  v.innerHTML = `<div class="searchbox">${icon('search')}<input type="search" id="glq" placeholder="Termin axtar: regression, sərhəd…" value="${esc(S.glq)}" autocomplete="off"></div>
    <p class="muted" style="font-size:13.5px;margin:10px 2px 4px" id="glcount"></p><div class="card" style="padding:4px 16px" id="gllist"></div>`;
  drawGlossary();
}
function drawGlossary() {
  const q = fold(S.glq.trim());
  const list = GLOSS.filter(g => !q || fold(g.en + ' ' + g.az + ' ' + g.def).includes(q));
  $('#glcount').textContent = q ? `${list.length} nəticə` : `${GLOSS.length} termin, ingiliscə əlifba sırası ilə`;
  $('#gllist').innerHTML = list.length ? list.map(g => `<div class="gl-item"><div class="en">${esc(g.en)}</div><div class="az">${esc(g.az)}</div><div class="df">${esc(g.def)}</div>
    ${g.say ? `<details class="say-d" data-open="say:${g.id}"${OPEN['say:' + g.id] ? ' open' : ''}><summary>${icon('chat')}Müsahibədə belə de</summary><p>${esc(g.say)}</p></details>` : ''}
    <div class="row">${g.ch.map(n => `<button class="chip" data-act="open-ch" data-ch="c${n}">Fəsil ${n}</button>`).join('')}<button class="chip acc ai-only" data-act="ai-term" data-g="${g.id}">${icon('spark')}Claude ilə izah</button></div></div>`).join('')
    : `<div class="empty" style="border:0">Heç nə tapılmadı.</div>`;
}

/* ---------- tutor ---------- */
const tutorOffHTML = () => `<div class="empty"><div style="font-weight:600;color:var(--ink);font-size:16px">Claude bu görünüşdə əlçatan deyil</div><p style="margin:6px 0 0">Kitabın özü, testlər və kartlar AI olmadan da tam işləyir. Claude-u açmaq üçün səhifəni claude.ai-də öz hesabınla aç və icazə ver.</p></div>`;
// offline app: what to do when Claude cannot answer right now
function pwaNotice() {
  if (!PWA) return '';
  const st = PWA.status();
  if (st === 'offline') return `<div class="card pwa-note"><div class="kicker"><span lang="en">Offline</span> rejim</div><p>İnternet yoxdur — Claude internet qayıdanda işləyəcək. Kitab, testlər, kartlar və qeydlər indi də işləyir.</p></div>`;
  if (st === 'no_key') return `<div class="card pwa-note"><div class="kicker">Claude — claude.ai-da</div><p>Müəllim və rol oyunları claude.ai versiyasında açılır: Claude orada öz claude.ai hesabınla işləyir, API açarı lazım deyil. Sualını göndərəndə də ora keçəcəksən.</p>
    <div class="row"><a class="btn sm primary" href="${esc(PWA.artifactLink(artHash()))}" target="_blank" rel="noopener">claude.ai-da aç${icon('ext')}</a><button class="btn sm ghost" data-act="claude-setup">${icon('key')}Öz API açarım var</button></div></div>`;
  return '';
}
const modeSwitch = () => `<div class="seg tmode" role="group" aria-label="Rejim"><button data-act="tutor-mode" data-v="chat" aria-pressed="${S.tutorMode !== 'rp'}">${icon('chat')}Söhbət</button><button data-act="tutor-mode" data-v="rp" aria-pressed="${S.tutorMode === 'rp'}">${icon('users')}Rol oyunu</button></div>`;
function vTutor(v) {
  if (S.tutorMode === 'rp') { vRoleplay(v); return; }
  setHeader({ kicker: 'Müəllim', name: 'Claude ilə söhbət', right: [{ act: 'tutor-clear', icon: 'trash', label: 'Söhbəti təmizlə' }, { act: 'settings', icon: 'sliders', label: 'Ayarlar' }] });
  const chat = Store.doc('chat');
  const lr = P().last;
  if (!chat.turns.length && lr && chById[lr.ch] && (chById[lr.ch].kind === 'chapter' || lr.ch === 'c0')) chat.ctx = lr.ch;
  if (AI.state === 'off') { v.innerHTML = tutorOffHTML(); return; }
  const opts = CHAPTERS.filter(c => c.kind === 'chapter' || c.id === 'c0').map(c => `<option value="${c.id}"${chat.ctx === c.id ? ' selected' : ''}>${esc(c.num ? 'Fəsil ' + c.num + ' — ' + c.title : c.fullTitle)}</option>`).join('') + `<option value="none"${chat.ctx === 'none' ? ' selected' : ''}>Ümumi sual (fəsilsiz)</option>`;
  const quick = ['Bu fəsli 5 cümlədə xülasə et', 'Mənə 3 qısa sual ver', 'Bu mövzudan müsahibə sualı ver', 'Ən çətin anlayışı sadə izah et'];
  v.innerHTML = `<div class="tutor">${modeSwitch()}${pwaNotice()}
    <div class="ctxbar"><span class="kicker">Kontekst</span><select id="tctx" aria-label="Söhbətin konteksti">${opts}</select></div>
    <div class="msgs" id="msgs">${chat.turns.length ? chat.turns.map(msgHTML).join('') : `<div class="card"><div style="font-weight:600">Salam! Mən Claude-am — bu kitab üzrə müəllimin.</div><p class="muted" style="margin:6px 0 0;font-size:14.5px">Seçdiyin fəsil haqqında istənilən sualı ver: anlamadığın yer, misal, müsahibə hazırlığı. ${PWA ? (PWA.hasKey() ? 'Cavablar Ayarlar → Claude bölməsində seçdiyin modellə hazırlanır; ilk söz bir az gec gələ bilər.' : 'Sualını göndərəndə claude.ai versiyası açılır və Claude orada öz hesabınla cavab verir.') : 'Cavablar Opus 5.5 ilə maksimum düşünmə rejimində hazırlanır, ona görə ilk söz bir az gec gələ bilər.'}</p></div>`}</div>
    <div class="quick" id="quick">${quick.map(q => `<button class="qp" data-act="tutor-quick" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
    <div class="composer"><textarea id="tin" rows="1" placeholder="Sualını yaz…" aria-label="Sual"></textarea><button class="send" id="tsend" data-act="tutor-send" aria-label="Göndər">${icon('send')}</button></div>
    <div class="ai-note" id="tnote">${esc(AI.modelNote)}</div></div>`;
  const m = $('#msgs'); if (chat.turns.length) requestAnimationFrame(() => { window.scrollTo(0, document.documentElement.scrollHeight); });
  if (S.tutorBusy) {
    $('#tsend').classList.add('stop'); $('#tsend').innerHTML = icon('stop');
    m.insertAdjacentHTML('beforeend', `<div class="msg a" id="tlive"><div class="thinking"><i></i><span>Claude yazır…</span></div></div>`);
  }
  return m;
}
function msgHTML(t) {
  if (t.role === 'user') return `<div class="msg u">${esc(t.content)}</div>`;
  return `<div class="msg a"><div class="prose">${mdToHtml(t.content)}</div></div>`;
}
function tutorInput() {
  const chat = Store.doc('chat');
  const c = chById[chat.ctx];
  let head = RULES + '\n\nSən tələbənin şəxsi müəllimisən. ';
  if (c) head += `Söhbətin konteksti — ${chLabel(c)}.\nBölmələr: ${c.sections.map(secLabel).join('; ')}\n\n<fəsil_mətni>\n${chText(c, 16000)}\n</fəsil_mətni>\n\n`;
  else head += 'Söhbət ümumi QA mövzularındadır.\n\n';
  head += 'Tələbənin suallarına cavab ver. Cavablar yığcam olsun (adətən 80–250 söz); tələbə “ətraflı” istəsə, daha geniş yaz. Tələbə “mənə sual ver” desə, sual(lar) ver və cavabını gözlə, sonra qiymətləndir.';
  let turns = chat.turns.slice(-24).map(t => ({ role: t.role, content: String(t.content).slice(0, 6000) }));
  while (turns.length && turns[0].role !== 'user') turns.shift();
  return [{ role: 'user', content: head }].concat(turns);
}
async function tutorSend(text) {
  text = (text || '').trim();
  if (!text || S.tutorBusy) return;
  if (claudeGate(() => tutorSend(text), { hash: 'muellim', copy: text, copyKind: 'question' })) { const t = $('#tin'); if (t && !t.value) { t.value = text; autoGrow(t); } return; }
  const chat = Store.doc('chat');
  chat.turns.push({ role: 'user', content: text });
  if (chat.turns.length > 40) chat.turns = chat.turns.slice(-40);
  Store.changed('chat');
  const box = $('#msgs');
  if (box) {
    if (chat.turns.length === 1) box.innerHTML = '';
    box.insertAdjacentHTML('beforeend', msgHTML({ role: 'user', content: text }));
    box.insertAdjacentHTML('beforeend', `<div class="msg a" id="tlive"><div class="thinking"><i></i><span>Claude düşünür… <b data-sec-count>0</b> s</span></div></div>`);
    window.scrollTo(0, document.documentElement.scrollHeight);
  }
  const ctl = new AbortController();
  S.tutorBusy = ctl;
  const sendBtn = $('#tsend'); if (sendBtn) { sendBtn.classList.add('stop'); sendBtn.innerHTML = icon('stop'); }
  const timer = startCounter(() => $('#tlive [data-sec-count]'));
  let raf = 0, last = '';
  const paint = () => { raf = 0; const el = $('#tlive'); if (el) el.innerHTML = `<div class="prose">${mdToHtml(last)}</div>`; };
  try {
    const res = await AI.call(tutorInput(), { cache: false, signal: ctl.signal, onText: ({ text }) => { last = text; if (!raf) raf = requestAnimationFrame(paint); } });
    last = res.text; paint();
    chat.turns.push({ role: 'assistant', content: res.text });
    Store.changed('chat');
    if (res.truncated) toast('Cavab uzun olduğu üçün qısaldıldı.');
  } catch (e) {
    const el = $('#tlive');
    const partial = e && e.text;
    if (partial && e.code !== 'refused') { chat.turns.push({ role: 'assistant', content: partial + (e.code === 'cancelled' ? '\n\n_(dayandırıldı)_' : '') }); Store.changed('chat'); }
    if (el) el.innerHTML = (partial && e.code !== 'refused' ? `<div class="prose">${mdToHtml(partial)}</div>` : '') + (e && e.code === 'cancelled' ? '<div class="ai-note">Dayandırıldı.</div>' : aiErrHTML(e));
    if (!partial && chat.turns.length && chat.turns[chat.turns.length - 1].role === 'user' && e.code !== 'cancelled') { /* keep the question so the viewer can resend */ }
  } finally {
    clearInterval(timer);
    S.tutorBusy = null;
    const el = $('#tlive'); if (el) el.removeAttribute('id');
    const b = $('#tsend'); if (b) { b.classList.remove('stop'); b.innerHTML = icon('send'); }
    const note = $('#tnote'); if (note) note.textContent = AI.modelNote;
  }
}
function startCounter(getEl) {
  const t0 = Date.now();
  return setInterval(() => { const el = getEl(); if (el) el.textContent = Math.round((Date.now() - t0) / 1000); }, 1000);
}

/* ---------- role-play ---------- */
const RP_LINKS = { 10: 'po-promo', 12: 'dev-works', 17: 'dev-call' };
const RP = [
  { id: 'po-promo', who: 'Product Owner', name: 'Lalə', title: 'Promo kod tələbini aydınlaşdır',
    brief: 'Sprint planlamasından əvvəl Product Owner yeni funksiyanı qısaca izah edir: “İstifadəçi səbətdə promo kod tətbiq edə bilər.” Tələb sənədi yoxdur — detallar yalnız onun başındadır.',
    goal: 'Suallarla ən azı 5 qeyri-müəyyənliyi üzə çıxar və söhbətin sonunda 3–5 qəbul meyarını PO ilə razılaşdır.',
    crit: ['qeyri-müəyyənlikləri tapmaq', 'konkret və açıq suallar', 'sərhəd və neqativ hallar', 'nəticəni AC şəklində yekunlaşdırmaq'],
    persona: 'Sən Lalə adlı Product Owner-sən, onlayn mağaza komandasında işləyirsən. Səmimisən, amma məşğulsan və uzun izah sevmirsən. Tələb: “İstifadəçi səbətdə promo kod tətbiq edə bilər.” Bundan artıq məlumatı yalnız konkret sual veriləndə və yalnız soruşulan hissə barədə qısa de. Gizli detallar (soruşulmasa, özün demə): endirim ya 10%, ya da sabit 5 AZN olur; bir sifarişdə yalnız bir kod işləyir; minimum səbət məbləği 30 AZN-dir; kodun bitmə tarixi var; böyük-kiçik hərf fərq etmir; hər istifadəçi eyni kodu yalnız bir dəfə işlədə bilər; kod silinəndə məbləğ əvvəlki halına qayıdır. Xəta mesajlarının mətnini hələ düşünməmisən — soruşulsa, “yaxşı sualdır, dizaynerlə dəqiqləşdirək” de. Çox ümumi sual gəlsə (“hər şeyi danış”), konkretləşdirməyi xahiş et. Söhbətin ortasında bir dəfə “bunu sabaha qədər bitirə bilərik?” deyə tələsdir.' },
  { id: 'po-avatar', who: 'Product Owner', name: 'Lalə', title: 'Profil şəkli yükləmə',
    brief: 'Yeni funksiya: istifadəçi profilinə şəkil yükləyə bilər. Product Owner dizayn maketini göstərib, amma texniki məhdudiyyətlər heç yerdə yazılmayıb.',
    goal: 'Format, ölçü, səhv halları, mobil ssenarilər və riskləri soruşaraq test üçün lazım olan qaydaları aydınlaşdır.',
    crit: ['fayl məhdudiyyətləri', 'neqativ hallar', 'mobil ssenarilər və əlçatanlıq', 'risklərin qeyd edilməsi'],
    persona: 'Sən Lalə adlı Product Owner-sən. Funksiyanı vizual tərəfdən yaxşı bilirsən, texniki detallar barədə isə yalnız soruşulanda danışırsan. Gizli detallar: icazəli formatlar JPG və PNG-dir; maksimum ölçü 5 MB; minimum 200×200 piksel; yükləmədən sonra kvadrat kəsmə (crop) pəncərəsi açılır; yeni şəkil köhnəni əvəz edir, köhnə şəkil saxlanmır; mobil tətbiqdə kamera ilə çəkmək mümkündür; şəkil silinəndə adın baş hərfləri göstərilir. Uyğunsuz məzmunun yoxlanması hələ planlaşdırılmayıb — tester bu riski soruşsa, “yaxşı fikirdir, backlog-a əlavə edək” de. GIF və HEIC barədə soruşulsa, “bilmirəm, proqramçılardan soruşaq” de.' },
  { id: 'po-forgot', who: 'Product Owner', name: 'Lalə', title: '“Şifrəni unutdum” axını',
    brief: 'Komanda “Şifrəni unutdum” funksiyasını yenidən yazır. Product Owner axını belə təsvir edir: email yazırsan → link gəlir → yeni şifrə qoyursan.',
    goal: 'Axının bütün addımlarını, təhlükəsizlik qaydalarını və səhv hallarını aydınlaşdır; ən vacib 3 riski adlandır.',
    crit: ['axının tamlığı', 'təhlükəsizlik sualları', 'səhv halları', 'risklərin prioriteti'],
    persona: 'Sən Lalə adlı Product Owner-sən. Gizli detallar (yalnız soruşulanda de): link email-ə göndərilir və 30 dəqiqə etibarlıdır; link yalnız bir dəfə işləyir; yeni şifrə əvvəlki ilə eyni ola bilməz; mövcud olmayan email yazılsa da eyni mesaj göstərilir (“Email mövcuddursa, link göndərildi”) — bu, təhlükəsizlik üçündür; bir email üçün saatda ən çox 3 sorğu göndərmək olar; şifrə dəyişəndə bütün cihazlardakı sessiyalar bağlanır; şifrə qaydaları qeydiyyatdakı kimidir (8–20 simvol, ən azı bir rəqəm).' },
  { id: 'dev-works', who: 'Proqramçı', name: 'Elvin', title: '“Məndə işləyir”',
    brief: 'Baq tapmısan: email böyük hərflərlə yazılanda (Aysel@Example.com) giriş alınmır və “Email və ya şifrə yanlışdır” mesajı çıxır. Proqramçı Elvin report-u “Cannot reproduce — məndə işləyir” ilə bağlamaq istəyir.',
    goal: 'Sakit və faktlarla baqın real olduğunu göstər, təkrarlama şərtini birlikdə dəqiqləşdir və report-un yenidən açılmasına razılıq al.',
    crit: ['faktlar və sübut', 'təkrarlama şərtinin dəqiqliyi', 'peşəkar ton', 'razılaşdırılmış növbəti addım'],
    persona: 'Sən Elvin adlı backend proqramçısan; təcrübəlisən, yorğunsan, sprintin son günüdür. İlk reaksiyan: “Məndə işləyir, yəqin sən nəsə səhv yazmısan.” Özün testi kiçik hərfli email ilə etmisən və bunun fərqində deyilsən. Tester konkret addımları, test datasını (böyük hərfli email), mühiti və sübutu (video, Network cavabı) göstərdikcə tədricən razılaş. Tester “email-i necə yazmısan?” kimi dəqiqləşdirici sual versə, “kiçik hərflə” de və problemi anla. Tester emosional, ittihamçı və ya qeyri-dəqiq danışarsa, müdafiəyə keç və “sübut göstər” de. Razılaşanda düzəlişin harada olacağını qısa de (email-i müqayisədən əvvəl kiçik hərfə çevirmək).' },
  { id: 'dev-penny', who: 'Proqramçı', name: 'Elvin', title: '“1 qəpik nədir ki?”',
    brief: 'Xidmət haqqı hesablananda bəzi məbləğlər 1 qəpik az çıxır: 45,50 AZN-lik sifariş üçün 47,78 əvəzinə 47,77 AZN göstərilir. Proqramçı bunu “kosmetik” sayır və Low/Low vermək istəyir.',
    goal: 'Biznes riskini (həcm, hesabatlar, ödəniş sistemi ilə uyğunsuzluq, etibar) izah et, severity və priority-ni əsaslandır, düzəliş üçün razılıq al.',
    crit: ['riskin biznes dilində izahı', 'severity və priority əsaslandırması', 'texniki səbəbə işarə', 'konstruktiv nəticə'],
    persona: 'Sən Elvin adlı proqramçısan. Fikrin: “1 qəpikdir, heç kim fərq etməz, başqa vacib işlər var.” Hesablamanı kəsr ədədlərlə (float) aparırsan. Tester konkret riskləri — gündə minlərlə sifariş, maliyyə hesabatlarında uyğunsuzluq, ödəniş provayderi ilə məbləğ fərqi, müştəri şikayəti — izah etsə, razılaş. Tester səbəbi (kəsr ədəd, yuvarlaqlaşdırma) düzgün göstərsə, düzəlişi (məbləği qəpiklə tam ədəd kimi saxlamaq və ya düzgün yuvarlaqlaşdırma) qəbul et. Sadəcə “bu, səhvdir” deyilsə, razı olma.' },
  { id: 'dev-call', who: 'Proqramçı', name: 'Nihad', title: '“Cannot reproduce” — zəng zamanı',
    brief: 'Mobil tətbiqdə ödəniş ekranında zəng gələndə, zəngdən sonra səbət boş görünür (10 cəhddən 3-də). Proqramçı Nihad emulyatorda yoxlayıb və baqı təkrarlaya bilməyib.',
    goal: 'Təkrarlama şərtlərini (real cihaz, zəngin müddəti, cihaz modeli), tezliyi və sübutları izah et; birlikdə yoxlama planı qur.',
    crit: ['şərtlərin dəqiqliyi', 'tezlik və sübut', 'emulyator ilə real cihaz fərqi', 'birgə plan'],
    persona: 'Sən Nihad adlı mobil proqramçısan. Emulyatorda zəngi simulyasiya etmisən və problem görməmisən. Gizli səbəb: cihazın yaddaşı az olanda sistem fondakı tətbiqi bağlayır, səbət isə yalnız yaddaşda saxlanır (diskə yazılmır); bu, köhnə real cihazda 1 dəqiqədən uzun zəngdən sonra baş verir. Tester real cihaz, zəngin müddəti, cihaz modeli, tezlik, video və ya “Don\'t keep activities” ayarı kimi faktlar gətirdikcə maraqlan və birlikdə plan qur. Ümumi sözlərə (“bəzən olur”) şübhə ilə yanaş.' },
  { id: 'lead-release', who: 'Komanda rəhbəri', name: 'Rəşad', title: 'Relizdə 3 açıq Major',
    brief: 'Sabah səhər reliz var. 3 açıq Major baq qalıb: (1) Safari-də kataloq filtri işləmir; (2) PDF qəbz bəzən boş yüklənir; (3) “Şifrəni unutdum” email-i 10 dəqiqəyə qədər gecikir. Komanda rəhbəri Rəşad relizi təxirə salmaq istəmir.',
    goal: 'Hər baqın təsirini və riskini qısa izah et, variantlar təklif et (workaround, feature flag, hotfix planı, release notes) və qərarın yazılı qeydə alınmasına nail ol.',
    crit: ['risklərin qısa və aydın izahı', 'variantlar təklif etmək', 'prioritetləşdirmə', 'qərarın sənədləşdirilməsi'],
    persona: 'Sən Rəşad adlı komanda rəhbərisən. Biznes relizi gözləyir, marketinq kampaniyası sabah başlayır. Mövqeyin: “Major-dur, Critical deyil — buraxırıq.” Tester hər baqın konkret təsirini (neçə istifadəçi, hansı axın, pul və etibar riski) izah edib real variantlar təklif etsə, kompromisə gəl: məsələn, Safari istifadəçilərinin payı yüksəkdirsə, filtr üçün hotfix planı istə; PDF qəbz üçün workaround-u (qəbzin email ilə göndərilməsi) qəbul et. Tester sadəcə “relizi saxlayaq” desə, razı olma. Sonda qərarı yazılı qeyd etməyə (release notes və Jira-da şərh) razılaş.' }
];
const RP_WHO = ['Product Owner', 'Proqramçı', 'Komanda rəhbəri'];
const rpRec = id => { const d = Store.doc('roleplay'); return d.s[id] || (d.s[id] = { turns: [] }); };
function rpHeader(r) {
  return `Bu, QA tələbəsi üçün rol oyunudur. Sən aşağıdakı personajsan və tələbə (tester) ilə real iş söhbəti aparırsan.
<personaj>
${r.persona}
</personaj>
<vəziyyət>
${r.brief}
</vəziyyət>
Tələbənin məqsədi (bunu tələbəyə demə, sadəcə ona uyğun reaksiya ver): ${r.goal}
Qaydalar:
- Personajdan çıxma. Azərbaycan dilində, danışıq üslubunda, qısa yaz: adətən 2–5 cümlə — real həmkar kimi.
- Tələbənin işini asanlaşdırma: real müqavimət göstər, amma ədalətli ol; konkret fakta və yaxşı arqumentə razılaş.
- Dərs keçmə, məsləhət vermə və qiymət vermə — rəy sonda ayrıca istəniləcək.
- Başlıq, siyahı və digər formatlamadan istifadə etmə — adi söhbət mətni yaz.`;
}
function rpMsgHTML(t) {
  if (t.role === 'user') return `<div class="msg u">${esc(t.content)}</div>`;
  return `<div class="msg a"><div class="prose">${mdToHtml(t.content)}</div></div>`;
}
function vRoleplay(v) {
  const r = S.rp && RP.find(x => x.id === S.rp);
  setHeader({ kicker: 'Müəllim · rol oyunu', name: r ? r.title : 'Real iş söhbətləri', right: [{ act: 'settings', icon: 'sliders', label: 'Ayarlar' }] });
  if (AI.state === 'off') { v.innerHTML = tutorOffHTML(); return; }
  if (!r) {
    const D = Store.doc('roleplay').s;
    v.innerHTML = `<div class="tutor">${modeSwitch()}${pwaNotice()}
      <p class="muted" style="margin:0;font-size:14.5px">Claude real həmkarın rolunu oynayır: Product Owner, proqramçı və ya komanda rəhbəri. Söhbəti sən aparırsan; bitirəndə Claude rolundan çıxır və meyarlar üzrə rəy verir.</p>
      ${RP_WHO.map(w => `<section><div class="block-h"><h2>${esc(w)}</h2></div><div class="rplist">${RP.filter(x => x.who === w).map(x => {
        const rec = D[x.id];
        const st = rec && rec.g ? gradeChip(rec.g) : (rec && rec.turns && rec.turns.length ? '<span class="chip acc">davam edir</span>' : '');
        return `<button class="rpcard" data-act="rp-open" data-rp="${x.id}"><span class="av">${esc(x.name[0])}</span><span class="t"><b>${esc(x.title)}</b><span>${esc(x.brief.split('. ')[0].slice(0, 120))}…</span></span><span class="side">${st}${icon('arrow')}</span></button>`;
      }).join('')}</div></section>`).join('')}</div>`;
    return;
  }
  const rec = rpRec(r.id);
  const started = rec.turns.length > 0;
  const finished = !!rec.fb;
  const fbBlock = finished ? `<div class="fb rpfb"><div class="fb-h">${gradeChip(rec.g)}<span>Claude rəyi</span></div><div class="prose">${mdToHtml(rec.fb)}</div></div>` : '';
  v.innerHTML = `<div class="tutor">${modeSwitch()}
    <div><button class="btn sm ghost" data-act="rp-list">${icon('back')}Ssenarilər</button></div>${pwaNotice()}
    <div class="card rpbrief"><div class="kicker">${esc(r.who)} · ${esc(r.name)}</div><h2 class="h2" style="margin-top:4px">${esc(r.title)}</h2>
      <p>${esc(r.brief)}</p><div class="goal"><b>Məqsədin:</b> ${esc(r.goal)}</div><div class="crit">Rəy meyarları: ${esc(r.crit.join(' · '))}</div></div>
    <div class="msgs" id="rpm">${rec.turns.map(rpMsgHTML).join('')}${fbBlock}</div>
    ${!started && !S.rpBusy ? `<button class="btn primary" data-act="rp-start">${icon('play')}Başla — ${esc(r.name)} ilk danışacaq</button>` : ''}
    ${started && !finished ? `<div class="composer"><textarea id="rpin" rows="1" placeholder="${esc(r.name)}-ə cavab yaz…" aria-label="Cavabın"></textarea><button class="send" id="rpsend" data-act="rp-send" aria-label="Göndər">${icon('send')}</button></div>` : ''}
    ${started ? `<div class="row">${!finished ? `<button class="btn sm" data-act="rp-finish"${rec.turns.filter(t => t.role === 'user').length < 2 ? ' disabled' : ''}>${icon('check')}Bitir və rəy al</button>` : ''}<button class="btn sm ghost" data-act="rp-reset">${icon('refresh')}Yenidən başla</button></div>` : ''}
    <div class="ai-note" id="rpnote">${started && !finished && rec.turns.filter(t => t.role === 'user').length < 2 ? 'Rəy almaq üçün ən azı 2 replika yaz.' : esc(AI.modelNote)}</div></div>`;
  if (S.rpBusy) {
    $('#rpm').insertAdjacentHTML('beforeend', `<div class="msg a" id="rplive"><div class="thinking"><i></i><span>${esc(r.name)} yazır…</span></div></div>`);
    const b = $('#rpsend'); if (b) { b.classList.add('stop'); b.innerHTML = icon('stop'); b.dataset.act = 'rp-stop'; }
  }
  if (started) requestAnimationFrame(() => { window.scrollTo(0, document.documentElement.scrollHeight); });
}
async function rpCall(kind, text) {
  const r = RP.find(x => x.id === S.rp); if (!r || S.rpBusy) return;
  if (claudeGate(() => rpCall(kind, text), { hash: 'rol', copy: kind === 'send' ? text || '' : '', copyKind: 'message' })) { const t = $('#rpin'); if (kind === 'send' && t && !t.value) { t.value = text || ''; autoGrow(t); } return; }
  const rec = rpRec(r.id);
  if (kind === 'send') {
    text = (text || '').trim(); if (!text) return;
    rec.turns.push({ role: 'user', content: text.slice(0, 4000) });
    Store.changed('roleplay');
  }
  const head = rpHeader(r);
  let input;
  if (kind === 'start') input = [{ role: 'user', content: head + '\n\nSöhbəti sən başla: vəziyyəti öz sözlərinlə 2–3 cümlədə təqdim et.' }];
  else {
    input = [{ role: 'user', content: head + '\n\nSöhbəti sən başladın.' }].concat(rec.turns.slice(-30).map(t => ({ role: t.role, content: t.content })));
    if (input.length > 1 && input[1].role === 'user') input.splice(1, 0, { role: 'assistant', content: '…' });
    if (kind === 'finish') input.push({ role: 'user', content: `[Rol oyunu bitdi.] İndi rolundan çıx və QA müəllimi kimi tələbənin (testerin) bu söhbətdəki çıxışını qiymətləndir.\n- Birinci sətir dəqiq bu formatda olsun: “QİYMƏT: Əla”, “QİYMƏT: Yaxşı” və ya “QİYMƏT: Yenidən cəhd et”.\n- Sonra bu bölmələr: **Yaxşı alınanlar** (konkret replikalara istinadla), **Yaxşılaşdırmaq olar** (konkret), **Daha güclü ifadə** (tələbənin deyə biləcəyi 2–3 nümunə cümlə), **Meyarlar** (hər biri üçün qısa qiymət: ${r.crit.join('; ')}).\nHəcm: 180–320 söz.` });
  }
  const ctl = new AbortController(); S.rpBusy = ctl;
  render({ keepScroll: true });
  const live = () => $('#rplive');
  let last = '', raf = 0;
  const paint = () => { raf = 0; const el = live(); if (!el) return; if (kind === 'finish') { const g = splitGrade(last); el.innerHTML = `<div class="fb-h">${gradeChip(g.grade)}<span>Claude rəyi</span></div><div class="prose">${mdToHtml(g.body)}</div>`; } else el.innerHTML = `<div class="prose">${mdToHtml(last)}</div>`; };
  try {
    const res = await AI.call(input, { cache: false, signal: ctl.signal, onText: ({ text }) => { last = text; if (!raf) raf = requestAnimationFrame(paint); } });
    if (kind === 'finish') { const g = splitGrade(res.text); rec.fb = g.body; rec.g = g.grade || 'Yaxşı'; rec.at = Date.now(); }
    else rec.turns.push({ role: 'assistant', content: res.text });
    if (rec.turns.length > 40) rec.turns = rec.turns.slice(-40);
    Store.changed('roleplay');
  } catch (e) {
    if (e && e.text && e.code !== 'refused' && kind !== 'finish') { rec.turns.push({ role: 'assistant', content: e.text }); Store.changed('roleplay'); }
    S.rpBusy = null; render({ keepScroll: true });
    const n = $('#rpnote'); if (n && (!e || e.code !== 'cancelled')) n.innerHTML = aiErrHTML(e);
    return;
  }
  S.rpBusy = null;
  if (S.view === 'tutor' && S.tutorMode === 'rp' && S.rp === r.id) render({ keepScroll: true });
}

/* ---------- progress ---------- */
function vProgress(v) {
  setHeader({ kicker: 'İrəliləyiş', name: 'Öyrənmə hesabatı', right: [{ act: 'settings', icon: 'sliders', label: 'Ayarlar' }] });
  const o = overall();
  const per = pct(o.done, o.total);
  const parts = BOOK.parts.filter(p => p.chapters.some(id => chById[id].kind === 'chapter')).map(p => {
    const ids = []; p.chapters.forEach(cid => chById[cid].sections.forEach(s => ids.push(s.id)));
    const d = ids.filter(id => P().learned[id]).length;
    const pl = partLabel(p);
    return `<div class="pb"><div class="t"><span>${esc(pl.pn + ' · ' + pl.name)}</span><span>${d}/${ids.length}</span></div><div class="meter${d === ids.length ? ' pass' : ''}"><i style="width:${pct(d, ids.length)}%"></i></div></div>`;
  }).join('');
  // weak topics from latest quiz attempts
  const weakMap = {};
  MAIN.forEach(c => { const q = P().quiz[c.num]; if (q && q.wrong) q.wrong.forEach(qid => { const item = (QUIZ[c.num] || []).find(x => x.id === qid); if (item && item.sec) weakMap[item.sec] = (weakMap[item.sec] || 0) + 1; }); });
  const weak = Object.keys(weakMap).sort((a, b) => weakMap[b] - weakMap[a]).slice(0, 12);
  const weakHTML = (weak.length ? `<div class="weak">${weak.map(sid => { const s = secById[sid], c = chById[secCh[sid]]; return `<button data-act="goto-sec" data-sec="${sid}"><span class="n">${esc(s.num || 'F' + c.num)}</span><span class="t">${esc(s.title)}<span class="muted" style="display:block;font-size:12.5px">Fəsil ${c.num} · testdə ${weakMap[sid]} səhv</span></span>${icon('arrow')}</button>`; }).join('')}</div>`
    : `<div class="empty">Fəsil testlərini həll etdikcə, səhv etdiyin mövzular burada görünəcək.</div>`) +
    (weak.length || o.retry ? `<button class="quizcta ai-only" style="margin-top:10px" data-act="weak-lesson">${icon('steps')}<div style="flex:1;min-width:0;text-align:left"><b>Zəif mövzular üzrə dərs</b><span>Claude test səhvlərinə${o.retry ? ` və “Yenidən cəhd et” alan ${o.retry} tapşırığa` : ''} görə fərdi təkrar dərsi qurur</span></div>${icon('arrow')}</button>` : '');
  const notes = [];
  CHAPTERS.forEach(c => { const n = notesDoc(c.id).n; c.sections.forEach(s => { if (n[s.id] && n[s.id].trim()) notes.push({ c, s, t: n[s.id] }); }); });
  const notesHTML = notes.length ? `<div class="notes-list">${notes.map(x => `<button data-act="goto-sec" data-sec="${x.s.id}"><div class="w">${esc(x.c.num ? 'Fəsil ' + x.c.num : x.c.title)} · ${esc(x.s.num || x.s.title)}</div><div class="x">${esc(x.t.slice(0, 400))}</div></button>`).join('')}</div>`
    : `<div class="empty">Hər bölmənin altındakı “Qeyd” düyməsi ilə öz qeydlərini yaz — hamısı burada toplanacaq.</div>`;
  v.innerHTML = `
  <div class="card"><div class="lb muted" style="font-size:13px">Öyrənilən bölmələr</div>
    <div class="herofig"><span class="v">${per}%</span><span class="u">${o.done} / ${o.total} bölmə</span></div>
    <div class="meter${per === 100 ? ' pass' : ''}" style="margin-top:12px;height:8px"><i style="width:${per}%"></i></div></div>
  <div class="tiles block" style="margin-top:12px">
    <div class="tile"><div class="lb">Fəsil testləri</div><div class="vl">${o.quizDone}<small> / 21</small></div><div class="muted" style="font-size:12.5px;margin-top:2px">orta nəticə ${o.avg}%</div></div>
    <div class="tile"><div class="lb">Tapşırıqlar</div><div class="vl">${o.answered}<small> / ${o.tasks}</small></div><div class="meter"><i style="width:${pct(o.answered, o.tasks)}%"></i></div><div class="muted" style="font-size:12px;margin-top:6px">${ALL_TASKS.length} fəsil tapşırığı + ${ALL_MINI.length} mini-nümunə</div></div>
    <div class="tile"><div class="lb">Mənimsənilən kartlar</div><div class="vl">${o.learnedCards}<small> / ${GLOSS.length}</small></div><div class="meter"><i style="width:${pct(o.learnedCards, GLOSS.length)}%"></i></div></div>
    <div class="tile"><div class="lb">Bu gün təkrar</div><div class="vl">${o.due}<small> kart</small></div><div class="muted" style="font-size:12.5px;margin-top:2px">${o.newCards} yeni kart</div></div>
  </div>
  <section class="block"><div class="block-h"><h2>Hissələr üzrə</h2></div><div class="card partbars">${parts}</div></section>
  <section class="block"><div class="block-h"><h2>Zəif mövzular</h2><span class="muted" style="font-size:13px">son test cəhdlərinə görə</span></div>${weakHTML}</section>
  <section class="block"><div class="block-h"><h2>Qeydlərim</h2><span class="muted" style="font-size:13px">${notes.length}</span></div>${notesHTML}</section>
  <section class="block"><div class="block-h"><h2>Məlumatlar</h2></div><div class="card">
    <div style="font-size:14.5px">${PWA ? 'İrəliləyiş, qeydlər və cavablar yalnız bu cihazda saxlanılır. Ehtiyat nüsxə üçün vaxtaşırı ixrac et — başqa cihazda “İdxal et” ilə bərpa olunur.' : Store.remote && !Store.readOnly ? 'İrəliləyişin hesabında saxlanılır və bütün cihazlarında görünür.' : 'İrəliləyiş hələlik yalnız bu brauzerdə saxlanılır.'}</div>
    <div class="row" style="margin-top:12px">${PWA ? `<button class="btn sm" data-act="data-export">${icon('download')}İxrac et</button><button class="btn sm" data-act="data-import">${icon('upload')}İdxal et</button>` : ''}<button class="btn sm" data-act="settings">${icon('sliders')}Ayarlar</button><button class="btn sm ghost" data-act="reset-ask">${icon('trash')}İrəliləyişi sıfırla</button></div></div></section>`;
}

/* =========================================================
   7. Sheets
   ========================================================= */
let sheetEl = null, sheetOnClose = null;
function openSheet(html, cls, onClose) {
  closeSheet();
  sheetEl = document.createElement('div');
  sheetEl.className = 'sheet' + (cls ? ' ' + cls : '');
  sheetEl.setAttribute('role', 'dialog'); sheetEl.setAttribute('aria-modal', 'true');
  sheetEl.innerHTML = `<div class="sheet-bg" data-act="sheet-close"></div><div class="sheet-panel"><div class="sheet-grab"></div>${html}</div>`;
  document.body.appendChild(sheetEl);
  document.body.style.overflow = 'hidden';
  sheetOnClose = onClose || null;
  return sheetEl;
}
function closeSheet() {
  if (!sheetEl) return;
  const cb = sheetOnClose; sheetOnClose = null;
  sheetEl.remove(); sheetEl = null; document.body.style.overflow = '';
  if (cb) cb();
}
function sheetHead(kicker, title) {
  return `<div class="sheet-head"><div class="t"><div class="kicker">${esc(kicker)}</div><h3>${esc(title)}</h3></div><button class="ibtn" data-act="sheet-close" aria-label="Bağla">${icon('x')}</button></div>`;
}

/* TOC */
function openToc() {
  const c = chById[S.params.ch]; if (!c) return;
  const L = P().learned;
  openSheet(sheetHead(c.num ? 'Fəsil ' + pad2(c.num) : 'Mündəricat', c.title) +
    `<div class="sheet-body"><div class="toc">${c.sections.map(s => `<button data-act="toc-go" data-sec="${s.id}"><span class="n">${esc(s.num || kindTag(s))}</span><span>${esc(s.title)}</span><span class="ok">${L[s.id] ? icon('check') : ''}</span></button>`).join('')}</div></div>`);
}

/* settings */
function openSettings() {
  const p = PREF();
  const seg = (name, val, label) => `<button data-act="pref" data-k="${name}" data-v="${val}" aria-pressed="${String(p[name] === val)}">${label}</button>`;
  openSheet(sheetHead('Ayarlar', PWA ? 'Oxu, Claude və məlumatlar' : 'Oxu və görünüş') + `<div class="sheet-body">
    <div class="set-row"><div class="lb">Mövzu</div><div class="seg">${seg('theme', 'system', 'Sistem')}${seg('theme', 'light', 'İşıqlı')}${seg('theme', 'dark', 'Qaranlıq')}</div></div>
    <div class="set-row"><div class="lb">Mətnin ölçüsü</div><div class="fsctl"><button class="btn sm" data-act="fs" data-d="-1" aria-label="Kiçilt">A−</button><span class="v">${p.fs}px</span><button class="btn sm" data-act="fs" data-d="1" aria-label="Böyüt">A+</button></div>
      <div class="prose" style="font-size:${p.fs}px;margin-top:4px">Test defektlərin varlığını göstərir, yoxluğunu yox.</div></div>
    <div class="set-row"><div class="lb">İzah səviyyəsi</div><div class="seg">${seg('lvl', 'short', 'Qısa')}${seg('lvl', 'std', 'Standart')}${seg('lvl', 'deep', 'Dərin')}</div>
      <div class="ds">Qısa — əsas fikirlər; Standart — kitabın mətni; Dərin — mətn, “Dərindən” qatı və mini-nümunə açıq. Hər bölmədə ayrıca da dəyişmək olar.</div></div>
    <div class="set-row"><div class="lb">Fleş kartların istiqaməti</div><div class="seg">${seg('dir', 'en', 'İngiliscə → az')}${seg('dir', 'az', 'Az → ingiliscə')}</div></div>
    ${PWA ? pwaClaudeRow() + pwaDataRow() + pwaAppRow() : `<div class="set-row"><div class="lb">Claude</div><div class="ds">${AI.state === 'on' ? 'Aktivdir: Claude Opus 5.5, maksimum düşünmə (high). Hər sorğu öz Claude limitindən istifadə edir; ilk sorğuda icazə soruşulur.' : AI.state === 'pending' ? 'Yoxlanılır…' : 'Bu görünüşdə əlçatan deyil. Kitab, testlər və kartlar AI olmadan da işləyir.'}</div></div>
    <div class="set-row"><div class="lb">Saxlama</div><div class="ds">${Store.remote && !Store.readOnly ? 'İrəliləyiş, qeydlər və cavablar hesabında saxlanılır — telefonda və kompüterdə eyni görünür.' : 'Hazırda yalnız bu brauzerdə saxlanılır.'}</div></div>`}
  </div>`);
  if (PWA) PWA.persisted().then(ok => { const el = $('#persist-st'); if (el && ok) el.textContent = ' Brauzer bu məlumatları daimi saxlayır.'; });
}
function refreshSettings() { if (sheetEl && $('.sheet-head .kicker', sheetEl) && $('.sheet-head .kicker', sheetEl).textContent === 'Ayarlar') { openSettings(); } }

/* offline app: Claude key, backups, install/update */
const fmtN = n => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const keyFormHTML = () => `<div class="keyrow"><input type="password" id="apikey" placeholder="sk-ant-…" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Anthropic API açarı"><button class="btn sm primary" data-act="key-save">Yoxla və saxla</button></div>
  <div class="ds" id="keymsg">Açarı <a href="https://platform.claude.com/settings/keys" target="_blank" rel="noopener">platform.claude.com/settings/keys</a> səhifəsində yarat (“sk-ant-” ilə başlayır). Açar yalnız bu cihazda saxlanılır və yalnız api.anthropic.com-a göndərilir. Xərc API hesabından çıxılır — claude.ai abunəliyindən ayrıdır.</div>`;
function pwaClaudeRow() {
  const c = PWA.cfg(), has = PWA.hasKey(), u = c.usage;
  const segM = PWA.MODELS.map(m => `<button data-act="ai-model" data-v="${m[0]}" aria-pressed="${String(c.model === m[0])}">${esc(m[1])}</button>`).join('');
  const segE = PWA.EFFORTS.map(m => `<button data-act="ai-effort" data-v="${m[0]}" aria-pressed="${String(c.effort === m[0])}">${esc(m[1])}</button>`).join('');
  const art = `<div class="row"><a class="btn sm${has ? ' ghost' : ''}" href="${esc(PWA.artifactLink(artHash()))}" target="_blank" rel="noopener">claude.ai versiyasını aç${icon('ext')}</a></div>`;
  const tuning = `<div class="lb2">Model</div><div class="seg">${segM}</div>
    <div class="lb2">Düşünmə dərinliyi</div><div class="seg">${segE}</div>
    <div class="ds">Opus 5.5 — ən güclü; Sonnet 5.5 — təxminən iki dəfə ucuz; Haiku 5.5 — ən sürətli və ən ucuz. “Maksimum” daha dərin düşünür, amma daha yavaş və baha olur.</div>
    <div class="ds">Bu cihazda: ${fmtN(u.n)} sorğu · ${fmtN(u.inp)} giriş + ${fmtN(u.out)} çıxış token${u.n ? ` · <button class="linkbtn" data-act="usage-reset">sıfırla</button>` : ''}</div>`;
  // no key: claude.ai is the way; the API key stays available but folded away
  if (!has) return `<div class="set-row" id="set-claude"><div class="lb">Claude</div>
    <div class="ds">Claude düymələri claude.ai versiyasını eyni bölmədə açır və eyni əməliyyatı başladır. Claude orada öz claude.ai hesabınla işləyir — API açarı lazım deyil.</div>
    ${art}
    <details class="keyopt"><summary>Əlavə: öz API açarınla bu tətbiqin içində</summary>${keyFormHTML()}${tuning}</details></div>`;
  return `<div class="set-row" id="set-claude"><div class="lb">Claude</div>
    <div class="ds">Qoşulub — açar ${esc(PWA.keyHint())}. Claude bu tətbiqin içində, internet olanda işləyir.</div>
    <div class="row"><button class="btn sm ghost" data-act="key-del">${icon('trash')}Açarı sil</button></div>
    ${tuning}
    ${art}</div>`;
}
function pwaDataRow() {
  return `<div class="set-row"><div class="lb">Məlumatlar</div>
    <div class="ds">İrəliləyiş, qeydlər və cavablar yalnız bu cihazda saxlanılır. Telefonu dəyişməzdən və ya brauzer məlumatlarını silməzdən əvvəl ixrac et.<span id="persist-st"></span></div>
    <div class="row"><button class="btn sm" data-act="data-export">${icon('download')}İxrac et (.json)</button><button class="btn sm ghost" data-act="data-import">${icon('upload')}İdxal et</button></div></div>`;
}
function pwaAppRow() {
  const s = PWA.sw, inst = PWA.installState();
  const off = !s.supported ? 'Bu ünvanda offline rejim işləmir: tətbiqi HTTPS saytından aç (README faylına bax).'
    : s.ready ? 'Offline hazırdır: bütün kitab bu cihazda saxlanılıb.' : s.error ? 'Offline yaddaşı qurmaq alınmadı: ' + s.error : 'Offline üçün hazırlanır…';
  const instTxt = inst === 'installed' ? 'Tətbiq kimi quraşdırılıb.' : inst === 'ios' ? 'Quraşdırmaq üçün: Safari-də Paylaş düyməsi → “Ana ekrana əlavə et” (Add to Home Screen).' : 'Quraşdırmaq üçün brauzer menyusunda “Tətbiqi quraşdır” (Install app) və ya “Ana ekrana əlavə et” (Add to Home screen) seç.';
  return `<div class="set-row" id="set-app"><div class="lb">Tətbiq</div>
    <div class="ds">${esc(off)}</div>
    ${!s.supported ? '' : inst === 'prompt' ? `<div class="row"><button class="btn sm primary" data-act="pwa-install">${icon('phone')}Tətbiq kimi quraşdır</button></div>` : `<div class="ds">${esc(instTxt)}</div>`}
    <div class="ds">Versiya ${esc(PWA.VERSION)}${s.reg ? ` · <button class="linkbtn" data-act="pwa-update">yeniləməni yoxla</button>` : ''}</div></div>`;
}
function refreshPwaRow(id) {
  const el = document.getElementById(id); if (!el || !PWA) return;
  el.outerHTML = id === 'set-app' ? pwaAppRow() : pwaClaudeRow();
}
function openClaudeSetup(ctx) {
  ctx = ctx || {};
  const link = PWA.artifactLink(ctx.hash || artHash());
  const kind = COPY[ctx.copyKind] ? ctx.copyKind : 'answer';
  openSheet(sheetHead('Claude', 'Claude-u necə qoşaq?') + `<div class="sheet-body">
    <p class="setup-lead">Kitab, testlər və kartlar internetsiz işləyir. Claude isə internet tələb edir — iki yol var:</p>
    <div class="card setup"><div class="kicker">1 · <span lang="en">claude.ai</span> versiyasında — açarsız</div>
      <p>Eyni interaktiv kitab claude.ai-da açılır və Claude orada öz claude.ai hesabınla işləyir. Oradakı irəliləyiş bu tətbiqdən ayrıca saxlanılır.</p>
      <div class="row">${ctx.copy ? `<button class="btn sm" data-act="copy-ans">${icon('copy')}${COPY[kind][1]} kopyala</button>` : ''}<a class="btn sm primary" href="${esc(link)}" target="_blank" rel="noopener">claude.ai-da aç${icon('ext')}</a></div></div>
    <div class="card setup"><div class="kicker">2 · Burada, öz API açarınla</div>
      <p>Cavablar bu tətbiqin içində gəlir. Açarı Anthropic Console-da yaradırsan; ödəniş claude.ai abunəliyindən ayrı, API hesabından çıxılır.</p>
      ${keyFormHTML()}</div>
  </div>`, '', () => { PENDING = null; });
  PENDING = ctx.resume || null;
  sheetEl._answer = ctx.copy || '';
  sheetEl._copyKind = kind;
}
async function saveKey(btn) {
  const inp = $('#apikey'), msg = $('#keymsg');
  const k = (inp && inp.value || '').trim();
  if (!k) { if (inp) inp.focus(); return; }
  if (!/^sk-ant-/.test(k)) { if (msg) msg.innerHTML = '<span class="bad">Bu, Anthropic API açarına oxşamır: açar “sk-ant-” ilə başlayır.</span>'; return; }
  const label = btn.innerHTML; btn.disabled = true; btn.textContent = 'Yoxlanılır…';
  const r = await PWA.testKey(k);
  btn.disabled = false; btn.innerHTML = label;
  if (!r.ok && (r.code === 'auth' || r.code === 'permission')) { if (msg) msg.innerHTML = `<span class="bad">${esc(aiErr(r))}</span>`; return; }
  PWA.setKey(k); if (inp) inp.value = '';
  AI.modelNote = PWA.modelLabel();
  toast(r.ok ? 'Claude qoşuldu.' : 'Açar saxlanıldı, amma yoxlamaq alınmadı (' + (r.code === 'offline' ? 'internet yoxdur' : 'şəbəkə xətası') + ').');
  const resume = PENDING; PENDING = null;
  if (resume) { closeSheet(); if (S.view === 'tutor' && !S.tutorBusy && !S.rpBusy) rerender(); resume(); return; }
  refreshPwaRow('set-claude');
  if (S.view === 'tutor' && !S.tutorBusy && !S.rpBusy) rerender();
}
const IMPORT_KEY = /^(progress|prefs|cards|checks|chat|roleplay|notes-[a-z0-9]+|ans-[a-z0-9]+)$/;
async function exportData() {
  const docs = {};
  lsKeys().forEach(k => { if (IMPORT_KEY.test(k)) docs[k] = Store.doc(k); });
  Object.keys(Store.docs).forEach(k => { if (IMPORT_KEY.test(k)) docs[k] = Store.docs[k]; });
  const out = { app: 'qa-kitab', format: 1, exported: new Date().toISOString(), version: PWA.VERSION, docs };
  const name = 'qa-kitab-ireliles-' + new Date().toISOString().slice(0, 10) + '.json';
  const r = await PWA.saveFile(name, JSON.stringify(out, null, 1));
  if (r === 'downloaded') toast('Fayl yükləndi: ' + name);
  else if (r === 'shared') toast('Fayl paylaşıldı.');
}
async function importData() {
  const txt = await PWA.pickFile(); if (txt == null) return;
  let j = null; try { j = JSON.parse(txt); } catch (e) { j = null; }
  if (!j || j.app !== 'qa-kitab' || !j.docs || typeof j.docs !== 'object') { toast('Bu fayl QA Kitabının ixrac faylı deyil.'); return; }
  const keys = Object.keys(j.docs).filter(k => IMPORT_KEY.test(k) && j.docs[k] && typeof j.docs[k] === 'object' && !Array.isArray(j.docs[k]));
  if (!keys.length) { toast('Faylda məlumat tapılmadı.'); return; }
  openConfirm('İdxal et', `Fayldakı məlumatlar (${keys.length} bölmə${j.exported ? ', ' + String(j.exported).slice(0, 10) : ''}) bu cihazdakı irəliləyişi, qeydləri və cavabları əvəz edəcək.`, 'İdxal et', () => {
    lsKeys().forEach(k => { try { localStorage.removeItem(LS + k); } catch (e) { } });
    Store.docs = {};
    keys.forEach(k => { const d = Object.assign(defFor(k), JSON.parse(JSON.stringify(j.docs[k]))); Store.docs[k] = d; lsSet(k, d); });
    Object.keys(LV).forEach(k => { delete LV[k]; });
    applyPrefs(); S.stack = []; render();
    toast('İdxal edildi: ' + keys.length + ' bölmə.');
  });
}

/* search */
let IDX = null;
function buildIndex() {
  IDX = [];
  CHAPTERS.forEach(c => c.sections.forEach(s => {
    const main = secText(s);
    const extra = s.x ? '\n' + htmlToText(s.x.short) + '\n' + secExtra(s) + '\n' + htmlToText(s.x.ex.task + s.x.ex.steps.join('') + s.x.ex.try) : '';
    const text = main + extra;
    IDX.push({ type: 'sec', id: s.id, c, s, text, ft: fold(s.title + ' ' + (s.num || '')), fb: fold(text), fm: fold(main) });
  }));
  GLOSS.forEach(g => IDX.push({ type: 'gl', id: g.id, g, text: g.def, ft: fold(g.en + ' ' + g.az), fb: fold(g.def) }));
}
function openSearch() {
  openSheet(sheetHead('Axtarış', 'Kitabda axtar') + `<div class="sheet-body"><div class="searchbox">${icon('search')}<input type="search" id="sq" placeholder="Məsələn: sərhəd dəyəri, 401, JOIN" autocomplete="off" aria-label="Axtarış sözü"></div><div class="sres" id="sres" style="margin-top:8px"><p class="muted" style="font-size:14px">Azərbaycan hərfləri olmadan da yaza bilərsən: “seker” → “şəkər”.</p></div></div>`);
  setTimeout(() => { const i = $('#sq'); if (i) i.focus(); }, 60);
}
function doSearch(q) {
  if (!IDX) buildIndex();
  const box = $('#sres'); if (!box) return;
  const words = fold(q).split(/\s+/).filter(w => w.length > 1);
  if (!words.length) { box.innerHTML = ''; return; }
  const hits = [];
  for (const e of IDX) {
    if (!words.every(w => e.ft.includes(w) || e.fb.includes(w))) continue;
    let score = 0; words.forEach(w => { if (e.ft.includes(w)) score += 10; let i = -1, n = 0; while ((i = e.fb.indexOf(w, i + 1)) !== -1 && n < 20) n++; score += n; });
    if (e.type === 'gl') score += 4;
    hits.push({ e, score });
  }
  hits.sort((a, b) => b.score - a.score);
  box.innerHTML = hits.length ? hits.slice(0, 40).map(({ e }) => {
    const pos = e.fb.indexOf(words[0]);
    let snip = pos >= 0 ? e.text.slice(Math.max(0, pos - 60), pos + 110) : e.text.slice(0, 160);
    snip = esc(snip.replace(/\s+/g, ' '));
    const re = new RegExp(words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
    const foldedSnip = fold(snip);
    let marked = '', last = 0, m;
    while ((m = re.exec(foldedSnip)) !== null) { marked += snip.slice(last, m.index) + '<mark>' + snip.slice(m.index, m.index + m[0].length) + '</mark>'; last = m.index + m[0].length; if (!m[0].length) re.lastIndex++; }
    marked += snip.slice(last);
    if (e.type === 'gl') return `<button data-act="search-gl" data-q="${esc(e.g.en)}"><div class="w">Lüğət</div><div class="t">${esc(e.g.en)} — ${esc(e.g.az)}</div><div class="x">${marked}</div></button>`;
    const inMain = words.every(w => e.ft.includes(w) || e.fm.includes(w));
    const deepHit = !inMain && e.s.x;
    return `<button data-act="goto-sec" data-sec="${e.id}"${deepHit ? ' data-lv="deep"' : ''}><div class="w">${esc(e.c.num ? 'Fəsil ' + e.c.num : e.c.title)} · ${esc(e.s.num || kindTag(e.s))}${deepHit ? ' · dərin qat' : ''}</div><div class="t">${esc(e.s.title)}</div><div class="x">…${marked}…</div></button>`;
  }).join('') : '<p class="muted">Heç nə tapılmadı. Başqa söz yoxla.</p>';
}

/* confirm (no native dialogs) */
function openConfirm(title, text, okLabel, onOk) {
  openSheet(sheetHead('Təsdiq', title) + `<div class="sheet-body"><p style="margin:0 0 14px">${esc(text)}</p><div class="row"><button class="btn" data-act="sheet-close">Ləğv et</button><button class="btn primary" data-act="confirm-ok">${esc(okLabel)}</button></div></div>`);
  sheetEl._onOk = onOk;
}

/* AI conversation sheet */
let SH = null; // {turns, kicker, title, sid, ctl, busy}
function openAISheet(cfg) {
  if (claudeGate(() => openAISheet(cfg), { hash: cfg.art || cfg.sid || artHash(), copy: cfg.copy, copyKind: cfg.copyKind })) return;
  SH = { turns: [{ role: 'user', content: cfg.prompt }], shown: [], kicker: cfg.kicker, title: cfg.title, sid: cfg.sid || null, cache: !!cfg.cache, ctl: null, busy: false, follow: cfg.follow !== false, label: cfg.label || '' };
  openSheet(sheetHead('Claude · ' + cfg.kicker, cfg.title) + `<div class="sheet-body" id="shb">${cfg.label ? `<div class="ai-note" style="margin-bottom:10px">${esc(cfg.label)}</div>` : ''}<div class="msgs" id="shm"></div></div>
    <div class="sheet-foot"><div class="acts" id="sha"></div>${SH.follow ? `<div class="inrow"><textarea id="shin" rows="1" placeholder="${['quizme', 'lesson', 'mistakes', 'weak'].includes(cfg.mode) ? 'Cavabını yaz…' : 'Əlavə sual ver…'}" aria-label="Mesaj"></textarea><button class="send" id="shsend" data-act="sh-send" aria-label="Göndər">${icon('send')}</button></div>` : ''}<div class="ai-note" id="shnote"></div></div>`, 'ai', () => { if (SH && SH.ctl) SH.ctl.abort(); SH = null; });
  shRun(cfg.cache);
}
function shActs() {
  const a = $('#sha'); if (!a || !SH) return;
  const lastA = SH.turns.length > 1 && SH.turns[SH.turns.length - 1].role === 'assistant';
  a.innerHTML = SH.busy ? `<button class="btn sm" data-act="sh-stop">${icon('stop')}Dayandır</button>`
    : (lastA ? `${SH.sid ? `<button class="btn sm" data-act="sh-save">${icon('save')}Qeydlərə əlavə et</button>` : ''}<button class="btn sm ghost" data-act="sh-copy">${icon('copy')}Kopyala</button>${SH.turns.length === 2 ? `<button class="btn sm ghost" data-act="sh-retry">${icon('refresh')}Yenisi</button>` : ''}` : '');
  const sb = $('#shsend'); if (sb) { sb.classList.toggle('stop', SH.busy); sb.innerHTML = icon(SH.busy ? 'stop' : 'send'); sb.dataset.act = SH.busy ? 'sh-stop' : 'sh-send'; }
}
async function shRun(useCache) {
  if (!SH) return;
  const box = $('#shm'); if (!box) return;
  const live = document.createElement('div'); live.className = 'msg a';
  live.innerHTML = `<div class="thinking"><i></i><span>Claude düşünür… <b>0</b> s</span></div>`;
  box.appendChild(live);
  SH.busy = true; SH.ctl = new AbortController(); shActs();
  const timer = startCounter(() => live.querySelector('.thinking b'));
  let last = '', raf = 0;
  const paint = () => { raf = 0; live.innerHTML = `<div class="prose">${mdToHtml(last)}</div>`; };
  const mySH = SH;
  try {
    const res = await AI.call(SH.turns.slice(), { cache: useCache ? true : false, signal: SH.ctl.signal, onText: ({ text }) => { last = text; if (!raf) raf = requestAnimationFrame(paint); } });
    if (mySH !== SH) return;
    last = res.text; paint();
    SH.turns.push({ role: 'assistant', content: res.text });
    if (res.truncated) live.insertAdjacentHTML('beforeend', '<div class="ai-note">Cavab uzunluq limitinə görə kəsildi.</div>');
  } catch (e) {
    if (mySH !== SH) return;
    if (e && e.text && e.code !== 'refused') { last = e.text; paint(); SH.turns.push({ role: 'assistant', content: e.text }); }
    else live.innerHTML = '';
    if (!e || e.code !== 'cancelled') live.insertAdjacentHTML('beforeend', aiErrHTML(e));
    else live.insertAdjacentHTML('beforeend', '<div class="ai-note">Dayandırıldı.</div>');
  } finally {
    clearInterval(timer);
    if (mySH === SH) { SH.busy = false; SH.ctl = null; shActs(); const n = $('#shnote'); if (n) n.textContent = AI.modelNote; }
  }
}
function shSend() {
  if (!SH || SH.busy) return;
  const inp = $('#shin'); const text = (inp && inp.value || '').trim(); if (!text) return;
  inp.value = ''; autoGrow(inp);
  SH.turns.push({ role: 'user', content: text });
  $('#shm').insertAdjacentHTML('beforeend', `<div class="msg u">${esc(text)}</div>`);
  shRun(false);
  const b = $('#shb'); if (b) b.scrollTop = b.scrollHeight;
}
function aiForSection(mode, sid) {
  const s = secById[sid]; const M = MODES[mode];
  openAISheet({ mode, kicker: M.kicker, title: secLabel(s), sid, art: sid + '-' + mode, cache: !!M.cache, prompt: `${RULES}\n\n${secCtx(sid)}\n\nTapşırıq: ${M.ask}` });
}
function aiForSelection(text, sid) {
  const s = secById[sid];
  openAISheet({ mode: 'sel', kicker: 'Seçilmiş hissə', title: secLabel(s), sid, copy: text, copyKind: 'selection', label: '«' + (text.length > 140 ? text.slice(0, 140) + '…' : text) + '»',
    prompt: `${RULES}\n\n${secCtx(sid, 6000)}\n\nTələbə bu bölmədən aşağıdakı hissəni seçib və onu başa düşmək istəyir:\n«${text.slice(0, 1500)}»\n\nTapşırıq: seçilmiş hissəni sadə dillə izah et; lazım olsa, kiçik misal ver. Həcm: 120–250 söz.` });
}
function aiForTerm(gid) {
  const g = glById[gid];
  openAISheet({ mode: 'term', kicker: 'Termin', title: `${g.en} — ${g.az}`, art: gid + '-term', cache: true,
    prompt: `${RULES}\n\nTapşırıq: “${g.en}” (${g.az}) terminini izah et: nə deməkdir, tester üçün niyə vacibdir, bir praktik misal ver və tez-tez qarışdırılan oxşar terminlə fərqini göstər. Kitabdakı qısa izah: “${g.def}” (Fəsil ${g.ch.join(', ')}). Həcm: 150–250 söz.` });
}
function aiForQuiz() {
  const Z = S.quiz; if (!Z) return;
  const it = Z.items[Z.i], q = it.q; const L = 'ABCD';
  const optsTxt = it.perm.map((oi, k) => `${L[k]}) ${q.o[oi]}`).join('\n');
  const pickL = L[it.perm.indexOf(it.pick)], rightL = L[it.perm.indexOf(q.a)];
  const wrong = it.pick !== q.a;
  const s = secById[q.sec];
  openAISheet({ mode: 'quizwhy', kicker: 'Test sualı', title: q.q, art: s ? s.id : '', cache: true,
    prompt: `${RULES}\n\n${s ? secCtx(s.id, 5000) + '\n\n' : ''}Test sualı: ${q.q}\nVariantlar:\n${optsTxt}\nMənim seçimim: ${pickL}) ${q.o[it.pick]}\nDüzgün cavab: ${rightL}) ${q.o[q.a]}\nKitabdakı qısa izah: ${q.e}\n\nTapşırıq: ${wrong ? 'mənim seçimimin niyə səhv olduğunu və düzgün cavabın niyə doğru olduğunu' : 'düzgün cavabın niyə doğru olduğunu daha dərindən'} sadə dillə, bir misalla izah et. Həcm: 120–220 söz.` });
}

function aiForChapterLesson(cid) {
  const c = chById[cid];
  openAISheet({ mode: 'lesson', kicker: 'Fəsil üzrə dərs', title: chLabel(c), art: cid + '-lesson',
    prompt: `${RULES}\n\nKontekst — ${chLabel(c)}.\nBölmələr: ${c.sections.filter(s => s.x).map(secLabel).join('; ')}\n\n<fəsil_mətni>\n${chText(c, 15000)}\n</fəsil_mətni>\n\nTapşırıq: ${LESSON_ASK('fəsli', '6–8')}\nHər addım fəslin bir və ya iki bölməsini əhatə etsin və addımın başlığında bölmə nömrəsini göstər.` });
}
function aiForKonspekt(cid) {
  const c = chById[cid];
  openAISheet({ mode: 'quizme', kicker: 'Konspekt üzrə yoxlama', title: chLabel(c), art: cid + '-konspekt',
    prompt: `${RULES}\n\nKontekst — ${chLabel(c)}. Fəslin konspekti:\n<konspekt>\n${konspektText(c).slice(0, 9000)}\n</konspekt>\n\nTapşırıq: konspekt üzrə biliyimi sürətli yoxla. Mənə bir-bir 5 qısa sual ver (hər mesajda BİR sual; fəslin müxtəlif bölmələrindən, bir neçəsi praktik ssenari olsun). Hər cavabımdan sonra 1–2 cümlə ilə qiymətləndir və növbəti suala keç. 5 sualdan sonra nəticəni “5-dən N” formatında yaz və hansı bölmələri təkrar oxumalı olduğumu de. İndi 1-ci sualı ver.` });
}
function aiForMistakes() {
  const Z = S.quiz; if (!Z) return;
  const L = 'ABCD';
  const wrong = Z.items.filter(x => x.pick !== x.q.a);
  if (!wrong.length) return;
  const list = wrong.map((x, i) => {
    const q = x.q, s = secById[q.sec];
    return `${i + 1}) Sual: ${q.q}\nVariantlar: ${x.perm.map((oi, k) => `${L[k]}) ${q.o[oi]}`).join(' | ')}\nMənim cavabım: ${q.o[x.pick]}\nDüzgün cavab: ${q.o[q.a]}\nKitabdakı izah: ${q.e}${s ? `\nBölmə: ${secLabel(s)}` : ''}`;
  }).join('\n\n');
  const c = MAIN.find(x => x.num === Z.num);
  openAISheet({ mode: 'mistakes', kicker: 'Səhvlərimin izahı', title: `Fəsil ${Z.num} testi · ${wrong.length} səhv`,
    prompt: `${RULES}\n\nKontekst — ${chLabel(c)}.\nMən fəsil testində bu suallara səhv cavab vermişəm:\n<səhvlər>\n${list.slice(0, 9000)}\n</səhvlər>\n\nTapşırıq:\n1) Səhvləri ümumi səbəblərə görə qruplaşdır (məsələn, “sərhəd dəyərini sinifdən ayırmamışam”). Səbəbləri “Səhv düşüncə → Düzgün düşüncə” şəklində yaz.\n2) Hər qrup üçün düzgün anlayışı sadə misalla izah et.\n3) Hansı bölmələri təkrar oxumalı olduğumu qısa siyahı ilə göstər.\n4) Sonda bu səhvləri hədəfləyən 2 yeni sual ver (variantsız, qısa ssenari ilə) və cavabımı gözlə. Cavabımdan sonra qiymətləndir.\nHəcm: 250–450 söz.` });
}
function aiForWeak() {
  const items = [];
  MAIN.forEach(c => {
    const q = P().quiz[c.num];
    (q && q.wrong || []).forEach(qid => { const it = (QUIZ[c.num] || []).find(x => x.id === qid); if (it) items.push(`[Test, Fəsil ${c.num}] ${it.q}\nDüzgün cavab: ${it.o[it.a]}\nİzah: ${it.e}`); });
  });
  const tasks = [];
  MAIN.forEach(c => { const a = ansDoc(c.id).a; Object.keys(a).forEach(k => {
    const r = a[k]; if (!r || r.g !== 'Yenidən cəhd et') return;
    const tx = taskById[k] ? htmlToText(taskById[k].t.html) : MINI[k] ? htmlToText(MINI[k].s.x.ex.try) : '';
    if (tx) tasks.push(`[Tapşırıq, Fəsil ${c.num}] ${tx.slice(0, 600)}\nMənim cavabım: ${(r.t || '').slice(0, 500)}\nClaude rəyi: ${(r.fb || '').slice(0, 500)}`);
  }); });
  if (!items.length && !tasks.length) { toast('Hələ zəif mövzu yoxdur — əvvəlcə testləri və tapşırıqları həll et.'); return; }
  const data = items.slice(0, 14).concat(tasks.slice(0, 6)).join('\n\n');
  openAISheet({ mode: 'weak', kicker: 'Zəif mövzular üzrə dərs', title: 'Fərdi təkrar dərsi',
    prompt: `${RULES}\n\nAşağıda mənim zəif yerlərim var: test səhvlərim və “Yenidən cəhd et” alan tapşırıqlarım.\n<zəif_yerlər>\n${data.slice(0, 12000)}\n</zəif_yerlər>\n\nTapşırıq: mənim üçün fərdi təkrar dərsi qur.\n- Əvvəlcə 2–4 əsas boşluğu qısa siyahı ilə adlandır (hər biri bir cümlə).\n- Sonra boşluqları bir-bir keç: hər mesajda BİR boşluq — qısa izah, misal və bir yoxlama sualı. Cavabımı gözlə, qiymətləndir, sonra növbəti boşluğa keç.\n- Sonda “**Növbəti addımlar**” başlığı ilə hansı bölmələri təkrar oxumalı və hansı tapşırıqları yenidən etməli olduğumu yaz.\nİndi başla.` });
}

/* inline AI: task check / hint / self-check */
const inlineBusy = {};
async function inlineAI(kind, id) {
  if (inlineBusy[id]) { inlineBusy[id].abort(); return; }
  const mini = MINI[id];
  const isTask = kind !== 'self';
  const info = mini ? { ch: mini.ch, n: 0 } : (isTask ? taskById[id] : selfById[id]);
  if (!info) return;
  const c = chById[info.ch];
  const ta = document.querySelector(`[data-ans="${id}"]`);
  const answer = (ta && ta.value || '').trim();
  if (kind !== 'hint' && !answer) { toast('Əvvəlcə cavabını yaz.'); if (ta) ta.focus(); return; }
  if (claudeGate(() => inlineAI(kind, id), { hash: info.sec || (mini ? mini.s.id : info.ch), copy: answer, copyKind: 'answer' })) return;
  const itemText = htmlToText(mini ? mini.s.x.ex.try : (isTask ? info.t.html : info.q.html));
  let prompt;
  if (mini) {
    const s = mini.s, ex = s.x.ex;
    const worked = htmlToText(ex.task) + '\n' + ex.steps.map((u, i) => `Addım ${i + 1}: ${htmlToText(u)}`).join('\n');
    const ctx = `${RULES}\n\n${secCtx(s.id, 6000)}\n\nBölmənin həll olunmuş mini-nümunəsi (tələbə onu görüb):\n<nümunə>\n${worked}\n</nümunə>\n\n“Sənin növbən” tapşırığı (nümunəyə oxşar):\n<tapşırıq>\n${itemText}\n</tapşırıq>\n`;
    if (kind === 'check') prompt = ctx + `\nTələbənin cavabı:\n<cavab>\n${answer.slice(0, 8000)}\n</cavab>\n\nTapşırıq: tələbənin cavabını yoxla.\n- Tam, hazır həlli yazma — tələbə səhvini özü düzəltməlidir. Çatışmayan hissəyə işarə et, istiqamət ver; lazım olsa, mini-nümunədəki uyğun addıma istinad et.\n- Birinci sətir dəqiq bu formatda olsun: “QİYMƏT: Əla”, “QİYMƏT: Yaxşı” və ya “QİYMƏT: Yenidən cəhd et”.\n- Sonra üç qısa bölmə: **Düzgün olanlar**, **Düzəltmək lazımdır**, **Növbəti addım** (bir konkret ipucu).\n- Rəqəm və hesablama varsa, onları özün yoxla.\nHəcm: 100–200 söz.`;
    else prompt = ctx + (answer ? `\nTələbənin indiyə qədər yazdığı:\n<cavab>\n${answer.slice(0, 4000)}\n</cavab>\n` : '') + `\nTapşırıq: tələbə bu tapşırıqda ilişib. Həlli vermədən BİR ipucu ver (2–4 cümlə): mini-nümunədəki hansı addımı oxşar şəkildə tətbiq etməli olduğunu və haradan başlamalı olduğunu göstər.${answer ? ' Yazdığına uyğun yönləndir.' : ''}`;
  } else if (kind === 'check') {
    prompt = `${RULES}\n\nKontekst — ${chLabel(c)}.\n<fəsil_mətni>\n${chText(c, 12000)}\n</fəsil_mətni>\n\n“Sənin növbən” tapşırığı №${info.n}:\n<tapşırıq>\n${itemText}\n</tapşırıq>\n\nTələbənin cavabı:\n<cavab>\n${answer.slice(0, 8000)}\n</cavab>\n\nTapşırıq: tələbənin cavabını yoxla.\n- Tam, hazır həlli yazma — tələbə səhvini özü düzəltməlidir. Çatışmayan hissəyə işarə et, istiqamət ver.\n- Birinci sətir dəqiq bu formatda olsun: “QİYMƏT: Əla”, “QİYMƏT: Yaxşı” və ya “QİYMƏT: Yenidən cəhd et”.\n- Sonra üç qısa bölmə: **Düzgün olanlar**, **Düzəltmək lazımdır**, **Növbəti addım** (bir konkret ipucu).\n- Tapşırıq real fəaliyyət tələb edirsə (saytda yoxlama, GitHub linki, ekran şəkli), tələbənin təsvirinə görə qiymətləndir.\nHəcm: 120–220 söz.`;
  } else if (kind === 'hint') {
    prompt = `${RULES}\n\nKontekst — ${chLabel(c)}.\n<fəsil_mətni>\n${chText(c, 9000)}\n</fəsil_mətni>\n\n“Sənin növbən” tapşırığı №${info.n}:\n<tapşırıq>\n${itemText}\n</tapşırıq>\n${answer ? `\nTələbənin indiyə qədər yazdığı:\n<cavab>\n${answer.slice(0, 4000)}\n</cavab>\n` : ''}\nTapşırıq: tələbə bu tapşırıqda ilişib. Həlli vermədən BİR ipucu ver (2–4 cümlə): hansı anlayışı xatırlamalı, hansı sualı özünə verməli və ya haradan başlamalı.${answer ? ' Yazdığına uyğun yönləndir.' : ''}`;
  } else {
    prompt = `${RULES}\n\nKontekst — ${chLabel(c)}.\n<fəsil_mətni>\n${chText(c, 12000)}\n</fəsil_mətni>\n\n“Özünü yoxla” sualı: ${itemText}\nTələbənin cavabı:\n<cavab>\n${answer.slice(0, 4000)}\n</cavab>\n\nTapşırıq: cavabı qiymətləndir.\n- Birinci sətir dəqiq bu formatda olsun: “QİYMƏT: Əla”, “QİYMƏT: Yaxşı” və ya “QİYMƏT: Yenidən cəhd et”.\n- Sonra qısa izah: nə düzgündür, nə çatışmır.\n- Sonda “**Nümunə cavab:**” ilə 2–3 cümləlik düzgün cavab ver.\nHəcm: 80–160 söz.`;
  }
  const fb = document.querySelector(`[data-fb="${id}"]`);
  const btn = document.querySelector(`[data-act="${kind === 'self' ? 'self-check' : 'task-' + kind}"][data-${kind === 'self' ? 'q' : 'task'}="${id}"]`);
  const btnHTML = btn ? btn.innerHTML : '';
  fb.hidden = false;
  fb.innerHTML = `<div class="thinking"><i></i><span>${kind === 'hint' ? 'İpucu hazırlanır' : 'Cavabın yoxlanılır'}… <b>0</b> s</span></div>`;
  const ctl = new AbortController(); inlineBusy[id] = ctl;
  if (btn) btn.innerHTML = icon('stop') + 'Dayandır';
  const timer = startCounter(() => fb.querySelector('.thinking b'));
  let last = '', raf = 0;
  const paint = () => {
    raf = 0;
    if (kind === 'hint') fb.innerHTML = `<div class="fb-h">${icon('bulb')}<span>İpucu</span></div><div class="prose">${mdToHtml(last)}</div>`;
    else { const g = splitGrade(last); fb.innerHTML = `<div class="fb-h">${gradeChip(g.grade)}<span>Claude rəyi</span></div><div class="prose">${mdToHtml(g.body)}</div>`; }
  };
  try {
    const res = await AI.call(prompt, { cache: false, signal: ctl.signal, onText: ({ text }) => { last = text; if (!raf) raf = requestAnimationFrame(paint); } });
    last = res.text; paint();
    const A = ansDoc(c.id).a; const rec = A[id] || (A[id] = {});
    rec.t = answer || rec.t || '';
    if (kind === 'hint') rec.h = res.text;
    else { const g = splitGrade(res.text); rec.fb = g.body; rec.g = g.grade; rec.at = Date.now(); }
    Store.changed('ans-' + c.id);
    if (kind !== 'hint') {
      const card = document.getElementById(id);
      if (card && card.classList.contains('task')) card.classList.toggle('done', rec.g === 'Əla' || rec.g === 'Yaxşı');
      const md = document.querySelector(`[data-mini="${id}"]`);
      if (md) md.classList.toggle('done', rec.g === 'Əla' || rec.g === 'Yaxşı');
      const allA = ansDoc(c.id).a; fb.innerHTML = fbHTML(allA[id]);
    } else { fb.innerHTML = fbHTML(rec); }
  } catch (e) {
    const partial = e && e.code !== 'refused' ? e.text : '';
    if (partial) { last = partial; paint(); } else fb.innerHTML = '';
    if (!e || e.code !== 'cancelled') fb.insertAdjacentHTML('beforeend', aiErrHTML(e));
    else fb.insertAdjacentHTML('beforeend', '<div class="ai-note">Dayandırıldı.</div>');
  } finally {
    clearInterval(timer); delete inlineBusy[id];
    if (btn && btn.isConnected) btn.innerHTML = btnHTML;
  }
}

/* selection pill */
let selState = null, selTimer = null;
function hideSelPill() { const p = $('#selpill'); if (p) p.hidden = true; selState = null; }
function onSelection() {
  clearTimeout(selTimer);
  selTimer = setTimeout(() => {
    if (AI.state !== 'on' || S.view !== 'reader' || sheetEl) { hideSelPill(); return; }
    const sel = window.getSelection();
    const text = sel ? sel.toString().replace(/\s+/g, ' ').trim() : '';
    if (!text || text.length < 3 || !sel.rangeCount) { setTimeout(() => { const s2 = window.getSelection(); if (!s2 || !s2.toString().trim()) hideSelPill(); }, 250); return; }
    const node = sel.getRangeAt(0).commonAncestorContainer;
    const el = node.nodeType === 1 ? node : node.parentElement;
    const sec = el && el.closest('.sec');
    if (!sec || el.closest('textarea,.sec-f,.fb')) { hideSelPill(); return; }
    selState = { text: text.slice(0, 1500), sid: sec.id };
    const p = $('#selpill'); p.hidden = false;
  }, 220);
}

/* =========================================================
   8. Events
   ========================================================= */
function autoGrow(t) { if (!t) return; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 160) + 'px'; }
const noteTimers = {};
document.addEventListener('click', ev => {
  const el = ev.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  const d = el.dataset;
  switch (act) {
    case 'tab': goTab(d.tab); break;
    case 'srt-pick': {
      const st = srtState(d.k); st.pick = st.pick === +d.j ? null : +d.j; srtRedraw(d.k); break;
    }
    case 'srt-put': { const st = srtState(d.k); if (st.pick != null) srtDrop(d.k, st.pick, +d.g); break; }
    case 'srt-move': { const st = srtState(d.k), p = +d.p, q = p + +d.d; if (q >= 0 && q < st.order.length) srtDrop(d.k, st.order[p], q); break; }
    case 'srt-check': {
      const st = srtState(d.k);
      if ('at' in st && st.at.some(g => g < 0)) { toast('Əvvəlcə bütün kartları qruplara yerləşdir.'); break; }
      st.checked = true; srtRedraw(d.k); break;
    }
    case 'srt-reset': delete SRT[d.k]; srtRedraw(d.k); break;
    case 'ix-set': IX[d.sid].v = +d.v; ixRedraw(d.sid); break;
    case 'ix-ev': {
      const c = secById[d.sid].ix, st = IX[d.sid], m = (c.moves[st.cur] || {})[d.e]; if (!m) break;
      st.log.push({ from: st.cur, to: m[0], ev: c.events.find(e => e.id === d.e).label, note: m[1], warn: m[2] === 'warn' });
      st.cur = m[0]; ixRedraw(d.sid); break;
    }
    case 'ix-reset': delete IX[d.sid]; ixRedraw(d.sid); break;
    case 'ix-dt': IX[d.sid].v[d.c] = d.v === '1'; ixRedraw(d.sid); break;
    case 'back': back(); break;
    case 'open-ch': closeSheet(); go('reader', { ch: d.ch }, { tab: d.ch === 'gb' && S.tab === 'practice' ? 'practice' : (S.tab === 'practice' || S.tab === 'progress' ? S.tab : 'book') }); break;
    case 'continue': { const l = P().last; if (l) go('reader', { ch: l.ch, sec: l.sec }, { tab: 'book' }); break; }
    case 'goto-sec': { closeSheet(); const sid = d.sec; if (d.lv) LV[sid] = d.lv; go('reader', { ch: secCh[sid], sec: sid, focus: d.lv === 'deep' ? 'deep' : null }); break; }
    case 'lvl': {
      LV[d.sec] = d.v;
      const nu = refreshSec(d.sec);
      if (nu && nu.getBoundingClientRect().top < 0) nu.scrollIntoView({ block: 'start' });
      break;
    }
    case 'lvl-all': { const p = PREF(); p.lvl = d.v; Store.changed('prefs'); Object.keys(LV).forEach(k => { delete LV[k]; }); rerender(); toast('İzah səviyyəsi: ' + LVLS.find(x => x[0] === d.v)[1]); break; }
    case 'gt': ev.preventDefault(); openTerm(d.g); break;
    case 'konspekt': closeSheet(); go('konspekt', { ch: d.ch }); break;
    case 'kon-copy': {
      const c = chById[S.params.ch]; if (!c) break;
      const text = konspektText(c);
      try { navigator.clipboard.writeText(text).then(() => toast('Konspekt kopyalandı'), () => toast('Kopyalamaq alınmadı')); } catch (e) { toast('Kopyalamaq alınmadı'); }
      break;
    }
    case 'sum': closeSheet(); go('summary', { ch: d.ch }, { push: !d.replace }); break;
    case 'sum-print': printSheets(); break;
    case 'sm': smEvent(Object.assign({ ev: d.e }, d.item ? { item: d.item, where: d.where } : {})); smRedraw(); break;
    case 'sm-open': closeSheet(); go('store', { sc: d.sc || null }, { push: S.view !== 'store' }); break;
    case 'sm-restart': smStart(SM.id); render({ keepScroll: true }); break;
    case 'sm-status': {
      SM.status = d.v;
      $$('[data-act="sm-status"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === d.v)));
      const bt = $('#sm-bt'); if (bt) bt.hidden = d.v !== 'Failed';
      break;
    }
    case 'sm-check': smCheck(); break;
    case 'br-open': {
      brOpen(d.b); brRedraw();
      const fb = $('#sm-fb'); if (fb && SM.fb) fb.innerHTML = smFbHTML();
      const cs = $('#sm-case'); if (cs && !SM.sc) cs.innerHTML = smCaseHTML();
      const br = $('#br'); if (br) br.scrollIntoView({ behavior: 'smooth', block: 'start' });
      break;
    }
    case 'br-shot': if (SM.rep) { brShot(); brRedraw(); toast(SM.rep.shot.ok ? 'Ekran şəkli əlavə olundu' : 'Ekran şəkli əlavə olundu — amma baq bu ekranda görünmür'); } break;
    case 'br-check': if (SM.rep) { brCheck(); const el = $('#br-fb'); if (el) el.innerHTML = brFbHTML(); } break;
    case 'br-copy': if (SM.rep) { try { navigator.clipboard.writeText(brMd()).then(() => toast('Bug report kopyalandı — Jira-ya və ya README-yə yapışdır.'), () => toast('Kopyalamaq alınmadı')); } catch (e) { toast('Kopyalamaq alınmadı'); } } break;
    case 'br-close': {
      SM.rep = null; brRedraw();
      const fb = $('#sm-fb'); if (fb && SM.fb) fb.innerHTML = smFbHTML();
      const cs = $('#sm-case'); if (cs && !SM.sc) cs.innerHTML = smCaseHTML();
      break;
    }
    case 'tr': { const N = trLast(trById[d.tr]), i = Math.min(TR[d.tr] || 0, N); TR[d.tr] = d.d === '0' ? 0 : d.d === 'end' ? N : clamp(i + +d.d, 0, N); trRedraw(d.tr); break; }
    case 'kon-quiz': if (AI.state === 'on') aiForKonspekt(d.ch); break;
    case 'ch-lesson': if (AI.state === 'on') aiForChapterLesson(d.ch); break;
    case 'qz-explain': if (AI.state === 'on') aiForMistakes(); break;
    case 'weak-lesson': if (AI.state === 'on') aiForWeak(); break;
    case 'tutor-mode': S.tutorMode = d.v === 'rp' ? 'rp' : 'chat'; render({ top: true }); break;
    case 'rp-open': closeSheet(); S.tab = 'tutor'; S.stack = []; S.view = 'tutor'; S.params = {}; S.tutorMode = 'rp'; S.rp = d.rp; render({ top: true }); break;
    case 'rp-list': S.rp = null; render({ top: true }); break;
    case 'rp-start': rpCall('start'); break;
    case 'rp-send': { const t = $('#rpin'); const val = t ? t.value : ''; if (!val.trim()) break; if (t) { t.value = ''; autoGrow(t); } rpCall('send', val); break; }
    case 'rp-stop': if (S.rpBusy) S.rpBusy.abort(); break;
    case 'rp-finish': rpCall('finish'); break;
    case 'rp-reset': openConfirm('Yenidən başla', 'Bu ssenari üzrə söhbət və rəy silinəcək.', 'Yenidən başla', () => { const dd = Store.doc('roleplay'); delete dd.s[S.rp]; Store.changed('roleplay'); render({ top: true }); }); break;
    case 'toc': openToc(); break;
    case 'toc-go': { closeSheet(); const t = document.getElementById(d.sec); if (t) t.scrollIntoView({ block: 'start', behavior: 'smooth' }); break; }
    case 'search': openSearch(); break;
    case 'search-gl': closeSheet(); S.glq = d.q; go('glossary', {}); break;
    case 'settings': openSettings(); break;
    case 'sheet-close': closeSheet(); break;
    case 'confirm-ok': { const f = sheetEl && sheetEl._onOk; closeSheet(); if (f) f(); break; }
    case 'pref': {
      const p = PREF(); p[d.k] = d.v; Store.changed('prefs'); applyPrefs(); openSettings();
      if (S.view === 'cards') rerender();
      if (d.k === 'lvl') { Object.keys(LV).forEach(k => { delete LV[k]; }); if (S.view === 'reader') rerender(); }
      break;
    }
    case 'fs': { const p = PREF(); p.fs = clamp((p.fs || 17) + Number(d.d), 15, 21); Store.changed('prefs'); applyPrefs(); openSettings(); break; }
    case 'learn': {
      const p = P(); const sid = d.sec; const on = !p.learned[sid];
      if (on) p.learned[sid] = Date.now(); else delete p.learned[sid];
      Store.changed('progress');
      el.setAttribute('aria-pressed', String(on));
      const sec = document.getElementById(sid); if (sec) sec.classList.toggle('learned', on);
      const c = chById[secCh[sid]]; const st = chStats(c);
      const chip = $('.ch-stats .chip'); if (chip) { chip.className = 'chip' + (st.done === st.total ? ' pass' : ''); chip.innerHTML = icon('check') + st.done + '/' + st.total + ' bölmə'; }
      if (on && st.done === st.total) toast('Fəsil tamamlandı! İndi fəsil testini yoxla.');
      break;
    }
    case 'note': { const box = document.querySelector(`[data-notebox="${d.sec}"]`); if (box) { box.hidden = !box.hidden; if (!box.hidden) { const t = $('textarea', box); autoGrow(t); t.focus(); } } break; }
    case 'ai': if (AI.state === 'on') aiForSection(d.mode, d.sec); break;
    case 'ai-term': if (AI.state === 'on') aiForTerm(d.g); break;
    case 'ex-next': case 'ex-all': {
      const key = d.sec; const steps = stepsFor(key); const n = steps.length;
      const from = EX[key] || 0; const to = act === 'ex-all' ? n : Math.min(n, from + 1);
      EX[key] = to;
      const ol = document.querySelector(`[data-steps="${key}"]`);
      for (let i = from; i < to; i++) ol.insertAdjacentHTML('beforeend', `<li><div class="prose">${steps[i]}</div></li>`);
      document.querySelector(`[data-exctrl="${key}"]`).innerHTML = exCtrl(key, n, to);
      if (act === 'ex-next' && ol.lastElementChild) ol.lastElementChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      break;
    }
    case 'ex-reset': { const key = d.sec; EX[key] = 0; document.querySelector(`[data-steps="${key}"]`).innerHTML = ''; document.querySelector(`[data-exctrl="${key}"]`).innerHTML = exCtrl(key, stepsFor(key).length, 0); break; }
    case 'task-check': inlineAI('check', d.task); break;
    case 'task-hint': inlineAI('hint', d.task); break;
    case 'self-check': inlineAI('self', d.q); break;
    case 'chk-reset': { const s = secById[d.sec]; const K = Store.doc('checks').k; s.items.forEach(i => { delete K[i.id]; }); Store.changed('checks'); $$(`input[data-sec="${s.id}"]`).forEach(i => { i.checked = false; }); updChk(s.id); break; }
    case 'copy-tpl': {
      const sec = document.getElementById(d.sec); const pre = sec && sec.querySelector('pre');
      const text = pre ? pre.textContent : '';
      const done = () => toast('Şablon kopyalandı');
      try { navigator.clipboard.writeText(text).then(done, () => selectText(pre)); } catch (e) { selectText(pre); }
      break;
    }
    case 'quiz': startQuiz(Number(d.ch)); go('quiz', { ch: Number(d.ch) }); break;
    case 'qz-wrong': startQuiz(Number(d.ch), true); go('quiz', { ch: Number(d.ch) }, { push: false }); break;
    case 'qz-pick': { const Z = S.quiz; const it = Z.items[Z.i]; if (it.pick == null) { it.pick = Number(d.o); render({ keepScroll: true }); const ex = $('.qz-ex'); if (ex) ex.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } break; }
    case 'qz-next': { const Z = S.quiz; if (Z.i + 1 < Z.items.length) Z.i++; else finishQuiz(); render(); break; }
    case 'qz-ask': if (AI.state === 'on') aiForQuiz(); break;
    case 'cards': startCards(); go('cards', {}, { tab: 'practice' }); break;
    case 'cards-dir': { const p = PREF(); p.dir = p.dir === 'az' ? 'en' : 'az'; Store.changed('prefs'); if (S.cards) S.cards.flip = false; rerender(); break; }
    case 'card-flip': {
      const K = S.cards; if (!K || K.i >= K.queue.length) break;
      K.flip = !K.flip;
      const f = $('.fc'); if (f) f.classList.toggle('flip', K.flip);
      const b = $('#fcbtns'); if (b) b.innerHTML = cardBtns(glById[K.queue[K.i]]);
      break;
    }
    case 'card-yes': cardAnswer(true); break;
    case 'card-no': cardAnswer(false); break;
    case 'glossary': go('glossary', {}, { tab: S.tab === 'practice' ? 'practice' : 'book' }); break;
    case 'tutor-send': { const t = $('#tin'); const v = t ? t.value : ''; if (t) { t.value = ''; autoGrow(t); } tutorSend(v); break; }
    case 'tutor-quick': tutorSend(d.q); break;
    case 'tutor-clear': { if (S.tutorBusy) S.tutorBusy.abort(); openConfirm('Söhbəti təmizlə', 'Müəllimlə bütün söhbət silinəcək.', 'Təmizlə', () => { const ch = Store.doc('chat'); ch.turns = []; Store.changed('chat'); rerender(); }); break; }
    case 'sh-send': shSend(); break;
    case 'sh-stop': if (SH && SH.ctl) SH.ctl.abort(); break;
    case 'sh-retry': { if (!SH || SH.busy) return; SH.turns = SH.turns.slice(0, 1); $('#shm').innerHTML = ''; shRun(false); break; }
    case 'sh-copy': { if (!SH) return; const last = [...SH.turns].reverse().find(t => t.role === 'assistant'); if (!last) return; try { navigator.clipboard.writeText(last.content).then(() => toast('Kopyalandı'), () => toast('Kopyalamaq alınmadı — mətni seçib kopyala.')); } catch (e) { toast('Kopyalamaq alınmadı'); } break; }
    case 'sh-save': {
      if (!SH || !SH.sid) return; const last = [...SH.turns].reverse().find(t => t.role === 'assistant'); if (!last) return;
      const cid = secCh[SH.sid]; const N = notesDoc(cid).n;
      const add = `— Claude (${SH.kicker}) —\n${last.content}`;
      N[SH.sid] = ((N[SH.sid] || '').trim() ? N[SH.sid].trim() + '\n\n' : '') + add;
      if (N[SH.sid].length > 20000) N[SH.sid] = N[SH.sid].slice(-20000);
      Store.changed('notes-' + cid);
      const ta = document.querySelector(`[data-note="${SH.sid}"]`); if (ta) ta.value = N[SH.sid];
      const nb = document.querySelector(`.notebtn[data-sec="${SH.sid}"]`); if (nb) { nb.classList.add('has'); nb.innerHTML = icon('pencil') + 'Qeydim'; }
      toast('Bölmənin qeydlərinə əlavə edildi');
      break;
    }
    case 'claude-setup': if (PWA) openClaudeSetup({}); break;
    case 'key-save': if (PWA) saveKey(el); break;
    case 'key-del': if (PWA) openConfirm('Açarı sil', 'API açarı bu cihazdan silinəcək. Bundan sonra Claude düymələri claude.ai versiyasını açacaq.', 'Sil', () => { PWA.clearKey(); toast('Açar silindi.'); openSettings(); if (S.view === 'tutor' && !S.tutorBusy && !S.rpBusy) rerender(); }); break;
    case 'ai-model': case 'ai-effort': {
      if (!PWA) break;
      if (act === 'ai-model') PWA.setModel(d.v); else PWA.setEffort(d.v);
      $$(`[data-act="${act}"]`).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === d.v)));
      AI.modelNote = PWA.modelLabel();
      break;
    }
    case 'usage-reset': if (PWA) { PWA.resetUsage(); refreshPwaRow('set-claude'); } break;
    case 'copy-ans': {
      const a = sheetEl && sheetEl._answer; if (!a) break;
      const label = (COPY[sheetEl._copyKind] || COPY.answer)[0];
      try { navigator.clipboard.writeText(a).then(() => toast(label + ' kopyalandı — claude.ai-da yapışdır.'), () => toast('Kopyalamaq alınmadı.')); } catch (e) { toast('Kopyalamaq alınmadı.'); }
      break;
    }
    case 'data-export': if (PWA) exportData(); break;
    case 'data-import': if (PWA) importData(); break;
    case 'pwa-install': if (PWA) PWA.install().then(ok => { if (ok) toast('Tətbiq quraşdırılır…'); if (S.view === 'home') rerender(); refreshPwaRow('set-app'); }); break;
    case 'pwa-hint-off': { const p = PREF(); p.pwaHint = 1; Store.changed('prefs'); rerender(); break; }
    case 'pwa-update': if (PWA) PWA.checkUpdate().then(r => toast(r === 'found' ? 'Yeni versiya yüklənir — hazır olanda xəbər verəcəyik.' : r === 'latest' ? 'Ən son versiya quraşdırılıb.' : r === 'offline' ? 'İnternet yoxdur.' : 'Yoxlamaq alınmadı.')); break;
    case 'reset-ask': openConfirm('İrəliləyişi sıfırla', 'Öyrəndim işarələri, test nəticələri və kartların vəziyyəti silinəcək. Qeydlər və tapşırıq cavabları qalacaq.', 'Sıfırla', () => {
      const p = P(); p.learned = {}; p.quiz = {}; p.last = null; Store.changed('progress');
      Store.doc('cards').c = {}; Store.changed('cards'); Store.doc('checks').k = {}; Store.changed('checks');
      toast('İrəliləyiş sıfırlandı'); rerender();
    }); break;
  }
});
document.addEventListener('pointerdown', ev => {
  const p = ev.target.closest('#selpill');
  if (!p) return;
  ev.preventDefault();
  if (selState) { const st = selState; hideSelPill(); try { window.getSelection().removeAllRanges(); } catch (e) { } aiForSelection(st.text, st.sid); }
});
document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape' && sheetEl) { closeSheet(); return; }
  if (ev.key === 'Enter' && !ev.shiftKey) {
    if (ev.target.id === 'tin') { ev.preventDefault(); const v = ev.target.value; ev.target.value = ''; autoGrow(ev.target); tutorSend(v); }
    else if (ev.target.id === 'shin') { ev.preventDefault(); shSend(); }
    else if (ev.target.id === 'rpin') { ev.preventDefault(); const v = ev.target.value; if (!v.trim() || S.rpBusy) return; ev.target.value = ''; autoGrow(ev.target); rpCall('send', v); }
    else if (ev.target.id === 'apikey' && PWA) { ev.preventDefault(); const b = $('[data-act="key-save"]'); if (b && !b.disabled) saveKey(b); }
    else if (ev.target.dataset && ev.target.dataset.smF) { ev.preventDefault(); smEvent({ ev: SM.st.page === 'login' ? 'login' : 'continue' }); smRedraw(); } // Enter submits the form, as on the site
  }
  if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.classList && ev.target.classList.contains('fc')) { ev.preventDefault(); ev.target.click(); }
});
function selectText(el) { if (!el) return; try { const r = document.createRange(); r.selectNodeContents(el); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); toast('Mətn seçildi — kopyala'); } catch (e) { } }
function updChk(sid) {
  const s = secById[sid]; const K = Store.doc('checks').k;
  const el = document.querySelector(`[data-chkcount="${sid}"]`);
  if (el) el.textContent = `${s.items.filter(i => K[i.id]).length}/${s.items.length} yoxlanılıb`;
}
document.addEventListener('input', ev => {
  const t = ev.target;
  if (t.dataset.note) {
    const sid = t.dataset.note, cid = t.dataset.ch;
    notesDoc(cid).n[sid] = t.value;
    clearTimeout(noteTimers[sid]);
    const st = document.querySelector(`[data-notest="${sid}"]`); if (st) st.textContent = 'Yazılır…';
    noteTimers[sid] = setTimeout(() => {
      if (!t.value.trim()) delete notesDoc(cid).n[sid];
      Store.changed('notes-' + cid);
      if (st) st.textContent = 'Saxlanıldı';
      const nb = document.querySelector(`.notebtn[data-sec="${sid}"]`); if (nb) { const has = !!t.value.trim(); nb.classList.toggle('has', has); nb.innerHTML = icon('pencil') + (has ? 'Qeydim' : 'Qeyd'); }
    }, 700);
    autoGrow(t);
  } else if (t.dataset.ans) {
    const id = t.dataset.ans, cid = t.dataset.ch;
    const A = ansDoc(cid).a; const rec = A[id] || (A[id] = {});
    rec.t = t.value;
    swUpdate(t);
    clearTimeout(noteTimers[id]);
    const st = document.querySelector(`[data-st="${id}"]`); if (st) st.textContent = 'Yazılır…';
    noteTimers[id] = setTimeout(() => { Store.changed('ans-' + cid); if (st) st.textContent = 'Saxlanıb'; }, 700);
  } else if (t.dataset.ixRange) {
    const sid = t.dataset.ixRange; IX[sid].v = +t.value;
    const out = t.parentNode.querySelector('.bva-out'); if (out) out.innerHTML = bvaOut(sid, secById[sid].ix);
  } else if (t.dataset.smF) smType(t);
  else if (t.dataset.smAns !== undefined) SM.ans = t.value;
  else if (t.dataset.smTitle !== undefined) SM.title = t.value;
  else if (t.dataset.brF && SM.rep) SM.rep.f[t.dataset.brF] = t.value;
  else if (t.id === 'glq') { S.glq = t.value; drawGlossary(); }
  else if (t.id === 'sq') { doSearch(t.value); }
  else if (t.id === 'tin' || t.id === 'shin' || t.id === 'rpin') autoGrow(t);
});
document.addEventListener('toggle', ev => { const el = ev.target; if (el && el.dataset && el.dataset.open) OPEN[el.dataset.open] = el.open; }, true);
document.addEventListener('change', ev => {
  const t = ev.target;
  if (t.dataset.ixTg) { IX[t.dataset.sid][t.dataset.ixTg] = t.checked; ixRedraw(t.dataset.sid); return; }
  if (t.dataset.smSort !== undefined) { smEvent({ ev: 'sort', v: t.value }); smRedraw(); return; }
  if (t.dataset.chk) { const K = Store.doc('checks').k; if (t.checked) K[t.dataset.chk] = 1; else delete K[t.dataset.chk]; Store.changed('checks'); updChk(t.dataset.sec); }
  else if (t.id === 'tctx') { const ch = Store.doc('chat'); ch.ctx = t.value; Store.changed('chat'); toast('Kontekst dəyişdi: ' + (t.value === 'none' ? 'ümumi' : chLabel(chById[t.value]))); }
});
document.addEventListener('selectionchange', onSelection);
window.addEventListener('scroll', () => { if (!scrollRaf) scrollRaf = requestAnimationFrame(() => { scrollRaf = 0; onScroll(); }); }, { passive: true });
let scrollRaf = 0;
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') Store.flushAll();
  else if (Store.remote) pullRemote(false);
});
window.addEventListener('pagehide', () => Store.flushAll());

/* =========================================================
   9. Boot
   ========================================================= */
document.getElementById('tabbar').innerHTML = `<div class="wrap">
  <button class="tab" data-act="tab" data-tab="book">${icon('book')}<span>Kitab</span></button>
  <button class="tab" data-act="tab" data-tab="practice">${icon('target')}<span>Məşq</span></button>
  <button class="tab" data-act="tab" data-tab="tutor">${icon('spark')}<span>Müəllim</span></button>
  <button class="tab" data-act="tab" data-tab="progress">${icon('chart')}<span>İrəliləyiş</span></button></div>`;
const pill = document.createElement('button');
pill.id = 'selpill'; pill.className = 'selpill'; pill.hidden = true; pill.innerHTML = icon('spark') + 'Seçiləni izah et';
document.body.appendChild(pill);
applyPrefs();
AI.setState('pending');
// links from the offline app: #c3s4 opens a section; #c3s4-simple, #c3-lesson, #c3-konspekt and #g12-term also
// start that Claude action once Claude is ready. Only ids from the book are accepted, so a link cannot carry its own prompt.
// #c3-xulase and #xulase open the summary sheets (the claude.ai version links there when it cannot print);
// #magaza opens the practice store, #magaza-tc04 with that test case.
let AUTO = null;
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
function routeHash() {
  AUTO = null;
  const h = (location.hash || '').replace('#', '');
  const [t, act] = h.split('-');
  if (/^c\d{1,2}$/.test(t) && chById[t]) {
    S.tab = 'book'; S.view = 'reader'; S.params = { ch: t };
    if (act === 'lesson') AUTO = () => aiForChapterLesson(t);
    else if (act === 'konspekt') AUTO = () => aiForKonspekt(t);
    else if (act === 'xulase' && chById[t].kind === 'chapter') S.view = 'summary';
  }
  else if (own(secById, t)) {
    S.tab = 'book'; S.view = 'reader'; S.params = { ch: secCh[t], sec: t };
    if (own(MODES, act) && (act !== 'lesson' || secById[t].x)) AUTO = () => aiForSection(act, t);
  }
  else if (own(glById, t) && act === 'term') { S.view = 'glossary'; S.params = {}; AUTO = () => aiForTerm(t); }
  else if (h === 'gb') { S.view = 'reader'; S.params = { ch: 'gb' }; }
  else if (h === 'ga' || h === 'luget') { S.view = 'glossary'; S.params = {}; }
  else if (h === 'mesq' || h === 'practice') { S.tab = 'practice'; S.view = 'practice'; S.params = {}; }
  else if (h === 'xulase') { S.tab = 'practice'; S.view = 'summary'; S.params = { ch: 'all' }; }
  else if (t === 'magaza') { S.tab = 'practice'; S.view = 'store'; S.params = { sc: own(scById, act) ? act : null }; }
  else if (h === 'muellim' || h === 'tutor') { S.tab = 'tutor'; S.view = 'tutor'; S.params = {}; S.tutorMode = 'chat'; }
  else if (h === 'rol' || h === 'roleplay') { S.tab = 'tutor'; S.view = 'tutor'; S.params = {}; S.tutorMode = 'rp'; }
  else if (h === 'progress' || h === 'ireliles') { S.tab = 'progress'; S.view = 'progress'; S.params = {}; }
  else return false;
  S.stack = [];
  return true;
}
// claude.ai version only: the offline app has no Claude without a key and would bounce the action straight back
function runAuto() {
  const f = AUTO; AUTO = null;
  if (!f || PWA) return;
  if (AI.state !== 'on') { toast('Claude bu görünüşdə əlçatan deyil: icazə verilməyib və ya hesabda söndürülüb.'); return; }
  try { history.replaceState(null, '', '#' + location.hash.slice(1).split('-')[0]); } catch (e) { } // a reload must not repeat it
  f();
}
(function boot() { routeHash(); render(); })();
// links like #c5 or #mesq (app shortcuts) also work while the page is already open
window.addEventListener('hashchange', () => { if (routeHash()) { closeSheet(); render(); AI.ready.then(runAuto); } });
AI.ready = AI.init();
AI.ready.then(() => { if (S.view === 'tutor' && !S.tutorBusy) rerender(); refreshSettings(); runAuto(); });
if (PWA) {
  PWA.on('net', () => {
    toast(PWA.online() ? 'İnternet bərpa olundu — Claude yenə əlçatandır.' : 'İnternet yoxdur — kitab offline işləyir, Claude isə yox.');
    if (S.view === 'tutor' && !S.tutorBusy && !S.rpBusy) rerender();
  });
  PWA.on('sw', () => refreshPwaRow('set-app'));
  PWA.on('install', () => { refreshPwaRow('set-app'); if (S.view === 'home') rerender(); });
  PWA.on('key', () => { AI.modelNote = PWA.modelLabel(); });
} else initRemote().catch(() => { });
})();
