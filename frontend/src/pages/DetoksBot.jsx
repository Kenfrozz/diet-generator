import { useState, useEffect, useRef } from 'react';
import { Leaf, Send, Square, Zap, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function DetoksBot() {
  const [count, setCount] = useState(5);
  const [status, setStatus] = useState('idle'); // 'idle', 'running', 'error'
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({ sent: 0, failed: 0, total: 0 });
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
            setMessage('İşlem tamamlandı!');
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

  // F4 Emergency Stop
  useEffect(() => {
    const handleKeyDown = async (e) => {
      if (e.key === 'F4') {
        e.preventDefault();
        if (status === 'running') {
          try {
            await fetch('http://127.0.0.1:8000/api/stop-detoks-bot', { method: 'POST' });
            setMessage('F4 ile durduruldu!');
            setStatus('idle');
          } catch (err) {
            console.error('Stop error:', err);
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  const handleRunBot = async () => {
    setStatus('running');
    setMessage('Mesajlar gönderiliyor...');
    setStats({ sent: 0, failed: 0, total: count });
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/run-detoks-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: parseInt(count) })
      });
      
      const data = await response.json();
      if (data.status !== 'success') {
        setStatus('error');
        setMessage(data.detail || 'Başlatılamadı');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('Bağlantı hatası!');
    }
  };

  const handleStopBot = async () => {
    try {
      await fetch('http://127.0.0.1:8000/api/stop-detoks-bot', { method: 'POST' });
      setMessage('Durduruldu');
      setStatus('idle');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 gap-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-finrise-text mb-1">DetoksBot</h1>
          <p className="text-finrise-muted">Otomatik mesaj gönderme sistemi</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Panel - Controls */}
        <div className="space-y-6">
          
          {/* Control Card */}
          <div className="bg-finrise-panel border border-finrise-border rounded-2xl p-6 shadow-lg">
            
            {/* Bot Icon - Top Center */}
            <div className="flex justify-center mb-6">
              <div className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-500 shadow-lg",
                status === 'running' 
                  ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/40 animate-pulse" 
                  : status === 'error'
                  ? "bg-gradient-to-br from-red-500 to-orange-500 shadow-red-500/40"
                  : "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30"
              )}>
                <Leaf size={32} className="text-white" />
              </div>
            </div>

            {/* Count Selector */}
            <div>
              <label className="text-sm font-medium text-finrise-muted mb-3 block text-center">
                Gönderilecek Kişi Sayısı
              </label>
              
              <input 
                type="number" 
                min="1"
                value={count}
                onChange={(e) => setCount(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                onBlur={() => setCount(prev => !prev || prev < 1 ? 1 : prev)}
                disabled={status === 'running'}
                className="w-full no-spinner bg-finrise-input border border-finrise-border rounded-xl px-4 py-3 text-center text-finrise-text text-2xl font-bold focus:border-finrise-accent outline-none transition-all disabled:opacity-50"
              />

              {/* Quick Select */}
              <div className="flex justify-center gap-2 mt-3">
                {[5, 10, 25, 50, 100].map(n => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    disabled={status === 'running'}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-medium transition-all",
                      count === n 
                        ? "bg-finrise-accent text-white" 
                        : "bg-finrise-input text-finrise-muted hover:text-finrise-text hover:bg-finrise-input/80"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6">
              {status !== 'running' ? (
                <button 
                  onClick={handleRunBot}
                  className="w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] bg-gradient-to-r from-finrise-accent to-purple-500 text-white hover:shadow-finrise-accent/30 hover:shadow-xl"
                >
                  <Send size={22} />
                  Gönderimi Başlat
                </button>
              ) : (
                <button 
                  onClick={handleStopBot}
                  className="w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-red-500/30 hover:shadow-xl"
                >
                  <Square size={20} fill="currentColor" />
                  Durdur
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Stats */}
        <div className="space-y-4">
          
          {/* Quick Stats */}
          <div className="bg-finrise-panel border border-finrise-border rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-finrise-muted mb-4 flex items-center gap-2">
              <Activity size={16} />
              Durum
            </h3>
            
            <div className="space-y-3">
              {/* Status Indicator */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-finrise-input/50">
                <span className="text-sm text-finrise-muted">Bot Durumu</span>
                <span className={cn(
                  "px-2 py-1 rounded-lg text-xs font-bold",
                  status === 'running' 
                    ? "bg-green-500/20 text-green-400"
                    : status === 'error'
                    ? "bg-red-500/20 text-red-400"
                    : "bg-finrise-input text-finrise-muted"
                )}>
                  {status === 'running' ? "Çalışıyor" : status === 'error' ? "Hata" : "Beklemede"}
                </span>
              </div>

              {/* Target Count */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-finrise-input/50">
                <span className="text-sm text-finrise-muted">Hedef</span>
                <span className="text-lg font-bold text-finrise-text">{count || 0} kişi</span>
              </div>

              {/* Message Row */}
              {message && (
                <div className={cn(
                  "flex items-center gap-2 p-3 rounded-xl text-xs",
                  status === 'error' 
                    ? "bg-red-500/10 text-red-400"
                    : status === 'running'
                    ? "bg-green-500/10 text-green-400"
                    : "bg-finrise-input/50 text-finrise-text"
                )}>
                  {status === 'running' && <div className="w-2 h-2 bg-green-500 rounded-full animate-ping shrink-0" />}
                  {status === 'error' && <AlertTriangle size={14} className="shrink-0" />}
                  {status === 'idle' && message.includes('tamamlandı') && <CheckCircle size={14} className="text-green-400 shrink-0" />}
                  <span className="font-medium truncate">{message}</span>
                </div>
              )}

              {/* Emergency Stop Info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <kbd className="px-2 py-1 rounded bg-red-500/20 text-red-400 font-mono font-bold text-xs">F4</kbd>
                <span className="text-xs text-red-400">Acil Durdurma</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
