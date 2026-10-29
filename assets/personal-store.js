/* Device-local tackle and catch records. Photos live separately in IndexedDB. */
(function(){
'use strict';
const KEY='garda-personal-v1';
const species={perch:'Persico reale',bass:'Black bass',chub:'Cavedano',asp:'Aspio',pike:'Luccio',zander:'Lucioperca',trout:'Trota lacustre'};
const copy=x=>JSON.parse(JSON.stringify(x));
const today=()=>{const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(p=>[p.type,p.value]));return p.year+'-'+p.month+'-'+p.day;};
const uid=()=>globalThis.crypto?.randomUUID?.()||'garda-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
const empty=()=>({version:1,inventory:[],catches:[],settings:{onlyOwned:false}});
function createStore({storage,resolve,choices,method,id=uid,currentDate=today,key=KEY}){
 let state=empty(),loadError=null,raw=null;const listeners=new Set();
 const fail=message=>{throw new Error(message);};
 const checkedId=value=>{if(value!==undefined&&(!/^[A-Za-z0-9_-]{1,100}$/.test(value)||typeof value!=='string'))fail('Identificativo non valido.');return value||id();};
 const inventoryItem=item=>{
  const l=resolve(item.profileId);if(!l)fail('Tipo o misura dell’esca non riconosciuti.');
  if(!choices(l).includes(item.colorKey))fail('Questo colore non è disponibile per l’esca.');
  const quantity=Number(item.quantity??1);if(!Number.isInteger(quantity)||quantity<1||quantity>999)fail('La quantità deve essere tra 1 e 999.');
  return {id:checkedId(item.id),profileId:l.id,colorKey:item.colorKey,quantity};
 };
 const catchItem=item=>{
  if(!Object.hasOwn(species,item.species))fail('Scegli una specie.');
  if(!validDate(item.date)||item.date>currentDate())fail('Inserisci una data valida, non futura.');
  const lengthCm=item.lengthCm===''||item.lengthCm==null?null:Number(item.lengthCm);
  if(lengthCm!==null&&(!Number.isFinite(lengthCm)||lengthCm<1||lengthCm>300))fail('La lunghezza deve essere tra 1 e 300 cm.');
  let profileId=null,colorKey=null,lureName='',lureSize=null;
  if(item.profileId){const l=resolve(item.profileId);if(!l)fail('Esca della cattura non riconosciuta.');if(!choices(l).includes(item.colorKey))fail('Colore della cattura non riconosciuto.');profileId=l.id;colorKey=item.colorKey;lureName=l.family;lureSize=l.lengthCm;}
  const photoId=typeof item.photoId==='string'&&/^[\w-]{1,100}$/.test(item.photoId)?item.photoId:null;
  return {id:checkedId(item.id),species:item.species,date:item.date,lengthCm,profileId,colorKey,lureName,lureSize,photoId,zone:typeof item.zone==='string'?item.zone.slice(0,140):'',shareZone:item.shareZone===true,createdAt:typeof item.createdAt==='string'?item.createdAt:new Date().toISOString()};
 };
 function validate(value){
  if(!value||value.version!==1||!Array.isArray(value.inventory)||!Array.isArray(value.catches))fail('Backup Garda Lure non valido.');
  if(value.inventory.length>3000||value.catches.length>10000)fail('Il backup contiene troppi elementi.');
  const inventory=value.inventory.map(inventoryItem),catches=value.catches.map(catchItem),keys=inventory.map(x=>x.profileId+'::'+x.colorKey);
  if(new Set(keys).size!==keys.length||new Set(inventory.map(x=>x.id)).size!==inventory.length||new Set(catches.map(x=>x.id)).size!==catches.length)fail('Il backup contiene elementi duplicati.');
  return {version:1,inventory,catches,settings:{onlyOwned:inventory.length>0&&value.settings?.onlyOwned===true}};
 }
 try{raw=storage.getItem(key);if(raw)state=validate(JSON.parse(raw));}catch(error){loadError='I dati salvati non sono leggibili. Puoi esportarli e ripristinare un backup.';}
 function commit(next,recover=false){
  if(loadError&&!recover)fail(loadError);
  const clean=validate(next);
  let current;try{current=storage.getItem(key);}catch(error){fail('Archivio del dispositivo non disponibile.');}
  if(current!==raw)fail('I dati sono cambiati in un’altra scheda. Ricarica prima di salvarli.');
  try{storage.setItem(key,JSON.stringify(clean));}catch(error){fail('Non è stato possibile salvare sul dispositivo. Esporta un backup o libera spazio e riprova.');}
  state=clean;loadError=null;raw=JSON.stringify(state);for(const fn of listeners){try{fn();}catch(error){console.warn('Personal view refresh',error);}}return copy(state);
 }
 const api={
  snapshot:()=>copy(state),onlyOwnedEnabled:()=>state.settings.onlyOwned,get error(){return loadError;},raw:()=>raw,
  subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},
  owned(l){return copy(state.inventory.filter(x=>x.profileId===l.id));},
  has(l){return state.inventory.some(x=>x.profileId===l.id);},
  addInventory(item){const value=inventoryItem({...item,id:id()}),next=copy(state),same=next.inventory.find(x=>x.profileId===value.profileId&&x.colorKey===value.colorKey);if(same){if(same.quantity+value.quantity>999)fail('La quantità massima è 999.');same.quantity+=value.quantity;}else next.inventory.push(value);commit(next);return copy(same||value);},
  updateInventory(itemId,item){const next=copy(state),index=next.inventory.findIndex(x=>x.id===itemId);if(index<0)fail('Esca non trovata.');const value=inventoryItem({...item,id:itemId}),same=next.inventory.find(x=>x.id!==itemId&&x.profileId===value.profileId&&x.colorKey===value.colorKey);if(same){if(same.quantity+value.quantity>999)fail('La quantità massima è 999.');same.quantity+=value.quantity;next.inventory.splice(index,1);}else next.inventory[index]=value;commit(next);return copy(same||value);},
  removeInventory(itemId){const next=copy(state),item=next.inventory.find(x=>x.id===itemId);next.inventory=next.inventory.filter(x=>x.id!==itemId);if(!next.inventory.length)next.settings.onlyOwned=false;commit(next);return copy(item||null);},
  onlyOwned(value){const next=copy(state);next.settings.onlyOwned=!!value&&next.inventory.length>0;commit(next);},
  saveCatch(item){const next=copy(state),index=item.id?next.catches.findIndex(x=>x.id===item.id):-1,value=catchItem({...item,id:index>=0?item.id:id(),createdAt:index>=0?next.catches[index].createdAt:undefined});if(index>=0)next.catches[index]=value;else next.catches.push(value);commit(next);return copy(value);},
  removeCatch(catchId){const next=copy(state),item=next.catches.find(x=>x.id===catchId);next.catches=next.catches.filter(x=>x.id!==catchId);commit(next);return copy(item||null);},
  restoreInventory(item){const next=copy(state);next.inventory.push(inventoryItem(item));commit(next);},
  restoreCatch(item){const next=copy(state);next.catches.push(catchItem(item));commit(next);},
  validate,import(value){return commit(validate(value),true);},reset(){return commit(empty(),true);},
  collection(){return Object.entries(species).map(([key,label])=>{const rows=state.catches.filter(c=>c.species===key);return {key,label,count:rows.length,unlocked:rows.length>0,best:rows.reduce((best,c)=>Math.max(best,c.lengthCm||0),0)||null};});},
  milestones(){
   const logged=state.catches.map(c=>c.profileId&&resolve(c.profileId)).filter(Boolean),rigs=new Set(logged.map(l=>l.rigTechnique).filter(Boolean)),methods=new Set(logged.map(l=>l.rigTechnique||method(l))),speciesCount=new Set(state.catches.map(c=>c.species)).size;
   const milestone=(id,title,description,value,goal,art)=>({id,title,description,value:Math.min(value,goal),goal,unlocked:value>=goal,art});
   const result=[milestone('first','Il primo ricordo','Registra la tua prima cattura.',state.catches.length,1,'perch'),milestone('species-three','Tre incontri','Registra tre specie diverse.',speciesCount,3,'bass'),milestone('methods-three','Cambia approccio','Cattura con tre tecniche diverse.',methods.size,3,'trout')];
   for(const [key,label] of Object.entries({jig:'Jig head',dropshot:'Drop shot',texas:'Texas rig',carolina:'Carolina rig',ned:'Ned rig',wacky:'Wacky rig',weightless:'Weightless'}))result.push(milestone('rig-'+key,label+' · prima cattura','Una cattura con questa montatura.',rigs.has(key)?1:0,1,key==='wacky'?'bass':'perch'));
   result.push(milestone('surface','Attacco in superficie','Una cattura con popper o buzzbait.',logged.some(l=>['topwater','buzzbait'].includes(l.cat))?1:0,1,'chub'),milestone('garda-seven','La collezione del Garda','Registra tutte le sette specie.',speciesCount,7,'pike'));
   return result;
  }
 };
 return api;
}
const storage=typeof localStorage!=='undefined'?localStorage:{getItem(){return null;},setItem(){throw new Error('storage unavailable');}};
const store=createStore({storage,resolve:id=>window.GardaSelector.resolveProfile(id),choices:l=>window.GardaColors.choices(l),method:l=>window.GardaSelector.method(l)});
let dbPromise;
function db(){
 if(!globalThis.indexedDB)return Promise.reject(new Error('Questo browser non può salvare le foto. Puoi registrare la cattura senza foto.'));
 return dbPromise||=(new Promise((resolve,reject)=>{const request=indexedDB.open('garda-personal-photos-v1',1);request.onupgradeneeded=()=>request.result.createObjectStore('photos');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(new Error('Archivio foto non disponibile.'));request.onblocked=()=>reject(new Error('Chiudi le altre schede Garda Lure e riprova.'));})).catch(error=>{dbPromise=null;throw error;});
}
async function photoTask(mode,operation){const database=await db();return new Promise((resolve,reject)=>{const tx=database.transaction('photos',mode),bucket=tx.objectStore('photos');let result;try{const request=operation(bucket);request.onsuccess=()=>{result=request.result;};}catch(error){reject(error);return;}tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(new Error('Non è stato possibile salvare la foto. Controlla lo spazio disponibile.'));tx.onabort=()=>reject(new Error('Salvataggio foto interrotto.'));});}
const photos={get:id=>id?photoTask('readonly',s=>s.get(id)):Promise.resolve(null),put:(id,blob)=>photoTask('readwrite',s=>s.put(blob,id)),remove:id=>photoTask('readwrite',s=>s.delete(id))};
store.recommendationColor=(l,inp,env)=>{const rows=store.owned(l);return store.onlyOwnedEnabled()&&rows.length?window.GardaColors.chooseAvailable(l,inp,env,rows.map(x=>x.colorKey)):window.GardaColors.pick(l,inp,env);};
window.GardaPersonal=Object.assign(store,{photos,createStore,species,today,uid});
})();
