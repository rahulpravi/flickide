import { create } from "zustand";

export type PluginCategory = "themes" | "snippets" | "formatters" | "linters";

export interface PluginItem {
  id: string;
  name: string;
  category: PluginCategory;
  author: string;
  version: string;
  description: string;
  icon: string;
  tags: string[];
  isInstalled: boolean;
  isEnabled: boolean;
  colorScheme?: {
    bg: string;
    accent: string;
    text: string;
    keyword: string;
  };
}

export const DEFAULT_PLUGINS: PluginItem[] = [
  // --- THEMES ---
  {
    id: "theme-one-dark",
    name: "One Dark Pro",
    category: "themes",
    author: "Atom / FlickIDE",
    version: "1.2.0",
    description: "Classic, iconic dark theme with balanced contrast and vibrant syntax highlights.",
    icon: "palette",
    tags: ["dark", "popular", "cyan"],
    isInstalled: true,
    isEnabled: true,
    colorScheme: {
      bg: "#090d13",
      accent: "#00d2ff",
      text: "#abb2bf",
      keyword: "#c678dd",
    },
  },
  {
    id: "theme-dracula",
    name: "Dracula Official",
    category: "themes",
    author: "Zeno Rocha",
    version: "2.3.1",
    description: "A world-renowned dark theme for vampires, featuring deep purples and neon accents.",
    icon: "moon",
    tags: ["dark", "purple", "neon"],
    isInstalled: true,
    isEnabled: false,
    colorScheme: {
      bg: "#282a36",
      accent: "#ff79c6",
      text: "#f8f8f2",
      keyword: "#ff79c6",
    },
  },
  {
    id: "theme-monokai",
    name: "Monokai Pro",
    category: "themes",
    author: "Monokai",
    version: "1.4.0",
    description: "Beloved warm high-contrast color palette crafted for long, strain-free coding sessions.",
    icon: "sun",
    tags: ["dark", "contrast", "warm"],
    isInstalled: true,
    isEnabled: false,
    colorScheme: {
      bg: "#272822",
      accent: "#f92672",
      text: "#f8f8f2",
      keyword: "#f92672",
    },
  },
  {
    id: "theme-synthwave84",
    name: "SynthWave '84",
    category: "themes",
    author: "Robb Owen",
    version: "1.3.0",
    description: "Retro 80s cyberpunk aesthetic with glowing neon magenta, cyan, and electric yellow.",
    icon: "sparkles",
    tags: ["neon", "cyberpunk", "retro"],
    isInstalled: true,
    isEnabled: false,
    colorScheme: {
      bg: "#262335",
      accent: "#ff007f",
      text: "#f92aad",
      keyword: "#fe4450",
    },
  },

  // --- FORMATTERS ---
  {
    id: "formatter-prettier",
    name: "Prettier - Code Formatter",
    category: "formatters",
    author: "Prettier Community",
    version: "3.5.0",
    description: "Fast in-browser code formatter for JavaScript, TypeScript, HTML, CSS, and JSON.",
    icon: "wand",
    tags: ["format", "clean-code", "standards"],
    isInstalled: true,
    isEnabled: true,
  },

  // --- LANGUAGE PACKS & SNIPPETS ---
  {
    id: "snippets-react",
    name: "React & Next.js Snippets",
    category: "snippets",
    author: "FlickIDE",
    version: "1.3.0",
    description: "Instant expansions for `rfc`, `useState`, `useEffect`, `useCallback`, `useMemo`, Next.js pages.",
    icon: "code",
    tags: ["react", "nextjs", "hooks"],
    isInstalled: true,
    isEnabled: true,
  },
  {
    id: "intellisense-tailwind",
    name: "Tailwind CSS IntelliSense",
    category: "snippets",
    author: "Tailwind Labs",
    version: "2.1.0",
    description: "Autocomplete recommendations for 300+ Tailwind CSS utility classes inside `class` or `className`.",
    icon: "zap",
    tags: ["tailwind", "css", "classes"],
    isInstalled: true,
    isEnabled: true,
  },
  {
    id: "snippets-emmet",
    name: "Emmet & HTML Expander",
    category: "snippets",
    author: "Emmet / FlickIDE",
    version: "1.4.2",
    description: "Rapid HTML tag completions, boilerplate shortcuts (`!`), and auto-closing element tags.",
    icon: "braces",
    tags: ["emmet", "html", "fast-typing"],
    isInstalled: true,
    isEnabled: true,
  },

  // --- LINTERS & CODE QUALITY ---
  {
    id: "linter-syntax",
    name: "ESLint & Syntax Validator",
    category: "linters",
    author: "FlickIDE",
    version: "1.1.0",
    description: "Real-time error squiggly underlines, syntax validation, and diagnostic tooltips as you type.",
    icon: "alert",
    tags: ["linter", "validation", "errors"],
    isInstalled: true,
    isEnabled: true,
  },
  {
    id: "bracket-pair-closer",
    name: "Bracket Pair Matcher & Auto-Closer",
    category: "linters",
    author: "FlickIDE",
    version: "1.0.5",
    description: "Automatically inserts matching pairs for `()`, `{}`, `[]`, quotes, and highlights matching brackets.",
    icon: "check-check",
    tags: ["brackets", "productivity", "matching"],
    isInstalled: true,
    isEnabled: true,
  },
];

