"use client";

import React from "react";
import { FolderTree, Code2, Sparkles, TerminalSquare } from "lucide-react";
import { useUIStore, NavTab } from "../../stores/uiStore";

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useUIStore();

  const navItems: NavItem[] = [
    { id: "files", label: "Files", icon: FolderTree },
    { id: "code", label: "Code", icon: Code2 },
    { id: "ai", label: "AI", icon: Sparkles },
    { id: "panel", label: "Panel", icon: TerminalSquare },
  ];

  const handleTabClick = (id: NavTab) => {
    // Subtle mobile haptic feedback if supported by hardware
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(15);
    }
    setActiveTab(id);
  };

  return (
    <nav
      id="bottom-nav-bar"
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface-200/95 backdrop-blur-md border-t border-surface-border safe-bottom select-none"
    >
      <div className="grid grid-cols-4 h-14 max-w-md mx-auto items-stretch px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => handleTabClick(item.id)}
              className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center relative transition-colors duration-150 active:scale-95 touch-manipulation ${
                isActive
                  ? "text-brand-cyan"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-[2px] bg-brand-cyan rounded-full shadow-[0_0_8px_#00d2ff]" />
              )}
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
              <span className="text-[10px] font-medium tracking-tight mt-1">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
