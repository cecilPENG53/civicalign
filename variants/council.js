/* ===== variants/council.js: Council backend extras (demo) =====
   Builds on what shared.js already has: the review gate (rv, isRejected, claimTxt), the decision card,
   the status strip, the P1–P6 check (pEval) and the gap list (GAPS).
   Adds: a to-do list, a feedback summary with a per-group threshold, a representativeness check,
   written-comment triage, an advocacy brief, strategy indicators, ledger filters, a five-step pipeline
   and an evidence-standard self-check.
   Everything is demo state saved in this browser. No figure comes from outside S1–S5: every count here is
   counted by the page or comes from demo submissions in this browser. The simulated votes (D1, vote.js)
   stay in their own card and are used in one other place only: the outer bars of the wheel on the home
   board (cbWheelCard), where they are labelled as simulated. Names start with cb / CB. */
const CB_MIN=10;                       // privacy threshold: a group is shown only at 10 or more
const CB={filter:"all",preview:false,feat:""};
const cbSubs=()=>store.get("cav_subs")||[];
const cbWhen=t=>new Date(t).toLocaleString(langInfo(S.lang)[1],{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
const cbClaim=id=>CLAIMS.find(c=>c.id===id);
const cbMedian=xs=>{const s=xs.slice().sort((a,b)=>a-b),n=s.length;return n?(n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2):0;};
const cbHid=()=>`<span class="muted">${L(`不足 ${CB_MIN} 份，不显示`,`Fewer than ${CB_MIN}: not shown`)}</span>`;
const cbPrevTag=()=>`<span class="tag t-gap">${L("预览：正式版不会显示","Preview: the full version would hide this")}</span>`;

/* ---------- claim state, read from the review gate in shared.js ---------- */
const cbState=c=>!c.src?"gap":isRejected(c.id)?"rej":(rv(c.id)||{}).st==="edit"?"edit":"ok";
const cbNoPage=c=>!!c.src&&!c.pg&&c.src!=="S3";      // S3 is a web page, so it has no page numbers
function cbCounts(){const k={sourced:0,ok:0,edit:0,rej:0,gap:0,nopage:0};
  CLAIMS.forEach(c=>{k[cbState(c)]++;if(c.src)k.sourced++;if(cbNoPage(c))k.nopage++;});return k;}
const CB_FILTERS=()=>[["all",L("全部","All")],["ok",L("团队已核对","Team-checked")],["edit",L("已修改","Edited")],["rej",L("已驳回","Rejected")],["gap",L("证据空白","Evidence gap")],["nopage",L("缺页码","No page")]];
const cbMatch=(c,f)=>f==="all"||(f==="nopage"?cbNoPage(c):cbState(c)===f);
/* filter bar above the ledger table; ledgerTable({only}) in shared.js does the filtering */
function cbLedgerFilter(){const n=f=>CLAIMS.filter(c=>cbMatch(c,f)).length;
  return `<div class="cb-filter" role="group" aria-label="${L("筛选","Filter")}">${CB_FILTERS().map(([f,t])=>`<button data-cb="filter" data-val="${f}" aria-pressed="${CB.filter===f}">${t} <i>${n(f)}</i></button>`).join("")}</div>
   ${CB.filter==="nopage"?`<p class="small muted">${L("S4 是 PDF，但我们整理这些条目时没有记页码。证据标准要求来源能定位，所以把它们列出来，等补上页码。","S4 is a PDF, but we did not record page numbers when compiling these claims. The evidence standard asks for a source that can be located, so they are listed here until the pages are added.")} ${chip("S1","p.13")}</p>`:""}
   ${n(CB.filter)?"":`<p class="cb-ghost">${L("这个筛选下没有条目。","No claims match this filter.")}</p>`}`;}
const cbOnly=()=>c=>cbMatch(c,CB.filter);

/* ---------- ledger tab: five-step pipeline and the evidence-standard self-check ---------- */
function cbPipe(){const k=cbCounts();
  const st=(attr,n,h,b,tag)=>`<${attr?"button":"div"} class="cb-step" ${attr}><b>${n} · ${h}</b><span>${b}</span><span>${tag}</span></${attr?"button":"div"}>`;
  return `<div class="cb-pipe">
   ${st("",1,"PDF",L("规划师上传总规、Council 报告和战略","A planner uploads the plan, the report and the strategy"),`<span class="tag t-fact">S2 · S4 · S5</span>`)}
   ${st(`data-jump="cb-std"`,2,L("AI 提取","AI extracts"),L("逐条提取，附页码和原文；没有引用的不收录","Each claim with page and quote; no quote, no entry"),`<span class="tag t-infer">${L("演示：团队人工完成","Demo: done by hand")}</span>`)}
   ${st(`data-jump="ledger"`,3,L("规划师核对","Planner reviews"),L("批准、修改或驳回，记下核对人和日期","Approve, edit or reject; reviewer and date are recorded"),`<span class="tag t-gap">${L("演示：核对人是团队成员","Demo: the reviewer is a team member")}</span>`)}
   ${st(`data-tab="res"`,4,L("居民端","Residents"),L("只显示没被驳回的条目","Only claims that were not rejected are shown"),`<span class="tag t-design">${L(`${k.ok+k.edit} 条显示 · ${k.rej} 条不显示`,`${k.ok+k.edit} shown · ${k.rej} hidden`)}</span>`)}
   ${st(`data-cb="go" data-val="council#blk-gaps"`,5,L("证据空白清单","Evidence-gap list"),L("来源里没有的数字，列出来交给 Council","Figures no source gives are listed for Council"),`<span class="tag t-gap">${L(`${GAPS().length} 条`,`${GAPS().length} gaps`)}</span>`)}</div>`;}
function cbStandard(){const k=cbCounts(),tag=(c,t)=>`<span class="tag ${c}">${t}</span>`,done=tag("t-fact",L("已做","Done")),part=tag("t-infer",L("部分","Partly")),todo=tag("t-gap",L("还没做","Not yet"));
  const rows=[
   [L("来源和日期","Source and date"),L("5 份来源都列了发布方和日期，见上方“来源”","All five sources list publisher and date: see Sources above"),done],
   [L("分析单元和覆盖范围","Unit of analysis and coverage"),L("一个地点、一个决策：第一期范围里的一块 1,350 m² 广场","One place, one decision: a 1,350 m² square inside the Phase 1 area")+" "+chip("S2","p.51","sq1"),done],
   [L("清洗过程","Cleaning"),L(`条目是人工摘录的，没有自动清洗；${k.nopage} 条 S4 条目还缺页码`,`Claims were extracted by hand with no automated cleaning; ${k.nopage} S4 claims still lack a page number`),part],
   [L("缺失或有偏的群体","Missing or biased groups"),L("演示没有真实提交；投票汇总用的是标明的模拟数据。代表性检查的版式在 Council 后台，ABS 数据还没读","The demo has no real submissions; the vote tally uses simulated data, labelled as such. The representativeness check is laid out in the Council backend; the ABS data is not read yet"),todo],
   [L("至少一个人工验证步骤","At least one human check"),L(`本清单逐条核对：${k.ok+k.edit} / ${k.sourced} 条通过。核对人是团队成员，不是 Council`,`This ledger, claim by claim: ${k.ok+k.edit} of ${k.sourced} passed. The reviewer is a team member, not Council`),done],
   [L("AI 使用情况","Use of AI"),L("演示页面运行时不调用 AI：条目来自来源原文，数字由透明公式算出。正式版由 AI 提取和起草，规划师批准","The demo page calls no AI when it runs: claims come from the source wording and figures from an open formula. In the full version AI extracts and drafts, and a planner approves"),done],
   [L("区分事实、假设和生成内容","Facts, assumptions and generated content kept apart"),L("标签分开：来源原文、我们的设计、假设、证据空白、模拟数据","Separate tags: source wording, our design, assumption, evidence gap, simulated data"),done]];
  return `<p class="small muted">${L("赛题对每份数据的要求，和本演示做到哪一步。","What the brief asks of each dataset, and how far this demo gets.")} ${chip("S1","p.13")}</p>
   <div class="cb-kv h"><span>${L("要求","Requirement")}</span><span>${L("本演示","This demo")}</span><span>${L("状态","Status")}</span></div>
   ${rows.map(r=>`<div class="cb-kv"><b>${r[0]}</b><span>${r[1]}</span><span>${r[2]}</span></div>`).join("")}`;}

/* ---------- to-do list for the planner ---------- */
function cbTodo(){const k=cbCounts(),items=[],jump=v=>`data-jump="${v}"`;
  if(k.nopage) items.push([L(`${k.nopage} 条 S4 条目还缺页码`,`${k.nopage} S4 claims have no page number`),`data-cb="filter" data-val="nopage"`,L("去台账","Open the ledger")]);
  if(k.rej) items.push([L(`${k.rej} 条条目被驳回，居民端已隐藏`,`${k.rej} claim(s) are rejected and hidden from residents`),`data-cb="filter" data-val="rej"`,L("去台账","Open the ledger")]);
  pEval(S.a).filter(r=>r.lvl==="weak"||r.lvl==="fail").forEach(r=>items.push([L(`居民当前的分配${r.lvl==="fail"?"不满足":"削弱了"} ${r.id}：${r.t}`,`The resident's current split ${r.lvl==="fail"?"does not meet":"weakens"} ${r.id}: ${r.t}`),jump("blk-pc"),L("看检查","See the check")]));
  const un=cbTexts().filter(x=>!cbRoutes()[x.k]).length;
  if(un) items.push([L(`${un} 条居民文字意见还没有去向`,`${un} written comment(s) have no next step yet`),jump("cb-triage"),L("去分拣","Sort them")]);
  const b=cbBriefState();
  if(b!=="ok") items.push([{none:L("倡导简报还没有草稿","The advocacy brief has no draft yet"),draft:L("倡导简报草稿在等人工批准","The advocacy brief draft is waiting for a person to approve it"),stale:L("倡导简报批准之后内容变了，要重新批准","The advocacy brief changed after approval and needs approving again")}[b],jump("cb-brief"),L("去简报","Open the brief")]);
  return items.length?`<ul class="cb-todo">${items.map(i=>`<li><span>${i[0]}</span><button class="btn cb-sm" ${i[1]}>${i[2]} →</button></li>`).join("")}</ul>`
    :`<p class="cb-ghost">${L("现在没有要处理的事。","Nothing needs attention right now.")}</p>`;}

/* ---------- resident feedback: per-group threshold, summary, representativeness ---------- */
function cbGroups(){const subs=cbSubs(),rows=ROLES.map(r=>({r,n:subs.filter(s=>s.role===r.id).length}));return {rows,ok:rows.filter(x=>x.n>=CB_MIN).length};}
function cbReact(subs,cid){const c={yes:0,unsure:0,no:0};subs.forEach(s=>{const v=(s.react||{})[cid];if(v in c)c[v]++;});return c;}
function cbReactRow(subs,cd){const c=cbReact(subs,cd.id),n=subs.length,said=c.yes+c.unsure+c.no,w=v=>n?100*v/n:0;
  return `<div class="cb-line"><b>${T(cd)}</b><div class="cb-bar" aria-hidden="true"><span class="cb-y" style="width:${w(c.yes)}%"></span><span class="cb-u" style="width:${w(c.unsure)}%"></span><span class="cb-no" style="width:${w(c.no)}%"></span></div>
   <small>${L(`支持 ${c.yes} · 不确定 ${c.unsure} · 有顾虑 ${c.no} · 没表态 ${n-said}`,`Support ${c.yes} · Not sure ${c.unsure} · Concerned ${c.no} · No view ${n-said}`)}</small></div>`;}
function cbSummary(subs){const n=subs.length,gsumOf=(a,g)=>MODULES.filter(m=>m.g===g).reduce((s,m)=>s+(+a[m.id]||0),0);
  const lv=subs.map(s=>pEval(s.a)),pr=pEval(PRESETS.base.a).map((r,i)=>({r,weak:lv.filter(x=>x[i].lvl==="weak").length,fail:lv.filter(x=>x[i].lvl==="fail").length})).filter(x=>!x.r.na);
  const pri=DIMS.map(d=>({d,k:subs.filter(s=>(s.pri||[]).includes(d.id)).length})).filter(x=>x.k).sort((x,y)=>y.k-x.k);
  return `<div class="cb-blk"><h3>${L("对总规三件事的态度","Views on the plan's three items")}</h3>${CARDS.map(cd=>cbReactRow(subs,cd)).join("")}</div>
   <div class="cb-blk"><h3>${L("提交的分法：四大类面积的中位数","Submitted splits: median area by group")}</h3>
    ${Object.keys(GROUPS).map(g=>{const md=cbMedian(subs.map(s=>gsumOf(s.a,g))),b0=gsumOf(PRESETS.base.a,g);
      return `<div class="cb-line"><b style="color:${GROUPS[g].c}">${T(GROUPS[g])}</b> <span class="cb-mono">${L("基准","Baseline")} ${fmt(b0)} m² → ${L("中位数","median")} ${fmt(md)} m²</span></div>`;}).join("")}</div>
   <div class="cb-blk"><h3>${L("这些分法对总规原则的影响","What these splits do to the plan's principles")}</h3>
    ${pr.map(x=>`<div class="cb-line"><b>${x.r.id}</b> <span class="cb-mono">${L(`${n} 份里：削弱 ${x.weak} 份 · 不满足 ${x.fail} 份`,`Of ${n}: weakened in ${x.weak} · not met in ${x.fail}`)}</span></div>`).join("")}</div>
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
function cbFeedback(){const subs=cbSubs(),n=subs.length,g=cbGroups(),pv=CB.preview,show=n>=CB_MIN||(pv&&n>0);
  const head=`<p class="small muted">${L(`同一群体达到 ${CB_MIN} 份才显示汇总，免得从汇总里认出个人。这一栏只算本浏览器里的演示提交（分法、态度、最在乎的维度），不含模拟票，也没有发送给任何人。`,`A group's summary shows only once it reaches ${CB_MIN}, so no one can be picked out. This card counts only demo submissions saved in this browser (splits, views, top concerns). It leaves out the simulated votes, and nothing is sent anywhere.`)}</p>
   <div class="cb-thr"><b>${n}</b><span>${L("份演示提交","demo submission(s)")}</span></div>
   <ul class="cb-grps">${g.rows.map(x=>`<li><span>${T(x.r)}</span><span class="${x.n>=CB_MIN?"ok":"muted"}">${x.n>=CB_MIN?L(`≥ ${CB_MIN} · 可单独显示`,`≥ ${CB_MIN} · shown on its own`):L(`< ${CB_MIN} · 已隐藏`,`< ${CB_MIN} · hidden`)}</span></li>`).join("")}</ul>`;
  let body;
  if(!n) body=`<div class="cb-ghost"><b>${L("还没有演示提交。","No demo submissions yet.")}</b> ${L(`达到 ${CB_MIN} 份后，这里会显示：`,`Once there are ${CB_MIN}, this shows:`)}
     <ul><li>${L("居民对总规三件事的态度：支持、不确定、有顾虑","Views on the plan's three items: support, not sure, concerned")}</li><li>${L("提交的分法里，四大类面积的中位数","Median area by group across the submitted splits")}</li><li>${L("这些分法削弱了哪条总规原则","Which plan principles those splits weaken")}</li></ul>
     <button class="btn cb-sm" data-cb="go" data-val="res#c-say">${L("去居民故事板提交一份","Go and submit one as a resident")} →</button></div>`;
  else body=`${n<CB_MIN?`<div class="cb-gate"><span><b>${L(`不足 ${CB_MIN} 份。`,`Fewer than ${CB_MIN}.`)}</b> ${L("正式版在这之前不显示任何汇总。","The full version shows no summary before this.")}</span><button class="btn cb-sm" data-cb="preview">${pv?L("收起演示预览","Hide the demo preview"):L("看演示预览","Show a demo preview")}</button></div>`:""}
    ${show?`${n<CB_MIN?`<p class="small" style="margin-top:8px">${cbPrevTag()}</p>`:""}${cbSummary(subs)}
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
  if(!xs.length) return note+`<div class="cb-ghost">${L("还没有文字意见。居民在故事板第 4 章“还想补充”里写的话会出现在这里。","No written comments yet. What residents write under “Anything else” in chapter 4 of the storyboard appears here.")}</div>`;
  return note+`<p class="small">${CB_ROUTES().map(([k,t])=>`${t} ${cnt(k)}`).join(" · ")}</p>
   <ul class="cb-tri">${xs.map(x=>`<li><div class="small muted">${x.q}</div><p>“${esc(x.txt)}”</p><label>${L("去向","Next step")} <select data-cbroute="${x.k}">${CB_ROUTES().map(([k,t])=>`<option value="${k}"${(rt[x.k]||"")===k?" selected":""}>${t}</option>`).join("")}</select></label></li>`).join("")}</ul>`;}

/* ---------- advocacy brief: a template draft from claims that passed review, approved by a person ---------- */
const CB_ASKS=()=>[
 {id:"tr6",to:L("TfNSW：交通研究的合作方","TfNSW, Council's partner in the traffic study"),toC:[["S2","p.54"]],
  ask:L("把广场周边的步行过街和路缘接驳，写进交通研究的范围。","Put walking crossings and kerbside access around the square into the scope of the traffic study.")},
 {id:"tr7",to:L("由 Council 确定","For Council to decide"),toC:[],
  ask:L("第二期总规研究车站和 Argyle St 公交换乘站时，把走到广场的这一段一起考虑。","When Phase 2 looks at the station and the Argyle St bus interchange, include the walk to the square.")},
 {id:"sq10",to:L("州和联邦政府：拨款","State and Federal governments: grants"),toC:[["S2","p.54","sq10"]],
  ask:L("为广场建设申请州和联邦拨款。","Seek State and Federal grants towards building the square.")}];
function cbBriefSig(){return JSON.stringify([["sq1"].concat(CB_ASKS().map(a=>a.id)).map(id=>[id,rv(id)]),cbSubs().length,Object.values(cbRoutes()).filter(v=>v==="A").length]);}
function cbBriefState(){const b=store.get("cav_brief");return !b?"none":b.st==="ok"&&b.sig!==cbBriefSig()?"stale":b.st;}
function cbBriefDoc(){const subs=cbSubs(),n=subs.length,c=cbReact(subs,"traffic"),routed=Object.values(cbRoutes()).filter(v=>v==="A").length,our=`<span class="tag t-design">${L("我们的设计","Our design")}</span>`;
  const fact=id=>{const x=cbClaim(id);return `${claimTxt(x)} ${chip(x.src,x.pg,x.id)}`;},gp=GAPS();
  return `<div class="cb-doc"><h4>${L("倡导简报草稿：Woodhouse Square 需要其他方配合的事","Advocacy brief, draft: what Woodhouse Square needs from others")}</h4>
   <p class="small muted">${L("演示草稿，不是 Council 文件。发不发、发给谁，由 Council 决定。依据的战略行动：3.1.2 用数据向 NSW 政府倡导改善出行","A demo draft, not a Council document. Whether it is sent, and to whom, is for Council. Strategy action behind it: 3.1.2, use data to advocate to the NSW Government for better mobility")} ${chip("S5","p.44")}</p>
   <h5>1 · ${L("背景","Background")}</h5><p>${isRejected("sq1")?L("（背景条目被驳回，不能引用。）","(The background claim was rejected and cannot be quoted.)"):fact("sq1")}</p>
   <h5>2 · ${L("请求","Asks")}</h5><ol>${CB_ASKS().map(a=>isRejected(a.id)?`<li class="rej-ph">${L("这一项依据的条目被驳回，已从简报里拿掉。","The claim behind this ask was rejected, so the ask is left out.")}</li>`
     :`<li><b>${L("事实：","Fact:")}</b> ${fact(a.id)}<br><b>${L("请求：","Ask:")}</b> ${a.ask} ${our}<br><span class="small muted">${L("对象：","To:")} ${a.to} ${a.toC.map(x=>chip(x[0],x[1],x[2])).join(" ")}</span></li>`).join("")}</ol>
   <h5>3 · ${L("居民意见","What residents said")}</h5><p>${n>=CB_MIN?L(`对“为行人改造交通”：支持 ${c.yes} · 不确定 ${c.unsure} · 有顾虑 ${c.no}（共 ${n} 份，是本浏览器里的演示提交，不是真实居民数据）。`,`On “Traffic changes for pedestrians”: support ${c.yes} · not sure ${c.unsure} · concerned ${c.no} (${n} in all; demo submissions in this browser, not real resident data).`):L(`演示提交不足 ${CB_MIN} 份，简报不引用居民数据，也不引用模拟票。`,`Fewer than ${CB_MIN} demo submissions, so the brief quotes no resident data, and no simulated votes.`)}${routed?" "+L(`另有 ${routed} 条文字意见被分到倡导事项。`,`${routed} written comment(s) were also routed to advocacy.`):""}</p>
   <h5>4 · ${L("还缺的证据","Evidence still missing")}</h5><ul>${[gp[0],gp[4]].filter(Boolean).map(g=>`<li>${g.t} ${g.c}</li>`).join("")}</ul></div>`;}
function cbBrief(){const st=cbBriefState(),b=store.get("cav_brief"),btn=(v,t,p)=>`<button class="btn cb-sm${p?" primary":""}" data-cb="brief" data-val="${v}">${t}</button>`;
  const stT={none:[L("还没有草稿","No draft yet"),"cb-neutral"],draft:[L("草稿 · 等人工批准","Draft · waiting for a person to approve"),"t-infer"],ok:[L("已批准","Approved"),"t-fact"],stale:[L("批准后内容变了 · 要重新批准","Changed since approval · approve again"),"t-gap"]}[st];
  return `<div class="sec-h"><h2 class="ch2">${L("倡导简报（A 层）","Advocacy brief (tier A)")}</h2><span class="tag ${stT[1]}">${stT[0]}</span></div>
   <p class="small muted">${L("正式版由 AI 起草，规划师批准后才能发出。演示版按模板把没被驳回的条目拼成草稿，页面没有调用 AI；每句事实都带来源。","In the full version AI drafts it and a planner must approve before it goes out. The demo fills a template with claims that were not rejected and calls no AI; every fact keeps its source.")}</p>
   ${st==="none"?`<div class="cb-ghost">${L(`草稿会包含：背景、${CB_ASKS().length} 条请求（每条配一条有来源的事实）、居民意见、还缺的证据。`,`The draft will hold: background, ${CB_ASKS().length} asks (each with a sourced fact), what residents said, and the evidence still missing.`)}</div><div class="cb-acts" style="margin-top:8px">${btn("make",L("生成草稿","Make the draft"),1)}</div>`
    :`${cbBriefDoc()}<div class="cb-acts">${st==="ok"?`<span class="small">${L("批准人：","Approved by: ")}${REVIEWER()} · ${cbWhen(b.at)}</span>${btn("make",L("撤回批准","Withdraw approval"))}`:`${btn("approve",(st==="stale"?L("重新批准","Approve again"):L("批准","Approve"))+" · "+REVIEWER(),1)}${btn("drop",L("丢弃草稿","Discard the draft"))}`}</div>`}`;}

/* ---------- strategy indicators with "Baseline TBC" (S5) ---------- */
function cbIndicators(){const subs=cbSubs(),n=subs.length,show=n>=CB_MIN||(CB.preview&&n>0),c=cbReact(subs,"traffic"),hot=subs.filter(s=>(s.pri||[]).some(p=>p==="shade"||p==="storm")).length;
  const none=`<span class="tag t-gap">${L("还没有对应的问题","No matching question yet")}</span>`;
  const rows=[
   [L("社区对气候适应措施的满意度","Community satisfaction with climate adaptation measures"),"p.39",L("把“遮荫面积”或“雨水滞留”选为最在乎的份数。只说明在乎，不等于满意","Submissions that pick shaded area or stormwater as a top concern. This shows concern, not satisfaction"),show?L(`${hot} / ${n} 份`,`${hot} of ${n}`):cbHid()],
   [L("居民对公共交通和主动出行是否够用的感受","Residents' sense of whether public and active transport is adequate"),"p.45",L("对“为行人改造交通”这张卡片的态度","Views on the card “Traffic changes for pedestrians”"),show?L(`支持 ${c.yes} · 不确定 ${c.unsure} · 有顾虑 ${c.no}`,`Support ${c.yes} · Not sure ${c.unsure} · Concerned ${c.no}`):cbHid()],
   [L("包含智慧基础设施的公共领域项目占比","Share of public domain projects that include smart infrastructure"),"p.51",L("不靠居民输入。广场如果保留智慧照明与传感器，可以算作一个项目","Not from resident input. If the square keeps smart lighting and sensors it can count as one project"),`<span class="muted">${L("由 Council 统计","For Council to count")}</span>`],
   [L("社区和访客对寻路的满意度","Community and visitor satisfaction with wayfinding"),"p.63",L("可以在提交前加一题","A question could be added before submitting"),none],
   [L("社区对 Council 数字体验的满意度","Community satisfaction with Council's digital experience"),"p.63",L("可以在提交后加一题，问这个工具好不好用","A question could be added after submitting, asking how the tool worked for them"),none]];
  return `<p class="small muted">${L("战略里这些指标的基线都写“待定”。居民的回答可以当基线的候选，但要带上样本量和代表性说明。这里只算本浏览器里的演示提交。","The strategy lists these indicators with the baseline still to be confirmed. Resident answers can be candidates for a baseline, but only with the sample size and a representativeness note. Only demo submissions in this browser are counted here.")} <span class="tag t-design">${L("对应关系是我们的设计","The mapping is our design")}</span>${show&&n<CB_MIN?" "+cbPrevTag():""}</p>
   <div class="cb-kv h"><span>${L("战略指标（基线待定）","Strategy indicator (baseline TBC)")}</span><span>${L("可用的居民输入","Resident input that could feed it")}</span><span>${L("现在","Now")}</span></div>
   ${rows.map(r=>`<div class="cb-kv"><span>${r[0]} ${chip("S5",r[1])}</span><span>${r[2]}</span><span>${r[3]}</span></div>`).join("")}`;}

/* ---------- home board: the smart-city wheel, after Figure 1 of the strategy (S5 p.18) ----------
   One question: where do residents' votes land on the strategy's 18 features?
   Residents pick up to 3 of the 10 square uses (vote.js). A person votes for a feature when they picked
   at least one use that sits behind it. The greener a wedge, the larger the share of people who did.
   The pool is the SIMULATED set (D1, vote.js) plus this browser's demo submissions, under the 10-person
   threshold. Which use sits behind which feature is the team's reading
   (docs/CHAT_HANDOFF_2026-11-15.md 4.2.1), not Council's.
   Feature names are Council's wording and stay in English in every language. */
const CB_DOMS=[["Smart","Governance"],["Smart","Environment"],["Smart","Living"],["Smart","Mobility"],["Smart","People"],["Smart","Economy"]];
/* id, domain index, Council wording (| = line break on the wheel), Chinese gloss, square uses behind it */
const CB_FEATS=[
 ["ict",0,"ICT &|e-governance",{zh:"信息通信与电子政务"},["smart"]],
 ["open",0,"Transparency &|open data",{zh:"透明与开放数据"},[]],
 ["part",0,"Enabling community|participation",{zh:"促进社区参与"},[]],
 ["gbld",1,"Green buildings",{zh:"绿色建筑"},[]],
 ["renew",1,"Renewable|energy sources",{zh:"可再生能源"},["smart"]],
 ["gplan",1,"Green urban|planning",{zh:"绿色城市规划"},["canopy","blue"]],
 ["safe",2,"Safe places",{zh:"安全的场所"},["smart","events"]],
 ["vib",2,"Culturally|vibrant",{zh:"文化活力"},["culture"]],
 ["conn",2,"Connected|communities",{zh:"有联结的社区"},["events","rest"]],
 ["modal",3,"Mixed-modal|access",{zh:"多方式可达"},["walk","bike","kerb"]],
 ["pat",3,"Prioritise public &|active transport",{zh:"公共交通和主动出行优先"},["walk","bike"]],
 ["dem",3,"Demand|management",{zh:"需求管理"},["kerb"]],
 ["crea",4,"Embrace|creativity",{zh:"拥抱创意"},["culture"]],
 ["incl",4,"Inclusive society",{zh:"包容的社会"},["rest","walk"]],
 ["edu",4,"21st century|education",{zh:"21 世纪教育"},[]],
 ["glob",5,"Local & global|connectedness",{zh:"本地与全球联结"},["events","culture"]],
 ["prod",5,"Productivity",{zh:"生产力"},[]],
 ["ent",5,"Entrepreneurship|& innovation",{zh:"创业与创新"},["events"]]
].map(([id,dom,nm,zh,mods])=>({id,dom,lines:nm.split("|"),name:nm.replace("|"," "),zh:zh.zh,mods}));
const cbGloss=f=>{const z=L(f.zh,"");return z?` <span class="muted">${z}</span>`:"";};
/* people who voted for each feature; n = null when no use sits behind it or the pool is under the threshold */
function cbFeatRows(){const P=pool(),ok=P.length>=CB_MIN;
  return {P,ok,rows:CB_FEATS.map(f=>({...f,n:ok&&f.mods.length?P.filter(r=>r.pick.some(id=>f.mods.includes(id))).length:null}))};}
const cbPt=(r,a)=>{const t=a*Math.PI/180;return (r*Math.sin(t)).toFixed(1)+" "+(-r*Math.cos(t)).toFixed(1);};
const cbSector=(r0,r1,a0,a1)=>`M${cbPt(r1,a0)}A${r1} ${r1} 0 0 1 ${cbPt(r1,a1)}L${cbPt(r0,a1)}A${r0} ${r0} 0 0 0 ${cbPt(r0,a0)}Z`;
const cbTint=s=>`color-mix(in srgb,var(--accent) ${Math.round(12+88*s)}%,var(--surface))`;   // share 0..1 → pale to full green
function cbWheelSvg(rows,N,sel){
  const wedges=rows.map((f,i)=>{const am=-20+20*i,flip=(am+360)%360>180,n=f.lines.length,s=f.n!=null?f.n/N:null;
    return `<g class="cbw-w${s==null?" na":s>.5?" dk":""}${sel===f.id?" on":""}" data-cb="feat" data-val="${f.id}" role="button" tabindex="0" aria-pressed="${sel===f.id}" aria-label="${esc(f.name)}${f.n!=null?`: ${f.n} / ${N}`:""}">
     <path class="cbw-f" d="${cbSector(156,300,am-9.3,am+9.3)}"${s!=null?` style="fill:${cbTint(s)}"`:""}/>
     <text transform="rotate(${flip?am+90:am-90}) translate(${flip?-228:228} 0)" text-anchor="middle">${f.lines.map((t,k)=>`<tspan x="0" dy="${k?14:-(n-1)*7+4.5}">${esc(t)}</tspan>`).join("")}</text>
     ${s!=null?`<text class="cbw-n" text-anchor="middle" transform="translate(${cbPt(320,am)})" dy="5">${Math.round(100*s)}%</text>`:""}</g>`;}).join("");
  const petals=CB_DOMS.map((d,i)=>`<g class="cbw-pt" transform="translate(${cbPt(104,60*i)})"><circle r="42" class="cbw-p"/><text text-anchor="middle"><tspan x="0" dy="-2">${d[0]}</tspan><tspan x="0" dy="14">${d[1]}</tspan></text></g>`).join("");
  return `<svg class="cbw-svg" viewBox="-346 -346 692 692" role="group" aria-label="${L("智慧城市六大领域的 18 项特征","The 18 features of the six smart-city domains")}">
   ${wedges}<circle r="150" class="cbw-ring"/>${petals}
   <circle r="56" class="cbw-c"/><text text-anchor="middle" class="cbw-hit"><tspan x="0" dy="-2">SMART</tspan><tspan x="0" dy="20">CITY</tspan></text></svg>`;}
/* one petal opened: a picture of its vote share. Every form shows the same number (share of people who
   voted for the feature); the form changes with the subject so the petals do not all look alike. */
const CB_PIC={ict:["bars","#8a63b8"],renew:["batt","#4f9a5b"],gplan:["iso","#4f9a5b","canopy"],safe:["gauge","#c9a227"],vib:["iso","#d43c32","culture"],conn:["ppl","#d08a2c",0],
  modal:["road","#3f7cc0"],pat:["iso","#3f7cc0","bike"],dem:["iso","#3f7cc0","kerb"],crea:["iso","#d0658a","star"],incl:["ppl","#d0658a",1],glob:["ring","#d08a2c"],ent:["iso","#d08a2c","events"]};
const cbPicUnit=f=>["iso","ppl"].includes(CB_PIC[f.id][0]);   // forms made of 20 symbols, each worth 5%
function cbPic(f,s){const [k,c,x]=CB_PIC[f.id],off="var(--line)",n=Math.round(s*20);let g="";
  const glyph=(id,col,X,Y,sz)=>ICON[id](col).replace('width="16" height="16"',`x="${X}" y="${Y}" width="${sz}" height="${sz}"`);
  if(k==="iso"){for(let i=0;i<20;i++){const X=12+(i%10)*28,Y=12+Math.floor(i/10)*50,col=i<n?c:off;
    g+=x==="star"?`<path transform="translate(${X+12} ${Y+13}) scale(1.25)" d="M0-10 2.9-3.1 10-3.1 4.2 1.6 6.2 9 0 4.6-6.2 9-4.2 1.6-10-3.1-2.9-3.1Z" fill="${col}"/>`:glyph(x,col,X,Y,24);}}
  else if(k==="ppl"){[Math.min(n,10),Math.max(0,n-10)].forEach((m,r)=>{if(!x&&m>1)g+=`<path d="M24 ${40+r*54}H${24+28*(m-1)}" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;});   // linked hands for "connected"
    for(let i=0;i<20;i++){const X=24+(i%10)*28,Y=54+Math.floor(i/10)*54,col=i<n?c:off,h=x&&i%3===1?.68:1;   // mixed sizes for "inclusive"
      g+=`<g transform="translate(${X} ${Y}) scale(${h})"><circle cy="-31" r="6.5" fill="${col}"/><rect x="-6.5" y="-23" width="13" height="23" rx="6.5" fill="${col}"/></g>`;}}
  else if(k==="gauge"){const pt=(p,r)=>(150-r*Math.cos(Math.PI*p)).toFixed(1)+" "+(110-r*Math.sin(Math.PI*p)).toFixed(1);
    g=`<path d="M${pt(0,84)}A84 84 0 0 1 ${pt(1,84)}" stroke="${off}" stroke-width="20" fill="none" stroke-linecap="round"/><path d="M${pt(0,84)}A84 84 0 0 1 ${pt(s,84)}" stroke="${c}" stroke-width="20" fill="none" stroke-linecap="round"/><path d="M150 110L${pt(s,62)}" stroke="var(--fg)" stroke-width="4" stroke-linecap="round"/><circle cx="150" cy="110" r="7" fill="var(--fg)"/>`;}
  else if(k==="batt"){g=`<rect x="58" y="26" width="174" height="68" rx="12" fill="none" stroke="${off}" stroke-width="4"/><rect x="236" y="46" width="10" height="28" rx="3" fill="${off}"/><rect x="66" y="34" width="${(158*s).toFixed(1)}" height="52" rx="6" fill="${c}"/><path d="M152 38l-18 26h14l-6 20 22-28h-14z" fill="var(--fg)"/>`;}
  else if(k==="bars"){for(let i=0;i<5;i++){const h=24+i*20,X=45+i*44,fl=Math.max(0,Math.min(1,s*5-i))*h;
    g+=`<rect x="${X}" y="${112-h}" width="30" height="${h}" rx="5" fill="${off}"/><rect x="${X}" y="${(112-fl).toFixed(1)}" width="30" height="${fl.toFixed(1)}" rx="5" fill="${c}"/>`;}}
  else if(k==="road"){g=`<rect x="16" y="76" width="268" height="22" rx="11" fill="${off}"/><rect x="16" y="76" width="${(268*s).toFixed(1)}" height="22" rx="11" fill="${c}"/><path d="M28 87H272" stroke="var(--surface)" stroke-width="2" stroke-dasharray="10 9"/>`
    +[["walk",.2],["bike",.5],["kerb",.8]].map(([id,p])=>glyph(id,s>=p?c:off,16+268*p-18,28,36)).join("");}
  else if(k==="ring"){const C=2*Math.PI*46;g=`<circle cx="150" cy="60" r="46" fill="none" stroke="${off}" stroke-width="18"/><circle cx="150" cy="60" r="46" fill="none" stroke="${c}" stroke-width="18" stroke-dasharray="${(C*s).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 150 60)"/>
    <g fill="none" stroke="var(--muted)" stroke-width="2"><circle cx="150" cy="60" r="26"/><ellipse cx="150" cy="60" rx="11" ry="26"/><path d="M124 60H176"/></g>`;}
  return `<svg class="cbw-pic" viewBox="0 0 300 120" role="img" aria-label="${Math.round(100*s)}%">${g}</svg>`;}
