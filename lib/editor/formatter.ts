import * as prettier from "prettier/standalone";
import * as parserBabel from "prettier/plugins/babel";
import * as parserEstree from "prettier/plugins/estree";
import * as parserHtml from "prettier/plugins/html";
import * as parserPostcss from "prettier/plugins/postcss";

export interface FormatResult {
  success: boolean;
  formatted?: string;
  error?: string;
}

export async function formatCode(filename: string, content: string): Promise<FormatResult> {
  const ext = filename.split(".").pop()?.toLowerCase() || "";

  try {
    let parser = "babel";
    const plugins: any[] = [parserBabel, parserEstree];

    if (ext === "json") {
      parser = "json";
    } else if (ext === "html" || ext === "htm") {
      parser = "html";
      plugins.push(parserHtml);
    } else if (ext === "css" || ext === "scss") {
      parser = "css";
      plugins.push(parserPostcss);
    } else if (ext === "ts" || ext === "tsx") {
      parser = "babel-ts";
    } else {
      parser = "babel";
    }

    const formatted = await prettier.format(content, {
      parser,
      plugins,
      semi: true,
      singleQuote: false,
      tabWidth: 2,
      trailingComma: "es5",
      bracketSpacing: true,
    });

    return { success: true, formatted };
  } catch (err: any) {
    // If Prettier fails (e.g., partial invalid code during editing), provide a helpful message
    console.warn("Prettier format failed:", err);
    return {
      success: false,
      error: err?.message || "Failed to format code. Check for syntax errors.",
    };
  }
}
