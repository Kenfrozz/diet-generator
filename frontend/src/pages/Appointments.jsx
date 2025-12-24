import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Plus, 
  Search,
  Trash2,
  Phone,
  Clock,
  User,
  CheckCircle,
  Edit2,
  MessageCircle,
  CalendarClock,
  Bell,
  X,
  StickyNote
} from 'lucide-react';
import { cn } from '../lib/utils';

// Constants moved outside component to prevent re-creation
const APPOINTMENT_TYPES = [
  { name: 'Ön görüşme', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { name: 'Ölçüm', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { name: 'Andulasyon', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  { name: 'Spor salonu ön görüşmesi', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' }
];

const API_URL = 'http://127.0.0.1:8000';

export default function Appointments() {

  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  
  // Filters
  const [search, setSearch] = useState('');
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

  
  // Notification state
  const [activeAlert, setActiveAlert] = useState(null);
  const notifiedRef = useRef(new Set());

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Load from API on mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Appointment alarm check every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      appointments.forEach(app => {
        if (app.status === 'cancelled') return;
        
        const appointmentDateTime = new Date(`${app.date}T${app.time}`);
        const timeDiff = appointmentDateTime - now;
        
        // Notify 15 minutes before
        const fifteenMinutes = 15 * 60 * 1000;
        const notifyKey = `${app.id}-${app.date}-${app.time}`;
        
        if (timeDiff > 0 && timeDiff <= fifteenMinutes && !notifiedRef.current.has(notifyKey)) {
          notifiedRef.current.add(notifyKey);
          
          // Play sound
          try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => console.log('Audio play failed', e));
          } catch { /* Audio play silently fails on some platforms */ }
          
          // System notification
          if (Notification.permission === 'granted') {
            new Notification(`🔔 Randevu Hatırlatıcı`, {
              body: `${app.clientName} - ${app.time}'da randevunuz var!`,
              icon: '/vite.svg',
              requireInteraction: true
            });
          }
          
          // In-app alert
          setActiveAlert({
            clientName: app.clientName,
            date: app.date,
            time: app.time,
            types: app.types,
            id: app.id
          });
        }
      });
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [appointments]);

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/appointments`);
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  }, []);

  const handleOpenModal = useCallback((app = null) => {
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
  }, []);

  const handleSaveAppointment = async (e) => {
      e.preventDefault();
      
      try {
        if (editingId) {
          // Update existing
          await fetch(`${API_URL}/api/appointments/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
        } else {
          // Create new
          await fetch(`${API_URL}/api/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
        }
        fetchAppointments();
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error saving appointment:', error);
      }
  };

  const handleDelete = useCallback(async (id) => {
      if (window.confirm('Bu randevuyu silmek istediğinize emin misiniz?')) {
          try {
            await fetch(`${API_URL}/api/appointments/${id}`, { method: 'DELETE' });
            fetchAppointments();
          } catch (error) {
            console.error('Error deleting appointment:', error);
          }
      }
  }, [fetchAppointments]);

  const openWhatsapp = useCallback((phone) => {
      if (!phone) return;
      // Clean phone number: remove spaces, parens, dashes. Ensure it starts with 90 if standard TR number
      let cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
      if (cleanPhone.length === 10) cleanPhone = '90' + cleanPhone;
      
      // Opens via shell.openExternal due to setWindowOpenHandler in main.cjs
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
      const matchesSearch = app.clientName.toLowerCase().includes(search.toLowerCase()) || 
                            (app.phone && app.phone.includes(search));
      const matchesDate = !dateFilter || app.date === dateFilter;
      const matchesService = serviceFilter === 'all' || (app.types && app.types.includes(serviceFilter));
      
      return matchesSearch && matchesDate && matchesService;
    }).sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
  }, [appointments, search, dateFilter, serviceFilter]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateFilter, serviceFilter]);

  return (
    <div className="h-full flex flex-col animate-in fade-in zoom-in duration-300">
      
      {/* Controls Header */}
      <div className="flex flex-col gap-4 p-6 pb-4">
        <div>
            <h1 className="text-2xl font-bold text-finrise-text mb-1">Randevu Listesi</h1>
        </div>

        {/* Filters Bar */}
        <div className="flex gap-2 p-3 bg-finrise-panel border border-finrise-border rounded-xl items-center">
             {/* Search */}
             <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-finrise-muted" size={16} />
                <input 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Ara..."
                    className="w-full bg-finrise-input border border-finrise-border rounded-lg pl-9 pr-3 py-2 text-sm text-finrise-text outline-none focus:border-finrise-accent placeholder:text-finrise-muted/70"
                />
            </div>

            {/* Date Filter */}
            <input 
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="bg-finrise-input border border-finrise-border rounded-lg px-2 py-2 text-sm text-finrise-text outline-none focus:border-finrise-accent cursor-pointer w-[130px] shrink-0"
            />

            {/* Service Filter - Hidden on small screens */}
             <select 
                value={serviceFilter}
                onChange={e => setServiceFilter(e.target.value)}
                className="bg-finrise-input border border-finrise-border rounded-lg px-2 py-2 text-sm text-finrise-text outline-none focus:border-finrise-accent cursor-pointer shrink-0 hidden lg:block"
            >
                <option value="all">Hizmetler</option>
                {APPOINTMENT_TYPES.map(type => (
                    <option key={type.name} value={type.name}>{type.name}</option>
                ))}
            </select>

            <button 
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 bg-finrise-accent text-white px-3 py-2 rounded-lg hover:bg-finrise-accent/90 transition-colors shadow-lg shadow-finrise-accent/20 shrink-0"
            >
                <Plus size={18} />
                <span className="font-medium hidden sm:inline">Yeni Randevu</span>
            </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <div className="bg-finrise-panel border border-finrise-border rounded-2xl overflow-hidden h-full flex flex-col">
            <div className="overflow-auto flex-1 custom-scrollbar">
                <table className="w-full text-left">
                    <thead className="bg-finrise-input/50 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3 text-xs font-semibold text-finrise-muted uppercase tracking-wider">Danışan</th>
                            <th className="px-4 py-3 text-xs font-semibold text-finrise-muted uppercase tracking-wider">Tarih</th>
                            <th className="px-4 py-3 text-xs font-semibold text-finrise-muted uppercase tracking-wider">Hizmetler</th>
                            <th className="px-4 py-3 text-xs font-semibold text-finrise-muted uppercase tracking-wider text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAppointments.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-4 py-12 text-center text-finrise-muted">
                                    <CalendarClock size={32} className="mx-auto mb-2 opacity-30" />
                                    <p>Randevu bulunamadı.</p>
                                </td>
                            </tr>
                        ) : (
                            currentAppointments.map((app, idx) => {
                                const isPast = new Date(app.date + 'T' + app.time) < new Date();
                                return (
                                <tr 
                                    key={app.id} 
                                    className={cn(
                                        "group transition-colors hover:bg-finrise-input/30",
                                        idx !== currentAppointments.length - 1 && "border-b border-finrise-border/50",
                                        isPast && "opacity-60 bg-finrise-input/10 grayscale-[0.5]"
                                    )}
                                >
                                    {/* Client */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-finrise-accent/10 flex items-center justify-center shrink-0">
                                                <User size={16} className="text-finrise-accent" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <div className="font-medium text-finrise-text truncate">{app.clientName}</div>
                                                    {app.note && (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setViewingNote({ text: app.note, client: app.clientName });
                                                            }}
                                                            className="flex items-center justify-center w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-white transition-all shadow-sm"
                                                            title="Notu var"
                                                        >
                                                            <StickyNote size={10} className="fill-current" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-finrise-muted truncate">{app.phone || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {/* Date & Time */}
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-medium text-finrise-text">
                                            {new Date(app.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                        </div>
                                        <div className="text-xs text-finrise-muted">{app.time}</div>
                                    </td>
                                    
                                    {/* Services */}
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {app.types && app.types.length > 0 ? app.types.map(t => {
                                                const typeDef = APPOINTMENT_TYPES.find(def => def.name === t);
                                                const colorClass = typeDef ? typeDef.color : 'bg-finrise-accent/10 text-finrise-accent border-finrise-accent/20';
                                                return (
                                                    <span key={t} className={cn("text-[11px] px-2 py-0.5 rounded border font-medium", colorClass)}>
                                                        {t}
                                                    </span>
                                                );
                                            }) : <span className="text-xs text-finrise-muted">-</span>}
                                        </div>
                                    </td>
                                    
                                    {/* Actions Only */}
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="flex items-center gap-1 transition-opacity">
                                                {app.phone && (
                                                    <button 
                                                        onClick={() => openWhatsapp(app.phone)}
                                                        className="p-1.5 rounded-lg text-green-500 hover:bg-green-500/10 transition-colors"
                                                        title="WhatsApp"
                                                    >
                                                        <MessageCircle size={16} />
                                                    </button>
                                                )}

                                                <button 
                                                    onClick={() => handleOpenModal(app)}
                                                    className="p-1.5 text-finrise-muted hover:text-finrise-accent hover:bg-finrise-input rounded-lg transition-colors"
                                                    title="Düzenle"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(app.id)}
                                                    className="p-1.5 text-finrise-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Sil"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {filteredAppointments.length > itemsPerPage && (
                <div className="border-t border-finrise-border bg-finrise-input/20 p-3 flex items-center justify-between">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                        className="px-3 py-1 text-xs font-medium text-finrise-muted hover:text-finrise-text disabled:opacity-50 disabled:hover:text-finrise-muted"
                    >
                        Önceki
                    </button>
                    <span className="text-xs text-finrise-muted">
                        Sayfa {currentPage} / {Math.ceil(filteredAppointments.length / itemsPerPage)}
                    </span>
                    <button 
                        disabled={currentPage === Math.ceil(filteredAppointments.length / itemsPerPage)}
                        onClick={() => setCurrentPage(c => Math.min(Math.ceil(filteredAppointments.length / itemsPerPage), c + 1))}
                        className="px-3 py-1 text-xs font-medium text-finrise-muted hover:text-finrise-text disabled:opacity-50 disabled:hover:text-finrise-muted"
                    >
                        Sonraki
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Add/Edit Modal - Compact Design */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-finrise-panel w-full max-w-lg rounded-2xl border border-finrise-border shadow-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-finrise-text">{editingId ? 'Randevuyu Düzenle' : 'Yeni Randevu'}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-finrise-muted hover:text-finrise-text"><X size={20} /></button>
                </div>
                
                <form onSubmit={handleSaveAppointment} className="space-y-3">
                    {/* Row 1: Name & Phone */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-finrise-muted" size={16} />
                            <input 
                                required
                                value={formData.clientName}
                                onChange={e => setFormData({...formData, clientName: e.target.value})}
                                placeholder="Danışan Adı"
                                className="w-full bg-finrise-input border border-finrise-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-finrise-text outline-none focus:border-finrise-accent"
                            />
                        </div>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-finrise-muted" size={16} />
                            <input 
                                type="tel"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                placeholder="Telefon"
                                className="w-full bg-finrise-input border border-finrise-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-finrise-text outline-none focus:border-finrise-accent"
                            />
                        </div>
                    </div>

                    {/* Row 2: Date & Time */}
                    <div className="grid grid-cols-2 gap-3">
                        <input 
                            type="date"
                            required
                            value={formData.date}
                            onChange={e => setFormData({...formData, date: e.target.value})}
                            className="w-full bg-finrise-input border border-finrise-border rounded-lg px-3 py-2.5 text-sm text-finrise-text outline-none focus:border-finrise-accent"
                        />
                        <input 
                            type="time"
                            required
                            value={formData.time}
                            onChange={e => setFormData({...formData, time: e.target.value})}
                            className="w-full bg-finrise-input border border-finrise-border rounded-lg px-3 py-2.5 text-sm text-finrise-text outline-none focus:border-finrise-accent"
                        />
                    </div>

                    {/* Row 3: Services - Horizontal chips */}
                    <div className="flex flex-wrap gap-2">
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
                                     "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all",
                                     formData.types.includes(type.name)
                                         ? "bg-finrise-accent/10 border-finrise-accent text-finrise-text"
                                         : "bg-finrise-input border-finrise-border text-finrise-muted hover:border-finrise-text"
                                 )}
                             >
                                  <div className={cn("w-2 h-2 rounded-full", type.color.replace('text-', 'bg-').split(' ')[0])} />
                                  {type.name}
                                  {formData.types.includes(type.name) && <CheckCircle size={12} className="text-finrise-accent" />}
                             </button>
                         ))}
                    </div>

                    {/* Row 4: Note - shorter */}
                    <textarea 
                        value={formData.note}
                        onChange={e => setFormData({...formData, note: e.target.value})}
                        placeholder="Not (opsiyonel)..."
                        className="w-full bg-finrise-input border border-finrise-border rounded-lg px-3 py-2 text-sm text-finrise-text outline-none focus:border-finrise-accent h-16 resize-none"
                    />

                    {/* Buttons */}
                    <div className="flex gap-3 pt-1">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-2.5 rounded-lg border border-finrise-border text-finrise-text hover:bg-finrise-input transition-colors text-sm font-medium"
                        >
                            İptal
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 py-2.5 rounded-lg bg-finrise-accent text-white hover:bg-finrise-accent/90 transition-colors text-sm font-medium shadow-lg shadow-finrise-accent/20"
                        >
                            {editingId ? 'Güncelle' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Note View Modal */}
      {viewingNote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setViewingNote(null)}>
            <div className="bg-finrise-panel w-full max-w-sm rounded-2xl border border-finrise-border shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                        <StickyNote size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-finrise-text">Randevu Notu</h3>
                        <p className="text-sm text-finrise-muted">{viewingNote.client}</p>
                    </div>
                </div>
                
                <div className="bg-finrise-input/50 rounded-xl p-4 text-sm text-finrise-text mb-6 max-h-[60vh] overflow-y-auto whitespace-pre-wrap">
                    {viewingNote.text}
                </div>

                <button 
                    onClick={() => setViewingNote(null)}
                    className="w-full py-2.5 rounded-lg bg-finrise-input hover:bg-finrise-border text-finrise-text transition-colors font-medium"
                >
                    Kapat
                </button>
            </div>
        </div>
      )}

      {/* In-App Notification Alert */}
      {activeAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-finrise-panel w-full max-w-sm rounded-2xl border border-finrise-accent/50 shadow-2xl shadow-finrise-accent/20 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-finrise-accent/20 flex items-center justify-center animate-pulse">
                <Bell className="text-finrise-accent" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-finrise-text">Randevu Hatırlatıcı</h3>
                <p className="text-sm text-finrise-muted">15 dakika kaldı!</p>
              </div>
            </div>
            
            <div className="bg-finrise-input/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-finrise-text font-medium">
                <User size={16} className="text-finrise-accent" />
                {activeAlert.clientName}
              </div>
              <div className="flex items-center gap-2 text-sm text-finrise-muted">
                <Clock size={14} />
                {activeAlert.time} - {new Date(activeAlert.date).toLocaleDateString('tr-TR')}
              </div>
              {activeAlert.types && activeAlert.types.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {activeAlert.types.map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded bg-finrise-accent/10 text-finrise-accent">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={() => setActiveAlert(null)}
              className="w-full py-3 rounded-xl bg-finrise-accent text-white font-medium hover:bg-finrise-accent/90 transition-colors"
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
