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
    stairs:{image:'summer-stairs',phase:1,label:'朝 ｜ 登校',title:'空へ向かって、\n一段ずつ。',note:'いつもの朝が、少し楽しみになる。',mobile:'48% 50%',choices:[['途中で、空を見上げる','sky']]},
    sky:{image:'sunny-stairs',phase:1,label:'朝 ｜ 階段の途中',title:'見上げると、\n空が近い。',note:'風が抜けていく。少しだけ、深呼吸。',focus:'48% 50%',mobile:'48% 50%',choices:[['のぼりきって、校舎へ','door']]},
    door:{image:'summer-building',phase:1,label:'朝 ｜ 校舎の入口',title:'この校舎が、\n今日の居場所。',note:'さあ、中へ。',mobile:'60% 50%',choices:[['校舎に入る','glass']]},
    glass:{image:'stained-glass',phase:1,label:'朝 ｜ 光に誘われて',title:'光にも、\nいろんな色がある。',note:'好きな色を、見つけてみる。',focus:'50% 50%',mobile:'76% 50%',choices:[['チャペルを見渡す','chapel']]},
    chapel:{image:'chapel-wide',phase:1,label:'朝 ｜ チャペル',title:'光が落ちる、\n静かな場所。',note:'ゆっくり、見渡してみる。',mobile:'42% 50%',choices:[['教室へ','morning']]},
    morning:{image:'window',phase:2,label:'午前 ｜ 窓辺の席',title:'窓の向こうに、\nいつもの街。',note:'ノートを開く。一日が動き出す。',mobile:'50% 50%',choices:[['午前を過ごして、お昼へ','lunch']]},
    lunch:{image:'classroom',phase:3,label:'昼 ｜ お弁当の時間',title:'お腹、すいた。\nいつもの席に座ろう。',note:'ふたを開ける。お弁当の香り。',mobile:'42% 50%',choices:[['お昼を食べて、ひと休み','break']]},
    break:{image:'high-view',phase:4,label:'休み時間 ｜ いまの気分は？',title:'少し、時間がある。\nどこで過ごそう。',note:'にぎやかな時間も、静かな時間も。',mobile:'58% 50%',choices:[['みんなのところへ','friends'],['窓辺でひと息','quiet']]},
    friends:{image:'friends',phase:4,label:'休み時間 ｜ 友人と',title:'なんでもない話で、\nこんなに笑う。',note:'もう少し、ここにいたい。',mobile:'52% 50%',choices:[['ちょっと景色も見に行く','views'],['午後を過ごして、放課後へ','after']]},
    quiet:{image:'window',phase:4,label:'休み時間 ｜ 自分のペースで',title:'何もしない時間も、\n悪くない。',note:'窓の向こうを眺めて、深呼吸。',mobile:'50% 50%',choices:[['ほかの角度からも眺める','views'],['午後を過ごして、放課後へ','after']]},
    views:{image:'sea-view',phase:4,label:'寄り道 ｜ 好きな景色を探す',title:'顔を上げると、\nこんな景色。',note:'遠くまで、見渡してみる。',mobile:'60% 50%',choices:[['教室に戻って、午後を過ごす','after']]},
    after:{image:'window-near',phase:5,label:'放課後 ｜ まだ帰りたくない',title:'もう少しだけ、\nここにいよう。',note:'窓の外を眺めて、ひと息。',mobile:'53% 50%',choices:[['やってみたいことを話す','ideas']]},
    ideas:{image:'ideas',phase:5,label:'放課後 ｜ アイデアの時間',title:'「やってみたい」を、\nここから。',note:'浮かんだことを、黒板に。',mobile:'58% 50%',choices:[['帰り道へ','sunset']]},
    sunset:{image:'sunset',phase:6,label:'帰り道 ｜ 今日の終わり',title:'朝の階段が、\n少し違って見えた。',note:'「また明日。」',mobile:'55% 50%',choices:[['今日を振り返る','end']]},
    end:{image:'sunset',phase:6,label:'あなたの、梅光の一日',title:'ありのままで、\n本気の青春。',note:'次は、この景色の中で。',mobile:'55% 50%',choices:[['オンライン説明会をのぞく','online']]},
    online:{image:'summer-building',phase:6,label:'つぎの一歩 ｜ オンライン説明会',title:'まずは画面越しに、\n梅光をのぞいてみる。',event:'online',mobile:'60% 50%',choices:[['その次は、本物の景色へ','visit']]},
    visit:{image:'summer-stairs',phase:6,label:'つぎの一歩 ｜ 入試説明会（来校）',title:'写真で見た階段を、\n自分の足で。',event:'visit',mobile:'48% 50%',choices:[['来校したあと、家族と振り返る','recap']]},
    recap:{image:'high-view',phase:6,label:'来校のあとで ｜ 家族と振り返る',title:'見てきた景色を、\nもう一度いっしょに。',note:'「ここ、どうだった？」と話してみる。',mobile:'58% 50%',choices:[],tools:[['場所の写真で振り返る','places'],['このページを家族に送る','share']]}
  };

  scenes.start.title='もし、梅光を\n選んだら。';
  scenes.start.note='今日は、梅光生の気分で。';
  scenes.start.choices=[['梅光の日常へ','stairs'],['オンライン説明会の案内','online']];
  scenes.stairs.choices=[['校舎へ向かう','door'],['景色に寄り道する','sky']];
  // Phone backdrop: which detail of each photo to enlarge behind the frame ([position, zoom]).
  const backdrops={
    'sea-view':['82% 50%',1.5],'summer-stairs':['45% 78%',1.4],'sunny-stairs':['80% 25%',1.6],'summer-building':['72% 22%',1.5],
    'stained-glass':['66% 42%',1.8],'chapel-wide':['56% 36%',1.7],'window':['24% 48%',1.5],'classroom':['72% 70%',1.6],
    'high-view':['30% 28%',1.5],'friends':['42% 48%',1.4],'window-near':['86% 52%',1.6],'window-talk':['62% 66%',1.6],
    'ideas':['34% 46%',1.6],'sunset':['46% 30%',1.5],'corridor':['35% 50%',1.5],'building':['60% 40%',1.5]
  };
  const events=window.BAIKO_EVENTS||{};
  const fallbackUrl=events.fallbackUrl||'https://www.baiko.ac.jp/highschool/openschool/';
  const eventNames={online:'オンライン説明会',visit:'入試説明会'};
  function eventNote(key){const e=events[key]||{};return e.date?'日時：'+e.date:'日時・申込方法は未確定です。決まり次第、ここでお知らせします。';}
  function sceneLinks(key){
    if(key==='end')return [['入試説明会を予約する ↗','https://seed.software/public/baiko/322f7735d1']];
    const event=scenes[key].event;if(!event)return [];
    const e=events[event]||{};return [[e.url?eventNames[event]+'に申し込む ↗':'学校サイトで最新の案内を見る ↗',e.url||fallbackUrl]];
  }
  // Online-session perk, received through the official LINE account.
  const perk=window.BAIKO_PERK||{};
  const perkItems=perk.items||[];
  function renderPerk(){
    let card=document.querySelector('#perk-card');
    if(current!=='online'||!perkItems.length){if(card)card.hidden=true;return;}
    if(!card){
      card=document.createElement('div');card.id='perk-card';card.setAttribute('role','group');card.setAttribute('aria-label','オンライン説明会の参加者特典');
      const tag=document.createElement('p');tag.className='perk-tag';tag.textContent='参加者特典 '+perkItems.length+'つ';
      const list=document.createElement('ul');list.className='perk-items';
      for(const item of perkItems){const li=document.createElement('li');const name=document.createElement('b');name.textContent=item.name;const note=document.createElement('span');note.textContent=item.note||'';li.append(name,note);list.append(li);}
      const how=document.createElement('ol');how.className='perk-how';how.setAttribute('aria-label','受け取り方');
      for(const step of perk.how||[]){const li=document.createElement('li');li.textContent=step;how.append(li);}
      // The apply button lives in the card so it never falls below the fold behind the perk.
      const [applyText,applyUrl]=sceneLinks('online')[0];
      const apply=document.createElement('a');apply.className='perk-apply';apply.href=applyUrl;apply.target='_blank';apply.rel='noopener noreferrer';apply.textContent=applyText;
      const a=document.createElement('a');a.className='perk-line';a.href=perk.line;a.target='_blank';a.rel='noopener noreferrer';a.textContent='公式LINEを友だち追加しておく ↗';
      card.append(tag,list,how,apply,a);actions.before(card);
    }
    card.hidden=false;
  }
  const cache=new Map();
  function loadPhoto(name){
    if(cache.has(name))return cache.get(name);
    const promise=new Promise((resolve,reject)=>{
      const img=new Image(); let timer=setTimeout(()=>reject(new Error('画像の読み込みに時間がかかっています。')),12000);
      img.onload=async()=>{await Promise.race([img.decode().catch(()=>{}),delay(1500)]);clearTimeout(timer);resolve(img);};
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
    syncMobileControls();
    setText(scene.title);label.textContent=scene.label;note.textContent=current==='end'&&selectedMood?(selectedMood==='friends'?'みんなと笑った時間を、また。':'自分のペースで過ごす時間を、また。'):scene.event?eventNote(scene.event):scene.note;
    // Main route only; side trips share the step of the scene they branch from. Ends at the online briefing, the page's purpose.
    const route=['start','stairs','sky','door','glass','chapel','morning','lunch','break','friends','after','ideas','sunset','end','online'],step=route.indexOf({quiet:'friends',views:'friends'}[current]||current);
    document.querySelector('#scene-progress').textContent=step>0&&step<route.length-1?`${step} / ${route.length-1}`:'';
    document.querySelector('#interaction-hint').textContent=current==='start'?'下のボタンを押すと進みます（約2分）。':current==='views'?'写真を選ぶと、眺める方向が変わります。':'';
    actions.replaceChildren();
    for(const [text,url] of current==='online'&&perkItems.length?[]:sceneLinks(current)){const a=document.createElement('a');a.textContent=text;a.href=url;a.target='_blank';a.rel='noopener noreferrer';if(scene.event)a.className='is-apply';actions.append(a);}
    // One way forward is not a choice: show it as a single "next" step, and let a tap on the photo advance too.
    const single=scene.choices.length===1&&!scene.event&&current!=='end';stage.dataset.single=String(single);
    for(const [text,next] of scene.choices){const button=document.createElement('button');button.type='button';button.dataset.next=next;if(single)button.className='is-next';button.append(document.createTextNode(text));const arrow=document.createElement('span');arrow.textContent='→';arrow.setAttribute('aria-hidden','true');button.append(arrow);actions.append(button);}
    for(const [text,action] of scene.tools||[]){const button=document.createElement('button');button.type='button';button.dataset.action=action;button.append(document.createTextNode(text));const arrow=document.createElement('span');arrow.textContent='→';arrow.setAttribute('aria-hidden','true');button.append(arrow);actions.append(button);}
    renderPerk();
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
      // decode() can stall in background tabs or reject on some Safari builds; the photo is already loaded, so cap the wait.
      image.src='assets/'+scene.image+'.webp';await Promise.race([image.decode().catch(()=>{}),delay(1500)]);
      destination.style.setProperty('--focus',scene.focus||'50% 50%');destination.style.setProperty('--mobile-focus',scene.mobile||'50% 50%');
      // Phones lay the same photograph behind the framed one, enlarged on a chosen detail.
      const spot=backdrops[scene.image]||['50% 50%',1.4];
      stage.style.setProperty('--backdrop',`url('assets/${scene.image}.webp')`);stage.style.setProperty('--backdrop-pos',spot[0]);stage.style.setProperty('--backdrop-zoom',String(spot[1]));
      stage.classList.add('is-changing');await delay(motionOff?0:220);
      // Both decoded photographs stay mounted throughout the dissolve.
      destination.style.transition='';destination.classList.add('is-active');destination.style.opacity='1';activePlane=1-activePlane;
      if(reset){history=[];selectedMood=null;viewIndex=0;}else if(backward){history.pop();}else if(next!==current){history.push(current);}
      current=next;if(next==='friends'||next==='quiet')selectedMood=next;if(next==='break')selectedMood=null;
      if(view!==null)viewIndex=view;
      renderScene(scene);controls(true);document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.view)===viewIndex)));
      await delay(motionOff?0:420);stage.classList.remove('is-changing');
      await delay(motionOff?0:850);
      outgoing.style.transition='none';outgoing.style.opacity='0';outgoing.classList.remove('is-active');
      for(const [,target]of scene.choices)loadPhoto(scenes[target].image).catch(()=>{});
      if(next==='views')views.forEach(v=>loadPhoto(v.image).catch(()=>{}));
    }catch(error){announce(error.message||'次の写真を読み込めませんでした。もう一度お試しください。');stage.classList.remove('is-changing');}
    finally{clearTimeout(loadTimer);loading.textContent='';busy=false;controls(false);}
  }
  actions.addEventListener('click',event=>{
    const tool=event.target.closest('[data-action]');
    if(tool){if(tool.dataset.action==='places')document.querySelector('#route-toggle').click();else shareRecap();return;}
    const button=event.target.closest('[data-next]');if(!button)return;
    if(movieOn)exitMovie();transition(button.dataset.next);
  });
  async function shareRecap(){
    const url=location.origin+location.pathname+'?recap';
    try{
      if(navigator.share){await navigator.share({title:'今日は、梅光生。',text:'見てきた梅光の景色を、もう一度いっしょに。',url});return;}
      await navigator.clipboard.writeText(url);announce('ページのURLをコピーしました。LINEなどに貼り付けて送れます。');
    }catch(error){if(error&&error.name==='AbortError')return;announce('共有できませんでした。このページのURLを家族に送ってください。');}
  }
  back.addEventListener('click',()=>{if(history.length)transition(history[history.length-1],{backward:true});});
  restart.addEventListener('click',()=>transition('start',{reset:true}));
  views.forEach((view,i)=>{const b=document.createElement('button');b.className='view-button';b.type='button';b.dataset.view=String(i);b.setAttribute('aria-label',view.name+'の景色を見る');b.setAttribute('aria-pressed',String(i===0));const img=document.createElement('img');img.src='assets/'+view.image+'.webp';img.alt='';const span=document.createElement('span');span.textContent=view.name;b.append(img,span);b.addEventListener('click',()=>{if(i!==viewIndex)transition('views',{view:i});});viewOptions.append(b);});
  const about=document.querySelector('#about-dialog');document.querySelector('#about-button').addEventListener('click',()=>about.showModal());document.querySelector('#about-close').addEventListener('click',()=>about.close());

  const mobileQuery=matchMedia('(max-width:700px) and (orientation:portrait)');
  const mobileMenu=document.createElement('dialog');mobileMenu.id='mobile-menu';mobileMenu.setAttribute('aria-labelledby','mobile-menu-title');
  mobileMenu.innerHTML='<div class="route-heading"><h2 id="mobile-menu-title">体験メニュー</h2><button id="mobile-menu-close" type="button">閉じる ×</button></div><p>写真はドラッグや指で動かして見渡せます。</p><div id="mobile-menu-controls"></div>';
  document.body.append(mobileMenu);
  const mobileMenuButton=document.createElement('button');mobileMenuButton.id='mobile-menu-toggle';mobileMenuButton.type='button';mobileMenuButton.textContent='メニュー';mobileMenuButton.setAttribute('aria-haspopup','dialog');document.querySelector('header').append(mobileMenuButton);
  const mobileControls=['route-toggle','landscape-toggle','zoom-in','zoom-out','view-reset','sound-toggle','motion-toggle','restart-button','about-button','movie-launch'].map(id=>{const element=document.getElementById(id),anchor=document.createComment(id+' home');element.before(anchor);return {element,anchor};});
  function syncMobileControls(){
    document.querySelector('.look-hint').textContent=mobileQuery.matches?'写真を指で動かして見渡す':'ドラッグして見回す · ホイールで拡大 · ＋を押して移動';
    // One menu on every screen size; the movie stays on the first screen only.
    // Phones keep the first screen to one message and two buttons, so the movie also lives in the menu there.
    for(const {element,anchor} of mobileControls){const inMenu=element.id!=='movie-launch'||current!=='start'||mobileQuery.matches;if(inMenu)document.querySelector('#mobile-menu-controls').append(element);else anchor.after(element);}
  }
  mobileQuery.addEventListener('change',syncMobileControls);syncMobileControls();
  mobileMenuButton.addEventListener('click',()=>mobileMenu.showModal());
  document.querySelector('#mobile-menu-close').addEventListener('click',()=>mobileMenu.close());
  mobileMenu.addEventListener('click',event=>{if(event.target.closest('#route-toggle,#landscape-toggle,#restart-button,#about-button,#movie-launch'))mobileMenu.close();},true);
  const hotspotLayer=document.querySelector('#scene-hotspots');
  const routeDialog=document.querySelector('#route-dialog');
  let cameraX=0,cameraY=0,cameraZoom=1.08,dragState=null,landscapeOnly=false;
  function cameraGeometry(plane){
    // Measure the photo frame, not the stage: on phones the frame is a slightly zoomed window (about 5:4) on the landscape photo.
    const img=plane.querySelector('img'),w=plane.clientWidth||stage.clientWidth,h=plane.clientHeight||stage.clientHeight;
    const cover=Math.max(w/(img.naturalWidth||w),h/(img.naturalHeight||h));
    const width=(img.naturalWidth||w)*cover,height=(img.naturalHeight||h)*cover;
    const focus=(plane.style.getPropertyValue(mobileQuery.matches?'--mobile-focus':'--focus')||'50% 50%').trim().split(/\s+/).map(v=>parseFloat(v)/100);
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
  // Phones show the whole photo, so a tap moves the day forward instead of panning.
  surface.addEventListener('click',()=>{if(!mobileQuery.matches||busy||stage.dataset.single!=='true')return;const next=actions.querySelector('[data-next]');if(next)next.click();});
  surface.addEventListener('pointerdown',event=>{if(busy||mobileQuery.matches)return;dragState={x:event.clientX,y:event.clientY,originX:cameraX,originY:cameraY};surface.setPointerCapture(event.pointerId);stage.classList.add('is-looking');});
  surface.addEventListener('pointermove',event=>{if(!dragState)return;cameraX=dragState.originX+event.clientX-dragState.x;cameraY=dragState.originY+event.clientY-dragState.y;applyCamera();});
  planes.forEach(plane=>plane.querySelector('img').addEventListener('load',applyCamera));
  function stopLooking(){dragState=null;stage.classList.remove('is-looking');}
  surface.addEventListener('pointerup',stopLooking);surface.addEventListener('pointercancel',stopLooking);
  surface.addEventListener('wheel',event=>{event.preventDefault();const min=motionOff?1:1.08;cameraZoom=Math.max(min,Math.min(1.6,cameraZoom-Math.sign(event.deltaY)*.08));applyCamera();},{passive:false});
  document.querySelector('#route-toggle').addEventListener('click',()=>{
    const recap=current==='recap';
    document.querySelector('#route-title').textContent=recap?'どの場所が、心に残った？':'今日は、どこへ。';
    routeDialog.querySelector('p').textContent=recap?'写真を開いて、家族と話してみてください。':'一日の気になる場所へ。';
    const list=document.querySelector('#route-places');list.replaceChildren();
    for(const [key,scene] of Object.entries(scenes)){
      if(['friends','quiet','views','end','online','visit','recap'].includes(key))continue;
      const b=document.createElement('button');b.type='button';b.dataset.route=key;b.setAttribute('aria-current',key===current?'location':'false');
      const img=document.createElement('img');img.src='assets/'+scene.image+'.webp';img.alt='';const text=document.createElement('span');text.textContent=scene.label.replace('YOUR FIRST DAY IN BAIKO','一日のはじまり');b.append(img,text);list.append(b);
    }
    routeDialog.showModal();
  });
  document.querySelector('#route-close').addEventListener('click',()=>routeDialog.close());
  routeDialog.addEventListener('click',event=>{const b=event.target.closest('[data-route]');if(b&&!busy){routeDialog.close();setLandscape(false);transition(b.dataset.route);}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&landscapeOnly)setLandscape(false);});

  renderScene(scenes.start,false);controls(false);loadPhoto('summer-stairs').catch(()=>{});
  // QR for families after the campus visit: ?recap opens the look-back scene.
  if(new URLSearchParams(location.search).has('recap'))transition('recap');
  let toastTimer;
  function announce(text) {
    const toast = document.querySelector('#status-message');
    toast.textContent = text;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 5200);
  }

  const soundButton=document.querySelector('#sound-toggle'),soundLabel=document.querySelector('#sound-label');
  const bgm=new Audio(window.BAIKO_BGM||'assets/youth-bgm.mp3');
  bgm.loop=true;bgm.preload='auto';bgm.volume=.75;
  let audioIsOn=false,soundEpoch=0,bgmPrimed=false,priming=false,soundPending=false;
  // iPhone only lets a page start audio from a tap. The opening scrolls into the main part without one,
  // so the opening unlocks this element silently during its first tap, and a blocked start retries on the next tap.
  window.BAIKO_PRIME_BGM=()=>{
    if(bgmPrimed||priming||audioIsOn)return;priming=true;bgm.muted=true;
    bgm.play().then(()=>{if(priming){bgm.pause();bgm.currentTime=0;}bgmPrimed=true;}).catch(()=>{}).finally(()=>{priming=false;bgm.muted=false;});
  };
  function retrySound(event){if(soundPending&&!soundButton.contains(event.target)){soundPending=false;setSound(true);}}
  ['pointerdown','touchend','keydown'].forEach(e=>document.addEventListener(e,retrySound,true));
  function soundUI(){
    soundButton.setAttribute('aria-pressed',String(audioIsOn));
    soundLabel.textContent=audioIsOn?'音 ON':'音 OFF';
  }
  async function setSound(on){
    const epoch=++soundEpoch;
    soundPending=false;
    if(!on){bgm.pause();audioIsOn=false;soundUI();return;}
    if(priming){priming=false;bgm.muted=false;}
    soundLabel.textContent='音 読込中';
    try{
      // Call play within the tap handler; iPad routes media through playback audio.
      await bgm.play();
      if(epoch!==soundEpoch)return;
      audioIsOn=!bgm.paused;soundUI();
    }catch(error){
      if(epoch!==soundEpoch)return;
      audioIsOn=false;soundUI();soundPending=true;
      announce('画面をタップすると、音楽が流れます。');
    }
  }
  bgm.addEventListener('pause',()=>{if(priming)return;audioIsOn=false;soundUI();});
  bgm.addEventListener('playing',()=>{if(priming)return;audioIsOn=true;soundUI();});
  bgm.addEventListener('error',()=>{audioIsOn=false;soundUI();announce('音楽を読み込めませんでした。ページを再読み込みしてください。');});
  soundButton.addEventListener('click',()=>{const next=!audioIsOn;if(movieOn)movieMusicWanted=next;setSound(next);});

  const film=['start','stairs','door','glass','chapel','morning','lunch','friends','ideas','sunset','end'];
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
  const onlineShortcut=document.querySelector('#online-shortcut');
  if(perkItems.length&&!onlineShortcut.querySelector('.cta-perk')){const badge=document.createElement('span');badge.className='cta-perk';badge.textContent='特典動画つき';onlineShortcut.prepend(badge);}
  let onlineJump=false;
  onlineShortcut.addEventListener('click',async()=>{
    if(onlineJump)return;
    onlineJump=true;onlineShortcut.disabled=true;
    try{
      document.dispatchEvent(new Event('baiko:open-online'));
      if(movieOn)exitMovie();
      setLandscape(false);
      document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());
      while(busy)await new Promise(resolve=>setTimeout(resolve,50));
      if(current!=='online')await transition('online');
      title.focus({preventScroll:true});
    }finally{onlineJump=false;onlineShortcut.disabled=false;}
  });
})();
