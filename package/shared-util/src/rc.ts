import path from 'path';
import os from 'os';
import fs from 'fs';
import fse from 'fs-extra';
import deepmerge from 'deepmerge';

function xdgConfigPath(moduleName) {
    const xdgConfigHome = process.env.XDG_CONFIG_HOME;
    if (xdgConfigHome) {
        const rcDir = path.join(xdgConfigHome, moduleName);
        if (!fse.existsSync(rcDir)) {
            fse.ensureDirSync(rcDir, 0o700);
        }

        return path.join(rcDir, `.${moduleName}rc`);
    }
}

function migrateWindowsConfigPath(moduleName) {
    if (process.platform !== 'win32') {
        return;
    }

    const appData = process.env.APPDATA;
    if (appData) {
        const rcDir = path.join(appData, moduleName);
        const rcFile = path.join(rcDir, `.${moduleName}rc`);
        const properRcFile = path.join(os.homedir(), rcFile);
        if (fse.existsSync(rcFile)) {
            try {
                if (fse.existsSync(properRcFile)) {
                    fse.removeSync(rcFile);
                } else {
                    fse.removeSync(rcFile, properRcFile);
                }
            } catch (e) {}
        }
    }
}

function getRcPath(moduleName) {
    migrateWindowsConfigPath(moduleName);

    return process.env.CLI_CONFIG_PATH || xdgConfigPath(moduleName) || path.join(os.homedir(), `.${moduleName}rc`);
}

export function rc(name, defaults = {}) {
    let rcPath = getRcPath(name);
    let cachedOptions;

    function load() {
        if (cachedOptions) {
            return cachedOptions;
        }

        if (fs.existsSync(rcPath)) {
            try {
                cachedOptions = JSON.parse(fs.readFileSync(rcPath, 'utf-8'));
            } catch (e) {
                console.error(
                    'Error loading saved preferences: ' +
                        `~/.${name}rc may be corrupted or have syntax errors. ` +
                        `(${(e as Error).message})`,
                );
                process.exit(1);
            }
            return cachedOptions;
        }
        return {};
    }

    function save(toSave = {}) {
        const options = deepmerge({}, load(), toSave);

        if (defaults) {
            for (const key in options) {
                if (!(key in defaults)) {
                    delete options[key];
                }
            }
        }

        cachedOptions = options;
        try {
            fs.writeFileSync(rcPath, JSON.stringify(options, null, 2));
            return true;
        } catch (e) {
            console.error(
                'Error saving preferences: ' +
                    `make sure you have write access to ${rcPath}.\n` +
                    `(${(e as Error).message})`,
            );
        }
    }

    return {
        load,
        save,
    };
}
