import path from 'path';
import fse from 'fs-extra';
import {findExportedFile} from './util';
import create from './create';

export enum Tool {
    COMPONENT = 'component',
    UTIL = 'util',
}

export enum Filetype {
    JS = 'js',
    TS = 'ts',
    VUE = 'vue',
}

export enum ExportContentTarget {
    MODULE = 'module',
    COMMONJS = 'commonjs',
}

export enum ExportFilename {
    MAIN = 'main',
    INDEX = 'index',
    SAME_NAME = 'same-name',
}

export enum ExportContentType {
    UNITE = 'unite', // 联合的，拥有自己的空间 import {aT} from './util'; aT.a()
    INDEPENDENT = 'independent', // 独立的 import {a} from './util'; a()
}

export interface GenerateOptions {
    cwd: string; // 执行上下文
    tool: Tool; // 工具库类型
    filetype: Filetype.JS; // 查找文件类型
    exportFilename: ExportFilename; // 导出文件的名字
    exportContentType: ExportContentType; // 导出类型
    exportContentTarget: ExportContentTarget; // library 类型
    ignore?: string; // 忽略
}

const defaults = {
    cwd: process.cwd(),
    tool: Tool.UTIL,
    filetype: Filetype.JS,
    exportContentTarget: ExportContentTarget.COMMONJS,
    exportFilename: ExportFilename.INDEX,
    exportContentType: ExportContentType.UNITE,
    ignore: '_',
};

export default function generate(dir: string, opts: GenerateOptions): void {
    const options = Object.assign({}, defaults, opts || {});

    const basename = path.basename(dir);
    const filename =
        options.exportFilename === ExportFilename.SAME_NAME
            ? basename
            : options.exportFilename === ExportFilename.MAIN
            ? ExportFilename.MAIN
            : ExportFilename.INDEX;

    const filetype = options.filetype;
    const list = findExportedFile(dir, {
        ignore: [options.ignore].concat('_', filename + '.' + options.filetype),
        filetype: filetype,
    });

    const content = create(list, {
        tool: options.tool,
        exportContentTarget: options.exportContentTarget,
        exportContentType: options.exportContentType,
    });

    const filepath = path.resolve(dir, `${filename}.${options.filetype}`);

    fse.writeFileSync(path.resolve(dir, filepath), content, 'utf-8');
}
