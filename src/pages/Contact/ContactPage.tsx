import { useState } from "react";
import { Mail, Search, MessageSquare, Clock, CheckCheck, Inbox, ChevronDown, ChevronUp, User } from "lucide-react";
import { useContactMessages } from "../../hooks/queries/useContact";
import type { ContactMessage } from "../../api/services/contact.service";

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    new:      { label: "Yangi",      color: "#a78bfa", bg: "rgba(167,139,250,.15)", icon: Inbox },
    read:     { label: "O'qildi",    color: "#60a5fa", bg: "rgba(96,165,250,.15)",  icon: Mail },
    resolved: { label: "Hal qilindi", color: "#34d399", bg: "rgba(52,211,153,.15)", icon: CheckCheck },
};

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function ContactPage() {
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const { data, isLoading, isError } = useContactMessages({
        status: statusFilter === "all" ? undefined : statusFilter,
        limit: 100,
    });

    const messages: ContactMessage[] = data?.messages || [];

    const filtered = messages.filter(m =>
        !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase()) ||
        m.message.toLowerCase().includes(search.toLowerCase())
    );

    const counts = {
        all: messages.length,
        new: messages.filter(m => m.status === "new").length,
        read: messages.filter(m => m.status === "read").length,
        resolved: messages.filter(m => m.status === "resolved").length,
    };

    return (
        <div className="elite-analytics-wrap">
            {/* Header */}
            <div className="page-head" style={{ marginBottom: 32 }}>
                <div className="page-head-left">
                    <h1 className="section-title" style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>
                        Murojaat xabarlari
                    </h1>
                    <p className="section-sub" style={{ fontSize: 14, marginTop: 4 }}>
                        Foydalanuvchilardan kelgan contact form xabarlari
                    </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {counts.new > 0 && (
                        <div style={{
                            background: "rgba(167,139,250,.15)",
                            border: "1px solid rgba(167,139,250,.3)",
                            color: "#a78bfa",
                            borderRadius: 20,
                            padding: "6px 14px",
                            fontSize: 13,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                        }}>
                            <Inbox size={14} />
                            {counts.new} yangi
                        </div>
                    )}
                </div>
            </div>

            {/* Status filter tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {([
                    { key: "all",      label: "Barchasi",     count: counts.all },
                    { key: "new",      label: "Yangi",        count: counts.new },
                    { key: "read",     label: "O'qildi",      count: counts.read },
                    { key: "resolved", label: "Hal qilindi",  count: counts.resolved },
                ] as const).map(tab => {
                    const active = statusFilter === tab.key;
                    const meta = tab.key !== "all" ? STATUS_META[tab.key] : null;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setStatusFilter(tab.key)}
                            style={{
                                background: active ? (meta?.bg || "rgba(255,255,255,.1)") : "rgba(255,255,255,.04)",
                                border: `1.5px solid ${active ? (meta?.color || "rgba(255,255,255,.3)") + "66" : "rgba(255,255,255,.08)"}`,
                                borderRadius: 10,
                                padding: "8px 16px",
                                cursor: "pointer",
                                color: active ? (meta?.color || "#fff") : "var(--text-muted)",
                                fontSize: 13,
                                fontWeight: active ? 700 : 500,
                                display: "flex",
                                alignItems: "center",
                                gap: 7,
                                transition: "all .15s",
                            }}
                        >
                            {tab.label}
                            <span style={{
                                background: active ? (meta?.color || "rgba(255,255,255,.2)") + "33" : "rgba(255,255,255,.08)",
                                color: active ? (meta?.color || "#fff") : "var(--text-muted)",
                                borderRadius: 20,
                                padding: "1px 8px",
                                fontSize: 11,
                                fontWeight: 700,
                            }}>
                                {tab.count}
                            </span>
                        </button>
                    );
                })}

                {/* Search */}
                <div style={{ marginLeft: "auto", position: "relative" }}>
                    <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input
                        placeholder="Qidirish..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            background: "rgba(255,255,255,.05)",
                            border: "1.5px solid rgba(255,255,255,.08)",
                            borderRadius: 10,
                            padding: "8px 12px 8px 36px",
                            fontSize: 13,
                            color: "#fff",
                            width: 220,
                            outline: "none",
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = "rgba(167,139,250,.5)")}
                        onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,.08)")}
                    />
                </div>
            </div>

            {/* Messages list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {isLoading && (
                    <div className="elite-card" style={{ textAlign: "center", padding: "60px 0" }}>
                        <div className="loading-spinner" style={{ width: 32, height: 32, margin: "0 auto" }} />
                        <div style={{ marginTop: 12, color: "var(--text-muted)", fontSize: 14 }}>Yuklanmoqda...</div>
                    </div>
                )}

                {isError && (
                    <div className="elite-card" style={{ textAlign: "center", padding: "60px 0", color: "#ef4444" }}>
                        Xabarlarni yuklashda xatolik yuz berdi
                    </div>
                )}

                {!isLoading && !isError && filtered.length === 0 && (
                    <div className="elite-card" style={{ textAlign: "center", padding: "60px 0" }}>
                        <MessageSquare size={40} style={{ color: "var(--text-muted)", opacity: .3, margin: "0 auto 12px" }} />
                        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
                            {search ? "Qidiruv bo'yicha natija topilmadi" : "Hozircha xabarlar yo'q"}
                        </div>
                    </div>
                )}

                {filtered.map(msg => {
                    const meta = STATUS_META[msg.status] ?? STATUS_META.new;
                    const expanded = expandedId === msg.id;
                    const StatusIcon = meta.icon;

                    return (
                        <div
                            key={msg.id}
                            className="elite-card"
                            style={{
                                padding: 0,
                                overflow: "hidden",
                                border: msg.status === "new" ? "1px solid rgba(167,139,250,.25)" : "1px solid rgba(255,255,255,.06)",
                                transition: "border-color .2s",
                            }}
                        >
                            {/* Message header — click to expand */}
                            <div
                                onClick={() => setExpandedId(expanded ? null : msg.id)}
                                style={{
                                    padding: "18px 22px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 16,
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.025)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "")}
                            >
                                {/* Avatar */}
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                                    background: meta.bg,
                                    border: `1.5px solid ${meta.color}44`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: meta.color, fontWeight: 700, fontSize: 16,
                                }}>
                                    {msg.name[0]?.toUpperCase() || "?"}
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                                        <span style={{ fontWeight: 700, fontSize: 14 }}>{msg.name}</span>
                                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{msg.email}</span>
                                        {msg.user && (
                                            <span style={{
                                                display: "inline-flex", alignItems: "center", gap: 4,
                                                background: "rgba(96,165,250,.1)", color: "#60a5fa",
                                                borderRadius: 6, padding: "1px 8px", fontSize: 11, fontWeight: 600,
                                            }}>
                                                <User size={10} /> Ro'yxatdagi foydalanuvchi
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: 13, color: "#fff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {msg.subject}
                                    </div>
                                    <div style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {msg.message}
                                    </div>
                                </div>

                                {/* Right side */}
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                                    <span style={{
                                        display: "inline-flex", alignItems: "center", gap: 5,
                                        background: meta.bg, color: meta.color,
                                        borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 600,
                                    }}>
                                        <StatusIcon size={11} />
                                        {meta.label}
                                    </span>
                                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-muted)" }}>
                                        <Clock size={11} />
                                        {fmtDate(msg.createdAt)}
                                    </div>
                                </div>

                                {expanded ? <ChevronUp size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />}
                            </div>

                            {/* Expanded message body */}
                            {expanded && (
                                <div style={{
                                    borderTop: "1px solid rgba(255,255,255,.06)",
                                    padding: "20px 22px",
                                    background: "rgba(255,255,255,.02)",
                                }}>
                                    <div style={{
                                        background: "rgba(255,255,255,.04)",
                                        borderRadius: 12,
                                        padding: "16px 18px",
                                        fontSize: 14,
                                        lineHeight: 1.7,
                                        color: "rgba(255,255,255,.85)",
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                    }}>
                                        {msg.message}
                                    </div>
                                    <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
                                        <a
                                            href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                                            style={{
                                                display: "inline-flex", alignItems: "center", gap: 7,
                                                background: "rgba(96,165,250,.15)",
                                                border: "1px solid rgba(96,165,250,.3)",
                                                color: "#60a5fa",
                                                borderRadius: 9, padding: "8px 16px",
                                                fontSize: 13, fontWeight: 600,
                                                textDecoration: "none",
                                            }}
                                        >
                                            <Mail size={14} />
                                            Javob berish
                                        </a>
                                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                            ID: <span style={{ fontFamily: "monospace" }}>{msg.id}</span>
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
