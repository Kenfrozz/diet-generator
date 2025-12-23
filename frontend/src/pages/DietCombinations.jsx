import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  UtensilsCrossed, 
  Calendar,
  Layers,
  FileText
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

export default function DietCombinations() {
  const [search, setSearch] = useState('');
  
  // Mock Data
  const [combinations, setCombinations] = useState([
    { id: 1, name: 'Detoks + Keto', duration: 14, description: '1 Hafta Detoks ardından 1 Hafta Keto', code: 'DTX-KETO-14' },
    { id: 2, name: 'Aralıklı Oruç + Low Carb', duration: 21, description: '16:8 IF düzeni ile düşük karbonhidrat', code: 'IF-LC-21' },
    { id: 3, name: 'Glutensiz + Vegan', duration: 30, description: 'Tamamen bitkisel ve glutensiz beslenme', code: 'GF-VGN-30' },
  ]);

  const filtered = combinations.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-finrise-text mb-2">Diyet Kombinasyonları</h1>
          <p className="text-finrise-muted">Farklı diyet türlerini birleştirerek oluşturulan paketler.</p>
        </div>
        <button className="flex items-center gap-2 bg-finrise-accent hover:bg-finrise-accent/90 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-finrise-accent/20">
          <Plus className="w-5 h-5" />
          Yeni Kombinasyon
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-finrise-panel p-4 rounded-xl border border-finrise-border shadow-sm">
        <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-finrise-muted" />
            <input 
                type="text" 
                placeholder="Kombinasyon ara (Kod veya İsim)..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-finrise-input border border-finrise-border rounded-lg pl-10 pr-4 py-2.5 text-finrise-text placeholder-finrise-muted focus:outline-none focus:border-finrise-accent/50 transition-colors"
            />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(combo => (
           <div key={combo.id} className="group bg-finrise-panel border border-finrise-border hover:border-finrise-accent/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-finrise-accent/10 relative overflow-hidden">
               <div className="flex justify-between items-start mb-4">
                   <div className="w-12 h-12 rounded-xl bg-finrise-accent/10 text-finrise-accent flex items-center justify-center group-hover:bg-finrise-accent group-hover:text-white transition-colors">
                       <UtensilsCrossed size={24} />
                   </div>
                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-finrise-input rounded-lg text-finrise-muted hover:text-finrise-text transition-colors"><Edit2 size={16} /></button>
                      <button className="p-2 hover:bg-finrise-input rounded-lg text-finrise-muted hover:text-finrise-red transition-colors"><Trash2 size={16} /></button>
                   </div>
               </div>

               <h3 className="text-lg font-bold text-finrise-text mb-1">{combo.name}</h3>
               <div className="text-xs font-mono text-finrise-muted mb-4 bg-finrise-input px-2 py-1 rounded w-fit">{combo.code}</div>
               
               <p className="text-sm text-finrise-text/70 mb-6 line-clamp-2">{combo.description}</p>

               <div className="flex items-center gap-4 text-sm text-finrise-muted pt-4 border-t border-finrise-border">
                   <div className="flex items-center gap-1.5">
                       <Calendar size={14} className="text-finrise-accent" />
                       {combo.duration} Gün
                   </div>
                   <div className="flex items-center gap-1.5">
                       <Layers size={14} className="text-finrise-accent" />
                       2 Aşama
                   </div>
               </div>
           </div>
        ))}
      </div>
    </div>
  );
}
