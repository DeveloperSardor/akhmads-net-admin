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
  Settings,
  MessageSquare,
  Tags,
  Activity,
  Radio,
  X,
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
  | "categories"
  | "analytics"
  | "statistics"
  | "broadcasts"
  | "pending-broadcasts"
  | "live-updates"
  | "settings"
  | "admins"
  | "contact";

interface SidebarProps {
  isOpen: boolean;
  role: Role;
  pendingAdsCount: number;
  pendingBotsCount: number;
  pendingWithdrawalsCount: number;
  pendingBroadcastsCount: number;
  onClose?: () => void;
}

export const canAccess = (role: Role, page: Page): boolean => {
  const modPages: Page[] = [
    "dashboard",
    "moderation-queue",
    "pending-ads",
    "pending-bots",
    "pending-broadcasts",
  ];
  const adminPages: Page[] = [
    ...modPages,
    "withdrawals",
    "users",
    "all-ads",
    "all-bots",
    "categories",
    "analytics",
    "statistics",
    "live-updates",
    "broadcasts",
    "contact",
  ];
  const superPages: Page[] = [...adminPages, "settings", "admins"];
  if (role === "superadmin") return superPages.includes(page);
  if (role === "admin") return adminPages.includes(page);
  if (role === "moderator") return modPages.includes(page);
  return false;
};

