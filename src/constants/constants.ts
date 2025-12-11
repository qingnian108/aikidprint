import { WorksheetType, DifficultyLevel } from '../types';

export const APP_NAME = "AI Kid Print";

export const AGES = [3, 4, 5, 6, 7, 8];

export const TOPICS = [
  { value: WorksheetType.TRACING, label: 'Alphabet & Tracing', icon: '✏️' },
  { value: WorksheetType.MATH, label: 'Math & Logic', icon: '🧮' },
  { value: WorksheetType.COLORING, label: 'Coloring & Art', icon: '🎨' },
  // { value: WorksheetType.MAZE, label: 'Mazes & Puzzles', icon: '🧩' }
];

export const THEMES = [
  'Dinosaurs',
  'Space',
  'Princesses',
  'Animals',
  'Vehicles',
  'Under the Sea',
  'Superheroes',
  'Unicorns',
  'Seasons (Spring/Summer)',
  'Farm Life'
];

export const DIFFICULTIES = [
  { value: DifficultyLevel.EASY, label: 'Easy (Introduction)' },
  { value: DifficultyLevel.MEDIUM, label: 'Medium (Practice)' },
  { value: DifficultyLevel.HARD, label: 'Hard (Challenge)' }
];

export const TESTIMONIALS = [
  {
    name: "Sarah J.",
    role: "Mom of a 5-year-old",
    text: "This saved my rainy Sunday! The dinosaur math sheets were a huge hit.",
    avatar: "https://picsum.photos/100/100?random=1"
  },
  {
    name: "Mike T.",
    role: "Kindergarten Teacher",
    text: "Finally, resources that I can customize to exactly what my students are learning.",
    avatar: "https://picsum.photos/100/100?random=2"
  }
];
