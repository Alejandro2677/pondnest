import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { tiktokVideos } from "../data/tiktokVideos.js";
import {
  prepareVideos,
  playerUrl,
  TIKTOK_ORIGIN,
} from "../services/socialContent.js";
import HorizontalCarousel from "./HorizontalCarousel.jsx";
import useSocialVisibility from "./useSocialVisibility.js";
import { useCookieConsent } from "./CookieConsent.jsx";
import "./socialProof.css";

const demoVideos = [
  ["Una primera mirada", "R36S", "/models/hero-poster.webp"],
  ["Pantalla y controles", "R36S", "/models/hero-poster.webp"],
  ["Desde otro ángulo", "R36S", "/models/hero-poster.webp"],
  ["Otra forma de jugar", "R36H", "/productos/r36h-demo.webp"],
];

function TikTokPlayer({
  video,
  visible,
  audioEnabled,
  onAudioToggle,
  onActivate,
  onSuspend,
  register,
}) {
  const iframe = useRef();
  const visibleNow = useRef(visible);
  visibleNow.current = visible;
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const timer = useRef();
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const send = useCallback(
    (type) =>
      iframe.current?.contentWindow?.postMessage(
        { type, "x-tiktok-player": true },
        TIKTOK_ORIGIN,
      ),
    [],
  );
  useEffect(
    () =>
      register(video.id, () => {
        send("pause");
        send("mute");
      }),
    [register, video.id, send],
  );
  useEffect(() => {
    if (!visible) {
      send("pause");
      send("mute");
      onSuspend(video.id);
    }
  }, [visible, send, onSuspend, video.id]);
  useEffect(() => {
    setReady(false);
    setLoaded(false);
    setPlaying(false);
    timer.current = setTimeout(
      () =>
        setError("TikTok no ha respondido. Puedes abrir el vídeo original."),
      15000,
    );
    function receive(event) {
      if (
        event.origin !== TIKTOK_ORIGIN ||
        event.source !== iframe.current?.contentWindow ||
        event.data?.["x-tiktok-player"] !== true
      )
        return;
      const { type, value } = event.data;
      if (type === "onPlayerReady") {
        clearTimeout(timer.current);
        setReady(true);
        // TikTok can initialise its API only after the native play button is
        // pressed. Do not pause that explicit user action when ready arrives.
        send(audioEnabled ? "unMute" : "mute");
      }
      if (type === "onStateChange") {
        const active = value === 1 || value === 3;
        setPlaying(active);
        if (active) {
          if (!visibleNow.current || document.hidden) {
            send("pause");
            send("mute");
            onSuspend(video.id);
          } else if (value === 1) onActivate(video.id);
        }
      }
      if (type === "onPlayerError" || type === "onError") {
        clearTimeout(timer.current);
        send("pause");
        setError("Este vídeo no se puede reproducir aquí.");
      }
    }
    window.addEventListener("message", receive);
    return () => {
      clearTimeout(timer.current);
      window.removeEventListener("message", receive);
    };
  }, [send, audioEnabled, video.id, onActivate, onSuspend]);
  return (
    <div className="tiktok-player-shell">
      {!error ? (
        <iframe
          key={audioEnabled ? "audio" : "silent"}
          ref={iframe}
          src={playerUrl(video.postId, audioEnabled)}
          title={`TikTok de ${video.creator || "su creador"}: ${video.description}`}
          loading="lazy"
          allow="fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => {
            // A loaded official player may still be awaiting its own cookie
            // choice or the first native play click. Missing API-ready is not
            // a network failure and must not remove a usable iframe.
            clearTimeout(timer.current);
            setLoaded(true);
          }}
          onError={() =>
            setError("No se pudo cargar TikTok. Puedes abrir el original.")
          }
        />
      ) : (
        <div className="social-video-message" role="status">
          <span aria-hidden="true">↗</span>
          <p>{error}</p>
          <a href={video.url} target="_blank" rel="noopener noreferrer">
            Ver original en TikTok ↗
          </a>
        </div>
      )}
      <div className="tiktok-player-toolbar">
        {!error && ready && (
          <button
            type="button"
            disabled={!ready}
            onClick={() => send(playing ? "pause" : "play")}
            aria-label={`${playing ? "Pausar" : "Reproducir"} vídeo de ${video.creator || "TikTok"}`}
          >
            {ready ? (playing ? "Pausar Ⅱ" : "Reproducir ▷") : "Cargando…"}
          </button>
        )}
        {!error && !ready && (
          <span style={{ fontSize: 10, padding: "15px 8px" }}>
            {loaded ? "Pulsa ▷ en el vídeo" : "Cargando…"}
          </span>
        )}
        {!error && (
          <button
            type="button"
            onClick={() => {
              send("pause");
              onAudioToggle(video.id);
            }}
            title="Recarga el vídeo en pausa para cambiar el sonido"
          >
            {audioEnabled ? "Silenciar" : "Activar sonido"}
          </button>
        )}
      </div>
    </div>
  );
}

