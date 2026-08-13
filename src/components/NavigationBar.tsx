import { motion } from 'framer-motion';
import { MapPin, User, MessageCircle, PlusCircle, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUnreadNotifications } from '../utils/useUnreadNotifications';

const navItems = [
  { path: '/home/discover',       icon: MapPin,        label: 'Discover' },
  { path: '/home/sell',           icon: PlusCircle,    label: 'Sell' },
  { path: '/home/chat',           icon: MessageCircle, label: 'Chats' },
  { path: '/home/notifications',  icon: Bell,          label: 'Alerts' },
  { path: '/home/profile',        icon: User,          label: 'Profile' },
];

export function NavigationBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const unreadCount = useUnreadNotifications();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-white/5 pb-[env(safe-area-inset-bottom)] md:hidden backdrop-blur-xl"
      style={{ background: 'rgba(27,31,39,0.92)' }}
    >
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = pathname.startsWith(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 h-full focus-visible:outline-none"
            >
              <div className="relative">
                <motion.div
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: isActive ? 'var(--color-nearby-coral)' : 'var(--color-nearby-dim)' }}
                  />
                </motion.div>
                {path === '/home/notifications' && unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: 'var(--color-nearby-coral)' }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="bottomNavDot"
                    className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
                    style={{ background: 'var(--color-nearby-coral)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </div>
              <span
                className="text-[10px] font-display font-medium"
                style={{ color: isActive ? 'var(--color-nearby-coral)' : 'var(--color-nearby-dim)' }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
