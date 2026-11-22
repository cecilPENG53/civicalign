/* ===== variants/vote.js: resident feedback in one block =====
   One question, one tap per answer: "What should the square fix first? Pick up to 3."
   Each tile is one of the 10 MODULES, shown as the everyday situation it answers (team-written,
   VOTE_WHY) with the use's name underneath. This replaces the two earlier blocks
   ("Council says vs you see" and the pick-one-of-two rounds).
   Votes = a seeded set of SIMULATED respondents (D1, labelled everywhere)
   + this browser's own demo submissions. Nothing is sent anywhere. */
const VOTE_MAX=3;
/* team-written prompts, NOT resident reports: the situation each use answers */
const VOTE_WHY={
 canopy:{zh:"下午找不到树荫",en:"No shade in the afternoon"},
 blue:{zh:"下大雨路面积水",en:"Puddles after heavy rain"},
 events:{zh:"想要夜市和户外餐饮",en:"Want night markets and outdoor dining"},
 culture:{zh:"想看到唐人街的文化和艺术",en:"Want Chinatown's culture and art on show"},
 rest:{zh:"没地方坐下歇脚",en:"Nowhere to sit and rest"},
 walk:{zh:"轮椅、婴儿车不好走",en:"Hard going with a wheelchair or pram"},
 bike:{zh:"没地方停自行车",en:"Nowhere to park a bike"},
 kerb:{zh:"接送的车挡住人行道",en:"Drop-off cars block the footpath"},
 smart:{zh:"晚上觉得暗",en:"Feels dark at night"},
 circ:{zh:"垃圾没处分类回收",en:"Nowhere to recycle"}};
const V={preview:false,sent:""};
S.pick=S.pick||[];

/* ---------- D1 · simulated respondents (docs/SOURCES.md D1). Seeded, so every visitor sees the same set. ---------- */
const SIM_SEED=20261116;
const SIM_ROLES={resident:44,commuter:28,business:16,visitor:8}; // visitor < 10 on purpose: shows the per-group threshold
const SIM_AGE={resident:[.06,.30,.32,.22,.10],commuter:[.04,.52,.32,.11,.01],business:[0,.40,.42,.16,.02],visitor:[.08,.42,.30,.16,.04]}; // over AGES
const SIM_W={ // each simulated respondent draws 3 different uses with these weights
 resident:{canopy:3,rest:3,walk:2,blue:2,culture:1.5,smart:1.5,events:1,bike:1,circ:1,kerb:.5},
 commuter:{walk:3,bike:2.5,kerb:2,canopy:2,smart:1.5,rest:1,events:1,blue:1,culture:1,circ:.7},
 business:{events:3,kerb:2.5,smart:2,culture:2,walk:1.5,canopy:1.5,rest:1,bike:.7,blue:.7,circ:.7},
 visitor:{events:3,culture:3,canopy:2,rest:2,smart:1.5,walk:1.5,blue:1,circ:.7,bike:.5,kerb:.5}};
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
let SIMC=null;
function simPool(){if(SIMC)return SIMC;const rnd=mulberry32(SIM_SEED),out=[];
  for(const role in SIM_ROLES)for(let k=0;k<SIM_ROLES[role];k++){
    const aw=SIM_AGE[role];let u=rnd(),ai=0;while(ai<aw.length-1&&u>=aw[ai]){u-=aw[ai];ai++;}
    const left={...SIM_W[role]},pick=[];
    while(pick.length<VOTE_MAX){let x=rnd()*Object.values(left).reduce((a,b)=>a+b,0),id;for(id in left){x-=left[id];if(x<0)break;}pick.push(id);delete left[id];}
    out.push({sim:true,role,age:AGES[ai],pick});}
  return SIMC=out;}
