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
const JOAO_DANCE_SHEET='assets/bonus/boate/players/joao/dance-sheet.png';
const CLUB_BG='assets/bonus/boate/backgrounds/noite-na-boate.png';
const NPC_MUSCULAR=Array.from({length:5},(_,i)=>`assets/bonus/boate/npcs/muscular/dance-${i+1}.webp`);
const NPC_NEON=Array.from({length:6},(_,i)=>`assets/bonus/boate/npcs/neon/dance-${i+1}.webp`);
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
function log(msg){ if(window.DEV) window.GameDebugConsole?.log?.(msg); }
function alive(arr){return (arr||[]).filter(e=>e && !e.dead && (e.life==null||e.life>0));}
class ClubSequence{
 constructor(){
  this.active=false;this.mode='idle';this.duel=0;this.notes=[];this.score=0;this.combo=0;this.maxCombo=0;this.hype=50;this.perfectChain=0;this.bestPerfectChain=0;this.misses=0;this.spawnAt=0;this.startedAt=0;this.last=0;this.result=null;this.dialogIndex=0;this.wave=0;this.waveSpawned=false;this.bossSpawned=false;this.touch={};this.listeners=[];this.returnLevel=null;this.returnIndex=5;this.playerChoice=0;this.choiceConfirmed=false;this.padPrev=[false,false,false,false,false];
  this.joaoDanceSheet=window.assetManager?.image?.(JOAO_DANCE_SHEET,'bonus:club',{defer:true})||null;
  this.clubBg=window.assetManager?.image?.(CLUB_BG,'bonus:club',{defer:true})||null;
  this.npcMuscular=NPC_MUSCULAR.map(src=>window.assetManager?.image?.(src,'bonus:club',{defer:true})).filter(Boolean);
  this.npcNeon=NPC_NEON.map(src=>window.assetManager?.image?.(src,'bonus:club',{defer:true})).filter(Boolean);
  this.joaoDanceCanvas=null; this.joaoDancePrepared=false;
  this.currentDanceState='dance_idle';this.stateUntil=0;this.feedbackText='';this.feedbackUntil=0;this.lastInputLane='down';
 }
 ensureAssets(){
  if(!this.joaoDanceSheet) this.joaoDanceSheet=window.assetManager?.image?.(JOAO_DANCE_SHEET,'bonus:club',{defer:true})||null;
  if(!this.clubBg) this.clubBg=window.assetManager?.image?.(CLUB_BG,'bonus:club',{defer:true})||null;
  window.assetManager?.loadImage?.(JOAO_DANCE_SHEET,'bonus:club').then(()=>this.prepareJoaoDanceSheet()).catch(()=>{});
  window.assetManager?.loadImage?.(CLUB_BG,'bonus:club').catch(()=>{});
  NPC_MUSCULAR.forEach(src=>window.assetManager?.loadImage?.(src,'bonus:club').catch(()=>{}));
  NPC_NEON.forEach(src=>window.assetManager?.loadImage?.(src,'bonus:club').catch(()=>{}));
 }
 prepareJoaoDanceSheet(){
  if(this.joaoDancePrepared||!this.joaoDanceSheet||!this.joaoDanceSheet.complete||!this.joaoDanceSheet.naturalWidth) return;
  const src=this.joaoDanceSheet; const canvas=document.createElement('canvas');
  canvas.width=src.naturalWidth; canvas.height=src.naturalHeight;
  const ictx=canvas.getContext('2d'); ictx.drawImage(src,0,0);
  const img=ictx.getImageData(0,0,canvas.width,canvas.height); const data=img.data;
  for(let i=0;i<data.length;i+=4){ const r=data[i],g=data[i+1],b=data[i+2],a=data[i+3]; if(a && r<18 && g<18 && b<18){ data[i+3]=0; } }
  ictx.putImageData(img,0,0); this.joaoDanceCanvas=canvas; this.joaoDancePrepared=true;
 }
 start(){
  this.dispose(false);this.ensurePlayers();this.ensureAssets();this.active=true;this.mode='arrival';this.startedAt=performance.now();this.last=this.startedAt;this.dialogIndex=0;this.wave=0;this.choiceConfirmed=false;
  this.currentDanceState='dance_idle';this.stateUntil=0;this.feedbackText='';this.feedbackUntil=0;
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
 setDanceState(state,duration=220){ this.currentDanceState=state; this.stateUntil=performance.now()+duration; }
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
 }
 isJoao(player){ return !!player && String(player.name||'').toLowerCase().includes('joão'); }
 drawFittedFrame(ctx,img,frame,x,y,w,h){
  if(!img||!frame) return false; const [sx,sy,sw,sh]=frame; if(sw<=0||sh<=0) return false;
  const ratio=Math.min(w/sw,h/sh),dw=sw*ratio,dh=sh*ratio,dx=x+(w-dw)/2,dy=y+h-dh;
  ctx.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh); return true;
 }
 drawJoaoClubSprite(ctx,x,y,state,now){
  const img=this.joaoDancePrepared?this.joaoDanceCanvas:this.joaoDanceSheet;
  const frames=JOAO_DANCE_FRAMES[state]||JOAO_DANCE_FRAMES.dance_idle; if(!img||!frames?.length) return false;
  const speed=state==='dance_combo'?80:(state==='dance_win'||state==='dance_lose'?140:120);
  const idx=Math.floor(now/speed)%frames.length;
  return this.drawFittedFrame(ctx,img,frames[idx],x,y,140,165);
 }
 drawActors(ctx,now){
  const ps=window.players||[];
  ps.slice(0,2).forEach((p,i)=>{
    const boxX=235+i*250+Math.sin(now/140+i)*4, boxY=320;
    const state=(this.mode==='dance'||this.mode==='result')?this.getDanceState(now):'dance_idle';
    if(this.isJoao(p)&&this.drawJoaoClubSprite(ctx,boxX,boxY,state,now)) return;
    if(!p?.draw) return; const old={x:p.x,y:p.y}; p.x=310+i*250+Math.sin(now/140+i)*5; p.y=405; try{p.draw(ctx);}catch(_){} p.x=old.x;p.y=old.y;
  });
 }
 dialogs(){if(this.mode==='arrival')return [['JOÃO','Chegamos. E isso aqui tem mais neon que Las Vegas inteira.'],['CRIST','Só não inventa de desafiar ninguém.'],['RIVAL','Vocês dois! A pista quer saber se sabem dançar.'],['JOÃO','Então aumenta o som.']];if(this.mode==='securityCut')return [['SEGURANÇA','A festa acabou para vocês.'],['CRIST','Tecnicamente, a gente só estava dançando.'],['JOÃO','Agora acho que vai mudar o ritmo.']];return [['CRIST','Da próxima vez escolhemos um lugar mais tranquilo.'],['JOÃO','Mas admite: a pista foi nossa.'],['SISTEMA','FASE CONCLUÍDA']];}
 drawDialog(ctx){this.drawActors(ctx,performance.now());const d=this.dialogs()[this.dialogIndex]||this.dialogs()[0];ctx.fillStyle='rgba(0,0,0,.84)';ctx.fillRect(70,500,860,115);ctx.strokeStyle='#56f5ff';ctx.lineWidth=3;ctx.strokeRect(70,500,860,115);ctx.fillStyle='#ffd65a';ctx.font='bold 22px monospace';ctx.textAlign='left';ctx.fillText(d[0],95,532);ctx.fillStyle='#fff';ctx.font='18px sans-serif';ctx.fillText(d[1],95,568);ctx.fillStyle='#8ff';ctx.font='14px sans-serif';ctx.fillText('ENTER/ESPAÇO • toque na tela para avançar',95,598);}
 advanceDialog(){const ds=this.dialogs();if(this.dialogIndex<ds.length-1){this.dialogIndex++;return;}this.dialogIndex=0;if(this.mode==='arrival')this.mode='choose';else if(this.mode==='securityCut')this.beginCombat();else if(this.mode==='finalCut')this.finish();}
 drawChoose(ctx){this.drawActors(ctx,performance.now());ctx.fillStyle='rgba(0,0,0,.78)';ctx.fillRect(210,205,580,240);ctx.fillStyle='#fff';ctx.font='bold 30px monospace';ctx.textAlign='center';ctx.fillText('QUEM VAI PARA A PISTA?',500,255);['JOÃO','CRIST'].forEach((n,i)=>{ctx.fillStyle=this.playerChoice===i?'#40f5ff':'#252535';ctx.fillRect(285+i*230,300,200,82);ctx.fillStyle=this.playerChoice===i?'#001015':'#fff';ctx.font='bold 24px monospace';ctx.fillText(n,385+i*230,350);});ctx.fillStyle='#ddd';ctx.font='16px sans-serif';ctx.fillText('← → para escolher • ENTER para confirmar',500,415);}
 startDuel(i){this.duel=i;this.mode='dance';this.notes=[];this.score=0;this.combo=0;this.hype=50;this.maxCombo=0;this.perfectChain=0;this.bestPerfectChain=0;this.misses=0;this.result=null;this.spawned=0;this.spawnAt=performance.now()+700;this.currentDanceState='dance_idle';this.stateUntil=0;this.feedbackText='';this.feedbackUntil=0;window.soundSystem?.stopMusic?.();window.soundSystem?.startMusic?.(i===0?'city':i===1?'casino':'fast');log('[DANCE] START DUEL');}
 updateDance(ctx,dt,now){const d=DUELS[this.duel],interval=60000/d.bpm;while(this.spawned<d.notes&&now>=this.spawnAt){const burst=this.duel===0?1:(Math.random()<.22?2:1);for(let b=0;b<burst&&this.spawned<d.notes;b++){const lane=LANES[(Math.random()*4)|0];this.notes.push({lane,y:82,hit:false});this.spawned++;log('[DANCE] NOTE SPAWN');}this.spawnAt+=interval*(this.duel===2&&Math.random()<.25?.55:1);}for(const n of this.notes)n.y+=d.speed*dt;for(const n of this.notes){if(!n.hit&&n.y>505){n.hit=true;this.miss();}}this.notes=this.notes.filter(n=>!n.hit||n.y<560);this.drawDance(ctx,d,now);if(this.spawned>=d.notes&&this.notes.every(n=>n.hit)){const ratio=this.score/Math.max(1,d.notes*1000);this.result={win:ratio>=d.threshold,ratio};this.mode='result';log('[DANCE] DUEL COMPLETE');}}
 drawDance(ctx,d,now){this.drawActors(ctx,now);const xs={left:275,up:425,down:575,right:725};ctx.fillStyle='rgba(0,0,0,.56)';ctx.fillRect(180,35,640,480);for(const l of LANES){ctx.fillStyle='rgba(20,20,35,.72)';ctx.fillRect(xs[l]-48,55,96,445);ctx.fillStyle='#fff';ctx.font='bold 44px sans-serif';ctx.textAlign='center';ctx.fillText(GLYPH[l],xs[l],480);}ctx.strokeStyle='#ffe34f';ctx.lineWidth=5;ctx.strokeRect(205,432,590,60);for(const n of this.notes){ctx.fillStyle='#55f4ff';ctx.font='bold 42px sans-serif';ctx.fillText(GLYPH[n.lane],xs[n.lane],n.y);}ctx.fillStyle='#fff';ctx.font='bold 18px monospace';ctx.textAlign='left';ctx.fillText(`${d.name}  HYPE ${Math.round(this.hype)}  COMBO x${this.combo}  SCORE ${this.score}`,45,28);ctx.textAlign='center';ctx.font='16px sans-serif';ctx.fillText('CELULAR: toque nos 4 botões na parte inferior',500,540);for(let i=0;i<4;i++){ctx.fillStyle='rgba(10,10,20,.9)';ctx.fillRect(170+i*165,555,150,72);ctx.strokeStyle='#45e9ff';ctx.strokeRect(170+i*165,555,150,72);ctx.fillStyle='#fff';ctx.font='bold 38px sans-serif';ctx.fillText(GLYPH[LANES[i]],245+i*165,603);} if(this.feedbackText&&now<this.feedbackUntil){ctx.fillStyle=this.feedbackText==='PERFEITO'?'#ffe85a':(this.feedbackText==='BOM'?'#7efbff':'#ff667e');ctx.font='bold 42px monospace';ctx.fillText(this.feedbackText,500,220);} }
 hit(lane){const now=performance.now(); this.lastInputLane=lane; const target=this.notes.filter(n=>!n.hit&&n.lane===lane).sort((a,b)=>Math.abs(a.y-460)-Math.abs(b.y-460))[0];if(!target||Math.abs(target.y-460)>55){this.miss();return;}const diff=Math.abs(target.y-460);target.hit=true;if(diff<=22){this.score+=1000*(1+Math.min(3,Math.floor(this.combo/10)));this.combo++;this.hype=Math.min(100,this.hype+3);this.perfectChain++;this.bestPerfectChain=Math.max(this.bestPerfectChain,this.perfectChain);window.soundSystem?.playSound?.('clubPerfect');this.setFeedback('PERFEITO');this.setDanceState(this.combo>=6?'dance_combo':`dance_${lane}`,this.combo>=6?280:180);log('[DANCE] PERFECT');}else{this.score+=650;this.combo++;this.hype=Math.min(100,this.hype+1.5);this.perfectChain=0;window.soundSystem?.playSound?.('clubCombo');this.setFeedback('BOM');this.setDanceState(this.combo>=6?'dance_combo':`dance_${lane}`,this.combo>=6?260:170);log('[DANCE] GOOD');}this.maxCombo=Math.max(this.maxCombo,this.combo);}
 miss(){this.combo=0;this.perfectChain=0;this.misses++;this.hype=Math.max(0,this.hype-6);this.setFeedback('ERRO');this.setDanceState('dance_down',180);window.soundSystem?.playSound?.('clubHit');log('[DANCE] MISS');}
 drawResult(ctx){this.drawActors(ctx,performance.now());const d=DUELS[this.duel];ctx.fillStyle='rgba(0,0,0,.82)';ctx.fillRect(180,150,640,350);ctx.textAlign='center';ctx.fillStyle=this.result?.win?'#4dff8c':'#ff5a70';ctx.font='bold 48px monospace';ctx.fillText(this.result?.win?'DUELO VENCIDO!':'QUASE LÁ!',500,225);ctx.fillStyle='#fff';ctx.font='22px sans-serif';ctx.fillText(`${d.name} • ${this.score} pts • combo ${this.maxCombo} • ${this.misses} erros`,500,285);ctx.fillText(this.result?.win?(this.duel<2?'ENTER: próximo duelo':'ENTER: continuar'):'ENTER: tentar novamente',500,390);}
 resolveResult(){if(!this.result?.win){this.startDuel(this.duel);return;}this.saveDuel();if(this.duel<2)this.startDuel(this.duel+1);else{this.mode='securityCut';this.dialogIndex=0;window.soundSystem?.stopMusic?.();window.soundSystem?.startMusic?.('assassin');}}
 saveDuel(){try{if(window.saveSystem?.recordClubDuel)window.saveSystem.recordClubDuel(this.duel,{hype:this.hype,combo:this.maxCombo,score:this.score,perfectChain:this.bestPerfectChain,misses:this.misses});}catch(_){} if(this.duel===2)this.unlock('club_dance_king');if(this.bestPerfectChain>=20)this.unlock('club_perfect_steps');if(this.misses===0)this.unlock('club_no_miss');}
 unlock(id){const ts=window.trophySystem;if(!ts)return;const t=ts.trophies?.find(x=>x.id===id);if(t)ts.unlockTrophy?.(t);}
 makeLevel(){return {id:'club',name:'Noite na Boate',description:'Confusão na pista',width:1800,height:650,nextLevel:6,enemyCount:0,enemyTypes:['club_security'],useWaves:false,hasBoss:false,getGround(){return 500;},getPlatforms(){return[];},drawBackground:(ctx)=>this.drawClub(ctx,performance.now()),dispose(){}};}
 beginCombat(){this.mode='combat';this.wave=0;this.waveSpawned=false;this.bossSpawned=false;window.soundSystem?.stopMusic?.();window.soundSystem?.startMusic?.('assassin');window.enemies.length=0;window.particles.length=0;window.powerUps.length=0;window.destructibles.length=0;window.currentLevel=this.makeLevel();window.cameraX=0;(window.players||[]).forEach((p,i)=>{p.x=220+i*80;p.y=window.currentLevel.getGround()-p.h;p.life=Math.max(1,p.life);});if(typeof window.setClubCombatState==='function')window.setClubCombatState();this.spawnNextWave();log('[CLUB] SECURITY FIGHT START');}
 spawnNextWave(){this.wave++;const enemies=window.enemies||[];const make=(strong=false,boss=false,x=900)=>{let e=null;try{e=EnemyFactory.create(x,window.currentLevel.getGround(),'club_security');}catch(_){}if(!e)return;e.x=x;e.y=window.currentLevel.getGround()-(e.h||60);if(strong){e.maxLife=Math.round((e.maxLife||100)*1.55);e.life=e.maxLife;e.damage=Math.round((e.damage||10)*1.2);}if(boss){e.isBoss=true;e.name='CHEFE DA SEGURANÇA';e.maxLife=Math.round((e.maxLife||120)*2.4);e.life=e.maxLife;e.damage=Math.round((e.damage||12)*1.45);e.score=1500;}enemies.push(e);};if(this.wave===1){make(false,false,760);make(false,false,980);}else if(this.wave===2){make(false,false,700);make(false,false,900);make(false,false,1100);}else if(this.wave===3){make(true,false,720);make(true,false,980);make(true,true,1180);this.bossSpawned=true;}this.waveSpawned=true;}
 postCombatFrame(){if(!this.active||this.mode!=='combat')return;const list=alive(window.enemies);if(list.length)return;if(this.wave<3){this.spawnNextWave();return;}this.mode='finalCut';this.dialogIndex=0;if(typeof window.setClubSequenceState==='function')window.setClubSequenceState();window.soundSystem?.stopMusic?.();window.soundSystem?.startMusic?.('vegas');this.unlock('club_security_max');try{window.saveSystem?.recordClubComplete?.({boss:true});}catch(_){}log('[CLUB] BOSS DEFEATED');}
 finish(){try{window.saveSystem?.recordClubComplete?.({boss:true});}catch(_){}log('[CLUB] LEVEL COMPLETE');this.dispose(false);if(typeof window.continueAfterClub==='function')window.continueAfterClub();}
 dispose(release=true){this.listeners.splice(0).forEach(fn=>{try{fn();}catch(_){}});this.notes.length=0;this.active=false;this.mode='idle';this.feedbackText='';this.currentDanceState='dance_idle';if(release)window.levelManager?.releaseBonus?.('club');}
}
window.clubSequence=new ClubSequence();
})();
