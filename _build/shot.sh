#!/bin/bash
# usage: shot.sh page.html out.png [height] [query] [width]   (signs in via a temporary copy of the page)
D="C:/Users/DSubramanian/Documents/MadipakkamSaravanaStores/DashBoard"
sed 's#<script src="assets/app.js">#<script>try{sessionStorage.setItem("sss-auth","1nq7c5hklsp")}catch(e){}</script><script src="assets/app.js">#' "$D/$1" > "$D/_shot_tmp.html"
E="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"; [ -f "$E" ] || E="/c/Program Files/Microsoft/Edge/Application/msedge.exe"
timeout 100 "$E" --headless=new --disable-gpu --force-prefers-reduced-motion --window-size=${5:-1440},${3:-1500} --virtual-time-budget=12000 --enable-logging=stderr --v=0 --screenshot="$2" "file:///$D/_shot_tmp.html$4" 2>&1 | grep -E "CONSOLE|Uncaught" | grep -v "chrome-extension" | head -8
rm -f "$D/_shot_tmp.html"
