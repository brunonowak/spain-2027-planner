// Shared state, helpers and actions for the TV and phone sites.
import * as S from './store.js';
import { ROUTES, CARDS, TRIP_START } from './seed.js';

export { isDemo } from './store.js';

export const STEPS = [
  { id: 'route', label: 'Pick the route' },
  { id: 'bases', label: 'Fill each base' },
  { id: 'splits', label: 'Settle the splits' },
  { id: 'days', label: 'Build the days' },
];

export const CITIES = {
  madrid: 'Madrid', seville: 'Seville', granada: 'Granada', malaga: 'Málaga',
  valencia: 'Valencia', oviedo: 'Oviedo', leon: 'León',
};

export const CATS = {
  sight: { label: 'Sight', icon: '🏛️' },
  daytrip: { label: 'Day trip', icon: '🚆' },
  food: { label: 'Food & drink', icon: '🍷' },
  experience: { label: 'Experience', icon: '💃' },
  hotel: { label: 'Hotel', icon: '🛏️' },
  other: { label: 'Other', icon: '✨' },
};

export const VOTES = [
  { id: 'must', label: 'Must do', short: 'Must' },
  { id: 'if', label: 'If time', short: 'If time' },
  { id: 'skip', label: 'Skip', short: 'Skip' },
];

// ---------- small helpers ----------
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function addDays(iso, n) {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function fmtDate(iso, opts = { weekday: 'short', month: 'short', day: 'numeric' }) {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' });
}
export const initials = (name) => (name || '?').trim().slice(0, 1).toUpperCase();

/** Nights of a route: [{date, city, stay}] where stay = index of the base. */
export function routeNights(route) {
  const out = [];
  let date = TRIP_START;
  (route?.bases || []).forEach((b, stay) => {
    for (let i = 0; i < b.nights; i++) { out.push({ date, city: b.city, stay }); date = addDays(date, 1); }
  });
  return out;
}
/** Unique cities of a route, in travel order. */
export const routeCities = (route) => [...new Set((route?.bases || []).map((b) => b.city))];

export function baseDateRange(route, stay) {
  const n = routeNights(route).filter((x) => x.stay === stay);
  return n.length ? `${fmtDate(n[0].date, { month: 'short', day: 'numeric' })} – ${fmtDate(addDays(n[n.length - 1].date, 1), { month: 'short', day: 'numeric' })}` : '';
}

// ---------- tiers ----------
export function voteCounts(card) {
  const v = Object.values(card.votes || {});
  return { must: v.filter((x) => x === 'must').length, if: v.filter((x) => x === 'if').length, skip: v.filter((x) => x === 'skip').length, n: v.length };
}
export function autoTier(card) {
  const { must, if: ifc, skip, n } = voteCounts(card);
  if (!n) return 'none';
  if (must && skip) return 'split';
  if (!skip) return must * 2 >= n ? 'must' : 'if';
  return skip * 2 > n ? 'skip' : (ifc ? 'if' : 'split');
}
export const tierOf = (card) => card.decision || autoTier(card);
/** Has the group's verdict on a card been revealed? (decided, everyone voted, or revealed on the TV) */
export function revealed(card) {
  if (card.decision || state.session?.reveal?.[card.id]) return true;
  const vs = voters();
  return vs.length > 0 && vs.every((v) => v.uid && card.votes?.[v.uid]);
}
export const TIER_LABEL = { must: 'Must do', if: 'If time', skip: 'Skip', split: 'Split', none: 'No votes yet' };

// ---------- YouTube / images ----------
export function parseVideo(url, startOverride) {
  if (!url) return null;
  let u;
  try { u = new URL(url.trim()); } catch { return null; }
  let id = null;
  if (/youtu\.be$/.test(u.hostname)) id = u.pathname.slice(1).split('/')[0];
  else if (/youtube\.com$/.test(u.hostname)) id = u.searchParams.get('v') || (u.pathname.match(/\/(shorts|embed|live)\/([^/?]+)/) || [])[2];
  const t = startOverride || u.searchParams.get('t') || u.searchParams.get('start') || '';
  const start = toSeconds(t);
  if (!id) return { kind: 'link', url: u.href };
  return { kind: 'youtube', id, start, embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&start=${start}`, url: u.href };
}
function toSeconds(t) {
  if (!t) return 0;
  if (/^\d+$/.test(String(t))) return +t;
  const m = String(t).match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
  return m ? (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0) : 0;
}
export const youtubeSearch = (card) => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${card.title} ${CITIES[card.city] || ''} Spain travel`)}`;

const imgCache = new Map();
try { Object.entries(JSON.parse(sessionStorage.getItem('wikiImg') || '{}')).forEach(([k, v]) => imgCache.set(k, v)); } catch {}
let onImage = () => {};
export const setImageListener = (fn) => { onImage = fn; };
/** Returns an image URL for a card now if known; otherwise fetches from Wikipedia and calls the listener. */
export function cardImage(card) {
  if (card.image) return card.image;
  if (!card.wiki) return null;
  if (imgCache.has(card.wiki)) return imgCache.get(card.wiki);
  imgCache.set(card.wiki, null);
  fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(card.wiki)}`)
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => {
      let src = null;
      if (j?.originalimage?.width && j.originalimage.width <= 2400) src = j.originalimage.source;
      else if (j?.thumbnail?.source) src = j.thumbnail.source.replace(/\/\d+px-/, '/1600px-');
      imgCache.set(card.wiki, src);
      try { sessionStorage.setItem('wikiImg', JSON.stringify(Object.fromEntries(imgCache))); } catch {}
      if (src) onImage();
    })
    .catch(() => {});
  return null;
}
export function imageHtml(card, cls = '') {
  const src = cardImage(card);
  const icon = CATS[card.cat]?.icon || '✨';
  return src
    ? `<img class="${cls}" src="${esc(src)}" alt="" loading="lazy" referrerpolicy="no-referrer">`
    : `<div class="${cls} img-fallback"><span>${icon}</span></div>`;
}

