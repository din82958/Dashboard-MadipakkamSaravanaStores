/* Madipakkam Saravana Stores - dashboard shell, shared by every page */
(function(){
const D=window.D, dates=D.dates, di={}; dates.forEach((d,i)=>di[d]=i);
const MS=86400000, LAST=dates[dates.length-1], FIRST=dates[0];
const ymd=t=>new Date(t).toISOString().slice(0,10), tms=s=>Date.parse(s+'T00:00:00Z');
const inr=n=>Math.round(n).toLocaleString('en-IN');
const rs=n=>{const a=Math.abs(n),s=n<0?'-':'';return s+'₹'+(a>=1e7?(a/1e7).toFixed(2)+' Cr':a>=1e5?(a/1e5).toFixed(2)+' L':inr(a))};
const rsf=n=>(n<0?'-':'')+'₹'+inr(Math.abs(n));
const pc=(a,b)=>b?((a-b)/b*100):null;
const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const WD=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const wdIdx=s=>(new Date(tms(s)).getUTCDay()+6)%7;
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// item field indexes
const F={code:0,name:1,pos:2,cat:3,mat:4,brand:5,mrp:6,tax:7,created:8,net:9,posq:10,negq:11,btype:12,instock:13,src:14,grp:15};
// ---------- icons ----------
const ICON={
 home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 trend:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 bill:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
 box:'<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
 layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
 stock:'<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10h14V9M10 13h4"/>',
 alert:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
 db:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
 filter:'<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
 coin:'<circle cx="12" cy="12" r="9"/><path d="M14.500 9a3 3 0 0 0-5 1.500c0 3 5 1.500 5 4.500a3 3 0 0 1-5 1.500M12 6.500v1.500M12 16v1.500"/>',
 forecast:'<path d="M3 17l5-5 4 4 5-6"/><path d="M17 10h4v4" stroke-dasharray="2 2"/><path d="M3 21h18"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6M17 5a3 3 0 0 1 0 6M22 20c0-2.5-2-4.5-5-5"/>',
 bank:'<path d="M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/>',
 eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 out:'<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 chev:'<path d="M6 9l6 6 6-6"/>',
 prev:'<path d="M15 6l-6 6 6 6"/>',
 next:'<path d="M9 6l6 6-6 6"/>',
 check:'<path d="M5 12l5 5 9-10"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
 menu:'<path d="M4 7h16M4 12h16M4 17h16"/>'
};
const ico=(k,cls)=>`<svg viewBox="0 0 24 24" ${cls?'class="'+cls+'"':''}>${ICON[k]}</svg>`;
// category glyphs (match the 9 website categories + extras)
const CATICO=[
 '<path d="M5 10h14v7a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/><path d="M3 10h18M9 6c0-2 3-2 3-4M15 6c0-2 3-2 3-4"/>',
 '<rect x="4" y="7" width="16" height="13" rx="2"/><path d="M3 7h18M9 3h6l1 4H8z"/>',
 '<path d="M6 21l9-9"/><path d="M14 4l6 6-3 3-6-6z"/><path d="M4 4l5 5"/>',
 '<path d="M12 3c2 3 3 4 3 6a3 3 0 0 1-6 0c0-2 1-3 3-6z"/><path d="M5 14h14l-2 6H7z"/>',
 '<path d="M9 3h6v3H9z"/><path d="M8 6h8l1 4v10a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V10z"/><path d="M7 13h10"/>',
 '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/>',
 '<path d="M7 3h10v8H7z"/><path d="M5 11h14v3H5zM7 14v7M17 14v7"/>',
 '<path d="M12 3c3 4 5 6.5 5 9.5a5 5 0 0 1-10 0C7 9.500 9 7 12 3z"/><path d="M10 14a2 2 0 0 0 2 2"/>',
 '<path d="M4 7h16l-2 13H6z"/><path d="M3 7c0-3 18-3 18 0"/>',
 '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
 '<circle cx="12" cy="12" r="9"/><path d="M9.500 9a2.500 2.500 0 1 1 3.500 2.300c-.7.4-1 1-1 1.700M12 17v.5"/>'
];
const catIcon=(i,sz)=>`<svg viewBox="0 0 24 24" style="width:${sz||20}px;height:${sz||20}px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;flex:none">${CATICO[i]}</svg>`;
const catChip=(i)=>`<span class="cc" style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap">${catIcon(i,17)}<span>${esc(D.cats[i])}</span></span>`;
const slug=b=>b.toLowerCase().replace(/[^a-z0-9]+/g,'-');
const brandChip=(bi)=>{if(!bi)return '<span class="mute">—</span>';const b=D.brands[bi];return `<span class="bchip"><img src="assets/brands/${slug(b)}.png" alt="" onerror="this.remove()"><i>${esc(b[0])}</i>${esc(b)}</span>`};
const prodImg=(it,sz)=>{const c=catIcon(it[F.cat],Math.round(sz*.5));return `<span class="pimg" style="width:${sz}px;height:${sz}px"><img src="../MadipakkamSaravanaStores-Website/images/products/${it[F.code]}.jpg" alt="" onerror="this.remove()">${c}</span>`};

// ---------- state ----------
const S={mode:'month',a:null,cmp:'prev',b:null,show:'sales',preset:''};
function monthRange(m){const [y,mo]=m.split('-').map(Number);return {s:m+'-01',e:ymd(Date.UTC(y,mo,0))}}
function addMonths(m,n){const [y,mo]=m.split('-').map(Number);return new Date(Date.UTC(y,mo-1+n,1)).toISOString().slice(0,7)}
function shiftYear(s,n){const d=new Date(tms(s));d.setUTCFullYear(d.getUTCFullYear()+n);return ymd(d)}
function lastFull(){const d=new Date(tms(LAST));const eom=ymd(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0));return LAST===eom?LAST.slice(0,7):ymd(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),0)).slice(0,7)}
S.a=monthRange(lastFull());
function loadState(){
 const q=new URLSearchParams(location.search);let st=null;
 if(q.get('s')){st={mode:q.get('m')||'range',a:{s:q.get('s'),e:q.get('e')||q.get('s')},cmp:q.get('c')||'prev',b:q.get('bs')?{s:q.get('bs'),e:q.get('be')||q.get('bs')}:null,show:q.get('v')||'sales',preset:q.get('p')||''}}
 else{try{st=JSON.parse(localStorage.getItem('sss-state')||'null')}catch(e){}}
 if(st&&st.a&&st.a.s>=FIRST.slice(0,7)+'-01'&&st.a.e<='9999')Object.assign(S,st);
}
function saveState(){
 try{localStorage.setItem('sss-state',JSON.stringify(S))}catch(e){}
 const q=new URLSearchParams({m:S.mode,s:S.a.s,e:S.a.e,c:S.cmp,v:S.show,p:S.preset||''});if(S.b){q.set('bs',S.b.s);q.set('be',S.b.e)}
 try{history.replaceState(null,'','?'+q)}catch(e){}
 document.querySelectorAll('.sb nav a,.btm a').forEach(a=>{a.href=a.dataset.p+'?'+q})
}
function periodForCustom(){const a=S.a,len=(tms(a.e)-tms(a.s))/MS+1;return S.mode==='month'?monthRange(addMonths(a.s.slice(0,7),-1)):{s:ymd(tms(a.s)-len*MS),e:ymd(tms(a.s)-MS)}}
function periodB(){
 if(S.cmp==='none')return null;
 if(S.cmp==='custom')return S.b||periodForCustom();
 const a=S.a,len=(tms(a.e)-tms(a.s))/MS+1;
 if(S.cmp==='prev'){if(S.mode==='month')return monthRange(addMonths(a.s.slice(0,7),-1));return {s:ymd(tms(a.s)-len*MS),e:ymd(tms(a.s)-MS)}}
 if(S.mode==='month')return monthRange(addMonths(a.s.slice(0,7),-12));
 if(S.mode==='day'){const s=ymd(tms(a.s)-364*MS);return {s,e:s}}
 return {s:shiftYear(a.s,-1),e:shiftYear(a.e,-1)};
}
function label(p){if(!p)return '—';if(p.s===p.e)return p.s;if(p.s.slice(8)==='01'&&p.e===ymd(Date.UTC(+p.s.slice(0,4),+p.s.slice(5,7),0)))return p.s.slice(0,7);return p.s+' → '+p.e}
// ---------- item rows index ----------
let _byItem=null;
function itemRows(k){if(!_byItem){_byItem={};D.itemday.forEach(r=>{(_byItem[r[1]]||(_byItem[r[1]]=[])).push(r)})}return _byItem[k]||[]}
// day -> offset into itemday
const off=new Array(dates.length+1).fill(0);{const c=new Array(dates.length).fill(0);D.itemday.forEach(r=>c[r[0]]++);for(let i=0;i<dates.length;i++)off[i+1]=off[i]+c[i]}
// ---------- margin assumption (owner estimate: 30-40%) ----------
const MG={def:35,cat:{}};try{Object.assign(MG,JSON.parse(localStorage.getItem('sss-margin')||'{}'))}catch(e){}
const mg=c=>((MG.cat[c]!=null?MG.cat[c]:MG.def)/100);
function setMargin(def,cat){MG.def=def;if(cat)MG.cat=cat;try{localStorage.setItem('sss-margin',JSON.stringify(MG))}catch(e){}for(const k in _cache)delete _cache[k]}
const exTax=(it,amt)=>amt/(1+(it[F.tax]||0)/100);
// ---------- aggregation ----------
const _cache={};
function agg(p){
 if(!p)return null;const key=p.s+'|'+p.e;if(_cache[key])return _cache[key];
 const n=(tms(p.e)-tms(p.s))/MS+1;
 const o={p,n,days:[],bills:0,sales:0,units:0,disc:0,discBills:0,voids:0,voidLines:0,voidVal:0,ret:0,retAmt:0,dms:0,trading:0,
  hr:Array.from({length:24},()=>[0,0]),wd:Array.from({length:7},()=>[0,0,0]),heat:Array.from({length:7},()=>Array(24).fill(0)),heatB:Array.from({length:7},()=>Array(24).fill(0)),
  ex:0,profit:0,grp:{},site:{},tax:{},items:{},bands:Array(14).fill(0),ipb:Array(7).fill(0),dom:Array.from({length:31},()=>[0,0,0]),cat:{},brand:{},mat:{},s3b:0,s3s:0};
 for(let k=0;k<n;k++){
  const ds=ymd(tms(p.s)+k*MS), i=di[ds], w=wdIdx(ds);
  if(i===undefined){o.days.push({d:ds,s:0,b:0,u:0,w,i:-1});continue}
  const x=D.daily[i]; o.days.push({d:ds,s:x[1],b:x[0],u:x[2],w,i}); o.trading++;
  o.bills+=x[0];o.sales+=x[1];o.units+=x[2];o.disc+=x[3];o.s3b+=x[4];o.s3s+=x[5];o.discBills+=x[6];
  o.voids+=D.void.n[i];o.voidLines+=D.void.l[i];o.voidVal+=D.void.v[i];o.ret+=D.ret[i][0];o.retAmt+=D.ret[i][1];o.dms+=D.dms[i];
  o.wd[w][0]+=x[1];o.wd[w][1]+=x[0];o.wd[w][2]++;
  const dm=+ds.slice(8)-1;o.dom[dm][0]+=x[1];o.dom[dm][1]+=x[0];o.dom[dm][2]++;
  for(const h in D.hourly[i]){const v=D.hourly[i][h];o.hr[h][0]+=v[1];o.hr[h][1]+=v[0];o.heat[w][h]+=v[1];o.heatB[w][h]+=v[0]}
  for(const t in D.tax[i])o.tax[t]=(o.tax[t]||0)+D.tax[i][t];
  for(let j=0;j<14;j++)o.bands[j]+=D.bands[i][j];for(let j=0;j<7;j++)o.ipb[j]+=D.ipb[i][j];
  for(let j=off[i];j<off[i+1];j++){const r=D.itemday[j];const it=o.items[r[1]]||(o.items[r[1]]=[0,0]);it[0]+=r[2];it[1]+=r[3]}
 }
 for(const id in o.items){const it=D.items[id],v=o.items[id];
  const ex=exTax(it,v[1]);o.ex+=ex;o.profit+=ex*mg(it[F.cat]);const c=o.cat[it[F.cat]]||(o.cat[it[F.cat]]=[0,0,0,0]);c[0]+=v[1];c[1]+=v[0];c[2]++;c[3]+=ex;const gi=it[F.grp],gg=o.grp[gi]||(o.grp[gi]=[0,0,0]);gg[0]+=v[1];gg[1]+=v[0];gg[2]++;const sc=D.groups[gi][1],ss=o.site[sc]||(o.site[sc]=[0,0,0,0]);ss[0]+=v[1];ss[1]+=v[0];ss[2]++;ss[3]+=ex;
  if(it[F.brand]){const b=o.brand[it[F.brand]]||(o.brand[it[F.brand]]=[0,0,0]);b[0]+=v[1];b[1]+=v[0];b[2]++}
  const m=o.mat[it[F.mat]]||(o.mat[it[F.mat]]=[0,0,0]);m[0]+=v[1];m[1]+=v[0];m[2]++}
 _cache[key]=o;return o;
}
// ---------- UI helpers ----------
function pill(a,b,neutral,lowerBetter){if(b==null||b===0||a==null)return '';const p=(a-b)/b*100;const good=lowerBetter?p<=0:p>=0;const c=neutral?'nu':good?'up':'dn';return `<span class="pill ${c}">${p>=0?'▲':'▼'} ${Math.abs(p).toFixed(1)}%</span>`}
function countUp(el,to,fm,dur){dur=dur||900;if(reduce||!isFinite(to)){el.textContent=fm(to);return}const t0=performance.now();const f=t=>{const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,4);el.textContent=fm(to*e);if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)}
function spark(vals){const n=vals.length;if(n<2)return '';const mx=Math.max(...vals),mn=Math.min(...vals),r=mx-mn||1;const pts=vals.map((v,i)=>[i/(n-1)*100,26-(v-mn)/r*24]);const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join('');return `<svg class="sp" viewBox="0 0 100 28" preserveAspectRatio="none"><path class="ar" d="${d}L100 28L0 28Z"/><path pathLength="1" d="${d}"/></svg>`}
// kpis: defs=[{l,v,f,sp?,neutral?,lower?,cls?,sub?}]
function kpis(el,defs,A,B){
 el.style.setProperty('--cols',defs.length<=6?defs.length:Math.ceil(defs.length/2));
 el.innerHTML=defs.map((d,i)=>{const a=d.v(A),b=B&&d.cmp!==false?d.v(B):null;
  return `<div class="k rv ${d.cls||''}" style="transition-delay:${i*50}ms"><div class="l">${d.l}</div><div class="v" data-i="${i}">${d.f(a)}</div><div class="c">${B&&d.cmp!==false?pill(a,b,d.neutral,d.lower)+'<span>B '+d.f(b)+'</span>':(d.sub||'&nbsp;')}</div>${d.sp&&A.n>1?spark(d.sp(A)):''}</div>`}).join('');
 el.querySelectorAll('.v').forEach(v=>{const d=defs[+v.dataset.i];countUp(v,d.v(A),d.f)});reveal();
}
// charts
const charts={};
function themeChart(){const t=Chart.defaults.plugins.tooltip;t.backgroundColor='#3c4043';t.titleColor='#fff';t.bodyColor='#e8eaed';t.cornerRadius=8;t.padding=11;t.boxPadding=5;t.borderWidth=0;Chart.defaults.color=css('--mute');Chart.defaults.font.family='Inter,Roboto,"Segoe UI",system-ui,sans-serif';Chart.defaults.font.size=innerWidth<700?11:12}
function grad(hi,lo){return ctx=>{const ca=ctx.chart.chartArea;if(!ca)return css(hi);const g=ctx.chart.ctx.createLinearGradient(0,ca.top,0,ca.bottom);g.addColorStop(0,css(hi));g.addColorStop(1,css(lo));return g}}
const colA=()=>css('--a'), colB=()=>css('--b');
const catColor=i=>css('--c'+(i<8?i+1:9));
function chart(id,cfg){if(charts[id])charts[id].destroy();const el=document.getElementById(id);if(!el)return;cfg.options=Object.assign({responsive:true,maintainAspectRatio:false,animation:reduce?false:{duration:900,easing:'easeOutQuart'}},cfg.options||{});cfg.options.plugins=Object.assign({legend:{display:false}},cfg.options.plugins||{});charts[id]=new Chart(el,cfg);return charts[id]}
function trunc(v){const l=String(this.getLabelForValue(v));const n=Math.max(10,Math.floor((this.chart.width||400)*0.30/6.4));return l.length>n?l.slice(0,n-1)+'…':l}
function axes(o){o=o||{};const g=css('--line'),t=css('--mute');const yf=o.yfmt||(v=>rs(v));
 const mob=innerWidth<700;const x=Object.assign({grid:{display:false},border:{display:false},ticks:{color:t,maxRotation:0,autoSkip:true,maxTicksLimit:mob?5:10}},o.x||{});const y=Object.assign({grid:{color:g},border:{display:false},ticks:{color:t,callback:yf,maxTicksLimit:mob?5:8},beginAtZero:true},o.y||{});
 if(o.horizontal){return {x:Object.assign({grid:{color:g},border:{display:false},ticks:{color:t,callback:yf,maxTicksLimit:4,maxRotation:0},beginAtZero:true},o.x||{}),y:Object.assign({grid:{display:false},border:{display:false},ticks:{color:css('--ink2'),callback:trunc}},o.y||{})}}
 return {x,y}}
