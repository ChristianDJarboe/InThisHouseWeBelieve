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

export function stripeLine(text, index = 0, font = 'sans', palette = ROYGBIV) {
  const stripe = palette[index % palette.length];
  return {
    text,
    color: stripe.text,
    backgroundColor: stripe.hex,
    font,
    weight: DEFAULT_WEIGHT,
    letterSpacing: DEFAULT_LETTER_SPACING,
    fontScale: DEFAULT_FONT_SCALE,
    fitWidth: true,
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

/**
 * Classic rainbow poster palette (original reference sign).
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

/** Color-inverted Classic (for white field). */
const CLASSIC_INVERT = [
  { hex: '#000000', weight: 'bold', fontScale: 0.98 },
  { hex: '#0073FF', weight: 'light', fontScale: 1.05 },
  { hex: '#0012FF', weight: 'bold', fontScale: 0.9 },
  { hex: '#FF2B00', weight: 'light', fontScale: 1.0 },
  { hex: '#8300FF', weight: 'light', fontScale: 0.78 },
  { hex: '#00D159', weight: 'light', fontScale: 1.28 },
  { hex: '#000000', weight: 'bold', fontScale: 0.82 },
];

const PALETTE_FAMILY = [
  { hex: '#FFF8F0', weight: 'bold', fontScale: 0.98 },
  { hex: '#F4A261', weight: 'light', fontScale: 1.08 },
  { hex: '#E9C46A', weight: 'bold', fontScale: 0.92 },
  { hex: '#2A9D8F', weight: 'light', fontScale: 1.0 },
  { hex: '#4CC9F0', weight: 'light', fontScale: 1.05 },
  { hex: '#E76F51', weight: 'light', fontScale: 1.12 },
  { hex: '#FFFFFF', weight: 'bold', fontScale: 0.85 },
];
const PALETTE_NEIGHBOR = [
  { hex: '#FFFFFF', weight: 'bold', fontScale: 0.98 },
  { hex: '#90BE6D', weight: 'light', fontScale: 1.1 },
  { hex: '#F9C74F', weight: 'bold', fontScale: 0.95 },
  { hex: '#43AA8B', weight: 'light', fontScale: 1.0 },
  { hex: '#A8DADC', weight: 'light', fontScale: 0.9 },
  { hex: '#F4A261', weight: 'light', fontScale: 1.05 },
  { hex: '#FFFFFF', weight: 'bold', fontScale: 0.85 },
];
const PALETTE_TABLE = [
  { hex: '#FFE8D6', weight: 'bold', fontScale: 0.98 },
  { hex: '#DDB892', weight: 'light', fontScale: 1.05 },
  { hex: '#E9C46A', weight: 'bold', fontScale: 0.95 },
  { hex: '#F4A261', weight: 'light', fontScale: 1.0 },
  { hex: '#E6CCB2', weight: 'light', fontScale: 1.08 },
  { hex: '#FFFFFF', weight: 'bold', fontScale: 0.9 },
  { hex: '#FFD6A5', weight: 'light', fontScale: 1.0 },
];
const PALETTE_HOME = [
  { hex: '#FFFFFF', weight: 'bold', fontScale: 0.98 },
  { hex: '#A8DADC', weight: 'light', fontScale: 1.08 },
  { hex: '#F1FAEE', weight: 'bold', fontScale: 0.95 },
  { hex: '#E63946', weight: 'light', fontScale: 1.05 },
  { hex: '#A8DADC', weight: 'light', fontScale: 1.0 },
  { hex: '#F1FAEE', weight: 'bold', fontScale: 0.88 },
  { hex: '#FFFFFF', weight: 'bold', fontScale: 0.85 },
];
const PALETTE_WORK = [
  { hex: '#F8F9FA', weight: 'bold', fontScale: 0.98 },
  { hex: '#CED4DA', weight: 'light', fontScale: 1.05 },
  { hex: '#4EA8DE', weight: 'bold', fontScale: 0.95 },
  { hex: '#48BFE3', weight: 'light', fontScale: 1.0 },
  { hex: '#56CFE1', weight: 'light', fontScale: 1.08 },
  { hex: '#72EFDD', weight: 'light', fontScale: 1.12 },
  { hex: '#FFFFFF', weight: 'bold', fontScale: 0.85 },
];
const PALETTE_KIDS = [
  { hex: '#FFFFFF', weight: 'bold', fontScale: 0.98 },
  { hex: '#FFADAD', weight: 'light', fontScale: 1.1 },
  { hex: '#FFD6A5', weight: 'bold', fontScale: 0.95 },
  { hex: '#FDFFB6', weight: 'light', fontScale: 1.05 },
  { hex: '#CAFFBF', weight: 'light', fontScale: 1.0 },
  { hex: '#9BF6FF', weight: 'light', fontScale: 1.08 },
  { hex: '#BDB2FF', weight: 'bold', fontScale: 0.9 },
];
const PALETTE_SIMPLE = [
  { hex: '#FFFFFF', weight: 'bold', fontScale: 0.98 },
  { hex: '#B8C0FF', weight: 'light', fontScale: 1.08 },
  { hex: '#C8B6FF', weight: 'bold', fontScale: 0.95 },
  { hex: '#E7C6FF', weight: 'light', fontScale: 1.0 },
  { hex: '#FFD6FF', weight: 'light', fontScale: 1.05 },
  { hex: '#BBD0FF', weight: 'light', fontScale: 1.1 },
  { hex: '#FFFFFF', weight: 'bold', fontScale: 0.85 },
];

const PALETTE_SUNSET = [
  { hex: '#3D0C11', text: '#FFE5D9' },
  { hex: '#D62828', text: '#ffffff' },
  { hex: '#F77F00', text: '#1a1a1a' },
  { hex: '#FCBF49', text: '#1a1a1a' },
  { hex: '#EAE2B7', text: '#1a1a1a' },
];
const PALETTE_OCEAN = [
  { hex: '#03045E', text: '#ffffff' },
  { hex: '#0077B6', text: '#ffffff' },
  { hex: '#00B4D8', text: '#032b3a' },
  { hex: '#90E0EF', text: '#023047' },
];
const PALETTE_CANDY = [
  { hex: '#FF0A54', text: '#ffffff' },
  { hex: '#FF477E', text: '#ffffff' },
  { hex: '#FF5C8A', text: '#1a1a1a' },
  { hex: '#FF85A1', text: '#1a1a1a' },
  { hex: '#FF99AC', text: '#1a1a1a' },
  { hex: '#FBB1BD', text: '#1a1a1a' },
];
const PALETTE_NEWS = [
  { hex: '#111111', text: '#ffffff' },
  { hex: '#F5F5F5', text: '#111111' },
  { hex: '#111111', text: '#ffffff' },
  { hex: '#F5F5F5', text: '#111111' },
  { hex: '#111111', text: '#ffffff' },
];
const PALETTE_MEADOW = [
  { hex: '#1B4332', text: '#ffffff' },
  { hex: '#2D6A4F', text: '#ffffff' },
  { hex: '#40916C', text: '#ffffff' },
  { hex: '#52B788', text: '#081c15' },
  { hex: '#95D5B2', text: '#081c15' },
  { hex: '#D8F3DC', text: '#1b4332' },
];

const PALETTE_FRENCH = [
  { hex: '#0055A4', text: '#ffffff' },
  { hex: '#FFFFFF', text: '#002395' },
  { hex: '#EF4135', text: '#ffffff' },
];

const PALETTE_BLANK = [
  { hex: '#FFFFFF', weight: 'bold', fontScale: 1 },
  { hex: '#FF8C00', weight: 'light', fontScale: 1.1 },
  { hex: '#FFED00', weight: 'bold', fontScale: 1 },
  { hex: '#00D4FF', weight: 'regular', fontScale: 1 },
];

export const TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic',
    blurb: 'The original rainbow poster',
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
    id: 'classic-invert',
    name: 'Classic invert',
    blurb: 'Same lines, white field, inverted colors',
    tone: 'sincere',
    backgroundColor: '#ffffff',
    border: { enabled: true, color: '#000000', width: 3 },
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
      CLASSIC_INVERT,
      'textOnBlack'
    ),
  },
  {
    id: 'french',
    name: 'Tricolore',
    blurb: 'Three stripes. Extremely French priorities.',
    tone: 'funny',
    backgroundColor: '#0055A4',
    border: { enabled: true, color: '#ffffff', width: 3 },
    lines: withPalette(
      [
        'The baguette must travel upright',
        'Butter is a civil right',
        'Lunch deserves two hours',
      ],
      PALETTE_FRENCH,
      'stripes'
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
      ['In this house we believe', '', ''],
      PALETTE_BLANK,
      'textOnBlack'
    ),
  },
  {
    id: 'family',
    name: 'Family first',
    blurb: 'Mild every-Joe household values',
    tone: 'sincere',
    backgroundColor: '#1a120b',
    border: { enabled: true, color: '#f4e6d4', width: 3 },
    lines: withPalette(
      [
        'In this house we believe',
        'Family comes first',
        'Kindness is everything',
        'Hard work matters',
        'We take care of each other',
      ],
      PALETTE_FAMILY,
      'textOnBlack'
    ),
  },
  {
    id: 'neighbor',
    name: 'Good neighbor',
    blurb: 'Wave, share tools, keep it civil',
    tone: 'sincere',
    backgroundColor: '#0d1f17',
    border: { enabled: true, color: '#90be6d', width: 3 },
    lines: withPalette(
      [
        'In this house we believe',
        'Wave to your neighbors',
        'Return what you borrow',
        'Keep the noise down after nine',
        'A handshake still matters',
        'This street is a community',
      ],
      PALETTE_NEIGHBOR,
      'textOnBlack'
    ),
  },
  {
    id: 'table',
    name: 'Dinner table',
    blurb: 'Phones down, pass the potatoes',
    tone: 'sincere',
    backgroundColor: '#2b1810',
    border: { enabled: true, color: '#ddb892', width: 3 },
    lines: withPalette(
      [
        'In this house we believe',
        'Dinner is better together',
        'Phones stay off the table',
        'Somebody has to do the dishes',
      ],
      PALETTE_TABLE,
      'textOnBlack'
    ),
  },
  {
    id: 'home',
    name: 'Home base',
    blurb: 'Wipe your feet, love the dog',
    tone: 'sincere',
    backgroundColor: '#0f172a',
    border: { enabled: true, color: '#a8dadc', width: 3 },
    lines: withPalette(
      [
        'In this house we believe',
        'Wipe your feet',
        'The dog is family',
        'Home should feel safe',
        'You are always welcome here',
      ],
      PALETTE_HOME,
      'textOnBlack'
    ),
  },
  {
    id: 'work',
    name: 'Show up',
    blurb: 'Clock in, do your best, go home',
    tone: 'sincere',
    backgroundColor: '#111827',
    border: { enabled: true, color: '#4ea8de', width: 3 },
    lines: withPalette(
      [
        'In this house we believe',
        'Show up on time',
        'Do the work',
        'Ask for help when you need it',
        'Rest is part of the plan',
        'Tomorrow we try again',
      ],
      PALETTE_WORK,
      'textOnBlack'
    ),
  },
  {
    id: 'kids',
    name: 'Raising kids',
    blurb: 'Bedtime, manners, outdoor time',
    tone: 'sincere',
    backgroundColor: '#1a1025',
    border: { enabled: true, color: '#bdb2ff', width: 3 },
    lines: withPalette(
      [
        'In this house we believe',
        'Bedtime is bedtime',
        'Outside time counts',
        'Hugs fix a lot',
      ],
      PALETTE_KIDS,
      'textOnBlack'
    ),
  },
  {
    id: 'simple',
    name: 'Keep it simple',
    blurb: 'Coffee, gratitude, no drama',
    tone: 'sincere',
    backgroundColor: '#1b1030',
    border: { enabled: true, color: '#c8b6ff', width: 3 },
    lines: withPalette(
      [
        'In this house we believe',
        'Coffee first',
        'Count your blessings',
        'Small wins count',
        'Be decent',
      ],
      PALETTE_SIMPLE,
      'textOnBlack'
    ),
  },
  {
    id: 'rainbow',
    name: 'Rainbow bands',
    blurb: 'ROYGBIV stripes, everyday creed',
    tone: 'sincere',
    backgroundColor: '#E40303',
    border: { enabled: true, color: '#ffffff', width: 3 },
    lines: withPalette(
      [
        'In this house we believe',
        'Say please and thank you',
        'Share the good snacks',
        'Apologies should be real',
        'Outside time counts',
        'Call your people back',
        'Be decent',
      ],
      ROYGBIV,
      'stripes'
    ),
  },
  {
    id: 'sunset',
    name: 'Sunset bands',
    blurb: 'Warm stripes, porch energy',
    tone: 'sincere',
    backgroundColor: '#3D0C11',
    border: { enabled: true, color: '#EAE2B7', width: 3 },
    lines: withPalette(
      [
        'In this house we believe',
        'Porch time is sacred',
        'Leftovers deserve respect',
        'Sunsets beat screens',
        'Come inside when the bugs win',
      ],
      PALETTE_SUNSET,
      'stripes'
    ),
  },
  {
    id: 'ocean',
    name: 'Ocean bands',
    blurb: 'Blue stripes, calm priorities',
    tone: 'sincere',
    backgroundColor: '#03045E',
    border: { enabled: true, color: '#90E0EF', width: 3 },
    lines: withPalette(
      [
        'In this house we believe',
        'Take the long way home',
        'Salt air fixes attitudes',
        'Towels belong on hooks',
      ],
      PALETTE_OCEAN,
      'stripes'
    ),
  },
  {
    id: 'candy',
    name: 'Candy bands',
    blurb: 'Pink stripes, soft rules',
    tone: 'funny',
    backgroundColor: '#FF0A54',
    border: { enabled: true, color: '#ffffff', width: 3 },
    lines: withPalette(
      [
        'In this house we believe',
        'Dessert can be breakfast',
        'Sprinkles are a food group',
        'Sharing is non-negotiable',
        'Nap after sugar crashes',
        'Hugs fix a lot',
      ],
      PALETTE_CANDY,
      'stripes'
    ),
  },
  {
    id: 'news',
    name: 'Newsprint',
    blurb: 'Black and white stripes',
    tone: 'sincere',
    backgroundColor: '#111111',
    border: { enabled: true, color: '#ffffff', width: 3 },
    lines: withPalette(
      [
        'In this house we believe',
        'Read past the headline',
        'Facts before feelings',
        'Quiet mornings matter',
        'Coffee first then opinions',
      ],
      PALETTE_NEWS,
      'stripes'
    ),
  },
  {
    id: 'meadow',
    name: 'Meadow bands',
    blurb: 'Green stripes, garden creed',
    tone: 'sincere',
    backgroundColor: '#1B4332',
    border: { enabled: true, color: '#D8F3DC', width: 3 },
    lines: withPalette(
      [
        'In this house we believe',
        'Dirt under nails is fine',
        'Water the plants',
        'Tomatoes get the sunny spot',
        'Weeds are a lifestyle',
        'Bring zucchini to neighbors',
      ],
      PALETTE_MEADOW,
      'stripes'
    ),
  },

];

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
