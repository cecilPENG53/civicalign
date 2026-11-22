/* Council backend: AI summary of the written comments.
   Needs variants/comments.js (CM_SIM, CM_AI), shared.js (L, T, esc, store, S) and council.js (cbTexts).
   What the model did: grouped the comments into themes, wrote one line per theme, suggested a priority and D/P/A.
   What the page does: every count (N, per theme, per word). What a person does: confirms, edits or rejects each theme.
   CM_SIM is simulated. Real comments are the ones typed in this browser; they reach the model only when the planner presses the button. */
const CMX={sel:"",open:false,th:"",q:"",src:"",find:"",n:30,edit:"",busy:false,msg:"",err:false};
const CM_COL=["#1d9e75","#378add","#7f77dd","#8a8f98","#d85a30","#ba7517","#3f9fc0","#d4537e","#639922","#5f6b7a","#a05a9c","#4f8f8a"];
const CM_STOP=[]; // generic words are dropped when the data file is built (scripts/ai_comments.js)
const cmLg=()=>S.lang==="zh"?"zh":"en";
const cmRv=()=>store.get("cav_cm_rv")||{};
const cmLive=()=>store.get("cav_cm_ai")||{assign:{}};
const cmTh=()=>CM_AI.themes;
const cmCol=id=>CM_COL[Math.max(0,cmTh().findIndex(t=>t.id===id))%CM_COL.length];
/* until the model has read a real comment, match it to themes by the cloud words */
function cmGuess(txt){const t=txt.toLowerCase(),hit={};["zh","en"].forEach(lg=>CM_AI.words[lg].forEach(x=>{const w=x[lg];if(!CM_STOP.includes(w)&&t.includes(w))hit[x.th]=(hit[x.th]||0)+1;}));
  return Object.entries(hit).sort((a,b)=>b[1]-a[1]).slice(0,2).map(x=>x[0]);}
function cmAll(){const live=cmLive().assign||{};
  return cbTexts().map(x=>({id:"r"+x.k,k:x.k,real:true,q:/e$/.test(x.k)?"e":"w",zh:x.txt,en:x.txt,th:live[x.k]||cmGuess(x.txt),ai:!!live[x.k]})).concat(CM_SIM);}
const cmSum=t=>{const r=cmRv()[t.id];return r&&r.txt&&r.txt[cmLg()]?r.txt[cmLg()]:T(t.sum);};
const cmQ=q=>q==="e"?L("现在的体验","What it is like now"):L("广场怎样才有用","What would make it work");
function cmFilter(all){const lg=cmLg(),f=CMX.find.trim().toLowerCase();
  return all.filter(c=>(!CMX.th||(CMX.th==="none"?!c.th.length:c.th.includes(CMX.th)))&&(!CMX.q||c.q===CMX.q)&&(!CMX.src||(CMX.src==="real")===!!c.real)
    &&(!f||c[lg].toLowerCase().includes(f)));}
function cmHi(txt){let h=esc(txt);const w=CMX.find.trim();if(!w)return h;const i=h.toLowerCase().indexOf(esc(w).toLowerCase());return i<0?h:h.slice(0,i)+"<mark>"+h.slice(i,i+esc(w).length)+"</mark>"+h.slice(i+esc(w).length);}

