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
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
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
  if (key === 'pw') return { code: {}, done: {}, loc: {} };
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
  const views = { home: vHome, reader: vReader, practice: vPractice, quiz: vQuiz, cards: vCards, glossary: vGlossary, tutor: vTutor, progress: vProgress, konspekt: vKonspekt, summary: vSummary, store: vStore, lab: vLab, sql: vSql, exam: vExam, ctfl: vCtfl, pw: vPw };
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
    return `<div class="short"><div class="short-k">Qısa</div><div class="prose">${s.x.short}</div></div>${cmpHTML(s)}${srtHTML(s)}${ixHTML(s)}${simHTML(s)}${labLinkHTML(s)}${sqlLinkHTML(s)}${pwLinkHTML(s)}${trHTML(s)}${keysHTML(s.x)}
      <button class="btn sm ghost more" data-act="lvl" data-sec="${s.id}" data-v="std">${icon('book')}Tam mətni oxu</button>${miniHTML(c, s, false)}`;
  }
  return `<div class="prose">${s.html}</div>${cmpHTML(s)}${srtHTML(s)}${ixHTML(s)}${simHTML(s)}${labLinkHTML(s)}${sqlLinkHTML(s)}${pwLinkHTML(s)}${trHTML(s)}${keysHTML(s.x)}${deepHTML(s, lv === 'deep')}${miniHTML(c, s, lv === 'deep')}`;
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
  else body = `<div class="prose">${s.html}</div>${cmpHTML(s)}${srtHTML(s)}${ixHTML(s)}${simHTML(s)}${labLinkHTML(s)}${sqlLinkHTML(s)}${pwLinkHTML(s)}${trHTML(s)}`;
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
// typing into a field (the store, a Playwright fill); problem_user's planted bug: Last Name's letters land in First Name
function smFill(st, f, v, found) {
  if (f === 'last' && st.user === 'problem_user' && v) { st.f.first = v.slice(-1); st.f.last = ''; found.last = (found.last || 0) + 1; }
  else st.f[f] = v;
}
function smType(t) {
  const st = SM.st, f = t.dataset.smF;
  SM.touched[f] = true;
  smFill(st, f, t.value, SM.found);
  if (st.f[f] !== t.value) { t.value = st.f[f]; const fi = $('#sm-dev [data-sm-f="first"]'); if (fi) fi.value = st.f.first; }
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
/* ---------- Playwright practice (playwright.json): the reader's own locators and tests, run against the practice store.
   The code is parsed, never eval'd: a subset of Playwright's API (page, locators, actions, web-first assertions) with its
   strict mode, timeouts and error messages. The shop's DOM gets saucedemo's data-test attributes, ids and classes, so
   the book's code from 19.6 runs as written ---------- */
const PWD = BOOK.playwright;
const pwTaskById = Object.fromEntries(PWD.tasks.map(t => [t.id, t]));
const pwLocById = Object.fromEntries(PWD.locators.map(l => [l.id, l]));
const PW_HOSTS = ['www.saucedemo.com', 'saucedemo.com', 'ministore.test'];
const PW_SLUG = { backpack: 'sauce-labs-backpack', bikelight: 'sauce-labs-bike-light', bolt: 'sauce-labs-bolt-t-shirt', fleece: 'sauce-labs-fleece-jacket', onesie: 'sauce-labs-onesie', redshirt: 'test.allthethings()-t-shirt-(red)' };
const PW = { tab: 'loc', loc: PWD.locators[0].id, task: PWD.tasks[0].id, st: null, pick: false, q: '', alts: null, run: null, ti: 0, step: -1, shot: null }; // session only
const pwDoc = () => Store.doc('pw'); // the reader's code per task, done tasks and locators
const pwCode = id => { const c = pwDoc().code[id]; return typeof c === 'string' ? c : pwTaskById[id].code.join('\n'); };
// saucedemo's test hooks on the shop's elements: [selector, data-test, id]
const PW_ATTR = [['[data-sm-f="user"]', 'username', 'user-name'], ['[data-sm-f="pass"]', 'password', 'password'], ['[data-sm-f="first"]', 'firstName', 'first-name'],
  ['[data-sm-f="last"]', 'lastName', 'last-name'], ['[data-sm-f="zip"]', 'postalCode', 'postal-code'], ['[data-e="login"]', 'login-button', 'login-button'],
  ['.sm-err span', 'error'], ['.sm-err button', 'error-button'], ['.sm-title', 'title'], ['.sm-cart', 'shopping-cart-link'], ['.sm-badge', 'shopping-cart-badge'],
  ['.sm-sort', 'product-sort-container'], ['.sm-item', 'inventory-item'], ['.sm-name', 'inventory-item-name'], ['.sm-price', 'inventory-item-price'],
  ['[data-e="checkout"]', 'checkout', 'checkout'], ['.sm-acts [data-e="shop"]', 'continue-shopping', 'continue-shopping'], ['.sm-menu [data-e="shop"]', 'inventory-sidebar-link', 'inventory_sidebar_link'],
  ['[data-e="logout"]', 'logout-sidebar-link', 'logout_sidebar_link'], ['[data-e="reset"]', 'reset-sidebar-link', 'reset_sidebar_link'], ['[data-e="menu"]', '', 'react-burger-menu-btn'],
  ['[data-e="cancel"]', 'cancel', 'cancel'], ['[data-e="continue"]', 'continue', 'continue'], ['[data-e="finish"]', 'finish', 'finish'], ['[data-e="home"]', 'back-to-products', 'back-to-products'],
  ['.sm-done-h', 'complete-header'], ['.sm-done-p', 'complete-text']];
const PW_CLS = [['.sm-badge', 'shopping_cart_badge'], ['.sm-cart', 'shopping_cart_link'], ['.sm-title', 'title'], ['.sm-item', 'inventory_item'], ['.sm-name', 'inventory_item_name'],
  ['.sm-price', 'inventory_item_price'], ['.sm-err', 'error-message-container'], ['.sm-logo', 'app_logo']];
function pwDecorate(root) {
  PW_ATTR.forEach(([sel, dt, id]) => $$(sel, root).forEach(el => { if (dt) el.setAttribute('data-test', dt); if (id) el.id = id; }));
  PW_CLS.forEach(([sel, c]) => $$(sel, root).forEach(el => el.classList.add(c)));
  $$('[data-e="add"],[data-e="remove"]', root).forEach(el => { const t = (el.dataset.e === 'add' ? 'add-to-cart-' : 'remove-') + PW_SLUG[el.dataset.item]; el.setAttribute('data-test', t); el.id = t; });
  $$('.sm-done-h', root).forEach(el => { el.setAttribute('role', 'heading'); el.setAttribute('aria-level', '2'); });
  return root;
}
function pwDom(st) { const root = document.createElement('div'); root.innerHTML = smDevHTML(st); return pwDecorate(root); }
// ---- the locator engine: ARIA role and accessible name, text, placeholder, label, test id (data-test), CSS and XPath
function PwErr(msg, hint, line) { const e = new Error(msg); e.pw = 1; e.hint = hint || ''; if (line) e.line = line; return e; }
const pwNorm = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
const pwHidden = el => !!el.closest('[hidden],[aria-hidden="true"]');
const PW_IN = { button: 'button', submit: 'button', reset: 'button', image: 'button', checkbox: 'checkbox', radio: 'radio', range: 'slider', number: 'spinbutton', search: 'searchbox' };
function pwRole(el) {
  const r = el.getAttribute('role'); if (r) return r.trim().split(/\s+/)[0];
  const t = el.tagName.toLowerCase();
  if (t === 'input') return el.type === 'hidden' || el.type === 'password' ? null : PW_IN[el.type] || 'textbox'; // a password field has no role
  if (/^h[1-6]$/.test(t)) return 'heading';
  return { button: 'button', a: el.hasAttribute('href') ? 'link' : null, textarea: 'textbox', select: el.multiple || el.size > 1 ? 'listbox' : 'combobox', option: 'option',
    ul: 'list', ol: 'list', li: 'listitem', img: el.getAttribute('alt') === '' ? 'presentation' : 'img', table: 'table', tr: 'row', td: 'cell', th: 'columnheader', nav: 'navigation', p: 'paragraph' }[t] || null;
}
const PW_ROLES = ['alert', 'button', 'cell', 'checkbox', 'columnheader', 'combobox', 'heading', 'img', 'link', 'list', 'listbox', 'listitem', 'navigation', 'option', 'paragraph', 'radio', 'row', 'searchbox', 'slider', 'spinbutton', 'table', 'textbox'];
const PW_TEXT_NAME = /^(button|link|heading|option|cell|columnheader|checkbox|radio|row)$/;
const pwTextOf = el => el.tagName === 'INPUT' ? (/^(submit|button|reset)$/.test(el.type) ? el.value : '') : el.textContent;
const pwLabelFor = el => el.id ? el.getRootNode().querySelector(`label[for="${CSS.escape(el.id)}"]`) : null;
function pwName(el) {
  const al = el.getAttribute('aria-label'); if (al && al.trim()) return pwNorm(al);
  const t = el.tagName.toLowerCase();
  if (t === 'input' && /^(submit|button|reset)$/.test(el.type)) return pwNorm(el.value);
  if (t === 'input' || t === 'textarea' || t === 'select') { const lb = pwLabelFor(el); return pwNorm(lb ? lb.textContent : el.getAttribute('placeholder') || el.getAttribute('title')); }
  if (t === 'img') return pwNorm(el.getAttribute('alt'));
  return PW_TEXT_NAME.test(pwRole(el) || '') ? pwNorm(pwTextOf(el)) : pwNorm(el.getAttribute('title'));
}
// Playwright's text matching: whitespace normalized; a case-insensitive substring, or the whole string with exact
function pwMatch(v, s, exact) { s = pwNorm(s); if (v instanceof RegExp) return v.test(s); return exact ? s === pwNorm(v) : s.toLowerCase().includes(pwNorm(v).toLowerCase()); }
function pwQuery(ctx, s) {
  const all = () => $$('*', ctx).filter(el => !pwHidden(el));
  switch (s.k) {
    case 'css': {
      if (/^(xpath=|\/\/|\.\.)/.test(s.v)) { // XPath, relative to the scope
        const xp = s.v.replace(/^xpath=/, ''), out = [];
        let r; try { r = document.evaluate(xp.startsWith('/') ? '.' + xp : xp, ctx, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); } catch (e) { throw PwErr(`Error: SyntaxError: Failed to execute 'evaluate': The string '${xp}' is not a valid XPath expression.`, 'XPath yazılışı səhvdir. Məsələn: //button[@id="login-button"]'); }
        for (let i = 0; i < r.snapshotLength; i++) if (r.snapshotItem(i).nodeType === 1) out.push(r.snapshotItem(i));
        return out;
      }
      if (/:(has-text|text|visible)\(|>>/.test(s.v)) throw PwErr(`Error: ${s.v} — bu modeldə Playwright-ın CSS genişlənmələri yoxdur`, 'Sadə CSS yaz, mətnlə seçmək üçün .filter({ hasText: … }) işlət.');
      try { return $$(s.v, ctx).filter(el => !pwHidden(el)); } catch (e) { throw PwErr(`Error: Unexpected token while parsing css selector "${s.v}"`, 'CSS selektoru səhvdir: dırnaqları və mötərizələri yoxla. Məsələn: [data-test="error"]'); }
    }
    case 'role': return all().filter(el => pwRole(el) === s.role && (s.name === undefined || pwMatch(s.name, pwName(el), s.exact))
      && (s.level === undefined || +(el.getAttribute('aria-level') || el.tagName.slice(1)) === s.level));
    case 'text': { const m = all().filter(el => !/^(SELECT|OPTION)$/.test(el.tagName) && pwTextOf(el).trim() && pwMatch(s.v, pwTextOf(el), s.exact)); return m.filter(el => !m.some(o => o !== el && el.contains(o))); }
    case 'ph': return all().filter(el => el.hasAttribute('placeholder') && pwMatch(s.v, el.getAttribute('placeholder'), s.exact));
    case 'label': return all().filter(el => { const al = el.getAttribute('aria-label'), lb = pwLabelFor(el); return (al && pwMatch(s.v, al, s.exact)) || (lb && pwMatch(s.v, lb.textContent, s.exact)); });
    case 'testid': return all().filter(el => el.hasAttribute('data-test') && (s.v instanceof RegExp ? s.v.test(el.getAttribute('data-test')) : el.getAttribute('data-test') === s.v));
  }
  return [];
}
function pwResolve(loc, root) {
  let set = [root];
  for (const s of loc.steps) {
    if (s.k === 'nth') { const el = set[s.i < 0 ? set.length + s.i : s.i]; set = el ? [el] : []; continue; }
    if (s.k === 'filter') {
      set = set.filter(el => (s.has === undefined || pwMatch(s.has, el.textContent, false)) && (s.hasNot === undefined || !pwMatch(s.hasNot, el.textContent, false)) && (!s.inner || pwResolve(s.inner, el).length > 0));
      continue;
    }
    const out = new Set(); set.forEach(ctx => pwQuery(ctx, s).forEach(el => out.add(el)));
    set = [...out].sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1);
  }
  return set;
}
const pwLoc = (steps, desc) => ({ $loc: 1, steps, desc });
function pwFmt(v) { // a value as Playwright prints it in a locator
  if (v instanceof RegExp) return String(v);
  if (typeof v === 'string') return `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  if (Array.isArray(v)) return `[${v.map(pwFmt).join(', ')}]`;
  if (v && typeof v === 'object') return v.$loc ? v.desc : `{ ${Object.entries(v).map(([k, x]) => `${k}: ${pwFmt(x)}`).join(', ')} }`;
  return String(v);
}
const pwOuter = el => { const a = el.getAttribute('data-test'), t = pwNorm(pwTextOf(el)), n = el.tagName.toLowerCase(); return `<${n}${a ? ` data-test="${a}"` : el.id ? ` id="${el.id}"` : ''}>${t.length > 30 ? t.slice(0, 30) + '…' : t}</${n}>`; };
// locators that find this element and only it, best first (19.5: role, label, placeholder, text, test id, CSS)
function pwBest(el, root) {
  const role = pwRole(el), name = pwName(el), ph = el.getAttribute('placeholder'), al = el.getAttribute('aria-label'), dt = el.getAttribute('data-test'), txt = pwNorm(pwTextOf(el));
  const c = [];
  if (role && name) c.push(`page.getByRole(${pwFmt(role)}, { name: ${pwFmt(name)} })`, `page.getByRole(${pwFmt(role)}, { name: ${pwFmt(name)}, exact: true })`);
  if (ph) c.push(`page.getByPlaceholder(${pwFmt(ph)})`);
  if (al) c.push(`page.getByLabel(${pwFmt(al)})`);
  if (txt && txt.length < 60 && !/^(INPUT|SELECT|BUTTON)$/.test(el.tagName)) c.push(`page.getByText(${pwFmt(txt)})`, `page.getByText(${pwFmt(txt)}, { exact: true })`);
  if (role && !name) c.push(`page.getByRole(${pwFmt(role)})`);
  const item = el.closest('[data-test="inventory-item"]'), iname = item && item !== el && $('[data-test="inventory-item-name"]', item);
  if (iname) c.push(`page.getByTestId('inventory-item').filter({ hasText: ${pwFmt(iname.textContent)} })${role && name ? `.getByRole(${pwFmt(role)}, { name: ${pwFmt(name)} })` : dt ? `.getByTestId(${pwFmt(dt)})` : ''}`);
  if (dt) c.push(`page.getByTestId(${pwFmt(dt)})`);
  if (el.id) c.push(`page.locator(${pwFmt('#' + el.id)})`);
  const one = s => { try { const r = pwResolve(pwParseLoc(s), root); return r.length === 1 && r[0] === el; } catch (e) { return false; } };
  return [...new Set(c)].filter(one).slice(0, 3);
}
// ---- the language: tokens, a statement parser for test files, an evaluator over page / locator / expect objects
function pwLex(src) {
  const T = [], n = src.length; let i = 0, line = 1;
  const reOk = () => { const t = T[T.length - 1]; return !t || (t.t === 'p' && '(,=:[{;'.includes(t.v)) || (t.t === 'id' && /^(return|await)$/.test(t.v)); };
  while (i < n) {
    const c = src[i];
    if (c === '\n') { line++; i++; continue; }
    if (/\s/.test(c)) { i++; continue; }
    if (src.startsWith('//', i)) { while (i < n && src[i] !== '\n') i++; continue; }
    if (src.startsWith('/*', i)) { const j = src.indexOf('*/', i + 2); if (j < 0) throw PwErr('SyntaxError: şərh bağlanmayıb — */ yoxdur', '', line); line += src.slice(i, j).split('\n').length - 1; i = j + 2; continue; }
    if (c === "'" || c === '"' || c === '`') {
      const l0 = line; let j = i + 1, s = '';
      for (; j < n && src[j] !== c; j++) {
        if (src[j] === '\\') { const x = src[++j]; s += { n: '\n', t: '\t' }[x] || x || ''; continue; }
        if (src[j] === '\n') { if (c !== '`') throw PwErr('SyntaxError: mətn (string) bağlanmayıb', `Mətn ${c} ilə açılıb: eyni sətirdə ${c} ilə bağla.`, l0); line++; }
        if (c === '`' && src[j] === '$' && src[j + 1] === '{') throw PwErr('SyntaxError: ${…} bu məşqdə dəstəklənmir', 'Mətni dırnaq içində olduğu kimi yaz.', line);
        s += src[j];
      }
      if (j >= n) throw PwErr('SyntaxError: mətn (string) bağlanmayıb', `${c} ilə açılan mətnin sonunda ${c} yoxdur.`, l0);
      T.push({ t: 'str', v: s, line: l0 }); i = j + 1; continue;
    }
    if (c === '/' && reOk()) {
      let j = i + 1, cls = false;
      for (; j < n && (src[j] !== '/' || cls) && src[j] !== '\n'; j++) { if (src[j] === '\\') j++; else if (src[j] === '[') cls = true; else if (src[j] === ']') cls = false; }
      if (src[j] !== '/') throw PwErr('SyntaxError: regex bağlanmayıb', 'Regex /…/ kimi yazılır, məsələn: /inventory/', line);
      let k = j + 1; while (k < n && /[a-z]/.test(src[k])) k++;
      let re; try { re = new RegExp(src.slice(i + 1, j), src.slice(j + 1, k)); } catch (e) { throw PwErr('SyntaxError: regex düzgün deyil — ' + e.message, '', line); }
      T.push({ t: 're', v: re, line }); i = k; continue;
    }
    if (/[0-9]/.test(c) || (c === '-' && /[0-9]/.test(src[i + 1] || '') && reOk())) { const m = /^-?\d+(\.\d+)?/.exec(src.slice(i)); T.push({ t: 'num', v: +m[0], line }); i += m[0].length; continue; }
    if (/[A-Za-z_$]/.test(c)) { const m = /^[\w$]+/.exec(src.slice(i)); T.push({ t: 'id', v: m[0], line }); i += m[0].length; continue; }
    if (src.startsWith('=>', i)) { T.push({ t: 'p', v: '=>', line }); i += 2; continue; }
    if ('(){}[],;.:='.includes(c)) { T.push({ t: 'p', v: c, line }); i++; continue; }
    throw PwErr(`SyntaxError: gözlənilməz simvol «${c}»`, '', line);
  }
  return T;
}
function pwParser(T) {
  let i = 0;
  const peek = (o = 0) => T[i + o] || { t: 'eof', v: '', line: T.length ? T[T.length - 1].line : 1 };
  const is = (t, v, o) => { const k = peek(o); return k.t === t && (v === undefined || k.v === v); };
  const opt = (t, v) => { if (is(t, v)) { i++; return true; } return false; };
  const eat = (t, v, what) => {
    const k = peek();
    if (k.t !== t || (v !== undefined && k.v !== v)) throw PwErr(`SyntaxError: ${what || `«${v}»`} gözlənilirdi, ${k.t === 'eof' ? 'amma kod bitdi' : `«${k.t === 'str' ? `'${k.v}'` : k.v}» gəldi`}`,
      v === ')' || v === '}' ? 'Mötərizələri say: hər açılan mötərizənin bağlanan cütü olmalıdır.' : '', k.line);
    i++; return k;
  };
  function primary() {
    const k = peek();
    if (k.t === 'str' || k.t === 'num' || k.t === 're') { i++; return { t: 'lit', v: k.v, line: k.line }; }
    if (k.t === 'id') {
      i++;
      if (k.v === 'true' || k.v === 'false') return { t: 'lit', v: k.v === 'true', line: k.line };
      if (k.v === 'null' || k.v === 'undefined') return { t: 'lit', v: k.v === 'null' ? null : undefined, line: k.line };
      if (k.v === 'new') throw PwErr('SyntaxError: «new» bu məşqdə dəstəklənmir', 'Page Object class-ları (19.7) burada yoxdur: lokatorları birbaşa testdə yaz.', k.line);
      if (k.v === 'await') throw PwErr('SyntaxError: await sətrin əvvəlində olmalıdır', 'Məsələn: await page.getByRole(…).click(); və ya const n = await lokator.count();', k.line);
      if (k.v === 'async' || k.v === 'function') throw PwErr('SyntaxError: funksiya bu məşqdə yalnız test(…) daxilində ola bilər', '', k.line);
      return { t: 'id', name: k.v, line: k.line };
    }
    if (opt('p', '(')) { const e = expr(); eat('p', ')'); return e; }
    if (opt('p', '{')) {
      const props = [];
      while (!is('p', '}')) { const key = peek(); if (key.t !== 'id' && key.t !== 'str') throw PwErr(`SyntaxError: obyektdə açar (məsələn, name) gözlənilirdi, «${key.v}» gəldi`, '', key.line); i++; eat('p', ':'); props.push([key.v, expr()]); if (!opt('p', ',')) break; }
      eat('p', '}'); return { t: 'obj', props, line: k.line };
    }
    if (opt('p', '[')) { const items = []; while (!is('p', ']')) { items.push(expr()); if (!opt('p', ',')) break; } eat('p', ']'); return { t: 'arr', items, line: k.line }; }
    throw PwErr(`SyntaxError: gözlənilməz «${k.v || 'son'}»`, '', k.line);
  }
  function expr() {
    let n = primary();
    for (;;) {
      if (opt('p', '.')) { const id = eat('id', undefined, 'metodun adı'); n = { t: 'mem', obj: n, name: id.v, line: id.line }; }
      else if (is('p', '(')) { const line = peek().line; i++; const args = []; while (!is('p', ')')) { args.push(expr()); if (!opt('p', ',')) break; } eat('p', ')'); n = { t: 'call', fn: n, args, line }; }
      else if (is('p', '[')) { i++; const ix = expr(); eat('p', ']'); n = { t: 'idx', obj: n, ix, line: ix.line }; }
      else return n;
    }
  }
  function stmt() {
    const k = peek();
    if (opt('p', ';')) return null;
    let s;
    if (is('id', 'const') || is('id', 'let') || is('id', 'var')) { i++; const name = eat('id', undefined, 'dəyişənin adı'); eat('p', '='); const aw = opt('id', 'await'); s = { k: 'let', name: name.v, aw, e: expr() }; }
    else { const aw = opt('id', 'await'); s = { k: 'do', aw, e: expr() }; }
    s.line = k.line; s.end = T[i - 1].line; opt('p', ';');
    return s;
  }
  function block() { eat('p', '{'); const body = []; while (!is('p', '}')) { if (is('eof')) throw PwErr('SyntaxError: «}» gözlənilirdi, amma kod bitdi', 'Mötərizələri say: hər { üçün bir } olmalıdır.', peek().line); const s = stmt(); if (s) body.push(s); } eat('p', '}'); return body; }
  function pageFn() { eat('id', 'async', '«async»'); eat('p', '('); eat('p', '{'); eat('id', 'page', '«page»'); eat('p', '}'); eat('p', ')'); eat('p', '=>'); return block(); }
  const prog = { tests: [], before: [] };
  function top(inGroup) {
    while (!is('eof') && !(inGroup && is('p', '}'))) {
      if (opt('p', ';')) continue;
      const k = peek();
      if (opt('id', 'import')) { while (!is('str')) { if (is('eof')) throw PwErr('SyntaxError: import sətri natamamdır', "import { test, expect } from '@playwright/test';", k.line); i++; } i++; opt('p', ';'); continue; }
      if (is('id', 'const') && is('p', '{', 1)) { while (!is('p', ')')) { if (is('eof')) throw PwErr('SyntaxError: require sətri natamamdır', '', k.line); i++; } i++; opt('p', ';'); continue; }
      if (opt('id', 'test')) {
        const mod = opt('p', '.') ? eat('id', undefined, 'test-in metodu').v : '';
        eat('p', '(');
        if (mod === 'beforeEach') { prog.before.push(...pageFn()); eat('p', ')'); opt('p', ';'); continue; }
        if (mod === 'describe') { eat('str', undefined, 'qrupun adı'); eat('p', ','); opt('id', 'async'); eat('p', '('); eat('p', ')'); eat('p', '=>'); eat('p', '{'); top(true); eat('p', '}'); eat('p', ')'); opt('p', ';'); continue; }
        if (mod && mod !== 'only' && mod !== 'skip') throw PwErr(`SyntaxError: test.${mod} bu məşqdə dəstəklənmir`, 'Dəstəklənir: test, test.describe, test.beforeEach, test.only, test.skip.', k.line);
        const name = eat('str', undefined, 'testin adı (mətn)'); eat('p', ',');
        const body = pageFn(); eat('p', ')'); opt('p', ';');
        prog.tests.push({ name: name.v, line: k.line, body, only: mod === 'only', skip: mod === 'skip' });
        continue;
      }
      throw PwErr(`SyntaxError: gözlənilməz «${k.v}»`, "Kod test('ad', async ({ page }) => { … }); içində olmalıdır.", k.line);
    }
  }
  return { prog, top, expr, done: () => is('eof'), rest: () => peek() };
}
const PW_SMART = /[“”„‘’]/;
const pwPlain = s => s.replace(/[“”„]/g, '"').replace(/[‘’]/g, "'"); // a phone keyboard's quotes
function pwParse(src) { const P = pwParser(pwLex(pwPlain(src))); P.top(false); return P.prog; }
// one expression on its own (the locator practice): a locator, nothing that acts
function pwParseLoc(src) {
  const P = pwParser(pwLex(pwPlain(src.trim().replace(/^await\s+/, '').replace(/;\s*$/, ''))));
  const e = P.expr(); if (!P.done()) throw PwErr(`SyntaxError: lokatordan sonra artıq «${P.rest().v}»`, '', 1);
  const v = pwEval(e, { vars: {}, locOnly: true });
  if (!v || !v.$loc) throw PwErr('Bu, lokator deyil', "Lokator page.getBy… və ya page.locator(…) ilə başlayır: page.getByRole('button', { name: 'Login' })", 1);
  return v;
}
const PW_PAGE = { $page: 1 }, PW_EXPECT = { $fn: 'expect' }, PW_CONSOLE = { $console: 1 }, PW_KEYS = { $keys: 1 };
const PW_Q = ['getByRole', 'getByText', 'getByLabel', 'getByPlaceholder', 'getByTestId', 'locator'];
const PW_PAGE_M = PW_Q.concat(['goto', 'url', 'title', 'reload', 'waitForTimeout', 'waitForURL', 'waitForLoadState', 'click', 'fill', 'screenshot', 'pause']);
const PW_LOC_M = PW_Q.concat(['filter', 'first', 'last', 'nth', 'click', 'dblclick', 'fill', 'clear', 'press', 'pressSequentially', 'type', 'selectOption', 'check', 'uncheck', 'hover', 'focus',
  'textContent', 'innerText', 'inputValue', 'getAttribute', 'count', 'isVisible', 'isHidden', 'waitFor']);
