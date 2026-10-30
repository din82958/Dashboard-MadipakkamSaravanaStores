import re
# Product type rules (first match wins) - derived from item names; POS has no category field.
TYPES=[
 ('Pressure Cookers',['COOKER','COKKER','COOKKER','CUKKER']),
 ('Appliances',['STOVE','JUICER','MIXER','GRINDER','KETTLE','INDUCTION','HEATER','TOASTER','ELECTRIC','LIGHTER','BLENDER','CHOPPER','ROTI MAKER','RICE COOKER','OVEN','FAN','IRON BOX','WET GRINDER','MIXCY','MIXIE','MIXY','MIXI','PREETHI','VIDIEM','VEDIM','VIDEM','BUTTERFLY','BUTTER FLY','CROMPTON','REGULATOR','GAS ','MOSQUITO','FREEZER','FRIDGE','SUJATA','GREEN CHEF','GREENCHEF','HAIER','USHA','BAJAJ','PHILIPS','HAWKINS','WONDERCHEF','SURYA','ORIENT','HISPEED','SHAKTI','MATCHLESS','INDICOOK','VECTOR','BLOOM','TRIO','SERVICE','WIPER BLADE','KATTLE','BURNER','GRAINDER','GRINDER','IND COOK','IND EXPRESS','RADIANT','MAGNUM','RHINO','COOK TOP']),
 ('Pooja & Lamps',['VILAKU','VILAKKU','VILLAKU','DEEPAM','DEEP ','KUTHU','SAMBADAM','SAMBRANI','ACHU','BELL','ANNAKUDAI','MUDI','THAVALAI','VIGRAHAM','POOJA','PUJA','KUMCHA','ARATHI','AARATHI','AARTHI','KUMKUM','KUNKUM','PANCHAPATHIRAM','PANCHAPATRA','GANESH','LAKSHMI','LAKSMI','KAMATCHI','NANDHI','SWAMI','SOMBU','CHOMBU','KINNAM','UDHARANI','URANI','THATTU','KALASAM','KALASH','AGARBATHI','CAMPHOR','DIYA','THIRUVACHI','PEEDAM','PEETAM','AMMAN','KODI','THEERTHAM','VELLI','SANDAL']),
 ('Lunch Boxes & Containers',['DABBARA','DABBA','DABARA','RDUM','LUNCH','TIFFIN','BENTO','CONTAINER','CASSEROLE','HOT PACK','HOT BOX','HOTBOX','HOT POT','CARRIER','JAR','BOX','KARANDI','PICKLE']),
 ('Bottles & Flasks',['BOTTLE','FLASK','SIPPER','JUG','THERMO','WATER','CAN ']),
 ('Cookware',['PAAI','PAANAI','PANIYA','APPACHATTY','APPA CHETTY','APPACHETTY','STEEMER','STANDARD','CASSE','KORAI','KORAI PAAI','CURVE','CUTE','BLUE LINE','PREMIER','SUPREME','KADAI','KADHAI','KADAHI','TAWA','THAWA','PAN','POT','IDLY','IDLI','HANDI','TOPE','TOPU','TOPPU','APPAM','FRY','TRIPLY','NON STICK','NONSTICK','LADDLE','LADLE','URAL','URLI','URULI','PARATH','CHATTI','CHETTI','VADI','PADI','PRESSURE','STEAMER','BIRIYANI','BIRYANI','KARAI','KURUMA','PAAN','PUTTU','IDIYAPPAM','SERVER','TURNER','JAARI','JAADI','JAAR','SHALLOW','PAYASAM','VARPPU','VARPU','KUDAM','POTTU']),
 ('Plates, Glasses & Serveware',['PLATE','BOWL','TUMBLER','GLASS','CUP','MUG','SPOON','TRAY','DISH','SAUCER','KATORI','SERVING','DINNER','SET','THATTU','TUMBLER','FORK']),
 ('Cleaning & Laundry',['BRUSH','MOP','BROOM','WIPER','SOAP','LAUNDRY','TOILET','DUSTBIN','CLEANER','WASH','SCRUB','DETERGENT','BIN','SCRUBBER','NAPTHALENE','POWDER','FRESHNER','FRESHENER','POLISH','CONDITIONER','LATEX','SPONGE','DUSTER','SCOURER','HARPIC','PHENYL','DISH WASH','HANGER','CLIP']),
 ('Storage, Racks & Furniture',['STAND','RACK','STOOL','TABLE','CHAIR','BASKET','BUCKET','TUB','DRUM','CABINET','SHELF','ORGANI','TROLLEY','SHOE','BED','SOFA','PEDAL','CHAIR','CHIR','CHAR ','KATIL','KATTIL','KATTAL','LADDER','CUPBOARD','PILLOW','TEA POY','SELF','SHEET','COT ','MATTRESS','DIWAN','ALMIRAH','SOFA','CHAIRS','CHIRS','TROLLEY','TROLLLEY','TROIIEY','CYLINDER','PATLA']),
 ('Kitchen Tools',['KNIFE','CUTTER','BOARD','GRATER','PEELER','MASHER','TONGS','CUTTING','STRAINER','MAKER','PURI','PRESS','ROLLING','CHAKLI','MURUKKU','FILTER','OPENER','SCISSOR','WHISK','ROLLER','CHAPATHI','CHAPATI','IDLY MAKER','MESH','SIEVE','JALLI','SALT','SPICE','MASALA','STICK','FRYER','JUICE','OIL','SAUCE','COCONUT','SCRAPER','PESTLE','GASKET','TISSUE','NAPKIN']),
 ('Home, Decor & Bags',['CLOCK','MIRROR','MAT','CLOTH','BAG','LOCK','FLOWER','COVER','TOY','GIFT','SHOWPIECE','PLANT','POT STAND','UMBRELLA','TORCH','LIGHT','LAMP','BULB','WALL','BATTERY']),
]
MATS=[
 ('Brass',[r'\bBRASS\b',r'\bPITTALAI\b',r'\bPITHALAI\b']),
 ('Copper',[r'\bCOPPER\b',r'\bTHAMBARAM\b',r'\bTHAMBRAM\b',r'\bCOPPAR\b']),
 ('Cast Iron',[r'\bIRON\b',r'\bCAST\b',r'\bKALCHATTI\b']),
 ('Aluminium',[r'\bALUMINIUM\b',r'\bALUMINUM\b',r'\bALU\b',r'\bAL\b',r'\bALLUMINIUM\b',r'\bHINDALIUM\b',r'\bTRIPLY\b',r'\bNON ?STICK\b']),
 ('Stainless Steel',[r'\bS\.? ?S\b',r'\bSS\b',r'\bSTEEL\b',r'\bSTAINLESS\b']),
 ('Plastic',[r'\bPLASTIC\b',r'\bPL\b',r'\bCELLO\b',r'\bMILTON\b',r'\bTUPPERWARE\b',r'\bSIGNORAWARE\b',r'\bPOLY\b']),
 ('Glass & Ceramic',[r'\bGLASS\b',r'\bCERAMIC\b',r'\bBOROSIL\b',r'\bGLASSWARE\b',r'\bPORCELAIN\b']),
 ('Wood & Bamboo',[r'\bWOOD\b',r'\bWOODEN\b',r'\bBAMBOO\b',r'\bMANAI\b']),
]
def clean(n): return ' '+re.sub(r'\s+',' ',re.sub(r'[\(\)\[\]\-_/,\.]',' ',n.upper()))+' '
def typ(n):
    c=clean(n)
    for t,kws in TYPES:
        for k in kws:
            if (k.endswith(' ') and k in c) or re.search(r'\b'+re.escape(k.strip())+r'\b',c) or (len(k)>5 and k in c): return t
    return 'Other / Unclassified'
