/* Portable PNG cards: no foreignObject, no remote service, no location metadata. */
(function(){
'use strict';
const images=new Map();
function loadImage(url){
 if(!images.has(url))images.set(url,new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{images.delete(url);reject(new Error('Immagine non disponibile. Riprova quando sei online.'));};img.src=url;}));
 return images.get(url);
}
async function compressPhoto(file){
 if(!file||!file.type.startsWith('image/')||file.type==='image/svg+xml')throw new Error('Scegli una foto JPEG, PNG o WebP.');
 if(file.size>25*1024*1024)throw new Error('Scegli una foto sotto 25 MB.');
 const url=URL.createObjectURL(file);
 try{const img=await loadImage(url),scale=Math.min(1,1600/Math.max(img.naturalWidth,img.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Questa foto non può essere elaborata.')),'image/jpeg',.84));}catch(error){throw new Error('Foto non leggibile in questo browser. Prova un file JPEG o PNG.');}finally{images.delete(url);URL.revokeObjectURL(url);}
}
function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function coverImage(ctx,img,x,y,w,h){const scale=Math.max(w/img.naturalWidth,h/img.naturalHeight),sw=w/scale,sh=h/scale;ctx.drawImage(img,(img.naturalWidth-sw)/2,(img.naturalHeight-sh)/2,sw,sh,x,y,w,h);}
function containImage(ctx,img,x,y,w,h){const scale=Math.min(w/img.naturalWidth,h/img.naturalHeight),iw=img.naturalWidth*scale,ih=img.naturalHeight*scale;ctx.drawImage(img,x+(w-iw)/2,y+(h-ih)/2,iw,ih);}
function wrap(ctx,text,x,y,maxWidth,lineHeight,maxLines=3){
 const words=String(text).split(/\s+/);let line='',lines=[];
 for(const word of words){const next=line?line+' '+word:word;if(ctx.measureText(next).width>maxWidth&&line){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);
 lines=lines.slice(0,maxLines);for(let i=0;i<lines.length;i++)ctx.fillText(lines[i],x,y+i*lineHeight);return y+lines.length*lineHeight;
}
async function lureImage(l,color){
 const inp={autoRig:false,jigHead:l.rigTechnique==='weightless'||l.rigTechnique==='wacky'?0:5,softHook:'exposed',clarity:8,depth:3,rigStyle:l.rigTechnique||'auto'};
 const html=l.rigTechnique?window.GardaRigArt.cover(l,inp,color):window.GardaColors.portrait(l,color);
 const doc=new DOMParser().parseFromString(html,'image/svg+xml'),root=doc.documentElement;
 root.setAttribute('xmlns','http://www.w3.org/2000/svg');root.setAttribute('width','600');root.setAttribute('height','380');
 const filterId=window.GardaColors.filterId(color.key,l),filter=document.getElementById(filterId);
 const defs=doc.createElementNS('http://www.w3.org/2000/svg','defs');if(filter)defs.appendChild(doc.importNode(filter,true));root.insertBefore(defs,root.firstChild);
 const embedded=new Map();
 for(const node of [...root.querySelectorAll('image')]){
  const href=node.getAttribute('href');if(!href||href.startsWith('data:'))continue;
  if(!embedded.has(href)){
   const img=await loadImage(href),buffer=document.createElement('canvas');buffer.width=img.naturalWidth;buffer.height=img.naturalHeight;buffer.getContext('2d').drawImage(img,0,0);
   const id='export-bitmap-'+embedded.size,bitmap=doc.createElementNS('http://www.w3.org/2000/svg','image');bitmap.setAttribute('id',id);bitmap.setAttribute('href',buffer.toDataURL('image/png'));bitmap.setAttribute('width',img.naturalWidth);bitmap.setAttribute('height',img.naturalHeight);defs.appendChild(bitmap);embedded.set(href,id);
  }
  const use=doc.createElementNS('http://www.w3.org/2000/svg','use');for(const attr of [...node.attributes])if(attr.name!=='href')use.setAttribute(attr.name,attr.value);use.setAttribute('href','#'+embedded.get(href));node.replaceWith(use);
 }
 const blob=new Blob([new XMLSerializer().serializeToString(root)],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob);
 try{return await loadImage(url);}finally{images.delete(url);URL.revokeObjectURL(url);}
}
function prettyDate(value){return new Intl.DateTimeFormat('it-IT',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Rome'}).format(new Date(value+'T12:00:00Z'));}
async function render(record){
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const ctx=canvas.getContext('2d');
 const background=ctx.createLinearGradient(0,0,1080,1350);background.addColorStop(0,'#edf8fc');background.addColorStop(1,'#a7d2dd');ctx.fillStyle=background;ctx.fillRect(0,0,1080,1350);
 ctx.fillStyle='#ffffff38';for(const [a,b,c] of [[[0,780],[360,620],[720,1350]],[[520,950],[1080,650],[1080,1350]],[[0,1120],[400,1040],[600,1350]]]){ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.lineTo(...c);ctx.closePath();ctx.fill();}
 ctx.fillStyle='#3e7187';ctx.font='600 26px -apple-system, sans-serif';ctx.fillText('GARDA LURE',64,72);
 ctx.fillStyle='#143e55';ctx.font='700 67px -apple-system, sans-serif';ctx.fillText(window.GardaPersonal.species[record.species],64,160);
 ctx.fillStyle='#47758a';ctx.font='400 27px -apple-system, sans-serif';ctx.fillText(prettyDate(record.date),67,207);
 roundRect(ctx,64,245,952,590,36);ctx.fillStyle='#ffffff8c';ctx.fill();ctx.save();ctx.clip();
 const photo=record.photoId?await window.GardaPersonal.photos.get(record.photoId):null;
 if(photo){const url=URL.createObjectURL(photo);try{coverImage(ctx,await loadImage(url),64,245,952,590);}finally{images.delete(url);URL.revokeObjectURL(url);}}
 else containImage(ctx,await loadImage('./assets/illustrations/fish-'+record.species+'.png'),104,310,872,450);
 ctx.restore();
 ctx.fillStyle='#143e55';ctx.font='700 70px -apple-system, sans-serif';ctx.fillText(record.lengthCm?record.lengthCm+' cm':'Un nuovo ricordo',64,935);
 const best=window.GardaPersonal.collection().find(x=>x.key===record.species)?.best;
 if(best&&record.lengthCm===best){ctx.fillStyle='#6b7040';ctx.font='600 22px -apple-system, sans-serif';ctx.fillText('RECORD PERSONALE',66,976);}
 roundRect(ctx,64,1010,952,230,30);ctx.fillStyle='#ffffff9c';ctx.fill();ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.stroke();
 const l=record.profileId&&window.GardaSelector.resolveProfile(record.profileId),color=record.colorKey&&window.GardaColors.get(record.colorKey);
 if(l&&color){const art=await lureImage(l,color);containImage(ctx,art,76,1028,275,195);ctx.fillStyle='#3d7186';ctx.font='600 19px -apple-system, sans-serif';ctx.fillText('ESCA E MONTATURA',365,1055);ctx.fillStyle='#17455c';ctx.font='600 29px -apple-system, sans-serif';const next=wrap(ctx,l.family,365,1103,610,38,2);ctx.font='400 24px -apple-system, sans-serif';wrap(ctx,l.lengthCm+' cm · '+color.label,365,next+7,610,32,2);}
 else{ctx.fillStyle='#4b7489';ctx.font='400 31px -apple-system, sans-serif';ctx.fillText('Un ricordo di pesca sul Garda',96,1137);}
 ctx.fillStyle='#47758a';ctx.font='400 23px -apple-system, sans-serif';ctx.fillText(record.shareZone&&record.zone?record.zone:'Lago di Garda',64,1300);
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Non è stato possibile creare la card.')),'image/png'));
}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
async function exportCard(record,share=false){
 const blob=await render(record),name='garda-'+record.species+'-'+record.date+'.png',file=new File([blob],name,{type:'image/png'});
 if(share&&navigator.share&&navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:'Il mio ricordo · Garda Lure'});return 'shared';}catch(error){if(error.name==='AbortError')throw error;}}
 download(blob,name);return 'downloaded';
}
window.GardaCatchCards={compressPhoto,render,exportCard,download,prettyDate};
})();
