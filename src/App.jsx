import { useState } from "react";

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

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [detectedDomain, setDetectedDomain] = useState("");

  const handleEnhance = async (overrideInput = null) => {
    const activeInput = typeof overrideInput === "string" ? overrideInput : input;

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
        throw new Error(data.error || "Something went wrong running optimization pipeline.");
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
      <div className="w-full max-w-4xl space-y-8 my-auto">
        
        {/* Header Section */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-sm font-medium tracking-wide backdrop-blur-md">
            ✨ Pro Prompt Infrastructure
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text">
            Prompt Enhancer
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-md mx-auto font-normal">
            Grammarly for AI prompts. Structural orchestration ready for immediate execution.
          </p>
        </header>

        {/* Interactive Domain Examples */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Click an example to test the engine
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

        {/* Primary Input Panel */}
        <main className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold tracking-wide text-slate-300">
              Raw Concept Input
            </label>
            <span className="text-xs text-slate-500">
              Supports any domain context
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
                <span>Processing Blueprint...</span>
              </>
            ) : (
              "Optimize Prompt Structure"
            )}
          </button>
        </main>

        {/* Error Messaging Banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm font-medium flex items-center gap-3">
            ⚠️ <span>{error}</span>
          </div>
        )}

        {/* Structured Output Generation Terminal */}
        {output && (
          <section className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex justify-between items-center px-5 py-4 bg-slate-900/50 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  Optimized Execution Prompt
                </h2>
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
                {copied ? (
                  <>
                    ✓ Copied!
                  </>
                ) : (
                  <>
                    🗐 Copy
                  </>
                )}
              </button>
            </div>

            <div className="p-5 sm:p-6 bg-slate-950/60 font-mono text-sm leading-relaxed text-slate-200 select-all whitespace-pre-wrap max-h-[400px] overflow-y-auto">
              {output}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default App;