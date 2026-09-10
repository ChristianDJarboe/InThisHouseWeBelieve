/** Curated fonts for per-line styling (preview + print). */
export const FONT_OPTIONS = [
  {
    id: 'serif',
    label: 'Classic Serif',
    css: '"Cormorant Garamond", Georgia, serif',
    canvas: 'Georgia',
  },
  {
    id: 'sans',
    label: 'Clean Sans',
    css: '"Source Sans 3", Arial, sans-serif',
    canvas: 'Arial',
  },
  {
    id: 'impact',
    label: 'Bold Impact',
    css: 'Impact, "Arial Black", sans-serif',
    canvas: 'Impact',
  },
  {
    id: 'condensed',
    label: 'Condensed',
    css: 'Oswald, "Arial Narrow", sans-serif',
    canvas: 'Arial Narrow',
  },
  {
    id: 'slab',
    label: 'Slab Serif',
    css: '"Roboto Slab", "Rockwell", serif',
    canvas: 'Georgia',
  },
  {
    id: 'mono',
    label: 'Typewriter',
    css: '"Space Mono", "Courier New", monospace',
    canvas: 'Courier New',
  },
  {
    id: 'script',
    label: 'Script',
    css: '"Pacifico", "Segoe Script", cursive',
    canvas: 'Segoe Script',
  },
  {
    id: 'comic',
    label: 'Comic',
    css: '"Comic Neue", "Comic Sans MS", cursive',
    canvas: 'Comic Sans MS',
  },
];

export const DEFAULT_FONT = 'serif';

export function getFont(id) {
  return FONT_OPTIONS.find((f) => f.id === id) || FONT_OPTIONS[0];
}
