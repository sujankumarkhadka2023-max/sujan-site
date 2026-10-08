window.SKG=(function(){
var $=function(s){return document.querySelector(s)};
var T=[["Easy",1,25],["Medium",26,50],["Hard",51,75],["Expert",76,100]],TOTAL=100;
var cfg,S,tab=0,cur=0,timer=null,time=0;
function load(){try{return JSON.parse(localStorage.getItem(cfg.key))||{done:{}}}catch(e){return{done:{}}}}
function save(){try{localStorage.setItem(cfg.key,JSON.stringify(S))}catch(e){}}
function nextLevel(){var n=1;while(S.done[n]&&n<TOTAL)n++;return n}
function tierOf(l){for(var i=0;i<3;i++)if(l<=T[i][2])return i;return 3}
function fmt(s){return(s/60|0).toString().padStart(2,"0")+":"+(s%60).toString().padStart(2,"0")}
function stopT(){clearInterval(timer)}
function startT(){stopT();time=0;var e=$("#tm");if(e)e.textContent="00:00";
  timer=setInterval(function(){if(document.hidden)return;time++;var e=$("#tm");if(e)e.textContent=fmt(time)},1000)}
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function shuffle(a,r){for(var i=a.length-1;i>0;i--){var j=(r()*(i+1))|0,t=a[i];a[i]=a[j];a[j]=t}return a}
function home(){
  stopT();$("#game").classList.add("hide");$("#modal").classList.add("hide");
  var h=$("#home");h.classList.remove("hide");
  var nl=nextLevel(),done=Object.keys(S.done).length;
  h.innerHTML='<div class="top"><a href="/games.html" class="btn" style="text-decoration:none;color:#000">← Games</a><div style="text-align:right"><h1>'+cfg.title+'</h1><div class="sub">'+done+' / '+TOTAL+' levels completed</div></div></div><div class="tabs"></div><div class="lv"></div>';
  var t=h.querySelector(".tabs");
  T.forEach(function(x,i){var b=document.createElement("button");b.className="tab"+(i===tab?" on":"");b.textContent=x[0];b.onclick=function(){tab=i;home()};t.appendChild(b)});
  var box=h.querySelector(".lv");
  for(var l=T[tab][1];l<=T[tab][2];l++){(function(l){
    var b=document.createElement("button"),d=S.done[l];
    b.className="l"+(d?" done":"")+(l===nl?" cur":"");b.disabled=l>nl;
    b.innerHTML=l+"<small>"+(d?"★".repeat(d.stars)+"☆".repeat(3-d.stars):(l>nl?"🔒":"PLAY"))+"</small>";
    b.onclick=function(){open(l)};box.appendChild(b)})(l)}
}
function open(l){
  cur=l;stopT();$("#home").classList.add("hide");$("#game").classList.remove("hide");$("#modal").classList.add("hide");
  $("#ttl").textContent="Level "+l;
  $("#tier").textContent=T[tierOf(l)][0]+(cfg.sub?" · "+cfg.sub(l):"");
  $("#info").innerHTML="";$("#stage").innerHTML="";$("#ctrl").innerHTML="";
  cfg.start(l)}
function modal(h){$("#mbox").innerHTML=h;$("#modal").classList.remove("hide")}
function win(stars,html){
  stopT();var old=S.done[cur];if(!old||stars>old.stars)S.done[cur]={stars:stars};save();
  var last=cur>=TOTAL;
  modal('<h2>Level '+cur+' complete!</h2><div class="stars">'+"★".repeat(stars)+"☆".repeat(3-stars)+'</div><div>'+(html||"")+'</div><div class="row"><button class="btn" id="mL">Levels</button>'+(last?'':'<button class="btn dark" id="mN">Next level</button>')+'</div>');
  $("#mL").onclick=function(){tab=tierOf(cur);home()};
  if(!last)$("#mN").onclick=function(){open(cur+1)}}
function lose(html){
  stopT();
  modal('<h2>Level failed</h2><div>'+(html||"")+'</div><div class="row"><button class="btn" id="mL">Levels</button><button class="btn dark" id="mR">Try again</button></div>');
  $("#mL").onclick=function(){home()};$("#mR").onclick=function(){open(cur)}}
function init(c){cfg=c;S=load();tab=tierOf(nextLevel());$("#back").onclick=home;home()}
return{init:init,win:win,lose:lose,fmt:fmt,startT:startT,stopT:stopT,rng:rng,shuffle:shuffle,tierOf:tierOf,restart:function(){open(cur)},level:function(){return cur}}
})();
