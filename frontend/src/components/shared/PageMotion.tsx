import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

// A single entrance boundary per page; authentication and route guards stay outside.
export default function PageMotion({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.4, ease: 'easeOut' }}>{children}</motion.div>;
}