// ---------- live state ----------
export const state = {
  user: null, me: null, session: null, routes: [], cards: [], rankings: [], people: [],
  members: [], parking: [], history: [], days: [], flights: null, ready: false,
};
const listeners = new Set();
export const onState = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
let notifyQueued = false;
function notify() {
  if (notifyQueued) return;
  notifyQueued = true;
  setTimeout(() => { notifyQueued = false; listeners.forEach((fn) => fn(state)); }, 0);
}
setImageListener(notify);

export const route = (id) => state.routes.find((r) => r.id === id);
export const lockedRoute = () => route(state.session?.lockedRoute);
export const card = (id) => state.cards.find((c) => c.id === id);
export const sortedCards = (list) => [...list].sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9) || (a.createdAt || 0) - (b.createdAt || 0));
export const cardsFor = (city) => sortedCards(state.cards.filter((c) => c.city === city));

/** Everyone who can vote: members list (names) joined to signed-in people (uids). */
export function voters() {
  const byEmail = new Map(state.people.map((p) => [p.email, p]));
  const list = state.members.map((m) => ({ email: m.id, name: m.name || m.id, uid: byEmail.get(m.id)?.uid || null }));
  // people who signed in but aren't in members (e.g. the owner before adding themself)
  state.people.forEach((p) => { if (!list.some((x) => x.email === p.email)) list.push({ email: p.email, name: p.name, uid: p.uid }); });
  return list;
}
export const nameOf = (uid) => state.people.find((p) => p.uid === uid)?.name || 'Someone';

