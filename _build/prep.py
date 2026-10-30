# Rebuilds assets/data.js from the RPOS-7 CSVs, the stock report CSV and the website feed.
# Run:  python prep.py   then   python gen.py
import csv,json,os,sys,collections as C
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,HERE)
from fam import typ,mat,MAT_NAMES,CATS,brand as brand_of,cat_fallback
R=os.path.abspath(os.path.join(HERE,'..','..')).replace(os.sep,'/')+'/'; d=R+'RPOS-7_Data/'
rd=lambda n:csv.reader(open(d+n+'.csv',encoding='utf-8',errors='replace'))
H=[r for r in rd('MED_BILL_HDR') if len(r)==212]
D=[r for r in rd('MED_BILL_DTL') if len(r)>=137]
master={r[0]:r for r in rd('med_item_hdr') if len(r)>=225}
feed={r['id']:r for r in csv.DictReader(open(R+'MerchantCenterFeed/primary_feed.tsv',encoding='utf-8-sig'),delimiter='	')}
brandlist=[]
dates=sorted({r[78][:10] for r in H}); di={x:i for i,x in enumerate(dates)}; N=len(dates)
BE=[100,250,500,1000,2000,5000]; IE=[1,2,3,5,8,12]  # upper bounds (inclusive) for first n-1 buckets
def bk(v,edges):
    for i,e in enumerate(edges):
        if v<e if edges is BE else v<=e: return i
    return len(edges)
daily=[[0,0.0,0.0,0.0,0,0.0,0] for _ in range(N)]; hourly=[{} for _ in range(N)]
bands=[[0]*14 for _ in range(N)]; ipb=[[0]*7 for _ in range(N)]
bd={}; big=[]
for r in H:
    t=r[78][:19]; i=di[t[:10]]; h=int(t[11:13]); a=float(r[10]); disc=float(r[9] or 0)
    bd[r[0]]=i; x=daily[i]; x[0]+=1; x[1]+=a; x[3]+=disc
    if disc>0: x[6]+=1
    if r[21]=='3': x[4]+=1; x[5]+=a
    hh=hourly[i].setdefault(h,[0,0.0]); hh[0]+=1; hh[1]+=a
    b=bk(a,BE); bands[i][b]+=1; bands[i][7+b]+=a
    ipb[i][bk(int(r[14]),IE)]+=1
    big.append([t[:10],t[11:16],a,int(r[14]),disc])
big.sort(key=lambda x:-x[2]); big=[[a,b,round(c),e,round(f)] for a,b,c,e,f in big[:150]]
# items
icode={}; items=[]
def item(code):
    if code in icode: return icode[code]
    m=master.get(code); n=(m[1].strip() if m else 'Item '+code); fd=feed.get(code)
    if fd and fd['product_type'] in CATS: cat=CATS.index(fd['product_type']); src=0; disp=fd['title']
    else: cat=CATS.index(cat_fallback(n)); src=1; disp=n
    b=(fd['brand'] if fd and fd['brand'] else '') or brand_of(n)
    if b and b not in brandlist: brandlist.append(b)
    icode[code]=len(items)
    items.append([code,disp,n,cat,MAT_NAMES.index(mat(n)),brandlist.index(b)+1 if b else 0,0,0,(m[11][:7] if m else ''),0,0,0,'',0,src]); return icode[code]
tax=[{} for _ in range(N)]; itemday=C.defaultdict(lambda:[0.0,0.0]); lastprice={}
for r in D:
    i=bd.get(r[0])
    if i is None: continue
    q=float(r[6]); a=float(r[9]); daily[i][2]+=q
    tx=r[13].split('.')[0] or '0'; tax[i][tx]=tax[i].get(tx,0)+a
    k=item(r[2]); itemday[(i,k)][0]+=q; itemday[(i,k)][1]+=a; lastprice[k]=(a/q if q else 0)
    if items[k][7]==0 and tx!='0': items[k][7]=float(tx)
# stock report
rows=list(csv.reader(open(R+'3030_Current_St_ock_Detail_1_2026_10_02_205747.csv',encoding='utf-8',errors='replace')))
i0=[k for k,r in enumerate(rows) if r and r[0]=='BRAND'][0]; hdr=rows[i0]; ix={h:k for k,h in enumerate(hdr)}
def f(r,h):
    try: return float(r[ix[h]].replace(',',''))
    except: return 0.0
types=C.defaultdict(lambda:[0,0.0,0.0,0.0,0.0]); tys={}
for r in rows[i0+2:]:
    if len(r)<40: continue
    k=item(r[ix['Item Code']]); it=items[k]; q=f(r,'Current Stock'); ty=r[ix['Transaction Type']]
    it[6]=f(r,'MRP'); it[7]=f(r,'Sales Tax %') or it[7]; it[9]+=q; it[13]=1
    if q>0: it[10]+=q
    if q<0: it[11]+=q; tys.setdefault(k,C.Counter())[ty]+=1
    t=types[ty]; t[0]+=1
    if q>0: t[1]+=q; t[2]+=f(r,'Stock Val on MRP')
    if q<0: t[3]+=q; t[4]+=f(r,'Stock Val on MRP')
