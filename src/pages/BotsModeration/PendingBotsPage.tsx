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
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePendingBots, useApproveBot } from "../../hooks/queries/useBots";
import { API_BASE_URL } from "../../api/client";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function PendingBotsPage({
  setModal,
}: {
  setModal: (modal: any) => void;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: response, isLoading } = usePendingBots({
    search: debouncedSearch || undefined,
    offset: (page - 1) * limit,
    limit,
  });

  const approveBot = useApproveBot();
  const responseData = response as any;
  const bots = (responseData?.data || []) as any[];
  const total = responseData?.pagination?.total ?? responseData?.total ?? 0;
  const totalPages =
    responseData?.pagination?.totalPages ?? Math.ceil(total / limit);

  // Calculate queue stats
  const avgSubscribers =
    bots.length > 0
      ? Math.round(
          bots.reduce((acc, b) => acc + (b.totalMembers || 0), 0) / bots.length,
        )
      : 0;

  if (isLoading) {
    return (
      <div className="elite-analytics-wrap">
        <div className="page-head" style={{ marginBottom: 40 }}>
          <div className="page-head-left">
            <h1
              className="section-title"
              style={{
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: "-0.03em",
              }}
            >
              Botlar Moderatsiyasi
            </h1>
            <p className="section-sub" style={{ fontSize: 16 }}>
              Navbat yuklanmoqda...
            </p>
          </div>
        </div>
        <div className="elite-empty-state" style={{ padding: "100px 0" }}>
          <div className="loading-spinner" style={{ width: 40, height: 40 }} />
          <div className="elite-empty-title" style={{ marginTop: 20 }}>
            Moderatsiya tizimi tayyorlanmoqda
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="elite-analytics-wrap">
      <div className="page-head" style={{ marginBottom: 40 }}>
        <div className="page-head-left">
          <h1
            className="section-title"
            style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em" }}
          >
            Botlar Moderatsiyasi
          </h1>
          <p className="section-sub" style={{ fontSize: 16 }}>
            Hozirda{" "}
            <span style={{ color: "var(--blue)", fontWeight: 700 }}>
              {total} ta
            </span>{" "}
            bot tasdiqlash uchun navbatda turibdi
          </p>
        </div>
        <div className="elite-live-pill">
          <div className="elite-live-pulse" style={{ background: "#f59e0b" }} />
          Navbat: {total} ta faol
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div
          className="elite-card"
          style={{
            padding: 24,
            display: "flex",
            gap: 20,
            alignItems: "center",
          }}
        >
          <div
            className="elite-stat-icon-wrap"
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(59, 130, 246, 0.1)",
              color: "#3b82f6",
            }}
          >
            <Shield size={24} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>
              {total}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                fontWeight: 500,
              }}
            >
              Navbatda
            </div>
          </div>
        </div>
        <div
          className="elite-card"
          style={{
            padding: 24,
            display: "flex",
            gap: 20,
            alignItems: "center",
          }}
        >
          <div
            className="elite-stat-icon-wrap"
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(16, 185, 129, 0.1)",
              color: "#10b981",
            }}
          >
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>
              {avgSubscribers.toLocaleString()}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                fontWeight: 500,
              }}
            >
              O'rtacha a'zolar
            </div>
          </div>
        </div>
        <div
          className="elite-card"
          style={{
            padding: 24,
            display: "flex",
            gap: 20,
            alignItems: "center",
          }}
        >
          <div
            className="elite-stat-icon-wrap"
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(168, 85, 247, 0.1)",
              color: "#a855f7",
            }}
          >
            <Globe size={24} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>
              {
                Array.from(new Set(bots.map((b) => b.language))).filter(Boolean)
                  .length
              }
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                fontWeight: 500,
              }}
            >
              Tillar soni
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 20,
        }}
      >
        <div className="search-container" style={{ width: 350, margin: 0 }}>
          <Search className="search-icon" size={18} />
          <input
            className="search-input"
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

      <div className="elite-card">
        <div
          className="elite-chart-header"
          style={{
            borderBottom: "1px solid var(--border-color)",
            paddingBottom: 20,
          }}
        >
          <div>
            <h3 className="elite-chart-title">Navbatdagi Botlar</h3>
            <p className="elite-chart-sub">
              Ma'lumotlarni diqqat bilan tekshiring
            </p>
          </div>
          <div
            className="elite-stat-icon-wrap"
            style={{ width: 44, height: 44, borderRadius: 12 }}
          >
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
                <th style={{ textAlign: "right" }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {bots.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div
                      className="elite-empty-state"
                      style={{ padding: "60px 0" }}
                    >
                      <div
                        className="elite-empty-icon"
                        style={{
                          borderColor: "var(--green)",
                          color: "var(--green)",
                        }}
                      >
                        <Check size={32} />
                      </div>
                      <div className="elite-empty-title">
                        Ajoyib! Navbat bo'sh
                      </div>
                      <p className="elite-empty-text">
                        Hozirda tasdiqlash uchun yangi botlar yo'q.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                bots.map((bot: any) => (
                  <tr key={bot.id} className="elite-tr">
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                        }}
                      >
                        <div
                          className="user-avatar"
                          style={{
                            width: 44,
                            height: 44,
                            fontSize: 18,
                            fontWeight: 800,
                          }}
                        >
                          {bot.username ? (
                            <img
                              src={`${API_BASE_URL}/bots/avatar/${bot.username}`}
                              alt={bot.username}
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
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
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 15,
                              color: "var(--text-main)",
                            }}
                          >
                            {bot.firstName || bot.name}
                          </div>
                          <div
                            className="mono"
                            style={{
                              fontSize: 12,
                              color: "var(--blue)",
                              fontWeight: 500,
                            }}
                          >
                            <a
                              href={`https://t.me/${bot.username.replace("@", "")}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                textDecoration: "none",
                                color: "inherit",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              {bot.username} <ExternalLink size={10} />
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Tag
                            size={12}
                            style={{ color: "var(--text-muted)" }}
                          />
                          <span
                            className="tag"
                            style={{
                              background: "rgba(139, 92, 246, 0.1)",
                              color: "#a855f7",
                              border: "1px solid rgba(139, 92, 246, 0.2)",
                              fontSize: 11,
                            }}
                          >
                            {bot.category}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Globe
                            size={12}
                            style={{ color: "var(--text-muted)" }}
                          />
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: "var(--text-secondary)",
                            }}
                          >
                            {(bot.language || "UZ").toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div
                        className="mono"
                        style={{ fontSize: 13, color: "var(--text-secondary)" }}
                      >
                        @{bot.owner?.username || bot.ownerUsername}
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          color: "var(--text-muted)",
                          fontSize: 12,
                        }}
                      >
                        <Calendar size={12} />
                        {fmtDate(bot.createdAt)}
                      </div>
                    </td>
                    <td>
                      <div
                        className="action-btns"
                        style={{ justifyContent: "flex-end" }}
                      >
                        <button
                          className="btn btn-success btn-sm btn-icon elite-action-btn"
                          title="Tasdiqlash"
                          onClick={() => approveBot.mutate(bot.id)}
                          disabled={approveBot.isPending}
                          style={{
                            background: "rgba(16, 185, 129, 0.1)",
                            color: "#10b981",
                            border: "none",
                          }}
                        >
                          <Check size={18} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm btn-icon elite-action-btn"
                          title="Batafsil"
                          onClick={() =>
                            setModal({ type: "view-bot", data: bot })
                          }
                          style={{
                            background: "rgba(59, 130, 246, 0.1)",
                            color: "#3b82f6",
                            border: "none",
                          }}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm btn-icon elite-action-btn"
                          title="Rad etish"
                          onClick={() =>
                            setModal({ type: "reject-bot", data: bot })
                          }
                          style={{
                            background: "rgba(239, 68, 68, 0.1)",
                            color: "#ef4444",
                            border: "none",
                          }}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="elite-pagination">
          <div className="pagination-info">
            Sahifa <b>{page}</b> / {totalPages} (Jami {total} bot)
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
              )
              .map((p, i, arr) => (
                <div key={p} style={{ display: "flex", alignItems: "center" }}>
                  {i > 0 && arr[i - 1] !== p - 1 && (
                    <span className="pagination-ellipsis">...</span>
                  )}
                  <button
                    className={`pagination-btn ${page === p ? "active" : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                </div>
              ))}
            <button
              className="pagination-btn"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

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
                .search-container {
                    position: relative;
                    margin-bottom: 24px;
                    width: 100%;
                }
                .search-input {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 14px;
                    padding: 12px 16px 12px 48px;
                    color: white;
                    font-size: 14px;
                    transition: all 0.2s ease;
                }
                .search-input:focus {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: var(--blue);
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                    outline: none;
                }
                .search-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                    pointer-events: none;
                }
                .search-clear {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .search-clear:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                .elite-pagination {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 24px;
                    padding: 16px 0;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }
                .pagination-info {
                    font-size: 14px;
                    color: var(--text-muted);
                }
                .pagination-info b {
                    color: white;
                }
                .pagination-controls {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }
                .pagination-btn {
                    height: 36px;
                    min-width: 36px;
                    padding: 0 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 10px;
                    color: var(--text-muted);
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .pagination-btn:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.08);
                    color: white;
                    border-color: rgba(255, 255, 255, 0.2);
                }
                .pagination-btn.active {
                    background: var(--blue);
                    color: white;
                    border-color: var(--blue);
                    font-weight: 600;
                }
                .pagination-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }
                .pagination-ellipsis {
                    color: var(--text-muted);
                    margin: 0 4px;
                }
            `}</style>
    </div>
  );
}
