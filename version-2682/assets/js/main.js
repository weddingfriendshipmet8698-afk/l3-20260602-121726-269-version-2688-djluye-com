(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('.site-search').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        stopHero();
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);

    if (slides.length > 1) {
      startHero();
    }
  }

  var filterList = document.querySelector('[data-filter-list]');
  if (filterList) {
    var keywordInput = document.querySelector('.category-filter');
    var yearSelect = document.querySelector('.year-filter');
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));

    function applyFilter() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesYear = !year || card.getAttribute('data-year') === year;
        card.classList.toggle('is-filtered-out', !(matchesKeyword && matchesYear));
      });
    }

    if (keywordInput) {
      keywordInput.addEventListener('input', applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }
  }

  var resultRoot = document.getElementById('search-results');
  if (resultRoot && window.SITE_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.getElementById('search-input');
    var heading = document.getElementById('search-heading');

    if (input) {
      input.value = query;
    }

    function renderMovie(movie) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="poster-shade"></span>',
        '    <span class="play-dot">▶</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="movie-meta-row"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span><a href="' + movie.categoryUrl + '">' + escapeHtml(movie.category) + '</a></div>',
        '    <h2><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    var list = window.SITE_MOVIES.slice();
    if (query) {
      var q = query.toLowerCase();
      list = list.filter(function (movie) {
        return [movie.title, movie.year, movie.region, movie.genre, movie.tags, movie.category].join(' ').toLowerCase().indexOf(q) !== -1;
      });
      if (heading) {
        heading.textContent = '“' + query + '”相关内容';
      }
    }

    resultRoot.innerHTML = list.slice(0, 120).map(renderMovie).join('');
  }
})();