const showFmt=v=>S.show==='sales'?rs(v):inr(v);
const tip=(fmt)=>({callbacks:{label:c=>' '+(c.dataset.label?c.dataset.label+': ':'')+(fmt||showFmt)(c.parsed.y!==undefined&&c.parsed.y!==null&&c.chart.options.indexAxis!=='y'?c.parsed.y:c.parsed.x)}});
// table
const _ts={};
function table(id,cfg){
 const el=document.getElementById(id);if(!el)return;if(el.parentElement&&!/(scroll|tw)/.test(el.parentElement.className)){const w=document.createElement('div');w.className='tw';el.parentElement.insertBefore(w,el);w.appendChild(el)}const st=_ts[id]||(_ts[id]={k:cfg.sort,d:cfg.dir||-1});if(cfg.sort&&!_ts[id].set){st.k=cfg.sort;st.d=cfg.dir||-1;st.set=1}
 const cols=cfg.cols;let rows=cfg.rows.slice();const col=cols.find(c=>c.k===st.k)||cols[0];
 const gv=r=>col.s?col.s(r):r[col.k];rows.sort((a,b)=>{const x=gv(a),y=gv(b);return (typeof x==='string'?x.localeCompare(y):(x-y))*st.d});
 const total=rows.length;if(cfg.limit)rows=rows.slice(0,cfg.limit);
 const mx={};cols.filter(c=>c.bar).forEach(c=>mx[c.k]=Math.max(...rows.map(r=>Math.abs(c.s?c.s(r):r[c.k]||0)),1));
 el.innerHTML='<thead><tr>'+cols.map(c=>`<th data-k="${c.k}" class="${c.cls?c.cls.replace('mute','').trim()+' ':''}${c.k===st.k?'sorted '+(st.d>0?'asc':''):''}" ${c.w?'style="width:'+c.w+'"':''}>${c.t}</th>`).join('')+'</tr></thead><tbody>'+rows.map((r,i)=>`<tr class="${cfg.onRow?'click':''}" data-i="${i}">`+cols.map(c=>{const raw=c.s?c.s(r):r[c.k];const txt=c.f?c.f(raw,r):esc(raw??'');return `<td class="${c.cls||''} ${c.bar?'bar':''}">${c.bar?`<i style="width:${Math.abs(raw)/mx[c.k]*100}%"></i><span>${txt}</span>`:txt}</td>`}).join('')+'</tr>').join('')+'</tbody>'+(cfg.foot?`<tfoot><tr><td colspan="${cols.length}" class="sub mute" style="text-align:left;padding-top:8px">Showing ${rows.length} of ${inr(total)}${cfg.foot===true?'':' · '+cfg.foot}</td></tr></tfoot>`:'');
 el.querySelectorAll('th').forEach(th=>th.onclick=()=>{const k=th.dataset.k;if(st.k===k)st.d*=-1;else{st.k=k;st.d=cols.find(c=>c.k===k).str?1:-1}table(id,cfg)});
 if(cfg.onRow)el.querySelectorAll('tbody tr').forEach(tr=>tr.onclick=()=>cfg.onRow(rows[+tr.dataset.i]));
}
// reveal
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.05});
function reveal(){document.querySelectorAll('.rv:not(.in)').forEach((el,i)=>{if(!el.style.transitionDelay)el.style.transitionDelay=Math.min(i%5*60,240)+'ms';io.observe(el)})}
// heat colour
function mix(t){const p=s=>{s=s.replace('#','');return [0,2,4].map(i=>parseInt(s.substr(i,2),16))},a=p(css('--heat0')),b=p(css('--heat1'));return 'rgb('+a.map((v,i)=>Math.round(v+(b[i]-v)*t)).join(',')+')'}
// ---------- item drawer ----------
function drawerInit(){
 if(document.getElementById('drawer'))return;
 document.body.insertAdjacentHTML('beforeend','<div class="veil" id="veil"></div><aside class="drawer" id="drawer"><button class="ibtn x" id="dx" aria-label="Close">✕</button><div id="dbody"></div></aside>');
 const close=()=>{document.getElementById('drawer').classList.remove('open');document.getElementById('veil').classList.remove('open')};
 document.getElementById('dx').onclick=close;document.getElementById('veil').onclick=close;document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
}
function openItem(k){
 drawerInit();const it=D.items[k];const rows=itemRows(k);
 const tq=rows.reduce((s,r)=>s+r[2],0),ta=rows.reduce((s,r)=>s+r[3],0);
 const bym={};rows.forEach(r=>{const m=dates[r[0]].slice(0,7);bym[m]=(bym[m]||0)+r[3]});
 const months=[];let c=FIRST.slice(0,7);while(c<=LAST.slice(0,7)){months.push(c);c=addMonths(c,1)}
 const first=rows.length?dates[rows[0][0]]:'—',last=rows.length?dates[rows[rows.length-1][0]]:'—';
 const rank=Object.entries(agg({s:FIRST,e:LAST}).items).sort((a,b)=>b[1][1]-a[1][1]).findIndex(x=>+x[0]===k)+1;
 const days180=rows.filter(r=>tms(dates[r[0]])>=tms(D.meta.stockAsof)-180*MS&&dates[r[0]]<=D.meta.stockAsof).reduce((s,r)=>s+r[2],0);
 document.getElementById('dbody').innerHTML=`<div style="display:flex;gap:14px;align-items:center;margin-bottom:6px">${prodImg(it,72)}<div><h3>${esc(it[F.name])}</h3><div class="mute" style="font-size:13px">POS name: ${esc(it[F.pos])} · Item code ${esc(it[F.code])}</div></div></div>
 <div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 14px">${catChip(it[F.cat])} ${brandChip(it[F.brand])} <span class="tag">${esc(D.matNames[it[F.mat]])}</span> <span class="tag">GST ${it[F.tax]||0}%</span> ${it[F.src]?'<span class="tag" title="Category inferred from the item name; not on the website feed">inferred category</span>':'<span class="tag">website category</span>'}</div>
 <div class="kpis" style="grid-template-columns:repeat(2,1fr)">
  <div class="k"><div class="l">Units sold</div><div class="v">${inr(tq)}</div><div class="c">${rank?'Rank #'+inr(rank)+' by sales':'No sales'}</div></div>
  <div class="k"><div class="l">Sales</div><div class="v">${rs(ta)}</div><div class="c">Avg price ${tq?rsf(ta/tq):'—'}</div></div>
  <div class="k ${it[F.net]<0?'neg':''}"><div class="l">Stock now</div><div class="v ${it[F.net]<0?'neg':''}">${inr(it[F.net])}</div><div class="c">${it[F.negq]?'Negative batches '+inr(it[F.negq]):'as of '+D.meta.stockAsof}</div></div>
  <div class="k"><div class="l">MRP</div><div class="v">${rsf(it[F.mrp])}</div><div class="c">Sold last 180d to stock date: ${inr(days180)}</div></div></div>
 <div class="mute" style="font-size:12.5px;margin-bottom:6px">First sale ${first} · last sale ${last} · ${rows.length} selling days</div>
 <div class="pl s"><canvas id="cItem"></canvas></div>`;
 document.getElementById('drawer').classList.add('open');document.getElementById('veil').classList.add('open');
 chart('cItem',{type:'bar',data:{labels:months,datasets:[{label:'Sales',data:months.map(m=>bym[m]||0),backgroundColor:colA(),borderRadius:4,borderSkipped:false}]},options:{scales:axes(),plugins:{tooltip:tip(rs)}}});
}

