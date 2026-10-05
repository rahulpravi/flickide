import { create } from "zustand";

export type NavTab = "files" | "code" | "ai" | "panel";
export type PanelSubTab = "terminal" | "problems" | "debug";

interface UIState {
  activeTab: NavTab;
  panelSubTab: PanelSubTab;
  isNewItemModalOpen: boolean;
  isKeyManagerOpen: boolean;
  newItemType: "file" | "folder";
  newItemParentPath: string;
  isQuickKeyRowVisible: boolean;

  // Actions
  setActiveTab: (tab: NavTab) => void;
  setPanelSubTab: (subTab: PanelSubTab) => void;
  openNewItemModal: (type: "file" | "folder", parentPath?: string) => void;
  closeNewItemModal: () => void;
  setKeyManagerOpen: (open: boolean) => void;
  setQuickKeyRowVisible: (visible: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: "code",
  panelSubTab: "terminal",
  isNewItemModalOpen: false,
  isKeyManagerOpen: false,
  newItemType: "file",
  newItemParentPath: "/",
  isQuickKeyRowVisible: true,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setPanelSubTab: (subTab) => set({ panelSubTab: subTab }),
  openNewItemModal: (type, parentPath = "/") =>
    set({
      isNewItemModalOpen: true,
      newItemType: type,
      newItemParentPath: parentPath,
    }),
  closeNewItemModal: () => set({ isNewItemModalOpen: false }),
  setKeyManagerOpen: (open) => set({ isKeyManagerOpen: open }),
  setQuickKeyRowVisible: (visible) => set({ isQuickKeyRowVisible: visible }),
}));