const SIMTAG=()=>`<span class="tag t-sim">${L("模拟数据","Simulated")}</span>`;
const simN=()=>Object.values(SIM_ROLES).reduce((a,b)=>a+b,0);
const subsAll=()=>store.get("cav_subs")||[];
/* this browser's saved demo submissions, in the same shape as a simulated respondent */
const mineAll=()=>subsAll().map(s=>({role:s.role,age:s.age||null,pick:s.pick||[]}));
const pool=()=>simPool().concat(mineAll());
const cntIn=(id,rs)=>rs.filter(r=>r.pick.includes(id)).length;
function aboutData(){const rl=r=>T(ROLES.find(x=>x.id===r)),N=simN();
  return `<details class="vabout"><summary>${L("关于这些数据","About this data")} ${SIMTAG()}</summary>
   <p>${L(`这里的票是<b>模拟的</b>，不是真实居民的意见，也不是 Council 的数据。我们用固定的随机种子（${SIM_SEED}）生成 ${N} 位模拟受访者，所以每次打开结果都一样：附近居民 44、通勤者 28、商户 / 员工 16、访客 8，各身份的年龄段比例不同。每人按所属身份的权重，从 10 项里选 ${VOTE_MAX} 项。访客只有 8 人，故意低于 10 人的门槛，用来演示隐私规则。赛题允许使用标明的模拟数据`,
     `These votes are <b>simulated</b>. They are not real residents' views and not Council data. A fixed random seed (${SIM_SEED}) generates ${N} simulated respondents, so the set is the same every time: 44 local residents, 28 commuters, 16 business owners or workers and 8 visitors, with different age-band mixes per role. Each one picks ${VOTE_MAX} of the 10 options, drawn by their role's weights. Visitors are only 8, below the 10-person threshold on purpose, to show the privacy rule. The brief allows clearly labelled simulated data`)} ${chip("S1","p.3")}${L("。",".")}</p>
   <ul class="vlean">${Object.keys(SIM_ROLES).map(r=>`<li><b>${rl(r)} (${SIM_ROLES[r]})</b> ${L("更常选：","picks more often: ")}${Object.entries(SIM_W[r]).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([id])=>T(MODULES.find(m=>m.id===id))).join(L("、",", "))}</li>`).join("")}</ul>
   <p><b>${L("正式版怎么拿到真实数据：","How the full version gets real data:")}</b> ${L("在 Council 已有的 Participate Parramatta 上收集（2020 年以来超过 196,000 名独立访客","collect on Council's existing Participate Parramatta (more than 196,000 unique visitors since 2020")} ${chip("S5","p.16–17")}${L("），再加现场二维码标牌和图书馆平板，照顾不常上网的人。只问身份和可选的年龄段、邮编",") plus on-site QR signs and library tablets for people who rarely go online. It asks only for role, and optionally age band and postcode")} ${chip("S5","p.30")}${L("。再用 ABS 人口普查检查各群体的代表性。平台和场地都是 Council 已有的，成本主要是标牌和平板。",". The ABS Census is used to check how representative each group is. The platform and venues already exist, so the main costs are signs and tablets.")}</p></details>`;}

/* ---------- the one vote block: 10 tiles, pick up to 3 ---------- */
function voteTile(m,P){const on=S.pick.includes(m.id),full=S.pick.length>=VOTE_MAX&&!on,c=GROUPS[m.g].c,n=cntIn(m.id,P)+(on?1:0);
  return `<button class="vp${on?" on":""}" data-vp="${m.id}" aria-pressed="${on}"${full?` aria-disabled="true"`:""} style="--gc:${c}"><span class="vp-n" aria-label="${L(`${n} 票`,`${n} votes`)}">${n}</span><span class="dic" aria-hidden="true">${ICON[m.id](c)}</span><b>${T(VOTE_WHY[m.id])}</b><small>${T(m)}</small></button>`;}
function votePick(){const P=pool(),n=S.pick.length;
  return `<div class="vh"><h3 class="vq" style="margin:0">${L(`广场最该解决什么？最多选 ${VOTE_MAX} 项`,`What should the square fix first? Pick up to ${VOTE_MAX}`)}</h3><span class="dprog" aria-label="${n} / ${VOTE_MAX}">${Array.from({length:VOTE_MAX},(_,k)=>`<i class="${k<n?"d":""}"></i>`).join("")}</span></div>
   <div class="vp-grid">${MODULES.map(m=>voteTile(m,P)).join("")}</div>
   <p class="small muted vnote">${L("数字 = 票数。","The number = votes.")} ${SIMTAG()} <span class="tag t-design">${L("团队示例","Team-written example")}</span></p>${aboutData()}`;}

/* ---------- send bar and free text (secondary) ---------- */
function sendBar(){const n=S.pick.length,subs=subsAll();
  return `<div class="sendbar"><div><b>${L(`你选了 ${n} 项`,`You picked ${n}`)}</b><div class="small muted">${V.sent?esc(V.sent):subs.length?L(`本浏览器已保存 ${subs.length} 份演示提交，没有发送给 Council。`,`${subs.length} demo submission(s) saved in this browser only. Nothing was sent to Council.`):L("演示版只保存在你的浏览器里，不会发送给任何人。","In this demo your answers stay in your browser and are not sent anywhere.")}</div></div>
   <div class="sendbtns">${V.sent?`<button class="btn" data-tab="council">${L("看 Council 会收到什么 →","See what Council would receive →")}</button>`:""}<button class="btn primary" id="submit">${L("提交（演示）","Submit (demo)")}</button></div></div>`;}