// ---------- custom dropdown + calendar popovers ----------
const MONF=['January','February','March','April','May','June','July','August','September','October','November','December'];
let _pop=null;
function closePop(){if(_pop){if(_pop._scrim)_pop._scrim.remove();_pop.remove();_pop=null}}
document.addEventListener('mousedown',e=>{if(_pop&&!_pop.contains(e.target)&&!(_pop._anchor&&_pop._anchor.contains(e.target)))closePop()},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closePop()});
window.addEventListener('scroll',e=>{if(_pop&&innerWidth>=700&&!_pop.contains(e.target))closePop()},true);
function popAt(anchor,el,minW){
 closePop();document.body.appendChild(el);_pop=el;el._anchor=anchor;
 if(el.classList.contains('cal-pop')&&innerWidth<700){el.classList.add('sheet');const v=document.createElement('div');v.className='veil open';v.style.zIndex=90;v.onclick=closePop;document.body.insertBefore(v,el);el._scrim=v;return}
 el.style.position='fixed';const r=anchor.getBoundingClientRect();el.style.minWidth=Math.max(r.width,minW||0)+'px';
 let left=r.left,top=r.bottom+6;const w=el.offsetWidth,h=el.offsetHeight;
 if(left+w>innerWidth-8)left=Math.max(8,innerWidth-w-8);
 if(top+h>innerHeight-8&&r.top>h+14)top=r.top-h-6;
 el.style.left=left+'px';el.style.top=top+'px';
}
const _sels=[];
function syncSelects(){_sels.forEach(s=>{if(s._sync)s._sync()})}
function enhanceSelects(root){
 root.querySelectorAll('select:not([data-e])').forEach(sel=>{
  sel.dataset.e=1;sel.style.display='none';
  const wrap=document.createElement('span');wrap.className='dd';
  const b=document.createElement('button');b.type='button';b.className='dd-b';b.setAttribute('aria-haspopup','listbox');
  sel.parentNode.insertBefore(wrap,sel);wrap.appendChild(b);wrap.appendChild(sel);
  const sync=()=>{const o=sel.options[sel.selectedIndex];b.innerHTML=`<span>${esc(o?o.text:'')}</span>${ico('chev')}`};
  sel._sync=sync;sync();_sels.push(sel);
  b.onclick=e=>{e.stopPropagation();if(_pop&&_pop._anchor===b){closePop();return}
   const list=document.createElement('div');list.className='dd-pop';list.setAttribute('role','listbox');
   [...sel.options].forEach((o,i)=>{const it=document.createElement('div');it.className='dd-i'+(i===sel.selectedIndex?' on':'');it.setAttribute('role','option');it.innerHTML=`<span>${esc(o.text)}</span>${i===sel.selectedIndex?ico('check'):''}`;
    it.onclick=()=>{sel.selectedIndex=i;sync();closePop();sel.dispatchEvent(new Event('input',{bubbles:true}));sel.dispatchEvent(new Event('change',{bubbles:true}))};list.appendChild(it)});
   popAt(b,list,190);const on=list.querySelector('.on');if(on)on.scrollIntoView({block:'nearest'})};
 });
}
const pad2=n=>String(n).padStart(2,'0');
function picker(host,o){
 const b=document.createElement('button');b.type='button';b.className='dp-b';
 const fmt=v=>{if(o.type==='month')return MON[+v.slice(5,7)-1]+' '+v.slice(0,4);const d=new Date(tms(v));return d.getUTCDate()+' '+MON[d.getUTCMonth()]+' '+d.getUTCFullYear()};
 b.innerHTML=`${ico('cal')}<span>${fmt(o.value)}</span>`;host.appendChild(b);
 b.onclick=e=>{e.stopPropagation();if(_pop&&_pop._anchor===b){closePop();return}openCal(b,o)};
}
function openCal(anchor,o){
 const el=document.createElement('div');el.className='cal-pop';
 let y=+o.value.slice(0,4),mo=+o.value.slice(5,7)-1,view=o.type==='month'?'months':'days';
 const minY=+o.min.slice(0,4),maxY=+o.max.slice(0,4),todayS=new Date().toISOString().slice(0,10);
 const minM=o.min.slice(0,7),maxM=o.max.slice(0,7);
 const commit=v=>{closePop();o.onChange(v)};
 const draw=()=>{let h='';
  if(view==='days'){
   const lead=(new Date(Date.UTC(y,mo,1)).getUTCDay()+6)%7,dim=new Date(Date.UTC(y,mo+1,0)).getUTCDate(),ym=y+'-'+pad2(mo+1);
   h+=`<div class="cp-h"><button class="cp-n" data-a="pm" aria-label="Previous month" ${ym<=minM?'disabled':''}>${ico('prev')}</button><button class="cp-t" data-a="toM">${MONF[mo]} ${y}</button><button class="cp-n" data-a="nm" aria-label="Next month" ${ym>=maxM?'disabled':''}>${ico('next')}</button></div><div class="cp-g cp-w">${WD.map(d=>`<span>${d[0]}</span>`).join('')}</div><div class="cp-g">`+'<span></span>'.repeat(lead);
   for(let d=1;d<=dim;d++){const ds=`${ym}-${pad2(d)}`,dis=ds<o.min||ds>o.max;h+=`<button class="cp-d${ds===o.value?' sel':''}${ds===todayS?' td':''}" data-d="${ds}" ${dis?'disabled':''}>${d}</button>`}
   h+='</div>';
  }else{
   h+=`<div class="cp-h"><button class="cp-n" data-a="py" aria-label="Previous year" ${y<=minY?'disabled':''}>${ico('prev')}</button><button class="cp-t" data-a="none">${y}</button><button class="cp-n" data-a="ny" aria-label="Next year" ${y>=maxY?'disabled':''}>${ico('next')}</button></div><div class="cp-g cp-m">`;
   for(let m=0;m<12;m++){const ym=y+'-'+pad2(m+1),dis=ym<minM||ym>maxM,sel=o.value.slice(0,7)===ym;h+=`<button class="cp-d cp-mo${sel?' sel':''}" data-m="${m}" ${dis?'disabled':''}>${MON[m]}</button>`}
   h+='</div>';
  }
  h+=`<div class="cp-f"><button data-a="latest">Latest data</button><button data-a="close">Close</button></div>`;
  el.innerHTML=h;
 };
 el.onclick=e=>{const t=e.target.closest('button');if(!t||t.disabled)return;const a=t.dataset.a;
  if(t.dataset.d){commit(t.dataset.d);return}
  if(t.dataset.m!==undefined){if(o.type==='month'){commit(y+'-'+pad2(+t.dataset.m+1))}else{mo=+t.dataset.m;view='days';draw()}return}
  if(a==='pm'){mo--;if(mo<0){mo=11;y--}draw()}else if(a==='nm'){mo++;if(mo>11){mo=0;y++}draw()}
  else if(a==='py'){y--;draw()}else if(a==='ny'){y++;draw()}
  else if(a==='toM'){view='months';draw()}
  else if(a==='latest'){commit(o.type==='month'?o.max.slice(0,7):o.max)}
  else if(a==='close')closePop()};
 draw();popAt(anchor,el,300);
}

