import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Heart, Bookmark } from 'lucide-react';
import type { FeedProduct } from '../types/dto';

interface ProductDetailModalProps {
  product: FeedProduct | null;
  onClose: () => void;
  onLike?: () => void;
  onSave?: () => void;
}

export function ProductDetailModal({ product, onClose, onLike, onSave }: ProductDetailModalProps) {
  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-t-3xl flex items-center justify-center">
              <span className="text-7xl">📦</span>
              <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 flex gap-2">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium">{product.condition}</span>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl flex-1">{product.name}</h2>
                <p className="text-2xl text-purple-600 font-semibold ml-3">₹{product.estimatedValue}</p>
              </div>

              {product.location && (
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{product.location.city}, {product.location.state}</span>
                </div>
              )}

              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{product.description}</p>

              <div className="flex gap-3">
                {onSave && (
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onSave} className="flex-1 py-3 bg-amber-50 text-amber-600 border border-amber-200 rounded-2xl flex items-center justify-center gap-2 cursor-pointer">
                    <Bookmark className="w-5 h-5" />
                    <span className="text-sm font-medium">Save</span>
                  </motion.button>
                )}
                {onLike && (
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onLike} className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl flex items-center justify-center gap-2 cursor-pointer">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-medium">Like</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
