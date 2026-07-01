import React, { useState, useEffect } from "react";
import { Prompt, Favorite } from "../types";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Star, Briefcase, Paintbrush, Code, Database, Plus, Sparkles, FolderHeart } from "lucide-react";

interface MyCollectionsProps {
  prompts: Prompt[];
  onSelectPrompt: (prompt: Prompt) => void;
  onNavigateToCreate: () => void;
}

export const MyCollections: React.FC<MyCollectionsProps> = ({ prompts, onSelectPrompt, onNavigateToCreate }) => {
  const [selectedFolder, setSelectedFolder] = useState<string>("favoritos");
  const [favPromptIds, setFavPromptIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Folders / Collections
  const folders = [
    { id: "favoritos", name: "Favoritos", count: 0, icon: <FolderHeart className="w-4 h-4" /> },
    { id: "Trabajo", name: "Trabajo", count: 0, icon: <Briefcase className="w-4 h-4" /> },
    { id: "Arte", name: "Arte", count: 0, icon: <Paintbrush className="w-4 h-4" /> },
    { id: "Programación", name: "Programación", count: 0, icon: <Code className="w-4 h-4" /> }
  ];

  useEffect(() => {
    fetchFavorites();
  }, [prompts]);

  const fetchFavorites = async () => {
    // Read local favorites from storage directly for complete offline-ready speed
    const localFavs = localStorage.getItem("promptlib_local_favorites");
    const ids: string[] = localFavs ? JSON.parse(localFavs) : [];
    setFavPromptIds(ids);
  };

  const authorizedUser = localStorage.getItem("promptlib_authorized_user") || "djorgeleal24@gmail.com";

  // Filter custom prompts created by the active authorized user
  const myPrompts = prompts.filter((p) => p.authorEmail === authorizedUser);

  // Filter prompts shown based on selected folder
  const displayedPrompts = prompts.filter((p) => {
    // If folder is "favoritos", show both community and custom prompts that have been favorited
    if (selectedFolder === "favoritos") {
      return favPromptIds.includes(p.id || "");
    }
    // Otherwise, show user's prompts belonging to the active authorized email and category
    return p.authorEmail === authorizedUser && p.category.toLowerCase() === selectedFolder.toLowerCase();
  });

  // Calculate counts dynamically
  folders[0].count = favPromptIds.length;
  folders[1].count = myPrompts.filter((p) => p.category.toLowerCase() === "trabajo").length;
  folders[2].count = myPrompts.filter((p) => p.category.toLowerCase() === "arte").length;
  folders[3].count = myPrompts.filter((p) => p.category.toLowerCase() === "programación").length;

  return (
    <div className="font-sans max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar categories column */}
        <div className="w-full lg:w-64 shrink-0 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mis Colecciones</h3>
            
            {/* List of folders */}
            <div className="space-y-1.5">
              {folders.map((folder) => {
                const isActive = selectedFolder === folder.id;
                return (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-white text-slate-600 hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {folder.icon}
                      <span>{folder.name}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {folder.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Add Category button */}
            <button
              onClick={() => alert("Puedes clasificar tus prompts eligiendo diferentes categorías al guardarlos en base de datos. ¡Las carpetas se organizarán solas!")}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Nueva Categoría
            </button>
          </div>

          {/* Storage bar matching Screen 5 left sidebar bottom */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-700">Uso de Almacenamiento</span>
              <span className="text-slate-500 font-mono">2.4 MB / 100 MB</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: "2.4%" }}></div>
            </div>
          </div>
        </div>

        {/* Main area of prompts list */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">
                {selectedFolder === "favoritos" ? "Biblioteca de Favoritos" : `Categoría: ${selectedFolder}`}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedFolder === "favoritos"
                  ? "Tus prompts favoritos sincronizados en la nube."
                  : `Tus prompts personales guardados bajo la categoría ${selectedFolder}.`}
              </p>
            </div>
            <button
              onClick={onNavigateToCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nuevo Prompt
            </button>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <Sparkles className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-500">Sincronizando biblioteca...</p>
            </div>
          ) : displayedPrompts.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* If no items, always show the "Nuevo Prompt" placeholder card */}
              <div
                onClick={onNavigateToCreate}
                className="flex flex-col items-center justify-center p-8 bg-slate-50 hover:bg-slate-100/80 border border-dashed border-slate-300 rounded-2xl cursor-pointer text-center group h-64 transition-all"
              >
                <div className="p-4 bg-white border border-slate-200 rounded-full text-slate-400 group-hover:text-indigo-600 transition-colors shadow-xs mb-3">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-700">Guardar un Prompt</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                  Agrega un nuevo prompt de IA a tu biblioteca para tener acceso inmediato.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedPrompts.map((prompt, idx) => (
                <div
                  key={prompt.id || idx}
                  onClick={() => onSelectPrompt(prompt)}
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5 flex flex-col justify-between cursor-pointer group"
                >
                  <div className="space-y-3">
                    {/* Header tags */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold rounded-md uppercase tracking-wider border border-indigo-100">
                          {prompt.category}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-50 text-slate-600 text-[9px] font-bold rounded-md uppercase tracking-wider border border-slate-200/50">
                          {prompt.model}
                        </span>
                      </div>
                      {favPromptIds.includes(prompt.id || "") && (
                        <Star className="w-4 h-4 text-amber-400 fill-current" />
                      )}
                    </div>

                    <h3 className="text-md font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {prompt.title}
                    </h3>
                    <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed">
                      {prompt.description}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-3.5 mt-4 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>
                      {prompt.authorEmail === "community@promptlib.io" ? "Comunidad" : "Mío"}
                    </span>
                    <span className="text-indigo-600 font-semibold group-hover:underline">
                      Ver instrucciones
                    </span>
                  </div>
                </div>
              ))}

              {/* Keep the "Nuevo Prompt" card at the end */}
              <div
                onClick={onNavigateToCreate}
                className="flex flex-col items-center justify-center p-6 bg-slate-50/50 hover:bg-slate-50 border border-dashed border-slate-200 rounded-2xl cursor-pointer text-center group h-full min-h-48 transition-all"
              >
                <Plus className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors mb-2" />
                <h3 className="text-xs font-bold text-slate-600">Nuevo Prompt</h3>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
