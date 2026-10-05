export interface DiagnosticItem {
  id: string;
  type: "error" | "warning" | "info";
  message: string;
  line: number;
  column?: number;
  source: string;
}

export interface SyntaxCheckResult {
  errors: DiagnosticItem[];
  warnings: DiagnosticItem[];
  todoCount: number;
  fixmeCount: number;
}

export function analyzeFileContent(filename: string, content: string): SyntaxCheckResult {
  const errors: DiagnosticItem[] = [];
  const warnings: DiagnosticItem[] = [];
  let todoCount = 0;
  let fixmeCount = 0;

  const lines = content.split("\n");

  // 1. Scan for TODOs, FIXMEs, and BUG tags
  lines.forEach((lineText, index) => {
    const lineNum = index + 1;

    const todoMatch = lineText.match(/(?:\/\/|\/\*|#|<!--)\s*(TODO|FIXME|BUG|NOTE):\s*(.+)/i);
    if (todoMatch) {
      const tag = todoMatch[1].toUpperCase();
      const desc = todoMatch[2].replace(/-->|\*\//, "").trim();

      if (tag === "TODO") {
        todoCount++;
        warnings.push({
          id: `todo-${lineNum}`,
          type: "info",
          message: `TODO: ${desc}`,
          line: lineNum,
          source: "Comment Scanner",
        });
      } else if (tag === "FIXME" || tag === "BUG") {
        fixmeCount++;
        warnings.push({
          id: `fixme-${lineNum}`,
          type: "warning",
          message: `${tag}: ${desc}`,
          line: lineNum,
          source: "Comment Scanner",
        });
      }
    }
  });

  // 2. Syntax Validation based on file type
  const ext = filename.split(".").pop()?.toLowerCase();

  if (ext === "json") {
    try {
      JSON.parse(content);
    } catch (err: any) {
      let line = 1;
      const posMatch = err.message.match(/position\s+(\d+)/i);
      if (posMatch) {
        const pos = parseInt(posMatch[1], 10);
        line = content.slice(0, pos).split("\n").length;
      }
      errors.push({
        id: `json-err-${Date.now()}`,
        type: "error",
        message: err.message,
        line,
        source: "JSON Parser",
      });
    }
  } else if (ext === "js" || ext === "jsx" || ext === "mjs") {
    // AST / Syntax check via Function constructor validation
    try {
      // Validates syntax without executing
      new Function(content);
    } catch (err: any) {
      let line = 1;
      // Some engines provide line number in error or stack
      const match = err.stack?.match(/<anonymous>:(\d+):(\d+)/);
      if (match) {
        line = parseInt(match[1], 10);
      }
      errors.push({
        id: `js-err-${Date.now()}`,
        type: "error",
        message: err.message,
        line,
        source: "JavaScript Syntax",
      });
    }

    // Bracket balance check
    const stack: { char: string; line: number }[] = [];
    const pairs: Record<string, string> = { "}": "{", ")": "(", "]": "[" };

    lines.forEach((lineText, idx) => {
      // Ignore strings & comments for basic balance check
      const sanitized = lineText.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, "").replace(/\/\/.*$/, "");
      for (const char of sanitized) {
        if (char === "{" || char === "(" || char === "[") {
          stack.push({ char, line: idx + 1 });
        } else if (char === "}" || char === ")" || char === "]") {
          const expected = pairs[char];
          const last = stack.pop();
          if (!last || last.char !== expected) {
            errors.push({
              id: `bracket-${idx}`,
              type: "error",
              message: `Unmatched closing bracket '${char}'`,
              line: idx + 1,
              source: "Bracket Linter",
            });
          }
        }
      }
    });

    if (stack.length > 0) {
      const unclosed = stack.pop()!;
      errors.push({
        id: `unclosed-bracket-${unclosed.line}`,
        type: "error",
        message: `Unclosed bracket '${unclosed.char}' opened on line ${unclosed.line}`,
        line: unclosed.line,
        source: "Bracket Linter",
      });
    }
  }

  return { errors, warnings, todoCount, fixmeCount };
}
