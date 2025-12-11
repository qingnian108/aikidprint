import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface WeeklyPackOptions {
  childName: string;
  age: string;
  theme: string;
  weekNumber: number;
  includePages: string[];
}

interface PageData {
  type: string;
  title: string;
  content: any;
}

// Theme configurations
const THEMES = {
  dinosaurs: {
    name: 'Dinosaurs',
    emoji: '🦕',
    colors: { primary: '#a1e44d', secondary: '#7bd3ea' },
    icons: ['🦕', '🦖', '🌋', '🥚', '🦴']
  },
  space: {
    name: 'Space',
    emoji: '🚀',
    colors: { primary: '#7bd3ea', secondary: '#ffd60a' },
    icons: ['🚀', '🌟', '🌙', '🪐', '👨‍🚀']
  },
  cars: {
    name: 'Cars',
    emoji: '🚗',
    colors: { primary: '#ff9f1c', secondary: '#ffd60a' },
    icons: ['🚗', '🚙', '🚕', '🏎️', '🚓']
  },
  unicorn: {
    name: 'Unicorn',
    emoji: '🦄',
    colors: { primary: '#ff99c8', secondary: '#ffd60a' },
    icons: ['🦄', '🌈', '⭐', '✨', '🎀']
  },
  ocean: {
    name: 'Ocean',
    emoji: '🐠',
    colors: { primary: '#7bd3ea', secondary: '#a1e44d' },
    icons: ['🐠', '🐙', '🦈', '🐚', '🌊']
  },
  safari: {
    name: 'Safari',
    emoji: '🦁',
    colors: { primary: '#ffd60a', secondary: '#ff9f1c' },
    icons: ['🦁', '🐘', '🦒', '🦓', '🌴']
  }
};

// Age-based difficulty settings
const AGE_SETTINGS = {
  '2-3': { numbers: [1, 2, 3, 4, 5], letters: ['A', 'B', 'C'], difficulty: 'easy' },
  '3-4': { numbers: [1, 2, 3, 4, 5, 6, 7, 8], letters: ['A', 'B', 'C', 'D', 'E'], difficulty: 'medium' },
  '4-5': { numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], difficulty: 'medium' },
  '5-6': { numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'], difficulty: 'hard' }
};

export class PDFGenerator {
  private browser: any = null;

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async generateWeeklyPack(options: WeeklyPackOptions): Promise<Buffer> {
    if (!this.browser) {
      await this.initialize();
    }

    const theme = THEMES[options.theme as keyof typeof THEMES] || THEMES.dinosaurs;
    const ageSettings = AGE_SETTINGS[options.age as keyof typeof AGE_SETTINGS] || AGE_SETTINGS['4-5'];

    // Generate all pages
    const pages: PageData[] = [
      this.generateCoverPage(options, theme),
      this.generateWeeklySchedule(options, theme),
      this.generateLetterOfWeek(options, theme, ageSettings),
      this.generateNumberOfWeek(options, theme, ageSettings),
      this.generateCountAndWrite(options, theme, ageSettings),
      this.generatePattern(options, theme),
      this.generateMatching(options, theme),
      this.generateColoringPage(options, theme),
      this.generateCreativePage(options, theme),
      this.generateCertificate(options, theme)
    ];

    // Render all pages to HTML
    const htmlPages = pages.map(page => this.renderPageToHTML(page, theme));

    // Convert to PDF
    const page = await this.browser!.newPage();
    await page.setContent(this.wrapPagesInHTML(htmlPages), { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
    });

    await page.close();
    return pdfBuffer;
  }

  private generateCoverPage(options: WeeklyPackOptions, theme: any): PageData {
    return {
      type: 'cover',
      title: `${options.childName}'s Learning Adventure`,
      content: {
        childName: options.childName,
        weekNumber: options.weekNumber,
        theme: theme.name,
        emoji: theme.emoji,
        subtitle: `Week ${options.weekNumber} • ${theme.name} Theme`
      }
    };
  }

  private generateWeeklySchedule(options: WeeklyPackOptions, theme: any): PageData {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const activities = [
      'Letter Practice',
      'Number Fun',
      'Counting Game',
      'Pattern Play',
      'Creative Time'
    ];

    return {
      type: 'schedule',
      title: 'This Week\'s Plan',
      content: {
        days: days.map((day, i) => ({
          day,
          activity: activities[i],
          icon: theme.icons[i % theme.icons.length]
        }))
      }
    };
  }

  private generateLetterOfWeek(options: WeeklyPackOptions, theme: any, ageSettings: any): PageData {
    const letters = ageSettings.letters;
    const letterIndex = (options.weekNumber - 1) % letters.length;
    const letter = letters[letterIndex];

    return {
      type: 'letter',
      title: `Letter of the Week: ${letter}`,
      content: {
        letter,
        words: this.getWordsForLetter(letter),
        tracingLines: 3
      }
    };
  }

  private generateNumberOfWeek(options: WeeklyPackOptions, theme: any, ageSettings: any): PageData {
    const numbers = ageSettings.numbers;
    const numberIndex = (options.weekNumber - 1) % numbers.length;
    const number = numbers[numberIndex];

    return {
      type: 'number',
      title: `Number of the Week: ${number}`,
      content: {
        number,
        countObjects: Array(number).fill(theme.icons[0]),
        tracingLines: 3
      }
    };
  }

