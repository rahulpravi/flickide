"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, AlertCircle } from "lucide-react";
import { Header } from "../components/layout/Header";
import { BottomNav } from "../components/layout/BottomNav";
import { FileExplorer } from "../components/files/FileExplorer";
import { CodeEditor } from "../components/editor/CodeEditor";
import { AIChatPanel } from "../components/ai/AIChatPanel";
import { PluginStore } from "../components/plugins/PluginStore";
import { BottomPanel } from "../components/panel/BottomPanel";
import { NewItemModal } from "../components/files/NewItemModal";
import { KeyManagerModal } from "../components/ai/KeyManagerModal";
import { useFileSystemStore } from "../stores/fileSystemStore";
import { useAPIRotationStore } from "../stores/apiRotationStore";
import { usePluginStore } from "../stores/pluginStore";
import { useUIStore } from "../stores/uiStore";
import { handleOpenRouterCallback } from "../lib/ai/openrouterOAuth";

export default function FlickIDEApp() {
  const { activeTab, setActiveTab } = useUIStore();
  const { initFileSystem } = useFileSystemStore();
  const { initKeys, addKey, setActiveProvider, setSelectedKeyId } = useAPIRotationStore();
  const { initPlugins } = usePluginStore();

  const [oauthToast, setOAuthToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    initFileSystem();
    initKeys();
    initPlugins();

    // Check if user was redirected back from OpenRouter Google OAuth
    const checkOAuth = async () => {
      const res = await handleOpenRouterCallback();
      if (res && res.success && res.apiKey) {
        await addKey(
          "openrouter",
          res.apiKey,
          "OpenRouter (Google Account)",
          undefined,
          "deepseek/deepseek-chat"
        );
        setActiveProvider("openrouter");
        setSelectedKeyId("auto");
        setActiveTab("ai");
        setOAuthToast({
          type: "success",
          message: "🎉 Connected to OpenRouter via Google! DeepSeek, Gemini, and Claude are ready.",
        });
        setTimeout(() => setOAuthToast(null), 5000);
      } else if (res && !res.success) {
        setOAuthToast({
          type: "error",
          message: `⚠️ Google OAuth error: ${res.error || "Failed to connect"}`,
        });
        setTimeout(() => setOAuthToast(null), 5000);
      }
    };

    checkOAuth();
  }, [initFileSystem, initKeys, initPlugins, addKey, setActiveProvider, setSelectedKeyId, setActiveTab]);

  return (
    <div className="flex flex-col h-full w-full max-w-lg mx-auto bg-surface-300 relative overflow-hidden shadow-2xl safe-top">
      {/* OAuth Toast Notification */}
      {oauthToast && (
        <div
          className={`absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center space-x-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2 border ${
            oauthToast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
              : "bg-rose-950/90 border-rose-500/50 text-rose-200"
          }`}
        >
          {oauthToast.type === "success" ? (
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{oauthToast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <Header />

      {/* Main Workspace View */}
      <main className="flex-1 relative overflow-hidden">
        {activeTab === "files" && <FileExplorer />}
        {activeTab === "code" && <CodeEditor />}
        {activeTab === "ai" && <AIChatPanel />}
        {activeTab === "plugins" && <PluginStore />}
        {activeTab === "panel" && <BottomPanel />}
      </main>

      {/* Fixed Bottom Navigation (5 tabs) */}
      <BottomNav />

      {/* Overlay Modals */}
      <NewItemModal />
      <KeyManagerModal />
    </div>
  );
}
