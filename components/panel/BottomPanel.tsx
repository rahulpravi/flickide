"use client";

import React, { useMemo } from "react";
import { TerminalSquare, AlertTriangle, Bug } from "lucide-react";
import { useUIStore, PanelSubTab } from "../../stores/uiStore";
import { useFileSystemStore } from "../../stores/fileSystemStore";
import { analyzeFileContent } from "../../lib/utils/syntaxChecker";
import { TerminalTab } from "./TerminalTab";
import { ProblemsTab } from "./ProblemsTab";
import { DebugTab } from "./DebugTab";

export const BottomPanel: React.FC = () => {
  const { panelSubTab, setPanelSubTab } = useUIStore();
  const { activeFilePath, files } = useFileSystemStore();

  const activeFile = activeFilePath ? files[activeFilePath] : null;

  const totalErrors = useMemo(() => {
    if (!activeFile || !activeFile.content) return 0;
    const res = analyzeFileContent(activeFile.name, activeFile.content);
    return res.errors.length;
  }, [activeFile?.name, activeFile?.content]);

  const subTabs = [
    { id: "terminal" as PanelSubTab, label: "Terminal", icon: TerminalSquare },
    {
      id: "problems" as PanelSubTab,
      label: "Problems",
      icon: AlertTriangle,
      badge: totalErrors > 0 ? totalErrors : undefined,
    },
    { id: "debug" as PanelSubTab, label: "Debug", icon: Bug },
  ];

  return (
    <div className="flex flex-col h-full bg-surface-300 overflow-hidden pb-14">
      {/* Sub-tab Navigation Bar */}
      <div className="h-10 bg-surface-200 border-b border-surface-border flex items-center px-2 space-x-1 shrink-0 select-none">
        {subTabs.map((t) => {
          const Icon = t.icon;
          const isActive = panelSubTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => setPanelSubTab(t.id)}
              className={`min-h-[36px] px-3 flex items-center space-x-1.5 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? "bg-surface-300 text-brand-cyan shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-surface-active"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
              {t.badge !== undefined && (
                <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white font-bold rounded-full text-[9px]">
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-tab Content View */}
      <div className="flex-1 overflow-hidden">
        {panelSubTab === "terminal" && <TerminalTab />}
        {panelSubTab === "problems" && <ProblemsTab />}
        {panelSubTab === "debug" && <DebugTab />}
      </div>
    </div>
  );
};
