import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const EXAMPLES = [
  {
    domain: "IMAGE",
    label: "🐶 Image",
    short: "dog in park",
    description: "Generates ultra-detailed visual framing, lighting, and camera styles."
  },
  {
    domain: "CODING",
    label: "💻 Coding",
    short: "react counter component",
    description: "Adds architecture, security bounds, edge cases, and testing parameters."
  },
  {
    domain: "WRITING",
    label: "✍️ Writing",
    short: "email to boss about raise",
    description: "Fine-tunes exact tone, target audience, formatting constraints, and flow."
  },
  {
    domain: "BUSINESS",
    label: "📊 Business",
    short: "saas launch strategy",
    description: "Structures explicit goals, competitor contexts, risks, and KPIs."
  }
];

const TRENDING_GALLERY = [
  {
    title: "Cinematic Shadow Portrait",
    styleTag: "Shadow Play / Moody",
    imagePath: "/trending-portrait.png",
    optimizedPrompt: "A moody cinematic portrait of a person captured through stark venetian blind shadows. Intense contrast, high-fashion chiaroscuro lighting style, deep geometric shadow overlays on the face, analog film grain, shot on 35mm lens, sharp focus, raw industrial atmosphere, high detail rendering, 4K resolution, 16:9 aspect ratio."
  },
  {
    title: "Minimal Studio Setup",
    styleTag: "Studio / Aesthetics",
    imagePath: "/trending-product.png",
    optimizedPrompt: "Ultra-minimalist commercial photography of a subject interacting with sharp geometric planes. Soft diffused morning sunlight creating long gentle shadows, monochromatic studio background, clean elegant composition, high-end editorial styling, shot on 85mm lens, crisp micro-textures, 8K resolution."
  },
  {
    title: "Futuristic Visual Profile",
    styleTag: "Tech / Cyberpunk",
    imagePath: "/trending-cyber.png",
    optimizedPrompt: "Abstract neo-noir visual profile featuring translucent glowing structures overlapping the subject. Cyberpunk aesthetic, dark background with soft ambient blue and purple neon backlighting, ultra-detailed textures, volumetric haze, cinematic composition, 4K resolution."
  }
];

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [detectedDomain, setDetectedDomain] = useState("");

  // --- METERED TRACKING & GOOGLE AUTH STATES ---
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [searchCount, setSearchCount] = useState(() => {
    return Number(localStorage.getItem("anon_search_count")) || 0;
  });

  // Automatically sync current session and watch auth lifecycle state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setError(""); // Clear block errors upon authentication return
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin // Automatically brings them straight back here
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || "Failed to initialize Google login tunnel.");
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleEnhance = async (overrideInput = null) => {
    const activeInput = typeof overrideInput === "string" ? overrideInput : input;

    if (!activeInput.trim()) {
      setError("Please enter a prompt concept first.");
      return;
    }

    // --- GATEKEEPER CEILING: Block anonymous users if they cross limit ---
    if (!user && searchCount >= 2) {
      setError("You have reached the limit of 2 free anonymous generations. Please authenticate with Google below to continue.");
      const element = document.getElementById("auth-panel");
      if (element) element.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setLoading(true);
    setError("");
    setOutput("");
    setCopied(false);
    setDetectedDomain("");

    try {
      const headers = { "Content-Type": "application/json" };
      if (user) headers["x-user-id"] = user.id;

      const response = await fetch("/api/enhance", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ prompt: activeInput }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Optimization processing failure.");
      }

      setOutput(data.result);
      if (data.category) setDetectedDomain(data.category);

      // --- METER METRICS UPDATE FOR GUESTS ONLY ---
      if (!user) {
        const currentTotal = searchCount + 1;
        setSearchCount(currentTotal);
        localStorage.setItem("anon_search_count", currentTotal.toString());
      }
    } catch (err) {
      setError(err.message || "Failed to update dynamic output infrastructure.");
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (shortText) => {
    handleEnhance(shortText);
  };

  const handleGalleryClick = (item) => {
    setInput(`Example: ${item.title}`);
    setOutput(item.optimizedPrompt);
    setDetectedDomain("IMAGE");
    setError("");

    setTimeout(() => {
      const element = document.getElementById("output-terminal");
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy string.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-4 sm:p-8 selection:bg-indigo-500/30">
      <div className="w-full max-w-4xl space-y-10 my-6">
        
        {/* Main Application Global Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-900 pb-6">
          <div className="text-center sm:text-left space-y-1">
            <h1 className="text-3xl font-black text-white bg-gradient-to-r from-white to-slate-400 bg-clip-text">
              Prompt Enhancer
            </h1>
            <p className="text-xs text-slate-400">
              Structural layout engine for ChatGPT, Claude, and Midjourney.
            </p>
          </div>
          
          {/* Header Authorization State Indicators */}
          {user ? (
            <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
              <span className="text-xs font-medium text-slate-300 truncate max-w-[140px]">{user.email}</span>
              <button onClick={handleLogout} className="text-[10px] font-bold uppercase tracking-wider bg-rose-950/40 text-rose-400 border border-rose-900/40 px-2 py-1 rounded hover:bg-rose-900/30 transition">
                Logout
              </button>
            </div>
          ) : (
            <div className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-xl font-medium font-mono">
              🛡️ Free Allowance Remaining: {2 - searchCount < 0 ? 0 : 2 - searchCount} / 2 Left
            </div>
          )}
        </header>

        {/* Trending Architecture Matrix */}
        <section className="space-y-4 pt-2">
          <div className="flex flex-col items-start gap-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
              🔥 Trending Visual Blueprints
            </h3>
            <p className="text-xs text-slate-500">
              Select a trending profile style to instantly load and examine its architectural AI prompt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TRENDING_GALLERY.map((item, index) => (
              <div
                key={index}
                onClick={() => handleGalleryClick(item)}
                className="group relative rounded-xl bg-slate-900 border border-slate-800/80 overflow-hidden cursor-pointer shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 hover:border-indigo-500/30 hover:-translate-y-1"
              >
                <div className="relative h-56 w-full overflow-hidden bg-slate-950">
                  <img src={item.imagePath} alt={item.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-[0.8] group-hover:brightness-95" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
                  <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] text-indigo-300 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                    {item.styleTag}
                  </span>
                </div>
                <div className="p-4 space-y-1 bg-gradient-to-b from-slate-900 to-slate-950">
                  <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                    {item.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 group-hover:text-indigo-400 transition-colors">
                    ⚡ Tap to load structural text
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Example Trigger Badges */}
        <div className="space-y-3 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Or select general text domains
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {EXAMPLES.map((ex) => (
              <button key={ex.domain} onClick={() => handleExampleClick(ex.short)} className="group text-left p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-sm">
                <div className="font-semibold text-sm text-slate-200 group-hover:text-indigo-400 transition-colors">
                  {ex.label}
                </div>
                <div className="text-xs text-slate-400 truncate mt-1 italic">
                  "{ex.short}"
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert Display Box */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm font-medium flex items-center gap-3">
            ⚠️ <span>{error}</span>
          </div>
        )}

        {/* STEP 1 INPUT WORKSPACE CARD */}
        <main className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">1</span>
              <label className="text-sm font-bold tracking-wide text-slate-200">Search or Enter Your Prompt Concept</label>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!user && searchCount >= 2}
            placeholder={(!user && searchCount >= 2) ? "Input deactivated. Complete Google validation to unlock workspace." : "Type your simple idea here (e.g., 'dog in park')..."}
            className="w-full h-36 p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-medium text-sm sm:text-base transition-all leading-relaxed disabled:opacity-40"
          />

          <button
            onClick={() => handleEnhance()}
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold tracking-wide transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 ${
              (!user && searchCount >= 2) 
                ? "bg-slate-800 text-slate-400 border border-slate-700/60 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            }`}
          >
            {loading ? "Processing Core Framework..." : (!user && searchCount >= 2) ? "🔑 Authentication Required" : "Optimize Prompt Structure ↓"}
          </button>
        </main>

        {/* GOOGLE ONLY AUTHENTICATION REDIRECT PANEL */}
        {!user && searchCount >= 2 && (
          <section id="auth-panel" className="bg-slate-900 rounded-2xl border border-indigo-500/40 p-6 text-center shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Unlock Free Unlimited Optimizations</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">You've reached the 2 free anonymous limits. Sign in instantly with Google to clear this lock.</p>
            </div>
            
            <button
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="mx-auto flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold px-6 py-3 rounded-xl transition shadow-lg active:scale-[0.98] disabled:opacity-50 text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.15C3.18 21.88 7.31 24 12 24z"/>
                <path fill="#FBBC05" d="M5.32 14.24A7.16 7.16 0 0 1 4.9 12c0-.79.13-1.57.38-2.34V6.51H1.21A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.21 5.39l4.11-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.18 2.12 1.21 5.39l4.11 3.15c.94-2.85 3.57-4.96 6.68-4.96z"/>
              </svg>
              <span>{authLoading ? "Opening Google Client..." : "Continue with Google"}</span>
            </button>
          </section>
        )}

        {/* STEP 2 OUTPUT PRESENTATION TERMINAL */}
        <div id="output-terminal" className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">2</span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Your Optimized Prompt Engine Output</h3>
          </div>

          {output ? (
            <section className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="flex justify-between items-center px-5 py-4 bg-slate-900/50 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Ready to Copy & Paste</span>
                  {detectedDomain && <span className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-400 font-mono">{detectedDomain}</span>}
                </div>
                <button onClick={copyOutput} className={`text-xs font-bold tracking-wide px-4 py-2 rounded-lg transition-all duration-200 shadow-sm flex items-center gap-1.5 min-w-[85px] justify-center ${copied ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`}>
                  {copied ? "✓ Copied!" : "🗐 Copy"}
                </button>
              </div>
              <div className="p-5 sm:p-6 bg-slate-950/60 font-mono text-sm leading-relaxed text-slate-200 select-all whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                {output}
              </div>
            </section>
          ) : (
            <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center bg-slate-900/20 transition-all">
              <div className="text-3xl mb-2 text-slate-700">📋</div>
              <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">Your elite, structured prompt framework will generate instantly here once you run a search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;