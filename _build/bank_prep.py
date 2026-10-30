# Builds assets/bank.js (aggregates only) from _build/bank_txns.json.   Run: python bank_parse.py && python bank_prep.py
import json,os,re,collections as C
import bank_cat as bc
HERE=os.path.dirname(os.path.abspath(__file__)); OUT=os.path.join(HERE,'..','assets','bank.js')
tx=json.load(open(os.path.join(HERE,'bank_txns.json'),encoding='utf-8'))['tx']
K=['upi_in','card_in','cash_in','chq_in','owner_in','other_in','reversal_in','supplier_out','upi_out','own_out','fees','subs','bounce_out','legal']
days=sorted({x['d'] for x in tx});di={d:i for i,d in enumerate(days)};N=len(days)
amt={k:[0.0]*N for k in K};cnt={k:[0]*N for k in K};bal=[None]*N
for x in tx:
    x['k']=bc.classify(x);i=di[x['d']];amt[x['k']][i]+=x['a'];cnt[x['k']][i]+=1;bal[i]=x['b']   # tx are in statement order within a day -> last = closing
last=None
for i in range(N):
    if bal[i] is None:bal[i]=last
    last=bal[i]
# ---- payees
def key(n):return re.sub(r'[^A-Z]','',n.upper())[:18]
def collect(kind,filt,partyKind):
    raw=C.defaultdict(lambda:{'n':C.Counter(),'t':0.0,'c':0,'f':'9999','l':'','m':C.defaultdict(float)})
    for x in tx:
        if x['k']!=kind or not filt(x):continue
        nm=bc.party(x['p'],partyKind)[0].strip()
        if not nm or nm.upper().startswith(('UPI','TRANSFER TO')):nm='(name not shown)'
        k=key(nm) or 'NONAME'
        r=raw[k];r['n'][nm.title()]+=1;r['t']+=x['a'];r['c']+=1;r['f']=min(r['f'],x['d']);r['l']=max(r['l'],x['d']);r['m'][x['d'][:7]]+=x['a']
    keys=sorted(raw,key=lambda k:-len(k))
    merged={}
    for k in sorted(raw,key=len):          # merge a longer key into a shorter prefix key (LOTUS / LOTUSMETALCORPOR)
        tgt=next((s for s in merged if len(s)>=5 and k.startswith(s)),None)
        if tgt:
            m=merged[tgt];r=raw[k];m['n'].update(r['n']);m['t']+=r['t'];m['c']+=r['c'];m['f']=min(m['f'],r['f']);m['l']=max(m['l'],r['l'])
            for a,b in r['m'].items():m['m'][a]+=b
        else:merged[k]=raw[k]
    out=[]
    for k,r in merged.items():
        out.append({'n':r['n'].most_common(1)[0][0],'t':round(r['t']),'c':r['c'],'f':r['f'],'l':r['l'],'m':{a:round(b) for a,b in sorted(r['m'].items())}})
    out.sort(key=lambda r:-r['t']);return out
sup=collect('supplier_out',lambda x:True,'x')
upo=collect('upi_out',lambda x:True,'upi_out')
own=collect('own_out',lambda x:True,'x')
# ---- UPI payers (statements show the payer only on the newer UPI/CR format)
cust=C.defaultdict(lambda:{'n':C.Counter(),'t':0.0,'c':0,'f':'9999','l':'','m':C.defaultdict(int)})
for x in tx:
    if x['k']!='upi_in' or not x['p'].upper().startswith('UPI/CR'):continue
    nm,bk,hd=bc.party(x['p'],'upi_in');nm=nm.strip()
    if not nm:continue
    k=(bk+'|'+hd.lower()) if hd and hd.upper()!='UPI' else (bk+'|'+nm.lower())
    r=cust[k];r['n'][nm.title()]+=1;r['t']+=x['a'];r['c']+=1;r['f']=min(r['f'],x['d']);r['l']=max(r['l'],x['d'])
mo_new=C.Counter();mo_act=C.defaultdict(set)
for k,r in cust.items():mo_new[r['f'][:7]]+=1
for x in tx:
    if x['k']=='upi_in' and x['p'].upper().startswith('UPI/CR'):
        nm,bk,hd=bc.party(x['p'],'upi_in')
        if not nm.strip():continue
        k=(bk+'|'+hd.lower()) if hd and hd.upper()!='UPI' else (bk+'|'+nm.strip().lower());mo_act[x['d'][:7]].add(k)
