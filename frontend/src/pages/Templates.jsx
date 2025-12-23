import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Clock, Layout } from 'lucide-react';
import TemplateModal from '../components/TemplateModal';

const API_URL = 'http://127.0.0.1:8000';

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);

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

    try {
      const response = await fetch(`${API_URL}/api/templates/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
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
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-finrise-accent hover:bg-finrise-accent/90 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-finrise-accent/20"
        >
          <Plus className="w-5 h-5" />
          Yeni Şablon
        </button>
      </div>

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
