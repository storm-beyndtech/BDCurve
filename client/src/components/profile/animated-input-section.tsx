import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type AnimatedInputSectionProps = {
  children: ReactNode;
  delay: number;
};

export function AnimatedInputSection({ children, delay }: AnimatedInputSectionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.3,
        delay: reduceMotion ? 0 : delay,
        ease: [0, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
