// Profit (estimate)
const {rs,rsf,inr,pill,pc,kpis,chart,axes,tip,D,F,css,S,table,openItem,esc,catIcon,prodImg,MG,mg,setMargin,exTax}=App;
const LO=30,HI=40;
const BANNER=`<div class="card rv" style="margin-bottom:16px;border-left:4px solid var(--warn)"><b>Estimate, not accounting.</b> RPOS has no real purchase cost (its purchase price is just 80% or 50% of MRP). Everything on this page applies <b>your own margin assumption</b> — default <b>35%</b> (your 30–40% range) on sales <b>excluding GST</b>. Change the margin below and every number updates.</div>`;
// monthly ex-tax by category (all time)
const MC={};{const months=[];let c=App.FIRST.slice(0,7);while(c<=App.LAST.slice(0,7)){months.push(c);c=App.addMonths(c,1)}const mi={};months.forEach((m,i)=>mi[m]=i);
 MC.months=months;MC.cat=D.cats.map(()=>new Array(months.length).fill(0));MC.bills=new Array(months.length).fill(0);MC.days=new Array(months.length).fill(0);
 D.itemday.forEach(r=>{const it=D.items[r[1]];MC.cat[it[F.cat]][mi[App.dates[r[0]].slice(0,7)]]+=exTax(it,r[3])});
 App.dates.forEach((d,i)=>{MC.bills[mi[d.slice(0,7)]]+=D.daily[i][0];MC.days[mi[d.slice(0,7)]]++})}
