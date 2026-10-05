"use client";

import React, { useState } from "react";
import { File, Folder, X } from "lucide-react";
import { useUIStore } from "../../stores/uiStore";
import { useFileSystemStore } from "../../stores/fileSystemStore";

export const NewItemModal: React.FC = () => {
  const { isNewItemModalOpen, newItemType, newItemParentPath, closeNewItemModal, setActiveTab } =
    useUIStore();
  const { createFile, createFolder } = useFileSystemStore();

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isNewItemModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError("Please provide a name");
      return;
    }

    if (/[\\/:*?"<>|]/.test(trimmed)) {
      setError("Name cannot contain special characters like / : * ? < > |");
      return;
    }

    try {
      if (newItemType === "file") {
        await createFile(trimmed, newItemParentPath);
        setActiveTab("code");
      } else {
        await createFolder(trimmed, newItemParentPath);
      }
      setName("");
      setError(null);
      closeNewItemModal();
    } catch (err: any) {
      setError(err?.message || "Failed to create item");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-100 border border-surface-border rounded-xl w-full max-w-sm p-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-4">
          <div className="flex items-center space-x-2">
            {newItemType === "file" ? (
              <File className="w-5 h-5 text-brand-cyan" />
            ) : (
              <Folder className="w-5 h-5 text-amber-400" />
            )}
            <h3 className="text-sm font-semibold text-white">
              Create New {newItemType === "file" ? "File" : "Folder"}
            </h3>
          </div>
          <button
            onClick={closeNewItemModal}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">
              Destination: <span className="font-mono text-neutral-200">{newItemParentPath}</span>
            </label>
            <input
              type="text"
              autoFocus
              placeholder={newItemType === "file" ? "e.g. script.js, styles.css" : "e.g. components, utils"}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              className="w-full bg-surface-200 border border-surface-border rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-brand-cyan"
            />
            {error && <p className="text-xs text-rose-400 mt-1.5">{error}</p>}
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={closeNewItemModal}
              className="flex-1 min-h-[44px] bg-surface-200 text-neutral-300 hover:bg-surface-active rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[44px] bg-brand-cyan hover:bg-brand-accent text-black font-semibold rounded-lg text-sm transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
