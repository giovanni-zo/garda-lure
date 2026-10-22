/* Garda Lure: transparent, constraint-first recommendations. No catch probabilities. */
(function () {
  'use strict';
  const originalRead = readInputs;
  Object.assign(DEFAULTS, {rodMin:'', rodMax:'', practicalOnly:true, groupFamilies:true});
  readInputs = function () {
    const inp = originalRead();
    inp.rodMin = Math.max(0, Number($('rodMin').value) || 0);
    inp.rodMax = Math.max(0, Number($('rodMax').value) || 0);
    inp.practicalOnly = $('practicalOnly').checked;
    inp.groupFamilies = $('groupFamilies').checked;
    return inp;
  };
  const surface = l => ['topwater','buzzbait','crawler'].includes(l.cat);
  const variable = l => l.cat.includes('soft') || ['spoon','spintail','blade bait','vertical jig','lipless vibration'].includes(l.cat);
  depthFit = function (l, inp) {
    const d = inp.depth;
    if (surface(l)) return d <= .5 ? .95 : clamp(.75 - d * .22, .02, .70);
    if (!Number.isFinite(l.runMin) || !Number.isFinite(l.runMax)) return .25;
    // Rig-dependent lures still have a finite working envelope. "Variable" is not unlimited.
    const min = Math.max(0, l.runMin), max = Math.max(min, l.runMax);
    if (d >= min && d <= max) return variable(l) ? .82 : .95;
    const gap = d < min ? min - d : d - max;
    const tolerance = variable(l) ? 1.8 : /sinking/i.test(l.buoyancy) ? 1.1 : .65;
    return clamp(.85 * Math.exp(-gap / tolerance), .02, .85);
  };
  function assess(l, inp, env) {
    const cast = estimateCast(l, inp, env);
    const depth = depthFit(l, inp);
    const rod = (!inp.rodMin || l.weight >= inp.rodMin) && (!inp.rodMax || l.weight <= inp.rodMax);
    const reasons = [];
    if (!rod) reasons.push('peso fuori dal casting della canna');
    if (cast < inp.dropDistance) reasons.push('distanza oltre il lancio centrale stimato');
    if (depth < .4) reasons.push('quota poco compatibile con questa esca');
    return {cast, depth, rod, reasons, practical: rod && cast >= inp.dropDistance && depth >= .4};
  }
  const originalScore = lureScore;
  lureScore = function (l, inp, env) {
    env = env || computeEnvironment(inp);
    const s = originalScore(l, inp, env), a = assess(l, inp, env);
    // Practical limitations multiply suitability; a brand or value score cannot cancel them.
    const reach = clamp(a.cast / Math.max(1, inp.dropDistance), .08, 1);
    s.total = clamp(s.total * (.30 + .70 * Math.sqrt(a.depth)) * Math.pow(reach, 1.8) * (a.rod ? 1 : .25), 0, 100);
    s.depthFit = a.depth * 100;
    s.practical = a.practical;
    s.limitations = a.reasons;
    return s;
  };
  filteredLures = function (inp) {
    if (inp.rodMin && inp.rodMax && inp.rodMin > inp.rodMax) return [];
    const env = computeEnvironment(inp);
    return LURES.filter(l => (inp.makerFilter === 'all' || l.maker === inp.makerFilter) &&
      (inp.catFilter === 'all' || l.cat === inp.catFilter) &&
      (!inp.practicalOnly || assess(l, inp, env).practical));
  };
  sortScored = function (rows, inp) {
    const sorted = rawSortScored(rows, inp);
    if (!inp.groupFamilies) return sorted;
    const seen = new Set();
    return sorted.filter(r => { const k = r.l.maker + '|' + r.l.family; if (seen.has(k)) return false; seen.add(k); return true; });
  };
  const originalUsage = usageText;
  usageText = function (l, inp, env, s) {
    return originalUsage(l, inp, env, s).replace(/<[^>]*>/g, ' ').replace(/\s+/g,' ').trim() + (s.limitations.length ? ' · Limiti: ' + s.limitations.join('; ') : '');
  };
  suggestColor = function (l, inp, env) {
    if (inp.clarity < 5) return 'Contrasto marcato o chartreuse.';
    if (env.light < .35) return 'Silhouette scura; silver con luce residua.';
    return 'Naturale, silver o ayu.';
  };
  legalWarning = function(inp) {
    const md=Number(inp.date.slice(5).replace('-','')), clock=md*24+inp.hour;
    const rules={perch:[401,515,18],pike:[222,415,60],chub:[501,615,30],bass:[501,615,30],trout:[1015,115,40]};
    const rule=rules[inp.target];
    let text='';
    let type='';
    if(rule){
      const start=rule[0]*24+12,end=rule[1]*24+12;
      const closed=start>end?(clock>=start||clock<end):(clock>=start&&clock<end);
      if(closed){type='red';text='Periodo di divieto · Garda Veneto, art. 6.';}
      if(inp.targetSize<rule[2]) text+=' Misura minima: '+rule[2]+' cm · Garda Veneto.';
    }
    return {type,text};
  };
  const originalTop = renderTopPick;
  renderTopPick = function (top, inp, env) {
    if (!top) return '<div class="selector-empty"><strong>Nessuna esca compatibile.</strong><p>Modifica i filtri o il casting della canna.</p></div>';
    return originalTop(top, inp, env);
  };
  const originalRanking = renderRanking;
  renderRanking = function (inp, env, rows) {
    originalRanking(inp, env, rows);
    if (!rows.length) $('rankingBody').innerHTML = '<tr><td colspan="7">Nessun risultato. Modifica i filtri.</td></tr>';
    const eligible = filteredLures(inp).length;
    $('selectionCount').textContent = rows.length + ' scelte mostrate · ' + eligible + ' varianti compatibili con i filtri su ' + LURES.length;
    const cards = window.GardaSelector && window.GardaSelector.selectAlternatives
      ? window.GardaSelector.selectAlternatives(rows,inp) : rows.slice(0,3);
    $('selectionCards').innerHTML = cards.map((r,i) => `<article class="choice-card"><div class="choice-eyebrow">${i === 0 ? '01 · Prima prova' : '0' + (i+1) + ' · Alternativa'} · ${Math.round(r.s.total)}/100</div><h3><button class="lure-title-btn" data-lure-id="${safeText(r.l.id)}">${safeText(r.l.maker)} ${safeText(r.l.family)} ${safeText(r.l.code)}</button></h3><p>${r.l.lengthCm} cm · ${r.l.weight} g · ${safeText(r.l.runText)}</p><p>${safeText(usageText(r.l,inp,env,r.s))}</p>${r.s.rig&&r.l.cat.includes("soft")?`<p>${safeText(window.GardaSelector.rigText(r.l,inp))}</p>`:""}<div class="choice-cast">Lancio indicativo ${Math.round(r.s.castRange?r.s.castRange.min:r.s.expectedCast*.75)}–${Math.round(r.s.castRange?r.s.castRange.max:r.s.expectedCast*1.15)} m</div></article>`).join('');
  };
  for(const l of LURES) l.source='Profilo generico per tecnica';
  $('selectionCards').addEventListener('click', e => { const b=e.target.closest('[data-lure-id]'); if(b) openSingleLure(b.dataset.lureId); });
  ['rodMin','rodMax','practicalOnly','groupFamilies'].forEach(id => $(id).addEventListener('input',runSimulation));
  $('resetSelection').addEventListener('click', () => { $('rodMin').value=''; $('rodMax').value=''; $('practicalOnly').checked=true; $('groupFamilies').checked=true; $('makerFilter').value='all'; $('catFilter').value='all'; runSimulation(); });
  const originalToggle = toggleMode;
  toggleMode = function(mode) { originalToggle(mode); $('selectionPanel').classList.toggle('hidden',mode!=='ranking'); };
  document.querySelectorAll('.controls > .section').forEach((section,i) => {
    if(i===0 || section.id==='singleControls') return;
    const heading=section.querySelector('h2');
    if(!heading) return;
    const details=document.createElement('details'), summary=document.createElement('summary');
    summary.textContent=heading.textContent;
    heading.remove();
    details.appendChild(summary);
    while(section.firstChild) details.appendChild(section.firstChild);
    section.appendChild(details);
  });
  document.querySelector('.subtitle').textContent='Scegli l’esca per quota, distanza e casting della canna. Confronta le alternative e verifica sul posto le condizioni stimate del Garda.';
  window.GardaSelector = {assess};
  runSimulation();
})();
