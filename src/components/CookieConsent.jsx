import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  COOKIE_PREFERENCES_KEY,
  loadPreferences,
  makePreferences,
} from "../services/cookiePreferences.js";
import "./cookieConsent.css";

const CookieConsent = createContext({
  externalAllowed: false,
  expiresAt: 0,
  openPreferences: () => {},
});
export const useCookieConsent = () => {
  const value = useContext(CookieConsent);
  return {
    ...value,
    externalAllowed: value.externalAllowed && value.expiresAt > Date.now(),
  };
};

export function CookieConsentProvider({ children }) {
  const [preferences, setPreferences] = useState(loadPreferences);
  const [open, setOpen] = useState(false);
  const [external, setExternal] = useState(false);
  const dialog = useRef();
  const previousFocus = useRef();
  function openPreferences() {
    previousFocus.current = document.activeElement;
    setExternal(preferences?.externalContent === true);
    setOpen(true);
  }
  function closePreferences() {
    setOpen(false);
    previousFocus.current?.focus?.();
  }
  function save(enabled) {
    const next = makePreferences(enabled);
    try {
      localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(next));
    } catch {
      /* Session only if storage is unavailable. */
    }
    setPreferences(next);
    closePreferences();
  }
  useEffect(() => {
    const sync = (event) => {
      if (event.key === COOKIE_PREFERENCES_KEY || event.key === null)
        setPreferences(loadPreferences());
    };
    const validate = () =>
      setPreferences((current) =>
        current && current.expiresAt <= Date.now() ? null : current,
      );
    window.addEventListener("storage", sync);
    window.addEventListener("focus", validate);
    document.addEventListener("visibilitychange", validate);
    let timer;
    const tick = () => {
      validate();
      timer = setTimeout(
        tick,
        Math.min(
          Math.max(
            1,
            (preferences?.expiresAt || Date.now() + 86400000) - Date.now(),
          ),
          86400000,
        ),
      );
    };
    timer = setTimeout(
      tick,
      Math.min(
        Math.max(
          1,
          (preferences?.expiresAt || Date.now() + 86400000) - Date.now(),
        ),
        86400000,
      ),
    );
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", validate);
      document.removeEventListener("visibilitychange", validate);
      clearTimeout(timer);
    };
  }, [preferences]);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  return (
    <CookieConsent.Provider
      value={{
        expiresAt: preferences?.expiresAt || 0,
        externalAllowed:
          preferences?.externalContent === true &&
          preferences.expiresAt > Date.now(),
        openPreferences,
      }}
    >
      {children}
      {!preferences && !open && (
        <aside className="cookie-notice" aria-label="Opciones de cookies">
          <strong>Tu privacidad, tu elección</strong>
          <p>
            Usamos almacenamiento necesario para la tienda. TikTok y YouTube solo se
            conecta si aceptas contenido externo.{" "}
            <a href="/cookies">Información de cookies</a>.
          </p>
          <div className="cookie-actions">
            <button onClick={() => save(false)}>Solo necesarias</button>
            <button onClick={() => save(true)}>
              Aceptar contenido externo
            </button>
            <button onClick={openPreferences}>Configurar cookies</button>
          </div>
        </aside>
      )}
      <dialog
        ref={dialog}
        className="cookie-dialog"
        aria-labelledby="cookie-title"
        onCancel={(event) => {
          event.preventDefault();
          closePreferences();
        }}
      >
        <h2 id="cookie-title">Preferencias de cookies</h2>
        <p>
          Decide qué servicios puede cargar PondNest. Puedes cambiar esta
          elección desde el footer. La preferencia se recuerda durante un máximo
          de 180 días.
        </p>
        <label className="cookie-category">
          <input type="checkbox" checked disabled />
          <span>
            <strong>Estrictamente necesarias</strong>
            <small>
              Carrito y preferencias de la tienda. No autorizan TikTok ni YouTube.
            </small>
          </span>
        </label>
        <label className="cookie-category">
          <input
            type="checkbox"
            checked={external}
            onChange={(event) => setExternal(event.target.checked)}
          />
          <span>
            <strong>Contenido externo · TikTok y YouTube</strong>
            <small>
              Permite sus reproductores. TikTok y Google/YouTube pueden recibir datos de
              navegación y usar sus propias cookies.{" "}
              <a
                href="https://www.tiktok.com/legal/page/eea/privacy-policy/es"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacidad de TikTok ↗
              </a>
              {" · "}<a href="https://policies.google.com/privacy?hl=es" target="_blank" rel="noopener noreferrer">Privacidad de Google/YouTube ↗</a>
            </small>
          </span>
        </label>
        <p className="cookie-fine-print">
          Retirar el permiso detiene y retira los reproductores. No borra las
          cookies que los servicios ya hayan establecido.
        </p>
        <div className="cookie-actions">
          <button onClick={() => save(false)}>Solo necesarias</button>
          <button onClick={() => save(external)}>Guardar preferencias</button>
          <button onClick={closePreferences}>Cerrar preferencias</button>
        </div>
      </dialog>
    </CookieConsent.Provider>
  );
}
