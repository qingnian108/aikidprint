import {
    literacyGenerators,
    mathGenerators,
    logicGenerators,
    fineMotorGenerators,
    creativityGenerators
} from './generators/index.js';

export class WorksheetService {
    private generators: Map<string, Map<string, Function>>;

    constructor() {
        // Initialize generator map: categoryId -> pageTypeId -> generator function
        this.generators = new Map([
            ['literacy', literacyGenerators],
            ['math', mathGenerators],
            ['logic', logicGenerators],
            ['fine-motor', fineMotorGenerators],
            ['creativity', creativityGenerators]
        ]);
    }

    async generate(categoryId: string, pageTypeId: string, config: any = {}) {
        const categoryGenerators = this.generators.get(categoryId);

        if (!categoryGenerators) {
            throw new Error(`Unknown category: ${categoryId}`);
        }

        const generator = categoryGenerators.get(pageTypeId);

        if (!generator) {
            throw new Error(`Unknown page type: ${pageTypeId} in category ${categoryId}`);
        }

        // Call the generator function
        return await generator(config);
    }
}
