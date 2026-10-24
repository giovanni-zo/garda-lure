/* Garda Lure v9.1. Domain rules are heuristics; evidence and limits live in project docs. */
(function () {
  'use strict';
  const soft = l => l.cat.includes('soft');
  const surface = l => ['topwater','buzzbait','crawler'].includes(l.cat);
  const metal = l => ['spintail','blade bait','vertical jig','lipless vibration','spoon'].includes(l.cat);
  const defaults = {rodLength:2.4,lineDiameter:.14,jigHead:5,rigHardware:0,softHook:'exposed',weedDensity:'sparse',bottomDepth:0,fishActivity:'auto'};
  Object.assign(DEFAULTS,defaults);
  for (const l of LURES) {
    const head = String(l.code).match(/\+(jig|texas)(\d+(?:\.\d+)?)/i);
    const assembled=!!head||/combo|dark sleeper|baby deraball|blaster shad|candy shrimp|crazy sandeel|head bomb/i.test(l.family)||/\+ds$/i.test(l.code);
    const protectedHook=/dark sleeper|black minnow/i.test(l.family)||head&&head[1].toLowerCase()==='texas';
    l.rig = Object.freeze({catalogWeight:l.weight,bodyWeight:head?Math.max(0,l.weight-Number(head[2])):assembled?null:l.weight,headWeight:head?Number(head[2]):assembled?null:0,preset:assembled,hookType:protectedHook||/weedless|anti.?incaglio|offset|texas/i.test([l.notes,...(l.tags||[])].join(' '))?'weedless':assembled?'exposed':'unknown'});
    l.baseCode=l.code;
  }
  function rigFor(l,inp) {
    const r=l.rig||{bodyWeight:l.weight,headWeight:0,catalogWeight:l.weight,preset:false,hookType:'unknown'};
    if(!soft(l)) return {bodyWeight:r.catalogWeight,headWeight:0,hardwareWeight:0,totalWeight:r.catalogWeight,hookType:'treble',preset:true};
    if(r.preset&&r.bodyWeight===null)return {bodyWeight:null,headWeight:r.headWeight,hardwareWeight:Math.max(0,Number(inp.rigHardware||0)),totalWeight:r.catalogWeight+Math.max(0,Number(inp.rigHardware||0)),hookType:r.hookType,preset:true};
    let head=r.preset?r.headWeight:Math.max(0,Number(inp.jigHead??5));
    if(!r.preset&&inp.autoRig){
      head=autoHead(l,inp,'jig');
    }
    const hardware=Math.max(0,Number(inp.rigHardware||0));
    if(!r.preset&&window.GardaTechniques&&(inp.rigStyle||l.rigTechnique)){
      const mount=window.GardaTechniques.setup(l,inp);
      if(mount?.compatible){head=mount.headWeight;return {bodyWeight:r.bodyWeight,headWeight:head,hardwareWeight:hardware,totalWeight:r.bodyWeight+head+hardware,hookType:mount.hookType,preset:false,style:mount.key,styleName:mount.name,leaderCm:mount.leaderCm,techniqueValid:!mount.excessDepth};}
      if(mount)return {bodyWeight:r.bodyWeight,headWeight:head,hardwareWeight:hardware,totalWeight:r.bodyWeight+head+hardware,hookType:inp.softHook==='weedless'?'weedless':'exposed',preset:false,style:mount.key,styleName:mount.name,leaderCm:0,techniqueValid:false};
    }
    return {bodyWeight:r.bodyWeight,headWeight:head,hardwareWeight:hardware,totalWeight:r.bodyWeight+head+hardware,hookType:r.preset?r.hookType:(inp.softHook==='weedless'?'weedless':'exposed'),preset:r.preset};
  }
  function rigText(l,inp) {
    if(!soft(l)) return '';
    const r=rigFor(l,inp),kind=r.hookType==='weedless'?'offset anti-incaglio':'amo esposto';
    if(r.style){
      const head=r.headWeight?'piombo '+fmt(r.headWeight,1)+' g':'senza piombo';
      const position=r.style==='dropshot'?' · amo–piombo '+r.leaderCm+' cm':r.style==='carolina'?' · finale '+r.leaderCm+' cm':r.style==='wacky'?' · amo al centro'+(r.headWeight?' · piombo '+r.leaderCm+' cm sopra l’amo':''):r.style==='ned'?' · testina mushroom':'';
      return r.styleName+' · '+head+position+' · '+kind+' · totale '+fmt(r.totalWeight,1)+' g';
    }
    return `${r.headWeight===null?'Montato':r.headWeight ? 'Piombo '+fmt(r.headWeight,1)+' g' : 'Senza piombo'} · ${kind} · totale ${fmt(r.totalWeight,1)} g`;
  }
  const oldRead=readInputs;
  readInputs=function(){
    const inp=oldRead();
    for(const [id,fallback] of Object.entries(defaults)){
      const el=$(id);inp[id]=el?(el.tagName==='SELECT'?el.value:(el.value!==''&&Number.isFinite(Number(el.value))?Number(el.value):fallback)):fallback;
    }
    if($('rigStyle')?.value)inp.rigStyle=$('rigStyle').value;
    if($('autoRig')?.type==='checkbox')inp.autoRig=$('autoRig').checked;
    inp.rodLength=clamp(inp.rodLength,1.2,4);inp.lineDiameter=clamp(inp.lineDiameter,.06,.5);
    inp.jigHead=clamp(inp.jigHead,0,40);inp.rigHardware=clamp(inp.rigHardware,0,20);
    for(const l of LURES) {l.weight=rigFor(l,inp).totalWeight;l.catalog=`${l.baseCode} · ${l.lengthCm} cm · ${fmt(l.weight,1)} g · ${l.runText}`;}
    return inp;
  };
  // Keep lunar illumination for the light calculation; remove speculative atmospheric activity bonuses.
  const oldEnvironment=computeEnvironment;
  function solarTimes(inp){
    const date=new Date(inp.date+'T12:00:00Z'),year=date.getUTCFullYear();
    const day=Math.floor((date-Date.UTC(year,0,1))/86400000)+1,days=year%4===0&&(year%100!==0||year%400===0)?366:365;
    const gamma=2*Math.PI/days*(day-1),rad=Math.PI/180;
    const eq=229.18*(.000075+.001868*Math.cos(gamma)-.032077*Math.sin(gamma)-.014615*Math.cos(2*gamma)-.040849*Math.sin(2*gamma));
    const dec=.006918-.399912*Math.cos(gamma)+.070257*Math.sin(gamma)-.006758*Math.cos(2*gamma)+.000907*Math.sin(2*gamma)-.002697*Math.cos(3*gamma)+.00148*Math.sin(3*gamma);
    const point=typeof MAP_SPOT_COORDS!=='undefined'&&MAP_SPOT_COORDS[inp.location]||{lat:45.66,lon:10.69},lat=point.lat*rad;
    const ha=Math.acos(clamp(Math.cos(90.833*rad)/(Math.cos(lat)*Math.cos(dec))-Math.tan(lat)*Math.tan(dec),-1,1))/rad;
    const zone=Number(new Intl.DateTimeFormat('en',{timeZone:'Europe/Rome',timeZoneName:'shortOffset'}).formatToParts(date).find(p=>p.type==='timeZoneName').value.replace('GMT+',''));
    return {sunrise:(720-4*(point.lon+ha)-eq)/60+zone,sunset:(720-4*(point.lon-ha)-eq)/60+zone};
  }
  computeEnvironment=function(inp){
    const env=oldEnvironment(inp),sun=solarTimes(inp);
    Object.assign(env,sun);env.daylight=inp.hour>=sun.sunrise&&inp.hour<=sun.sunset?1:0;
    env.sunPeak=env.daylight?Math.sin(Math.PI*(inp.hour-sun.sunrise)/(sun.sunset-sun.sunrise)):0;
    env.dawnDusk=Math.max(0,1-Math.min(Math.abs(inp.hour-sun.sunrise),Math.abs(inp.hour-sun.sunset))/2.2);
    env.light=clamp(env.sunPeak*(1-inp.cloud/135)+env.dawnDusk*.28+(1-env.daylight)*(inp.moon/100)*.25,0,1);
    const temp=(env.bioTempFit??env.tempScore*100)/100;
    const light=['zander','trout','pike'].includes(inp.target)?Math.max(env.dawnDusk,1-env.light):.6+.4*env.dawnDusk;
    // Temperature and light describe opportunity, not observed feeding behaviour.
    env.activity=inp.fishActivity==='slow'?25:inp.fishActivity==='active'?85:clamp(100*(.25+.30*temp+.15*seasonalSpeciesScore(inp.target,env.month)+.10*light),25,80);
    return env;
  };
  const oldHabitat=estimatedHabitat;
  estimatedHabitat=function(inp){
    const h=oldHabitat(inp),m=dateParts(inp.date).month,cold=inp.waterTemp<=11||[11,12,1,2].includes(m);
    const lower=(LOCATIONS[inp.location].basin||'').includes('basso');
    const edge=['drop','cliff'].includes(inp.structure),midday=inp.hour>=10&&inp.hour<=17;
    if(inp.target==='perch'){
      let lo=cold?5:1,hi=cold?12:4;
      if(inp.structure==='drop'||inp.structure==='cliff'){lo+=cold?2:1;hi+=cold?4:2;}
      if(inp.structure==='sand'||inp.structure==='weed'){lo=cold?3:.8;hi=cold?8:3.5;}
      const summer=inp.waterTemp>=21&&[5,6,7,8,9].includes(m);
      if(!cold&&edge&&!lower){lo=summer?3:2;hi=summer?15:10;if(summer&&midday&&inp.clarity>=7)lo=5;}
      if(inp.fishActivity==='active'&&!cold){lo=Math.min(lo,1);hi=Math.min(hi,edge?8:4);}
      if(lower){lo*=.8;hi*=.8;}
      const sizeShift=clamp((inp.targetSize-25)/40,-.15,.35);
      const position=clamp(.45+sizeShift+(midday&&inp.clarity>=7?.10:0)-(inp.fishActivity==='active'?.20:0),.2,.8);
      h.rangeMin=+lo.toFixed(1);h.rangeMax=+hi.toFixed(1);h.depth=+(lo+(hi-lo)*position).toFixed(1);
      if(summer&&edge&&!lower)h.distance=Math.max(h.distance,midday?30:25);
      h.layer=cold?'scalino e fasce profonde':'littorale e primo scalino';
      if(summer&&edge&&!lower)h.layer='scalino e fascia profonda, risalendo verso il foraggio';
    }
    if(inp.target==='trout'&&inp.waterTemp<=12&&[11,12,1,2,3].includes(m)){
      h.rangeMin=.2;h.rangeMax=2.5;h.depth=midday?1.6:.8;
      h.layer='fascia alta e passaggio del pesce foraggio';
      if(!['harbor','river'].includes(inp.structure))h.distance=Math.max(h.distance,inp.clarity>=7?40:30);
    }
    if(inp.target==='zander' && inp.hour>8 && inp.hour<18){h.rangeMin=Math.max(h.rangeMin,4);h.rangeMax=Math.max(h.rangeMax,10);h.depth=(h.rangeMin+h.rangeMax)/2;}
    if(inp.bottomDepth>0){h.rangeMax=Math.min(h.rangeMax,inp.bottomDepth);h.rangeMin=Math.min(h.rangeMin,h.rangeMax);h.depth=Math.min(h.depth,h.rangeMax);}
    h.rangeMin=+clamp(h.rangeMin,.1,30).toFixed(1);h.rangeMax=+clamp(h.rangeMax,h.rangeMin,30).toFixed(1);h.depth=+clamp(h.depth,h.rangeMin,h.rangeMax).toFixed(1);
    h.explanation=`${SPECIES[inp.target].label}: ${h.layer}. ${h.rangeMin}–${h.rangeMax} m, prima quota ${h.depth} m.`;
    return h;
  };
  const oldCast=estimateCast;
  const headCache=new WeakMap();
  function castAtWeight(l,inp,env,weight){
    const reference={...l,weight};
    const rod=clamp((Number(inp.rodLength)||2.4)/2.4,.65,1.4),line=clamp(1-(Number(inp.lineDiameter||.14)-.14)*1.3,.55,1.12);
    const middle=clamp(oldCast(reference,inp,env)*Math.sqrt(rod)*line,3,125);
    const spread=.25+clamp(inp.windSpeed/80,0,.18);
    return {min:Math.max(2,middle*(1-spread)),max:middle*(1+spread),middle};
  }
  function autoHead(l,inp,key){
    if(key==='weightless')return 0;
    const stamp=[inp.depth,inp.dropDistance,inp.rodMin,inp.rodMax,inp.rodLength,inp.lineDiameter,inp.windSpeed,inp.windDir,inp.waves,inp.structure,inp.rigHardware,inp.location].join('|');
    let cached=headCache.get(inp);
    if(!cached||cached.stamp!==stamp){cached={stamp,env:computeEnvironment(inp),weights:new Map()};headCache.set(inp,cached);}
    const cacheKey=[l.id,key,l.rig?.bodyWeight,l.aero].join('|');
    if(cached.weights.has(cacheKey))return cached.weights.get(cacheKey);
    const body=l.rig?.bodyWeight??l.weight,hardware=Math.max(0,Number(inp.rigHardware||0));
    const control=Math.max(1.5,Math.max(0,inp.depth-1)/1.2*Math.sqrt(Math.max(.7,l.lengthCm/7)));
    const weather=Math.max(0,inp.windSpeed-2)*.30+Math.max(0,(inp.waves||0)-1)*.7+(inp.structure==='river'?1.5:0);
    const required=key==='wacky'?(inp.depth>2?1:0):Math.max(key==='dropshot'?3:key==='carolina'?5:1.5,control+weather);
    const sizes=key==='wacky'?[0,1,1.5,2,3]:key==='ned'?[1.5,2,3,4,5,7]:[1.5,2,3,5,7,10,14,18,21,28,35,40];
    const env=cached.env,distance=Math.max(0,Number(inp.dropDistance)||0);
    const allowed=sizes.filter(g=>g>=required&&(!inp.rodMin||body+g+hardware>=inp.rodMin)&&(!inp.rodMax||body+g+hardware<=inp.rodMax));
    // Prefer the lightest controllable setup with a casting margin, without enlarging the bait.
    let weight=allowed.find(g=>{const cast=castAtWeight(l,inp,env,body+g+hardware);return (cast.middle+cast.max)/2>=distance;});
    weight??=allowed.find(g=>castAtWeight(l,inp,env,body+g+hardware).max>=distance);
    weight??=allowed.at(-1)??sizes.find(g=>g>=required)??sizes.at(-1);
    cached.weights.set(cacheKey,weight);
    return weight;
  }
  function castRange(l,inp,env){return castAtWeight(l,inp,env,rigFor(l,inp).totalWeight);}
  estimateCast=(l,inp,env)=>castRange(l,inp,env).middle;
  depthFit=function(l,inp){
    const d=inp.depth;
    if(surface(l)) return d<=.5?.95:clamp(.75-d*.22,.02,.70);
    if(!Number.isFinite(l.runMin)||!Number.isFinite(l.runMax))return .25;
    let min=Math.max(0,l.runMin),max=Math.max(min,l.runMax);
    if(soft(l)){
      const r=rigFor(l,inp);
      if(r.techniqueValid===false)return .02;
      if(r.style==='dropshot'&&inp.bottomDepth>0){
        const sinAngle=inp.bottomDepth/Math.hypot(inp.bottomDepth,Math.max(0,inp.dropDistance));
        const expected=inp.bottomDepth-r.leaderCm/100*sinAngle,gap=Math.abs(d-expected);
        return gap<=.65?.95:clamp(.95*Math.exp(-(gap-.65)/1.2),.02,.95);
      }
      if(r.style==='wacky'){const max=r.headWeight?5:3.5;return d<=max?.95:clamp(.8*Math.exp(-(d-max)/.8),.02,.8);}
      // Head loading and drag influence control; body mass alone is not a deep-water head.
      const control=r.headWeight/Math.sqrt(Math.max(.7,(l.lengthCm||l.length/10||7)/7));
      max=r.headWeight===null?max:r.headWeight===0?1.2:clamp(1+control*1.2,1.5,30);min=0;
    } else if(metal(l)){
      const loading=l.cat==='vertical jig'?.9:l.cat==='blade bait'?.8:.65;
      max=Math.max(max,Math.min(30,(l.rig?l.rig.catalogWeight:l.weight)*loading));min=0;
    }
    if(d>=min&&d<=max)return .95;
    const gap=d<min?min-d:d-max,tolerance=soft(l)||metal(l)?1.8:/sinking/i.test(l.buoyancy)?1.1:.65;
    return clamp(.85*Math.exp(-gap/tolerance),.02,.85);
  };
  function snagRisk(l,inp){
    if(inp.structure!=='weed')return clamp(l.snag,.03,.95);
    const dense=inp.weedDensity==='dense';
    if(soft(l))return rigFor(l,inp).hookType==='weedless'?(dense?.22:.12):(dense?.94:.65);
    if(surface(l))return dense?.55:.25;
    if(['spinnerbait','chatterbait'].includes(l.cat))return dense?.7:.4;
    return dense?.98:.8;
  }
  function structure(l,inp){
    if(l.cat==='spybait'&&['rock','harbor','drop'].includes(inp.structure))return .88;
    if(inp.structure!=='weed')return structureFit(l,inp.structure);
    const risk=snagRisk(l,inp);
    return clamp(1-risk,.05,.95);
  }
  function assess(l,inp,env){
    const rig=rigFor(l,inp),cast=castRange(l,inp,env),depth=depthFit(l,inp);
    const rod=(!inp.rodMin||rig.totalWeight>=inp.rodMin)&&(!inp.rodMax||rig.totalWeight<=inp.rodMax);
    const reasons=[];
    if(!rod)reasons.push('fuori casting canna');
    if(rig.techniqueValid===false)reasons.push('montaggio non adatto a misura o quota');
    if(inp.dropDistance>cast.max)reasons.push('lancio improbabile');
    else if(inp.dropDistance>cast.min)reasons.push('lancio al limite');
    if(depth<.4)reasons.push('fuori quota');
    const obstructed=inp.structure==='weed'&&inp.weedDensity==='dense'&&snagRisk(l,inp)>.85;
    if(obstructed)reasons.push('amo esposto in erba fitta');
    if(inp.bottomDepth>0&&inp.depth>inp.bottomDepth)reasons.push('quota oltre il fondale');
    return {rig,cast:cast.middle,castRange:cast,depth,rod,reasons,practical:rig.techniqueValid!==false&&rod&&cast.max>=inp.dropDistance&&depth>=.4&&!obstructed&&!(inp.bottomDepth>0&&inp.depth>inp.bottomDepth)};
  }
  function lengthFit(l,inp){
    const ranges={perch:[3,9],chub:[4,7],pike:[10,23],bass:[6,14],zander:[7,15],trout:[5,12],asp:[5,11]};
    let [min,max]=ranges[inp.target]||[4,12];
    const reference={perch:25,chub:35,pike:80,bass:40,zander:55,trout:50,asp:50}[inp.target]||40;
    const scale=Math.pow(clamp(inp.targetSize/reference,.5,1.8),.65);
    min*=scale;max*=scale;
    const center=(min+max)/2,width=(max-min)*.65;
    if(l.lengthCm>=min&&l.lengthCm<=max)return .85+.15*Math.exp(-Math.pow((l.lengthCm-center)/width,2));
    return .85*Math.exp(-Math.abs(l.lengthCm-clamp(l.lengthCm,min,max))/Math.max(1.5,3*scale));
  }
  const oldCategoryTargetBonus=categoryTargetBonus;
  categoryTargetBonus=function(cat,target){return cat==='spybait'?({perch:.96,bass:.96,chub:.72,asp:.65,pike:.55,zander:.58,trout:.75}[target]??.5):oldCategoryTargetBonus(cat,target);};
  lureScore=function(l,inp,env){
    env=env||computeEnvironment(inp);
    const a=assess(l,inp,env),species=categoryTargetBonus(l.cat,inp.target),sf=lengthFit(l,inp),st=structure(l,inp),risk=snagRisk(l,inp);
    const reach=clamp(a.castRange.max/Math.max(1,inp.dropDistance),.05,1);
    const castFit=inp.dropDistance<=a.castRange.min?1:inp.dropDistance<=a.castRange.max?.55+.45*(a.castRange.max-inp.dropDistance)/(a.castRange.max-a.castRange.min):.3*reach;
    const slow=window.GardaTechniques?.approach(inp)==='patient'||inp.waterTemp<12||env.activity<45;
    const style=slow?(soft(l)?.95:l.finesse):.55*l.aggressive+.45*l.finesse;
    const technique=soft(l)&&window.GardaTechniques&&inp.rigStyle?window.GardaTechniques.suitability(l,inp):style;
    const visibility=visibilityFit(l,inp,env),wind=windLureFit({...l,weight:a.rig.totalWeight},inp,env);
    // Species, presentation depth, rig and structure dominate; price has only a tie-breaking role.
    const rigged=soft(l)&&window.GardaTechniques&&inp.rigStyle;
    let total=100*(rigged
      ? .20*species+.12*sf+.18*a.depth+.10*castFit+.12*st+.20*technique+.05*visibility+.03*wind
      : .25*species+.12*sf+.20*a.depth+.12*castFit+.13*st+.09*style+.06*visibility+.03*wind);
    total*=Math.sqrt(a.depth)*Math.pow(reach,1.5)*(a.rod?1:.25);
    const prey=inp.forage||'auto';
    if(prey==='craw'&&l.cat==='soft creature')total+=3;
    if(['perch','baitfish'].includes(prey)&&['soft shad','soft swimbait','glide swimbait','floating minnow','sinking minnow','jointed minnow','suspending jerkbait','sinking jerkbait'].includes(l.cat))total+=2;
    total-=risk*7;
    if(inp.shoreOnly)total*=.9+.1*l.shore;
    if(surface(l)&&inp.waterTemp<12)total*=.6;
    if(inp.target==='chub'&&inp.clarity>=7&&env.light>.5&&a.rig.totalWeight>12)total-=6;
    total+=(inp.budget/100||0)*(l.qpr-70)*.02;
    return {total:clamp(total,0,100),speciesFit:species*100,sizeFit:sf*100,depthFit:a.depth*100,castFit:castFit*100,structFit:st*100,habitatFit:st*100,styleFit:style*100,techniqueFit:technique*100,visFit:visibility*100,windFit:wind*100,qpr:l.qpr,risk:risk*100,expectedCast:a.cast,castRange:a.castRange,locBoost:50,practical:a.practical,limitations:a.reasons,rig:a.rig};
  };
  filteredLures=function(inp){
    if(inp.rodMin&&inp.rodMax&&inp.rodMin>inp.rodMax)return [];
    const env=computeEnvironment(inp);
    const candidates=window.GardaTechniques?LURES.flatMap(l=>window.GardaTechniques.candidates(l,inp)):LURES;
    return candidates.filter(l=>(!inp.rigStyle||inp.rigStyle==='auto'||soft(l))&&(inp.makerFilter==='all'||l.maker===inp.makerFilter)&&(inp.catFilter==='all'||l.cat===inp.catFilter||inp.catFilter==='rig:'+l.rigTechnique)&&(!inp.practicalOnly||assess(l,inp,env).practical));
  };
  retrieveAdvice=function(l,inp,env){
    if(window.GardaTechniques){const p=window.GardaTechniques.presentation(l,inp,env);return (soft(l)?rigText(l,inp)+'. ':'')+p.summary;}
    const cold=inp.waterTemp<12||env.activity<45;
    let advice;
    if(soft(l)){
      if(inp.target==='zander')advice=cold?'Piccoli sollevamenti sul fondo, discesa controllata e pause lunghe.':'Saltelli corti sul fondo e pause; segui la caduta con la lenza.';
      else if(inp.target==='perch')advice=cold?'Trascinamenti brevi e pause sullo scalino.':'Saltelli corti e pause vicino al fondo.';
      else if(inp.target==='pike')advice='Recupero lineare lento lungo il bordo dell’erba, con arresti.';
      else if(inp.target==='bass')advice=cold?'Movimenti brevi vicino alla cover e pause lunghe.':'Recupero sul bordo della cover, alternato a pause.';
      else advice='Recupero lineare lento a mezz’acqua, con pause.';
      return rigText(l,inp)+'. '+advice;
    }
    if(surface(l))return 'Recupero in superficie con pause; lavora nei corridoi liberi dall’erba.';
    if(metal(l))return cold?'Lascia affondare; piccoli sollevamenti, caduta controllata e pause.':'Conta la discesa, poi recupera con brevi accelerazioni e pause.';
    if(l.cat==='spinner')return 'Recupero regolare alla minima velocità che mantiene attiva la paletta.';
    if(['spinnerbait','chatterbait'].includes(l.cat))return 'Recupero costante sopra il bordo dell’erba, senza arare il fondo.';
    return cold?'Recupero lento e twitch brevi, con pause lunghe.':'Recupero lineare alternato a twitch e pause.';
  };
  usageText=function(l,inp,env,s){
    const parts=[];
    if(s.depthFit>=75)parts.push('quota adatta');
    if(s.structFit>=75)parts.push('adatta alla struttura');
    if(inp.structure==='weed')parts.push(soft(l)&&rigFor(l,inp).hookType==='weedless'?'montaggio anti-incaglio':'bordo esterno dell’erba');
    parts.push(...s.limitations);
    return parts.join(' · ');
  };
  function method(l){
    if(l.rigTechnique)return 'rig:'+l.rigTechnique;
    if(soft(l))return 'soft';if(surface(l))return 'surface';if(metal(l))return 'metal';if(l.cat==='spinner')return 'spinner';if(['spinnerbait','chatterbait'].includes(l.cat))return 'cover';if(l.cat.includes('crank'))return 'crank';return 'minnow';
  }
  function selectAlternatives(rows,inp){
    if(!rows.length)return [];
    const selected=[rows[0]],seen=new Set([method(rows[0].l)]),families=new Set([rows[0].l.maker+'|'+rows[0].l.family]);
    // Do not disguise weak alternatives as equivalent or alter the ordered ranking table.
    if(inp.sortBy==='score')for(const row of rows.slice(1)){
      if(row.s.total<rows[0].s.total-10)continue;
      const family=row.l.maker+'|'+row.l.family;
      if(!seen.has(method(row.l))&&!families.has(family)){selected.push(row);seen.add(method(row.l));families.add(family);if(selected.length===3)return selected;}
    }
    for(const row of rows.slice(1)){const family=row.l.maker+'|'+row.l.family;if(!families.has(family)){selected.push(row);families.add(family);if(selected.length===3)break;}}
    return selected;
  }
  // Replace the old soft-bait tip generator used by the existing top/map card wrappers.
  // It is lexical to the legacy script, so remove its duplicate UI fragment after rendering.
  const oldTop=renderTopPick;
  renderTopPick=function(top,inp,env){return oldTop(top,inp,env).replace(/<div class="softbait-tip">[\s\S]*?<\/div>/g,'');};
  const oldSingle=renderSingle;
  renderSingle=function(inp,env,rows){const selected=$('singleVariant').value;populateVariants();if(selected)$('singleVariant').value=selected;oldSingle(inp,env,rows);const box=$('singleBody');if(box)box.innerHTML=box.innerHTML.replace(/<div class="softbait-tip">[\s\S]*?<\/div>/g,'');};
  function resolveProfile(id){
    const base=LURES.find(l=>l.id===id);if(base)return base;
    const split=id.lastIndexOf('--rig-');if(split<0||!window.GardaTechniques)return null;
    const l=LURES.find(l=>l.id===id.slice(0,split));return l?window.GardaTechniques.profile(l,id.slice(split+6)):null;
  }
  function bestPresentation(base,inp,env,key){
    const candidates=window.GardaTechniques?window.GardaTechniques.candidates(base,{...inp,rigStyle:key||'auto'}):[base];
    return candidates.map(l=>({l,s:lureScore(l,inp,env)})).sort((a,b)=>Number(b.s.practical)-Number(a.s.practical)||b.s.total-a.s.total)[0]?.l||base;
  }
  Object.assign(window.GardaSelector,{assess,rigFor,rigText,castRange,autoHead,snagRisk,selectAlternatives,method,resolveProfile,bestPresentation});
  const oldMapCard=renderMapPointCard;
  renderMapPointCard=function(inp,env){return oldMapCard(inp,env).replace(/<div class="softbait-tip">[\s\S]*?<\/div>/g,'');};
  ['rodLength','lineDiameter','jigHead','rigHardware','softHook','weedDensity','bottomDepth'].forEach(id=>{
    $(id).addEventListener('input',()=>{if(['bottomDepth'].includes(id))maybeAutoHabitat();runSimulation();});
  });
  maybeAutoHabitat();
  runSimulation();
})();
