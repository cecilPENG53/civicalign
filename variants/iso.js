/* ===== variants/iso.js: 2.5D isometric plaza for option D =====
   The square is 48 tiles of 25 m² (8 west→east × 6 north→south). Tiles are handed to uses in proportion to
   S.a, filled column by column from the west, so trees sit at the back and walking + kerb face Wentworth St.
   Edges after S2 p.45 / p.43 and S4 (one-way southbound). Indicative only, not a layout design. */
const ISO={C:8,R:6,HW:36,HH:18};
const ISO_ORDER=["canopy","blue","culture","rest","events","smart","circ","bike","walk","kerb"];
const ip=(c,r,z=0)=>[(c-r)*ISO.HW,(c+r)*ISO.HH-z];
const P=a=>a.map(p=>p.map(v=>+v.toFixed(1)).join(",")).join(" ");
function tileMap(a){
  const n=ISO.C*ISO.R, raw=ISO_ORDER.map(id=>a[id]/TOTAL*n), fl=raw.map(Math.floor);
  let rem=n-fl.reduce((s,v)=>s+v,0);
  raw.map((v,i)=>[v-fl[i],i]).sort((x,y)=>y[0]-x[0]).slice(0,rem).forEach(([,i])=>fl[i]++);
  const out=[]; ISO_ORDER.forEach((id,i)=>{for(let k=0;k<fl[i];k++)out.push(id);}); return out;
}
const tileCR=t=>[Math.floor(t/ISO.R),t%ISO.R];
/* a box in world tile units */
function isoBox(c0,r0,c1,r1,z0,h,top,south,east,extra=""){
  const T=[ip(c0,r0,z0+h),ip(c1,r0,z0+h),ip(c1,r1,z0+h),ip(c0,r1,z0+h)];
  const Sf=[ip(c0,r1,z0),ip(c1,r1,z0),ip(c1,r1,z0+h),ip(c0,r1,z0+h)];
  const Ef=[ip(c1,r0,z0),ip(c1,r1,z0),ip(c1,r1,z0+h),ip(c1,r0,z0+h)];
  return `<polygon points="${P(Sf)}" fill="${south}"/><polygon points="${P(Ef)}" fill="${east}"/><polygon points="${P(T)}" fill="${top}"/>${extra}`;
}
/* local box around a tile centre, offsets in tile units */
function lbox(x0,y0,x1,y1,z0,h,top,s,e){const L=(dc,dr,z)=>[(dc-dr)*ISO.HW,(dc+dr)*ISO.HH-z];
  return `<polygon points="${P([L(x0,y1,z0),L(x1,y1,z0),L(x1,y1,z0+h),L(x0,y1,z0+h)])}" fill="${s}"/><polygon points="${P([L(x1,y0,z0),L(x1,y1,z0),L(x1,y1,z0+h),L(x1,y0,z0+h)])}" fill="${e}"/><polygon points="${P([L(x0,y0,z0+h),L(x1,y0,z0+h),L(x1,y1,z0+h),L(x0,y1,z0+h)])}" fill="${top}"/>`;}
