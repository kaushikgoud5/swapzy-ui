import { useState } from 'react';
import { Heart, X, Bookmark, MapPin } from 'lucide-react';
import type { FeedProduct } from '../types/dto';
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';

interface SwipeCardProps {
  product: FeedProduct;
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
  onDetailView: () => void;
  style?: React.CSSProperties;
  isSaved: boolean;
}

export function SwipeCard({ product, onSwipe, onDetailView, style, isSaved }: SwipeCardProps) {
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotate = useTransform(x, [-200, 0, 200], [-20, 0, 20]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (Math.abs(info.offset.x) > threshold) {
      setExitDirection(info.offset.x > 0 ? 'right' : 'left');
      onSwipe(info.offset.x > 0 ? 'right' : 'left');
    } else if (info.offset.y < -threshold) {
      setExitDirection('up');
      onSwipe('up');
    }
  };

  const handleButtonClick = (direction: 'left' | 'right' | 'up') => {
    setExitDirection(direction);
    onSwipe(direction);
  };

  const getExitAnimation = () => {
    if (exitDirection === 'right') return { x: 500, rotate: 30, opacity: 0 };
    if (exitDirection === 'left') return { x: -500, rotate: -30, opacity: 0 };
    if (exitDirection === 'up') return { y: -800, opacity: 0 };
    return {};
  };

  const fallbackBg = 'bg-gradient-to-br from-purple-100 to-pink-100';

  // FeedProduct has no imageUrl or seller — use location city for display
  const locationText = product.location ? `${product.location.city}, ${product.location.state}` : `${product.distanceKm.toFixed(1)} km away`;

  return (
    <motion.div
      className="absolute inset-0 touch-none"
      style={{ ...style, x, y, rotate, opacity }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      animate={exitDirection ? getExitAnimation() : {}}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="h-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Image */}
        <motion.div
          className={`relative h-3/5 cursor-pointer overflow-hidden ${fallbackBg}`}
          onClick={onDetailView}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-full h-full flex items-center justify-center text-8xl">📦</div>

          <motion.div className="absolute inset-0 flex items-center justify-center bg-red-500/90" style={{ opacity: useTransform(x, [-200, -50], [1, 0]) }}>
            <div className="px-6 py-3 border-4 border-white rounded-2xl rotate-12"><span className="text-white text-2xl">NOPE</span></div>
          </motion.div>
          <motion.div className="absolute inset-0 flex items-center justify-center bg-green-500/90" style={{ opacity: useTransform(x, [50, 200], [0, 1]) }}>
            <div className="px-6 py-3 border-4 border-white rounded-2xl -rotate-12"><span className="text-white text-2xl">LIKE</span></div>
          </motion.div>
          <motion.div className="absolute inset-0 flex items-center justify-center bg-amber-500/90" style={{ opacity: useTransform(y, [-200, -50], [1, 0]) }}>
            <div className="px-6 py-3 border-4 border-white rounded-2xl"><span className="text-white text-2xl">SAVED</span></div>
          </motion.div>

          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm">{product.condition}</span>
          </div>
          {isSaved && (
            <div className="absolute top-4 right-4">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-white fill-white" />
              </div>
            </div>
          )}
        </motion.div>

        {/* Info */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col">
          <div className="flex justify-between items-start mb-2 sm:mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-2xl mb-1 truncate">{product.name}</h3>
              <div className="flex items-center gap-1 text-muted-foreground mb-1 sm:mb-2">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">{locationText}</span>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl text-purple-600 flex-shrink-0 ml-2">₹{product.estimatedValue}</p>
          </div>

          <div className="flex gap-2 sm:gap-3 mt-auto">
            <motion.button onClick={() => handleButtonClick('left')} className="flex-1 h-11 sm:h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center border-2 border-red-100 hover:bg-red-100 transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <X className="w-5 h-5 sm:w-7 sm:h-7" />
            </motion.button>
            <motion.button onClick={() => handleButtonClick('up')} className="flex-1 h-11 sm:h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center border-2 border-amber-100 hover:bg-amber-100 transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Bookmark className="w-5 h-5 sm:w-7 sm:h-7" />
            </motion.button>
            <motion.button onClick={() => handleButtonClick('right')} className="flex-1 h-11 sm:h-14 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center border-2 border-green-100 hover:bg-green-100 transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Heart className="w-5 h-5 sm:w-7 sm:h-7" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