  private generateCountAndWrite(options: WeeklyPackOptions, theme: any, ageSettings: any): PageData {
    const maxNumber = Math.max(...ageSettings.numbers);
    const problems = Array.from({ length: 6 }, (_, i) => {
      const count = Math.floor(Math.random() * maxNumber) + 1;
      return {
        icon: theme.icons[i % theme.icons.length],
        count,
        answer: count
      };
    });

    return {
      type: 'count',
      title: 'Count and Write',
      content: { problems }
    };
  }

  private generatePattern(options: WeeklyPackOptions, theme: any): PageData {
    const patterns = [
      [theme.icons[0], theme.icons[1], theme.icons[0], theme.icons[1]],
      [theme.icons[2], theme.icons[2], theme.icons[3], theme.icons[3]],
      [theme.icons[0], theme.icons[1], theme.icons[2], theme.icons[0]]
    ];

    return {
      type: 'pattern',
      title: 'Complete the Pattern',
      content: { patterns }
    };
  }

  private generateMatching(options: WeeklyPackOptions, theme: any): PageData {
    return {
      type: 'matching',
      title: 'Match the Pairs',
      content: {
        pairs: theme.icons.slice(0, 4).map((icon: string) => ({ left: icon, right: icon }))
      }
    };
  }

  private generateColoringPage(options: WeeklyPackOptions, theme: any): PageData {
    return {
      type: 'coloring',
      title: `Color the ${theme.name}`,
      content: {
        theme: theme.name,
        emoji: theme.emoji
      }
    };
  }

  private generateCreativePage(options: WeeklyPackOptions, theme: any): PageData {
    return {
      type: 'creative',
      title: 'Draw Your Own',
      content: {
        prompt: `Draw your favorite ${theme.name.toLowerCase()}!`,
        theme: theme.name
      }
    };
  }

  private generateCertificate(options: WeeklyPackOptions, theme: any): PageData {
    return {
      type: 'certificate',
      title: 'Certificate of Achievement',
      content: {
        childName: options.childName,
        weekNumber: options.weekNumber,
        date: new Date().toLocaleDateString()
      }
    };
  }

  private renderPageToHTML(page: PageData, theme: any): string {
    // Simple HTML template for each page type
    const baseStyle = `
      <style>
        @page { size: Letter; margin: 0.5in; }
        body { font-family: 'Quicksand', 'Comic Sans MS', 'Arial Rounded MT', Arial, sans-serif; margin: 0; padding: 20px; }
        .page { page-break-after: always; min-height: 10in; border: 3px solid #000; padding: 40px; background: #fcfbf7; }
        .title { font-size: 36px; font-weight: bold; text-align: center; margin-bottom: 30px; color: ${theme.colors.primary}; }
        .content { font-size: 24px; line-height: 1.8; }
        .emoji { font-size: 48px; }
      </style>
    `;

    return `
      ${baseStyle}
      <div class="page">
        <h1 class="title">${page.title}</h1>
        <div class="content">
          ${this.renderPageContent(page)}
        </div>
        <div style="position: absolute; bottom: 20px; right: 20px; font-size: 12px; color: #666;">
          Common Core Standard: K.CC.A.1
        </div>
      </div>
    `;
  }

  private renderPageContent(page: PageData): string {
    // Simplified content rendering
    switch (page.type) {
      case 'cover':
        return `
          <div style="text-align: center; margin-top: 100px;">
            <div class="emoji">${page.content.emoji}</div>
            <h2 style="font-size: 48px; margin: 20px 0;">${page.content.childName}'s</h2>
            <h3 style="font-size: 36px;">${page.content.subtitle}</h3>
          </div>
        `;
      case 'letter':
        return `
          <div style="text-align: center;">
            <div style="font-size: 120px; font-weight: bold; color: ${page.content.letter}; opacity: 0.3;">
              ${page.content.letter}
            </div>
            <div style="margin-top: 40px;">
              ${Array(page.content.tracingLines).fill(0).map(() => 
                `<div style="border-bottom: 2px dashed #ccc; height: 80px; margin: 20px 0;"></div>`
              ).join('')}
            </div>
          </div>
        `;
      default:
        return `<p>Content for ${page.type}</p>`;
    }
  }

  private wrapPagesInHTML(pages: string[]): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">
        <title>Weekly Learning Pack</title>
      </head>
      <body>
        ${pages.join('\n')}
      </body>
      </html>
    `;
  }

  private getWordsForLetter(letter: string): string[] {
    const words: { [key: string]: string[] } = {
      'A': ['Apple', 'Ant', 'Airplane'],
      'B': ['Ball', 'Bear', 'Banana'],
      'C': ['Cat', 'Car', 'Cake'],
      'D': ['Dog', 'Duck', 'Door'],
      'E': ['Egg', 'Elephant', 'Eye']
    };
    return words[letter] || ['Word1', 'Word2', 'Word3'];
  }
}

export default new PDFGenerator();
