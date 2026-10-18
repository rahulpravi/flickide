import {
  CompletionContext,
  CompletionResult,
  Completion,
  autocompletion,
  snippetCompletion,
  closeBrackets,
  closeBracketsKeymap,
} from "@codemirror/autocomplete";
import { Extension } from "@codemirror/state";
import { keymap } from "@codemirror/view";

// ==========================================
// 1. REACT & NEXT.JS SNIPPETS
// ==========================================
const REACT_SNIPPETS: Completion[] = [
  snippetCompletion(
    'import React from "react";\n\ninterface ${1:Props} {\n  ${2:children?: React.ReactNode;}\n}\n\nexport const ${1:Component}: React.FC<${1:Props}> = ({\n  ${3}\n}) => {\n  return (\n    <div className="${4}">\n      ${5:<h1>${1:Component}</h1>}\n    </div>\n  );\n};\n',
    {
      label: "rfc",
      type: "snippet",
      detail: "React Functional Component",
      info: "Creates a full TypeScript React Functional Component with props interface",
      boost: 95,
    }
  ),
  snippetCompletion("const [${1:state}, set${2:State}] = useState(${3:initialState});", {
    label: "useState",
    type: "function",
    detail: "React State Hook",
    info: "Declares a React state variable and setter",
    boost: 90,
  }),
  snippetCompletion(
    "useEffect(() => {\n  ${1:// effect logic}\n  return () => {\n    ${2:// cleanup}\n  };\n}, [${3}]);",
    {
      label: "useEffect",
      type: "function",
      detail: "React Effect Hook with cleanup",
      info: "Executes side effects on mount, dependencies change, or unmount",
      boost: 90,
    }
  ),
  snippetCompletion(
    "const ${1:memoizedCallback} = useCallback((\n  ${2}\n) => {\n  ${3}\n}, [${4}]);",
    {
      label: "useCallback",
      type: "function",
      detail: "React useCallback Hook",
      boost: 85,
    }
  ),
  snippetCompletion(
    "const ${1:memoizedValue} = useMemo(() => {\n  return ${2};\n}, [${3}]);",
    {
      label: "useMemo",
      type: "function",
      detail: "React useMemo Hook",
      boost: 85,
    }
  ),
  snippetCompletion("const ${1:ref} = useRef<${2:HTMLDivElement}>(null);", {
    label: "useRef",
    type: "function",
    detail: "React useRef Hook",
    boost: 85,
  }),
  snippetCompletion(
    'export default function ${1:Page}() {\n  return (\n    <main className="min-h-screen p-4">\n      <h1 className="text-2xl font-bold">${1:Page}</h1>\n    </main>\n  );\n}',
    {
      label: "nextpage",
      type: "snippet",
      detail: "Next.js App Router Page",
      boost: 90,
    }
  ),
  snippetCompletion(
    'import { NextResponse } from "next/server";\n\nexport async function GET(request: Request) {\n  return NextResponse.json({ message: "${1:Success}" });\n}',
    {
      label: "nextapi",
      type: "snippet",
      detail: "Next.js Route Handler",
      boost: 90,
    }
  ),
  snippetCompletion('console.log("${1:TAG}:", ${2:val});', {
    label: "clg",
    type: "snippet",
    detail: "Console log shortcut",
    boost: 99,
  }),
  snippetCompletion(
    "try {\n  ${1}\n} catch (error: any) {\n  console.error(${2:error});\n}",
    {
      label: "trycatch",
      type: "snippet",
      detail: "Try-Catch block",
      boost: 80,
    }
  ),
  snippetCompletion("const ${1:funcName} = async (${2}) => {\n  ${3}\n};", {
    label: "afn",
    type: "snippet",
    detail: "Async arrow function",
    boost: 80,
  }),
  snippetCompletion('import { ${1} } from "${2}";', {
    label: "imp",
    type: "snippet",
    detail: "ES6 Named Import",
    boost: 80,
  }),
];

