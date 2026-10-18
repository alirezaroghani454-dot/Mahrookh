/* ==========================================================================
   ماه‌رخ — js/shop/shop.js
   بخش فروشگاه: جستجو، فیلتر دسته‌بندی، بازهٔ قیمت، فقط موجود، مرتب‌سازی
   و «نمایش بیشتر». همچنین به رویدادهای «shop:category» (کلیک روی حلقهٔ
   دسته‌ها) و «shop:search» (جستجوی سراسری) گوش می‌دهد.
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;
  var PAGE = 8;

  M.register('shop', function () {
    var grid = M.$('#productGrid');
    if (!grid) return;

    var searchEl = M.$('#shopSearch');
    var sortEl = M.$('#sortSelect');
    var chipsEl = M.$('#catChips');
    var rangeEl = M.$('#priceMax');
    var outEl = M.$('#priceOut');
    var stockEl = M.$('#inStock');
    var countEl = M.$('#resultCount');
    var moreBtn = M.$('#loadMore');
    var resetBtn = M.$('#resetFilters');

    var all = M.data.products;
    var prices = all.map(function (p) { return p.price; });
    var minP = Math.floor(Math.min.apply(null, prices) / 10000) * 10000;
    var maxP = Math.ceil(Math.max.apply(null, prices) / 50000) * 50000;

    var st = { q: '', cat: 'all', sort: 'pop', max: maxP, stock: false, shown: PAGE };

    /* ---------- تنظیم اسلایدر قیمت ---------- */
    rangeEl.min = minP;
    rangeEl.max = maxP;
    rangeEl.step = 10000;
    rangeEl.value = maxP;

    function paintRange() {
      var pct = ((st.max - minP) / (maxP - minP)) * 100;
      rangeEl.style.setProperty('--fill', pct.toFixed(1) + '%');
      outEl.textContent = st.max >= maxP ? 'همهٔ قیمت‌ها' : 'تا ' + M.price(st.max);
    }

    /* ---------- چیپ‌های دسته‌بندی ---------- */
    function paintChips() {
      var list = [{ id: 'all', name: 'همه' }].concat(M.data.categories);
      chipsEl.innerHTML = list.map(function (c) {
        return '<button type="button" class="chip" data-chip="' + c.id + '" aria-pressed="' + (st.cat === c.id) + '">' + M.esc(c.name) + '</button>';
      }).join('');
    }

    /* ---------- فیلتر و مرتب‌سازی ---------- */
    var sorters = {
      pop: function (a, b) { return b.pop - a.pop; },
      new: function (a, b) { return b.date - a.date; },
      cheap: function (a, b) { return a.price - b.price; },
      exp: function (a, b) { return b.price - a.price; },
      rate: function (a, b) { return b.rating - a.rating || b.votes - a.votes; },
      off: function (a, b) { return M.discount(b) - M.discount(a); }
    };

    function filtered() {
      var q = M.norm(st.q);
      return all.filter(function (p) {
        if (st.cat !== 'all' && p.cat !== st.cat) return false;
        if (p.price > st.max) return false;
        if (st.stock && p.stock <= 0) return false;
        if (q && p._s.indexOf(q) === -1) return false;
        return true;
      }).sort(sorters[st.sort] || sorters.pop);
    }

    /* ---------- نمایش ---------- */
    function render(fromIndex) {
      var list = filtered();
      var show = list.slice(0, st.shown);

      if (!list.length) {
        grid.innerHTML = '<div class="empty">' + M.emptyArt() +
          '<h3>محصولی با این فیلترها پیدا نشد</h3>' +
          '<p>عبارت دیگری را امتحان کن یا فیلترها را پاک کن.</p>' +
          '<button type="button" class="btn btn--ghost btn--sm" data-reset-filters>پاک‌کردن فیلترها</button></div>';
      } else if (typeof fromIndex === 'number') {
        grid.insertAdjacentHTML('beforeend', show.slice(fromIndex).map(function (p, i) {
          return M.cardHTML(p, { enter: true, i: i });
        }).join(''));
      } else {
        grid.innerHTML = show.map(function (p, i) { return M.cardHTML(p, { enter: true, i: i }); }).join('');
      }

      countEl.textContent = M.toFa(list.length) + ' محصول';
      var remaining = list.length - show.length;
      moreBtn.hidden = remaining <= 0;
      if (remaining > 0) moreBtn.textContent = 'نمایش بیشتر (' + M.toFa(remaining) + ' محصول دیگر)';
    }

    function refresh() { st.shown = PAGE; render(); }

    /* ---------- رویدادها ---------- */
    searchEl.addEventListener('input', M.debounce(function () { st.q = searchEl.value; refresh(); }, 160));
    sortEl.addEventListener('change', function () { st.sort = sortEl.value; refresh(); });
    stockEl.addEventListener('change', function () { st.stock = stockEl.checked; refresh(); });

    rangeEl.addEventListener('input', M.rafThrottle(function () {
      st.max = parseInt(rangeEl.value, 10);
      paintRange();
      refresh();
    }));

    chipsEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-chip]');
      if (!b) return;
      st.cat = b.getAttribute('data-chip');
      paintChips();
      refresh();
    });

    moreBtn.addEventListener('click', function () {
      var from = st.shown;
      st.shown += PAGE;
      render(from);
    });

    function reset() {
      st = { q: '', cat: 'all', sort: 'pop', max: maxP, stock: false, shown: PAGE };
      searchEl.value = '';
      sortEl.value = 'pop';
      stockEl.checked = false;
      rangeEl.value = maxP;
      paintRange();
      paintChips();
      render();
    }
    resetBtn.addEventListener('click', reset);
    M.bus.on('shop:reset', reset);

    M.bus.on('shop:category', function (id) {
      st.cat = M.catById[id] ? id : 'all';
      st.q = ''; searchEl.value = '';
      paintChips();
      refresh();
      M.scrollToEl(M.$('#shop'));
    });

    M.bus.on('shop:search', function (q) {
      st.q = q || '';
      st.cat = 'all';
      searchEl.value = st.q;
      paintChips();
      refresh();
      M.scrollToEl(M.$('#shop'));
    });

    paintRange();
    paintChips();
    render();
  });
})();
