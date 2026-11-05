import { Link } from 'react-router-dom';
import { bagProduct } from '../data/bagProduct.js';
import { productImages } from '../data/productImages.js';
import './bagProduct.css';

const icons = {
  shield: <><path d="m16 3 11 4v8c0 7-11 14-11 14S5 22 5 15V7Z" /><path d="m11 16 3 3 7-7" /></>,
  pocket: <><rect x="4" y="5" width="24" height="23" rx="4" /><path d="M4 12h24M10 12v16M16 12v16M22 12v16M4 18h24M4 23h24" /></>,
  strap: <><rect x="4" y="5" width="24" height="23" rx="4" /><path d="M5 13h22v7H5M12 16.5h8" /></>,
  carry: <><rect x="4" y="10" width="24" height="18" rx="5" /><path d="M11 10V7a5 5 0 0 1 10 0v3M4 16h24M24 16v5" /></>,
};

function SpecificationList({ entries }) {
  return <dl className="bag-spec-list">{entries.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}

export default function BagProductDetails() {
  return <div className="bag-details">
    <section className="bag-section" aria-labelledby="bag-features-title"><span className="eyebrow">CONTIGO / ENTRE PARTIDAS</span><h2 id="bag-features-title">Cada cosa, en su sitio.</h2><p className="bag-intro">Características anunciadas por el proveedor, pendientes de comprobación por PondNest.</p><div className="bag-feature-grid">{bagProduct.highlights.map(feature => <article className="bag-feature" key={feature.title}><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[feature.icon]}</svg><h3>{feature.title}</h3><p>{feature.text}</p></article>)}</div></section>
    <section className="bag-section bag-information" aria-label="Compatibilidad y especificaciones del estuche">
      <article className="bag-compatibility"><span className="eyebrow">ANTES DE ELEGIR</span><h2>Compatibilidad anunciada</h2><p>El proveedor anuncia compatibilidad con estos modelos:</p><ul>{bagProduct.announcedCompatibility.map(model => <li key={model}>{model}</li>)}</ul><p className="bag-fit-note">Ajuste pendiente de comprobación por PondNest. La compatibilidad anunciada no equivale a una prueba de ajuste.</p><p>La compatibilidad con R36H Air no está verificada: es necesario comprobar sus dimensiones y ajuste.</p></article>
      <div><details className="bag-specifications"><summary>Especificaciones técnicas <span aria-hidden="true">+</span></summary><div className="bag-spec-content"><p>Datos anunciados por el proveedor, pendientes de verificación.</p><SpecificationList entries={bagProduct.specifications} /><h3>Información logística</h3><SpecificationList entries={bagProduct.logistics} /><p className="bag-spec-footnote">El peso bruto corresponde al paquete, no al estuche por separado.</p></div></details><p className="bag-contents">{bagProduct.contents}</p></div>
    </section>
  </div>;
}

export function BagRecommendation({ product }) {
  if (!product) return null;
  const image = productImages(product).imageDetails?.find(i => i.source === 'cajat');
  return <section className="bag-recommendation" aria-labelledby="bag-recommendation-title">
    {image && <Link className="bag-recommendation-photo" to="/productos/estuche-transporte" tabIndex={-1} aria-hidden="true"><img src={image.src} srcSet={[...image.variants, image].map(i => `${i.src} ${i.width}w`).join(', ')} sizes="(max-width: 760px) 85vw, 280px" width={image.width} height={image.height} alt="" loading="lazy" decoding="async" /></Link>}
    <div><span className="eyebrow">COMPLETA TU EQUIPO</span><h2 id="bag-recommendation-title">{bagProduct.title}</h2><p>Carcasa de EVA, bolsillo de malla y banda elástica para organizar el transporte.</p><p className="bag-fit-note">Compatibilidad con R36S anunciada por el proveedor. Ajuste pendiente de comprobar por PondNest.</p><p className="bag-recommendation-note">Precio y disponibilidad pendientes de configurar. Se incluye únicamente el estuche.</p><Link className="button secondary" to="/productos/estuche-transporte">Ver estuche →</Link></div>
  </section>;
}
