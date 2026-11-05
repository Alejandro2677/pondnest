import { createContext, useContext, useEffect, useRef, useState } from "react";
import { commerce, cartSnapshot, checkoutAddress } from "./services/commerce.js";
import { demoProducts } from "./data/products.js";
import { packLine, restorePacks, withDemoPacks } from "./services/packs.js";

const packStorageKey = 'pondnest:demo-packs:v1';

const Store = createContext(null);
const empty = { lines: [], subtotal: null };
function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(commerce.storageKey));
  } catch {
    return null;
  }
}
function save(value) {
  try {
    localStorage.setItem(commerce.storageKey, JSON.stringify(value));
  } catch {
    /* Storage may be disabled. The session still works. */
  }
}
function demoCart(saved) {
  const lines = Array.isArray(saved?.lines)
    ? saved.lines.flatMap((l) => {
        const p = demoProducts.find((p) => p.handle === l.handle);
        return p && Number.isInteger(l.quantity) && l.quantity > 0
          ? [
              {
                id: p.handle,
                handle: p.handle,
                variantId: p.variants[0].id,
                name: p.name,
                image: p.image,
                variant: "Demostración",
                price: null,
                quantity: Math.min(l.quantity, 99),
              },
            ]
          : [];
      })
    : [];
  return { ...empty, lines };
}
export function StoreProvider({ children }) {
  const [packLines, setPackLines] = useState([]);
  const [packsReady, setPacksReady] = useState(false);
  const [products, setProducts] = useState([]);
  const [packCatalog, setPackCatalog] = useState([]);
  const [packError, setPackError] = useState('');
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cart, setCart] = useState(() =>
    commerce.demo ? demoCart(readSaved()) : empty,
  );
  const [busy, setBusy] = useState(false);
  const [cartReady, setCartReady] = useState(commerce.demo);
  const lock = useRef(false);
  const cartRef = useRef(cart);
  async function loadProducts() {
    setLoading(true);
    setCatalogError("");
    try {
      setProducts(await commerce.getProducts());
      try { setPackCatalog(await commerce.getPacks()); setPackError(''); }
      catch (e) { setPackCatalog([]); setPackError(e.message); }
    } catch (e) {
      setCatalogError(e.message);
    } finally {
      setLoading(false);
    }
  }
  async function restoreCart() {
    setCartReady(false);
    setError("");
    try {
      const id = readSaved()?.id;
      const next = id ? await commerce.getCart(id) : null;
      setCart(next || empty);
      cartRef.current = next || empty;
      save(next || empty);
      setCartReady(true);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    loadProducts();
    if (!commerce.demo) restoreCart();
  }, []);
  useEffect(() => {
    if (loading) return;
    try { setPackLines(restorePacks(JSON.parse(localStorage.getItem(packStorageKey)), products)); }
    catch { setPackLines([]); }
    setPacksReady(true);
  }, [products, loading]);
  function commitPacks(lines) {
    setPackLines(lines);
    try { localStorage.setItem(packStorageKey, JSON.stringify(lines)); } catch { /* Session still works. */ }
  }
  function addPack(packId, selection) {
    return operate(async () => {
      const pack = packCatalog.find(p => p.id === packId);
      if (!pack?.variants.some(v => Object.keys(v.selection).length === Object.keys(selection).length && Object.entries(v.selection).every(([h,id]) => selection[h] === id))) throw Error('Esta combinación no está disponible en Shopify.');
      const active = cartRef.current.id ? cartRef.current : await commerce.createCart();
      commit(active);
      commit(await commerce.addPack(active.id, packId, selection));
    });
  }
  useEffect(() => {
    if (commerce.demo) save(cart);
  }, [cart]);
  async function operate(action) {
    if (lock.current || !cartReady || !packsReady) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function commit(next) {
    cartRef.current = next;
    setCart(next);
    if (!commerce.demo) save({ id: next.id });
    if (next.warnings?.length) setNotice(next.warnings.join(" "));
  }
  function add(product, variant, quantity) {
    return operate(async () => {
      if (
        !variant?.available ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 99
      )
        throw new Error(
          "Selecciona una variante disponible y una cantidad entre 1 y 99.",
        );
      if (commerce.demo) {
        const existing = cart.lines.find((l) => l.variantId === variant.id);
        if ((existing?.quantity || 0) + quantity > 99)
          throw new Error(
            "El máximo de la demo es de 99 unidades por producto.",
          );
        commit({
          ...cart,
          lines: existing
            ? cart.lines.map((l) =>
                l === existing ? { ...l, quantity: l.quantity + quantity } : l,
              )
            : [
                ...cart.lines,
                {
                  id: product.handle,
                  handle: product.handle,
                  variantId: variant.id,
                  name: product.name,
                  image: product.image,
                  quantity,
                  variant: variant.title,
                  price: null,
                },
              ],
        });
      } else {
        const active = cartRef.current.id ? cartRef.current : await commerce.createCart();
        // Persist creation before adding: a retry must reuse this cart.
        commit(active);
        commit(await commerce.addToCart(active.id, variant.id, quantity));
      }
    });
  }
  function update(lineId, quantity) {
    return operate(async () => {
      if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99)
        throw new Error("Cantidad no válida.");
      if (lineId.startsWith('demo-pack:')) {
        const line = packLines.find(l => l.id === lineId);
        if (!line) throw Error('Este pack ya no está en el carrito.');
        const selection = Object.fromEntries(line.components.map(c => [c.handle, c.variantId]));
        commitPacks(quantity ? packLines.map(l => l.id === lineId ? packLine(line.packId, selection, products, quantity) : l) : packLines.filter(l => l.id !== lineId));
        return;
      }
      commit(
        commerce.demo
          ? {
              ...cart,
              lines: quantity
                ? cart.lines.map((l) =>
                    l.id === lineId ? { ...l, quantity } : l,
                  )
                : cart.lines.filter((l) => l.id !== lineId),
            }
          : await commerce.updateCart(cart.id, lineId, quantity),
      );
    });
  }
  function review() {
    return operate(async () => {
      if (packLines.length) throw Error('Los packs están en demostración. No se aceptan pedidos ni pagos de estos packs.');
      const next = await commerce.getCart(cart.id);
      if (!next?.lines.length) throw Error("El carrito está vacío o ha caducado.");
      commit(next);
    });
  }
  function checkout() {
    return operate(async () => {
      if (packLines.length) throw Error('Los packs están en demostración. No se aceptan pedidos ni pagos de estos packs.');
      const next = await commerce.prepareCheckout(cart.id);
      if (!next) throw Error("El carrito ha caducado.");
      commit(next);
      if (cartSnapshot(next) !== cartSnapshot(cart)) {
        setNotice("Han cambiado los precios, las cantidades o la disponibilidad. Revisa el resumen actualizado y vuelve a pulsar Continuar al pago.");
        return;
      }
      window.location.assign(checkoutAddress(next));
    });
  }
  return (
    <Store.Provider
      value={{
        products,
        loading,
        catalogError,
        loadProducts,
        cart: withDemoPacks(cart, packLines),
        packCatalog, packError,
        busy,
        cartReady: cartReady && packsReady,
        restoreCart,
        error,
        notice,
        add,
        addPack,
        update,
        checkout,
        review,
        demo: commerce.demo,
      }}
    >
      {children}
    </Store.Provider>
  );
}
export const useStore = () => useContext(Store);
