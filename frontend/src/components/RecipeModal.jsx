import { useState, useEffect } from 'react';
import { X, Save, Package, Copy } from 'lucide-react';
import { cn } from '../lib/utils';

const API_URL = 'http://127.0.0.1:8000';

const BKI_GROUPS = [
  { key: 'bki_21_25', label: 'BKİ 21-25', color: 'emerald' },
  { key: 'bki_26_29', label: 'BKİ 26-29', color: 'yellow' },
  { key: 'bki_30_33', label: 'BKİ 30-33', color: 'orange' },
  { key: 'bki_34_plus', label: 'BKİ 34+', color: 'red' },
];

export function RecipeModal({ isOpen, onClose, onSave, recipe }) {
  const [packages, setPackages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    meal_type: 'kahvalti',
    bki_21_25: '',
    bki_26_29: '',
    bki_30_33: '',
    bki_34_plus: '',
    seasons: 'yaz,kis',
    package_ids: []
  });

  useEffect(() => {
    if (isOpen) {
      fetchPackages();
    }
  }, [isOpen]);

  useEffect(() => {
    if (recipe && isOpen) {
      // Mevcut tarif düzenleniyorsa, paketlerini getir
      fetchRecipePackages(recipe.id);
      setFormData({
        name: recipe.name || '',
        meal_type: recipe.meal_type || 'kahvalti',
        bki_21_25: recipe.bki_21_25 || '',
        bki_26_29: recipe.bki_26_29 || '',
        bki_30_33: recipe.bki_30_33 || '',
        bki_34_plus: recipe.bki_34_plus || '',
        seasons: recipe.seasons || 'yaz,kis',
        package_ids: []
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        meal_type: 'kahvalti',
        bki_21_25: '',
        bki_26_29: '',
        bki_30_33: '',
        bki_34_plus: '',
        seasons: 'yaz,kis',
        package_ids: []
      });
    }
  }, [recipe, isOpen]);

  const fetchPackages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/packages`);
      const data = await response.json();
      setPackages(data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const fetchRecipePackages = async (recipeId) => {
    try {
      const response = await fetch(`${API_URL}/api/recipes/${recipeId}/packages`);
      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        package_ids: data.map(p => p.id)
      }));
    } catch (error) {
      console.error('Error fetching recipe packages:', error);
    }
  };

  if (!isOpen) return null;

  const togglePackage = (packageId) => {
    setFormData(prev => {
      const newIds = prev.package_ids.includes(packageId)
        ? prev.package_ids.filter(id => id !== packageId)
        : [...prev.package_ids, packageId];
      return { ...prev, package_ids: newIds };
    });
  };
  const toggleSeason = (season) => {
    setFormData(prev => {
      const currentSeasons = prev.seasons ? prev.seasons.split(',') : [];
      let newSeasons;
      
      if (currentSeasons.includes(season)) {
        newSeasons = currentSeasons.filter(s => s !== season);
      } else {
        newSeasons = [...currentSeasons, season];
      }
      
      return { ...prev, seasons: newSeasons.join(',') };
    });
  };

  // İlk BKİ içeriğini diğerlerine kopyala
  const copyToAll = () => {
    const firstContent = formData.bki_21_25;
    setFormData(prev => ({
      ...prev,
      bki_26_29: prev.bki_26_29 || firstContent,
      bki_30_33: prev.bki_30_33 || firstContent,
      bki_34_plus: prev.bki_34_plus || firstContent,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Tarifi kaydet
    const recipePayload = {
      name: formData.name,
      meal_type: formData.meal_type,
      pool_type: 'legacy',
      bki_21_25: formData.bki_21_25,
      bki_26_29: formData.bki_26_29 || formData.bki_21_25,
      bki_30_33: formData.bki_30_33 || formData.bki_21_25,
      bki_34_plus: formData.bki_34_plus || formData.bki_21_25,
      seasons: formData.seasons
    };
    
    await onSave(recipePayload);
    
    // Eğer düzenleme modundaysak, paket ilişkilerini güncelleyelim
    if (recipe?.id) {
      try {
        await fetch(`${API_URL}/api/recipes/${recipe.id}/packages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ package_ids: formData.package_ids })
        });
      } catch (error) {
        console.error('Error updating recipe packages:', error);
      }
    }
  };

  const getBorderColor = (color) => {
    switch (color) {
      case 'emerald': return 'border-emerald-500/50 focus:border-emerald-500';
      case 'yellow': return 'border-yellow-500/50 focus:border-yellow-500';
      case 'orange': return 'border-orange-500/50 focus:border-orange-500';
      case 'red': return 'border-red-500/50 focus:border-red-500';
      default: return 'border-white/10';
    }
  };

  const getLabelColor = (color) => {
    switch (color) {
      case 'emerald': return 'text-emerald-400';
      case 'yellow': return 'text-yellow-400';
      case 'orange': return 'text-orange-400';
      case 'red': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
          <h2 className="text-xl font-bold text-white">
            {recipe ? 'Tarifi Düzenle' : 'Yeni Tarif Ekle'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-400">Tarif Adı</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50 transition-all"
                placeholder="Örn: Avokado Salatası"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-400">Öğün Tipi</label>
              <select
                value={formData.meal_type}
                onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50 transition-all"
              >
                <option value="kahvalti">Kahvaltı</option>
                <option value="ara_ogun_1">Ara Öğün 1</option>
                <option value="ogle">Öğle Yemeği</option>
                <option value="ara_ogun_2">Ara Öğün 2</option>
                <option value="aksam">Akşam Yemeği</option>
                <option value="ara_ogun_3">Ara Öğün 3</option>
                <option value="ozel_icecek">Özel İçecek</option>
              </select>
            </div>
          </div>

          {/* Mevsim Seçimi */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Geçerli Mevsimler</label>
            <div className="flex gap-4">
               <label className={cn(
                  "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all",
                  formData.seasons.includes('yaz') 
                    ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300" 
                    : "bg-black/20 border-white/10 text-gray-400 hover:border-white/20"
               )}>
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={formData.seasons.includes('yaz')}
                    onChange={() => toggleSeason('yaz')}
                  />
                  <span>☀️ Yaz</span>
               </label>
               
               <label className={cn(
                  "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all",
                  formData.seasons.includes('kis') 
                    ? "bg-blue-500/20 border-blue-500/50 text-blue-300" 
                    : "bg-black/20 border-white/10 text-gray-400 hover:border-white/20"
               )}>
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={formData.seasons.includes('kis')}
                    onChange={() => toggleSeason('kis')}
                  />
                  <span>❄️ Kış</span>
               </label>
            </div>
          </div>

          {/* BKİ Gruplarına Göre İçerikler */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-400">BKİ Gruplarına Göre İçerikler</label>
              <button
                type="button"
                onClick={copyToAll}
                className="text-xs flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <Copy size={12} />
                İlkini Boşlara Kopyala
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {BKI_GROUPS.map((group) => (
                <div key={group.key} className="space-y-1">
                  <label className={cn("text-xs font-medium", getLabelColor(group.color))}>
                    {group.label}
                  </label>
                  <textarea
                    rows={3}
                    value={formData[group.key]}
                    onChange={(e) => setFormData({ ...formData, [group.key]: e.target.value })}
                    className={cn(
                      "w-full bg-black/20 border rounded-lg px-3 py-2 text-white text-sm focus:outline-none transition-all resize-none",
                      getBorderColor(group.color)
                    )}
                    placeholder={group.key === 'bki_21_25' ? 'Tarif içeriği (zorunlu)' : 'Boş bırakılırsa ilkinden kopyalanır'}
                    required={group.key === 'bki_21_25'}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Paket Seçimi */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Package size={16} />
              Dahil Olacağı Paketler
            </label>
            {packages.length === 0 ? (
              <p className="text-sm text-gray-500 italic p-3 bg-black/20 rounded-lg border border-white/10">
                Henüz paket oluşturulmamış.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-24 overflow-y-auto p-1">
                {packages.map(pkg => (
                  <label 
                    key={pkg.id} 
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-sm",
                      formData.package_ids.includes(pkg.id)
                        ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                        : "bg-black/20 border-white/10 text-white hover:border-white/20"
                    )}
                  >
                    <input 
                      type="checkbox" 
                      checked={formData.package_ids.includes(pkg.id)}
                      onChange={() => togglePackage(pkg.id)}
                      className="accent-purple-500 w-4 h-4"
                    />
                    <span className="truncate">{pkg.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.02]"
            >
              <Save size={18} />
              {recipe ? 'Kaydet' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
