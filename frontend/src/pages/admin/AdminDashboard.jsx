import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../api/axios";

const statusStyle = {
  assigned: "bg-[#8a95a3]/10 text-[#5c6b7e]",
  in_progress: "bg-[#FF7A29]/10 text-[#C24A16]",
  completed: "bg-[#1a9c5c]/10 text-[#1a9c5c]",
  cancelled: "bg-red-100 text-red-600",
};

const statusLabel = {
  assigned: "Assignée",
  in_progress: "En cours",
  completed: "Terminée",
  cancelled: "Annulée",
};

const priorityStyle = {
  "high": "text-[#C24A16]",
  "medium": "text-[#5c6b7e]",
  "low": "text-[#8a95a3]",
};

const priorityLabel = {
  "high": "Urgente",
  "medium": "Normale",
  "low": "Basse",
};

const icons = {
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="1.5" />
      <path d="M9 2v4M15 2v4M9 12h6M9 16h4" strokeLinecap="round" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 12h4l1.5 3h5L16 12h4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="4" y="5" width="16" height="15" rx="1.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" strokeLinecap="round" />
      <path d="M16 8.5a3 3 0 1 1 0 5.8" strokeLinecap="round" />
      <path d="M19 20c0-2.6-1.6-4.6-3.7-5.3" strokeLinecap="round" />
    </>
  ),
  check: (
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
  ),
};

// --- Adjust these to match your actual API resource shape ---
function normalizeIntervention(item) {
  const savRequest = item.sav_request ?? item.savRequest ?? {};
  const client = savRequest.client ?? item.client ?? {};

  return {
    id: item.id,
    ref: item.reference ?? `#${item.id}`,
    client: client.company_name ?? client.name ?? item.client_name ?? "—",
    technician: item.technician?.name ?? item.technician_name ?? null,
    priority: savRequest.priority ?? item.priority ?? "medium",
    status: item.status ?? "assigned",
    createdAt: item.created_at ?? null,
  };
}

function normalizeTechnician(item) {
  return {
    id: item.id,
    name: item.name ?? item.user?.name ?? "—",
    active: item.is_active ?? item.active ?? true,
  };
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-[#E3E5E1] p-4 animate-pulse">
      <div className="w-9 h-9 rounded-lg bg-[#EEF0EC] mb-3" />
      <div className="h-6 w-14 bg-[#EEF0EC] rounded mb-2" />
      <div className="h-3 w-24 bg-[#EEF0EC] rounded" />
    </div>
  );
}

