import { Routes, Route } from "react-router-dom";
import { useState } from "react";
// Layout
import { MainLayout } from "./components/layout/MainLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";

// Pages
import { LoginPage } from "./pages/Auth/LoginPage";
import { DashboardPage } from "./pages/Dashboard/DashboardPage";
import { ModerationQueuePage } from "./pages/AdsModeration/ModerationQueuePage";
import { PendingAdsPage } from "./pages/AdsModeration/PendingAdsPage";
import { PendingBotsPage } from "./pages/BotsModeration/PendingBotsPage";
import { WithdrawalsPage } from "./pages/Withdrawals/WithdrawalsPage";
import { UsersPage } from "./pages/Users/UsersPage";
import { AllAdsPage } from "./pages/AdsModeration/AllAdsPage";
import { AllBotsPage } from "./pages/BotsModeration/AllBotsPage";
import { AnalyticsPage } from "./pages/Analytics/AnalyticsPage";
import { AdminsPage } from "./pages/Admins/AdminsPage";
import { SettingsPage } from "./pages/Settings/SettingsPage";

// Modal
import { ModalRenderer } from "./components/ui/ModalRenderer";

export default function App() {
  const [modal, setModal] = useState<{ type: string; data: any } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/moderation-queue" element={<ModerationQueuePage setModal={setModal} />} />
          <Route path="/pending-ads" element={<PendingAdsPage setModal={setModal} />} />
          <Route path="/pending-bots" element={<PendingBotsPage setModal={setModal} />} />
          <Route path="/withdrawals" element={<WithdrawalsPage setModal={setModal} />} />
          <Route path="/users" element={<UsersPage setModal={setModal} />} />
          <Route path="/all-ads" element={<AllAdsPage />} />
          <Route path="/all-bots" element={<AllBotsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/admins" element={<AdminsPage showToast={showToast} />} />
          <Route path="/settings" element={<SettingsPage showToast={showToast} />} />
        </Route>
      </Routes>

      {/* Modals */}
      {modal && (
        <ModalRenderer modal={modal} setModal={setModal} />
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ"} {toast.msg}
        </div>
      )}
    </>
  );
}