const person=(x,y,c="#2c5aa0",s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="4" ry="2" fill="rgba(0,0,0,.18)"/><rect x="-3" y="-13" width="6" height="11" rx="3" fill="${c}"/><circle cx="0" cy="-16" r="3.2" fill="#f1c9a5"/></g>`;
const GROUND={canopy:"#9fd38a",blue:"#7fbfae",events:"#efe2c9",culture:"#f0d9c8",rest:"#e3ead2",walk:"#ece7dd",bike:"#dde2e8",kerb:"#b9c0c8",smart:"#e2def0",circ:"#dfe8d6"};
const diamond=(f,inset=0)=>{const k=1-inset;return `<polygon points="0,${-ISO.HH*k} ${ISO.HW*k},0 0,${ISO.HH*k} ${-ISO.HW*k},0" fill="${f}"/>`;};
function crownScale(){const cr=CROWN[S.plant][S.year];return Math.sqrt((cr[0]+cr[1])/2);}
function tileArt(id,t){
  const g=diamond(GROUND[id])+`<polygon points="0,${-ISO.HH} ${ISO.HW},0 0,${ISO.HH} ${-ISO.HW},0" fill="none" stroke="rgba(60,50,30,.12)"/>`;
  const sc=crownScale();
  switch(id){
    case "canopy": return g+`<g class="shd" style="transform:scale(${sc})"><ellipse cx="7" cy="4" rx="24" ry="12" fill="rgba(25,70,35,.28)"/></g><rect x="-2" y="-17" width="4" height="17" rx="1.5" fill="#7a5a3a"/>
      <g class="crown" style="transform:scale(${sc})"><circle cx="0" cy="-30" r="15" fill="#3f8f4e"/><circle cx="-7" cy="-25" r="10" fill="#4aa05a"/><circle cx="6" cy="-35" r="8" fill="#72c07a"/><circle cx="-3" cy="-38" r="4" fill="#9ad49b"/></g>`;
    case "blue": return g+diamond("#4f8f8a",.28)+diamond("#5fb7d0",.45)+`<ellipse cx="-4" cy="1" rx="7" ry="3" fill="none" stroke="#d9f3fb" stroke-width="1"/><path d="M14 -2v-9M17 -1v-7M-16 2v-8M-19 3v-6" stroke="#3c7d43" stroke-width="1.6" stroke-linecap="round"/>`;
    case "events": { const st=[0,1,2,3].map(i=>{const L=(dc,dr,z)=>[(dc-dr)*ISO.HW,(dc+dr)*ISO.HH-z];const a=-.36+i*.18,b=a+.18;return `<polygon points="${P([L(a,-.3,30),L(b,-.3,30),L(b,.3,26),L(a,.3,26)])}" fill="${i%2?"#fff4e6":(t%3?"#e2583e":"#e8912e")}"/>`;}).join("");
      return g+lbox(-.26,-.18,.26,.18,0,11,"#c99a62","#a87a46","#8e6436")+`<path d="M-21 -7v-22M21 -7v-22" stroke="#6b4a2a" stroke-width="1.5"/>`+st+person(-4,14,"#d08a2c",.9); }
    case "culture": return g+`<path d="M-14 4v-40M14 4v-40M-14 -34Q0 -26 14 -34" stroke="#5a4636" stroke-width="1.6" fill="none"/>${[-8,0,8].map((x,i)=>`<ellipse cx="${x}" cy="${-30+(i===1?4:2)}" rx="3.6" ry="4.6" fill="#d43c32"/><rect x="${x-1.6}" y="${-35+(i===1?4:2)}" width="3.2" height="1.4" fill="#f2c14e"/>`).join("")}
      ${lbox(-.12,.08,.1,.3,0,10,"#8a63b8","#6d4c99","#583d80")}`;
    case "rest": return g+lbox(-.32,-.12,.12,-.02,0,5,"#b7884e","#946a38","#7d5a2e")+lbox(-.32,-.15,.12,-.12,5,7,"#b7884e","#946a38","#7d5a2e")+lbox(.06,.12,.3,.3,0,4,"#e0c06a","#c2a24f","#a98b3f")+`<circle cx="18" cy="-6" r="4" fill="#4f9a5b"/>`+person(-10,-4,"#8a63b8",.85)+person(10,8,"#e2583e",.7);
    case "walk": return g+`<path d="M-18 -9 18 9M-18 9 18 -9" stroke="rgba(120,100,70,.18)" stroke-width="1"/><g fill="rgba(90,80,60,.35)"><ellipse cx="-6" cy="-3" rx="2" ry="1.2"/><ellipse cx="-1" cy="0" rx="2" ry="1.2"/><ellipse cx="4" cy="2" rx="2" ry="1.2"/><ellipse cx="9" cy="5" rx="2" ry="1.2"/></g>`;
    case "bike": return g+`<path d="M-20 -2 20 -2" stroke="#5c6670" stroke-width="2"/>${[-10,6].map(x=>`<g transform="translate(${x} 0)"><ellipse cx="-5" cy="-5" rx="4.5" ry="5" fill="none" stroke="#2f5f9c" stroke-width="1.6"/><ellipse cx="5" cy="-5" rx="4.5" ry="5" fill="none" stroke="#2f5f9c" stroke-width="1.6"/><path d="M-5 -5 0 -12 5 -5M0 -12 2 -14" stroke="#2f5f9c" stroke-width="1.4" fill="none"/></g>`).join("")}`;
    case "kerb": return g+`<path d="M-30 3 0 18" stroke="#fff" stroke-width="1.2" stroke-dasharray="4 3"/>`+lbox(-.3,-.14,.3,.14,2,9,"#3f7cc0","#2f62a0","#264f82")+lbox(-.14,-.12,.16,.12,11,7,"#9cc3ea","#5f8fc4","#4c7aac")+`<circle cx="-14" cy="6" r="3" fill="#222"/><circle cx="10" cy="12" r="3" fill="#222"/>`;
    case "smart": return g+`<path d="M0 2V-46" stroke="#4b4f63" stroke-width="2.4"/><path d="M0 -46h10" stroke="#4b4f63" stroke-width="2"/><ellipse cx="11" cy="-45" rx="5" ry="2.4" fill="#f7e9a8"/><circle cx="0" cy="-20" r="2.2" fill="#8a63b8"/>`;
    case "circ": return g+lbox(-.3,-.1,-.12,.08,0,10,"#4f9a5b","#3e7d48","#336a3c")+lbox(-.08,-.1,.1,.08,0,10,"#e0b43a","#c0962c","#a68026")+lbox(.14,-.1,.32,.08,0,10,"#3f7cc0","#2f62a0","#264f82");
  }
  return g;
}
const ISO_DEFS=`<defs><radialGradient id="gWarm"><stop offset="0" stop-color="#ffe7a3" stop-opacity=".95"/><stop offset="1" stop-color="#ffcf6a" stop-opacity="0"/></radialGradient>
 <radialGradient id="gRed"><stop offset="0" stop-color="#ffb08a" stop-opacity=".95"/><stop offset="1" stop-color="#ff6a4a" stop-opacity="0"/></radialGradient>
 <linearGradient id="gGlass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9c6e3"/><stop offset="1" stop-color="#6f93b8"/></linearGradient></defs>`;
