import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Edit, Trash2 } from 'lucide-react';
import { RecipeModal } from '../components/RecipeModal';

const API_URL = 'http://127.0.0.1:8000';

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pools, setPools] = useState([]);
  const [selectedPool, setSelectedPool] = useState('all');
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState(null);

  useEffect(() => {
    fetchRecipes();
    fetchPools();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/recipes`);
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPools = async () => {
    try {
      const response = await fetch(`${API_URL}/api/pools`);
      const data = await response.json();
      setPools(data);
    } catch (error) {
      console.error('Error fetching pools:', error);
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
    const matchesPool = selectedPool === 'all' || recipe.pool_type === selectedPool;
    const matchesSearch = recipe.name.toLowerCase().includes(search.toLowerCase());
    return matchesPool && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tarif Havuzu</h1>
          <p className="text-gray-400">Tüm tarifleri yönetin ve düzenleyin</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-purple-900/20"
        >
          <Plus className="w-5 h-5" />
          Yeni Tarif
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-[#1a1a2e] p-4 rounded-xl border border-white/5">
        <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
                type="text" 
                placeholder="Tarif ara..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
            />
        </div>
        <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select 
                value={selectedPool}
                onChange={(e) => setSelectedPool(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 min-w-[200px]"
            >
                <option value="all">Tüm Havuzlar</option>
                {pools.map(pool => (
                    <option key={pool.id} value={pool.name}>{pool.description || pool.name}</option>
                ))}
            </select>
        </div>
      </div>

      <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 font-medium">
                <tr>
                    <th className="p-4 pl-6">Tarif Adı</th>
                    <th className="p-4">Tip</th>
                    <th className="p-4">Havuz</th>
                    <th className="p-4 text-right pr-6">İşlemler</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {loading ? (
                    <tr>
                        <td colSpan="4" className="p-8 text-center text-gray-500">Yükleniyor...</td>
                    </tr>
                ) : filteredRecipes.length === 0 ? (
                    <tr>
                        <td colSpan="4" className="p-8 text-center text-gray-500">Tarif bulunamadı.</td>
                    </tr>
                ) : (
                    filteredRecipes.map((recipe) => (
                        <tr key={recipe.id} className="hover:bg-white/5 transition-colors group">
                            <td className="p-4 pl-6 font-medium text-white">{recipe.name}</td>
                            <td className="p-4 text-gray-300 capitalize">{recipe.meal_type.replace('_', ' ')}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-md text-xs font-medium bg-white/10 text-gray-300`}>
                                    {recipe.pool_type}
                                </span>
                            </td>
                            <td className="p-4 text-right pr-6">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => openEditModal(recipe)}
                                      className="p-2 hover:bg-blue-500/20 hover:text-blue-400 rounded-lg transition-colors text-gray-400"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleDelete(recipe.id)}
                                      className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors text-gray-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
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
        pools={pools}
      />
    </div>
  );
}
