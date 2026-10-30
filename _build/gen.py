# Generates the dashboard pages in ../ from pages/*.js   (run: python gen.py)
import os,glob,re
h=os.path.dirname(os.path.abspath(__file__)); out=os.path.join(h,'..')
HEAD='''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%s · Saravana Stores</title>
<link rel="icon" href="data:image/svg+xml,%%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%%3E%%3Crect width='64' height='64' rx='14' fill='%%231a73e8'/%%3E%%3Ctext x='32' y='45' font-size='38' font-weight='700' text-anchor='middle' fill='white' font-family='Arial'%%3ES%%3C/text%%3E%%3C/svg%%3E">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/app.css?v=20261048">
<script>(function(){try{var t=localStorage.getItem('sss-theme');var q=new URLSearchParams(location.search).get('theme');if(q==='light'||q==='dark')t=q;if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}})()</script>
<meta name="theme-color" content="#1a73e8">
<style>
#boot{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:#f8f9fa;color:#5f6368;font:500 14px/1.4 Inter,Roboto,"Segoe UI",system-ui,sans-serif}
@media (prefers-color-scheme:dark){html:not([data-theme="light"]) #boot{background:#171717;color:#9aa0a6}html:not([data-theme="light"]) .bt-logo{filter:brightness(0) invert(.92)}}
html[data-theme="dark"] #boot{background:#171717;color:#9aa0a6}html[data-theme="dark"] .bt-logo{filter:brightness(0) invert(.92)}
.bt-in{display:flex;flex-direction:column;align-items:center;gap:26px;padding:24px}
.bt-stage{display:grid;place-items:center}
.bt-logo{width:200px;animation:btfade .7s ease-out both}
.bt-bar{width:240px;height:4px;border-radius:2px;background:rgba(26,115,232,.16);overflow:hidden}
.bt-bar b{display:block;width:90px;height:100%%;border-radius:2px;background:linear-gradient(90deg,#4285f4,#1a73e8);animation:btslide 1.25s ease-in-out infinite}
.bt-msg{position:relative;height:20px;width:260px;text-align:center}
.bt-msg span{position:absolute;inset:0;opacity:0;animation:btmsg 6s infinite}
.bt-msg span:nth-child(2){animation-delay:2s}.bt-msg span:nth-child(3){animation-delay:4s}
@keyframes btfade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes btslide{0%%{transform:translateX(-95px)}100%%{transform:translateX(250px)}}
@keyframes btmsg{0%%{opacity:0;transform:translateY(5px)}8%%,30%%{opacity:1;transform:none}38%%,100%%{opacity:0;transform:translateY(-5px)}}
@media (prefers-reduced-motion:reduce){.bt-logo,.bt-bar b,.bt-msg span{animation:none}.bt-msg span:first-child{opacity:1}.bt-bar b{width:100%%}}
</style>

</head>
<body>
<div id="boot" role="status" aria-live="polite"><div class="bt-in"><div class="bt-stage"><img class="bt-logo" src="assets/logo-red.png" alt="Madipakkam Saravana Stores"></div><div class="bt-bar"><b></b></div><div class="bt-msg"><span>Reading your sales data…</span><span>Counting bills and stock…</span><span>Drawing your charts…</span></div></div></div>
<script src="assets/chart.min.js"></script>
<script src="assets/data.js"></script>
%s<script src="assets/ta.js?v=20261048"></script><script src="assets/app.js?v=20261048"></script>
<script>
%s
</script>
</body>
</html>
'''
files={'index':'index.html'}
for p in sorted(glob.glob(os.path.join(h,'pages','*.js'))):
    name=os.path.basename(p)[:-3]; js=open(p,encoding='utf-8').read()
    title=js.split('\n',1)[0].replace('//','').strip()
    extra=''.join('<script src="%s"></script>\n'%m.group(1) for m in re.finditer(r'//\s*@scripts\s+(\S+)',js))
    open(os.path.join(out,name+'.html'),'w',encoding='utf-8').write(HEAD%(title,extra,js))
    print('wrote',name+'.html')
