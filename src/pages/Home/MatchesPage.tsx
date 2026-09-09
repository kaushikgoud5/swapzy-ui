import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Check, Package, MessageCircle, PartyPopper } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { interestService, type Interest } from '../../services/interestService';
import { matchService, type MatchItem } from '../../services/matchService';
import { useToast } from '../../components/Toast';
import { store } from '../../store';

type Tab = 'interests' | 'matches';

const CONFETTI_COLORS = ['#FF5A5F', '#FFD700', '#00C9A7', '#845EF7', '#FF922B', '#74C0FC'];

function ConfettiBurst({ onDone }: { onDone: () => void }) {
  const pieces = Array.from({ length: 28 }, (_, i) => i);
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" onAnimationEnd={onDone}>
      {pieces.map((i) => {
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const x = Math.random() * 100;
        const delay = Math.random() * 0.3;
        const size = 6 + Math.random() * 8;
        const rotate = Math.random() * 720 - 360;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 1, y: -20, x: `${x}vw`, rotate: 0, scale: 1 }}
            animate={{ opacity: 0, y: '110vh', rotate, scale: 0.4 }}
            transition={{ duration: 1.8 + Math.random() * 0.6, delay, ease: 'easeIn' }}
            onAnimationComplete={i === 0 ? onDone : undefined}
            style={{
              position: 'absolute',
              top: 0,
              width: size,
              height: size * (Math.random() > 0.5 ? 1 : 2.5),
              background: color,
              borderRadius: Math.random() > 0.5 ? '50%' : 2,
            }}
          />
        );
      })}
    </div>
  );
}

