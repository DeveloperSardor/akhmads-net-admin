import { useState, useEffect, useRef } from "react";
import {
  Eye,
  MousePointerClick,
  Users,
  Radio,
  Search,
  Download,
  RefreshCw,
  Bot,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Play,
} from "lucide-react";
import { adminService } from "../../api";

type Tab = "impressions" | "clicks" | "botusers" | "broadcasts";

const PAGE_SIZE = 50;

// ── CSV download helper ──────────────────────────────────────────────────────
function downloadCSV(rows: any[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const v = r[h] ?? "";
          const s = String(v).replace(/"/g, '""');
          return s.includes(",") || s.includes("\n") ? `"${s}"` : s;
        })
        .join(","),
    ),
  ].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Status badge helper ──────────────────────────────────────────────────────
function BroadcastStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; icon: any }> = {
    PENDING_REVIEW: { label: "Kutilmoqda", color: "#f59e0b", icon: Clock },
    APPROVED: { label: "Tasdiqlandi", color: "#8b5cf6", icon: CheckCircle },
    RUNNING: { label: "Yuborilmoqda", color: "#06b6d4", icon: Play },
    COMPLETED: { label: "Yakunlandi", color: "#10b981", icon: CheckCircle },
    PAUSED: { label: "To'xtatildi", color: "#6b7280", icon: Clock },
    FAILED: { label: "Xatolik", color: "#ef4444", icon: XCircle },
  };
  const s = map[status] ?? { label: status, color: "#6b7280", icon: Clock };
  const Icon = s.icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        background: `${s.color}22`,
        color: s.color,
        border: `1px solid ${s.color}44`,
      }}
    >
      <Icon size={12} /> {s.label}
    </span>
  );
}

