/* ==========================================================================
   ماه‌رخ — js/shop/card.js
   ساخت HTML کارت محصول (M.cardHTML). رویدادهای کارت‌ها در actions.js
   با delegation مدیریت می‌شوند (data-add, data-wish, data-quick).
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;

  /* آیا محصول چند رنگ/نوع دارد (و باید در نمای سریع انتخاب شود)؟ */
  M.hasChoices = function (p) { return p.shades.length > 1; };

  M.starsHTML = function (rating) {
    return '<span class="stars" style="--rate:' + (rating / 5 * 100).toFixed(0) + '%" role="img" aria-label="امتیاز ' + M.rate(rating) + ' از ۵"></span>';
  };

  M.priceHTML = function (p) {
    return '<div class="price"><span class="price__now">' + M.fmt(p.price) + '<small>تومان</small></span>' +
      (p.old ? '<span class="price__old">' + M.fmt(p.old) + '</span>' : '') + '</div>';
  };

  /* o: { enter: بله/خیر، i: شمارهٔ ورود، flash: نوار فروش } */
  M.cardHTML = function (p, o) {
    o = o || {};
    var d = M.discount(p);
    var out = p.stock <= 0;

    var badges = [];
    if (out) {
      badges.push('<span class="badge badge--hot">ناموجود</span>');
    } else {
      if (d) badges.push('<span class="badge">' + M.toFa(d) + '٪ تخفیف</span>');
      if (p.isNew) badges.push('<span class="badge badge--new">جدید</span>');
      else if (p.hot) badges.push('<span class="badge badge--hot">پرفروش</span>');
      if (p.stock <= 5) badges.push('<span class="badge badge--low">تنها ' + M.toFa(p.stock) + ' عدد</span>');
    }
    badges = badges.slice(0, 2);

    var wished = M.wish.has(p.id);
    var btn;
    if (out) btn = '<button type="button" class="btn btn--sm btn--block pcard__add" disabled>ناموجود</button>';
    else if (M.hasChoices(p)) btn = '<button type="button" class="btn btn--sm btn--block pcard__add" data-quick="' + p.id + '">انتخاب رنگ</button>';
    else btn = '<button type="button" class="btn btn--sm btn--block pcard__add" data-add="' + p.id + '">افزودن به سبد</button>';

    var sold = '';
    if (o.flash && p.flash) {
      sold = '<div class="sold"><div class="sold__bar"><i style="--w:' + p.flash + '%"></i></div><span>' + M.toFa(p.flash) + '٪ فروخته شده</span></div>';
    }

    var cls = 'pcard' + (out ? ' is-out' : '') + (o.enter ? ' pcard--enter' : '');
    var style = '--tint:' + p.tint + (o.enter ? ';--i:' + Math.min(o.i || 0, 8) : '');

    return '<article class="' + cls + '" data-id="' + p.id + '" style="' + style + '">' +
      '<div class="badges">' + badges.join('') + '</div>' +
      /* دکمهٔ قلب بیرون از قابِ قوسی است تا گوشه‌ها آن را نبُرند */
      '<button type="button" class="pcard__wish" data-wish="' + p.id + '" aria-pressed="' + wished + '" aria-label="افزودن ' + M.esc(p.name) + ' به علاقه‌مندی‌ها">' + M.icon('heart') + '</button>' +
      '<div class="pcard__media" data-quick="' + p.id + '">' +
        '<div class="pcard__art">' + M.artFor(p, 0) + '</div>' +
        '<div class="pcard__glare"></div>' +
        '<button type="button" class="pcard__quick" data-quick="' + p.id + '" aria-label="مشاهدهٔ سه‌بعدی ' + M.esc(p.name) + '">' + M.icon('eye') + 'مشاهدهٔ سه‌بعدی</button>' +
      '</div>' +
      '<div class="pcard__body">' +
        '<span class="pcard__brand">' + M.esc(p.brand) + '</span>' +
        '<h3 class="pcard__name"><a href="#" data-quick="' + p.id + '">' + M.esc(p.name) + '</a></h3>' +
        '<div class="rating">' + M.starsHTML(p.rating) + '<span>' + M.rate(p.rating) + ' (' + M.toFa(p.votes) + ')</span></div>' +
        sold +
        '<div class="pcard__price">' + M.priceHTML(p) + '</div>' +
        btn +
      '</div></article>';
  };
})();
