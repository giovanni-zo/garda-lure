/* Type-based fishing UI. No product brands or model names are used in this interface. */
(function(){
'use strict';
const TYPES=window.GardaTypes.definitions;
const typeKeys=window.GardaTypes.keys;
const generic=window.GardaTypes.build();
LURES.splice(0,LURES.length,...generic);
const SPECIES_ART={perch:'Persico reale',bass:'Black bass',chub:'Cavedano',asp:'Aspio',pike:'Luccio',zander:'Lucioperca',trout:'Trota lacustre'};
const shortStructure={rock:'Sassi e massi',harbor:'Porto e pontili',weed:'Erba e vegetazione',drop:'Scalino',cliff:'Parete ripida',sand:'Spiaggia',river:'Foce e corrente'};
for(const option of $('structure').options)option.textContent=shortStructure[option.value]||option.textContent;
const previousLocation=$('location').value;populateStatic();$('location').value=previousLocation;$('makerFilter').value='all';$('catFilter').value='all';$('singleMaker').value='Tecnica';populateFamilies();
const oldAside=document.querySelector('aside.controls');const legacy=document.createElement('div');legacy.className='legacy-controls';
while(oldAside.firstChild)legacy.appendChild(oldAside.firstChild);oldAside.appendChild(legacy);
const form=document.createElement('div');form.id='simpleControls';form.innerHTML=`
<div class="flow-heading"><span class="eyebrow">La tua pescata</span><h2>Partiamo da qui</h2></div>
<section class="flow-group"><h3>1. Quale pesce?</h3><div id="fishChoices" class="fish-choices"></div></section>
<section class="flow-group"><h3>2. Dove?</h3><div id="simpleLocation"></div><div id="simpleStructure"></div></section>
<section class="flow-group"><h3>3. Quando e con che acqua?</h3><div id="simpleDate"></div><div id="simpleHour"></div><label for="waterLook">Com’è l’acqua?</label><select id="waterLook"><option value="clear">Limpida</option><option value="stained">Velata</option><option value="murky">Torbida</option></select><label for="rodPower">La tua canna</label><select id="rodPower"><option value="light">Leggera · 1–10 g</option><option value="medium" selected>Media · 5–25 g</option><option value="heavy">Pesante · 15–60 g</option><option value="big">Big bait · 40–120 g</option><option value="all">Non lo so</option></select></section>
<details class="simple-adjust"><summary>Regola le condizioni</summary><div id="simpleWaterTemp"></div><div id="simpleWind"></div><div id="simpleCloud"></div><label for="simpleWeed">Vegetazione</label><select id="simpleWeed"><option value="sparse">Rada / bordo</option><option value="dense">Fitta</option></select><div class="auto-depth-row"><label for="autoHabitatSimple"><input id="autoHabitatSimple" type="checkbox" checked> Quota e distanza automatiche</label></div><div id="simpleDepth"></div><div id="simpleDistance"></div></details>
<button id="simpleGps" class="gps-button" type="button">Usa posizione e meteo</button><div id="simpleGpsStatus" class="tiny" aria-live="polite"></div>`;
oldAside.prepend(form);
function moveControl(id,destination,labelText){const el=$(id),box=$(destination),label=document.createElement('label');label.htmlFor=id;label.textContent=labelText;box.appendChild(label);box.appendChild(el);const val=$(id+'Val');if(val){const line=document.createElement('span');line.className='input-value';line.appendChild(val);box.appendChild(line);}}
moveControl('location','simpleLocation','Zona del lago');moveControl('structure','simpleStructure','Tipo di riva');moveControl('date','simpleDate','Giorno');moveControl('hour','simpleHour','Ora');moveControl('waterTemp','simpleWaterTemp','Temperatura acqua · °C');moveControl('windSpeed','simpleWind','Vento · m/s');moveControl('cloud','simpleCloud','Nuvole');moveControl('depth','simpleDepth','Quota di pesca · m');moveControl('dropDistance','simpleDistance','Distanza da riva · m');
$('fishChoices').innerHTML=Object.entries(SPECIES_ART).map(([key,name])=>`<button type="button" class="fish-choice" data-species="${key}" aria-pressed="false"><img src="./assets/illustrations/fish-${key}.png?v=6.1" alt="" width="90" height="65"><span>${name}</span></button>`).join('');
const main=document.querySelector('main.main'),hub=document.createElement('section');hub.id='fishingHub';hub.innerHTML=`
<nav class="simple-nav" aria-label="Sezioni"><button type="button" data-simple-mode="ranking">Consigli</button><button type="button" data-simple-mode="spots">Dove pescare</button><button type="button" data-simple-mode="catalog">Tutti i tipi</button><button type="button" data-simple-mode="map">Mappa</button></nav>
<section id="simpleSpot" class="spot-overview"><img id="currentFishArt" alt="" width="110" height="80"><div><span class="eyebrow" id="currentFishLabel"></span><h2 id="simpleSpotTitle"></h2><div id="simpleSpotNumbers" class="spot-chips"></div></div><div id="simpleLegal" role="status"></div></section>
<section id="simpleRecommendations"><div class="result-heading"><div><span class="eyebrow">Da mettere in acqua</span><h2>Tre modi per iniziare</h2></div><span id="simpleWaterColor" class="water-color"></span></div><div id="simpleChoices" class="simple-choice-grid"></div></section>
<section id="simpleSpots" hidden><div class="result-heading"><h2>Zone da provare</h2></div><div id="simpleSpotCards" class="spot-list"></div></section>
<section id="simpleCatalog" hidden><div class="result-heading"><h2>Tutti i tipi di esca</h2><span id="typeCount"></span></div><div id="simpleTypeGrid" class="type-grid"></div></section>
<section id="simpleDetail" hidden></section>`;main.prepend(hub);
$('selectionPanel').classList.add('legacy-interface');
for(const id of ['rankingPanel','spotPanel','singlePanel','catalogPanel'])$(id).classList.add('legacy-interface');
document.querySelector('.summary').classList.add('legacy-interface');
$('appTitle').textContent='Garda Lure';document.title='Garda Lure · esche e spot';
document.querySelector('.pillrow').innerHTML=`<span class="pill">${typeKeys.length} tipi di esca</span>`;
const readEngine=readInputs;
readInputs=function(){
const power={light:[1,10],medium:[5,25],heavy:[15,60],big:[40,120],all:[0,0]}[$('rodPower').value]||[0,0];
$('rodMin').value=power[0]||'';$('rodMax').value=power[1]||'';
$('weedDensity').value=$('simpleWeed').value;
$('softHook').value=$('structure').value==='weed'?'weedless':'exposed';
const depth=+$('depth').value,wind=+$('windSpeed').value;
$('jigHead').value=depth<1?1.5:depth<3?3:depth<6?5:depth<10?10:14;
if(wind>8)$('jigHead').value=Math.min(28,+$('jigHead').value+3);
$('rigHardware').value=0;
return readEngine();};
function colorFor(inp){return inp.clarity>=7?{key:'natural',label:'Naturale · oliva e argento'}:inp.clarity>=4?{key:'gold',label:'Oro e rame'}:{key:'murky',label:'Chartreuse · forte contrasto'};}
function art(l,inp,cls=''){const c=colorFor(inp);return `<div class="lure-art ${c.key} ${cls}"><img src="./assets/illustrations/${l.art||TYPES[l.cat][1]}.png?v=6.1" alt="${safeText(l.family)}" loading="lazy" width="300" height="190"></div>`;}
const descriptor={minnow:'Minnow',spinner:'Spinner',metal:'Metallo',soft:'Gomma',cover:'Vibrazione',crank:'Crankbait',surface:'Superficie'};
let currentType=null;
function openType(id){currentType=id;const l=LURES.find(x=>x.id===id);if(!l)return;const inp=readInputs(),env=computeEnvironment(inp),s=lureScore(l,inp,env);$('simpleDetail').innerHTML=`<button type="button" class="text-back" data-back>← Torna ai consigli</button><article class="type-detail">${art(l,inp)}<div><span class="eyebrow">${l.buoyancy}</span><h2>${safeText(l.family)}</h2><div class="spot-chips"><span>${l.lengthCm} cm</span><span>${fmt(s.rig.totalWeight,1)} g</span><span>${l.runText}</span></div><h3>Come usarla</h3><p>${safeText(retrieveAdvice(l,inp,env))}</p><div class="color-dot ${colorFor(inp).key}">${colorFor(inp).label}</div></div></article>`;$('mode').value='single';toggleMode('single');}
openSingleLure=openType;
function perType(rows){const seen=new Set();return rows.filter(r=>{if(seen.has(r.l.cat))return false;seen.add(r.l.cat);return true;});}
const engineSort=sortScored;sortScored=(rows,inp)=>perType(engineSort(rows,{...inp,groupFamilies:false}));
renderSummary=function(inp,env,rows){const h=estimatedHabitat(inp);$('simpleSpotTitle').textContent=LOCATIONS[inp.location].label;$('currentFishLabel').textContent=SPECIES_ART[inp.target];$('currentFishArt').src='./assets/illustrations/fish-'+inp.target+'.png?v=6.1';$('simpleSpotNumbers').innerHTML=`<span>${shortStructure[inp.structure]}</span><span>Pesca a ${inp.autoHabitat?h.rangeMin+'–'+h.rangeMax:fmt(inp.depth,1)} m</span><span>A circa ${inp.dropDistance} m da riva</span>`;const legal=legalWarning(inp);$('simpleLegal').textContent=legal.text;$('simpleLegal').hidden=!legal.text;for(const b of $('fishChoices').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.species===inp.target));$('simpleWaterColor').textContent=colorFor(inp).label;};
renderRanking=function(inp,env,rows){const choices=window.GardaSelector.selectAlternatives(rows,inp);$('simpleChoices').innerHTML=choices.map((r,i)=>{const l=r.l,s=r.s;return `<article class="simple-choice"><div class="choice-topline"><span>${i===0?'Prima prova':'Alternativa'}</span><span>${descriptor[window.GardaSelector.method(l)]||''}</span></div><button class="art-button" type="button" data-type="${l.id}">${art(l,inp)}</button><h3><button type="button" class="type-title" data-type="${l.id}">${safeText(l.family)}</button></h3><div class="lure-numbers"><span>${l.lengthCm} cm</span><span>${fmt(s.rig.totalWeight,1)} g</span><span>${l.buoyancy}</span></div><p class="retrieve-line">${safeText(retrieveAdvice(l,inp,env))}</p><div class="choice-footer"><span class="color-dot ${colorFor(inp).key}">${colorFor(inp).label}</span><button type="button" class="detail-link" data-type="${l.id}">Dettagli ↗</button></div></article>`;}).join('')||'<div class="empty-simple">Nessuna esca per questa combinazione. Prova una canna diversa o una quota più vicina alla riva.</div>';};
renderSpotRecommendations=function(inp,rows){$('simpleSpotCards').innerHTML=rows.slice(0,6).map(r=>`<article class="simple-spot-card"><div><h3>${safeText(r.loc.label)}</h3><p>${shortStructure[r.structure]} · ${r.hab.rangeMin}–${r.hab.rangeMax} m</p></div><button type="button" data-use-spot="${r.key}" data-structure="${r.structure}">Scegli zona</button></article>`).join('');};
renderSingle=function(inp){if(inp.mode==='single'&&currentType)openType(currentType);};
renderCatalog=function(inp,env,rows){if(inp.mode!=='catalog')return;const reps=typeKeys.map(cat=>{const best=rows.find(r=>r.l.cat===cat);return best||{l:LURES.find(l=>l.cat===cat)}});$('simpleTypeGrid').innerHTML=reps.map(({l})=>`<button class="type-tile" type="button" data-type="${l.id}">${art(l,inp)}<strong>${safeText(l.family)}</strong><span>${l.buoyancy} · ${l.runText}</span></button>`).join('');$('typeCount').textContent=typeKeys.length+' tecniche';};
const legacyToggle=toggleMode;
toggleMode=function(mode){legacyToggle(mode);$('simpleRecommendations').hidden=mode!=='ranking';$('simpleSpots').hidden=mode!=='spots';$('simpleCatalog').hidden=mode!=='catalog';$('simpleDetail').hidden=mode!=='single';$('simpleSpot').hidden=mode==='map'||mode==='catalog';for(const b of hub.querySelectorAll('[data-simple-mode]'))b.setAttribute('aria-current',b.dataset.simpleMode===mode?'page':'false');};
form.addEventListener('click',e=>{const b=e.target.closest('[data-species]');if(b){$('target').value=b.dataset.species;$('targetSize').value={perch:25,bass:40,chub:35,asp:50,pike:80,zander:55,trout:50}[b.dataset.species];$('target').dispatchEvent(new Event('change',{bubbles:true}));}});
hub.addEventListener('click',e=>{const type=e.target.closest('[data-type]'),nav=e.target.closest('[data-simple-mode]'),spot=e.target.closest('[data-use-spot]');if(type)openType(type.dataset.type);if(nav){$('mode').value=nav.dataset.simpleMode;runSimulation();}if(spot){$('location').value=spot.dataset.useSpot;$('structure').value=spot.dataset.structure;$('autoHabitat').checked=true;$('autoHabitatSimple').checked=true;applyHabitatPreset();$('mode').value='ranking';runSimulation();}if(e.target.closest('[data-back]')){$('mode').value='ranking';runSimulation();}});
$('waterLook').addEventListener('change',()=>{$('clarity').value={clear:8,stained:5,murky:2}[$('waterLook').value];runSimulation();});
$('rodPower').addEventListener('change',runSimulation);$('simpleWeed').addEventListener('change',runSimulation);
$('autoHabitatSimple').addEventListener('change',()=>{$('autoHabitat').checked=$('autoHabitatSimple').checked;maybeAutoHabitat();runSimulation();});
for(const id of ['depth','dropDistance'])$(id).addEventListener('input',()=>{$('autoHabitatSimple').checked=false;});
$('simpleGps').onclick=async()=>{if(window.GardaLiveWeather){$('simpleGpsStatus').textContent='Aggiorno…';await window.GardaLiveWeather.useGpsWeather(true);maybeAutoHabitat();runSimulation();const status=$('gpsWeatherStatus');$('simpleGpsStatus').textContent=status&&status.textContent.startsWith('Errore')?status.textContent:'Scenario aggiornato';}};
window.GardaSimple={types:TYPES,typeKeys,art,colorFor,perType};
$('targetSize').value={perch:25,bass:40,chub:35,asp:50,pike:80,zander:55,trout:50}[$('target').value];
$('mode').value='ranking';maybeAutoHabitat();runSimulation();
})();
