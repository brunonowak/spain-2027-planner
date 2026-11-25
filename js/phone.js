import {
  boot, state, onState, STEPS, CITIES, CATS, VOTES, TIER_LABEL, esc, $, $$, fmtDate, addDays, initials,
  lockedRoute, route, card, routeCities, routeNights, baseDateRange, cardsFor, baseWalk, stepNav, goStep,
  voters, voteCounts, autoTier, tierOf, vote, saveCard, addCard, deleteCard, decide, scheduleCard, undo,
  setRanking, lockRoute, routeScores, planCards, addIdea, deleteIdea, setDayNote, addComment, watchComments,
  imageHtml, cardWiki, parseVideo, GROUPS, SLOTS, groupOf, factLabels, mapsLink, chosenHotel, chooseHotel, travelFor, defaultSlot, youtubeSearch, sortedCards, signOut, isDemo, revealed,
} from './common.js?v=581539';

const root = document.getElementById('app');
const ui = {
  tab: sessionStorage.getItem('tab') || 'now',
  city: 'all', group: 'all', onlyUnvoted: false, includeIf: false,
  rankDraft: null, sheet: null, pending: false,
};

await boot(root, { surface: 'phone' });

const TABS = [
  { id: 'now', icon: '📺', label: 'Now' },
  { id: 'cards', icon: '🗂️', label: 'Ideas' },
  { id: 'plan', icon: '🗓️', label: 'Plan' },
  { id: 'lot', icon: '💡', label: 'Parking lot' },
  { id: 'trip', icon: '✈️', label: 'Trip' },
];

root.innerHTML = `
  <header class="ph-head"><h1>Spain 2027${isDemo ? ' <span class="chip">demo</span>' : ''}</h1><span class="avatar on" id="me"></span></header>
  <main class="ph-main" id="main"></main>
  <nav class="tabbar" id="tabbar"></nav>
  <div id="sheet-root"></div>`;
$('#me').textContent = initials(state.me.name);
$('#me').title = state.me.name;

onState(() => { renderMain(); refreshSheet(); });
renderTabs();
renderMain();

// Don't re-render while someone is typing in the main view; catch up on blur.
document.addEventListener('focusout', () => setTimeout(() => { if (ui.pending) renderMain(); }, 0));

function renderTabs() {
  $('#tabbar').innerHTML = TABS.map((t) => `<button class="${ui.tab === t.id ? 'active' : ''}" data-tab="${t.id}"><span>${t.icon}</span>${t.label}</button>`).join('');
  $$('[data-tab]').forEach((b) => (b.onclick = () => { ui.tab = b.dataset.tab; sessionStorage.setItem('tab', ui.tab); renderTabs(); renderMain(true); window.scrollTo(0, 0); }));
}

function renderMain(force) {
  if (!state.ready || !state.session) return;
  const main = $('#main');
  const typing = main.contains(document.activeElement) && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
  if (typing && !force) { ui.pending = true; return; }
  ui.pending = false;
  ({ now: viewNow, cards: viewCards, plan: viewPlan, lot: viewLot, trip: viewTrip })[ui.tab](main);
  $('.fab')?.remove();
  if (ui.tab === 'cards') {
    document.body.insertAdjacentHTML('beforeend', `<button class="btn btn-primary fab" id="fab">＋ Add idea</button>`);
    $('#fab').onclick = () => openEdit(null, { city: ui.city !== 'all' ? ui.city : '', cat: ui.group !== 'all' ? GROUPS.find((g) => g.id === ui.group).cats[0] : 'sight' });
  }
}

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1800);
}
function myVote(c) { return c.votes?.[state.me.uid]; }
function voteButtons(c) {
  return `<div class="vote-buttons">${VOTES.map((v) => `<button class="${myVote(c) === v.id ? 'sel-' + v.id : ''}" data-vote="${v.id}" data-card="${c.id}">${v.label}</button>`).join('')}</div>`;
}
function bindVotes(scope) { $$('[data-vote]', scope).forEach((b) => (b.onclick = () => vote(b.dataset.card, b.dataset.vote))); }
function myVoteTag(c) { const v = myVote(c); return `<span class="myvote ${v || 'none'}">${v ? VOTES.find((x) => x.id === v).short : 'Not voted'}</span>`; }

