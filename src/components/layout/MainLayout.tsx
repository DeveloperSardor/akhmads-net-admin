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

    let role: Role = "moderator";
    if (user?.role === "ADMIN") role = "superadmin";
    else if (user?.role === "SUPPORT") role = "moderator";
    else role = "moderator"; // Default to moderator for now if user has no high privileges, to allow viewing the panel

    const { data: pendingAdsRes } = usePendingAds();
    const { data: pendingBotsRes } = usePendingBots();

    const pendingAdsCount = pendingAdsRes?.length || 0;
    const pendingBotsCount = pendingBotsRes?.length || 0;
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
