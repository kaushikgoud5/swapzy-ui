import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface MatchOverlayProps {
  open: boolean;
  onClose: () => void;
  itemName?: string;
  itemThumb?: string;
}

const ease = [0.22, 1, 0.36, 1] as const;
const PARTICLE_COUNT = 12;

function useReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function MatchOverlay({ open, onClose, itemName = 'this item', itemThumb }: MatchOverlayProps) {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    if (open && !reduced) {
      const t = setTimeout(() => setBurst(true), 400);
      return () => clearTimeout(t);
    }
    if (!open) setBurst(false);
  }, [open, reduced]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 backdrop-blur-xl"
          style={{ background: 'rgba(15,17,21,0.95)' }}
        >
          {/* Avatar collision */}
          <div className="relative flex items-center justify-center mb-8 h-28">
            {/* Buyer avatar */}
            <motion.div
              initial={{ x: reduced ? 0 : -80, opacity: reduced ? 1 : 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
              className="h-20 w-20 rounded-full ring-4 ring-[color:var(--color-nearby-bg)] flex items-center justify-center font-display text-2xl font-bold"
              style={{ background: 'linear-gradient(135deg, var(--color-nearby-blue), var(--color-nearby-coral))', zIndex: 2 }}
            >
              👤
            </motion.div>

            {/* Item thumb */}
            <motion.div
              initial={{ x: reduced ? 0 : 80, opacity: reduced ? 1 : 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
              className="h-20 w-20 -ml-4 rounded-full ring-4 ring-[color:var(--color-nearby-bg)] overflow-hidden flex items-center justify-center"
              style={{ background: 'var(--color-nearby-surface-2)', zIndex: 1 }}
            >
              {itemThumb
                ? <img src={itemThumb} alt={itemName} className="h-full w-full object-cover" />
                : <span className="text-3xl">📦</span>}
            </motion.div>

            {/* Yellow particles */}
            {burst && !reduced && Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
              const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
              const dist = 55 + Math.random() * 25;
              return (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist,
                    scale: 1,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.6, delay: i * 0.02, ease: 'easeOut' }}
                  className="absolute h-2.5 w-2.5 rounded-full"
                  style={{ background: 'var(--color-nearby-yellow)' }}
                />
              );
            })}
          </div>

          {/* Headline — yellow only here */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease }}
            className="font-display text-4xl font-bold text-center mb-3"
            style={{ color: 'var(--color-nearby-yellow)' }}
          >
            It's a match!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6, ease }}
            className="text-base text-center max-w-xs leading-relaxed mb-10"
            style={{ color: 'var(--color-nearby-dim)' }}
          >
            You both want this to happen. Say hi before someone else does.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6, ease }}
            className="flex flex-col items-center gap-3 w-full max-w-xs"
          >
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 20px 45px -12px rgba(255,90,95,0.55)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              onClick={() => { onClose(); navigate('/home/chat'); }}
              className="w-full rounded-2xl py-3.5 font-display text-base font-semibold"
              style={{ background: 'var(--color-nearby-coral)', color: '#fff', boxShadow: '0 12px 32px -10px rgba(255,90,95,0.6)' }}
            >
              Send a message
            </motion.button>

            <button
              onClick={onClose}
              className="font-display text-sm py-2 transition-colors"
              style={{ color: 'var(--color-nearby-dim)' }}
            >
              Keep swiping
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
