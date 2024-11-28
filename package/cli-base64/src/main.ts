import path from 'path';
import {EOL} from 'os';
import fse from 'fs-extra';
import glob from 'glob';
import mimeTypes from 'mime-types';

function getMimetype(mimetype: string | boolean, resourcePath: string): string {
    if (typeof mimetype === 'boolean') {
        if (mimetype) {
            const resolvedMimeType = mimeTypes.contentType(path.extname(resourcePath));

            if (!resolvedMimeType) {
                return '';
            }

            return resolvedMimeType.replace(/;\s+charset/i, ';charset');
        }

        return '';
    }

    if (typeof mimetype === 'string') {
        return mimetype;
    }

    const resolvedMimeType = mimeTypes.contentType(path.extname(resourcePath));

    if (!resolvedMimeType) {
        return '';
    }

    return resolvedMimeType.replace(/;\s+charset/i, ';charset');
}

function getEncoding(encoding: string | boolean): string {
    if (typeof encoding === 'boolean') {
        return encoding ? 'base64' : '';
    }

    if (typeof encoding === 'string') {
        return encoding;
    }

    return 'base64';
}

function getEncodedData(mimetype: string, encoding: string, content: string): string {
    // @ts-expect-error
    const str = content.toString(encoding || undefined);
    return `data:${mimetype}${encoding ? `;${encoding}` : ''},${str}`;
}

function toCamel(str) {
    return str.replace(/_([a-z])/g, function (match, char) {
        return char.toUpperCase();
    });
}

export interface Options {
    mimetype?: string | boolean;
    encoding?: string | boolean;
    esModule: boolean | undefined;
    folder: string;
    extnames: string[];
}

export default function main(options: Options) {
    function transform(resourcePath: string): string {
        let filename = path.basename(resourcePath, path.extname(resourcePath));
        const key = toCamel(filename);

        let content = fse.readFileSync(resourcePath, {
            encoding: 'base64',
        });

        const mimetype = getMimetype(options.mimetype!, resourcePath);
        const encoding = getEncoding(options.encoding!);
        // if (typeof content === 'string') {
        //     content = Buffer.from(content);
        // }
        const encodedData = getEncodedData(mimetype, encoding, content);
        const esModule = typeof options.esModule !== 'undefined' ? options.esModule : true;
        if (esModule) {
            return `export const ${key} = '${encodedData}';`;
        }
        return `exports.${key} = '${encodedData}';`;
    }

    function writeExportFile(stringOrArray: string | string[]) {
        function ensureEOL(str) {
            if (str.charAt(str.length - 1) !== EOL) {
                return str + EOL;
            }

            return str;
        }

        let str = stringOrArray;
        if (Array.isArray(str)) {
            str = str.join(EOL);
        }

        str = ensureEOL(str);

        fse.writeFileSync(path.resolve(options.folder, 'index.js'), str, {
            encoding: 'utf-8',
        });
    }

    const extnames = options.extnames;
    const filepaths = glob
        .sync(path.normalize(path.join(options.folder, '*.*')), {
            nodir: true,
            windowsPathsNoEscape: true,
        })
        .filter(function (filepath) {
            const extname = path.extname(filepath);

            return extnames.includes(extname);
        });

    const contents: string[] = [];
    for (let i = 0; i < filepaths.length; i++) {
        const content = transform(filepaths[i]);
        contents.push(content);
    }

    writeExportFile(contents);
}