const PW_MATCH_L = ['toBeVisible', 'toBeHidden', 'toHaveText', 'toContainText', 'toHaveCount', 'toHaveValue', 'toBeEnabled', 'toBeDisabled', 'toHaveAttribute', 'toBeEmpty'];
const PW_MATCH_P = ['toHaveURL', 'toHaveTitle'];
const PW_MATCH_V = ['toBe', 'toEqual', 'toContain', 'toBeTruthy', 'toBeFalsy', 'toBeGreaterThan', 'toBeLessThan', 'toHaveLength', 'toMatch'];
const PW_ASYNC = new Set(['goto', 'reload', 'waitForTimeout', 'waitForURL', 'waitForLoadState', 'title', 'screenshot', 'pause', 'click', 'dblclick', 'fill', 'clear', 'press', 'pressSequentially', 'type',
  'selectOption', 'check', 'uncheck', 'hover', 'focus', 'textContent', 'innerText', 'inputValue', 'getAttribute', 'count', 'isVisible', 'isHidden', 'waitFor'].concat(PW_MATCH_L, PW_MATCH_P));
const PW_NOPE = ['getByAltText', 'getByTitle', 'frameLocator', '$', '$$', 'evaluate', 'waitForSelector', 'setViewportSize', 'route', 'mouse', 'context', 'and', 'or', 'all'];
function pwLev(a, b) { const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; }
function pwNear(w, list) { let best = null, bd = 3; list.forEach(x => { const d = pwLev(w.toLowerCase(), x.toLowerCase()); if (d < bd) { bd = d; best = x; } }); return best; }
const pwSrc = n => n.t === 'id' ? n.name : n.t === 'mem' ? `${pwSrc(n.obj)}.${n.name}` : n.t === 'call' ? `${pwSrc(n.fn)}(…)` : '…';
function pwMember(o, name, n) {
  const list = o === PW_PAGE ? PW_PAGE_M : o && o.$loc ? PW_LOC_M : o && o.$expect ? PW_MATCH_L.concat(PW_MATCH_P, PW_MATCH_V) : o === PW_CONSOLE ? ['log', 'info', 'error'] : o === PW_KEYS ? ['press', 'type'] : null;
  if (o === PW_PAGE && name === 'keyboard') return PW_KEYS;
  if (o && o.$expect && name === 'not') return Object.assign({}, o, { not: !o.not });
  if (list) {
    if (list.includes(name)) return { $m: name, self: o };
    if (PW_NOPE.includes(name)) throw PwErr(`Error: ${name} bu kitabın modelində yoxdur`, 'Dəstəklənən lokatorlar: getByRole, getByText, getByLabel, getByPlaceholder, getByTestId, locator; filter, first, last, nth.', n.line);
    const near = pwNear(name, list);
    throw PwErr(`TypeError: ${pwSrc(n.obj)}.${name} is not a function`, near ? `Bəlkə ${near}?` : 'Metodun adını yoxla: böyük-kiçik hərf fərqlidir.', n.line);
  }
  if (o == null) throw PwErr(`TypeError: Cannot read properties of ${o} (reading '${name}')`, '', n.line);
  if (name === 'length' && (typeof o === 'string' || Array.isArray(o))) return o.length;
  throw PwErr(`TypeError: ${pwSrc(n.obj)}.${name} — bu modeldə yoxdur`, '', n.line);
}
function pwEval(n, env) {
  switch (n.t) {
    case 'lit': return n.v;
    case 'arr': return n.items.map(x => pwEval(x, env));
    case 'obj': { const o = {}; n.props.forEach(([k, v]) => { o[k] = pwEval(v, env); }); return o; }
    case 'id':
      if (Object.prototype.hasOwnProperty.call(env.vars, n.name)) return env.vars[n.name];
      if (n.name === 'page') return PW_PAGE;
      if (n.name === 'expect') return PW_EXPECT;
      if (n.name === 'console') return PW_CONSOLE;
      throw PwErr(`ReferenceError: ${n.name} is not defined`, (h => h ? `Bəlkə ${h}?` : 'Dəyişəni əvvəlcə const ilə yarat.')(pwNear(n.name, ['page', 'expect', 'console'].concat(Object.keys(env.vars)))), n.line);
    case 'mem': return pwMember(pwEval(n.obj, env), n.name, n);
    case 'idx': { const o = pwEval(n.obj, env), k = pwEval(n.ix, env); return o == null ? undefined : o[k]; }
    case 'call': {
      const f = pwEval(n.fn, env), args = n.args.map(a => pwEval(a, env));
      if (f === PW_EXPECT) return { $expect: 1, v: args[0], not: false };
      if (f && f.$m) return pwCall(f.self, f.$m, args, n, env);
      throw PwErr(`TypeError: ${pwSrc(n.fn)} is not a function`, '', n.line);
    }
  }
  return undefined;
}
const PW_OPT = { getByRole: ['name', 'exact', 'level'], getByText: ['exact'], getByLabel: ['exact'], getByPlaceholder: ['exact'], locator: ['hasText', 'hasNotText'], filter: ['hasText', 'hasNotText', 'has'] };
function pwCheckOpts(m, o, line) {
  if (o === undefined) return;
  if (!o || typeof o !== 'object' || o.$loc) throw PwErr(`Error: ${m}: ikinci arqument obyekt olmalıdır`, `Məsələn: ${m}(…, { ${(PW_OPT[m] || ['exact'])[0]}: … })`, line);
  const bad = Object.keys(o).find(k => !(PW_OPT[m] || []).includes(k));
  if (bad) throw PwErr(`Error: ${m}: «${bad}» seçimi bu modeldə yoxdur`, `Dəstəklənir: ${(PW_OPT[m] || []).join(', ') || '—'}.`, line);
}
// a new locator: from the page or scoped to a locator
function pwQueryStep(m, a, line) {
  const s = a[0], o = a[1];
  if (m === 'getByRole') {
    if (typeof s !== 'string') throw PwErr("Error: getByRole: rol mətn olmalıdır, məsələn 'button'", '', line);
    pwCheckOpts(m, o, line);
    return { k: 'role', role: s, name: o && o.name, exact: o && o.exact, level: o && o.level };
  }
  if (typeof s !== 'string' && !(s instanceof RegExp)) throw PwErr(`Error: ${m}: arqument mətn və ya regex olmalıdır`, '', line);
  if (m === 'getByTestId') return { k: 'testid', v: s };
  pwCheckOpts(m, o, line);
  return { k: { getByText: 'text', getByLabel: 'label', getByPlaceholder: 'ph', locator: 'css' }[m], v: s, exact: o && o.exact };
}
function pwChild(base, m, a, line) {
  const desc = (base ? base.desc + '.' : '') + `${m}(${a.map(pwFmt).join(', ')})`, steps = base ? base.steps.slice() : [];
  if (PW_Q.includes(m)) {
    steps.push(pwQueryStep(m, a, line));
    if (m === 'locator' && a[1]) steps.push({ k: 'filter', has: a[1].hasText, hasNot: a[1].hasNotText });
  } else if (m === 'filter') {
    pwCheckOpts(m, a[0], line);
    if (a[0].has && !a[0].has.$loc) throw PwErr('Error: filter: has lokator olmalıdır', '', line);
    steps.push({ k: 'filter', has: a[0].hasText, hasNot: a[0].hasNotText, inner: a[0].has });
  } else steps.push({ k: 'nth', i: m === 'first' ? 0 : m === 'last' ? -1 : +a[0] });
  return pwLoc(steps, desc);
}
function pwCall(self, m, a, n, env) {
  const line = n.line;
  if (self === PW_CONSOLE) { if (!env.locOnly) env.out.push(a.map(x => typeof x === 'string' ? x : x && x.$loc ? `locator('${x.desc}')` : JSON.stringify(x)).join(' ')); return undefined; }
  const isQ = PW_Q.includes(m) || ((m === 'filter' || m === 'first' || m === 'last' || m === 'nth') && self.$loc);
  if (isQ) return pwChild(self === PW_PAGE ? null : self, m, a, line);
  if (env.locOnly) throw PwErr(`Burada yalnız lokator yaz: ${m}() hərəkət və ya yoxlamadır`, 'Hərəkəti (click, fill) və yoxlamanı «Test yaz» bölməsində et.', line);
  if (self.$expect) return pwAssert(self, m, a, line, env);
  if (self === PW_KEYS) { // the keyboard acts on the field that has the focus
    if (m === 'press' && a[0] === 'Enter' && env.focus && env.st) smApply(env.st, { ev: env.st.page === 'login' ? 'login' : 'continue' }, env.found);
    if (m === 'type' && env.focus && env.st) smFill(env.st, env.focus, (env.st.f[env.focus] || '') + String(a[0]), env.found);
    return undefined;
  }
  if (self === PW_PAGE) {
    switch (m) {
      case 'goto': pwGoto(env, a[0], line); return null;
      case 'url': return pwUrl(env);
      case 'title': return env.st ? 'Mini Store' : '';
      case 'reload': if (env.st) { env.st.menu = false; env.st.err = ''; } return null;
      case 'waitForTimeout': env.wait += +a[0] || 0; return undefined;
      case 'waitForURL': if (!(a[0] instanceof RegExp ? a[0].test(pwUrl(env)) : pwUrl(env) === a[0])) throw PwErr(`Error: page.waitForURL: Timeout 30000ms exceeded.\n=========================== logs ===========================\nwaiting for navigation to ${pwFmt(a[0])}`, 'Səhifə gözlənilən URL-ə keçmədi.', line); return undefined;
      case 'click': case 'fill': return pwAct(env, pwChild(null, 'locator', [a[0]], line), m, a.slice(1), line); // the old page.click(selector) form
      default: return undefined; // waitForLoadState, screenshot, pause: nothing to do in this model
    }
  }
  // a locator: an action or a read
  if (!env.st) throw PwErr(`Error: locator.${m}: Test timeout of 30000ms exceeded.\nCall log:\n  - waiting for ${self.desc}`, 'Səhifə hələ açılmayıb: əvvəlcə await page.goto(…) yaz.', line);
  if (['textContent', 'innerText', 'inputValue', 'getAttribute', 'count', 'isVisible', 'isHidden'].includes(m)) return pwRead(env, self, m, a, line);
  if (m === 'waitFor') { const st = (a[0] && a[0].state) || 'visible', k = pwResolve(self, pwDom(env.st)).length; if ((st === 'visible' || st === 'attached') !== (k > 0)) throw Object.assign(PwErr(`Error: locator.waitFor: Timeout 30000ms exceeded.\nCall log:\n  - waiting for ${self.desc} to be ${st}`, '', line), { ms: 30000 }); return undefined; }
  return pwAct(env, self, m, a, line);
}
const pwUrl = env => env.st ? env.origin + TR_URL[env.st.page] : 'about:blank';
function pwGoto(env, url, line) {
  let u; try { u = new URL(String(url)); } catch (e) { throw PwErr('Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL', 'URL tam yazılmalıdır, protokolla birlikdə: https://www.saucedemo.com/', line); }
  if (!PW_HOSTS.includes(u.hostname)) throw PwErr(`Error: page.goto: net::ERR_NAME_NOT_RESOLVED at ${url}`, 'Bu məşqdə yalnız Mini Store (saucedemo.com-un modeli) açılır: https://www.saucedemo.com/', line);
  const page = Object.keys(TR_URL).find(k => TR_URL[k] === u.pathname);
  if (!page) throw PwErr(`Error: page.goto: 404 Not Found — ${u.pathname}`, `Modeldə belə səhifə yoxdur. Səhifələr: ${Object.values(TR_URL).join(', ')}`, line);
  env.origin = u.origin;
  if (!env.st) env.st = smFresh({ page: 'login' });
  if (page === 'login') { Object.assign(env.st, { page: 'login', err: '', menu: false }); Object.assign(env.st.f, { user: '', pass: '' }); }
  else if (!env.st.user) Object.assign(env.st, { page: 'login', err: `Epic sadface: You can only access '${u.pathname}' when you are logged in.` }); // as on saucedemo
  else Object.assign(env.st, { page, err: '', menu: false });
}
// exactly one element, as Playwright's strict mode wants for actions and most assertions
function pwOne(loc, root, what, line, found) {
  const els = found || pwResolve(loc, root);
  if (els.length === 1) return els[0];
  if (!els.length) throw Object.assign(PwErr(`Error: ${what}: Test timeout of 30000ms exceeded.\nCall log:\n  - waiting for ${loc.desc}`,
    'Lokator heç bir element tapmadı. Bu səhifədə belə element varmı? Mətni, rolu və hərfləri yoxla — «Lokator məşqi»ndə sına.', line), { ms: 30000 });
  throw pwStrict(what, loc, els, root, line);
}
function pwStrict(what, loc, els, root, line) {
  const list = els.slice(0, 5).map((el, i) => { const b = pwBest(el, root)[0]; return `    ${i + 1}) ${pwOuter(el)}${b ? ' aka ' + b.replace(/^page\./, '') : ''}`; }).join('\n');
  return PwErr(`Error: ${what}: Error: strict mode violation: ${loc.desc} resolved to ${els.length} elements:\n${list}${els.length > 5 ? `\n    …and ${els.length - 5} more` : ''}`,
    `Lokator ${els.length} element tapdı, Playwright isə hansını götürəcəyini bilmir (strict mode). Lokatoru birmənalı et: məhsulun kartını .filter({ hasText: … }) ilə seç, dəqiq ad yaz və ya getByTestId işlət.`, line);
}
function pwAct(env, loc, m, a, line) {
  const root = pwDom(env.st), els = pwResolve(loc, root);
  els.forEach(e => e.classList.add('pw-hl')); env.snap = root.innerHTML; // the trace's "before": the target, or every match in strict mode
  const el = pwOne(loc, root, 'locator.' + m, line, els), st = env.st, f = el.dataset.smF;
  if (m === 'click' || m === 'dblclick') {
    if (el.dataset.act === 'sm') smApply(st, Object.assign({ ev: el.dataset.e }, el.dataset.item ? { item: el.dataset.item, where: el.dataset.where } : {}), env.found);
    env.focus = f || null;
  } else if (m === 'fill' || m === 'pressSequentially' || m === 'type' || m === 'clear') {
    if (!f) throw PwErr(`Error: locator.${m}: Error: Element is not an <input>, <textarea> or [contenteditable] element`, `${m}() yalnız mətn sahəsinə yazır: lokator sahəni tapmalıdır, ${pwOuter(el)} isə sahə deyil.`, line);
    if (m !== 'clear' && typeof a[0] !== 'string') throw PwErr(`Error: locator.${m}: value: expected string, got ${a[0] === undefined ? 'undefined' : typeof a[0]}`, "Yazılacaq mətni dırnaqda ver: .fill('standard_user')", line);
    smFill(st, f, m === 'clear' ? '' : m === 'fill' ? a[0] : (st.f[f] || '') + a[0], env.found); env.focus = f;
  } else if (m === 'press') {
    if (a[0] === 'Enter' && f) smApply(st, { ev: st.page === 'login' ? 'login' : 'continue' }, env.found); // Enter submits the form, as on the site
    env.focus = f || null;
  } else if (m === 'selectOption') {
    if (el.tagName !== 'SELECT') throw PwErr('Error: locator.selectOption: Error: Element is not a <select> element', 'selectOption() açılan siyahı (select) üçündür.', line);
    const w = a[0], o = [...el.options].find(x => w && typeof w === 'object' ? x.value === w.value || x.textContent === w.label : x.value === w || x.textContent === w);
    if (!o) throw PwErr('Error: locator.selectOption: did not find some options', `Seçimlər: ${[...el.options].map(x => `'${x.value}' (${x.textContent})`).join(', ')}`, line);
    smApply(st, { ev: 'sort', v: o.value }, env.found);
  } else if (m === 'check' || m === 'uncheck') throw PwErr(`Error: locator.${m}: Error: Not a checkbox or radio button`, `${m}() yalnız checkbox və radio düymələri üçündür.`, line);
  else if (m === 'focus') env.focus = f || null;
  return undefined;
}
function pwRead(env, loc, m, a, line) {
  const root = pwDom(env.st), els = pwResolve(loc, root);
  els.forEach(e => e.classList.add('pw-hl')); env.snap = root.innerHTML;
  if (m === 'count') return els.length;
  if (m === 'isVisible' || m === 'isHidden') { if (els.length > 1) throw pwStrict('locator.' + m, loc, els, root, line); return m === 'isVisible' ? els.length === 1 : !els.length; }
  const el = pwOne(loc, root, 'locator.' + m, line, els);
  if (m === 'textContent') return el.textContent;
  if (m === 'innerText') return pwNorm(el.textContent);
  if (m === 'getAttribute') return el.getAttribute(a[0]);
  if (el.dataset.smF) return env.st.f[el.dataset.smF];
  if (el.tagName === 'SELECT') return env.st.sort;
  throw PwErr('Error: locator.inputValue: Error: Node is not an <input>, <textarea> or <select> element', '', line);
}
const pwQ = v => v instanceof RegExp ? String(v) : JSON.stringify(v);
// web-first assertions: on the page, on a locator (strict for one element), plain value checks
function pwAssert(x, m, a, line, env) {
  const t = x.v, neg = x.not, mm = (neg ? 'not.' : '') + m, exp = a[0];
  const full = (v, s) => v instanceof RegExp ? v.test(s) : pwNorm(s) === pwNorm(v);
  const fail = (head, body, hint) => { throw Object.assign(PwErr(`Error: ${head}\n\n${body}`, hint, line), { ms: 5000, matcher: m }); };
  if (t === PW_PAGE) {
    if (!PW_MATCH_P.includes(m)) throw PwErr(`Error: expect(page).${m} — page üçün bu yoxlama yoxdur`, 'page üçün: toHaveURL, toHaveTitle. Element üçün expect(lokator) yaz.', line);
    const got = m === 'toHaveURL' ? pwUrl(env) : env.st ? 'Mini Store' : '';
    env.snap = env.st ? pwDom(env.st).innerHTML : null;
    if ((exp instanceof RegExp ? exp.test(got) : got === exp) === neg)
      fail(`Timed out 5000ms waiting for expect(page).${mm}(expected)`, `Expected ${exp instanceof RegExp ? 'pattern' : 'string'}: ${pwQ(exp)}\nReceived string: "${got}"`,
        m === 'toHaveTitle' && exp === 'Swag Labs' ? 'Bu modelin səhifə başlığı «Mini Store»-dur (real saytda «Swag Labs»).' : m === 'toHaveURL' ? 'URL gözləniləndən fərqlidir: səhifə dəyişməyib və ya başqa səhifə açılıb. Trace-də addımın ekranına bax.' : '');
    return undefined;
  }
  if (t && t.$loc) {
    if (!PW_MATCH_L.includes(m)) throw PwErr(`Error: expect(locator).${m} — lokator üçün bu yoxlama yoxdur`, `Lokator üçün: ${PW_MATCH_L.join(', ')}.`, line);
    if (!env.st) fail(`Timed out 5000ms waiting for expect(locator).${mm}()`, `Locator: ${t.desc}\nExpected: ${m}\nReceived: <element(s) not found>`, 'Səhifə hələ açılmayıb: əvvəlcə await page.goto(…) yaz.');
    const root = pwDom(env.st), els = pwResolve(t, root);
    els.forEach(el => el.classList.add('pw-hl')); env.snap = root.innerHTML;
    if (m !== 'toHaveCount' && !(m === 'toHaveText' && Array.isArray(exp)) && els.length > 1) throw Object.assign(pwStrict(`expect.${mm}`, t, els, root, line), { ms: 5000 });
    const el = els[0], text = el ? pwNorm(pwTextOf(el)) : null, nf = '<element(s) not found>';
    const val = el ? (el.dataset.smF ? env.st.f[el.dataset.smF] : el.tagName === 'SELECT' ? env.st.sort : el.getAttribute('value') || '') : null;
    let pass, e1, r1, hint = '';
    switch (m) {
      case 'toBeVisible': pass = !!el; e1 = `Expected: ${neg ? 'not visible' : 'visible'}`; r1 = `Received: ${el ? 'visible' : nf}`; hint = el ? 'Element ekranda görünür.' : 'Element ekranda yoxdur: lokatoru və səhifəni yoxla (trace addımın anındakı ekranı göstərir).'; break;
      case 'toBeHidden': pass = !el; e1 = `Expected: ${neg ? 'visible' : 'hidden'}`; r1 = `Received: ${el ? 'visible' : 'hidden'}`; hint = 'Element hələ ekrandadır.'; break;
      case 'toHaveText': case 'toContainText':
        if (Array.isArray(exp)) { const got = els.map(e => pwNorm(pwTextOf(e))); pass = got.length === exp.length && exp.every((v, i) => full(v, got[i])); e1 = `Expected: ${JSON.stringify(exp)}`; r1 = `Received: ${JSON.stringify(got)}`; break; }
        pass = !!el && (m === 'toHaveText' ? full(exp, text) : exp instanceof RegExp ? exp.test(text) : text.includes(pwNorm(exp)));
        e1 = `Expected ${exp instanceof RegExp ? 'pattern' : m === 'toHaveText' ? 'string' : 'substring'}: ${pwQ(exp)}`; r1 = el ? `Received string: "${text}"` : `Received: ${nf}`;
        hint = !el ? 'Element tapılmadı: ya lokator səhvdir, ya da element bu səhifədə yoxdur (bəlkə bug?).' : m === 'toHaveText' ? 'toHaveText bütün mətni tutuşdurur, böyük-kiçik hərf də fərqlidir. Hissə üçün toContainText işlət, mətni ekrandan olduğu kimi köçür.' : 'Gözlənilən hissə mətndə yoxdur (böyük-kiçik hərf fərqlidir).';
        break;
      case 'toHaveCount': pass = els.length === exp; e1 = `Expected: ${exp}`; r1 = `Received: ${els.length}`; hint = 'Elementlərin sayı fərqlidir.'; break;
      case 'toHaveValue': pass = !!el && full(exp, val); e1 = `Expected ${exp instanceof RegExp ? 'pattern' : 'string'}: ${pwQ(exp)}`; r1 = el ? `Received string: "${val}"` : `Received: ${nf}`; hint = 'Sahənin dəyəri fərqlidir.'; break;
      case 'toBeEnabled': case 'toBeDisabled': pass = !!el && (m === 'toBeEnabled') === !el.disabled; e1 = `Expected: ${m === 'toBeEnabled' ? 'enabled' : 'disabled'}`; r1 = `Received: ${el ? (el.disabled ? 'disabled' : 'enabled') : nf}`; break;
      case 'toHaveAttribute': pass = !!el && el.hasAttribute(exp) && (a[1] === undefined || full(a[1], el.getAttribute(exp))); e1 = `Expected: ${exp}${a[1] === undefined ? '' : '=' + pwQ(a[1])}`; r1 = `Received: ${el ? (el.hasAttribute(exp) ? pwQ(el.getAttribute(exp)) : 'no attribute') : nf}`; break;
      case 'toBeEmpty': pass = !!el && (el.dataset.smF ? !val : !text); e1 = 'Expected: empty'; r1 = `Received: ${el ? pwQ(el.dataset.smF ? val : text) : nf}`; break;
    }
    if (pass === neg) fail(`Timed out 5000ms waiting for expect(locator).${mm}(${['toBeVisible', 'toBeHidden', 'toBeEnabled', 'toBeDisabled', 'toBeEmpty'].includes(m) ? '' : 'expected'})`, `Locator: ${t.desc}\n${e1}\n${r1}`, neg ? 'not ilə yoxlama tərsinə işləyir: şərt doğru olmamalı idi.' : hint);
    return undefined;
  }
  if (!PW_MATCH_V.includes(m)) throw PwErr(`Error: expect(value).${m} — bu yoxlama dəyər üçün deyil`, PW_MATCH_L.includes(m) ? `${m} lokator üçündür: expect(page.getBy…(…)).${m}(…) yaz.` : '', line);
  const eq = (p, q) => JSON.stringify(p) === JSON.stringify(q);
  const pass = { toBe: () => Object.is(t, exp), toEqual: () => eq(t, exp), toContain: () => t != null && t.includes && t.includes(exp), toBeTruthy: () => !!t, toBeFalsy: () => !t,
    toBeGreaterThan: () => t > exp, toBeLessThan: () => t < exp, toHaveLength: () => t != null && t.length === exp, toMatch: () => exp instanceof RegExp ? exp.test(t) : String(t).includes(exp) }[m]();
  if (pass === neg) throw Object.assign(PwErr(`Error: expect(received).${mm}(expected)${m === 'toBe' ? ' // Object.is equality' : ''}\n\nExpected: ${neg ? 'not ' : ''}${JSON.stringify(exp)}\nReceived: ${JSON.stringify(t)}`,
    'Bu yoxlama dəyəri bir dəfə tutuşdurur, gözləmir. Element üçün web-first yoxlama daha etibarlıdır: await expect(lokator).toHaveText(…).', line), { matcher: m });
  return undefined;
}
// ---- running: lint first (as eslint-plugin-playwright would), then each test in a fresh page; every statement is a trace step
const pwRoot = e => e.t === 'call' ? pwRoot(e.fn) : e.t === 'mem' ? pwRoot(e.obj) : e.t === 'id' ? e.name : '';
const pwLast = e => e.t === 'call' && e.fn.t === 'mem' ? e.fn.name : '';
function pwLint(prog, src) {
  const L = [];
  const walk = body => body.forEach(s => {
    const m = pwLast(s.e), r = pwRoot(s.e);
    if (m && PW_ASYNC.has(m) && !s.aw && !(r === 'expect' && PW_MATCH_V.includes(m)))
      L.push({ err: 1, line: s.line, msg: `await yoxdur (playwright/missing-playwright-await)`, hint: `${m}() Promise qaytarır: await olmadan Playwright onu gözləmir və növbəti sətir hərəkət bitməmiş işləyir — test bəzən keçir, bəzən düşür (flaky, 19.9).` });
    if (m === 'waitForTimeout') L.push({ line: s.line, msg: 'Sabit gözləmə: waitForTimeout (19.8)', hint: 'Playwright elementi özü gözləyir (auto-waiting). Şərti gözləmək lazımdırsa, expect(…) işlət.' });
  });
  walk(prog.before);
  prog.tests.forEach(t => { walk(t.body); if (!t.body.concat(prog.before).some(s => pwRoot(s.e) === 'expect')) L.push({ line: t.line, msg: 'Testdə yoxlama (expect) yoxdur', hint: 'expect olmayan test heç nəyi yoxlamır: xəta olsa da keçəcək (19.8).' }); });
  if (!prog.tests.length) L.push({ err: 1, line: 1, msg: 'test(…) tapılmadı', hint: "Kodu test('ad', async ({ page }) => { … }); içində yaz." });
  const smart = src.split('\n').findIndex(l => PW_SMART.test(l));
  if (smart >= 0) L.push({ line: smart + 1, msg: 'Ağıllı dırnaqlar adi dırnağa çevrildi', hint: '“ ” və ‘ ’ real faylda SyntaxError verir: kodda \' və ya " işlət.' });
  return L.sort((p, q) => p.line - q.line);
}
function pwRunTest(t, before, lines) {
  const env = { st: null, origin: '', vars: {}, out: [], found: {}, focus: null, snap: null, wait: 0 }, steps = [];
  let err = null, ms = 0;
  for (const s of before.concat(t.body)) {
    const code = lines.slice(s.line - 1, s.end).map(x => x.trim()).join(' ');
    if (err) { steps.push({ line: s.line, src: code, skip: true }); continue; }
    env.snap = null; env.wait = 0; const urlB = pwUrl(env);
    try { const v = pwEval(s.e, env); if (s.k === 'let') env.vars[s.name] = v; }
    catch (e) { if (!e.pw) { console.error(e); e.pw = 1; e.hint = 'Kitabın modelində daxili xəta: bu sətri sadələşdir.'; } err = e; if (!e.line) e.line = s.line; }
    const m = pwLast(s.e), dur = err ? err.ms || 0 : m === 'goto' ? 240 : PW_MATCH_L.concat(PW_MATCH_P).includes(m) ? 6 + s.line % 9 : m && PW_ASYNC.has(m) ? 30 + s.line * 7 % 50 : 0;
    steps.push({ line: s.line, src: code, ok: !err, ms: dur + env.wait, before: env.snap, urlB, after: env.st ? pwDom(env.st).innerHTML : null, url: pwUrl(env) });
    ms += dur + env.wait;
  }
  return { name: t.name, line: t.line, ok: !err, err, steps, ms, out: env.out, st: env.st };
}
function pwRun(src) {
  const res = { lint: [], tests: [] };
  let prog; try { prog = pwParse(src); } catch (e) { if (!e.pw) throw e; res.syntax = e; return res; }
  res.lint = pwLint(prog, src);
  if (res.lint.some(l => l.err)) return res;
  const only = prog.tests.some(t => t.only), lines = pwPlain(src).split('\n');
  prog.tests.forEach(t => res.tests.push(t.skip || (only && !t.only) ? { name: t.name, line: t.line, skip: true, steps: [] } : pwRunTest(t, prog.before, lines)));
  return res;
}
function pwReqs(task, res, src) {
  const code = pwPlain(src).replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"])\/\/.*$/gm, '$1');
  const ran = res.tests.filter(t => !t.skip), t0 = ran[0];
  return task.reqs.map(r => {
    let ok;
    if (r.t === 'has') ok = new RegExp(r.re).test(code);
    else if (r.t === 'no') ok = !new RegExp(r.re).test(code);
    else if (!t0) ok = false;
    else if (r.t === 'pass') ok = ran.every(t => t.ok);
    else if (r.t === 'fail') ok = !t0.ok && new RegExp(`^(${r.m})$`).test(t0.err.matcher || '');
    else ok = !!t0.st && (r.page === undefined || t0.st.page === r.page) && (r.cart === undefined || t0.st.cart.slice().sort().join() === r.cart.slice().sort().join());
    return { l: r.l, ok };
  });
}
// ---- the view: locator practice (a live shop, a locator, its matches) and test writing (editor, run, trace)
const pwStart = l => { const st = smFresh(l.start); if (l.start.err) st.err = l.start.err; return st; };
function pwLocHTML() {
  const l = pwLocById[PW.loc], D = pwDoc();
  const pick = PWD.locators.map((x, i) => `<button class="chip${x.id === PW.loc ? ' acc' : D.loc[x.id] ? ' pass' : ''}" data-act="pw-loc" data-id="${x.id}">${D.loc[x.id] ? icon('check') : ''}L-${i + 1}</button>`).join('');
  return `<div class="sm-pick">${pick}</div>
    <div class="card sm-case"><div class="sm-id">L-${PWD.locators.indexOf(l) + 1} · ${esc(l.title)}</div><p class="sm-p">${esc(l.goal)}</p></div>
    <div class="card pw-q"><label class="br-l" for="pw-q">Lokator</label>
      <div class="pw-qrow"><input id="pw-q" class="field pw-in" value="${esc(PW.q)}" placeholder="page.getByRole('button', { name: 'Login' })" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"><button class="btn primary" data-act="pw-eval">${icon('check')}Yoxla</button></div>
      <div class="row"><button class="btn sm${PW.pick ? ' primary' : ''}" data-act="pw-pick" aria-pressed="${PW.pick}">${icon('target')}${PW.pick ? 'Mağazada elementə toxun…' : 'Elementi seç'}</button><button class="btn sm ghost" data-act="pw-loc-reset">${icon('refresh')}Səhifəni sıfırla</button></div>
      <div id="pw-res" aria-live="polite"></div></div>
    <div class="sm-dev${PW.pick ? ' pw-picking' : ''}" id="pw-dev">${pwDom(PW.st).innerHTML}</div>`;
}
// live: the matches light up in the shop; judge: also the verdict on the exercise
function pwLocEval(judge) {
  const root = $('#pw-dev'), out = $('#pw-res'); if (!root || !out) return;
  $$('.pw-hl', root).forEach(e => e.classList.remove('pw-hl'));
  const q = PW.q.trim(), l = pwLocById[PW.loc], D = pwDoc();
  const alts = PW.alts ? `<div class="sm-fb-h">Bu elementi tapan lokatorlar</div><ul class="pw-alts">${PW.alts.map((s, i) => `<li><button class="btn sm${i ? ' ghost' : ''}" data-act="pw-use" data-q="${esc(s)}"><code>${esc(s)}</code></button></li>`).join('')}</ul>` : '';
  if (!q) { out.innerHTML = alts; return; }
  let loc; try { loc = pwParseLoc(q); } catch (e) { out.innerHTML = judge ? pwErrHTML(e, true) : alts; return; }
  const els = pwResolve(loc, root);
  els.forEach(e => e.classList.add('pw-hl'));
  const n = els.length;
  const count = `<div class="pw-count ${n === 1 ? 'ok' : n ? 'warn' : 'no'}"><b>${n}</b> element — ${n === 1 ? 'birmənalıdır: click() və fill() işləyəcək' : n ? 'strict mode: click() xəta verəcək, çünki hansını basacağı bəlli deyil' : 'heç nə tapılmadı'}</div>`;
  const list = n ? `<ul class="pw-els">${els.slice(0, 6).map(e => `<li><code>${esc(pwOuter(e))}</code></li>`).join('')}${n > 6 ? `<li class="muted">…və daha ${n - 6}</li>` : ''}</ul>` : '';
  let verdict = '';
  if (judge) {
    const tgt = pwResolve(pwParseLoc(l.target), root)[0], ok = n === 1 && els[0] === tgt;
    const best = ok ? pwBest(tgt, root) : [], css = /^\s*(await\s+)?page\.locator\(/.test(q) || /xpath|\/\//.test(q);
    const note = !tgt ? 'Hədəf element bu səhifədə yoxdur: «Səhifəni sıfırla» bas.' : ok ? (css && best[0] && !/locator\(/.test(best[0]) ? `İşləyir. 19.5-ə görə istifadəçinin gördüyünə əsaslanan lokator daha sabitdir: ${best[0]}` : '')
      : n > 1 ? (els.includes(tgt) ? 'Hədəf də bunların arasındadır, amma tək deyil: lokatoru daralt (filter, exact, test id).' : 'Bir neçə element tapıldı, hədəf isə onların arasında yoxdur.')
      : n === 1 ? 'Başqa element tapıldı — işıqlanan elementə bax.' : 'Heç nə tapılmadı: mətni, rolu və hərfləri yoxla.';
    if (ok && !D.loc[l.id]) { D.loc[l.id] = 1; Store.changed('pw'); }
    verdict = `<div class="sm-st ${ok ? 'ok' : 'no'}">${smMark(ok)}<div><b>${ok ? 'Düzdür' : 'Hələ yox'}</b>${note ? ` — ${esc(note)}` : ''}</div></div>
      <details class="cmp-why sm-model"${ok ? ' open' : ''}><summary>${icon('eye')}Niyə? Nümunə lokator</summary><p><code>${esc(l.target)}</code></p><p>${esc(l.why)}</p></details>`;
  }
  out.innerHTML = count + list + verdict + alts;
}
function pwPickAt(t) {
  const root = $('#pw-dev'), el = t.closest('button,input,select,a,[data-test],[role]');
  if (!root || !el || !root.contains(el) || el === root) return;
  PW.alts = pwBest(el, root); PW.q = PW.alts[0] || ''; PW.pick = false;
  const q = $('#pw-q'); if (q) q.value = PW.q;
  const b = $('[data-act="pw-pick"]'); if (b) { b.classList.remove('primary'); b.setAttribute('aria-pressed', 'false'); b.innerHTML = icon('target') + 'Elementi seç'; }
  root.classList.remove('pw-picking');
  pwLocEval(false);
}
function pwShopRedraw() { const root = $('#pw-dev'); if (root) root.innerHTML = pwDom(PW.st).innerHTML; pwLocEval(false); }
const pwErrHTML = (e, bare) => `<div class="pw-err-box"><pre class="pw-err">${esc(e.message)}${e.line && !bare ? `\n\n    at test.spec.js:${e.line}` : ''}</pre>${e.hint ? `<div class="pw-hint">${icon('bulb')}<span>${esc(e.hint)}</span></div>` : ''}</div>`;
function pwOutHTML() {
  const r = PW.run, t = pwTaskById[PW.task];
  if (!r) return '';
  if (r.syntax) return `<div class="sm-fb-h">Test işə salınmadı</div>${pwErrHTML(r.syntax)}`;
  const lint = r.lint.length ? `<ul class="pw-lint">${r.lint.map(x => `<li class="${x.err ? 'err' : 'warn'}"><b>Sətir ${x.line}:</b> ${esc(x.msg)}<div>${esc(x.hint)}</div></li>`).join('')}</ul>` : '';
  if (r.lint.some(x => x.err)) return `<div class="sm-fb-h">Test işə salınmadı: əvvəlcə xətaları düzəlt</div>${lint}`;
  const ran = r.tests.filter(x => !x.skip), fail = ran.filter(x => !x.ok).length, tot = ran.reduce((p, x) => p + x.ms, 0);
  const rep = r.tests.map((x, i) => `<button class="pw-rep ${x.skip ? 'skip' : x.ok ? 'ok' : 'bad'}${i === PW.ti ? ' cur' : ''}" data-act="pw-trace" data-i="${i}">${x.skip ? '–' : x.ok ? '✓' : '✘'} <span>${esc(x.name)}</span>${x.skip ? '' : `<i>${(x.ms / 1000).toFixed(1)}s</i>`}</button>`).join('');
  const T = r.tests[PW.ti] || ran[0];
  const sum = `<div class="tr-sum ${fail ? 'bad' : 'ok'}">${[fail ? `${fail} failed` : '', ran.length - fail ? `${ran.length - fail} passed` : '', r.tests.length - ran.length ? `${r.tests.length - ran.length} skipped` : ''].filter(Boolean).join(', ')} (${(tot / 1000).toFixed(1)}s)</div>`;
  let trace = '';
  if (T && !T.skip) {
    const k = PW.step >= 0 && PW.step < T.steps.length ? PW.step : T.steps.reduce((p, s, i) => s.skip ? p : i, 0), s = T.steps[k];
    const view = s && (PW.shot === 'after' && s.after ? 'after' : PW.shot === 'before' && s.before ? 'before' : s.before ? 'before' : 'after'), html = s && (view === 'before' ? s.before : s.after);
    trace = `${T.err ? pwErrHTML(T.err) : ''}<div class="sm-fb-h">Trace — addıma toxun, o anki ekranı gör</div>
      <ol class="pw-steps">${T.steps.map((x, i) => `<li><button class="${x.skip ? 'skip' : x.ok ? 'ok' : 'bad'}${i === k ? ' cur' : ''}" data-act="pw-step" data-i="${i}"><span class="pw-ln">${x.line}</span><code>${esc(x.src)}</code><span class="pw-ms">${x.skip ? 'skip' : x.ms + ' ms'}</span></button></li>`).join('')}</ol>
      ${s && !s.skip && html ? `<div class="tr-box"><div class="pw-shot-h"><div class="tr-h">Brauzer · addım ${k + 1}</div>${s.before && s.after ? `<div class="seg pw-ba" role="group" aria-label="Ekran">${[['before', 'Əvvəl'], ['after', 'Sonra']].map(([v, l]) => `<button data-act="pw-shot" data-v="${v}" aria-pressed="${view === v}">${l}</button>`).join('')}</div>` : ''}</div>
        <div class="tr-url">${esc(view === 'before' ? s.urlB : s.url)}</div><div class="sm-dev tr-dev pw-shot" inert>${html}</div>
        <p class="muted pw-shot-n">${view === 'before' ? (s.ok ? 'Hərəkətdən və ya yoxlamadan əvvəl: lokatorun tapdığı element işıqlanıb.' : 'Xəta anı: lokatorun tapdığı elementlər işıqlanıb (heç biri işıqlanmayıbsa, heç nə tapılmayıb).') : 'Bu addımdan sonra ekran.'}</p></div>` : ''}
      ${T.out.length ? `<div class="tr-box"><div class="tr-h">Konsol</div><pre class="tr-out">${esc(T.out.join('\n'))}</pre></div>` : ''}`;
  }
  const req = pwReqs(t, r, pwCode(t.id)), done = req.every(x => x.ok);
  return `${lint}<div class="pw-reps">${rep}</div>${sum}${trace}
    <div class="sm-fb-h">Tapşırığın tələbləri</div><ul class="sm-rows">${req.map(x => `<li>${smMark(x.ok)}<div>${esc(x.l)}</div></li>`).join('')}</ul>
    ${done ? `<div class="sm-good">${icon('check')}Tapşırıq yerinə yetirildi.</div>` : ''}`;
}
function pwTestHTML() {
  const t = pwTaskById[PW.task], D = pwDoc(), i = PWD.tasks.indexOf(t), code = pwCode(t.id);
  const pick = PWD.tasks.map((x, k) => `<button class="chip${x.id === PW.task ? ' acc' : D.done[x.id] ? ' pass' : ''}" data-act="pw-task" data-id="${x.id}">${D.done[x.id] ? icon('check') : ''}PW-${k + 1}</button>`).join('');
  return `<div class="sm-pick">${pick}</div>
    <div class="card sm-case"><div class="sm-id">PW-${i + 1} · ${esc(t.title)}</div><p class="sm-p">${esc(t.goal)}</p>
      <ul class="pw-goals">${t.reqs.map(x => `<li>${esc(x.l)}</li>`).join('')}</ul>
      <details class="cmp-why"><summary>${icon('bulb')}İpucu</summary><ul class="pw-goals">${t.hints.map(h => `<li>${esc(h)}</li>`).join('')}</ul></details></div>
    <div class="pw-ed-wrap"><pre class="pw-gut" aria-hidden="true">${code.split('\n').map((_, k) => k + 1).join('\n')}</pre><textarea class="pw-ed" id="pw-ed" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="Testin kodu">${esc(code)}</textarea></div>
    <div class="row pw-acts"><button class="btn primary" data-act="pw-run">${icon('play')}İşə sal</button><button class="btn ghost" data-act="pw-code-reset">${icon('refresh')}Başlanğıc kod</button><span class="muted pw-kbd">Ctrl + Enter</span></div>
    <div id="pw-out" aria-live="polite">${pwOutHTML()}</div>
    <details class="cmp-why sm-model pw-model"><summary>${icon('eye')}Nümunə həll</summary><pre class="code">${esc(t.model.join('\n'))}</pre><div class="row"><button class="btn sm" data-act="pw-use-model">${icon('pencil')}Redaktora yaz</button></div></details>`;
}
function pwEdGrow() {
  const t = $('#pw-ed'), g = $('.pw-gut'); if (!t) return;
  t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px';
  if (g) g.textContent = t.value.split('\n').map((_, k) => k + 1).join('\n');
}
function pwRunNow() {
  const t = pwTaskById[PW.task], src = pwCode(t.id);
  PW.run = pwRun(src); PW.ti = Math.max(0, PW.run.tests.findIndex(x => !x.skip && !x.ok)); PW.step = -1; PW.shot = null;
  if (PW.run.tests.length && pwReqs(t, PW.run, src).every(x => x.ok) && !pwDoc().done[t.id]) { pwDoc().done[t.id] = 1; Store.changed('pw'); }
  render({ keepScroll: true });
  const o = $('#pw-out'); if (o) o.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function vPw(v) {
  if (!PW.st) PW.st = pwStart(pwLocById[PW.loc]);
  setHeader({ back: true, kicker: 'Fəsil 19 · məşq', name: PW.tab === 'loc' ? 'Lokatorlar və strict mode' : 'Playwright testi: yaz və işə sal' });
  v.innerHTML = `<p class="muted sm-intro">${esc(PWD.intro)}</p>
    <div class="seg pw-tabs" role="group" aria-label="Bölmə">${[['loc', 'Lokator məşqi'], ['test', 'Test yaz']].map(([k, l]) => `<button data-act="pw-tab" data-v="${k}" aria-pressed="${PW.tab === k}">${l}</button>`).join('')}</div>
    <div id="pw-main">${PW.tab === 'loc' ? pwLocHTML() : pwTestHTML()}</div>`;
  if (PW.tab === 'loc') pwLocEval(false); else pwEdGrow();
}
const pwLinkHTML = s => !s.pwl ? '' : s.pwl === 'loc'
  ? `<div class="sm-link"><div class="srt-k">${icon('target')}Lokator məşqi</div><p class="srt-hint">Mağazada lokator yaz və nəticəni dərhal gör: neçə element tapıldı, hansı işıqlandı, strict mode nə deyir.</p>
    <div class="sm-links">${PWD.locators.map((l, i) => `<button class="btn sm" data-act="pw-open" data-tab="loc" data-id="${l.id}"><b>${pwDoc().loc[l.id] ? '✓' : 'L-' + (i + 1)}</b> ${esc(l.title)}</button>`).join('')}</div></div>`
  : `<div class="sm-link"><div class="srt-k">${icon('play')}Test yaz və işə sal</div><p class="srt-hint">Playwright testini özün yaz: kod Məşq mağazasında işləyir, xəta mesajları və trace real Playwright-dakı kimidir.</p>
    <div class="sm-links">${PWD.tasks.map((t, i) => `<button class="btn sm" data-act="pw-open" data-tab="test" data-id="${t.id}"><b>${pwDoc().done[t.id] ? '✓' : 'PW-' + (i + 1)}</b> ${esc(t.title)}</button>`).join('')}</div></div>`;
/* ---------- SQL practice (sql.json): SQLite in the page through sql.js (its asm.js build — one script, no wasm file to
   fetch). The practice database is 16.3's code block. Every SQL block of chapter 16 gets a Run button; the console runs
   free queries and checks tasks on a fresh copy of the database ---------- */
const SQLC = BOOK.sql;
const SQL_SRC = PWA ? 'libs/sql-asm.js' : 'https://cdn.jsdelivr.net/npm/sql.js@1.14.2/dist/sql-asm.js';
const SQX = { eng: null, db: null, q: 'SELECT * FROM customers;', out: null, task: 0, done: {}, fb: null }; // session only
function sqlEngine() {
  if (!SQX.eng) SQX.eng = new Promise((ok, no) => {
    const init = () => window.initSqlJs().then(ok, no);
    if (window.initSqlJs) { init(); return; }
    const s = document.createElement('script');
    s.src = SQL_SRC; s.async = true;
    s.onload = () => window.initSqlJs ? init() : no(new Error('initSqlJs'));
    s.onerror = () => no(new Error('load'));
    document.head.appendChild(s);
  }).catch(e => { SQX.eng = null; throw e; });
  return SQX.eng;
}
async function sqlFresh(empty) { const SQL = await sqlEngine(); const db = new SQL.Database(); if (!empty) db.exec(SQLC.seed); return db; }
async function sqlDB() { if (!SQX.db) SQX.db = await sqlFresh(); return SQX.db; }
function sqlDrop() { if (SQX.db) SQX.db.close(); SQX.db = null; }
const SQL_WRITE = /^\s*(insert|update|delete|replace|create|drop|alter)\b/i;
// every statement separately: its columns and rows, or how many rows it changed
function sqlExec(db, text) {
  const res = [];
  try {
    for (const st of db.iterateStatements(text)) {
      const sql = st.getSQL().trim(), cols = st.getColumnNames();
      if (cols.length) { const rows = []; while (st.step()) rows.push(st.get()); res.push({ sql, cols, rows }); }
      else { st.step(); res.push({ sql, changed: /^\s*(insert|update|delete|replace)\b/i.test(sql) ? db.getRowsModified() : null }); }
    }
  } catch (e) { res.push({ err: String(e && e.message || e) }); }
  return res;
}
function sqlNotes(text, res) {
  const n = [];
  if (/(=|<>|!=)\s*null\b/i.test(text)) n.push('NULL “=” ilə yoxlanmır — nəticə həmişə boş olur. IS NULL və ya IS NOT NULL yaz.');
  res.filter(r => r.sql && /^\s*(update|delete)\b/i.test(r.sql) && !/\bwhere\b/i.test(r.sql))
    .forEach(r => n.push(`WHERE yoxdur: “${r.sql.split(/\s+/).slice(0, 3).join(' ')}…” bütün cədvələ təsir etdi (${r.changed} sətir). «Bazanı sıfırla» ilə əvvəlki vəziyyətə qayıt.`));
  return n;
}
function sqlHint(e) {
  let m;
  if ((m = e.match(/no such column: (\S+)/))) return `“${m[1]}” adlı sütun yoxdur. Mətndirsə, dırnağa al: '${m[1]}'. Sütunların adını «Cədvəllər» siyahısında yoxla.`;
  if ((m = e.match(/no such table: (\S+)/))) return `“${m[1]}” adlı cədvəl yoxdur. Cədvəllər: customers, orders. Silmisənsə, «Bazanı sıfırla» bas.`;
  if (/incomplete input/.test(e)) return 'Sorğu yarımçıq qalıb: dırnaq və ya mötərizə bağlanmayıb.';
  if ((m = e.match(/near "([^"]*)": syntax error/))) return `Sintaksis xətası “${m[1]}” sözünün yanındadır: vergülü, dırnağı və açar sözlərin yazılışını yoxla.`;
  if (/UNIQUE constraint failed/.test(e)) return 'Bu id artıq var: primary key təkrarlana bilməz.';
  if ((m = e.match(/NOT NULL constraint failed: (\S+)/))) return `${m[1]} boş ola bilməz (NOT NULL).`;
  if (/already exists/.test(e)) return 'Bu cədvəl artıq var. Bazanı yenidən yaratmaq üçün «Bazanı sıfırla» bas.';
  return '';
}
const sqlVerb = s => /^\s*create/i.test(s) ? 'Cədvəl yaradıldı' : /^\s*insert/i.test(s) ? 'Əlavə olundu' : /^\s*update/i.test(s) ? 'Dəyişdi'
  : /^\s*delete/i.test(s) ? 'Silindi' : /^\s*drop/i.test(s) ? 'Cədvəl silindi' : 'İcra olundu';
const sqlCell = v => v === null ? '<td class="sql-null">NULL</td>' : `<td>${esc(v)}</td>`;
function sqlTable(cols, rows) {
  return `<div class="tbl"><table><thead><tr>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.slice(0, 200).map(r => `<tr>${r.map(sqlCell).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function sqlOutHTML(o) {
  if (!o) return '';
  if (o.loading) return '<div class="thinking"><i></i>SQLite yüklənir…</div>';
  if (o.fail) return `<div class="ai-err">SQLite yüklənmədi. ${PWA ? 'Tətbiqi yenilə.' : 'İnternet bağlantısını yoxla və yenidən cəhd et.'}</div>`;
  const blocks = o.res.map(r => r.err ? `<div class="ai-err"><b>Xəta:</b> ${esc(r.err)}${sqlHint(r.err) ? `<div class="sql-hint">${esc(sqlHint(r.err))}</div>` : ''}</div>`
    : r.cols ? `<div class="sql-res"><div class="sql-cap">${r.rows.length} sətir${r.rows.length > 200 ? ' (ilk 200-ü)' : ''}</div>${r.rows.length ? sqlTable(r.cols, r.rows) : '<p class="muted sql-empty">Nəticə boşdur — boş nəticə də nəticədir.</p>'}</div>`
    : `<div class="sql-ok">${icon('check')}${sqlVerb(r.sql)}${r.changed != null ? ` · ${r.changed} sətir` : ''}</div>`).join('');
  return `${o.notes.map(n => `<div class="sm-note sql-warn">${esc(n)}</div>`).join('')}${blocks}${o.wrote ? `<div class="row"><button class="btn sm ghost" data-act="sql-reset">${icon('refresh')}Bazanı sıfırla</button></div>` : ''}`;
}
async function sqlRun(text, seed) {
  try {
    let db;
    if (seed) { sqlDrop(); db = SQX.db = await sqlFresh(true); } else db = await sqlDB();
    const res = sqlExec(db, text);
    return { res, notes: sqlNotes(text, res), wrote: !seed && res.some(r => r.sql && SQL_WRITE.test(r.sql)) };
  } catch (e) { return { fail: true }; }
}
async function sqlRunPre(btn) {
  const box = btn.closest('.sql-run'), pre = box && box.previousElementSibling, out = box && $('.sql-out', box);
  if (!pre || !out) return;
  const seed = /create\s+table/i.test(pre.textContent);
  out.innerHTML = sqlOutHTML({ loading: true });
  const o = await sqlRun(pre.textContent, seed);
  out.innerHTML = seed && !o.fail && !o.res.some(r => r.err)
    ? `<div class="sql-ok">${icon('check')}Baza yaradıldı: customers — ${sqlCount('customers')} sətir, orders — ${sqlCount('orders')} sətir. İndi bu fəslin sorğularını işə sala bilərsən.</div>`
    : sqlOutHTML(o);
}
function sqlCount(t) { try { return SQX.db.exec(`SELECT COUNT(*) FROM ${t}`)[0].values[0][0]; } catch (e) { return 0; } }
async function sqlRunConsole() {
  SQX.out = { loading: true }; sqlRedraw('out');
  SQX.out = await sqlRun(SQX.q);
  sqlRedraw('out'); sqlRedraw('schema');
}
// task checks run on a fresh copy, so earlier experiments with the shared database do not matter
const sqlNorm = v => typeof v === 'number' ? Math.round(v * 100) / 100 : v === null ? null : String(v).trim();
const sqlRow = r => JSON.stringify(r.map(sqlNorm));
const sqlSorted = rows => rows.map(sqlRow).sort();
async function sqlCheck() {
  const t = SQLC.tasks[SQX.task], q = SQX.q.trim();
  if (!q) { toast('Sorğunu yaz.'); return; }
  let fb;
  try {
    const db = await sqlFresh(), res = sqlExec(db, q), err = res.find(r => r.err);
    const sel = res.filter(r => r.cols).pop();
    if (err) fb = { ok: false, msg: 'Sorğu xəta verdi: ' + err.err + (sqlHint(err.err) ? ' — ' + sqlHint(err.err) : '') };
    else if (t.mode === 'state') {
      const got = db.exec(t.state)[0].values, wrote = res.some(r => r.sql && /^\s*(insert|update|delete|replace)\b/i.test(r.sql));
      const e = await sqlFresh(); e.exec(t.sol[0]); const want = e.exec(t.state)[0].values; e.close();
      const diff = Math.abs(got.length - want.length) + want.filter((r, i) => !got[i] || sqlRow(r) !== sqlRow(got[i])).length;
      fb = !wrote ? { ok: false, msg: 'Bu tapşırıq cədvəli dəyişməyi tələb edir: UPDATE və ya INSERT yaz.' }
        : diff ? { ok: false, msg: `Cədvəlin son vəziyyəti gözləniləndən fərqlidir (${diff} sətir).${res.some(r => r.changed > 1) && t.sol[0].startsWith('UPDATE') ? ' WHERE çox geniş ola bilər.' : ''}` }
        : { ok: true };
    } else if (!sel) fb = { ok: false, msg: 'Sorğu nəticə qaytarmadı: SELECT yaz.' };
    else {
      const alts = [];
      for (const s of t.sol) { const e = await sqlFresh(); const r = e.exec(s)[0]; e.close(); alts.push({ cols: r.columns, rows: r.values }); }
      const w = alts[0], n = sel.rows.length;
      if (t.mode === 'value') {
        const v = sqlNorm(w.rows[0][0]);
        fb = n !== 1 ? { ok: false, msg: `Nəticədə ${n} sətir var — bir dəyər gözlənilir (COUNT, SUM kimi).` }
          : sel.rows[0].some(x => sqlNorm(x) === v) ? { ok: true } : { ok: false, msg: `Nəticə ${sel.rows[0].map(x => x === null ? 'NULL' : x).join(', ')} — gözlənilən deyil. Filtrə (WHERE) bax.` };
      } else if (t.mode === 'col') {
        const want = w.rows.map(r => JSON.stringify(sqlNorm(r[0]))).sort().join();
        fb = n !== w.rows.length ? { ok: false, msg: `Nəticədə ${n} sətir var, gözlənilən ${w.rows.length}.` }
          : sel.cols.some((c, j) => sel.rows.map(r => JSON.stringify(sqlNorm(r[j]))).sort().join() === want) ? { ok: true }
          : { ok: false, msg: 'Sətirlərin sayı düzdür, amma lazımi dəyərlər nəticədə yoxdur.' };
      } else {
        fb = null;
        for (const a of alts) {
          if (a.cols.length !== sel.cols.length) { fb = fb || { ok: false, msg: `Gözlənilən ${a.cols.length} sütun, səndə ${sel.cols.length}.` }; continue; }
          const same = sqlSorted(a.rows).join() === sqlSorted(sel.rows).join();
          if (same && (!t.ordered || a.rows.map(sqlRow).join() === sel.rows.map(sqlRow).join())) { fb = { ok: true }; break; }
          fb = same ? { ok: false, msg: 'Sətirlər düzdür, amma sıra fərqlidir — ORDER BY-a bax.' } : (fb || { ok: false, msg: 'Dəyərlər gözləniləndən fərqlidir.' });
        }
      }
    }
    db.close();
  } catch (e) { fb = { ok: false, msg: 'SQLite yüklənmədi.' }; }
  fb.notes = sqlNotes(q, []);
  SQX.fb = Object.assign(fb, { id: t.id });
  if (fb.ok) SQX.done[t.id] = 1;
  sqlRedraw('task');
}
function sqlTaskHTML() {
  const T = SQLC.tasks, t = T[SQX.task], n = T.filter(x => SQX.done[x.id]).length, fb = SQX.fb && SQX.fb.id === t.id ? SQX.fb : null;
  return `<div class="block-h" style="margin:0"><h2>Tapşırıq ${SQX.task + 1}/${T.length}</h2><span class="chip${n === T.length ? ' pass' : ''}">${n}/${T.length} həll</span></div>
    <div class="sql-t${SQX.done[t.id] ? ' ok' : ''}"><div><b>${SQX.done[t.id] ? icon('check') : ''}${esc(t.t)}</b> <span class="muted">${esc(secById[t.sec].num)}</span></div><p>${esc(t.x)}</p>
      <details class="cmp-why"><summary>${icon('bulb')}İpucu</summary><p>${esc(t.hint)}</p></details></div>
    ${fb ? `<div class="sm-st ${fb.ok ? 'ok' : 'no'}">${smMark(fb.ok)}<div>${fb.ok ? '<b>Düzdür!</b> Nəticə gözlənilənlə üst-üstə düşür.' : esc(fb.msg)}${fb.notes.map(x => `<div class="sm-note">${esc(x)}</div>`).join('')}</div></div>
      <details class="cmp-why"><summary>${icon('eye')}Nümunə həll</summary><pre class="code sql-sol">${esc(t.sol[0])}</pre></details>` : ''}
    <div class="row"><button class="btn sm ghost" data-act="sql-task" data-d="-1"${SQX.task ? '' : ' disabled'}>${icon('back')}Əvvəlki</button><button class="btn sm ghost" data-act="sql-task" data-d="1"${SQX.task < T.length - 1 ? '' : ' disabled'}>Növbəti${icon('arrow')}</button></div>`;
}
function sqlSchemaHTML() {
  if (!SQX.db) return '<div class="thinking"><i></i>SQLite yüklənir…</div>';
  return ['customers', 'orders'].map(t => {
    let cols = [];
    try { cols = SQX.db.exec(`PRAGMA table_info(${t})`)[0].values; } catch (e) { return `<div class="sql-tb"><b>${t}</b> <span class="muted">— cədvəl yoxdur</span></div>`; }
    return `<div class="sql-tb"><div><b class="mono">${t}</b> <span class="muted">${sqlCount(t)} sətir</span></div><div class="sql-cols">${cols.map(c => `<span><code>${esc(c[1])}</code> ${esc(c[2])}${c[5] ? ' · PK' : ''}${c[3] ? ' · NOT NULL' : ''}</span>`).join('')}</div></div>`;
  }).join('');
}
function sqlRedraw(part) {
  const el = $('#sql-' + part); if (!el) return;
  el.innerHTML = { task: sqlTaskHTML, out: () => sqlOutHTML(SQX.out), schema: sqlSchemaHTML }[part]();
}
function vSql(v) {
  setHeader({ back: true, kicker: 'SQL məşqi', name: 'SQLite brauzerdə · customers və orders' });
  v.innerHTML = `<p class="muted sm-intro">SQLite birbaşa brauzerdə işləyir — heç nə yükləmək lazım deyil. Baza 16.3-dəki customers və orders cədvəlləridir. Dəyişdirsən, «Bazanı sıfırla» ilk vəziyyəti qaytarır.</p>
    <div class="card lab-card" id="sql-task">${sqlTaskHTML()}</div>
    <div class="card lab-card"><textarea class="field mono sql-q" data-sqlq rows="6" spellcheck="false" autocapitalize="off" aria-label="SQL sorğusu">${esc(SQX.q)}</textarea>
      <div class="row"><button class="btn primary" data-act="sql-go">${icon('play')}İşə sal</button><button class="btn" data-act="sql-check">${icon('check')}Yoxla</button><button class="btn ghost" data-act="sql-reset">${icon('refresh')}Bazanı sıfırla</button></div>
      <div class="muted sql-kbd">Ctrl + Enter — işə sal. «Yoxla» sorğunu bazanın təmiz nüsxəsində tapşırıqla tutuşdurur.</div></div>
    <div class="card lab-card" id="sql-out" aria-live="polite">${sqlOutHTML(SQX.out) || '<p class="muted" style="margin:0">Sorğunu yaz və «İşə sal» bas — nəticə cədvəl kimi burada görünəcək.</p>'}</div>
    <details class="deep lab-card" open><summary>${icon('layers')}<span class="st">Cədvəllər<span class="sub">sütunlar, tiplər, sətirlərin sayı</span></span>${icon('chev', 'chev')}</summary><div class="dbody" id="sql-schema">${sqlSchemaHTML()}</div></details>`;
  if (!SQX.db) sqlDB().then(() => sqlRedraw('schema'), () => { const el = $('#sql-schema'); if (el) el.innerHTML = sqlOutHTML({ fail: true }); });
}
function sqlLinkHTML(s) {
  if (!s.sql) return '';
  const ts = SQLC.tasks.filter(t => t.sec === s.id);
  const txt = s.id === 'c16s3' ? 'Bu tətbiqdə heç nə yükləmək lazım deyil: SQLite brauzerdə işləyir və baza hazırdır. Kodun altındakı «Bazanı yarat» onu yenidən yaradır, hər sorğunun altında isə «İşə sal» var.'
    : ts.length ? 'Bu bölmənin tapşırıqlarını SQL konsolunda həll et — «Yoxla» nəticəni gözlənilənlə tutuşdurur.' : 'Sorğuları kodun altındakı «İşə sal» ilə işə sal və ya konsolda öz sorğunu yaz.';
  return `<div class="sm-link"><div class="srt-k">${icon('play')}SQL məşqi</div><p class="srt-hint">${txt}</p><div class="sm-links">${ts.length
    ? ts.map(t => `<button class="btn sm" data-act="sql-open" data-t="${SQLC.tasks.indexOf(t)}"><b>${SQX.done[t.id] ? '✓' : t.id.toUpperCase()}</b> ${esc(t.t)}</button>`).join('')
    : `<button class="btn sm" data-act="sql-open">${icon('play')}SQL konsolunu aç</button>`}</div></div>`;
}
// chapter 16's SQL blocks get Run / Open in console; a re-rendered section is decorated again
function sqlDecorate() {
  $$('#view pre.code[data-lang="sql"]:not([data-sqlx])').forEach(pre => {
    const sec = pre.closest('[data-sec]');
    if (!sec || secCh[sec.dataset.sec] !== 'c16') return;
    pre.dataset.sqlx = '1';
    const seed = /create\s+table/i.test(pre.textContent);
    pre.insertAdjacentHTML('afterend', `<div class="sql-run"><div class="row"><button class="btn sm" data-act="sql-pre">${icon('play')}${seed ? 'Bazanı yarat' : 'İşə sal'}</button>${seed ? '' : `<button class="btn sm ghost" data-act="sql-open" data-pre="1">${icon('ext')}Konsolda aç</button>`}</div><div class="sql-out" aria-live="polite"></div></div>`);
  });
}
new MutationObserver(sqlDecorate).observe($('#view'), { childList: true, subtree: true });
/* ---------- practice API (api.json): a REST API over the practice store's data, answered inside the page (no network, so it
   works offline and on claude.ai), and a Postman-like panel: method, URL with {{variables}}, headers, a JSON body and tests
   built from rows, shown as the pm.test code they stand for. Some endpoints have planted bugs ---------- */
const API = BOOK.api;
const API_P = STORE.products.map((p, i) => ({ id: i + 1, name: p.name, price: p.price })); // numeric ids in the shop's order
const HTTP_TXT = { 200: 'OK', 201: 'Created', 400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 405: 'Method Not Allowed', 409: 'Conflict', 422: 'Unprocessable Content', 500: 'Internal Server Error' };
const LAB_M = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const LAB_T = [['status', 'Status kodu'], ['body', 'Gövdə'], ['time', 'Cavab müddəti'], ['set', 'Dəyişənə yaz']];
const LAB_OP = { eql: ['=', 'to.eql'], include: ['daxildir', 'to.include'], type: ['tipi', 'to.be.a'], below: ['<', 'to.be.below'] };
const LAB = { srv: null, env: null, req: null, res: null, busy: false, tab: 'body', rtab: 'body', log: [], found: {}, done: {} }; // session only
const round2 = n => Math.round(n * 100) / 100;
function labInit(force) {
  if (LAB.srv && !force) return;
  LAB.srv = { tokens: {}, carts: {}, ghost: {}, next: 1002,
    orders: { 1001: { id: 1001, owner: 'visual_user', firstName: 'Vüsal', lastName: 'Quliyev', zip: '2000', items: [API_P[3]], total: 49.99, tax: 4, status: 'created' } },
    users: { standard_user: { firstName: 'Standard', lastName: 'User', email: 'standard@ministore.test', phone: null },
      problem_user: { firstName: 'Problem', lastName: 'User', email: 'problem@ministore.test', phone: null } } };
  if (!LAB.env || force) LAB.env = [['baseUrl', API.baseUrl], ['token', '']];
  if (!LAB.req) LAB.req = { m: 'GET', url: '{{baseUrl}}/products', hdrs: '', body: '', tests: [{ t: 'status', v: '200' }] };
}
const envGet = k => { const e = LAB.env.find(x => x[0] === k); return e ? e[1] : undefined; };
function envSet(k, v) { const e = LAB.env.find(x => x[0] === k); if (e) e[1] = v; else LAB.env.push([k, v]); }
function labSubst(s, miss) { return String(s || '').replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (m, k) => { const v = envGet(k); if (v === undefined) { miss.add(k); return m; } return v; }); }
function labFound(k) { if (!LAB.found[k]) LAB.newBug = k; LAB.found[k] = (LAB.found[k] || 0) + 1; }
// the server: one request in, { st, body, hdrs } out
function apiServe(m, path, q, h, body, badJson) {
  const S = LAB.srv, J = (st, b, x) => ({ st, body: b, hdrs: Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, x || {}) });
  const E = (st, msg, x) => J(st, { error: msg }, x), no = allow => E(405, 'Method Not Allowed', { Allow: allow });
  const seg = path.split('/').filter(Boolean), b = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const who = () => {
    if (!h.authorization) return E(401, 'Authorization header is missing', { 'WWW-Authenticate': 'Bearer' });
    const u = S.tokens[h.authorization.replace(/^Bearer\s*/i, '').trim()];
    return u || E(401, 'Token is not valid', { 'WWW-Authenticate': 'Bearer' });
  };
  const cartOf = ids => { const items = ids.map(id => API_P[id - 1]); return { items, total: round2(items.reduce((a, p) => a + p.price, 0)) }; };
  const order = o => ({ id: o.id, firstName: o.firstName, lastName: o.lastName, zip: o.zip, items: o.items, total: o.total, tax: o.tax, status: o.status });
  if (badJson && m !== 'GET' && m !== 'DELETE') return E(400, 'Invalid JSON body');
  const [r0, r1] = seg, n = seg.length;
  if (r0 === 'login' && n === 1) {
    if (m !== 'POST') return no('POST');
    if (!b.username) return E(400, 'username is required');
    if (!b.password) return E(400, 'password is required');
    if (!STORE.users.includes(b.username) || b.password !== STORE.password) return E(401, 'Username and password do not match any user in this service');
    if (b.username === 'locked_out_user') return E(403, 'Sorry, this user has been locked out.');
    const tok = 'tok_' + Math.random().toString(16).slice(2, 10);
    S.tokens[tok] = b.username;
    return J(200, { token: tok, username: b.username });
  }
  if (r0 === 'products' && n <= 2) {
    if (m !== 'GET') return no('GET');
    if (n === 2) {
      if (!/^\d+$/.test(r1)) return E(400, 'id must be a number');
      const p = API_P[+r1 - 1];
      return p ? J(200, p) : E(404, 'Product not found');
    }
    const sort = q.get('sort'), lim = q.get('limit'), pg = q.get('page');
    if (sort !== null && !['az', 'za', 'lohi', 'hilo'].includes(sort)) return E(400, 'sort must be one of: az, za, lohi, hilo');
    for (const [k, v] of [['limit', lim], ['page', pg]]) if (v !== null && !/^[1-9]\d*$/.test(v)) return E(400, `${k} must be a positive number`);
    const name = (x, y) => x.name.localeCompare(y.name, 'en');
    const by = { az: name, za: (x, y) => name(y, x), lohi: (x, y) => x.price - y.price || name(x, y), hilo: (x, y) => y.price - x.price || name(x, y) };
    let list = API_P.slice().sort(by[sort || 'az']);
    if (lim !== null) {
      const page = +(pg || 1);
      if (page > 1 && +lim < list.length) labFound('page'); // planted bug: the page number is ignored
      list = list.slice(0, +lim);
    }
    return J(200, list);
  }
  if (r0 === 'cart' && n <= 2) {
    if (n === 1 && m !== 'GET' && m !== 'POST') return no('GET, POST');
    if (n === 2 && m !== 'DELETE') return no('DELETE');
    const u = who(); if (u.st) return u;
    const cart = S.carts[u] || (S.carts[u] = []);
    if (n === 2) {
      if (!/^\d+$/.test(r1)) return E(400, 'productId must be a number');
      if (!cart.includes(+r1)) return E(404, 'Product not in cart');
      if (u === 'problem_user') { (S.ghost[u] || (S.ghost[u] = [])).push(+r1); return J(200, cartOf(cart.filter(x => x !== +r1))); } // planted bug: nothing is removed
      cart.splice(cart.indexOf(+r1), 1);
      return J(200, cartOf(cart));
    }
    if (m === 'GET') { if ((S.ghost[u] || []).some(id => cart.includes(id))) labFound('ghost'); return J(200, cartOf(cart)); }
    if (!('productId' in b)) return E(400, 'productId is required');
    if (typeof b.productId !== 'number') { labFound('type500'); return E(500, 'Internal Server Error'); } // planted bug: should be 400
    if (!API_P[b.productId - 1] || !Number.isInteger(b.productId)) return E(404, 'Product not found');
    if (cart.includes(b.productId)) return E(409, 'Product already in cart');
    cart.push(b.productId);
    return J(201, cartOf(cart));
  }
  if (r0 === 'orders' && n <= 2) {
    if (n === 1 && m !== 'GET' && m !== 'POST') return no('GET, POST');
    if (n === 2 && m !== 'GET') return no('GET');
    const u = who(); if (u.st) return u;
    if (n === 2) {
      if (!/^\d+$/.test(r1)) return E(400, 'id must be a number');
      const o = S.orders[+r1];
      if (!o) return E(404, 'Order not found');
      if (o.owner !== u) labFound('idor'); // planted bug: should be 403
      return J(200, order(o));
    }
    if (m === 'GET') return J(200, Object.values(S.orders).filter(o => o.owner === u).map(order));
    for (const f of ['firstName', 'lastName', 'zip']) {
      if (b[f] === undefined || b[f] === null || b[f] === '') return E(400, `${f} is required`);
      if (typeof b[f] !== 'string') return E(400, `${f} must be a string`);
    }
    const cart = S.carts[u] || [];
    if (!cart.length) return E(422, 'Cart is empty');
    if (b.firstName.length > 50 || b.lastName.length > 50) labFound('long'); // planted bug: should be 422
    const c = cartOf(cart), id = S.next++;
    S.orders[id] = { id, owner: u, firstName: b.firstName, lastName: b.lastName, zip: b.zip, items: c.items, total: c.total, tax: round2(c.total * 0.08), status: 'created' };
    S.carts[u] = [];
    return J(201, order(S.orders[id]), { Location: '/orders/' + id });
  }
  if (r0 === 'users' && r1 === 'me' && n === 2) {
    if (!['GET', 'PUT', 'PATCH'].includes(m)) return no('GET, PUT, PATCH');
    const u = who(); if (u.st) return u;
    const prof = S.users[u] || (S.users[u] = { firstName: '', lastName: '', email: '', phone: null });
    const F = ['firstName', 'lastName', 'email', 'phone'], keys = Object.keys(b);
    if (m !== 'GET') {
      if (m === 'PUT') { const miss = F.filter(k => !(k in b)); if (miss.length) return E(400, 'PUT replaces the whole profile. Missing fields: ' + miss.join(', ')); }
      if (!keys.length) return E(400, 'Body is empty');
      const bad = keys.find(k => !F.includes(k)); if (bad) return E(400, 'Unknown field: ' + bad);
      if ('email' in b && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(b.email))) return E(422, 'email is not valid');
      Object.assign(prof, b);
    }
    return J(200, Object.assign({ username: u }, prof));
  }
  return E(404, 'Not Found');
}
function labPath(o, p) {
  let v = o;
  for (const k of String(p || '').replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean)) {
    if (v == null) return undefined;
    v = k === 'length' && (Array.isArray(v) || typeof v === 'string') ? v.length : v[k];
  }
  return v;
}
const labVal = s => { try { return JSON.parse(s); } catch (e) { return s; } };
const labType = v => v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v;
const labExpr = p => 'data' + (!p ? '' : p[0] === '[' ? p : '.' + p);
const labShort = v => { const s = v === undefined ? 'undefined' : JSON.stringify(v); return s.length > 48 ? s.slice(0, 47) + '…' : s; };
// a test row is used only when it is complete
const labRowOk = r => r.t === 'status' || r.t === 'time' ? /^\d+$/.test(r.v || '') : r.t === 'set' ? /^[\w.-]+$/.test(r.name || '') : r.t === 'body' && r.op && (r.v || '') !== '';
function labTestName(r) {
  if (r.t === 'status') return `Status kodu: ${r.v}`;
  if (r.t === 'time') return `Cavab müddəti < ${r.v} ms`;
  if (r.t === 'set') return `${r.name} ← ${labExpr(r.p)}`;
  return `${labExpr(r.p)} ${LAB_OP[r.op][0]} ${r.v}`;
}
function labRun(res) {
  return LAB.req.tests.filter(labRowOk).map(r => {
    const name = labTestName(r);
    if (r.t === 'status') return { name, pass: res.st === +r.v, got: res.st };
    if (r.t === 'time') return { name, pass: res.time < +r.v, got: res.time + ' ms' };
    const v = labPath(res.body, r.p);
    if (r.t === 'set') { if (v !== undefined) envSet(r.name, typeof v === 'string' ? v : JSON.stringify(v)); return { name, pass: v !== undefined, got: labShort(v), set: true }; }
    const w = labVal(r.v);
    const pass = r.op === 'eql' ? JSON.stringify(v) === JSON.stringify(w) : r.op === 'type' ? labType(v) === r.v
      : r.op === 'below' ? typeof v === 'number' && v < +r.v : typeof v === 'string' ? v.includes(String(w)) : Array.isArray(v) && v.some(x => JSON.stringify(x) === JSON.stringify(w));
    return { name, pass, got: labShort(v) };
  });
}
// the pm code a row stands for (pre-highlighted)
function labCode() {
  const S2 = s => `<span class="s2">${esc(JSON.stringify(s))}</span>`, V = s => { const v = labVal(s); return typeof v === 'string' ? S2(v) : `<span class="mi">${esc(s)}</span>`; };
  const rows = LAB.req.tests.filter(labRowOk);
  if (!rows.length) return '<span class="c1">// yoxlama yoxdur</span>';
  const t = (name, body) => `pm.<span class="nf">test</span>(${S2(name)}, <span class="kd">function</span> () {\n  ${body};\n});`;
  const out = rows.some(r => r.t === 'body' || r.t === 'set') ? ['<span class="kd">const</span> data = pm.response.<span class="nf">json</span>();'] : [];
  rows.forEach(r => {
    const name = labTestName(r);
    if (r.t === 'status') out.push(t(name, `pm.response.to.have.<span class="nf">status</span>(<span class="mi">${esc(r.v)}</span>)`));
    else if (r.t === 'time') out.push(t(name, `pm.<span class="nf">expect</span>(pm.response.responseTime).to.be.<span class="nf">below</span>(<span class="mi">${esc(r.v)}</span>)`));
    else if (r.t === 'set') out.push(`pm.environment.<span class="nf">set</span>(${S2(r.name)}, ${esc(labExpr(r.p))});`);
    else out.push(t(name, `pm.<span class="nf">expect</span>(${esc(labExpr(r.p))}).${LAB_OP[r.op][1].replace(/(\w+)$/, '<span class="nf">$1</span>')}(${r.op === 'type' ? S2(r.v) : V(r.v)})`));
  });
  return out.join('\n');
}
const JSON_TOK = /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b/g;
function jsonHL(t) {
  let out = '', at = 0;
  for (const m of t.matchAll(JSON_TOK)) {
    out += esc(t.slice(at, m.index)) + (m[1] ? `<span class="${m[2] ? 'nt' : 's2'}">${esc(m[1])}</span>${m[2] || ''}` : `<span class="${m[3] ? 'mi' : 'kc'}">${m[3] || m[4]}</span>`);
    at = m.index + m[0].length;
  }
  return out + esc(t.slice(at));
}
function labSend() {
  if (LAB.busy) return;
  const R = LAB.req, miss = new Set();
  const url = labSubst(R.url, miss).trim(), hdrText = labSubst(R.hdrs, miss), bodyText = labSubst(R.body, miss);
  const h = {};
  hdrText.split('\n').forEach(l => { const i = l.indexOf(':'); if (i > 0) h[l.slice(0, i).trim().toLowerCase()] = l.slice(i + 1).trim(); });
  let u = null; try { u = new URL(url); } catch (e) { }
  const base = new URL(API.baseUrl);
  let res;
  if (!u) res = { err: `Invalid URL: “${url || '(boş)'}”. Ünvan https:// ilə başlamalıdır: {{baseUrl}}/products kimi.` };
  else if (u.origin !== base.origin) res = { err: `Could not send request: getaddrinfo ENOTFOUND ${u.hostname}. Bu məşq API-si yalnız ${base.host} ünvanında işləyir ({{baseUrl}}).` };
  else {
    let body = null, bad = false;
    if (bodyText.trim()) { try { body = JSON.parse(bodyText); } catch (e) { bad = true; } }
    const path = u.pathname.replace(/\/+$/, '') || '/';
    res = Object.assign(apiServe(R.m, path, u.searchParams, h, body, bad), { m: R.m, path: path + u.search });
    res.text = JSON.stringify(res.body, null, 2);
    res.size = new TextEncoder().encode(res.text).length;
    res.time = 60 + Math.floor(Math.random() * 180);
  }
  res.miss = [...miss];
  LAB.busy = true; LAB.res = null; labRedraw('res');
  setTimeout(() => {
    LAB.busy = false;
    if (!res.err) {
      res.tests = labRun(res);
      LAB.log.unshift({ m: res.m, path: res.path.split('?')[0], full: res.path, st: res.st, tests: res.tests, req: JSON.parse(JSON.stringify(R)) });
      if (LAB.log.length > 30) LAB.log.pop();
      labCheck();
    }
    LAB.res = res;
    labRedraw('res'); labRedraw('env'); labRedraw('tasks'); labRedraw('bugs');
    if (LAB.newBug) { toast('Baq tapıldı: ' + API.bugs[LAB.newBug]); LAB.newBug = null; }
  }, res.err ? 150 : res.time);
}
const labHit = (e, r) => e.m === r.m && e.st === r.st && new RegExp(r.p).test(e.path);
function labCheck() {
  API.tasks.forEach(t => {
    if (LAB.done[t.id]) return;
    const c = t.check;
    let ok = !c.req || LAB.log.some(e => labHit(e, c.req) && (!c.tests || (e.tests.length >= c.tests && e.tests.every(x => x.pass))));
    if (ok && c.also) ok = LAB.log.some(e => labHit(e, c.also));
    if (ok && c.env) ok = !!LAB.srv.tokens[envGet(c.env)];
    if (ok && c.bug) ok = !!LAB.found[c.bug];
    if (ok) { LAB.done[t.id] = 1; if (!LAB.newBug) toast('Tapşırıq tamamlandı: ' + t.t); }
  });
}
function labTasksHTML() {
  const T = API.tasks, n = T.filter(t => LAB.done[t.id]).length, next = T.find(t => !LAB.done[t.id]);
  const item = t => `<li class="${LAB.done[t.id] ? 'ok' : ''}">${LAB.done[t.id] ? icon('check') : '<i></i>'}<div><b>${esc(t.t)}</b> <span class="muted">${esc(secById[t.sec].num)}</span><div class="lab-tx">${esc(t.x)}</div>
    ${LAB.done[t.id] ? '' : `<details class="cmp-why"><summary>${icon('bulb')}İpucu</summary><p>${esc(t.hint)}</p></details>`}</div></li>`;
  return `<div class="block-h" style="margin:0"><h2>Tapşırıqlar</h2><span class="chip${n === T.length ? ' pass' : ''}">${n}/${T.length}</span></div>
    ${next ? `<ul class="lab-tl lab-next">${item(next)}</ul>` : `<div class="sm-good">${icon('check')}Bütün tapşırıqlar tamamlandı.</div>`}
    <details class="lab-all"><summary>${icon('list')}Bütün tapşırıqlar</summary><ul class="lab-tl">${T.map(item).join('')}</ul></details>`;
}
function labTestsHTML() {
  const rows = LAB.req.tests.map((r, i) => {
    const typ = `<select class="field lab-ts" data-lt="${i}:t" aria-label="Yoxlama növü">${LAB_T.map(([v, l]) => `<option value="${v}"${r.t === v ? ' selected' : ''}>${l}</option>`).join('')}</select>`;
    const inp = (f, ph, cls) => `<input class="field lab-ti ${cls || ''}" data-lt="${i}:${f}" value="${esc(r[f] || '')}" placeholder="${esc(ph)}" autocomplete="off" spellcheck="false">`;
    let rest;
    if (r.t === 'status') rest = `<span class="lab-op">=</span>${inp('v', '200', 'n')}`;
    else if (r.t === 'time') rest = `<span class="lab-op">&lt;</span>${inp('v', '1000', 'n')}<span class="lab-op">ms</span>`;
    else if (r.t === 'set') rest = `${inp('name', 'token', 'n')}<span class="lab-op">←</span>${inp('p', 'token')}`;
    else rest = `${inp('p', 'length, name, items[0].price')}<select class="field lab-ts op" data-lt="${i}:op" aria-label="Müqayisə">${Object.entries(LAB_OP).map(([k, [l]]) => `<option value="${k}"${r.op === k ? ' selected' : ''}>${l}</option>`).join('')}</select>${inp('v', r.op === 'type' ? 'number' : '6', 'n')}`;
    return `<div class="lab-tr">${typ}<div class="lab-tr-x">${rest}</div><button class="ibtn" data-act="lab-tdel" data-i="${i}" aria-label="Yoxlamanı sil">${icon('x')}</button></div>`;
  }).join('');
  return `<div class="lab-trs">${rows}</div><button class="btn sm" data-act="lab-tadd">${icon('check')}Yoxlama əlavə et</button>
    <div class="lab-cap">Postman-da bu yoxlamalar belə yazılır (Scripts → Post-response):</div><pre class="code lab-code" id="lab-code">${labCode()}</pre>`;
}
function labReqHTML() {
  const R = LAB.req, nh = R.hdrs.split('\n').filter(l => l.includes(':')).length, nt = R.tests.filter(labRowOk).length;
  const pane = LAB.tab === 'hdrs'
    ? `<textarea class="field lab-ta mono" data-lab="hdrs" rows="3" placeholder="Authorization: Bearer {{token}}" spellcheck="false">${esc(R.hdrs)}</textarea>
      <div class="row"><button class="btn sm" data-act="lab-auth">${icon('key')}Authorization: Bearer {{token}}</button></div>`
    : LAB.tab === 'body' ? `<textarea class="field lab-ta mono" data-lab="body" rows="5" placeholder='{ "productId": 1 }' spellcheck="false">${esc(R.body)}</textarea>
      <div class="row"><span class="chip">raw · JSON</span><button class="btn sm ghost" data-act="lab-fmt">Formatla</button>${R.m === 'GET' || R.m === 'DELETE' ? '<span class="muted lab-note">GET və DELETE gövdə göndərmir</span>' : ''}</div>`
    : labTestsHTML();
  return `<div class="lab-line"><select class="field lab-m" data-lab="m" aria-label="Metod">${LAB_M.map(x => `<option${R.m === x ? ' selected' : ''}>${x}</option>`).join('')}</select>
      <input class="field lab-url mono" data-lab="url" value="${esc(R.url)}" aria-label="URL" autocomplete="off" autocapitalize="off" spellcheck="false">
      <button class="btn primary" data-act="lab-send"${LAB.busy ? ' disabled' : ''}>${icon('send')}Send</button></div>
    <div class="seg lab-tabs">${[['hdrs', `Headers${nh ? ' (' + nh + ')' : ''}`], ['body', 'Body'], ['tests', `Tests${nt ? ' (' + nt + ')' : ''}`]].map(([k, l]) => `<button data-act="lab-tab" data-v="${k}" aria-pressed="${LAB.tab === k}">${l}</button>`).join('')}</div>
    <div class="lab-pane">${pane}</div>`;
}
function labResHTML() {
  if (LAB.busy) return '<div class="thinking"><i></i>Göndərilir…</div>';
  const r = LAB.res;
  if (!r) return '<p class="muted" style="margin:0">Sorğu göndər — cavab burada görünəcək.</p>';
  const miss = r.miss.length ? `<div class="sm-note">Dəyişən tapılmadı: ${r.miss.map(k => `{{${esc(k)}}}`).join(', ')} — Environment-də yoxdur, mətn olduğu kimi getdi.</div>` : '';
  if (r.err) return `<div class="ai-err">${esc(r.err)}</div>${miss}`;
  const fam = Math.floor(r.st / 100), cls = fam === 2 ? 'pass' : fam === 4 ? 'warn' : fam === 5 ? 'fail' : '';
  const nt = r.tests.length, np = r.tests.filter(x => x.pass).length;
  const pane = LAB.rtab === 'hdrs' ? `<div class="tbl"><table><tbody>${Object.entries(r.hdrs).map(([k, v]) => `<tr><td>${esc(k)}</td><td class="mono">${esc(v)}</td></tr>`).join('')}</tbody></table></div>`
    : LAB.rtab === 'tests' ? (nt ? `<ul class="sm-rows lab-results">${r.tests.map(x => `<li>${smMark(x.pass)}<div><span class="chip ${x.pass ? 'pass' : 'fail'}">${x.pass ? 'PASS' : 'FAIL'}</span> ${esc(x.name)}${x.pass && !x.set ? '' : `<div class="muted lab-got">alındı: ${esc(String(x.got))}</div>`}</div></li>`).join('')}</ul>` : '<p class="muted" style="margin:0">Yoxlama yoxdur — Tests tabında əlavə et.</p>')
    : `<pre class="code lab-json">${jsonHL(r.text)}</pre>`;
  return `<div class="lab-st"><span class="chip ${cls}">${r.st} ${HTTP_TXT[r.st] || ''}</span><span class="muted mono">${esc(r.m)} ${esc(r.path)}</span></div>
    <div class="lab-meta mono"><span>Time: ${r.time} ms</span><span>Size: ${r.size} B</span>${nt ? `<span class="${np === nt ? 'ok' : 'no'}">Tests: ${np}/${nt}</span>` : ''}</div>${miss}
    <div class="seg lab-tabs">${[['body', 'Body'], ['hdrs', 'Headers'], ['tests', `Test Results${nt ? ` (${np}/${nt})` : ''}`]].map(([k, l]) => `<button data-act="lab-rtab" data-v="${k}" aria-pressed="${LAB.rtab === k}">${l}</button>`).join('')}</div>${pane}`;
}
function labEnvHTML() {
  return `<div class="block-h" style="margin:0"><h2 lang="en">Environment · Mini Store</h2><button class="btn sm ghost" data-act="lab-reset">${icon('refresh')}Sıfırla</button></div>
    <div class="lab-env">${LAB.env.map(([k, v], i) => `<div class="lab-er"><code>{{${esc(k)}}}</code><input class="field lab-ti mono" data-le="${i}" value="${esc(v)}" aria-label="${esc(k)}" autocomplete="off" spellcheck="false">${i > 1 ? `<button class="ibtn" data-act="lab-edel" data-i="${i}" aria-label="Sil">${icon('x')}</button>` : '<span></span>'}</div>`).join('')}</div>
    <div class="lab-er add"><input class="field lab-ti mono" id="lab-ek" placeholder="ad" autocomplete="off" spellcheck="false"><input class="field lab-ti mono" id="lab-ev" placeholder="dəyər" autocomplete="off" spellcheck="false"><button class="btn sm" data-act="lab-eadd">Əlavə et</button></div>`;
}
function labDocHTML() {
  return `<summary>${icon('book')}<span class="st">API sənədi<span class="sub">${API.doc.length} endpoint · nə gözlənilir</span></span>${icon('chev', 'chev')}</summary>
    <div class="dbody lab-doc">${API.doc.map(d => `<div class="lab-ep"><div><span class="lab-mt m-${d.m}">${d.m}</span> <code>${esc(d.p)}</code>${d.auth ? ' <span class="chip">token</span>' : ''}</div><p>${esc(d.d)}</p>
      ${d.body ? `<pre class="code lab-json">${jsonHL(d.body)}</pre>` : ''}<div class="lab-codes">${d.res.map(([s, t]) => `<span><b>${s}</b> ${esc(t)}</span>`).join('')}</div></div>`).join('')}</div>`;
}
function labBugsHTML() {
  const ids = Object.keys(API.bugs), got = ids.filter(k => LAB.found[k]);
  const hist = LAB.log.slice(0, 8).map((e, i) => `<button class="lab-h" data-act="lab-hist" data-i="${i}"><span class="lab-mt m-${e.m}">${e.m}</span><span class="mono">${esc(e.full)}</span><b class="${e.st < 300 ? 'ok' : e.st >= 500 ? 'no' : 'w'}">${e.st}</b></button>`).join('');
  return `<div class="block-h" style="margin:0"><h2>Gizli baqlar</h2><span class="chip${got.length === ids.length ? ' pass' : ''}">${got.length}/${ids.length}</span></div>
    <p class="muted lab-note">Sənədlə cavabı tutuşdur: fərq varsa, baq tapmısan. Tapşırıqlar ikisinə aparır, qalanları özün axtar.</p>
    ${got.length ? `<ul class="sm-found">${got.map(k => `<li>${icon('check')}<span>${esc(API.bugs[k])}</span></li>`).join('')}</ul>` : ''}
    ${hist ? `<div class="block-h" style="margin:14px 0 6px"><h2>Tarixçə</h2></div><div class="lab-hs">${hist}</div>` : ''}`;
}
function labRedraw(part) {
  const el = $('#lab-' + part); if (!el) return;
  el.innerHTML = { req: labReqHTML, res: labResHTML, env: labEnvHTML, tasks: labTasksHTML, bugs: labBugsHTML }[part]();
}
function vLab(v) {
  labInit();
  setHeader({ back: true, kicker: 'Məşq API-si', name: 'Mini Store API · Postman kimi' });
  v.innerHTML = `<p class="muted sm-intro">Mini Store-un REST API-si (real server deyil, cavabları kitab özü verir — internetsiz də işləyir). Sorğunu Postman-dakı kimi qur: metod, URL, başlıqlar, gövdə və yoxlamalar.</p>
    <div class="card lab-card" id="lab-tasks">${labTasksHTML()}</div>
    <div class="card lab-card" id="lab-req">${labReqHTML()}</div>
    <div class="card lab-card lab-res" id="lab-res" aria-live="polite">${labResHTML()}</div>
    <div class="card lab-card" id="lab-env">${labEnvHTML()}</div>
    <details class="deep lab-card">${labDocHTML()}</details>
    <div class="card lab-card" id="lab-bugs">${labBugsHTML()}</div>`;
}
function labLinkHTML(s) {
  if (!s.api) return '';
  const ts = API.tasks.filter(t => t.sec === s.id);
  return `<div class="sm-link"><div class="srt-k">${icon('send')}Məşq API-si</div><p class="srt-hint">${ts.length ? 'Bu bölmənin tapşırıqlarını Mini Store API-sində et — sorğu göndər, cavabı və yoxlamaları gör.' : 'Sorğunun hissələrini canlı gör: metod, URL, başlıqlar, gövdə; cavabda status, başlıqlar və JSON.'}</p>
    <div class="sm-links">${ts.length ? ts.map(t => `<button class="btn sm" data-act="lab-open"><b>${LAB.done[t.id] ? '✓' : t.id.toUpperCase()}</b> ${esc(t.t)}</button>`).join('') : `<button class="btn sm" data-act="lab-open">${icon('send')}Məşq API-sini aç</button>`}</div></div>`;
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
  <section class="block"><div class="block-h"><h2>ISTQB xəritəsi</h2><span class="muted" style="font-size:13px">CTFL v4.0</span></div>
    <button class="quizcta alt" data-act="ctfl-open">${icon('layers')}<div style="flex:1;min-width:0;text-align:left"><b>Sillabus və kitab</b><span>${CTFL.length} fəsil, ${CTFL.reduce((a, c) => a + c.topics.length, 0)} mövzu — hər biri onu öyrədən bölmələrə bağlıdır</span></div>${icon('arrow')}</button></section>
  <section class="block"><div class="block-h"><h2>Sınaq imtahanı</h2><span class="muted" style="font-size:13px">${(P().exams || [])[0] ? `son: ${P().exams[0].ok}/${P().exams[0].n}` : 'ISTQB formatı'}</span></div>
    <button class="quizcta" data-act="exam-open">${icon('target')}<div style="flex:1;min-width:0;text-align:left"><b>${examRun() && !examRun().done && examLeft(examRun()) > 0 ? 'Yarımçıq imtahanı davam et' : `${EXAM_N} sual · ${EXAM_MIN} dəqiqə`}</b><span>ISTQB CTFL formatı: keçid ${Math.round(EXAM_PASS * 100)}%, cavablar və izahlar sonda</span></div>${icon('arrow')}</button></section>
  <section class="block"><div class="block-h"><h2>Fəsil testləri</h2><span class="muted" style="font-size:13px">${o.quizDone}/21 · orta ${o.avg}%</span></div>
    <div class="qgrid">${cells}</div></section>
  <section class="block"><div class="block-h"><h2>Məşq mağazası</h2><span class="muted" style="font-size:13px">${Object.keys(SM.passed).length}/${STORE.scenarios.length} test case</span></div>
    <div class="card"><div class="muted" style="font-size:13.5px">saucedemo.com-a bənzəyən kiçik mağaza modeli. Test case-in addımlarını icra et, faktiki nəticəni yaz — kitab onu ekranda olanla tutuşdurur. problem_user-də gizli bug-lar var: tapdığın hər biri üçün tam bug report yaz.</div>
      <div class="row" style="margin-top:12px"><button class="btn primary" data-act="sm-open" data-sc="tc01">${icon('play')}Test case-lərlə başla</button><button class="btn" data-act="sm-open" data-sc="">${icon('search')}Kəşfiyyat sessiyası</button></div></div></section>
  <section class="block"><div class="block-h"><h2>SQL məşqi</h2><span class="muted" style="font-size:13px">${SQLC.tasks.filter(t => SQX.done[t.id]).length}/${SQLC.tasks.length} tapşırıq</span></div>
    <div class="card"><div class="muted" style="font-size:13.5px">SQLite brauzerdə işləyir — heç nə yükləmək lazım deyil. 16-cı fəslin customers və orders bazası: sorğu yaz, nəticəni cədvəl kimi gör, tapşırıqları avtomatik yoxlat.</div>
      <div class="row" style="margin-top:12px"><button class="btn primary" data-act="sql-open">${icon('play')}SQL konsolunu aç</button></div></div></section>
  <section class="block"><div class="block-h"><h2>Məşq API-si</h2><span class="muted" style="font-size:13px">${API.tasks.filter(t => LAB.done[t.id]).length}/${API.tasks.length} tapşırıq</span></div>
    <div class="card"><div class="muted" style="font-size:13.5px">Mini Store-un REST API-si və Postman-a bənzər panel: metod, URL, başlıqlar, JSON gövdə, avtomatik yoxlamalar və environment. Sənədlə cavabı tutuşdur — API-də gizli baqlar var.</div>
      <div class="row" style="margin-top:12px"><button class="btn primary" data-act="lab-open">${icon('send')}Sorğu göndər</button></div></div></section>
  <section class="block"><div class="block-h"><h2>Kod izləyicisi</h2><span class="muted" style="font-size:13px">${TR_LIST.length} proqram</span></div>
    <div class="card"><div class="muted" style="font-size:13.5px">JavaScript kodunu sətir-sətir icra et və dəyişənlərin dəyərini gör. Playwright testində lokator, hərəkət və yoxlamanı ayırd et.</div>
      <div class="sm-links" style="margin-top:12px">${TR_LIST.map(({ sid, p }) => `<button class="btn sm" data-act="goto-sec" data-sec="${sid}"><b>${esc(secById[sid].num || 'Fəsil ' + chById[secCh[sid]].num)}</b> ${esc(p.title)}</button>`).join('')}</div></div></section>
  <section class="block"><div class="block-h"><h2><span lang="en">Playwright</span> məşqi</h2><span class="muted" style="font-size:13px">${Object.keys(pwDoc().loc).length}/${PWD.locators.length} lokator · ${Object.keys(pwDoc().done).length}/${PWD.tasks.length} test</span></div>
    <div class="card"><div class="muted" style="font-size:13.5px">Lokatoru mağazada sına: neçə element tapdı, strict mode nə deyir. Sonra testi özün yaz və işə sal — xəta mesajları, trace və saucedemo-dakı data-test atributları real Playwright-dakı kimidir.</div>
      <div class="row" style="margin-top:12px"><button class="btn primary" data-act="pw-open" data-tab="loc">${icon('target')}Lokator məşqi</button><button class="btn" data-act="pw-open" data-tab="test">${icon('play')}Test yaz</button></div></div></section>
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

/* ---------- ISTQB CTFL v4.0 map (ctfl.json): the syllabus chapters and topics, each linked to the book sections that teach
   it; a section marked as learned shows green ---------- */
const CTFL = BOOK.ctfl;
function vCtfl(v) {
  setHeader({ back: true, kicker: 'ISTQB xəritəsi', name: 'CTFL v4.0 sillabusu və kitab' });
  const L = P().learned, uniq = a => [...new Set(a)];
  const all = uniq(CTFL.flatMap(c => c.topics.flatMap(t => t.s))), done = all.filter(id => L[id]).length, per = pct(done, all.length);
  const chip = id => { const s = secById[id]; return `<button class="chip${L[id] ? ' pass' : ''}" data-act="goto-sec" data-sec="${id}" title="${esc(s.title)}">${L[id] ? icon('check') : ''}${esc(s.num || s.title)}</button>`; };
  v.innerHTML = `<div class="card"><div class="kicker">ISTQB Certified Tester Foundation Level</div>
      <h1 class="h1" style="font-size:24px">Sillabusun hər mövzusu kitabda haradadır</h1>
      <p class="muted" style="margin:8px 0 0;font-size:14px">CTFL v4.0 sillabusu 6 fəsildən ibarətdir. Hər mövzunun altında onu öyrədən bölmələr var — öyrəndiyin bölmələr yaşıl görünür. Dəqiqələr sillabusun tədris vaxtıdır: imtahanda fəslin çəkisi təxminən buna uyğundur.</p>
      <div class="herofig" style="margin-top:12px"><span class="v">${per}%</span><span class="u">${done} / ${all.length} bölmə öyrənilib</span></div>
      <div class="meter${per === 100 ? ' pass' : ''}" style="margin-top:10px;height:8px"><i style="width:${per}%"></i></div>
      <div class="row" style="margin-top:12px"><button class="btn sm" data-act="exam-open">${icon('target')}Sınaq imtahanı</button></div></div>
    ${CTFL.map(c => {
      const ids = uniq(c.topics.flatMap(t => t.s)), d = ids.filter(id => L[id]).length;
      return `<section class="block"><div class="block-h"><h2>${c.n} · ${esc(c.t)}</h2><span class="muted" style="font-size:12.5px">${c.min} dəq · ${d}/${ids.length}</span></div>
        <div class="card ctfl"><div class="ctfl-en" lang="en">${esc(c.en)}</div>${c.topics.map(t => `<div class="ctfl-t"><div><span class="mono">${esc(t.c)}</span> ${esc(t.t)}</div><div class="ctfl-s">${t.s.map(chip).join('')}</div></div>`).join('')}</div></section>`;
    }).join('')}
    <p class="muted" style="font-size:13px;margin-top:18px">Mənbə: ISTQB CTFL Syllabus v4.0. Rəsmi imtahan: 40 sual, 60 dəqiqə, keçid həddi 26 düzgün cavab.</p>`;
}
/* ---------- mock exam: the ISTQB CTFL format — 40 questions, 60 minutes, pass at 65 %, answers shown only at the end.
   Questions come from the chapter quizzes, spread over the chapters by pool size and kept in the book's order. A running
   exam is saved in progress.examRun, so a reload continues it with the clock still running ---------- */
const EXAM_N = 40, EXAM_MIN = 60, EXAM_PASS = 0.65;
const EXAM_MODES = { istqb: { label: 'ISTQB formatı', sub: 'I–IV hissə · Fəsil 1–12', ch: MAIN.filter(c => c.num <= 12).map(c => c.num) },
  all: { label: 'Bütün kitab', sub: 'Fəsil 1–21', ch: MAIN.map(c => c.num) } };
const qById = {};
Object.keys(QUIZ).forEach(n => QUIZ[n].forEach(q => { qById[q.id] = { q, ch: +n }; }));
const mmss = ms => { const s = Math.max(0, Math.round(ms / 1000)); return pad2(Math.floor(s / 60)) + ':' + pad2(s % 60); };
const examRun = () => { const r = P().examRun; return r && r.ids && r.ids.every(id => qById[id]) ? r : null; };
const examLeft = r => r.start + r.dur - Date.now();
function examNew(mode) {
  const chs = EXAM_MODES[mode].ch.filter(n => (QUIZ[n] || []).length), total = chs.reduce((a, n) => a + QUIZ[n].length, 0);
  // each chapter's share of the 40 follows its pool size (at least one), largest remainders round up
  const q = chs.map(n => { const x = EXAM_N * QUIZ[n].length / total; return { n, x, k: Math.max(1, Math.floor(x)) }; });
  let left = EXAM_N - q.reduce((a, r) => a + r.k, 0);
  q.slice().sort((a, b) => (b.x % 1) - (a.x % 1)).forEach(r => { if (left > 0 && r.k < QUIZ[r.n].length) { r.k++; left--; } });
  while (left < 0) { const r = q.filter(x => x.k > 1).sort((a, b) => b.k - a.k)[0]; r.k--; left++; }
  const ids = [];
  q.forEach(r => shuffle(QUIZ[r.n]).slice(0, r.k).forEach(x => ids.push(x.id)));
  return { mode, ids, perm: ids.map(() => shuffle([0, 1, 2, 3])), picks: ids.map(() => null), flags: ids.map(() => 0), i: 0, start: Date.now(), dur: EXAM_MIN * 60000, done: false };
}
function examScore(r) {
  const by = {};
  let ok = 0;
  r.ids.forEach((id, k) => { const { q, ch } = qById[id], hit = r.picks[k] === q.a; if (hit) ok++; const b = by[ch] || (by[ch] = [0, 0]); b[1]++; if (hit) b[0]++; });
  return { ok, n: r.ids.length, by, pass: ok >= Math.ceil(r.ids.length * EXAM_PASS) };
}
function examFinish(timeout) {
  const p = P(), r = p.examRun;
  if (!r || r.done) return;
  r.done = true; r.end = Math.min(Date.now(), r.start + r.dur);
  const s = examScore(r);
  p.exams = [{ at: r.end, mode: r.mode, ok: s.ok, n: s.n, ms: r.end - r.start }].concat(p.exams || []).slice(0, 10);
  Store.changed('progress');
  if (timeout) toast('Vaxt bitdi — imtahan avtomatik bitdi.');
}
function examTick() {
  if (S.view !== 'exam') return;
  const r = examRun(); if (!r || r.done) return;
  const left = examLeft(r);
  if (left <= 0) { examFinish(true); rerender(); return; }
  const el = $('#exam-timer'); if (el) { el.textContent = mmss(left); el.parentNode.classList.toggle('warn', left < 5 * 60000); }
}
setInterval(examTick, 1000);
function examStartHTML() {
  const r = examRun(), m = S.examMode || 'istqb', hist = P().exams || [];
  const goingOn = r && !r.done && examLeft(r) > 0;
  return `<div class="card exam-rules"><div class="kicker">ISTQB CTFL formatında</div><h1 class="h1" style="font-size:24px">Sınaq imtahanı</h1>
      <ul class="exam-list"><li><b>${EXAM_N}</b> sual, hər birinin bir düzgün cavabı var</li><li><b>${EXAM_MIN}</b> dəqiqə — vaxt bitəndə imtahan özü bitir</li>
        <li>Keçid həddi <b>${Math.round(EXAM_PASS * 100)}%</b> — ${Math.ceil(EXAM_N * EXAM_PASS)} düzgün cavab</li><li>Düzgün cavablar və izahlar yalnız sonda görünür</li>
        <li>Sualı işarələyib sonra qayıtmaq və cavabı dəyişmək olar</li></ul>
      <p class="muted" style="margin:10px 0 0;font-size:13.5px">Real CTFL imtahanı da 40 sual və 60 dəqiqədir (imtahan ana dilində deyilsə, 75 dəqiqə), keçid 26/40.</p></div>
    ${goingOn ? `<div class="block"><button class="cont" data-act="exam-go">${icon('play')}<div class="t"><div class="k">Yarımçıq imtahan</div><div class="n">Davam et · ${mmss(examLeft(r))} qalıb</div><div class="s">${r.picks.filter(x => x != null).length}/${r.ids.length} cavab</div></div>${icon('arrow')}</button></div>` : ''}
    <section class="block"><div class="block-h"><h2>Suallar haradan</h2></div>
      <div class="seg exam-mode">${Object.entries(EXAM_MODES).map(([k, x]) => `<button data-act="exam-mode" data-v="${k}" aria-pressed="${m === k}">${x.label}<small>${x.sub}</small></button>`).join('')}</div>
      <div class="row" style="margin-top:12px"><button class="btn primary" data-act="exam-start">${icon('target')}${goingOn ? 'Yenisini başla' : 'İmtahana başla'}</button>${r && r.done ? `<button class="btn" data-act="exam-res">${icon('list')}Son nəticə və səhvlər</button>` : ''}</div></section>
    ${hist.length ? `<section class="block"><div class="block-h"><h2>Əvvəlki cəhdlər</h2></div><div class="card exam-hist">${hist.map(h => {
      const pass = h.ok >= Math.ceil(h.n * EXAM_PASS), d = new Date(h.at);
      return `<div class="exam-h"><span class="mono">${pad2(d.getDate())}.${pad2(d.getMonth() + 1)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}</span><span>${esc(EXAM_MODES[h.mode] ? EXAM_MODES[h.mode].label : '')}</span><b>${h.ok}/${h.n}</b><span class="chip ${pass ? 'pass' : 'fail'}">${pass ? 'PASS' : 'FAIL'}</span></div>`;
    }).join('')}</div></section>` : ''}`;
}
function examQHTML(r) {
  const k = r.i, { q } = qById[r.ids[k]], L = 'ABCD';
  const nav = r.ids.map((_, j) => `<button class="${j === k ? 'cur ' : ''}${r.picks[j] != null ? 'ans ' : ''}${r.flags[j] ? 'flag' : ''}" data-act="exam-nav" data-i="${j}" aria-label="Sual ${j + 1}">${j + 1}</button>`).join('');
  const answered = r.picks.filter(x => x != null).length, flagged = r.flags.filter(Boolean).length;
  return `<div class="exam-top"><span class="chip exam-time${examLeft(r) < 5 * 60000 ? ' warn' : ''}">${icon('clock')}<span id="exam-timer">${mmss(examLeft(r))}</span></span>
      <span class="muted mono">${answered}/${r.ids.length} cavab${flagged ? ` · ${flagged} işarəli` : ''}</span></div>
    <div class="exam-nav">${nav}</div>
    <div class="kicker" style="margin-top:14px">Sual ${k + 1} / ${r.ids.length}${r.flags[k] ? ' · işarələnib' : ''}</div>
    <div class="qz-q">${esc(q.q)}</div>
    <div class="opts">${r.perm[k].map((oi, j) => `<button class="opt${r.picks[k] === oi ? ' sel' : ''}" data-act="exam-pick" data-o="${oi}" aria-pressed="${r.picks[k] === oi}"><span class="l">${L[j]}</span><span>${esc(q.o[oi])}</span></button>`).join('')}</div>
    <div class="exam-acts"><button class="btn" data-act="exam-step" data-d="-1"${k ? '' : ' disabled'}>${icon('back')}Əvvəlki</button>
      <button class="btn ghost${r.flags[k] ? ' on' : ''}" data-act="exam-flag" aria-pressed="${!!r.flags[k]}">${icon('save')}${r.flags[k] ? 'İşarəni götür' : 'İşarələ'}</button>
      ${k < r.ids.length - 1 ? `<button class="btn primary" data-act="exam-step" data-d="1">Növbəti${icon('arrow')}</button>` : `<button class="btn primary" data-act="exam-end">${icon('check')}Bitir</button>`}</div>
    <div class="row" style="margin-top:18px;justify-content:space-between"><span class="muted exam-kbd">Klaviatura: A–D seçir, ← → keçir, F işarələyir</span><button class="btn sm ghost" data-act="exam-end">${icon('stop')}İmtahanı bitir</button></div>`;
}
function examResHTML(r) {
  const s = examScore(r), pc = Math.round(s.ok * 100 / s.n), L = 'ABCD';
  const chs = Object.keys(s.by).map(Number).sort((a, b) => s.by[a][0] / s.by[a][1] - s.by[b][0] / s.by[b][1] || a - b);
  const rows = chs.map(n => { const [a, b] = s.by[n], c = MAIN.find(x => x.num === n), w = pct(a, b);
    return `<button class="exam-ch" data-act="quiz" data-ch="${n}"><span class="mono">F${pad2(n)}</span><span class="t">${esc(c.title)}<span class="meter${w === 100 ? ' pass' : ''}"><i style="width:${w}%"></i></span></span><b>${a}/${b}</b></button>`; }).join('');
  const only = S.examAll ? null : 'wrong';
  const items = r.ids.map((id, k) => ({ id, k })).filter(({ id, k }) => !only || r.picks[k] !== qById[id].q.a).map(({ id, k }) => {
    const { q } = qById[id], mine = r.picks[k], hit = mine === q.a, sec = secById[q.sec], pos = oi => L[r.perm[k].indexOf(oi)];
    return `<div class="exam-rev ${hit ? 'ok' : 'no'}"><div class="kicker">Sual ${k + 1}${sec ? ' · ' + esc(sec.num || '') : ''}</div><div class="exam-rq">${esc(q.q)}</div>
      ${hit ? '' : `<div class="exam-a no">${icon('x')}<span>${mine == null ? 'Cavab verilməyib' : `${pos(mine)}. ${esc(q.o[mine])}`}</span></div>`}
      <div class="exam-a ok">${icon('check')}<span>${pos(q.a)}. ${esc(q.o[q.a])}</span></div><p class="exam-e">${esc(q.e)}</p>
      ${sec ? `<button class="btn sm ghost" data-act="goto-sec" data-sec="${sec.id}">${icon('book')}${esc(sec.num || 'Bölmə')}-ə bax</button>` : ''}</div>`;
  }).join('');
  return `<div class="result card"><div class="kicker">${esc(EXAM_MODES[r.mode].label)} · ${mmss(r.end - r.start)}</div>
      <div class="big">${s.ok}<span class="muted" style="font-size:28px">/${s.n}</span></div>
      <div class="row" style="justify-content:center;margin-top:6px"><span class="chip ${s.pass ? 'pass' : 'fail'}">${s.pass ? 'PASS' : 'FAIL'} · ${pc}%</span><span class="chip">keçid ${Math.ceil(s.n * EXAM_PASS)}/${s.n}</span></div>
      <p class="muted" style="margin:12px 0 0">${s.pass ? (pc >= 80 ? 'Əla nəticə! Real imtahana hazırsan — zəif fəsilləri bir də təkrarla.' : 'Keçdin, amma ehtiyat azdır. Aşağıdakı zəif fəsillərdən başla.') : 'Hələ keçid həddinə çatmır. Zəif fəsillərin testlərini həll et və bir neçə gündən sonra yenidən cəhd et.'}</p></div>
    <section class="block"><div class="block-h"><h2>Fəsillər üzrə</h2><span class="muted" style="font-size:13px">zəifdən güclüyə · toxun — fəsil testi</span></div><div class="card exam-chs">${rows}</div></section>
    <section class="block"><div class="block-h"><h2>${only ? 'Səhv cavablar' : 'Bütün suallar'}</h2><button class="btn sm ghost" data-act="exam-all">${only ? 'Hamısını göstər' : 'Yalnız səhvlər'}</button></div>
      ${items || '<div class="empty">Səhv cavab yoxdur!</div>'}</section>
    <div class="qz-act" style="margin-top:18px"><button class="btn primary" data-act="exam-new">${icon('refresh')}Yeni imtahan</button><button class="btn ghost" data-act="tab" data-tab="practice">${icon('target')}Məşqə qayıt</button></div>`;
}
function vExam(v) {
  let r = examRun();
  if (r && !r.done && examLeft(r) <= 0) { examFinish(true); r = examRun(); }
  const mode = r && (S.params.go || S.params.res) ? (r.done ? 'res' : 'run') : 'start';
  setHeader({ back: true, kicker: 'Sınaq imtahanı', name: mode === 'res' ? 'Nəticə və səhvlərin izahı' : mode === 'run' ? `${EXAM_MODES[r.mode].label} · ${EXAM_N} sual` : 'ISTQB formatında 40 sual' });
  v.innerHTML = mode === 'res' ? examResHTML(r) : mode === 'run' ? examQHTML(r) : examStartHTML();
}
function examPick(o) { const r = examRun(); if (!r || r.done) return; r.picks[r.i] = +o; Store.changed('progress'); rerender(); }
function examGo(i) { const r = examRun(); if (!r || r.done) return; r.i = clamp(i, 0, r.ids.length - 1); Store.changed('progress', 2500); render({}); }
function examEnd() {
  const r = examRun(); if (!r || r.done) return;
  const open = r.picks.filter(x => x == null).length, fl = r.flags.filter(Boolean).length;
  const done = () => { examFinish(false); render({}); };
  if (open || fl) openConfirm('İmtahanı bitirək?', `${open ? `${open} sual cavabsızdır` : ''}${open && fl ? ', ' : ''}${fl ? `${fl} sual işarəlidir` : ''}. Bitirəndən sonra cavabları dəyişmək olmur.`, 'Bitir', done);
  else done();
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
  ${(P().exams || []).length ? `<section class="block"><div class="block-h"><h2>Sınaq imtahanı</h2><span class="muted" style="font-size:13px">${P().exams.length} cəhd</span></div>
    <button class="quizcta alt" data-act="exam-open">${icon('target')}<div style="flex:1;min-width:0;text-align:left"><b>Son: ${P().exams[0].ok}/${P().exams[0].n} · ən yaxşı: ${Math.max(...P().exams.map(x => x.ok))}/${EXAM_N}</b><span>keçid həddi ${Math.ceil(EXAM_N * EXAM_PASS)} — ${P().exams[0].ok >= Math.ceil(P().exams[0].n * EXAM_PASS) ? 'son cəhd keçib' : 'son cəhd keçməyib'}</span></div>${icon('arrow')}</button></section>` : ''}
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
const IMPORT_KEY = /^(progress|prefs|cards|checks|chat|roleplay|pw|notes-[a-z0-9]+|ans-[a-z0-9]+)$/;
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
  if (PW.pick && ev.target.closest('#pw-dev')) { ev.preventDefault(); pwPickAt(ev.target); return; } // Playwright practice: pick an element
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
    case 'sm':
      if (el.closest('#pw-dev')) { smApply(PW.st, Object.assign({ ev: d.e }, d.item ? { item: d.item, where: d.where } : {}), {}); pwShopRedraw(); break; } // the locator practice's own shop
      smEvent(Object.assign({ ev: d.e }, d.item ? { item: d.item, where: d.where } : {})); smRedraw(); break;
    case 'pw-open': {
      closeSheet(); if (d.tab) PW.tab = d.tab;
      if (d.tab === 'loc' && d.id) Object.assign(PW, { loc: d.id, st: pwStart(pwLocById[d.id]), q: '', alts: null, pick: false });
      if (d.tab === 'test' && d.id && d.id !== PW.task) Object.assign(PW, { task: d.id, run: null });
      go('pw', {}, { push: S.view !== 'pw' }); break;
    }
    case 'pw-tab': PW.tab = d.v; PW.pick = false; render({}); break;
    case 'pw-loc': Object.assign(PW, { loc: d.id, st: pwStart(pwLocById[d.id]), q: '', alts: null, pick: false }); render({ keepScroll: true }); break;
    case 'pw-loc-reset': PW.st = pwStart(pwLocById[PW.loc]); pwShopRedraw(); break;
    case 'pw-eval': pwLocEval(true); break;
    case 'pw-pick': PW.pick = !PW.pick; render({ keepScroll: true }); break;
    case 'pw-use': { PW.q = d.q; const q = $('#pw-q'); if (q) q.value = PW.q; pwLocEval(true); break; }
    case 'pw-task': Object.assign(PW, { task: d.id, run: null }); render({ keepScroll: true }); break;
    case 'pw-run': pwRunNow(); break;
    case 'pw-trace': PW.ti = +d.i; PW.step = -1; PW.shot = null; $('#pw-out').innerHTML = pwOutHTML(); break;
    case 'pw-step': PW.step = +d.i; PW.shot = null; $('#pw-out').innerHTML = pwOutHTML(); break;
    case 'pw-shot': PW.shot = d.v; $('#pw-out').innerHTML = pwOutHTML(); break;
    case 'pw-code-reset': openConfirm('Başlanğıc kod', 'Yazdığın kod silinəcək, tapşırığın başlanğıc kodu qayıdacaq.', 'Qaytar', () => { delete pwDoc().code[PW.task]; Store.changed('pw'); PW.run = null; render({ keepScroll: true }); }); break;
    case 'pw-use-model': openConfirm('Nümunə həll', 'Nümunə redaktora yazılacaq, öz kodun silinəcək.', 'Yaz', () => { pwDoc().code[PW.task] = pwTaskById[PW.task].model.join('\n'); Store.changed('pw'); PW.run = null; render({ keepScroll: true }); }); break;
    case 'sm-open': closeSheet(); go('store', { sc: d.sc || null }, { push: S.view !== 'store' }); break;
    case 'sm-restart': smStart(SM.id); render({ keepScroll: true }); break;
    case 'sm-status': {
      SM.status = d.v;
      $$('[data-act="sm-status"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === d.v)));
      const bt = $('#sm-bt'); if (bt) bt.hidden = d.v !== 'Failed';
      break;
    }
    case 'sm-check': smCheck(); break;
    case 'ctfl-open': closeSheet(); go('ctfl', {}, { push: S.view !== 'ctfl' }); break;
    case 'exam-open': closeSheet(); go('exam', {}, { push: S.view !== 'exam' }); break;
    case 'exam-mode': S.examMode = d.v; rerender(); break;
    case 'exam-start': {
      const start = () => { P().examRun = examNew(S.examMode || 'istqb'); Store.changed('progress'); S.params = { go: 1 }; render({}); };
      const r = examRun();
      if (r && !r.done && examLeft(r) > 0) openConfirm('Yeni imtahan?', 'Yarımçıq imtahan silinəcək və nəticəsi saxlanmayacaq.', 'Yenisini başla', start); else start();
      break;
    }
    case 'exam-go': S.params = { go: 1 }; render({}); break;
    case 'exam-res': S.params = { res: 1 }; render({}); break;
    case 'exam-nav': examGo(+d.i); break;
    case 'exam-step': { const r = examRun(); if (r) examGo(r.i + +d.d); break; }
    case 'exam-pick': examPick(d.o); break;
    case 'exam-flag': { const r = examRun(); if (r && !r.done) { r.flags[r.i] = r.flags[r.i] ? 0 : 1; Store.changed('progress'); rerender(); } break; }
    case 'exam-end': examEnd(); break;
    case 'exam-all': S.examAll = !S.examAll; rerender(); break;
    case 'exam-new': S.params = {}; render({}); break;
    case 'sql-pre': sqlRunPre(el); break;
    case 'sql-open': {
      if (d.pre) { const pre = el.closest('.sql-run').previousElementSibling; SQX.q = pre.textContent.trim(); SQX.out = null; }
      if (d.t !== undefined) { SQX.task = +d.t; SQX.fb = null; }
      closeSheet(); go('sql', {}, { push: S.view !== 'sql' }); break;
    }
    case 'sql-go': sqlRunConsole(); break;
    case 'sql-check': sqlCheck(); break;
    case 'sql-task': SQX.task = clamp(SQX.task + +d.d, 0, SQLC.tasks.length - 1); SQX.fb = null; sqlRedraw('task'); break;
    case 'sql-reset': {
      sqlDrop();
      sqlDB().then(() => { sqlRedraw('schema'); toast('Baza ilk vəziyyətinə qayıtdı: 5 müştəri, 7 sifariş.'); }, () => toast('SQLite yüklənmədi.'));
      const box = el.closest('.sql-out'); if (box) box.innerHTML = ''; else if (S.view === 'sql') { SQX.out = null; sqlRedraw('out'); }
      break;
    }
    case 'lab-open': closeSheet(); go('lab', {}, { push: S.view !== 'lab' }); break;
    case 'lab-send': labSend(); break;
    case 'lab-tab': LAB.tab = d.v; labRedraw('req'); break;
    case 'lab-rtab': LAB.rtab = d.v; labRedraw('res'); break;
    case 'lab-tadd': LAB.req.tests.push({ t: 'body', p: '', op: 'eql', v: '' }); labRedraw('req'); break;
    case 'lab-tdel': LAB.req.tests.splice(+d.i, 1); labRedraw('req'); break;
    case 'lab-auth': {
      const R = LAB.req;
      if (!/^authorization\s*:/im.test(R.hdrs)) R.hdrs = (R.hdrs.trim() ? R.hdrs.trim() + '\n' : '') + 'Authorization: Bearer {{token}}';
      LAB.tab = 'hdrs'; labRedraw('req'); break;
    }
    case 'lab-fmt': try { LAB.req.body = JSON.stringify(JSON.parse(LAB.req.body), null, 2); labRedraw('req'); } catch (e) { toast('JSON düzgün deyil: ' + e.message); } break;
    case 'lab-hist': { const e = LAB.log[+d.i]; if (e) { LAB.req = JSON.parse(JSON.stringify(e.req)); labRedraw('req'); $('#lab-req').scrollIntoView({ behavior: 'smooth', block: 'start' }); } break; }
    case 'lab-eadd': {
      const k = ($('#lab-ek') || {}).value || '', v = ($('#lab-ev') || {}).value || '';
      if (!/^[\w.-]+$/.test(k.trim())) { toast('Dəyişənin adı: hərf, rəqəm, _ . -'); break; }
      envSet(k.trim(), v); labRedraw('env'); break;
    }
    case 'lab-edel': LAB.env.splice(+d.i, 1); labRedraw('env'); break;
    case 'lab-reset': labInit(true); LAB.res = null; render({ keepScroll: true }); toast('Server və Environment sıfırlandı: token, səbət və sifarişlər silindi.'); break;
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
  if (S.view === 'exam' && S.params.go && !sheetEl && !ev.ctrlKey && !ev.metaKey && !ev.altKey && !/^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName)) {
    const r = examRun(), k = ev.key.toLowerCase(), j = 'abcd'.indexOf(k) >= 0 ? 'abcd'.indexOf(k) : '1234'.indexOf(k);
    if (r && !r.done) {
      if (j >= 0) { ev.preventDefault(); examPick(r.perm[r.i][j]); return; }
      if (k === 'arrowright' || k === 'arrowleft') { ev.preventDefault(); examGo(r.i + (k === 'arrowright' ? 1 : -1)); return; }
      if (k === 'f') { ev.preventDefault(); r.flags[r.i] = r.flags[r.i] ? 0 : 1; Store.changed('progress'); rerender(); return; }
    }
  }
  if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey) && ev.target.dataset && ev.target.dataset.sqlq !== undefined) { ev.preventDefault(); sqlRunConsole(); return; }
  if (ev.target.id === 'pw-ed') { // the test editor: Tab indents, Ctrl+Enter runs
    if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); pwRunNow(); return; }
    if (ev.key === 'Tab' && !ev.shiftKey) { ev.preventDefault(); const t = ev.target; t.setRangeText('  ', t.selectionStart, t.selectionEnd, 'end'); t.dispatchEvent(new Event('input', { bubbles: true })); return; }
    return;
  }
  if (ev.key === 'Enter' && !ev.shiftKey) {
    if (ev.target.id === 'tin') { ev.preventDefault(); const v = ev.target.value; ev.target.value = ''; autoGrow(ev.target); tutorSend(v); }
    else if (ev.target.id === 'shin') { ev.preventDefault(); shSend(); }
    else if (ev.target.id === 'rpin') { ev.preventDefault(); const v = ev.target.value; if (!v.trim() || S.rpBusy) return; ev.target.value = ''; autoGrow(ev.target); rpCall('send', v); }
    else if (ev.target.id === 'apikey' && PWA) { ev.preventDefault(); const b = $('[data-act="key-save"]'); if (b && !b.disabled) saveKey(b); }
    else if (ev.target.dataset && ev.target.dataset.lab === 'url') { ev.preventDefault(); labSend(); }
    else if (ev.target.dataset && ev.target.dataset.smF) { // Enter submits the form, as on the site
      ev.preventDefault();
      if (ev.target.closest('#pw-dev')) { smApply(PW.st, { ev: PW.st.page === 'login' ? 'login' : 'continue' }, {}); pwShopRedraw(); }
      else { smEvent({ ev: SM.st.page === 'login' ? 'login' : 'continue' }); smRedraw(); }
    }
    else if (ev.target.id === 'pw-q') { ev.preventDefault(); pwLocEval(true); }
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
  } else if (t.dataset.smF) {
    if (t.closest('#pw-dev')) { smFill(PW.st, t.dataset.smF, t.value, {}); if (PW.st.f[t.dataset.smF] !== t.value) pwShopRedraw(); }
    else smType(t);
  }
  else if (t.id === 'pw-q') { PW.q = t.value; PW.alts = null; pwLocEval(false); }
  else if (t.id === 'pw-ed') { pwDoc().code[PW.task] = t.value; Store.changed('pw', 1500); pwEdGrow(); }
  else if (t.dataset.smAns !== undefined) SM.ans = t.value;
  else if (t.dataset.smTitle !== undefined) SM.title = t.value;
  else if (t.dataset.sqlq !== undefined) SQX.q = t.value;
  else if (t.dataset.lab) { LAB.req[t.dataset.lab] = t.value; if (t.dataset.lab === 'm') labRedraw('req'); }
  else if (t.dataset.lt) {
    const [i, f] = t.dataset.lt.split(':'), r = LAB.req.tests[+i];
    if (f === 't') { LAB.req.tests[+i] = t.value === 'body' ? { t: 'body', p: '', op: 'eql', v: '' } : { t: t.value }; labRedraw('req'); }
    else { r[f] = t.value; if (f === 'op') labRedraw('req'); else { const c = $('#lab-code'); if (c) c.innerHTML = labCode(); } }
  }
  else if (t.dataset.le) LAB.env[+t.dataset.le][1] = t.value;
  else if (t.dataset.brF && SM.rep) SM.rep.f[t.dataset.brF] = t.value;
  else if (t.id === 'glq') { S.glq = t.value; drawGlossary(); }
  else if (t.id === 'sq') { doSearch(t.value); }
  else if (t.id === 'tin' || t.id === 'shin' || t.id === 'rpin') autoGrow(t);
});
document.addEventListener('toggle', ev => { const el = ev.target; if (el && el.dataset && el.dataset.open) OPEN[el.dataset.open] = el.open; }, true);
document.addEventListener('change', ev => {
  const t = ev.target;
  if (t.dataset.ixTg) { IX[t.dataset.sid][t.dataset.ixTg] = t.checked; ixRedraw(t.dataset.sid); return; }
  if (t.dataset.smSort !== undefined) {
    if (t.closest('#pw-dev')) { smApply(PW.st, { ev: 'sort', v: t.value }, {}); pwShopRedraw(); return; }
    smEvent({ ev: 'sort', v: t.value }); smRedraw(); return;
  }
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
// #magaza opens the practice store, #magaza-tc04 with that test case; #playwright-pw3 a Playwright task, #lokator-l5 a locator.
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
  else if (t === 'playwright' || t === 'lokator') {
    S.tab = 'practice'; S.view = 'pw'; S.params = {}; PW.tab = t === 'lokator' ? 'loc' : 'test';
    if (t === 'playwright' && own(pwTaskById, act)) Object.assign(PW, { task: act, run: null });
    if (t === 'lokator' && own(pwLocById, act)) Object.assign(PW, { loc: act, st: pwStart(pwLocById[act]), q: '', alts: null });
  }
  else if (h === 'istqb') { S.tab = 'practice'; S.view = 'ctfl'; S.params = {}; }
  else if (h === 'imtahan') { S.tab = 'practice'; S.view = 'exam'; S.params = {}; }
  else if (h === 'sql') { S.tab = 'practice'; S.view = 'sql'; S.params = {}; }
  else if (h === 'api') { S.tab = 'practice'; S.view = 'lab'; S.params = {}; }
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