// ---------------- NOW ----------------
function viewNow(main) {
  const s = state.session;
  const step = s.step || 'route';
  const idx = STEPS.findIndex((x) => x.id === step);
  let body = '';
  if (step === 'route') body = nowRoute();
  if (step === 'bases') body = nowBases();
  if (step === 'splits') body = nowSplits();
  if (step === 'days') body = planHtml();
  main.innerHTML = `
    <div class="now-banner"><span class="live"></span>On the TV · Step ${idx + 1}: ${STEPS[idx].label}</div>
    <div class="step-pills">${STEPS.map((x, i) => `<button class="${x.id === step ? 'active' : ''}" data-step="${x.id}">${i + 1}. ${x.label}</button>`).join('')}</div>
    ${body}
    <div class="nav-row"><button class="btn" id="back">← Back</button><button class="btn btn-primary" id="fwd">Next →</button></div>
    <p class="tiny muted" style="text-align:center;margin-top:10px">Anyone can move the TV. ${s.updatedBy ? `Last moved by ${esc(s.updatedBy)}.` : ''}</p>`;
  $$('[data-step]', main).forEach((b) => (b.onclick = () => goStep(b.dataset.step)));
  $('#back').onclick = () => stepNav(-1);
  $('#fwd').onclick = () => stepNav(1);
  bindVotes(main);
  bindRoute(main);
  bindPlan(main);
  $$('[data-open]', main).forEach((el) => (el.onclick = () => openCard(el.dataset.open)));
  $$('[data-decide]', main).forEach((b) => (b.onclick = () => decide(b.dataset.id, b.dataset.decide)));
  $$('[data-pick]', main).forEach((b) => (b.onclick = () => { const c = card(b.dataset.pick); chooseHotel(c.city, c.id); }));
}

