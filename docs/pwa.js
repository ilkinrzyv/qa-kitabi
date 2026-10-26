/* QA Kitabı — offline app layer: service worker, install, Claude via the reader's own API key, backups.
   Loaded before app.js; app.js finds it as window.QA_PWA. */
(function () {
'use strict';
const VERSION = '2026.10.26-e4c42ef';
const ASSET_COUNT = 46;
const CACHE = 'qa-kitab-' + VERSION;
const ARTIFACT = 'https://claude.ai/artifact/ARfQ7Q2V6TsZ3nBnJdQzLq';
const API = 'https://api.anthropic.com/v1';
const K_KEY = 'qa-kitab:pwa:key', K_CFG = 'qa-kitab:pwa:cfg';
const MODELS = [
  ['claude-opus-5-5', 'Opus 5.5', 'Claude Opus 5.5'],
  ['claude-sonnet-5-5', 'Sonnet 5.5', 'Claude Sonnet 5.5'],
  ['claude-haiku-5-5', 'Haiku 5.5', 'Claude Haiku 5.5']
];
const EFFORTS = [['medium', 'Orta'], ['high', 'Yüksək'], ['max', 'Maksimum']];

/* ---------- small helpers ---------- */
const ls = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { } }
};
const bus = new EventTarget();
const emit = type => { try { bus.dispatchEvent(new Event(type)); } catch (e) { } };
const on = (type, fn) => bus.addEventListener(type, fn);

function cfg() {
  let c = null; try { c = JSON.parse(ls.get(K_CFG) || 'null'); } catch (e) { c = null; }
  c = Object.assign({ model: 'claude-opus-5-5', effort: 'high' }, c || {});
  if (!c.usage || typeof c.usage !== 'object') c.usage = { n: 0, inp: 0, out: 0, since: Date.now() };
  if (!MODELS.some(m => m[0] === c.model)) c.model = 'claude-opus-5-5';
  if (!EFFORTS.some(m => m[0] === c.effort)) c.effort = 'high';
  return c;
}
const saveCfg = c => ls.set(K_CFG, JSON.stringify(c));
const online = () => navigator.onLine !== false;
const key = () => (ls.get(K_KEY) || '').trim();
function status() { if (!online()) return 'offline'; if (!key()) return 'no_key'; return 'ok'; }
function keyHint() { const k = key(); return k ? k.slice(0, 7) + '…' + k.slice(-4) : ''; }
function modelName(id) { const m = MODELS.find(x => x[0] === id); return m ? m[2] : id; }
function effortName(id) { const e = EFFORTS.find(x => x[0] === id); return e ? e[1].toLocaleLowerCase('az') : id; }
function modelLabel() { const c = cfg(); return `${modelName(c.model)} · düşünmə: ${effortName(c.effort)} · öz API açarın`; }
// hash: a place (c5, c3s4, muellim…) and optionally the Claude action to start there (c3s4-simple, g12-term)
function artifactLink(hash) { return ARTIFACT + (hash && /^[a-z0-9]+(-[a-z]+)?$/i.test(hash) ? '#' + hash : ''); }

