"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Sparkles,
  Palette,
  Moon,
  Sun,
  Wand2,
  Code2,
  Zap,
  Braces,
  AlertTriangle,
  CheckCheck,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { usePluginStore, PluginCategory, PluginItem } from "../../stores/pluginStore";

export const PluginStore: React.FC = () => {
  const {
    plugins,
    activeThemeId,
    togglePlugin,
    installPlugin,
    uninstallPlugin,
    setActiveTheme,
    resetToDefaults,
  } = usePluginStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<PluginCategory | "all">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Filtered plugins
  const filteredPlugins = useMemo(() => {
    return plugins.filter((plugin) => {
      const matchesCategory =
        selectedCategory === "all" || plugin.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        plugin.name.toLowerCase().includes(q) ||
        plugin.description.toLowerCase().includes(q) ||
        plugin.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [plugins, selectedCategory, searchQuery]);

  // Statistics
  const totalInstalled = plugins.filter((p) => p.isInstalled).length;
  const totalEnabled = plugins.filter((p) => p.isInstalled && p.isEnabled).length;

  // Icon mapping
  const renderPluginIcon = (icon: string, category: PluginCategory) => {
    const iconClass = "w-5 h-5";
    switch (icon) {
      case "palette":
        return <Palette className={`${iconClass} text-brand-cyan`} />;
      case "moon":
        return <Moon className={`${iconClass} text-purple-400`} />;
      case "sun":
        return <Sun className={`${iconClass} text-amber-400`} />;
      case "sparkles":
        return <Sparkles className={`${iconClass} text-pink-400`} />;
      case "wand":
        return <Wand2 className={`${iconClass} text-emerald-400`} />;
      case "code":
        return <Code2 className={`${iconClass} text-blue-400`} />;
      case "zap":
        return <Zap className={`${iconClass} text-yellow-400`} />;
      case "braces":
        return <Braces className={`${iconClass} text-orange-400`} />;
      case "alert":
        return <AlertTriangle className={`${iconClass} text-rose-400`} />;
      case "check-check":
        return <CheckCheck className={`${iconClass} text-teal-400`} />;
      default:
        return <Layers className={`${iconClass} text-neutral-400`} />;
    }
  };

  const getCategoryBadge = (category: PluginCategory) => {
    switch (category) {
      case "themes":
        return "bg-purple-500/15 text-purple-300 border-purple-500/30";
      case "formatters":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "snippets":
        return "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30";
      case "linters":
        return "bg-rose-500/15 text-rose-300 border-rose-500/30";
      default:
        return "bg-neutral-800 text-neutral-300 border-neutral-700";
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-300 text-neutral-100 overflow-hidden relative">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-surface-100 border border-brand-cyan/40 text-neutral-100 text-xs px-3.5 py-1.5 rounded-full shadow-xl backdrop-blur-md flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Search Area */}
      <div className="p-3 bg-surface-200/90 border-b border-surface-border backdrop-blur-md shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-cyan/20 to-purple-500/20 border border-brand-cyan/30 flex items-center justify-center">
              <Layers className="w-4 h-4 text-brand-cyan" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight flex items-center space-x-1.5">
                <span>Extensions & Plugins</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-brand-cyan/20 text-brand-cyan rounded-full font-semibold border border-brand-cyan/30">
                  Store
                </span>
              </h1>
              <p className="text-[11px] text-neutral-400">
                {totalEnabled} active / {totalInstalled} installed
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              resetToDefaults();
              showToast("Reset all plugins to defaults");
            }}
            title="Reset to Defaults"
            className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-medium text-neutral-400 hover:text-white bg-surface-card hover:bg-surface-active border border-surface-border rounded-md transition-all active:scale-95 touch-manipulation"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search themes, snippets, formatters, linters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-100 border border-surface-border focus:border-brand-cyan rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-0.5">
          {[
            { id: "all", label: "All" },
            { id: "themes", label: "Themes" },
            { id: "snippets", label: "Snippets" },
            { id: "formatters", label: "Formatters" },
            { id: "linters", label: "Linters" },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 touch-manipulation ${
                  isSelected
                    ? "bg-brand-cyan text-black font-semibold shadow-[0_0_10px_rgba(0,210,255,0.4)]"
                    : "bg-surface-card text-neutral-400 hover:text-white border border-surface-border"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Plugin Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 pb-24">
        {filteredPlugins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-400 space-y-2">
            <SlidersHorizontal className="w-10 h-10 text-neutral-600 mb-1" />
            <p className="text-sm font-semibold">No plugins found</p>
            <p className="text-xs text-neutral-500 max-w-xs">
              No extensions match "{searchQuery}". Try searching for themes, snippets, or prettier.
            </p>
          </div>
        ) : (
          filteredPlugins.map((plugin) => {
            const isTheme = plugin.category === "themes";
            const isCurrentActiveTheme = isTheme && activeThemeId === plugin.id;

            return (
              <div
                key={plugin.id}
                className={`p-3 rounded-xl border transition-all ${
                  plugin.isEnabled
                    ? "bg-surface-200/90 border-surface-border hover:border-brand-cyan/40"
                    : "bg-surface-200/40 border-surface-border/50 opacity-75"
                }`}
              >
                <div className="flex items-start justify-between space-x-3">
                  {/* Left: Icon & Info */}
                  <div className="flex items-start space-x-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-surface-card border border-surface-border flex items-center justify-center shrink-0">
                      {renderPluginIcon(plugin.icon, plugin.category)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <h2 className="text-xs font-bold text-white truncate">{plugin.name}</h2>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          v{plugin.version}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded border font-medium uppercase tracking-wider ${getCategoryBadge(
                            plugin.category
                          )}`}
                        >
                          {plugin.category}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 text-[10px] text-neutral-400 mt-0.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{plugin.author}</span>
                      </div>

                      <p className="text-[11px] text-neutral-300 mt-1.5 leading-relaxed line-clamp-2">
                        {plugin.description}
                      </p>

                      {/* Theme color swatch preview */}
                      {isTheme && plugin.colorScheme && (
                        <div className="flex items-center space-x-2 mt-2 pt-1.5 border-t border-surface-border/60">
                          <span className="text-[10px] text-neutral-400 font-medium">Palette:</span>
                          <div className="flex items-center space-x-1">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/20"
                              style={{ backgroundColor: plugin.colorScheme.bg }}
                              title="Background"
                            />
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/20"
                              style={{ backgroundColor: plugin.colorScheme.accent }}
                              title="Accent"
                            />
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/20"
                              style={{ backgroundColor: plugin.colorScheme.keyword }}
                              title="Keywords"
                            />
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/20"
                              style={{ backgroundColor: plugin.colorScheme.text }}
                              title="Text"
                            />
                          </div>

                          {/* Quick Apply Button for Themes */}
                          <button
                            onClick={() => {
                              setActiveTheme(plugin.id);
                              showToast(`Theme applied: ${plugin.name}`);
                            }}
                            className={`ml-auto px-2 py-0.5 text-[10px] font-semibold rounded transition-all touch-manipulation flex items-center space-x-1 ${
                              isCurrentActiveTheme
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                : "bg-brand-cyan/15 text-brand-cyan hover:bg-brand-cyan/25 border border-brand-cyan/30"
                            }`}
                          >
                            {isCurrentActiveTheme ? (
                              <>
                                <Check className="w-2.5 h-2.5" />
                                <span>Active</span>
                              </>
                            ) : (
                              <span>Apply Theme</span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Enable/Disable Toggle Switch */}
                  {!isTheme && (
                    <div className="flex flex-col items-end space-y-1.5 shrink-0 pt-0.5">
                      <button
                        onClick={() => {
                          togglePlugin(plugin.id);
                          showToast(
                            `${plugin.name} ${!plugin.isEnabled ? "Enabled" : "Disabled"}`
                          );
                        }}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none touch-manipulation ${
                          plugin.isEnabled
                            ? "bg-brand-cyan shadow-[0_0_10px_rgba(0,210,255,0.4)]"
                            : "bg-neutral-700"
                        }`}
                        title={plugin.isEnabled ? "Disable Extension" : "Enable Extension"}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                            plugin.isEnabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className="text-[9px] text-neutral-400 font-medium">
                        {plugin.isEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tag chips */}
                <div className="flex items-center space-x-1 mt-2.5 flex-wrap gap-y-1">
                  {plugin.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-surface-card text-neutral-400 border border-surface-border"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
