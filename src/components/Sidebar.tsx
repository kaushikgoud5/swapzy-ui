import { ArrowLeftRight, MessageCircle, User, PlusCircle, LogOut, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from './Toast';
import { useUnreadNotifications } from '../utils/useUnreadNotifications';

export function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { showToast } = useToast();
  const unreadCount = useUnreadNotifications();

  const handleLogout = async () => {
    await authService.logoutUser();
    showToast('Logged out successfully', 'info');
    navigate('/login');
  };

  const navItems = [
    { path: '/home/discover', icon: ArrowLeftRight, label: 'Discover' },
    { path: '/home/sell', icon: PlusCircle, label: 'Sell' },
    { path: '/home/chat', icon: MessageCircle, label: 'Chats' },
    { path: '/home/notifications', icon: Bell, label: 'Notifications' },
    { path: '/home/profile', icon: User, label: 'Profile' },
  ];

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-gray-100 shadow-sm flex-col z-40">
      {/* Logo */}
      <div className="p-8 ">
        <motion.div 
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="relative">
            <motion.div 
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg"
              animate={{ 
                boxShadow: [
                  "0 10px 25px rgba(147, 51, 234, 0.3)",
                  "0 10px 35px rgba(236, 72, 153, 0.4)",
                  "0 10px 25px rgba(147, 51, 234, 0.3)",
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowLeftRight className="w-6 h-6 text-white" />
            </motion.div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Swapzy
            </h1>
            <p className="text-xs text-muted-foreground">Swap smarter</p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <button key={item.path} onClick={() => navigate(item.path)} className="relative w-full group">
                <motion.div
                  className={`cursor-pointer flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600' 
                      : 'text-muted-foreground hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="relative">
                    <Icon 
                      className={`w-6 h-6 ${isActive ? 'text-purple-600' : 'text-muted-foreground'}`}
                      fill="none"
                    />
                    {isActive && (
                      <motion.div
                        layoutId="sidebarActiveIndicator"
                        className="absolute -left-8 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </div>
                  
                  <span className={`font-medium ${isActive ? 'text-purple-600' : ''}`}>
                    {item.label}
                  </span>

                    {item.path === '/home/notifications' && unreadCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}

                  {isActive && item.path !== '/home/notifications' && (
                    <motion.div
                      className="ml-auto w-2 h-2 bg-purple-600 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    />
                  )}
                </motion.div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-6 space-y-3">
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
          <p className="text-xs text-purple-800 font-medium mb-1">💡 Pro Tip</p>
          <p className="text-xs text-purple-700">
            Swipe up to save items for later!
          </p>
        </div>
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Log out</span>
        </motion.button>
      </div>
    </aside>
  );
}
