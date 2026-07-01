import { useState, useEffect } from "react";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, onSnapshot, doc, getDocFromServer } from "firebase/firestore";
import { DEFAULT_PROMPTS } from "./defaultPrompts";
import { Prompt } from "./types";

// Component imports
import { Login } from "./components/Login";
import { Explorer } from "./components/Explorer";
import { PromptDetail } from "./components/PromptDetail";
import { SavePrompt } from "./components/SavePrompt";
import { MyCollections } from "./components/MyCollections";

// Lucide icon imports
import { Compass, FolderHeart, PlusCircle, LogOut, Sparkles, User as UserIcon } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | { uid: string; email: string; displayName: string; photoURL?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"explorer" | "collections" | "create" | "detail">("explorer");
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  
  // Combines default community prompts and user-created custom prompts
  const [allPrompts, setAllPrompts] = useState<Prompt[]>(DEFAULT_PROMPTS);

  // Test Connection on boot as required by firebase-integration skill
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error: any) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  // Sync auth state and Guest Mode state
  useEffect(() => {
    const checkAuthAndGuest = () => {
      const isGuest = localStorage.getItem("promptlib_guest_mode") === "true";
      const authorizedUser = localStorage.getItem("promptlib_authorized_user");
      
      if (isGuest && authorizedUser) {
        setUser({
          uid: "guest-user",
          email: authorizedUser,
          displayName: authorizedUser === "djorgeleal24@gmail.com" ? "Jorge Leal" : "David Leal"
        });
        setAuthLoading(false);
        return () => {};
      }

      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          const email = currentUser.email?.trim().toLowerCase();
          if (email && ["djorgeleal24@gmail.com", "davidlealramirez@gmail.com"].includes(email)) {
            setUser(currentUser);
            localStorage.setItem("promptlib_authorized_user", email);
          } else {
            signOut(auth);
            setUser(null);
            localStorage.removeItem("promptlib_authorized_user");
          }
        } else {
          setUser(null);
        }
        setAuthLoading(false);
      });
      return unsubscribe;
    };

    const unsubscribe = checkAuthAndGuest();
    return () => unsubscribe && unsubscribe();
  }, [activeTab]); // Triggers check when tab changes or logins succeed

  // Sync custom prompts from Local Storage for offline private reliability
  useEffect(() => {
    if (!user) {
      setAllPrompts(DEFAULT_PROMPTS);
      return;
    }

    const loadLocalPrompts = () => {
      const localCustom = localStorage.getItem("promptlib_local_prompts");
      const customList: Prompt[] = localCustom ? JSON.parse(localCustom) : [];
      setAllPrompts([...DEFAULT_PROMPTS, ...customList]);
    };
    loadLocalPrompts();
    
    // Listen to storage events to keep it in sync
    window.addEventListener("storage", loadLocalPrompts);
    return () => window.removeEventListener("storage", loadLocalPrompts);
  }, [user]);

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("promptlib_guest_mode");
      localStorage.removeItem("promptlib_guest_username");
      localStorage.removeItem("promptlib_authorized_user");
      await signOut(auth);
      setUser(null);
      setActiveTab("explorer");
      setSelectedPrompt(null);
    } catch (err) {
      console.error("Error signing out", err);
    }
  };

  const handleSelectPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setActiveTab("detail");
  };

  // Render Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans">
        <div className="text-center">
          <Sparkles className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <h2 className="text-sm font-semibold text-slate-600">Iniciando PromptLib...</h2>
        </div>
      </div>
    );
  }

  // Render Login if unauthenticated
  if (!user) {
    return <Login onSuccess={() => setActiveTab("explorer")} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Top Premium Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <div 
            onClick={() => { setActiveTab("explorer"); setSelectedPrompt(null); }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="p-2 bg-indigo-600 rounded-xl text-white group-hover:bg-indigo-700 transition-colors shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span id="app-logo-text" className="text-lg font-extrabold text-slate-800 tracking-tight">PromptLib</span>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => { setActiveTab("explorer"); setSelectedPrompt(null); }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "explorer" || activeTab === "detail"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explorar</span>
            </button>
            <button
              onClick={() => { setActiveTab("collections"); setSelectedPrompt(null); }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "collections"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <FolderHeart className="w-4 h-4" />
              <span>Mis Colecciones</span>
            </button>
            <button
              onClick={() => { setActiveTab("create"); setSelectedPrompt(null); }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "create"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Guardar Prompt</span>
            </button>
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 overflow-hidden border border-indigo-200">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "User"} referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon className="w-4 h-4" />
                )}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800 line-clamp-1">{user.displayName || "Ingeniero IA"}</p>
                <p className="text-[10px] text-slate-400 line-clamp-1">{user.email}</p>
              </div>
            </div>

            <button
              id="logout-btn"
              onClick={handleSignOut}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer at bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-4 flex items-center justify-around z-50 shadow-lg">
        <button
          onClick={() => { setActiveTab("explorer"); setSelectedPrompt(null); }}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold ${
            activeTab === "explorer" || activeTab === "detail" ? "text-indigo-600" : "text-slate-400"
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Explorar</span>
        </button>
        <button
          onClick={() => { setActiveTab("collections"); setSelectedPrompt(null); }}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold ${
            activeTab === "collections" ? "text-indigo-600" : "text-slate-400"
          }`}
        >
          <FolderHeart className="w-5 h-5" />
          <span>Colecciones</span>
        </button>
        <button
          onClick={() => { setActiveTab("create"); setSelectedPrompt(null); }}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold ${
            activeTab === "create" ? "text-indigo-600" : "text-slate-400"
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          <span>Nuevo</span>
        </button>
      </div>

      {/* Main Container */}
      <main className="flex-1 pb-20 md:pb-12">
        {activeTab === "explorer" && (
          <Explorer
            prompts={allPrompts}
            onSelectPrompt={handleSelectPrompt}
            onNavigateToCreate={() => setActiveTab("create")}
          />
        )}

        {activeTab === "detail" && selectedPrompt && (
          <PromptDetail
            prompt={selectedPrompt}
            onBack={() => { setActiveTab("explorer"); setSelectedPrompt(null); }}
          />
        )}

        {activeTab === "create" && (
          <SavePrompt
            onSuccess={() => setActiveTab("collections")}
            onCancel={() => setActiveTab("explorer")}
          />
        )}

        {activeTab === "collections" && (
          <MyCollections
            prompts={allPrompts}
            onSelectPrompt={handleSelectPrompt}
            onNavigateToCreate={() => setActiveTab("create")}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>&copy; {new Date().getFullYear()} PromptLib &bull; Leal Marketing. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
