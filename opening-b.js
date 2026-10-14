"use strict";
// Opening B: a kinetic school day. Scroll position drives photos and type; particles also breathe in real time.
(() => {
const opening=document.querySelector('#opening'),stage=document.querySelector('#experience'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
if(!opening)return;
const DURATION=24,PRE=4,TOTAL=DURATION+PRE; // PRE: the wake-up prologue before the school day
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),lerp=(a,b,p)=>a+(b-a)*p;
const ease=x=>{x=clamp(x);return x*x*(3-2*x);},out=x=>1-(1-clamp(x))**3,inn=x=>clamp(x)**3;
const expo=x=>{x=clamp(x);return x===1?1:1-2**(-10*x);},back=x=>{x=clamp(x);return 1+2.7*(x-1)**3+1.7*(x-1)**2;};
let seed=20261014;const rand=()=>(seed=(seed*16807)%2147483647)/2147483647;
const el=(tag,cls,parent)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(parent)parent.append(e);return e;};
const all=[];
function photo(name,parent,cls='ob-photo'){const img=el('img',cls,parent);img.alt='';img.decoding='async';img.draggable=false;img.src='assets/'+name+'.webp';all.push(img);return img;}
const show=(node,on)=>{node.style.visibility=on?'visible':'hidden';return on;};

const world=opening.querySelector('.ob-world'),typeLayer=opening.querySelector('.ob-type');
const flash=opening.querySelector('.ob-flash'),leak=opening.querySelector('.ob-leak'),rays=opening.querySelector('.ob-rays');
const canvas=opening.querySelector('.ob-particles'),ctx=canvas.getContext('2d');
const clock=opening.querySelector('.ob-clock'),dial=opening.querySelector('.ob-dial'),hourHand=opening.querySelector('.ob-hour'),minuteHand=opening.querySelector('.ob-minute');
const bells=opening.querySelector('.ob-bells'),ringMarks=opening.querySelector('.ob-ring'),clockChapter=opening.querySelector('.ob-clock-chapter'),counter=opening.querySelector('.opening-time');
{const ticks=opening.querySelector('.ob-ticks');for(let i=0;i<12;i++){const a=i*Math.PI/6,r0=i%3?39:34;ticks.insertAdjacentHTML('beforeend',`<line x1="${50+Math.sin(a)*r0}" y1="${50-Math.cos(a)*r0}" x2="${50+Math.sin(a)*43}" y2="${50-Math.cos(a)*43}"/>`);}}
let W=innerWidth,H=innerHeight,portrait=H>W;

/* ---------- Scenes ---------- */
const scenes=[];
function scene(from,to,build,draw){const layer=el('div','ob-scene',world);const s={from,to,layer,draw};build(s,layer);scenes.push(s);return s;}

// 00 Wake up: alarm, eyelids, curtains, a leap out of the futon. Drawn graphics only, no photographs.
const wake=(()=>{
 const layer=el('div','ob-scene ob-wake');world.prepend(layer);
 const room=el('div','ob-room',layer),win=el('div','ob-window',room);el('div','ob-sky',win);el('div','ob-mullion',win);
 const left=el('div','ob-curtain left',room),right=el('div','ob-curtain right',room),beams=el('div','ob-beams',room),warm=el('div','ob-warm',room);
 const futon=el('div','ob-futon',layer),lidTop=el('div','ob-lid top',layer),lidBottom=el('div','ob-lid bottom',layer);
 return {layer,room,left,right,beams,warm,futon,lidTop,lidBottom};
})();
// Eyes: a sleepy half-open, a blink, then wide awake.
function lids(t){if(t<.45)return 0;if(t<.75)return .3*out((t-.45)/.3);if(t<.98)return .3*(1-ease((t-.75)/.23));return out((t-1.05)/.65);}
function drawWake(t){
 const on=t<PRE+1.4;wake.layer.style.display=on?'':'none';if(!on)return;wake.layer.style.visibility='visible';
 const open=lids(t);wake.lidTop.style.transform=`translate3d(0,${-open*102}%,0)`;wake.lidBottom.style.transform=`translate3d(0,${open*102}%,0)`;
 const curtain=back((t-1.9)/.7),gather=lerp(1,.42,clamp(curtain));
 wake.left.style.transform=`translate3d(${-curtain*62}%,0,0) scaleX(${gather})`;wake.right.style.transform=`translate3d(${curtain*62}%,0,0) scaleX(${gather})`;
 const light=ease((t-1.95)/.6);wake.beams.style.opacity=String(light*.85);wake.warm.style.opacity=String(.2+light*.8);
 // Spring up: a small dip, a bouncy leap, then the view rushes to the window.
 const dip=Math.sin(clamp((t-2.3)/.25)*Math.PI)*4,jump=back((t-2.5)/.6),push=inn((t-3.2)/(PRE+1.1-3.2));
 wake.room.style.transform=`translate3d(0,${dip-jump*3}%,0) scale(${1+jump*.06+push*1.4})`;
 wake.room.style.filter=`blur(${(1-out((t-.9)/1))*10}px) brightness(${lerp(.5,1.05,light)})`;
 wake.futon.style.transform=`translate3d(0,${jump*130}%,0)`;
}

// 01 Sea: light gathers, then an aperture opens onto the sea.
scene(0,4.3,(s,l)=>{s.img=photo('sea-view',l);s.img.style.objectPosition='60% 50%';},(s,t)=>{
 const r=expo((t-1.05)/1.5);s.layer.style.clipPath=`circle(${r*82}% at 50% 52%)`;
 const exit=out((t-3.6)/.7);
 s.img.style.transform=`translate3d(0,${-exit*22}%,0) scale(${lerp(1.5,1.12,out(t/3.6))})`;
 s.img.style.filter=`brightness(${1-exit*.45})`;
});

// 02 The hill: the camera climbs the stairs, then cuts to the school.
scene(3.6,7.2,(s,l)=>{s.a=photo('summer-stairs',l);s.b=photo('summer-building',l);s.a.style.objectPosition='50% 70%';},(s,t)=>{
 const lt=t-3.6,enter=out(lt/.7);
 s.layer.style.transform=`translate3d(0,${(1-enter)*100}%,0)`;
 s.a.style.transform=`perspective(900px) rotateX(${lerp(24,2,out(lt/1.6))}deg) translate3d(0,${lerp(10,-4,ease(lt/1.8))}%,0) scale(${lerp(1.45,1.12,out(lt/1.8))})`;
 const cut=lt>=1.8;show(s.b,cut);show(s.a,!cut||lt<1.9);
 if(cut)s.b.style.transform=`scale(${lerp(1.32,1.06,expo((lt-1.8)/1.2))}) translate3d(${lerp(-2,1,ease((lt-1.8)/1.4))}%,0,0)`;
});

// 03 Chapel: stained glass assembles from flying shards, the lead lines melt away.
scene(6.6,10.2,(s,l)=>{
 l.classList.add('ob-dark');s.mosaic=el('div','ob-mosaic',l);s.tiles=[];
 const cols=portrait?4:8,rows=portrait?7:5;
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
  const tile=el('div','ob-tile',s.mosaic);Object.assign(tile.style,{left:c/cols*100+'%',top:r/rows*100+'%',width:100/cols+'%',height:100/rows+'%'});
  const img=photo('stained-glass',tile);Object.assign(img.style,{width:cols*100+'%',height:rows*100+'%',left:-c*100+'%',top:-r*100+'%'});
  const dx=(c+.5)/cols-.5,dy=(r+.5)/rows-.5;
  s.tiles.push({tile,delay:Math.hypot(dx,dy)*.9+rand()*.25,z:-1600-rand()*1400,rx:(rand()-.5)*160,ry:(rand()-.5)*160,rz:(rand()-.5)*120,x:dx*90,y:dy*90});
 }
 s.chapel=photo('chapel-wide',l);s.chapel.style.objectPosition='42% 50%';
},(s,t)=>{
 const lt=t-6.6;
 s.tiles.forEach(p=>{const r=out((lt-p.delay)/.85);p.tile.style.opacity=String(clamp(r*3));
  p.tile.style.transform=r>=1?'none':`translate3d(${(1-r)*p.x}vw,${(1-r)*p.y}vh,${(1-r)*p.z}px) rotateX(${(1-r)*p.rx}deg) rotateY(${(1-r)*p.ry}deg) rotateZ(${(1-r)*p.rz}deg)`;});
 s.mosaic.style.setProperty('--lead',lerp(3,0,ease((lt-1.45)/.6))+'px');
 s.mosaic.style.transform=`scale(${lerp(1.02,1.12,ease(lt/2.4))})`;
 const c=ease((lt-2.05)/.5);show(s.chapel,c>0);s.chapel.style.opacity=String(c);s.chapel.style.transform=`scale(${lerp(1.22,1.06,out((lt-2.05)/1.5))})`;
});

