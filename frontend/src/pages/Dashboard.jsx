import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, Database, Activity, Clock, Calendar } from 'lucide-react';

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load appointments from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('appointments');
    if (saved) {
      setAppointments(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  // Calculate Stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(app => app.date === todayStr && app.status !== 'cancelled');
  const totalToday = todayAppointments.length;
  
  const now = new Date();
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const remainingToday = todayAppointments.filter(app => app.time > currentTimeStr).length;


  const stats = [
    { label: 'Toplam Tarif', value: '124', icon: Database, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Aktif Şablonlar', value: '8', icon: FileText, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Kayıtlı Danışan', value: '45', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Oluşturulan Diyet', value: '312', icon: Activity, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-finrise-text mb-2">Genel Bakış</h1>
        <p className="text-finrise-muted">DetoksBot yönetim paneline hoş geldiniz.</p>
      </div>

      {/* Appointment Stats - New Section */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Today's Total */}
         <div className="bg-finrise-panel border border-finrise-border p-5 rounded-2xl flex items-center justify-between shadow-sm hover:border-blue-500/30 transition-colors group">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar size={24} />
                </div>
                <div>
                    <p className="text-finrise-muted text-xs font-bold uppercase tracking-wider mb-0.5">Bugünkü Randevular</p>
                    <h2 className="text-3xl font-bold text-finrise-text leading-none">{loading ? '-' : totalToday}</h2>
                </div>
            </div>
            <div className="text-right">
                <span className="text-xs font-medium text-finrise-muted bg-finrise-input px-2 py-1 rounded-lg border border-finrise-border">
                    {new Date().toLocaleDateString('tr-TR', { weekday: 'long' })}
                </span>
            </div>
         </div>

         {/* Remaining */}
         <div className="bg-finrise-panel border border-finrise-border p-5 rounded-2xl flex items-center justify-between shadow-sm hover:border-orange-500/30 transition-colors group">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock size={24} />
                </div>
                <div>
                    <p className="text-finrise-muted text-xs font-bold uppercase tracking-wider mb-0.5">Kalan Randevu</p>
                    <h2 className="text-3xl font-bold text-finrise-text leading-none">{loading ? '-' : remainingToday}</h2>
                </div>
            </div>
            <div className="text-right">
                 <span className="flex items-center gap-1 text-xs font-medium text-orange-500 bg-orange-500/5 px-2 py-1 rounded-lg border border-orange-500/10">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    Canlı
                 </span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-finrise-panel p-6 rounded-2xl border border-finrise-border hover:border-finrise-accent/50 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="text-3xl font-bold text-finrise-text mb-1">{stat.value}</div>
            <div className="text-sm text-finrise-muted">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-finrise-panel rounded-2xl border border-finrise-border p-6 shadow-xl">
          <h2 className="text-xl font-bold text-finrise-text mb-4">Son İşlemler</h2>
          <div className="space-y-4">
             {/* Placeholder for activity list */}
             <div className="flex items-center justify-between p-4 bg-finrise-input rounded-xl border border-finrise-border/50">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-green-500" />
                   <span className="text-finrise-text">Ahmet Yılmaz için diyet oluşturuldu</span>
                </div>
                <span className="text-xs text-finrise-muted">2 saat önce</span>
             </div>
             <div className="flex items-center justify-between p-4 bg-finrise-input rounded-xl border border-finrise-border/50">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-blue-500" />
                   <span className="text-finrise-text">Yeni tarif eklendi: Avokado Salatası</span>
                </div>
                <span className="text-xs text-finrise-muted">5 saat önce</span>
             </div>
          </div>
        </div>

        <div className="bg-finrise-panel rounded-2xl border border-finrise-border p-6 shadow-xl">
          <h2 className="text-xl font-bold text-finrise-text mb-4">Sistem Durumu</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                <div className="text-sm text-green-400 mb-1">Database</div>
                <div className="font-semibold text-finrise-text">Connected</div>
            </div>
            <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <div className="text-sm text-purple-400 mb-1">API Status</div>
                <div className="font-semibold text-finrise-text">Online</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
