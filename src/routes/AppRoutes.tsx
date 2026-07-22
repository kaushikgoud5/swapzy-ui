import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Auth } from "../pages/Auth";
import { LandingPage } from "../pages/LandingPage";
import { OnboardingPage } from "../pages/Onboarding/OnboardingPage";
import { GithubCallback } from "../pages/GithubCallback";
import Home from "../pages/Home/Home";
import { useAppSelector } from "../store";
import { profileService } from "../services/profileService";
import { useQuery } from "@tanstack/react-query";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAppSelector((state) => state.auth.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: () => profileService.getOnboardingStatus(),
    staleTime: 5 * 60_000,
  });

  if (isLoading) return null;
  if (!data?.onboarding?.isOnboarded) return <Navigate to="/profile" replace />;
  return <>{children}</>;
}

function OnboardingGuard() {
  const { data, isLoading } = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: () => profileService.getOnboardingStatus(),
    staleTime: 5 * 60_000,
  });

  if (isLoading) return null;
  return data?.onboarding?.isOnboarded ? <Navigate to="/home" replace /> : <OnboardingPage />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/home/*" element={<ProtectedRoute><OnboardingGate><Home /></OnboardingGate></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><OnboardingGuard /></ProtectedRoute>} />
        <Route path="/auth/github/callback" element={<GithubCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
