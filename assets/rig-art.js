/* Cutaway rig drawings: shared by covers and retrieve scenes. */
(function(){
'use strict';
let sequence=0;
// Image bounds plus opaque silhouette landmarks: nose, spine, belly, middle.
const bodies={
 'soft-shad-bare-v8':[1945,809,30,222,1885,511,.410,.033,.800,.377,.198],
 'soft-shad-perch-bare-v8':[1945,808,27,217,1892,511,.424,.031,.808,.382,.209],
 'soft-swimbait-v8':[1944,809,37,132,1874,538,.550,.089,.928,.603,.342],
 'soft-swimbait-perch-v8':[1944,809,38,130,1874,540,.553,.091,.928,.605,.346],
 'soft-jerk-bare-v8':[2172,724,33,120,2110,377,.532,.164,.923,.539,.292],
 'worm-bare-v8':[2017,780,28,250,1967,298,.327,.215,.913,.331,.074],
 'creature-bare-v8':[1774,887,39,202,1704,553,.489,.244,.600,.430,.217]
};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=v=>Math.round(v*100)/100;
function body(l,c,x,y,w,h){
 const name=window.GardaColors.asset(l,c),b=bodies[name];
 if(!b)return window.GardaColors.imageMarkup(l,c,`x="${x}" y="${y}" width="${w}" height="${h}"`);
 const image=window.GardaColors.imageMarkup(l,c,`width="${b[0]}" height="${b[1]}"`);
 const cropped=`<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${b.slice(2,6).join(' ')}" overflow="visible">${image}</svg>`;
 return l.cat==='soft creature'?`<g data-rig-entry="tail" transform="translate(${2*x+w} 0) scale(-1 1)">${cropped}</g>`:cropped;
}
function layout(l,c,noseX=244,noseY=117,width=208){
 const b=bodies[window.GardaColors.asset(l,c)];
 const h=width*b[5]/b[4],y=noseY-h*b[6];
 return {x:noseX-width,y,w:width,h,nx:noseX,ny:noseY,spine:y+h*b[7],belly:y+h*b[8],middle:y+h*b[9],noseTop:y+h*b[10]};
}
function hookGeometry(p,style){
 const {nx,ny,w,spine,belly}=p;
 let d,eye,tip,angle,point='exposed';
 if(style==='nose'){
  eye=[nx+7,ny];tip=[nx-10,Math.min(ny-9,p.noseTop-3)];angle=-65;
  d=`M${nx+7} ${ny} L${nx-1} ${ny+6} C${nx-4} ${ny+18} ${nx-20} ${ny+18} ${nx-22} ${ny+6} C${nx-23} ${ny} ${nx-17} ${ny-6} ${tip[0]} ${tip[1]}`;
 }else if(style==='wacky'){
  const x=p.x+w*.5,y=p.middle;
  eye=[x+11,y-16];tip=[x-5,y-12];angle=-65;
  d=`M${eye[0]} ${eye[1]} L${x+9} ${y+1} C${x+8} ${y+16} ${x-10} ${y+18} ${x-13} ${y+5} C${x-14} ${y-2} ${x-10} ${y-7} ${tip[0]} ${tip[1]}`;
 }else if(style==='offset'){
  const a=nx-w*.34,b=nx-w*.44;
  eye=[nx+5,ny];tip=[nx-w*.30,spine+4];angle=-65;point='protected';
  d=`M${nx+5} ${ny} L${nx-7} ${ny} L${nx-11} ${ny+5} L${nx-14} ${ny+10} L${a+8} ${belly+11} C${b} ${belly+19} ${b-7} ${belly+1} ${b+3} ${belly-12} L${tip[0]} ${tip[1]}`;
 }else{
  const a=nx-w*.36,b=nx-w*.43;
  eye=[nx+10,ny-15];tip=[nx-w*.25,spine-5];angle=25;
  d=`M${eye[0]} ${eye[1]} L${nx+10} ${ny} L${a} ${ny} C${b-8} ${ny} ${b-12} ${spine-2} ${b+1} ${spine-10} C${b+9} ${spine-17} ${tip[0]-10} ${tip[1]-5} ${tip[0]} ${tip[1]}`;
 }
 return {d,eye,tip,angle,point,style};
}
function explanation(l,r){
 if(r.key==='wacky')return 'Amo attraverso il centro del worm; le due estremità restano libere.';
 if(r.key==='dropshot')return 'Innesco corto dal basso verso l’alto '+(l.cat==='soft creature'?'nella coda':'nel muso')+', con la punta libera.';
 if(r.hookType==='weedless')return 'Entra dalla '+(l.cat==='soft creature'?'coda':'testa')+', esci sotto e reinserisci la punta nel dorso, appena sotto la pelle.';
 return 'Fai scorrere la gomma sul gambo '+(l.cat==='soft creature'?'dalla coda':'dal muso')+' e fai uscire la curva e la punta dal dorso.';
}
function assembly(l,inp,c,r){
 const uid='rig-cutaway-'+(++sequence),steel=`url(#${uid}-steel)`,lead=`url(#${uid}-lead)`;
 const eye=(x,y)=>`<circle cx="${n(x)}" cy="${n(y)}" r="2.3" fill="none" stroke="#31424d" stroke-width="1.5"/><path d="M${n(x-1.4)} ${n(y-1.5)} q1.4 -1 2.8 0" stroke="#dce9ed" stroke-width=".65" fill="none"/>`;
 const bullet=(x,y)=>`<g data-part="bullet" transform="translate(${x} ${y})"><path d="M0 -7 Q13 -7 25 0 Q13 7 0 7Z" fill="${lead}"/><path d="M0 -7 L12 -4 L25 0 L0 1Z" fill="#c5d0d4"/><path d="M0 7 L0 1 L25 0 L12 5Z" fill="#5a6f7c"/></g>`;
 let p,style,transform='',reference=[140,117],hardware='',thread='',attach;
 if(r.key==='dropshot'){p=layout(l,c,240,83,201);style='nose';reference=[139.5,83];}
 else if(r.key==='carolina'){p=layout(l,c,201,126,176);style='offset';reference=[113,126];}
 else {p=layout(l,c);style=r.key==='wacky'?'wacky':r.hookType==='weedless'?'offset':'jig';}
 const h=hookGeometry(p,style),plastic=body(l,c,p.x,p.y,p.w,p.h);
 attach=h.eye.slice();
 if(r.key==='ned'){
  // Rotate the complete threaded mount; the hook and head stay attached.
  transform='translate(152 166) rotate(90) scale(.63) translate(-244 -117)';
  attach=[152-(h.eye[1]-117)*.63,166+(h.eye[0]-244)*.63];reference=[152,103];
  hardware=`<g data-part="mushroom-head"><path d="M244 101 L256 97 L264 103 V131 L256 137 L244 133Z" fill="${lead}"/><path d="M244 101 L256 97 L256 117 L244 117Z" fill="#c3d0d5"/><path d="M256 117 L264 103 V131 L256 137Z" fill="#5e7381"/><path d="M264 103 V131" stroke="#334d5b" stroke-width="1.5"/></g>`;
 }else if(r.key==='jig'){
  if(style==='offset')attach=[254,102];
  hardware=`<g data-part="jig-head"><path d="M245 104 L254 102 L264 108 L268 118 L263 128 L252 132 L242 127 L239 117Z" fill="${lead}"/><path d="M245 104 L254 102 L264 108 L253 115 L239 117Z" fill="#c7d3d7"/><path d="M253 115 L268 118 L263 128 L252 132Z" fill="#526a79"/><path d="M239 117 L253 115 L252 132 L242 127Z" fill="#92a5af"/></g>`;
  if(style==='offset')hardware+=`<path d="M254 102 V117 H249" fill="none" stroke="${steel}" stroke-width="1.8"/>${eye(254,102)}`;
 }else if(r.key==='dropshot'){
  thread=`M${h.eye[0]} ${h.eye[1]} V166`;
  hardware=`<g data-part="terminal-sinker"><path d="M247 168 L256 178 L254 189 L243 193 L237 183 L240 173Z" fill="${lead}"/><path d="M247 168 L246 182 L237 183 L240 173Z" fill="#c2cfd4"/><path d="M246 182 L254 189 L243 193 L237 183Z" fill="#526976"/>${eye(247,166)}</g>`;
 }else if(r.key==='carolina'){
  hardware=`<g transform="translate(244 90) rotate(-40)">${bullet(0,0)}</g><circle data-part="bead" cx="239" cy="95" r="3.3" fill="#d79c64" stroke="#ab744b" stroke-width=".7"/><g data-part="swivel" transform="translate(227 104) rotate(-40)">${eye(-7,0)}${eye(7,0)}<path d="M-4 -2 H4 L5 2 H-4Z" fill="${steel}"/></g>`;
  thread='M263.15 73.93 L239 95 L232.36 99.5 M221.64 108.5 L206 126';attach=[263.15,73.93];
 }else if(r.key==='texas'){
  hardware=bullet(252,117);thread='M277 117 H249';attach=[277,117];
 }else if(r.key==='wacky'&&r.headWeight>0){
  const x=(h.eye[0]+278)/2,y=(h.eye[1]+27)/2;attach=[x,y];thread=`M${x} ${y} L${h.eye.join(' ')}`;
  hardware=`<g data-part="split-shot"><path d="M${x-4} ${y-4} L${x+3} ${y-5} L${x+5} ${y+2} L${x} ${y+5} L${x-5} ${y+2}Z" fill="${lead}"/><path d="M${x-4} ${y-2} L${x+4} ${y+2}" stroke="#3b5563" stroke-width="1"/></g>`;
 }
 const defs=`<defs><linearGradient id="${uid}-steel" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a7bec9"/><stop offset=".4" stop-color="#405966"/><stop offset=".65" stop-color="#d5e0e5"/><stop offset="1" stop-color="#314a59"/></linearGradient><linearGradient id="${uid}-lead" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#cad9df"/><stop offset=".48" stop-color="#899eaa"/><stop offset="1" stop-color="#3b5564"/></linearGradient><filter id="${uid}-ink" color-interpolation-filters="sRGB"><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"/></filter><mask id="${uid}-inside" maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="200" style="mask-type:alpha">${plastic}</mask><mask id="${uid}-outside" maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="200" style="mask-type:luminance"><rect width="300" height="200" fill="white"/><g filter="url(#${uid}-ink)">${plastic}</g></mask></defs>`;
 const point=`<g data-part="hook-point" data-point="${h.point}" transform="translate(${n(h.tip[0])} ${n(h.tip[1])}) rotate(${h.angle})"><path d="M0 0 L-7 -1.25 L-5 .9Z" fill="#2b4351"/><path d="M-5 .7 L-7 2 L-5 -2" fill="#607987"/></g>`;
 const hook=`<g data-part="hook" data-hook-style="${h.style}" fill="none" stroke-linecap="round" stroke-linejoin="round"><g data-layer="internal-hook" mask="url(#${uid}-inside)"><path d="${h.d}" stroke="#effbff" stroke-width="5" opacity=".75"/><path d="${h.d}" stroke="#35576d" stroke-width="1.8" stroke-dasharray="4 2.2"/>${point}</g><g data-layer="external-hook" mask="url(#${uid}-outside)"><path d="${h.d}" stroke="#283e4b" stroke-width="2.6"/><path d="${h.d}" stroke="${steel}" stroke-width="1.15"/>${point}</g>${eye(...h.eye)}</g>`;
 const mount=`${defs}<g ${transform?`transform="${transform}"`:''}>${plastic}${hook}${hardware}</g>`;
 return {uid,mount,thread,attach,reference,point:h.point,style,description:explanation(l,r)};
}
function line(d){return `<g data-part="line" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${d}" stroke="#f7fdff" stroke-width="3"/><path d="${d}" stroke="#567f93" stroke-width=".9"/></g>`;}
function cover(l,inp,c){
 const r=window.GardaTechniques.setup(l,inp);if(!r?.compatible)return '';
 const a=assembly(l,inp,c,r),start=r.key==='dropshot'?[247,17]:r.key==='carolina'?[287,28]:[278,27];
 const d=`M${start.join(' ')} L${a.attach.join(' ')}`+(a.thread?' '+a.thread:'');
 return `<svg class="rig-cover" viewBox="0 0 300 200" role="img" aria-label="${esc(l.family+' · '+c.label+' · '+window.GardaTechniques.rigs[r.key].short+' · Amo in trasparenza')}" data-rig="${r.key}" data-plastic="${esc(l.cat)}" data-palette="${c.key}" data-head-weight="${r.headWeight}" data-hook-type="${r.hookType}" data-point="${a.point}"><title>${esc(a.description)}</title>${line(d)}${a.mount}</svg>`;
}
function placed(l,inp,c,r,cx,cy,scale=.67){
 const a=assembly(l,inp,c,r),tx=cx-a.reference[0]*scale,ty=cy-a.reference[1]*scale;
 const attach=[n(tx+a.attach[0]*scale),n(ty+a.attach[1]*scale)];
 return {attach,markup:`<g data-rig="${r.key}" data-cutaway="true" transform="translate(${n(tx)} ${n(ty)}) scale(${scale})">${a.thread?line(a.thread):''}${a.mount}</g>`};
}
function key(l,inp){
 const r=window.GardaTechniques.setup(l,inp);if(!r?.compatible)return '';
 return `<div class="rig-cutaway-key"><span><i aria-hidden="true"></i>Amo nella gomma</span><span>${r.hookType==='weedless'?'Punta protetta':'Punta esposta'}</span></div>`;
}
window.GardaRigArt={body,layout,hookGeometry,cover,placed,key};
})();
