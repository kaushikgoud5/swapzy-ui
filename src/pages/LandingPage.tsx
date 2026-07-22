import { Heart, X, Bookmark, Zap, Shield, Users, ArrowRight, Star, MapPin, ArrowLeftRight, CheckCircle, Clock, Globe } from 'lucide-react';
import { FloatingBackground } from '../components/FloatingBackground';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

export function LandingPage() {
  const navigate = useNavigate();
  const [currentCard, setCurrentCard] = useState(0);
  const [isSwipeDemo, setIsSwipeDemo] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const navBg = useTransform(scrollYProgress, [0, 0.05], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)']);

  const demoCards = [
    { title: 'Vintage Desk', price: '$120', location: 'Brooklyn, NY', gradient: 'from-amber-200 to-rose-200', emoji: '🪑' },
    { title: 'MacBook Pro', price: '$850', location: 'Manhattan, NY', gradient: 'from-blue-200 to-indigo-200', emoji: '💻' },
    { title: 'Road Bike', price: '$450', location: 'Queens, NY', gradient: 'from-emerald-200 to-teal-200', emoji: '🚴' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSwipeDemo(true);
      setTimeout(() => {
        setCurrentCard((prev) => (prev + 1) % demoCards.length);
        setIsSwipeDemo(false);
      }, 700);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { value: '50K+', label: 'Active Users' },
    { value: '120K', label: 'Items Traded' },
    { value: '4.9', label: 'App Rating' },
    { value: '<2min', label: 'Avg Match Time' },
  ];

  const testimonials = [
    { name: 'Alex M.', text: 'Sold my old desk in 10 minutes. Literally 10 minutes.', avatar: '🧑‍💻' },
    { name: 'Priya K.', text: 'Way better than marketplace groups. The swipe UX is addicting.', avatar: '👩‍🎨' },
    { name: 'Jordan T.', text: 'Found a like-new camera for half price. Instant match!', avatar: '📸' },
    { name: 'Sam R.', text: 'Moving dorms was painless. Sold everything in a weekend.', avatar: '🎒' },
    { name: 'Casey L.', text: 'The chat is instant. Met the seller same day. 10/10.', avatar: '⚡' },
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <FloatingBackground />

      {/* Sticky Navbar */}
      <motion.nav
        style={{ backgroundColor: navBg }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-transparent"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Swapzy</span>
          </div>
          <motion.button
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-medium shadow-md cursor-pointer"
          >
            Get Started
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero — Split Layout */}
      <section ref={heroRef} className="relative z-10 min-h-screen flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-20">
          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-purple-700 font-medium">Live in 50+ cities</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-6">
              <span className="text-gray-900">Trade stuff</span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                like never before
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 mb-8 max-w-lg leading-relaxed">
              Swipe through items near you. Match with sellers instantly. No fees, no hassle — just fast local trades.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <motion.button
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-medium shadow-xl shadow-purple-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                Start Swiping Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 bg-gray-50 border border-gray-200 text-gray-700 rounded-2xl font-medium flex items-center justify-center gap-2 cursor-pointer"
              >
                Watch Demo
                <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs">▶</span>
              </motion.button>
            </div>

            {/* Trust Row */}
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex -space-x-2">
                {['🧑‍💻', '👩‍🎨', '🧑‍🚀', '👩‍💼'].map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-sm">{e}</div>
                ))}
              </div>
              <span><strong className="text-gray-700">50,000+</strong> students already trading</span>
            </div>
          </motion.div>

          {/* Right — Phone Mockup with Swipe Demo */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end"
          >
            {/* Phone frame */}
            <div className="relative w-[300px] sm:w-[340px] h-[600px] sm:h-[680px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl shadow-purple-200/50">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-20" />
              <div className="w-full h-full bg-gray-50 rounded-[2.4rem] overflow-hidden relative">
                {/* Status bar */}
                <div className="h-12 bg-white flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-400">Discover</span>
                </div>

                {/* Card stack */}
                <div className="relative flex-1 p-4 h-[calc(100%-6rem)]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentCard}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={isSwipeDemo
                        ? { x: 200, rotate: 12, opacity: 0 }
                        : { scale: 1, opacity: 1, x: 0, rotate: 0 }
                      }
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      className="absolute inset-4 bg-white rounded-3xl shadow-xl overflow-hidden"
                    >
                      <div className={`h-3/5 bg-gradient-to-br ${demoCards[currentCard].gradient} flex items-center justify-center relative`}>
                        <span className="text-6xl">{demoCards[currentCard].emoji}</span>
                        {isSwipeDemo && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 bg-green-500/80 flex items-center justify-center"
                          >
                            <span className="text-white text-2xl font-bold border-4 border-white px-4 py-2 rounded-xl -rotate-12">LIKE!</span>
                          </motion.div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-semibold text-gray-900">{demoCards[currentCard].title}</h4>
                          <span className="text-purple-600 font-bold">{demoCards[currentCard].price}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
                          <MapPin className="w-3 h-3" />
                          <span>{demoCards[currentCard].location}</span>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 h-10 rounded-xl bg-red-50 flex items-center justify-center"><X className="w-4 h-4 text-red-400" /></div>
                          <div className="flex-1 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><Bookmark className="w-4 h-4 text-amber-400" /></div>
                          <div className="flex-1 h-10 rounded-xl bg-green-50 flex items-center justify-center"><Heart className="w-4 h-4 text-green-400" /></div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Bottom nav mock */}
                <div className="absolute bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-100 flex items-center justify-around px-6">
                  <ArrowLeftRight className="w-5 h-5 text-purple-600" />
                  <Bookmark className="w-5 h-5 text-gray-300" />
                  <Heart className="w-5 h-5 text-gray-300" />
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -left-4 top-20 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"><CheckCircle className="w-4 h-4 text-green-600" /></div>
              <div>
                <p className="text-xs font-medium text-gray-900">It's a match!</p>
                <p className="text-[10px] text-gray-400">2 seconds ago</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-4 bottom-32 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center"><Zap className="w-4 h-4 text-purple-600" /></div>
              <div>
                <p className="text-xs font-medium text-gray-900">Sold in 5 min</p>
                <p className="text-[10px] text-gray-400">Gaming Chair</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="relative z-10 py-16 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need</h2>
            <p className="text-lg text-gray-500">Built for speed, designed for delight</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Large card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 relative overflow-hidden group"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Lightning-fast matching</h3>
                <p className="text-gray-500 max-w-md">Our algorithm connects you with nearby buyers in seconds. Average match time is under 2 minutes.</p>
              </div>
              <motion.div
                className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-200/30 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </motion.div>

            {/* Small card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Safe & verified</h3>
              <p className="text-gray-500 text-sm">Verified profiles and in-app safety features for peace of mind.</p>
            </motion.div>

            {/* Small card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="p-8 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Hyper-local</h3>
              <p className="text-gray-500 text-sm">Find items within walking distance. No shipping needed.</p>
            </motion.div>

            {/* Large card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Zero fees, ever</h3>
                <p className="text-gray-500 max-w-md">No listing fees, no commission. Keep 100% of what you trade. We make money from optional premium features.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works — Timeline */}
      <section className="relative z-10 py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How it works</h2>
            <p className="text-lg text-gray-500">Three steps. That's it.</p>
          </motion.div>

          <div className="space-y-0">
            {[
              { step: '01', title: 'Swipe through items', desc: 'Browse what people near you are selling. Right to like, left to pass.', icon: ArrowLeftRight, color: 'from-purple-500 to-purple-600' },
              { step: '02', title: 'Match instantly', desc: 'When both parties like each other\'s items, you\'re matched and can chat.', icon: Heart, color: 'from-pink-500 to-rose-600' },
              { step: '03', title: 'Meet & trade', desc: 'Arrange a safe meetup, exchange items, and both walk away happy.', icon: CheckCircle, color: 'from-green-500 to-emerald-600' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex items-start gap-6 py-8 border-b border-gray-200 last:border-0"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Step {item.step}</span>
                  <h3 className="text-xl font-bold mt-1 mb-2">{item.title}</h3>
                  <p className="text-gray-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Marquee */}
      <section className="relative z-10 py-20 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 px-6"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Loved by students</h2>
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />)}
            <span className="ml-2 text-gray-500 text-sm">4.9 on App Store</span>
          </div>
        </motion.div>

        {/* Scrolling row */}
        <div className="relative">
          <motion.div
            animate={{ x: [0, -1200] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="flex gap-4 w-max"
          >
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="w-72 flex-shrink-0 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">"{t.text}"</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center bg-gradient-to-br from-purple-600 via-pink-600 to-rose-500 rounded-[2.5rem] p-12 md:p-16 relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full" />
              <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full" />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Ready to start trading?</h2>
              <p className="text-lg text-white/80 mb-8 max-w-md mx-auto">
                Join 50,000+ students who've already made the switch. Free forever.
              </p>
              <motion.button
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-purple-700 rounded-2xl font-semibold shadow-xl inline-flex items-center gap-2 cursor-pointer"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <p className="text-white/60 text-xs mt-4">No credit card required • Setup in 30 seconds</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <ArrowLeftRight className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">Swapzy</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <button className="hover:text-gray-700 transition-colors cursor-pointer">Privacy</button>
            <button className="hover:text-gray-700 transition-colors cursor-pointer">Terms</button>
            <button className="hover:text-gray-700 transition-colors cursor-pointer">Contact</button>
          </div>
          <p className="text-xs text-gray-400">© 2025 Swapzy. All rights reserved.</p>
        </div>
      </footer>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-3 sm:hidden">
        <motion.button
          onClick={() => navigate('/login')}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-medium shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          Get Started Free
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
