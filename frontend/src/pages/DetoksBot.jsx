import { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Square, AlertCircle, Play, Plus, Minus } from 'lucide-react';
import { cn } from '../lib/utils';
import { TitleBar } from '../components/TitleBar';

export default function DetoksBot() {
  const [count, setCount] = useState(5);
  // Status: 'idle', 'running', 'error'
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const pollInterval = useRef(null);

  // Poll status while running
  useEffect(() => {
    if (status === 'running') {
        pollInterval.current = setInterval(async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/detoks-bot-status');
                const data = await res.json();
                if (data.status !== 'running') {
                    setStatus('idle');
                    setMessage('Bot işlemi tamamlandı veya durduruldu.');
                    clearInterval(pollInterval.current);
                }
            } catch (e) {
                console.error("Poll error", e);
            }
        }, 1000);
    } else {
        if (pollInterval.current) clearInterval(pollInterval.current);
    }
    return () => {
        if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [status]);

  const handleRunBot = async () => {
    setStatus('running');
    setMessage('Bot başlatılıyor... Durdurmak için F4 tuşuna basabilirsiniz.');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/run-detoks-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: parseInt(count) })
      });
      
      const data = await response.json();
      if (data.status === 'success') {
          // Keep running status, polling will detect finish
      } else {
        setStatus('idle');
        setMessage(`Hata: ${data.detail || 'Başlatılamadı'}`);
      }
    } catch (error) {
      console.error(error);
      setStatus('idle');
      setMessage('Bağlantı hatası!');
    }
  };

  const handleStopBot = async () => {
      try {
        await fetch('http://127.0.0.1:8000/api/stop-detoks-bot', { method: 'POST' });
        setMessage('Durdurma sinyali gönderildi...');
        // Polling will update state eventually, or we can force it
        setStatus('idle');
      } catch (e) {
        console.error(e);
      }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in zoom-in duration-500">
      
      <div className="text-center space-y-2">
        <div className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border shadow-lg transition-all duration-500",
            status === 'running' 
                ? "bg-green-500/10 border-green-500/50 shadow-green-500/20 animate-pulse" 
                : "bg-finrise-accent/10 border-finrise-accent/20 shadow-finrise-accent/5"
        )}>
             <Bot size={48} className={status === 'running' ? "text-green-500" : "text-finrise-accent"} />
        </div>
        <h2 className="text-3xl font-bold text-finrise-text">Detoks Gönderici Bot</h2>
        <p className="text-finrise-muted max-w-md mx-auto">
          Belirtilen kişi sayısı kadar ototmatik mesaj gönderir.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs font-mono bg-finrise-panel py-1 px-3 rounded-full border border-finrise-border w-fit mx-auto mt-2 text-finrise-muted">
             <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
             Acil Durdurma: F4
        </div>
      </div>

      <div className="w-full max-w-md bg-finrise-panel border border-finrise-border p-8 rounded-2xl shadow-xl space-y-6">
         
         <div className="space-y-3">
            <label className="text-sm font-medium text-finrise-text flex items-center justify-center gap-2">
                <User size={16} className="text-finrise-accent" />
                Kişi Sayısı
            </label>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setCount(Math.max(1, parseInt(count) - 1))}
                    disabled={status === 'running' || count <= 1}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-finrise-input border border-finrise-border hover:border-finrise-accent hover:bg-finrise-accent/10 text-finrise-text transition-all disabled:opacity-50 disabled:hover:border-finrise-border disabled:hover:bg-finrise-input active:scale-95"
                >
                    <Minus size={20} />
                </button>

                <div className="flex-1 relative">
                    <input 
                        type="number" 
                        min="1"
                        value={count}
                        onChange={(e) => setCount(parseInt(e.target.value) || 0)}
                        disabled={status === 'running'}
                        className="w-full no-spinner bg-finrise-input border border-finrise-border rounded-xl px-4 py-3 text-center text-finrise-text text-2xl font-bold tracking-widest focus:border-finrise-accent outline-none transition-all placeholder:text-finrise-muted/50 disabled:opacity-50"
                    />
                     <span className="absolute right-4 top-1/2 -translate-y-1/2 text-finrise-muted text-sm font-medium pointer-events-none">
                        kişi
                    </span>
                </div>

                <button 
                    onClick={() => setCount(parseInt(count) + 1)}
                    disabled={status === 'running'}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-finrise-input border border-finrise-border hover:border-finrise-accent hover:bg-finrise-accent/10 text-finrise-text transition-all disabled:opacity-50 disabled:hover:border-finrise-border disabled:hover:bg-finrise-input active:scale-95"
                >
                    <Plus size={20} />
                </button>
            </div>
         </div>

         <div className="flex gap-3">
             {status !== 'running' ? (
                <button 
                onClick={handleRunBot}
                className="flex-1 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 bg-finrise-accent text-white hover:bg-finrise-accent/90 hover:shadow-finrise-accent/20"
                >
                    <Send size={20} /> Başlat
                </button>
             ) : (
                <button 
                onClick={handleStopBot}
                className="flex-1 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 bg-red-500 text-white hover:bg-red-600 hover:shadow-red-500/20"
                >
                    <Square size={20} fill="currentColor" /> Durdur
                </button>
             )}
         </div>

         {message && (
             <div className={cn(
                 "p-3 rounded-lg text-sm text-center font-medium animate-in fade-in slide-in-from-top-1 flex items-center justify-center gap-2",
                 message.includes('Hata') ? "bg-red-500/10 text-red-400" : "bg-finrise-input text-finrise-text"
             )}>
                 {status === 'running' && <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />}
                 {message}
             </div>
         )}
      </div>
    </div>
  );
}
