/* ==========================================================================
   ماه‌رخ — js/shop/search.js
   جستجوی سراسری (آیکون ذره‌بین): نتیجهٔ زنده هنگام تایپ، میان‌بر «/» و Ctrl/⌘+K،
   جابه‌جایی با کلیدهای جهت‌نما، و رفتن به فروشگاه با Enter.
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;
  var MAX = 8;

  M.register('search', function () {
    var overlay = M.$('#searchOverlay');
    var input = M.$('#searchInput');
    var results = M.$('#searchResults');
    if (!overlay || !input || !results) return;

    function defaultView() {
      results.innerHTML =
        '<p class="search__hint">جستجوهای پرطرفدار</p>' +
        '<div class="search__chips">' + M.data.popular.map(function (w) {
          return '<button type="button" class="chip" data-term="' + M.esc(w) + '">' + M.esc(w) + '</button>';
        }).join('') + '</div>' +
        '<p class="search__hint" style="margin-top:22px">دسته‌بندی‌ها</p>' +
        '<div class="search__chips">' + M.data.categories.map(function (c) {
          return '<button type="button" class="chip" data-cat="' + c.id + '">' + M.esc(c.name) + '</button>';
        }).join('') + '</div>';
    }

    function find(q) {
      var n = M.norm(q);
      if (!n) return [];
      return M.data.products.filter(function (p) { return p._s.indexOf(n) > -1; })
        .sort(function (a, b) { return b.pop - a.pop; });
    }

    function renderResults() {
      var q = input.value;
      if (!M.norm(q)) { defaultView(); return; }

      var list = find(q);
      if (!list.length) {
        results.innerHTML = '<div class="empty" style="padding:32px 8px">' + M.emptyArt() +
          '<h3>نتیجه‌ای پیدا نشد</h3><p>عبارت دیگری را امتحان کن؛ مثلاً «سرم» یا «رژلب».</p></div>';
        return;
      }

      var shown = list.slice(0, MAX);
      results.innerHTML = shown.map(function (p) {
        return '<button type="button" class="sresult" data-pick="' + p.id + '">' +
          '<span class="sresult__art">' + M.artFor(p, 0) + '</span>' +
          '<span><span class="sresult__name">' + M.esc(p.name) + '</span><br><span class="sresult__brand">' + M.esc(p.brand) + '</span></span>' +
          '<span class="sresult__price">' + M.price(p.price) + '</span></button>';
      }).join('') +
        (list.length > MAX
          ? '<button type="button" class="btn btn--ghost btn--block" style="margin-top:12px" data-all>نمایش همهٔ ' + M.toFa(list.length) + ' نتیجه در فروشگاه</button>'
          : '');
    }

    function toShop() {
      var q = input.value.trim();
      M.overlay.close('search');
      M.bus.emit('shop:search', q);
    }

    input.addEventListener('input', M.debounce(renderResults, 120));

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); if (input.value.trim()) toShop(); }
      if (e.key === 'ArrowDown') {
        var first = M.$('.sresult', results);
        if (first) { e.preventDefault(); first.focus(); }
      }
    });

    results.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      var list = M.$$('.sresult', results);
      var i = list.indexOf(document.activeElement);
      if (i === -1) return;
      e.preventDefault();
      if (e.key === 'ArrowDown') (list[i + 1] || list[i]).focus();
      else if (i === 0) input.focus();
      else list[i - 1].focus();
    });

    results.addEventListener('click', function (e) {
      var t = e.target.closest('[data-pick]');
      if (t) {
        var id = t.getAttribute('data-pick');
        M.overlay.close('search');
        setTimeout(function () { M.quickview.open(id); }, 120);
        return;
      }
      t = e.target.closest('[data-term]');
      if (t) { input.value = t.getAttribute('data-term'); renderResults(); input.focus(); return; }
      t = e.target.closest('[data-cat]');
      if (t) { M.overlay.close('search'); M.bus.emit('shop:category', t.getAttribute('data-cat')); return; }
      if (e.target.closest('[data-all]')) toShop();
    });

    M.bus.on('overlay:open', function (name) {
      if (name !== 'search') return;
      input.value = '';
      defaultView();
      setTimeout(function () { input.focus(); }, 120);
    });

    /* میان‌برها */
    document.addEventListener('keydown', function (e) {
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      var typing = /INPUT|TEXTAREA|SELECT/.test(tag);
      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        M.overlay.open('search');
      } else if (e.key === '/' && !typing && !M.overlay.current()) {
        e.preventDefault();
        M.overlay.open('search');
      }
    });

    defaultView();
  });
})();
