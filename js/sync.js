/* LifePPF — copie de la sauvegarde dans le compte claude.ai (quand le jeu tourne dans claude.ai).
 * Le stockage du navigateur reste la sauvegarde principale ; la copie suit la plus récente des deux (savedAt). */
(function (L) {
  'use strict';
  const S = { connected: false };
  let ref = null, timer = null, writing = false, again = false;

  function timeout(p, ms) { return Promise.race([p, new Promise(function (res) { setTimeout(function () { res(null); }, ms); })]); }
  // le journal d'une très longue vie peut peser lourd : on garde la naissance et les 90 dernières années
  function slim(save) {
    const s = JSON.parse(JSON.stringify(save));
    if (s.life && s.life.log && s.life.log.length > 91) s.life.log = [s.life.log[0]].concat(s.life.log.slice(-90));
    return s;
  }

  S.init = async function () {
    try {
      const c = window.claude;
      if (!c || typeof c.use !== 'function') return;
      const user = await c.use('user');
      if (!user) return;
      const id = await user.id();
      if (!id) return;
      const db = await c.use('db');
      if (!db) return;
      const r = db.doc('data/users/' + id + '/save');
      const snap = await timeout(r.get(), 10000);
      if (!snap) return;
      ref = r;
      S.connected = true;
      const local = L.G.S();
      if (snap.exists) {
        const remote = snap.data() || {};
        if ((remote.savedAt || 0) > (local.savedAt || 0) && remote.account) {
          L.G.importSave(JSON.parse(JSON.stringify(remote)));
          L.G.saveLocal();
          L.G.emit('synced');
          return;
        }
      }
      if (local.account && (local.life || local.account.born)) S.changed(true);
    } catch (e) { ref = null; S.connected = false; }
  };

  // écritures groupées : au plus une toutes les 15 s, et tout de suite quand on quitte la page
  S.changed = function (now) {
    if (!ref) return;
    if (now) { clearTimeout(timer); timer = setTimeout(flush, 50); return; }
    if (!timer) timer = setTimeout(flush, 15000);
  };

  async function flush() {
    timer = null;
    if (!ref) return;
    if (writing) { again = true; return; }
    writing = true;
    try { await ref.set(slim(L.G.exportSave())); }
    catch (e) {
      const code = e && e.code;
      if (code !== 'unavailable' && code !== 'resource_exhausted') { ref = null; S.connected = false; }
    }
    writing = false;
    if (again) { again = false; flush(); }
  }

  L.Sync = S;
})(window.LP);
