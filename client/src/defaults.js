/** Classic ROYGBIV stripe colors (pride / belief-sign palette). */
export const ROYGBIV = [
  { name: 'red', hex: '#E40303', text: '#ffffff' },
  { name: 'orange', hex: '#FF8C00', text: '#ffffff' },
  { name: 'yellow', hex: '#FFED00', text: '#1a1a1a' },
  { name: 'green', hex: '#008026', text: '#ffffff' },
  { name: 'blue', hex: '#24408E', text: '#ffffff' },
  { name: 'indigo', hex: '#732982', text: '#ffffff' },
  { name: 'violet', hex: '#9B4F96', text: '#ffffff' },
];

export const DEFAULT_LINES = [
  { text: 'In this house we believe:', color: ROYGBIV[0].text, backgroundColor: ROYGBIV[0].hex },
  { text: 'Love is love', color: ROYGBIV[1].text, backgroundColor: ROYGBIV[1].hex },
  { text: 'Black lives matter', color: ROYGBIV[2].text, backgroundColor: ROYGBIV[2].hex },
  { text: 'Science is real', color: ROYGBIV[3].text, backgroundColor: ROYGBIV[3].hex },
  { text: "Women's rights are human rights", color: ROYGBIV[4].text, backgroundColor: ROYGBIV[4].hex },
  { text: 'No human is illegal', color: ROYGBIV[5].text, backgroundColor: ROYGBIV[5].hex },
  { text: 'Kindness is everything', color: ROYGBIV[6].text, backgroundColor: ROYGBIV[6].hex },
];

/** Plastic yard-sign face default (white corrugated plastic). */
export const DEFAULT_BG = '#ffffff';

export function makeBlankLine(index = 0) {
  const stripe = ROYGBIV[index % ROYGBIV.length];
  return { text: '', color: stripe.text, backgroundColor: stripe.hex };
}
