import { create } from 'zustand';

const useSliderStore = create((set) => ({
  isOpen: false,
  title: '',
  content: null,
  width: '600px',

  openSlider: ({ title, content, width = '600px' }) => set({
    isOpen: true,
    title,
    content,
    width,
  }),

  closeSlider: () => set({
    isOpen: false,
    title: '',
    content: null,
    width: '600px',
  }),
}));

export default useSliderStore;
