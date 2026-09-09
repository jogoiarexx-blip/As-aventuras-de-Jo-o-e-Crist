// v0.9.4 - HUD de GAMEPLAY. Vida/XP/Nível ficam aqui; nunca é usado como caixa de diálogo.
(() => {
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const load=(src)=>window.assetManager.image(src,'shared');
  const hudFrames={
    'João':load('assets/ui/hud-joao-frame.webp'),
    'Crist':load('assets/ui/hud-crist-frame.webp'),
    'Chico Fumaça':load('assets/ui/hud-chico-frame.webp')
  };
  const bossPortraits={
    colonel:load('assets/ui/portrait-colonel.webp'),
    victor:load('assets/ui/portrait-victor.webp'),
    vegas:load('assets/ui/portrait-victor.webp'),
    shadow:load('assets/ui/portrait-shadow.webp'),
    god:load('assets/ui/portrait-god.webp'),
    cowboy:load('assets/ui/portrait-bandido.webp')
  };

  function pixelPanel(x,y,w,h,fill='#071b42',stroke='#29a8ff'){
    ctx.fillStyle=fill;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
    ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.strokeRect(Math.round(x)+1,Math.round(y)+1,Math.round(w)-2,Math.round(h)-2);
  }
  function bar(x,y,w,h,p,kind='life'){
    p=clamp(p);
    ctx.fillStyle='rgba(2,12,30,.92)';ctx.fillRect(x,y,w,h);
    let c='#35e45b';
    if(kind==='xp')c='#35cfff';
    else if(kind==='special')c='#ffe05c';
    else if(p<=.25)c='#ef4242'; else if(p<=.5)c='#f0a42f';
    ctx.fillStyle=c;ctx.fillRect(x+2,y+2,Math.max(0,(w-4)*p),Math.max(1,h-4));
    ctx.strokeStyle='#62c7ff';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,w-1,h-1);
  }
  function heart(x,y,s=12){
    ctx.save();ctx.fillStyle='#ff3045';
    ctx.fillRect(x+s*.15,y,s*.3,s*.3);ctx.fillRect(x+s*.55,y,s*.3,s*.3);
    ctx.fillRect(x,y+s*.15,s,s*.35);ctx.fillRect(x+s*.15,y+s*.5,s*.7,s*.2);ctx.fillRect(x+s*.3,y+s*.7,s*.4,s*.15);ctx.fillRect(x+s*.42,y+s*.85,s*.16,s*.12);
    ctx.restore();
  }
  function evoData(p){
    const e=p?.evolution;
    const lv=e?.level||e?.currentLevel||1;
    const xp=e?.xp??e?.currentXP??0;
    const need=Math.max(1,e?.xpToNextLevel||e?.nextLevelXP||100);
    return {lv,xp,need};
  }
  function secondaryData(p){
    if(p.name==='João'&&typeof p.rangedCooldown==='number'){
      return {label:p.rangedCharging?'CARGA':'TIRO', value:p.rangedCharging?clamp(p.rangedChargeFrames/(p.rangedMaxCharge||90)):clamp(1-p.rangedCooldown/72)};
    }
    return {label:'COMBO',value:clamp((p.combo||0)/10)};
  }

  function bossPortraitFor(b){
    const k=String(b?.type||b?.name||'').toLowerCase();
    if(k.includes('colon'))return bossPortraits.colonel;
    if(k.includes('victor')||k.includes('vegas')||k.includes('blackjack'))return bossPortraits.victor;
    if(k.includes('shadow')||k.includes('sombra'))return bossPortraits.shadow;
    if(k.includes('god')||k.includes('deus'))return bossPortraits.god;
    if(k.includes('cowboy')||k.includes('bandido'))return bossPortraits.cowboy;
    return null;
  }
  function tinyTag(x,y,text,fill='#0d274d',stroke='#55c5ff'){
    const pad=6;ctx.font='bold 8px Righteous';const w=ctx.measureText(text).width+pad*2;pixelPanel(x,y,w,15,fill,stroke);ctx.fillStyle='#fff';ctx.fillText(text,x+pad,y+11);return w;
  }

  function drawPlayer(p,index,total){
    if(!p)return;
    const w=326,h=109,y=6,x=(total>1&&index===1)?668:6;
    const frame=hudFrames[p.name]||hudFrames['João'];
    ctx.save();ctx.imageSmoothingEnabled=false;
    if(frame?.complete&&frame.naturalWidth)ctx.drawImage(frame,x,y,w,h);
    else pixelPanel(x,y,w,h);

    // A arte já contém o retrato correto. Os dados abaixo ocupam somente os campos vazios.
    const dataX=x+78;
    const right=x+w-14;
    const {lv,xp,need}=evoData(p);
    ctx.textAlign='left';ctx.fillStyle='#f7fbff';ctx.font='bold 15px Righteous';
    ctx.fillText(`${p.name.toUpperCase()}  •  P${index+1}`,dataX,y+28);
    ctx.fillStyle='#9ee7ff';ctx.font='bold 11px Righteous';ctx.fillText(`NÍVEL ${lv}`,dataX,y+45);

    heart(x+w-106,y+18,13);
    ctx.textAlign='right';ctx.fillStyle='#fff';ctx.font='bold 13px Righteous';
    ctx.fillText(`${Math.max(0,Math.ceil(p.life))}/${Math.max(1,Math.ceil(p.maxLife))}`,right,y+30);

    // Campo grande inferior: VIDA + XP + especial/combo.
    ctx.textAlign='left';ctx.font='bold 9px Righteous';ctx.fillStyle='#dff5ff';ctx.fillText('VIDA',dataX,y+62);
    bar(dataX+34,y+54,w-126,11,p.life/Math.max(1,p.maxLife),'life');
    ctx.fillText('XP',dataX,y+82);
    bar(dataX+34,y+74,118,10,xp/need,'xp');
    ctx.fillStyle='#8fe7ff';ctx.font='8px Righteous';ctx.fillText(`${xp}/${need}`,dataX+157,y+82);

    const sec=secondaryData(p);
    ctx.fillStyle='#fff1a3';ctx.font='bold 8px Righteous';ctx.fillText(sec.label,dataX+205,y+82);
    const secW=Math.max(34,w-299); bar(dataX+205,y+87,secW,8,sec.value,'special');
    ctx.fillStyle='#c9f7ff';ctx.font='7px Righteous';
    const secText = sec.label==='COMBO' ? `x${p.combo||0}` : (p.rangedCharging ? `${Math.round(sec.value*100)}%` : (sec.value>=.98?'PRONTO':'RECARGA'));
    ctx.fillText(secText,dataX+205,y+99);
    if((p.combo||0)>=5){ tinyTag(dataX+205,y+38,`COMBO ${p.combo}x`,'rgba(60,20,0,.92)','#ffd76a'); }
    if((p.life||0)/(Math.max(1,p.maxLife||1))<=0.25){ tinyTag(right-58,y+39,'PERIGO','rgba(60,8,8,.94)','#ff7a6b'); }
    ctx.restore();
  }

  drawHUD=function(){
    // Segurança: HUD de gameplay só deve existir quando há gameplay/resultado de fase.
    if(typeof gameState!=='undefined' && ![GameState.PLAYING,GameState.LEVEL_COMPLETE].includes(gameState))return;
    ctx.save();ctx.imageSmoothingEnabled=false;
    const total=players.length;players.forEach((p,i)=>drawPlayer(p,i,total));

    const alive=enemies.filter(e=>!e.dead&&e.life>0&&!e.isBossMinion);
    const highestCombo = players.reduce((m,p)=>Math.max(m,Number(p?.combo)||0),0);
    const stage=`FASE ${currentLevelIndex+1}/${LEVELS.length}`;
    let center=stage+`  •  ${alive.filter(e=>!e.isBoss).length} INIMIGOS`;
    if(waveSystem&&!waveSystem.allWavesDone)center=`${stage}  •  ONDA ${Math.max(1,waveSystem.currentWave)}/${waveSystem.waves.length}`;
    pixelPanel(320,8,360,40,'rgba(5,15,34,.92)','#2b9fe8');
    ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='bold 13px Righteous';ctx.fillText(center,500,24);
    ctx.fillStyle='#ffd76a';ctx.font='bold 13px Bebas Neue';ctx.fillText(`SCORE ${score}`,500,41);
    if(highestCombo>=3){
      const pulse=.8+Math.sin(performance.now()/130)*.2;
      ctx.save();ctx.globalAlpha=pulse;pixelPanel(418,49,164,20,'rgba(40,16,0,.88)','#ffd76a');ctx.restore();
      ctx.fillStyle='#fff3b6';ctx.font='bold 11px Bebas Neue';ctx.fillText(`MAX COMBO ${highestCombo}x`,500,64);
    }

    if(bossWarningTimer>0&&!bossSpawned){
      const pulse=.65+Math.sin(performance.now()/100)*.35;pixelPanel(280,118,440,48,'rgba(20,5,5,.88)','#ff5a4d');ctx.globalAlpha=pulse;ctx.fillStyle='#ff5a4d';ctx.font='bold 28px Bebas Neue';ctx.fillText('⚠ BOSS CHEGANDO ⚠',500,151);ctx.globalAlpha=1;
    }
    if(bossSpawned&&!bossDefeated){
      const b=alive.find(e=>e.isBoss||e.type==='boss'||e.type==='final_boss'||e.name==='REI DE VEGAS');
      if(b){
        const px=bossPortraitFor(b), ratio=Math.max(0,Math.min(1,b.life/Math.max(1,b.maxLife)));
        const warning = ratio<=0.25;
        const stroke = warning ? '#ff7a6b' : '#d8a93f';
        pixelPanel(170,562,660,62,'rgba(5,9,16,.90)',stroke);
        if(px?.complete&&px.naturalWidth){
          ctx.fillStyle='rgba(8,20,42,.95)';ctx.fillRect(182,570,46,46);
          ctx.strokeStyle='#55c5ff';ctx.strokeRect(182.5,570.5,45,45);
          ctx.drawImage(px,186,574,38,38);
        }
        ctx.textAlign='left';ctx.fillStyle='#ffd76a';ctx.font='bold 18px Bebas Neue';ctx.fillText(b.name||'BOSS',240,584);
        ctx.fillStyle=warning?'#ffb6ab':'#fff3c8';ctx.font='bold 9px Righteous';ctx.fillText(warning?'FÚRIA MÁXIMA':'ALVO PRINCIPAL',240,598);
        bar(240,602,520,14,ratio,'life');
        ctx.textAlign='right';ctx.fillStyle='#ffffff';ctx.font='bold 12px Righteous';ctx.fillText(`${Math.max(0,Math.ceil(b.life))}/${Math.max(1,Math.ceil(b.maxLife))}`,760,586);
      }
    }
    if(window.trophySystem?.updateNotifications)window.trophySystem.updateNotifications();
    if(window.trophySystem?.drawNotifications)window.trophySystem.drawNotifications(ctx);
    ctx.restore();
  };
})();
