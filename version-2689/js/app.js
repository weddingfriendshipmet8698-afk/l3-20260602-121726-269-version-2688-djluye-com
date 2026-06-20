function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

function initMenu() {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (!toggle || !panel) return;
  toggle.addEventListener('click', function () {
    var open = panel.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

function initHero() {
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  if (!slides.length) return;
  var index = 0;
  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === index);
    });
    var feature = document.querySelector('.hero-feature');
    if (feature) {
      var slide = slides[index];
      feature.querySelector('img').src = slide.getAttribute('data-poster');
      feature.querySelector('img').alt = slide.getAttribute('data-title');
      feature.querySelector('strong').textContent = slide.getAttribute('data-title');
      feature.querySelector('p').textContent = slide.getAttribute('data-desc');
      feature.querySelector('a').href = slide.getAttribute('data-href');
    }
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      show(i);
    });
  });
  show(0);
  window.setInterval(function () {
    show(index + 1);
  }, 5200);
}

function initFilters() {
  var filter = document.querySelector('[data-filter-root]');
  if (!filter) return;
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var keyword = document.querySelector('[data-filter-keyword]');
  var category = document.querySelector('[data-filter-category]');
  var region = document.querySelector('[data-filter-region]');
  var year = document.querySelector('[data-filter-year]');
  var clear = document.querySelector('[data-filter-clear]');
  var empty = document.querySelector('[data-filter-empty]');
  var params = new URLSearchParams(window.location.search);
  if (keyword && params.get('q')) {
    keyword.value = params.get('q');
  }
  function apply() {
    var q = keyword ? keyword.value.trim().toLowerCase() : '';
    var cat = category ? category.value : '';
    var reg = region ? region.value : '';
    var y = year ? year.value : '';
    var visible = 0;
    cards.forEach(function (card) {
      var text = [card.dataset.title, card.dataset.category, card.dataset.region, card.dataset.genre, card.dataset.year].join(' ').toLowerCase();
      var ok = true;
      if (q && text.indexOf(q) === -1) ok = false;
      if (cat && card.dataset.category !== cat) ok = false;
      if (reg && card.dataset.region !== reg) ok = false;
      if (y && card.dataset.year !== y) ok = false;
      card.style.display = ok ? '' : 'none';
      if (ok) visible += 1;
    });
    if (empty) {
      empty.style.display = visible ? 'none' : 'block';
    }
  }
  [keyword, category, region, year].forEach(function (el) {
    if (el) el.addEventListener('input', apply);
  });
  if (clear) {
    clear.addEventListener('click', function () {
      if (keyword) keyword.value = '';
      if (category) category.value = '';
      if (region) region.value = '';
      if (year) year.value = '';
      apply();
    });
  }
  apply();
}

function attachPlayer(button) {
  var video = document.getElementById(button.getAttribute('data-video-target'));
  var url = button.getAttribute('data-video-url');
  if (!video || !url) return;
  var started = false;
  function loadAndPlay() {
    if (!started) {
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }
    button.classList.add('is-hidden');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }
  button.addEventListener('click', loadAndPlay);
  video.addEventListener('click', function () {
    if (video.paused) {
      loadAndPlay();
    }
  });
}

function initPlayers() {
  Array.prototype.slice.call(document.querySelectorAll('[data-video-url]')).forEach(attachPlayer);
}

ready(function () {
  initMenu();
  initHero();
  initFilters();
  initPlayers();
});
