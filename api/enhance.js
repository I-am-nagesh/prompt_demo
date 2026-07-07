import { CORE_PROMPT, DOMAIN_EXTENSIONS } from "./templates.js";

const CLASSIFIER_PROMPT = `
Classify the user's request into exactly one category.

Categories:
IMAGE
CODING
WRITING
PRESENTATION
BUSINESS
LEARNING

Return ONLY the category name.
`;

// Change to an awaited helper function
async function logToSupabase(rawPrompt, category, enhancedPrompt, reqHeaders) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase credentials missing from Vercel environment variables.");
    return;
  }

  const country = reqHeaders["x-vercel-ip-country"] || "unknown";
  const userAgent = reqHeaders["user-agent"] || "";
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
  const deviceType = isMobile ? "Mobile" : "Desktop";

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/search_logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        raw_prompt: rawPrompt,
        detected_category: category,
        enhanced_prompt: enhancedPrompt,
        country: country,
        device_type: deviceType
      })
    });

    if (!res.ok) {
      const errLog = await res.text();
      console.error(`Supabase API rejected post. Status: ${res.status}, Error: ${errLog}`);
    }
  } catch (err) {
    console.error("Failed to reach Supabase API network bridge:", err);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const trimmedInput = prompt.trim();

    // Step 1: Detect category
    const classifierResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0,
          messages: [
            { role: "system", content: CLASSIFIER_PROMPT },
            { role: "user", content: trimmedInput },
          ],
        }),
      }
    );

    const classifierData = await classifierResponse.json();

    let category =
      classifierData?.choices?.[0]?.message?.content?.trim()?.toUpperCase() || "WRITING";

    const validDomains = ["IMAGE", "CODING", "WRITING", "PRESENTATION", "BUSINESS", "LEARNING"];
    const matchedCategory = validDomains.find((d) => category.includes(d));
    category = matchedCategory || "WRITING";

    // Step 2: Compose unified template
    const selectedExtension = DOMAIN_EXTENSIONS[category] || DOMAIN_EXTENSIONS.WRITING;
    const universalSystemPrompt = `${CORE_PROMPT}\n\n${selectedExtension}`;

    // Step 3: Generate enhanced prompt
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          messages: [
            { role: "system", content: universalSystemPrompt },
            { role: "user", content: `Optimize this prompt concept: "${trimmedInput}"` },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq Error:", data);
      return res.status(500).json({ error: "Failed to generate prompt" });
    }

    let enhancedPrompt = data?.choices?.[0]?.message?.content || "No response generated.";

    enhancedPrompt = enhancedPrompt
      .replace(/^```[a-zA-Z]*\n/gm, "")
      .replace(/```$/gm, "")
      .trim();

    // --- STEP 4: ADD AWAIT HERE TO HOLD THE TIMEOUT ON VERCEL ---
    await logToSupabase(trimmedInput, category, enhancedPrompt, req.headers);

    return res.status(200).json({
      category,
      result: enhancedPrompt,
    });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}