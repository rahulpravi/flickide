import { NextRequest } from "next/server";

interface AIRequestPayload {
  provider: "openai" | "anthropic" | "gemini" | "custom";
  apiKey: string;
  model: string;
  baseUrl?: string;
  prompt: string;
  contextFile?: {
    filename: string;
    content: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: AIRequestPayload = await req.json().catch(() => ({} as AIRequestPayload));
    const { provider, apiKey, model, baseUrl, prompt, contextFile } = body;

    if (!provider || !apiKey || !prompt) {
      return new Response(
        JSON.stringify({
          error: "Missing required parameters: provider, apiKey, or prompt",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const contextInstruction = contextFile
      ? `\n\n--- ACTIVE FILE CONTEXT (${contextFile.filename}) ---\n${contextFile.content}\n--- END CONTEXT ---\n`
      : "";

    // 1. OpenAI Integration
    if (provider === "openai") {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are an expert mobile IDE AI coding assistant in FlickIDE. Provide concise, clean, production-ready code. When suggesting code changes, enclose the code in Markdown code blocks with the appropriate language identifier so the user can click 'Apply to file'.",
            },
            {
              role: "user",
              content: `${prompt}${contextInstruction}`,
            },
          ],
        }),
      });

      // If the API returns an error (like 401 Unauthorized or 429 Rate Limit)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData?.error?.message || `Provider API Error: ${response.status}`;
        return new Response(
          JSON.stringify({
            error: errorMessage,
            details: errorData,
          }),
          {
            status: response.status,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "";
      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Custom OpenAI-compatible Provider (NVIDIA Nemotron, Groq, Together, Ollama, DeepSeek, etc.)
    if (provider === "custom") {
      const rawBaseUrl = baseUrl?.trim() || "https://api.openai.com/v1";

      // Clean the URL by removing any trailing slash
      const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, "");

      // Add /chat/completions only if the user hasn't already included it
      const finalEndpoint = cleanBaseUrl.endsWith("/chat/completions")
        ? cleanBaseUrl
        : `${cleanBaseUrl}/chat/completions`;

      const targetModel = model || "llama3-8b-8192";

      const response = await fetch(finalEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [
            {
              role: "system",
              content:
                "You are an expert mobile IDE AI coding assistant in FlickIDE. Provide concise, clean, production-ready code. When suggesting code changes, enclose the code in Markdown code blocks with the appropriate language identifier so the user can click 'Apply to file'.",
            },
            {
              role: "user",
              content: `${prompt}${contextInstruction}`,
            },
          ],
        }),
      });

      // If the API returns an error
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData?.error?.message ||
          errorData?.message ||
          `Provider API Error: ${response.status}`;
        return new Response(
          JSON.stringify({
            error: errorMessage,
            details: errorData,
          }),
          {
            status: response.status,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "";
      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Anthropic Integration
    if (provider === "anthropic") {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: model || "claude-3-5-sonnet-20241022",
          max_tokens: 4096,
          system:
            "You are an expert mobile IDE AI coding assistant in FlickIDE. Provide concise, clean code. Enclose code changes in markdown code blocks.",
          messages: [
            {
              role: "user",
              content: `${prompt}${contextInstruction}`,
            },
          ],
        }),
      });

      // If the API returns an error
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData?.error?.message || `Provider API Error: ${response.status}`;
        return new Response(
          JSON.stringify({
            error: errorMessage,
            details: errorData,
          }),
          {
            status: response.status,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const data = await response.json();
      const reply =
        data.content?.find((c: any) => c.type === "text")?.text || "";
      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 4. Google Gemini Integration
    if (provider === "gemini") {
      const modelName = model || "gemini-1.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      const systemPrompt =
        "You are an expert mobile IDE AI coding assistant in FlickIDE. Provide concise, production-ready code. Enclose code changes in markdown code blocks with the correct language tag.";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: `${systemPrompt}\n\n${prompt}${contextInstruction}` },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 4096,
          },
        }),
      });

      // If the API returns an error
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData?.error?.message || `Provider API Error: ${response.status}`;
        return new Response(
          JSON.stringify({
            error: errorMessage,
            details: errorData,
          }),
          {
            status: response.status,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const data = await response.json();
      const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "No reply generated";
      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: `Unsupported provider: ${provider}` }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    // Catch any network errors or server crashes
    return new Response(
      JSON.stringify({
        error: "Internal Server Error in Proxy",
        message: error?.message || String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
