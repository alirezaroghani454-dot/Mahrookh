/* ==========================================================================
   ماه‌رخ — js/ui/overlay.js
   مدیریت یکپارچهٔ همهٔ لایه‌های روی صفحه: منوی موبایل، سبد، علاقه‌مندی‌ها،
   جستجو، نمای سریع، پرداخت و مقاله.
   - هم‌زمان فقط یک لایه باز است
   - دکمهٔ Esc و کلیک روی پس‌زمینه می‌بندد
   - فوکوس داخل لایه می‌ماند (Tab trap) و بعد از بستن برمی‌گردد
   - HTML: دکمه‌ای با data-open="cart" باز می‌کند و data-close می‌بندد
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;

  var SEL = {
    menu: '#mobileMenu',
    cart: '#cartDrawer',
    wish: '#wishDrawer',
    search: '#searchOverlay',
    quick: '#quickView',
    checkout: '#checkoutModal',
    info: '#infoModal'
  };
  var NO_BACKDROP = { search: true };
  var SELF_CLOSE = ['search', 'quick', 'checkout', 'info']; // کلیک روی فضای خالی می‌بندد

  var els = {};
  var backdrop = null;
  var current = null;
  var lastFocus = null;

  function visibleFocusables(root) {
    var all = M.$$('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', root);
    return all.filter(function (el) { return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'; });
  }

  function setMenuExpanded(open) {
    var btn = M.$('#menuBtn');
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function open(name) {
    var el = els[name];
    if (!el) return;
    if (current === name) return;

    if (current) close(current, true);
    else lastFocus = document.activeElement;

    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    if (!NO_BACKDROP[name] && backdrop) backdrop.classList.add('is-on');
    document.body.classList.add('no-scroll');
    current = name;
    if (name === 'menu') setMenuExpanded(true);

    setTimeout(function () {
      if (current !== name) return;
      var pref = M.$('[data-autofocus]', el);
      var target = pref || visibleFocusables(el)[0];
      if (target && target.focus) target.focus({ preventScroll: true });
    }, 90);

    M.bus.emit('overlay:open', name);
  }

  function close(name, keepState) {
    name = name || current;
    var el = els[name];
    if (!el) return;

    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
    if (name === 'menu') setMenuExpanded(false);

    if (!keepState) {
      current = null;
      if (backdrop) backdrop.classList.remove('is-on');
      document.body.classList.remove('no-scroll');
      if (lastFocus && lastFocus.focus && document.contains(lastFocus)) {
        try { lastFocus.focus({ preventScroll: true }); } catch (e) { /* نادیده */ }
      }
      lastFocus = null;
    }
    M.bus.emit('overlay:close', name);
  }

  M.overlay = {
    open: open,
    close: close,
    closeAll: function () { if (current) close(current); },
    current: function () { return current; },
    el: function (name) { return els[name]; }
  };

  M.register('overlay', function () {
    Object.keys(SEL).forEach(function (k) { els[k] = M.$(SEL[k]); });
    backdrop = M.$('#backdrop');

    if (backdrop) backdrop.addEventListener('click', function () { if (current) close(current); });

    SELF_CLOSE.forEach(function (name) {
      var el = els[name];
      if (!el) return;
      el.addEventListener('click', function (e) { if (e.target === el) close(name); });
    });

    document.addEventListener('click', function (e) {
      var opener = e.target.closest('[data-open]');
      if (opener) {
        e.preventDefault();
        open(opener.getAttribute('data-open'));
        return;
      }
      var closer = e.target.closest('[data-close]');
      if (closer && current) close(current);
    });

    document.addEventListener('keydown', function (e) {
      if (!current) return;
      if (e.key === 'Escape') { e.preventDefault(); close(current); return; }
      if (e.key !== 'Tab') return;

      var list = visibleFocusables(els[current]);
      if (!list.length) return;
      var first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  });
})();
