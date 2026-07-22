import { motion } from 'framer-motion';

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden h-full">
      <div className="h-3/5 bg-gray-200 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <div className="h-6 bg-gray-200 rounded-xl w-2/3 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded-xl w-16 animate-pulse" />
        </div>
        <div className="h-4 bg-gray-100 rounded-lg w-1/2 animate-pulse" />
        <div className="flex gap-2 items-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-4 bg-gray-100 rounded-lg w-24 animate-pulse" />
        </div>
        <div className="flex gap-3 pt-2">
          <div className="flex-1 h-12 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="flex-1 h-12 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="flex-1 h-12 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-md"
        >
          <div className="flex justify-between mb-3">
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-gray-200 rounded-lg w-1/2 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded-lg w-3/4 animate-pulse" />
            </div>
            <div className="h-6 bg-gray-200 rounded-lg w-16 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-100 rounded-xl w-20 animate-pulse" />
            <div className="h-8 bg-gray-100 rounded-xl w-20 animate-pulse" />
            <div className="h-8 bg-gray-100 rounded-xl w-20 animate-pulse" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
