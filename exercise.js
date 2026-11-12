/* exercise.js - 3D workout trainer for The Sujan Khadka (loaded by index.html like learn.js / calculators.js).
   Provides exPg() (page HTML) and exInit() (starts the trainer). Everything else is private to this file. */
(function(){
'use strict';
const CSS="\n/* Guardian-style editorial design, scoped to this component */\n#movement-guide{--g-blue:#052962;--g-blue2:#0a3a85;--g-pillar:#7d0068;--g-ink:#121212;--g-muted:#707070;--g-line:#dcdcdc;--g-grey:#f6f6f6;\n background:#fff;color:var(--g-ink);font:16px/1.4 'Guardian Text Sans',Helvetica,Arial,sans-serif;isolation:isolate;-webkit-font-smoothing:antialiased}\n#movement-guide *{box-sizing:border-box}\n#movement-guide .mg-wrap{max-width:1300px;margin:auto;padding:0 clamp(14px,3vw,20px)}\n#movement-guide .mg-top{background:var(--g-blue);color:#fff}\n#movement-guide .mg-top-in{max-width:1300px;margin:auto;padding:12px clamp(14px,3vw,20px) 14px;display:flex;justify-content:space-between;align-items:flex-end;gap:12px}\n#movement-guide .mg-logo{font:italic 700 clamp(34px,8vw,64px)/.95 Georgia,'Times New Roman',serif;letter-spacing:-.04em;color:#fff}\n#movement-guide .mg-logo small{display:block;font:700 12px/1 Helvetica,Arial,sans-serif;font-style:normal;letter-spacing:.12em;text-transform:uppercase;color:#bcc8e0;margin-bottom:8px}\n#movement-guide .mg-edition{font-size:13px;font-weight:700;color:#fff;border:1px solid rgba(255,255,255,.5);border-radius:999px;padding:7px 14px;white-space:nowrap}\n#movement-guide .mg-nav{border-top:1px solid rgba(255,255,255,.3)}\n#movement-guide .mg-nav-in{max-width:1300px;margin:auto;padding:0 clamp(14px,3vw,20px);display:flex;overflow-x:auto;scrollbar-width:none}\n#movement-guide .mg-nav-in::-webkit-scrollbar{display:none}\n#movement-guide .mg-nav span{font:700 17px/1 Helvetica,Arial,sans-serif;padding:13px 14px 15px;color:#fff;white-space:nowrap;border-left:1px solid rgba(255,255,255,.3)}\n#movement-guide .mg-nav span:first-child{border-left:0;padding-left:0}\n#movement-guide .mg-nav span.on{box-shadow:inset 0 -4px 0 #fff}\n#movement-guide .mg-subnav{border-bottom:1px solid var(--g-line)}\n#movement-guide .mg-subnav .mg-wrap{display:flex;gap:18px;align-items:center;min-height:44px;overflow-x:auto;scrollbar-width:none}\n#movement-guide .mg-subnav b{font:700 22px Georgia,'Times New Roman',serif;color:var(--g-pillar);margin-right:6px}\n#movement-guide .mg-subnav span{font:700 14px Helvetica,Arial,sans-serif;color:var(--g-ink);white-space:nowrap}\n#movement-guide .mg-hero{padding:16px 0 18px;border-top:1px solid var(--g-line);margin-top:16px;display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:20px 40px;align-items:end;border-bottom:1px solid var(--g-line)}\n#movement-guide .mg-kicker{margin:0 0 6px;color:var(--g-pillar);font:700 15px/1.2 Helvetica,Arial,sans-serif}\n#movement-guide h1{font:700 clamp(36px,6.4vw,62px)/1.05 Georgia,'Times New Roman',serif;letter-spacing:-.015em;color:var(--g-ink);margin:0}\n#movement-guide .mg-deck{font:400 20px/1.3 Georgia,'Times New Roman',serif;color:var(--g-ink);margin:0 0 10px}\n#movement-guide .mg-by{font:700 14px/1.3 Helvetica,Arial,sans-serif;color:var(--g-pillar);margin:0}\n#movement-guide .mg-by span{display:block;font-weight:400;color:var(--g-muted);font-size:13px;margin-top:2px}\n#movement-guide .mg-introline{display:flex;justify-content:space-between;gap:20px;align-items:baseline;margin:20px 0 12px;border-top:1px solid var(--g-ink);padding-top:8px}\n#movement-guide .mg-introline h2{font:700 24px/1.15 Georgia,serif;color:var(--g-ink);margin:0}\n#movement-guide .mg-label{font:700 13px/1.2 Helvetica,Arial,sans-serif;color:var(--g-muted)}\n#movement-guide .mg-trainer{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(290px,.8fr);border:1px solid var(--g-line);background:#fff}\n#movement-guide .mg-stage{min-width:0;background:#4b4a54;position:relative;min-height:500px;overflow:hidden}\n#movement-guide #mg-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:pan-y}\n#movement-guide .mg-stage-top{position:absolute;top:12px;left:12px;right:12px;display:flex;justify-content:space-between;pointer-events:none;gap:10px}\n#movement-guide .mg-chip{background:#fff;padding:5px 10px;font:700 12px/1.2 Helvetica,Arial,sans-serif;color:var(--g-blue);border-radius:999px}\n#movement-guide .mg-stage-bottom{position:absolute;bottom:12px;left:12px;right:12px;display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap}\n#movement-guide .mg-viewbuttons{display:flex;gap:6px;pointer-events:auto;flex-wrap:wrap}\n#movement-guide .mg-viewbuttons button{background:#fff;border:1px solid var(--g-blue);border-radius:999px;padding:8px 13px;font:700 12px/1 Helvetica,Arial,sans-serif;cursor:pointer;color:var(--g-blue)}\n#movement-guide .mg-viewbuttons button[aria-pressed=true]{background:var(--g-blue);color:#fff}\n#movement-guide .mg-viewbuttons button#mg-load{border-color:var(--g-pillar);color:var(--g-pillar)}\n#movement-guide .mg-stage-help{font:12px Helvetica,Arial,sans-serif;color:#fff;background:rgba(0,0,0,.45);padding:6px 10px;border-radius:999px}\n#movement-guide .mg-console{padding:clamp(16px,2.5vw,26px);display:flex;flex-direction:column;gap:16px;min-width:0;border-left:1px solid var(--g-line)}\n#movement-guide .mg-console h3{font:700 30px/1.1 Georgia,serif;color:var(--g-ink);margin:0}\n#movement-guide .mg-console p{margin:0;color:#404040;font:15px/1.35 Georgia,serif}\n#movement-guide .mg-select-label{font:700 13px Helvetica,Arial,sans-serif;color:var(--g-muted);display:block;margin-bottom:6px}\n#movement-guide select{width:100%;border:1px solid #999;background:#fff;color:var(--g-ink);padding:11px;font:inherit;border-radius:0}\n#movement-guide .mg-stats{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--g-ink);border-bottom:1px solid var(--g-line)}\n#movement-guide .mg-stat{padding:12px 8px 12px 0}\n#movement-guide .mg-stat+.mg-stat{border-left:1px solid var(--g-line);padding-left:12px}\n#movement-guide .mg-stat strong{display:block;font:700 32px/1 Georgia,serif;color:var(--g-ink);font-variant-numeric:tabular-nums}\n#movement-guide .mg-stat span{font:700 12px Helvetica,Arial,sans-serif;color:var(--g-muted)}\n#movement-guide .mg-progress{height:4px;background:var(--g-line);overflow:hidden}\n#movement-guide .mg-progress span{display:block;height:100%;width:0;background:var(--g-pillar);transition:width .2s}\n#movement-guide .mg-coach{background:var(--g-grey);border-top:2px solid var(--g-pillar);padding:12px 14px;min-height:100px}\n#movement-guide .mg-coach strong{display:block;font:700 18px Georgia,serif;color:var(--g-ink);margin-bottom:4px}\n#movement-guide .mg-coach p{font-size:15px;color:#333}\n#movement-guide .mg-controls{display:grid;grid-template-columns:1fr 1fr;gap:8px}\n#movement-guide .mg-btn{border:1px solid var(--g-blue);border-radius:999px;min-height:42px;padding:0 14px;font:700 15px Helvetica,Arial,sans-serif;cursor:pointer;background:#fff;color:var(--g-blue)}\n#movement-guide .mg-btn:hover{background:#e8edf6}\n#movement-guide .mg-btn.primary{background:var(--g-blue);color:#fff}\n#movement-guide .mg-btn.primary:hover{background:var(--g-blue2)}\n#movement-guide .mg-btn:disabled{opacity:.4;cursor:not-allowed}\n#movement-guide .mg-console p.mg-note{font:12px/1.4 Helvetica,Arial,sans-serif;color:var(--g-muted)}\n#movement-guide .mg-lower{display:grid;grid-template-columns:1.1fr .9fr;gap:30px 40px;padding:26px 0;border-bottom:1px solid var(--g-line)}\n#movement-guide .mg-lower h3{font:700 24px Georgia,serif;color:var(--g-ink);margin:0 0 12px}\n#movement-guide .mg-steps{list-style:none;padding:0;margin:0;counter-reset:mg-step}\n#movement-guide .mg-steps li{counter-increment:mg-step;display:grid;grid-template-columns:34px 1fr;gap:10px;padding:11px 0;border-top:1px solid var(--g-line);font:17px/1.35 Georgia,serif;color:var(--g-ink)}\n#movement-guide .mg-steps li:before{content:counter(mg-step);font:700 22px/1 Georgia,serif;color:var(--g-pillar)}\n#movement-guide .mg-tip{border-top:1px solid var(--g-line);padding:11px 0 13px;font:16px/1.4 Georgia,serif;color:#333}\n#movement-guide .mg-tip b{display:block;color:var(--g-pillar);font:700 15px Helvetica,Arial,sans-serif;margin-bottom:4px}\n#movement-guide .mg-library{padding-top:22px}\n#movement-guide .mg-library-head{display:flex;justify-content:space-between;align-items:baseline;gap:15px;border-top:1px solid var(--g-ink);padding-top:8px;margin-bottom:12px}\n#movement-guide .mg-library-head h3{font:700 26px Georgia,serif;color:var(--g-ink);margin:0}\n#movement-guide .mg-exercises{display:grid;grid-template-columns:repeat(3,1fr);gap:0}\n#movement-guide .mg-exercise{border-top:1px solid var(--g-line);border-left:1px solid var(--g-line);padding:10px 12px 16px;display:flex;flex-direction:column;align-items:flex-start;min-height:150px;transition:background .15s}\n#movement-guide .mg-exercise:nth-child(3n+1){border-left:0;padding-left:0}\n#movement-guide .mg-exercise:hover{background:#ededed}\n#movement-guide .mg-ex-k{font:700 14px Helvetica,Arial,sans-serif;color:var(--g-pillar);margin-bottom:6px}\n#movement-guide .mg-exercise b{font:700 22px/1.15 Georgia,serif;color:var(--g-ink)}\n#movement-guide .mg-exercise p{font:15px/1.35 Georgia,serif;color:#555;margin:6px 0 12px}\n#movement-guide .mg-exercise button{margin-top:auto;background:none;border:0;padding:0;color:var(--g-pillar);font:700 14px Helvetica,Arial,sans-serif;cursor:pointer}\n#movement-guide .mg-exercise button:hover{text-decoration:underline}\n#movement-guide .mg-footer{margin-top:26px;background:var(--g-blue);color:#fff;padding:18px clamp(14px,3vw,20px);display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;font:13px Helvetica,Arial,sans-serif}\n#movement-guide .mg-footer span:first-child{font:italic 700 20px Georgia,serif}\n#movement-guide button:focus-visible,#movement-guide select:focus-visible{outline:3px solid #ffd900;outline-offset:2px}\n@media(max-width:850px){#movement-guide .mg-hero{grid-template-columns:1fr}#movement-guide .mg-trainer{grid-template-columns:1fr}#movement-guide .mg-stage{min-height:440px}#movement-guide .mg-console{border-left:0;border-top:1px solid var(--g-line)}#movement-guide .mg-lower{grid-template-columns:1fr}}\n@media(max-width:560px){#movement-guide .mg-stage{min-height:410px}#movement-guide .mg-exercises{grid-template-columns:1fr}#movement-guide .mg-exercise,#movement-guide .mg-exercise:nth-child(3n+1){border-left:0;padding-left:0;min-height:0}#movement-guide .mg-stage-help{display:none}#movement-guide .mg-edition{display:none}#movement-guide .mg-introline{flex-direction:column;gap:2px}}\n@media(prefers-reduced-motion:reduce){#movement-guide .mg-progress span,#movement-guide .mg-exercise{transition:none}}\n";
const HTML="<section id=\"movement-guide\" aria-labelledby=\"mg-title\">\n <div class=\"mg-top\"><div class=\"mg-top-in\"><div class=\"mg-logo\"><small>Fitness &amp; wellbeing</small>The Movement Guide</div><span class=\"mg-edition\">Exercise edition</span></div>\n  <nav class=\"mg-nav\"><div class=\"mg-nav-in\"><span class=\"on\">Fitness</span><span>Exercise</span><span>Technique</span><span>Training</span><span>Wellbeing</span></div></nav></div>\n <div class=\"mg-subnav\"><div class=\"mg-wrap\"><b>Fitness</b><span>Strength</span><span>Cardio</span><span>Core</span><span>Mobility</span></div></div>\n <div class=\"mg-wrap\">\n  <header class=\"mg-hero\">\n   <div><p class=\"mg-kicker\">Move better &middot; Feel stronger</p><h1 id=\"mg-title\">The exercise guide</h1></div>\n   <div><p class=\"mg-deck\">A personal 3D workout trainer. Follow guided movement cycles, track your repetitions and learn the key technique cues as you train.</p><p class=\"mg-by\">The Movement Guide<span>Interactive trainer &middot; Version 2.0</span></p></div>\n  </header>\n  <div class=\"mg-introline\"><h2>Live 3D workout studio</h2><span class=\"mg-label\">Drag the model to look around</span></div>\n  <div class=\"mg-trainer\">\n   <div class=\"mg-stage\" id=\"mg-stage\">\n    <canvas id=\"mg-canvas\" aria-label=\"Interactive three-dimensional human workout trainer\"></canvas>\n    <div class=\"mg-stage-top\"><span class=\"mg-chip\">3D trainer</span><span class=\"mg-chip\" id=\"mg-state\">READY</span></div>\n    <div class=\"mg-stage-bottom\"><span class=\"mg-stage-help\">Drag to rotate &middot; Scroll to zoom</span><div class=\"mg-viewbuttons\"><button data-view=\"front\" aria-pressed=\"true\">Front</button><button data-view=\"side\" aria-pressed=\"false\">Side</button><button data-view=\"back\" aria-pressed=\"false\">Back</button><button id=\"mg-load\" title=\"Switch between the real model and the athlete model\">Loading model\u2026</button></div></div>\n   </div>\n   <aside class=\"mg-console\">\n    <div class=\"mg-console-head\"><p class=\"mg-kicker\">Your session</p><h3 id=\"mg-ex-title\">Bodyweight squat</h3><p id=\"mg-ex-desc\">Build leg strength with controlled repetitions.</p></div>\n    <div><label class=\"mg-select-label\" for=\"mg-exercise\">Choose exercise</label><select id=\"mg-exercise\">\n     <option value=\"squat\">Bodyweight squat</option><option value=\"jack\">Jumping jack</option><option value=\"lunge\">Reverse lunge</option><option value=\"pushup\">Push-up</option><option value=\"plank\">Forearm plank</option><option value=\"climber\">Mountain climber</option><option value=\"knees\">High knees</option><option value=\"kicks\">Butt kicks</option><option value=\"curl\">Bicep curl</option><option value=\"raise\">Lateral raise</option><option value=\"calf\">Calf raise</option><option value=\"twist\">Standing torso twist</option>\n    </select></div>\n    <div class=\"mg-stats\">\n     <div class=\"mg-stat\"><strong id=\"mg-reps\">0</strong><span>Reps</span></div>\n     <div class=\"mg-stat\"><strong id=\"mg-time\">00:00</strong><span>Time</span></div>\n     <div class=\"mg-stat\"><strong id=\"mg-set\">1/3</strong><span>Set</span></div>\n    </div>\n    <div><div class=\"mg-label\" style=\"display:flex;justify-content:space-between;margin-bottom:6px\"><span>Session progress</span><span id=\"mg-progress-label\">0%</span></div><div class=\"mg-progress\"><span id=\"mg-progress\"></span></div></div>\n    <div class=\"mg-coach\" aria-live=\"polite\"><strong id=\"mg-cue-title\">Ready when you are</strong><p id=\"mg-cue\">Press Start workout. Follow the 3D movement and the coaching cues here.</p></div>\n    <div class=\"mg-controls\"><button class=\"mg-btn primary\" id=\"mg-start\">Start workout</button><button class=\"mg-btn\" id=\"mg-reset\">Reset</button><button class=\"mg-btn\" id=\"mg-next\">Next set</button><button class=\"mg-btn\" id=\"mg-slower\">Slower demo</button></div>\n    <p class=\"mg-note\">Repetitions are counted by the guided animation cycle, not by camera-based body tracking. Use a safe space and stop if you feel pain.</p>\n   </aside>\n  </div>\n  <div class=\"mg-lower\">\n   <div><p class=\"mg-kicker\">Follow the movement</p><h3>Step-by-step coaching</h3><ol class=\"mg-steps\" id=\"mg-steps\"><li>Stand with feet about shoulder-width apart.</li><li>Brace your middle and begin to bend your knees.</li><li>Lower with control, keeping your heels grounded.</li><li>Press through your feet to return to standing.</li></ol></div>\n   <div><p class=\"mg-kicker\">Form check</p><h3>Technique matters</h3><div class=\"mg-tip\"><b id=\"mg-form-title\">Keep your movement controlled</b><span id=\"mg-form\">Keep your knees tracking in the same direction as your toes. Move only through a comfortable range.</span></div><div class=\"mg-tip\"><b>Breathing cue</b><span id=\"mg-breath\">Breathe in as you lower; breathe out as you stand.</span></div></div>\n  </div>\n  <section class=\"mg-library\"><div class=\"mg-library-head\"><h3>Choose your next exercise</h3><span class=\"mg-label\">Twelve guided movements</span></div><div class=\"mg-exercises\">\n   <article class=\"mg-exercise\"><span class=\"mg-ex-k\">Exercise 01</span><b>Bodyweight squat</b><p>Lower-body strength \u00b7 10 reps</p><button data-pick=\"squat\">Train this exercise &rarr;</button></article>\n   <article class=\"mg-exercise\"><span class=\"mg-ex-k\">Exercise 02</span><b>Jumping jack</b><p>Cardio \u00b7 20 reps</p><button data-pick=\"jack\">Train this exercise &rarr;</button></article>\n   <article class=\"mg-exercise\"><span class=\"mg-ex-k\">Exercise 03</span><b>Reverse lunge</b><p>Balance and legs \u00b7 10 reps</p><button data-pick=\"lunge\">Train this exercise &rarr;</button></article>\n   <article class=\"mg-exercise\"><span class=\"mg-ex-k\">Exercise 04</span><b>Push-up</b><p>Upper-body strength \u00b7 8 reps</p><button data-pick=\"pushup\">Train this exercise &rarr;</button></article>\n   <article class=\"mg-exercise\"><span class=\"mg-ex-k\">Exercise 05</span><b>Forearm plank</b><p>Core stability \u00b7 30 seconds</p><button data-pick=\"plank\">Train this exercise &rarr;</button></article>\n   <article class=\"mg-exercise\"><span class=\"mg-ex-k\">Exercise 06</span><b>Mountain climber</b><p>Cardio and core \u00b7 20 reps</p><button data-pick=\"climber\">Train this exercise &rarr;</button></article>\n   <article class=\"mg-exercise\"><span class=\"mg-ex-k\">Exercise 07</span><b>High knees</b><p>Cardio \u00b7 20 reps</p><button data-pick=\"knees\">Train this exercise &rarr;</button></article>\n   <article class=\"mg-exercise\"><span class=\"mg-ex-k\">Exercise 08</span><b>Butt kicks</b><p>Cardio and hamstrings \u00b7 20 reps</p><button data-pick=\"kicks\">Train this exercise &rarr;</button></article>\n   <article class=\"mg-exercise\"><span class=\"mg-ex-k\">Exercise 09</span><b>Bicep curl</b><p>Arm strength \u00b7 12 reps</p><button data-pick=\"curl\">Train this exercise &rarr;</button></article>\n   <article class=\"mg-exercise\"><span class=\"mg-ex-k\">Exercise 10</span><b>Lateral raise</b><p>Shoulders \u00b7 12 reps</p><button data-pick=\"raise\">Train this exercise &rarr;</button></article>\n   <article class=\"mg-exercise\"><span class=\"mg-ex-k\">Exercise 11</span><b>Calf raise</b><p>Lower legs \u00b7 15 reps</p><button data-pick=\"calf\">Train this exercise &rarr;</button></article>\n   <article class=\"mg-exercise\"><span class=\"mg-ex-k\">Exercise 12</span><b>Standing torso twist</b><p>Core and mobility \u00b7 10 reps</p><button data-pick=\"twist\">Train this exercise &rarr;</button></article>\n  </div></section>\n </div>\n <footer class=\"mg-footer\"><span>The Movement Guide</span><span>Move with control. Progress at your own pace.</span></footer>\n</section>";
const CDN='https://cdn.jsdelivr.net/npm/three@0.160.0';
let THREE,OrbitControls,GLTFLoader,exMode='',exCleanup=null;
function exImport(path){return exMode==='map'?import('three/addons/'+path):import(CDN+'/examples/jsm/'+path+'/+esm')}
async function libs(){
 if(THREE)return;
 try{   // normal route: jsDelivr ES-module builds (all share one copy of three.js)
  const t=await import(CDN+'/+esm');exMode='esm';
  const [o,g]=await Promise.all([exImport('controls/OrbitControls.js'),exImport('loaders/GLTFLoader.js')]);
  THREE=t;OrbitControls=o.OrbitControls;GLTFLoader=g.GLTFLoader;
 }catch(e){   // fallback route: import map
  console.warn('esm route failed, trying import map',e);
  const m=document.createElement('script');m.type='importmap';
  m.textContent=JSON.stringify({imports:{three:CDN+'/build/three.module.js','three/addons/':CDN+'/examples/jsm/'}});document.head.appendChild(m);
  exMode='map';THREE=await import('three');
  const [o,g]=await Promise.all([exImport('controls/OrbitControls.js'),exImport('loaders/GLTFLoader.js')]);
  OrbitControls=o.OrbitControls;GLTFLoader=g.GLTFLoader;
 }
}
window.exPg=function(){
 if(!document.getElementById('exercise-css')){const s=document.createElement('style');s.id='exercise-css';s.textContent=CSS;document.head.appendChild(s)}
 return HTML;
};
window.exInit=async function(){
 const root=document.getElementById('movement-guide');if(!root)return;
 if(exCleanup){try{exCleanup()}catch(e){}exCleanup=null}
 try{await libs()}catch(e){
  console.error(e);const t=root.querySelector('#mg-cue-title'),c=root.querySelector('#mg-cue'),st=root.querySelector('#mg-state');
  if(st)st.textContent='3D UNAVAILABLE';if(t)t.textContent='3D viewer could not start';if(c)c.textContent='The 3D library could not be downloaded. Check your internet connection and refresh.';return;
 }
 if(!root.isConnected)return;
 start(root);
};
function start(root){


const $=id=>root.querySelector('#'+id);
const exerciseData={
 squat:{title:'Bodyweight squat',desc:'Build leg strength with controlled repetitions.',steps:['Stand with feet about shoulder-width apart and toes slightly out.','Brace your middle and begin to bend your knees.','Lower with control, keeping your heels grounded and chest lifted.','Press through your feet to return to standing.'],form:'Keep your knees tracking in the same direction as your toes. Keep your heels down and avoid rounding your back.',breath:'Breathe in as you lower; breathe out as you stand.',cue:['Stand tall with your feet planted.','Send your hips back and bend your knees.','Pause briefly at a comfortable depth.','Drive through your feet and stand tall.'],duration:4,target:10},
 jack:{title:'Jumping jack',desc:'A rhythmic full-body cardio exercise.',steps:['Stand tall with feet together and arms by your sides.','Jump your feet out while raising your arms overhead.','Land softly with knees relaxed.','Jump back to the starting position.'],form:'Land quietly and keep your knees soft. Step out one foot at a time for a low-impact version.',breath:'Breathe naturally and keep a steady rhythm.',cue:['Stand tall, arms by your sides.','Jump out and sweep your arms overhead.','Keep a soft bend in your knees.','Return to the starting position.'],duration:2.5,target:20},
 lunge:{title:'Reverse lunge',desc:'Develop leg strength, balance and control.',steps:['Stand tall with feet hip-width apart.','Step one foot backwards and bend both knees.','Lower only as far as you can while staying balanced.','Push through the front foot and return to standing; alternate sides.'],form:'Keep your front foot flat and front knee aligned over your toes. Use a shorter step or hold support if needed.',breath:'Breathe in as you lower; breathe out as you return.',cue:['Stand tall and brace your middle.','Step one foot back.','Bend both knees with control.','Push through the front foot to stand.'],duration:4,target:10},
 pushup:{title:'Push-up',desc:'Train your chest, shoulders and arms.',steps:['Place hands slightly wider than shoulder-width.','Extend your legs and form a straight line from head to heels.','Bend your elbows and lower your chest under control.','Push the floor away to return to the top.'],form:'Avoid letting your hips sag. Use an elevated surface or knee push-up variation if needed.',breath:'Breathe in as you lower; breathe out as you push away.',cue:['Set your hands and brace your body.','Bend your elbows and lower.','Keep your body in one long line.','Push the floor away to rise.'],duration:3.5,target:8},
 plank:{title:'Forearm plank',desc:'Build trunk stability with a steady hold.',steps:['Place forearms on the floor with elbows under shoulders.','Extend your legs and balance on your toes.','Keep head, shoulders, hips and heels aligned.','Breathe steadily and stop before your form changes.'],form:'Do not hold your breath or let your lower back sag. Drop your knees to make the hold easier.',breath:'Take slow, steady breaths throughout the hold.',cue:['Set your elbows beneath your shoulders.','Extend your legs and brace your middle.','Keep a straight line from head to heels.','Breathe steadily and hold your position.'],duration:30,target:1,isHold:true},
 climber:{title:'Mountain climber',desc:'A moving plank variation for conditioning.',steps:['Start in a high plank with hands under shoulders.','Brace your middle and bring one knee towards your chest.','Return the foot and alternate sides.','Keep shoulders steady and hips as level as possible.'],form:'Prioritise a stable plank over speed. Slow alternating knee drives are a useful starting point.',breath:'Breathe steadily; do not hold your breath.',cue:['Start in a strong high plank.','Drive one knee towards your chest.','Return your foot under control.','Alternate legs without lifting your hips.'],duration:2.5,target:20},
 knees:{title:'High knees',desc:'A fast, rhythmic cardio drill that lifts your heart rate.',steps:['Stand tall with feet hip-width apart.','Drive one knee up towards hip height.','Switch legs quickly, landing softly on the ball of the foot.','Swing your arms in opposition to your legs.'],form:'Stay tall and do not lean back. March the knees up slowly for a low-impact version.',breath:'Breathe steadily and keep a quick rhythm.',cue:['Stand tall and brace your middle.','Drive one knee up to hip height.','Land softly and switch legs.','Pump your arms and keep a steady rhythm.'],duration:2,target:20},
 kicks:{title:'Butt kicks',desc:'Warm up your hamstrings and raise your heart rate.',steps:['Stand tall with feet hip-width apart.','Bend one knee and kick your heel up towards your glutes.','Switch legs in a smooth, quick rhythm.','Keep your knees pointing down and your chest lifted.'],form:'Keep your thighs fairly vertical and land softly. Jog slowly if you need less impact.',breath:'Breathe naturally and keep a steady rhythm.',cue:['Stand tall with relaxed shoulders.','Kick one heel up behind you.','Land softly and switch legs.','Keep your chest lifted and move rhythmically.'],duration:1.8,target:20},
 curl:{title:'Bicep curl',desc:'Train the front of your upper arms with a controlled curl.',steps:['Stand tall with arms by your sides, palms forward.','Keep your elbows close to your ribs.','Bend your elbows and curl your hands towards your shoulders.','Lower slowly back to the start.'],form:'Do not swing your body or let your elbows drift forward. Hold light weights or a water bottle if you like.',breath:'Breathe out as you curl up; breathe in as you lower.',cue:['Stand tall, elbows by your sides.','Curl your hands up towards your shoulders.','Squeeze at the top without leaning back.','Lower slowly and with control.'],duration:3,target:12},
 raise:{title:'Lateral raise',desc:'Build strong, rounded shoulders.',steps:['Stand tall with arms by your sides.','Keep a soft bend in your elbows.','Lift both arms out to the sides up to shoulder height.','Lower slowly back to your sides.'],form:'Lead with your elbows and stop at shoulder height. Keep your shoulders relaxed, away from your ears.',breath:'Breathe out as you lift; breathe in as you lower.',cue:['Stand tall with arms by your sides.','Lift your arms out to the sides.','Pause at shoulder height.','Lower slowly with control.'],duration:3.5,target:12},
 calf:{title:'Calf raise',desc:'Strengthen your lower legs and ankles.',steps:['Stand tall with feet hip-width apart.','Press through the balls of your feet.','Rise as high as you can onto your toes.','Lower your heels slowly to the floor.'],form:'Keep your ankles straight and do not roll outwards. Rest a hand on a wall for balance if needed.',breath:'Breathe out as you rise; breathe in as you lower.',cue:['Stand tall with your feet planted.','Press up onto the balls of your feet.','Pause briefly at the top.','Lower your heels slowly.'],duration:2.5,target:15},
 twist:{title:'Standing torso twist',desc:'Mobilise your spine and train your core.',steps:['Stand with feet shoulder-width apart, knees soft.','Hold your hands together in front of your chest.','Rotate your upper body to one side.','Return to the centre and rotate to the other side.'],form:'Turn from your ribcage and keep your hips facing forward. Move only through a comfortable range.',breath:'Breathe out as you twist; breathe in as you return.',cue:['Stand tall with soft knees.','Twist your upper body to one side.','Return to the centre with control.','Twist to the other side.'],duration:4,target:10}
};
let current='squat',running=false,slow=false,elapsed=0,reps=0,set=1,cycleTime=0,holdDone=false,lastStamp=0,raf=0;
let scene,camera,renderer,controls,avatar,parts={},resizeObserver;
const M=(c,r=.6)=>new THREE.MeshStandardMaterial({color:c,roughness:r});
const skin=new THREE.MeshPhysicalMaterial({color:0xd8a48a,roughness:.7,sheen:.5,sheenRoughness:.55,sheenColor:new THREE.Color(0xffb8a2)}),skinD=M(0xb27a64,.75),shorts=M(0x2f2a30,.75),band=M(0x3f93b8,.6),eyeW=M(0xf2efe9,.3),iris=M(0x3c5f7a,.4),pupil=M(0x0b0b0b,.3),lipM=M(0xb97368,.55),groundMat=M(0x3b3b43,.95);
const V=THREE.Vector3,clamp=(x,a=-1,b=1)=>Math.max(a,Math.min(b,x));
const G=(p,x=0,y=0,z=0)=>{const g=new THREE.Group();g.position.set(x,y,z);p.add(g);return g};
function E(p,m,s,pos,rot=[0,0,0]){const e=new THREE.Mesh(new THREE.SphereGeometry(1,28,20),m);e.scale.set(...s);e.position.set(...pos);e.rotation.set(...rot);p.add(e);return e}
function cap(p,m,r,L,y=0){const c=new THREE.Mesh(new THREE.CapsuleGeometry(r,Math.max(.001,L),4,10),m);c.position.y=y;p.add(c);return c}
// Smooth lofted limb/torso segment: profile = [[t 0..1, radius]...] along +Y (dir 1) or -Y (dir -1)
function lathe(p,m,L,prof,sz=1,y0=0,dir=-1){
 let pts=prof.map(([t,r])=>new THREE.Vector2(r,y0+dir*t*L));if(dir<0)pts.reverse();
 const c=new THREE.SplineCurve(pts).getPoints(36);
 c.unshift(new THREE.Vector2(0,pts[0].y));c.push(new THREE.Vector2(0,pts[pts.length-1].y));
 const mesh=new THREE.Mesh(new THREE.LatheGeometry(c,36),m);mesh.scale.z=sz;p.add(mesh);return mesh}
let J={};
function hand(wr,L,side){
 const h=G(wr);E(h,skin,[.015,.046,.034],[0,-.047,0]);L.fg=[];
 [[.024,.036],[.008,.04],[-.008,.037],[-.022,.029]].forEach(([z,l])=>{const a=G(h,0,-.092,z),b=G(a,0,-l,0);cap(a,skin,.007,l-.017,-l/2);cap(b,skin,.0062,l*.8-.015,-l*.4);L.fg.push([a,b])});
 const t1=G(h,-side*.01,-.028,.032);t1.rotation.x=-.5;const t2=G(t1,0,-.036,0);cap(t1,skin,.009,.02,-.018);cap(t2,skin,.0078,.02,-.018);L.th=[t1,t2];
}
function makeAvatar(){
 avatar=new THREE.Group();scene.add(avatar);J={};
 // Pelvis, glutes and dark athletic shorts with a coloured waistband
 E(avatar,skin,[.15,.09,.1],[0,0,0]);
 lathe(avatar,shorts,.2,[[0,.17],[.5,.172],[1,.158]],.7,-.11,1);
 const wb=new THREE.Mesh(new THREE.TorusGeometry(.158,.012,8,40),band);wb.rotation.x=Math.PI/2;wb.scale.set(1,.7,1);wb.position.y=.095;avatar.add(wb);
 for(const s of [-1,1])E(avatar,shorts,[.078,.085,.078],[s*.08,-.03,-.08]);
 // Waist / abdomen with six-pack and obliques
 const S=J.S=G(avatar,0,.02,0);
 lathe(S,skin,.27,[[0,.135],[.5,.122],[1,.145]],.68,0,1);
 for(const x of [-.036,.036])for(const y of [.07,.135,.2])E(S,skin,[.03,.027,.012],[x,y,.083]);
 for(const s of [-1,1])E(S,skin,[.03,.09,.045],[s*.105,.12,.02]);
 // Chest: ribcage, pecs, lats, traps
 const C=J.C=G(S,0,.26,0);
 lathe(C,skin,.26,[[0,.145],[.35,.168],[.7,.175],[1,.14]],.66,0,1);
 for(const s of [-1,1]){
  E(C,skin,[.08,.056,.032],[s*.082,.14,.092],[.1,s*-.15,s*.1]);E(C,skinD,[.01,.01,.005],[s*.09,.12,.122]);
  E(C,skin,[.035,.1,.05],[s*.15,.1,-.045]);E(C,skin,[.06,.022,.05],[s*.09,.25,-.01],[0,0,s*.35]);
 }
 E(C,skin,[.09,.04,.06],[0,.245,-.03]);
 // Neck and head with facial features
 const N=J.N=G(C,0,.27,0);lathe(N,skin,.11,[[0,.05],[1,.046]],1,0,1);
 const Hd=J.H=G(N,0,.1,0),HC=G(Hd,0,.08,0);HC.scale.setScalar(.9);
 E(HC,skin,[.083,.108,.098],[0,.005,-.005]);E(HC,skin,[.07,.06,.08],[0,-.06,.02]);E(HC,skin,[.028,.022,.03],[0,-.098,.072]);
 E(HC,skin,[.07,.014,.03],[0,.038,.082]);E(HC,skin,[.012,.03,.015],[0,0,.092]);E(HC,skin,[.017,.015,.02],[0,-.025,.108]);
 E(HC,lipM,[.024,.006,.012],[0,-.055,.093]);E(HC,lipM,[.021,.007,.012],[0,-.067,.09]);
 for(const s of [-1,1]){
  E(HC,skin,[.03,.025,.03],[s*.05,-.01,.07]);E(HC,skin,[.01,.01,.012],[s*.014,-.03,.098]);E(HC,skinD,[.026,.014,.01],[s*.036,.022,.084]);
  E(HC,eyeW,[.016,.012,.01],[s*.036,.022,.088]);E(HC,iris,[.008,.008,.006],[s*.036,.022,.096]);E(HC,pupil,[.004,.004,.004],[s*.036,.022,.1]);
  E(HC,skinD,[.026,.005,.01],[s*.037,.05,.094],[0,0,s*-.15]);E(HC,skin,[.012,.032,.02],[s*.087,-.005,-.005]);
 }
 // Arms (deltoid, biceps/triceps, forearm, hand with fingers) and legs (quads, hamstrings, calves, feet)
 for(const side of [-1,1]){
  const i=side<0?0:1,L=J[i]={side};
  const sh=L.sh=G(C,side*.2,.21,0);
  E(sh,skin,[.05,.063,.054],[side*.006,-.03,0]);lathe(sh,skin,.3,[[0,.042],[.2,.049],[.5,.045],[1,.035]],.95);
  E(sh,skin,[.026,.07,.03],[0,-.12,.022]);E(sh,skin,[.026,.07,.03],[0,-.115,-.022]);
  const el=L.el=G(sh,0,-.3,0);lathe(el,skin,.27,[[0,.037],[.2,.041],[.5,.035],[1,.026]]);
  const wr=L.wr=G(el,0,-.27,0);hand(wr,L,side);
  const hp=L.hp=G(avatar,side*.1,-.04,0);
  lathe(hp,skin,.44,[[0,.085],[.2,.088],[.6,.068],[1,.048]]);
  E(hp,skin,[.045,.14,.05],[0,-.2,.03]);E(hp,skin,[.04,.12,.04],[0,-.18,-.03]);lathe(hp,shorts,.26,[[0,.094],[1,.09]]);
  const kn=L.kn=G(hp,0,-.44,0);E(kn,skin,[.032,.035,.025],[0,0,.036]);
  lathe(kn,skin,.42,[[0,.046],[.2,.05],[.4,.037],[1,.026]]);E(kn,skin,[.038,.1,.04],[0,-.13,-.035]);
  const an=L.an=G(kn,0,-.42,0);E(an,skin,[.04,.028,.11],[0,-.052,.042]);E(an,skin,[.03,.034,.034],[0,-.05,-.03]);
  const toe=L.toe=G(an,0,-.06,.125);E(toe,skin,[.04,.015,.045],[0,0,.035]);
  L.mH=G(an,0,-.08,-.03);L.mT=G(toe,0,-.017,0);   // ground-contact markers
 }
 avatar.traverse(o=>{if(o.isMesh)o.castShadow=true});
}
function init3D(){
 const canvas=$('mg-canvas'),stage=$('mg-stage');
 scene=new THREE.Scene();scene.background=new THREE.Color(0x4b4a54);
 camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(2.7,1.75,4.5);
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;exImport('environments/RoomEnvironment.js').then(m=>{const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(new m.RoomEnvironment(),.04).texture}).catch(()=>{});
 scene.add(new THREE.HemisphereLight(0xffffff,0x555560,.5));
 const key=new THREE.DirectionalLight(0xfff2e6,2.6);key.position.set(3,6,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);scene.add(key);
 const fill=new THREE.DirectionalLight(0xbcd0ff,.9);fill.position.set(-4,2,-3);scene.add(fill);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),groundMat);floor.rotation.x=-Math.PI/2;floor.position.y=-.04;floor.receiveShadow=true;scene.add(floor);
 const grid=new THREE.GridHelper(12,24,0x5a5a64,0x4a4a53);grid.position.y=-.025;scene.add(grid);
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.65,48),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.35}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.02;shadow.scale.set(1,.55,1);scene.add(shadow);
 makeAvatar();
 controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1,0);controls.enableDamping=true;controls.dampingFactor=.07;controls.minDistance=2.7;controls.maxDistance=9;controls.maxPolarAngle=Math.PI*.49;
 resizeObserver=new ResizeObserver(()=>{const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()});resizeObserver.observe(stage);
 const animate=()=>{if(!root.isConnected){dispose();return}raf=requestAnimationFrame(animate);controls.update();syncModel();renderer.render(scene,camera)};animate();
}
const _v=new V();let handZ=null;
const wp=o=>{o.getWorldPosition(_v);return _v};
// Joint angles (radians, positive = flexion). Numbers apply to both sides; [left,right] arrays per side.
function applyPose(o={}){
 const g=(k,i,d=0)=>{const v=o[k];return v===undefined?d:Array.isArray(v)?v[i]:v};
 avatar.rotation.set(0,0,0);const ln=o.lean||0;J.S.rotation.y=J.C.rotation.y=J.H.rotation.y=0;
 J.S.rotation.x=ln*.4;J.C.rotation.x=ln*.6;J.N.rotation.x=-ln*.3;J.H.rotation.x=-ln*.25+(o.head||0);
 [0,1].forEach(i=>{const L=J[i],s=L.side,abd=g('hipAbd',i,.05);
  L.hp.rotation.set(-g('hipF',i),s*g('hipRot',i,.12),s*abd);L.kn.rotation.x=g('kneeF',i);
  L.an.rotation.set(-g('ankDF',i),0,-s*abd);L.toe.rotation.x=-g('toe',i);
  L.sh.rotation.set(-g('shF',i),0,s*g('shAbd',i,.13));L.el.rotation.x=-g('elF',i,.12);
  L.wr.rotation.set(-g('wrF',i),-s*g('pron',i),0);
  const c=g('curl',i,.25);L.fg.forEach(([a,b])=>{a.rotation.z=-s*c*1.1;b.rotation.z=-s*c*1.2});L.th.forEach((t,k)=>t.rotation.z=-s*c*.4*(k+1));
 });
}
// Drop the body onto the floor (lowest contact marker = 0) and keep the anchor foot planted
function ground(anchor){
 avatar.position.set(0,0,0);avatar.updateMatrixWorld(true);let mn=1e9;
 for(const L of [J[0],J[1]])for(const m of [L.mH,L.mT])mn=Math.min(mn,wp(m).y);
 const an=anchor||[J[0].mH,J[0].mT,J[1].mH,J[1].mT];let z=0;an.forEach(m=>z+=wp(m).z);
 avatar.position.set(0,-mn,-z/an.length);
}
function resetPose(){if(!avatar)return;applyPose({});ground()}
// Prone (floor) exercises: toes planted, body pivots about them until the shoulders reach the requested height
function placeToes(th,zT=-.62){
 avatar.rotation.set(th,0,0);avatar.position.set(0,0,0);J[0].toe.rotation.x=J[1].toe.rotation.x=-th;avatar.updateMatrixWorld(true);
 const a=wp(J[1].mT).clone();avatar.position.set(0,-a.y,zT-a.z);avatar.updateMatrixWorld(true);
}
function prone(shY){
 let lo=.35,hi=1.57;
 for(let k=0;k<16;k++){const m=(lo+hi)/2;placeToes(m);if(wp(J[1].sh).y>shY)lo=m;else hi=m}
 const th=(lo+hi)/2;placeToes(th);return th;
}
// Two-bone arm IK in the body's sagittal plane: shoulder + elbow reach a wrist target, hand lies flat
function reachArm(L,t){
 avatar.updateMatrixWorld(true);
 const lt=L.sh.parent.worldToLocal(t.clone()),p=L.sh.position,y=lt.y-p.y,z=lt.z-p.z,L1=.3,L2=.27;
 const d=Math.min(Math.hypot(y,z),L1+L2-.002),dir=Math.atan2(-z,-y);
 const be=Math.acos(clamp((L1*L1+d*d-L2*L2)/(2*L1*d))),ph=Math.acos(clamp((L1*L1+L2*L2-d*d)/(2*L1*L2)));
 L.sh.rotation.set(dir+be,0,L.side*.14);L.el.rotation.x=-(Math.PI-ph);
 const T=avatar.rotation.x+dir+be-(Math.PI-ph);
 L.wr.rotation.set(-Math.PI/2-T,-L.side*Math.PI/2,0);
 L.fg.forEach(([a,b])=>{a.rotation.z=b.rotation.z=0});L.th.forEach(x=>x.rotation.z=0);
}
function poseFor(name,p){
 const d=.5-.5*Math.cos(2*Math.PI*p);
 if(name==='squat'){
  const H=1.45*d,K=1.7*d;
  applyPose({lean:.55*d,hipF:H,kneeF:K,ankDF:K-H,shF:1.4*d,shAbd:.08,elF:.1,head:.2*d,hipAbd:.07,hipRot:.18,curl:.3});ground();
 } else if(name==='jack'){
  const a=Math.abs(2*d-1),K=.05+.22*a;   // knees soften on landing, extend in the air
  applyPose({hipF:K*.5,kneeF:K,ankDF:K*.5,hipAbd:.03+.42*d,shAbd:.12+2.95*d,elF:.1,curl:.15,hipRot:.1});
  ground();avatar.position.y+=.06*(1-a);
 } else if(name==='lunge'){
  const q=(p*2)%1,e=.5-.5*Math.cos(2*Math.PI*q),b=p<.5?1:0,f=1-b;   // b = stepping-back leg
  const o={lean:.12*e,shF:.6*e,elF:.9*e,hipAbd:.04,hipRot:.06,curl:.3};
  const arr=(fv,bv)=>{const r=[0,0];r[f]=fv;r[b]=bv;return r};
  const Hf=1.15*e,Kf=1.3*e,Hb=-.42*e,Kb=.65*e,Tb=-Hb+Kb;
  o.hipF=arr(Hf,Hb);o.kneeF=arr(Kf,Kb);o.ankDF=arr(Kf-Hf,.1*e);o.toe=arr(0,Tb-.1*e);
  applyPose(o);ground([J[f].mH,J[f].mT]);
  // keep the back foot from sinking into the floor
  const lowest=Math.min(wp(J[b].mT).y,wp(J[b].mH).y);if(lowest<0)avatar.position.y-=lowest;
 } else if(name==='knees'||name==='kicks'){
  const hk=name==='knees',A=[0,1].map(i=>Math.max(0,Math.sin(2*Math.PI*(p+.5*i))));
  applyPose({lean:hk?0:.06,hipAbd:.04,hipRot:.08,curl:.3,hipF:A.map(a=>hk?1.45*a:.2*a),kneeF:A.map(a=>hk?1.5*a:2.3*a),ankDF:A.map(a=>.15*a),shF:[0,1].map(i=>.8*(A[1-i]-A[i])),elF:1.4});
  const st=A[0]<A[1]?0:1;ground([J[st].mH,J[st].mT]);
 } else if(name==='curl'){
  applyPose({elF:.12+2.2*d,shF:.05,shAbd:.1,curl:.3+.9*d,hipRot:.1,kneeF:.04,hipF:.02});ground();
 } else if(name==='raise'){
  applyPose({shAbd:.13+1.45*d,elF:.2,curl:.2,hipRot:.1});ground();
 } else if(name==='calf'){
  applyPose({ankDF:-.75*d,toe:.75*d,shF:.1,elF:.2,hipRot:.1,curl:.3});ground();
 } else if(name==='twist'){
  const a=.75*Math.sin(2*Math.PI*p);
  applyPose({shF:1.35,shAbd:.1,elF:1.3,curl:.6,hipRot:.1,kneeF:.12,hipF:.06,ankDF:.06});
  J.S.rotation.y=a*.5;J.C.rotation.y=a*.5;J.H.rotation.y=-a*.25;ground();
 } else {   // push-up, forearm plank, mountain climber
  if(handZ===null){applyPose({});prone(.6);handZ=wp(J[1].sh).z}
  applyPose({});const plank=name==='plank';
  const th=prone(plank?.345+.005*Math.sin(2*Math.PI*p):name==='pushup'?.6-.37*d:.6);
  J.N.rotation.x=J.H.rotation.x=-.35*th;
  for(const L of [J[0],J[1]]){
   if(plank){L.sh.rotation.set(-th,0,L.side*.05);L.el.rotation.x=-Math.PI/2;L.wr.rotation.set(0,-L.side*Math.PI/2,0);L.fg.forEach(([a,b])=>{a.rotation.z=b.rotation.z=0});L.th.forEach(x=>x.rotation.z=0)}
   else reachArm(L,new V(L.side*.205,.045,handZ));
  }
  if(name==='climber')[0,1].forEach(i=>{const a=Math.max(0,Math.sin(2*Math.PI*(p+.5*i)));J[i].hp.rotation.x=-1.25*a;J[i].kn.rotation.x=1.6*a});
 }
}
// ---- Real rigged human model (GLB with a standard Mixamo / Ready Player Me skeleton) ----
// The hidden procedural skeleton still solves every exercise; its joint rotations are copied onto the real model's bones.
let rigList=null,rigRoot=null,rigHips=null;
const MODEL_URLS=['/man.glb'];   // real human model: upload man.glb next to index.html (any Mixamo-rigged GLB works)
let rigOn=false;
const _q1=new THREE.Quaternion(),_q2=new THREE.Quaternion(),_dn=new THREE.Vector3(0,-1,0);
function setupModel(gltf){
 const root=gltf.scene,B={};root.updateMatrixWorld(true);
 root.traverse(o=>{if(o.isBone)B[o.name.toLowerCase().replace(/^mixamorig[:_]?/,'')]=o;if(o.isMesh){o.castShadow=true;o.frustumCulled=false}});
 const need=['hips','spine','neck','head'];for(const s of ['left','right'])for(const k of ['arm','forearm','hand','upleg','leg','foot'])need.push(s+k);
 const miss=need.filter(k=>!B[k]);if(miss.length)throw new Error('Missing bones: '+miss.join(', '));
 if(rigRoot)scene.remove(rigRoot);
 scene.add(root);root.updateMatrixWorld(true);
 root.scale.multiplyScalar(.98/B.hips.getWorldPosition(new V()).y);root.updateMatrixWorld(true);
 const list=[],add=(k,p,adj,p2)=>{const b=B[k];if(!b)return;list.push({b,p,p2,base:adj.clone().multiply(b.getWorldQuaternion(new THREE.Quaternion()))})};
 const I=new THREE.Quaternion(),wpos=k=>B[k].getWorldPosition(new V());
 add('hips',avatar,I);add('spine',J.S,I);add('spine1',J.S,I,J.C);add('spine2',J.C,I);add('neck',J.N,I);add('head',J.H,I);
 for(const i of [0,1]){
  const s=i?'left':'right',L=J[i];   // character's left is +X
  const aA=new THREE.Quaternion().setFromUnitVectors(wpos(s+'forearm').sub(wpos(s+'arm')).normalize(),_dn);
  const aL=new THREE.Quaternion().setFromUnitVectors(wpos(s+'leg').sub(wpos(s+'upleg')).normalize(),_dn);
  add(s+'arm',L.sh,aA);add(s+'forearm',L.el,aA);add(s+'hand',L.wr,aA);
  ['index','middle','ring','pinky'].forEach((f,k)=>{const [a,b]=L.fg[k];add(s+'hand'+f+'1',a,aA);add(s+'hand'+f+'2',b,aA);add(s+'hand'+f+'3',b,aA)});
  const aT=new THREE.Quaternion().setFromAxisAngle(new V(1,0,0),.5).multiply(aA);   // cancels the thumb's built-in tilt
  add(s+'handthumb1',L.th[0],aT);add(s+'handthumb2',L.th[1],aT);add(s+'handthumb3',L.th[1],aT);
  add(s+'upleg',L.hp,aL);add(s+'leg',L.kn,aL);add(s+'foot',L.an,aL);add(s+'toebase',L.toe,aL);
 }
 rigList=list;rigRoot=root;rigHips=B.hips;
 avatar.traverse(o=>{if(o.isMesh)o.visible=false});   // hide the simple fallback body
 rigOn=true;rigRoot.visible=true;modelBtn();
}
function syncModel(){
 if(!rigList||!rigOn)return;avatar.updateMatrixWorld(true);
 const hp=rigHips.parent;hp.updateMatrixWorld(true);rigHips.position.copy(hp.worldToLocal(avatar.position.clone()));
 for(const e of rigList){
  e.p.getWorldQuaternion(_q2);if(e.p2){e.p2.getWorldQuaternion(_q1);_q2.slerp(_q1,.5)}
  _q2.multiply(e.base);                       // desired world rotation of this bone
  e.b.parent.getWorldQuaternion(_q1).invert();e.b.quaternion.copy(_q1.multiply(_q2));e.b.updateMatrixWorld(true);
 }
}
function loadModel(url){
 // Some in-app WebViews cannot clone ImageBitmaps (DataCloneError); hide createImageBitmap so GLTFLoader uses plain <img> textures instead.
 const cib=window.createImageBitmap;window.createImageBitmap=undefined;
 return new Promise((res,rej)=>new GLTFLoader().load(url,res,undefined,rej)).then(setupModel).finally(()=>{window.createImageBitmap=cib});
}
async function tryModels(){for(const u of MODEL_URLS){try{await loadModel(u);return}catch(e){console.warn('Model not used:',u,e)}}const b=$('mg-load');if(b)b.textContent='man.glb missing'}
function modelBtn(){const b=$('mg-load');if(b)b.textContent=rigRoot?(rigOn?'Basic model':'Real person'):'Real person'}
function toggleModel(){
 if(!rigRoot){const b=$('mg-load');b.textContent='Loading…';tryModels().then(modelBtn);return}
 rigOn=!rigOn;rigRoot.visible=rigOn;avatar.traverse(o=>{if(o.isMesh)o.visible=!rigOn});modelBtn();
}
function fmt(s){const n=Math.floor(s);return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')}
function updateUI(){
 const d=exerciseData[current];$('mg-ex-title').textContent=d.title;$('mg-ex-desc').textContent=d.desc;
 $('mg-reps').textContent=reps;$('mg-time').textContent=fmt(elapsed);$('mg-set').textContent=set+'/3';
 const pct=d.isHold?Math.min(100,elapsed/(d.duration*3)*100):Math.min(100,((set-1)*d.target+reps)/(d.target*3)*100);
 $('mg-progress').style.width=pct+'%';$('mg-progress-label').textContent=Math.round(pct)+'%';
 $('mg-steps').innerHTML=d.steps.map(s=>'<li>'+s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))+'</li>').join('');
 $('mg-form').textContent=d.form;$('mg-breath').textContent=d.breath;
}
function choose(name){
 pause();current=name;reps=0;set=1;elapsed=0;cycleTime=0;holdDone=false;
 $('mg-exercise').value=name;$('mg-state').textContent='READY';$('mg-start').textContent='Start workout';
 $('mg-cue-title').textContent='Ready when you are';$('mg-cue').textContent='Press Start workout. Follow the 3D movement and the coaching cues here.';
 const pr=['pushup','plank','climber'].includes(name);if(controls){controls.target.set(0,pr?.4:1,pr?.1:0);controls.update()}
 resetPose();poseFor(name,0);updateUI();
}
function pause(){running=false;lastStamp=0;$('mg-start').textContent='Resume workout';$('mg-state').textContent='PAUSED'}
function tick(stamp){
 if(!running)return;if(!root.isConnected){running=false;return}
 if(!lastStamp)lastStamp=stamp;
 let dt=Math.min((stamp-lastStamp)/1000,.06);lastStamp=stamp;
 const d=exerciseData[current];elapsed+=dt;cycleTime+=dt*(slow?.55:1);
 if(d.isHold){
  const p=Math.min(cycleTime/d.duration,1);poseFor(current,(cycleTime*.25)%1);
  $('mg-cue-title').textContent='Hold your position';$('mg-cue').textContent=d.cue[2];
  if(p>=1&&!holdDone){holdDone=true;reps=1;pause();$('mg-cue-title').textContent='Hold complete';$('mg-cue').textContent='Great work. Rest, then press Next set when you are ready.'}
 } else {
  const p=(cycleTime%d.duration)/d.duration;poseFor(current,p);
  const phase=Math.min(3,Math.floor(p*4));
  $('mg-cue-title').textContent=['Starting position','Move with control','Stay aligned','Return smoothly'][phase];
  $('mg-cue').textContent=d.cue[phase];
  if(cycleTime>=d.duration){cycleTime-=d.duration;reps++;
   if(reps>=d.target){pause();$('mg-cue-title').textContent='Set complete';$('mg-cue').textContent='You completed '+d.target+' repetitions. Rest, then press Next set.'}
  }
 }
 updateUI();if(running)requestAnimationFrame(tick);
}
$('mg-start').addEventListener('click',()=>{
 if(running){pause();return}
 if(reps>=exerciseData[current].target||holdDone){$('mg-cue-title').textContent='Set complete';$('mg-cue').textContent='Press Next set to continue.';return}
 running=true;$('mg-start').textContent='Pause workout';$('mg-state').textContent='LIVE';lastStamp=0;requestAnimationFrame(tick);
});
$('mg-reset').addEventListener('click',()=>choose(current));
$('mg-next').addEventListener('click',()=>{
 if(set>=3){pause();$('mg-cue-title').textContent='Session complete';$('mg-cue').textContent='You have completed all three sets. Reset to start another session.';return}
 pause();set++;reps=0;cycleTime=0;holdDone=false;elapsed=0;resetPose();updateUI();$('mg-cue-title').textContent='Set '+set+' of 3';$('mg-cue').textContent='Take a short rest, then press Start workout when you are ready.';$('mg-state').textContent='REST';
});
$('mg-slower').addEventListener('click',()=>{slow=!slow;$('mg-slower').textContent=slow?'Normal demo':'Slower demo'});
$('mg-exercise').addEventListener('change',e=>choose(e.target.value));
root.querySelectorAll('[data-pick]').forEach(b=>b.addEventListener('click',()=>{choose(b.dataset.pick);$('mg-stage').scrollIntoView({behavior:'smooth',block:'center'})}));
root.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{
 const view=b.dataset.view;root.querySelectorAll('[data-view]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
 const positions={front:[0,1.7,4.8],side:[4.8,1.6,0],back:[0,1.7,-4.8]};const pos=positions[view];camera.position.set(...pos);controls.target.set(0,1.05,0);controls.update();
}));
try{init3D();choose('squat');tryModels().then(modelBtn);$('mg-load').onclick=toggleModel}catch(err){console.error(err);$('mg-state').textContent='3D UNAVAILABLE';$('mg-cue-title').textContent='3D viewer could not start';$('mg-cue').textContent='Check that your site allows JavaScript modules and can load the Three.js CDN. The workout controls require WebGL support.'}

function dispose(){cancelAnimationFrame(raf);running=false;try{resizeObserver&&resizeObserver.disconnect();renderer&&renderer.dispose()}catch(e){}}
exCleanup=dispose;

}
})();