// 04 Lunch break: snapshots land on the desk; we dive into one of them.
const cardSet=[['friends',-27,-15,-9],['summer-window',26,-18,7],['window-near',-25,19,6],['ideas',25,18,-6],['summer-friends',0,1,-2]];
scene(9.6,12.95,(s,l)=>{
 s.bg=photo('classroom',l,'ob-photo ob-blurred');s.word=el('p','ob-giant',l);s.word.textContent='仲間。';
 s.cards=cardSet.map(([name,x,y,r],i)=>{const card=el('figure','ob-card',l);const img=photo(name,card,'ob-card-img');
  return {card,img,x,y,r,at:i*.3,from:[(i%2?1:-1)*(70+rand()*40),(rand()-.5)*80,(i%2?1:-1)*(35+rand()*30)]};});
},(s,t)=>{
 const lt=t-9.6,enter=out(lt/.5);
 s.layer.style.clipPath=`inset(0 ${(1-enter)*50}% 0 ${(1-enter)*50}%)`;
 s.bg.style.transform=`scale(${lerp(1.35,1.2,ease(lt/3))})`;
 const word=out((lt-.1)/1.1);s.word.style.transform=`translate(-50%,-50%) scale(${lerp(1.5,1,word)})`;
 s.word.style.opacity=String(ease((lt-.1)/.4)*(1-ease((lt-2)/.4)));s.word.style.color=`rgba(255,255,255,${ease((lt-.75)/.5)*.92})`;
 const dive=ease((lt-1.95)/.65),unit=Math.min(W,H)/100;
 s.cards.forEach((c,i)=>{
  const r=out((lt-c.at)/.55),land=back((lt-c.at)/.55),last=i===s.cards.length-1;
  show(c.card,lt>=c.at);if(lt<c.at)return;
  let x=lerp(c.from[0]*unit*1.8,c.x*W/100,land),y=lerp(c.from[1]*unit,c.y*H/100,r),rot=lerp(c.from[2],c.r,land),sc=lerp(1.35,1,out((lt-c.at)/.45));
  if(last){const s1=Math.max(W/c.img.offsetWidth,H/c.img.offsetHeight)*1.02,ty=-(c.img.offsetTop+c.img.offsetHeight/2-c.card.offsetHeight/2)*s1;
   // Keep the faces centered when a portrait screen crops the landscape snapshot.
   const wide=c.img.offsetWidth*s1,tx=Math.min(.17*wide,Math.max(0,(wide-W)/2));
   x=lerp(x,tx,dive);y=lerp(y,ty,dive);rot=lerp(rot,0,dive);sc=lerp(sc,s1,inn(dive)*.6+dive*.4);}
  else if(dive>0){x*=1+dive*2.2;y*=1+dive*2.2;}
  c.card.style.transform=`translate(-50%,-50%) translate3d(${x}px,${y}px,0) rotate(${rot}deg) scale(${sc})`;
 });
});

