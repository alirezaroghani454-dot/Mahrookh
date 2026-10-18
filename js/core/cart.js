/* ==========================================================================
   ماه‌رخ — js/core/cart.js
   منطق سبد خرید (بدون DOM): افزودن، تغییر تعداد، حذف، کد تخفیف، جمع‌ها.
   وضعیت در localStorage ذخیره می‌شود و با هر تغییر، رویداد «cart:change» می‌آید.
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;
  var CFG = M.data.config;
  var lines = [];       // [{ id, shade, qty }]
  var couponCode = null;

  function keyOf(id, shade) { return id + ':' + (shade || 0); }

  function load() {
    var saved = M.store.get('cart', []);
    lines = (Array.isArray(saved) ? saved : []).filter(function (l) {
      return l && M.prodById[l.id] && l.qty > 0;
    }).map(function (l) {
      var p = M.prodById[l.id];
      return { id: l.id, shade: Math.min(l.shade || 0, p.shades.length - 1), qty: Math.min(l.qty, CFG.maxQty) };
    });
    var c = M.store.get('coupon', null);
    couponCode = c && CFG.coupons[c] ? c : null;
  }

  function persist() {
    M.store.set('cart', lines);
    M.store.set('coupon', couponCode);
  }

  function changed() {
    persist();
    M.bus.emit('cart:change', M.cart.summary());
  }

  function find(key) {
    for (var i = 0; i < lines.length; i++) {
      if (keyOf(lines[i].id, lines[i].shade) === key) return lines[i];
    }
    return null;
  }

  M.cart = {
    /* افزودن به سبد؛ خروجی: { ok, reason?, qty? } */
    add: function (id, shade, qty) {
      var p = M.prodById[id];
      if (!p) return { ok: false, reason: 'محصول پیدا نشد.' };
      if (p.stock <= 0) return { ok: false, reason: 'این محصول فعلاً ناموجود است.' };

      shade = Math.min(Math.max(shade || 0, 0), p.shades.length - 1);
      qty = Math.max(1, qty || 1);

      var limit = Math.min(p.stock, CFG.maxQty);
      var line = find(keyOf(id, shade));
      var current = line ? line.qty : 0;

      if (current >= limit) {
        return { ok: false, reason: 'حداکثر تعداد مجاز برای این محصول ' + M.toFa(limit) + ' عدد است.' };
      }
      var add = Math.min(qty, limit - current);

      if (line) line.qty += add;
      else lines.push({ id: id, shade: shade, qty: add });

      changed();
      M.bus.emit('cart:added', { product: p, shade: shade, qty: add });
      return { ok: true, qty: add, capped: add < qty };
    },

    setQty: function (key, qty) {
      var line = find(key);
      if (!line) return;
      var p = M.prodById[line.id];
      var limit = Math.min(p.stock, CFG.maxQty);
      qty = Math.min(Math.max(qty, 0), limit);
      if (qty <= 0) { this.remove(key); return; }
      line.qty = qty;
      changed();
    },

    remove: function (key) {
      lines = lines.filter(function (l) { return keyOf(l.id, l.shade) !== key; });
      if (!lines.length) couponCode = null;
      changed();
    },

    clear: function () {
      lines = [];
      couponCode = null;
      changed();
    },

    count: function () {
      return lines.reduce(function (n, l) { return n + l.qty; }, 0);
    },

    /* اعمال کد تخفیف؛ خروجی: { ok, msg } */
    applyCoupon: function (raw) {
      var code = M.toEn(String(raw || '')).trim().toUpperCase();
      if (!code) return { ok: false, msg: 'کد تخفیف را وارد کن.' };
      var c = CFG.coupons[code];
      if (!c) return { ok: false, msg: 'این کد تخفیف معتبر نیست.' };
      var sub = this.summary().subtotal;
      if (sub < c.min) return { ok: false, msg: 'این کد برای سفارش‌های بالای ' + M.price(c.min) + ' است.' };
      couponCode = code;
      changed();
      return { ok: true, msg: 'کد تخفیف اعمال شد: ' + c.label };
    },

    removeCoupon: function () {
      couponCode = null;
      changed();
    },

    summary: function () {
      var items = lines.map(function (l) {
        var p = M.prodById[l.id];
        return {
          key: keyOf(l.id, l.shade),
          product: p,
          shadeIdx: l.shade,
          shade: M.shadeOf(p, l.shade),
          qty: l.qty,
          total: p.price * l.qty
        };
      });

      var subtotal = items.reduce(function (s, i) { return s + i.total; }, 0);
      var count = items.reduce(function (s, i) { return s + i.qty; }, 0);

      var discount = 0;
      var coupon = couponCode ? CFG.coupons[couponCode] : null;
      if (coupon && subtotal >= coupon.min) {
        discount = Math.min(Math.round(subtotal * coupon.pct / 100), coupon.max);
      }

      var shipping = subtotal === 0 ? 0 : (subtotal >= CFG.freeShip ? 0 : CFG.shipCost);
      var total = Math.max(0, subtotal - discount + shipping);

      return {
        items: items,
        count: count,
        subtotal: subtotal,
        discount: discount,
        couponCode: coupon && discount > 0 ? couponCode : null,
        couponLabel: coupon ? coupon.label : '',
        shipping: shipping,
        freeLeft: Math.max(0, CFG.freeShip - subtotal),
        freePct: Math.min(100, Math.round(subtotal / CFG.freeShip * 100)),
        total: total
      };
    }
  };

  load();
})();
