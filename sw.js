const V='sk-v5',SHELL=['/','/games','/sudoku','/slide','/2048','/memory','/word','/games.css','/games-fx.js','/common.js','/header.webp','/icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.allSettled(SHELL.map(u=>c.add(u)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const put=(r,res)=>{if(res&&res.ok)caches.open(V).then(c=>c.put(r,res.clone()));return res};
self.addEventListener('fetch',e=>{
 const r=e.request,u=new URL(r.url);
 if(r.method!=='GET'||u.origin!==location.origin)return;
 if(r.headers.has('range')||r.destination==='audio'||r.destination==='video')return;
 if(u.pathname.startsWith('/api/push')||u.pathname==='/api/notice')return;
 if(u.pathname.startsWith('/api/admin')||u.pathname.startsWith('/api/login')||u.pathname.startsWith('/api/logout')||u.pathname.startsWith('/api/view')||u.pathname.startsWith('/developer'))return;
 // stories data: network first, cached copy when offline
 if(u.pathname==='/api/data'){e.respondWith(fetch(r).then(x=>put(r,x)).catch(()=>caches.match(r)));return}
 // images: cache first
 if(u.pathname.startsWith('/img/')||u.pathname.startsWith('/header')){e.respondWith(caches.match(r).then(m=>m||fetch(r).then(x=>put(r,x))));return}
 // pages: network first, fall back to cache (site app shell for story routes)
 if(r.mode==='navigate'){e.respondWith(fetch(r).then(x=>put(r,x)).catch(()=>caches.match(r).then(m=>m||caches.match('/'))));return}
 // other static files (games, css)
 e.respondWith(fetch(r).then(x=>put(r,x)).catch(()=>caches.match(r)));
});
self.addEventListener('push',e=>{e.waitUntil((async()=>{
 let n={title:'The Sujan Khadka',body:'There is something new on the site.',url:'/'};
 try{const r=await fetch('/api/notice',{cache:'no-store'});if(r.ok){const j=await r.json();if(j&&j.title)n=j}}catch(x){}
 await self.registration.showNotification(n.title,{body:n.body||'',icon:'/icon-192.png',badge:'/icon-192.png',data:{url:n.url||'/'},tag:'sk-news',renotify:true})})())});
self.addEventListener('notificationclick',e=>{e.notification.close();const u=(e.notification.data&&e.notification.data.url)||'/';
 e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l){if('focus' in c){try{c.navigate(u)}catch(x){}return c.focus()}}return clients.openWindow(u)}))});
