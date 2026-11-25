import {
  boot, state, onState, STEPS, CITIES, CATS, TIER_LABEL, esc, $, $$, fmtDate, addDays, initials,
  lockedRoute, routeCities, routeNights, baseDateRange, cardsFor, baseWalk, stepNav, goStep, setSession,
  voters, voteCounts, autoTier, tierOf, decide, scheduleCard, lockRoute, routeScores, planCards,
  imageHtml, cardImage, cardWiki, parseVideo, GROUPS, SLOTS, factLabels, chosenHotel, chooseHotel, travelFor, defaultSlot, youtubeSearch, sortedCards, isDemo, revealed,
} from './common.js?v=581539';

const root = document.getElementById('app');
const local = { playing: null, splitSel: null, includeIf: false };

await boot(root, { surface: 'tv' });

root.innerHTML = `
  <div class="tv-app">
    <header class="tv-top">
      <div class="tv-title">Spain 2027<small>Group planning session${isDemo ? ' · demo' : ''}</small></div>
      <nav class="tv-steps" id="steps"></nav>
      <div class="tv-people" id="people"></div>
    </header>
    <main class="tv-main" id="main"></main>
    <footer class="tv-foot">
      <button class="btn" id="prev">← Back</button>
      <div class="center" id="foot-center"></div>
      <button class="btn btn-primary" id="next">Next →</button>
    </footer>
  </div>`;

$('#prev').onclick = () => stepNav(-1);
$('#next').onclick = () => stepNav(1);
document.addEventListener('keydown', (e) => {
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
  if (e.key === 'ArrowRight' || e.key === 'PageDown') stepNav(1);
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') stepNav(-1);
  if (e.key.toLowerCase() === 'v') togglePlay();
  if (e.key.toLowerCase() === 'r') revealCurrent();
});

onState(render);
render();

function render() {
  if (!state.ready || !state.session) return;
  const step = state.session.step || 'route';
  const stepIdx = STEPS.findIndex((s) => s.id === step);
  $('#steps').innerHTML = STEPS.map((s, i) => `
    <button class="tv-step ${i === stepIdx ? 'active' : ''} ${i < stepIdx ? 'done' : ''}" data-step="${s.id}">
      <span class="n">${i < stepIdx ? '✓' : i + 1}</span>${s.label}</button>`).join('');
  $$('#steps [data-step]').forEach((b) => (b.onclick = () => goStep(b.dataset.step)));
  $('#people').innerHTML = voters().map((v) => `<span class="avatar ${v.uid ? 'on' : ''}" title="${esc(v.name)}">${esc(initials(v.name))}</span>`).join('');

  const main = $('#main');
  if (main.dataset.view !== step) { main.dataset.view = step; main.innerHTML = ''; }
  ({ route: renderRoute, bases: renderBases, splits: renderSplits, days: renderDays })[step]?.(main);
  $('#foot-center').textContent = state.session.updatedBy ? `Last moved by ${state.session.updatedBy}` : 'Anyone can move the session from their phone, or use ← → here';
}

