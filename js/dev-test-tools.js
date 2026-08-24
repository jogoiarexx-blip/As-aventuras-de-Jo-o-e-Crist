/* João & Crist - ferramentas de teste seguras. Desligadas por padrão. */
(() => {
  if (window.GameDevTools) return;
  let enabled = false;
  let message = '';
  let messageUntil = 0;

  function toast(msg){
    message = msg;
    messageUntil = performance.now() + 2200;
    window.GameDebugConsole?.log?.('[DEBUG] ' + msg);
  }

  function activePlayers(){ return (window.players || []).filter(p => p && p.life > 0); }

  function loadStage(n){
    if (!enabled || typeof loadLevel !== 'function') return;
    const idx = Math.max(0, Math.min((window.LEVELS || (typeof LEVELS !== 'undefined' ? LEVELS : [])).length - 1, n - 1));
    if (idx < 0) return;
    try {
      window.GameRuntime?.cancelAllTimers?.();
      loadLevel(idx);
      window.gameState = (typeof GameState !== 'undefined') ? GameState.PLAYING : 'playing';
      if (typeof levelStartTime !== 'undefined') levelStartTime = Date.now();
      if (typeof startLevelMusic === 'function') startLevelMusic();
      toast(`Fase ${n} carregada`);
    } catch(e){ console.error('[DEBUG stage]',e); }
  }

  function spawnCurrentBoss(){
    if (!enabled || window.gameState !== 'playing') return;
    try {
      if (typeof spawnBoss === 'function') {
        spawnBoss(); toast('Boss da fase solicitado'); return;
      }
      toast('Spawn de boss indisponível nesta fase');
    } catch(e){ console.error('[DEBUG boss]',e); }
  }

  function killNormals(){
    if (!enabled) return;
    let count=0;
    (window.enemies || []).forEach(e => {
      if (e && e.life > 0 && !e.isBoss) { e.life=0; e.dead=true; count++; }
    });
    toast(`${count} inimigo(s) normal(is) removido(s)`);
  }

  function healPlayers(){
    activePlayers().forEach(p => { p.life = p.maxLife; p.invulnerable = Math.max(p.invulnerable || 0, 30); });
    toast('Vida restaurada');
  }

  function addLevel(){
    let count=0;
    activePlayers().forEach(p => {
      const evo=p.evolution;
      if(!evo) return;
      const need = Math.max(1, evo.xpToNextLevel || evo.nextLevelXP || 100);
      const xp = evo.xp ?? evo.currentXP ?? 0;
      evo.addXP(Math.max(1, need-xp), { debug:true });
      count++;
    });
    toast(`Nível concedido a ${count} jogador(es)`);
  }

  function toggle(){
    enabled = !enabled;
    window.DEBUG_GAME = enabled;
    if (typeof window.debugMode !== 'undefined') window.debugMode = enabled;
    toast(enabled ? 'MODO TESTE ATIVO' : 'MODO TESTE DESATIVADO');
  }

  window.addEventListener('keydown', e => {
    if (e.key === 'F9') { e.preventDefault(); toggle(); return; }
    if (!enabled) return;
    if (/^F[1-8]$/.test(e.key)) { e.preventDefault(); loadStage(Number(e.key.slice(1))); return; }
    if (e.key === 'b' || e.key === 'B') { e.preventDefault(); spawnCurrentBoss(); return; }
    if (e.key === 'k' || e.key === 'K') { e.preventDefault(); killNormals(); return; }
    if (e.key === 'h' || e.key === 'H') { e.preventDefault(); healPlayers(); return; }
    if (e.key === 'l' || e.key === 'L') { e.preventDefault(); addLevel(); return; }
  }, true);

  function draw(ctx){
    if (!enabled || !ctx) return;
    ctx.save();
    ctx.imageSmoothingEnabled=false;
    ctx.fillStyle='rgba(0,0,0,.82)'; ctx.fillRect(8,126,360,112);
    ctx.strokeStyle='#00e5ff'; ctx.lineWidth=2; ctx.strokeRect(8,126,360,112);
    ctx.fillStyle='#00e5ff'; ctx.font='bold 14px monospace'; ctx.textAlign='left';
    ctx.fillText('DEBUG / TESTE (F9 fecha)',18,147);
    ctx.fillStyle='#fff'; ctx.font='12px monospace';
    ctx.fillText('F1-F8: fase   B: boss   K: limpar inimigos',18,169);
    ctx.fillText('H: vida cheia   L: +1 nível',18,188);
    const runtime=window.GameRuntime?.stats;
    const e=(window.enemies||[]).filter(x=>x&&x.life>0).length;
    const p=(window.players||[]).length;
    ctx.fillStyle='#ffd95b';
    ctx.fillText(`fase ${Number(window.currentLevelIndex||0)+1} | players ${p} | inimigos ${e}${runtime?` | slow ${runtime.slowFrames}`:''}`,18,208);
    if (message && performance.now()<messageUntil) { ctx.fillStyle='#8cff9e'; ctx.fillText(message,18,228); }
    ctx.restore();
  }

  const originalDrawHUD = window.drawHUD;
  if (typeof originalDrawHUD === 'function') {
    window.drawHUD = function(...args){ const r=originalDrawHUD.apply(this,args); draw(window.ctx || (typeof ctx !== 'undefined' ? ctx : null)); return r; };
  }

  window.GameDevTools = { get enabled(){return enabled;}, toggle, loadStage, killNormals, healPlayers, addLevel, draw };
})();
