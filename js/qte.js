/* LifePPF — QTE : les urgences (garder le cœur en rythme) et les idées noires (chasser les pensées avec l'aide de ses proches). */
(function (L) {
  'use strict';
  const Q = L.QTE = {};
  const clamp = L.clamp, esc = L.esc;

  function pips(n, on) { let s = ''; for (let i = 0; i < n; i++) s += '<i' + (i < on ? ' class="on"' : '') + '></i>'; return s; }
  function fitCanvas(cv) {
    const r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.max(10, Math.round(r.width * dpr)); cv.height = Math.max(10, Math.round(r.height * dpr));
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { g: g, w: r.width, h: r.height };
  }

  // ---------- urgences ----------
  Q.hosp = function (root, age, done) {
    const w = clamp(0.34 - (age - 20) * 0.003, 0.03, 0.34);
    const v = 0.9 + age * 0.012;
    const NEED = 4, MISS = 3;
    let hits = 0, miss = 0, pos = 0, dir = 1, z0 = 0, state = 'ready', last = 0, raf = 0, beat = 0, flat = 0;
    const hard = age >= 100 ? 'Après 100 ans, c’est presque impossible. Presque.' : age >= 80 ? 'À ton âge, la zone est minuscule et le curseur file. Concentre-toi.' : 'Appuie quand le curseur est dans la zone verte.';
    root.innerHTML = '<div class="modal qte ink-r"><div class="mKick"><span>URGENCES · ' + age + ' ANS</span><span>QTE</span></div>' +
      '<div class="mIn"><h2>Garde ton cœur en rythme</h2><p class="txt">Ta santé s’est effondrée. ' + hard + ' ' + NEED + ' battements réussis pour t’en sortir, ' + MISS + ' ratés et c’est fini.</p></div>' +
      '<div class="qArena ecg"><canvas></canvas></div>' +
      '<div class="qTrack"><div class="qZone"></div><div class="qCur"></div></div>' +
      '<div class="qStat"><span>Battements <span class="pips" id="qH">' + pips(NEED, 0) + '</span></span><span>Ratés <span class="pips err" id="qM">' + pips(MISS, 0) + '</span></span></div>' +
      '<button class="btn qBig" id="qBtn">Commencer</button></div>';
    const zone = root.querySelector('.qZone'), cur = root.querySelector('.qCur'), btn = root.querySelector('#qBtn');
    const cv = root.querySelector('canvas');
    let C = fitCanvas(cv);
    const trace = [];
    function newZone() { z0 = L.rand(0.05, 0.95 - w); zone.style.left = (z0 * 100) + '%'; zone.style.width = (w * 100) + '%'; }
    newZone();
    function draw(dt) {
      const g = C.g, W = C.w, Hh = C.h;
      // le tracé avance : un battement quand on réussit, une ligne plate quand on rate
      const x = (trace.length ? trace[trace.length - 1].x : 0) + dt * 120;
      let y = 0;
      if (beat > 0) { const t = 1 - beat; y = t < 0.2 ? -t * 5 : t < 0.35 ? (t - 0.2) * 14 - 1 : t < 0.5 ? -(t - 0.35) * 8 + 1.1 : 0; beat = Math.max(0, beat - dt * 2.5); }
      else if (flat > 0) { flat = Math.max(0, flat - dt); }
      else y = Math.sin(x / 9) * 0.04 + (Math.sin(x / 33) > 0.97 ? -0.25 : 0);
      trace.push({ x: x, y: y });
      while (trace.length && trace[0].x < x - W) trace.shift();
      g.clearRect(0, 0, W, Hh);
      g.strokeStyle = 'rgba(95,240,140,.15)'; g.lineWidth = 1;
      for (let gx = 0; gx < W; gx += 20) { g.beginPath(); g.moveTo(gx, 0); g.lineTo(gx, Hh); g.stroke(); }
      for (let gy = 0; gy < Hh; gy += 20) { g.beginPath(); g.moveTo(0, gy); g.lineTo(W, gy); g.stroke(); }
      g.strokeStyle = flat > 0 ? '#ff5a36' : '#5ff08c'; g.lineWidth = 2.5; g.beginPath();
      const off = x - W;
      trace.forEach(function (p, i) { const px = p.x - off, py = Hh / 2 + p.y * Hh * 0.42; if (i) g.lineTo(px, py); else g.moveTo(px, py); });
      g.stroke();
    }
    function frame(now) {
      if (state !== 'run') return;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      pos += dir * v * dt;
      if (pos > 1) { pos = 1; dir = -1; }
      if (pos < 0) { pos = 0; dir = 1; }
      cur.style.left = (pos * 100) + '%';
      draw(dt);
      raf = requestAnimationFrame(frame);
    }
    function update() { root.querySelector('#qH').innerHTML = pips(NEED, hits); root.querySelector('#qM').innerHTML = pips(MISS, miss); }
    function end(ok) {
      state = 'end';
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', key);
      btn.textContent = ok ? 'Tu t’en sors !' : 'Le cœur lâche…';
      btn.disabled = true;
      setTimeout(function () { done(ok); }, 900);
    }
    function press() {
      if (state === 'ready') { state = 'run'; btn.textContent = 'Choc !'; last = 0; C = fitCanvas(cv); raf = requestAnimationFrame(frame); return; }
      if (state !== 'run') return;
      if (pos >= z0 && pos <= z0 + w) { hits++; beat = 1; newZone(); if (L.SND) L.SND.play('beat'); } else { miss++; flat = 0.5; if (L.SND) L.SND.play('buzz'); }
      update();
      if (hits >= NEED) end(true); else if (miss >= MISS) end(false);
    }
    function key(e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); press(); } }
    btn.addEventListener('pointerdown', function (e) { e.preventDefault(); press(); });
    btn.addEventListener('click', function (e) { e.preventDefault(); if (e.detail === 0) press(); });
    document.addEventListener('keydown', key);
    draw(0);
    Q.cheat = function (ok) { if (state !== 'end') end(ok); };
  };

  // ---------- idées noires ----------
  Q.noir = function (root, helpers, sex, done) {
    const W = L.gx;
    const words = ['inutile', W('seul', 'seule', sex), 'à quoi bon', 'fatigue', 'personne', 'trop tard', 'vide', W('nul', 'nulle', sex), 'peur', 'honte', 'c’est fichu', 'pourquoi', 'tout est gris'];
    const n = helpers.length;
    const DUR = 15, LIVES = 3;
    let state = 'ready', t = 0, lives = LIVES, last = 0, raf = 0, spawnT = 0.3, thoughts = [], hT = [];
    const period = Math.max(1.3, 3.6 - n * 0.22);
    const names = helpers.length ? helpers.map(function (h) { return '<b>' + esc(h) + '</b>'; }).join(', ') : '';
    root.innerHTML = '<div class="modal qte ink-b"><div class="mKick"><span>IDÉES NOIRES</span><span>QTE</span></div>' +
      '<div class="mIn"><h2>Ne lâche pas</h2><p class="txt">Des pensées sombres t’envahissent. Touche-les pour les chasser avant qu’elles ne t’atteignent. ' + (n ? 'Les gens qui tiennent à toi sont là et t’aident : ' + names + '.' : 'Tu te sens terriblement [seul|seule]. Tiens bon quand même.') + ' Tiens ' + DUR + ' secondes.</p></div>' +
      '<div class="qArena" id="qA"><div class="core"></div><span class="qCap" id="qCap"></span></div>' +
      '<div class="qStat"><span>Espoir <span class="pips" id="qL">' + pips(LIVES, LIVES) + '</span></span><span id="qT">' + DUR + ' s</span></div>' +
      '<button class="btn qBig" id="qBtn">Je m’accroche</button>' + (L.UI && L.UI.HELP ? L.UI.HELP : '') + '</div>';
    root.querySelector('.mIn .txt').innerHTML = L.T(root.querySelector('.mIn .txt').innerHTML, { me: { sex: sex } });
    const arena = root.querySelector('#qA'), btn = root.querySelector('#qBtn'), cap = root.querySelector('#qCap');
    let R = arena.getBoundingClientRect();
    const hp = [];
    helpers.forEach(function (h, i) {
      const a = (i / Math.max(1, n)) * Math.PI * 2 - Math.PI / 2;
      const el = document.createElement('span');
      el.className = 'helper';
      el.textContent = h;
      arena.appendChild(el);
      hp.push({ a: a, el: el, name: h });
      hT.push(period * (0.4 + i / Math.max(1, n)));
    });
    function placeHelpers() {
      R = arena.getBoundingClientRect();
      const cx = R.width / 2, cy = R.height / 2, rr = Math.min(cx, cy) * 0.42;
      hp.forEach(function (h) { h.x = cx + Math.cos(h.a) * rr * 1.25; h.y = cy + Math.sin(h.a) * rr; h.el.style.left = h.x + 'px'; h.el.style.top = h.y + 'px'; });
    }
    placeHelpers();
    function kill(th, by) {
      th.dead = true;
      th.el.classList.add('pop');
      setTimeout(function () { th.el.remove(); }, 320);
      if (by) {
        const dx = th.x - by.x, dy = th.y - by.y;
        const b = document.createElement('span');
        b.className = 'beam';
        b.style.left = by.x + 'px'; b.style.top = by.y + 'px';
        b.style.width = Math.hypot(dx, dy) + 'px';
        b.style.transform = 'rotate(' + Math.atan2(dy, dx) + 'rad)';
        arena.appendChild(b);
        setTimeout(function () { b.remove(); }, 380);
        cap.textContent = by.name + ' est là.';
      }
    }
    function spawn() {
      const a = L.rand(0, Math.PI * 2);
      const cx = R.width / 2, cy = R.height / 2;
      const rad = Math.hypot(cx, cy) * 0.95;
      const th = { a: a, d: rad, x: 0, y: 0, sp: L.rand(0.17, 0.24) * rad, el: document.createElement('span') };
      th.el.className = 'thought';
      th.el.textContent = L.pick(words);
      th.el.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); if (!th.dead && state === 'run') kill(th); });
      arena.appendChild(th.el);
      thoughts.push(th);
    }
    function frame(now) {
      if (state !== 'run') return;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      t += dt;
      const cx = R.width / 2, cy = R.height / 2;
      spawnT -= dt;
      if (spawnT <= 0) { spawn(); spawnT = L.rand(0.48, 0.72) * (t > 9 ? 0.85 : 1); }
      thoughts.forEach(function (th) {
        if (th.dead) return;
        th.d -= th.sp * dt;
        th.x = cx + Math.cos(th.a) * th.d; th.y = cy + Math.sin(th.a) * th.d;
        th.el.style.left = th.x + 'px'; th.el.style.top = th.y + 'px';
        if (th.d < 26) {
          th.dead = true; th.el.remove();
          lives--;
          root.querySelector('#qL').innerHTML = pips(LIVES, lives);
          arena.animate && arena.animate([{ background: '#2a0d08' }, { background: '#050507' }], { duration: 350 });
          if (lives <= 0) end(false);
        }
      });
      thoughts = thoughts.filter(function (th) { return !th.dead; });
      hp.forEach(function (h, i) {
        hT[i] -= dt;
        if (hT[i] <= 0) {
          hT[i] = period * L.rand(0.85, 1.15);
          const live = thoughts.filter(function (th) { return !th.dead; }).sort(function (a, b) { return a.d - b.d; });
          if (live[0]) kill(live[0], h);
        }
      });
      root.querySelector('#qT').textContent = Math.max(0, Math.ceil(DUR - t)) + ' s';
      if (state === 'run' && t >= DUR) end(true);
      if (state === 'run') raf = requestAnimationFrame(frame);
    }
    function end(ok) {
      state = 'end';
      cancelAnimationFrame(raf);
      thoughts.forEach(function (th) { if (!th.dead) kill(th); });
      btn.disabled = true;
      btn.textContent = ok ? 'Tu tiens bon' : 'Le noir l’emporte';
      cap.textContent = ok ? 'Tu n’es pas [seul|seule].' : '';
      cap.textContent = L.T(cap.textContent, { me: { sex: sex } }).replace(/<[^>]+>/g, '');
      setTimeout(function () { done(ok); }, 1100);
    }
    btn.addEventListener('click', function () {
      if (state !== 'ready') return;
      state = 'run';
      btn.textContent = 'Tiens bon';
      btn.disabled = true;
      placeHelpers();
      last = 0;
      raf = requestAnimationFrame(frame);
    });
    window.addEventListener('resize', placeHelpers);
    Q.cheat = function (ok) { if (state !== 'end') end(ok); };
  };
})(window.LP);
