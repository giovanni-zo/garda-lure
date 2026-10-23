// Run with Node.js: node tests/selector.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
const html=fs.readFileSync(new URL('index.html',root),'utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
scripts.forEach((s,i)=>new vm.Script(s,{filename:'inline-'+i}));
const els={};
const el=id=>els[id] ||= {value:'',checked:true,style:{},options:[],classList:{toggle(){}},closest(){return null},addEventListener(){},innerHTML:'',textContent:''};
const context=vm.createContext({console:{log(){},warn(){}},Intl,Date,Math,document:{getElementById:el,querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>el('new')},window:{addEventListener(){}},setTimeout(){},localStorage:{getItem(){return null},setItem(){},removeItem(){}},navigator:{},location:{protocol:'http:'}});
vm.runInContext(fs.readFileSync(new URL('assets/lure-types.js',root),'utf8'),context);
vm.runInContext(scripts[0].replace(/^init\(\);$/m,''),context);
context.document.querySelector=()=>el('subtitle');
vm.runInContext(fs.readFileSync(new URL('assets/lure-selector.js',root),'utf8').replace(/  runSimulation\(\);\n\}\)\(\);\s*$/,'})();'),context);
vm.runInContext(fs.readFileSync(new URL('assets/recommendation-engine.js',root),'utf8').replace(/  maybeAutoHabitat\(\);\n  runSimulation\(\);\n\}\)\(\);\s*$/,'})();'),context);
const checks=vm.runInContext(`(()=>{
 const inp={...DEFAULTS,date:'2026-10-22',depth:2,dropDistance:18,rodMin:3,rodMax:12,groupFamilies:true,practicalOnly:true};
 const env=computeEnvironment(inp), rows=sortScored(filteredLures(inp).map(l=>({l,s:lureScore(l,inp,env)})),inp);
 const checks={
   nonEmpty:rows.length>0,
   constraints:rows.every(r=>r.s.rig.totalWeight>=3&&r.s.rig.totalWeight<=12&&r.s.practical&&Number.isFinite(r.s.total)),
   sorted:rows.every((r,i)=>!i||rows[i-1].s.total>=r.s.total),
   families:new Set(rows.map(r=>r.l.maker+'|'+r.l.family)).size===rows.length,
   invalidRod:filteredLures({...inp,rodMin:100,rodMax:1}).length===0,
   deepSurface:depthFit({cat:'buzzbait',runMin:0,runMax:0},{depth:8})<.1,
   finiteVariableDepth:depthFit({cat:'soft shad',runMin:.1,runMax:3,buoyancy:'Sinking'},{depth:14})<.1,
   farCast:!window.GardaSelector.assess(rows[0].l,{...inp,dropDistance:110},env).practical,
   noonStart:legalWarning({...inp,target:'pike',date:'2026-02-22',hour:12}).type==='red',
   beforeStart:legalWarning({...inp,target:'pike',date:'2026-02-22',hour:11}).type!=='red',
   noonEnd:legalWarning({...inp,target:'pike',date:'2026-04-15',hour:12}).type!=='red',
   winterClosure:legalWarning({...inp,target:'trout',date:'2026-12-01'}).type==='red',
   plainUsage:!usageText(rows[0].l,inp,env,rows[0].s).includes('<'),
   winterLight:computeEnvironment({...inp,date:'2026-12-21'}).sunset-computeEnvironment({...inp,date:'2026-12-21'}).sunrise>8
 };
 const api=window.GardaSelector;
 const preset={...LURES.find(l=>l.cat==='soft shad'),rig:{catalogWeight:48,bodyWeight:33,headWeight:15,preset:true,hookType:'exposed'}};
 const r=api.rigFor(preset,inp);
 checks.presetRig=r.headWeight===15&&r.bodyWeight===33&&r.totalWeight===48;
 checks.correctRetrieve=retrieveAdvice(preset,{...inp,target:'pike'},env).includes('15.0 g')&&!retrieveAdvice(preset,inp,env).includes('3-7');
 const bare=LURES.find(l=>l.cat==='soft shad'&&!l.rig.preset);
 checks.bodyPlusHead=api.rigFor(bare,{...inp,jigHead:7}).totalWeight===bare.rig.bodyWeight+7;
 checks.hardware=api.rigFor(bare,{...inp,jigHead:7,rigHardware:1}).totalWeight===bare.rig.bodyWeight+8;
 checks.weightless=api.rigFor(bare,{...inp,jigHead:0}).headWeight===0;
 checks.deepHead=depthFit(bare,{...inp,depth:8,jigHead:14})>depthFit(bare,{...inp,depth:8,jigHead:2});
 const winter=estimatedHabitat({...inp,target:'perch',date:'2026-01-20',waterTemp:8,structure:'drop'});
 const summer=estimatedHabitat({...inp,target:'perch',date:'2026-07-20',waterTemp:23,structure:'drop'});
 checks.seasonalDepth=winter.depth>summer.depth&&winter.rangeMax>10;
 checks.bottomLimit=estimatedHabitat({...inp,target:'perch',date:'2026-01-20',waterTemp:8,bottomDepth:4}).rangeMax<=4;
 checks.noBelowBottom=!api.assess(bare,{...inp,depth:8,bottomDepth:4},env).practical;
 const sparse={...inp,structure:'weed',weedDensity:'sparse',softHook:'exposed'};
 const weedless={...sparse,weedDensity:'dense',softHook:'weedless'};
 checks.weedlessAdvantage=api.snagRisk(bare,weedless)<api.snagRisk(bare,{...weedless,softHook:'exposed'});
 checks.denseExposed=!api.assess(preset,{...inp,structure:'weed',weedDensity:'dense'},env).practical;
 checks.targetRetrieve=!retrieveAdvice(bare,{...inp,target:'zander'},env).includes('luccio')&&retrieveAdvice(bare,{...inp,target:'zander'},env).includes('fondo');
 const range=api.castRange(rows[0].l,inp,env);
 checks.marginalReach=api.assess(rows[0].l,{...inp,dropDistance:(range.middle+range.max)/2},env).practical;
 checks.longRod=api.castRange(rows[0].l,{...inp,rodLength:3},env).middle>api.castRange(rows[0].l,{...inp,rodLength:1.8},env).middle;
 checks.thickLine=api.castRange(rows[0].l,{...inp,lineDiameter:.3},env).middle<api.castRange(rows[0].l,{...inp,lineDiameter:.1},env).middle;
 const mixed=['soft shad','spoon','sinking minnow','soft shad'].map((cat,i)=>({l:{maker:'Test',family:'Family'+i,cat},s:{total:90-i}}));
 checks.diverseMethods=new Set(api.selectAlternatives(mixed,inp).map(x=>api.method(x.l))).size===3;
 checks.firstChoice=api.selectAlternatives(mixed,inp)[0]===mixed[0];
 const pressureA={...inp,pressure:985,trend:'falling',moon:0},pressureB={...inp,pressure:1038,trend:'rising',moon:100};
 checks.atmosphereBound=Math.abs(lureScore(rows[0].l,pressureA,computeEnvironment(pressureA)).total-lureScore(rows[0].l,pressureB,computeEnvironment(pressureB)).total)<5;
 const assembled={...preset,rig:{catalogWeight:7,bodyWeight:null,headWeight:null,preset:true,hookType:'weedless'}};
 checks.preassembledWeight=api.rigFor(assembled,{...inp,jigHead:20}).totalWeight===assembled.rig.catalogWeight;
 const texas={...preset,rig:{catalogWeight:13.5,bodyWeight:6.5,headWeight:7,preset:true,hookType:'weedless'}};
 checks.texasRig=api.rigFor(texas,inp).headWeight===7&&api.rigFor(texas,inp).hookType==='weedless';
 for(const target of Object.keys(SPECIES)) for(const depth of [0,2,8,14]) for(const windSpeed of [0,12,24]){
   const test={...inp,target,depth,windSpeed},e=computeEnvironment(test);
   checks.finiteScores=(checks.finiteScores!==false)&&LURES.every(l=>{const s=lureScore(l,test,e);return Number.isFinite(s.total)&&s.total>=0&&s.total<=100;});
 }
 return checks;
})()`,context);
for(const [name,passed] of Object.entries(checks)) assert.equal(passed,true,name);
console.log(Object.keys(checks).length+' recommendation regression checks passed.');

export { context, root };
