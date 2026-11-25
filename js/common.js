// Shared state, helpers and actions for the TV and phone sites.
import * as S from './store.js?v=622549';
import { ROUTES, CARDS, DETAILS, PRICES, TRIP_START } from './seed.js?v=622549';
import { EXTRA_CARDS, MOVES, ARRIVAL, DEPARTURE, LEG_OPTIONS } from './seed-extra.js?v=622549';

export { isDemo } from './store.js?v=622549';

/** Build tag of the code that's running, shown on screen so an out-of-date page is easy to spot. */
export const VERSION = new URL(import.meta.url).searchParams.get('v') || 'dev';

/** The stages of the planning session, in order. Each stage is walked city by city (or leg by leg). */
export const STEPS = [
  { id: 'route', label: 'Route', icon: '🗺️', kind: 'rank' },
  { id: 'hotels', label: 'Hotels', icon: '🛏️', kind: 'pick' },
  { id: 'travel', label: 'Travel', icon: '🚆', kind: 'leg' },
  { id: 'sights', label: 'Sights', icon: '🏛️', kind: 'tier', cats: ['sight', 'daytrip', 'experience', 'other'] },
  { id: 'food', label: 'Food', icon: '🍽️', kind: 'tier', cats: ['restaurant', 'food', 'dish'] },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', kind: 'tier', cats: ['shop'] },
  { id: 'days', label: 'Days', icon: '🗓️', kind: 'days' },
];
export const stepDef = (id) => STEPS.find((s) => s.id === id) || STEPS[0];

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
  restaurant: { label: 'Restaurant', icon: '🍽️' },
  dish: { label: 'Taste', icon: '🥘' },
  shop: { label: 'Shop', icon: '🛍️' },
  other: { label: 'Other', icon: '✨' },
};

/** Sections each base is walked through, in order. */
export const GROUPS = [
  { id: 'see', label: 'Sights & trips', icon: '🏛️', cats: ['sight', 'daytrip', 'experience', 'other'] },
  { id: 'stay', label: 'Hotels', icon: '🛏️', cats: ['hotel'] },
  { id: 'eat', label: 'Restaurants', icon: '🍽️', cats: ['restaurant', 'food'] },
  { id: 'taste', label: 'Tastes', icon: '🥘', cats: ['dish'] },
  { id: 'shop', label: 'Shops', icon: '🛍️', cats: ['shop'] },
];
export const groupOf = (card) => GROUPS.find((g) => g.cats.includes(card.cat))?.id || 'see';

/** Time slots in a day. */
export const SLOTS = [
  { id: 'morning', label: 'Morning', icon: '🌅' },
  { id: 'lunch', label: 'Lunch', icon: '🍽️' },
  { id: 'afternoon', label: 'Afternoon', icon: '☀️' },
  { id: 'dinner', label: 'Dinner', icon: '🍷' },
  { id: 'evening', label: 'Evening', icon: '🌙' },
];
export function defaultSlot(card) {
  if (card.cat === 'restaurant') return /dinner|tapas|aperitif/i.test(card.time || '') && !/lunch/i.test(card.time || '') ? 'dinner' : 'lunch';
  if (card.cat === 'food' || card.cat === 'experience') return 'evening';
  if (card.cat === 'shop') return 'afternoon';
  return 'morning';
}
/** Labels for the three fact boxes, by category. */
export function factLabels(card) {
  if (card.cat === 'hotel') return ['Area', 'Per night (room)', 'Good to know'];
  if (card.cat === 'restaurant') return ['Best for', 'Per person', 'Booking'];
  if (card.cat === 'shop') return ['Where', 'Prices', 'Shipping'];
  if (card.cat === 'dish') return ['When', 'Price', 'Booking'];
  return ['Time', 'Cost per person', 'Book ahead?'];
}
export const mapsLink = (card) => card.link && /google\.com\/maps/.test(card.link) ? card.link : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${card.title} ${CITIES[card.city] || ''} Spain`)}`;

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
  return n.length ? `${fmtDate(n[0].date, { month: 'short', day: 'numeric' })} → ${fmtDate(addDays(n[n.length - 1].date, 1), { month: 'short', day: 'numeric' })}` : ''; // check-in → check-out
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

