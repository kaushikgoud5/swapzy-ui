import { useState, useEffect } from "react";
import { FloatingBackground } from "../components/FloatingBackground";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Sparkles, Lock, EyeOff, Eye, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store";
import { authService, commitAuth } from "../services/authService";
import { initGoogleLogin } from "../services/socialAuth";
import { useToast } from "../components/Toast";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { showToast } = useToast();
  const token = useAppSelector((s) => s.auth.token);

  useEffect(() => {
    if (token) navigate("/home", { replace: true });
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        const res = await authService.login({ email, password });
        commitAuth(res);
        showToast('Welcome to Swapzy!', 'success');
        navigate("/home");
      } else {
        await authService.signup({ email, password, name });
        const res = await authService.login({ email, password });
        commitAuth(res);
        showToast('Account created! Please complete your profile.', 'success');
        navigate("/profile");
      }
    } catch (e) {
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
      commitAuth(res);
      showToast('Welcome to Swapzy!', 'success');
      navigate("/home");
    } catch (e) {
      if (e instanceof Error && e.message !== 'Google sign-in was dismissed') {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      <FloatingBackground />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block mb-4"
          >
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {isLogin ? "Welcome back!" : "Join the vibe"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isLogin ? "Log in to continue swiping" : "Create your account in seconds"}
          </p>
        </motion.div>

        {/* Main Auth Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 opacity-20 -z-10 blur-xl" />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm mb-2 text-foreground">Full Name</label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 bg-input-background rounded-2xl border border-transparent focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                      required={!isLogin}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-sm mb-2 text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-3 bg-input-background rounded-2xl border border-transparent focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 bg-input-background rounded-2xl border border-transparent focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {isLogin && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-right">
                    <button type="button" className="cursor-pointer text-sm text-purple-600 hover:text-purple-700 transition-colors">
                      Forgot password?
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="cursor-pointer w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2 group disabled:opacity-70"
              >
                {loading ? "Please wait..." : isLogin ? "Log in" : "Create account"}
                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </motion.button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 text-muted-foreground">or continue with</span>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={handleGoogleLogin}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <GoogleIcon />
              <span className="text-sm font-medium">Continue with Google</span>
            </motion.button>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setError(null); }}
                  className="cursor-pointer text-purple-600 hover:text-purple-700 transition-colors"
                >
                  {isLogin ? "Sign up" : "Log in"}
                </button>
              </p>
            </motion.div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xs text-center text-muted-foreground mt-6"
        >
          By continuing, you agree to our{" "}
          <button className="underline hover:text-foreground transition-colors cursor-pointer">Terms</button>{" "}
          and{" "}
          <button className="underline hover:text-foreground transition-colors cursor-pointer">Privacy Policy</button>
        </motion.p>
      </div>
    </div>
  );
}
