import create from "zustand";

export const useProjectStore = create(set => ({
  annotations: [],
  setAnnotations: (a) => set({ annotations: a }),
  pushAnnotation: (a) => set(state => ({ annotations: [...state.annotations, a] }))
}));