// ── Impressions Tab ──────────────────────────────────────────────────────────
function ImpressionsTab() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const searchTimer = useRef<any>(null);

  useEffect(() => {
    load();
  }, [page, search]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminService.getImpressions({
        search: search || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      // response.paginated → { success, data: [...], pagination: { total } }
      const rows = Array.isArray(res?.data) ? res.data : [];
      setData(rows);
      setTotal(res?.pagination?.total ?? 0);
    } catch {
      setData([]);
      setTotal(0);
    }
    setLoading(false);
  };

  const handleSearch = (v: string) => {
    setSearchInput(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(0);
      setSearch(v);
    }, 400);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const rows = await adminService.getImpressionsExport({
        search: search || undefined,
      });
      downloadCSV(
        rows,
        `impressions_${new Date().toISOString().slice(0, 10)}.csv`,
      );
    } catch {
      alert("Export xatoligi");
    }
    setExporting(false);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div
        style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}
      >
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Username, ism yoki Telegram ID bo'yicha qidirish..."
            style={{
              width: "100%",
              paddingLeft: 34,
              paddingRight: 12,
              height: 38,
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg-input,#1a1a2e)",
              color: "var(--text-main)",
              fontSize: 13,
              boxSizing: "border-box",
            }}
          />
        </div>
        <button
          onClick={load}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0 14px",
            height: 38,
            border: "1px solid var(--border)",
            borderRadius: 8,
            background: "transparent",
            color: "var(--text-main)",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          <RefreshCw size={14} /> Yangilash
        </button>
        <button
          onClick={handleExport}
          disabled={exporting}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0 14px",
            height: 38,
            border: "1px solid rgba(16,185,129,0.4)",
            borderRadius: 8,
            background: "rgba(16,185,129,0.1)",
            color: "#10b981",
            cursor: "pointer",
            fontSize: 13,
            opacity: exporting ? 0.6 : 1,
          }}
        >
          <Download size={14} /> {exporting ? "Yuklanmoqda..." : "CSV Export"}
        </button>
      </div>

      <div
        style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}
      >
        Jami:{" "}
        <b style={{ color: "var(--text-main)" }}>{total.toLocaleString()}</b> ta
        taassurot
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {[
                "#",
                "Username",
                "Ism",
                "Familiya",
                "Telegram ID",
                "Bot",
                "Reklama",
                "Til",
                "Davlat",
                "Shahar",
                "Vaqt",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={10}
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "var(--text-muted)",
                  }}
                >
                  <div
                    className="loading-spinner"
                    style={{ width: 28, height: 28, margin: "0 auto" }}
                  />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "var(--text-muted)",
                  }}
                >
                  Ma'lumot topilmadi
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.03)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    style={{ padding: "10px 12px", color: "var(--text-muted)" }}
                  >
                    {page * PAGE_SIZE + i + 1}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.username ? `@${row.username}` : "—"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.firstName || "—"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.lastName || "—"}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontFamily: "monospace",
                      fontSize: 12,
                    }}
                  >
                    {row.telegramUserId}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.bot?.username ? `@${row.bot.username}` : "—"}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      maxWidth: 150,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={row.ad?.title}
                  >
                    {row.ad?.title || "—"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.languageCode || "—"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.country && row.country !== "Unknown"
                      ? row.country
                      : "—"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.city && row.city !== "Unknown" ? row.city : "—"}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.createdAt
                      ? new Date(row.createdAt).toLocaleString("uz-UZ")
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 16,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              width: 32,
              height: 32,
              border: "1px solid var(--border)",
              borderRadius: 6,
              background: "transparent",
              color: "var(--text-main)",
              cursor: page === 0 ? "not-allowed" : "pointer",
              opacity: page === 0 ? 0.4 : 1,
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            style={{
              width: 32,
              height: 32,
              border: "1px solid var(--border)",
              borderRadius: 6,
              background: "transparent",
              color: "var(--text-main)",
              cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
              opacity: page >= totalPages - 1 ? 0.4 : 1,
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Clicks Tab ───────────────────────────────────────────────────────────────
function ClicksTab() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const searchTimer = useRef<any>(null);

  useEffect(() => {
    load();
  }, [page, search]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminService.getClicks({
        search: search || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      const rows = Array.isArray(res?.data) ? res.data : [];
      setData(rows);
      setTotal(res?.pagination?.total ?? 0);
    } catch {
      setData([]);
      setTotal(0);
    }
    setLoading(false);
  };

  const handleSearch = (v: string) => {
    setSearchInput(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(0);
      setSearch(v);
    }, 400);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const rows = await adminService.getClicksExport({
        search: search || undefined,
      });
      downloadCSV(rows, `clicks_${new Date().toISOString().slice(0, 10)}.csv`);
    } catch {
      alert("Export xatoligi");
    }
    setExporting(false);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div
        style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}
      >
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Username, ism yoki Telegram ID bo'yicha qidirish..."
            style={{
              width: "100%",
              paddingLeft: 34,
              paddingRight: 12,
              height: 38,
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg-input,#1a1a2e)",
              color: "var(--text-main)",
              fontSize: 13,
              boxSizing: "border-box",
            }}
          />
        </div>
        <button
          onClick={load}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0 14px",
            height: 38,
            border: "1px solid var(--border)",
            borderRadius: 8,
            background: "transparent",
            color: "var(--text-main)",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          <RefreshCw size={14} /> Yangilash
        </button>
        <button
          onClick={handleExport}
          disabled={exporting}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0 14px",
            height: 38,
            border: "1px solid rgba(16,185,129,0.4)",
            borderRadius: 8,
            background: "rgba(16,185,129,0.1)",
            color: "#10b981",
            cursor: "pointer",
            fontSize: 13,
            opacity: exporting ? 0.6 : 1,
          }}
        >
          <Download size={14} /> {exporting ? "Yuklanmoqda..." : "CSV Export"}
        </button>
      </div>

      <div
        style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}
      >
        Jami:{" "}
        <b style={{ color: "var(--text-main)" }}>{total.toLocaleString()}</b> ta
        klik
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {[
                "#",
                "Username",
                "Ism",
                "Familiya",
                "Telegram ID",
                "Bot",
                "Reklama",
                "Til",
                "Davlat",
                "Shahar",
                "IP",
                "Havola",
                "Vaqt",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={12}
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "var(--text-muted)",
                  }}
                >
                  <div
                    className="loading-spinner"
                    style={{ width: 28, height: 28, margin: "0 auto" }}
                  />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={12}
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "var(--text-muted)",
                  }}
                >
                  Ma'lumot topilmadi
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.id}
                  style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.03)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    style={{ padding: "10px 12px", color: "var(--text-muted)" }}
                  >
                    {page * PAGE_SIZE + i + 1}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.username ? `@${row.username}` : "—"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.firstName || "—"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.lastName || "—"}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontFamily: "monospace",
                      fontSize: 12,
                    }}
                  >
                    {row.telegramUserId}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.bot?.username ? `@${row.bot.username}` : "—"}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      maxWidth: 150,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={row.ad?.title}
                  >
                    {row.ad?.title || "—"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.languageCode || "—"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.country && row.country !== "Unknown"
                      ? row.country
                      : "—"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.city && row.city !== "Unknown" ? row.city : "—"}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      fontFamily: "monospace",
                      fontSize: 11,
                      color: "var(--text-muted)",
                    }}
                  >
                    {row.ipAddress || "—"}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      maxWidth: 160,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.originalUrl ? (
                      <a
                        href={row.originalUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#8b5cf6", fontSize: 12 }}
                      >
                        {row.originalUrl.slice(0, 40)}
                        {row.originalUrl.length > 40 ? "..." : ""}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.clickedAt
                      ? new Date(row.clickedAt).toLocaleString("uz-UZ")
                      : row.createdAt
                        ? new Date(row.createdAt).toLocaleString("uz-UZ")
                        : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 16,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              width: 32,
              height: 32,
              border: "1px solid var(--border)",
              borderRadius: 6,
              background: "transparent",
              color: "var(--text-main)",
              cursor: page === 0 ? "not-allowed" : "pointer",
              opacity: page === 0 ? 0.4 : 1,
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            style={{
              width: 32,
              height: 32,
              border: "1px solid var(--border)",
              borderRadius: 6,
              background: "transparent",
              color: "var(--text-main)",
              cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
              opacity: page >= totalPages - 1 ? 0.4 : 1,
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Bot Users Tab ────────────────────────────────────────────────────────────
function BotUsersTab() {
  const [bots, setBots] = useState<any[]>([]);
  const [selectedBot, setSelectedBot] = useState("");
  const [activeDays, setActiveDays] = useState(30);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [botsLoading, setBotsLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const searchTimer = useRef<any>(null);

  useEffect(() => {
    setBotsLoading(true);
    adminService
      .getAllBots({ limit: 100 })
      .then((res) => setBots(res?.data ?? []))
      .catch(() => setBots([]))
      .finally(() => setBotsLoading(false));
  }, []);

  useEffect(() => {
    if (selectedBot) load();
  }, [selectedBot, activeDays, page, search]);

  const load = async () => {
    if (!selectedBot) return;
    setLoading(true);
    try {
      const res = await adminService.getBotUsersAdmin(selectedBot, {
        activeDays,
        search: search || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      const rows = Array.isArray(res?.data) ? res.data : [];
      setData(rows);
      setTotal(res?.pagination?.total ?? 0);
    } catch {
      setData([]);
      setTotal(0);
    }
    setLoading(false);
  };

  const handleSearch = (v: string) => {
    setSearchInput(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(0);
      setSearch(v);
    }, 400);
  };

  const handleExport = async () => {
    if (!selectedBot) return;
    setExporting(true);
    try {
      const rows = await adminService.getBotUsersExport(selectedBot, {
        activeDays,
        search: search || undefined,
      });
      downloadCSV(
        rows,
        `bot_users_${new Date().toISOString().slice(0, 10)}.csv`,
      );
    } catch {
      alert("Export xatoligi");
    }
    setExporting(false);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div
        style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}
      >
        <div style={{ minWidth: 220 }}>
          <select
            value={selectedBot}
            onChange={(e) => {
              setSelectedBot(e.target.value);
              setPage(0);
              setSearch("");
              setSearchInput("");
            }}
            style={{
              width: "100%",
              height: 38,
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg-input,#1a1a2e)",
              color: "var(--text-main)",
              fontSize: 13,
              padding: "0 12px",
            }}
          >
            <option value="">
              {botsLoading ? "Yuklanmoqda..." : "Bot tanlang..."}
            </option>
            {bots.map((b: any) => (
              <option key={b.id} value={b.id}>
                @{b.username}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={activeDays}
            onChange={(e) => {
              setActiveDays(Number(e.target.value));
              setPage(0);
            }}
            style={{
              height: 38,
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg-input,#1a1a2e)",
              color: "var(--text-main)",
              fontSize: 13,
              padding: "0 12px",
            }}
          >
            <option value={3}>Oxirgi 3 kun</option>
            <option value={7}>Oxirgi 7 kun</option>
            <option value={30}>Oxirgi 30 kun</option>
            <option value={90}>Oxirgi 90 kun</option>
          </select>
        </div>

        {selectedBot && (
          <>
            <div style={{ flex: 1, minWidth: 180, position: "relative" }}>
              <Search
                size={15}
                style={{
                  position: "absolute",
                  left: 11,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Qidirish..."
                style={{
                  width: "100%",
                  paddingLeft: 34,
                  paddingRight: 12,
                  height: 38,
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  background: "var(--bg-input,#1a1a2e)",
                  color: "var(--text-main)",
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "0 14px",
                height: 38,
                border: "1px solid rgba(16,185,129,0.4)",
                borderRadius: 8,
                background: "rgba(16,185,129,0.1)",
                color: "#10b981",
                cursor: "pointer",
                fontSize: 13,
                opacity: exporting ? 0.6 : 1,
              }}
            >
              <Download size={14} />{" "}
              {exporting ? "Yuklanmoqda..." : "CSV Export"}
            </button>
          </>
        )}
      </div>

      {!selectedBot ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--text-muted)",
          }}
        >
          <Bot size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
          <p>Foydalanuvchilarni ko'rish uchun bot tanlang</p>
        </div>
      ) : (
        <>
          <div
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              marginBottom: 10,
            }}
          >
            Jami:{" "}
            <b style={{ color: "var(--text-main)" }}>
              {total.toLocaleString()}
            </b>{" "}
            ta faol foydalanuvchi (oxirgi {activeDays} kun)
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {[
                    "#",
                    "Username",
                    "Ism",
                    "Familiya",
                    "Telegram ID",
                    "Til",
                    "Davlat",
                    "Shahar",
                    "Oxirgi faollik",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{ textAlign: "center", padding: 40 }}
                    >
                      <div
                        className="loading-spinner"
                        style={{ width: 28, height: 28, margin: "0 auto" }}
                      />
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        textAlign: "center",
                        padding: 40,
                        color: "var(--text-muted)",
                      }}
                    >
                      Foydalanuvchi topilmadi
                    </td>
                  </tr>
                ) : (
                  data.map((row, i) => (
                    <tr
                      key={row.id}
                      style={{ borderBottom: "1px solid var(--border)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.03)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td
                        style={{
                          padding: "10px 12px",
                          color: "var(--text-muted)",
                        }}
                      >
                        {page * PAGE_SIZE + i + 1}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        {row.username ? `@${row.username}` : "—"}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        {row.firstName || "—"}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        {row.lastName || "—"}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          fontFamily: "monospace",
                          fontSize: 12,
                        }}
                      >
                        {row.telegramUserId}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        {row.languageCode || "—"}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        {row.country && row.country !== "Unknown"
                          ? row.country
                          : "—"}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        {row.city && row.city !== "Unknown" ? row.city : "—"}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          color: "var(--text-muted)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.lastSeenAt
                          ? new Date(row.lastSeenAt).toLocaleString("uz-UZ")
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 16,
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{
                  width: 32,
                  height: 32,
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  background: "transparent",
                  color: "var(--text-main)",
                  cursor: page === 0 ? "not-allowed" : "pointer",
                  opacity: page === 0 ? 0.4 : 1,
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                style={{
                  width: 32,
                  height: 32,
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  background: "transparent",
                  color: "var(--text-main)",
                  cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                  opacity: page >= totalPages - 1 ? 0.4 : 1,
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Broadcasts Tab ───────────────────────────────────────────────────────────
function BroadcastsTab() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, [page]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllBroadcasts({
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      // /admin/broadcasts uses response.paginated → { data: [...], pagination: { total } }
      const rows = Array.isArray(res?.data) ? res.data : [];
      setData(rows);
      setTotal(res?.pagination?.total ?? 0);
    } catch {
      setData([]);
      setTotal(0);
    }
    setLoading(false);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <button
          onClick={load}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0 14px",
            height: 38,
            border: "1px solid var(--border)",
            borderRadius: 8,
            background: "transparent",
            color: "var(--text-main)",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          <RefreshCw size={14} /> Yangilash
        </button>
      </div>

      <div
        style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}
      >
        Jami:{" "}
        <b style={{ color: "var(--text-main)" }}>{total.toLocaleString()}</b> ta
        broadcast
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {[
                "#",
                "Advertiser",
                "Bot",
                "Holat",
                "Maqsad",
                "Yuborildi",
                "Xatolik",
                "Narx",
                "Sana",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: 40 }}>
                  <div
                    className="loading-spinner"
                    style={{ width: 28, height: 28, margin: "0 auto" }}
                  />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "var(--text-muted)",
                  }}
                >
                  Broadcast topilmadi
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.id}
                  style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.03)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    style={{ padding: "10px 12px", color: "var(--text-muted)" }}
                  >
                    {page * PAGE_SIZE + i + 1}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.advertiser ? (
                      <span>
                        {row.advertiser.firstName || ""}{" "}
                        {row.advertiser.lastName || ""}
                        {row.advertiser.username
                          ? ` (@${row.advertiser.username})`
                          : ""}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.bot?.username ? `@${row.bot.username}` : "—"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <BroadcastStatusBadge status={row.status} />
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    {(row.targetCount ?? 0).toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      textAlign: "center",
                      color: "#10b981",
                    }}
                  >
                    {(row.sentCount ?? 0).toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      textAlign: "center",
                      color: "#ef4444",
                    }}
                  >
                    {(row.failedCount ?? 0).toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      color: "#10b981",
                      fontWeight: 600,
                    }}
                  >
                    ${parseFloat(row.totalCost ?? 0).toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.createdAt
                      ? new Date(row.createdAt).toLocaleString("uz-UZ")
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 16,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              width: 32,
              height: 32,
              border: "1px solid var(--border)",
              borderRadius: 6,
              background: "transparent",
              color: "var(--text-main)",
              cursor: page === 0 ? "not-allowed" : "pointer",
              opacity: page === 0 ? 0.4 : 1,
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            style={{
              width: 32,
              height: 32,
              border: "1px solid var(--border)",
              borderRadius: 6,
              background: "transparent",
              color: "var(--text-main)",
              cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
              opacity: page >= totalPages - 1 ? 0.4 : 1,
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export function StatisticsPage() {
  const [tab, setTab] = useState<Tab>("impressions");

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "impressions", label: "Taassurotlar", icon: Eye },
    { id: "clicks", label: "Kliklar", icon: MousePointerClick },
    { id: "botusers", label: "Bot Foydalanuvchilar", icon: Users },
    { id: "broadcasts", label: "Broadcastlar", icon: Radio },
  ];

  return (
    <div style={{ padding: "0 0 40px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Batafsil Statistika
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
            Taassurotlar, kliklar, bot foydalanuvchilar va broadcastlar
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          <Calendar size={14} />
          {new Date().toLocaleDateString("uz-UZ", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 24,
          borderBottom: "1px solid var(--border)",
          paddingBottom: 0,
        }}
      >
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "10px 18px",
                background: "transparent",
                border: "none",
                borderBottom: active
                  ? "2px solid #8b5cf6"
                  : "2px solid transparent",
                color: active ? "#8b5cf6" : "var(--text-muted)",
                fontWeight: active ? 700 : 500,
                fontSize: 13,
                cursor: "pointer",
                transition: "color 0.15s",
                marginBottom: -1,
              }}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="elite-card" style={{ padding: 24 }}>
        {tab === "impressions" && <ImpressionsTab />}
        {tab === "clicks" && <ClicksTab />}
        {tab === "botusers" && <BotUsersTab />}
        {tab === "broadcasts" && <BroadcastsTab />}
      </div>
    </div>
  );
}
