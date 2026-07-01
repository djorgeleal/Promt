import React, { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { Sparkles, Save, Trash2, HelpCircle, CheckCircle2, ChevronRight, Wand2 } from "lucide-react";

interface SavePromptProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const SavePrompt: React.FC<SavePromptProps> = ({ onSuccess, onCancel }) => {
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [model, setModel] = useState("GPT-4o");
  const [imageUrl, setImageUrl] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [optimizationsApplied, setOptimizationsApplied] = useState<string[]>([]);

  const categories = ["Portrait", "Isometric", "Architecture", "Abstract", "Technical", "Interior", "General"];
  const models = ["Midjourney", "DALL-E 3", "Stable Diffusion", "GPT-4o", "Claude 3.5 Sonnet", "Gemini 3.5 Flash"];

  // Optimize prompt with Gemini
  const handleOptimizePrompt = async () => {
    if (!instructions) {
      setErrorMsg("Escribe las instrucciones del prompt antes de optimizar.");
      return;
    }
    setOptimizing(true);
    setErrorMsg(null);
    try {
      const response = await fetch("/api/gemini/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructions, description })
      });
      const data = await response.json();
      if (data.success) {
        setInstructions(data.optimizedInstructions);
        setOptimizationsApplied(data.improvements || []);
        setSuccessMsg("¡Prompt optimizado con éxito por Gemini!");
      } else {
        setErrorMsg("Error de optimización: " + (data.error || "Inténtalo de nuevo."));
      }
    } catch (err: any) {
      setErrorMsg("Error al conectar con la IA: " + err.message);
    } finally {
      setOptimizing(false);
    }
  };

  // Analyze prompt with Gemini to auto-fill category, model, and description
  const handleAutoFill = async () => {
    if (!instructions) {
      setErrorMsg("Escribe algunas instrucciones del prompt para que Gemini pueda analizarlas.");
      return;
    }
    setAnalyzing(true);
    setErrorMsg(null);
    try {
      const response = await fetch("/api/gemini/auto-categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructions })
      });
      const data = await response.json();
      if (data.success) {
        if (categories.includes(data.category)) {
          setCategory(data.category);
        } else {
          setCategory("General");
        }
        
        // Find closest match or add to models list
        if (models.includes(data.model)) {
          setModel(data.model);
        } else {
          // If gemini recommends something else, see if it has partial match
          const found = models.find(m => m.toLowerCase().includes(data.model.toLowerCase()) || data.model.toLowerCase().includes(m.toLowerCase()));
          if (found) setModel(found);
        }

        setDescription(data.description || "");
        setSuccessMsg("¡IA detectó automáticamente la categoría, modelo sugerido y descripción!");
      } else {
        setErrorMsg("Error de análisis: " + (data.error || "Inténtalo de nuevo."));
      }
    } catch (err: any) {
      setErrorMsg("Error al conectar con la IA: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // Save prompt to Local Storage (replaces Firestore completely for instant reliability)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !instructions || !description) {
      setErrorMsg("Completa los campos requeridos: Título, Prompt e Instrucciones.");
      return;
    }

    const isGuest = localStorage.getItem("promptlib_guest_mode") === "true";
    const authorizedUser = localStorage.getItem("promptlib_authorized_user") || "djorgeleal24@gmail.com";

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Save to localStorage
      const localCustom = localStorage.getItem("promptlib_local_prompts");
      const customList = localCustom ? JSON.parse(localCustom) : [];
      
      const newPrompt = {
        id: `local-${Date.now()}`,
        title,
        instructions,
        description,
        category,
        model,
        imageUrl: imageUrl || undefined,
        authorId: isGuest ? "guest-user" : "authorized-user",
        authorEmail: authorizedUser,
        createdAt: new Date().toISOString(),
        isCommunity: false
      };
      
      customList.push(newPrompt);
      localStorage.setItem("promptlib_local_prompts", JSON.stringify(customList));
      
      // Dispatch custom storage event for dynamic updates on same tab
      window.dispatchEvent(new Event("storage"));
      
      setSuccessMsg("¡Prompt guardado con éxito en tu biblioteca privada!");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      console.error("Error saving prompt:", err);
      setErrorMsg("Error al guardar en el almacenamiento local: " + (err.message || "Falta de espacio o problema interno."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans max-w-4xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="mb-8">
        <h1 id="save-prompt-heading" className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Guardar Nuevo Prompt
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Crea tu propio prompt optimizado o deja que Gemini te ayude a perfeccionarlo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form area */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 space-y-5">
            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-sm text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Acción Exitosa</p>
                  <p className="text-xs text-emerald-700 mt-0.5">{successMsg}</p>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Title field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Título del Prompt <span className="text-red-500">*</span>
              </label>
              <input
                id="prompt-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Redactor de Ensayos Académicos"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
              />
            </div>

            {/* Instructions / Prompt field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  El Prompt (Instrucciones Exactas) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    disabled={analyzing || optimizing}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> {analyzing ? "Analizando..." : "Autocompletar con IA"}
                  </button>
                  <button
                    type="button"
                    onClick={handleOptimizePrompt}
                    disabled={optimizing || analyzing}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 px-2.5 py-1 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> {optimizing ? "Optimizando..." : "Optimizar con Gemini"}
                  </button>
                </div>
              </div>
              <textarea
                id="prompt-instructions-textarea"
                required
                rows={8}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Escribe el prompt aquí. Puedes definir variables escribiéndolas entre corchetes, por ejemplo: [TEMA] o [TONO] para que se puedan rellenar al ejecutar el prompt..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono text-xs md:text-sm transition-all"
              />
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                Gemini puede estructurar automáticamente tu prompt con delimitadores de entrada y formato de rol si usas el botón <strong>Optimizar con Gemini</strong>.
              </p>
            </div>

            {/* Description field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Descripción de Funciones <span className="text-red-500">*</span>
              </label>
              <input
                id="prompt-description-input"
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Redacta ensayos lógicos y coherentes utilizando referencias estilo APA."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
              />
            </div>

            {/* Category and Model Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Modelo Recomendado
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm cursor-pointer"
                >
                  {models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image URL / Link banner (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                URL de Imagen de Portada (Opcional)
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Ej. https://images.unsplash.com/photo-..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
              />
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                Deja en blanco para mostrar una elegante portada abstracta predeterminada.
              </p>
            </div>

            {/* Form actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium rounded-xl transition-all text-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Descartar
              </button>
              <button
                id="save-submit-btn"
                type="submit"
                disabled={loading || optimizing}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" /> {loading ? "Guardando..." : "Guardar en Base de Datos"}
              </button>
            </div>
          </div>
        </form>

        {/* Info card column */}
        <div className="space-y-6">
          {optimizationsApplied.length > 0 && (
            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-violet-800 flex items-center gap-1.5 mb-3">
                <Sparkles className="w-4 h-4 text-violet-600" /> Mejoras de Gemini Aplicadas:
              </h3>
              <ul className="space-y-2">
                {optimizationsApplied.map((imp, idx) => (
                  <li key={idx} className="text-xs text-violet-700 flex items-start gap-1.5 leading-relaxed">
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 text-violet-500 mt-0.5" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Advice card "Consejo de Precisión" matching Screen 4 bottom card */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl -mr-6 -mt-6"></div>
            
            <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4 text-indigo-400" /> Consejo de Precisión
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Para lograr los mejores resultados con IA, sigue la estructura de roles:
            </p>
            <div className="space-y-3 font-mono text-[10px] text-slate-300">
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-indigo-400 font-bold"># ROL:</span> Actúa como un experto en...
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-indigo-400 font-bold"># DELIMITADOR:</span> """texto a analizar"""
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-indigo-400 font-bold"># OUTPUT:</span> Devuelve un archivo JSON...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