// 05 Class: words are thrown at the blackboard; the frame slices into the next board.
scene(12.6,15.35,(s,l)=>{
 s.a=photo('summer-ideas',l);s.a.style.objectPosition='65% 50%';s.slices=[];
 for(let i=0;i<5;i++){const slice=el('div','ob-slice',l);Object.assign(slice.style,{left:i*20+'%',width:'20.2%'});
  const img=photo('ideas',slice);Object.assign(img.style,{width:'500%',left:-i*100+'%',objectPosition:'58% 50%'});s.slices.push({slice,img,delay:[.12,0,.2,.06,.16][i]});}
},(s,t)=>{
 const lt=t-12.6;s.layer.style.clipPath=`polygon(0 0,${expo(lt/.45)*140}% 0,${expo(lt/.45)*140-40}% 100%,0 100%)`;
 s.a.style.transform=`scale(${lerp(1.25,1.08,out(lt/1.2))})`;
 s.slices.forEach((p,i)=>{const r=expo((lt-1.2-p.delay)/.5);show(p.slice,r>0);p.slice.style.transform=`translate3d(0,${(i%2?1:-1)*(1-r)*105}%,0)`;p.img.style.transform=`scale(${lerp(1.18,1.05,out((lt-1.2)/1.4))})`;});
});

