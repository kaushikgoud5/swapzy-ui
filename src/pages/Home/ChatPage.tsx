import { motion } from 'framer-motion';
import { MessageCircle, Sparkles } from 'lucide-react';

export function ChatPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        className="max-w-md w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 mb-6"
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <MessageCircle className="w-12 h-12 text-purple-600" />
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          No Chats Yet
        </h2>

        <div className="space-y-4 text-muted-foreground">
          <p className="text-base sm:text-lg">
            Start swiping to discover amazing items! 
          </p>
          
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>When you and a seller both like an item, you'll be able to chat here</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>

          <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
            <h3 className="font-semibold text-purple-900 mb-2">How it works:</h3>
            <ol className="text-sm text-left space-y-2 text-purple-800">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-200 text-purple-900 flex items-center justify-center text-xs font-bold">1</span>
                <span>Swipe right on items you're interested in</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-200 text-purple-900 flex items-center justify-center text-xs font-bold">2</span>
                <span>If the seller likes your profile, it's a match!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-200 text-purple-900 flex items-center justify-center text-xs font-bold">3</span>
                <span>Start chatting and arrange your swap</span>
              </li>
            </ol>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
