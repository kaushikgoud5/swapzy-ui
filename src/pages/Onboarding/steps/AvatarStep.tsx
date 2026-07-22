import { motion } from "framer-motion";
import { Camera, Check } from "lucide-react";
import { ImageWithFallback } from "../../../utils/ImageWithFallback";
import { avatarOptions } from "../../../data/avatarOptions";

function AvatarStep({
  formData,
  setFormData,
}: {
  onNext: () => void;
  formData: any;
  setFormData: any;
}) {
  const selectedAvatar = formData.avatar;
  return (
    <div>
      <motion.div
        key="avatar"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="text-center"
      >
        <Camera className="w-12 h-12 mx-auto mb-4 text-purple-600" />
        <h2 className="text-3xl mb-2">Pick your avatar</h2>
        <p className="text-muted-foreground mb-8">
          Choose one that represents you
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {avatarOptions.map((avatar, index) => (
            <motion.button
              key={avatar}
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFormData({ avatar: avatar })}
              className={`relative aspect-square rounded-2xl overflow-hidden border-4 transition-all ${
                selectedAvatar === avatar
                  ? "border-purple-600 shadow-lg"
                  : "border-transparent hover:border-gray-200"
              }`}
            >
              <ImageWithFallback
                src={avatar}
                alt={`Avatar ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {selectedAvatar === avatar && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 bg-purple-600/20 flex items-center justify-center"
                >
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default AvatarStep;