function nowRoute() {
  const locked = lockedRoute();
  if (locked) {
    return `<div class="ph-card"><span class="tier tier-must">✓ Locked</span><h2 style="margin-top:8px">${esc(locked.name)}</h2>
      <p class="muted" style="margin:0 0 8px">${esc(locked.tagline)}</p>
      ${locked.bases.map((b, i) => `<div class="u-item-ph"><b class="grow">${esc(CITIES[b.city])}</b><span class="muted">${b.nights} nights · ${baseDateRange(locked, i)}</span></div>`).join('')}
      <button class="btn" id="unlock" style="margin-top:10px">Unlock route</button></div>`;
  }
  const mine = state.rankings.find((r) => r.uid === state.me.uid);
  const routes = [...state.routes].sort((a, b) => a.order - b.order);
  if (!routes.length) return `<div class="ph-card"><h2>No routes loaded yet</h2><p class="muted" style="margin:0">Bruno needs to open the Setup page and tap <b>Load starter content</b>. They’ll appear here straight away.</p></div>`;
  if (!ui.rankDraft || ui.rankDraft.length !== routes.length || ui.rankDraft.some((id) => !route(id))) {
    ui.rankDraft = mine?.order?.length === routes.length && mine.order.every((id) => route(id)) ? [...mine.order] : routes.map((r) => r.id);
  }
  const saved = mine && JSON.stringify(mine.order) === JSON.stringify(ui.rankDraft);
  const reveal = state.session.revealRoutes;
  return `
    <div class="ph-card">
      <h2>Rank the routes</h2>
      <p class="muted" style="margin:0 0 12px">Put your favourite on top. Tap a route for details.</p>
      <div class="rank-list">
        ${ui.rankDraft.map((id, i) => { const r = route(id); if (!r) return ''; return `
          <div class="rank-item">
            <div class="pos">${i + 1}</div>
            <div data-route="${r.id}"><h4>${esc(r.name)}</h4><p>${r.bases.map((b) => `${CITIES[b.city]} ${b.nights}`).join(' · ')}</p></div>
            <div class="arrows"><button data-up="${i}" ${i === 0 ? 'disabled' : ''}>▲</button><button data-down="${i}" ${i === ui.rankDraft.length - 1 ? 'disabled' : ''}>▼</button></div>
          </div>`; }).join('')}
      </div>
      <button class="btn ${saved ? '' : 'btn-primary'}" id="save-rank" style="width:100%;margin-top:12px">${saved ? '✓ Ranking saved' : mine ? 'Update my ranking' : 'Save my ranking'}</button>
    </div>
    <div class="ph-card">
      <h3>${reveal ? 'Group ranking' : 'Who has ranked'}</h3>
      ${reveal
        ? routeScores().map((s, i) => `<div class="u-item-ph"><b>#${i + 1}</b><span class="grow">${esc(s.route.name)}</span><span class="muted">${s.points} pts</span>${i === 0 ? `<button class="btn btn-primary" data-lock="${s.route.id}" style="padding:6px 12px">Lock</button>` : `<button class="btn" data-lock="${s.route.id}" style="padding:6px 12px">Lock</button>`}</div>`).join('')
        : voters().map((v) => `<span class="chip" style="margin:0 6px 6px 0">${state.rankings.some((r) => r.uid === v.uid) ? '✅' : '⏳'} ${esc(v.name)}</span>`).join('')}
    </div>`;
}
function bindRoute(main) {
  const move = (i, d) => { const a = ui.rankDraft; [a[i], a[i + d]] = [a[i + d], a[i]]; renderMain(true); };
  $$('[data-up]', main).forEach((b) => (b.onclick = () => move(+b.dataset.up, -1)));
  $$('[data-down]', main).forEach((b) => (b.onclick = () => move(+b.dataset.down, 1)));
  $('#save-rank', main) && ($('#save-rank', main).onclick = async () => { await setRanking([...ui.rankDraft]); toast('Ranking saved'); });
  $('#unlock', main) && ($('#unlock', main).onclick = () => lockRoute(null));
  $$('[data-lock]', main).forEach((b) => (b.onclick = () => lockRoute(b.dataset.lock)));
  $$('[data-route]', main).forEach((el) => (el.onclick = () => openRoute(el.dataset.route)));
}

function nowBases() {
  const w = baseWalk();
  if (!w.route) return `<div class="ph-card"><h3>No route locked yet</h3><p class="muted">Go back to step 1 and lock a route first.</p></div>`;
  const c = w.card;
  if (!c) return `<div class="ph-card"><h3>No ideas for ${esc(CITIES[w.city])} yet</h3><p class="muted">Add one from the Ideas tab.</p></div>`;
  const vs = voters();
  const votedN = vs.filter((v) => v.uid && c.votes?.[v.uid]).length;
  return `
    <div class="ph-card">
      <div class="tiny muted" style="margin-bottom:8px">${esc(CITIES[w.city])} · ${w.group?.icon || ''} ${esc(w.group?.label || '')} ${w.ci + 1} of ${w.list.length}</div>
      <div class="ph-hero" data-open="${c.id}">${imageHtml(c)}</div>
      <div class="tiny muted">${CATS[c.cat]?.icon || ''} ${esc(CATS[c.cat]?.label || '')}</div>
      <h2 data-open="${c.id}">${esc(c.title)}</h2>
      <p style="margin:0">${esc(c.pitch || '')}</p>
      ${c.highlights?.length ? `<ul class="ph-list">${c.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
      <div class="facts-sm">${c.time ? `<span class="chip">⏱ ${esc(c.time)}</span>` : ''}${c.cost ? `<span class="chip">💶 ${esc(c.cost)}</span>` : ''}${c.booking ? `<span class="chip">🎟 ${esc(c.booking)}</span>` : ''}</div>
      ${voteButtons(c)}
      ${c.cat === 'hotel' ? `<div style="margin-top:10px">${chosenHotel(c.city)?.id === c.id ? '<span class="tier tier-must">✓ Our hotel</span>' : `<button class="btn" data-pick="${c.id}" style="width:100%">Pick this hotel for ${esc(CITIES[c.city])}</button>`}</div>` : ''}
      <p class="tiny muted" style="margin:10px 0 0">${votedN} of ${vs.length} have voted · <a href="#" data-open="${c.id}">details, video &amp; comments</a></p>
    </div>`;
}

function nowSplits() {
  const r = lockedRoute();
  if (!r) return `<div class="ph-card"><h3>No route locked yet</h3></div>`;
  const cities = routeCities(r);
  const splits = sortedCards(state.cards.filter((c) => cities.includes(c.city) && !c.decision && autoTier(c) === 'split'));
  if (!splits.length) return `<div class="ph-card"><h3>Nothing contested 🎉</h3><p class="muted" style="margin:0">Move on to building the days.</p></div>`;
  return splits.map((c) => {
    const vs = voters();
    const names = (t) => vs.filter((v) => c.votes?.[v.uid] === t).map((v) => esc(v.name)).join(', ') || '—';
    return `<div class="ph-card">
      <h3 data-open="${c.id}">${esc(c.title)} <span class="tiny muted">· ${esc(CITIES[c.city])}</span></h3>
      <p class="tiny" style="margin:0 0 4px"><b style="color:#9ee2b6">Must:</b> ${names('must')} · <b style="color:#f5d38e">If time:</b> ${names('if')} · <b>Skip:</b> ${names('skip')}</p>
      <div class="vote-buttons">
        <button data-decide="must" data-id="${c.id}">Must do</button><button data-decide="if" data-id="${c.id}">If time</button><button data-decide="skip" data-id="${c.id}">Skip</button>
      </div></div>`;
  }).join('');
}

