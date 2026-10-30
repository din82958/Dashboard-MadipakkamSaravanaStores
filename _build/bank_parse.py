# Parses the IDFC FIRST Bank statement PDFs (BankStatement/*.pdf) into one de-duplicated transaction list.
# Needs poppler's `pdftotext` on PATH.  Output: _build/bank_txns.json
import re,subprocess,glob,os,json,sys
from datetime import datetime
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.abspath(os.path.join(HERE,'..','..'))
DATE=re.compile(r'^(\d{2}-[A-Za-z]{3}-\d{4})\s+(\d{2}-[A-Za-z]{3}-\d{4})(?:\s+(.*))?$')
TAIL=re.compile(r'^(.*?)\s*([\d,]+\.\d{2})\s+([\d,]+\.\d{2})$')
AMT=re.compile(r'^(?:(\d{4,12})\s+)?([\d,]+\.\d{2})\s+([\d,]+\.\d{2})$')
num=lambda s:float(s.replace(',',''))
def pdf_text(p):
    return subprocess.run(['pdftotext','-raw',p,'-'],capture_output=True,text=True,encoding='utf-8',errors='replace').stdout
def parse(p):
    t=pdf_text(p); m=re.search(r'STATEMENT PERIOD\s*:\s*(\S+) TO (\S+)',t)
    ob=re.search(r'Opening Balance\s+Total Debit\s+Total Credit\s+Closing Balance\s*\n\s*([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})',t)
    head={'period':(m.group(1),m.group(2)) if m else None,'open':num(ob.group(1)) if ob else None,'debit':num(ob.group(2)) if ob else None,'credit':num(ob.group(3)) if ob else None,'close':num(ob.group(4)) if ob else None}
    tx=[];cur=None
    for ln in t.split('\n'):
        ln=ln.strip()
        if not ln: continue
        d=DATE.match(ln)
        if d:
            if cur: tx.append(cur)
            cur={'d':datetime.strptime(d.group(1),'%d-%b-%Y').strftime('%Y-%m-%d'),'p':[], 'a':None,'b':None}
            rest=(d.group(3) or '').strip()
            if rest:
                tm=TAIL.match(rest)
                if tm:
                    if tm.group(1): cur['p'].append(tm.group(1))
                    cur['a']=num(tm.group(2));cur['b']=num(tm.group(3))
                else: cur['p'].append(rest)
            continue
        if cur is None: continue
        if ln.startswith('REGISTERED OFFICE') or re.match(r'^Page \d+ of \d+',ln) or ln.startswith('STATEMENT OF ACCOUNT') or ln.startswith('Opening Balance'):
            if cur: tx.append(cur);cur=None
            continue
        a=AMT.match(ln)
        if a and cur['a'] is None:
            cur['a']=num(a.group(2));cur['b']=num(a.group(3))
            if a.group(1): cur['p'].append('CHQ '+a.group(1))
            continue
        cur['p'].append(ln)
    if cur: tx.append(cur)
    prev=head['open']
    for x in tx:
        if x['a'] is None or prev is None: continue
        x['t']='cr' if x['b']>prev+0.001 else 'dr' if x['b']<prev-0.001 else '?'
        prev=x['b']
    return head,tx
def main():
    files=sorted(glob.glob(os.path.join(ROOT,'BankStatement','*.pdf')))
    seen=set();allx=[];heads=[]
    for f in files:
        h,tx=parse(f);h['file']=os.path.basename(f);heads.append(h)
        for x in tx:
            if x['a'] is None: continue
            key=(x['d'],' '.join(x['p']),x['a'],x['b'],x.get('t'))
            if key in seen: continue
            seen.add(key);x['p']=' '.join(x['p']);allx.append(x)
    # order and decide debit/credit by balance movement (balance after each transaction)
    heads_sorted=sorted([h for h in heads if h['period']],key=lambda h:h['period'])
    # chain: sort by date, then keep original within-file order -> use balance chain to sign
    allx.sort(key=lambda x:x['d'])
    return heads,allx
if __name__=='__main__':
    heads,allx=main()
    json.dump({'heads':heads,'tx':allx},open(os.path.join(HERE,'bank_txns.json'),'w'),ensure_ascii=False)
    print(len(heads),'files',len(allx),'transactions',allx[0]['d'],allx[-1]['d'])
