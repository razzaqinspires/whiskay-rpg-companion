'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useUIStore = create(persist((set) => ({
  editMode: false,
  quality: 'high',
  uiPositions: { joystick: { left: 5, bottom: 4 }, skills: { right: 5, bottom: 4 } },
  setEditMode: (editMode) => set({ editMode }),
  setQuality: (quality) => set({ quality }),
  setPosition: (key, position) => set((state) => ({ uiPositions: { ...state.uiPositions, [key]: { ...state.uiPositions[key], ...position } } })),
  resetUI: () => set({ uiPositions: { joystick: { left: 5, bottom: 4 }, skills: { right: 5, bottom: 4 } } }),
}), { name: 'whiskay-ui-settings-v1', storage: createJSONStorage(() => localStorage), partialize: (state) => ({ quality: state.quality, uiPositions: state.uiPositions }) }));
