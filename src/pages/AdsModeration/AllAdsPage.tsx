import { useState } from "react";
import { useAds } from "../../hooks/queries/useAds";
import type { AdStatus } from "../../AppTypes";

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const adStatusColor: Record<string, string> = {
    SUBMITTED: "badge-amber",
    APPROVED: "badge-blue",
    RUNNING: "badge-green",
    PAUSED: "badge-gray",
    COMPLETED: "badge-purple",
    REJECTED: "badge-red",
    DRAFT: "badge-gray",
};

const adStatusMap: Record<string, string> = {
    all: "Barchasi",
    SUBMITTED: "Yuborilgan",
    APPROVED: "Tasdiqlangan",
    RUNNING: "Faol",
    PAUSED: "To'xtatilgan",
    COMPLETED: "Yakunlangan",
    REJECTED: "Rad etilgan",
    DRAFT: "Qoralama",
};

export function AllAdsPage() {
    const [statusFilter, setStatusFilter] = useState<AdStatus | "all">("all");
    const { data: response, isLoading } = useAds(statusFilter !== "all" ? { status: statusFilter } : {});
    const ads = (response?.data || []) as any[]; // Temporary fix for type mismatch

    return (
        <div>
            <div className="page-head">
                <div className="page-head-left">
                    <div className="section-title">Barcha reklamalar</div>
                    <div className="section-sub">{ads.length} ta reklama</div>
                </div>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                {(["all", "SUBMITTED", "APPROVED", "RUNNING", "PAUSED", "COMPLETED", "REJECTED"]).map(s => (
                    <button key={s} className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-ghost"}`} onClick={() => setStatusFilter(s as any)}>
                        {adStatusMap[s] || s}
                    </button>
                ))}
            </div>
            <div className="card">
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr><th>Sarlavha</th><th>Egasi</th><th>Status</th><th>Impressions</th><th>CPM</th><th>Byudjet</th><th>Sana</th></tr>
                        </thead>
                        <tbody>
                            {isLoading && <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--text2)" }}>Yuklanmoqda...</td></tr>}
                            {!isLoading && ads.length === 0 && <tr><td colSpan={7}><div className="empty">Ma'lumot topilmadi</div></td></tr>}
                            {ads.map((ad: any) => (
                                <tr key={ad.id}>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{ad.text?.slice(0, 60)}</div>
                                        <div style={{ fontSize: 11, color: "var(--text2)" }}>{ad.contentType}</div>
                                    </td>
                                    <td className="mono" style={{ fontSize: 12 }}>@{ad.advertiser?.username || ad.advertiser?.firstName || 'Noma\'lum'}</td>
                                    <td><span className={`badge ${adStatusColor[ad.status]}`}>{adStatusMap[ad.status] || ad.status}</span></td>
                                    <td>
                                        <div className="mono" style={{ fontSize: 12 }}>{(ad.deliveredImpressions || 0).toLocaleString()} / {(ad.targetImpressions || 0).toLocaleString()}</div>
                                        <div className="progress-track" style={{ width: 100 }}>
                                            <div className="progress-fill" style={{ width: `${Math.min(100, (ad.deliveredImpressions / (ad.targetImpressions || 1)) * 100) || 0}%` }} />
                                        </div>
                                    </td>
                                    <td className="mono">${(Number(ad.cpmBid) || Number(ad.baseCpm) || 0).toFixed(2)}</td>
                                    <td className="mono">${(Number(ad.totalCost) || Number(ad.budget) || 0).toFixed(2)}</td>
                                    <td style={{ fontSize: 11, color: "var(--text2)" }}>{fmtDate(ad.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
