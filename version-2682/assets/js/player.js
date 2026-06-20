(function () {
  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-player-overlay]');
    var button = player.querySelector('[data-play-button]');
    var hls;

    if (!video || !overlay) {
      return;
    }

    function attachSource() {
      var source = video.getAttribute('data-hls');

      if (!source || video.getAttribute('src')) {
        return Promise.resolve();
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.setAttribute('src', source);
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        return new Promise(function (resolve) {
          hls = new window.Hls({
            maxBufferLength: 36,
            enableWorker: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              hls.destroy();
              video.setAttribute('src', source);
              resolve();
            }
          });
        });
      }

      video.setAttribute('src', source);
      return Promise.resolve();
    }

    function startPlayback() {
      attachSource().then(function () {
        overlay.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            overlay.classList.remove('is-hidden');
          });
        }
      });
    }

    overlay.addEventListener('click', startPlayback);
    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        startPlayback();
      });
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
  });
})();
