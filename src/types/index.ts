// ─── Element Types ───────────────────────────────────────────
export type ElementType =
  | "fire"
  | "water"
  | "electric"
  | "earth"
  | "ice"
  | "shadow"
  | "wind"
  | "nature"
  | "psychic"
  | "metal"
  | "light"
  | "toxic"
  | "void";

// ─── Icon Mappings ───────────────────────────────────────────
export const ELEMENT_ICONS: Record<ElementType, string> = {
  fire: "fire",
  water: "water",
  electric: "bolt",
  earth: "mountain",
  ice: "snowflake",
  shadow: "ghost",
  wind: "wind",
  nature: "leaf",
  psychic: "brain",
  metal: "gears",
  light: "sun",
  toxic: "biohazard",
  void: "circle-notch",
};

export const ELEMENT_COLORS: Record<ElementType, string> = {
  fire: "#ff4d00",
  water: "#00bfff",
  electric: "#ffe44d",
  earth: "#c48a2a",
  ice: "#7fdbff",
  shadow: "#a855f7",
  wind: "#6ee7b7",
  nature: "#22c55e",
  psychic: "#ec4899",
  metal: "#94a3b8",
  light: "#fbbf24",
  toxic: "#84cc16",
  void: "#7c3aed",
};

export const ACTION_ICONS: Record<ActionType, string> = {
  move0: "hand-fist",
  move1: "wand-sparkles",
  move2: "wand-sparkles",
  move3: "wand-sparkles",
  guard: "shield-halved",
  run: "person-running",
};

// ─── Move Effects ────────────────────────────────────────────
export type MoveEffectType = "heal" | "poison" | "stun" | "sleep";

export interface MoveEffect {
  type: MoveEffectType;
  /** Roll 0–100; 100 = always triggers */
  chance: number;
  /** HP percentage to restore for 'heal' effects */
  value?: number;
}

// ─── Tutor Moves ─────────────────────────────────────────────
export interface TutorMove extends Move {
  /** Mystic Coins required to teach this move */
  cost: number;
  /** Short flavour label for the cross-type theme */
  crossTheme: string;
}

// ─── Status Conditions ───────────────────────────────────────
export interface StatusCondition {
  type: "poison" | "stun" | "sleep";
  turnsLeft: number;
}

// ─── Moves ───────────────────────────────────────────────────
export interface Move {
  name: string;
  power: number;
  element: ElementType;
  accuracy: number;
  isSpecial: boolean;
  description: string;
  effect?: MoveEffect;
}

export interface LearnableMove {
  level: number;
  move: Move;
}

// ─── Monster Definitions ─────────────────────────────────────
export interface MonsterDefinition {
  id: string;
  name: string;
  element: ElementType;
  baseHP: number;
  attack: number;
  defense: number;
  speed: number;
  specialMove: Move;
  basicMove: Move;
  weaknesses: ElementType[];
  learnset: LearnableMove[];
  spriteUrl: string;
  color: string;
  lore: string;
}

// ─── Battle Monster (runtime state) ─────────────────────────
export interface BattleMonster extends MonsterDefinition {
  currentHP: number;
  maxHP: number;
  level: number;
  xp: number;
  isGuarding: boolean;
  statusEffect: StatusCondition | null;
  moves: Move[];
}

// ─── Battle Phases ───────────────────────────────────────────
export type BattlePhase =
  | "select"
  | "intro"
  | "playerTurn"
  | "enemyTurn"
  | "animating"
  | "victory"
  | "defeat";

// ─── Action Types ────────────────────────────────────────────
export type ActionType =
  | "move0"
  | "move1"
  | "move2"
  | "move3"
  | "guard"
  | "run";

// ─── Battle Log ──────────────────────────────────────────────
export type LogEntryType =
  | "normal"
  | "critical"
  | "effective"
  | "ineffective"
  | "system"
  | "guard"
  | "miss"
  | "heal"
  | "poison"
  | "stun"
  | "sleep";

export interface BattleLogEntry {
  id: number;
  text: string;
  type: LogEntryType;
}

// ─── Damage Result ───────────────────────────────────────────
export interface DamageResult {
  damage: number;
  isCritical: boolean;
  effectiveness: "super" | "resisted" | "neutral";
  message: string;
}

// ─── Game Mode ───────────────────────────────────────────────
export type GameMode = "normal" | "gauntlet";

// ─── Difficulty ──────────────────────────────────────────────
export type DifficultyTier = "easy" | "normal" | "hard" | "nightmare";

// ─── Monster Progress (per-monster leveling) ─────────────────
export interface MonsterProgress {
  id: string;
  level: number;
  xp: number;
  equippedMoveNames?: string[];
  learnedTutorMoveNames?: string[];
}

// ─── Gauntlet State ──────────────────────────────────────────
export interface GauntletState {
  currentRound: number;
  totalRounds: number;
  opponentIds: string[];
  defeatedIds: string[];
  playerMonsterId: string | null;
  isComplete: boolean;
  isFailed: boolean;
}
