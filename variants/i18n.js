/* ===== variants/i18n.js: 13-language picker (same list and order as the City of Parramatta website) =====
   Text is still written as L(zh,en) and {zh,en}. This file decides what those return:
   - en and zh (Simplified) return the hand-written text, as before;
   - zh-Hant converts the Simplified text with an OpenCC cn→twp table (variants/i18n/zh-Hant.json);
   - every other language looks the English text up in variants/i18n/<code>.json (AI translations,
     flagged on screen as not yet reviewed by a native speaker). A missing entry falls back to English.
   Council quotes are never passed through L()/T(), so they always stay in their original English. */
const LANGS=[ // code, <html lang>, own name, English name, dir, Noto family loaded on demand
  ["en","en-AU","English (Australia)","English (Australia)","ltr",""],
  ["zh","zh-Hans","简体中文","Chinese (Simplified)","ltr",""],
  ["zh-Hant","zh-Hant","繁體中文","Chinese (Traditional)","ltr","Noto Sans TC"],
  ["ko","ko","한국어","Korean","ltr","Noto Sans KR"],
  ["hi","hi","हिन्दी","Hindi","ltr","Noto Sans Devanagari"],
  ["ar","ar","العربية","Arabic","rtl","Noto Sans Arabic"],
  ["ta","ta","தமிழ்","Tamil","ltr","Noto Sans Tamil"],
  ["gu","gu","ગુજરાતી","Gujarati","ltr","Noto Sans Gujarati"],
  ["ne","ne","नेपाली","Nepali","ltr","Noto Sans Devanagari"],
  ["tl","tl","Tagalog","Tagalog (Filipino)","ltr",""],
  ["te","te","తెలుగు","Telugu","ltr","Noto Sans Telugu"],
  ["fa","fa","فارسی","Persian","rtl","Noto Sans Arabic"],
  ["pa","pa","ਪੰਜਾਬੀ","Punjabi","ltr","Noto Sans Gurmukhi"]];
const I18N_DICT=/*__I18N__*/{};
const langInfo=c=>LANGS.find(l=>l[0]===c)||LANGS[0];
const isAiLang=c=>!["en","zh"].includes(c)&&c!=="zh-Hant";

/* English → target lookup. Keys with {0},{1}… are templates; runtime strings are matched against them. */
const I18N_TPL={}, I18N_CACHE={}, I18N_MISS=new Set();
function i18nTemplates(c){
  if(I18N_TPL[c]) return I18N_TPL[c];
  const d=I18N_DICT[c]||{}, rx=s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  return I18N_TPL[c]=Object.keys(d).filter(k=>/\{\d+\}/.test(k)).map(k=>{
    const parts=k.split(/\{(\d+)\}/), order=[];let re="^";
    parts.forEach((p,i)=>{if(i%2){order.push(+p);re+="([\\s\\S]*?)";}else re+=rx(p);});
    return {re:new RegExp(re+"$"),order,out:d[k],lit:parts.filter((_,i)=>i%2===0).join("").length};
  }).sort((a,b)=>b.lit-a.lit);
}
function i18nTr(c,en){
  const d=I18N_DICT[c]; if(!d||!en) return en;
  if(typeof d[en]==="string") return d[en];
  const cache=I18N_CACHE[c]||(I18N_CACHE[c]=new Map()); if(cache.has(en)) return cache.get(en);
  let res=null;
  for(const t of i18nTemplates(c)){const m=t.re.exec(en);if(m){const v={};t.order.forEach((n,i)=>v[n]=m[i+1]);res=t.out.replace(/\{(\d+)\}/g,(_,n)=>v[n]??"");break;}}
  if(res===null){res=en;if(/[A-Za-z]{3}/.test(en.replace(/<[^>]+>/g,"")))I18N_MISS.add(en);}
  cache.set(en,res); return res;
}
const HANT_RUN=/[　-〿㐀-䶿一-鿿＀-￯]+/g;
function toHant(s){const h=I18N_DICT["zh-Hant"];if(!h||!s)return s;
  return String(s).replace(HANT_RUN,r=>{const v=h.runs[r];return v===1?r:v||Array.from(r,ch=>h.chars[ch]||ch).join("");});}
function I18N_L(zh,en){
  const c=S.lang;
  if(c==="zh") return zh;
  if(c==="zh-Hant") return toHant(zh);
  if(c==="en") return en;
  return i18nTr(c,en);
}

