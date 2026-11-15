/* ===== variants/vote.js: resident feedback by picking and voting =====
   A · "Council says vs you see": team-written example observations, each paired with a cited CLAIM
       or an explicit evidence gap. Residents tick "me too" and can add their own from chips.
   C · Pairwise duel: "if the square had 100 m² more, which use gets it?" over the 10 MODULES.
   Votes = a seeded set of SIMULATED respondents (D1, labelled everywhere, can be switched off)
   + this browser's own demo submissions. Nothing is sent anywhere. */

/* A · team-written example observations. These are NOT resident reports. Each "says" id is a CLAIM;
   "gap" means no source we hold gives that figure. role = who would act (team reading of S5 p.33). */
const OBS=[
 {id:"o1",card:"square",role:"D",zh:"下午沿 Wentworth St 走，很难找到树荫",en:"Hard to find shade along Wentworth St in the afternoon",says:["sq2"],gap:{zh:"现在这一带的树冠覆盖率",en:"Current tree canopy cover here"}},
 {id:"o2",card:"square",role:"D",zh:"带孩子或老人出门，附近没地方坐下歇脚",en:"Out with kids or older people, there is nowhere nearby to sit",says:["sq3"]},
 {id:"o3",card:"square",role:"D",zh:"坐轮椅或推婴儿车，路线断断续续",en:"With a wheelchair or pram, the route keeps breaking up",says:["sq4"]},
 {id:"o4",card:"square",role:"D",zh:"担心广场下面是停车场，种不了大树",en:"Worried a car park underneath means no big trees",says:["tr8","sq3"]},
 {id:"o5",card:"china",role:"D",zh:"晚上从车站走到 Church St，有几段觉得暗",en:"Walking from the station to Church St at night, some stretches feel dark",says:["ct6"],gap:{zh:"现在的照明水平",en:"Current lighting levels"}},
 {id:"o6",card:"china",role:"D+P",zh:"夜间活动多了，担心噪音和垃圾",en:"More night-time activity: worried about noise and litter",says:["ct4"]},
 {id:"o7",card:"china",role:"P",zh:"希望华人社团和老店能参与决定唐人街怎么做",en:"Chinese community groups and long-time shops should help shape Chinatown",says:["ct7"]},
 {id:"o8",card:"china",role:"D",zh:"Church St 的围栏让过街、逛店都要绕路",en:"Fences on Church St make crossing and browsing a detour",says:["ct2"]},
 {id:"o9",card:"traffic",role:"D",zh:"过 Fitzwilliam St 或 Wentworth St 要等很久，车也多",en:"Crossing Fitzwilliam St or Wentworth St means a long wait and heavy traffic",says:["tr2","tr6"],gap:{zh:"现在的过街等候时间",en:"Current crossing wait times"}},
 {id:"o10",card:"traffic",role:"D",zh:"车站附近接送的车停在路边，挡住人行道",en:"Drop-off cars near the station block the footpath",says:["tr5"]},
 {id:"o11",card:"traffic",role:"D+P",zh:"骑车去车站，没有安全的车道",en:"Cycling to the station, there is no safe lane",says:["tr4"]},
 {id:"o12",card:"traffic",role:"A",zh:"公交和火车之间怎么换乘不清楚",en:"Changing between bus and train is confusing",says:["tr7"]}
];
/* chips for "add your own": a place and an issue, no typing */
const VPLACES=()=>[["sq",L("广场","The square")],["went","Wentworth St"],["church","Church St"],["lane",L("小巷和拱廊","Laneways and arcades")],["fitz","Fitzwilliam St"],["stn",L("车站一带","Around the station")]];
const VISSUES=()=>[
 ["shade",L("树荫不够","Not enough shade"),"square","D",["sq2"]],
 ["seat",L("没地方坐","Nowhere to sit"),"square","D",["sq3"]],
 ["access",L("轮椅、婴儿车难走","Hard with a wheelchair or pram"),"square","D",["sq4"]],
 ["dark",L("晚上太暗","Too dark at night"),"china","D",["ct6"]],
 ["noise",L("噪音或垃圾","Noise or litter"),"china","D+P",["ct4"]],
 ["cross",L("过街难","Hard to cross"),"traffic","D",["tr2","tr6"]],
 ["kerb",L("接送、装卸挡路","Drop-off or loading in the way"),"traffic","D",["tr5"]],
 ["bike",L("骑车不安全","Unsafe to cycle"),"traffic","D+P",["tr4"]],
 ["other",L("其他","Something else"),null,"D",[]]];
const VCARD={sq:"square",went:"square",church:"china",lane:"china",fitz:"traffic",stn:"traffic"};
const V={tab:"square",more:false,place:null,issue:null,preview:false,msg:"",sent:"",sim:store.get("cav_sim")!==false};
S.seen=S.seen||[]; S.duel=S.duel||null;