// ---------------- IDEAS (cards) ----------------
function viewCards(main) {
  const r = lockedRoute();
  const cities = r ? routeCities(r) : Object.keys(CITIES);
  if (ui.city !== 'all' && !cities.includes(ui.city)) ui.city = 'all';
  let list = sortedCards(state.cards.filter((c) => (ui.city === 'all' ? cities.includes(c.city) : c.city === ui.city)));
  const inCity = list;
  if (ui.group !== 'all') list = list.filter((c) => groupOf(c) === ui.group);
  const unvoted = list.filter((c) => !myVote(c)).length;
  if (ui.onlyUnvoted) list = list.filter((c) => !myVote(c));
  main.innerHTML = `
    <div class="chips-scroll">
      <button class="chip ${ui.city === 'all' ? 'sel' : ''}" data-city="all">All${r ? ' on route' : ''}</button>
      ${cities.map((c) => `<button class="chip ${ui.city === c ? 'sel' : ''}" data-city="${c}">${esc(CITIES[c])} · ${cardsFor(c).length} ideas</button>`).join('')}
    </div>
    <div class="chips-scroll">
      <button class="chip ${ui.group === 'all' ? 'sel' : ''}" data-group="all">Everything</button>
      ${GROUPS.map((g) => `<button class="chip ${ui.group === g.id ? 'sel' : ''}" data-group="${g.id}">${g.icon} ${g.label} · ${inCity.filter((c) => groupOf(c) === g.id).length}</button>`).join('')}
    </div>
    <label class="toggle" style="margin-bottom:12px"><input type="checkbox" id="unv" ${ui.onlyUnvoted ? 'checked' : ''}> Only ideas I haven’t voted on (${unvoted})</label>
    ${list.length ? list.map((c) => `
      <div class="card-row" data-open="${c.id}">
        ${imageHtml(c)}
        <div><h4>${esc(c.title)}</h4>
          <div class="meta">${CATS[c.cat]?.icon || ''} ${esc(CITIES[c.city])} ${chosenHotel(c.city)?.id === c.id ? '<span class="tier tier-must">Our hotel</span>' : ''} ${myVoteTag(c)} ${revealed(c) ? `<span class="tier tier-${tierOf(c)}">${TIER_LABEL[tierOf(c)]}</span>` : ''}</div></div>
      </div>`).join('') : `<p class="muted">Nothing here yet — add the first idea.</p>`}
    <div style="height:70px"></div>`;
  $$('[data-city]', main).forEach((b) => (b.onclick = () => { ui.city = b.dataset.city; renderMain(true); }));
  $$('[data-group]', main).forEach((b) => (b.onclick = () => { ui.group = b.dataset.group; renderMain(true); }));
  $('#unv').onchange = (e) => { ui.onlyUnvoted = e.target.checked; renderMain(true); };
  $$('[data-open]', main).forEach((el) => (el.onclick = () => openCard(el.dataset.open)));
}

