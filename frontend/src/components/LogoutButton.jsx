import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LogoutButton() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/10
        bg-white/5 px-3.5 py-2.5 font-body text-sm font-medium text-[#f0b8a0] transition cursor-pointer
        hover:bg-[#C24A16]/20 hover:text-white hover:border-[#C24A16]/40 disabled:opacity-60 disabled:cursor-not-allowed"
    >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {loading ? "Déconnexion..." : "Se déconnecter"}
    </button>
  );
}
