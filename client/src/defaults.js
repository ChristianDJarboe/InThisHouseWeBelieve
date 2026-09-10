import { DEFAULT_FONT } from './fonts.js';

/** Classic rainbow stripe colors (also used for blank-line defaults when striping). */
export const ROYGBIV = [
  { name: 'red', hex: '#E40303', text: '#ffffff' },
  { name: 'orange', hex: '#FF8C00', text: '#ffffff' },
  { name: 'yellow', hex: '#FFED00', text: '#1a1a1a' },
  { name: 'green', hex: '#008026', text: '#ffffff' },
  { name: 'blue', hex: '#24408E', text: '#ffffff' },
  { name: 'indigo', hex: '#732982', text: '#ffffff' },
  { name: 'violet', hex: '#9B4F96', text: '#ffffff' },
];

export const MAX_LINES = 10;
export const MIN_LINES = 1;

export const DEFAULT_BG = '#000000';

export const WEIGHT_OPTIONS = [
  { id: 'light', label: 'Light', css: 300, canvas: '300' },
  { id: 'regular', label: 'Regular', css: 400, canvas: '400' },
  { id: 'bold', label: 'Bold', css: 700, canvas: 'bold' },
  { id: 'black', label: 'Black', css: 900, canvas: '900' },
];

export const DEFAULT_WEIGHT = 'bold';
export const DEFAULT_LETTER_SPACING = -0.04; // em — tight like the reference
export const DEFAULT_FONT_SCALE = 1;
export const DEFAULT_FIT_WIDTH = true;

export const DEFAULT_BORDER = {
  enabled: true,
  color: '#ffffff',
  width: 3, // preview px; print scales up
};

export function getWeight(id) {
  return WEIGHT_OPTIONS.find((w) => w.id === id) || WEIGHT_OPTIONS[2];
}

export function stripeLine(text, index = 0, font = DEFAULT_FONT, palette = ROYGBIV) {
  const stripe = palette[index % palette.length];
  return {
    text,
    color: stripe.text,
    backgroundColor: stripe.hex,
    font,
    weight: DEFAULT_WEIGHT,
    letterSpacing: DEFAULT_LETTER_SPACING,
    fontScale: DEFAULT_FONT_SCALE,
    fitWidth: false,
  };
}

export function makeBlankLine(index = 0) {
  return {
    text: '',
    color: '#ffffff',
    backgroundColor: 'transparent',
    font: 'sans',
    weight: DEFAULT_WEIGHT,
    letterSpacing: DEFAULT_LETTER_SPACING,
    fontScale: DEFAULT_FONT_SCALE,
    fitWidth: DEFAULT_FIT_WIDTH,
  };
}

function withPalette(texts, palette, mode = 'stripes') {
  return texts.map((text, i) => {
    if (mode === 'textOnBlack') {
      const c = palette[i % palette.length];
      return {
        text,
        color: c.hex,
        backgroundColor: 'transparent',
        font: 'sans',
        weight: c.weight || DEFAULT_WEIGHT,
        letterSpacing: DEFAULT_LETTER_SPACING,
        fontScale: c.fontScale || 1,
        fitWidth: true,
      };
    }
    return stripeLine(text, i, DEFAULT_FONT, palette);
  });
}

/** Soft sunset for family etc. */
/** Soft warm golds & creams on black */
const PALETTE_FAMILY = [
  { hex: '#FFF8F0', weight: 'bold', fontScale: 0.98 },
  { hex: '#F4A261', weight: 'light', fontScale: 1.05 },
  { hex: '#E9C46A', weight: 'bold', fontScale: 0.9 },
  { hex: '#E76F51', weight: 'light', fontScale: 1.0 },
  { hex: '#2A9D8F', weight: 'light', fontScale: 0.85 },
  { hex: '#FFFFFF', weight: 'bold', fontScale: 0.82 },
];

/** Neon snack-aisle energy */
const PALETTE_SNACKS = [
  { hex: '#FFFFFF', weight: 'bold', fontScale: 0.98 },
  { hex: '#FF2E63', weight: 'light', fontScale: 1.05 },
  { hex: '#08D9D6', weight: 'bold', fontScale: 0.95 },
  { hex: '#FFE66D', weight: 'light', fontScale: 1.05 },
  { hex: '#FF9FF3', weight: 'light', fontScale: 0.88 },
  { hex: '#54A0FF', weight: 'bold', fontScale: 0.82 },
];

