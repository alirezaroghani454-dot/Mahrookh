/* ==========================================================================
   ماه‌رخ — js/features/magazine.js
   مجلهٔ زیبایی: کارت مقاله‌ها و باز کردن متن کامل در پنجرهٔ اطلاعات.
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;

  M.register('magazine', function () {
    var grid = M.$('#articleGrid');
    var content = M.$('#infoContent');
    if (!grid || !content) return;

    var arts = M.data.articles;

    grid.innerHTML = arts.map(function (a) {
      return '<article class="article" data-article="' + a.id + '" style="--grad:' + a.grad + '">' +
        '<div class="article__cover">' + M.art(a.art, a.color) + '</div>' +
        '<div class="article__body">' +
          '<span class="article__meta">' + M.esc(a.tag) + '، ' + M.toFa(a.mins) + ' دقیقه مطالعه</span>' +
          '<h3 class="article__title"><button type="button" class="article__link" data-article="' + a.id + '">' + M.esc(a.title) + '</button></h3>' +
          '<p class="article__sum">' + M.esc(a.sum) + '</p>' +
          '<span class="article__more">ادامهٔ مطلب ' + M.icon('chev-l') + '</span>' +
        '</div></article>';
    }).join('');

    function open(id) {
      var a = arts.filter(function (x) { return x.id === id; })[0];
      if (!a) return;
      content.innerHTML =
        '<div class="article__cover" style="--grad:' + a.grad + ';aspect-ratio:16/6">' + M.art(a.art, a.color) + '</div>' +
        '<div class="prose">' +
          '<span class="article__meta">' + M.esc(a.tag) + '، ' + M.toFa(a.mins) + ' دقیقه مطالعه</span>' +
          '<h3>' + M.esc(a.title) + '</h3>' +
          a.body.map(function (p) { return '<p>' + M.esc(p) + '</p>'; }).join('') +
          '<div><a class="btn btn--sm" href="#shop" data-close>دیدن محصولات</a></div>' +
        '</div>';
      M.overlay.open('info');
    }

    grid.addEventListener('click', function (e) {
      var t = e.target.closest('[data-article]');
      if (t) open(t.getAttribute('data-article'));
    });
  });
})();
