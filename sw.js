const V='sk-v3',SHELL=['/','/games.html','/sudoku.html','/slide.html','/2048.html','/memory.html','/word.html','/games.css','/games-fx.js','/common.js','/header.webp','/icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.allSettled(SHELL.map(u=>c.add(u)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const put=(r,res)=>{if(res&&res.ok)caches.open(V).then(c=>c.put(r,res.clone()));return res};
self.addEventListener('fetch',e=>{
 const r=e.request,u=new URL(r.url);
 if(r.method!=='GET'||u.origin!==location.origin)return;
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
