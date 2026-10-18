/* ==========================================================================
   ماه‌رخ — js/core/wishlist.js
   لیست علاقه‌مندی‌ها (بدون DOM). رویداد «wish:change» با هر تغییر می‌آید.
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;
  var ids = [];

  (function load() {
    var saved = M.store.get('wish', []);
    ids = (Array.isArray(saved) ? saved : []).filter(function (id) { return M.prodById[id]; });
  })();

  function changed() {
    M.store.set('wish', ids);
    M.bus.emit('wish:change', ids.slice());
  }

  M.wish = {
    has: function (id) { return ids.indexOf(id) > -1; },
    count: function () { return ids.length; },
    list: function () { return ids.map(function (id) { return M.prodById[id]; }); },

    /* خروجی: true اگر اضافه شد، false اگر حذف شد */
    toggle: function (id) {
      if (!M.prodById[id]) return false;
      var i = ids.indexOf(id);
      if (i > -1) { ids.splice(i, 1); changed(); return false; }
      ids.unshift(id);
      changed();
      return true;
    },

    remove: function (id) {
      var i = ids.indexOf(id);
      if (i > -1) { ids.splice(i, 1); changed(); }
    }
  };
})();
