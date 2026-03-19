import { useEffect, useState, useRef } from "react";
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
} from "lucide-react";

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

function getIcon(type: LogEntry["type"]) {
  switch (type) {
    case "success":
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    case "error":
      return <XCircle className="w-5 h-5 text-rose-500" />;
    case "warning":
      return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    case "system":
      return <Zap className="w-5 h-5 text-purple-500" />;
    case "broadcast":
      return <Send className="w-5 h-5 text-indigo-500" />;
    case "ad":
      return <Megaphone className="w-5 h-5 text-blue-500" />;
    case "bot":
      return <Bot className="w-5 h-5 text-teal-500" />;
    default:
      return <Info className="w-5 h-5 text-sky-500" />;
  }
}

function getBg(type: LogEntry["type"]) {
  switch (type) {
    case "success":
      return "bg-emerald-500/10 border-emerald-500/20";
    case "error":
      return "bg-rose-500/10 border-rose-500/20";
    case "warning":
      return "bg-amber-500/10 border-amber-500/20";
    case "system":
      return "bg-purple-500/10 border-purple-500/20";
    case "broadcast":
      return "bg-indigo-500/10 border-indigo-500/20";
    case "ad":
      return "bg-blue-500/10 border-blue-500/20";
    case "bot":
      return "bg-teal-500/10 border-teal-500/20";
    default:
      return "bg-sky-500/10 border-sky-500/20";
  }
}

function getAccent(type: LogEntry["type"]) {
  switch (type) {
    case "success":
      return "bg-emerald-500";
    case "error":
      return "bg-rose-500";
    case "warning":
      return "bg-amber-500";
    case "system":
      return "bg-purple-500";
    case "broadcast":
      return "bg-indigo-500";
    case "ad":
      return "bg-blue-500";
    case "bot":
      return "bg-teal-500";
    default:
      return "bg-sky-500";
  }
}

function getLabel(type: LogEntry["type"]) {
  switch (type) {
    case "success":
      return "success";
    case "error":
      return "xatolik";
    case "warning":
      return "ogohlantirish";
    case "system":
      return "tizim";
    case "broadcast":
      return "broadcast";
    case "ad":
      return "reklama";
    case "bot":
      return "bot update";
    default:
      return type;
  }
}

