import { useEffect, useState, useRef, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import {
  Activity,
  Bot,
  Megaphone,
  Send,
  Trash2,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Search,
  Clock,
  DollarSign,
  User,
  History,
  ChevronRight,
} from "lucide-react";
import { adminService } from "../../api/services/admin.service";
import type { BotResponse } from "../../api/services/bots.service";

interface LogEntry {
  timestamp: string;
  message: string;
  type:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "system"
    | "broadcast"
    | "ad"
    | "bot";
  data?: any;
}

const TYPE_CONFIG: Record<string, any> = {
  success: {
    label: "Muvaffaqiyat",
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    icon: CheckCircle2,
  },
  error: {
    label: "Xatolik",
    color: "#f43f5e",
    bg: "rgba(244,63,94,0.1)",
    icon: XCircle,
  },
  warning: {
    label: "Ogohlantirish",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    icon: AlertTriangle,
  },
  system: {
    label: "Tizim",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
    icon: Zap,
  },
  broadcast: {
    label: "Broadcast",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.1)",
    icon: Send,
  },
  ad: {
    label: "Reklama",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    icon: Megaphone,
  },
  bot: {
    label: "Bot-Aktiv",
    color: "#14b8a6",
    bg: "rgba(20,184,166,0.1)",
    icon: Bot,
  },
  info: {
    label: "Ma'lumot",
    color: "#0ea5e9",
    bg: "rgba(14,165,233,0.1)",
    icon: Info,
  },
};

