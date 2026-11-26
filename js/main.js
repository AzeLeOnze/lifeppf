/* LifePPF — démarrage, sauvegarde automatique, mise à jour à chaud dans claude.ai. */
(function (L) {
  'use strict';
  const G = L.G;

  function start(hot) {
    let save = G.loadLocal();
    if (hot && hot.save && (!save || (hot.save.savedAt || 0) >= (save.savedAt || 0))) save = hot.save;
    G.init(save);
    L.UI.init();
    const l = G.L();
    if (hot && hot.scr === 'game' && l && !l.dead) L.UI.enterGame();
    else if (hot && hot.scr === 'dead' && l && l.dead) L.UI.dead();
    else L.UI.title();

    G.on(function (ev) { if (ev === 'synced') L.UI.reload(); });
    const flush = function () { if (G.S()) { G.saveLocal(); L.Sync.changed(true); } };
    document.addEventListener('visibilitychange', function () { if (document.hidden) flush(); });
    window.addEventListener('pagehide', flush);

    const h = window.claude && window.claude.hot;
    if (h && typeof h.snapshot === 'function') h.snapshot(function () { return { save: G.exportSave(), scr: L.UI.state.scr }; });
    L.Sync.init();
  }

  function boot() {
    const h = window.claude && window.claude.hot;
    if (h && typeof h.ready === 'function') h.ready(start);
    else start((h && h.data) || {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.LP);
