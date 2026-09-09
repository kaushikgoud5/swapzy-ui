import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowUp, Package, MoreHorizontal } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../../services/chatService';
import { matchService } from '../../services/matchService';
import { store } from '../../store';

const QUICK_REPLIES = ['Is it still available?', 'Can you do a bit less?', 'When can I grab it?'];
const ease = [0.22, 1, 0.36, 1] as const;

export function ChatThread() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const userId = store.getState().auth.user?.id;

  const { data: matchesData } = useQuery({
    queryKey: ['matches'],
    queryFn: () => matchService.getMatches(),
    staleTime: 30_000,
  });
  const match = matchesData?.matches.find((m) => m.id === matchId);

  const { data, isLoading } = useQuery({
    queryKey: ['chat', matchId],
    queryFn: () => chatService.getMessages(matchId!),
    enabled: !!matchId,
    refetchInterval: 4000,
  });

  const messages = data?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendMutation = useMutation({
    mutationFn: (text: string) => chatService.sendMessage(matchId!, text),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chat', matchId] }),
  });

  const send = (text: string) => {
    if (!text.trim() || sendMutation.isPending) return;
    setInput('');
    sendMutation.mutate(text.trim());
  };

  const otherName = match
    ? (userId === match.sellerId ? 'Buyer' : match.productName)
    : 'Chat';

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'var(--color-nearby-bg)' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 border-b border-white/5 backdrop-blur-xl"
        style={{ background: 'rgba(15,17,21,0.9)' }}
      >
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
          style={{ background: 'var(--color-nearby-surface)' }}
        >
          <ArrowLeft className="h-4 w-4" style={{ color: 'var(--color-nearby-text)' }} />
        </motion.button>

        <div
          className="h-9 w-9 rounded-full flex-shrink-0 flex items-center justify-center font-display font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, var(--color-nearby-blue), var(--color-nearby-coral))', color: '#fff' }}
        >
          {otherName[0]}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-display text-sm font-bold truncate" style={{ color: 'var(--color-nearby-text)' }}>{otherName}</p>
          {match && (
            <p className="text-xs truncate" style={{ color: 'var(--color-nearby-dim)' }}>{match.productName}</p>
          )}
        </div>

        <button className="h-9 w-9 flex items-center justify-center rounded-xl" style={{ color: 'var(--color-nearby-dim)' }}>
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Pinned item card */}
      {match && (
        <div className="px-4 pt-3">
          <div
            className="flex items-center gap-3 rounded-[20px] p-3 ring-1 ring-white/5"
            style={{ background: 'var(--color-nearby-surface)' }}
          >
            <div
              className="h-12 w-12 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
              style={{ background: 'var(--color-nearby-surface-2)' }}
            >
              {match.productImageUrl
                ? <img src={match.productImageUrl} alt={match.productName} className="h-full w-full object-cover" />
                : <Package className="h-5 w-5" style={{ color: 'var(--color-nearby-dim)' }} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm font-bold truncate" style={{ color: 'var(--color-nearby-text)' }}>{match.productName}</p>
              {match.isSwapped && (
                <span className="text-xs font-semibold" style={{ color: 'var(--color-nearby-coral)' }}>Sold ✓</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pt-2">
        <p className="text-center text-xs" style={{ color: 'var(--color-nearby-dim)' }}>
          Meet in public. Swapzy never handles payments.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {isLoading ? (
          <div className="flex justify-center pt-10">
            <div className="h-5 w-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-nearby-coral)', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const mine = msg.senderId === userId;
              const isLastInGroup = i === messages.length - 1 || (messages[i + 1]?.senderId !== msg.senderId);
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: mine ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, ease }}
                  className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-3 py-2 text-sm rounded-2xl ${mine ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                    style={{
                      background: mine ? 'var(--color-nearby-coral)' : 'var(--color-nearby-surface-2)',
                      color: mine ? '#fff' : 'var(--color-nearby-text)',
                    }}
                  >
                    {msg.text}
                  </div>
                  {isLastInGroup && (
                    <span className="mt-0.5 text-[11px] px-1" style={{ color: 'var(--color-nearby-dim)' }}>
                      {new Date(msg.createdOn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
        {QUICK_REPLIES.map((r) => (
          <button
            key={r}
            onClick={() => send(r)}
            className="flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-display whitespace-nowrap"
            style={{ background: 'var(--color-nearby-surface-2)', color: 'var(--color-nearby-dim)' }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Composer */}
      <div
        className="sticky bottom-0 flex items-center gap-2 px-4 py-3 border-t border-white/5 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
        style={{ background: 'rgba(15,17,21,0.95)', backdropFilter: 'blur(20px)' }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="Message…"
          className="flex-1 rounded-xl px-3 py-2 text-sm outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-[color:var(--color-nearby-coral)] transition placeholder:text-[color:var(--color-nearby-dim)]"
          style={{ background: 'var(--color-nearby-surface-2)', color: 'var(--color-nearby-text)' }}
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => send(input)}
          disabled={!input.trim() || sendMutation.isPending}
          className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full disabled:opacity-40"
          style={{ background: 'var(--color-nearby-coral)' }}
        >
          <ArrowUp className="h-4 w-4 text-white" />
        </motion.button>
      </div>
    </div>
  );
}
