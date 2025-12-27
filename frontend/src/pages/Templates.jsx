import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Clock, Layout, Cloud, RefreshCw, Check, X } from 'lucide-react';
import TemplateModal from '../components/TemplateModal';
import { cn } from '../lib/utils';

const API_URL = 'http://127.0.0.1:8000';

// Helper: Get dietitianId
const getDietitianId = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.id ? `user-${user.id}` : 'default-dietitian';
};

// Firebase sync helper
const syncTemplateToFirebase = async (action, templateData) => {
  try {
    const { addDoc, updateDoc, deleteDoc, doc, collection, query, where, getDocs } = await import('firebase/firestore');
    const { db } = await import('../lib/firebase');
    const { serverTimestamp } = await import('firebase/firestore');
    
    const dietitianId = getDietitianId();
    
    if (action === 'add') {
      await addDoc(collection(db, 'dietTemplates'), {
        name: templateData.name,
        meals: templateData.meals || [],
        localId: templateData.localId,
        dietitianId: dietitianId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✓ Firebase: Şablon eklendi');
    } else if (action === 'update') {
      // Find by name + dietitianId
      const q = query(
        collection(db, 'dietTemplates'),
        where('dietitianId', '==', dietitianId),
        where('name', '==', templateData.originalName || templateData.name)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        await updateDoc(doc(db, 'dietTemplates', docSnap.id), {
          name: templateData.name,
          meals: templateData.meals || [],
          updatedAt: serverTimestamp()
        });
        console.log('✓ Firebase: Şablon güncellendi');
      } else {
        // Doesn't exist, add it
        await syncTemplateToFirebase('add', templateData);
      }
    } else if (action === 'delete') {
      const q = query(
        collection(db, 'dietTemplates'),
        where('dietitianId', '==', dietitianId),
        where('name', '==', templateData.name)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        await deleteDoc(doc(db, 'dietTemplates', snapshot.docs[0].id));
        console.log('✓ Firebase: Şablon silindi');
      }
    }
  } catch (error) {
    console.error('Firebase sync error:', error);
  }
};

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_URL}/api/templates`);
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Firebase sync function
  const syncWithFirebase = useCallback(async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    
    const results = { pushed: 0, pulled: 0, errors: [] };
    
    try {
      const { collection, query, where, getDocs, addDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      const { serverTimestamp } = await import('firebase/firestore');
      
      const dietitianId = getDietitianId();
      
      // Get Firebase templates
      const q = query(
        collection(db, 'dietTemplates'),
        where('dietitianId', '==', dietitianId)
      );
      const snapshot = await getDocs(q);
      
      const firebaseTemplates = new Map();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        firebaseTemplates.set(data.name, { firebaseId: doc.id, ...data });
      });
      
      // Push local templates that don't exist in Firebase
      // Need to fetch details for each template to get meals
      for (const template of templates) {
        if (!firebaseTemplates.has(template.name)) {
          try {
            // Fetch full template with meals
            const detailResponse = await fetch(`${API_URL}/api/templates/${template.id}`);
            const fullTemplate = await detailResponse.json();
            
            // Convert meals from tuple format [time, name, type] to object format
            const mealsForFirebase = (fullTemplate.meals || []).map(m => ({
              time: m[0],
              meal_name: m[1],
              meal_type: m[2]
            }));
            
            await addDoc(collection(db, 'dietTemplates'), {
              name: fullTemplate.name,
              meals: mealsForFirebase,
              localId: template.id,
              dietitianId: dietitianId,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            results.pushed++;
          } catch (err) {
            results.errors.push(`Push error: ${err.message}`);
          }
        }
      }
      
      // Pull Firebase templates that don't exist locally
      const localNames = new Set(templates.map(t => t.name));
      
      for (const [name, fbTemplate] of firebaseTemplates) {
        if (!localNames.has(name)) {
          // Add to local DB via API
          try {
            await fetch(`${API_URL}/api/templates`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: fbTemplate.name,
                meals: fbTemplate.meals || []
              })
            });
            results.pulled++;
          } catch (e) {
            results.errors.push(e.message);
          }
        }
      }
      
      if (results.pulled > 0) {
        await fetchTemplates();
      }
      
      setSyncStatus(results);
    } catch (error) {
      results.errors.push(error.message);
      setSyncStatus(results);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  }, [templates]);

  const handleSave = async (templateData) => {
    try {
      const method = currentTemplate ? 'PUT' : 'POST';
      const url = currentTemplate 
        ? `${API_URL}/api/templates/${currentTemplate.id}`
        : `${API_URL}/api/templates`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Sync to Firebase
        syncTemplateToFirebase(currentTemplate ? 'update' : 'add', {
          ...templateData,
          localId: result.id || currentTemplate?.id,
          originalName: currentTemplate?.name
        });
        
        setIsModalOpen(false);
        fetchTemplates();
      } else {
        console.error('Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Bu şablonu silmek istediğinize emin misiniz?')) return;

    // Get template data for Firebase
    const templateToDelete = templates.find(t => t.id === id);

    try {
      const response = await fetch(`${API_URL}/api/templates/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Sync deletion to Firebase
        if (templateToDelete) {
          syncTemplateToFirebase('delete', templateToDelete);
        }
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const openCreateModal = () => {
    setCurrentTemplate(null);
    setIsModalOpen(true);
  };

  const openEditModal = async (id, e) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${API_URL}/api/templates/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentTemplate(data);
        setIsModalOpen(true);
      }
    } catch (error) {
        console.error("Error fetching template detail:", error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-finrise-text mb-2">Diyet Şablonları</h1>
          <p className="text-finrise-muted">Diyet oluştururken kullanacağınız öğün düzenlerini yönetin.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Sync Button */}
          <button
            onClick={syncWithFirebase}
            disabled={isSyncing}
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              "bg-finrise-input text-finrise-muted border border-finrise-border hover:border-finrise-accent hover:text-finrise-accent",
              isSyncing && "opacity-50 cursor-not-allowed"
            )}
            title="Firebase ile senkronize et"
          >
            <RefreshCw size={16} className={cn(isSyncing && "animate-spin")} />
            Senkronize
            <Cloud size={16} />
          </button>
          
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-finrise-accent hover:bg-finrise-accent/90 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-finrise-accent/20"
          >
            <Plus className="w-5 h-5" />
            Yeni Şablon
          </button>
        </div>
      </div>

      {/* Sync Status */}
      {syncStatus && (
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl text-sm",
          syncStatus.errors?.length > 0
            ? "bg-red-500/10 text-red-400 border border-red-500/20"
            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        )}>
          {syncStatus.errors?.length > 0 ? (
            <>
              <X size={16} />
              <span>Hata: {syncStatus.errors[0]}</span>
            </>
          ) : (
            <>
              <Check size={16} />
              <span>Senkronize edildi: {syncStatus.pushed || 0} gönderildi, {syncStatus.pulled || 0} alındı</span>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
             <div className="col-span-full text-center py-12 text-finrise-muted">Yükleniyor...</div>
        ) : templates.length === 0 ? (
             <div className="col-span-full text-center py-12 bg-finrise-panel border border-finrise-border rounded-2xl">
                <Layout className="w-12 h-12 text-finrise-muted mx-auto mb-4" />
                <h3 className="text-lg font-medium text-finrise-text mb-2">Henüz Şablon Yok</h3>
                <p className="text-finrise-muted">Yeni bir şablon oluşturarak başlayın.</p>
             </div>
        ) : (
            templates.map((template) => (
                <div 
                    key={template.id}
                    onClick={(e) => openEditModal(template.id, e)}
                    className="group bg-finrise-panel border border-finrise-border hover:border-finrise-accent/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-finrise-accent/10 cursor-pointer relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                         <button 
                            onClick={(e) => openEditModal(template.id, e)}
                            className="p-2 bg-finrise-input hover:bg-finrise-accent hover:text-white rounded-lg text-finrise-muted transition-colors"
                         >
                            <Edit size={16} />
                         </button>
                         <button 
                            onClick={(e) => handleDelete(template.id, e)}
                            className="p-2 bg-finrise-input hover:bg-finrise-red hover:text-white rounded-lg text-finrise-muted transition-colors"
                         >
                            <Trash2 size={16} />
                         </button>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-finrise-accent/10 flex items-center justify-center text-finrise-accent group-hover:bg-finrise-accent group-hover:text-white transition-colors">
                            <Layout size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-finrise-text group-hover:text-finrise-accent transition-colors">{template.name}</h3>
                            <span className="text-xs font-medium text-finrise-muted bg-finrise-input px-2 py-1 rounded mt-1 inline-block">
                                Otomatik Düzen
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2 mt-4">
                         <div className="flex items-center gap-2 text-sm text-finrise-muted bg-finrise-input/50 p-2 rounded-lg">
                            <Clock size={14} className="text-finrise-accent" />
                            <span>Öğünleri ve saatleri düzenle</span>
                         </div>
                    </div>
                </div>
            ))
        )}
      </div>

      <TemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={currentTemplate}
      />
    </div>
  );
}
