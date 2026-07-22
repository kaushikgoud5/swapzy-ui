import { motion } from "framer-motion";

export function FloatingBackground() {
  const floatingElements = [
    { icon: '🪑', x: '10%', y: '20%', duration: 20, delay: 0 },
    { icon: '💻', x: '80%', y: '15%', duration: 25, delay: 2 },
    { icon: '📚', x: '15%', y: '70%', duration: 22, delay: 4 },
    { icon: '🎨', x: '85%', y: '60%', duration: 18, delay: 1 },
    { icon: '🌿', x: '50%', y: '80%', duration: 24, delay: 3 },
    { icon: '📷', x: '70%', y: '40%', duration: 21, delay: 5 },
    { icon: '🚲', x: '25%', y: '45%', duration: 23, delay: 1.5 },
    { icon: '💡', x: '60%', y: '75%', duration: 19, delay: 2.5 },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-pink-200/20 rounded-full blur-3xl" />

      {/* Floating Icons */}
      {floatingElements.map((element, index) => (
        <motion.div
          key={index}
          className="absolute text-6xl opacity-15"
          style={{ left: element.x, top: element.y }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {element.icon}
        </motion.div>
      ))}
    </div>
  );
}
