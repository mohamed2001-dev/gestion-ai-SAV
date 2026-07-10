import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

const emptyForm = {
  company_name: "",
  name: "",
  phone: "",
  email: "",
  city: "",
  address: "",
};

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingClient, setEditingClient] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchClients = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/clients");
      const data = res.data?.clients ?? res.data?.data ?? res.data ?? [];
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger les clients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = useMemo(() => {
    const keyword = search.toLowerCase();
    return clients.filter((client) =>
      [
        client.company_name,
        client.name,
        client.email,
        client.phone,
        client.city,
      ].some((field) => field?.toLowerCase().includes(keyword))
    );
  }, [clients, search]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingClient(null);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, form);
        setSuccess("Client modifié avec succès.");
      } else {
        await api.post("/clients", form);
        setSuccess("Client ajouté avec succès.");
      }
      resetForm();
      fetchClients();
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

  const handleEdit = (client) => {
    setEditingClient(client);
    setForm({
      company_name: client.company_name || "",
      name: client.name || "",
      phone: client.phone || "",
      email: client.email || "",
      city: client.city || "",
      address: client.address || "",
    });
    setError("");
    setSuccess("");
  };

  const handleDelete = async (client) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer le client "${client.name}" ?`)) return;
    setError("");
    setSuccess("");
    try {
  await api.delete(`/clients/${client.id}`);

  setSuccess("Client supprimé avec succès.");
  setError("");

  await fetchClients();

  setTimeout(() => {
    setSuccess("");
  }, 3000);
} catch (err) {
  setError(
    err.response?.data?.message || "Impossible de supprimer ce client."
  );
  setSuccess("");
}
  };

  return (
    <div className="max-w-6xl mx-auto font-body">
      {/* Page header with stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#101826] tracking-tight">
            Gestion des clients
          </h1>
          <p className="text-sm text-[#6b7684] mt-0.5">
            Gérez votre portefeuille clients en toute simplicité
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-[#E3E5E1] rounded-xl px-5 py-2.5 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-[#0E7C86]/10 text-[#0E7C86] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round"/>
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="text-xs text-[#8a95a3]">Total clients</p>
            <p className="text-xl font-semibold text-[#101826]">{clients.length}</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" strokeLinecap="round"/>
          </svg>
          <span className="text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round"/>
            <path d="M22 4L12 14.01l-3-3" strokeLinecap="round"/>
          </svg>
          <span className="text-sm">{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form card */}
        <div className="bg-white rounded-xl border border-[#E3E5E1] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EEF0EC] bg-[#FAFAF9]">
            <h2 className="font-display text-base font-semibold text-[#101826]">
              {editingClient ? "Modifier le client" : "Nouveau client"}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#6b7684] uppercase tracking-wider mb-1">
                Société
              </label>
              <input
                type="text"
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#D7DAD3] px-3 py-2 text-sm outline-none transition focus:border-[#0E7C86] focus:ring-1 focus:ring-[#0E7C86]/20"
                placeholder="nom company"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6b7684] uppercase tracking-wider mb-1">
                Nom du responsable <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#D7DAD3] px-3 py-2 text-sm outline-none transition focus:border-[#0E7C86] focus:ring-1 focus:ring-[#0E7C86]/20"
                placeholder="nom et prenom"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6b7684] uppercase tracking-wider mb-1">
                Téléphone
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#D7DAD3] px-3 py-2 text-sm outline-none transition focus:border-[#0E7C86] focus:ring-1 focus:ring-[#0E7C86]/20"
                placeholder="telephone"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6b7684] uppercase tracking-wider mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#D7DAD3] px-3 py-2 text-sm outline-none transition focus:border-[#0E7C86] focus:ring-1 focus:ring-[#0E7C86]/20"
                placeholder="email"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6b7684] uppercase tracking-wider mb-1">
                Ville
              </label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#D7DAD3] px-3 py-2 text-sm outline-none transition focus:border-[#0E7C86] focus:ring-1 focus:ring-[#0E7C86]/20"
                placeholder="ville"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6b7684] uppercase tracking-wider mb-1">
                Adresse
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#D7DAD3] px-3 py-2 text-sm outline-none transition focus:border-[#0E7C86] focus:ring-1 focus:ring-[#0E7C86]/20 resize-y"
                rows="2"
                placeholder="adresse complète"
              />
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={saving}
                className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition ${
                  saving
                    ? "bg-[#8a95a3] cursor-not-allowed"
                    : "bg-[#0E7C86] hover:bg-[#0b6a72] focus:ring-2 focus:ring-[#0E7C86]/30"
                }`}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                    </svg>
                    Enregistrement...
                  </span>
                ) : editingClient ? (
                  "Modifier le client"
                ) : (
                  "Ajouter le client"
                )}
              </button>

              {editingClient && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-[#6b7684] bg-gray-100 hover:bg-gray-200 transition"
                >
                  Annuler la modification
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E3E5E1] shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[#EEF0EC] flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-[#FAFAF9]">
            <h2 className="font-display text-base font-semibold text-[#101826]">
              Liste des clients
            </h2>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a95a3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-56 rounded-lg border border-[#D7DAD3] pl-9 pr-3 py-2 text-sm outline-none transition focus:border-[#0E7C86] focus:ring-1 focus:ring-[#0E7C86]/20"
                placeholder="Rechercher..."
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2 text-[#8a95a3]">
                <svg className="animate-spin h-6 w-6 text-[#0E7C86]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                </svg>
                <span className="text-sm">Chargement des clients…</span>
              </div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#8a95a3]">
              <svg className="w-12 h-12 mb-2 text-[#D7DAD3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm">Aucun client trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead className="bg-[#F8F9FA] text-[#6b7684] text-xs uppercase tracking-wider border-b border-[#EEF0EC]">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Client</th>
                    <th className="text-left px-5 py-3 font-medium">Contact</th>
                    <th className="text-left px-5 py-3 font-medium">Ville</th>
                    <th className="text-right px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF0EC]">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-[#FAFAF9] transition-colors group">
                      <td className="px-5 py-4">
                        <p className="font-medium text-[#101826]">
                          {client.company_name || client.name}
                        </p>
                        <p className="text-xs text-[#8a95a3]">
                          {client.company_name ? client.name : "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[#101826]">{client.phone || "—"}</p>
                        <p className="text-xs text-[#8a95a3]">{client.email || "—"}</p>
                      </td>
                      <td className="px-5 py-4 text-[#6b7684]">
                        {client.city || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(client)}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium transition"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(client)}
                            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium transition"
                          >
                            Supprimer
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
