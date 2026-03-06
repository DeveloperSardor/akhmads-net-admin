import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  Terminal as TerminalIcon,
  Maximize2,
  Minimize2,
  Trash2,
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

export const SystemTerminal: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const socket = io(`${socketUrl}/admin`, {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      setIsConnected(true);
      addLog("System connected to live updates", "system");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      addLog("System disconnected", "error");
    });

    socket.on("terminal:log", (log: LogEntry) => {
      setLogs((prev) => [...prev.slice(-100), log]); // Keep last 100 logs
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (message: string, type: LogEntry["type"]) => {
    setLogs((prev) => [
      ...prev.slice(-100),
      {
        timestamp: new Date().toISOString(),
        message,
        type,
      },
    ]);
  };

  const clearLogs = () => setLogs([]);

  const getTypeColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "#10b981";
      case "error":
        return "#ef4444";
      case "warning":
        return "#f59e0b";
      case "system":
        return "#3b82f6";
      case "broadcast":
        return "#a855f7";
      case "ad":
        return "#ec4899";
      case "bot":
        return "#06b6d4";
      default:
        return "#94a3b8";
    }
  };

  return (
    <div
      className={`terminal-container ${isExpanded ? "expanded" : ""}`}
      style={{
        background: "#0a0a0b",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        height: isExpanded ? "80vh" : "400px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        position: "relative",
      }}
    >
      {/* Terminal Header */}
      <div
        style={{
          padding: "12px 20px",
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: isConnected ? "#10b981" : "#ef4444",
              boxShadow: isConnected ? "0 0 10px #10b981" : "none",
            }}
          />
          <TerminalIcon size={16} color="rgba(255,255,255,0.5)" />
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "rgba(255,255,255,0.7)",
              letterSpacing: "0.05em",
            }}
          >
            SYSTEM TERMINAL v1.0.42
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={clearLogs} className="term-btn" title="Clear">
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="term-btn"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          padding: "20px",
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
          fontSize: 13,
          lineHeight: 1.6,
          overflowY: "auto",
          color: "#d1d5db",
        }}
      >
        {logs.length === 0 && (
          <div style={{ color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>
            Awaiting system events...
          </div>
        )}
        {logs.map((log, i) => (
          <div key={i} style={{ marginBottom: 4, display: "flex", gap: 12 }}>
            <span
              style={{ color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}
            >
              [
              {new Date(log.timestamp).toLocaleTimeString("uz-UZ", {
                hour12: false,
              })}
              ]
            </span>
            <span
              style={{
                color: getTypeColor(log.type),
                fontWeight: 600,
                minWidth: 80,
                textTransform: "uppercase",
                fontSize: 11,
              }}
            >
              {log.type}
            </span>
            <span
              style={{
                color: log.type === "error" ? "#ef4444" : "#fff",
                opacity: 0.9,
              }}
            >
              {log.message}
            </span>
          </div>
        ))}
        <div className="terminal-cursor">_</div>
      </div>

      <style>{`
                .term-btn {
                    padding: 6px;
                    border-radius: 6px;
                    background: transparent;
                    color: rgba(255,255,255,0.4);
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .term-btn:hover {
                    background: rgba(255,255,255,0.05);
                    color: #fff;
                }
                .terminal-cursor {
                    display: inline-block;
                    width: 8px;
                    background: #3b82f6;
                    animation: blink 1s infinite;
                    margin-left: 4px;
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                .expanded {
                    position: fixed !important;
                    top: 20px;
                    left: 20px;
                    right: 20px;
                    bottom: 20px;
                    z-index: 9999;
                }
            `}</style>
    </div>
  );
};
