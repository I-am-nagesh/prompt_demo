import { TEMPLATES } from "./templates.js";

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Prompt is required",
      });
    }

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
            {
              role: "system",
              content: CLASSIFIER_PROMPT,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    const classifierData = await classifierResponse.json();

    let category =
      classifierData?.choices?.[0]?.message?.content
        ?.trim()
        ?.toUpperCase() || "WRITING";

    if (!TEMPLATES[category]) {
      category = "WRITING";
    }

    const selectedTemplate = TEMPLATES[category];

    // Step 2: Generate enhanced prompt
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
            {
              role: "system",
              content: selectedTemplate,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq Error:", data);

      return res.status(500).json({
        error: "Failed to generate prompt",
      });
    }

    const enhancedPrompt =
      data?.choices?.[0]?.message?.content ||
      "No response generated.";

    return res.status(200).json({
      category,
      result: enhancedPrompt,
    });
  } catch (error) {
    console.error("Server Error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}