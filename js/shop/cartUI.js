/* ==========================================================================
   ماه‌رخ — js/shop/cartUI.js
   نمایش کشوی سبد خرید: ردیف‌ها، تعداد، حذف، کد تخفیف، نوار ارسال رایگان،
   جمع‌ها و شمارندهٔ بالای صفحه.
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;

  M.register('cartUI', function () {
    var drawer = M.$('#cartDrawer');
    var body = M.$('#cartBody');
    var foot = M.$('#cartFoot');
    if (!drawer || !body || !foot) return;

    var known = {};
    var couponMsg = null;     // { ok, text }

    /* ---------- شمارنده‌ها ---------- */
    function paintBadges(bump) {
      var n = M.cart.count();
      M.$$('[data-count="cart"]').forEach(function (b) {
        b.textContent = M.toFa(n);
        b.setAttribute('data-zero', n === 0 ? 'true' : 'false');
        if (bump) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
      });
    }

    /* ---------- ردیف سبد ---------- */
    function itemHTML(it) {
      var p = it.product;
      var multi = p.shades.length > 1;
      var meta = (multi ? '<span class="citem__dot" style="--c:' + it.shade.c + '"></span>' : '') +
        '<span>' + M.esc(multi ? it.shade.n : p.brand) + '</span>';
      return '<div class="citem' + (known[it.key] ? '' : ' is-new') + '" data-key="' + it.key + '">' +
        '<div class="citem__art">' + M.artFor(p, it.shadeIdx) + '</div>' +
        '<div class="citem__info">' +
          '<h3 class="citem__name">' + M.esc(p.name) + '</h3>' +
          '<div class="citem__meta">' + meta + '</div>' +
          '<div class="citem__row">' +
            '<div class="qty" role="group" aria-label="تعداد ' + M.esc(p.name) + '">' +
              '<button type="button" data-qty="' + it.key + '" data-delta="-1" aria-label="کاهش تعداد">' + M.icon('minus') + '</button>' +
              '<span class="qty__n">' + M.toFa(it.qty) + '</span>' +
              '<button type="button" data-qty="' + it.key + '" data-delta="1" aria-label="افزایش تعداد">' + M.icon('plus') + '</button></div>' +
            '<div class="price"><span class="price__now">' + M.fmt(it.total) + '<small>تومان</small></span></div>' +
            '<button type="button" class="citem__rm" data-rm="' + it.key + '" aria-label="حذف ' + M.esc(p.name) + ' از سبد">' + M.icon('trash') + '</button>' +
          '</div></div></div>';
    }

    /* ---------- رندر ---------- */
    function render() {
      var s = M.cart.summary();

      if (!s.items.length) {
        body.innerHTML = '<div class="empty">' + M.emptyArt() +
          '<h3>سبد خریدت خالی است</h3>' +
          '<p>محصولاتی را که دوست داری به سبد اضافه کن.</p>' +
          '<a class="btn" href="#shop" data-close>شروع خرید</a></div>';
        foot.hidden = true;
        known = {};
        return;
      }

      var shipMsg = s.freeLeft > 0
        ? 'تا ارسال رایگان <b>' + M.price(s.freeLeft) + '</b> دیگر مانده'
        : 'ارسال سفارش تو رایگان شد';

      body.innerHTML =
        '<div class="ship-bar"><p>' + shipMsg + '</p>' +
        '<div class="ship-bar__track"><div class="ship-bar__fill" id="shipFill" style="--w:0%"></div></div></div>' +
        s.items.map(itemHTML).join('');

      requestAnimationFrame(function () {
        var f = M.$('#shipFill');
        if (f) f.style.setProperty('--w', s.freePct + '%');
      });

      known = {};
      s.items.forEach(function (it) { known[it.key] = true; });

      var msgHTML = couponMsg
        ? '<div class="coupon__msg ' + (couponMsg.ok ? 'ok' : 'err') + '" role="status">' + M.esc(couponMsg.text) + '</div>'
        : '<div class="coupon__msg"></div>';

      foot.hidden = false;
      foot.innerHTML =
        '<form class="coupon" id="couponForm" novalidate>' +
          '<label class="sr-only" for="couponInput">کد تخفیف</label>' +
          '<input class="input" id="couponInput" placeholder="کد تخفیف" autocomplete="off" dir="ltr" style="text-align:start">' +
          '<button type="submit" class="btn btn--ghost btn--sm">اعمال</button></form>' + msgHTML +
        '<div class="totals">' +
          '<div class="totals__row"><span>جمع کالاها</span><b>' + M.price(s.subtotal) + '</b></div>' +
          (s.discount ? '<div class="totals__row totals__row--off"><span>تخفیف (' + M.esc(s.couponCode) + ')</span><b>−' + M.price(s.discount) + '</b></div>' : '') +
          '<div class="totals__row"><span>هزینهٔ ارسال</span><b>' + (s.shipping ? M.price(s.shipping) : 'رایگان') + '</b></div>' +
          '<div class="totals__row totals__row--grand"><span>مبلغ قابل پرداخت</span><span>' + M.price(s.total) + '</span></div></div>' +
        '<button type="button" class="btn btn--block" data-checkout>ثبت سفارش</button>';
    }

    /* ---------- رویدادهای داخل کشو ---------- */
    drawer.addEventListener('click', function (e) {
      var t = e.target.closest('[data-qty]');
      if (t) {
        var key = t.getAttribute('data-qty');
        var cur = M.cart.summary().items.filter(function (i) { return i.key === key; })[0];
        if (cur) M.cart.setQty(key, cur.qty + parseInt(t.getAttribute('data-delta'), 10));
        return;
      }
      t = e.target.closest('[data-rm]');
      if (t) M.cart.remove(t.getAttribute('data-rm'));
    });

    drawer.addEventListener('submit', function (e) {
      if (e.target.id !== 'couponForm') return;
      e.preventDefault();
      var r = M.cart.applyCoupon(M.$('#couponInput').value);
      couponMsg = { ok: r.ok, text: r.msg };
      render();
    });

    /* ---------- اتصال به رویدادها ---------- */
    M.bus.on('cart:change', function () { paintBadges(true); render(); });
    M.bus.on('overlay:open', function (name) { if (name === 'cart') { known = {}; couponMsg = null; render(); } });
    M.bus.on('overlay:close', function (name) { if (name === 'cart') known = {}; });

    paintBadges(false);
    render();
  });
})();