/* ---------- Claude: Messages API, streamed, from the browser ---------- */
function apiHeaders(k, json) {
  const h = { 'x-api-key': k, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' };
  if (json) h['content-type'] = 'application/json';
  return h;
}
function httpErr(status, j) {
  const t = (j && j.error && j.error.type) || '';
  const m = (j && j.error && j.error.message) || '';
  let code = 'upstream_error';
  if (status === 401 || t === 'authentication_error') code = 'auth';
  else if (status === 402 || t === 'billing_error' || /credit balance|billing/i.test(m)) code = 'credit';
  else if (status === 403 || t === 'permission_error') code = 'permission';
  else if (status === 404 || t === 'not_found_error') code = 'model';
  else if (status === 413 || t === 'request_too_large') code = 'prompt_too_large';
  else if (status === 429 || t === 'rate_limit_error') code = 'rate_limited';
  else if (status === 529 || status === 503 || t === 'overloaded_error') code = 'overloaded';
  else if (status === 400 || t === 'invalid_request_error') code = 'bad_request';
  return { code, message: m || ('HTTP ' + status), status };
}
const memo = new Map();
function addUsage(inp, out) {
  const c = cfg();
  c.usage.n += 1; c.usage.inp += inp || 0; c.usage.out += out || 0;
  saveCfg(c); emit('usage');
}
function resetUsage() { const c = cfg(); c.usage = { n: 0, inp: 0, out: 0, since: Date.now() }; saveCfg(c); emit('usage'); }

/* Same contract as the artifact's sample(): resolves {text, truncated}, rejects {code, message, text?}. */
async function sample(input, opts) {
  opts = opts || {};
  const st = status();
  if (st !== 'ok') throw { code: st, message: st };
  if (opts.signal && opts.signal.aborted) throw { code: 'cancelled', message: 'cancelled', text: '' };
  const c = cfg();
  const raw = typeof input === 'string' ? [{ role: 'user', content: input }]
    : (Array.isArray(input) ? input : []).map(m => ({ role: m && m.role === 'assistant' ? 'assistant' : 'user', content: String(m && m.content != null ? m.content : '') }));
  const msgs = [];
  raw.forEach(m => { if (!m.content) return; const p = msgs[msgs.length - 1]; if (p && p.role === m.role) p.content += '\n\n' + m.content; else msgs.push({ role: m.role, content: m.content }); });
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  if (!msgs.length) throw { code: 'invalid_input', message: 'empty input' };
  const ck = opts.cache ? JSON.stringify([c.model, c.effort, msgs]) : '';
  if (ck) {
    const hit = memo.get(ck);
    if (hit && Date.now() - hit.t < 300000) {
      if (typeof opts.onText === 'function') { try { opts.onText({ text: hit.r.text, delta: hit.r.text }); } catch (e) { } }
      return Object.assign({}, hit.r);
    }
  }
  // the long first turn (book context) is cached server-side so follow-up turns cost less
  const messages = msgs.map((m, i) => i === 0 && m.content.length > 3500
    ? { role: m.role, content: [{ type: 'text', text: m.content, cache_control: { type: 'ephemeral' } }] }
    : m);
  const body = { model: c.model, max_tokens: c.effort === 'max' ? 64000 : 32000, stream: true, output_config: { effort: c.effort }, messages };
  let resp;
  try {
    resp = await fetch(API + '/messages', { method: 'POST', headers: apiHeaders(key(), true), body: JSON.stringify(body), signal: opts.signal });
  } catch (e) {
    if (opts.signal && opts.signal.aborted) throw { code: 'cancelled', message: 'cancelled', text: '' };
    throw { code: online() ? 'network' : 'offline', message: String(e && e.message || e) };
  }
  if (!resp.ok) {
    let j = null; try { j = await resp.json(); } catch (e) { j = null; }
    throw httpErr(resp.status, j);
  }
  let text = '', stop = null, inp = 0, out = 0, streamErr = null, blocks = 0;
  const say = delta => { if (typeof opts.onText === 'function') { try { opts.onText({ text, delta }); } catch (e) { } } };
  try {
    const reader = resp.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    for (;;) {
      const r = await reader.read();
      if (r.done) break;
      buf += dec.decode(r.value, { stream: true }).replace(/\r\n?/g, '\n');
      let i;
      while ((i = buf.indexOf('\n\n')) >= 0) {
        const chunk = buf.slice(0, i); buf = buf.slice(i + 2);
        let data = '';
        chunk.split('\n').forEach(line => { if (line.startsWith('data:')) data += line.slice(5).replace(/^ /, ''); });
        if (!data) continue;
        let ev; try { ev = JSON.parse(data); } catch (e) { continue; }
        if (ev.type === 'message_start' && ev.message && ev.message.usage) {
          const u = ev.message.usage; inp = (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0); out = u.output_tokens || 0;
        } else if (ev.type === 'content_block_start' && ev.content_block && ev.content_block.type === 'text') {
          if (blocks++ && text && !/\s$/.test(text)) { text += '\n\n'; }
        } else if (ev.type === 'content_block_delta' && ev.delta && ev.delta.type === 'text_delta') {
          text += ev.delta.text; say(ev.delta.text);
        } else if (ev.type === 'message_delta') {
          if (ev.delta && ev.delta.stop_reason) stop = ev.delta.stop_reason;
          if (ev.usage && ev.usage.output_tokens != null) out = ev.usage.output_tokens;
        } else if (ev.type === 'error') {
          streamErr = ev.error || { type: 'api_error' };
        }
      }
    }
  } catch (e) {
    if (inp || out) addUsage(inp, out);
    if (opts.signal && opts.signal.aborted) throw { code: 'cancelled', message: 'cancelled', text };
    throw { code: online() ? 'network' : 'offline', message: String(e && e.message || e), text };
  }
  addUsage(inp, out);
  if (streamErr) throw Object.assign(httpErr(streamErr.type === 'overloaded_error' ? 529 : 500, { error: streamErr }), { text });
  if (stop === 'refusal') throw { code: 'refused', message: 'refused', text };
  if (!text.trim()) throw { code: 'empty_completion', message: 'empty' };
  const res = { text, truncated: stop === 'max_tokens', modelApplied: c.model, modelTierApplied: 'complex', usage: { input: inp, output: out } };
  if (ck) { memo.set(ck, { t: Date.now(), r: res }); if (memo.size > 40) memo.delete(memo.keys().next().value); }
  return res;
}

async function testKey(k) {
  k = (k || '').trim();
  if (!k) return { ok: false, code: 'no_key' };
  if (!online()) return { ok: false, code: 'offline' };
  try {
    const r = await fetch(API + '/models?limit=1', { headers: apiHeaders(k, false) });
    if (r.ok) return { ok: true };
    let j = null; try { j = await r.json(); } catch (e) { j = null; }
    return Object.assign({ ok: false }, httpErr(r.status, j));
  } catch (e) { return { ok: false, code: 'network', message: String(e && e.message || e) }; }
}
function setKey(k) { const ok = ls.set(K_KEY, (k || '').trim()); emit('key'); return ok; }
function clearKey() { ls.del(K_KEY); memo.clear(); emit('key'); }
function setModel(id) { if (!MODELS.some(m => m[0] === id)) return; const c = cfg(); c.model = id; saveCfg(c); emit('key'); }
function setEffort(id) { if (!EFFORTS.some(m => m[0] === id)) return; const c = cfg(); c.effort = id; saveCfg(c); emit('key'); }

/* ---------- service worker: offline cache + updates ---------- */
const sw = { supported: 'serviceWorker' in navigator && window.isSecureContext && location.protocol !== 'file:', reg: null, ready: false, updated: false, error: '' };
let swTries = 0;
async function checkCache() {
  try {
    if (await caches.has(CACHE)) {
      const n = (await (await caches.open(CACHE)).keys()).length;
      sw.ready = n >= ASSET_COUNT;
    }
  } catch (e) { sw.ready = false; }
  emit('sw');
  if (!sw.ready && ++swTries < 40) setTimeout(checkCache, 1500);
}
function showUpdateBar() {
  if (document.getElementById('pwa-bar')) return;
  const bar = document.createElement('div');
  bar.id = 'pwa-bar'; bar.className = 'pwa-bar'; bar.setAttribute('role', 'status');
  bar.innerHTML = '<span>Kitabın yeni versiyası yükləndi.</span><button type="button">Yenilə</button>';
  bar.querySelector('button').addEventListener('click', () => location.reload());
  document.body.appendChild(bar);
}
if (sw.supported) {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController && !sw.updated) { sw.updated = true; emit('sw'); showUpdateBar(); } });
  window.addEventListener('load', async () => {
    try {
      sw.reg = await navigator.serviceWorker.register('./sw.js', { scope: './' });
      await navigator.serviceWorker.ready;
      checkCache();
    } catch (e) { sw.error = String(e && e.message || e); emit('sw'); }
  });
}
async function checkUpdate() {
  if (!sw.reg) return 'none';
  try { await sw.reg.update(); } catch (e) { return online() ? 'error' : 'offline'; }
  return sw.reg.installing || sw.reg.waiting ? 'found' : 'latest';
}

