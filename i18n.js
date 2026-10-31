/* VidRidge i18n engine — applies translations in the browser. Data lives in i18n-data.js. */
import { LANGS, META, KEYS, LOCALES } from './i18n-data.js';

(function () {
  'use strict';

  var dict = {};
  Object.keys(LOCALES).forEach(function (code) {
    var arr = LOCALES[code] || [];
    var o = {};
    for (var i = 0; i < KEYS.length; i++) {
      o[KEYS[i]] = (arr[i] != null && arr[i] !== '') ? arr[i] : EN[i];
    }
    dict[code] = o;
  });

  function readCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }

  function norm(code) {
    code = (code || '').toLowerCase();
    if (code.indexOf('-') > 0) code = code.split('-')[0];
    return dict[code] ? code : '';
  }

  function detect() {
    var m = location.pathname.match(/^\/([a-z]{2})(?:\/|$)/);
    if (m && norm(m[1])) return norm(m[1]);
    var q = new URLSearchParams(location.search).get('lang');
    if (norm(q)) return norm(q);
    var c = norm(readCookie('lang'));
    if (c) return c;
    var h = norm(document.documentElement.getAttribute('lang'));
    if (h) return h;
    var n = norm(navigator.language || '');
    if (n) return n;
    return 'en';
  }

  var current = detect();

  function t(key, vars) {
    var s = (dict[current] && dict[current][key]) || dict.en[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.split('{' + k + '}').join(vars[k]);
      });
    }
    return s;
  }

  function setAttrs(sel, attr, key) {
    var nodes = document.querySelectorAll(sel);
    for (var i = 0; i < nodes.length; i++) nodes[i].setAttribute(attr, t(nodes[i].getAttribute(key)));
  }

  function buildLangUi() {
    var sel = document.getElementById('langSelect');
    if (sel && !sel.options.length) {
      LANGS.forEach(function (l) {
        var o = document.createElement('option');
        o.value = l.code;
        o.textContent = l.name;
        sel.appendChild(o);
      });
    }
    if (sel) sel.value = current;
    var sel2 = document.getElementById('langSelect2');
    if (sel2 && !sel2.options.length) {
      LANGS.forEach(function (l) {
        var o = document.createElement('option');
        o.value = l.code;
        o.textContent = l.name;
        sel2.appendChild(o);
      });
    }
    if (sel2) sel2.value = current;

    var box = document.getElementById('langLinks');
    if (box && !box.children.length) {
      LANGS.forEach(function (l) {
        var a = document.createElement('a');
        a.href = '/' + l.code + '/';
        a.hreflang = l.code;
        a.lang = l.code;
        a.textContent = l.name;
        a.className = 'hover:underline' + (l.code === current ? ' font-bold' : ' opacity-80');
        box.appendChild(a);
      });
    }
  }

  function apply() {
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = t(nodes[i].getAttribute('data-i18n'));
    }
    var html = document.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < html.length; j++) {
      html[j].innerHTML = t(html[j].getAttribute('data-i18n-html'));
    }
    setAttrs('[data-i18n-ph]', 'placeholder', 'data-i18n-ph');
    setAttrs('[data-i18n-aria]', 'aria-label', 'data-i18n-aria');
    setAttrs('[data-i18n-title]', 'title', 'data-i18n-title');

    document.documentElement.lang = current;
    document.documentElement.dir = (META[current] && META[current].dir) || 'ltr';

    if (document.body && document.body.getAttribute('data-page') !== 'watch' && META[current]) {
      document.title = META[current].title;
      var d = document.querySelector('meta[name="description"]');
      if (d) d.setAttribute('content', META[current].desc);
    }
    buildLangUi();
  }

  function switchTo(code) {
    if (!dict[code]) return;
    document.cookie = 'lang=' + code + '; path=/; max-age=31536000; SameSite=Lax';
    var isWatch = /\/watch\/?$/.test(location.pathname) || /watch\.html$/.test(location.pathname);
    location.href = '/' + code + (isWatch ? '/watch' : '/') + location.search + location.hash;
  }

  function bind() {
    ['langSelect', 'langSelect2'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('change', function () { switchTo(el.value); });
    });
  }

  function init() {
    apply();
    bind();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.VRI18N = {
    lang: current,
    t: t,
    apply: apply,
    setLang: switchTo,
    LANGS: LANGS,
    META: META,
    KEYS: KEYS,
    LOCALES: LOCALES
  };
})();
