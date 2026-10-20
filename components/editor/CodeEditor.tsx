"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { EditorState, Compartment } from "@codemirror/state";
import { EditorView, lineNumbers, highlightActiveLine, highlightActiveLineGutter, keymap } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { bracketMatching } from "@codemirror/language";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { X, FileCode, Wand2, Check, Sparkles, WrapText } from "lucide-react";
import { useFileSystemStore } from "../../stores/fileSystemStore";
import { usePluginStore } from "../../stores/pluginStore";
import { getEditorTheme } from "../../lib/editor/themes";
import { createIntelliSenseExtension } from "../../lib/editor/completions";
import { createLinterExtension } from "../../lib/editor/linter";
import { formatCode } from "../../lib/editor/formatter";
import { QuickKeyRow } from "./QuickKeyRow";
import { StatusBar } from "../layout/StatusBar";

export const CodeEditor: React.FC = () => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [isFormatting, setIsFormatting] = useState(false);
  const [formatToast, setFormatToast] = useState<string | null>(null);

  // Line wrapping state: default to false (horizontal scroll enabled, professional mobile IDE standard)
  const [isLineWrapping, setIsLineWrapping] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("flickide:word-wrap");
      return saved === "true"; // default false: horizontal scrolling
    }
    return false;
  });

  const lineWrappingCompartment = useRef(new Compartment()).current;

  const {
    files,
    activeFilePath,
    openFilePaths,
    setActiveFile,
    closeFile,
    updateFileContent,
    setCursorPosition,
  } = useFileSystemStore();

  const {
    activeThemeId,
    plugins,
    isPluginEnabled,
  } = usePluginStore();

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
      case "htm":
        return html({ autoCloseTags: isPluginEnabled("snippets-emmet") });
      case "css":
      case "scss":
        return css();
      default:
        return javascript();
    }
  };

  // Format active document using Prettier
  const handleFormatDocument = useCallback(async () => {
    if (!viewRef.current || !activeFile) return;

    const currentDoc = viewRef.current.state.doc.toString();
    setIsFormatting(true);

    const result = await formatCode(activeFile.name, currentDoc);
    setIsFormatting(false);

    if (result.success && result.formatted && result.formatted !== currentDoc) {
      const scrollPos = viewRef.current.scrollDOM.scrollTop;
      viewRef.current.dispatch({
        changes: { from: 0, to: viewRef.current.state.doc.length, insert: result.formatted },
      });
      viewRef.current.scrollDOM.scrollTop = scrollPos;
      updateFileContent(activeFilePath!, result.formatted);
      setFormatToast("Prettier: Code Formatted ✨");
      setTimeout(() => setFormatToast(null), 2500);
    } else if (result.success) {
      setFormatToast("Already cleanly formatted ✓");
      setTimeout(() => setFormatToast(null), 2000);
    } else {
      setFormatToast(result.error ? `Error: ${result.error.slice(0, 45)}...` : "Formatting failed");
      setTimeout(() => setFormatToast(null), 3000);
    }
  }, [activeFile, activeFilePath, updateFileContent]);

  // Toggle line wrapping handler with visual toast
  const toggleLineWrapping = useCallback(() => {
    setIsLineWrapping((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("flickide:word-wrap", String(next));
      }
      setFormatToast(
        next
          ? "Word Wrap: ON (Wrapped to Screen)"
          : "Word Wrap: OFF (Horizontal Scroll ↔)"
      );
      setTimeout(() => setFormatToast(null), 2200);
      return next;
    });
  }, []);

  // Dynamically reconfigure CodeMirror line wrapping without re-creating editor
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: lineWrappingCompartment.reconfigure(
          isLineWrapping ? EditorView.lineWrapping : []
        ),
      });
    }
  }, [isLineWrapping, lineWrappingCompartment]);

  // Plugin flags
  const reactSnippetsEnabled = isPluginEnabled("snippets-react");
  const tailwindEnabled = isPluginEnabled("intellisense-tailwind");
  const emmetEnabled = isPluginEnabled("snippets-emmet");
  const bracketAutoCloserEnabled = isPluginEnabled("bracket-pair-closer");
  const linterEnabled = isPluginEnabled("linter-syntax");
  const prettierEnabled = isPluginEnabled("formatter-prettier");

  // Initialize or re-create editor when file or active theme/plugins change
  useEffect(() => {
    if (!editorContainerRef.current || !activeFile) {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
      return;
    }

    const previousDoc = viewRef.current ? viewRef.current.state.doc.toString() : null;
    const initialDoc = previousDoc !== null ? previousDoc : (activeFile.content || "");

    // Clean up previous view instance
    if (viewRef.current) {
      viewRef.current.destroy();
    }

    // Build editor extensions
    const extensions = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      history(),
      bracketMatching(),
      keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
      getLanguageExtension(activeFile.name),
      getEditorTheme(activeThemeId),
      createIntelliSenseExtension({
        reactSnippets: reactSnippetsEnabled,
        tailwind: tailwindEnabled,
        emmet: emmetEnabled,
        autoCloseBrackets: bracketAutoCloserEnabled,
      }),
      lineWrappingCompartment.of(isLineWrapping ? EditorView.lineWrapping : []),
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
    ];

    if (linterEnabled) {
      extensions.push(createLinterExtension(activeFile.name));
    }

    const state = EditorState.create({
      doc: initialDoc,
      extensions,
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
  }, [
    activeFilePath,
    activeFile?.name,
    activeThemeId,
    reactSnippetsEnabled,
    tailwindEnabled,
    emmetEnabled,
    bracketAutoCloserEnabled,
    linterEnabled,
  ]);

  // Listen to QuickKeyRow symbol insertions & format events
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

    const handleFormatEvent = () => {
      handleFormatDocument();
    };

    window.addEventListener("flickide:insert-key" as any, handleInsertKey);
    window.addEventListener("flickide:format-doc" as any, handleFormatEvent);
    return () => {
      window.removeEventListener("flickide:insert-key" as any, handleInsertKey);
      window.removeEventListener("flickide:format-doc" as any, handleFormatEvent);
    };
  }, [handleFormatDocument]);

  return (
    <div className="flex flex-col h-full bg-surface-300 overflow-hidden relative">
      {/* Toast Notification */}
      {formatToast && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-surface-100/95 border border-brand-cyan/40 text-neutral-100 text-xs px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-md flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <Sparkles className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
          <span>{formatToast}</span>
        </div>
      )}

      {/* Tab bar for open files */}
      <div className="h-10 bg-surface-200 border-b border-surface-border flex items-center justify-between overflow-x-auto no-scrollbar shrink-0 px-1">
        <div className="flex items-center overflow-x-auto no-scrollbar flex-1">
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

        {/* Right Action Buttons: Word Wrap Toggle & Prettier Format */}
        {activeFile && (
          <div className="flex items-center space-x-1.5 mr-1 shrink-0">
            {/* Word Wrap / Horizontal Scrolling Toggle */}
            <button
              id="btn-toggle-word-wrap"
              type="button"
              onClick={toggleLineWrapping}
              title={
                isLineWrapping
                  ? "Word Wrap: ON (Lines break to fit screen. Click for Horizontal Swipe)"
                  : "Word Wrap: OFF (Horizontal Swipe ↔ active. Click to wrap lines)"
              }
              className={`min-h-[30px] px-2 py-1 text-[11px] font-medium rounded-lg border flex items-center space-x-1 transition-all active:scale-95 select-none touch-manipulation ${
                isLineWrapping
                  ? "bg-brand-cyan/20 text-brand-cyan border-brand-cyan/40 shadow-sm"
                  : "bg-surface-300 text-neutral-400 hover:text-white border-surface-border"
              }`}
            >
              <WrapText className={`w-3.5 h-3.5 ${isLineWrapping ? "text-brand-cyan" : "text-neutral-400"}`} />
              <span className="text-[10px] hidden sm:inline font-mono font-medium">
                {isLineWrapping ? "Wrap: ON" : "Wrap: OFF"}
              </span>
            </button>

            {/* Prettier Format Button */}
            {prettierEnabled && (
              <button
                id="btn-format-document"
                onClick={handleFormatDocument}
                disabled={isFormatting}
                title="Format with Prettier"
                className="min-h-[30px] flex items-center space-x-1 px-2.5 py-1 text-[11px] font-medium text-brand-cyan bg-brand-cyan/10 hover:bg-brand-cyan/20 active:scale-95 border border-brand-cyan/30 rounded-lg transition-all select-none touch-manipulation"
              >
                <Wand2 className={`w-3 h-3 ${isFormatting ? "animate-spin text-amber-400" : ""}`} />
                <span className="hidden sm:inline">Format</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Editor Body with True Horizontal Scrolling Support */}
      <div className="flex-1 relative overflow-hidden w-full max-w-full min-w-0">
        {activeFile ? (
          <div
            ref={editorContainerRef}
            className="absolute inset-0 w-full h-full max-w-full overflow-hidden touch-pan-x touch-pan-y"
          />
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