export default function AdminDashboard() {
  const [interventions, setInterventions] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [savRequests, setSavRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [insightDismissed, setInsightDismissed] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [interventionsRes, techniciansRes, savRes] = await Promise.all([
        api.get("/interventions"),
        api.get("/technicians"),
        api.get("/sav-requests"),
      ]);

    const rawInterventions =
    interventionsRes.data?.interventions ??
    interventionsRes.data?.data ??
    [];

    const rawTechnicians =
    techniciansRes.data.technicians ??
    techniciansRes.data.data ??
    [];

const rawSav =
  savRes.data?.sav_requests ??
  savRes.data?.data ??
  [];

      setInterventions(rawInterventions.map(normalizeIntervention));
      setTechnicians(rawTechnicians.map(normalizeTechnician));
      setSavRequests(rawSav);
    } catch (err) {
      setError(
        err.response.data.message || "Impossible de charger le tableau de bord. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

    const kpis = useMemo(() => {
    const onGoing = interventions.filter((i) => i.status === "in_progress").length;
    const completed = interventions.filter((i) => i.status === "completed").length;
    const pending = savRequests.filter((r) => (r.status ?? "new") === "new").length;
    const activeTechs = technicians.filter((t) => t.active).length;

    return [
      { label: "Interventions en cours", value: onGoing, icon: "clipboard" },
      { label: "Demandes en attente", value: pending, icon: "inbox" },
      { label: "Techniciens actifs", value: `${activeTechs}/${technicians.length}`, icon: "users" },
      { label: "Interventions terminées", value: completed, icon: "check" },
    ];
  }, [interventions, savRequests, technicians]);

  const recentInterventions = useMemo(() => {
    return [...interventions]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [interventions]);

  const teamLoad = useMemo(() => {
    const counts = {};
    interventions.forEach((i) => {
      if (i.technician && i.status !== "completed") {
        counts[i.technician] = (counts[i.technician] || 0) + 1;
      }
    });
    const max = Math.max(1, ...Object.values(counts));
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / max) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [interventions]);

  // Simple client-side heuristic: flag a client with 3+ interventions in the
  // loaded set. Replace with a real backend AI endpoint once one exists.
  const insight = useMemo(() => {
    const counts = {};
    interventions.forEach((i) => {
      counts[i.client] = (counts[i.client] || 0) + 1;
    });
    const [client, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || [];
    if (count >= 3) {
      return `${client} totalise ${count} interventions récentes — une visite préventive pourrait valoir le coup.`;
    }
    return null;
  }, [interventions]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-[#101826]">Bonjour, Admin</h1>
        <p className="font-body text-sm text-[#6b7684] capitalize">{today}</p>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 bg-[#FDECE3] border border-[#F6C9AE] rounded-lg px-4 py-3 mb-6">
          <p className="font-body text-sm text-[#8a3510]">{error}</p>
          <button onClick={loadDashboard} className="font-body text-sm font-medium text-[#C24A16] hover:underline shrink-0">
            Réessayer
          </button>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : kpis.map((kpi) => (
              <div key={kpi.label} className="bg-white rounded-xl border border-[#E3E5E1] p-4">
                <span className="w-9 h-9 rounded-lg bg-[#0E7C86]/10 text-[#0E7C86] flex items-center justify-center mb-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    {icons[kpi.icon]}
                  </svg>
                </span>
                <p className="font-display text-2xl font-semibold text-[#101826]">{kpi.value}</p>
                <p className="font-body text-xs text-[#8a95a3] mt-0.5">{kpi.label}</p>
              </div>
            ))}
      </div>

      {/* Heuristic insight banner (client-side only, see comment above) */}
      {!loading && insight && !insightDismissed && (
        <div className="flex items-start gap-3 bg-[#101826] text-white rounded-xl px-5 py-4 mb-6">
          <span className="w-8 h-8 shrink-0 rounded-lg bg-[#FF7A29]/20 text-[#FF7A29] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" strokeLinecap="round" />
              <circle cx="12" cy="12" r="3.2" />
            </svg>
          </span>
          <div className="flex-1">
            <p className="font-body text-sm">{insight}</p>
          </div>
          <button
            onClick={() => setInsightDismissed(true)}
            className="text-[#5c6b7e] hover:text-white shrink-0"
            aria-label="Fermer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent interventions table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E3E5E1] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E3E5E1] flex items-center justify-between">
            <h2 className="font-display font-semibold text-[#101826]">Interventions récentes</h2>
            <a href="/admin/interventions" className="font-body text-xs text-[#0E7C86] font-medium hover:underline">
              Voir tout
            </a>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-5 bg-[#EEF0EC] rounded animate-pulse" />
              ))}
            </div>
          ) : recentInterventions.length === 0 ? (
            <p className="px-5 py-8 text-center font-body text-sm text-[#8a95a3]">
              Aucune intervention récente.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="font-mono text-[10px] text-[#8a95a3] text-left tracking-wide">
                  <th className="font-medium px-5 py-2.5">Réf.</th>
                  <th className="font-medium px-2 py-2.5">Client</th>
                  <th className="font-medium px-2 py-2.5">Technicien</th>
                  <th className="font-medium px-2 py-2.5">Priorité</th>
                  <th className="font-medium px-5 py-2.5">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentInterventions.map((row) => (
                  <tr key={row.id} className="border-t border-[#EEF0EC] hover:bg-[#FAFAF9]">
                    <td className="px-5 py-3 font-mono text-xs text-[#5c6b7e]">{row.ref}</td>
                    <td className="px-2 py-3 font-body text-[#101826]">{row.client}</td>
                    <td className="px-2 py-3 font-body text-[#6b7684]">{row.technician || "—"}</td>
                    <td className={`px-2 py-3 font-body text-xs font-medium ${priorityStyle[row.priority] || ""}`}>
                      {priorityLabel[row.priority] || row.priority}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[row.status] || "bg-gray-100 text-gray-600"}`}>
                        {statusLabel[row.status] || row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Team load — computed from interventions currently assigned per technician */}
        <div className="bg-white rounded-xl border border-[#E3E5E1] p-5">
          <h2 className="font-display font-semibold text-[#101826] mb-4">Charge des équipes</h2>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 bg-[#EEF0EC] rounded animate-pulse" />
              ))}
            </div>
          ) : teamLoad.length === 0 ? (
            <p className="font-body text-sm text-[#8a95a3]">Aucune intervention assignée en cours.</p>
          ) : (
            <div className="space-y-4">
              {teamLoad.map((t) => (
                <div key={t.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-body text-sm text-[#101826]">{t.name}</span>
                    <span className="font-mono text-xs text-[#8a95a3]">{t.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#F0F1EE] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${t.pct > 80 ? "bg-[#C24A16]" : "bg-[#0E7C86]"}`}
                      style={{ width: `${t.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
