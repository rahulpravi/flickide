import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { oneDark } from "@codemirror/theme-one-dark";

// ==========================================
// 1. DRACULA OFFICIAL THEME
// ==========================================
const draculaBaseTheme = EditorView.theme(
  {
    "&": {
      color: "#f8f8f2",
      backgroundColor: "#1e1f29",
      fontFamily: "var(--font-mono, 'Fira Code', 'Courier New', monospace)",
      fontSize: "13px",
      height: "100%",
    },
    ".cm-content": {
      caretColor: "#ff79c6",
      paddingBottom: "130px",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#ff79c6",
      borderLeftWidth: "2px",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: "#44475a88 !important",
    },
    ".cm-gutters": {
      backgroundColor: "#191a21",
      color: "#6272a4",
      borderRight: "1px solid #282a36",
    },
    ".cm-activeLine": {
      backgroundColor: "#282a3666",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#282a3688",
      color: "#f1fa8c",
    },
    ".cm-tooltip": {
      backgroundColor: "#21222c",
      border: "1px solid #44475a",
      borderRadius: "8px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
      color: "#f8f8f2",
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li": {
        padding: "4px 8px",
        borderRadius: "4px",
      },
      "& > ul > li[aria-selected]": {
        backgroundColor: "#44475a",
        color: "#ff79c6",
      },
    },
  },
  { dark: true }
);

const draculaHighlightStyle = HighlightStyle.define([
  { tag: [t.keyword, t.operatorKeyword, t.modifier], color: "#ff79c6", fontWeight: "bold" },
  { tag: [t.definition(t.variableName), t.function(t.variableName)], color: "#50fa7b" },
  { tag: [t.typeName, t.className, t.namespace], color: "#8be9fd", fontStyle: "italic" },
  { tag: [t.string, t.special(t.string)], color: "#f1fa8c" },
  { tag: [t.number, t.bool, t.null], color: "#bd93f9" },
  { tag: [t.comment, t.lineComment, t.blockComment], color: "#6272a4", fontStyle: "italic" },
  { tag: [t.tagName, t.angleBracket], color: "#ff79c6" },
  { tag: [t.attributeName], color: "#50fa7b" },
  { tag: [t.propertyName], color: "#66d9ef" },
  { tag: [t.variableName], color: "#f8f8f2" },
]);

export const draculaTheme: Extension = [draculaBaseTheme, syntaxHighlighting(draculaHighlightStyle)];

// ==========================================
// 2. MONOKAI PRO THEME
// ==========================================
const monokaiBaseTheme = EditorView.theme(
  {
    "&": {
      color: "#fcfcfa",
      backgroundColor: "#1e1e1e",
      fontFamily: "var(--font-mono, 'Fira Code', 'Courier New', monospace)",
      fontSize: "13px",
      height: "100%",
    },
    ".cm-content": {
      caretColor: "#ffd866",
      paddingBottom: "130px",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#ffd866",
      borderLeftWidth: "2px",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: "#403e4199 !important",
    },
    ".cm-gutters": {
      backgroundColor: "#191919",
      color: "#727072",
      borderRight: "1px solid #2d2a2e",
    },
    ".cm-activeLine": {
      backgroundColor: "#2d2a2e55",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#2d2a2e88",
      color: "#ffd866",
    },
    ".cm-tooltip": {
      backgroundColor: "#2d2a2e",
      border: "1px solid #403e41",
      borderRadius: "8px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
      color: "#fcfcfa",
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li[aria-selected]": {
        backgroundColor: "#403e41",
        color: "#ff6188",
      },
    },
  },
  { dark: true }
);

const monokaiHighlightStyle = HighlightStyle.define([
  { tag: [t.keyword, t.operatorKeyword], color: "#ff6188", fontWeight: "bold" },
  { tag: [t.function(t.variableName), t.definition(t.variableName)], color: "#a9dc76" },
  { tag: [t.typeName, t.className], color: "#78dce8", fontStyle: "italic" },
  { tag: [t.string, t.special(t.string)], color: "#ffd866" },
  { tag: [t.number, t.bool, t.null], color: "#ab9df2" },
  { tag: [t.comment, t.lineComment], color: "#727072", fontStyle: "italic" },
  { tag: [t.tagName], color: "#ff6188" },
  { tag: [t.attributeName], color: "#fc9867" },
  { tag: [t.propertyName], color: "#78dce8" },
  { tag: [t.variableName], color: "#fcfcfa" },
]);

export const monokaiTheme: Extension = [monokaiBaseTheme, syntaxHighlighting(monokaiHighlightStyle)];