// ---------- boot: sign-in + subscriptions ----------
export async function boot(root, { surface }) {
  root.innerHTML = `<div class="center-screen"><div class="spinner"></div></div>`;
  await S.initStore();
  return new Promise((resolve) => {
    S.auth().onChange(async (u) => {
      if (!u) return renderSignIn(root, surface);
      if (state.me?.uid === u.uid) return; // already running for this user
      state.user = u;
      // Membership check. Only a "permission-denied" answer means not on the list;
      // anything else (network hiccup, token not ready yet on mobile) is retried, then shown as an error.
      let err = null;
      for (let attempt = 0; attempt < 4; attempt++) {
        try { await S.getDoc('session/state'); err = null; break; }
        catch (e) { err = e; console.warn('membership check', attempt, e); if (e?.code === 'permission-denied' && attempt >= 1) break; await new Promise((r) => setTimeout(r, 800 * (attempt + 1))); }
      }
      if (err?.code === 'permission-denied') return renderNotAllowed(root, u, err);
      if (err) return renderError(root, err);
      const memberDoc = await S.getDoc('members/' + u.email).catch(() => null);
      const name = memberDoc?.name || (u.displayName || u.email).split(' ')[0];
      state.me = { uid: u.uid, email: u.email, name };
      S.setDoc('people/' + u.uid, { uid: u.uid, email: u.email, name, lastSeen: Date.now() }, true).catch(() => {});
      if (S.isDemo && !(await S.getDoc('routes/r1'))) await seedDemo();
      subscribeAll();
      resolve(state);
    });
  });
}

function subscribeAll() {
  const col = (path, key) => S.watchCol(path, (v) => { state[key] = v; notify(); });
  S.watchDoc('session/state', (v) => {
    state.session = v;
    if (!v) S.setDoc('session/state', { step: 'route', baseIndex: 0, cardIndex: 0 }, true).catch(() => {});
    state.ready = true;
    notify();
  });
  S.watchDoc('meta/flights', (v) => { state.flights = v; notify(); });
  col('routes', 'routes');
  col('cards', 'cards');
  col('rankings', 'rankings');
  col('people', 'people');
  col('members', 'members');
  col('parking', 'parking');
  col('history', 'history');
  col('days', 'days');
}

function renderSignIn(root, surface) {
  root.innerHTML = `
    <div class="center-screen signin">
      <div class="signin-card">
        <div class="brand-mark">🇪🇸</div>
        <h1>Spain 2027</h1>
        <p class="muted">${surface === 'tv' ? 'TV planner' : 'Trip planner'} for Bruno, Zita, Kim &amp; Gary</p>
        <button class="btn btn-signin" data-signin="google"><span class="g">G</span> Sign in with Google</button>
        <button class="btn btn-signin" data-signin="microsoft"><span class="ms">▦</span> Sign in with Microsoft</button>
        <p class="tiny muted" id="signin-err"></p>
      </div>
    </div>`;
  root.querySelectorAll('[data-signin]').forEach((b) =>
    b.addEventListener('click', async () => {
      try { await S.auth().signIn(b.dataset.signin); }
      catch (e) {
        const msg = e?.code === 'auth/operation-not-allowed' ? 'That sign-in option isn’t switched on yet — try Google.' : (e?.message || 'Sign-in failed');
        root.querySelector('#signin-err').textContent = msg;
      }
    }));
}

function renderError(root, e) {
  root.innerHTML = `
    <div class="center-screen signin">
      <div class="signin-card">
        <div class="brand-mark">⚠️</div>
        <h1>Couldn’t connect</h1>
        <p>The trip data didn’t load. Check your connection and try again.</p>
        <p class="tiny muted">${esc(e?.code || '')} ${esc(e?.message || '')}</p>
        <button class="btn btn-primary" onclick="location.reload()">Try again</button>
      </div>
    </div>`;
}

function renderNotAllowed(root, u, err) {
  root.innerHTML = `
    <div class="center-screen signin">
      <div class="signin-card">
        <div class="brand-mark">🔒</div>
        <h1>Not on the list yet</h1>
        <p>You’re signed in as <b>${esc(u.email)}</b>, which isn’t on the trip’s guest list.</p>
        <p class="muted">Send that address to Bruno so he can add you.</p>
        <p class="tiny muted">${esc(err?.code || '')}</p>
        <button class="btn" id="signout">Use a different account</button>
      </div>
    </div>`;
  root.querySelector('#signout').onclick = () => S.auth().signOut();
}
export const signOut = () => S.auth().signOut();

