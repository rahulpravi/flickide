"use client";

import React, { useEffect } from "react";
import { Header } from "../components/layout/Header";
import { BottomNav } from "../components/layout/BottomNav";
import { FileExplorer } from "../components/files/FileExplorer";
import { CodeEditor } from "../components/editor/CodeEditor";
import { AIChatPanel } from "../components/ai/AIChatPanel";
import { BottomPanel } from "../components/panel/BottomPanel";
import { NewItemModal } from "../components/files/NewItemModal";
import { KeyManagerModal } from "../components/ai/KeyManagerModal";
import { useFileSystemStore } from "../stores/fileSystemStore";
import { useAPIRotationStore } from "../stores/apiRotationStore";
import { useUIStore } from "../stores/uiStore";

export default function FlickIDEApp() {
  const { activeTab } = useUIStore();
  const { initFileSystem, isInitialized: isFsInit } = useFileSystemStore();
  const { initKeys, isInitialized: isKeysInit } = useAPIRotationStore();

  useEffect(() => {
    initFileSystem();
    initKeys();
  }, [initFileSystem, initKeys]);

  return (
    <div className="flex flex-col h-full w-full max-w-lg mx-auto bg-surface-300 relative overflow-hidden shadow-2xl safe-top">
      {/* Top Header */}
      <Header />

      {/* Main Workspace View */}
      <main className="flex-1 relative overflow-hidden">
        {activeTab === "files" && <FileExplorer />}
        {activeTab === "code" && <CodeEditor />}
        {activeTab === "ai" && <AIChatPanel />}
        {activeTab === "panel" && <BottomPanel />}
      </main>

      {/* Fixed Bottom Navigation (4 tabs) */}
      <BottomNav />

      {/* Overlay Modals */}
      <NewItemModal />
      <KeyManagerModal />
    </div>
  );
}
