(async function(){
const $=s=>document.querySelector(s),pg=document.body.dataset.page;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let C={site:{},footer:{},stories:[]};
try{C=await(await fetch('data/content.json',{cache:'no-store'})).json()}catch(e){}
const S=(C.stories||[]).slice().sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
const site=C.site||{},F=C.footer||{},name=site.name||'SUJAN KUMAR KHADKA';
const LBL={article:'Article',history:'History',travel:'Travel'};
const fd=d=>d?new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}):'';
const meta=s=>`<div class="meta">${[fd(s.date),s.author&&'By '+esc(s.author),s.readTime&&esc(s.readTime)+' min read'].filter(Boolean).join(' · ')}</div>`;
const href=s=>'article.html?id='+encodeURIComponent(s.id);
const card=s=>`<a class="card" href="${href(s)}"><div class="ph">${s.image?`<img loading="lazy" src="${esc(s.image)}" alt="${esc(s.title)}">`:''}</div><div class="cb"><span class="cat">${esc(s.tag||LBL[s.category]||'')}</span><h3>${esc(s.title)}</h3><p>${esc(s.subtitle||'')}</p>${meta(s)}</div></a>`;
const nav=[['index.html','Home','home'],['article.html','Article','article'],['history.html','History','history'],['travel.html','Travel','travel'],['contact.html','Contact','contact']];
$('#header').innerHTML=`<header class="top"><a class="brand" href="index.html">${esc(name)}</a>${site.tagline?`<div class="meta">${esc(site.tagline)}</div>`:''}<nav>${nav.map(n=>`<a href="${n[0]}" class="${n[2]===pg?'active':''}">${n[1]}</a>`).join('')}</nav></header>`;
let uid=0;
function block(title,list,more){
  const id='b'+(uid++);
  if(!list.length)return `<section class="blk"><div class="sh"><h2>${esc(title)}</h2></div><p class="empty">No stories yet.</p></section>`;
  setTimeout(()=>{const b=document.getElementById(id),g=b.querySelector('.grid'),btn=b.querySelector('.more');let n=4;
    const draw=()=>{g.innerHTML=list.slice(0,n).map(card).join('');if(btn&&!more)btn.style.display=n>=list.length?'none':''};
    draw();if(btn&&!more)btn.onclick=()=>{n+=4;draw()}});
  const link=more?`<a class="more" href="${more}">See More →</a>`:(list.length>4?'<button class="more">See More →</button>':'');
  return `<section class="blk" id="${id}"><div class="sh"><h2>${esc(title)}</h2>${link}</div><div class="grid"></div></section>`;
}
const M=$('#main');
if(pg==='home'){
  const f=S.find(s=>s.featured)||S[0],rest=S.filter(s=>s!==f);
  let h='';
  if(f)h+=`<section class="blk"><a class="feat" href="${href(f)}"><div class="ph">${f.image?`<img src="${esc(f.image)}" alt="">`:''}</div><div><span class="cat">Featured · ${esc(LBL[f.category]||'')}</span><h1>${esc(f.title)}</h1><p>${esc(f.subtitle||'')}</p>${meta(f)}</div></a></section>`;
  if(!S.length)h='<section class="blk"><p class="empty">No stories published yet.</p></section>';
  else{
    h+=block('Latest Stories',rest,'');
    ['article','history','travel'].forEach(c=>h+=block('Latest '+LBL[c],S.filter(s=>s.category===c),c+'.html'));
    const mr=S.filter(s=>s.mostRead).slice(0,5);
    if(mr.length)h+=`<section class="blk"><div class="sh"><h2>Most Read</h2></div><ol class="mr">${mr.map(s=>`<li><div><a href="${href(s)}"><h3>${esc(s.title)}</h3></a>${meta(s)}</div></li>`).join('')}</ol></section>`;
  }
  M.innerHTML=h;
}else if(pg==='article'){
  const id=new URLSearchParams(location.search).get('id'),s=S.find(x=>String(x.id)===id);
  if(s){
    document.title=s.title+' | '+name;
    const url=location.href,t=encodeURIComponent(s.title),u=encodeURIComponent(url);
    const rel=S.filter(x=>x.category===s.category&&x!==s).slice(0,3);
    M.innerHTML=`<article class="art"><span class="cat">${esc(LBL[s.category]||'')}${s.tag?' · '+esc(s.tag):''}</span><h1>${esc(s.title)}</h1><p class="sub">${esc(s.subtitle||'')}</p>${meta(s)}
    <details class="share"><summary>Share</summary><div><button id="cp">Copy Link</button><a target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${u}">Facebook</a><a target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?url=${u}&text=${t}">X / Twitter</a><a target="_blank" rel="noopener" href="https://wa.me/?text=${t}%20${u}">WhatsApp</a><a target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=${u}">LinkedIn</a><a href="mailto:?subject=${t}&body=${u}">Email</a></div></details>
    ${s.image?`<div class="hero"><img src="${esc(s.image)}" alt="${esc(s.title)}"></div>`:''}
    <div class="body">${String(s.body||'').split(/\n\s*\n/).map(p=>`<p>${esc(p).replace(/\n/g,'<br>')}</p>`).join('')}</div></article>
    ${rel.length?`<section class="blk"><div class="sh"><h2>Related Articles</h2></div><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">${rel.map(card).join('')}</div></section>`:''}`;
    $('#cp').onclick=e=>{navigator.clipboard.writeText(url).then(()=>e.target.textContent='Copied ✓')};
  }else{
    M.innerHTML=`<div class="pg-title"><h1>Article</h1></div>`+block('All Articles',S.filter(x=>x.category==='article'),'');
  }
}else if(pg==='history'||pg==='travel'){
  const L=S.filter(s=>s.category===pg);
  const SEC=pg==='history'?[['Featured History Articles','Featured'],['Historical Stories','Story'],['Historical Periods','Period']]:[['Featured Destinations','Destination'],['Travel Stories','Story'],['Travel Guides','Guide'],['Travel Tips','Tip']];
  let h=`<div class="pg-title"><h1>${LBL[pg]}</h1></div>`;
  const used=new Set();
  if(pg==='history'){
    const ev=L.filter(s=>s.tag==='Event').sort((a,b)=>new Date(a.date)-new Date(b.date));ev.forEach(s=>used.add(s));
    if(ev.length)h+=`<section class="blk"><div class="sh"><h2>Timeline of Important Events</h2></div><div class="tl">${ev.map(s=>`<article><span class="cat">${new Date(s.date).getFullYear()}</span><h3><a href="${href(s)}">${esc(s.title)}</a></h3><p class="meta">${esc(s.subtitle||'')}</p></article>`).join('')}</div></section>`;
  }
  SEC.forEach(([t,k])=>{const x=L.filter(s=>k==='Featured'?s.featured:s.tag===k);x.forEach(s=>used.add(s));if(x.length)h+=block(t,x,'')});
  const o=L.filter(s=>!used.has(s));if(o.length)h+=block('More Stories',o,'');
  if(!L.length)h+='<section class="blk"><p class="empty">No stories yet.</p></section>';
  M.innerHTML=h;
}else if(pg==='contact'){
  const sc=site.social||{},links=Object.keys(sc).filter(k=>sc[k]).map(k=>`<a href="${esc(sc[k])}" target="_blank" rel="noopener">${k}</a>`).join(' · ');
  M.innerHTML=`<div class="pg-title"><h1>Contact</h1></div><div class="contact"><form class="cf" id="cf" method="POST" action="${esc(site.contactFormAction||'')}"><input name="name" placeholder="Your name" required><input name="email" type="email" placeholder="Your email" required><input name="subject" placeholder="Subject"><textarea name="message" rows="6" placeholder="Your message" required></textarea><button class="btn">Send Message</button><p class="meta" id="cm"></p></form><div class="info"><h2>${esc(name)}</h2>${site.email?`<p>Email: <a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>`:''}${site.phone?`<p>Phone: ${esc(site.phone)}</p>`:''}${site.address?`<p>${esc(site.address)}</p>`:''}${links?`<p>${links}</p>`:''}${site.mapEmbedUrl?`<iframe src="${esc(site.mapEmbedUrl)}" style="border:0;width:100%;height:240px" loading="lazy"></iframe>`:''}</div></div>`;
  $('#cf').onsubmit=e=>{if(!site.contactFormAction){e.preventDefault();$('#cm').textContent='Contact form is not connected yet.'}};
}
const ab={facebook:'f',x:'X',instagram:'ig',linkedin:'in',youtube:'yt',tiktok:'tt',other:'↗'},sl=F.socialLinks||{};
const soc=Object.keys(ab).filter(k=>sl[k]).map(k=>`<a href="${esc(sl[k])}" target="_blank" rel="noopener" aria-label="${k}">${ab[k]}</a>`).join('');
const lg=(F.legalLinks||[]).filter(l=>l.name).map(l=>l.url?`<a href="${esc(l.url)}">${esc(l.name)}</a>`:`<span>${esc(l.name)}</span>`).join('');
$('#footer').innerHTML=`<footer class="ft"><div class="fg"><div>${F.logo?`<img src="${esc(F.logo)}" alt="" style="height:40px;margin-bottom:10px">`:''}<div class="fb">${esc(F.newspaperName||name)}</div>${F.tagline?`<p><em>${esc(F.tagline)}</em></p>`:''}<p style="margin-top:10px">${esc(F.description||'')}</p></div>
<div><h4>${esc(F.quickLinksTitle||'')}</h4><ul>${(F.quickLinks||[]).map(l=>`<li><a href="${esc(l.url)}">${esc(l.name)}</a></li>`).join('')}</ul></div>
<div><h4>${esc(F.newsletterTitle||'')}</h4><p>${esc(F.newsletterDescription||'')}</p><form id="nf" method="POST" action="${esc(F.newsletterAction||'')}"><input type="email" name="email" required placeholder="${esc(F.emailPlaceholder||'')}"><button class="btn">${esc(F.subscribeButton||'Subscribe')}</button></form></div>
<div><h4>${esc(F.followTitle||'')}</h4><div class="soc">${soc}</div></div></div>
<div class="fbot"><span>${esc(F.copyright||'')}</span><nav>${lg}</nav></div></footer>`;
$('#nf').onsubmit=e=>{if(!F.newsletterAction)e.preventDefault()};
})();