// ==========================================
// 3. SYNTHWAVE '84 THEME
// ==========================================
const synthwaveBaseTheme = EditorView.theme(
  {
    "&": {
      color: "#f92aad",
      backgroundColor: "#1a1528",
      fontFamily: "var(--font-mono, 'Fira Code', 'Courier New', monospace)",
      fontSize: "13px",
      height: "100%",
    },
    ".cm-content": {
      caretColor: "#f92aad",
      paddingBottom: "130px",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#f92aad",
      borderLeftWidth: "2px",
      boxShadow: "0 0 8px #f92aad",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: "#49265f88 !important",
    },
    ".cm-gutters": {
      backgroundColor: "#130f1e",
      color: "#614d85",
      borderRight: "1px solid #2f2546",
    },
    ".cm-activeLine": {
      backgroundColor: "#2a1e3e55",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#2a1e3e88",
      color: "#ff7edb",
    },
    ".cm-tooltip": {
      backgroundColor: "#241b35",
      border: "1px solid #49265f",
      borderRadius: "8px",
      boxShadow: "0 8px 24px rgba(249, 42, 173, 0.2)",
      color: "#fff",
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li[aria-selected]": {
        backgroundColor: "#49265f",
        color: "#36f9f6",
        boxShadow: "inset 0 0 10px rgba(54, 249, 246, 0.2)",
      },
    },
  },
  { dark: true }
);

const synthwaveHighlightStyle = HighlightStyle.define([
  { tag: [t.keyword, t.operatorKeyword], color: "#fe4450", fontWeight: "bold" },
  { tag: [t.function(t.variableName), t.definition(t.variableName)], color: "#36f9f6" },
  { tag: [t.typeName, t.className], color: "#fe4450", fontStyle: "italic" },
  { tag: [t.string, t.special(t.string)], color: "#ff8b39" },
  { tag: [t.number, t.bool, t.null], color: "#f97e72" },
  { tag: [t.comment, t.lineComment], color: "#614d85", fontStyle: "italic" },
  { tag: [t.tagName], color: "#72f1b8" },
  { tag: [t.attributeName], color: "#f92aad" },
  { tag: [t.propertyName], color: "#ffe43f" },
  { tag: [t.variableName], color: "#f8f8f2" },
]);

export const synthwaveTheme: Extension = [synthwaveBaseTheme, syntaxHighlighting(synthwaveHighlightStyle)];

// ==========================================
// 4. ONE DARK PRO (DEFAULT)
// ==========================================
const oneDarkRefinedTheme = EditorView.theme({
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
    paddingBottom: "130px",
  },
  ".cm-gutters": {
    backgroundColor: "#0d1117",
    color: "#6e7681",
    borderRight: "1px solid #21262d",
  },
  ".cm-activeLine": {
    backgroundColor: "#161b2255",
  },
  ".cm-tooltip": {
    backgroundColor: "#161b22",
    border: "1px solid #30363d",
    borderRadius: "8px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
    color: "#c9d1d9",
  },
  ".cm-tooltip-autocomplete": {
    "& > ul > li": {
      padding: "4px 8px",
      borderRadius: "4px",
    },
    "& > ul > li[aria-selected]": {
      backgroundColor: "#21262d",
      color: "#58a6ff",
    },
  },
});

export const oneDarkTheme: Extension = [oneDark, oneDarkRefinedTheme];

// ==========================================
// 5. UNIVERSAL MOBILE HORIZONTAL SCROLL THEME
// ==========================================
export const editorHorizontalScrollTheme = EditorView.theme({
  "&": {
    height: "100%",
    width: "100%",
    maxWidth: "100%",
  },
  ".cm-scroller": {
    overflowX: "auto !important",
    overflowY: "auto !important",
    WebkitOverflowScrolling: "touch",
    touchAction: "pan-x pan-y !important",
    maxWidth: "100%",
  },
  ".cm-gutters": {
    position: "sticky !important",
    left: "0 !important",
    zIndex: "10 !important",
  },
  ".cm-content": {
    paddingBottom: "140px",
  },
});

// ==========================================
// HELPER TO GET THEME BY ID
// ==========================================
export function getEditorTheme(themeId: string): Extension {
  let theme: Extension;
  switch (themeId) {
    case "theme-dracula":
      theme = draculaTheme;
      break;
    case "theme-monokai":
      theme = monokaiTheme;
      break;
    case "theme-synthwave84":
      theme = synthwaveTheme;
      break;
    case "theme-one-dark":
    default:
      theme = oneDarkTheme;
      break;
  }
  return [theme, editorHorizontalScrollTheme];
}
