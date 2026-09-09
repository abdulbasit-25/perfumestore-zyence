import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * CustomCursor - Desktop-only cursor with trailing ring
 * Scales up over interactive elements (links, buttons, images)
 * Disabled on touch devices
 */
export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch device
    const isTouchDetected =
      window.matchMedia("(pointer: coarse)").matches ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsTouchDevice(isTouchDetected);

    // Also check if user prefers reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsTouchDevice(true); // Disable custom cursor for reduced motion
    }
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      // Check if hovering over interactive element
      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("button") ||
        target.closest("a") ||
        target.classList.contains("interactive") ||
        target.parentElement?.classList.contains("media-zoom");

      setIsPointer(isInteractive);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isTouchDevice]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      {/* Dot cursor */}
      <motion.div
        className="fixed pointer-events-none z-[9999] w-2 h-2 bg-foreground rounded-full"
        animate={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
          scale: isPointer ? 0.8 : 1,
        }}
        transition={{ type: "tween", duration: 0 }}
      />

      {/* Trailing ring */}
      <motion.div
        className="fixed pointer-events-none z-[9999] rounded-full border border-foreground/60"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
          width: isPointer ? 32 : 24,
          height: isPointer ? 32 : 24,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 28,
          mass: 0.5,
        }}
      />
    </>
  );
}
