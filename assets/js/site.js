/* ============================================================
   Kovai Lakshmi Grinders – shared scripts (every page)
   Menu, Products dropdown, collapsible search, live search
   suggestions, current-page highlight and form sending.
============================================================ */
(function (window, document) {
  'use strict';

  var KL = window.KL = window.KL || {};

  /* ──────────────────────────────────────────────────────────
     SETTINGS
  ────────────────────────────────────────────────────────── */

  // PASTE YOUR APPS SCRIPT EXEC URL HERE
  KL.EXEC_URL = 'https://script.google.com/macros/s/AKfycbzxjurOZCF1dSoXB-hNuUBPWRiAutibVyhjooedImsW-dEU23_BR-fFfaeV5rO2UB35/exec';

  KL.BASE = 'https://kovailakshmi.in/';
  KL.SEARCH_DATA_URL = KL.BASE + 'search-index.json';
  KL.MOBILE_MAX = 768;   /* matches the CSS mobile menu breakpoint */
  KL.TABLET_MAX = 1024;  /* matches the CSS collapsible search breakpoint */

  /* ──────────────────────────────────────────────────────────
     SMALL HELPERS
  ────────────────────────────────────────────────────────── */
  KL.escapeHtml = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* Lower-case and strip accents so "Café" matches "cafe" */
  KL.normalize = function (s) {
    s = String(s == null ? '' : s).toLowerCase();
    if (s.normalize) s = s.normalize('NFD').replace(/[̀-ͯ]/g, '');
    return s;
  };

  /* Sends form data to the Google Sheet in the background.
     Uses no-cors (the reply cannot be read) and keepalive (the request
     survives even if the page navigates away, e.g. to WhatsApp). */
  KL.sendToSheet = function (payload) {
    if (!KL.EXEC_URL) {
      return Promise.reject(new Error('EXEC_URL is not set in assets/js/site.js'));
    }
    return fetch(KL.EXEC_URL, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      body: JSON.stringify(payload)
    });
  };

  function isMobile() { return window.innerWidth <= KL.MOBILE_MAX; }

  /* ──────────────────────────────────────────────────────────
     HAMBURGER MENU & PRODUCTS DROPDOWN
  ────────────────────────────────────────────────────────── */
  function initMenu() {
    var burger = document.getElementById('hamburger');
    var nav = document.getElementById('navLinks');
    var dropdown = document.querySelector('.dropdown');
    var dropToggle = document.querySelector('.dropdown-toggle');
    if (!burger || !nav) return;

    function setMenu(open) {
      nav.classList.toggle('open', open);
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function setDropdown(open) {
      if (!dropdown) return;
      dropdown.classList.toggle('open', open);
      if (dropToggle) dropToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    KL.setMenu = setMenu;
    KL.setDropdown = setDropdown;

    burger.addEventListener('click', function () {
      setMenu(!nav.classList.contains('open'));
    });

    if (dropToggle && dropdown) {
      /* Tap / click / Enter / Space on "Products" toggles the list (desktop and mobile) */
      dropToggle.addEventListener('click', function (e) {
        e.preventDefault();
        setDropdown(!dropdown.classList.contains('open'));
      });
      dropToggle.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          setDropdown(!dropdown.classList.contains('open'));
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setDropdown(true);
          /* wait one moment: the list fades in, and hidden items cannot take focus yet */
          window.setTimeout(function () {
            var first = dropdown.querySelector('.dropdown-content a');
            if (first) first.focus();
          }, 60);
        }
      });

      /* Arrow keys move between items; Esc closes and returns to "Products" */
      dropdown.addEventListener('keydown', function (e) {
        var items = Array.prototype.slice.call(dropdown.querySelectorAll('.dropdown-content a'));
        var idx = items.indexOf(document.activeElement);
        if (e.key === 'Escape' || e.key === 'Esc') {
          setDropdown(false);
          dropToggle.focus();
        } else if (idx > -1 && e.key === 'ArrowDown') {
          e.preventDefault();
          items[(idx + 1) % items.length].focus();
        } else if (idx > -1 && e.key === 'ArrowUp') {
          e.preventDefault();
          if (idx === 0) dropToggle.focus(); else items[idx - 1].focus();
        }
      });

      /* Close when keyboard focus leaves the dropdown (desktop) */
      dropdown.addEventListener('focusout', function (e) {
        if (!isMobile() && !dropdown.contains(e.relatedTarget)) setDropdown(false);
      });

      /* Close when clicking anywhere else (desktop) */
      document.addEventListener('click', function (e) {
        if (!isMobile() && !dropdown.contains(e.target)) setDropdown(false);
      });
    }

    /* Close the mobile menu when a real link is tapped */
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (link.classList.contains('dropdown-toggle')) return;
        setMenu(false);
      });
    });

    /* Esc also closes the mobile menu */
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && nav.classList.contains('open')) {
        setMenu(false);
        burger.focus();
      }
    });
  }

  /* "VIEW ALL PRODUCTS": desktop → scroll to top and open the dropdown;
     mobile → open the hamburger menu with Products expanded. */
  KL.openProductsMenu = function () {
    if (!KL.setMenu || !KL.setDropdown) return;
    if (isMobile()) {
      KL.setMenu(true);
      KL.setDropdown(true);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.setTimeout(function () {
        KL.setDropdown(true);
        var toggle = document.querySelector('.dropdown-toggle');
        if (toggle) toggle.focus({ preventScroll: true });
      }, 350);
    }
  };

  /* ──────────────────────────────────────────────────────────
     CURRENT PAGE HIGHLIGHT
  ────────────────────────────────────────────────────────── */
  function initActiveLink() {
    var nav = document.getElementById('navLinks');
    if (!nav) return;
    var path = window.location.pathname.replace(/index\.html$/, '');
    if (path.charAt(path.length - 1) !== '/') path += '/';
    var section = (document.body.getAttribute('data-section') || '').trim();

    nav.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href === '#' || a.classList.contains('dropdown-toggle')) return;
      var linkPath;
      try { linkPath = new URL(href, KL.BASE).pathname; } catch (err) { return; }
      /* Home matches only "/"; other links also match their sub-pages (e.g. a resource post) */
      var match = linkPath === '/' ? path === '/' : path.indexOf(linkPath) === 0;
      if (match) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
    });

    /* Category and product pages highlight "Products" */
    if (section === 'products') {
      var toggle = nav.querySelector('.dropdown-toggle');
      if (toggle) toggle.classList.add('active');
    }
  }

  /* ──────────────────────────────────────────────────────────
     COLLAPSIBLE SEARCH BAR (tablet & mobile)
  ────────────────────────────────────────────────────────── */
  function initCollapsibleSearch() {
    var searchForm = document.getElementById('mobileSearchForm');
    var searchInput = document.getElementById('mobileSearchInput');
    var searchBtn = searchForm ? searchForm.querySelector('button') : null;
    if (!searchForm || !searchInput || !searchBtn) return;

    searchBtn.addEventListener('click', function (e) {
      if (window.innerWidth <= KL.TABLET_MAX && !searchForm.classList.contains('active')) {
        e.preventDefault();
        searchForm.classList.add('active');
        searchInput.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (window.innerWidth <= KL.TABLET_MAX && searchForm.classList.contains('active')) {
        var suggest = document.getElementById('searchSuggest');
        if (!searchForm.contains(e.target) && !(suggest && suggest.contains(e.target))) {
          searchForm.classList.remove('active');
        }
      }
    });
  }

  /* ──────────────────────────────────────────────────────────
     SEARCH ENGINE (shared by suggestions and the search page)
  ────────────────────────────────────────────────────────── */
  var searchDataPromise = null;

  /* Loads search-index.json only once per page visit */
  KL.loadSearchData = function () {
    if (!searchDataPromise) {
      searchDataPromise = fetch(KL.SEARCH_DATA_URL, { cache: 'no-cache' })
        .then(function (r) {
          if (!r.ok) throw new Error('Search data could not be loaded');
          return r.json();
        })
        .then(function (data) { return Array.isArray(data) ? data : (data.pages || []); })
        .catch(function (err) {
          searchDataPromise = null; /* allow a retry on the next keystroke */
          throw err;
        });
    }
    return searchDataPromise;
  };

  var FIELD_WEIGHTS = [
    ['title', 10], ['category', 5], ['keywords', 4], ['specs', 3], ['description', 2], ['content', 1]
  ];

  KL.queryTerms = function (q) {
    return KL.normalize(q).split(/[^a-z0-9஀-௿]+/).filter(function (t) { return t.length > 0; })
      .filter(function (t, i, arr) { return arr.indexOf(t) === i; });
  };

  /* Case-insensitive, partial-word, multi-word (all words must match).
     Title matches rank above category, keywords, specs, description and content. */
  KL.search = function (query, data) {
    var terms = KL.queryTerms(query);
    if (!terms.length) return [];
    var phrase = KL.normalize(query).trim();
    var results = [];

    data.forEach(function (page) {
      var score = 0;
      var allMatched = terms.every(function (term) {
        var termScore = 0;
        FIELD_WEIGHTS.forEach(function (fw) {
          var value = KL.normalize(page[fw[0]]);
          if (value && value.indexOf(term) > -1) {
            termScore += fw[1];
            if (fw[0] === 'title' && new RegExp('(^|[^a-z0-9])' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(value)) {
              termScore += 5; /* word starts with the term */
            }
          }
        });
        score += termScore;
        return termScore > 0;
      });
      if (!allMatched) return;
      if (phrase.length > 1 && KL.normalize(page.title).indexOf(phrase) > -1) score += 15;
      results.push({ page: page, score: score });
    });

    results.sort(function (a, b) {
      return b.score - a.score || String(a.page.title).localeCompare(String(b.page.title));
    });
    return results.map(function (r) { return r.page; });
  };

  /* Returns safe HTML with every matched term wrapped in <mark> */
  KL.highlight = function (text, terms) {
    text = String(text == null ? '' : text);
    var lower = KL.normalize(text);
    var ranges = [];
    terms.forEach(function (t) {
      var from = 0, idx;
      while (t && (idx = lower.indexOf(t, from)) > -1) {
        ranges.push([idx, idx + t.length]);
        from = idx + t.length;
      }
    });
    if (!ranges.length || lower.length !== text.length) {
      return KL.escapeHtml(text);
    }
    ranges.sort(function (a, b) { return a[0] - b[0]; });
    var merged = [ranges[0]];
    ranges.slice(1).forEach(function (r) {
      var last = merged[merged.length - 1];
      if (r[0] <= last[1]) last[1] = Math.max(last[1], r[1]); else merged.push(r);
    });
    var html = '', pos = 0;
    merged.forEach(function (r) {
      html += KL.escapeHtml(text.slice(pos, r[0])) + '<mark>' + KL.escapeHtml(text.slice(r[0], r[1])) + '</mark>';
      pos = r[1];
    });
    return html + KL.escapeHtml(text.slice(pos));
  };

  /* Short excerpt around the first matched word */
  KL.snippet = function (page, terms, size) {
    size = size || 170;
    var fields = ['description', 'specs', 'content', 'keywords', 'category'];
    for (var f = 0; f < fields.length; f++) {
      var text = String(page[fields[f]] || '');
      var lower = KL.normalize(text);
      for (var t = 0; t < terms.length; t++) {
        var idx = lower.indexOf(terms[t]);
        if (idx > -1) {
          var start = Math.max(0, idx - Math.floor(size / 3));
          var end = Math.min(text.length, start + size);
          var cut = text.slice(start, end);
          return (start > 0 ? '…' : '') + cut + (end < text.length ? '…' : '');
        }
      }
    }
    var d = String(page.description || '');
    return d.length > size ? d.slice(0, size) + '…' : d;
  };

  /* ──────────────────────────────────────────────────────────
     LIVE SEARCH SUGGESTIONS (header, every page)
  ────────────────────────────────────────────────────────── */
  function initSuggestions() {
    var form = document.getElementById('mobileSearchForm');
    var input = document.getElementById('mobileSearchInput');
    if (!form || !input) return;

    input.setAttribute('autocomplete', 'off');
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', 'searchSuggest');

    var box = document.createElement('div');
    box.className = 'search-suggest';
    box.id = 'searchSuggest';
    box.setAttribute('role', 'listbox');
    form.appendChild(box);

    var activeIndex = -1;
    var timer = null;

    function links() { return Array.prototype.slice.call(box.querySelectorAll('a')); }

    function close() {
      box.classList.remove('show');
      box.innerHTML = '';
      activeIndex = -1;
      input.setAttribute('aria-expanded', 'false');
    }

    function setActive(i) {
      var all = links();
      if (!all.length) return;
      activeIndex = (i + all.length) % all.length;
      all.forEach(function (a, n) {
        a.classList.toggle('is-active', n === activeIndex);
        a.setAttribute('aria-selected', n === activeIndex ? 'true' : 'false');
      });
      all[activeIndex].scrollIntoView({ block: 'nearest' });
    }

    function render(query) {
      KL.loadSearchData().then(function (data) {
        if (input.value.trim() !== query) return; /* user kept typing */
        var terms = KL.queryTerms(query);
        var matches = KL.search(query, data).slice(0, 6);
        var allUrl = KL.BASE + 'search/?q=' + encodeURIComponent(query);
        var html = '';
        if (matches.length) {
          html += '<ul>';
          matches.forEach(function (p) {
            html += '<li><a href="' + KL.escapeHtml(p.url) + '" role="option">' +
              (p.image ? '<img src="' + KL.escapeHtml(p.image) + '" alt="" loading="lazy">' : '<span class="ss-noimg" aria-hidden="true"></span>') +
              '<span class="ss-text"><span class="ss-name">' + KL.highlight(p.title, terms) + '</span>' +
              '<span class="ss-type">' + KL.escapeHtml(p.type) + '</span></span></a></li>';
          });
          html += '</ul>';
        } else {
          html += '<div class="ss-empty">No quick matches. Press Enter to search the whole site.</div>';
        }
        html += '<a class="ss-all" href="' + KL.escapeHtml(allUrl) + '" role="option">See all results →</a>';
        box.innerHTML = html;
        box.classList.add('show');
        activeIndex = -1;
        input.setAttribute('aria-expanded', 'true');
      }).catch(function () { close(); });
    }

    input.addEventListener('input', function () {
      var q = input.value.trim();
      window.clearTimeout(timer);
      if (q.length < 2) { close(); return; }
      timer = window.setTimeout(function () { render(q); }, 120);
    });

    input.addEventListener('focus', function () {
      KL.loadSearchData().catch(function () {});
      if (input.value.trim().length >= 2) render(input.value.trim());
    });

    input.addEventListener('keydown', function (e) {
      if (!box.classList.contains('show')) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIndex + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIndex - 1); }
      else if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); close(); }
      else if (e.key === 'Enter' && activeIndex > -1) {
        e.preventDefault();
        window.location.href = links()[activeIndex].href;
      }
    });

    document.addEventListener('click', function (e) {
      if (!form.contains(e.target)) close();
    });

    /* Send searches to the search page with a clean URL */
    form.addEventListener('submit', function (e) {
      var q = input.value.trim();
      if (!q) { e.preventDefault(); input.focus(); return; }
      e.preventDefault();
      window.location.href = KL.BASE + 'search/?q=' + encodeURIComponent(q);
    });
  }

  /* ──────────────────────────────────────────────────────────
     START
  ────────────────────────────────────────────────────────── */
  function start() {
    initMenu();
    initActiveLink();
    initCollapsibleSearch();
    initSuggestions();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

}(window, document));
