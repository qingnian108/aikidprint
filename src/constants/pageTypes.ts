import { Pencil, Calculator, Palette } from 'lucide-react';
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

export const CATEGORIES: Category[] = [
  {
    id: 'literacy',
    title: 'Alphabet Skills',
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
          {
            id: 'theme',
            type: 'select',
            label: 'Theme',
            defaultValue: 'dinosaur',
            options: [
              { value: 'dinosaur', label: 'Dinosaur' },
              { value: 'space', label: 'Space' },
              { value: 'ocean', label: 'Ocean' },
              { value: 'unicorn', label: 'Unicorn' },
              { value: 'vehicles', label: 'Vehicles' },
              { value: 'safari', label: 'Safari' }
            ]
          }
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
          {
            id: 'theme',
            type: 'select',
            label: 'Theme',
            defaultValue: 'dinosaur',
            options: [
              { value: 'dinosaur', label: 'Dinosaur' },
              { value: 'space', label: 'Space' },
              { value: 'ocean', label: 'Ocean' },
              { value: 'unicorn', label: 'Unicorn' },
              { value: 'vehicles', label: 'Vehicles' },
              { value: 'safari', label: 'Safari' }
            ]
          }
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
          {
            id: 'theme',
            type: 'select',
            label: 'Theme',
            defaultValue: 'dinosaur',
            options: [
              { value: 'dinosaur', label: 'Dinosaur' },
              { value: 'space', label: 'Space' },
              { value: 'ocean', label: 'Ocean' },
              { value: 'unicorn', label: 'Unicorn' },
              { value: 'vehicles', label: 'Vehicles' },
              { value: 'safari', label: 'Safari' }
            ]
          }
        ]
      },
      {
        id: 'write-my-name',
        title: 'Write My Name',
        description: 'Practice writing your name with themed decorations.',
        previewImage: '/previews/write-my-name.png',
        options: [
          {
            id: 'name',
            type: 'text',
            label: 'Name',
            defaultValue: 'LEO',
            placeholder: 'Enter name (e.g. LEO)'
          },
          {
            id: 'theme',
            type: 'select',
            label: 'Theme',
            defaultValue: 'dinosaur',
            options: [
              { value: 'dinosaur', label: 'Dinosaur' },
              { value: 'space', label: 'Space' },
              { value: 'ocean', label: 'Ocean' },
              { value: 'unicorn', label: 'Unicorn' },
              { value: 'vehicles', label: 'Vehicles' },
              { value: 'safari', label: 'Safari' }
            ]
          }
        ]
      }
    ],
  },
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
          {
            id: 'theme',
            type: 'select',
            label: 'Theme',
            defaultValue: 'dinosaur',
            options: [
              { value: 'dinosaur', label: 'Dinosaur' },
              { value: 'ocean', label: 'Ocean' },
              { value: 'space', label: 'Space' },
              { value: 'unicorn', label: 'Unicorn' },
              { value: 'vehicles', label: 'Vehicles' },
              { value: 'safari', label: 'Safari' }
            ]
          }
        ]
      },
      {
        id: 'counting-objects',
        title: 'Counting Objects',
        description: 'Count objects and write the number.',
        previewImage: '/previews/counting-objects.png',
        options: [
          {
            id: 'theme',
            type: 'select',
            label: 'Theme',
            defaultValue: 'dinosaur',
            options: [
              { value: 'dinosaur', label: 'Dinosaur' },
              { value: 'ocean', label: 'Ocean' },
              { value: 'space', label: 'Space' },
              { value: 'unicorn', label: 'Unicorn' },
              { value: 'vehicles', label: 'Vehicles' },
              { value: 'safari', label: 'Safari' }
            ]
          },
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
          {
            id: 'theme',
            type: 'select',
            label: 'Theme',
            defaultValue: 'dinosaur',
            options: [
              { value: 'dinosaur', label: 'Dinosaur' },
              { value: 'ocean', label: 'Ocean' },
              { value: 'space', label: 'Space' },
              { value: 'unicorn', label: 'Unicorn' },
              { value: 'vehicles', label: 'Vehicles' },
              { value: 'safari', label: 'Safari' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'logic',
    title: 'Logic Skills',
    description: 'Mazes, shadows, sorting, patterns, comparisons.',
    color: 'bg-duck-blue',
    icon: Palette,
    pageTypes: [
      {
        id: 'maze',
        title: 'Maze',
        description: 'Find the path through the maze.',
        previewImage: '/previews/maze.png',
        options: [
          {
            id: 'theme',
            type: 'select',
            label: 'Theme',
            defaultValue: 'dinosaur',
            options: [
              { value: 'dinosaur', label: 'Dinosaur' },
              { value: 'ocean', label: 'Ocean' },
              { value: 'space', label: 'Space' },
              { value: 'unicorn', label: 'Unicorn' },
              { value: 'vehicles', label: 'Vehicles' },
              { value: 'safari', label: 'Safari' }
            ]
          },
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
          {
            id: 'theme',
            type: 'select',
            label: 'Theme',
            defaultValue: 'dinosaur',
            options: [
              { value: 'dinosaur', label: 'Dinosaur' },
              { value: 'ocean', label: 'Ocean' },
              { value: 'space', label: 'Space' },
              { value: 'unicorn', label: 'Unicorn' },
              { value: 'vehicles', label: 'Vehicles' },
              { value: 'safari', label: 'Safari' }
            ]
          }
        ]
      },
      {
        id: 'sorting',
        title: 'Sorting',
        description: 'Sort items into the correct groups.',
        previewImage: '/previews/sorting.png',
        options: [
          {
            id: 'theme',
            type: 'select',
            label: 'Theme',
            defaultValue: 'dinosaur',
            options: [
              { value: 'dinosaur', label: 'Dinosaur' },
              { value: 'ocean', label: 'Ocean' },
              { value: 'space', label: 'Space' },
              { value: 'unicorn', label: 'Unicorn' },
              { value: 'vehicles', label: 'Vehicles' },
              { value: 'safari', label: 'Safari' }
            ]
          }
        ]
      },
      {
        id: 'pattern-compare',
        title: 'Pattern Compare',
        description: 'Spot and compare repeating patterns.',
        previewImage: '/previews/pattern-compare.png',
        options: [
          {
            id: 'theme',
            type: 'select',
            label: 'Theme',
            defaultValue: 'dinosaur',
            options: [
              { value: 'dinosaur', label: 'Dinosaur' },
              { value: 'ocean', label: 'Ocean' },
              { value: 'space', label: 'Space' },
              { value: 'unicorn', label: 'Unicorn' },
              { value: 'vehicles', label: 'Vehicles' },
              { value: 'safari', label: 'Safari' }
            ]
          }
        ]
      },
      {
        id: 'pattern-sequencing',
        title: 'Pattern Sequencing',
        description: 'Complete the pattern by finding the next item.',
        previewImage: '/previews/pattern-sequencing.png',
        options: [
          {
            id: 'theme',
            type: 'select',
            label: 'Theme',
            defaultValue: 'dinosaur',
            options: [
              { value: 'dinosaur', label: 'Dinosaur' },
              { value: 'ocean', label: 'Ocean' },
              { value: 'space', label: 'Space' },
              { value: 'unicorn', label: 'Unicorn' },
              { value: 'vehicles', label: 'Vehicles' },
              { value: 'safari', label: 'Safari' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'fine-motor',
    title: 'Fine Motor Skills',
    description: 'Line tracing and shape practice for hand control.',
    color: 'bg-purple-400',
    icon: Pencil,
    pageTypes: [
      {
        id: 'trace-lines',
        title: 'Trace Lines',
        description: 'Practice tracing different types of lines.',
        previewImage: '/previews/trace-lines.png',
        options: [
          {
            id: 'theme',
            type: 'select',
            label: 'Theme',
            defaultValue: 'dinosaur',
            options: [
              { value: 'dinosaur', label: 'Dinosaur' },
              { value: 'space', label: 'Space' },
              { value: 'ocean', label: 'Ocean' },
              { value: 'unicorn', label: 'Unicorn' },
              { value: 'vehicles', label: 'Vehicles' },
              { value: 'safari', label: 'Safari' }
            ]
          }
        ]
      },
      {
        id: 'shape-tracing',
        title: 'Shape Tracing',
        description: 'Trace basic shapes to build motor skills.',
        previewImage: '/previews/shape-tracing.png',
        options: [
          {
            id: 'theme',
            type: 'select',
            label: 'Theme',
            defaultValue: 'dinosaur',
            options: [
              { value: 'dinosaur', label: 'Dinosaur' },
              { value: 'space', label: 'Space' },
              { value: 'ocean', label: 'Ocean' },
              { value: 'unicorn', label: 'Unicorn' },
              { value: 'vehicles', label: 'Vehicles' },
              { value: 'safari', label: 'Safari' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'creativity',
    title: 'Creativity',
    description: 'Coloring pages and creative drawing prompts.',
    color: 'bg-pink-400',
    icon: Palette,
    pageTypes: [
      {
        id: 'coloring-page',
        title: 'Coloring Page',
        description: 'Fun coloring pages with themed illustrations.',
        previewImage: '/previews/coloring-page.png',
        options: [
          {
            id: 'theme',
            type: 'select',
            label: 'Theme',
            defaultValue: 'dinosaur',
            options: [
              { value: 'dinosaur', label: 'Dinosaur' },
              { value: 'space', label: 'Space' },
              { value: 'ocean', label: 'Ocean' },
              { value: 'unicorn', label: 'Unicorn' },
              { value: 'vehicles', label: 'Vehicles' },
              { value: 'safari', label: 'Safari' }
            ]
          }
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
          {
            id: 'theme',
            type: 'select',
            label: 'Theme',
            defaultValue: 'dinosaur',
            options: [
              { value: 'dinosaur', label: 'Dinosaur' },
              { value: 'space', label: 'Space' },
              { value: 'ocean', label: 'Ocean' },
              { value: 'unicorn', label: 'Unicorn' },
              { value: 'vehicles', label: 'Vehicles' },
              { value: 'safari', label: 'Safari' }
            ]
          }
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
