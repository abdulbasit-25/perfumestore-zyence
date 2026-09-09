import { useEffect, useState } from "react";

/**
 * useReducedMotion - Hook to detect if user prefers reduced motion
 * Returns true if prefers-reduced-motion: reduce is set
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check initial preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * getAnimationDuration - Get animation duration based on reduced motion preference
 * Returns 0ms if reduced motion is preferred, otherwise returns the specified duration
 */
export function getAnimationDuration(duration: number, prefersReducedMotion: boolean): number {
  return prefersReducedMotion ? 0 : duration;
}

/**
 * getAnimationVariant - Get animation variant based on reduced motion preference
 */
export function getAnimationVariant(
  reducedVariant: any,
  normalVariant: any,
  prefersReducedMotion: boolean
) {
  return prefersReducedMotion ? reducedVariant : normalVariant;
}
