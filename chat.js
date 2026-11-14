/* Private chat: two people, one link, encrypted in the browser, each message disappears after it has been seen.
   Loaded by index.html when /chat is opened. Upload it next to index.html. */
(function(){
'use strict';
const CSS=`
.ch{max-width:720px;margin:0 auto;padding:8px 0 40px;font:16px/1.55 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:var(--tx)}
.ch h1{font:700 34px/1.12 Georgia,'Times New Roman',serif;margin:18px 0 8px}
.ch .chk{font:700 13px system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--ac);margin-top:10px}
.ch .chd{font:19px/1.45 Georgia,serif;color:var(--mu);margin:0 0 18px}
.ch h2{font:700 21px Georgia,serif;margin:26px 0 8px;padding-top:12px;border-top:1px solid var(--ln)}
.ch button,.ch select,.ch textarea{font:inherit}
.chb{display:inline-block;background:var(--nv);color:#fff;border:0;border-radius:8px;padding:12px 20px;font:700 16px system-ui,sans-serif;cursor:pointer}
.chb:disabled{opacity:.5;cursor:default}
.chb.g{background:transparent;color:var(--tx);border:1px solid var(--ln);padding:9px 14px;font-size:14px}
.chb.r{background:transparent;color:var(--ac);border:1px solid var(--ac);padding:9px 14px;font-size:14px}
.chs{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
.chst{display:flex;align-items:center;gap:8px;font:600 14px system-ui,sans-serif;color:var(--mu);margin:6px 0}
.chst i{width:10px;height:10px;border-radius:50%;background:#999;display:inline-block}.chst.on i{background:#2e9e5b}.chst.wait i{background:#e5a100}
.chbox{border:1px solid var(--ln);border-radius:10px;padding:14px;margin:12px 0}
.chbox input{width:100%;box-sizing:border-box;padding:10px;border:1px solid var(--ln);border-radius:8px;background:var(--bg);color:var(--tx);font:14px ui-monospace,monospace}
.chlog{height:min(52vh,460px);overflow-y:auto;border:1px solid var(--ln);border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:8px;background:color-mix(in srgb,var(--tx) 3%,var(--bg))}
.chlog .e{margin:auto;color:var(--mu);text-align:center;font-size:15px}
.chm{max-width:82%;padding:9px 12px;border-radius:12px;word-wrap:break-word;overflow-wrap:anywhere;white-space:pre-wrap}
.chm.me{align-self:flex-end;background:var(--nv);color:#fff;border-bottom-right-radius:3px}
.chm.th{align-self:flex-start;border:1px solid var(--ln);background:var(--bg);border-bottom-left-radius:3px}
.chm small{display:block;font:12px system-ui,sans-serif;opacity:.75;margin-top:3px;white-space:normal}
.chm.go{transition:opacity .5s;opacity:0}
.chc{display:flex;gap:8px;margin-top:10px;align-items:flex-end}
.chc textarea{flex:1;min-height:46px;max-height:130px;resize:none;padding:11px;border:1px solid var(--ln);border-radius:8px;background:var(--bg);color:var(--tx)}
.chn{font:13px/1.45 system-ui,sans-serif;color:var(--mu);margin:10px 0}
.chq{border-bottom:1px solid var(--ln);padding:9px 0}.chq summary{cursor:pointer;font-weight:600}.chq p{margin:8px 0 0;color:var(--mu)}
.chl{padding-left:20px}.chl li{margin:6px 0}
`;
const SH={fb:'<path d="M13.5 22v-8h2.7l.5-3.3h-3.2V8.6c0-.9.3-1.6 1.7-1.6h1.6V4.1C16.4 4 15.5 4 14.4 4 12 4 10.3 5.5 10.3 8.2v2.5H7.5V14h2.8v8z"/>',x:'<path d="M18.2 3h3.1l-6.8 7.8L22.5 21h-6.3l-4.9-6.4L5.6 21H2.5l7.3-8.3L2 3h6.4l4.4 5.9zm-1.1 16.2h1.7L7.3 4.7H5.5z"/>',wa:'<path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.1.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.5.2.3.7 1.2 1.5 1.9 1 .9 1.9 1.2 2.2 1.3.3.1.4.1.6-.1l.8-1c.2-.2.3-.2.5-.1l1.8.9c.2.1.4.2.4.3.1.2.1.8-.1 1.5z"/>'};
const B64=u=>{let s='';u=new Uint8Array(u);for(let i=0;i<u.length;i++)s+=String.fromCharCode(u[i]);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const UB64=t=>{t=t.replace(/-/g,'+').replace(/_/g,'/');while(t.length%4)t+='=';const s=atob(t),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u};
const rid=n=>B64(crypto.getRandomValues(new Uint8Array(n)));
const $=id=>document.getElementById(id);
const parseHash=()=>{const m=(location.hash||'').match(/^#([A-Za-z0-9_-]{16,64})\.([A-Za-z0-9_-]{43})$/);return m?{room:m[1],key:m[2]}:null};
let S=null,tick=0;
function dispose(){if(S){S.stop=true;try{S.ws&&S.ws.close()}catch(e){}}S=null;if(tick){clearInterval(tick);tick=0}}
window.chatPg=function(){
 document.title='Private chat — The Sujan Khadka';
 if(!document.getElementById('chat-css')){const s=document.createElement('style');s.id='chat-css';s.textContent=CSS;document.head.appendChild(s)}
 return `<div class="ch" id="ch">
 <div id="ch-start"><div class="chk">Tools · Private chat</div><h1>Private chat</h1>
  <p class="chd">Talk to one person. Messages are locked in your browser and disappear after they have been seen. No account. No history.</p>
  <button class="chb" id="ch-new" type="button">Start a private chat</button>
  <h2 id="ch-how">How it works</h2>
  <ol class="chl"><li>Tap <b>Start a private chat</b>. You get a private link that works for 7 days. After that, create a new one.</li><li>Send the link to one friend, on WhatsApp, Messenger or any app.</li><li>When your friend opens it, the chat locks to the two of you. Nobody else can join.</li><li>Each message disappears a few seconds after it has been seen. When you end the chat, everything is deleted.</li></ol>
  <h2>Good to know</h2>
  <details class="chq"><summary>Can you read my messages?</summary><p>No. Messages are encrypted in your browser with a key that lives only in the link, after the # sign. The server never receives the key, so it only passes on scrambled text.</p></details>
  <details class="chq"><summary>Can someone take a screenshot?</summary><p>Yes. No website can stop a screenshot or a photo of the screen. Only chat with people you trust.</p></details>
  <details class="chq"><summary>What if my friend is offline?</summary><p>Your message waits, still encrypted, until your friend has seen it. It is deleted at once when seen. The whole chat link expires 7 days after it was created.</p></details>
  <details class="chq"><summary>What if someone I do not know sends me a link?</summary><p>You do not have to open it. If someone is rude or threatening, close the page, or tap End chat, and tell us on the Contact page.</p></details>
  <p class="chn">Do not use private chat for anything illegal or to harass anyone.</p></div>
 <div id="ch-room" hidden>
  <div class="chk">Private chat</div><div class="chst wait" id="ch-st"><i></i><span>Connecting…</span></div>
  <div class="chbox" id="ch-share" hidden><b>Send this link to one person only</b><p class="chn" style="margin:4px 0 8px">It locks when your friend opens it. Anyone who has this link can read the chat, so do not post it in public. <b id="ch-exp"></b></p><input id="ch-link" readonly aria-label="Chat link"><div class="chs"><button class="chb" id="ch-copy" type="button">Copy link</button><button class="chb g" id="ch-share-b" type="button">Share…</button></div><div class="shi" role="group" aria-label="Share this chat link"><div id="ch-icons"></div></div></div>
  <div class="chlog" id="ch-log" aria-live="polite"><div class="e">Messages will appear here. They disappear after they are seen.</div></div>
  <div class="chn" id="ch-ty" style="min-height:18px"></div>
  <div class="chc"><textarea id="ch-in" rows="1" maxlength="1000" placeholder="Write a message" aria-label="Message"></textarea><button class="chb" id="ch-send" type="button">Send</button></div>
  <div class="chs" style="justify-content:space-between;align-items:center"><label class="chn" style="margin:0">Disappear after seen: <select id="ch-sec"><option value="5">5 s</option><option value="10" selected>10 s</option><option value="30">30 s</option><option value="60">60 s</option></select></label><button class="chb r" id="ch-end" type="button">End chat</button></div>
  <p class="chn">Screenshots cannot be blocked. Chat only with people you trust. To report abuse, end the chat and write to us on the Contact page.</p>
 </div></div>`};
window.chatInit=function(){
 dispose();
 const root=$('ch');if(!root)return;
 $('ch-new').onclick=()=>{const r=rid(16),k=rid(32);history.replaceState(null,'','/chat#'+r+'.'+k);open(r,k)};
 const h=parseHash();if(h)open(h.room,h.key);else if(location.hash==='#ch-how'){const e=$('ch-how');if(e)e.scrollIntoView()}
};
function setSt(txt,cls){const e=$('ch-st');if(!e)return;e.className='chst '+(cls||'');e.lastChild.textContent=txt}
function add(m){S.msgs.set(m.id,m);draw()}
function draw(){
 const log=$('ch-log');if(!log||!S)return;const now=Date.now();
 const keep=[...S.msgs.values()];
 if(!keep.length){log.innerHTML='<div class="e">Messages will appear here. They disappear after they are seen.</div>';return}
 const stick=log.scrollTop+log.clientHeight>=log.scrollHeight-40;
 log.textContent='';
 for(const m of keep){
  const d=document.createElement('div');d.className='chm '+(m.mine?'me':'th')+(m.until&&m.until-now<600?' go':'');
  const t=document.createElement('div');t.textContent=m.text;d.appendChild(t);
  const s=document.createElement('small');
  s.textContent=m.until?'Seen · disappears in '+Math.max(0,Math.ceil((m.until-now)/1000))+' s':m.mine?(m.state==='sent'?'Sent · not seen yet':'Sending…'):'Reading…';
  d.appendChild(s);log.appendChild(d)}
 if(stick)log.scrollTop=log.scrollHeight}
function startSeen(m){if(m.until)return;m.until=Date.now()+S.sec*1000;draw()}
function ackPending(){
 if(!S||!S.ws||S.ws.readyState!==1||document.visibilityState!=='visible')return;
 for(const m of S.msgs.values())if(!m.mine&&!m.acked){m.acked=1;S.ws.send(JSON.stringify({t:'seen',id:m.id}));startSeen(m)}}
async function enc(text){const iv=crypto.getRandomValues(new Uint8Array(12));const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},S.key,new TextEncoder().encode(JSON.stringify({m:text})));return{iv:B64(iv),ct:B64(ct)}}
async function dec(iv,ct){try{const p=await crypto.subtle.decrypt({name:'AES-GCM',iv:UB64(iv)},S.key,UB64(ct));return JSON.parse(new TextDecoder().decode(p)).m}catch(e){return null}}
async function open(room,keyB64){
 $('ch-start').hidden=true;$('ch-room').hidden=false;
 let key;try{key=await crypto.subtle.importKey('raw',UB64(keyB64),'AES-GCM',false,['encrypt','decrypt'])}catch(e){setSt('This link is not valid.');return}
 let cid;try{cid=localStorage.getItem('skc_'+room);if(!cid){cid=rid(18);localStorage.setItem('skc_'+room,cid)}}catch(e){cid=rid(18)}
 let sec=10;try{sec=+localStorage.getItem('sk_chsec')||10}catch(e){}
 S={room,key,cid,msgs:new Map(),ws:null,tries:0,stop:false,peer:false,locked:false,sec,slot:null};
 $('ch-sec').value=String(sec);if($('ch-sec').value!==String(sec))$('ch-sec').value='10';
 $('ch-sec').onchange=e=>{S.sec=+e.target.value;try{localStorage.setItem('sk_chsec',String(S.sec))}catch(x){}};
 const link=location.href;$('ch-link').value=link;
 $('ch-copy').onclick=()=>{const b=$('ch-copy');const done=()=>{b.textContent='Copied ✓';setTimeout(()=>b.textContent='Copy link',1600)};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(link).then(done,()=>{$('ch-link').select()});else{$('ch-link').select()}};
 $('ch-share-b').onclick=()=>{if(navigator.share)navigator.share({title:'Private chat',text:'Open this link to chat with me privately.',url:link}).catch(()=>{});else $('ch-copy').click()};
 {const u=encodeURIComponent(link),t=encodeURIComponent('Open this link to chat with me privately:'),f=p=>'<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true">'+p+'</svg>',l=(h,n,i)=>'<a href="'+h+'" target="_blank" rel="noopener" aria-label="'+n+'" title="'+n+'">'+i+'</a>';
  $('ch-icons').innerHTML=l('https://www.facebook.com/sharer/sharer.php?u='+u,'Share on Facebook',f(SH.fb))+l('https://twitter.com/intent/tweet?url='+u+'&text='+t,'Share on X',f(SH.x))+l('https://wa.me/?text='+t+'%20'+u,'Share on WhatsApp',f(SH.wa))+l('mailto:?subject='+encodeURIComponent('Private chat')+'&body='+t+'%20'+u,'Share by email','<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 6 9-6"/></svg>')}
 $('ch-send').onclick=send;
 $('ch-in').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!/Android|iPhone|iPad/i.test(navigator.userAgent)){e.preventDefault();send()}};
 let lt=0;$('ch-in').oninput=()=>{const n=Date.now();if(S.ws&&S.ws.readyState===1&&n-lt>2500){lt=n;S.ws.send(JSON.stringify({t:'typing'}))}};
 $('ch-end').onclick=()=>{if(!confirm('End this chat for both of you and delete everything?'))return;if(S.ws&&S.ws.readyState===1)S.ws.send(JSON.stringify({t:'end'}));else finish('Chat ended.')};
 document.onvisibilitychange=ackPending;window.onfocus=ackPending;
 tick=setInterval(()=>{if(!S||!$('ch-log')){dispose();return}let ch=false;const now=Date.now();for(const [id,m] of [...S.msgs]){if(m.until&&m.until<=now){S.msgs.delete(id);ch=true}}if(ch||[...S.msgs.values()].some(m=>m.until))draw()},500);
 connect();
}
function finish(txt){if(!S)return;S.stop=true;S.msgs.clear();draw();setSt(txt);const sh=$('ch-share');if(sh)sh.hidden=true;const i=$('ch-in'),b=$('ch-send');if(i)i.disabled=true;if(b)b.disabled=true;try{S.ws&&S.ws.close()}catch(e){}
 const l=$('ch-log');if(l){l.innerHTML='<div class="e">'+txt+'<br><br><button class="chb" type="button" id="ch-again">Create a new link</button></div>';$('ch-again').onclick=()=>{history.replaceState(null,'','/chat');if(window.go)go();else location.reload()}}}
function connect(){
 if(!S||S.stop)return;
 const ws=new WebSocket((location.protocol==='https:'?'wss:':'ws:')+'//'+location.host+'/api/chat/'+S.room);S.ws=ws;
 setSt(S.tries?'Reconnecting…':'Connecting…','wait');
 ws.onopen=()=>{S.tries=0;ws.send(JSON.stringify({t:'hello',cid:S.cid}))};
 ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(x){return}onMsg(m)};
 ws.onclose=()=>{if(!S||S.stop||S.ws!==ws)return;if(S.tries>=6){setSt('Chat is not available right now. Try again later.');return}S.tries++;setSt('Reconnecting…','wait');setTimeout(connect,Math.min(8000,800*S.tries))};
}
async function onMsg(m){
 if(!S)return;
 if(m.t==='joined'){if(m.exp){const e=$('ch-exp');if(e)e.textContent='This link expires on '+new Date(m.exp).toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'})+'.'}S.slot=m.you;S.peer=m.peer;S.locked=m.locked;status();return}
 if(m.t==='peer'){S.peer=m.on;if(m.locked)S.locked=true;if(m.on)S.hadPeer=true;status();return}
 if(m.t==='full'){finish('This chat already has two people, so you cannot join it.');return}
 if(m.t==='replaced'){finish('This chat was opened in another tab. Close this one.');return}
 if(m.t==='ended'){finish(m.why==='expired'?'This link has expired. Links work for 7 days. Create a new one.':'Chat ended and deleted.');return}
 if(m.t==='sent'){const x=S.msgs.get(m.id);if(x){x.state='sent';draw()}return}
 if(m.t==='seen'){const x=S.msgs.get(m.id);if(x)startSeen(x);return}
 if(m.t==='typing'){const t=$('ch-ty');if(t){t.textContent='Your friend is typing…';clearTimeout(S.tt);S.tt=setTimeout(()=>{const y=$('ch-ty');if(y)y.textContent=''},2500)}return}
 if(m.t==='err'){const t=$('ch-ty');if(t)t.textContent=m.e==='slow'?'You are sending too fast. Wait a moment.':'Your friend has too many unread messages.';return}
 if(m.t==='msg'){if(S.msgs.has(m.id))return;const text=await dec(m.iv,m.ct);S.hadPeer=true;add({id:m.id,mine:false,text:text===null?'This message could not be opened. The link may be incomplete.':text});ackPending()}
}
function status(){
 if(!S)return;
 if(S.peer)setSt('Connected · only you two are here','on');
 else if(S.locked||S.hadPeer)setSt('Your friend is away. They will see your messages when they come back.','wait');
 else setSt('Waiting for your friend to open the link','wait');
 const sh=$('ch-share');if(sh)sh.hidden=!!S.locked;
}
async function send(){
 const i=$('ch-in');if(!S||!i)return;const text=i.value.trim().slice(0,1000);if(!text)return;
 if(!S.ws||S.ws.readyState!==1){const t=$('ch-ty');if(t)t.textContent='Not connected yet. Try again in a moment.';return}
 const id=rid(9);const {iv,ct}=await enc(text);
 S.msgs.set(id,{id,mine:true,text,state:'sending'});draw();
 S.ws.send(JSON.stringify({t:'msg',id,iv,ct}));i.value='';i.focus();
}
})();
