import { useState } from 'react';
import { Link } from 'react-router-dom';
import { r36sProduct } from '../data/r36sProduct.js';
import library from '../../config/r36s-library.json';
import { games as visualGames } from '../data/games.js';
import ReviewsSection from './ReviewsSection.jsx';
import './r36sProduct.css';

const icons = {
  screen: <><rect x="3" y="5" width="26" height="19" rx="3" /><path d="M11 28h10M16 24v4" /></>,
  storage: <><path d="M9 3h12l5 5v21H6V6a3 3 0 0 1 3-3ZM11 3v8h10V3M11 24h10" /></>,
  play: <><circle cx="16" cy="16" r="12" /><path d="m13 10 9 6-9 6Z" /></>,
  save: <><path d="M5 4h18l5 5v19H4V5ZM10 4v8h12V4M10 28V18h12v10" /></>,
  system: <><rect x="4" y="4" width="24" height="24" rx="4" /><path d="m10 12 4 4-4 4M18 20h5" /></>,
  controls: <><rect x="3" y="8" width="26" height="17" rx="6" /><path d="M8 16h8M12 12v8M23 14h.1M21 19h.1" /></>,
};

function Controls({ product }) {
  const [active, setActive] = useState(r36sProduct.controls[0]);
  const photo = product.imageDetails?.find(i => i.source === 'morado');
  const button = (control, index, spatial) => <button type="button" key={control.id} className={spatial ? 'r36s-control-point' : 'r36s-control-option'} style={spatial ? { left: `${control.x}%`, top: `${control.y}%` } : undefined} aria-label={control.name} aria-pressed={active.id === control.id} aria-controls="r36s-control-explanation" onClick={() => setActive(control)}>{spatial ? index + 1 : <><span className="r36s-point-dot" aria-hidden="true" />{control.name}</>}</button>;
  return <section className="r36s-section" id="r36s-controls" aria-labelledby="r36s-controls-title"><span className="eyebrow">01 / CADA MOVIMIENTO</span><h2 id="r36s-controls-title">Conoce tu R36S.</h2><p>Los puntos señalan controles identificables en la fotografía local. Pulsa un punto o un nombre para consultar su función.</p><div className="r36s-controls-layout"><div className="r36s-control-photo">{photo && <img src={photo.src} srcSet={[...photo.variants, photo].map(i => `${i.src} ${i.width}w`).join(', ')} sizes="(max-width: 760px) 90vw, 48vw" alt="R36S morada transparente, vista frontal y posterior de referencia" width={photo.width} height={photo.height} loading="lazy" decoding="async" />}{photo && r36sProduct.controls.filter(c => c.x !== undefined).map((control, i) => button(control, i, true))}</div><div><div className="r36s-control-names" aria-label="Controles de R36S">{r36sProduct.controls.filter(c => c.x !== undefined).map((control, i) => button(control, i, false))}</div><div className="r36s-control-explanation" id="r36s-control-explanation" aria-live="polite"><h3>{active.name}</h3><p>{active.text}</p></div><p className="r36s-small-note">Estos controles tienen su ubicación pendiente de confirmar. No se señalan posiciones ni combinaciones sin una referencia inequívoca.</p><div className="r36s-control-names r36s-controls-pending">{r36sProduct.controls.filter(c => c.x === undefined).map((control, i) => button(control, i, false))}</div></div></div></section>;
}

