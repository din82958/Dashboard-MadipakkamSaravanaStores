// Stock Health
const {rs,rsf,inr,pill,kpis,chart,axes,tip,D,F,css,table,openItem,esc,catIcon,catChip,prodImg,tms,MS}=App;
const ASOF=D.meta.stockAsof,T0=tms(ASOF);
// sales velocity (90d) and recency from the sales history up to the stock-report date
const v90={},v180={},lastSale={};
D.itemday.forEach(r=>{const d=App.dates[r[0]];if(d>ASOF)return;const age=(T0-tms(d))/MS;if(age<90)v90[r[1]]=(v90[r[1]]||0)+r[2];if(age<180)v180[r[1]]=(v180[r[1]]||0)+r[2];lastSale[r[1]]=d});
const R=[];D.items.forEach((it,k)=>{if(!it[F.instock])return;const net=it[F.net],mrp=it[F.mrp]||0,s90=v90[k]||0;
 R.push({k,it,net,pos:it[F.posq],neg:it[F.negq],mrp,vpos:it[F.posq]*mrp,vneg:it[F.negq]*mrp,vnet:net*mrp,s90,s180:v180[k]||0,last:lastSale[k]||'',since:lastSale[k]?Math.round((T0-tms(lastSale[k]))/MS):null,cover:net>0&&s90>0?net/(s90/90):null,bt:it[F.btype]})});
