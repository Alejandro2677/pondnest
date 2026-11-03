import { useEffect, useRef, useState } from "react";

export default function useSocialVisibility({
  once = false,
  threshold = 0.25,
  rootMargin = "0px",
} = {}) {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        const shown =
          entry.isIntersecting && entry.intersectionRatio >= threshold;
        setVisible(shown);
        if (shown && once) observer.disconnect();
      },
      { threshold: [0, threshold], rootMargin },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin]);
  return [ref, visible];
}
