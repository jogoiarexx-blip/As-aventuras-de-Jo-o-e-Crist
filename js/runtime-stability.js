// João & Crist v0.9.4 - infraestrutura incremental de estabilidade
(() => {
  class AssetManager {
    constructor(){ this.images=new Map(); }
    image(src){
      if(!src) return null;
      if(this.images.has(src)) return this.images.get(src);
      const img=new Image(); img.decoding='async'; img.src=src; this.images.set(src,img); return img;
    }
    preloadLevel(level){ try{return level?.preload?.();}catch(e){console.warn('[assets] preload',e);return null;} }
    preloadNext(levels,index){ const next=levels?.[index+1]; if(!next)return; if('requestIdleCallback' in window) requestIdleCallback(()=>this.preloadLevel(next),{timeout:1200}); else setTimeout(()=>this.preloadLevel(next),200); }
  }

  class SceneManager {
    constructor(){this.current=null;this.previous=null;this.enteredAt=performance.now();}
    enter(name){if(name===this.current)return;this.previous=this.current;this.current=name;this.enteredAt=performance.now();}
  }

  class AttackDirector {
    constructor(){this.maxAttackers1P=2;this.maxAttackers2P=3;}
    assign(enemies,players){
      const aliveP=(players||[]).filter(p=>p&&p.life>0); if(!aliveP.length)return;
      const alive=(enemies||[]).filter(e=>e&&e.life>0&&!e.dead);
      const limit=aliveP.length>1?this.maxAttackers2P:this.maxAttackers1P;
      const active=alive.filter(e=>e.attacking).slice(0,limit);
      const slots=Math.max(0,limit-active.length);
      const ranked=alive.filter(e=>!active.includes(e)).map(e=>({e,d:Math.min(...aliveP.map(p=>Math.abs((p.x||0)-(e.x||0))))})).sort((a,b)=>a.d-b.d);
      const allowed=new Set(active.concat(ranked.slice(0,slots).map(x=>x.e)));
      alive.forEach(e=>{e.__attackAllowed=allowed.has(e); if(!e.__attackAllowed&&!e.attacking&&(e.attackCooldown||0)<=0)e.attackCooldown=8;});
    }
  }

  window.assetManager=window.assetManager||new AssetManager();
  window.sceneManager=window.sceneManager||new SceneManager();
  window.attackDirector=window.attackDirector||new AttackDirector();
  window.GameRuntime={
    targetHz:60,
    fixedStepMs:1000/60,
    debugHitboxes:false,
    score:{ add(v){ if(typeof window.addGameScore==='function') window.addGameScore(v); }, get(){return typeof window.getGameScore==='function'?window.getGameScore():0;} }
  };
})();
