import { create } from "zustand";

type CardModalStore = {
  id?: string;
  workspaceId?: string;
  isOpen: boolean;
  onOpen: (id: string, workspaceId?: string) => void;
  onClose: () => void;
};

export const useCardModal = create<CardModalStore>((set) => ({
  id: undefined,
  isOpen: false,
  onOpen: (id: string, workspaceId?: string) => set({ isOpen: true, id: id, workspaceId: workspaceId }),
  onClose: () => set({ isOpen: false, id: undefined }),
}));
