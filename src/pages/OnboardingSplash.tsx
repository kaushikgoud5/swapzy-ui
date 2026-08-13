import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ease = [0.22, 1, 0.36, 1] as const;

const slides = [
  {
    blob: 'var(--color-nearby-coral)',
    headline: ['Good stuff is ', 'two blocks', ' away.'],
    sub: 'Real items from real neighbours. No shipping, no waiting — just walk over.',
    illustration: <Slide1Illustration />,
  },
  {
    blob: 'var(--color-nearby-blue)',
    headline: ['Swipe. Both tap the heart. ', 'Match', '.'],
    sub: 'When you both like it, a chat opens. No awkward cold messages.',
    illustration: <Slide2Illustration />,
  },
  {
    blob: 'var(--color-nearby-yellow)',
    headline: ['Chat, meet, ', 'grab it', '.'],
    sub: 'Agree on a spot nearby. Hand it over. Done — no fees, no fuss.',
    illustration: <Slide3Illustration />,
  },
];

function Slide1Illustration() {
  return (
    <div className="relative h-52 w-full flex items-center justify-center">
      {/* Mini swipe card stack */}
      {[12, 6, 0].map((rot, i) => (
        <motion.div
          key={i}
          animate={{ rotate: [rot, rot + 1.5, rot - 1.5, rot] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
          className="absolute w-36 h-48 rounded-[20px] ring-1 ring-white/8 flex flex-col overflow-hidden"
          style={{
            background: i === 0 ? 'var(--color-nearby-surface-2)' : 'var(--color-nearby-surface)',
            rotate: `${rot}deg`,
            zIndex: 3 - i,
            boxShadow: i === 0 ? '0 20px 60px -15px rgba(255,90,95,0.3)' : undefined,
          }}
        >
          <div className="flex-1" style={{ background: i === 0 ? 'rgba(255,90,95,0.08)' : 'rgba(255,255,255,0.03)' }}>
            <div className="m-3 h-3 w-16 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>
          <div className="p-3 space-y-1.5">
            <div className="h-2.5 w-20 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="h-2 w-12 rounded-full" style={{ background: 'rgba(255,90,95,0.4)' }} />
          </div>
        </motion.div>
      ))}
      {/* Distance pill */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-2 right-8 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-display"
        style={{ background: 'rgba(0,0,0,0.5)', color: 'var(--color-nearby-text)' }}
      >
        <MapPin className="h-3 w-3" style={{ color: 'var(--color-nearby-coral)' }} />
        0.3 km away
      </motion.div>
    </div>
  );
}

function Slide2Illustration() {
  const [burst, setBurst] = useState(false);
  return (
    <div className="relative h-52 w-full flex items-center justify-center gap-6">
      {/* Two avatars */}
      {[
        { bg: 'linear-gradient(135deg, var(--color-nearby-blue), var(--color-nearby-coral))', label: 'You' },
        { bg: 'linear-gradient(135deg, var(--color-nearby-coral), var(--color-nearby-yellow))', label: 'Seller' },
      ].map((a, i) => (
        <motion.div
          key={i}
          animate={{ x: burst ? (i === 0 ? 18 : -18) : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="h-16 w-16 rounded-full ring-2 ring-white/10" style={{ background: a.bg }} />
          <span className="text-xs font-display" style={{ color: 'var(--color-nearby-dim)' }}>{a.label}</span>
        </motion.div>
      ))}
      {/* Heart burst */}
      <motion.button
        onClick={() => setBurst(!burst)}
        animate={{ scale: burst ? [1, 1.3, 1] : 1 }}
        transition={{ duration: 0.4 }}
        className="absolute flex h-12 w-12 items-center justify-center rounded-full text-xl"
        style={{ background: 'var(--color-nearby-coral)', boxShadow: '0 0 30px rgba(255,90,95,0.5)' }}
      >
        ♥
      </motion.button>
      {burst && (
        <>
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{ x: Math.cos(angle) * 50, y: Math.sin(angle) * 50, opacity: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: i * 0.02, ease: 'easeOut' }}
                className="absolute h-2 w-2 rounded-full"
                style={{ background: 'var(--color-nearby-yellow)' }}
              />
            );
          })}
        </>
      )}
    </div>
  );
}

