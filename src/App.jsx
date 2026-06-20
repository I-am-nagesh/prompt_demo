import { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEnhance = async () => {
    if (!input.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    setLoading(true);
    setError("");
    setOutput("");

    try {
      const response = await fetch("/api/enhance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: input,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setOutput(data.result);
    } catch (err) {
      setError(err.message || "Failed to generate prompt");
    } finally {
      setLoading(false);
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      alert("Copied to clipboard!");
    } catch {
      alert("Failed to copy.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-3">
          Prompt Enhancer
        </h1>

        <p className="text-center text-slate-400 mb-8">
          Turn simple ideas into expert AI prompts
        </p>

        <div className="bg-slate-900 rounded-2xl p-6 shadow-lg">
          <label className="block mb-3 text-lg font-medium">
            Enter your prompt
          </label>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Example: Create an image of a dog in a park"
            className="w-full h-40 p-4 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          <button
            onClick={handleEnhance}
            disabled={loading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 py-3 rounded-xl font-semibold transition"
          >
            {loading ? "Enhancing..." : "Enhance Prompt"}
          </button>
        </div>

        {error && (
          <div className="mt-6 bg-red-500/20 border border-red-500 rounded-xl p-4">
            {error}
          </div>
        )}

        {output && (
          <div className="mt-8 bg-slate-900 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">
                Generated Prompt
              </h2>

              <button
                onClick={copyOutput}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
              >
                Copy
              </button>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl whitespace-pre-wrap text-slate-200">
              {output}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;