// 06 Window: push through the glass into the town beyond.
scene(15,17.95,(s,l)=>{s.a=photo('window-talk',l);s.a.style.objectPosition='53% 50%';s.a.style.transformOrigin='73% 32%';s.b=photo('high-view',l);},(s,t)=>{
 const lt=t-15,enter=out(lt/.45);
 s.layer.style.transform=`translate3d(${(1-enter)*100}%,0,0) skewX(${(1-enter)*-8}deg)`;s.a.style.filter=`blur(${(1-enter)*14}px)`;
 const push=inn((lt-.9)/1.55);s.a.style.transform=`scale(${lerp(1.06,7,push)})`;
 const b=ease((lt-1.75)/.6);show(s.b,b>0);s.b.style.opacity=String(b);s.b.style.transform=`scale(${lerp(1.8,1.1,out((lt-1.75)/1.2))})`;
});

// 07 Sunset: time slows; warm light and fireflies.
scene(17.4,21.1,(s,l)=>{s.a=photo('sunset',l);s.a.style.objectPosition='50% 60%';s.glow=el('div','ob-sunglow',l);},(s,t)=>{
 const lt=t-17.4;s.layer.style.opacity=String(ease(lt/.5)*(1-ease((t-20.55)/.5)));
 s.a.style.transform=`translate3d(${lerp(-3,2,ease(lt/3.6))}%,0,0) scale(${lerp(1.2,1.07,out(lt/3.4))})`;
 s.glow.style.opacity=String(.35+Math.sin(lt*1.6)*.12);
});

// 08 Your day: zoom out from the sunset into a wall of the whole day.
const wall=['building','chapel-wide','classroom','corridor','friends','high-view','ideas','sunset','sea-view','stained-glass','summer-building','summer-friends','summer-ideas','summer-window','window-talk'];
scene(20.4,99,(s,l)=>{
 l.classList.add('ob-dark');s.grid=el('div','ob-grid',l);
 const cols=portrait?3:5,rows=portrait?5:3;s.grid.style.gridTemplateColumns=`repeat(${cols},1fr)`;s.grid.style.gridTemplateRows=`repeat(${rows},1fr)`;
 s.scale=Math.max(cols,rows);
 s.cells=wall.map((name,i)=>{const cell=el('div','ob-cell',s.grid);photo(name,cell);const c=i%cols,r=Math.floor(i/cols);return {cell,d:Math.hypot(c-(cols-1)/2,r-(rows-1)/2),center:i===7};});
 s.shade=el('div','ob-final-shade',l);
},(s,t)=>{
 const lt=t-20.4,z=expo((lt-.1)/1.5);
 s.grid.style.transform=`scale(${lerp(s.scale,.94,z)}) rotate(${lerp(0,-1.5,z)}deg)`;s.grid.style.gap=lerp(0,8,z)+'px';
 s.cells.forEach(c=>{if(c.center)return;const r=out((lt-.35-c.d*.18)/.6);c.cell.style.opacity=String(r);c.cell.style.transform=`scale(${lerp(.6,1,back((lt-.35-c.d*.18)/.6))})`;});
 const drift=ease((lt-1.6)/2.4);s.grid.style.translate=`0 ${-drift*2}%`;
 s.shade.style.opacity=String(ease((lt-1.05)/.7)*.72);
});

