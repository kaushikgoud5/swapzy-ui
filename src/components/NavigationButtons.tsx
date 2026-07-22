import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

function NavigationButtons({
  canProceed,
  onBack,
  onNext,
}: {
  step: number;
  canProceed: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      <div className="flex gap-3 mt-8">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl flex items-center gap-2 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </motion.button>

        <motion.button
          onClick={onNext}
          disabled={!canProceed}
          whileHover={canProceed ? { scale: 1.02 } : {}}
          whileTap={canProceed ? { scale: 0.98 } : {}}
          className={`cursor-pointer flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all ${
            canProceed
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}

export default NavigationButtons;
