import React, { useState } from "react";
import { Prompt } from "../types";
import { Search, Eye, Sparkles, Filter, Database } from "lucide-react";

interface ExplorerProps {
  prompts: Prompt[];
  onSelectPrompt: (prompt: Prompt) => void;
  onNavigateToCreate: () => void;
}

export const Explorer: React.FC<ExplorerProps> = ({ prompts, onSelectPrompt, onNavigateToCreate }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [visibleCount, setVisibleCount] = useState(6);

  const categories = ["Todos", "Portrait", "Isometric", "Architecture", "Abstract", "Technical", "Interior"];

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesCategory = selectedCategory === "Todos" || prompt.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.instructions.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const hasMore = filteredPrompts.length > visibleCount;

  return (
    <div className="font-sans max-w-7xl mx-auto px-4 py-8">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 id="explorer-title" className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          La biblioteca de ingeniería de <span className="text-indigo-600">prompts</span> más precisa.
        </h1>
        <p className="text-lg md:text-xl text-slate-500 mt-4 leading-relaxed">
          Encuentra y comparte prompts optimizados para los modelos más avanzados de IA.
        </p>
      </div>

      {/* Search and Quick Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 md:p-6 mb-10 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              id="prompt-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Busca prompts por función, estilo o modelo..."
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
            />
          </div>
          {/* Search Button / Action */}
          <button
            id="search-action-btn"
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
          >
            <span>Buscar</span>
          </button>
        </div>

        {/* Categories Pill list */}
        <div className="flex flex-wrap gap-2 mt-5 items-center border-t border-slate-100 pt-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filtrar:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Cards */}
      {filteredPrompts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-3xl p-8 max-w-lg mx-auto">
          <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No se encontraron prompts</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Intenta cambiar tus términos de búsqueda o selecciona otra categoría. También puedes guardar tu propio prompt.
          </p>
          <button
            onClick={onNavigateToCreate}
            className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            Crear Nuevo Prompt
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.slice(0, visibleCount).map((prompt, idx) => (
              <div
                key={prompt.id || idx}
                onClick={() => onSelectPrompt(prompt)}
                className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
              >
                {/* Visual Banner */}
                <div className="relative h-48 bg-slate-100 overflow-hidden shrink-0">
                  {prompt.imageUrl ? (
                    <img
                      src={prompt.imageUrl}
                      alt={prompt.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-pink-500/10 flex items-center justify-center p-6">
                      <Sparkles className="w-10 h-10 text-indigo-400/40" />
                    </div>
                  )}
                  {/* Model badge floating */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
                    {prompt.model}
                  </span>
                  {/* Category badge floating right */}
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-indigo-600/90 backdrop-blur-xs text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
                    {prompt.category}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {prompt.title}
                  </h3>
                  <p className="text-slate-500 text-xs mt-2 line-clamp-3 leading-relaxed flex-1">
                    {prompt.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4 text-[11px] text-slate-400">
                    <span className="font-mono">
                      Por: {prompt.authorEmail === "community@promptlib.io" ? "Comunidad" : prompt.authorEmail.split("@")[0]}
                    </span>
                    <span className="text-indigo-600 font-semibold group-hover:underline flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> Ver Detalle
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-12">
              <button
                id="load-more-btn"
                onClick={() => setVisibleCount((prev) => prev + 3)}
                className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-xs cursor-pointer"
              >
                <span>Cargar más prompts</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
