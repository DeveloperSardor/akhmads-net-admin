import { useState } from "react";
import type { BotStatus } from "../../AppTypes";
import { usePendingBots } from "../../hooks/queries/useBots";

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

    // As Bots service doesn't have `getAll` (yet in our example), we will reuse getPendingBots as a placeholder
    // Or we should build a useBots that mimics All... we'll use a mocked empty array for now until fixed
    const { data: response, isLoading } = usePendingBots();
    const responseData = response as any;
    const bots = (responseData?.data || []) as any[];
    // Temp mock filter, ideally we pass `statusFilter` to query params
    const filtered = statusFilter === "all" ? bots : bots.filter(b => b.status === statusFilter);

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
                                        <div style={{ fontWeight: 500 }}>{bot.firstName || bot.name}</div>
                                        <div className="mono" style={{ fontSize: 11, color: "var(--accent2)" }}>{bot.username}</div>
                                    </td>
                                    <td className="mono" style={{ fontSize: 12 }}>@{bot.ownerUsername}</td>
                                    <td><span className={`badge ${botStatusColor[bot.status] || "badge-gray"}`}>{botStatusMap[bot.status] || bot.status}</span></td>
                                    <td><span className="tag">#{bot.category}</span></td>
                                    <td className="mono" style={{ fontWeight: 600 }}>{(bot.totalMembers || 0).toLocaleString()}</td>
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
