import { useEffect, useState } from "react";
import { guideDevice, guideTopics, hotkeySource, searchGuide, videoReference } from "../data/setupGuide.js";
import { useCookieConsent } from "./CookieConsent.jsx";
import useSocialVisibility from "./useSocialVisibility.js";
import "./setupGuide.css";

function ReferenceVideo() {
  const { externalAllowed, openPreferences } = useCookieConsent();
  const [ref, near] = useSocialVisibility({ once: true, threshold: 0, rootMargin: "300px" });
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [externalAllowed]);
  return <section className="guide-reference" ref={ref} aria-labelledby="guide-video-title">
    <div><span className="eyebrow">REFERENCIA EN VÍDEO</span><h2 id="guide-video-title">ArkOS, en contexto.</h2>
      <p>Vídeo de {videoReference.creator} sobre la <strong>R36S</strong>. Es el modelo de referencia actual, pero todavía no hemos identificado la versión de ArkOS del proveedor. Sus atajos y procedimientos de firmware no se dan por compatibles con la unidad de 128 GB sin comprobar esa versión.</p>
      <a href={videoReference.url} target="_blank" rel="noopener noreferrer">Ver publicación original en YouTube ↗</a>
    </div>
    <div className="guide-video">
      {externalAllowed && near && !failed ? <iframe title="Referencia de ArkOS en R36S · El Viciao Electrónico" src={`https://www.youtube-nocookie.com/embed/${videoReference.id}?autoplay=0&playsinline=1&rel=0`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen onError={() => setFailed(true)} /> : <div className="guide-video-placeholder">
        <span aria-hidden="true">▷</span>
        <p>{failed ? "El reproductor no está disponible. Puedes consultar la publicación original." : externalAllowed ? "El vídeo se cargará al acercarte." : "Para mostrar YouTube, permite contenido externo en tus preferencias."}</p>
        {!externalAllowed && <button onClick={openPreferences}>Preferencias de cookies</button>}
      </div>}
    </div>
    <p className="guide-video-help">Si YouTube impide la reproducción integrada, utiliza el enlace a la publicación original. Sin reproducción automática.</p>
  </section>;
}

export default function SetupGuide() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const results = searchGuide(query, category);
  const count = results.reduce((sum, t) => sum + t.tutorials.length, 0);
  return <div className="section page setup-guide">
    <header className="guide-heading"><span className="eyebrow">PONDNEST / GUÍA ARKOS</span>
      <h1>Domina tu <em>consola.</em></h1>
      <p>Aprende a configurar tu consola retro y disfruta de cada partida a tu manera.</p>
      <div className="guide-device"><span>R36S · 128 GB · Morada transparente</span><span>ArkOS confirmado</span></div>
    </header>
    <aside className="guide-compatibility" aria-label="Compatibilidad de la unidad"><strong>Antes de empezar</strong><p>El sistema operativo está confirmado por PondNest. La versión exacta de ArkOS y el mapa de botones del proveedor todavía no se han comprobado. Estos pasos se basan en documentación de ArkOS y RetroArch; su aplicación a esta unidad está pendiente de prueba. Si una opción no coincide, detente y consulta al proveedor.</p><p>Para validar los atajos necesitamos la versión o fecha que aparece en el menú y una foto del mapa de controles de tu unidad. No se indican combinaciones de reinicio ni instalación de firmware.</p></aside>
    <div className="guide-search"><label htmlFor="guide-search">¿Qué quieres aprender?</label><div><input id="guide-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Busca sonido, brillo, guardar partidas…" autoComplete="off" />{query && <button onClick={() => setQuery("")}>Limpiar búsqueda</button>}</div></div>
    <nav className="guide-categories" aria-label="Categorías de tutoriales">
      <button aria-pressed={category === "all"} onClick={() => setCategory("all")}>Todos los tutoriales</button>
      {guideTopics.map(t => <button key={t.id} aria-pressed={category === t.id} onClick={() => setCategory(t.id)}><span aria-hidden="true">{t.icon}</span>{t.title}</button>)}
    </nav>
    <p className="guide-result-count" role="status">{count} {count === 1 ? "tutorial encontrado" : "tutoriales encontrados"}</p>
    {!results.length && <div className="guide-empty"><h2>No encontramos ese tutorial.</h2><p>Prueba con «volumen», «idioma» o «RetroArch».</p><button onClick={() => { setQuery(""); setCategory("all"); }}>Ver todos los tutoriales</button></div>}
    <div className="guide-results">{results.map(topic => <section key={topic.id} aria-labelledby={`guide-${topic.id}`}><header className="guide-topic-heading"><span aria-hidden="true">{topic.icon}</span><div><h2 id={`guide-${topic.id}`}>{topic.title}</h2><p>{topic.description}</p></div></header>
      {topic.tutorials.map(item => <details className="guide-tutorial" key={item.title}><summary><span>{item.title}<small>Documentado · pendiente de prueba en R36S</small></span><span aria-hidden="true">+</span></summary><div className="guide-tutorial-body"><ol>{item.steps.map(step => <li key={step}>{step}</li>)}</ol><p className="guide-note">{item.note}</p><a href={item.source} target="_blank" rel="noopener noreferrer">Consultar fuente técnica ↗</a></div></details>)}
    </section>)}</div>
    <aside className="guide-hotkeys" aria-label="Estado de los atajos"><h2>Atajos: primero, tu versión.</h2><p>La variante ArkOS-R3XS documenta FN + X para el menú, FN + R1 para guardar y FN + L1 para cargar estados. Son referencias de una variante comunitaria de ArkOS, <strong>no combinaciones verificadas para la R36S</strong>. No las uses como instrucciones de tu unidad hasta confirmar su imagen y configuración.</p><a href={hotkeySource} target="_blank" rel="noopener noreferrer">Mapa de referencia ArkOS-R3XS ↗</a></aside>
    <ReferenceVideo />
    <p className="guide-updated">Documentación consultada: {guideDevice.checkedAt}. Versión de la unidad: pendiente de identificar. Sin cambios de firmware ni formateo.</p>
  </div>;
}
