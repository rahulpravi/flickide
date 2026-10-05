"use client";

import React, { useRef } from "react";
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  File,
  Plus,
  FolderPlus,
  Upload,
  Trash2,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useFileSystemStore } from "../../stores/fileSystemStore";
import { useUIStore } from "../../stores/uiStore";
import { formatBytes } from "../../lib/utils/formatters";
import { FileItem } from "../../lib/db/indexedDB";

export const FileExplorer: React.FC = () => {
  const {
    files,
    activeFilePath,
    expandedFolders,
    setActiveFile,
    toggleFolder,
    deleteItem,
    uploadFiles,
    getFolderSize,
  } = useFileSystemStore();

  const { openNewItemModal, setActiveTab } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
        return <FileCode className="w-4 h-4 text-amber-400 shrink-0" />;
      case "json":
        return <FileJson className="w-4 h-4 text-emerald-400 shrink-0" />;
      case "html":
        return <FileCode className="w-4 h-4 text-orange-400 shrink-0" />;
      case "css":
        return <FileCode className="w-4 h-4 text-sky-400 shrink-0" />;
      case "md":
        return <FileText className="w-4 h-4 text-blue-400 shrink-0" />;
      default:
        return <File className="w-4 h-4 text-neutral-400 shrink-0" />;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files, "/");
      e.target.value = "";
    }
  };

  const handleDelete = (e: React.MouseEvent, path: string, name: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteItem(path);
    }
  };

  // Build tree from files dictionary
  const renderTree = (parentPath: string = "/", depth: number = 0) => {
    const items = Object.values(files).filter(
      (item) => item.parentPath === parentPath
    );

    // Sort folders first, then alphabetically
    items.sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    if (items.length === 0 && parentPath === "/") {
      return (
        <div className="p-8 text-center text-neutral-400 text-xs">
          No files in project. Tap + to create or upload a file.
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        {items.map((item) => {
          const isFolder = item.type === "folder";
          const isExpanded = !!expandedFolders[item.path];
          const isActive = activeFilePath === item.path;

          return (
            <div key={item.path} className="flex flex-col">
              <div
                onClick={() => {
                  if (isFolder) {
                    toggleFolder(item.path);
                  } else {
                    setActiveFile(item.path);
                    setActiveTab("code");
                  }
                }}
                className={`min-h-[46px] flex items-center justify-between px-3 cursor-pointer select-none transition-colors border-b border-surface-border/40 active:bg-surface-active/80 ${
                  isActive
                    ? "bg-surface-card border-l-2 border-l-brand-cyan text-white"
                    : "text-neutral-300 hover:bg-surface-card/60"
                }`}
                style={{ paddingLeft: `${Math.max(12, depth * 18 + 12)}px` }}
              >
                {/* Left side: Expand icon + Item Icon + Name */}
                <div className="flex items-center space-x-2.5 truncate flex-1 min-w-0 mr-2">
                  {isFolder ? (
                    <span className="text-neutral-400 shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                    </span>
                  ) : (
                    <span className="w-3.5 shrink-0" />
                  )}

                  {isFolder ? (
                    isExpanded ? (
                      <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                    )
                  ) : (
                    getFileIcon(item.name)
                  )}

                  <span className="text-xs truncate font-medium">
                    {item.name}
                  </span>
                </div>

                {/* Right side: Size & Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {isFolder
                      ? formatBytes(getFolderSize(item.path))
                      : formatBytes(item.size)}
                  </span>

                  {isFolder && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openNewItemModal("file", item.path);
                      }}
                      title="New file in folder"
                      className="min-h-[40px] min-w-[36px] flex items-center justify-center text-neutral-400 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={(e) => handleDelete(e, item.path, item.name)}
                    title="Delete item"
                    className="min-h-[40px] min-w-[36px] flex items-center justify-center text-neutral-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Render child items if expanded */}
              {isFolder && isExpanded && renderTree(item.path, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-surface-300 overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-12 bg-surface-200 border-b border-surface-border flex items-center justify-between px-3 shrink-0">
        <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
          Explorer
        </span>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => openNewItemModal("file", "/")}
            title="New File in Root"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-300 hover:text-white hover:bg-surface-active rounded-md transition-colors"
          >
            <Plus className="w-4 h-4 text-brand-cyan" />
          </button>

          <button
            onClick={() => openNewItemModal("folder", "/")}
            title="New Folder in Root"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-300 hover:text-white hover:bg-surface-active rounded-md transition-colors"
          >
            <FolderPlus className="w-4 h-4 text-amber-400" />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload Files from Device"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-300 hover:text-white hover:bg-surface-active rounded-md transition-colors"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {renderTree("/")}
      </div>
    </div>
  );
};
