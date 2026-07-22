import { motion } from "framer-motion";
import { User } from "lucide-react";

function InfoStep({setFormData, formData}: {
  onNext: () => void;
  formData: any;
  setFormData: any;
}) {
  const name = formData.name;
  const bio = formData.bio;
  return (
    <div>
      <motion.div
        key="info"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <User className="w-12 h-12 mx-auto mb-4 text-purple-600" />
        <h2 className="text-3xl text-center mb-2">Tell us about yourself</h2>
        <p className="text-muted-foreground text-center mb-8">
          Help others get to know you
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm mb-2">Display Name *</label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="text"
              value={name}
              onChange={(e) => setFormData({ name: e.target.value })}
              placeholder="What should we call you?"
              className="w-full px-4 py-3 bg-input-background rounded-2xl border border-transparent focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Bio (Optional)</label>
            <motion.textarea
              whileFocus={{ scale: 1.01 }}
              value={bio}
              onChange={(e) => setFormData({bio: e.target.value })}
              placeholder="A fun fact about you..."
              rows={4}
              className="w-full px-4 py-3 bg-input-background rounded-2xl border border-transparent focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all resize-none"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default InfoStep;
