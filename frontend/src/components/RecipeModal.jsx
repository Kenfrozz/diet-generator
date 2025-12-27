import { useState, useEffect } from 'react';
import { X, Save, Package, Copy, Sun, Snowflake, Coffee, Sandwich, Utensils, Apple, Moon, Milk, GlassWater, UtensilsCrossed, Pencil } from 'lucide-react';
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
    seasons: '',
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
        seasons: '',
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
    
    // Pass package_ids to onSave - it will handle the API call
    await onSave(recipePayload, formData.package_ids);
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-200">
      <div className="bg-finrise-panel border border-finrise-border rounded-2xl w-full max-w-3xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-finrise-border bg-finrise-input/30">
          <h2 className="text-lg font-semibold text-finrise-text flex items-center gap-2">
            {recipe ? <Pencil size={18} className="text-finrise-accent" /> : <UtensilsCrossed size={18} className="text-finrise-accent" />}
            {recipe ? 'Tarifi Düzenle' : 'Yeni Tarif Ekle'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-finrise-input rounded-lg text-finrise-muted hover:text-finrise-text transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            
            {/* Üst Bölüm - Temel Bilgiler */}
            <div className="bg-finrise-input/30 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="flex-1 bg-finrise-panel border border-finrise-border rounded-lg px-4 py-2.5 text-finrise-text focus:outline-none focus:border-finrise-accent focus:ring-1 focus:ring-finrise-accent/20 transition-all"
                  placeholder="Tarif adı girin..."
                />
                
                <select
                  value={formData.meal_type}
                  onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
                  className="bg-finrise-panel border border-finrise-border rounded-lg px-3 py-2.5 text-finrise-text text-sm focus:outline-none focus:border-finrise-accent transition-all"
                >
                  <option value="kahvalti">Kahvaltı</option>
                  <option value="ara_ogun_1">Ara Öğün 1</option>
                  <option value="ogle">Öğle</option>
                  <option value="ara_ogun_2">Ara Öğün 2</option>
                  <option value="aksam">Akşam</option>
                  <option value="ara_ogun_3">Ara Öğün 3</option>
                  <option value="ozel_icecek">İçecek</option>
                </select>

                {/* Mevsim */}
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => toggleSeason('yaz')}
                    className={cn(
                      "p-2.5 rounded-lg border transition-all",
                      formData.seasons.includes('yaz') 
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-400" 
                        : "bg-finrise-panel border-finrise-border text-finrise-muted hover:text-finrise-text"
                    )}
                    title="Yaz"
                  >
                    <Sun size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSeason('kis')}
                    className={cn(
                      "p-2.5 rounded-lg border transition-all",
                      formData.seasons.includes('kis') 
                        ? "bg-sky-500/20 border-sky-500/50 text-sky-400" 
                        : "bg-finrise-panel border-finrise-border text-finrise-muted hover:text-finrise-text"
                    )}
                    title="Kış"
                  >
                    <Snowflake size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* BKİ İçerikleri */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-finrise-text">BKİ Gruplarına Göre İçerikler</h3>
                <button
                  type="button"
                  onClick={copyToAll}
                  className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-finrise-accent/10 hover:bg-finrise-accent/20 text-finrise-accent transition-colors"
                >
                  <Copy size={12} />
                  Boşlara Kopyala
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {BKI_GROUPS.map((group) => (
                  <div 
                    key={group.key} 
                    className={cn(
                      "rounded-lg border-l-2 bg-finrise-input/30 p-2.5",
                      group.color === 'emerald' && 'border-l-emerald-500',
                      group.color === 'yellow' && 'border-l-yellow-500',
                      group.color === 'orange' && 'border-l-orange-500',
                      group.color === 'red' && 'border-l-red-500'
                    )}
                  >
                    <label className={cn("text-xs font-medium mb-1.5 block", getLabelColor(group.color))}>
                      {group.label}
                    </label>
                    <textarea
                      rows={2}
                      value={formData[group.key]}
                      onChange={(e) => setFormData({ ...formData, [group.key]: e.target.value })}
                      className="w-full bg-finrise-panel border border-finrise-border rounded-lg px-3 py-2 text-finrise-text text-sm focus:outline-none focus:border-finrise-accent transition-all resize-none"
                      placeholder={group.key === 'bki_21_25' ? 'İçerik girin (zorunlu)' : 'Opsiyonel'}
                      required={group.key === 'bki_21_25'}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Paket Seçimi */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-finrise-text flex items-center gap-2">
                  <Package size={14} className="text-finrise-accent" />
                  Paketler
                  {formData.package_ids.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-finrise-accent/20 text-finrise-accent">
                      {formData.package_ids.length} seçili
                    </span>
                  )}
                </h3>
              </div>
              
              {packages.length === 0 ? (
                <p className="text-sm text-finrise-muted italic py-4 text-center">
                  Henüz paket oluşturulmamış
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 p-3 bg-finrise-input/30 rounded-xl">
                  {packages.map(pkg => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => togglePackage(pkg.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                        formData.package_ids.includes(pkg.id)
                          ? "bg-finrise-accent text-white shadow-md shadow-finrise-accent/20"
                          : "bg-finrise-panel border border-finrise-border text-finrise-muted hover:text-finrise-text hover:border-finrise-accent/50"
                      )}
                    >
                      {pkg.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-finrise-border bg-finrise-input/20">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-finrise-muted hover:text-finrise-text hover:bg-finrise-input transition-colors font-medium"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-finrise-accent hover:bg-finrise-accent/90 text-white font-medium shadow-lg shadow-finrise-accent/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Save size={16} />
              {recipe ? 'Kaydet' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
