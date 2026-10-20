import { FileItem } from "../db/indexedDB";
import { calculateStringBytes, formatBytes, normalizePath } from "../utils/formatters";

/**
 * FlickIDE Agentic AI Parser & Execution Module
 *
 * Handles XML action tag extraction (<create_file>, <create_folder>),
 * response tokenization into interactive widgets, and automatic filesystem execution.
 */

export const FLICK_AGENT_SYSTEM_PROMPT = `You are an expert AI software engineer and autonomous agentic coding assistant inside FlickIDE, a modern web and mobile IDE.

You have DIRECT CAPABILITIES to create and manage files and folders in the user's project file system.

### AUTONOMOUS FILE & FOLDER ACTIONS:
When asked to write code, create components, start a project, add features, or generate files/folders, you MUST use the following XML action tags instead of only outputting code in markdown:

1. Creating or Writing a File:
Use the <create_file> tag with the relative file path. Put the complete, production-ready code directly inside the tag:
<create_file path="folder/index.html">
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>App</title>
</head>
<body>
  <h1>Hello FlickIDE</h1>
</body>
</html>
</create_file>

2. Creating a Folder:
Use the <create_folder> tag with the relative folder path:
<create_folder path="new_folder" />

### CRITICAL RULES:
- Relative Paths: Always provide paths relative to the project root (e.g., "index.html", "src/App.tsx", "components/Button.jsx", "styles/theme.css"). Do NOT include leading slashes.
- Raw Code: Put the raw, unescaped code directly inside <create_file>. Do NOT wrap the code in markdown code blocks (\`\`\`) inside the <create_file> tag.
- No Truncation: Provide complete, runnable, production-ready code. Never write placeholders like "// rest of code goes here" or "/* TODO */".
- Multiple Files: You can output multiple <create_file> and <create_folder> tags in a single response when creating full features, components, or projects.
- Conversational Explanations: You may provide brief, helpful explanations before or after the action tags to guide the user on what you built.
- Conceptual Inquiries: For purely theoretical questions (e.g., "Explain how React reconciliation works"), reply using standard markdown without action tags.`;

export type AgentActionType = "create_file" | "create_folder";

export interface AgentFileAction {
  type: "create_file";
  path: string;
  content: string;
}

export interface AgentFolderAction {
  type: "create_folder";
  path: string;
}

export type AgentAction = AgentFileAction | AgentFolderAction;

export interface AgentExecutionResult {
  action: AgentAction;
  success: boolean;
  fullPath: string;
  error?: string;
}

export type MessageSegment =
  | { type: "text"; text: string }
  | { type: "code"; language: string; code: string }
  | { type: "action_file"; path: string; content: string }
  | { type: "action_folder"; path: string };

/**
 * Cleans file content by removing single leading/trailing newlines
 * and stripping inadvertent markdown code block wrappers if present.
 */
export function cleanFileContent(raw: string): string {
  let cleaned = raw.replace(/^\r?\n/, "").replace(/\r?\n$/, "");

  // If the model wrapped the content in markdown backticks anyway
  const codeBlockMatch = cleaned.match(/^```[a-zA-Z0-9_-]*\r?\n([\s\S]*?)\r?\n```$/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1];
  }

  return cleaned;
}

/**
 * Extracts all agent actions (<create_file> and <create_folder>) from a text response.
 */
export function extractAgentActions(rawText: string): AgentAction[] {
  if (!rawText) return [];

  const actions: AgentAction[] = [];

  // Match file and folder tags in the response
  const tagRegex = /(?:<create_file\s+[^>]*?path=["']([^"']+)["'][^>]*>([\s\S]*?)<\/create_file>|<create_folder\s+[^>]*?path=["']([^"']+)["'][^>]*?(?:\/>|>(?:<\/create_folder>)?|\/?>))/gi;

  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(rawText)) !== null) {
    if (match[1] !== undefined) {
      // <create_file path="...">content</create_file>
      const rawPath = match[1].trim();
      const rawContent = match[2] || "";
      const cleanedPath = rawPath.replace(/^\/+/, "").replace(/\\/g, "/");
      const cleanedContent = cleanFileContent(rawContent);

      actions.push({
        type: "create_file",
        path: cleanedPath,
        content: cleanedContent,
      });
    } else if (match[3] !== undefined) {
      // <create_folder path="..." />
      const rawPath = match[3].trim();
      const cleanedPath = rawPath.replace(/^\/+/, "").replace(/\\/g, "/");

      actions.push({
        type: "create_folder",
        path: cleanedPath,
      });
    }
  }

  return actions;
}

/**
 * Parses message text into sequential segments (text, code blocks, file actions, folder actions)
 * so that raw XML tags are hidden and replaced with clean interactive widgets.
 */