/* ---------- Type ---------- */
const cues=[
 {at:2.6-PRE,end:3.95-PRE,lines:['今日が、','待ちきれない。'],anim:'bounce',pos:'center'},
 {at:1.55,end:3.45,lines:['もし、梅光を','選んだら。'],anim:'blur',pos:'center',label:'CHAPTER 01'},
 {at:3.95,end:6.35,lines:['昨日の自分を、','ひとつ越える。'],anim:'stairs',pos:'bl',label:'CHAPTER 02'},
 {at:7.05,end:9.45,lines:['ここでは、','そのままでいい。'],anim:'drop',pos:'center',label:'CHAPTER 03'},
 {at:12.75,end:14.85,lines:['やりたい。'],anim:'slam',pos:'tl',label:'CHAPTER 04'},
 {at:13.85,end:14.85,lines:['やってみる。'],anim:'slam',pos:'br',chalk:true},
 {at:15.4,end:17.25,lines:['境界の、その先へ。'],anim:'depth',pos:'center',label:'CHAPTER 05'},
 {at:17.95,end:20.35,lines:['まだ、','帰りたくない。'],anim:'type',pos:'bl',label:'CHAPTER 06'},
 {at:21.55,end:99,lines:['自分らしさが、','武器になる。'],anim:'rise',pos:'center',final:true}
].map(cue=>{
 const node=el('div',`ob-cue ${cue.anim} pos-${cue.pos}`,typeLayer);
 if(cue.label){cue.labelNode=el('small','ob-label',node);cue.labelNode.textContent=cue.label;}
 const text=el('p','',node);text.setAttribute('aria-label',cue.lines.join(''));cue.text=text;cue.chars=[];let n=0;
 cue.lines.forEach((line,li)=>{const row=el('span','ob-row',text);row.setAttribute('aria-hidden','true');[...line].forEach((ch,ci)=>{const c=el('span','ob-char',row);c.textContent=ch;cue.chars.push({c,li,ci,n:n++,r:rand()});});});
 if(cue.chalk){node.insertAdjacentHTML('beforeend','<svg class="ob-chalk" viewBox="0 0 300 40" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M6 26C58 12 118 34 178 19S262 21 294 11"/></svg>');cue.chalk=node.querySelector('path');}
 if(cue.final){cue.sub=el('p','ob-sub',node);cue.sub.textContent='梅光学院 中学校・高等学校';}
 cue.node=node;return cue;
});
function drawCue(cue,t){
 const age=t-cue.at,exit=ease((t-cue.end)/.28);if(!show(cue.node,age>=0&&exit<1))return;
 cue.node.style.opacity=String(1-exit);
 if(cue.labelNode){cue.labelNode.style.opacity=String(ease(age/.4));cue.labelNode.style.letterSpacing=lerp(.6,.3,out(age/.9))+'em';}
 const mid=(cue.chars.length-1)/2;
 if(cue.anim==='slam'){
  const r=expo(age/.32);cue.text.style.transform=`scale(${lerp(3.2,1,r)*(1+exit*.3)}) rotate(${lerp(cue.pos==='br'?7:-7,0,r)}deg)`;cue.text.style.opacity=String(ease(age/.08));
  if(cue.chalk)cue.chalk.style.strokeDashoffset=String(1-out((age-.28)/.45));return;
 }
 cue.chars.forEach(({c,li,ci,n,r:rnd})=>{
  let o=1,tr='',f='';
  if(cue.anim==='blur'){const r=out((age-n*.07)/.7);o=r;tr=`translate3d(${(1-r)*(n-mid)*.5}em,0,0) scale(${lerp(1.6,1,r)})`;f=`blur(${(1-r)*14}px)`;}
  else if(cue.anim==='stairs'){const r=back((age-n*.13)/.42);o=clamp(r*2);tr=`translate3d(0,${(1-r)*120-ci*9}%,0) scale(${lerp(.4,1,r)})`;}
  else if(cue.anim==='drop'){const r=out((age-rnd*.75)/.75);o=clamp(r*3);tr=`translate3d(0,${-(1-r)*60}vh,0) rotate(${(1-r)*(rnd-.5)*90}deg)`;f=r<1?`blur(${(1-r)*6}px)`:'';}
  else if(cue.anim==='depth'){const r=out((age-n*.06)/.8),fly=inn((t-16.45-n*.03)/.75);tr=`translate3d(${(n-mid)*fly*.9}em,0,${lerp(-1600,0,r)+fly*1100}px)`;o=clamp(r*2)*(1-ease(fly*1.4));}
  else if(cue.anim==='type'){const r=out((age-n*.1)/.5);o=r;tr=`translate3d(0,${(1-r)*24}px,0)`;f=`blur(${(1-r)*8}px)`;}
  else if(cue.anim==='bounce'){const r=back((age-n*.06)/.5);o=clamp(r*2);tr=`translate3d(0,${(1-r)*90}%,0) scale(${lerp(.3,1,r)}) rotate(${(1-r)*(n%2?16:-16)}deg)`;}
  else if(cue.anim==='rise'){const r=out((age-li*.28-ci*.05)/.8);o=r;tr=`translate3d(0,${(1-r)*110}%,0)`;}
  c.style.opacity=String(o);c.style.transform=tr;c.style.filter=f;
 });
 if(cue.sub){const r=ease((age-1.05)/.6);cue.sub.style.opacity=String(r);cue.sub.style.letterSpacing=lerp(.7,.3,out((age-1.05)/1.4))+'em';}
}

