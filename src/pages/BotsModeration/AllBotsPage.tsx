import { useState, useEffect } from "react";
import type { BotStatus } from "../../AppTypes";
import { useAllBots } from "../../hooks/queries/useBots";
import { API_BASE_URL } from "../../api/client";
import {
  Bot,
  DollarSign,
  Calendar,
  TrendingUp,
  Cpu,
  Code,
  Loader2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from "lucide-react";
import { adminService } from "../../api/services/admin.service";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const botStatusColor: Record<string, string> = {
  PENDING: "badge-amber",
  APPROVED: "badge-blue",
  ACTIVE: "badge-green",
  PAUSED: "badge-gray",
  REJECTED: "badge-red",
};

const botStatusMap: Record<string, string> = {
  all: "Barchasi",
  PENDING: "Kutilmoqda",
  APPROVED: "Tasdiqlangan",
  ACTIVE: "Faol",
  PAUSED: "To'xtatilgan",
  REJECTED: "Rad etilgan",
};

export function AllBotsPage() {
  const [statusFilter, setStatusFilter] = useState<BotStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: response, isLoading } = useAllBots({
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: debouncedSearch || undefined,
    offset: (page - 1) * limit,
    limit,
  });

  const responseData = response as any;
  const bots = (responseData?.data || []) as any[];
  const total = responseData?.pagination?.total ?? responseData?.total ?? 0;
  const totalPages =
    responseData?.pagination?.totalPages ?? Math.ceil(total / limit);

  const [processingId, setProcessingId] = useState<string | null>(null);

  const toggleIntegrationMode = async (botId: string, currentMode: string) => {
    const newMode = (currentMode === "MANUAL" ? "AUTO" : "MANUAL") as
      | "MANUAL"
      | "AUTO";
    if (!window.confirm(`Bot rejimini ${newMode} ga o'zgartirmoqchimisiz?`))
      return;

    setProcessingId(botId);
    try {
      await adminService.updateBotIntegrationMode(botId, newMode);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi");
    } finally {
      setProcessingId(null);
    }
  };

  const toggleBotPause = async (botId: string, currentIsPaused: boolean) => {
    const action = currentIsPaused ? "faollashtirishni" : "to'xtatib turishni";
    if (!window.confirm(`Botni ${action} tasdiqlaysizmi?`)) return;

    setProcessingId(botId);
    try {
      if (currentIsPaused) {
        await adminService.resumeBot(botId);
      } else {
        await adminService.pauseBot(botId);
      }
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="elite-analytics-wrap">
      <div className="page-head" style={{ marginBottom: 40 }}>
        <div className="page-head-left">
          <h1
            className="section-title"
            style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em" }}
          >
            Barcha Botlar
          </h1>
          <p className="section-sub" style={{ fontSize: 16 }}>
            Hozirda tizimda jami{" "}
            <span style={{ color: "var(--blue)", fontWeight: 700 }}>
              {total} ta
            </span>{" "}
            ulanish mavjud
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div
          className="elite-tabs-pill-wrap"
          style={{
            display: "flex",
            gap: 10,
            background: "rgba(255,255,255,0.03)",
            padding: 6,
            borderRadius: 16,
            width: "max-content",
            border: "1px solid var(--border-color)",
            flexWrap: "wrap",
          }}
        >
          {["all", "PENDING", "APPROVED", "ACTIVE", "PAUSED", "REJECTED"].map(
            (s) => (
              <button
                key={s}
                className={`elite-tab-pill ${statusFilter === s ? "active" : ""}`}
                onClick={() => {
                  setStatusFilter(s as any);
                  setPage(1);
                }}
                style={{
                  padding: "10px 22px",
                  borderRadius: 12,
                  border: "none",
                  background:
                    statusFilter === s ? "var(--blue)" : "transparent",
                  color: statusFilter === s ? "white" : "var(--text-muted)",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {botStatusMap[s] || s}
              </button>
            ),
          )}
        </div>

        <div className="search-container" style={{ width: 350, margin: 0 }}>
          <Search className="search-icon" size={18} />
          <input
            className="form-input search-input"
            placeholder="Bot nomi, username yoki ID orqali qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 44 }}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch("")}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="elite-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-wrap">
          <table className="elite-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: 32 }}>BOT</th>
                <th>EGASI</th>
                <th>STATUS</th>
                <th>KATEGORIYA</th>
                <th>REJIM</th>
                <th>STATISTIKA</th>
                <th>DAROMAD</th>
                <th>AMAL</th>
                <th style={{ textAlign: "right", paddingRight: 32 }}>SANA</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 100 }}>
                    <div
                      className="loading-spinner"
                      style={{ margin: "0 auto" }}
                    />
                  </td>
                </tr>
              )}
              {!isLoading && bots.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div
                      className="elite-empty-state"
                      style={{ padding: "60px 0", textAlign: "center" }}
                    >
                      <Bot
                        size={48}
                        style={{
                          color: "var(--text-muted)",
                          marginBottom: 20,
                          opacity: 0.2,
                        }}
                      />
                      <h3
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: "var(--text-muted)",
                        }}
                      >
                        Ma'lumot topilmadi
                      </h3>
                    </div>
                  </td>
                </tr>
              )}
              {bots.map((bot: any) => (
                <tr key={bot.id} className="elite-tr">
                  <td style={{ paddingLeft: 32 }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 16 }}
                    >
                      <div
                        className="user-avatar"
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 14,
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid var(--border-color)",
                          overflow: "hidden",
                        }}
                      >
                        {bot.username ? (
                          <img
                            src={`${API_BASE_URL}/bots/avatar/${bot.username}`}
                            alt={bot.username}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              const name = bot.firstName || bot.name || "B";
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff&size=64&bold=true`;
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 900,
                              color: "var(--blue)",
                            }}
                          >
                            {(bot.firstName ||
                              bot.name ||
                              "B")[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 15,
                            color: "white",
                          }}
                        >
                          {bot.firstName || bot.name}
                        </div>
                        <div
                          className="mono"
                          style={{
                            fontSize: 12,
                            color: "var(--blue)",
                            fontWeight: 600,
                          }}
                        >
                          @{bot.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span
                        style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}
                      >
                        @
                      </span>
                      <span
                        style={{
                          fontWeight: 600,
                          color: "rgba(255,255,255,0.9)",
                        }}
                      >
                        {bot.owner?.username || bot.ownerUsername}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${botStatusColor[bot.status] || "badge-gray"}`}
                      style={{
                        fontWeight: 800,
                        fontSize: 11,
                        padding: "6px 12px",
                        borderRadius: 8,
                      }}
                    >
                      {botStatusMap[bot.status] || bot.status}
                    </span>
                  </td>
                  <td>
                    <span
                      className="tag"
                      style={{
                        border: "1px solid rgba(168, 85, 247, 0.2)",
                        color: "#a855f7",
                        background: "rgba(168, 85, 247, 0.05)",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      #{bot.category}
                    </span>
                  </td>
                  <td>
                    <button
                      disabled={processingId === bot.id}
                      onClick={() =>
                        toggleIntegrationMode(bot.id, bot.integrationMode)
                      }
                      className={`elite-integration-toggle ${bot.integrationMode === "AUTO" ? "is-auto" : "is-manual"}`}
                      style={{
                        cursor:
                          processingId === bot.id ? "not-allowed" : "pointer",
                        opacity: processingId === bot.id ? 0.7 : 1,
                      }}
                    >
                      {processingId === bot.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : bot.integrationMode === "AUTO" ? (
                        <Cpu size={12} />
                      ) : (
                        <Code size={12} />
                      )}
                      <span>{bot.integrationMode}</span>
                    </button>
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          color: "rgba(255,255,255,0.9)",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        <TrendingUp
                          size={14}
                          style={{ color: "var(--blue)" }}
                        />
                        {(bot.adsReceived || 0).toLocaleString()}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          fontWeight: 500,
                        }}
                      >
                        ko'rishlar
                      </div>
                    </div>
                  </td>
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <DollarSign size={16} style={{ color: "#10b981" }} />
                      <span
                        className="mono"
                        style={{
                          fontWeight: 800,
                          color: "#10b981",
                          fontSize: 16,
                        }}
                      >
                        ${(Number(bot.earnings) || 0).toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <button
                      disabled={processingId === bot.id}
                      onClick={() => toggleBotPause(bot.id, bot.isPaused)}
                      className={`elite-pause-toggle ${bot.isPaused ? "is-paused" : "is-active"}`}
                      title={bot.isPaused ? "Yoqish" : "To'xtatib turish"}
                      style={{
                        cursor:
                          processingId === bot.id ? "not-allowed" : "pointer",
                        opacity: processingId === bot.id ? 0.7 : 1,
                      }}
                    >
                      {processingId === bot.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : bot.isPaused ? (
                        <>
                          <Play size={12} />
                          <span>YOQISH</span>
                        </>
                      ) : (
                        <>
                          <Pause size={12} />
                          <span>STOP</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td style={{ textAlign: "right", paddingRight: 32 }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 4,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          color: "rgba(255,255,255,0.5)",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        <Calendar size={14} />
                        {fmtDate(bot.createdAt)}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              padding: "20px 32px",
              borderTop: "1px solid rgba(255,255,255,0.03)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "rgba(255,255,255,0.01)",
            }}
          >
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Jami{" "}
              <span style={{ color: "white", fontWeight: 600 }}>{total}</span>{" "}
              tadan{" "}
              <span style={{ color: "white", fontWeight: 600 }}>
                {(page - 1) * limit + 1}-{Math.min(page * limit, total)}
              </span>{" "}
              ko'rsatilmoqda
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="pagination-btn"
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1;
                // Faqat boshidagi, oxiridagi va joriy sahifa atrofidagilarni ko'rsatamiz
                if (
                  p === 1 ||
                  p === totalPages ||
                  (p >= page - 1 && p <= page + 1)
                ) {
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`pagination-btn ${page === p ? "active" : ""}`}
                    >
                      {p}
                    </button>
                  );
                } else if (p === page - 2 || p === page + 2) {
                  return (
                    <span key={p} style={{ color: "rgba(255,255,255,0.2)" }}>
                      ...
                    </span>
                  );
                }
                return null;
              })}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="pagination-btn"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
                .elite-table thead th {
                    text-transform: uppercase;
                    font-size: 11px;
                    letter-spacing: 0.1em;
                    color: rgba(255,255,255,0.4);
                    font-weight: 800;
                    padding: 16px 20px;
                }
                .elite-tr {
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                }
                .elite-tr:hover {
                    background: rgba(255, 255, 255, 0.02) !important;
                    transform: translateX(4px);
                }

                .elite-integration-toggle {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 14px;
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid transparent;
                    position: relative;
                    overflow: hidden;
                    text-transform: uppercase;
                }

                .elite-integration-toggle.is-auto {
                    background: rgba(16, 185, 129, 0.1);
                    color: #10b981;
                    border-color: rgba(16, 185, 129, 0.2);
                }
                .elite-integration-toggle.is-auto:hover {
                    background: rgba(16, 185, 129, 0.2);
                    box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
                }

                .elite-integration-toggle.is-manual {
                    background: rgba(59, 130, 246, 0.1);
                    color: #3b82f6;
                    border-color: rgba(59, 130, 246, 0.2);
                }
                .elite-integration-toggle.is-manual:hover {
                    background: rgba(59, 130, 246, 0.2);
                    box-shadow: 0 0 15px rgba(59, 130, 246, 0.2);
                }

                .elite-integration-toggle:active {
                    transform: scale(0.95);
                }

                .elite-pause-toggle {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 14px;
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid transparent;
                    text-transform: uppercase;
                }

                .elite-pause-toggle.is-active {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    border-color: rgba(239, 68, 68, 0.2);
                }
                .elite-pause-toggle.is-active:hover {
                    background: rgba(239, 68, 68, 0.2);
                    box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
                }

                .elite-pause-toggle.is-paused {
                    background: rgba(16, 185, 129, 0.1);
                    color: #10b981;
                    border-color: rgba(16, 185, 129, 0.2);
                }
                .elite-pause-toggle.is-paused:hover {
                    background: rgba(16, 185, 129, 0.2);
                    box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
                }

                .pagination-btn {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    border: 1px solid rgba(255,255,255,0.05);
                    background: rgba(255,255,255,0.02);
                    color: var(--text-muted);
                    font-weight: 600;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .pagination-btn:hover:not(:disabled) {
                    background: rgba(255,255,255,0.1);
                    color: white;
                    border-color: rgba(255,255,255,0.2);
                }
                .pagination-btn.active {
                    background: var(--blue);
                    color: white;
                    border-color: var(--blue);
                }
                .pagination-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .search-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .search-icon {
                    position: absolute;
                    left: 14px;
                    color: var(--text-muted);
                }
                .search-input {
                    width: 100%;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 10px 14px 10px 40px;
                    color: white;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                .search-input:focus {
                    outline: none;
                    background: rgba(255,255,255,0.05);
                    border-color: var(--blue);
                    box-shadow: 0 0 20px rgba(59, 130, 246, 0.1);
                }
                .search-clear {
                    position: absolute;
                    right: 12px;
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .search-clear:hover {
                    color: white;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
    </div>
  );
}
