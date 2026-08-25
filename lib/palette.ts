/**
 * Every colour the figure uses, in two themes.
 *
 * The studio runs dark and the reading surfaces run light. That is not
 * decoration: a working muscle is meant to glow, and bloom is invisible on
 * white. On a dark ground salience comes from brightness, on a light ground it
 * comes from saturation — so each theme gets its own ramp rather than one ramp
 * bent to cover both.
 */

export type Theme = "light" | "dark";

type Skin = {
  bodyNear: string;
  bodyFar: string;
  head: string;
  face: string;
  muscleEdge: string;
  muscleEdgeFocus: string;
  muscleInert: string;
  ground: string;
  shadow: string;
  shadowOpacity: number;
  glow: string;
  glowStrength: number;
  barPlate: string;
  barPlateEdge: string;
  barInner: string;
  barSleeve: string;
  barCollar: string;
  rigBar: string;
  rigPost: string;
  ramp: [number, [number, number, number]][];
};

export const THEME: Record<Theme, Skin> = {
  light: {
    bodyNear: "#3D4757",
    bodyFar: "#5A6678",
    head: "#3D4757",
    face: "#4A566A",
    muscleEdge: "rgba(15, 23, 42, 0.28)",
    muscleEdgeFocus: "#0F172A",
    muscleInert: "#7E8A9C",
    ground: "#94A3B8",
    shadow: "#0F172A",
    shadowOpacity: 0.13,
    glow: "#C0392B",
    glowStrength: 0.4,
    barPlate: "#E6EAF0",
    barPlateEdge: "#94A3B8",
    barInner: "#D2D9E3",
    barSleeve: "#7E8A9C",
    barCollar: "#5A6678",
    rigBar: "#8D9AAC",
    rigPost: "#B6C0CD",
    ramp: [
      [0.0, [69, 79, 95]],
      [0.3, [124, 92, 92]],
      [0.62, [186, 92, 68]],
      [1.0, [190, 22, 45]],
    ],
  },
  dark: {
    bodyNear: "#2C3849",
    bodyFar: "#1E2735",
    head: "#2C3849",
    face: "#36445A",
    muscleEdge: "rgba(6, 10, 18, 0.55)",
    muscleEdgeFocus: "#F8FAFC",
    muscleInert: "#3A4759",
    ground: "#334155",
    shadow: "#01040A",
    shadowOpacity: 0.6,
    glow: "#FF5E3F",
    glowStrength: 0.85,
    barPlate: "#141C29",
    barPlateEdge: "#3B4A60",
    barInner: "#1B2534",
    barSleeve: "#54637B",
    barCollar: "#8496AE",
    rigBar: "#48586F",
    rigPost: "#2E3A4C",
    ramp: [
      // Starts just above the body so a resting muscle disappears into it,
      // and finishes hot enough to bloom.
      [0.0, [56, 68, 87]],
      [0.28, [126, 72, 66]],
      [0.6, [206, 74, 48]],
      [1.0, [255, 108, 74]],
    ],
  },
};

/**
 * Group accents. Deliberately outside either activation ramp so they can never
 * be mistaken for an effort reading — these label regions of the body.
 */
export const GROUP_COLOR: Record<string, string> = {
  posterior: "#157A6E",
  anterior: "#A85B00",
  upper: "#4B4DA6",
};

export const GROUP_COLOR_DARK: Record<string, string> = {
  posterior: "#3FBFA9",
  anterior: "#E0A040",
  upper: "#8C8EF0",
};


