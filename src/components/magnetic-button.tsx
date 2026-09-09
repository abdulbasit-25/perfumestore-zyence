import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  as?: "button" | "a";
  href?: string;
  disabled?: boolean;
  [key: string]: any;
}

/**
 * MagneticButton - Button that follows cursor within its bounds
 * Creates a tactile, interactive feel aligned with Zyence brand
 */
export function MagneticButton({
  children,
  className = "",
  onClick,
  as = "button",
  href,
  disabled = false,
  ...props
}: MagneticButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  useEffect(() => {
    if (!isHovered || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const distX = mouseX - centerX;
      const distY = mouseY - centerY;
      
      // Limit movement to 30% of container size
      const maxDist = Math.min(rect.width, rect.height) * 0.15;
      const distance = Math.sqrt(distX * distX + distY * distY);
      
      if (distance < maxDist) {
        setPosition({
          x: (distX / maxDist) * 8,
          y: (distY / maxDist) * 8,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isHovered]);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
  };

  const Component = as;

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        animate={isHovered ? { x: position.x, y: position.y } : { x: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      >
        <Component
          ref={elementRef}
          onClick={onClick}
          disabled={disabled}
          className={`relative transition-all duration-300 ${
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          } ${className}`}
          href={as === "a" ? href : undefined}
          {...props}
        >
          {children}
        </Component>
      </motion.div>
    </div>
  );
}
