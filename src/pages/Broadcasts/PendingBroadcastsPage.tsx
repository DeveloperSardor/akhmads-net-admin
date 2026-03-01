import {
    Radio,
    Check,
    X,
    Target,
    DollarSign,
    Calendar,
    Shield,
    Bot,
    Users
} from "lucide-react";
import { usePendingBroadcasts, useApproveBroadcast } from "../../hooks/queries/useBroadcasts";

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

export function PendingBroadcastsPage({ setModal }: { setModal: (modal: any) => void }) {
    const { data: broadcastsResponse, isLoading } = usePendingBroadcasts();
    const approveBroadcast = useApproveBroadcast();
    const broadcasts = (broadcastsResponse?.data || []) as any[];
    const totalCount = broadcastsResponse?.total || broadcasts.length;

    // Calculate queue stats
    const totalUsers = broadcasts.reduce((acc, b) => acc + (b.targetCount || 0), 0);
    const totalBudget = broadcasts.reduce((acc, b) => acc + (Number(b.totalCost) || 0), 0);

    if (isLoading) {
        return (
            <div className="elite-analytics-wrap">
                <div className="page-head" style={{ marginBottom: 40 }}>
                    <div className="page-head-left">
                        <h1 className="section-title" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>Broadcastlar Moderatsiyasi</h1>
                        <p className="section-sub" style={{ fontSize: 16 }}>Navbat yuklanmoqda...</p>
                    </div>
                </div>
                <div className="elite-empty-state" style={{ padding: '100px 0' }}>
                    <div className="loading-spinner" style={{ width: 40, height: 40 }} />
                    <div className="elite-empty-title" style={{ marginTop: 20 }}>Moderatsiya tizimi tayyorlanmoqda</div>
                </div>
            </div>
        );
    }

    return (
        <div className="elite-analytics-wrap">
            <div className="page-head" style={{ marginBottom: 40 }}>
                <div className="page-head-left">
                    <h1 className="section-title" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>Broadcastlar Moderatsiyasi</h1>
                    <p className="section-sub" style={{ fontSize: 16 }}>
                        Hozirda <span style={{ color: 'var(--blue)', fontWeight: 700 }}>{totalCount} ta</span> broadcast ko'rib chiqishni kutmoqda
                    </p>
                </div>
                <div className="elite-live-pill">
                    <div className="elite-live-pulse" style={{ background: '#ef4444' }} />
                    Navbat: {totalCount} ta faol
                </div>
            </div>

            <div className="elite-stat-grid" style={{ marginBottom: 32 }}>
                <div className="elite-stat-box">
                    <div className="elite-stat-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        <Shield size={24} />
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <div className="elite-stat-value">{totalCount}</div>
                        <div className="elite-stat-label">Kutayotganlar</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Moderatsiya navbati</div>
                    </div>
                </div>
                <div className="elite-stat-box">
                    <div className="elite-stat-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        <Users size={24} />
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <div className="elite-stat-value">{totalUsers.toLocaleString()}</div>
                        <div className="elite-stat-label">Jami qabul qiluvchilar</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Kutilayotgan auditoriya qamrovi</div>
                    </div>
                </div>
                <div className="elite-stat-box">
                    <div className="elite-stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <DollarSign size={24} />
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <div className="elite-stat-value">${totalBudget.toLocaleString()}</div>
                        <div className="elite-stat-label">Jami qiymat</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Navbatdagi broadcastlar hajmi</div>
                    </div>
                </div>
            </div>

            <div className="elite-card">
                <div className="elite-chart-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 20 }}>
                    <div>
                        <h3 className="elite-chart-title">Navbatdagi Broadcastlar</h3>
                        <p className="elite-chart-sub">Xabar mazmuni va auditoriyasini tekshiring</p>
                    </div>
                    <div className="elite-stat-icon-wrap" style={{ width: 44, height: 44, borderRadius: 12 }}>
                        <Radio size={20} />
                    </div>
                </div>

                <div className="table-wrap" style={{ marginTop: 10 }}>
                    <table className="elite-table">
                        <thead>
                            <tr>
                                <th>Xabar Matni</th>
                                <th>Bot & Auditoriya</th>
                                <th>Narxi</th>
                                <th>Egasi</th>
                                <th>Yuborilgan Vaqt</th>
                                <th style={{ textAlign: 'right' }}>Amallar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {broadcasts.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="elite-empty-state" style={{ padding: '60px 0' }}>
                                            <div className="elite-empty-icon" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>
                                                <Check size={32} />
                                            </div>
                                            <div className="elite-empty-title">Hammasi joyida!</div>
                                            <p className="elite-empty-text">Hozirda moderatsiya uchun yangi broadcastlar yo'q.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : broadcasts.map((b: any) => (
                                <tr key={b.id} className="elite-tr">
                                    <td>
                                        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                                            <div style={{ maxWidth: 280 }}>
                                                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.text?.slice(0, 60)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Bot size={12} style={{ color: 'var(--blue)' }} />
                                                <span className="mono" style={{ fontWeight: 700, fontSize: 13 }}>@{b.bot?.username || '?'}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Target size={12} style={{ color: 'var(--text-muted)' }} />
                                                <span className="mono" style={{ fontSize: 12 }}>{(b.targetCount || 0).toLocaleString()}</span>
                                                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>ta odam</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div className="elite-stat-icon-wrap" style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(16, 185, 129, 0.05)', color: '#10b981' }}>
                                                <DollarSign size={14} />
                                            </div>
                                            <div className="mono" style={{ fontWeight: 700, fontSize: 14, color: 'var(--green)' }}>
                                                ${(Number(b.totalCost) || 0).toFixed(2)}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="mono" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                                            @{b.advertiser?.username || b.advertiser?.firstName || 'Noma\'lum'}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 11 }}>
                                            <Calendar size={12} />
                                            {fmtDate(b.createdAt)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                                            <button
                                                className="btn btn-success btn-sm btn-icon elite-action-btn"
                                                title="Tasdiqlash"
                                                onClick={() => approveBroadcast.mutate(b.id)}
                                                disabled={approveBroadcast.isPending}
                                                style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none' }}
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm btn-icon elite-action-btn"
                                                title="Rad etish"
                                                onClick={() => setModal({ type: "reject-broadcast", data: b })}
                                                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none' }}
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .elite-tr {
                    transition: all 0.2s ease;
                }
                .elite-tr:hover {
                    background: rgba(255, 255, 255, 0.02) !important;
                }
                .elite-action-btn {
                    padding: 8px !important;
                    border-radius: 10px !important;
                    transition: transform 0.2s ease;
                }
                .elite-action-btn:hover {
                    transform: scale(1.1);
                }
                .elite-table th {
                    text-transform: uppercase;
                    font-size: 11px;
                    letter-spacing: 0.05em;
                    color: var(--text-muted);
                    padding-bottom: 20px !important;
                }
            `}</style>
        </div>
    );
}
