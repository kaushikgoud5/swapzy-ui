import { Heart, X, Bookmark, Zap, Shield, Users, ArrowRight, MapPin, ArrowLeftRight, CheckCircle, MessageCircle } from 'lucide-react';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

const demoCards = [
  { title: 'Vintage Desk',  price: '₹4,200', location: 'Koramangala', gradient: 'from-amber-900/60 to-stone-900/60',   emoji: '🪑' },
  { title: 'MacBook Pro',   price: '₹62,000', location: 'Indiranagar',  gradient: 'from-slate-800/80 to-zinc-900/80',   emoji: '💻' },
  { title: 'Road Bike',     price: '₹8,500',  location: 'HSR Layout',   gradient: 'from-emerald-900/60 to-teal-900/60', emoji: '🚴' },
];

const features = [
  { icon: Zap,     title: 'Instant notifications',  desc: 'Sellers get buzzed the moment someone likes their item. Average response under 2 min.', span: 'md:col-span-4', color: 'var(--color-nearby-coral)' },
  { icon: Shield,  title: 'Verified profiles',       desc: 'Real people, real items. No bots, no ghost listings.',                                  span: 'md:col-span-2', color: 'var(--color-nearby-blue)' },
  { icon: MapPin,  title: 'Two blocks away',         desc: 'Hyper-local feed. No shipping, no waiting. Walk over.',                                  span: 'md:col-span-2', color: 'var(--color-nearby-yellow)' },
  { icon: Users,   title: 'Zero fees, ever',         desc: 'No listing fees, no commission. Keep everything you make.',                              span: 'md:col-span-4', color: 'var(--color-nearby-coral)' },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [currentCard, setCurrentCard] = useState(0);
  const [isSwipeDemo, setIsSwipeDemo] = useState(false);
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 60], ['rgba(15,17,21,0)', 'rgba(15,17,21,0.92)']);
  const navBorder = useTransform(scrollY, [0, 60], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.05)']);
  const heroRef = useRef<HTMLDivElement>(null);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const navLinks: { label: string; id: string }[] = [
    { label: 'How it works', id: 'how-it-works' },
    { label: 'Features',     id: 'features' },
    { label: 'For sellers',  id: 'for-sellers' },
  ];

  useEffect(() => {
    const id = setInterval(() => {
      setIsSwipeDemo(true);
      setTimeout(() => {
        setCurrentCard((p) => (p + 1) % demoCards.length);
        setIsSwipeDemo(false);
      }, 700);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-nearby-bg)', color: 'var(--color-nearby-text)' }}>

      {/* ── Sticky nav ── */}
      <motion.nav
        style={{ backgroundColor: navBg, borderBottomColor: navBorder }}
        className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'var(--color-nearby-coral)' }}>
              <MapPin className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-bold" style={{ color: 'var(--color-nearby-text)' }}>Nearby</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="font-display text-sm transition-colors hover:text-white"
                style={{ color: 'var(--color-nearby-dim)' }}
              >
                {label}
              </button>
            ))}
          </div>
          <motion.button
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.03, boxShadow: '0 20px 45px -12px rgba(255,90,95,0.55)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className="inline-flex items-center gap-1.5 rounded-2xl px-5 py-2.5 font-display text-sm font-semibold text-white"
            style={{ background: 'var(--color-nearby-coral)', boxShadow: '0 12px 32px -10px rgba(255,90,95,0.6)' }}
          >
            Get started
          </motion.button>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative min-h-screen pt-16 flex items-center">
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 right-0 h-[560px] w-[560px] rounded-full opacity-[0.07] blur-3xl" style={{ background: 'var(--color-nearby-coral)' }} />
          <div className="absolute bottom-0 -left-40 h-[480px] w-[480px] rounded-full opacity-[0.07] blur-3xl" style={{ background: 'var(--color-nearby-blue)' }} />
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:gap-20">
          {/* Left copy */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="show"
          >
            {/* Eyebrow */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 ring-1 ring-white/10" style={{ background: 'var(--color-nearby-surface)' }}>
              <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: 'var(--color-nearby-coral)' }} />
              <span className="font-display text-sm uppercase tracking-[0.2em]" style={{ color: 'var(--color-nearby-coral)' }}>Live in 50+ cities</span>
            </div>

            <h1
              className="font-display font-bold leading-[0.95] tracking-[-0.03em] mb-6"
              style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)', color: 'var(--color-nearby-text)' }}
            >
              Find it.<br />
              Buy it.<br />
              <span style={{ color: 'var(--color-nearby-coral)' }}>Walk over.</span>
            </h1>

            <p className="mb-8 max-w-lg text-lg leading-relaxed sm:text-xl" style={{ color: 'var(--color-nearby-dim)' }}>
              Swipe through items near you. Like something — the seller gets notified instantly. Chat, agree, meet up. No fees. No shipping. Just local.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <motion.button
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.03, boxShadow: '0 20px 45px -12px rgba(255,90,95,0.55)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 font-display text-base font-semibold text-white"
                style={{ background: 'var(--color-nearby-coral)', boxShadow: '0 12px 32px -10px rgba(255,90,95,0.6)' }}
              >
                Start swiping free <ArrowRight className="h-5 w-5" />
              </motion.button>
              <button
                onClick={() => scrollTo('how-it-works')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 font-display text-base font-medium underline-offset-4 hover:underline transition-colors"
                style={{ color: 'var(--color-nearby-dim)' }}
              >
                See how it works
              </button>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-3 text-sm" style={{ color: 'var(--color-nearby-dim)' }}>
              <div className="flex -space-x-2">
                {['#FF5A5F','#3D8BFF','#FFD23F','#FF5A5F'].map((c, i) => (
                  <div key={i} className="h-8 w-8 rounded-full ring-2 ring-[#0F1115]" style={{ background: `linear-gradient(135deg, ${c}, #1B1F27)` }} />
                ))}
              </div>
              <span><strong style={{ color: 'var(--color-nearby-text)' }}>50,000+</strong> people already trading nearby</span>
            </div>
          </motion.div>

          {/* Right — phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center lg:justify-end"
          >
            {/* Phone frame */}
            <div className="relative h-[600px] w-[300px] rounded-[3rem] p-3 shadow-2xl sm:h-[660px] sm:w-[320px]" style={{ background: '#0a0a0a' }}>
              <div className="absolute left-1/2 top-0 z-20 h-7 w-28 -translate-x-1/2 rounded-b-2xl" style={{ background: '#0a0a0a' }} />
              <div className="relative h-full w-full overflow-hidden rounded-[2.4rem]" style={{ background: 'var(--color-nearby-bg)' }}>
                {/* Status bar */}
                <div className="flex h-12 items-center justify-center border-b border-white/5" style={{ background: 'var(--color-nearby-surface)' }}>
                  <span className="font-display text-xs font-semibold" style={{ color: 'var(--color-nearby-dim)' }}>Discover</span>
                </div>

                {/* Card stack */}
                <div className="relative flex-1 p-4" style={{ height: 'calc(100% - 7rem)' }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentCard}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={isSwipeDemo
                        ? { x: 180, rotate: 14, opacity: 0 }
                        : { scale: 1, opacity: 1, x: 0, rotate: 0 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ duration: 0.45, ease: 'easeInOut' }}
                      className="absolute inset-4 overflow-hidden rounded-[24px] ring-1 ring-white/5"
                      style={{ background: 'var(--color-nearby-surface)', boxShadow: '0 20px 60px -15px rgba(255,90,95,0.3)' }}
                    >
                      {/* Image area */}
                      <div className={`relative flex h-[58%] items-center justify-center bg-gradient-to-br ${demoCards[currentCard].gradient}`}>
                        <span className="text-6xl">{demoCards[currentCard].emoji}</span>
                        {isSwipeDemo && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ background: 'rgba(255,90,95,0.85)' }}
                          >
                            <span className="font-display text-xl font-bold -rotate-12 rounded-xl border-4 border-white px-4 py-2 text-white">LIKE</span>
                          </motion.div>
                        )}
                        {/* Distance pill */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs backdrop-blur" style={{ background: 'rgba(0,0,0,0.5)', color: 'var(--color-nearby-text)' }}>
                          <MapPin className="h-3 w-3" />
                          {demoCards[currentCard].location}
                        </div>
                      </div>
                      {/* Info */}
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-display text-base font-bold" style={{ color: 'var(--color-nearby-text)' }}>{demoCards[currentCard].title}</span>
                          <span className="font-display text-base font-bold" style={{ color: 'var(--color-nearby-coral)' }}>{demoCards[currentCard].price}</span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <div className="flex h-9 flex-1 items-center justify-center rounded-xl ring-1 ring-white/5" style={{ background: 'var(--color-nearby-surface-2)' }}><X className="h-4 w-4" style={{ color: 'var(--color-nearby-dim)' }} /></div>
                          <div className="flex h-9 flex-1 items-center justify-center rounded-xl ring-1 ring-white/5" style={{ background: 'var(--color-nearby-surface-2)' }}><Bookmark className="h-4 w-4" style={{ color: 'var(--color-nearby-yellow)' }} /></div>
                          <div className="flex h-9 flex-1 items-center justify-center rounded-xl" style={{ background: 'var(--color-nearby-coral)' }}><Heart className="h-4 w-4 text-white" /></div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Bottom nav mock */}
                <div className="absolute inset-x-0 bottom-0 flex h-14 items-center justify-around border-t border-white/5 px-6" style={{ background: 'var(--color-nearby-surface)' }}>
                  <MapPin className="h-5 w-5" style={{ color: 'var(--color-nearby-coral)' }} />
                  <Bookmark className="h-5 w-5" style={{ color: 'var(--color-nearby-dim)' }} />
                  <MessageCircle className="h-5 w-5" style={{ color: 'var(--color-nearby-dim)' }} />
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -left-4 top-24 flex items-center gap-2.5 rounded-2xl p-3 ring-1 ring-white/10"
              style={{ background: 'var(--color-nearby-surface)' }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: 'rgba(255,210,63,0.15)' }}>
                <CheckCircle className="h-4 w-4" style={{ color: 'var(--color-nearby-yellow)' }} />
              </div>
              <div>
                <p className="font-display text-xs font-semibold" style={{ color: 'var(--color-nearby-text)' }}>Seller notified!</p>
                <p className="text-[10px]" style={{ color: 'var(--color-nearby-dim)' }}>2 seconds ago</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-4 bottom-36 flex items-center gap-2.5 rounded-2xl p-3 ring-1 ring-white/10"
              style={{ background: 'var(--color-nearby-surface)' }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: 'rgba(255,90,95,0.15)' }}>
                <Zap className="h-4 w-4" style={{ color: 'var(--color-nearby-coral)' }} />
              </div>
              <div>
                <p className="font-display text-xs font-semibold" style={{ color: 'var(--color-nearby-text)' }}>Sold in 4 min</p>
                <p className="text-[10px]" style={{ color: 'var(--color-nearby-dim)' }}>Gaming Chair</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section id="for-sellers" className="border-t border-white/5 py-16">
        <motion.div
          variants={sectionVariants} initial="hidden" whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 sm:px-8 md:grid-cols-4"
        >
          {[
            { value: '50K+',  label: 'Active users' },
            { value: '120K',  label: 'Items traded' },
            { value: '4.9',   label: 'App rating' },
            { value: '<2 min', label: 'Avg response' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-bold md:text-4xl" style={{ color: 'var(--color-nearby-coral)' }}>{s.value}</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--color-nearby-dim)' }}>{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      <HowItWorksSection id="how-it-works" />

      {/* ── Features bento ── */}
      <section id="features" className="border-t border-white/5 py-24 px-5 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={sectionVariants} initial="hidden" whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mb-16"
          >
            <p className="font-display text-sm uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--color-nearby-coral)' }}>Features</p>
            <h2 className="font-display text-4xl font-bold tracking-tight sm:text-6xl" style={{ color: 'var(--color-nearby-text)' }}>
              Everything you need.<br />Nothing you don't.
            </h2>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-6">
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={sectionVariants} initial="hidden" whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className={`rounded-[24px] p-7 ring-1 ring-white/5 ${f.span}`}
                style={{ background: 'var(--color-nearby-surface)' }}
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${f.color}20`, color: f.color }}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display mt-5 text-xl font-bold" style={{ color: 'var(--color-nearby-text)' }}>{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-nearby-dim)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-white/5 py-24 px-5 sm:px-8">
        <motion.div
          variants={sectionVariants} initial="hidden" whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="relative mx-auto max-w-4xl overflow-hidden rounded-[28px] p-12 text-center ring-1 ring-white/5 md:p-16"
          style={{ background: 'var(--color-nearby-surface)' }}
        >
          {/* Blobs inside CTA */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-[0.08] blur-3xl" style={{ background: 'var(--color-nearby-coral)' }} />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full opacity-[0.08] blur-3xl" style={{ background: 'var(--color-nearby-blue)' }} />
          </div>
          <div className="relative z-10">
            <p className="font-display text-sm uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--color-nearby-coral)' }}>Ready?</p>
            <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl mb-4" style={{ color: 'var(--color-nearby-text)' }}>
              Your neighbour is selling<br />something you want.
            </h2>
            <p className="mb-8 text-lg" style={{ color: 'var(--color-nearby-dim)' }}>
              Free forever. No credit card. Setup in 30 seconds.
            </p>
            <motion.button
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.03, boxShadow: '0 20px 45px -12px rgba(255,90,95,0.55)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 font-display text-base font-semibold text-white"
              style={{ background: 'var(--color-nearby-coral)', boxShadow: '0 12px 32px -10px rgba(255,90,95,0.6)' }}
            >
              Create free account <ArrowRight className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 px-5 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: 'var(--color-nearby-coral)' }}>
              <MapPin className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-sm font-bold" style={{ color: 'var(--color-nearby-text)' }}>Nearby</span>
          </div>
          <div className="flex gap-6 text-sm" style={{ color: 'var(--color-nearby-dim)' }}>
            {['Privacy', 'Terms', 'Contact'].map((l) => (
              <button key={l} className="transition-colors hover:text-white">{l}</button>
            ))}
          </div>
          <p className="text-xs" style={{ color: 'var(--color-nearby-dim)' }}>© 2025 Nearby. All rights reserved.</p>
        </div>
      </footer>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 p-3 backdrop-blur-xl sm:hidden" style={{ background: 'rgba(15,17,21,0.95)' }}>
        <motion.button
          onClick={() => navigate('/login')}
          whileTap={{ scale: 0.97 }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-sm font-semibold text-white"
          style={{ background: 'var(--color-nearby-coral)' }}
        >
          Get started free <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );
}
