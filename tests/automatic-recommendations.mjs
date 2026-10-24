import {context,root} from './selector.mjs';
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
for(const f of ['lure-colors.js','fishing-techniques.js'])vm.runInContext(fs.readFileSync(new URL('assets/'+f,root),'utf8'),context);
const result=vm.runInContext(`(()=>{
 const api=window.GardaTechniques,selector=window.GardaSelector;
 const base={...DEFAULTS,date:'2026-07-15',hour:13,target:'perch',targetSize:25,waterTemp:22,windSpeed:2,clarity:8,depth:3,dropDistance:8,rodMin:0,rodMax:0,autoRig:true,rigStyle:'auto',jigHead:5,softHook:'exposed',weedDensity:'sparse',forage:'auto',practicalOnly:true,catFilter:'all',makerFilter:'all'};
 const ranked=inp=>{const env=computeEnvironment(inp);return filteredLures(inp).map(l=>({l,s:lureScore(l,inp,env)})).sort((a,b)=>b.s.total-a.s.total);};
 const softRank=inp=>ranked(inp).filter(r=>r.l.rigTechnique);
 const all=filteredLures(base),checks={
  catalogCoverage:LURES.length===150,
  hardAndSoftCompete:all.some(l=>!l.cat.includes('soft'))&&all.some(l=>l.rigTechnique==='dropshot'),
  independentOptions:new Set(filteredLures({...base,depth:1}).filter(l=>l.rigTechnique).map(l=>l.rigTechnique)).size===7,
  uniqueProfiles:new Set(all.map(l=>l.id)).size===all.length,
  noBareSoftInRanking:all.filter(l=>l.cat.includes('soft')).every(l=>l.rigTechnique),
  optionalTechniqueFilter:filteredLures({...base,catFilter:'rig:dropshot'}).length>0&&filteredLures({...base,catFilter:'rig:dropshot'}).every(l=>l.rigTechnique==='dropshot')
 };
 const shad=LURES.find(l=>l.cat==='soft shad'&&l.lengthCm===7),drop=api.profile(shad,'dropshot'),texas=api.profile(shad,'texas');
 const inp={...base,structure:'weed',weedDensity:'dense'},env=computeEnvironment(inp);
 checks.resolveProposal=selector.resolveProfile(drop.id).rigTechnique==='dropshot'&&selector.resolveProfile(drop.id).baseId===shad.id;
 checks.noUnknownProposal=selector.resolveProfile(shad.id+'--rig-invalid')===null;
 checks.proposalKeepsRig=selector.rigFor(drop,base).style==='dropshot'&&selector.rigFor(texas,base).style==='texas';
 checks.assembledWeight=selector.rigFor(drop,base).totalWeight===shad.rig.bodyWeight+selector.rigFor(drop,base).headWeight;
 checks.compareRigs=api.proposalKey(drop)!==api.proposalKey(texas)&&api.proposalKey(drop)===api.proposalKey(api.profile(LURES.find(l=>l.cat==='soft finesse'),'dropshot'));
 checks.denseWeedHook=lureScore(texas,inp,env).practical&&!lureScore(drop,inp,env).practical;
 checks.coldBottomOptions=['ned','dropshot'].includes(softRank({...base,waterTemp:8,structure:'drop',depth:5})[0].l.rigTechnique);
 checks.weedRecommendation=softRank({...base,target:'bass',targetSize:40,structure:'weed',weedDensity:'dense',depth:2})[0].l.rigTechnique==='texas';
 checks.harborRecommendation=softRank({...base,target:'bass',targetSize:40,structure:'harbor',depth:1.8})[0].l.rigTechnique==='wacky';
 checks.shallowRecommendation=softRank({...base,target:'bass',targetSize:40,structure:'sand',depth:.7})[0].l.rigTechnique==='weightless';
 checks.dropRecommendation=softRank({...base,target:'bass',targetSize:40,structure:'drop',depth:5})[0].l.rigTechnique==='carolina';
 checks.pikeSwimRecommendation=softRank({...base,target:'pike',targetSize:80,structure:'drop',depth:4})[0].l.rigTechnique==='jig';
 checks.noSuspendedDropShot=!filteredLures({...base,depth:3,bottomDepth:10,catFilter:'rig:dropshot'}).length;
 checks.noDeepWeightless=!filteredLures({...base,depth:5,catFilter:'rig:weightless'}).length;
 checks.noOversizedDropShot=!api.profile(LURES.find(l=>l.cat==='soft shad'&&l.lengthCm===15),'dropshot');
 const worm=LURES.find(l=>l.cat==='soft finesse'&&l.lengthCm===8);
 checks.catalogRecommendsRig=selector.bestPresentation(worm,{...base,target:'bass',structure:'harbor',depth:1.8},computeEnvironment(base)).rigTechnique==='wacky';
 checks.exactGuide=api.presentation(drop,base,computeEnvironment(base)).key==='dropshot'&&api.render(drop,base,computeEnvironment(base)).includes('Drop shot');
 let scenarios=0,profiles=0;
 for(const target of Object.keys(SPECIES))for(const structure of ['rock','weed','harbor','drop','sand','river','cliff'])for(const [depth,waterTemp,windSpeed] of [[1,22,1],[5,8,3],[10,15,9]]){
  const test={...base,target,targetSize:{perch:25,bass:40,chub:35,asp:50,pike:80,zander:55,trout:50}[target],structure,depth,waterTemp,windSpeed,rodMin:3,rodMax:35},rows=ranked(test);scenarios++;profiles+=rows.length;
  checks.validMountedCandidates=checks.validMountedCandidates!==false&&rows.every(r=>r.s.practical&&r.s.rig.totalWeight>=3&&r.s.rig.totalWeight<=35&&Number.isFinite(r.s.total));
  checks.profileRoundTrip=checks.profileRoundTrip!==false&&rows.every(r=>selector.resolveProfile(r.l.id)?.id===r.l.id);
 }
 return {checks,scenarios,profiles};
})()`,context);
for(const [name,passed] of Object.entries(result.checks))assert.equal(Boolean(passed),true,name);
const ui=fs.readFileSync(new URL('assets/simple-fishing.js',root),'utf8');
assert.match(ui,/<input id="rigStyle" type="hidden" value="auto">/);
assert.ok(!ui.includes('GardaTechniques.rigOptions')&&!ui.includes("id==='detailRig'"));
assert.match(ui,/GardaTechniques.proposalKey/);
console.log((Object.keys(result.checks).length+3)+' automatic recommendation checks passed across '+result.scenarios+' scenarios and '+result.profiles+' eligible combinations.');
