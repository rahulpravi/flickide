import { create } from "zustand";
import { getSettingFromDB, saveSettingToDB } from "../lib/db/indexedDB";
import {
  AIProvider,
  AI_PROVIDERS,
  generateAIResponse,
} from "../lib/ai/multiAiService";

export type { AIProvider };

export interface APIKeyRecord {
  id: string;
  provider: AIProvider;
  key: string;
  name: string;
  status: "active" | "cooling_down" | "invalid";
  cooldownUntil: number | null;
  usageCount: number;
  failureCount: number;
  lastError: string | null;
  baseUrl?: string;
  modelName?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  providerUsed?: AIProvider;
  keyNameUsed?: string;
  contextFile?: string;
}

interface APIRotationState {
  keys: APIKeyRecord[];
  activeProvider: AIProvider;
  selectedModel: string;
  selectedKeyId: string;
  isStreaming: boolean;
  messages: ChatMessage[];
  isInitialized: boolean;

  // Actions
  initKeys: () => Promise<void>;
  addKey: (
    provider: AIProvider,
    key: string,
    name?: string,
    baseUrl?: string,
    modelName?: string
  ) => Promise<void>;
  updateKey: (
    id: string,
    newKeyData: {
      provider: AIProvider;
      key: string;
      name?: string;
      baseUrl?: string;
      modelName?: string;
    }
  ) => Promise<void>;
  removeKey: (id: string) => Promise<void>;
  setActiveProvider: (provider: AIProvider) => void;
  setSelectedModel: (model: string) => void;
  setSelectedKeyId: (keyId: string) => void;
  markKeyCooldown: (keyId: string, cooldownSec?: number, reason?: string) => void;
  markKeyInvalid: (keyId: string, reason?: string) => void;
  recordKeySuccess: (keyId: string) => void;
  getAvailableKey: (provider: AIProvider) => APIKeyRecord | null;
  executeWithFailover: (
    prompt: string,
    context?: { filename: string; content: string }
  ) => Promise<string>;
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => string;
  clearMessages: () => void;
}

export const DEFAULT_MODELS: Record<AIProvider, string> = {
  gemini: AI_PROVIDERS.gemini.defaultModel,
  openai: AI_PROVIDERS.openai.defaultModel,
  grok: AI_PROVIDERS.grok.defaultModel,
  groq: AI_PROVIDERS.groq.defaultModel,
  openrouter: AI_PROVIDERS.openrouter.defaultModel,
};

