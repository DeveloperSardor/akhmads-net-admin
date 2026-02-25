import { useState, useEffect, useRef } from "react";
import { authService } from "../../api/services/auth.service";
import { useAuth } from "../../contexts/AuthContext";
import { Send, KeyRound, MonitorSmartphone } from "lucide-react";

export function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [authData, setAuthData] = useState<{ deepLink: string, loginToken: string, code: number | string } | null>(null);
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

    const handleOpenTelegram = () => {
        if (!authData) return;

        const width = 550;
        const height = 470;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        popupRef.current = window.open(
            authData.deepLink,
            "Telegram Login",
            `width=${width},height=${height},top=${top},left=${left}`
        );
    };

    const startPolling = (token: string) => {
        stopPolling();
        setPollingTime(0);
        let pollCount = 0;

        pollIntervalRef.current = window.setInterval(async () => {
            pollCount++;
            setPollingTime(pollCount * 2);

            try {
                const statusRes = await authService.checkLoginStatus(token);

                if (statusRes.authorized && statusRes.tokens?.accessToken && statusRes.user) {
                    stopPolling();
                    login(statusRes.tokens.accessToken, statusRes.tokens.refreshToken || "", statusRes.user);
                }

                if (pollCount > 150) { // Timeout after 5 mins
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

    const handleCancel = () => {
        stopPolling();
        setAuthData(null);
        setError(null);
    };

    return (
        <div className="login-container">
            <div className="login-blur-blob blob-1"></div>
            <div className="login-blur-blob blob-2"></div>

            <div className="login-card" style={{ maxWidth: 440, width: '100%' }}>
                <div className="login-logo-wrap">
                    <div className="login-logo-icon">A</div>
                    <div className="login-logo-text">AKHMADS.NET</div>
                    <div className="login-logo-sub">admin panel v2.0</div>
                </div>

                <div className="login-content">
                    {!authData ? (
                        // Step 1: Initial Login Button
                        <>
                            <h1 className="login-title">Hush kelibsiz</h1>
                            <p className="login-desc">Tizimni boshqarish uchun avtorizatsiyadan o'ting</p>

                            {error && (
                                <div className="login-alert error">
                                    <span className="alert-icon">⚠</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="login-action-box">
                                <button
                                    className={`btn-telegram ${isLoading ? 'loading' : ''}`}
                                    onClick={handleGenerateCode}
                                    disabled={isLoading}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%' }}
                                >
                                    {isLoading ? (
                                        <div className="loading-spinner" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                                    ) : (
                                        <Send size={20} />
                                    )}
                                    {isLoading ? "Kod tayyorlanmoqda..." : "Telegram orqali kirish"}
                                </button>

                                <div className="login-secure-badge">
                                    <span className="lock-icon">🔒</span>
                                    <span>AES-256 shifrlangan xavfsiz ulanish</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        // Step 2: Show Code and Prompt to Open Telegram
                        <div className="login-step-two animate-in" style={{ animation: 'fade-in 0.4s ease-out' }}>
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <div style={{
                                    width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%',
                                    background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <KeyRound size={32} />
                                </div>
                                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Kodni eslab qoling</h2>
                                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                    Quyidagi kodni Telegram botda tasdiqlang. <br />
                                    Kod 5 daqiqa davomida amal qiladi.
                                </p>
                            </div>

                            <div style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 16,
                                padding: '32px 20px',
                                textAlign: 'center',
                                marginBottom: 24,
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 12, fontWeight: 600 }}>Avtorizatsiya kodi</div>
                                <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', letterSpacing: 8, textShadow: '0 4px 20px rgba(56, 189, 248, 0.4)' }}>
                                    {authData.code}
                                </div>

                                {/* Progress indicator */}
                                <div style={{
                                    position: 'absolute', bottom: 0, left: 0, height: 3,
                                    background: 'var(--blue)', width: `${Math.min(100, (pollingTime / 300) * 100)}%`,
                                    transition: 'width 2s linear'
                                }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <button
                                    onClick={handleOpenTelegram}
                                    className="btn-telegram"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%' }}
                                >
                                    <Send size={20} />
                                    Telegramni ochish
                                </button>

                                <button
                                    onClick={handleCancel}
                                    style={{
                                        padding: '14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 12, color: 'var(--text-muted)', fontSize: 15, fontWeight: 600,
                                        cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff' }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
                                >
                                    Bekor qilish
                                </button>
                            </div>

                            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
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

