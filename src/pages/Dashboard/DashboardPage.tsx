import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import type { Role } from "../../components/layout/Sidebar";
import {
  Users,
  Megaphone,
  Bot,
  Clock,
  ChevronRight,
  ShieldAlert,
  Wallet,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SystemTerminal } from "../../components/common/SystemTerminal";
import { usePendingAds } from "../../hooks/queries/useAds";
import { usePendingBots } from "../../hooks/queries/useBots";
import { useAdminStats, useAdminAnalytics, useAdminRevenueChart } from "../../hooks/queries/useAdmin";

const PERIOD_OPTIONS = [
  { label: "1 kun", value: "1d" },
  { label: "7 kun", value: "7d" },
  { label: "1 oy", value: "30d" },
  { label: "3 oy", value: "90d" },
  { label: "1 yil", value: "365d" },
];

export function DashboardPage() {
  const { role } = useOutletContext<{ role: Role }>();
  const navigate = useNavigate();
  const [revenuePeriod, setRevenuePeriod] = useState("14d");
  const [activityPeriod, setActivityPeriod] = useState("14d");

  const { data: pendingAdsRes, isLoading: loadingAds } = usePendingAds();
  const { data: pendingBotsRes, isLoading: loadingBots } = usePendingBots();
  const { data: stats } = useAdminStats();
  const { data: analyticsData } = useAdminAnalytics(activityPeriod);
  const { data: revenueData } = useAdminRevenueChart(revenuePeriod);

  const totalUsers = 0;

  const pendingAdsCount =
    pendingAdsRes?.total ?? pendingAdsRes?.data.length ?? 0;
  const pendingBotsCount =
    pendingBotsRes?.total ?? pendingBotsRes?.data.length ?? 0;
  const pendingWithdrawalsCount = stats?.pendingModeration || 0;

  const canAdminAccess = (r: Role) => r === "superadmin" || r === "admin";

  const dashboardStats = [
    {
      label: "Jami Foydalanuvchilar",
      value: totalUsers.toLocaleString(),
      sub: "Tizimda ro'yxatdan o'tganlar",
      icon: <Users size={20} />,
      color: "#3b82f6",
    },
    {
      label: "Faol Reklamalar",
      value: (stats?.activeAds ?? stats?.activeAdsCount ?? 0).toLocaleString(),
      sub: `${loadingAds ? "..." : pendingAdsCount} kutilmoqda`,
      icon: <Megaphone size={20} />,
      color: "#10b981",
    },
    {
      label: "Botlar",
      value: (stats?.activeBots ?? 0).toLocaleString(),
      sub: `${loadingBots ? "..." : pendingBotsCount} kutilmoqda`,
      icon: <Bot size={20} />,
      color: "#a855f7",
    },
    {
      label: "Platforma Daromadi",
      value: `$${(stats?.totalRevenue ?? stats?.totalSpent ?? 0).toLocaleString()}`,
      sub: "USDT",
      icon: <Wallet size={20} />,
      color: "#f59e0b",
    },
    {
      label: "Kutilayotgan Reklamalar",
      value: loadingAds ? "..." : pendingAdsCount.toString(),
      sub: "Moderatsiya kerak",
      icon: <ShieldAlert size={20} />,
      color: "#ef4444",
    },
    {
      label: "Kutilayotgan Botlar",
      value: loadingBots ? "..." : pendingBotsCount.toString(),
      sub: "Tasdiqlash kerak",
      icon: <Clock size={20} />,
      color: "#ef4444",
    },
  ];

  const activityChartData = analyticsData?.chartData ?? [];
  const revenueChartData = revenueData ?? [];
  const totalRevenue = revenueChartData.reduce((sum, d) => sum + d.revenue, 0);
  const totalSpent = analyticsData?.chartData?.reduce((sum, d) => sum + d.spent, 0) ?? 0;

  return (
    <div className="elite-analytics-wrap">
      <div className="page-head" style={{ marginBottom: 32 }}>
        <div className="page-head-left">
          <div
            className="section-title"
            style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" }}
          >
            Bosh sahifa
          </div>
          <div className="section-sub" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
            Platforma holati — bugun,{" "}
            {new Date().toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div
        className="elite-stat-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 40 }}
      >
        {dashboardStats.map((stat, i) => (
          <div className="elite-card" key={i} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${stat.color}15`, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {stat.label}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity chart + Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 32, alignItems: "start" }}>
        {/* Activity bar chart — real data */}
        <div className="elite-card" style={{ padding: 32, minHeight: 400 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>Faollik grafigi</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Reklamalar soni</p>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setActivityPeriod(opt.value)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    background: activityPeriod === opt.value ? "var(--blue, #3b82f6)" : "rgba(255,255,255,0.06)",
                    color: activityPeriod === opt.value ? "#fff" : "rgba(255,255,255,0.4)",
                    transition: "all 0.2s",
                  }}
                >
                  {opt.label}
                </button>
              ))}
              <div className="badge badge-primary" style={{ padding: "6px 12px", marginLeft: 8 }}>LIVE</div>
            </div>
          </div>
          {activityChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={activityChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} />
                <Tooltip
                  contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 13 }}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar dataKey="impressions" name="Ko'rishlar" fill="rgba(59,130,246,0.7)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clicks" name="Kliklar" fill="rgba(16,185,129,0.7)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", fontSize: 14 }}>
              Ma'lumot yuklanmoqda...
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="elite-card" style={{ padding: 32 }}>
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>Tezkor harakatlar</h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Moderatsiya va kutilayotgan ishlar</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {pendingAdsCount > 0 && (
              <div
                onClick={() => navigate("/pending-ads")}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", background: "rgba(245,158,11, 0.05)", borderRadius: 16, border: "1px solid rgba(245,158,11, 0.1)", cursor: "pointer", transition: "all 0.2s ease" }}
                className="action-notification"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(245,158,11, 0.1)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{pendingAdsCount} ta reklama kutilmoqda</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Moderatsiya navbati</div>
                  </div>
                </div>
                <ChevronRight size={20} color="rgba(255,255,255,0.3)" />
              </div>
            )}
            {pendingBotsCount > 0 && (
              <div
                onClick={() => navigate("/pending-bots")}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", background: "rgba(168,85,247, 0.05)", borderRadius: 16, border: "1px solid rgba(168,85,247, 0.1)", cursor: "pointer", transition: "all 0.2s ease" }}
                className="action-notification"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(168,85,247, 0.1)", color: "#a855f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Bot size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{pendingBotsCount} ta bot kutmoqda</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Tasdiqlash navbati</div>
                  </div>
                </div>
                <ChevronRight size={20} color="rgba(255,255,255,0.3)" />
              </div>
            )}
            {pendingWithdrawalsCount > 0 && canAdminAccess(role) && (
              <div
                onClick={() => navigate("/withdrawals")}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", background: "rgba(59,130,246, 0.05)", borderRadius: 16, border: "1px solid rgba(59,130,246, 0.1)", cursor: "pointer", transition: "all 0.2s ease" }}
                className="action-notification"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(59,130,246, 0.1)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Wallet size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{pendingWithdrawalsCount} ta to'lov</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>To'lovlar navbati</div>
                  </div>
                </div>
                <ChevronRight size={20} color="rgba(255,255,255,0.3)" />
              </div>
            )}
            {pendingAdsCount === 0 && pendingBotsCount === 0 && (
              <div style={{ padding: "40px 20px", textAlign: "center", borderRadius: 16, border: "1px dashed rgba(255,255,255,0.1)" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <ShieldAlert size={20} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Barcha navbatlar bo'sh</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Ajoyib ish! 🎉</div>
              </div>
            )}
          </div>
          <style>{`.action-notification:hover { background: rgba(255,255,255,0.03) !important; transform: translateX(4px); }`}</style>
        </div>
      </div>

      {/* Platform Revenue Chart */}
      <div className="elite-card" style={{ marginTop: 40, padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(245,158,11,0.12)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>Platforma daromadi</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Umumiy pul aylanmasi va platforma ulushi</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[...PERIOD_OPTIONS, { label: "Barchasi", value: "all" }].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRevenuePeriod(opt.value)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  background: revenuePeriod === opt.value ? "#f59e0b" : "rgba(255,255,255,0.06)",
                  color: revenuePeriod === opt.value ? "#000" : "rgba(255,255,255,0.4)",
                  transition: "all 0.2s",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 28 }}>
          {[
            { label: "Jami aylanma", value: `$${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "#3b82f6" },
            { label: "Platforma daromadi", value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "#f59e0b" },
            { label: "Fee foizi", value: `${stats?.platformFeePercentage ?? 0}%`, color: "#10b981" },
          ].map((item, i) => (
            <div key={i} style={{ padding: "16px 20px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{item.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>

        {revenueChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueChartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradSpent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`} />
              <Tooltip
                contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 13 }}
                formatter={(value: unknown, name?: string) => [`$${Number(value ?? 0).toFixed(2)}`, name ?? ""]}
              />
              <Area type="monotone" dataKey="revenue" name="Platforma daromadi" stroke="#f59e0b" strokeWidth={2.5} fill="url(#gradRevenue)" dot={false} activeDot={{ r: 5, fill: "#f59e0b" }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", fontSize: 14 }}>
            Ma'lumot yuklanmoqda...
          </div>
        )}
      </div>

      {/* System Terminal */}
      <div style={{ marginTop: 40 }}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>Tizim terminali</h3>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Real-vaqt rejimida platforma xabarlari va voqealar</p>
        </div>
        <SystemTerminal />
      </div>
    </div>
  );
}
