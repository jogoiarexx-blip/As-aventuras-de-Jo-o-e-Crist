/**
 * PERFORMANCE-SYSTEM.JS
 * Ajuste adaptativo para Canvas 2D.
 * Não altera regras, dano, spawns ou save da campanha.
 */
class PerformanceSystem {
    constructor(settings) {
        this.settings = settings;
        this.frameEMA = 16.7;
        this.fpsEMA = 60;
        this.badSeconds = 0;
        this.goodSeconds = 0;
        this.lastEval = performance.now();
        this.frameCounter = 0;
        this.autoTier = 'high';
        this.tiers = {
            high:   { label:'ALTA',  particleLimit:500, drawMargin:180, activeRadius:1700, updateModulo:1, shadows:true, atmosphere:true, foreground:true, particleShadows:true },
            medium: { label:'MÉDIA', particleLimit:320, drawMargin:120, activeRadius:1400, updateModulo:2, shadows:true, atmosphere:true, foreground:false, particleShadows:false },
            low:    { label:'BAIXA', particleLimit:180, drawMargin:80,  activeRadius:1150, updateModulo:4, shadows:false, atmosphere:false, foreground:false, particleShadows:false }
        };
    }
    mode() { return this.settings?.data?.performanceMode || 'auto'; }
    effectiveTier() { const m=this.mode(); return ['high','medium','low'].includes(m)?m:this.autoTier; }
    config() { return this.tiers[this.effectiveTier()] || this.tiers.high; }
    modeLabel() { const labels={auto:'AUTO',high:'ALTA',medium:'MÉDIA',low:'BAIXA'}; const m=this.mode(); return m==='auto'?`AUTO (${this.config().label})`:(labels[m]||'AUTO'); }
    cycleMode(dir=1) { const order=['auto','high','medium','low']; let i=order.indexOf(this.mode()); if(i<0)i=0; i=(i+dir+order.length)%order.length; this.settings.data.performanceMode=order[i]; this.settings.save(); this.badSeconds=this.goodSeconds=0; return this.mode(); }
    onFrame(frameMs,fps) {
        if(!Number.isFinite(frameMs)) return;
        this.frameCounter++;
        this.frameEMA=this.frameEMA*.92+frameMs*.08;
        if(Number.isFinite(fps)&&fps>0)this.fpsEMA=this.fpsEMA*.8+fps*.2;
        if(this.mode()!=='auto')return;
        const now=performance.now(); if(now-this.lastEval<1000)return; this.lastEval=now;
        const estimatedFPS=Math.min(60,1000/Math.max(1,this.frameEMA));
        const measuredFPS=Math.min(60,this.fpsEMA||60);
        const bad=estimatedFPS<48||measuredFPS<50||this.frameEMA>21;
        const veryBad=estimatedFPS<38||measuredFPS<40||this.frameEMA>28;
        const good=estimatedFPS>56&&measuredFPS>55&&this.frameEMA<18.5;
        if(bad){this.badSeconds++;this.goodSeconds=0;}else if(good){this.goodSeconds++;this.badSeconds=Math.max(0,this.badSeconds-1);}else{this.badSeconds=Math.max(0,this.badSeconds-1);this.goodSeconds=0;}
        const old=this.autoTier;
        if(veryBad&&this.badSeconds>=2)this.autoTier='low';
        else if(this.autoTier==='high'&&this.badSeconds>=3)this.autoTier='medium';
        else if(this.autoTier==='medium'&&this.badSeconds>=4)this.autoTier='low';
        else if(this.autoTier==='low'&&this.goodSeconds>=8)this.autoTier='medium';
        else if(this.autoTier==='medium'&&this.goodSeconds>=10)this.autoTier='high';
        if(old!==this.autoTier){const label=this.config().label;console.info(`[PERFORMANCE] Qualidade automática: ${label} | frame médio ${this.frameEMA.toFixed(1)} ms`);window.GameDebugConsole?.info?.(`[PERFORMANCE] Qualidade automática ajustada para ${label}`);}
    }
    particleLimit(){return this.config().particleLimit;}
    drawMargin(){return this.config().drawMargin;}
    activeRadius(){return this.config().activeRadius;}
    shadowsEnabled(){return this.config().shadows;}
    atmosphereEnabled(){return this.config().atmosphere;}
    foregroundEnabled(){return this.config().foreground;}
    particleShadowsEnabled(){return this.config().particleShadows;}
    shouldUpdateEnemy(enemy,cameraX,canvasWidth){
        if(!enemy||enemy.life<=0)return true;
        if(enemy.isBoss||enemy.attacking||enemy.hitFlash>0)return true;
        const cfg=this.config(), ew=enemy.w||60, left=cameraX-cfg.activeRadius, right=cameraX+canvasWidth+cfg.activeRadius;
        if(enemy.x+ew>=left&&enemy.x<=right)return true;
        const mod=Math.max(2,cfg.updateModulo*3);
        if(!Number.isFinite(enemy.__perfPhase))enemy.__perfPhase=Math.floor(Math.random()*mod);
        return (this.frameCounter+enemy.__perfPhase)%mod===0;
    }
    isVisible(x,w,cameraX,canvasWidth){const m=this.drawMargin();return x+w>=cameraX-m&&x<=cameraX+canvasWidth+m;}
    snapshot(){return{mode:this.mode(),tier:this.effectiveTier(),frameMs:Number(this.frameEMA.toFixed(1)),estimatedFPS:Math.round(Math.min(60,1000/Math.max(1,this.frameEMA))),particles:this.particleLimit()};}
}
window.PerformanceSystem=PerformanceSystem;