function windows(c0,c1,r,z0,rows,cols,h){ // window strips on a south face
  let s="";for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const a=c0+(c1-c0)*(j+.18)/cols,b=c0+(c1-c0)*(j+.82)/cols,z=z0+(i+.3)*h/rows,zz=z0+(i+.75)*h/rows;
    s+=`<polygon class="win" points="${P([ip(a,r,z),ip(b,r,z),ip(b,r,zz),ip(a,r,zz)])}"/>`;}return s;}
function windowsE(r0,r1,c,z0,rows,cols,h){let s="";for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const a=r0+(r1-r0)*(j+.18)/cols,b=r0+(r1-r0)*(j+.82)/cols,z=z0+(i+.3)*h/rows,zz=z0+(i+.75)*h/rows;
    s+=`<polygon class="win" points="${P([ip(c,a,z),ip(c,b,z),ip(c,b,zz),ip(c,a,zz)])}"/>`;}return s;}
function plate(x,y,txt,c,id){return `<g class="plate" transform="translate(${x} ${y})" ${id?`data-quest="${id}" role="button" tabindex="0"`:""}><rect x="${-txt.length*3.6-10}" y="-11" width="${txt.length*7.2+20}" height="20" rx="10" fill="${c}" stroke="#fff" stroke-width="1.5"/><text y="4" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">${esc(txt)}</text></g>`;}
function quest(x,y,n,id,label){return `<g class="quest" data-quest="${id}" role="button" tabindex="0" aria-label="${esc(label)}" transform="translate(${x} ${y})"><g class="bob"><path d="M0 14 -9 0a12 12 0 1 1 18 0z" fill="#ffcd3c" stroke="#7a5200" stroke-width="1.5"/><text y="4" text-anchor="middle" font-size="13" font-weight="800" fill="#4a3000">${n}</text></g></g>`;}
function isoScene(){
  const reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  let g=ISO_DEFS;
  // ground plane and back edges
  g+=`<polygon points="${P([ip(-4,-4),ip(12,-4),ip(12,10),ip(-4,10)])}" fill="#cfd8c6"/>`;
  // north: heritage townhouse (low, brick, pitched roof) S2 p.45
  g+=isoBox(.6,-2.4,6.6,-.4,0,34,"#d99a77","#b86f4f","#9b5a3e",windows(.6,6.6,-.4,4,2,6,28));
  g+=`<polygon points="${P([ip(.6,-2.4,34),ip(6.6,-2.4,34),ip(6.6,-1.4,48),ip(.6,-1.4,48)])}" fill="#7d4a3a"/><polygon points="${P([ip(.6,-1.4,48),ip(6.6,-1.4,48),ip(6.6,-.4,34),ip(.6,-.4,34)])}" fill="#a35f47"/>`;
  // west: new Council building with cultural space (tall, glass)
  g+=isoBox(-3.4,-2.4,-.4,6.4,0,118,"#c8d6e6","url(#gGlass)","#5b7ea3",windowsE(-2.4,6.4,-.4,8,7,8,104)+windows(-3.4,-.4,6.4,8,7,3,104));
  // east: Wentworth St, one-way southbound (S4), raised crossing aligned to Rivoli Way (S2 p.43)
  g+=`<polygon points="${P([ip(8,-4),ip(8.4,-4),ip(8.4,10),ip(8,10)])}" fill="#d9d4ca"/><polygon points="${P([ip(8.4,-4),ip(11,-4),ip(11,10),ip(8.4,10)])}" fill="#59626d"/>`;
  g+=[0,1,2,3,4,5,6].map(i=>{const r=1.1+i*.12;return `<polygon points="${P([ip(8.5,r),ip(10.9,r),ip(10.9,r+.06),ip(8.5,r+.06)])}" fill="#f4f4f4"/>`;}).join("");
  g+=[-3,0,3,6].map(r=>`<polygon points="${P([ip(9.6,r),ip(9.8,r),ip(9.8,r+1.2),ip(9.6,r+1.2)])}" fill="#f2d24b"/>`).join("");
  // car driving south
  const car=`<g>${lbox(-.18,-.34,.18,.34,0,9,"#e8eef5","#c7d2de","#aab8c7")}${lbox(-.15,-.16,.15,.14,9,7,"#5f7d9c","#4b6886","#3e5872")}</g>`;
  g+= reduce?`<g transform="translate(${ip(9.7,4)[0]} ${ip(9.7,4)[1]})">${car}</g>`:`<g>${car}<animateMotion dur="7s" repeatCount="indefinite" path="M${ip(9.7,-3.5).join(",")} L${ip(9.7,9.5).join(",")}"/></g>`;
  // plaza base slab
  g+=`<polygon points="${P([ip(-.12,-.12),ip(8.12,-.12),ip(8.12,6.12),ip(-.12,6.12)])}" fill="#bfae95"/>`;
  // tiles, back to front
  const tm=tileMap(S.a), order=[...tm.keys()].sort((a,b)=>{const[x1,y1]=tileCR(a),[x2,y2]=tileCR(b);return (x1+y1)-(x2+y2)||x1-x2;});
  g+=`<g id="tiles">${order.map(t=>{const[c,r]=tileCR(t),[x,y]=ip(c+.5,r+.5);return `<g id="tl_${t}" data-u="${tm[t]}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><g class="tc">${tileArt(tm[t],t)}</g></g>`;}).join("")}</g>`;
  // walkers along the Wentworth St frontage and across from the crossing
  g+=`<g id="walkers">${walkers(reduce)}</g>`;
  // south: new Council building, cut away so the square stays visible
  g+=isoBox(-3.4,6.5,8,8.4,0,12,"#e6dccb","#cdbfa8","#b7a88f")+`<polygon points="${P([ip(-3.4,8.4,12),ip(8,8.4,12),ip(8,8.4,96),ip(-3.4,8.4,96)])}" fill="none" stroke="rgba(60,80,110,.35)" stroke-dasharray="5 4"/><polygon points="${P([ip(8,6.5,12),ip(8,8.4,12),ip(8,8.4,96),ip(8,6.5,96)])}" fill="none" stroke="rgba(60,80,110,.35)" stroke-dasharray="5 4"/>`;
  // night
  g+=`<polygon id="nightVeil" points="${P([ip(-6,-6,200),ip(14,-6,200),ip(14,12),ip(-6,12)])}" fill="#0b1633" style="opacity:${S.night?.55:0}"/>`;
  g+=`<g id="glows" class="glow">${glows()}</g><g id="nameplates">${nameplates()}</g>`;
  // edge labels and quests
  const lab=(t,[x,y],o="")=>`<text class="elab" x="${x}" y="${y}" text-anchor="middle" ${o}>${esc(t)}</text>`;
  g+=lab(L("北 · 历史联排楼（餐饮）","N · heritage townhouse (dining)"),ip(3.6,-1.4,64));
  g+=lab(L("西 · Council 新楼 · 文化空间","W · Council building · cultural space"),ip(-1.9,2,132));
  g+=lab(L("南 · Council 新楼（餐饮界面）","S · new Council building (active edge)"),ip(2.3,7.5,28));
  g+=lab(L("Wentworth St · 单向南行","Wentworth St · one-way south"),ip(10.75,4.6,0),`transform="rotate(-26.6 ${ip(10.75,4.6)[0]} ${ip(10.75,4.6)[1]})"`);
  g+=lab(L("抬高横道 · Rivoli Way","raised crossing · Rivoli Way"),ip(10.2,1.5,-16));
  g+=quest(...ip(4,3,96),1,"square",L("广场","The square"))+quest(...ip(9.6,.6,40),2,"street",L("街道","Street"))+quest(...ip(3.6,-1.4,96),3,"north",L("周边建筑","Buildings"))+quest(...ip(5.5,7.4,60),4,"below",L("地下","Below"));
  // compass: north points up-right in this view
  const VBX=-395,VBY=-240,VBW=850,VBH=520, nx=VBX+34, ny=VBY+VBH-34;
  g+=`<g transform="translate(${nx} ${ny})"><circle r="16" fill="rgba(255,255,255,.85)" stroke="#9aa"/><path d="M0 0 ${(ISO.HW*.4).toFixed(1)} ${(-ISO.HH*.4).toFixed(1)}" stroke="#13202e" stroke-width="2.5" /><text x="18" y="-12" font-size="12" font-weight="800" fill="#13202e">N</text></g>`;
  return `<svg class="iso" id="isoSvg" viewBox="${VBX} ${VBY} ${VBW} ${VBH}" role="img" aria-label="${L("Woodhouse Square 2.5D 示意","Woodhouse Square 2.5D view")}">${g}</svg>`;
}
function walkers(reduce){
  const walkC=[];tileMap(S.a).forEach((u,t)=>{if(u==="walk"){const c=tileCR(t)[0];if(!walkC.includes(c))walkC.push(c);}});
  const n=Math.max(1,Math.min(6,Math.round(S.a.walk/60))), cols=["#2c5aa0","#e2583e","#4f9a5b","#8a63b8","#d08a2c","#13202e"];
  let s="";
  for(let i=0;i<n;i++){
    const c=(walkC.length?walkC[i%walkC.length]:7.6)+.5+(i%2?.18:-.18), down=i%2===0;
    const a=ip(c,-.1),b=ip(c,6.1),from=down?a:b,to=down?b:a,[sx,sy]=ip(c,1+i*.8);
    s+=reduce?person(sx,sy,cols[i%6]):`<g>${person(0,0,cols[i%6])}<animateMotion dur="${9+i*1.7}s" begin="-${i*2.3}s" repeatCount="indefinite" path="M${from.join(",")} L${to.join(",")}"/></g>`;
  }
  // one person crossing from the raised crossing into the square
  if(!reduce){const a=ip(10.4,1.5),b=ip(1,1.5);s+=`<g>${person(0,0,"#e2583e")}<animateMotion dur="14s" repeatCount="indefinite" path="M${a.join(",")} L${b.join(",")}"/></g>`;}
  return s;
}
function glows(){ // drawn above the night veil so lights read at night
  const G={events:[0,-20,24,"gWarm"],culture:[0,-28,22,"gRed"],smart:[11,-40,30,"gWarm"]};
  return tileMap(S.a).map((u,t)=>{const q=G[u];if(!q)return"";const[c,r]=tileCR(t),[x,y]=ip(c+.5,r+.5);return `<circle cx="${(x+q[0]).toFixed(1)}" cy="${(y+q[1]).toFixed(1)}" r="${q[2]}" fill="url(#${q[3]})"/>`;}).join("");
}
function nameplates(){
  const tm=tileMap(S.a);let s="";
  ["green","active","smart","move"].forEach(gk=>{const ts=tm.map((u,t)=>[u,t]).filter(([u])=>MODULES.find(m=>m.id===u).g===gk).map(([,t])=>tileCR(t));if(!ts.length)return;
    const cx=ts.reduce((a,b)=>a+b[0],0)/ts.length+.5,cy=ts.reduce((a,b)=>a+b[1],0)/ts.length+.5,[x,y]=ip(cx,cy,gk==="green"?78:56);
    s+=plate(x,y,`${T(GROUPS[gk])} ${pct(gsum(gk))}%`,GROUPS[gk].c);});
  return s;
}
/* live update: only tiles whose use changed are redrawn, with a pop-in */
function isoUpdate(){
  const svg=document.getElementById("isoSvg"); if(!svg) return;
  const tm=tileMap(S.a);
  tm.forEach((u,t)=>{const el=document.getElementById("tl_"+t); if(!el||el.dataset.u===u) return; el.dataset.u=u;
    el.innerHTML=`<g class="tc pop">${tileArt(u,t)}</g>`;});
  const reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById("walkers").innerHTML=walkers(reduce);
  document.getElementById("nameplates").innerHTML=nameplates();
  document.getElementById("glows").innerHTML=glows();
}
function isoGrow(){const s=crownScale();document.querySelectorAll("#isoSvg .crown,#isoSvg .shd").forEach(e=>e.style.transform=`scale(${s})`);}
function isoNight(){const v=document.getElementById("nightVeil");if(v)v.style.opacity=S.night?.55:0;const svg=document.getElementById("isoSvg");if(svg)svg.classList.toggle("night",!!S.night);}

