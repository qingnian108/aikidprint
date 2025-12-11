export enum WorksheetType {
  MATH = 'Math',
  TRACING = 'Tracing',
  COLORING = 'Coloring',
  MAZE = 'Maze' // Simplified for this demo
}

export enum DifficultyLevel {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export interface WorksheetConfig {
  age: number;
  type: WorksheetType;
  theme: string;
  difficulty: DifficultyLevel;
  pageCount: number;
}

// Structure of the data returned by Gemini
export interface GeneratedItem {
  id: string;
  question?: string; // For math
  text?: string; // For tracing
  imageUrl?: string; // For coloring (placeholder or generated)
  svgData?: string; // For coloring/mazes
  answer?: string; // For answer key
  icon?: string; // Emoji or simple symbol matching the theme (e.g., 🍎, 🚀, 🦕)
}

export interface GeneratedPage {
  pageNumber: number;
  title: string;
  instructions: string;
  items: GeneratedItem[];
  type: WorksheetType;
  theme: string;
}

export interface GeneratedWorksheet {
  id: string;
  config: WorksheetConfig;
  pages: GeneratedPage[];
  createdAt: string;
}

export interface UserPlan {
  name: 'Free' | 'Pro' | 'Yearly Pro';
  generationsLeft: number | 'Unlimited';
  hasWatermark: boolean;
}