/** Newspaper / red-black editorial */
const PALETTE_META = [
  { hex: '#F5F5F5', weight: 'bold', fontScale: 0.98 },
  { hex: '#C1121F', weight: 'light', fontScale: 1.05 },
  { hex: '#DEE2E6', weight: 'bold', fontScale: 0.88 },
  { hex: '#ADB5BD', weight: 'light', fontScale: 0.95 },
  { hex: '#FF6B6B', weight: 'light', fontScale: 0.85 },
  { hex: '#FFFFFF', weight: 'bold', fontScale: 0.82 },
];

/** Matrix green / cyber pink */
const PALETTE_FAKE = [
  { hex: '#39FF14', weight: 'bold', fontScale: 0.98 },
  { hex: '#00F5FF', weight: 'light', fontScale: 1.05 },
  { hex: '#FF6EC7', weight: 'bold', fontScale: 0.9 },
  { hex: '#FFE66D', weight: 'light', fontScale: 1.0 },
  { hex: '#FF9F1C', weight: 'light', fontScale: 0.88 },
  { hex: '#EAEAEA', weight: 'bold', fontScale: 0.82 },
];

/** Caution yellow / hazard orange */
const PALETTE_UNHINGED = [
  { hex: '#FFD600', weight: 'bold', fontScale: 0.98 },
  { hex: '#FFFFFF', weight: 'light', fontScale: 1.15 },
  { hex: '#FF6D00', weight: 'bold', fontScale: 0.88 },
  { hex: '#FFD600', weight: 'light', fontScale: 0.95 },
  { hex: '#FF5252', weight: 'light', fontScale: 0.82 },
  { hex: '#FFFFFF', weight: 'bold', fontScale: 0.78 },
  { hex: '#FFD600', weight: 'bold', fontScale: 1.1 },
];

/** Cool steel / teal discourse */
const PALETTE_PROBLEMATIC = [
  { hex: '#E8F1F2', weight: 'bold', fontScale: 0.98 },
  { hex: '#5BC0BE', weight: 'light', fontScale: 1.05 },
  { hex: '#9DB4C0', weight: 'bold', fontScale: 0.88 },
  { hex: '#FFFFFF', weight: 'light', fontScale: 0.95 },
  { hex: '#5BC0BE', weight: 'light', fontScale: 0.85 },
  { hex: '#A0AEC0', weight: 'bold', fontScale: 0.8 },
  { hex: '#E8F1F2', weight: 'bold', fontScale: 1.05 },
];

/** Soft lilac / cream blank starter */
const PALETTE_BLANK = [
  { hex: '#FFFFFF', weight: 'bold', fontScale: 1 },
  { hex: '#C4B5FD', weight: 'light', fontScale: 1.1 },
  { hex: '#FDE68A', weight: 'bold', fontScale: 1 },
  { hex: '#67E8F9', weight: 'regular', fontScale: 1 },
];

/**
 * Classic "poster" palette — text colors on black (matches reference sign).
 * Order matches the popular black yard-sign layout.
 */
const CLASSIC_POSTER = [
  { hex: '#FFFFFF', weight: 'bold', fontScale: 0.98 },
  { hex: '#FF8C00', weight: 'light', fontScale: 1.05 },
  { hex: '#FFED00', weight: 'bold', fontScale: 0.9 },
  { hex: '#00D4FF', weight: 'light', fontScale: 1.0 },
  { hex: '#7CFF00', weight: 'light', fontScale: 0.78 },
  { hex: '#FF2EA6', weight: 'light', fontScale: 1.28 },
  { hex: '#FFFFFF', weight: 'bold', fontScale: 0.82 },
];

