import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Shield, UserPlus, X, Trash2, Users, Search } from "lucide-react";
import type { Role } from "../../components/layout/Sidebar";
import { useAdminUsers, useUpdateUserRole } from "../../hooks/queries/useAdmin";
import type { UserProfile } from "../../api/services/auth.service";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "SUPPORT", "MODERATOR"];

const ROLE_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    SUPER_ADMIN: { label: "Super Admin",  color: "#a78bfa", bg: "rgba(167,139,250,.15)", icon: "👑" },
    ADMIN:       { label: "Admin",        color: "#60a5fa", bg: "rgba(96,165,250,.15)",  icon: "🛡️" },
    MODERATOR:   { label: "Moderator",    color: "#34d399", bg: "rgba(52,211,153,.15)",  icon: "🔍" },
    SUPPORT:     { label: "Support",      color: "#fb923c", bg: "rgba(251,146,60,.15)",  icon: "💬" },
};

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric" });

const avatarColor = (role: string) => ROLE_META[role]?.color ?? "#94a3b8";

export function AdminsPage({ showToast }: any) {
    const { role } = useOutletContext<{ role: Role }>();
    const [showForm, setShowForm] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [newRole, setNewRole] = useState<string>("MODERATOR");
    const [search, setSearch] = useState("");

    const { data: usersRes, isLoading } = useAdminUsers({ limit: 100 });
    const updateRole = useUpdateUserRole();

    const users: UserProfile[] = usersRes?.data || [];
    const admins = users.filter((u) => ADMIN_ROLES.includes(u.role));
    const filtered = admins.filter((u) =>
        !search ||
        u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.telegramId?.includes(search)
    );

    const addAdmin = () => {
        if (!newUsername.trim()) { showToast("Username yoki Telegram ID kiritish shart!", "error"); return; }
        const targetUser = users.find(
            (u) =>
                u.username?.toLowerCase() === newUsername.toLowerCase().trim() ||
                u.telegramId === newUsername.trim()
        );
        if (!targetUser) {
            showToast("Bunday foydalanuvchi topilmadi. Avval tizimga kirgan bo'lishi kerak.", "error");
            return;
        }
        updateRole.mutate({ id: targetUser.id, role: newRole }, {
            onSuccess: () => {
                setNewUsername("");
                setNewRole("MODERATOR");
                setShowForm(false);
                showToast(`@${targetUser.username || targetUser.firstName} — ${ROLE_META[newRole]?.label || newRole} sifatida tayinlandi ✓`);
            },
            onError: () => showToast("Xatolik yuz berdi", "error"),
        });
    };

    const removeAdmin = (user: UserProfile) => {
        if (user.role === "SUPER_ADMIN" && role !== "superadmin") {
            showToast("Super adminni o'chirish uchun sizda huquq yo'q!", "error"); return;
        }
        if (!confirm(`@${user.username || user.firstName} dan admin huquqlarini olasizmi?`)) return;
        updateRole.mutate({ id: user.id, role: "ADVERTISER" }, {
            onSuccess: () => showToast("Admin huquqlari olib tashlandi", "info"),
            onError: () => showToast("Xatolik yuz berdi", "error"),
        });
    };

    return (
        <div className="elite-analytics-wrap">
            {/* Header */}
            <div className="page-head" style={{ marginBottom: 32 }}>
                <div className="page-head-left">
                    <h1 className="section-title" style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>
                        Admin boshqaruvi
                    </h1>
                    <p className="section-sub" style={{ fontSize: 14, marginTop: 4 }}>
                        Rol ierarxiyasi: Super Admin → Admin → Moderator → Support
                    </p>
                </div>
                {role === "superadmin" && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowForm(!showForm)}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12 }}
                    >
                        <UserPlus size={16} />
                        Admin qo'shish
                    </button>
                )}
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
                {Object.entries(ROLE_META).map(([key, meta]) => {
                    const count = admins.filter(u => u.role === key).length;
                    return (
                        <div key={key} className="elite-stat-box" style={{ flex: "1 1 160px", minWidth: 160, padding: "16px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 22 }}>{meta.icon}</span>
                                <div>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: meta.color }}>{count}</div>
                                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{meta.label}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add form */}
            {showForm && (
                <div className="elite-card" style={{ marginBottom: 24, border: "1px solid rgba(167,139,250,.3)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className="elite-stat-icon-wrap" style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(167,139,250,.15)" }}>
                                <UserPlus size={18} style={{ color: "#a78bfa" }} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 15 }}>Yangi admin qo'shish</div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Foydalanuvchi avval tizimga kirgan bo'lishi kerak</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowForm(false)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                        {/* Username input */}
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, display: "block", letterSpacing: ".05em", textTransform: "uppercase" }}>
                                Telegram username yoki ID
                            </label>
                            <div style={{ position: "relative" }}>
                                <span style={{
                                    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                                    fontSize: 14, color: "var(--text-muted)", pointerEvents: "none", userSelect: "none",
                                }}>@</span>
                                <input
                                    placeholder="username yoki 123456789"
                                    value={newUsername}
                                    onChange={e => setNewUsername(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && addAdmin()}
                                    style={{
                                        width: "100%",
                                        background: "rgba(255,255,255,.05)",
                                        border: "1.5px solid rgba(255,255,255,.1)",
                                        borderRadius: 12,
                                        padding: "12px 14px 12px 30px",
                                        fontSize: 14,
                                        color: "#fff",
                                        outline: "none",
                                        transition: "border-color .2s",
                                        boxSizing: "border-box",
                                    }}
                                    onFocus={e => (e.currentTarget.style.borderColor = "rgba(167,139,250,.6)")}
                                    onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,.1)")}
                                />
                            </div>
                        </div>

                        {/* Role selector — custom cards */}
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, display: "block", letterSpacing: ".05em", textTransform: "uppercase" }}>
                                Rol
                            </label>
                            <div style={{ display: "grid", gridTemplateColumns: role === "superadmin" ? "1fr 1fr" : "1fr 1fr 1fr", gap: 8 }}>
                                {(role === "superadmin" ? [
                                    { value: "SUPER_ADMIN", icon: "👑", label: "Super Admin" },
                                    { value: "ADMIN",       icon: "🛡️", label: "Admin" },
                                    { value: "MODERATOR",   icon: "🔍", label: "Moderator" },
                                    { value: "SUPPORT",     icon: "💬", label: "Support" },
                                ] : [
                                    { value: "ADMIN",     icon: "🛡️", label: "Admin" },
                                    { value: "MODERATOR", icon: "🔍", label: "Moderator" },
                                    { value: "SUPPORT",   icon: "💬", label: "Support" },
                                ]).map(opt => {
                                    const meta = ROLE_META[opt.value];
                                    const active = newRole === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setNewRole(opt.value)}
                                            style={{
                                                background: active ? meta.bg : "rgba(255,255,255,.04)",
                                                border: `1.5px solid ${active ? meta.color + "66" : "rgba(255,255,255,.08)"}`,
                                                borderRadius: 10,
                                                padding: "10px 8px",
                                                cursor: "pointer",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                gap: 4,
                                                transition: "all .15s",
                                            }}
                                        >
                                            <span style={{ fontSize: 18 }}>{opt.icon}</span>
                                            <span style={{ fontSize: 11, fontWeight: 600, color: active ? meta.color : "var(--text-muted)" }}>
                                                {opt.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Role description */}
                    <div style={{
                        background: "rgba(255,255,255,.04)",
                        borderRadius: 10,
                        padding: "12px 14px",
                        fontSize: 12,
                        color: "var(--text-muted)",
                        marginBottom: 16,
                        lineHeight: 1.6,
                    }}>
                        {newRole === "SUPER_ADMIN" && "👑 Barcha huquqlar: foydalanuvchilar, adminlar, to'lovlar, analitika, sozlamalar"}
                        {newRole === "ADMIN" && "🛡️ Moderatsiya, foydalanuvchilar, to'lovlar, analitika"}
                        {newRole === "MODERATOR" && "🔍 Reklamalar va botlar moderatsiyasi"}
                        {newRole === "SUPPORT" && "💬 Foydalanuvchilarga yordam, moderatsiya navbati"}
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                        <button
                            className="btn btn-primary"
                            onClick={addAdmin}
                            disabled={updateRole.isPending}
                            style={{ borderRadius: 10, padding: "10px 20px", fontSize: 14 }}
                        >
                            {updateRole.isPending ? "Saqlanmoqda..." : "✓ Tayinlash"}
                        </button>
                        <button
                            className="btn btn-ghost"
                            onClick={() => setShowForm(false)}
                            style={{ borderRadius: 10, padding: "10px 20px", fontSize: 14 }}
                        >
                            Bekor
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="elite-card" style={{ padding: 0, overflow: "hidden" }}>
                {/* Table header with search */}
                <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Shield size={18} style={{ color: "#a78bfa" }} />
                        <span style={{ fontWeight: 700, fontSize: 15 }}>Adminlar ro'yxati</span>
                        <span style={{
                            background: "rgba(167,139,250,.15)",
                            color: "#a78bfa",
                            borderRadius: 20,
                            padding: "2px 10px",
                            fontSize: 12,
                            fontWeight: 600,
                        }}>{admins.length} ta</span>
                    </div>
                    <div style={{ position: "relative", flex: "0 0 260px" }}>
                        <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                        <input
                            placeholder="Qidirish..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                background: "rgba(255,255,255,.05)",
                                border: "1px solid rgba(255,255,255,.08)",
                                borderRadius: 10,
                                padding: "8px 12px 8px 36px",
                                fontSize: 13,
                                color: "#fff",
                                width: "100%",
                                outline: "none",
                            }}
                        />
                    </div>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "rgba(255,255,255,.03)" }}>
                            <th style={{ padding: "12px 24px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: ".06em", textTransform: "uppercase" }}>Foydalanuvchi</th>
                            <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: ".06em", textTransform: "uppercase" }}>Rol</th>
                            <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: ".06em", textTransform: "uppercase" }}>Telegram ID</th>
                            <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: ".06em", textTransform: "uppercase" }}>Qo'shildi</th>
                            {role === "superadmin" && <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: ".06em", textTransform: "uppercase" }}>Amal</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && (
                            <tr>
                                <td colSpan={5} style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                                        <div className="loading-spinner" style={{ width: 32, height: 32 }} />
                                        <span>Yuklanmoqda...</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!isLoading && filtered.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ textAlign: "center", padding: "60px 0" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                                        <Users size={36} style={{ color: "var(--text-muted)", opacity: .4 }} />
                                        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
                                            {search ? "Qidiruv bo'yicha natija topilmadi" : "Tizimda adminlar topilmadi"}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {filtered.map((adm) => {
                            const meta = ROLE_META[adm.role];
                            return (
                                <tr key={adm.id} style={{ borderTop: "1px solid rgba(255,255,255,.05)", transition: "background .15s" }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.025)")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "")}>
                                    <td style={{ padding: "16px 24px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div style={{
                                                width: 40, height: 40, borderRadius: 12,
                                                background: `${avatarColor(adm.role)}22`,
                                                border: `1.5px solid ${avatarColor(adm.role)}44`,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontWeight: 700, fontSize: 15, color: avatarColor(adm.role),
                                                flexShrink: 0,
                                            }}>
                                                {(adm.firstName || adm.username || "?")[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>
                                                    {adm.firstName || ""}{adm.lastName ? ` ${adm.lastName}` : ""}
                                                </div>
                                                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                                                    @{adm.username || "—"}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px" }}>
                                        <span style={{
                                            display: "inline-flex", alignItems: "center", gap: 6,
                                            background: meta?.bg || "rgba(255,255,255,.08)",
                                            color: meta?.color || "#fff",
                                            borderRadius: 8, padding: "5px 12px",
                                            fontSize: 12, fontWeight: 600,
                                        }}>
                                            {meta?.icon} {meta?.label || adm.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: "16px", fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>
                                        {adm.telegramId}
                                    </td>
                                    <td style={{ padding: "16px", fontSize: 12, color: "var(--text-muted)" }}>
                                        {fmtDate(adm.createdAt)}
                                    </td>
                                    {role === "superadmin" && (
                                        <td style={{ padding: "16px", textAlign: "center" }}>
                                            <button
                                                onClick={() => removeAdmin(adm)}
                                                disabled={updateRole.isPending}
                                                title="Adminlikdan chiqarish"
                                                style={{
                                                    background: "rgba(239,68,68,.1)",
                                                    border: "1px solid rgba(239,68,68,.2)",
                                                    borderRadius: 8, padding: "7px 10px",
                                                    cursor: "pointer", color: "#ef4444",
                                                    display: "inline-flex", alignItems: "center",
                                                    transition: "all .15s",
                                                }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,.22)"; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,.1)"; }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
