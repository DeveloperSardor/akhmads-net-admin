import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useApproveAd, useRejectAd, useRequestAdEdit } from "../../hooks/queries/useAds";
import { useApproveBot, useRejectBot } from "../../hooks/queries/useBots";
import { useApproveWithdrawal, useRejectWithdrawal, useBanUser, useUnbanUser, useTopUpUserWallet } from "../../hooks/queries/useAdmin";
import { API_BASE_URL } from "../../api/client";

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function ModalRenderer({ modal, setModal }: any) {
    const [reason, setReason] = useState("");
    const { type, data } = modal;

    const approveAd = useApproveAd();
    const rejectAd = useRejectAd();
    const requestAdEdit = useRequestAdEdit();

    const approveBot = useApproveBot();
    const rejectBot = useRejectBot();

    const approveWithdrawal = useApproveWithdrawal();
    const rejectWithdrawal = useRejectWithdrawal();

    const banUser = useBanUser();
    const unbanUser = useUnbanUser();
    const topUpWallet = useTopUpUserWallet();

    const [amount, setAmount] = useState("");
    const [copied, setCopied] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const close = () => { setModal(null); setReason(""); setAmount(""); };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
            <div className="modal">
                {/* View Ad */}
                {type === "view-ad" && (
                    <>
                        <div className="modal-title">📢 Reklama tafsilotlari</div>
                        <div className="modal-field"><span className="modal-label">Sarlavha</span><div className="modal-value" style={{ fontSize: 16, fontWeight: 600 }}>{data.title}</div></div>
                        <div className="modal-field"><span className="modal-label">Matn</span><div style={{ fontSize: 13, lineHeight: 1.6 }}>{data.text}</div></div>
                        <div className="modal-divider" />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                            {[
                                ["Egasi", `@${data.advertiser?.username || data.advertiser?.firstName || data.ownerUsername || 'noma'}`],
                                ["CPM", `$${Number(data.cpmBid || (data.totalCost / (data.targetImpressions / 1000)) || 0).toFixed(2)}`],
                                ["Byudjet", `$${Number(data.totalCost || data.budget || 0).toFixed(2)}`],
                                ["Tur", data.contentType || "-"],
                                ["Kategoriya", `#${data.category || ""}`],
                                ["Ko'rishlar", `${(data.deliveredImpressions || 0).toLocaleString()} / ${(data.targetImpressions || 0).toLocaleString()}`]
                            ].map(([l, v]) => (
                                <div key={l}><span className="modal-label">{l}</span><div className="modal-value">{v}</div></div>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-success" onClick={() => { approveAd.mutate(data.id); close(); }} disabled={approveAd.isPending}>✓ Tasdiqlash</button>
                            <button className="btn btn-danger" onClick={() => setModal({ type: "reject-ad", data })}>✕ Rad etish</button>
                            <button className="btn btn-ghost" onClick={close}>Yopish</button>
                        </div>
                    </>
                )}

                {/* View Bot */}
                {type === "view-bot" && (
                    <>
                        <div className="modal-title">🤖 Bot tafsilotlari</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                            <div className="user-avatar" style={{ width: 48, height: 48, fontSize: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                                {data.username ? (
                                    <img src={`${API_BASE_URL}/bots/avatar/${data.username}`} alt={data.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    (data.firstName || data.name || "B")[0].toUpperCase()
                                )}
                            </div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 600 }}>{data.firstName || data.name}</div>
                                <div className="mono" style={{ fontSize: 12, color: "var(--accent2)" }}>@{data.username}</div>
                            </div>
                        </div>
                        <div className="modal-divider" />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            {[["Egasi", `@${data.ownerUsername || ""}`], ["Kategoriya", `#${data.category || ""}`], ["Til", (data.language || "").toUpperCase()], ["Obunachi", (data.totalMembers || 0).toLocaleString()]].map(([l, v]) => (
                                <div key={l}><span className="modal-label">{l}</span><div className="modal-value">{v}</div></div>
                            ))}
                        </div>
                        {data.botstatData && (
                            <div style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.1)", borderRadius: 10, padding: "12px", marginTop: 16 }}>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>🌟 BotStat Auditory Metrics</div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                                    <div><span className="modal-label">User (Live)</span><div className="modal-value" style={{ color: "var(--green)", fontWeight: 600 }}>{(data.botstatData.users_live || 0).toLocaleString()}</div></div>
                                    <div><span className="modal-label">User (Die)</span><div className="modal-value" style={{ color: "var(--red)", fontWeight: 600 }}>{(data.botstatData.users_die || 0).toLocaleString()}</div></div>
                                    <div><span className="modal-label">Groups (Live)</span><div className="modal-value" style={{ fontWeight: 600 }}>{(data.botstatData.groups_live || 0).toLocaleString()}</div></div>
                                </div>
                            </div>
                        )}
                        <div className="modal-actions" style={{ marginTop: 24 }}>
                            <button className="btn btn-success" onClick={() => { approveBot.mutate(data.id); close(); }} disabled={approveBot.isPending}>✓ Tasdiqlash</button>
                            <button className="btn btn-danger" onClick={() => setModal({ type: "reject-bot", data })}>✕ Rad etish</button>
                            <button className="btn btn-ghost" onClick={close}>Yopish</button>
                        </div>
                    </>
                )}

                {/* Reject Ad */}
                {type === "reject-ad" && (
                    <>
                        <div className="modal-title">Reklamani rad etish</div>
                        <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 16 }}>"{data.title}" reklamasini rad etasizmi?</div>
                        <div className="modal-field">
                            <span className="modal-label">Sabab (foydalanuvchiga yuboriladi)</span>
                            <textarea className="modal-input" placeholder="Rad etish sababini kiriting..." value={reason} onChange={e => setReason(e.target.value)} />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-danger" onClick={() => { rejectAd.mutate({ id: data.id, reason }); close(); }} disabled={rejectAd.isPending}>Rad etish</button>
                            <button className="btn btn-ghost" onClick={close}>Bekor</button>
                        </div>
                    </>
                )}

                {/* Reject Bot */}
                {type === "reject-bot" && (
                    <>
                        <div className="modal-title">Botni rad etish</div>
                        <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 16 }}>"{data.name}" botini rad etasizmi?</div>
                        <div className="modal-field">
                            <span className="modal-label">Sabab</span>
                            <textarea className="modal-input" placeholder="Rad etish sababini kiriting..." value={reason} onChange={e => setReason(e.target.value)} />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-danger" onClick={() => { rejectBot.mutate({ id: data.id, reason }); close(); }} disabled={rejectBot.isPending}>Rad etish</button>
                            <button className="btn btn-ghost" onClick={close}>Bekor</button>
                        </div>
                    </>
                )}

                {/* Request Edit Ad */}
                {type === "request-edit-ad" && (
                    <>
                        <div className="modal-title">Tahrirlash so'rash</div>
                        <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 16 }}>"{data.title}" reklamasiga tahrirlash so'rovi yuborasizmi?</div>
                        <div className="modal-field">
                            <span className="modal-label">Izoh (foydalanuvchiga yuboriladi)</span>
                            <textarea className="modal-input" placeholder="Nima o'zgartirilishi kerakligini yozing..." value={reason} onChange={e => setReason(e.target.value)} />
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn btn-primary"
                                disabled={requestAdEdit.isPending || !reason.trim()}
                                onClick={() => { requestAdEdit.mutate({ id: data.id, feedback: reason }); close(); }}
                            >
                                So'rov yuborish
                            </button>
                            <button className="btn btn-ghost" onClick={close}>Bekor</button>
                        </div>
                    </>
                )}

                {/* Approve Withdrawal */}
                {type === "approve-withdrawal" && (
                    <>
                        <div className="modal-title">✅ To'lovni tasdiqlash</div>
                        <div style={{ background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.3)", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
                            <div style={{ fontSize: 11, color: "#fbbf24", marginBottom: 4 }}>⚠️ MUHIM ESLATMA</div>
                            <div style={{ fontSize: 12, lineHeight: 1.6 }}>Avval USDT ni qo'lda jo'nating, keyin "Tasdiqlash" bosing!</div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                            {[
                                ["Foydalanuvchi", `@${data.user?.username || data.username || "?"}`],
                                ["So'ragan miqdor", `$${data.amount} USDT`],
                                ["Komissiya", `$${data.fee}`],
                                ["Jo'natiladigan", `$${data.netAmount || data.amountToSend} USDT`]
                            ].map(([l, v]) => (
                                <div key={l}><span className="modal-label">{l}</span><div className="modal-value" style={{ fontWeight: 600 }}>{v}</div></div>
                            ))}
                        </div>
                        <div className="modal-field">
                            <span className="modal-label">Wallet manzili (BEP-20)</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                                <div className="modal-value addr addr-full" style={{ background: "var(--surface2)", padding: "8px 12px", borderRadius: 8, fontSize: 12, flex: 1 }}>{data.address || data.walletAddress || "-"}</div>
                                <button className="btn btn-ghost btn-sm btn-icon" title="Nusxa olish" onClick={() => copyToClipboard(data.address || data.walletAddress || "")} style={{ flexShrink: 0 }}>
                                    {copied ? <Check size={14} style={{ color: "var(--green)" }} /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-success" onClick={() => { approveWithdrawal.mutate(data.id); setModal(null); }} disabled={approveWithdrawal.isPending}>✓ Tasdiqlash (jo'natildi)</button>
                            <button className="btn btn-danger" onClick={() => { rejectWithdrawal.mutate({ id: data.id }); setModal(null); }} disabled={rejectWithdrawal.isPending}>✕ Rad etish</button>
                            <button className="btn btn-ghost" onClick={close}>Yopish</button>
                        </div>
                    </>
                )}

                {/* View Withdrawal */}
                {type === "view-withdrawal" && (
                    <>
                        <div className="modal-title">📋 Chiqarish so'rovi tafsilotlari</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                            {[
                                ["Foydalanuvchi", `@${data.user?.username || data.username || "?"}`],
                                ["Telegram ID", data.user?.telegramId || "-"],
                                ["So'ragan miqdor", `$${data.amount} USDT`],
                                ["Komissiya", `$${data.fee}`],
                                ["Jo'natiladigan", `$${data.netAmount || data.amountToSend} USDT`],
                                ["Status", data.status || "-"],
                                ["To'lov usuli", `${data.coin || "USDT"} (${data.network || "BEP20"})`],
                                ["Sana", data.createdAt ? fmtDate(data.createdAt) : "-"],
                            ].map(([l, v]) => (
                                <div key={l}><span className="modal-label">{l}</span><div className="modal-value" style={{ fontWeight: 600 }}>{v}</div></div>
                            ))}
                        </div>
                        <div className="modal-field">
                            <span className="modal-label">Wallet manzili (BEP-20)</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                                <div className="modal-value addr addr-full" style={{ background: "var(--surface2)", padding: "8px 12px", borderRadius: 8, fontSize: 12, wordBreak: "break-all", flex: 1 }}>{data.address || data.walletAddress || "-"}</div>
                                <button className="btn btn-ghost btn-sm btn-icon" title="Nusxa olish" onClick={() => copyToClipboard(data.address || data.walletAddress || "")} style={{ flexShrink: 0 }}>
                                    {copied ? <Check size={14} style={{ color: "var(--green)" }} /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>
                        {data.txHash && (
                            <div className="modal-field">
                                <span className="modal-label">Tranzaksiya hash</span>
                                <div className="modal-value addr addr-full" style={{ background: "var(--surface2)", padding: "8px 12px", borderRadius: 8, marginTop: 4, fontSize: 12, wordBreak: "break-all" }}>{data.txHash}</div>
                            </div>
                        )}
                        <div className="modal-actions">
                            {(data.status === "REQUESTED" || data.status === "PENDING_REVIEW") && (
                                <>
                                    <button className="btn btn-success" onClick={() => setModal({ type: "approve-withdrawal", data })}>✓ Tasdiqlash</button>
                                    <button className="btn btn-danger" onClick={() => { rejectWithdrawal.mutate({ id: data.id }); close(); }} disabled={rejectWithdrawal.isPending}>✕ Rad etish</button>
                                </>
                            )}
                            <button className="btn btn-ghost" onClick={close}>Yopish</button>
                        </div>
                    </>
                )}

                {/* View User */}
                {type === "view-user" && (
                    <>
                        <div className="modal-title">👤 Foydalanuvchi profili</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                            <div className="user-avatar" style={{ width: 48, height: 48, fontSize: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>{(data.firstName || data.username || "?")[0]}</div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 600 }}>{data.firstName || ""} {data.lastName || ""}</div>
                                <div className="mono" style={{ fontSize: 12, color: "var(--accent2)" }}>@{data.username || "noma'lum"}</div>
                                {data.isBanned && <span className="badge badge-red" style={{ marginTop: 4 }}>BLOKLANGAN</span>}
                            </div>
                        </div>
                        <div className="modal-divider" />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                            {[
                                ["Telegram ID", data.telegramId || "-"],
                                ["Balans", `$${(Number(data.wallet?.available) || 0).toFixed(2)}`],
                                ["Jami depozit", `$${(Number(data.wallet?.totalDeposited) || 0).toFixed(2)}`],
                                ["Jami daromad", `$${(Number(data.wallet?.totalEarned) || 0).toFixed(2)}`],
                                ["Botlar", data._count?.bots || 0],
                                ["Reklamalar", data._count?.ads || 0]
                            ].map(([l, v]) => (
                                <div key={l}><span className="modal-label">{l}</span><div className="modal-value">{v}</div></div>
                            ))}
                        </div>
                        <div style={{ marginTop: 12 }}><span className="modal-label">Qo'shilgan</span><div className="modal-value">{data.joinedAt ? fmtDate(data.joinedAt) : "-"}</div></div>
                        <div className="modal-actions">
                            {data.isBanned ? (
                                <button className="btn btn-success" disabled={unbanUser.isPending} onClick={() => { unbanUser.mutate(data.id); setModal(null); }}>✓ Unblok qilish</button>
                            ) : (
                                <button className="btn btn-danger" disabled={banUser.isPending} onClick={() => { banUser.mutate({ id: data.id, reason: "Admin qildi" }); setModal(null); }}>⊘ Bloklash</button>
                            )}
                            <button className="btn btn-primary" onClick={() => setModal({ type: "topup-user", data })}>💰 To'ldirish</button>
                            <button className="btn btn-ghost" onClick={close}>Yopish</button>
                        </div>
                    </>
                )}

                {/* Topup User Wallet */}
                {type === "topup-user" && (
                    <>
                        <div className="modal-title">💰 Hamyonni to'ldirish</div>
                        <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 16 }}>
                            <b>{data.firstName || data.username}</b> hamyoniga mablag' qo'shish
                        </div>
                        <div className="modal-field">
                            <span className="modal-label">Miqdor (USDT)</span>
                            <input
                                type="number"
                                className="modal-input"
                                placeholder="Masalan: 10.50"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                        </div>
                        <div className="modal-field">
                            <span className="modal-label">Sabab / Izoh</span>
                            <textarea
                                className="modal-input"
                                placeholder="To'ldirish sababini yozing..."
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                            />
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn btn-success"
                                disabled={topUpWallet.isPending || !amount || !reason}
                                onClick={() => {
                                    topUpWallet.mutate({ id: data.id, amount: parseFloat(amount), reason }, {
                                        onSuccess: () => close()
                                    });
                                }}
                            >
                                ✓ Tasdiqlash
                            </button>
                            <button className="btn btn-ghost" onClick={close}>Bekor</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
