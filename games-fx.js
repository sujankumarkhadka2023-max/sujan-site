/* Shared game effects: confetti on level complete + "games played" counter (read by the homepage). */
(function(){
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
function bump(){try{localStorage.setItem('sk_games_played',(+localStorage.getItem('sk_games_played')||0)+1)}catch(e){}}
function confetti(){
  if(RM)return;
  var c=document.createElement('canvas'),x=c.getContext('2d'),W=c.width=innerWidth,H=c.height=innerHeight;
  c.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;z-index:99999;pointer-events:none';
  document.body.appendChild(c);
  var cols=['#ffe500','#ff4d6d','#4dabf7','#51cf66','#ffa94d','#cc5de8','#ffffff'],P=[],i;
  for(i=0;i<160;i++){
    var left=i%2===0,sp=4+Math.random()*9;
    P.push({x:left?W*.08:W*.92,y:H*.85,vx:(left?1:-1)*sp*(.4+Math.random()),vy:-(9+Math.random()*13),
      w:6+Math.random()*7,h:4+Math.random()*6,r:Math.random()*6.28,vr:(Math.random()-.5)*.35,c:cols[(Math.random()*cols.length)|0]})}
  var t0=performance.now();
  (function f(t){
    var e=t-t0;x.clearRect(0,0,W,H);
    P.forEach(function(p){p.vy+=.34;p.vx*=.992;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;
      x.save();x.globalAlpha=Math.max(0,Math.min(1,(3000-e)/700));x.translate(p.x,p.y);x.rotate(p.r);x.scale(1,Math.cos(p.r*2));x.fillStyle=p.c;x.fillRect(-p.w/2,-p.h/2,p.w,p.h);x.restore()});
    if(e<3000)requestAnimationFrame(f);else c.remove()})(t0)}
/* stars burst out of the result stars and a coin spins in when a level is finished */
function starBurst(){
  if(RM)return;
  var el=document.querySelector('.stars');if(!el)return;
  var r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  if(!document.getElementById('skcoin-css')){var st=document.createElement('style');st.id='skcoin-css';st.textContent='.skcoin{display:block;width:46px;height:46px;line-height:46px;margin:6px auto 0;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff3a0,#ffd24a 55%,#d99a00);box-shadow:0 3px 10px rgba(0,0,0,.35);font:800 22px Georgia,serif;color:#7a5200;text-align:center;animation:skcoin 1.4s cubic-bezier(.2,.8,.3,1) both}@keyframes skcoin{0%{transform:translateY(-30px) rotateY(0) scale(.2);opacity:0}30%{opacity:1}100%{transform:none rotateY(1080deg)}}';document.head.appendChild(st)}
  if(!document.querySelector('.skcoin')){var c=document.createElement('div');c.className='skcoin';c.setAttribute('aria-hidden','true');c.textContent='\u2605';el.insertAdjacentElement('afterend',c)}
  var cv=document.createElement('canvas'),x=cv.getContext('2d'),W=cv.width=innerWidth,H=cv.height=innerHeight,P=[],i;
  cv.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;z-index:100000;pointer-events:none';document.body.appendChild(cv);
  for(i=0;i<40;i++){var a=Math.random()*6.28,sp=3+Math.random()*7;P.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-3,s:6+Math.random()*9,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:['#ffe500','#fff3a0','#ffb300'][i%3],l:50+Math.random()*40})}
  function star(px,py,rr,rot){x.beginPath();for(var k=0;k<10;k++){var an=rot+k*Math.PI/5,q=k%2?rr*.45:rr;x.lineTo(px+Math.cos(an)*q,py+Math.sin(an)*q)}x.closePath();x.fill()}
  (function f(){x.clearRect(0,0,W,H);var alive=0;P.forEach(function(p){p.vy+=.22;p.vx*=.97;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.l--;if(p.l>0){alive++;x.globalAlpha=Math.min(1,p.l/25);x.fillStyle=p.c;star(p.x,p.y,p.s,p.r)}});x.globalAlpha=1;if(alive)requestAnimationFrame(f);else cv.remove()})();
  try{navigator.vibrate&&navigator.vibrate([20,40,20])}catch(e){}}
window.SKFX={confetti:confetti,bump:bump,starBurst:starBurst};
/* auto-hook the shared SKG engine (2048, Memory, Sliding, Word) */
try{if(typeof SKG!=='undefined'&&SKG){
  var w=SKG.win;if(typeof w==='function')SKG.win=function(){confetti();var r=w.apply(this,arguments);setTimeout(starBurst,60);return r};
  var ini=SKG.init;if(typeof ini==='function')SKG.init=function(o){if(o&&typeof o.start==='function'){var s=o.start;o.start=function(){bump();return s.apply(this,arguments)}}return ini.apply(this,arguments)}
}}catch(e){}
})();
