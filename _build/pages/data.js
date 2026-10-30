// Data Catalogue
const {inr,rs,D,F,table,esc,kpis,chart,axes,tip,css}=App;
const GROUPS=[['Sales & billing',/^(MED_BILL|Med_Tender|MED_STOCK_SALES|INV_VOID|deleted_med|DELETEDRECORDS|med_reprint|POST_TO_CRM|MED_TENDER)/i],['Items & stock',/^(med_item|Day_|Med_Barcode|MED_UOM|MED_ITEM)/i],['Reports & printing',/report|prn|print|PPT_|normaliz/i],['Menus & screens',/menu|screen|rsm_|function_key|ajax_view/i],['Sync & logs',/websync|sync|log|history|audit|trace|DBCC|nt_attempts|migrate|login/i],['Configuration',/config|rayconfig|custom_|setting|procedure|param|alert|template|edition|attrib|field/i]];
const grp=n=>{for(const [g,re] of GROUPS)if(re.test(n))return g;return 'Other / system'};
const cat=D.catalog.map(r=>({n:r[0],rows:r[1],cols:r[2],kb:r[3]/1024,g:grp(r[0])}));
const byName=Object.fromEntries(cat.map(r=>[r.n.toLowerCase(),r]));
const TABLES=[
 ['MED_BILL_HDR','One row per bill','Date & time, net amount, discount, tax, payment mode, line count, billing series','Sales, bills, hours, discounts'],
 ['MED_BILL_DTL','One row per scanned item on a bill','Item code, quantity, MRP, line amount, GST %, discount','Products, categories, price points, basket size'],
 ['Med_Tender_Dtl','Payment per bill (SA = sale, SR = return)','Amount and tender type — all cash in practice','Returns, payment mode'],
 ['MED_STOCK_SALES','Stock deducted for every sold line','Batch, qty, timestamp','Reconciliation of sales to stock'],
 ['med_item_hdr','Item master (about 16,100 items)','Name, MRP, tax, EAN barcode, created date','Names, creation dates, new-item tracking'],
 ['MED_ITEM_DTL','Batch / lot master','Batch no, opening qty, MRP, expiry','Batch types (OS, IM, SU)'],
 ['MED_ITEM_EANCODE','Barcode ↔ item','Only a small share of items have a real EAN','Scan coverage'],
 ['Day_item_stk_archive','Daily stock movement by item','Qty and value snapshots','Stock history'],
 ['INV_VOID_HDR / INV_VOID_DTL','Cancelled bills and lines','Timestamp, price, line','Void analysis'],
 ['deleted_med_stock_sale','Sale lines deleted after billing','Date, item','Audit'],
 ['Med_Barcode_Sticker','Barcode labels printed','Item, qty printed','Label history']];
const FIELDS=[
 ['MED_BILL_HDR','col 0','Bill id','High'],['MED_BILL_HDR','col 1 / col 78','Bill date / full timestamp (hour of day)','High'],['MED_BILL_HDR','col 10','Net bill amount (sums to ₹4.59 cr)','High'],['MED_BILL_HDR','col 9','Discount on bill','Medium'],['MED_BILL_HDR','col 14','Number of lines on the bill','High'],['MED_BILL_HDR','col 21 / 168','Billing series (1 or 3)','Medium — meaning of the setting unknown'],
 ['MED_BILL_DTL','col 0 / 1 / 2','Bill id / line no / item code','High'],['MED_BILL_DTL','col 6','Quantity sold','High'],['MED_BILL_DTL','col 9','Line amount incl. tax','High'],['MED_BILL_DTL','col 13','GST %','High'],
 ['Med_Tender_Dtl','col 3 / 14 / 22','Amount / SA-SR flag / date','High'],['Stock report CSV','all 72 columns','Has real headers: item, batch, MRP, current stock, tax…','High'],['Website feed','id','Item code → category, title, brand','High']];