function VideoCard({
  video,
  consent,
  pageVisible,
  audioEnabled,
  onAudioToggle,
  onActivate,
  onSuspend,
  register,
}) {
  const [nearRef, near] = useSocialVisibility({
    threshold: 0.01,
    rootMargin: "350px 120px",
  });
  const [visibleRef, visible] = useSocialVisibility();
  return (
    <article
      className="social-video-card"
      ref={(node) => {
        nearRef.current = node;
        visibleRef.current = node;
      }}
    >
      <div className="social-video-frame">
        {video.playable && consent && near && pageVisible ? (
          <TikTokPlayer
            key={video.id}
            video={video}
            visible={visible}
            audioEnabled={audioEnabled}
            onAudioToggle={onAudioToggle}
            onActivate={onActivate}
            onSuspend={onSuspend}
            register={register}
          />
        ) : (
          <>
            {video.thumbnail && (
              <img
                className="social-video-poster"
                src={video.thumbnail}
                alt=""
                loading="lazy"
                width="360"
                height="640"
              />
            )}
            <div className="social-video-shade" />
            <span className="social-card-label">
              {video.playable
                ? "TIKTOK · VUESTRAS PARTIDAS"
                : "ENLACE AL ORIGINAL"}
            </span>
            <div className="social-video-message">
              <span className="social-play-symbol" aria-hidden="true">
                ▷
              </span>
              <p>
                {!video.playable
                  ? "Integración no disponible para esta referencia."
                  : consent
                    ? "Cargando reproductor…"
                    : "Contenido externo desactivado. Puedes cambiarlo en las preferencias de cookies del footer."}
              </p>
              {!video.playable && (
                <a href={video.url} target="_blank" rel="noopener noreferrer">
                  Ver original en TikTok ↗
                </a>
              )}
            </div>
          </>
        )}
      </div>
      <div className="social-video-caption">
        <h3>{video.creator || "Creador en TikTok"}</h3>
        <p>{video.description}</p>
        <a href={video.url} target="_blank" rel="noopener noreferrer">
          Publicación original ↗
        </a>
      </div>
    </article>
  );
}

export default function TikTokSection({ videos = tiktokVideos }) {
  const entries = useMemo(() => prepareVideos(videos), [videos]);
  const { externalAllowed: consent } = useCookieConsent();
  const [audioOwner, setAudioOwner] = useState(null);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const players = useRef(new Map());
  const register = useCallback((id, pause) => {
    players.current.set(id, pause);
    return () => players.current.delete(id);
  }, []);
  const activate = useCallback((id) => {
    players.current.forEach((pause, other) => {
      if (other !== id) pause();
    });
    setAudioOwner((current) => (current && current !== id ? null : current));
  }, []);
  const audioToggle = useCallback((id) => {
    players.current.forEach((pause) => pause());
    setAudioOwner((current) => (current === id ? null : id));
  }, []);
  const suspend = useCallback(
    (id) => setAudioOwner((current) => (current === id ? null : current)),
    [],
  );
  useEffect(() => {
    if (!consent) setAudioOwner(null);
  }, [consent]);
  useEffect(() => {
    const change = () => {
      setPageVisible(!document.hidden);
      if (document.hidden) setAudioOwner(null);
    };
    document.addEventListener("visibilitychange", change);
    return () => document.removeEventListener("visibilitychange", change);
  }, []);
  return (
    <section
      className="section social-section tiktok-section"
      id="videos"
      aria-labelledby="tiktok-heading"
    >
      <span className="eyebrow">EN PRIMERA PERSONA</span>
      <div className="section-heading">
        <h2 id="tiktok-heading">
          Míralo <em>en acción</em>
        </h2>
        <p>
          Descubre cómo se ve la experiencia retro en manos de quienes han
          probado estas consolas.
        </p>
      </div>
      {!entries.length && (
        <p className="social-demo-notice">
          VISTA DE DEMOSTRACIÓN · Aún no hemos añadido vídeos de creadores.
          Estas tarjetas no reproducen contenido.
        </p>
      )}
      <HorizontalCarousel label="Vídeos de TikTok" className="video-carousel">
        {entries.length
          ? entries.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                consent={consent}
                pageVisible={pageVisible}
                audioEnabled={audioOwner === video.id}
                onAudioToggle={audioToggle}
                onActivate={activate}
                onSuspend={suspend}
                register={register}
              />
            ))
          : demoVideos.map(([description, product, image], i) => (
              <article
                className="social-video-card"
                key={description}
                aria-label={`Tarjeta de demostración ${i + 1}, sin vídeo`}
              >
                <div
                  className={`social-video-frame social-video-demo demo-angle-${i}`}
                >
                  <img
                    className="social-video-poster"
                    src={image}
                    alt={`Referencia visual de ${product}, no es un vídeo`}
                    loading="lazy"
                    width="360"
                    height="640"
                  />
                  <div className="social-video-shade" />
                  <span className="social-card-label">DEMO · SIN VÍDEO</span>
                  <div className="social-video-message">
                    <span className="social-play-symbol" aria-hidden="true">
                      ▷
                    </span>
                    <span>PRÓXIMAMENTE</span>
                  </div>
                  <span className="social-video-product">{product}</span>
                </div>
                <div className="social-video-caption">
                  <h3>{description}</h3>
                  <p>Creador pendiente · Espacio de demostración</p>
                </div>
              </article>
            ))}
      </HorizontalCarousel>
    </section>
  );
}