freq=C.Counter();
for r in cust.values():
    c=r['c'];freq['1' if c==1 else '2-3' if c<=3 else '4-9' if c<=9 else '10-24' if c<=24 else '25+']+=1
topc=sorted(cust.values(),key=lambda r:-r['t'])[:60]
customers={'unique':len(cust),'txns':sum(r['c'] for r in cust.values()),'amt':round(sum(r['t'] for r in cust.values())),'freq':dict(freq),
 'monthNew':dict(sorted(mo_new.items())),'monthActive':{m:len(s) for m,s in sorted(mo_act.items())},
 'top':[{'n':r['n'].most_common(1)[0][0],'t':round(r['t']),'c':r['c'],'f':r['f'],'l':r['l']} for r in topc]}
# ---- payer detail (every UPI/CR payer with 2+ payments; one-time payers stay aggregate)
pay=C.defaultdict(lambda:{'n':C.Counter(),'b':'','rows':[]})
for x in tx:
    if x['k']!='upi_in' or not x['p'].upper().startswith('UPI/CR'):continue
    nm,bk,hd=bc.party(x['p'],'upi_in');nm=nm.strip()
    if not nm:continue
    k=(bk+'|'+hd.lower()) if hd and hd.upper()!='UPI' else (bk+'|'+nm.lower())
    r=pay[k];r['n'][nm.title()]+=1;r['b']=bk;r['rows'].append((di[x['d']],round(x['a'])))
payers=[]
for k,r in pay.items():
    if len(r['rows'])<2:continue
    rows=sorted(r['rows']);flat=[v for d,a in rows for v in (d,a)]
    payers.append([r['n'].most_common(1)[0][0],r['b'],len(rows),sum(a for d,a in rows),rows[0][0],rows[-1][0],flat])
payers.sort(key=lambda p:-p[3])
# ---- notable items
chq=[{'d':x['d'],'a':x['a'],'k':x['k'],'p':x['p'][:90]} for x in tx if 'BOUNCE' in x['p'].upper() or 'RETURN' in x['p'][:14].upper()]
bigin=[{'d':x['d'],'a':round(x['a']),'k':x['k'],'p':x['p'][:80]} for x in sorted([x for x in tx if x['t']=='cr' and x['k'] not in('upi_in','card_in')],key=lambda x:-x['a'])[:40]]
bigout=[{'d':x['d'],'a':round(x['a']),'k':x['k'],'n':bc.party(x['p'],'x')[0][:34],'p':x['p'][:80]} for x in sorted([x for x in tx if x['t']=='dr'],key=lambda x:-x['a'])[:40]]
fees=C.Counter()
for x in tx:
    if x['k'] in('fees','subs','bounce_out','legal'):
        u=x['p'].upper();fees['POS terminal fee & GST' if 'POS MID' in u else 'Cheque / return charges & GST' if ('CHARGE' in u or 'CHQ' in u or 'BOUNCE' in u) else 'Auto-debit (NACH)' if x['k']=='subs' else 'Other bank fees']+=x['a']
data={'days':days,'bal':[round(b,2) if b is not None else 0 for b in bal],'K':K,'amt':{k:[round(v) for v in amt[k]] for k in K},'cnt':cnt,
 'sup':sup[:90],'supOthers':{'n':max(0,len(sup)-90),'t':sum(r['t'] for r in sup[90:])},'upo':upo[:40],'own':own[:12],'cust':customers,'payers':payers,'chq':chq[:60],'bigin':bigin,'bigout':bigout,'fees':{k:round(v) for k,v in fees.items()},
 'meta':{'first':days[0],'last':days[-1],'txns':len(tx),'files':66,'acct':'IDFC FIRST Bank · Merchant Multiplier A/c ending 7186','open':round(tx[0]['b']-(tx[0]['a'] if tx[0]['t']=='cr' else -tx[0]['a']),2),'close':round(tx[-1]['b'],2)}}
open(OUT,'w',encoding='utf-8').write('window.B='+json.dumps(data,separators=(',',':'),ensure_ascii=False)+';')
print('wrote',os.path.getsize(OUT)//1024,'KB;',len(sup),'supplier names;',customers['unique'],'UPI payers;',len(days),'days')
tot=lambda k:sum(amt[k])
print({k:round(tot(k)/1e5,1) for k in K})