function cmCard(){const all=cmAll(),N=all.length,real=all.filter(c=>c.real),rv=cmRv(),ths=cmTh().map(t=>({t,n:all.filter(c=>c.th.includes(t.id)).length})).sort((a,b)=>b.n-a.n);
  const none=all.filter(c=>!c.th.length).length,top=ths[0],okN=ths.filter(x=>(rv[x.t.id]||{}).st==="ok").length,pct=n=>Math.round(n/N*100);
  if(!CMX.sel)CMX.sel=top.t.id;
  const p6=id=>{const p=typeof P6!=="undefined"&&P6.find(x=>x.id===id);return p?T(p):"";};
  const metric=(lab,val,sub)=>`<div class="cm-m"><span>${lab}</span><b>${val}</b>${sub?`<small>${sub}</small>`:""}</div>`;
  const lg=cmLg(),stTag=r=>r.st==="ok"?`<span class="tag t-fact">${L("规划师已确认","Confirmed by planner")}</span>`:r.st==="rej"?`<span class="tag t-gap">${L("已驳回，不进简报","Rejected, kept out of the brief")}</span>`:`<span class="tag t-infer">${L("待规划师确认","Awaiting planner")}</span>`;
  if(!ths.some(x=>x.t.id===CMX.sel))CMX.sel=top.t.id;
  const row=({t,n},k)=>{const r=rv[t.id]||{},on=CMX.sel===t.id;
    return `<li class="cm-t${on?" open":""}${r.st==="rej"?" rej":""}"><button class="cm-th" data-cm="sel" data-val="${t.id}" aria-pressed="${on}"><span class="cm-rk">${k+1}</span><span class="cm-tn">${T(t)}</span><span class="cm-tc">${n} · ${pct(n)}%</span>${r.st==="ok"?`<span class="cm-ck" title="${L("规划师已确认","Confirmed by planner")}">✓</span>`:""}</button>
     <div class="cm-bar"><i style="width:${Math.max(2,Math.round(n/top.n*100))}%;background:${cmCol(t.id)}"></i></div></li>`;};
  const cur=ths.find(x=>x.t.id===CMX.sel),ct=cur.t,cr=rv[ct.id]||{},ed=CMX.edit===ct.id,mine=all.filter(x=>x.th.includes(ct.id));
  const quotes=mine.filter(x=>x.real).concat(mine.filter(x=>!x.real&&x.th.length===1)).slice(0,3);
  const detail=`<div class="cm-d" style="--tc:${cmCol(ct.id)}"><div class="cm-dh"><div><div class="cm-dn"><b>${cur.n}</b><span>${L(`/ ${N} 条意见提到 · ${pct(cur.n)}%`,`of ${N} comments · ${pct(cur.n)}%`)}</span></div><h3>${T(ct)}</h3></div><p class="cm-tags">${stTag(cr)}${ct.mixed?`<span class="tag t-gap">${L("意见不一致","People disagree")}</span>`:""}</p></div>
     ${ed?`<textarea id="cmTxt" rows="3" aria-label="${L("修改概括","Edit the summary")}">${esc(cmSum(ct))}</textarea><div class="rvact"><button class="rvb ok" data-cm="save" data-val="${ct.id}">${L("保存","Save")}</button><button class="rvb" data-cm="cancel">${L("取消","Cancel")}</button></div>`
       :`<p class="cm-sum">${esc(cmSum(ct))}${cr.txt?` <span class="tag t-design">${L("规划师已修改","Edited by planner")}</span>`:""}</p>`}
     <dl class="cm-kv">${ct.p6&&p6(ct.p6)?`<div><dt>${L("AI 建议对应的优先项","Priority suggested by AI")}</dt><dd>${p6(ct.p6)}</dd></div>`:""}${ct.dpa?`<div><dt>${L("AI 建议谁来做","Who acts, suggested by AI")}</dt><dd>${ct.dpa==="D"?L("D · Council 自己做","D · Council delivers"):ct.dpa==="P"?L("P · 和伙伴一起做","P · with partners"):L("A · 向他方争取","A · advocate to others")}</dd></div>`:""}</dl>
     <div class="cm-qs"><div class="small muted">${L("原话举例","In their words")}</div>${quotes.map(q=>`<blockquote>“${esc(q[lg])}”<span class="tag ${q.real?"t-fact":"t-gap"}">${q.real?L("真实","Real"):L("模拟","Simulated")}</span></blockquote>`).join("")}</div>
     <div class="cm-act">${ed?"":`<button class="rvb ok" data-cm="ok" data-val="${ct.id}" aria-pressed="${cr.st==="ok"}">${L("确认","Confirm")}</button><button class="rvb" data-cm="edit" data-val="${ct.id}">${L("修改","Edit")}</button><button class="rvb" data-cm="rej" data-val="${ct.id}" aria-pressed="${cr.st==="rej"}">${L("驳回","Reject")}</button>`}
      <button class="btn cb-sm" data-cm="show" data-val="${ct.id}">${L(`看这 ${cur.n} 条原话`,`Read these ${cur.n} comments`)} ↓</button></div></div>`;
  const shown=cmFilter(all);
  const opt=(v,lab,cur)=>`<option value="${v}"${cur===v?" selected":""}>${lab}</option>`;
  const list=!CMX.open?"":`<div class="cm-list" id="cm-list"><div class="cm-f">
     <label>${L("主题","Theme")} <select data-cmf="th">${opt("",L("全部","All"),CMX.th)}${ths.map(x=>opt(x.t.id,`${T(x.t)} (${x.n})`,CMX.th)).join("")}${opt("none",L(`没归进主题 (${none})`,`In no theme (${none})`),CMX.th)}</select></label>
     <label>${L("问题","Question")} <select data-cmf="q">${opt("",L("两个都看","Both"),CMX.q)}${opt("e",cmQ("e"),CMX.q)}${opt("w",cmQ("w"),CMX.q)}</select></label>
     <label>${L("来源","From")} <select data-cmf="src">${opt("",L("全部","All"),CMX.src)}${opt("real",L(`本浏览器的真实提交 (${real.length})`,`Real, from this browser (${real.length})`),CMX.src)}${opt("sim",L(`模拟 (${CM_SIM.length})`,`Simulated (${CM_SIM.length})`),CMX.src)}</select></label>
     <label>${L("搜索","Search")} <input type="search" data-cmf="find" value="${esc(CMX.find)}" placeholder="${L("遮阴","shade")}"></label>
     </div>
    <p class="small muted">${L(`共 ${shown.length} 条。这里不显示身份，免得从一句话认出个人。`,`${shown.length} comment(s). Roles are left out so one comment cannot identify a person.`)}</p>
    <ul class="cm-ul">${shown.slice(0,CMX.n).map(c=>`<li><p>“${cmHi(c[lg])}”</p><div class="cm-meta"><span class="tag ${c.real?"t-fact":"t-gap"}">${c.real?L("真实 · 本浏览器","Real · this browser"):L("模拟","Simulated")}</span><span class="small muted">${cmQ(c.q)}</span>${c.th.map(id=>{const t=cmTh().find(x=>x.id===id);return t?`<span class="cm-chip"><i style="background:${cmCol(id)}"></i>${T(t)}</span>`:"";}).join("")}${c.real&&!c.ai&&c.th.length?`<span class="small muted">${L("按关键词归类，AI 还没读","Matched by keyword, not yet read by AI")}</span>`:""}</div></li>`).join("")}</ul>
    ${shown.length>CMX.n?`<button class="btn cb-sm" data-cm="more">${L(`再看 30 条（还有 ${shown.length-CMX.n} 条）`,`Show 30 more (${shown.length-CMX.n} left)`)}</button>`:""}</div>`;
  const liveN=real.filter(c=>c.ai).length;
  return `<div class="sec-h"><h2 class="ch2">${L("文字意见 · AI 汇总","Written comments · AI summary")}</h2><span class="cm-hd"><span class="tag t-gap">${L(`${CM_SIM.length} 条模拟意见`,`${CM_SIM.length} simulated comments`)}</span><span class="tag t-infer">${L("AI 汇总 · 由规划师确认","AI summary · a planner confirms")}</span></span></div>
   <p class="small muted">${L(`AI（${CM_AI.model}，${CM_AI.at}）把意见归成主题，每个主题写一句概括，并建议对应的优先项和 D / P / A。条数都是本页自己数的，不是 AI 给的。AI 不做决定：规划师确认的主题才算数，驳回的不进倡导简报。`,`AI (${CM_AI.model}, ${CM_AI.at}) grouped the comments into themes, wrote one line for each, and suggested a priority and D / P / A. Every count is worked out on this page, not by the AI. The AI decides nothing: a theme counts once a planner confirms it, and a rejected theme stays out of the advocacy brief.`)}</p>
   <div class="cm-ms">${metric(L("文字意见","Written comments"),N,L(`模拟 ${CM_SIM.length} · 真实 ${real.length}`,`${CM_SIM.length} simulated · ${real.length} real`))}${metric(L("AI 归出的主题","Themes found by AI"),ths.length,L(`规划师已确认 ${okN} 个`,`${okN} confirmed by a planner`))}${metric(L("提到最多","Raised most"),L(`${top.n} / ${N} 条`,`${top.n} of ${N}`),T(top.t))}${metric(L("没归进主题","In no theme"),none,L("太短或和广场无关","Too short or off topic"))}</div>
   <div class="cm-two"><div><div class="small muted cm-lh">${L("AI 归出的主题，按提到的条数排","Themes found by AI, by number of comments")}</div><ol class="cm-ths">${ths.map(row).join("")}</ol></div>${detail}</div>
   <p class="small muted">${L("一条意见最多归进两个主题，所以各主题条数相加会超过总数。","A comment can sit in up to two themes, so the theme counts add up to more than the total.")}</p>
   <div class="cm-live"><div><b>${L("本浏览器里的真实意见","Real comments from this browser")}</b> <span class="small muted">${real.length?L(`${real.length} 条，其中 AI 已读 ${liveN} 条`,`${real.length}, of which AI has read ${liveN}`):L("还没有。居民在故事板第 4 章写的话会出现在这里。","None yet. What residents write in chapter 4 of the storyboard appears here.")}</span>
     <p class="small muted">${L("点右边的按钮，这些文字会发给外部 AI 服务做归类；不点就只在本浏览器里按关键词归类。模拟意见已经提前汇总好，不会再发送。","Pressing the button sends these comments to an external AI service to be grouped; otherwise they are matched by keyword in this browser only. The simulated comments were summarised in advance and are not sent again.")}</p>
     ${CMX.msg?`<p class="small ${CMX.err?"cm-err":"cm-ok"}" role="status">${esc(CMX.msg)}</p>`:""}</div>
    <div class="cm-btns"><button class="btn primary cb-sm" data-cm="run"${real.length&&!CMX.busy?"":" disabled"}>${CMX.busy?L("AI 正在读…","AI is reading…"):L("用 AI 归类真实意见","Group real comments with AI")}</button>
     <button class="btn cb-sm" data-cm="open" aria-expanded="${CMX.open}">${CMX.open?L("收起原话","Hide the comments"):L(`看全部 ${N} 条原话`,`Read all ${N} comments`)}</button></div></div>
   ${list}`;}