function Slide3Illustration() {
  const bubbles = [
    { text: 'Still available?', mine: false },
    { text: 'Yep! Can do £15', mine: true },
    { text: 'Meet at the park?', mine: false },
    { text: '✓ See you at 3pm', mine: true },
  ];
  return (
    <div className="h-52 w-full flex flex-col justify-center gap-2 px-4">
      {bubbles.map((b, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: b.mine ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15, duration: 0.4, ease }}
          className={`max-w-[70%] rounded-2xl px-3 py-2 text-xs font-sans ${b.mine ? 'ml-auto rounded-br-sm' : 'rounded-bl-sm'}`}
          style={{
            background: b.mine ? 'var(--color-nearby-coral)' : 'var(--color-nearby-surface-2)',
            color: b.mine ? '#fff' : 'var(--color-nearby-text)',
          }}
        >
          {b.text}
        </motion.div>
      ))}
    </div>
  );
}

export function OnboardingSplash() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const navigate = useNavigate();
  const dragX = useMotionValue(0);
  const dragOpacity = useTransform(dragX, [-80, 0, 80], [0.6, 1, 0.6]);

  useEffect(() => {
    sessionStorage.removeItem('showWelcome');
  }, []);
  const go = (next: number) => {
    setDir(next > index ? 1 : -1);
    setIndex(next);
  };

  const handleNext = () => {
    if (index < slides.length - 1) go(index + 1);
    else navigate('/home');
  };

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x < -80 && index < slides.length - 1) go(index + 1);
    else if (info.offset.x > 80 && index > 0) go(index - 1);
    dragX.set(0);
  };

  const slide = slides[index];

  return (
    <div
      className="relative min-h-dvh overflow-hidden flex flex-col"
      style={{ background: 'var(--color-nearby-bg)' }}
    >
      {/* Ambient blob */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-3xl opacity-[0.08] transition-colors duration-700"
        style={{ background: slide.blob }}
      />

      {/* Skip */}
      <div className="relative z-10 flex justify-end px-6 pt-14">
        <button
          onClick={() => navigate('/home')}
          className="font-display text-sm"
          style={{ color: 'var(--color-nearby-dim)' }}
        >
          Skip
        </button>
      </div>

      {/* Slide content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={index}
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: d * 24, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d * -24, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ opacity: dragOpacity }}
            className="w-full max-w-sm flex flex-col items-center text-center cursor-grab active:cursor-grabbing"
          >
            {/* Illustration */}
            <div className="w-full mb-8">{slide.illustration}</div>

            {/* Headline */}
            <h1
              className="font-display font-bold leading-[1.05] tracking-tight mb-4"
              style={{ fontSize: 'clamp(2rem, 8vw, 2.75rem)', color: 'var(--color-nearby-text)' }}
            >
              {slide.headline[0]}
              <span style={{ color: 'var(--color-nearby-coral)' }}>{slide.headline[1]}</span>
              {slide.headline[2]}
            </h1>

            {/* Sub */}
            <p
              className="text-base max-w-sm leading-relaxed"
              style={{ color: 'var(--color-nearby-dim)' }}
            >
              {slide.sub}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 pb-12 pt-4">
        {/* Dots */}
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => go(i)}
              animate={{ width: i === index ? 24 : 6 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="h-1.5 rounded-full cursor-pointer"
              style={{ background: i === index ? 'var(--color-nearby-coral)' : 'rgba(255,255,255,0.15)' }}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.button
          onClick={handleNext}
          whileHover={{ scale: 1.03, boxShadow: '0 20px 45px -12px rgba(255,90,95,0.55)' }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className="flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-base font-semibold"
          style={{ background: 'var(--color-nearby-coral)', color: '#fff', boxShadow: '0 12px 32px -10px rgba(255,90,95,0.6)' }}
        >
          {index === slides.length - 1 ? "Let's go" : 'Next'}
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );
}