const STORAGE_KEY = "flickide_plugins_v1";
const THEME_STORAGE_KEY = "flickide_active_theme_v1";

interface PluginState {
  plugins: PluginItem[];
  activeThemeId: string;
  isInitialized: boolean;

  // Actions
  initPlugins: () => void;
  togglePlugin: (id: string) => void;
  installPlugin: (id: string) => void;
  uninstallPlugin: (id: string) => void;
  setActiveTheme: (themeId: string) => void;
  isPluginEnabled: (id: string) => boolean;
  resetToDefaults: () => void;
}

export const usePluginStore = create<PluginState>((set, get) => ({
  plugins: DEFAULT_PLUGINS,
  activeThemeId: "theme-one-dark",
  isInitialized: false,

  initPlugins: () => {
    if (get().isInitialized || typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

      let plugins = DEFAULT_PLUGINS;
      if (stored) {
        const parsed: PluginItem[] = JSON.parse(stored);
        // Merge with defaults in case new plugins were added in update
        plugins = DEFAULT_PLUGINS.map((def) => {
          const match = parsed.find((p) => p.id === def.id);
          return match
            ? { ...def, isInstalled: match.isInstalled, isEnabled: match.isEnabled }
            : def;
        });
      }

      const activeThemeId = storedTheme || "theme-one-dark";

      set({ plugins, activeThemeId, isInitialized: true });
    } catch (e) {
      console.warn("Failed to load plugins from storage", e);
      set({ plugins: DEFAULT_PLUGINS, activeThemeId: "theme-one-dark", isInitialized: true });
    }
  },

  togglePlugin: (id: string) => {
    const { plugins, activeThemeId } = get();
    const updated = plugins.map((p) => {
      if (p.id === id) {
        const nextEnabled = !p.isEnabled;
        // If it's a theme being disabled and it's current active theme, fallback to one-dark
        return { ...p, isEnabled: nextEnabled };
      }
      return p;
    });

    const target = plugins.find((p) => p.id === id);
    let nextThemeId = activeThemeId;

    if (target?.category === "themes") {
      if (!target.isEnabled) {
        // Enabling this theme: switch active theme to it
        nextThemeId = id;
      } else if (activeThemeId === id) {
        // Disabling current active theme: fallback
        nextThemeId = "theme-one-dark";
      }
    }

    set({ plugins: updated, activeThemeId: nextThemeId });

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem(THEME_STORAGE_KEY, nextThemeId);
    }
  },

  installPlugin: (id: string) => {
    const { plugins } = get();
    const updated = plugins.map((p) =>
      p.id === id ? { ...p, isInstalled: true, isEnabled: true } : p
    );
    set({ plugins: updated });

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  },

  uninstallPlugin: (id: string) => {
    const { plugins, activeThemeId } = get();
    const updated = plugins.map((p) =>
      p.id === id ? { ...p, isInstalled: false, isEnabled: false } : p
    );

    let nextThemeId = activeThemeId;
    if (activeThemeId === id) {
      nextThemeId = "theme-one-dark";
    }

    set({ plugins: updated, activeThemeId: nextThemeId });

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem(THEME_STORAGE_KEY, nextThemeId);
    }
  },

  setActiveTheme: (themeId: string) => {
    const { plugins } = get();
    const updated = plugins.map((p) => {
      if (p.category === "themes") {
        return {
          ...p,
          isEnabled: p.id === themeId,
          isInstalled: true,
        };
      }
      return p;
    });

    set({ plugins: updated, activeThemeId: themeId });

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    }
  },

  isPluginEnabled: (id: string) => {
    const plugin = get().plugins.find((p) => p.id === id);
    return Boolean(plugin?.isInstalled && plugin?.isEnabled);
  },

  resetToDefaults: () => {
    set({ plugins: DEFAULT_PLUGINS, activeThemeId: "theme-one-dark" });
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(THEME_STORAGE_KEY);
    }
  },
}));
