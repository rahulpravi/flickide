"use client";

import React from "react";
import { Play, Key, Sparkles, Folder, Save, Check } from "lucide-react";
import { useFileSystemStore } from "../../stores/fileSystemStore";
import { useUIStore } from "../../stores/uiStore";
import { useAPIRotationStore } from "../../stores/apiRotationStore";
import { Logo } from "../ui/Logo";

export const Header: React.FC = () => {
  const { activeFilePath, files, isSaving } = useFileSystemStore();
  const { setActiveTab, setPanelSubTab, setKeyManagerOpen } = useUIStore();
  const { keys } = useAPIRotationStore();

  const activeFile = activeFilePath ? files[activeFilePath] : null;
  const activeKeysCount = keys.filter((k) => k.status === "active").length;

  const handleRun = () => {
    setActiveTab("panel");
    setPanelSubTab("debug");
  };

  return (
    <header className="h-12 bg-surface-200 border-b border-surface-border flex items-center justify-between px-3 z-30 select-none">
      {/* Brand & Active File */}
      <div className="flex items-center space-x-2 truncate">
        <div className="flex items-center space-x-2 font-bold tracking-tight text-white text-sm">
          <Logo size={24} />
          <span className="bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
            FlickIDE
          </span>
        </div>

        <span className="text-surface-border text-xs">/</span>

        <div className="flex items-center text-xs text-neutral-300 bg-surface-card px-2 py-0.5 rounded border border-surface-border truncate max-w-[140px]">
          <span className="truncate">{activeFile ? activeFile.name : "No file open"}</span>
          {isSaving ? (
            <span className="ml-1.5 text-[10px] text-amber-400 flex items-center">
              <Save className="w-2.5 h-2.5 animate-pulse" />
            </span>
          ) : (
            <span className="ml-1.5 text-[10px] text-emerald-400">
              <Check className="w-2.5 h-2.5" />
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1.5">
        {/* Run Button */}
        <button
          id="btn-header-run"
          onClick={handleRun}
          title="Run in Debug Sandbox"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 active:bg-emerald-500/20 rounded-md transition-colors"
        >
          <Play className="w-4 h-4 fill-emerald-400" />
        </button>

        {/* API Key Manager Button */}
        <button
          id="btn-header-keys"
          onClick={() => setKeyManagerOpen(true)}
          title="Manage AI API Keys & Rotation"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center relative text-neutral-300 hover:text-white hover:bg-surface-active rounded-md transition-colors"
        >
          <Key className="w-4 h-4" />
          {activeKeysCount > 0 ? (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_6px_#00d2ff]" />
          ) : (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>
      </div>
    </header>
  );
};
