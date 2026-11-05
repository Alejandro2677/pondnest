import PacksSection, { PackDetail, PackSuggestion } from "./components/Packs.jsx";
import CartSummary from "./components/CartSummary.jsx";
import VariantSelector from "./components/VariantSelector.jsx";
import Brand from "./components/Brand.jsx";
import R36SProductDetails from "./components/R36SProductDetails.jsx";
import { r36sProduct } from "./data/r36sProduct.js";
import R36HAirDetails from "./components/R36HAirDetails.jsx";
import BagProductDetails, { BagRecommendation } from "./components/BagProductDetails.jsx";
import ProtectorProductDetails, { ProtectorRecommendation } from "./components/ProtectorProductDetails.jsx";
import { protectorProduct } from "./data/protectorProduct.js";
import { bagProduct } from "./data/bagProduct.js";
import { r36hAir } from "./data/r36hAir.js";
import { getProductVariants, selectedProductVariant, variantGallery } from "./data/productVariants.js";
import ProductGallery from "./components/ProductGallery.jsx";
import { productImages, responsiveImage } from "./data/productImages.js";
import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  BrowserRouter,
  HashRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { StoreProvider, useStore } from "./Store.jsx";
import { faqs, infoPages } from "./data/products.js";
import { money } from "./services/commerce.js";
import TikTokSection from "./components/TikTokSection.jsx";
import ReviewsSection from "./components/ReviewsSection.jsx";
import SupplierRating from "./components/SupplierRating.jsx";
import { mainProduct } from "./data/mainProduct.js";
import { CookieConsentProvider, useCookieConsent } from "./components/CookieConsent.jsx";
import { games } from "./data/games.js";
import "./components/gameCovers.css";
import {
  createConsolePose,
  createConsoleSequence,
} from "./animation/consoleSequence.js";
const Console3D = lazy(() => import("./components/Console3D.jsx"));
const SetupGuide = lazy(() => import("./components/SetupGuide.jsx"));
const SiteRouter = import.meta.env.MODE === "pages" ? HashRouter : BrowserRouter;

gsap.registerPlugin(ScrollTrigger);

