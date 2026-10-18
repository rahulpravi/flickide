import { linter, lintGutter, Diagnostic } from "@codemirror/lint";
import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { analyzeFileContent } from "../utils/syntaxChecker";

export function createLinterExtension(filename: string): Extension {
  const fileLinter = linter((view: EditorView) => {
    const doc = view.state.doc;
    const content = doc.toString();
    const result = analyzeFileContent(filename, content);

    const diagnostics: Diagnostic[] = [];

    const allItems = [...result.errors, ...result.warnings];

    for (const item of allItems) {
      const lineNum = Math.min(Math.max(1, item.line), doc.lines);
      const lineObj = doc.line(lineNum);

      let from = lineObj.from;
      if (item.column && item.column > 1) {
        from = Math.min(lineObj.from + item.column - 1, lineObj.to);
      }
      let to = lineObj.to;
      if (from >= to) {
        to = Math.min(from + 1, doc.length);
      }

      diagnostics.push({
        from,
        to,
        severity: item.type === "error" ? "error" : item.type === "warning" ? "warning" : "info",
        message: item.message,
        source: item.source,
      });
    }

    return diagnostics;
  }, { delay: 400 });

  return [fileLinter, lintGutter()];
}
