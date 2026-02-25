import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { Role } from "../../components/layout/Sidebar";
import { useAdminUsers, useUpdateUserRole } from "../../hooks/queries/useAdmin";
import type { UserProfile } from "../../api/services/auth.service";

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function AdminsPage({ showToast }: any) {
    const { role } = useOutletContext<{ role: Role }>();
    const [showForm, setShowForm] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [newRole, setNewRole] = useState<"ADMIN" | "SUPPORT">("SUPPORT");

    const { data: usersRes, isLoading } = useAdminUsers({ limit: 100 }); // Reduced from 1000 to avoid API validation error
    const updateRole = useUpdateUserRole();

    const users = usersRes?.data || [];
    const admins = users.filter((u: UserProfile) => u.role === "ADMIN" || u.role === "SUPPORT");

    const addAdmin = () => {
        if (!newUsername.trim()) { showToast("Username kiritish shart!", "error"); return; }

        const targetUser = users.find((u: UserProfile) => u.username?.toLowerCase() === newUsername.toLowerCase().trim() || u.telegramId === newUsername.trim());
        if (!targetUser) {
            showToast("Bunday username yoki ID li foydalanuvchi bazada topilmadi", "error");
            return;
        }

        updateRole.mutate({ id: targetUser.id, role: newRole }, {
            onSuccess: () => {
                setNewUsername("");
                setNewRole("SUPPORT");
                setShowForm(false);
                showToast(`@${targetUser.username || targetUser.firstName} ${newRole} sifatida tayinlandi ✓`);
            },
            onError: () => {
                showToast("Xatolik yuz berdi", "error");
            }
        });
    };

    const removeAdmin = (user: UserProfile) => {
        if (user.role === "ADMIN" && role !== "superadmin") {
            showToast("Sizda ushbu adminni o'chirish huquqi yo'q!", "error"); return;
        }

        // Ensure not removing self
        if (confirm(`Rostdan ham @${user.username || user.firstName} dan admin huquqlarini olasizmi?`)) {
            updateRole.mutate({ id: user.id, role: "USER" }, {
                onSuccess: () => showToast("Admin huquqlari olib tashlandi", "info"),
                onError: () => showToast("Xatolik yuz berdi", "error")
            });
        }
    };

    return (
        <div>
            <div className="page-head">
                <div className="page-head-left">
                    <div className="section-title">Admin boshqaruvi</div>
                    <div className="section-sub">Rol ierarxiyasi: SuperAdmin → Admin → Moderator</div>
                </div>
                {role === "superadmin" && (
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Admin qo'shish</button>
                )}
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: 16, border: "1px solid var(--accent)", background: "rgba(59,130,246,.05)" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Yangi admin qo'shish</div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Telegram username</label>
                            <input className="form-input" placeholder="username (@ belgisisiz)" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Rol</label>
                            <select className="form-select" value={newRole} onChange={e => setNewRole(e.target.value as "ADMIN" | "SUPPORT")}>
                                <option value="SUPPORT">🔍 Moderator (Support)</option>
                                <option value="ADMIN">🛡️ Admin</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                        <button className="btn btn-primary" onClick={addAdmin}>✓ Qo'shish</button>
                        <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Bekor</button>
                    </div>
                </div>
            )}

            <div className="card">
                <table>
                    <thead>
                        <tr><th>Foydalanuvchi</th><th>Rol</th><th>Qo'shildi</th><th>ID</th><th>Ruxsatlar</th>{role === "superadmin" && <th>Amal</th>}</tr>
                    </thead>
                    <tbody>
                        {isLoading && <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--text2)" }}>Yuklanmoqda...</td></tr>}
                        {!isLoading && admins.length === 0 && <tr><td colSpan={6}><div className="empty" style={{ padding: 20 }}>Tizimda boshqa adminlar topilmadi</div></td></tr>}
                        {admins.map((adm: UserProfile) => (
                            <tr key={adm.id}>
                                <td>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div className="user-avatar" style={{ background: adm.role === "ADMIN" ? "linear-gradient(135deg,#3b82f6,#2563eb)" : "linear-gradient(135deg,#10b981,#059669)", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 13, color: "#fff" }}>
                                            {(adm.firstName || adm.username || "?")[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{adm.firstName || ""} {adm.lastName || ""}</div>
                                            <div className="mono" style={{ fontSize: 11, color: "var(--text2)" }}>@{adm.username || "username_yoq"}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge ${adm.role === "ADMIN" ? "badge-blue" : "badge-green"}`}>
                                        {adm.role === "ADMIN" ? "🛡️ Admin" : "🔍 Moderator"}
                                    </span>
                                </td>
                                <td style={{ fontSize: 11, color: "var(--text2)" }}>{fmtDate(adm.updatedAt || adm.createdAt)}</td>
                                <td className="mono" style={{ fontSize: 11, color: "var(--text2)" }}>{adm.telegramId}</td>
                                <td>
                                    <div style={{ fontSize: 11, color: "var(--text2)", lineHeight: 1.7 }}>
                                        {adm.role === "ADMIN" && "Moderatsiya, foydalanuvchilar, to'lovlar, analitika"}
                                        {adm.role === "SUPPORT" && "Moderatsiya navbati, reklamalar, botlar"}
                                    </div>
                                </td>
                                {role === "superadmin" && (
                                    <td>
                                        <button className="btn btn-danger btn-sm btn-icon" title="O'chirish" onClick={() => removeAdmin(adm)} disabled={updateRole.isPending}>✕</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
