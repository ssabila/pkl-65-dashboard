import { useState, useEffect, useRef } from "react";

export function useIntersectionObserver(options = {}) {
  const [activeSection, setActiveSection] = useState(0);
  const elementsRef = useRef({});

  const setRef = (index) => (el) => {
    if (el) elementsRef.current[index] = el;
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      // Cari section yang paling banyak terlihat di viewport
      let bestIndex = null;
      let bestRatio = 0;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Object.keys(elementsRef.current).find(
            (key) => elementsRef.current[key] === entry.target
          );
          if (index !== undefined && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIndex = Number(index);
          }
        }
      });
      if (bestIndex !== null) {
        setActiveSection(bestIndex);
      }
    }, { threshold: [0.0, 0.1, 0.3, 0.5], ...options });

    const currentRefs = elementsRef.current;
    Object.values(currentRefs).forEach((el) => observer.observe(el));

    return () => {
      Object.values(currentRefs).forEach((el) => observer.unobserve(el));
    };
  }, [options]);

  return [activeSection, setRef];
}
