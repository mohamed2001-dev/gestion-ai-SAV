import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const priorityStyle = {
  urgent: "text-red-700 bg-red-100",
  high: "text-[#C24A16] bg-[#C24A16]/10",
  medium: "text-[#5c6b7e] bg-[#8a95a3]/10",
  low: "text-[#8a95a3] bg-[#8a95a3]/10",
};

const priorityLabel = {
  urgent: "Très urgente",
  high: "Urgente",
  medium: "Normale",
  low: "Basse",
};

const statusStyle = {
  assigned: "bg-[#0E7C86]/10 text-[#0E7C86]",
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

function normalizeIntervention(item) {
  const savRequest = item.sav_request ?? item.savRequest ?? {};
  const client = savRequest.client ?? {};
  const equipment = savRequest.equipment ?? {};

  const interventionDate = item.intervention_date ?? null;
  const startTime = item.start_time ?? null;

  return {
    id: item.id,
    ref: item.reference ?? `#${item.id}`,
    client: client.company_name ?? client.name ?? "—",
    site: equipment.type ?? equipment.name ?? equipment.model ?? "",
    address: client.address ?? "",
    scheduledAt: interventionDate
      ? `${interventionDate}T${startTime || "00:00"}`
      : null,
    priority: savRequest.priority ?? "medium",
    status: item.status ?? "assigned",
  };
}

function isToday(dateStr) {
  if (!dateStr) return false;

  const date = new Date(dateStr);
  const now = new Date();

  return date.toDateString() === now.toDateString();
}

function formatTime(dateStr) {
  if (!dateStr) return "—";

  return new Date(dateStr).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TechnicianDashboard() {
  const navigate = useNavigate();

  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const loadInterventions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/my-interventions");

      const raw = res.data?.interventions ?? res.data?.data ?? [];

      setInterventions(raw.map(normalizeIntervention));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de charger vos interventions. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInterventions();
  }, [loadInterventions]);

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  const todayList = useMemo(() => {
    return interventions
      .filter((intervention) => isToday(intervention.scheduledAt))
      .sort(
        (a, b) =>
          new Date(a.scheduledAt || 0) - new Date(b.scheduledAt || 0)
      );
  }, [interventions]);

  const stats = useMemo(() => {
    const completedThisWeek = interventions.filter((intervention) => {
      if (intervention.status !== "completed" || !intervention.scheduledAt) {
        return false;
      }

      const interventionDate = new Date(intervention.scheduledAt);
      const now = new Date();
      const weekAgo = new Date(now);

      weekAgo.setDate(now.getDate() - 7);

      return interventionDate >= weekAgo && interventionDate <= now;
    }).length;

    return [
      {
        label: "Aujourd'hui",
        value: todayList.length,
      },
      {
        label: "Terminées cette semaine",
        value: completedThisWeek,
      },
      {
        label: "En cours",
        value: interventions.filter(
          (intervention) => intervention.status === "in_progress"
        ).length,
      },
    ];
  }, [interventions, todayList]);

  const next = useMemo(() => {
    return (
      todayList.find((intervention) => intervention.status !== "completed") ||
      null
    );
  }, [todayList]);

  const openIntervention = (id) => {
    navigate(`/technician/interventions/${id}`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-[#101826]">
          Bonjour, {user?.name?.split(" ")[0] || "Technicien"}
        </h1>

        <p className="font-body text-sm text-[#6b7684] capitalize">{today}</p>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 bg-[#FDECE3] border border-[#F6C9AE] rounded-lg px-4 py-3 mb-6">
          <p className="font-body text-sm text-[#8a3510]">{error}</p>

          <button
            onClick={loadInterventions}
            className="font-body text-sm font-medium text-[#C24A16] hover:underline shrink-0"
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-[#E3E5E1] p-4 animate-pulse"
              >
                <div className="h-6 w-10 bg-[#EEF0EC] rounded mx-auto mb-2" />
                <div className="h-3 w-16 bg-[#EEF0EC] rounded mx-auto" />
              </div>
            ))
          : stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl border border-[#E3E5E1] p-4 text-center"
              >
                <p className="font-display text-xl font-semibold text-[#101826]">
                  {stat.value}
                </p>
                <p className="font-body text-xs text-[#8a95a3] mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E3E5E1] p-6 mb-6 animate-pulse space-y-3">
          <div className="h-3 w-32 bg-[#EEF0EC] rounded" />
          <div className="h-5 w-48 bg-[#EEF0EC] rounded" />
          <div className="h-3 w-64 bg-[#EEF0EC] rounded" />
          <div className="h-9 w-40 bg-[#EEF0EC] rounded" />
        </div>
      ) : next ? (
        <div className="relative bg-white rounded-2xl border border-[#E3E5E1] shadow-[0_1px_2px_rgba(16,24,38,0.04),0_12px_28px_-10px_rgba(16,24,38,0.16)] overflow-hidden mb-6">
          <div className="absolute -top-3 left-0 right-0 flex justify-between px-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <span
                key={index}
                className="w-2.5 h-2.5 rounded-full bg-[#F6F7F5] border border-[#E3E5E1]"
              />
            ))}
          </div>

          <div className="pt-7 px-6 pb-3 flex items-center justify-between border-b border-dashed border-[#D7DAD3]">
            <p className="font-mono text-[11px] text-[#8a95a3] tracking-wide">
              RÉF. {next.ref}
            </p>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full text-[11px] font-medium px-2.5 py-1 ${
                priorityStyle[next.priority] || "text-gray-600 bg-gray-100"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {priorityLabel[next.priority] || next.priority}
            </span>
          </div>

          <div className="px-6 pt-4 pb-6">
            <p className="font-mono text-xs text-[#0E7C86] tracking-widest mb-1">
              PROCHAINE INTERVENTION — {formatTime(next.scheduledAt)}
            </p>

            <h2 className="font-display text-lg font-semibold text-[#101826] mb-1">
              {next.client}
            </h2>

            {next.site && (
              <p className="font-body text-sm text-[#6b7684] mb-1">
                {next.site}
              </p>
            )}

            {next.address && (
              <p className="font-body text-xs text-[#8a95a3] mb-5 flex items-center gap-1.5">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="10" r="2.3" />
                </svg>

                {next.address}
              </p>
            )}

            <button
              onClick={() => openIntervention(next.id)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF7A29] px-6 py-2.5 font-body font-semibold text-white transition hover:bg-[#E96A1D] active:bg-[#D3600F]"
            >
              Démarrer l'intervention

              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E3E5E1] p-6 mb-6 text-center">
          <p className="font-body text-sm text-[#8a95a3]">
            Aucune intervention prévue aujourd'hui.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E3E5E1] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E3E5E1]">
          <h2 className="font-display font-semibold text-[#101826]">
            Mes interventions du jour
          </h2>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-5 bg-[#EEF0EC] rounded animate-pulse"
              />
            ))}
          </div>
        ) : todayList.length === 0 ? (
          <p className="px-5 py-8 text-center font-body text-sm text-[#8a95a3]">
            Rien de prévu aujourd'hui.
          </p>
        ) : (
          <div className="divide-y divide-[#EEF0EC]">
            {todayList.map((item) => (
              <button
                key={item.id}
                onClick={() => openIntervention(item.id)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-[#FAFAF9] transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs text-[#8a95a3] w-12 shrink-0">
                    {formatTime(item.scheduledAt)}
                  </span>

                  <div className="min-w-0">
                    <p className="font-body text-sm text-[#101826] truncate">
                      {item.client}
                    </p>
                    <p className="font-mono text-[11px] text-[#8a95a3]">
                      {item.ref}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      priorityStyle[item.priority] || "text-gray-600 bg-gray-100"
                    }`}
                  >
                    {priorityLabel[item.priority] || item.priority}
                  </span>

                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      statusStyle[item.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {statusLabel[item.status] || item.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
