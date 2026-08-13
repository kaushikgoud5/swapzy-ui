import { MapPin, Heart, MessageCircle, SquarePlus, Bell, User, Menu, House } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { authService } from '../services/authService';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from './Toast';
import { useUnreadNotifications } from '../utils/useUnreadNotifications';

const navItems = [
  { path: '/home/discover',       icon: House,         label: 'Discover' },
  { path: '/home/sell',           icon: SquarePlus,    label: 'Create' },
  { path: '/home/chat',           icon: MessageCircle, label: 'Chats',         badge: true },
  { path: '/home/notifications',  icon: Bell,          label: 'Notifications', badge: true },
  { path: '/home/profile',        icon: User,          label: 'Profile' },
];

const COLLAPSED_W = 72;
const EXPANDED_W  = 240;

export function Sidebar() {
  const navigate   = useNavigate();
  const { pathname } = useLocation();
  const { showToast } = useToast();
  const unreadCount   = useUnreadNotifications();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = async () => {
    await authService.logoutUser();
    showToast('Logged out', 'info');
    navigate('/login');
  };

  return (
    <motion.aside
      onHoverStart={() => setExpanded(true)}
      onHoverEnd={()   => setExpanded(false)}
      animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="hidden md:flex fixed left-0 top-0 bottom-0 flex-col z-50 overflow-hidden border-r border-white/5"
      style={{ background: '#0F1115' }}
    >
      {/* Logo */}
      <div
        className="flex items-center px-4 py-7 cursor-pointer flex-shrink-0"
        style={{ height: 72 }}
        onClick={() => navigate('/home/discover')}
      >
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'var(--color-nearby-coral)' }}
        >
          <MapPin className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="ml-3 font-display text-lg font-bold whitespace-nowrap overflow-hidden"
              style={{ color: 'var(--color-nearby-text)' }}
            >
              Nearby
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-2 justify-center">
        {navItems.map(({ path, icon: Icon, label, badge }, idx) => {
          const isActive = pathname.startsWith(path);
          const count    = badge ? unreadCount : 0;

          return (
            <button
              key={`${path}-${idx}`}
              onClick={() => navigate(path)}
              className="relative flex items-center rounded-xl px-3 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-nearby-coral)] group"
            >
              {/* Hover bg */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                style={{ background: 'rgba(255,255,255,0.05)' }} />

              {/* Icon + badge */}
              <div className="relative flex-shrink-0">
                <Icon
                  className="h-7 w-7"
                  strokeWidth={isActive ? 2.5 : 1.75}
                  fill="none"
                  style={{ color: isActive ? 'var(--color-nearby-coral)' : 'var(--color-nearby-text)' }}
                />
                {count > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                    style={{ background: '#ED4956' }}
                  >
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </div>

              {/* Label */}
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="ml-4 text-sm whitespace-nowrap overflow-hidden"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: isActive ? 700 : 400,
                      color: 'var(--color-nearby-text)',
                    }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      {/* More / logout */}
      <div className="px-3 pb-6 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="relative flex items-center rounded-xl px-3 py-4 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-nearby-coral)] group"
        >
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            style={{ background: 'rgba(255,255,255,0.05)' }} />
          <Menu
            className="h-7 w-7 flex-shrink-0"
            strokeWidth={1.75}
            style={{ color: 'var(--color-nearby-text)' }}
          />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="ml-4 text-sm whitespace-nowrap overflow-hidden"
                style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, color: 'var(--color-nearby-text)' }}
              >
                Log out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
