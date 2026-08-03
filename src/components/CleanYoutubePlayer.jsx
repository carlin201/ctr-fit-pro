// Player passivo: reinicia o vídeo antes do encerramento para impedir que a
// interface de fim/replay do YouTube apareça a cada volta do loop.
import { useEffect, useId, useRef, useState } from "react";
import { extrairYoutubeId } from "../services/videos.js";

let youtubeApiPromise;

function carregarYoutubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve) => {
    const callbackAnterior = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      callbackAnterior?.();
      resolve(window.YT);
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return youtubeApiPromise;
}

export default function CleanYoutubePlayer({ youtubeId, title }) {
  const id = extrairYoutubeId(youtubeId);
  const reactId = useId().replace(/:/g, "");
  const playerId = `ctr-youtube-${reactId}`;
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const [iniciando, setIniciando] = useState(true);

  useEffect(() => {
    if (!id) return undefined;
    let ativo = true;
    let coverTimer;

    carregarYoutubeApi().then((YT) => {
      if (!ativo) return;
      playerRef.current = new YT.Player(playerId, {
        videoId: id,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            event.target.mute();
            event.target.playVideo();
            coverTimer = window.setTimeout(() => setIniciando(false), 3200);

            intervalRef.current = window.setInterval(() => {
              const player = playerRef.current;
              const duracao = player?.getDuration?.() || 0;
              const atual = player?.getCurrentTime?.() || 0;
              if (duracao > 0 && atual >= duracao - 0.45) {
                player.seekTo(0, true);
                player.playVideo();
              }
            }, 150);
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.ENDED) {
              event.target.seekTo(0, true);
              event.target.playVideo();
            }
          },
        },
      });
    });

    return () => {
      ativo = false;
      window.clearTimeout(coverTimer);
      window.clearInterval(intervalRef.current);
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [id, playerId]);

  return (
    <div className="yt-frame" aria-label={title}>
      <div id={playerId} />
      <div className={`yt-start-cover ${iniciando ? "visible" : ""}`} aria-hidden="true" />
      <div className="yt-interaction-shield" aria-hidden="true" />
    </div>
  );
}