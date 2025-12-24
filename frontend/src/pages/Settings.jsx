import { useState, useEffect } from 'react';
import { Sun, Snowflake, Palette, RefreshCcw, Save, Database, AppWindow, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

const API_URL = 'http://127.0.0.1:8000';

export default function Settings() {
  const { theme, setTheme, season, customColors, updateCustomColor, resetColors } = useTheme();
  const [activeTab, setActiveTab] = useState('app');
  const [loading, setLoading] = useState(false);
  const [activeColorTab, setActiveColorTab] = useState(theme === 'system' ? 'dark' : theme);
  
  // App Settings State
  const [appSettings, setAppSettings] = useState({
    app_title: 'DiyetKent',
    app_description: '',
    app_logo_path: '',
    days_count: 4,
    save_path: '',
    summer_start: '04-01',
    summer_end: '10-01'
  });

  // Load Settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
        const res = await fetch(`${API_URL}/api/settings`);
        const data = await res.json();
        setAppSettings(prev => ({ 
            ...prev, 
            ...data,
            days_count: data.days_count || 4,
            app_title: data.app_title || 'DiyetKent',
            app_description: data.app_description || '',
            save_path: data.save_path || '',
            summer_start: data.summer_start || '04-01',
            summer_end: data.summer_end || '10-01'
        }));
    } catch (err) {
        console.error("Failed to load settings", err);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
        const res = await fetch(`${API_URL}/api/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appSettings)
        });
        if (res.ok) {
            alert("Ayarlar başarıyla kaydedildi!");
            window.location.reload();
        }
    } catch (err) {
        console.error(err);
        alert("Kaydedilemedi: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
          const res = await fetch(`${API_URL}/api/settings/logo`, {
              method: 'POST',
              body: formData
          });
          const data = await res.json();
          if (data.status === 'success') {
              setAppSettings(prev => ({...prev, app_logo_path: data.path}));
          }
      } catch (err) {
          console.error("Logo upload failed", err);
          alert("Logo yüklenemedi.");
      }
  };

  const handleRemoveLogo = () => {
      setAppSettings(prev => ({...prev, app_logo_path: ''}));
  };

  const handleModeChange = (mode) => {
      setActiveColorTab(mode);
      setTheme(mode); // Sync editor and actual theme
  };

  // Aesthetic Pill Tab
  const TabButton = ({ id, icon, label }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 relative text-sm",
            activeTab === id 
                ? "bg-finrise-accent text-white shadow-md shadow-finrise-accent/20" 
                : "text-finrise-muted hover:text-finrise-text hover:bg-finrise-panel"
        )}
    >
        {icon}
        <span>{label}</span>
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-3xl font-bold text-finrise-text tracking-tight">Ayarlar</h1>
           <p className="text-finrise-muted mt-1 text-sm">Uygulama tercihlerini yönetin.</p>
        </div>
        <button 
             onClick={saveSettings}
             disabled={loading}
             className="flex items-center gap-2 bg-finrise-accent text-white px-5 py-2.5 rounded-xl hover:bg-finrise-accent/90 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-finrise-accent/20 font-medium"
         >
             <Save size={18} />
             {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
         </button>
      </div>

      {/* Modern Pill Tabs */}
      <div className="inline-flex p-1.5 bg-finrise-panel border border-finrise-border rounded-xl">
         <TabButton id="app" icon={<AppWindow size={16} />} label="Uygulama" />
         <TabButton id="theme" icon={<Palette size={16} />} label="Görünüm" />
         <TabButton id="database" icon={<Database size={16} />} label="Veritabanı" />
      </div>

      <div className="bg-finrise-panel border border-finrise-border rounded-2xl p-6 md:p-8 shadow-sm">
          
          {/* --- APP SETTINGS TAB --- */}
          {activeTab === 'app' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                      <h3 className="text-base font-semibold text-finrise-text flex items-center gap-2 pb-2 border-b border-finrise-border">
                          <AppWindow size={18} className="text-finrise-accent" />
                          Genel Bilgiler
                      </h3>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-finrise-text/90">Uygulama Başlığı</label>
                        <input 
                            type="text" 
                            name="app_title"
                            value={appSettings.app_title}
                            onChange={(e) => setAppSettings(prev => ({...prev, app_title: e.target.value}))}
                            className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-3 text-finrise-text focus:border-finrise-accent outline-none transition-all placeholder:text-finrise-muted/50"
                            placeholder="Örn: DiyetKent"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-finrise-text/90">Uygulama Açıklaması</label>
                        <textarea 
                            name="app_description"
                            value={appSettings.app_description}
                            onChange={(e) => setAppSettings(prev => ({...prev, app_description: e.target.value}))}
                            className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-3 text-finrise-text focus:border-finrise-accent outline-none transition-all h-28 resize-none placeholder:text-finrise-muted/50 leading-relaxed"
                            placeholder="Giriş ekranında görünecek açıklama..."
                        />
                      </div>
                      {/* Removed Default Diet Duration */}
                  </div>

                  <div className="space-y-6">
                       <h3 className="text-base font-semibold text-finrise-text flex items-center gap-2 pb-2 border-b border-finrise-border">
                            <ImageIcon size={18} className="text-finrise-accent" />
                            Marka & Veri
                       </h3>
                       
                       <div className="space-y-3">
                          <label className="text-sm font-medium text-finrise-text/90">Uygulama Logosu</label>
                          <div className="flex gap-5 items-start bg-finrise-input/30 p-4 rounded-2xl border border-finrise-border/50">
                              <div className="w-20 h-20 bg-finrise-input rounded-xl border border-finrise-border flex items-center justify-center overflow-hidden relative group shrink-0 shadow-inner">
                                  {appSettings.app_logo_path ? (
                                      <img src={`${API_URL}${appSettings.app_logo_path}`} className="w-full h-full object-cover" alt="Logo" />
                                  ) : (
                                      <ImageIcon className="text-finrise-muted/50 w-8 h-8" />
                                  )}
                                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-white">
                                     <Upload size={18} />
                                     <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                  </label>
                              </div>
                              <div className="flex-1 flex flex-col justify-between">
                                  <p className="text-sm text-finrise-muted mb-3 leading-relaxed">PNG veya JPG formatında, şeffaf arka planlı görsel önerilir.</p>
                                  
                                  <div className="flex gap-2">
                                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-finrise-accent bg-finrise-accent/10 px-3 py-1.5 rounded-lg hover:bg-finrise-accent/20 cursor-pointer transition-colors">
                                          <Upload size={14} />
                                          Görsel Yükle
                                          <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                      </label>
                                      
                                      {appSettings.app_logo_path && (
                                          <button 
                                            onClick={handleRemoveLogo}
                                            className="inline-flex items-center gap-2 text-xs font-semibold text-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                                          >
                                              <Trash2 size={14} />
                                              Kaldır
                                          </button>
                                      )}
                                  </div>
                              </div>
                          </div>
                       </div>
                       {/* Removed Save Folder Path */}
                  </div>
              </div>
          )}

          {/* --- THEME SETTINGS TAB --- */}
          {activeTab === 'theme' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-finrise-text flex items-center gap-2">
                         <Palette className="text-finrise-accent" size={20}/>
                         Renk Özelleştirme
                    </h3>
                    <button
                        onClick={resetColors}
                        className="text-xs flex items-center gap-1.5 text-finrise-muted hover:text-finrise-red hover:bg-finrise-red/10 px-3 py-1.5 rounded-lg transition-colors w-fit"
                    >
                        <RefreshCcw size={12} />
                        Varsayılanlara Dön
                    </button>
                  </div>

                  {/* Mode Toggles */}
                  <div className="flex p-1 bg-finrise-input rounded-xl w-fit border border-finrise-border">
                    <button
                        onClick={() => handleModeChange('dark')}
                        className={cn("px-6 py-2 rounded-lg text-sm font-medium transition-all", activeColorTab === 'dark' ? "bg-finrise-panel shadow-md text-finrise-text" : "text-finrise-muted hover:text-finrise-text")}
                    >
                        Karanlık Mod
                    </button>
                    <button
                        onClick={() => handleModeChange('light')}
                        className={cn("px-6 py-2 rounded-lg text-sm font-medium transition-all", activeColorTab === 'light' ? "bg-finrise-panel shadow-md text-finrise-text" : "text-finrise-muted hover:text-finrise-text")}
                    >
                        Aydınlık Mod
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {(() => {
                        const DEFAULTS = {
                            dark: {
                                '--color-accent': '#e91d7c',
                                '--bg-app': '#0f172a',
                                '--bg-panel': '#1e293b',
                                '--bg-sidebar': '#111827',
                                '--text-main': '#f1f5f9',
                                '--bg-input': '#334155',
                            },
                            light: {
                                '--color-accent': '#e91d7c',
                                '--bg-app': '#f0f2f5',
                                '--bg-panel': '#ffffff',
                                '--bg-sidebar': '#ffffff',
                                '--bg-input': '#e2e8f0', 
                                '--text-main': '#1e293b',
                            }
                        };

                        return [
                            { label: 'Vurgu Rengi', key: '--color-accent' },
                            { label: 'Arkaplan', key: '--bg-app' },
                            { label: 'Panel', key: '--bg-panel' },
                            { label: 'Kenar Çubuğu', key: '--bg-sidebar' },
                            { label: 'Giriş Alanı', key: '--bg-input' },
                            { label: 'Metin Rengi', key: '--text-main' },
                        ].map((opt) => {
                            const defaultVal = DEFAULTS[activeColorTab]?.[opt.key] || '#000000';
                            const currentVal = customColors[activeColorTab]?.[opt.key] || defaultVal;
                            
                            return (
                                <div key={opt.key} className="space-y-2 group">
                                    <label className="text-xs font-medium text-finrise-muted group-hover:text-finrise-text transition-colors">{opt.label}</label>
                                    <div className="flex items-center gap-3 bg-finrise-input p-3 rounded-xl border border-finrise-border group-hover:border-finrise-accent/50 transition-colors">
                                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-finrise-border/50">
                                            <input 
                                                type="color" 
                                                value={currentVal}
                                                onChange={(e) => updateCustomColor(activeColorTab, opt.key, e.target.value)}
                                                className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] cursor-pointer p-0 m-0"
                                            />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-mono text-finrise-text uppercase truncate">{currentVal}</span>
                                            <span className="text-[10px] text-finrise-muted opacity-50 truncate">{opt.key}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        });
                    })()}
                  </div>
              </div>
          )}

          {/* --- DATABASE TAB --- */}
          {activeTab === 'database' && (
              <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
                  <div>
                    <h3 className="text-lg font-semibold text-finrise-text mb-6 flex items-center gap-2">
                         <Sun className="text-finrise-accent" size={20} />
                         Sezon Ayarları
                    </h3>
                    <div className={cn(
                        "p-6 rounded-2xl border flex items-center gap-5 mb-8 transition-colors",
                        season === 'yaz' ? "bg-orange-500/5 border-orange-500/20" : "bg-blue-500/5 border-blue-500/20"
                    )}>
                        <div className={cn("p-4 rounded-full", season === 'yaz' ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500")}>
                            {season === 'yaz' ? <Sun size={32} /> : <Snowflake size={32} />}
                        </div>
                        <div>
                            <div className={cn("font-bold text-xl mb-1", season === 'yaz' ? "text-orange-500" : "text-blue-500")}>
                                {season === 'yaz' ? 'YAZ SEZONU' : 'KIŞ SEZONU'}
                            </div>
                            <div className="text-sm text-finrise-muted">
                                Belirlenen tarihler aralığında Yaz modu aktif olur. Şu anki tarihe göre otomatik hesaplanır.
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-finrise-text/90">Yaz Başlangıcı (Ay-Gün)</label>
                            <input 
                                type="text"
                                name="summer_start"
                                value={appSettings.summer_start}
                                onChange={(e) => setAppSettings(prev => ({...prev, summer_start: e.target.value}))}
                                className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-3 text-finrise-text focus:border-finrise-accent outline-none transition-all"
                                placeholder="04-01"
                            />
                        </div>
                        <div className="space-y-2">
                             <label className="text-sm font-medium text-finrise-text/90">Yaz Bitişi (Ay-Gün)</label>
                             <input 
                                type="text"
                                name="summer_end"
                                value={appSettings.summer_end}
                                onChange={(e) => setAppSettings(prev => ({...prev, summer_end: e.target.value}))}
                                className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-3 text-finrise-text focus:border-finrise-accent outline-none transition-all"
                                placeholder="10-01"
                            />
                        </div>
                    </div>
                  </div>
              </div>
          )}

      </div>
    </div>
  );
}
