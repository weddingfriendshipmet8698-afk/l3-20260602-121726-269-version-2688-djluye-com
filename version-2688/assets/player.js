(function () {
  var video = document.getElementById('movie-player');
  var startButton = document.querySelector('.player-start');
  var statusBox = document.querySelector('.player-status');

  if (!video || !startButton) {
    return;
  }

  var streamUrl = startButton.getAttribute('data-stream');
  var attached = false;
  var hlsInstance = null;

  function showStatus(message) {
    if (statusBox) {
      statusBox.textContent = message || '';
    }
  }

  function attachStream() {
    if (attached || !streamUrl) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      attached = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          showStatus('播放暂时不可用，请稍后再试。');
        }
      });
      attached = true;
      return;
    }

    video.src = streamUrl;
    attached = true;
  }

  function playMovie() {
    attachStream();
    startButton.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        startButton.classList.remove('is-hidden');
        showStatus('点击播放按钮继续观看。');
      });
    }
  }

  startButton.addEventListener('click', playMovie);

  video.addEventListener('play', function () {
    startButton.classList.add('is-hidden');
    showStatus('');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
