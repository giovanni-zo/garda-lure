(function(){
'use strict';
let cache=null,state={source:'manual',message:'Condizioni modificabili'},request=0,applying=false;
const ids=['airTemp','cloud','pressure','windSpeed','windDir','trend'];
const roundedDirection=n=>String((Math.round(n/45)*45)%360);
function hourKey(inp){return inp.date+'T'+String(inp.hour).padStart(2,'0')+':00';}
function sample(data,inp){
 const i=data.hourly?.time?.indexOf(hourKey(inp));if(i==null||i<0)return null;
 const h=data.hourly,fields=['temperature_2m','cloud_cover','pressure_msl','wind_speed_10m','wind_direction_10m'];
 if(fields.some(k=>!Number.isFinite(h[k]?.[i])))return null;
 const before=h.pressure_msl[Math.max(0,i-3)],delta=h.pressure_msl[i]-before;
 return {airTemp:h.temperature_2m[i],cloud:h.cloud_cover[i],pressure:h.pressure_msl[i],windSpeed:h.wind_speed_10m[i],windDir:roundedDirection(h.wind_direction_10m[i]),trend:delta>1?'rising':delta< -1?'falling':'stable',rain:h.precipitation?.[i]??null,code:h.weather_code?.[i]??0,time:h.time[i]};
}
function sync(){
 if(applying||!cache)return;
 const inp=readInputs();
 if(cache.location!==inp.location||!sample(cache.data,inp)){state={source:'manual',message:'Meteo da aggiornare per questa zona / ora'};cache=null;return;}
 if(state.source==='forecast'){const s=sample(cache.data,inp);applying=true;for(const id of ids)$(id).value=s[id];applying=false;state={source:'forecast',message:'Open-Meteo · '+s.time.replace('T',' '),sample:s};}
}
async function refresh(gps=false){
 const token=++request;state={source:'loading',message:gps?'Cerco la tua posizione…':'Scarico il meteo della zona…'};runSimulation();
 try{
  let loc=readInputs().location,point=MAP_SPOT_COORDS[loc];
  if(gps){
   const pos=await new Promise((resolve,reject)=>navigator.geolocation?navigator.geolocation.getCurrentPosition(resolve,reject,{timeout:12000,maximumAge:120000}):reject(new Error('GPS non disponibile.')));
   const near=nearestMapSpot(pos.coords.longitude,pos.coords.latitude);if(!near||near.d>30)throw new Error('Scegli una zona del Garda: la posizione è troppo lontana.');
   if(token!==request)return;loc=near.key;$('location').value=loc;point=MAP_SPOT_COORDS[loc];maybeAutoHabitat();
  }
  if(!point)throw new Error('Coordinate della zona non disponibili.');
  const inp=readInputs(),params=new URLSearchParams({latitude:point.lat,longitude:point.lon,hourly:'temperature_2m,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,precipitation,weather_code',wind_speed_unit:'ms',timezone:'Europe/Rome',past_days:'7',forecast_days:'16'});
  const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),18000);let response;
  try{response=await fetch('https://api.open-meteo.com/v1/forecast?'+params,{signal:abort.signal,cache:'no-store'});}finally{clearTimeout(timer);}
  if(!response.ok)throw new Error('Meteo non disponibile. Riprova o inseriscilo a mano.');
  const data=await response.json();if(token!==request)return;
  if(readInputs().location!==loc){state={source:'manual',message:'Zona cambiata: aggiorna il meteo.'};runSimulation();return;}
  const s=sample(data,readInputs());if(!s)throw new Error('Giorno fuori dalle previsioni disponibili. Inserisci il meteo a mano.');
  cache={location:loc,data};state={source:'forecast',sample:s};sync();maybeAutoHabitat();runSimulation();
 }catch(e){if(token!==request)return;cache=null;state={source:'manual',error:true,message:e.code===1?'GPS negato. Usa “Meteo zona”.':e.name==='AbortError'?'Meteo non raggiungibile. Inserisci le condizioni a mano.':e.message};runSimulation();}
}
function manual(){if(applying)return;cache=null;request++;state={source:'manual',message:'Condizioni personalizzate'};}
function init(){
 for(const id of ids)$(id).addEventListener('input',()=>{manual();runSimulation();});
 for(const id of ['date','hour','location'])for(const event of ['input','change'])$(id).addEventListener(event,()=>{sync();runSimulation();});
 $('weatherZone').onclick=()=>refresh(false);$('simpleGps').onclick=()=>refresh(true);
}
function describe(code){return code===0?'Sereno':code<=3?'Nuvolosità variabile':code<=48?'Nebbia':code<=67?'Pioggia':code<=77?'Neve':code<=82?'Rovesci':code>=95?'Temporale':'Variabile';}
window.GardaWeather={init,refresh,sync,sample,manual,getState:()=>state,describe};
})();
