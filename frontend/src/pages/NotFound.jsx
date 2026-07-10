import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F7F5] px-4 relative overflow-hidden font-body">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* blueprint dot-grid backdrop, same language as the login screen */}
      <div
        className="absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage: "radial-gradient(#c7cdc3 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="relative bg-white rounded-2xl shadow-[0_1px_2px_rgba(16,24,38,0.04),0_16px_40px_-12px_rgba(16,24,38,0.18)] border border-[#E3E5E1] overflow-hidden">
          {/* perforated ticket edge */}
          <div className="absolute -top-3 left-0 right-0 flex justify-between px-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="w-2.5 h-2.5 rounded-full bg-[#F6F7F5] border border-[#E3E5E1]" />
            ))}
          </div>

          {/* ticket header */}
          <div className="pt-7 px-8 pb-4 flex items-center justify-between border-b border-dashed border-[#D7DAD3]">
            <p className="font-mono text-[11px] text-[#8a95a3] tracking-wide">RÉF. INTROUVABLE</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C24A16]/10 text-[#C24A16] text-[11px] font-medium px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C24A16]" />
              Erreur 404
            </span>
          </div>

          <div className="px-8 pt-8 pb-9 text-center">
            <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-[#101826] flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF7A29" strokeWidth="2">
                <circle cx="11" cy="11" r="7" strokeLinecap="round" />
                <path d="M21 21l-4.3-4.3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 9.5c0-1 .8-1.7 2-1.7s2 .6 2 1.5c0 .8-.5 1.1-1.2 1.6-.5.4-.8.7-.8 1.3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="11" cy="14.2" r="0.15" fill="#FF7A29" stroke="#FF7A29" />
              </svg>
            </div>

            <p className="font-display text-5xl font-semibold text-[#101826] mb-2">404</p>
            <h1 className="font-display text-lg font-semibold text-[#101826] mb-2">Page introuvable</h1>
            <p className="font-body text-sm text-[#6b7684] mb-7 max-w-xs mx-auto">
              Ce bon d'intervention n'existe pas, ou la page a été déplacée.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg cursor-pointer
              bg-[#FF7A29] px-6 py-2.5 font-body font-semibold text-white transition hover:bg-[#E96A1D] active:bg-[#D3600F]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Retour à la connexion
            </button>
          </div>
        </div>

        <p className="font-body text-center text-xs text-[#8a95a3] mt-6">
          DEWEB Technology — Gestion SAV
        </p>
      </div>
    </div>
  );
}
