"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, lineNumbers, highlightActiveLine, highlightActiveLineGutter, keymap } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { oneDark } from "@codemirror/theme-one-dark";
import { X, FileCode } from "lucide-react";
import { useFileSystemStore } from "../../stores/fileSystemStore";
import { QuickKeyRow } from "./QuickKeyRow";
import { StatusBar } from "../layout/StatusBar";

export const CodeEditor: React.FC = () => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const {
    files,
    activeFilePath,
    openFilePaths,
    setActiveFile,
    closeFile,
    updateFileContent,
    setCursorPosition,
  } = useFileSystemStore();

  const activeFile = activeFilePath ? files[activeFilePath] : null;

  // Debounced auto-save handler
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleDocChange = useCallback(
    (newContent: string) => {
      if (!activeFilePath) return;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        updateFileContent(activeFilePath, newContent);
      }, 500); // 500ms debounce
    },
    [activeFilePath, updateFileContent]
  );

  // Determine language extension based on file name
  const getLanguageExtension = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
        return javascript({ jsx: true, typescript: ext.includes("ts") });
      case "json":
        return json();
      case "html":
        return html();
      case "css":
        return css();
      default:
        return javascript();
    }
  };

  // Initialize or re-create editor when active file changes
  useEffect(() => {
    if (!editorContainerRef.current || !activeFile) {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
      return;
    }

    // Clean up existing view
    if (viewRef.current) {
      viewRef.current.destroy();
    }

    const state = EditorState.create({
      doc: activeFile.content || "",
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        getLanguageExtension(activeFile.name),
        oneDark,
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "13px",
            fontFamily: "var(--font-mono, 'Fira Code', 'Courier New', monospace)",
            backgroundColor: "#090d13",
          },
          ".cm-scroller": {
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
          },
          ".cm-content": {
            paddingBottom: "120px", // clearance for mobile keyboards and quick keys
          },
          ".cm-gutters": {
            backgroundColor: "#0d1117",
            color: "#6e7681",
            borderRight: "1px solid #21262d",
          },
          ".cm-activeLine": {
            backgroundColor: "#161b2255",
          },
        }),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            handleDocChange(update.state.doc.toString());
          }

          if (update.selectionSet) {
            const pos = update.state.selection.main.head;
            const line = update.state.doc.lineAt(pos);
            setCursorPosition(line.number, pos - line.from + 1);
          }
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorContainerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [activeFilePath, activeFile?.name]);

  // Listen to QuickKeyRow symbol insertions
  useEffect(() => {
    const handleInsertKey = (e: CustomEvent<{ symbol: string }>) => {
      const view = viewRef.current;
      if (!view) return;

      const symbol = e.detail.symbol;
      const { from, to } = view.state.selection.main;

      view.dispatch({
        changes: { from, to, insert: symbol },
        selection: { anchor: from + symbol.length },
      });

      // Keep focus on editor view
      view.focus();
    };

    window.addEventListener("flickide:insert-key" as any, handleInsertKey);
    return () => {
      window.removeEventListener("flickide:insert-key" as any, handleInsertKey);
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-surface-300 overflow-hidden">
      {/* Tab bar for open files */}
      <div className="h-10 bg-surface-200 border-b border-surface-border flex items-center overflow-x-auto no-scrollbar shrink-0 px-1">
        {openFilePaths.map((path) => {
          const file = files[path];
          if (!file) return null;
          const isActive = activeFilePath === path;

          return (
            <div
              key={path}
              onClick={() => setActiveFile(path)}
              className={`min-h-[36px] flex items-center space-x-1.5 px-3 border-r border-surface-border cursor-pointer select-none text-xs transition-colors shrink-0 ${
                isActive
                  ? "bg-surface-300 text-white font-medium border-t-2 border-t-brand-cyan"
                  : "text-neutral-400 hover:text-neutral-200 bg-surface-200"
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-brand-cyan" />
              <span className="truncate max-w-[120px]">{file.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeFile(path);
                }}
                className="w-4 h-4 flex items-center justify-center text-neutral-500 hover:text-white rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Editor Body */}
      <div className="flex-1 relative overflow-hidden">
        {activeFile ? (
          <div ref={editorContainerRef} className="absolute inset-0 w-full h-full" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400 p-6 text-center">
            <FileCode className="w-10 h-10 text-neutral-500 mb-2 opacity-60" />
            <p className="text-sm font-medium">No open file</p>
            <p className="text-xs text-neutral-500 mt-1">
              Select or create a file in the Files tab to start editing.
            </p>
          </div>
        )}
      </div>

      {/* Quick-Insert Key Row (Fixed above keyboard/status bar) */}
      <QuickKeyRow />

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
};
