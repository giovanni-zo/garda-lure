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
 goldfish:{label:'Oro / dorso scuro',top:'#bd9b48',belly:'#f6e5bd',accent:'#dd7831',why:'Dorso scuro e fianchi oro, per rendere leggibile un pesciolino in acqua velata.'},
 pumpkin:{label:'Green pumpkin / ambra',top:'#697541',belly:'#c9b78a',accent:'#bb813b',why:'Oliva, ventre chiaro e dettagli ambrati tra sassi e vegetazione.'},
 craw:{label:'Marrone / chele arancio',top:'#856044',belly:'#d1b788',accent:'#d77d36',why:'Corpo marrone e chele arancio per una presentazione da gambero sul fondo.'},
 blackblue:{label:'Nero / blu',top:'#202b44',belly:'#3f5682',accent:'#7b9abd',why:'Profilo scuro con accenti blu quando luce o visibilità sono scarse.'},
 chartreuse:{label:'Bianco / chartreuse',top:'#bfe532',belly:'#ffffff',accent:'#c8d4d8',why:'Bianco ben distinto dal giallo-verde; palette e ami restano metallici.'},
 firetiger:{label:'Firetiger · barre e arancio',top:'#b9df31',belly:'#f7eda3',accent:'#ed812b',why:'Fianchi accesi, barre scure e dettagli arancio per una sagoma ampia nel torbido.'},
 pearl:{label:'Bianco perla',top:'#d4e1df',belly:'#ffffff',accent:'#d88a40',why:'Ventre e fianchi chiari per acqua velata, quota profonda o luce diffusa.'},
 dark:{label:'Nero · silhouette',top:'#172b33',belly:'#354952',accent:'#617787',why:'Sagoma piena e scura, soprattutto per esche viste dal basso in poca luce.'}
};