function cbFeatDetail(f,P,ok){const dom=CB_DOMS[f.dom],N=P.length,nav=d=>`<button class="btn cb-sm cbw-nav" data-cb="featstep" data-val="${d}" aria-label="${d<0?L("上一瓣","Previous"):L("下一瓣","Next")}">${d<0?"‹":"›"}</button>`;
  return `<div class="cbw-det"><div class="cbw-dh">${nav(-1)}<div><div class="small muted">${dom[0]} ${dom[1]}</div><h3>${esc(f.name)}${cbGloss(f)}</h3></div>${nav(1)}</div>
   ${!ok?`<p class="cb-ghost">${L(`投票不足 ${CB_MIN} 份`,`Fewer than ${CB_MIN} responses`)}</p>`
    :f.n==null?`<p class="cb-ghost" style="text-align:center">${L("投票里没有对应这一瓣的选项","No vote option points here")}</p>`
    :`<div class="cbw-big"><b>${Math.round(100*f.n/N)}%</b><span>${f.n} / ${N}</span></div>${cbPic(f,f.n/N)}${cbPicUnit(f)?`<p class="cbw-cap">${L("1 个 = 5%","1 symbol = 5%")}</p>`:""}
      <ul class="cbw-uses">${f.mods.map(id=>{const m=MODULES.find(k=>k.id===id),c=GROUPS[m.g].c,k=cntIn(id,P);return `<li><span class="dic sm" aria-hidden="true">${ICON[id](c)}</span><span class="cbw-un">${T(VOTE_WHY[id])}</span><span class="cbw-ub"><span style="width:${Math.round(100*k/N)}%;background:${c}"></span></span><span class="cb-mono">${k}</span></li>`;}).join("")}</ul>`}</div>`;}
