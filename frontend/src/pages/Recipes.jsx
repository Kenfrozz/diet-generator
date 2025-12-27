import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Filter, Edit, Trash2, Package, Cloud, RefreshCw, Check, X } from 'lucide-react';
import { RecipeModal } from '../components/RecipeModal';
import { cn } from '../lib/utils';

const API_URL = 'http://127.0.0.1:8000';

// Helper: Get dietitianId
const getDietitianId = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.id ? `user-${user.id}` : 'default-dietitian';
};

// Firebase sync helper
const syncRecipeToFirebase = async (action, recipeData) => {
  try {
    const { addDoc, updateDoc, deleteDoc, doc, collection, query, where, getDocs } = await import('firebase/firestore');
    const { db } = await import('../lib/firebase');
    const { serverTimestamp } = await import('firebase/firestore');
    
    const dietitianId = getDietitianId();
    
    if (action === 'add') {
      await addDoc(collection(db, 'recipes'), {
        name: recipeData.name,
        meal_type: recipeData.meal_type,
        pool_type: recipeData.pool_type || 'standard',
        bki_21_25: recipeData.bki_21_25 || '',
        bki_26_29: recipeData.bki_26_29 || '',
        bki_30_33: recipeData.bki_30_33 || '',
        bki_34_plus: recipeData.bki_34_plus || '',
        seasons: recipeData.seasons || 'yaz,kis',
        packageIds: recipeData.packageIds || [],  // Paket ID'leri
        localId: recipeData.localId,
        dietitianId: dietitianId,
        isGlobal: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✓ Firebase: Tarif eklendi');
    } else if (action === 'update') {
      // Find by name + dietitianId
      const q = query(
        collection(db, 'recipes'),
        where('dietitianId', '==', dietitianId),
        where('name', '==', recipeData.originalName || recipeData.name)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        await updateDoc(doc(db, 'recipes', docSnap.id), {
          name: recipeData.name,
          meal_type: recipeData.meal_type,
          pool_type: recipeData.pool_type || 'standard',
          bki_21_25: recipeData.bki_21_25 || '',
          bki_26_29: recipeData.bki_26_29 || '',
          bki_30_33: recipeData.bki_30_33 || '',
          bki_34_plus: recipeData.bki_34_plus || '',
          seasons: recipeData.seasons || 'yaz,kis',
          packageIds: recipeData.packageIds || [],  // Paket ID'leri
          updatedAt: serverTimestamp()
        });
        console.log('✓ Firebase: Tarif güncellendi');
      } else {
        // Doesn't exist, add it
        await syncRecipeToFirebase('add', recipeData);
      }
    } else if (action === 'delete') {
      const q = query(
        collection(db, 'recipes'),
        where('dietitianId', '==', dietitianId),
        where('name', '==', recipeData.name)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        await deleteDoc(doc(db, 'recipes', snapshot.docs[0].id));
        console.log('✓ Firebase: Tarif silindi');
      }
    }
  } catch (error) {
    console.error('Firebase sync error:', error);
  }
};

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

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

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
      
      // Get Firebase recipes (only user's own, not global)
      const q = query(
        collection(db, 'recipes'),
        where('dietitianId', '==', dietitianId)
      );
      const snapshot = await getDocs(q);
      
      const firebaseRecipes = new Map();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        firebaseRecipes.set(data.name, { firebaseId: doc.id, ...data });
      });
      
      // Push local recipes that don't exist in Firebase
      for (const recipe of recipes) {
        if (!firebaseRecipes.has(recipe.name)) {
          await addDoc(collection(db, 'recipes'), {
            name: recipe.name,
            meal_type: recipe.meal_type,
            pool_type: recipe.pool_type || 'standard',
            bki_21_25: recipe.bki_21_25 || recipe.content || '',
            bki_26_29: recipe.bki_26_29 || '',
            bki_30_33: recipe.bki_30_33 || '',
            bki_34_plus: recipe.bki_34_plus || '',
            seasons: recipe.seasons || 'yaz,kis',
            localId: recipe.id,
            dietitianId: dietitianId,
            isGlobal: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          results.pushed++;
        }
      }
      
      // Pull Firebase recipes that don't exist locally
      const localNames = new Set(recipes.map(r => r.name));
      
      for (const [name, fbRecipe] of firebaseRecipes) {
        if (!localNames.has(name)) {
          // Add to local DB via API
          try {
            await fetch(`${API_URL}/api/recipes`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: fbRecipe.name,
                meal_type: fbRecipe.meal_type,
                pool_type: fbRecipe.pool_type || 'standard',
                bki_21_25: fbRecipe.bki_21_25 || '',
                bki_26_29: fbRecipe.bki_26_29 || '',
                bki_30_33: fbRecipe.bki_30_33 || '',
                bki_34_plus: fbRecipe.bki_34_plus || '',
                seasons: fbRecipe.seasons || 'yaz,kis'
              })
            });
            results.pulled++;
          } catch (e) {
            results.errors.push(e.message);
          }
        }
      }
      
      if (results.pulled > 0) {
        await fetchRecipes();
      }
      
      setSyncStatus(results);
    } catch (error) {
      results.errors.push(error.message);
      setSyncStatus(results);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  }, [recipes]);

  const handleSave = async (formData, packageIds = []) => {
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
        const result = await response.json();
        const recipeId = result.id || currentRecipe?.id;
        
        // Save package assignments
        if (recipeId && packageIds.length >= 0) {
          try {
            await fetch(`${API_URL}/api/recipes/${recipeId}/packages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ package_ids: packageIds })
            });
          } catch (err) {
            console.error('Error saving package assignments:', err);
          }
        }
        
        // Sync to Firebase
        syncRecipeToFirebase(currentRecipe ? 'update' : 'add', {
          ...formData,
          packageIds: packageIds,  // Paket ID'lerini Firebase'e gönder
          localId: recipeId,
          originalName: currentRecipe?.name
        });
        
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

    // Get recipe data for Firebase
    const recipeToDelete = recipes.find(r => r.id === id);

    try {
      const response = await fetch(`${API_URL}/api/recipes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Sync deletion to Firebase
        if (recipeToDelete) {
          syncRecipeToFirebase('delete', recipeToDelete);
        }
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
            onClick={openAddModal}
            className="flex items-center gap-2 bg-finrise-accent hover:bg-finrise-accent/90 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-finrise-accent/20"
          >
            <Plus className="w-5 h-5" />
            Yeni Tarif
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
        <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
          <table className="w-full text-left">
              <thead className="bg-finrise-input/50 text-finrise-muted font-medium border-b border-finrise-border sticky top-0 z-10">
                  <tr>
                      <th className="p-4 pl-6">Tarif Adı</th>
                      <th className="p-4 text-center">Öğün</th>
                      <th className="p-4 text-center">Mevsim</th>
                      <th className="p-4">Paketler</th>
                      <th className="p-4 text-center w-24">İşlemler</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-finrise-border">
                  {loading ? (
                      <tr>
                          <td colSpan="5" className="p-8 text-center text-finrise-muted">Yükleniyor...</td>
                      </tr>
                  ) : filteredRecipes.length === 0 ? (
                      <tr>
                          <td colSpan="5" className="p-8 text-center text-finrise-muted">Tarif bulunamadı.</td>
                      </tr>
                  ) : (
                      filteredRecipes.map((recipe) => {
                          const pkgs = recipePackagesMap[recipe.id] || [];
                          const seasons = (recipe.seasons || '').split(',').filter(Boolean);
                          return (
                              <tr key={recipe.id} className="hover:bg-finrise-input/30 transition-colors group">
                                  <td className="p-4 pl-6">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 text-violet-500 flex items-center justify-center shrink-0 shadow-sm">
                                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
                                                  <path d="M7 2v20"/>
                                                  <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
                                              </svg>
                                          </div>
                                          <span className="font-semibold text-finrise-text">{recipe.name}</span>
                                      </div>
                                  </td>
                                  <td className="p-4 text-center">
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-finrise-accent/10 text-finrise-accent">
                                          {getMealTypeLabel(recipe.meal_type)}
                                      </span>
                                  </td>
                                  <td className="p-4 text-center">
                                      <div className="flex justify-center gap-1">
                                        {seasons.length === 0 ? (
                                          <span className="text-finrise-muted text-xs">-</span>
                                        ) : (
                                          seasons.map(s => (
                                            <span 
                                              key={s} 
                                              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                                s === 'yaz' 
                                                  ? 'bg-amber-500/10 text-amber-400' 
                                                  : 'bg-sky-500/10 text-sky-400'
                                              }`}
                                              title={s === 'yaz' ? 'Yaz' : 'Kış'}
                                            >
                                              {s === 'yaz' ? (
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                                              ) : (
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h5M17 12h5M8 8l-2-2M18 18l-2-2M8 16l-2 2M18 6l-2 2M12 2v5M12 17v5"/></svg>
                                              )}
                                            </span>
                                          ))
                                        )}
                                      </div>
                                  </td>
                                  <td className="p-4">
                                      {pkgs.length === 0 ? (
                                          <span className="text-finrise-muted text-xs italic">Atanmamış</span>
                                      ) : (
                                          <div className="flex flex-wrap gap-1">
                                              {pkgs.slice(0, 2).map(pkg => (
                                                  <span 
                                                      key={pkg.id}
                                                      className="px-2 py-1 rounded-lg text-xs font-medium bg-orange-500/10 text-orange-400"
                                                  >
                                                      {pkg.name}
                                                  </span>
                                              ))}
                                              {pkgs.length > 2 && (
                                                  <span className="px-2 py-1 rounded-lg text-xs font-medium bg-finrise-input text-finrise-muted">
                                                      +{pkgs.length - 2}
                                                  </span>
                                              )}
                                          </div>
                                      )}
                                  </td>
                                  <td className="p-4 text-center">
                                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button 
                                            onClick={() => openEditModal(recipe)}
                                            className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                          >
                                              <Edit className="w-4 h-4" />
                                          </button>
                                          <button 
                                            onClick={() => handleDelete(recipe.id)}
                                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
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
