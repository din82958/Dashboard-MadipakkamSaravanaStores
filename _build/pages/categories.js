// Categories & Brands
const {rs,rsf,inr,pc,pill,kpis,chart,axes,tip,D,F,css,S,table,openItem,esc,catIcon,brandChip,prodImg}=App;
let dim='site',sel=null;
const DIMS={site:{t:'Website section',names:()=>D.siteCats,key:it=>D.groups[it[F.grp]][1],src:o=>o.site},cat:{t:'Category',names:()=>D.cats,key:it=>it[F.cat],src:o=>o.cat,icon:i=>catIcon(+i,20)},brand:{t:'Brand',names:()=>D.brands,key:it=>it[F.brand],src:o=>o.brand,icon:i=>''},mat:{t:'Material',names:()=>D.matNames,key:it=>it[F.mat],src:o=>o.mat,icon:i=>''}};
// monthly by dimension (all time), computed once per dimension
const MC={};
function monthly(d){if(MC[d])return MC[d];const D_=DIMS[d],months=[];let c=App.FIRST.slice(0,7);while(c<=App.LAST.slice(0,7)){months.push(c);c=App.addMonths(c,1)}
 const mi={};months.forEach((m,i)=>mi[m]=i);const by={};
 D.itemday.forEach(r=>{const k=D_.key(D.items[r[1]]);if(d==='brand'&&!k)return;(by[k]||(by[k]=new Array(months.length).fill(0)))[mi[App.dates[r[0]].slice(0,7)]]+=r[3]});
 return MC[d]={months,by}}
