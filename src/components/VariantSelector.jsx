import { optionVariant, variantImage } from '../data/productVariants.js';
import './variantSelector.css';

export default function VariantSelector({ product, config, selected, onChange }) {
  if (!selected || config.variants.length <= 1) return null;
  const references = config.dimensions.includes('reference');
  const colors = [...new Set(config.variants.map(v => v.color))];
  const capacities = [...new Set(config.variants.map(v => v.capacity).filter(Boolean))];
  const options = references ? config.variants : colors.map(color => optionVariant(config, selected, 'color', color));
  return <div className="variant-selector" data-variant-id={selected.id} data-shopify-variant-id={selected.shopifyVariantId || undefined}>
    <fieldset>
      <legend>{references ? 'Referencia' : 'Color'}: <strong>{references ? selected.name : selected.color}</strong></legend>
      <div className="variant-options">
        {options.map((variant, i) => {
          const image = variantImage(product, variant || config.variants.find(v => v.color === colors[i]));
          const name = references ? variant.name : colors[i];
          const active = references ? selected.id === variant.id : selected.color === name;
          return <button key={references ? variant.id : name} type="button" className="variant-option" aria-label={name} aria-pressed={active} disabled={!variant || !image} onClick={() => onChange(variant.id)}>
            {image ? <img src={image.variants?.[0]?.src || image.src} alt="" width="80" height="80" loading="lazy" /> : <span>Sin imagen</span>}
            <span>{name}</span>
          </button>;
        })}
      </div>
    </fieldset>
    {capacities.length > 0 && <fieldset><legend>Capacidad: <strong>{selected.capacity}</strong></legend><div className="variant-capacities">{capacities.map(capacity => {
      const candidate = optionVariant(config, selected, 'capacity', capacity);
      return <button key={capacity} type="button" aria-pressed={selected.capacity === capacity} disabled={!candidate} onClick={() => onChange(candidate.id)}>{capacity}</button>;
    })}</div></fieldset>}
    <p className="variant-summary" aria-live="polite">Selección: {selected.name}</p>
    <p className="editorial-note">{product.demo ? 'Referencias de demostración · Disponibilidad pendiente de verificar con el proveedor.' : product.variants.find(v => v.visualId === selected.id)?.mappingIssue || (product.variants.find(v => v.visualId === selected.id)?.available ? 'Precio y disponibilidad consultados en Shopify.' : 'Esta variante no está disponible en Shopify.')}</p>
    {selected.identification === 'pending-provider' && <p className="editorial-note">Nombre provisional: presentación o configuración pendiente de identificar.</p>}
  </div>;
}
