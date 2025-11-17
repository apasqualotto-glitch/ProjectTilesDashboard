/**
 * Pastel color palette for tiles
 * 8 carefully selected pastel colors
 */
export const PASTEL_COLORS = [
  "#FFB3BA", // Pastel Pink
  "#FFCCCB", // Light Pink
  "#FFFFBA", // Pastel Yellow
  "#BAE1BA", // Pastel Green
  "#BAC7FF", // Pastel Blue
  "#E0BBE4", // Pastel Purple
  "#FFDAB9", // Pastel Peach
  "#B4E7FF", // Pastel Cyan
] as const;

export type PastelColor = typeof PASTEL_COLORS[number];

/**
 * Get the default pastel color
 */
export const DEFAULT_PASTEL_COLOR = PASTEL_COLORS[0]; // Pastel Pink

/**
 * Determine text color based on background brightness
 * Returns black for light backgrounds, white for dark backgrounds
 */
export const getTextColor = (hexColor: string): string => {
  const rgb = parseInt(hexColor.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#ffffff";
};

/**
 * Validate if a color is in the pastel palette
 */
export const isPastelColor = (color: string): color is PastelColor => {
  return PASTEL_COLORS.includes(color as PastelColor);
};

/**
 * Get closest pastel color if provided color is not in palette
 */
const hexToRgb = (hex: string) => {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
};

const colorDistanceSq = (a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }) => {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
};

export const findClosestPastel = (hexColor: string): PastelColor => {
  try {
    const rgb = hexToRgb(hexColor);
  let best: PastelColor = PASTEL_COLORS[0];
  let bestDist = Infinity;
    for (const c of PASTEL_COLORS) {
      const prgb = hexToRgb(c);
      const d = colorDistanceSq(rgb, prgb);
      if (d < bestDist) {
        bestDist = d;
        best = c;
      }
    }
    return best;
  } catch (e) {
    return DEFAULT_PASTEL_COLOR;
  }
};

export const normalizeColor = (color: string): PastelColor => {
  if (!color) return DEFAULT_PASTEL_COLOR;
  if (isPastelColor(color)) return color;
  return findClosestPastel(color);
};