function cbWheelCard(){const {P,ok,rows}=cbFeatRows(),top=rows.slice().sort((a,b)=>(b.n||0)-(a.n||0))[0],sel=rows.find(f=>f.id===CB.feat)||top;
  return `<section class="card" id="cb-wheel"><div class="sec-h"><h2 class="ch2">${L("居民的票落在战略的哪几瓣","Where residents' votes land on the strategy wheel")}</h2>
    <span>${SIMTAG()} ${chip("S5","p.18")}</span></div>
   <div class="cbw"><div class="cbw-fig">${cbWheelSvg(rows,P.length,sel.id)}
     <div class="cbw-key"><span>${L("票少","Fewer")}</span><i class="cbw-scale"></i><span>${L("票多","More votes")}</span><span><i class="cbw-sw na"></i>${L("没有对应选项","No vote option")}</span></div></div>
    <div class="cbw-side">${cbFeatDetail(sel,P,ok)}</div></div>
   <p class="small muted" style="margin:10px 0 0">${L("哪项选择对应哪一瓣是团队的设定。","Which choice points at which feature is the team's reading.")} <span class="tag t-design">${L("我们的设计","Our design")}</span></p></section>`;}

/* a band at the end of the resident story that leads into the backend; the send bar offers the same link after a submission */
function cbHandoff(){if(typeof V!=="undefined"&&V.sent)return "";
  return `<section class="wrap" style="padding-bottom:40px"><div class="card cb-hand"><div><b>${L("你的意见到了 Council 那边，会变成什么？","What becomes of your feedback on Council's side?")}</b>
   <p class="small muted" style="margin:2px 0 0">${L(`后台会检查你的分法是否还符合总规的 6 条原则，按群体汇总意见（不足 ${CB_MIN} 份不显示），并列出证据空白。`,`The backend checks your split against the plan's six principles, sums up feedback by group (hidden below ${CB_MIN}), and lists the evidence gaps.`)}</p></div>
   <button class="btn primary" data-tab="council">${L("看 Council 后台会收到什么","See what Council would receive")} →</button></div></section>`;}

/* ---------- events: own listeners, so the shared click handler stays untouched ---------- */
function cbRedraw(){if(typeof render==="function")render();}
function cbGo(v){const [tab,anchor]=v.split("#");
  if(typeof goTab==="function")goTab(tab,anchor);else{const el=document.getElementById(anchor);if(el)el.scrollIntoView();}}
function cbClick(b){const d=b.dataset;
  if(d.cb==="go"){cbGo(d.val);return;}
  if(d.cb==="filter"){CB.filter=d.val;
    if(typeof goTab==="function"&&!document.getElementById("ledger"))goTab("ledger","ledger");else cbRedraw();return;}
  if(d.cb==="feat"||d.cb==="featstep"){if(d.cb==="feat")CB.feat=d.val;else{const cur=document.querySelector(".cbw-w.on"),i=CB_FEATS.findIndex(f=>f.id===(cur?cur.dataset.val:CB.feat));CB.feat=CB_FEATS[(i+ +d.val+CB_FEATS.length)%CB_FEATS.length].id;}
    cbRedraw();const w=document.querySelector(d.cb==="feat"?`.cbw-w[data-val="${CB.feat}"]`:`.cbw-nav[data-val="${d.val}"]`);if(w)w.focus({preventScroll:true});return;}
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
  if(e.target.closest("#clearVotes")&&document.getElementById("cb-triage"))setTimeout(cbRedraw,0); // the other cards count the same submissions
  const b=e.target.closest("[data-cb]");if(b)cbClick(b);});
document.addEventListener("keydown",e=>{const w=e.target.closest&&e.target.closest(".cbw-w");if(w&&(e.key==="Enter"||e.key===" ")){e.preventDefault();cbClick(w);}});
document.addEventListener("change",e=>{const t=e.target;if(t&&t.dataset&&t.dataset.cbroute!==undefined){const r=cbRoutes();if(t.value)r[t.dataset.cbroute]=t.value;else delete r[t.dataset.cbroute];store.set("cav_triage",r);cbRedraw();}});
