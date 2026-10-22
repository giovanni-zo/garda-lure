/* One geographic data source and one depth surface for both map views. */
(function(){
'use strict';
const data=window.GardaLakeData,panel=$('bathymetryPanel');if(!data||!panel)return;
const original=$('bathymetryCanvas'),canvas=original.cloneNode(false);original.replaceWith(canvas);
const context=canvas.getContext('2d');
const full={lonMin:data.bounds[0]-.008,latMin:data.bounds[1]-.008,lonMax:data.bounds[2]+.008,latMax:data.bounds[3]+.008};
const regions={all:full,north:{lonMin:10.70,latMin:45.72,lonMax:10.89,latMax:45.89},center:{lonMin:10.50,latMin:45.55,lonMax:10.76,latMax:45.73},south:{lonMin:10.50,latMin:45.435,lonMax:10.76,latMax:45.59},salo:{lonMin:10.50,latMin:45.54,lonMax:10.64,latMax:45.64},sirmione:{lonMin:10.57,latMin:45.445,lonMax:10.65,latMax:45.535}};
let bounds={...full},region='all',view='2d',selection=null,loaded=false,loadStarted=false,topView=false;
function inRing(lon,lat,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>lat)!==(b[1]>lat)&&lon<(b[0]-a[0])*(lat-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
pointInLake=(lon,lat)=>inRing(lon,lat,data.outer)&&!data.holes.some(h=>inRing(lon,lat,h));
pointInPoly=(lon,lat,poly)=>inRing(lon,lat,poly||data.outer);
GARDA_PRECISE_RING=data.outer;GARDA_LAND_HOLES=[];GARDA_POLY.splice(0,GARDA_POLY.length,...data.outer);GARDA_MODEL_BOUNDS={...full};Object.assign(GARDA_BOUNDS,full);
function gridDepth(lon,lat){
if(!pointInLake(lon,lat))return null;
const x=(lon-data.bounds[0])/(data.bounds[2]-data.bounds[0])*(data.nx-1),y=(lat-data.bounds[1])/(data.bounds[3]-data.bounds[1])*(data.ny-1),ix=Math.floor(x),iy=Math.floor(y);let sum=0,w=0;
for(let dy=0;dy<=1;dy++)for(let dx=0;dx<=1;dx++){const xx=ix+dx,yy=iy+dy;if(xx<0||xx>=data.nx||yy<0||yy>=data.ny)continue;const z=data.depths[yy*data.nx+xx],ww=(dx?x-ix:1-(x-ix))*(dy?y-iy:1-(y-iy));if(z>=0){sum+=z*ww;w+=ww;}}
return w>0?sum/w:0;
}
bathymetryDepth=gridDepth;
shoreDistanceKm=function(lon,lat){const x=(lon-data.origin[0])*data.scale[0],y=(lat-data.origin[1])*data.scale[1];let best=Infinity;for(const ring of [data.outer,...data.holes])for(let i=1;i<ring.length;i++){const a=ring[i-1],b=ring[i],ax=(a[0]-data.origin[0])*data.scale[0],ay=(a[1]-data.origin[1])*data.scale[1],vx=(b[0]-a[0])*data.scale[0],vy=(b[1]-a[1])*data.scale[1],t=clamp(((x-ax)*vx+(y-ay)*vy)/(vx*vx+vy*vy||1),0,1);best=Math.min(best,Math.hypot(x-ax-t*vx,y-ay-t*vy));}return best;};
currentMapBounds=()=>bounds;
function fitBounds(b,w,h){const actual=(b.lonMax-b.lonMin)*data.scale[0]/((b.latMax-b.latMin)*data.scale[1]),ratio=w/h,xc=(b.lonMin+b.lonMax)/2,yc=(b.latMin+b.latMax)/2;let dx=b.lonMax-b.lonMin,dy=b.latMax-b.latMin;if(actual>ratio)dy=dx*data.scale[0]/data.scale[1]/ratio;else dx=dy*data.scale[1]/data.scale[0]*ratio;return {lonMin:xc-dx/2,lonMax:xc+dx/2,latMin:yc-dy/2,latMax:yc+dy/2};}
let displayBounds=full;
lonLatToXY=(lon,lat,w,h)=>({x:(lon-displayBounds.lonMin)/(displayBounds.lonMax-displayBounds.lonMin)*w,y:(displayBounds.latMax-lat)/(displayBounds.latMax-displayBounds.latMin)*h});
xyToLonLat=(x,y,w,h)=>({lon:displayBounds.lonMin+x/w*(displayBounds.lonMax-displayBounds.lonMin),lat:displayBounds.latMax-y/h*(displayBounds.latMax-displayBounds.latMin)});
function color(z){for(let i=1;i<data.colorStops.length;i++)if(z<=data.colorStops[i]){const f=(z-data.colorStops[i-1])/(data.colorStops[i]-data.colorStops[i-1]),a=data.colors[i-1],b=data.colors[i];return `rgb(${a.map((v,k)=>Math.round(v+(b[k]-v)*f)).join(',')})`;}return 'rgb('+data.colors.at(-1).join(',')+')';}
// Browser interpolation produces a continuous depth fill at every zoom level.
const raster=document.createElement('canvas');raster.width=data.nx;raster.height=data.ny;
const rasterContext=raster.getContext('2d'),pixels=rasterContext.createImageData(data.nx,data.ny);
for(let y=0;y<data.ny;y++)for(let x=0;x<data.nx;x++){const z=Math.max(0,data.depths[(data.ny-1-y)*data.nx+x]),c=color(z).match(/\d+/g).map(Number),i=(y*data.nx+x)*4;pixels.data[i]=c[0];pixels.data[i+1]=c[1];pixels.data[i+2]=c[2];pixels.data[i+3]=255;}
rasterContext.putImageData(pixels,0,0);
const controls=panel.querySelector('.map-controls');controls.classList.add('legacy-map-controls');
const toolbar=document.createElement('div');toolbar.className='lake-toolbar';toolbar.innerHTML=`<div class="lake-view-switch" role="tablist"><button id="lake2d" type="button" role="tab" aria-selected="true">2D · isobate</button><button id="lake3d" type="button" role="tab" aria-selected="false">3D · fondale</button></div><select id="lakeArea" aria-label="Area del lago"><option value="all">Tutto il Garda</option><option value="north">Alto Garda</option><option value="center">Centro lago</option><option value="south">Basso Garda</option><option value="salo">Salò e Manerba</option><option value="sirmione">Sirmione</option></select><button id="lakeZoomIn" type="button" aria-label="Ingrandisci mappa">+</button><button id="lakeZoomOut" type="button" aria-label="Riduci mappa">−</button><button id="lakeReset" type="button" aria-label="Ripristina vista">↺</button>`;
panel.insertBefore(toolbar,controls);
const shell=canvas.parentElement;shell.className='new-lake-shell';
const pane=document.createElement('div');pane.id='newLake3d';pane.hidden=true;pane.innerHTML=`<model-viewer id="gardaLakeModel" alt="Fondale 3D del Lago di Garda" camera-controls disable-tap camera-orbit="0deg 36deg 70m" camera-target="0m -1m 0m" min-camera-orbit="auto 0deg 3m" max-camera-orbit="auto 85deg 130m" field-of-view="35deg" shadow-intensity="0" exposure="1" interaction-prompt="none"><button class="garda-hotspot" slot="hotspot-selected" data-position="0m 0m 0m" data-normal="0m 1m 0m" hidden></button></model-viewer><div id="lake3dLoading">Caricamento 3D…</div><button id="lakeFromTop" type="button">Dall’alto</button>`;shell.insertBefore(pane,canvas);
const readout=document.createElement('div');readout.id='lakeReadout';readout.className='lake-readout';readout.hidden=true;shell.appendChild(readout);
const footer=document.createElement('div');footer.className='lake-footer';footer.innerHTML='<span class="lake-depth-key"><i></i>0 · 20 · 50 · 100 · 200 · 346 m</span><span>© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · fondale stimato</span>';shell.appendChild(footer);
const layout=panel.querySelector('.map-layout');if(layout){layout.classList.add('new-lake-layout');const side=layout.querySelector('aside');if(side)side.classList.add('legacy-map-info');}
for(const c of panel.querySelectorAll('.map-info-card'))c.classList.add('legacy-map-info');
$('mapTitle').textContent='Il Lago di Garda';
function path(ring,w,h){context.beginPath();ring.forEach((p,i)=>{const q=lonLatToXY(p[0],p[1],w,h);if(i)context.lineTo(q.x,q.y);else context.moveTo(q.x,q.y);});context.closePath();}
const towns=[['Riva',10.839,45.883],['Torbole',10.874,45.87],['Limone',10.792,45.813],['Malcesine',10.809,45.764],['Gargnano',10.662,45.686],['Toscolano',10.609,45.638],['Gardone',10.571,45.622],['Salò',10.528,45.606],['Manerba',10.553,45.55],['Desenzano',10.536,45.47],['Sirmione',10.608,45.493],['Peschiera',10.695,45.442],['Lazise',10.735,45.505],['Bardolino',10.722,45.548],['Garda',10.709,45.576],['Torri',10.687,45.612]];
let rendered=0;
function draw(){
if(view!=='2d'||panel.classList.contains('hidden'))return;
$('mapTitle').textContent='Il Lago di Garda';
const w=Math.max(300,shell.clientWidth),h=Math.min(820,Math.max(560,w*1.15)),dpr=Math.min(2,window.devicePixelRatio||1);canvas.style.height=h+'px';canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);context.setTransform(dpr,0,0,dpr,0,0);displayBounds=fitBounds(bounds,w,h);
context.fillStyle='#ebe7d2';context.fillRect(0,0,w,h);
// Fine coast-safe cell raster. All depths come from the same grid used to build the 3D mesh.
context.save();path(data.outer,w,h);context.fillStyle=color(0);context.fill();context.clip();const dx=(data.bounds[2]-data.bounds[0])/(data.nx-1),dy=(data.bounds[3]-data.bounds[1])/(data.ny-1);
const rasterTop=lonLatToXY(data.bounds[0],data.bounds[3],w,h),rasterBottom=lonLatToXY(data.bounds[2],data.bounds[1],w,h);context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';context.drawImage(raster,rasterTop.x,rasterTop.y,rasterBottom.x-rasterTop.x,rasterBottom.y-rasterTop.y);
// Contour segments are precomputed once and shared with the GLB, keeping pan/zoom light.
context.lineWidth=.65;context.strokeStyle='#174d5899';context.beginPath();
for(const [level,lon1,lat1,lon2,lat2] of data.contours){const a=lonLatToXY(lon1,lat1,w,h),b=lonLatToXY(lon2,lat2,w,h);context.moveTo(a.x,a.y);context.lineTo(b.x,b.y);}context.stroke();
context.restore();context.strokeStyle='#204f4a';context.lineWidth=1.5;path(data.outer,w,h);context.stroke();for(const hole of data.holes){path(hole,w,h);context.fillStyle='#ebe7d2';context.fill();context.stroke();}
context.font='600 11px system-ui';context.textBaseline='middle';const used=[];for(const [name,lon,lat] of towns){const p=lonLatToXY(lon,lat,w,h);if(p.x<5||p.x>w-5||p.y<10||p.y>h-10)continue;if(used.some(a=>Math.hypot(a.x-p.x,a.y-p.y)<27))continue;used.push(p);context.fillStyle='#244e45';context.beginPath();context.arc(p.x,p.y,2.6,0,Math.PI*2);context.fill();const tw=context.measureText(name).width,tx=lon<10.67?p.x-tw-7:p.x+7;context.lineWidth=4;context.strokeStyle='#faf9ee';context.strokeText(name,Math.max(4,Math.min(w-tw-4,tx)),p.y);context.fillText(name,Math.max(4,Math.min(w-tw-4,tx)),p.y);}
if(selection){const p=lonLatToXY(selection.lon,selection.lat,w,h);context.fillStyle='#f7e1a7';context.strokeStyle='#183e38';context.lineWidth=2;context.beginPath();context.arc(p.x,p.y,6,0,Math.PI*2);context.fill();context.stroke();}
// north indicator and scale in real geographic metres
context.fillStyle='#2e5549';context.font='800 12px system-ui';context.fillText('N ↑',w-42,24);const km=(displayBounds.lonMax-displayBounds.lonMin)*data.scale[0],scaleKm=km>20?5:km>7?2:1,px=scaleKm/km*w;context.fillRect(18,h-23,px,2);context.font='10px system-ui';context.fillText(scaleKm+' km',18,h-35);rendered++;
}
const viewer=$('gardaLakeModel');viewer.src='./assets/lake-garda-v6.glb?v=6.1';
function frame(){const b=regions[region],lon=(b.lonMin+b.lonMax)/2,lat=(b.latMin+b.latMax)/2,span=Math.max((b.lonMax-b.lonMin)*data.scale[0],(b.latMax-b.latMin)*data.scale[1]);viewer.cameraTarget=(lon-data.origin[0])*data.scale[0]+'m -1m '+(-(lat-data.origin[1])*data.scale[1])+'m';viewer.cameraOrbit='0deg '+(topView?0:38)+'deg '+(span*1.7+8)+'m';}
function loadViewer(){if(loadStarted)return;loadStarted=true;const script=document.createElement('script');script.type='module';script.src='./vendor/model-viewer.min.js';script.onerror=()=>{$('lake3dLoading').textContent='3D non disponibile';};document.head.appendChild(script);frame();}
function setView(v){view=v;canvas.hidden=v!=='2d';pane.hidden=v!=='3d';$('lake2d').setAttribute('aria-selected',String(v==='2d'));$('lake3d').setAttribute('aria-selected',String(v==='3d'));if(v==='3d')loadViewer();else draw();}
function selectPoint(lon,lat){const depth=gridDepth(lon,lat);if(depth==null)return;selection={lon,lat,depth};BATHY_STATE.click={lon,lat};BATHY_POINT_STATE.assessment=null;const points=Object.entries(MAP_SPOT_COORDS).filter(([key])=>LOCATIONS[key]);const nearest=points.sort((a,b)=>Math.hypot((a[1].lon-lon)*data.scale[0],(a[1].lat-lat)*data.scale[1])-Math.hypot((b[1].lon-lon)*data.scale[0],(b[1].lat-lat)*data.scale[1]))[0];readout.hidden=false;readout.innerHTML=`<div><strong>${safeText(nearest?nearest[1].name:'Punto selezionato')}</strong><span>Fondale ${Math.round(depth)} m</span></div><button type="button" id="useLakePoint">Usa questa zona</button>`;$('useLakePoint').onclick=()=>{if(nearest&&LOCATIONS[nearest[0]]){$('location').value=nearest[0];$('location').dispatchEvent(new Event('change',{bubbles:true}));}$('autoHabitat').checked=true;maybeAutoHabitat();$('mode').value='ranking';runSimulation();};draw();}
function zoom(factor){const dx=(bounds.lonMax-bounds.lonMin)*factor,dy=(bounds.latMax-bounds.latMin)*factor;if(dy>.7||dy<.006)return;const lon=(bounds.lonMax+bounds.lonMin)/2,lat=(bounds.latMax+bounds.latMin)/2;bounds={lonMin:lon-dx/2,lonMax:lon+dx/2,latMin:lat-dy/2,latMax:lat+dy/2};draw();}
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY>0?1.15:.87);},{passive:false});
canvas.style.touchAction='none';let pan=null,panFrame=null;
canvas.addEventListener('pointerdown',e=>{pan={id:e.pointerId,x:e.clientX,y:e.clientY,b:{...bounds},display:{...displayBounds}};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!pan||pan.id!==e.pointerId)return;const rect=canvas.getBoundingClientRect(),dx=(e.clientX-pan.x)/rect.width*(pan.display.lonMax-pan.display.lonMin),dy=(e.clientY-pan.y)/rect.height*(pan.display.latMax-pan.display.latMin);bounds={lonMin:pan.b.lonMin-dx,lonMax:pan.b.lonMax-dx,latMin:pan.b.latMin+dy,latMax:pan.b.latMax+dy};if(!panFrame)panFrame=requestAnimationFrame(()=>{panFrame=null;draw();});});
canvas.addEventListener('pointerup',e=>{if(!pan||pan.id!==e.pointerId)return;const moved=Math.hypot(e.clientX-pan.x,e.clientY-pan.y);pan=null;if(moved<5){const rect=canvas.getBoundingClientRect(),p=xyToLonLat(e.clientX-rect.left,e.clientY-rect.top,rect.width,rect.height);selectPoint(p.lon,p.lat);}});
canvas.addEventListener('pointercancel',()=>{pan=null;});
$('lakeZoomIn').onclick=()=>{if(view==='3d'){const o=viewer.getCameraOrbit();viewer.cameraOrbit=(o.theta*180/Math.PI)+'deg '+(o.phi*180/Math.PI)+'deg '+Math.max(3,o.radius*.8)+'m';}else zoom(.8);};
$('lakeZoomOut').onclick=()=>{if(view==='3d'){const o=viewer.getCameraOrbit();viewer.cameraOrbit=(o.theta*180/Math.PI)+'deg '+(o.phi*180/Math.PI)+'deg '+Math.min(130,o.radius*1.25)+'m';}else zoom(1.25);};
viewer.addEventListener('load',()=>{loaded=true;$('lake3dLoading').hidden=true;});let down=null;viewer.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});viewer.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6){down=null;return;}down=null;if(!loaded)return;const hit=viewer.positionAndNormalFromPoint(e.clientX,e.clientY);if(hit)selectPoint(data.origin[0]+hit.position.x/data.scale[0],data.origin[1]-hit.position.z/data.scale[1]);});
$('lake2d').onclick=()=>setView('2d');$('lake3d').onclick=()=>setView('3d');$('lakeArea').onchange=()=>{region=$('lakeArea').value;bounds={...regions[region]};frame();draw();};$('lakeReset').onclick=()=>{bounds={...regions[region]};topView=false;frame();draw();};$('lakeFromTop').onclick=()=>{topView=!topView;frame();};
renderBathymetryMap=()=>{$('mapTitle').textContent='Il Lago di Garda';if(view==='2d')draw();};window.addEventListener('resize',()=>{if(view==='2d')draw();});
new MutationObserver(()=>{if(!panel.classList.contains('hidden')){if(view==='2d')requestAnimationFrame(draw);else loadViewer();}}).observe(panel,{attributes:true,attributeFilter:['class']});
// Legacy hidden point cards do not drive this map's geographic selection.
updateMapPointSummary=function(){};
updateClickInfo=function(){};
window.GardaMap={data,gridDepth,pointInLake,setView,get rendered(){return rendered;},selectPoint};
})();
