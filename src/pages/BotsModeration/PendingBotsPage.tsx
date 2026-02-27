import {
    Bot,
    Eye,
    Check,
    X,
    ExternalLink,
    Users,
    Globe,
    Tag,
    Calendar,
    TrendingUp,
    Shield
} from "lucide-react";
import { usePendingBots, useApproveBot } from "../../hooks/queries/useBots";
import { API_BASE_URL } from "../../api/client";

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

export function PendingBotsPage({ setModal }: { setModal: (modal: any) => void }) {
    const { data: response, isLoading } = usePendingBots();
    const approveBot = useApproveBot();
    const responseData = response as any;
    const bots = (responseData?.data || []) as any[];
    const totalCount = responseData?.total || bots.length;

    // Calculate queue stats
    const avgSubscribers = bots.length > 0
        ? Math.round(bots.reduce((acc, b) => acc + (b.totalMembers || 0), 0) / bots.length)
        : 0;

    if (isLoading) {
        return (
            <div className="elite-analytics-wrap">
                <div className="page-head" style={{ marginBottom: 40 }}>
                    <div className="page-head-left">
                        <h1 className="section-title" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>Botlar Moderatsiyasi</h1>
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
                    <h1 className="section-title" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>Botlar Moderatsiyasi</h1>
                    <p className="section-sub" style={{ fontSize: 16 }}>
                        Hozirda <span style={{ color: 'var(--blue)', fontWeight: 700 }}>{totalCount} ta</span> bot tasdiqlash uchun navbatda turibdi
                    </p>
                </div>
                <div className="elite-live-pill">
                    <div className="elite-live-pulse" style={{ background: '#f59e0b' }} />
                    Navbat: {totalCount} ta faol
                </div>
            </div>

            <div className="elite-stat-grid" style={{ marginBottom: 32 }}>
                <div className="elite-stat-box">
                    <div className="elite-stat-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        <Shield size={24} />
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <div className="elite-stat-value">{totalCount}</div>
                        <div className="elite-stat-label">Kutayotgan botlar</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Moderatsiya navbati</div>
                    </div>
                </div>
                <div className="elite-stat-box">
                    <div className="elite-stat-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                        <Users size={24} />
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <div className="elite-stat-value">{avgSubscribers.toLocaleString()}</div>
                        <div className="elite-stat-label">O'rtacha obunachilar</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Botlar sifati ko'rsatkichi</div>
                    </div>
                </div>
                <div className="elite-stat-box">
                    <div className="elite-stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <div className="elite-stat-value">92%</div>
                        <div className="elite-stat-label">Tasdiqlash darajasi</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Oxirgi 30 kunlik trend</div>
                    </div>
                </div>
            </div>

            <div className="elite-card">
                <div className="elite-chart-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 20 }}>
                    <div>
                        <h3 className="elite-chart-title">Navbatdagi Botlar</h3>
                        <p className="elite-chart-sub">Ma'lumotlarni diqqat bilan tekshiring</p>
                    </div>
                    <div className="elite-stat-icon-wrap" style={{ width: 44, height: 44, borderRadius: 12 }}>
                        <Bot size={20} />
                    </div>
                </div>

                <div className="table-wrap" style={{ marginTop: 10 }}>
                    <table className="elite-table">
                        <thead>
                            <tr>
                                <th>Bot Identifikatsiyasi</th>
                                <th>Kategoriya va Til</th>
                                <th>Egasi</th>
                                <th>Yuborilgan</th>
                                <th style={{ textAlign: 'right' }}>Amallar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bots.length === 0 ? (
                                <tr>
                                    <td colSpan={5}>
                                        <div className="elite-empty-state" style={{ padding: '60px 0' }}>
                                            <div className="elite-empty-icon" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>
                                                <Check size={32} />
                                            </div>
                                            <div className="elite-empty-title">Ajoyib! Navbat bo'sh</div>
                                            <p className="elite-empty-text">Hozirda tasdiqlash uchun yangi botlar yo'q.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : bots.map((bot: any) => (
                                <tr key={bot.id} className="elite-tr">
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                            <div className="user-avatar" style={{
                                                width: 44,
                                                height: 44,
                                                fontSize: 18,
                                                fontWeight: 800,
                                            }}>
                                                {bot.username ? (
                                                    <img
                                                        src={`${API_BASE_URL}/bots/avatar/${bot.username}`}
                                                        alt={bot.username}
                                                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                                        onError={(e) => {
                                                            const name = bot.firstName || bot.name || "B";
                                                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff&size=128&bold=true`;
                                                        }}
                                                    />
                                                ) : (
                                                    (bot.firstName || bot.name || "B")[0].toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-main)' }}>{bot.firstName || bot.name}</div>
                                                <div className="mono" style={{ fontSize: 12, color: "var(--blue)", fontWeight: 500 }}>
                                                    <a href={`https://t.me/${bot.username.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        {bot.username} <ExternalLink size={10} />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Tag size={12} style={{ color: 'var(--text-muted)' }} />
                                                <span className="tag" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a855f7', border: '1px solid rgba(139, 92, 246, 0.2)', fontSize: 11 }}>
                                                    {bot.category}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Globe size={12} style={{ color: 'var(--text-muted)' }} />
                                                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                                                    {(bot.language || "UZ").toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="mono" style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                                            @{bot.owner?.username || bot.ownerUsername}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12 }}>
                                            <Calendar size={12} />
                                            {fmtDate(bot.createdAt)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                                            <button
                                                className="btn btn-success btn-sm btn-icon elite-action-btn"
                                                title="Tasdiqlash"
                                                onClick={() => approveBot.mutate(bot.id)}
                                                disabled={approveBot.isPending}
                                                style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none' }}
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-sm btn-icon elite-action-btn"
                                                title="Batafsil"
                                                onClick={() => setModal({ type: "view-bot", data: bot })}
                                                style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none' }}
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm btn-icon elite-action-btn"
                                                title="Rad etish"
                                                onClick={() => setModal({ type: "reject-bot", data: bot })}
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
