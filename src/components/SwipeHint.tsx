import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function SwipeHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('swapzy_hint_seen')) {
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('swapzy_hint_seen', '1');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={dismiss}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl relative"
          >
            <button onClick={dismiss} className="absolute top-4 right-4 text-muted-foreground cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <div className="text-4xl mb-4">👋</div>
            <h3 className="text-lg font-semibold mb-3">How to swipe</h3>
            <div className="space-y-2 text-sm text-muted-foreground text-left">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">→</span>
                <span>Swipe right to like</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">←</span>
                <span>Swipe left to pass</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">↑</span>
                <span>Swipe up to save</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">👆</span>
                <span>Tap image for details</span>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={dismiss}
              className="mt-5 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl text-sm font-medium cursor-pointer"
            >
              Got it!
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
