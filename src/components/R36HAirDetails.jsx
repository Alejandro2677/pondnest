import { r36hAir } from '../data/r36hAir.js';
import './r36hAir.css';

const icons = {
  screen: <><rect x="3" y="4" width="26" height="19" rx="3" /><path d="M11 28h10M16 23v5" /></>,
  battery: <><rect x="3" y="8" width="24" height="16" rx="3" /><path d="M30 13v6M8 12v8M13 12v8M18 12v8" /></>,
  system: <><rect x="4" y="4" width="24" height="24" rx="4" /><path d="m10 12 4 4-4 4M18 20h5" /></>,
  cpu: <><rect x="8" y="8" width="16" height="16" rx="2" /><path d="M12 3v5M20 3v5M12 24v5M20 24v5M3 12h5M3 20h5M24 12h5M24 20h5" /></>,
  controls: <><rect x="3" y="8" width="26" height="17" rx="6" /><path d="M8 16h8M12 12v8M23 14h.1M21 19h.1" /></>,
  storage: <><path d="M9 3h12l5 5v21H6V6a3 3 0 0 1 3-3ZM11 3v8h10V3M11 24h10" /></>,
};

function Photo({ product, source, alt, className = '' }) {
  const image = product.imageDetails?.find(i => i.source === source);
  if (!image) return null;
  return <figure className={`air-photo ${className}`}><img src={image.src} srcSet={[...image.variants, image].map(i => `${i.src} ${i.width}w`).join(', ')} sizes="(max-width: 760px) 90vw, 45vw" alt={alt} width={image.width} height={image.height} loading="lazy" decoding="async" /><figcaption>Fotografía de referencia del proveedor. Detalles pendientes de comprobación por PondNest.</figcaption></figure>;
}

function Specs({ entries }) {
  return <dl className="air-spec-list">{entries.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>;
}

export default function R36HAirDetails({ product }) {
  return <div className="air-details">
    <nav className="air-section-nav" aria-label="Apartados de R36H Air">
      <a href="#air-features">Características</a><a href="#air-controls">Controles</a><a href="#air-battery">Batería</a><a href="#air-connections">Conexiones</a><a href="#air-specs">Especificaciones</a><a href="#air-faq">Preguntas frecuentes</a>
    </nav>
    <section id="air-features" className="air-section" aria-labelledby="air-features-title">
      <span className="eyebrow">R36H AIR / LO ESENCIAL</span>
      <h2 id="air-features-title">El retro, en tus manos.</h2>
      <p className="air-intro">Características anunciadas por el proveedor. Pendientes de verificación por PondNest.</p>
      <div className="air-feature-grid">{r36hAir.highlights.map(feature => <article className="air-card" key={feature.title}><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[feature.icon]}</svg><h3>{feature.title}</h3><strong>{feature.value}</strong><p>{feature.text}</p></article>)}</div>
    </section>
    <section id="air-controls" className="air-section" aria-labelledby="air-controls-title">
      <span className="eyebrow">01 / A LOS MANDOS</span><h2 id="air-controls-title">Conoce cada botón</h2>
      <p className="air-intro">Pulsa cada tarjeta para consultar el control. La fotografía muestra el frontal; las ubicaciones que no se distinguen y las combinaciones de botones quedan pendientes de comprobar.</p>
      <div className="air-controls-layout"><Photo product={product} source="morado36h" alt="Vista frontal en perspectiva de la R36H Air morada transparente, con cruceta, botones y sticks" /><div className="air-control-cards">{r36hAir.controls.map(([name, text], i) => <details key={name}><summary><span className="air-control-number">{String(i + 1).padStart(2, '0')}</span>{name}<span className="air-expand" aria-hidden="true">+</span></summary><p>{text}</p></details>)}</div></div>
    </section>
    <section id="air-battery" className="air-section air-battery" aria-labelledby="air-battery-title"><div><span className="eyebrow">02 / SIGUE LA PARTIDA</span><h2 id="air-battery-title">3000 mAh de batería</h2><p className="air-intro">Capacidad anunciada por el proveedor.</p><p className="air-battery-claim">Hasta 8 horas según el fabricante. La duración real depende del uso.</p><p>Esta autonomía no ha sido comprobada por PondNest.</p><div className="air-charge-note"><h3>Carga por USB-C</h3><p>Puerto de carga USB-C indicado en las referencias. Potencia de carga, requisitos del cargador y compatibilidad con carga rápida pendientes de confirmar.</p></div></div><Photo product={product} source="blanco36h" alt="R36H Air blanca, fotografía de referencia del proveedor" /></section>
    <section id="air-connections" className="air-section" aria-labelledby="air-connections-title"><span className="eyebrow">03 / CADA CONEXIÓN</span><h2 id="air-connections-title">Sistema, juegos y accesorios.</h2><p className="air-intro">Identificaciones facilitadas a partir de las referencias del proveedor. Distribución física y funcionamiento pendientes de comprobación.</p><div className="air-connection-grid">{r36hAir.connections.map(([label, title, text]) => <article className="air-card" key={label}><span className="air-port-label">{label}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section id="air-specs" className="air-section" aria-labelledby="air-specs-title"><span className="eyebrow">04 / AL DETALLE</span><h2 id="air-specs-title">Especificaciones técnicas</h2><p className="air-intro">Datos anunciados por el proveedor, pendientes de verificación. Modelo exacto de CPU, memoria RAM y potencia gráfica sin confirmar.</p><div className="air-spec-columns"><article className="air-spec-panel"><h3>Producto</h3><Specs entries={r36hAir.specifications} /></article><article className="air-spec-panel"><h3>Embalaje y logística</h3><p>El peso y las medidas corresponden al paquete, no a la consola.</p><Specs entries={r36hAir.logistics} /></article></div></section>
    <section id="air-faq" className="air-section" aria-labelledby="air-faq-title"><span className="eyebrow">05 / ANTES DE ELEGIR</span><h2 id="air-faq-title">Preguntas frecuentes</h2><div className="air-faq">{r36hAir.faqs.map(([question, answer]) => <details key={question}><summary>{question}<span className="air-expand" aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
    <aside className="air-purchase-bar" aria-label="Elegir R36H Air"><div><strong>R36H Air</strong><span>Precio pendiente de configurar</span></div><a className="button primary" href="#air-purchase">Elegir opciones ↑</a></aside>
  </div>;
}
