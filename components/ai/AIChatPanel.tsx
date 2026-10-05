"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Key, FileText, Trash2, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { useAPIRotationStore, AIProvider, DEFAULT_MODELS } from "../../stores/apiRotationStore";
import { useFileSystemStore } from "../../stores/fileSystemStore";
import { useUIStore } from "../../stores/uiStore";
import { MessageItem } from "./MessageItem";

export const AIChatPanel: React.FC = () => {
  const {
    messages,
    activeProvider,
    setActiveProvider,
    selectedKeyId,
    setSelectedKeyId,
    executeWithFailover,
    addMessage,
    clearMessages,
    isStreaming,
    keys,
  } = useAPIRotationStore();

  const { activeFilePath, files } = useFileSystemStore();
  const { setKeyManagerOpen } = useUIStore();

  const [inputPrompt, setInputPrompt] = useState("");
  const [includeFileContext, setIncludeFileContext] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeFile = activeFilePath ? files[activeFilePath] : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputPrompt).trim();
    if (!textToSend || isStreaming) return;

    setErrorMessage(null);

    const contextPayload =
      includeFileContext && activeFile
        ? { filename: activeFile.name, content: activeFile.content || "" }
        : undefined;

    // Add user message to UI
    addMessage({
      role: "user",
      content: textToSend,
      contextFile: contextPayload?.filename,
    });

    if (!customPrompt) {
      setInputPrompt("");
    }

    try {
      const reply = await executeWithFailover(textToSend, contextPayload);
      const selectedKey = selectedKeyId !== "auto" ? keys.find((k) => k.id === selectedKeyId) : null;
      const providerUsed = selectedKey ? selectedKey.provider : activeProvider;
      addMessage({
        role: "assistant",
        content: reply,
        providerUsed,
        keyNameUsed: selectedKey?.name,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to generate AI response.");
    }
  };

  const quickPrompts = [
    "Explain this file in detail",
    "Identify any bugs or performance issues",
    "Refactor and optimize this code",
    "Add comments and documentation",
  ];

  const selectedKeyObj = selectedKeyId !== "auto" ? keys.find((k) => k.id === selectedKeyId) : null;
  const providerKeys = keys.filter((k) => k.provider === activeProvider);
  const activeKeys = keys.filter((k) => k.status === "active");

  return (
    <div className="flex flex-col h-full bg-surface-300 overflow-hidden">
      {/* Top AI Header */}
      <div className="bg-surface-200 border-b border-surface-border p-2.5 px-3 shrink-0 flex flex-col gap-2 select-none">
        <div className="flex items-center justify-between gap-2">
          {/* Manual Model / Key Dropdown Selector */}
          <div className="flex items-center space-x-1.5 flex-1 min-w-0">
            <Sparkles className="w-4 h-4 text-brand-cyan shrink-0" />
            <div className="relative flex-1 min-w-0">
              <select
                id="select-ai-model"
                value={selectedKeyId}
                onChange={(e) => setSelectedKeyId(e.target.value)}
                className="w-full bg-surface-300 text-xs font-semibold text-white border border-surface-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-cyan truncate pr-7 appearance-none cursor-pointer"
              >
                <option value="auto">Auto (Failover Rotation)</option>
                {keys.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name}: {k.modelName || DEFAULT_MODELS[k.provider]}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Right Actions: Key Manager & Clear */}
          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={() => setKeyManagerOpen(true)}
              title="Manage Provider Keys"
              className="min-h-[36px] px-2 flex items-center space-x-1 text-xs text-neutral-300 hover:text-white hover:bg-surface-active rounded-md border border-surface-border transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-brand-cyan" />
              <span className="text-[10px] font-mono">
                ({activeKeys.length}/{keys.length})
              </span>
            </button>

            <button
              onClick={clearMessages}
              title="Clear Chat"
              className="min-h-[36px] min-w-[36px] flex items-center justify-center text-neutral-400 hover:text-rose-400 hover:bg-surface-active rounded-md border border-surface-border transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Status / Mode Bar */}
        {selectedKeyId === "auto" ? (
          <div className="flex items-center justify-between text-[11px] bg-surface-300/60 px-2 py-1 rounded-md border border-surface-border/60">
            <div className="flex items-center space-x-1.5 text-neutral-400 text-[10px]">
              <span className="text-brand-cyan font-mono font-medium">Failover Pool:</span>
              <select
                value={activeProvider}
                onChange={(e) => setActiveProvider(e.target.value as AIProvider)}
                className="bg-surface-300 text-[10px] font-semibold text-white border border-surface-border rounded px-1.5 py-0.5 focus:outline-none focus:border-brand-cyan capitalize cursor-pointer"
              >
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic Claude</option>
                <option value="custom">Custom Provider</option>
              </select>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">
              {providerKeys.filter((k) => k.status === "active").length}/{providerKeys.length} active
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[11px] bg-surface-300/60 px-2 py-1 rounded-md border border-surface-border/60">
            <div className="flex items-center space-x-1.5 truncate text-[10px] text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan shrink-0 animate-pulse" />
              <span className="text-neutral-400">Direct Route:</span>
              <span className="uppercase text-[9px] font-mono px-1 py-0.2 bg-brand-cyan/15 text-brand-cyan rounded border border-brand-cyan/30">
                {selectedKeyObj?.provider}
              </span>
              <span className="text-neutral-200 truncate font-mono text-[10px]">
                {selectedKeyObj?.modelName || (selectedKeyObj && DEFAULT_MODELS[selectedKeyObj.provider])}
              </span>
            </div>
            <span className="text-[10px] text-amber-400/90 font-mono shrink-0 ml-1">
              Failover bypassed
            </span>
          </div>
        )}
      </div>

      {/* Active File Context Bar */}
      {activeFile && (
        <div className="bg-surface-card px-3 py-1.5 border-b border-surface-border flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 truncate text-neutral-300">
            <FileText className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
            <span className="truncate text-[11px]">
              Context: <strong className="text-white">{activeFile.name}</strong>
            </span>
          </div>

          <label className="flex items-center space-x-1.5 cursor-pointer text-[10px] text-neutral-400 shrink-0">
            <input
              type="checkbox"
              checked={includeFileContext}
              onChange={(e) => setIncludeFileContext(e.target.checked)}
              className="accent-brand-cyan rounded w-3.5 h-3.5"
            />
            <span>Include file</span>
          </label>
        </div>
      )}

      {/* Error / Alert notice */}
      {errorMessage && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 p-2.5 px-3 flex items-start space-x-2 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <div className="flex-1">
            <p className="font-medium">{errorMessage}</p>
            <button
              onClick={() => setKeyManagerOpen(true)}
              className="underline text-[11px] text-brand-cyan mt-1 block"
            >
              Open Key Manager to check keys or add backup
            </button>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 no-scrollbar space-y-3">
        {messages.map((m) => (
          <MessageItem key={m.id} message={m} />
        ))}

        {isStreaming && (
          <div className="flex items-center space-x-2 text-neutral-400 text-xs py-2 px-3 bg-surface-card rounded-lg border border-surface-border w-max animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-cyan" />
            <span>Generating response & code suggestions...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="px-2 py-1.5 bg-surface-200 border-t border-surface-border flex items-center overflow-x-auto no-scrollbar space-x-1.5 shrink-0 select-none">
        {quickPrompts.map((qp) => (
          <button
            key={qp}
            type="button"
            onClick={() => handleSend(qp)}
            className="min-h-[34px] px-2.5 py-1 text-[11px] whitespace-nowrap bg-surface-300 hover:bg-surface-active text-neutral-300 rounded-full border border-surface-border transition-colors touch-manipulation"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Bottom Input Field */}
      <div className="p-2.5 bg-surface-200 border-t border-surface-border shrink-0 pb-16">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder={
              activeFile
                ? `Ask about ${activeFile.name}...`
                : "Ask AI coding assistant..."
            }
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isStreaming}
            className="flex-1 min-h-[44px] bg-surface-300 border border-surface-border rounded-xl px-3.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-cyan disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isStreaming}
            className="min-h-[44px] min-w-[44px] bg-brand-cyan hover:bg-brand-accent disabled:opacity-40 text-black font-semibold rounded-xl flex items-center justify-center transition-colors"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
