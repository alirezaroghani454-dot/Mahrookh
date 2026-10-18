/* ==========================================================================
   ماه‌رخ — js/shop/quickview.js
   نمای سریع محصول با صحنهٔ سه‌بعدی:
   تصویر محصول در ۹ لایه با فاصلهٔ عمقی چیده می‌شود، پس هنگام چرخش حجم و
   ضخامت دارد. با ماوس یا انگشت بکشید تا بچرخد؛ در حالت استراحت آرام تاب می‌خورد.
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;
  var LAYERS = 9;

  var st = { p: null, shade: 0, qty: 1, tab: 'desc' };
  var rot = { ry: 0, rx: 0, spin: 0, dragRx: 0, dragging: false, raf: 0, sx: 0, sy: 0 };

  function layersHTML() {
    var out = '';
    for (var i = 0; i < LAYERS; i++) {
      var z = (i - (LAYERS - 1) / 2) * 6;
      out += '<div class="qv__layer' + (i === LAYERS - 1 ? ' is-front' : '') + '" style="--z:' + z + 'px">' + M.artFor(st.p, st.shade) + '</div>';
    }
    return out;
  }

  function panelHTML() {
    var p = st.p;
    if (st.tab === 'feats') return '<ul>' + p.feats.map(function (f) { return '<li>' + M.esc(f) + '</li>'; }).join('') + '</ul>';
    if (st.tab === 'how') return '<p>' + M.esc(p.how) + '</p>';
    return '<p>' + M.esc(p.desc) + '</p>';
  }

  function limit() { return Math.min(st.p.stock, M.data.config.maxQty); }

  function build() {
    var p = st.p;
    var sh = M.shadeOf(p, st.shade);
    var multi = p.shades.length > 1;
    var out = p.stock <= 0;
    var wished = M.wish.has(p.id);

    var shades = '';
    if (multi) {
      shades = '<div class="qv__shade-label">رنگ: <b id="qvShadeName">' + M.esc(sh.n) + '</b></div>' +
        '<div class="qv__shades" role="group" aria-label="انتخاب رنگ">' +
        p.shades.map(function (s, i) {
          return '<button type="button" class="swatch" data-shade="' + i + '" style="--c:' + s.c + '" aria-label="' + M.esc(s.n) + '" aria-pressed="' + (i === st.shade) + '"></button>';
        }).join('') + '</div>';
    } else {
      shades = '<div class="qv__shade-label">حجم: <b>' + M.esc(sh.n) + '</b></div>';
    }

    var buy = out
      ? '<button type="button" class="btn" disabled>ناموجود</button>'
      : '<div class="qty" role="group" aria-label="تعداد">' +
          '<button type="button" data-qv-qty="-1" aria-label="کاهش تعداد">' + M.icon('minus') + '</button>' +
          '<span class="qty__n" id="qvQty" aria-live="polite">' + M.toFa(st.qty) + '</span>' +
          '<button type="button" data-qv-qty="1" aria-label="افزایش تعداد">' + M.icon('plus') + '</button></div>' +
        '<button type="button" class="btn" id="qvAdd">' + M.icon('bag') + 'افزودن به سبد</button>';

    M.$('#qvContent').innerHTML =
      '<div class="qv">' +
        '<div class="qv__stage" id="qvStage" style="--tint:' + sh.c + '">' +
          '<div class="qv__turn" id="qvTurn">' + layersHTML() + '</div>' +
          '<div class="qv__shadow"></div>' +
          '<p class="qv__hint">برای چرخاندن، بکشید</p>' +
        '</div>' +
        '<div class="qv__info">' +
          '<span class="qv__brand">' + M.esc(p.brand) + '</span>' +
          '<h2 class="qv__title">' + M.esc(p.name) + '</h2>' +
          '<div class="qv__rating">' + M.starsHTML(p.rating) + '<span class="rating">' + M.rate(p.rating) + ' (' + M.toFa(p.votes) + ' نظر)</span></div>' +
          M.priceHTML(p) +
          shades +
          '<div class="tabs" role="tablist" aria-label="اطلاعات محصول">' +
            '<button type="button" role="tab" data-tab="desc" aria-selected="true">توضیحات</button>' +
            '<button type="button" role="tab" data-tab="feats" aria-selected="false">ویژگی‌ها</button>' +
            '<button type="button" role="tab" data-tab="how" aria-selected="false">روش استفاده</button></div>' +
          '<div class="tab-panel" id="qvPanel" role="tabpanel">' + panelHTML() + '</div>' +
          '<div class="qv__buy">' + buy +
            '<button type="button" class="icon-btn" data-wish="' + p.id + '" aria-pressed="' + wished + '" aria-label="علاقه‌مندی">' + M.icon('heart') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* ---------- حلقهٔ چرخش ---------- */
  function loop(now) {
    var turn = M.$('#qvTurn');
    if (!turn) { rot.raf = 0; return; }
    var t = now / 1000;
    var amp = M.prefersReduced ? 0 : 1;

    if (!rot.dragging) {
      rot.dragRx *= 0.97;
      rot.ry += (rot.spin + Math.sin(t * 0.9) * 18 * amp - rot.ry) * 0.08;
      rot.rx += (rot.dragRx + Math.sin(t * 0.6) * 4 * amp - rot.rx) * 0.08;
    }
    turn.style.setProperty('--ry', rot.ry.toFixed(2) + 'deg');
    turn.style.setProperty('--rx', rot.rx.toFixed(2) + 'deg');
    rot.raf = requestAnimationFrame(loop);
  }

  function startLoop() {
    if (!rot.raf) rot.raf = requestAnimationFrame(loop);
  }
  function stopLoop() {
    cancelAnimationFrame(rot.raf);
    rot.raf = 0;
  }

  function onDragMove(e) {
    var dx = e.clientX - rot.sx;
    var dy = e.clientY - rot.sy;
    rot.sx = e.clientX; rot.sy = e.clientY;
    rot.spin += dx * 0.6;
    rot.ry = rot.spin;
    rot.dragRx = M.clamp(rot.dragRx - dy * 0.3, -25, 25);
    rot.rx = rot.dragRx;
  }
  function onDragEnd() {
    rot.dragging = false;
    window.removeEventListener('pointermove', onDragMove);
    window.removeEventListener('pointerup', onDragEnd);
    window.removeEventListener('pointercancel', onDragEnd);
  }

  /* ---------- API ---------- */
  M.quickview = {
    open: function (id, shadeIdx) {
      var p = M.prodById[id];
      if (!p) return;
      st.p = p;
      st.shade = shadeIdx || 0;
      st.qty = 1;
      st.tab = 'desc';
      rot.ry = -30; rot.rx = 0; rot.spin = 0; rot.dragRx = 0;
      build();
      M.overlay.open('quick');
      startLoop();
    }
  };

  M.register('quickview', function () {
    var host = M.$('#qvContent');
    if (!host) return;

    M.bus.on('overlay:close', function (name) { if (name === 'quick') stopLoop(); });

    host.addEventListener('pointerdown', function (e) {
      var stage = e.target.closest('#qvStage');
      if (!stage) return;
      rot.dragging = true;
      rot.sx = e.clientX; rot.sy = e.clientY;
      window.addEventListener('pointermove', onDragMove);
      window.addEventListener('pointerup', onDragEnd);
      window.addEventListener('pointercancel', onDragEnd);
    });

    host.addEventListener('click', function (e) {
      var t = e.target.closest('[data-shade]');
      if (t) {
        st.shade = parseInt(t.getAttribute('data-shade'), 10);
        var sh = M.shadeOf(st.p, st.shade);
        M.$$('.swatch', host).forEach(function (s, i) { s.setAttribute('aria-pressed', i === st.shade ? 'true' : 'false'); });
        var nm = M.$('#qvShadeName'); if (nm) nm.textContent = sh.n;
        M.$('#qvStage').style.setProperty('--tint', sh.c);
        M.$('#qvTurn').innerHTML = layersHTML();
        return;
      }

      t = e.target.closest('[data-tab]');
      if (t) {
        st.tab = t.getAttribute('data-tab');
        M.$$('[data-tab]', host).forEach(function (b) { b.setAttribute('aria-selected', b === t ? 'true' : 'false'); });
        M.$('#qvPanel').innerHTML = panelHTML();
        return;
      }

      t = e.target.closest('[data-qv-qty]');
      if (t) {
        st.qty = M.clamp(st.qty + parseInt(t.getAttribute('data-qv-qty'), 10), 1, limit());
        M.$('#qvQty').textContent = M.toFa(st.qty);
        return;
      }

      t = e.target.closest('#qvAdd');
      if (t) {
        var r = M.addToCart(st.p.id, st.shade, st.qty, M.$('#qvStage'));
        if (r && r.ok) {
          t.innerHTML = M.icon('check') + 'به سبد اضافه شد';
          setTimeout(function () { if (t.isConnected) t.innerHTML = M.icon('bag') + 'افزودن به سبد'; }, 1500);
        }
      }
    });
  });
})();
