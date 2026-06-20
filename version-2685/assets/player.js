(function () {
  var shells = Array.prototype.slice.call(document.querySelectorAll('.video-shell[data-video-src]'));

  var attachSource = function (video, source) {
    if (!source || video.getAttribute('data-ready') === '1') {
      return;
    }
    video.setAttribute('data-ready', '1');
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      video.src = source;
    }
  };

  shells.forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-trigger]');
    var source = shell.getAttribute('data-video-src');

    var play = function () {
      if (!video) {
        return;
      }
      attachSource(video, source);
      shell.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    };

    if (button) {
      button.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });
    }
  });
})();
