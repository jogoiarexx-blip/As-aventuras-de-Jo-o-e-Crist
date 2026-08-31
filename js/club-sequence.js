/* João & Crist v0.9.5 — fase especial "Noite na Boate"
   Integração leve: dança/cutscenes próprias + combate reaproveitando players/enemies/EnemyFactory.
   v0.9.5d: João usa dança exclusiva, background dedicado e dois NPCs dançando na boate. */
(()=>{
'use strict';
const W=1000,H=650,LANES=['left','up','down','right'],GLYPH={left:'←',up:'↑',down:'↓',right:'→'};
const DUELS=[
 {name:'DJ NEON', bpm:92, speed:185, notes:30, threshold:0.64},
 {name:'FÊNIX', bpm:116, speed:225, notes:45, threshold:0.68},
 {name:'REI DA PISTA', bpm:138, speed:270, notes:64, threshold:0.72}
];
const JOAO_DANCE_SHEET='assets/bonus/boate/players/joao/dance-sheet-transparent.png';
const CRIST_DANCE_SHEET='assets/bonus/boate/players/crist/dance-sheet-transparent.png';
const CLUB_BG='assets/bonus/boate/backgrounds/noite-na-boate.png';
const NPC_MUSCULAR=Array.from({length:5},(_,i)=>`assets/bonus/boate/npcs/muscular/dance-${i+1}.webp`);
const NPC_NEON=Array.from({length:6},(_,i)=>`assets/bonus/boate/npcs/neon/dance-${i+1}.webp`);
const CROWD_SHEETS={
  casual:{path:'assets/bonus/boate/npcs/crowd/crowd-girl-casual.png',frames:[[27,21,117,220],[178,21,108,222],[336,23,115,219],[473,23,117,219],[618,23,113,217],[759,23,119,219],[910,23,107,220],[1054,22,131,220],[26,269,114,208],[164,270,110,207],[310,270,108,207],[456,268,112,209],[606,269,101,207],[737,270,151,205],[896,269,112,208],[1038,269,119,208]]},
  guy:{path:'assets/bonus/boate/npcs/crowd/crowd-guy-black.png',frames:[[27,28,112,208],[176,28,120,208],[331,28,121,209],[482,28,143,208],[658,28,171,208],[865,28,189,209],[24,265,123,197],[184,265,138,196],[358,266,124,196],[523,265,127,196],[693,266,108,195],[853,266,126,195],[23,485,116,184],[164,488,135,181],[327,485,143,184],[522,486,120,183]]},
  pink:{path:'assets/bonus/boate/npcs/crowd/crowd-girl-pink.png',frames:[[29,25,103,206],[144,25,98,205],[253,25,98,205],[371,26,92,204],[484,28,98,202],[875,25,110,206],[997,27,106,204],[25,274,102,198],[148,273,146,199],[303,273,135,199],[457,271,102,201],[592,269,110,202],[731,274,98,198],[857,270,105,202],[990,274,131,198]]}
};
const JOAO_DANCE_FRAMES={
  dance_idle:[[16,38,114,192],[140,38,116,192],[263,38,118,192],[384,38,124,192]],
  dance_left:[[560,36,120,196],[657,36,120,196],[756,36,124,196]],
  dance_right:[[1005,34,122,196],[1105,34,120,196],[1210,34,112,196],[1312,34,114,196]],
  dance_up:[[20,281,126,203],[155,281,127,203],[286,281,130,203],[418,281,133,203]],
  dance_down:[[620,289,118,194],[724,289,112,194],[822,289,108,194],[998,289,145,194]],
  dance_combo:[[22,505,166,231],[190,505,244,226],[424,505,196,226],[664,501,194,238],[861,501,280,244],[1128,506,285,224]],
  dance_win:[[18,745,158,260],[161,745,181,260],[338,745,167,260],[500,745,162,260]],
  dance_lose:[[676,745,154,260],[822,745,153,260],[968,745,199,260],[1175,745,255,260]]
};
const CRIST_DANCE_FRAMES={
  dance_idle:[[47,75,92,184],[209,75,99,184],[370,75,105,184],[1096,72,110,187]],
  dance_left:[[33,502,98,162],[173,501,92,166],[302,506,100,161],[452,506,97,161]],
  dance_right:[[572,507,112,159],[714,506,126,160],[861,507,112,159],[986,511,111,156]],
  dance_up:[[513,68,133,191],[551,297,107,167],[855,293,113,171]],
  dance_down:[[47,293,119,172],[208,293,111,171],[373,293,120,171],[709,293,101,171]],
  dance_combo:[[40,854,152,146],[228,855,142,146],[419,859,133,142],[588,853,164,146],[817,854,139,146]],
  dance_win:[[44,1027,102,155],[382,1031,175,151],[846,1037,110,145],[1057,1034,141,148]],
  dance_lose:[[39,693,108,124],[216,699,142,122],[414,699,144,122],[603,703,140,118],[1024,700,117,118]]
};
function log(msg){ if(window.DEV) window.GameDebugConsole?.log?.(msg); }
function alive(arr){return (arr||[]).filter(e=>e && !e.dead && (e.life==null||e.life>0));}
class ClubSequence{
 constructor(){
  this.active=false;this.mode='idle';this.duel=0;this.notes=[];this.score=0;this.combo=0;this.maxCombo=0;this.hype=50;this.perfectChain=0;this.bestPerfectChain=0;this.misses=0;this.spawnAt=0;this.startedAt=0;this.last=0;this.result=null;this.dialogIndex=0;this.wave=0;this.waveSpawned=false;this.bossSpawned=false;this.touch={};this.listeners=[];this.returnLevel=null;this.returnIndex=5;this.playerChoice=0;this.choiceConfirmed=false;this.padPrev=[false,false,false,false,false];
  this.joaoDanceSheet=window.assetManager?.image?.(JOAO_DANCE_SHEET,'bonus:club',{defer:true})||null;
  this.cristDanceSheet=window.assetManager?.image?.(CRIST_DANCE_SHEET,'bonus:club',{defer:true})||null;
  this.clubBg=window.assetManager?.image?.(CLUB_BG,'bonus:club',{defer:true})||null;
  this.npcMuscular=NPC_MUSCULAR.map(src=>window.assetManager?.image?.(src,'bonus:club',{defer:true})).filter(Boolean);
  this.npcNeon=NPC_NEON.map(src=>window.assetManager?.image?.(src,'bonus:club',{defer:true})).filter(Boolean);
  this.crowdSheets=Object.fromEntries(Object.entries(CROWD_SHEETS).map(([key,data])=>[key,window.assetManager?.image?.(data.path,'bonus:club',{defer:true})||null]));
  this.joaoDanceCanvas=null; this.joaoDancePrepared=false;
  this.currentDanceState='dance_idle';this.stateUntil=0;this.feedbackText='';this.feedbackUntil=0;this.lastInputLane='down';
 }
 ensureAssets(){
  if(!this.joaoDanceSheet) this.joaoDanceSheet=window.assetManager?.image?.(JOAO_DANCE_SHEET,'bonus:club',{defer:true})||null;
  if(!this.cristDanceSheet) this.cristDanceSheet=window.assetManager?.image?.(CRIST_DANCE_SHEET,'bonus:club',{defer:true})||null;
  if(!this.clubBg) this.clubBg=window.assetManager?.image?.(CLUB_BG,'bonus:club',{defer:true})||null;
  window.assetManager?.loadImage?.(JOAO_DANCE_SHEET,'bonus:club').then(()=>this.prepareJoaoDanceSheet()).catch(()=>{});
  window.assetManager?.loadImage?.(CRIST_DANCE_SHEET,'bonus:club').catch(()=>{});
  window.assetManager?.loadImage?.(CLUB_BG,'bonus:club').catch(()=>{});
  NPC_MUSCULAR.forEach(src=>window.assetManager?.loadImage?.(src,'bonus:club').catch(()=>{}));
  NPC_NEON.forEach(src=>window.assetManager?.loadImage?.(src,'bonus:club').catch(()=>{}));
  Object.entries(CROWD_SHEETS).forEach(([key,data])=>{
    if(!this.crowdSheets[key]) this.crowdSheets[key]=window.assetManager?.image?.(data.path,'bonus:club',{defer:true})||null;
    window.assetManager?.loadImage?.(data.path,'bonus:club').catch(()=>{});
  });
 }
 prepareJoaoDanceSheet(){
  // O sprite transparente já é preparado como asset. Não lemos pixels do canvas em runtime:
  // getImageData() em file:// marca o canvas como tainted e derrubava o bônus da boate.
  if(this.joaoDancePrepared||!this.joaoDanceSheet||!this.joaoDanceSheet.complete||!this.joaoDanceSheet.naturalWidth) return;
  this.joaoDanceCanvas=null;
  this.joaoDancePrepared=true;
 }
 start(options={}){
  this.dispose(false);this.standalone=!!options.standalone;this.returnTo=options.returnTo||'stage_select';this.ensurePlayers();this.ensureAssets();this.active=true;this.mode='arrival';this.startedAt=performance.now();this.last=this.startedAt;this.dialogIndex=0;this.wave=0;this.choiceConfirmed=false;
  this.currentDanceState='dance_idle';this.stateUntil=0;this.feedbackText='';this.feedbackUntil=0;
  this.activeDancer='joao';
  this.returnLevel=window.currentLevel; this.returnIndex=5;
  this.bind(); window.soundSystem?.initAudioContext?.(); window.soundSystem?.stopMusic?.(); window.soundSystem?.startMusic?.('vegas');
  log('[CLUB] START');
 }
 ensurePlayers(){const ps=window.players||[];if(ps.length)return;const count=Math.max(1,Math.min(2,Number(window.clubReplayPlayers)||1));const names=count>1?['João','Crist']:['João'];names.forEach((n,i)=>{let p=n==='Crist'?new PlayerCrist(200+i*80,420,i+1):new PlayerJoao(200+i*80,420,i+1);try{p.evolution=new PlayerEvolution(p);p.evolution.load(window.saveSystem?.loadPlayerProgress?.(n));}catch(_){}ps.push(p);});window.clubReplayPlayers=null;}
 bind(){
  const kd=e=>{if(!this.active)return; if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','Enter'].includes(e.key))e.preventDefault(); this.onKey(e.key,true);};
  const ku=e=>{if(this.active)this.onKey(e.key,false);};
  window.addEventListener('keydown',kd,{passive:false});window.addEventListener('keyup',ku);this.listeners.push(()=>window.removeEventListener('keydown',kd),()=>window.removeEventListener('keyup',ku));
  const canvas=document.getElementById('game');
  const pd=e=>{if(!this.active)return;const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;if(this.mode==='dance'&&y>=520&&x>=170&&x<=830){const i=Math.max(0,Math.min(3,Math.floor((x-170)/165)));this.hit(LANES[i]);e.preventDefault();return;}if(['arrival','securityCut','finalCut'].includes(this.mode)){this.advanceDialog(true);e.preventDefault();return;}if(this.mode==='choose'){this.playerChoice=x<500?0:1;if(y>270){this.choiceConfirmed=true;this.startDuel(0);}e.preventDefault();return;}if(this.mode==='result'){this.resolveResult();e.preventDefault();}};
  canvas?.addEventListener('pointerdown',pd,{passive:false});this.listeners.push(()=>canvas?.removeEventListener('pointerdown',pd));
 }
 pollGamepad(){const gp=window.gamepadSystem; if(!gp)return;const dirs=['left','up','down','right'];dirs.forEach((a,i)=>{const v=!!gp.isActionDown?.(1,a),edge=v&&!this.padPrev[i];this.padPrev[i]=v;if(edge&&this.mode==='dance')this.hit(a);});const accept=!!gp.isActionDown?.(1,'attack'),edge=accept&&!this.padPrev[4];this.padPrev[4]=accept;if(edge){if(['arrival','securityCut','finalCut'].includes(this.mode))this.advanceDialog();else if(this.mode==='choose')this.startDuel(0);else if(this.mode==='result')this.resolveResult();}}
 onKey(key,down){if(!down)return; if(this.mode==='arrival'||this.mode==='securityCut'||this.mode==='finalCut'){if(key==='Enter'||key===' '){this.advanceDialog(true);return;}} if(this.mode==='choose'){if(key==='ArrowLeft'||key==='a'||key==='A')this.playerChoice=0;if(key==='ArrowRight'||key==='d'||key==='D')this.playerChoice=1;if(key==='Enter'||key===' '){this.choiceConfirmed=true;this.startDuel(0);}return;} if(this.mode==='dance'){const map={ArrowLeft:'left',a:'left',A:'left',ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowRight:'right',d:'right',D:'right'};if(map[key])this.hit(map[key]);return;} if(this.mode==='result'&&(key==='Enter'||key===' ')){this.resolveResult();}}
 setDanceState(state,duration=520){ this.currentDanceState=state; this.stateUntil=performance.now()+duration; }
 setFeedback(text,duration=540){ this.feedbackText=text; this.feedbackUntil=performance.now()+duration; }
 getDanceState(now){ if(this.mode==='result') return this.result?.win?'dance_win':'dance_lose'; if(this.mode!=='dance') return 'dance_idle'; return now<this.stateUntil ? this.currentDanceState : 'dance_idle'; }
 updateDraw(ctx){if(!this.active)return null; const now=performance.now(),dt=Math.min(.04,(now-this.last)/1000||0);this.last=now;this.pollGamepad();this.prepareJoaoDanceSheet();this.drawClub(ctx,now); if(this.mode==='dance')this.updateDance(ctx,dt,now); else if(this.mode==='arrival'||this.mode==='securityCut'||this.mode==='finalCut')this.drawDialog(ctx); else if(this.mode==='choose')this.drawChoose(ctx); else if(this.mode==='result')this.drawResult(ctx); return this.mode;}
 drawClub(ctx,now){
  const q=window.gameSettings?.data?.graphicsQuality||'medium';
  const bg=this.clubBg;
  if(bg?.complete&&bg.naturalWidth){
    const scale=Math.max(W/bg.naturalWidth,H/bg.naturalHeight); const dw=bg.naturalWidth*scale, dh=bg.naturalHeight*scale;
    const dx=(W-dw)/2, dy=(H-dh)/2;
    ctx.drawImage(bg,dx,dy,dw,dh);
    ctx.fillStyle='rgba(5,3,18,.34)'; ctx.fillRect(0,0,W,H);
  }else{
    ctx.fillStyle='#09031b';ctx.fillRect(0,0,W,H);ctx.fillStyle='#16082f';ctx.fillRect(0,360,W,290);
    for(let i=0;i<10;i++){const x=i*110-30;ctx.fillStyle=i%2?'#25124d':'#32165d';ctx.fillRect(x,360,90,160);} ctx.fillStyle='#080812';ctx.fillRect(0,500,W,150);ctx.fillStyle='#1e1230';for(let y=500;y<650;y+=40)for(let x=0;x<W;x+=80){ctx.fillRect(x+(y/40%2)*40,y,38,38);} ctx.fillStyle='#111';ctx.fillRect(330,70,340,120);ctx.fillStyle='#ff42d0';ctx.font='bold 40px monospace';ctx.textAlign='center';ctx.fillText('NOITE NA BOATE',500,120);ctx.fillStyle='#54f7ff';ctx.fillText('DJ',500,170);
    if(q!=='low'){ctx.fillStyle='#111';for(let i=0;i<16;i++){const x=30+i*62,y=420+Math.sin(now/250+i)*8;ctx.beginPath();ctx.arc(x,y,15,0,Math.PI*2);ctx.fill();}}
  }
  const beams=q==='low'?2:q==='high'?7:4;
  for(let i=0;i<beams;i++){ctx.save();ctx.globalAlpha=q==='low'?.08:.16;ctx.translate(500,88);ctx.rotate(Math.sin(now/700+i)*.6);ctx.fillStyle=i%2?'#00ffff':'#ff33cc';ctx.fillRect(-6,0,12,330);ctx.restore();}
  if(q!=='low'){
    const pulse=.18+.08*Math.sin(now/260);
    ctx.fillStyle='rgba(255,0,170,'+pulse.toFixed(3)+')'; ctx.fillRect(0,H-145,W,145);
    ctx.fillStyle='rgba(0,180,255,'+(pulse*0.6).toFixed(3)+')'; ctx.fillRect(0,H-110,W,110);
  }
  if(this.mode!=='combat'&&this.mode!=='securityCut') this.drawNpcDancers(ctx,now,q);
 }
 drawNpcDancers(ctx,now,quality){
  const drawLoop=(frames,x,baseY,targetH,speed,phase=0)=>{
    if(!frames?.length)return;
    const idx=Math.floor((now+phase)/speed)%frames.length, img=frames[idx];
    if(!img?.complete||!img.naturalWidth)return;
    const h=targetH,w=h*(img.naturalWidth/img.naturalHeight);
    const bob=Math.sin((now+phase)/180)*3;
    ctx.save();ctx.imageSmoothingEnabled=false;ctx.globalAlpha=quality==='low'?.82:.96;
    ctx.drawImage(img,x-w/2,baseY-h+bob,w,h);ctx.restore();
  };
  drawLoop(this.npcMuscular,112,472,126,180,0);
  drawLoop(this.npcNeon,887,470,116,145,90);
  this.drawCustomCrowdDancers(ctx,now,quality,'floor');
  this.drawCompanionDancer(ctx,now,quality,'floor');
 }
 isJoao(player){ return !!player && String(player.name||'').toLowerCase().includes('joão'); }
 isCrist(player){ return !!player && String(player.name||'').toLowerCase().includes('crist'); }
 getSelectedDanceKey(){ return this.activeDancer|| (this.playerChoice===1?'crist':'joao'); }
 getSelectedDanceName(){ return this.getSelectedDanceKey()==='crist' ? 'CRIST' : 'JOÃO'; }
 getBackgroundDanceKey(){ return this.getSelectedDanceKey()==='crist' ? 'joao' : 'crist'; }
 getPlayerByDanceKey(key){ const ps=window.players||[]; return key==='crist' ? ps.find(p=>this.isCrist(p)) : ps.find(p=>this.isJoao(p)); }
 drawFittedFrame(ctx,img,frame,x,y,w,h){
  if(!img||!frame) return false; const [sx,sy,sw,sh]=frame; if(sw<=0||sh<=0) return false;
  const ratio=Math.min(w/sw,h/sh),dw=sw*ratio,dh=sh*ratio,dx=x+(w-dw)/2,dy=y+h-dh;
  ctx.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh); return true;
 }
 drawJoaoClubSprite(ctx,x,y,state,now){
  // O asset transparente é a fonte principal. joaoDanceCanvas pode ficar null em file://.
  const img=this.joaoDanceCanvas||this.joaoDanceSheet;
  const frames=JOAO_DANCE_FRAMES[state]||JOAO_DANCE_FRAMES.dance_idle; if(!img||!frames?.length) return false;
  const speed=state==='dance_combo'?80:(state==='dance_win'||state==='dance_lose'?140:120);
  const idx=Math.floor(now/speed)%frames.length;
  return this.drawFittedFrame(ctx,img,frames[idx],x,y,140,165);
 }
 drawCristClubSprite(ctx,x,y,state,now){
  const img=this.cristDanceSheet;
  const frames=CRIST_DANCE_FRAMES[state]||CRIST_DANCE_FRAMES.dance_idle; if(!img||!img.complete||!img.naturalWidth||!frames?.length) return false;
  const speed=state==='dance_combo'?86:(state==='dance_win'||state==='dance_lose'?145:125);
  const idx=Math.floor(now/speed)%frames.length;
  return this.drawFittedFrame(ctx,img,frames[idx],x,y,140,165);
 }
 drawDanceSpriteByKeySized(ctx,key,x,y,state,now,w=140,h=165){
  const isCrist=key==='crist';
  const img=isCrist?this.cristDanceSheet:(this.joaoDanceCanvas||this.joaoDanceSheet);
  const frames=(isCrist?CRIST_DANCE_FRAMES:JOAO_DANCE_FRAMES)[state] || (isCrist?CRIST_DANCE_FRAMES:JOAO_DANCE_FRAMES).dance_idle;
  if(!img||!frames?.length||!img.complete||!img.naturalWidth) return false;
  const speed=state==='dance_combo'?(isCrist?86:80):((state==='dance_win'||state==='dance_lose')?(isCrist?145:140):(isCrist?125:120));
  const idx=Math.floor(now/speed)%frames.length;
  return this.drawFittedFrame(ctx,img,frames[idx],x,y,w,h);
 }
 drawDanceSpriteByKey(ctx,key,x,y,state,now){
  return this.drawDanceSpriteByKeySized(ctx,key,x,y,state,now,140,165);
 }
 drawCrowdSheetSprite(ctx,key,frameIndex,x,baseY,targetH,flip=false,alpha=.98){
  const def=CROWD_SHEETS[key],img=this.crowdSheets?.[key];
  if(!def?.frames?.length||!img?.complete||!img.naturalWidth) return false;
  const frame=def.frames[((frameIndex%def.frames.length)+def.frames.length)%def.frames.length];
  const [sx,sy,sw,sh]=frame; if(sw<=0||sh<=0) return false;
  const ratio=targetH/sh,dw=sw*ratio,dh=sh*ratio;
  ctx.save(); ctx.imageSmoothingEnabled=false; ctx.globalAlpha=alpha;
  if(flip){ ctx.translate(x,0); ctx.scale(-1,1); ctx.drawImage(img,sx,sy,sw,sh,-dw/2,baseY-dh,dw,dh); }
  else ctx.drawImage(img,sx,sy,sw,sh,x-dw/2,baseY-dh,dw,dh);
  ctx.restore();
  return true;
 }
 drawCustomCrowdDancers(ctx,now,quality,mode='floor'){
  const layouts=mode==='duel'
    ?[
      {key:'casual',x:140,baseY:412,h:84,speed:170,phase:0,flip:false},
      {key:'guy',x:500,baseY:196,h:74,speed:145,phase:210,flip:false},
      {key:'pink',x:860,baseY:408,h:94,speed:155,phase:430,flip:true}
    ]
    :[
      {key:'casual',x:258,baseY:486,h:118,speed:170,phase:0,flip:false},
      {key:'guy',x:500,baseY:490,h:122,speed:145,phase:210,flip:false},
      {key:'pink',x:740,baseY:488,h:126,speed:155,phase:430,flip:true}
    ];
  const visible=quality==='low'?layouts.slice(0,2):layouts;
  visible.forEach(cfg=>{
    const def=CROWD_SHEETS[cfg.key]; if(!def?.frames?.length) return;
    const bob=Math.sin((now+cfg.phase)/190)*3;
    const idx=Math.floor((now+cfg.phase)/cfg.speed)%def.frames.length;
    const alpha=mode==='duel'?.92:(quality==='low'?.88:.98);
    ctx.fillStyle='rgba(0,0,0,.22)'; ctx.fillRect(cfg.x-32,cfg.baseY-6+Math.max(0,bob),64,8);
    this.drawCrowdSheetSprite(ctx,cfg.key,idx,cfg.x,cfg.baseY+bob,cfg.h,cfg.flip,alpha);
  });
 }
 drawCompanionDancer(ctx,now,quality,mode='floor'){
  if(!this.choiceConfirmed && !['dance','result','securityCut','finalCut'].includes(this.mode)) return;
  const key=this.getBackgroundDanceKey();
  const states=['dance_idle','dance_left','dance_right','dance_up','dance_down','dance_combo'];
  const state=states[Math.floor((now+(key==='crist'?180:0))/210)%states.length];
  const cfg=mode==='duel'
    ? {x:key==='crist'?150:848, y:key==='crist'?252:248, w:key==='crist'?94:104, h:key==='crist'?110:120, alpha:.72}
    : {x:key==='crist'?490:585, y:key==='crist'?350:344, w:key==='crist'?88:98, h:key==='crist'?104:114, alpha:quality==='low'?.72:.82};
  ctx.save();
  ctx.globalAlpha=cfg.alpha;
  ctx.fillStyle='rgba(0,0,0,.18)'; ctx.fillRect(cfg.x-30,cfg.y+cfg.h-8,60,8);
  this.drawDanceSpriteByKeySized(ctx,key,cfg.x-cfg.w/2,cfg.y-cfg.h,state,now,cfg.w,cfg.h);
  ctx.restore();
 }
 drawActors(ctx,now){
  const ps=window.players||[];
  ps.slice(0,2).forEach((p,i)=>{
    const boxX=235+i*250+Math.sin(now/140+i)*4, boxY=320;
    const state=(this.mode==='dance'||this.mode==='result')?this.getDanceState(now):'dance_idle';
    if(this.isJoao(p)&&this.drawJoaoClubSprite(ctx,boxX,boxY,state,now)) return;
    if(this.isCrist(p)&&this.drawCristClubSprite(ctx,boxX,boxY,state,now)) return;
    if(!p?.draw) return; const old={x:p.x,y:p.y}; p.x=310+i*250+Math.sin(now/140+i)*5; p.y=405; try{p.draw(ctx);}catch(_){} p.x=old.x;p.y=old.y;
  });
 }
 dialogs(){if(this.mode==='arrival')return [['JOÃO','Chegamos. E isso aqui tem mais neon que Las Vegas inteira.'],['CRIST','Só não inventa de desafiar ninguém.'],['RIVAL','Vocês dois! A pista quer saber se sabem dançar.'],['JOÃO','Então aumenta o som.']];if(this.mode==='securityCut')return [['SEGURANÇA','A festa acabou para vocês.'],['CRIST','Tecnicamente, a gente só estava dançando.'],['JOÃO','Agora acho que vai mudar o ritmo.']];return [['CRIST','Da próxima vez escolhemos um lugar mais tranquilo.'],['JOÃO','Mas admite: a pista foi nossa.'],['SISTEMA','FASE CONCLUÍDA']];}
 drawDialog(ctx){this.drawActors(ctx,performance.now());const d=this.dialogs()[this.dialogIndex]||this.dialogs()[0];ctx.fillStyle='rgba(0,0,0,.84)';ctx.fillRect(70,500,860,115);ctx.strokeStyle='#56f5ff';ctx.lineWidth=3;ctx.strokeRect(70,500,860,115);ctx.fillStyle='#ffd65a';ctx.font='bold 22px monospace';ctx.textAlign='left';ctx.fillText(d[0],95,532);ctx.fillStyle='#fff';ctx.font='18px sans-serif';ctx.fillText(d[1],95,568);ctx.fillStyle='#8ff';ctx.font='14px sans-serif';ctx.fillText('ENTER/ESPAÇO • toque na tela para avançar',95,598);}
 advanceDialog(){const ds=this.dialogs();if(this.dialogIndex<ds.length-1){this.dialogIndex++;return;}this.dialogIndex=0;if(this.mode==='arrival')this.mode='choose';else if(this.mode==='securityCut')this.beginCombat();else if(this.mode==='finalCut')this.finish();}
 drawChoose(ctx){this.drawActors(ctx,performance.now());ctx.fillStyle='rgba(0,0,0,.78)';ctx.fillRect(210,205,580,240);ctx.fillStyle='#fff';ctx.font='bold 30px monospace';ctx.textAlign='center';ctx.fillText('QUEM VAI PARA A PISTA?',500,255);['JOÃO','CRIST'].forEach((n,i)=>{ctx.fillStyle=this.playerChoice===i?'#40f5ff':'#252535';ctx.fillRect(285+i*230,300,200,82);ctx.fillStyle=this.playerChoice===i?'#001015':'#fff';ctx.font='bold 24px monospace';ctx.fillText(n,385+i*230,350);});ctx.fillStyle='#ddd';ctx.font='16px sans-serif';ctx.fillText('← → para escolher • ENTER para confirmar',500,415);}
 startDuel(i){this.duel=i;this.mode='dance';this.activeDancer=this.playerChoice===1?'crist':'joao';this.choiceConfirmed=true;this.notes=[];this.score=0;this.combo=0;this.hype=50;this.maxCombo=0;this.perfectChain=0;this.bestPerfectChain=0;this.misses=0;this.result=null;this.spawned=0;this.spawnAt=performance.now()+700;this.currentDanceState='dance_idle';this.stateUntil=0;this.feedbackText='';this.feedbackUntil=0;window.soundSystem?.stopMusic?.();window.soundSystem?.startMusic?.(i===0?'city':i===1?'casino':'fast');log('[DANCE] START DUEL');}
 updateDance(ctx,dt,now){const d=DUELS[this.duel],interval=60000/d.bpm;while(this.spawned<d.notes&&now>=this.spawnAt){const burst=this.duel===0?1:(Math.random()<.22?2:1);for(let b=0;b<burst&&this.spawned<d.notes;b++){const lane=LANES[(Math.random()*4)|0];this.notes.push({lane,y:82,hit:false});this.spawned++;log('[DANCE] NOTE SPAWN');}this.spawnAt+=interval*(this.duel===2&&Math.random()<.25?.55:1);}for(const n of this.notes)n.y+=d.speed*dt;for(const n of this.notes){if(!n.hit&&n.y>505){n.hit=true;this.miss();}}this.notes=this.notes.filter(n=>!n.hit||n.y<560);this.drawDance(ctx,d,now);if(this.spawned>=d.notes&&this.notes.every(n=>n.hit)){const ratio=this.score/Math.max(1,d.notes*1000);this.result={win:ratio>=d.threshold,ratio};this.mode='result';log('[DANCE] DUEL COMPLETE');}}
 drawDance(ctx,d,now){
  const xs={left:300,up:430,down:570,right:700};
  // Cabeçalho deixa explícito que esta tela é um duelo e quem é o adversário.
  ctx.fillStyle='rgba(3,4,12,.92)';ctx.fillRect(165,8,670,46);ctx.strokeStyle='#ff42d0';ctx.lineWidth=2;ctx.strokeRect(165,8,670,46);
  const activeKey=this.getSelectedDanceKey(), activeName=this.getSelectedDanceName();
  ctx.textAlign='center';ctx.fillStyle='#ffe65a';ctx.font='bold 19px monospace';ctx.fillText(`DUELO ${this.duel+1}/3  •  ${activeName}  VS  ${d.name}`,500,37);

  // Pista central. Os duelistas ficam fora deste painel para nunca serem encobertos.
  ctx.fillStyle='rgba(0,0,0,.64)';ctx.fillRect(205,62,590,448);
  for(const l of LANES){ctx.fillStyle='rgba(20,20,35,.76)';ctx.fillRect(xs[l]-43,70,86,423);ctx.fillStyle='#fff';ctx.font='bold 40px sans-serif';ctx.textAlign='center';ctx.fillText(GLYPH[l],xs[l],476);}
  ctx.strokeStyle='#ffe34f';ctx.lineWidth=5;ctx.strokeRect(230,428,540,60);

  // NPCs adicionais na boate continuam dançando ao redor do duelo.
  const quality=window.gameSettings?.data?.graphicsQuality||'medium';
  this.drawCustomCrowdDancers(ctx,now,quality,'duel');
  this.drawCompanionDancer(ctx,now,quality,'duel');

  // O personagem escolhido dança à esquerda; o rival dança à direita.
  const state=this.getDanceState(now);
  const performerDrawn=this.drawDanceSpriteByKey(ctx,activeKey,35,315,state,now);
  if(!performerDrawn){const actor=this.getPlayerByDanceKey(activeKey);if(actor?.draw){const old={x:actor.x,y:actor.y};actor.x=90;actor.y=420;try{actor.draw(ctx);}catch(_){}actor.x=old.x;actor.y=old.y;}}
  const rivalFrames=this.duel===0?this.npcNeon:this.npcMuscular;
  if(rivalFrames?.length){const ri=Math.floor(now/(this.duel===2?90:125))%rivalFrames.length,im=rivalFrames[ri];if(im?.complete&&im.naturalWidth){const h=154,w=h*(im.naturalWidth/im.naturalHeight);ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(im,930-w/2,472-h+Math.sin(now/150)*3,w,h);ctx.restore();}}
  ctx.textAlign='center';ctx.font='bold 14px monospace';ctx.fillStyle='#55f4ff';ctx.fillText(activeName,105,505);ctx.fillStyle='#ff7ae7';ctx.fillText(d.name,905,505);

  for(const n of this.notes){ctx.fillStyle='#55f4ff';ctx.font='bold 42px sans-serif';ctx.fillText(GLYPH[n.lane],xs[n.lane],n.y);}

  // Progresso do duelo: notas já lançadas/concluídas versus total.
  const completed=Math.max(0,Math.min(d.notes,(this.spawned||0)-this.notes.filter(n=>!n.hit).length));
  const progress=Math.max(0,Math.min(1,completed/Math.max(1,d.notes)));
  ctx.fillStyle='rgba(0,0,0,.75)';ctx.fillRect(245,514,510,24);ctx.fillStyle='#25263b';ctx.fillRect(250,519,500,14);ctx.fillStyle='#42f5b3';ctx.fillRect(250,519,500*progress,14);ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.strokeRect(250,519,500,14);
  ctx.fillStyle='#fff';ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.fillText(`PROGRESSO ${completed}/${d.notes}`,500,550);

  ctx.fillStyle='#fff';ctx.font='bold 16px monospace';ctx.textAlign='left';ctx.fillText(`HYPE ${Math.round(this.hype)}   COMBO x${this.combo}   SCORE ${this.score}`,250,588);
  for(let i=0;i<4;i++){ctx.fillStyle='rgba(10,10,20,.92)';ctx.fillRect(230+i*140,598,125,45);ctx.strokeStyle='#45e9ff';ctx.strokeRect(230+i*140,598,125,45);ctx.fillStyle='#fff';ctx.font='bold 27px sans-serif';ctx.textAlign='center';ctx.fillText(GLYPH[LANES[i]],292+i*140,631);}
  if(this.feedbackText&&now<this.feedbackUntil){ctx.fillStyle=this.feedbackText==='PERFEITO'?'#ffe85a':(this.feedbackText==='BOM'?'#7efbff':'#ff667e');ctx.font='bold 38px monospace';ctx.textAlign='center';ctx.fillText(this.feedbackText,500,235);}
 }
 hit(lane){const now=performance.now(); this.lastInputLane=lane; const target=this.notes.filter(n=>!n.hit&&n.lane===lane).sort((a,b)=>Math.abs(a.y-460)-Math.abs(b.y-460))[0];if(!target||Math.abs(target.y-460)>55){this.miss();return;}const diff=Math.abs(target.y-460);target.hit=true;if(diff<=22){this.score+=1000*(1+Math.min(3,Math.floor(this.combo/10)));this.combo++;this.hype=Math.min(100,this.hype+3);this.perfectChain++;this.bestPerfectChain=Math.max(this.bestPerfectChain,this.perfectChain);window.soundSystem?.playSound?.('clubPerfect');this.setFeedback('PERFEITO');this.setDanceState(this.combo>=6?'dance_combo':`dance_${lane}`,this.combo>=6?760:520);log('[DANCE] PERFECT');}else{this.score+=650;this.combo++;this.hype=Math.min(100,this.hype+1.5);this.perfectChain=0;window.soundSystem?.playSound?.('clubCombo');this.setFeedback('BOM');this.setDanceState(this.combo>=6?'dance_combo':`dance_${lane}`,this.combo>=6?700:480);log('[DANCE] GOOD');}this.maxCombo=Math.max(this.maxCombo,this.combo);}
 miss(){this.combo=0;this.perfectChain=0;this.misses++;this.hype=Math.max(0,this.hype-6);this.setFeedback('ERRO');this.setDanceState('dance_down',320);window.soundSystem?.playSound?.('clubHit');log('[DANCE] MISS');}
 drawResult(ctx){this.drawActors(ctx,performance.now());const d=DUELS[this.duel];ctx.fillStyle='rgba(0,0,0,.82)';ctx.fillRect(180,150,640,350);ctx.textAlign='center';ctx.fillStyle=this.result?.win?'#4dff8c':'#ff5a70';ctx.font='bold 48px monospace';ctx.fillText(this.result?.win?'DUELO VENCIDO!':'QUASE LÁ!',500,225);ctx.fillStyle='#fff';ctx.font='22px sans-serif';ctx.fillText(`${d.name} • ${this.score} pts • combo ${this.maxCombo} • ${this.misses} erros`,500,285);ctx.fillText(this.result?.win?(this.duel<2?'ENTER: próximo duelo':'ENTER: continuar'):'ENTER: tentar novamente',500,390);}
 resolveResult(){if(!this.result?.win){this.startDuel(this.duel);return;}this.saveDuel();if(this.duel<2)this.startDuel(this.duel+1);else{this.mode='securityCut';this.dialogIndex=0;window.soundSystem?.stopMusic?.();window.soundSystem?.startMusic?.('assassin');}}
 saveDuel(){try{if(window.saveSystem?.recordClubDuel)window.saveSystem.recordClubDuel(this.duel,{hype:this.hype,combo:this.maxCombo,score:this.score,perfectChain:this.bestPerfectChain,misses:this.misses});}catch(_){} if(this.duel===2)this.unlock('club_dance_king');if(this.bestPerfectChain>=20)this.unlock('club_perfect_steps');if(this.misses===0)this.unlock('club_no_miss');}
 unlock(id){const ts=window.trophySystem;if(!ts)return;const t=ts.trophies?.find(x=>x.id===id);if(t)ts.unlockTrophy?.(t);}
 makeLevel(){return {id:'club',name:'Noite na Boate',description:'Confusão na pista',width:1800,height:650,nextLevel:6,enemyCount:0,enemyTypes:['club_security'],useWaves:false,hasBoss:false,getGround(){return 500;},getPlatforms(){return[];},drawBackground:(ctx)=>this.drawClub(ctx,performance.now()),dispose(){}};}
 beginCombat(){this.mode='combat';this.wave=0;this.waveSpawned=false;this.bossSpawned=false;window.soundSystem?.stopMusic?.();window.soundSystem?.startMusic?.('assassin');window.enemies.length=0;window.particles.length=0;window.powerUps.length=0;window.destructibles.length=0;window.currentLevel=this.makeLevel();window.cameraX=0;(window.players||[]).forEach((p,i)=>{p.x=220+i*80;p.y=window.currentLevel.getGround()-p.h;p.life=Math.max(1,p.life);});if(typeof window.setClubCombatState==='function')window.setClubCombatState();this.spawnNextWave();log('[CLUB] SECURITY FIGHT START');}
 spawnNextWave(){this.wave++;const enemies=window.enemies||[];const make=(strong=false,boss=false,x=900)=>{let e=null;try{e=EnemyFactory.create(x,window.currentLevel.getGround(),'club_security');}catch(_){}if(!e)return;e.x=x;e.y=window.currentLevel.getGround()-(e.h||60);if(strong){e.maxLife=Math.round((e.maxLife||100)*1.55);e.life=e.maxLife;e.damage=Math.round((e.damage||10)*1.2);}if(boss){e.isBoss=true;e.name='CHEFE DA SEGURANÇA';e.maxLife=Math.round((e.maxLife||120)*2.4);e.life=e.maxLife;e.damage=Math.round((e.damage||12)*1.45);e.score=1500;}enemies.push(e);};if(this.wave===1){make(false,false,760);make(false,false,980);}else if(this.wave===2){make(false,false,700);make(false,false,900);make(false,false,1100);}else if(this.wave===3){make(true,false,720);make(true,false,980);make(true,true,1180);this.bossSpawned=true;}this.waveSpawned=true;}
 postCombatFrame(){if(!this.active||this.mode!=='combat')return;const list=alive(window.enemies);if(list.length)return;if(this.wave<3){this.spawnNextWave();return;}this.mode='finalCut';this.dialogIndex=0;if(typeof window.setClubSequenceState==='function')window.setClubSequenceState();window.soundSystem?.stopMusic?.();window.soundSystem?.startMusic?.('vegas');this.unlock('club_security_max');try{window.saveSystem?.recordClubComplete?.({boss:true});}catch(_){}log('[CLUB] BOSS DEFEATED');}
 finish(){try{window.saveSystem?.recordClubComplete?.({boss:true});}catch(_){}log('[CLUB] LEVEL COMPLETE');const standalone=!!this.standalone;this.dispose(false);if(standalone&&typeof window.returnFromClubBonus==='function')window.returnFromClubBonus(this.returnTo);else if(typeof window.continueAfterClub==='function')window.continueAfterClub();}
 dispose(release=true){this.listeners.splice(0).forEach(fn=>{try{fn();}catch(_){}});this.notes.length=0;this.active=false;this.mode='idle';this.feedbackText='';this.currentDanceState='dance_idle';this.activeDancer='joao';this.standalone=false;this.returnTo='stage_select';if(release)window.levelManager?.releaseBonus?.('club');}
}
window.clubSequence=new ClubSequence();
})();
