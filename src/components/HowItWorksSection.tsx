import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Camera, MapPin, Heart, MessageCircle } from 'lucide-react';

const steps = [
  {
    n: '01',
    icon: Camera,
    iconColor: 'var(--color-nearby-coral)',
    title: 'Snap & list it',
    desc: 'Take a photo, drop a price, hit post. Your item is live in under a minute.',
  },
  {
    n: '02',
    icon: MapPin,
    iconColor: 'var(--color-nearby-blue)',
    title: 'Swipe nearby',
    desc: 'Buyers see items sorted by distance — closest first. No algorithm, no ads.',
  },
  {
    n: '03',
    icon: Heart,
    iconColor: 'var(--color-nearby-coral)',
    title: 'Like & match',
    desc: 'Buyer taps the heart. Seller gets a buzz. Chat opens. That\'s the whole thing.',
  },
  {
    n: '04',
    icon: MessageCircle,
    iconColor: 'var(--color-nearby-yellow)',
    title: 'Meet & grab it',
    desc: 'Agree on a spot, exchange cash in person. No fees, no shipping, no waiting.',
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const headerVariants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export function HowItWorksSection({ id }: { id?: string }) {
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll-driven parallax: section drifts up slightly as you scroll through it
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const blobOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.08, 0.08, 0]);

  return (
    <section
      id={id}
      ref={sectionRef}
      className="relative border-t border-white/5 py-24 px-5 sm:px-8 overflow-hidden"
      style={{ background: 'var(--color-nearby-bg)' }}
    >
      {/* Scroll-reactive ambient blob */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background: 'var(--color-nearby-coral)',
          opacity: blobOpacity,
          y,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* ── Header ── */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mb-16"
        >
          <p
            className="font-display text-sm uppercase tracking-[0.2em] mb-3"
            style={{ color: 'var(--color-nearby-coral)' }}
          >
            How it works
          </p>
          <h2
            className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl"
            style={{ color: 'var(--color-nearby-text)' }}
          >
            Four taps to a{' '}
            <span style={{ color: 'var(--color-nearby-coral)' }}>match.</span>
          </h2>
          <p
            className="mt-4 max-w-2xl text-base leading-relaxed sm:text-lg"
            style={{ color: 'var(--color-nearby-dim)' }}
          >
            No forms, no shipping labels, no weird fees. Just people near you getting rid of good stuff.
          </p>
        </motion.div>

        {/* ── Step cards ── */}
        <div className="relative">

          {/* Desktop connector line — sits behind the step number pills */}
          <div className="pointer-events-none absolute left-0 right-0 top-[22px] hidden h-px lg:block" style={{ background: 'rgba(255,255,255,0.05)' }} />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4"
          >
            {steps.map((step) => (
              <motion.div
                key={step.n}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="rounded-[24px] p-7 ring-1 ring-white/5"
                style={{ background: 'var(--color-nearby-surface)' }}
              >
                {/* Step number pill */}
                <span
                  className="inline-block rounded-full px-3 py-1 font-display text-xs font-semibold"
                  style={{
                    background: 'rgba(255,90,95,0.15)',
                    color: 'var(--color-nearby-coral)',
                  }}
                >
                  {step.n}
                </span>

                {/* Icon */}
                <div
                  className="mt-5 inline-flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    background: `color-mix(in srgb, ${step.iconColor} 15%, transparent)`,
                    color: step.iconColor,
                  }}
                >
                  <step.icon className="h-5 w-5" />
                </div>

                {/* Text */}
                <h3
                  className="mt-5 font-display text-xl font-bold"
                  style={{ color: 'var(--color-nearby-text)' }}
                >
                  {step.title}
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: 'var(--color-nearby-dim)' }}
                >
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
