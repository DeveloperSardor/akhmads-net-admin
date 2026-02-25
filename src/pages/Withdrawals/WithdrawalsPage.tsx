import { useState } from "react";
import { useAdminWithdrawals, useRejectWithdrawal } from "../../hooks/queries/useAdmin";

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const wdStatusColor: Record<string, string> = {
    REQUESTED: "badge-amber",
    PENDING_REVIEW: "badge-blue",
    COMPLETED: "badge-green",
    REJECTED: "badge-red",
};

const wdStatusMap: Record<string, string> = {
    all: "Barchasi",
    REQUESTED: "Yaratilgan",
    PENDING_REVIEW: "Ko'rib chiqilmoqda",
    COMPLETED: "To'langan",
    REJECTED: "Rad etilgan",
};

export function WithdrawalsPage({ setModal }: { setModal: (modal: any) => void }) {
    const [filter, setFilter] = useState<"all" | string>("all");
    const { data: response, isLoading } = useAdminWithdrawals(filter !== "all" ? { status: filter } : {});
    const rejectMutation = useRejectWithdrawal();

    // As previously done, we explicitly cast the payload temporarily depending on backend formatting
    const respData = response as any;
    const withdrawals = (respData?.data || []) as any[];

    // We normally would fetch this summary natively, but here we can calculate it from response or separate endpoint
    const pendingTotal = withdrawals.filter((w: any) => w.status === "REQUESTED").reduce((s: number, w: any) => s + w.amountToSend, 0);

    return (
        <div>
            <div className="page-head">
                <div className="page-head-left">
                    <div className="section-title">Chiqarish so'rovlari</div>
                    <div className="section-sub">BEP-20 USDT · $3 doimiy komissiya</div>
                </div>
                <div style={{ background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.3)", borderRadius: 10, padding: "10px 16px", textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: "#fbbf24", textTransform: "uppercase", letterSpacing: 1 }}>Kutayotgan to'lovlar</div>
                    <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "DM Mono", color: "#fbbf24" }}>${pendingTotal.toFixed(2)} USDT</div>
                </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                {(["all", "REQUESTED", "PENDING_REVIEW", "COMPLETED", "REJECTED"]).map(s => (
                    <button key={s} className={`btn btn-sm ${filter === s ? "btn-primary" : "btn-ghost"}`} onClick={() => setFilter(s)}>
                        {wdStatusMap[s] || s}
                    </button>
                ))}
            </div>

            <div className="card">
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr><th>Foydalanuvchi</th><th>Miqdor</th><th>Fee</th><th>Jo'natiladi</th><th>Wallet manzili</th><th>Status</th><th>Vaqt</th><th>Amal</th></tr>
                        </thead>
                        <tbody>
                            {isLoading && <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--text2)" }}>Yuklanmoqda...</td></tr>}
                            {!isLoading && withdrawals.length === 0 && <tr><td colSpan={8}><div className="empty"><div className="empty-icon">○</div>Hech narsa topilmadi</div></td></tr>}
                            {withdrawals.map((w: any) => (
                                <tr key={w.id}>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div className="user-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{w.username[0].toUpperCase()}</div>
                                            <span className="mono" style={{ fontSize: 12 }}>@{w.username}</span>
                                        </div>
                                    </td>
                                    <td className="mono" style={{ fontWeight: 600 }}>${w.amount}</td>
                                    <td className="mono" style={{ color: "var(--red)" }}>-${w.fee}</td>
                                    <td className="mono" style={{ fontWeight: 700, color: "var(--green)" }}>${w.amountToSend}</td>
                                    <td>
                                        <div className="addr" title={w.walletAddress}>
                                            {w.walletAddress.slice(0, 8)}...{w.walletAddress.slice(-6)}
                                        </div>
                                    </td>
                                    <td><span className={`badge ${wdStatusColor[w.status]}`}>{wdStatusMap[w.status] || w.status}</span></td>
                                    <td style={{ fontSize: 11, color: "var(--text2)" }}>{fmtDate(w.requestedAt)}</td>
                                    <td>
                                        {(w.status === "REQUESTED" || w.status === "PENDING_REVIEW") ? (
                                            <div className="action-btns">
                                                <button className="btn btn-success btn-sm" onClick={() => setModal({ type: "approve-withdrawal", data: w })}>✓ Tasdiqlash</button>
                                                <button className="btn btn-danger btn-sm btn-icon" onClick={() => rejectMutation.mutate({ id: w.id })} disabled={rejectMutation.isPending}>✕</button>
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: 11, color: "var(--text3)" }}>—</span>
                                        )}
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
