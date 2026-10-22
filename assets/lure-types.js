(function(){
'use strict';
const TYPES={
'floating minnow':['Minnow floating','minnow','Floating',[5,7,10],[4,8,14],[.3,1.5],.82,.5],
'sinking minnow':['Minnow sinking','minnow','Sinking',[5,7,10],[5,10,17],[.5,3],.87,.8],
'jointed minnow':['Minnow snodato','jointed','Floating',[7,10,13],[8,15,25],[.3,2],.72,.4],
'suspending jerkbait':['Jerkbait suspending','jerkbait','Suspending',[7,10,13],[7,14,23],[.6,2],.85,.4],
'sinking jerkbait':['Jerkbait sinking','jerkbait','Sinking',[7,10,13],[10,20,32],[1,4],.87,.8],
'deep jerkbait':['Jerkbait deep suspending','jerkbait','Suspending',[7,10,13],[10,18,28],[2,5],.78,.5],
'crankbait':['Crankbait floating','crankbait','Floating',[4,6,8],[5,11,20],[.5,2.5],.72,.3],
'deep crank':['Crankbait deep floating','crankbait','Floating',[5,7,9],[9,18,30],[2.5,6],.68,.4],
'lipless vibration':['Lipless sinking','lipless','Sinking',[4,6,8],[7,15,25],[.5,8],.9,.85],
'blade bait':['Blade bait','blade','Sinking',[3.5,5,7],[5,12,22],[1,12],.95,.9],
'glide swimbait':['Glide bait snodato','glide','Slow sinking',[10,15,20],[22,45,80],[.3,3],.7,.6],
'soft shad':['Soft shad · paddle tail','soft-shad','Soft',[5,8,12],[1.5,4,10],[.1,15],.76,.8],
'soft swimbait':['Soft swimbait','soft-shad','Soft',[9,14,20],[7,17,35],[.1,15],.72,.8],
'soft jerk':['Soft jerk · fork tail','soft-jerk','Soft',[6,10,14],[2,6,12],[.1,12],.76,.7],
'soft finesse':['Worm / finesse','worm','Soft',[5,8,12],[1.5,3,6],[.1,12],.7,.6],
'soft creature':['Creature / craw','creature','Soft',[5,8,11],[2,5,10],[.1,12],.62,.7],
'spinner':['Spinner · rotante','spinner','Sinking',[3,5,7],[3.5,7,14],[.3,4],.6,.5],
'spinnerbait':['Spinnerbait','spinnerbait','Sinking',[7,11,15],[7,14,28],[.3,5],.55,.65],
'chatterbait':['Chatterbait · bladed jig','chatterbait','Sinking',[7,10,13],[7,14,21],[.5,5],.65,.7],
'spintail':['Spintail','spintail','Sinking',[3,4.5,6],[5,12,22],[.5,12],.94,.9],
'spoon':['Spoon · ondulante','spoon','Sinking',[4,7,10],[5,12,25],[.3,12],.9,.8],
'vertical jig':['Metal jig','metal-jig','Sinking',[4,7,10],[7,18,35],[1,25],.98,.95],
'topwater':['Topwater · popper','topwater','Floating',[5,8,11],[5,12,22],[0,.1],.8,.1],
'buzzbait':['Buzzbait','buzzbait','Surface',[7,10,13],[7,14,21],[0,.1],.55,.1],
'crawler':['Topwater · crawler','topwater','Floating',[5,8,11],[7,15,25],[0,.1],.55,.1]
};
const typeKeys=Object.keys(TYPES).filter(k=>k!=='crawler');

function build(){
const generic=[];
for(const cat of typeKeys){const [name,art,buoy,lengths,weights,run,aero,sink]=TYPES[cat];lengths.forEach((cm,i)=>{
const isSoft=cat.includes('soft'),weight=weights[i];
generic.push({id:'type-'+cat.replaceAll(' ','-')+'-'+i,maker:'Tecnica',family:name,code:cm+' cm',baseCode:cm+' cm',name:name,cat,art,buoyancy:buoy,length:cm*10,lengthCm:cm,weight,runMin:run[0],runMax:run[1],runText:run[1]<.2?'Superficie':run[0]+'–'+run[1]+' m',catalog:cm+' cm · '+weight+' g',source:'Profilo generico per tecnica',notes:'',tags:[],aero,sink,flash:cat==='spoon'||cat==='spinner'?.9:.55,vib:['chatterbait','lipless vibration','blade bait','spinnerbait'].includes(cat)?.9:.5,natural:.8,finesse:isSoft?.9:.65,aggressive:isSoft?.5:.8,snag:isSoft?.5:.65,shore:1,qpr:70,retrieve:'',rig:Object.freeze({catalogWeight:weight,bodyWeight:weight,headWeight:0,preset:false,hookType:isSoft?'unknown':'treble'})});
});}

return generic;
}
window.GardaTypes={definitions:TYPES,keys:typeKeys,build};
})();
