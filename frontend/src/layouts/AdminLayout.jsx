import { Link, Outlet, useLocation } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

const icons = {
  dashboard: (
    <path
      d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V11h-6v9Zm0-16v5h6V4h-6Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  clients: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path
        d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5"
        strokeLinecap="round"
      />
      <path d="M16 8.5a3 3 0 1 1 0 5.8" strokeLinecap="round" />
      <path d="M19 20c0-2.6-1.6-4.6-3.7-5.3" strokeLinecap="round" />
    </>
  ),
  technicians: (
    <path
      d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 1 5.4-5.4L15 12l-1-1 2.7-2.7Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  equipments: (
    <>
      <rect x="4" y="7" width="16" height="13" rx="1.5" />
      <path
        d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        strokeLinecap="round"
      />
    </>
  ),
  requests: (
    <>
      <path
        d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 11h6M9 15h4" strokeLinecap="round" />
    </>
  ),
  interventions: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="1.5" />
      <path d="M9 2v4M15 2v4M9 12h6M9 16h4" strokeLinecap="round" />
    </>
  ),
};

const navItems = [
  { to: "/admin/dashboard", label: "Tableau de bord", icon: "dashboard" },
  { to: "/admin/clients", label: "Clients", icon: "clients" },
  { to: "/admin/technicians", label: "Techniciens", icon: "technicians" },
  { to: "/admin/equipments", label: "Équipements", icon: "equipments" },
  { to: "/admin/sav-requests", label: "Demandes SAV", icon: "requests" },
  { to: "/admin/interventions", label: "Interventions", icon: "interventions" },
];

export default function AdminLayout() {
  const location = useLocation();

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  return (
    <div className="min-h-screen flex bg-[#F8F9FA] font-body">
      {/* Sidebar */}
      <aside className="w-64 bg-[#101826] text-white flex flex-col">
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="px-5 pt-6 pb-6 flex items-center gap-2 border-b border-white/10">
            <div className="w-8 h-8 rounded-md bg-[#FF7A29] flex items-center justify-center font-display font-bold text-[#101826] text-sm">
              D
            </div>

            <div>
              <p className="font-display font-semibold text-sm leading-tight">
                DEWEB TECHNOLOGY
              </p>
              <p className="font-mono text-[10px] text-[#5c6b7e] tracking-wide">
                ADMIN
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-3 py-5 space-y-1 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = location.pathname.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium border-l-2 transition-all ${
                    active
                      ? "bg-white/10 text-white border-[#FF7A29] shadow-sm"
                      : "text-[#a8b3c2] border-transparent hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    {icons[item.icon]}
                  </svg>

                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User + Logout */}
          <div className="px-4 pb-5 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2.5 rounded-lg bg-white/5 px-3 py-2.5 mb-3">
              <div className="w-8 h-8 shrink-0 rounded-full bg-[#0E7C86]/25 text-[#5fd0c2] flex items-center justify-center font-display font-semibold text-xs">
                {(user?.name || "A").slice(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || "Administrateur"}
                </p>
                <p className="text-xs text-[#7b879a] truncate">
                  {user?.email || "admin@deweb-technology.com"}
                </p>
              </div>
            </div>

            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto bg-[#F8F9FA]">
        <Outlet />
      </main>
    </div>
  );
}
