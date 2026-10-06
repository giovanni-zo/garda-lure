(function(){
  'use strict';
  const root=document.currentScript.dataset.root||'./';
  const panel=document.getElementById('bathymetryPanel');
  const canvas=document.getElementById('bathymetryCanvas');
  if(!panel||!canvas)return;
  const shell=canvas.parentElement;
  const tabs=document.createElement('div');tabs.className='garda-view-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Vista della mappa');
  tabs.innerHTML='<button id="garda3dTab" type="button" role="tab" aria-controls="garda3dPane" aria-selected="true">Lago in 3D</button><button id="garda2dTab" type="button" role="tab" aria-controls="bathymetryCanvas" aria-selected="false">Mappa 2D · pesca</button>';
  shell.insertBefore(tabs,canvas);
  const pane=document.createElement('div');pane.id='garda3dPane';pane.setAttribute('role','tabpanel');pane.setAttribute('aria-labelledby','garda3dTab');
  pane.innerHTML='<div class="garda-3d-stage"><model-viewer id="gardaLakeModel" alt="Modello tridimensionale stimato del fondale del Lago di Garda, con isobate, penisola di Sirmione e isole" camera-controls disable-tap camera-orbit="0deg 42deg 75m" camera-target="0m -1m 0m" min-camera-orbit="auto 0deg 3m" max-camera-orbit="auto 85deg 130m" field-of-view="35deg" shadow-intensity="0" exposure="0.8" interaction-prompt="none" loading="lazy" reveal="auto"><button class="garda-hotspot" slot="hotspot-selected" data-position="0m 0m 0m" data-normal="0m 1m 0m" aria-label="Punto selezionato" hidden></button></model-viewer><div class="garda-3d-caption"><strong>Lago di Garda</strong><span>Fondale 3D · rilievo ×12</span></div><div id="garda3dStatus" class="garda-3d-status" role="status">Caricamento del modello 3D…</div></div><div class="garda-3d-tools"><button type="button" id="garda3dReset">Vista iniziale</button><button type="button" id="garda3dTop">Dall’alto</button><select id="garda3dRegion" aria-label="Zona del lago in 3D"><option value="all">Lago completo</option><option value="north">Alto Garda</option><option value="south">Basso Garda</option><option value="salo">Salò e Manerba</option><option value="sirmione">Sirmione</option></select><a id="garda3dDownload" download="lake-garda.glb">Scarica modello 3D</a></div><div class="garda-3d-scale"><span>Profondità stimata</span><i aria-hidden="true"></i><span>0 → 346 m</span></div><div class="garda-3d-note">Trascina per ruotare, pizzica o usa la rotella per zoomare. Tocca il fondale per selezionare uno spot. Ricostruzione visiva dagli screenshot e dal modello Garda Lure; profondità stimate, rilievo amplificato ×12.</div>';
  shell.insertBefore(pane,canvas);
  canvas.setAttribute('role','tabpanel');canvas.setAttribute('aria-labelledby','garda2dTab');
  const viewer=document.getElementById('gardaLakeModel');
  const status=document.getElementById('garda3dStatus');
  const hotspot=viewer.querySelector('.garda-hotspot');
  document.getElementById('garda3dDownload').href=root+'assets/lake-garda.glb';
  viewer.src=root+'assets/lake-garda.glb';viewer.poster=root+'assets/lake-garda-preview.png';
  let view='3d',loaded=false,loadStarted=false;
  function describe3D(){
    document.getElementById('mapTitle').textContent='Lago di Garda · mappa 3D';
    document.getElementById('mapInfo').textContent='Ruota il lago e tocca il fondale per selezionare uno spot.';
    document.getElementById('mapIntro').textContent='Fondale tridimensionale con isobate, golfi, isole e penisola di Sirmione. I colori indicano la profondità stimata; il rilievo è amplificato ×12 per rendere leggibili pendii e secche.';
  }
  const render2D=renderBathymetryMap;
  renderBathymetryMap=function(inp,env){
    if(view==='3d'){ensureMapRegionControl();updateClickInfo(inp);updateMapPointSummary(inp,env);describe3D();}
    else render2D(inp,env);
  };
  function loadViewer(){
    if(loadStarted)return;loadStarted=true;
    const script=document.createElement('script');script.type='module';script.src=root+'vendor/model-viewer.min.js';
    script.onerror=()=>{status.hidden=false;status.textContent='Visualizzatore 3D non disponibile. Apri la Mappa 2D.';setView('2d');};
    document.head.appendChild(script);
  }
  function setView(value){
    view=value;const is3d=value==='3d';pane.hidden=!is3d;canvas.hidden=is3d;
    tabs.querySelectorAll('button').forEach(b=>{const active=(b.id==='garda3dTab')===is3d;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
    const filters=panel.querySelector('.map-controls');if(filters)filters.hidden=is3d;
    if(is3d){describe3D();if(!panel.classList.contains('hidden'))loadViewer();}
    else if(typeof runSimulation==='function')runSimulation();
  }
  document.getElementById('garda3dTab').onclick=()=>setView('3d');
  document.getElementById('garda2dTab').onclick=()=>setView('2d');
  tabs.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();setView(e.key==='Home'?'3d':e.key==='End'?'2d':view==='3d'?'2d':'3d');document.getElementById(view==='3d'?'garda3dTab':'garda2dTab').focus();}});
  const regions={all:[0,-1,0,75],north:[8,-1,-15,43],south:[-7,-.3,16,40],salo:[-12,-.3,8,18],sirmione:[-6.3,-.1,19,13]};
  function frame(top){const r=regions[document.getElementById('garda3dRegion').value];viewer.cameraTarget=r[0]+'m '+r[1]+'m '+r[2]+'m';viewer.cameraOrbit='0deg '+(top?'0':'42')+'deg '+r[3]+'m';}
  document.getElementById('garda3dReset').onclick=()=>{document.getElementById('garda3dRegion').value='all';frame(false);};
  document.getElementById('garda3dTop').onclick=()=>frame(true);
  document.getElementById('garda3dRegion').onchange=()=>frame(false);
  viewer.addEventListener('load',()=>{loaded=true;status.hidden=true;});
  viewer.addEventListener('error',()=>{status.hidden=false;status.textContent='Modello 3D non disponibile. La Mappa 2D resta accessibile.';setView('2d');});
  let down=null;
  viewer.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,time:performance.now(),id:e.pointerId};});
  viewer.addEventListener('pointercancel',()=>{down=null;});
  viewer.addEventListener('pointerup',e=>{
    if(!down||down.id!==e.pointerId||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6||performance.now()-down.time>600){down=null;return;}down=null;
    if(!loaded||typeof viewer.positionAndNormalFromPoint!=='function')return;
    const hit=viewer.positionAndNormalFromPoint(e.clientX,e.clientY);if(!hit)return;
    const lon=10.69+hit.position.x/(111.32*Math.cos(45.64*Math.PI/180));const lat=45.66-hit.position.z/111.32;
    if(typeof pointInLake!=='function'||!pointInLake(lon,lat))return;
    BATHY_STATE.click={lon,lat};BATHY_POINT_STATE.assessment=null;
    const input=readInputs(),ass=pointAssessment({lon,lat},input);
    if(ass){BATHY_POINT_STATE.assessment=ass;applyScenarioFromPoint(ass);}
    runSimulation();
    hotspot.hidden=false;viewer.updateHotspot({name:'hotspot-selected',position:hit.position.x+'m '+(hit.position.y+.08)+'m '+hit.position.z+'m',normal:'0m 1m 0m'});
  });
  const observer=new MutationObserver(()=>{if(!panel.classList.contains('hidden')&&view==='3d')loadViewer();});observer.observe(panel,{attributes:true,attributeFilter:['class']});
  setView('3d');
  window.Garda3D={setView,viewer};
  if(new URLSearchParams(location.search).get('view')==='map'&&typeof ultimateOpenAppMode==='function')ultimateOpenAppMode('map');
})();