const SITEICO=[3,3,0,5,4,1,9,7,2,10];
const grpIcon=(g,sz)=>`<span class="pimg" style="width:${sz}px;height:${sz}px">${catIcon(SITEICO[D.groups[g][1]],Math.round(sz*.5))}</span>`;
const rateTxt=g=>{const G=D.groups[g];return G[3]===G[4]?'₹'+inr(G[3]):'₹'+inr(G[3])+'–₹'+inr(G[4])};
const grpItems=g=>{const a=[];D.items.forEach((it,k)=>{if(it[F.grp]===g)a.push(k)});return a};
function openGroup(g){
 drawerInit();const G=D.groups[g],ids=grpItems(g);
 const rows=ids.map(k=>{const r=itemRows(k);return {k,it:D.items[k],rate:Math.round(D.items[k][F.mrp]||0),q:r.reduce((s,x)=>s+x[2],0),a:r.reduce((s,x)=>s+x[3],0),last:r.length?dates[r[r.length-1][0]]:'—',net:D.items[k][F.net]}});
 const tq=rows.reduce((s,r)=>s+r.q,0),ta=rows.reduce((s,r)=>s+r.a,0),net=rows.reduce((s,r)=>s+r.net,0);
 const byRate={};rows.forEach(r=>{const x=byRate[r.rate]||(byRate[r.rate]=[0,0]);x[0]+=r.q;x[1]+=r.a});
 const rk=Object.keys(byRate).map(Number).sort((a,b)=>a-b),best=rk.slice().sort((a,b)=>byRate[b][0]-byRate[a][0])[0];
 const shown=rk.length>40?rk.slice().sort((a,b)=>byRate[b][0]-byRate[a][0]).slice(0,40).sort((a,b)=>a-b):rk;
 document.getElementById('dbody').innerHTML=`<div style="display:flex;gap:14px;align-items:center;margin-bottom:6px">${grpIcon(g,64)}<div><h3>${esc(G[0])}</h3><div class="mute" style="font-size:13px">${esc(D.siteCats[G[1]])} · ${G[2]} item code${G[2]>1?'s':''} · ${rateTxt(g)}</div></div></div>
 <div class="kpis" style="--cols:2"><div class="k"><div class="l">Units sold (all time)</div><div class="v">${inr(tq)}</div></div><div class="k"><div class="l">Sales</div><div class="v">${rs(ta)}</div><div class="c">Avg rate ${tq?rsf(ta/tq):'—'}</div></div>
 <div class="k"><div class="l">Rates sold</div><div class="v">${rk.length}</div><div class="c">${rateTxt(g)}</div></div><div class="k ${net<0?'neg':''}"><div class="l">Stock now</div><div class="v ${net<0?'neg':''}">${inr(net)}</div><div class="c">all rates together</div></div></div>
 ${rk.length>1&&tq?`<div class="tk" style="margin:0 0 10px"><b>₹${inr(best)}</b> is the most popular rate (${(byRate[best][0]/tq*100).toFixed(0)}% of units).</div>`:''}
 <div class="mute" style="font-size:12.5px;margin:6px 0">Units sold at each rate${rk.length>shown.length?' (top 40)':''}</div>
 <div class="pl s"><canvas id="cGrp"></canvas></div>
 <div class="mute" style="font-size:12.5px;margin:12px 0 4px">Every rate under this product — click one for its own history</div>
 <table id="dvt" class="cmp"></table>`;
 document.getElementById('drawer').classList.add('open');document.getElementById('veil').classList.add('open');
 chart('cGrp',{type:'bar',data:{labels:shown.map(r=>'₹'+inr(r)),datasets:[{label:'Units',data:shown.map(r=>byRate[r][0]),backgroundColor:colA(),borderRadius:4,borderSkipped:false}]},options:{scales:axes({yfmt:inr}),plugins:{tooltip:tip(inr)}}});
 table('dvt',{sort:'rate',dir:1,rows,onRow:r=>openItem(r.k),cols:[{k:'rate',t:'Rate',f:v=>'₹'+inr(v)},{k:'n',t:'POS name',str:1,s:r=>r.it[F.pos],cls:'n l',f:v=>esc(v)},{k:'q',t:'Units',f:inr},{k:'a',t:'Sales',f:rs,bar:1},{k:'net',t:'Stock',f:v=>`<span class="${v<0?'neg':''}">${inr(v)}</span>`},{k:'last',t:'Last sale',str:1,f:v=>v&&v!=='—'?new Date(App.tms(v)).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'2-digit',timeZone:'UTC'}):'—'}]});
}
// ---------- shell ----------
const BTM=[['index.html','Overview','home'],['sales.html','Sales','trend'],['products.html','Products','box'],['stock.html','Stock','stock']];
const NAV=[['Performance',[['index.html','Overview','home'],['sales.html','Sales Trends','trend'],['profit.html','Profit (estimate)','coin'],['bank.html','Bank & Cash Flow','bank'],['forecast.html','Cash-Flow Forecast','forecast'],['customers.html','Regular Customers','users'],['time.html','Time Patterns','clock'],['bills.html','Bills & Baskets','bill']]],
 ['Catalogue',[['products.html','Products','box'],['categories.html','Categories & Brands','layers'],['stock.html','Stock Health','stock']]],
 ['Control',[['exceptions.html','Exceptions & Audit','alert'],['data.html','Data Catalogue','db']]]];
