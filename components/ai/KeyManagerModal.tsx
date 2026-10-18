"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  Plus,
  Trash2,
  X,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Pencil,
  Check,
  ExternalLink,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  useAPIRotationStore,
  APIKeyRecord,
  DEFAULT_MODELS,
} from "../../stores/apiRotationStore";
import {
  AIProvider,
  AI_PROVIDERS,
  detectProviderFromKey,
} from "../../lib/ai/multiAiService";
import { initiateOpenRouterOAuth } from "../../lib/ai/openrouterOAuth";
import { useUIStore } from "../../stores/uiStore";

export const KeyManagerModal: React.FC = () => {
  const { isKeyManagerOpen, setKeyManagerOpen } = useUIStore();
  const { keys, addKey, updateKey, removeKey } = useAPIRotationStore();

  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
  const [provider, setProvider] = useState<AIProvider>("gemini");
  const [keyValue, setKeyValue] = useState("");
  const [keyName, setKeyName] = useState("");
  const [modelName, setModelName] = useState("");
  const [autoDetectedProvider, setAutoDetectedProvider] = useState<AIProvider | null>(null);
  const [isConnectingOAuth, setIsConnectingOAuth] = useState(false);
  const [, setTick] = useState(0);

  // Periodic re-render to update live cooldown seconds countdown
  useEffect(() => {
    if (!isKeyManagerOpen) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isKeyManagerOpen]);

  if (!isKeyManagerOpen) return null;

  const currentProviderConfig = AI_PROVIDERS[provider] || AI_PROVIDERS.gemini;

  // Handle typing/pasting API Key with Smart Auto-Detection
  const handleKeyChange = (val: string) => {
    setKeyValue(val);
    const detected = detectProviderFromKey(val);
    if (detected) {
      setAutoDetectedProvider(detected);
      setProvider(detected);
      if (!keyName || keyName.includes("Key")) {
        setKeyName(`${AI_PROVIDERS[detected].name} Key`);
      }
    } else {
      setAutoDetectedProvider(null);
    }
  };

  const handleStartEdit = (k: APIKeyRecord) => {
    setEditingKeyId(k.id);
    setProvider(k.provider);
    setKeyValue(k.key);
    setKeyName(k.name || "");
    setModelName(k.modelName || "");
    setAutoDetectedProvider(null);
  };

  const handleCancelEdit = () => {
    setEditingKeyId(null);
    setKeyValue("");
    setKeyName("");
    setModelName("");
    setAutoDetectedProvider(null);
  };

  const handleClose = () => {
    handleCancelEdit();
    setKeyManagerOpen(false);
  };

  const handleGoogleOAuth = async () => {
    try {
      setIsConnectingOAuth(true);
      await initiateOpenRouterOAuth();
    } catch (err) {
      console.error(err);
      setIsConnectingOAuth(false);
    }
  };

  const handleSubmitKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyValue.trim()) return;

    if (editingKeyId) {
      await updateKey(editingKeyId, {
        provider,
        key: keyValue,
        name: keyName,
        modelName,
      });
      setEditingKeyId(null);
    } else {
      await addKey(provider, keyValue, keyName, undefined, modelName);
    }

    setKeyValue("");
    setKeyName("");
    setModelName("");
    setAutoDetectedProvider(null);
  };

  const getCooldownRemaining = (cooldownUntil: number | null): number => {
    if (!cooldownUntil) return 0;
    const diff = Math.ceil((cooldownUntil - Date.now()) / 1000);
    return diff > 0 ? diff : 0;
  };

  const providersList: AIProvider[] = ["gemini", "groq", "openai", "grok", "openrouter"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-100 border border-surface-border rounded-xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-surface-border bg-surface-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-brand-cyan/15 border border-brand-cyan/30 flex items-center justify-center">
              <Key className="w-4 h-4 text-brand-cyan" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AI Providers & API Keys</h3>
              <p className="text-[11px] text-neutral-400">
                1-Click Google OAuth & Multi-Model failover
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 no-scrollbar">
          {/* 1-Click Google OAuth Card (OpenRouter) */}
          <div className="bg-gradient-to-r from-purple-900/30 via-surface-200 to-brand-cyan/10 p-3.5 rounded-xl border border-purple-500/30 space-y-2.5 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-white flex items-center space-x-1">
                    <span>Connect AI with Google</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded font-semibold border border-purple-500/40">
                    OpenRouter OAuth
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300">
                  Sign in once with Google to unlock Gemini, Claude, GPT-4o, and DeepSeek — <strong>no copy-pasting API keys!</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleOAuth}
              disabled={isConnectingOAuth}
              className="w-full min-h-[42px] bg-white hover:bg-neutral-100 active:scale-[0.98] text-neutral-900 font-semibold rounded-lg text-xs transition-all flex items-center justify-center space-x-2 shadow-lg touch-manipulation"
            >
              {isConnectingOAuth ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-neutral-700" />
                  <span>Redirecting to Google Sign-In...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with Google (1-Click AI Connect)</span>
                </>
              )}
            </button>
          </div>

          <div className="relative flex items-center justify-center my-1">
            <div className="border-t border-surface-border w-full" />
            <span className="bg-surface-100 px-2 text-[10px] text-neutral-400 font-semibold tracking-wider uppercase shrink-0">
              Or Enter Any Key Manually
            </span>
          </div>

          {/* Provider Selection & 1-Click Get Key */}
          <div className="bg-surface-200 p-3.5 rounded-xl border border-surface-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                {editingKeyId ? "Edit Provider Key" : "Select AI Provider"}
              </span>

              {/* 1-Click "Get API Key" Button */}
              <a
                href={currentProviderConfig.keyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-brand-cyan bg-brand-cyan/10 hover:bg-brand-cyan/20 active:scale-95 border border-brand-cyan/30 rounded-md transition-all touch-manipulation"
              >
                <span>
                  {provider === "gemini" || provider === "groq"
                    ? "Get Free Key"
                    : "Get API Key"}
                </span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>

            {/* Provider Pills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {providersList.map((p) => {
                const conf = AI_PROVIDERS[p];
                const isSelected = provider === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setProvider(p);
                      setAutoDetectedProvider(null);
                    }}
                    className={`p-2 rounded-lg border text-left transition-all touch-manipulation relative flex flex-col justify-between ${
                      isSelected
                        ? "bg-brand-cyan/15 border-brand-cyan text-white shadow-[0_0_10px_rgba(0,210,255,0.25)]"
                        : "bg-surface-300 border-surface-border text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold truncate">{conf.name}</span>
                    </div>
                    {conf.badge && (
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded border font-medium w-max ${
                          conf.badgeColor || "text-neutral-300 bg-neutral-700/50 border-neutral-600"
                        }`}
                      >
                        {conf.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitKey} className="space-y-2.5 pt-1">
              {/* API Key Input with Smart Auto-Detect */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <label className="text-neutral-300 font-medium">API Key</label>
                  {autoDetectedProvider && (
                    <span className="text-brand-cyan flex items-center space-x-1 animate-pulse font-medium">
                      <Sparkles className="w-3 h-3" />
                      <span>Detected: {AI_PROVIDERS[autoDetectedProvider].name}</span>
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder={`Paste key here (e.g. ${currentProviderConfig.placeholder})`}
                    value={keyValue}
                    onChange={(e) => handleKeyChange(e.target.value)}
                    className="w-full bg-surface-300 border border-surface-border focus:border-brand-cyan rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none font-mono transition-colors"
                  />
                  {keyValue && (
                    <button
                      type="button"
                      onClick={() => handleKeyChange("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs px-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-neutral-400">
                  Tip: Just paste any key — Gemini (<code className="text-brand-cyan">AIza...</code>), OpenAI (<code className="text-emerald-400">sk-...</code>), Groq (<code className="text-amber-400">gsk_...</code>), Grok (<code className="text-neutral-200">xai-...</code>), or OpenRouter (<code className="text-purple-400">sk-or-...</code>) will be auto-detected!
                </p>
              </div>

              {/* Model Override (Optional) */}
              <div>
                <input
                  type="text"
                  placeholder={`Model (optional, default: ${currentProviderConfig.defaultModel})`}
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full bg-surface-300 border border-surface-border focus:border-brand-cyan rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none font-mono"
                />
              </div>

              {/* Key Label */}
              <div>
                <input
                  type="text"
                  placeholder={`Key Label (e.g. ${currentProviderConfig.name} Primary)`}
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-full bg-surface-300 border border-surface-border focus:border-brand-cyan rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-1">
                {editingKeyId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3.5 min-h-[42px] bg-surface-300 hover:bg-surface-active text-neutral-300 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!keyValue.trim()}
                  className="flex-1 min-h-[42px] bg-brand-cyan hover:bg-brand-accent disabled:opacity-40 text-black font-semibold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5 touch-manipulation"
                >
                  {editingKeyId ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Update Key</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Save & Register Key</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Configured Keys Pool List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Configured Key Pool ({keys.length})
              </span>
              <span className="text-[10px] text-neutral-400">Stored locally in IndexedDB</span>
            </div>

            {keys.length === 0 ? (
              <div className="text-center p-6 border border-dashed border-surface-border rounded-xl text-neutral-400 text-xs space-y-1">
                <Zap className="w-8 h-8 text-neutral-500 mx-auto mb-1 opacity-70" />
                <p className="font-semibold text-neutral-300">No AI keys added yet</p>
                <p className="text-[11px] text-neutral-500">
                  Click "Sign in with Google" above or add a free key to start coding with AI!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {keys.map((k) => {
                  const cooldownSec = getCooldownRemaining(k.cooldownUntil);
                  const isCoolingDown = cooldownSec > 0;
                  const isBeingEdited = editingKeyId === k.id;
                  const pConfig = AI_PROVIDERS[k.provider] || AI_PROVIDERS.gemini;

                  return (
                    <div
                      key={k.id}
                      className={`bg-surface-200 border p-3 rounded-xl flex items-center justify-between transition-all ${
                        isBeingEdited
                          ? "border-brand-cyan bg-brand-cyan/5 shadow-[0_0_12px_rgba(0,210,255,0.15)]"
                          : "border-surface-border"
                      }`}
                    >
                      <div className="space-y-1 flex-1 min-w-0 pr-2">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-white truncate">
                            {k.name}
                          </span>
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 bg-surface-300 text-brand-cyan rounded border border-surface-border">
                            {pConfig.name}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-surface-300 text-neutral-300 rounded border border-surface-border truncate max-w-[120px]">
                            {k.modelName || pConfig.defaultModel}
                          </span>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center space-x-2 text-[10px]">
                          {isCoolingDown ? (
                            <span className="text-amber-400 flex items-center space-x-1">
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Cooling down ({cooldownSec}s remaining)</span>
                            </span>
                          ) : k.status === "invalid" ? (
                            <span className="text-rose-400 flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Invalid Key</span>
                            </span>
                          ) : (
                            <span className="text-emerald-400 flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>Ready & Active</span>
                            </span>
                          )}

                          <span className="text-neutral-500">•</span>
                          <span className="text-neutral-400">Used {k.usageCount} times</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-0.5 shrink-0">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(k)}
                          title="Edit key details"
                          aria-label={`Edit ${k.name}`}
                          className={`min-h-[44px] min-w-[40px] flex items-center justify-center rounded-lg transition-colors ${
                            isBeingEdited
                              ? "text-brand-cyan bg-brand-cyan/20 border border-brand-cyan/40"
                              : "text-neutral-400 hover:text-brand-cyan hover:bg-surface-active"
                          }`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (editingKeyId === k.id) handleCancelEdit();
                            removeKey(k.id);
                          }}
                          title="Remove key"
                          aria-label={`Remove ${k.name}`}
                          className="min-h-[44px] min-w-[40px] flex items-center justify-center text-neutral-500 hover:text-rose-400 hover:bg-surface-active rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-surface-border bg-surface-200 flex justify-end">
          <button
            onClick={handleClose}
            className="min-h-[42px] px-6 bg-surface-300 hover:bg-surface-active text-white rounded-lg text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
