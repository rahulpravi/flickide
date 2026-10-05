"use client";

import React, { useMemo } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Bookmark, Check, ArrowRight } from "lucide-react";
import { useFileSystemStore } from "../../stores/fileSystemStore";
import { useUIStore } from "../../stores/uiStore";
import { analyzeFileContent } from "../../lib/utils/syntaxChecker";

export const ProblemsTab: React.FC = () => {
  const { activeFilePath, files } = useFileSystemStore();
  const { setActiveTab } = useUIStore();

  const activeFile = activeFilePath ? files[activeFilePath] : null;

  const analysis = useMemo(() => {
    if (!activeFile || !activeFile.content) {
      return { errors: [], warnings: [], todoCount: 0, fixmeCount: 0 };
    }
    return analyzeFileContent(activeFile.name, activeFile.content);
  }, [activeFile?.name, activeFile?.content]);

  const totalProblems = analysis.errors.length + analysis.warnings.length;

  return (
    <div className="flex flex-col h-full bg-surface-300 overflow-hidden">
      {/* Metric Counters Header */}
      <div className="p-3 bg-surface-200 border-b border-surface-border grid grid-cols-4 gap-2 text-center shrink-0">
        <div className="bg-surface-300 p-2 rounded-lg border border-surface-border">
          <div className="text-xs text-rose-400 font-bold">{analysis.errors.length}</div>
          <div className="text-[10px] text-neutral-400 uppercase tracking-tight">Errors</div>
        </div>

        <div className="bg-surface-300 p-2 rounded-lg border border-surface-border">
          <div className="text-xs text-amber-400 font-bold">{analysis.warnings.length}</div>
          <div className="text-[10px] text-neutral-400 uppercase tracking-tight">Warnings</div>
        </div>

        <div className="bg-surface-300 p-2 rounded-lg border border-surface-border">
          <div className="text-xs text-brand-cyan font-bold">{analysis.todoCount}</div>
          <div className="text-[10px] text-neutral-400 uppercase tracking-tight">TODOs</div>
        </div>

        <div className="bg-surface-300 p-2 rounded-lg border border-surface-border">
          <div className="text-xs text-purple-400 font-bold">{analysis.fixmeCount}</div>
          <div className="text-[10px] text-neutral-400 uppercase tracking-tight">FIXMEs</div>
        </div>
      </div>

      {/* Target File Label */}
      <div className="px-3 py-1.5 bg-surface-card border-b border-surface-border flex items-center justify-between text-xs text-neutral-400">
        <span>Inspecting: <strong className="text-white">{activeFile ? activeFile.name : "None"}</strong></span>
        <span>{totalProblems} total diagnostics</span>
      </div>

      {/* Diagnostic Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
        {!activeFile ? (
          <div className="text-center p-8 text-neutral-400 text-xs">
            Open a file in the editor to inspect diagnostics.
          </div>
        ) : totalProblems === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-neutral-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
            <span className="text-xs font-semibold text-white">No syntax errors found!</span>
            <span className="text-[11px] text-neutral-500 mt-0.5">
              Code passes syntax verification and bracket matching checks.
            </span>
          </div>
        ) : (
          <>
            {/* Errors */}
            {analysis.errors.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveTab("code")}
                className="bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-lg flex items-start space-x-2.5 cursor-pointer active:bg-rose-500/20"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-rose-200">
                      Line {item.line}
                    </span>
                    <span className="text-[10px] font-mono text-rose-400">
                      {item.source}
                    </span>
                  </div>
                  <p className="text-xs text-rose-300 mt-0.5 leading-snug break-words">
                    {item.message}
                  </p>
                </div>
              </div>
            ))}

            {/* Warnings and TODOs */}
            {analysis.warnings.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveTab("code")}
                className="bg-surface-card border border-surface-border p-2.5 rounded-lg flex items-start space-x-2.5 cursor-pointer active:bg-surface-active"
              >
                {item.type === "info" ? (
                  <Bookmark className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-200">
                      Line {item.line}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {item.source}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-0.5 leading-snug break-words">
                    {item.message}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
