// Bills & Baskets
const {rs,inr,pc,pill,kpis,chart,axes,tip,WD,D,css,S,table}=App;
const BE=D.bandEdges,BL=['< ₹100','₹100–250','₹250–500','₹500–1,000','₹1,000–2,000','₹2,000–5,000','₹5,000+'];
const IL=['1 item','2 items','3 items','4–5','6–8','9–12','13+'];
const med=o=>{const tot=o.bands.slice(0,7).reduce((s,x)=>s+x,0)/2;let c=0;for(let i=0;i<7;i++){c+=o.bands[i];if(c>=tot){const lo=i?BE[i-1]:0,hi=i<6?BE[i]:lo*2,prev=c-o.bands[i];return lo+(hi-lo)*(tot-prev)/(o.bands[i]||1)}}return 0};
App.page({title:'Bills & Baskets',sub:'How big each bill is, how many items per bill, and the biggest bills',show:false,
build(){return `<div class="kpis" id="kp"></div>
<div class="grid">
 <div class="card s6 rv"><div class="ch"><div><h2>Bills by value band</h2><div class="cap">How many bills fall in each size</div></div></div><div class="tk" id="t1"></div><div class="pl"><canvas id="cB"></canvas></div></div>
 <div class="card s6 rv"><div class="ch"><div><h2>Where the money comes from</h2><div class="cap">Share of sales by bill size</div></div></div><div class="tk" id="t2"></div><div class="pl"><canvas id="cS"></canvas></div></div>
 <div class="card s6 rv"><div class="ch"><div><h2>Items per bill</h2><div class="cap">Distinct lines scanned on each bill</div></div></div><div class="tk" id="t3"></div><div class="pl"><canvas id="cI"></canvas></div></div>
 <div class="card s6 rv"><div class="ch"><div><h2>Average bill by weekday</h2></div></div><div class="pl"><canvas id="cWD"></canvas></div></div>
 <div class="card s6 rv"><div class="ch"><div><h2>Bills per day</h2><div class="cap">Daily footfall proxy (one bill ≈ one buying visit)</div></div></div><div class="pl"><canvas id="cBD"></canvas></div></div>
 <div class="card s6 rv"><div class="ch"><div><h2>Average bill per day</h2></div></div><div class="pl"><canvas id="cAD"></canvas></div></div>
 <div class="card s12 rv"><div class="ch"><div><h2>Biggest bills in period A</h2><div class="cap">From the 150 largest bills ever recorded</div></div></div><div class="scroll"><table id="tb"></table></div></div>
</div>`},
update(A,B){
 const sum=a=>a.reduce((s,x)=>s+x,0);
 const small=o=>sum(o.bands.slice(0,3))/(o.bills||1)*100, large=o=>sum(o.bands.slice(12,14))/(o.sales||1)*100;
 kpis(document.getElementById('kp'),[
  {l:'Bills',v:x=>x.bills,f:inr,cls:'hl',sp:x=>x.days.map(d=>d.b)},{l:'Average bill',v:x=>x.bills?x.sales/x.bills:0,f:rs,sp:x=>x.days.map(d=>d.b?d.s/d.b:0)},
  {l:'Typical (median) bill',v:med,f:rs},{l:'Items per bill',v:x=>x.bills?sum(x.ipb.map((c,i)=>c*[1,2,3,4.5,6.5,10,15][i]))/x.bills:0,f:v=>v.toFixed(1)},
  {l:'Bills under ₹500',v:small,f:v=>v.toFixed(0)+'%',neutral:true},{l:'Sales from bills ₹2,000+',v:x=>sum(x.bands.slice(12,14))/(x.sales||1)*100,f:v=>v.toFixed(0)+'%',neutral:true}],A,B);
 const pcts=(o,off)=>{const t=sum(o.bands.slice(off,off+7))||1;return o.bands.slice(off,off+7)};
 chart('cB',{type:'bar',data:{labels:BL,datasets:[{label:'A',data:A.bands.slice(0,7),backgroundColor:App.colA(),borderRadius:6,borderSkipped:false}].concat(B?[{label:'B',data:B.bands.slice(0,7),backgroundColor:App.colB(),borderRadius:6,borderSkipped:false}]:[])},options:{scales:axes({yfmt:inr}),plugins:{tooltip:tip(inr)}}});
 const bt=sum(A.bands.slice(0,7))||1,bs=sum(A.bands.slice(7,14))||1;
 document.getElementById('t1').innerHTML=`<b>${(sum(A.bands.slice(0,3))/bt*100).toFixed(0)}%</b> of bills are under ₹500; the typical bill is about <b>${rs(med(A))}</b>.`;
 const share=o=>{const t=sum(o.bands.slice(7,14))||1;return o.bands.slice(7,14).map(x=>x/t*100)};
 chart('cS',{type:'bar',data:{labels:BL,datasets:[{label:'A',data:share(A),backgroundColor:App.colA(),borderRadius:6,borderSkipped:false}].concat(B?[{label:'B',data:share(B),backgroundColor:App.colB(),borderRadius:6,borderSkipped:false}]:[])},options:{scales:axes({yfmt:v=>v+'%'}),plugins:{tooltip:tip(v=>v.toFixed(1)+'%')}}});
 document.getElementById('t2').innerHTML=`Bills of ₹2,000 or more are only <b>${(sum(A.bands.slice(5,7))/bt*100).toFixed(1)}%</b> of bills but <b>${(sum(A.bands.slice(12,14))/bs*100).toFixed(0)}%</b> of sales.`;
 const ip=o=>{const t=sum(o.ipb)||1;return o.ipb.map(x=>x/t*100)};
 chart('cI',{type:'bar',data:{labels:IL,datasets:[{label:'A',data:ip(A),backgroundColor:App.colA(),borderRadius:6,borderSkipped:false}].concat(B?[{label:'B',data:ip(B),backgroundColor:App.colB(),borderRadius:6,borderSkipped:false}]:[])},options:{scales:axes({yfmt:v=>v+'%'}),plugins:{tooltip:tip(v=>v.toFixed(1)+'%')}}});
 const it=sum(A.ipb)||1;document.getElementById('t3').innerHTML=`<b>${(A.ipb[0]/it*100).toFixed(0)}%</b> of bills are a single item; <b>${(sum(A.ipb.slice(4))/it*100).toFixed(0)}%</b> carry 6 or more different items.`;
 const aw=o=>WD.map((_,w)=>o.wd[w][1]?o.wd[w][0]/o.wd[w][1]:0);
 chart('cWD',{type:'bar',data:{labels:WD,datasets:[{label:'A',data:aw(A),backgroundColor:App.colA(),borderRadius:6,borderSkipped:false}].concat(B?[{label:'B',data:aw(B),backgroundColor:App.colB(),borderRadius:6,borderSkipped:false}]:[])},options:{scales:axes({yfmt:rs}),plugins:{tooltip:tip(rs)}}});
 const lab=A.days.map(d=>d.d.slice(5)+' '+WD[d.w]);
 const line=(f,fmt,id,c)=>chart(id,{type:A.n>45?'line':'bar',data:{labels:lab,datasets:[{label:'A',data:A.days.map(f),backgroundColor:c,borderColor:c,borderRadius:4,borderWidth:2,pointRadius:A.n>45?0:2,tension:.25,fill:false}]},options:{scales:axes({yfmt:fmt,y:{beginAtZero:true}}),plugins:{tooltip:tip(fmt)}}});
 line(d=>d.b,inr,'cBD',css('--c1'));line(d=>d.b?d.s/d.b:null,rs,'cAD',css('--c3'));
 const lo=A.p.s,hi=A.p.e;
 const big=D.big.filter(r=>r[0]>=lo&&r[0]<=hi).map(r=>({d:r[0],t:r[1],w:WD[App.wdIdx(r[0])],a:r[2],l:r[3],x:r[4]}));
 table('tb',{sort:'a',rows:big,limit:15,foot:'These come from the 150 biggest bills overall; narrow or widen the period to see more.',cols:[{k:'d',t:'Date',str:1},{k:'w',t:'Day',str:1},{k:'t',t:'Time',str:1},{k:'a',t:'Bill value',f:rs,bar:1},{k:'l',t:'Items'},{k:'x',t:'Discount',f:v=>v?rs(v):'—'}]});
 if(!big.length)document.getElementById('tb').innerHTML='<tbody><tr><td class="mute" style="padding:16px">No top-150 bills fall inside this period. Try a wider range.</td></tr></tbody>';
}});
