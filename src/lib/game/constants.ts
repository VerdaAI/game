import type { ManipulationCategory, ManipulationIntensity } from "./types";

export const GAME_CONFIG = {
  maxPlayers: 8,
  minPlayers: 4,
  gameDuration: 180, // 3 minutes
  roleSelectDuration: 15,
  feedSize: 10,
  roomCodeLength: 6,
} as const;

export const SCORING = {
  traceCorrect: 30,
  traceFalse: -10,
  stealBase: 10,
  manipulationMultiplier: {
    light: 1,
    medium: 1.5,
    heavy: 2.5,
  } as Record<ManipulationIntensity, number>,
  caughtPenalty: -15,
} as const;

export const MANIPULATION_LABELS: Record<ManipulationCategory, string> = {
  crop: "Crop",
  filter: "Filter",
  resize: "Resize",
  screenshot: "Screenshot",
  convert: "Convert",
};

export const MANIPULATION_ICONS: Record<ManipulationCategory, string> = {
  crop: "Crop",
  filter: "SlidersHorizontal",
  resize: "Maximize2",
  screenshot: "Camera",
  convert: "FileType",
};

export const INTENSITY_LABELS: Record<ManipulationIntensity, string> = {
  light: "Light",
  medium: "Medium",
  heavy: "Heavy",
};

export const ROLE_CONFIG = {
  protector: {
    label: "Protector",
    description: "Defend content creators",
    color: "var(--protector-color)",
    variants: {
      creator: { label: "Creator", description: "Protect your original work" },
      journalist: { label: "Journalist", description: "Verify sources and trace leaks" },
    },
  },
  pirate: {
    label: "Pirate",
    description: "Steal and disguise content",
    color: "var(--pirate-color)",
    variants: {
      reposter: { label: "Reposter", description: "Quick grabs, low risk" },
      stealer: { label: "Stealer", description: "Heavy manipulation, high reward" },
    },
  },
} as const;
