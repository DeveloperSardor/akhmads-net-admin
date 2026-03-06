import { useState } from "react";
import {
    DollarSign,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    Target,
    AlertCircle,
    PieChart,
    MousePointerClick,
    Eye,
    TrendingUp,
} from "lucide-react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { useAdminStats, useAdminAnalytics, useAdminRevenueChart } from "../../hooks/queries/useAdmin";

const PERIOD_OPTIONS = [
    { label: "1 kun", value: "1d" },
    { label: "7 kun", value: "7d" },
    { label: "1 oy", value: "30d" },
    { label: "3 oy", value: "90d" },
    { label: "1 yil", value: "365d" },
];

type ChartEntry = { date: string; impressions: number; spent: number; clicks: number };

function GrowthChart({ rawData }: { rawData?: ChartEntry[] }) {
    const fallback: ChartEntry[] = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { date: d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' }), impressions: 0, spent: 0, clicks: 0 };
    });

    const source = rawData && rawData.length > 0 ? rawData : fallback;

    const chartData = source.map(item => ({
        date: item.date,
        taassurotlar: item.impressions,
        daromad: item.spent,
    }));

    return (
        <div className="elite-card" style={{ marginTop: 32 }}>
            <div className="elite-chart-header">
                <div>
                    <h3 className="elite-chart-title">O'sish Dinamikasi</h3>
                    <p className="elite-chart-sub">So'nggi 7 kun — taassurotlar va daromad trendi</p>
                </div>
                <div className="elite-stat-icon-wrap" style={{ width: 44, height: 44, borderRadius: 12 }}>
                    <TrendingUp size={20} />
                </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="gradImp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradClk" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={45}
                        tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
                    />
                    <Tooltip
                        contentStyle={{
                            background: 'var(--bg-card, #1a1a2e)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 10,
                            color: '#fff',
                            fontSize: 13,
                        }}
                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', paddingTop: 12 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="taassurotlar"
                        name="Taassurotlar"
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                        fill="url(#gradImp)"
                        dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#8b5cf6' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="daromad"
                        name="Daromad (USDT)"
                        stroke="#06b6d4"
                        strokeWidth={2.5}
                        fill="url(#gradClk)"
                        dot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#06b6d4' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export function AnalyticsPage() {
    const [revenuePeriod, setRevenuePeriod] = useState("30d");
    const { data: stats, isLoading: loadingStats, isError: errorStats } = useAdminStats();
    const { data: analytics, isLoading: loadingAnalytics, isError: errorAnalytics } = useAdminAnalytics();
    const { data: revenueData } = useAdminRevenueChart(revenuePeriod);

    const revenueChartData = revenueData ?? [];
    const totalRevenue = revenueChartData.reduce((sum, d) => sum + d.revenue, 0);
    const totalSpent = analytics?.chartData?.reduce((sum, d) => sum + d.spent, 0) ?? 0;

    const categories = analytics?.categories || [];
    const maxVal = Math.max(...categories.map(c => c.value), 1);

    const placeholderCategories = [
        { name: "Banner reklamalar", value: 0, revenue: 0, color: "#8b5cf6" },
        { name: "Video reklamalar", value: 0, revenue: 0, color: "#06b6d4" },
        { name: "Matnli reklamalar", value: 0, revenue: 0, color: "#10b981" },
        { name: "Inline reklamalar", value: 0, revenue: 0, color: "#f59e0b" },
    ];
    const displayCategories = categories.length > 0 ? categories : placeholderCategories;
    const isEmpty = categories.length === 0;

    const eliteStats = [
        {
            label: "Faol reklamalar",
            value: (stats?.activeAds ?? 0).toLocaleString(),
            icon: <Zap size={24} />,
            trend: "Jonli",
            up: true,
            subtitle: "Tizimdagi faol reklamalar",
        },
        {
            label: "Taassurotlar",
            value: (stats?.impressions ?? 0).toLocaleString(),
            icon: <Eye size={24} />,
            trend: "Ko'rishlar",
            up: true,
            subtitle: "Jami ko'rilgan marta",
        },
        {
            label: "Kliklar",
            value: (stats?.clicks ?? 0).toLocaleString(),
            icon: <MousePointerClick size={24} />,
            trend: `CTR: ${(stats?.ctr ?? 0).toFixed(2)}%`,
            up: (stats?.clicks ?? 0) > 0,
            subtitle: "Reklama bosishlari",
        },
        {
            label: "Platforma daromadi",
            value: `$${(stats?.totalRevenue ?? 0).toLocaleString()}`,
            icon: <DollarSign size={24} />,
            trend: `Fee: ${stats?.platformFeePercentage ?? 0}%`,
            up: true,
            subtitle: `Platforma ulushi: $${(stats?.platformEarnings ?? 0).toLocaleString()}`,
        },
    ];

    if (loadingStats || loadingAnalytics) {
        return (
            <div className="elite-analytics-wrap">
                <div className="page-head" style={{ marginBottom: 40 }}>
                    <div className="page-head-left">
                        <h1 className="section-title" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>
                            Tizim Analitikasi
                        </h1>
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
                    <p className="elite-empty-text">
                        Analitika ma'lumotlarini yuklash imkoni bo'lmadi. Keyinroq qayta urinib ko'ring.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="elite-analytics-wrap">
            <div className="page-head" style={{ marginBottom: 40 }}>
                <div className="page-head-left">
                    <h1 className="section-title" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>
                        Tizim Analitikasi
                    </h1>
                    <p className="section-sub" style={{ fontSize: 16 }}>
                        Platformaning real vaqtdagi ko'rsatkichlari va o'sish dinamikasi
                    </p>
                </div>
                <div className="elite-live-pill">
                    <div className="elite-live-pulse" />
                    Jonli: {new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="elite-stat-grid">
                {eliteStats.map((s, i) => (
                    <div className="elite-stat-box" key={i}>
                        <div className="elite-stat-icon-wrap">{s.icon}</div>
                        <div className={`elite-trend-badge ${s.up ? 'elite-trend-up' : 'elite-trend-down'}`}>
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

            {/* Charts — categories bo'sh bo'lsa ham ko'rsatamiz */}
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
                        {displayCategories.map((cat, i) => (
                            <div className="elite-bar-row" key={i} style={{ opacity: isEmpty ? 0.35 : 1 }}>
                                <div className="elite-bar-info">
                                    <span className="elite-bar-label">{cat.name}</span>
                                    <span className="elite-bar-percent">{isEmpty ? '—' : `${cat.value}%`}</span>
                                </div>
                                <div className="elite-bar-track">
                                    <div className="elite-bar-fill" style={{
                                        width: isEmpty ? '0%' : `${(cat.value / maxVal) * 100}%`,
                                        background: `linear-gradient(90deg, ${cat.color || '#8b5cf6'}aa, ${cat.color || '#8b5cf6'})`,
                                    }} />
                                </div>
                            </div>
                        ))}
                        {isEmpty && (
                            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                                Hali ma'lumot mavjud emas
                            </div>
                        )}
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
                        {[...displayCategories]
                            .sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0))
                            .map((cat, i) => (
                                <div className="elite-dist-item" key={i} style={{ opacity: isEmpty ? 0.35 : 1 }}>
                                    <div className="elite-dist-label-group">
                                        <div className="elite-dist-dot" style={{ background: cat.color || '#8b5cf6' }} />
                                        <span className="elite-dist-name">{cat.name}</span>
                                    </div>
                                    <div className="elite-dist-value">
                                        {isEmpty ? '—' : `$${(cat.revenue ?? 0).toLocaleString()}`}
                                    </div>
                                </div>
                            ))}
                        {isEmpty && (
                            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                                Hali ma'lumot mavjud emas
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Growth chart */}
            <GrowthChart rawData={analytics?.chartData as ChartEntry[] | undefined} />

            {/* Platform Revenue Chart */}
            <div className="elite-card" style={{ marginTop: 32, padding: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div className="elite-stat-icon-wrap" style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                            <TrendingUp size={22} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Platforma daromadi</h3>
                            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Umumiy pul aylanmasi va platforma ulushi</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {[...PERIOD_OPTIONS, { label: 'Barchasi', value: 'all' }].map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setRevenuePeriod(opt.value)}
                                style={{
                                    padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                    fontSize: 12, fontWeight: 600,
                                    background: revenuePeriod === opt.value ? '#f59e0b' : 'rgba(255,255,255,0.06)',
                                    color: revenuePeriod === opt.value ? '#000' : 'rgba(255,255,255,0.4)',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                    {[
                        { label: 'Jami aylanma', value: `$${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#3b82f6' },
                        { label: 'Platforma daromadi', value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#f59e0b' },
                        { label: 'Fee foizi', value: `${stats?.platformFeePercentage ?? 0}%`, color: '#10b981' },
                    ].map((item, i) => (
                        <div key={i} style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{item.label}</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.value}</div>
                        </div>
                    ))}
                </div>

                {revenueChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={revenueChartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`} />
                            <Tooltip
                                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 13 }}
                            />
                            <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', paddingTop: 12 }} />
                            <Area type="monotone" dataKey="revenue" name="Platforma daromadi" stroke="#f59e0b" strokeWidth={2.5} fill="url(#gradRev)" dot={false} activeDot={{ r: 5, fill: '#f59e0b' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>
                        Ma'lumot yuklanmoqda...
                    </div>
                )}

                {/* Revenue vs Impressions bar chart */}
                {revenueChartData.length > 0 && (
                    <div style={{ marginTop: 32 }}>
                        <h4 style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>Taassurotlar va kliklar dinamikasi</h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={revenueChartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} />
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 13 }} />
                                <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', paddingTop: 12 }} />
                                <Bar dataKey="impressions" name="Ko'rishlar" fill="rgba(139,92,246,0.7)" radius={[3, 3, 0, 0]} />
                                <Bar dataKey="clicks" name="Kliklar" fill="rgba(6,182,212,0.7)" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
