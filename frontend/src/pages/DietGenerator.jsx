import { useState, useEffect } from 'react';
import { ChefHat, Calendar, User, FileText, CheckCircle, ArrowRight, FileType, FileSpreadsheet } from 'lucide-react';
import { cn } from '../lib/utils';

const API_URL = 'http://127.0.0.1:8000';

export default function DietGenerator() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  
  // Data sources
  const [templates, setTemplates] = useState([]);
  const [pools, setPools] = useState([]);
  const [packages, setPackages] = useState([]); // from localStorage
  
  // Form State
  const [formData, setFormData] = useState({
    patient_name: '',
    weight: '',
    height: '',
    birth_year: '',
    gender: 'Kadin',
    template_id: '',
    pool_type: 'normal',
    package_id: '',
    days: 4,
    start_date: new Date().toISOString().split('T')[0],
    excluded_foods: '',
    combination_code: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [templRes, poolRes] = await Promise.all([
        fetch(`${API_URL}/api/templates`),
        fetch(`${API_URL}/api/pools`)
      ]);
      
      const templData = await templRes.json();
      const poolData = await poolRes.json();
      
      setTemplates(templData);
      setPools(poolData);
      
      // Load packages from local storage
      const savedPackages = localStorage.getItem('dietPackages');
      if (savedPackages) {
        setPackages(JSON.parse(savedPackages));
      }

      // Set defaults
      if (templData.length > 0) setFormData(prev => ({ ...prev, template_id: templData[0].id }));
      if (poolData.length > 0) setFormData(prev => ({ ...prev, pool_type: poolData[0].name }));
      
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handlePackageChange = (pkgId) => {
    const pkg = packages.find(p => p.id === parseInt(pkgId));
    if (pkg) {
        setFormData(prev => ({
            ...prev,
            package_id: pkgId,
            days: pkg.duration || prev.days,
            // Optionally set other fields if package implies them
        }));
    } else {
        setFormData(prev => ({ ...prev, package_id: pkgId }));
    }
  };

  const handleGenerate = async (format) => {
    if (!formData.patient_name || !formData.weight || !formData.height || !formData.birth_year) {
        alert("Lütfen zorunlu alanları doldurun (Ad, Kilo, Boy, Doğum Yılı).");
        return;
    }

    setLoading(true);
    setSuccess(null);

    // Calculate age just in case backend wants it explicit, but we send birth_year too
    const currentYear = new Date().getFullYear();
    const age = currentYear - parseInt(formData.birth_year);

    try {
      const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...formData,
            weight: parseFloat(formData.weight),
            height: parseFloat(formData.height),
            birth_year: parseInt(formData.birth_year),
            age: age, // Backend legacy support
            template_id: parseInt(formData.template_id),
            days: parseInt(formData.days),
            output_format: format
        })
      });
      
      const result = await response.json();
      if (response.ok) {
        setSuccess({
            message: "Dosyalar başarıyla oluşturuldu!",
            files: result.files
        });
      } else {
        alert("Hata: " + result.detail);
      }
    } catch (error) {
      console.error("Generation error:", error);
      alert("Bir hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExcelGenerate = () => {
    alert("Excel modülü henüz aktif değil.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in zoom-in duration-300">
      <div>
        <h1 className="text-3xl font-bold text-finrise-text mb-2">Diyet Oluşturucu</h1>
        <p className="text-finrise-muted">Kişiye özel beslenme programı oluşturun.</p>
      </div>

      <div className="bg-finrise-panel border border-finrise-border rounded-2xl p-8 shadow-xl">
        
        {/* Success Message */}
        {success && (
            <div className="mb-8 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="text-green-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <h3 className="font-semibold text-green-500">İşlem Başarılı!</h3>
                    <p className="text-sm text-finrise-text/80">{success.message}</p>
                    <div className="text-xs font-mono text-finrise-muted mt-2 space-y-1">
                        {success.files.map((f, i) => <div key={i}>{f}</div>)}
                    </div>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Personal Info */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-finrise-accent font-semibold border-b border-finrise-border pb-2">
                    <User size={20} />
                    <h3>Danışan Bilgileri</h3>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-finrise-text">Ad Soyad</label>
                        <input 
                            value={formData.patient_name}
                            onChange={e => setFormData({...formData, patient_name: e.target.value})}
                            className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-2.5 text-finrise-text outline-none focus:border-finrise-accent transition-colors"
                            placeholder="Ad Soyad"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-finrise-text">Boy (cm)</label>
                            <input 
                                type="number"
                                value={formData.height}
                                onChange={e => setFormData({...formData, height: e.target.value})}
                                className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-2.5 text-finrise-text outline-none focus:border-finrise-accent transition-colors no-spinner"
                                placeholder="170"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-finrise-text">Kilo (kg)</label>
                            <input 
                                type="number"
                                value={formData.weight}
                                onChange={e => setFormData({...formData, weight: e.target.value})}
                                className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-2.5 text-finrise-text outline-none focus:border-finrise-accent transition-colors no-spinner"
                                placeholder="70"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-finrise-text">Doğum Yılı</label>
                            <input 
                                type="number"
                                value={formData.birth_year}
                                onChange={e => setFormData({...formData, birth_year: e.target.value})}
                                className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-2.5 text-finrise-text outline-none focus:border-finrise-accent transition-colors no-spinner"
                                placeholder="1990"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-finrise-text">Cinsiyet</label>
                            <select 
                                value={formData.gender}
                                onChange={e => setFormData({...formData, gender: e.target.value})}
                                className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-2.5 text-finrise-text outline-none focus:border-finrise-accent transition-colors"
                            >
                                <option value="Kadin">Kadın</option>
                                <option value="Erkek">Erkek</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Diet Config */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-finrise-accent font-semibold border-b border-finrise-border pb-2">
                    <ChefHat size={20} />
                    <h3>Program Detayları</h3>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-finrise-text">Diyet Paketi</label>
                        <select 
                            value={formData.package_id}
                            onChange={e => handlePackageChange(e.target.value)}
                            className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-2.5 text-finrise-text outline-none focus:border-finrise-accent transition-colors"
                        >
                            <option value="">Paket Seçiniz (Opsiyonel)</option>
                            {packages.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-finrise-text">Diyet Şablonu</label>
                            <select 
                                value={formData.template_id}
                                onChange={e => setFormData({...formData, template_id: e.target.value})}
                                className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-2.5 text-finrise-text outline-none focus:border-finrise-accent transition-colors"
                            >
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                         <div className="space-y-1.5">
                            <label className="text-sm font-medium text-finrise-text">Tarif Havuzu</label>
                            <select 
                                value={formData.pool_type}
                                onChange={e => setFormData({...formData, pool_type: e.target.value})}
                                className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-2.5 text-finrise-text outline-none focus:border-finrise-accent transition-colors"
                            >
                                {pools.map(p => (
                                    <option key={p.id} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-finrise-text">Başlangıç Tarihi</label>
                            <input 
                                type="date"
                                value={formData.start_date}
                                onChange={e => setFormData({...formData, start_date: e.target.value})}
                                className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-2.5 text-finrise-text outline-none focus:border-finrise-accent transition-colors"
                            />
                        </div>
                        <div className="space-y-1.5">
                             <label className="text-sm font-medium text-finrise-text">Süre (Gün)</label>
                             <input 
                                type="number"
                                value={formData.days}
                                onChange={e => setFormData({...formData, days: e.target.value})}
                                className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-2.5 text-finrise-text outline-none focus:border-finrise-accent transition-colors no-spinner"
                             />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-finrise-text">Kombinasyon Kodu</label>
                        <input 
                            value={formData.combination_code}
                            onChange={e => setFormData({...formData, combination_code: e.target.value})}
                            className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-2.5 text-finrise-text outline-none focus:border-finrise-accent transition-colors"
                            placeholder="Örn: K1-A2"
                        />
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-8 space-y-1.5">
            <label className="text-sm font-medium text-finrise-text">İstenmeyen Besinler</label>
            <textarea 
                value={formData.excluded_foods}
                onChange={e => setFormData({...formData, excluded_foods: e.target.value})}
                className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-3 text-finrise-text focus:border-finrise-accent outline-none h-20 resize-none transition-colors"
                placeholder="Örn: Domates, Salatalık, Süt (Virgülle ayırın)"
            />
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-finrise-border">
            <h3 className="text-sm font-medium text-finrise-muted mb-4 uppercase tracking-wider">Oluşturma Seçenekleri</h3>
            
            <div className="flex flex-wrap gap-4">
                <button 
                    onClick={() => handleGenerate('docx')}
                    disabled={loading}
                    className="flex-1 min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-medium transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FileType size={18} />
                    Word (DOCX)
                </button>

                <button 
                    onClick={() => handleGenerate('pdf')}
                    disabled={loading}
                    className="flex-1 min-w-[140px] bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-medium transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FileText size={18} />
                    PDF
                </button>

                 <button 
                    onClick={() => handleGenerate('both')}
                    disabled={loading}
                    className="flex-1 min-w-[180px] bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-medium transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className="flex -space-x-1">
                        <FileType size={16} />
                        <FileText size={16} />
                    </div>
                    DOCX + PDF
                </button>

                <button 
                    onClick={handleExcelGenerate}
                    disabled={loading}
                    className="flex-1 min-w-[140px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-medium transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FileSpreadsheet size={18} />
                    Excel ile
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}