const imgCache = new Map(); // wiki title -> { src, small } | null
try { Object.entries(JSON.parse(sessionStorage.getItem('wikiImg4') || '{}')).forEach(([k, v]) => imgCache.set(k, v)); } catch {}
let onImage = () => {};
export const setImageListener = (fn) => { onImage = fn; };
/** Wikipedia photo + intro for an article title, fetched once and cached. */
function wikiInfo(title) {
  if (!title) return null;
  if (imgCache.has(title)) return imgCache.get(title);
  imgCache.set(title, null);
  fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => {
      if (!j) return;
      const thumb = j.thumbnail?.source || null;
      // Wikimedia serves resized copies only at sizes up to the original width; use a standard
      // large size when the original is big enough, and keep the API's own thumbnail as a fallback.
      const ow = j.originalimage?.width || 0;
      const size = ow >= 1280 ? 1280 : ow >= 960 ? 960 : 0;
      const src = thumb && size && /\/\d+px-/.test(thumb) ? thumb.replace(/\/\d+px-/, `/${size}px-`) : thumb;
      imgCache.set(title, { src, small: thumb, extract: j.extract || '', url: j.content_urls?.desktop?.page || '' });
      try { sessionStorage.setItem('wikiImg4', JSON.stringify(Object.fromEntries(imgCache))); } catch {}
      onImage();
    })
    .catch(() => {});
  return null;
}
function cardImageInfo(card) {
  return card.image ? { src: card.image, small: null } : wikiInfo(card.wiki);
}
export const cardImage = (card) => cardImageInfo(card)?.src || null;
/** Wikipedia intro paragraph + link for a card (fetched with the photo). */
export function cardWiki(card) { const i = wikiInfo(card.wiki); return i?.extract ? { extract: i.extract, url: i.url } : null; }

// If a photo fails to load, try the small Wikipedia thumbnail, then fall back to the icon tile.
window.__imgFail = (img) => {
  const small = img.dataset.small;
  if (small && img.src !== small) { img.dataset.small = ''; img.src = small; return; }
  const div = document.createElement('div');
  div.className = `${img.className} img-fallback`;
  div.innerHTML = `<span>${img.dataset.icon || '✨'}</span>`;
  img.replaceWith(div);
};
export function imageHtml(card, cls = '') {
  const info = cardImageInfo(card);
  const icon = CATS[card.cat]?.icon || '✨';
  return info?.src
    ? `<img class="${cls}" src="${esc(info.src)}" data-small="${esc(info.small || '')}" data-icon="${icon}" alt="" loading="lazy" onerror="__imgFail(this)">`
    : `<div class="${cls} img-fallback"><span>${icon}</span></div>`;
}

