import { useState } from "react";
import type { BotStatus } from "../../AppTypes";
import { useAllBots } from "../../hooks/queries/useBots";
import { API_BASE_URL } from "../../api/client";
import { Bot, DollarSign, Calendar, TrendingUp, Cpu, Code } from "lucide-react";
import axios from "axios";

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
  const { data: response, isLoading } = useAllBots(
    statusFilter !== "all" ? { status: statusFilter } : {},
  );
  const responseData = response as any;
  const bots = (responseData?.data || []) as any[];

  const toggleIntegrationMode = async (botId: string, currentMode: string) => {
    const newMode = currentMode === "MANUAL" ? "AUTO" : "MANUAL";
    if (!window.confirm(`Bot rejimini ${newMode} ga o'zgartirmoqchimisiz?`))
      return;

    try {
      const token = localStorage.getItem("admin_token");
      await axios.post(
        `${API_BASE_URL}/admin/moderation/bots/${botId}/integration-mode`,
        { integrationMode: newMode },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi");
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
              {bots.length} ta
            </span>{" "}
            ulanish mavjud
          </p>
        </div>
      </div>

      <div
        className="elite-tabs-pill-wrap"
        style={{
          marginBottom: 32,
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
              onClick={() => setStatusFilter(s as any)}
              style={{
                padding: "10px 22px",
                borderRadius: 12,
                border: "none",
                background: statusFilter === s ? "var(--blue)" : "transparent",
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
                      onClick={() =>
                        toggleIntegrationMode(bot.id, bot.integrationMode)
                      }
                      className={`badge ${bot.integrationMode === "AUTO" ? "badge-green" : "badge-gray"}`}
                      style={{
                        cursor: "pointer",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontWeight: 700,
                      }}
                    >
                      {bot.integrationMode === "AUTO" ? (
                        <>
                          <Cpu size={12} /> AUTO
                        </>
                      ) : (
                        <>
                          <Code size={12} /> MANUAL
                        </>
                      )}
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
            `}</style>
    </div>
  );
}
