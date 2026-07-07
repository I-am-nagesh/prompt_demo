import { useState } from "react";

const EXAMPLES = [
  {
    domain: "IMAGE",
    label: "🐶 Image",
    short: "dog in park",
    description:
      "Generates ultra-detailed visual framing, lighting, and camera styles.",
  },
  {
    domain: "CODING",
    label: "💻 Coding",
    short: "react counter component",
    description:
      "Adds architecture, security bounds, edge cases, and testing parameters.",
  },
  {
    domain: "WRITING",
    label: "✍️ Writing",
    short: "email to boss about raise",
    description:
      "Fine-tunes exact tone, target audience, formatting constraints, and flow.",
  },
  {
    domain: "BUSINESS",
    label: "📊 Business",
    short: "saas launch strategy",
    description:
      "Structures explicit goals, competitor contexts, risks, and KPIs.",
  },
];

// Updated to target local high-resolution assets in your public/ folder
const TRENDING_GALLERY = [
  {
    title: "Cinematic Shadow Portrait",
    styleTag: "Shadow Play / Moody",
    imagePath: "/trending-portrait.png", // Saved in your public/ folder
    optimizedPrompt:
      "A moody cinematic portrait of a person captured through stark venetian blind shadows. Intense contrast, high-fashion chiaroscuro lighting style, deep geometric shadow overlays on the face, analog film grain, shot on 35mm lens, sharp focus, raw industrial atmosphere, high detail rendering, 4K resolution, 16:9 aspect ratio.",
  },
  {
    title: "Minimal Studio Setup",
    styleTag: "Studio / Aesthetics",
    imagePath: "/trending-product.png", // Saved in your public/ folder
    optimizedPrompt:
      "Ultra-minimalist commercial photography of a subject interacting with sharp geometric planes. Soft diffused morning sunlight creating long gentle shadows, monochromatic studio background, clean elegant composition, high-end editorial styling, shot on 85mm lens, crisp micro-textures, 8K resolution.",
  },
  {
    title: "Futuristic Visual Profile",
    styleTag: "Tech / Cyberpunk",
    imagePath: "/trending-cyber.png", // Saved in your public/ folder
    optimizedPrompt:
      "Abstract neo-noir visual profile featuring translucent glowing structures overlapping the subject. Cyberpunk aesthetic, dark background with soft ambient blue and purple neon backlighting, ultra-detailed textures, volumetric haze, cinematic composition, 4K resolution.",
  },
];

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [detectedDomain, setDetectedDomain] = useState("");

  const handleEnhance = async (overrideInput = null) => {
    const activeInput =
      typeof overrideInput === "string" ? overrideInput : input;

    if (!activeInput.trim()) {
      setError("Please enter a prompt concept first.");
      return;
    }

    setLoading(true);
    setError("");
    setOutput("");
    setCopied(false);
    setDetectedDomain("");

    try {
      const response = await fetch("/api/enhance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: activeInput,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Something went wrong running optimization pipeline.",
        );
      }

      setOutput(data.result);
      if (data.category) setDetectedDomain(data.category);
    } catch (err) {
      setError(err.message || "Failed to generate dynamic prompt framework.");
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (shortText) => {
    setInput(shortText);
    handleEnhance(shortText);
  };

  // Handles gallery click without cluttering the input terminal with long prompts
  const handleGalleryClick = (item) => {
    // 1. Put a short, clean name into the input field instead of the full prompt
    setInput(`Example: ${item.title}`);

    // 2. Push the master optimized prompt directly into the output terminal
    setOutput(item.optimizedPrompt);
    setDetectedDomain("IMAGE");
    setError("");

    // 3. Smooth scroll down to the generated output terminal instantly
    setTimeout(() => {
      const element = document.getElementById("output-terminal");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy string to clipboard.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-4 sm:p-8 selection:bg-indigo-500/30">
      <div className="w-full max-w-4xl space-y-10 my-6">
        {/* Header Section */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-sm font-medium tracking-wide backdrop-blur-md">
            ✨ Pro Prompt Infrastructure
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text">
            Prompt Enhancer
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-md mx-auto font-normal">
            Grammarly for AI prompts. Structural orchestration ready for
            immediate execution.
          </p>
        </header>

        {/* FEATURE SHIFT: Trending Inspiration Gallery placed directly on top */}
        <section className="space-y-4 pt-2">
          <div className="flex flex-col items-start gap-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
              🔥 Trending Visual Blueprints
            </h3>
            <p className="text-xs text-slate-500">
              Select a trending profile style to instantly load and examine its
              architectural AI prompt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TRENDING_GALLERY.map((item, index) => (
              <div
                key={index}
                onClick={() => handleGalleryClick(item)}
                className="group relative rounded-xl bg-slate-900 border border-slate-800/80 overflow-hidden cursor-pointer shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 hover:border-indigo-500/30 hover:-translate-y-1"
              >
                {/* Local Asset Image Container */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-950">
                  <img
                    src={item.imagePath}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-[0.8] group-hover:brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />

                  <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] text-indigo-300 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                    {item.styleTag}
                  </span>
                </div>

                {/* Footer Labels */}
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

        {/* Interactive Domain Text Badges */}
        <div className="space-y-3 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Or select general text domains
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.domain}
                onClick={() => handleExampleClick(ex.short)}
                className="group text-left p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
              >
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

        {/* STEP 1 WORKSPACE: Main Operational Prompt Panel Refactored */}
        <main className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
                1
              </span>
              <label className="text-sm font-bold tracking-wide text-slate-200">
                Search or Enter Your Prompt Concept
              </label>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Type anything & press optimize
            </span>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your simple idea here (e.g., 'dog in park' or 'python script to read csv')..."
            className="w-full h-36 p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-medium text-sm sm:text-base transition-all leading-relaxed"
          />

          <button
            onClick={() => handleEnhance()}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white py-3.5 rounded-xl font-bold tracking-wide transition-all shadow-md shadow-indigo-600/10 active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Engineering Your Prompt Structure...</span>
              </>
            ) : (
              "Optimize Prompt Structure ↓"
            )}
          </button>
        </main>

        {/* Error Messaging Banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm font-medium flex items-center gap-3">
            ⚠️ <span>{error}</span>
          </div>
        )}

        {/* STEP 2 WORKSPACE: Output Presentation System Refactored */}
        <div id="output-terminal" className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
              2
            </span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Your Optimized Prompt Engine Output
            </h3>
          </div>

          {output ? (
            /* Active Output Box */
            <section className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="flex justify-between items-center px-5 py-4 bg-slate-900/50 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Ready to Copy & Paste
                  </span>
                  {detectedDomain && (
                    <span className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-400 font-mono">
                      {detectedDomain}
                    </span>
                  )}
                </div>

                <button
                  onClick={copyOutput}
                  className={`text-xs font-bold tracking-wide px-4 py-2 rounded-lg transition-all duration-200 shadow-sm flex items-center gap-1.5 min-w-[85px] justify-center ${
                    copied 
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                      : "bg-indigo-600 hover:bg-indigo-500 text-white"
                  }`}
                >
                  {copied ? "✓ Copied!" : "🗐 Copy"}
                </button>
              </div>

              <div className="p-5 sm:p-6 bg-slate-950/60 font-mono text-sm leading-relaxed text-slate-200 select-all whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                {output}
              </div>
            </section>
          ) : (
            /* Elegant Placeholder Container when empty */
            <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center bg-slate-900/20 transition-all">
              <div className="text-3xl mb-2 text-slate-700">📋</div>
              <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
                Your elite, structured prompt framework will generate instantly here once you run a search.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;