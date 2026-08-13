import { useState, useRef, useCallback, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { feedService, type SwipeEntry } from '../../services/feedService';
import { SwipeCard } from '../../components/SwipeCard';
import type { FeedProduct } from '../../types/dto';

const BATCH_SIZE = 10;
const DEFAULT_COORDS = { latitude: 17.385, longitude: 78.4867 };

export function DiscoveryPage() {
  const qc = useQueryClient();
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<FeedProduct[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const swipeQueue = useRef<SwipeEntry[]>([]);
  const swipedIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => {}
    );
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['feed', coords, page],
    queryFn: () => feedService.getFeed({ ...coords, page, pageSize: 20 }),
    staleTime: 2 * 60_000,
  });

  useEffect(() => {
    if (!data?.products) return;
    const fresh = data.products.filter((p) => !swipedIds.current.has(p.id));
    setProducts((prev) => page === 1 ? fresh : [...prev, ...fresh]);
  }, [data, page]);

  const flushSwipes = useCallback(async () => {
    if (swipeQueue.current.length === 0) return;
    const batch = [...swipeQueue.current];
    swipeQueue.current = [];
    try { await feedService.batchSwipe(batch); } catch { /* silent */ }
  }, []);

  useEffect(() => () => { flushSwipes(); }, [flushSwipes]);

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    const product = products[currentIndex];
    if (!product) return;
    swipedIds.current.add(product.id);
    if (direction !== 'up') {
      swipeQueue.current.push({ productId: product.id, direction: direction === 'right' ? 0 : 1 });
    }
    const nextIndex = currentIndex + 1;
    if (nextIndex >= products.length || swipeQueue.current.length >= BATCH_SIZE) flushSwipes();
    setCurrentIndex(nextIndex);
    if (nextIndex >= products.length - 3 && data?.hasMore) {
      setPage((p) => p + 1);
      qc.prefetchQuery({ queryKey: ['feed', coords, page + 1], queryFn: () => feedService.getFeed({ ...coords, page: page + 1, pageSize: 20 }) });
    }
  };

  const currentProduct = products[currentIndex];
  const remaining = products.length - currentIndex;
  const locationLabel = data?.products?.[0]?.distanceKm != null
    ? `${data.products[0].distanceKm.toFixed(0)} km radius`
    : 'Nearby';

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-nearby-bg)' }}>
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-2xl animate-pulse" style={{ background: 'var(--color-nearby-surface-2)' }} />
          <p className="font-display text-sm" style={{ color: 'var(--color-nearby-dim)' }}>Finding items near you…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'var(--color-nearby-bg)' }}
    >
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Header */}
        <div className="mb-5 text-center">
          <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--color-nearby-text)' }}>
            Discover
          </h2>
          <div className="mt-1 flex items-center justify-center gap-1.5 text-sm" style={{ color: 'var(--color-nearby-dim)' }}>
            <MapPin className="h-3.5 w-3.5" />
            <span>{locationLabel} · {remaining} items</span>
          </div>
        </div>

        {/* Card stack */}
        <div className="relative h-[500px] sm:h-[560px]">
          {currentProduct ? (
            <>
              {[2, 1].map((offset) => {
                const idx = currentIndex + offset;
                if (idx >= products.length) return null;
                return (
                  <div
                    key={products[idx].id}
                    className="absolute inset-0 rounded-[28px] ring-1 ring-white/5"
                    style={{
                      background: 'var(--color-nearby-surface)',
                      transform: `scale(${1 - offset * 0.04}) translateY(${offset * 12}px)`,
                      zIndex: 10 - offset,
                      opacity: 1 - offset * 0.25,
                    }}
                  />
                );
              })}
              <SwipeCard
                key={currentProduct.id}
                product={currentProduct}
                onSwipe={handleSwipe}
                onDetailView={() => {}}
                isSaved={false}
                style={{ zIndex: 20 }}
              />
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center rounded-[28px] ring-1 ring-white/5"
              style={{ background: 'var(--color-nearby-surface)' }}
            >
              <div className="text-center p-8">
                <div className="mb-4 text-5xl">🎉</div>
                <h3 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--color-nearby-text)' }}>
                  All caught up!
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-nearby-dim)' }}>
                  {data?.hasMore ? 'Loading more items…' : 'Check back later for new items'}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-5 flex justify-center gap-6 text-xs" style={{ color: 'var(--color-nearby-dim)' }}>
          {[
            { label: 'Pass', symbol: '←' },
            { label: 'Save', symbol: '↑', color: 'var(--color-nearby-yellow)' },
            { label: 'Like', symbol: '→', color: 'var(--color-nearby-coral)' },
          ].map(({ label, symbol, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs ring-1 ring-white/5"
                style={{ background: 'var(--color-nearby-surface)', color: color ?? 'var(--color-nearby-dim)' }}
              >
                {symbol}
              </div>
              <span className="font-display">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
