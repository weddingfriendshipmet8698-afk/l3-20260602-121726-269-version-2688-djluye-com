(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var navToggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");

    if (navToggle && nav) {
      navToggle.addEventListener("click", function () {
        var isOpen = nav.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }

    document.querySelectorAll(".site-search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var previous = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var index = Math.max(0, slides.findIndex(function (slide) {
        return slide.classList.contains("active");
      }));
      var timer = null;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          showSlide(index + 1);
        }, 5200);
      }

      if (previous) {
        previous.addEventListener("click", function () {
          showSlide(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });

      showSlide(index);
      restart();
    }

    var filterList = document.querySelector("[data-filter-list]");

    if (filterList) {
      var params = new URLSearchParams(window.location.search);
      var queryParam = params.get("q") || "";
      var controls = Array.prototype.slice.call(document.querySelectorAll(".filter-control"));
      var queryInput = document.querySelector("[data-filter='query']");
      var resetButton = document.querySelector(".filter-reset");
      var cards = Array.prototype.slice.call(filterList.querySelectorAll("[data-movie-card]"));

      if (queryInput && queryParam) {
        queryInput.value = queryParam;
      }

      function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
      }

      function filterCards() {
        var values = {};
        controls.forEach(function (control) {
          values[control.getAttribute("data-filter")] = normalize(control.value);
        });
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-index"));
          var title = normalize(card.getAttribute("data-title"));
          var query = values.query || "";
          var type = values.type || "all";
          var year = values.year || "all";
          var category = values.category || "all";
          var matchesQuery = !query || text.indexOf(query) !== -1 || title.indexOf(query) !== -1;
          var matchesType = type === "all" || normalize(card.getAttribute("data-type")) === type;
          var matchesYear = year === "all" || normalize(card.getAttribute("data-year")) === year;
          var matchesCategory = category === "all" || normalize(card.getAttribute("data-category")) === category;
          card.classList.toggle("is-hidden", !(matchesQuery && matchesType && matchesYear && matchesCategory));
        });
      }

      controls.forEach(function (control) {
        control.addEventListener("input", filterCards);
        control.addEventListener("change", filterCards);
      });

      if (resetButton) {
        resetButton.addEventListener("click", function () {
          controls.forEach(function (control) {
            if (control.tagName === "SELECT") {
              control.value = "all";
            } else {
              control.value = "";
            }
          });
          filterCards();
        });
      }

      filterCards();
    }

    var playerStage = document.querySelector(".player-stage[data-stream]");

    if (playerStage) {
      var video = playerStage.querySelector("video");
      var overlay = playerStage.querySelector(".player-overlay");
      var streamUrl = playerStage.getAttribute("data-stream");
      var hlsInstance = null;
      var loaded = false;

      function loadVideo() {
        if (loaded || !video || !streamUrl) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function playVideo() {
        loadVideo();
        playerStage.classList.add("is-playing");
        if (video) {
          var promise = video.play();
          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
          }
        }
      }

      if (overlay) {
        overlay.addEventListener("click", playVideo);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            playVideo();
          }
        });
        video.addEventListener("play", function () {
          playerStage.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          if (!video.ended) {
            playerStage.classList.remove("is-playing");
          }
        });
        window.addEventListener("beforeunload", function () {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
        });
      }
    }

    var backTop = document.querySelector(".back-top");

    if (backTop) {
      window.addEventListener("scroll", function () {
        backTop.classList.toggle("show", window.scrollY > 360);
      });
      backTop.addEventListener("click", function () {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      });
    }
  });
})();
