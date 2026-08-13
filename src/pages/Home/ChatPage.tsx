import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ChatPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5"
      style={{ background: 'var(--color-nearby-bg)' }}
    >
      <motion.div
        className="w-full max-w-md text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Icon blob */}
        <motion.div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl"
          style={{ background: 'var(--color-nearby-surface)' }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <MessageCircle className="h-9 w-9" style={{ color: 'var(--color-nearby-coral)' }} />
        </motion.div>

        <h2 className="font-display text-3xl font-bold mb-3" style={{ color: 'var(--color-nearby-text)' }}>
          No chats yet.
        </h2>
        <p className="text-base mb-8 leading-relaxed" style={{ color: 'var(--color-nearby-dim)' }}>
          Like something nearby — the seller gets notified and a chat opens right here.
        </p>

        {/* Steps */}
        <div
          className="rounded-[24px] p-6 ring-1 ring-white/5 text-left space-y-4 mb-8"
          style={{ background: 'var(--color-nearby-surface)' }}
        >
          {[
            { n: '1', text: 'Swipe right on an item you want' },
            { n: '2', text: 'Seller gets notified instantly' },
            { n: '3', text: 'Chat opens — agree on a spot, meet up' },
          ].map(({ n, text }) => (
            <div key={n} className="flex items-center gap-3">
              <span
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-display text-xs font-bold"
                style={{ background: 'rgba(255,90,95,0.15)', color: 'var(--color-nearby-coral)' }}
              >
                {n}
              </span>
              <span className="text-sm" style={{ color: 'var(--color-nearby-dim)' }}>{text}</span>
            </div>
          ))}
        </div>

        <motion.button
          onClick={() => navigate('/home/discover')}
          whileHover={{ scale: 1.03, boxShadow: '0 20px 45px -12px rgba(255,90,95,0.55)' }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className="inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 font-display text-sm font-semibold text-white"
          style={{ background: 'var(--color-nearby-coral)', boxShadow: '0 12px 32px -10px rgba(255,90,95,0.6)' }}
        >
          Start swiping <ArrowRight className="h-4 w-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}
