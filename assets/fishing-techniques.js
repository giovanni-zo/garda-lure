/* Context-dependent presentations and rig geometry. Sources: docs/presentations.md. */
(function(){
'use strict';
const rigs={
 jig:{name:'Jig head',short:'Testina piombata',description:'Testina solidale alla gomma; controlla quota e caduta.',cats:['soft shad','soft swimbait','soft jerk','soft finesse','soft creature'],min:0,max:30},
 dropshot:{name:'Drop shot',short:'Gomma sopra il piombo',description:'Amo sulla lenza, piombo terminale sotto: muovi l’esca restando sul punto.',cats:['soft shad','soft jerk','soft finesse','soft creature'],min:.5,max:22,maxLength:12},
 texas:{name:'Texas rig',short:'Piombo bullet + offset',description:'Piombo davanti all’amo offset, punta protetta tra erbe e ostacoli.',cats:['soft shad','soft swimbait','soft jerk','soft finesse','soft creature'],min:.2,max:15,maxLength:17},
 carolina:{name:'Carolina rig',short:'Piombo separato + finale',description:'Piombo sulla madrelenza, girella e finale: trascina, poi lascia lavorare la gomma.',cats:['soft jerk','soft finesse','soft creature','soft shad'],min:1,max:18,maxLength:14},
 ned:{name:'Ned rig',short:'Testina mushroom + gomma corta',description:'Gomma compatta su testina piatta; piccoli trascinamenti e soste sul fondo.',cats:['soft finesse','soft creature'],min:.5,max:9,maxLength:8},
 wacky:{name:'Wacky rig',short:'Worm innescato al centro',description:'Amo al centro del worm; senza piombo o con una piccola zavorra sopra l’amo.',cats:['soft finesse'],min:0,max:5,maxLength:16},
 weightless:{name:'Weightless',short:'Offset senza piombo',description:'Niente zavorra aggiunta: caduta libera e movimenti brevi in poca acqua.',cats:['soft jerk','soft finesse','soft shad'],min:0,max:1.5,maxLength:14}
};
const isSoft=l=>l.cat.includes('soft');
function compatible(l,key){const r=rigs[key];return !!r&&r.cats.includes(l.cat)&&(!r.maxLength||l.lengthCm<=r.maxLength)&&!(key==='dropshot'&&l.cat==='soft creature'&&l.lengthCm>8);}
function approach(inp){
 if(inp.fishActivity==='slow')return 'patient';
 if(inp.fishActivity==='active')return 'active';
 const month=Number(String(inp.date||'').slice(5,7));
 return inp.waterTemp<12||(['perch','zander'].includes(inp.target)&&[3,4,9,10,11].includes(month)&&inp.waterTemp<=20)?'patient':'balanced';
}
function choose(l,inp){
 if(!isSoft(l))return null;
 if(l.rigTechnique)return compatible(l,l.rigTechnique)?l.rigTechnique:null;
 if(!inp.rigStyle)return 'jig';
 if(inp.rigStyle&&inp.rigStyle!=='auto')return compatible(l,inp.rigStyle)?inp.rigStyle:null;
 if(inp.structure==='weed')return compatible(l,'texas')?'texas':'jig';
 const cold=inp.waterTemp<12;
 if(['perch','zander'].includes(inp.target)&&cold&&inp.depth>=2&&compatible(l,'dropshot'))return 'dropshot';
 if(inp.target==='bass'&&inp.depth<=2.5&&inp.windSpeed<4&&inp.structure==='harbor'&&compatible(l,'wacky'))return 'wacky';
 if(inp.target==='bass'&&inp.depth>=3&&['sand','drop'].includes(inp.structure)&&compatible(l,'carolina'))return 'carolina';
 if(inp.depth<=1.2&&inp.windSpeed<4&&compatible(l,'weightless')&&['bass','chub'].includes(inp.target))return 'weightless';
 if(cold&&['rock','sand'].includes(inp.structure)&&compatible(l,'ned')&&inp.depth<7)return 'ned';
 return 'jig';
}
function suitability(l,inp){
 const key=choose(l,inp);if(!key)return 0;
 const cold=inp.waterTemp<12,calm=inp.windSpeed<4,windy=inp.windSpeed>=6;
 const bass=inp.target==='bass',bottomFish=['perch','zander'].includes(inp.target),pursuit=['pike','asp','trout'].includes(inp.target);
 const clean=['rock','sand','drop'].includes(inp.structure),weeds=inp.structure==='weed';
 let fit;
 if(key==='jig')fit=.74+(pursuit?.10:0)+(windy?.07:0)+(inp.depth>=4?.05:0)-(cold&&bottomFish?.10:0)-(bass&&calm&&inp.depth<2?.12:0);
 if(key==='dropshot')fit=.72+(bottomFish?.12:0)+(approach(inp)==='patient'?.12:0)+(inp.depth>=2?.06:0)-(pursuit?.28:0)-(inp.structure==='river'?.12:0)-(weeds?.28:0)-(windy?.04:0);
 if(key==='texas')fit=.60+(weeds?.28:0)+(bass?.08:0)+(inp.target==='pike'?.05:0)-(inp.depth>8?.10:0)-(!weeds&&!bass?.08:0);
 if(key==='carolina')fit=.62+(bass?.16:0)+(['sand','drop'].includes(inp.structure)?.12:0)+(inp.depth>=3?.05:0)-(weeds?.18:0)-(pursuit?.12:0);
 if(key==='ned')fit=.60+(cold?.18:0)+(['bass','perch'].includes(inp.target)?.10:0)+(clean?.10:0)-(weeds?.24:0)-(windy?.10:0)-(inp.depth>6?.12:0)-(pursuit?.16:0);
 if(key==='wacky')fit=.54+(bass?.30:0)+(inp.depth<=2.5?.12:0)+(calm&&inp.structure==='harbor'?.10:0)-(!bass?.18:0)-(windy?.22:0);
 if(key==='weightless')fit=.55+(['bass','chub'].includes(inp.target)?.20:0)+(inp.depth<=1.2?.18:0)+(calm?.08:0)-(windy?.25:0)-(cold?.16:0);
 if(approach(inp)==='active'&&['dropshot','ned','wacky'].includes(key))fit-=.12;
 return Math.max(.05,Math.min(.98,fit));
}
function profile(l,key){
 if(!compatible(l,key)||l.rig?.preset)return null;
 const baseId=l.baseId||l.id,baseFamily=l.baseFamily||l.family;
 return {...l,id:baseId+'--rig-'+key,baseId,baseFamily,rigTechnique:key,family:rigs[key].name+' · '+baseFamily};
}
function candidates(l,inp){
 if(!isSoft(l)||l.rig?.preset||!inp.rigStyle)return [l];
 const keys=inp.rigStyle==='auto'?Object.keys(rigs):[inp.rigStyle];
 return keys.map(key=>profile(l,key)).filter(Boolean);
}
function proposalKey(l){return l.rigTechnique?'rig:'+l.rigTechnique+':'+l.cat:l.cat;}
function lureTypes(lures){
 const types=new Map();
 for(const base of lures)for(const l of candidates(base,{rigStyle:'auto'})){
  const key=proposalKey(l);
  if(!types.has(key))types.set(key,{key,label:l.family,cat:l.cat,rigTechnique:l.rigTechnique||null,variants:[]});
  types.get(key).variants.push(l);
 }
 return [...types.values()];
}
function setup(l,inp){
 if(!isSoft(l))return null;
 const key=choose(l,inp);if(!key)return {key:inp.rigStyle,name:rigs[inp.rigStyle]?.name||'Montaggio',compatible:false};
 const r=rigs[key],automatic=inp.autoRig===true;
 let weight=Math.max(0,Number(inp.jigHead??5));
 if(automatic){
  weight=window.GardaSelector.autoHead(l,inp,key);
 }
 if(key==='weightless')weight=0;
 const protectedHook=key==='texas'||key==='carolina'||key==='weightless'||(key==='jig'&&inp.softHook==='weedless');
 return {key,name:r.name,compatible:true,headWeight:weight,hookType:protectedHook?'weedless':'exposed',leaderCm:key==='dropshot'?(inp.clarity>=7&&inp.depth>=7?50:35):key==='carolina'?(inp.clarity>=7?80:50):key==='wacky'&&weight?15:0,excessDepth:inp.depth>r.max+.5||inp.depth<r.min-.3||key==='wacky'&&weight>3};
}
function presentation(l,inp,env){
 const cold=inp.waterTemp<12,clear=inp.clarity>=7,windy=inp.windSpeed>=6,night=env.daylight===0;
 const pike=inp.target==='pike',fast=['asp','trout'].includes(inp.target)&&!cold;
 const patient=approach(inp)==='patient',active=approach(inp)==='active';
 const pause=patient?(clear?'4–6':'3–4'):active?'0,5–1':(clear?'2–3':'1–2');
 const requestedRig=setup(l,inp),fallback=!!requestedRig&&(!requestedRig.compatible||requestedRig.excessDepth);
 const setupRig=fallback?setup({...l,rigTechnique:null},{...inp,rigStyle:'jig'}):requestedRig,key=setupRig?.key;
 const diving=/minnow|jerkbait|crank/.test(l.cat)&&!l.cat.startsWith('sinking');
 const workingDepth=diving?Math.max(l.runMin,Math.min(l.runMax,inp.depth)):inp.depth;
 const depth=Number(workingDepth).toFixed(1).replace('.',','),edge={weed:'bordo esterno dell’erba',rock:'corridoi tra i massi',harbor:'lato ombreggiato di muri e pontili',drop:'primo scalino',cliff:'parete e primo gradino',sand:'transizione sabbia–sassi',river:'margine della corrente'}[inp.structure]||'zona scelta';
 const step=(title,text,action,metric='')=>({title,text,action,metric});
 let name,steps,summary;
 if(key==='dropshot'){
  name='Drop shot · scuoti e aspetta';
  steps=[step('Appoggia il piombo',`Porta il piombo sul fondo nella zona scelta (${edge}). Tratto amo–piombo: ${setupRig.leaderCm} cm sulla lenza.`, 'dropshot-set',setupRig.leaderCm+' cm'),step('Fai tremare la gomma',windy?'Canna bassa: piccoli tocchi senza far saltare il piombo. Recupera la pancia della lenza.':'Tendi appena la lenza e fai vibrare la punta; il piombo resta sul punto.','dropshot-shake','1–3 cm'),step('Pausa, poi sposta',`Ferma per ${pause} s. Poi trascina il piombo di 20–40 cm e ripeti.`, 'dropshot-move',pause+' s')];
 }else if(key==='texas'){
  name='Texas · entra, solleva, lascia cadere';
  steps=[step('Entra nel varco',`Lancio controllato verso ${edge}. Piombo bullet davanti alla gomma, punta offset protetta.`, 'texas-set'),step('Solleva poco',cold?'Muovi la punta di 10–15 cm e fai avanzare lentamente il montaggio.':'Piccolo sollevamento di 15–30 cm; accompagna la gomma fuori dall’ostacolo.','hop',cold?'10–15 cm':'15–30 cm'),step('Accompagna la caduta',`Riprendi il filo senza tendere troppo; lascia fermo ${pause} s vicino alla cover.`, 'fall-pause',pause+' s')];
 }else if(key==='carolina'){
  name='Carolina · trascina e lascia planare';
  steps=[step('Separa peso e gomma',`Piombo sulla madrelenza, girella e finale da ${setupRig.leaderCm} cm. Porta il piombo sul fondo.`, 'carolina-set',setupRig.leaderCm+' cm'),step('Trascina con la canna',`Canna bassa: sposta il piombo di ${cold?'20–30':'30–60'} cm lungo il ${edge}.`, 'drag',cold?'20–30 cm':'30–60 cm'),step('Ferma e lascia planare',`Riprendi solo il lasco; pausa ${pause} s mentre la gomma segue il piombo.`, 'carolina-pause',pause+' s')];
 }else if(key==='ned'){
  name='Ned · trascinamenti e soste';
  steps=[step('Appoggia sul pulito','Testina mushroom e gomma corta su sassi piccoli o fondo pulito; evita le fessure profonde.','ned-set'),step('Avanza di pochi centimetri',cold?'Trascina 10–15 cm. Non serve saltare alto: resta a contatto col fondo.':'Piccolo saltello o trascinamento di 15–25 cm, con lenza sotto controllo.','drag',cold?'10–15 cm':'15–25 cm'),step('Lascia lavorare la gomma',`Tieni fermo ${cold?'5–8':'2–4'} s. La posizione della gomma dipende dalla sua galleggiabilità.`, 'ned-pause',cold?'5–8 s':'2–4 s')];
 }else if(key==='wacky'){
  name='Wacky · caduta e tremolii';
  steps=[step('Innesca al centro',`Amo al centro del worm; estremità libere. ${setupRig.headWeight?'Piombino da '+setupRig.headWeight+' g a '+setupRig.leaderCm+' cm sopra l’amo.':'Senza piombo aggiunto.'}`,'wacky-set'),step('Lascia scendere','Segui la caduta con filo semi-morbido; osserva deviazioni o fermate della lenza.','wacky-fall'),step('Due piccoli tremolii',`Dai due tocchi da 2–5 cm, poi attendi ${pause} s senza trascinare via il worm.`, 'shake',pause+' s')];
 }else if(key==='weightless'){
  name='Weightless · scivola e fermati';
  steps=[step('Lascia affondare da sola',`Niente piombo aggiunto: posa la gomma nella zona scelta (${edge}) e osserva il filo.`, 'fall'),step('Uno o due richiami','Tocchi brevi con lenza appena morbida; fai scartare la gomma senza tirarla come un cucchiaino.','twitch','1–2 tocchi'),step('Caduta in pausa',`Lascia ricadere per ${pause} s. Se vento o quota tolgono controllo, passa a un montaggio piombato.`, 'fall-pause',pause+' s')];
 }else if(['soft shad','soft swimbait'].includes(l.cat)&&(pike||['asp','trout'].includes(inp.target))){
  name=pike?'Nuoto lento con cambi di ritmo':'Nuoto lineare e brevi accelerazioni';
  steps=[step('Raggiungi la fascia',`Conta la discesa finché controlli circa ${depth} m; passa lungo ${edge}.`, 'sink',depth+' m'),step('Fai lavorare la coda',pike?'Recupera lento e costante, abbastanza da far battere la paddle tail.':'Recupera regolare seguendo la fascia del foraggio; varia la velocità senza strappare.','steady',pike?'Lento':'Regolare'),step('Cambia ritmo',cold?'Breve rallentamento; segui la discesa senza perdere contatto. Evita soste cieche sul fondo.':'Una breve accelerazione, poi ritorna al passo iniziale; se arresti, accompagna la discesa.','speed-change','1–2 giri')];
 }else if(isSoft(l)){
  name=inp.target==='zander'?'Saltelli bassi e discesa controllata':l.cat==='soft creature'?'Trascina, solleva e aspetta':'Jig head · piccoli saltelli';
  steps=[step('Trova la quota',`Porta il montaggio a circa ${depth} m nella zona scelta (${edge}). Segui la discesa con il filo.`, 'sink',depth+' m'),step(cold?'Solleva appena':'Piccolo saltello',cold?'Movimento di 10–20 cm; fai avanzare la gomma senza staccarla molto dal fondo.':'Solleva 20–40 cm con la canna, poi riprendi solo il filo in eccesso.','hop',cold?'10–20 cm':'20–40 cm'),step('Caduta e pausa',`Accompagna il ritorno con la canna. Pausa ${pause} s; ripeti mantenendo la quota.`, 'fall-pause',pause+' s')];
 }else if(l.cat==='spybait'){
  name='Spybait · nuoto lento e continuo';
  steps=[step('Conta la discesa',`Lascia affondare verso ${depth} m, sopra il fondo o accanto al bordo dell’erba.`, 'sink',depth+' m'),step('Fai girare le eliche','Recupera lento e regolare: le due piccole eliche devono lavorare senza twitch o strattoni.','steady','Lento'),step('Mantieni la fascia','Conserva la stessa cadenza; rallenta appena o accompagna una breve discesa quando perdi quota.','steady','Continuo')];
 }else if(['suspending jerkbait','deep jerkbait'].includes(l.cat)){
  name=l.cat==='deep jerkbait'?'Deep jerk · scendi, richiama, sospendi':'Jerkbait · twitch e pausa';
  steps=[step('Porta in profondità',l.cat==='deep jerkbait'?`Fai 5–8 giri regolari per far lavorare la paletta lunga; resta nella fascia dei ${depth} m.`:`Due o tre giri per caricare la paletta e portare l’esca nella sua fascia.`, 'dive',depth+' m'),step('Richiami corti',cold?'Uno o due richiami morbidi di 10–20 cm; riporta la punta verso l’esca.':'Uno o due twitch brevi; lascia un poco di lasco dopo ogni scatto.','twitch',cold?'10–20 cm':'1–2 twitch'),step('Lascia sospendere',`Pausa iniziale ${pause} s. Con vento ${windy?'recupera la pancia del filo':'evita di trascinare l’esca'}; verifica l’assetto reale in acqua.`, 'suspend',pause+' s')];
 }else if(['floating minnow','jointed minnow'].includes(l.cat)){
  name='Minnow floating · nuota e risali';
  steps=[step('Fai entrare la paletta',`Recupero regolare lungo ${edge}, senza forzare sotto la fascia di lavoro.`, 'dive'),step('Nuoto breve',fast?'Alterna 3–5 giri regolari a una piccola accelerazione.':'Alterna 2–4 giri lenti a un richiamo corto della punta.','steady',cold?'Lento':'Regolare'),step('Ferma e fai risalire',`Stop ${pause} s: il floating tende a risalire. Riparti prima che entri negli ostacoli.`, 'rise',pause+' s')];
 }else if(['sinking minnow','sinking jerkbait'].includes(l.cat)){
  name='Sinking · conta, recupera, controlla';
  steps=[step('Conta la discesa',`Trova il conteggio che porta l’esca verso ${depth} m. Conta di nuovo a ogni lancio.`, 'sink',depth+' m'),step('Recupera nella fascia',fast||active?'Recupero sostenuto con accelerazioni brevi, lungo la fascia del foraggio.':`Recupero ${patient?'lento':'regolare'} con piccoli richiami, lungo ${edge}.`,'steady',fast||active?'Sostenuto':patient?'Lento':'Regolare'),step('Pausa corta controllata','Quando ti fermi lo sinking scende: accompagna il filo e riparti prima di toccare gli ostacoli.','fall-pause',patient?'1–3 s':'1 s')];
 }else if(['crankbait','deep crank'].includes(l.cat)){
  name=l.cat==='deep crank'?'Deep crank · paletta in lavoro':'Crank · nuoto e stop';
  steps=[step(l.cat==='deep crank'?'Fai scendere la paletta':'Entra nella fascia',l.cat==='deep crank'?`Giri regolari per caricare la paletta lunga; cerca la fascia dei ${depth} m, senza arare i massi.`:'Carica la paletta corta e lavora sopra gli ostacoli del primo scalino.','dive',depth+' m'),step('Recupera costante',`Cadenza ${cold?'lenta':'media'}: senti la vibrazione. Tieni la canna ${windy?'bassa per ridurre il filo al vento':'orientata lungo la traiettoria'}.`,'steady',cold?'Lento':'Medio'),step('Stop per liberare','Su contatto leggero, smetti di forzare e lascia risalire il floating; riparti quando sei libero.','rise','Stop breve')];
 }else if(l.cat==='glide swimbait'){
  name='Glide · disegna una S larga';
  steps=[step('Entra nella fascia',`Lascia scendere il slow sinking verso ${depth} m, in un corridoio libero dal fondo.`, 'sink',depth+' m'),step('Mezzi giri alternati','Mezzo giro di manovella, breve stacco, poi un altro: fai scivolare l’esca a destra e sinistra.','glide','½ giro'),step('Fai chiudere la curva',`Pausa breve ${cold?'1–2':'0,5–1'} s, controllando la discesa. Rallenta vicino alla struttura scelta.`, 'glide-pause',cold?'1–2 s':'0,5–1 s')];
 }else if(l.cat==='spinner'){
  name='Rotante · paletta sempre in rotazione';
  steps=[step('Avvia la paletta','Un breve giro deciso appena l’esca entra nella fascia; senti partire la vibrazione.','start'),step('Trova il minimo utile',`Recupera ${cold?'molto lento':'regolare'}, quanto basta a tenere la paletta attiva lungo ${edge}.`,'steady',cold?'Lento':'Regolare'),step('Cambia traiettoria','Alza o abbassa poco la punta per cambiare fascia. Rallenta senza fermare del tutto la paletta.','speed-change','Paletta attiva')];
 }else if(['spinnerbait','chatterbait'].includes(l.cat)){
  name=l.cat==='spinnerbait'?'Spinnerbait · slow roll controllato':'Chatterbait · vibrazione continua';
  steps=[step('Avvia il movimento',`Fai partire ${l.cat==='spinnerbait'?'le palette':'la lama'} appena arrivi alla quota; passa lungo ${edge}.`, 'start'),step('Segui il bordo',`Recupero ${cold?'lento':'regolare'}, sopra gli ostacoli. ${windy?'Canna bassa e poco filo fuori.':'Mantieni la stessa fascia per più metri.'}`,'steady',cold?'Slow roll':'Regolare'),step('Un richiamo breve','Una piccola accelerazione, poi torna al passo iniziale. Evita stop lunghi che fanno affondare negli ostacoli.','speed-change','1 giro')];
 }else if(l.cat==='topwater'){
  name='Popper · pop e attesa';
  steps=[step('Aspetta i cerchi','Dopo il lancio lascia spegnere i cerchi sull’acqua; resta nel corridoio libero.','surface-set'),step('Un pop corto','Un colpo di punta da 5–10 cm con un poco di lasco: la bocca cava sposta l’acqua.','pop','5–10 cm'),step('Pausa in superficie',`Ferma ${pause} s. ${clear?'Con acqua limpida prolunga la sosta.':'Riparti con un altro pop corto.'} Non trascinare come un minnow.`, 'surface-pause',pause+' s')];
 }else if(l.cat==='buzzbait'){
  name='Buzzbait · elica sempre in superficie';
  steps=[step('Parti subito','Recupera appena l’esca tocca l’acqua per far salire e girare l’elica.','surface-start'),step('Tieni la scia','Velocità minima che mantiene l’elica fuori dall’acqua; canna abbastanza alta e scia continua.','surface-steady','Scia continua'),step('Passa accanto alla cover','Segui il bordo o il corridoio libero mantenendo il recupero. Non fermarti: il buzzbait affonda.','surface-steady','Senza stop')];
 }else if(l.cat==='spoon'){
  name='Ondulante · flutter controllato';
  steps=[step('Scendi contando',`Conta la caduta fino alla fascia dei ${depth} m. Con vento segui il filo, senza lasciarlo in bando.`, 'sink',depth+' m'),step('Fai ondulare',`Recupero ${fast?'sostenuto':'regolare'} senza far ruotare l’ondulante sul proprio asse.`, 'steady',fast?'Sostenuto':'Regolare'),step('Breve flutter','Smetti per un istante, accompagna la sfarfallata in discesa e riparti nella stessa fascia.','flutter','1–2 s')];
 }else if(l.cat==='spintail'){
  name='Spintail · conta e fai girare';
  steps=[step('Trova il conteggio',`Lascia scendere verso ${depth} m; ripeti lo stesso conteggio sui lanci successivi.`, 'sink',depth+' m'),step('Recupera regolare','Mantieni la paletta di coda in rotazione con giri regolari, evitando di arare il fondo.','steady',cold?'Lento':'Regolare'),step('Alza e accompagna','Un piccolo sollevamento di 20–30 cm, poi discesa seguita dalla punta: la paletta continua a richiamare.','flutter','20–30 cm')];
 }else{
  const blade=l.cat==='blade bait',jig=l.cat==='vertical jig';
  name=blade?'Blade bait · sollevamenti corti':jig?'Metal jig · alza e segui la caduta':'Lipless · yo-yo controllato';
  steps=[step('Raggiungi la fascia',`Conta la discesa verso ${depth} m nella zona scelta (${edge}); conserva contatto con la lenza.`, 'sink',depth+' m'),step(blade?'Senti la vibrazione':'Solleva senza strappare',blade?`Alza ${cold?'10–20':'20–30'} cm finché senti vibrare la lama. Evita strattoni ampi.`:`Solleva ${cold?'20–30':'30–50'} cm con la canna; non trascinare via l’esca per metri.`,'hop',cold?'10–30 cm':'20–50 cm'),step('Segui il ritorno',`Accompagna la discesa, recupera il lasco e ${cold?'ferma 2–4 s':'ripeti dopo un breve contatto'}. Le tocche possono arrivare in caduta.`, 'fall-pause',cold?'2–4 s':'1–2 s')];
 }
 summary=steps[1].text+' '+steps[2].text;
 const context=[typeof SPECIES!=='undefined'?SPECIES[inp.target].label:inp.target,cold?'Acqua fredda':'Acqua '+inp.waterTemp+' °C',inp.clarity<4?'torbida':inp.clarity<7?'velata':'limpida',windy?'vento sostenuto':'vento debole / moderato',night?'poca luce':'luce diurna'];
 if(diving&&Math.abs(workingDepth-inp.depth)>.1)context.push('Quota di lavoro di questa misura: '+l.runMin+'–'+l.runMax+' m');
 if(fallback)name='Alternativa · '+name;
 return {name,fallback,key:setupRig?.key||l.cat,rig:setupRig,steps,summary,context:context.join(' · '),edge,pause};
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function geometry(plan,phase){
 const key=plan.rig?.key,action=plan.steps[phase].action;
 if(key==='dropshot'){const x=phase===2?200:170;return {x,y:109,line:`M320 24 L${x+54} 109 L${x+40} 171`,sinker:[x+40,171],mount:'drop'};}
 if(key==='carolina'){const x=phase===1?173:143;return {x,y:142,line:`M320 26 L${x+106} 163 L${x+54} 142`,sinker:[x+106,163],mount:'carolina'};}
 if(key==='ned')return {x:185,y:144,line:'M320 26 L201 163',sinker:[201,163],mount:'ned'};
 if(key==='wacky'){const y=phase===0?80:132;return {x:173,y,line:`M320 25 L230 ${y-32} L174 ${y}`,sinker:plan.rig.headWeight?[230,y-32]:null,mount:'wacky'};}
 let y=action.includes('surface')||action==='pop'?50:action==='sink'||action==='dive'?(phase===0?115:122):action==='hop'?96:action==='rise'?94:130;
 return {x:183,y,line:key==='texas'?`M320 25 L249 ${y+2}`:key==='jig'?`M320 25 L235 ${y+2}`:key==='weightless'?`M320 25 L235 ${y+2}`:`M320 25 ${action==='twitch'||action==='suspend'?'Q265 25 227 '+y:'L227 '+y}`,mount:key==='texas'?'texas':key==='jig'?'jig':key==='weightless'?'offset':null};
}
function diagram(l,inp,env,plan,phase){
 const g=geometry(plan,phase),s=plan.steps[phase],uid='fishing-'+l.id+'-'+phase;
 const c=window.GardaColors.pick(l,inp,env),asset=window.GardaColors.asset(l,c),native=window.GardaColors.isNative?.(l,c,asset);
 const filter=native?'none':window.GardaColors.filterId?.(c.key,l)?'url(#'+window.GardaColors.filterId(c.key,l)+')':'none';
 const surface=s.action.includes('surface')||s.action==='pop',bottom=inp.structure==='sand'?'#baa67b':'#8d9a95';
 const arrow=d=>`<path d="${d}" fill="none" stroke="#fff8" stroke-width="8" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#ef9a40" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#${uid}-arrow)"/>`;
 let motion='';
 if(s.action==='sink'||s.action==='fall'||s.action==='wacky-fall')motion=arrow('M147 65 Q157 87 153 113');
 else if(s.action==='dive')motion=arrow('M80 60 Q107 114 150 121');
 else if(s.action==='rise')motion=arrow('M131 141 Q143 119 152 98');
 else if(s.action==='hop')motion=arrow('M105 154 Q138 82 168 95');
 else if(s.action==='twitch'||s.action==='glide')motion=arrow(s.action==='glide'?'M80 126 Q110 92 145 123 T220 122':'M91 127 L120 109 L148 126 L177 107 L207 121');
 else if(s.action==='dropshot-shake'||s.action==='shake')motion=arrow('M117 113 Q125 97 137 111 T159 110');
 else if(s.action==='dropshot-move'||s.action==='drag')motion=arrow('M92 159 L143 159');
 else if(s.action==='flutter'||s.action==='fall-pause')motion=arrow('M125 92 Q149 104 132 117 T148 145');
 else if(s.action==='pop')motion=arrow('M103 44 Q127 27 150 43');
 else if(s.action.includes('pause')||s.action==='suspend')motion='<circle cx="111" cy="99" r="19" fill="#ffffffb8" stroke="#ef9a40" stroke-width="2"/><path d="M106 89 V109 M116 89 V109" stroke="#be7529" stroke-width="4"/>';
 else if(s.action.endsWith('set'))motion=arrow(surface?'M121 21 L151 44':'M128 72 L150 121');
 else motion=arrow(`M87 ${surface?47:105} L147 ${surface?47:105}`);
 const weeds=inp.structure==='weed'?'<g fill="#438d69"><path d="M48 174 Q25 142 40 117 Q36 150 55 174Z"/><path d="M58 176 Q48 117 65 91 Q58 136 67 175Z"/><path d="M72 174 Q67 137 87 111 Q78 146 81 174Z"/></g>':'';
 const rocks=inp.structure==='sand'?'':'<g><path d="M19 180 L33 148 L65 151 L85 180Z" fill="#a9b2a3"/><path d="M33 148 L51 170 L65 151Z" fill="#d5dac9"/><path d="M51 170 L85 180 L65 151Z" fill="#7f958b"/><path d="M257 183 L280 154 L304 165 L326 186Z" fill="#b8c0ac"/><path d="M280 154 L287 183 L304 165Z" fill="#8ba697"/></g>';
 const softImage=(x,y,h)=>{const img=`<image href="${window.GardaColors.image(l,c)}" x="${x}" y="${y}" width="116" height="${h}" preserveAspectRatio="xMidYMid meet" style="filter:${filter}"/>`;return l.cat==='soft creature'?`<g data-rig-entry="tail" transform="translate(${2*(x+58)} 0) scale(-1 1)">${img}</g>`:img;};
 let lure=softImage(g.x-62,g.y-25,56);
 if(g.mount==='ned')lure=`<g transform="rotate(78 202 165)">${softImage(86,138,50)}</g>`;
 let rig='';
 if(g.mount==='ned')rig+='<path d="M193 165 Q201 159 209 165 L209 169 H193Z" fill="#647e88" stroke="#e1eef1"/><path d="M201 163 Q185 146 190 129 L194 134" fill="none" stroke="#2e4651" stroke-width="2"/>';
 else if(g.sinker){const [x,y]=g.sinker;rig+=`<path d="M${x} ${y-9} L${x+7} ${y-2} L${x+5} ${y+8} L${x-6} ${y+8} L${x-8} ${y-2}Z" fill="#647e88" stroke="#e1eef1" stroke-width="1.3"/>`;}
 if(g.mount==='drop')rig+=`<path d="M${g.x+54} ${g.y-3} q-4 10 -12 3" fill="none" stroke="#253e4c" stroke-width="2.5"/><text x="269" y="157" font-size="10" fill="#275c6a">${plan.rig.leaderCm} cm</text>`;
 if(g.mount==='carolina'){const x=g.sinker[0];rig+=`<circle cx="${x-18}" cy="158" r="3" fill="#d27843"/><path d="M${x-27} 156 l-6 -4 l-6 4 l6 4Z" fill="#45616b"/><text x="${x-90}" y="176" font-size="9" fill="#275c6a">${plan.rig.leaderCm} cm</text>`;}
 if(g.mount==='texas')rig+=`<path d="M${g.x+50} ${g.y-3} l16 5 -16 5Z" fill="#6a808b"/><path d="M${g.x+36} ${g.y+6} q-21 25 -45 1" fill="none" stroke="#2f4954" stroke-width="2"/>`;
 if(g.mount==='offset')rig+=`<path d="M${g.x+51} ${g.y+2} l-7 6 h-12 q-12 20 -29 3 l3 -5" fill="none" stroke="#2f4954" stroke-width="2"/>`;
 if(g.mount==='jig')rig+=`<circle cx="${g.x+52}" cy="${g.y+2}" r="7" fill="#71858c"/><path d="M${g.x+44} ${g.y+2} Q${g.x+18} ${g.y+12} ${g.x+15} ${g.y-13}" fill="none" stroke="#2e4651" stroke-width="2"/>`;
 if(g.mount==='wacky')rig+=`<path d="M${g.x} ${g.y-3} q13 18 22 4" fill="none" stroke="#294552" stroke-width="2.5"/>`;
 const rod='<path d="M316 14 L339 37" stroke="#294a58" stroke-width="4" stroke-linecap="round"/><circle cx="324" cy="25" r="5" fill="#e4b470"/>';
 return `<svg class="retrieve-scene" viewBox="0 0 340 205" role="img" aria-label="${esc(s.title+': '+s.text)}"><defs><linearGradient id="${uid}-water" x2="0" y2="1"><stop stop-color="#d8f2f2"/><stop offset="1" stop-color="#70bfc9"/></linearGradient><marker id="${uid}-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L9 5 L0 10Z" fill="#ef9a40"/></marker></defs><rect width="340" height="205" rx="15" fill="url(#${uid}-water)"/><path d="M0 0 H340 V46 L279 52 L199 44 L113 49 L46 44 L0 48Z" fill="#e9f6f4"/><path d="M0 49 L111 48 L68 143Z" fill="#a4dcd8" opacity=".55"/><path d="M111 48 L225 47 L177 143Z" fill="#bee8df" opacity=".5"/><path d="M225 47 L340 48 L293 158 L177 143Z" fill="#87cdd0" opacity=".35"/><path d="M0 48 Q25 43 49 48 T98 48 T147 48 T196 48 T245 48 T294 48 T343 48" fill="none" stroke="#fff" stroke-width="2"/><path d="M0 180 L55 175 L125 183 L203 173 L273 181 L340 177 V205 H0Z" fill="${bottom}"/><path d="M0 180 L83 205 L125 183Z" fill="#c2c6b0"/><path d="M125 183 L203 173 L228 205Z" fill="#a5b39d"/><path d="M228 205 L273 181 L340 205Z" fill="#ccd0b5"/>${rocks}${weeds}<path d="${g.line}" stroke="#effaff" stroke-width="2" fill="none"/>${rod}${motion}${lure}${rig}${surface?'<path d="M93 60 Q105 55 117 60 M72 65 Q86 60 96 65" stroke="#fff" stroke-width="2" fill="none"/>':''}<rect x="12" y="12" width="${s.metric?Math.min(160,26+s.metric.length*6):57}" height="22" rx="11" fill="#ffffffcb"/><text x="23" y="27" fill="#1c5367" font-size="11" font-family="system-ui" font-weight="650">${esc(s.metric||'Fase '+(phase+1))}</text></svg>`;
}
function render(l,inp,env){const p=presentation(l,inp,env);return `<section id="retrieveGuide" class="retrieve-guide" aria-label="Recupero in tre passaggi"><div class="guide-heading"><div><span class="eyebrow">Per questo scenario</span><h3>${esc(p.name)}</h3><p>${esc(p.context)}${p.fallback?' · Il montaggio scelto non è adatto: qui è illustrata l’alternativa jig head.':''}</p></div><span class="guide-count">3 passaggi</span></div><div class="retrieve-panels">${p.steps.map((s,i)=>`<figure>${diagram(l,inp,env,p,i)}<figcaption><h4><span>${i+1}</span>${esc(s.title)}</h4><p>${esc(s.text)}</p></figcaption></figure>`).join('')}</div></section>`;}
function catalog(){return `<section class="technique-catalog"><div class="result-heading"><div><span class="eyebrow">Consigliati insieme alle esche</span><h2>Tecniche e montaggi</h2></div></div><div class="technique-grid">${Object.entries(rigs).map(([key,r])=>`<button class="technique-tile" type="button" data-technique="${key}"><span class="technique-glyph" aria-hidden="true">${{jig:'↗',dropshot:'↕',texas:'⌁',carolina:'↔',ned:'⊥',wacky:'∪',weightless:'≈'}[key]}</span><strong>${r.name}</strong><span>${r.description}</span><small>Vedi proposta consigliata ↗</small></button>`).join('')}</div></section>`;}
window.GardaTechniques={rigs,compatible,choose,suitability,profile,candidates,proposalKey,lureTypes,setup,presentation,render,catalog,approach};
})();
