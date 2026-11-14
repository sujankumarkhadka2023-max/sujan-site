/* Private and group chat. Encrypted in the browser, deleted after one hour, links last 7 days.
   Loaded by index.html when /chat is opened. Upload it next to index.html. */
(function(){
'use strict';
const HOUR=36e5,MAXG=5,GMAX=20;
const CSS=`
.ch{max-width:760px;margin:0 auto;padding:6px 0 48px;font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--tx)}
.ch *{box-sizing:border-box}
.ch .chk{font:700 13px system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--ac);margin:18px 0 0}
.ch h1{font:700 40px/1.08 Georgia,"Times New Roman",serif;margin:6px 0 10px;letter-spacing:-.01em}
.ch .chd{font:20px/1.4 Georgia,serif;color:var(--mu);margin:0 0 22px}
.ch h2{font:700 22px Georgia,serif;margin:30px 0 4px;padding-top:12px;border-top:1px solid var(--ln)}
.ch h2 small{font:600 14px system-ui,sans-serif;color:var(--mu);margin-left:8px}
.ch button,.ch select,.ch textarea,.ch input{font:inherit}
.chb{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:var(--nv);color:#fff;border:1px solid var(--nv);border-radius:999px;padding:11px 22px;font:700 15px system-ui,sans-serif;cursor:pointer;text-decoration:none}
.chb:hover{background:#ffd900;border-color:#ffd900;color:#052962}
.chb:disabled{opacity:.45;cursor:default;background:var(--nv);color:#fff}
.chb.g{background:transparent;color:var(--tx);border-color:var(--ln);padding:8px 16px;font-size:14px}
.chb.g:hover{border-color:var(--tx);background:transparent;color:var(--tx)}
.chb.r{background:transparent;color:var(--ac);border-color:var(--ac);padding:8px 16px;font-size:14px}
.chb.r:hover{background:var(--ac);color:#fff}
.chgrid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:620px){.chgrid{grid-template-columns:1fr}.ch h1{font-size:32px}}
.chcard{border-top:4px solid var(--nv);padding:12px 0 6px}
.chcard.gr{border-top-color:#ffd900}
.chcard h3{font:700 22px/1.15 Georgia,serif;margin:0 0 6px}
.chcard p{margin:0 0 12px;color:var(--mu);font-size:15px}
.chcard input{width:100%;padding:10px 12px;margin:0 0 10px;border:1px solid var(--ln);border-radius:4px;background:var(--bg);color:var(--tx)}
.chrow{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--ln)}
.chrow .t{flex:1;min-width:0}.chrow b{display:block;font:700 17px Georgia,serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.chrow span{font-size:13px;color:var(--mu)}
.chbadge{font:700 11px system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;border:1px solid var(--ln);padding:3px 7px;border-radius:3px;color:var(--mu)}
.chnote{border-left:4px solid var(--ac);padding:8px 12px;margin:14px 0;background:color-mix(in srgb,var(--ac) 7%,var(--bg));font-size:15px}
.chst{display:flex;align-items:center;gap:8px;font:600 14px system-ui,sans-serif;color:var(--mu);margin:6px 0}
.chst i{width:10px;height:10px;border-radius:50%;background:#999;display:inline-block}.chst.on i{background:#2e9e5b}.chst.wait i{background:#e5a100}
.chbox{border:1px solid var(--ln);border-top:4px solid var(--nv);padding:14px;margin:12px 0}
.chbox input{width:100%;padding:10px;border:1px solid var(--ln);border-radius:4px;background:var(--bg);color:var(--tx);font:14px ui-monospace,monospace}
.chlog{height:min(54vh,480px);overflow-y:auto;border:1px solid var(--ln);padding:12px;display:flex;flex-direction:column;gap:8px;background:color-mix(in srgb,var(--tx) 3%,var(--bg))}
.chlog .e{margin:auto;color:var(--mu);text-align:center;font-size:15px;max-width:340px}
.chm{max-width:84%;padding:9px 12px;border-radius:12px;word-wrap:break-word;overflow-wrap:anywhere;white-space:pre-wrap}
.chm.me{align-self:flex-end;background:var(--nv);color:#fff;border-bottom-right-radius:3px}
.chm.th{align-self:flex-start;border:1px solid var(--ln);background:var(--bg);border-bottom-left-radius:3px}
.chm .w{display:block;font:700 12px system-ui,sans-serif;color:var(--ac);margin-bottom:2px}
.chm small{display:block;font:12px system-ui,sans-serif;opacity:.75;margin-top:3px;white-space:normal}
.chc{display:flex;gap:8px;margin-top:10px;align-items:flex-end}
.chc textarea{flex:1;min-height:46px;max-height:130px;resize:none;padding:11px;border:1px solid var(--ln);border-radius:8px;background:var(--bg);color:var(--tx)}
.chn{font:13px/1.45 system-ui,sans-serif;color:var(--mu);margin:10px 0}
.chq{border-bottom:1px solid var(--ln);padding:10px 0}.chq summary{cursor:pointer;font-weight:700}.chq p{margin:8px 0 0;color:var(--mu)}
.chl{padding-left:20px}.chl li{margin:7px 0}
.chbar{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.chs{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
.chwho{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;border-bottom:1px solid var(--ln);padding:8px 0;margin-bottom:6px;font-size:14px;color:var(--mu)}.chwho b{color:var(--tx)}.chwho code{font:600 13px ui-monospace,monospace;background:color-mix(in srgb,var(--tx) 7%,var(--bg));padding:2px 6px;border-radius:3px}
.chgate{max-width:460px;border-top:4px solid #ffd900;padding-top:14px}#ch-g{min-height:48px;margin:16px 0}
.chnick{display:flex;gap:8px;align-items:center;margin:8px 0;font-size:14px;color:var(--mu)}.chnick input{flex:1;padding:7px 10px;border:1px solid var(--ln);border-radius:4px;background:var(--bg);color:var(--tx)}
`;
const SH={fb:'<path d="M13.5 22v-8h2.7l.5-3.3h-3.2V8.6c0-.9.3-1.6 1.7-1.6h1.6V4.1C16.4 4 15.5 4 14.4 4 12 4 10.3 5.5 10.3 8.2v2.5H7.5V14h2.8v8z"/>',x:'<path d="M18.2 3h3.1l-6.8 7.8L22.5 21h-6.3l-4.9-6.4L5.6 21H2.5l7.3-8.3L2 3h6.4l4.4 5.9zm-1.1 16.2h1.7L7.3 4.7H5.5z"/>',wa:'<path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.1.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.5.2.3.7 1.2 1.5 1.9 1 .9 1.9 1.2 2.2 1.3.3.1.4.1.6-.1l.8-1c.2-.2.3-.2.5-.1l1.8.9c.2.1.4.2.4.3.1.2.1.8-.1 1.5z"/>'};
const B64=u=>{let s='';u=new Uint8Array(u);for(let i=0;i<u.length;i++)s+=String.fromCharCode(u[i]);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const UB64=t=>{t=t.replace(/-/g,'+').replace(/_/g,'/');while(t.length%4)t+='=';const s=atob(t),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u};
const rid=n=>B64(crypto.getRandomValues(new Uint8Array(n)));
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ls={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
const nameEnc=n=>B64(new TextEncoder().encode(n.slice(0,40)));
const nameDec=t=>{try{return new TextDecoder().decode(UB64(t))}catch(e){return 'Group'}};
function parseHash(){
 const h=location.hash||'';let m=h.match(/^#([A-Za-z0-9_-]{16,64})\.([A-Za-z0-9_-]{43})$/);if(m)return{k:'p',room:m[1],key:m[2]};
 m=h.match(/^#g:([A-Za-z0-9_-]{16,64})\.([A-Za-z0-9_-]{43})(?:\.([A-Za-z0-9_-]*))?$/);if(m)return{k:'g',room:m[1],key:m[2],name:m[3]?nameDec(m[3]):'Group'};return null}
const hashOf=e=>e.k==='g'?'#g:'+e.r+'.'+e.key+'.'+nameEnc(e.n||'Group'):'#'+e.r+'.'+e.key;
function chats(){const now=Date.now();const a=ls.get('sk_chats',[]).filter(e=>e&&e.r&&e.key&&e.x>now);ls.set('sk_chats',a);return a}
function saveChat(e){const a=chats().filter(x=>x.r!==e.r);a.unshift(e);ls.set('sk_chats',a)}
function dropChat(r){ls.set('sk_chats',chats().filter(x=>x.r!==r));ls.del('skm_'+r)}
let S=null,tick=0;
function dispose(){if(S){S.stop=true;try{S.ws&&S.ws.close()}catch(e){}}S=null;if(tick){clearInterval(tick);tick=0}}
function left(ms){const s=Math.max(0,Math.ceil(ms/1000));if(s>=3600)return Math.ceil(s/3600)+' h';if(s>=60)return Math.ceil(s/60)+' min';return s+' s'}
function days(ms){const d=Math.max(0,Math.ceil(ms/864e5));return d+(d===1?' day':' days')}

window.chatPg=function(){
 document.title='Private and group chat — The Sujan Khadka';
 if(!document.getElementById('chat-css')){const s=document.createElement('style');s.id='chat-css';s.textContent=CSS;document.head.appendChild(s)}
 return '<div class="ch" id="ch"></div>'};
const CFG={loaded:false,gid:''};
const sess=()=>{const u=ls.get('sk_cu',null);if(u&&u.token&&u.exp>Date.now())return u;if(u)ls.del('sk_cu');return null};
const uidLabel=u=>'SK-'+u.uid.slice(1,7).toUpperCase();
function loadGis(){return new Promise((ok,no)=>{if(window.google&&google.accounts&&google.accounts.id)return ok();const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.onload=()=>ok();s.onerror=()=>no();document.head.appendChild(s)})}
async function gate(root,msg){
 root.innerHTML=`<div class="chk">Chat</div><h1>Sign in to chat</h1><p class="chd">Sign in with your Google account to use private and group chat.</p>
 <div class="chgate"><b>Why sign in?</b><ol class="chl"><li>You get a personal chat ID, so only real accounts can join.</li><li>Your group limit follows you to every phone and computer.</li><li>Rude or abusive people cannot hide behind a fresh browser.</li></ol>
 ${msg?'<div class="chnote">'+esc(msg)+'</div>':''}<div id="ch-g"><span class="chn">Loading Google sign-in…</span></div>
 <p class="chn">We keep only a scrambled ID made from your account. We never show or store your email, and your messages stay locked in your browser.</p></div>`;
 try{await loadGis();google.accounts.id.initialize({client_id:CFG.gid,callback:onCred,ux_mode:'popup'});$('ch-g').textContent='';google.accounts.id.renderButton($('ch-g'),{theme:'outline',size:'large',shape:'pill',text:'continue_with',width:280})}
 catch(e){const g=$('ch-g');if(g)g.innerHTML='<div class="chnote">Google sign-in could not load. Check your connection and refresh.</div>'}
}
async function onCred(r){
 const root=$('ch');if(!root)return;
 try{const x=await fetch('/api/chat-login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({credential:r.credential})});const j=await x.json();
  if(!x.ok||!j.token){gate(root,j.error||'Sign-in failed. Please try again.');return}
  ls.set('sk_cu',{token:j.token,uid:j.uid,name:j.name,exp:j.exp});route()}
 catch(e){gate(root,'Sign-in failed. Please try again.')}
}
window.chatInit=function(){
 window.onhashchange=()=>{if($('ch'))route()};
 route();
};
async function route(){
 dispose();const root=$('ch');if(!root)return;
 if(!CFG.loaded){try{const j=await (await fetch('/api/chat-config')).json();CFG.gid=j.gid||''}catch(e){}CFG.loaded=true;if(!$('ch'))return}
 if(CFG.gid&&!sess()){gate(root);return}
 const h=parseHash();
 if(!h){hub(root);const hs=location.hash;if(hs==='#ch-how'||hs==='#groups'){setTimeout(()=>{const e=$(hs==='#groups'?'ch-groups':'ch-how');if(e)e.scrollIntoView()},60)}return}
 room(root,h);
}
/* ---------------- hub ---------------- */
function who(){const u=CFG.gid&&sess();return u?`<div class="chwho"><span>Signed in${u.name?' as <b>'+esc(u.name)+'</b>':''} · Your chat ID <code>${uidLabel(u)}</code></span><button class="chb g" id="ch-out" type="button">Sign out</button></div>`:''}
function hub(root,notice){
 const all=chats(),gs=all.filter(e=>e.k==='g'),ps=all.filter(e=>e.k==='p'),now=Date.now();
 const row=e=>`<div class="chrow"><div class="t"><b>${esc(e.n||(e.k==='g'?'Group':'Private chat'))}</b><span>${e.k==='g'?'Group':'Private'} · expires in ${days(e.x-now)}</span></div><button class="chb g" data-open="${e.r}" type="button">Open</button><button class="chb r" data-rm="${e.r}" type="button">${e.k==='g'?'Leave':'Remove'}</button></div>`;
 root.innerHTML=`<div class="chk">Chat</div><h1>Private and group chat</h1>
 <p class="chd">Talk with one person or a small group. Messages are locked in your browser and disappear after one hour.</p>
 ${who()}
 ${notice?'<div class="chnote">'+notice+'</div>':''}
 <div class="chgrid">
  <div class="chcard"><div class="chk" style="margin:0">Two people</div><h3>Private chat</h3><p>One link, one friend. Make as many links as you like, one for each person.</p><button class="chb" id="ch-new-p" type="button">Start a private chat</button></div>
  <div class="chcard gr" id="ch-groups"><div class="chk" style="margin:0">Up to ${GMAX} people</div><h3>Group chat</h3><p>Name your group, then share the link. You can be in ${MAXG} groups at a time.</p><input id="ch-gname" maxlength="40" placeholder="Group name" aria-label="Group name"><button class="chb" id="ch-new-g" type="button">Create a group</button></div>
 </div>
 <h2>Your private chats<small>${ps.length}</small></h2>${ps.length?ps.map(row).join(''):'<p class="chn">No private chats yet.</p>'}
 <h2>Your groups<small>${gs.length} of ${MAXG}</small></h2>${gs.length?gs.map(row).join(''):'<p class="chn">You are not in any group yet.</p>'}
 <h2 id="ch-how">How it works</h2>
 <ol class="chl"><li>Start a chat or create a group. You get a private link that works for 7 days.</li><li>Send the link to your friend or your group on WhatsApp, Messenger, email or any app.</li><li>A private chat locks to the two of you. A group takes up to ${GMAX} people.</li><li>Every message disappears one hour after it is seen. After 7 days the link expires and you create a new one.</li></ol>
 <h2>Good to know</h2>
 <details class="chq"><summary>Can you read my messages?</summary><p>No. Messages are locked in your browser with a key that lives only in the link, after the # sign. The server never receives the key, so it only passes on scrambled text.</p></details>
 <details class="chq"><summary>Can someone take a screenshot?</summary><p>Yes. No website can stop a screenshot or a photo of the screen. Only chat with people you trust.</p></details>
 <details class="chq"><summary>What about the limit of ${MAXG} groups?</summary><p>The limit is kept on your device. It stops you joining more than ${MAXG} groups here. Leave a group to free a place.</p></details>
 <details class="chq"><summary>What if someone I do not know sends me a link?</summary><p>You do not have to open it. If someone is rude or threatening, leave the chat and tell us on the Contact page.</p></details>
 <p class="chn">Do not use chat for anything illegal or to harass anyone. Anyone with a link can read that chat, so share links only with people you trust.</p>`;
 {const o=$('ch-out');if(o)o.onclick=()=>{ls.del('sk_cu');try{google.accounts.id.disableAutoSelect()}catch(e){}route()}}
 $('ch-new-p').onclick=()=>{location.hash='#'+rid(16)+'.'+rid(32)};
 $('ch-new-g').onclick=()=>{if(chats().filter(e=>e.k==='g').length>=MAXG){hub(root,'You are already in '+MAXG+' groups, which is the most you can join. Leave one below to make room.');return}
  const n=($('ch-gname').value||'').trim()||'Group chat';location.hash='#g:'+rid(16)+'.'+rid(32)+'.'+nameEnc(n)};
 root.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{const e=chats().find(x=>x.r===b.dataset.open);if(e)location.hash=hashOf(e)});
 root.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{const e=chats().find(x=>x.r===b.dataset.rm);if(!e)return;
  if(!confirm(e.k==='g'?'Leave this group? You will free one of your '+MAXG+' places.':'Remove this chat from your list? The other person keeps their copy.'))return;
  if(e.k==='g')leaveRemote(e);dropChat(e.r);hub(root)});
}
function leaveRemote(e){try{const ws=new WebSocket((location.protocol==='https:'?'wss:':'ws:')+'//'+location.host+'/api/group/'+e.r);const cid=ls.get('skc_'+e.r,null)||(CFG.gid&&sess()?'x'.repeat(16):null);
 if(!cid){return}ws.onopen=()=>{const u=CFG.gid&&sess();ws.send(JSON.stringify({t:'hello',cid,tok:u?u.token:undefined}));setTimeout(()=>{try{ws.send(JSON.stringify({t:'leave'}))}catch(x){}setTimeout(()=>{try{ws.close()}catch(x){}},400)},300)}}catch(x){}}
/* ---------------- room ---------------- */
async function room(root,h){
 const isG=h.k==='g';let ent=chats().find(x=>x.r===h.room);
 if(!ent){const gs=chats().filter(e=>e.k==='g');if(isG&&gs.length>=MAXG){hub(root,'You are already in '+MAXG+' groups, which is the most you can join. Leave one below, then open the link again.');history.replaceState(null,'','/chat');return}
  ent={k:h.k,r:h.room,key:h.key,n:isG?h.name:'Private chat',c:Date.now(),x:Date.now()+7*864e5};saveChat(ent)}
 let key;try{key=await crypto.subtle.importKey('raw',UB64(h.key),'AES-GCM',false,['encrypt','decrypt'])}catch(e){root.innerHTML='<div class="chnote">This link is not valid.</div><button class="chb" onclick="location.hash=\'\'">All chats</button>';return}
 let cid=ls.get('skc_'+h.room,null);if(!cid){cid=rid(18);ls.set('skc_'+h.room,cid)}
 S={k:h.k,room:h.room,key,cid,msgs:new Map(),ws:null,tries:0,stop:false,peer:false,locked:false,hadPeer:false,ent,link:location.href,owner:false,on:0,members:0,nick:ls.get('sk_nick','')};
 const title=esc(isG?ent.n:'Private chat');
 root.innerHTML=`<div class="chbar"><button class="chb g" id="ch-back" type="button">← All chats</button><span class="chbadge">${isG?'Group · up to '+GMAX:'Two people'}</span></div>
 <div class="chk">${isG?'Group chat':'Private chat'}</div><h1 style="font-size:32px">${title}</h1>${who()}
 <div class="chst wait" id="ch-st"><i></i><span>Connecting…</span></div>
 <div class="chbox" id="ch-share"${isG?'':' hidden'}><b>${isG?'Invite people to this group':'Send this link to one person only'}</b><p class="chn" style="margin:4px 0 8px">${isG?'Anyone with this link can join and read the group, up to '+GMAX+' people. ':'It locks when your friend opens it. Anyone who has this link can read the chat. '}<b id="ch-exp"></b></p><input id="ch-link" readonly aria-label="Chat link"><div class="chs"><button class="chb" id="ch-copy" type="button">Copy link</button><button class="chb g" id="ch-share-b" type="button">Share…</button></div><div class="shi" role="group" aria-label="Share this chat link"><div id="ch-icons"></div></div></div>
 ${isG?'<label class="chnick">Your name in this group <input id="ch-nick" maxlength="20" placeholder="For example Sujan"></label>':''}
 <div class="chlog" id="ch-log" aria-live="polite"></div><div class="chn" id="ch-ty" style="min-height:18px"></div>
 <div class="chc"><textarea id="ch-in" rows="1" maxlength="1000" placeholder="Write a message" aria-label="Message"></textarea><button class="chb" id="ch-send" type="button">Send</button></div>
 <div class="chbar" style="margin-top:8px"><span class="chn" style="margin:0">Messages disappear one hour after they are ${isG?'sent':'seen'}.</span><button class="chb r" id="ch-end" type="button">${isG?(ent.owner?'End group':'Leave group'):'End chat'}</button></div>
 <p class="chn">Screenshots cannot be blocked. Chat only with people you trust. To report abuse, leave the chat and write to us on the Contact page.</p>`;
 $('ch-back').onclick=()=>{location.hash=''};{const o=$('ch-out');if(o)o.onclick=()=>{ls.del('sk_cu');route()}}
 const link=location.href;$('ch-link').value=link;
 $('ch-copy').onclick=()=>{const b=$('ch-copy');const done=()=>{b.textContent='Copied ✓';setTimeout(()=>b.textContent='Copy link',1600)};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(link).then(done,()=>{$('ch-link').select()});else{$('ch-link').select()}};
 const txt=isG?'Join my private group "'+ent.n+'":':'Open this link to chat with me privately:';
 $('ch-share-b').onclick=()=>{if(navigator.share)navigator.share({title:isG?ent.n:'Private chat',text:txt,url:link}).catch(()=>{});else $('ch-copy').click()};
 {const u=encodeURIComponent(link),t=encodeURIComponent(txt),f=p=>'<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true">'+p+'</svg>',l=(h,n,i)=>'<a href="'+h+'" target="_blank" rel="noopener" aria-label="'+n+'" title="'+n+'">'+i+'</a>';
  $('ch-icons').innerHTML=l('https://www.facebook.com/sharer/sharer.php?u='+u,'Share on Facebook',f(SH.fb))+l('https://twitter.com/intent/tweet?url='+u+'&text='+t,'Share on X',f(SH.x))+l('https://wa.me/?text='+t+'%20'+u,'Share on WhatsApp',f(SH.wa))+l('mailto:?subject='+encodeURIComponent(isG?ent.n:'Private chat')+'&body='+t+'%20'+u,'Share by email','<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 6 9-6"/></svg>')}
 if(isG){const ni=$('ch-nick');ni.value=S.nick;ni.onchange=()=>{S.nick=ni.value.trim().slice(0,20);ls.set('sk_nick',S.nick)}}
 $('ch-send').onclick=send;
 $('ch-in').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!/Android|iPhone|iPad/i.test(navigator.userAgent)){e.preventDefault();send()}};
 let lt=0;$('ch-in').oninput=()=>{const n=Date.now();if(S.ws&&S.ws.readyState===1&&n-lt>2500){lt=n;S.ws.send(JSON.stringify({t:'typing'}))}};
 $('ch-end').onclick=()=>{
  if(isG){if(S.owner){if(!confirm('End this group for everyone and delete all messages?'))return;S.ws&&S.ws.readyState===1?S.ws.send(JSON.stringify({t:'end'})):finish('Group ended.')}
   else{if(!confirm('Leave this group? You will free one of your '+MAXG+' places.'))return;if(S.ws&&S.ws.readyState===1)S.ws.send(JSON.stringify({t:'leave'}));dropChat(S.room);location.hash=''}}
  else{if(!confirm('End this chat for both of you and delete everything?'))return;if(S.ws&&S.ws.readyState===1)S.ws.send(JSON.stringify({t:'end'}));else finish('Chat ended.')}};
 document.onvisibilitychange=ackPending;window.onfocus=ackPending;
 await load();draw();
 tick=setInterval(()=>{if(!S||!$('ch-log')){dispose();return}const now=Date.now();let ch=false;for(const [id,m] of [...S.msgs]){if(m.until&&m.until<=now){S.msgs.delete(id);ch=true}}if(ch)persist();draw()},1000);
 connect();
}
/* encrypted copy of this chat's messages on this device, so a refresh keeps them for their hour */
async function persist(){if(!S)return;const now=Date.now();const a=[...S.msgs.values()].filter(m=>m.state!=='sending'&&(!m.until||m.until>now)).map(m=>({id:m.id,mine:m.mine,text:m.text,n:m.n,ts:m.ts,until:m.until,state:m.state,acked:m.acked}));
 try{const iv=crypto.getRandomValues(new Uint8Array(12));const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},S.key,new TextEncoder().encode(JSON.stringify(a)));ls.set('skm_'+S.room,{iv:B64(iv),ct:B64(ct)})}catch(e){}}
async function load(){const v=ls.get('skm_'+S.room,null);if(!v)return;try{const p=await crypto.subtle.decrypt({name:'AES-GCM',iv:UB64(v.iv)},S.key,UB64(v.ct));const now=Date.now();for(const m of JSON.parse(new TextDecoder().decode(p)))if(!m.until||m.until>now)S.msgs.set(m.id,m)}catch(e){}}
function draw(){
 const log=$('ch-log');if(!log||!S)return;const now=Date.now();
 const keep=[...S.msgs.values()].sort((a,b)=>(a.ts||0)-(b.ts||0));
 if(!keep.length){log.innerHTML='<div class="e">Messages will appear here. They disappear one hour after they are seen.</div>';return}
 const stick=log.scrollTop+log.clientHeight>=log.scrollHeight-40;log.textContent='';
 for(const m of keep){
  const d=document.createElement('div');d.className='chm '+(m.mine?'me':'th');
  if(S.k==='g'&&!m.mine&&m.n){const w=document.createElement('span');w.className='w';w.textContent=m.n;d.appendChild(w)}
  const t=document.createElement('div');t.textContent=m.text;d.appendChild(t);
  const s=document.createElement('small');
  if(m.until)s.textContent=(S.k==='g'?'':'Seen · ')+'disappears in '+left(m.until-now);
  else s.textContent=m.mine?(m.state==='sent'?'Sent · not seen yet':'Sending…'):'Reading…';
  d.appendChild(s);log.appendChild(d)}
 if(stick)log.scrollTop=log.scrollHeight}
function startSeen(m,from){if(m.until)return;m.until=(from||Date.now())+HOUR;persist();draw()}
function ackPending(){
 if(!S||S.k!=='p'||!S.ws||S.ws.readyState!==1||document.visibilityState!=='visible')return;
 for(const m of S.msgs.values())if(!m.mine&&!m.acked){m.acked=1;S.ws.send(JSON.stringify({t:'seen',id:m.id}));startSeen(m)}}
async function enc(text){const iv=crypto.getRandomValues(new Uint8Array(12));const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},S.key,new TextEncoder().encode(JSON.stringify({m:text,n:S.k==='g'?S.nick||'Guest':undefined})));return{iv:B64(iv),ct:B64(ct)}}
async function dec(iv,ct){try{const p=await crypto.subtle.decrypt({name:'AES-GCM',iv:UB64(iv)},S.key,UB64(ct));return JSON.parse(new TextDecoder().decode(p))}catch(e){return null}}
function setSt(txt,cls){const e=$('ch-st');if(!e)return;e.className='chst '+(cls||'');e.lastChild.textContent=txt}
function finish(txt){if(!S)return;S.stop=true;const r=S.room;S.msgs.clear();dropChat(r);const sh=$('ch-share');if(sh)sh.hidden=true;setSt(txt);const i=$('ch-in'),b=$('ch-send');if(i)i.disabled=true;if(b)b.disabled=true;try{S.ws&&S.ws.close()}catch(e){}
 const l=$('ch-log');if(l){l.innerHTML='<div class="e">'+txt+'<br><br><button class="chb" type="button" id="ch-again">Back to all chats</button></div>';$('ch-again').onclick=()=>{location.hash=''}}}
