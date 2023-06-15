import fs from 'fs';
import path from 'path';
import {error, exit, warn, isTSRepo} from 'yma-shared-util';

export enum EntryType {
    PAGE = 'page',
    EXPORT = 'export',
    LIB = 'lib',
    APP = 'app',
}

const INDEX_FILE_NAME_WITHOUT_EXT = 'index';

export default function findEntry(
    context: string,
    entryType: EntryType,
): {
    [key: string]: string;
} {
    const ts = isTSRepo(context);
    const ext = ts ? '.ts' : '.js';

    function findEntryFile(entriesSourcePath: string, entryFolderName: string): string | undefined {
        const entryFileNameNoExt = INDEX_FILE_NAME_WITHOUT_EXT;

        const entryFolderPath = path.resolve(entriesSourcePath, entryFolderName);
        const entryFileBasename = entryFileNameNoExt + ext;
        const entryFilePath = path.resolve(entryFolderPath, entryFileBasename);
        if (fs.existsSync(entryFilePath) && fs.statSync(entryFilePath).isFile()) {
            return entryFilePath;
        }

        error(`EntryFile 文件[${entryFilePath}]不存在`, '[FindEntryFile]');
        exit(0);
    }

    if (!fs.existsSync(context)) {
        error(`context 目录[${context}]不存在.`, '[Find Entries]');
        exit(0);
    }

    const sourcePath = path.resolve(context, 'src');
    if (!fs.existsSync(sourcePath)) {
        error(`src 目录[${sourcePath}]不存在.`, '[Find Entries]');
        exit(0);
    }

    const entriesSourcePath = path.resolve(sourcePath, entryType);
    if (!fs.existsSync(entriesSourcePath)) {
        if (entryType === EntryType.LIB) {
            warn(`lib 目录[${entriesSourcePath}]不存在.`, '[Find Entries]');

            return {};
        }
        error(`entry 目录[${entriesSourcePath}]不存在.`, '[Find Entries]');

        exit(0);
    }

    if (entryType === EntryType.APP) {
        const entryFilePath = `./${INDEX_FILE_NAME_WITHOUT_EXT}${ext}`;
        const entryPath = path.relative(context, entryFilePath);

        return {
            app: entryPath,
        };
    }
    const entryFolderNameList = fs.readdirSync(entriesSourcePath).filter(entryName => !entryName.startsWith('.'));

    const entries = {};
    entryFolderNameList.forEach(entryFolderName => {
        const entryFilePath = findEntryFile(entriesSourcePath, entryFolderName)!;

        entries[entryFolderName] = entryFilePath;
    });

    return entries;
}
