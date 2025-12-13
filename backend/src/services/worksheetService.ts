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
        // 4 大板块：literacy, math, logic, creativity
        // creativity 包含了原来的 fine-motor 和 creativity
        this.generators = new Map([
            ['literacy', literacyGenerators],
            ['math', mathGenerators],
            ['logic', logicGenerators],
            ['creativity', creativityGenerators],
            // 兼容旧的 fine-motor 分类（指向 creativity）
            ['fine-motor', fineMotorGenerators]
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
