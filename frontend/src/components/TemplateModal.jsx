import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, GripVertical } from 'lucide-react';

const MEAL_TYPES = [
  { value: 'kahvalti', label: 'Kahvaltı' },
  { value: 'ara_ogun_1', label: 'Ara Öğün 1' },
  { value: 'ogle', label: 'Öğle Yemeği' },
  { value: 'ara_ogun_2', label: 'Ara Öğün 2' },
  { value: 'aksam', label: 'Akşam Yemeği' },
  { value: 'ara_ogun_3', label: 'Ara Öğün 3' },
  { value: 'ozel_icecek', label: 'Özel İçecek' }
];

export default function TemplateModal({ isOpen, onClose, onSave, initialData }) {
  const [name, setName] = useState('');
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setMeals(initialData.meals.map(m => ({
          time: m[0],      // tuple index 0
          meal_name: m[1], // tuple index 1
          meal_type: m[2]  // tuple index 2
        })));
      } else {
        setName('');
        setMeals([
            { time: '08:00', meal_name: 'Kahvaltı', meal_type: 'kahvalti' },
            { time: '12:00', meal_name: 'Öğle Yemeği', meal_type: 'ogle' },
            { time: '18:00', meal_name: 'Akşam Yemeği', meal_type: 'aksam' }
        ]);
      }
    }
  }, [isOpen, initialData]);

  const handleAddMeal = () => {
    setMeals([...meals, { time: '10:00', meal_name: 'Yeni Öğün', meal_type: 'ara_ogun_1' }]);
  };

  const handleRemoveMeal = (index) => {
    const newMeals = [...meals];
    newMeals.splice(index, 1);
    setMeals(newMeals);
  };

  const handleMealChange = (index, field, value) => {
    const newMeals = [...meals];
    newMeals[index][field] = value;
    setMeals(newMeals);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, meals });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1e222b] rounded-2xl w-full max-w-3xl shadow-2xl border border-white/10 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-semibold text-white">
            {initialData ? 'Şablonu Düzenle' : 'Yeni Şablon Oluştur'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="template-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Template Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Şablon Adı</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: 2 Öğünlü Detoks"
                className="w-full bg-[#151921] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-all font-medium"
              />
            </div>

            {/* Meals List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Öğün Planı</label>
                <button
                  type="button"
                  onClick={handleAddMeal}
                  className="text-xs bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
                >
                  <Plus size={14} />
                  Öğün Ekle
                </button>
              </div>

              <div className="space-y-2">
                {meals.map((meal, index) => (
                  <div key={index} className="group flex items-center gap-3 bg-[#151921] border border-white/5 p-3 rounded-xl hover:border-white/10 transition-colors">
                    
                    <div className="text-gray-600 cursor-move">
                        <GripVertical size={16} />
                    </div>

                    <div className="w-24">
                        <input
                            type="time"
                            required
                            value={meal.time}
                            onChange={(e) => handleMealChange(index, 'time', e.target.value)}
                            className="w-full bg-transparent text-white text-sm font-mono border border-white/10 rounded-lg px-2 py-2 focus:outline-none focus:border-purple-500/50 text-center"
                        />
                    </div>

                    <div className="flex-1">
                        <input
                            type="text"
                            required
                            value={meal.meal_name}
                            onChange={(e) => handleMealChange(index, 'meal_name', e.target.value)}
                            placeholder="Öğün Adı (Görünen)"
                            className="w-full bg-transparent text-white text-sm border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500/50"
                        />
                    </div>

                    <div className="w-40">
                        <select
                            value={meal.meal_type}
                            onChange={(e) => handleMealChange(index, 'meal_type', e.target.value)}
                            className="w-full bg-[#1e222b] text-white text-sm border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
                        >
                            {MEAL_TYPES.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={() => handleRemoveMeal(index)}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Öğünü Sil"
                    >
                        <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {meals.length === 0 && (
                    <div className="text-center py-6 text-gray-500 border border-dashed border-white/10 rounded-xl">
                        Henüz öğün eklenmemiş.
                    </div>
                )}
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-[#1e222b] rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium"
          >
            İptal
          </button>
          <button
            type="submit"
            form="template-form"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save size={18} />
            Kaydet
          </button>
        </div>

      </div>
    </div>
  );
}