/* ---------- D1 · simulated respondents (docs/SOURCES.md D1). Seeded, so every visitor sees the same set. ----------
   Only the votes are simulated. Every "Council says" line stays a real cited claim or an explicit evidence gap. */
const SIM_SEED=20261116;
const SIM_ROLES={resident:44,commuter:28,business:16,visitor:8}; // visitor < 10 on purpose: shows the per-group threshold
const SIM_AGE={resident:[.06,.30,.32,.22,.10],commuter:[.04,.52,.32,.11,.01],business:[0,.40,.42,.16,.02],visitor:[.08,.42,.30,.16,.04]}; // over AGES
const SIM_P={base:.12,lean:.5,tie:.12,skip:.08};
const SIM_LEAN={resident:["o1","o2","o3","o4","o6"],commuter:["o1","o9","o10","o11","o12"],business:["o5","o7","o8","o10"],visitor:["o5","o7","o8","o12"]};
const SIM_W={ // pick one of two: P(a beats b) = w_a / (w_a + w_b)
 resident:{canopy:3,rest:3,walk:2,blue:2,culture:1.5,smart:1.5,events:1,bike:1,circ:1,kerb:.5},
 commuter:{walk:3,bike:2.5,kerb:2,canopy:2,smart:1.5,rest:1,events:1,blue:1,culture:1,circ:.7},
 business:{events:3,kerb:2.5,smart:2,culture:2,walk:1.5,canopy:1.5,rest:1,bike:.7,blue:.7,circ:.7},
 visitor:{events:3,culture:3,canopy:2,rest:2,smart:1.5,walk:1.5,blue:1,circ:.7,bike:.5,kerb:.5}};
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
let SIMC=null;
function simPool(){if(SIMC)return SIMC;const rnd=mulberry32(SIM_SEED),out=[];
  for(const role in SIM_ROLES)for(let k=0;k<SIM_ROLES[role];k++){
    const aw=SIM_AGE[role];let u=rnd(),ai=0;while(ai<aw.length-1&&u>=aw[ai]){u-=aw[ai];ai++;}
    const seen=OBS.filter(o=>rnd()<(SIM_LEAN[role].includes(o.id)?SIM_P.lean:SIM_P.base)).map(o=>o.id);
    const duel=makePairs(rnd).map(([a,b])=>{const v=rnd();if(v<SIM_P.skip)return{a,b,w:"skip"};if(v<SIM_P.skip+SIM_P.tie)return{a,b,w:"tie"};
      const wa=SIM_W[role][a],wb=SIM_W[role][b];return{a,b,w:rnd()<wa/(wa+wb)?a:b};});
    out.push({sim:true,role,age:AGES[ai],seen,duel});}
  return SIMC=out;}
const SIMTAG=()=>`<span class="tag t-sim">${L("模拟数据","Simulated")}</span>`;
const simN=()=>Object.values(SIM_ROLES).reduce((a,b)=>a+b,0);

const subsAll=()=>store.get("cav_subs")||[];
const addedAll=()=>store.get("cav_added")||[];
/* this browser's saved demo submissions, in the same shape as a simulated respondent */
const mineAll=()=>subsAll().map(s=>({role:s.role,age:s.age||null,seen:s.seen||[],duel:s.duel||[]}));
const pool=()=>(V.sim?simPool():[]).concat(mineAll());
const cntIn=(id,rs)=>rs.filter(r=>r.seen.includes(id)).length;
function addedObs(){return addedAll().map(a=>{const p=VPLACES().find(x=>x[0]===a.place),i=VISSUES().find(x=>x[0]===a.issue);
  return {id:a.id,card:i[2]||VCARD[a.place],role:i[3],says:i[4],added:true,zh:`${p[1]}：${i[1]}`,en:`${p[1]}: ${i[1]}`,label:`${p[1]} · ${i[1]}`};});}
