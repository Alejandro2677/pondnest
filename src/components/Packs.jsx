import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../Store.jsx';
import { packs, packOptions, defaultPackVariant, packProductName } from '../services/packs.js';
import { productImages } from '../data/productImages.js';
import { variantGallery } from '../data/productVariants.js';
import { money } from '../services/commerce.js';
import './packs.css';
const priceLabel = (pack, remote) => money(remote?.price);

function PackConfiguration({ pack, close, trigger }) {
  const dialog = useRef(null);
  useEffect(() => {
    const previous = trigger.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current.showModal();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  const { products, packCatalog, packError, addPack, busy, cartReady } = useStore();
  const remote = packCatalog.find(p => p.id === pack.id);
  const combinations = remote?.variants || [];
  const optionsFor = handle => remote?.options?.[handle] || packOptions(products.find(p => p.handle === handle));
  const [selection, setSelection] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const initial = combinations.find(v => pack.handles.every(handle => v.selection[handle] === defaultPackVariant(products.find(p => p.handle === handle))?.id)) || combinations[0];
  const selectedCombination = combinations.find(v => pack.handles.every(handle => v.selection[handle] === (selection[handle] || initial?.selection[handle])));
  const chosen = Object.fromEntries(pack.handles.map(handle => {
    const product = products.find(p => p.handle === handle);
    return [handle, optionsFor(handle).find(v => v.id === selectedCombination?.selection[handle])];
  }));
  const ready = selectedCombination && pack.handles.every(handle => chosen[handle]);
  const candidates = (handle, id) => combinations.filter(v => v.selection[handle] === id && pack.handles.every(h => {
    if (h === handle) return true;
    if (remote?.linkedColors.includes(handle) && remote.linkedColors.includes(h)) {
      return h !== 'r36h' || optionsFor(h).find(option => option.id === v.selection[h])?.capacity === chosen[h]?.capacity;
    }
    return v.selection[h] === chosen[h]?.id;
  }));
  const change = (handle, id) => { const next = candidates(handle, id)[0]; if (next) setSelection(next.selection); setMessage(''); };
  async function add() {
    setMessage('');
    if (await addPack(pack.id, Object.fromEntries(pack.handles.map(handle => [handle, chosen[handle]?.id])))) navigate('/carrito');
    else setMessage('No se ha podido añadir. Revisa la disponibilidad de las variantes y el carrito.');
  }
  return <dialog ref={dialog} className="pack-panel" aria-labelledby="pack-panel-title" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget && event.clientX < event.currentTarget.getBoundingClientRect().left) close(); }}>
    <div className="pack-panel-heading"><span className="eyebrow">CONFIGURA TU PACK</span><button className="pack-close" onClick={close} aria-label="Cerrar configurador">×</button></div>
    <span className="pack-badge">{pack.featured ? 'NUESTRA SELECCIÓN' : 'LISTO PARA TU PRÓXIMA PARTIDA'}</span>
    <h2 id="pack-panel-title">{pack.name}</h2>
    {pack.featured && <p className="pack-highlight">Los dos accesorios por 5 € más que el Esencial.</p>}
    <div className="pack-photos">{pack.handles.map(handle => {
      const product = products.find(p => p.handle === handle);
      const photo = chosen[handle]?.image || (product && variantGallery(productImages(product), chosen[handle]).image);
      return <figure key={handle}>{photo && <img src={photo} alt={packProductName(handle)} loading="lazy" width="220" height="180" />}</figure>;
    })}</div>
    <ul className="pack-contents">{pack.handles.map(handle => <li key={handle}><span>1 ×</span> {packProductName(handle)}</li>)}</ul>
    <div className="pack-selectors">{pack.handles.filter(h => h !== 'estuche-transporte').map(handle => {
      const product = products.find(p => p.handle === handle);
      const options = optionsFor(handle).filter(v => combinations.some(c => c.selection[handle] === v.id));
      const selected = chosen[handle];
      const id = `${pack.id}-${handle}`;
      if (handle === 'r36h' && selected) {
        const colors = ['Negro transparente', 'Blanco', 'Morado transparente'];
        const capacities = ['64 GB', '128 GB'];
        return <fieldset key={handle}><legend>R36H Air</legend><div className="pack-option-pair">
          <label htmlFor={`${id}-color`}>Color<select id={`${id}-color`} value={selected.color} onChange={e => change(handle, options.find(v => v.color === e.target.value && v.capacity === selected.capacity)?.id)}>{colors.map(color => <option key={color} value={color} disabled={!options.some(v => v.color === color && v.capacity === selected.capacity && candidates(handle,v.id).length)}>{color}</option>)}</select></label>
          <label htmlFor={`${id}-capacity`}>Capacidad<select id={`${id}-capacity`} value={selected.capacity} onChange={e => change(handle, options.find(v => v.capacity === e.target.value && v.color === selected.color)?.id)}>{capacities.map(capacity => <option key={capacity} value={capacity} disabled={!options.some(v => v.capacity === capacity && v.color === selected.color && candidates(handle,v.id).length)}>{capacity}</option>)}</select></label>
        </div></fieldset>;
      }
      return <label key={handle} htmlFor={id}>{packProductName(handle)}<select id={id} value={selected?.id || ''} disabled={!options.length} onChange={e => change(handle, e.target.value)}>{!options.length && <option value="">Sin variantes disponibles</option>}{options.map(v => <option key={v.id} value={v.id} disabled={!candidates(handle,v.id).length}>{v.name}</option>)}</select></label>;
    })}</div>
    {chosen.r36s && !chosen.r36s.capacity && <p className="pack-fineprint">R36S: capacidad de 128 GB y ArkOS pendientes de confirmar para esta referencia.</p>}
    {remote?.linkedColors.length > 0 && <p className="pack-fineprint">Shopify vincula el color de la R36H Air y la funda: al cambiar uno, se actualizan ambos.</p>}
    {remote?.componentNote && <p className="pack-fineprint">{remote.componentNote}</p>}
    {!ready && <p className="pack-fineprint" role="status">{packError || remote?.issue || 'Faltan variantes verificadas en Shopify para completar este pack.'}</p>}
    {<div className="pack-detail-copy"><p>Los componentes se mantienen juntos. Puedes cambiar la cantidad del pack o eliminarlo completo desde el carrito.</p><p>La compatibilidad de la funda con la R36S y el contenido final se confirmarán antes de abrir la venta. La funda no se presenta como compatible con la R36H Air.</p></div>}
    <section className="pack-review" aria-label="Resumen de tu configuración"><h3>Tu configuración</h3><ul>{pack.handles.map(handle => <li key={handle}><strong>{packProductName(handle)}</strong><span>1 × {chosen[handle]?.name || 'Sin variante disponible'}</span></li>)}</ul></section>
    <div className="pack-purchase"><p className="pack-price">{money(selectedCombination?.price || remote?.price)}<small>Precio consultado en Shopify · Envío pendiente</small></p>
      {!remote?.checkoutEnabled && <p className="pack-fineprint">Demostración con carrito real de Shopify. Pago bloqueado hasta verificar el checkout y AutoDS.</p>}
      <button className="button primary full" disabled={!ready || !cartReady || busy} onClick={add}>{busy ? 'Añadiendo…' : 'Añadir pack al carrito'}</button>
      {message && <p role="alert">{message}</p>}
    </div>
  </dialog>;
}
const descriptions = {
  esencial: 'Tu consola y un lugar donde llevarla. Así de sencillo.',
  'proteccion-total': 'Protección para jugar en casa y llevarla contigo.',
  'coleccion-completa': 'Dos formas de jugar, con los accesorios para tu R36S.',
};
function PackCard({ pack, detail = false }) {
  const { products, packCatalog } = useStore();
  const remote = packCatalog.find(p => p.id === pack.id);
  const [open, setOpen] = useState(false);
  const trigger = useRef(null);
  return <><article className={`pack-card ${pack.featured ? 'pack-featured' : ''}`}>
    <span className="pack-badge">{pack.featured ? 'OPCIÓN RECOMENDADA' : 'PONDNEST / PACKS'}</span>
    <div className="pack-photos">{pack.handles.map(handle => {
      const product = products.find(p => p.handle === handle);
      const photo = remote?.options?.[handle]?.find(v => v.image)?.image || (product && variantGallery(productImages(product), defaultPackVariant(product)).image);
      return <figure key={handle}>{photo && <img src={photo} alt={packProductName(handle)} loading="lazy" width="220" height="180" />}</figure>;
    })}</div>
    <h3>{pack.name}</h3><p className="pack-description">{descriptions[pack.id]}</p>
    <ul className="pack-contents">{pack.handles.map(handle => <li key={handle}><span>1 ×</span> {packProductName(handle)}</li>)}</ul>
    <div className="pack-purchase"><p className="pack-price">{priceLabel(pack, remote)}</p><button ref={trigger} className="button primary full" onClick={() => setOpen(true)}>Elegir pack</button>
    {!detail && <Link className="pack-details" to={`/packs/${pack.id}`}>Ver detalles ↗</Link>}</div>
  </article>{open && <PackConfiguration trigger={trigger} pack={pack} close={() => setOpen(false)} />}</>;
}
export default function PacksSection({ page = false, headingLevel }) {
  const { loading, catalogError, packError, packCatalog, loadProducts } = useStore();
  const Heading = headingLevel === 2 ? 'h2' : page ? 'h1' : 'h2';
  return <section className={`section packs-section ${page ? 'page' : ''}`} id="packs" aria-labelledby="packs-title">
    <span className="eyebrow">PONDNEST / MEJOR JUNTOS</span><Heading id="packs-title">Elige tu pack PondNest</Heading>
    <p className="packs-intro">Todo lo que necesitas para disfrutar de tus consolas retro.</p>
    <p className="packs-disclaimer">{packCatalog.length > 0 && packCatalog.every(p => p.checkoutEnabled) ? 'Precios y disponibilidad consultados en Shopify. Envío e impuestos finales según destino.' : 'Modo demostración con precios de Shopify. Sin pagos hasta verificar el checkout y la gestión de componentes en AutoDS. Envío y compatibilidad de accesorios pendientes de confirmar.'}</p>
    {packError && <p role="alert">No se han podido verificar los packs: {packError}</p>}
    {loading ? <p role="status">Consultando variantes del catálogo…</p> : catalogError ? <div role="alert"><p>{catalogError}</p><button className="button" onClick={loadProducts}>Volver a consultar</button></div> : <div className="packs-grid">{packs.map(pack => <PackCard pack={pack} key={pack.id} />)}</div>}
  </section>;
}
export function PackDetail() {
  const { packId } = useParams();
  const pack = packs.find(p => p.id === packId);
  return <section className="section page pack-detail"><Link to="/packs">← Todos los packs</Link><h1>{pack?.name || 'Pack no encontrado'}</h1>{pack && <PackCard pack={pack} detail />}</section>;
}
export function PackSuggestion({ handle }) {
  const { packCatalog } = useStore();
  return <section className="pack-suggestion" aria-labelledby="pack-suggestion-title"><div><span className="eyebrow">COMPLETA TU EQUIPO</span><h2 id="pack-suggestion-title">También en un pack PondNest</h2><p>Combina tu selección. Packs en prueba, sin pagos.</p></div><div className="pack-suggestion-links">{packs.filter(p => p.handles.includes(handle)).map(p => <Link key={p.id} to={`/packs/${p.id}`}><span>{p.name}</span><strong>{priceLabel(p, packCatalog.find(remote => remote.id === p.id))} ↗</strong></Link>)}</div></section>;
}
