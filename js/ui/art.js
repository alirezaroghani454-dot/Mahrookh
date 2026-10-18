/* ==========================================================================
   ماه‌رخ — js/ui/art.js
   تصویرسازی محصولات با SVG (بدون نیاز به عکس).
   M.art(نوع, رنگ) یک رشتهٔ SVG برمی‌گرداند. نوع‌ها:
   lipstick, mascara, compact, serum, bottle, perfume, nail, tube, jar
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;
  var uid = 0;

  /* روشن/تیره‌کردن رنگ هگز: amt بین ۱- تا ۱ */
  function shade(hex, amt) {
    var h = String(hex || '#e259ad').replace('#', '');
    if (h.length === 3) h = h.replace(/(.)/g, '$1$1');
    var n = parseInt(h, 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    function f(c) { return Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt); }
    return 'rgb(' + f(r) + ',' + f(g) + ',' + f(b) + ')';
  }

  /* نشان هلال برای برچسب‌ها */
  function crescent(x, y, s, fill, op) {
    return '<path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" d="M10 0a14 14 0 1 0 0 28 11 11 0 0 1 0-28Z" fill="' + fill + '" opacity="' + (op || 0.9) + '"/>';
  }

  var T = {};

  T.lipstick = function (c, id) {
    return '<rect x="70" y="128" width="60" height="92" rx="9" fill="url(#' + id + 'm)"/>' +
      '<rect x="70" y="128" width="60" height="92" rx="9" fill="url(#' + id + 's)" opacity=".5"/>' +
      '<rect x="66" y="110" width="68" height="26" rx="6" fill="url(#' + id + 'd)"/>' +
      '<path d="M78 112V68Q78 50 98 38L124 60V112Z" fill="url(#' + id + 'c)"/>' +
      '<path d="M85 106V72Q87 62 96 54" stroke="#fff" stroke-opacity=".55" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      crescent(94, 160, 1, '#fff', 0.92);
  };

  T.mascara = function (c, id) {
    return '<rect x="80" y="16" width="40" height="80" rx="12" fill="url(#' + id + 'd)"/>' +
      '<rect x="86" y="24" width="5" height="62" rx="3" fill="#fff" opacity=".25"/>' +
      '<rect x="76" y="92" width="48" height="13" rx="4" fill="url(#' + id + 'm)"/>' +
      '<rect x="74" y="104" width="52" height="116" rx="12" fill="url(#' + id + 'c)"/>' +
      '<rect x="80" y="112" width="6" height="100" rx="3" fill="#fff" opacity=".35"/>' +
      crescent(88, 146, 1, '#fff', 0.92);
  };

  T.compact = function (c, id) {
    return '<rect x="86" y="40" width="28" height="16" rx="5" fill="url(#' + id + 'd)"/>' +
      '<circle cx="100" cy="132" r="78" fill="url(#' + id + 'm)"/>' +
      '<circle cx="100" cy="132" r="64" fill="url(#' + id + 'd)"/>' +
      '<circle cx="100" cy="132" r="52" fill="url(#' + id + 'c)"/>' +
      '<circle cx="100" cy="132" r="38" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2"/>' +
      '<circle cx="100" cy="132" r="22" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2"/>' +
      '<path d="M62 104a46 46 0 0 1 38-24" stroke="#fff" stroke-opacity=".6" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      crescent(92, 120, 0.85, '#fff', 0.85);
  };

  T.serum = function (c, id) {
    return '<path d="M88 42Q88 16 100 16Q112 16 112 42V70H88Z" fill="url(#' + id + 'd)"/>' +
      '<rect x="80" y="68" width="40" height="22" rx="4" fill="url(#' + id + 'm)"/>' +
      '<rect x="58" y="88" width="84" height="132" rx="20" fill="#fff" fill-opacity=".5" stroke="#fff" stroke-opacity=".85" stroke-width="2"/>' +
      '<path d="M58 138H142V200Q142 220 122 220H78Q58 220 58 200Z" fill="url(#' + id + 'c)" opacity=".92"/>' +
      '<rect x="72" y="146" width="56" height="48" rx="8" fill="#fff" opacity=".93"/>' +
      crescent(92, 154, 1, c, 1) +
      '<rect x="66" y="98" width="6" height="104" rx="3" fill="#fff" opacity=".55"/>';
  };

  T.bottle = function (c, id) {
    return '<rect x="94" y="14" width="12" height="28" rx="3" fill="url(#' + id + 'd)"/>' +
      '<path d="M94 20H128Q140 20 140 31V35H122V28H94Z" fill="url(#' + id + 'd)"/>' +
      '<rect x="82" y="40" width="36" height="30" rx="6" fill="url(#' + id + 'm)"/>' +
      '<rect x="62" y="68" width="76" height="152" rx="18" fill="url(#' + id + 'c)"/>' +
      '<rect x="72" y="118" width="56" height="62" rx="8" fill="#fff" opacity=".93"/>' +
      crescent(92, 128, 1, c, 1) +
      '<rect x="68" y="78" width="6" height="132" rx="3" fill="#fff" opacity=".35"/>';
  };

  T.perfume = function (c, id) {
    return '<rect x="82" y="20" width="36" height="56" rx="8" fill="url(#' + id + 'm)"/>' +
      '<rect x="88" y="26" width="5" height="44" rx="3" fill="#fff" opacity=".5"/>' +
      '<rect x="90" y="74" width="20" height="16" fill="#fff" opacity=".6"/>' +
      '<rect x="52" y="88" width="96" height="132" rx="14" fill="#fff" fill-opacity=".5" stroke="#fff" stroke-opacity=".85" stroke-width="2"/>' +
      '<rect x="58" y="114" width="84" height="100" rx="10" fill="url(#' + id + 'c)" opacity=".93"/>' +
      '<rect x="76" y="138" width="48" height="38" rx="4" fill="#fff" opacity=".94"/>' +
      crescent(92, 143, 0.9, c, 1) +
      '<rect x="60" y="98" width="6" height="108" rx="3" fill="#fff" opacity=".5"/>';
  };

  T.nail = function (c, id) {
    return '<rect x="88" y="26" width="24" height="98" rx="8" fill="url(#' + id + 'd)"/>' +
      '<rect x="93" y="34" width="4" height="82" rx="2" fill="#fff" opacity=".25"/>' +
      '<rect x="82" y="120" width="36" height="16" rx="4" fill="url(#' + id + 'm)"/>' +
      '<path d="M66 152Q66 134 84 134H116Q134 134 134 152V204Q134 220 116 220H84Q66 220 66 204Z" fill="url(#' + id + 'c)"/>' +
      '<rect x="72" y="146" width="6" height="64" rx="3" fill="#fff" opacity=".45"/>' +
      crescent(92, 168, 0.85, '#fff', 0.9);
  };

  T.tube = function (c, id) {
    return '<rect x="68" y="28" width="64" height="30" rx="4" fill="url(#' + id + 'c)"/>' +
      '<path d="M76 34V54M88 34V54M100 34V54M112 34V54M124 34V54" stroke="#000" stroke-opacity=".16" stroke-width="2"/>' +
      '<path d="M72 188L66 70Q66 56 80 56H120Q134 56 134 70L128 188Z" fill="url(#' + id + 'c)"/>' +
      '<path d="M78 70L82 180" stroke="#fff" stroke-opacity=".45" stroke-width="5" stroke-linecap="round"/>' +
      '<rect x="74" y="188" width="52" height="32" rx="8" fill="url(#' + id + 'd)"/>' +
      '<rect x="72" y="100" width="56" height="52" rx="8" fill="#fff" opacity=".93"/>' +
      crescent(92, 110, 1, c, 1);
  };

  T.jar = function (c, id) {
    return '<rect x="42" y="102" width="116" height="42" rx="12" fill="url(#' + id + 'm)"/>' +
      '<rect x="50" y="108" width="6" height="30" rx="3" fill="#fff" opacity=".5"/>' +
      '<path d="M46 144H154V198Q154 220 132 220H68Q46 220 46 198Z" fill="url(#' + id + 'c)"/>' +
      '<rect x="64" y="158" width="72" height="40" rx="6" fill="#fff" opacity=".93"/>' +
      crescent(92, 163, 0.9, c, 1) +
      '<rect x="52" y="152" width="6" height="56" rx="3" fill="#fff" opacity=".35"/>';
  };

  /* ---------- سازندهٔ اصلی ---------- */
  M.art = function (type, color) {
    var c = color || '#e259ad';
    var id = 'a' + (++uid) + '_';
    var body = (T[type] || T.jar)(c, id);

    var defs =
      '<defs>' +
      '<linearGradient id="' + id + 'c" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="' + shade(c, 0.38) + '"/>' +
        '<stop offset=".55" stop-color="' + c + '"/>' +
        '<stop offset="1" stop-color="' + shade(c, -0.38) + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'm" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#8a6a2a"/><stop offset=".3" stop-color="#f6e2a8"/>' +
        '<stop offset=".55" stop-color="#cf9f3f"/><stop offset="1" stop-color="#7a5a20"/></linearGradient>' +
      '<linearGradient id="' + id + 'd" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#1a0c33"/><stop offset=".35" stop-color="#4a2a7a"/>' +
        '<stop offset="1" stop-color="#150a2b"/></linearGradient>' +
      '<linearGradient id="' + id + 's" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".35" stop-color="#fff" stop-opacity=".7"/>' +
        '<stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '</defs>';

    return '<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      defs +
      '<ellipse cx="100" cy="226" rx="54" ry="7" fill="#26123f" opacity=".16"/>' +
      body + '</svg>';
  };

  /* هنرِ یک محصول با رنگِ نوعِ انتخاب‌شده */
  M.artFor = function (p, shadeIdx) {
    var s = M.shadeOf(p, shadeIdx || 0);
    return M.art(p.art, s.c);
  };

  /* آیکون خالی بودن سبد/لیست */
  M.emptyArt = function () {
    return '<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">' +
      '<circle cx="60" cy="60" r="46" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-width="3" stroke-dasharray="4 8"/>' +
      '<path d="M78 34a30 30 0 1 0 0 52 24 24 0 0 1 0-52Z" fill="#e259ad" opacity=".9"/>' +
      '<circle cx="86" cy="36" r="4" fill="#78e6d6"/><circle cx="34" cy="86" r="3" fill="#e8c27a"/></svg>';
  };
})();
