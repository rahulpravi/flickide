import { openDB, DBSchema, IDBPDatabase } from "idb";
import { calculateStringBytes } from "../utils/formatters";

export interface FileItem {
  path: string; // e.g., "/src/app.js"
  name: string; // e.g., "app.js"
  type: "file" | "folder";
  parentPath: string; // e.g., "/src" or "/"
  content?: string;
  size: number; // in bytes
  createdAt: number;
  updatedAt: number;
  isExpanded?: boolean; // For folders
}

interface FlickIDEDB extends DBSchema {
  files: {
    key: string;
    value: FileItem;
    indexes: {
      "by-parent": string;
      "by-type": string;
    };
  };
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = "flickide_db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<FlickIDEDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<FlickIDEDB>> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB is only accessible in the browser"));
  }

  if (!dbPromise) {
    dbPromise = openDB<FlickIDEDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("files")) {
          const fileStore = db.createObjectStore("files", { keyPath: "path" });
          fileStore.createIndex("by-parent", "parentPath");
          fileStore.createIndex("by-type", "type");
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings");
        }
      },
    });
  }

  return dbPromise;
}

/**
 * Default starter files initialized on first launch
 */
export const DEFAULT_STARTER_FILES: FileItem[] = [
  {
    path: "/src",
    name: "src",
    type: "folder",
    parentPath: "/",
    size: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isExpanded: true,
  },
  {
    path: "/src/index.js",
    name: "index.js",
    type: "file",
    parentPath: "/src",
    content: `// Welcome to FlickIDE - Mobile-First Browser IDE\n\nfunction calculateMetrics(items) {\n  console.log("Analyzing " + items.length + " components...");\n  const sum = items.reduce((acc, val) => acc + val, 0);\n  const average = sum / items.length;\n  return { sum, average };\n}\n\nconst sampleData = [12, 45, 78, 23, 89, 56];\nconst result = calculateMetrics(sampleData);\n\nconsole.log("Calculation Complete:", JSON.stringify(result));\n`,
    size: calculateStringBytes(`// Welcome to FlickIDE - Mobile-First Browser IDE\n\nfunction calculateMetrics(items) {\n  console.log("Analyzing " + items.length + " components...");\n  const sum = items.reduce((acc, val) => acc + val, 0);\n  const average = sum / items.length;\n  return { sum, average };\n}\n\nconst sampleData = [12, 45, 78, 23, 89, 56];\nconst result = calculateMetrics(sampleData);\n\nconsole.log("Calculation Complete:", JSON.stringify(result));\n`),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    path: "/index.html",
    name: "index.html",
    type: "file",
    parentPath: "/",
    content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Flick App</title>\n</head>\n<body>\n  <div id="app">FlickIDE Mobile Sandbox</div>\n</body>\n</html>`,
    size: calculateStringBytes(`<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Flick App</title>\n</head>\n<body>\n  <div id="app">FlickIDE Mobile Sandbox</div>\n</body>\n</html>`),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    path: "/package.json",
    name: "package.json",
    type: "file",
    parentPath: "/",
    content: `{\n  "name": "flick-mobile-project",\n  "version": "1.0.0",\n  "main": "src/index.js",\n  "scripts": {\n    "start": "node src/index.js"\n  }\n}`,
    size: calculateStringBytes(`{\n  "name": "flick-mobile-project",\n  "version": "1.0.0",\n  "main": "src/index.js",\n  "scripts": {\n    "start": "node src/index.js"\n  }\n}`),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    path: "/README.md",
    name: "README.md",
    type: "file",
    parentPath: "/",
    content: `# FlickIDE Mobile Project\n\n- Built for smartphones with touch-first ergonomics.\n- Persistent IndexedDB storage.\n- AI-assisted development with auto-key failover.\n`,
    size: calculateStringBytes(`# FlickIDE Mobile Project\n\n- Built for smartphones with touch-first ergonomics.\n- Persistent IndexedDB storage.\n- AI-assisted development with auto-key failover.\n`),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

/**
 * File System CRUD Operations backed by IndexedDB
 */
export async function getAllFilesFromDB(): Promise<FileItem[]> {
  const db = await getDB();
  const all = await db.getAll("files");
  if (all.length === 0) {
    // Seed initial files
    const tx = db.transaction("files", "readwrite");
    for (const file of DEFAULT_STARTER_FILES) {
      await tx.store.put(file);
    }
    await tx.done;
    return DEFAULT_STARTER_FILES;
  }
  return all;
}

export async function saveFileToDB(file: FileItem): Promise<void> {
  const db = await getDB();
  await db.put("files", file);
}

export async function deleteFileFromDB(path: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("files", "readwrite");
  
  // If it's a folder, delete all children recursively
  const all = await tx.store.getAll();
  const pathsToDelete = all
    .filter((f) => f.path === path || f.path.startsWith(path + "/"))
    .map((f) => f.path);

  for (const p of pathsToDelete) {
    await tx.store.delete(p);
  }
  await tx.done;
}

export async function saveSettingToDB(key: string, value: any): Promise<void> {
  const db = await getDB();
  await db.put("settings", value, key);
}

export async function getSettingFromDB<T = any>(key: string): Promise<T | undefined> {
  const db = await getDB();
  return db.get("settings", key);
}
