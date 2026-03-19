import { useEffect, useState } from "react";
import type { Role } from "./Sidebar";
import { useLocation } from "react-router-dom";

interface HeaderProps {
  toggleSidebar: () => void;
  role: Role;
  isSidebarOpen: boolean;
}

const ROLE_COLORS: Record<string, string> = {
  superadmin: "text-amber-300 bg-amber-900/40",
  admin: "text-blue-300 bg-blue-900/40",
  moderator: "text-emerald-300 bg-emerald-900/40",
  user: "text-slate-300 bg-slate-700/40",
};

export function Header({ toggleSidebar, role, isSidebarOpen }: HeaderProps) {
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
      <div
        className={`burger ${isSidebarOpen ? "active" : ""}`}
        onClick={toggleSidebar}
      >
        <div className="line-1" />
        <div className="line-2" />
        <div className="line-3" />
      </div>

      <div className="header-title animate-in">
        {getPageTitle(location.pathname)}
      </div>

      <div
        className={`header-role-badge ${ROLE_COLORS[role]}`}
        style={{ borderRadius: 20, padding: "3px 12px" }}
      >
        {role === "superadmin"
          ? "👑 Super Admin"
          : role === "admin"
            ? "🛡️ Admin"
            : "🔍 Moderator"}
      </div>

      <div className="header-time-wrap">
        <div className="header-time mono">
          <span>
            🇷🇺 MOW:{" "}
            {time.toLocaleTimeString("uz-UZ", {
              timeZone: "Europe/Moscow",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span>
            🇺🇿 UZ:{" "}
            {time.toLocaleTimeString("uz-UZ", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      <style>{`
                .burger {
                    width: 24px;
                    height: 18px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    cursor: pointer;
                    position: relative;
                }
                .burger div {
                    height: 2px;
                    background: #fff;
                    border-radius: 2px;
                    transition: 0.3s;
                }
                .line-1 { width: 100%; }
                .line-2 { width: 70%; }
                .line-3 { width: 100%; }

                .burger.active .line-1 { transform: translateY(8px) rotate(45deg); width: 100%; }
                .burger.active .line-2 { opacity: 0; }
                .burger.active .line-3 { transform: translateY(-8px) rotate(-45deg); width: 100%; }
                
                .header-time-wrap {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }
                
                .header-time {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 2px;
                }

                @media (max-width: 640px) {
                    .header-time-wrap { display: none; }
                }
            `}</style>
    </header>
  );
}
