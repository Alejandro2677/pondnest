import { useEffect, useId, useRef, useState } from "react";

export default function HorizontalCarousel({
  label,
  children,
  className = "",
}) {
  const ref = useRef();
  const id = useId();
  const [edges, setEdges] = useState({ start: true, end: false });
  useEffect(() => {
    const node = ref.current;
    const update = () =>
      setEdges({
        start: node.scrollLeft < 2,
        end: node.scrollLeft + node.clientWidth >= node.scrollWidth - 2,
      });
    update();
    node.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => {
      observer.disconnect();
      node.removeEventListener("scroll", update);
    };
  }, [children]);
  function move(direction) {
    const node = ref.current;
    const card = node.firstElementChild;
    node.scrollBy({
      left:
        direction *
        ((card?.getBoundingClientRect().width || node.clientWidth) + 20),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  return (
    <div className={`social-carousel ${className}`}>
      <div
        ref={ref}
        id={id}
        className="social-carousel-track"
        role="region"
        aria-label={label}
        tabIndex="0"
        onKeyDown={(event) => {
          if (
            event.target === event.currentTarget &&
            ["ArrowLeft", "ArrowRight"].includes(event.key)
          ) {
            event.preventDefault();
            move(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
      >
        {children}
      </div>
      <div className="social-carousel-navigation">
        <span>Desliza para descubrir</span>
        <div>
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={edges.start}
            aria-label={`Anterior: ${label}`}
            aria-controls={id}
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            disabled={edges.end}
            aria-label={`Siguiente: ${label}`}
            aria-controls={id}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
