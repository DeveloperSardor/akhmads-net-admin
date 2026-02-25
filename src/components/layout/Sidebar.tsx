import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    ShieldCheck,
    Megaphone,
    Bot,
    Wallet,
    Users,
    Clapperboard,
    Cpu,
    BarChart3,
    UserCog,
    Settings
} from "lucide-react";

export type Role = "superadmin" | "admin" | "moderator";
export type Page =
    | "dashboard"
    | "moderation-queue"
    | "pending-ads"
    | "pending-bots"
    | "withdrawals"
    | "users"
    | "all-ads"
    | "all-bots"
    | "analytics"
    | "settings"
    | "admins";

interface SidebarProps {
    isOpen: boolean;
    role: Role;
    pendingAdsCount: number;
    pendingBotsCount: number;
    pendingWithdrawalsCount: number;
}

export const canAccess = (role: Role, page: Page): boolean => {
    const modPages: Page[] = ["dashboard", "moderation-queue", "pending-ads", "pending-bots"];
    const adminPages: Page[] = [...modPages, "withdrawals", "users", "all-ads", "all-bots", "analytics"];
    const superPages: Page[] = [...adminPages, "settings", "admins"];
    if (role === "superadmin") return superPages.includes(page);
    if (role === "admin") return adminPages.includes(page);
    if (role === "moderator") return modPages.includes(page);
    return false;
};

export function Sidebar({ isOpen, role, pendingAdsCount, pendingBotsCount, pendingWithdrawalsCount }: SidebarProps) {
    const location = useLocation();
    const currentPath = location.pathname.substring(1) || "dashboard";

    const navItems: { page: Page; label: string; icon: any; badge?: number; section?: string; path: string }[] = [
        { page: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard, section: "main", path: "/" },
        { page: "moderation-queue" as Page, label: "Moderatsiya", icon: ShieldCheck, badge: pendingAdsCount + pendingBotsCount, section: "moderation", path: "/moderation-queue" },
        { page: "pending-ads" as Page, label: "Reklamalar", icon: Megaphone, badge: pendingAdsCount, section: "moderation", path: "/pending-ads" },
        { page: "pending-bots" as Page, label: "Botlar", icon: Bot, badge: pendingBotsCount, section: "moderation", path: "/pending-bots" },
        { page: "withdrawals" as Page, label: "To'lovlar", icon: Wallet, badge: pendingWithdrawalsCount, section: "finance", path: "/withdrawals" },
        { page: "users" as Page, label: "Foydalanuvchilar", icon: Users, section: "management", path: "/users" },
        { page: "all-ads" as Page, label: "Barcha Reklamalar", icon: Clapperboard, section: "management", path: "/all-ads" },
        { page: "all-bots" as Page, label: "Barcha Botlar", icon: Cpu, section: "management", path: "/all-bots" },
        { page: "analytics" as Page, label: "Analitika", icon: BarChart3, section: "reports", path: "/analytics" },
        { page: "admins" as Page, label: "Adminlar", icon: UserCog, section: "system", path: "/admins" },
        { page: "settings" as Page, label: "Sozlamalar", icon: Settings, section: "system", path: "/settings" },
    ].filter(item => canAccess(role, item.page as Page));

    const sections = ["main", "moderation", "finance", "management", "reports", "system"];
    const sectionLabels: Record<string, string> = {
        main: "", moderation: "MODERATSIYA", finance: "MOLIYA",
        management: "BOSHQARUV", reports: "HISOBOTLAR", system: "TIZIM"
    };

    return (
        <nav className={`sidebar ${isOpen ? "open" : "closed"}`}>
            <div className="sidebar-logo">
                <div className="logo-icon">A</div>
                <div>
                    <div className="logo-text">AKHMADS.NET</div>
                    <div className="logo-sub">admin panel v2.0</div>
                </div>
            </div>

            <div className="sidebar-nav">
                {sections.map(section => {
                    const sectionItems = navItems.filter(i => i.section === section);
                    if (!sectionItems.length) return null;
                    return (
                        <div key={section}>
                            {sectionLabels[section] && <div className="nav-section-label">{sectionLabels[section]}</div>}
                            {sectionItems.map(item => (
                                <Link
                                    key={item.page}
                                    to={item.path}
                                    style={{ textDecoration: 'none' }}
                                    className={`nav-item ${currentPath === (item.path.substring(1) || 'dashboard') ? "active" : ""}`}
                                >
                                    <span className="nav-icon"><item.icon size={18} strokeWidth={2.5} /></span>
                                    <span>{item.label}</span>
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <span className={`nav-badge ${item.badge > 5 ? "red" : ""}`}>{item.badge}</span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    );
                })}
            </div>

            <div className="sidebar-role">
                <div style={{ fontSize: 13, color: "var(--text-main)", marginBottom: 6, fontWeight: 500 }}>
                    {role === "superadmin" ? "👑 Super Admin" : role === "admin" ? "🛡️ Admin" : "🔍 Moderator"}
                </div>
            </div>
        </nav>
    );
}
