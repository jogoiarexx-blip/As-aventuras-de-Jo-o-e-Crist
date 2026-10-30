/* João & Crist v0.9.9: overlay opcional de diagnóstico. Ativar por ?perf=1. */
(() => {
  'use strict';
  if (new URLSearchParams(window.location.search).get('perf') !== '1') return;
  const mount = () => {
    if (document.getElementById('game-perf-panel')) return;
    const panel = document.createElement('output');
    panel.id = 'game-perf-panel';
    panel.setAttribute('aria-label', 'Diagnóstico de desempenho');
    panel.style.cssText = [
      'position:fixed','z-index:99999','top:8px','left:8px','max-width:190px',
      'box-sizing:border-box','background:rgba(10,17,27,.91)','border:1px solid #445d78',
      'color:#e8f2ff','padding:8px 10px','border-radius:7px','white-space:pre-line',
      'font:11px/1.5 system-ui,sans-serif','pointer-events:none'
    ].join(';');
    document.body.appendChild(panel);
    const redraw = () => {
      if (document.hidden) return;
      const d = window.GameRuntime?.diagnosticsSnapshot?.();
      if (!d) { panel.textContent = 'Diagnóstico indisponível'; return; }
      const fps = Number.isFinite(d.fps) ? d.fps : '?';
      panel.textContent =
        'FPS real: ' + fps + '\n' +
        'Quadro: ' + d.frameCostMs + ' ms\n' +
        'Pior quadro: ' + d.maxFrameCostMs + ' ms\n' +
        'Qualidade: ' + d.quality + '\n' +
        'Fase: ' + d.level + '  Inimigos: ' + d.enemies + '\n' +
        'RAM JS: ' + (d.heapMB === null ? 'indisponível' : d.heapMB + ' MB') + '\n' +
        'Quadros lentos: ' + d.slowFrames;
    };
    redraw();
    const interval = window.setInterval(redraw, 1000);
    window.addEventListener('pagehide', () => window.clearInterval(interval), {once:true});
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
})();
