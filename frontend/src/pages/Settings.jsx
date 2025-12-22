import { useState, useEffect } from 'react';
import { Sun, Snowflake, Moon, Monitor, Palette, RefreshCcw, Calendar, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

const API_URL = 'http://127.0.0.1:8000';

export default function Settings() {
  const { theme, setTheme, season, customColors, updateCustomColor, resetColors } = useTheme();
  const [activeColorTab, setActiveColorTab] = useState('dark');
  
  // Season Config State
  const [seasonConfig, setSeasonConfig] = useState({
    summer_start: '04-01',
    summer_end: '10-01'
  });
  const [savingSeason, setSavingSeason] = useState(false);

  // Common colors to pick
  const colorOptions = [
    { label: 'Vurgu Rengi', key: '--color-accent', defaultLight: '#e91d7c', defaultDark: '#e91d7c' },
    { label: 'Arkaplan', key: '--bg-app', defaultLight: '#f8f9fa', defaultDark: '#1a1a2e' },
    { label: 'Panel', key: '--bg-panel', defaultLight: '#ffffff', defaultDark: '#282c34' },
    { label: 'Kenar Çubuğu', key: '--bg-sidebar', defaultLight: '#f1f2f4', defaultDark: '#2c313c' },
    { label: 'Metin Rengi', key: '--text-main', defaultLight: '#2d3748', defaultDark: '#abb2bf' },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
        const res = await fetch(`${API_URL}/api/settings`);
        const data = await res.json();
        setSeasonConfig({
            summer_start: data.summer_start || '04-01',
            summer_end: data.summer_end || '10-01'
        });
    } catch (err) {
        console.error("Failed to load settings", err);
    }
  };

  const saveSeasonConfig = async () => {
    setSavingSeason(true);
    try {
        const res = await fetch(`${API_URL}/api/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                summer_start: seasonConfig.summer_start,
                summer_end: seasonConfig.summer_end
            })
        });
        if (res.ok) {
            alert("Sezon tarihleri güncellendi! Değişikliğin etkili olması için sayfa yenilenebilir.");
            window.location.reload(); // To refresh effective season in context
        }
    } catch (err) {
        console.error(err);
        alert("Kaydedilemedi.");
    } finally {
        setSavingSeason(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-finrise-text mb-2">Ayarlar</h1>
        <p className="text-finrise-muted">Uygulama görünümü ve genel tercihler.</p>
      </div>

      <div className="bg-finrise-panel border border-finrise-border rounded-2xl p-8 shadow-xl space-y-8">
          
          {/* Appearance (Theme Mode) */}
          <div className="space-y-4">
             <h3 className="text-lg font-semibold text-finrise-text flex items-center gap-2">
               Görünüm Modu
             </h3>
             <div className="grid grid-cols-3 gap-4">
               <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2",
                    theme === 'dark' 
                      ? "border-finrise-accent bg-finrise-accent/10 text-finrise-accent" 
                      : "border-finrise-border bg-finrise-input text-finrise-muted hover:border-finrise-border/50"
                  )}
               >
                 <Moon className="w-6 h-6" />
                 <span className="font-medium text-sm">Karanlık</span>
               </button>

               <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2",
                    theme === 'light' 
                      ? "border-finrise-accent bg-finrise-accent/10 text-finrise-accent" 
                      : "border-finrise-border bg-finrise-input text-finrise-muted hover:border-finrise-border/50"
                  )}
               >
                 <Sun className="w-6 h-6" />
                 <span className="font-medium text-sm">Aydınlık</span>
               </button>

               <button
                  onClick={() => setTheme('system')}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2",
                    theme === 'system' 
                      ? "border-finrise-accent bg-finrise-accent/10 text-finrise-accent" 
                      : "border-finrise-border bg-finrise-input text-finrise-muted hover:border-finrise-border/50"
                  )}
               >
                 <Monitor className="w-6 h-6" />
                 <span className="font-medium text-sm">Sistem</span>
               </button>
             </div>
          </div>

          <div className="h-px bg-finrise-border" />

          {/* Color Customization */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-finrise-text flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Renk Teması
              </h3>
              <button
                onClick={resetColors}
                className="text-xs flex items-center gap-1 text-finrise-muted hover:text-finrise-text transition-colors"
                title="Varsayılan renklere dön"
              >
                <RefreshCcw size={12} />
                Sıfırla
              </button>
            </div>
            
            {/* Tabs for Light/Dark color editing */}
             <div className="flex p-1 bg-finrise-input rounded-xl mb-4 w-fit">
                <button
                    onClick={() => setActiveColorTab('dark')}
                    className={cn(
                        "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                        activeColorTab === 'dark' ? "bg-finrise-panel shadow text-finrise-text" : "text-finrise-muted hover:text-finrise-text"
                    )}
                >
                    Karanlık Mod Renkleri
                </button>
                <button
                    onClick={() => setActiveColorTab('light')}
                    className={cn(
                        "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                        activeColorTab === 'light' ? "bg-finrise-panel shadow text-finrise-text" : "text-finrise-muted hover:text-finrise-text"
                    )}
                >
                    Aydınlık Mod Renkleri
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {colorOptions.map((opt) => {
                  const currentVal = customColors[activeColorTab]?.[opt.key] || (activeColorTab === 'light' ? opt.defaultLight : opt.defaultDark);
                  
                  return (
                    <div key={opt.key} className="space-y-2">
                        <label className="text-xs font-medium text-finrise-muted">{opt.label}</label>
                        <div className="flex items-center gap-2 bg-finrise-input p-2 rounded-lg border border-finrise-border">
                        <input 
                            type="color" 
                            value={currentVal}
                            onChange={(e) => updateCustomColor(activeColorTab, opt.key, e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"
                        />
                        <span className="text-xs font-mono text-finrise-text uppercase">{currentVal}</span>
                        </div>
                    </div>
                  );
              })}
            </div>
          </div>
          
          <div className="h-px bg-finrise-border" />
          
          {/* Season Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-finrise-text flex items-center gap-2">
              Otomatik Sezon Yönetimi
            </h3>
            
            <div className={`p-4 rounded-xl border flex items-center gap-3 ${season === 'yaz' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}>
                {season === 'yaz' ? <Sun /> : <Snowflake />}
                <div className="flex-1">
                    <div className="font-semibold">Şu an aktif sezon: {season === 'yaz' ? 'YAZ' : 'KIŞ'}</div>
                    <div className="text-xs opacity-80">Otomatik olarak seçilmiştir.</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-2">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-finrise-text">Yaz Sezonu Başlangıcı</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-finrise-muted w-4 h-4" />
                        <input 
                            type="text"
                            placeholder="AA-GG (Örn: 04-01)"
                            value={seasonConfig.summer_start}
                            onChange={(e) => setSeasonConfig({...seasonConfig, summer_start: e.target.value})}
                            className="w-full pl-9 bg-finrise-input border border-finrise-border rounded-lg px-4 py-3 text-finrise-text outline-none focus:border-finrise-accent transition-colors"
                        />
                    </div>
                    <p className="text-xs text-finrise-muted">Ay-Gün formatında (04-01 = 1 Nisan)</p>
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-medium text-finrise-text">Yaz Sezonu Bitişi</label>
                     <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-finrise-muted w-4 h-4" />
                        <input 
                            type="text"
                            placeholder="AA-GG (Örn: 10-01)"
                            value={seasonConfig.summer_end}
                            onChange={(e) => setSeasonConfig({...seasonConfig, summer_end: e.target.value})}
                            className="w-full pl-9 bg-finrise-input border border-finrise-border rounded-lg px-4 py-3 text-finrise-text outline-none focus:border-finrise-accent transition-colors"
                        />
                    </div>
                    <p className="text-xs text-finrise-muted">Ay-Gün formatında (10-01 = 1 Ekim)</p>
                 </div>
            </div>

            <div className="flex justify-end pt-2">
                <button 
                    onClick={saveSeasonConfig}
                    disabled={savingSeason}
                    className="flex items-center gap-2 bg-finrise-accent text-white px-6 py-2 rounded-xl hover:bg-finrise-accent/90 transition-colors disabled:opacity-50"
                >
                    <Save size={16} />
                    {savingSeason ? 'Kaydediliyor...' : 'Tarihleri Kaydet'}
                </button>
            </div>
          </div>

      </div>
    </div>
  );
}