App.page({title:'Data Catalogue',sub:'What data exists, where it comes from, how it was decoded, and what it cannot tell you',filters:false,
build(){return `<div class="kpis" id="kp"></div>
<div class="grid">
 <div class="card s12 rv"><div class="ch"><div><h2>Where the data comes from</h2></div></div>
  <div class="ins">
   <div><span class="h">GoFrugal RPOS-7 export</span>${D.meta.files.toLocaleString('en-IN')} table dumps (CSV without headers). ${inr(D.meta.empty)} are empty; about ${inr(D.meta.files-D.meta.empty)} hold data — mostly menus, print templates and settings. Roughly a dozen tables carry the real business.</div>
   <div><span class="h">Current stock report</span>The headed CSV exported from RPOS on ${D.meta.stockAsof} (26,785 batch rows). It gave the column meaning for stock and the net-stock check: 90,790 in − 69,411 negative = 21,379 units.</div>
   <div><span class="h">Website & Google feed</span>The Merchant Center feed (7,532 products) supplies the official 9 categories, display names and brands, matched on item code. Items missing from it are classified by name.</div>
   <div><span class="h">Vyapar import</span>Items and opening stock came from Vyapar on 13 Feb 2024. Sales history before go-live was not imported, so every sales figure starts that day.</div>
   <div><span class="h">Bank statements</span>66 IDFC FIRST Bank PDFs (fortnightly, 17 Feb 2024 → 29 Oct 2026) were read into 33,212 transactions. Every statement's debit and credit totals match the bank's own totals exactly. Used on the Bank & Cash Flow page.</div>
   <div><span class="h">Product grouping</span>Item names carry the rate ("Spoon Rs 18") and the same product exists at many rates. The website's cleaning rules strip the rate, fix spellings and merge them: 15,647 item codes become about 3,200 products, 1,455 of them with several rates.</div>
  </div></div>
 <div class="card s12 rv"><div class="ch"><div><h2>The tables that matter</h2><div class="cap">Row counts are live from the export</div></div></div><div class="scroll"><table id="tt"></table></div></div>
 <div class="card s7 rv"><div class="ch"><div><h2>How the columns were decoded</h2><div class="cap">The CSVs have no headers; each mapping was checked against totals</div></div></div><div class="scroll"><table id="tf"></table></div></div>
 <div class="card s5 rv"><div class="ch"><div><h2>Tables by purpose</h2><div class="cap">Data tables only (non-empty)</div></div></div><div class="pl"><canvas id="cG"></canvas></div></div>
 <div class="card s12 rv"><div class="ch"><div><h2>What this data cannot tell you</h2></div></div>
  <div class="ins">
   <div><span class="h">No real purchase cost</span>Purchase price in the item data is a formula, not a supplier price: 80% of MRP for about 80% of batches and 50% for most of the rest. Real margin cannot be measured, so the Profit page applies your own 30–40% margin assumption (default 35%) to sales excluding GST. The Bank & Cash Flow page cross-checks this using real payments to suppliers (about 29–42% over the full period). Both remain estimates until purchases are recorded.</div>
   <div><span class="h">No customers</span>Only 44 named customers exist. Bills are walk-in, so repeat-customer, loyalty or footfall-by-person analysis is not possible. Bills are the best proxy for visits.</div>
   <div><span class="h">No categories in the POS</span>All items sit in one department with blank brands. Categories and brands on this dashboard come from the website feed or are inferred from item names — shown as such.</div>
   <div><span class="h">Payments are all cash</span>Every bill but one is tender type cash, so payment-mode analysis adds nothing. (UPI or card are likely taken but not separated in the POS.)</div>
   <div><span class="h">Negative stock</span>5,023 batches are below zero because Vyapar quantities did not match the shelves and goods were billed before stock-in. Shown as it is; treat stock quantities as indicative.</div>
   <div><span class="h">Two malformed bills</span>Bills 10907 and 32080 contain unquoted commas in the address, shifting their columns. They are left out of the totals (2 of 33,392 bills).</div>
  </div></div>
 <div class="card s12 rv"><div class="ch"><div><h2>Every table in the export</h2><div class="cap">Search by name · sorted by size</div></div></div><div class="tools"><input id="q" placeholder="Search table name"><select id="g"><option value="">All purposes</option>${[...GROUPS.map(g=>g[0]),'Other / system'].map(g=>`<option>${g}</option>`).join('')}</select></div><div class="scroll t"><table id="ta"></table></div></div>
</div>`},
update(){
 const withData=cat.length,rowsTot=cat.reduce((s,r)=>s+r.rows,0);
 kpis(document.getElementById('kp'),[{l:'Files in export',v:()=>D.meta.files,f:inr,cmp:false,cls:'hl'},{l:'Tables with data',v:()=>withData,f:inr,cmp:false},{l:'Empty tables',v:()=>D.meta.empty,f:inr,cmp:false},{l:'Bills analysed',v:()=>D.daily.reduce((s,x)=>s+x[0],0),f:inr,cmp:false,sub:D.meta.first+' → '+D.meta.last},{l:'Bill lines',v:()=>D.itemday.length,f:inr,cmp:false,sub:'item × day rows'},{l:'Products',v:()=>D.items.length,f:inr,cmp:false,sub:'seen in sales or stock'}],{n:1},null);
 const rows=TABLES.map(t=>{const nm=t[0].split(' / ')[0].toLowerCase(),c=byName[nm];return {n:t[0],r:c?c.rows:0,c:c?c.cols:0,w:t[1],f:t[2],u:t[3]}});
 table('tt',{sort:'r',rows,cols:[{k:'n',t:'Table',str:1,cls:'l',f:v=>`<code>${esc(v)}</code>`},{k:'w',t:'What it is',str:1,cls:'n l'},{k:'r',t:'Rows',f:inr,bar:1},{k:'c',t:'Cols'},{k:'f',t:'Holds',str:1,cls:'n l mute'},{k:'u',t:'Used for',str:1,cls:'n l'}]});
 table('tf',{sort:'t',dir:1,rows:FIELDS.map(r=>({t:r[0],c:r[1],m:r[2],q:r[3]})),cols:[{k:'t',t:'Table',str:1,f:v=>`<code>${esc(v)}</code>`},{k:'c',t:'Column',str:1,cls:'l'},{k:'m',t:'Meaning',str:1,cls:'n l'},{k:'q',t:'Confidence',str:1,cls:'l',f:v=>`<span class="tag">${esc(v)}</span>`}]});
 const gs={};cat.forEach(r=>gs[r.g]=(gs[r.g]||0)+1);const gk=Object.keys(gs).sort((a,b)=>gs[b]-gs[a]);
 chart('cG',{type:'doughnut',data:{labels:gk,datasets:[{data:gk.map(k=>gs[k]),backgroundColor:gk.map((_,i)=>css('--c'+(i+1))),borderColor:css('--card'),borderWidth:3,hoverOffset:8}]},options:{cutout:'60%',plugins:{legend:{display:true,position:'right',labels:{usePointStyle:true,boxWidth:8,color:css('--ink2')}},tooltip:{callbacks:{label:c=>' '+c.label+': '+c.parsed+' tables'}}}}});
 const draw=()=>{const ql=document.getElementById('q').value.toLowerCase(),g=document.getElementById('g').value;
  table('ta',{sort:'kb',rows:cat.filter(r=>(!g||r.g===g)&&(!ql||r.n.toLowerCase().includes(ql))),limit:300,foot:true,cols:[{k:'n',t:'Table',str:1,f:v=>`<code>${esc(v)}</code>`},{k:'g',t:'Purpose',str:1,cls:'l',f:v=>`<span class="tag">${v}</span>`},{k:'rows',t:'Rows',f:inr},{k:'cols',t:'Columns'},{k:'kb',t:'Size',f:v=>v>=1024?(v/1024).toFixed(1)+' MB':Math.round(v)+' KB',bar:1}]})};
 document.getElementById('q').oninput=draw;document.getElementById('g').onchange=draw;draw();
}});
