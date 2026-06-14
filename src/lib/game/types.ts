export type Role = "protector" | "pirate";
export type ProtectorVariant = "creator" | "journalist";
export type PirateVariant = "reposter" | "stealer";
export type RoleVariant = ProtectorVariant | PirateVariant;

export type ManipulationCategory =
  | "crop"
  | "filter"
  | "resize"
  | "screenshot"
  | "convert";

export type ManipulationIntensity = "light" | "medium" | "heavy";

export type GamePhase = "waiting" | "role_select" | "playing" | "results";

// Solo demo screens
export type SoloDemoScreen =
  | "splash"
  | "feed"
  | "steal"
  | "trace"
  | "result";

export interface ContentItem {
  id: string;
  imageUrl: string;
  author: string;
  caption: string;
  uid: number;
}

export interface ContentVariant {
  contentId: string;
  category: ManipulationCategory;
  intensity: ManipulationIntensity;
  imageUrl: string;
  decodeResult: DecodeResult;
}

export interface DecodeResult {
  match: boolean;
  confidence: number;
  uid: number | null;
}

export interface Player {
  id: string;
  name: string;
  role: Role | null;
  roleVariant: RoleVariant | null;
  score: number;
  isBot: boolean;
  isHost: boolean;
  stats: PlayerStats;
}

export interface PlayerStats {
  successfulTraces: number;
  falseTraces: number;
  contentStolen: number;
  caughtCount: number;
  uncaughtCount: number;
}

export interface StolenItem {
  id: string;
  pirateId: string;
  contentId: string;
  manipulation: ManipulationCategory;
  intensity: ManipulationIntensity;
  variantUrl: string;
  stolenAt: number;
  traced: boolean;
  tracedBy: string | null;
  traceCorrect: boolean | null;
  decodeResult: DecodeResult;
}

export interface GameState {
  roomId: string;
  phase: GamePhase;
  players: Record<string, Player>;
  content: ContentItem[];
  stolenItems: StolenItem[];
  teamScores: {
    protectors: number;
    pirates: number;
  };
  timer: {
    phaseStartedAt: number;
    phaseDuration: number;
  };
}

export interface ContentManifest {
  images: ContentItem[];
  variants: Record<string, ContentVariant[]>; // keyed by contentId
}
