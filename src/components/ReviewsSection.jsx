import { useMemo } from "react";
import { reviews as configuredReviews } from "../data/reviews.js";
import { supplierReviewSelection } from "../data/supplierReviews.js";
import { prepareReviews, reviewSummary } from "../services/socialContent.js";
import HorizontalCarousel from "./HorizontalCarousel.jsx";
import SupplierRating from "./SupplierRating.jsx";
import { mainProduct } from "../data/mainProduct.js";
import useSocialVisibility from "./useSocialVisibility.js";
import "./socialProof.css";

function Stars({ rating }) {
  return (
    <span
      className="review-stars"
      role="img"
      aria-label={`${rating.toLocaleString("es-ES")} de 5 estrellas`}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} aria-hidden="true">
          <span className="review-star-base">☆</span>
          <span
            className="review-star-fill"
            style={{ width: `${Math.max(0, Math.min(1, rating - i)) * 100}%` }}
          >
            ★
          </span>
        </span>
      ))}
    </span>
  );
}
function ReviewSurface({ children, index = 0, demo = false }) {
  const [ref, visible] = useSocialVisibility({ once: true, threshold: 0.1 });
  return (
    <article
      ref={ref}
      className={`review-card social-reveal${demo ? " review-demo" : ""}`}
      data-visible={visible}
      style={{ "--reveal-delay": `${Math.min(index, 3) * 60}ms` }}
    >
      {children}
    </article>
  );
}
function ReviewCard({ review, index, supplier = false }) {
  return (
    <ReviewSurface index={index}>
      <Stars rating={review.rating} />
      {supplier && (
        <span className="review-demo-label">PROVEEDOR · DEMOSTRACIÓN</span>
      )}
      <p className="review-comment">{review.comment}</p>
      {supplier && (
        <div className="review-source-detail">
          <span>Traducción al español</span>
          <p>Variante de esta opinión: {review.variant}</p>
        </div>
      )}
      {review.image && (
        <img
          className="review-image"
          src={review.image}
          alt={review.imageAlt || "Foto compartida con esta opinión"}
          width="200"
          height="140"
          loading="lazy"
        />
      )}
      <div className="review-author">
        <span className="review-avatar" aria-hidden="true">
          {review.author.trim().charAt(0)}
        </span>
        <div>
          <h3>{review.author}</h3>
          {supplier && <span className="review-country">{review.country}</span>}
          <time dateTime={review.date}>
            {new Intl.DateTimeFormat("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            }).format(new Date(`${review.date}T00:00:00Z`))}
          </time>
        </div>
      </div>
    </ReviewSurface>
  );
}
export default function ReviewsSection({
  reviews = configuredReviews,
  supplierSelection = supplierReviewSelection,
}) {
  const entries = useMemo(() => prepareReviews(reviews).filter(review => review.productHandle === mainProduct.handle), [reviews]);
  // This curated supplier selection is display-only demo content. It never
  // enters the verified/public review pipeline or contributes to its summary.
  const supplierEntries =
    supplierSelection.mode === "demo" &&
    supplierSelection.isSelection &&
    supplierSelection.productHandle === mainProduct.handle &&
    supplierSelection.productMatchVerified === true &&
    Array.isArray(supplierSelection.items)
      ? supplierSelection.items
      : [];
  const showSupplier = !entries.length && supplierEntries.length > 0;
  const summary = showSupplier ? null : reviewSummary(entries);
  return (
    <section
      className="section social-section reviews-section"
      id="resenas"
      aria-labelledby="reviews-heading"
    >
      <span className="eyebrow">
        {entries.length ? "LA COMUNIDAD PONDNEST" : "VALORACIÓN DEL PROVEEDOR"}
      </span>
      <div className="section-heading">
        <h2 id="reviews-heading">
          Lo que opinan
          <br />
          <em>quienes la han probado</em>
        </h2>
        {summary ? (
          <div className="review-summary">
            <Stars rating={summary.average} />
            <strong>
              {summary.average.toLocaleString("es-ES", {
                maximumFractionDigits: 1,
                minimumFractionDigits: 1,
              })}{" "}
              / 5
            </strong>
            <p>
              {summary.count}{" "}
              {summary.count === 1 ? "reseña publicada" : "reseñas publicadas"}
            </p>
          </div>
        ) : showSupplier ? (
          <p>
            Opiniones traducidas de compradores de la plataforma del proveedor.
            Una selección, no todas sus valoraciones.
          </p>
        ) : (
          <p>
            Las experiencias cuentan. Publicaremos aquí opiniones auténticas
            cuando estén disponibles.
          </p>
        )}
      </div>
      <SupplierRating />
      {!supplierSelection.productMatchVerified && !entries.length && (
        <p className="social-demo-notice supplier-review-pending">Las seis opiniones del proveedor se conservan en el historial, pendientes de comprobar que pertenecen al anuncio de la R36S. No se muestran como opiniones de este producto.</p>
      )}
      {showSupplier && (
        <p className="social-demo-notice supplier-review-notice">
          MODO DEMOSTRACIÓN · No son opiniones de clientes ni compras
          verificadas en PondNest. Antes de publicarlas comercialmente debemos
          comprobar que corresponden al mismo producto y que tenemos derecho a
          reutilizarlas. No se calcula una media de esta selección.
        </p>
      )}
      {(showSupplier || entries.length > 0) && <HorizontalCarousel
        label={
          showSupplier ? "Opiniones del proveedor" : "Reseñas de compradores"
        }
        className="reviews-carousel"
      >
        {showSupplier
          ? supplierEntries.map((review, index) => (
              <ReviewCard
                supplier
                review={review}
                index={index}
                key={review.id}
              />
            ))
          : entries.length
            ? entries.map((review, index) => (
                <ReviewCard review={review} index={index} key={review.id} />
              ))
            : [
                "La experiencia de juego",
                "Los pequeños detalles",
                "Tu próxima opinión",
              ].map((title, index) => (
                <ReviewSurface demo key={title} index={index}>
                  <span className="review-empty-stars" aria-hidden="true">
                    ☆ ☆ ☆ ☆ ☆
                  </span>
                  <span className="review-demo-label">
                    SIN PUNTUACIÓN · DEMO
                  </span>
                  <h3>{title}</h3>
                  <p className="review-comment">
                    Este espacio se reservará para una reseña auténtica. No
                    representa la opinión de un comprador.
                  </p>
                  <div className="review-author">
                    <span className="review-avatar" aria-hidden="true">
                      —
                    </span>
                    <div>
                      <span>Autor pendiente</span>
                      <small>Fecha pendiente</small>
                    </div>
                  </div>
                </ReviewSurface>
              ))}
      </HorizontalCarousel>}
    </section>
  );
}
