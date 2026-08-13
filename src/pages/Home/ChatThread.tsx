import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowUp, Camera, MapPin, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  mine: boolean;
  time: string;
}

const QUICK_REPLIES = [
  'Is it still available?',
  'Can you do a bit less?',
  'When can I grab it?',
];

const ease = [0.22, 1, 0.36, 1] as const;

// Mock data — replace with real API when chat service is wired
const MOCK_MESSAGES: Message[] = [
  { id: '1', text: 'Hey, is this still available?', mine: false, time: '2:14 pm' },
  { id: '2', text: 'Yep! Still here 👍', mine: true, time: '2:15 pm' },
  { id: '3', text: 'Great — can you do £18?', mine: false, time: '2:15 pm' },
  { id: '4', text: 'Sure, £18 works. When are you free?', mine: true, time: '2:16 pm' },
];

interface ChatThreadProps {
  matchId?: string;
  sellerName?: string;
  sellerAvatar?: string;
  itemName?: string;
  itemPrice?: number;
  itemThumb?: string;
}

export function ChatThread({
  sellerName = 'Alex',
  itemName = 'Vintage Lamp',
  itemPrice = 20,
  itemThumb,
}: ChatThreadProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const msg: Message = { id: Date.now().toString(), text: text.trim(), mine: true, time: 'now' };
    setMessages((prev) => [...prev, msg]);
    setInput('');
    // Simulate typing response
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { id: Date.now().toString(), text: 'Sounds good!', mine: false, time: 'now' }]);
    }, 1800);
  };

  return (
    <div
      className="flex flex-col min-h-dvh"
      style={{ background: 'var(--color-nearby-bg)' }}
    >
      {/* Sticky header */}
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
          {sellerName[0]}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-display text-sm font-bold truncate" style={{ color: 'var(--color-nearby-text)' }}>{sellerName}</p>
          <p className="text-xs" style={{ color: 'var(--color-nearby-dim)' }}>Active 4m ago</p>
        </div>

        <button className="h-9 w-9 flex items-center justify-center rounded-xl" style={{ color: 'var(--color-nearby-dim)' }}>
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Pinned item card */}
      <div className="px-4 pt-3">
        <div
          className="flex items-center gap-3 rounded-[20px] p-3 ring-1 ring-white/5"
          style={{ background: 'var(--color-nearby-surface)' }}
        >
          <div
            className="h-12 w-12 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
            style={{ background: 'var(--color-nearby-surface-2)' }}
          >
            {itemThumb
              ? <img src={itemThumb} alt={itemName} className="h-full w-full object-cover" />
              : <span className="text-xl">📦</span>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-sm font-bold truncate" style={{ color: 'var(--color-nearby-text)' }}>{itemName}</p>
            <p className="font-display text-sm font-bold" style={{ color: 'var(--color-nearby-coral)' }}>£{itemPrice}</p>
          </div>
        </div>
      </div>

      {/* Safety note */}
      <div className="px-4 pt-3">
        <p className="text-center text-xs" style={{ color: 'var(--color-nearby-dim)' }}>
          Meet in public. Nearby never handles payments.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isLastInGroup = i === messages.length - 1 || messages[i + 1]?.mine !== msg.mine;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: msg.mine ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease }}
                className={`flex flex-col ${msg.mine ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[70%] px-3 py-2 text-sm rounded-2xl ${msg.mine ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                  style={{
                    background: msg.mine ? 'var(--color-nearby-coral)' : 'var(--color-nearby-surface-2)',
                    color: msg.mine ? '#fff' : 'var(--color-nearby-text)',
                  }}
                >
                  {msg.text}
                </div>
                {isLastInGroup && (
                  <span className="mt-0.5 text-[11px] px-1" style={{ color: 'var(--color-nearby-dim)' }}>
                    {msg.time}
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex items-center gap-1 px-3 py-2.5 rounded-2xl rounded-bl-sm w-fit"
              style={{ background: 'var(--color-nearby-surface-2)' }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: 'var(--color-nearby-dim)' }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
        {QUICK_REPLIES.map((r) => (
          <button
            key={r}
            onClick={() => send(r)}
            className="flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-display whitespace-nowrap transition-colors"
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
        <button className="h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-xl" style={{ color: 'var(--color-nearby-dim)' }}>
          <Camera className="h-4 w-4" />
        </button>
        <button className="h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-xl" style={{ color: 'var(--color-nearby-dim)' }}>
          <MapPin className="h-4 w-4" />
        </button>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="Message…"
          className="flex-1 rounded-xl px-3 py-2 text-sm outline-none ring-1 ring-white/5 focus:ring-2 focus:ring-[color:var(--color-nearby-coral)] transition placeholder:text-[color:var(--color-nearby-dim)]"
          style={{ background: 'var(--color-nearby-surface-2)', color: 'var(--color-nearby-text)' }}
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          onClick={() => send(input)}
          disabled={!input.trim()}
          className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full disabled:opacity-40"
          style={{ background: 'var(--color-nearby-coral)' }}
        >
          <ArrowUp className="h-4 w-4" style={{ color: '#fff' }} />
        </motion.button>
      </div>
    </div>
  );
}