const allObs=()=>OBS.concat(addedObs());
const obsText=o=>o.added?o.label:T(o);
const roleTag=r=>`<span class="tag vrole" title="${esc(roleName(r))}">${r}</span>`;
function roleName(r){return {D:L("Council 直接负责","Council delivers"),"D+P":L("Council 牵头，与伙伴合作","Council leads with partners"),P:L("主要靠伙伴","Mainly partners"),A:L("Council 向州政府等争取","Council advocates to others such as the State")}[r];}
function saysLine(o){const cl=o.says.map(id=>CLAIMS.find(c=>c.id===id)).filter(c=>c&&cbShown(c.id)); // claims held back in the ledger are not quoted
  const parts=cl.map(c=>`${T(c)} ${chip(c.src,c.pg,c.id)}`);
  if(o.says.some(id=>!cbShown(id))) parts.push(`<span class="tag t-gap">${L("依据的条目未通过核对，暂不显示","The claim behind this did not pass review and is hidden")}</span>`);
  const gap=o.gap?`<div class="ob-g">${T(o.gap)}${L("：",": ")}<span class="tag t-gap">${L("没有官方数字 · 证据空白","No official figure · evidence gap")}</span></div>`:"";
  if(!parts.length&&!gap) parts.push(`<span class="tag t-gap">${L("我们整理的 Council 条目里没有对应内容 · 证据空白","No matching Council claim in our ledger · evidence gap")}</span>`);
  return `<div class="ob-s"><b>${L("Council 说","Council says")}</b> ${parts.join(`<span class="sep"> · </span>`)}${gap}</div>`;}
function simToggle(){return `<div class="pill vsim" role="group" aria-label="${L("票数来源","Vote source")}"><button data-vsim="1" aria-pressed="${V.sim}">${L("显示模拟票","Show simulated votes")}</button><button data-vsim="0" aria-pressed="${!V.sim}">${L("只看我的票","Only my votes")}</button></div>`;}
function aboutData(){const rl=r=>T(ROLES.find(x=>x.id===r)),N=simN();
  return `<details class="vabout"><summary>${L("关于这些数据","About this data")} ${SIMTAG()}</summary>
   <p>${L(`这里的票是<b>模拟的</b>，不是真实居民的意见，也不是 Council 的数据。我们用固定的随机种子（${SIM_SEED}）生成 ${N} 位模拟受访者，所以每次打开结果都一样。身份分布是：附近居民 44、通勤者 28、商户 / 员工 16、访客 8，各身份的年龄段比例不同。每人按下面的倾向勾选情况：倾向项被勾的概率是 50%，其他是 12%。然后做 8 轮二选一，按各身份对用途的权重抽选，12% 选“差不多”，8% 跳过。访客只有 8 人，故意低于 10 人的门槛，用来演示隐私规则。赛题允许使用标明的模拟数据`,
     `These votes are <b>simulated</b>. They are not real residents' views and not Council data. A fixed random seed (${SIM_SEED}) generates ${N} simulated respondents, so the set is the same every time: 44 local residents, 28 commuters, 16 business owners or workers and 8 visitors, with different age-band mixes per role. Each one ticks situations by the leanings below: a 50% chance for a leaning item, 12% for the rest. Each then does 8 pick-one-of-two rounds, choosing by their role's weights for each use, with 12% "about the same" and 8% skipped. Visitors are only 8, below the 10-person threshold on purpose, to show the privacy rule. The brief allows clearly labelled simulated data`)} ${chip("S1","p.3")}${L("。每条“Council 说”仍是真实引用或证据空白，只有票数是模拟的。",". Every \"Council says\" line is still a real citation or an evidence gap; only the votes are simulated.")}</p>
   <ul class="vlean">${Object.keys(SIM_ROLES).map(r=>`<li><b>${rl(r)} (${SIM_ROLES[r]})</b> ${L("常勾：","ticks more often: ")}${SIM_LEAN[r].map(id=>esc(T(OBS.find(o=>o.id===id)))).join(L("；","; "))}${L("。二选一偏向：",". Leans to: ")}${Object.entries(SIM_W[r]).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([id])=>T(MODULES.find(m=>m.id===id))).join(L("、",", "))}</li>`).join("")}</ul>
   <p><b>${L("正式版怎么拿到真实数据：","How the full version gets real data:")}</b> ${L("在 Council 已有的 Participate Parramatta 上收集（2020 年以来超过 196,000 名独立访客","collect on Council's existing Participate Parramatta (more than 196,000 unique visitors since 2020")} ${chip("S5","p.16–17")}${L("），再加现场二维码标牌和图书馆平板，照顾不常上网的人。只问身份和可选的年龄段、邮编",") plus on-site QR signs and library tablets for people who rarely go online. It asks only for role, and optionally age band and postcode")} ${chip("S5","p.30")}${L("。再用 ABS 人口普查检查各群体的代表性。平台和场地都是 Council 已有的，成本主要是标牌和平板。",". The ABS Census is used to check how representative each group is. The platform and venues already exist, so the main costs are signs and tablets.")}</p></details>`;}

