import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, X, ChevronRight } from 'lucide-react';
import { matchService } from '../../services/matchService';
import type { Match, MatchStatus } from '../../types/dto';
import { MatchStatusLabel } from '../../types/dto';
import { useToast } from '../../components/Toast';
import { ConfirmDialog } from '../../components/ConfirmDialog';

const statusConfig: Record<number, { bg: string; text: string }> = {
  0: { bg: 'bg-green-100', text: 'text-green-700' },
  1: { bg: 'bg-red-100', text: 'text-red-700' },
  2: { bg: 'bg-purple-100', text: 'text-purple-700' },
};

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function WishlistedPage() {
  const { showToast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null);

  useEffect(() => {
    matchService.getMatches()
      .then((res) => setMatches(res.matches || []))
      .catch(() => showToast('Failed to load matches', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const openDetail = async (id: number) => {
    setLoadingDetail(true);
    try {
      const detail = await matchService.getMatch(id);
      setSelectedMatch(detail);
    } catch { showToast('Failed to load match details', 'error'); }
    finally { setLoadingDetail(false); }
  };

  const handleCancel = async (id: number) => {
    try {
      await matchService.cancelMatch(id);
      setMatches((prev) => prev.map((m) => m.id === id ? { ...m, status: 1 as MatchStatus } : m));
      if (selectedMatch?.id === id) setSelectedMatch((prev) => prev ? { ...prev, status: 1 as MatchStatus } : null);
      showToast('Match cancelled', 'info');
    } catch { showToast('Failed to cancel match', 'error'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 pt-6 sm:pt-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <ArrowLeftRight className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl sm:text-3xl">Matches</h2>
          {matches.length > 0 && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">{matches.length}</span>}
        </div>

        {matches.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-2xl mb-2">No matches yet</h3>
            <p className="text-muted-foreground">Swipe right on items to get matched!</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {matches.map((match, i) => {
                const cfg = statusConfig[match.status] ?? statusConfig[0];
                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => openDetail(match.id)}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                      <ArrowLeftRight className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{match.productName}</p>
                      <p className="text-sm text-muted-foreground">{relativeTime(match.createdOn)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
                      {MatchStatusLabel[match.status]}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {(selectedMatch || loadingDetail) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelectedMatch(null)}>
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {loadingDetail ? (
                <div className="p-12 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                </div>
              ) : selectedMatch && (
                <div>
                  <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-t-3xl flex items-center justify-center">
                    <span className="text-6xl">📦</span>
                    <button onClick={() => setSelectedMatch(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-2xl">{selectedMatch.productName}</h3>
                      <p className="text-xl text-purple-600 ml-3">₹{selectedMatch.estimatedValue}</p>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl mb-6">
                      <p className="text-sm text-muted-foreground">Match #{selectedMatch.id}</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedMatch.status]?.bg} ${statusConfig[selectedMatch.status]?.text}`}>
                        {MatchStatusLabel[selectedMatch.status]}
                      </span>
                    </div>
                    {selectedMatch.status === 0 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setConfirmCancelId(selectedMatch.id)}
                        className="w-full py-3 bg-red-50 text-red-600 border border-red-200 rounded-2xl font-medium cursor-pointer hover:bg-red-100 transition-colors"
                      >
                        Cancel Match
                      </motion.button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmCancelId !== null}
        title="Cancel Match"
        message="Are you sure you want to cancel this match?"
        onConfirm={() => { if (confirmCancelId) handleCancel(confirmCancelId); setConfirmCancelId(null); setSelectedMatch(null); }}
        onCancel={() => setConfirmCancelId(null)}
      />
    </div>
  );
}