function connect(){
 if(!S||S.stop)return;
 const ws=new WebSocket((location.protocol==='https:'?'wss:':'ws:')+'//'+location.host+'/api/'+(S.k==='g'?'group':'chat')+'/'+S.room);S.ws=ws;
 setSt(S.tries?'Reconnecting…':'Connecting…','wait');
 ws.onopen=()=>{S.tries=0;const u=CFG.gid&&sess();ws.send(JSON.stringify({t:'hello',cid:S.cid,tok:u?u.token:undefined}))};
 ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(x){return}onMsg(m)};
 ws.onclose=()=>{if(!S||S.stop||S.ws!==ws)return;if(S.tries>=6){setSt('Chat is not available right now. Try again later.');return}S.tries++;setSt('Reconnecting…','wait');setTimeout(connect,Math.min(8000,800*S.tries))};
}
async function onMsg(m){
 if(!S)return;
 if(m.t==='joined'){
  if(m.exp){const e=$('ch-exp');if(e)e.textContent='This link expires on '+new Date(m.exp).toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'})+'.';S.ent.x=m.exp;saveChat(S.ent)}
  if(S.k==='g'){S.owner=!!m.owner;if(S.owner){S.ent.owner=1;saveChat(S.ent);const b=$('ch-end');if(b)b.textContent='End group'}gstatus()}
  else{S.peer=m.peer;S.locked=m.locked;status()}return}
 if(m.t==='n'){S.on=m.on;S.members=m.members;gstatus();return}
 if(m.t==='peer'){S.peer=m.on;if(m.locked)S.locked=true;if(m.on)S.hadPeer=true;status();return}
 if(m.t==='auth'){S.stop=true;ls.del('sk_cu');const r=$('ch');if(r)gate(r,'Please sign in again.');return}
 if(m.t==='limit'){S.stop=true;dropChat(S.room);history.replaceState(null,'','/chat');const r=$('ch');if(r)hub(r,'You are already in '+MAXG+' groups on your account, which is the most you can join. Leave one to make room.');return}
 if(m.t==='full'){finish(S.k==='g'?'This group already has '+GMAX+' people, so you cannot join it.':'This chat already has two people, so you cannot join it.');return}
 if(m.t==='replaced'){finish('This chat was opened in another tab. Close this one.');return}
 if(m.t==='ended'){finish(m.why==='expired'?'This link has expired. Links work for 7 days. Create a new one.':'Chat ended and deleted.');return}
 if(m.t==='sent'){const x=S.msgs.get(m.id);if(x){x.state='sent';if(S.k==='g'){x.ts=m.ts;x.until=m.ts+HOUR}persist();draw()}return}
 if(m.t==='seen'){const x=S.msgs.get(m.id);if(x)startSeen(x);return}
 if(m.t==='typing'){const t=$('ch-ty');if(t){t.textContent=S.k==='g'?'Someone is typing…':'Your friend is typing…';clearTimeout(S.tt);S.tt=setTimeout(()=>{const y=$('ch-ty');if(y)y.textContent=''},2500)}return}
 if(m.t==='err'){const t=$('ch-ty');if(t)t.textContent=m.e==='slow'?'You are sending too fast. Wait a moment.':'Your friend has too many unread messages.';return}
 if(m.t==='msg'){if(S.msgs.has(m.id))return;const p=await dec(m.iv,m.ct);S.hadPeer=true;
  const x={id:m.id,mine:false,text:p?p.m:'This message could not be opened. The link may be incomplete.',n:p&&p.n,ts:m.ts||Date.now()};
  if(S.k==='g'){x.until=x.ts+HOUR;if(x.until<=Date.now())return}
  S.msgs.set(m.id,x);persist();draw();ackPending()}
}
function status(){
 if(!S)return;
 if(S.peer)setSt('Connected · only you two are here','on');
 else if(S.locked||S.hadPeer)setSt('Your friend is away. They will see your messages when they come back.','wait');
 else setSt('Waiting for your friend to open the link','wait');
 const sh=$('ch-share');if(sh)sh.hidden=!!S.locked;
}
function gstatus(){if(!S)return;setSt(S.on+' online · '+S.members+' of '+GMAX+' members',S.on>1?'on':'wait')}
async function send(){
 const i=$('ch-in');if(!S||!i)return;const text=i.value.trim().slice(0,1000);if(!text)return;
 if(!S.ws||S.ws.readyState!==1){const t=$('ch-ty');if(t)t.textContent='Not connected yet. Try again in a moment.';return}
 const id=rid(9);const {iv,ct}=await enc(text);
 S.msgs.set(id,{id,mine:true,text,state:'sending',ts:Date.now(),n:S.nick});draw();
 S.ws.send(JSON.stringify({t:'msg',id,iv,ct}));i.value='';i.focus();
}
})();