export const useAPIRotationStore = create<APIRotationState>((set, get) => ({
  keys: [],
  activeProvider: "gemini",
  selectedModel: DEFAULT_MODELS.gemini,
  selectedKeyId: "auto",
  isStreaming: false,
  messages: [
    {
      id: "msg-welcome",
      role: "assistant",
      content:
        "👋 Hello! I am your FlickIDE Assistant. I can read your active editor file, answer queries, suggest refactors, and insert generated code directly into your project. Configure your API keys in the key manager to get started!",
      timestamp: Date.now(),
    },
  ],
  isInitialized: false,

  initKeys: async () => {
    try {
      const savedKeys = await getSettingFromDB<APIKeyRecord[]>("ai_keys");
      if (savedKeys && Array.isArray(savedKeys)) {
        // Reset any expired cooldowns on load
        const now = Date.now();
        const refreshed = savedKeys.map((k) => {
          if (k.status === "cooling_down" && k.cooldownUntil && k.cooldownUntil <= now) {
            return { ...k, status: "active" as const, cooldownUntil: null };
          }
          return k;
        });
        set({ keys: refreshed, isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    } catch (e) {
      console.error("Failed to load keys from IndexedDB:", e);
      set({ isInitialized: true });
    }
  },

  addKey: async (
    provider: AIProvider,
    key: string,
    name?: string,
    baseUrl?: string,
    modelName?: string
  ) => {
    const trimmed = key.trim();
    if (!trimmed) return;

    const providerName = AI_PROVIDERS[provider]?.name || provider.toUpperCase();
    const newRecord: APIKeyRecord = {
      id: `key-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      provider,
      key: trimmed,
      name:
        name?.trim() ||
        `${providerName} Key #${get().keys.filter((k) => k.provider === provider).length + 1}`,
      status: "active",
      cooldownUntil: null,
      usageCount: 0,
      failureCount: 0,
      lastError: null,
      baseUrl: baseUrl?.trim() || undefined,
      modelName: modelName?.trim() || undefined,
    };

    const updated = [...get().keys, newRecord];
    set({ keys: updated });
    await saveSettingToDB("ai_keys", updated);
  },

  updateKey: async (
    id: string,
    newKeyData: {
      provider: AIProvider;
      key: string;
      name?: string;
      baseUrl?: string;
      modelName?: string;
    }
  ) => {
    const trimmed = newKeyData.key.trim();
    if (!trimmed) return;

    const updated = get().keys.map((k) => {
      if (k.id === id) {
        return {
          ...k,
          provider: newKeyData.provider,
          key: trimmed,
          name:
            newKeyData.name?.trim() ||
            k.name ||
            `${AI_PROVIDERS[newKeyData.provider]?.name || newKeyData.provider} Key`,
          baseUrl: newKeyData.baseUrl?.trim() || undefined,
          modelName: newKeyData.modelName?.trim() || undefined,
          status: "active" as const,
          cooldownUntil: null,
          lastError: null,
        };
      }
      return k;
    });

    set({ keys: updated });
    await saveSettingToDB("ai_keys", updated);
  },

  removeKey: async (id: string) => {
    const updated = get().keys.filter((k) => k.id !== id);
    const currentSelectedKeyId = get().selectedKeyId;
    const nextSelectedKeyId = currentSelectedKeyId === id ? "auto" : currentSelectedKeyId;
    set({ keys: updated, selectedKeyId: nextSelectedKeyId });
    await saveSettingToDB("ai_keys", updated);
  },

  setActiveProvider: (provider: AIProvider) => {
    set({
      activeProvider: provider,
      selectedModel: DEFAULT_MODELS[provider],
    });
  },

  setSelectedModel: (model: string) => {
    set({ selectedModel: model });
  },

  setSelectedKeyId: (keyId: string) => {
    set({ selectedKeyId: keyId });
  },

  markKeyCooldown: (keyId: string, cooldownSec: number = 60, reason?: string) => {
    const cooldownUntil = Date.now() + cooldownSec * 1000;
    const updated = get().keys.map((k) => {
      if (k.id === keyId) {
        return {
          ...k,
          status: "cooling_down" as const,
          cooldownUntil,
          failureCount: k.failureCount + 1,
          lastError: reason || "Rate limit hit (429)",
        };
      }
      return k;
    });

    set({ keys: updated });
    saveSettingToDB("ai_keys", updated);
  },

  markKeyInvalid: (keyId: string, reason?: string) => {
    const updated = get().keys.map((k) => {
      if (k.id === keyId) {
        return {
          ...k,
          status: "invalid" as const,
          failureCount: k.failureCount + 1,
          lastError: reason || "Authentication failed (401/403)",
        };
      }
      return k;
    });

    set({ keys: updated });
    saveSettingToDB("ai_keys", updated);
  },

  recordKeySuccess: (keyId: string) => {
    const updated = get().keys.map((k) => {
      if (k.id === keyId) {
        return {
          ...k,
          usageCount: k.usageCount + 1,
          lastError: null,
        };
      }
      return k;
    });

    set({ keys: updated });
    saveSettingToDB("ai_keys", updated);
  },

  getAvailableKey: (provider: AIProvider) => {
    const now = Date.now();
    const { keys } = get();

    // Check if any cooldown has expired and reactivate
    let stateModified = false;
    const currentKeys = keys.map((k) => {
      if (k.status === "cooling_down" && k.cooldownUntil && k.cooldownUntil <= now) {
        stateModified = true;
        return { ...k, status: "active" as const, cooldownUntil: null };
      }
      return k;
    });

    if (stateModified) {
      set({ keys: currentKeys });
      saveSettingToDB("ai_keys", currentKeys);
    }

    const eligible = currentKeys.filter(
      (k) => k.provider === provider && k.status === "active"
    );

    if (eligible.length === 0) return null;

    // Pick key with lowest usage count (round-robin/load balancing)
    eligible.sort((a, b) => a.usageCount - b.usageCount);
    return eligible[0];
  },

  executeWithFailover: async (
    prompt: string,
    context?: { filename: string; content: string }
  ) => {
    const {
      activeProvider,
      selectedModel,
      selectedKeyId,
      getAvailableKey,
      markKeyCooldown,
      markKeyInvalid,
      recordKeySuccess,
      keys,
    } = get();

    const fullPrompt = context
      ? `--- ACTIVE FILE CONTEXT (${context.filename}) ---\n${context.content}\n--- END CONTEXT ---\n\n${prompt}`
      : prompt;

    // Manual Model / Key Selection: bypass failover queue and force request through specific key
    if (selectedKeyId && selectedKeyId !== "auto") {
      const specificKey = keys.find((k) => k.id === selectedKeyId);
      if (!specificKey) {
        throw new Error(
          "Selected key not found in key pool. Please select an available key or choose Auto (Failover Rotation)."
        );
      }

      set({ isStreaming: true });
      const targetModel = specificKey.modelName || DEFAULT_MODELS[specificKey.provider];

      try {
        const reply = await generateAIResponse(
          specificKey.provider,
          specificKey.key,
          fullPrompt,
          undefined,
          targetModel
        );

        recordKeySuccess(specificKey.id);
        set({ isStreaming: false });
        return reply;
      } catch (err: any) {
        set({ isStreaming: false });
        const errMsg = err?.message || String(err);
        if (/429|rate|quota|exhaust/i.test(errMsg)) {
          markKeyCooldown(specificKey.id, 60, errMsg);
        } else if (/401|403|unauthoriz|invalid/i.test(errMsg)) {
          markKeyInvalid(specificKey.id, errMsg);
        }
        throw err;
      }
    }

    const providerKeys = keys.filter((k) => k.provider === activeProvider);

    if (providerKeys.length === 0) {
      throw new Error(
        `No API keys configured for ${AI_PROVIDERS[activeProvider]?.name || activeProvider}. Please add one in Key Manager.`
      );
    }

    // Try keys sequentially with failover on 429 or network errors
    const attemptedKeyIds = new Set<string>();

    while (attemptedKeyIds.size < providerKeys.length) {
      const candidateKey = getAvailableKey(activeProvider);

      if (!candidateKey || attemptedKeyIds.has(candidateKey.id)) {
        // Find if all keys are cooling down
        const coolingKeys = providerKeys.filter((k) => k.status === "cooling_down");
        if (coolingKeys.length > 0) {
          const nearestCooldown = Math.min(
            ...coolingKeys.map((k) => (k.cooldownUntil ? k.cooldownUntil - Date.now() : 60000))
          );
          const waitSec = Math.max(1, Math.round(nearestCooldown / 1000));
          throw new Error(
            `All ${AI_PROVIDERS[activeProvider]?.name || activeProvider} keys are rate-limited or cooling down. Nearest key recovers in ${waitSec}s.`
          );
        }
        throw new Error(
          `All available ${AI_PROVIDERS[activeProvider]?.name || activeProvider} keys failed. Check API Key validity.`
        );
      }

      attemptedKeyIds.add(candidateKey.id);

      try {
        set({ isStreaming: true });

        const reply = await generateAIResponse(
          activeProvider,
          candidateKey.key,
          fullPrompt,
          undefined,
          candidateKey.modelName || selectedModel
        );

        recordKeySuccess(candidateKey.id);
        set({ isStreaming: false });
        return reply;
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        if (/429|rate|quota|exhaust/i.test(errMsg)) {
          console.warn(
            `Key ${candidateKey.name} hit rate limit. Initiating failover rotation...`
          );
          markKeyCooldown(candidateKey.id, 60, errMsg);
        } else if (/401|403|unauthoriz|invalid/i.test(errMsg)) {
          markKeyInvalid(candidateKey.id, errMsg);
        }

        if (attemptedKeyIds.size >= providerKeys.length) {
          set({ isStreaming: false });
          throw err;
        }
        console.warn(`Request failed with key ${candidateKey.name}. Retrying with next key...`, err);
      }
    }

    set({ isStreaming: false });
    throw new Error("Unable to complete request. All provider keys were exhausted.");
  },

  addMessage: (message) => {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const fullMessage: ChatMessage = {
      ...message,
      id,
      timestamp: Date.now(),
    };

    set((state) => ({
      messages: [...state.messages, fullMessage],
    }));

    return id;
  },

  clearMessages: () => {
    set({
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: "Chat history cleared. What would you like to build or inspect next?",
          timestamp: Date.now(),
        },
      ],
    });
  },
}));
