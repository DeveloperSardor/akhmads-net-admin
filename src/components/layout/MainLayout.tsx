import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import type { Role } from "./Sidebar";
import { Header } from "./Header";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usePendingAds } from "../../hooks/queries/useAds";
import { usePendingBots } from "../../hooks/queries/useBots";
import { usePendingBroadcasts } from "../../hooks/queries/useBroadcasts";

export function MainLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar on navigation on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const roles = user?.roles || (user?.role ? [user.role] : []);
  let role: Role = "moderator";

  if (roles.includes("SUPER_ADMIN")) role = "superadmin";
  else if (roles.includes("ADMIN")) role = "admin";
  else if (roles.includes("MODERATOR")) role = "moderator";

  const { data: pendingAdsRes } = usePendingAds();
  const { data: pendingBotsRes } = usePendingBots();
  const { data: pendingBroadcastsRes } = usePendingBroadcasts();

  const pendingAdsCount =
    pendingAdsRes?.total ?? pendingAdsRes?.data?.length ?? 0;
  const pendingBotsCount =
    pendingBotsRes?.total ?? pendingBotsRes?.data?.length ?? 0;
  const pendingBroadcastsCount =
    pendingBroadcastsRes?.total ?? pendingBroadcastsRes?.data?.length ?? 0;
  const pendingWithdrawalsCount = 0;

  return (
    <>
      <div
        className={`sidebar-overlay ${isMobile && sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar
        isOpen={sidebarOpen}
        role={role}
        pendingAdsCount={pendingAdsCount}
        pendingBotsCount={pendingBotsCount}
        pendingWithdrawalsCount={pendingWithdrawalsCount}
        pendingBroadcastsCount={pendingBroadcastsCount}
        onClose={() => setSidebarOpen(false)}
      />

      <main className={`main ${sidebarOpen ? "" : "expanded"}`}>
        <Header
          isSidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          role={role}
        />

        <div className="content animate-in">
          <Outlet context={{ role }} />
        </div>
      </main>
    </>
  );
}