export function parseMessageSegments(content: string): MessageSegment[] {
  if (!content) return [];

  interface RawMatch {
    startIndex: number;
    endIndex: number;
    segment: MessageSegment;
  }

  const matches: RawMatch[] = [];

  // 1. Match <create_file path="...">...</create_file>
  const fileRegex = /<create_file\s+[^>]*?path=["']([^"']+)["'][^>]*>([\s\S]*?)<\/create_file>/gi;
  let fileMatch: RegExpExecArray | null;
  while ((fileMatch = fileRegex.exec(content)) !== null) {
    const rawPath = fileMatch[1].trim();
    const rawContent = fileMatch[2] || "";
    matches.push({
      startIndex: fileMatch.index,
      endIndex: fileMatch.index + fileMatch[0].length,
      segment: {
        type: "action_file",
        path: rawPath.replace(/^\/+/, "").replace(/\\/g, "/"),
        content: cleanFileContent(rawContent),
      },
    });
  }

  // 2. Match <create_folder path="..." /> or <create_folder path="..."></create_folder>
  const folderRegex = /<create_folder\s+[^>]*?path=["']([^"']+)["'][^>]*?(?:\/>|>(?:<\/create_folder>)?|\/?>)/gi;
  let folderMatch: RegExpExecArray | null;
  while ((folderMatch = folderRegex.exec(content)) !== null) {
    const rawPath = folderMatch[1].trim();
    matches.push({
      startIndex: folderMatch.index,
      endIndex: folderMatch.index + folderMatch[0].length,
      segment: {
        type: "action_folder",
        path: rawPath.replace(/^\/+/, "").replace(/\\/g, "/"),
      },
    });
  }

  // 3. Match standard markdown code blocks: ```lang\ncode\n```
  const codeRegex = /```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```/g;
  let codeMatch: RegExpExecArray | null;
  while ((codeMatch = codeRegex.exec(content)) !== null) {
    // Only add if not overlapping with an action tag
    const startIndex = codeMatch.index;
    const endIndex = codeMatch.index + codeMatch[0].length;
    const overlaps = matches.some(
      (m) =>
        (startIndex >= m.startIndex && startIndex < m.endIndex) ||
        (endIndex > m.startIndex && endIndex <= m.endIndex) ||
        (startIndex <= m.startIndex && endIndex >= m.endIndex)
    );

    if (!overlaps) {
      matches.push({
        startIndex,
        endIndex,
        segment: {
          type: "code",
          language: codeMatch[1] || "code",
          code: codeMatch[2],
        },
      });
    }
  }

  // Sort matches chronologically by their position in text
  matches.sort((a, b) => a.startIndex - b.startIndex);

  // Build sequential list of segments with interstitial text
  const segments: MessageSegment[] = [];
  let currentIndex = 0;

  for (const item of matches) {
    if (item.startIndex > currentIndex) {
      const textBetween = content.substring(currentIndex, item.startIndex);
      if (textBetween) {
        segments.push({ type: "text", text: textBetween });
      }
    }
    segments.push(item.segment);
    currentIndex = item.endIndex;
  }

  if (currentIndex < content.length) {
    const trailingText = content.substring(currentIndex);
    if (trailingText) {
      segments.push({ type: "text", text: trailingText });
    }
  }

  return segments;
}

/**
 * Strips raw XML action tags from text, returning clean text for logging or summaries.
 */
export function stripAgentTags(rawText: string): string {
  return rawText
    .replace(/<create_file\s+[^>]*?path=["']([^"']+)["'][^>]*>([\s\S]*?)<\/create_file>/gi, "")
    .replace(/<create_folder\s+[^>]*?path=["']([^"']+)["'][^>]*?(?:\/>|>(?:<\/create_folder>)?|\/?>)/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export interface FileSystemStoreHelpers {
  files: Record<string, FileItem>;
  createFile: (name: string, parentPath: string, content?: string) => Promise<string>;
  createFolder: (name: string, parentPath: string) => Promise<string>;
  updateFileContent: (path: string, content: string) => Promise<void>;
  setActiveFile: (path: string) => void;
}

/**
 * Executes a list of parsed agent actions on the FlickIDE filesystem store.
 * Automatically ensures parent folders exist, updates existing files or creates new ones,
 * and sets the active editor file.
 */
export async function executeAgentActions(
  actions: AgentAction[],
  fs: FileSystemStoreHelpers
): Promise<AgentExecutionResult[]> {
  const results: AgentExecutionResult[] = [];

  for (const action of actions) {
    try {
      if (action.type === "create_folder") {
        const normalized = normalizePath(action.path.startsWith("/") ? action.path : `/${action.path}`);
        const parts = normalized.replace(/^\/+/, "").split("/");

        let currentParent = "/";
        let lastCreatedPath = "";

        for (const segment of parts) {
          const currentPath = currentParent === "/" ? `/${segment}` : `${currentParent}/${segment}`;
          if (!fs.files[currentPath]) {
            lastCreatedPath = await fs.createFolder(segment, currentParent);
          } else {
            lastCreatedPath = currentPath;
          }
          currentParent = currentPath;
        }

        results.push({
          action,
          success: true,
          fullPath: lastCreatedPath || normalized,
        });
      } else if (action.type === "create_file") {
        const normalized = normalizePath(action.path.startsWith("/") ? action.path : `/${action.path}`);
        const parts = normalized.replace(/^\/+/, "").split("/");
        const fileName = parts.pop() || "untitled.txt";
        const parentPath = parts.length > 0 ? `/${parts.join("/")}` : "/";

        // Ensure parent directories exist
        let currentParent = "/";
        for (const segment of parts) {
          const dirPath = currentParent === "/" ? `/${segment}` : `${currentParent}/${segment}`;
          if (!fs.files[dirPath]) {
            await fs.createFolder(segment, currentParent);
          }
          currentParent = dirPath;
        }

        const existingFile = fs.files[normalized];
        let finalPath = normalized;

        if (existingFile && existingFile.type === "file") {
          // Update existing file
          await fs.updateFileContent(normalized, action.content);
        } else {
          // Create new file
          finalPath = await fs.createFile(fileName, parentPath, action.content);
        }

        // Set the newly created/updated file as active in the editor
        fs.setActiveFile(finalPath);

        results.push({
          action,
          success: true,
          fullPath: finalPath,
        });
      }
    } catch (err: any) {
      console.error("Agent execution failed for action:", action, err);
      results.push({
        action,
        success: false,
        fullPath: action.path,
        error: err?.message || "Execution error",
      });
    }
  }

  // Trigger gentle tactile feedback if supported
  if (results.some((r) => r.success) && typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(25);
    } catch (_) {}
  }

  return results;
}