function buildShell(P){
 const nav=NAV.map(([g,items])=>`<div class="grp">${g}</div>`+items.map(([h,t,i])=>`<a href="${h}" data-p="${h}" class="${h===P.file?'on':''}">${ico(i)}<span>${t}</span></a>`).join('')).join('');
 document.body.innerHTML=`<div class="scrim" id="scrim"></div><aside class="sb" id="sb"><div class="logo"><img src="assets/logo-red.png" alt="Madipakkam Saravana Stores"></div><div class="tagl">Sales intelligence</div><nav>${nav}</nav>
 <div class="ft"><b>Madipakkam</b> 96984 71616<br><b>Medavakkam</b> 94445 77336<br><span style="opacity:.75">Trusted by Chennai families since 1980</span><br><button class="so" id="so">${ico('out')}Sign out</button></div></aside>
 <div class="main"><header class="hd"><div class="row1"><button class="ibtn menu" id="mb" aria-label="Menu">${ico('menu')}</button><div><h1>${P.title}</h1><div class="sub">${P.sub||''}</div></div><div class="sp"></div>${P.filters===false?'':`<button class="ibtn ftog" id="ftog" aria-label="Filters">${ico('filter')}</button>`}<button class="ibtn" id="theme" title="Light / dark" aria-label="Theme">${ico('sun')}</button></div>
 ${P.filters===false?'':`<div class="fb" id="fb"><label>View<span class="seg" id="segM"><button data-m="day">Day</button><button data-m="month">Month</button><button data-m="range">Range</button></span></label>
 <label>Period A<span id="aIn"></span></label><label>Quick range<select id="preset"><option value="">Custom</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="ytd">This year</option><option value="ly">Last year</option><option value="all">All time</option></select></label>
 <label>Compare with<select id="cmp"><option value="prev">Previous period</option><option value="ly">Same period last year</option><option value="custom">Pick another…</option><option value="none">No comparison</option></select></label>
 <label id="bWrap" style="display:none">Period B<span id="bIn"></span></label>
 ${P.show?'<label>Measure<span class="seg" id="segS"><button data-s="sales">Sales ₹</button><button data-s="bills">Bills</button></span></label>':''}
 <div class="lg"><span><span class="sw" style="background:var(--a)"></span>A · <b id="aLbl"></b></span><span><span class="sw" style="background:var(--b)"></span>B · <b id="bLbl"></b></span></div></div>`}</header>
 <main class="ct" id="ct"></main></div>
 <nav class="btm" id="btm">${BTM.map(([h,t,i])=>`<a href="${h}" data-p="${h}" class="${h===P.file?'on':''}">${ico(i)}<span>${t}</span></a>`).join('')}<button id="more" aria-label="More">${ico('menu')}<span>More</span></button></nav>`;
 document.getElementById('so').onclick=signOut;const sbEl=document.getElementById('sb'),scr=document.getElementById('scrim');const tg=o=>{sbEl.classList.toggle('open',o);scr.classList.toggle('open',o)};document.getElementById('mb').onclick=()=>tg(!sbEl.classList.contains('open'));document.getElementById('more').onclick=()=>tg(true);scr.onclick=()=>tg(false);sbEl.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>tg(false)));const ft=document.getElementById('ftog');if(ft)ft.onclick=()=>document.getElementById('fb').classList.toggle('open');
 document.getElementById('theme').onclick=()=>{const cur=document.documentElement.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');const nx=cur==='dark'?'light':'dark';try{localStorage.setItem('sss-theme',nx)}catch(e){}document.documentElement.setAttribute('data-theme',nx);themeChart();P._run()};
}
function setupInputs(P){
 if(P.filters===false)return;const m=S.mode;
 document.querySelectorAll('#segM [data-m]').forEach(b=>b.classList.toggle('on',b.dataset.m===m));
 document.querySelectorAll('#segS [data-s]').forEach(b=>b.classList.toggle('on',b.dataset.s===S.show));
 const mk=(id,p,set)=>{const w=document.getElementById(id);w.innerHTML='';const vals={s:p.s,e:p.e};
  const commit=()=>{set(m==='day'?{s:vals.s,e:vals.s}:m==='month'?monthRange(vals.s.slice(0,7)):{s:vals.s,e:vals.e<vals.s?vals.s:vals.e});S.preset='';P._run(true)};
  const add=(key,type)=>{const h=document.createElement('span');w.appendChild(h);picker(h,{type,value:type==='month'?vals[key].slice(0,7):vals[key],min:type==='month'?FIRST.slice(0,7):FIRST,max:type==='month'?LAST.slice(0,7):LAST,onChange:v=>{vals[key]=type==='month'?v+'-01':v;commit()}})};
  w.style.display='inline-flex';w.style.alignItems='center';w.style.gap='8px';
  if(m==='day')add('s','date');else if(m==='month')add('s','month');else{add('s','date');const a=document.createElement('span');a.textContent='→';a.style.color='var(--mute)';w.appendChild(a);add('e','date')}};
 mk('aIn',S.a,p=>S.a=p);if(!S.b)S.b=periodForCustom();mk('bIn',S.b,p=>S.b=p);
 document.getElementById('bWrap').style.display=S.cmp==='custom'?'':'none';document.getElementById('cmp').value=S.cmp;document.getElementById('preset').value=S.preset||'';syncSelects();
}
function wire(P){
 if(P.filters===false)return;
 document.querySelectorAll('#segM [data-m]').forEach(b=>b.onclick=()=>{S.mode=b.dataset.m;S.preset='';
  if(S.mode==='day'){const e=S.a.e<=LAST?S.a.e:LAST;S.a={s:e,e}}else if(S.mode==='month')S.a=monthRange(S.a.s.slice(0,7));else if(S.a.s===S.a.e)S.a={s:ymd(tms(S.a.s)-6*MS),e:S.a.s};
  S.b=periodForCustom();P._run(true)});
 document.querySelectorAll('#segS [data-s]').forEach(b=>b.onclick=()=>{S.show=b.dataset.s;P._run(true)});
 document.getElementById('cmp').onchange=e=>{S.cmp=e.target.value;if(S.cmp==='custom')S.b=periodForCustom();P._run(true)};
 document.getElementById('preset').onchange=e=>{const v=e.target.value;S.preset=v;if(!v){P._run(true);return}S.mode='range';
  const e2=LAST;const y=+LAST.slice(0,4);
  if(v==='all')S.a={s:FIRST,e:e2};else if(v==='ytd')S.a={s:y+'-01-01',e:e2};else if(v==='ly')S.a={s:(y-1)+'-01-01',e:(y-1)+'-12-31'};else S.a={s:ymd(tms(e2)-(+v-1)*MS),e:e2};
  if(S.a.s<FIRST)S.a.s=FIRST;S.b=periodForCustom();if(v==='all')S.cmp='none';P._run(true)};
}

