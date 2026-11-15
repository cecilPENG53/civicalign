/* ===== variants/shared.js: UI pieces shared by the three variants ===== */
const MEM={};
const store={get(k){try{const v=localStorage.getItem(k);if(v!==null)return JSON.parse(v)}catch(e){}return k in MEM?MEM[k]:null},set(k,v){MEM[k]=v;try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const S={night:false,lang:"zh",role:"resident",age:null,postcode:"",pri:["shade","econ","access"],react:{},note:{},a:{...PRESETS.base.a},plant:"planter",year:2041,exp:"",wish:"",theme:null};
(()=>{const l=store.get("cav_lang");if(l==="zh"||l==="en")S.lang=l;const t=store.get("cav_theme");if(t==="light"||t==="dark")S.theme=t;})();

/* theme: system by default, the toggle sets data-theme */
function applyTheme(){const r=document.documentElement;if(S.theme)r.setAttribute("data-theme",S.theme);else r.removeAttribute("data-theme");}
function isDark(){return S.theme?S.theme==="dark":(window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches);}
function toggleTheme(){S.theme=isDark()?"light":"dark";store.set("cav_theme",S.theme);applyTheme();}
applyTheme();
const themeLabel=()=>isDark()?L("浅色","Light"):L("深色","Dark");
const langToggle=()=>`<div class="tgl" role="group" aria-label="Language"><button id="lZh" aria-pressed="${S.lang==="zh"}">中文</button><button id="lEn" aria-pressed="${S.lang==="en"}">EN</button></div>`;
const themeBtn=()=>`<div class="tgl"><button id="themeBtn" aria-label="${L("切换深浅色","Toggle theme")}">${isDark()?"☀":"☾"} ${themeLabel()}</button></div>`;

const ASSUME=()=>`<span class="tag t-design">${L("假设","Assumption")}</span>`;
const TRAFFIC_WAIT=()=>`<span class="tag t-gap">${L("等待 Council 交通研究","Awaits Council traffic study")}</span>`;
function noticeHTML(){return L(
  "<b>参赛原型。</b>Council 的事实都附来源和页码（点绿色标签看原文）。广场分配的系数和方案 0 的比例是团队假设，还没用文献核实。这里不收集、不发送任何个人信息。",
  "<b>Competition prototype.</b> Every Council fact carries its source and page (tap a green tag for the original). The square's coefficients and the Scenario 0 split are team assumptions, not yet checked against literature. Nothing personal is collected or sent.");}
function footHTML(){return L(
  `来源：S1 挑战简报；S2 总规草案；S3 Participate Parramatta 项目页；S4 Council 报告 OCM26-56；S5 智慧城市战略。底图 © OpenStreetMap contributors（ODbL），2026-11-10 快照。CivicAlign 是参赛原型，不代表 City of Parramatta。`,
  `Sources: S1 challenge brief; S2 draft master plan; S3 Participate Parramatta page; S4 Council report OCM26-56; S5 Smart City Strategy. Base map © OpenStreetMap contributors (ODbL), snapshot 10 Nov 2026. CivicAlign is a competition prototype and does not represent the City of Parramatta.`);}

/* ---------- allocation controls ---------- */
const PZ={base:{zh:"方案 0 · 总规原样",en:"Scenario 0 · plan as drawn",s:{zh:"假设：我们对总规的解读",en:"Assumption: our reading"}},
          green:{zh:"更凉快、更绿",en:"Cooler and greener",s:{zh:"示例分法",en:"Example split"}},
          night:{zh:"活动和夜市优先",en:"Events and markets first",s:{zh:"示例分法",en:"Example split"}}};
const presetKey=()=>Object.keys(PRESETS).find(k=>MODULES.every(m=>PRESETS[k].a[m.id]===S.a[m.id]))||null;
function presetButtons(){const cur=presetKey();return `<div class="pzs" role="group" aria-label="${L("快速对比","Quick compare")}">${Object.keys(PRESETS).map(k=>`<button class="pz pz-${k}" data-preset="${k}" aria-pressed="${cur===k}" title="${esc(T(PRESETS[k]))}">${T(PZ[k])}<small>${T(PZ[k].s)}</small></button>`).join("")}</div>`;}
const pctP=v=>(100*v/TOTAL).toFixed(1)+"%";
function groupCards(){return `<div class="gcards">${Object.keys(GROUPS).map(g=>`<div class="gcard" style="--gc:${GROUPS[g].c}">
  <div class="gtop"><span class="gic">${ICON[MODULES.find(m=>m.g===g).id]("#fff")}</span><div class="gname"><b>${T(GROUPS[g])}</b><small>${T(GDESC[g])}</small></div><span class="gval"><span id="gv_${g}">${pct(gsum(g))}%</span><small id="gm_${g}">${fmt(gsum(g))} m²</small></span></div>
  <input class="rg" type="range" min="0" max="${TOTAL}" step="10" value="${gsum(g)}" data-grp="${g}" id="g_${g}" style="--c:${GROUPS[g].c};--p:${pctP(gsum(g))}" aria-label="${esc(T(GROUPS[g]))}"></div>`).join("")}</div>`;}
function moduleRows(){return `<details class="more"><summary>${L("细分到 10 类用途","Fine-tune all 10 uses")}</summary><div class="mods">${MODULES.map(m=>`<div class="mod"><label class="nm" for="m_${m.id}"><span class="mic">${ICON[m.id](GROUPS[m.g].c)}</span>${T(m)}<small>${L("角色","Role")} ${m.role} · ${L("战略行动","Action")} ${m.act} · ${L("方案 0","Scen. 0")} ${m.base} m²</small></label>
  <input class="rg" type="range" id="m_${m.id}" data-mod="${m.id}" min="0" max="${TOTAL}" step="10" value="${S.a[m.id]}" style="--c:${GROUPS[m.g].c};--p:${pctP(S.a[m.id])}"><output id="o_${m.id}">${fmt(S.a[m.id])} m²</output></div>`).join("")}</div>
  <p class="small muted" style="margin:6px 0 0">${L("角色 D/P/A 和战略行动编号","Roles D/P/A and action numbers")} ${chip("S5","p.33")}</p></details>`;}
function plantButtons(){return `<div class="pill" role="group" aria-label="${L("种树方式","Planting")}"><button data-plant="planter" aria-pressed="${S.plant==="planter"}">${L("抬高种植池","Raised planters")}</button><button data-plant="deep" aria-pressed="${S.plant==="deep"}">${L("深土种植","Deep soil")}</button></div>`;}
function yearButtons(ys=[2026,2041,2050]){return `<div class="pill" role="group" aria-label="${L("年份","Year")}">${ys.map(y=>`<button data-year="${y}" aria-pressed="${S.year===y}">${y}</button>`).join("")}</div>`;}
function syncSliders(active){
  MODULES.forEach(m=>{const r=document.getElementById("m_"+m.id);if(r){if(r!==active)r.value=S.a[m.id];r.style.setProperty("--p",pctP(S.a[m.id]));}const o=document.getElementById("o_"+m.id);if(o)o.textContent=fmt(S.a[m.id])+" m²";});
  for(const g in GROUPS){const r=document.getElementById("g_"+g);if(r){if(r!==active)r.value=gsum(g);r.style.setProperty("--p",pctP(gsum(g)));}const v=document.getElementById("gv_"+g);if(v)v.textContent=pct(gsum(g))+"%";const mm=document.getElementById("gm_"+g);if(mm)mm.textContent=fmt(gsum(g))+" m²";}
  const cur=presetKey();document.querySelectorAll("[data-preset]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.preset===cur));
}
function allocBar(){return `<div class="abar">${Object.keys(GROUPS).map(g=>{const p=pct(gsum(g));return p?`<span style="width:${100*gsum(g)/TOTAL}%;background:${GROUPS[g].c}">${p>=9?`${T(GROUPS[g])} ${p}%`:""}</span>`:"";}).join("")}</div>`;}

/* ---------- computeV: compute() with proxy scores rescaled ----------
   compute() clamps safety, inclusion and culture at 100, so strong splits read "100–100". Here they become a
   relative index against Scenario 0: index = 100·raw/(raw + raw₀), so Scenario 0 ≈ 50 and the scale never clamps. */
function proxyRaw(a,plant,year){const cr=CROWN[plant][year],sh=[0,1].map(i=>Math.min(TOTAL,a.canopy*cr[i]+a.rest*COEF.restShade[i])),sMid=(sh[0]+sh[1])/2;
  const f=w=>{let t=0;for(const k in w)t+=(k==="shade"?sMid:a[k])*w[k];return t;};return {safety:f(W.safety),incl:f(W.incl),culture:f(W.culture)};}
function computeV(a,plant,year){const o=compute(a,plant,year),r=proxyRaw(a,plant,year),r0=proxyRaw(PRESETS.base.a,"planter",year);
  for(const k of ["safety","incl","culture"])o[k]=[0.85,1.15].map(f=>100*r[k]*f/(r[k]*f+r0[k]));return o;}

/* ---------- KPI cards (all values are ranges from team-assumed coefficients) ---------- */
function kpiData(id){
  const you=computeV(S.a,S.plant,S.year), base=computeV(PRESETS.base.a,"planter",S.year);
  const d=DIMS.find(x=>x.id===id), y=you[id], b=base[id];
  const ym=(y[0]+y[1])/2, bm=(b[0]+b[1])/2, raw=(ym-bm)/Math.max(Math.abs(bm),1), rel=d.better==="low"?-raw:raw;
  return {y,b,raw,good:rel>0.005,bad:rel<-0.005,p:Math.round(raw*100)};
}
function deltaHTML(k){return `<div class="kd ${k.good?"delta-up":k.bad?"delta-down":"muted"}">${k.p>0?"▲":k.p<0?"▼":"="} ${fmt(Math.abs(k.p))}% ${L("对比方案 0","vs Scenario 0")}${k.good?L("，更好",", better"):k.bad?L("，更差",", worse"):""}</div>`;}
const KPI_DEF=()=>[
  {id:"shade",c:GROUPS.green.c,ic:"canopy",label:L("遮荫面积","Shaded area"),f:v=>fmt(v),u:"m²",note:k=>L(`约占广场 ${pct((k.y[0]+k.y[1])/2)}%；树冠随年份长大`,`About ${pct((k.y[0]+k.y[1])/2)}% of the square; crowns grow over time`)},
  {id:"econ",c:GROUPS.active.c,ic:"events",label:L("活动与市集容量","Event and market capacity"),f:v=>fmt(v),u:L("人","people"),note:()=>L("同时能容纳的人数","People at one time")},
  {id:"access",c:GROUPS.move.c,ic:"walk",label:L("畅通步行空间","Clear walking space"),f:v=>fmt(v),u:"%",note:()=>`${L("广场内部的比例。周边交通影响：","Inside the square only. Wider traffic effects: ")}${TRAFFIC_WAIT()} ${chip("S4","","tr6")}`},
  {id:"cost",c:GROUPS.smart.c,ic:"smart",label:L("建设 + 维护成本","Build + upkeep cost"),f:v=>fmt(v/1000,2),u:"$M",note:()=>L(`到 ${S.year} 年累计；资金来源未定`,`Total to ${S.year}; funding not settled`)+" "+chip("S2","p.54","sq10")}
];
function kpiCards(ids){return `<div class="kpis">${KPI_DEF().filter(d=>!ids||ids.includes(d.id)).map(d=>{const k=kpiData(d.id);return `<div class="kpi" style="--kc:${d.c}">
  <div class="kh"><b><span class="mic" style="margin:0">${ICON[d.ic](d.c)}</span>${d.label}</b>${ASSUME()}</div>
  <div class="kv">${d.f(k.y[0])}–${d.f(k.y[1])}<small> ${d.u}</small></div>${deltaHTML(k)}<div class="kn">${d.note(k)}</div></div>`;}).join("")}</div>`;}

/* ---------- 9-dimension results, as in screen 4 of app/template.html ---------- */
function resultsRows(){
  const base=computeV(PRESETS.base.a,"planter",S.year), you=computeV(S.a,S.plant,S.year);
  let ws=0,acc=0;
  const rows=DIMS.map(d=>{
    const b=base[d.id], y=you[d.id], max=Math.max(b[1],y[1],1)*1.1, bm=(b[0]+b[1])/2, ym=(y[0]+y[1])/2;
    const raw=(ym-bm)/Math.max(Math.abs(bm),1); let rel=d.better==="low"?-raw:raw; rel=Math.max(-1,Math.min(1,rel));
    const w=S.pri.includes(d.id)?3:1; ws+=w; acc+=w*rel;
    const dec=d.id==="storm"?1:0, p=Math.round(raw*100), good=rel>0.005, bad=rel<-0.005;
    return `<div class="res"><div class="dn ${S.pri.includes(d.id)?"pri":""}">${T(d)}<small>${d.type==="proxy"?L("相对指数，方案 0 ≈ 50","Index, Scenario 0 ≈ 50"):d.unit} · ${d.type==="proxy"?L("代理指标","Proxy score"):L("估算","Estimate")}${d.flag?` · ${TRAFFIC_WAIT()}`:""}</small></div>
      <div class="track" aria-hidden="true"><span class="rng r0" style="left:${100*b[0]/max}%;width:${Math.max(1,100*(b[1]-b[0])/max)}%"></span><span class="rng r1" style="left:${100*y[0]/max}%;width:${Math.max(1,100*(y[1]-y[0])/max)}%"></span></div>
      <div class="vals"><span class="muted">${L("方案 0","Scen. 0")} ${fmt(b[0],dec)}–${fmt(b[1],dec)}</span><br><span class="y">${L("你的","Yours")} ${fmt(y[0],dec)}–${fmt(y[1],dec)}</span> <span class="${good?"delta-up":bad?"delta-down":"muted"}">${p>0?"▲":p<0?"▼":"="}${fmt(Math.abs(p))}%</span></div></div>`;
  }).join("");
  return {rows,fit:Math.round(100*acc/ws)};
}
const resultsKey=()=>`<div class="keyrow"><span><i class="sw" style="background:var(--base)"></i>${L("方案 0：总规原样（假设）","Scenario 0: plan as drawn (assumption)")}</span><span><i class="sw" style="background:var(--accent)"></i>${L("你的方案","Your split")}</span><span>★ ${L("你的优先项（×3）","Your priority (×3)")}</span></div>`;

/* ---------- plaza diagram: iconographic, compass-labelled, indicative only ---------- */
function plazaSVG2(){
  // Edges after S2 p.45 (heritage townhouse north; new Council building south and west, with cultural space),
  // Wentworth St east, one-way southbound (S4), raised crossing aligned to Rivoli Way (S2 p.43). Not a layout design.
  const X=64,Y=48,Wd=300,H=206; let g="";
  const tx=(t,x,y,o={})=>`<text x="${x}" y="${y}" text-anchor="${o.a||"middle"}" font-size="${o.s||10}" font-weight="${o.w||500}" fill="${o.f||"var(--fg)"}" ${o.tr?`transform="${o.tr}"`:""} ${o.halo?'paint-order="stroke" stroke="var(--surface)" stroke-width="3"':""}>${esc(t)}</text>`;
  g+=`<defs><pattern id="pv" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M0 10 10 0" stroke="var(--line)" stroke-width=".6"/></pattern></defs>`;
  // context: buildings and street
  g+=`<rect x="${X}" y="8" width="${Wd}" height="30" rx="4" fill="var(--map-bld)"/>`+tx(L("北 · 历史联排楼（保留餐饮）","N · heritage townhouse (dining)"),X+Wd/2,27);
  g+=`<rect x="${X}" y="${Y+H+10}" width="${Wd}" height="30" rx="4" fill="var(--map-bld)"/>`+tx(L("南 · Council 新楼（餐饮界面）","S · new Council building (active edge)"),X+Wd/2,Y+H+29);
  g+=`<rect x="8" y="${Y}" width="46" height="${H}" rx="4" fill="var(--map-bld)"/>`+tx(L("西 · Council 新楼 · 文化空间","W · Council bldg · cultural space"),0,0,{s:9.5,tr:`translate(35 ${Y+H*0.66}) rotate(-90)`});
  const RX=X+Wd+10;
  g+=`<rect x="${RX}" y="0" width="52" height="${Y+H+50}" fill="var(--map-road)" stroke="var(--map-road-edge)"/>`;
  g+=tx("Wentworth St",0,0,{s:11,w:700,tr:`translate(${RX+36} ${Y+H-40}) rotate(90)`});
  g+=`<path d="M${RX+13} ${Y+H-60} v26 m-5 -7 5 7 5 -7" fill="none" stroke="var(--muted)" stroke-width="1.6"/>`+tx(L("单向南行","one-way S"),RX+13,Y+H-66,{s:8.5,f:"var(--muted)"});
  const cy=Y+58;
  g+=`<g fill="var(--fg)" opacity=".6">${[0,1,2,3,4,5,6].map(i=>`<rect x="${RX+3+i*7}" y="${cy-10}" width="4" height="20"/>`).join("")}</g>`;
  g+=tx(L("抬高横道","raised crossing"),RX+26,cy-15,{s:8.5,f:"var(--muted)",halo:1});
  g+=`<rect x="8" y="${cy-9}" width="46" height="18" fill="var(--accent)" fill-opacity=".22"/>`+tx("Rivoli Way",31,cy+3,{s:8,w:700,f:"var(--accent)"});
  // site
  g+=`<rect x="${X-4}" y="${Y-4}" width="${Wd+8}" height="${H+8}" rx="8" fill="url(#pv)" stroke="var(--fg)" stroke-opacity=".35" stroke-dasharray="4 3"/>`;
  // zones west→east: green | active | smart | move (walking along the Wentworth St frontage)
  const cr=CROWN[S.plant][S.year], crMid=(cr[0]+cr[1])/2;
  let x=X;
  ["green","active","smart","move"].forEach(gk=>{
    const gt=gsum(gk); if(!gt) return; const w=Wd*gt/TOTAL, c=GROUPS[gk].c; let y=Y;
    g+=`<clipPath id="cz_${gk}"><rect x="${x}" y="${Y}" width="${w}" height="${H}"/></clipPath>`;
    MODULES.filter(m=>m.g===gk&&S.a[m.id]>0).forEach(m=>{
      const h=H*S.a[m.id]/gt;
      g+=`<rect x="${x+1.5}" y="${y+1.5}" width="${Math.max(0,w-3)}" height="${Math.max(0,h-3)}" rx="6" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-opacity=".6"/>`;
      const n=Math.max(1,Math.round(S.a[m.id]/25)), step=21;
      const cols=Math.max(1,Math.floor((w-6)/step)), rows=Math.max(1,Math.floor((h-6)/step)), k=Math.min(n,cols*rows);
      const usedRows=Math.ceil(k/cols), ox=x+(w-Math.min(k,cols)*step)/2, oy=y+(h-usedRows*step)/2;
      g+=`<g clip-path="url(#cz_${gk})">`;
      for(let i=0;i<k;i++){const ix=ox+(i%cols)*step+2.5, iy=oy+Math.floor(i/cols)*step+2.5;
        if(m.id==="canopy"){const r=Math.min(16,5.5*Math.sqrt(crMid)+2);g+=`<circle cx="${ix+8}" cy="${iy+8}" r="${r}" fill="${c}" fill-opacity=".42" stroke="${c}" stroke-opacity=".8"/><circle cx="${ix+8}" cy="${iy+8}" r="1.6" fill="${c}"/>`;}
        else g+=`<g transform="translate(${ix} ${iy})">${ICON[m.id](c)}</g>`;}
      g+=`</g>`;
      if(w>=58&&h>=26) g+=tx(T(m).split(/[（(,，、]/)[0],x+6,y+13,{a:"start",s:8.5,w:700,f:c,halo:1});
      y+=h;
    });
    x+=w;
  });
  // compass
  g+=`<g transform="translate(${X-30} 22)"><circle r="11" fill="var(--surface)" stroke="var(--line)"/><path d="M0 -8 4 4 0 1 -4 4z" fill="var(--fg)"/>${tx("N",0,-13,{s:9,w:700})}</g>`;
  return `<svg class="plaza" viewBox="0 0 430 ${Y+H+48}" role="img" aria-label="${L("广场用途示意图","Diagram of uses in the square")}">${g}</svg>`;
}
const plazaCaption=()=>`<p class="small muted" style="margin:4px 0 0">${L("示意图，不是设计方案。每个图标约 25 m²，树冠大小随年份和种植方式变化。周边关系依据","Diagram only, not a design. Each icon is about 25 m²; crowns grow with the year and planting type. Edges from")} ${chip("S2","p.45","sq5")} ${chip("S2","p.43","tr2")} ${chip("S4","","tr1")}</p>`;

/* ---------- base map from data/precinct.json (OSM, 10 Nov 2026) ---------- */
const HOTS=[
  {id:"square",x:1,y:64,zh:"Woodhouse Square",en:"Woodhouse Square",claims:["sq1","sq2","sq3","sq4","sq5","sq7","sq8","sq9","sq10","sq11","sq12"]},
  {id:"china",x:-104,y:4,zh:"Church St · 唐人街",en:"Church St · Chinatown",claims:["ct1","ct2","ct3","ct4","ct5","ct6","ct7"]},
  {id:"went",x:30,y:128,zh:"Wentworth St",en:"Wentworth St",claims:["tr1","tr2","sq1","tr6"]},
  {id:"fitz",x:-24,y:-50,zh:"Fitzwilliam St",en:"Fitzwilliam St",claims:["tr1","tr4","tr5","tr6"]},
  {id:"park",x:-38,y:96,zh:"车站停车场",en:"Station car park",claims:["tr3","tr8","tr7"]}
];
function sqInner(o){
  const on=k=>o.hl===k; let sx=-14; const sq=[];
  if(o.alloc){["green","active","smart","move"].forEach(k=>{const w=30*gsum(k)/TOTAL;if(w>0)sq.push(`<rect x="${sx}" y="44" width="${w}" height="40" fill="${GROUPS[k].c}"/>`);sx+=w;});}
  return (o.alloc?`<clipPath id="sqc"><rect x="-14" y="44" width="30" height="40" rx="3"/></clipPath><g clip-path="url(#sqc)">${sq.join("")}</g><rect x="-14" y="44" width="30" height="40" rx="3" fill="none" stroke="var(--fg)" stroke-width="1.2"/>`:`<rect x="-14" y="44" width="30" height="40" rx="3" fill="var(--accent)" fill-opacity=".9"/>`)
   +`<circle cx="1" cy="64" r="${on("square")?26:22}" fill="none" stroke="var(--accent)" stroke-width="${on("square")?2.5:1.5}" stroke-dasharray="3 3"/>`;
}
function mapSVG2(o={}){
  const vb=o.vb||[-185,-200,440,530];
  const pts=a=>{let s="";for(let i=0;i<a.length;i+=2)s+=`${a[i]},${-a[i+1]} `;return s.trim();};
  const x0=vb[0]-40,x1=vb[0]+vb[2]+40,y0=-(vb[1]+vb[3])-40,y1=-vb[1]+40;
  const inView=a=>{for(let i=0;i<a.length;i+=2){if(a[i]>x0&&a[i]<x1&&a[i+1]>y0&&a[i+1]<y1)return true;}return false;};
  let g="";
  g+=MAP.G.filter(x=>inView(x.p)).map(x=>`<polygon points="${pts(x.p)}" fill="var(--map-green)"/>`).join("");
  g+=MAP.R.filter(x=>inView(x.p)).map(x=>`<polyline points="${pts(x.p)}" fill="none" stroke="var(--map-road-edge)" stroke-width="${x.w+2}" stroke-linecap="round" stroke-linejoin="round"/>`).join("");
  g+=MAP.R.filter(x=>inView(x.p)).map(x=>`<polyline points="${pts(x.p)}" fill="none" stroke="var(--map-road)" stroke-width="${x.w}" stroke-linecap="round" stroke-linejoin="round"/>`).join("");
  g+=MAP.RL.filter(inView).map(p=>`<polyline points="${pts(p)}" fill="none" stroke="var(--map-rail)" stroke-width="2" stroke-dasharray="6 3"/>`).join("");
  g+=MAP.B.filter(b=>inView(b.p)).map(b=>{const cp=/Carpark/.test(b.n||"");return `<polygon points="${pts(b.p)}" fill="${cp?"var(--infer)":"var(--map-bld)"}" ${cp?'fill-opacity=".5" data-cp="1"':""}/>`;}).join("");
  const on=k=>o.hl===k?1:0;
  // highlight layers (positions read off the OSM base map; indicative)
  g+=`<g class="hl" data-k="phase" style="opacity:${o.hl&&o.hl!=="phase"?.35:1}"><polygon points="${pts(MAP.P)}" fill="${on("phase")?"var(--accent)":"none"}" fill-opacity=".08" stroke="var(--fg)" stroke-width="${on("phase")?2.5:1.5}" stroke-dasharray="5 4"/></g>`;
  g+=`<g class="hl" data-k="china" style="opacity:${on("china")}"><path d="M-110 -60 L-101 150" stroke="#d0453a" stroke-width="16" stroke-opacity=".35" stroke-linecap="round" fill="none"/>${[...Array(6)].map((_,i)=>`<circle cx="${-108+i*1.5}" cy="${-40+i*36}" r="4" fill="#d0453a"/>`).join("")}</g>`;
  const arrow=(x1,y1,x2,y2,c)=>{const a=Math.atan2(y2-y1,x2-x1),hx=x2-11*Math.cos(a),hy=y2-11*Math.sin(a),px=6*Math.sin(a),py=-6*Math.cos(a);return `<line x1="${x1}" y1="${y1}" x2="${hx}" y2="${hy}" stroke="${c}" stroke-width="5" stroke-linecap="round"/><polygon points="${x2},${y2} ${hx+px},${hy+py} ${hx-px},${hy-py}" fill="${c}"/>`;};
  g+=`<g class="hl" data-k="traffic" style="opacity:${on("traffic")}">${arrow(26,2,30,150,"#3f7cc0")}${arrow(60,-52,-95,-58,"#3f7cc0")}<path d="M-95 -48 L60 -42" stroke="#4f9a5b" stroke-width="3" stroke-dasharray="4 4" fill="none"/></g>`;
  g+=`<g class="hl" data-k="council" style="opacity:${on("council")}"><circle cx="-18" cy="66" r="58" fill="none" stroke="var(--infer)" stroke-width="2.5" stroke-dasharray="6 4"/></g>`;
  // the square: tinted by the current allocation, west→east
  g+=`<g id="sqg">${sqInner(o)}</g>`;
  const lab=(t,x,y,anchor="middle",w=600,s=11)=>`<text class="lab" x="${x}" y="${-y}" text-anchor="${anchor}" font-size="${s}" font-weight="${w}">${esc(t)}</text>`;
  if(!o.noLabels){
    g+=lab("Church St",-122,-40)+lab("Parkes St",70,-152)+lab("Wentworth St",52,-40)+lab("Fitzwilliam St",-55,62)+lab("Jubilee Park",80,-225,"middle",500)+(o.hots?"":lab("Woodhouse Sq",34,-92,"start",700));
    g+=lab(L("↑ 车站","↑ Station"),-40,175,"middle",500);
  }
  if(o.hots){g+=HOTS.map((h,i)=>{const sel=o.sel===h.id;return `<g class="hot" data-hot="${h.id}" role="button" tabindex="0" aria-label="${esc(T(h))}" aria-pressed="${sel}" transform="translate(${h.x} ${h.y})"><g class="hs">
     <circle class="pulse" r="15" fill="var(--accent)" fill-opacity=".22"/><circle r="${sel?12:10}" fill="${sel?"var(--fg)":"var(--accent)"}" stroke="var(--surface)" stroke-width="2.5"/>
     <text y="4.5" text-anchor="middle" font-size="12" font-weight="700" fill="var(--surface)" style="pointer-events:none">${i+1}</text>
     <text class="hlab" x="18" y="4.5" font-size="13" font-weight="700" fill="var(--fg)" paint-order="stroke" stroke="var(--map-bg)" stroke-width="4" stroke-linejoin="round">${esc(T(h))}</text></g></g>`;}).join("");}
  // compass and scale (1 map unit = 1 m in the OSM projection)
  if(!o.noChrome){const cx=vb[0]+vb[2]-22, cyy=vb[1]+24;
  g+=`<g transform="translate(${cx} ${cyy})"><circle r="12" fill="var(--surface)" stroke="var(--line)"/><path d="M0 -9 4.5 4.5 0 1 -4.5 4.5z" fill="var(--fg)"/><text class="lab" y="-15" text-anchor="middle" font-size="10" font-weight="700">N</text></g>`;
  const bx=vb[0]+14, by=vb[1]+vb[3]-16;
  g+=`<g><rect x="${bx}" y="${by-3}" width="100" height="4" fill="var(--fg)"/><rect x="${bx+50}" y="${by-3}" width="50" height="4" fill="var(--surface)" stroke="var(--fg)" stroke-width=".8"/><text class="lab" x="${bx}" y="${by-7}" font-size="9">0</text><text class="lab" x="${bx+100}" y="${by-7}" font-size="9" text-anchor="middle">100 m</text></g>`;}
  return `<svg class="basemap" viewBox="${vb.join(" ")}" preserveAspectRatio="xMidYMid ${o.slice?"slice":"meet"}" ${o.hots?"":'role="img"'} aria-label="${L("CBD South 第一期范围底图","Base map of CBD South Phase 1")}">${g}</svg>`;
}

/* ---------- deliverable cards (screen 2 content) ---------- */
/* ---------- review gate (demo): the team approves, edits or rejects each claim; rejected claims never reach residents.
   Reviewer is always "team member (demo)". This is never Council approval. Stored in this browser only. ---------- */
S.review=store.get("cav_review")||{};
const REVIEWER=()=>L("团队成员（演示）","Team member (demo)");
const REJ_WHY=()=>[["quote",L("原文不符","Does not match the source")],["context",L("断章取义","Out of context")],["page",L("页码错","Wrong page")],["stale",L("过时","Out of date")]];
const rv=id=>S.review[id]||null;
const isRejected=id=>(rv(id)||{}).st==="rej";
function setReview(id,o){if(o)S.review[id]={...o,by:"demo",at:new Date().toLocaleDateString("en-CA")};else delete S.review[id];store.set("cav_review",S.review);}
function claimTxt(x){const r=rv(x.id);return r&&r.st==="edit"&&r.txt&&r.txt[S.lang]?esc(r.txt[S.lang])+` <span class="tag t-design">${L("团队已修改","Edited by team")}</span>`:T(x);}
const HIDDEN_PH=()=>`<li class="rej-ph">${L("此条未通过核对，暂不向居民显示。","This line did not pass review and is hidden from residents.")}</li>`;
function claimList(cid,kinds=["planned","ruled","open","gap"]){
  const cl=CLAIMS.filter(x=>x.card===cid);
  return kinds.map(k=>{const xs=cl.filter(x=>x.kind===k);if(!xs.length)return"";return `<div class="kind">${kindLabel(k)}</div><ul class="claims">${xs.map(x=>isRejected(x.id)?HIDDEN_PH():`<li>${claimTxt(x)} ${x.src?chip(x.src,x.pg,x.id):`<span class="tag t-gap">${L("来源里没有","No source has this")}</span>`}</li>`).join("")}</ul>`;}).join("");
}
function claimsById(ids){return `<ul class="claims">${ids.map(id=>CLAIMS.find(c=>c.id===id)).map(x=>isRejected(x.id)?HIDDEN_PH():`<li><span class="tag ${x.kind==="open"?"t-infer":x.kind==="gap"?"t-gap":"t-fact"}">${kindLabel(x.kind)}</span> ${claimTxt(x)} ${x.src?chip(x.src,x.pg,x.id):""}${x.id==="tr6"?" "+TRAFFIC_WAIT():""}</li>`).join("")}</ul>`;}
function reactRow(cid){const r=S.react[cid];return `<div class="pill" role="group" aria-label="${L("你觉得呢","What do you think")}" style="margin-top:8px;align-items:center"><b class="small">${L("你觉得呢？","Your view?")}</b>${[["yes",L("支持","Support")],["unsure",L("不确定","Not sure")],["no",L("有顾虑","Concerned")]].map(([k,t])=>`<button data-react="${cid}" data-v="${k}" aria-pressed="${r===k}">${t}</button>`).join("")}</div>`;}
const TIMELINE=()=>[
  ["2025-06",L("决议编制总规","Decides to prepare a master plan"),chip("S4","")],
  ["2025-08",L("研究在 Church St 设唐人街","Studies a Chinatown on Church St"),chip("S4","")],
  ["2025-07–11",L("比较大公园、会展中心、餐饮夜生活 + 广场，选了第三种","Compares a park, a convention centre, and dining and nightlife with a square; picks the third"),chip("S4","","sq6")],
  [L("方案比选","Options test"),L("3,500 m² 大开放空间被淘汰；选带 1,200 m² 广场的方案 3","Drops a 3,500 m² open space; picks Scheme 3 with a 1,200 m² plaza"),chip("S2","p.23","sq7")],
  [L("位置比选","Location test"),L("地块内部两个位置被否决，广场放在临 Wentworth St","Rejects two inner-block sites; puts the plaza on Wentworth St"),chip("S2","p.23","sq8")],
  ["2026-04-28",L("一致同意公示","Votes unanimously to exhibit"),chip("S3","")],
  ["2026-05–06",L("公示，意见在审阅中","Exhibition; submissions under review"),chip("S3","")]];

/* ---------- who decides, feedback, Council demo ---------- */
function dpaCards(withA){const by={D:0,"D+P":0,P:0};MODULES.forEach(m=>by[m.role]+=S.a[m.id]);
  return `<div class="dpa">${[["D",L("Council 直接负责","Council delivers"),L("树冠、雨水花园、座椅、步行、路缘、照明","Canopy, rain gardens, seating, walking, kerb, lighting")],["D+P",L("Council 牵头，与伙伴合作","Council leads with partners"),L("活动和夜市、自行车、回收","Events and markets, bikes, recycling")],["P",L("主要靠伙伴","Mainly partners"),L("文化表达：艺术家、华人社团、First Nations 团体","Cultural expression: artists, Chinese community groups, First Nations groups")]].map(([k,t,d])=>`<div class="dpac"><b>${k}</b><span>${t}</span><div class="big" id="dpa_${k.replace("+","")}">${fmt(by[k])} m²</div><small>${d}</small></div>`).join("")}</div>
  ${withA?advCard():""}
  <p class="small muted" style="margin-top:6px">${L("D = Council 自己做，P = 和伙伴一起做，A = 向州政府等争取","D = Council delivers, P = partners, A = advocates to others such as the State")} ${chip("S5","p.33")}</p>`;}
/* A tier: no square metres, a list of what Council has to win from others */
function advCard(){const items=[
   [L("交通研究：第二期总规之后与 TfNSW 一起做","Traffic study: with TfNSW, after the Phase 2 master plan"),chip("S2","p.54")+" "+chip("S4","","tr6"),"tr6"],
   [L("车站和 Argyle St 公交换乘站留到第二期","Station and Argyle St bus interchange wait for Phase 2"),chip("S4","","tr7"),"tr7"],
   [L("建设资金可能包括州和联邦拨款","Funding may include State and Federal grants"),chip("S2","p.54","sq10"),"sq10"]];
  return `<div class="dpac dpa-a"><b>A</b><span>${L("需向他方争取","Advocate to others")}</span><small>${L("不对应广场面积，列的是要向州政府等争取的事","No floor area; these are things Council must win from others such as the State")}</small>
   <ul class="claims">${items.map(([t,c,id])=>isRejected(id)?HIDDEN_PH():`<li>${t} ${c}</li>`).join("")}</ul></div>`;}
function syncDpa(){const by={D:0,"D+P":0,P:0};MODULES.forEach(m=>by[m.role]+=S.a[m.id]);for(const k in by){const e=document.getElementById("dpa_"+k.replace("+",""));if(e)e.textContent=fmt(by[k])+" m²";}}
function feedbackHTML(){const subs=store.get("cav_subs")||[];
  return `<label class="f" for="exp">${L("你现在在这一带的体验是什么？比如晚上走、等车、带孩子、做生意。","What is it like around here now? Walking at night, waiting for a bus, with kids, running a shop.")}</label><textarea id="exp">${esc(S.exp)}</textarea>
  <label class="f" for="wish" style="margin-top:8px">${L("这个广场怎样才对你有用？","What would make this square work for you?")}</label><textarea id="wish">${esc(S.wish)}</textarea>
  <p class="small muted">${L("请不要写姓名、电话或住址。按“最少必要数据”原则，我们只问身份和可选的年龄段、邮编","Please leave out names, phone numbers and addresses. Under the minimum-data rule we only ask your role, and optionally age band and postcode")} ${chip("S5","p.30")}。</p>
  <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button class="btn primary" id="submit">${L("提交（演示）","Submit (demo)")}</button><span class="small muted" id="subMsg">${subs.length?L(`本浏览器已保存 ${subs.length} 份演示提交，没有发送给 Council。`,`${subs.length} demo submission(s) saved in this browser only. Nothing was sent to Council.`):L("演示版只保存在你的浏览器里，不会发送给任何人。","In this demo your answers stay in your browser and are not sent anywhere.")}</span></div>`;}
function submitDemo(){const subs=store.get("cav_subs")||[];subs.push({t:Date.now(),role:S.role,pri:S.pri,react:S.react,a:S.a,exp:S.exp,wish:S.wish,seen:(S.seen||[]).slice(),duel:S.duel?S.duel.res.slice():[]});store.set("cav_subs",subs);}
const TEAM_CHECKED=()=>L("本演示里的条目由团队人工整理和核对，<b>不是 Council 批准的</b>。","In this demo the team extracted and checked every entry by hand; <b>Council has not approved them</b>.");
let RV_EDIT=null;
function statusCell(c){
  if(!c.src) return `<span class="status st-gap">${L("证据空白","Gap")}</span>`;
  const r=rv(c.id), w=r&&r.st==="rej"?(REJ_WHY().find(x=>x[0]===r.why)||[,""])[1]:"";
  const s=!r?`<span class="status st-ok">${L("团队已核对","Team-checked")}</span>`
    :r.st==="ok"?`<span class="status st-ok">${L("已批准（演示）","Approved (demo)")}</span>`
    :r.st==="edit"?`<span class="status st-edit">${L("已修改","Edited")}</span>`
    :`<span class="status st-rej">${L("已驳回","Rejected")}${w?" · "+w:""}</span>`;
  return s+(r?`<div class="rvmeta">${REVIEWER()} · ${r.at}</div>`:"");
}
function reviewActions(c){
  if(!c.src) return "";
  if(isRejected(c.id)) return `<div class="rvact"><button class="rvb" data-rv="undo" data-id="${c.id}">${L("撤销驳回","Undo reject")}</button></div>`;
  return `<div class="rvact"><button class="rvb ok" data-rv="ok" data-id="${c.id}">${L("批准","Approve")}</button><button class="rvb" data-rv="edit" data-id="${c.id}">${L("修改","Edit")}</button>
   <select class="rvb no" data-rej="${c.id}" aria-label="${L("驳回理由","Reason to reject")}"><option value="">${L("驳回…","Reject…")}</option>${REJ_WHY().map(([k,t])=>`<option value="${k}">${t}</option>`).join("")}</select></div>`;
}
function ledgerTable(o={}){return `<div class="scroll"><table class="ledger"><thead><tr><th>#</th><th>${L("状态","Status")}</th><th>${L("条目","Claim")}</th><th>${L("来源","Source")}</th><th>${L("原文","Original wording")}</th></tr></thead><tbody>
  ${CLAIMS.map((c,i)=>{if(o.only&&!o.only(c))return "";const rej=isRejected(c.id), ed=o.review&&RV_EDIT===c.id;
    const txt=ed?`<textarea id="rvTxt" rows="3" aria-label="${L("修改条目","Edit claim")}">${esc((rv(c.id)&&rv(c.id).txt&&rv(c.id).txt[S.lang])||T(c))}</textarea><div class="rvact"><button class="rvb ok" data-rv="save" data-id="${c.id}">${L("保存","Save")}</button><button class="rvb" data-rv="cancel">${L("取消","Cancel")}</button></div>`
      :`<span class="${rej?"strike":""}">${claimTxt(c)}</span>`;
    return `<tr class="${rej?"row-rej":""}"><td class="n">${i+1}</td><td>${statusCell(c)}${o.review&&!ed?reviewActions(c):""}</td><td>${txt}</td><td>${c.src?chip(c.src,c.pg,c.id):"—"}</td><td class="small">${c.q?"“"+esc(c.q)+"”":"—"}</td></tr>`;}).join("")}</tbody></table></div>`;}
/* click handling for the review buttons; returns true when it handled the click */
function reviewClick(b,render){const d=b.dataset;
  if(d.jump){const t=document.getElementById(d.jump);if(t)t.scrollIntoView({behavior:"smooth",block:"start"});return true;}
  if(!d.rv)return false;
  if(d.rv==="ok") setReview(d.id,{st:"ok"});
  else if(d.rv==="undo") setReview(d.id,null);
  else if(d.rv==="edit") RV_EDIT=d.id;
  else if(d.rv==="cancel") RV_EDIT=null;
  else if(d.rv==="save"){const t=(document.getElementById("rvTxt")||{}).value||"",old=rv(d.id),txt={...((old&&old.txt)||{})};txt[S.lang]=t.trim();
    if(txt[S.lang])setReview(d.id,{st:"edit",txt});RV_EDIT=null;}
  else if(d.rv==="reset"){S.review={};store.set("cav_review",{});RV_EDIT=null;}
  render();return true;}
function bindReview(render){document.addEventListener("change",e=>{const t=e.target;if(t.dataset&&t.dataset.rej&&t.value){setReview(t.dataset.rej,{st:"rej",why:t.value});render();}});}

/* evidence gaps: one list, same pages as app/template.html council(); who can fill each gap and when */
const GAPS=()=>[
  {t:L("交通影响：还没有交通模型","Traffic effects: no traffic model yet"),c:chip("S4","","tr6")+" "+chip("S2","p.54"),who:"D + A",when:L("FY27/28 聘顾问；与 TfNSW 一起做","Consultants FY27/28; with TfNSW"),res:L("标“等待 Council 交通研究”","“Awaits Council traffic study”")},
  {t:L("广场面积：1,200 m² 还是 1,300 m²","Square size: 1,200 m² or 1,300 m²"),c:chip("S2","p.23","sq1")+" "+chip("S3","","sq9"),who:"D",when:L("最终版总规","Final master plan"),res:L("用 1,200 m²，并注明两处说法不同","1,200 m², with the difference noted")},
  {t:L("广场下方是否有停车场、能否深土种树","Whether a car park sits under the square, and whether deep soil is possible"),c:chip("S2","p.49","tr8"),who:"D",when:L("停车场可行性研究；来源未给时间","Car park feasibility work; no date in the sources"),res:L("深土种植标“待核实”","Deep soil marked “unconfirmed”")},
  {t:L("各项功能的面积比例","Area for each use"),c:chip("S2","p.45","sq2")+` <span class="tag t-gap">${L("来源里没有面积","No areas in the sources")}</span>`,who:"D",when:L("广场设计阶段；来源未给时间","Square design stage; no date in the sources"),res:L("方案 0 标“我们的解读”","Scenario 0 labelled “our reading”")},
  {t:L("建设资金来源","Funding sources"),c:chip("S2","p.54","sq10"),who:"D + A",when:L("来源未给时间","No date in the sources"),res:L("成本卡注明“资金来源未定”","Cost card says “funding not settled”")},
  {t:L("公示意见汇总（尚未公开）","Exhibition feedback summary (not yet published)"),c:chip("S3",""),who:"D",when:L("最终版总规","Final master plan"),res:L("不引用公示意见","No exhibition feedback shown")},
  {t:L("系数矩阵的文献出处","Literature for each coefficient"),c:`<span class="tag t-design">${L("我们的设计","Our design")}</span>`,who:L("本团队","This team"),when:L("提交后","After submission"),res:L("所有结果标“假设”","Every result labelled “assumption”")}];
function gapsList(){return `<ul class="gaps">${GAPS().map(g=>`<li><div>${g.t} ${g.c}</div><div class="gmeta"><span><b>${L("谁能补","Who")}</b> ${g.who}</span><span><b>${L("何时","When")}</b> ${g.when}</span><span><b>${L("居民端","Residents")}</b> ${g.res}</span></div></li>`).join("")}</ul>`;}

/* P1–P6 (S2 p.22). Each principle has its own test; thresholds and the 10% "weakened" margin are our assumptions. */
const PSUM=(a,ids)=>ids.reduce((s,k)=>s+a[k],0);
const PDEF=()=>[
  {id:"P1",t:L("连接更新片区与 CBD 和交通枢纽","Connect renewal areas to the CBD and transport"),parts:[[L("畅通步行","Clear walking"),["walk"],180]]},
  {id:"P2",t:L("新建社区聚会空间","New spaces for community gathering"),parts:[[L("活动 + 休憩","Events + rest"),["events","rest"],480]]},
  {id:"P3",t:L("改善街道与公共空间的连接","Better links between streets and public space"),parts:[[L("街道界面：步行 + 路缘 + 自行车","Street edge: walking + kerb + bikes"),["walk","kerb","bike"],240]]},
  {id:"P4",t:L("让步行和骑行更容易、更安全、更舒适","Easier, safer, more comfortable walking and cycling"),parts:[[L("畅通步行","Clear walking"),["walk"],180],[L("遮荫树冠","Shade canopy"),["canopy"],120]]},
  {id:"P5",t:L("唐人街成为文化目的地","Chinatown as a cultural destination"),parts:[[L("文化表达","Culture"),["culture"],36],[L("活动和夜市","Events and markets"),["events"],200]]},
  {id:"P6",t:L("用 Council 用地提供公共便利","Council land delivering public amenity"),na:true,parts:[]}];
function pEval(a){const a0=PRESETS.base.a;return PDEF().map(p=>{
  const parts=p.parts.map(([lab,ids,min])=>({lab,v:PSUM(a,ids),v0:PSUM(a0,ids),min}));
  const fail=parts.some(x=>x.v<x.min), weak=!fail&&parts.some(x=>x.v<x.v0*0.9);
  return {...p,parts,lvl:p.na?"na":fail?"fail":weak?"weak":"keep"};});}
const LV=()=>({keep:L("保持","Kept"),weak:L("削弱","Weakened"),fail:L("不满足","Not met"),na:L("不评分","Not scored")});
function pCheckList(){const sh=v=>Math.round(100*v/TOTAL), R=pEval(S.a), n=k=>R.filter(r=>r.lvl===k).length;
  return `<p class="small muted">${L("检查对象：居民故事板的<b>当前分配</b>，对比方案 0（总规原样，我们的解读）。原则来自","Checked: the resident storyboard's <b>current split</b>, against Scenario 0 (plan as drawn, our reading). Principles from")} ${chip("S2","p.22")} <span class="tag t-design" style="white-space:normal">${L("门槛和“削弱”（比方案 0 少 10% 以上）是我们的假设","Thresholds and “weakened” (over 10% below Scenario 0) are our assumptions")}</span></p>
  <div class="pcsum"><span class="lv lv-keep">${LV().keep} ${n("keep")}</span><span class="lv lv-weak">${LV().weak} ${n("weak")}</span><span class="lv lv-fail">${LV().fail} ${n("fail")}</span></div>
  <ul class="pcl">${R.map(r=>`<li><div class="pch"><b>${r.id}</b><span>${r.t}</span><span class="lv lv-${r.lvl}">${LV()[r.lvl]}</span></div>
   ${r.na?`<div class="small muted">${L("本工具把总面积固定在 1,200 m²，所以这条恒满足，不打分。真正的风险在资金和停车场，见证据空白。","This tool fixes the total at 1,200 m², so this always holds and is not scored. The real risks are funding and the car park; see evidence gaps.")} ${chip("S2","p.54","sq10")} ${chip("S2","p.49","tr8")}</div>`
     :r.parts.map(x=>{const d=sh(x.v)-sh(x.v0);return `<div class="pcrow small"><span>${x.lab}</span><span class="muted">${L("方案 0","Scen. 0")} ${sh(x.v0)}%</span><span>${L("当前","Now")} <b>${sh(x.v)}%</b></span><span class="${d>0?"delta-up":d<0?"delta-down":"muted"}">${d>0?"▲":d<0?"▼":"="}${Math.abs(d)}</span><span class="muted">${L("门槛","Min")} ≥${sh(x.min)}%</span></div>`;}).join("")}</li>`).join("")}</ul>
  <p class="small muted">${L("系统只标出哪条被削弱，不替 Council 做决定。","The tool flags which principle is weakened; it does not decide for Council.")}</p>`;}

/* privacy threshold: counted per group (role), never per person; groups under 10 show no number */
function subsGroups(){const subs=store.get("cav_subs")||[],by={};subs.forEach(s=>{by[s.role||"?"]=(by[s.role||"?"]||0)+1;});return {subs,by,ok:Object.keys(by).filter(k=>by[k]>=10)};}
function subsPanel(){const {subs,by,ok}=subsGroups(), rn=id=>{const r=(typeof ROLES!=="undefined"?ROLES:[]).find(x=>x.id===id);return r?T(r):id;};
  return `<p class="small muted">${L("只有同一群体达到 10 人以上才显示汇总，并对比 ABS 人口结构检查代表性。演示版没有真实提交，只读本浏览器里的演示数据。","A summary appears only once a group reaches 10 or more people, with an ABS Census check for representativeness. The demo has no real submissions, only demo data from this browser.")}</p>
  ${Object.keys(by).length?`<ul class="grp">${Object.keys(by).map(k=>`<li><span>${esc(rn(k))}</span><span class="lv ${by[k]>=10?"lv-keep":"lv-na"}">${by[k]>=10?L("已达到 10 人","Reached 10"):L("少于 10，已隐藏","Under 10, hidden")}</span></li>`).join("")}</ul>`:""}
  ${ok.length?`<p>${L(`${ok.length} 个群体达到门槛。正式版会在这里显示该群体的汇总；演示版尚未实现汇总视图。`,`${ok.length} group(s) reached the threshold. The full version shows that group's summary here; the demo does not build it yet.`)}</p>`
   :`<div class="empty"><p>${L("还没有群体达到 10 人。达到后这里会显示：各卡片的支持度、方案面积中位数、代表性对比。","No group has reached 10 people yet. Once one does, this shows: support for each card, the median split, and a representativeness check.")}</p><div class="skel" aria-hidden="true"><i></i><i></i><i></i></div></div>`}
  ${subs.length?`<button class="btn" id="clearSubs">${L("清除本浏览器的演示提交","Clear demo submissions in this browser")}</button>`:""}`;}

/* F1 decision card: decision, owner, refresh, action (S1 p.13) */
function decisionCard(){const cell=(k,h,b)=>`<div class="dcell"><div class="dk">${k}</div><b>${h}</b><div class="small">${b}</div></div>`;
  return `<section class="card dcard"><div class="sec-h"><h2 class="ch2">${L("这个工具服务的决策","The decision this tool serves")}</h2><span class="small muted">${L("赛题要求讲清决策、负责人、更新和行动","The brief asks for decision, owner, refresh and action")} ${chip("S1","p.13")}</span></div>
   <div class="dgrid">
   ${cell(L("决策","Decision"),L("广场里面怎么分","How the square is shared"),`${L("Woodhouse Square（暂定名","Woodhouse Square (provisional name")} ${chip("S2","p.54","sq11")}${L("）这 1,200 m²","): how its 1,200 m²")} ${chip("S2","p.23","sq1")} ${L("在各类用途之间怎么分。总规没给各项面积。","is shared between uses. The plan gives no area for each use.")}`)}
   ${cell(L("负责人","Owner"),L("Council","Council"),`${L("总规是 Council 的文件","The master plan is Council's document")} ${chip("S4","")}${L("。工具内由哪个团队负责：",". Which team runs this tool:")} <span class="tag t-design">${L("待 Council 指定","For Council to name")}</span>`)}
   ${cell(L("何时更新","Refresh"),L("三个节点","Three milestones"),`${L("最终版总规提交 Council","Final master plan to Council")} ${chip("S3","")}；${L("交通研究顾问 FY27/28","traffic study consultants in FY27/28")} ${chip("S4","","tr6")}；${L("第二期 2027 年公示","Phase 2 exhibited in 2027")} ${chip("S3","")}。${L("每到一个节点，重跑证据核对和原则检查","At each one, re-run the evidence review and principle check")} <span class="tag t-design">${L("我们的设计","Our design")}</span>`)}
   ${cell(L("能促成的行动","Actions"),L("三项后续工作 + 倡导","Three follow-on pieces + advocacy"),`${L("修订 DCP 2023 Part 9；编制公共艺术总体规划；Council 用地可行性研究","Amend DCP 2023 Part 9; prepare a Public Art Master Plan; feasibility study for Council land")} ${chip("S2","p.54")} ${chip("S4","")}。${L("另有向州政府等争取的事，见下方 A 层。","Plus what Council must win from others; see tier A below.")}`)}
   </div></section>`;}

/* status strip: every number is counted on this page, none comes from outside */
function statusStrip(){const R=pEval(S.a), chk=CLAIMS.filter(c=>c.src&&!isRejected(c.id)).length, rej=CLAIMS.filter(c=>isRejected(c.id)).length, g=subsGroups();
  const t=(href,n,lab,cls="")=>href[0]==="#"?`<button class="stile ${cls}" data-jump="${href.slice(1)}"><b>${n}</b><span>${lab}</span></button>`:`<button class="stile ${cls}" data-tab="${href}"><b>${n}</b><span>${lab}</span></button>`;
  return `<nav class="sstrip" aria-label="${L("状态","Status")}">
   ${t("ledger",`${chk}/${CLAIMS.length}`,L("条目已核对","Claims checked"))}
   ${t("ledger",rej,L("已驳回，居民端已隐藏","Rejected, hidden from residents"),rej?"warn":"")}
   ${t("#blk-gaps",GAPS().length,L("证据空白","Evidence gaps"))}
   ${t("#blk-pc",`${R.filter(r=>r.lvl==="keep").length} / ${R.filter(r=>r.lvl==="weak"||r.lvl==="fail").length}`,L("原则 保持 / 削弱或不满足","Principles kept / weakened or not met"),R.some(r=>r.lvl==="weak"||r.lvl==="fail")?"warn":"")}
   ${t("#blk-subs",g.ok.length,L("达到 10 人门槛的群体","Groups at the 10-person threshold"))}
  </nav>`;}

/* ---------- shared events. ctx = {render(), live()} ---------- */
function bindCommon(ctx,extra){
  document.addEventListener("click",e=>{
    const b=e.target.closest("button,[data-close],[data-hot],[data-quest]"); if(!b) return;
    if(extra&&extra(b,e)) return;
    const d=b.dataset;
    if(d.close){closeDrawer();return;}
    if(d.src){openDrawer(d.src,d.pg,d.claim);return;}
    if(b.id==="lZh"||b.id==="lEn"){S.lang=b.id==="lZh"?"zh":"en";store.set("cav_lang",S.lang);ctx.render();return;}
    if(b.id==="themeBtn"){toggleTheme();ctx.render();return;}
    if(d.preset){S.a={...PRESETS[d.preset].a};syncSliders(null);ctx.live();return;}
    if(d.plant){S.plant=d.plant;document.querySelectorAll("[data-plant]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.plant===S.plant));ctx.live();return;}
    if(d.year){S.year=+d.year;document.querySelectorAll("[data-year]").forEach(x=>x.setAttribute("aria-pressed",+x.dataset.year===S.year));ctx.live();return;}
    if(d.role){S.role=d.role;ctx.render();return;}
    if(d.pri){const i=S.pri.indexOf(d.pri);if(i>=0)S.pri.splice(i,1);else if(S.pri.length<3)S.pri.push(d.pri);ctx.render();return;}
    if(d.react){S.react[d.react]=S.react[d.react]===d.v?null:d.v;document.querySelectorAll(`[data-react="${d.react}"]`).forEach(x=>x.setAttribute("aria-pressed",S.react[d.react]===x.dataset.v));return;}
    if(b.id==="submit"){submitDemo();ctx.render();return;}
    if(b.id==="clearSubs"){store.set("cav_subs",[]);ctx.render();return;}
  });
  let raf=0;
  document.addEventListener("input",e=>{
    const t=e.target;
    if(t.dataset.mod||t.dataset.grp){ // linked sliders: update in place so the drag continues
      if(t.dataset.mod) setModule(t.dataset.mod,+t.value); else setGroup(t.dataset.grp,+t.value);
      syncSliders(t); cancelAnimationFrame(raf); raf=requestAnimationFrame(ctx.live); return;}
    if(t.id==="exp"){S.exp=t.value;return;}
    if(t.id==="wish"){S.wish=t.value;return;}
  });
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeDrawer();});
  if(window.matchMedia){try{matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{if(!S.theme)ctx.render();});}catch(e){}}
}

/* toggle highlight layers without re-rendering the map */
function setMapHL(svg,k){if(!svg)return;svg.querySelectorAll(".hl").forEach(gr=>{const kk=gr.dataset.k;gr.style.opacity=kk==="phase"?(k&&k!=="phase"?.35:1):(kk===k?1:0);});}
/* tween the map's viewBox */
function tweenVB(svg,to,ms=650,onF){if(!svg)return;const from=svg.getAttribute("viewBox").split(" ").map(Number);if(svg._raf)cancelAnimationFrame(svg._raf);
  const reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;if(reduce){svg.setAttribute("viewBox",to.join(" "));onF&&onF();return;}
  const t0=performance.now();const step=t=>{const u=Math.min(1,(t-t0)/ms),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;svg.setAttribute("viewBox",from.map((f,i)=>(f+(to[i]-f)*e).toFixed(1)).join(" "));onF&&onF();if(u<1)svg._raf=requestAnimationFrame(step);};svg._raf=requestAnimationFrame(step);}