App.page({title:'Categories & Brands',sub:'Website categories, brands and materials — what sells, how it trends',show:false,
build(){return `<div class="kpis" id="kp"></div>
<div class="grid">
 <div class="card s12 rv"><div class="ch"><div><h2>Break sales down by</h2><div class="cap" id="dcap"></div></div><div class="sp"></div><div class="seg" id="dseg"><button data-d="site">Website section</button><button data-d="cat">Category (Google feed)</button><button data-d="brand">Brand</button><button data-d="mat">Material</button></div></div>
  <div class="grid"><div class="s5"><div id="bars"></div></div><div class="s7"><div class="tk" id="t1"></div><div class="pl t"><canvas id="cM"></canvas></div></div></div></div>
 <div class="card s12 rv"><div class="ch"><div><h2 id="th">Detail</h2><div class="cap">Click a row to see its best-selling products below</div></div></div><div class="scroll"><table id="tt"></table></div></div>
 <div class="card s12 rv" id="dcard"><div class="ch"><div><h2 id="dh">Top products</h2><div class="cap">Within the selected row · period A</div></div></div><div class="scroll"><table id="td"></table></div></div>
</div>`},
update(A,B){
 const ic=k=>dim==='cat'?catIcon(k,20):dim==='site'?catIcon(App.SITEICO[k],20):dim==='brand'?brandChip(k):'';
 const D_=DIMS[dim];document.querySelectorAll('#dseg [data-d]').forEach(b=>{b.classList.toggle('on',b.dataset.d===dim);b.onclick=()=>{dim=b.dataset.d;sel=null;App.cur._run(true)}});
 const feed=Object.entries(A.items).reduce((s,[k,v])=>s+(D.items[k][F.src]===0?v[1]:0),0),unc=(A.cat[D.cats.length-1]||[0])[0],brandSales=Object.values(A.brand).reduce((s,v)=>s+v[0],0);
 kpis(document.getElementById('kp'),[
  {l:'Categories selling',v:x=>Object.keys(x.cat).length,f:inr,cls:'hl',neutral:true},{l:'Top category share',v:x=>{const a=Object.values(x.cat).map(v=>v[0]);return Math.max(...a,0)/(x.sales||1)*100},f:v=>v.toFixed(0)+'%',neutral:true},
  {l:'Branded products share',v:x=>Object.values(x.brand).reduce((s,v)=>s+v[0],0)/(x.sales||1)*100,f:v=>v.toFixed(0)+'%',neutral:true,sub:'Items with a recognised brand name'},
  {l:'Brands selling',v:x=>Object.keys(x.brand).length,f:inr,neutral:true},
  {l:'Sales in website categories',v:x=>Object.entries(x.items).reduce((s,[k,v])=>s+(D.items[k][F.src]===0?v[1]:0),0)/(x.sales||1)*100,f:v=>v.toFixed(0)+'%',neutral:true,sub:'Rest is inferred from item names'},
  {l:'Unclassified',v:x=>(x.cat[D.cats.length-1]||[0])[0]/(x.sales||1)*100,f:v=>v.toFixed(1)+'%',neutral:true,lower:true}],A,B);
 document.getElementById('dcap').textContent=dim==='site'?'The 10 sections of your website (Cookware, Pooja Items, Steel Vessels …). Each product is placed with the same rules the website catalogue uses.':dim==='cat'?'Categories follow the website & Google Merchant feed (9) plus Appliances (not on the website) — items missing from the feed are matched by name.':dim==='brand'?'Brands come from the Merchant feed and brand names found in item names. Only about a seventh of sales carry a brand name.':'Material is read from words in the item name (steel, brass, aluminium…). Most items do not state a material.';
 const names=D_.names(),src=D_.src(A),bsrc=B?D_.src(B):{};
 const rows=Object.entries(src).filter(([k])=>!(dim==='mat'&&+k===D.matNames.length-1&&false)).map(([k,v])=>({k:+k,n:names[k]||'(none)',s:v[0],q:v[1],i:v[2],b:bsrc[k]?bsrc[k][0]:0})).sort((a,b)=>b.s-a.s);
 const tot=A.sales||1;rows.forEach(r=>{r.sh=r.s/tot*100;r.p=r.q?r.s/r.q:0});
 const mx=rows.length?rows[0].s:1;
 document.getElementById('bars').innerHTML=rows.slice(0,12).map(r=>`<div style="margin:10px 0"><div style="display:flex;gap:8px;align-items:center;justify-content:space-between;font-size:14px"><span style="display:flex;gap:8px;align-items:center;color:var(--ink2)">${ic(r.k)}${dim==='brand'?'':esc(r.n)}</span><span><b>${r.sh.toFixed(1)}%</b> <span class="mute" style="font-size:12px">${rs(r.s)}</span></span></div><div class="bar-row" style="grid-template-columns:1fr;margin:4px 0 0"><div class="t"><i data-w="${r.s/mx*100}"></i></div></div></div>`).join('');
 requestAnimationFrame(()=>document.querySelectorAll('#bars .t i').forEach(i=>i.style.width=i.dataset.w+'%'));
 // stacked monthly
 const mo=monthly(dim),tops=Object.entries(mo.by).map(([k,a])=>[k,a.reduce((s,x)=>s+x,0)]).sort((a,b)=>b[1]-a[1]).slice(0,7).map(x=>x[0]);
 const other=mo.months.map((_,i)=>Object.entries(mo.by).filter(([k])=>!tops.includes(k)).reduce((s,[k,a])=>s+a[i],0));
 const ds=tops.map((k,i)=>({label:names[k]||'(none)',data:mo.by[k],backgroundColor:css('--c'+(i+1)),borderColor:css('--card'),borderWidth:1.5,borderRadius:2,stack:'s'}));
 ds.push({label:'All other',data:other,backgroundColor:css('--c9'),borderColor:css('--card'),borderWidth:1.5,stack:'s'});
 chart('cM',{type:'bar',data:{labels:mo.months,datasets:ds},options:{scales:Object.assign(axes({yfmt:rs}),{x:{stacked:true,grid:{display:false},border:{display:false},ticks:{color:css('--mute'),maxRotation:0,autoSkip:true}},y:{stacked:true,grid:{color:css('--line')},border:{display:false},ticks:{color:css('--mute'),callback:rs},beginAtZero:true}}),plugins:{legend:{display:true,position:'bottom',labels:{usePointStyle:true,boxWidth:8,color:css('--ink2')}},tooltip:{callbacks:{label:c=>' '+c.dataset.label+': '+rs(c.parsed.y)}}}}});
 document.getElementById('t1').innerHTML=rows.length?`<b>${esc(rows[0].n)}</b> leads this period with <b>${rows[0].sh.toFixed(0)}%</b> of sales${rows[1]?`; second is <b>${esc(rows[1].n)}</b> (${rows[1].sh.toFixed(0)}%)`:''}. Monthly mix over all history is shown on the right.`:'No sales in this period.';
 document.getElementById('th').textContent=D_.t+' detail';
 table('tt',{sort:'s',rows,onRow:r=>{sel=r.k;detail(A,B,r)},cols:[
  {k:'n',t:D_.t,str:1,cls:'l',f:(_,r)=>`<span style="display:flex;gap:10px;align-items:center">${ic(r.k)}${dim==='brand'?'':esc(r.n)}</span>`},
  {k:'i',t:'Products sold',f:inr},{k:'q',t:'Units',f:inr},{k:'s',t:'Sales',f:rs,bar:1},{k:'sh',t:'Share',f:v=>v.toFixed(1)+'%'},{k:'p',t:'Avg price',f:rsf},
  ...(B?[{k:'b',t:'B sales',f:rs},{k:'d',t:'Δ',s:r=>r.b?(r.s-r.b)/r.b*100:1e9,f:(v,r)=>r.b?pill(r.s,r.b):'<span class="pill nu">new</span>'}]:[])]});
 const first=rows.find(r=>r.k===sel)||rows[0];if(first){sel=first.k;detail(A,B,first)}
}});
function detail(A,B,r){
 const D_=DIMS[dim];document.getElementById('dh').textContent='Top products — '+r.n;
 const gm={};Object.entries(A.items).forEach(([k,v])=>{const it=D.items[k];if(D_.key(it)!==r.k)return;const g=it[F.grp],x=gm[g]||(gm[g]={k:+g,q:0,a:0,b:0,n:0});x.q+=v[0];x.a+=v[1];x.n++});
 if(B)Object.entries(B.items).forEach(([k,v])=>{const it=D.items[k];if(D_.key(it)!==r.k)return;const g=it[F.grp];if(gm[g])gm[g].b+=v[1]});
 const items=Object.values(gm).map(x=>({...x,p:x.q?x.a/x.q:0})).sort((x,y)=>y.a-x.a);
 table('td',{sort:'a',rows:items,limit:25,foot:true,onRow:x=>App.openGroup(x.k),cols:[{k:'nm',t:'Product',str:1,s:x=>D.groups[x.k][0],cls:'l',f:(_,x)=>`<div class="pn">${App.grpIcon(x.k,34)}<div><b>${esc(D.groups[x.k][0])}</b><small>${esc(D.siteCats[D.groups[x.k][1]])} · ${App.rateTxt(x.k)}</small></div></div>`},{k:'n',t:'Rates sold'},{k:'q',t:'Units',f:inr},{k:'a',t:'Sales',f:rs,bar:1},{k:'p',t:'Avg rate',f:rsf},...(B?[{k:'b',t:'B sales',f:rs}]:[])]});
}