// ==========================================
// 2. TAILWIND CSS CLASSES
// ==========================================
const TAILWIND_CLASSES = [
  // Layout & Flexbox/Grid
  "flex", "flex-col", "flex-row", "flex-wrap", "inline-flex", "grid", "grid-cols-1",
  "grid-cols-2", "grid-cols-3", "grid-cols-4", "grid-cols-12", "hidden", "block",
  "inline-block", "items-center", "items-start", "items-end", "items-stretch",
  "justify-center", "justify-between", "justify-around", "justify-start", "justify-end",
  "gap-1", "gap-2", "gap-3", "gap-4", "gap-6", "gap-8", "space-x-1", "space-x-2",
  "space-x-4", "space-y-1", "space-y-2", "space-y-4",

  // Sizing
  "w-full", "w-auto", "w-screen", "w-1/2", "w-1/3", "w-1/4", "w-10", "w-12", "w-16",
  "h-full", "h-screen", "h-auto", "h-10", "h-12", "h-14", "h-16", "min-h-screen",
  "min-h-full", "max-w-xs", "max-w-sm", "max-w-md", "max-w-lg", "max-w-xl", "max-w-full",

  // Spacing (padding & margin)
  "p-0.5", "p-1", "p-2", "p-3", "p-4", "p-6", "p-8", "px-1", "px-2", "px-3", "px-4",
  "px-6", "py-0.5", "py-1", "py-2", "py-3", "py-4", "m-auto", "mx-auto", "my-auto",
  "mt-1", "mt-2", "mt-4", "mt-6", "mb-1", "mb-2", "mb-4", "mb-6",

  // Typography
  "text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-3xl",
  "font-light", "font-normal", "font-medium", "font-semibold", "font-bold", "font-mono",
  "text-center", "text-left", "text-right", "truncate", "uppercase", "lowercase",
  "capitalize", "tracking-tight", "tracking-wide", "leading-none", "leading-relaxed",

  // Colors
  "text-white", "text-black", "text-neutral-200", "text-neutral-400", "text-neutral-500",
  "text-brand-cyan", "text-emerald-400", "text-rose-400", "text-amber-400", "text-purple-400",
  "bg-white", "bg-black", "bg-surface-100", "bg-surface-200", "bg-surface-300",
  "bg-surface-card", "bg-brand-cyan", "bg-emerald-500", "bg-rose-500", "bg-amber-500",
  "bg-transparent", "bg-opacity-50", "backdrop-blur-md", "backdrop-blur-sm",

  // Borders & Rounded
  "border", "border-t", "border-b", "border-l", "border-r", "border-surface-border",
  "border-neutral-700", "border-brand-cyan", "rounded-none", "rounded-sm", "rounded",
  "rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-full",

  // Effects, Transitions & Interactivity
  "shadow-sm", "shadow-md", "shadow-lg", "shadow-2xl", "transition-all", "transition-colors",
  "transition-transform", "duration-150", "duration-200", "duration-300", "ease-in-out",
  "hover:bg-surface-active", "hover:text-white", "hover:opacity-80", "active:scale-95",
  "cursor-pointer", "select-none", "touch-manipulation", "overflow-hidden", "overflow-x-auto",
  "overflow-y-auto", "no-scrollbar", "shrink-0", "relative", "absolute", "fixed", "inset-0",
  "z-10", "z-20", "z-30", "z-40", "z-50"
].map((cls) => ({
  label: cls,
  type: "property" as const,
  detail: "Tailwind CSS",
  boost: 70,
}));

// ==========================================
// 3. EMMET & HTML EXPANSIONS
// ==========================================
const HTML_SNIPPETS: Completion[] = [
  snippetCompletion(
    '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${1:Document}</title>\n</head>\n<body>\n  ${2}\n</body>\n</html>',
    {
      label: "!",
      type: "snippet",
      detail: "HTML5 Boilerplate Skeleton",
      boost: 100,
    }
  ),
  snippetCompletion(
    '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${1:Document}</title>\n</head>\n<body>\n  ${2}\n</body>\n</html>',
    {
      label: "html:5",
      type: "snippet",
      detail: "HTML5 Boilerplate",
      boost: 100,
    }
  ),
  snippetCompletion('<div className="${1}">\n  ${2}\n</div>', {
    label: "div",
    type: "snippet",
    detail: "<div> container",
    boost: 85,
  }),
  snippetCompletion('<button onClick={${1}} className="${2}">\n  ${3:Click}\n</button>', {
    label: "btn",
    type: "snippet",
    detail: "<button> element",
    boost: 85,
  }),
  snippetCompletion('<input type="${1:text}" placeholder="${2}" className="${3}" />', {
    label: "inp",
    type: "snippet",
    detail: "<input> field",
    boost: 85,
  }),
  snippetCompletion('<a href="${1:#}" className="${2}">\n  ${3:Link}\n</a>', {
    label: "link",
    type: "snippet",
    detail: "<a> anchor link",
    boost: 80,
  }),
  snippetCompletion('<span className="${1}">${2}</span>', {
    label: "span",
    type: "snippet",
    detail: "<span> inline element",
    boost: 80,
  }),
  snippetCompletion('<p className="${1}">${2}</p>', {
    label: "p",
    type: "snippet",
    detail: "<p> paragraph",
    boost: 80,
  }),
  snippetCompletion('<form onSubmit={${1}} className="${2}">\n  ${3}\n</form>', {
    label: "form",
    type: "snippet",
    detail: "<form> container",
    boost: 80,
  }),
  snippetCompletion('<ul className="${1}">\n  <li>${2}</li>\n</ul>', {
    label: "ul",
    type: "snippet",
    detail: "<ul> list",
    boost: 80,
  }),
];

