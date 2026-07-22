import { useState, useRef, useCallback, useEffect } from "react";
import { Sparkles, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { feedService, type SwipeEntry } from "../../services/feedService";
import { SwipeCard } from "../../components/SwipeCard";
import { ProductDetailModal } from "../../components/ProductDetailModal";
import { SwipeHint } from "../../components/SwipeHint";
import type { FeedProduct } from "../../types/dto";
import { useToast } from "../../components/Toast";

const BATCH_SIZE = 10;
const DEFAULT_COORDS = { latitude: 17.385, longitude: 78.4867 };

export function DiscoveryPage() {
  const { showToast } = useToast();
  const qc = useQueryClient();
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<FeedProduct[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [detailProduct, setDetailProduct] = useState<FeedProduct | null>(null);
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

  // Append new pages, skip already-swiped
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
    ? `${data.products[0].distanceKm.toFixed(0)}km radius`
    : 'Nearby';

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Finding items near you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg">
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            <h2 className="text-xl sm:text-2xl">Discover</h2>
          </div>
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{locationLabel} · {remaining} items</span>
          </div>
        </div>

        <div className="relative h-[500px] sm:h-[560px] md:h-[620px] lg:h-[650px]">
          {currentProduct ? (
            <>
              {[2, 1].map((offset) => {
                const idx = currentIndex + offset;
                if (idx >= products.length) return null;
                return (
                  <div key={products[idx].id} className="absolute inset-0 bg-white rounded-3xl shadow-lg" style={{ transform: `scale(${1 - offset * 0.05}) translateY(${offset * 10}px)`, zIndex: 10 - offset, opacity: 1 - offset * 0.2 }} />
                );
              })}
              <SwipeCard key={currentProduct.id} product={currentProduct} onSwipe={handleSwipe} onDetailView={() => setDetailProduct(currentProduct)} isSaved={false} style={{ zIndex: 20 }} />
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8 bg-white rounded-3xl shadow-lg">
                <motion.div className="text-6xl mb-4" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>🎉</motion.div>
                <h3 className="text-2xl mb-2">All caught up!</h3>
                <p className="text-muted-foreground">{data?.hasMore ? 'Loading more items...' : 'Check back later for new items'}</p>
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-4 sm:mt-6 flex justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center"><span>←</span></div><span>Pass</span></div>
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center"><span>↑</span></div><span>Save</span></div>
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center"><span>→</span></div><span>Like</span></div>
        </div>
      </div>

      <ProductDetailModal product={detailProduct} onClose={() => setDetailProduct(null)} onLike={() => { handleSwipe('right'); setDetailProduct(null); }} onSave={() => { handleSwipe('up'); setDetailProduct(null); }} />
      <SwipeHint />
    </div>
  );
}
