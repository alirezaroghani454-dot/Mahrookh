/* ==========================================================================
   ماه‌رخ — js/3d/ring.js
   حلقهٔ سه‌بعدی دسته‌بندی‌ها (carousel با CSS 3D):
   - کشیدن با ماوس/لمس، چرخش اینرسی و چسبیدن به نزدیک‌ترین کارت
   - چرخش خودکار آرام وقتی کاربر کاری نمی‌کند
   - دکمه‌های قبلی/بعدی و کلیدهای جهت‌نما
   - کلیک روی کارت جلویی، فروشگاه را روی همان دسته فیلتر می‌کند
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;

  M.register('ring', function () {
    var stage = M.$('#ringStage');
    var track = M.$('#ringTrack');
    if (!stage || !track) return;

    var cats = M.data.categories;
    var n = cats.length;
    var step = 360 / n;

    /* ---------- ساخت کارت‌ها ---------- */
    track.innerHTML = cats.map(function (c, i) {
      var count = M.data.products.filter(function (p) { return p.cat === c.id; }).length;
      return '<div class="ring__item" data-i="' + i + '" style="--i:' + i + ';--tint:' + c.tint + '">' +
        '<button type="button" class="ring__card" data-cat="' + c.id + '" aria-label="' + M.esc(c.name) + '، ' + M.toFa(count) + ' محصول">' +
        '<span class="ring__art">' + M.art(c.art, c.tint) + '</span>' +
        '<span class="ring__name">' + M.esc(c.name) + '</span>' +
        '<span class="ring__count">' + M.toFa(count) + ' محصول</span></button></div>';
    }).join('');
    track.style.setProperty('--step', step + 'deg');

    var items = M.$$('.ring__item', track);
    items.forEach(function (it) { it.style.backfaceVisibility = 'hidden'; });

    /* ---------- ابعاد ---------- */
    function size() {
      var w = stage.clientWidth;
      var iw = w < 520 ? 156 : w < 900 ? 188 : 210;
      var R = (iw / 2) / Math.tan(Math.PI / n) + (iw < 170 ? 24 : 44);
      track.style.setProperty('--iw', iw + 'px');
      track.style.setProperty('--R', R.toFixed(1) + 'px');
      track.style.height = Math.round(iw * 1.55) + 'px';
    }
    size();
    if ('ResizeObserver' in window) new ResizeObserver(M.debounce(size, 100)).observe(stage);

    /* ---------- وضعیت چرخش ---------- */
    var rot = 0;
    var vel = 0;
    var target = 0;
    var mode = 'idle';          // idle | auto | drag | inertia | snap
    var resumeAt = 0;
    var hovering = false;
    var focused = false;
    var dragStartX = 0, dragStartRot = 0, lastX = 0, lastT = 0, moved = 0;

    function nearest(v) { return Math.round(v / step) * step; }

    function render() {
      track.style.setProperty('--rot', rot.toFixed(2) + 'deg');
      for (var i = 0; i < items.length; i++) {
        var a = (((i * step + rot) % 360) + 540) % 360 - 180;     // ۰ = جلوی چشم
        var c = Math.cos(a * Math.PI / 180);
        var it = items[i];
        it.style.opacity = (0.28 + 0.72 * M.clamp((c + 0.35) / 1.35, 0, 1)).toFixed(2);
        it.style.pointerEvents = c > 0.35 ? 'auto' : 'none';
        it.firstChild.tabIndex = c > 0.5 ? 0 : -1;
        it.dataset.a = a.toFixed(1);
      }
    }

    function goTo(newTarget) {
      target = newTarget;
      if (M.prefersReduced) { rot = target; mode = 'idle'; render(); return; }
      mode = 'snap';
    }

    /* ---------- حلقهٔ انیمیشن ---------- */
    var loop = M.visibleLoop(stage, function (t, dt) {
      if (mode === 'auto') {
        rot += 6 * dt;
      } else if (mode === 'inertia') {
        rot += vel * dt;
        vel *= Math.exp(-dt * 3.2);
        if (Math.abs(vel) < 12) { target = nearest(rot); mode = 'snap'; }
      } else if (mode === 'snap') {
        rot += (target - rot) * (1 - Math.exp(-dt * 7));
        if (Math.abs(target - rot) < 0.05) { rot = target; mode = 'idle'; resumeAt = performance.now() + 2500; }
      } else if (mode === 'idle') {
        if (!hovering && !focused && performance.now() > resumeAt) mode = 'auto';
      }
      if (mode === 'auto' && (hovering || focused)) { target = nearest(rot); mode = 'snap'; }
      render();
    });

    /* ---------- کشیدن ---------- */
    function onMove(e) {
      var dx = e.clientX - dragStartX;
      moved = Math.max(moved, Math.abs(dx));
      var now = performance.now();
      var dt = Math.max(1, now - lastT) / 1000;
      var v = ((e.clientX - lastX) * 0.32) / dt;
      vel = vel * 0.5 + v * 0.5;
      lastX = e.clientX; lastT = now;
      rot = dragStartRot + dx * 0.32;
      if (M.prefersReduced) render();
    }

    function onUp() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      stage.classList.remove('is-drag');
      if (Math.abs(vel) > 20 && !M.prefersReduced) mode = 'inertia';
      else { target = nearest(rot); goTo(target); }
    }

    stage.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      mode = 'drag';
      moved = 0; vel = 0;
      dragStartX = lastX = e.clientX;
      dragStartRot = rot;
      lastT = performance.now();
      stage.classList.add('is-drag');
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    });

    stage.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hovering = true; });
    stage.addEventListener('pointerleave', function () { hovering = false; });
    stage.addEventListener('focusin', function () { focused = true; });
    stage.addEventListener('focusout', function () { focused = false; });

    /* ---------- کلیک روی کارت ---------- */
    track.addEventListener('click', function (e) {
      var card = e.target.closest('.ring__card');
      if (!card) return;
      if (moved > 6) { e.preventDefault(); return; }

      var item = card.parentNode;
      var a = parseFloat(item.dataset.a || '0');
      if (Math.abs(a) > 25) { goTo(rot - a); return; }

      M.bus.emit('shop:category', card.getAttribute('data-cat'));
    });

    /* ---------- دکمه‌ها و کیبورد ---------- */
    var prev = M.$('#ringPrev');
    var next = M.$('#ringNext');
    if (prev) prev.addEventListener('click', function () { goTo(nearest(target || rot) + step); });
    if (next) next.addEventListener('click', function () { goTo(nearest(target || rot) - step); });

    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(nearest(target || rot) - step); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(nearest(target || rot) + step); }
    });

    render();
    if (M.prefersReduced) { mode = 'idle'; render(); }
    else { mode = 'idle'; resumeAt = performance.now() + 1500; loop.start(); }
  });
})();
