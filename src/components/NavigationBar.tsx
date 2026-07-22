import { motion } from "framer-motion";
import { ArrowLeftRight, User, MessageCircle, PlusCircle, Bell } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUnreadNotifications } from "../utils/useUnreadNotifications";

export function NavigationBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const unreadCount = useUnreadNotifications();

  const navItems = [
    { path: '/home/discover', icon: ArrowLeftRight, label: 'Discover' },
    { path: '/home/sell', icon: PlusCircle, label: 'Sell' },
    { path: '/home/notifications', icon: Bell, label: 'Alerts' },
    { path: '/home/chat', icon: MessageCircle, label: 'Chats' },
    { path: '/home/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-border md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <button key={item.path} onClick={() => navigate(item.path)} className="relative flex flex-col items-center justify-center flex-1 h-full">
              <div className="relative">
                <motion.div
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-muted-foreground'}`}
                    fill="none"
                  />
                </motion.div>

                {item.path === '/home/notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}

                {isActive && (
                  <motion.div
                    layoutId="bottomNavDot"
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </div>

              <span className={`text-[10px] mt-1 ${isActive ? 'text-purple-600 font-medium' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
