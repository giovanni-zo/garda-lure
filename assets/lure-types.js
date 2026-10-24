(function(){
'use strict';
const TYPES={
'floating minnow':['Minnow floating','minnow-natural-v8','Floating',[5,7,10],[4,8,14],[.3,1.5],.82,.5],
'sinking minnow':['Minnow sinking','minnow-natural-v8','Sinking',[5,7,10],[5,10,17],[.5,3],.87,.8],
'jointed minnow':['Minnow snodato','jointed','Floating',[7,10,13],[8,15,25],[.3,2],.72,.4],
'suspending jerkbait':['Jerkbait suspending','jerkbait','Suspending',[7,10,13],[7,14,23],[.6,2],.85,.4],
'sinking jerkbait':['Jerkbait sinking','jerkbait','Sinking',[7,10,13],[10,20,32],[1,4],.87,.8],
'deep jerkbait':['Jerkbait deep suspending','jerkbait-deep-v8','Suspending',[7,10,13],[10,18,28],[2,5],.78,.5],
'crankbait':['Crankbait floating','crankbait-shallow-v8','Floating',[4,6,8],[5,11,20],[.5,2.5],.72,.3],
'deep crank':['Crankbait deep floating','crankbait-deep-v8','Floating',[5,7,9],[9,18,30],[2.5,6],.68,.4],
'lipless vibration':['Lipless sinking','lipless','Sinking',[4,6,8],[7,15,25],[.5,8],.9,.85],
'blade bait':['Blade bait','blade','Sinking',[3.5,5,7],[5,12,22],[1,12],.95,.9],
'glide swimbait':['Glide bait snodato','glide','Slow sinking',[10,15,20],[22,45,80],[.3,3],.7,.6],
'soft shad':['Soft shad · paddle tail','soft-shad-bare-v8','Soft',[5,8,12],[1.5,4,10],[.1,15],.76,.8],
'soft swimbait':['Soft swimbait','soft-swimbait-v8','Soft',[9,14,20],[7,17,35],[.1,15],.72,.8],
'soft jerk':['Soft jerk · fork tail','soft-jerk-bare-v8','Soft',[6,10,14],[2,6,12],[.1,12],.76,.7],
'soft finesse':['Worm / finesse','worm-bare-v8','Soft',[5,8,12],[1.5,3,6],[.1,12],.7,.6],
'soft creature':['Creature / craw','creature-bare-v8','Soft',[5,8,11],[2,5,10],[.1,12],.62,.7],
'spinner':['Spinner · rotante','spinner','Sinking',[3,5,7],[3.5,7,14],[.3,4],.6,.5],
'spinnerbait':['Spinnerbait','spinnerbait-white-chartreuse-v8','Sinking',[7,11,15],[7,14,28],[.3,5],.55,.65],
'chatterbait':['Chatterbait · bladed jig','chatterbait-white-chartreuse-v8','Sinking',[7,10,13],[7,14,21],[.5,5],.65,.7],
'spintail':['Spintail','spintail','Sinking',[3,4.5,6],[5,12,22],[.5,12],.94,.9],
'spybait':['Spybait · doppia elica','spybait-low-poly-v9','Slow sinking',[4,7,10],[3,8,18],[.5,4],.85,.65],
'spoon':['Spoon · ondulante','spoon','Sinking',[4,7,10],[5,12,25],[.3,12],.9,.8],
'vertical jig':['Metal jig','metal-jig','Sinking',[4,7,10],[7,18,35],[1,25],.98,.95],
'topwater':['Topwater · popper','topwater','Floating',[5,8,11],[5,12,22],[0,.1],.8,.1],
'buzzbait':['Buzzbait','buzzbait','Surface',[7,10,13],[7,14,21],[0,.1],.55,.1],
'crawler':['Topwater · crawler','topwater','Floating',[5,8,11],[7,15,25],[0,.1],.55,.1]
};
const typeKeys=Object.keys(TYPES).filter(k=>k!=='crawler');

const SIZES={"floating minnow":[[3,5,7,9,11,13],[2,4,7,11,16,23]],"sinking minnow":[[3,5,7,9,11,14],[3,5,10,15,22,35]],"jointed minnow":[[5,7,9,11,14,18],[4,8,12,19,32,58]],"suspending jerkbait":[[5,7,9,11,13,15],[4,7,11,16,24,35]],"sinking jerkbait":[[5,7,9,11,14,17],[5,10,16,24,42,65]],"deep jerkbait":[[6,8,10,12,14,16],[7,11,17,25,36,50]],"crankbait":[[2.5,3.5,4.5,5.5,7,9],[2,4,7,11,19,32]],"deep crank":[[4,5,6,7,8,10],[6,10,14,20,28,45]],"lipless vibration":[[3,4,5,6,7,9],[3,7,11,16,23,38]],"blade bait":[[2.5,3.5,4.5,5.5,6.5,8],[3,5,9,14,21,32]],"glide swimbait":[[8,10,13,16,20,25],[12,22,34,52,85,145]],"soft shad":[[3,5,7,9,12,15],[0.5,1.5,3,5.5,11,20]],"soft swimbait":[[7,10,13,16,20,25],[3,8,14,23,40,75]],"soft jerk":[[5,7,9,11,14,17],[1,2.5,4,7,12,20]],"soft finesse":[[4,6,8,10,13,16],[0.8,1.6,3,4.5,7,11]],"soft creature":[[3.5,5,6.5,8,10,12],[1,2,3.5,5.5,9,14]],"spinner":[[2,3,4,5,6,8],[1.5,3,5,8,12,20]],"spinnerbait":[[5,7,9,11,14,18],[4,7,10.5,14,21,35]],"chatterbait":[[5,7,9,11,13,16],[4,7,10.5,14,21,28]],"spintail":[[2,3,4,5,6,7],[3,5,9,14,22,32]],"spoon":[[3,4,5.5,7,9,12],[3,5,9,14,24,40]],"vertical jig":[[3,4,5,7,9,12],[3,7,12,20,35,60]],"topwater":[[3.5,5,6.5,8,10,13],[3,5,9,14,22,38]],"buzzbait":[[5,7,9,11,13,16],[4,7,10.5,14,21,28]]};
SIZES.spybait=[[3,4.5,6,7.5,9,11],[2,4,6.5,10,15,23]];
function build(){
const generic=[];
for(const cat of typeKeys){const [name,art,buoy,oldLengths,oldWeights,run,aero,sink]=TYPES[cat];const [lengths,weights]=SIZES[cat];lengths.forEach((cm,i)=>{
const isSoft=cat.includes('soft'),weight=weights[i];
const hardDiver=/minnow|jerkbait|crank/.test(cat),scale=hardDiver?Math.pow(cm/oldLengths[1],.5):1;
const runLo=+(run[0]*scale).toFixed(1),runHi=+(run[1]*scale).toFixed(1);
const isMetal=['spinner','spoon','spintail','blade bait','vertical jig'].includes(cat),isVib=['chatterbait','lipless vibration','blade bait','spinnerbait'].includes(cat);
generic.push({id:'type-'+cat.replaceAll(' ','-')+'-'+i,maker:'Tecnica',family:name,code:cm+' cm',baseCode:cm+' cm',name:name,cat,art,buoyancy:buoy,length:cm*10,lengthCm:cm,weight,runMin:runLo,runMax:runHi,runText:run[1]<.2?'Superficie':runLo+'–'+runHi+' m',catalog:cm+' cm · '+weight+' g',source:'Profilo generico per tecnica',notes:'',tags:[],aero,sink,flash:isMetal?.9:isSoft?.25:.55,vib:isVib?.9:cat==='spinner'?.75:isSoft?.35:.5,natural:isSoft?.95:isMetal?.4:.85,finesse:isSoft?.92:isVib?.35:.65,aggressive:isVib?.95:isSoft?.5:.8,snag:isSoft?.5:.65,shore:1,qpr:70,retrieve:'',rig:Object.freeze({catalogWeight:weight,bodyWeight:weight,headWeight:0,preset:false,hookType:isSoft?'unknown':'treble'})});
if(cat==='spybait')Object.assign(generic.at(-1),{finesse:.95,aggressive:.35,vib:.25,natural:.95});
});}

return generic;
}
window.GardaTypes={definitions:TYPES,keys:typeKeys,sizes:SIZES,build};
})();
