import { useState } from "react";
import { Sidebar } from "./Sidebar";
import type { Role } from "./Sidebar";
import { Header } from "./Header";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usePendingAds } from "../../hooks/queries/useAds";
import { usePendingBots } from "../../hooks/queries/useBots";

export function MainLayout() {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const roles = user?.roles || (user?.role ? [user.role] : []);
    let role: Role = "moderator";

    if (roles.includes("SUPER_ADMIN")) role = "superadmin";
    else if (roles.includes("ADMIN")) role = "admin";
    else if (roles.includes("MODERATOR")) role = "moderator";

    const { data: pendingAdsRes } = usePendingAds();
    const { data: pendingBotsRes } = usePendingBots();

    const pendingAdsCount = pendingAdsRes?.total ?? pendingAdsRes?.data?.length ?? 0;
    const pendingBotsCount = pendingBotsRes?.total ?? pendingBotsRes?.data?.length ?? 0;
    const pendingWithdrawalsCount = 0; // Use mock or query if exists

    return (
        <>
            <Sidebar
                isOpen={sidebarOpen}
                role={role}
                pendingAdsCount={pendingAdsCount}
                pendingBotsCount={pendingBotsCount}
                pendingWithdrawalsCount={pendingWithdrawalsCount}
            />

            <main className={`main ${sidebarOpen ? "" : "expanded"}`}>
                <Header
                    toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    role={role}
                />

                <div className="content">
                    {/* Renders the matched child route here */}
                    <Outlet context={{ role }} />
                </div>
            </main>
        </>
    );
}