/* ---------- A · Council says vs you see ---------- */
function voteA(){const cards=[["square",L("广场","Square")],["china",L("唐人街","Chinatown")],["traffic",L("交通","Traffic")]];
  const list=allObs().filter(o=>o.card===V.tab), team=list.filter(o=>!o.added), mine=list.filter(o=>o.added);
  const shown=V.more?team:team.slice(0,3), hidden=team.length-shown.length;
  const cnt=k=>allObs().filter(o=>o.card===k&&S.seen.includes(o.id)).length;
  return `<div class="vh"><div class="eyebrow">A · ${L("Council 说 vs 你看到","Council says vs you see")}</div><span class="tag t-infer">${L("亲身体验","Lived experience")}</span></div>
   <h3 class="vq">${L("哪些情况你也遇到过？点一下就算一票","Which of these have you run into? One tap is one vote")}</h3>
   <div class="pill vtabs" role="group" aria-label="${L("分类","Category")}">${cards.map(([k,t])=>`<button data-vtab="${k}" aria-pressed="${V.tab===k}">${t}${cnt(k)?` <span class="vdot">${cnt(k)}</span>`:""}</button>`).join("")}</div>
   <p class="small muted vnote"><span class="tag t-design">${L("团队示例","Team-written example")}</span> ${L("下面的说法是团队写的提示，不是真实居民的报告。","These prompts are written by the team, not real resident reports.")}
     ${V.sim?L(`右边的数字 = ${simN()} 位模拟受访者的票 + 你的票。`,`The number on the right = votes from ${simN()} simulated respondents + yours.`):L("右边的数字只算你在本浏览器投的票，从 0 开始。","The number on the right counts only your votes in this browser, starting at 0.")}</p>
   <div class="vsimrow">${simToggle()}</div>${V.sim?aboutData():""}
   <div class="obs-l">${shown.concat(mine).map(obsCard).join("")}</div>
   ${hidden?`<button class="btn vmore" id="vMore">${L(`再给我 ${hidden} 条`,`Show ${hidden} more`)}</button>`:""}
   ${composer()}`;}
function obsCard(o){const on=S.seen.includes(o.id),sn=V.sim?cntIn(o.id,simPool()):0,mn=cntIn(o.id,mineAll())+(on?1:0),n=sn+mn;
  return `<article class="obs${on?" on":""}"><div class="ob-r"><button class="ob-t" data-vo="${o.id}" aria-pressed="${on}"><span class="ob-c" aria-hidden="true">${on?"✓":""}</span><span><b>${esc(obsText(o))}</b>
     ${o.added?`<span class="tag t-design">${L("你添加的 · 只在本浏览器","Added by you · this browser only")}</span>`:""}</span></button>
     <span class="ob-n${sn?" sim":""}" aria-label="${L(`${n} 票，其中模拟 ${sn}`,`${n} votes, ${sn} simulated`)}">${n}<small>${L("票",n===1?"vote":"votes")}</small>${sn?`<i>${L("模拟","simulated")}</i>`:""}</span></div>
    ${saysLine(o)}<div class="ob-f">${roleTag(o.role)} <span class="small muted">${esc(roleName(o.role))}</span>
     <span class="ob-mix">${sn?`${SIMTAG()} <span class="small">${sn}</span>`:""}${mn?` <span class="tag t-mine">${L(`你的 ${mn} 票`,mn===1?"your vote":`your ${mn} votes`)}</span>`:""}</span></div></article>`;}
function composer(){const iss=VISSUES().find(x=>x[0]===V.issue);
  return `<details class="vadd"${V.place||V.issue?" open":""}><summary>＋ ${L("加一条你遇到的问题（点选，不用打字）","Add something you've run into (tap, no typing)")}</summary>
   <div class="lbl" style="margin-top:8px">1 · ${L("在哪里","Where")}</div><div class="pill">${VPLACES().map(([k,t])=>`<button data-vplace="${k}" aria-pressed="${V.place===k}">${esc(t)}</button>`).join("")}</div>
   <div class="lbl" style="margin-top:8px">2 · ${L("什么问题","What")}</div><div class="pill">${VISSUES().map(([k,t])=>`<button data-vissue="${k}" aria-pressed="${V.issue===k}">${esc(t)}</button>`).join("")}</div>
   ${iss?`<div class="vprev">${saysLine({says:iss[4]})}</div>`:""}
   <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px"><button class="btn primary" id="vAdd"${V.place&&V.issue?"":` aria-disabled="true"`}>${L("加入清单并投一票","Add to the list and vote")}</button>
   <span class="small muted" id="vAddMsg">${esc(V.msg)||L("加进去以后，用这个浏览器的人都能看到并投票（演示没有服务器）。新加的条目没有模拟票。","Once added, anyone using this browser can see it and vote (the demo has no server). New items have no simulated votes.")}</span></div></details>`;}

