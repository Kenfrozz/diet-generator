import { useState, useEffect } from 'react';
import { X, Save, Package } from 'lucide-react';
import { cn } from '../lib/utils';

const API_URL = 'http://127.0.0.1:8000';

export function RecipeModal({ isOpen, onClose, onSave, recipe }) {
  const [packages, setPackages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    meal_type: 'kahvalti',
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
        name: recipe.name,
        content: recipe.content || '',
        meal_type: recipe.meal_type || 'kahvalti',
        package_ids: []
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        content: '',
        meal_type: 'kahvalti',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Tarifi kaydet (eski API uyumlu)
    const recipePayload = {
      name: formData.name,
      content: formData.content,
      meal_type: formData.meal_type,
      pool_type: 'legacy' // Geriye uyumluluk için
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Tarif Adı</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                placeholder="Örn: Avokado Salatası"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Öğün Tipi</label>
              <select
                value={formData.meal_type}
                onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
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

          {/* Paket Seçimi */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Package size={16} />
              Dahil Olacağı Paketler
            </label>
            {packages.length === 0 ? (
              <p className="text-sm text-gray-500 italic p-3 bg-black/20 rounded-lg border border-white/10">
                Henüz paket oluşturulmamış. Önce "Diyet Paketleri" sayfasından paket ekleyin.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-1">
                {packages.map(pkg => (
                  <label 
                    key={pkg.id} 
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all",
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
                    <span className="text-sm font-medium truncate">{pkg.name}</span>
                  </label>
                ))}
              </div>
            )}
            {formData.package_ids.length > 0 && (
              <p className="text-xs text-purple-400">
                {formData.package_ids.length} paket seçildi
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Tarif İçeriği</label>
            <textarea
              required
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none font-mono text-sm leading-relaxed"
              placeholder="Tarif detaylarını buraya giriniz..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.02]"
            >
              <Save size={18} />
              {recipe ? 'Değişiklikleri Kaydet' : 'Tarifi Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
