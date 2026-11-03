import { mainProduct } from "../data/mainProduct.js";
import "./supplierRating.css";

export default function SupplierRating() {
  const rating = mainProduct.supplierRating;
  return <div className="supplier-rating" aria-label="Valoración del proveedor para R36S">
    <div className="supplier-rating-score"><strong>{rating.value.toLocaleString("es-ES")}<small>/5</small></strong>
      <span className="supplier-rating-stars" role="img" aria-label={`${rating.value.toLocaleString("es-ES")} de 5 estrellas`}>
        {[0, 1, 2, 3, 4].map(i => <span key={i} aria-hidden="true"><span>☆</span><span className="supplier-rating-fill" style={{ width: `${Math.round(Math.max(0, Math.min(1, rating.value - i)) * 100)}%` }}>★</span></span>)}
      </span>
    </div>
    <p><b>{rating.count} valoraciones</b><span>{rating.label}</span></p>
    <small>Resumen del anuncio de la R36S, consultado el 03/11/2026. No son valoraciones de clientes de PondNest ni una media de las opiniones seleccionadas. <a href={mainProduct.supplierUrl} target="_blank" rel="noopener noreferrer">Ver anuncio del proveedor ↗</a></small>
  </div>;
}
