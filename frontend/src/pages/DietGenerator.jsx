import { useState, useEffect, useMemo } from 'react';
import { 
  ChefHat, User, FileText, CheckCircle, FileType, FileSpreadsheet, 
  Package, Scale, Info, Calendar, Ruler, Activity, Target, AlertTriangle
} from 'lucide-react';
import { cn } from '../lib/utils';

const API_URL = 'http://127.0.0.1:8000';

export default function DietGenerator() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  
  // Data sources
  const [templates, setTemplates] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    patient_name: '',
    weight: '',
    height: '',
    birth_year: '',
    gender: 'Kadin',
    template_id: '',
    package_id: '',
    start_date: new Date().toISOString().split('T')[0],
    excluded_foods: '',
    combination_code: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [templRes, pkgRes] = await Promise.all([
        fetch(`${API_URL}/api/templates`),
        fetch(`${API_URL}/api/packages`)
      ]);
      
      const templData = await templRes.json();
      const pkgData = await pkgRes.json();
      
      setTemplates(templData);
      setPackages(pkgData);
      
      if (templData.length > 0) setFormData(prev => ({ ...prev, template_id: templData[0].id }));
      if (pkgData.length > 0) {
        setFormData(prev => ({ ...prev, package_id: pkgData[0].id }));
        setSelectedPackage(pkgData[0]);
      }
      
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handlePackageChange = (pkgId) => {
    const pkg = packages.find(p => p.id === parseInt(pkgId));
    setSelectedPackage(pkg || null);
    setFormData(prev => ({ ...prev, package_id: pkgId }));
  };

  // Hesaplamalar (memoized)
  const calculations = useMemo(() => {
    const weight = parseFloat(formData.weight) || 0;
    const height = parseFloat(formData.height) || 0;
    const birthYear = parseInt(formData.birth_year) || 0;
    
    if (!weight || !height) return null;
    
    const currentYear = new Date().getFullYear();
    const age = birthYear ? currentYear - birthYear : 0;
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    
    // İdeal ve geçmemesi gereken kilo
    let idealWeight, maxWeight;
    if (age < 35) {
      idealWeight = heightM * heightM * 21;
      maxWeight = heightM * heightM * 27;
    } else if (age <= 45) {
      idealWeight = heightM * heightM * 22;
      maxWeight = heightM * heightM * 28;
    } else {
      idealWeight = heightM * heightM * 23;
      maxWeight = heightM * heightM * 30;
    }
    
    // BKİ durumu
    let bmiStatus, bmiColor;
    if (bmi < 18.5) {
      bmiStatus = 'Zayıf';
      bmiColor = 'text-blue-500';
    } else if (bmi < 25) {
      bmiStatus = 'Normal';
      bmiColor = 'text-emerald-500';
    } else if (bmi < 30) {
      bmiStatus = 'Fazla Kilolu';
      bmiColor = 'text-yellow-500';
    } else if (bmi < 35) {
      bmiStatus = 'Obez (Sınıf 1)';
      bmiColor = 'text-orange-500';
    } else {
      bmiStatus = 'Obez (Sınıf 2+)';
      bmiColor = 'text-red-500';
    }
    
    // Verilmesi gereken kilo
    const weightToLose = weight - idealWeight;
    
    return {
      age,
      bmi: bmi.toFixed(1),
      bmiStatus,
      bmiColor,
      idealWeight: idealWeight.toFixed(1),
      maxWeight: maxWeight.toFixed(1),
      weightToLose: weightToLose.toFixed(1),
      isOverweight: weight > maxWeight
    };
  }, [formData.weight, formData.height, formData.birth_year]);

  const handleGenerate = async (format) => {
    if (!formData.patient_name || !formData.weight || !formData.height || !formData.birth_year) {
      alert("Lütfen zorunlu alanları doldurun.");
      return;
    }

    if (!formData.package_id) {
      alert("Lütfen bir diyet paketi seçin.");
      return;
    }

    setLoading(true);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: formData.patient_name,
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
          birth_year: parseInt(formData.birth_year),
          gender: formData.gender,
          template_id: parseInt(formData.template_id),
          package_id: parseInt(formData.package_id),
          start_date: formData.start_date,
          excluded_foods: formData.excluded_foods,
          combination_code: formData.combination_code,
          output_format: format
        })
      });
      
      const result = await response.json();
      if (response.ok) {
        setSuccess({
          message: result.message,
          files: result.files,
          lists_generated: result.lists_generated
        });
      } else {
        alert("Hata: " + result.detail);
      }
    } catch (error) {
      alert("Bir hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-finrise-text">Diyet Oluşturucu</h1>
        <p className="text-sm text-finrise-muted">Kişiye özel beslenme programı oluşturun</p>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sol Panel: Form */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Danışan Bilgileri */}
          <div className="bg-finrise-panel border border-finrise-border rounded-xl p-5">
            <div className="flex items-center gap-2 text-finrise-accent font-medium mb-4">
              <User size={18} />
              <span>Danışan Bilgileri</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-finrise-muted mb-1 block">Ad Soyad *</label>
                <input 
                  value={formData.patient_name}
                  onChange={e => setFormData({...formData, patient_name: e.target.value})}
                  className="w-full bg-finrise-input border border-finrise-border rounded-lg px-3 py-2 text-sm text-finrise-text outline-none focus:border-finrise-accent transition-colors"
                  placeholder="Ad Soyad"
                />
              </div>
              
              <div>
                <label className="text-xs font-medium text-finrise-muted mb-1 block">Boy (cm) *</label>
                <div className="relative">
                  <Ruler size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-finrise-muted" />
                  <input 
                    type="number"
                    value={formData.height}
                    onChange={e => setFormData({...formData, height: e.target.value})}
                    className="w-full bg-finrise-input border border-finrise-border rounded-lg pl-8 pr-3 py-2 text-sm text-finrise-text outline-none focus:border-finrise-accent transition-colors no-spinner"
                    placeholder="170"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-finrise-muted mb-1 block">Kilo (kg) *</label>
                <div className="relative">
                  <Scale size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-finrise-muted" />
                  <input 
                    type="number"
                    value={formData.weight}
                    onChange={e => setFormData({...formData, weight: e.target.value})}
                    className="w-full bg-finrise-input border border-finrise-border rounded-lg pl-8 pr-3 py-2 text-sm text-finrise-text outline-none focus:border-finrise-accent transition-colors no-spinner"
                    placeholder="70"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-finrise-muted mb-1 block">Doğum Yılı *</label>
                <input 
                  type="number"
                  value={formData.birth_year}
                  onChange={e => setFormData({...formData, birth_year: e.target.value})}
                  className="w-full bg-finrise-input border border-finrise-border rounded-lg px-3 py-2 text-sm text-finrise-text outline-none focus:border-finrise-accent transition-colors no-spinner"
                  placeholder="1990"
                />
              </div>
              
              <div>
                <label className="text-xs font-medium text-finrise-muted mb-1 block">Cinsiyet</label>
                <select 
                  value={formData.gender}
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                  className="w-full bg-finrise-input border border-finrise-border rounded-lg px-3 py-2 text-sm text-finrise-text outline-none focus:border-finrise-accent transition-colors"
                >
                  <option value="Kadin">Kadın</option>
                  <option value="Erkek">Erkek</option>
                </select>
              </div>
            </div>
          </div>

          {/* Program Ayarları */}
          <div className="bg-finrise-panel border border-finrise-border rounded-xl p-5">
            <div className="flex items-center gap-2 text-finrise-accent font-medium mb-4">
              <ChefHat size={18} />
              <span>Program Ayarları</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-finrise-muted mb-1 block">Diyet Paketi *</label>
                <select 
                  value={formData.package_id}
                  onChange={e => handlePackageChange(e.target.value)}
                  className="w-full bg-finrise-input border border-finrise-border rounded-lg px-3 py-2 text-sm text-finrise-text outline-none focus:border-finrise-accent transition-colors"
                >
                  <option value="">Seçiniz</option>
                  {packages.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-xs font-medium text-finrise-muted mb-1 block">Diyet Şablonu</label>
                <select 
                  value={formData.template_id}
                  onChange={e => setFormData({...formData, template_id: e.target.value})}
                  className="w-full bg-finrise-input border border-finrise-border rounded-lg px-3 py-2 text-sm text-finrise-text outline-none focus:border-finrise-accent transition-colors"
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-xs font-medium text-finrise-muted mb-1 block">Başlangıç Tarihi</label>
                <input 
                  type="date"
                  value={formData.start_date}
                  onChange={e => setFormData({...formData, start_date: e.target.value})}
                  className="w-full bg-finrise-input border border-finrise-border rounded-lg px-3 py-2 text-sm text-finrise-text outline-none focus:border-finrise-accent transition-colors"
                />
              </div>
              
              <div className="col-span-2 md:col-span-3">
                <label className="text-xs font-medium text-finrise-muted mb-1 block">İstenmeyen Besinler</label>
                <input 
                  value={formData.excluded_foods}
                  onChange={e => setFormData({...formData, excluded_foods: e.target.value})}
                  className="w-full bg-finrise-input border border-finrise-border rounded-lg px-3 py-2 text-sm text-finrise-text outline-none focus:border-finrise-accent transition-colors"
                  placeholder="Domates, Salatalık, Süt (virgülle ayırın)"
                />
              </div>
            </div>
          </div>

          {/* Oluştur Butonları */}
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => handleGenerate('docx')}
              disabled={loading}
              className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-all disabled:opacity-50"
            >
              <FileType size={16} />
              Word
            </button>

            <button 
              onClick={() => handleGenerate('pdf')}
              disabled={loading}
              className="flex-1 min-w-[120px] bg-red-600 hover:bg-red-700 text-white rounded-lg py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-all disabled:opacity-50"
            >
              <FileText size={16} />
              PDF
            </button>

            <button 
              onClick={() => handleGenerate('both')}
              disabled={loading}
              className="flex-1 min-w-[140px] bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-all disabled:opacity-50"
            >
              <div className="flex -space-x-1">
                <FileType size={14} />
                <FileText size={14} />
              </div>
              Her İkisi
            </button>

            <button 
              onClick={() => alert('Excel ile otomatik oluşturma özelliği yakında eklenecek.')}
              disabled={loading}
              className="flex-1 min-w-[180px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-all disabled:opacity-50"
            >
              <FileSpreadsheet size={16} />
              Excel ile Otomatik
            </button>
          </div>
        </div>

        {/* Sağ Panel: Hesaplamalar & Paket Bilgisi */}
        <div className="space-y-4">
          
          {/* Hesaplanan Değerler */}
          {calculations && (
            <div className="bg-finrise-panel border border-finrise-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-finrise-accent font-medium mb-3">
                <Activity size={16} />
                <span className="text-sm">Hesaplanan Değerler</span>
              </div>
              
              <div className="space-y-2.5">
                {/* Yaş */}
                {calculations.age > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-finrise-muted">Yaş</span>
                    <span className="text-finrise-text font-medium">{calculations.age}</span>
                  </div>
                )}
                
                {/* BKİ */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-finrise-muted">BKİ</span>
                  <div className="text-right">
                    <span className="text-finrise-text font-medium">{calculations.bmi}</span>
                    <span className={cn("ml-2 text-xs", calculations.bmiColor)}>
                      ({calculations.bmiStatus})
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-finrise-border my-2"></div>
                
                {/* İdeal Kilo */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-finrise-muted flex items-center gap-1">
                    <Target size={12} />
                    İdeal Kilo
                  </span>
                  <span className="text-emerald-500 font-bold">{calculations.idealWeight} kg</span>
                </div>
                
                {/* Geçmemesi Gereken */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-finrise-muted flex items-center gap-1">
                    <AlertTriangle size={12} />
                    Max Kilo
                  </span>
                  <span className="text-red-500 font-bold">{calculations.maxWeight} kg</span>
                </div>
                
                {/* Verilmesi Gereken */}
                {parseFloat(calculations.weightToLose) > 0 && (
                  <>
                    <div className="border-t border-finrise-border my-2"></div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-finrise-muted">Hedef Kayıp</span>
                      <span className="text-orange-500 font-bold">-{calculations.weightToLose} kg</span>
                    </div>
                  </>
                )}
                
                {/* Uyarı */}
                {calculations.isOverweight && (
                  <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertTriangle size={12} />
                      Kilo sınırın üzerinde
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Paket Bilgisi */}
          {selectedPackage && (
            <div className="bg-finrise-panel border border-finrise-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-orange-500 font-medium mb-3">
                <Package size={16} />
                <span className="text-sm">{selectedPackage.name}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-finrise-muted">Liste Sayısı</span>
                  <span className="text-finrise-text">{selectedPackage.list_count} adet</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-finrise-muted">Liste Süresi</span>
                  <span className="text-finrise-text">{selectedPackage.days_per_list} gün</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-finrise-muted">Toplam Süre</span>
                  <span className="text-finrise-text font-medium">
                    {selectedPackage.list_count * selectedPackage.days_per_list} gün
                  </span>
                </div>
                
                {selectedPackage.weight_change_per_list !== 0 && (
                  <>
                    <div className="border-t border-finrise-border my-2"></div>
                    <div className="flex justify-between text-sm">
                      <span className="text-finrise-muted">Hedef Değişim</span>
                      <span className={cn(
                        "font-bold",
                        selectedPackage.weight_change_per_list < 0 ? "text-emerald-500" : "text-red-500"
                      )}>
                        {selectedPackage.weight_change_per_list > 0 ? '+' : ''}
                        {selectedPackage.list_count * selectedPackage.weight_change_per_list} kg
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Boş Durum */}
          {!calculations && !selectedPackage && (
            <div className="bg-finrise-panel border border-finrise-border rounded-xl p-6 text-center">
              <Info size={32} className="text-finrise-muted mx-auto mb-2 opacity-50" />
              <p className="text-sm text-finrise-muted">
                Bilgileri girdikçe hesaplamalar burada görünecek
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Success Message - Bottom */}
      {success && (
        <div className="mt-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-emerald-500">{success.message}</p>
            <div className="text-xs font-mono text-finrise-muted mt-2 space-y-0.5">
              {success.files?.map((f, i) => <div key={i}>{f}</div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
