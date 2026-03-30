import { create } from 'zustand';

const useSliderStore = create((set) => ({
  isOpen: false,
  title: '',
  subtitle: '',
  content: null,
  width: '600px',

  openSlider: ({ title, subtitle = '', content, width = '600px' }) => set({
    isOpen: true,
    title,
    subtitle,
    content,
    width,
  }),

  /** Swap content/title without closing (keeps slider open) */
  updateSlider: (updates) => set((state) => ({
    ...state,
    ...updates,
  })),

  closeSlider: () => set({
    isOpen: false,
    title: '',
    subtitle: '',
    content: null,
    width: '600px',
  }),
}));

export default useSliderStore;
