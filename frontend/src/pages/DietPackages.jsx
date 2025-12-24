import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Package,
  Folder,
  FileText,
  TrendingDown,
  Calendar,
  XCircle,
  Scale,
} from "lucide-react";
import { cn } from "../lib/utils";

const API_URL = "http://127.0.0.1:8000";

export default function DietPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    save_path: "",
    list_count: 1,
    days_per_list: 7,
    weight_change_per_list: 0,
  });

  // Load packages from API
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/packages`);
      const data = await response.json();
      setPackages(data);
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (pkg = null) => {
    if (pkg) {
      setEditingId(pkg.id);
      setFormData({
        name: pkg.name || "",
        description: pkg.description || "",
        save_path: pkg.save_path || "",
        list_count: pkg.list_count || 1,
        days_per_list: pkg.days_per_list || 7,
        weight_change_per_list: pkg.weight_change_per_list || 0,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        save_path: "",
        list_count: 1,
        days_per_list: 7,
        weight_change_per_list: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      description: formData.description || "",
      save_path: formData.save_path,
      list_count: Number(formData.list_count) || 1,
      days_per_list: Number(formData.days_per_list) || 7,
      weight_change_per_list: Number(formData.weight_change_per_list) || 0,
    };

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_URL}/api/packages/${editingId}`
        : `${API_URL}/api/packages`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchPackages();
      } else {
        const error = await response.json();
        alert("Hata: " + error.detail);
      }
    } catch (error) {
      console.error("Error saving package:", error);
      alert("Paket kaydedilirken hata oluştu");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu paketi silmek istediğinize emin misiniz?")) return;

    try {
      const response = await fetch(`${API_URL}/api/packages/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchPackages();
      } else {
        const error = await response.json();
        alert("Hata: " + error.detail);
      }
    } catch (error) {
      console.error("Error deleting package:", error);
      alert("Paket silinirken hata oluştu");
    }
  };

  const filteredPackages = packages.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Toplam gün ve kilo değişimini hesapla
  const calculateTotals = (pkg) => {
    const totalDays = (pkg.list_count || 0) * (pkg.days_per_list || 0);
    const totalWeight =
      (pkg.list_count || 0) * (pkg.weight_change_per_list || 0);
    return { totalDays, totalWeight };
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 p-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-finrise-text mb-1">
              Diyet Paketleri
            </h1>
            <p className="text-finrise-muted">
              Hazır diyet şablon paketlerini yönetin
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-finrise-accent text-white px-4 py-2 rounded-lg hover:bg-finrise-accent/90 transition-colors shadow-lg shadow-finrise-accent/20"
          >
            <Plus size={18} />
            <span className="font-medium">Yeni Paket</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 p-3 bg-finrise-panel border border-finrise-border rounded-xl">
          <Search className="text-finrise-muted ml-1" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Paket ara..."
            className="flex-1 bg-transparent text-finrise-text outline-none placeholder:text-finrise-muted"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 px-6 pb-6 overflow-hidden min-h-0">
        <div className="bg-finrise-panel border border-finrise-border rounded-2xl overflow-hidden h-full flex flex-col">
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-finrise-input sticky top-0 z-10">
                <tr>
                  <th className="p-4 font-semibold text-finrise-text border-b border-finrise-border">
                    Paket Adı
                  </th>
                  <th className="p-4 font-semibold text-finrise-text border-b border-finrise-border text-center">
                    Liste
                  </th>
                  <th className="p-4 font-semibold text-finrise-text border-b border-finrise-border text-center">
                    Kilo/Liste
                  </th>
                  <th className="p-4 font-semibold text-finrise-text border-b border-finrise-border text-center">
                    Toplam
                  </th>
                  <th className="p-4 font-semibold text-finrise-text border-b border-finrise-border text-center w-24">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-finrise-border">
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-8 text-center text-finrise-muted"
                    >
                      Yükleniyor...
                    </td>
                  </tr>
                ) : filteredPackages.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-8 text-center text-finrise-muted"
                    >
                      Paket bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredPackages.map((pkg) => {
                    const { totalDays, totalWeight } = calculateTotals(pkg);
                    return (
                      <tr
                        key={pkg.id}
                        className="hover:bg-finrise-input/50 transition-colors group"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 text-orange-500 flex items-center justify-center shrink-0 shadow-sm">
                              <Package size={20} />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-finrise-text truncate">
                                {pkg.name}
                              </div>
                              {pkg.description && (
                                <div className="text-xs text-finrise-muted truncate">
                                  {pkg.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-sm font-medium">
                            <FileText size={14} />
                            {pkg.list_count} × {pkg.days_per_list} gün
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
                              pkg.weight_change_per_list < 0
                                ? "bg-emerald-500/10 text-emerald-400"
                                : pkg.weight_change_per_list > 0
                                ? "bg-red-500/10 text-red-400"
                                : "bg-finrise-input text-finrise-muted"
                            )}
                          >
                            <TrendingDown size={14} className={pkg.weight_change_per_list >= 0 ? "rotate-180" : ""} />
                            {pkg.weight_change_per_list > 0 ? "+" : ""}
                            {pkg.weight_change_per_list} kg
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="inline-flex flex-col items-center gap-0.5">
                            <span className="text-sm font-bold text-finrise-text">{totalDays} gün</span>
                            <span
                              className={cn(
                                "text-xs font-medium",
                                totalWeight < 0
                                  ? "text-emerald-400"
                                  : totalWeight > 0
                                  ? "text-red-400"
                                  : "text-finrise-muted"
                              )}
                            >
                              {totalWeight > 0 ? "+" : ""}
                              {totalWeight} kg hedef
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenModal(pkg)}
                              className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(pkg.id)}
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
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
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-finrise-panel w-full max-w-lg rounded-2xl border border-finrise-border shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-finrise-text">
                {editingId ? "Paketi Düzenle" : "Yeni Diyet Paketi"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-finrise-muted hover:text-finrise-text"
              >
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-finrise-text">
                  Paket Adı
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Örn: 1 Aylık Zayıflama Diyeti"
                  className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-3 text-finrise-text outline-none focus:border-finrise-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-finrise-text">
                  Açıklama (Opsiyonel)
                </label>
                <input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Paket hakkında kısa açıklama"
                  className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-3 text-finrise-text outline-none focus:border-finrise-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-finrise-text">
                  Kayıt Yolu (Klasör)
                </label>
                <div className="relative">
                  <Folder
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-finrise-muted"
                    size={18}
                  />
                  <input
                    required
                    value={formData.save_path}
                    onChange={(e) =>
                      setFormData({ ...formData, save_path: e.target.value })
                    }
                    placeholder="C:/Diyetler/Zayiflama"
                    className="w-full bg-finrise-input border border-finrise-border rounded-xl pl-10 pr-4 py-3 text-finrise-text outline-none focus:border-finrise-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-finrise-text">
                    Liste Sayısı
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.list_count}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        list_count:
                          e.target.value === "" ? "" : parseInt(e.target.value),
                      })
                    }
                    className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-3 text-finrise-text outline-none focus:border-finrise-accent no-spinner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-finrise-text">
                    Liste Başına Gün
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.days_per_list}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        days_per_list:
                          e.target.value === "" ? "" : parseInt(e.target.value),
                      })
                    }
                    className="w-full bg-finrise-input border border-finrise-border rounded-xl px-4 py-3 text-finrise-text outline-none focus:border-finrise-accent no-spinner"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-finrise-text">
                  Liste Başına Kilo Hedefi (kg)
                </label>
                <div className="relative">
                  <Scale
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-finrise-muted"
                    size={18}
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight_change_per_list}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weight_change_per_list:
                          e.target.value === ""
                            ? ""
                            : parseFloat(e.target.value),
                      })
                    }
                    placeholder="-2 (zayıflama için negatif)"
                    className="w-full bg-finrise-input border border-finrise-border rounded-xl pl-10 pr-4 py-3 text-finrise-text outline-none focus:border-finrise-accent no-spinner"
                  />
                </div>
                <p className="text-xs text-finrise-muted">
                  Zayıflama için negatif değer girin (örn: -2)
                </p>
              </div>

              {/* Summary */}
              {formData.list_count && formData.days_per_list && (
                <div className="p-3 bg-finrise-input/50 rounded-xl border border-finrise-border">
                  <div className="text-sm text-finrise-muted">Özet:</div>
                  <div className="text-finrise-text font-medium">
                    {formData.list_count} liste × {formData.days_per_list} gün ={" "}
                    {formData.list_count * formData.days_per_list} gün toplam
                  </div>
                  {formData.weight_change_per_list !== 0 && (
                    <div
                      className={cn(
                        "text-sm font-medium mt-1",
                        formData.weight_change_per_list < 0
                          ? "text-emerald-500"
                          : "text-red-500"
                      )}
                    >
                      Toplam hedef:{" "}
                      {formData.weight_change_per_list > 0 ? "+" : ""}
                      {formData.list_count * formData.weight_change_per_list} kg
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-finrise-border text-finrise-text hover:bg-finrise-input transition-colors font-medium"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-finrise-accent text-white hover:bg-finrise-accent/90 transition-colors font-medium shadow-lg shadow-finrise-accent/20"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
