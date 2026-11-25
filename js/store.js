// Data + auth layer. Two backends with the same API:
//  - Firebase (Firestore + Auth) for the real thing
//  - Demo (localStorage + BroadcastChannel) when the URL has ?demo — lets TV and phone
//    tabs in the same browser sync, so the flow can be tried without touching real data.
import { firebaseConfig } from './firebase-config.js?v=fb082ab';

const SDK = 'https://www.gstatic.com/firebasejs/13.4.0/';
const params = new URLSearchParams(location.search);
export const isDemo = params.has('demo');

let impl = null;
export async function initStore() {
  if (!impl) impl = isDemo ? demoImpl() : await firebaseImpl();
  return impl;
}

export const watchDoc = (p, cb) => impl.watchDoc(p, cb);
export const watchCol = (p, cb) => impl.watchCol(p, cb);
export const getDoc = (p) => impl.getDoc(p);
export const getCol = (p) => impl.getCol(p);
export const setDoc = (p, d, merge = false) => impl.set(p, d, merge);
export const updateDoc = (p, d) => impl.update(p, d);
export const addDoc = (p, d) => impl.add(p, d);
export const deleteDoc = (p) => impl.del(p);
export const deleteField = () => impl.deleteField();
export const auth = () => impl.auth;

// ---------------- Firebase ----------------
async function firebaseImpl() {
  const [{ initializeApp }, fs, au] = await Promise.all([
    import(SDK + 'firebase-app.js'),
    import(SDK + 'firebase-firestore.js'),
    import(SDK + 'firebase-auth.js'),
  ]);
  const app = initializeApp(firebaseConfig);
  // Auto-detect long polling: more reliable on iPhone Safari and some networks.
  const db = fs.initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
  const a = au.getAuth(app);
  const snapDoc = (s) => (s.exists() ? { id: s.id, ...s.data() } : null);
  const snapCol = (s) => s.docs.map((d) => ({ id: d.id, ...d.data() }));
  return {
    watchDoc: (p, cb) => fs.onSnapshot(fs.doc(db, p), (s) => cb(snapDoc(s)), (e) => console.error(p, e)),
    watchCol: (p, cb) => fs.onSnapshot(fs.collection(db, p), (s) => cb(snapCol(s)), (e) => console.error(p, e)),
    getDoc: async (p) => snapDoc(await fs.getDoc(fs.doc(db, p))),
    getCol: async (p) => snapCol(await fs.getDocs(fs.collection(db, p))),
    set: (p, d, merge) => fs.setDoc(fs.doc(db, p), d, { merge }),
    update: (p, d) => fs.updateDoc(fs.doc(db, p), d),
    add: async (p, d) => (await fs.addDoc(fs.collection(db, p), d)).id,
    del: (p) => fs.deleteDoc(fs.doc(db, p)),
    deleteField: () => fs.deleteField(),
    auth: {
      onChange: (cb) =>
        au.onAuthStateChanged(a, (u) => cb(u ? { uid: u.uid, email: (u.email || '').toLowerCase(), displayName: u.displayName || '' } : null)),
      signIn: (kind) => {
        const prov = kind === 'microsoft' ? new au.OAuthProvider('microsoft.com') : new au.GoogleAuthProvider();
        prov.setCustomParameters({ prompt: 'select_account' });
        return au.signInWithPopup(a, prov);
      },
      signOut: () => au.signOut(a),
    },
  };
}

// ---------------- Demo ----------------
function demoImpl() {
  const KEY = 'spain2027-demo-db';
  const DEL = '__delete__';
  const load = () => {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
  };
  let data = load();
  const ch = 'BroadcastChannel' in window ? new BroadcastChannel('spain2027-demo') : null;
  const watchers = new Set();
  let queued = false;
  const fire = () => {
    if (queued) return;
    queued = true;
    setTimeout(() => { queued = false; watchers.forEach((w) => w()); }, 0);
  };
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
    ch && ch.postMessage(data);
    fire();
  };
  // The message carries the whole store: localStorage can lag between tabs, the message can't.
  if (ch) ch.onmessage = (e) => { if (e.data && typeof e.data === 'object') { data = e.data; fire(); } };
  const clone = (o) => (o == null ? o : JSON.parse(JSON.stringify(o)));
  const childOf = (col, p) => p.startsWith(col + '/') && !p.slice(col.length + 1).includes('/');
  const docOut = (p) => (data[p] ? { id: p.split('/').pop(), ...clone(data[p]) } : null);
  const colOut = (c) => Object.keys(data).filter((p) => childOf(c, p)).map(docOut);
  const deepMerge = (t, s) => {
    for (const [k, v] of Object.entries(s)) {
      if (v === DEL) delete t[k];
      else if (v && typeof v === 'object' && !Array.isArray(v)) t[k] = deepMerge(t[k] && typeof t[k] === 'object' ? t[k] : {}, v);
      else t[k] = v;
    }
    return t;
  };
  const strip = (o) => JSON.parse(JSON.stringify(o, (k, v) => (v === DEL ? undefined : v)));
  const sub = (fn) => { watchers.add(fn); fn(); return () => watchers.delete(fn); };

  const who = params.get('as') || 'Bruno';
  const demoUser = { uid: 'demo-' + who.toLowerCase(), email: who.toLowerCase() + '@demo.local', displayName: who };

  return {
    watchDoc: (p, cb) => sub(() => cb(docOut(p))),
    watchCol: (p, cb) => sub(() => cb(colOut(p))),
    getDoc: async (p) => docOut(p),
    getCol: async (p) => colOut(p),
    set: async (p, d, merge) => { data[p] = merge && data[p] ? deepMerge(data[p], clone(d)) : strip(d); save(); },
    update: async (p, d) => {
      if (!data[p]) throw new Error('No document ' + p);
      for (const [k, v] of Object.entries(d)) {
        const parts = k.split('.');
        let o = data[p];
        for (const part of parts.slice(0, -1)) o = o[part] = o[part] && typeof o[part] === 'object' ? o[part] : {};
        const last = parts[parts.length - 1];
        if (v === DEL) delete o[last]; else o[last] = clone(v);
      }
      save();
    },
    add: async (p, d) => { const id = Math.random().toString(36).slice(2, 12); data[p + '/' + id] = strip(d); save(); return id; },
    del: async (p) => { delete data[p]; Object.keys(data).filter((k) => k.startsWith(p + '/')).forEach((k) => delete data[k]); save(); },
    deleteField: () => DEL,
    auth: {
      onChange: (cb) => { setTimeout(() => cb(demoUser), 0); return () => {}; },
      signIn: async () => {},
      signOut: async () => { localStorage.removeItem(KEY); location.reload(); },
    },
  };
}
