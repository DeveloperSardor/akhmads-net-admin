import { useState } from "react";
import {
  useAds,
  usePauseAd,
  useResumeAd,
  useDeleteAd,
} from "../../hooks/queries/useAds";
import type { AdStatus } from "../../AppTypes";
import {
  Pause,
  Play,
  Trash2,
  Megaphone,
  DollarSign,
  Calendar,
  Users,
} from "lucide-react";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const adStatusColor: Record<string, string> = {
  SUBMITTED: "badge-amber",
  APPROVED: "badge-blue",
  RUNNING: "badge-green",
  PAUSED: "badge-gray",
  COMPLETED: "badge-purple",
  REJECTED: "badge-red",
  DRAFT: "badge-gray",
};

const adStatusMap: Record<string, string> = {
  all: "Barchasi",
  SUBMITTED: "Yuborilgan",
  APPROVED: "Tasdiqlangan",
  RUNNING: "Faol",
  PAUSED: "To'xtatilgan",
  COMPLETED: "Yakunlangan",
  REJECTED: "Rad etilgan",
  DRAFT: "Qoralama",
};

export function AllAdsPage() {
  const [statusFilter, setStatusFilter] = useState<AdStatus | "all">("all");
  const { data: response, isLoading } = useAds(
    statusFilter !== "all" ? { status: statusFilter } : {},
  );
  const ads = (response?.data || []) as any[];

  const pauseMutation = usePauseAd();
  const resumeMutation = useResumeAd();
  const deleteMutation = useDeleteAd();

  const handleTogglePause = (ad: any) => {
    if (ad.status === "RUNNING") {
      pauseMutation.mutate(ad.id, {
        onSuccess: () => alert("Reklama to'xtatildi"),
        onError: () => alert("Xatolik yuz berdi"),
      });
    } else if (ad.status === "PAUSED") {
      resumeMutation.mutate(ad.id, {
        onSuccess: () => alert("Reklama davom ettirildi"),
        onError: () => alert("Xatolik yuz berdi"),
      });
    }
  };

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        "Haqiqatan ham ushbu reklamani o'chirib tashlamoqchimisiz?",
      )
    ) {
      deleteMutation.mutate(id, {
        onSuccess: () => alert("Reklama o'chirildi"),
        onError: () => alert("Xatolik yuz berdi"),
      });
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
            Barcha Reklamalar
          </h1>
          <p className="section-sub" style={{ fontSize: 16 }}>
            Hozirda tizimda jami{" "}
            <span style={{ color: "var(--blue)", fontWeight: 700 }}>
              {ads.length} ta
            </span>{" "}
            reklama mavjud
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
        {[
          "all",
          "SUBMITTED",
          "APPROVED",
          "RUNNING",
          "PAUSED",
          "COMPLETED",
          "REJECTED",
        ].map((s) => (
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
            {adStatusMap[s] || s}
          </button>
        ))}
      </div>

      <div className="elite-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-wrap">
          <table className="elite-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: 32 }}>REKLAMA MAZMUNI</th>
                <th>EGASI</th>
                <th>STATUS</th>
                <th>STATISTIKA</th>
                <th>BYUDJET</th>
                <th>SANA</th>
                <th style={{ textAlign: "right", paddingRight: 32 }}>
                  AMALLAR
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 100 }}>
                    <div
                      className="loading-spinner"
                      style={{ margin: "0 auto" }}
                    />
                  </td>
                </tr>
              )}
              {!isLoading && ads.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div
                      className="elite-empty-state"
                      style={{ padding: "60px 0", textAlign: "center" }}
                    >
                      <Megaphone
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
              {ads.map((ad: any) => (
                <tr key={ad.id} className="elite-tr">
                  <td style={{ paddingLeft: 32 }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 16 }}
                    >
                      <div
                        className="elite-stat-icon-wrap"
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 14,
                          background: "rgba(59, 130, 246, 0.1)",
                          color: "var(--blue)",
                          flexShrink: 0,
                        }}
                      >
                        <Megaphone size={20} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 15,
                            color: "white",
                            marginBottom: 4,
                          }}
                        >
                          {ad.text?.slice(0, 45)}
                          {ad.text?.length > 45 ? "..." : ""}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.5)",
                            textTransform: "uppercase",
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                          }}
                        >
                          {ad.contentType}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <Users size={14} style={{ color: "var(--blue)" }} />
                      <span
                        style={{
                          fontWeight: 600,
                          color: "rgba(255,255,255,0.9)",
                        }}
                      >
                        @
                        {ad.advertiser?.username ||
                          ad.advertiser?.firstName ||
                          "Noma'lum"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${adStatusColor[ad.status]}`}
                      style={{
                        fontWeight: 800,
                        fontSize: 11,
                        padding: "6px 12px",
                        borderRadius: 8,
                      }}
                    >
                      {adStatusMap[ad.status] || ad.status}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          className="mono"
                          style={{ fontSize: 13, fontWeight: 700 }}
                        >
                          {(ad.deliveredImpressions || 0).toLocaleString()}{" "}
                          <span style={{ opacity: 0.3 }}>/</span>{" "}
                          {(ad.targetImpressions || 0).toLocaleString()}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color:
                              ad.ctr > 2 ? "var(--green)" : "var(--text-muted)",
                            fontWeight: 700,
                          }}
                        >
                          {ad.ctr || 0}% CTR
                        </span>
                      </div>
                      <div
                        className="progress-track"
                        style={{
                          width: "100%",
                          height: 6,
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: 10,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min(100, (ad.deliveredImpressions / (ad.targetImpressions || 1)) * 100) || 0}%`,
                            background:
                              "linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)",
                            borderRadius: 10,
                          }}
                        />
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
                        {(
                          Number(ad.totalCost) ||
                          Number(ad.budget) ||
                          0
                        ).toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      <Calendar size={14} />
                      {fmtDate(ad.createdAt)}
                    </div>
                  </td>
                  <td style={{ paddingRight: 32 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        justifyContent: "flex-end",
                      }}
                    >
                      {(ad.status === "RUNNING" || ad.status === "PAUSED") && (
                        <button
                          className="btn elite-action-btn"
                          onClick={() => handleTogglePause(ad)}
                          disabled={
                            pauseMutation.isPending || resumeMutation.isPending
                          }
                          style={{
                            background:
                              ad.status === "RUNNING"
                                ? "rgba(245, 158, 11, 0.1)"
                                : "rgba(16, 185, 129, 0.1)",
                            color:
                              ad.status === "RUNNING" ? "#f59e0b" : "#10b981",
                            border: "none",
                            padding: "8px 14px",
                            borderRadius: 10,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          {ad.status === "RUNNING" ? (
                            <Pause size={16} strokeWidth={2.5} />
                          ) : (
                            <Play size={16} strokeWidth={2.5} />
                          )}
                          {ad.status === "RUNNING" ? "Pauza" : "Davom"}
                        </button>
                      )}
                      <button
                        className="btn elite-action-btn"
                        onClick={() => handleDelete(ad.id)}
                        disabled={deleteMutation.isPending}
                        style={{
                          background: "rgba(239, 68, 68, 0.1)",
                          color: "#ef4444",
                          border: "none",
                          padding: "8px 14px",
                          borderRadius: 10,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        <Trash2 size={16} strokeWidth={2.5} />
                        O'chirish
                      </button>
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
          }
          .elite-action-btn {
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              cursor: pointer;
          }
          .elite-action-btn:hover:not(:disabled) {
              transform: translateY(-2px);
              filter: brightness(1.2);
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          }
          .elite-action-btn:active:not(:disabled) {
              transform: translateY(0);
          }
          .elite-action-btn:disabled {
              opacity: 0.4;
              cursor: not-allowed;
          }
      `}</style>
    </div>
  );
}
