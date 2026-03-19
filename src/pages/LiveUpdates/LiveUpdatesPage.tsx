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

const TYPE_CONFIG = {
  success: {
    label: "Success",
    color: "#10b981",
    bg: "#064e3b",
    icon: CheckCircle2,
  },
  error: { label: "Critical", color: "#f43f5e", bg: "#4c0519", icon: XCircle },
  warning: {
    label: "Warning",
    color: "#f59e0b",
    bg: "#451a03",
    icon: AlertTriangle,
  },
  system: { label: "System", color: "#8b5cf6", bg: "#2e1065", icon: Zap },
  broadcast: {
    label: "Broadcast",
    color: "#6366f1",
    bg: "#1e1b4b",
    icon: Send,
  },
  ad: {
    label: "Advertising",
    color: "#3b82f6",
    bg: "#172554",
    icon: Megaphone,
  },
  bot: { label: "Bot Activity", color: "#14b8a6", bg: "#042f2e", icon: Bot },
  info: { label: "Info", color: "#0ea5e9", bg: "#082f49", icon: Info },
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
      setLogs((prev) => [log, ...prev].slice(0, 300));
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
    <div className="min-h-screen bg-[#09090b] text-zinc-400 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header - Simple & Clean */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-900">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2">
              Live Console{" "}
              <span className="text-xs font-medium text-zinc-600 px-2 py-0.5 rounded border border-zinc-800">
                BETA v2
              </span>
            </h1>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-rose-500 animate-pulse"}`}
                ></div>
                <span
                  className={
                    isConnected
                      ? "text-emerald-500/80 font-medium"
                      : "text-rose-500/80"
                  }
                >
                  {isConnected ? "Operational" : "Disconnected"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 border-l border-zinc-800 pl-4">
                <History className="w-3.5 h-3.5 text-zinc-600" />
                <span>Tracking {logs.length} events</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="bg-transparent border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500/50 rounded-lg py-2 pl-9 pr-4 text-xs text-zinc-200 outline-none w-full md:w-64 transition-all"
              />
            </div>
            <button
              onClick={() => setLogs([])}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-800 hover:bg-zinc-900 rounded-lg text-xs font-medium transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {["all", "bot", "broadcast", "ad", "system", "error"].map((f) => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  typeFilter === f
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-700"
                }`}
              >
                {f === "all"
                  ? "All Events"
                  : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-600">Bot:</span>
            <select
              value={botFilter}
              onChange={(e) => setBotFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-zinc-300 outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
            >
              <option value="all">Global (All Bots)</option>
              {allBots.map((b) => (
                <option key={b.id} value={b.username}>
                  @{b.username}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Console Table */}
        <div className="bg-[#0c0c0e] border border-zinc-900 rounded-xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-[100px_140px_180px_1fr_150px] gap-4 px-6 py-4 bg-zinc-900/30 border-b border-zinc-900 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            <div>Time</div>
            <div>Type</div>
            <div>Source Bot</div>
            <div>Activity Overview</div>
            <div className="text-right">Origin</div>
          </div>

          <div className="max-h-[700px] overflow-y-auto divide-y divide-zinc-900 custom-scrollbar pb-10">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, i) => <ConsoleRow key={i} log={log} />)
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #18181b; border-radius: 10px; }
      `}</style>
    </div>
  );
}

function ConsoleRow({ log }: { log: LogEntry }) {
  const config =
    TYPE_CONFIG[log.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.info;
  const Icon = config.icon;
  const time = new Date(log.timestamp).toLocaleTimeString("uz-UZ", {
    hour12: false,
  });

  return (
    <div className="grid grid-cols-[100px_140px_180px_1fr_150px] gap-4 px-6 py-4 hover:bg-zinc-900/30 transition-all group items-center">
      {/* Column: Time */}
      <div className="text-[11px] font-mono font-medium text-zinc-600 group-hover:text-zinc-400 flex items-center gap-2">
        <Clock className="w-3 h-3 opacity-40" />
        {time}
      </div>

      {/* Column: Type Badge */}
      <div className="flex items-center">
        <div
          className="flex items-center gap-2 px-2.5 py-1 rounded-full border"
          style={{
            borderColor: `${config.color}20`,
            backgroundColor: `${config.color}10`,
          }}
        >
          <Icon className="w-3 h-3" style={{ color: config.color }} />
          <span
            className="text-[10px] font-bold uppercase tracking-tight"
            style={{ color: config.color }}
          >
            {config.label}
          </span>
        </div>
      </div>

      {/* Column: Bot Source */}
      <div className="flex items-center gap-2 truncate">
        {log.data?.botUsername ? (
          <div className="flex items-center gap-2 min-w-0">
            <Bot className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
            <a
              href={`https://t.me/${log.data.botUsername}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-zinc-400 hover:text-indigo-400 transition-colors truncate"
            >
              @{log.data.botUsername}
            </a>
          </div>
        ) : (
          <span className="text-[10px] text-zinc-800 font-bold uppercase">
            System-wide
          </span>
        )}
      </div>

      {/* Column: Main Message */}
      <div className="min-w-0 flex flex-col gap-1">
        <p className="text-[13px] text-zinc-300 font-medium leading-relaxed truncate group-hover:text-white transition-colors">
          {log.message}
        </p>
        <div className="flex items-center gap-3">
          {log.data?.username && (
            <span className="text-[10px] text-zinc-600 flex items-center gap-1">
              <User className="w-3 h-3" />
              {log.data.username}
            </span>
          )}
          {log.data?.amount && (
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <DollarSign className="w-3 h-3" />${log.data.amount}
            </span>
          )}
          {log.data?.lang && (
            <span className="text-[10px] text-zinc-700 uppercase">
              {log.data.lang}
            </span>
          )}
        </div>
      </div>

      {/* Column: Right Action */}
      <div className="text-right flex items-center justify-end gap-3">
        {log.data?.action && (
          <span className="text-[9px] font-bold text-zinc-700 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
            {log.data.action}
          </span>
        )}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Info className="w-3.5 h-3.5 text-zinc-700 hover:text-zinc-500 cursor-pointer" />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-20 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
        <Activity className="w-6 h-6 text-zinc-700 animate-pulse" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-zinc-500">
          Listening for inbound traffic
        </p>
        <p className="text-xs text-zinc-700">
          Events will synchronize here as they occur.
        </p>
      </div>
    </div>
  );
}
