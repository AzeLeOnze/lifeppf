/* LifePPF — ambiance sonore générée en direct (Web Audio, aucun fichier) : bruitages d'imprimerie et musique lo-fi qui change avec l'âge. */
(function (L) {
  'use strict';
  const SND = L.SND = {};
  let ctx = null, master = null, sfxBus = null, musBus = null, delay = null, noiseBuf = null;
  let opts = { sfx: 1, mus: 1, vol: 0.7, mvol: 0.45 };
  let musicOn = false, timer = 0, step = 0, nextT = 0, mood = 'adult', bar = 0;

  function ok() { return !!ctx && ctx.state === 'running'; }
  function build() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = opts.vol;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3;
    master.connect(comp); comp.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = opts.sfx ? 1 : 0; sfxBus.connect(master);
    musBus = ctx.createGain(); musBus.gain.value = 0; musBus.connect(master);
    // écho doux pour la mélodie
    delay = ctx.createDelay(1); delay.delayTime.value = 0.54;
    const fb = ctx.createGain(); fb.gain.value = 0.28;
    const dl = ctx.createBiquadFilter(); dl.type = 'lowpass'; dl.frequency.value = 2200;
    delay.connect(dl); dl.connect(fb); fb.connect(delay); dl.connect(musBus);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  // à appeler sur un geste de l'utilisateur (les navigateurs l'exigent)
  SND.unlock = function () {
    build();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().then(function () { if (opts.mus && !musicOn) startMusic(); });
    else if (opts.mus && !musicOn) startMusic();
  };
  SND.set = function (o) {
    opts = Object.assign(opts, o || {});
    if (!ctx) return;
    master.gain.setTargetAtTime(opts.vol, ctx.currentTime, 0.05);
    sfxBus.gain.setTargetAtTime(opts.sfx ? 1 : 0, ctx.currentTime, 0.05);
    if (opts.mus && ok() && !musicOn) startMusic();
    if (!opts.mus && musicOn) stopMusic();
    if (musicOn) musBus.gain.setTargetAtTime(opts.mvol * 0.55, ctx.currentTime, 0.4);
  };
  SND.mood = function (m) { mood = m || 'adult'; };

  // ---------- briques ----------
  const hz = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };
  function env(g, t, a, peak, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
  function tone(bus, type, f, t, a, peak, dec, f2, filt) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + a + dec);
    let node = o;
    if (filt) { const bq = ctx.createBiquadFilter(); bq.type = 'lowpass'; bq.frequency.value = filt; o.connect(bq); node = bq; }
    node.connect(g); g.connect(bus);
    env(g, t, a, peak, dec);
    o.start(t); o.stop(t + a + dec + 0.05);
    return g;
  }
  function noise(bus, t, dur, peak, type, freq, q) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; s.loop = true;
    f.type = type || 'bandpass'; f.frequency.value = freq || 2000; f.Q.value = q || 1;
    s.connect(f); f.connect(g); g.connect(bus);
    env(g, t, 0.003, peak, dur);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }

  // ---------- bruitages ----------
  const FX = {
    tap: function (t) { noise(sfxBus, t, 0.03, 0.12, 'bandpass', 2600, 2); },
    stamp: function (t) { tone(sfxBus, 'sine', 140, t, 0.005, 0.55, 0.2, 45); noise(sfxBus, t, 0.07, 0.35, 'lowpass', 1400); noise(sfxBus, t + 0.02, 0.02, 0.12, 'highpass', 6000); },
    good: function (t) { [76, 80, 83].forEach(function (m, i) { tone(sfxBus, 'triangle', hz(m), t + i * 0.07, 0.01, 0.16, 0.25); }); },
    bad: function (t) { tone(sfxBus, 'square', hz(57), t, 0.01, 0.07, 0.18, 0, 900); tone(sfxBus, 'square', hz(53), t + 0.14, 0.01, 0.07, 0.3, 0, 700); },
    love: function (t) { tone(sfxBus, 'sine', hz(84), t, 0.01, 0.14, 0.6); tone(sfxBus, 'sine', hz(88), t + 0.12, 0.01, 0.12, 0.7); },
    money: function (t) { tone(sfxBus, 'square', 988, t, 0.004, 0.06, 0.06, 0, 4000); tone(sfxBus, 'square', 1319, t + 0.06, 0.004, 0.06, 0.25, 0, 4000); },
    ach: function (t) { [79, 83, 86, 91].forEach(function (m, i) { tone(sfxBus, 'sine', hz(m), t + i * 0.06, 0.005, 0.13, 0.35); }); noise(sfxBus, t + 0.2, 0.4, 0.04, 'highpass', 8000); },
    lvl: function (t) { [[67, 0], [71, 0.1], [74, 0.2], [79, 0.32]].forEach(function (x) { tone(sfxBus, 'sawtooth', hz(x[0]), t + x[1], 0.01, 0.07, 0.45, 0, 2500); tone(sfxBus, 'triangle', hz(x[0] - 12), t + x[1], 0.01, 0.1, 0.45); }); },
    blip: function (t) { tone(sfxBus, 'sine', 880, t, 0.003, 0.2, 0.08); },
    buzz: function (t) { tone(sfxBus, 'sawtooth', 110, t, 0.005, 0.12, 0.18, 0, 800); },
    beat: function (t) { tone(sfxBus, 'sine', 70, t, 0.004, 0.4, 0.12, 40); tone(sfxBus, 'sine', 60, t + 0.16, 0.004, 0.28, 0.12, 35); },
    knell: function (t) { [1, 2.76, 5.4].forEach(function (k, i) { tone(sfxBus, 'sine', 196 * k, t, 0.01, 0.18 / (i + 1), 3.2 / (i + 1)); }); },
    boot: function (t) { [60, 64, 67, 72, 76, 79, 84].forEach(function (m, i) { tone(sfxBus, 'square', hz(m), t + i * 0.07, 0.005, 0.05, 0.08, 0, 3500); }); tone(sfxBus, 'square', hz(91), t + 0.6, 0.005, 0.05, 0.35, 0, 3500); },
    page: function (t) { noise(sfxBus, t, 0.12, 0.08, 'bandpass', 3500, 0.7); },
    projector: function (t) {
      tone(sfxBus, 'sawtooth', 55, t, 0.2, 0.025, 2.2, 0, 300);
      for (let i = 0; i < 48; i++) noise(sfxBus, t + i / 22, 0.012, 0.05 + Math.random() * 0.03, 'bandpass', 3200, 3);
    },
    crowd: function (t) {
      noise(sfxBus, t, 1.8, 0.12, 'lowpass', 1100, 0.5);
      for (let i = 0; i < 4; i++) tone(sfxBus, 'sine', 120, t + 0.25 + i * 0.36, 0.004, 0.45, 0.2, 45);
      [72, 76, 79].forEach(function (m, i) { tone(sfxBus, 'sawtooth', hz(m), t + 1.5 + i * 0.05, 0.02, 0.04, 0.6, 0, 3000); });
    }
  };
  SND.play = function (name) {
    if (!opts.sfx || !ok() || !FX[name]) return;
    try { FX[name](ctx.currentTime + 0.01); } catch (e) { /* son ignoré */ }
  };

  // ---------- musique : lo-fi d'imprimerie, l'ambiance suit l'âge ----------
  const SONGS = {
    kid: { bpm: 92, ch: [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 64]], sc: [72, 74, 76, 79, 81, 84] },
    adult: { bpm: 82, ch: [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [52, 55, 59, 62]], sc: [69, 72, 74, 76, 79, 81] },
    old: { bpm: 70, ch: [[50, 53, 57, 60], [55, 59, 62, 65], [48, 52, 55, 59], [57, 60, 64, 67]], sc: [67, 69, 72, 74, 76, 79] }
  };
  function schedule(t, s) {
    const song = SONGS[mood] || SONGS.adult;
    const chord = song.ch[bar % 4];
    const b16 = 60 / song.bpm / 4;
    if (s === 0) {
      // nappe : accord lent et filtré
      chord.forEach(function (m, i) { tone(musBus, i % 2 ? 'triangle' : 'sawtooth', hz(m) * (1 + (i - 1.5) * 0.0015), t, 0.7, 0.03, b16 * 16 + 0.6, 0, 850); });
      tone(musBus, 'triangle', hz(chord[0] - 24), t, 0.02, 0.16, b16 * 6, 0, 420);
    }
    if (s === 8) tone(musBus, 'triangle', hz(chord[0] - 24), t, 0.02, 0.13, b16 * 5, 0, 420);
    if (s === 14 && Math.random() < 0.5) tone(musBus, 'triangle', hz(chord[2] - 24), t, 0.02, 0.1, b16 * 2, 0, 420);
    // grosse caisse douce, charleston, « clac » de presse d'imprimerie
    if (s === 0 || s === 8 || (s === 10 && Math.random() < 0.3)) tone(musBus, 'sine', 95, t, 0.004, 0.32, 0.16, 42);
    if (s % 4 === 2) noise(musBus, t, 0.03, 0.035, 'highpass', 7500);
    if (s === 4 || s === 12) { noise(musBus, t, 0.05, 0.07, 'bandpass', 1800, 1.4); noise(musBus, t + 0.012, 0.02, 0.05, 'bandpass', 4200, 4); }
    // mélodie au hasard dans la gamme, avec écho
    if (s % 2 === 0 && Math.random() < (mood === 'kid' ? 0.32 : 0.22)) {
      const m = L.pick ? L.pick(song.sc) : song.sc[0];
      const g = tone(musBus, 'triangle', hz(m), t, 0.005, 0.06, 0.35);
      g.connect(delay);
    }
    // craquements de vinyle
    if (Math.random() < 0.12) noise(musBus, t + Math.random() * b16, 0.004, 0.03 + Math.random() * 0.03, 'highpass', 3000);
  }
  function tick() {
    if (!ok()) return;
    const song = SONGS[mood] || SONGS.adult;
    const b16 = 60 / song.bpm / 4;
    while (nextT < ctx.currentTime + 0.25) {
      schedule(nextT, step);
      nextT += b16;
      step = (step + 1) % 16;
      if (step === 0) bar++;
    }
  }
  function startMusic() {
    if (!ok() || musicOn) return;
    musicOn = true;
    step = 0; bar = 0; nextT = ctx.currentTime + 0.1;
    musBus.gain.cancelScheduledValues(ctx.currentTime);
    musBus.gain.setValueAtTime(0.0001, ctx.currentTime);
    musBus.gain.linearRampToValueAtTime(opts.mvol * 0.55, ctx.currentTime + 2.5);
    timer = setInterval(tick, 60);
  }
  function stopMusic() {
    musicOn = false;
    clearInterval(timer);
    if (ctx) musBus.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2);
  }
  document.addEventListener('visibilitychange', function () {
    if (!ctx) return;
    if (document.hidden) { stopMusic(); ctx.suspend(); }
    else ctx.resume().then(function () { if (opts.mus) startMusic(); });
  });
})(window.LP);