function Header() {
  const { cart, demo } = useStore();
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();
  const menuRef = useRef();
  useEffect(() => setOpen(false), [pathname, hash]);
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuRef.current?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className="site-header">
        <Link to="/" aria-label="PondNest, inicio">
          <Brand />
        </Link>
        <nav
          id="main-navigation"
          className={open ? "nav-open" : ""}
          aria-label="Navegación principal"
        >
          <Link to="/packs">Packs</Link>
          <Link to="/productos">Consolas y accesorios</Link>
          <Link to="/#juegos">Universo retro</Link>
          <Link to="/faq">Información</Link>
          <Link to="/guia-configuracion">Guía de configuración</Link>
        </nav>
        <div className="header-actions">
          <Link to="/carrito" className="cart-link">
            Carrito{" "}
            <span>{cart.lines.reduce((sum, l) => sum + l.quantity, 0)}</span>
          </Link>
          <button
            className="menu-button"
            ref={menuRef}
            aria-controls="main-navigation"
            aria-expanded={open}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen(!open)}
          >
            {open ? "×" : "☰"}
          </button>
        </div>
      </header>
      {demo && (
        <div className="demo-ribbon">
          MODO DEMO <span>· Compra no disponible</span>
        </div>
      )}
    </>
  );
}
function PagePosition() {
  const { pathname, hash } = useLocation();
  const previousPath = useRef(pathname);
  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() =>
        document
          .getElementById(decodeURIComponent(hash.slice(1)))
          ?.scrollIntoView(),
      );
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
      if (previousPath.current !== pathname)
        document.querySelector("main")?.focus({ preventScroll: true });
    }
    previousPath.current = pathname;
    const title =
      pathname === "/"
        ? "R36S 128 GB con ArkOS · El retro regresa"
        : pathname === "/productos/r36s" ? "R36S 128 GB con ArkOS · morada transparente"
        : pathname === "/productos/r36h" ? r36hAir.title
        : pathname === "/productos/estuche-transporte" ? bagProduct.title
        : pathname === "/productos/funda-silicona" ? protectorProduct.title
        : pathname === "/guia-configuracion" ? "Guía de configuración ArkOS"
        : pathname.split("/").filter(Boolean).pop().replaceAll("-", " ");
    document.title = `${title.charAt(0).toUpperCase() + title.slice(1)} | PondNest`;
    document.querySelector('meta[name="description"]').content =
      `PondNest · ${title}. Consolas retro y accesorios. Consulta los detalles y el estado de la tienda.`;
  }, [pathname, hash]);
  return null;
}
const chapters = [
  [
    "00 / UNA NUEVA PARTIDA",
    <>
      El retro
      <br />
      <em>regresa.</em>
    </>,
    "Hay formas de jugar que nunca pasan de moda. Redescubre la R36S.",
  ],
  [
    "01 / CADA DETALLE",
    <>
      Una mirada
      <br />
      <em>más cerca.</em>
    </>,
    "Pantalla, carcasa y controles, desde otra perspectiva. Despiece visual aproximado.",
  ],
  [
    "02 / EN TUS MANOS",
    <>
      Conecta con
      <br />
      <em>el juego.</em>
    </>,
    "Cruceta, botones de acción y dos joysticks. Todo empieza con un movimiento.",
  ],
  [
    "03 / OTRA PERSPECTIVA",
    <>
      El control,
      <br />
      <em>también detrás.</em>
    </>,
    "Una vuelta para descubrir sus cuatro gatillos traseros.",
  ],
  [
    "04 / SIGUE JUGANDO",
    <>
      Tu próxima
      <br />
      <em>partida.</em>
    </>,
    "Explora nuestra selección y encuentra tu forma de volver a jugar.",
  ],
];
class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
function Hero() {
  const ref = useRef();
  const pose = useRef(createConsolePose());
  const [stage, setStage] = useState(0);
  const [ready, setReady] = useState(false);
  const [load, setLoad] = useState(null);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [staticMode, setStaticMode] = useState(() => {
    try {
      return sessionStorage.getItem("pondnest:static") === "1";
    } catch {
      return false;
    }
  });
  const stop = useCallback(() => {
    setStaticMode(true);
    try {
      sessionStorage.setItem("pondnest:static", "1");
    } catch {}
  }, []);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => {
    setFailed(true);
    setReady(true);
  }, []);
  const fixed = reduced || staticMode || failed;
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setReduced(m.matches);
    m.addEventListener("change", fn);
    return () => m.removeEventListener("change", fn);
  }, []);
  useEffect(() => {
    if (fixed || ready) return;
    const timer = setTimeout(onError, 20000);
    return () => clearTimeout(timer);
  }, [fixed, ready, onError]);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) =>
      setVisible(e.isIntersecting),
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    if (fixed) {
      setStage(0);
      return;
    }
    const element = ref.current;
    const sticky = element.querySelector(".experience-sticky");
    // Previously 200vh desktop / 130vh mobile of effective scroll. Keep the
    // existing CSS sticky scene and extend both ranges by exactly 3.5x.
    const distance = () =>
      window.innerHeight *
      (window.matchMedia("(max-width: 700px)").matches ? 4.55 : 7);
    const resize = () => {
      element.style.height = `${sticky.offsetHeight + distance()}px`;
    };
    resize();
    const timeline = createConsoleSequence(pose.current, {
      scrollTrigger: {
        trigger: element,
        start: "top top",
        end: () => `+=${distance()}`,
        scrub: 0.25,
        onRefreshInit: resize,
      },
      onUpdate: () => {
        const p = pose.current.progress;
        setStage(p < 0.12 ? 0 : p < 0.32 ? 1 : p < 0.43 ? 2 : p < 0.66 ? 3 : 4);
      },
    });
    return () => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
      element.style.removeProperty("height");
    };
  }, [fixed]);
  const current = chapters[stage];
  return (
    <section
      ref={ref}
      className={`experience ${fixed ? "experience-static" : ""}`}
      aria-label="Descubre la R36S"
    >
      <div className="experience-sticky">
        <div className="hero-wordmark" aria-hidden="true" style={{
          maskImage: `url(${import.meta.env.BASE_URL}logo/exports/pondnest-icono.webp)`,
          WebkitMaskImage: `url(${import.meta.env.BASE_URL}logo/exports/pondnest-icono.webp)`,
        }} />
        <div className="scene-3d">
          {(fixed || !ready) && (
            <img
              className="hero-poster"
              src={`${import.meta.env.BASE_URL}models/hero-poster.webp`}
              alt="Reconstrucción de la R36S morada transparente"
            />
          )}
          {!fixed && (
            <SceneBoundary onError={onError}>
              <Suspense fallback={null}>
                <Console3D
                  poseRef={pose}
                  onReady={onReady}
                  onError={onError}
                  onProgress={setLoad}
                  active={visible}
                />
              </Suspense>
            </SceneBoundary>
          )}
        </div>
        <div className="model-note">
          R36S <span>· 3D PROVISIONAL · FIDELIDAD PENDIENTE</span>
        </div>
        <div className="hero-copy" key={stage}>
          <span className="eyebrow">{current[0]}</span>
          <h1>{current[1]}</h1>
          <p>{current[2]}</p>
          <Link className="button primary" to="/productos/r36s">
            Comprar ahora <span>↗</span>
          </Link>
          <span className="hero-caption">
            Vertical. Transparente. Inconfundible.
          </span>
        </div>
        <div className="experience-bottom">
          <span className="scroll-hint">
            <span className="scroll-line" />{" "}
            {fixed ? "El juego continúa" : "Desliza para descubrir"}
          </span>
          <div className="hero-tools">
            {!fixed && <button onClick={stop}>Reducir movimiento</button>}
            <a href="#productos" onClick={stop}>
              Saltar introducción ↓
            </a>
          </div>
        </div>
        <div
          className="chapter-track"
          aria-hidden="true"
          style={{ display: fixed ? "none" : undefined }}
        >
          {chapters.map((_, i) => (
            <span className={stage === i ? "active" : ""} key={i} />
          ))}
        </div>
        {failed && (
          <p className="scene-status" role="status">
            3D no disponible. Puedes seguir explorando la tienda.
          </p>
        )}
        {!ready && !fixed && (
          <div
            className="loading"
            role="status"
            aria-label="Cargando experiencia 3D"
          >
            <Brand variant="principal" placement="loading" />
            <p>PREPARANDO TU PRÓXIMA PARTIDA</p>
            <progress
              max="100"
              {...(load !== null ? { value: load } : {})}
              aria-label="Descarga del modelo 3D"
            />
            <small>
              {load === null
                ? "Descargando modelo…"
                : `${load}% descargado · preparando escena`}
            </small>
            <button className="text-button" onClick={stop}>
              Entrar a la tienda sin animación ↗
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
function CatalogState({ children }) {
  const s = useStore();
  if (s.loading) return <p role="status">Cargando selección…</p>;
  if (s.catalogError)
    return (
      <div role="alert" className="notice">
        {s.catalogError}
        <button onClick={s.loadProducts}>Volver a intentar</button>
      </div>
    );
  return s.products.length ? (
    children
  ) : (
    <p>No hay productos publicados en este momento.</p>
  );
}
function ProductCards({ category }) {
  const { products } = useStore();
  return (
    <CatalogState>
      <div className="product-grid">
        {products
          .filter((p) => !category || p.category === category)
          .map(productImages)
          .map((p) => (
            <Link
              className="product-card"
              to={`/productos/${p.handle}`}
              key={p.handle}
            >
              <div className="product-image">
                <span className="product-tag">{p.tag}</span>
                {p.image ? (
                  <img
                    src={p.image}
                    {...responsiveImage(p)}
                    sizes="(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 24vw"
                    alt={p.name}
                    loading="lazy"
                    width={p.imageDetails?.[0]?.width || 640}
                    height={p.imageDetails?.[0]?.height || 640}
                  />
                ) : (
                  <span>Imagen pendiente</span>
                )}
                <span className="image-link">Explorar producto ↗</span>
              </div>
              <div className="product-info">
                <div>
                  <h3>{p.name}</h3>
                  <p>{p.type}</p>
                </div>
                <span className="product-arrow" aria-hidden="true">
                  ↗
                </span>
              </div>
              <p className="card-price">
                {p.demo
                  ? "Precio y disponibilidad por confirmar"
                  : money(p.price)}
              </p>
            </Link>
          ))}
      </div>
    </CatalogState>
  );
}
function Marquee({ reverse, paused }) {
  const cards = reverse ? [...games].reverse() : games;
  const marqueeRef = useRef();
  const [repeats, setRepeats] = useState(1);
  const [coversVisible, setCoversVisible] = useState(false);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) { setCoversVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setCoversVisible(true); observer.disconnect(); }
    }, { rootMargin: "300px 0px" });
    observer.observe(marqueeRef.current);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    const node = marqueeRef.current;
    const resize = () => {
      const width = node.querySelector(".game-card")?.offsetWidth || 236;
      setRepeats(Math.max(1, Math.ceil((node.clientWidth + 1) / ((width + 16) * cards.length))));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    return () => observer.disconnect();
  }, [cards.length]);
  const loopCards = Array.from({ length: repeats }, () => cards).flat();
  return (
    <div
      ref={marqueeRef}
      className={`marquee ${reverse ? "marquee-reverse" : ""} ${paused ? "paused" : ""}`}
      tabIndex="0"
      aria-label="Portadas de referencia; enfoca para pausar"
    >
      <div className="marquee-track" style={{ "--game-loop-repeats": repeats }}>
        {[...loopCards, ...loopCards].map(({ name, genre, cover, optimizedCover }, i) => (
          <div
            key={i}
            className="game-card"
            aria-hidden={i >= cards.length}
          >
            <div className="game-cover-frame">
              {cover ? <picture>
                {optimizedCover && <source srcSet={optimizedCover} type="image/webp" />}
                <img src={cover} alt={i < cards.length ? `Portada de ${name}, referencia visual` : ""}
                  loading={coversVisible ? "eager" : "lazy"} decoding="async" width="236" height="236" />
              </picture> : <span className="game-cover-missing">Portada pendiente de añadir</span>}
            </div>
            <div className="game-cover-caption"><strong>{name}</strong><small>{genre}</small></div>
          </div>
        ))}
      </div>
    </div>
  );
}
function FAQ() {
  return (
    <div className="faq-list">
      {faqs.map(([q, a]) => (
        <details key={q}>
          <summary>
            {q}
            <span aria-hidden="true">+</span>
          </summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  );
}
function Home() {
  const [paused, setPaused] = useState(false);
  return (
    <>
      <Hero />
      <PacksSection />
      <section className="section section-feature" id="productos">
        <div className="section-topline">
          <span>01 / ENCUENTRA TU FORMATO</span>
          <span>LA SELECCIÓN PONDNEST</span>
        </div>
        <div className="section-heading">
          <h2>
            Dos formas.
            <br />
            <em>El mismo espíritu.</em>
          </h2>
          <p>
            Vertical u horizontal. Elige una nueva forma de reencontrarte con el
            juego.
          </p>
        </div>
        <ProductCards category="console" />
        <p className="editorial-note">
          Imágenes de referencia. Especificaciones, variantes y derechos de uso
          pendientes de revisión.
        </p>
      </section>
      <section className="games-section" id="juegos">
        <div className="section games-title">
          <span className="eyebrow">02 / UN UNIVERSO RETRO</span>
          <h2>
            Hay partidas que
            <br />
            <em>se quedan contigo.</em>
          </h2>
          <p>
            La emoción de un salto. Una curva imposible. Una aventura por
            descubrir. ¿Por dónde empezarías?
          </p>
          <button
            className="text-button"
            aria-pressed={paused}
            onClick={() => setPaused(!paused)}
          >
            {paused ? "Reanudar movimiento →" : "Pausar movimiento Ⅱ"}
          </button>
        </div>
        <Marquee paused={paused} />
        <Marquee reverse paused={paused} />
        <p className="games-disclaimer">
          Portadas de referencia visual. No hemos confirmado que estos juegos
          estén incluidos en la R36S. Derechos de uso de las portadas
          pendientes de verificación antes de su publicación comercial.
        </p>
      </section>
      <TikTokSection />
      <section className="section" id="accesorios">
        <div className="section-topline">
          <span>03 / ENTRE PARTIDAS</span>
          <span>ACCESORIOS</span>
        </div>
        <div className="section-heading">
          <h2>
            Que el juego
            <br />
            <em>te acompañe.</em>
          </h2>
          <p>
            Explora las referencias de protección y transporte. Confirmaremos el
            ajuste antes de ofrecerlas junto a tu consola.
          </p>
        </div>
        <ProductCards category="accessory" />

      </section>
      <ReviewsSection />
      <section className="section reassurance">
        <div className="section-topline">
          <span>04 / SIN LETRA PEQUEÑA</span>
          <span>ANTES DE COMPRAR</span>
        </div>
        <div className="facts-grid">
          <div>
            <span>01 — EL PRODUCTO</span>
            <h3>Conoce cada detalle.</h3>
            <p>
              En la ficha verás qué está confirmado y qué queda por verificar.
            </p>
          </div>
          <div>
            <span>02 — LA ENTREGA</span>
            <h3>Todo, antes de decidir.</h3>
            <p>Publicaremos costes y plazos reales antes de abrir la venta.</p>
            <Link to="/envios">Sobre los envíos ↗</Link>
          </div>
          <div>
            <span>03 — TU TRANQUILIDAD</span>
            <h3>Una respuesta clara.</h3>
            <p>
              Consulta el estado de nuestras condiciones y canales de
              asistencia.
            </p>
            <Link to="/devoluciones">Devoluciones y garantía ↗</Link>
          </div>
        </div>
      </section>
      <section className="section faq-section">
        <span className="eyebrow">05 / RESOLVEMOS TUS DUDAS</span>
        <h2>
          Antes de la
          <br />
          <em>primera partida.</em>
        </h2>
        <FAQ />
      </section>
    </>
  );
}
function Detail() {
  const { pathname } = useLocation();
  const { products, loading, catalogError, demo, add, busy, cartReady, error } =
    useStore();
  const found = products.find((p) => p.handle === pathname.split("/").pop());
  const product = found ? productImages(found) : null;
  const [variantId, setVariantId] = useState("");
  const [visualVariantId, setVisualVariantId] = useState("");
  const visualConfig = product ? getProductVariants(product) : null;
  const visualVariant = selectedProductVariant(visualConfig, visualVariantId);
  const galleryVariant = product?.handle === "estuche-transporte" ? selectedProductVariant(getProductVariants(product)) : visualVariant;
  const galleryProduct = product ? variantGallery(product, galleryVariant) : null;
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  useEffect(() => {
    setVariantId("");
    setVisualVariantId("");
    setQuantity(1);
  }, [pathname]);
  if (loading || catalogError)
    return (
      <section className="section page">
        <CatalogState />
      </section>
    );
  if (!product) return <NotFound />;
  const isR36HAir = product.handle === "r36h";
  const isBag = product.handle === "estuche-transporte";
  const isProtector = product.handle === "funda-silicona";
  const isR36S = product.handle === mainProduct.handle;
  const variant = !demo && visualVariant ? product.variants.find(v => v.visualId === visualVariant.id) :
    product.variants.find((v) => v.id === variantId) ||
    product.variants.find((v) => v.available) ||
    product.variants[0];
  return (
    <section className={`section page${isR36HAir ? " r36h-air-page" : isProtector ? " protector-page" : isR36S ? " r36s-product-page" : ""}`}>
      <Link className="back-link" to="/productos">
        ← Volver a la selección
      </Link>
      <div className="detail-grid">
        <ProductGallery key={`${product.handle}:${visualVariant?.primaryImage || "general"}`} product={galleryProduct} demo={demo} />
        <div className="detail-copy">
          <span className="eyebrow">{product.tag}</span>
          <h1>{isR36HAir ? r36hAir.title : isBag ? bagProduct.title : isProtector ? protectorProduct.title : isR36S ? r36sProduct.title : product.name}</h1>
          <p className={isR36HAir ? "air-subtitle" : isR36S ? "r36s-subtitle" : undefined}>{isR36HAir ? r36hAir.subtitle : isBag ? bagProduct.description : isProtector ? protectorProduct.description : isR36S ? r36sProduct.subtitle : product.description}</p>
          {isBag && <p className="bag-included-note">{bagProduct.contents}</p>}
          {isProtector && <p className="protector-contents">{protectorProduct.contents}</p>}
          {isR36HAir && <p className="editorial-note">Información anunciada por el proveedor, pendiente de comprobación por PondNest.</p>}
          {product.handle === mainProduct.handle && <SupplierRating />}
          {isR36S && <><p className="r36s-reference">Referencia protagonista: 128 GB · Sistema operativo ArkOS · Morada transparente.</p><p className="editorial-note">Configuración anunciada por el proveedor. La capacidad y el sistema de las demás referencias visuales están pendientes de comprobar.</p></>}
          <p id={isR36HAir ? "air-purchase" : isProtector ? "protector-purchase" : isR36S ? "r36s-purchase" : undefined} className="detail-price">{isR36HAir && !variant?.price ? "Precio pendiente de configurar" : money(variant?.price)}</p>
          {demo && (
            <p className="demo-label">MODO DEMO · Compra no disponible</p>
          )}
          {isBag ? <p className="bag-single-color">Color: Negro</p> : visualConfig ? (
            <VariantSelector product={product} config={visualConfig} selected={visualVariant} onChange={setVisualVariantId} />
          ) : product.variants.length > 1 ? (
            <label className="field">
            {demo ? "Referencia" : "Variante"}
            <select
              value={variant?.id || ""}
              onChange={(e) => setVariantId(e.target.value)}
              disabled={!product.variants.length}
            >
              {product.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.title}
                  {!v.available ? " · Agotada" : ""}
                </option>
              ))}
            </select>
          </label>
          ) : null}
          <label className="field">
            Cantidad
            <input
              type="number"
              min="1"
              max="99"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </label>
          <button
            className="button primary full"
            disabled={
              busy ||
              !cartReady ||
              !variant?.available ||
              !Number.isInteger(quantity) ||
              quantity < 1 ||
              quantity > 99
            }
            onClick={async () => {
              if (await add(product, variant, quantity)) navigate("/carrito");
            }}
          >
            {busy
              ? "Actualizando…"
              : !variant?.available
                ? (variant?.mapped === false ? "Pendiente de vincular con Shopify" : "Agotado")
                : demo
                  ? "Añadir al carrito demo ↗"
                  : "Añadir al carrito ↗"}
          </button>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <p className="editorial-note">
            {demo
              ? "Precio, stock, impuestos y entrega pendientes de confirmar."
              : "Gastos de envío e impuestos según configuración de la tienda, indicados en checkout."}
          </p>
          {!isR36HAir && !isBag && !isProtector && !isR36S && product.facts.length > 0 && (
            <>
              <h2>Detalles visibles</h2>
              <ul>
                {product.facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </>
          )}
          {!isR36HAir && !isBag && !isProtector && !isR36S && product.note && <div className="notice">{product.note}</div>}
          {!isR36S && product.category === "console" && <p><Link to="/guia-configuracion">¿Necesitas ayuda para configurar tu consola? Consulta nuestra guía.</Link></p>}
          <div className="detail-links">
            <Link to="/envios">Envíos</Link>
            <Link to="/devoluciones">Devoluciones</Link>
            <Link to="/contacto">Contacto</Link>
          </div>
        </div>
      </div>
      {isR36HAir && <R36HAirDetails product={product} />}
      {isBag && <BagProductDetails />}
      {isProtector && <ProtectorProductDetails priceLabel={money(variant?.price)} />}
      {isR36S && <R36SProductDetails product={product} priceLabel={money(variant?.price)} />}
      {isR36S && <section className="r36s-accessories" aria-labelledby="r36s-accessories-title"><span className="eyebrow">TU EQUIPO / PRÓXIMAMENTE</span><h2 id="r36s-accessories-title">Accesorios en preparación</h2><BagRecommendation product={products.find(p => p.handle === "estuche-transporte")} /><ProtectorRecommendation product={products.find(p => p.handle === "funda-silicona")} consoleProduct={product} consoleVariant={variant} /></section>}
      <PackSuggestion handle={product.handle} />
    </section>
  );
}
function Cart({ summary = false }) {
  const navigate = useNavigate();
  const {
    cart,
    demo,
    update,
    busy,
    error,
    notice,
    checkout,
    review,
    cartReady,
    restoreCart,
  } = useStore();
  return (
    <section className="section page cart-page">
      <span className="eyebrow">{summary ? "RESUMEN DEL PEDIDO" : "TU SELECCIÓN"}</span>
      <h1>
        Un paso más
        <br />
        <em>hacia el juego.</em>
      </h1>
      {demo && (
        <div className="notice">
          Carrito de demostración · No se aceptan pagos ni se crean pedidos. Los
          precios están por confirmar.
        </div>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      {!cartReady ? (
        <div className="notice">
          <p>No se ha podido restaurar el carrito.</p>
          <button className="button" onClick={restoreCart}>
            Volver a cargar carrito
          </button>
        </div>
      ) : !cart.lines.length ? (
        <div className="empty">
          <span aria-hidden="true">＋</span>
          <h2>Tu próxima partida empieza aquí.</h2>
          <p>Todavía no has añadido productos.</p>
          <Link className="button primary" to="/productos">
            Explorar selección ↗
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            {cart.lines.map((l) => (
              <article className="cart-line" key={l.id}>
                {l.image && (
                  <img src={l.image} alt={l.name} width="120" height="120" />
                )}
                <div>
                  <Link to={l.demoPack || l.realPack ? `/packs/${l.packId}` : `/productos/${l.handle}`}>
                    <h2>{l.name}</h2>
                  </Link>
                  <p>{l.variant}</p>
                  <p>Precio unitario: {money(l.price)}</p>
                  <p>Subtotal: {money(l.total)}</p>
                  {l.realPack && <ul className="cart-pack-components">{l.components.map(component => <li key={component.variantId}>{component.quantity} × {component.name}<small>{component.variant}</small></li>)}</ul>}
                  {l.demoPack && <><p className="cart-pack-demo">Pack de demostración · Precio propuesto con IVA incluido cuando corresponda.</p><ul className="cart-pack-components">{l.components.map(component => <li key={component.handle}>1 × {component.name} por pack<small>{component.variant}</small></li>)}</ul><p>Componentes incluidos en el precio del pack. Se modifican y eliminan juntos.</p></>}
                  {!l.available && <p role="alert">Variante no disponible o pendiente de vincular.</p>}
                  <div className="quantity">
                    <button
                      aria-label={`Reducir cantidad de ${l.name}`}
                      disabled={busy || l.quantity <= 1}
                      onClick={() => update(l.id, l.quantity - 1)}
                    >
                      −
                    </button>
                    <output aria-label={`Cantidad de ${l.name}`}>
                      {l.quantity}
                    </output>
                    <button
                      aria-label={`Aumentar cantidad de ${l.name}`}
                      disabled={busy || l.quantity >= 99}
                      onClick={() => update(l.id, l.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      className="remove"
                      disabled={busy}
                      onClick={() => update(l.id, 0)}
                    >
                      {l.demoPack ? "Eliminar pack completo" : "Quitar"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <CartSummary cart={cart} demo={demo} busy={busy}
            onCheckout={async () => { if (summary) await checkout(); else if (await review()) navigate("/resumen-pedido"); }} />
        </div>
      )}
    </section>
  );
}
function Info({ slug }) {
  const page = infoPages[slug];
  return (
    <section className="section page info-page">
      <span className="eyebrow">INFORMACIÓN PONDNEST</span>
      <h1>{page[0]}</h1>
      <div className="notice">Contenido pendiente de aprobación comercial.</div>
      <h2>{page[1]}</h2>
      <p>{page[2]}</p>
      <Link className="button" to="/productos">
        Volver a la tienda ↗
      </Link>
    </section>
  );
}
function NotFound() {
  return (
    <section className="section page info-page">
      <span className="eyebrow">404 / FUERA DE LA PARTIDA</span>
      <h1>
        Por aquí
        <br />
        no era.
      </h1>
      <p>Esta página no existe o el producto ya no está disponible.</p>
      <Link className="button primary" to="/productos">
        Volver a la selección ↗
      </Link>
    </section>
  );
}
function Footer() {
  const { openPreferences } = useCookieConsent();
  return (
    <footer className="footer">
      <div>
        <Link to="/">
          <Brand placement="footer" />
        </Link>
        <p>
          Las ganas de jugar
          <br />
          no pasan de moda.
        </p>
      </div>
      <div className="footer-links">
        <Link to="/productos">La selección</Link>
        <Link to="/envios">Envíos</Link>
        <Link to="/devoluciones">Devoluciones y garantía</Link>
        <Link to="/contacto">Contacto</Link>
        <Link to="/faq">Preguntas frecuentes</Link>
        <Link to="/guia-configuracion">Guía de configuración</Link>
        <Link to="/aviso-legal">Aviso legal</Link>
        <Link to="/privacidad">Privacidad</Link>
        <Link to="/cookies">Cookies</Link>
        <button className="cookie-preferences-link" onClick={openPreferences}>Preferencias de cookies</button>
      </div>
      <small>
        © {new Date().getFullYear()} PondNest · España / EUR{" "}
        <span>Una nueva forma de volver a jugar.</span>
      </small>
    </footer>
  );
}
export default function App() {
  return (
    <CookieConsentProvider><SiteRouter>
      <StoreProvider>
        <PagePosition />
        <Header />
        <main id="contenido" tabIndex="-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/productos"
              element={
                <><PacksSection page headingLevel={2} /><section className="section">
                  <span className="eyebrow">LA SELECCIÓN PONDNEST</span>
                  <h1>
                    Encuentra tu
                    <br />
                    <em>próxima partida.</em>
                  </h1>
                  <ProductCards />
                </section></>
              }
            />
            <Route path="/productos/:handle" element={<Detail />} />
            <Route path="/productos/gamegaga-r36-hd" element={<Navigate to="/productos/r36s" replace />} />
            <Route path="/packs" element={<PacksSection page />} />
            <Route path="/packs/:packId" element={<PackDetail />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/resumen-pedido" element={<Cart summary />} />
            <Route path="/guia-configuracion" element={<Suspense fallback={<p className="section page" role="status">Cargando guía…</p>}><SetupGuide /></Suspense>} />
            <Route
              path="/faq"
              element={
                <section className="section page info-page">
                  <h1>Preguntas frecuentes</h1>
                  <FAQ />
                </section>
              }
            />
            {Object.keys(infoPages).map((slug) => (
              <Route
                key={slug}
                path={`/${slug}`}
                element={<Info slug={slug} />}
              />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </StoreProvider>
    </SiteRouter></CookieConsentProvider>
  );
}
