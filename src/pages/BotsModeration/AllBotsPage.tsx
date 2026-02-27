import { useState } from "react";
import type { BotStatus } from "../../AppTypes";
import { useAllBots } from "../../hooks/queries/useBots";
import { API_BASE_URL } from "../../api/client";

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const botStatusColor: Record<string, string> = {
    PENDING: "badge-amber",
    APPROVED: "badge-blue",
    ACTIVE: "badge-green",
    PAUSED: "badge-gray",
    REJECTED: "badge-red",
};

const botStatusMap: Record<string, string> = {
    all: "Barchasi",
    PENDING: "Kutilmoqda",
    APPROVED: "Tasdiqlangan",
    ACTIVE: "Faol",
    PAUSED: "To'xtatilgan",
    REJECTED: "Rad etilgan",
};

export function AllBotsPage() {
    const [statusFilter, setStatusFilter] = useState<BotStatus | "all">("all");
    const { data: response, isLoading } = useAllBots(statusFilter !== "all" ? { status: statusFilter } : {});
    const responseData = response as any;
    const filtered = (responseData?.data || []) as any[];
    const bots = filtered; // Compatibility with line 42

    return (
        <div>
            <div className="page-head">
                <div className="page-head-left">
                    <div className="section-title">Barcha botlar</div>
                    <div className="section-sub">{bots.length} ta ulanish</div>
                </div>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                {(["all", "PENDING", "APPROVED", "ACTIVE", "PAUSED", "REJECTED"]).map(s => (
                    <button key={s} className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-ghost"}`} onClick={() => setStatusFilter(s as any)}>
                        {botStatusMap[s] || s}
                    </button>
                ))}
            </div>
            <div className="card">
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr><th>Bot</th><th>Egasi</th><th>Status</th><th>Kategoriya</th><th>Auditoriya</th><th>Ko'rsatilgan</th><th>Daromad</th><th>Sana</th></tr>
                        </thead>
                        <tbody>
                            {isLoading && <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--text2)" }}>Yuklanmoqda...</td></tr>}
                            {!isLoading && filtered.length === 0 && <tr><td colSpan={8}><div className="empty">Ma'lumot topilmadi</div></td></tr>}
                            {filtered.map((bot: any) => (
                                <tr key={bot.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div className="user-avatar" style={{
                                                width: 32,
                                                height: 32,
                                                fontSize: 14,
                                                fontWeight: 800,
                                            }}>
                                                {bot.username ? (
                                                    <img
                                                        src={`${API_BASE_URL}/bots/avatar/${bot.username}`}
                                                        alt={bot.username}
                                                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                                        onError={(e) => {
                                                            const name = bot.firstName || bot.name || "B";
                                                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff&size=64&bold=true`;
                                                        }}
                                                    />
                                                ) : (
                                                    (bot.firstName || bot.name || "B")[0].toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{bot.firstName || bot.name}</div>
                                                <div className="mono" style={{ fontSize: 11, color: "var(--accent2)" }}>{bot.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="mono" style={{ fontSize: 12 }}>@{bot.owner?.username || bot.ownerUsername}</td>
                                    <td><span className={`badge ${botStatusColor[bot.status] || "badge-gray"}`}>{botStatusMap[bot.status] || bot.status}</span></td>
                                    <td><span className="tag">#{bot.category}</span></td>
                                    <td>
                                        <div className="mono" style={{ fontWeight: 600 }}>{(bot.totalMembers || 0).toLocaleString()}</div>
                                        {bot.botstatData && (
                                            <div style={{ display: 'flex', gap: 6, fontSize: 10, marginTop: 4 }}>
                                                <span style={{ color: 'var(--green)' }}>L: {bot.botstatData.users_live || 0}</span>
                                                <span style={{ color: 'var(--red)' }}>D: {bot.botstatData.users_die || 0}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="mono">{(bot.adsReceived || 0).toLocaleString()}</td>
                                    <td className="mono" style={{ color: "var(--green)" }}>${(Number(bot.earnings) || 0).toFixed(2)}</td>
                                    <td style={{ fontSize: 11, color: "var(--text2)" }}>{fmtDate(bot.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
