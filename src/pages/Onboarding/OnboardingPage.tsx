import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FloatingBackground } from "../../components/FloatingBackground";
import WelcomeStep from "./steps/WelcomeStep";
import AvatarStep from "./steps/AvatarStep";
import InfoStep from "./steps/InfoStep";
import InterestsStep from "./steps/InterestsStep";
import LocationStep from "./steps/LocationStep";
import CompleteStep from "./steps/CompleteStep";
import ProgressBar from "../../components/ProgressBar";
import NavigationButtons from "../../components/NavigationButtons";
import { useNavigate } from "react-router-dom";
import { profileService } from "../../services/profileService";
import type { OnboardingRequestDto, OnboardingLocationDto } from "../../types/dto";

const STEPS = [
  { key: "welcome", component: WelcomeStep },
  { key: "avatar", component: AvatarStep },
  { key: "info", component: InfoStep },
  { key: "interests", component: InterestsStep },
  { key: "location", component: LocationStep },
  { key: "complete", component: CompleteStep },
];

type ProfileDraft = { avatar: string; name: string; bio: string; interests: number[]; location: OnboardingLocationDto };
const profileInitial: ProfileDraft = { avatar: '', name: '', bio: '', interests: [], location: { country: '', state: '', city: '' } };

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<ProfileDraft>(profileInitial);
  const navigate = useNavigate();
  const CurrentStepComponent = STEPS[currentStep]?.component;

  const handleComplete = async () => {
    try {
      const dto: OnboardingRequestDto = {
        avatarUrl: profile.avatar,
        displayName: profile.name,
        bio: profile.bio,
        preferredCategoryIds: profile.interests,
        location: profile.location,
      };
      await profileService.submitOnboarding(dto);
      navigate("/home");
    } catch (err) {
      console.error("Failed to submit profile:", err);
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      <FloatingBackground />
      <div className="relative z-10 w-full max-w-2xl">
        {STEPS[currentStep]?.key !== "welcome" &&
          STEPS[currentStep]?.key !== "complete" && (
            <ProgressBar currentStep={currentStep} totalSteps={STEPS.length} />
          )}

        <motion.div
          layout
          className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 opacity-20 -z-10 blur-xl" />

          <AnimatePresence mode="wait">
            <CurrentStepComponent
              formData={profile}
              setFormData={(data: any) => setProfile((prev) => ({ ...prev, ...data }))}
              onNext={() => {
                STEPS[currentStep]?.key === "complete"
                  ? handleComplete()
                  : setCurrentStep((prev) => prev + 1);
              }}
            ></CurrentStepComponent>
          </AnimatePresence>

          {STEPS[currentStep]?.key !== "welcome" &&
            STEPS[currentStep]?.key !== "complete" && (
              <NavigationButtons
                step={currentStep}
                canProceed={true}
                onBack={() => setCurrentStep((prev) => prev - 1)}
                onNext={() => setCurrentStep((prev) => prev + 1)}
              />
            )}
        </motion.div>
      </div>
    </div>
  );
}
