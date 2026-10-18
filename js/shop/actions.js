/* ==========================================================================
   ماه‌رخ — js/shop/actions.js
   رویدادهای سراسری فروشگاه با delegation (برای کارت‌هایی که بعداً ساخته
   می‌شوند هم کار می‌کند):
   data-add     ← افزودن به سبد
   data-wish    ← علاقه‌مندی
   data-quick   ← نمای سریع سه‌بعدی
   data-checkout← تکمیل سفارش
   data-reset-filters ← پاک‌کردن فیلترهای فروشگاه
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;

  /* تابع مرکزی افزودن به سبد: پیام + انیمیشن پرواز */
  M.addToCart = function (id, shade, qty, srcEl) {
    var r = M.cart.add(id, shade, qty);
    if (!r.ok) { M.toast(r.reason, 'err'); return r; }
    var p = M.prodById[id];
    M.toast('«' + p.name + '» به سبد خرید اضافه شد' + (r.capped ? ' (به حداکثر مجاز رسید)' : ''));
    if (srcEl && M.flyToCart) M.flyToCart(srcEl, p, shade);
    return r;
  };

  M.register('actions', function () {
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-add]');
      if (t) {
        var r = M.addToCart(t.getAttribute('data-add'), 0, 1, t);
        if (r.ok) {
          var label = t.textContent;
          t.classList.add('is-added');
          t.textContent = 'اضافه شد';
          setTimeout(function () { t.classList.remove('is-added'); t.textContent = label; }, 1400);
        }
        return;
      }

      t = e.target.closest('[data-wish]');
      if (t) {
        var added = M.wish.toggle(t.getAttribute('data-wish'));
        t.classList.remove('pop');
        void t.offsetWidth;
        t.classList.add('pop');
        M.toast(added ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد');
        return;
      }

      t = e.target.closest('[data-quick]');
      if (t) {
        e.preventDefault();
        M.quickview.open(t.getAttribute('data-quick'));
        return;
      }

      if (e.target.closest('[data-checkout]')) { M.checkout.open(); return; }
      if (e.target.closest('[data-reset-filters]')) M.bus.emit('shop:reset');
    });
  });
})();
