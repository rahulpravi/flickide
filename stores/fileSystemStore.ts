import { create } from "zustand";
import {
  FileItem,
  getAllFilesFromDB,
  saveFileToDB,
  deleteFileFromDB,
} from "../lib/db/indexedDB";
import { calculateStringBytes, normalizePath } from "../lib/utils/formatters";

interface FileSystemState {
  files: Record<string, FileItem>;
  activeFilePath: string | null;
  openFilePaths: string[];
  expandedFolders: Record<string, boolean>;
  isInitialized: boolean;
  isSaving: boolean;
  cursorPosition: { line: number; col: number };

  // Actions
  initFileSystem: () => Promise<void>;
  setActiveFile: (path: string) => void;
  closeFile: (path: string) => void;
  createFile: (name: string, parentPath: string, content?: string) => Promise<string>;
  createFolder: (name: string, parentPath: string) => Promise<string>;
  deleteItem: (path: string) => Promise<void>;
  updateFileContent: (path: string, content: string) => Promise<void>;
  toggleFolder: (path: string) => void;
  uploadFiles: (files: FileList | File[], targetParentPath?: string) => Promise<void>;
  setCursorPosition: (line: number, col: number) => void;
  getFolderSize: (folderPath: string) => number;
}

export const useFileSystemStore = create<FileSystemState>((set, get) => ({
  files: {},
  activeFilePath: null,
  openFilePaths: [],
  expandedFolders: { "/": true, "/src": true },
  isInitialized: false,
  isSaving: false,
  cursorPosition: { line: 1, col: 1 },

  initFileSystem: async () => {
    try {
      const items = await getAllFilesFromDB();
      const filesMap: Record<string, FileItem> = {};
      items.forEach((item) => {
        filesMap[item.path] = item;
      });

      const initialActive = filesMap["/src/index.js"]
        ? "/src/index.js"
        : items.find((i) => i.type === "file")?.path || null;

      set({
        files: filesMap,
        activeFilePath: initialActive,
        openFilePaths: initialActive ? [initialActive] : [],
        isInitialized: true,
      });
    } catch (err) {
      console.error("Failed to initialize file system from IndexedDB:", err);
    }
  },

  setActiveFile: (path: string) => {
    const { files, openFilePaths } = get();
    if (!files[path] || files[path].type !== "file") return;

    set({
      activeFilePath: path,
      openFilePaths: openFilePaths.includes(path)
        ? openFilePaths
        : [...openFilePaths, path],
    });
  },

  closeFile: (path: string) => {
    const { openFilePaths, activeFilePath } = get();
    const newOpenPaths = openFilePaths.filter((p) => p !== path);
    let newActive = activeFilePath;

    if (activeFilePath === path) {
      newActive = newOpenPaths.length > 0 ? newOpenPaths[newOpenPaths.length - 1] : null;
    }

    set({
      openFilePaths: newOpenPaths,
      activeFilePath: newActive,
    });
  },

  createFile: async (name: string, parentPath: string, content: string = "") => {
    const cleanParent = parentPath === "/" ? "" : normalizePath(parentPath);
    const fullPath = normalizePath(`${cleanParent}/${name}`);
    const size = calculateStringBytes(content);

    const newFile: FileItem = {
      path: fullPath,
      name,
      type: "file",
      parentPath: parentPath || "/",
      content,
      size,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await saveFileToDB(newFile);

    set((state) => ({
      files: { ...state.files, [fullPath]: newFile },
      activeFilePath: fullPath,
      openFilePaths: state.openFilePaths.includes(fullPath)
        ? state.openFilePaths
        : [...state.openFilePaths, fullPath],
    }));

    return fullPath;
  },

  createFolder: async (name: string, parentPath: string) => {
    const cleanParent = parentPath === "/" ? "" : normalizePath(parentPath);
    const fullPath = normalizePath(`${cleanParent}/${name}`);

    const newFolder: FileItem = {
      path: fullPath,
      name,
      type: "folder",
      parentPath: parentPath || "/",
      size: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isExpanded: true,
    };

    await saveFileToDB(newFolder);

    set((state) => ({
      files: { ...state.files, [fullPath]: newFolder },
      expandedFolders: { ...state.expandedFolders, [fullPath]: true },
    }));

    return fullPath;
  },

  deleteItem: async (path: string) => {
    await deleteFileFromDB(path);

    set((state) => {
      const newFiles = { ...state.files };
      Object.keys(newFiles).forEach((p) => {
        if (p === path || p.startsWith(path + "/")) {
          delete newFiles[p];
        }
      });

      const newOpenPaths = state.openFilePaths.filter(
        (p) => p !== path && !p.startsWith(path + "/")
      );

      let newActive = state.activeFilePath;
      if (
        state.activeFilePath === path ||
        (state.activeFilePath && state.activeFilePath.startsWith(path + "/"))
      ) {
        newActive = newOpenPaths.length > 0 ? newOpenPaths[0] : null;
      }

      return {
        files: newFiles,
        openFilePaths: newOpenPaths,
        activeFilePath: newActive,
      };
    });
  },

  updateFileContent: async (path: string, content: string) => {
    const { files } = get();
    const existing = files[path];
    if (!existing || existing.type !== "file") return;

    const size = calculateStringBytes(content);
    const updated: FileItem = {
      ...existing,
      content,
      size,
      updatedAt: Date.now(),
    };

    set((state) => ({
      files: { ...state.files, [path]: updated },
      isSaving: true,
    }));

    try {
      await saveFileToDB(updated);
    } finally {
      setTimeout(() => {
        set({ isSaving: false });
      }, 400);
    }
  },

  toggleFolder: (path: string) => {
    set((state) => ({
      expandedFolders: {
        ...state.expandedFolders,
        [path]: !state.expandedFolders[path],
      },
    }));
  },

  uploadFiles: async (fileList: FileList | File[], targetParentPath: string = "/") => {
    const list = Array.from(fileList);
    const updates: FileItem[] = [];

    for (const file of list) {
      const content = await file.text();
      const parent = targetParentPath === "/" ? "" : targetParentPath;
      const fullPath = normalizePath(`${parent}/${file.name}`);
      const item: FileItem = {
        path: fullPath,
        name: file.name,
        type: "file",
        parentPath: targetParentPath,
        content,
        size: file.size || calculateStringBytes(content),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await saveFileToDB(item);
      updates.push(item);
    }

    set((state) => {
      const newFiles = { ...state.files };
      updates.forEach((item) => {
        newFiles[item.path] = item;
      });
      return {
        files: newFiles,
        activeFilePath: updates[0]?.path || state.activeFilePath,
      };
    });
  },

  setCursorPosition: (line: number, col: number) => {
    set({ cursorPosition: { line, col } });
  },

  getFolderSize: (folderPath: string) => {
    const { files } = get();
    return Object.values(files)
      .filter(
        (f) =>
          f.type === "file" &&
          (f.parentPath === folderPath || f.path.startsWith(folderPath + "/"))
      )
      .reduce((sum, f) => sum + (f.size || 0), 0);
  },
}));
