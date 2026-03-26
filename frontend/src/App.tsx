import { Navigate, Route, Routes } from "react-router-dom";
import { AppProvider, useAppContext } from "@/context/app-context";
import LandingPage from "@/pages/landing-page";
import AnalysisPage from "@/pages/analysis-page";
import LoginPage from "@/pages/login-page";
import ProfilePage from "@/pages/profile-page";
import TransactionsPage from "@/pages/transactions-page";
import ClickSpark from "@/components/ui/click-spark";
import type { ReactNode } from "react";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { sessionReady, session } = useAppContext();

  if (!sessionReady) {
    return null;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute() {
  const { sessionReady, session } = useAppContext();

  if (!sessionReady) {
    return null;
  }

  if (session) {
    return <Navigate to="/transactions" replace />;
  }

  return <LoginPage />;
}

export default function App() {
  return (
    <AppProvider>
      <ClickSpark sparkColor="#fff" sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute />} />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis"
            element={
              <ProtectedRoute>
                <AnalysisPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ClickSpark>
    </AppProvider>
  );
}
