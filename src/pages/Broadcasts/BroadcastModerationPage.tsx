import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { adminService } from "../../api/services/admin.service";
import { Radio, Pause, Play } from "lucide-react";

type TabStatus = "PENDING_REVIEW" | "APPROVED" | "RUNNING" | "COMPLETED" | "REJECTED" | "DRAFT" | "all";

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

const statusColorMap: Record<string, string> = {
    PENDING_REVIEW: "badge-amber",
    APPROVED: "badge-blue",
    RUNNING: "badge-green",
    PAUSED: "badge-gray",
    COMPLETED: "badge-purple",
    REJECTED: "badge-red",
    DRAFT: "badge-gray",
};

const statusLabelMap: Record<string, string> = {
    all: "Barchasi",
    PENDING_REVIEW: "Kutilmoqda",
    APPROVED: "Tasdiqlangan",
    RUNNING: "Faol",
    PAUSED: "To'xtatilgan",
    COMPLETED: "Yakunlangan",
    REJECTED: "Rad etilgan",
    DRAFT: "Qoralama",
};

export function BroadcastModerationPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Parse initial tab from URL or default to all
    const initialTabMatch = new URLSearchParams(location.search).get("tab") as TabStatus;
    const initialTab = initialTabMatch || "all";

    const [statusFilter, setStatusFilter] = useState<TabStatus>(initialTab);
    const [broadcasts, setBroadcasts] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const load = async (status: TabStatus) => {
        setLoading(true);
        try {
            const apiStatus = status === "all" ? undefined : status;
            const res = await adminService.getAllBroadcasts({ status: apiStatus, limit: 50, offset: 0 });
            const data = res?.data ?? [];
            setBroadcasts(Array.isArray(data) ? data : []);
            setTotal(res?.pagination?.total ?? data.length);
        } catch (e: any) {
            console.error("Yuklashda xatolik", e);
            setBroadcasts([]);
        } finally {
            setLoading(false);
        }
    };

    // Load on mount and tab change
    const handleTab = (t: TabStatus) => {
        setStatusFilter(t);
        navigate(`/broadcasts${t === "all" ? "" : `?tab=${t}`}`, { replace: true });
        load(t);
    };

    // Listen to URL changes
    useEffect(() => {
        const currentTabConfig = new URLSearchParams(location.search).get("tab") as TabStatus;
        const targetTab = currentTabConfig || "all";
        if (targetTab !== statusFilter) {
            setStatusFilter(targetTab);
            load(targetTab);
        }
    }, [location.search]);

    // Initial load
    useEffect(() => {
        load(initialTab);
    }, []);

    const handlePause = async (id: string) => {
        setActionLoading(id + "-pause");
        try {
            await adminService.pauseBroadcast(id);
            load(statusFilter);
        } catch (e: any) {
            alert(e?.response?.data?.message || "Xatolik");
        } finally {
            setActionLoading(null);
        }
    };

    const handleResume = async (id: string) => {
        setActionLoading(id + "-resume");
        try {
            await adminService.resumeBroadcast(id);
            load(statusFilter);
        } catch (e: any) {
            alert(e?.response?.data?.message || "Xatolik");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div>
            <div className="page-head">
                <div className="page-head-left">
                    <div className="section-title">Barcha broadcastlar</div>
                    <div className="section-sub">{total} ta broadcast</div>
                </div>
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                {(["all", "PENDING_REVIEW", "APPROVED", "RUNNING", "COMPLETED", "REJECTED", "DRAFT"] as TabStatus[]).map(s => (
                    <button
                        key={s}
                        className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => handleTab(s)}
                    >
                        {statusLabelMap[s] || s}
                    </button>
                ))}
            </div>

            <div className="card">
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Xabar Matni</th>
                                <th>Egasi</th>
                                <th>Bot</th>
                                <th>Status</th>
                                <th>Qabul qildi / Qamrov</th>
                                <th>Narxi</th>
                                <th>Sana</th>
                                <th>Amallar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--text2)" }}>
                                        Yuklanmoqda...
                                    </td>
                                </tr>
                            )}
                            {!loading && broadcasts.length === 0 && (
                                <tr>
                                    <td colSpan={7}>
                                        <div className="empty">Ma'lumot topilmadi</div>
                                    </td>
                                </tr>
                            )}
                            {broadcasts.map((b: any) => (
                                <tr key={b.id}>
                                    <td>
                                        <div style={{ fontWeight: 500, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {b.text?.slice(0, 60)}
                                        </div>
                                    </td>
                                    <td className="mono" style={{ fontSize: 12 }}>
                                        @{b.advertiser?.username || b.advertiser?.firstName || "Noma'lum"}
                                    </td>
                                    <td className="mono" style={{ fontSize: 12, color: "var(--blue)" }}>
                                        <Radio size={12} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />
                                        @{b.bot?.username || "?"}
                                    </td>
                                    <td>
                                        <span className={`badge ${statusColorMap[b.status] || "badge-gray"}`}>
                                            {statusLabelMap[b.status] || b.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="mono" style={{ fontSize: 12 }}>
                                            {(b.sentCount || 0).toLocaleString()} / {(b.targetCount || 0).toLocaleString()}
                                        </div>
                                        <div className="progress-track" style={{ width: 100 }}>
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${Math.min(100, ((b.sentCount || 0) / (b.targetCount || 1)) * 100) || 0}%` }}
                                            />
                                        </div>
                                    </td>
                                    <td className="mono" style={{ color: "var(--green)" }}>
                                        ${(Number(b.totalCost) || 0).toFixed(2)}
                                    </td>
                                    <td style={{ fontSize: 11, color: "var(--text2)" }}>
                                        {fmtDate(b.createdAt)}
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            {b.status === "RUNNING" && (
                                                <button
                                                    className="btn btn-sm btn-ghost"
                                                    style={{ color: "var(--amber)", display: "flex", alignItems: "center", gap: 4 }}
                                                    disabled={actionLoading === b.id + "-pause"}
                                                    onClick={() => handlePause(b.id)}
                                                >
                                                    <Pause size={12} />
                                                    Pauza
                                                </button>
                                            )}
                                            {b.status === "PAUSED" && (
                                                <button
                                                    className="btn btn-sm btn-ghost"
                                                    style={{ color: "var(--green)", display: "flex", alignItems: "center", gap: 4 }}
                                                    disabled={actionLoading === b.id + "-resume"}
                                                    onClick={() => handleResume(b.id)}
                                                >
                                                    <Play size={12} />
                                                    Davom
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
