import { useState, useEffect, useRef } from 'react';
import { User, Lock, Camera, Save, Key, ShieldQuestion, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export default function Profile() {
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

  // Get user ID from local storage and fetch fresh data
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
        
        // Check if current question is standard or custom
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
          // Password and answer are not fetched for security
        }));
        setCustomQuestion(custom);
        
        if (data.user.avatar_path) {
            // Check if it's already a full URL or relative
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

    // Optimistic preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload immediately
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/users/${userId}/avatar`, {
        method: 'POST',
        body: uploadData
      });
      const data = await res.json();
      if (data.status === 'success') {
         // Update local storage user if needed
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
      
      // Only include password/security answer if not empty
      if (formData.password) updateData.password = formData.password;
      
      // Handle Security Question
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await res.json();
      if (data.status === 'success') {
        setUser(data.user);
        // Update local storage
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage('Profil başarıyla güncellendi.');
        // Clear sensitive fields
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

  if (loading) {
    return <div className="p-8 flex items-center justify-center"><Loader2 className="animate-spin text-finrise-accent" /></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-bold text-finrise-text">Profil Ayarları</h2>
           <p className="text-finrise-muted">Kişisel bilgilerinizi ve güvenlik ayarlarınızı yönetin.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar */}
        <div className="md:col-span-1">
          <div className="bg-finrise-panel border border-finrise-border rounded-2xl p-6 shadow-xl flex flex-col items-center space-y-4">
             <div 
               className="relative group cursor-pointer"
               onClick={handleAvatarClick}
             >
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-finrise-border group-hover:border-finrise-accent transition-all shadow-lg">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-finrise-input flex items-center justify-center">
                       <User size={48} className="text-finrise-muted" />
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Camera className="text-white w-8 h-8" />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
             </div>
             <div className="text-center">
                <h3 className="font-semibold text-finrise-text">{user?.username || 'Kullanıcı'}</h3>
                <p className="text-xs text-finrise-muted">{user?.role || 'Kullanıcı'}</p>
             </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="md:col-span-2">
            <div className="bg-finrise-panel border border-finrise-border rounded-2xl p-8 shadow-xl">
                 <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* User Info */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-medium text-finrise-text flex items-center gap-2 border-b border-finrise-border pb-2">
                           <User size={18} className="text-finrise-accent" />
                           Hesap Bilgileri
                        </h4>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-finrise-muted">Kullanıcı Adı</label>
                            <input 
                              type="text" 
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                              className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-2.5 text-finrise-text focus:border-finrise-accent focus:ring-1 focus:ring-finrise-accent outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-finrise-muted">Yeni Şifre</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-finrise-muted" />
                                <input 
                                  type="password" 
                                  name="password"
                                  value={formData.password}
                                  onChange={handleChange}
                                  placeholder="Değiştirmek istemiyorsanız boş bırakın"
                                  className="w-full bg-finrise-input border border-finrise-border rounded-xl pl-9 pr-4 py-2.5 text-finrise-text focus:border-finrise-accent focus:ring-1 focus:ring-finrise-accent outline-none transition-all placeholder:text-finrise-muted/50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Security Question */}
                    <div className="space-y-4 pt-4">
                        <h4 className="text-lg font-medium text-finrise-text flex items-center gap-2 border-b border-finrise-border pb-2">
                           <ShieldQuestion size={18} className="text-finrise-accent" />
                           Güvenlik Sorusu
                        </h4>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-finrise-muted">Soru</label>
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
                           <div className="space-y-2">
                             <label className="text-sm font-medium text-finrise-muted">Özel Soru</label>
                             <input 
                               type="text"
                               placeholder="Sorunuzu yazın"
                               value={customQuestion}
                               onChange={(e) => setCustomQuestion(e.target.value)}
                               className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-2.5 text-finrise-text focus:border-finrise-accent focus:ring-1 focus:ring-finrise-accent outline-none transition-all"
                             />
                           </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-finrise-muted">Cevap</label>
                             <div className="relative">
                                <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-finrise-muted" />
                                <input 
                                  type="text" 
                                  name="security_answer"
                                  value={formData.security_answer}
                                  onChange={handleChange}
                                  placeholder="Sorunun cevabı"
                                  className="w-full bg-finrise-input border border-finrise-border rounded-xl pl-9 pr-4 py-2.5 text-finrise-text focus:border-finrise-accent focus:ring-1 focus:ring-finrise-accent outline-none transition-all"
                                />
                             </div>
                        </div>
                    </div>

                    {/* Messages */}
                    {message && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-sm flex items-center gap-2">
                            <CheckCircle size={16} /> {message}
                        </motion.div>
                    )}
                    {error && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle size={16} /> {error}
                        </motion.div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end pt-4">
                        <button 
                          type="submit" 
                          disabled={saving}
                          className="bg-finrise-accent hover:bg-finrise-accent/90 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-finrise-accent/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                        </button>
                    </div>

                 </form>
            </div>
        </div>
      </div>
    </div>
  );
}
