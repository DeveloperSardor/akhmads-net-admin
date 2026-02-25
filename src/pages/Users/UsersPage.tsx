import { useState } from "react";
import { useAdminUsers, useBanUser, useUnbanUser } from "../../hooks/queries/useAdmin";
import {
    Search,
    UserMinus,
    UserCheck,
    Eye,
    Users as UsersIcon,
    Wallet,
    TrendingUp,
    ShieldAlert,
    X
} from "lucide-react";

export function UsersPage({ setModal }: { setModal: (modal: any) => void }) {
    const [search, setSearch] = useState("");
    const { data: response, isLoading } = useAdminUsers({ search } as any);
    const banMutation = useBanUser();
    const unbanMutation = useUnbanUser();

    const respData = response as any;
    const users = (respData?.data || []) as any[];

    const filtered = users.filter((u: any) =>
        (u.username || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.firstName || "").toLowerCase().includes(search.toLowerCase())
    );

    const totalBalance = users.reduce((acc, u) => acc + (Number(u.balance) || 0), 0);
    const totalEarned = users.reduce((acc, u) => acc + (Number(u.totalEarned) || 0), 0);

    return (
        <div className="animate-in">
            <div className="page-head">
                <div className="page-head-left">
                    <div className="section-title">Foydalanuvchilar</div>
                    <div className="section-sub">Tizimdagi barcha mijozlar va hamkorlar</div>
                </div>
                <div className="search-container">
                    <Search className="search-icon" size={16} />
                    <input
                        className="form-input search-input"
                        placeholder="Username yoki ism bo'yicha qidirish..."
                        value={search} onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="search-clear" onClick={() => setSearch("")}>
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-icon-wrap blue">
                        <UsersIcon size={20} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-label">Jami foydalanuvchilar</div>
                        <div className="stat-value">{users.length}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-wrap green">
                        <Wallet size={20} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-label">Umumiy balans</div>
                        <div className="stat-value">${totalBalance.toFixed(2)}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-wrap purple">
                        <TrendingUp size={20} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-label">Jami daromad</div>
                        <div className="stat-value">${totalEarned.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Foydalanuvchi</th>
                                <th>Telegram ID</th>
                                <th>Balans / Daromad</th>
                                <th style={{ textAlign: "center" }}>Faollik</th>
                                <th>Holat</th>
                                <th>Amal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: 60 }}>
                                        <div className="loading-spinner"></div>
                                        <div style={{ marginTop: 12, color: "var(--text3)", fontSize: 13 }}>Ma'lumotlar yuklanmoqda...</div>
                                    </td>
                                </tr>
                            )}
                            {!isLoading && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="empty-state">
                                            <div className="empty-icon-wrap">
                                                <Search size={32} strokeWidth={1.5} />
                                            </div>
                                            <div className="empty-title">Foydalanuvchi topilmadi</div>
                                            <div className="empty-text">Qidiruv so'rovini boshqacha ko'rinishda yozib ko'ring</div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {filtered.map((u: any) => (
                                <tr key={u.id} className="hover-row">
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div className="user-avatar-premium">
                                                {(u.firstName || u.username || "?")[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-main)" }}>
                                                    {u.firstName || ""} {u.lastName || ""}
                                                </div>
                                                <div className="mono" style={{ fontSize: 11, color: "var(--accent2)" }}>
                                                    @{u.username || "noma'lum"}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="mono" style={{ fontSize: 12, color: "var(--text3)" }}>{u.telegramId || "-"}</td>
                                    <td>
                                        <div className="mono" style={{ fontWeight: 600, color: "var(--green)", fontSize: 13 }}>
                                            Balans: ${(Number(u.balance) || 0).toFixed(2)}
                                        </div>
                                        <div className="mono" style={{ fontSize: 11, color: "var(--text3)" }}>
                                            Daromad: ${(Number(u.totalEarned) || 0).toFixed(2)}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: "center" }}>
                                        <div style={{ display: "inline-flex", gap: 4 }}>
                                            <div className="mini-stat" title="Botlar">🤖 {u.botsCount || 0}</div>
                                            <div className="mini-stat" title="Reklamalar">📢 {u.adsCount || 0}</div>
                                        </div>
                                    </td>
                                    <td>
                                        {u.isBanned ? (
                                            <span className="badge badge-danger-soft">
                                                <ShieldAlert size={10} style={{ marginRight: 4 }} />
                                                BLOKLANGAN
                                            </span>
                                        ) : (
                                            <span className="badge badge-success-soft">
                                                FAOL
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <button
                                                className="btn btn-ghost btn-sm btn-icon"
                                                title="Ko'rish"
                                                onClick={() => setModal({ type: "view-user", data: u })}
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className={`btn btn-sm btn-icon ${u.isBanned ? "btn-success-soft" : "btn-danger-soft"}`}
                                                title={u.isBanned ? "Blokdan ochish" : "Bloklash"}
                                                onClick={() => u.isBanned ? unbanMutation.mutate(u.id) : banMutation.mutate({ id: u.id, reason: "Admin qildi" })}
                                                disabled={banMutation.isPending || unbanMutation.isPending}
                                            >
                                                {u.isBanned ? <UserCheck size={16} /> : <UserMinus size={16} />}
                                            </button>
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

