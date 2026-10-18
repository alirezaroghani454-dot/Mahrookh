/* ==========================================================================
   ماه‌رخ — js/features/extras.js
   افکت‌های تکمیلی:
   - مکعب سه‌بعدی بنر ویژه
   - کپی کد تخفیف
   - انیمیشن «پرواز به سبد» هنگام افزودن محصول
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;

  function bump() {
    M.$$('[data-count="cart"]').forEach(function (b) {
      b.classList.remove('bump');
      void b.offsetWidth;
      b.classList.add('bump');
    });
  }

  /* ---------- پرواز تصویر محصول به سمت سبد ---------- */
  M.flyToCart = function (fromEl, p, shadeIdx) {
    if (M.prefersReduced || !fromEl || !p) return;

    var targetBtn = M.isMobile() ? M.$('.bottom-nav__btn[data-open="cart"]') : M.$('#cartBtn');
    if (!targetBtn) return;

    var srcBox = fromEl.closest('.pcard__media, .qv__stage, .sresult, .qpick, .citem') || fromEl;
    var from = srcBox.getBoundingClientRect();
    var to = targetBtn.getBoundingClientRect();
    if (to.bottom < 0 || to.top > window.innerHeight || !to.width) return;

    var g = document.createElement('div');
    g.className = 'fly';
    g.setAttribute('aria-hidden', 'true');
    g.innerHTML = M.artFor(p, shadeIdx || 0);
    document.body.appendChild(g);

    var x0 = from.left + from.width / 2 - 32, y0 = from.top + from.height / 2 - 38;
    var x1 = to.left + to.width / 2 - 32, y1 = to.top + to.height / 2 - 38;
    var mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 90;

    var anim = g.animate([
      { transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(1)', opacity: 1 },
      { transform: 'translate(' + mx + 'px,' + my + 'px) scale(.75)', opacity: 1, offset: 0.5 },
      { transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(.18)', opacity: 0.3 }
    ], { duration: 850, easing: 'cubic-bezier(.4,0,.6,1)' });

    anim.onfinish = function () {
      if (g.parentNode) g.parentNode.removeChild(g);
      bump();
    };
  };

  /* ---------- کپی در کلیپ‌بورد ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-100px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy') ? resolve() : reject(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }

  M.register('extras', function () {
    /* مکعب سه‌بعدی */
    var cube = M.$('#cube');
    if (cube) {
      var faces = [['lipstick', '#e259ad'], ['serum', '#78e6d6'], ['perfume', '#9b6bd6'], ['compact', '#f2b5a0']];
      var moon = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#7a3fb5"/>' +
        '<path d="M33 12a15 15 0 1 0 0 24 12 12 0 0 1 0-24Z" fill="#fff"/><circle cx="35" cy="14" r="2.3" fill="#78e6d6"/></svg>';
      cube.innerHTML = faces.map(function (f) {
        return '<div class="cube__face">' + M.art(f[0], f[1]) + '</div>';
      }).join('') + '<div class="cube__face">' + moon + '</div><div class="cube__face">' + moon + '</div>';
    }

    /* کپی کد تخفیف */
    var btn = M.$('#copyCode');
    var code = M.$('#promoCode');
    if (btn && code) {
      btn.addEventListener('click', function () {
        copyText(code.textContent.trim()).then(function () {
          M.toast('کد تخفیف کپی شد: ' + code.textContent.trim());
        }).catch(function () {
          M.toast('کپی نشد؛ کد را دستی بنویس: ' + code.textContent.trim(), 'err');
        });
      });
    }
  });
})();