export const TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic',
    blurb: 'Black poster with rainbow type',
    tone: 'sincere',
    backgroundColor: '#000000',
    border: { enabled: true, color: '#ffffff', width: 3 },
    lines: withPalette(
      [
        'In this house we believe',
        'Black lives matter',
        "Women's rights are human rights",
        'No human is illegal',
        'Science is real',
        'Love is love',
        'Kindness is everything',
      ],
      CLASSIC_POSTER,
      'textOnBlack'
    ),
  },
  {
    id: 'family',
    name: 'Family',
    blurb: 'Warm home values, classic poster look',
    tone: 'sincere',
    backgroundColor: '#000000',
    border: { enabled: true, color: '#ffffff', width: 3 },
    lines: withPalette(
      [
        'In this house we believe',
        'Family comes first',
        'Hard work matters',
        'Be kind anyway',
        'Everyone belongs at this table',
        'We leave things better than we found them',
      ],
      PALETTE_FAMILY,
      'textOnBlack'
    ),
  },
  {
    id: 'blank',
    name: 'Blank',
    blurb: 'Black poster, start from scratch',
    tone: 'neutral',
    backgroundColor: '#000000',
    border: { enabled: true, color: '#ffffff', width: 3 },
    lines: withPalette(
      [
        'In this house we believe',
        '',
        '',
        '',
      ],
      PALETTE_BLANK,
      'textOnBlack'
    ),
  },
  {
    id: 'snacks',
    name: 'Chaotic good',
    blurb: 'Honest household priorities, classic look',
    tone: 'funny',
    backgroundColor: '#000000',
    border: { enabled: true, color: '#ffffff', width: 3 },
    lines: withPalette(
      [
        'In this house we believe',
        'Snacks are a human right',
        'The dog votes',
        'Sleep is optional',
        'Pineapple on pizza is fine',
        'We do not share chargers',
      ],
      PALETTE_SNACKS,
      'textOnBlack'
    ),
  },
  {
    id: 'meta',
    name: 'Meta',
    blurb: 'A sign about signs, classic look',
    tone: 'ironic',
    backgroundColor: '#000000',
    border: { enabled: true, color: '#ffffff', width: 3 },
    lines: withPalette(
      [
        'In this house we believe',
        'Yard signs change nothing',
        'But they look great from the street',
        'Virtue is easier in all caps',
        'This message was custom-ordered',
        'Please clap',
      ],
      PALETTE_META,
      'textOnBlack'
    ),
  },
  {
    id: 'fake-virtue',
    name: 'Fake virtue',
    blurb: 'Joke values, classic poster look',
    tone: 'ironic',
    backgroundColor: '#000000',
    border: { enabled: true, color: '#ffffff', width: 3 },
    lines: withPalette(
      [
        'In this house we believe',
        'Hot takes are a personality',
        'Nuance is cancelled',
        'My neighbor is wrong',
        'I read the headline',
        'That counts as research',
      ],
      PALETTE_FAKE,
      'textOnBlack'
    ),
  },
  {
    id: 'unhinged',
    name: 'Unhinged',
    blurb: 'Borderline. Your lawn, your problem.',
    tone: 'spicy',
    backgroundColor: '#000000',
    border: { enabled: true, color: '#ffffff', width: 3 },
    lines: withPalette(
      [
        'In this house we believe',
        'Touch grass',
        'Your opinion is invalid after 9pm',
        'We gatekeep this driveway',
        'Therapy is expensive so we yell',
        'If you can read this you are too close',
        'Go home',
      ],
      PALETTE_UNHINGED,
      'textOnBlack'
    ),
  },
  {
    id: 'problematic',
    name: 'Problematic',
    blurb: 'Satire with teeth - not for everyone',
    tone: 'spicy',
    backgroundColor: '#000000',
    border: { enabled: true, color: '#ffffff', width: 3 },
    lines: withPalette(
      [
        'In this house we believe',
        'Feelings are not facts',
        'Your trauma is not a personality',
        'Nobody cares about your brand',
        'Being loud is not being right',
        'We will not be attending the discourse',
        'Mind your business',
      ],
      PALETTE_PROBLEMATIC,
      'textOnBlack'
    ),
  },
];


/**
 * Auto size/weight custom lines to mimic Classic poster rhythm:
 * short copy gets bigger + lighter; long copy gets smaller + heavier.
 */
export function reflowPosterLines(lines) {
  const list = Array.isArray(lines) ? lines : [];
  const lengths = list.map((l) => Math.max(String(l?.text || '').trim().length, 0));
  const present = lengths.filter((n) => n > 0);
  const avg = present.length
    ? present.reduce((a, b) => a + b, 0) / present.length
    : 18;

  return list.map((line) => {
    const text = String(line?.text || '').trim();
    if (!text) {
      return {
        ...line,
        fitWidth: true,
        letterSpacing: DEFAULT_LETTER_SPACING,
        fontScale: 1,
      };
    }
    const len = text.length;
    let fontScale = Math.pow(avg / len, 0.92) * 1.08;
    fontScale = Math.min(1.35, Math.max(0.68, fontScale));

    let weight = 'bold';
    if (len <= 16) weight = 'light';
    else if (len <= 26) weight = 'regular';
    else weight = 'bold';

    return {
      ...line,
      fitWidth: true,
      letterSpacing: DEFAULT_LETTER_SPACING,
      fontScale,
      weight,
      font: line.font || 'sans',
    };
  });
}

export const DEFAULT_LINES = reflowPosterLines(TEMPLATES[0].lines.map((l) => ({ ...l })));