export function Sidebar({
  isOpen,
  role,
  pendingAdsCount,
  pendingBotsCount,
  pendingWithdrawalsCount,
  pendingBroadcastsCount,
  onClose,
}: SidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname.substring(1) || "dashboard";

  const navItems: {
    page: Page;
    label: string;
    icon: any;
    badge?: number;
    section?: string;
    path: string;
  }[] = [
    {
      page: "dashboard" as Page,
      label: "Dashboard",
      icon: LayoutDashboard,
      section: "main",
      path: "/",
    },
    {
      page: "moderation-queue" as Page,
      label: "Moderatsiya",
      icon: ShieldCheck,
      badge: pendingAdsCount + pendingBotsCount + pendingBroadcastsCount,
      section: "moderation",
      path: "/moderation-queue",
    },
    {
      page: "pending-ads" as Page,
      label: "Reklamalar",
      icon: Megaphone,
      badge: pendingAdsCount + pendingBroadcastsCount,
      section: "moderation",
      path: "/pending-ads",
    },
    {
      page: "pending-bots" as Page,
      label: "Botlar",
      icon: Bot,
      badge: pendingBotsCount,
      section: "moderation",
      path: "/pending-bots",
    },
    {
      page: "withdrawals" as Page,
      label: "To'lovlar",
      icon: Wallet,
      badge: pendingWithdrawalsCount,
      section: "finance",
      path: "/withdrawals",
    },
    {
      page: "users" as Page,
      label: "Foydalanuvchilar",
      icon: Users,
      section: "management",
      path: "/users",
    },
    {
      page: "all-ads" as Page,
      label: "Barcha Reklamalar",
      icon: Clapperboard,
      section: "management",
      path: "/all-ads",
    },
    {
      page: "all-bots" as Page,
      label: "Barcha Botlar",
      icon: Cpu,
      section: "management",
      path: "/all-bots",
    },
    {
      page: "categories" as Page,
      label: "Kategoriyalar",
      icon: Tags,
      section: "management",
      path: "/categories",
    },
    {
      page: "analytics" as Page,
      label: "Analitika",
      icon: BarChart3,
      section: "reports",
      path: "/analytics",
    },
    {
      page: "statistics" as Page,
      label: "Statistika",
      icon: Activity,
      section: "reports",
      path: "/statistics",
    },
    {
      page: "live-updates" as Page,
      label: "Jonli Efir",
      icon: Radio,
      section: "reports",
      path: "/live-updates",
    },
    {
      page: "contact" as Page,
      label: "Murojaatlar",
      icon: MessageSquare,
      section: "reports",
      path: "/contact",
    },
    {
      page: "admins" as Page,
      label: "Adminlar",
      icon: UserCog,
      section: "system",
      path: "/admins",
    },
    {
      page: "settings" as Page,
      label: "Sozlamalar",
      icon: Settings,
      section: "system",
      path: "/settings",
    },
  ].filter((item) => canAccess(role, item.page as Page));

  const sections = [
    "main",
    "moderation",
    "finance",
    "management",
    "reports",
    "system",
  ];
  const sectionLabels: Record<string, string> = {
    main: "",
    moderation: "MODERATSIYA",
    finance: "MOLIYA",
    management: "BOSHQARUV",
    reports: "HISOBOTLAR",
    system: "TIZIM",
  };

  return (
    <nav className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-logo">
        <Link
          to="/"
          className="sidebar-logo-link"
          onClick={() => window.innerWidth <= 1024 && onClose?.()}
        >
          <div className="client-logo-wrap">
            <div className="client-logo-inner">
              <div className="spinning-ring outer"></div>
              <div className="spinning-ring inner"></div>
              <svg className="logo-svg-x" viewBox="0 0 20 20" fill="none">
                <line
                  x1="4"
                  y1="4"
                  x2="16"
                  y2="16"
                  stroke="url(#xg_sidebar)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <line
                  x1="16"
                  y1="4"
                  x2="4"
                  y2="16"
                  stroke="url(#xg_sidebar)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient
                    id="xg_sidebar"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#6a00ff" />
                    <stop offset="100%" stopColor="#b84dff" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="logo-text-stack">
              <span className="logo-title">AKHMADS.NET</span>
              <span className="logo-subtitle">ADMIN PANEL V2.0</span>
            </div>
          </div>
        </Link>
        <button className="sidebar-close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="sidebar-nav">
        {sections.map((section) => {
          const sectionItems = navItems.filter((i) => i.section === section);
          if (!sectionItems.length) return null;
          return (
            <div key={section}>
              {sectionLabels[section] && (
                <div className="nav-section-label">
                  {sectionLabels[section]}
                </div>
              )}
              {sectionItems.map((item) => (
                <Link
                  key={item.page}
                  to={item.path}
                  style={{ textDecoration: "none" }}
                  className={`nav-item ${currentPath === (item.path.substring(1) || "dashboard") ? "active" : ""}`}
                >
                  <span className="nav-icon">
                    <item.icon size={18} strokeWidth={2.5} />
                  </span>
                  <span className="nav-label-text">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`nav-badge ${item.badge > 5 ? "red" : ""}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          );
        })}
      </div>

      <div className="sidebar-role">
        <div
          style={{
            fontSize: 13,
            color: "var(--text-main)",
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          {role === "superadmin"
            ? "👑 Super Admin"
            : role === "admin"
              ? "🛡️ Admin"
              : "🔍 Moderator"}
        </div>
      </div>

      <style>{`
        .sidebar {
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 1001; /* Ensure stay above overlay */
        }

        .sidebar-logo {
            padding: 24px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .sidebar-logo-link {
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            min-width: 0;
        }

        .client-logo-wrap {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .client-logo-inner {
            position: relative;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            background: radial-gradient(circle at center, #0f0f2a 40%, #070715 100%);
            box-shadow: 0 0 14px rgba(120,0,255,0.2), inset 0 0 10px rgba(100,0,255,0.2);
        }

        .spinning-ring {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            border: 2px solid transparent;
        }

        .spinning-ring.outer {
            border-top-color: #8f2fff;
            border-bottom-color: #4b00ff;
            animation: spin 6s linear infinite;
        }

        .spinning-ring.inner {
            inset: 4px;
            border-top-color: #4b00ff;
            border-bottom-color: #8f2fff;
            animation: spin 6s linear infinite reverse;
        }

        .logo-svg-x {
            width: 16px;
            height: 16px;
            position: relative;
            z-index: 10;
        }

        .logo-text-stack {
            display: flex;
            flex-direction: column;
            line-height: 1.1;
        }

        .logo-title {
            font-size: 16px;
            font-weight: 800;
            letter-spacing: 0.1px;
            color: var(--text-main);
        }

        .logo-subtitle {
            font-size: 9px;
            font-weight: 600;
            color: var(--accent-primary);
            letter-spacing: 1px;
            margin-top: 2px;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .sidebar-close-btn {
            display: none;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: var(--text-muted);
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            transition: all 0.3s ease;
        }

        .sidebar-close-btn:hover {
            background: var(--surface2);
            color: #fff;
            transform: translateY(-1px);
        }

        @media (max-width: 1024px) {
            .sidebar-close-btn {
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
        
        @media (max-width: 480px) {
            .logo-title { font-size: 14px; }
            .logo-subtitle { font-size: 8px; }
            .client-logo-inner { width: 32px; height: 32px; }
        }
      `}</style>
    </nav>
  );
}
