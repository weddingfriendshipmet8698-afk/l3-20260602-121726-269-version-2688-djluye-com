(function () {
    function showMessage(video, text) {
        var wrap = video.closest('.player-wrap');
        var message = wrap ? wrap.querySelector('[data-player-message]') : null;
        if (message) {
            message.textContent = text;
            message.classList.add('show');
        }
    }

    function startPlayer(video, source, cover) {
        if (!video || !source) {
            return;
        }

        if (cover) {
            cover.classList.add('hidden');
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (!video.src) {
                video.src = source;
            }
            video.play().catch(function () {
                showMessage(video, '播放暂时无法加载，请稍后重试');
            });
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!video.__hlsReady) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video.__hlsReady = true;
                video.__hls = hls;
            }
            video.play().catch(function () {
                showMessage(video, '播放暂时无法加载，请稍后重试');
            });
            return;
        }

        showMessage(video, '播放暂时无法加载，请稍后重试');
    }

    window.initVideoPlayer = function (videoId, source, coverId) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);

        if (!video) {
            return;
        }

        if (cover) {
            cover.addEventListener('click', function () {
                startPlayer(video, source, cover);
            });
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayer(video, source, cover);
            }
        });

        video.addEventListener('error', function () {
            showMessage(video, '播放暂时无法加载，请稍后重试');
        });
    };
})();
