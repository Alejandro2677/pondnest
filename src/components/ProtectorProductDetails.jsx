import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { protectorProduct, canAddProtectorTogether } from '../data/protectorProduct.js';
import { productImages } from '../data/productImages.js';
import { getProductVariants, selectedProductVariant } from '../data/productVariants.js';
import { useStore } from '../Store.jsx';
import { money } from '../services/commerce.js';
import './protectorProduct.css';

const icons = {
  shield: <><path d="m16 3 11 4v8c0 7-11 14-11 14S5 22 5 15V7Z" /><path d="m11 16 3 3 7-7" /></>,
  fit: <><rect x="7" y="3" width="18" height="26" rx="4" /><path d="M11 8h10v8H11ZM10 22h6M13 19v6M21 21h.1M21 25h.1" /></>,
  vent: <><rect x="5" y="4" width="22" height="24" rx="5" /><path d="M10 10h12M10 16h12M10 22h12" /></>,
  flex: <><path d="M8 24c0-9 16-7 16-16M4 21l4 4 4-4M20 11l4-4 4 4M6 9a5 5 0 0 1 5-5M26 23a5 5 0 0 1-5 5" /></>,
};

export default function ProtectorProductDetails({ priceLabel }) {
  const shipping = protectorProduct.shipping;
  return <div className="protector-details">
    <section className="protector-section" aria-labelledby="protector-features-title"><span className="eyebrow">PARA TU R36S / CADA DÍA</span><h2 id="protector-features-title">Protección que se adapta.</h2><p className="protector-intro">Características descritas por el proveedor, pendientes de comprobación por PondNest.</p><div className="protector-feature-grid">{protectorProduct.highlights.map(feature => <article className="protector-feature" key={feature.title}><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[feature.icon]}</svg><h3>{feature.title}</h3><p>{feature.text}</p></article>)}</div></section>
    <section className="protector-section protector-info" aria-label="Compatibilidad y detalles de la funda"><article className="protector-compatibility"><span className="eyebrow">EL AJUSTE IMPORTA</span><h2>Compatible con R36S.</h2><p>Compatibilidad anunciada por el proveedor para R36S. El ajuste físico a la variante concreta está pendiente de comprobar por PondNest.</p><p>La compatibilidad con R36H Air u otras consolas no está verificada; requiere comprobar dimensiones y disposición de botones.</p><div className="protector-package"><h3>Contenido del paquete</h3><p>1 funda protectora de silicona.</p><p className="protector-contents">{protectorProduct.contents}</p></div></article><div><details className="protector-specifications"><summary>Especificaciones técnicas <span aria-hidden="true">+</span></summary><div className="protector-spec-content"><p>Datos facilitados por el proveedor, pendientes de verificación.</p><dl>{protectorProduct.specifications.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div></details>{shipping?.summary && <article className="protector-shipping"><h3>Información de envío</h3><p>{shipping.summary}</p>{shipping.details && <p>{shipping.details}</p>}<Link to="/envios">Consultar los envíos →</Link></article>}</div></section>
    <aside className="protector-purchase-bar" aria-label="Comprar funda protectora"><div><strong>Funda para R36S</strong><span>{priceLabel}</span></div><a className="button primary" href="#protector-purchase">Elegir color y comprar ↑</a></aside>
  </div>;
}

// Uses the existing cart API only. A joint purchase remains unavailable until both
// real variants have prices, stock and an explicit Shopify mapping for the protector.
export function ProtectorRecommendation({ product, consoleProduct, consoleVariant }) {
  const { demo, add, busy, cartReady } = useStore();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  if (!product) return null;
  const reference = selectedProductVariant(getProductVariants(product, demo ? 'demo' : 'live'));
  const color = reference?.color || 'Negro';
  const photo = productImages(product).imageDetails?.find(i => i.source === (reference?.primaryImage || 'negro'));
  const realVariant = product.variants.find(v => v.id === reference?.shopifyVariantId);
  const ready = canAddProtectorTogether({ demo, consoleProduct, consoleVariant, product, protectorVariant: realVariant, reference });
  async function addTogether() {
    if (!ready || busy || !cartReady) return;
    setMessage('');
    if (!await add(consoleProduct, consoleVariant, 1)) { setMessage('No se pudo añadir la consola. Revisa el carrito antes de continuar.'); return; }
    if (!await add(product, realVariant, 1)) { setMessage('La consola se añadió, pero no se pudo añadir la funda. Revisa el carrito antes de repetir la compra conjunta.'); return; }
    navigate('/carrito');
  }
  return <section className="protector-recommendation" aria-labelledby="protector-recommendation-title">
    {photo && <img src={photo.variants[0]?.src || photo.src} width={photo.width} height={photo.height} alt={`Funda protectora de silicona ${color.toLowerCase()} para R36S`} loading="lazy" decoding="async" />}
    <div><span className="eyebrow">COMPLETA TU EQUIPO</span><h2 id="protector-recommendation-title">{protectorProduct.title}</h2><p>Silicona flexible con aberturas para controles, conexiones y ventilación. Compatibilidad anunciada para R36S; ajuste pendiente de comprobar.</p><p className="protector-contents">{protectorProduct.contents}</p><Link className="button secondary" to="/productos/funda-silicona">Ver colores y detalles →</Link>{ready ? <><p>Compra conjunta: consola y funda en color {color.toLowerCase()}, una unidad de cada producto, a sus precios individuales.</p><p>Consola: {money(consoleVariant.price)} · Funda: {money(realVariant.price)}</p><button type="button" className="button primary" onClick={addTogether} disabled={busy || !cartReady || Boolean(message)}>Añadir consola y funda</button></> : <p className="protector-joint-pending">Compra conjunta pendiente de configurar precios y disponibilidad.</p>}{message && <p role="alert">{message}</p>}</div>
  </section>;
}