for k,c in tys.items(): items[k][12]=c.most_common(1)[0][0]
for k,it in enumerate(items):
    if it[6]==0: it[6]=round(lastprice.get(k,0))
    it[9]=round(it[9],2); it[10]=round(it[10],2); it[11]=round(it[11],2)
# ---- products: the same name at different rates is one product with several variants (rules from the website's tools/build_catalogue.py)
sys.path.insert(0,os.path.join(R,'MadipakkamSaravanaStores-Website','tools'))
from build_catalogue import clean_name,fix_name,categorise,CATEGORY_ORDER as SITE_ORDER
SITE_NAMES=['Brass & Copper','Pooja Items','Cookware','Steel Vessels','Bottles & Flasks','Storage & Plastic','Kitchen Appliances','Home & Cleaning','Toys','Other']
gidx={};groups=[]
for k,it in enumerate(items):
    price=it[6] or lastprice.get(k,0)
    try: nm,info=fix_name(clean_name(it[2],price))
    except Exception: nm=''
    if len(''.join(ch for ch in nm if ch.isalpha()))<3: nm=it[2].strip().title() or ('Item '+it[0])
    key=nm.lower()
    if key not in gidx:
        gidx[key]=len(groups);groups.append([nm,SITE_ORDER.index(categorise(nm)),0,10**9,0])
    g=groups[gidx[key]];g[2]+=1
    if price:
        g[3]=min(g[3],round(price));g[4]=max(g[4],round(price))
    it.append(gidx[key])
for g in groups:
    if g[3]==10**9:g[3]=g[4]=0
# voids etc
voidN=[0]*N; voidL=[0]*N; voidV=[0.0]*N; voidH=[0]*24; vhid={}
for r in rd('INV_VOID_HDR'):
    if len(r)>=11 and r[3][:10] in di:
        i=di[r[3][:10]]; voidN[i]+=1; voidH[int(r[3][11:13])]+=1; vhid[r[0]]=i
for r in rd('INV_VOID_DTL'):
    if len(r)>=9 and r[0] in vhid:
        i=vhid[r[0]]; voidL[i]+=1
        try: voidV[i]+=float(r[1])
        except: pass
dms=[0]*N
for r in rd('deleted_med_stock_sale'):
    if len(r)>=5 and r[4][:10] in di: dms[di[r[4][:10]]]+=1
ret=[[0,0.0] for _ in range(N)]
for r in rd('Med_Tender_Dtl'):
    if len(r)>=29 and r[14]=='SR' and r[22][:10] in di: ret[di[r[22][:10]]][0]+=1; ret[di[r[22][:10]]][1]+=float(r[3])
# catalogue of all tables
cat=[]
for fn in os.listdir(d):
    p=d+fn; sz=os.path.getsize(p)
    if sz==0: continue
    with open(p,'rb') as fh:
        n=0
        while True:
            b=fh.read(1<<22)
            if not b: break
            n+=b.count(b'\n')
        fh.seek(0); first=fh.readline().decode('utf-8','replace')
    cols=len(next(csv.reader([first]))) if first.strip() else 0
    cat.append([fn[:-4],n,cols,sz])
cat.sort(key=lambda x:-x[3])
empty=sum(1 for fn in os.listdir(d) if os.path.getsize(d+fn)==0)
out={'meta':{'first':dates[0],'last':dates[-1],'stockAsof':'2026-10-02','empty':empty,'files':len(os.listdir(d))},
 'dates':dates,'daily':[[x[0],round(x[1]),round(x[2],1),round(x[3]),x[4],round(x[5]),x[6]] for x in daily],
 'hourly':[{h:[v[0],round(v[1])] for h,v in x.items()} for x in hourly],'tax':[{k:round(v) for k,v in x.items()} for x in tax],
 'bands':[[b if j<7 else round(b) for j,b in enumerate(x)] for x in bands],'ipb':ipb,'bandEdges':BE,'ipbEdges':IE,
 'groups':groups,'siteCats':SITE_NAMES,'cats':CATS,'matNames':MAT_NAMES,'brands':['']+brandlist,
 'items':items,'itemday':sorted([[k[0],k[1],round(v[0],2),round(v[1],2)] for k,v in itemday.items()]),
 'big':big,'void':{'n':voidN,'l':voidL,'v':[round(x) for x in voidV],'h':voidH},'dms':dms,'ret':[[a,round(b)] for a,b in ret],
 'stockTypes':{k:[v[0],round(v[1]),round(v[2]),round(v[3]),round(v[4])] for k,v in types.items()},'catalog':cat}
os.makedirs(R+'DashBoard/assets',exist_ok=True)
open(R+'DashBoard/assets/data.js','w',encoding='utf-8').write('window.D='+json.dumps(out,separators=(',',':'))+';')
print(N,len(items),len(out['itemday']),len(cat),os.path.getsize(R+'DashBoard/assets/data.js')//1024,'KB')
