import { useEffect, useState } from "react";
import type { Role } from "./Sidebar";
import { useLocation } from "react-router-dom";

interface HeaderProps {
    toggleSidebar: () => void;
    role: Role;
}

const ROLE_COLORS: Record<string, string> = {
    superadmin: "text-yellow-300 bg-yellow-900/40",
    admin: "text-blue-300 bg-blue-900/40",
    moderator: "text-emerald-300 bg-emerald-900/40",
    user: "text-slate-300 bg-slate-700/40",
};

export function Header({ toggleSidebar, role }: HeaderProps) {
    const [time, setTime] = useState(new Date());
    const location = useLocation();

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const getPageTitle = (path: string) => {
        const routeTitles: Record<string, string> = {
            "/": "Dashboard",
            "/moderation-queue": "Moderatsiya",
            "/pending-ads": "Reklamalar",
            "/pending-bots": "Botlar",
            "/withdrawals": "To'lovlar",
            "/users": "Foydalanuvchilar",
            "/all-ads": "Barcha Reklamalar",
            "/all-bots": "Barcha Botlar",
            "/analytics": "Analitika",
            "/admins": "Adminlar",
            "/settings": "Sozlamalar",
        };
        return routeTitles[path] || "Dashboard";
    };

    return (
        <header className="header">
            <div className="burger" onClick={toggleSidebar}>
                <span /><span /><span />
            </div>
            <div className="header-title">
                {getPageTitle(location.pathname)}
            </div>
            <div className={`header-role-badge ${ROLE_COLORS[role]}`} style={{ borderRadius: 20, padding: "3px 12px" }}>
                {role === "superadmin" ? "👑 Super Admin" : role === "admin" ? "🛡️ Admin" : "🔍 Moderator"}
            </div>
            <div className="header-time mono">
                {time.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
            </div>
        </header>
    );
}
