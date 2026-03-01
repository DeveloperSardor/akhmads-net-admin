import { useState } from "react";
import {
    Radio,
    Check,
    X,
    Edit,
    Users,
    DollarSign,
    Clock,
    Bot,
    RefreshCw,
} from "lucide-react";
import { adminService } from "../../api/services/admin.service";

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

type TabStatus = "PENDING" | "APPROVED" | "RUNNING" | "COMPLETED" | "REJECTED";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
    PENDING:   { label: "Kutilmoqda",  className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    APPROVED:  { label: "Tasdiqlandi", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    RUNNING:   { label: "Yuborilmoqda", className: "bg-green-500/15 text-green-400 border-green-500/30" },
    COMPLETED: { label: "Tugadi",      className: "bg-gray-500/15 text-gray-400 border-gray-500/30" },
    REJECTED:  { label: "Rad etildi",  className: "bg-red-500/15 text-red-400 border-red-500/30" },
    DRAFT:     { label: "Qoralama",    className: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
};

export function BroadcastModerationPage() {
    const [tab, setTab] = useState<TabStatus>("PENDING");
    const [broadcasts, setBroadcasts] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [rejectModal, setRejectModal] = useState<{ id: string; mode: "reject" | "edit" } | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [error, setError] = useState("");

    const load = async (status: TabStatus) => {
        setLoading(true);
        setError("");
        try {
            const res = await adminService.getAllBroadcasts({ status, limit: 50, offset: 0 });
            const data = res?.data ?? [];
            setBroadcasts(Array.isArray(data) ? data : []);
            setTotal(res?.pagination?.total ?? data.length);
        } catch (e: any) {
            setError(e?.response?.data?.message || "Yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    // Load on mount and tab change
    const handleTab = (t: TabStatus) => {
        setTab(t);
        load(t);
    };

    // Initial load
    useState(() => { load("PENDING"); });

    const handleApprove = async (id: string) => {
        setActionLoading(id + "-approve");
        try {
            await adminService.approveBroadcast(id);
            setBroadcasts(prev => prev.filter(b => b.id !== id));
        } catch (e: any) {
            alert(e?.response?.data?.message || "Xatolik");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectOrEdit = async () => {
        if (!rejectModal || !rejectReason.trim()) return;
        setActionLoading(rejectModal.id);
        try {
            if (rejectModal.mode === "reject") {
                await adminService.rejectBroadcast(rejectModal.id, rejectReason);
            } else {
                await adminService.requestBroadcastEdit(rejectModal.id, rejectReason);
            }
            setBroadcasts(prev => prev.filter(b => b.id !== rejectModal.id));
            setRejectModal(null);
            setRejectReason("");
        } catch (e: any) {
            alert(e?.response?.data?.message || "Xatolik");
        } finally {
            setActionLoading(null);
        }
    };

    const tabs: { key: TabStatus; label: string }[] = [
        { key: "PENDING",   label: "Kutilmoqda" },
        { key: "APPROVED",  label: "Tasdiqlangan" },
        { key: "RUNNING",   label: "Yuborilmoqda" },
        { key: "COMPLETED", label: "Tugagan" },
        { key: "REJECTED",  label: "Rad etilgan" },
    ];

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <Radio size={22} style={{ display: "inline", marginRight: 8, verticalAlign: "middle" }} />
                        Broadcast Moderatsiya
                    </h1>
                    <p className="page-subtitle">Reklama broadcastlarini ko'rib chiqing va boshqaring</p>
                </div>
                <button className="btn btn-secondary" onClick={() => load(tab)}>
                    <RefreshCw size={14} /> Yangilash
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => handleTab(t.key)}
                        className={`btn ${tab === t.key ? "btn-primary" : "btn-secondary"}`}
                        style={{ fontSize: 13 }}
                    >
                        {t.label}
                        {tab === t.key && total > 0 && (
                            <span style={{
                                marginLeft: 6, background: "rgba(255,255,255,0.2)",
                                borderRadius: 10, padding: "1px 7px", fontSize: 11
                            }}>{total}</span>
                        )}
                    </button>
                ))}
            </div>

            {error && (
                <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>
            )}

            {loading ? (
                <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
                    <RefreshCw size={24} style={{ animation: "spin 1s linear infinite" }} />
                    <p style={{ marginTop: 12 }}>Yuklanmoqda...</p>
                </div>
            ) : broadcasts.length === 0 ? (
                <div style={{
                    textAlign: "center", padding: 60, color: "var(--text-muted)",
                    background: "var(--card)", borderRadius: 12, border: "1px solid var(--border)"
                }}>
                    <Radio size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <p>Broadcast topilmadi</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {broadcasts.map(b => {
                        const badge = STATUS_BADGE[b.status] || STATUS_BADGE["PENDING"];
                        const advertiserName = b.advertiser?.username
                            ? `@${b.advertiser.username}`
                            : `${b.advertiser?.firstName || ""} ${b.advertiser?.lastName || ""}`.trim() || "—";

                        return (
                            <div key={b.id} style={{
                                background: "var(--card)", border: "1px solid var(--border)",
                                borderRadius: 12, padding: 20,
                            }}>
                                {/* Header */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                            <span style={{
                                                fontSize: 11, fontWeight: 700, padding: "3px 8px",
                                                borderRadius: 6, border: "1px solid",
                                            }} className={badge.className}>
                                                {badge.label}
                                            </span>
                                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                                <Clock size={11} style={{ display: "inline", marginRight: 3 }} />
                                                {fmtDate(b.createdAt)}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                            ID: <code style={{ fontSize: 11 }}>{b.id}</code>
                                        </div>
                                    </div>

                                    {/* Action buttons — only for PENDING */}
                                    {b.status === "PENDING" && (
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <button
                                                className="btn btn-success"
                                                style={{ fontSize: 12, padding: "6px 14px" }}
                                                disabled={actionLoading === b.id + "-approve"}
                                                onClick={() => handleApprove(b.id)}
                                            >
                                                <Check size={14} />
                                                {actionLoading === b.id + "-approve" ? "..." : "Tasdiqlash"}
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ fontSize: 12, padding: "6px 14px" }}
                                                onClick={() => { setRejectModal({ id: b.id, mode: "edit" }); setRejectReason(""); }}
                                            >
                                                <Edit size={14} />
                                                Edit so'r
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                style={{ fontSize: 12, padding: "6px 14px" }}
                                                onClick={() => { setRejectModal({ id: b.id, mode: "reject" }); setRejectReason(""); }}
                                            >
                                                <X size={14} />
                                                Rad etish
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 16 }}>
                                    <div style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 12px" }}>
                                        <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                                            Reklamachi
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>{advertiserName}</div>
                                    </div>
                                    <div style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 12px" }}>
                                        <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                                            <Bot size={10} style={{ display: "inline", marginRight: 3 }} />
                                            Bot
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                                            @{b.bot?.username || "?"}
                                        </div>
                                    </div>
                                    <div style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 12px" }}>
                                        <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                                            <Users size={10} style={{ display: "inline", marginRight: 3 }} />
                                            Qabul qiluvchilar
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>{b.targetCount?.toLocaleString() || 0}</div>
                                    </div>
                                    <div style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 12px" }}>
                                        <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                                            <DollarSign size={10} style={{ display: "inline", marginRight: 3 }} />
                                            Narx
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                                            ${parseFloat(b.totalCost || 0).toFixed(2)}
                                        </div>
                                    </div>
                                    {b.sentCount != null && (
                                        <div style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 12px" }}>
                                            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                                                Yuborildi
                                            </div>
                                            <div style={{ fontSize: 13, fontWeight: 600 }}>
                                                {b.sentCount || 0} / {b.targetCount || 0}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Message preview */}
                                {b.text && (
                                    <div style={{
                                        background: "var(--bg)", borderRadius: 8, padding: "12px 14px",
                                        borderLeft: "3px solid var(--primary)"
                                    }}>
                                        <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                                            Xabar matni
                                        </div>
                                        <div style={{
                                            fontSize: 13, color: "var(--text-main)", whiteSpace: "pre-wrap",
                                            maxHeight: 120, overflow: "hidden", position: "relative"
                                        }}>
                                            {b.text.substring(0, 300)}{b.text.length > 300 ? "..." : ""}
                                        </div>
                                    </div>
                                )}

                                {/* Buttons preview */}
                                {b.buttons && Array.isArray(b.buttons) && b.buttons.length > 0 && (
                                    <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                        {b.buttons.map((btn: any, i: number) => (
                                            <span key={i} style={{
                                                fontSize: 11, padding: "4px 10px", borderRadius: 6,
                                                background: btn.color === "green" ? "rgba(16,185,129,0.15)"
                                                    : btn.color === "red" ? "rgba(239,68,68,0.15)"
                                                    : "rgba(99,102,241,0.15)",
                                                color: btn.color === "green" ? "#10b981"
                                                    : btn.color === "red" ? "#ef4444"
                                                    : "#818cf8",
                                                border: "1px solid currentColor",
                                            }}>
                                                {btn.text}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Reject / Edit Modal */}
            {rejectModal && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
                }}>
                    <div style={{
                        background: "var(--card)", border: "1px solid var(--border)",
                        borderRadius: 16, padding: 28, width: 440, maxWidth: "90vw"
                    }}>
                        <h3 style={{ marginBottom: 16, fontSize: 17, fontWeight: 700 }}>
                            {rejectModal.mode === "reject" ? "❌ Rad etish" : "✏️ Tahrir so'rash"}
                        </h3>
                        <textarea
                            rows={4}
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder={rejectModal.mode === "reject" ? "Rad etish sababi..." : "Tahrirlanishi kerak bo'lgan narsa..."}
                            style={{
                                width: "100%", padding: "10px 14px", borderRadius: 10,
                                background: "var(--bg)", border: "1px solid var(--border)",
                                color: "var(--text-main)", fontSize: 13, resize: "vertical",
                                outline: "none", fontFamily: "inherit", boxSizing: "border-box"
                            }}
                        />
                        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                            <button
                                className={`btn ${rejectModal.mode === "reject" ? "btn-danger" : "btn-secondary"}`}
                                disabled={!rejectReason.trim() || !!actionLoading}
                                onClick={handleRejectOrEdit}
                                style={{ flex: 1 }}
                            >
                                {actionLoading ? "..." : rejectModal.mode === "reject" ? "Rad etish" : "So'rov yuborish"}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => { setRejectModal(null); setRejectReason(""); }}
                                style={{ flex: 1 }}
                            >
                                Bekor qilish
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
