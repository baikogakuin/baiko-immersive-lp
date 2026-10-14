"use strict";
// Opening B: a kinetic school day. Scroll position drives photos and type; particles also breathe in real time.
(() => {
const opening=document.querySelector('#opening'),stage=document.querySelector('#experience'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
if(!opening)return;
const DURATION=29,PRE=7,EVENT_AT=17.6,EVENT_LEN=3.6,TOTAL=DURATION+PRE+EVENT_LEN; // EVENT_*: school-events montage; the day pauses while it plays // PRE: the wake-up prologue before the school day
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
const clock=opening.querySelector('.ob-clock'),dial=opening.querySelector('.ob-digital');
const clockChapter=opening.querySelector('.ob-clock-chapter'),counter=opening.querySelector('.opening-time');
let W=innerWidth,H=innerHeight,portrait=H>W;

/* ---------- Scenes ---------- */
const scenes=[];
function scene(from,to,build,draw){const layer=el('div','ob-scene',world);const s={from,to,layer,draw};build(s,layer);scenes.push(s);return s;}

// A photographic room and a registered door surface share the same image coordinates.
const wake=(()=>{
 const layer=el('div','ob-scene ob-wake',world);
 const room=el('div','ob-home-camera',layer),canvas=el('div','ob-home-canvas',room);
 const image=el('img','ob-home-image',canvas);image.src='assets/morning-home.png';image.alt='';all.push(image);
 const portal=el('div','ob-door-portal',canvas);photo('sea-view',portal,'ob-door-view');
 const door=el('div','ob-door-leaf',canvas),shade=el('div','ob-door-shade',door);
 const light=el('div','ob-door-light',canvas);
 const lidTop=el('div','ob-lid top',layer),lidBottom=el('div','ob-lid bottom',layer);
 return {layer,room,canvas,door,shade,light,lidTop,lidBottom};
})();
function lids(t){if(t<.2)return .04;if(t<.85)return .04+.48*out((t-.2)/.65);if(t<1.1)return .52-.4*ease((t-.85)/.25);return .12+.88*out((t-1.1)/.8);}
const arrivalLight=el('div','ob-arrival-light',opening.querySelector('.ob-sticky'));
arrivalLight.setAttribute('aria-hidden','true');
function drawWake(t){
 // A sustained white exposure hides the room cut, then reveals the school.
 const exposure=ease((t-4.5)/1.8)*(1-ease((t-7.25)/1.65));
 arrivalLight.style.opacity=String(exposure);
 arrivalLight.style.display=exposure>0?'':'none';
 const on=t<PRE+.85;wake.layer.style.display=on?'':'none';if(!on)return;
 wake.layer.style.visibility='visible';
 const eyes=lids(t),door=ease((t-2.8)/2.5),push=ease((t-5.1)/2.5);
 wake.lidTop.style.transform=`translateY(${-eyes*108}%)`;
 wake.lidBottom.style.transform=`translateY(${eyes*108}%)`;
 const roomWidth=Math.max(W,H*1.5),zoom=Math.max(W/(roomWidth*.2585),H/(roomWidth/1.5*.835))*1.12;
 wake.room.style.transform=`translateY(${lerp(2,0,ease((t-1.4)/1.4))}%) scale(${lerp(1,zoom,push)})`;
 wake.room.style.filter=`blur(${(1-ease(t/1.8))*5}px) brightness(${lerp(.68,1,ease(t/2.4))+door*.65})`;
 wake.door.style.transform=`perspective(1600px) rotateY(${-door*104}deg)`;
 wake.shade.style.opacity=String(door*.4);
 wake.light.style.opacity=String(ease((t-3.1)/1.9)*.95);
 wake.layer.style.opacity=String(1-ease((t-PRE)/.8));
}

// 01 Sea: light gathers, then an aperture opens onto the sea.
scene(0,4.3,(s,l)=>{s.img=photo('sea-view',l);s.img.style.objectPosition='60% 50%';},(s,t)=>{
 s.layer.style.clipPath="none";
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
scene(11.6,15.2,(s,l)=>{
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
 const lt=t-11.6;
 s.tiles.forEach(p=>{const r=out((lt-p.delay)/.85);p.tile.style.opacity=String(clamp(r*3));
  p.tile.style.transform=r>=1?'none':`translate3d(${(1-r)*p.x}vw,${(1-r)*p.y}vh,${(1-r)*p.z}px) rotateX(${(1-r)*p.rx}deg) rotateY(${(1-r)*p.ry}deg) rotateZ(${(1-r)*p.rz}deg)`;});
 s.mosaic.style.setProperty('--lead',lerp(3,0,ease((lt-1.45)/.6))+'px');
 s.mosaic.style.transform=`scale(${lerp(1.02,1.12,ease(lt/2.4))})`;
 const c=ease((lt-2.05)/.5);show(s.chapel,c>0);s.chapel.style.opacity=String(c);s.chapel.style.transform=`scale(${lerp(1.22,1.06,out((lt-2.05)/1.5))})`;
});

// 04 Lunch break: snapshots land on the desk; we dive into one of them.
const cardSet=[['friends',-27,-15,-9],['summer-window',26,-18,7],['window-near',-25,19,6],['ideas',25,18,-6],['summer-friends',0,1,-2]];
scene(14.6,17.95,(s,l)=>{
 s.bg=photo('classroom',l,'ob-photo ob-blurred');s.word=el('p','ob-giant',l);s.word.textContent='仲間。';
 s.cards=cardSet.map(([name,x,y,r],i)=>{const card=el('figure','ob-card',l);const img=photo(name,card,'ob-card-img');
  return {card,img,x,y,r,at:i*.3,from:[(i%2?1:-1)*(70+rand()*40),(rand()-.5)*80,(i%2?1:-1)*(35+rand()*30)]};});
},(s,t)=>{
 const lt=t-14.6,enter=out(lt/.5);
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
scene(17.6,20.35,(s,l)=>{
 s.a=photo('summer-ideas',l);s.a.style.objectPosition='65% 50%';s.slices=[];
 for(let i=0;i<5;i++){const slice=el('div','ob-slice',l);Object.assign(slice.style,{left:i*20+'%',width:'20.2%'});
  const img=photo('ideas',slice);Object.assign(img.style,{width:'500%',left:-i*100+'%',objectPosition:'58% 50%'});s.slices.push({slice,img,delay:[.12,0,.2,.06,.16][i]});}
},(s,t)=>{
 const lt=t-17.6;s.layer.style.clipPath=`polygon(0 0,${expo(lt/.45)*140}% 0,${expo(lt/.45)*140-40}% 100%,0 100%)`;
 s.a.style.transform=`scale(${lerp(1.25,1.08,out(lt/1.2))})`;
 s.slices.forEach((p,i)=>{const r=expo((lt-1.2-p.delay)/.5);show(p.slice,r>0);p.slice.style.transform=`translate3d(0,${(i%2?1:-1)*(1-r)*105}%,0)`;p.img.style.transform=`scale(${lerp(1.18,1.05,out((lt-1.2)/1.4))})`;});
});

// 06 Window: push through the glass into the town beyond.
scene(20,22.95,(s,l)=>{s.a=photo('window-talk',l);s.a.style.objectPosition='53% 50%';s.a.style.transformOrigin='73% 32%';s.b=photo('high-view',l);},(s,t)=>{
 const lt=t-20,enter=out(lt/.45);
 s.layer.style.transform=`translate3d(${(1-enter)*100}%,0,0) skewX(${(1-enter)*-8}deg)`;s.a.style.filter=`blur(${(1-enter)*14}px)`;
 const push=inn((lt-.9)/1.55);s.a.style.transform=`scale(${lerp(1.06,7,push)})`;
 const b=ease((lt-1.75)/.6);show(s.b,b>0);s.b.style.opacity=String(b);s.b.style.transform=`scale(${lerp(1.8,1.1,out((lt-1.75)/1.2))})`;
});

// 07 Sunset: time slows; warm light and fireflies.
scene(22.4,26.1,(s,l)=>{s.a=photo('sunset',l);s.a.style.objectPosition='50% 60%';s.glow=el('div','ob-sunglow',l);},(s,t)=>{
 const lt=t-22.4;s.layer.style.opacity=String(ease(lt/.5)*(1-ease((t-25.55)/.5)));
 s.a.style.transform=`translate3d(${lerp(-3,2,ease(lt/3.6))}%,0,0) scale(${lerp(1.2,1.07,out(lt/3.4))})`;
 s.glow.style.opacity=String(.35+Math.sin(lt*1.6)*.12);
});

// Featured reel: three captured moments, credited to the original creator.
scene(6.6,12.2,(s,l)=>{
 l.classList.add('ob-feature');opening.querySelector('.ob-sticky').append(l);
 s.bg=photo('sea-view',l,'ob-feature-sea');
 const shade=el('div','ob-feature-shade',l);
 s.strip=el('div','ob-feature-strip',l);
 s.cards=['two','three','one'].map((name,i)=>{
  const card=el('figure','ob-feature-card',s.strip),img=el('img','',card);
  img.src='assets/houkago-scene-'+name+'.png';img.alt=['海と街を望む生徒たち','光の差す校内の階段','窓辺の教室で過ごす生徒たち'][i];
  const caption=el('figcaption','',card);caption.textContent=['海の見える街','いつもの階段','放課後の教室'][i];return card;
 });
 s.copy=el('div','ob-feature-copy',l);
 const credit=el('a','ob-feature-credit',s.copy);credit.href='https://www.instagram.com/reel/DeZHhwGBRWY/';credit.target='_blank';credit.rel='noopener noreferrer';
 const icon=el('img','',credit);icon.src='assets/houkago-icon.jpg';icon.alt='あの日の放課後';
 const name=el('span','',credit);name.innerHTML='<strong>あの日の放課後</strong><small>@houkago_anohi · Instagram ↗</small>';
 const intro=el('p','ob-feature-intro',s.copy);intro.textContent='「あの日の放課後」が紹介した';
 const title=el('p','ob-feature-title',s.copy);title.innerHTML='海の街の、<br>学校。';
 const note=el('p','ob-feature-note',s.copy);note.textContent='海の向こうまで、青春が広がる。';
 const source=el('a','ob-feature-source',s.copy);source.href=credit.href;source.target='_blank';source.rel='noopener noreferrer';source.textContent='紹介リールを見る ↗';
},(s,t)=>{
 const lt=t-6.6,enter=ease(lt/.65),exit=ease((lt-5)/.6);
 s.layer.style.opacity=String(enter*(1-exit));s.layer.style.pointerEvents=enter>.8&&exit<.2?'auto':'none';s.layer.inert=enter<.8||exit>.2;
 s.bg.style.transform=`scale(${lerp(1.16,1.04,ease(lt/5.5))})`;
 s.cards.forEach((card,i)=>{const r=out((lt-.2-i*.24)/1);card.style.opacity=String(r);card.style.transform=`translateY(${(1-r)*100}px) rotate(${[-7,3,-4][i]*(.5+.5*r)}deg) scale(${lerp(.85,1,r)})`;});
 s.copy.style.opacity=String(ease((lt-.65)/.7));s.copy.style.transform=`translateY(${(1-out((lt-.65)/.9))*24}px)`;
});

// 08 Your day: zoom out from the sunset into a wall of the whole day.
const wall=['building','chapel-wide','classroom','corridor','friends','high-view','ideas','sunset','sea-view','stained-glass','summer-building','summer-friends','summer-ideas','summer-window','window-talk'];
scene(25.4,99,(s,l)=>{
 l.classList.add('ob-dark');s.grid=el('div','ob-grid',l);
 const cols=portrait?3:5,rows=portrait?5:3;s.grid.style.gridTemplateColumns=`repeat(${cols},1fr)`;s.grid.style.gridTemplateRows=`repeat(${rows},1fr)`;
 s.scale=Math.max(cols,rows);
 s.cells=wall.map((name,i)=>{const cell=el('div','ob-cell',s.grid);photo(name,cell);const c=i%cols,r=Math.floor(i/cols);return {cell,d:Math.hypot(c-(cols-1)/2,r-(rows-1)/2),center:i===7};});
 s.shade=el('div','ob-final-shade',l);
},(s,t)=>{
 const lt=t-25.4,z=expo((lt-.1)/1.5);
 s.grid.style.transform=`scale(${lerp(s.scale,.94,z)}) rotate(${lerp(0,-1.5,z)}deg)`;s.grid.style.gap=lerp(0,8,z)+'px';
 s.cells.forEach(c=>{if(c.center)return;const r=out((lt-.35-c.d*.18)/.6);c.cell.style.opacity=String(r);c.cell.style.transform=`scale(${lerp(.6,1,back((lt-.35-c.d*.18)/.6))})`;});
 const drift=ease((lt-1.6)/2.4);s.grid.style.translate=`0 ${-drift*2}%`;
 s.shade.style.opacity=String(ease((lt-1.05)/.7)*.72);
});

// School events: a fast montage just after lunch with friends.
const montage=(()=>{
 const layer=el('div','ob-scene ob-dark ob-montage',world);
 const single=(name,focus)=>{const box=el('div','ob-cut',layer);const img=photo(name,box);img.style.objectPosition=focus;return {box,img};};
 const cuts=[{at:0,end:.5,from:1.3,rot:-2,...single('event-stage','50% 45%')},{at:.45,end:.95,from:1.25,rot:2,...single('event-sports','60% 40%')},{at:.9,end:1.4,from:1.2,rot:-1.5,...single('event-music','50% 55%')}];
 const split=el('div','ob-split',layer);
 const panels=[['event-spotlight','45% 50%'],['event-festival','50% 55%'],['event-team','50% 50%']].map(([n,f],i)=>{const panel=el('div','ob-split-panel',split);const img=photo(n,panel);img.style.objectPosition=f;return {panel,img,i};});
 const finale=single('event-speech','50% 40%');
 const grid=el('div','ob-quad',layer);
 const quads=['event-stage','event-music','event-sports','event-spotlight'].map(n=>{const cell=el('div','ob-quad-cell',grid);photo(n,cell);return cell;});
 return {layer,cuts,split,panels,finale,grid,quads};
})();
const eventCuts=[0,.45,.9,1.35,2.25,2.8];
function drawMontage(tt){
 const lt=tt-EVENT_AT,on=lt>=0&&lt<EVENT_LEN;montage.layer.style.display=on?'':'none';if(!on)return false;montage.layer.style.visibility='visible';
 montage.cuts.forEach(c=>{const a=lt-c.at,v=a>=0&&lt<c.end;c.box.style.display=v?'block':'none';if(v)c.img.style.transform=`scale(${lerp(c.from,1.06,expo(a/.4))}) rotate(${lerp(c.rot,0,expo(a/.4))}deg)`;});
 // Split screen: three panels drop in from alternating directions.
 const sa=lt-1.35,sv=sa>=0&&lt<2.3;montage.split.style.display=sv?'grid':'none';
 if(sv)montage.panels.forEach(p=>{const r=expo((sa-p.i*.09)/.4);p.panel.style.transform=`translate3d(0,${(p.i%2?1:-1)*(1-r)*105}%,0)`;p.img.style.transform=`scale(${lerp(1.2,1.05,out(sa/.9))})`;});
 const fa=lt-2.25,fv=fa>=0&&lt<2.85;montage.finale.box.style.display=fv?'block':'none';if(fv)montage.finale.img.style.transform=`scale(${lerp(1.35,1.08,expo(fa/.45))})`;
 // Four-up wall, popping in one by one, then it hands over to class.
 const qa=lt-2.8,qv=qa>=0;montage.grid.style.display=qv?'grid':'none';
 if(qv){montage.quads.forEach((c,i)=>{const r=back((qa-i*.08)/.35);c.style.transform=`scale(${lerp(.6,1,r)})`;c.style.opacity=String(clamp(r*2));});montage.grid.style.transform=`scale(${lerp(1,1.08,ease(qa/.8))})`;}
 // A flash and a jolt on every cut.
 let f=0,jx=0;eventCuts.forEach(at=>{const d=lt-at;if(d>=0){f+=.32*Math.exp(-d*9);if(d<.3)jx+=Math.sin(d*80)*Math.exp(-d*14)*6;}});
 // The montage owns the flash while the day's clock is paused.
 flash.style.opacity=String(clamp(f));montage.layer.style.transform=`translate3d(${jx}px,0,0)`;
 return true;
}

/* ---------- Type ---------- */
const cues=[
 {at:2.6-PRE,end:3.95-PRE,lines:['今日が、','待ちきれない。'],anim:'bounce',pos:'center'},
 {at:1.55,end:3.45,lines:['もし、梅光を','選んだら。'],anim:'blur',pos:'center',label:'CHAPTER 01'},
 {at:3.95,end:6.35,lines:['昨日の自分を、','ひとつ越える。'],anim:'stairs',pos:'bl',label:'CHAPTER 02'},
 {at:12.05,end:14.45,lines:['ここでは、','そのままでいい。'],anim:'drop',pos:'center',label:'CHAPTER 03'},
 {at:17.75,end:19.85,lines:['やりたい。'],anim:'slam',pos:'tl',label:'CHAPTER 04'},
 {at:18.85,end:19.85,lines:['やってみる。'],anim:'slam',pos:'br',chalk:true},
 {at:20.1,end:22.25,lines:['この街で、','可能性が広がる。'],anim:'depth',pos:'center',label:'CHAPTER 05'},
 {at:22.95,end:25.35,lines:['まだ、','帰りたくない。'],anim:'type',pos:'bl',label:'CHAPTER 06'},
 {at:26.55,end:99,lines:['ここから、','誰と何をやってみよう。'],anim:'rise',pos:'center',final:true}
].map(cue=>{
 const node=el('div',`ob-cue ${cue.anim} pos-${cue.pos}`,typeLayer);
 if(cue.label){cue.labelNode=el('small','ob-label',node);cue.labelNode.textContent=cue.label;}
 const text=el('p','',node);text.setAttribute('aria-label',cue.lines.join(''));cue.text=text;cue.chars=[];let n=0;
 cue.lines.forEach((line,li)=>{const row=el('span','ob-row',text);row.setAttribute('aria-hidden','true');[...line].forEach((ch,ci)=>{const c=el('span','ob-char',row);c.textContent=ch;cue.chars.push({c,li,ci,n:n++,r:rand()});});});
 if(cue.chalk){node.insertAdjacentHTML('beforeend','<svg class="ob-chalk" viewBox="0 0 300 40" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M6 26C58 12 118 34 178 19S262 21 294 11"/></svg>');cue.chalk=node.querySelector('path');}
 if(cue.final){cue.sub=el('p','ob-sub',node);cue.sub.textContent='梅光学院 中学校・高等学校';cue.credit=el('p','ob-credit-line',node);cue.credit.innerHTML='このWEBサイトは、<br>生徒が0から100まで作成しています。';}
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
  else if(cue.anim==='depth'){const r=out((age-n*.03)/.7),fly=inn((t-21.8-n*.02)/.6);tr=`translate3d(${(n-mid)*fly*.9}em,0,${lerp(-1600,0,r)+fly*1100}px)`;o=clamp(r*2)*(1-ease(fly*1.4));}
  else if(cue.anim==='type'){const r=out((age-n*.1)/.5);o=r;tr=`translate3d(0,${(1-r)*24}px,0)`;f=`blur(${(1-r)*8}px)`;}
  else if(cue.anim==='bounce'){const r=back((age-n*.06)/.5);o=clamp(r*2);tr=`translate3d(0,${(1-r)*90}%,0) scale(${lerp(.3,1,r)}) rotate(${(1-r)*(n%2?16:-16)}deg)`;}
  else if(cue.anim==='rise'){const r=out((age-li*.28-ci*.05)/.8);o=r;tr=`translate3d(0,${(1-r)*110}%,0)`;}
  c.style.opacity=String(o);c.style.transform=tr;c.style.filter=f;
 });
 if(cue.sub){const r=ease((age-1.05)/.6);cue.sub.style.opacity=String(r);cue.sub.style.letterSpacing=lerp(.7,.3,out((age-1.05)/1.4))+'em';cue.credit.style.opacity=String(ease((age-1.6)/.6));}
}

/* ---------- Particles: a stateless field computed from time ---------- */
const motes=Array.from({length:150},()=>({x:rand(),y:rand(),vx:(rand()-.5)*.02,vy:.01+rand()*.035,s:.6+rand()*2.2,tw:rand()*6.28,hue:Math.floor(rand()*4),a:Math.atan2(rand()-.5,rand()-.5),d:.15+rand()*.6}));
const glass=['255,94,82','74,168,255','255,212,84','96,226,160'];
function particles(t){
 t=t>=11.6?t-5:t>=6.6?6.6:t;
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
function resize(){portrait=innerHeight>innerWidth;const box=opening.querySelector('.ob-sticky');W=box.clientWidth||innerWidth;H=box.clientHeight||innerHeight;const dpr=Math.min(1.5,devicePixelRatio||1);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);measureClock();}

/* ---------- Camera, light and clock ---------- */
const flashes=[[2.05-PRE,.45],[3.6,.22],[5.4,.6],[8.65,.35],[12.6,.5],[13.07,.25],[14.1,.35],[17.35,.15],[20.4,.25]];
const shakes=[[2.55-PRE,7],[5.4,6],[10.15,4],[10.45,4],[10.75,4],[11.05,4],[11.35,5],[13.07,12],[14.17,12]];
const clockKeys=[[-PRE,390,'WAKE UP'],[0,450,'MORNING'],[3.6,485,'THE HILL'],[6.6,515,'CHAPEL'],[9.6,745,'LUNCH BREAK'],[12.6,830,'CLASS'],[15,940,'AFTER SCHOOL'],[17.4,1040,'SUNSET'],[20.4,1062,'YOUR DAY']];
function camera(t){
 const featured=t>=6.6&&t<11.6;
 t=t>=11.6?t-5:featured?6.59:t;
 let f=0,sx=0,sy=0;flashes.forEach(([at,a])=>{if(t>=at)f+=a*Math.exp(-(t-at)*7);});flash.style.opacity=String(clamp(f));
 shakes.forEach(([at,a])=>{const d=t-at;if(d>=0&&d<.5){const e=Math.exp(-d*10)*a;sx+=Math.sin(d*90)*e;sy+=Math.cos(d*77)*e;}});
 world.style.transform=typeLayer.style.transform=`translate3d(${sx}px,${sy}px,0)`;
 leak.style.opacity=String(Math.exp(-Math.abs(t-(2.2-PRE))*2.5)*.55+Math.exp(-Math.abs(t-17.55)*3.2)*.85+Math.exp(-Math.abs(t-1.5)*4)*.25);
 const ray=ease((t-8.55)/.5)*(1-ease((t-10)/.4));rays.style.opacity=String(ray*.55);rays.style.transform=`rotate(${t*4}deg)`;
 let key=clockKeys[0],prev=key;clockKeys.forEach(k=>{if(t>=k[0]){prev=key;key=k;}});
 // Digital time advances with each chapter.
 const minutes=lerp(prev[1],key[1],out((t-key[0])/.55));
 const wholeMinutes=Math.round(minutes);dial.textContent=String(Math.floor(wholeMinutes/60)%24).padStart(2,'0')+':'+String(wholeMinutes%60).padStart(2,'0');
 clockChapter.textContent=featured?'FEATURED':key[2];
}

// The digital alarm appears in the dark, then settles into the corner.
let clockHome={ox:0,oy:0,dx:0,dy:0};
function measureClock(){clock.style.transform='none';const c=clock.getBoundingClientRect(),d=dial.getBoundingClientRect(),box=opening.querySelector('.ob-sticky').getBoundingClientRect();
 clockHome={ox:d.left+d.width/2-c.left,oy:d.top+d.height/2-c.top,dx:box.left+W/2-(d.left+d.width/2),dy:box.top+H*.4-(d.top+d.height/2)};clock.style.transformOrigin=`${clockHome.ox}px ${clockHome.oy}px`;}
function placeClock(t){
 const home=out((t-1.7)/.7),big=lerp(portrait?3.2:3.6,1,home),ring=1-ease((t-1.35)/.4),now=performance.now()/1000;
 clock.style.transform=home>=1?'none':`translate3d(${clockHome.dx*(1-home)}px,${clockHome.dy*(1-home)}px,0) scale(${big}) rotate(${Math.sin(now*55)*9*ring}deg)`;
 dial.style.opacity=String(1-ring*.18*(.5+.5*Math.sin(now*8)));clockChapter.style.opacity=String(ease((t-2.2)/.4));
}

/* ---------- Playback: scroll drives the clock ---------- */
// The film occupies the first FILM share of the scroll track; the rest dissolves into the LP.
const FILM=.92,sticky=opening.querySelector('.ob-sticky'),hint=opening.querySelector('.ob-hint');
const sound=opening.querySelector('#opening-sound'),skip=opening.querySelector('#opening-skip');
const audio=new Audio('assets/opening-b-score.mp3');audio.preload='auto';audio.loop=true;audio.volume=.75;
let done=true,ready=false,shown=0,raf=0,wantsSound=false,audioEpoch=0,startupTimer,previousFocus=null;
function draw(t){
 // t runs over the whole film; tt is school-day time, negative during the wake-up prologue.
 const tt=t-PRE,old=tt<EVENT_AT?tt:Math.max(EVENT_AT,tt-EVENT_LEN);opening.style.setProperty('--progress',String(clamp(t/TOTAL)));drawWake(t);
 // display, not visibility: children set visible must not leak through when scrolling back.
 scenes.forEach(s=>{const on=old>=s.from&&old<s.to;s.layer.style.display=on?'':'none';if(on){s.layer.style.visibility='visible';s.draw(s,old);}});
 cues.forEach(c=>drawCue(c,old));camera(old);particles(old);placeClock(t);
 if(drawMontage(tt))clockChapter.textContent='SCHOOL EVENTS';
 hint.style.opacity='1';
 hint.querySelector('span').textContent=t<1.9?'スクロールして、目を覚ます':t<5.2?'スクロールして、扉を開ける':t<8.9?'光の先へ、スクロール':'スクロールで、時間を進める';
 hint.querySelector('small').textContent=portrait?'タップかスワイプで進む · 止めると映像も止まる':'クリックかスクロールで進む · 止めると映像も止まる';
 counter.textContent=String(Math.min(TOTAL,Math.floor(t))).padStart(2,'0')+' / '+Math.round(TOTAL);opening.dataset.time=t.toFixed(2);
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
 if(done)return;const carrySound=!audio.paused;done=true;ready=false;cancelAnimationFrame(raf);clearTimeout(startupTimer);audioEpoch++;audio.pause();
 opening.hidden=true;stage.inert=false;document.body.classList.remove('opening-active');
 if(carrySound){const lpSound=document.querySelector('#sound-toggle');if(lpSound?.getAttribute('aria-pressed')!=='true')lpSound.click();}
 document.removeEventListener('visibilitychange',visibility);document.removeEventListener('keydown',keyboard);reduced.removeEventListener('change',motionChange);removeEventListener('resize',resize);unlockEvents.forEach(e=>document.removeEventListener(e,unlock,true));
 if(focus||opening.contains(document.activeElement)||document.activeElement===opening){(previousFocus?.isConnected&&previousFocus!==document.body&&previousFocus.getClientRects().length?previousFocus:document.querySelector('#scene-title')).focus({preventScroll:true});}
}
function soundLabel(on){sound.textContent=on?'音を消す':'音をつける';sound.setAttribute('aria-pressed',String(on));}
async function playSound(){const epoch=++audioEpoch;try{await audio.play();if(done||!wantsSound||epoch!==audioEpoch){audio.pause();return;}soundLabel(true);}catch{if(epoch===audioEpoch)soundLabel(false);}}
// Sound is on by default; browsers release it on the first tap, click or key press.
function unlock(event){if(!done&&wantsSound&&audio.paused&&!sound.contains(event.target))playSound();}
const unlockEvents=['pointerdown','touchend','keydown'];
function visibility(){if(document.hidden){audioEpoch++;audio.pause();}else if(!done&&wantsSound)playSound();}
function keyboard(event){if(event.key==='Escape'){event.preventDefault();finish(true);}else if(event.key==='ArrowRight'){event.preventDefault();advance();}}
function motionChange(event){if(event.matches)finish();}
sound.addEventListener('click',()=>{if(audio.paused){wantsSound=true;playSound();}else{wantsSound=false;audioEpoch++;audio.pause();soundLabel(false);}});
skip.addEventListener('click',()=>finish(true));
// Tap or click anywhere except controls and links to glide to the next moment where the words are fully shown.
const toFilm=x=>PRE+(x<EVENT_AT?x:x+EVENT_LEN);
const stops=[3.6,toFilm(3),toFilm(5.6),toFilm(8.2),toFilm(13.6),toFilm(16.4),PRE+EVENT_AT+1.7,PRE+EVENT_AT+3.3,toFilm(19.4),toFilm(21.3),toFilm(24.4),toFilm(28.8)];
function advance(){const max=opening.scrollHeight-opening.clientHeight,next=stops.find(x=>x>shown+.15);opening.scrollTo({top:next===undefined?max:next/TOTAL*FILM*max,behavior:'smooth'});}
hint.addEventListener('click',advance);
opening.addEventListener('click',event=>{if(!event.target.closest('button,a,input'))advance();});
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
