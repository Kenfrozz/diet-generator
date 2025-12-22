import { useState, useEffect } from 'react';
import { Users, Search, Plus, Filter, MoreVertical, Phone, Mail, User, CheckCircle, XCircle, Trash2, Edit2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    status: 'active',
    note: ''
  });

  // Initialize from localStorage
  useEffect(() => {
    const savedClients = localStorage.getItem('finrise_clients');
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    } else {
      // Seed data
      const initial = [
        { id: '1', name: 'Ayşe Yılmaz', phone: '0555 123 45 67', email: 'ayse@example.com', status: 'active', joinDate: '2024-12-01' },
         { id: '2', name: 'Mehmet Demir', phone: '0532 987 65 43', email: 'mehmet@example.com', status: 'passive', joinDate: '2024-11-15' },
      ];
      setClients(initial);
      localStorage.setItem('finrise_clients', JSON.stringify(initial));
    }
  }, []);

  // Save on change
  useEffect(() => {
    if (clients.length > 0 || localStorage.getItem('finrise_clients')) {
       localStorage.setItem('finrise_clients', JSON.stringify(clients));
    }
  }, [clients]);

  const handleSave = (e) => {
    e.preventDefault();
    if (editingClient) {
      setClients(clients.map(c => c.id === editingClient.id ? { ...c, ...formData } : c));
    } else {
      const newClient = {
        id: Date.now().toString(),
        ...formData,
        joinDate: new Date().toISOString().split('T')[0]
      };
      setClients([newClient, ...clients]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if(window.confirm("Bu danışanı silmek istediğinize emin misiniz?")) {
        setClients(clients.filter(c => c.id !== id));
    }
  };

  const openModal = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({ name: client.name, phone: client.phone, email: client.email, status: client.status, note: client.note || '' });
    } else {
      setEditingClient(null);
      setFormData({ name: '', phone: '', email: '', status: 'active', note: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-finrise-text mb-2">Danışanlar</h1>
          <p className="text-finrise-muted">Tüm danışanlarınızı buradan yönetebilirsiniz.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-finrise-accent hover:bg-finrise-accent/90 text-white font-medium shadow-lg hover:scale-[1.02] transition-all"
        >
          <Plus size={20} />
          Yeni Danışan Ekle
        </button>
      </div>

      {/* Filters */}
      <div className="bg-finrise-panel border border-finrise-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-finrise-muted w-5 h-5" />
          <input 
            type="text" 
            placeholder="İsim veya e-posta ile ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-finrise-input border border-finrise-border rounded-xl pl-10 pr-4 py-3 text-finrise-text focus:border-finrise-accent outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
           <button className="p-3 bg-finrise-input border border-finrise-border rounded-xl text-finrise-muted hover:text-finrise-text transition-colors">
             <Filter size={20} />
           </button>
        </div>
      </div>

      {/* Client List */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {filteredClients.map((client) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-finrise-panel border border-finrise-border rounded-2xl p-6 hover:border-finrise-accent/30 transition-all shadow-sm group"
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-finrise-input flex items-center justify-center text-finrise-muted border border-finrise-border shrink-0">
                  <User size={32} />
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left space-y-1">
                  <h3 className="text-xl font-bold text-finrise-text">{client.name}</h3>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-finrise-muted">
                    <span className="flex items-center gap-1">
                      <Phone size={14} /> {client.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail size={14} /> {client.email}
                    </span>
                    <span className="flex items-center gap-1 font-mono opacity-80">
                      ID: {client.id}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="px-4 py-2 rounded-lg bg-finrise-input border border-finrise-border flex items-center gap-2">
                    {client.status === 'active' ? (
                        <>
                          <div className="w-2.5 h-2.5 rounded-full bg-finrise-green shadow-[0_0_8px_rgba(var(--color-green),0.5)]" />
                          <span className="text-sm font-medium text-finrise-text">Aktif</span>
                        </>
                    ) : (
                        <>
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          <span className="text-sm font-medium text-finrise-text">Pasif</span>
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => openModal(client)}
                     className="p-2 hover:bg-finrise-input rounded-lg text-finrise-muted hover:text-finrise-accent transition-colors" 
                     title="Düzenle">
                     <Edit2 size={18} />
                   </button>
                   <button 
                     onClick={() => handleDelete(client.id)}
                     className="p-2 hover:bg-finrise-red/10 rounded-lg text-finrise-muted hover:text-finrise-red transition-colors" 
                     title="Sil">
                     <Trash2 size={18} />
                   </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredClients.length === 0 && (
            <div className="text-center py-12 text-finrise-muted">
                <Users size={48} className="mx-auto mb-4 opacity-20" />
                <p>Danışan bulunamadı.</p>
            </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-finrise-panel border border-finrise-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-finrise-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-finrise-text">
                {editingClient ? 'Danışanı Düzenle' : 'Yeni Danışan Ekle'}
              </h2>
              <button onClick={closeModal} className="text-finrise-muted hover:text-finrise-text">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-finrise-muted">Ad Soyad</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-finrise-input border border-finrise-border rounded-lg px-4 py-3 text-finrise-text focus:border-finrise-accent outline-none"
                  placeholder="Örn: Ayşe Yılmaz"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-finrise-muted">Telefon</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-finrise-input border border-finrise-border rounded-lg px-4 py-3 text-finrise-text focus:border-finrise-accent outline-none"
                      placeholder="0555..."
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-finrise-muted">Durum</label>
                    <select 
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                      className="w-full bg-finrise-input border border-finrise-border rounded-lg px-4 py-3 text-finrise-text focus:border-finrise-accent outline-none"
                    >
                      <option value="active">Aktif</option>
                      <option value="passive">Pasif</option>
                    </select>
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-finrise-muted">E-posta</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-finrise-input border border-finrise-border rounded-lg px-4 py-3 text-finrise-text focus:border-finrise-accent outline-none"
                  placeholder="ornek@email.com"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-6 py-2.5 rounded-xl border border-finrise-border text-finrise-muted hover:text-finrise-text hover:bg-finrise-input transition-colors"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 rounded-xl bg-finrise-accent text-white hover:bg-finrise-accent/90 shadow-lg transition-transform active:scale-95"
                >
                  {editingClient ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