// ---------- sign-in gate (client-side; see README for limits) ----------
const AUTH_OK='1nq7c5hklsp';
const _hash=(s,seed=7)=>{let h1=0xdeadbeef^seed,h2=0x41c6ce57^seed;for(let i=0,c;i<s.length;i++){c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return (4294967296*(2097151&h2)+(h1>>>0)).toString(36)};
const _cred=(u,p)=>_hash('sss|'+u.trim()+'|'+p+'|madipakkam');
function isAuthed(){
 try{if(sessionStorage.getItem('sss-auth')===AUTH_OK)return true}catch(e){}
 try{const v=JSON.parse(localStorage.getItem('sss-auth-l')||'null');if(v&&v.k===AUTH_OK&&v.t>Date.now()){try{sessionStorage.setItem('sss-auth',AUTH_OK)}catch(e){}return true}}catch(e){}
 return false;
}
function signOut(){try{sessionStorage.removeItem('sss-auth');localStorage.removeItem('sss-auth-l')}catch(e){}location.reload()}
function showLogin(onOk){
 document.body.innerHTML=`<div class="lg-bg"><form class="lg-card" id="lgf" autocomplete="on">
  <img src="assets/logo-red.png" alt="Madipakkam Saravana Stores" class="lg-logo">
  <h1>Sign in</h1><p class="lg-s">Sales dashboard — authorised staff only</p>
  <label>Username<input id="lu" name="username" autocomplete="username" inputmode="numeric" required autofocus></label>
  <label>Password<span class="lg-pw"><input id="lp" name="password" type="password" autocomplete="current-password" inputmode="numeric" required><button type="button" id="lt" aria-label="Show password">${ico('eye')}</button></span></label>
  <label class="lg-k"><input type="checkbox" id="lk" checked> Keep me signed in on this device (30 days)</label>
  <div class="lg-e" id="le" role="alert"></div>
  <button class="lg-go" type="submit">Sign in</button>
  <p class="lg-f">Madipakkam 96984 71616 · Medavakkam 94445 77336</p></form></div>`;
 const f=document.getElementById('lgf'),e=document.getElementById('le');let fails=0,lock=0;
 document.getElementById('lt').onclick=()=>{const p=document.getElementById('lp');p.type=p.type==='password'?'text':'password'};
 f.onsubmit=ev=>{ev.preventDefault();
  if(Date.now()<lock){e.textContent='Too many attempts. Try again in '+Math.ceil((lock-Date.now())/1000)+' s.';return}
  if(_cred(document.getElementById('lu').value,document.getElementById('lp').value)===AUTH_OK){
   try{sessionStorage.setItem('sss-auth',AUTH_OK);if(document.getElementById('lk').checked)localStorage.setItem('sss-auth-l',JSON.stringify({k:AUTH_OK,t:Date.now()+30*864e5}))}catch(x){}
   onOk();return}
  fails++;e.textContent=fails>=5?'Too many attempts. Locked for 30 seconds.':'Incorrect username or password.';
  if(fails>=5){lock=Date.now()+30000;fails=0}
  f.classList.remove('shake');void f.offsetWidth;f.classList.add('shake');document.getElementById('lp').value='';document.getElementById('lp').focus()};
}
function page(P){
 if(!isAuthed()){showLogin(()=>page(P));return}
 P.file=location.pathname.split('/').pop()||'index.html';loadState();
 buildShell(P);themeChart();enhanceSelects(document);
 const ct=document.getElementById('ct');ct.innerHTML=P.build();enhanceSelects(ct);wire(P);
 P._run=function(refresh){
  if(refresh){for(const k in charts){charts[k].destroy();delete charts[k]}}
  const A=agg(S.a),B=agg(periodB());
  if(P.filters!==false){setupInputs(P);document.getElementById('aLbl').textContent=label(S.a);document.getElementById('bLbl').textContent=B?label(B.p):'—';saveState()}
  P.update(A,B,{S});reveal();
 };
 App.cur=P;P._run();
 const refit=()=>{for(const k in charts){try{charts[k].resize();charts[k].update('none')}catch(e){}}};if(document.fonts&&document.fonts.load)Promise.all([document.fonts.load('400 13px Inter'),document.fonts.load('500 14px Inter')]).then(refit,refit);window.addEventListener('load',()=>setTimeout(refit,250));
 if(P.filters===false)saveState();
 matchMedia('(prefers-color-scheme:dark)').addEventListener('change',()=>{themeChart();P._run()});
 window.addEventListener('resize',()=>{});
}
// theme from storage
try{const t=localStorage.getItem('sss-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}
{const qt=new URLSearchParams(location.search).get('theme');if(qt==='light'||qt==='dark')document.documentElement.setAttribute('data-theme',qt)}
window.App={drawerInit,openGroup,grpIcon,rateTxt,SITEICO,trunc,closePop,syncSelects,enhanceSelects,mg,MG,setMargin,exTax,D,F,S,page,agg,periodB,label,monthRange,addMonths,inr,rs,rsf,pc,pill,kpis,countUp,spark,chart,axes,tip,table,reveal,mix,css,colA,colB,catColor,catIcon,catChip,brandChip,prodImg,openItem,itemRows,WD,MON,dates,di,ymd,tms,esc,showFmt,wdIdx,FIRST,LAST,MS};
})();
