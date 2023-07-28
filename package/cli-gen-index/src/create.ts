import {pascalCase, camelCase} from './util';
import {ExportContentType, ExportContentTarget, Tool} from './gen';

const FILE_COMMENT = '/**\n* @file export file\n* @desc 由 GEF 自动生成\n*/\n\n';

type List = string[];

function createModuleContent(list: List, exportContentType: ExportContentType = ExportContentType.UNITE): string {
    if (exportContentType === ExportContentType.UNITE) {
        const content = list
            .map(function (v) {
                return `export * from './${v}';`;
            })
            .join('\n');

        return FILE_COMMENT + content + '\n';
    }
    const importStatements = list
        .map(function (v) {
            return `import ${camelCase(v)} from './${v}';`;
        })
        .join('\n');

    const exportValues = list
        .map(function (v) {
            return camelCase(v);
        })
        .join(',\n    ');

    const exportStatements = `export {\n    ${exportValues}\n}\n`;

    return FILE_COMMENT + importStatements + '\n\n' + exportStatements + '\n';
}

function createCommonjsContent(list: List, exportContentType: ExportContentType = ExportContentType.UNITE): string {
    if (exportContentType === ExportContentType.UNITE) {
        const exportFiles = list
            .map(function (v) {
                return `'${v}'`;
            })
            .join(',\n    ');
        const content = `[\n    ${exportFiles}\n].forEach(function (m) {
    Object.assign(exports, require(\`./\${m}\`));
});
`;

        return FILE_COMMENT + content;
    }
    const exportNames: string[] = [];
    const constStatements = list
        .map(function (v) {
            const exportName = camelCase(v);
            exportNames.push(exportName);

            return `const ${exportName} = require('./${v}');`;
        })
        .join('\n');

    const exportNameStr = exportNames.join(',\n    ');
    const exportStatement = `module.exports = {\n    ${exportNameStr}\n};\n`;

    return FILE_COMMENT + constStatements + '\n\n' + exportStatement;
}

function createComponentContent(list: List) {
    const exportNames: string[] = [];
    const importStatements = list
        .map(function (v) {
            const exportName = pascalCase(v);
            exportNames.push(exportName);

            return `import ${exportName} from './${v}';`;
        })
        .join('\n');

    const exportNameStr = exportNames.join(',\n    ');
    const componentsArrayStatement = `const components = [\n    ${exportNameStr}\n];`;
    const componentsExportStatement = `export {\n    ${exportNameStr}\n};\n`;

    const content = `import {Vue as _Vue} from 'vue/types/vue';

${importStatements}

${componentsArrayStatement}

const install = function (Vue: typeof _Vue): void {
    components.forEach(function (component) {
        Vue.component(component.name, component);
    });
};

export default {
    install,
};

${componentsExportStatement}
`;

    return FILE_COMMENT + content;
}

interface CreateOptions {
    tool: Tool;
    exportContentTarget: ExportContentTarget;
    exportContentType: ExportContentType;
}

export default function create(list: List, options: CreateOptions) {
    if (options.tool === Tool.UTIL) {
        if (options.exportContentTarget === ExportContentTarget.MODULE) {
            return createModuleContent(list, options.exportContentType);
        }
        return createCommonjsContent(list, options.exportContentType);
    }
    return createComponentContent(list);
}