/* ---------- install ---------- */
let deferred = null;
const isStandalone = () => { try { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch (e) { return false; } };
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; emit('install'); });
window.addEventListener('appinstalled', () => { deferred = null; emit('install'); });
function installState() { if (isStandalone()) return 'installed'; if (deferred) return 'prompt'; if (isIOS()) return 'ios'; return 'none'; }
async function install() {
  if (!deferred) return false;
  const d = deferred; deferred = null;
  try { await d.prompt(); const ch = await d.userChoice; emit('install'); return !!ch && ch.outcome === 'accepted'; } catch (e) { emit('install'); return false; }
}

/* ---------- storage, files ---------- */
async function persisted() { try { return !!(navigator.storage && navigator.storage.persisted && await navigator.storage.persisted()); } catch (e) { return false; } }
async function persist() { try { if (navigator.storage && navigator.storage.persist) return await navigator.storage.persist(); } catch (e) { } return false; }
async function saveFile(name, text) {
  const file = new File([text], name, { type: 'application/json' });
  let coarse = false; try { coarse = matchMedia('(pointer: coarse)').matches; } catch (e) { }
  if (coarse && navigator.canShare && navigator.share) {
    try {
      if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name }); return 'shared'; }
    } catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a'); a.href = url; a.download = name; a.hidden = true;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return 'downloaded';
}
function pickFile() {
  return new Promise(resolve => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'application/json,.json'; inp.hidden = true;
    inp.addEventListener('change', () => {
      const f = inp.files && inp.files[0]; inp.remove();
      if (!f) { resolve(null); return; }
      const rd = new FileReader();
      rd.onload = () => resolve(String(rd.result || ''));
      rd.onerror = () => resolve(null);
      rd.readAsText(f);
    });
    document.body.appendChild(inp); inp.click();
  });
}

/* ---------- theme colour of the system bars follows the app theme ---------- */
function syncTheme() {
  let bg = '';
  try { bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(); } catch (e) { }
  if (!bg) return;
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  metas.forEach((m, i) => { if (i === 0) { m.setAttribute('content', bg); m.removeAttribute('media'); } else m.remove(); });
}
try {
  new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-app-theme', 'data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => setTimeout(syncTheme, 0));
} catch (e) { }
document.addEventListener('DOMContentLoaded', () => {
  syncTheme();
  if (isStandalone()) persist();
});

/* ---------- network ---------- */
window.addEventListener('online', () => emit('net'));
window.addEventListener('offline', () => emit('net'));

window.QA_PWA = {
  VERSION, ARTIFACT, MODELS, EFFORTS,
  sample, status, online, hasKey: () => !!key(), keyHint, setKey, clearKey, testKey,
  cfg, setModel, setEffort, resetUsage, modelLabel, modelName, artifactLink,
  sw, checkUpdate, installState, install, isIOS, isStandalone,
  persisted, persist, saveFile, pickFile, on
};
})();
