import path from 'path';
import fs from 'fs';

// Reference: https://github.com/sindresorhus/type-fest/blob/main/source/package-json.d.ts
interface PackageJSON {
    [key: string]: unknown;
    readonly name: string;
    readonly version: string;
}

export function resolvePkg<T>(context: string): T | PackageJSON | null {
    if (fs.existsSync(path.join(context, 'package.json'))) {
        const content = fs.readFileSync(
            path.join(context, 'package.json'),
            'utf-8'
        );
        const json = JSON.parse(content);
        return json;
    }

    return null;
}
