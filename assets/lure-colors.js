/* Color choices combine lure construction, visibility and local forage; see docs/color-evidence.md. */
(function(){
'use strict';
const palettes={
 silver:{label:'Argento',swatch:'#b5cbd8',why:'Flash chiaro e profilo del pesce foraggio.'},
 gold:{label:'Oro opaco',swatch:'#c39743',why:'Riflesso caldo con acqua velata o cielo coperto.'},
 copper:{label:'Rame / arancio',swatch:'#bd6636',why:'Contrasto caldo nella risacca e nell’acqua sporca.'},
 perch:{label:'Persico naturale',swatch:'#829343',why:'Imitazione del persico per il luccio del Garda.'},
 baitfish:{label:'Agone / alborella',swatch:'#afc8cd',why:'Fianchi argento e dorso scuro del foraggio pelagico.'},
 pumpkin:{label:'Green pumpkin',swatch:'#697543',why:'Tono oliva discreto tra sassi e vegetazione.'},
 craw:{label:'Gambero · marrone',swatch:'#8c6040',why:'Profilo del gambero sul fondo e tra i sassi.'},
 blackblue:{label:'Nero / blu',swatch:'#26344e',why:'Silhouette piena con poca luce o visibilità ridotta.'},
 chartreuse:{label:'Bianco / chartreuse',swatch:'#cce542',why:'Corpo chiaro e accento visibile nell’acqua torbida.'},
 firetiger:{label:'Firetiger',swatch:'#c0dc32',why:'Barre scure e fianchi accesi per acqua torbida.'},
 pearl:{label:'Bianco perla',swatch:'#e3e9e5',why:'Corpo leggibile con luce diffusa e acqua velata.'},
 dark:{label:'Nero · silhouette',swatch:'#24332f',why:'Profilo scuro visto dal basso in superficie o di notte.'}
};
const metals=new Set(['spinner','spoon','spintail','blade bait','vertical jig']);
function pick(l,inp,env){
 const night=env.daylight===0||env.light<.10,murky=inp.clarity<4,stained=inp.clarity<7;
 const forage=inp.forage||'auto';let key,alternative;
 if(metals.has(l.cat)){
  key=murky?'copper':stained||inp.cloud>=70?'gold':'silver';alternative=key==='silver'?'gold':'silver';
 }else if(['topwater','buzzbait'].includes(l.cat)){
  key=night||murky?'dark':stained?'pearl':'baitfish';alternative=key==='dark'?'pearl':'dark';
 }else if(['soft creature','soft finesse'].includes(l.cat)){
  key=night||murky?'blackblue':l.cat==='soft creature'?'craw':'pumpkin';alternative=key==='blackblue'?'pumpkin':'blackblue';
 }else if(['spinnerbait','chatterbait'].includes(l.cat)){
  key=night?'blackblue':murky?'chartreuse':stained?'pearl':'baitfish';alternative=murky?'blackblue':'chartreuse';
 }else{
  const swimbait=['soft swimbait','glide swimbait','jointed minnow','soft shad'].includes(l.cat);
  key=night?'blackblue':murky?(inp.target==='pike'&&swimbait?'firetiger':'chartreuse'):stained?'pearl':(forage==='perch'&&swimbait)||(forage==='auto'&&inp.target==='pike'&&swimbait)?'perch':'baitfish';
  alternative=key==='perch'?'baitfish':key==='baitfish'?'perch':key==='firetiger'?'pearl':'blackblue';
 }
 return {...palettes[key],key,alternative:{...palettes[alternative],key:alternative}};
}
function asset(l,c){
 const base=l.art||'minnow';
 if(['perch','firetiger'].includes(c.key)){if(['soft-shad','glide'].includes(base))return base+'-perch';if(base==='jointed')return 'glide-perch';}
 return base;
}
window.GardaColors={palettes,pick,asset};
})();