// Common HTML/JSX attributes
const JSX_ATTRIBUTES = [
  "className", "id", "style", "onClick", "onChange", "onSubmit", "value",
  "placeholder", "type", "disabled", "href", "src", "alt", "title", "name",
  "autoFocus", "autoComplete", "tabIndex", "aria-label", "aria-hidden", "role"
].map((attr) => ({
  label: attr,
  type: "keyword" as const,
  detail: "JSX Attribute",
  boost: 75,
}));

// Standard JavaScript globals & keywords
const JS_GLOBALS = [
  "async", "await", "function", "return", "const", "let", "export", "import",
  "default", "from", "if", "else", "switch", "case", "break", "try", "catch",
  "finally", "throw", "new", "typeof", "instanceof", "Promise", "fetch",
  "document", "window", "console", "JSON", "Math", "setTimeout", "setInterval",
  "clearTimeout", "clearInterval", "Object", "Array", "String", "Number", "Boolean"
].map((kw) => ({
  label: kw,
  type: "keyword" as const,
  detail: "JavaScript / TypeScript",
  boost: 60,
}));

// ==========================================
// COMPLETION PROVIDER CREATOR
// ==========================================
interface AutocompletePluginConfig {
  reactSnippets: boolean;
  tailwind: boolean;
  emmet: boolean;
  autoCloseBrackets: boolean;
}

export function createIntelliSenseExtension(config: AutocompletePluginConfig): Extension {
  const customCompleter = (context: CompletionContext): CompletionResult | null => {
    // Match word before cursor
    const word = context.matchBefore(/[\w:!$-]+/);

    if (!word && !context.explicit) return null;

    const from = word ? word.from : context.pos;
    const currentWord = word ? word.text : "";

    // Check if cursor is inside a class="..." or className="..." string for Tailwind suggestions
    const line = context.state.doc.lineAt(context.pos);
    const linePrefix = line.text.slice(0, context.pos - line.from);
    const isInsideClassAttr = /(?:class|className)=["'][^"']*$/.test(linePrefix);

    const completions: Completion[] = [];

    // 1. If inside class/className and Tailwind is enabled, give Tailwind classes priority
    if (isInsideClassAttr && config.tailwind) {
      return {
        from,
        options: TAILWIND_CLASSES,
        filter: true,
      };
    }

    // 2. React Snippets
    if (config.reactSnippets) {
      completions.push(...REACT_SNIPPETS);
    }

    // 3. Emmet & HTML
    if (config.emmet) {
      completions.push(...HTML_SNIPPETS);
      completions.push(...JSX_ATTRIBUTES);
    }

    // 4. General JavaScript / TypeScript keywords
    completions.push(...JS_GLOBALS);

    // 5. Also include Tailwind classes when starting with class-like tokens
    if (config.tailwind && currentWord.length >= 2) {
      completions.push(...TAILWIND_CLASSES);
    }

    return {
      from,
      options: completions,
      filter: true,
    };
  };

  const extensions: Extension[] = [
    autocompletion({
      override: [customCompleter],
      defaultKeymap: true,
      icons: true,
    }),
  ];

  if (config.autoCloseBrackets) {
    extensions.push(closeBrackets());
    extensions.push(keymap.of(closeBracketsKeymap));
  }

  return extensions;
}
