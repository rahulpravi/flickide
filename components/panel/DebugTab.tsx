"use client";

import React, { useState } from "react";
import { Play, Trash2, Clock, CheckCircle2, AlertCircle, FileCode } from "lucide-react";
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

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastStatus, setLastStatus] = useState<"idle" | "success" | "error">("idle");

  const runCode = () => {
    if (!activeFile) return;

    setIsRunning(true);
    const newLogs: LogEntry[] = [];

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

      newLogs.push({
        id: `log-${Date.now()}-${Math.random()}`,
        type,
        message: formatted,
        timestamp: timeStr,
      });
    };

    const sandboxedConsole = {
      log: (...args: any[]) => appendLog("log", ...args),
      info: (...args: any[]) => appendLog("info", ...args),
      warn: (...args: any[]) => appendLog("warn", ...args),
      error: (...args: any[]) => appendLog("error", ...args),
    };

    const startTime = performance.now();
    try {
      // Execute in isolated function context
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
      setLogs(newLogs);
    }
  };

  const clearLogs = () => {
    setLogs([]);
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
          {executionTime !== null && (
            <div className="flex items-center space-x-1 text-[11px] font-mono text-neutral-400 bg-surface-300 px-2 py-0.5 rounded border border-surface-border">
              <Clock className="w-3 h-3 text-brand-cyan" />
              <span>{executionTime}ms</span>
            </div>
          )}

          <button
            onClick={clearLogs}
            title="Clear Console"
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

      {/* Console output stream */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 font-mono text-xs no-scrollbar">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 p-6">
            <Play className="w-8 h-8 text-neutral-600 mb-2 opacity-50" />
            <p className="text-xs">Tap "Run" to execute the active JavaScript file.</p>
            <p className="text-[10px] text-neutral-600 mt-1">
              Console output and execution duration will be logged here.
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
              Execution {lastStatus === "success" ? "successful" : "terminated with errors"}
            </span>
          </div>
          <span className="font-mono">{executionTime}ms</span>
        </div>
      )}
    </div>
  );
};
