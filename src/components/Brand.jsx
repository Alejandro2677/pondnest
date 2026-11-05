import assets from '../data/brand-assets.generated.json';
import './brand.css';

export default function Brand({ variant = 'horizontal', placement = 'header' }) {
  const asset = assets[`pondnest-${variant}`];
  const base = import.meta.env.BASE_URL;
  const sizes = placement === 'loading' ? '(max-width: 400px) 60vw, 220px'
    : placement === 'footer' ? '180px' : '(max-width: 600px) 144px, 164px';
  return <span className={`brand brand--${variant} brand--${placement}`}>
    <img className="brand-logo" src={base + asset.src}
      srcSet={[...asset.variants, asset].map(image => `${base + image.src} ${image.width}w`).join(', ')}
      sizes={sizes} alt="PondNest" width={asset.width} height={asset.height}
      loading={placement === 'footer' ? 'lazy' : 'eager'}
      fetchPriority={placement === 'loading' ? 'high' : 'auto'} decoding="async" />
  </span>;
}
