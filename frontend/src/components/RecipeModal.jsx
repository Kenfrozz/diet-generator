import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { cn } from '../lib/utils';

export function RecipeModal({ isOpen, onClose, onSave, recipe, pools }) {
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    meal_type: 'kahvalti',
    pool_type: 'standart'
  });

  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name,
        content: recipe.content || '',
        meal_type: recipe.meal_type || 'kahvalti',
        pool_type: recipe.pool_type || 'standart'
      });
    } else {
      setFormData({
        name: '',
        content: '',
        meal_type: 'kahvalti',
        pool_type: 'standart'
      });
    }
  }, [recipe, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
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
                <option value="ogle">Öğle Yemeği</option>
                <option value="aksam">Akşam Yemeği</option>
                <option value="ara_ogun">Ara Öğün</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Havuz Seçimi</label>
            <select
                value={formData.pool_type}
                onChange={(e) => setFormData({ ...formData, pool_type: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
            >
                {pools.map(pool => (
                    <option key={pool.id} value={pool.name}>{pool.description || pool.name}</option>
                ))}
            </select>
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
