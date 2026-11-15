/* ===== variants/council.js: Council backend and evidence ledger (demo) =====
   Everything here is demo state saved in this browser. A review decision is recorded as made by a
   team member, never as Council approval. No figure comes from outside S1–S5: every count on these
   pages is counted from this page's own data or from demo submissions in this browser.
   Names start with cb / CB so they stay clear of the other shared files. */
const CB_MIN=10;                       // privacy threshold: a group is shown only at 10 or more
const CB={filter:"all",pick:null,preview:false};
const cbSubs=()=>store.get("cav_subs")||[];
const cbWhen=t=>new Date(t).toLocaleString(S.lang==="zh"?"zh-CN":"en-AU",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
const cbClaim=id=>CLAIMS.find(c=>c.id===id);
const cbPreview=()=>CB.preview;
const cbMedian=xs=>{const s=xs.slice().sort((a,b)=>a-b),n=s.length;return n?(n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2):0;};

/* ---------- review state: ok | edit | rej, plus gap for claims that have no source ---------- */
function cbRev(){return store.get("cav_review")||{};}
function cbState(c){return !c.src?"gap":(cbRev()[c.id]||{}).st||"ok";}
function cbShown(id){const c=cbClaim(id);return !c||cbState(c)==="ok"||cbState(c)==="gap";}
function cbHeldLi(){return `<li class="cb-held"><span class="tag t-gap">${L("未通过核对","Held back")}</span> ${L("这一条在后台被退回或驳回，暂不向居民显示。（演示里保留这行占位，正式版直接不显示。）","A reviewer sent this claim back or rejected it, so residents do not see it. (The demo keeps this placeholder; the full version shows nothing.)")}</li>`;}
function cbSet(id,st,why){const r=cbRev();r[id]={st,why:why||"",at:Date.now()};store.set("cav_review",r);}
const cbNoPage=c=>!!c.src&&!c.pg&&c.src!=="S3";      // S3 is a web page, so it has no page numbers
function cbCounts(){const k={total:CLAIMS.length,sourced:0,ok:0,edit:0,rej:0,gap:0,nopage:0};
  CLAIMS.forEach(c=>{const s=cbState(c);k[s]++;if(c.src)k.sourced++;if(cbNoPage(c))k.nopage++;});return k;}
const CB_WHY=()=>({
  rej:[["quote",L("原文不符","Does not match the original")],["context",L("断章取义","Out of context")],["page",L("页码错","Wrong page")],["old",L("已过时","Out of date")]],
  edit:[["word",L("措辞要改","Wording needs work")],["page",L("要补页码","Needs a page number")],["lang",L("中英文不一致","Chinese and English differ")],["quote",L("要补原文","Needs the original wording")]]});
const cbStateT=st=>({ok:L("团队已核对","Team-checked"),edit:L("需修改","Needs edit"),rej:L("已驳回","Rejected"),gap:L("证据空白","Evidence gap")}[st]);

/* ---------- ledger: filters, groups, one row per claim ---------- */
const CB_FILTERS=()=>[["all",L("全部","All")],["ok",cbStateT("ok")],["edit",cbStateT("edit")],["rej",cbStateT("rej")],["gap",cbStateT("gap")],["nopage",L("缺页码","No page")]];
const cbMatch=(c,f)=>f==="all"||(f==="nopage"?cbNoPage(c):cbState(c)===f);
function cbRow(c){const st=cbState(c),r=cbRev()[c.id],pick=CB.pick&&CB.pick.id===c.id?CB.pick.st:null,card=CARDS.find(x=>x.id===c.card);
  const why=r&&r.why?(CB_WHY()[st]||[]).find(x=>x[0]===r.why):null;
  const who=st==="gap"?L("来源里没有这个数字，所以没有可核对的原文","No source gives this figure, so there is no wording to check")
    :r?`${L("核对人：团队成员（演示）","Checked by: a team member (demo)")} · ${cbWhen(r.at)}${why?" · "+why[1]:""}`
    :L("核对人：团队（整理原型时）","Checked by: the team, when the prototype was compiled");
  const use=st==="ok"?L("居民端：显示","Residents: shown"):st==="gap"?L("居民端：标为证据空白","Residents: shown as an evidence gap"):L("居民端：不显示","Residents: hidden");
  return `<article class="cb-row cbs-${st}" id="lr-${c.id}">
   <div class="cb-rh"><span class="cb-n">${CLAIMS.indexOf(c)+1}</span><span class="status cbt-${st}">${cbStateT(st)}</span>${c.src?chip(c.src,c.pg,c.id):""}${cbNoPage(c)?`<span class="tag t-infer">${L("缺页码","No page")}</span>`:c.src==="S3"?`<span class="tag cb-neutral">${L("网页，无页码","Web page, no pages")}</span>`:""}</div>
   <div class="cb-rt">${T(c)}</div>
   <div class="cb-rq">${c.q?`<span lang="en">“${esc(c.q)}”</span>`:`${L("没有原文可引","No original wording to quote")}`}</div>
   <div class="cb-ra">${st==="gap"?"":`<div class="cb-btns" role="group" aria-label="${L("核对决定","Review decision")}">${[["ok",L("批准","Approve")],["edit",L("退回修改","Send back")],["rej",L("驳回","Reject")]].map(([k,t])=>`<button class="cb-b cb-b-${k}" data-cb="rev" data-cid="${c.id}" data-val="${k}" aria-pressed="${st===k}">${t}</button>`).join("")}</div>`}
    ${pick?`<div class="cb-why"><span class="small">${pick==="rej"?L("驳回理由：","Reason to reject:"):L("要改什么：","What needs changing:")}</span>${CB_WHY()[pick].map(([k,t])=>`<button data-cb="why" data-val="${k}">${t}</button>`).join("")}<button data-cb="cancel">${L("取消","Cancel")}</button></div>`:""}
    <div class="cb-who">${who}</div><div class="cb-who">${use} · ${T(card)}</div></div></article>`;}
function cbLedger(){const k=cbCounts(),n=f=>CLAIMS.filter(c=>cbMatch(c,f)).length,list=CLAIMS.filter(c=>cbMatch(c,CB.filter));
  return `<div class="cb-filter" role="group" aria-label="${L("筛选","Filter")}">${CB_FILTERS().map(([f,t])=>`<button data-cb="filter" data-val="${f}" aria-pressed="${CB.filter===f}">${t} <i>${n(f)}</i></button>`).join("")}</div>
   ${CB.filter==="nopage"?`<p class="small muted">${L("S4 是 PDF，但我们整理这些条目时没有记页码。证据标准要求来源能定位，所以这里把它们列出来，等补上页码。","S4 is a PDF, but we did not record page numbers when compiling these claims. The evidence standard asks for a source that can be located, so they are listed here until the pages are added.")} ${chip("S1","p.13")}</p>`:""}
   ${list.length?CARDS.map(cd=>{const xs=list.filter(c=>c.card===cd.id);return xs.length?`<details class="cb-grp" open><summary>${T(cd)} <span class="small muted">(${xs.length})</span></summary>${xs.map(cbRow).join("")}</details>`:"";}).join("")
     :`<p class="cb-ghost">${L("这个筛选下没有条目。","No claims match this filter.")}</p>`}
   <div class="cb-acts" style="margin-top:12px"><span class="small muted">${L(`${k.ok} 条显示给居民，${k.edit+k.rej} 条不显示，${k.gap} 条标为证据空白。核对记录只保存在本浏览器。`,`${k.ok} shown to residents, ${k.edit+k.rej} hidden, ${k.gap} marked as an evidence gap. Review records are saved in this browser only.`)}</span>
    ${Object.keys(cbRev()).length?`<button class="btn cb-sm" data-cb="resetrev">${L("恢复演示默认","Reset to demo default")}</button>`:""}</div>`;}
function cbPipe(){const k=cbCounts();
  const st=(attr,n,h,b,tag)=>`<button class="cb-step" ${attr}><b>${n} · ${h}</b><span>${b}</span><span>${tag}</span></button>`;
  return `<div class="cb-pipe">
   ${st(`data-cb="go" data-val="ledger#cb-src"`,1,"PDF",L("规划师上传总规、Council 报告和战略","A planner uploads the plan, the report and the strategy"),`<span class="tag t-fact">S2 · S4 · S5</span>`)}
   ${st(`data-cb="go" data-val="ledger#cb-std"`,2,L("AI 提取","AI extracts"),L("逐条提取，附页码和原文；没有引用的不收录","Each claim with page and quote; no quote, no entry"),`<span class="tag t-infer">${L("演示：团队人工完成","Demo: done by hand")}</span>`)}
   ${st(`data-cb="go" data-val="ledger#cb-ledger"`,3,L("规划师核对","Planner reviews"),L("批准、退回修改或驳回，记下核对人和时间","Approve, send back or reject; reviewer and time are recorded"),`<span class="tag t-gap">${L("演示：核对人是团队成员","Demo: the reviewer is a team member")}</span>`)}
   ${st(`data-tab="res"`,4,L("居民端","Residents"),L("只显示通过核对的条目","Only claims that passed review are shown"),`<span class="tag t-design">${L(`${k.ok} 条显示 · ${k.edit+k.rej} 条不显示`,`${k.ok} shown · ${k.edit+k.rej} hidden`)}</span>`)}
   ${st(`data-cb="go" data-val="council#cb-gaps"`,5,L("证据空白清单","Evidence-gap list"),L("来源里没有的数字，列出来交给 Council","Figures no source gives are listed for Council"),`<span class="tag t-gap">${L(`${GAPS().length} 条`,`${GAPS().length} gaps`)}</span>`)}</div>`;}
function cbStandard(){const k=cbCounts(),tag=(c,t)=>`<span class="tag ${c}">${t}</span>`,done=tag("t-fact",L("已做","Done")),part=tag("t-infer",L("部分","Partly")),todo=tag("t-gap",L("还没做","Not yet"));
  const rows=[
   [L("来源和日期","Source and date"),L("5 份来源都列了发布方和日期，见下方“来源”","All five sources list publisher and date: see Sources below"),done],
   [L("分析单元和覆盖范围","Unit of analysis and coverage"),L("一个地点、一个决策：第一期范围里的一块 1,200 m² 广场","One place, one decision: a 1,200 m² square inside the Phase 1 area")+" "+chip("S2","p.23","sq1"),done],
   [L("清洗过程","Cleaning"),L(`条目是人工摘录的，没有自动清洗；${k.nopage} 条 S4 条目还缺页码`,`Claims were extracted by hand with no automated cleaning; ${k.nopage} S4 claims still lack a page number`),part],
   [L("缺失或有偏的群体","Missing or biased groups"),L("演示没有真实提交；投票汇总用的是标明的模拟数据。代表性检查的版式在 Council 后台，ABS 数据还没读","The demo has no real submissions; the vote tally uses simulated data, labelled as such. The representativeness check is laid out in the Council backend; the ABS data is not read yet"),todo],
   [L("至少一个人工验证步骤","At least one human check"),L(`本清单逐条核对：${k.ok} / ${k.sourced} 条通过。核对人是团队成员，不是 Council`,`This ledger, claim by claim: ${k.ok} of ${k.sourced} passed. The reviewer is a team member, not Council`),done],
   [L("AI 使用情况","Use of AI"),L("演示页面运行时不调用 AI：条目来自来源原文，数字由透明公式算出。正式版由 AI 提取和起草，规划师批准","The demo page calls no AI when it runs: claims come from the source wording and figures from an open formula. In the full version AI extracts and drafts, and a planner approves"),done],
   [L("区分事实、假设和生成内容","Facts, assumptions and generated content kept apart"),L("四种标签：来源原文、我们的设计、假设、证据空白","Four tags: source wording, our design, assumption, evidence gap"),done]];
  return `<p class="small muted">${L("赛题对每份数据的要求，和本演示做到哪一步。","What the brief asks of each dataset, and how far this demo gets.")} ${chip("S1","p.13")}</p>
   <div class="cb-kv h"><span>${L("要求","Requirement")}</span><span>${L("本演示","This demo")}</span><span>${L("状态","Status")}</span></div>
   ${rows.map(r=>`<div class="cb-kv"><b>${r[0]}</b><span>${r[1]}</span><span>${r[2]}</span></div>`).join("")}`;}
function cbLedgerPage(){
  return `<div class="wrap tabpage cb"><div class="banner"><b>${L("证据规则。","Evidence rule.")}</b> ${L("每条 Council 事实都有来源、页码和原文；没有来源的只能标成假设或证据空白。","Every Council fact has a source, page and quote; anything without one is marked as an assumption or a gap.")} ${TEAM_CHECKED()}</div>
   <section><div class="sec-h"><h2>${L("正式版流程","How the full version works")}</h2><span class="small muted">${L("点一步，跳到对应的地方","Tap a step to go there")}</span></div>${cbPipe()}</section>
   <section class="card" id="cb-ledger"><div class="sec-h"><h2>${L("证据核对清单","Evidence ledger")} (${CLAIMS.length})</h2><span class="small muted">${L("驳回或退回一条，再回居民故事板看：那一条不再显示。","Reject or send back a claim, then look at the resident storyboard: it is no longer shown.")}</span></div>${cbLedger()}</section>
   <section class="card" id="cb-std"><h2>${L("证据标准自查","Evidence standard self-check")}</h2>${cbStandard()}</section>
   <section class="card" id="cb-src"><h2>${L("来源","Sources")}</h2><ul class="srcs">${Object.entries(SOURCES).map(([k,s])=>`<li><b class="src" style="cursor:default">${k}</b> ${esc(T(s))} ${s.url?`<a href="${s.url}" target="_blank" rel="noopener">${L("原文","Open")} ↗</a>`:`<span class="small muted">${L("团队持有","held by the team")}</span>`}</li>`).join("")}</ul></section>
   <section class="card"><div class="sec-h"><h2>${L("模型系数","Model coefficients")}</h2>${ASSUME()}</div>${coefTable()}</section></div>`;}

/* ---------- decision card: decision, owner, refresh, action enabled (S1 p.13) ---------- */
function cbDecision(){const our=`<span class="tag t-design">${L("我们的设计","Our design")}</span>`;
  const cell=(k,h,b)=>`<div class="cb-dc"><div class="eyebrow">${k}</div><h3>${h}</h3>${b}</div>`;
  return `<section class="card cb-dec" id="cb-dec"><div class="sec-h"><h2>${L("这个后台为哪个决策服务","The decision this backend serves")}</h2><span class="small muted">${L("赛题要求讲清决策、负责人、更新机制和能促成的行动","The brief asks for the decision, the owner, the refresh process and the action enabled")} ${chip("S1","p.13")}</span></div>
   <div class="cb-dcs">
   ${cell(L("决策","Decision"),L("1,200 m² 的广场，各类用途各占多少","How the 1,200 m² square is shared between uses"),
     `<p>${L("Woodhouse Square（暂定名）。总规列了用途，没给各占多少面积。","Woodhouse Square (provisional name). The plan lists the uses but gives no area for each.")} ${chip("S2","p.23","sq1")} ${chip("S2","p.54","sq11")}</p><p class="small muted">${L("分成 10 类用途来比较","Comparing it as 10 uses")} ${our}</p>`)}
   ${cell(L("负责人","Owner"),L("Council：地和总规都是它的","Council: both the land and the plan are its own"),
     `<p>${L("广场在 Council 自有土地上；总规草案由 Council 表决后公示。","The square is on Council-owned land, and Council voted to exhibit the draft plan.")} ${chip("S2","p.23","sq1")} ${chip("S4","")}</p><p class="small muted">${L("在工具里核对条目、回应意见的团队：待 Council 指定","The team that reviews claims and responds in this tool: for Council to name")} ${our}</p>`)}
   ${cell(L("何时更新","Refresh"),L("跟着总规的三个节点走","At three points in the plan's own timeline"),
     `<ul><li>${L("最终版总规提交 Council（是否已通过，待核实）","The final master plan goes to Council (whether it has been adopted is still to be checked)")} ${chip("S3","")}</li><li>${L("交通研究：FY27/28 聘顾问","The traffic study: consultants in FY27/28")} ${chip("S4","","tr6")}</li><li>${L("第二期总规 2027 年公示","Phase 2 goes on exhibition in 2027")} ${chip("S3","")}</li></ul><p class="small muted">${L("每到一个节点，重新核对条目、重跑原则检查","At each point, review the claims again and rerun the principle check")} ${our}</p>`)}
   ${cell(L("能促成的行动","Action enabled"),L("给总规列出的后续工作提供输入","Input to the follow-up work the plan already lists"),
     `<ul><li>${L("修订 DCP 2023 Part 9","Amending DCP 2023 Part 9")} ${chip("S2","p.54")}</li><li>${L("公共艺术总体规划","The Public Art Master Plan")} ${chip("S4","","ct6")}</li><li>${L("Council 用地的可行性研究和商业论证","Feasibility and business case for Council's land")} ${chip("S2","p.54")}</li><li>${L("向州政府倡导","Advocacy to the State")} ${chip("S5","p.44")} <button class="cb-link" data-cb="go" data-val="council#cb-brief">${L("看简报","See the brief")} ↓</button></li></ul>`)}
   </div></section>`;}

/* ---------- status tiles and the to-do list ---------- */
function cbGroups(){const subs=cbSubs(),rows=ROLES.map(r=>({r,n:subs.filter(s=>s.role===r.id).length}));return {rows,ok:rows.filter(x=>x.n>=CB_MIN).length};}
function cbTiles(){const k=cbCounts(),p=pCheckSummary(S.a),n=cbSubs().length,g=cbGroups(),held=k.edit+k.rej;
  const tile=(attr,num,t,s,cls)=>`<button class="cb-tile ${cls||""}" ${attr}><span class="cb-tn">${num}</span><span class="cb-tt">${t}</span><small>${s}</small></button>`;
  return `<div class="cb-tiles" role="group" aria-label="${L("现在的状态","Status now")}">
   ${tile(`data-cb="filter" data-val="all"`,`${k.ok}<i>/${k.sourced}</i>`,L("条目通过核对","Claims passed review"),L("团队核对，不是 Council 批准","By the team, not Council"))}
   ${tile(`data-cb="filter" data-val="${k.rej&&!k.edit?"rej":"edit"}"`,held,L("条目被退回或驳回","Sent back or rejected"),L("居民端不显示","Hidden from residents"),held?"warn":"")}
   ${tile(`data-cb="go" data-val="council#cb-p"`,`${p.keep}<i>/5</i>`,L("原则保持","Principles kept"),p.weak+p.fail?L(`削弱 ${p.weak} · 不满足 ${p.fail}`,`${p.weak} weakened · ${p.fail} not met`):L("当前分配没有削弱任何一条","The current split weakens none"),p.fail?"bad":p.weak?"warn":"")}
   ${tile(`data-cb="go" data-val="council#cb-fb"`,n,L("演示提交","Demo submissions"),g.ok?L(`${g.ok} 个群体达到 ${CB_MIN} 份`,`${g.ok} group(s) reached ${CB_MIN}`):L(`还没有群体达到 ${CB_MIN} 份`,`No group has reached ${CB_MIN} yet`))}
   ${tile(`data-cb="go" data-val="council#cb-gaps"`,GAPS().length,L("证据空白","Evidence gaps"),L("列出来，不用估算填上","Listed, not filled with estimates"))}</div>`;}
function cbTodo(){const k=cbCounts(),items=[],go=v=>`data-cb="go" data-val="council#${v}"`;
  if(k.edit) items.push([L(`${k.edit} 条条目被退回修改，改好后要重新批准`,`${k.edit} claim(s) were sent back; they need approving again once fixed`),`data-cb="filter" data-val="edit"`,L("去台账","Open the ledger")]);
  if(k.nopage) items.push([L(`${k.nopage} 条 S4 条目还缺页码`,`${k.nopage} S4 claims have no page number`),`data-cb="filter" data-val="nopage"`,L("去台账","Open the ledger")]);
  pCheckData(S.a).filter(r=>r.st!=="keep").forEach(r=>items.push([L(`居民当前的分配${r.st==="fail"?"不满足":"削弱了"} ${r.ids.join(" · ")}`,`The resident's current split ${r.st==="fail"?"does not meet":"weakens"} ${r.ids.join(" · ")}`),go("cb-p"),L("看检查","See the check")]));
  const un=cbTexts().filter(x=>!cbRoutes()[x.k]).length;
  if(un) items.push([L(`${un} 条居民文字意见还没有去向`,`${un} written comment(s) have no next step yet`),go("cb-triage"),L("去分拣","Sort them")]);
  const b=cbBriefState();
  if(b!=="ok") items.push([{none:L("倡导简报还没有草稿","The advocacy brief has no draft yet"),draft:L("倡导简报草稿在等人工批准","The advocacy brief draft is waiting for a person to approve it"),stale:L("倡导简报批准之后内容变了，要重新批准","The advocacy brief changed after approval and needs approving again")}[b],go("cb-brief"),L("去简报","Open the brief")]);
  return items.length?`<ul class="cb-todo">${items.map(i=>`<li><span>${i[0]}</span><button class="btn cb-sm" ${i[1]}>${i[2]} →</button></li>`).join("")}</ul>`
    :`<p class="cb-ghost" style="margin-top:8px">${L("现在没有要处理的事。","Nothing needs attention right now.")}</p>`;}

/* ---------- resident feedback: per-group threshold, summary, representativeness ---------- */
function cbReact(subs,cid){const c={yes:0,unsure:0,no:0};subs.forEach(s=>{const v=(s.react||{})[cid];if(v in c)c[v]++;});return c;}
function cbReactRow(subs,cd){const c=cbReact(subs,cd.id),n=subs.length,said=c.yes+c.unsure+c.no,w=v=>n?100*v/n:0;
  return `<div class="cb-line"><b>${T(cd)}</b><div class="cb-bar" aria-hidden="true"><span class="cb-y" style="width:${w(c.yes)}%"></span><span class="cb-u" style="width:${w(c.unsure)}%"></span><span class="cb-no" style="width:${w(c.no)}%"></span></div>
   <small>${L(`支持 ${c.yes} · 不确定 ${c.unsure} · 有顾虑 ${c.no} · 没表态 ${n-said}`,`Support ${c.yes} · Not sure ${c.unsure} · Concerned ${c.no} · No view ${n-said}`)}</small></div>`;}
function cbSummary(subs){const n=subs.length,gsumOf=(a,g)=>MODULES.filter(m=>m.g===g).reduce((s,m)=>s+(+a[m.id]||0),0);
  const pr=pCheckData(PRESETS.base.a).map((r,i)=>{const sts=subs.map(s=>pCheckData(s.a)[i].st);return {ids:r.ids,weak:sts.filter(x=>x==="weak").length,fail:sts.filter(x=>x==="fail").length};});
  const pri=DIMS.map(d=>({d,k:subs.filter(s=>(s.pri||[]).includes(d.id)).length})).filter(x=>x.k).sort((x,y)=>y.k-x.k);
  return `<div class="cb-blk"><h3>${L("对总规三件事的态度","Views on the plan's three items")}</h3>${CARDS.map(cd=>cbReactRow(subs,cd)).join("")}</div>
   <div class="cb-blk"><h3>${L("提交的分法：四大类面积的中位数","Submitted splits: median area by group")}</h3>
    ${Object.keys(GROUPS).map(g=>{const md=cbMedian(subs.map(s=>gsumOf(s.a,g))),b0=gsumOf(PRESETS.base.a,g);
      return `<div class="cb-line"><b style="color:${GROUPS[g].c}">${T(GROUPS[g])}</b> <span class="cb-mono">${L("方案 0","Scenario 0")} ${fmt(b0)} m² → ${L("中位数","median")} ${fmt(md)} m²</span></div>`;}).join("")}</div>
   <div class="cb-blk"><h3>${L("这些分法对总规原则的影响","What these splits do to the plan's principles")}</h3>
    ${pr.map(r=>`<div class="cb-line"><b>${r.ids.join(" · ")}</b> <span class="cb-mono">${L(`${n} 份里：削弱 ${r.weak} 份 · 不满足 ${r.fail} 份`,`Of ${n}: weakened in ${r.weak} · not met in ${r.fail}`)}</span></div>`).join("")}</div>
   <div class="cb-blk"><h3>${L("最在乎的维度","Dimensions people care about most")}</h3><p class="small">${pri.length?pri.map(x=>`${T(x.d)} ${x.k}`).join(" · "):"—"}</p></div>`;}
function cbRep(subs,show){const known=subs.filter(s=>s.lang),zh=known.filter(s=>s.lang==="zh").length;
  const no=`<span class="muted">${L("不能比较","Cannot be compared")}</span>`,gap=`<span class="tag t-gap">${L("证据空白","Evidence gap")}</span>`;
  const rows=[
   [`${L("56.4% 的居民在家说英语以外的语言（2021）","56.4% of residents speak a language other than English at home (2021)")} ${chip("S5","p.16–17")}`,
    L("用中文界面提交的份数。只是代理指标：界面语言不等于在家说的语言","Submissions made in the Chinese interface. A proxy only: interface language is not language at home"),
    show&&known.length?L(`${zh} / ${known.length} 份用中文界面`,`${zh} of ${known.length} used the Chinese interface`):`<span class="muted">${L(`不足 ${CB_MIN} 份，不计算`,`Fewer than ${CB_MIN}: not worked out`)}</span>`],
   [`${L("华人背景占 22.3%，是 LGA 最大的文化群体","22.3% Chinese ancestry, the LGA's largest cultural group")} ${chip("S3","")}`,L("本原型不问文化背景","This prototype does not ask about cultural background"),no],
   [`${L("各身份（居民、商户、通勤者、访客）在人口里的占比","Share of each role (resident, business, commuter, visitor) in the population")} ${gap}`,L("我们收集了身份，但来源里没有对应的基准","We collect the role, but no source gives a matching benchmark"),no],
   [`${L("年龄段、在家说的语言：ABS Census","Age bands and language at home: ABS Census")} <span class="tag t-infer">${L("来源待读","Source not read yet")}</span>`,L("读完 ABS 后再对比；这一版没有问年龄段","To compare once the ABS data is read; this version does not ask for an age band"),no]];
  return `<div class="cb-blk" id="cb-rep"><h3>${L("代表性检查","Representativeness check")}</h3>
   <p class="small muted">${L("正式版对比 ABS Census 的人口结构。ABS 数据我们还没读，所以这里只用手上来源里的两个数字做基准，不写任何没有来源的人口数字。","The full version compares against ABS Census profiles. We have not read the ABS data yet, so only two figures from sources we hold serve as benchmarks, and no unsourced population figure is stated.")}</p>
   <div class="cb-kv h"><span>${L("基准","Benchmark")}</span><span>${L("我们手上能比的","What we can set against it")}</span><span>${L("现在","Now")}</span></div>
   ${rows.map(r=>`<div class="cb-kv"><span>${r[0]}</span><span>${r[1]}</span><span>${r[2]}</span></div>`).join("")}</div>`;}
function cbFeedback(){const subs=cbSubs(),n=subs.length,g=cbGroups(),pv=cbPreview(),show=n>=CB_MIN||(pv&&n>0);
  const head=`<p class="small muted">${L(`同一群体达到 ${CB_MIN} 份才显示汇总，免得从汇总里认出个人。这一栏只算本浏览器里的演示提交（分法、态度、最在乎的维度），不含模拟票，也没有发送给任何人。`,`A group's summary shows only once it reaches ${CB_MIN}, so no one can be picked out. This card counts only demo submissions saved in this browser (splits, views, top concerns). It leaves out the simulated votes, and nothing is sent anywhere.`)}</p>
   <div class="cb-thr"><b>${n}</b><span>${L("份演示提交","demo submission(s)")}</span></div>
   <ul class="cb-grps">${g.rows.map(x=>`<li><span>${T(x.r)}</span><span class="${x.n>=CB_MIN?"ok":"muted"}">${x.n>=CB_MIN?L(`≥ ${CB_MIN} · 可单独显示`,`≥ ${CB_MIN} · shown on its own`):L(`< ${CB_MIN} · 已隐藏`,`< ${CB_MIN} · hidden`)}</span></li>`).join("")}</ul>`;
  let body;
  if(!n) body=`<div class="cb-ghost"><b>${L("还没有演示提交。","No demo submissions yet.")}</b> ${L(`达到 ${CB_MIN} 份后，这里会显示：`,`Once there are ${CB_MIN}, this shows:`)}
     <ul><li>${L("居民对总规三件事的态度：支持、不确定、有顾虑","Views on the plan's three items: support, not sure, concerned")}</li><li>${L("提交的分法里，四大类面积的中位数","Median area by group across the submitted splits")}</li><li>${L("这些分法削弱了哪条总规原则","Which plan principles those splits weaken")}</li></ul>
     <button class="btn cb-sm" data-cb="go" data-val="res#c-say">${L("去居民故事板提交一份","Go and submit one as a resident")} →</button></div>`;
  else body=`${n<CB_MIN?`<div class="cb-gate"><span><b>${L(`不足 ${CB_MIN} 份。`,`Fewer than ${CB_MIN}.`)}</b> ${L("正式版在这之前不显示任何汇总。","The full version shows no summary before this.")}</span><button class="btn cb-sm" data-cb="preview">${pv?L("收起演示预览","Hide the demo preview"):L("看演示预览","Show a demo preview")}</button></div>`:""}
    ${show?`${n<CB_MIN?`<p class="small" style="margin-top:8px"><span class="tag t-gap">${L("预览：正式版不会显示","Preview: the full version would hide this")}</span></p>`:""}${cbSummary(subs)}
      ${g.rows.filter(x=>x.n>=CB_MIN).map(x=>`<div class="cb-blk"><h3>${T(x.r)} (${x.n})</h3>${CARDS.map(cd=>cbReactRow(subs.filter(s=>s.role===x.r.id),cd)).join("")}</div>`).join("")}`:""}
    <button class="btn cb-sm" id="clearSubs" style="margin-top:12px">${L("清除本浏览器的演示提交","Clear demo submissions in this browser")}</button>`;
  return head+body+cbRep(subs,show);}

/* ---------- written comments: one next step each ---------- */
const cbRoutes=()=>store.get("cav_triage")||{};
const CB_ROUTES=()=>[["",L("还没定","Not decided")],["D",L("交给广场设计（D）","To the square's design (D)")],["P",L("找伙伴一起做（P）","Take to partners (P)")],["A",L("写进倡导简报（A）","Into the advocacy brief (A)")],["gap",L("记为证据空白","Log as an evidence gap")],["none",L("无需处理","No action needed")]];
function cbTexts(){const out=[];cbSubs().forEach(s=>{
  if(s.exp&&s.exp.trim())out.push({k:s.t+"e",q:L("现在在这一带的体验","What it is like here now"),txt:s.exp.trim()});
  if(s.wish&&s.wish.trim())out.push({k:s.t+"w",q:L("广场怎样才有用","What would make the square work"),txt:s.wish.trim()});});return out;}
function cbTriage(){const xs=cbTexts(),rt=cbRoutes(),cnt=k=>xs.filter(x=>(rt[x.k]||"")===k).length;
  const note=`<p class="small muted">${L("每条文字意见由规划师选一个去向。这里不显示身份等信息，免得从一条意见认出个人。正式版由 AI 建议主题，规划师确认；演示版不用 AI。","A planner picks one next step for each written comment. Role and other details are left out so a single comment cannot identify a person. In the full version AI suggests themes and a planner confirms; the demo uses no AI.")}</p>`;
  if(!xs.length) return note+`<div class="cb-ghost">${L("还没有文字意见。居民在故事板第 4 章写的两段话会出现在这里。","No written comments yet. The two answers residents write in chapter 4 of the storyboard appear here.")}</div>`;
  return note+`<p class="small">${CB_ROUTES().map(([k,t])=>`${t} ${cnt(k)}`).join(" · ")}</p>
   <ul class="cb-tri">${xs.map(x=>`<li><div class="small muted">${x.q}</div><p>“${esc(x.txt)}”</p><label>${L("去向","Next step")} <select data-cbroute="${x.k}">${CB_ROUTES().map(([k,t])=>`<option value="${k}"${(rt[x.k]||"")===k?" selected":""}>${t}</option>`).join("")}</select></label></li>`).join("")}</ul>`;}

/* ---------- who delivers: D / D+P / P from the current split, A as a list of asks ---------- */
const CB_ASKS=()=>[
 {id:"tr6",to:L("TfNSW：交通研究的合作方","TfNSW, Council's partner in the traffic study"),toC:[["S2","p.54"]],
  ask:L("把广场周边的步行过街和路缘接驳，写进交通研究的范围。","Put walking crossings and kerbside access around the square into the scope of the traffic study.")},
 {id:"tr7",to:L("由 Council 确定","For Council to decide"),toC:[],
  ask:L("第二期总规研究车站和 Argyle St 公交换乘站时，把走到广场的这一段一起考虑。","When Phase 2 looks at the station and the Argyle St bus interchange, include the walk to the square.")},
 {id:"sq10",to:L("州和联邦政府：拨款","State and Federal governments: grants"),toC:[["S2","p.54","sq10"]],
  ask:L("为广场建设申请州和联邦拨款。","Seek State and Federal grants towards building the square.")}];
function cbRoles(){const by={D:0,"D+P":0,P:0};MODULES.forEach(m=>by[m.role]+=S.a[m.id]);
  const tiers=[["D",L("Council 直接负责","Council delivers"),L("树冠、雨水花园、座椅、步行、路缘、照明","Canopy, rain gardens, seating, walking, kerb, lighting")],["D+P",L("Council 牵头，与伙伴合作","Council leads with partners"),L("活动和夜市、自行车、回收","Events and markets, bikes, recycling")],["P",L("主要靠伙伴","Mainly partners"),L("文化表达：艺术家、华人社团、First Nations 团体","Cultural expression: artists, Chinese community groups, First Nations groups")]];
  return `<p class="small muted">${L("D = Council 自己做，P = 和伙伴一起做，A = 向州政府等争取。前三格是居民当前分配里的面积；A 不是面积，是要去争取的事。","D = Council delivers, P = partners, A = advocates to others such as the State. The first three show area in the resident's current split; A is not an area but a list of things to ask for.")} ${chip("S5","p.33")} <span class="tag t-design">${L("分工是我们的判断","The roles are our reading")}</span></p>
   <div class="cb-roles">${tiers.map(([k,t,d])=>`<div class="cb-role"><b>${k}</b><span class="t">${t}</span><div class="big">${fmt(by[k])} m²</div><small>${d}</small></div>`).join("")}
    <div class="cb-role a"><b>A</b><span class="t">${L("向州政府等争取","Advocate to others")}</span><div class="big">${L(`${CB_ASKS().length} 件事`,`${CB_ASKS().length} asks`)}</div>
     <ul>${CB_ASKS().map(a=>{const c=cbClaim(a.id);return cbShown(a.id)?`<li>${T(c)} ${chip(c.src,c.pg,c.id)}</li>`:`<li class="cb-held">${L("依据的条目未通过核对，先不列入。","The claim behind this did not pass review, so it is left out for now.")} <button class="cb-link" data-cb="filter" data-val="${cbState(c)}">${L("去台账","Open the ledger")}</button></li>`;}).join("")}</ul></div></div>
   <p class="small" style="margin:10px 0 2px"><b>${L("另外两件事不在广场里面，要等 Council 的其他工作和社区伙伴：","Two more things sit outside the square and wait on other Council work and community partners:")}</b></p>${claimsById(["ct6","ct7"])}`;}

/* ---------- advocacy brief: a template draft from approved claims, approved by a person ---------- */
function cbBriefSig(){return JSON.stringify([["sq1"].concat(CB_ASKS().map(a=>a.id)).map(id=>id+cbState(cbClaim(id))),cbSubs().length,Object.values(cbRoutes()).filter(v=>v==="A").length]);}
function cbBriefState(){const b=store.get("cav_brief");return !b?"none":b.st==="ok"&&b.sig!==cbBriefSig()?"stale":b.st;}
function cbBriefDoc(){const subs=cbSubs(),n=subs.length,c=cbReact(subs,"traffic"),routed=Object.values(cbRoutes()).filter(v=>v==="A").length,our=`<span class="tag t-design">${L("我们的设计","Our design")}</span>`;
  const fact=id=>{const x=cbClaim(id);return `${T(x)} ${chip(x.src,x.pg,x.id)}`;};
  return `<div class="cb-doc"><h4>${L("倡导简报草稿：Woodhouse Square 需要其他方配合的事","Advocacy brief, draft: what Woodhouse Square needs from others")}</h4>
   <p class="small muted">${L("演示草稿，不是 Council 文件。发不发、发给谁，由 Council 决定。依据的战略行动：3.1.2 用数据向 NSW 政府倡导改善出行","A demo draft, not a Council document. Whether it is sent, and to whom, is for Council. Strategy action behind it: 3.1.2, use data to advocate to the NSW Government for better mobility")} ${chip("S5","p.44")}</p>
   <h5>1 · ${L("背景","Background")}</h5><p>${cbShown("sq1")?fact("sq1"):L("（背景条目未通过核对，不能引用。）","(The background claim did not pass review and cannot be quoted.)")}</p>
   <h5>2 · ${L("请求","Asks")}</h5><ol>${CB_ASKS().map(a=>cbShown(a.id)?`<li><b>${L("事实：","Fact:")}</b> ${fact(a.id)}<br><b>${L("请求：","Ask:")}</b> ${a.ask} ${our}<br><span class="small muted">${L("对象：","To:")} ${a.to} ${a.toC.map(x=>chip(x[0],x[1],x[2])).join(" ")}</span></li>`
     :`<li class="cb-held">${L("这一项依据的条目未通过核对，已从简报里拿掉。","The claim behind this ask did not pass review, so the ask is left out.")}</li>`).join("")}</ol>
   <h5>3 · ${L("居民意见","What residents said")}</h5><p>${n>=CB_MIN?L(`对“为行人改造交通”：支持 ${c.yes} · 不确定 ${c.unsure} · 有顾虑 ${c.no}（共 ${n} 份，是本浏览器里的演示提交，不是真实居民数据）。`,`On “Traffic changes for pedestrians”: support ${c.yes} · not sure ${c.unsure} · concerned ${c.no} (${n} in all; demo submissions in this browser, not real resident data).`):L(`演示提交不足 ${CB_MIN} 份，简报不引用居民数据。`,`Fewer than ${CB_MIN} demo submissions, so the brief quotes no resident data.`)}${routed?" "+L(`另有 ${routed} 条文字意见被分到倡导事项。`,`${routed} written comment(s) were also routed to advocacy.`):""}</p>
   <h5>4 · ${L("还缺的证据","Evidence still missing")}</h5><ul>${GAPS().filter(g=>g.id==="g-traffic"||g.id==="g-fund").map(g=>`<li>${g.t} ${g.chips.map(x=>chip(x[0],x[1],x[2])).join(" ")}</li>`).join("")}</ul></div>`;}
function cbBrief(){const st=cbBriefState(),b=store.get("cav_brief"),btn=(v,t,p)=>`<button class="btn cb-sm${p?" primary":""}" data-cb="brief" data-val="${v}">${t}</button>`;
  const stT={none:[L("还没有草稿","No draft yet"),"cb-neutral"],draft:[L("草稿 · 等人工批准","Draft · waiting for a person to approve"),"t-infer"],ok:[L("已批准","Approved"),"t-fact"],stale:[L("批准后内容变了 · 要重新批准","Changed since approval · approve again"),"t-gap"]}[st];
  return `<div class="cb-briefbox"><div class="sec-h"><h3>${L("倡导简报","Advocacy brief")}</h3><span class="tag ${stT[1]}">${stT[0]}</span></div>
   <p class="small muted">${L("正式版由 AI 起草，规划师批准后才能发出。演示版按模板把通过核对的条目拼成草稿，页面没有调用 AI；每句事实都带来源。","In the full version AI drafts it and a planner must approve before it goes out. The demo fills a template with claims that passed review and calls no AI; every fact keeps its source.")}</p>
   ${st==="none"?`<div class="cb-ghost">${L(`草稿会包含：背景、${CB_ASKS().length} 条请求（每条配一条有来源的事实）、居民意见、还缺的证据。`,`The draft will hold: background, ${CB_ASKS().length} asks (each with a sourced fact), what residents said, and the evidence still missing.`)}</div><div class="cb-acts" style="margin-top:8px">${btn("make",L("生成草稿","Make the draft"),1)}</div>`
    :`${cbBriefDoc()}<div class="cb-acts">${st==="ok"?`<span class="small">${L("批准人：团队成员（演示）","Approved by: a team member (demo)")} · ${cbWhen(b.at)}</span>${btn("make",L("撤回批准","Withdraw approval"))}`:`${btn("approve",st==="stale"?L("重新批准（团队成员，演示）","Approve again (team member, demo)"):L("批准（团队成员，演示）","Approve (team member, demo)"),1)}${btn("drop",L("丢弃草稿","Discard the draft"))}`}</div>`}</div>`;}

/* ---------- strategy indicators with "Baseline TBC" (S5) ---------- */
function cbIndicators(){const subs=cbSubs(),n=subs.length,show=n>=CB_MIN||(cbPreview()&&n>0),c=cbReact(subs,"traffic");
  const hid=`<span class="muted">${L(`不足 ${CB_MIN} 份，不显示`,`Fewer than ${CB_MIN}: not shown`)}</span>`,none=`<span class="tag t-gap">${L("还没有对应的问题","No matching question yet")}</span>`;
  const rows=[
   [L("社区对气候适应措施的满意度","Community satisfaction with climate adaptation measures"),"p.39",L("把“遮荫面积”或“雨水滞留”选为最在乎的份数。只说明在乎，不等于满意","Submissions that pick shaded area or stormwater as a top concern. This shows concern, not satisfaction"),
    show?L(`${subs.filter(s=>(s.pri||[]).some(p=>p==="shade"||p==="storm")).length} / ${n} 份`,`${subs.filter(s=>(s.pri||[]).some(p=>p==="shade"||p==="storm")).length} of ${n}`):hid],
   [L("居民对公共交通和主动出行是否够用的感受","Residents' sense of whether public and active transport is adequate"),"p.45",L("对“为行人改造交通”这张卡片的态度","Views on the card “Traffic changes for pedestrians”"),
    show?L(`支持 ${c.yes} · 不确定 ${c.unsure} · 有顾虑 ${c.no}`,`Support ${c.yes} · Not sure ${c.unsure} · Concerned ${c.no}`):hid],
   [L("包含智慧基础设施的公共领域项目占比","Share of public domain projects that include smart infrastructure"),"p.51",L("不靠居民输入。广场如果保留智慧照明与传感器，可以算作一个项目","Not from resident input. If the square keeps smart lighting and sensors it can count as one project"),`<span class="muted">${L("由 Council 统计","For Council to count")}</span>`],
   [L("社区和访客对寻路的满意度","Community and visitor satisfaction with wayfinding"),"p.63",L("可以在提交前加一题","A question could be added before submitting"),none],
   [L("社区对 Council 数字体验的满意度","Community satisfaction with Council's digital experience"),"p.63",L("可以在提交后加一题，问这个工具好不好用","A question could be added after submitting, asking how the tool worked for them"),none]];
  return `<p class="small muted">${L("战略里这些指标的基线都写“待定”。居民的回答可以当基线的候选，但要带上样本量和代表性说明。","The strategy lists these indicators with the baseline still to be confirmed. Resident answers can be candidates for a baseline, but only with the sample size and a representativeness note.")} <span class="tag t-design">${L("对应关系是我们的设计","The mapping is our design")}</span>${show&&n<CB_MIN?` <span class="tag t-gap">${L("预览：正式版不会显示","Preview: the full version would hide this")}</span>`:""}</p>
   <div class="cb-kv h"><span>${L("战略指标（基线待定）","Strategy indicator (baseline TBC)")}</span><span>${L("可用的居民输入","Resident input that could feed it")}</span><span>${L("现在","Now")}</span></div>
   ${rows.map(r=>`<div class="cb-kv"><span>${r[0]} ${chip("S5",r[1])}</span><span>${r[2]}</span><span>${r[3]}</span></div>`).join("")}`;}

/* ---------- the Council page ---------- */
function cbCouncilPage(){
  return `<div class="wrap tabpage cb"><div class="banner"><b>${L("演示后台。","Demo backend.")}</b> ${TEAM_CHECKED()} ${L("页面上的数字要么是这个页面自己数出来的，要么来自本浏览器里的演示提交。","Every count here is either counted by this page or comes from demo submissions in this browser.")}</div>
   ${cbDecision()}
   ${cbTiles()}
   <section class="card" id="cb-todo"><h2>${L("需要处理","Needs attention")}</h2>${cbTodo()}</section>
   <section class="card" id="cb-p"><div class="sec-h"><h2>${L("总规原则检查 P1–P6","Plan principles P1–P6")}</h2><button class="btn cb-sm" data-cb="go" data-val="res#c-try">${L("回居民端改分配","Change the split as a resident")} →</button></div>
    <p class="small"><b>${L("检查对象：","What is checked:")}</b> ${L("居民故事板里当前的分配。在那边拖滑杆，这里跟着变。","The current split in the resident storyboard. Move the sliders there and this follows.")}</p>${allocBar()}<div style="height:8px"></div>${pCheckList()}</section>
   <div class="cgrid">
    <section class="card" id="cb-fb"><h2>${L("居民意见 · 隐私门槛","Resident feedback · privacy threshold")}</h2>${cbFeedback()}</section>
    <section class="card" id="cb-triage"><h2>${L("文字意见 · 每条一个去向","Written comments · one next step each")}</h2>${cbTriage()}</section></div>
   ${typeof tallyPanel==="function"?`<section class="card" id="cb-votes"><h2>${L("居民投票汇总","Resident votes")}</h2><div id="tallyBox">${tallyPanel()}</div></section>`:""}
   <section class="card" id="cb-roles"><h2>${L("谁来做：控制、合作、倡导","Who delivers: control, partner, advocate")}</h2>${cbRoles()}<div id="cb-brief">${cbBrief()}</div></section>
   <section class="card" id="cb-gaps"><h2>${L("证据空白清单","Evidence-gap list")} (${GAPS().length})</h2><p class="small muted">${L("这些数字在来源里找不到。原型不用估算填上，而是列出来交给 Council：缺什么、影响什么、谁能补、什么时候。","No source gives these figures. The prototype does not fill them with estimates; it lists them for Council: what is missing, what it affects, who can fill it, and when.")}</p>${gapsList()}</section>
   <section class="card" id="cb-ind"><h2>${L("战略指标基线","Strategy indicator baselines")}</h2>${cbIndicators()}</section></div>`;}
/* a band at the end of the resident story that leads into the backend */
function cbHandoff(){if(typeof V!=="undefined"&&V.sent)return "";return `<section class="wrap" style="padding-bottom:40px"><div class="card cb-hand"><div><b>${L("你的意见到了 Council 那边，会变成什么？","What becomes of your feedback on Council's side?")}</b>
   <p class="small muted" style="margin:2px 0 0">${L(`后台会检查你的分法是否还符合总规的 6 条原则，按群体汇总意见（不足 ${CB_MIN} 份不显示），并列出证据空白。`,`The backend checks your split against the plan's six principles, sums up feedback by group (hidden below ${CB_MIN}), and lists the evidence gaps.`)}</p></div>
   <button class="btn primary" data-tab="council">${L("看 Council 后台会收到什么","See what Council would receive")} →</button></div></section>`;}

/* ---------- events: own listeners, so the shared click handler stays untouched ---------- */
function cbRedraw(){if(typeof render==="function")render();}
function cbGo(v){const [tab,anchor]=v.split("#");
  if(typeof goTab==="function")goTab(tab,anchor);else{const el=document.getElementById(anchor);if(el)el.scrollIntoView();}}
function cbClick(b){const d=b.dataset;
  if(d.cb==="go"){cbGo(d.val);return;}
  if(d.cb==="filter"){CB.filter=d.val;CB.pick=null;
    if(typeof goTab==="function"&&!document.getElementById("cb-ledger"))goTab("ledger","cb-ledger");else cbRedraw();return;}
  if(d.cb==="rev"){if(d.val==="ok"){cbSet(d.cid,"ok");CB.pick=null;}else CB.pick={id:d.cid,st:d.val};cbRedraw();return;}
  if(d.cb==="why"){if(CB.pick)cbSet(CB.pick.id,CB.pick.st,d.val);CB.pick=null;cbRedraw();return;}
  if(d.cb==="cancel"){CB.pick=null;cbRedraw();return;}
  if(d.cb==="resetrev"){store.set("cav_review",{});CB.pick=null;cbRedraw();return;}
  if(d.cb==="preview"){CB.preview=!CB.preview;cbRedraw();return;}
  if(d.cb==="brief"){
    if(d.val==="make")store.set("cav_brief",{st:"draft",at:Date.now()});
    if(d.val==="approve")store.set("cav_brief",{st:"ok",at:Date.now(),sig:cbBriefSig()});
    if(d.val==="drop")store.set("cav_brief",null);
    cbRedraw();return;}
}
/* submissions are saved by the shared handler; this adds the interface language afterwards, for the proxy check */
function cbAfterSubmit(){const subs=cbSubs(),last=subs[subs.length-1];if(last&&!last.lang){last.lang=S.lang;store.set("cav_subs",subs);}}
document.addEventListener("click",e=>{
  if(e.target.closest("#submit"))setTimeout(cbAfterSubmit,0);
  if(e.target.closest("#clearVotes")&&document.getElementById("cb-fb"))setTimeout(cbRedraw,0);
  const b=e.target.closest("[data-cb]");if(b)cbClick(b);});
document.addEventListener("change",e=>{const t=e.target;if(t&&t.dataset&&t.dataset.cbroute!==undefined){const r=cbRoutes();if(t.value)r[t.dataset.cbroute]=t.value;else delete r[t.dataset.cbroute];store.set("cav_triage",r);cbRedraw();}});