export function MatchesPage() {
  const [tab, setTab] = useState<Tab>('interests');
  const [showConfetti, setShowConfetti] = useState(false);
  const qc = useQueryClient();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const userId = store.getState().auth.user?.id;

  const { data: interestsData, isLoading: loadingInterests } = useQuery({
    queryKey: ['seller-interests'],
    queryFn: () => interestService.getForSeller(),
  });

  const { data: matchesData, isLoading: loadingMatches } = useQuery({
    queryKey: ['matches'],
    queryFn: () => matchService.getMatches(),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 1 | 2 }) =>
      interestService.updateStatus(id, status),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ['seller-interests'] });
      qc.invalidateQueries({ queryKey: ['matches'] });
      showToast(status === 1 ? 'Match accepted!' : 'Interest rejected', status === 1 ? 'success' : 'info');
    },
    onError: () => showToast('Failed to update', 'error'),
  });

  const markSold = useMutation({
    mutationFn: (productId: number) => matchService.markSold(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['matches'] });
      setShowConfetti(true);
      showToast('🎉 Marked as sold!', 'success');
    },
    onError: () => showToast('Failed to mark as sold', 'error'),
  });

  const pending = interestsData?.interests.filter((i) => i.status === 0) ?? [];
  const matches = matchesData?.matches ?? [];

  return (
    <div className="min-h-screen p-5 pt-8" style={{ background: 'var(--color-nearby-bg)' }}>
      <AnimatePresence>
        {showConfetti && <ConfettiBurst onDone={() => setShowConfetti(false)} />}
      </AnimatePresence>

      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--color-nearby-text)' }}>
            Matches
          </h2>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--color-nearby-dim)' }}>
            Review interest in your listings and chat with buyers
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl p-1 w-fit ring-1 ring-white/5" style={{ background: 'var(--color-nearby-surface)' }}>
          {([['interests', 'Interests', pending.length], ['matches', 'Matches', matches.length]] as const).map(([value, label, count]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-1.5 font-display text-sm font-medium transition-all"
              style={{
                background: tab === value ? 'var(--color-nearby-coral)' : 'transparent',
                color: tab === value ? '#fff' : 'var(--color-nearby-dim)',
              }}
            >
              {label}
              {count > 0 && (
                <span className="rounded-full px-1.5 py-0.5 text-xs font-bold"
                  style={{ background: tab === value ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)', color: tab === value ? '#fff' : 'var(--color-nearby-dim)' }}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'interests' ? (
            <motion.div key="interests" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {loadingInterests ? (
                <Skeletons />
              ) : pending.length === 0 ? (
                <Empty icon={Heart} title="No pending interests" subtitle="When buyers swipe right on your listings, they'll appear here" />
              ) : (
                <div className="space-y-3">
                  {pending.map((interest: Interest) => (
                    <motion.div
                      key={interest.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -60 }}
                      className="flex items-center gap-4 rounded-[24px] p-4 ring-1 ring-white/5"
                      style={{ background: 'var(--color-nearby-surface)' }}
                    >
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
                        style={{ background: 'rgba(255,90,95,0.12)' }}>
                        <Package className="h-6 w-6" style={{ color: 'var(--color-nearby-coral)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm font-semibold truncate" style={{ color: 'var(--color-nearby-text)' }}>
                          {interest.productTitle}
                        </p>
                        <p className="mt-0.5 text-xs" style={{ color: 'var(--color-nearby-dim)' }}>
                          Someone is interested · {relativeTime(interest.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          disabled={updateStatus.isPending}
                          onClick={() => updateStatus.mutate({ id: interest.id, status: 2 })}
                          className="flex h-10 w-10 items-center justify-center rounded-2xl ring-1 ring-white/10 disabled:opacity-50"
                          style={{ background: 'var(--color-nearby-surface-2)' }}
                        >
                          <X className="h-4 w-4" style={{ color: 'var(--color-nearby-dim)' }} />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          disabled={updateStatus.isPending}
                          onClick={() => updateStatus.mutate({ id: interest.id, status: 1 })}
                          className="flex h-10 w-10 items-center justify-center rounded-2xl disabled:opacity-50"
                          style={{ background: 'var(--color-nearby-coral)', boxShadow: '0 8px 24px -8px rgba(255,90,95,0.6)' }}
                        >
                          <Check className="h-4 w-4 text-white" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="matches" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {loadingMatches ? (
                <Skeletons />
              ) : matches.length === 0 ? (
                <Empty icon={MessageCircle} title="No matches yet" subtitle="Accept an interest to start a match" />
              ) : (
                <div className="space-y-3">
                  {matches.map((match: MatchItem) => {
                    const isSeller = match.sellerId === userId;
                    return (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 rounded-[24px] p-4 ring-1 ring-white/5"
                        style={{ background: 'var(--color-nearby-surface)', opacity: match.isSwapped ? 0.7 : 1 }}
                      >
                        <div
                          className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl cursor-pointer"
                          style={{ background: 'var(--color-nearby-surface-2)' }}
                          onClick={() => navigate(`/home/chat/${match.id}`)}
                        >
                          {match.productImageUrl ? (
                            <img src={match.productImageUrl} alt={match.productName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-6 w-6" style={{ color: 'var(--color-nearby-dim)' }} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/home/chat/${match.id}`)}>
                          <p className="font-display text-sm font-semibold truncate" style={{ color: 'var(--color-nearby-text)' }}>
                            {match.productName}
                          </p>
                          {match.isSwapped ? (
                            <span className="mt-0.5 text-xs font-semibold" style={{ color: 'var(--color-nearby-coral)' }}>Sold ✓</span>
                          ) : (
                            <p className="mt-0.5 text-xs" style={{ color: 'var(--color-nearby-dim)' }}>
                              Matched · {relativeTime(match.createdOn)}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isSeller && !match.isSwapped && (
                            <motion.button
                              whileTap={{ scale: 0.92 }}
                              disabled={markSold.isPending}
                              onClick={() => markSold.mutate(match.productId)}
                              className="flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-display font-semibold disabled:opacity-50"
                              style={{ background: 'rgba(255,215,0,0.12)', color: '#FFD700' }}
                              title="Mark as sold"
                            >
                              <PartyPopper className="h-3.5 w-3.5" />
                              Sold
                            </motion.button>
                          )}
                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            onClick={() => navigate(`/home/chat/${match.id}`)}
                            className="flex h-10 w-10 items-center justify-center rounded-2xl"
                            style={{ background: 'rgba(255,90,95,0.12)' }}
                          >
                            <MessageCircle className="h-4 w-4" style={{ color: 'var(--color-nearby-coral)' }} />
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Skeletons() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-[24px]" style={{ background: 'var(--color-nearby-surface)' }} />
      ))}
    </div>
  );
}

function Empty({ icon: Icon, title, subtitle }: { icon: typeof Heart; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl" style={{ background: 'var(--color-nearby-surface)' }}>
        <Icon className="h-7 w-7" style={{ color: 'var(--color-nearby-dim)' }} />
      </div>
      <p className="font-display text-lg font-bold" style={{ color: 'var(--color-nearby-text)' }}>{title}</p>
      <p className="mt-1 text-sm max-w-xs" style={{ color: 'var(--color-nearby-dim)' }}>{subtitle}</p>
    </div>
  );
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
