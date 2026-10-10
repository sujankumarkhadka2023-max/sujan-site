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
window.SKFX={confetti:confetti,bump:bump};
/* auto-hook the shared SKG engine (2048, Memory, Sliding, Word) */
try{if(typeof SKG!=='undefined'&&SKG){
  var w=SKG.win;if(typeof w==='function')SKG.win=function(){confetti();return w.apply(this,arguments)};
  var ini=SKG.init;if(typeof ini==='function')SKG.init=function(o){if(o&&typeof o.start==='function'){var s=o.start;o.start=function(){bump();return s.apply(this,arguments)}}return ini.apply(this,arguments)}
}}catch(e){}
})();