App.page({title:'Profit (estimate)',sub:'Gross profit estimated from your 30–40% margin, on sales excluding GST',show:false,
build(){return BANNER+`<div class="card rv" style="margin-bottom:16px"><div class="ch"><div><h2>Margin assumption</h2><div class="cap">Default for all categories, with optional overrides. Saved in this browser.</div></div></div>
 <div class="tools" style="align-items:flex-end"><label style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--mute);display:flex;flex-direction:column;gap:3px">Default margin % <input id="mdef" type="number" min="1" max="80" step="0.5" style="width:120px"></label>
 <div class="seg"><button data-p="30">30%</button><button data-p="35">35%</button><button data-p="40">40%</button></div><span class="mute" style="font-size:13px">Low / high band shown elsewhere uses ${LO}% and ${HI}%.</span></div>
 <div class="ins" id="mcat" style="margin-top:12px"></div></div>
<div class="kpis" id="kp"></div>
<div class="grid">
 <div class="card s8 rv"><div class="ch"><div><h2>Estimated gross profit by month</h2><div class="cap">All history · bar = at your margin, dashed lines = ${LO}% and ${HI}% band</div></div></div><div class="tk" id="t1"></div><div class="pl t"><canvas id="cM"></canvas></div></div>
 <div class="card s4 rv"><div class="ch"><div><h2>Where profit comes from</h2><div class="cap">Share of est. profit · period A</div></div></div><div id="cs"></div></div>
 <div class="card s7 rv"><div class="ch"><div><h2>Profit by category</h2><div class="cap">Period A · sales excl. GST × category margin</div></div></div><div class="scroll"><table id="tc"></table></div></div>
 <div class="card s5 rv"><div class="ch"><div><h2>Cash tied up in stock (estimated at cost)</h2><div class="cap">Stock as of ${D.meta.stockAsof}, MRP excl. GST × (1 − margin)</div></div></div><div class="tk" id="t2"></div><div id="inv"></div></div>
 <div class="card s12 rv"><div class="ch"><div><h2>Top profit-making products</h2><div class="cap">Period A · click a row for detail</div></div></div><div class="scroll t"><table id="tp"></table></div></div>
</div>`},
update(A,B){
 const mdef=document.getElementById('mdef');mdef.value=MG.def;
 const apply=()=>{App.cur._run(true)};
 mdef.onchange=()=>{const v=Math.max(1,Math.min(80,+mdef.value||35));setMargin(v);apply()};
 document.querySelectorAll('[data-p]').forEach(b=>{b.classList.toggle('on',+b.dataset.p===MG.def&&!Object.keys(MG.cat).length);b.onclick=()=>{setMargin(+b.dataset.p,{});apply()}});
 document.getElementById('mcat').innerHTML=D.cats.map((c,i)=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px"><span style="color:var(--a)">${catIcon(i,20)}</span><span style="flex:1;font-size:13.5px">${esc(c)}</span><input data-c="${i}" type="number" min="1" max="80" step="0.5" value="${Math.round(mg(i)*1000)/10}" style="width:78px"><span class="mute">%</span></div>`).join('');
 document.querySelectorAll('#mcat input').forEach(inp=>inp.onchange=()=>{const cat=Object.assign({},MG.cat);cat[inp.dataset.c]=Math.max(1,Math.min(80,+inp.value||MG.def));setMargin(MG.def,cat);apply()});
 const blend=x=>x.ex?x.profit/x.ex*100:0;
 kpis(document.getElementById('kp'),[
  {l:'Sales excl. GST',v:x=>x.ex,f:rs,cls:'hl',sub:'of '+rs(A.sales)+' incl. GST'},
  {l:'Est. gross profit',v:x=>x.profit,f:rs,sub:rs(A.ex*LO/100)+' – '+rs(A.ex*HI/100)+' at 30–40%'},
  {l:'Blended margin',v:blend,f:v=>v.toFixed(1)+'%',neutral:true},
  {l:'Profit per bill',v:x=>x.bills?x.profit/x.bills:0,f:rsf},
  {l:'Profit per sale day',v:x=>x.trading?x.profit/x.trading:0,f:rs},
  {l:'Est. cost of goods sold',v:x=>x.ex-x.profit,f:rs,neutral:true}],A,B);
 // monthly
 const months=MC.months;const profit=months.map((_,i)=>MC.cat.reduce((s,a,c)=>s+a[i]*mg(c),0)),exm=months.map((_,i)=>MC.cat.reduce((s,a)=>s+a[i],0));
 const sel=new Set();[A.p,B&&B.p].forEach((p,pi)=>{if(!p)return;let c=p.s.slice(0,7);while(c<=p.e.slice(0,7)){sel.add(c+(pi?'b':'a'));c=App.addMonths(c,1)}});
 const col=months.map(m=>sel.has(m+'a')?css('--a'):sel.has(m+'b')?css('--b'):css('--c9'));
 chart('cM',{type:'bar',data:{labels:months,datasets:[{label:'Est. gross profit',data:profit,backgroundColor:col,borderRadius:6,borderSkipped:false,order:2},{label:'at '+LO+'%',type:'line',data:exm.map(x=>x*LO/100),borderColor:css('--ink2'),borderDash:[4,4],borderWidth:1.4,pointRadius:0,order:1},{label:'at '+HI+'%',type:'line',data:exm.map(x=>x*HI/100),borderColor:css('--ink2'),borderDash:[4,4],borderWidth:1.4,pointRadius:0,order:1}]},options:{scales:axes({yfmt:rs}),plugins:{tooltip:tip(rs),legend:{display:true,labels:{usePointStyle:true,boxWidth:8,color:css('--ink2')}}}}});
 const last12=profit.slice(-13,-1).reduce((s,x)=>s+x,0);
 document.getElementById('t1').innerHTML=`Over the last 12 full months estimated gross profit is about <b>${rs(last12)}</b> (${rs(exm.slice(-13,-1).reduce((s,x)=>s+x,0)*LO/100)} – ${rs(exm.slice(-13,-1).reduce((s,x)=>s+x,0)*HI/100)} at 30–40%). Since go-live: <b>${rs(profit.reduce((s,x)=>s+x,0))}</b>.`;
 // by category
 const rows=Object.entries(A.cat).map(([c,v])=>({c:+c,n:D.cats[c],ex:v[3],m:mg(+c)*100,p:v[3]*mg(+c),q:v[1],b:B&&B.cat[c]?B.cat[c][3]*mg(+c):0})).sort((a,b)=>b.p-a.p);
 const tp=rows.reduce((s,r)=>s+r.p,0)||1,mx=rows.length?rows[0].p:1;
 document.getElementById('cs').innerHTML=rows.slice(0,8).map(r=>`<div style="margin:9px 0"><div style="display:flex;gap:8px;align-items:center;justify-content:space-between;font-size:13.5px"><span style="display:flex;gap:8px;align-items:center;color:var(--ink2)">${catIcon(r.c,18)}${esc(r.n)}</span><b>${(r.p/tp*100).toFixed(1)}%</b></div><div class="bar-row" style="grid-template-columns:1fr;margin:4px 0 0"><div class="t"><i data-w="${r.p/mx*100}"></i></div></div></div>`).join('');
 requestAnimationFrame(()=>document.querySelectorAll('#cs .t i').forEach(i=>i.style.width=i.dataset.w+'%'));
 table('tc',{sort:'p',rows,cols:[{k:'n',t:'Category',str:1,cls:'l',f:(_,r)=>`<span style="display:flex;gap:10px;align-items:center">${catIcon(r.c,20)}${esc(r.n)}</span>`},{k:'ex',t:'Sales excl. GST',f:rs},{k:'m',t:'Margin',f:v=>v.toFixed(0)+'%'},{k:'p',t:'Est. profit',f:rs,bar:1},{k:'sh',t:'Share',s:r=>r.p/tp*100,f:v=>v.toFixed(0)+'%'},...(B?[{k:'b',t:'B profit',f:rs},{k:'d',t:'Δ',s:r=>r.b?(r.p-r.b)/r.b*100:1e9,f:(v,r)=>r.b?pill(r.p,r.b):'<span class="pill nu">new</span>'}]:[])]});
 // inventory at cost
 let posEx=0,posCost=0,deadCost=0,overCost=0;const asof=App.tms(D.meta.stockAsof);
 const sold180=new Set(),v90={};D.itemday.forEach(r=>{const d=App.dates[r[0]];if(d>D.meta.stockAsof)return;const age=(asof-App.tms(d))/App.MS;if(age<180)sold180.add(r[1]);if(age<90)v90[r[1]]=(v90[r[1]]||0)+r[2]});
 D.items.forEach((it,k)=>{if(!it[F.instock]||it[F.posq]<=0)return;const ex=exTax(it,it[F.posq]*it[F.mrp]),cost=ex*(1-mg(it[F.cat]));posEx+=ex;posCost+=cost;if(!sold180.has(k))deadCost+=cost;const cv=v90[k]?it[F.net]/(v90[k]/90):null;if(cv&&cv>365)overCost+=cost});
 const cogs12=exm.slice(-13,-1).reduce((s,x)=>s+x,0)-last12,turns=posCost?cogs12/posCost:0;
 document.getElementById('inv').innerHTML=`<div class="two"><div class="k"><div class="l">Stock at cost (est.)</div><div class="v">${rs(posCost)}</div><div class="c">${rs(posEx)} at MRP excl. GST</div></div><div class="k warn"><div class="l">Dead stock at cost</div><div class="v">${rs(deadCost)}</div><div class="c">${(deadCost/posCost*100).toFixed(0)}% of stock — no sale in 180 days</div></div><div class="k"><div class="l">Overstock at cost</div><div class="v">${rs(overCost)}</div><div class="c">1+ year of cover</div></div><div class="k"><div class="l">Stock turns / year</div><div class="v">${turns.toFixed(1)}×</div><div class="c">12-month COGS ÷ stock at cost</div></div></div><div class="note">Negative stock is ignored here (only positive stock is counted), so true stock value is uncertain until the negatives are cleaned up.</div>`;
 document.getElementById('t2').innerHTML=`About <b>${rs(deadCost)}</b> of cash sits in items that have not sold for 6 months. Gross profit earned per ₹1 of stock held ≈ <b>₹${posCost?(last12/posCost).toFixed(2):'—'}</b> a year.`;
 // top products
 const items=Object.entries(A.items).map(([k,v])=>{const it=D.items[k],ex=exTax(it,v[1]);return {k:+k,it,q:v[0],a:v[1],ex,m:mg(it[F.cat])*100,p:ex*mg(it[F.cat])}}).sort((a,b)=>b.p-a.p);
 table('tp',{sort:'p',rows:items,limit:50,foot:true,onRow:r=>openItem(r.k),cols:[{k:'n',t:'Product',str:1,s:r=>r.it[F.name],cls:'l',f:(_,r)=>`<div class="pn">${prodImg(r.it,34)}<div><b>${esc(r.it[F.name])}</b><small>${esc(D.cats[r.it[F.cat]])}</small></div></div>`},{k:'q',t:'Units',f:inr},{k:'a',t:'Sales',f:rs},{k:'ex',t:'Excl. GST',f:rs},{k:'m',t:'Margin',f:v=>v.toFixed(0)+'%'},{k:'p',t:'Est. profit',f:rs,bar:1}]});
}});
