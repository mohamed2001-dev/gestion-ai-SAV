import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

// Reference number shown on the ticket header — purely cosmetic,
// evokes the "Bon d'intervention" the technicians fill out every day.
function useTicketRef() {
    const [ref] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `BI-${y}-${rand}`;
    });
    return ref;
}

function EyeIcon({ open }) {
    return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 3l18 18M10.6 10.7a3 3 0 0 0 4.2 4.2M6.7 6.9C4.3 8.3 2.6 10.4 1 12c0 0 4 7 11 7 2 0 3.7-.5 5.1-1.2M9.9 4.2A11.5 11.5 0 0 1 12 5c7 0 11 7 11 7-.6 1-1.4 2.1-2.4 3.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    );
}

export default function Login() {
    const navigate = useNavigate();
    const ticketRef = useTicketRef();

    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
        const response = await api.post("/login", form);

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        const role = response.data.user.role;

        if (role === "admin") {
        navigate("/admin/dashboard");
        } else {
        navigate("/technician/dashboard");
        }
    } catch (err) {
        if (err.response?.data?.message) {
        setError(err.response.data.message);
        } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
        }
    } finally {
        setLoading(false);
    }
    };

    const today = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    });

    return (
    <div className="min-h-screen flex bg-[#F6F7F5]">
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        `}</style>

      {/* LEFT — brand panel */}
        <div className="hidden lg:flex lg:w-[46%] relative bg-[#101826] text-white flex-col justify-between overflow-hidden">
        {/* blueprint dot-grid backdrop */}
        <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
            backgroundImage: "radial-gradient(#8fa3b8 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            }}
        />
        <div
            className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #FF7A29 0%, transparent 70%)" }}
        />

        <div className="relative z-10 px-12 pt-12">
            <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-md bg-[#FF7A29] flex items-center justify-center font-display font-bold text-[#101826]">
                D
            </div>
            <span className="font-display font-semibold tracking-wide text-lg">
                DEWEB <span className="text-[#8fa3b8] font-normal">TECHNOLOGY</span>
            </span>
            </div>
        </div>

        <div className="relative z-10 px-12">
          <p className="font-mono text-xs text-[#0E7C86] tracking-widest mb-3">GESTION SAV — BONS D'INTERVENTION</p>
          <h1 className="font-display text-[2.15rem] leading-tight font-semibold mb-6 max-w-md">
            Chaque intervention, tracée du premier appel à la signature client.
          </h1>

          <ul className="space-y-3 font-body text-sm text-[#c3cdd9]">
            {[
              "Création et suivi des bons d'intervention",
              "Affectation des équipes en temps réel",
              "Historique client et rapports d'intervention",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5">
                <svg className="mt-0.5 shrink-0 text-[#FF7A29]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 px-12 pb-10 font-mono text-[11px] text-[#5c6b7e] tracking-wide">
          © {new Date().getFullYear()} DEWEB TECHNOLOGY — Plateforme interne
        </div>
      </div>

      {/* RIGHT — the "ticket" login card */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          {/* mobile-only brand mark */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-md bg-[#FF7A29] flex items-center justify-center font-display font-bold text-white text-sm">
              D
            </div>
            <span className="font-display font-semibold tracking-wide text-[#101826]">
              DEWEB <span className="text-[#8a95a3] font-normal">TECHNOLOGY</span>
            </span>
          </div>

          <div className="relative bg-white rounded-2xl shadow-[0_1px_2px_rgba(16,24,38,0.04),0_16px_40px_-12px_rgba(16,24,38,0.18)] border border-[#E3E5E1] overflow-hidden">
            {/* perforated ticket edge */}
            <div className="absolute -top-3 left-0 right-0 flex justify-between px-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className="w-2.5 h-2.5 rounded-full bg-[#F6F7F5] border border-[#E3E5E1]" />
              ))}
            </div>

            {/* ticket header */}
            <div className="pt-7 px-8 pb-5 flex items-center justify-between border-b border-dashed border-[#D7DAD3]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0E7C86]/10 text-[#0E7C86] text-[11px] font-medium px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0E7C86]" />
                Connexion sécurisée
              </span>
            </div>

            <form onSubmit={handleLogin} className="px-8 pt-6 pb-8">
              <h2 className="font-display text-xl font-semibold text-[#101826] mb-1">Connexion</h2>
              <p className="font-body text-sm text-[#6b7684] mb-6">
                Accédez à vos bons d'intervention.
              </p>

              <div className="mb-4">
                <label htmlFor="email" className="block mb-1.5 font-body text-sm font-medium text-[#101826]">
                  Adresse e-mail
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="w-full font-body rounded-lg border border-[#DADDD6] bg-[#FCFCFB] px-3.5 py-2.5 text-[#101826] placeholder:text-[#a5aeb8] outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/15"
                  placeholder="email"
                />
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block font-body text-sm font-medium text-[#101826]">
                    Mot de passe
                  </label>
                  <a href="#" className="font-body text-xs text-[#0E7C86] hover:text-[#0a5f66] font-medium">
                    Mot de passe oublié ?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    className="w-full font-body rounded-lg border border-[#DADDD6] bg-[#FCFCFB] px-3.5 py-2.5 pr-10 text-[#101826] placeholder:text-[#a5aeb8] outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/15"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a95a3] hover:text-[#101826] transition"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#FDECE3] border border-[#F6C9AE] px-3.5 py-2.5">
                  <svg className="mt-0.5 shrink-0 text-[#C24A16]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
                  </svg>
                  <p className="font-body text-sm text-[#8a3510]">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-[#FF7A29] py-2.75 font-body font-semibold text-white transition hover:bg-[#E96A1D] active:bg-[#D3600F] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading && (
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4Z" />
                  </svg>
                )}
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>
          </div>

          <p className="font-body text-center text-xs text-[#8a95a3] mt-6">
            Accès réservé aux équipes DEWEB Technology. Un problème d'accès ? Contactez votre administrateur.
          </p>
        </div>
      </div>
    </div>
  );
}
