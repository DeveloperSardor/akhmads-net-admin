import { useState, useEffect, useRef } from "react";
import { authService } from "../../api/services/auth.service";
import { useAuth } from "../../contexts/AuthContext";
import { Send, KeyRound, MonitorSmartphone, ShieldCheck } from "lucide-react";

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [authData, setAuthData] = useState<{
    deepLink: string;
    loginToken: string;
    code: number | string;
  } | null>(null);
  const [twoFaToken, setTwoFaToken] = useState<string | null>(null);
  const [twoFaCode, setTwoFaCode] = useState("");

  const [pollingTime, setPollingTime] = useState(0);
  const { login } = useAuth();

  const popupRef = useRef<Window | null>(null);
  const pollIntervalRef = useRef<number | null>(null);

  // Toza ulanish uchun (unmount da tozalaymiz)
  useEffect(() => {
    return () => stopPolling();
  }, []);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      window.clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
  };

  const handleGenerateCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Get auth URL from backend
      const initRes = await authService.initiateLogin();
      const { deepLink, loginToken, code } = initRes;

      setAuthData({ deepLink, loginToken, code });
      setIsLoading(false);

      // Kod generatsiya bo'lgandan boshlab backendni tekshirishni boshlaymiz
      startPolling(loginToken);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Serverga ulanishda xatolik");
      setIsLoading(false);
      setAuthData(null);
    }
  };

  // We will use a native anchor link for reliable deep linking instead of window.open

  const startPolling = (token: string) => {
    stopPolling();
    setPollingTime(0);
    let pollCount = 0;

    pollIntervalRef.current = window.setInterval(async () => {
      pollCount++;
      setPollingTime(pollCount * 2);

      try {
        const statusRes = await authService.checkLoginStatus(token);

        if (statusRes.authorized && statusRes.tokens?.accessToken) {
          // Cookies are set by backend automatically
          try {
            const fullProfile = await authService.getMe();
            const roles =
              fullProfile.roles ||
              statusRes.user?.roles ||
              (fullProfile.role ? [fullProfile.role] : []);
            const isAuthorizedAdmin = roles.some((r) =>
              ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(r.toUpperCase()),
            );

            if (!isAuthorizedAdmin) {
              stopPolling();
              setError(
                `Kirish taqiqlandi! Rolingiz admin paneliga kirish uchun yetarli emas.`,
              );
              setAuthData(null);
              return;
            }

            stopPolling();
            login(
              statusRes.tokens.accessToken,
              statusRes.tokens.refreshToken || "",
              fullProfile,
            );
          } catch (err: any) {
            stopPolling();
            setError("Profilni yuklashda xatolik yuz berdi");
            setAuthData(null);
            return;
          }
        } else if (statusRes.requires2fa && statusRes.twoFaToken) {
          stopPolling();
          setTwoFaToken(statusRes.twoFaToken);
        }

        if (pollCount > 150) {
          // Timeout after 5 mins

          stopPolling();
          setError("Avtorizatsiya vaqti tugadi. Qaytadan urinib ko'ring.");
          setAuthData(null);
        }
      } catch (e: any) {
        if (e?.response?.status !== 404) {
          stopPolling();
          setError("Tarmoq xatosi yuz berdi");
          setAuthData(null);
        }
      }
    }, 2000);
  };

  const handle2FaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFaToken || twoFaCode.length < 6) return;
    setIsLoading(true);
    setError(null);
    try {
      const statusRes = await authService.verify2FA(twoFaToken, twoFaCode);
      if (statusRes.tokens?.accessToken) {
        // Cookies are set by backend automatically
        const fullProfile = await authService.getMe();
        login(
          statusRes.tokens.accessToken,
          statusRes.tokens.refreshToken || "",
          fullProfile,
        );
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "2FA kod xato");
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    stopPolling();
    setAuthData(null);
    setError(null);
  };

  return (
    <div className="login-container">
      <div className="login-blur-blob blob-1"></div>
      <div className="login-blur-blob blob-2"></div>

      <div className="login-card" style={{ maxWidth: 440, width: "100%" }}>
        <div className="login-logo-section">
          <div className="client-logo-inner" style={{ width: 44, height: 44 }}>
            <div className="spinning-ring outer"></div>
            <div className="spinning-ring inner"></div>
            <svg
              className="logo-svg-x"
              viewBox="0 0 20 20"
              fill="none"
              style={{ width: 20, height: 20 }}
            >
              <line
                x1="4"
                y1="4"
                x2="16"
                y2="16"
                stroke="url(#xg_login)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <line
                x1="16"
                y1="4"
                x2="4"
                y2="16"
                stroke="url(#xg_login)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient
                  id="xg_login"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#6a00ff" />
                  <stop offset="100%" stopColor="#b84dff" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="logo-text-stack">
            <span
              className="login-logo-text"
              style={{ fontSize: 22, fontWeight: 800 }}
            >
              AKHMADS.NET
            </span>
            <span
              className="login-logo-sub"
              style={{
                fontSize: 10,
                color: "var(--accent-primary)",
                letterSpacing: 1,
              }}
            >
              ADMIN PANEL V2.0
            </span>
          </div>
        </div>

        <div className="login-content">
          {twoFaToken ? (
            // 2FA Verification Step
            <div
              className="login-step-two animate-in"
              style={{
                animation: "fade-in 0.4s ease-out",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  margin: "0 auto 16px",
                  borderRadius: "50%",
                  background: "rgba(139, 92, 246, 0.1)",
                  color: "#8b5cf6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldCheck size={32} />
              </div>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 8,
                }}
              >
                Ikki bosqichli autentifikatsiya
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-muted)",
                  lineHeight: 1.5,
                  marginBottom: 24,
                }}
              >
                Google Authenticator orqali olingan 6 xonali kodni kiriting
              </p>

              {error && (
                <div className="login-alert error" style={{ marginBottom: 16 }}>
                  <span className="alert-icon">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handle2FaSubmit}>
                <input
                  type="text"
                  value={twoFaCode}
                  onChange={(e) =>
                    setTwoFaCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 16,
                    padding: "16px 20px",
                    textAlign: "center",
                    marginBottom: 24,
                    width: "100%",
                    fontSize: 32,
                    fontWeight: 900,
                    color: "#fff",
                    letterSpacing: 8,
                  }}
                />
                <button
                  type="submit"
                  className={`btn-telegram ${isLoading ? "loading" : ""}`}
                  disabled={isLoading || twoFaCode.length < 6}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    width: "100%",
                  }}
                >
                  {isLoading ? "Tekshirilmoqda..." : "Tasdiqlash"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTwoFaToken(null);
                    setAuthData(null);
                  }}
                  style={{
                    padding: "14px",
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    color: "var(--text-muted)",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    width: "100%",
                    marginTop: 12,
                  }}
                >
                  Bekor qilish
                </button>
              </form>
            </div>
          ) : !authData ? (
            // Step 1: Initial Login Button
            <>
              <h1 className="login-title">Hush kelibsiz</h1>
              <p className="login-desc">
                Tizimni boshqarish uchun avtorizatsiyadan o'ting
              </p>

              {error && (
                <div className="login-alert error">
                  <span className="alert-icon">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="login-action-box">
                <button
                  className={`btn-telegram ${isLoading ? "loading" : ""}`}
                  onClick={handleGenerateCode}
                  disabled={isLoading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    width: "100%",
                  }}
                >
                  {isLoading ? (
                    <div
                      className="loading-spinner"
                      style={{
                        width: 18,
                        height: 18,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                      }}
                    />
                  ) : (
                    <Send size={20} />
                  )}
                  {isLoading
                    ? "Kod tayyorlanmoqda..."
                    : "Telegram orqali kirish"}
                </button>

                <div className="login-secure-badge">
                  <span className="lock-icon">🔒</span>
                  <span>AES-256 shifrlangan xavfsiz ulanish</span>
                </div>
              </div>
            </>
          ) : (
            // Step 2: Show Code and Prompt to Open Telegram
            <div
              className="login-step-two animate-in"
              style={{ animation: "fade-in 0.4s ease-out" }}
            >
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    margin: "0 auto 16px",
                    borderRadius: "50%",
                    background: "rgba(56, 189, 248, 0.1)",
                    color: "#38bdf8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <KeyRound size={32} />
                </div>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 8,
                  }}
                >
                  Kodni eslab qoling
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-muted)",
                    lineHeight: 1.5,
                  }}
                >
                  Quyidagi kodni Telegram botda tasdiqlang. <br />
                  Kod 5 daqiqa davomida amal qiladi.
                </p>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 16,
                  padding: "32px 20px",
                  textAlign: "center",
                  marginBottom: 24,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: "var(--text-muted)",
                    marginBottom: 12,
                    fontWeight: 600,
                  }}
                >
                  Avtorizatsiya kodi
                </div>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 900,
                    color: "#fff",
                    letterSpacing: 8,
                    textShadow: "0 4px 20px rgba(56, 189, 248, 0.4)",
                  }}
                >
                  {authData.code}
                </div>

                {/* Progress indicator */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    height: 3,
                    background: "var(--blue)",
                    width: `${Math.min(100, (pollingTime / 300) * 100)}%`,
                    transition: "width 2s linear",
                  }}
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <a
                  href={authData.deepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-telegram"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    width: "100%",
                    textDecoration: "none",
                  }}
                >
                  <Send size={20} />
                  Telegramni ochish
                </a>

                <button
                  onClick={handleCancel}
                  style={{
                    padding: "14px",
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    color: "var(--text-muted)",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-muted)";
                  }}
                >
                  Bekor qilish
                </button>
              </div>

              <div
                style={{
                  marginTop: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "var(--text-muted)",
                }}
              >
                <MonitorSmartphone size={16} />
                <span>Kutmoqdamiz... Botda kodni tasdiqlang</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
