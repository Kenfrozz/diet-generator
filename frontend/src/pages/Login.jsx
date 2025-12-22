import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://127.0.0.1:8000';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save user to local storage or context (simplified for now)
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.detail || 'Giriş başarısız');
      }
    } catch (err) {
      setError('Sunucuya bağlanılamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e] overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
         <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-purple-900/20 rounded-full blur-[100px] animate-pulse" />
         <div className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] bg-blue-900/20 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10 p-8"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">DetoksBot</h1>
            <p className="text-gray-400">Diyetisyenler için Profesyonel Asistan</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Kullanıcı Adı</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  placeholder="Kullanıcı adınız"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Şifre</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-purple-900/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Giriş Yap</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-gray-500">
             © 2025 DetoksBot v2.0
          </div>
        </div>
      </motion.div>
    </div>
  );
}
