// v0.9.3 - controles touch nativos (sem interferir no teclado/gamepad)
(() => {
  const coarse = matchMedia('(pointer: coarse)').matches || innerWidth < 900;
  if (!coarse || !window.sistemControles) return;
  const host = document.getElementById('game-container');
  if (!host) return;
  const layer = document.createElement('div');
  layer.id = 'touch-controls';
  layer.innerHTML = `
    <div class="touch-left">
      <button data-a="left" aria-label="Esquerda">◀</button>
      <button data-a="right" aria-label="Direita">▶</button>
    </div>
    <div class="touch-right">
      <button class="jump" data-a="up">PULO</button>
      <button class="dash" data-a="dash">DASH</button>
      <button class="ranged" data-a="ranged">TIRO</button>
      <button class="attack" data-a="attack">ATAQUE</button>
    </div>`;
  host.appendChild(layer);
  const set=(a,on)=>window.sistemControles.definirTouch(1,a,on);
  layer.querySelectorAll('button').forEach(btn=>{
    const a=btn.dataset.a;
    const down=e=>{e.preventDefault(); btn.setPointerCapture?.(e.pointerId); set(a,true); btn.classList.add('pressed');};
    const up=e=>{e.preventDefault(); set(a,false); btn.classList.remove('pressed');};
    btn.addEventListener('pointerdown',down,{passive:false});
    btn.addEventListener('pointerup',up,{passive:false});
    btn.addEventListener('pointercancel',up,{passive:false});
    btn.addEventListener('lostpointercapture',up,{passive:false});
  });
  addEventListener('blur',()=>window.sistemControles.limparTouch());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)window.sistemControles.limparTouch();});
  const jumpBtn=layer.querySelector('[data-a="up"]');
  const dashBtn=layer.querySelector('[data-a="dash"]');
  const rangedBtn=layer.querySelector('[data-a="ranged"]');
  const attackBtn=layer.querySelector('[data-a="attack"]');
  let lastMode='';
  const sync=()=>{
    try {
      const bus = gameState===GameState.BUS_MINIGAME;
      const gameplay = gameState===GameState.PLAYING;
      layer.style.display = (gameplay || bus) ? 'block' : 'none';
      const mode=bus?'bus':'fight';
      if(mode!==lastMode){
        lastMode=mode;
        if(bus){
          if(jumpBtn) jumpBtn.textContent='↑';
          if(dashBtn) dashBtn.textContent='↓';
          if(rangedBtn) rangedBtn.style.display='none';
          if(attackBtn) attackBtn.textContent='BUZINA';
        }else{
          if(jumpBtn) jumpBtn.textContent='PULO';
          if(dashBtn) dashBtn.textContent='DASH';
          if(rangedBtn){rangedBtn.style.display='';rangedBtn.textContent='TIRO';}
          if(attackBtn) attackBtn.textContent='ATAQUE';
        }
      }
    } catch(_) {}
    requestAnimationFrame(sync);
  };
  sync();
})();
