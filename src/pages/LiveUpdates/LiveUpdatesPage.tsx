import { useEffect, useState, useRef, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import {
  Activity,
  Bot,
  Megaphone,
  Send,
  Trash2,
  Zap,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Radio,
  Search,
  Filter,
  ChevronDown,
  Clock,
  Globe,
  DollarSign,
  User,
  ShieldCheck,
  ZapOff,
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
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    accent: "bg-emerald-500",
    label: "Muvaffaqiyat",
  },
  error: {
    icon: XCircle,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    accent: "bg-rose-500",
    label: "Xatolik",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    accent: "bg-amber-500",
    label: "Ogohlantirish",
  },
  system: {
    icon: Zap,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    accent: "bg-purple-500",
    label: "Tizim",
  },
  broadcast: {
    icon: Send,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    accent: "bg-indigo-500",
    label: "Broadcast",
  },
  ad: {
    icon: Megaphone,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    accent: "bg-blue-500",
    label: "Reklama",
  },
  bot: {
    icon: Bot,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    accent: "bg-teal-500",
    label: "Bot",
  },
  info: {
    icon: Info,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    accent: "bg-sky-500",
    label: "Ma'lumot",
  },
};

export function LiveUpdatesPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [botFilter, setBotFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [allBots, setAllBots] = useState<BotResponse[]>([]);
  const [isLoadingBots, setIsLoadingBots] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const FILTERS = [
    "all",
    "bot",
    "system",
    "ad",
    "broadcast",
    "success",
    "error",
  ];

  // Fetch Bots for filter
  useEffect(() => {
    const fetchBots = async () => {
      setIsLoadingBots(true);
      try {
        const res = await adminService.getAllModerationBots({
          status: "ACTIVE",
          limit: 100,
        });
        setAllBots(res.data || []);
      } catch (err) {
        console.error("Failed to fetch bots", err);
      } finally {
        setIsLoadingBots(false);
      }
    };
    fetchBots();
  }, []);

  // Socket setup
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

    socket.on("connect", () => {
      setIsConnected(true);
      setLogs((prev) => [
        {
          timestamp: new Date().toISOString(),
          message:
            "Live kanal bilan muvaffaqiyatli ulanildi. Botlar kuzatilmoqda...",
          type: "system",
        },
        ...prev,
      ]);
    });

    socket.on("disconnect", () => setIsConnected(false));

    socket.on("connect_error", (error) => {
      setIsConnected(false);
      setLogs((prev) => [
        {
          timestamp: new Date().toISOString(),
          message: `Ulanish xatosi: ${error.message}`,
          type: "error",
        },
        ...prev,
      ]);
    });

    socket.on("terminal:log", (log: LogEntry) => {
      setLogs((prev) => [log, ...prev].slice(0, 500));
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
        botFilter === "all" ||
        log.data?.botUsername === botFilter ||
        log.data?.botId === botFilter;
      const matchesSearch =
        !searchQuery ||
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.data?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.data?.userId?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesType && matchesBot && matchesSearch;
    });
  }, [logs, typeFilter, botFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
              <Radio
                className={`w-6 h-6 text-primary ${isConnected ? "animate-pulse" : ""}`}
              />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                Jonli Efir <span className="text-primary">Terminal</span>
              </h1>
              <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">
                Real-time network monitoring & bot activity
              </p>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-4">
          <StatCard
            icon={Activity}
            label="Ulanish"
            value={isConnected ? "NORMAL" : "OFFLINE"}
            color={isConnected ? "text-emerald-400" : "text-rose-400"}
            sub={isConnected ? "Socket Active" : "Waiting..."}
          />
          <StatCard
            icon={MessageSquare}
            label="Hodisalar"
            value={logs.length.toString()}
            color="text-blue-400"
            sub="Oxirgi 500 ta"
          />
          <StatCard
            icon={Bot}
            label="Botlar"
            value={allBots.length.toString()}
            color="text-teal-400"
            sub="Tizimda faol"
          />
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-[#0e0e11] border border-white/5 rounded-[2rem] p-4 flex flex-col lg:flex-row gap-4 items-center shadow-xl">
        {/* Search */}
        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Xabar yoki foydalanuvchi bo'yicha qidirish..."
            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Type Filter */}
        <div className="flex flex-wrap gap-2 items-center px-4 py-2 bg-white/[0.02] rounded-2xl border border-white/5">
          <Filter className="w-4 h-4 text-gray-500 mr-2" />
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                typeFilter === f
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                  : "bg-transparent text-gray-500 border-transparent hover:bg-white/5 hover:text-gray-300"
              }`}
            >
              {f === "all"
                ? "BARCHASI"
                : TYPE_CONFIG[f as keyof typeof TYPE_CONFIG]?.label || f}
            </button>
          ))}
        </div>

        {/* Bot Filter */}
        <div className="relative w-full lg:w-64 group ml-auto">
          <Bot className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors pointer-events-none" />
          <select
            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-11 pr-10 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] appearance-none cursor-pointer transition-all"
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
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        <button
          onClick={() => setLogs([])}
          className="flex items-center gap-2 px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-2xl text-xs font-bold transition-all ml-2"
        >
          <Trash2 className="w-4 h-4" />
          TOZALASH
        </button>
      </div>

      {/* Main Terminal Feed */}
      <div className="bg-[#0a0a0b] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-white/[0.03] to-transparent border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-white/10 border border-white/5"
                />
              ))}
            </div>
            <span className="text-xs font-bold text-gray-400 tracking-[0.2em] uppercase">
              System Live Feed{" "}
              <span className="text-gray-600 ml-2">
                [{filteredLogs.length}]
              </span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold bg-white/[0.03] px-3 py-1.5 rounded-full">
              <div
                className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
              />
              {isConnected ? "NETWORK ACTIVE" : "CONNECTION LOST"}
            </div>
          </div>
        </div>

        {/* Feed Container */}
        <div className="overflow-y-auto max-h-[80vh] min-h-[500px] scrollbar-hide">
          {!isConnected && filteredLogs.length === 0 && (
            <div className="h-[500px] flex flex-col items-center justify-center gap-6 p-10 animate-in fade-in duration-700">
              <div className="relative">
                <Radio className="w-20 h-20 text-gray-800 animate-ping absolute inset-0 opacity-20" />
                <Radio className="w-20 h-20 text-primary/40 relative z-10" />
                <ZapOff className="absolute -top-2 -right-2 w-8 h-8 text-rose-500/50" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                  Ulanish kutilmoqda
                </h3>
                <p className="text-gray-500 max-w-xs mx-auto text-sm">
                  Server bilan WebSocket aloqasi o'rnatilmoqda. Iltimos
                  kuting...
                </p>
              </div>
            </div>
          )}

          {isConnected && filteredLogs.length === 0 && (
            <div className="h-[500px] flex flex-col items-center justify-center gap-6 p-10 grayscale opacity-50">
              <ShieldCheck className="w-16 h-16 text-primary" />
              <div className="text-center">
                <h3 className="text-lg font-bold text-white mb-1">
                  Hozircha hech narsa yo'q
                </h3>
                <p className="text-gray-500 text-sm">
                  Tanlangan filtrlar bo'yicha hodisalar topilmadi.
                </p>
              </div>
            </div>
          )}

          <div className="divide-y divide-white/[0.03]">
            {filteredLogs.map((log, i) => (
              <FeedItem key={i} log={log} />
            ))}
            <div ref={bottomRef} className="h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, sub }: any) {
  return (
    <div className="bg-[#0e0e11] border border-white/5 rounded-2xl p-4 min-w-[160px] flex flex-col gap-1 transition-all hover:border-white/10">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
          {label}
        </span>
      </div>
      <div className={`text-xl font-black ${color} tracking-tight`}>
        {value}
      </div>
      <div className="text-[10px] text-gray-600 font-bold">{sub}</div>
    </div>
  );
}

function FeedItem({ log }: { log: LogEntry }) {
  const config =
    TYPE_CONFIG[log.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.info;
  const Icon = config.icon;

  return (
    <div className="group flex flex-col md:flex-row gap-4 items-start px-8 py-5 hover:bg-white/[0.02] transition-colors border-l-4 border-l-transparent hover:border-l-primary/40">
      {/* Time column */}
      <div className="w-20 pt-1 shrink-0 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-gray-600">
          <Clock className="w-3 h-3" />
          <span className="text-[10px] font-mono font-bold tracking-tight">
            {new Date(log.timestamp).toLocaleTimeString("uz-UZ", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
        <div
          className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border self-center ${config.bg} ${config.color} ${config.border}`}
        >
          {config.label}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {/* Primary message */}
          <p className="text-[15px] font-medium text-white/90 leading-snug">
            {log.message}
          </p>

          {/* User badge */}
          {(log.data?.username || log.data?.userId) && (
            <div className="flex items-center gap-1.5 bg-white/[0.05] border border-white/5 px-2 py-0.5 rounded-lg">
              <User className="w-3 h-3 text-gray-500" />
              <span className="text-[11px] font-bold text-gray-400">
                {log.data.username
                  ? `@${log.data.username}`
                  : `ID: ${log.data.userId}`}
              </span>
            </div>
          )}

          {/* Lang/Country badge */}
          {log.data?.lang && (
            <div className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-lg">
              <Globe className="w-3 h-3 text-sky-400" />
              <span className="text-[10px] font-black text-sky-400 uppercase">
                {log.data.lang}
              </span>
            </div>
          )}

          {/* Amount badge */}
          {log.data?.amount && (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              <span className="text-[11px] font-black text-emerald-400">
                ${Number(log.data.amount).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Data summary / Small metadata */}
        {log.data?.action && (
          <div className="text-[10px] text-gray-500 font-mono italic opacity-60">
            Action: {log.data.action} • {log.data.details || ""}
          </div>
        )}
      </div>

      {/* Right side bot shortcut */}
      {log.data?.botUsername && (
        <div className="shrink-0 flex items-center gap-2">
          <a
            href={`https://t.me/${log.data.botUsername}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-white/[0.03] border border-white/5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-primary/20 hover:border-primary/30 transition-all flex items-center gap-2"
          >
            <Bot className="w-3.5 h-3.5" />@{log.data.botUsername}
          </a>
        </div>
      )}
    </div>
  );
}
