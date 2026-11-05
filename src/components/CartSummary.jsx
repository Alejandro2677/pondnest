import { Link } from 'react-router-dom';
import { money } from '../services/commerce.js';
import './cartSummary.css';

export default function CartSummary({ cart, demo, busy, onCheckout }) {
  const s = cart.summary || {};
  const format = value => Number.isSafeInteger(value) && value >= 0 ? money({ amount: (value / 100).toFixed(2), currencyCode: s.currency || 'EUR' }) : 'Por confirmar';
  const freeShipping = s.shipping > 0 && s.shippingDiscount === s.shipping && s.netShipping === 0;
  const adjustment = s.netShipping !== null && s.netShipping !== undefined && s.total !== null && s.subtotal !== null && s.productDiscount !== null
    ? s.total - (s.subtotal - s.productDiscount + s.netShipping) : 0;
  return (
    <aside className="cart-summary order-summary" aria-labelledby="order-summary-title" aria-busy={busy}>
      <span className="order-summary-kicker">TU PEDIDO</span>
      <h2 id="order-summary-title">Todo en su sitio.</h2>
      <ul className="order-summary-products" aria-label="Productos del pedido">
        {cart.lines.map(line => <li key={line.id}><span>{line.name}<small>{line.variant} · {line.quantity} {line.quantity === 1 ? 'unidad' : 'unidades'}</small>{line.demoPack && line.components.map(c => <small key={c.handle}>{line.quantity} × {c.name} · {c.variant}</small>)}</span><strong>{money(line.total)}</strong></li>)}
      </ul>
      <dl className="order-summary-costs">
        <div><dt>Subtotal de productos</dt><dd>{format(s.subtotal)}</dd></div>
        {s.productDiscount > 0 && <div className="order-summary-saving"><dt>Descuentos de productos y pedido</dt><dd>−{format(s.productDiscount)}</dd></div>}
        <div><dt>{s.shippingLabel || 'Envío estándar'}</dt><dd>{s.pendingShipping || s.shipping == null ? 'Por confirmar' : freeShipping ? <><del>{format(s.shipping)}</del> <span className="order-summary-saving">GRATIS</span></> : format(s.shipping)}</dd></div>
        {s.shippingDiscount > 0 && <div className="order-summary-saving"><dt>Descuento de envío</dt><dd>−{format(s.shippingDiscount)}</dd></div>}
      </dl>
      {freeShipping && <p className="order-summary-promotion">Promoción de envío gratis aplicada</p>}
      {(s.pendingShipping || !cart.summary) && <p>El envío está pendiente de confirmar según tu dirección en el checkout.</p>}
      {Boolean(adjustment) && <dl className="order-summary-costs"><div><dt>Otros ajustes de Shopify</dt><dd>{adjustment < 0 ? '−' : '+'}{format(Math.abs(adjustment))}</dd></div></dl>}
      <dl className="order-summary-tax">
        <div><dt>Base imponible{s.taxSource === 'provisional' ? ' estimada' : ''}</dt><dd>{format(s.base)}</dd></div>
        <div><dt>IVA incluido{s.taxSource === 'provisional' ? ' estimado' : ''}</dt><dd>{format(s.tax)}</dd></div>
      </dl>
      {s.taxSource === 'provisional' ? <p className="order-summary-tax-note">Desglose fiscal provisional{ s.assumedDestination ? ' para España (territorio IVA)' : '' }: IVA {(s.taxRates || []).map(rate => `${rate / 100} %`).join(' / ')} según los artículos configurados. Se extrae del precio, no se añade al total. Shopify confirmará los impuestos según artículos y destino.{s.pendingShipping ? ' No incluye el envío pendiente.' : ''}</p> : s.tax == null && <p>Desglose fiscal pendiente de confirmar para los artículos y el destino en Shopify.</p>}
      <dl className="order-summary-total" aria-live="polite" aria-atomic="true"><div><dt>Total estimado<small>{s.pendingShipping ? 'Envío pendiente de confirmar' : 'Importe del pedido'}</small></dt><dd>{format(s.total)}</dd></div></dl>
      {s.savings > 0 && <p className="order-summary-savings">Ahorras <strong>{format(s.savings)}</strong> en este pedido</p>}
      <div className="order-summary-trust">
        {cart.checkoutBlockedReason && <p className="cart-pack-demo" role="status">{cart.checkoutBlockedReason}</p>}
        {cart.checkoutTestNotice && <p className="cart-pack-demo" role="status">{cart.checkoutTestNotice}</p>}
        {cart.hasDemoPacks && <p className="cart-pack-demo" role="status">Este carrito contiene packs de demostración. Los importes son propuestos; no se aceptan pedidos ni pagos hasta conectar los bundles en Shopify.</p>}
        {!demo && s.checkoutConnected && <p>Pago seguro mediante Shopify.</p>}
        {s.pricesIncludeTax && s.tax != null && <p>Impuestos incluidos{s.taxSource === 'provisional' ? ' en la estimación provisional' : ''}.</p>}
        <p>Revisaremos los importes antes de continuar. El checkout mostrará el importe definitivo antes de confirmar el pago.</p>
        <nav aria-label="Condiciones del pedido"><Link to="/envios">Política de envíos ↗</Link><Link to="/devoluciones">Devoluciones y garantía ↗</Link></nav>
      </div>
      <button className="button primary full" disabled={demo || busy || !s.checkoutConnected || !cart.lines.length || cart.lines.some(l => !l.available || !l.mapped)} onClick={onCheckout}>{busy ? 'Revisando pedido…' : 'Continuar al pago'}</button>
      <Link className="text-button" to="/productos">Seguir explorando</Link>
    </aside>
  );
}
