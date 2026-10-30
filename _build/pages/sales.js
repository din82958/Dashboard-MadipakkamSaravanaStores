// Sales Trends
const {rs,inr,pill,pc,kpis,chart,axes,tip,WD,MON,table,D,css,S}=App;
// all-time monthly series
const M={};App.dates.forEach((d,i)=>{const k=d.slice(0,7),x=M[k]||(M[k]={m:k,bills:0,sales:0,units:0,days:0});x.bills+=D.daily[i][0];x.sales+=D.daily[i][1];x.units+=D.daily[i][2];x.days++});
const MS_=Object.values(M);MS_.forEach((x,i)=>{x.avg=x.sales/x.bills;x.perday=x.sales/x.days;x.mom=i?pc(x.perday,MS_[i-1].perday):null;const p=M[App.addMonths(x.m,-12)];x.yoy=p?pc(x.perday,p.perday):null});
const full=MS_.filter(x=>x.days>=25);// months with enough sale days for fair comparison
let gran='auto';
function selectMonth(m){S.mode='month';S.a=App.monthRange(m);S.preset='';S.b=null;App.cur._run(true);window.scrollTo({top:0,behavior:'smooth'})}
App.page({title:'Sales Trends',sub:'How sales have moved day by day, month by month, year on year',show:true,
build(){return `<div class="kpis" id="kp"></div>
<div class="grid">
 <div class="card s12 rv"><div class="ch"><div><h2>Sales over the selected period</h2><div class="cap" id="cap1"></div></div><div class="sp"></div>
  <div class="seg" id="gseg"><button data-g="auto">Auto</button><button data-g="1">Daily</button><button data-g="7">Weekly</button><button data-g="30">Monthly</button></div></div><div class="tk" id="tk1"></div><div class="pl t"><canvas id="cT"></canvas></div></div>
 <div class="card s6 rv"><div class="ch"><div><h2>Cumulative sales</h2><div class="cap">Running total through the period — A vs B</div></div></div><div class="pl"><canvas id="cCum"></canvas></div></div>
 <div class="card s6 rv"><div class="ch"><div><h2>Sales by day of month</h2><div class="cap">Average per sale day — salary days and month-end effect</div></div></div><div class="pl"><canvas id="cDom"></canvas></div></div>
 <div class="card s12 rv"><div class="ch"><div><h2>Every month since go-live</h2><div class="cap">Click a bar to open that month. Months with under 25 sale days are shown lighter.</div></div></div><div class="pl t"><canvas id="cM"></canvas></div></div>
 <div class="card s6 rv"><div class="ch"><div><h2>Bills per month</h2></div></div><div class="pl s"><canvas id="cMB"></canvas></div></div>
 <div class="card s6 rv"><div class="ch"><div><h2>Average bill per month</h2></div></div><div class="pl s"><canvas id="cMA"></canvas></div></div>
 <div class="card s7 rv"><div class="ch"><div><h2>Year on year</h2><div class="cap">Monthly sales, one line per year</div></div></div><div class="pl"><canvas id="cY"></canvas></div></div>
 <div class="card s5 rv"><div class="ch"><div><h2>Month-on-month growth</h2><div class="cap">Change in sales per sale day</div></div></div><div class="pl"><canvas id="cG"></canvas></div></div>
 <div class="card s5 rv"><div class="ch"><h2>Yearly summary</h2></div><table id="ty"></table><div class="note">2024 starts 13 Feb (go-live); 2026 runs to ${App.LAST}.</div></div>
 <div class="card s7 rv"><div class="ch"><div><h2>Month by month</h2><div class="cap">MoM and YoY compare sales per sale day. Click a row to open that month</div></div></div><div class="scroll t"><table id="tm"></table></div></div>
 <div class="card s6 rv"><div class="ch"><h2>Best days in period A</h2></div><div class="scroll"><table id="tb"></table></div></div>
 <div class="card s6 rv"><div class="ch"><h2>Slowest sale days in period A</h2></div><div class="scroll"><table id="tw"></table></div></div>
</div>`},
update(A,B){
 const sh=S.show,yf=sh==='sales'?rs:inr,val=o=>sh==='sales'?o.s:o.b;
 const best=A.days.reduce((m,x)=>x.s>m.s?x:m,{s:0});
 kpis(document.getElementById('kp'),[
  {l:'Net sales',v:x=>x.sales,f:rs,cls:'hl',sp:x=>x.days.map(d=>d.s)},{l:'Bills',v:x=>x.bills,f:inr,sp:x=>x.days.map(d=>d.b)},
  {l:'Sales per sale day',v:x=>x.trading?x.sales/x.trading:0,f:rs},{l:'Best day',v:x=>x.days.reduce((m,d)=>Math.max(m,d.s),0),f:rs,sub:best.s?best.d+' · '+WD[best.w]:''},
  {l:'Sale days',v:x=>x.trading,f:inr,sub:'of '+A.n+' calendar days',neutral:true},{l:'Closed / no-bill days',v:x=>x.n-x.trading,f:inr,neutral:true,lower:true}],A,B);
 // trend
 document.querySelectorAll('#gseg [data-g]').forEach(b=>{b.classList.toggle('on',b.dataset.g===gran);b.onclick=()=>{gran=b.dataset.g;App.cur._run(true)}});
 const n=A.n,bucket=gran==='auto'?(n>400?30:n>62?7:1):+gran;
 const HS=[9,10,11,12,13,14,15,16,17,18,19,20,21,22],hidx=sh==='sales'?0:1;const bs=o=>{if(!o)return null;if(n===1)return HS.map(h=>o.hr[h][hidx]);const r=[];for(let i=0;i<n;i+=bucket){let t=0;for(let j=i;j<Math.min(i+bucket,n);j++)t+=o.days[j]?val(o.days[j]):0;r.push(t)}return r};
 const a=bs(A),labels=[];if(n===1)HS.forEach(h=>labels.push((h%12||12)+(h<12?'am':'pm')));else for(let i=0;i<n;i+=bucket)labels.push(bucket===1?A.days[i].d.slice(5)+' '+WD[A.days[i].w]:A.days[i].d.slice(5));
 // 7-point moving average
 const ma=a.map((_,i)=>{const w=a.slice(Math.max(0,i-6),i+1);return w.reduce((s,x)=>s+x,0)/w.length});
 document.getElementById('cap1').textContent=(n===1?'Hourly through the day':bucket===1?'Daily':bucket===7?'Weekly totals':'30-day blocks')+(B?' · B aligned by position':'');
 const d=B?pc(A.sales,B.sales):null;
 document.getElementById('tk1').innerHTML=`<b>${rs(A.sales)}</b> over ${A.n} days${B&&d!==null?` — <b>${d>=0?'+':''}${d.toFixed(1)}%</b> against ${App.label(B.p)} (${rs(B.sales)})`:''}. Peak: <b>${best.s?best.d+' ('+rs(best.s)+')':'—'}</b>.`;
 const ds=[{label:'A',data:a,backgroundColor:App.colA(),borderRadius:5,borderSkipped:false,order:3}];
 if(bucket===1&&n>14)ds.push({label:'7-day average',data:ma,type:'line',borderColor:css('--ink'),borderWidth:1.6,pointRadius:0,tension:.35,borderDash:[5,4],order:2});
 if(B)ds.push({label:'B',data:bs(B),type:'line',borderColor:css('--b'),backgroundColor:css('--b'),borderWidth:2.5,pointRadius:bucket===1?2.5:0,pointHoverRadius:6,tension:.3,order:1});
 chart('cT',{type:'bar',data:{labels,datasets:ds},options:{scales:axes({yfmt:yf}),interaction:{mode:'index',intersect:false},plugins:{tooltip:tip(),legend:{display:ds.length>1,labels:{usePointStyle:true,boxWidth:8,color:css('--mute')}}}}});
 // cumulative
 const cum=o=>{let t=0;return o.days.map(x=>t+=val(x))};
 const cds=[{label:'A',data:cum(A),borderColor:css('--a'),backgroundColor:css('--a')+'22',fill:true,borderWidth:2.5,pointRadius:0,tension:.2}];
 if(B)cds.push({label:'B',data:cum(B),borderColor:css('--b'),borderWidth:2.5,pointRadius:0,tension:.2,borderDash:[6,4]});
 chart('cCum',{type:'line',data:{labels:A.days.map((x,i)=>'Day '+(i+1)),datasets:cds},options:{scales:axes({yfmt:yf}),interaction:{mode:'index',intersect:false},plugins:{tooltip:tip(),legend:{display:!!B,labels:{usePointStyle:true,boxWidth:8,color:css('--mute')}}}}});
 // day of month
 const di_=sh==='sales'?0:1;
 chart('cDom',{type:'bar',data:{labels:A.dom.map((_,i)=>i+1),datasets:[{label:'A',data:A.dom.map(x=>x[2]?x[di_]/x[2]:0),backgroundColor:App.colA(),borderRadius:4,borderSkipped:false}].concat(B?[{label:'B',data:B.dom.map(x=>x[2]?x[di_]/x[2]:0),backgroundColor:App.colB(),borderRadius:4,borderSkipped:false}]:[])},options:{scales:axes({yfmt:yf}),plugins:{tooltip:tip()}}});
 // monthly
 const sel=new Set();[A.p,B&&B.p].forEach((p,pi)=>{if(!p)return;let c=p.s.slice(0,7);while(c<=p.e.slice(0,7)){sel.add(c+(pi?'b':'a'));c=App.addMonths(c,1)}});
 const colr=MS_.map(x=>{const base=sel.has(x.m+'a')?css('--a'):sel.has(x.m+'b')?css('--b'):css('--c9');return x.days>=25||sel.has(x.m+'a')||sel.has(x.m+'b')?base:base+'88'});
 const click=(e,els)=>{if(els.length)selectMonth(MS_[els[0].index].m)};
 const hov=(e,els)=>{e.native.target.style.cursor=els.length?'pointer':'default'};
 chart('cM',{type:'bar',data:{labels:MS_.map(x=>x.m),datasets:[{label:'Sales',data:MS_.map(x=>x.sales),backgroundColor:colr,borderRadius:6,borderSkipped:false}]},options:{scales:axes({yfmt:rs}),plugins:{tooltip:{callbacks:{label:c=>' Sales '+rs(c.parsed.y)+' · '+MS_[c.dataIndex].days+' sale days · '+rs(MS_[c.dataIndex].perday)+'/day'}}},onClick:click,onHover:hov}});
 chart('cMB',{type:'bar',data:{labels:MS_.map(x=>x.m),datasets:[{label:'Bills',data:MS_.map(x=>x.bills),backgroundColor:css('--c1'),borderRadius:4,borderSkipped:false}]},options:{scales:axes({yfmt:inr}),plugins:{tooltip:tip(inr)},onClick:click,onHover:hov}});
 chart('cMA',{type:'line',data:{labels:MS_.map(x=>x.m),datasets:[{label:'Average bill',data:MS_.map(x=>x.avg),borderColor:css('--c3'),backgroundColor:css('--c3')+'22',fill:true,borderWidth:2.5,pointRadius:2,tension:.3}]},options:{scales:axes({yfmt:rs,y:{beginAtZero:false}}),plugins:{tooltip:tip(rs)}}});
 // yoy lines
 const years=[...new Set(MS_.map(x=>x.m.slice(0,4)))];
 chart('cY',{type:'line',data:{labels:MON,datasets:years.map((y,i)=>({label:y,data:MON.map((_,mi)=>{const x=M[y+'-'+String(mi+1).padStart(2,'0')];return x&&x.days>=25?x.sales:null}),borderColor:css('--c'+(i+1)),backgroundColor:css('--c'+(i+1)),borderWidth:2.5,pointRadius:3,tension:.25,spanGaps:false}))},options:{scales:axes({yfmt:rs}),interaction:{mode:'index',intersect:false},plugins:{tooltip:tip(rs),legend:{display:true,labels:{usePointStyle:true,boxWidth:8,color:css('--ink2')}}}}});
 const fm=MS_.filter(x=>x.days>=25&&x.mom!==null);
 chart('cG',{type:'bar',data:{labels:fm.map(x=>x.m),datasets:[{label:'MoM %',data:fm.map(x=>x.mom),backgroundColor:fm.map(x=>x.mom>=0?css('--pos'):css('--neg')),borderRadius:3}]},options:{scales:axes({yfmt:v=>v+'%',y:{beginAtZero:true}}),plugins:{tooltip:tip(v=>v.toFixed(1)+'%')}}});
 // tables
 const Y={};MS_.forEach(x=>{const y=x.m.slice(0,4),o=Y[y]||(Y[y]={y,bills:0,sales:0,days:0});o.bills+=x.bills;o.sales+=x.sales;o.days+=x.days});
 const yr=Object.values(Y);yr.forEach((o,i)=>{o.avg=o.sales/o.bills;o.pd=o.sales/o.days;o.g=i?pc(o.pd,yr[i-1].pd):null});
 table('ty',{sort:'y',dir:1,rows:yr,cols:[{k:'y',t:'Year',str:1},{k:'bills',t:'Bills',f:inr},{k:'sales',t:'Sales',f:rs,bar:1},{k:'avg',t:'Avg bill',f:rs},{k:'pd',t:'Per day',f:rs},{k:'g',t:'Per-day Δ',s:r=>r.g??-1e9,f:(v,r)=>r.g===null?'—':`<span class="pill ${r.g>=0?'up':'dn'}">${r.g>=0?'▲':'▼'} ${Math.abs(r.g).toFixed(1)}%</span>`}]});
 table('tm',{sort:'m',rows:MS_,onRow:r=>selectMonth(r.m),cols:[{k:'m',t:'Month',str:1},{k:'days',t:'Days'},{k:'bills',t:'Bills',f:inr},{k:'sales',t:'Sales',f:rs,bar:1},{k:'avg',t:'Avg bill',f:rs},{k:'perday',t:'Per day',f:rs},
  {k:'mom',t:'MoM',s:r=>r.mom??-1e9,f:(v,r)=>r.mom===null?'—':`<span class="pill ${r.mom>=0?'up':'dn'}">${r.mom>=0?'▲':'▼'} ${Math.abs(r.mom).toFixed(0)}%</span>`},
  {k:'yoy',t:'YoY',s:r=>r.yoy??-1e9,f:(v,r)=>r.yoy===null?'—':`<span class="pill ${r.yoy>=0?'up':'dn'}">${r.yoy>=0?'▲':'▼'} ${Math.abs(r.yoy).toFixed(0)}%</span>`}]});
 const dd=A.days.filter(x=>x.b>0).map(x=>({d:x.d,w:WD[x.w],s:x.s,b:x.b,a:x.s/x.b}));
 const dc=[{k:'d',t:'Date',str:1},{k:'w',t:'Day',str:1},{k:'s',t:'Sales',f:rs,bar:1},{k:'b',t:'Bills'},{k:'a',t:'Avg bill',f:rs}];
 table('tb',{sort:'s',rows:dd,limit:10,cols:dc});table('tw',{sort:'s',dir:1,rows:dd,limit:10,cols:dc});
}});
