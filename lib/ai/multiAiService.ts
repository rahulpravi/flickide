export type AIProvider = "gemini" | "openai" | "grok" | "groq" | "openrouter";

export interface ProviderConfig {
  id: AIProvider;
  name: string;
  defaultModel: string;
  keyUrl: string;
  placeholder: string;
  badge?: string;
  badgeColor?: string;
}

export const AI_PROVIDERS: Record<AIProvider, ProviderConfig> = {
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    defaultModel: "gemini-2.5-flash",
    keyUrl: "https://aistudio.google.com/app/apikey",
    placeholder: "AIzaSy...",
    badge: "Free Tier",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  },
  openai: {
    id: "openai",
    name: "ChatGPT (OpenAI)",
    defaultModel: "gpt-4o-mini",
    keyUrl: "https://platform.openai.com/api-keys",
    placeholder: "sk-proj-...",
    badge: "Industry Std",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  grok: {
    id: "grok",
    name: "Grok (xAI)",
    defaultModel: "grok-2-latest",
    keyUrl: "https://console.x.ai/",
    placeholder: "xai-...",
    badge: "Coding Beast",
    badgeColor: "text-neutral-200 bg-neutral-700/50 border-neutral-600",
  },
  groq: {
    id: "groq",
    name: "Groq (Ultra Fast / Free)",
    defaultModel: "llama-3.3-70b-versatile",
    keyUrl: "https://console.groq.com/keys",
    placeholder: "gsk_...",
    badge: "Free & Fast",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  openrouter: {
    id: "openrouter",
    name: "OpenRouter (All-in-One)",
    defaultModel: "deepseek/deepseek-chat",
    keyUrl: "https://openrouter.ai/keys",
    placeholder: "sk-or-v1-...",
    badge: "All Models",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  },
};

// 1. Key paste cheyyumbol provider auto-detect cheyyunna function
export function detectProviderFromKey(apiKey: string): AIProvider | null {
  const key = apiKey.trim();
  if (key.startsWith("AIza")) return "gemini";
  if (key.startsWith("gsk_")) return "groq";
  if (key.startsWith("xai-")) return "grok";
  if (key.startsWith("sk-or-")) return "openrouter";
  if (key.startsWith("sk-")) return "openai";
  return null;
}

// 2. Ella AI-yilekkum message ayakkunna unified function
export async function generateAIResponse(
  provider: AIProvider,
  apiKey: string,
  prompt: string,
  systemPrompt = "You are an expert mobile IDE AI coding assistant inside FlickIDE. Provide concise, clean, production-ready code. Enclose code changes in markdown code blocks.",
  customModel?: string
): Promise<string> {
  const model = customModel?.trim() || AI_PROVIDERS[provider]?.defaultModel || "gemini-2.5-flash";

  // Google Gemini API Call
  if (provider === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "Gemini API Error");
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
  }

  // OpenAI, Grok, Groq & OpenRouter (OpenAI-Compatible Endpoints)
  const endpoints: Record<Exclude<AIProvider, "gemini">, string> = {
    openai: "https://api.openai.com/v1/chat/completions",
    grok: "https://api.x.ai/v1/chat/completions",
    groq: "https://api.groq.com/openai/v1/chat/completions",
    openrouter: "https://openrouter.ai/api/v1/chat/completions",
  };

  const res = await fetch(endpoints[provider], {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `${provider} API Error`);
  return data.choices?.[0]?.message?.content || "No response";
}
