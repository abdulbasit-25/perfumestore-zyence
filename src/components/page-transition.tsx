import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * PageTransition - Wraps page content with enter/exit animations
 * Creates smooth cross-fade and subtle slide between route changes
 */
export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      key="page-wrapper"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * PageTransitionContainer - For wrapping multiple route components
 * Use this with TanStack Router's RootRoute or individual routes
 */
export function PageTransitionContainer({ children }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <PageTransition>{children}</PageTransition>
    </AnimatePresence>
  );
}