// ---------------- PLAN ----------------
function viewPlan(main) {
  main.innerHTML = planHtml();
  bindPlan(main);
}
function planHtml() {
  const r = lockedRoute();
  if (!r) return `<div class="ph-card"><h2>No route yet</h2><p class="muted" style="margin:0">Once the group locks a route, the day-by-day plan appears here.</p></div>`;
  const nights = routeNights(r);
  const items = planCards(ui.includeIf);
  const travel = travelFor(r);
  const notes = Object.fromEntries(state.days.map((d) => [d.id, d.note || '']));
  const unscheduled = items.filter((c) => !c.day || !nights.some((n) => n.date === c.day));
  const order = Object.fromEntries(SLOTS.map((x, i) => [x.id, i]));
  const slotOf = (id) => SLOTS.find((x) => x.id === id) || SLOTS[0];
  const dayList = (date) => [
    ...travel.filter((t) => t.date === date).map((t) => ({ slot: t.slot, html: `<li class="travel-li"><span>${esc(t.title)}<small class="muted"> ${esc([t.time, t.cost].filter(Boolean).join(' · '))}</small>${t.note ? `<br><small class="muted">${esc(t.note)}</small>` : ''}</span></li>` })),
    ...items.filter((c) => c.day === date).map((c) => { const sl = slotOf(c.slot || defaultSlot(c)); return { slot: sl.id, html: `<li><small class="slot">${sl.icon} ${sl.label}</small><span data-open="${c.id}">${esc(c.title)}</span><button data-unsched="${c.id}" aria-label="Remove">×</button></li>` }; }),
  ].sort((x, y) => order[x.slot] - order[y.slot]).map((e) => e.html).join('');
  const lastDay = addDays(nights[nights.length - 1].date, 1);
  return `
    <div class="ph-card"><h2 style="margin:0">${esc(r.name)}</h2>
      <label class="toggle" style="margin-top:8px"><input type="checkbox" id="incl-if" ${ui.includeIf ? 'checked' : ''}> Include “If time” ideas</label></div>
    ${unscheduled.length ? `<div class="ph-card"><h3>To place (${unscheduled.length})</h3>
      ${unscheduled.map((c) => `<div class="u-item-ph"><span class="grow" data-open="${c.id}">${CATS[c.cat]?.icon || ''} ${esc(c.title)} <span class="tiny muted">${esc(CITIES[c.city])}</span></span>
        <select data-sched="${c.id}"><option value="">Put on…</option>${nights.filter((n) => n.city === c.city).map((n) => `<optgroup label="${fmtDate(n.date)}">${SLOTS.map((x) => `<option value="${n.date}|${x.id}">${fmtDate(n.date, { month: 'short', day: 'numeric' })} · ${x.label}</option>`).join('')}</optgroup>`).join('')}</select></div>`).join('')}</div>` : ''}
    ${nights.map((n, i) => {
      const hotel = chosenHotel(n.city);
      const list = dayList(n.date);
      return `<div class="plan-day">
        <header><b>Day ${i + 1} · ${fmtDate(n.date)}</b><span class="city city-${n.city}">${esc(CITIES[n.city])}</span></header>
        <div class="tiny muted" style="margin-top:4px">🛏️ ${hotel ? `<a href="#" data-open="${hotel.id}">${esc(hotel.title)}</a>` : 'Hotel not picked yet'}</div>
        ${list ? `<ul>${list}</ul>` : ''}
        <input class="input note-input" data-note="${n.date}" placeholder="Add a note for this day…" value="${esc(notes[n.date] || '')}">
      </div>`;
    }).join('')}
    <div class="plan-day"><header><b>${fmtDate(lastDay)}</b><span class="city city-madrid">Fly home</span></header><ul>${dayList(lastDay)}</ul></div>`;
}
function bindPlan(main) {
  $('#incl-if', main) && ($('#incl-if', main).onchange = (e) => { ui.includeIf = e.target.checked; renderMain(true); });
  $$('[data-sched]', main).forEach((s) => (s.onchange = () => { if (!s.value) return; const [d, sl] = s.value.split('|'); scheduleCard(s.dataset.sched, d, sl); }));
  $$('[data-unsched]', main).forEach((b) => (b.onclick = () => scheduleCard(b.dataset.unsched, null)));
  $$('[data-note]', main).forEach((inp) => (inp.onchange = () => setDayNote(inp.dataset.note, inp.value.trim())));
  if (ui.tab === 'plan') $$('[data-open]', main).forEach((el) => (el.onclick = () => openCard(el.dataset.open)));
}

// ---------------- PARKING LOT ----------------
function viewLot(main) {
  const list = [...state.parking].sort((a, b) => b.at - a.at);
  main.innerHTML = `
    <div class="ph-card"><h2>Parking lot</h2>
      <p class="muted" style="margin:0">Loose ideas, questions and “what about…?” — anyone can add.</p>
      <form class="inline-form" id="lot-form"><input class="input" id="lot-text" placeholder="An idea or question…" autocomplete="off"><button class="btn btn-primary">Add</button></form>
    </div>
    <ul class="list-plain">
      ${list.map((p) => `<li><div class="grow">${esc(p.text)}<div class="tiny muted">${esc(p.by || '')} · ${new Date(p.at).toLocaleDateString()}</div></div>
        <button class="btn" data-promote="${p.id}" style="padding:6px 10px">→ Card</button><button class="btn btn-ghost" data-del="${p.id}" style="padding:6px 10px" aria-label="Delete">🗑</button></li>`).join('') || '<li class="muted">Nothing parked yet.</li>'}
    </ul>`;
  $('#lot-form').onsubmit = async (e) => { e.preventDefault(); const t = $('#lot-text').value.trim(); if (!t) return; $('#lot-text').value = ''; $('#lot-text').blur(); await addIdea(t); };
  $$('[data-del]', main).forEach((b) => (b.onclick = () => deleteIdea(state.parking.find((p) => p.id === b.dataset.del))));
  $$('[data-promote]', main).forEach((b) => (b.onclick = () => { const p = state.parking.find((x) => x.id === b.dataset.promote); openEdit(null, { title: p.text.slice(0, 60), pitch: p.text }); }));
}

