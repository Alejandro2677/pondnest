import { createContext, useContext, useEffect, useRef, useState } from "react";
import { commerce } from "./services/commerce.js";
import { demoProducts } from "./data/products.js";

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
  const [products, setProducts] = useState([]);
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
  async function loadProducts() {
    setLoading(true);
    setCatalogError("");
    try {
      setProducts(await commerce.getProducts());
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
    if (commerce.demo) save(cart);
  }, [cart]);
  async function operate(action) {
    if (lock.current || !cartReady) return;
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
        const active = cart.id ? cart : await commerce.createCart();
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
  function checkout() {
    return operate(async () => {
      const url = await commerce.getCheckoutUrl(cart.id);
      window.location.assign(url);
    });
  }
  return (
    <Store.Provider
      value={{
        products,
        loading,
        catalogError,
        loadProducts,
        cart,
        busy,
        cartReady,
        restoreCart,
        error,
        notice,
        add,
        update,
        checkout,
        demo: commerce.demo,
      }}
    >
      {children}
    </Store.Provider>
  );
}
export const useStore = () => useContext(Store);