/* ---------- Particles: a stateless field computed from time ---------- */
const motes=Array.from({length:150},()=>({x:rand(),y:rand(),vx:(rand()-.5)*.02,vy:.01+rand()*.035,s:.6+rand()*2.2,tw:rand()*6.28,hue:Math.floor(rand()*4),a:Math.atan2(rand()-.5,rand()-.5),d:.15+rand()*.6}));
const glass=['255,94,82','74,168,255','255,212,84','96,226,160'];
function particles(t){
 const a=performance.now()/1000;
 ctx.clearRect(0,0,canvas.width,canvas.height);const k=canvas.width/W;
 const gather=t<1.3?ease(t/1.25):t<2.6?1-expo((t-1.25)/1.1):0,regather=t>21.2?(t<22?ease((t-21.2)/.7):1-expo((t-22)/1.3)):0;
 const chapel=ease((t-6.9)/.5)*(1-ease((t-9.8)/.5)),warm=ease((t-17.6)/.6)*(1-ease((t-21)/.6));
 const level=t<0?ease((t+PRE-1.95)/.6)*.8:t<1.3?1:lerp(.55,1,Math.max(chapel,warm))*(t>22.8?1-ease((t-22.8)/1):1);
 for(const m of motes){
  const rise=.012+warm*.05;let x=((m.x+m.vx*a)%1+1)%1,y=((m.y-(m.vy+rise)*a)%1+1)%1;
  const pull=Math.max(gather,regather);if(pull>0){const cx=.5+Math.cos(m.a+a*2)*m.d*.08*(1-pull),cy=.52+Math.sin(m.a+a*2)*m.d*.08*(1-pull);x=lerp(x,cx,pull);y=lerp(y,cy,pull);}
  const twinkle=.45+.55*Math.sin(a*3+m.tw),size=m.s*(1+warm*1.6+chapel*.6),rgb=warm>.3?'255,178,92':chapel>.3?glass[m.hue]:'255,247,226';
  ctx.globalAlpha=clamp(twinkle*level*(.35+pull*.65));ctx.fillStyle=`rgb(${rgb})`;
  ctx.shadowBlur=(warm+chapel)*10*k;ctx.shadowColor=`rgb(${rgb})`;
  ctx.beginPath();ctx.arc(x*W*k,y*H*k,size*k,0,6.283);ctx.fill();
 }
 ctx.globalAlpha=1;ctx.shadowBlur=0;
}
function resize(){const box=opening.querySelector('.ob-sticky');W=box.clientWidth||innerWidth;H=box.clientHeight||innerHeight;const dpr=Math.min(1.5,devicePixelRatio||1);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);measureClock();}

