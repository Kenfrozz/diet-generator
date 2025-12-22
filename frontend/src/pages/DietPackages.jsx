import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Package, 
  Folder, 
  FileText, 
  TrendingDown, 
  Calendar,
  XCircle 
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function DietPackages() {
  const [packages, setPackages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
      name: '',
      path: '',
      fileCount: 0,
      weightChange: '',
      duration: 0
  });

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('dietPackages');
    if (saved) {
        setPackages(JSON.parse(saved));
    } else {
        // Mock data
        setPackages([
            {
                id: 1,
                name: 'Hızlı Ödem Atıcı',
                path: 'C:/Diyetler/OdemAtici',
                fileCount: 3,
                weightChange: '2-3 kg',
                duration: 7
            },
            {
                id: 2,
                name: 'Ketojenik Başlangıç',
                path: 'C:/Diyetler/Keto1',
                fileCount: 5,
                weightChange: '4-5 kg',
                duration: 21
            }
        ]);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('dietPackages', JSON.stringify(packages));
  }, [packages]);

  const handleOpenModal = (pkg = null) => {
      if (pkg) {
          setEditingId(pkg.id);
          setFormData({
              name: pkg.name,
              path: pkg.path,
              fileCount: pkg.fileCount,
              weightChange: pkg.weightChange,
              duration: pkg.duration
          });
      } else {
          setEditingId(null);
          setFormData({
              name: '',
              path: '',
              fileCount: 0,
              weightChange: '',
              duration: 0
          });
      }
      setIsModalOpen(true);
  };

  const handleSave = (e) => {
      e.preventDefault();
      const sanitizedData = {
          ...formData,
          fileCount: Number(formData.fileCount) || 0,
          duration: Number(formData.duration) || 0
      };

      if (editingId) {
          setPackages(packages.map(p => 
              p.id === editingId ? { ...p, ...sanitizedData } : p
          ));
      } else {
          setPackages([...packages, { id: Date.now(), ...sanitizedData }]);
      }
      setIsModalOpen(false);
  };

  const handleDelete = (id) => {
      if (window.confirm('Bu paketi silmek istediğinize emin misiniz?')) {
          setPackages(packages.filter(p => p.id !== id));
      }
  };

  const filteredPackages = packages.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col animate-in fade-in zoom-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col gap-4 p-6 pb-4">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-finrise-text mb-1">Diyet Paketleri</h1>
                <p className="text-finrise-muted">Hazır diyet şablon paketlerini yönetin</p>
            </div>
            <button 
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 bg-finrise-accent text-white px-4 py-2 rounded-lg hover:bg-finrise-accent/90 transition-colors shadow-lg shadow-finrise-accent/20"
            >
                <Plus size={18} />
                <span className="font-medium">Yeni Paket</span>
            </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 p-3 bg-finrise-panel border border-finrise-border rounded-xl">
            <Search className="text-finrise-muted ml-1" size={18} />
            <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Paket ara..."
                className="flex-1 bg-transparent text-finrise-text outline-none placeholder:text-finrise-muted"
            />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <div className="bg-finrise-panel border border-finrise-border rounded-2xl overflow-hidden h-full flex flex-col">
            <div className="overflow-auto flex-1 custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-finrise-input sticky top-0 z-10">
                        <tr>
                            <th className="p-4 font-semibold text-finrise-text border-b border-finrise-border w-[30%]">Paket Adı</th>
                            <th className="p-4 font-semibold text-finrise-text border-b border-finrise-border w-[25%]">Kayıt Yolu</th>
                            <th className="p-4 font-semibold text-finrise-text border-b border-finrise-border w-[10%] text-center">Liste Sayısı</th>
                            <th className="p-4 font-semibold text-finrise-text border-b border-finrise-border w-[15%]">Kilo Değişimi</th>
                            <th className="p-4 font-semibold text-finrise-text border-b border-finrise-border w-[10%] text-center">Liste Süresi</th>
                            <th className="p-4 font-semibold text-finrise-text border-b border-finrise-border w-[10%] text-center">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-finrise-border">
                        {filteredPackages.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-finrise-muted">
                                    Paket bulunamadı.
                                </td>
                            </tr>
                        ) : (
                            filteredPackages.map(pkg => (
                                <tr key={pkg.id} className="hover:bg-finrise-input/50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                                                <Package size={20} />
                                            </div>
                                            <div className="font-bold text-finrise-text">{pkg.name}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-finrise-muted font-mono bg-finrise-input/50 px-2 py-1 rounded inline-flex max-w-full overflow-hidden">
                                            <Folder size={14} className="shrink-0" />
                                            <span className="truncate">{pkg.path}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium">
                                            <FileText size={14} />
                                            {pkg.fileCount}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-500">
                                            <TrendingDown size={16} />
                                            {pkg.weightChange}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="inline-flex items-center gap-1.5 text-sm text-finrise-text">
                                            <Calendar size={14} className="text-finrise-muted" />
                                            {pkg.duration} Gün
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                         <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleOpenModal(pkg)}
                                                className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(pkg.id)}
                                                className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-finrise-panel w-full max-w-lg rounded-2xl border border-finrise-border shadow-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-finrise-text">{editingId ? 'Paketi Düzenle' : 'Yeni Diyet Paketi'}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-finrise-muted hover:text-finrise-text"><XCircle size={24} /></button>
                </div>
                
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-finrise-text">Paket Adı</label>
                        <input 
                            required
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            placeholder="Örn: Hızlı Ödem Atıcı"
                            className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-3 text-finrise-text outline-none focus:border-finrise-accent"
                        />
                    </div>

                    <div className="space-y-2">
                         <label className="text-sm font-medium text-finrise-text">Kayıt Yolu (Klasör)</label>
                         <div className="relative">
                            <Folder className="absolute left-3 top-1/2 -translate-y-1/2 text-finrise-muted" size={18} />
                            <input 
                                value={formData.path}
                                onChange={e => setFormData({...formData, path: e.target.value})}
                                placeholder="C:/Diyetler/..."
                                className="w-full bg-finrise-input border border-finrise-border rounded-xl pl-10 pr-4 py-3 text-finrise-text outline-none focus:border-finrise-accent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-finrise-text">Liste Sayısı</label>
                            <input 
                                type="number"
                                min="0"
                                value={formData.fileCount}
                                onChange={e => setFormData({...formData, fileCount: e.target.value === '' ? '' : parseInt(e.target.value)})}
                                className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-3 text-finrise-text outline-none focus:border-finrise-accent no-spinner"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-finrise-text">Liste Süresi (Gün)</label>
                            <input 
                                type="number"
                                min="0"
                                value={formData.duration}
                                onChange={e => setFormData({...formData, duration: e.target.value === '' ? '' : parseInt(e.target.value)})}
                                className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-3 text-finrise-text outline-none focus:border-finrise-accent no-spinner"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-finrise-text">Beklenen Kilo Değişimi</label>
                        <div className="relative">
                            <TrendingDown className="absolute left-3 top-1/2 -translate-y-1/2 text-finrise-muted" size={18} />
                            <input 
                                value={formData.weightChange}
                                onChange={e => setFormData({...formData, weightChange: e.target.value})}
                                placeholder="Örn: 3-4 kg"
                                className="w-full bg-finrise-input border border-finrise-border rounded-xl pl-10 pr-4 py-3 text-finrise-text outline-none focus:border-finrise-accent"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-3 rounded-xl border border-finrise-border text-finrise-text hover:bg-finrise-input transition-colors font-medium"
                        >
                            İptal
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 py-3 rounded-xl bg-finrise-accent text-white hover:bg-finrise-accent/90 transition-colors font-medium shadow-lg shadow-finrise-accent/20"
                        >
                            Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
