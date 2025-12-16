import { Pencil, Calculator, Brain, Palette } from 'lucide-react';
import type { ReactNode } from 'react';

type IconComponent = (props: any) => ReactNode;

export type ConfigOption = {
  id: string;
  type: 'text' | 'select' | 'number' | 'multiselect' | 'toggle';
  label?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: any;
  min?: number;
  max?: number;
  step?: number;
};

export type PageType = {
  id: string;
  title: string;
  description: string;
  previewImage: string;
  options: ConfigOption[];
};

export type Category = {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: IconComponent;
  pageTypes: PageType[];
};

// 主题选项（复用）
const THEME_OPTIONS = [
  { value: 'dinosaur', label: 'Dinosaur' },
  { value: 'space', label: 'Space' },
  { value: 'ocean', label: 'Ocean' },
  { value: 'unicorn', label: 'Unicorn' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'safari', label: 'Safari' }
];

export const CATEGORIES: Category[] = [
  // 1. Literacy Skills（读写能力）– 黄色
  {
    id: 'literacy',
    title: 'Literacy Skills',
    description: 'Letter tracing, name practice, and phonics starters.',
    color: 'bg-duck-yellow',
    icon: Pencil,
    pageTypes: [
      {
        id: 'uppercase-tracing',
        title: 'Uppercase Letter Tracing',
        description: 'Practice writing uppercase letters with themed decorations.',
        previewImage: '/previews/uppercase-tracing.png',
        options: [
          {
            id: 'letter',
            type: 'select',
            label: 'Letter',
            defaultValue: 'A',
            options: Array.from({ length: 26 }, (_, i) => ({
              value: String.fromCharCode(65 + i),
              label: String.fromCharCode(65 + i)
            }))
          },
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'lowercase-tracing',
        title: 'Lowercase Letter Tracing',
        description: 'Practice writing lowercase letters with themed decorations.',
        previewImage: '/previews/lowercase-tracing.png',
        options: [
          {
            id: 'letter',
            type: 'select',
            label: 'Letter',
            defaultValue: 'a',
            options: Array.from({ length: 26 }, (_, i) => ({
              value: String.fromCharCode(97 + i),
              label: String.fromCharCode(97 + i)
            }))
          },
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'letter-recognition',
        title: 'Letter Recognition',
        description: 'Find and circle all instances of a target letter.',
        previewImage: '/previews/letter-recognition.png',
        options: [
          {
            id: 'letter',
            type: 'select',
            label: 'Letter',
            defaultValue: 'A',
            options: Array.from({ length: 26 }, (_, i) => ({
              value: String.fromCharCode(65 + i),
              label: String.fromCharCode(65 + i)
            }))
          },
          {
            id: 'difficulty',
            type: 'select',
            label: 'Difficulty',
            defaultValue: 'easy',
            options: [
              { value: 'easy', label: 'Easy' },
              { value: 'medium', label: 'Medium' },
              { value: 'hard', label: 'Hard' }
            ]
          },
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'write-my-name',
        title: 'Write My Name',
        description: 'Practice writing your name with themed decorations.',
        previewImage: '/previews/write-my-name.png',
        options: [
          { id: 'name', type: 'text', label: 'Name', defaultValue: 'nolan', placeholder: 'Enter name (e.g. nolan)' },
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'alphabet-sequencing',
        title: 'Alphabet Sequencing',
        description: 'Fill in the missing letters in the alphabet sequence.',
        previewImage: '/previews/alphabet-sequencing.png',
        options: [
          {
            id: 'difficulty',
            type: 'select',
            label: 'Difficulty',
            defaultValue: 'easy',
            options: [
              { value: 'easy', label: 'Easy (1 missing)' },
              { value: 'medium', label: 'Medium (1-2 missing)' },
              { value: 'hard', label: 'Hard (2 missing)' }
            ]
          },
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'beginning-sounds',
        title: 'Beginning Sounds',
        description: 'Match pictures to their beginning letter sounds.',
        previewImage: '/previews/beginning-sounds.png',
        options: [
          {
            id: 'letterSet',
            type: 'select',
            label: 'Letter Set',
            defaultValue: 'A-E',
            options: [
              { value: 'A-E', label: 'A - E' },
              { value: 'F-J', label: 'F - J' },
              { value: 'K-O', label: 'K - O' },
              { value: 'P-T', label: 'P - T' },
              { value: 'U-Z', label: 'U - Z' }
            ]
          },
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'cvc-words',
        title: 'CVC Words',
        description: 'Practice reading and writing simple CVC words.',
        previewImage: '/previews/cvc-words.png',
        options: [
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'match-upper-lower',
        title: 'Match Uppercase & Lowercase',
        description: 'Match uppercase letters to their lowercase pairs.',
        previewImage: '/previews/match-upper-lower.png',
        options: [
          {
            id: 'letterSet',
            type: 'select',
            label: 'Letter Set',
            defaultValue: 'A-F',
            options: [
              { value: 'A-F', label: 'A - F' },
              { value: 'G-L', label: 'G - L' },
              { value: 'M-R', label: 'M - R' },
              { value: 'S-V', label: 'S - V' },
              { value: 'W-Z', label: 'W - Z' }
            ]
          },
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      }
    ]
  },
  // 2. Math Skills（数学能力）– 绿色
  {
    id: 'math',
    title: 'Math Skills',
    description: 'Number tracing and early counting practice.',
    color: 'bg-duck-green',
    icon: Calculator,
    pageTypes: [
      {
        id: 'number-tracing',
        title: 'Number Tracing',
        description: 'Trace numbers 0–9 to build handwriting skills.',
        previewImage: '/previews/number-tracing.png',
        options: [
          {
            id: 'range',
            type: 'select',
            label: 'Range',
            defaultValue: '0-4',
            options: [
              { value: '0-4', label: '0–4' },
              { value: '5-9', label: '5–9' }
            ]
          },
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'counting-objects',
        title: 'Counting Objects',
        description: 'Count objects and write the number.',
        previewImage: '/previews/counting-objects.png',
        options: [
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS },
          {
            id: 'difficulty',
            type: 'select',
            label: 'Difficulty',
            defaultValue: 'medium',
            options: [
              { value: 'easy', label: 'Easy' },
              { value: 'medium', label: 'Medium' },
              { value: 'hard', label: 'Hard' }
            ]
          }
        ]
      },
      {
        id: 'number-path',
        title: 'Number Path',
        description: 'Connect the numbers in order to complete the path.',
        previewImage: '/previews/number-path.png',
        options: [
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'which-is-more',
        title: 'Which is More?',
        description: 'Compare two groups and identify which has more objects.',
        previewImage: '/previews/which-is-more.png',
        options: [
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS },
          {
            id: 'difficulty',
            type: 'select',
            label: 'Difficulty',
            defaultValue: 'easy',
            options: [
              { value: 'easy', label: 'Easy (1 - 5)' },
              { value: 'medium', label: 'Medium (1 - 7)' },
              { value: 'hard', label: 'Hard (1 - 10)' }
            ]
          }
        ]
      },
      {
        id: 'number-bonds',
        title: 'Number Bonds to 10',
        description: 'Learn number bonds that make 10.',
        previewImage: '/previews/number-bonds.png',
        options: [
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'ten-frame',
        title: 'Ten Frame Counting',
        description: 'Count dots in ten frames and write the number.',
        previewImage: '/previews/ten-frame.png',
        options: [
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'picture-addition',
        title: 'Picture Addition',
        description: 'Count and add pictures to learn basic addition.',
        previewImage: '/previews/picture-addition.png',
        options: [
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'count-shapes',
        title: 'Count the Shapes',
        description: 'Count different shapes and write the numbers.',
        previewImage: '/previews/count-shapes.png',
        options: [
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'picture-subtraction',
        title: 'Picture Subtraction',
        description: 'Count objects and write the subtraction sentence.',
        previewImage: '/previews/picture-subtraction.png',
        options: [
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'number-sequencing',
        title: 'Number Sequencing',
        description: 'Fill in the missing numbers in the sequence.',
        previewImage: '/previews/number-sequencing.png',
        options: [
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      }
    ]
  },
  // 3. Logic & Thinking Skills（逻辑与思维能力）– 蓝色
  {
    id: 'logic',
    title: 'Logic & Thinking',
    description: 'Mazes, shadows, sorting, patterns, and comparisons.',
    color: 'bg-duck-blue',
    icon: Brain,
    pageTypes: [
      {
        id: 'maze',
        title: 'Maze',
        description: 'Find the path through the maze.',
        previewImage: '/previews/maze.png',
        options: [
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS },
          {
            id: 'difficulty',
            type: 'select',
            label: 'Difficulty',
            defaultValue: 'medium',
            options: [
              { value: 'easy', label: 'Easy' },
              { value: 'medium', label: 'Medium' },
              { value: 'hard', label: 'Hard' }
            ]
          }
        ]
      },
      {
        id: 'shadow-matching',
        title: 'Shadow Matching',
        description: 'Match objects to their shadows.',
        previewImage: '/previews/shadow-matching.png',
        options: [
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'sorting',
        title: 'Sorting',
        description: 'Sort items into the correct groups.',
        previewImage: '/previews/sorting.png',
        options: [
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'pattern-compare',
        title: 'Pattern Compare',
        description: 'Spot and compare repeating patterns.',
        previewImage: '/previews/pattern-compare.png',
        options: [
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'pattern-sequencing',
        title: 'Pattern Sequencing',
        description: 'Complete the pattern by finding the next item.',
        previewImage: '/previews/pattern-sequencing.png',
        options: [
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'odd-one-out',
        title: 'Odd One Out',
        description: 'Circle the one that is different.',
        previewImage: '/previews/odd-one-out.png',
        options: [
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'matching-halves',
        title: 'Matching Halves',
        description: 'Match the two halves to complete the picture.',
        previewImage: '/previews/matching-halves.png',
        options: [
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      }
    ]
  },
  // 4. Creativity & Motor Skills（创意与运笔能力）– 紫粉色
  {
    id: 'creativity',
    title: 'Creativity & Motor',
    description: 'Line tracing, shape practice, coloring, and creative prompts.',
    color: 'bg-gradient-to-r from-purple-400 to-pink-400',
    icon: Palette,
    pageTypes: [
      {
        id: 'trace-lines',
        title: 'Trace Lines',
        description: 'Practice tracing different types of lines.',
        previewImage: '/previews/trace-lines.png',
        options: [
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'shape-tracing',
        title: 'Shape Tracing',
        description: 'Trace basic shapes to build motor skills.',
        previewImage: '/previews/shape-tracing.png',
        options: [
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'coloring-page',
        title: 'Coloring Page',
        description: 'Fun coloring pages with themed illustrations.',
        previewImage: '/previews/coloring-page.png',
        options: [
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'creative-prompt',
        title: 'Creative Prompt',
        description: 'Drawing prompts to spark imagination.',
        previewImage: '/previews/creative-prompt.png',
        options: [
          {
            id: 'promptType',
            type: 'select',
            label: 'Prompt Type',
            defaultValue: 'blank_sign',
            options: [
              { value: 'blank_sign', label: 'Blank Sign' },
              { value: 'halfbody', label: 'Half Body' }
            ]
          },
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'trace-and-draw',
        title: 'Trace and Draw',
        description: 'Trace the picture, then draw your own.',
        previewImage: '/previews/trace-and-draw.png',
        options: [
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'shape-path',
        title: 'Shape Path',
        description: 'Trace along the shapes from start to finish.',
        previewImage: '/previews/shape-path.png',
        options: [
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'logic-grid',
        title: 'Logic Grid',
        description: 'Complete the missing piece in the grid.',
        previewImage: '/previews/logic-grid.png',
        options: [
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      },
      {
        id: 'shape-synthesis',
        title: 'Shape Synthesis',
        description: 'Use these shapes to build an object. What can you make?',
        previewImage: '/previews/shape-synthesis.png',
        options: [
          { id: 'theme', type: 'select', label: 'Theme', defaultValue: 'dinosaur', options: THEME_OPTIONS }
        ]
      }
    ]
  }
];

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getPageType(categoryId: string, typeId: string): PageType | undefined {
  const cat = getCategory(categoryId);
  return cat?.pageTypes.find((pt) => pt.id === typeId);
}