Object.assign(palettes,{"bronze":{"label":"Bronzo","top":"#8e6b42","belly":"#d2aa77","accent":"#45545b","finish":"metal","family":"warmmetal","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"gunmetal":{"label":"Nichel nero","top":"#3c4753","belly":"#939ea8","accent":"#b4c7cf","finish":"metal","family":"coolmetal","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"silverblue":{"label":"Argento / blu","top":"#3b82bf","belly":"#e8f0f5","accent":"#b9d3e8","finish":"metal","family":"coolmetal","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"silverchart":{"label":"Argento / chartreuse","top":"#a8c736","belly":"#eaf1e6","accent":"#f0e255","finish":"metal","family":"warmmetal","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"redhead":{"label":"Testa rossa / corpo perla","top":"#d7e2e1","belly":"#ffffff","accent":"#d7403e","head":"#ce373b","family":"bright","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"clown":{"label":"Clown · testa rossa / limone","top":"#e6d443","belly":"#fff4b2","accent":"#d7403e","head":"#d63b40","family":"bright","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"pinkpearl":{"label":"Rosa / perla","top":"#e483ba","belly":"#fff1f7","accent":"#a72e7c","family":"bright","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"orangepearl":{"label":"Arancio / perla","top":"#ec8c34","belly":"#fff3de","accent":"#bd4d24","family":"bright","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"purplepearl":{"label":"Viola / perla","top":"#7956a5","belly":"#f4eafa","accent":"#b995d4","family":"natural","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"whiteblack":{"label":"Dorso nero / ventre bianco","top":"#273c45","belly":"#f7f9f7","accent":"#d98739","family":"natural","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"roach":{"label":"Grigio / argento naturale","top":"#63747b","belly":"#e8eeeb","accent":"#ba6b44","family":"natural","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"trout":{"label":"Trota · oliva / striscia rosa","top":"#74815a","belly":"#eee9ce","accent":"#cf7193","pattern":"trout","family":"natural","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"watermelon":{"label":"Watermelon · verde puntinato","top":"#5d833d","belly":"#b6c990","accent":"#253820","pattern":"spots","family":"natural","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"watermelonred":{"label":"Watermelon / glitter rosso","top":"#52743c","belly":"#b4bc83","accent":"#c84346","pattern":"redflake","family":"natural","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"motoroil":{"label":"Motor oil · oliva / ambra","top":"#64662d","belly":"#c9a74d","accent":"#966123","family":"natural","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"junebug":{"label":"Junebug · viola / glitter verde","top":"#3e245d","belly":"#675084","accent":"#67ad73","finish":"dark","pattern":"glitter","family":"dark","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"bubblegum":{"label":"Bubblegum · rosa acceso","top":"#ec68a8","belly":"#f7b8d8","accent":"#bb286d","finish":"solid","family":"bright","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"smoke":{"label":"Smoke · grigio fumo","top":"#64747c","belly":"#ccd3d5","accent":"#374c58","family":"natural","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"cola":{"label":"Cola · marrone / prugna","top":"#4c3239","belly":"#956656","accent":"#c39373","finish":"dark","family":"dark","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"bluechart":{"label":"Blu elettrico / coda chartreuse","top":"#285eb0","belly":"#adc9ef","accent":"#c7e530","tail":"#c7e530","family":"bright","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"orangecraw":{"label":"Gambero arancio","top":"#9c4b2c","belly":"#eab671","accent":"#ed823b","finish":"solid","family":"bright","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"darkcraw":{"label":"Gambero scuro","top":"#42392d","belly":"#9a7953","accent":"#b66b3b","finish":"dark","family":"dark","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"violet":{"label":"Viola / glitter argento","top":"#624485","belly":"#aa87be","accent":"#d2dce3","finish":"solid","pattern":"glitter","family":"dark","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"redblack":{"label":"Nero / rosso","top":"#292630","belly":"#a44950","accent":"#ce4046","finish":"dark","family":"dark","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"oliveorange":{"label":"Oliva / ventre arancio","top":"#6d763d","belly":"#e7a45b","accent":"#bf6a36","family":"natural","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."},"lemon":{"label":"Giallo limone / ventre crema","top":"#d5d945","belly":"#fff6bb","accent":"#d19f35","family":"bright","why":"Variante di colore da confrontare con luce, acqua e foraggio osservato."}});
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
  reason=key==='perch'?(forage==='perch'?'Hai segnalato piccoli persici: partirei da questa livrea.':'Sul bordo dell’erba, nel limpido, il persico è una partenza naturale da confrontare col foraggio visibile.'):key==='baitfish'?'In acqua aperta o su sassi partirei da blu/argento e ventre bianco, coerente con agone e alborella.':key==='pearl'?'Con luce diffusa o più profondità partirei da fianchi perla, mantenendo un dorso a contrasto.':key==='goldfish'?'Per questo minnow in acqua velata sceglierei fianchi oro e dorso scuro.':key==='firetiger'?'Su una sagoma ampia nel torbido proverei barre scure, giallo-verde e arancio.':key==='ayu'?'Acqua molto limpida e calma: partirei da oliva/perla discreto.':night?'Con poca luce proverei una sagoma scura o un contrasto netto.':'Nel torbido partirei da bianco e chartreuse in zone distinte del corpo.';
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

const dimensions={"spoon":[1774,887],"soft-swimbait-perch-v8":[1944,809],"soft-shad":[1942,809],"worm":[2017,780],"lipless":[1536,1024],"soft-jerk-bare-v8":[2172,724],"spintail":[1536,1024],"spybait-low-poly-v9":[2172,724],"crankbait-deep-v8":[1536,1024],"topwater":[1536,1024],"creature":[1774,887],"buzzbait":[1536,1024],"crankbait-shallow-v8":[1536,1024],"soft-shad-perch":[1944,809],"minnow-natural-v8":[2172,724],"soft-swimbait-v8":[1944,809],"crankbait":[1536,1024],"soft-shad-bare-v8":[1945,809],"jerkbait-deep-v8":[2172,724],"chatterbait":[1774,887],"soft-jerk":[2172,724],"minnow":[1774,887],"creature-bare-v8":[1774,887],"spinner":[1536,1024],"chatterbait-white-chartreuse-v8":[1774,887],"soft-shad-perch-bare-v8":[1945,808],"glide":[1774,887],"spinnerbait":[1536,1024],"glide-perch":[1774,887],"worm-bare-v8":[2017,780],"spinnerbait-white-chartreuse-v8":[1536,1024],"metal-jig":[1774,887],"blade":[1536,1024],"jointed":[1536,1024],"jerkbait":[2172,724]};
const fishColors=['baitfish','ayu','perch','goldfish','pearl','whiteblack','roach','trout','pinkpearl','purplepearl','orangepearl','chartreuse','firetiger','redhead','clown','lemon','blackblue','redblack'];
function choices(l){
 if(metals.has(l.cat))return ['silver','gold','copper','bronze','gunmetal','silverblue','silverchart'];
 if(['spinnerbait','chatterbait','buzzbait'].includes(l.cat))return ['baitfish','ayu','pearl','chartreuse','firetiger','pinkpearl','orangepearl','purplepearl','whiteblack','lemon','blackblue','redblack','dark'];
 if(l.cat==='soft finesse')return ['pumpkin','watermelon','watermelonred','motoroil','oliveorange','craw','smoke','pearl','pinkpearl','bubblegum','purplepearl','violet','junebug','cola','blackblue','redblack','bluechart'];
 if(l.cat==='soft creature')return ['craw','orangecraw','darkcraw','pumpkin','watermelon','watermelonred','motoroil','oliveorange','junebug','cola','blackblue','violet','redblack'];
 if(l.cat.includes('soft'))return [...fishColors.filter(k=>l.cat!=='soft jerk'||!['perch','firetiger'].includes(k)),'watermelon','watermelonred','motoroil','smoke','bubblegum','violet','junebug','cola','bluechart'];
 if(l.cat==='topwater')return ['pearl','whiteblack','baitfish','ayu','chartreuse','lemon','pinkpearl','orangepearl','blackblue','redblack','dark'];
 return fishColors.filter(k=>(!['perch','firetiger'].includes(k)||l.cat==='glide swimbait')&&(!['redhead','clown'].includes(k)||/minnow|jerkbait|glide|spybait/.test(l.cat)));
}
function get(key){const p=palettes[key];return p?{...p,key,swatch:p.top}:null;}
function chooseAvailable(l,inp,env,keys){
 const wanted=pick(l,inp,env),valid=keys.filter(k=>choices(l).includes(k));if(!valid.length)return wanted;
 if(valid.includes(wanted.key))return wanted;
 if(valid.includes(wanted.alternative.key))return {...wanted.alternative,why:'Tra i colori che hai, partirei da questa alternativa.',alternative:wanted};
 const family=k=>palettes[k].family||(metals.has(l.cat)?(k==='silver'?'coolmetal':'warmmetal'):['dark','blackblue'].includes(k)?'dark':['chartreuse','firetiger'].includes(k)?'bright':'natural');
 const rgb=k=>palettes[k].top.slice(1).match(/../g).map(v=>parseInt(v,16)/255),target=rgb(wanted.key);
 const distance=k=>rgb(k).reduce((n,v,i)=>n+(v-target[i])**2,0)+(family(k)===family(wanted.key)?0:1.8);
 const key=valid.slice().sort((a,b)=>distance(a)-distance(b))[0];
 return {...get(key),why:'Tra i colori nella tua scatola, questo è il più vicino alla proposta per lo scenario.',alternative:wanted};
}
function patternMarkup(p,l){
 if(!p.head&&!p.tail&&!p.pattern)return '';
 const name=l?.art||'minnow-natural-v8';
 const soft=name.includes('bare')||name.includes('soft-swimbait');
 const deep=name==='jerkbait-deep-v8';
 const shad=name.includes('soft-shad'),worm=name.includes('worm'),jerk=name.includes('soft-jerk');
 const center=soft?(shad?.56:worm?.50:jerk?.45:.50):name==='jointed'?.43:name.includes('glide')?.43:.40;
 const nose=soft?.98:deep?.75:name==='jointed'?.92:name.includes('glide')?.94:.95;
 const top=soft?(shad?.28:worm?.32:.17):.12,bottom=soft?(shad?.85:worm?.69:.78):.59;
 let geometry='';
 if(p.head)geometry=`<path d="M${(nose-.16)*1000} ${top*1000} L${nose*1000} ${(center-.07)*1000} L${nose*1000} ${(center+.04)*1000} L${(nose-.16)*1000} ${bottom*1000}Z" fill="white"/>`;
 if(p.tail)geometry=`<rect x="0" y="${top*1000}" width="230" height="${(bottom-top)*1000}" fill="white"/>`;
 if(p.pattern){
  if(p.pattern==='trout')geometry+=`<path d="M80 ${center*1000} H${(nose-.1)*1000}" stroke="white" stroke-width="45"/>`;
  else for(let row=0;row<6;row++)for(let col=0;col<18;col++){const x=60+col*47+(row%2)*19,y=top*1000+row*(bottom-top)*160;geometry+=`<circle cx="${x}" cy="${y}" r="${p.pattern==='glitter'?2.5:4}" fill="white"/>`;}
 }
 const mask='data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">${geometry}</svg>`);
 const tone=p.head||p.tail||p.accent,values=tone.slice(1).match(/../g).map(v=>parseInt(v,16)/255);
 const matrix=values.flatMap(v=>[v*.24,v*.52,v*.10,0,v*.22]).concat([0,0,0,1,0]).join(' ');
 return `<feImage href="${mask}" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="zone"/><feComposite in="zone" in2="SourceAlpha" operator="in" result="detailmask"/><feColorMatrix in="SourceGraphic" values="${matrix}" result="detailpaint"/><feComposite in="detailpaint" in2="detailmask" operator="in" result="detail"/><feMerge><feMergeNode in="baseColor"/><feMergeNode in="detail"/></feMerge>`;
}

function image(l,c){return './assets/illustrations/'+asset(l,c)+'.png'+'?v=9.1';}
function filterId(key,l){return 'garda-color-'+key+(palettes[key]?.head||palettes[key]?.tail||palettes[key]?.pattern?'--'+(l?.art||'minnow-natural-v8'):key==='blackblue'&&l?.cat.includes('soft')?'-body':'');}
// One color treatment for cards, mounted covers and underwater guides.
function treatment(l,c){if(isNative(l,c,asset(l,c)))return 'none';ensureFilter(c.key,l);return 'url(#'+filterId(c.key,l)+')';}
function imageMarkup(l,c,attrs=''){
 const [w,h]=dimensions[asset(l,c)]||[1774,887];
 return `<svg ${attrs} viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" overflow="visible"><image href="${image(l,c)}" width="${w}" height="${h}" style="filter:${treatment(l,c)}" data-palette="${c.key}"/></svg>`;
}
function portrait(l,c){return `<svg class="lure-portrait" viewBox="0 0 300 190" role="img" aria-label="${l.family.replaceAll('&','&amp;')} · ${c.label}">${imageMarkup(l,c,'width="300" height="190"')}</svg>`;}

function filterMarkup(key,soft=false,l=null){
 if(key==='silver')return `<filter id="${filterId(key)}" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope="1.05"/><feFuncG type="linear" slope="1.06"/><feFuncB type="linear" slope="1.08"/></feComponentTransfer></filter>`;
 const p=palettes[key],rgb=hex=>hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255);
 const top=rgb(p.top),belly=rgb(p.belly),mix=(a,b,t)=>a.map((x,i)=>x*(1-t)+b[i]*t),shade=(a,t)=>a.map(x=>x*t);
 const dark=key==='dark'||key==='blackblue'||p.finish==='dark',metal=['silver','gold','copper'].includes(key)||p.finish==='metal';
 // Chroma in either direction catches muted olive/brown as well as blue/green.
 // Neutral steel, white skirt strands and dark hooks are left untouched.
 const pairs=[[6,0,-6],[-6,0,6],[0,6,-6],[0,-6,6],[6,-6,0],[-6,6,0]];
 let mask=pairs.map((v,i)=>`<feColorMatrix in="SourceGraphic" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 ${v.join(' ')} 0 0" result="chroma${i}"/>`).join('');
 for(let i=1;i<6;i++)mask+=`<feComposite in="${i===1?'chroma0':'union'+(i-1)}" in2="chroma${i}" operator="arithmetic" k2="1" k3="1" result="union${i}"/>`;
 mask+='<feComponentTransfer in="union5" result="colorMask"><feFuncA type="linear" slope="4" intercept="-3"/></feComponentTransfer>';
 if(dark||p.finish==='solid')mask='<feComposite in="SourceAlpha" in2="SourceAlpha" operator="in" result="colorMask"/>';
 if(metal)mask='<feColorMatrix in="SourceGraphic" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 .2126 .7152 .0722 0 0" result="brightness"/><feComponentTransfer in="brightness" result="colorMask"><feFuncA type="table" tableValues="0 0 .15 .9 1"/></feComponentTransfer>';
 if(!dark&&!metal)mask+='<feColorMatrix in="SourceGraphic" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 5 -5 0 0 -.35" result="warmAccent"/><feComposite in="colorMask" in2="warmAccent" operator="out" result="colorMask"/>';
 let stops;
 if(dark)stops=[shade(top,.35),shade(top,.8),top,mix(top,belly,.65),belly];
 else if(metal)stops=[[.04,.055,.065],shade(top,.4),shade(top,.8),mix(top,belly,.45),belly];
 else if(key==='goldfish')stops=[shade(top,.12),shade(top,.16),shade(top,.2),shade(top,.35),top,shade(belly,.8),shade(belly,.9),shade(belly,.96),belly];
 else stops=[shade(top,.12),shade(top,.4),shade(top,.7),top,mix(top,belly,.65),shade(belly,.8),shade(belly,.9),shade(belly,.96),belly];
 const channels=['R','G','B'].map((channel,i)=>`<feFunc${channel} type="table" tableValues="${stops.map(x=>x[i].toFixed(4)).join(' ')}"/>`).join('');
 const overlay=patternMarkup(p,l);
 return `<filter id="${filterId(key,l|| (soft?{cat:'soft'}:null))}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">${mask}<feComposite in="colorMask" in2="SourceAlpha" operator="in" result="mask"/><feColorMatrix in="SourceGraphic" type="saturate" values="0"/><feComponentTransfer result="paint">${channels}</feComponentTransfer><feComposite in="paint" in2="mask" operator="in" result="repainted"/><feComposite in="SourceGraphic" in2="mask" operator="out" result="unchanged"/><feMerge result="baseColor"><feMergeNode in="unchanged"/><feMergeNode in="repainted"/></feMerge>${overlay}</filter>`;
}
function ensureFilter(key,l){
 if(typeof document==='undefined'||!document.createElementNS||document.getElementById(filterId(key,l)))return;
 installFilters();const defs=document.getElementById('gardaColorFilters')?.querySelector('defs');
 if(defs&&!document.getElementById(filterId(key,l)))defs.insertAdjacentHTML('beforeend',filterMarkup(key,false,l));
}
function installFilters(){
 if(!document.createElementNS||document.getElementById('gardaColorFilters'))return;
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.id='gardaColorFilters';svg.setAttribute('aria-hidden','true');svg.setAttribute('width','0');svg.setAttribute('height','0');svg.style.position='absolute';svg.style.pointerEvents='none';
 svg.innerHTML='<defs>'+Object.keys(palettes).map(key=>filterMarkup(key)).join('')+filterMarkup('blackblue',true)+'</defs>';document.body.appendChild(svg);
}
window.GardaColors={palettes,pick,choices,get,chooseAvailable,asset,image,portrait,isNative,filterId,treatment,imageMarkup,filterMarkup,installFilters};
})();
