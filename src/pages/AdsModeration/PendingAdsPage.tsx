import {
  Megaphone,
  Eye,
  Check,
  X,
  Target,
  DollarSign,
  Shield,
  FileText,
  Image as ImageIcon,
  Video,
  Send,
} from "lucide-react";
import { useCampaigns, useApproveAd } from "../../hooks/queries/useAds";
import { useApproveBroadcast } from "../../hooks/queries/useBroadcasts";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getContentTypeIcon = (type: string) => {
  switch (type) {
    case "TEXT":
      return { icon: <FileText size={12} />, label: "MATN" };
    case "IMAGE":
      return { icon: <ImageIcon size={12} />, label: "RASM" };
    case "VIDEO":
      return { icon: <Video size={12} />, label: "VIDEO" };
    default:
      return { icon: <Megaphone size={12} />, label: type };
  }
};

export function PendingAdsPage({
  setModal,
}: {
  setModal: (modal: any) => void;
}) {
  const { data: campaignResponse, isLoading } = useCampaigns({
    status: "PENDING_REVIEW",
  });
  const approveAd = useApproveAd();
  const approveBroadcast = useApproveBroadcast();

  const campaigns = (campaignResponse?.data || []) as any[];
  const totalCount = campaignResponse?.total || campaigns.length;

  // Calculate queue stats
  const totalImpressions = campaigns.reduce(
    (acc, c) => acc + (c.targetImpressions || c.targetCount || 0),
    0,
  );
  const totalBudget = campaigns.reduce(
    (acc, c) => acc + (Number(c.totalCost || c.budget) || 0),
    0,
  );

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
              Reklamalar Moderatsiyasi
            </h1>
            <p className="section-sub" style={{ fontSize: 16 }}>
              Navbat yuklanmoqda...
            </p>
          </div>
        </div>
        <div className="elite-empty-state" style={{ padding: "100px 0" }}>
          <div className="loading-spinner" style={{ width: 40, height: 40 }} />
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
            Reklamalar Moderatsiyasi
          </h1>
          <p className="section-sub" style={{ fontSize: 16 }}>
            Hozirda{" "}
            <span style={{ color: "var(--blue)", fontWeight: 700 }}>
              {totalCount} ta
            </span>{" "}
            reklama va rassilka ko'rib chiqishni kutmoqda
          </p>
        </div>
        <div className="elite-live-pill">
          <div className="elite-live-pulse" style={{ background: "#ef4444" }} />
          Navbat: {totalCount} ta
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
              background: "rgba(239, 68, 68, 0.1)",
              color: "#ef4444",
            }}
          >
            <Shield size={24} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>
              {totalCount}
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
              background: "rgba(59, 130, 246, 0.1)",
              color: "#3b82f6",
            }}
          >
            <Target size={24} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>
              {totalImpressions.toLocaleString()}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                fontWeight: 500,
              }}
            >
              Jami qamrov
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
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>
              ${totalBudget.toLocaleString()}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                fontWeight: 500,
              }}
            >
              Jami byudjet
            </div>
          </div>
        </div>
      </div>

      <div className="elite-card">
        <div className="table-wrap">
          <table className="elite-table">
            <thead>
              <tr>
                <th>Turi & Mazmuni</th>
                <th>CPM / Target</th>
                <th>Byudjet</th>
                <th>Egasi</th>
                <th>Yuborilgan</th>
                <th style={{ textAlign: "right" }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div
                      className="elite-empty-state"
                      style={{ padding: "60px 0" }}
                    >
                      <Check size={32} style={{ color: "var(--green)" }} />
                      <p>Hozircha yangi reklamalar yo'q.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                campaigns.map((c: any) => (
                  <tr key={`${c.campaignType}-${c.id}`} className="elite-tr">
                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "flex-start",
                        }}
                      >
                        {c.campaignType === "BROADCAST" ? (
                          <Send size={16} color="#8b5cf6" />
                        ) : (
                          <Megaphone size={16} color="#3b82f6" />
                        )}
                        <div style={{ maxWidth: 280 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 13,
                              color: "white",
                            }}
                          >
                            {c.text?.slice(0, 50)}...
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: "var(--text-muted)",
                              marginTop: 4,
                            }}
                          >
                            {getContentTypeIcon(c.contentType).icon}{" "}
                            {c.campaignType} • {c.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="mono" style={{ fontSize: 13 }}>
                        {c.campaignType === "AD"
                          ? `$${c.cpmBid} CPM`
                          : "Rassilka"}
                        <div
                          style={{ fontSize: 11, color: "var(--text-muted)" }}
                        >
                          {(
                            c.targetImpressions || c.targetCount
                          ).toLocaleString()}{" "}
                          qamrov
                        </div>
                      </div>
                    </td>
                    <td>
                      <div
                        className="mono"
                        style={{ fontWeight: 700, color: "#10b981" }}
                      >
                        ${(Number(c.totalCost || c.budget) || 0).toFixed(2)}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12 }}>
                        @{c.advertiser?.username || c.advertiser?.firstName}
                      </div>
                      {c.campaignType === "BROADCAST" && (
                        <div
                          style={{ fontSize: 10, color: "var(--text-muted)" }}
                        >
                          @{c.bot?.username} orqali
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {fmtDate(c.createdAt)}
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          className="btn btn-success btn-sm btn-icon"
                          onClick={() =>
                            c.campaignType === "BROADCAST"
                              ? approveBroadcast.mutate(c.id)
                              : approveAd.mutate(c.id)
                          }
                          disabled={
                            approveAd.isPending || approveBroadcast.isPending
                          }
                        >
                          <Check size={14} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() =>
                            setModal({
                              type:
                                c.campaignType === "BROADCAST"
                                  ? "view-broadcast"
                                  : "view-ad",
                              data: c,
                            })
                          }
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm btn-icon"
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
                          <X size={14} />
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

      <style>{`
                .elite-tr:hover { background: rgba(255,255,255,0.02); }
                .btn-icon { padding: 8px; border-radius: 8px; border: none; }
            `}</style>
    </div>
  );
}
