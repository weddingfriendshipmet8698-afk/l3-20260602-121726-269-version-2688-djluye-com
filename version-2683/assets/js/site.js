(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', mobileMenu.classList.contains('is-open'));
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    var show = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    };

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  var cardLists = Array.prototype.slice.call(document.querySelectorAll('[data-card-list]'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-year]'));
  var state = {
    q: '',
    year: ''
  };

  var normalize = function (value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  };

  var applyFilter = function () {
    var keyword = normalize(state.q);
    var year = state.year;

    cardLists.forEach(function (list) {
      var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

      cards.forEach(function (card) {
        var content = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchKeyword = !keyword || content.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        card.classList.toggle('is-hidden', !(matchKeyword && matchYear));
      });
    });
  };

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      state.q = input.value;
      searchInputs.forEach(function (other) {
        if (other !== input) {
          other.value = input.value;
        }
      });
      applyFilter();
    });
  });

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      state.year = button.getAttribute('data-filter-year') || '';
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item.getAttribute('data-filter-year') === state.year);
      });
      applyFilter();
    });
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play-button]');

    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var started = false;

    var prepare = function () {
      if (started || !stream) {
        return;
      }
      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
      }
    };

    var play = function () {
      prepare();
      var action = video.play();
      box.classList.add('is-playing');
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          box.classList.remove('is-playing');
        });
      }
    };

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('play', function () {
      box.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      box.classList.remove('is-playing');
    });
  });
})();
