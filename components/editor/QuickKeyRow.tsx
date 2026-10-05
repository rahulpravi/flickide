"use client";

import React from "react";

interface QuickKeyRowProps {
  onInsertSymbol?: (symbol: string) => void;
}

export const QuickKeyRow: React.FC<QuickKeyRowProps> = ({ onInsertSymbol }) => {
  // Required keys: Tab { } ( ) [ ] ; " ' = < > /
  const keys = [
    { label: "Tab", insert: "\t" },
    { label: "{", insert: "{" },
    { label: "}", insert: "}" },
    { label: "(", insert: "(" },
    { label: ")", insert: ")" },
    { label: "[", insert: "[" },
    { label: "]", insert: "]" },
    { label: ";", insert: ";" },
    { label: '"', insert: '"' },
    { label: "'", insert: "'" },
    { label: "=", insert: "=" },
    { label: "<", insert: "<" },
    { label: ">", insert: ">" },
    { label: "/", insert: "/" },
    { label: ":", insert: ":" },
    { label: "!", insert: "!" },
    { label: "+", insert: "+" },
    { label: "_", insert: "_" },
  ];

  const handleKeyPress = (e: React.MouseEvent, symbol: string) => {
    // Prevent default so focus remains in the editor
    e.preventDefault();
    e.stopPropagation();

    // Trigger custom event for CodeMirror
    const event = new CustomEvent("flickide:insert-key", {
      detail: { symbol },
    });
    window.dispatchEvent(event);

    if (onInsertSymbol) {
      onInsertSymbol(symbol);
    }

    // Touch haptic
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <div
      id="quick-key-row"
      aria-label="Quick-Insert Key Row"
      className="h-11 bg-surface-100 border-t border-b border-surface-border flex items-center overflow-x-auto no-scrollbar px-2 space-x-1.5 shrink-0 select-none z-30"
    >
      {keys.map((k) => (
        <button
          key={k.label}
          type="button"
          onMouseDown={(e) => handleKeyPress(e, k.insert)}
          onTouchStart={(e) => handleKeyPress(e as any, k.insert)}
          className="min-h-[38px] min-w-[38px] px-2.5 bg-surface-200 hover:bg-surface-active active:bg-brand-cyan/20 active:text-brand-cyan text-neutral-200 border border-surface-border/70 rounded-md font-mono text-sm font-semibold flex items-center justify-center shadow-sm touch-manipulation transition-all"
        >
          {k.label}
        </button>
      ))}
    </div>
  );
};
