export const YEAR_MIN = 1980;
export const YEAR_MAX = new Date().getFullYear();
export const X_PER_YEAR = 80;
export const LEFT_PAD = 32;
export const RIGHT_PAD = 48;
export const ROW_HEIGHT = 54;
export const AXIS_HEIGHT = 36;
export const NODE_RADIUS = 6;
export const NODE_HOVER_RADIUS = 9;
export const LABEL_WIDTH = 220;
export const SIDE_PANEL_WIDTH = 380;

export function yearToX(year: number): number {
  return LEFT_PAD + (year - YEAR_MIN) * X_PER_YEAR;
}

export function totalWidth(): number {
  return LEFT_PAD + (YEAR_MAX - YEAR_MIN) * X_PER_YEAR + RIGHT_PAD;
}

export function rowToY(rowIndex: number): number {
  return AXIS_HEIGHT + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
}

export function bodyHeight(rowCount: number): number {
  return AXIS_HEIGHT + rowCount * ROW_HEIGHT;
}
