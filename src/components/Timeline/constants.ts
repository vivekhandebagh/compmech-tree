export const YEAR_MIN = 1977;
export const YEAR_MAX = new Date().getFullYear();
export const LEFT_PAD = 32;
export const RIGHT_PAD = 48;
export const ROW_HEIGHT = 54;
export const AXIS_HEIGHT = 36;
export const NODE_RADIUS = 6;
export const NODE_HOVER_RADIUS = 9;
export const LABEL_WIDTH = 264;
export const SIDE_PANEL_WIDTH = 380;

export const ZOOM_LEVELS = {
  compact: 40,
  normal: 80,
  expanded: 160,
} as const;

export type ZoomLevel = keyof typeof ZOOM_LEVELS;
export const DEFAULT_ZOOM: ZoomLevel = "normal";

export function yearToX(year: number, xPerYear: number): number {
  return LEFT_PAD + (year - YEAR_MIN) * xPerYear;
}

export function totalWidth(xPerYear: number): number {
  return LEFT_PAD + (YEAR_MAX - YEAR_MIN) * xPerYear + RIGHT_PAD;
}

export function rowToY(rowIndex: number): number {
  return AXIS_HEIGHT + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
}

export function bodyHeight(rowCount: number): number {
  return AXIS_HEIGHT + rowCount * ROW_HEIGHT;
}