/* ---------- Camera, light and clock ---------- */
const flashes=[[2.05-PRE,.45],[3.6,.22],[5.4,.6],[8.65,.35],[12.6,.5],[13.07,.25],[14.1,.35],[17.35,.15],[20.4,.25]];
const shakes=[[2.55-PRE,7],[5.4,6],[10.15,4],[10.45,4],[10.75,4],[11.05,4],[11.35,5],[13.07,12],[14.17,12]];
const clockKeys=[[-PRE,390,'WAKE UP'],[0,450,'MORNING'],[3.6,485,'THE HILL'],[6.6,515,'CHAPEL'],[9.6,745,'LUNCH BREAK'],[12.6,830,'CLASS'],[15,940,'AFTER SCHOOL'],[17.4,1040,'SUNSET'],[20.4,1062,'YOUR DAY']];
function camera(t){
 let f=0,sx=0,sy=0;flashes.forEach(([at,a])=>{if(t>=at)f+=a*Math.exp(-(t-at)*7);});flash.style.opacity=String(clamp(f));
 shakes.forEach(([at,a])=>{const d=t-at;if(d>=0&&d<.5){const e=Math.exp(-d*10)*a;sx+=Math.sin(d*90)*e;sy+=Math.cos(d*77)*e;}});
 world.style.transform=typeLayer.style.transform=`translate3d(${sx}px,${sy}px,0)`;
 leak.style.opacity=String(Math.exp(-Math.abs(t-(2.2-PRE))*2.5)*.55+Math.exp(-Math.abs(t-17.55)*3.2)*.85+Math.exp(-Math.abs(t-1.5)*4)*.25);
 const ray=ease((t-8.55)/.5)*(1-ease((t-10)/.4));rays.style.opacity=String(ray*.55);rays.style.transform=`rotate(${t*4}deg)`;
 let key=clockKeys[0],prev=key;clockKeys.forEach(k=>{if(t>=k[0]){prev=key;key=k;}});
 // Analog hands sweep forward through the hours between chapters.
 const minutes=lerp(prev[1],key[1],out((t-key[0])/.55));
 minuteHand.setAttribute('transform',`rotate(${minutes*6} 50 50)`);hourHand.setAttribute('transform',`rotate(${minutes*.5} 50 50)`);
 clockChapter.textContent=key[2];
}

// The alarm clock rings large in the dark, then settles into the corner.
let clockHome={ox:0,oy:0,dx:0,dy:0};
function measureClock(){clock.style.transform='none';const c=clock.getBoundingClientRect(),d=dial.getBoundingClientRect(),box=opening.querySelector('.ob-sticky').getBoundingClientRect();
 clockHome={ox:d.left+d.width/2-c.left,oy:d.top+d.height/2-c.top,dx:box.left+W/2-(d.left+d.width/2),dy:box.top+H*.4-(d.top+d.height/2)};clock.style.transformOrigin=`${clockHome.ox}px ${clockHome.oy}px`;}
function placeClock(t){
 const home=out((t-1.7)/.7),big=lerp(portrait?3.2:3.6,1,home),ring=1-ease((t-1.35)/.4),now=performance.now()/1000;
 clock.style.transform=home>=1?'none':`translate3d(${clockHome.dx*(1-home)}px,${clockHome.dy*(1-home)}px,0) scale(${big}) rotate(${Math.sin(now*55)*9*ring}deg)`;
 bells.style.opacity=String(1-ease((t-2.6)/.6));ringMarks.style.opacity=String(ring*(.5+.5*Math.sin(now*30)));clockChapter.style.opacity=String(ease((t-2.2)/.4));
}