function cmDraw(keep){const el=document.getElementById("cb-cm");if(!el)return;const a=document.activeElement,f=a&&a.dataset&&a.dataset.cmf,pos=f==="find"?a.selectionStart:null;el.innerHTML=cmCard();
  if(f){const n=el.querySelector(`[data-cmf="${f}"]`);if(n){n.focus();if(pos!=null)n.setSelectionRange(pos,pos);}}
  if(keep==="list"){const l=document.getElementById("cm-list");if(l)l.scrollIntoView({behavior:"smooth",block:"start"});}}
async function cmRun(){const real=cbTexts().slice(-30);if(!real.length||CMX.busy)return;CMX.busy=true;CMX.msg="";cmDraw();
  try{const r=await fetch("/api/summarise",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({comments:real.map(x=>({id:x.k,text:x.txt})),themes:cmTh().map(t=>({id:t.id,en:t.en+": "+t.sum.en}))})});
    const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.code||String(r.status));
    store.set("cav_cm_ai",{assign:Object.assign({},cmLive().assign,j.assign),at:Date.now(),model:j.model});CMX.err=false;
    CMX.msg=L(`AI（${j.model}）读了 ${Object.keys(j.assign).length} 条真实意见，已归进上面的主题。`,`AI (${j.model}) read ${Object.keys(j.assign).length} real comment(s) and placed them in the themes above.`);
  }catch(e){CMX.err=true;CMX.msg=e.message==="NO_CONFIG"?L("这个站点还没配置 AI 密钥，真实意见仍按关键词归类。","No AI key is set for this site, so real comments are still matched by keyword."):L("AI 没有连上，真实意见仍按关键词归类。稍后再试。","Could not reach the AI, so real comments are still matched by keyword. Try again later.");}
  CMX.busy=false;cmDraw();}
