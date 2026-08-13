import { useTransform, useMotionValue, motion, type PanInfo } from 'framer-motion';
import { MapPin, Heart, X, Bookmark } from 'lucide-react';
import { useState } from 'react';
import type { FeedProduct } from '../types/dto';

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
  const rotate = useTransform(x, [-200, 0, 200], [-14, 0, 14]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const likeOpacity = useTransform(x, [10, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [-80, -10], [1, 0]);
  const saveOpacity = useTransform(y, [-80, -10], [1, 0]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      const dir = info.offset.x > 0 ? 'right' : 'left';
      setExitDirection(dir);
      onSwipe(dir);
    } else if (info.offset.y < -100) {
      setExitDirection('up');
      onSwipe('up');
    }
  };

  const handleButton = (dir: 'left' | 'right' | 'up') => {
    setExitDirection(dir);
    onSwipe(dir);
  };

  const exitAnim =
    exitDirection === 'right' ? { x: 500, rotate: 22, opacity: 0 } :
    exitDirection === 'left'  ? { x: -500, rotate: -22, opacity: 0 } :
    exitDirection === 'up'    ? { y: -800, opacity: 0 } : {};

  const firstImage = product.images?.[0]?.url ?? null;
  const locationText = product.location
    ? `${product.location.city}, ${product.location.state}`
    : `${product.distanceKm?.toFixed(1) ?? '?'} km away`;

  return (
    <motion.div
      className="absolute inset-0 touch-none"
      style={{ ...style, x, y, rotate, opacity }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      animate={exitDirection ? exitAnim : {}}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div
        className="h-full rounded-[28px] overflow-hidden flex flex-col ring-1 ring-white/5"
        style={{
          background: 'var(--color-nearby-surface)',
          boxShadow: '0 30px 80px -20px rgba(255,90,95,0.35)',
        }}
      >
        {/* Image hero — top 60% */}
        <div
          className="relative cursor-pointer overflow-hidden"
          style={{ height: '60%' }}
          onClick={onDetailView}
        >
          {firstImage ? (
            <img src={firstImage} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div
              className="h-full w-full flex items-center justify-center text-7xl"
              style={{ background: 'var(--color-nearby-surface-2)' }}
            >
              📦
            </div>
          )}

          {/* Dotted overlay */}
          <div
            className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 30% 20%, white 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />

          {/* LIKE stamp */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: likeOpacity }}
          >
            <span
              className="font-display text-2xl font-bold -rotate-12 rounded-xl border-4 px-5 py-2"
              style={{ color: 'var(--color-nearby-coral)', borderColor: 'var(--color-nearby-coral)' }}
            >
              LIKE
            </span>
          </motion.div>

          {/* NOPE stamp */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: nopeOpacity }}
          >
            <span className="font-display text-2xl font-bold rotate-12 rounded-xl border-4 border-white/60 px-5 py-2 text-white/80">
              NOPE
            </span>
          </motion.div>

          {/* SAVE stamp */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: saveOpacity }}
          >
            <span
              className="font-display text-2xl font-bold rounded-xl border-4 px-5 py-2"
              style={{ color: 'var(--color-nearby-yellow)', borderColor: 'var(--color-nearby-yellow)' }}
            >
              SAVED
            </span>
          </motion.div>

          {/* Condition chip */}
          <div className="absolute top-3 left-3">
            <span
              className="rounded-full px-2.5 py-1 text-xs font-display font-semibold backdrop-blur"
              style={{ background: 'rgba(0,0,0,0.45)', color: 'var(--color-nearby-text)' }}
            >
              {product.condition}
            </span>
          </div>

          {/* Distance pill */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs backdrop-blur" style={{ background: 'rgba(0,0,0,0.4)', color: 'var(--color-nearby-text)' }}>
            <MapPin className="h-3 w-3" />
            {locationText}
          </div>

          {isSaved && (
            <div className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full" style={{ background: 'var(--color-nearby-yellow)' }}>
              <Bookmark className="h-4 w-4 text-black fill-black" />
            </div>
          )}
        </div>

        {/* Info — bottom 40% */}
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-display text-lg sm:text-xl font-bold truncate" style={{ color: 'var(--color-nearby-text)' }}>
              {product.name}
            </h3>
            <span className="font-display text-xl font-bold flex-shrink-0" style={{ color: 'var(--color-nearby-coral)' }}>
              ₹{product.estimatedValue.toLocaleString()}
            </span>
          </div>

          {product.description && (
            <p className="text-xs mb-3 line-clamp-1" style={{ color: 'var(--color-nearby-dim)' }}>
              {product.description}
            </p>
          )}

          {/* Action buttons */}
          <div className="mt-auto flex gap-2">
            <motion.button
              onClick={() => handleButton('left')}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="flex h-11 flex-1 items-center justify-center rounded-2xl ring-1 ring-white/5"
              style={{ background: 'var(--color-nearby-surface-2)' }}
            >
              <X className="h-5 w-5" style={{ color: 'var(--color-nearby-dim)' }} />
            </motion.button>
            <motion.button
              onClick={() => handleButton('up')}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="flex h-11 flex-1 items-center justify-center rounded-2xl ring-1 ring-white/5"
              style={{ background: 'var(--color-nearby-surface-2)' }}
            >
              <Bookmark className="h-5 w-5" style={{ color: 'var(--color-nearby-yellow)' }} />
            </motion.button>
            <motion.button
              onClick={() => handleButton('right')}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="flex h-11 flex-1 items-center justify-center rounded-2xl"
              style={{ background: 'var(--color-nearby-coral)', boxShadow: '0 12px 32px -10px rgba(255,90,95,0.6)' }}
            >
              <Heart className="h-5 w-5 text-white" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
