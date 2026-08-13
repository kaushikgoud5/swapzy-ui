import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import { authService, commitAuth } from '../services/authService';
import { initGoogleLogin } from '../services/socialAuth';
import { useToast } from '../components/Toast';

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const token = useAppSelector((s) => s.auth.token);

  // Redirect already-authenticated users away from login page
  useEffect(() => {
    if (token) navigate('/home', { replace: true });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        const res = await authService.login({ email, password });
        showToast('Welcome back!', 'success');
        commitAuth(res);
        navigate('/home', { replace: true });
      } else {
        const res = await authService.signup({ email, password, name });
        showToast('Account created!', 'success');
        sessionStorage.setItem('showWelcome', '1');
        commitAuth(res);
        navigate('/welcome', { replace: true });
      }
    } catch (e) {
      console.log(e)
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const idToken = await initGoogleLogin();
      const res = await authService.socialLogin('google', idToken);
      showToast('Welcome!', 'success');
      commitAuth(res);
    } catch (e) {
      if (e instanceof Error && e.message !== 'Google sign-in was dismissed') {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full rounded-xl px-4 py-3 text-base placeholder:text-[color:var(--color-nearby-dim)] ring-1 ring-white/5 focus:ring-2 focus:ring-[color:var(--color-nearby-coral)] outline-none transition [&:-webkit-autofill]:![background-color:var(--color-nearby-surface-2)] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s] [&:-webkit-autofill]:![-webkit-text-fill-color:var(--color-nearby-text)]';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5"
      style={{ background: 'var(--color-nearby-bg)' }}
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[color:var(--color-nearby-coral)] opacity-[0.07] blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[color:var(--color-nearby-blue)] opacity-[0.07] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex flex-col items-center gap-3"
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ background: 'var(--color-nearby-coral)' }}
          >
            <MapPin className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--color-nearby-text)' }}>
              {isLogin ? 'Welcome back' : 'Join Nearby'}
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-nearby-dim)' }}>
              {isLogin ? 'Good to see you again.' : 'Find stuff two blocks away.'}
            </p>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[24px] p-7 ring-1 ring-white/5"
          style={{ background: 'var(--color-nearby-surface)' }}
        >
          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 rounded-xl px-4 py-3 text-sm ring-1"
                style={{
                  color: 'var(--color-nearby-coral)',
                  background: 'rgba(255,90,95,0.08)',
                  outline: '1px solid rgba(255,90,95,0.3)',
                }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete='off'>
            {/* Name field (signup only) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <label className="mb-1.5 block font-display text-sm font-semibold" style={{ color: 'var(--color-nearby-text)' }}>
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-nearby-dim)' }} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required={!isLogin}
                      className={inputClass + ' pl-10'}
                      style={{ background: 'var(--color-nearby-surface-2)', color: 'var(--color-nearby-text)' }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="mb-1.5 block font-display text-sm font-semibold" style={{ color: 'var(--color-nearby-text)' }}>
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-nearby-dim)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className={inputClass + ' pl-10'}
                  style={{ background: 'var(--color-nearby-surface-2)', color: 'var(--color-nearby-text)' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block font-display text-sm font-semibold" style={{ color: 'var(--color-nearby-text)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-nearby-dim)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className={inputClass + ' pl-10 pr-11'}
                  style={{ background: 'var(--color-nearby-surface-2)', color: 'var(--color-nearby-text)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--color-nearby-dim)' }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.03, boxShadow: loading ? undefined : '0 20px 45px -12px rgba(255,90,95,0.55)' }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-base font-semibold text-white disabled:opacity-60"
              style={{ background: 'var(--color-nearby-coral)', boxShadow: '0 12px 32px -10px rgba(255,90,95,0.6)' }}
            >
              {loading ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
              {!loading && <ArrowRight className="h-5 w-5" />}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-5 flex items-center">
            <div className="flex-1 border-t border-white/5" />
            <span className="mx-4 text-xs" style={{ color: 'var(--color-nearby-dim)' }}>or</span>
            <div className="flex-1 border-t border-white/5" />
          </div>

          {/* Google */}
          <motion.button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl py-3 text-sm font-display font-medium ring-1 ring-white/10 transition disabled:opacity-50"
            style={{ background: 'var(--color-nearby-surface-2)', color: 'var(--color-nearby-text)' }}
          >
            <GoogleIcon />
            Continue with Google
          </motion.button>

          {/* Toggle */}
          <p className="mt-5 text-center text-sm" style={{ color: 'var(--color-nearby-dim)' }}>
            {isLogin ? "Don't have an account? " : 'Already have one? '}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(null); setEmail(''); setPassword(''); setName(''); }}
              className="font-semibold underline-offset-4 hover:underline transition-colors"
              style={{ color: 'var(--color-nearby-coral)' }}
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
