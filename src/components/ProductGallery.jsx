import { useEffect, useRef, useState } from 'react';
import { responsiveImage } from '../data/productImages.js';
import './productGallery.css';

export default function ProductGallery({ product, demo }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const dialog = useRef(null), trigger = useRef(null), start = useRef(null);
  const images = product.gallery || [];
  const move = delta => { setZoom(false); setIndex(i => (i + delta + images.length) % images.length); };
  useEffect(() => { setIndex(0); setZoom(false); dialog.current?.close(); }, [product.handle]);
  const swipe = event => {
    if (start.current === null) return;
    const dx = event.changedTouches[0].clientX - start.current;
    start.current = null;
    if (Math.abs(dx) > 45 && !zoom && images.length > 1) move(dx < 0 ? 1 : -1);
  };
  const gestures = { onTouchStart: e => { start.current = e.touches.length === 1 ? e.touches[0].clientX : null; }, onTouchEnd: swipe, onTouchCancel: () => { start.current = null; } };
  const keys = e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); move(e.key === 'ArrowRight' ? 1 : -1); } };
  const arrows = images.length > 1 && <div className="gallery-controls"><button type="button" onClick={() => move(-1)} aria-label="Fotografía anterior">←</button><span aria-live="polite">{index + 1} / {images.length}</span><button type="button" onClick={() => move(1)} aria-label="Fotografía siguiente">→</button></div>;
  return <div className="gallery" onKeyDown={keys}>
    <button type="button" ref={trigger} className="gallery-main gallery-open" aria-label={`Ampliar imagen de ${product.name}`} onClick={() => { setZoom(false); dialog.current.showModal(); }} {...gestures}>
      {images[index] ? <img key={images[index]} src={images[index]} {...responsiveImage(product, index)} sizes="(max-width: 760px) 92vw, 48vw" alt={`${product.name}, vista ${index + 1}`} loading="eager" fetchPriority={index === 0 ? 'high' : 'auto'} decoding="async" width={product.imageDetails?.[index]?.width || 800} height={product.imageDetails?.[index]?.height || 800} /> : <span>Imagen pendiente</span>}
    </button>
    {arrows}
    <div className="thumbnails" aria-label="Fotografías del producto">{images.map((url, i) => <button type="button" key={url} onClick={() => { setIndex(i); setZoom(false); }} aria-label={`Ver imagen ${i + 1}`} aria-pressed={index === i}><img src={product.imageDetails?.[i]?.variants[0]?.src || url} alt="" width="80" height="80" loading="lazy" decoding="async" /></button>)}</div>
    {demo && !product.localImages && <p className="editorial-note">Referencia visual de demostración.</p>}
    <dialog ref={dialog} className="gallery-dialog" aria-label={`Galería ampliada de ${product.name}`} onClose={() => { setZoom(false); trigger.current?.focus(); }} onClick={e => { if (e.target === dialog.current) dialog.current.close(); }}>
      <div className="gallery-dialog-toolbar"><button type="button" autoFocus onClick={() => dialog.current.close()}>Cerrar ×</button><button type="button" onClick={() => setZoom(z => !z)} aria-pressed={zoom}>{zoom ? 'Reducir' : 'Zoom 2×'}</button></div>
      <div className={`gallery-zoom-area ${zoom ? 'is-zoomed' : ''}`} {...gestures}><img key={images[index]} src={images[index]} alt={`${product.name}, vista ${index + 1} ampliada`} width={product.imageDetails?.[index]?.width || 800} height={product.imageDetails?.[index]?.height || 800} /></div>
      {arrows}
    </dialog>
  </div>;
}
