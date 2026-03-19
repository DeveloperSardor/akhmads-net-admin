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
  Radio,
  Search,
  Filter,
  ChevronRight,
  Clock,
  Globe,
  DollarSign,
  User,
  ShieldCheck,
  LayoutGrid,
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

const TYPE_THEME = {
  success: {
    icon: CheckCircle2,
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    label: "Muvaffaqiyat",
  },
  error: {
    icon: XCircle,
    color: "#f43f5e",
    bg: "rgba(244,63,94,0.1)",
    label: "Xatolik",
  },
  warning: {
    icon: AlertTriangle,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    label: "Ogohlantirish",
  },
  system: {
    icon: Zap,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
    label: "Tizim",
  },
  broadcast: {
    icon: Send,
    color: "#6366f1",
    bg: "rgba(99,102,241,0.1)",
    label: "Broadcast",
  },
  ad: {
    icon: Megaphone,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    label: "Reklama",
  },
  bot: {
    icon: Bot,
    color: "#14b8a6",
    bg: "rgba(20,184,166,0.1)",
    label: "Bot",
  },
  info: {
    icon: Info,
    color: "#0ea5e9",
    bg: "rgba(14,165,233,0.1)",
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

  const socketRef = useRef<Socket | null>(null);

  const FILTERS = ["all", "bot", "system", "ad", "broadcast"];

  useEffect(() => {
    const fetchBots = async () => {
      try {
        const res = await adminService.getAllModerationBots({
          status: "ACTIVE",
          limit: 100,
        });
        setAllBots(res.data || []);
      } catch (err) {
        console.error("Failed to fetch bots", err);
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
    <div className="min-h-screen bg-[#050505] p-2 sm:p-6 lg:p-8 font-sans transition-all duration-500">
      {/* Header Stats & Title */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8 items-end">
        <div className="md:col-span-8 flex items-center gap-6">
          <div className="relative">
            <div
              className={`absolute inset-0 rounded-3xl blur-2xl opacity-20 ${isConnected ? "bg-emerald-500" : "bg-rose-500"} animate-pulse`}
            ></div>
            <div className="relative p-5 bg-[#121214] border border-white/10 rounded-3xl shadow-2xl">
              <Radio
                className={`w-8 h-8 ${isConnected ? "text-emerald-400" : "text-rose-400"}`}
              />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter sm:text-5xl">
              Jonli <span className="text-primary italic">Yangilanishlar</span>
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span
                className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${isConnected ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-400 animate-ping" : "bg-rose-400"}`}
                />
                {isConnected
                  ? "Sistema bilan ulanish mavjud"
                  : "Ulanish uzildi"}
              </span>
              <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest hidden sm:inline">
                Latency: 24ms • Server: AKHMADS-API-01
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 flex justify-end gap-3">
          <button
            onClick={() => setLogs([])}
            className="flex items-center gap-2 px-6 py-4 bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 text-gray-400 hover:text-rose-400 rounded-2xl transition-all font-black text-xs uppercase tracking-widest group"
          >
            <Trash2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            Tozalash
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Sidebar Controls */}
        <div className="xl:col-span-1 space-y-6">
          {/* Quick Stats */}
          <div className="bg-[#0f0f11] border border-white/5 rounded-[2.5rem] p-6 space-y-6 shadow-2xl shadow-black">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
                <Activity className="w-4 h-4 text-primary" />
                Statistika
              </div>
              <LayoutGrid className="w-4 h-4 text-gray-700" />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <SimpleStat
                label="Jami xabarlar"
                value={logs.length}
                color="text-indigo-400"
              />
              <SimpleStat
                label="Monitoring"
                value={allBots.length}
                color="text-teal-400"
                sub="ta aktiv bot"
              />
            </div>
          </div>

          {/* Filters Card */}
          <div className="bg-[#0f0f11] border border-white/5 rounded-[2.5rem] p-6 space-y-6">
            <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
              <Filter className="w-4 h-4 text-primary" />
              Filtrlash Paneli
            </div>

            <div className="space-y-3">
              <label className="text-[10px] text-gray-600 font-black uppercase tracking-widest ml-1">
                Kategoriya bo'yicha
              </label>
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setTypeFilter(f)}
                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      typeFilter === f
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/30"
                        : "bg-white/[0.03] text-gray-500 border-white/5 hover:bg-white/10"
                    }`}
                  >
                    {f === "all" ? "Barchasi" : f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] text-gray-600 font-black uppercase tracking-widest ml-1">
                Bot ixtiyoriy
              </label>
              <select
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all cursor-pointer appearance-none"
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

          {/* Search Card */}
          <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-6 space-y-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Izlash (ID, User...)"
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Main Activity Feed */}
        <div className="xl:col-span-3">
          <div className="flex items-center justify-between mb-6 px-4">
            <div className="flex items-center gap-3">
              <Radio className="w-5 h-5 text-emerald-500 animate-pulse" />
              <span className="text-white font-black text-sm uppercase tracking-widest">
                Faoliyat oqimi
              </span>
            </div>
            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              Displaying {filteredLogs.length} events
            </span>
          </div>

          <div className="space-y-4 max-h-[1000px] overflow-y-auto pr-2 custom-scrollbar pb-10">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, i) => (
                <LogCard key={i} log={log} index={i} />
              ))
            ) : (
              <EmptyState isConnected={isConnected} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SimpleStat({ label, value, color, sub }: any) {
  return (
    <div className="bg-black/20 border border-white/5 p-4 rounded-2xl">
      <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">
        {label}
      </div>
      <div className={`text-2xl font-black ${color} tracking-tighter`}>
        {value}
      </div>
      {sub && (
        <div className="text-[9px] text-gray-700 font-bold mt-1 uppercase">
          {sub}
        </div>
      )}
    </div>
  );
}

function LogCard({ log, index }: { log: LogEntry; index: number }) {
  const theme =
    TYPE_THEME[log.type as keyof typeof TYPE_THEME] || TYPE_THEME.info;
  const Icon = theme.icon;

  return (
    <div
      className="group bg-[#0f0f11] hover:bg-[#141417] border border-white/5 hover:border-white/10 rounded-[2rem] p-5 sm:p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl shadow-none"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Left Icon Block */}
        <div className="shrink-0 flex sm:flex-col items-center gap-4">
          <div className="relative group/icon">
            <div
              className="absolute inset-0 rounded-2xl blur-lg transition-all duration-300 opacity-0 group-hover/icon:opacity-40"
              style={{ backgroundColor: theme.color }}
            ></div>
            <div className="relative p-4 rounded-2xl border border-white/5 bg-[#1a1a1c] transition-transform group-hover/icon:-rotate-6">
              <Icon className="w-5 h-5" style={{ color: theme.color }} />
            </div>
          </div>
          <div className="sm:h-20 w-px bg-white/5 hidden sm:block"></div>
        </div>

        {/* Content Block */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 text-gray-500 font-bold text-[10px] uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-full">
              <Clock className="w-3 h-3 text-gray-700" />
              {new Date(log.timestamp).toLocaleTimeString("uz-UZ", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
            <span
              className="text-[10px] font-black uppercase tracking-[0.1em] px-3 py-1 rounded-lg border border-white/5"
              style={{ color: theme.color, backgroundColor: theme.bg }}
            >
              {theme.label}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-white/90 text-[16px] font-medium leading-relaxed tracking-tight break-words">
              {log.message}
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              {log.data?.username && (
                <Badge
                  icon={User}
                  label={`@${log.data.username}`}
                  color="text-indigo-400"
                  bg="bg-indigo-400/5"
                />
              )}
              {log.data?.lang && (
                <Badge
                  icon={Globe}
                  label={log.data.lang}
                  color="text-sky-400"
                  bg="bg-sky-400/5"
                  border
                />
              )}
              {log.data?.amount && (
                <Badge
                  icon={DollarSign}
                  label={`$${log.data.amount}`}
                  color="text-emerald-400"
                  bg="bg-emerald-400/5"
                  border
                />
              )}
            </div>
          </div>

          {log.data?.details && (
            <div className="text-[11px] text-gray-600 font-medium bg-black/30 px-3 py-2 rounded-xl italic border border-white/5">
              "{log.data.details}"
            </div>
          )}
        </div>

        {/* Right Action Block */}
        {log.data?.botUsername && (
          <div className="shrink-0 pt-2 sm:pt-0">
            <a
              href={`https://t.me/${log.data.botUsername}`}
              target="_blank"
              rel="noreferrer"
              className="group/link flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-3xl transition-all"
            >
              <div className="flex flex-col items-end">
                <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest group-hover/link:text-primary transition-colors">
                  Target Bot
                </div>
                <div className="text-sm font-bold text-gray-300">
                  @{log.data.botUsername}
                </div>
              </div>
              <div className="p-2 bg-black/40 rounded-xl group-hover/link:translate-x-1 transition-all">
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover/link:text-white" />
              </div>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ icon: Icon, label, color, bg, border }: any) {
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${bg} ${border ? "border border-white/5" : ""}`}
    >
      <Icon className={`w-3 h-3 ${color}`} />
      <span
        className={`text-[11px] font-bold ${color} tracking-tight uppercase`}
      >
        {label}
      </span>
    </div>
  );
}

function EmptyState({ isConnected }: any) {
  return (
    <div className="p-20 flex flex-col items-center justify-center gap-6 animate-pulse opacity-20">
      <ShieldCheck className="w-20 h-20 text-gray-600" />
      <div className="text-center">
        <div className="text-2xl font-black text-white uppercase tracking-widest">
          {isConnected ? "Oqim bo'sh" : "Offline"}
        </div>
        <div className="text-gray-600 text-sm font-bold uppercase tracking-widest mt-2">
          {isConnected ? "Hozircha yangiliklar yo'q" : "Ulanish kutilmoqda..."}
        </div>
      </div>
    </div>
  );
}
