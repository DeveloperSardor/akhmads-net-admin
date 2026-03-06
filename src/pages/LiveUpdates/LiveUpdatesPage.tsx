import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import {
  Loader2,
  Activity,
  User,
  Bot,
  Megaphone,
  Send,
  Wallet,
  RefreshCcw,
} from "lucide-react";

interface LiveUpdate {
  id: string;
  type:
    | "AD"
    | "BOT"
    | "USER"
    | "BROADCAST"
    | "WITHDRAWAL"
    | "PAYMENT"
    | "ADMIN";
  action: string;
  status: string;
  title: string;
  user: string;
  date: string;
  details: string;
}

export function LiveUpdatesPage() {
  const [updates, setUpdates] = useState<LiveUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveUpdates = async () => {
    try {
      const response = await apiClient.get<{ data: { updates: LiveUpdate[] } }>(
        "/admin/live-updates",
      );
      setUpdates(response.data.data.updates);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch live updates");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveUpdates();
    // Live monitoring: poll every 10 seconds
    const interval = setInterval(fetchLiveUpdates, 10000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "AD":
        return <Megaphone className="w-5 h-5 text-purple-500" />;
      case "BOT":
        return <Bot className="w-5 h-5 text-blue-500" />;
      case "USER":
        return <User className="w-5 h-5 text-green-500" />;
      case "BROADCAST":
        return <Send className="w-5 h-5 text-orange-500" />;
      case "WITHDRAWAL":
        return <Wallet className="w-5 h-5 text-yellow-500" />;
      case "PAYMENT":
        return <Wallet className="w-5 h-5 text-emerald-500" />;
      case "ADMIN":
        return <Activity className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_REVIEW":
      case "PENDING":
      case "REQUESTED":
      case "DRAFT":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "APPROVED":
      case "ACTIVE":
      case "RUNNING":
      case "COMPLETED":
      case "SENT":
      case "CONFIRMED":
      case "LOGGED":
      case "SUCCESS":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "REJECTED":
      case "FAILED":
      case "BANNED":
      case "CANCELLED":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            Jonli Efir
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Platformadagi barcha harakatlar real vaqt rejimida (10s
            yangilanish).
          </p>
        </div>
        <button
          onClick={() => {
            setIsLoading(true);
            fetchLiveUpdates();
          }}
          className="bg-[#1a1a1a] hover:bg-[#222] text-white px-5 py-2.5 rounded-xl text-sm font-bold border border-white/5 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-black/20"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCcw className="w-4 h-4 text-primary" />
          )}{" "}
          Yangilash
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">
        {isLoading && updates.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center bg-[#111] border border-[#222] rounded-3xl">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-gray-400 font-medium animate-pulse">
              Ma'lumotlar yuklanmoqda...
            </p>
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-[#111] border border-red-500/20 rounded-3xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <Activity className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Xatolik yuz berdi
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchLiveUpdates}
              className="px-8 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all active:scale-95 flex items-center gap-2 mx-auto"
            >
              <RefreshCcw className="w-4 h-4" />
              Qayta urinish
            </button>
          </div>
        ) : updates.length === 0 ? (
          <div className="p-20 text-center bg-[#111] border border-[#222] rounded-3xl">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
              <Activity className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Hozircha yangiliklar yo'q
            </h3>
            <p className="text-gray-500">
              Platformada so'nggi vaqtlarda hech qanday harakat sodir bo'lmadi.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((update, idx) => (
              <div
                key={`${update.id}-${idx}`}
                className="group relative bg-[#0a0a0a] border border-[#1a1a1a] hover:border-primary/30 rounded-2xl p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden"
              >
                {/* Visual Accent */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    update.type === "AD"
                      ? "bg-purple-500"
                      : update.type === "BOT"
                        ? "bg-blue-500"
                        : update.type === "USER"
                          ? "bg-green-500"
                          : update.type === "BROADCAST"
                            ? "bg-orange-500"
                            : update.type === "WITHDRAWAL"
                              ? "bg-yellow-500"
                              : update.type === "PAYMENT"
                                ? "bg-emerald-500"
                                : "bg-red-500"
                  } opacity-50 group-hover:opacity-100 transition-opacity`}
                />

                <div className="flex items-center gap-4">
                  {/* Icon Container */}
                  <div
                    className={`p-4 rounded-xl shrink-0 border border-white/5 bg-white/[0.02] group-hover:bg-white/[0.05] transition-colors`}
                  >
                    {getIcon(update.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                      <span className="text-sm font-black text-white uppercase tracking-tight">
                        {update.user}
                      </span>
                      <span className="text-[10px] font-black uppercase text-gray-500 px-2 py-0.5 bg-white/5 rounded-full border border-white/5">
                        {update.type}
                      </span>
                      <span className="text-xs text-gray-600 ml-auto hidden sm:inline-flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {new Date(update.date).toLocaleTimeString("uz-UZ", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="text-gray-400 text-sm leading-relaxed">
                      {update.details}
                    </p>
                  </div>

                  {/* Status & Time (Compact) */}
                  <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border tracking-wider ${getStatusColor(update.status)}`}
                    >
                      {update.status}
                    </span>
                    <span className="text-[10px] font-bold text-gray-600">
                      {new Date(update.date).toLocaleDateString("uz-UZ")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
