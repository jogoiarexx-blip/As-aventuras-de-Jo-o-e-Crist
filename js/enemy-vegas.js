/* João e Crist v0.9.4 — renderer corrigido dos inimigos exclusivos de Vegas / Fases 5 e 6 */
(() => {
  const fallbackEnemyDraw = (typeof Enemy !== 'undefined' && Enemy.prototype.draw) ? Enemy.prototype.draw : null;
  const CONFIG = {
    turista: { cls:'TuristaEnemy', name:'Turista de Vegas', life:65, speed:2.25, damage:10, score:180, w:48, h:72, visualH:92 },
    seguranca: { cls:'SegurancaEnemy', name:'Segurança de Vegas', life:115, speed:2.35, damage:17, score:260, w:52, h:76, visualH:98 },
    club_security: { cls:'ClubSecurityEnemy', name:'Segurança de Vegas', life:115, speed:2.35, damage:17, score:260, w:52, h:76, visualH:98 },
    elvis_fan: { cls:'ElvisFanEnemy', name:'Fã do Elvis', life:80, speed:3.25, damage:13, score:230, w:48, h:72, visualH:94, glow:'#7d54ff' },
    mulher_feia: { cls:'MulherFeiaEnemy', name:'Brigona de Vegas', life:145, speed:1.75, damage:21, score:300, w:62, h:84, visualH:108 },
    travesti: { cls:'TravestiEnemy', name:'Diva de Vegas', life:90, speed:2.75, damage:15, score:250, w:50, h:78, visualH:104, glow:'#ff3fbe' }
  };
  const STATES=['idle','walk1','walk2','attack','hurt','dead'];
  // Os IDs internos usam underscore, mas algumas pastas de assets usam hífen.
  // Centralizar esse mapeamento evita 404s sem renomear arquivos já usados em outras versões.
  const ASSET_FOLDER={
    turista:'turista',
    seguranca:'seguranca',
    club_security:'__club_security__',
    elvis_fan:'elvis-fan',
    mulher_feia:'mulher-feia',
    travesti:'travesti'
  };
  const images={};
  for(const type of Object.keys(CONFIG)){
    images[type]={};
    const folder=ASSET_FOLDER[type]||type;
    for(const state of STATES){
      // O segurança da boate reaproveita exatamente o mesmo sprite do segurança de Vegas.
      const src=`assets/enemies/vegas-frames/${type==='club_security'?'seguranca':folder}/${state}.webp`;
      images[type][state]=window.assetManager.placeholder(src);
    }
  }
  function applyStats(e,type){
    const c=CONFIG[type]; e.type=type;e.name=c.name;e.life=e.maxLife=c.life;e.speed=c.speed;e.damage=c.damage;e.score=c.score;e.w=c.w;e.h=c.h;
    e.y=e.groundY-e.h;e.hitbox={offsetX:8,offsetY:14,width:Math.max(22,e.w-16),height:Math.floor(e.h*.72)};
  }
  function stateFor(e){
    if(e.life<=0||e.dead)return'dead';
    if((e.hitFlash||0)>0)return'hurt';
    if(e.attacking||(e.attackTimer||0)>0)return'attack';
    if(Math.abs(e.__vegasMove||0)>.04)return Math.floor((performance.now()-e.__vegasAnimStart)/135)%2?'walk2':'walk1';
    return'idle';
  }
  class VegasEnemy extends Enemy{
    constructor(x,y,type){
      super(x,y,'basic');applyStats(this,type);this.__vegasType=type;this.__vegasFace=-1;this.__vegasMove=0;this.__vegasAnimStart=performance.now();this.__vegasLastState='idle';
    }
    update(players,otherEnemies=[]){
      if(this.__clubBoss&&this.life>0){const ratio=this.life/Math.max(1,this.maxLife);if(ratio<.30&&!this.__clubRage){this.__clubRage=true;this.speed=(this.__clubBossBaseSpeed||this.speed)*1.34;this.damage=Math.round((this.__clubBossBaseDamage||this.damage)*1.28);this.__vegasAnimStart=performance.now();} }
      const ox=this.x;const result=super.update(players,otherEnemies);this.__vegasMove=this.x-ox;
      if(Math.abs(this.__vegasMove)>.02)this.__vegasFace=this.__vegasMove>0?1:-1;
      return result;
    }
    draw(ctx){
      const c=CONFIG[this.__vegasType];if(!c){if(fallbackEnemyDraw)fallbackEnemyDraw.call(this,ctx);return;}
      let state=stateFor(this);const coarse=state.startsWith('walk')?'walk':state;
      if(coarse!==this.__vegasLastState){this.__vegasLastState=coarse;this.__vegasAnimStart=performance.now();if(coarse==='walk')state='walk1';}
      const img=images[this.__vegasType][state]||images[this.__vegasType].idle;
      if(!img?.complete||!img.naturalWidth){if(fallbackEnemyDraw)fallbackEnemyDraw.call(this,ctx);return;}
      const bossScale=this.__clubBoss?1.30:1;const baseH=(state==='dead'?c.visualH*.68:c.visualH)*bossScale;
      const aspect=img.naturalWidth/Math.max(1,img.naturalHeight);
      let visualH=baseH,visualW=visualH*aspect;
      const maxW=c.visualH*1.7;if(visualW>maxW){visualW=maxW;visualH=visualW/aspect;}
      const cx=this.x+this.w/2;const bottom=Number.isFinite(this.groundY)?this.groundY:this.y+this.h;
      ctx.save();ctx.imageSmoothingEnabled=false;
      if((c.glow||this.__clubBoss)&&this.life>0){ctx.shadowBlur=this.__clubBoss?14:6;ctx.shadowColor=this.__clubRage?'#ff263f':(c.glow||'#ff596d');}
      ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(cx,bottom+2,Math.max(13,this.w*.38),4,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
      // Os sprites-base olham para a direita. Flip apenas quando o inimigo anda para a esquerda.
      if((this.__vegasFace||-1)<0){ctx.translate(cx,0);ctx.scale(-1,1);ctx.translate(-cx,0);}
      if((this.hitFlash||0)>0)ctx.globalAlpha=.88;
      ctx.drawImage(img,cx-visualW/2,bottom-visualH,visualW,visualH);ctx.restore();
      if(this.__clubBoss&&this.life>0){const bw=170,p=Math.max(0,Math.min(1,this.life/this.maxLife));ctx.fillStyle='rgba(0,0,0,.78)';ctx.fillRect(cx-bw/2-3,bottom-visualH-30,bw+6,18);ctx.fillStyle=this.__clubRage?'#ff263f':'#d53b57';ctx.fillRect(cx-bw/2,bottom-visualH-27,bw*p,10);ctx.strokeStyle='#fff';ctx.strokeRect(cx-bw/2,bottom-visualH-27,bw,10);ctx.fillStyle='#fff';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText(this.__clubRage?'CHEFE DA SEGURANÇA • FÚRIA':'CHEFE DA SEGURANÇA',cx,bottom-visualH-34);}
      if(!this.__clubBoss&&this.life>0&&this.life<this.maxLife){const bw=48,p=Math.max(0,Math.min(1,this.life/this.maxLife));ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(cx-bw/2-2,bottom-c.visualH-10,bw+4,7);ctx.fillStyle=p>.5?'#55d85a':p>.25?'#f1c34e':'#e55245';ctx.fillRect(cx-bw/2,bottom-c.visualH-8,bw*p,3);}
    }
  }
  window.TuristaEnemy=class TuristaEnemy extends VegasEnemy{constructor(x,y){super(x,y,'turista');}};
  window.SegurancaEnemy=class SegurancaEnemy extends VegasEnemy{constructor(x,y){super(x,y,'seguranca');}};
  window.ClubSecurityEnemy=class ClubSecurityEnemy extends VegasEnemy{constructor(x,y){super(x,y,'club_security');}};
  window.ElvisFanEnemy=class ElvisFanEnemy extends VegasEnemy{constructor(x,y){super(x,y,'elvis_fan');}};
  window.MulherFeiaEnemy=class MulherFeiaEnemy extends VegasEnemy{constructor(x,y){super(x,y,'mulher_feia');}};
  window.TravestiEnemy=class TravestiEnemy extends VegasEnemy{constructor(x,y){super(x,y,'travesti');}};
})();
