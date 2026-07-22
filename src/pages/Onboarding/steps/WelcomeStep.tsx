import { motion } from "framer-motion";
import { ArrowRight, Heart, MapPin, Sparkles, User } from "lucide-react";

function WelcomeStep(props: { onNext: () => void, formData : any, setFormData: any }) {
  return (
    <div>
      <motion.div
        key="welcome"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="text-center"
      >
        <motion.div
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 2,
          }}
          className="inline-block mb-6"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        <h2 className="text-4xl mb-4">Let's set up your profile!</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
          This will only take a minute. We'll help you find the best matches.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
          {[
            {
              icon: User,
              label: "Create avatar",
              color: "from-purple-500 to-purple-600",
            },
            {
              icon: Heart,
              label: "Pick interests",
              color: "from-pink-500 to-pink-600",
            },
            {
              icon: MapPin,
              label: "Set location",
              color: "from-blue-500 to-blue-600",
            },
            {
              icon: Sparkles,
              label: "Start swiping",
              color: "from-amber-500 to-amber-600",
            },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100"
            >
              <div
                className={`w-10 h-10 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center flex-shrink-0`}
              >
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-left">{item.label}</span>
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={props.onNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full max-w-md py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2 group"
        >
          Let's go!
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>
    </div>
  );
}

export default WelcomeStep;
