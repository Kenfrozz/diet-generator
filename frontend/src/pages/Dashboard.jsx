import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-finrise-panel border border-finrise-border p-8 rounded-2xl shadow-xl max-w-md w-full flex flex-col items-center"
      >
        <div className="w-16 h-16 bg-finrise-accent/10 rounded-full flex items-center justify-center mb-6 text-finrise-accent">
           <Construction size={32} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Yakında Eklenecek</h1>
        <p className="text-finrise-muted">
          Dashboard ekranı güncelleniyor. Çok yakında yeni özelliklerle burada olacak.
        </p>
      </motion.div>
    </div>
  );
}
