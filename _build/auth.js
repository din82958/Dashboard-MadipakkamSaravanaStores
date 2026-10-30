
// ---------- sign-in gate (client-side; see README for limits) ----------
const AUTH_OK='1nq7c5hklsp';
const _hash=(s,seed=7)=>{let h1=0xdeadbeef^seed,h2=0x41c6ce57^seed;for(let i=0,c;i<s.length;i++){c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return (4294967296*(2097151&h2)+(h1>>>0)).toString(36)};
const _cred=(u,p)=>_hash('sss|'+u.trim()+'|'+p+'|madipakkam');
function isAuthed(){
 try{if(sessionStorage.getItem('sss-auth')===AUTH_OK)return true}catch(e){}
 try{const v=JSON.parse(localStorage.getItem('sss-auth-l')||'null');if(v&&v.k===AUTH_OK&&v.t>Date.now()){try{sessionStorage.setItem('sss-auth',AUTH_OK)}catch(e){}return true}}catch(e){}
 return false;
}
function signOut(){try{sessionStorage.removeItem('sss-auth');localStorage.removeItem('sss-auth-l')}catch(e){}location.reload()}
function showLogin(onOk){
 document.body.innerHTML=`<div class="lg-bg"><form class="lg-card" id="lgf" autocomplete="on">
  <img src="assets/logo-red.png" alt="Madipakkam Saravana Stores" class="lg-logo">
  <h1>Sign in</h1><p class="lg-s">Sales dashboard — authorised staff only</p>
  <label>Username<input id="lu" name="username" autocomplete="username" inputmode="numeric" required autofocus></label>
  <label>Password<span class="lg-pw"><input id="lp" name="password" type="password" autocomplete="current-password" inputmode="numeric" required><button type="button" id="lt" aria-label="Show password">${ico('eye')}</button></span></label>
  <label class="lg-k"><input type="checkbox" id="lk" checked> Keep me signed in on this device (30 days)</label>
  <div class="lg-e" id="le" role="alert"></div>
  <button class="lg-go" type="submit">Sign in</button>
  <p class="lg-f">Madipakkam 96984 71616 · Medavakkam 94445 77336</p></form></div>`;
 const f=document.getElementById('lgf'),e=document.getElementById('le');let fails=0,lock=0;
 document.getElementById('lt').onclick=()=>{const p=document.getElementById('lp');p.type=p.type==='password'?'text':'password'};
 f.onsubmit=ev=>{ev.preventDefault();
  if(Date.now()<lock){e.textContent='Too many attempts. Try again in '+Math.ceil((lock-Date.now())/1000)+' s.';return}
  if(_cred(document.getElementById('lu').value,document.getElementById('lp').value)===AUTH_OK){
   try{sessionStorage.setItem('sss-auth',AUTH_OK);if(document.getElementById('lk').checked)localStorage.setItem('sss-auth-l',JSON.stringify({k:AUTH_OK,t:Date.now()+30*864e5}))}catch(x){}
   onOk();return}
  fails++;e.textContent=fails>=5?'Too many attempts. Locked for 30 seconds.':'Incorrect username or password.';
  if(fails>=5){lock=Date.now()+30000;fails=0}
  f.classList.remove('shake');void f.offsetWidth;f.classList.add('shake');document.getElementById('lp').value='';document.getElementById('lp').focus()};
}