document.addEventListener("click",e=>{const b=e.target.closest("[data-cm]");if(!b)return;const k=b.dataset.cm,v=b.dataset.val,rv=cmRv();
  if(k==="sel"){CMX.sel=v;CMX.edit="";}
  else if(k==="ok"||k==="rej"){const cur=(rv[v]||{}).st;rv[v]=Object.assign({},rv[v],{st:cur===k?"":k,t:Date.now()});store.set("cav_cm_rv",rv);}
  else if(k==="edit"){CMX.edit=v;}else if(k==="cancel"){CMX.edit="";}
  else if(k==="save"){const x=document.getElementById("cmTxt").value.trim();if(x){rv[v]=Object.assign({},rv[v]);rv[v].txt=Object.assign({},rv[v].txt,{[cmLg()]:x});store.set("cav_cm_rv",rv);}CMX.edit="";}
  else if(k==="show"){CMX.open=true;CMX.th=v;CMX.n=30;cmDraw("list");return;}
  else if(k==="open"){CMX.open=!CMX.open;CMX.n=30;if(CMX.open){cmDraw("list");return;}}
  else if(k==="more"){CMX.n+=30;}else if(k==="run"){cmRun();return;}
  cmDraw();});
document.addEventListener("input",e=>{const f=e.target.dataset&&e.target.dataset.cmf;if(!f)return;CMX[f]=e.target.value;CMX.n=30;cmDraw();});