// ---------------- TRIP ----------------
function viewTrip(main) {
  const f = state.flights;
  const hist = [...state.history].sort((a, b) => b.at - a.at).slice(0, 30);
  main.innerHTML = `
    <div class="ph-card"><h2>Flights</h2>
      ${f ? (f.sections || []).map((s) => `<h3 style="font-size:15px;margin:12px 0 4px">${esc(s.title)}</h3>
        <table class="flights"><tr><th>Flight</th><th>Route</th><th>Depart</th><th>Arrive</th></tr>
        ${s.legs.map((l) => `<tr><td><b>${esc(l.flight)}</b><div class="tiny muted">${esc(l.cabin || '')}${l.seats ? ' · ' + esc(l.seats) : ''}</div></td><td>${esc(l.route)}</td><td>${esc(l.depart)}</td><td>${esc(l.arrive)}</td></tr>`).join('')}</table>`).join('')
        + ((f.notes || []).length ? `<ul class="tiny muted" style="padding-left:18px">${f.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : '')
        : '<p class="muted">Flights haven’t been loaded yet.</p>'}
      <p class="tiny muted" style="margin:6px 0 0">Booked — read-only.</p>
    </div>
    <div class="ph-card"><h3>Travelers</h3>
      ${voters().map((v) => `<span class="chip" style="margin:0 6px 6px 0">${v.uid ? '🟢' : '⚪'} ${esc(v.name)}</span>`).join('')}
    </div>
    <div class="ph-card"><h3>Recent changes</h3>
      <ul class="list-plain">${hist.map((h) => `<li><div class="grow">${esc(h.label)}<div class="tiny muted">${esc(h.by)} · ${new Date(h.at).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}${h.undone ? ` · undone by ${esc(h.undoneBy || '')}` : ''}</div></div>
        ${h.undone ? '' : `<button class="btn" data-undo="${h.id}" style="padding:6px 12px">Undo</button>`}</li>`).join('') || '<li class="muted">No changes yet.</li>'}</ul>
    </div>
    <div class="ph-card" style="display:flex;gap:8px;flex-wrap:wrap">
      <a class="btn" href="tv.html${isDemo ? location.search : ''}" target="_blank">📺 Open TV view</a>
      <a class="btn" href="setup.html${isDemo ? location.search : ''}">⚙️ Setup</a>
      <button class="btn btn-ghost" id="signout">Sign out (${esc(state.me.name)})</button>
    </div>`;
  $$('[data-undo]', main).forEach((b) => (b.onclick = async () => {
    const h = state.history.find((x) => x.id === b.dataset.undo);
    if (confirm(`Undo: ${h.label}?`)) { await undo(h); toast('Undone'); }
  }));
  $('#signout').onclick = () => signOut();
}

// ---------------- sheets ----------------
function openSheet(html, onClose) {
  closeSheet();
  $('#sheet-root').innerHTML = `<div class="sheet-back" id="sheet-back"><div class="sheet" role="dialog"><div class="sheet-grab"></div>${html}</div></div>`;
  $('#sheet-back').onclick = (e) => { if (e.target.id === 'sheet-back') closeSheet(); };
  document.body.style.overflow = 'hidden';
  ui.sheetClose = onClose;
}
function closeSheet() {
  ui.sheetClose?.(); ui.sheetClose = null; ui.sheet = null;
  $('#sheet-root').innerHTML = '';
  document.body.style.overflow = '';
}

function openRoute(id) {
  const r = route(id);
  openSheet(`<h2>${esc(r.name)}</h2><p class="muted">${esc(r.tagline)}</p>
    ${r.bases.map((b, i) => `<div class="u-item-ph"><b class="grow">${esc(CITIES[b.city])}</b><span class="muted">${b.nights} nights · ${baseDateRange(r, i)}</span></div>`).join('')}
    <ul style="padding-left:18px;color:var(--muted);font-size:14px">${(r.legs || []).map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
    <p class="tiny muted">${esc(r.notes || '')}</p>
    <div class="sheet-actions"><button class="btn" id="close">Close</button></div>`);
  $('#close').onclick = closeSheet;
}

function openCard(id, tries = 0) {
  const c = card(id);
  if (!c) { if (tries < 10) setTimeout(() => openCard(id, tries + 1), 150); return; }
  const vid = parseVideo(c.video, c.start);
  openSheet(`
    <div class="ph-hero">${imageHtml(c)}</div>
    <div class="tiny muted">${CATS[c.cat]?.icon || ''} ${esc(CATS[c.cat]?.label || '')} · ${esc(CITIES[c.city])}</div>
    <h2>${esc(c.title)}</h2>
    <p style="margin:0">${esc(c.pitch || '')}</p>
    ${c.highlights?.length ? `<div class="ph-section-title" style="margin-top:12px">Don’t miss</div><ul class="ph-list">${c.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
    ${c.tip ? `<p style="margin:10px 0 0;color:var(--accent-2);font-size:14px">💡 ${esc(c.tip)}</p>` : ''}
    <div id="wiki"></div>
    <table class="flights facts-table">${factLabels(c).map((l, i) => { const v = [c.time, c.cost, c.booking][i]; return v ? `<tr><th>${l}</th><td>${esc(v)}${i === 1 && c.costSource ? ` · <a href="${esc(c.costSource)}" target="_blank" rel="noopener">source ↗</a>` : ''}</td></tr>` : ''; }).join('')}</table>
    <div class="sheet-actions" style="margin-top:8px">
      <a class="btn" href="${esc(mapsLink(c))}" target="_blank" rel="noopener">📍 Google Maps</a>
      ${c.cat === 'hotel' ? (chosenHotel(c.city)?.id === c.id ? `<button class="btn" id="unpick">✓ Our hotel · clear</button>` : `<button class="btn btn-primary" id="pick">Pick for ${esc(CITIES[c.city])}</button>`) : ''}
    </div>
    ${vid ? `<a class="btn" href="${esc(vid.url)}" target="_blank" rel="noopener">▶ Watch video</a>` : `<a class="btn" href="${esc(youtubeSearch(c))}" target="_blank" rel="noopener">🔎 Find a short video</a>`}
    <div id="sheet-votes"></div>
    <div class="sheet-actions"><button class="btn" id="edit">✏️ Edit</button><button class="btn btn-danger" id="del">Delete</button><button class="btn btn-ghost" id="close">Close</button></div>
    <div class="ph-section-title">Comments</div>
    <div id="comments"><p class="tiny muted">Loading…</p></div>
    <form class="inline-form" id="c-form"><input class="input" id="c-text" placeholder="Add a comment…" autocomplete="off"><button class="btn btn-primary">Send</button></form>`,
    watchComments(id, (list) => {
      const el = $('#comments');
      if (el) el.innerHTML = list.map((m) => `<div class="comment"><b>${esc(m.by)}</b>${esc(m.text)} <small>${new Date(m.at).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</small></div>`).join('') || '<p class="tiny muted">No comments yet.</p>';
    }));
  ui.sheet = { type: 'card', id };
  refreshSheet();
  if (c.link && !/google\.com\/maps/.test(c.link)) $('#wiki').insertAdjacentHTML('afterend', `<p style="margin:8px 0 0"><a href="${esc(c.link)}" target="_blank" rel="noopener">More info ↗</a></p>`);
  $('#pick') && ($('#pick').onclick = async () => { await chooseHotel(c.city, c.id); toast('Hotel picked'); openCard(id); });
  $('#unpick') && ($('#unpick').onclick = async () => { await chooseHotel(c.city, null); openCard(id); });
  $('#close').onclick = closeSheet;
  $('#edit').onclick = () => openEdit(id);
  $('#del').onclick = async () => { if (confirm(`Delete “${c.title}”? You can undo it from the Trip tab.`)) { await deleteCard(id); closeSheet(); toast('Deleted'); } };
  $('#c-form').onsubmit = async (e) => { e.preventDefault(); const t = $('#c-text').value.trim(); if (!t) return; $('#c-text').value = ''; await addComment(id, t); };
}

