/* ==========================================================================
   ماه‌رخ — js/shop/checkout.js
   تکمیل سفارش: فرم با اعتبارسنجی فارسی، خلاصهٔ سفارش، پیام موفقیت و کاغذرنگی.

   ⚠ این بخش فقط نمایشی است: سفارش در مرورگر ذخیره می‌شود و پرداخت واقعی
   انجام نمی‌گیرد. برای راه‌اندازی واقعی، تابع submitOrder را به درگاه پرداخت
   و بک‌اند خودتان وصل کنید.
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;

  /* ---------- اعتبارسنجی ---------- */
  function normPhone(v) {
    return M.toEn(v).replace(/[\s\-]/g, '').replace(/^(\+98|0098)/, '0');
  }
  function digits(v) { return M.toEn(v).replace(/\D/g, ''); }

  var RULES = {
    name: function (v) { return v.trim().length >= 3 ? '' : 'نام و نام خانوادگی را کامل بنویس.'; },
    phone: function (v) { return /^09\d{9}$/.test(normPhone(v)) ? '' : 'شمارهٔ موبایل را به شکل ۰۹۱۲۳۴۵۶۷۸۹ وارد کن.'; },
    city: function (v) { return v ? '' : 'شهر را انتخاب کن.'; },
    zip: function (v) { return digits(v).length === 10 ? '' : 'کد پستی باید ۱۰ رقم باشد.'; },
    addr: function (v) { return v.trim().length >= 10 ? '' : 'نشانی را کامل‌تر بنویس.'; }
  };

  function field(id, label, inner, span) {
    return '<div class="field' + (span ? ' span-2' : '') + '" data-field="' + id + '">' +
      '<label for="co_' + id + '">' + label + '</label>' + inner +
      '<div class="field__err" id="co_' + id + '_e" aria-live="polite"></div></div>';
  }

  function formHTML(s) {
    var cities = M.data.config.cities;
    return '<div class="co">' +
      '<form class="co__form" id="coForm" novalidate>' +
        '<h2 class="drawer__title" style="font-size:1.4rem">تکمیل سفارش</h2>' +
        '<div class="form-grid">' +
          field('name', 'نام و نام خانوادگی', '<input class="input" id="co_name" autocomplete="name" aria-describedby="co_name_e">') +
          field('phone', 'شمارهٔ موبایل', '<input class="input" id="co_phone" type="tel" inputmode="numeric" autocomplete="tel" placeholder="۰۹۱۲۳۴۵۶۷۸۹" aria-describedby="co_phone_e">') +
          field('city', 'شهر', '<select class="input" id="co_city" autocomplete="address-level2" aria-describedby="co_city_e"><option value="">انتخاب کن…</option>' +
            cities.map(function (c) { return '<option>' + M.esc(c) + '</option>'; }).join('') + '</select>') +
          field('zip', 'کد پستی', '<input class="input" id="co_zip" inputmode="numeric" autocomplete="postal-code" aria-describedby="co_zip_e">') +
          field('addr', 'نشانی کامل', '<textarea class="input" id="co_addr" autocomplete="street-address" aria-describedby="co_addr_e"></textarea>', true) +
        '</div>' +
        '<h3>روش پرداخت</h3>' +
        '<div class="pay-opts">' +
          '<label class="pay-opt"><input type="radio" name="pay" value="online" checked><span>پرداخت آنلاین<small>از طریق درگاه بانکی</small></span></label>' +
          '<label class="pay-opt"><input type="radio" name="pay" value="cod"><span>پرداخت در محل<small>فقط برای تهران</small></span></label>' +
        '</div>' +
        '<div class="field__err" id="co_pay_e" aria-live="polite"></div>' +
        '<button type="submit" class="btn btn--block" id="coSubmit">ثبت سفارش و پرداخت ' + M.price(s.total) + '</button>' +
        '<p class="coupon__msg" style="color:var(--ink-mute)">این یک نسخهٔ نمایشی است؛ پرداخت واقعی انجام نمی‌شود.</p>' +
      '</form>' +
      '<aside class="co__sum"><h3>خلاصهٔ سفارش</h3>' +
        '<div class="co__items">' + s.items.map(function (it) {
          return '<div class="co__item"><div class="citem__art">' + M.artFor(it.product, it.shadeIdx) + '</div>' +
            '<span>' + M.esc(it.product.name) + ' × ' + M.toFa(it.qty) + '</span><b>' + M.fmt(it.total) + '</b></div>';
        }).join('') + '</div>' +
        '<div class="totals">' +
          '<div class="totals__row"><span>جمع کالاها</span><b>' + M.price(s.subtotal) + '</b></div>' +
          (s.discount ? '<div class="totals__row totals__row--off"><span>تخفیف</span><b>−' + M.price(s.discount) + '</b></div>' : '') +
          '<div class="totals__row"><span>هزینهٔ ارسال</span><b>' + (s.shipping ? M.price(s.shipping) : 'رایگان') + '</b></div>' +
          '<div class="totals__row totals__row--grand"><span>مبلغ قابل پرداخت</span><span>' + M.price(s.total) + '</span></div></div>' +
      '</aside></div>';
  }

  function doneHTML(code) {
    return '<div class="co-done">' +
      '<svg class="co-done__check" viewBox="0 0 112 112" aria-hidden="true"><circle cx="56" cy="56" r="48"/><path d="M34 58l15 15 30-32"/></svg>' +
      '<h2 style="font-size:1.7rem;font-weight:900">سفارشت ثبت شد</h2>' +
      '<p>کد پیگیری سفارش:</p><div class="co-done__code">' + code + '</div>' +
      '<p style="max-width:44ch;color:var(--ink-soft)">ممنون که ماه‌رخ را انتخاب کردی. به‌زودی سفارش آماده و ارسال می‌شود.</p>' +
      '<p style="font-size:.85rem;color:var(--ink-mute)">(نسخهٔ نمایشی؛ پرداخت واقعی انجام نشد.)</p>' +
      '<button type="button" class="btn" data-close>ادامهٔ خرید</button></div>';
  }

  /* ---------- کاغذرنگی ---------- */
  M.confetti = function () {
    if (M.prefersReduced) return;
    var colors = ['#e259ad', '#c9338f', '#7a3fb5', '#78e6d6', '#e8c27a', '#f2b5a0'];
    var host = document.createElement('div');
    host.className = 'confetti';
    host.setAttribute('aria-hidden', 'true');
    var html = '';
    for (var i = 0; i < 70; i++) {
      html += '<i style="--x:' + (Math.random() * 100).toFixed(1) + '%;--c:' + colors[i % colors.length] +
        ';--r:' + Math.floor(Math.random() * 360) + 'deg;--t:' + (2.4 + Math.random() * 2).toFixed(2) +
        's;--dx:' + Math.floor(Math.random() * 240 - 120) + 'px;animation-delay:' + (Math.random() * 0.5).toFixed(2) + 's"></i>';
    }
    host.innerHTML = html;
    document.body.appendChild(host);
    setTimeout(function () { if (host.parentNode) host.parentNode.removeChild(host); }, 5200);
  };

  /* ---------- ثبت سفارش (نمایشی) ---------- */
  function submitOrder(values, summary) {
    var code = 'MR-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    var orders = M.store.get('orders', []);
    orders.unshift({
      code: code,
      date: new Date().toISOString(),
      total: summary.total,
      items: summary.items.map(function (i) { return { id: i.product.id, qty: i.qty }; }),
      city: values.city
    });
    M.store.set('orders', orders.slice(0, 10));
    return code;
  }

  M.checkout = {
    open: function () {
      var s = M.cart.summary();
      if (!s.items.length) { M.toast('سبد خریدت خالی است.', 'err'); return; }
      M.$('#checkoutBody').innerHTML = formHTML(s);
      M.overlay.open('checkout');
    }
  };

  M.register('checkout', function () {
    var body = M.$('#checkoutBody');
    if (!body) return;

    function setError(id, msg) {
      var wrap = body.querySelector('[data-field="' + id + '"]');
      var err = M.$('#co_' + id + '_e', body);
      if (wrap) wrap.classList.toggle('has-error', !!msg);
      if (err) err.textContent = msg || '';
      var inp = M.$('#co_' + id, body);
      if (inp) inp.setAttribute('aria-invalid', msg ? 'true' : 'false');
    }

    function validateOne(id) {
      var el = M.$('#co_' + id, body);
      if (!el) return true;
      var msg = RULES[id](el.value);
      setError(id, msg);
      return !msg;
    }

    function validatePay() {
      var pay = body.querySelector('input[name="pay"]:checked');
      var city = M.$('#co_city', body).value;
      var err = M.$('#co_pay_e', body);
      if (pay && pay.value === 'cod' && city && city !== 'تهران') {
        err.textContent = 'پرداخت در محل فقط برای تهران فعال است.';
        return false;
      }
      err.textContent = '';
      return true;
    }

    body.addEventListener('input', function (e) {
      var id = (e.target.id || '').replace('co_', '');
      if (RULES[id] && e.target.closest('.has-error')) validateOne(id);
    });
    body.addEventListener('focusout', function (e) {
      var id = (e.target.id || '').replace('co_', '');
      if (RULES[id] && e.target.value) validateOne(id);
    });
    body.addEventListener('change', function (e) {
      if (e.target.name === 'pay' || e.target.id === 'co_city') validatePay();
    });

    body.addEventListener('submit', function (e) {
      if (e.target.id !== 'coForm') return;
      e.preventDefault();

      var firstBad = null;
      Object.keys(RULES).forEach(function (id) {
        if (!validateOne(id) && !firstBad) firstBad = M.$('#co_' + id, body);
      });
      var payOk = validatePay();
      if (firstBad) { firstBad.focus(); return; }
      if (!payOk) return;

      var summary = M.cart.summary();
      var values = { city: M.$('#co_city', body).value };
      var btn = M.$('#coSubmit', body);
      btn.classList.add('is-loading');
      btn.textContent = 'در حال ثبت سفارش…';

      setTimeout(function () {
        var code = submitOrder(values, summary);
        M.cart.clear();
        body.innerHTML = doneHTML(code);
        M.confetti();
      }, 1300);
    });
  });
})();
