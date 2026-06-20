(function () {
  'use strict';

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = $('[data-mobile-menu-toggle]');
    var menu = $('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHeroCarousel() {
    var slides = $$('[data-hero-slide]');
    var dots = $$('[data-hero-dot]');
    var previous = $('[data-hero-prev]');
    var next = $('[data-hero-next]');
    var index = 0;
    var timer = null;

    if (slides.length === 0) {
      return;
    }

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupLocalFilters() {
    $$('[data-filter-scope]').forEach(function (scope) {
      var input = $('[data-filter-input]', scope);
      var genre = $('[data-genre-filter]', scope);
      var year = $('[data-year-filter]', scope);
      var counter = $('[data-filter-count]', scope);
      var cards = $$('[data-movie-card]', scope);

      function applyFilter() {
        var query = normalize(input && input.value);
        var genreValue = normalize(genre && genre.value);
        var yearValue = normalize(year && year.value);
        var visibleCount = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-year')
          ].join(' '));
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchGenre = !genreValue || normalize(card.getAttribute('data-genre')).indexOf(genreValue) !== -1;
          var matchYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
          var isVisible = matchQuery && matchGenre && matchYear;

          card.hidden = !isVisible;

          if (isVisible) {
            visibleCount += 1;
          }
        });

        if (counter) {
          counter.textContent = String(visibleCount);
        }
      }

      [input, genre, year].forEach(function (element) {
        if (element) {
          element.addEventListener('input', applyFilter);
          element.addEventListener('change', applyFilter);
        }
      });

      applyFilter();
    });
  }

  function createMovieResult(movie) {
    var card = document.createElement('a');
    var poster = document.createElement('span');
    var image = document.createElement('img');
    var rating = document.createElement('span');
    var duration = document.createElement('span');
    var body = document.createElement('span');
    var title = document.createElement('span');
    var meta = document.createElement('span');
    var category = document.createElement('span');
    var year = document.createElement('span');
    var desc = document.createElement('span');

    card.className = 'movie-card movie-card--compact';
    card.href = movie.href;

    poster.className = 'movie-card__poster';
    image.src = movie.cover;
    image.alt = movie.title + ' 高清封面';
    image.loading = 'lazy';
    rating.className = 'movie-card__rating';
    rating.textContent = '★ ' + movie.rating;
    duration.className = 'movie-card__duration';
    duration.textContent = movie.duration;

    body.className = 'movie-card__body';
    title.className = 'movie-card__title';
    title.textContent = movie.title;
    meta.className = 'movie-card__meta';
    category.textContent = movie.category;
    year.textContent = movie.year;
    desc.className = 'movie-card__desc';
    desc.textContent = movie.oneLine || movie.summary || '';

    poster.appendChild(image);
    poster.appendChild(rating);
    poster.appendChild(duration);
    meta.appendChild(category);
    meta.appendChild(year);
    body.appendChild(title);
    body.appendChild(meta);
    body.appendChild(desc);
    card.appendChild(poster);
    card.appendChild(body);

    return card;
  }

  function setupGlobalSearch() {
    var root = $('[data-global-search]');

    if (!root || !window.MOVIE_INDEX) {
      return;
    }

    var input = $('[data-global-search-input]', root);
    var region = $('[data-global-region]', root);
    var type = $('[data-global-type]', root);
    var results = $('[data-global-results]', root);
    var counter = $('[data-global-count]', root);
    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q');

    if (queryFromUrl && input) {
      input.value = queryFromUrl;
    }

    function render() {
      var query = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var matched = window.MOVIE_INDEX.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.category,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(' '));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchRegion = !regionValue || normalize(movie.region) === regionValue;
        var matchType = !typeValue || normalize(movie.type) === typeValue;

        return matchQuery && matchRegion && matchType;
      });
      var display = matched.slice(0, 96);

      results.innerHTML = '';
      display.forEach(function (movie) {
        results.appendChild(createMovieResult(movie));
      });

      if (counter) {
        counter.textContent = String(matched.length);
      }

      setupImageFallbacks(results);
    }

    [input, region, type].forEach(function (element) {
      if (element) {
        element.addEventListener('input', render);
        element.addEventListener('change', render);
      }
    });

    render();
  }

  function setupPlayer() {
    var video = $('[data-hls-player]');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-m3u8');
    var status = $('[data-player-status]');
    var playButton = $('[data-player-play]');
    var hlsInstance = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function hidePlayButton() {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    }

    function showPlayButton() {
      if (playButton) {
        playButton.classList.remove('is-hidden');
      }
    }

    if (source && window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setStatus('HLS 播放源已加载，点击播放按钮即可播放。');
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (_event, data) {
        if (data && data.fatal) {
          setStatus('播放源加载遇到问题，可刷新页面或稍后重试。');
        }
      });
    } else if (source && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setStatus('浏览器支持原生 HLS，点击播放按钮即可播放。');
    } else {
      setStatus('当前浏览器需要加载 HLS.js 才能播放 m3u8 视频源。');
    }

    if (playButton) {
      playButton.addEventListener('click', function () {
        var promise = video.play();
        hidePlayButton();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            showPlayButton();
            setStatus('浏览器阻止了自动播放，请再次点击播放器控件开始播放。');
          });
        }
      });
    }

    video.addEventListener('play', hidePlayButton);
    video.addEventListener('pause', showPlayButton);
    video.addEventListener('ended', showPlayButton);

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function setupImageFallbacks(root) {
    $$('img', root || document).forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-missing');
      }, { once: true });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupLocalFilters();
    setupGlobalSearch();
    setupPlayer();
    setupImageFallbacks(document);
  });
}());
