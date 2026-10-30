
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