// ---------- actions ----------
const now = () => Date.now();
const clone = (o) => (o == null ? null : JSON.parse(JSON.stringify(o)));
const strip = (o) => { const x = clone(o); if (x) delete x.id; return x; };

async function log(label, path, before) {
  try { await S.addDoc('history', { label, path, before: strip(before), by: state.me?.name || '', at: now() }); } catch (e) { console.warn(e); }
}

export const setSession = (patch) => S.setDoc('session/state', { ...patch, updatedBy: state.me?.name || '', updatedAt: now() }, true);

export function vote(cardId, v) {
  const c = card(cardId);
  const mine = c?.votes?.[state.me.uid];
  return S.updateDoc('cards/' + cardId, { ['votes.' + state.me.uid]: mine === v ? S.deleteField() : v });
}

export async function saveCard(id, patch, label) {
  const before = card(id);
  await S.updateDoc('cards/' + id, { ...patch, updatedAt: now(), updatedBy: state.me.name });
  await log(label || `Edited “${before?.title || 'card'}”`, 'cards/' + id, before);
}
export async function addCard(data) {
  const id = await S.addDoc('cards', { ...data, votes: {}, createdAt: now(), createdBy: state.me.name });
  await log(`Added “${data.title}”`, 'cards/' + id, null);
  return id;
}
export async function deleteCard(id) {
  const before = card(id);
  await S.deleteDoc('cards/' + id);
  await log(`Deleted “${before?.title || 'card'}”`, 'cards/' + id, before);
}
export const decide = (id, tier) => saveCard(id, { decision: tier || S.deleteField() }, tier ? `Decided “${card(id)?.title}”: ${TIER_LABEL[tier]}` : `Re-opened “${card(id)?.title}”`);
export const scheduleCard = (id, date) => saveCard(id, { day: date || S.deleteField() }, date ? `Put “${card(id)?.title}” on ${fmtDate(date)}` : `Unscheduled “${card(id)?.title}”`);

export async function undo(h) {
  if (h.before) await S.setDoc(h.path, h.before);
  else await S.deleteDoc(h.path);
  await S.updateDoc('history/' + h.id, { undone: true, undoneBy: state.me.name });
}

export const setRanking = (order) => S.setDoc('rankings/' + state.me.uid, { uid: state.me.uid, name: state.me.name, order, at: now() });

export async function lockRoute(id) {
  const before = state.session ? { ...state.session } : null;
  await setSession({ lockedRoute: id || null });
  await log(id ? `Locked route: ${route(id)?.name}` : 'Unlocked the route', 'session/state', before);
}

export async function addIdea(text) {
  const id = await S.addDoc('parking', { text, by: state.me.name, at: now() });
  await log(`Added idea “${text.slice(0, 40)}”`, 'parking/' + id, null);
}
export async function deleteIdea(item) {
  await S.deleteDoc('parking/' + item.id);
  await log(`Removed idea “${item.text.slice(0, 40)}”`, 'parking/' + item.id, item);
}
export const setDayNote = (date, note) => S.setDoc('days/' + date, { note, by: state.me.name, at: now() }, true);

export async function addComment(cardId, text) {
  await S.addDoc(`cards/${cardId}/comments`, { text, by: state.me.name, uid: state.me.uid, at: now() });
}
export const watchComments = (cardId, cb) => S.watchCol(`cards/${cardId}/comments`, (list) => cb(list.sort((a, b) => a.at - b.at)));