// ---------- live state ----------
export const state = {
  user: null, me: null, session: null, routes: [], cards: [], rankings: [], people: [],
  members: [], parking: [], history: [], days: [], flights: null, picks: {}, ready: false,
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
  // Hotel and travel picks live next to the session state (session/pick-<key>).
  S.watchCol('session', (list) => { state.picks = Object.fromEntries(list.filter((d) => d.id.startsWith('pick-')).map((d) => [d.id.slice(5), d.votes || {}])); notify(); });
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
export function scheduleCard(id, date, slot) {
  const c = card(id);
  if (!date) return saveCard(id, { day: S.deleteField(), slot: S.deleteField() }, `Unscheduled “${c?.title}”`);
  const sl = slot || c?.slot || defaultSlot(c || {});
  return saveCard(id, { day: date, slot: sl }, `Put “${c?.title}” on ${fmtDate(date)} (${SLOTS.find((x) => x.id === sl)?.label})`);
}

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

/** Positions to walk through in a stage: one per city (hotels), per leg (travel), or per card then a splits screen. */
export function stageSeq(stepId) {
  const st = stepDef(stepId);
  const r = lockedRoute();
  const cities = routeCities(r);
  if (st.kind === 'pick') return cities.map((city) => ({ city }));
  if (st.kind === 'leg') return legsFor(r).map((leg) => ({ leg: leg.i, city: leg.to }));
  if (st.kind === 'tier') {
    const out = [];
    cities.forEach((city) => cardsFor(city).filter((c) => st.cats.includes(c.cat)).forEach((c) => out.push({ city, cardId: c.id })));
    if (r) out.push({ splits: true });
    return out;
  }
  return [{}];
}
/** Where the TV is right now. */
export function current() {
  const st = stepDef(state.session?.step);
  const seq = stageSeq(st.id);
  const pos = Math.max(0, Math.min(state.session?.pos || 0, seq.length - 1));
  return { step: st.id, st, seq, pos, at: seq[pos] || {} };
}
/** Move the TV forward or back: through the current stage, then on to the next stage. (TV only.) */
export function stepNav(dir) {
  const c = current();
  const p = c.pos + dir;
  if (p >= 0 && p < c.seq.length) return setSession({ pos: p });
  const i = STEPS.findIndex((x) => x.id === c.step) + dir;
  if (i < 0 || i >= STEPS.length) return;
  const seq = stageSeq(STEPS[i].id);
  return setSession({ step: STEPS[i].id, pos: dir > 0 ? 0 : Math.max(seq.length - 1, 0) });
}
export const goStep = (id) => setSession({ step: id, pos: 0 });
export const goPos = (pos) => setSession({ pos });

/** Split votes still to settle in a 3-tier stage. */
export function splitsFor(st) {
  const cities = routeCities(lockedRoute());
  return sortedCards(state.cards.filter((c) => cities.includes(c.city) && st.cats?.includes(c.cat) && !c.decision && autoTier(c) === 'split'));
}

// ---------- pick-one decisions (hotel per city, option per travel leg) ----------
export const hotelKey = (city) => 'hotel-' + city;
export const legKey = (routeId, i) => `leg-${routeId}-${i}`;
/** Toggle my pick for a decision. */
export function pick(key, optionId) {
  const mine = state.picks[key]?.[state.me.uid];
  return S.setDoc('session/pick-' + key, { votes: { [state.me.uid]: mine === optionId ? S.deleteField() : optionId } }, true);
}
export const myPick = (key) => state.picks[key]?.[state.me?.uid];
/** {optionId: [names]} */
export function pickTally(key) {
  const out = {};
  Object.entries(state.picks[key] || {}).forEach(([uid, opt]) => { (out[opt] = out[opt] || []).push(nameOf(uid)); });
  return out;
}

/** Legs between bases for a route, with the ways to travel each one. */
export function legsFor(route) {
  if (!route) return [];
  const nights = routeNights(route);
  return route.bases.slice(1).map((b, idx) => {
    const first = nights.find((n) => n.stay === idx + 1);
    const options = (LEG_OPTIONS[route.id]?.[idx]) || [{ id: 'train', icon: '🚆', mode: 'Train', time: '', cost: '', note: route.legs?.[idx] || '' }];
    const key = legKey(route.id, idx);
    const confirmed = state.session?.travel?.[key];
    const chosen = options.find((o) => o.id === confirmed) || (options.length === 1 ? options[0] : null);
    return { i: idx, key, from: route.bases[idx].city, to: b.city, date: first.date, options, chosen, confirmed: !!chosen };
  });
}
export async function confirmLeg(key, optionId) {
  const before = state.session ? { ...state.session } : null;
  await setSession({ travel: { [key]: optionId || null } });
  await log(optionId ? `Chose travel for ${key}` : `Re-opened travel ${key}`, 'session/state', before);
}

/** Cards that go on the day plan for the locked route (must-dos, optionally if-time). Hotels and tastes aren't scheduled. */
export function planCards(includeIf) {
  const cities = routeCities(lockedRoute());
  return sortedCards(state.cards.filter((c) => cities.includes(c.city) && !['hotel', 'dish'].includes(c.cat) && (tierOf(c) === 'must' || (includeIf && tierOf(c) === 'if'))));
}

/** The hotel picked for a city, if any. */
export const chosenHotel = (city) => card(state.session?.hotels?.[city]);
export async function chooseHotel(city, cardId) {
  const before = state.session ? { ...state.session } : null;
  await setSession({ hotels: { [city]: cardId || null } });
  await log(cardId ? `Picked ${card(cardId)?.title} for ${CITIES[city]}` : `Cleared the ${CITIES[city]} hotel`, 'session/state', before);
}

/** Travel on the plan: arrival, moves between bases, departure. [{date, slot, title, time, cost, note}] */
export function travelFor(route) {
  if (!route) return [];
  const nights = routeNights(route);
  const out = [{ date: nights[0].date, slot: 'afternoon', title: ARRIVAL.title, note: ARRIVAL.note }];
  legsFor(route).forEach((leg) => {
    const o = leg.chosen || leg.options[0];
    out.push({ date: leg.date, slot: 'morning', title: `${o.icon} ${CITIES[leg.from]} → ${CITIES[leg.to]}`, time: [o.mode, o.time].filter(Boolean).join(' · ') + (leg.chosen ? '' : ' (not decided)'), cost: o.cost, note: o.note });
  });
  out.push({ date: addDays(nights[nights.length - 1].date, 1), slot: 'morning', title: DEPARTURE.title, note: DEPARTURE.note });
  return out;
}

// ---------- seeding (setup page) ----------
export async function seedStarter() {
  let added = 0;
  for (const r of ROUTES) {
    const moves = (MOVES[r.id] || []).map(([mode, time, cost, note]) => ({ mode, time, cost, note }));
    const existing = await S.getDoc('routes/' + r.id);
    if (!existing) { const { id, ...rest } = r; await S.setDoc('routes/' + id, { ...rest, moves }); added++; }
    else if (!existing.moves && moves.length) { await S.updateDoc('routes/' + r.id, { moves }); added++; }
  }
  for (const [i, c] of EXTRA_CARDS.entries()) {
    if (!(await S.getDoc('cards/' + c.id))) {
      const { id, ...rest } = c;
      await S.setDoc('cards/' + id, { ...rest, order: 1000 + i, votes: {}, createdAt: now() + 1000 + i, createdBy: 'Starter' });
      added++;
    }
  }
  for (const [i, c] of CARDS.entries()) {
    const [highlights, tip] = DETAILS[c.id] || [[], ''];
    const [cost, costSource] = PRICES[c.id] || [c.cost, ''];
    const existing = await S.getDoc('cards/' + c.id);
    if (!existing) {
      const { id, ...rest } = c;
      await S.setDoc('cards/' + id, { ...rest, cost, costSource, highlights, tip, order: i, votes: {}, createdAt: now() + i, createdBy: 'Starter' });
      added++;
    } else {
      // Fill in newer starter details without touching anything people edited or voted on.
      const patch = {};
      if (!existing.highlights && highlights.length) { patch.highlights = highlights; if (!existing.tip) patch.tip = tip; }
      if (/^(Free|€+)$/.test(existing.cost || '') && cost !== existing.cost) { patch.cost = cost; patch.costSource = costSource; }
      if (Object.keys(patch).length) { await S.updateDoc('cards/' + c.id, patch); added++; }
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
  const { DEMO_FLIGHTS } = await import('./demo-flights.js?v=622549');
  await S.setDoc('meta/flights', DEMO_FLIGHTS);
}
export { S as store };
