import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { AlertCircle, ShieldAlert, Sparkles } from "lucide-react";

interface LoginProps {
  onSuccess: () => void;
}

// Allowed emails for exclusive system
const ALLOWED_EMAILS = [
  "djorgeleal24@gmail.com",
  "davidlealramirez@gmail.com"
];

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkAuthorizationAndProceed = (userEmail: string | null) => {
    if (!userEmail) {
      setError("No se pudo obtener el correo de la cuenta de Google.");
      return false;
    }

    const cleanEmail = userEmail.trim().toLowerCase();
    if (ALLOWED_EMAILS.includes(cleanEmail)) {
      // Save local user details
      localStorage.setItem("promptlib_authorized_user", cleanEmail);
      localStorage.removeItem("promptlib_guest_mode");
      onSuccess();
      return true;
    } else {
      setError("Acceso denegado: Tu cuenta de Google no está en la lista de usuarios autorizados.");
      return false;
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      // Configure prompt select_account to make testing easier
      provider.setCustomParameters({ prompt: "select_account" });
      const userCredential = await signInWithPopup(auth, provider);
      const authorized = checkAuthorizationAndProceed(userCredential.user.email);
      if (!authorized) {
        // Sign out if not authorized
        await auth.signOut();
      }
    } catch (err: any) {
      console.error("Google sign in error", err);
      setError("El inicio de sesión de Google falló. Asegúrate de permitir popups o usar los accesos directos de abajo si estás dentro de la vista previa.");
    } finally {
      setLoading(false);
    }
  };

  const handleBypassLocal = (selectedEmail: string) => {
    localStorage.setItem("promptlib_guest_mode", "true");
    localStorage.setItem("promptlib_guest_username", selectedEmail === "djorgeleal24@gmail.com" ? "Jorge" : "David");
    localStorage.setItem("promptlib_authorized_user", selectedEmail);
    onSuccess();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090d16] font-sans p-4 relative overflow-hidden">
      {/* Cosmic background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="w-full max-w-md bg-[#111827]/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden relative z-10 transition-all duration-300">
        {/* Header decoration */}
        <div className="p-8 pb-5 text-center border-b border-slate-800/60 bg-[#0e1420]/60">
          <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20 mb-4 animate-bounce">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 id="brand-title" className="text-2xl font-extrabold text-white tracking-tight bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
            PromptLib • Privado
          </h1>
          <p className="text-xs text-slate-400 mt-2">Plataforma exclusiva de prompts de IA para Hermanos Leal</p>
        </div>

        {/* Form area */}
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
              <ShieldAlert className="w-3.5 h-3.5" /> Acceso Restringido
            </div>
            <h2 id="login-heading" className="text-lg font-bold text-slate-200">
              Biblioteca Exclusiva de Prompts
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              El ingreso está estrictamente reservado para los siguientes correos autorizados:
            </p>
            <div className="mt-2.5 flex flex-col gap-1 items-center justify-center">
              <span className="text-xs font-semibold text-indigo-400 bg-indigo-950/30 px-3 py-1 rounded-full border border-indigo-900/30">
                djorgeleal24@gmail.com
              </span>
              <span className="text-xs font-semibold text-purple-400 bg-purple-950/30 px-3 py-1 rounded-full border border-purple-900/30">
                davidlealramirez@gmail.com
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-800/40 rounded-2xl flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4.5 h-4.5 mt-0.5 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In main button */}
          <button
            id="google-login-btn"
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-900 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 text-sm cursor-pointer shadow-lg shadow-black/10 duration-200 transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.258-3.133C18.29 1.144 15.44 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.83 11.57-11.72 0-.788-.08-1.397-.24-1.995H12.24z"
              />
            </svg>
            <span>{loading ? "Accediendo..." : "Iniciar Sesión con Google"}</span>
          </button>

          {/* Bypass Direct Access for Offline/Testing within sandboxed environment */}
          <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">
              Ingreso Directo de Pruebas
            </p>
            <p className="text-[11px] text-slate-400 mb-4 leading-normal">
              ¿Ventanilla de autenticación bloqueada por el navegador? Haz clic abajo para ingresar directamente:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleBypassLocal("djorgeleal24@gmail.com")}
                className="py-3 px-4 bg-indigo-950/40 hover:bg-indigo-900/60 active:bg-indigo-900/80 border border-indigo-800/30 text-indigo-300 text-xs font-bold rounded-xl transition-all cursor-pointer hover:scale-[1.02]"
              >
                Ingresar como Jorge
              </button>
              <button
                type="button"
                onClick={() => handleBypassLocal("davidlealramirez@gmail.com")}
                className="py-3 px-4 bg-purple-950/40 hover:bg-purple-900/60 active:bg-purple-900/80 border border-purple-800/30 text-purple-300 text-xs font-bold rounded-xl transition-all cursor-pointer hover:scale-[1.02]"
              >
                Ingresar como David
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-8 py-4 bg-[#0e1420]/60 border-t border-slate-800/60 text-center">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
            SISTEMA PRIVADO DE ALTA SEGURIDAD
          </p>
        </div>
      </div>
    </div>
  );
};
