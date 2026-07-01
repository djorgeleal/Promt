import React, { useState, useEffect } from "react";
import { Prompt } from "../types";
import { db, auth } from "../firebase";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Copy, Star, Sparkles, Send, Check, ArrowLeft, Terminal, Cpu } from "lucide-react";

interface PromptDetailProps {
  prompt: Prompt;
  onBack: () => void;
  onFavoriteChange?: () => void;
}

export const PromptDetail: React.FC<PromptDetailProps> = ({ prompt, onBack, onFavoriteChange }) => {
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favDocId, setFavDocId] = useState<string | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [detectedVariables, setDetectedVariables] = useState<string[]>([]);

  // Detect variables in the format [VARIABLE_NAME] or {{variable_name}} or :variable_name
  useEffect(() => {
    const bracketRegex = /\[([A-Za-z0-9_]+)\]/g;
    const curlyRegex = /\{\{([A-Za-z0-9_]+)\}\}/g;
    const vars: string[] = [];
    
    let match;
    while ((match = bracketRegex.exec(prompt.instructions)) !== null) {
      if (!vars.includes(match[1])) vars.push(match[1]);
    }
    while ((match = curlyRegex.exec(prompt.instructions)) !== null) {
      if (!vars.includes(match[1])) vars.push(match[1]);
    }

    setDetectedVariables(vars);
    
    // Initialize variables state
    const initialVars: Record<string, string> = {};
    vars.forEach((v) => {
      initialVars[v] = "";
    });
    setVariables(initialVars);
    
    // Check if favorited
    checkIfFavorite();
  }, [prompt]);

  const checkIfFavorite = async () => {
    const localFavs = localStorage.getItem("promptlib_local_favorites");
    const ids: string[] = localFavs ? JSON.parse(localFavs) : [];
    if (ids.includes(prompt.id || "")) {
      setIsFavorite(true);
    } else {
      setIsFavorite(false);
    }
  };

  const toggleFavorite = async () => {
    const localFavs = localStorage.getItem("promptlib_local_favorites");
    let ids: string[] = localFavs ? JSON.parse(localFavs) : [];
    if (isFavorite) {
      ids = ids.filter((id) => id !== prompt.id);
      setIsFavorite(false);
    } else {
      ids.push(prompt.id || "");
      setIsFavorite(true);
    }
    localStorage.setItem("promptlib_local_favorites", JSON.stringify(ids));
    if (onFavoriteChange) onFavoriteChange();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.instructions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestPrompt = async () => {
    setLoading(true);
    setTestResult(null);
    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructions: prompt.instructions,
          variables
        })
      });
      const data = await response.json();
      if (data.success) {
        setTestResult(data.result);
      } else {
        setTestResult("Error de Gemini: " + (data.error || "Inténtalo de nuevo."));
      }
    } catch (err: any) {
      setTestResult("Error de conexión: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans max-w-5xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium mb-6 transition-all cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al Explorador
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Prompt Instructions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            {/* Image Banner */}
            {prompt.imageUrl && (
              <div className="h-64 bg-slate-100 overflow-hidden relative">
                <img
                  src={prompt.imageUrl}
                  alt={prompt.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
              </div>
            )}

            {/* Header Content */}
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg uppercase tracking-wider border border-indigo-100">
                  {prompt.category}
                </span>
                <span className="px-2.5 py-1 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg uppercase tracking-wider border border-slate-200/50">
                  {prompt.model}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {prompt.title}
                </h1>
                <button
                  id="favorite-toggle-btn"
                  onClick={toggleFavorite}
                  className={`p-3 rounded-xl border transition-all cursor-pointer shadow-xs ${
                    isFavorite
                      ? "bg-amber-50 text-amber-500 border-amber-200 hover:bg-amber-100"
                      : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                  }`}
                  title={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
                >
                  <Star className="w-5 h-5 fill-current" />
                </button>
              </div>

              <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                {prompt.description}
              </p>
            </div>
          </div>

          {/* Prompt Instructions */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 md:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-600" /> Instrucciones del Prompt
              </h2>
              <button
                id="copy-instructions-btn"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copiar instrucciones
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs md:text-sm font-mono whitespace-pre-wrap leading-relaxed select-all">
              {prompt.instructions}
            </pre>
          </div>
        </div>

        {/* Right Column: Interactive Prompt Playground */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-8 -mt-8"></div>
            
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 relative z-10">
              <Cpu className="w-5 h-5 text-indigo-600 animate-pulse" /> Campo de Pruebas
            </h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Completa las variables y prueba este prompt directamente contra el modelo de inteligencia artificial de Gemini.
            </p>

            {/* Prompt variables inputs */}
            {detectedVariables.length > 0 ? (
              <div className="space-y-4 mb-6">
                <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                  Variables Detectadas
                </h3>
                {detectedVariables.map((v) => (
                  <div key={v}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </label>
                    <input
                      type="text"
                      value={variables[v] || ""}
                      onChange={(e) =>
                        setVariables((prev) => ({ ...prev, [v]: e.target.value }))
                      }
                      placeholder={`Ingresa el valor para [${v}]`}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-xs transition-all"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Entrada de prueba (Opcional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Escribe aquí cualquier contexto adicional o parámetros para probar este prompt..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-xs transition-all resize-none"
                    onChange={(e) => setVariables({ input: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              id="test-prompt-btn"
              onClick={handleTestPrompt}
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" /> Procesando con Gemini...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Probar con Gemini 3.5 Flash
                </>
              )}
            </button>
          </div>

          {/* Live Test Output Result */}
          {testResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 text-white overflow-hidden relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Resultado de Gemini
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Status: Ready</span>
              </div>
              <div className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
                {testResult}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
