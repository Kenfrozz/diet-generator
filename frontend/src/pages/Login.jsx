import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, Loader2, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const API_URL = 'http://127.0.0.1:8000';
const ipcRenderer = window.require ? window.require('electron').ipcRenderer : { send: () => {} };

export default function Login() {
  const { appSettings } = useApp();
  const [mode, setMode] = useState('login'); // 'login' | 'forgot'
  const [forgotStep, setForgotStep] = useState(1); // 1: username, 2: answer & new pass

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Forgot Password States
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
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

  const handleForgotStep1 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        const res = await fetch(`${API_URL}/api/auth/security-question/${username}`);
        const data = await res.json();

        if (res.ok) {
            // Map standard questions if needed or use raw
            let q = data.question;
            const standardQuestions = {
                'first_pet': 'İlk evcil hayvanınızın adı nedir?',
                'mother_maiden': 'Annenizin kızlık soyadı nedir?',
                'first_school': 'İlk okulunuzun adı nedir?',
                'favourite_color': 'En sevdiğiniz renk nedir?'
            };
            if (standardQuestions[q]) q = standardQuestions[q];
            
            setSecurityQuestion(q);
            setForgotStep(2);
        } else {
            setError(data.detail || 'Kullanıcı bulunamadı veya güvenlik sorusu yok.');
        }
    } catch (err) {
        setError('Sunucu hatası.');
    } finally {
        setLoading(false);
    }
  };

  const handleForgotStep2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        const res = await fetch(`${API_URL}/api/auth/reset-password`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username,
                security_answer: securityAnswer,
                new_password: newPassword
            })
        });
        const data = await res.json();
        
        if (res.ok) {
            setSuccessMsg('Şifreniz başarıyla sıfırlandı. Giriş yapabilirsiniz.');
            setTimeout(() => {
                setMode('login');
                setSuccessMsg('');
                setPassword('');
                setUsername(username); // keep username
            }, 2000);
        } else {
            setError(data.detail || 'Sıfırlama başarısız.');
        }

    } catch (err) {
        setError('Sunucu hatası.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e] overflow-hidden relative" style={{ WebkitAppRegion: 'drag' }}>
      {/* Close Button - Electron Only */}
      {window.require && (
        <button 
          onClick={() => ipcRenderer.send('window-close')}
          className="absolute top-6 right-6 z-50 text-white/40 hover:text-white hover:bg-red-500/20 p-2 rounded-full transition-all"
          title="Kapat"
          style={{ WebkitAppRegion: 'no-drag' }}
        >
          <X size={24} />
        </button>
      )}

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
        style={{ WebkitAppRegion: 'no-drag' }}
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            {appSettings.app_logo_path && (
               <div className="flex justify-center mb-4">
                  <img src={`${API_URL}${appSettings.app_logo_path}`} className="w-16 h-16 object-contain drop-shadow-lg" alt="Logo" />
               </div>
            )}
            <h1 className="text-3xl font-bold text-white mb-2">{appSettings.app_title || 'DiyetKent'}</h1>
            <p className="text-gray-400">
                {mode === 'login' ? (appSettings.app_description || 'Diyetisyenler için Profesyonel Asistan') : 'Hesap Kurtarma'}
            </p>
          </div>
          
          {successMsg && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm text-center">
                  {successMsg}
              </div>
          )}

          {mode === 'login' ? (
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
                   <div className="flex justify-between">
                      <label className="text-sm font-medium text-gray-300 ml-1">Şifre</label>
                      <button 
                        type="button" 
                        onClick={() => { setMode('forgot'); setForgotStep(1); setError(''); }}
                        className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                      >
                          Şifreni mi unuttun?
                      </button>
                   </div>
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
          ) : (
              // Forgot Password Mode
              <form onSubmit={forgotStep === 1 ? handleForgotStep1 : handleForgotStep2} className="space-y-6">
                 {forgotStep === 1 ? (
                     <div className="space-y-2">
                       <label className="text-sm font-medium text-gray-300 ml-1">Kullanıcı Adı</label>
                        <p className="text-xs text-gray-500 mb-2">Güvenlik sorunuzu bulmak için kullanıcı adınızı girin.</p>
                       <div className="relative group">
                         <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                         <input
                           type="text"
                           value={username}
                           onChange={(e) => setUsername(e.target.value)}
                           className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                           placeholder="Kullanıcı adınız"
                           autoFocus
                         />
                       </div>
                     </div>
                 ) : (
                     <div className="space-y-4">
                        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center">
                            <p className="text-xs text-purple-300 mb-1">Güvenlik Sorusu</p>
                            <p className="text-white font-medium">{securityQuestion}</p>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Cevap</label>
                            <input
                              type="text"
                              value={securityAnswer}
                              onChange={(e) => setSecurityAnswer(e.target.value)}
                              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                              placeholder="Sorunun cevabı"
                              autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Yeni Şifre</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                                <input
                                  type="password"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                  placeholder="Yeni şifreniz"
                                />
                            </div>
                        </div>
                     </div>
                 )}
                 
                 {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20"
                  >
                    {error}
                  </motion.div>
                )}

                 <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-purple-900/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <span>{forgotStep === 1 ? 'Devam Et' : 'Şifreyi Sıfırla'}</span>
                      )}
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                        className="w-full text-gray-400 hover:text-white text-sm py-2 transition-colors"
                    >
                        Giriş Yap'a Dön
                    </button>
                 </div>
              </form>
          )}

          <div className="mt-6 text-center text-xs text-gray-500 font-medium tracking-wide opacity-50 hover:opacity-100 transition-opacity">
             by Kenfroz
          </div>
        </div>
      </motion.div>
    </div>
  );
}