const sum=(a,f)=>a.reduce((s,x)=>s+f(x),0);
const negItems=R.filter(r=>r.net<0),dead=R.filter(r=>r.net>0&&!r.s180),over=R.filter(r=>r.cover&&r.cover>365),fastNeg=negItems.filter(r=>r.s90>0);
let tab='urgent',q='',fc='';
const TABS={urgent:['Negative & selling now','Items with negative stock that sold in the last 90 days — fix these first (stock-in not recorded, or migrated quantity wrong).'],neg:['All negative stock','Every item whose total stock is below zero, biggest first.'],dead:['Dead stock','Items with positive stock and no sale in the 180 days before the stock date — cash tied up on shelves.'],over:['Overstock','More than a year of stock at the last-90-day selling rate.'],value:['Largest stock value','Items holding the most stock value at MRP.']};
App.page({title:'Stock Health',sub:'Negative stock is shown as it is. Dead and overstocked items are measured against recent sales.',filters:false,
build(){return `<div class="kpis" id="kp"></div>
<div class="grid">
 <div class="card s4 rv"><div class="ch"><div><h2>Negative units by batch type</h2><div class="cap">Where the negative balances sit</div></div></div><div class="tk" id="t1"></div><div class="pl s"><canvas id="cT"></canvas></div><div class="note"><b>OS</b> opening/entered stock · <b>SU</b> migrated from Vyapar · <b>MR</b> other</div></div>
 <div class="card s4 rv"><div class="ch"><div><h2>Negative stock by category</h2><div class="cap">Units below zero</div></div></div><div class="pl"><canvas id="cNC"></canvas></div></div>
 <div class="card s4 rv"><div class="ch"><div><h2>Positive stock value by category</h2><div class="cap">At MRP</div></div></div><div class="pl"><canvas id="cPC"></canvas></div></div>
 <div class="card s12 rv"><div class="ch"><div><h2 id="tt">Items</h2><div class="cap" id="tc"></div></div></div>
  <div class="tools"><div class="tabs" id="tabs">${Object.entries(TABS).map(([k,v])=>`<button data-t="${k}">${v[0]}</button>`).join('')}</div></div>
  <div class="tools"><input id="q" placeholder="Search item or code"><select id="fc"><option value="">All categories</option>${D.cats.map((c,i)=>`<option value="${i}">${esc(c)}</option>`).join('')}</select></div>
  <div class="scroll t"><table id="tb"></table></div></div>
 <div class="card s6 rv"><div class="ch"><div><h2>Days of stock cover</h2><div class="cap">Items with stock and recent sales · cover = stock ÷ average daily sales (last 90 days)</div></div></div><div class="tk" id="t2"></div><div class="pl"><canvas id="cCv"></canvas></div></div>
 <div class="card s6 rv"><div class="ch"><div><h2>Stock by GST slab</h2><div class="cap">Positive stock value at MRP</div></div></div><div class="pl"><canvas id="cGS"></canvas></div></div>
</div>`},
update(){
 const posv=sum(R,r=>r.vpos),negv=sum(R,r=>r.vneg),netv=posv+negv;
 kpis(document.getElementById('kp'),[
  {l:'Items in stock list',v:()=>R.length,f:inr,cmp:false,cls:'hl',sub:'as of '+ASOF},{l:'Net units',v:()=>sum(R,r=>r.net),f:inr,cmp:false,sub:inr(sum(R,r=>r.pos))+' in − '+inr(-sum(R,r=>r.neg))+' out'},
  {l:'Positive stock value',v:()=>posv,f:rs,cmp:false,sub:'at MRP'},{l:'Negative stock value',v:()=>negv,f:rs,cmp:false,cls:'neg',sub:inr(sum(R,r=>r.neg))+' units'},
  {l:'Net-negative items',v:()=>negItems.length,f:inr,cmp:false,cls:'warn',sub:(negItems.length/R.length*100).toFixed(0)+'% of items'},{l:'Negative but selling',v:()=>fastNeg.length,f:inr,cmp:false,cls:'warn',sub:'sold in last 90 days'},
  {l:'Dead stock value',v:()=>sum(dead,r=>r.vpos),f:rs,cmp:false,sub:inr(dead.length)+' items, no sale in 180d'},{l:'Overstock value',v:()=>sum(over,r=>r.vpos),f:rs,cmp:false,sub:inr(over.length)+' items, 1yr+ cover'}],{n:1},null);
 // batch type
 const ty=Object.entries(D.stockTypes).map(([k,v])=>({t:k,u:v[3]})).sort((a,b)=>a.u-b.u);
 chart('cT',{type:'bar',data:{labels:ty.map(x=>x.t),datasets:[{label:'Negative units',data:ty.map(x=>x.u),backgroundColor:css('--neg'),borderRadius:6,borderSkipped:false}]},options:{indexAxis:'y',scales:axes({horizontal:true,yfmt:inr}),plugins:{tooltip:tip(inr)}}});
 const tot=ty.reduce((s,x)=>s+x.u,0),su=ty.find(x=>x.t==='SU');
 document.getElementById('t1').innerHTML=`<b>${inr(-tot)}</b> units are negative. Migrated <b>SU</b> batches hold ${su?(su.u/tot*100).toFixed(0):0}% — the Vyapar quantities never matched the shelves.`;
 const nc=Array(D.cats.length).fill(0),pc_=Array(D.cats.length).fill(0);R.forEach(r=>{nc[r.it[F.cat]]+=r.neg;pc_[r.it[F.cat]]+=r.vpos});
 const oc=nc.map((v,i)=>[i,v]).sort((a,b)=>a[1]-b[1]).filter(x=>x[1]<0);
 chart('cNC',{type:'bar',data:{labels:oc.map(x=>D.cats[x[0]]),datasets:[{label:'Negative units',data:oc.map(x=>x[1]),backgroundColor:css('--neg'),borderRadius:5,borderSkipped:false}]},options:{indexAxis:'y',scales:axes({horizontal:true,yfmt:inr,y:{ticks:{font:{size:11},color:css('--ink2'),callback:App.trunc}}}),plugins:{tooltip:tip(inr)}}});
 const op=pc_.map((v,i)=>[i,v]).sort((a,b)=>b[1]-a[1]).filter(x=>x[1]>0);
 chart('cPC',{type:'bar',data:{labels:op.map(x=>D.cats[x[0]]),datasets:[{label:'Stock value',data:op.map(x=>x[1]),backgroundColor:App.colA(),borderRadius:5,borderSkipped:false}]},options:{indexAxis:'y',scales:axes({horizontal:true,yfmt:rs,y:{ticks:{font:{size:11},color:css('--ink2'),callback:App.trunc}}}),plugins:{tooltip:tip(rs)}}});
 // cover histogram
 const cb=[7,30,90,180,365],CL=['< 1 week','1–4 weeks','1–3 months','3–6 months','6–12 months','1 year +'],cn=Array(6).fill(0),cv=Array(6).fill(0);
 R.filter(r=>r.cover).forEach(r=>{let i=0;while(i<5&&r.cover>=cb[i])i++;cn[i]++;cv[i]+=r.vpos});
 chart('cCv',{type:'bar',data:{labels:CL,datasets:[{label:'Stock value at MRP',data:cv,backgroundColor:cv.map((_,i)=>i===0?css('--neg'):i===5?css('--c4'):css('--a')),borderRadius:6,borderSkipped:false}]},options:{scales:axes({yfmt:rs}),plugins:{tooltip:{callbacks:{label:c=>' '+rs(c.parsed.y)+' · '+inr(cn[c.dataIndex])+' items'}}}}});
 document.getElementById('t2').innerHTML=`<b>${inr(cn[0])}</b> selling items will run out within a week at the current pace; <b>${inr(cn[5])}</b> hold over a year of stock (${rs(cv[5])}).`;
 const gs={};R.forEach(r=>{const t=(r.it[F.tax]||0)+'%';gs[t]=(gs[t]||0)+r.vpos});const gk=Object.keys(gs).sort((a,b)=>parseFloat(a)-parseFloat(b));
 chart('cGS',{type:'doughnut',data:{labels:gk.map(k=>'GST '+k),datasets:[{data:gk.map(k=>gs[k]),backgroundColor:gk.map((_,i)=>css('--c'+(i+1))),borderColor:css('--card'),borderWidth:3,hoverOffset:8}]},options:{cutout:'62%',plugins:{legend:{display:true,position:'right',labels:{usePointStyle:true,boxWidth:8,color:css('--ink2')}},tooltip:{callbacks:{label:c=>' '+c.label+': '+rs(c.parsed)}}}}});
 // table
 const draw=()=>{
  document.querySelectorAll('#tabs [data-t]').forEach(b=>{b.classList.toggle('on',b.dataset.t===tab);b.onclick=()=>{tab=b.dataset.t;draw()}});
  document.getElementById('tt').textContent=TABS[tab][0];document.getElementById('tc').textContent=TABS[tab][1];
  let rows=tab==='urgent'?fastNeg:tab==='neg'?negItems:tab==='dead'?dead:tab==='over'?over:R.filter(r=>r.vpos>0);
  const ql=q.toLowerCase();rows=rows.filter(r=>(!fc||r.it[F.cat]==fc)&&(!ql||r.it[F.name].toLowerCase().includes(ql)||r.it[F.pos].toLowerCase().includes(ql)||r.it[F.code]===q));
  const sk=tab==='urgent'?'s90':tab==='neg'?'vnet':tab==='dead'?'vpos':tab==='over'?'vpos':'vpos',sd=tab==='neg'?1:-1;
  table('tb',{sort:sk,dir:sd,rows,lazy:100,foot:true,onRow:r=>openItem(r.k),cols:[
   {k:'n',t:'Product',str:1,s:r=>r.it[F.name],cls:'l',f:(_,r)=>`<div class="pn">${prodImg(r.it,34)}<div><b>${esc(r.it[F.name])}</b><small>${esc(D.cats[r.it[F.cat]])} · code ${esc(r.it[F.code])}</small></div></div>`},
   {k:'net',t:'Net stock',f:v=>`<span class="${v<0?'neg':''}">${inr(v)}</span>`},{k:'neg',t:'Negative part',f:v=>v?`<span class="neg">${inr(v)}</span>`:'—'},{k:'mrp',t:'MRP',f:rsf},
   {k:'vnet',t:'Net value',f:v=>`<span class="${v<0?'neg':''}">${rs(v)}</span>`},{k:'vpos',t:'Positive value',f:rs,bar:tab!=='neg'&&tab!=='urgent'},
   {k:'s90',t:'Sold 90d',f:inr},{k:'since',t:'Last sale',s:r=>r.since??99999,f:(v,r)=>r.last?r.last+' <span class="mute">('+r.since+'d)</span>':'never'},{k:'cover',t:'Cover',s:r=>r.cover??-1,f:(v,r)=>r.cover?(r.cover>=365?(r.cover/365).toFixed(1)+' yr':Math.round(r.cover)+' d'):'—'},
   {k:'bt',t:'Type',str:1,f:v=>v?`<span class="tag">${v}</span>`:'—'}]});
 };
 document.getElementById('q').oninput=e=>{q=e.target.value;draw()};document.getElementById('fc').onchange=e=>{fc=e.target.value;draw()};draw();
}});
