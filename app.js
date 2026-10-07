"use strict";
(() => {
  const root=document.documentElement;
  const stage=document.querySelector('#experience');
  const title=document.querySelector('#scene-title');
  const label=document.querySelector('#scene-label');
  const note=document.querySelector('#scene-note');
  const actions=document.querySelector('#scene-actions');
  const viewOptions=document.querySelector('#view-options');
  const back=document.querySelector('#back-button');
  const restart=document.querySelector('#restart-button');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let motionOff=reduced.matches;
  let current='start', history=[], busy=false, activePlane=0, selectedMood=null, viewIndex=0;
  const planes=[...document.querySelectorAll('.photo-plane')];
  const views=[
    {image:'sea-view',name:'海と山',note:'遠くまで、見渡してみる。',focus:'60% 50%'},
    {image:'high-view',name:'階段の上',note:'歩いてきた道を、振り返る。',focus:'58% 50%'},
    {image:'window',name:'窓辺',note:'この窓辺、好きかもしれない。',focus:'50% 50%'},
    {image:'sunny-stairs',name:'空を見上げる',note:'少しだけ、深呼吸。',focus:'48% 50%'},
    {image:'stained-glass',name:'ステンドグラス',note:'色のある光に、足を止める。',focus:'76% 50%'},
    {image:'chapel-wide',name:'チャペル',note:'この光の中で、ひと息。',focus:'42% 50%'},
    {image:'corridor',name:'廊下',note:'いつもの道にも、好きな場所。',focus:'35% 50%'},
    {image:'summer-stairs',name:'夏の階段',note:'空へ続く、いつもの道。',focus:'50% 50%'},
    {image:'summer-building',name:'夏の校舎',note:'青空の下で、ここに来たくなる。',focus:'50% 50%'},
    {image:'building',name:'校舎',note:'明日も、この場所へ。',focus:'60% 50%'}
  ];
  const scenes={
    start:{image:'sea-view',phase:0,label:'YOUR FIRST DAY IN BAIKO',title:'この景色の中で、\nありのままで。',note:'今日は、梅光生の気分で。',focus:'60% 50%',mobile:'60% 50%',choices:[['一日をはじめる','stairs']]},
    stairs:{image:'summer-stairs',phase:1,label:'朝 ｜ 登校',title:'空へ向かって、\n一段ずつ。',note:'いつもの朝が、少し楽しみになる。',mobile:'48% 50%',choices:[['階段をのぼって、振り返る','panorama']]},
    panorama:{image:'high-view',phase:1,label:'朝 ｜ 階段の上',title:'振り返ると、\n街がひらけた。',note:'足を止めたくなる、いつもの景色。',mobile:'58% 50%',choices:[['景色を眺めて、校舎へ','door']]},
    door:{image:'summer-building',phase:1,label:'朝 ｜ 校舎の入口',title:'この校舎が、\n今日の居場所。',note:'さあ、中へ。',mobile:'60% 50%',choices:[['校舎に入る','glass']]},
    glass:{image:'stained-glass',phase:1,label:'朝 ｜ 光に誘われて',title:'光にも、\nいろんな色がある。',note:'好きな色を、見つけてみる。',focus:'50% 50%',mobile:'76% 50%',choices:[['チャペルを見渡す','chapel']]},
    chapel:{image:'chapel-wide',phase:1,label:'朝 ｜ チャペル',title:'光が落ちる、\n静かな場所。',note:'ゆっくり、見渡してみる。',mobile:'42% 50%',choices:[['廊下を歩く','corridor']]},
    corridor:{image:'corridor',phase:2,label:'午前 ｜ 教室へ',title:'廊下の先に、\n今日の続き。',note:'足音が、少し響く。',mobile:'35% 50%',choices:[['教室に入る','morning']]},
    morning:{image:'window',phase:2,label:'午前 ｜ 窓辺の席',title:'窓の向こうに、\nいつもの街。',note:'ノートを開く。一日が動き出す。',mobile:'50% 50%',choices:[['午前を過ごして、お昼へ','lunch']]},
    lunch:{image:'classroom',phase:3,label:'昼 ｜ お弁当の時間',title:'お腹、すいた。\nいつもの席に座ろう。',note:'ふたを開ける。お弁当の香り。',mobile:'42% 50%',choices:[['お昼を食べて、ひと休み','break']]},
    break:{image:'high-view',phase:4,label:'休み時間 ｜ いまの気分は？',title:'少し、時間がある。\nどこで過ごそう。',note:'にぎやかな時間も、静かな時間も。',mobile:'58% 50%',choices:[['みんなのところへ','friends'],['窓辺でひと息','quiet']]},
    friends:{image:'friends',phase:4,label:'休み時間 ｜ 友人と',title:'なんでもない話で、\nこんなに笑う。',note:'もう少し、ここにいたい。',mobile:'52% 50%',choices:[['ちょっと景色も見に行く','views'],['午後を過ごして、放課後へ','after']]},
    quiet:{image:'window',phase:4,label:'休み時間 ｜ 自分のペースで',title:'何もしない時間も、\n悪くない。',note:'窓の向こうを眺めて、深呼吸。',mobile:'50% 50%',choices:[['ほかの角度からも眺める','views'],['午後を過ごして、放課後へ','after']]},
    views:{image:'sea-view',phase:4,label:'寄り道 ｜ 好きな景色を探す',title:'顔を上げると、\nこんな景色。',note:'遠くまで、見渡してみる。',mobile:'60% 50%',choices:[['教室に戻って、午後を過ごす','after']]},
    after:{image:'window-near',phase:5,label:'放課後 ｜ まだ帰りたくない',title:'もう少しだけ、\nここにいよう。',note:'窓の外を眺めて、ひと息。',mobile:'53% 50%',choices:[['となりの景色を見てみる','windowTalk']]},
    windowTalk:{image:'window-talk',phase:5,label:'放課後 ｜ 窓辺で',title:'同じ景色を、\nとなりで眺める。',note:'なんでもない話が、続いていく。',mobile:'53% 50%',choices:[['やってみたいことを話す','ideas']]},
    ideas:{image:'ideas',phase:5,label:'放課後 ｜ アイデアの時間',title:'「やってみたい」を、\nここから。',note:'浮かんだことを、黒板に。',mobile:'58% 50%',choices:[['夏の放課後にも寄り道','summerWindow'],['帰り道へ','sunset']]},
    summerWindow:{image:'summer-window',phase:5,label:'夏の放課後 ｜ 窓辺',title:'季節が変わっても、\n好きな場所。',note:'夏の光の中で、ひと息。',mobile:'33% 50%',choices:[['みんなの席へ','summerFriends']]},
    summerFriends:{image:'summer-friends',phase:5,label:'夏の放課後 ｜ 友人と',title:'何気ない時間が、\n思い出になる。',note:'あと少しだけ、話していこう。',mobile:'40% 50%',choices:[['黒板の前へ','summerIdeas']]},
    summerIdeas:{image:'summer-ideas',phase:5,label:'夏の放課後 ｜ 黒板の前で',title:'思いついたことを、\n一緒に書いてみる。',note:'ここから、何がはじまるだろう。',mobile:'55% 50%',choices:[['今日の帰り道へ','sunset']]},
    sunset:{image:'sunset',phase:6,label:'帰り道 ｜ 今日の終わり',title:'朝の階段が、\n少し違って見えた。',note:'「また明日。」',mobile:'55% 50%',choices:[['今日を振り返る','end']]},
    end:{image:'sunset',phase:6,label:'あなたの、梅光の一日',title:'ありのままで、\n本気の青春。',note:'次は、この景色の中で。',mobile:'55% 50%',choices:[]}
  };
  const cache=new Map();
  function loadPhoto(name){
    if(cache.has(name))return cache.get(name);
    const promise=new Promise((resolve,reject)=>{
      const img=new Image(); let timer=setTimeout(()=>reject(new Error('画像の読み込みに時間がかかっています。')),12000);
      img.onload=async()=>{try{await img.decode();}catch{} clearTimeout(timer);resolve(img);};
      img.onerror=()=>{clearTimeout(timer);reject(new Error('写真を読み込めませんでした。'));};
      img.src='assets/'+name+'.webp';
    }).catch(error=>{cache.delete(name);throw error;});
    cache.set(name,promise);return promise;
  }
  const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  function setText(text){title.replaceChildren(...text.split('\n').flatMap((line,i)=>i?[document.createElement('br'),document.createTextNode(line)]:[document.createTextNode(line)]));}
  function updateMotion(){root.dataset.motion=motionOff?'off':'on';document.querySelector('#motion-toggle').setAttribute('aria-pressed',String(motionOff));document.querySelector('#motion-label').textContent=motionOff?'OFF':'ON';}
  document.querySelector('#motion-toggle').addEventListener('click',()=>{if(reduced.matches){announce('端末の設定に合わせ、動きを抑えています。');return;}motionOff=!motionOff;updateMotion();resetCamera();});
  reduced.addEventListener('change',event=>{motionOff=event.matches;updateMotion();});updateMotion();
  function controls(disabled){document.querySelectorAll('#scene-actions button,#view-options button,#scene-hotspots button,#route-dialog [data-route]').forEach(b=>b.disabled=disabled);back.disabled=disabled||!history.length;restart.disabled=disabled||current==='start';stage.setAttribute('aria-busy',String(disabled));}
  function renderScene(scene,focus=true){
    stage.dataset.scene=current; resetCamera(); renderHotspots(scene); document.querySelector('#place-name').textContent=(current==='start'?'一日のはじまり':scene.label.split('｜').pop().trim());
    setText(scene.title);label.textContent=scene.label;note.textContent=current==='end'&&selectedMood?(selectedMood==='friends'?'みんなと笑った時間を、また。':'自分のペースで過ごす時間を、また。'):scene.note;
    document.querySelector('#interaction-hint').textContent=current==='start'?'ボタンを押して、あなたの一日を進めてください。':current==='views'?'写真を選ぶと、眺める方向が変わります。':'';
    actions.replaceChildren();
    for(const [text,next] of scene.choices){const button=document.createElement('button');button.type='button';button.dataset.next=next;button.append(document.createTextNode(text));const arrow=document.createElement('span');arrow.textContent='→';arrow.setAttribute('aria-hidden','true');button.append(arrow);actions.append(button);}
    if(current==='end'){
      for(const [text,url] of [['本当の梅光を見に行く ↗','https://www.baiko.ac.jp/highschool/openschool/'],['学校をもっと知る ↗','https://www.baiko.ac.jp/highschool/']]){const a=document.createElement('a');a.textContent=text;a.href=url;a.target='_blank';a.rel='noopener noreferrer';actions.append(a);}
    }
    viewOptions.hidden=current!=='views';
    document.querySelectorAll('[data-phase]').forEach(li=>{const phase=Number(li.dataset.phase);li.classList.toggle('is-past',phase<scene.phase);if(phase===scene.phase)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
    document.querySelector('#scene-announcement').textContent=scene.label+'。'+scene.title.replace('\n','');
    if(focus&&!stage.classList.contains('is-cinema'))title.focus({preventScroll:true});
  }
  async function transition(next,{backward=false,reset=false,view=null}={}){
    if(busy||!scenes[next])return;busy=true;controls(true);
    let scene={...scenes[next]};
    if(next==='views'){const chosen=views[view===null?viewIndex:view];scene.image=chosen.image;scene.note=chosen.note;scene.focus=chosen.focus;scene.mobile=chosen.focus;}
    const loading=document.querySelector('#loading-message');const loadTimer=setTimeout(()=>loading.textContent='次の景色を準備しています…',550);
    try{
      await loadPhoto(scene.image);clearTimeout(loadTimer);loading.textContent='';
      const outgoing=planes[activePlane];
      const destination=planes[1-activePlane], image=destination.querySelector('img');
      destination.style.transition='none';destination.style.opacity='0';
      destination.style.zIndex='2';outgoing.style.zIndex='1';
      image.src='assets/'+scene.image+'.webp';await image.decode();
      destination.style.setProperty('--focus',scene.focus||'50% 50%');destination.style.setProperty('--mobile-focus',scene.mobile||'50% 50%');
      stage.classList.add('is-changing');await delay(motionOff?0:220);
      // Both decoded photographs stay mounted throughout the dissolve.
      destination.style.transition='';destination.classList.add('is-active');destination.style.opacity='1';activePlane=1-activePlane;
      if(reset){history=[];selectedMood=null;viewIndex=0;}else if(backward){history.pop();}else if(next!==current){history.push(current);}
      current=next;if(next==='friends'||next==='quiet')selectedMood=next;if(next==='break')selectedMood=null;
      if(view!==null)viewIndex=view;
      renderScene(scene);document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.view)===viewIndex)));
      await delay(motionOff?0:420);stage.classList.remove('is-changing');
      await delay(motionOff?0:850);
      outgoing.style.transition='none';outgoing.style.opacity='0';outgoing.classList.remove('is-active');
      for(const [,target]of scene.choices)loadPhoto(scenes[target].image).catch(()=>{});
      if(next==='views')views.forEach(v=>loadPhoto(v.image).catch(()=>{}));
    }catch(error){announce(error.message||'次の写真を読み込めませんでした。もう一度お試しください。');stage.classList.remove('is-changing');}
    finally{clearTimeout(loadTimer);loading.textContent='';busy=false;controls(false);}
  }
  actions.addEventListener('click',event=>{const button=event.target.closest('[data-next]');if(button)transition(button.dataset.next);});
  back.addEventListener('click',()=>{if(history.length)transition(history[history.length-1],{backward:true});});
  restart.addEventListener('click',()=>transition('start',{reset:true}));
  views.forEach((view,i)=>{const b=document.createElement('button');b.className='view-button';b.type='button';b.dataset.view=String(i);b.setAttribute('aria-label',view.name+'の景色を見る');b.setAttribute('aria-pressed',String(i===0));const img=document.createElement('img');img.src='assets/'+view.image+'.webp';img.alt='';const span=document.createElement('span');span.textContent=view.name;b.append(img,span);b.addEventListener('click',()=>{if(i!==viewIndex)transition('views',{view:i});});viewOptions.append(b);});
  const about=document.querySelector('#about-dialog');document.querySelector('#about-button').addEventListener('click',()=>about.showModal());document.querySelector('#about-close').addEventListener('click',()=>about.close());

  const hotspotLayer=document.querySelector('#scene-hotspots');
  const routeDialog=document.querySelector('#route-dialog');
  let cameraX=0,cameraY=0,cameraZoom=1.08,dragState=null,landscapeOnly=false;
  function cameraGeometry(plane){
    const img=plane.querySelector('img'),w=stage.clientWidth,h=stage.clientHeight;
    const cover=Math.max(w/(img.naturalWidth||w),h/(img.naturalHeight||h));
    const width=(img.naturalWidth||w)*cover,height=(img.naturalHeight||h)*cover;
    const focus=(plane.style.getPropertyValue(w<=700?'--mobile-focus':'--focus')||'50% 50%').trim().split(/\s+/).map(v=>parseFloat(v)/100);
    const left=(w-width)*focus[0],top=(h-height)*(focus[1]??.5);
    return {img,width,height,left,top,minX:w-left-width-(cameraZoom-1)*width/2,maxX:-left+(cameraZoom-1)*width/2,minY:h-top-height-(cameraZoom-1)*height/2,maxY:-top+(cameraZoom-1)*height/2};
  }
  function applyCamera(){
    const bounds=cameraGeometry(planes[activePlane]);
    cameraX=Math.max(bounds.minX,Math.min(bounds.maxX,cameraX));cameraY=Math.max(bounds.minY,Math.min(bounds.maxY,cameraY));
    for(const plane of planes){const g=cameraGeometry(plane);g.img.style.width=g.width+'px';g.img.style.height=g.height+'px';g.img.style.left=g.left+'px';g.img.style.top=g.top+'px';}
    stage.style.setProperty('--camera-x',cameraX+'px');stage.style.setProperty('--camera-y',cameraY+'px');stage.style.setProperty('--camera-zoom',String(cameraZoom));
  }
  function resetCamera(){cameraX=0;cameraY=0;cameraZoom=motionOff?1:1.08;applyCamera();}
  function renderHotspots(scene){
    hotspotLayer.replaceChildren();
    hotspotLayer.dataset.count=String(scene.choices.length);
    scene.choices.forEach(([text,next],i)=>{
      const b=document.createElement('button');b.type='button';b.className='scene-hotspot';b.dataset.next=next;
      b.style.setProperty('--pin-x',(scene.choices.length>1?(i===0?47:75):68)+'%');b.style.setProperty('--pin-y',(scene.choices.length>1?(i===0?31:42):34)+'%');
      b.setAttribute('aria-label',text+'。この場所へ移動');
      const marker=document.createElement('span');marker.className='pin-marker';marker.setAttribute('aria-hidden','true');marker.textContent='+';
      const caption=document.createElement('span');caption.className='pin-label';caption.textContent=text;
      b.append(marker,caption);hotspotLayer.append(b);
    });
    document.querySelector('#place-count').textContent=String(Object.keys(scenes).indexOf(current)+1).padStart(2,'0')+' / '+Object.keys(scenes).length;
  }
  hotspotLayer.addEventListener('click',event=>{const b=event.target.closest('[data-next]');if(b)transition(b.dataset.next);});
  function setLandscape(on){landscapeOnly=on;stage.classList.toggle('landscape-only',on);const b=document.querySelector('#landscape-toggle');b.setAttribute('aria-pressed',String(on));b.textContent=on?'案内を戻す':'景色だけ';}
  document.querySelector('#landscape-toggle').addEventListener('click',()=>setLandscape(!landscapeOnly));
  document.querySelector('#zoom-in').addEventListener('click',()=>{cameraZoom=Math.min(1.6,cameraZoom+.12);applyCamera();});
  document.querySelector('#zoom-out').addEventListener('click',()=>{cameraZoom=Math.max(motionOff?1:1.08,cameraZoom-.12);cameraX=0;cameraY=0;applyCamera();});
  document.querySelector('#view-reset').addEventListener('click',resetCamera);
  window.addEventListener('resize',resetCamera);
  const surface=document.querySelector('#look-surface');
  surface.addEventListener('pointerdown',event=>{if(busy)return;dragState={x:event.clientX,y:event.clientY,originX:cameraX,originY:cameraY};surface.setPointerCapture(event.pointerId);stage.classList.add('is-looking');});
  surface.addEventListener('pointermove',event=>{if(!dragState)return;cameraX=dragState.originX+event.clientX-dragState.x;cameraY=dragState.originY+event.clientY-dragState.y;applyCamera();});
  planes.forEach(plane=>plane.querySelector('img').addEventListener('load',applyCamera));
  function stopLooking(){dragState=null;stage.classList.remove('is-looking');}
  surface.addEventListener('pointerup',stopLooking);surface.addEventListener('pointercancel',stopLooking);
  document.querySelector('#route-toggle').addEventListener('click',()=>{
    const list=document.querySelector('#route-places');list.replaceChildren();
    for(const [key,scene] of Object.entries(scenes)){
      if(['friends','quiet','views','end'].includes(key))continue;
      const b=document.createElement('button');b.type='button';b.dataset.route=key;b.setAttribute('aria-current',key===current?'location':'false');
      const img=document.createElement('img');img.src='assets/'+scene.image+'.webp';img.alt='';const text=document.createElement('span');text.textContent=scene.label.replace('YOUR FIRST DAY IN BAIKO','一日のはじまり');b.append(img,text);list.append(b);
    }
    routeDialog.showModal();
  });
  document.querySelector('#route-close').addEventListener('click',()=>routeDialog.close());
  routeDialog.addEventListener('click',event=>{const b=event.target.closest('[data-route]');if(b&&!busy){routeDialog.close();setLandscape(false);transition(b.dataset.route);}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&landscapeOnly)setLandscape(false);});

  renderScene(scenes.start,false);controls(false);loadPhoto('summer-stairs').catch(()=>{});
  let toastTimer;
  function announce(text) {
    const toast = document.querySelector('#status-message');
    toast.textContent = text;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 5200);
  }

  const soundButton=document.querySelector('#sound-toggle'),soundLabel=document.querySelector('#sound-label');
  const bgm=new Audio('assets/youth-bgm.mp3');
  bgm.loop=true;bgm.preload='auto';bgm.volume=.75;
  let audioIsOn=false,soundEpoch=0;
  function soundUI(){
    soundButton.setAttribute('aria-pressed',String(audioIsOn));
    soundLabel.textContent=audioIsOn?'音 ON':'音 OFF';
  }
  async function setSound(on){
    const epoch=++soundEpoch;
    if(!on){bgm.pause();audioIsOn=false;soundUI();return;}
    soundLabel.textContent='音 読込中';
    try{
      // Call play within the tap handler; iPad routes media through playback audio.
      await bgm.play();
      if(epoch!==soundEpoch)return;
      audioIsOn=!bgm.paused;soundUI();
    }catch(error){
      if(epoch!==soundEpoch)return;
      audioIsOn=false;soundUI();
      announce('音楽を開始できませんでした。「音 OFF」を押すと再試行できます。');
    }
  }
  bgm.addEventListener('pause',()=>{audioIsOn=false;soundUI();});
  bgm.addEventListener('playing',()=>{audioIsOn=true;soundUI();});
  bgm.addEventListener('error',()=>{audioIsOn=false;soundUI();announce('音楽を読み込めませんでした。ページを再読み込みしてください。');});
  soundButton.addEventListener('click',()=>{const next=!audioIsOn;if(movieOn)movieMusicWanted=next;setSound(next);});

  const film=['start','stairs','panorama','door','glass','chapel','corridor','morning','lunch','friends','after','windowTalk','ideas','summerWindow','summerFriends','summerIdeas','sunset','end'];
  const movieLaunch=document.querySelector('#movie-launch'),moviePanel=document.querySelector('#movie-controls'),moviePlay=document.querySelector('#movie-play'),movieSeek=document.querySelector('#movie-seek');
  let movieOn=false,moviePaused=true,movieMusicWanted=true,movieIndex=0,movieTimer=null,movieEpoch=0;
  function movieUI(){
    stage.classList.toggle('movie-paused',moviePaused);moviePlay.textContent=moviePaused?'▶ 再生':'Ⅱ 一時停止';moviePlay.setAttribute('aria-label',moviePaused?'ムービーを再生':'ムービーを一時停止');
    movieSeek.value=String(movieIndex);movieSeek.setAttribute('aria-valuetext',scenes[film[movieIndex]].label);
    document.querySelector('#movie-position').textContent=String(movieIndex+1).padStart(2,'0')+' / '+film.length;
    document.querySelector('#movie-previous').disabled=busy||movieIndex===0;document.querySelector('#movie-next').disabled=busy||movieIndex===film.length-1;
  }
  function queueMovie(){
    clearTimeout(movieTimer);if(!movieOn||moviePaused)return;
    if(movieIndex===film.length-1){moviePaused=true;movieUI();setSound(false);return;}
    movieTimer=setTimeout(()=>movieGo(movieIndex+1),6200);
  }
  async function movieGo(index){
    if(!movieOn||busy){movieUI();return;}clearTimeout(movieTimer);const epoch=movieEpoch;
    document.querySelector('#movie-previous').disabled=true;document.querySelector('#movie-next').disabled=true;
    movieIndex=Math.max(0,Math.min(film.length-1,index));
    if(current!==film[movieIndex])await transition(film[movieIndex],{reset:movieIndex===0});
    if(!movieOn||epoch!==movieEpoch)return;
    if(current!==film[movieIndex]){moviePaused=true;setSound(false);}
    movieUI();queueMovie();
  }
  async function startMovie(){
    if(busy){announce('場面が変わったら、もう一度再生してください。');return;}
    movieOn=true;moviePaused=false;movieMusicWanted=true;movieEpoch++;movieIndex=0;setLandscape(false);stage.classList.add('is-cinema');moviePanel.hidden=false;movieLaunch.hidden=true;
    // Resume audio directly from this user gesture for Safari on iPad.
    bgm.currentTime=0;const music=setSound(true);await movieGo(0);await music;movieUI();moviePlay.focus({preventScroll:true});
  }
  function pauseMovie(){moviePaused=true;clearTimeout(movieTimer);movieUI();setSound(false);}
  function exitMovie(){movieOn=false;movieEpoch++;clearTimeout(movieTimer);moviePaused=true;stage.classList.remove('is-cinema','movie-paused');moviePanel.hidden=true;movieLaunch.hidden=false;setSound(false);movieLaunch.focus({preventScroll:true});}
  movieLaunch.addEventListener('click',startMovie);
  moviePlay.addEventListener('click',async()=>{if(!moviePaused){pauseMovie();return;}moviePaused=false;const music=setSound(movieMusicWanted);if(movieIndex===film.length-1)await movieGo(0);else{movieUI();queueMovie();}await music;});
  document.querySelector('#movie-exit').addEventListener('click',exitMovie);
  document.querySelector('#movie-previous').addEventListener('click',()=>movieGo(movieIndex-1));
  document.querySelector('#movie-next').addEventListener('click',()=>movieGo(movieIndex+1));
  movieSeek.max=String(film.length-1);movieSeek.addEventListener('change',()=>movieGo(Number(movieSeek.value)));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&movieOn)exitMovie();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(movieOn)pauseMovie();else if(audioIsOn)setSound(false);}});
})();
