/* ==========================================================================
   ماه‌رخ — js/shop/wishlistUI.js
   کشوی علاقه‌مندی‌ها و همگام‌سازی وضعیت دکمهٔ قلب روی همهٔ کارت‌ها.
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;

  M.register('wishlistUI', function () {
    var drawer = M.$('#wishDrawer');
    var body = M.$('#wishBody');
    if (!drawer || !body) return;

    function paintBadges(bump) {
      var n = M.wish.count();
      M.$$('[data-count="wish"]').forEach(function (b) {
        b.textContent = M.toFa(n);
        b.setAttribute('data-zero', n === 0 ? 'true' : 'false');
        if (bump) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
      });
    }

    /* قلب‌های روی کارت‌ها و نمای سریع */
    function syncHearts() {
      M.$$('[data-wish]:not(.citem__rm)').forEach(function (b) {
        b.setAttribute('aria-pressed', M.wish.has(b.getAttribute('data-wish')) ? 'true' : 'false');
      });
    }

    function render() {
      var list = M.wish.list();
      if (!list.length) {
        body.innerHTML = '<div class="empty">' + M.emptyArt() +
          '<h3>هنوز چیزی ذخیره نکرده‌ای</h3>' +
          '<p>روی قلب هر محصول بزن تا اینجا ذخیره شود.</p>' +
          '<a class="btn" href="#shop" data-close>دیدن محصولات</a></div>';
        return;
      }

      body.innerHTML = list.map(function (p) {
        var out = p.stock <= 0;
        var act = out
          ? '<span class="citem__meta">ناموجود</span>'
          : (M.hasChoices(p)
            ? '<button type="button" class="btn btn--sm" data-quick="' + p.id + '">انتخاب رنگ</button>'
            : '<button type="button" class="btn btn--sm" data-add="' + p.id + '">افزودن به سبد</button>');
        return '<div class="citem is-new">' +
          '<div class="citem__art">' + M.artFor(p, 0) + '</div>' +
          '<div class="citem__info">' +
            '<h3 class="citem__name">' + M.esc(p.name) + '</h3>' +
            '<div class="citem__meta"><span>' + M.esc(p.brand) + '</span></div>' +
            '<div class="citem__row">' + M.priceHTML(p) + act +
              '<button type="button" class="citem__rm" data-wish="' + p.id + '" aria-label="حذف ' + M.esc(p.name) + ' از علاقه‌مندی‌ها">' + M.icon('trash') + '</button>' +
            '</div></div></div>';
      }).join('');
    }

    M.bus.on('wish:change', function () { paintBadges(true); syncHearts(); render(); });
    M.bus.on('overlay:open', function (name) { if (name === 'wish') render(); });

    /* کارت‌های ساخته‌شده بعد از بارگذاری هم باید قلب درست داشته باشند */
    new MutationObserver(M.debounce(syncHearts, 50)).observe(document.body, { childList: true, subtree: true });

    paintBadges(false);
    render();
  });
})();