function refreshSheet() {
  if (ui.sheet?.type !== 'card') return;
  const c = card(ui.sheet.id);
  const el = $('#sheet-votes');
  if (!c) { closeSheet(); return; }
  if (!el) return;
  const vs = voters();
  const n = voteCounts(c);
  const t = tierOf(c);
  el.innerHTML = `
    ${voteButtons(c)}
    <p class="tiny muted" style="margin:10px 0 0">${n.n} of ${vs.length} voted · ${revealed(c) ? `<span class="tier tier-${t}">${TIER_LABEL[t]}${c.decision ? ' (decided)' : ''}</span>` : 'results show once everyone votes'}
      ${c.decision ? `<a href="#" id="reopen">re-open</a>` : ''}</p>`;
  bindVotes(el);
  const w = cardWiki(c), wikiEl = $('#wiki');
  if (wikiEl && w && !wikiEl.dataset.done) {
    wikiEl.dataset.done = '1';
    wikiEl.innerHTML = `<div class="ph-section-title" style="margin-top:14px">About</div><p style="margin:0;font-size:14px;color:var(--muted);line-height:1.5">${esc(w.extract)}</p>
      ${w.url ? `<p class="tiny" style="margin:6px 0 0"><a href="${esc(w.url)}" target="_blank" rel="noopener">Read more on Wikipedia ↗</a></p>` : ''}`;
  }
  $('#reopen') && ($('#reopen').onclick = (e) => { e.preventDefault(); decide(c.id, null); });
}