function freeText(){return `<details class="vfree"><summary>${L("还想补充？写几句（可选）","Anything else? Write a few words (optional)")}</summary>
   <label class="f" for="exp">${L("你现在在这一带的体验是什么？比如晚上走、等车、带孩子、做生意。","What is it like around here now? Walking at night, waiting for a bus, with kids, running a shop.")}</label><textarea id="exp">${esc(S.exp)}</textarea>
   <label class="f" for="wish" style="margin-top:8px">${L("这个广场怎样才对你有用？","What would make this square work for you?")}</label><textarea id="wish">${esc(S.wish)}</textarea>
   <p class="small muted">${L("请不要写姓名、电话或住址。按“最少必要数据”原则，我们只问身份和可选的年龄段、邮编。你写的文字留在本浏览器里；演示里 Council 一方可以点按钮，把它发给 AI 服务做归类","Please leave out names, phone numbers and addresses. Under the minimum-data rule we only ask your role, and optionally age band and postcode. What you write stays in this browser; in the demo the Council side can press a button that sends it to an AI service to be grouped")} ${chip("S5","p.30")}${L("。",".")}</p></details>`;}
function voteSection(){return `<div class="card vcard"><div id="votePick" style="display:grid;gap:10px">${votePick()}</div><div id="sendBox">${sendBar()}</div>${freeText()}</div>`;}
function voteRefresh(which){const m={votePick,sendBox:sendBar,tallyBox:tallyPanel};(which||Object.keys(m)).forEach(k=>{const e=document.getElementById(k);if(e)e.innerHTML=m[k]();});}

/* returns true when it handled the click */
function voteClick(b){const d=b.dataset;
  if(d.vp){const i=S.pick.indexOf(d.vp);if(i>=0)S.pick.splice(i,1);else if(S.pick.length<VOTE_MAX)S.pick.push(d.vp);else return true;V.sent="";voteRefresh(["votePick","sendBox"]);return true;}
  if(b.id==="vPreview"){V.preview=!V.preview;voteRefresh(["tallyBox"]);return true;}
  if(b.id==="clearVotes"){store.set("cav_subs",[]);S.pick=[];V.preview=false;V.sent="";voteRefresh(["tallyBox"]);return true;}
  return false;}
/* called after submitDemo() saved the votes: start fresh so votes are not counted twice */
function voteAfterSubmit(){const n=subsAll().length;S.pick=[];V.sent=L(`已保存为本浏览器第 ${n} 份演示提交，没有发送给 Council。可以换个身份再投一次。`,`Saved as demo submission ${n} in this browser. Nothing was sent to Council. You can vote again as another role.`);}

/* ---------- Council view: tally by option and by group, 10-person threshold per group ---------- */
const PRIV_N=10;
const pctOf=(a,b)=>b?Math.round(100*a/b):0;
function groupCell(label,g,f){return g.length<PRIV_N?`<span class="gh">${label} <small>${L("少于 10，隐藏","under 10, hidden")}</small></span>`:`<span>${label} <b>${f(g)}</b></span>`;}
function tallyPanel(){const P=pool(),n=P.length,mine=mineAll().length;
  const rows=MODULES.map(m=>({m,c:cntIn(m.id,P)})).sort((x,y)=>y.c-x.c);
  const ages=AGES.map(a=>[a,P.filter(x=>x.age===a)]).concat([[L("未填","Not given"),P.filter(x=>!x.age)]]).filter(([,g])=>g.length);
  return `<p class="small muted">${L(`共 ${n} 份：${n-mine} 份模拟 + ${mine} 份本浏览器的演示提交。每人最多选 ${VOTE_MAX} 项。`,`${n} in all: ${n-mine} simulated + ${mine} demo submission(s) from this browser. Each person picks up to ${VOTE_MAX}.`)} ${SIMTAG()}</p>
   ${aboutData()}
   <ul class="tally" style="margin-top:10px">${rows.map(({m,c})=>`<li><div class="tl1"><span class="dic sm" aria-hidden="true">${ICON[m.id](GROUPS[m.g].c)}</span> <b>${T(VOTE_WHY[m.id])}</b> <span class="small muted">${T(m)}</span></div>
     <div class="tl2"><span class="tbar"><span style="width:${pctOf(c,n)}%;background:${GROUPS[m.g].c}"></span></span><span class="tn">${c}<small>/${n}</small></span></div>
     <div class="trole">${ROLES.map(r=>groupCell(T(r),P.filter(x=>x.role===r.id),g=>pctOf(cntIn(m.id,g),g.length)+"%")).join("")}</div></li>`).join("")}</ul>
   <p class="small muted" style="margin-top:8px">${L("身份那一行是该身份里选这一项的比例。少于 10 人的组不显示。","The role line is the share of each role that picked it. Groups under 10 are hidden.")}</p>
   <p class="small">${L("年龄段","Age band")}${L("：",": ")}${ages.map(([a,g])=>g.length<PRIV_N?`${esc(a)} <span class="muted">&lt;10</span>`:`${esc(a)} <b>${g.length}</b>`).join(" · ")}</p>
   ${mine?`<button class="btn" id="clearVotes">${L("清除本浏览器的演示票","Clear demo votes in this browser")}</button>`:""}`;}
