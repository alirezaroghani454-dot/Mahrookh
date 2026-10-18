/* ==========================================================================
   ماه‌رخ — js/features/quiz.js
   مشاورهٔ پوست: چهار سؤال → سه پیشنهاد محصول.
   امتیازدهی بر اساس هدف، نوع پوست، فرمول ملایم، بودجه و امتیاز کاربران است
   و تا حد امکان از دسته‌های متفاوت پیشنهاد می‌دهد (مثل یک روتین).
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;

  M.register('quiz', function () {
    var box = M.$('#quizBox');
    if (!box) return;

    var Q = M.data.quiz.questions;
    var step = 0;
    var ans = {};

    /* ---------- امتیازدهی ---------- */
    function score(p, a) {
      if (p.stock <= 0) return -99;
      var s = 0;
      if (p.goal.indexOf(a.goal) > -1) s += 4;
      if (a.goal !== 'color') {
        s += (p.skin.indexOf(a.skin) > -1 || p.skin.indexOf('all') > -1) ? 2 : -1;
      }
      if (a.gentle && p.gentle) s += 1.5;
      s += p.price <= a.budget ? 1 : -3;
      s += p.rating / 5;
      return s;
    }

    function pick(a) {
      var ranked = M.data.products
        .map(function (p) { return { p: p, s: score(p, a) }; })
        .filter(function (x) { return x.s > 0; })
        .sort(function (x, y) { return y.s - x.s; });

      var out = [], cats = {};
      ranked.forEach(function (x) {
        if (out.length < 3 && !cats[x.p.cat]) { out.push(x.p); cats[x.p.cat] = true; }
      });
      ranked.forEach(function (x) {
        if (out.length < 3 && out.indexOf(x.p) === -1) out.push(x.p);
      });
      return out;
    }

    /* ---------- نمایش سؤال ---------- */
    function renderQuestion() {
      var q = Q[step];
      box.innerHTML =
        '<div class="quiz__progress" aria-hidden="true">' + Q.map(function (_, i) { return '<i class="' + (i <= step ? 'on' : '') + '"></i>'; }).join('') + '</div>' +
        '<h3 class="quiz__q" id="quizQ">' + M.esc(q.q) + '</h3>' +
        '<div class="quiz__opts" role="group" aria-labelledby="quizQ">' + q.opts.map(function (o, i) {
          return '<button type="button" class="quiz__opt" data-i="' + i + '">' + M.esc(o.t) + (o.s ? '<small>' + M.esc(o.s) + '</small>' : '') + '</button>';
        }).join('') + '</div>' +
        (step > 0 ? '<button type="button" class="quiz__back" data-back>بازگشت به سؤال قبل</button>' : '');
    }

    /* ---------- نمایش نتیجه ---------- */
    function renderResult() {
      var picks = pick(ans);
      var skin = M.data.quiz.skinLabel[ans.skin];
      var goal = M.data.quiz.goalLabel[ans.goal];

      var cards = picks.length ? picks.map(function (p) {
        var btn = M.hasChoices(p)
          ? '<button type="button" class="btn btn--light" data-quick="' + p.id + '">انتخاب رنگ</button>'
          : '<button type="button" class="btn btn--light" data-add="' + p.id + '">افزودن</button>';
        return '<div class="qpick"><div class="qpick__art">' + M.artFor(p, 0) + '</div>' +
          '<div><div class="qpick__name">' + M.esc(p.name) + '</div><div class="qpick__price">' + M.price(p.price) + '</div></div>' + btn + '</div>';
      }).join('') : '<p>برای این ترکیب پاسخ‌ها محصول مناسبی پیدا نکردیم؛ بودجه یا هدف را تغییر بده.</p>';

      box.innerHTML =
        '<div class="quiz__result">' +
          '<h3>پیشنهاد ماه‌رخ برای پوست ' + M.esc(skin) + '</h3>' +
          '<p>برای هدف «' + M.esc(goal) + '» این محصولات را پیشنهاد می‌کنیم:</p>' +
          '<div class="quiz__picks">' + cards + '</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:10px">' +
            (picks.length ? '<button type="button" class="btn btn--light" data-add-all>افزودن همه به سبد</button>' : '') +
            '<button type="button" class="btn btn--outline-light" data-restart>شروع دوباره</button></div>' +
          '<p style="font-size:.85rem;opacity:.75">این پیشنهادها جنبهٔ راهنمایی دارند و جایگزین مشورت پزشک پوست نیستند.</p>' +
        '</div>';
      box.dataset.picks = picks.map(function (p) { return p.id; }).join(',');
    }

    function render() { step >= Q.length ? renderResult() : renderQuestion(); }

    /* ---------- رویدادها ---------- */
    box.addEventListener('click', function (e) {
      var opt = e.target.closest('.quiz__opt');
      if (opt) {
        var q = Q[step];
        ans[q.id] = q.opts[parseInt(opt.getAttribute('data-i'), 10)].v;
        opt.classList.add('is-picked');
        setTimeout(function () { step++; render(); }, M.prefersReduced ? 0 : 240);
        return;
      }
      if (e.target.closest('[data-back]')) { step = Math.max(0, step - 1); render(); return; }
      if (e.target.closest('[data-restart]')) { step = 0; ans = {}; render(); return; }
      if (e.target.closest('[data-add-all]')) {
        var ids = (box.dataset.picks || '').split(',').filter(Boolean);
        var added = 0;
        ids.forEach(function (id) { if (M.cart.add(id, 0, 1).ok) added++; });
        if (added) M.toast(M.toFa(added) + ' محصول به سبد خرید اضافه شد');
      }
    });

    render();
  });
})();
