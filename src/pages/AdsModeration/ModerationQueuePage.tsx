import { useState } from "react";
import { Megaphone, Bot, Check, X, Users, Clock, Shield } from "lucide-react";
import { useCampaigns, useApproveAd } from "../../hooks/queries/useAds";
import { usePendingBots, useApproveBot } from "../../hooks/queries/useBots";
import { useApproveBroadcast } from "../../hooks/queries/useBroadcasts";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const getAvatarGradient = (id: string, type: "ad" | "bot") => {
  const adColors = [
    "linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)",
    "linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)",
    "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
  ];
  const botColors = [
    "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
    "linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)",
  ];
  const colors = type === "ad" ? adColors : botColors;
  const index =
    id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
};

export function ModerationQueuePage({
  setModal,
}: {
  setModal: (modal: any) => void;
}) {
  const [tab, setTab] = useState<"campaigns" | "bots">("campaigns");

  const { data: campaignsResponse, isLoading: campaignsLoading } = useCampaigns(
    {
      status: "PENDING_REVIEW",
    },
  );
  const { data: botsResponse, isLoading: botsLoading } = usePendingBots();

  const approveAdMutation = useApproveAd();
  const approveBotMutation = useApproveBot();
  const approveBroadcastMutation = useApproveBroadcast();

  const campaigns = (campaignsResponse?.data || []) as any[];
  const totalCampaigns = campaignsResponse?.total || campaigns.length;

  const botsData = botsResponse as any;
  const bots = (botsData?.data || []) as any[];
  const totalBots = botsData?.total || bots.length;

  const totalInQueue = totalCampaigns + totalBots;

  if (campaignsLoading && botsLoading) {
    return (
      <div className="elite-analytics-wrap">
        <div className="page-head" style={{ marginBottom: 40 }}>
          <div className="page-head-left">
            <h1
              className="section-title"
              style={{ fontSize: 32, fontWeight: 800 }}
            >
              Moderatsiya Markazi
            </h1>
            <p className="section-sub">Tizim holati yuklanmoqda...</p>
          </div>
        </div>
        <div className="elite-empty-state" style={{ padding: "100px 0" }}>
          <div className="loading-spinner" />
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
            Moderatsiya Markazi
          </h1>
          <p className="section-sub" style={{ fontSize: 16 }}>
            Hozirda jami{" "}
            <span style={{ color: "var(--blue)", fontWeight: 700 }}>
              {totalInQueue} ta
            </span>{" "}
            element navbatda turibdi
          </p>
        </div>
        <div className="elite-live-pill">
          <div className="elite-live-pulse" style={{ background: "#3b82f6" }} />
          Live: {totalInQueue} ta kutilmoqda
        </div>
      </div>

      <div className="elite-stat-grid" style={{ marginBottom: 32 }}>
        <div className="elite-stat-box">
          <div
            className="elite-stat-icon-wrap"
            style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}
          >
            <Shield size={24} />
          </div>
          <div style={{ marginTop: 8 }}>
            <div className="elite-stat-value">{totalInQueue}</div>
            <div className="elite-stat-label">Jami Navbat</div>
          </div>
        </div>
        <div className="elite-stat-box">
          <div
            className="elite-stat-icon-wrap"
            style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}
          >
            <Megaphone size={24} />
          </div>
          <div style={{ marginTop: 8 }}>
            <div className="elite-stat-value">{totalCampaigns}</div>
            <div className="elite-stat-label">Reklamalar (V & R)</div>
          </div>
        </div>
        <div className="elite-stat-box">
          <div
            className="elite-stat-icon-wrap"
            style={{ background: "rgba(168, 85, 247, 0.1)", color: "#a855f7" }}
          >
            <Bot size={24} />
          </div>
          <div style={{ marginTop: 8 }}>
            <div className="elite-stat-value">{totalBots}</div>
            <div className="elite-stat-label">Botlar</div>
          </div>
        </div>
      </div>

      <div
        className="elite-tabs-pill-wrap"
        style={{
          marginBottom: 24,
          display: "flex",
          gap: 12,
          background: "rgba(255,255,255,0.03)",
          padding: 6,
          borderRadius: 16,
          width: "max-content",
          border: "1px solid var(--border-color)",
          flexWrap: "wrap",
        }}
      >
        <button
          className={`elite-tab-pill ${tab === "campaigns" ? "active" : ""}`}
          onClick={() => setTab("campaigns")}
          style={{
            padding: "10px 24px",
            borderRadius: 12,
            border: "none",
            background: tab === "campaigns" ? "var(--blue)" : "transparent",
            color: tab === "campaigns" ? "white" : "var(--text-muted)",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.3s",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Megaphone size={16} />
          Reklamalar
          <span
            style={{
              fontSize: 11,
              background: "rgba(255,255,255,0.1)",
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            {totalCampaigns}
          </span>
        </button>
        <button
          className={`elite-tab-pill ${tab === "bots" ? "active" : ""}`}
          onClick={() => setTab("bots")}
          style={{
            padding: "10px 24px",
            borderRadius: 12,
            border: "none",
            background: tab === "bots" ? "var(--blue)" : "transparent",
            color: tab === "bots" ? "white" : "var(--text-muted)",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.3s",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Bot size={16} />
          Botlar
          <span
            style={{
              fontSize: 11,
              background: "rgba(255,255,255,0.1)",
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            {totalBots}
          </span>
        </button>
      </div>

      <div
        className="elite-queue-stream"
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        {tab === "campaigns" ? (
          campaigns.length === 0 ? (
            <div
              className="elite-card"
              style={{ padding: "60px 0", textAlign: "center" }}
            >
              <Check
                size={48}
                style={{ color: "var(--green)", marginBottom: 20 }}
              />
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>
                Hamma reklamalar ko'rib chiqildi
              </h3>
            </div>
          ) : (
            campaigns.map((c: any) => (
              <div
                className="elite-card"
                key={`${c.campaignType}-${c.id}`}
                style={{ padding: 24 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 12,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 900,
                          padding: "2px 8px",
                          borderRadius: 6,
                          background:
                            c.campaignType === "BROADCAST"
                              ? "rgba(139, 92, 246, 0.1)"
                              : "rgba(59, 130, 246, 0.1)",
                          color:
                            c.campaignType === "BROADCAST"
                              ? "#8b5cf6"
                              : "#3b82f6",
                          textTransform: "uppercase",
                        }}
                      >
                        {c.campaignType === "BROADCAST" ? "Rassilka" : "Views"}
                      </span>
                      <h3
                        style={{
                          fontSize: 18,
                          color: "white",
                          fontWeight: 700,
                          margin: 0,
                        }}
                      >
                        {c.text?.slice(0, 80)}...
                      </h3>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 15,
                        fontSize: 13,
                        color: "var(--text-muted)",
                        marginBottom: 15,
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <Users size={14} />{" "}
                        {c.advertiser?.username || c.advertiser?.firstName}
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <Clock size={14} /> {fmtDate(c.createdAt)}
                      </span>
                      {c.campaignType === "BROADCAST" && (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <Bot size={14} /> @{c.bot?.username}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        padding: 15,
                        borderRadius: 12,
                        marginBottom: 15,
                      }}
                    >
                      {c.text}
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <span className="style-tag">
                        Budget: ${c.totalCost || c.budget}
                      </span>
                      <span className="style-tag">
                        Target: {c.targetImpressions || c.targetCount}
                      </span>
                      <span className="style-tag">{c.contentType}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginLeft: 20 }}>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() =>
                        c.campaignType === "BROADCAST"
                          ? approveBroadcastMutation.mutate(c.id)
                          : approveAdMutation.mutate(c.id)
                      }
                    >
                      <Check size={16} /> Tasdiqlash
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        setModal({
                          type:
                            c.campaignType === "BROADCAST"
                              ? "reject-broadcast"
                              : "reject-ad",
                          data: c,
                        })
                      }
                    >
                      <X size={16} /> Rad etish
                    </button>
                  </div>
                </div>
              </div>
            ))
          )
        ) : bots.length === 0 ? (
          <div
            className="elite-card"
            style={{ padding: "60px 0", textAlign: "center" }}
          >
            <Check
              size={48}
              style={{ color: "var(--green)", marginBottom: 20 }}
            />
            <h3 style={{ fontSize: 20, fontWeight: 700 }}>
              Hamma botlar ko'rib chiqildi
            </h3>
          </div>
        ) : (
          bots.map((bot: any) => (
            <div
              className="elite-card"
              key={bot.id}
              style={{ padding: 24, display: "flex", gap: 20 }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  background: getAvatarGradient(bot.id, "bot"),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 900,
                }}
              >
                {bot.name?.[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                    {bot.name}{" "}
                    <span style={{ color: "var(--blue)", fontSize: 13 }}>
                      @{bot.username}
                    </span>
                  </h3>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => approveBotMutation.mutate(bot.id)}
                    >
                      Tasdiqlash
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        setModal({ type: "reject-bot", data: bot })
                      }
                    >
                      Rad etish
                    </button>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 15,
                    fontSize: 12,
                    color: "var(--text-muted)",
                  }}
                >
                  <span>Owner: @{bot.ownerUsername}</span>
                  <span>Category: {bot.category}</span>
                  <span>Members: {bot.totalMembers?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
                .style-tag {
                    padding: 4px 10px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 600;
                    color: rgba(255,255,255,0.6);
                }
            `}</style>
    </div>
  );
}
