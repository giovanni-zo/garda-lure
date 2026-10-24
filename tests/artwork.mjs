import {context,root} from './selector.mjs';
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
for(const f of ['lure-colors.js','fishing-techniques.js','rig-art.js'])vm.runInContext(fs.readFileSync(new URL('assets/'+f,root),'utf8'),context);
const result=vm.runInContext(`(()=>{
 const inp={...DEFAULTS,date:'2026-07-15',hour:13,target:'perch',clarity:8,cloud:15,windSpeed:2,waterTemp:22,depth:3,dropDistance:12,rodMin:0,rodMax:0,autoRig:true,rigStyle:'auto',softHook:'exposed',weedDensity:'sparse'},colors=window.GardaColors,art=window.GardaRigArt,tech=window.GardaTechniques,checks={},env=computeEnvironment(inp);
 const types=tech.lureTypes(LURES),covers=[],filenames=new Set();let count=0;
 for(const type of types.filter(t=>t.rigTechnique)){
  const l=type.variants[0],c=colors.pick(l,inp,env),svg=art.cover(l,inp,c);covers.push({title:l.family,color:c.label,svg});
  checks.all24Mounted=types.filter(t=>t.rigTechnique).length===24;
  for(const v of type.variants)for(const [depth,clarity] of [[1,9],[4,5],[8,2]]){
   const scenario={...inp,depth,clarity},e=computeEnvironment(scenario),palette=colors.pick(v,scenario,e);
   for(const c of [palette,palette.alternative]){
    const html=art.cover(v,scenario,c);count++;
    checks.valid=checks.valid!==false&&!/undefined|NaN/.test(html);
    checks.rigMatches=checks.rigMatches!==false&&html.includes('data-rig="'+type.rigTechnique+'"');
    checks.plasticMatches=checks.plasticMatches!==false&&html.includes('data-plastic="'+v.cat+'"');
    checks.paletteMatches=checks.paletteMatches!==false&&html.includes('data-palette="'+c.key+'"')&&html.includes(c.label.replace(/&/g,'&amp;'));
    checks.sharedTreatment=checks.sharedTreatment!==false&&html.includes('style="filter:'+colors.treatment(v,c)+'"');
    checks.creatureTail=checks.creatureTail!==false&&(v.cat!=='soft creature'||html.includes('data-rig-entry="tail"'));
    filenames.add(colors.image(v,c).slice(2).split('?')[0]);
   }
  }
 }
 const worm=LURES.find(l=>l.cat==='soft finesse'&&l.lengthCm===6),c=colors.palettes.pumpkin;
 const coversByRig=Object.fromEntries(Object.keys(tech.rigs).map(rig=>[rig,art.cover(tech.profile(worm,rig),{...inp,autoRig:false,jigHead:0},{...c,key:'pumpkin'})]));
 for(const [rig,part] of Object.entries({jig:'jig-head',dropshot:'terminal-sinker',texas:'bullet',carolina:'swivel',ned:'mushroom-head',wacky:'hook',weightless:'hook'}))checks[rig+'Hardware']=coversByRig[rig].includes('data-part="'+part+'"');
 checks.carolinaBead=coversByRig.carolina.includes('data-part="bead"');
 checks.noWeightlessLead=!/data-part="(bullet|jig-head|terminal-sinker|split-shot|mushroom-head)"/.test(coversByRig.weightless);
 checks.wackyShotConditional=!coversByRig.wacky.includes('split-shot')&&art.cover(tech.profile(worm,'wacky'),{...inp,autoRig:false,jigHead:1},{...c,key:'pumpkin'}).includes('split-shot');
 const weedlessJig=art.cover(tech.profile(worm,'jig'),{...inp,softHook:'weedless'},{...c,key:'pumpkin'});
 checks.weedlessJig=weedlessJig.includes('data-hook-type="weedless"')&&!weedlessJig.includes('M249 117 L226 117 L218 98');
 const jointed=LURES.find(l=>l.cat==='jointed minnow');checks.jointedRepaint=colors.treatment(jointed,{key:'baitfish'})==='url(#garda-color-baitfish)';
 checks.oliveMask=colors.filterMarkup('baitfish').includes('6 0 -6')&&colors.filterMarkup('baitfish').includes('-6 0 6');
 const swatches=Object.entries(colors.palettes).map(([key,p])=>({title:p.label,key,src:colors.image(jointed,{key}),filter:colors.treatment(jointed,{key})}));
 const extras=['spinnerbait','spintail','spybait','soft shad'].flatMap(cat=>['baitfish','chartreuse','gold','blackblue'].map(key=>{const l=LURES.find(l=>l.cat===cat);return {title:l.family+' · '+colors.palettes[key].label,key,src:colors.image(l,{key}),filter:colors.treatment(l,{key})};}));
 return {checks,count,covers,swatches,extras,filenames:[...filenames]};
})()`,context);
for(const [name,passed] of Object.entries(result.checks))assert.equal(Boolean(passed),true,name);
for(const file of result.filenames)assert.ok(fs.existsSync(new URL(file,root)),file);
console.log(Object.keys(result.checks).length+' artwork checks passed across '+result.count+' mounted covers.');
if(process.argv.includes('--preview')){
 const file=new URL('../../output/artwork-9.3.html',import.meta.url);
 const tile=x=>`<article><div class="picture">${x.svg||`<img src="${x.src}" style="filter:${x.filter}">`}</div><h2>${x.title}</h2>${x.color||''}</article>`;
 fs.writeFileSync(file,`<!doctype html><html><head><meta charset="utf-8"><base href="../garda_lure_pwa_gps_meteo_v2/"><title>Artwork checks · Garda Lure</title><style>body{font:16px system-ui;color:#184f67;background:#d9eef2;margin:30px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px}article{background:#ffffffa0;border:1px solid white;border-radius:24px;padding:14px}h2{font-size:15px}.picture{height:190px}.picture>svg,.picture>img{height:100%;width:100%;object-fit:contain}h1{margin-top:35px}</style></head><body><h1>Mounted covers · 24 combinations</h1><div class="grid">${result.covers.map(tile).join('')}</div><h1>Jointed minnow · all palettes</h1><div class="grid">${result.swatches.map(tile).join('')}</div><h1>Other bodies and hardware</h1><div class="grid">${result.extras.map(tile).join('')}</div><script src="./assets/lure-colors.js?v=9.3"></script><script>GardaColors.installFilters()</script></body></html>`);
 console.log('Preview: '+file.pathname);
}
