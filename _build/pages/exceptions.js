// Exceptions & Audit
const {rs,inr,pill,pc,kpis,chart,axes,tip,WD,D,css,table}=App;
// billing series per month (all time)
const SM={};App.dates.forEach((d,i)=>{const k=d.slice(0,7),o=SM[k]||(SM[k]=[0,0]);o[0]+=D.daily[i][0]-D.daily[i][4];o[1]+=D.daily[i][4]});
App.page({title:'Exceptions & Audit',sub:'Voids, returns, deletions, discounts and unusual opening hours — things worth a second look',show:false,
build(){return `<div class="kpis" id="kp"></div>
<div class="grid">
 <div class="card s8 rv"><div class="ch"><div><h2>Void entries per day</h2><div class="cap">Items or bills cancelled at the counter (INV_VOID log)</div></div></div><div class="tk" id="t1"></div><div class="pl"><canvas id="cV"></canvas></div></div>
 <div class="card s4 rv"><div class="ch"><div><h2>Voids by hour</h2><div class="cap">All history</div></div></div><div class="tk" id="t2"></div><div class="pl"><canvas id="cVH"></canvas></div></div>
 <div class="card s6 rv"><div class="ch"><div><h2>Discount given per day</h2></div></div><div class="tk" id="t3"></div><div class="pl"><canvas id="cD"></canvas></div></div>
 <div class="card s6 rv"><div class="ch"><div><h2>Bills with a discount</h2><div class="cap">Share of bills each day</div></div></div><div class="pl"><canvas id="cDB"></canvas></div></div>
 <div class="card s6 rv"><div class="ch"><div><h2>Stock lines deleted after billing</h2><div class="cap">deleted_med_stock_sale — per day</div></div></div><div class="pl s"><canvas id="cX"></canvas></div></div>
 <div class="card s6 rv"><div class="ch"><div><h2>Bills outside normal hours</h2><div class="cap">Before 10 am or at/after 10 pm — per day</div></div></div><div class="pl s"><canvas id="cO"></canvas></div></div>
 <div class="card s6 rv"><div class="ch"><div><h2>Days with the most voids</h2></div></div><div class="scroll"><table id="tv"></table></div></div>
 <div class="card s6 rv"><div class="ch"><div><h2>Sale returns</h2><div class="cap">Returns are rare — a handful in the whole history</div></div></div><div class="scroll"><table id="tr"></table></div></div>
 <div class="card s12 rv"><div class="ch"><div><h2>Billing series over time</h2><div class="cap">All history · bills per month by the series stamped on each bill</div></div></div><div class="tk" id="t4"></div><div class="pl s"><canvas id="cSer"></canvas></div>
  <div class="note">Series 3 was the active setting from 15 Feb to 12 Nov 2024 (bill numbers continued without a break). It is not a separate counter; both series are included in every total on this dashboard.</div></div>
</div>`},
update(A,B){
 const cnt=v=>Number.isInteger(v)?inr(v):'';const odd=o=>o.hr[9][1]+o.hr[22][1]+(o.hr[0]?0:0);
 kpis(document.getElementById('kp'),[
  {l:'Void entries',v:x=>x.voids,f:inr,cls:'hl',neutral:true,lower:true,sub:(A.voids/(A.bills||1)*100).toFixed(1)+' per 100 bills · '+inr(A.voidLines)+' lines'},
  {l:'Sale returns',v:x=>x.ret,f:inr,lower:true,neutral:true,sub:rs(A.retAmt)},{l:'Lines deleted after billing',v:x=>x.dms,f:inr,neutral:true,lower:true},
  {l:'Discount given',v:x=>x.disc,f:rs,neutral:true,lower:true,sub:(A.disc/(A.sales||1)*100).toFixed(2)+'% of sales'},{l:'Bills with a discount',v:x=>x.discBills/(x.bills||1)*100,f:v=>v.toFixed(1)+'%',neutral:true,lower:true},
  {l:'Bills outside 10am–10pm',v:odd,f:inr,neutral:true,lower:true}],A,B);
 const lab=A.days.map(d=>d.d.slice(5)+' '+WD[d.w]),type=A.n>45?'line':'bar';
 const day=(id,f,fmt,c)=>chart(id,{type,data:{labels:lab,datasets:[{label:'A',data:A.days.map(f),backgroundColor:c,borderColor:c,borderWidth:2,borderRadius:4,pointRadius:0,tension:.25}]},options:{scales:axes({yfmt:fmt}),plugins:{tooltip:tip(fmt)}}});
 day('cV',d=>d.i<0?0:D.void.n[d.i],cnt,css('--a'));day('cD',d=>d.i<0?0:D.daily[d.i][3],rs,css('--c2'));
 day('cDB',d=>d.i<0||!D.daily[d.i][0]?0:D.daily[d.i][6]/D.daily[d.i][0]*100,v=>v.toFixed(1)+'%',css('--c4'));day('cX',d=>d.i<0?0:D.dms[d.i],cnt,css('--c7'));
 day('cO',d=>d.i<0?0:((D.hourly[d.i][9]||[0])[0]+(D.hourly[d.i][22]||[0])[0]),cnt,css('--c3'));
 const vd=A.days.map(d=>d.i<0?0:D.void.n[d.i]),mx=Math.max(...vd,0),mi=vd.indexOf(mx);
 document.getElementById('t1').innerHTML=A.voids?`<b>${inr(A.voids)}</b> void entries (${(A.voids/(A.bills||1)*100).toFixed(1)} per 100 bills). Worst day: <b>${mx?A.days[mi].d:'—'}</b> with ${mx}.`:'No voids in this period.';
 const vh=D.void.h,hs=[];for(let h=9;h<=22;h++)hs.push(h);
 chart('cVH',{type:'bar',data:{labels:hs.map(h=>(h%12||12)+(h<12?'a':'p')),datasets:[{label:'Voids',data:hs.map(h=>vh[h]),backgroundColor:App.colA(),borderRadius:5,borderSkipped:false}]},options:{scales:axes({yfmt:inr}),plugins:{tooltip:tip(inr)}}});
 const vt=vh.reduce((s,x)=>s+x,0),pk=vh.indexOf(Math.max(...vh));document.getElementById('t2').innerHTML=`Most voids happen at <b>${pk%12||12}${pk<12?'am':'pm'}</b> — the busiest hours (${(vh[pk]/vt*100).toFixed(0)}% of voids).`;
 document.getElementById('t3').innerHTML=A.disc?`<b>${rs(A.disc)}</b> in discounts (${(A.disc/A.sales*100).toFixed(2)}% of sales) across <b>${inr(A.discBills)}</b> bills.`:'No discounts in this period.';
 const sk=Object.keys(SM);chart('cSer',{type:'bar',data:{labels:sk,datasets:[{label:'Series 1',data:sk.map(k=>SM[k][0]),backgroundColor:css('--a'),stack:'s',borderColor:css('--card'),borderWidth:1.5},{label:'Series 3',data:sk.map(k=>SM[k][1]),backgroundColor:css('--c1'),stack:'s',borderColor:css('--card'),borderWidth:1.5}]},options:{scales:Object.assign(axes({yfmt:inr}),{x:{stacked:true,grid:{display:false},border:{display:false},ticks:{color:css('--mute'),maxRotation:0,autoSkip:true}},y:{stacked:true,grid:{color:css('--line')},border:{display:false},ticks:{color:css('--mute'),callback:inr},beginAtZero:true}}),plugins:{legend:{display:true,labels:{usePointStyle:true,boxWidth:8,color:css('--ink2')}},tooltip:tip(inr)}}});
 document.getElementById('t4').innerHTML='<b>Series 3</b> carried every bill from <b>15 Feb 2024</b> until <b>12 Nov 2024</b>, then the setting returned to series 1. Bill numbers ran on without a gap.';
 const vr=A.days.filter(d=>d.i>=0&&D.void.n[d.i]).map(d=>({d:d.d,w:WD[d.w],v:D.void.n[d.i],l:D.void.l[d.i],b:d.b,r:D.void.n[d.i]/d.b*100}));
 table('tv',{sort:'v',rows:vr,limit:10,cols:[{k:'d',t:'Date',str:1},{k:'w',t:'Day',str:1},{k:'v',t:'Voids',bar:1},{k:'l',t:'Lines'},{k:'b',t:'Bills'},{k:'r',t:'Per 100 bills',f:v=>v.toFixed(1)}]});
 const allRet=[];D.ret.forEach((r,i)=>{if(r[0])allRet.push({d:App.dates[i],n:r[0],a:r[1]})});
 table('tr',{sort:'d',rows:allRet,cols:[{k:'d',t:'Date',str:1},{k:'n',t:'Returns'},{k:'a',t:'Value',f:rs}],foot:'whole history'});
}});