def mat(n):
    c=clean(n)
    for m,pats in MATS:
        for p in pats:
            if re.search(p,c): return m
    return 'Not stated'
TYPE_NAMES=[t for t,_ in TYPES]+['Other / Unclassified']
MAT_NAMES=[m for m,_ in MATS]+['Not stated']

# ---- official categories (Merchant Center feed / website) + fallback mapping ----
CATS=['Cookware & Pressure Cookers','Storage Containers','Kitchen Tools & Gadgets','Pooja & Brass Items','Lunch Boxes, Bottles & Flasks','Plates, Bowls & Serveware','Furniture & Home Utility','Cleaning & Laundry','Buckets, Tubs & Plastic Ware','Appliances & Electricals','Unclassified']
BRANDS=[('Milton',['MILTON']),('Mithra',['MITHRA']),('Cello',['CELLO']),('Premier',['PREMIER']),('Judge',['JUDGE']),('Butterfly',['BUTTERFLY','BUTTER FLY']),('Max Fresh',['MAX FRESH','MAXFRESH']),('Bergner',['BERGNER']),('Prestige',['PRESTIGE']),('Green Chef',['GREEN CHEF','GREENCHEF']),('Vinod',['VINOD']),('Bajaj',['BAJAJ']),('Hawkins',['HAWKINS']),('Pigeon',['PIGEON']),('Wonderchef',['WONDERCHEF','WONDER CHEF']),('Preethi',['PREETHI','PREETI']),('Crompton',['CROMPTON']),('Haier',['HAIER']),('Sujata',['SUJATA']),('Vidiem',['VIDIEM','VIDEM','VEDIM']),('Usha',['USHA']),('Philips',['PHILIPS']),('Supreme',['SUPREME']),('Nilkamal',['NILKAMAL']),('Kent',['KENT'])]
def brand(n):
    c=clean(n)
    for b,ks in BRANDS:
        for k in ks:
            if re.search(r'\b'+re.escape(k)+r'\b',c): return b
    return ''
def cat_fallback(n):
    t=typ(n); c=clean(n)
    if t=='Lunch Boxes & Containers':
        return 'Lunch Boxes, Bottles & Flasks' if re.search(r'\b(LUNCH|TIFFIN|BENTO|DABBARA|DABBA|DABARA|CARRIER|HOT PACK|HOT BOX)\b',c) else 'Storage Containers'
    if t=='Storage, Racks & Furniture':
        return 'Buckets, Tubs & Plastic Ware' if re.search(r'\b(BUCKET|TUB|BASKET|DRUM|RDUM)\b',c) else 'Furniture & Home Utility'
    return {'Pressure Cookers':CATS[0],'Cookware':CATS[0],'Appliances':CATS[9],'Pooja & Lamps':CATS[3],'Bottles & Flasks':CATS[4],'Plates, Glasses & Serveware':CATS[5],'Cleaning & Laundry':CATS[7],'Kitchen Tools':CATS[2],'Home, Decor & Bags':CATS[6]}.get(t,'Unclassified')