// ---------------- Step 1: route ----------------
function renderRoute(main) {
  const locked = state.session.lockedRoute;
  const reveal = !!state.session.revealRoutes;
  const vs = voters();
  const rankedUids = new Set(state.rankings.map((r) => r.uid));
  const scores = routeScores();
  const max = Math.max(1, ...scores.map((s) => s.points));
  const list = reveal ? scores.map((s) => s.route) : [...state.routes].sort((a, b) => a.order - b.order);
  const rankOf = Object.fromEntries(scores.map((s, i) => [s.route.id, i + 1]));

  main.innerHTML = `
    <h2 class="h-section">${locked ? 'Route locked in' : reveal ? 'The group’s ranking' : 'Rank the four routes'}</h2>
    <p class="lead">${locked ? 'Next we go base by base through the ideas.' : reveal ? 'Sorted by group score: each person’s 1st choice = 4 points, 2nd = 3, 3rd = 2, 4th = 1. Talk it over, then lock one in.' : `Everyone ranks 1st to 4th on their phone. ${vs.filter((v) => rankedUids.has(v.uid)).length} of ${vs.length} done:`}
      ${!reveal && !locked ? vs.map((v) => `<span class="chip" style="margin-left:.4em">${rankedUids.has(v.uid) ? '✅' : '⏳'} ${esc(v.name)}</span>`).join('') : ''}
      ${!locked ? `<button class="btn ${reveal ? '' : 'btn-primary'}" id="reveal" style="margin-left:1em" ${state.rankings.length ? '' : 'disabled'}>${reveal ? 'Hide results' : 'Reveal results'}</button>` : `<button class="btn" id="unlock" style="margin-left:1em">Unlock</button>`}
    </p>
    <div class="routes-grid">
      ${list.map((r) => {
        const sc = scores.find((s) => s.route.id === r.id);
        return `
        <article class="route-card ${locked === r.id ? 'locked' : ''}" style="${locked && locked !== r.id ? 'opacity:.45' : ''}">
          ${reveal ? `<span class="rank-badge">Group #${rankOf[r.id]} · ${sc.points} pts</span>` : ''}
          <div class="num"><small>Option</small>${r.order}</div>
          <h3>${esc(r.name)}</h3>
          <p class="tag">${esc(r.tagline)}</p>
          ${reveal ? `<div class="score-bar"><i style="width:${(sc.points / max) * 100}%"></i></div><div class="tiny muted">${sc.firsts} first-place vote${sc.firsts === 1 ? '' : 's'}</div>` : ''}
          ${reveal && !locked ? `<div class="route-actions"><button class="btn btn-primary" data-lock="${r.id}">Lock this route</button></div>` : ''}
          ${locked === r.id ? `<div class="route-actions"><span class="tier tier-must">✓ Locked</span></div>` : ''}
          <div class="route-bases">
            ${r.bases.map((b, i) => `<div class="route-base">${esc(CITIES[b.city])}<span>${b.nights} nights · ${baseDateRange(r, i)}</span></div>`).join('')}
          </div>
          <ul class="route-legs">${(r.legs || []).map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
          <div class="route-note">${esc(r.notes || '')}</div>
        </article>`;
      }).join('')}
    </div>`;
  $('#reveal') && ($('#reveal').onclick = () => setSession({ revealRoutes: !reveal }));
  $('#unlock') && ($('#unlock').onclick = () => lockRoute(null));
  $$('[data-lock]', main).forEach((b) => (b.onclick = () => lockRoute(b.dataset.lock)));
}

// ---------------- Step 2: bases ----------------
function renderBases(main) {
  const w = baseWalk();
  if (!w.route) {
    main.innerHTML = `<div class="empty-big"><div><h3>No route locked yet</h3><p>Go back to step 1, reveal the ranking and lock a route.</p></div></div>`;
    main.dataset.view = 'bases-empty';
    return;
  }
  if (!$('.bases-layout', main)) {
    main.innerHTML = `
      <div class="bases-layout">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:1em">
          <div class="base-tabs" id="base-tabs"></div>
          <div class="muted" id="base-count"></div>
        </div>
        <div class="base-tabs group-tabs" id="group-tabs"></div>
        <div class="stage">
          <div class="stage-media" id="media"></div>
          <div class="stage-info" id="info"></div>
        </div>
        <div class="filmstrip" id="strip"></div>
      </div>`;
  }
  $('#base-tabs').innerHTML = w.cities.map((c, i) => `<button class="base-tab ${i === w.bi ? 'active' : ''}" data-base="${i}">${esc(CITIES[c])} · ${cardsFor(c).length} ideas</button>`).join('');
  $$('[data-base]').forEach((b) => (b.onclick = () => setSession({ baseIndex: +b.dataset.base, groupIndex: 0, cardIndex: 0 })));
  const hotel = chosenHotel(w.city);
  $('#group-tabs').innerHTML = w.sections.map((sec, i) => `<button class="base-tab sub ${i === w.gi ? 'active' : ''}" data-group="${i}">${sec.group.icon} ${sec.group.label} · ${sec.list.length}</button>`).join('')
    + `<span class="hotel-pill">${hotel ? `🛏️ Staying at <b>${esc(hotel.title)}</b>` : '🛏️ No hotel picked yet'}</span>`;
  $$('[data-group]').forEach((b) => (b.onclick = () => setSession({ groupIndex: +b.dataset.group, cardIndex: 0 })));
  $('#base-count').innerHTML = w.card ? `${esc(w.group?.label || '')} ${w.ci + 1} of ${w.list.length} in ${esc(CITIES[w.city])}
    <span class="legend"><i class="dot-must"></i>Must do <i class="dot-if"></i>If time <i class="dot-skip"></i>Skip <i class="dot-split"></i>Split <i class="dot-none"></i>Not revealed</span>` : '';

  const card = w.card;
  if (!card) {
    $('#media').innerHTML = '';
    $('#info').innerHTML = `<div class="empty-big"><div><h3>No ideas for ${esc(CITIES[w.city])} yet</h3><p>Add some from your phone (Ideas tab → +).</p></div></div>`;
    $('#strip').innerHTML = '';
    return;
  }

  // Media: only rebuilt when the card, image or play state changes, so a playing video isn't interrupted.
  const vid = parseVideo(card.video, card.start);
  const playing = local.playing === card.id && vid?.kind === 'youtube';
  const mediaKey = [card.id, playing, cardImage(card) || '', card.video || ''].join('|');
  const media = $('#media');
  if (media.dataset.key !== mediaKey) {
    media.dataset.key = mediaKey;
    media.innerHTML = playing
      ? `<iframe src="${esc(vid.embed)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`
      : `${imageHtml(card)}
         ${vid?.kind === 'youtube' ? `<button class="btn play-btn" id="play">▶ Play video (V)</button>` : vid ? `<a class="btn play-btn" href="${esc(vid.url)}" target="_blank" rel="noopener">▶ Open video</a>` : `<a class="btn play-btn" href="${esc(youtubeSearch(card))}" target="_blank" rel="noopener">🔎 Find a short video</a>`}
         ${!card.image && cardImage(card) ? `<span class="media-credit">Photo: Wikipedia / Wikimedia Commons</span>` : ''}`;
    if (playing) media.insertAdjacentHTML('beforeend', `<button class="btn play-btn" id="play" style="bottom:auto;top:1.2em">✕ Close video</button>`);
    $('#play') && ($('#play').onclick = togglePlay);
  }

  const vs = voters();
  const votes = card.votes || {};
  const voted = vs.filter((v) => v.uid && votes[v.uid]);
  const all = vs.length > 0 && voted.length === vs.length;
  const reveal = all || state.session.reveal?.[card.id];
  const cnt = voteCounts(card);
  const namesFor = (t) => vs.filter((v) => votes[v.uid] === t).map((v) => v.name).join(', ') || '—';
  const tier = tierOf(card);

  $('#info').innerHTML = `
    <div class="kicker">${CATS[card.cat]?.icon || ''} ${esc(CATS[card.cat]?.label || 'Idea')} · ${esc(CITIES[card.city])}
      ${reveal ? `<span class="tier tier-${tier}">${TIER_LABEL[tier]}${card.decision ? ' (decided)' : ''}</span>` : ''}</div>
    <h2>${esc(card.title)}</h2>
    <p class="pitch">${esc(card.pitch || '')}</p>
    ${card.highlights?.length ? `<div class="highlights"><b>Don’t miss</b><ul>${card.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul></div>` : wikiBlurb(card)}
    ${card.tip ? `<p class="tip">💡 ${esc(card.tip)}</p>` : ''}
    <div class="facts">
      ${factLabels(card).map((l, i) => `<div class="fact"><b>${l}</b>${esc([card.time, card.cost, card.booking][i] || '—')}</div>`).join('')}
    </div>
    ${card.cat === 'hotel' ? `<div class="hotel-pick">${hotel?.id === card.id
      ? `<span class="tier tier-must">✓ Our ${esc(CITIES[card.city])} hotel</span> <button class="btn btn-ghost" id="unpick">Clear</button>`
      : `<button class="btn btn-primary" id="pick">Pick this hotel for ${esc(CITIES[card.city])}</button>`}</div>` : ''}
    <div class="vote-panel">
      <h4><span>Votes · ${voted.length} of ${vs.length}</span>
        ${!all ? `<button class="btn btn-ghost" id="reveal-card" style="font-size:.9em;padding:.3em .9em">${reveal ? 'Hide' : 'Reveal now (R)'}</button>` : ''}</h4>
      <div class="vote-row">
        ${vs.map((v) => {
          const mv = votes[v.uid];
          return `<div class="voter"><span class="avatar ${reveal && mv ? 'v-' + mv : mv ? 'on' : ''}">${mv && !reveal ? '✓' : esc(initials(v.name))}</span>${esc(v.name)}</div>`;
        }).join('')}
      </div>
      ${reveal ? `<div class="tally">
          <div class="t-must">${cnt.must} Must do<small>${esc(namesFor('must'))}</small></div>
          <div class="t-if">${cnt.if} If time<small>${esc(namesFor('if'))}</small></div>
          <div class="t-skip">${cnt.skip} Skip<small>${esc(namesFor('skip'))}</small></div>
        </div>` : `<p class="muted" style="margin:.5em 0 0;font-size:.8em">Results show when everyone has voted.</p>`}
    </div>`;
  $('#reveal-card') && ($('#reveal-card').onclick = revealCurrent);
  $('#pick') && ($('#pick').onclick = () => chooseHotel(card.city, card.id));
  $('#unpick') && ($('#unpick').onclick = () => chooseHotel(card.city, null));

  $('#strip').innerHTML = w.list.map((c, i) => `
    <div class="film ${i === w.ci ? 'active' : ''}" data-card="${i}">
      ${imageHtml(c)}<span class="dot dot-${revealed(c) ? tierOf(c) : 'none'}"></span><p>${esc(c.title)}</p>
    </div>`).join('');
  $$('[data-card]').forEach((el) => (el.onclick = () => setSession({ cardIndex: +el.dataset.card })));
  const active = $('.film.active');
  active && active.scrollIntoView({ block: 'nearest', inline: 'center' });
}

function wikiBlurb(card) {
  const w = cardWiki(card);
  return w ? `<p class="wiki-blurb">${esc(w.extract)}</p>` : '';
}

function togglePlay() {
  const w = baseWalk();
  if (!w.card) return;
  local.playing = local.playing === w.card.id ? null : w.card.id;
  render();
}
function revealCurrent() {
  const w = baseWalk();
  if (state.session.step !== 'bases' || !w.card) return;
  setSession({ reveal: { [w.card.id]: !state.session.reveal?.[w.card.id] } });
}

// ---------------- Step 3: splits ----------------
function renderSplits(main) {
  const r = lockedRoute();
  if (!r) { main.innerHTML = `<div class="empty-big"><div><h3>No route locked yet</h3></div></div>`; return; }
  const cities = routeCities(r);
  const pool = sortedCards(state.cards.filter((c) => cities.includes(c.city)));
  const splits = pool.filter((c) => !c.decision && autoTier(c) === 'split');
  const decided = pool.filter((c) => c.decision);
  if (!splits.find((c) => c.id === local.splitSel)) local.splitSel = splits[0]?.id || null;
  const sel = splits.find((c) => c.id === local.splitSel);
  const counts = { must: 0, if: 0, skip: 0, none: 0 };
  pool.forEach((c) => { const t = tierOf(c); if (counts[t] != null) counts[t]++; });

  main.innerHTML = `
    <h2 class="h-section">Settle the splits</h2>
    <p class="lead">${splits.length ? `${splits.length} idea${splits.length === 1 ? '' : 's'} where someone said Must do and someone said Skip. Talk it over and decide.` : 'Nothing contested — nice.'}
      <span class="chip" style="margin-left:.6em">✅ ${counts.must} must</span> <span class="chip">🕐 ${counts.if} if time</span> <span class="chip">⏭ ${counts.skip} skip</span>
      ${counts.none ? `<span class="chip">⏳ ${counts.none} not voted</span>` : ''} ${decided.length ? `<span class="chip">🔨 ${decided.length} decided</span>` : ''}</p>
    ${splits.length ? `
    <div class="splits-layout">
      <div class="split-list">
        ${splits.map((c) => `
          <div class="split-item ${c.id === local.splitSel ? 'active' : ''}" data-sel="${c.id}">
            ${imageHtml(c)}<div><h5>${esc(c.title)}</h5><p>${esc(CITIES[c.city])} · ${esc(CATS[c.cat]?.label || '')}</p></div>
            <span class="tier tier-split">${voteCounts(c).must}✓ ${voteCounts(c).skip}✕</span>
          </div>`).join('')}
      </div>
      ${sel ? splitDetail(sel) : ''}
    </div>` : `<div class="empty-big" style="height:60%"><div><h3>All settled</h3><p>Move on to building the days →</p></div></div>`}`;
  $$('[data-sel]', main).forEach((el) => (el.onclick = () => { local.splitSel = el.dataset.sel; render(); }));
  $$('[data-decide]', main).forEach((b) => (b.onclick = () => decide(local.splitSel, b.dataset.decide)));
}
function splitDetail(c) {
  const vs = voters();
  const votes = c.votes || {};
  const who = (t) => vs.filter((v) => votes[v.uid] === t).map((v) => esc(v.name)).join('<br>') || '—';
  return `
    <div class="split-detail">
      <div style="border-radius:14px;overflow:hidden;aspect-ratio:16/7">${imageHtml(c, 'fill')}</div>
      <h3>${esc(c.title)}</h3>
      <p style="margin:0">${esc(c.pitch || '')}</p>
      <div class="who-voted">
        <div class="t-must" style="background:color-mix(in srgb,var(--must) 22%,transparent)"><b>Must do</b>${who('must')}</div>
        <div style="background:color-mix(in srgb,var(--if) 22%,transparent)"><b>If time</b>${who('if')}</div>
        <div style="background:color-mix(in srgb,var(--skip) 25%,transparent)"><b>Skip</b>${who('skip')}</div>
      </div>
      <div class="decide-row">
        <button class="btn btn-must" data-decide="must">Decide: Must do</button>
        <button class="btn btn-if" data-decide="if">If time</button>
        <button class="btn btn-skip" data-decide="skip">Skip it</button>
      </div>
    </div>`;
}

// ---------------- Step 4: days ----------------
function renderDays(main) {
  const r = lockedRoute();
  if (!r) { main.innerHTML = `<div class="empty-big"><div><h3>No route locked yet</h3></div></div>`; return; }
  const nights = routeNights(r);
  const items = planCards(local.includeIf);
  const travel = travelFor(r);
  const notes = Object.fromEntries(state.days.map((d) => [d.id, d.note]));
  const datesFor = (city) => nights.filter((n) => n.city === city);
  const unscheduled = items.filter((c) => !c.day || !nights.some((n) => n.date === c.day));
  const lastDay = addDays(nights[nights.length - 1].date, 1);
  const slotOrder = Object.fromEntries(SLOTS.map((x, i) => [x.id, i]));
  const slotIcon = (id) => SLOTS.find((x) => x.id === id)?.icon || '';

  const dayCell = (date, n, i) => {
    const entries = [
      ...travel.filter((t) => t.date === date).map((t) => ({ slot: t.slot, html: `<div class="day-item travel-item" title="${esc([t.time, t.cost, t.note].filter(Boolean).join(' · '))}">${esc(t.title)}${t.time ? `<small>${esc(t.time)}</small>` : ''}</div>` })),
      ...items.filter((c) => c.day === date).map((c) => ({ slot: c.slot || defaultSlot(c), html: `<div class="day-item"><span>${slotIcon(c.slot || defaultSlot(c))}</span>${esc(c.title)}<button data-unsched="${c.id}" title="Remove">×</button></div>` })),
    ].sort((x, y) => slotOrder[x.slot] - slotOrder[y.slot]);
    const hotel = n && chosenHotel(n.city);
    return `<div class="day ${n ? '' : 'travel'}">
      <header><b>${fmtDate(date, { weekday: 'short' })} ${fmtDate(date, { month: 'short', day: 'numeric' })}</b><span class="muted">${n ? `Day ${i + 1}` : 'Day ' + (i + 1)}</span></header>
      <span class="city city-${n ? n.city : 'madrid'}">${n ? esc(CITIES[n.city]) : 'Fly home'}</span>
      ${n ? `<div class="hotel-line">${hotel ? '🛏️ ' + esc(hotel.title) : '<span class="muted">🛏️ hotel not picked</span>'}</div>` : ''}
      ${entries.map((e) => e.html).join('')}
      ${notes[date] ? `<div class="note">${esc(notes[date])}</div>` : ''}
    </div>`;
  };

  main.innerHTML = `
    <h2 class="h-section">Build the days</h2>
    <p class="lead">Put each must-do on a day and time. Trains, transfers and flights are already on. ${unscheduled.length ? `${unscheduled.length} still to place.` : 'Everything is placed.'}
      <label class="toggle" style="margin-left:1em"><input type="checkbox" id="incl-if" ${local.includeIf ? 'checked' : ''}> Include “If time” ideas</label>
      <span class="legend">${SLOTS.map((x) => `${x.icon} ${x.label}`).join(' · ')}</span></p>
    <div class="days-layout">
      <div class="days-grid">
        ${nights.map((n, i) => dayCell(n.date, n, i)).join('')}
        ${dayCell(lastDay, null, nights.length)}
      </div>
      <aside class="unscheduled">
        <h4>To place</h4>
        ${unscheduled.length ? routeCities(r).map((city) => {
          const list = unscheduled.filter((c) => c.city === city);
          if (!list.length) return '';
          return `<div class="tiny muted" style="margin-top:.4em;font-weight:700">${esc(CITIES[city])}</div>` + list.map((c) => `
            <div class="u-item"><span>${CATS[c.cat]?.icon || ''} ${esc(c.title)} ${tierOf(c) === 'if' ? '<span class="tier tier-if">If time</span>' : ''}</span>
              <select data-sched="${c.id}"><option value="">Put on…</option>${datesFor(city).map((n) => `<optgroup label="${fmtDate(n.date)}">${SLOTS.map((x) => `<option value="${n.date}|${x.id}" ${x.id === defaultSlot(c) ? '' : ''}>${fmtDate(n.date, { month: 'short', day: 'numeric' })} · ${x.label}</option>`).join('')}</optgroup>`).join('')}</select></div>`).join('');
        }).join('') : '<p class="muted tiny">Nothing left — every idea has a day.</p>'}
      </aside>
    </div>`;
  $('#incl-if').onchange = (e) => { local.includeIf = e.target.checked; render(); };
  $$('[data-sched]', main).forEach((s) => (s.onchange = () => { if (!s.value) return; const [d, sl] = s.value.split('|'); scheduleCard(s.dataset.sched, d, sl); }));
  $$('[data-unsched]', main).forEach((b) => (b.onclick = () => scheduleCard(b.dataset.unsched, null)));
}
