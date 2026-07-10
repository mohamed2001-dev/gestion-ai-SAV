import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

const emptyForm = {
  name: "",
  email: "",
  password: "",
};

export default function Technicians() {
  const [technicians, setTechnicians] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingTechnician, setEditingTechnician] = useState(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const showSuccess = (message) => {
    setSuccess(message);

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  const fetchTechnicians = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/technicians");

      const data = res.data?.technicians ?? res.data?.data ?? res.data ?? [];

      setTechnicians(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger les techniciens.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const filteredTechnicians = useMemo(() => {
    const keyword = search.toLowerCase();

    return technicians.filter((technician) => {
      return (
        technician.name?.toLowerCase().includes(keyword) ||
        technician.email?.toLowerCase().includes(keyword)
      );
    });
  }, [technicians, search]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingTechnician(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingTechnician) {
        const payload = {
          name: form.name,
          email: form.email,
        };

        if (form.password.trim() !== "") {
          payload.password = form.password;
        }

        await api.put(`/technicians/${editingTechnician.id}`, payload);

        showSuccess("Technicien modifié avec succès.");
      } else {
        await api.post("/technicians", form);

        showSuccess("Technicien ajouté avec succès.");
      }

      resetForm();
      await fetchTechnicians();
    } catch (err) {
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0][0];
        setError(firstError);
      } else {
        setError(err.response?.data?.message || "Une erreur est survenue.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (technician) => {
    setEditingTechnician(technician);

    setForm({
      name: technician.name || "",
      email: technician.email || "",
      password: "",
    });

    setError("");
    setSuccess("");
  };

  const handleDelete = async (technician) => {
    const confirmDelete = window.confirm(
      `Voulez-vous vraiment supprimer le technicien "${technician.name}" ?`
    );

    if (!confirmDelete) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/technicians/${technician.id}`);

      showSuccess("Technicien supprimé avec succès.");

      await fetchTechnicians();
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de supprimer ce technicien.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#101826] tracking-tight">
            Gestion des techniciens
          </h1>
          <p className="text-sm text-[#6b7684] mt-0.5">
            Ajouter, modifier et gérer les comptes des techniciens SAV
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white border border-[#E3E5E1] rounded-xl px-5 py-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#0E7C86]/10 text-[#0E7C86] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 1 5.4-5.4L15 12l-1-1 2.7-2.7Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-[#8a95a3]">Total techniciens</p>
            <p className="font-display text-xl font-semibold text-[#101826]">{technicians.length}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-3 bg-[#FDECE3] border border-[#F6C9AE] text-[#8a3510] rounded-xl px-4 py-3 mb-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
          </svg>
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 bg-[#1a9c5c]/10 border border-[#1a9c5c]/25 text-[#146b40] rounded-xl px-4 py-3 mb-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
            <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" />
          </svg>
          <span className="text-sm">{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-xl border border-[#E3E5E1] overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-[#EEF0EC] bg-[#FAFAF9] flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-[#101826]">
              {editingTechnician ? "Modifier le technicien" : "Nouveau technicien"}
            </h2>
            {editingTechnician && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0E7C86]/10 text-[#0E7C86] text-[11px] font-medium px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0E7C86]" />
                Édition
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#6b7684] uppercase tracking-wider mb-1">
                Nom complet <span className="text-[#C24A16]">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#D7DAD3] px-3 py-2 text-sm outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/15"
                placeholder="nom complet"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6b7684] uppercase tracking-wider mb-1">
                Email <span className="text-[#C24A16]">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#D7DAD3] px-3 py-2 text-sm outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/15"
                placeholder="email"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6b7684] uppercase tracking-wider mb-1">
                Mot de passe {editingTechnician ? "" : <span className="text-[#C24A16]">*</span>}
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#D7DAD3] px-3 py-2 text-sm outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/15"
                placeholder={editingTechnician ? "Laisser vide pour garder l'ancien" : "Minimum 6 caractères"}
                required={!editingTechnician}
              />

              {editingTechnician && (
                <p className="text-xs text-[#8a95a3] mt-1.5">
                  Laissez vide si vous ne voulez pas changer le mot de passe.
                </p>
              )}
            </div>

            <div className="pt-2 space-y-2">
              <button
                disabled={saving}
                className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition ${
                  saving
                    ? "bg-[#8a95a3] cursor-not-allowed"
                    : "bg-[#FF7A29] hover:bg-[#E96A1D] active:bg-[#D3600F]"
                }`}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4Z" />
                    </svg>
                    Enregistrement...
                  </>
                ) : editingTechnician ? (
                  "Modifier le technicien"
                ) : (
                  "Ajouter le technicien"
                )}
              </button>

              {editingTechnician && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-[#6b7684] bg-[#F6F7F5] hover:bg-[#EDEEE9] transition"
                >
                  Annuler la modification
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E3E5E1] overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[#EEF0EC] flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-[#FAFAF9]">
            <h2 className="font-display text-base font-semibold text-[#101826]">Liste des techniciens</h2>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a95a3]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-56 rounded-lg border border-[#D7DAD3] pl-9 pr-3 py-2 text-sm outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/15"
                placeholder="Rechercher..."
              />
            </div>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-[#EEF0EC] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredTechnicians.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-[#8a95a3]">
              <svg className="w-12 h-12 mb-2 text-[#D7DAD3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 1 5.4-5.4L15 12l-1-1 2.7-2.7Z"
                />
              </svg>
              <p className="text-sm">Aucun technicien trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="font-mono text-[10px] text-[#8a95a3] text-left tracking-wide border-b border-[#EEF0EC]">
                    <th className="font-medium px-5 py-2.5">Technicien</th>
                    <th className="font-medium px-2 py-2.5">Email</th>
                    <th className="font-medium px-2 py-2.5">Rôle</th>
                    <th className="font-medium px-5 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EEF0EC]">
                  {filteredTechnicians.map((technician) => (
                    <tr key={technician.id} className="hover:bg-[#FAFAF9] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 shrink-0 rounded-full bg-[#0E7C86]/10 text-[#0E7C86] flex items-center justify-center font-display font-semibold text-xs">
                            {(technician.name || "T").slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-[#101826] truncate">{technician.name}</p>
                            <p className="font-mono text-[11px] text-[#8a95a3]">ID: {technician.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-3.5 text-[#6b7684]">{technician.email}</td>

                      <td className="px-2 py-3.5">
                        <span className="inline-block rounded-full bg-[#FF7A29]/10 text-[#C24A16] px-2.5 py-1 text-xs font-medium">
                          {technician.role || "technician"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(technician)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0E7C86]/10 text-[#0E7C86] hover:bg-[#0E7C86]/20 transition"
                            aria-label="Modifier"
                            title="Modifier"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M12 20h9" strokeLinecap="round" />
                              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>

                          <button
                            onClick={() => handleDelete(technician)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#C24A16]/10 text-[#C24A16] hover:bg-[#C24A16]/20 transition"
                            aria-label="Supprimer"
                            title="Supprimer"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M3 6h18" strokeLinecap="round" />
                              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
