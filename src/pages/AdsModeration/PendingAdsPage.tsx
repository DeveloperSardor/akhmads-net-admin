import {
    Megaphone,
    Eye,
    Check,
    X,
    Target,
    DollarSign,
    Calendar,
    TrendingUp,
    Shield,
    FileText,
    Image as ImageIcon,
    Video
} from "lucide-react";
import { usePendingAds, useApproveAd } from "../../hooks/queries/useAds";

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

const getAdGradient = (id: string) => {
    const colors = [
        'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
        'linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)',
        'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        'linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%)',
        'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
    ];
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
};

const getContentTypeIcon = (type: string) => {
    switch (type) {
        case 'TEXT': return { icon: <FileText size={12} />, label: 'MATN' };
        case 'IMAGE': return { icon: <ImageIcon size={12} />, label: 'RASM' };
        case 'VIDEO': return { icon: <Video size={12} />, label: 'VIDEO' };
        default: return { icon: <Megaphone size={12} />, label: type };
    }
};

export function PendingAdsPage({ setModal }: { setModal: (modal: any) => void }) {
    const { data: adsResponse, isLoading } = usePendingAds();
    const approveAd = useApproveAd();
    const ads = (adsResponse?.data || []) as any[];
    const totalCount = adsResponse?.total || ads.length;

    // Calculate queue stats
    const totalImpressions = ads.reduce((acc, ad) => acc + (ad.targetImpressions || 0), 0);
    const totalBudget = ads.reduce((acc, ad) => acc + (Number(ad.budget) || 0), 0);

    if (isLoading) {
        return (
            <div className="elite-analytics-wrap">
                <div className="page-head" style={{ marginBottom: 40 }}>
                    <div className="page-head-left">
                        <h1 className="section-title" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>Reklamalar Moderatsiyasi</h1>
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
                    <h1 className="section-title" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>Reklamalar Moderatsiyasi</h1>
                    <p className="section-sub" style={{ fontSize: 16 }}>
                        Hozirda <span style={{ color: 'var(--blue)', fontWeight: 700 }}>{totalCount} ta</span> reklama ko'rib chiqishni kutmoqda
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
                        <div className="elite-stat-label">Kutayotgan reklamalar</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Moderatsiya navbati</div>
                    </div>
                </div>
                <div className="elite-stat-box">
                    <div className="elite-stat-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        <Target size={24} />
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <div className="elite-stat-value">{totalImpressions.toLocaleString()}</div>
                        <div className="elite-stat-label">Jami ko'rishlar</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Kutilayotgan auditoriya qamrovi</div>
                    </div>
                </div>
                <div className="elite-stat-box">
                    <div className="elite-stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <DollarSign size={24} />
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <div className="elite-stat-value">${totalBudget.toLocaleString()}</div>
                        <div className="elite-stat-label">Jami byudjet</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Navbatdagi reklamalar qiymati</div>
                    </div>
                </div>
            </div>

            <div className="elite-card">
                <div className="elite-chart-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 20 }}>
                    <div>
                        <h3 className="elite-chart-title">Navbatdagi Reklamalar</h3>
                        <p className="elite-chart-sub">Reklama mazmuni va vizuallarini tekshiring</p>
                    </div>
                    <div className="elite-stat-icon-wrap" style={{ width: 44, height: 44, borderRadius: 12 }}>
                        <Megaphone size={20} />
                    </div>
                </div>

                <div className="table-wrap" style={{ marginTop: 10 }}>
                    <table className="elite-table">
                        <thead>
                            <tr>
                                <th>Reklama Mazmuni</th>
                                <th>CPM va Ko'rishlar</th>
                                <th>Byudjet</th>
                                <th>Egasi</th>
                                <th>Yuborilgan</th>
                                <th style={{ textAlign: 'right' }}>Amallar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ads.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="elite-empty-state" style={{ padding: '60px 0' }}>
                                            <div className="elite-empty-icon" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>
                                                <Check size={32} />
                                            </div>
                                            <div className="elite-empty-title">Hammasi joyida!</div>
                                            <p className="elite-empty-text">Hozirda moderatsiya uchun yangi reklamalar yo'q.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : ads.map((ad: any) => (
                                <tr key={ad.id} className="elite-tr">
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                            <div className="user-avatar" style={{
                                                width: 44,
                                                height: 44,
                                                fontSize: 18,
                                                background: getAdGradient(ad.id),
                                                fontWeight: 800,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                            }}>
                                                {(ad.title || "A")[0].toUpperCase()}
                                            </div>
                                            <div style={{ maxWidth: 220 }}>
                                                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ad.title}</div>
                                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ad.text}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                                    <span className="badge badge-gray" style={{ fontSize: 9, padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 3 }}>
                                                        {getContentTypeIcon(ad.contentType).icon} {getContentTypeIcon(ad.contentType).label}
                                                    </span>
                                                    <span className="tag" style={{ fontSize: 9, padding: '2px 6px' }}>#{ad.category}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <TrendingUp size={12} style={{ color: 'var(--blue)' }} />
                                                <span className="mono" style={{ fontWeight: 700, fontSize: 13 }}>${(Number(ad.cpmBid) || 0).toFixed(2)}</span>
                                                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>CPM</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Target size={12} style={{ color: 'var(--text-muted)' }} />
                                                <span className="mono" style={{ fontSize: 12 }}>{(ad.targetImpressions || 0).toLocaleString()}</span>
                                                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Ko'r.</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div className="elite-stat-icon-wrap" style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(16, 185, 129, 0.05)', color: '#10b981' }}>
                                                <DollarSign size={14} />
                                            </div>
                                            <div className="mono" style={{ fontWeight: 700, fontSize: 14, color: 'var(--green)' }}>
                                                ${(Number(ad.budget) || 0).toFixed(2)}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="mono" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                                            @{ad.advertiser?.username || ad.advertiser?.firstName || 'Noma\'lum'}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 11 }}>
                                            <Calendar size={12} />
                                            {fmtDate(ad.createdAt)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                                            <button
                                                className="btn btn-success btn-sm btn-icon elite-action-btn"
                                                title="Tasdiqlash"
                                                onClick={() => approveAd.mutate(ad.id)}
                                                disabled={approveAd.isPending}
                                                style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none' }}
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-sm btn-icon elite-action-btn"
                                                title="Batafsil"
                                                onClick={() => setModal({ type: "view-ad", data: ad })}
                                                style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none' }}
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm btn-icon elite-action-btn"
                                                title="Rad etish"
                                                onClick={() => setModal({ type: "reject-ad", data: ad })}
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