/* ---------- Playback: scroll drives the clock ---------- */
// The film occupies the first FILM share of the scroll track; the rest dissolves into the LP.
const FILM=.92,sticky=opening.querySelector('.ob-sticky'),hint=opening.querySelector('.ob-hint');
const sound=opening.querySelector('#opening-sound'),skip=opening.querySelector('#opening-skip');
const audio=new Audio('assets/opening-b-score.mp3');audio.preload='auto';audio.loop=true;audio.volume=.75;
let done=true,ready=false,shown=0,raf=0,wantsSound=false,audioEpoch=0,startupTimer,previousFocus=null;
function draw(t){
 // t runs over the whole film; tt is school-day time, negative during the wake-up prologue.
 const tt=t-PRE;opening.style.setProperty('--progress',String(clamp(t/TOTAL)));drawWake(t);
 // display, not visibility: children set visible must not leak through when scrolling back.
 scenes.forEach(s=>{const on=tt>=s.from&&tt<s.to;s.layer.style.display=on?'':'none';if(on){s.layer.style.visibility='visible';s.draw(s,tt);}});
 cues.forEach(c=>drawCue(c,tt));camera(tt);particles(tt);placeClock(t);
 hint.style.opacity=String(1-ease(t/.8));
 counter.textContent=String(Math.min(TOTAL,Math.floor(t))).padStart(2,'0')+' / '+TOTAL;opening.dataset.time=t.toFixed(2);
}
function scrolled(){const max=opening.scrollHeight-opening.clientHeight;return max>0?clamp(opening.scrollTop/max):0;}
function frame(){
 if(done)return;raf=requestAnimationFrame(frame);if(!ready)return;
 const p=scrolled(),target=clamp(p/FILM)*TOTAL;
 // Ease toward the scroll position so wheel steps glide instead of jump.
 shown+=(target-shown)*.1;if(Math.abs(target-shown)<.003)shown=target;
 draw(shown);
 const fade=ease((p-FILM)/(1-FILM));opening.style.opacity=String(1-fade);if(wantsSound)audio.volume=.75*(1-fade);
 if(p>.995&&shown>TOTAL-.05)finish();
}
function finish(focus=false){
 if(done)return;done=true;ready=false;cancelAnimationFrame(raf);clearTimeout(startupTimer);audioEpoch++;audio.pause();
 opening.hidden=true;stage.inert=false;document.body.classList.remove('opening-active');
 document.removeEventListener('visibilitychange',visibility);document.removeEventListener('keydown',keyboard);reduced.removeEventListener('change',motionChange);removeEventListener('resize',resize);unlockEvents.forEach(e=>document.removeEventListener(e,unlock,true));
 if(focus||opening.contains(document.activeElement)||document.activeElement===opening){(previousFocus?.isConnected&&previousFocus!==document.body&&previousFocus.getClientRects().length?previousFocus:document.querySelector('#scene-title')).focus({preventScroll:true});}
}
function soundLabel(on){sound.textContent=on?'音を消す':'音をつける';sound.setAttribute('aria-pressed',String(on));}
async function playSound(){const epoch=++audioEpoch;try{await audio.play();if(done||!wantsSound||epoch!==audioEpoch){audio.pause();return;}soundLabel(true);}catch{if(epoch===audioEpoch)soundLabel(false);}}
// Sound is on by default; browsers release it on the first tap, click or key press.
function unlock(event){if(!done&&wantsSound&&audio.paused&&!sound.contains(event.target))playSound();}
const unlockEvents=['pointerdown','touchend','keydown'];
function visibility(){if(document.hidden){audioEpoch++;audio.pause();}else if(!done&&wantsSound)playSound();}
function keyboard(event){if(event.key==='Escape'){event.preventDefault();finish(true);}}
function motionChange(event){if(event.matches)finish();}
sound.addEventListener('click',()=>{if(audio.paused){wantsSound=true;playSound();}else{wantsSound=false;audioEpoch++;audio.pause();soundLabel(false);}});
skip.addEventListener('click',()=>finish(true));
hint.addEventListener('click',()=>opening.scrollBy({top:opening.clientHeight*1.2,behavior:'smooth'}));
function start(){if(done)return;clearTimeout(startupTimer);resize();ready=true;}
function launch(){
 if(reduced.matches)return;
 if(stage.classList.contains('is-cinema'))document.querySelector('#movie-exit')?.click();
 const mainSound=document.querySelector('#sound-toggle');if(mainSound?.getAttribute('aria-pressed')==='true')mainSound.click();
 previousFocus=document.activeElement;done=false;ready=false;shown=0;wantsSound=true;audio.volume=.75;soundLabel(false);
opening.hidden=false;opening.style.opacity='1';opening.scrollTop=0;stage.inert=true;document.body.classList.add('opening-active');
 document.addEventListener('visibilitychange',visibility);document.addEventListener('keydown',keyboard);reduced.addEventListener('change',motionChange);addEventListener('resize',resize);unlockEvents.forEach(e=>document.addEventListener(e,unlock,true));
 resize();draw(0);playSound();opening.focus({preventScroll:true});raf=requestAnimationFrame(frame);
 // Start once the first photographs are ready; never hold the page hostage.
 startupTimer=setTimeout(()=>finish(),3500);
 const first=all.slice(0,3);let pending=first.length;
 first.forEach(img=>{if(img.complete&&img.naturalWidth){if(!--pending)start();}else{img.addEventListener('load',()=>{if(!--pending)start();},{once:true});img.addEventListener('error',()=>finish(),{once:true});}});
}
const menu=document.querySelector('#mobile-menu-controls');
if(menu){const replay=el('button','',menu);replay.type='button';replay.id='opening-replay';replay.disabled=reduced.matches;reduced.addEventListener('change',e=>{replay.disabled=e.matches;});replay.textContent='オープニングをもう一度';replay.addEventListener('click',()=>{document.querySelector('#mobile-menu').close();launch();});}
document.addEventListener('baiko:open-online',()=>finish());
if(!reduced.matches&&!new URLSearchParams(location.search).has('recap'))launch();
})();