export default function R36SProductDetails({ product, priceLabel }) {
  const systems = library.systems.filter(s => s.compatibilityVerified === true);
  const includedGames = library.games.filter(g => g.includedVerified === true && g.rightsVerified === true);
  const connections = library.connections.filter(c => c.verified === true);
  return <div className="r36s-details">
    <nav className="r36s-section-nav" aria-label="Apartados de R36S"><a href="#r36s-features">Características</a><a href="#r36s-controls">Controles</a><a href="#r36s-games">Experiencia retro</a><a href="#r36s-specs">Especificaciones</a><a href="#r36s-guide">Guía ArkOS</a><a href="#resenas">Reseñas</a><a href="#r36s-faq">Preguntas frecuentes</a></nav>
    <section className="r36s-section" id="r36s-features" aria-labelledby="r36s-features-title"><span className="eyebrow">R36S / TU PRÓXIMA PARTIDA</span><h2 id="r36s-features-title">El retro, siempre contigo.</h2><p>Características anunciadas de la referencia protagonista 128GB-ARKOS, pendientes de comprobación física por PondNest.</p><div className="r36s-feature-grid">{r36sProduct.highlights.map(feature => <article className="r36s-feature" key={feature.title}><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[feature.icon]}</svg><h3>{feature.title}</h3><p>{feature.text}</p></article>)}</div></section>
    <Controls product={product} />
    <section className="r36s-section" id="r36s-games" aria-labelledby="r36s-games-title"><span className="eyebrow">02 / VUELVE A JUGAR</span><h2 id="r36s-games-title">Pequeñas partidas. Grandes recuerdos.</h2><p>Descubre la experiencia retro. Estas portadas son referencias visuales: no confirman juegos preinstalados, emuladores ni rendimiento en esta consola.</p><div className="r36s-game-grid">{visualGames.filter(g => g.cover).slice(0, 4).map(game => <figure key={game.name}><img src={game.optimizedCover || game.cover} alt={`Portada de referencia de ${game.name}`} width="236" height="236" loading="lazy" decoding="async" /><figcaption><strong>{game.name}</strong><span>{game.genre} · Referencia visual</span></figcaption></figure>)}</div><div className="r36s-library-status"><h3>Juegos y sistemas de esta referencia</h3>{systems.length ? <><p>Sistemas con compatibilidad verificada:</p><ul>{systems.map(s => <li key={s.id || s.name}>{s.name}</li>)}</ul></> : <p>Lista real de sistemas y compatibilidad pendiente de verificación.</p>}{includedGames.length ? <><p>Juegos cuya inclusión y derechos se han verificado:</p><ul>{includedGames.map(g => <li key={g.id || g.name}>{g.name}</li>)}</ul></> : <p>Contenido de la tarjeta y derechos de distribución pendientes de verificar.</p>}</div></section>
    <section className="r36s-section" id="r36s-specs" aria-labelledby="r36s-specs-title"><span className="eyebrow">03 / LOS DATOS CLAROS</span><h2 id="r36s-specs-title">Especificaciones técnicas</h2><details className="r36s-specifications"><summary>Consultar especificaciones y su estado <span aria-hidden="true">+</span></summary><div><p>La identificación del catálogo distingue la referencia elegida; no supone una prueba física. Los datos anunciados están pendientes de comprobación por PondNest.</p><dl>{r36sProduct.specifications.map(([name, value, status]) => <div key={name}><dt>{name}</dt><dd>{value}<small>{status}</small></dd></div>)}</dl>{connections.length > 0 && <><h3>Conexiones comprobadas</h3><ul>{connections.map(c => <li key={c.id || c.name}>{c.name}</li>)}</ul></>}<p>CPU, memoria RAM, batería, resolución, conexiones, peso, embalaje y contenido de la caja pendientes de confirmar.</p></div></details></section>
    <section className="r36s-guide" id="r36s-guide" aria-labelledby="r36s-guide-title"><div><span className="eyebrow">04 / A TU MANERA</span><h2 id="r36s-guide-title">Configura tu R36S</h2><p>Aprende a ajustar el sonido, la pantalla, los controles y tus partidas.</p><p className="r36s-small-note">Guía orientativa. La versión exacta de ArkOS y los atajos de esta referencia están pendientes de confirmar.</p></div><Link className="button secondary" to="/guia-configuracion">Abrir guía ArkOS →</Link></section>
    <div className="r36s-reviews"><ReviewsSection /></div>
    <section className="r36s-section" id="r36s-faq" aria-labelledby="r36s-faq-title"><span className="eyebrow">05 / ANTES DE TU PARTIDA</span><h2 id="r36s-faq-title">Preguntas frecuentes</h2><div className="r36s-faq-list">{r36sProduct.faqs.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
    <aside className="r36s-purchase-bar" aria-label="Comprar R36S"><div><strong>R36S Retro</strong><span>{priceLabel}</span></div><a className="button primary" href="#r36s-purchase">Elegir variante y comprar ↑</a></aside>
  </div>;
}