/* ---------- pictogram results (values from computeV; Scenario 0 vs yours) ---------- */
function costSplit(a,year){const yrs=year-2026;const b=[0,1].map(i=>MODULES.reduce((s,m)=>s+a[m.id]*COEF.capex[m.id][i],0)/1000),u=[0,1].map(i=>MODULES.reduce((s,m)=>s+a[m.id]*COEF.opex[m.id][i]*yrs,0)/1000);return {b,u};}
function picto(id,v,opt={}){
  const c=opt.grey?"#8e9bab":opt.c||"var(--accent)", W=150,H=86; let g="";
  const lo=v[0],hi=v[1];
  if(id==="shade"){const n=48,a=Math.round(lo/25),b=Math.round(hi/25);for(let t=0;t<n;t++){const col=Math.floor(t/6),row=t%6;const f=t<a?c:t<b?c:"var(--surface-2)";g+=`<rect x="${4+col*18}" y="${4+row*13}" width="16" height="11" rx="2" fill="${f}" fill-opacity="${t<a?1:t<b?.4:1}"/>`;}}
  else if(id==="storm"){const max=opt.max||Math.max(hi,1);const hl=70*lo/max,hh=70*hi/max;g+=`<rect x="45" y="8" width="60" height="72" rx="8" fill="var(--surface-2)" stroke="var(--line)"/><rect x="47" y="${78-hh}" width="56" height="${hh}" rx="6" fill="${c}" fill-opacity=".35"/><rect x="47" y="${78-hl}" width="56" height="${hl}" rx="6" fill="${c}"/><path d="M118 30c0 0-8 9-8 14a8 8 0 0 0 16 0c0-5-8-14-8-14z" fill="${c}"/>`;}
  else if(id==="econ"){const unit=opt.unit||25,a=Math.round(lo/unit),b=Math.min(40,Math.round(hi/unit));for(let i=0;i<b;i++){const x=6+(i%10)*14,y=8+Math.floor(i/10)*20;g+=`<g opacity="${i<a?1:.3}"><circle cx="${x+5}" cy="${y+3}" r="3" fill="${c}"/><rect x="${x+1}" y="${y+7}" width="8" height="9" rx="3" fill="${c}"/></g>`;}}
  else if(id==="access"){g+=`<rect x="6" y="8" width="138" height="72" rx="6" fill="var(--surface-2)"/>`;const hl=72*lo/100,hh=72*hi/100;g+=`<rect x="6" y="${44-hh/2}" width="138" height="${hh}" fill="${c}" fill-opacity=".3"/><rect x="6" y="${44-hl/2}" width="138" height="${hl}" fill="${c}"/>`+[0,1,2,3].map(i=>person(28+i*30,50+(i%2?-6:4),"#fff",.8)).join("");}
  else if(["safety","incl","culture"].includes(id)){const ang=p=>Math.PI*(1-p/100),pt=(p,r)=>[75+r*Math.cos(ang(p)),78-r*Math.sin(ang(p))];const arc=(p0,p1,r)=>{const[a,b]=pt(p0,r),[x,y]=pt(p1,r);return `M${a} ${b}A${r} ${r} 0 0 1 ${x} ${y}`;};
    g+=`<path d="${arc(0,100,58)}" stroke="var(--surface-2)" stroke-width="14" fill="none"/><path d="${arc(Math.max(0,lo),Math.min(100,hi),58)}" stroke="${c}" stroke-width="14" fill="none"/><path d="M${pt(50,46).join(" ")}L${pt(50,70).join(" ")}" stroke="var(--fg)" stroke-width="2"/><text x="75" y="76" text-anchor="middle" font-size="18" font-weight="700" fill="var(--fg)">${fmt((lo+hi)/2)}</text>`;}
  else if(id==="cost"){const s=opt.split,unit=250,nb=[0,1].map(i=>Math.round(s.b[i]/unit)),nu=[0,1].map(i=>Math.round(s.u[i]/unit));let x=6;const blk=(n0,n1,col)=>{let o="";for(let i=0;i<n1;i++){const col_=Math.floor(x/1);o+=`<rect x="${6+(i%12)*11.5}" y="${70-Math.floor(i/12)*13}" width="10" height="11" rx="2" fill="${col}" fill-opacity="${i<n0?1:.3}"/>`;}return o;};
    g+=`<g>${blk(nb[0],nb[1],c)}</g><g transform="translate(0 -${(Math.ceil(nb[1]/12)||1)*13+4})">${blk(nu[0],nu[1],opt.grey?"#b7c0cc":"#d08a2c")}</g>`;}
  else if(id==="carbon"){const unit=20,a=Math.round(lo/unit),b=Math.min(18,Math.round(hi/unit));for(let i=0;i<b;i++){const x=8+(i%6)*23,y=14+Math.floor(i/6)*24;g+=`<path d="M${x} ${y+12}h16a5 5 0 0 0-1-10 7 7 0 0 0-13 1 5 5 0 0 0-2 9z" fill="${opt.grey?"#8e9bab":"#7d8794"}" opacity="${i<a?1:.3}"/>`;}}
  return `<svg class="pic" viewBox="0 0 ${W} ${H}" aria-hidden="true">${g}</svg>`;
}
const PIC_UNIT={shade:L=>L("1 格 = 25 m²","1 cell = 25 m²"),storm:L=>L("水位 = 低–高","Level = low–high"),econ:L=>L("1 人形 = 25 人","1 figure = 25 people"),access:L=>L("路带宽 = 畅通比例","Band = clear share"),safety:L=>L("相对指数，方案 0 = 50","Index, Scenario 0 = 50"),incl:L=>L("相对指数，方案 0 = 50","Index, Scenario 0 = 50"),culture:L=>L("相对指数，方案 0 = 50","Index, Scenario 0 = 50"),cost:L=>L("1 块 = $25 万（下排建设，上排维护）","1 block = $250k (build below, upkeep above)"),carbon:L=>L("1 朵 = 20 t CO₂e","1 cloud = 20 t CO₂e")};
