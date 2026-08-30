// Player passivo: reinicia o vídeo antes do encerramento para impedir que a
// interface de fim/replay do YouTube apareça a cada volta do loop.
import { useEffect, useId, useRef, useState } from "react";
import { RefreshCw, VideoOff, Youtube } from "lucide-react";
import { extrairYoutubeId } from "../services/videos.js";

let youtubeApiPromise;

// Tempo máximo esperando a API/o player ficarem prontos antes de mostrar erro.
const TIMEOUT_MS = 8000;
// Se o player "ficar pronto" mas continuar sem tocar nada visível por esse
// tempo (vídeo removido/restrito sem disparar onError), também mostramos erro.
const TIMEOUT_POS_READY_MS = 6000;

function carregarYoutubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve, reject) => {
    const callbackAnterior = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      callbackAnterior?.();
      resolve(window.YT);
    };

    const existente = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existente) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => {
        youtubeApiPromise = undefined; // permite tentar de novo depois
        reject(new Error("Falha ao carregar a API do YouTube"));
      };
      document.head.appendChild(script);
    }
  });

  return youtubeApiPromise;
}

export default function CleanYoutubePlayer({ youtubeId, title, onReady }) {
  const id = extrairYoutubeId(youtubeId);
  const reactId = useId().replace(/:/g, "");
  const playerId = `ctr-youtube-${reactId}`;
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const [iniciando, setIniciando] = useState(true);
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    // youtubeId ausente ou não reconhecível: mostra erro na hora, sem
    // ficar com a tela preta de "carregando" pra sempre.
    if (!id) {
      setErro(true);
      return undefined;
    }
    let ativo = true;
    let coverTimer;
    let timeoutTimer;
    let posReadyTimer;
    let ficouPronto = false;
    let comecouATocar = false;

    setErro(false);
    setIniciando(true);

    // Se a API ou o player não ficarem prontos a tempo, mostra erro em vez
    // de deixar a tela de "carregando" travada pra sempre.
    timeoutTimer = window.setTimeout(() => {
      if (!ativo || ficouPronto) return;
      setErro(true);
    }, TIMEOUT_MS);

    carregarYoutubeApi()
      .then((YT) => {
        if (!ativo) return;
        playerRef.current = new YT.Player(playerId, {
          videoId: id,
          playerVars: {
            autoplay: 1,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: (event) => {
              ficouPronto = true;
              window.clearTimeout(timeoutTimer);
              event.target.mute();
              event.target.playVideo();
              coverTimer = window.setTimeout(() => setIniciando(false), 3200);
              onReady?.();

              // Alguns vídeos removidos/restritos "ficam prontos" no player
              // mas nunca chegam a tocar de fato, sem disparar onError.
              // Se isso acontecer, mostramos erro em vez de deixar preto.
              posReadyTimer = window.setTimeout(() => {
                if (!ativo || comecouATocar) return;
                const atual = playerRef.current?.getCurrentTime?.() || 0;
                if (atual <= 0) setErro(true);
              }, TIMEOUT_POS_READY_MS);

              intervalRef.current = window.setInterval(() => {
                const player = playerRef.current;
                const duracao = player?.getDuration?.() || 0;
                const atual = player?.getCurrentTime?.() || 0;
                if (atual > 0) comecouATocar = true;
                if (duracao > 0 && atual >= duracao - 0.45) {
                  player.seekTo(0, true);
                  player.playVideo();
                }
              }, 150);
            },
            onStateChange: (event) => {
              if (event.data === YT.PlayerState.PLAYING) comecouATocar = true;
              if (event.data === YT.PlayerState.ENDED) {
                event.target.seekTo(0, true);
                event.target.playVideo();
              }
            },
            onError: () => {
              if (!ativo) return;
              window.clearTimeout(timeoutTimer);
              window.clearTimeout(posReadyTimer);
              setErro(true);
            },
          },
        });
      })
      .catch(() => {
        if (!ativo) return;
        setErro(true);
      });

    return () => {
      ativo = false;
      window.clearTimeout(coverTimer);
      window.clearTimeout(timeoutTimer);
      window.clearTimeout(posReadyTimer);
      window.clearInterval(intervalRef.current);
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, playerId, tentativa]);

  if (erro) {
    return (
      <div className="yt-frame yt-frame-erro" aria-label={title}>
        <VideoOff size={26} />
        <p>Não foi possível carregar o vídeo.</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setTentativa((t) => t + 1)}
          >
            <RefreshCw size={14} /> Tentar novamente
          </button>
          {id && (
            <a
              className="btn btn-secondary"
              href={`https://youtube.com/shorts/${id}`}
              target="_blank"
              rel="noreferrer"
            >
              <Youtube size={14} /> Assistir no YouTube
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="yt-frame" aria-label={title}>
      <div id={playerId} />
      <div className={`yt-start-cover ${iniciando ? "visible" : ""}`} aria-hidden="true" />
    </div>
  );
}