/* ---------- C · pairwise duel over the 10 uses ---------- */
const DROUNDS=8;
/* which uses the plan itself lists (S2 p.45); the rest are team additions from the Smart City Strategy actions */
const MOD_SRC={canopy:"sq2",culture:"sq2",smart:"sq2",events:"sq3",rest:"sq3",walk:"sq4"};
function shuffle(a,rnd=Math.random){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function makePairs(rnd=Math.random){const ids=MODULES.map(m=>m.id),seen=new Set(),pairs=[];
  for(let t=0;pairs.length<DROUNDS&&t<12;t++){const s=shuffle(ids,rnd);for(let i=0;i+1<s.length&&pairs.length<DROUNDS;i+=2){const k=[s[i],s[i+1]].sort().join("|");if(!seen.has(k)){seen.add(k);pairs.push([s[i],s[i+1]]);}}}
  return pairs;}
function newDuel(){S.duel={pairs:makePairs(),i:0,res:[]};}
function duelRank(res){const sc={};MODULES.forEach(m=>sc[m.id]={w:0,n:0});
  res.forEach(r=>{if(r.w==="skip")return;sc[r.a].n++;sc[r.b].n++;if(r.w==="tie"){sc[r.a].w+=.5;sc[r.b].w+=.5;}else sc[r.w].w++;});
  return MODULES.map(m=>({m,w:sc[m.id].w,n:sc[m.id].n,p:sc[m.id].n?sc[m.id].w/sc[m.id].n:null})).filter(x=>x.n).sort((x,y)=>y.p-x.p||y.n-x.n);}
const duelsOf=rs=>[].concat(...rs.map(r=>r.duel));
const modSrc=id=>MOD_SRC[id]?(()=>{const c=CLAIMS.find(x=>x.id===MOD_SRC[id]);return `${L("总规列出","Listed in the plan")} ${chip(c.src,c.pg,c.id)}`;})():`<span class="tag t-design">${L("团队补充的用途","Use added by the team")}</span>`;
const fmtW=w=>Number.isInteger(w)?w:w.toFixed(1);
const modName=id=>T(MODULES.find(m=>m.id===id));
function rankList(r){return `<ol class="drank">${r.map((x,i)=>`<li><span class="dn">${i+1}</span><span class="dic sm" aria-hidden="true">${ICON[x.m.id](GROUPS[x.m.g].c)}</span><span class="dl">${T(x.m)} ${roleTag(x.m.role)}</span><span class="db"><span style="width:${Math.round(100*x.p)}%;background:${GROUPS[x.m.g].c}"></span></span><span class="dp">${Math.round(100*x.p)}%<small>${L(`赢 ${fmtW(x.w)}/${x.n}`,`won ${fmtW(x.w)}/${x.n}`)}</small></span></li>`).join("")}</ol>`;}
function duelSide(id){const m=MODULES.find(x=>x.id===id),c=GROUPS[m.g].c;
  return `<div class="dside"><button class="dpick" data-duel="${id}" style="--gc:${c}"><span class="dic" aria-hidden="true">${ICON[id](c)}</span><b>${T(m)}</b></button>
   <div class="dcap">${roleTag(m.role)} ${modSrc(id)}</div></div>`;}
/* how the simulated respondents split on the pair you just answered */
function lastRoundNote(){const d=S.duel;if(!V.sim||!d||!d.i)return "";const last=d.res[d.i-1];
  const rs=duelsOf(simPool()).filter(r=>r.w!=="skip"&&((r.a===last.a&&r.b===last.b)||(r.a===last.b&&r.b===last.a)));
  if(rs.length<5) return `<p class="small muted vlast">${L("上一轮这一对的模拟数据太少，不显示比例。","Too few simulated answers for the last pair to show a split.")} ${SIMTAG()}</p>`;
  const pa=Math.round(100*rs.filter(r=>r.w===last.a).length/rs.length),pb=Math.round(100*rs.filter(r=>r.w===last.b).length/rs.length);
  const you=last.w===last.a||last.w===last.b?L(`你选了「${modName(last.w)}」。`,`You picked ${modName(last.w)}. `):"";
  return `<p class="small vlast">${L("上一轮","Last round")}：${you}${L(`模拟受访者里 ${pa}% 选「${modName(last.a)}」，${pb}% 选「${modName(last.b)}」（n=${rs.length}）`,`${pa}% of simulated respondents picked ${modName(last.a)}, ${pb}% ${modName(last.b)} (n=${rs.length})`)} ${SIMTAG()}</p>`;}
function duelC(){if(!S.duel)newDuel();const d=S.duel,done=d.i>=d.pairs.length;
  const head=`<div class="vh"><div class="eyebrow">C · ${L("二选一","Pick one of two")}</div>
   <span class="dprog" aria-label="${L(`第 ${Math.min(d.i+1,DROUNDS)} / ${DROUNDS} 轮`,`Round ${Math.min(d.i+1,DROUNDS)} of ${DROUNDS}`)}">${d.pairs.map((_,k)=>`<i class="${k<d.i?"d":k===d.i?"c":""}"></i>`).join("")}</span></div><h3 class="vq">${L("如果广场多出 100 m²，你更想给哪一个？","If the square had 100 m² more, which use should get it?")}</h3>`;
  if(!done){const [a,b]=d.pairs[d.i];
    return head+`<div class="duel">${duelSide(a)}<span class="vs" aria-hidden="true">VS</span>${duelSide(b)}</div>
     <div class="pill" style="justify-content:center;margin-top:10px"><button data-duel="tie">${L("差不多","About the same")}</button><button data-duel="skip">${L("跳过","Skip")}</button></div>
     <p class="small muted" style="margin:8px 0 0;text-align:center">${L(`第 ${d.i+1} / ${DROUNDS} 轮 · 1,200 m² 的总面积不变`,`Round ${d.i+1} of ${DROUNDS} · the total stays 1,200 m²`)} ${chip("S2","p.23","sq1")}</p>${lastRoundNote()}`;}
  const r=duelRank(d.res),sr=V.sim?duelRank(duelsOf(simPool())).slice(0,3):[];
  return head+lastRoundNote()+`<p class="small" style="margin:4px 0 8px">${L("你的排序（按赢的比例）：","Your order (share of matchups won):")}</p>
   ${r.length?rankList(r):`<p class="small muted">${L("你都跳过了。","You skipped every round.")}</p>`}
   ${sr.length?`<p class="small" style="margin:8px 0 0">${L(`${simN()} 位模拟受访者的前三：`,`Top three among ${simN()} simulated respondents: `)}${sr.map(x=>T(x.m)).join(L("、",", "))} ${SIMTAG()}</p>`:""}
   <p class="small muted" style="margin:8px 0 0">${L("排序只说明你更想要哪个，不是面积。每次比的组合是从 10 项用途里随机抽的。","The order shows what you'd rather have, not areas. Pairs are drawn at random from the 10 uses.")}</p>
   <button class="btn" id="duelNew" style="margin-top:8px">↻ ${L("换一批再比","New pairs")}</button>`;}

/* ---------- send bar and free text (secondary) ---------- */
function sendBar(){const n=S.seen.length,dn=S.duel?S.duel.res.filter(r=>r.w!=="skip").length:0,subs=subsAll();
  return `<div class="sendbar"><div><b>${L(`你勾了 ${n} 条，比了 ${dn} 轮`,`You ticked ${n} and compared ${dn} pairs`)}</b><div class="small muted">${V.sent?esc(V.sent):subs.length?L(`本浏览器已保存 ${subs.length} 份演示提交，没有发送给 Council。`,`${subs.length} demo submission(s) saved in this browser only. Nothing was sent to Council.`):L("演示版只保存在你的浏览器里，不会发送给任何人。","In this demo your answers stay in your browser and are not sent anywhere.")}</div></div>
   <div class="sendbtns">${V.sent?`<button class="btn" data-tab="council">${L("看 Council 会收到什么 →","See what Council would receive →")}</button>`:""}<button class="btn primary" id="submit">${L("提交（演示）","Submit (demo)")}</button></div></div>`;}
function freeText(){return `<details class="vfree"><summary>${L("还想补充？写几句（可选）","Anything else? Write a few words (optional)")}</summary>
   <label class="f" for="exp">${L("你现在在这一带的体验是什么？比如晚上走、等车、带孩子、做生意。","What is it like around here now? Walking at night, waiting for a bus, with kids, running a shop.")}</label><textarea id="exp">${esc(S.exp)}</textarea>
   <label class="f" for="wish" style="margin-top:8px">${L("这个广场怎样才对你有用？","What would make this square work for you?")}</label><textarea id="wish">${esc(S.wish)}</textarea>
   <p class="small muted">${L("请不要写姓名、电话或住址。按“最少必要数据”原则，我们只问身份和可选的年龄段、邮编","Please leave out names, phone numbers and addresses. Under the minimum-data rule we only ask your role, and optionally age band and postcode")} ${chip("S5","p.30")}。</p></details>`;}
function voteSection(){return `<div class="vgrid"><div class="card vcard" id="voteA">${voteA()}</div><div class="card vcard" id="duelC">${duelC()}</div></div>
  <div class="card vcard" style="margin-top:14px"><div id="sendBox">${sendBar()}</div>${freeText()}</div>`;}
function voteRefresh(which){const m={voteA,duelC,sendBox:sendBar,tallyBox:tallyPanel};(which||Object.keys(m)).forEach(k=>{const e=document.getElementById(k);if(e)e.innerHTML=m[k]();});}

/* returns true when it handled the click */
function voteClick(b){const d=b.dataset;
  if(d.vtab){V.tab=d.vtab;V.more=false;voteRefresh(["voteA"]);return true;}
  if(d.vo){const i=S.seen.indexOf(d.vo);if(i>=0)S.seen.splice(i,1);else S.seen.push(d.vo);V.sent="";voteRefresh(["voteA","sendBox"]);return true;}
  if(d.vsim){V.sim=d.vsim==="1";store.set("cav_sim",V.sim);voteRefresh(["voteA","duelC","tallyBox"]);return true;}
  if(b.id==="vMore"){V.more=true;voteRefresh(["voteA"]);return true;}
  if(d.vplace){V.place=V.place===d.vplace?null:d.vplace;V.msg="";voteRefresh(["voteA"]);return true;}
  if(d.vissue){V.issue=V.issue===d.vissue?null:d.vissue;V.msg="";voteRefresh(["voteA"]);return true;}
  if(b.id==="vAdd"){if(!V.place||!V.issue){V.msg=L("先选地点和问题。","Pick a place and an issue first.");voteRefresh(["voteA"]);return true;}
    const ad=addedAll();let it=ad.find(a=>a.place===V.place&&a.issue===V.issue);
    if(!it){it={id:"u"+Date.now().toString(36),place:V.place,issue:V.issue};ad.push(it);store.set("cav_added",ad);}
    if(!S.seen.includes(it.id))S.seen.push(it.id);
    V.tab=addedObs().find(o=>o.id===it.id).card;V.place=V.issue=null;V.msg="";V.sent="";voteRefresh(["voteA","sendBox"]);return true;}
  if(d.duel){const D=S.duel;if(!D||D.i>=D.pairs.length)return true;const [a,b2]=D.pairs[D.i];D.res.push({a,b:b2,w:d.duel});D.i++;V.sent="";voteRefresh(["duelC","sendBox"]);return true;}
  if(b.id==="duelNew"){newDuel();voteRefresh(["duelC","sendBox"]);return true;}
  if(b.id==="vPreview"){V.preview=!V.preview;voteRefresh(["tallyBox"]);return true;}
  if(b.id==="clearVotes"){store.set("cav_subs",[]);store.set("cav_added",[]);S.seen=[];V.preview=false;V.sent="";voteRefresh(["tallyBox"]);return true;}
  return false;}
/* called after submitDemo() saved the votes: start fresh so votes are not counted twice */
function voteAfterSubmit(){const n=subsAll().length;S.seen=[];S.duel=null;V.sent=L(`已保存为本浏览器第 ${n} 份演示提交，没有发送给 Council。可以换个身份再投一次。`,`Saved as demo submission ${n} in this browser. Nothing was sent to Council. You can vote again as another role.`);}

/* ---------- Council view: tallies by option and by group, 10-person threshold per group ---------- */
const PRIV_N=10;
const pctOf=(a,b)=>b?Math.round(100*a/b):0;
function groupCell(label,g,f){return g.length<PRIV_N?`<span class="gh">${label} <small>${L("少于 10，隐藏","under 10, hidden")}</small></span>`:`<span>${label} <b>${f(g)}</b></span>`;}
function tallyList(rows,P,cards){if(!rows.length)return "";
  return `<ul class="tally">${rows.map(({o,c,s})=>`<li><div class="tl1"><span class="tag t-fact">${cards[o.card]}</span> <b>${esc(obsText(o))}</b> ${o.added?`<span class="tag t-design">${L("在本浏览器添加","Added in this browser")}</span>`:`<span class="tag t-design">${L("团队示例","Team example")}</span>`}</div>
     <div class="tl2"><span class="tbar"><span style="width:${pctOf(c,P.length)}%"></span></span><span class="tn">${c}<small>/${P.length}</small></span>${s?SIMTAG():""}</div>
     <div class="trole">${ROLES.map(r=>groupCell(T(r),P.filter(x=>x.role===r.id),g=>pctOf(cntIn(o.id,g),g.length)+"%")).join("")}</div>
     ${saysLine(o)}<div class="ob-f">${roleTag(o.role)} <span class="small muted">${esc(roleName(o.role))}</span></div></li>`).join("")}</ul>`;}
function tallyPanel(){const P=pool(),n=P.length,mine=mineAll().length,show=n>=PRIV_N||V.preview,ST=V.sim?SIMTAG():"";
  const head=`<div class="vsimrow">${simToggle()}</div>
   <p class="small muted">${V.sim?L(`共 ${n} 份：${n-mine} 份模拟 + ${mine} 份本浏览器的演示提交。`,`${n} in all: ${n-mine} simulated + ${mine} demo submission(s) from this browser.`):L("只算本浏览器里的演示提交，从 0 开始。","Only demo submissions from this browser, starting at 0.")} ${L("每条选项都保留“Council 说”的出处和分工。","Every option keeps its Council source and who delivers it.")}</p>
   ${V.sim?aboutData():""}
   <div class="thr"><div class="thrn">${n}<small>/${PRIV_N}</small></div><div class="thrbar"><span style="width:${Math.min(100,n*10)}%"></span></div>${ST}</div>`;
  if(!n) return head+`<p>${L("还没有演示提交。到“居民故事板”第 4 章勾几条、比几轮，再点“提交（演示）”。","No demo submissions yet. In the resident storyboard, chapter 4, tick a few items, compare a few pairs, then press Submit (demo).")}</p>`;
  const gate=n<PRIV_N?`<div class="banner vgate"><b>${L("少于 10 份。","Fewer than 10.")}</b> ${L("正式版在这之前不显示任何汇总，免得能认出个人。","The full version shows no summary before this, so no one can be singled out.")}
     <button class="btn" id="vPreview">${V.preview?L("隐藏演示预览","Hide demo preview"):L("看演示预览","Show demo preview")}</button></div>`:"";
  if(!show) return head+gate;
  const cards={square:L("广场","Square"),china:L("唐人街","Chinatown"),traffic:L("交通","Traffic")};
  const S0=V.sim?simPool():[];
  const rows=allObs().map(o=>({o,c:cntIn(o.id,P),s:cntIn(o.id,S0)})).sort((x,y)=>y.c-x.c);
  const roles=ROLES.map(r=>[r,P.filter(x=>x.role===r.id)]);
  const ages=AGES.map(a=>[a,P.filter(x=>x.age===a)]).concat([[L("未填","Not given"),P.filter(x=>!x.age)]]).filter(([,g])=>g.length);
  return head+gate+`${V.preview&&n<PRIV_N?`<p class="small"><span class="tag t-gap">${L("预览：正式版不会显示","Preview: the full version would hide this")}</span></p>`:""}
   <h3 class="vt">A · ${L("“我也遇到过”：按选项和身份","“Me too”: by option and role")} ${ST}</h3>
   <p class="small muted">${L("身份那一行是该身份里勾选的比例。每个身份满 10 人才显示。","The role line shows the share of each role that ticked it. A role shows only once it has 10 or more people.")}</p>
   ${tallyList(rows.filter(r=>r.c),P,cards)||`<p class="small muted">${L("还没有人勾选。","Nothing ticked yet.")}</p>`}
   ${rows.some(r=>!r.c)?`<details class="vfree" style="margin-top:8px"><summary>${L(`另外 ${rows.filter(r=>!r.c).length} 条还是 0 票`,`${rows.filter(r=>!r.c).length} more with 0 votes`)}</summary>${tallyList(rows.filter(r=>!r.c),P,cards)}</details>`:""}
   <h3 class="vt">C · ${L("二选一：各用途赢的比例","Pick one of two: share of matchups won")} ${ST}</h3>
   ${(()=>{const rk=duelRank(duelsOf(P));return rk.length?rankList(rk):`<p class="small muted">${L("还没有二选一结果。","No pairwise results yet.")}</p>`;})()}
   <h3 class="vt">${L("按身份：二选一前三","By role: top three uses")} ${ST}</h3>
   <ul class="vgroups">${roles.map(([r,g])=>`<li>${groupCell(`${T(r)} (${g.length<PRIV_N?"<10":g.length})`,g,gg=>duelRank(duelsOf(gg)).slice(0,3).map(x=>T(x.m)).join(L("、",", "))||"—")}</li>`).join("")}</ul>
   <h3 class="vt">${L("按年龄段","By age band")} ${ST}</h3>
   <p class="small">${ages.map(([a,g])=>g.length<PRIV_N?`${esc(a)} <span class="muted">&lt;10</span>`:`${esc(a)} <b>${g.length}</b>`).join(" · ")}</p>
   <p class="small muted">${L("少于 10 人的组只显示“<10”，不给具体数字或票数。","Groups under 10 show only “<10”, with no exact count or votes.")}</p>
   <p class="small muted">${L("分工 D / D+P / P / A 是团队按 Smart City Strategy 的分类做的判断","D / D+P / P / A is the team's reading of the Smart City Strategy's split")} ${chip("S5","p.33")} <span class="tag t-design">${L("假设","Assumption")}</span></p>
   ${mine?`<button class="btn" id="clearVotes">${L("清除本浏览器的演示票和添加项","Clear demo votes and added items in this browser")}</button>`:""}`;}