function openEdit(id, preset = {}) {
  const c = id ? card(id) : { cat: 'sight', ...preset };
  const opt = (obj, sel) => Object.entries(obj).map(([k, v]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${esc(typeof v === 'string' ? v : v.label)}</option>`).join('');
  openSheet(`
    <h2>${id ? 'Edit idea' : 'New idea'}</h2>
    <form id="edit-form">
      <label class="field">Title<input name="title" required value="${esc(c.title || '')}" placeholder="e.g. Flamenco at Casa de la Memoria"></label>
      <div class="grid2">
        <label class="field">City<select name="city" required><option value="">Choose…</option>${opt(CITIES, c.city)}</select></label>
        <label class="field">Type<select name="cat">${opt(CATS, c.cat)}</select></label>
      </div>
      <label class="field">Two-line pitch<textarea name="pitch" placeholder="Why it’s worth it">${esc(c.pitch || '')}</textarea></label>
      <label class="field">Don’t miss (one per line)<textarea name="highlights" placeholder="The best bits, one per line">${esc((c.highlights || []).join('\n'))}</textarea></label>
      <label class="field">Tip<input name="tip" value="${esc(c.tip || '')}" placeholder="Practical advice"></label>
      <label class="field">Video link (YouTube, ideally under 3 min)<input name="video" type="url" inputmode="url" value="${esc(c.video || '')}" placeholder="https://youtu.be/…"></label>
      <label class="field">Start the video at (optional, e.g. 1m20s)<input name="start" value="${esc(c.start || '')}"></label>
      <label class="field">Photo link (optional)<input name="image" type="url" inputmode="url" value="${esc(c.image || '')}" placeholder="Paste an image address"></label>
      <div class="grid2">
        <label class="field">Time needed<input name="time" value="${esc(c.time || '')}" placeholder="2h, half day…"></label>
        <label class="field">Cost per person<input name="cost" value="${esc(c.cost || '')}" placeholder="e.g. €15, or ~€30 (estimate)"></label>
      </div>
      <label class="field">Book ahead?<input name="booking" value="${esc(c.booking || '')}" placeholder="No / Timed ticket / Book months ahead"></label>
      <label class="field">Link for more info (optional)<input name="link" type="url" inputmode="url" value="${esc(c.link || '')}"></label>
      <div class="sheet-actions"><button class="btn btn-primary" type="submit">${id ? 'Save changes' : 'Add idea'}</button><button class="btn btn-ghost" type="button" id="cancel">Cancel</button></div>
    </form>`);
  $('#cancel').onclick = () => (id ? openCard(id) : closeSheet());
  $('#edit-form').onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    Object.keys(data).forEach((k) => (data[k] = data[k].trim()));
    data.highlights = data.highlights ? data.highlights.split('\n').map((x) => x.trim()).filter(Boolean) : [];
    if (id) { await saveCard(id, data); toast('Saved'); openCard(id); }
    else { const newId = await addCard(data); toast('Idea added'); openCard(newId); }
  };
}
