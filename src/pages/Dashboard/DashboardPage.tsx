import { useOutletContext, useNavigate } from "react-router-dom";
import type { Role } from "../../components/layout/Sidebar";
import {
    Users,
    Megaphone,
    Bot,
    Clock,
    ChevronRight,
    ShieldAlert,
    Wallet
} from "lucide-react";

import { usePendingAds } from "../../hooks/queries/useAds";
import { usePendingBots } from "../../hooks/queries/useBots";
import { useAdminStats, useAdminUsers } from "../../hooks/queries/useAdmin";

export function DashboardPage() {
    const { role } = useOutletContext<{ role: Role }>();
    const navigate = useNavigate();

    const { data: pendingAdsRes, isLoading: loadingAds } = usePendingAds();
    const { data: pendingBotsRes, isLoading: loadingBots } = usePendingBots();
    const { data: stats } = useAdminStats();

    // Foydalanuvchilarni xuddi UsersPage'dagi kabi chaqirib olish
    const { data: usersRes } = useAdminUsers();

    // Backend 'total' qaytarmasa, kelgan array 'length'idan foydalanamiz
    const totalUsers = usersRes?.total ?? usersRes?.data?.length ?? (Array.isArray(usersRes) ? usersRes.length : 0);

    const pendingAdsCount = pendingAdsRes?.total ?? pendingAdsRes?.data.length ?? 0;
    const pendingBotsCount = pendingBotsRes?.total ?? pendingBotsRes?.data.length ?? 0;
    const pendingWithdrawalsCount = stats?.pendingModeration || 0;

    const canAdminAccess = (r: Role) => r === "superadmin" || r === "admin";

    const dashboardStats = [
        { label: "Jami Foydalanuvchilar", value: totalUsers.toLocaleString(), sub: "Tizimda ro'yxatdan o'tganlar", icon: <Users size={20} />, color: "#3b82f6" },
        { label: "Faol Reklamalar", value: (stats?.activeAds ?? stats?.activeAdsCount ?? 0).toLocaleString(), sub: `${loadingAds ? "..." : pendingAdsCount} kutilmoqda`, icon: <Megaphone size={20} />, color: "#10b981" },
        { label: "Botlar", value: (stats?.activeBots ?? 0).toLocaleString(), sub: `${loadingBots ? "..." : pendingBotsCount} kutilmoqda`, icon: <Bot size={20} />, color: "#a855f7" },
        { label: "Platforma Daromadi", value: `$${(stats?.totalRevenue ?? stats?.totalSpent ?? 0).toLocaleString()}`, sub: "USDT", icon: <Wallet size={20} />, color: "#f59e0b" },
        { label: "Kutilayotgan Reklamalar", value: loadingAds ? "..." : pendingAdsCount.toString(), sub: "Moderatsiya kerak", icon: <ShieldAlert size={20} />, color: "#ef4444" },
        { label: "Kutilayotgan Botlar", value: loadingBots ? "..." : pendingBotsCount.toString(), sub: "Tasdiqlash kerak", icon: <Clock size={20} />, color: "#ef4444" },
    ];

    return (
        <div className="elite-analytics-wrap">
            <div className="page-head" style={{ marginBottom: 32 }}>
                <div className="page-head-left">
                    <div className="section-title" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>Bosh sahifa</div>
                    <div className="section-sub" style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                        Platforma holati — bugun, {new Date().toLocaleDateString("uz-UZ", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </div>
            </div>

            <div className="elite-stat-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 24,
                marginBottom: 40
            }}>
                {dashboardStats.map((stat, i) => (
                    <div className="elite-card" key={i} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 14,
                                background: `${stat.color}15`,
                                color: stat.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {stat.icon}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{stat.value}</div>
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{stat.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 32, alignItems: 'start' }}>
                {/* Activity */}
                <div className="elite-card" style={{ padding: 32, minHeight: 400 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                        <div>
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Faollik grafigi</h3>
                            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Oxirgi 14 kun — reklamalar soni</p>
                        </div>
                        <div className="badge badge-primary" style={{ padding: '6px 12px' }}>LIVE</div>
                    </div>
                    <div style={{ height: 260, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, padding: '0 10px' }}>
                        {[40, 60, 45, 90, 65, 80, 55, 70, 85, 40, 60, 75, 50, 95].map((h, i) => (
                            <div key={i} style={{
                                flex: 1,
                                height: `${h}%`,
                                background: i === 13 ? 'var(--blue)' : 'rgba(255,255,255,0.05)',
                                borderRadius: '4px 4px 0 0',
                                transition: 'all 0.3s ease',
                                position: 'relative'
                            }} className="activity-bar">
                                <style>{`.activity-bar:hover { background: var(--blue) !important; opacity: 0.8; }`}</style>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, padding: '0 10px' }}>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>14 kun oldin</span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Bugun</span>
                    </div>
                </div>

                {/* Quick actions */}
                <div className="elite-card" style={{ padding: 32 }}>
                    <div style={{ marginBottom: 32 }}>
                        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Tezkor harakatlar</h3>
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Moderatsiya va kutilayotgan ishlar</p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {pendingAdsCount > 0 && (
                            <div
                                onClick={() => navigate("/pending-ads")}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "20px",
                                    background: "rgba(245,158,11, 0.05)",
                                    borderRadius: 16,
                                    border: "1px solid rgba(245,158,11, 0.1)",
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                className="action-notification"
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ShieldAlert size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{pendingAdsCount} ta reklama kutilmoqda</div>
                                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Moderatsiya navbati</div>
                                    </div>
                                </div>
                                <ChevronRight size={20} color="rgba(255,255,255,0.3)" />
                            </div>
                        )}
                        {pendingBotsCount > 0 && (
                            <div
                                onClick={() => navigate("/pending-bots")}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "20px",
                                    background: "rgba(168,85,247, 0.05)",
                                    borderRadius: 16,
                                    border: "1px solid rgba(168,85,247, 0.1)",
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                className="action-notification"
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(168,85,247, 0.1)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Bot size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{pendingBotsCount} ta bot kutmoqda</div>
                                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Tasdiqlash navbati</div>
                                    </div>
                                </div>
                                <ChevronRight size={20} color="rgba(255,255,255,0.3)" />
                            </div>
                        )}
                        {pendingWithdrawalsCount > 0 && canAdminAccess(role) && (
                            <div
                                onClick={() => navigate("/withdrawals")}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "20px",
                                    background: "rgba(59,130,246, 0.05)",
                                    borderRadius: 16,
                                    border: "1px solid rgba(59,130,246, 0.1)",
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                className="action-notification"
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Wallet size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{pendingWithdrawalsCount} ta to'lov</div>
                                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>To'lovlar navbati</div>
                                    </div>
                                </div>
                                <ChevronRight size={20} color="rgba(255,255,255,0.3)" />
                            </div>
                        )}
                        {pendingAdsCount === 0 && pendingBotsCount === 0 && (
                            <div style={{ padding: '40px 20px', textAlign: 'center', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    <ShieldAlert size={20} />
                                </div>
                                <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Barcha navbatlar bo'sh</div>
                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Ajoyib ish! 🎉</div>
                            </div>
                        )}
                    </div>

                    <style>{`
                        .action-notification:hover {
                            background: rgba(255,255,255,0.03) !important;
                            transform: translateX(4px);
                        }
                    `}</style>
                </div>
            </div>
        </div>
    );
}