/** Route ranking: Borda count (1st = 4 pts … 4th = 1 pt). */
export function routeScores() {
  const n = state.routes.length;
  const scores = Object.fromEntries(state.routes.map((r) => [r.id, { route: r, points: 0, firsts: 0 }]));
  state.rankings.forEach((rk) => (rk.order || []).forEach((id, i) => { if (scores[id]) { scores[id].points += n - i; if (i === 0) scores[id].firsts++; } }));
  return Object.values(scores).sort((a, b) => b.points - a.points || b.firsts - a.firsts);
}

/** Steps of the "bases" walkthrough for the locked route. */
export function baseWalk() {
  const r = lockedRoute();
  const cities = routeCities(r);
  const s = state.session || {};
  const bi = Math.min(s.baseIndex || 0, Math.max(cities.length - 1, 0));
  const city = cities[bi];
  const list = city ? cardsFor(city) : [];
  const ci = Math.min(s.cardIndex || 0, Math.max(list.length - 1, 0));
  return { route: r, cities, bi, city, list, ci, card: list[ci] };
}

export function stepNav(dir) {
  const s = state.session || {};
  const stepIdx = STEPS.findIndex((x) => x.id === (s.step || 'route'));
  if (s.step === 'bases') {
    const w = baseWalk();
    if (dir > 0) {
      if (w.ci < w.list.length - 1) return setSession({ cardIndex: w.ci + 1 });
      if (w.bi < w.cities.length - 1) return setSession({ baseIndex: w.bi + 1, cardIndex: 0 });
    } else {
      if (w.ci > 0) return setSession({ cardIndex: w.ci - 1 });
      if (w.bi > 0) return setSession({ baseIndex: w.bi - 1, cardIndex: Math.max(cardsFor(w.cities[w.bi - 1]).length - 1, 0) });
    }
  }
  const next = Math.min(Math.max(stepIdx + dir, 0), STEPS.length - 1);
  if (next === stepIdx) return;
  const patch = { step: STEPS[next].id };
  if (STEPS[next].id === 'bases') {
    const cities = routeCities(lockedRoute());
    if (dir > 0) Object.assign(patch, { baseIndex: 0, cardIndex: 0 });
    else Object.assign(patch, { baseIndex: Math.max(cities.length - 1, 0), cardIndex: Math.max(cardsFor(cities[cities.length - 1]).length - 1, 0) });
  }
  return setSession(patch);
}
export const goStep = (id) => setSession({ step: id, ...(id === 'bases' ? { baseIndex: 0, cardIndex: 0 } : {}) });

/** Cards that make the plan for the locked route (must-dos, optionally if-time). */
export function planCards(includeIf) {
  const cities = routeCities(lockedRoute());
  return sortedCards(state.cards.filter((c) => cities.includes(c.city) && (tierOf(c) === 'must' || (includeIf && tierOf(c) === 'if'))));
}

// ---------- seeding (setup page) ----------
export async function seedStarter() {
  let added = 0;
  for (const r of ROUTES) {
    if (!(await S.getDoc('routes/' + r.id))) { const { id, ...rest } = r; await S.setDoc('routes/' + id, rest); added++; }
  }
  for (const [i, c] of CARDS.entries()) {
    if (!(await S.getDoc('cards/' + c.id))) {
      const { id, ...rest } = c;
      await S.setDoc('cards/' + id, { ...rest, order: i, votes: {}, createdAt: now() + i, createdBy: 'Starter' });
      added++;
    }
  }
  if (!(await S.getDoc('session/state'))) await S.setDoc('session/state', { step: 'route', baseIndex: 0, cardIndex: 0 });
  return added;
}
async function seedDemo() {
  await seedStarter();
  for (const n of ['Bruno', 'Zita', 'Kim', 'Gary']) {
    const email = n.toLowerCase() + '@demo.local';
    await S.setDoc('members/' + email, { name: n });
    await S.setDoc('people/demo-' + n.toLowerCase(), { uid: 'demo-' + n.toLowerCase(), email, name: n });
  }
  const { DEMO_FLIGHTS } = await import('./demo-flights.js');
  await S.setDoc('meta/flights', DEMO_FLIGHTS);
}
export { S as store };
