/* ==========================================================================
   ماه‌رخ — js/core/utils.js
   ابزارهای عمومی: انتخاب‌گر DOM، رویدادهای داخلی (bus)، اعداد فارسی،
   قیمت، نرمال‌سازی متن، حلقهٔ انیمیشن هوشمند.
   همهٔ فایل‌ها از فضای نام window.Mahrokh استفاده می‌کنند.
   ========================================================================== */
(function () {
  'use strict';

  var M = (window.Mahrokh = window.Mahrokh || {});
  M.data = M.data || {};

  /* ---------- انتخاب‌گرها ---------- */
  M.$ = function (sel, root) { return (root || document).querySelector(sel); };
  M.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- رویدادهای داخلی ---------- */
  var handlers = {};
  M.bus = {
    on: function (name, fn) { (handlers[name] = handlers[name] || []).push(fn); },
    off: function (name, fn) { handlers[name] = (handlers[name] || []).filter(function (h) { return h !== fn; }); },
    emit: function (name, data) {
      (handlers[name] || []).slice().forEach(function (fn) {
        try { fn(data); } catch (e) { console.error('[ماه‌رخ] خطا در رویداد ' + name, e); }
      });
    }
  };

  /* ---------- ثبت ماژول‌ها (main.js آن‌ها را به ترتیب بارگذاری اجرا می‌کند) ---------- */
  M._mods = [];
  M.register = function (name, fn) { M._mods.push({ name: name, fn: fn }); };

  /* ---------- ریاضی ---------- */
  M.clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  M.lerp = function (a, b, t) { return a + (b - a) * t; };

  M.debounce = function (fn, wait) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  };

  M.rafThrottle = function (fn) {
    var queued = false, lastArgs;
    return function () {
      lastArgs = arguments;
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; fn.apply(null, lastArgs); });
    };
  };

  /* ---------- محیط ---------- */
  var mq = function (q) { return window.matchMedia ? window.matchMedia(q) : { matches: false }; };
  M.prefersReduced = mq('(prefers-reduced-motion: reduce)').matches;
  M.isTouch = mq('(hover: none), (pointer: coarse)').matches;
  M.isMobile = function () { return window.innerWidth < 768; };

  /* ---------- اعداد فارسی و قیمت ---------- */
  var FA = '۰۱۲۳۴۵۶۷۸۹';
  M.toFa = function (v) {
    return String(v).replace(/\d/g, function (d) { return FA.charAt(+d); });
  };
  M.toEn = function (v) {
    return String(v)
      .replace(/[۰-۹]/g, function (c) { return String(c.charCodeAt(0) - 1776); })
      .replace(/[٠-٩]/g, function (c) { return String(c.charCodeAt(0) - 1632); });
  };
  /* ۱۲۳۴۵۶۷ → ۱٬۲۳۴٬۵۶۷ */
  M.fmt = function (n) {
    var s = String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '٬');
    return M.toFa(s);
  };
  M.price = function (n) { return M.fmt(n) + ' تومان'; };
  M.rate = function (r) { return M.toFa(Number(r).toFixed(1)).replace('.', '٫'); };

  /* ---------- متن ---------- */
  M.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* نرمال‌سازی برای جستجو: ی/ک عربی، نیم‌فاصله، اعراب، اعداد */
  M.norm = function (s) {
    return M.toEn(String(s || ''))
      .toLowerCase()
      .replace(/ي/g, 'ی')
      .replace(/ك/g, 'ک')
      .replace(/[‌‏‎]/g, '')
      .replace(/[ً-ٟ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  /* آیکون SVG از اسپرایت داخل index.html */
  M.icon = function (name, cls) {
    return '<svg class="icon' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  };

  /* ---------- اسکرول نرم به یک بخش ---------- */
  M.scrollToEl = function (el) {
    if (!el) return;
    el.scrollIntoView({ behavior: M.prefersReduced ? 'auto' : 'smooth', block: 'start' });
  };

  /* ---------- حلقهٔ انیمیشن: فقط وقتی عنصر دیده می‌شود و تب فعال است ---------- */
  M.visibleLoop = function (el, tick) {
    var running = false, id = 0, last = 0, inView = true;

    function frame(now) {
      if (!running) return;
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      tick(now / 1000, dt);
      id = requestAnimationFrame(frame);
    }
    function start() {
      if (running || document.hidden || !inView || M.prefersReduced) return;
      running = true;
      last = performance.now();
      id = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(id);
    }

    if ('IntersectionObserver' in window && el) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        inView ? start() : stop();
      }, { threshold: 0.01 }).observe(el);
    }
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });

    return { start: start, stop: stop, isRunning: function () { return running; } };
  };
})();
