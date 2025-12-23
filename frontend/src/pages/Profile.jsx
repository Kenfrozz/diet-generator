import { useState, useEffect, useRef } from 'react';
import { User, Lock, Camera, Save, Key, ShieldQuestion, Loader2, CheckCircle, AlertCircle, LogOut, Pencil } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    security_question: '',
    security_answer: ''
  });
  const [customQuestion, setCustomQuestion] = useState('');

  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const localUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = localUser.id;

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      if (!userId) {
        setError('Kullanıcı oturumu bulunamadı.');
        setLoading(false);
        return;
      }

      const res = await fetch(`http://127.0.0.1:8000/api/users/${userId}`);
      const data = await res.json();
      
      if (data.status === 'success') {
        setUser(data.user);
        
        const standardQuestions = ['first_pet', 'mother_maiden', 'first_school', 'favourite_color'];
        let q = data.user.security_question || '';
        let custom = '';
        
        if (q && !standardQuestions.includes(q)) {
          custom = q;
          q = 'custom';
        }

        setFormData(prev => ({
          ...prev,
          username: data.user.username || '',
          security_question: q,
        }));
        setCustomQuestion(custom);
        
        if (data.user.avatar_path) {
          if (data.user.avatar_path.startsWith('http')) {
            setPreviewUrl(data.user.avatar_path);
          } else {
            setPreviewUrl(`http://127.0.0.1:8000${data.user.avatar_path}`);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError('Profil bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/users/${userId}/avatar`, {
        method: 'POST',
        body: uploadData
      });
      const data = await res.json();
      if (data.status === 'success') {
        setUser(prev => ({ ...prev, avatar_path: data.avatar_path }));
        setMessage('Profil fotoğrafı güncellendi.');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('Fotoğraf yüklenemedi.');
      }
    } catch (err) {
      setError('Fotoğraf yüklenirken hata oluştu.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const updateData = {};
      if (formData.username && formData.username !== user.username) updateData.username = formData.username;
      if (formData.password) updateData.password = formData.password;
      
      let finalQuestion = formData.security_question;
      if (finalQuestion === 'custom') {
        finalQuestion = customQuestion;
      }
      
      if (finalQuestion && finalQuestion !== user.security_question) {
        updateData.security_question = finalQuestion;
      }

      if (formData.security_answer) updateData.security_answer = formData.security_answer;

      if (Object.keys(updateData).length === 0) {
        setSaving(false);
        setMessage('Değişiklik yapılmadı.');
        return;
      }

      const res = await fetch(`http://127.0.0.1:8000/api/users/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const data = await res.json();
      if (data.status === 'success') {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage('Profil başarıyla güncellendi.');
        setFormData(prev => ({ ...prev, password: '', security_answer: '' }));
      } else {
        setError(data.detail || 'Güncelleme başarısız.');
      }
    } catch (err) {
      setError('Sunucu hatası.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-finrise-accent w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 animate-in fade-in duration-500">
      
      {/* Single Card */}
      <div className="bg-finrise-panel border border-finrise-border rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-finrise-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div 
                className="relative group cursor-pointer"
                onClick={handleAvatarClick}
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-finrise-border shadow-lg bg-finrise-input">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={28} className="text-finrise-muted" />
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="text-white w-5 h-5" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-finrise-accent rounded-md flex items-center justify-center shadow-lg">
                  <Pencil size={12} className="text-white" />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              
              <div>
                <h1 className="text-xl font-bold text-finrise-text">{user?.username || 'Kullanıcı'}</h1>
                <p className="text-finrise-muted text-sm">
                  {user?.role === 'admin' ? 'Diyetisyen' : (user?.role || 'Diyetisyen')}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-finrise-input border border-finrise-border text-finrise-muted hover:bg-finrise-border hover:text-finrise-text transition-all text-sm font-medium"
            >
              <LogOut size={16} />
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-6">
          
          {/* Account Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-finrise-muted">
              <User size={16} />
              <span className="text-sm font-medium uppercase tracking-wider">Hesap Bilgileri</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-finrise-muted">Kullanıcı Adı</label>
                <input 
                  type="text" 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-2.5 text-finrise-text focus:border-finrise-accent focus:ring-1 focus:ring-finrise-accent outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-finrise-muted">Yeni Şifre</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-finrise-muted" />
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-finrise-input border border-finrise-border rounded-xl pl-9 pr-4 py-2.5 text-finrise-text focus:border-finrise-accent focus:ring-1 focus:ring-finrise-accent outline-none transition-all placeholder:text-finrise-muted/40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-finrise-border" />

          {/* Security Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-finrise-muted">
              <ShieldQuestion size={16} />
              <span className="text-sm font-medium uppercase tracking-wider">Güvenlik Sorusu</span>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm text-finrise-muted">Soru</label>
                <select
                  name="security_question"
                  value={formData.security_question}
                  onChange={handleChange}
                  className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-2.5 text-finrise-text focus:border-finrise-accent focus:ring-1 focus:ring-finrise-accent outline-none transition-all"
                > 
                  <option value="">Seçiniz...</option>
                  <option value="first_pet">İlk evcil hayvanınızın adı nedir?</option>
                  <option value="mother_maiden">Annenizin kızlık soyadı nedir?</option>
                  <option value="first_school">İlk okulunuzun adı nedir?</option>
                  <option value="favourite_color">En sevdiğiniz renk nedir?</option>
                  <option value="custom">Diğer (Özel)</option>
                </select>
              </div>
              
              {formData.security_question === 'custom' && (
                <div className="space-y-1.5">
                  <label className="text-sm text-finrise-muted">Özel Soru</label>
                  <input 
                    type="text"
                    placeholder="Sorunuzu yazın"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-2.5 text-finrise-text focus:border-finrise-accent focus:ring-1 focus:ring-finrise-accent outline-none transition-all"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm text-finrise-muted">Cevap</label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-finrise-muted" />
                  <input 
                    type="text" 
                    name="security_answer"
                    value={formData.security_answer}
                    onChange={handleChange}
                    placeholder="Sorunun cevabı"
                    className="w-full bg-finrise-input border border-finrise-border rounded-xl pl-9 pr-4 py-2.5 text-finrise-text focus:border-finrise-accent focus:ring-1 focus:ring-finrise-accent outline-none transition-all placeholder:text-finrise-muted/40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm flex items-center gap-2"
            >
              <CheckCircle size={16} /> {message}
            </motion.div>
          )}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2"
            >
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-finrise-accent hover:bg-finrise-accent/90 text-white py-3 rounded-xl font-medium shadow-lg shadow-finrise-accent/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>

        </form>
      </div>
    </div>
  );
}
