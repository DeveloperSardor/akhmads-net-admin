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
  Clock,
  Globe,
  DollarSign,
  User,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Signal,
  ArrowUpRight,
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

const TYPE_MAP = {
  success: { label: "Muvaffaqiyat", color: "emerald", icon: CheckCircle2 },
  error: { label: "Xatolik", color: "rose", icon: XCircle },
  warning: { label: "Ehtiyotkorlik", color: "amber", icon: AlertTriangle },
  system: { label: "Sistema", color: "purple", icon: Zap },
  broadcast: { label: "Broadcast", color: "indigo", icon: Send },
  ad: { label: "Reklama", color: "blue", icon: Megaphone },
  bot: { label: "Bot Update", color: "teal", icon: Bot },
  info: { label: "Ma'lumot", color: "sky", icon: Info },
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
        log.data?.userId?.includes(searchQuery);
      return matchesType && matchesBot && matchesSearch;
    });
  }, [logs, typeFilter, botFilter, searchQuery]);

  // Statistics for the sidebar
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach((l) => (counts[l.type] = (counts[l.type] || 0) + 1));
    return counts;
  }, [logs]);

  return (
    <div className="min-h-screen bg-[#050608] text-slate-200 p-4 md:p-8 font-sans">
      {/* Top Navigation / Status Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.15)] overflow-hidden relative">
            <div className="absolute inset-0 bg-primary opacity-5 animate-pulse"></div>
            <Signal
              className={`w-7 h-7 ${isConnected ? "text-primary" : "text-slate-700 animate-pulse"}`}
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Monitor Center
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-rose-500 shadow-[0_0_8px_#f43f5e]"}`}
              ></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {isConnected ? "Network Connected" : "Connection Lost"} • v2.4.0
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
          {["all", "bot", "ad", "broadcast", "system"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                typeFilter === t
                  ? "bg-primary text-white shadow-lg"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              }`}
            >
              {t}
            </button>
          ))}
          <div className="w-px h-6 bg-white/10 mx-2"></div>
          <button
            onClick={() => setLogs([])}
            className="p-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
            title="Clear stream"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Event Stream */}
        <div className="xl:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-500" />
              Live Stream Intelligence
            </h2>
            <div className="relative group min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, IDs, or text..."
                className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs focus:bg-slate-900 focus:border-primary/50 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-3 pb-20">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, i) => <EventCard key={i} log={log} />)
            ) : (
              <EmptyStream isConnected={isConnected} />
            )}
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="xl:col-span-1 space-y-8">
          {/* Bot Filter Card */}
          <div className="glass-panel p-6">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest mb-6">
              <Bot className="w-4 h-4 text-primary" />
              Filter By Target
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <BotItem
                name="All Bots"
                username="all"
                icon={LayoutGrid}
                active={botFilter === "all"}
                onClick={() => setBotFilter("all")}
              />
              {allBots.map((bot) => (
                <BotItem
                  key={bot.id}
                  name={bot.name}
                  username={bot.username}
                  active={botFilter === bot.username}
                  onClick={() => setBotFilter(bot.username)}
                />
              ))}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <MetricCard
              label="System Integrity"
              value="99.9%"
              icon={ShieldCheck}
              growth="+0.02%"
            />
            <MetricCard
              label="Active Listeners"
              value="2,481"
              icon={Activity}
              growth="+12%"
            />
          </div>

          {/* Event Distribution */}
          <div className="glass-panel p-6">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest mb-6">
              <BarChart3 className="w-4 h-4 text-primary" />
              Event Distribution
            </div>
            <div className="space-y-4">
              {Object.entries(TYPE_MAP)
                .slice(4)
                .map(([type, config]) => (
                  <div key={type} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>{config.label}</span>
                      <span>{stats[type] || 0}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${config.color}-500/50 transition-all duration-1000`}
                        style={{
                          width: `${((stats[type] || 0) / logs.length) * 100 || 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .glass-panel {
           background: rgba(15, 23, 42, 0.4);
           backdrop-filter: blur(12px);
           border: 1px solid rgba(255, 255, 255, 0.05);
           border-radius: 2rem;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}

function EventCard({ log }: { log: LogEntry }) {
  const type = TYPE_MAP[log.type as keyof typeof TYPE_MAP] || TYPE_MAP.info;
  const Icon = type.icon;
  const isBotEvent = log.type === "bot";

  return (
    <div className="group animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex gap-4">
        {/* Vertical Time/Icon axis */}
        <div className="flex flex-col items-center shrink-0 w-12">
          <div
            className={`p-2.5 rounded-xl border border-white/5 bg-slate-900/80 text-${type.color}-400 shadow-xl group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="w-px h-full bg-gradient-to-b from-white/10 to-transparent my-2"></div>
        </div>

        {/* Card Content */}
        <div className="flex-1 bg-slate-900/40 hover:bg-slate-900/60 transition-all border border-white/5 p-5 rounded-3xl relative overflow-hidden group-hover:border-primary/20">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className={`text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded bg-${type.color}-500/10 text-${type.color}-400 border border-${type.color}-500/20`}
              >
                {type.label}
              </div>
              <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {new Date(log.timestamp).toLocaleTimeString("uz-UZ", {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
            {log.data?.botUsername && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-slate-500 hidden sm:inline">
                  Via Bot:
                </span>
                <a
                  href={`https://t.me/${log.data.botUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-primary hover:underline"
                >
                  @{log.data.botUsername}
                </a>
              </div>
            )}
          </div>

          {/* Message Body */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 leading-relaxed mb-4">
                {log.message}
              </p>

              {/* Metadata Chips */}
              <div className="flex flex-wrap gap-2">
                {log.data?.username && (
                  <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg text-xs text-slate-400">
                    <User className="w-3 h-3 text-slate-500" />
                    {log.data.username}
                  </div>
                )}
                {log.data?.userId && (
                  <div className="bg-white/5 px-2.5 py-1 rounded-lg text-[10px] text-slate-600 font-mono">
                    ID: {log.data.userId}
                  </div>
                )}
                {log.data?.lang && (
                  <div className="flex items-center gap-1.5 bg-blue-500/5 border border-blue-500/10 px-2 py-1 rounded-lg text-[10px] font-bold text-blue-400 uppercase">
                    <Globe className="w-3 h-3" />
                    {log.data.lang}
                  </div>
                )}
                {log.data?.amount && (
                  <div className="flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-500/10 px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-400">
                    <DollarSign className="w-3 h-3" />
                    {log.data.amount}
                  </div>
                )}
              </div>
            </div>

            {/* Right Action / Visual */}
            {isBotEvent && (
              <div className="shrink-0 flex items-center justify-center p-4 bg-primary/5 border border-primary/10 rounded-2xl group-hover:bg-primary/10 transition-colors">
                <TrendingUp className="w-5 h-5 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>

          {/* Hover Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </div>
    </div>
  );
}

function BotItem({ name, username, active, onClick, icon: CustomIcon }: any) {
  const Icon = CustomIcon || Bot;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all border ${
        active
          ? "bg-primary/20 border-primary/40 text-white"
          : "bg-transparent border-transparent text-slate-500 hover:bg-white/5"
      }`}
    >
      <div
        className={`p-2 rounded-xl transition-colors ${active ? "bg-primary text-white" : "bg-slate-900"}`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-left overflow-hidden">
        <div
          className={`text-xs font-bold leading-none mb-1 truncate ${active ? "text-white" : "text-slate-300"}`}
        >
          {name}
        </div>
        <div className="text-[10px] font-medium opacity-50 truncate">
          @{username}
        </div>
      </div>
    </button>
  );
}

function MetricCard({ label, value, icon: Icon, growth }: any) {
  return (
    <div className="glass-panel p-6 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-slate-900 rounded-2xl border border-white/5">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
          <ArrowUpRight className="w-3 h-3" />
          {growth}
        </div>
      </div>
      <div>
        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">
          {label}
        </div>
        <div className="text-3xl font-bold text-white tracking-tighter">
          {value}
        </div>
      </div>
    </div>
  );
}

function EmptyStream({ isConnected }: { isConnected: boolean }) {
  return (
    <div className="py-20 text-center space-y-4">
      <div className="relative inline-block">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
        <Zap className="w-20 h-20 text-slate-800 relative z-10 mx-auto" />
      </div>
      <div className="text-xl font-bold text-white">
        {isConnected ? "Waiting for activity..." : "Network Offline"}
      </div>
      <p className="text-slate-500 text-sm max-w-xs mx-auto">
        {isConnected
          ? "Connection is live. Whenever a bot event occurs, it will appear here instantly."
          : "Trying to re-establish connection with AKHMADS Intelligence Services."}
      </p>
    </div>
  );
}
