import { useState, useEffect } from "react";
import { getSettings, updateSettings } from "../../services/settings.service";

export function SettingsPage({ showToast }: any) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        platform_fee_percentage: 20, minWithdrawal: 10, maxWithdrawal: 10000,
        minAdBudget: 5, autoApprove: false, maintenanceMode: false,
        tgBotToken: "", clickServiceId: "", paymeKey: "",
        ad_base_cpm: 1.5,
        min_frequency_minutes: 0,
        max_frequency_minutes: 60,
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const res = await getSettings();
            // Backend returns grouped settings: { categoryName: [ { key, valueType, value }, ... ] }
            const newSettings: any = { ...settings };
            Object.values(res.data).forEach((group: any) => {
                group.forEach((item: any) => {
                    let val = item.value;
                    if (item.valueType === 'number') val = parseFloat(val);
                    if (item.valueType === 'boolean') val = val === 'true';
                    newSettings[item.key] = val;
                });
            });
            setSettings(newSettings);
        } catch (error) {
            showToast("Sozlamalarni yuklashda xatolik", "error");
        } finally {
            setLoading(false);
        }
    };

    const updateValue = (key: string, val: any) => {
        setSettings(prev => ({ ...prev, [key]: val }));
    };

    const saveSettings = async () => {
        try {
            setSaving(true);
            // Convert to flat object for update
            const payload = {
                platform_fee_percentage: settings.platform_fee_percentage,
                ad_base_cpm: settings.ad_base_cpm,
                min_frequency_minutes: settings.min_frequency_minutes,
                max_frequency_minutes: settings.max_frequency_minutes,
            };
            await updateSettings(payload);
            showToast("Sozlamalar saqlandi", "success");
        } catch (error) {
            showToast("Saqlashda xatolik", "error");
        } finally {
            setSaving(false);
        }
    };

    const toggleValue = (key: string) => {
        const newVal = !(settings as any)[key];
        updateValue(key, newVal);
        showToast(`Sozlama ${newVal ? "yoqildi" : "o'chirildi"}`, "info");
    };

    if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Yuklanmoqda...</div>;

    return (
        <div className="settings-container">
            <div className="page-head">
                <div className="page-head-left">
                    <div className="section-title">Tizim sozlamalari</div>
                    <div className="section-sub">Platformaning asosiy konfiguratsiyasi va integratsiyalarini boshqarish</div>
                </div>
                <div className="page-head-actions">
                    <button className="btn btn-primary" onClick={saveSettings} disabled={saving}>
                        {saving ? "Saqlanmoqda..." : "Yangi o'zgarishlarni saqlash"}
                    </button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: 24 }}>

                {/* 1. TO'LOV SOZLAMALARI */}
                <div className="settings-card">
                    <div className="settings-section-title">
                        <span>💰</span> To'lov va Moliya
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <div className="settings-item-label">Reklama narxi (1000 ta ko'rish)*</div>
                            <div className="settings-item-hint">Reklama beruvchiga sotiladigan narx ($)</div>
                        </div>
                        <div className="settings-input-group">
                            <input className="modal-input mono" type="number" step="0.1"
                                value={settings.ad_base_cpm}
                                onChange={e => updateValue("ad_base_cpm", +e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <div className="settings-item-label">Bot egasining ulushi (%)</div>
                            <div className="settings-item-hint">
                                Reklama narxining qancha qismi tarqatuvchiga byudjet qilinadi ({100 - settings.platform_fee_percentage}% bot egasiga). 
                                Hozirgi narx bo'yicha: <b>${(settings.ad_base_cpm * (100 - settings.platform_fee_percentage) / 100).toFixed(2)}</b> / 1000ta komission
                            </div>
                        </div>
                        <div className="settings-input-group">
                            <input className="modal-input mono" type="number"
                                value={100 - settings.platform_fee_percentage}
                                onChange={e => updateValue("platform_fee_percentage", 100 - (+e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <div className="settings-item-label">Platforma komissiyasi (%)</div>
                            <div className="settings-item-hint">Tizimga qoladigan ulush</div>
                        </div>
                        <div className="settings-input-group">
                            <input className="modal-input mono" type="number" style={{ background: "rgba(0,0,0,0.05)" }} disabled title="Bu bot egasining ulushiga bog'liq hisoblanadi"
                                value={settings.platform_fee_percentage}
                            />
                        </div>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <div className="settings-item-label">Minimal yechib olish</div>
                            <div className="settings-item-hint">Foydalanuvchi yechib olishi mumkin bo'lgan eng kichik miqdor (USDT)</div>
                        </div>
                        <div className="settings-input-group">
                            <input className="modal-input mono" type="number"
                                value={settings.minWithdrawal}
                                onChange={e => updateValue("minWithdrawal", +e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <div className="settings-item-label">Maksimal yechib olish</div>
                            <div className="settings-item-hint">Bitta so'rovda yechib olinadigan maksimal chegara (USDT)</div>
                        </div>
                        <div className="settings-input-group">
                            <input className="modal-input mono" type="number"
                                value={settings.maxWithdrawal}
                                onChange={e => updateValue("maxWithdrawal", +e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <div className="settings-item-label">Minimal reklama byudjeti</div>
                            <div className="settings-item-hint">Reklama beruvchi kampaniya uchun kiritishi shart bo'lgan minimal summa ($)</div>
                        </div>
                        <div className="settings-input-group">
                            <input className="modal-input mono" type="number"
                                value={settings.minAdBudget}
                                onChange={e => updateValue("minAdBudget", +e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="settings-card-footer">
                        <button className="btn btn-primary btn-sm" onClick={saveSettings} disabled={saving}>Saqlash</button>
                    </div>
                </div>

                {/* 3. BOT CHASTOTASI */}
                <div className="settings-card">
                    <div className="settings-section-title">
                        <span>⏱️</span> Bot Reklama Chastotasi
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <div className="settings-item-label">Minimal chastota (daqiqa)</div>
                            <div className="settings-item-hint">Bot egalari tanlashi mumkin bo'lgan eng kichik vaqt oralig'i. <b>0</b> = cheklovsiz</div>
                        </div>
                        <div className="settings-input-group">
                            <input className="modal-input mono" type="number" min="0"
                                value={settings.min_frequency_minutes}
                                onChange={e => updateValue("min_frequency_minutes", Math.max(0, +e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <div className="settings-item-label">Maksimal chastota (daqiqa)</div>
                            <div className="settings-item-hint">Bot egalari tanlashi mumkin bo'lgan eng katta vaqt oralig'i</div>
                        </div>
                        <div className="settings-input-group">
                            <input className="modal-input mono" type="number" min="0"
                                value={settings.max_frequency_minutes}
                                onChange={e => updateValue("max_frequency_minutes", Math.max(0, +e.target.value))}
                            />
                        </div>
                    </div>

                    <div style={{ padding: "12px 0 0", color: "var(--text-dim)", fontSize: 12 }}>
                        Hozirgi diapazon: <b style={{ color: "var(--accent-primary)" }}>{settings.min_frequency_minutes} - {settings.max_frequency_minutes} daqiqa</b>
                    </div>

                    <div className="settings-card-footer">
                        <button className="btn btn-primary btn-sm" onClick={saveSettings} disabled={saving}>Saqlash</button>
                    </div>
                </div>

                {/* 4. INTEGRATSIYA */}
                <div className="settings-card">
                    <div className="settings-section-title">
                        <span>�</span> Integratsiyalar
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <div className="settings-item-label">Telegram Bot Token</div>
                            <div className="settings-item-hint">Tizim ishlatadigan asosiy bot tokeni (@BotFather dan olingan)</div>
                        </div>
                        <div style={{ width: 220 }}>
                            <input className="modal-input mono" type="password"
                                value={settings.tgBotToken}
                                onChange={e => updateValue("tgBotToken", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <div className="settings-item-label">Click Service ID</div>
                            <div className="settings-item-hint">ClickMerchant tizimidagi xizmat identifikatori</div>
                        </div>
                        <div style={{ width: 220 }}>
                            <input className="modal-input mono" type="password"
                                value={settings.clickServiceId}
                                onChange={e => updateValue("clickServiceId", e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ padding: 14, background: "rgba(139, 92, 246, 0.05)", borderRadius: 12, border: "1px dashed var(--accent-primary)", marginTop: 10 }}>
                        <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5 }}>
                            <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>Diqqat:</span> API kalitlarni o'zgartirish tizimning real vaqtdagi ishiga ta'sir qiladi. Faqat ishonchingiz komil bo'lsa o'zgartiring.
                        </div>
                    </div>

                    <div className="settings-card-footer">
                        <button className="btn btn-primary btn-sm" onClick={() => showToast("Integratsiya kalitlari yangilandi")}>Yangilash</button>
                    </div>
                </div>

                {/* 3. TIZIM HOLATI */}
                <div className="settings-card">
                    <div className="settings-section-title">
                        <span>⚡</span> Tizim Holati
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <div className="settings-item-label">Avtomatik moderatsiya</div>
                            <div className="settings-item-hint">Agar yoqilsa, yangi reklamalar admin tekshiruvisiz darhol faollashadi</div>
                        </div>
                        <div className="toggle-wrapper">
                            <div className="toggle-state-label" style={{ color: settings.autoApprove ? "var(--success)" : "var(--text-dim)" }}>
                                {settings.autoApprove ? "YOQILGAN" : "O'CHIRILGAN"}
                            </div>
                            <div className={`toggle-switch-premium ${settings.autoApprove ? "active" : ""}`} onClick={() => toggleValue("autoApprove")}>
                                <div className="knob" />
                            </div>
                        </div>
                    </div>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <div className="settings-item-label">Texnik ishlar rejimi</div>
                            <div className="settings-item-hint">Yoqilsa, platforma barcha foydalanuvchilar uchun yopiladi (Maintenance mode)</div>
                        </div>
                        <div className="toggle-wrapper">
                            <div className="toggle-state-label" style={{ color: settings.maintenanceMode ? "var(--danger-text)" : "var(--text-dim)" }}>
                                {settings.maintenanceMode ? "FAOL" : "FAOL EMAS"}
                            </div>
                            <div className={`toggle-switch-premium ${settings.maintenanceMode ? "active" : ""}`} onClick={() => toggleValue("maintenanceMode")}>
                                <div className="knob" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. XAVFLI ZONA */}
                <div className="danger-zone-enhanced">
                    <div className="settings-section-title" style={{ color: "var(--danger-text)", borderBottomColor: "rgba(239, 68, 68, 0.2)" }}>
                        <span>⚠️</span> Xavfli zona
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 12, marginBottom: 20 }}>
                        Bu erda amalga oshiriladigan amallar platformaning keshini tozalaydi yoki barcha joriy seanslarni (loginlarni) bekor qiladi.
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                        <button className="btn btn-danger btn-sm" onClick={() => showToast("Kesh muvaffaqiyatli tozalandi", "success")}>Keshni tozalash</button>
                        <button className="btn btn-danger btn-sm" onClick={() => showToast("Barcha sessiyalar yakunlandi", "success")}>Sessiyalarni yopish</button>
                    </div>
                </div>

            </div>
        </div>
    );
}
