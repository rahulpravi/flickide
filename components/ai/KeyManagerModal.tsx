"use client";

import React, { useState, useEffect } from "react";
import { Key, Plus, Trash2, X, RefreshCw, AlertTriangle, CheckCircle, Pencil, Check } from "lucide-react";
import { useAPIRotationStore, AIProvider, DEFAULT_MODELS, APIKeyRecord } from "../../stores/apiRotationStore";
import { useUIStore } from "../../stores/uiStore";

export const KeyManagerModal: React.FC = () => {
  const { isKeyManagerOpen, setKeyManagerOpen } = useUIStore();
  const { keys, addKey, updateKey, removeKey } = useAPIRotationStore();

  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
  const [provider, setProvider] = useState<AIProvider>("gemini");
  const [keyValue, setKeyValue] = useState("");
  const [keyName, setKeyName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [modelName, setModelName] = useState("");
  const [, setTick] = useState(0);

  // Periodic re-render to update live cooldown seconds countdown
  useEffect(() => {
    if (!isKeyManagerOpen) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isKeyManagerOpen]);

  if (!isKeyManagerOpen) return null;

  const handleStartEdit = (k: APIKeyRecord) => {
    setEditingKeyId(k.id);
    setProvider(k.provider);
    setKeyValue(k.key);
    setKeyName(k.name || "");
    setBaseUrl(k.baseUrl || "");
    setModelName(k.modelName || "");
  };

  const handleCancelEdit = () => {
    setEditingKeyId(null);
    setKeyValue("");
    setKeyName("");
    setBaseUrl("");
    setModelName("");
  };

  const handleClose = () => {
    handleCancelEdit();
    setKeyManagerOpen(false);
  };

  const handleSubmitKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyValue.trim()) return;

    if (editingKeyId) {
      await updateKey(editingKeyId, {
        provider,
        key: keyValue,
        name: keyName,
        baseUrl,
        modelName,
      });
      setEditingKeyId(null);
    } else {
      await addKey(provider, keyValue, keyName, baseUrl, modelName);
    }

    setKeyValue("");
    setKeyName("");
    setBaseUrl("");
    setModelName("");
  };

  const getCooldownRemaining = (cooldownUntil: number | null): number => {
    if (!cooldownUntil) return 0;
    const diff = Math.ceil((cooldownUntil - Date.now()) / 1000);
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-100 border border-surface-border rounded-xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-border bg-surface-200">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-brand-cyan" />
            <div>
              <h3 className="text-sm font-semibold text-white">API Keys & Failover Rotation</h3>
              <p className="text-[11px] text-neutral-400">
                Multi-key failover will auto-switch on 429 rate limits
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
        <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">
          {/* Add / Edit Key Form */}
          <form onSubmit={handleSubmitKey} className="bg-surface-200 p-3.5 rounded-lg border border-surface-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                {editingKeyId ? "Edit Provider Key" : "Add New Provider Key"}
              </span>
              {editingKeyId && (
                <span className="text-[10px] text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/30 px-2 py-0.5 rounded font-mono">
                  Editing Mode
                </span>
              )}
            </div>

            {/* Provider selection with 4 buttons: Gemini, OpenAI, Anthropic, Custom */}
            <div className="grid grid-cols-4 gap-1.5">
              {(["gemini", "openai", "anthropic", "custom"] as AIProvider[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProvider(p)}
                  className={`min-h-[40px] text-xs font-semibold rounded-md border capitalize transition-all ${
                    provider === p
                      ? "bg-brand-cyan/10 border-brand-cyan text-brand-cyan"
                      : "bg-surface-300 border-surface-border text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div>
              <input
                type="password"
                placeholder={
                  provider === "custom"
                    ? "Enter API Key / Bearer Token"
                    : `Enter ${provider.toUpperCase()} API Key`
                }
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                className="w-full bg-surface-300 border border-surface-border rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-cyan font-mono"
              />
            </div>

            {/* Dynamically rendered inputs for Custom provider, or optional model override */}
            {provider === "custom" ? (
              <>
                <div>
                  <input
                    type="text"
                    placeholder="Base URL (e.g., https://integrate.api.nvidia.com/v1)"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="w-full bg-surface-300 border border-surface-border rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-cyan font-mono"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Tip: Enter base URL (e.g. for NVIDIA Nemotron: <span className="font-mono text-brand-cyan">https://integrate.api.nvidia.com/v1</span>). <code className="text-neutral-300">/chat/completions</code> will be handled automatically.
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Model Name (e.g., nvidia/llama-3.1-nemotron-70b-instruct)"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-full bg-surface-300 border border-surface-border rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-cyan font-mono"
                  />
                </div>
              </>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder={`Model Override (optional, default: ${DEFAULT_MODELS[provider]})`}
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full bg-surface-300 border border-surface-border rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-cyan font-mono"
                />
              </div>
            )}

            <div>
              <input
                type="text"
                placeholder="Key label (e.g. Primary Key, Backup Pool 2)"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                className="w-full bg-surface-300 border border-surface-border rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <div className="flex items-center space-x-2">
              {editingKeyId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3.5 min-h-[44px] bg-surface-300 hover:bg-surface-active text-neutral-300 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
              <button
                type="submit"
                disabled={!keyValue.trim()}
                className="flex-1 min-h-[44px] bg-brand-cyan hover:bg-brand-accent disabled:opacity-50 text-black font-semibold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5"
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

          {/* Configured Keys List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Configured Key Pool ({keys.length})
              </span>
              <span className="text-[10px] text-neutral-400">Stored locally in IndexedDB</span>
            </div>

            {keys.length === 0 ? (
              <div className="text-center p-6 border border-dashed border-surface-border rounded-lg text-neutral-400 text-xs">
                No keys configured. Add your OpenAI, Anthropic, or Gemini keys above.
              </div>
            ) : (
              <div className="space-y-2">
                {keys.map((k) => {
                  const cooldownSec = getCooldownRemaining(k.cooldownUntil);
                  const isCoolingDown = cooldownSec > 0;
                  const isBeingEdited = editingKeyId === k.id;

                  return (
                    <div
                      key={k.id}
                      className={`bg-surface-200 border p-3 rounded-lg flex items-center justify-between transition-all ${
                        isBeingEdited
                          ? "border-brand-cyan bg-brand-cyan/5 shadow-[0_0_12px_rgba(0,210,255,0.15)]"
                          : "border-surface-border"
                      }`}
                    >
                      <div className="space-y-1 flex-1 min-w-0 pr-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-white truncate">
                            {k.name}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-surface-300 text-brand-cyan rounded border border-surface-border">
                            {k.provider}
                          </span>
                          {k.modelName && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-surface-300 text-neutral-300 rounded border border-surface-border truncate max-w-[120px]">
                              {k.modelName}
                            </span>
                          )}
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
            className="min-h-[44px] px-6 bg-surface-300 hover:bg-surface-active text-white rounded-lg text-xs font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