export function LiveUpdatesPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [botFilter, setBotFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [allBots, setAllBots] = useState<BotResponse[]>([]);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const fetchBots = async () => {
      try {
        const res = await adminService.getAllModerationBots({
          status: "ACTIVE",
          limit: 100,
        });
        setAllBots(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBots();
  }, []);

  useEffect(() => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    const apiUrl =
      import.meta.env.VITE_API_URL || "https://api.akhmads.net/api/v1";
    const socketUrl = new URL(apiUrl).origin;

    const socket = io(`${socketUrl}/admin`, {
      auth: { token },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("terminal:log", (log: LogEntry) => {
      setLogs((prev) => [log, ...prev].slice(0, 200));
    });

    socketRef.current = socket;
    return () => {
      socket.disconnect();
    };
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesType = typeFilter === "all" || log.type === typeFilter;
      const matchesBot =
        botFilter === "all" || log.data?.botUsername === botFilter;
      const matchesSearch =
        !searchQuery ||
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.data?.username?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesType && matchesBot && matchesSearch;
    });
  }, [logs, typeFilter, botFilter, searchQuery]);

  return (
    <div className="live-updates-container">
      {/* Header Panel */}
      <div className="live-header">
        <div className="header-info text-2xl font-semibold">
          <div className="title-row">
            <Zap className="title-icon" />
            <h1>Live Activity Stream</h1>
          </div>
          <div className="status-row">
            <span
              className={`status-badge ${isConnected ? "online" : "offline"}`}
            >
              <div className="status-dot"></div>
              {isConnected ? "SISTEMA BILAN ULANILGAN" : "ULANISH UZILDI"}
            </span>
            <span className="stats-indicator">
              <History size={14} /> monitoring {logs.length} events
            </span>
          </div>
        </div>

        <div className="header-actions">
          <div className="search-box">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Xabar qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="clear-btn" onClick={() => setLogs([])}>
            <Trash2 size={16} /> Tozalash
          </button>
        </div>
      </div>

      {/* Control Filters Area */}
      <div className="filters-bar">
        <div className="type-filters">
          {["all", "bot", "broadcast", "ad", "system", "error"].map((f) => (
            <button
              key={f}
              className={`filter-tab ${typeFilter === f ? "active" : ""}`}
              onClick={() => setTypeFilter(f)}
            >
              {f === "all" ? "BARCHASI" : f.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="bot-selector-wrap">
          <Bot size={14} />
          <select
            value={botFilter}
            onChange={(e) => setBotFilter(e.target.value)}
          >
            <option value="all">Barcha Botlar</option>
            {allBots.map((b) => (
              <option key={b.id} value={b.username}>
                @{b.username}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Stream Display */}
      <div className="activity-stream">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log, i) => (
            <div key={i} className={`activity-row type-${log.type}`}>
              <div className="row-time">
                {new Date(log.timestamp).toLocaleTimeString("uz-UZ", {
                  hour12: false,
                })}
              </div>

              <div className="row-type">
                <div
                  className="type-pill"
                  style={{
                    color: TYPE_CONFIG[log.type]?.color,
                    backgroundColor: TYPE_CONFIG[log.type]?.bg,
                  }}
                >
                  {TYPE_CONFIG[log.type]?.label || log.type}
                </div>
              </div>

              <div className="row-bot">
                {log.data?.botUsername ? (
                  <a
                    href={`https://t.me/${log.data.botUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bot-link"
                  >
                    <Bot size={13} /> @{log.data.botUsername}
                  </a>
                ) : (
                  <span className="system-label">System</span>
                )}
              </div>

              <div className="row-message">
                <div className="message-text">{log.message}</div>
                <div className="message-meta">
                  {log.data?.username && (
                    <span>
                      <User size={11} /> {log.data.username}
                    </span>
                  )}
                  {log.data?.amount && (
                    <span className="amount-val">
                      <DollarSign size={11} /> {log.data.amount}
                    </span>
                  )}
                </div>
              </div>

              <div className="row-action">
                <ChevronRight />
              </div>
            </div>
          ))
        ) : (
          <div className="empty-stream">
            <Activity className="pulse-icon" />
            <p>
              {isConnected ? "Yangi xabarlar kutilmoqda..." : "Ulanilmoqda..."}
            </p>
          </div>
        )}
      </div>

      <style>{`
        .live-updates-container {
           padding: 24px;
           color: #e2e8f0;
           font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
           background: transparent;
        }

        .live-header {
           display: flex;
           justify-content: space-between;
           align-items: flex-end;
           margin-bottom: 24px;
           border-bottom: 1px solid rgba(255,255,255,0.05);
           padding-bottom: 24px;
        }

        .title-row {
           display: flex;
           align-items: center;
           gap: 12px;
           margin-bottom: 8px;
        }

        .title-icon {
           color: #8b5cf6;
        }

        .live-header h1 {
           margin: 0;
           font-size: 28px;
           font-weight: 800;
           letter-spacing: -0.5px;
           color: #fff;
        }

        .status-row {
           display: flex;
           align-items: center;
           gap: 16px;
        }

        .status-badge {
           display: flex;
           align-items: center;
           gap: 8px;
           font-size: 10px;
           font-weight: 800;
           letter-spacing: 1px;
           padding: 4px 12px;
           border-radius: 100px;
           background: rgba(255,255,255,0.03);
        }

        .status-badge.online { color: #10b981; }
        .status-badge.offline { color: #f43f5e; }

        .status-dot {
           width: 6px;
           height: 6px;
           border-radius: 50%;
           background: currentColor;
           box-shadow: 0 0 8px currentColor;
        }
        
        .stats-indicator {
           font-size: 11px;
           color: #64748b;
           display: flex;
           align-items: center;
           gap: 6px;
        }

        .header-actions {
           display: flex;
           gap: 12px;
        }

        .search-box {
           position: relative;
           width: 280px;
        }

        .search-icon {
           position: absolute;
           left: 12px;
           top: 11px;
           color: #64748b;
        }

        .search-box input {
           width: 100%;
           background: rgba(255,255,255,0.03);
           border: 1px solid rgba(255,255,255,0.1);
           border-radius: 12px;
           padding: 10px 12px 10px 38px;
           color: #fff;
           font-size: 13px;
           outline: none;
           transition: 0.2s;
        }

        .search-box input:focus {
           border-color: #8b5cf6;
           background: rgba(255,255,255,0.06);
        }

        .clear-btn {
           background: rgba(244,63,94,0.1);
           border: 1px solid rgba(244,63,94,0.2);
           color: #f43f5e;
           display: flex;
           align-items: center;
           gap: 8px;
           padding: 0 16px;
           border-radius: 12px;
           font-size: 12px;
           font-weight: 600;
           cursor: pointer;
           transition: 0.2s;
        }

        .clear-btn:hover {
           background: rgba(244,63,94,0.2);
        }

        /* Filters Bar */
        .filters-bar {
           display: flex;
           justify-content: space-between;
           align-items: center;
           margin-bottom: 20px;
        }

        .type-filters {
           display: flex;
           gap: 6px;
        }

        .filter-tab {
           background: transparent;
           border: 1px solid transparent;
           color: #64748b;
           padding: 6px 14px;
           border-radius: 10px;
           font-size: 11px;
           font-weight: 700;
           cursor: pointer;
           transition: 0.2s;
        }

        .filter-tab:hover {
           color: #cbd5e1;
           background: rgba(255,255,255,0.03);
        }

        .filter-tab.active {
           background: #8b5cf6;
           color: #fff;
           border-color: #8b5cf6;
        }

        .bot-selector-wrap {
           display: flex;
           align-items: center;
           gap: 8px;
           background: rgba(255,255,255,0.03);
           border: 1px solid rgba(255,255,255,0.1);
           padding: 4px 12px;
           border-radius: 10px;
        }

        .bot-selector-wrap select {
           background: transparent;
           border: none;
           color: #cbd5e1;
           font-size: 12px;
           font-weight: 600;
           outline: none;
           cursor: pointer;
        }

        /* Activity Stream Table */
        .activity-stream {
           border: 1px solid rgba(255,255,255,0.05);
           border-radius: 20px;
           background: rgba(255,255,255,0.01);
           overflow: hidden;
        }

        .activity-row {
           display: grid;
           grid-template-columns: 80px 140px 160px 1fr 40px;
           gap: 16px;
           padding: 16px 24px;
           align-items: center;
           border-bottom: 1px solid rgba(255,255,255,0.03);
           transition: 0.2s;
           animation: slideIn 0.3s ease-out;
        }

        .activity-row:hover {
           background: rgba(255,255,255,0.02);
        }

        @keyframes slideIn {
           from { opacity: 0; transform: translateY(-10px); }
           to { opacity: 1; transform: translateY(0); }
        }

        .row-time {
           font-size: 12px;
           color: #475569;
           font-weight: 600;
        }

        .type-pill {
           display: inline-block;
           font-size: 10px;
           font-weight: 800;
           padding: 4px 10px;
           border-radius: 8px;
           text-transform: uppercase;
           letter-spacing: 0.5px;
        }

        .bot-link {
           display: flex;
           align-items: center;
           gap: 6px;
           color: #cbd5e1;
           font-size: 12px;
           font-weight: 600;
           text-decoration: none;
           transition: 0.2s;
        }

        .bot-link:hover {
           color: #8b5cf6;
        }

        .system-label {
           font-size: 11px;
           color: #475569;
           font-style: italic;
        }

        .message-text {
           font-size: 14px;
           color: #f1f5f9;
           line-height: 1.4;
           margin-bottom: 4px;
        }

        .message-meta {
           display: flex;
           gap: 12px;
           font-size: 11px;
           color: #64748b;
           font-weight: 500;
        }

        .message-meta span {
           display: flex;
           align-items: center;
           gap: 4px;
        }

        .amount-val {
           color: #10b981;
           font-weight: 700;
        }

        .row-action {
           color: #334155;
           display: flex;
           justify-content: flex-end;
        }

        .empty-stream {
           padding: 80px;
           text-align: center;
           color: #475569;
        }

        .pulse-icon {
           width: 40px;
           height: 40px;
           margin-bottom: 16px;
           animation: pulse 2s infinite;
        }

        @keyframes pulse {
           0% { transform: scale(0.95); opacity: 0.5; }
           50% { transform: scale(1); opacity: 0.8; }
           100% { transform: scale(0.95); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
