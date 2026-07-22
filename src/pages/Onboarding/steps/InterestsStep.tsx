import { motion } from "framer-motion";
import {
  Heart,
  Check,
  Armchair,
  Smartphone,
  Shirt,
  Book,
  Music,
  Gamepad2,
  Coffee,
  Bike,
} from "lucide-react";
import { useCategories } from "../../../hooks/useCategories";

const iconMap: Record<string, React.ComponentType<any>> = {
  Armchair, Smartphone, Shirt, Book, Music, Gamepad2, Coffee, Bike,
};

function InterestsStep({
  setFormData,
  formData,
}: {
  onNext: () => void;
  formData: any;
  setFormData: any;
}) {
  const { data: categories = [] } = useCategories();

  const toggleInterest = (id: number | string) => {
    const currentInterests: (number | string)[] = formData?.interests || [];
    const newInterests = currentInterests.includes(id)
      ? currentInterests.filter((i) => i !== id)
      : [...currentInterests, id];
    setFormData({ interests: newInterests });
  };

  const isSelected = (id: number | string) =>
    (formData?.interests || []).includes(id);

  return (
    <div>
      <motion.div
        key="interests"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <Heart className="w-12 h-12 mx-auto mb-4 text-purple-600" />
        <h2 className="text-3xl text-center mb-2">What are you into?</h2>
        <p className="text-muted-foreground text-center mb-8">
          Select at least 3 interests to personalize your feed
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((interest, index) => {
            const Icon = iconMap[interest.icon] || Heart;
            const hasImage = !!interest.imageUrl;
            return (
              <motion.button
                key={interest.id ?? index}
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleInterest(interest.id)}
                className={`relative p-4 rounded-2xl border-2 transition-all ${
                  isSelected(interest.id)
                    ? "border-purple-600 shadow-lg"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className={`w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center overflow-hidden ${
                    hasImage ? "" : `bg-gradient-to-br ${interest.gradient}`
                  }`}
                >
                  {hasImage ? (
                    <img
                      src={interest.imageUrl}
                      alt={interest.label}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon className="w-6 h-6 text-white" />
                  )}
                </div>
                <p className="text-sm">{interest.label}</p>

                {isSelected(interest.id) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {formData?.interests?.length || 0}/{categories.length} selected
        </p>
      </motion.div>
    </div>
  );
}

export default InterestsStep;
