import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Auth } from "../pages/Auth";
import { LandingPage } from "../pages/LandingPage";
import { OnboardingSplash } from "../pages/OnboardingSplash";
import Home from "../pages/Home/Home";
import { useAppSelector } from "../store";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAppSelector((state) => state.auth.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function WelcomeRoute() {
  const token = useAppSelector((state) => state.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  if (!sessionStorage.getItem('showWelcome')) return <Navigate to="/home" replace />;
  return <OnboardingSplash />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/welcome" element={<WelcomeRoute />} />
        <Route path="/home/*" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
