import path from 'path';
import os from 'os';
import fs from 'fs';

function getCachePath(moduleName) {
    return path.join(os.homedir(), `.${moduleName}cache`);
}

export function createCache(name) {
    let cachePath = getCachePath(name);

    function get() {
        if (fs.existsSync(cachePath)) {
            try {
                return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
            } catch (e) {
                console.error(
                    'Error loading saved preferences: ' +
                        `~/.${name}cache may be corrupted or have syntax errors. ` +
                        `(${(e as Error).message})`,
                );
                process.exit(1);
            }
        }
        return {};
    }

    function set(toSave = {}) {
        try {
            fs.writeFileSync(cachePath, JSON.stringify(toSave, null, 2));
            return true;
        } catch (e) {
            console.error(
                'Error saving preferences: ' +
                    `make sure you have write access to ${cachePath}.\n` +
                    `(${(e as Error).message})`,
            );
        }
    }

    return {
        get,
        set,
    };
}
