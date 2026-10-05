"use client";

import React, { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, CornerDownLeft, Play } from "lucide-react";
import { useFileSystemStore } from "../../stores/fileSystemStore";
import { formatBytes, normalizePath } from "../../lib/utils/formatters";

interface TerminalLine {
  id: string;
  type: "input" | "output" | "error" | "info";
  text: string;
}

export const TerminalTab: React.FC = () => {
  const { files, createFile, activeFilePath } = useFileSystemStore();

  const [inputVal, setInputVal] = useState("");
  const [currentDir, setCurrentDir] = useState("/");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: "line-welcome",
      type: "info",
      text: "FlickIDE Virtual Shell v1.0.0 (IndexedDB linked)\nType 'help' for a list of commands.",
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const executeCommand = async (cmdString: string) => {
    const trimmed = cmdString.trim();
    if (!trimmed) return;

    // Append input command line
    setLines((prev) => [
      ...prev,
      { id: `cmd-${Date.now()}`, type: "input", text: `${currentDir} $ ${trimmed}` },
    ]);

    setHistory((prev) => [...prev, trimmed]);
    setHistoryIdx(-1);

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case "help":
        setLines((prev) => [
          ...prev,
          {
            id: `out-${Date.now()}`,
            type: "output",
            text:
              "Available Commands:\n" +
              "  ls              List files and directories in current path\n" +
              "  cat <file>      Display contents of a file\n" +
              "  touch <file>    Create a new file in IndexedDB\n" +
              "  pwd             Print current working directory\n" +
              "  run [file]      Execute active or target JS file in sandbox\n" +
              "  clear           Clear the terminal screen\n" +
              "  help            Show this help reference",
          },
        ]);
        break;

      case "clear":
        setLines([]);
        break;

      case "pwd":
        setLines((prev) => [
          ...prev,
          { id: `out-${Date.now()}`, type: "output", text: currentDir },
        ]);
        break;

      case "ls": {
        const items = Object.values(files).filter((f) => f.parentPath === currentDir);
        if (items.length === 0) {
          setLines((prev) => [
            ...prev,
            { id: `out-${Date.now()}`, type: "info", text: "(Directory is empty)" },
          ]);
        } else {
          const formatted = items
            .map((item) => {
              const prefix = item.type === "folder" ? "📁 " : "📄 ";
              const sizeStr = item.type === "folder" ? "" : ` (${formatBytes(item.size)})`;
              return `${prefix}${item.name}${sizeStr}`;
            })
            .join("\n");
          setLines((prev) => [
            ...prev,
            { id: `out-${Date.now()}`, type: "output", text: formatted },
          ]);
        }
        break;
      }

      case "cat": {
        if (!args[0]) {
          setLines((prev) => [
            ...prev,
            { id: `err-${Date.now()}`, type: "error", text: "Usage: cat <filename>" },
          ]);
          break;
        }

        const targetPath = normalizePath(
          currentDir === "/" ? `/${args[0]}` : `${currentDir}/${args[0]}`
        );
        const file = files[targetPath];

        if (!file) {
          setLines((prev) => [
            ...prev,
            { id: `err-${Date.now()}`, type: "error", text: `cat: ${args[0]}: No such file` },
          ]);
        } else if (file.type === "folder") {
          setLines((prev) => [
            ...prev,
            { id: `err-${Date.now()}`, type: "error", text: `cat: ${args[0]}: Is a directory` },
          ]);
        } else {
          setLines((prev) => [
            ...prev,
            { id: `out-${Date.now()}`, type: "output", text: file.content || "(empty file)" },
          ]);
        }
        break;
      }

      case "touch": {
        if (!args[0]) {
          setLines((prev) => [
            ...prev,
            { id: `err-${Date.now()}`, type: "error", text: "Usage: touch <filename>" },
          ]);
          break;
        }

        try {
          await createFile(args[0], currentDir, "");
          setLines((prev) => [
            ...prev,
            { id: `out-${Date.now()}`, type: "info", text: `Created file '${args[0]}' in ${currentDir}` },
          ]);
        } catch (e: any) {
          setLines((prev) => [
            ...prev,
            { id: `err-${Date.now()}`, type: "error", text: `touch: ${e.message}` },
          ]);
        }
        break;
      }

      case "run": {
        const fileToRun = args[0]
          ? files[
              normalizePath(
                currentDir === "/" ? `/${args[0]}` : `${currentDir}/${args[0]}`
              )
            ]
          : activeFilePath
          ? files[activeFilePath]
          : null;

        if (!fileToRun) {
          setLines((prev) => [
            ...prev,
            { id: `err-${Date.now()}`, type: "error", text: "No file specified or open to run." },
          ]);
          break;
        }

        try {
          const logs: string[] = [];
          const fakeConsole = {
            log: (...msgs: any[]) =>
              logs.push(msgs.map((m) => (typeof m === "object" ? JSON.stringify(m) : String(m))).join(" ")),
            error: (...msgs: any[]) =>
              logs.push("[ERROR] " + msgs.map((m) => String(m)).join(" ")),
            warn: (...msgs: any[]) =>
              logs.push("[WARN] " + msgs.map((m) => String(m)).join(" ")),
          };

          const runFn = new Function("console", fileToRun.content || "");
          const startTime = performance.now();
          runFn(fakeConsole);
          const elapsed = (performance.now() - startTime).toFixed(2);

          const outputText =
            logs.length > 0
              ? logs.join("\n") + `\n\n[Process completed in ${elapsed}ms]`
              : `[Process completed with 0 output in ${elapsed}ms]`;

          setLines((prev) => [
            ...prev,
            { id: `out-${Date.now()}`, type: "output", text: outputText },
          ]);
        } catch (err: any) {
          setLines((prev) => [
            ...prev,
            { id: `err-${Date.now()}`, type: "error", text: `Execution error: ${err.message}` },
          ]);
        }
        break;
      }

      default:
        setLines((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            type: "error",
            text: `bash: command not found: ${cmd}. Type 'help' for commands.`,
          },
        ]);
        break;
    }

    setInputVal("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(inputVal);
    } else if (e.key === "ArrowUp") {
      if (history.length > 0) {
        const nextIdx = historyIdx + 1;
        if (nextIdx < history.length) {
          setHistoryIdx(nextIdx);
          setInputVal(history[history.length - 1 - nextIdx]);
        }
      }
    } else if (e.key === "ArrowDown") {
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInputVal(history[history.length - 1 - nextIdx]);
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInputVal("");
      }
    }
  };

  // Quick mobile action buttons
  const quickActions = ["ls", "pwd", "run", "clear", "help"];

  return (
    <div className="flex flex-col h-full bg-[#0a0e14] text-neutral-200 font-mono text-xs overflow-hidden">
      {/* Terminal Output */}
      <div className="flex-1 p-3 overflow-y-auto space-y-1.5 leading-relaxed no-scrollbar">
        {lines.map((l) => (
          <div
            key={l.id}
            className={`whitespace-pre-wrap break-all ${
              l.type === "input"
                ? "text-brand-cyan font-bold"
                : l.type === "error"
                ? "text-rose-400"
                : l.type === "info"
                ? "text-amber-300"
                : "text-neutral-200"
            }`}
          >
            {l.text}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Quick Mobile Shell Keys */}
      <div className="h-9 bg-surface-200 border-t border-surface-border flex items-center px-2 space-x-1.5 overflow-x-auto no-scrollbar shrink-0 select-none">
        {quickActions.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => executeCommand(action)}
            className="min-h-[30px] px-2.5 bg-surface-300 hover:bg-surface-active active:bg-brand-cyan/20 active:text-brand-cyan text-neutral-300 rounded border border-surface-border text-[11px] font-mono touch-manipulation transition-colors"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Command Input Prompt */}
      <div className="p-2 bg-surface-200 border-t border-surface-border flex items-center space-x-2 shrink-0">
        <span className="text-brand-cyan font-bold shrink-0">$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="ls, cat <file>, touch <file>, run..."
          className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder-neutral-600"
        />
        <button
          onClick={() => executeCommand(inputVal)}
          className="min-h-[38px] min-w-[38px] flex items-center justify-center bg-brand-cyan hover:bg-brand-accent text-black rounded-lg shrink-0"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