export function LiveUpdatesPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const FILTERS = [
    "all",
    "bot",
    "system",
    "success",
    "error",
    "warning",
    "ad",
    "broadcast",
  ];

  useEffect(() => {
    // Check both 'token' and 'accessToken'
    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");

    // Proceed even if token is null, as we now support cookie-based auth in the backend
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
          message: "✅ Live kanal bilan ulanildi",
          type: "system",
        },
        ...prev,
      ]);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setLogs((prev) => [
        {
          timestamp: new Date().toISOString(),
          message: "❌ Ulanish uzildi, qayta ulanilmoqda...",
          type: "error",
        },
        ...prev,
      ]);
    });

    socket.on("connect_error", (error) => {
      setIsConnected(false);
      setLogs((prev) => [
        {
          timestamp: new Date().toISOString(),
          message: `🚫 Ulanish xatosi: ${error.message}`,
          type: "error",
          data: { details: error.toString() },
        },
        ...prev,
      ]);
      console.error("Socket connect_error:", error);
    });

    socket.on("connect_timeout", () => {
      setIsConnected(false);
      setLogs((prev) => [
        {
          timestamp: new Date().toISOString(),
          message: "⏳ Ulanish vaqti tugadi (Timeout)",
          type: "warning",
        },
        ...prev,
      ]);
    });

    socket.on("terminal:log", (log: LogEntry) => {
      setLogs((prev) => [log, ...prev].slice(0, 200));
    });

    socketRef.current = socket;
    return () => {
      socket.disconnect();
    };
  }, []);

  const filtered =
    filter === "all" ? logs : logs.filter((l) => l.type === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Radio className="w-6 h-6 text-primary animate-pulse" />
            </div>
            Jonli Efir
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Barcha botlardagi real-time Telegram updatelar va tizim hodisalari.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${
              isConnected
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400"
              }`}
            />
            {isConnected ? "LIVE" : "Ulanmadi"}
          </div>
          <button
            onClick={() => setLogs([])}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-sm font-semibold transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Tozalash
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
              filter === f
                ? "bg-primary text-white border-primary"
                : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            {f === "all" ? "Barchasi" : getLabel(f as LogEntry["type"])}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-600 self-center">
          {filtered.length} ta hodisa
        </span>
      </div>

      {/* Feed */}
      <div className="bg-[#0a0a0b] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Feed header */}
        <div className="px-5 py-4 bg-white/[0.02] border-b border-white/5 flex items-center gap-3">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-white/70 tracking-widest uppercase">
            Activity Feed
          </span>
          <span className="ml-auto text-xs text-gray-600">
            so'nggi 200 ta hodisa
          </span>
        </div>

        <div className="overflow-y-auto max-h-[70vh] divide-y divide-white/[0.04]">
          {!isConnected && logs.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center gap-4 text-gray-600">
              <Radio className="w-12 h-12 opacity-20 animate-pulse" />
              <p className="text-sm font-medium">Socket'ga ulanilmoqda...</p>
            </div>
          )}

          {isConnected && filtered.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center gap-4 text-gray-600">
              <Activity className="w-12 h-12 opacity-20" />
              <p className="text-sm font-medium">
                Botlardan update kutilmoqda...
              </p>
              <p className="text-xs opacity-60">
                Botlarga biror narsa yuboring!
              </p>
            </div>
          )}

          {filtered.map((log, i) => (
            <div
              key={i}
              className={`flex gap-4 items-start px-5 py-4 hover:bg-white/[0.02] transition-all ${getBg(log.type)} border-0 border-l-2 ${getAccent(log.type).replace("bg-", "border-l-")}`}
            >
              {/* Left accent */}
              <div
                className={`w-0.5 self-stretch rounded-full ${getAccent(log.type)} shrink-0`}
              />

              {/* Icon */}
              <div className="shrink-0 mt-0.5">{getIcon(log.type)}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Time + type badge */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-gray-600 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString("uz-UZ", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                      log.type === "bot"
                        ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                        : log.type === "success"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : log.type === "error"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : log.type === "warning"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : log.type === "system"
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                : log.type === "ad"
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                  : log.type === "broadcast"
                                    ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                    : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                    }`}
                  >
                    {getLabel(log.type)}
                  </span>
                  {log.data?.action && (
                    <span className="text-[9px] text-gray-600 uppercase font-bold tracking-wider">
                      {log.data.action}
                    </span>
                  )}
                </div>

                {/* Main message */}
                <p className="text-sm font-medium text-white/90 leading-relaxed">
                  {log.message}
                </p>

                {/* Meta badges */}
                {log.data &&
                  (log.data.username ||
                    log.data.userId ||
                    log.data.botUsername ||
                    log.data.lang ||
                    log.data.amount) && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {log.data.username && (
                        <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded border border-white/5">
                          @{log.data.username}
                        </span>
                      )}
                      {!log.data.username && log.data.userId && (
                        <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded border border-white/5">
                          ID: {log.data.userId}
                        </span>
                      )}
                      {log.data.lang && (
                        <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded border border-white/5">
                          🌐 {String(log.data.lang).toUpperCase()}
                        </span>
                      )}
                      {log.data.amount && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                          $
                          {typeof log.data.amount === "number"
                            ? log.data.amount.toFixed(2)
                            : log.data.amount}
                        </span>
                      )}
                    </div>
                  )}
              </div>

              {/* Bot link (right side) */}
              {log.data?.botUsername && (
                <a
                  href={`https://t.me/${log.data.botUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 hidden md:flex items-center gap-1.5 text-primary text-xs font-bold bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors whitespace-nowrap"
                >
                  <Bot className="w-3.5 h-3.5" />@{log.data.botUsername}
                </a>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