/* fonts: only the script that is chosen; system fonts until (or unless) it arrives */
function loadFont(fam){
  if(!fam||document.getElementById("font-"+fam.replace(/ /g,""))) return;
  const l=document.createElement("link");l.rel="stylesheet";l.id="font-"+fam.replace(/ /g,"");
  l.href="https://fonts.googleapis.com/css2?family="+fam.replace(/ /g,"+")+":wght@400;500;700&display=swap";
  document.head.appendChild(l);
}
function applyLang(){
  const [c,tag,,,dir,fam]=langInfo(S.lang), r=document.documentElement;
  r.lang=tag; r.dir=dir; r.dataset.lang=c;
  loadFont(fam);
  if(fam){r.style.setProperty("--f-body",`"${fam}","Noto Sans SC",system-ui,-apple-system,sans-serif`);r.style.setProperty("--f-display",`"Space Grotesk","${fam}","Noto Sans SC",system-ui,sans-serif`);}
  else{r.style.removeProperty("--f-body");r.style.removeProperty("--f-display");}
  let b=document.getElementById("aiBanner");
  if(isAiLang(c)){
    if(!b){b=document.createElement("div");b.id="aiBanner";b.className="aiban";b.setAttribute("role","note");
      const top=document.querySelector("header");if(top)top.after(b);else document.body.prepend(b);}
    const msg="AI translation, not yet reviewed by a native speaker.", sub="English shown where a translation is missing. Council quotes stay in their original English.";
    const tm=i18nTr(c,msg);
    b.innerHTML=`<div class="wrap"><span class="aiban-tag">AI</span><span><b>${esc(tm)}</b> <span class="aiban-sub">${esc(i18nTr(c,sub))}</span>${tm!==msg?`<br><span class="aiban-en" lang="en" dir="ltr">${msg}</span>`:""}</span></div>`;
  } else if(c==="zh-Hant"){ // rule-based script conversion, also not yet checked by a person
    if(!b){b=document.createElement("div");b.id="aiBanner";b.className="aiban";b.setAttribute("role","note");
      const top=document.querySelector("header");if(top)top.after(b);else document.body.prepend(b);}
    b.innerHTML=`<div class="wrap"><span class="aiban-tag">自動</span><span><b>繁體中文由簡體中文自動轉換（OpenCC），尚未經母語者審核。</b><br><span class="aiban-en" lang="en" dir="ltr">Converted automatically from Simplified Chinese; not yet reviewed by a native speaker.</span></span></div>`;
  } else if(b) b.remove();
}

/* the picker: a globe button that opens a listbox. Keyboard: ↑ ↓ Home End move, Enter/Space choose, Esc/Tab close */
const GLOBE=`<svg class="globe" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9.2"/><path d="M2.8 12h18.4M12 2.8c2.6 2.6 3.8 5.6 3.8 9.2s-1.2 6.6-3.8 9.2c-2.6-2.6-3.8-5.6-3.8-9.2S9.4 5.4 12 2.8z"/></svg>`;
function langPicker(){
  const cur=langInfo(S.lang);
  return `<div class="lpick" id="lpick"><button type="button" id="langBtn" class="lbtn" aria-haspopup="listbox" aria-expanded="false" aria-controls="langList" aria-label="${esc(L("语言","Language"))}: ${esc(cur[2])}">${GLOBE}<span class="lcur">${esc(cur[2])}</span><span class="caret" aria-hidden="true">▾</span></button>
  <ul class="llist" id="langList" role="listbox" aria-label="${esc(L("语言","Language"))}" hidden>${LANGS.map(l=>`<li role="option" id="lo-${l[0]}" data-lang="${l[0]}" tabindex="-1" aria-selected="${l[0]===S.lang}" lang="${l[1]}" dir="${l[4]}"><b>${l[2]}</b>${l[2]!==l[3]?`<small lang="en">${l[3]}</small>`:""}</li>`).join("")}</ul></div>`;
}
function langOpen(open,focusSel){
  const btn=document.getElementById("langBtn"), list=document.getElementById("langList"); if(!btn||!list) return;
  list.hidden=!open; btn.setAttribute("aria-expanded",open);
  if(open){
    // keep the list on screen (narrow phones, and right-to-left where it opens the other way)
    list.style.transform="";const r=list.getBoundingClientRect(),W=document.documentElement.clientWidth;let dx=0;
    if(r.right>W-8)dx=W-8-r.right; if(r.left+dx<8)dx=8-r.left; if(dx)list.style.transform=`translateX(${dx}px)`;
    const sel=list.querySelector('[aria-selected="true"]')||list.firstElementChild;(focusSel===false?list.firstElementChild:sel).focus();}
}
function setLang(c){
  if(!LANGS.some(l=>l[0]===c)) return;
  S.lang=c; store.set("cav_lang",c); applyLang();
  document.dispatchEvent(new Event("cav:lang"));
  const btn=document.getElementById("langBtn"); if(btn) btn.focus();
}
document.addEventListener("click",e=>{
  const opt=e.target.closest("#langList [data-lang]"); if(opt){langOpen(false);setLang(opt.dataset.lang);return;}
  if(e.target.closest("#langBtn")){const l=document.getElementById("langList");langOpen(l.hidden);return;}
  if(!e.target.closest("#lpick")) langOpen(false);
});
document.addEventListener("keydown",e=>{
  if(e.target.id==="langBtn"&&(e.key==="ArrowDown"||e.key==="ArrowUp")){e.preventDefault();langOpen(true);return;}
  const li=e.target.closest&&e.target.closest("#langList [data-lang]"); if(!li) return;
  const all=[...document.querySelectorAll("#langList [data-lang]")], i=all.indexOf(li);
  const go=j=>{e.preventDefault();all[(j+all.length)%all.length].focus();};
  if(e.key==="ArrowDown") go(i+1); else if(e.key==="ArrowUp") go(i-1);
  else if(e.key==="Home") go(0); else if(e.key==="End") go(all.length-1);
  else if(e.key==="Enter"||e.key===" "){e.preventDefault();langOpen(false);setLang(li.dataset.lang);}
  else if(e.key==="Escape"){e.preventDefault();e.stopPropagation();langOpen(false);document.getElementById("langBtn").focus();}
  else if(e.key==="Tab") langOpen(false);
  else if(e.key.length===1){const k=e.key.toLowerCase(), n=all.findIndex((x,j)=>j>i&&(x.querySelector("small")||x).textContent.toLowerCase().startsWith(k));if(n>=0)go(n);}
},true);
