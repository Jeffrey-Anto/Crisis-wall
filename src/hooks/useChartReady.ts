import { useState, useEffect, useRef, useCallback } from 'react';

interface ChartDimensions {
  width: number;
  height: number;
  isReady: boolean;
}

/**
 * Attaches a ResizeObserver to the returned ref and reports `isReady = true`
 * only when both measured width AND height are > 0.
 *
 * Use the returned `containerRef` on the wrapper div, then gate chart
 * rendering on `isReady` to permanently eliminate Recharts width(-1)/height(-1) warnings.
 */
export function useChartReady() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<ChartDimensions>({ width: 0, height: 0, isReady: false });

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    if (width > 0 && height > 0) {
      setDims({ width, height, isReady: true });
    }
  }, []);

  useEffect(() => {
    // Synchronous first measure (may already be positive after first paint)
    measure();

    const observer = new ResizeObserver(() => {
      measure();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [measure]);

  return { containerRef, ...dims };
}
