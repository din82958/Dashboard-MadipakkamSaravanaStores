// Overview
const {rs,inr,pill,pc,kpis,chart,axes,tip,WD,catIcon,table,openItem,D,F,css}=App;
function insights(A,B){
 const out=[],tr=A.trading||1;
 const d=pc(A.sales,B&&B.sales);
 out.push(['Sales',`<b>${rs(A.sales)}</b> from <b>${inr(A.bills)}</b> bills over ${A.trading} sale days (${rs(A.sales/tr)}/day)${B&&d!==null?` — ${d>=0?'up':'down'} <b>${Math.abs(d).toFixed(1)}%</b> vs ${App.label(B.p)}`:''}.`]);
 const wd=A.wd.map((x,i)=>[i,x[2]?x[0]/x[2]:0]).sort((a,b)=>b[1]-a[1]);
 if(A.trading>=14&&wd[0][1])out.push(['Best weekday',`<b>${WD[wd[0][0]]}</b> averages ${rs(wd[0][1])}/day; slowest is <b>${WD[wd[6][0]]}</b> at ${rs(wd[6][1])}.`]);
 const hr=A.hr.map((x,i)=>[i,x[0]]).sort((a,b)=>b[1]-a[1]);
 if(hr[0][1]){const ev=[18,19,20].reduce((s,h)=>s+A.hr[h][0],0)/A.sales*100;out.push(['Peak hour',`<b>${hr[0][0]%12||12}${hr[0][0]<12?'am':'pm'}</b> is the busiest hour; <b>6–9 pm</b> brings ${ev.toFixed(0)}% of sales.`])}
 const best=A.days.reduce((m,x)=>x.s>m.s?x:m,{s:0});if(best.s)out.push(['Best day',`<b>${best.d}</b> (${WD[best.w]}) with ${rs(best.s)} from ${best.b} bills.`]);
 const cs=Object.entries(A.cat).sort((a,b)=>b[1][0]-a[1][0]);
 if(cs.length>1)out.push(['Top category',`<b>${D.cats[cs[0][0]]}</b> leads with ${(cs[0][1][0]/A.sales*100).toFixed(0)}% of sales; next is ${D.cats[cs[1][0]]} (${(cs[1][1][0]/A.sales*100).toFixed(0)}%).`]);
 const ts=Object.entries(A.items).sort((a,b)=>b[1][1]-a[1][1])[0];
 if(ts)out.push(['Top product',`<b>${App.esc(D.items[ts[0]][F.name])}</b> — ${rs(ts[1][1])} from ${inr(ts[1][0])} units.`]);
 out.push(['Basket',`Average bill <b>${rs(A.sales/(A.bills||1))}</b> with <b>${(A.units/(A.bills||1)).toFixed(1)}</b> units per bill.`]);
 const neg=D.items.filter(i=>i[F.net]<0).length;out.push(['Stock alert',`<b>${inr(neg)}</b> items show negative stock as of ${D.meta.stockAsof} — billed before stock was entered. <a href="stock.html" style="color:var(--a)">Review →</a>`]);
 return out;
}
App.page({title:'Overview',sub:'The whole business at a glance for the selected period',show:true,
build(){return `<div class="kpis" id="kp"></div>
<div class="card rv" style="margin-bottom:16px"><div class="ch"><h2>What stands out</h2></div><div class="ins" id="ins"></div></div>
<div class="grid">
 <div class="card s8 rv"><div class="ch"><div><h2>Sales trend</h2><div class="cap" id="tcap"></div></div></div><div class="pl t"><canvas id="cT"></canvas></div></div>
 <div class="card s4 rv"><div class="ch"><div><h2>Sales by category</h2><div class="cap">Share of period A</div></div></div><div id="cats"></div></div>
 <div class="card s6 rv"><div class="ch"><h2>By hour of day</h2></div><div class="pl"><canvas id="cH"></canvas></div></div>
 <div class="card s6 rv"><div class="ch"><div><h2>By weekday</h2><div class="cap">Average per sale day</div></div></div><div class="pl"><canvas id="cW"></canvas></div></div>
 <div class="card s7 rv"><div class="ch"><div><h2>Top products</h2><div class="cap">Click a row for full detail</div></div><div class="sp"></div><a href="products.html" style="color:var(--a);text-decoration:none;font-size:13px">All products →</a></div><div class="scroll"><table id="tp"></table></div></div>
 <div class="card s5 rv"><div class="ch"><div><h2>Stock health</h2><div class="cap">As of ${D.meta.stockAsof}</div></div></div><div id="sh"></div></div>
</div>
<div class="ch" style="margin:24px 0 10px"><h2>Explore</h2></div>
<div class="ql">
 <a href="sales.html"><b>Sales Trends</b><span>Daily to monthly history, growth, year on year</span></a>
 <a href="profit.html"><b>Profit (estimate)</b><span>Gross profit at your 30–40% margin, stock at cost</span></a>
 <a href="time.html"><b>Time Patterns</b><span>Hours, weekdays, heatmap, seasonality</span></a>
 <a href="bills.html"><b>Bills & Baskets</b><span>Bill sizes, items per bill, big bills</span></a>
 <a href="products.html"><b>Products</b><span>Every item, ranking, Pareto, price bands</span></a>
 <a href="categories.html"><b>Categories & Brands</b><span>Website categories, brands, materials</span></a>
 <a href="stock.html"><b>Stock Health</b><span>Negative, dead and overstocked items</span></a>
 <a href="exceptions.html"><b>Exceptions & Audit</b><span>Voids, returns, discounts, odd hours</span></a>
 <a href="data.html"><b>Data Catalogue</b><span>Every table, field and caveat explained</span></a>
</div>`},
update(A,B){
 kpis(document.getElementById('kp'),[
  {l:'Net sales',v:x=>x.sales,f:rs,cls:'hl',sp:x=>x.days.map(d=>d.s)},{l:'Est. gross profit',v:x=>x.profit,f:rs,sub:'at your 30–40% margin'},{l:'Bills',v:x=>x.bills,f:inr,sp:x=>x.days.map(d=>d.b)},
  {l:'Average bill',v:x=>x.bills?x.sales/x.bills:0,f:rs,sp:x=>x.days.map(d=>d.b?d.s/d.b:0)},{l:'Units sold',v:x=>x.units,f:inr,sp:x=>x.days.map(d=>d.u)},
  {l:'Distinct products sold',v:x=>Object.keys(x.items).length,f:inr}],A,B);
 document.getElementById('ins').innerHTML=insights(A,B).map(([t,h])=>`<div><span class="h">${t}</span>${h}</div>`).join('');
 const sh=App.S.show,idx=sh==='sales'?0:1,yf=sh==='sales'?rs:inr;
 const n=A.n,bucket=n>400?30:n>62?7:1;
 const val=o=>sh==='sales'?o.s:o.b;
 const HS=[9,10,11,12,13,14,15,16,17,18,19,20,21,22];const bs=o=>{if(!o)return null;if(n===1)return HS.map(h=>o.hr[h][idx]);const r=[];for(let i=0;i<n;i+=bucket){let t=0;for(let j=i;j<Math.min(i+bucket,n);j++)t+=o.days[j]?val(o.days[j]):0;r.push(t)}return r};
 const labels=[];if(n===1)HS.forEach(h=>labels.push((h%12||12)+(h<12?'am':'pm')));else for(let i=0;i<n;i+=bucket)labels.push(bucket===1?A.days[i].d.slice(5)+' '+WD[A.days[i].w]:A.days[i].d.slice(5));
 document.getElementById('tcap').textContent=n===1?'Hourly — sales through the day':bucket===1?'Daily · B aligned by day':bucket===7?'Weekly totals · B aligned by week':'30-day blocks';
 const ds=[{label:'A',data:bs(A),backgroundColor:App.colA(),borderRadius:6,borderSkipped:false,order:2}];
 if(B)ds.push({label:'B',data:bs(B),type:'line',borderColor:css('--b'),backgroundColor:css('--b'),borderWidth:2.5,pointRadius:bucket===1?2.5:0,pointHoverRadius:6,tension:.3,order:1});
 chart('cT',{type:'bar',data:{labels,datasets:ds},options:{scales:axes({yfmt:yf}),interaction:{mode:'index',intersect:false},plugins:{tooltip:tip(),legend:{display:!!B,labels:{usePointStyle:true,boxWidth:8,color:css('--mute')}}}}});
 const cs=Object.entries(A.cat).sort((a,b)=>b[1][0]-a[1][0]).slice(0,8),mx=cs.length?cs[0][1][0]:1;
 document.getElementById('cats').innerHTML=cs.map(([c,v])=>`<div style="margin:9px 0"><div style="display:flex;gap:8px;align-items:center;justify-content:space-between;font-size:13.5px"><span style="display:flex;gap:8px;align-items:center;color:var(--ink2)">${catIcon(+c,18)}${App.esc(D.cats[c])}</span><b>${(v[0]/A.sales*100).toFixed(1)}%</b></div><div class="bar-row" style="grid-template-columns:1fr;margin:4px 0 0"><div class="t"><i data-w="${v[0]/mx*100}"></i></div></div></div>`).join('');
 requestAnimationFrame(()=>document.querySelectorAll('#cats .t i').forEach(i=>i.style.width=i.dataset.w+'%'));
 const hs=[];for(let h=9;h<=22;h++)hs.push(h);
 const hd=[{label:'A',data:hs.map(h=>A.hr[h][idx]),backgroundColor:App.colA(),borderRadius:6,borderSkipped:false}];if(B)hd.push({label:'B',data:hs.map(h=>B.hr[h][idx]),backgroundColor:App.colB(),borderRadius:6,borderSkipped:false});
 chart('cH',{type:'bar',data:{labels:hs.map(h=>(h%12||12)+(h<12?'am':'pm')),datasets:hd},options:{scales:axes({yfmt:yf}),plugins:{tooltip:tip()}}});
 const av=o=>WD.map((_,w)=>o.wd[w][2]?o.wd[w][idx]/o.wd[w][2]:0);
 const wd=[{label:'A',data:av(A),backgroundColor:App.colA(),borderRadius:6,borderSkipped:false}];if(B)wd.push({label:'B',data:av(B),backgroundColor:App.colB(),borderRadius:6,borderSkipped:false});
 chart('cW',{type:'bar',data:{labels:WD,datasets:wd},options:{scales:axes({yfmt:yf}),plugins:{tooltip:tip()}}});
 const rows=Object.entries(A.grp).map(([g,v])=>({k:+g,q:v[1],a:v[0],b:B&&B.grp[g]?B.grp[g][0]:0})).sort((x,y)=>y.a-x.a).slice(0,10);
 table('tp',{sort:'a',rows,onRow:r=>App.openGroup(r.k),cols:[
  {k:'n',t:'Product',s:r=>D.groups[r.k][0],str:1,cls:'l',f:(_,r)=>{const G=D.groups[r.k];return `<div class="pn">${App.grpIcon(r.k,34)}<div><b>${App.esc(G[0])}</b><small>${App.esc(D.siteCats[G[1]])} · ${App.rateTxt(r.k)}</small></div></div>`}},
  {k:'q',t:'Units',f:inr},{k:'a',t:'Sales',f:rs,bar:1},...(B?[{k:'b',t:'B sales',f:rs},{k:'d',t:'Δ',s:r=>r.b?(r.a-r.b)/r.b*100:1e9,f:(v,r)=>r.b?pill(r.a,r.b):'<span class="pill nu">new</span>'}]:[])]});
 const t=D.stockTypes;let pos=0,neg=0,negv=0,posv=0;for(const k in t){pos+=t[k][1];neg+=t[k][3];posv+=t[k][2];negv+=t[k][4]}
 const ni=D.items.filter(i=>i[F.net]<0).length,si=D.items.filter(i=>i[F.instock]).length;
 document.getElementById('sh').innerHTML=`<div class="two"><div class="k"><div class="l">Net units</div><div class="v">${inr(pos+neg)}</div><div class="c">${inr(si)} items</div></div><div class="k neg"><div class="l">Negative units</div><div class="v neg">${inr(neg)}</div><div class="c">${rs(negv)} at MRP</div></div></div>
 <div style="margin:14px 0 6px;font-size:13px;color:var(--ink2)">Positive stock ${rs(posv)} at MRP · ${inr(pos)} units</div>
 <div class="bar-row" style="grid-template-columns:1fr"><div class="t"><i data-w="${pos/(pos-neg)*100}"></i></div></div>
 <div class="note"><b>${inr(ni)}</b> items (${(ni/si*100).toFixed(0)}% of the stock list) are net-negative — mostly batches migrated from Vyapar and goods billed before they were stocked in. <a href="stock.html" style="color:var(--a)">Open Stock Health →</a></div>`;
 requestAnimationFrame(()=>document.querySelectorAll('#sh .t i').forEach(i=>i.style.width=i.dataset.w+'%'));
}});
