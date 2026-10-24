// Regressions from the read-only Garda audit. Missing field conditions remain assumptions.
import {context,root} from './selector.mjs';
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
for(const f of ['lure-colors.js','fishing-techniques.js','rig-art.js'])vm.runInContext(fs.readFileSync(new URL('assets/'+f,root),'utf8'),context);
const result=vm.runInContext(`(()=>{
 const api=window.GardaSelector,t=window.GardaTechniques,colors=window.GardaColors;
 const base={...DEFAULTS,date:'2026-10-18',hour:10,target:'perch',targetSize:25,location:'toscolano',structure:'drop',cloud:100,waterTemp:17,depth:4,dropDistance:35,windSpeed:2,clarity:8,rodMin:5,rodMax:25,rodLength:2.4,lineDiameter:.14,autoRig:true,rigStyle:'auto',jigHead:5,rigHardware:0,softHook:'exposed',weedDensity:'sparse',forage:'auto',practicalOnly:true,catFilter:'all',makerFilter:'all'};
 const ranked=inp=>{const seen=new Set(),env=computeEnvironment(inp);return filteredLures(inp).map(l=>({l,s:lureScore(l,inp,env)})).sort((a,b)=>b.s.total-a.s.total).filter(r=>{const key=t.proposalKey(r.l);return !seen.has(key)&&seen.add(key);});};
 const shad=LURES.find(l=>l.cat==='soft shad'&&l.lengthCm===7),ds=t.profile(shad,'dropshot');
 const near={...base,dropDistance:15},far={...base,dropDistance:45};
 const short=api.rigFor(ds,near),long=api.rigFor(ds,far),windy={...base,windSpeed:6};
 const rows=ranked(base),windRows=ranked(windy),checks={};
 checks.smallBaitReachesTarget=api.assess(ds,base,computeEnvironment(base)).practical&&api.rigFor(ds,base).headWeight>3;
 checks.longerCastAddsLead=long.headWeight>short.headWeight&&long.bodyWeight===short.bodyWeight&&api.assess(ds,far,computeEnvironment(far)).practical;
 checks.mountedWeightWithinRod=long.totalWeight>=far.rodMin&&long.totalWeight<=far.rodMax;
 checks.manualWeightPreserved=api.rigFor(ds,{...base,autoRig:false,jigHead:7}).headWeight===7;
 checks.autumnFinesseAvailable=rows.slice(0,5).some(r=>r.l.rigTechnique==='dropshot')&&windRows.slice(0,5).some(r=>r.l.rigTechnique==='dropshot');
 checks.smallDropShotInWind=windRows.some(r=>r.l.rigTechnique==='dropshot'&&r.l.lengthCm<=9);
 const worm=LURES.find(l=>l.cat==='soft finesse'&&l.lengthCm===10),wacky=t.profile(worm,'wacky'),port={...base,target:'bass',targetSize:30,depth:1,dropDistance:15,structure:'harbor'};
 const w=api.rigFor(wacky,port),manual=api.rigFor(wacky,{...port,autoRig:false,jigHead:2});
 checks.weightedWackyFitsMediumRod=w.headWeight>0&&w.headWeight<=3&&w.totalWeight>=5&&api.assess(wacky,port,computeEnvironment(port)).practical;
 checks.manualWackyRetained=manual.headWeight===2&&manual.totalWeight===6.5;
 checks.wackyGuideAndDiagram=t.presentation(wacky,port,computeEnvironment(port)).steps[0].text.includes('sopra')&&t.render(wacky,port,computeEnvironment(port)).includes('15 cm');
 checks.heavyWackyExcluded=!api.assess(wacky,{...port,autoRig:false,jigHead:10},computeEnvironment(port)).practical;
 const creature=LURES.find(l=>l.cat==='soft creature'&&l.lengthCm===5),bigCreature=LURES.find(l=>l.cat==='soft creature'&&l.lengthCm===12);
 checks.creatureDropShot=t.compatible(creature,'dropshot')&&!t.compatible(bigCreature,'dropshot')&&t.presentation(t.profile(creature,'dropshot'),base,computeEnvironment(base)).key==='dropshot';
 const summer={...base,date:'2026-07-02',waterTemp:23,location:'brenzone',hour:12};
 const habitat=estimatedHabitat(summer),limited=estimatedHabitat({...summer,bottomDepth:6}),feeding=estimatedHabitat({...summer,fishActivity:'active'});
 checks.deepSummerPerch=habitat.rangeMax>=15&&habitat.depth>=7&&habitat.depth<=habitat.rangeMax;
 checks.knownBottomRespected=limited.rangeMax<=6&&limited.depth<=6&&limited.rangeMin<=limited.rangeMax;
 checks.surfaceFeedingChangesSearch=feeding.depth<habitat.depth;
 const winter={...base,target:'trout',targetSize:50,date:'2026-02-15',waterTemp:8,hour:7,location:'malcesine',structure:'rock'},trout=estimatedHabitat(winter);
 checks.winterTroutUpperLayer=trout.depth<=2&&trout.distance>=35;
 const slow={...base,fishActivity:'slow'},active={...base,fishActivity:'active'},minnow=LURES.find(l=>l.cat==='sinking minnow'&&l.lengthCm===7);
 checks.observedActivityUsed=computeEnvironment(slow).activity<computeEnvironment(active).activity&&computeEnvironment(base).activity<=80;
 checks.retrieveAdapts=t.presentation(ds,slow,computeEnvironment(slow)).pause!==t.presentation(ds,active,computeEnvironment(active)).pause&&t.presentation(minnow,active,computeEnvironment(active)).steps[1].text.includes('sostenuto');
 const clear={...base,date:'2023-08-07',location:'garda',hour:20,cloud:20,depth:2,windSpeed:2},sun=computeEnvironment(clear).sunset;
 const dusk1={...clear,hour:sun-.1},dusk2={...clear,hour:sun+.1};
 checks.noAbruptSunsetRepaint=colors.pick(minnow,dusk1,computeEnvironment(dusk1)).key===colors.pick(minnow,dusk2,computeEnvironment(dusk2)).key;
 checks.clearWaterWindKeepsNatural=colors.pick(shad,{...clear,windSpeed:8},computeEnvironment({...clear,windSpeed:8})).key==='baitfish';
 const spy=LURES.filter(l=>l.cat==='spybait');
 checks.spybaitCoverage=spy.length===6&&new Set(spy.map(l=>l.lengthCm)).size===6;
 checks.spybaitGuide=spy.every(l=>t.presentation(l,clear,computeEnvironment(clear)).steps[1].text.includes('senza twitch')&&t.render(l,clear,computeEnvironment(clear)).includes('spybait-low-poly-v9.png'));
 // The automatic lead cache must not retain a result after the scenario is edited.
 const mutable={...near};const initial=api.rigFor(ds,mutable).headWeight;mutable.dropDistance=45;
 checks.editedDistanceRecomputes=api.rigFor(ds,mutable).headWeight>initial;
 let scenarios=0;
 for(const target of Object.keys(SPECIES))for(const fishActivity of ['auto','slow','active'])for(const structure of ['rock','weed','drop'])for(const [rodMin,rodMax] of [[1,10],[5,25],[15,60],[40,150]]){
 const inp={...base,target,targetSize:{perch:25,bass:40,chub:35,asp:50,pike:80,zander:55,trout:50}[target],fishActivity,structure,rodMin,rodMax},eligible=ranked(inp);scenarios++;
 checks.allPowerClassesValid=checks.allPowerClassesValid!==false&&eligible.every(r=>r.s.practical&&Number.isFinite(r.s.total)&&r.s.total>=0&&r.s.total<=100&&r.s.rig.totalWeight>=rodMin&&r.s.rig.totalWeight<=rodMax);
 }
 return {checks,scenarios,example:{toscolano:rows.slice(0,3).map(r=>({name:r.l.family,size:r.l.lengthCm,head:r.s.rig.headWeight,score:Math.round(r.s.total)})),brenzone:habitat,wacky:manual}};
})()`,context);
for(const [name,passed] of Object.entries(result.checks))assert.equal(Boolean(passed),true,name);
console.log(Object.keys(result.checks).length+' Garda audit checks passed across '+result.scenarios+' scenarios.');
console.log(JSON.stringify(result.example,null,2));
