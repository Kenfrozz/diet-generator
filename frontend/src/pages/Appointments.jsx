import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search,
  Trash2,
  Phone,
  Calendar,
  Clock,
  User,
  MoreVertical,
  CheckCircle,
  XCircle,
  Filter,
  Edit2,
  MessageCircle,
  Activity,
  CalendarClock
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Appointments() {
  // Constants & Color Mapping
  const APPOINTMENT_TYPES = [
    { name: 'Ön görüşme', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    { name: 'Ölçüm', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
    { name: 'Andulasyon', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
    { name: 'Spor salonu ön görüşmesi', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' }
  ];

  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [serviceFilter, setServiceFilter] = useState('all');

  // Form State
  const [formData, setFormData] = useState({
      clientName: '',
      phone: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      types: [],
      note: ''
  });

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('appointments');
    if (saved) {
        setAppointments(JSON.parse(saved));
    } else {
        // Dummy data for demo
        setAppointments([
            {
                id: 1,
                date: new Date().toISOString().split('T')[0],
                time: '14:00',
                clientName: 'Ayşe Yılmaz',
                phone: '05551234567',
                types: ['Ön görüşme', 'Ölçüm'],
                status: 'confirmed',
                note: 'İlk görüşme'
            }
        ]);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  const handleOpenModal = (app = null) => {
      if (app) {
          setEditingId(app.id);
          setFormData({
              clientName: app.clientName,
              phone: app.phone || '',
              date: app.date,
              time: app.time,
              types: app.types || [],
              note: app.note || ''
          });
      } else {
          setEditingId(null);
          setFormData({ 
              clientName: '', 
              phone: '', 
              date: new Date().toISOString().split('T')[0], 
              time: '09:00', 
              types: [], 
              note: '' 
          });
      }
      setIsModalOpen(true);
  };

  const handleSaveAppointment = (e) => {
      e.preventDefault();
      
      if (editingId) {
          // Update existing
          setAppointments(appointments.map(app => 
              app.id === editingId 
                  ? { ...app, ...formData }
                  : app
          ));
      } else {
          // Create new
          const newApp = {
              id: Date.now(),
              ...formData,
              status: 'pending'
          };
          setAppointments([...appointments, newApp]);
      }
      setIsModalOpen(false);
  };

  const handleDelete = (id) => {
      if (window.confirm('Bu randevuyu silmek istediğinize emin misiniz?')) {
          setAppointments(appointments.filter(app => app.id !== id));
      }
  };

  const handleStatusChange = (id, newStatus) => {
        setAppointments(appointments.map(app => 
            app.id === id ? { ...app, status: newStatus } : app
        ));
  };

  const openWhatsapp = (phone) => {
      if (!phone) return;
      // Clean phone number: remove spaces, parens, dashes. Ensure it starts with 90 if standard TR number
      let cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
      if (cleanPhone.length === 10) cleanPhone = '90' + cleanPhone;
      
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const filteredAppointments = appointments.filter(app => {
      const matchesSearch = app.clientName.toLowerCase().includes(search.toLowerCase()) || 
                            (app.phone && app.phone.includes(search));
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesDate = !dateFilter || app.date === dateFilter;
      const matchesService = serviceFilter === 'all' || (app.types && app.types.includes(serviceFilter));
      
      return matchesSearch && matchesStatus && matchesDate && matchesService;
  }).sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));

  return (
    <div className="h-full flex flex-col animate-in fade-in zoom-in duration-300">
      
      {/* Controls Header */}
      <div className="flex flex-col gap-4 p-6 pb-4">
        <div>
            <h1 className="text-2xl font-bold text-finrise-text mb-1">Randevu Listesi</h1>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap gap-3 p-3 bg-finrise-panel border border-finrise-border rounded-xl items-center">
             {/* Search */}
             <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-finrise-muted" size={16} />
                <input 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="İsim veya telefon..."
                    className="w-full bg-finrise-input border border-finrise-border rounded-lg pl-9 pr-3 py-2 text-sm text-finrise-text outline-none focus:border-finrise-accent placeholder:text-finrise-muted/70"
                />
            </div>

            {/* Date Filter */}
            <div className="relative">
                <input 
                    type="date"
                    value={dateFilter}
                    onChange={e => setDateFilter(e.target.value)}
                    className="bg-finrise-input border border-finrise-border rounded-lg pl-3 pr-2 py-2 text-sm text-finrise-text outline-none focus:border-finrise-accent cursor-pointer"
                />
                {!dateFilter && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-finrise-muted pointer-events-none">Tüm Tarihler</span>}
                {dateFilter && (
                    <button 
                        onClick={() => setDateFilter('')}
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-finrise-muted hover:text-finrise-text"
                    >
                        <XCircle size={14} />
                    </button>
                )}
            </div>

            {/* Service Filter */}
             <select 
                value={serviceFilter}
                onChange={e => setServiceFilter(e.target.value)}
                className="bg-finrise-input border border-finrise-border rounded-lg px-3 py-2 text-sm text-finrise-text outline-none focus:border-finrise-accent cursor-pointer"
            >
                <option value="all">Tüm Hizmetler</option>
                {APPOINTMENT_TYPES.map(type => (
                    <option key={type.name} value={type.name}>{type.name}</option>
                ))}
            </select>

            {/* Status Filter */}
            <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-finrise-input border border-finrise-border rounded-lg px-3 py-2 text-sm text-finrise-text outline-none focus:border-finrise-accent cursor-pointer"
            >
                <option value="all">Tüm Durumlar</option>
                <option value="pending">Bekliyor</option>
                <option value="confirmed">Onaylandı</option>
                <option value="cancelled">İptal</option>
            </select>

            <div className="w-px h-8 bg-finrise-border mx-1 hidden md:block"></div>

            <button 
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 bg-finrise-accent text-white px-4 py-2 rounded-lg hover:bg-finrise-accent/90 transition-colors shadow-lg shadow-finrise-accent/20 whitespace-nowrap"
            >
                <Plus size={18} />
                <span className="font-medium">Yeni Randevu</span>
            </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <div className="bg-finrise-panel border border-finrise-border rounded-2xl overflow-hidden h-full flex flex-col">
            <div className="overflow-auto flex-1 custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-finrise-input sticky top-0 z-10">
                        <tr>
                            <th className="p-4 font-semibold text-finrise-text border-b border-finrise-border w-[25%]">Danışan</th>
                            <th className="p-4 font-semibold text-finrise-text border-b border-finrise-border w-[15%]">Tarih & Saat</th>
                            <th className="p-4 font-semibold text-finrise-text border-b border-finrise-border w-[25%]">Hizmetler</th>
                            <th className="p-4 font-semibold text-finrise-text border-b border-finrise-border w-[20%]">Not</th>
                            <th className="p-4 font-semibold text-finrise-text border-b border-finrise-border w-[15%] text-center">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-finrise-border">
                        {filteredAppointments.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-finrise-muted">
                                    Randevu bulunamadı.
                                </td>
                            </tr>
                        ) : (
                            filteredAppointments.map(app => (
                                <tr key={app.id} className="hover:bg-finrise-input/50 transition-colors group">
                                    <td className="p-4">
                                        <div className="font-bold text-finrise-text">{app.clientName}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                             <div className="text-xs text-finrise-muted flex items-center gap-1">
                                                <Phone size={10} />
                                                {app.phone || '-'}
                                            </div>
                                            {app.phone && (
                                                <button 
                                                    onClick={() => openWhatsapp(app.phone)}
                                                    className="p-1 rounded bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                                                    title="WhatsApp'tan Yaz"
                                                >
                                                    <MessageCircle size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-sm text-finrise-text font-medium">
                                                <Calendar size={14} className="text-finrise-accent" />
                                                {new Date(app.date).toLocaleDateString('tr-TR')}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-finrise-muted">
                                                <Clock size={12} />
                                                {app.time}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {app.types && app.types.length > 0 ? app.types.map(t => {
                                                const typeDef = APPOINTMENT_TYPES.find(def => def.name === t);
                                                const colorClass = typeDef ? typeDef.color : 'bg-finrise-accent/10 text-finrise-accent border-finrise-accent/20';
                                                return (
                                                    <span key={t} className={cn("text-[10px] px-2 py-0.5 rounded-md border font-medium", colorClass)}>
                                                        {t}
                                                    </span>
                                                );
                                            }) : <span className="text-xs text-finrise-muted">-</span>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm text-finrise-muted line-clamp-2" title={app.note}>{app.note || '-'}</p>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <select 
                                                value={app.status}
                                                onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                                className={cn(
                                                    "text-[10px] font-bold px-2 py-1 rounded-md border outline-none appearance-none cursor-pointer text-center min-w-[80px]",
                                                    app.status === 'confirmed' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                                    app.status === 'cancelled' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                    "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                                )}
                                            >
                                                <option value="pending">Bekliyor</option>
                                                <option value="confirmed">Onaylandı</option>
                                                <option value="cancelled">İptal</option>
                                            </select>
                                            
                                            <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleOpenModal(app)}
                                                    className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                                    title="Düzenle"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(app.id)}
                                                    className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                    title="Sil"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-finrise-panel w-full max-w-md rounded-2xl border border-finrise-border shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-finrise-text">{editingId ? 'Randevuyu Düzenle' : 'Yeni Randevu'}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-finrise-muted hover:text-finrise-text"><XCircle size={24} /></button>
                </div>
                
                <form onSubmit={handleSaveAppointment} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-finrise-text">Danışan Adı</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-finrise-muted" size={18} />
                            <input 
                                required
                                value={formData.clientName}
                                onChange={e => setFormData({...formData, clientName: e.target.value})}
                                placeholder="Ad Soyad"
                                className="w-full bg-finrise-input border border-finrise-border rounded-xl pl-10 pr-4 py-3 text-finrise-text outline-none focus:border-finrise-accent"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                         <label className="text-sm font-medium text-finrise-text">Telefon Numarası</label>
                         <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-finrise-muted" size={18} />
                            <input 
                                type="tel"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                placeholder="0555 555 55 55"
                                className="w-full bg-finrise-input border border-finrise-border rounded-xl pl-10 pr-4 py-3 text-finrise-text outline-none focus:border-finrise-accent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-finrise-text">Tarih</label>
                            <input 
                                type="date"
                                required
                                value={formData.date}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                                className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-3 text-finrise-text outline-none focus:border-finrise-accent"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-finrise-text">Saat (24s)</label>
                            <input 
                                type="time"
                                required
                                value={formData.time}
                                onChange={e => setFormData({...formData, time: e.target.value})}
                                className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-3 text-finrise-text outline-none focus:border-finrise-accent"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-finrise-text">Hizmet Seçimi</label>
                        <div className="grid grid-cols-1 gap-2">
                             {APPOINTMENT_TYPES.map(type => (
                                 <button
                                     key={type.name}
                                     type="button"
                                     onClick={() => {
                                         const newTypes = formData.types.includes(type.name)
                                             ? formData.types.filter(t => t !== type.name)
                                             : [...formData.types, type.name];
                                         setFormData({...formData, types: newTypes});
                                     }}
                                     className={cn(
                                         "flex items-center gap-3 px-3 py-2 rounded-lg border transition-all text-left",
                                         formData.types.includes(type.name)
                                             ? "bg-finrise-accent/10 border-finrise-accent ring-1 ring-finrise-accent/50"
                                             : "bg-finrise-input border-finrise-border hover:border-finrise-text"
                                     )}
                                 >
                                      <div className={cn("w-3 h-3 rounded-full border", type.color.replace('text-', 'bg-').split(' ')[0])} />
                                      <span className={cn("text-sm font-medium", formData.types.includes(type.name) ? "text-finrise-text" : "text-finrise-muted")}>
                                          {type.name}
                                      </span>
                                      {formData.types.includes(type.name) && <CheckCircle size={16} className="ml-auto text-finrise-accent" />}
                                 </button>
                             ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-finrise-text">Not</label>
                        <textarea 
                            value={formData.note}
                            onChange={e => setFormData({...formData, note: e.target.value})}
                            placeholder="Görüşme notu..."
                            className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-3 text-finrise-text outline-none focus:border-finrise-accent min-h-[100px] resize-none"
                        />
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
                            {editingId ? 'Güncelle' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
