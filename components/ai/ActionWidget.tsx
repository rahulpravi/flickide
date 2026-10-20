"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  FolderPlus,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  FileCode,
  FileText,
  FileJson,
  File,
  Folder,
} from "lucide-react";
import { useFileSystemStore } from "../../stores/fileSystemStore";
import { useUIStore } from "../../stores/uiStore";
import { formatBytes, calculateStringBytes } from "../../lib/utils/formatters";

interface FileActionWidgetProps {
  type: "file";
  path: string;
  content: string;
}

interface FolderActionWidgetProps {
  type: "folder";
  path: string;
}

export type ActionWidgetProps = FileActionWidgetProps | FolderActionWidgetProps;

export const ActionWidget: React.FC<ActionWidgetProps> = (props) => {
  const { setActiveFile } = useFileSystemStore();
  const { setActiveTab } = useUIStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const cleanPath = props.path.replace(/^\/+/, "");
  const pathParts = cleanPath.split("/");
  const itemName = pathParts.pop() || cleanPath;
  const parentDir = pathParts.length > 0 ? pathParts.join("/") : "";
  const fullNormalizedPath = `/${cleanPath}`;

  if (props.type === "folder") {
    const handleExploreFolder = () => {
      setActiveTab("files");
    };

    return (
      <div className="my-2.5 rounded-xl border border-amber-500/30 bg-[#16140e]/90 overflow-hidden shadow-md transition-all hover:border-amber-500/50">
        <div className="flex items-center justify-between p-2.5 sm:p-3 bg-amber-500/10">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <FolderPlus className="w-4 h-4 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 flex-wrap">
                <span className="text-xs font-semibold text-white tracking-wide truncate">
                  📁 Created folder: <span className="text-amber-300 font-mono">{itemName}</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-medium uppercase">
                  Folder
                </span>
              </div>
              {parentDir && (
                <p className="text-[10px] text-neutral-400 font-mono truncate">
                  in /{parentDir}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleExploreFolder}
            className="min-h-[32px] px-2.5 py-1 text-[11px] font-medium bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg flex items-center space-x-1 transition-all active:scale-95 shrink-0 ml-2"
            title="View in File Explorer"
          >
            <Folder className="w-3 h-3" />
            <span>View</span>
          </button>
        </div>
      </div>
    );
  }

  // File action widget
  const ext = itemName.split(".").pop()?.toLowerCase() || "";
  const byteSize = calculateStringBytes(props.content);
  const lineCount = props.content ? props.content.split("\n").length : 0;

  const getFileIcon = () => {
    switch (ext) {
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
        return <FileCode className="w-3.5 h-3.5 text-amber-400" />;
      case "json":
        return <FileJson className="w-3.5 h-3.5 text-emerald-400" />;
      case "html":
        return <FileCode className="w-3.5 h-3.5 text-orange-400" />;
      case "css":
        return <FileCode className="w-3.5 h-3.5 text-sky-400" />;
      case "md":
        return <FileText className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <File className="w-3.5 h-3.5 text-neutral-300" />;
    }
  };

  const handleOpenInEditor = () => {
    setActiveFile(fullNormalizedPath);
    setActiveTab("code");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(props.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2.5 rounded-xl border border-emerald-500/30 bg-[#0c1615]/95 overflow-hidden shadow-lg transition-all hover:border-emerald-500/50">
      {/* Widget Header */}
      <div className="flex items-center justify-between p-2.5 sm:p-3 bg-emerald-950/30 border-b border-emerald-500/20">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 flex-wrap">
              <span className="flex items-center space-x-1 text-xs font-semibold text-white tracking-wide truncate">
                <span>✅ Created file:</span>
                <span className="text-emerald-300 font-mono font-bold flex items-center space-x-1">
                  {getFileIcon()}
                  <span>{itemName}</span>
                </span>
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-medium">
                Active
              </span>
            </div>

            <p className="text-[10px] text-neutral-400 font-mono truncate">
              {fullNormalizedPath}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1.5 shrink-0 ml-2">
          <button
            type="button"
            onClick={handleOpenInEditor}
            className="min-h-[32px] px-2.5 py-1 text-[11px] font-medium bg-brand-cyan/15 hover:bg-brand-cyan/25 text-brand-cyan border border-brand-cyan/30 rounded-lg flex items-center space-x-1 transition-all active:scale-95"
            title="Open in Editor"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Open</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="min-h-[32px] px-2 py-1 text-[11px] text-neutral-400 hover:text-white rounded-lg hover:bg-surface-active transition-all flex items-center space-x-1"
            title={isExpanded ? "Collapse preview" : "Preview file content"}
          >
            <span className="text-[10px] hidden sm:inline">
              {isExpanded ? "Hide" : "Preview"}
            </span>
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Code Preview */}
      {isExpanded && (
        <div className="border-t border-surface-border/60 bg-[#0a0e14]">
          <div className="flex items-center justify-between px-3 py-1.5 bg-surface-200/90 border-b border-surface-border text-[10px] text-neutral-400 font-mono select-none">
            <span>
              {lineCount} {lineCount === 1 ? "line" : "lines"} • {formatBytes(byteSize)}
            </span>

            <button
              type="button"
              onClick={handleCopy}
              className="px-2 py-0.5 rounded text-neutral-300 hover:text-white hover:bg-surface-active flex items-center space-x-1 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-3 text-[11px] font-mono text-neutral-200 overflow-x-auto leading-relaxed max-h-64 no-scrollbar">
            <code>{props.content}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
