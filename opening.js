"use strict";
(() => {
const opening=document.querySelector('#opening'),stage=document.querySelector('#experience'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
if(!opening)return;
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},out=x=>1-(1-clamp(x))**3;
// All animation and audio use one 22-second editorial clock.
const DURATION=22;
const scenes=[
{at:0,end:4,cut:'fade',photos:[['sea-view','60% 50%',1.26,1.08,-2,0]]},
{at:3.55,end:6.7,cut:'panels',layout:'triptych',photos:[['summer-stairs','48% 50%',1.2,1.04,0,0],['chapel-wide','42% 50%',1.12,1.03,-1,1],['stained-glass','76% 50%',1.2,1.05,1,-1]]},
{at:6.35,end:9.65,cut:'left',photos:[['summer-window','70% 45%',1.18,1.05,1,-1]]},
{at:9.35,end:12.8,cut:'up',photos:[['summer-ideas','65% 50%',1.2,1.06,-1,1]]},
{at:12.5,end:15.7,cut:'panels',layout:'diptych',photos:[['window-near','53% 50%',1.18,1.06,1,-1],['summer-friends','45% 50%',1.14,1.04,-1,1]]},
{at:15.35,end:18,cut:'iris',photos:[['window-talk','53% 50%',1.08,1.18,-1,1]]},
{at:17.8,end:18.35,cut:'cut',photos:[['friends','52% 50%',1.13,1.09,0,0]]},
{at:18.15,end:18.7,cut:'cut',photos:[['ideas','58% 50%',1.12,1.06,0,0]]},
{at:18.5,end:19.1,cut:'cut',photos:[['sunny-stairs','48% 50%',1.14,1.06,0,0]]},
{at:18.9,end:22,cut:'open',photos:[['sea-view','60% 50%',1.17,1.08,0,0]]}
];
const titles=[
{at:1.1,end:3.35,style:'question',label:'YOUR STORY BEGINS HERE',lines:['もし、梅光を','選んだら。'],stroke:true},
{at:3.85,end:6.25,style:'begin',label:'01 / A NEW DAY',lines:['ここから、'],stroke:true},
{at:6.65,end:9.25,style:'laugh',label:'02 / LITTLE MOMENTS',lines:['笑って。'],stroke:true},
{at:9.7,end:12.4,style:'learn',label:'03 / FIND YOUR SPARK',lines:['夢中になって。'],stroke:true},
{at:12.85,end:15.25,style:'self',label:'04 / BE YOURSELF',lines:['自分のままで。'],stroke:true},
{at:15.65,end:17.75,style:'spark',label:'05 / TAKE A FIRST STEP',lines:['やってみたい。','やってみよう。'],stroke:true},
{at:19.15,end:21.55,style:'final',label:'BAIKO GAKUIN',lines:['ありのままで、','本気の青春。'],stroke:true}
];
const curtain=document.createElement('div');curtain.className='opening-curtain';curtain.setAttribute('aria-hidden','true');opening.querySelector('.opening-light').after(curtain);
const layers=opening.querySelector('.opening-layers');
const entries=scenes.map(scene=>{
 const layer=document.createElement('div');layer.className='opening-shot '+(scene.layout||'single');
 const photos=scene.photos.map(([image,focus,z0,z1,x0,x1])=>{
  const panel=document.createElement('div');panel.className='opening-panel';panel.style.setProperty('--focus',focus);
  const img=new Image();img.alt='';img.decoding='async';img.src='assets/'+image+'.webp';panel.append(img);layer.append(panel);return {img,panel,z0,z1,x0,x1};
 });layers.append(layer);return {...scene,layer,photos};
});
const titleLayer=opening.querySelector('.opening-titles');
const textEntries=titles.map(cue=>{
 const element=document.createElement('div');element.className='opening-copy '+cue.style;
 const label=document.createElement('small');label.textContent=cue.label;element.append(label);
 const text=document.createElement('p');text.setAttribute('aria-label',cue.lines.join(''));const chars=[];
 cue.lines.forEach((line,lineIndex)=>{const row=document.createElement('span');row.className='opening-row';row.setAttribute('aria-hidden','true');[...line].forEach((character,index)=>{const char=document.createElement('span');char.className='opening-char';char.textContent=character;row.append(char);chars.push({char,delay:lineIndex*.17+index*.034});});text.append(row);});element.append(text);
 if(cue.stroke){const line=document.createElement('div');line.className='opening-underline';element.append(line);}
 titleLayer.append(element);return {...cue,element,chars,label,stroke:element.querySelector('.opening-underline')};
});
const sound=opening.querySelector('#opening-sound'),skip=opening.querySelector('#opening-skip'),counter=opening.querySelector('.opening-time'),light=opening.querySelector('.opening-light'),bars=[...opening.querySelectorAll('.opening-bar')];
const audio=new Audio('assets/opening-score.mp3');audio.preload='none';audio.volume=.72;
let done=true,playing=false,elapsed=0,last=0,raf=0,wantsSound=false,audioEpoch=0,startupTimer,previousFocus=null;
function finish(focus=false){
 if(done)return;done=true;playing=false;cancelAnimationFrame(raf);clearTimeout(startupTimer);audioEpoch++;audio.pause();
 opening.hidden=true;stage.inert=false;document.body.classList.remove('opening-active');
 document.removeEventListener('visibilitychange',visibility);document.removeEventListener('keydown',keyboard);reduced.removeEventListener('change',motionChange);
 if(focus||opening.contains(document.activeElement)){(previousFocus?.isConnected&&previousFocus!==document.body&&previousFocus.getClientRects().length?previousFocus:document.querySelector('#scene-title')).focus({preventScroll:true});}
}
function draw(t){
 curtain.style.opacity=String(1-ease(t/2.1));
 let front=-1;entries.forEach((shot,i)=>{if(t>=shot.at&&shot.photos.every(p=>p.img.complete&&p.img.naturalWidth))front=i;});
 let behind=front-1;while(behind>=0&&!entries[behind].photos.every(p=>p.img.complete&&p.img.naturalWidth))behind--;
 entries.forEach((shot,i)=>{
  const visible=i===front||i===behind;shot.layer.style.visibility=visible?'visible':'hidden';if(!visible)return;
  const age=t-shot.at,p=clamp(age/(shot.end-shot.at)),r=out(age/.55);shot.layer.style.opacity='1';shot.layer.style.gap=shot.layout?(4+out(age/1.4)*8)+'px':'0';
  shot.layer.style.clipPath=shot.cut==='iris'?`circle(${r*150}% at 65% 45%)`:shot.cut==='left'?`inset(0 ${(1-r)*100}% 0 0)`:shot.cut==='up'?`inset(${(1-r)*100}% 0 0 0)`:shot.cut==='open'?`inset(0 ${(1-r)*50}% 0 ${(1-r)*50}%)`:'none';
  shot.photos.forEach((photo,j)=>{const reveal=out((age-j*.13)/.7);photo.panel.style.clipPath=shot.cut==='panels'?`inset(${j%2?0:(1-reveal)*100}% 0 ${j%2?(1-reveal)*100:0}% 0)`:'none';const z=photo.z0+(photo.z1-photo.z0)*out(p*.85);photo.img.style.transform=`translate3d(${photo.x0+(photo.x1-photo.x0)*p}%,${(1-p)*.7}%,0) scale(${z})`;});
 });
 textEntries.forEach(cue=>{
  const age=t-cue.at,exit=ease((t-cue.end)/.22),visible=age>=0&&exit<1;cue.element.style.visibility=visible?'visible':'hidden';if(!visible)return;
  cue.element.style.opacity=String(1-exit);cue.element.style.transform=`translateY(${-exit*18}px)`;
  cue.label.style.opacity=String(ease(age/.35));cue.label.style.letterSpacing=`${.2+(1-out(age/.8))*.25}em`;
  cue.chars.forEach(({char,delay})=>{const r=out((age-delay)/.65);char.style.opacity=String(r);char.style.transform=`translate3d(${(1-r)*8}px,${(1-r)*110}%,0) rotate(${(1-r)*5}deg)`;});if(cue.stroke)cue.stroke.style.transform=`scaleX(${out((age-.36)/.7)})`;
 });
 const cinematic=1-ease((t-(DURATION-.8))/.8);bars.forEach(bar=>bar.style.transform=`scaleY(${cinematic})`);
 const sweep=t>=18.9?(t-18.9)/.9:(t-6.35)/.85;light.style.opacity=String(sweep>0&&sweep<1?Math.sin(sweep*Math.PI)*.18:0);light.style.transform=`translateX(${-120+clamp(sweep)*240}%) rotate(-18deg)`;
 opening.style.setProperty('--progress',String(clamp(t/DURATION)));counter.textContent=String(Math.min(DURATION,Math.floor(t))).padStart(2,'0')+' / '+DURATION;opening.style.opacity=String(1-ease((t-(DURATION-.45))/.45));opening.dataset.time=t.toFixed(2);if(wantsSound)audio.volume=.72*(1-ease((t-(DURATION-1.4))/1.4));
}
function tick(now){if(done||!playing)return;if(last)elapsed+=(now-last)/1000;last=now;if(elapsed>=DURATION){finish();return;}draw(elapsed);raf=requestAnimationFrame(tick);}
async function playSound(){const epoch=++audioEpoch;try{audio.currentTime=Math.min(elapsed,DURATION-.1);await audio.play();if(done||!wantsSound||epoch!==audioEpoch){audio.pause();return;}sound.textContent='音を消す';sound.setAttribute('aria-pressed','true');}catch{if(epoch===audioEpoch){wantsSound=false;sound.textContent='音をつける';sound.setAttribute('aria-pressed','false');}}}
function visibility(){playing=!document.hidden;last=0;if(document.hidden){cancelAnimationFrame(raf);audioEpoch++;audio.pause();}else if(!done){if(wantsSound)playSound();raf=requestAnimationFrame(tick);}}
function keyboard(event){if(event.key==='Escape'){event.preventDefault();finish(true);}}
function motionChange(event){if(event.matches)finish();}
sound.addEventListener('click',()=>{wantsSound=!wantsSound;if(wantsSound)playSound();else{audioEpoch++;audio.pause();sound.textContent='音をつける';sound.setAttribute('aria-pressed','false');}});skip.addEventListener('click',()=>finish(true));
function start(){if(done)return;clearTimeout(startupTimer);opening.hidden=false;opening.style.opacity='1';stage.inert=true;document.body.classList.add('opening-active');document.addEventListener('visibilitychange',visibility);document.addEventListener('keydown',keyboard);reduced.addEventListener('change',motionChange);draw(0);playing=!document.hidden;if(playing)raf=requestAnimationFrame(tick);}
function launch(){if(reduced.matches)return;const longMovieExit=document.querySelector('#movie-exit');if(stage.classList.contains('is-cinema'))longMovieExit.click();const mainSound=document.querySelector('#sound-toggle');if(mainSound?.getAttribute('aria-pressed')==='true')mainSound.click();previousFocus=document.activeElement;done=false;playing=false;elapsed=0;last=0;wantsSound=false;audio.volume=.72;sound.textContent='音をつける';sound.setAttribute('aria-pressed','false');opening.hidden=false;opening.style.opacity='1';curtain.style.opacity='1';stage.inert=true;document.body.classList.add('opening-active');document.addEventListener('keydown',keyboard);startupTimer=setTimeout(()=>finish(),2500);const first=entries[0].photos[0].img;if(first.complete&&first.naturalWidth)start();else{first.addEventListener('load',start,{once:true});first.addEventListener('error',()=>finish(),{once:true});}}
const menu=document.querySelector('#mobile-menu-controls');
if(menu){const replay=document.createElement('button');replay.type='button';replay.id='opening-replay';replay.disabled=reduced.matches;reduced.addEventListener('change',e=>{replay.disabled=e.matches;});replay.textContent='オープニングをもう一度';menu.append(replay);replay.addEventListener('click',()=>{document.querySelector('#mobile-menu').close();launch();});}
document.addEventListener('baiko:open-online',()=>finish());
if(!reduced.matches&&!new URLSearchParams(location.search).has('recap'))launch();
})();
