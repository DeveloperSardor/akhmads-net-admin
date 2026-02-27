import { useState } from "react";
import {
    Shield,
    Megaphone,
    Bot,
    Check,
    X,
    Edit,
    TrendingUp,
    Target,
    DollarSign,
    Users,
    Globe,
    FileText,
    Image as ImageIcon,
    Video,
    Clock
} from "lucide-react";
import { usePendingAds, useApproveAd } from "../../hooks/queries/useAds";
import { usePendingBots, useApproveBot } from "../../hooks/queries/useBots";

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

const getAvatarGradient = (id: string, type: 'ad' | 'bot') => {
    const adColors = [
        'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
        'linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)',
        'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
    ];
    const botColors = [
        'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
        'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)'
    ];
    const colors = type === 'ad' ? adColors : botColors;
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
};

const getContentTypeIcon = (type: string) => {
    switch (type) {
        case 'TEXT': return <FileText size={12} />;
        case 'IMAGE': return <ImageIcon size={12} />;
        case 'VIDEO': return <Video size={12} />;
        default: return <Megaphone size={12} />;
    }
};

// fmtDate already defined above

export function ModerationQueuePage({ setModal }: { setModal: (modal: any) => void }) {
    const [tab, setTab] = useState<"ads" | "bots">("ads");

    const { data: adsResponse, isLoading: adsLoading } = usePendingAds();
    const { data: botsResponse, isLoading: botsLoading } = usePendingBots();

    const approveAdMutation = useApproveAd();
    const approveBotMutation = useApproveBot();

    const adsData = adsResponse as any;
    const ads = (adsData?.data || []) as any[];
    const totalAds = adsData?.total || ads.length;

    const botsData = botsResponse as any;
    const bots = (botsData?.data || []) as any[];
    const totalBots = botsData?.total || bots.length;

    const totalInQueue = totalAds + totalBots;

    if (adsLoading && botsLoading) {
        return (
            <div className="elite-analytics-wrap">
                <div className="page-head" style={{ marginBottom: 40 }}>
                    <div className="page-head-left">
                        <h1 className="section-title" style={{ fontSize: 32, fontWeight: 800 }}>Moderatsiya Markazi</h1>
                        <p className="section-sub">Tizim holati yuklanmoqda...</p>
                    </div>
                </div>
                <div className="elite-empty-state" style={{ padding: '100px 0' }}>
                    <div className="loading-spinner" />
                </div>
            </div>
        );
    }

    return (
        <div className="elite-analytics-wrap">
            <div className="page-head" style={{ marginBottom: 40 }}>
                <div className="page-head-left">
                    <h1 className="section-title" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>Moderatsiya Markazi</h1>
                    <p className="section-sub" style={{ fontSize: 16 }}>
                        Hozirda jami <span style={{ color: 'var(--blue)', fontWeight: 700 }}>{totalInQueue} ta</span> element navbatda turibdi
                    </p>
                </div>
                <div className="elite-live-pill">
                    <div className="elite-live-pulse" style={{ background: '#3b82f6' }} />
                    Live: {totalInQueue} ta kutilmoqda
                </div>
            </div>

            <div className="elite-stat-grid" style={{ marginBottom: 32 }}>
                <div className="elite-stat-box">
                    <div className="elite-stat-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        <Shield size={24} />
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <div className="elite-stat-value">{totalInQueue}</div>
                        <div className="elite-stat-label">Jami Navbat</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Barcha kutilayotganlar</div>
                    </div>
                </div>
                <div className="elite-stat-box">
                    <div className="elite-stat-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        <Megaphone size={24} />
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <div className="elite-stat-value">{totalAds}</div>
                        <div className="elite-stat-label">Reklamalar</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Moderatsiyadagi e'lonlar</div>
                    </div>
                </div>
                <div className="elite-stat-box">
                    <div className="elite-stat-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                        <Bot size={24} />
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <div className="elite-stat-value">{totalBots}</div>
                        <div className="elite-stat-label">Botlar</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Yangi bot arizalari</div>
                    </div>
                </div>
            </div>

            <div className="elite-tabs-pill-wrap" style={{ marginBottom: 24, display: 'flex', gap: 12, background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 16, width: 'max-content', border: '1px solid var(--border-color)' }}>
                <button
                    className={`elite-tab-pill ${tab === "ads" ? "active" : ""}`}
                    onClick={() => setTab("ads")}
                    style={{
                        padding: '10px 24px',
                        borderRadius: 12,
                        border: 'none',
                        background: tab === "ads" ? 'var(--blue)' : 'transparent',
                        color: tab === "ads" ? 'white' : 'var(--text-muted)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}
                >
                    <Megaphone size={16} />
                    Reklamalar
                    <span style={{
                        background: tab === "ads" ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: 11
                    }}>
                        {adsLoading ? "..." : totalAds}
                    </span>
                </button>
                <button
                    className={`elite-tab-pill ${tab === "bots" ? "active" : ""}`}
                    onClick={() => setTab("bots")}
                    style={{
                        padding: '10px 24px',
                        borderRadius: 12,
                        border: 'none',
                        background: tab === "bots" ? 'var(--blue)' : 'transparent',
                        color: tab === "bots" ? 'white' : 'var(--text-muted)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}
                >
                    <Bot size={16} />
                    Botlar
                    <span style={{
                        background: tab === "bots" ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: 11
                    }}>
                        {botsLoading ? "..." : totalBots}
                    </span>
                </button>
            </div>

            <div className="elite-queue-stream" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {tab === "ads" && (
                    adsLoading ? <div className="elite-loading">Yuklanmoqda...</div> :
                        ads.length === 0 ? (
                            <div className="elite-card" style={{ padding: '60px 0', textAlign: 'center' }}>
                                <div className="elite-empty-icon" style={{ margin: '0 auto 20px', width: 64, height: 64, borderRadius: '50%', border: '2px dashed var(--green)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Check size={32} />
                                </div>
                                <h3 style={{ fontSize: 20, fontWeight: 700 }}>Hamma reklamalar ko'rib chiqildi</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Hozircha yangi e'lonlar yo'q</p>
                            </div>
                        ) : ads.map((ad: any) => (
                            <div className="elite-card elite-queue-item-card" key={ad.id} style={{ display: 'flex', gap: 24, padding: 24, position: 'relative', overflow: 'hidden' }}>
                                <div className="elite-queue-item-visual">
                                    <div className="user-avatar" style={{
                                        width: 64,
                                        height: 64,
                                        fontSize: 24,
                                        background: getAvatarGradient(ad.id, 'ad'),
                                        fontWeight: 900,
                                        borderRadius: 16
                                    }}>
                                        {(ad.title || "A")[0].toUpperCase()}
                                    </div>
                                </div>
                                <div className="elite-queue-item-content" style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <div>
                                            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 4 }}>{ad.title}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Users size={14} /> {ad.advertiser?.firstName || ad.advertiser?.username || 'Noma\'lum'}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Clock size={14} /> {fmtDate(ad.createdAt)}
                                                </span>
                                                <span className="badge badge-gray" style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    {getContentTypeIcon(ad.contentType)} {ad.contentType}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="elite-action-suite" style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                className="btn btn-success elite-action-btn"
                                                onClick={() => approveAdMutation.mutate(ad.id)}
                                                disabled={approveAdMutation.isPending}
                                                style={{ padding: '8px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                                            >
                                                <Check size={16} /> Tasdiqlash
                                            </button>
                                            <button
                                                className="btn btn-ghost elite-action-btn"
                                                onClick={() => setModal({ type: "request-edit-ad", data: ad })}
                                                style={{ padding: '8px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(59, 130, 246, 0.1)', color: 'var(--blue)', border: 'none' }}
                                            >
                                                <Edit size={16} /> Tahrirlash
                                            </button>
                                            <button
                                                className="btn btn-danger elite-action-btn"
                                                onClick={() => setModal({ type: "reject-ad", data: ad })}
                                                style={{ padding: '8px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none' }}
                                            >
                                                <X size={16} /> Rad etish
                                            </button>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, marginBottom: 16, background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 10 }}>
                                        {ad.text}
                                    </p>
                                    <div className="elite-queue-tags" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                        <span className="tag" style={{ border: '1px solid rgba(168, 85, 247, 0.2)', color: '#a855f7' }}>#{ad.category}</span>
                                        <span className="tag" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <TrendingUp size={12} /> CPM: ${ad.cpmBid}
                                        </span>
                                        <span className="tag" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Target size={12} /> {(ad.targetImpressions || 0).toLocaleString()} ko'rishlar
                                        </span>
                                        <span className="tag" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                            <DollarSign size={12} /> Byudjet: ${ad.totalCost || ad.budget || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                )}

                {tab === "bots" && (
                    botsLoading ? <div className="elite-loading">Yuklanmoqda...</div> :
                        bots.length === 0 ? (
                            <div className="elite-card" style={{ padding: '60px 0', textAlign: 'center' }}>
                                <div className="elite-empty-icon" style={{ margin: '0 auto 20px', width: 64, height: 64, borderRadius: '50%', border: '2px dashed var(--purple)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Check size={32} />
                                </div>
                                <h3 style={{ fontSize: 20, fontWeight: 700 }}>Hamma botlar ko'rib chiqildi</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Hozircha yangi arizalar yo'q</p>
                            </div>
                        ) : bots.map((bot: any) => (
                            <div className="elite-card elite-queue-item-card" key={bot.id} style={{ display: 'flex', gap: 24, padding: 24 }}>
                                <div className="elite-queue-item-visual">
                                    <div className="user-avatar" style={{
                                        width: 64,
                                        height: 64,
                                        fontSize: 24,
                                        background: getAvatarGradient(bot.id, 'bot'),
                                        fontWeight: 900,
                                        borderRadius: 16
                                    }}>
                                        {(bot.name || "B")[0].toUpperCase()}
                                    </div>
                                </div>
                                <div className="elite-queue-item-content" style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <div>
                                            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 4 }}>{bot.name}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                                                <span style={{ color: 'var(--blue)', fontWeight: 600 }}>{bot.username}</span>
                                                <span>@{bot.ownerUsername}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Clock size={14} /> {fmtDate(bot.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="elite-action-suite" style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                className="btn btn-success elite-action-btn"
                                                onClick={() => approveBotMutation.mutate(bot.id)}
                                                disabled={approveBotMutation.isPending}
                                                style={{ padding: '8px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                                            >
                                                <Check size={16} /> Tasdiqlash
                                            </button>
                                            <button
                                                className="btn btn-danger elite-action-btn"
                                                onClick={() => setModal({ type: "reject-bot", data: bot })}
                                                style={{ padding: '8px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none' }}
                                            >
                                                <X size={16} /> Rad etish
                                            </button>
                                        </div>
                                    </div>
                                    <div className="elite-queue-tags" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                        <span className="tag" style={{ border: '1px solid rgba(168, 85, 247, 0.2)', color: '#a855f7', background: 'rgba(168, 85, 247, 0.05)' }}>#{bot.category}</span>
                                        <span className="tag" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Globe size={12} /> {bot.language.toUpperCase()}
                                        </span>
                                        <span className="tag" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(59, 130, 246, 0.1)', color: 'var(--blue)' }}>
                                            <Users size={12} /> {(bot.totalMembers || bot.subscriberCount || 0).toLocaleString()} obuna
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                )}
            </div>

            <style>{`
                .elite-queue-item-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid var(--border-color);
                }
                .elite-queue-item-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.2) !important;
                    background: rgba(255,255,255,0.02);
                }
                .elite-tab-pill:hover:not(.active) {
                    background: rgba(255,255,255,0.05) !important;
                    color: var(--text-main) !important;
                }
                .elite-action-btn {
                    transition: transform 0.2s ease;
                }
                .elite-action-btn:hover {
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
}
