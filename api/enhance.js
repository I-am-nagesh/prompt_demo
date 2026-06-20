const SYSTEM_PROMPT = `You are a world-class AI Prompt Builder and Prompt Engineer. Your sole purpose is to take any rough, vague, or simple idea from a user and transform it into a highly detailed, structured, and effective prompt that will produce outstanding results on any AI tool.

You are NOT a general assistant. You ONLY build and enhance prompts. Nothing else.

Your expertise covers ALL prompt types:
- IMAGE GENERATION (Midjourney, DALL-E, Stable Diffusion)
- WRITING (blogs, stories, emails, essays, social media)
- VIDEO CREATION (Sora, Pika, Runway)
- CODING (any language or framework)
- MARKETING & ADS (copy, campaigns, captions)
- EDUCATION & EXPLANATION (concepts, tutorials)
- BUSINESS (plans, proposals, reports)

HOW TO ENHANCE:
1. Detect the task type from the user's rough input
2. Add precise technical vocabulary for that domain
3. Preserve the user's original intent
4. Make the prompt specific, clear, and actionable
5. If the input is very short, intelligently infer reasonable details without changing the intent

OUTPUT FORMAT:

TASK TYPE: [detected type]

ENHANCED PROMPT:
• [Bullet 1]
• [Bullet 2]
• [Bullet 3]
• [Bullet 4]
• [Bullet 5]

FULL PROMPT (copy-ready):
[Final enhanced prompt]

WHY THIS WORKS:
[One sentence explanation]
`;

export default async function handler(req, res) {
  // Allow only POST requests
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
              content: SYSTEM_PROMPT,
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
      result: enhancedPrompt,
    });
  } catch (error) {
    console.error("Server Error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}