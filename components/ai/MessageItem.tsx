"use client";

import React, { useState } from "react";
import { Check, Copy, ArrowDownToLine, Code, FileText } from "lucide-react";
import { ChatMessage } from "../../stores/apiRotationStore";
import { useFileSystemStore } from "../../stores/fileSystemStore";
import { parseMessageSegments } from "../../lib/ai/agentParser";
import { ActionWidget } from "./ActionWidget";

interface MessageItemProps {
  message: ChatMessage;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { activeFilePath, files, updateFileContent } = useFileSystemStore();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [appliedIndex, setAppliedIndex] = useState<number | null>(null);

  const activeFile = activeFilePath ? files[activeFilePath] : null;

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleApplyToFile = (code: string, index: number) => {
    if (!activeFilePath) {
      alert("No open file to apply changes to. Please open a file first.");
      return;
    }

    updateFileContent(activeFilePath, code);
    setAppliedIndex(index);

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(25);
    }

    setTimeout(() => setAppliedIndex(null), 2500);
  };

  // Parses content into text segments, code blocks, and agent action widgets
  const renderMessageContent = (content: string) => {
    const segments = parseMessageSegments(content);

    return segments.map((seg, idx) => {
      if (seg.type === "action_file") {
        return (
          <ActionWidget
            key={`action-file-${idx}-${seg.path}`}
            type="file"
            path={seg.path}
            content={seg.content}
          />
        );
      }

      if (seg.type === "action_folder") {
        return (
          <ActionWidget
            key={`action-folder-${idx}-${seg.path}`}
            type="folder"
            path={seg.path}
          />
        );
      }

      if (seg.type === "code") {
        const lang = seg.language || "code";
        const code = seg.code;
        const currentBlock = idx;

        return (
          <div
            key={`code-${currentBlock}`}
            className="my-2.5 rounded-lg border border-surface-border bg-surface-300 overflow-hidden shadow-md"
          >
            {/* Code Header with Apply Button */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-surface-200 border-b border-surface-border select-none">
              <div className="flex items-center space-x-1.5">
                <Code className="w-3.5 h-3.5 text-brand-cyan" />
                <span className="text-[10px] font-mono font-semibold uppercase text-neutral-400">
                  {lang}
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                {/* Copy Button */}
                <button
                  type="button"
                  onClick={() => handleCopy(code, currentBlock)}
                  className="min-h-[32px] px-2 flex items-center space-x-1 text-[11px] text-neutral-400 hover:text-white rounded hover:bg-surface-active transition-colors"
                >
                  {copiedIndex === currentBlock ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                {/* Apply to active file button */}
                <button
                  type="button"
                  onClick={() => handleApplyToFile(code, currentBlock)}
                  className={`min-h-[32px] px-2.5 flex items-center space-x-1 text-[11px] font-medium rounded transition-all active:scale-95 ${
                    appliedIndex === currentBlock
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-brand-cyan/15 text-brand-cyan hover:bg-brand-cyan/25 border border-brand-cyan/30"
                  }`}
                  title={
                    activeFile
                      ? `Overwrite ${activeFile.name} with this code`
                      : "Open a file to apply"
                  }
                >
                  {appliedIndex === currentBlock ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Applied to {activeFile?.name || "file"}!</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                      <span>Apply to {activeFile ? activeFile.name : "file"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Body */}
            <pre className="p-3 text-[11px] font-mono text-neutral-200 overflow-x-auto leading-relaxed bg-[#0a0e14]">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Plain text segment
      if (seg.text.trim()) {
        return (
          <div
            key={`text-${idx}`}
            className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap"
          >
            {seg.text}
          </div>
        );
      }

      return null;
    });
  };

  const isUser = message.role === "user";

  return (
    <div className={`flex flex-col mb-4 ${isUser ? "items-end" : "items-start"}`}>
      {/* Context badge if user prompt sent with file context */}
      {message.contextFile && (
        <div className="flex items-center space-x-1 text-[10px] text-neutral-400 mb-1 px-2">
          <FileText className="w-3 h-3 text-brand-cyan" />
          <span>Context: {message.contextFile}</span>
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[92%] rounded-2xl p-3.5 shadow-sm ${
          isUser
            ? "bg-brand-indigo/30 border border-brand-indigo/40 text-white rounded-br-none"
            : "bg-surface-card border border-surface-border text-neutral-200 rounded-bl-none"
        }`}
      >
        {renderMessageContent(message.content)}
      </div>

      {/* Provider attribution */}
      {message.providerUsed && (
        <span className="text-[9px] text-neutral-400 font-mono mt-1 px-1">
          via {message.providerUsed.toUpperCase()}
          {message.keyNameUsed ? ` (${message.keyNameUsed})` : ""}
        </span>
      )}
    </div>
  );
};
