"use client";

import React from "react";
import { useFileSystemStore } from "../../stores/fileSystemStore";
import { formatBytes } from "../../lib/utils/formatters";

export const StatusBar: React.FC = () => {
  const { activeFilePath, files, cursorPosition, isSaving } = useFileSystemStore();

  const activeFile = activeFilePath ? files[activeFilePath] : null;
  const lineCount = activeFile?.content ? activeFile.content.split("\n").length : 0;
  const fileSizeStr = activeFile ? formatBytes(activeFile.size) : "0 B";

  return (
    <footer className="h-6 bg-surface-200 border-t border-surface-border flex items-center justify-between px-3 text-[11px] text-neutral-400 select-none z-20">
      {/* File info */}
      <div className="flex items-center space-x-3 truncate">
        <span className="truncate max-w-[130px] font-mono text-neutral-300">
          {activeFile ? activeFile.name : "Ready"}
        </span>
        {activeFile && (
          <span className="text-[10px] text-neutral-400 font-mono">
            {fileSizeStr}
          </span>
        )}
      </div>

      {/* Line & Cursor tracking */}
      <div className="flex items-center space-x-3 shrink-0 font-mono text-[10px]">
        {activeFile && (
          <span>
            {lineCount} {lineCount === 1 ? "line" : "lines"}
          </span>
        )}
        <span className="text-neutral-300">
          Ln {cursorPosition.line}, Col {cursorPosition.col}
        </span>
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isSaving ? "bg-amber-400 animate-ping" : "bg-emerald-400"
          }`}
          title={isSaving ? "Saving changes..." : "All changes saved to IndexedDB"}
        />
      </div>
    </footer>
  );
};
