/* João & Crist v0.9.5 — fase especial "Noite na Boate"
   Integração leve: dança/cutscenes próprias + combate reaproveitando players/enemies/EnemyFactory.
   v0.9.5g: entrada VS, notas duplas e feedback visual refinado nos duelos. */
(()=>{
'use strict';
const W=1000,H=650,LANES=['left','up','down','right'],GLYPH={left:'←',up:'↑',down:'↓',right:'→'};
const DUELS=[
 {name:'DJ NEON', bpm:92, speed:185, notes:30, threshold:0.58, rivalSkill:.62, pattern:['left','up','down','right','left','down','up','right']},
 {name:'FÊNIX', bpm:116, speed:225, notes:45, threshold:0.62, rivalSkill:.72, pattern:['left','left','up','right','down','up','down','right','up','left','down','right']},
 {name:'REI DA PISTA', bpm:138, speed:270, notes:64, threshold:0.66, rivalSkill:.82, pattern:['left','up','left','down','right','up','down','right','left','right','up','down','left','up','right','down']}
];
const JOAO_DANCE_SHEET='assets/bonus/boate/players/joao/dance-sheet-transparent.png';
const CRIST_DANCE_SHEET='assets/bonus/boate/players/crist/dance-sheet-transparent.png';
const CLUB_BG='assets/bonus/boate/backgrounds/noite-na-boate.png';
const SECURITY_IDLE='assets/enemies/vegas-frames/seguranca/idle.webp';
const NPC_MUSCULAR=Array.from({length:5},(_,i)=>`assets/bonus/boate/npcs/muscular/dance-${i+1}.webp`);
const NPC_NEON=Array.from({length:6},(_,i)=>`assets/bonus/boate/npcs/neon/dance-${i+1}.webp`);
const CROWD_SHEETS={
  casual:{path:'assets/bonus/boate/npcs/crowd/crowd-girl-casual.png',frames:[[27,21,117,220],[178,21,108,222],[336,23,115,219],[473,23,117,219],[618,23,113,217],[759,23,119,219],[910,23,107,220],[1054,22,131,220],[26,269,114,208],[164,270,110,207],[310,270,108,207],[456,268,112,209],[606,269,101,207],[737,270,151,205],[896,269,112,208],[1038,269,119,208]],loop:[0,1,2,3,4,5,6,7,6,5,4,3,2,1]},
  guy:{path:'assets/bonus/boate/npcs/crowd/crowd-guy-black.png',frames:[[27,28,112,208],[176,28,120,208],[331,28,121,209],[482,28,143,208],[658,28,171,208],[865,28,189,209],[24,265,123,197],[184,265,138,196],[358,266,124,196],[523,265,127,196],[693,266,108,195],[853,266,126,195],[23,485,116,184],[164,488,135,181],[327,485,143,184],[522,486,120,183]],loop:[0,1,2,3,4,3,2,1,6,7,8,9,10,11,12,13,14,13,12,11,10,9,8,7,6,1]},
  pink:{path:'assets/bonus/boate/npcs/crowd/crowd-girl-pink.png',frames:[[29,25,103,206],[144,25,98,205],[253,25,98,205],[371,26,92,204],[484,28,98,202],[875,25,110,206],[997,27,106,204],[25,274,102,198],[148,273,146,199],[303,273,135,199],[457,271,102,201],[592,269,110,202],[731,274,98,198],[857,270,105,202],[990,274,131,198]],loop:[0,1,2,3,4,3,2,1,7,8,9,10,11,12,13,14,13,12,11,10,9,8]}
};
const NPC_CROWD_LOOPS={
  muscular:[0,1,2,1,3,4,3,1],
  neon:[0,1,2,3,4,5,4,3,2,1],
  companion:['dance_idle','dance_left','dance_idle','dance_right','dance_idle','dance_combo']
};
const JOAO_DANCE_FRAMES={
  dance_idle:[[30,52,100,178],[140,57,116,173],[263,58,118,172],[384,56,124,174]],
  dance_left:[[576,52,104,180],[657,51,120,181],[756,51,124,181]],
  dance_right:[[1005,49,122,181],[1105,49,120,181],[1210,51,112,179],[1312,50,114,180]],
  dance_up:[[20,290,126,189],[155,290,127,194],[286,290,130,194],[418,292,133,192]],
  dance_down:[[620,310,118,173],[724,310,112,173],[822,309,108,174],[998,311,145,172]],
  dance_combo:[[31,515,154,217],[253,535,179,195],[424,524,192,206],[706,505,152,225],[861,568,280,168],[1128,520,285,210]],
  dance_win:[[19,746,157,259],[161,779,181,226],[338,797,167,208],[500,802,162,203]],
  dance_lose:[[676,844,154,161],[822,844,153,159],[968,842,199,159],[1175,882,255,113]]
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
  this.securityIdle=window.assetManager?.image?.(SECURITY_IDLE,'bonus:club',{defer:true})||null;
  this.npcMuscular=NPC_MUSCULAR.map(src=>window.assetManager?.image?.(src,'bonus:club',{defer:true})).filter(Boolean);
  this.npcNeon=NPC_NEON.map(src=>window.assetManager?.image?.(src,'bonus:club',{defer:true})).filter(Boolean);
  this.crowdSheets=Object.fromEntries(Object.entries(CROWD_SHEETS).map(([key,data])=>[key,window.assetManager?.image?.(data.path,'bonus:club',{defer:true})||null]));
  this.joaoDanceCanvas=null; this.joaoDancePrepared=false;
  this.currentDanceState='dance_idle';this.stateUntil=0;this.feedbackText='';this.feedbackUntil=0;this.lastInputLane='down';
  this.rivalScore=0;this.perfects=0;this.goods=0;this.maxHype=50;this.feverUntil=0;this.feverTriggered=false;this.duelHistory=[];this.grandResult=null;this.securityIntroAt=0;this.lastCrowdBurst=0;this.duelIntroAt=0;this.laneFlashUntil={left:0,up:0,down:0,right:0};this.lastPerfectAt=0;this.cameraKickUntil=0;this.cameraKickPower=0;this.newClubRecord=false;this.specialHits=0;
 }
 ensureAssets(){
  if(!this.joaoDanceSheet) this.joaoDanceSheet=window.assetManager?.image?.(JOAO_DANCE_SHEET,'bonus:club',{defer:true})||null;
  if(!this.cristDanceSheet) this.cristDanceSheet=window.assetManager?.image?.(CRIST_DANCE_SHEET,'bonus:club',{defer:true})||null;
  if(!this.clubBg) this.clubBg=window.assetManager?.image?.(CLUB_BG,'bonus:club',{defer:true})||null;
  if(!this.securityIdle) this.securityIdle=window.assetManager?.image?.(SECURITY_IDLE,'bonus:club',{defer:true})||null;
  window.assetManager?.loadImage?.(JOAO_DANCE_SHEET,'bonus:club').then(()=>this.prepareJoaoDanceSheet()).catch(()=>{});
  window.assetManager?.loadImage?.(CRIST_DANCE_SHEET,'bonus:club').catch(()=>{});
  window.assetManager?.loadImage?.(CLUB_BG,'bonus:club').catch(()=>{});
  window.assetManager?.loadImage?.(SECURITY_IDLE,'bonus:club').catch(()=>{});
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
  this.activeDancer='joao';this.duelHistory=[];this.grandResult=null;this.feverUntil=0;this.feverTriggered=false;this.securityIntroAt=0;
  this.returnLevel=window.currentLevel; this.returnIndex=5;
  this.bind(); window.soundSystem?.initAudioContext?.(); window.soundSystem?.stopMusic?.(); window.soundSystem?.startMusic?.('vegas');
  log('[CLUB] START');
 }
 ensurePlayers(){
  const ps=window.players||[];
  // A boate precisa conhecer os dois personagens para a escolha JOÃO/CRIST ser real.
  // Mantém qualquer instância já existente e cria somente o personagem ausente,
  // sempre carregando o progresso conquistado na história.
  const hasJoao=ps.some(p=>this.isJoao?.(p)||String(p?.name||'').toLowerCase().includes('joão'));
  const hasCrist=ps.some(p=>this.isCrist?.(p)||String(p?.name||'').toLowerCase().includes('crist'));
  const add=(name,index)=>{
    let player=name==='Crist'?new PlayerCrist(200+index*80,420,index+1):new PlayerJoao(200+index*80,420,index+1);
    try{
      player.evolution=new PlayerEvolution(player);
      player.evolution.load(window.saveSystem?.loadPlayerProgress?.(name));
    }catch(_){}
    ps.push(player);
  };
  if(!hasJoao)add('João',ps.length);
  if(!hasCrist)add('Crist',ps.length);
  window.clubReplayPlayers=null;
 }
 ensureSelectedCombatPlayer(){
  const key=this.getSelectedDanceKey();
  const name=key==='crist'?'Crist':'João';
  let fighter=this.getPlayerByDanceKey(key);
  if(!fighter){
    fighter=key==='crist'?new PlayerCrist(220,420,1):new PlayerJoao(220,420,1);
    try{
      fighter.evolution=new PlayerEvolution(fighter);
      fighter.evolution.load(window.saveSystem?.loadPlayerProgress?.(name));
    }catch(_){}
  }else{
    // Reaplica o progresso salvo antes da luta para garantir que o bônus
    // use o mesmo nível/XP/skills conquistados na história.
    try{
      if(!fighter.evolution)fighter.evolution=new PlayerEvolution(fighter);
      fighter.evolution.load(window.saveSystem?.loadPlayerProgress?.(name));
    }catch(_){}
  }
  const ps=window.players||[];
  ps.splice(0,ps.length,fighter);
  return fighter;
 }
 bind(){
  const kd=e=>{if(!this.active)return; if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','Enter'].includes(e.key))e.preventDefault(); this.onKey(e.key,true);};
  const ku=e=>{if(this.active)this.onKey(e.key,false);};
  window.addEventListener('keydown',kd,{passive:false});window.addEventListener('keyup',ku);this.listeners.push(()=>window.removeEventListener('keydown',kd),()=>window.removeEventListener('keyup',ku));
  const canvas=document.getElementById('game');
  const pd=e=>{if(!this.active)return;const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;if(this.mode==='dance'&&y>=520&&x>=170&&x<=830){const i=Math.max(0,Math.min(3,Math.floor((x-170)/165)));this.hit(LANES[i]);e.preventDefault();return;}if(['arrival','securityCut','finalCut'].includes(this.mode)){this.advanceDialog(true);e.preventDefault();return;}if(this.mode==='choose'){this.playerChoice=x<500?0:1;if(y>270){this.choiceConfirmed=true;this.startDuel(0);}e.preventDefault();return;}if(this.mode==='duelIntro'){this.beginDuelPlay();e.preventDefault();return;}if(this.mode==='result'){this.resolveResult();e.preventDefault();return;}if(this.mode==='grandResult'){this.startSecurityIntro();e.preventDefault();return;}if(this.mode==='securityIntro'&&performance.now()-this.securityIntroAt>850){this.beginCombat();e.preventDefault();return;}};
  canvas?.addEventListener('pointerdown',pd,{passive:false});this.listeners.push(()=>canvas?.removeEventListener('pointerdown',pd));
 }
 pollGamepad(){const gp=window.gamepadSystem; if(!gp)return;const dirs=['left','up','down','right'];dirs.forEach((a,i)=>{const v=!!gp.isActionDown?.(1,a),edge=v&&!this.padPrev[i];this.padPrev[i]=v;if(edge&&this.mode==='dance')this.hit(a);});const accept=!!gp.isActionDown?.(1,'attack'),edge=accept&&!this.padPrev[4];this.padPrev[4]=accept;if(edge){if(['arrival','securityCut','finalCut'].includes(this.mode))this.advanceDialog();else if(this.mode==='choose')this.startDuel(0);else if(this.mode==='duelIntro')this.beginDuelPlay();else if(this.mode==='result')this.resolveResult();else if(this.mode==='grandResult')this.startSecurityIntro();else if(this.mode==='securityIntro'&&performance.now()-this.securityIntroAt>850)this.beginCombat();}}
 onKey(key,down){if(!down)return; if(this.mode==='arrival'||this.mode==='securityCut'||this.mode==='finalCut'){if(key==='Enter'||key===' '){this.advanceDialog(true);return;}} if(this.mode==='choose'){if(key==='ArrowLeft'||key==='a'||key==='A')this.playerChoice=0;if(key==='ArrowRight'||key==='d'||key==='D')this.playerChoice=1;if(key==='Enter'||key===' '){this.choiceConfirmed=true;this.startDuel(0);}return;} if(this.mode==='duelIntro'&&(key==='Enter'||key===' ')){this.beginDuelPlay();return;} if(this.mode==='dance'){const map={ArrowLeft:'left',a:'left',A:'left',ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowRight:'right',d:'right',D:'right'};if(map[key])this.hit(map[key]);return;} if(this.mode==='result'&&(key==='Enter'||key===' ')){this.resolveResult();return;} if(this.mode==='grandResult'&&(key==='Enter'||key===' ')){this.startSecurityIntro();return;} if(this.mode==='securityIntro'&&(key==='Enter'||key===' ')&&performance.now()-this.securityIntroAt>850){this.beginCombat();return;}}
 setDanceState(state,duration=520){ this.currentDanceState=state; this.stateUntil=performance.now()+duration; }
 setFeedback(text,duration=540){ this.feedbackText=text; this.feedbackUntil=performance.now()+duration; }
 getDanceState(now){ if(this.mode==='result') return this.result?.win?'dance_win':'dance_lose'; if(this.mode!=='dance') return 'dance_idle'; return now<this.stateUntil ? this.currentDanceState : 'dance_idle'; }
 updateDraw(ctx){if(!this.active)return null; const now=performance.now(),dt=Math.min(.04,(now-this.last)/1000||0);this.last=now;this.pollGamepad();this.prepareJoaoDanceSheet();this.drawClub(ctx,now); if(this.mode==='dance')this.updateDance(ctx,dt,now); else if(this.mode==='duelIntro')this.drawDuelIntro(ctx,now); else if(this.mode==='arrival'||this.mode==='securityCut'||this.mode==='finalCut')this.drawDialog(ctx); else if(this.mode==='choose')this.drawChoose(ctx); else if(this.mode==='result')this.drawResult(ctx); else if(this.mode==='grandResult')this.drawGrandResult(ctx); else if(this.mode==='securityIntro')this.drawSecurityIntro(ctx,now); return this.mode;}
 drawClub(ctx,now){
  const q=window.gameSettings?.data?.graphicsQuality||'medium';
  const cinematic=['duelIntro','dance','result','grandResult','securityIntro'].includes(this.mode);
  ctx.save();
  if(cinematic){let zoom=1;if(this.mode==='duelIntro')zoom=1.025+Math.sin(now/180)*.006;else if(this.mode==='securityIntro')zoom=1.045;else if(this.isFever(now))zoom=1.035+Math.sin(now/90)*.008;else if(this.combo>=10)zoom=1.012;let sx=0,sy=0;if(now<this.cameraKickUntil){const k=this.cameraKickPower*Math.max(0,(this.cameraKickUntil-now)/180);sx=Math.sin(now*.31)*k;sy=Math.cos(now*.27)*k*.55;}ctx.translate(W/2+sx,H/2+sy);ctx.scale(zoom,zoom);ctx.translate(-W/2,-H/2);}
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
  const fever=this.isFever(now);
  const hypeLevel=Math.max(0,Math.min(1,this.hype/100));
  const beams=q==='low'?(fever?3:2):q==='high'?(fever?10:7):(fever?7:4);
  for(let i=0;i<beams;i++){ctx.save();ctx.globalAlpha=q==='low'?.08:.16;ctx.translate(500,88);ctx.rotate(Math.sin(now/700+i)*.6);ctx.fillStyle=i%2?'#00ffff':'#ff33cc';ctx.fillRect(-6,0,12,330);ctx.restore();}
  if(q!=='low'){
    const pulse=.14+(hypeLevel*.14)+.08*Math.sin(now/(fever?110:260));
    ctx.fillStyle='rgba(255,0,170,'+pulse.toFixed(3)+')'; ctx.fillRect(0,H-145,W,145);
    ctx.fillStyle='rgba(0,180,255,'+(pulse*0.6).toFixed(3)+')'; ctx.fillRect(0,H-110,W,110);
  }
  if(fever&&this.mode==='dance'){ctx.save();ctx.globalAlpha=.12+.05*Math.sin(now/80);ctx.fillStyle='#fff36a';ctx.fillRect(0,0,W,H);ctx.restore();}
  if(this.mode!=='combat'&&this.mode!=='securityCut') this.drawNpcDancers(ctx,now,q);
  if(q!=='low'&&this.mode!=='combat'){const bpm=DUELS[this.duel]?.bpm||92,beat=(now%(60000/bpm))/(60000/bpm),amp=(1-Math.abs(beat-.5)*2)*Math.max(.25,this.hype/100);ctx.fillStyle=`rgba(90,245,255,${(.10+amp*.18).toFixed(3)})`;for(let i=0;i<12;i++){const bh=10+amp*(16+(i%4)*5);ctx.fillRect(390+i*19,178-bh,12,bh);}}
  ctx.restore();
 }
 getLoopValue(loop,index,fallbackLength){
  if(Array.isArray(loop) && loop.length) return loop[index%loop.length];
  return fallbackLength>0 ? index%fallbackLength : 0;
 }
 drawNpcDancers(ctx,now,quality){
  const drawLoop=(frames,sequence,x,baseY,targetH,speed,phase=0)=>{
    if(!frames?.length)return;
    const energy=.82+Math.max(0,Math.min(1,this.hype/100))*.55;
    const orderIndex=Math.floor((now+phase)/(speed/energy));
    const idx=this.getLoopValue(sequence,orderIndex,frames.length), img=frames[idx];
    if(!img?.complete||!img.naturalWidth)return;
    const h=targetH,w=h*(img.naturalWidth/img.naturalHeight);
    const bob=Math.sin((now+phase)/180)*3;
    ctx.save();ctx.imageSmoothingEnabled=false;ctx.globalAlpha=quality==='low'?.82:.96;
    ctx.drawImage(img,x-w/2,baseY-h+bob,w,h);ctx.restore();
  };
  drawLoop(this.npcMuscular,NPC_CROWD_LOOPS.muscular,112,472,126,180,0);
  drawLoop(this.npcNeon,NPC_CROWD_LOOPS.neon,887,470,116,145,90);
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
    const energy=.82+Math.max(0,Math.min(1,this.hype/100))*.7;
    const orderIndex=Math.floor((now+cfg.phase)/(cfg.speed/energy));
    const idx=this.getLoopValue(def.loop,orderIndex,def.frames.length);
    const alpha=mode==='duel'?.92:(quality==='low'?.88:.98);
    ctx.fillStyle='rgba(0,0,0,.22)'; ctx.fillRect(cfg.x-32,cfg.baseY-6+Math.max(0,bob),64,8);
    this.drawCrowdSheetSprite(ctx,cfg.key,idx,cfg.x,cfg.baseY+bob,cfg.h,cfg.flip,alpha);
  });
 }
 drawCompanionDancer(ctx,now,quality,mode='floor'){
  if(!this.choiceConfirmed && !['dance','result','securityCut','finalCut'].includes(this.mode)) return;
  const key=this.getBackgroundDanceKey();
  const states=NPC_CROWD_LOOPS.companion;
  let state=states[Math.floor((now+(key==='crist'?180:0))/(this.hype>=75?210:320))%states.length];
  if(this.feedbackText==='PERFEITO'&&now<this.feedbackUntil)state='dance_win';
  else if(this.feedbackText==='ERRO'&&now<this.feedbackUntil)state='dance_lose';
  else if(this.combo>=10||this.isFever(now))state='dance_combo';
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
 dialogs(){if(this.mode==='arrival')return [['JOÃO','Chegamos. E isso aqui tem mais neon que Las Vegas inteira.'],['CRIST','Só não inventa de desafiar ninguém.'],['RIVAL','Vocês dois! A pista quer saber se sabem dançar.'],['JOÃO','Então aumenta o som.']];if(this.mode==='securityCut')return [['SEGURANÇA DE VEGAS','A festa acabou para vocês.'],['CRIST','Tecnicamente, a gente só estava dançando.'],['JOÃO','Agora acho que vai mudar o ritmo.']];return [['CRIST','Da próxima vez escolhemos um lugar mais tranquilo.'],['JOÃO','Mas admite: a pista foi nossa.'],['SISTEMA','FASE CONCLUÍDA']];}
 drawDialog(ctx){this.drawActors(ctx,performance.now());const d=this.dialogs()[this.dialogIndex]||this.dialogs()[0];ctx.fillStyle='rgba(0,0,0,.84)';ctx.fillRect(70,500,860,115);ctx.strokeStyle='#56f5ff';ctx.lineWidth=3;ctx.strokeRect(70,500,860,115);ctx.fillStyle='#ffd65a';ctx.font='bold 22px monospace';ctx.textAlign='left';ctx.fillText(d[0],95,532);ctx.fillStyle='#fff';ctx.font='18px sans-serif';ctx.fillText(d[1],95,568);ctx.fillStyle='#8ff';ctx.font='14px sans-serif';ctx.fillText('ENTER/ESPAÇO • toque na tela para avançar',95,598);}
 advanceDialog(){const ds=this.dialogs();if(this.dialogIndex<ds.length-1){this.dialogIndex++;return;}this.dialogIndex=0;if(this.mode==='arrival')this.mode='choose';else if(this.mode==='securityCut')this.beginCombat();else if(this.mode==='finalCut')this.finish();}
 drawChoose(ctx){this.drawActors(ctx,performance.now());ctx.fillStyle='rgba(0,0,0,.78)';ctx.fillRect(210,205,580,240);ctx.fillStyle='#fff';ctx.font='bold 30px monospace';ctx.textAlign='center';ctx.fillText('QUEM VAI PARA A PISTA?',500,255);['JOÃO','CRIST'].forEach((n,i)=>{ctx.fillStyle=this.playerChoice===i?'#40f5ff':'#252535';ctx.fillRect(285+i*230,300,200,82);ctx.fillStyle=this.playerChoice===i?'#001015':'#fff';ctx.font='bold 24px monospace';ctx.fillText(n,385+i*230,350);});ctx.fillStyle='#ddd';ctx.font='16px sans-serif';ctx.fillText('← → para escolher • ENTER para confirmar',500,415);}

 isFever(now=performance.now()){return now<this.feverUntil;}
 triggerFever(now=performance.now()){
  if(this.isFever(now))return;
  this.feverUntil=now+6000;this.feverTriggered=true;this.hype=100;this.cameraKickUntil=now+260;this.cameraKickPower=8;this.setFeedback('FEVER!',900);window.soundSystem?.playSound?.('clubLevelComplete');log('[DANCE] FEVER START');
 }
 updateFever(now){if(this.feverUntil&&now>=this.feverUntil){this.feverUntil=0;this.hype=Math.min(this.hype,82);this.setFeedback('FEVER FIM',600);}}
 playerMultiplier(now=performance.now()){return this.isFever(now)?1.5:1;}
 rivalGainFor(note){const d=DUELS[this.duel],wave=(Math.sin((note.index+1)*2.17+this.duel*.9)+1)/2;return Math.round(1000*Math.max(.42,Math.min(.98,d.rivalSkill-.10+wave*.20)));}
 scoreRival(note){if(!note||note.rivalScored)return;note.rivalScored=true;this.rivalScore+=this.rivalGainFor(note);}
 rankFor(ratio,misses,maxCombo){if(ratio>=1.18&&misses<=2&&maxCombo>=18)return'S';if(ratio>=1.04&&misses<=6)return'A';if(ratio>=.90)return'B';if(ratio>=.75)return'C';return'D';}
 computeGrandResult(){const h=this.duelHistory;const score=h.reduce((a,x)=>a+x.score,0),rival=h.reduce((a,x)=>a+x.rivalScore,0),perfects=h.reduce((a,x)=>a+x.perfects,0),goods=h.reduce((a,x)=>a+x.goods,0),misses=h.reduce((a,x)=>a+x.misses,0),notes=h.reduce((a,x)=>a+x.notes,0),specials=h.reduce((a,x)=>a+(x.specialHits||0),0),maxCombo=Math.max(0,...h.map(x=>x.maxCombo)),maxHype=Math.max(0,...h.map(x=>x.maxHype));const ratio=score/Math.max(1,rival);return{score,rival,perfects,goods,misses,notes,specials,maxCombo,maxHype,ratio,rank:this.rankFor(ratio,misses,maxCombo)};}
 startSecurityIntro(){this.mode='securityIntro';this.securityIntroAt=performance.now();window.soundSystem?.stopMusic?.();window.soundSystem?.playSound?.('clubLevelComplete');log('[CLUB] SECURITY INTRO');}
 startDuel(i,skipIntro=false){this.duel=i;this.activeDancer=this.playerChoice===1?'crist':'joao';this.choiceConfirmed=true;this.notes=[];this.score=0;this.rivalScore=0;this.combo=0;this.hype=50;this.maxHype=50;this.maxCombo=0;this.perfectChain=0;this.bestPerfectChain=0;this.perfects=0;this.goods=0;this.misses=0;this.result=null;this.spawned=0;this.feverUntil=0;this.feverTriggered=false;this.currentDanceState='dance_idle';this.stateUntil=0;this.feedbackText='';this.feedbackUntil=0;this.laneFlashUntil={left:0,up:0,down:0,right:0};this.specialHits=0;window.soundSystem?.stopMusic?.();if(skipIntro){this.beginDuelPlay();return;}this.mode='duelIntro';this.duelIntroAt=performance.now();window.soundSystem?.playSound?.('clubMenuSelect');log('[DANCE] DUEL INTRO');}
 beginDuelPlay(){this.mode='dance';this.duelIntroAt=0;this.spawnAt=performance.now()+850;window.soundSystem?.stopMusic?.();window.soundSystem?.startMusic?.(this.duel===0?'city':this.duel===1?'casino':'fast');log('[DANCE] START DUEL');}
 drawDuelIntro(ctx,now){const d=DUELS[this.duel],elapsed=now-this.duelIntroAt,active=this.getSelectedDanceName();this.drawActors(ctx,now);ctx.fillStyle='rgba(0,0,0,.86)';ctx.fillRect(120,110,760,390);ctx.strokeStyle='#ff42d0';ctx.lineWidth=4;ctx.strokeRect(120,110,760,390);ctx.textAlign='center';ctx.fillStyle='#55f4ff';ctx.font='bold 28px monospace';ctx.fillText(`DUELO ${this.duel+1}/3`,500,158);ctx.font='bold 42px monospace';ctx.fillStyle='#fff';ctx.fillText(active,320,245);ctx.fillStyle='#ffe85a';ctx.font='bold 62px monospace';ctx.fillText('VS',500,255);ctx.fillStyle='#ff7ae7';ctx.font='bold 36px monospace';ctx.fillText(d.name,680,245);const challenge=this.duel===0?'AQUECIMENTO • SIGA O RITMO':this.duel===1?'ATENÇÃO ÀS NOTAS DUPLAS':'BOSS DA PISTA • RITMO MÁXIMO';ctx.fillStyle='#ffd65a';ctx.font='bold 19px monospace';ctx.fillText(challenge,500,335);ctx.fillStyle='#aaa';ctx.font='15px sans-serif';ctx.fillText('As notas devem entrar na faixa amarela no tempo certo.',500,380);ctx.fillStyle='#8ff';ctx.fillText(elapsed>650?'ENTER/ESPAÇO ou toque para começar':'PREPARE-SE...',500,450);if(elapsed>3500)this.beginDuelPlay();}
 updateDance(ctx,dt,now){
  const d=DUELS[this.duel],interval=60000/d.bpm;this.updateFever(now);
  while(this.spawned<d.notes&&now>=this.spawnAt){
    const baseLane=d.pattern[this.spawned%d.pattern.length];
    const noteIndex=this.spawned;const specialType=this.duel>0&&noteIndex>4&&noteIndex%11===0?'gold':(this.duel===2&&noteIndex>8&&noteIndex%13===0?'avoid':'normal');
    this.notes.push({lane:baseLane,y:82,hit:false,index:noteIndex,rivalScored:false,type:specialType});this.spawned++;log('[DANCE] NOTE SPAWN');
    // Nos duelos 2 e 3 algumas batidas formam pares de duas setas na mesma linha.
    const accent=this.duel>0&&this.spawned<d.notes&&((this.spawned+(this.duel*2))%(this.duel===1?9:7)===0);
    if(accent){let lane=d.pattern[(this.spawned+3)%d.pattern.length];if(lane===baseLane)lane=LANES[(LANES.indexOf(baseLane)+2)%LANES.length];const group=`double-${this.duel}-${this.spawned}`;const prev=this.notes[this.notes.length-1];if(prev)prev.group=group;this.notes.push({lane,y:82,hit:false,index:this.spawned,rivalScored:false,group});this.spawned++;}
    this.spawnAt+=interval*(this.duel===2&&this.spawned%8===0?.62:1);
  }
  for(const n of this.notes)n.y+=d.speed*dt;
  for(const n of this.notes){if(!n.hit&&n.y>505){n.hit=true;if(n.type==='avoid'){this.score+=350;this.hype=Math.min(100,this.hype+2);this.specialHits++;this.setFeedback('DESVIO!',420);}else{this.scoreRival(n);this.miss(true);}}}
  this.notes=this.notes.filter(n=>!n.hit||n.y<560);this.drawDance(ctx,d,now);
  if(this.spawned>=d.notes&&this.notes.every(n=>n.hit)){
    const ratio=this.score/Math.max(1,d.notes*1000),rivalRatio=this.score/Math.max(1,this.rivalScore);
    const win=ratio>=d.threshold&&this.score>=this.rivalScore*.94;
    this.result={win,ratio,rivalRatio,rank:this.rankFor(rivalRatio,this.misses,this.maxCombo)};this.mode='result';log('[DANCE] DUEL COMPLETE');
  }
 }
 drawDance(ctx,d,now){
  const xs={left:300,up:430,down:570,right:700};
  // Cabeçalho deixa explícito que esta tela é um duelo e quem é o adversário.
  ctx.fillStyle='rgba(3,4,12,.92)';ctx.fillRect(165,8,670,46);ctx.strokeStyle='#ff42d0';ctx.lineWidth=2;ctx.strokeRect(165,8,670,46);
  const activeKey=this.getSelectedDanceKey(), activeName=this.getSelectedDanceName();
  ctx.textAlign='center';ctx.fillStyle='#ffe65a';ctx.font='bold 19px monospace';ctx.fillText(`DUELO ${this.duel+1}/3  •  ${activeName}  VS  ${d.name}`,500,37);
  const duelMax=Math.max(d.notes*1000,this.score,this.rivalScore,1),playerPct=Math.min(1,this.score/duelMax),rivalPct=Math.min(1,this.rivalScore/duelMax);
  ctx.fillStyle='rgba(0,0,0,.76)';ctx.fillRect(18,64,170,46);ctx.fillRect(812,64,170,46);
  ctx.fillStyle='#55f4ff';ctx.fillRect(25,91,156*playerPct,10);ctx.fillStyle='#ff5dbd';ctx.fillRect(819,91,156*rivalPct,10);
  ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.strokeRect(25,91,156,10);ctx.strokeRect(819,91,156,10);
  ctx.font='bold 12px monospace';ctx.fillStyle='#fff';ctx.textAlign='left';ctx.fillText(`${activeName} ${this.score}`,25,82);ctx.textAlign='right';ctx.fillText(`${d.name} ${this.rivalScore}`,975,82);

  // Pista central. Os duelistas ficam fora deste painel para nunca serem encobertos.
  ctx.fillStyle='rgba(0,0,0,.64)';ctx.fillRect(205,62,590,448);
  for(const l of LANES){const flashed=now<(this.laneFlashUntil[l]||0);ctx.fillStyle=flashed?'rgba(60,235,255,.32)':'rgba(20,20,35,.76)';ctx.fillRect(xs[l]-43,70,86,423);if(flashed){ctx.strokeStyle='#fff36a';ctx.lineWidth=4;ctx.strokeRect(xs[l]-39,432,78,50);}ctx.fillStyle=flashed?'#fff36a':'#fff';ctx.font='bold 40px sans-serif';ctx.textAlign='center';ctx.fillText(GLYPH[l],xs[l],476);}
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
  const rivalLoop=this.duel===0?NPC_CROWD_LOOPS.neon:NPC_CROWD_LOOPS.muscular;
  if(rivalFrames?.length){const ri=this.getLoopValue(rivalLoop,Math.floor(now/(this.duel===2?90:125)),rivalFrames.length),im=rivalFrames[ri];if(im?.complete&&im.naturalWidth){const h=154,w=h*(im.naturalWidth/im.naturalHeight);ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(im,930-w/2,472-h+Math.sin(now/150)*3,w,h);ctx.restore();}}
  ctx.textAlign='center';ctx.font='bold 14px monospace';ctx.fillStyle='#55f4ff';ctx.fillText(activeName,105,505);ctx.fillStyle='#ff7ae7';ctx.fillText(d.name,905,505);

  for(const n of this.notes){ctx.fillStyle=n.type==='gold'?'#ffe85a':n.type==='avoid'?'#ff4b62':(n.group?'#ffe85a':'#55f4ff');ctx.font='bold 42px sans-serif';ctx.fillText(GLYPH[n.lane],xs[n.lane],n.y);if(n.type==='gold'){ctx.strokeStyle='#fff4a8';ctx.lineWidth=2;ctx.beginPath();ctx.arc(xs[n.lane],n.y-13,27,0,Math.PI*2);ctx.stroke();}if(n.type==='avoid'){ctx.fillStyle='#fff';ctx.font='bold 9px monospace';ctx.fillText('NÃO APERTE',xs[n.lane],n.y-28);}if(n.group){ctx.font='bold 10px monospace';ctx.fillStyle='#fff';ctx.fillText('2X',xs[n.lane],n.y-31);}}

  // Progresso do duelo: notas já lançadas/concluídas versus total.
  const completed=Math.max(0,Math.min(d.notes,(this.spawned||0)-this.notes.filter(n=>!n.hit).length));
  const progress=Math.max(0,Math.min(1,completed/Math.max(1,d.notes)));
  ctx.fillStyle='rgba(0,0,0,.75)';ctx.fillRect(245,514,510,24);ctx.fillStyle='#25263b';ctx.fillRect(250,519,500,14);ctx.fillStyle='#42f5b3';ctx.fillRect(250,519,500*progress,14);ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.strokeRect(250,519,500,14);
  ctx.fillStyle='#fff';ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.fillText(`PROGRESSO ${completed}/${d.notes}`,500,550);

  ctx.fillStyle='#fff';ctx.font='bold 16px monospace';ctx.textAlign='left';ctx.fillText(`HYPE ${Math.round(this.hype)}${this.isFever(now)?' FEVER':''}   COMBO x${this.combo}   SCORE ${this.score}`,250,588);
  if(this.hype>=75){ctx.fillStyle=this.isFever(now)?'#fff36a':'#ff8ce6';ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.fillText(this.isFever(now)?'FEVER MODE • PONTOS x1.5':'A PISTA ESTÁ PEGANDO FOGO!',500,572);}
  for(let i=0;i<4;i++){ctx.fillStyle='rgba(10,10,20,.92)';ctx.fillRect(230+i*140,598,125,45);ctx.strokeStyle='#45e9ff';ctx.strokeRect(230+i*140,598,125,45);ctx.fillStyle='#fff';ctx.font='bold 27px sans-serif';ctx.textAlign='center';ctx.fillText(GLYPH[LANES[i]],292+i*140,631);}
  if(this.feedbackText&&now<this.feedbackUntil){const pulse=1+.08*Math.sin(now/45);ctx.save();ctx.translate(500,235);ctx.scale(pulse,pulse);ctx.fillStyle=(this.feedbackText==='PERFEITO'||this.feedbackText==='FEVER!')?'#ffe85a':(this.feedbackText==='BOM'?'#7efbff':'#ff667e');ctx.font='bold 38px monospace';ctx.textAlign='center';ctx.fillText(this.feedbackText,0,0);ctx.restore();}if(now-this.lastPerfectAt<130){ctx.fillStyle=`rgba(255,245,120,${.18*(1-(now-this.lastPerfectAt)/130)})`;ctx.fillRect(0,0,W,H);}
 }
 hit(lane){
  const now=performance.now();this.lastInputLane=lane;const target=this.notes.filter(n=>!n.hit&&n.lane===lane).sort((a,b)=>Math.abs(a.y-460)-Math.abs(b.y-460))[0];
  if(!target||Math.abs(target.y-460)>55){this.miss(false);return;}
  const diff=Math.abs(target.y-460);target.hit=true;this.laneFlashUntil[lane]=now+180;if(target.type==='avoid'){this.scoreRival(target);this.cameraKickUntil=now+180;this.cameraKickPower=5;this.miss(false);return;}if(target.type==='gold'){this.hype=Math.min(100,this.hype+10);this.score+=500;this.specialHits++;this.setFeedback('HYPE +10',520);}this.scoreRival(target);const mult=this.playerMultiplier(now);
  if(diff<=22){this.score+=Math.round(1000*(1+Math.min(3,Math.floor(this.combo/10)))*mult);this.combo++;this.hype=Math.min(100,this.hype+3.2);this.perfects++;this.lastPerfectAt=now;this.cameraKickUntil=now+105;this.cameraKickPower=2.4;this.perfectChain++;this.bestPerfectChain=Math.max(this.bestPerfectChain,this.perfectChain);window.soundSystem?.playSound?.('clubPerfect');this.setFeedback('PERFEITO');this.setDanceState(this.combo>=6?'dance_combo':`dance_${lane}`,this.combo>=6?760:520);log('[DANCE] PERFECT');}
  else{this.score+=Math.round(650*mult);this.combo++;this.hype=Math.min(100,this.hype+1.8);this.goods++;this.perfectChain=0;window.soundSystem?.playSound?.('clubCombo');this.setFeedback('BOM');this.setDanceState(this.combo>=6?'dance_combo':`dance_${lane}`,this.combo>=6?700:480);log('[DANCE] GOOD');}
  this.maxCombo=Math.max(this.maxCombo,this.combo);this.maxHype=Math.max(this.maxHype,this.hype);if(this.hype>=100&&!this.isFever(now))this.triggerFever(now);
 }
 miss(fromExpired=false){this.combo=0;this.perfectChain=0;this.misses++;this.hype=Math.max(0,this.hype-(fromExpired?5:6));this.setFeedback('ERRO');this.setDanceState('dance_down',320);window.soundSystem?.playSound?.('clubHit');log('[DANCE] MISS');}
 drawResult(ctx){
  this.drawActors(ctx,performance.now());const d=DUELS[this.duel],r=this.result||{};ctx.fillStyle='rgba(0,0,0,.86)';ctx.fillRect(155,115,690,410);ctx.strokeStyle=r.win?'#4dff8c':'#ff5a70';ctx.lineWidth=3;ctx.strokeRect(155,115,690,410);ctx.textAlign='center';ctx.fillStyle=r.win?'#4dff8c':'#ff5a70';ctx.font='bold 44px monospace';ctx.fillText(r.win?'DUELO VENCIDO!':'RIVAL VENCEU',500,182);ctx.fillStyle='#ffe85a';ctx.font='bold 52px monospace';ctx.fillText(`RANK ${r.rank||'D'}`,500,245);ctx.fillStyle='#fff';ctx.font='18px monospace';ctx.fillText(`${this.getSelectedDanceName()} ${this.score}  ×  ${this.rivalScore} ${d.name}`,500,290);ctx.fillText(`PERFEITOS ${this.perfects}  •  BONS ${this.goods}  •  ERROS ${this.misses}`,500,330);ctx.fillText(`COMBO MÁX. ${this.maxCombo}  •  HYPE MÁX. ${Math.round(this.maxHype)}%`,500,366);ctx.fillStyle='#8ff';ctx.font='16px sans-serif';ctx.fillText(r.win?(this.duel<2?'ENTER: próximo duelo':'ENTER: resultado final'):'ENTER: tentar novamente',500,460);
 }
 resolveResult(){
  if(!this.result?.win){this.startDuel(this.duel,true);return;}
  const d=DUELS[this.duel];this.duelHistory[this.duel]={duel:this.duel,name:d.name,score:this.score,rivalScore:this.rivalScore,perfects:this.perfects,goods:this.goods,misses:this.misses,maxCombo:this.maxCombo,maxHype:this.maxHype,notes:d.notes,specialHits:this.specialHits,rank:this.result.rank};this.saveDuel();
  if(this.duel<2)this.startDuel(this.duel+1);else{this.grandResult=this.computeGrandResult();try{this.newClubRecord=!!window.saveSystem?.recordClubRun?.(this.getSelectedDanceKey(),this.grandResult);}catch(_){this.newClubRecord=false;}this.mode='grandResult';window.soundSystem?.stopMusic?.();window.soundSystem?.startMusic?.('vegas');}
 }
 drawGrandResult(ctx){
  this.drawActors(ctx,performance.now());const g=this.grandResult||this.computeGrandResult();ctx.fillStyle='rgba(0,0,0,.9)';ctx.fillRect(125,70,750,510);ctx.strokeStyle='#ffe85a';ctx.lineWidth=4;ctx.strokeRect(125,70,750,510);ctx.textAlign='center';ctx.fillStyle='#55f4ff';ctx.font='bold 28px monospace';ctx.fillText('RESULTADO — NOITE NA BOATE',500,118);ctx.fillStyle='#ffe85a';ctx.font='bold 82px monospace';ctx.fillText(g.rank,500,205);ctx.fillStyle='#fff';ctx.font='18px monospace';ctx.fillText(`SCORE TOTAL ${g.score}   •   RIVAIS ${g.rival}`,500,252);ctx.fillText(`PERFEITOS ${g.perfects}   •   BONS ${g.goods}   •   ERROS ${g.misses}`,500,292);ctx.fillText(`MELHOR COMBO ${g.maxCombo}   •   HYPE MÁXIMO ${Math.round(g.maxHype)}%`,500,332);ctx.fillText(`NOTAS ${Math.max(0,g.notes-g.misses)}/${g.notes}   •   ESPECIAIS ${g.specials||0}`,500,372);if(this.newClubRecord){ctx.fillStyle='#fff36a';ctx.font='bold 20px monospace';ctx.fillText('★ NOVO RECORDE DO PERSONAGEM ★',500,405);}const msg=g.rank==='S'?'A PISTA É SUA.':g.rank==='A'?'SHOW DE DANÇA!':g.rank==='B'?'MANDOU BEM!':'DÁ PARA MELHORAR.';ctx.fillStyle='#ff8ce6';ctx.font='bold 24px monospace';ctx.fillText(msg,500,430);ctx.fillStyle='#8ff';ctx.font='16px sans-serif';ctx.fillText('ENTER/ESPAÇO • continuar',500,528);
 }
 drawSecurityIntro(ctx,now){
  const elapsed=now-this.securityIntroAt;ctx.save();ctx.fillStyle=`rgba(255,255,255,${elapsed<450?.22:0})`;ctx.fillRect(0,0,W,H);ctx.restore();const img=this.securityIdle;if(img?.complete&&img.naturalWidth){const h=190,w=h*(img.naturalWidth/img.naturalHeight),slide=Math.min(1,elapsed/1400);const lx=-w/2+(120+w/2)*slide,rx=W+w/2-(120+w/2)*slide;ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(img,lx-w/2,500-h,w,h);ctx.translate(rx,0);ctx.scale(-1,1);ctx.drawImage(img,-w/2,500-h,w,h);ctx.restore();}ctx.fillStyle='rgba(0,0,0,.82)';ctx.fillRect(160,165,680,210);ctx.strokeStyle='#ff4f63';ctx.lineWidth=3;ctx.strokeRect(160,165,680,210);ctx.textAlign='center';ctx.fillStyle='#ff596d';ctx.font='bold 34px monospace';ctx.fillText('SEGURANÇA DE VEGAS',500,220);ctx.fillStyle='#fff';ctx.font='22px monospace';ctx.fillText(elapsed<1500?'A FESTA ACABOU.':'AGORA O RITMO É OUTRO.',500,275);ctx.fillStyle='#ffd65a';ctx.font='15px sans-serif';ctx.fillText(elapsed>850?'ENTER/ESPAÇO para começar a luta':'...',500,335);if(elapsed>4200)this.beginCombat();
 }
 saveDuel(){try{if(window.saveSystem?.recordClubDuel)window.saveSystem.recordClubDuel(this.duel,{hype:this.hype,combo:this.maxCombo,score:this.score,perfectChain:this.bestPerfectChain,misses:this.misses});}catch(_){} if(this.duel===2)this.unlock('club_dance_king');if(this.bestPerfectChain>=20)this.unlock('club_perfect_steps');if(this.misses===0)this.unlock('club_no_miss');}
 unlock(id){const ts=window.trophySystem;if(!ts)return;const t=ts.trophies?.find(x=>x.id===id);if(t)ts.unlockTrophy?.(t);}
 makeLevel(){return {id:'club',name:'Noite na Boate',description:'Confusão na pista',width:1800,height:650,nextLevel:6,enemyCount:0,enemyTypes:['club_security'],useWaves:false,hasBoss:false,getGround(){return 500;},getPlatforms(){return[];},drawBackground:(ctx)=>this.drawClub(ctx,performance.now()),dispose(){}};}
 beginCombat(){if(this.mode==='combat')return;this.mode='combat';this.securityIntroAt=0;this.wave=0;this.waveSpawned=false;this.bossSpawned=false;window.soundSystem?.stopMusic?.();window.soundSystem?.startMusic?.('assassin');window.enemies.length=0;window.particles.length=0;window.powerUps.length=0;window.destructibles.length=0;window.currentLevel=this.makeLevel();window.cameraX=0;const fighter=this.ensureSelectedCombatPlayer();if(fighter){fighter.x=220;fighter.y=window.currentLevel.getGround()-fighter.h;fighter.life=Math.max(1,fighter.life);}if(typeof window.setClubCombatState==='function')window.setClubCombatState();this.spawnNextWave();log(`[CLUB] SECURITY FIGHT START • ${this.getSelectedDanceName()} • progresso da história carregado`);}
 spawnNextWave(){this.wave++;const enemies=window.enemies||[];const make=(strong=false,boss=false,x=900)=>{let e=null;try{e=EnemyFactory.create(x,window.currentLevel.getGround(),'club_security');}catch(_){}if(!e)return;e.x=x;e.y=window.currentLevel.getGround()-(e.h||60);if(strong){e.maxLife=Math.round((e.maxLife||100)*1.55);e.life=e.maxLife;e.damage=Math.round((e.damage||10)*1.2);}if(boss){e.isBoss=true;e.name='CHEFE DA SEGURANÇA DE VEGAS';e.maxLife=Math.round((e.maxLife||120)*2.4);e.life=e.maxLife;e.damage=Math.round((e.damage||12)*1.45);e.score=1500;e.__clubBoss=true;e.__clubBossBaseSpeed=e.speed;e.__clubBossBaseDamage=e.damage;}enemies.push(e);};if(this.wave===1){make(false,false,760);make(false,false,980);}else if(this.wave===2){make(false,false,700);make(false,false,900);make(false,false,1100);}else if(this.wave===3){make(true,false,720);make(true,false,980);make(true,true,1180);this.bossSpawned=true;}this.waveSpawned=true;}
 postCombatFrame(){if(!this.active||this.mode!=='combat')return;const list=alive(window.enemies);if(list.length)return;if(this.wave<3){this.spawnNextWave();return;}this.mode='finalCut';this.dialogIndex=0;if(typeof window.setClubSequenceState==='function')window.setClubSequenceState();window.soundSystem?.stopMusic?.();window.soundSystem?.startMusic?.('vegas');this.unlock('club_security_max');try{window.saveSystem?.recordClubComplete?.({boss:true});}catch(_){}log('[CLUB] BOSS DEFEATED');}
 finish(){try{window.saveSystem?.recordClubComplete?.({boss:true});}catch(_){}log('[CLUB] LEVEL COMPLETE');const standalone=!!this.standalone;this.dispose(false);if(standalone&&typeof window.returnFromClubBonus==='function')window.returnFromClubBonus(this.returnTo);else if(typeof window.continueAfterClub==='function')window.continueAfterClub();}
 dispose(release=true){this.listeners.splice(0).forEach(fn=>{try{fn();}catch(_){}});this.notes.length=0;this.active=false;this.mode='idle';this.feedbackText='';this.currentDanceState='dance_idle';this.activeDancer='joao';this.rivalScore=0;this.feverUntil=0;this.duelHistory=[];this.grandResult=null;this.securityIntroAt=0;this.duelIntroAt=0;this.newClubRecord=false;this.cameraKickUntil=0;this.specialHits=0;this.standalone=false;this.returnTo='stage_select';if(release)window.levelManager?.releaseBonus?.('club');}
}
window.clubSequence=new ClubSequence();
})();
