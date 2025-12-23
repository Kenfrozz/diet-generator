import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Edit, Trash2, Package } from 'lucide-react';
import { RecipeModal } from '../components/RecipeModal';

const API_URL = 'http://127.0.0.1:8000';

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState('all');
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState(null);

  // Recipe-package mapping
  const [recipePackagesMap, setRecipePackagesMap] = useState({});

  useEffect(() => {
    fetchRecipes();
    fetchPackages();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/recipes`);
      const data = await response.json();
      setRecipes(data);
      
      // Her tarif için paketlerini getir
      for (const recipe of data) {
        fetchRecipePackages(recipe.id);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/packages`);
      const data = await response.json();
      setPackages(data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const fetchRecipePackages = async (recipeId) => {
    try {
      const response = await fetch(`${API_URL}/api/recipes/${recipeId}/packages`);
      const data = await response.json();
      setRecipePackagesMap(prev => ({
        ...prev,
        [recipeId]: data
      }));
    } catch (error) {
      console.error('Error fetching recipe packages:', error);
    }
  };

  const handleSave = async (formData) => {
    try {
      const method = currentRecipe ? 'PUT' : 'POST';
      const url = currentRecipe 
        ? `${API_URL}/api/recipes/${currentRecipe.id}` 
        : `${API_URL}/api/recipes`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchRecipes(); // Refresh list
      } else {
        console.error('Failed to save recipe');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu tarifi silmek istediğinize emin misiniz?')) return;

    try {
      const response = await fetch(`${API_URL}/api/recipes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchRecipes(); // Refresh list
      } else {
        console.error('Failed to delete recipe');
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const openAddModal = () => {
    setCurrentRecipe(null);
    setIsModalOpen(true);
  };

  const openEditModal = (recipe) => {
    setCurrentRecipe(recipe);
    setIsModalOpen(true);
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(search.toLowerCase());
    
    if (selectedPackage === 'all') {
      return matchesSearch;
    }
    
    if (selectedPackage === 'unassigned') {
      const pkgs = recipePackagesMap[recipe.id] || [];
      return matchesSearch && pkgs.length === 0;
    }
    
    const pkgs = recipePackagesMap[recipe.id] || [];
    const matchesPackage = pkgs.some(p => p.id === parseInt(selectedPackage));
    return matchesSearch && matchesPackage;
  });

  const getMealTypeLabel = (mealType) => {
    const labels = {
      'kahvalti': 'Kahvaltı',
      'ara_ogun_1': 'Ara Öğün 1',
      'ogle': 'Öğle',
      'ara_ogun_2': 'Ara Öğün 2',
      'aksam': 'Akşam',
      'ara_ogun_3': 'Ara Öğün 3',
      'ozel_icecek': 'Özel İçecek'
    };
    return labels[mealType] || mealType;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-finrise-text mb-2">Tarif Havuzu</h1>
          <p className="text-finrise-muted">Tüm tarifleri yönetin ve düzenleyin</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-finrise-accent hover:bg-finrise-accent/90 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-finrise-accent/20"
        >
          <Plus className="w-5 h-5" />
          Yeni Tarif
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-finrise-panel p-4 rounded-xl border border-finrise-border shadow-sm">
        <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-finrise-muted" />
            <input 
                type="text" 
                placeholder="Tarif ara..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-finrise-input border border-finrise-border rounded-lg pl-10 pr-4 py-2.5 text-finrise-text placeholder-finrise-muted focus:outline-none focus:border-finrise-accent/50 transition-colors"
            />
        </div>
        <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-finrise-muted" />
            <select 
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
                className="bg-finrise-input border border-finrise-border rounded-lg px-4 py-2.5 text-finrise-text focus:outline-none focus:border-finrise-accent/50 min-w-[200px] transition-colors"
            >
                <option value="all">Tüm Tarifler</option>
                <option value="unassigned">Paketsiz Tarifler</option>
                {packages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                ))}
            </select>
        </div>
      </div>

      <div className="bg-finrise-panel border border-finrise-border rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left">
            <thead className="bg-finrise-input/50 text-finrise-muted font-medium border-b border-finrise-border">
                <tr>
                    <th className="p-4 pl-6">Tarif Adı</th>
                    <th className="p-4">Öğün Tipi</th>
                    <th className="p-4">Paketler</th>
                    <th className="p-4 text-right pr-6">İşlemler</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-finrise-border">
                {loading ? (
                    <tr>
                        <td colSpan="4" className="p-8 text-center text-finrise-muted">Yükleniyor...</td>
                    </tr>
                ) : filteredRecipes.length === 0 ? (
                    <tr>
                        <td colSpan="4" className="p-8 text-center text-finrise-muted">Tarif bulunamadı.</td>
                    </tr>
                ) : (
                    filteredRecipes.map((recipe) => {
                        const pkgs = recipePackagesMap[recipe.id] || [];
                        return (
                            <tr key={recipe.id} className="hover:bg-finrise-input/30 transition-colors group">
                                <td className="p-4 pl-6 font-medium text-finrise-text">{recipe.name}</td>
                                <td className="p-4 text-finrise-text/80">
                                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-finrise-accent/10 text-finrise-accent border border-finrise-accent/20">
                                        {getMealTypeLabel(recipe.meal_type)}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {pkgs.length === 0 ? (
                                        <span className="text-finrise-muted text-sm italic">Paket atanmamış</span>
                                    ) : (
                                        <div className="flex flex-wrap gap-1">
                                            {pkgs.slice(0, 3).map(pkg => (
                                                <span 
                                                    key={pkg.id}
                                                    className="px-2 py-0.5 rounded-md text-xs font-medium bg-orange-500/10 text-orange-500 border border-orange-500/20"
                                                >
                                                    {pkg.name}
                                                </span>
                                            ))}
                                            {pkgs.length > 3 && (
                                                <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-finrise-input text-finrise-muted">
                                                    +{pkgs.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 text-right pr-6">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                          onClick={() => openEditModal(recipe)}
                                          className="p-2 hover:bg-finrise-accent hover:text-white rounded-lg transition-colors text-finrise-muted"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button 
                                          onClick={() => handleDelete(recipe.id)}
                                          className="p-2 hover:bg-finrise-red hover:text-white rounded-lg transition-colors text-finrise-muted"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })
                )}
            </tbody>
        </table>
      </div>

      {/* Recipe Modal */}
      <RecipeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        recipe={currentRecipe}
      />
    </div>
  );
}
