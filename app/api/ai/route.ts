import { NextRequest } from "next/server";
import {
  AIProvider,
  generateAIResponse,
} from "../../../lib/ai/multiAiService";

interface AIRequestPayload {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  prompt: string;
  contextFile?: {
    filename: string;
    content: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: AIRequestPayload = await req.json().catch(() => ({} as AIRequestPayload));
    const { provider, apiKey, model, prompt, contextFile } = body;

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

    const fullPrompt = `${prompt}${contextInstruction}`;

    const reply = await generateAIResponse(
      provider,
      apiKey,
      fullPrompt,
      undefined,
      model
    );

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    const status = /429|rate|quota/i.test(error?.message)
      ? 429
      : /401|403|unauthoriz|invalid/i.test(error?.message)
      ? 401
      : 500;

    return new Response(
      JSON.stringify({
        error: error?.message || "Internal Server Error in AI Proxy",
      }),
      {
        status,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
