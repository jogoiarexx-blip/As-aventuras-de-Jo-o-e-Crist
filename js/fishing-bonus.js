// Bônus independente: Pescaria do Chico Fumaça + Boss Tubarão
(() => {
  'use strict';
  const W=1000,H=650,GROUND=530;
  const farmBg=new Image(); farmBg.src='assets/backgrounds/fazenda-16bit.webp';
  const chico=new Image(); chico.src='assets/npc/chico-fumaca-idle.webp';
  const sharkImgs={};
  ['idle','walk1','walk2','walk3','attack1','attack2','attack3','special','hurt','dead','roar'].forEach(k=>{const i=new Image();i.src=`assets/bosses/shark/${k}.webp`;sharkImgs[k]=i;});

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const rects=(a,b)=>a.x<a.x+a.w&&a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;

  class FishingBonusController{
    constructor(){this.active=false;this.state='intro';this.players=[];this.dialogIndex=0;this.dialogTime=0;this.progress=0;this.tension=25;this.pull=0;this.shark=null;this.resultTimer=0;this.last=performance.now();this.score=0;this.splash=0;this._acceptLast=false;}
    start(count=1){
      this.active=true;this.state='intro';this.dialogIndex=0;this.dialogTime=performance.now();this.progress=0;this.tension=24;this.pull=0;this.score=0;this.splash=0;this.resultTimer=0;this.last=performance.now();
      this.players=[];
      const p1=new PlayerJoao(240,GROUND,1);p1.x=245;p1.groundY=GROUND;p1.y=GROUND-p1.h;this.players.push(p1);
      if(count>1){const p2=new PlayerCrist(330,GROUND,2);p2.x=335;p2.groundY=GROUND;p2.y=GROUND-p2.h;this.players.push(p2);}
      this.shark={x:760,y:GROUND-165,w:150,h:165,life:count>1?1050:760,maxLife:count>1?1050:760,state:'idle',timer:0,cooldown:80,facingRight:false,flash:0,phase:1,chargeV:0,waveTimer:0,deadTimer:0};
      window.soundSystem?.stopMusic?.();
      window.GameDebugConsole?.info?.('[BÔNUS] Pescaria do Chico Fumaça iniciada');
    }
    action(pl,act,keys,gp,controls){return !!(controls?.acaoAtiva?.(pl,act,keys)||gp?.isActionDown?.(pl,act));}
    accept(keys,gp,controls){return !!keys?.enter||this.action(1,'attack',keys,gp,controls)||this.action(1,'ranged',keys,gp,controls);}
    drawBackdrop(ctx){
      if(farmBg.complete&&farmBg.naturalWidth){ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(farmBg,0,0,W,H);ctx.restore();}
      else {ctx.fillStyle='#88b958';ctx.fillRect(0,0,W,H);}
      // Açude
      const g=ctx.createLinearGradient(0,300,0,490);g.addColorStop(0,'#4fa6b9');g.addColorStop(.5,'#2d7c96');g.addColorStop(1,'#174f6b');ctx.fillStyle=g;ctx.fillRect(0,302,W,185);
      ctx.fillStyle='rgba(255,255,255,.18)';for(let x=0;x<W;x+=110)ctx.fillRect(x+(performance.now()/22)%110,338,52,3);
      // margem / deck
      ctx.fillStyle='#6f4d29';ctx.fillRect(150,460,430,22);ctx.fillStyle='#8e6539';for(let x=160;x<570;x+=42)ctx.fillRect(x,462,30,17);
      ctx.fillStyle='#4d351f';ctx.fillRect(180,482,12,74);ctx.fillRect(535,482,12,74);
      ctx.fillStyle='#77512b';ctx.fillRect(0,487,W,163);
      ctx.fillStyle='#5f8c3d';ctx.fillRect(0,487,W,18);
    }
    drawChico(ctx){if(chico.complete&&chico.naturalWidth){ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(chico,55,348,115,150);ctx.restore();}ctx.fillStyle='#fff2c8';ctx.font='bold 14px Righteous';ctx.textAlign='center';ctx.fillText('CHICO FUMAÇA',112,338);}
    drawDialog(ctx,name,text){ctx.fillStyle='rgba(5,7,10,.9)';ctx.strokeStyle='#e1a845';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(105,525,790,92,14);ctx.fill();ctx.stroke();ctx.fillStyle='#f3be55';ctx.font='bold 19px Bebas Neue';ctx.textAlign='left';ctx.fillText(name,130,553);ctx.fillStyle='#fff3d8';ctx.font='15px Righteous';ctx.fillText(text,130,581);ctx.fillStyle='#8fdcff';ctx.font='11px Righteous';ctx.textAlign='right';ctx.fillText('ATAQUE / ENTER para avançar',870,604);}
    updateIntro(ctx,keys,gp,controls){
      const lines=[
        ['CHICO FUMAÇA','O açude tá calmo hoje... mas eu não confiaria demais nisso.'],
        ['JOÃO','Depois da estrada inteira, eu só quero pescar em paz.'],
        ['CRIST','Se for tilápia, já valeu a viagem.'],
        ['CHICO FUMAÇA','Só não puxa com força demais se o anzol agarrar em alguma coisa grande...']
      ];
      const accept=this.accept(keys,gp,controls);if(accept&&!this._acceptLast){this.dialogIndex++;window.soundSystem?.playSound?.('menuSelect');if(this.dialogIndex>=lines.length){this.state='fishing';this.dialogIndex=0;}}
      this._acceptLast=accept;
      this.drawBackdrop(ctx);this.drawChico(ctx);this.players.forEach(p=>p.draw(ctx));if(this.state==='intro'){const l=lines[this.dialogIndex];this.drawDialog(ctx,l[0],l[1]);}
    }
    updateFishing(ctx,dt,keys,gp,controls){
      this.drawBackdrop(ctx);this.drawChico(ctx);this.players.forEach(p=>p.draw(ctx));
      // linha/boia
      ctx.strokeStyle='#e9e6d8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(320,455);ctx.quadraticCurveTo(460,400,605,390);ctx.stroke();ctx.fillStyle='#e64f3a';ctx.beginPath();ctx.arc(605,390,8,0,Math.PI*2);ctx.fill();
      const reel=this.accept(keys,gp,controls);
      this.pull+=dt*(.8+Math.random()*.9);const fishForce=35+Math.sin(this.pull*2.1)*24+Math.sin(this.pull*.73)*13;
      this.tension+=dt*(reel?34:-24)+dt*(fishForce-35)*.25;this.tension=clamp(this.tension,0,110);
      if(reel&&this.tension<92)this.progress+=dt*(12+(92-this.tension)*.08);else this.progress-=dt*(this.tension>98?16:2.5);this.progress=clamp(this.progress,0,100);
      if(this.tension>104){this.progress=Math.max(0,this.progress-18);this.tension=62;window.soundSystem?.playSound?.('hit');}
      ctx.fillStyle='rgba(5,7,10,.88)';ctx.strokeStyle='#d5a247';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(205,72,590,138,15);ctx.fill();ctx.stroke();ctx.fillStyle='#fff4d4';ctx.font='bold 31px Bebas Neue';ctx.textAlign='center';ctx.fillText('PESCARIA DO CHICO FUMAÇA',500,108);
      ctx.font='12px Righteous';ctx.fillStyle='#bfeeff';ctx.fillText('SEGURE ATAQUE para puxar • solte para aliviar a linha',500,132);
      const bx=285,bw=430;ctx.fillStyle='#1b2230';ctx.fillRect(bx,153,bw,14);ctx.fillStyle=this.tension>90?'#ff4a43':this.tension>68?'#ffc34b':'#55db7a';ctx.fillRect(bx,153,bw*(this.tension/110),14);ctx.fillStyle='#fff';ctx.font='10px Righteous';ctx.textAlign='left';ctx.fillText('TENSÃO',bx,147);
      ctx.fillStyle='#1b2230';ctx.fillRect(bx,181,bw,12);ctx.fillStyle='#53c7ff';ctx.fillRect(bx,181,bw*(this.progress/100),12);ctx.fillStyle='#fff';ctx.fillText('PEIXE',bx,177);
      if(this.progress>=100){this.state='reveal';this.resultTimer=0;this.splash=1;window.soundSystem?.playSound?.('explosion');window.gamepadSystem?.rumble?.(1,350,.9,.55);}
    }
    drawShark(ctx,imgKey,x,y,w=170,h=180,flip=false){const im=sharkImgs[imgKey]||sharkImgs.idle;if(!im?.complete||!im.naturalWidth)return;ctx.save();ctx.imageSmoothingEnabled=false;if(flip){ctx.translate(x+w,0);ctx.scale(-1,1);ctx.drawImage(im,0,y,w,h);}else ctx.drawImage(im,x,y,w,h);ctx.restore();}
    updateReveal(ctx,dt){this.resultTimer+=dt;this.drawBackdrop(ctx);this.drawChico(ctx);this.players.forEach(p=>p.draw(ctx));const t=clamp(this.resultTimer/2.8,0,1);ctx.save();ctx.globalAlpha=Math.min(1,t*2);for(let i=0;i<10;i++){ctx.fillStyle=`rgba(140,225,255,${.45*(1-t*.4)})`;ctx.beginPath();ctx.arc(620+Math.cos(i*.7)*t*90,410-Math.sin(i*.9)*t*120,12+i%3*6,0,Math.PI*2);ctx.fill();}ctx.restore();const sy=430-Math.sin(Math.min(1,t)*Math.PI)*220;this.drawShark(ctx,'roar',560,sy,220,220,false);ctx.fillStyle='#fff';ctx.font='bold 38px Bebas Neue';ctx.textAlign='center';ctx.fillText(t<.55?'ISSO NÃO É UM PEIXE!':'TUBARÃO DO AÇUDE',500,96);if(this.resultTimer>2.8){this.state='fight';this.resultTimer=0;this.shark.x=745;this.shark.y=GROUND-165;window.soundSystem?.playSound?.('bossAppear');}}
    updatePlayerFight(p,pl,dt,keys,gp,controls){
      if(p.life<=0)return;const left=this.action(pl,'left',keys,gp,controls),right=this.action(pl,'right',keys,gp,controls),jump=this.action(pl,'up',keys,gp,controls),attack=this.action(pl,'attack',keys,gp,controls);
      if(!p.attacking){if(left){p.x-=p.speed*60*dt;p.facingRight=false;p.isMoving=true;}else if(right){p.x+=p.speed*60*dt;p.facingRight=true;p.isMoving=true;}else p.isMoving=false;}
      p.x=clamp(p.x,15,925-p.w);
      if(jump&&!p.isJumping){p.isJumping=true;p.jumpPower=-16;}
      if(p.isJumping){p.y+=p.jumpPower;p.jumpPower+=.8;if(p.y+p.h>=GROUND){p.y=GROUND-p.h;p.jumpPower=0;p.isJumping=false;}}
      if(attack&&!p.attacking&&p.attackCooldown<=0){p.attacking=true;p.attackTimer=15;p.attackCooldown=20;p._fishingHitDone=false;window.soundSystem?.playSound?.('punch');}
      if(p.attacking){p.attackTimer--;if(p.attackTimer<=0){p.attacking=false;p._fishingHitDone=false;}}
      if(p.attackCooldown>0)p.attackCooldown--;if(p.invulnerable>0)p.invulnerable--;
    }
    bossBody(){const s=this.shark;return{x:s.x+20,y:s.y+20,w:s.w-35,h:s.h-20};}
    damageShark(amount){const s=this.shark;if(s.life<=0)return;s.life=Math.max(0,s.life-amount);s.flash=8;window.soundSystem?.playSound?.('enemyHit');if(s.life<=s.maxLife*.55)s.phase=2;if(s.life<=0){s.state='dead';s.deadTimer=0;window.soundSystem?.playSound?.('enemyDeath');}}
    updateBoss(dt){
      const s=this.shark;if(s.flash>0)s.flash--;if(s.life<=0){s.deadTimer+=dt;return;}
      s.cooldown-=dt*60;const living=this.players.filter(p=>p.life>0);if(!living.length)return;const target=living.sort((a,b)=>Math.abs(a.x-s.x)-Math.abs(b.x-s.x))[0];const dx=target.x-s.x;const dist=Math.abs(dx);s.facingRight=dx>0;
      if(s.state==='charge'){s.x+=s.chargeV*dt;s.timer-=dt;if(s.timer<=0||s.x<20||s.x>820){s.state='idle';s.cooldown=s.phase===2?65:90;}return;}
      if(s.state==='special'){s.timer-=dt;if(s.timer<=0){s.state='idle';s.cooldown=90;}return;}
      if(s.state==='bite'){s.timer-=dt;if(s.timer<=0){s.state='idle';s.cooldown=55;}return;}
      if(s.cooldown<=0){const r=Math.random();if(r<.34){s.state='charge';s.timer=.85;s.chargeV=(dx>0?1:-1)*(s.phase===2?390:320);}else if(r<.62){s.state='special';s.timer=1.15;s.waveTimer=.45;}else{s.state='bite';s.timer=.55;}return;}
      if(dist>120){s.x+=Math.sign(dx)*(s.phase===2?92:70)*dt;}s.x=clamp(s.x,30,820);
    }
    resolveCombat(){
      const s=this.shark;if(s.life<=0)return;const body=this.bossBody();
      this.players.forEach(p=>{if(p.life<=0)return;if(p.attacking&&!p._fishingHitDone&&p.attackTimer<=10&&p.attackTimer>=6){const hb=p.getHitbox?.();if(hb&&hb.x<body.x+body.w&&hb.x+hb.w>body.x&&hb.y<body.y+body.h&&hb.y+hb.h>body.y){p._fishingHitDone=true;this.damageShark(p.name==='Crist'?22:19);this.score+=100;}}});
      if(s.state==='bite'&&s.timer<.35&&s.timer>.12){this.players.forEach(p=>{if(Math.abs((p.x+p.w/2)-(s.x+s.w/2))<115&&Math.abs((p.y+p.h/2)-(s.y+s.h/2))<90)p.takeDamage?.(18);});}
      if(s.state==='charge'){this.players.forEach(p=>{if(p.x<body.x+body.w&&p.x+p.w>body.x&&p.y<body.y+body.h&&p.y+p.h>body.y)p.takeDamage?.(14);});}
      if(s.state==='special'&&s.waveTimer>0){s.waveTimer-=1/60;if(s.waveTimer<=0){this.players.forEach(p=>{if(Math.abs((p.x+p.w/2)-(s.x+s.w/2))<330)p.takeDamage?.(16);});window.gamepadSystem?.rumble?.(1,180,.65,.35);}}
    }
    drawFight(ctx){
      this.drawBackdrop(ctx);this.drawChico(ctx);this.players.forEach(p=>p.draw(ctx));const s=this.shark;let key='idle';if(s.life<=0)key='dead';else if(s.flash>0)key='hurt';else if(s.state==='special')key='special';else if(s.state==='bite')key='attack3';else if(s.state==='charge')key='attack1';else key=['walk1','walk2','walk3'][Math.floor(performance.now()/150)%3];this.drawShark(ctx,key,s.x,s.y,s.w,s.h,!s.facingRight);
      // boss bar
      ctx.fillStyle='rgba(4,7,12,.9)';ctx.strokeStyle='#58c9ff';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(240,24,520,58,12);ctx.fill();ctx.stroke();ctx.fillStyle='#fff4d5';ctx.font='bold 22px Bebas Neue';ctx.textAlign='center';ctx.fillText('TUBARÃO DO AÇUDE',500,49);ctx.fillStyle='#1a2430';ctx.fillRect(275,58,450,12);ctx.fillStyle=s.phase===2?'#ff4b3e':'#4fc7ff';ctx.fillRect(275,58,450*(s.life/s.maxLife),12);
      if(s.state==='special'&&s.life>0){ctx.strokeStyle='rgba(65,195,255,.75)';ctx.lineWidth=14;ctx.beginPath();ctx.arc(s.x+s.w/2,s.y+s.h/2,115,-1.2,1.2);ctx.stroke();}
      ctx.fillStyle='#fff';ctx.font='11px Righteous';ctx.textAlign='left';ctx.fillText(`BÔNUS • SCORE ${this.score}`,18,28);
    }
    updateFight(ctx,dt,keys,gp,controls){this.players.forEach((p,i)=>this.updatePlayerFight(p,i+1,dt,keys,gp,controls));this.updateBoss(dt);this.resolveCombat();this.drawFight(ctx);if(this.shark.life<=0&&this.shark.deadTimer>2.2){this.state='win';this.resultTimer=0;this.score+=2000;}}
    updateWin(ctx,dt,keys,gp,controls){this.resultTimer+=dt;this.drawBackdrop(ctx);this.drawChico(ctx);this.players.forEach(p=>p.draw(ctx));this.drawShark(ctx,'dead',650,GROUND-120,190,90,false);ctx.fillStyle='rgba(0,0,0,.68)';ctx.fillRect(170,120,660,220);ctx.strokeStyle='#f0bd55';ctx.lineWidth=4;ctx.strokeRect(170,120,660,220);ctx.fillStyle='#ffe07a';ctx.font='bold 42px Bebas Neue';ctx.textAlign='center';ctx.fillText('LENDAS DO AÇUDE!',500,180);ctx.fillStyle='#fff';ctx.font='17px Righteous';ctx.fillText('CHICO: “Eu avisei que esse açude não era normal...”',500,224);ctx.fillText('JOÃO: “Da próxima vez eu pesco no mercado.”',500,256);ctx.fillStyle='#8fdcff';ctx.fillText(`BÔNUS CONCLUÍDO • +${this.score} pontos`,500,292);ctx.fillStyle='#f5c04a';ctx.font='13px Righteous';ctx.fillText('ATAQUE / ENTER para voltar ao seletor',500,322);const acc=this.accept(keys,gp,controls);if(acc&&!this._acceptLast&&this.resultTimer>.7){this.active=false;return 'DONE';}this._acceptLast=acc;return null;}
    updateDraw(ctx,keys,gp,controls){if(!this.active)return'DONE';const now=performance.now();const dt=Math.min(.033,Math.max(.001,(now-this.last)/1000));this.last=now;if(this.state==='intro'){this.updateIntro(ctx,keys,gp,controls);return null;}if(this.state==='fishing'){this.updateFishing(ctx,dt,keys,gp,controls);return null;}if(this.state==='reveal'){this.updateReveal(ctx,dt);return null;}if(this.state==='fight'){this.updateFight(ctx,dt,keys,gp,controls);return null;}if(this.state==='win')return this.updateWin(ctx,dt,keys,gp,controls);return null;}
  }
  window.FishingBonusController=FishingBonusController;window.fishingBonus=new FishingBonusController();
})();
