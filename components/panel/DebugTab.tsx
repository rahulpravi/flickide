"use client";

import React, { useState, useEffect } from "react";
import { Play, Trash2, Clock, CheckCircle2, AlertCircle, FileCode, Eye, Terminal } from "lucide-react";
import { useFileSystemStore } from "../../stores/fileSystemStore";

interface LogEntry {
  id: string;
  type: "log" | "warn" | "error" | "info";
  message: string;
  timestamp: string;
}

export const DebugTab: React.FC = () => {
  const { activeFilePath, files } = useFileSystemStore();
  const activeFile = activeFilePath ? files[activeFilePath] : null;

  const isHtml = Boolean(
    activeFile?.name.endsWith(".html") || activeFile?.name.endsWith(".htm")
  );

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastStatus, setLastStatus] = useState<"idle" | "success" | "error">("idle");
  const [viewMode, setViewMode] = useState<"preview" | "console">("preview");
  const [previewDoc, setPreviewDoc] = useState<string>("");

  useEffect(() => {
    if (isHtml) {
      setViewMode("preview");
    } else {
      setViewMode("console");
    }
  }, [activeFilePath, isHtml]);

  const appendLog = (type: LogEntry["type"], ...args: any[]) => {
    const formatted = args
      .map((arg) => {
        if (typeof arg === "object" && arg !== null) {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(" ");

    const timeStr = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        type,
        message: formatted,
        timestamp: timeStr,
      },
    ]);
  };

  const runCode = () => {
    if (!activeFile) return;

    setIsRunning(true);
    const startTime = performance.now();

    // 1. HTML ഫയലുകൾക്ക് Live Preview ലോഡ് ചെയ്യുന്നു
    if (isHtml) {
      setPreviewDoc(activeFile.content || "");
      setViewMode("preview");
      const elapsed = performance.now() - startTime;
      setExecutionTime(parseFloat(elapsed.toFixed(2)));
      setLastStatus("success");
      setIsRunning(false);
      return;
    }

    // 2. JS / TS ഫയലുകൾക്ക് Console Runner പ്രവർത്തിപ്പിക്കുന്നു
    const sandboxedConsole = {
      log: (...args: any[]) => appendLog("log", ...args),
      info: (...args: any[]) => appendLog("info", ...args),
      warn: (...args: any[]) => appendLog("warn", ...args),
      error: (...args: any[]) => appendLog("error", ...args),
    };

    try {
      const runner = new Function("console", activeFile.content || "");
      runner(sandboxedConsole);

      const elapsed = performance.now() - startTime;
      setExecutionTime(parseFloat(elapsed.toFixed(2)));
      setLastStatus("success");
    } catch (err: any) {
      const elapsed = performance.now() - startTime;
      setExecutionTime(parseFloat(elapsed.toFixed(2)));
      setLastStatus("error");
      appendLog("error", `${err.name}: ${err.message}\n${err.stack || ""}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearAll = () => {
    setLogs([]);
    setPreviewDoc("");
    setExecutionTime(null);
    setLastStatus("idle");
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0e14] overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-12 bg-surface-200 border-b border-surface-border flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center space-x-2 truncate">
          <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs text-neutral-300 truncate">
            {activeFile ? activeFile.name : "No file open"}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* HTML ഫയലുകൾക്ക് Preview / Console സ്വിച്ച് ചെയ്യാനുള്ള ബട്ടൺ */}
          {isHtml && previewDoc && (
            <div className="flex bg-surface-300 p-0.5 rounded-md border border-surface-border">
              <button
                onClick={() => setViewMode("preview")}
                className={`px-2 py-1 text-[11px] rounded flex items-center space-x-1 ${
                  viewMode === "preview"
                    ? "bg-brand-cyan/20 text-brand-cyan font-medium"
                    : "text-neutral-400"
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => setViewMode("console")}
                className={`px-2 py-1 text-[11px] rounded flex items-center space-x-1 ${
                  viewMode === "console"
                    ? "bg-brand-cyan/20 text-brand-cyan font-medium"
                    : "text-neutral-400"
                }`}
              >
                <Terminal className="w-3 h-3" />
                <span>Console</span>
              </button>
            </div>
          )}

          {executionTime !== null && (
            <div className="flex items-center space-x-1 text-[11px] font-mono text-neutral-400 bg-surface-300 px-2 py-0.5 rounded border border-surface-border">
              <Clock className="w-3 h-3 text-brand-cyan" />
              <span>{executionTime}ms</span>
            </div>
          )}

          <button
            onClick={clearAll}
            title="Clear Output"
            className="min-h-[40px] min-w-[36px] flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={runCode}
            disabled={!activeFile || isRunning}
            className="min-h-[40px] px-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold text-xs rounded-lg flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Run</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {isHtml && viewMode === "preview" ? (
          previewDoc ? (
            <iframe
              title="HTML Preview"
              srcDoc={previewDoc}
              sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
              className="w-full h-full bg-white border-0"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 p-6">
              <Play className="w-8 h-8 text-neutral-600 mb-2 opacity-50" />
              <p className="text-xs">Tap "Run" to preview the HTML page.</p>
              <p className="text-[10px] text-neutral-600 mt-1">
                The webpage will be rendered live inside this view.
              </p>
            </div>
          )
        ) : (
          /* Console output stream */
          <div className="h-full p-3 overflow-y-auto space-y-2 font-mono text-xs no-scrollbar">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 p-6">
                <Play className="w-8 h-8 text-neutral-600 mb-2 opacity-50" />
                <p className="text-xs">No console logs.</p>
                <p className="text-[10px] text-neutral-600 mt-1">
                  Console output and errors will be logged here.
                </p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2 rounded border text-xs flex flex-col space-y-1 ${
                    log.type === "error"
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                      : log.type === "warn"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                      : "bg-surface-card border-surface-border text-neutral-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-neutral-500 select-none">
                    <span className="uppercase font-bold tracking-wider">{log.type}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <pre className="whitespace-pre-wrap break-all leading-relaxed font-mono">
                    {log.message}
                  </pre>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Execution summary badge */}
      {lastStatus !== "idle" && (
        <div
          className={`h-7 px-3 flex items-center justify-between text-[10px] border-t shrink-0 ${
            lastStatus === "success"
              ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
              : "bg-rose-950/40 border-rose-800 text-rose-300"
          }`}
        >
          <div className="flex items-center space-x-1.5">
            {lastStatus === "success" ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3 h-3 text-rose-400" />
            )}
            <span>
              {isHtml
                ? "Preview loaded successfully"
                : lastStatus === "success"
                ? "Execution successful"
                : "Execution terminated with errors"}
            </span>
          </div>
          <span className="font-mono">{executionTime}ms</span>
        </div>
      )}
    </div>
  );
};
