/* ==========================================================================
   ماه‌رخ — js/core/storage.js
   کار امن با localStorage (در حالت خصوصی مرورگر هم خطا نمی‌دهد).
   همهٔ کلیدها با پیشوند «mahrokh:» ذخیره می‌شوند.
   ========================================================================== */
(function () {
  'use strict';

  var M = window.Mahrokh;
  var PREFIX = 'mahrokh:';
  var memory = {}; // اگر localStorage در دسترس نبود، فقط تا بستن صفحه نگه می‌داریم

  M.store = {
    get: function (key, fallback) {
      try {
        var raw = window.localStorage.getItem(PREFIX + key);
        if (raw === null) return key in memory ? memory[key] : fallback;
        return JSON.parse(raw);
      } catch (e) {
        return key in memory ? memory[key] : fallback;
      }
    },
    set: function (key, value) {
      memory[key] = value;
      try { window.localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* نادیده */ }
    },
    remove: function (key) {
      delete memory[key];
      try { window.localStorage.removeItem(PREFIX + key); } catch (e) { /* نادیده */ }
    }
  };
})();
