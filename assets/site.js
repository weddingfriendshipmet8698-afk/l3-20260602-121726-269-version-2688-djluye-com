(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function initGlobalSearch(form) {
    var input = form.querySelector('[data-global-search]');
    var results = form.querySelector('[data-search-results]');

    if (!input || !results) {
      return;
    }

    function renderResults() {
      var keyword = normalizeText(input.value);
      var data = window.SEARCH_INDEX || [];

      if (!keyword) {
        results.classList.remove('is-open');
        results.innerHTML = '';
        return;
      }

      var matched = data.filter(function (item) {
        return normalizeText([
          item.title,
          item.region,
          item.year,
          item.type,
          item.category,
          item.genre,
          (item.tags || []).join(''),
          item.line
        ].join(' ')).indexOf(keyword) !== -1;
      }).slice(0, 8);

      if (!matched.length) {
        results.innerHTML = '<div class="search-empty">没有找到相关影片</div>';
        results.classList.add('is-open');
        return;
      }

      results.innerHTML = matched.map(function (item) {
        return '<a class="search-item" href="' + item.url + '">' +
          '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
          '<span><strong>' + item.title + '</strong><span>' + item.region + ' · ' + item.year + ' · ★ ' + item.rating + '</span></span>' +
          '</a>';
      }).join('');
      results.classList.add('is-open');
    }

    input.addEventListener('input', renderResults);
    input.addEventListener('focus', renderResults);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var first = results.querySelector('a');
      if (first) {
        window.location.href = first.getAttribute('href');
      }
    });

    document.addEventListener('click', function (event) {
      if (!form.contains(event.target)) {
        results.classList.remove('is-open');
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.global-search, .mobile-search')).forEach(initGlobalSearch);

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(function (panel) {
    var search = panel.querySelector('[data-filter-search]');
    var region = panel.querySelector('[data-filter-region]');
    var year = panel.querySelector('[data-filter-year]');
    var type = panel.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

    function applyFilters() {
      var keyword = normalizeText(search && search.value);
      var regionValue = region && region.value;
      var yearValue = year && year.value;
      var typeValue = type && type.value;

      cards.forEach(function (card) {
        var text = normalizeText([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var visible = true;

        if (keyword && text.indexOf(keyword) === -1) {
          visible = false;
        }
        if (regionValue && card.getAttribute('data-region') !== regionValue) {
          visible = false;
        }
        if (yearValue && card.getAttribute('data-year') !== yearValue) {
          visible = false;
        }
        if (typeValue && card.getAttribute('data-type') !== typeValue) {
          visible = false;
        }

        card.classList.toggle('is-hidden', !visible);
      });
    }

    [search, region, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  });
})();
