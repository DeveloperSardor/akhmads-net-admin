import { useState, useEffect } from "react";
import { apiClient } from "../../api/client";
import {
  Tags,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  X,
  GripVertical,
  Globe,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Category {
  id: string;
  slug: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

const empty = {
  slug: "",
  nameUz: "",
  nameRu: "",
  nameEn: "",
  icon: "📌",
  sortOrder: 0,
  isActive: true,
};

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    data: any;
  } | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get("/admin/categories");
      setCategories(res.data.data.categories);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAdd = () => {
    setForm({ ...empty, sortOrder: categories.length + 1 });
    setModal({ mode: "add", data: null });
  };

  const openEdit = (cat: Category) => {
    setForm({ ...cat });
    setModal({ mode: "edit", data: cat });
  };

  const save = async () => {
    setSaving(true);
    try {
      if (modal?.mode === "add") {
        await apiClient.post("/admin/categories", form);
      } else {
        await apiClient.put(`/admin/categories/${modal?.data.id}`, form);
      }
      setModal(null);
      fetchCategories();
    } catch (e: any) {
      alert(e.response?.data?.error || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Rostdan o'chirmoqchimisiz?")) return;
    try {
      await apiClient.delete(`/admin/categories/${id}`);
      fetchCategories();
    } catch (e: any) {
      alert(e.response?.data?.error || "Xatolik");
    }
  };

  const toggleActive = async (cat: Category) => {
    try {
      await apiClient.put(`/admin/categories/${cat.id}`, {
        isActive: !cat.isActive,
      });
      fetchCategories();
    } catch (e) {
      console.error(e);
    }
  };

  const activeCount = categories.filter((c) => c.isActive).length;
  const inactiveCount = categories.filter((c) => !c.isActive).length;

  const filtered = categories.filter(
    (c) =>
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      c.nameUz.toLowerCase().includes(search.toLowerCase()) ||
      c.nameRu.toLowerCase().includes(search.toLowerCase()) ||
      c.nameEn.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="page-head">
        <div className="page-head-left">
          <div className="section-title">Kategoriyalar</div>
          <div className="section-sub">
            Bot va reklama kategoriyalarini boshqarish — qo'shish, tahrirlash,
            o'chirish
          </div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} style={{ marginRight: 6 }} />
          Yangi kategoriya
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon-wrap blue">
            <Tags size={20} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Jami kategoriyalar</div>
            <div className="stat-value">{categories.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap green">
            <CheckCircle size={20} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Faol</div>
            <div className="stat-value">{activeCount}</div>
          </div>
        </div>
        <div className="stat-card">
          <div
            className="stat-icon-wrap"
            style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444" }}
          >
            <XCircle size={20} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Nofaol</div>
            <div className="stat-value">{inactiveCount}</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <div className="search-container">
          <Search className="search-icon" size={16} />
          <input
            className="form-input search-input"
            placeholder="Kategoriya qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch("")}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 50 }}>#</th>
                <th style={{ width: 60 }}>Icon</th>
                <th>Slug</th>
                <th>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Globe size={13} /> O'zbekcha
                  </div>
                </th>
                <th>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Globe size={13} /> Ruscha
                  </div>
                </th>
                <th>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Globe size={13} /> Inglizcha
                  </div>
                </th>
                <th style={{ textAlign: "center" }}>Holat</th>
                <th>Amal</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 60 }}>
                    <div className="loading-spinner"></div>
                    <div
                      style={{
                        marginTop: 12,
                        color: "var(--text3)",
                        fontSize: 13,
                      }}
                    >
                      Yuklanmoqda...
                    </div>
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-icon-wrap">
                        <Tags size={32} strokeWidth={1.5} />
                      </div>
                      <div className="empty-title">Kategoriya topilmadi</div>
                      <div className="empty-text">
                        Yangi kategoriya qo'shish uchun yuqoridagi tugmani
                        bosing
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((cat) => (
                <tr
                  key={cat.id}
                  className="hover-row"
                  style={{ opacity: cat.isActive ? 1 : 0.5 }}
                >
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "var(--text3)",
                      }}
                    >
                      <GripVertical size={14} strokeWidth={1.5} />
                      <span className="mono" style={{ fontSize: 12 }}>
                        {cat.sortOrder}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: "rgba(139, 92, 246, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                        border: "1px solid rgba(139, 92, 246, 0.15)",
                      }}
                    >
                      {cat.icon}
                    </div>
                  </td>
                  <td>
                    <span
                      className="mono"
                      style={{
                        fontSize: 12,
                        color: "var(--accent2)",
                        background: "rgba(139, 92, 246, 0.08)",
                        padding: "3px 8px",
                        borderRadius: 6,
                      }}
                    >
                      {cat.slug}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500, fontSize: 13 }}>
                    {cat.nameUz}
                  </td>
                  <td style={{ fontWeight: 500, fontSize: 13 }}>
                    {cat.nameRu}
                  </td>
                  <td style={{ fontWeight: 500, fontSize: 13 }}>
                    {cat.nameEn}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => toggleActive(cat)}
                      className={`badge ${cat.isActive ? "badge-success-soft" : "badge-danger-soft"}`}
                      style={{
                        cursor: "pointer",
                        border: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {cat.isActive ? (
                        <ToggleRight size={12} />
                      ) : (
                        <ToggleLeft size={12} />
                      )}
                      {cat.isActive ? "Faol" : "Nofaol"}
                    </button>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        title="Tahrirlash"
                        onClick={() => openEdit(cat)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="btn btn-sm btn-icon btn-danger-soft"
                        title="O'chirish"
                        onClick={() => remove(cat.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div
            className="modal"
            style={{
              maxWidth: 520,
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div className="modal-title">
              {modal.mode === "add"
                ? "➕ Yangi kategoriya"
                : "✏️ Kategoriyani tahrirlash"}
            </div>

            {/* Live Preview */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: 16,
                borderRadius: 12,
                background: "rgba(139, 92, 246, 0.06)",
                border: "1px solid rgba(139, 92, 246, 0.15)",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "rgba(139, 92, 246, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                }}
              >
                {form.icon || "📌"}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: "var(--text-main)",
                  }}
                >
                  {form.nameRu || "Kategoriya nomi"}
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 12, color: "var(--text-muted)" }}
                >
                  {form.slug || "slug"}
                </div>
              </div>
            </div>

            {/* Slug + Icon */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div className="modal-field">
                <span className="modal-label">Slug (identifikator)</span>
                <input
                  className="modal-input mono"
                  value={form.slug}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9_-]/g, ""),
                    })
                  }
                  placeholder="music"
                />
              </div>
              <div className="modal-field">
                <span className="modal-label">Emoji</span>
                <input
                  className="modal-input"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="🎵"
                  style={{ textAlign: "center", fontSize: 20 }}
                />
              </div>
            </div>

            {/* 3 Languages */}
            <div
              style={{
                display: "grid",
                gap: 14,
                padding: 16,
                borderRadius: 12,
                background: "var(--surface1)",
                border: "1px solid var(--border-light)",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Globe size={13} /> Tarjimalar
              </div>
              <div className="modal-field" style={{ marginBottom: 0 }}>
                <span className="modal-label">🇺🇿 O'zbekcha</span>
                <input
                  className="modal-input"
                  value={form.nameUz}
                  onChange={(e) => setForm({ ...form, nameUz: e.target.value })}
                  placeholder="Musiqa"
                />
              </div>
              <div className="modal-field" style={{ marginBottom: 0 }}>
                <span className="modal-label">🇷🇺 Ruscha</span>
                <input
                  className="modal-input"
                  value={form.nameRu}
                  onChange={(e) => setForm({ ...form, nameRu: e.target.value })}
                  placeholder="Музыка"
                />
              </div>
              <div className="modal-field" style={{ marginBottom: 0 }}>
                <span className="modal-label">🇬🇧 Inglizcha</span>
                <input
                  className="modal-input"
                  value={form.nameEn}
                  onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                  placeholder="Music"
                />
              </div>
            </div>

            {/* Sort + Active */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div className="modal-field">
                <span className="modal-label">Tartib raqami</span>
                <input
                  className="modal-input mono"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sortOrder: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "end",
                  paddingBottom: 10,
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    fontSize: 14,
                    color: "var(--text-main)",
                  }}
                >
                  <div
                    className={`toggle-switch-premium ${form.isActive ? "active" : ""}`}
                    onClick={() =>
                      setForm({ ...form, isActive: !form.isActive })
                    }
                    style={{ transform: "scale(0.8)" }}
                  >
                    <div className="knob" />
                  </div>
                  <span style={{ fontWeight: 500 }}>
                    {form.isActive ? "Faol" : "Nofaol"}
                  </span>
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={save}
                disabled={
                  saving ||
                  !form.slug ||
                  !form.nameUz ||
                  !form.nameRu ||
                  !form.nameEn
                }
              >
                {saving
                  ? "Saqlanmoqda..."
                  : modal.mode === "add"
                    ? "✓ Qo'shish"
                    : "✓ Saqlash"}
              </button>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
