(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function activate(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                activate(current + 1);
            }, 5200);
        }

        function restart() {
            window.clearInterval(timer);
            start();
        }

        var next = hero.querySelector('[data-hero-next]');
        var prev = hero.querySelector('[data-hero-prev]');

        if (next) {
            next.addEventListener('click', function () {
                activate(current + 1);
                restart();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                activate(current - 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                activate(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        activate(0);
        start();
    }

    var searchInput = document.querySelector('[data-search-input]');
    var yearSelect = document.querySelector('[data-year-select]');
    var typeSelect = document.querySelector('[data-type-select]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));

    function filterCards() {
        if (!cards.length) {
            return;
        }
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';

        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre')
            ].join(' ').toLowerCase();
            var yearOk = !year || card.getAttribute('data-year') === year;
            var typeOk = !type || card.getAttribute('data-type') === type;
            var keywordOk = !keyword || text.indexOf(keyword) !== -1;
            card.style.display = yearOk && typeOk && keywordOk ? '' : 'none';
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterCards);
    }
    if (yearSelect) {
        yearSelect.addEventListener('change', filterCards);
    }
    if (typeSelect) {
        typeSelect.addEventListener('change', filterCards);
    }
})();
