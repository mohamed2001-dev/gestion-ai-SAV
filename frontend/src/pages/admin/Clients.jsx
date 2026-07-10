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

function initials(client) {
  const source = client.company_name || client.name || "?";
  return source
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

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
      setError(err.response?.data?.message || "Impossible de supprimer ce client.");
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
        <div className="flex items-center gap-3 bg-white border border-[#E3E5E1] rounded-xl px-5 py-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#0E7C86]/10 text-[#0E7C86] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-[#8a95a3]">Total clients</p>
            <p className="font-display text-xl font-semibold text-[#101826]">{clients.length}</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
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
        {/* Form card */}
        <div className="bg-white rounded-xl border border-[#E3E5E1] overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-[#EEF0EC] bg-[#FAFAF9] flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-[#101826]">
              {editingClient ? "Modifier le client" : "Nouveau client"}
            </h2>
            {editingClient && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0E7C86]/10 text-[#0E7C86] text-[11px] font-medium px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0E7C86]" />
                Édition
              </span>
            )}
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
                className="w-full rounded-lg border border-[#D7DAD3] px-3 py-2 text-sm outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/15"
                placeholder="Nom de la société"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6b7684] uppercase tracking-wider mb-1">
                Nom du responsable <span className="text-[#C24A16]">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#D7DAD3] px-3 py-2 text-sm outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/15"
                placeholder="Nom et prénom"
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
                className="w-full rounded-lg border border-[#D7DAD3] px-3 py-2 text-sm outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/15"
                placeholder="Téléphone"
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
                className="w-full rounded-lg border border-[#D7DAD3] px-3 py-2 text-sm outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/15"
                placeholder="Email"
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
                className="w-full rounded-lg border border-[#D7DAD3] px-3 py-2 text-sm outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/15"
                placeholder="Ville"
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
                className="w-full rounded-lg border border-[#D7DAD3] px-3 py-2 text-sm outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/15 resize-y"
                rows="2"
                placeholder="Adresse complète"
              />
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
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
                  className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-[#6b7684] bg-[#F6F7F5] hover:bg-[#EDEEE9] transition"
                >
                  Annuler la modification
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E3E5E1] overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[#EEF0EC] flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-[#FAFAF9]">
            <h2 className="font-display text-base font-semibold text-[#101826]">Liste des clients</h2>
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
          ) : filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-[#8a95a3]">
              <svg className="w-12 h-12 mb-2 text-[#D7DAD3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-sm">Aucun client trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="font-mono text-[10px] text-[#8a95a3] text-left tracking-wide border-b border-[#EEF0EC]">
                    <th className="font-medium px-5 py-2.5">Client</th>
                    <th className="font-medium px-2 py-2.5">Contact</th>
                    <th className="font-medium px-2 py-2.5">Ville</th>
                    <th className="font-medium px-5 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF0EC]">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-[#FAFAF9] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 shrink-0 rounded-full bg-[#0E7C86]/10 text-[#0E7C86] flex items-center justify-center font-display font-semibold text-xs">
                            {initials(client)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-[#101826] truncate">
                              {client.company_name || client.name}
                            </p>
                            <p className="text-xs text-[#8a95a3] truncate">
                              {client.company_name ? client.name : "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3.5">
                        <p className="text-[#101826]">{client.phone || "—"}</p>
                        <p className="text-xs text-[#8a95a3]">{client.email || "—"}</p>
                      </td>
                      <td className="px-2 py-3.5 text-[#6b7684]">{client.city || "—"}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(client)}
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
                            onClick={() => handleDelete(client)}
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
