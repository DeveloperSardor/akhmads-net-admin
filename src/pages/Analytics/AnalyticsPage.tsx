import {
    Activity,
    BarChart3,
    DollarSign,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    Target,
    Layers,
    AlertCircle,
    PieChart
} from "lucide-react";
import { useAdminStats, useAdminAnalytics } from "../../hooks/queries/useAdmin";

export function AnalyticsPage() {
    const { data: stats, isLoading: loadingStats, isError: errorStats } = useAdminStats();
    const { data: analytics, isLoading: loadingAnalytics, isError: errorAnalytics } = useAdminAnalytics();

    const categories = analytics?.categories || [];
    const maxVal = Math.max(...categories.map(c => c.value), 1);

    const eliteStats = [
        {
            label: "Faol reklamalar",
            value: (stats?.activeAds ?? stats?.activeAdsCount ?? 0).toLocaleString(),
            icon: <Zap size={24} />,
            trend: "Jonli",
            up: true,
            subtitle: "Tizimdagi faol reklamalar"
        },
        {
            label: "Faol botlar",
            value: (stats?.activeBots ?? 0).toLocaleString(),
            icon: <Layers size={24} />,
            trend: "Faollik",
            up: true,
            subtitle: "Ulangan botlar soni"
        },
        {
            label: "Moderatsiya",
            value: (stats?.pendingModeration ?? 0).toLocaleString(),
            icon: <Activity size={24} />,
            trend: "Navbat",
            up: false,
            subtitle: "Kutilayotgan so'rovlar"
        },
        {
            label: "Platforma daromadi",
            value: `$${(stats?.totalRevenue ?? stats?.totalSpent ?? 0).toLocaleString()}`,
            icon: <DollarSign size={24} />,
            trend: "Jami",
            up: true,
            subtitle: "Umumiy aylanma"
        },
    ];

    if (loadingStats || loadingAnalytics) {
        return (
            <div className="elite-analytics-wrap">
                <div className="page-head" style={{ marginBottom: 40 }}>
                    <div className="page-head-left">
                        <h1 className="section-title" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>Tizim Analitikasi</h1>
                        <p className="section-sub" style={{ fontSize: 16 }}>Ma'lumotlar yuklanmoqda...</p>
                    </div>
                </div>
                <div className="elite-empty-state" style={{ padding: '100px 0' }}>
                    <div className="loading-spinner" style={{ width: 40, height: 40 }} />
                    <div className="elite-empty-title" style={{ marginTop: 20 }}>Analitika tayyorlanmoqda</div>
                </div>
            </div>
        );
    }

    if (errorStats || errorAnalytics) {
        return (
            <div className="elite-analytics-wrap">
                <div className="elite-empty-state" style={{ padding: '100px 0' }}>
                    <div className="elite-empty-icon" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>
                        <AlertCircle size={32} />
                    </div>
                    <div className="elite-empty-title">Xatolik yuz berdi</div>
                    <p className="elite-empty-text">Analitika ma'lumotlarini yuklash imkoni bo'lmadi. Keyinroq qayta urinib ko'ring.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="elite-analytics-wrap">
            <div className="page-head" style={{ marginBottom: 40 }}>
                <div className="page-head-left">
                    <h1 className="section-title" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>Tizim Analitikasi</h1>
                    <p className="section-sub" style={{ fontSize: 16 }}>Platformaning real vaqtdagi ko'rsatkichlari va o'sish dinamikasi</p>
                </div>
                <div className="elite-live-pill">
                    <div className="elite-live-pulse" />
                    Jonli: {new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            <div className="elite-stat-grid">
                {eliteStats.map((s, i) => (
                    <div className="elite-stat-box" key={i}>
                        <div className="elite-stat-icon-wrap">
                            {s.icon}
                        </div>
                        <div className={`elite-trend-badge ${!s.up ? 'elite-trend-down' : 'elite-trend-up'}`}>
                            {s.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {s.trend}
                        </div>
                        <div style={{ marginTop: 8 }}>
                            <div className="elite-stat-value">{s.value}</div>
                            <div className="elite-stat-label" style={{ marginTop: 8 }}>{s.label}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.subtitle}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="elite-grid">
                <div className="elite-card">
                    <div className="elite-chart-header">
                        <div>
                            <h3 className="elite-chart-title">Kategoriyalar Analizi</h3>
                            <p className="elite-chart-sub">Reklama turlari bo'yicha ulush (foizda)</p>
                        </div>
                        <div className="elite-stat-icon-wrap" style={{ width: 44, height: 44, borderRadius: 12 }}>
                            <Target size={20} />
                        </div>
                    </div>

                    <div className="elite-chart-body">
                        {categories.length === 0 ? (
                            <div className="elite-empty-state" style={{ padding: '40px 0' }}>
                                <div className="elite-empty-title">Ma'lumot topilmadi</div>
                            </div>
                        ) : categories.map((cat, i) => (
                            <div className="elite-bar-row" key={i}>
                                <div className="elite-bar-info">
                                    <span className="elite-bar-label">{cat.name}</span>
                                    <span className="elite-bar-percent">{cat.value}%</span>
                                </div>
                                <div className="elite-bar-track">
                                    <div className="elite-bar-fill" style={{
                                        width: `${(cat.value / maxVal) * 100}%`,
                                        background: `linear-gradient(90deg, ${cat.color || '#8b5cf6'}aa, ${cat.color || '#8b5cf6'})`
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="elite-card">
                    <div className="elite-chart-header">
                        <div>
                            <h3 className="elite-chart-title">Daromad Taqsimoti</h3>
                            <p className="elite-chart-sub">USDT bo'yicha ko'rsatkichlar</p>
                        </div>
                        <div className="elite-stat-icon-wrap" style={{ width: 44, height: 44, borderRadius: 12 }}>
                            <PieChart size={20} />
                        </div>
                    </div>

                    <div className="elite-dist-list">
                        {categories.length === 0 ? (
                            <div className="elite-empty-state" style={{ padding: '40px 0' }}>
                                <div className="elite-empty-title">Ma'lumot topilmadi</div>
                            </div>
                        ) : [...categories].sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0)).map((cat, i) => (
                            <div className="elite-dist-item" key={i}>
                                <div className="elite-dist-label-group">
                                    <div className="elite-dist-dot" style={{ background: cat.color || '#8b5cf6', color: cat.color || '#8b5cf6' }} />
                                    <span className="elite-dist-name">{cat.name}</span>
                                </div>
                                <div className="elite-dist-value">
                                    ${(cat.revenue ?? 0).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="elite-card" style={{ marginTop: 32 }}>
                <div className="elite-chart-header" style={{ marginBottom: 0 }}>
                    <div>
                        <h3 className="elite-chart-title">O'sish Dinamikasi</h3>
                        <p className="elite-chart-sub">Foydalanuvchilar faolligi trendi</p>
                    </div>
                    <Activity size={24} style={{ opacity: 0.3 }} />
                </div>

                <div className="elite-empty-state">
                    <div className="elite-empty-icon">
                        <BarChart3 size={32} />
                    </div>
                    <div className="elite-empty-title">Ma'lumotlar tahlil qilinmoqda</div>
                    <p className="elite-empty-text">
                        Yangi oylik hisobot shakllanishi uchun tizimga kamida 7 kunlik faol ma'lumotlar yuklanishi lozim.
                    </p>
                </div>
            </div>
        </div>
    );
}


