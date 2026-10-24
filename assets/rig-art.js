/* Mounted low-poly covers: the actual plastic plus separate steel and line. */
(function(){
'use strict';
let sequence=0;
const bodies={
 'soft-shad-bare-v8':[1945,809,30,222,1885,511],
 'soft-shad-perch-bare-v8':[1945,808,27,217,1892,511],
 'soft-swimbait-v8':[1944,809,37,132,1874,538],
 'soft-swimbait-perch-v8':[1944,809,38,130,1874,540],
 'soft-jerk-bare-v8':[2172,724,33,120,2110,377],
 'worm-bare-v8':[2017,780,28,250,1967,298],
 'creature-bare-v8':[1774,887,39,202,1704,553]
};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function body(l,c,x,y,w,h){
 const name=window.GardaColors.asset(l,c),b=bodies[name];
 if(!b)return window.GardaColors.imageMarkup(l,c,`x="${x}" y="${y}" width="${w}" height="${h}"`);
 const image=window.GardaColors.imageMarkup(l,c,`width="${b[0]}" height="${b[1]}"`);
 const cropped=`<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${b.slice(2).join(' ')}" overflow="visible">${image}</svg>`;
 return l.cat==='soft creature'?`<g data-rig-entry="tail" transform="translate(${2*x+w} 0) scale(-1 1)">${cropped}</g>`:cropped;
}
function cover(l,inp,c){
 const r=window.GardaTechniques.setup(l,inp);if(!r?.compatible)return '';
 const uid='rig-cover-'+(++sequence),steel=`url(#${uid}-steel)`,lead=`url(#${uid}-lead)`;
 const line=d=>`<g data-part="line"><path d="${d}" stroke="#ffffffdc" stroke-width="3.5"/><path d="${d}" stroke="#537c8d" stroke-width="1.1"/></g>`;
 const hook=d=>`<g data-part="hook"><path d="${d}" stroke="#26353d" stroke-width="4.5"/><path d="${d}" stroke="${steel}" stroke-width="2.5"/></g>`;
 const eye=(x,y)=>`<circle cx="${x}" cy="${y}" r="3.5" fill="none" stroke="#3b4e57" stroke-width="2.3"/><path d="M${x-2} ${y-2} l2 -1 l2 1" stroke="#e9f2f4" stroke-width="1.2"/>`;
 const bullet=(x,y)=>`<g data-part="bullet" transform="translate(${x} ${y})"><path d="M0 -10 L13 -7 L28 0 L13 7 L0 10Z" fill="${lead}"/><path d="M0 -10 L13 -7 L28 0 L8 -1Z" fill="#c2ced1"/><path d="M0 10 L8 -1 L28 0 L13 7Z" fill="#536773"/><path d="M0 -10 L8 -1 L0 10Z" fill="#81929c"/></g>`;
 const offset=()=>hook('M244 117 L233 117 L229 126 L222 129 L197 147 Q178 157 169 145 L164 132 L172 121');
 let plastic,hardware='',thread='';
 if(r.key==='dropshot'){
  plastic=body(l,c,37,48,184,64);thread=line('M224 17 L224 80 L224 151');
  hardware=hook('M224 80 L219 80 Q213 98 203 91 L200 85')+eye(224,80)+`<g data-part="terminal-sinker"><path d="M224 151 L234 166 L232 183 L217 187 L211 174 L215 160Z" fill="${lead}"/><path d="M224 151 L223 173 L211 174 L215 160Z" fill="#aebfc5"/><path d="M223 173 L232 183 L217 187 L211 174Z" fill="#536571"/>${eye(224,151)}</g>`;
 }else if(r.key==='carolina'){
  plastic=body(l,c,22,91,165,65);thread=line('M287 28 L268 75 L218 108 L187 121');
  hardware=`<g transform="rotate(-35 245 91)">${bullet(245,91)}</g>`+`<circle data-part="bead" cx="241" cy="95" r="4.5" fill="#e7a263" stroke="#a56c3f"/><g data-part="swivel" transform="translate(227 105) rotate(-32)"><path d="M-8 0 H8" stroke="#344b56" stroke-width="3"/>${eye(-9,0)}${eye(9,0)}<path d="M-3 -4 H3 L6 0 L3 4 H-3 L-6 0Z" fill="${steel}"/></g>`+hook('M187 121 L179 125 L177 134 L152 148 Q138 154 132 141 L129 132 L136 122');
 }else if(r.key==='ned'){
  plastic=`<g transform="rotate(90 150 128)">${body(l,c,59,100,112,55)}</g>`;
  thread=line('M267 23 L167 153');
  hardware=hook('M167 153 L155 154 L151 117 Q142 105 133 114 L133 123')+`<g data-part="mushroom-head"><path d="M132 156 L142 149 H159 L170 156 V166 H132Z" fill="${lead}"/><path d="M132 156 L142 149 H159 L151 156Z" fill="#c9d5d9"/><path d="M151 156 H170 V166 H151Z" fill="#536672"/><path d="M132 166 H170" stroke="#344c59" stroke-width="2.5"/></g>`+eye(167,153);
 }else if(r.key==='wacky'){
  plastic=body(l,c,40,92,220,68);thread=line('M248 22 L198 60 L150 108');
  hardware=hook('M150 108 L150 123 Q144 143 132 132 L130 122')+eye(150,108);
  if(r.headWeight>0)hardware+=`<g data-part="split-shot"><path d="M198 52 L205 56 L207 64 L200 69 L192 65 L190 58Z" fill="${lead}"/><path d="M191 58 L204 64" stroke="#344b57" stroke-width="1.6"/></g>`;
 }else{
  plastic=body(l,c,39,86,205,67);
  if(r.key==='jig'){
   thread=line('M289 25 L253 99');
   hardware=(r.hookType==='weedless'?offset():hook('M249 117 L226 117 L218 98 Q207 75 192 85 L191 96'))+`<g data-part="jig-head"><path d="M244 103 L257 103 L269 114 L266 130 L252 138 L239 132 L233 117Z" fill="${lead}"/><path d="M244 103 L257 103 L251 116 L233 117Z" fill="#c6d3d6"/><path d="M251 116 L269 114 L266 130 L252 138Z" fill="#536674"/><path d="M233 117 L251 116 L252 138 L239 132Z" fill="#8f9fa7"/></g>`+eye(253,99);
  }else{
   hardware=offset()+eye(247,117);
   if(r.key==='texas'){thread=line('M294 69 L275 117 L247 117');hardware+=bullet(250,117);}
   else thread=line('M289 28 L247 117');
  }
 }
 return `<svg class="rig-cover" viewBox="0 0 300 200" role="img" aria-label="${esc(l.family+' · '+c.label+' · '+window.GardaTechniques.rigs[r.key].short)}" data-rig="${r.key}" data-plastic="${esc(l.cat)}" data-palette="${c.key}" data-head-weight="${r.headWeight}" data-hook-type="${r.hookType}"><defs><linearGradient id="${uid}-steel" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#cad6d9"/><stop offset=".28" stop-color="#455b68"/><stop offset=".55" stop-color="#a6b4bc"/><stop offset="1" stop-color="#2c414f"/></linearGradient><linearGradient id="${uid}-lead" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d4dfe1"/><stop offset=".48" stop-color="#8396a0"/><stop offset="1" stop-color="#344d5a"/></linearGradient></defs><g fill="none" stroke-linecap="round" stroke-linejoin="round">${thread}</g>${plastic}<g stroke-linecap="round" stroke-linejoin="round" fill="none">${hardware}</g></svg>`;
}
window.GardaRigArt={body,cover};
})();
