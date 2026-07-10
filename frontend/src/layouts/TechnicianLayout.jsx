import { Link, Outlet, useLocation } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

const navItems = [
  {
    to: "/technician/dashboard",
    label: "Tableau de bord",
    icon: (
      <path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V11h-6v9Zm0-16v5h6V4h-6Z" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    to: "/technician/my-interventions",
    label: "Mes interventions",
    icon: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="1.5" />
        <path d="M9 2v4M15 2v4M9 12h6M9 16h4" strokeLinecap="round" />
      </>
    ),
  },
];

export default function TechnicianLayout() {
  const location = useLocation();

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  return (
    <div className="min-h-screen flex bg-[#F6F7F5] font-body">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <aside className="w-64 shrink-0 bg-[#101826] text-white flex flex-col justify-between">
        <div>
          <div className="px-5 pt-6 pb-6 flex items-center gap-2 border-b border-white/10">
            <div className="w-8 h-8 rounded-md bg-[#FF7A29] flex items-center justify-center font-display font-bold text-[#101826] text-sm">
              D
            </div>
            <div>
              <p className="font-display font-semibold text-sm leading-tight">DEWEB TECHNOLOGY</p>
              <p className="font-mono text-[10px] text-[#5c6b7e] tracking-wide">TECHNICIEN</p>
            </div>
          </div>

          <nav className="px-3 py-5 space-y-1">
            {navItems.map((item) => {
              const active = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium border-l-2 transition ${
                    active
                      ? "bg-white/10 text-white border-[#0E7C86]"
                      : "text-[#a8b3c2] border-transparent hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    {item.icon}
                  </svg>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-4 pb-5">
          <div className="flex items-center gap-2.5 rounded-lg bg-white/5 px-3 py-2.5 mb-3">
            <div className="w-8 h-8 shrink-0 rounded-full bg-[#FF7A29]/20 text-[#ffab6f] flex items-center justify-center font-display font-semibold text-xs">
              {(user?.name || "T").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || "Technicien"}</p>
              <p className="text-xs text-[#7b879a] truncate">{user?.email || "technicien@deweb-technology.com"}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 bg-white border-b border-[#E3E5E1] px-6 flex items-center justify-between">
          <p className="font-display font-semibold text-[#101826]">
            {navItems.find((i) => location.pathname.startsWith(i.to))?.label || "Espace technicien"}
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0E7C86]/10 text-[#0E7C86] text-xs font-medium px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0E7C86]" />
            En ligne
          </span>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
