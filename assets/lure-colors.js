/* Scenario-specific palettes. Repaint only colored areas; preserve white, steel and dark hooks. */
(function(){
'use strict';
const palettes={
 silver:{label:'Argento',top:'#becbd1',belly:'#f7f9fa',accent:'#c97040',why:'Riflessi argento con acqua limpida e luce sufficiente.'},
 gold:{label:'Oro opaco',top:'#be9346',belly:'#ead59c',accent:'#52646a',why:'Riflessi caldi con cielo coperto o acqua velata.'},
 copper:{label:'Rame / arancio',top:'#b66d43',belly:'#f3c08e',accent:'#3b464f',why:'Riflesso caldo e contrasto nella risacca o nell’acqua sporca.'},
 perch:{label:'Persico naturale',top:'#6f873c',belly:'#f5e8bf',accent:'#de8139',why:'Barre scure, ventre chiaro e pinne arancio per imitare piccoli persici.'},
 baitfish:{label:'Blu / argento · ventre bianco',top:'#285d9a',belly:'#f2f5f2',accent:'#dd883b',why:'Dorso blu, fianchi argento e pancia bianca: profilo del foraggio pelagico del Garda.'},
 ayu:{label:'Oliva / perla',top:'#84956a',belly:'#f4efdc',accent:'#c8a35d',why:'Dorso oliva discreto e ventre perla con acqua molto limpida e poco vento.'},
 goldfish:{label:'Oro / nero · gola arancio',top:'#bd9b48',belly:'#f6e5bd',accent:'#dd7831',why:'Dorso scuro e fianchi caldi, per rendere leggibile un pesciolino in acqua velata.'},
 pumpkin:{label:'Green pumpkin / ambra',top:'#697541',belly:'#c9b78a',accent:'#bb813b',why:'Oliva, ventre chiaro e dettagli ambrati tra sassi e vegetazione.'},
 craw:{label:'Marrone / chele arancio',top:'#856044',belly:'#d1b788',accent:'#d77d36',why:'Corpo marrone e chele arancio per una presentazione da gambero sul fondo.'},
 blackblue:{label:'Nero / blu',top:'#202b44',belly:'#3f5682',accent:'#7b9abd',why:'Profilo scuro con accenti blu quando luce o visibilità sono scarse.'},
 chartreuse:{label:'Bianco / chartreuse',top:'#bfe532',belly:'#ffffff',accent:'#c8d4d8',why:'Bianco ben distinto dal giallo-verde; palette e ami restano metallici.'},
 firetiger:{label:'Firetiger · barre e arancio',top:'#b9df31',belly:'#f7eda3',accent:'#ed812b',why:'Fianchi accesi, barre scure e dettagli arancio per una sagoma ampia nel torbido.'},
 pearl:{label:'Bianco perla',top:'#d4e1df',belly:'#ffffff',accent:'#d88a40',why:'Ventre e fianchi chiari per acqua velata, quota profonda o luce diffusa.'},
 dark:{label:'Nero · silhouette',top:'#172b33',belly:'#354952',accent:'#617787',why:'Sagoma piena e scura, soprattutto per esche viste dal basso in poca luce.'}
};
const metals=new Set(['spinner','spoon','spintail','blade bait','vertical jig']);
function pick(l,inp,env){
 const twilight=Math.min(Math.abs(inp.hour-env.sunrise),Math.abs(inp.hour-env.sunset))<1;
 const night=env.daylight===0&&!twilight,dim=env.light<.22,murky=inp.clarity<4,stained=inp.clarity<7;
 const forage=inp.forage||'auto',windy=inp.windSpeed>=6,deep=inp.depth>=7;
 const swimbait=['soft swimbait','glide swimbait','soft shad'].includes(l.cat);
 let key,alternative,reason;
 if(metals.has(l.cat)){
  key=murky?'copper':stained||inp.cloud>=70?'gold':'silver';alternative=key==='silver'?'gold':'silver';
  reason=key==='silver'?'Acqua limpida e riflesso chiaro: partirei da argento.':key==='gold'?'Con acqua velata o cielo coperto partirei da un riflesso oro.':'Nel torbido sceglierei rame/arancio, mantenendo il corpo metallico.';
 }else if(['topwater','buzzbait'].includes(l.cat)){
  key=night||dim?'dark':stained||murky?'chartreuse':'pearl';alternative=key==='dark'?'pearl':'dark';
  reason=night||dim?'Con poca luce conta la silhouette vista dal basso.':'In superficie partirei da un ventre chiaro; la bocca o il dorso restano a contrasto.';
 }else if(['soft creature','soft finesse'].includes(l.cat)){
  key=night||murky?'blackblue':l.cat==='soft creature'?'craw':'pumpkin';alternative=key==='blackblue'?(l.cat==='soft creature'?'craw':'pumpkin'):'blackblue';
  reason=night||murky?'Su una gomma da fondo, poca visibilità: sceglierei nero/blu.':l.cat==='soft creature'?'Tra sassi e fondo, partirei da marrone con chele arancio.':'Per finesse nel limpido sceglierei oliva/ambra con parti chiare, senza un corpo fluorescente.';
 }else if(['spinnerbait','chatterbait'].includes(l.cat)){
  key=night?'blackblue':murky||stained||windy?'chartreuse':inp.structure==='weed'&&inp.target==='bass'?'ayu':'baitfish';
  alternative=key==='chartreuse'?(murky?'blackblue':'baitfish'):'chartreuse';
  reason=key==='chartreuse'?'Con velatura o riva mossa partirei da skirt bianco/chartreuse, con metallo neutro.':key==='blackblue'?'Con poca luce sceglierei skirt nero/blu, conservando il riflesso delle palette.':'Nel limpido terrei uno skirt chiaro e naturale, con dorso a contrasto e palette argento.';
 }else{
  if(night&&stained)key=inp.target==='zander'?'pearl':'blackblue';
  else if(murky)key=inp.target==='pike'&&swimbait?'firetiger':'chartreuse';
  else if(stained)key=/minnow|jerkbait/.test(l.cat)?'goldfish':'pearl';
  else if(forage==='perch'&&swimbait)key='perch';
  else if(forage==='baitfish')key='baitfish';
  else if(forage==='auto'&&inp.target==='pike'&&swimbait&&inp.structure==='weed'&&inp.depth<5&&!windy)key='perch';
  else if(deep&&dim&&!twilight)key='pearl';
  else if(inp.clarity>=9&&!windy)key='ayu';
  else key='baitfish';
  alternative=key==='baitfish'?(inp.structure==='weed'&&swimbait?'perch':'ayu'):key==='perch'?'baitfish':key==='ayu'?'baitfish':key==='firetiger'?'pearl':key==='goldfish'?'pearl':key==='blackblue'?'pearl':key==='pearl'?(stained||murky?'chartreuse':'baitfish'):'pearl';
  reason=key==='perch'?(forage==='perch'?'Hai segnalato piccoli persici: partirei da questa livrea.':'Sul bordo dell’erba, nel limpido, il persico è una partenza naturale da confrontare col foraggio visibile.'):key==='baitfish'?'In acqua aperta o su sassi partirei da blu/argento e ventre bianco, coerente con agone e alborella.':key==='pearl'?'Con luce diffusa o più profondità partirei da fianchi perla, mantenendo un dorso a contrasto.':key==='goldfish'?'Per questo minnow in acqua velata sceglierei fianchi oro, dorso scuro e gola arancio.':key==='firetiger'?'Su una sagoma ampia nel torbido proverei barre scure, giallo-verde e arancio.':key==='ayu'?'Acqua molto limpida e calma: partirei da oliva/perla discreto.':night?'Con poca luce proverei una sagoma scura o un contrasto netto.':'Nel torbido partirei da bianco e chartreuse in zone distinte del corpo.';
 }
 const selected=palettes[key],alt=palettes[alternative];
 return {...selected,key,swatch:selected.top,why:reason,alternative:{...alt,key:alternative,swatch:alt.top}};
}
function asset(l,c){
 const base=l.art||'minnow-natural-v8';
 if(['perch','firetiger'].includes(c.key)){
  if(l.cat==='soft swimbait')return 'soft-swimbait-perch-v8';
  if(l.cat==='soft shad')return 'soft-shad-perch-bare-v8';
  if(l.cat==='glide swimbait')return 'glide-perch';
 }
 return base;
}
function isNative(l,c,filename){
 if(l.cat==='spybait'&&c.key==='baitfish')return true;
 if(c.key==='perch'&&/perch/.test(filename))return true;
 if(c.key==='chartreuse'&&/white-chartreuse/.test(filename))return true;
 return c.key==='baitfish'&&['minnow-natural-v8','jerkbait-deep-v8','crankbait-deep-v8','crankbait-shallow-v8','soft-shad-bare-v8','soft-swimbait-v8','soft-jerk-bare-v8'].includes(filename)||c.key==='craw'&&filename==='creature-bare-v8'||c.key==='pumpkin'&&filename==='worm-bare-v8';
}
function image(l,c){return './assets/illustrations/'+asset(l,c)+'.png'+'?v=9.1';}
function filterId(key,l){return 'garda-color-'+key+(key==='blackblue'&&l?.cat.includes('soft')?'-body':'');}
function installFilters(){
 if(!document.createElementNS||document.getElementById('gardaColorFilters'))return;
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.id='gardaColorFilters';svg.setAttribute('aria-hidden','true');svg.setAttribute('width','0');svg.setAttribute('height','0');svg.style.position='absolute';svg.style.pointerEvents='none';
 const rgb=hex=>hex.replace('#','').match(/../g).map(x=>parseInt(x,16)/255);
 svg.innerHTML='<defs>'+Object.entries(palettes).map(([key,p])=>{
  if(key==='silver')return `<filter id="${filterId(key)}" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope="1.05"/><feFuncG type="linear" slope="1.06"/><feFuncB type="linear" slope="1.08"/></feComponentTransfer></filter>`;
  const [r,g,b]=rgb(p.top),metal=['gold','copper'].includes(key),all=key==='dark';
  const paint=[r*.32,r*.58,r*.10,0,r*.38,g*.32,g*.58,g*.10,0,g*.38,b*.32,b*.58,b*.10,0,b*.38,0,0,0,1,0].join(' ');
  const mask=all?'<feComposite in="SourceAlpha" in2="SourceAlpha" operator="in" result="mask"/>':metal?'<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 .2126 .7152 .0722 0 0" result="rawmask"/><feComponentTransfer in="rawmask" result="mask"><feFuncA type="table" tableValues="0 0 .65 1"/></feComponentTransfer>':'<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 -2 4 -2 0 0" result="greens"/><feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 -2 -2 4 0 0" result="blues"/><feComposite in="greens" in2="blues" operator="arithmetic" k2="1" k3="1" result="rawmask"/><feComponentTransfer in="rawmask" result="mask"><feFuncA type="table" tableValues="0 0 .85 1"/></feComponentTransfer>';
  return `<filter id="${filterId(key)}" x="-3%" y="-3%" width="106%" height="106%" color-interpolation-filters="sRGB">${mask}<feComposite in="mask" in2="SourceAlpha" operator="in" result="limitedmask"/><feColorMatrix in="SourceGraphic" type="matrix" values="${paint}" result="paint"/><feComposite in="paint" in2="limitedmask" operator="in" result="repainted"/><feComposite in="SourceGraphic" in2="limitedmask" operator="out" result="unchanged"/><feMerge><feMergeNode in="unchanged"/><feMergeNode in="repainted"/></feMerge></filter>`;
 }).join('')+'<filter id="garda-color-blackblue-body" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope=".18" intercept=".06"/><feFuncG type="linear" slope=".27" intercept=".08"/><feFuncB type="linear" slope=".43" intercept=".14"/></feComponentTransfer></filter></defs>';document.body.appendChild(svg);
}
window.GardaColors={palettes,pick,asset,image,isNative,filterId,installFilters};
})();
