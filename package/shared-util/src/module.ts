import Module from 'module';
import path from 'path';

const createRequire = Module.createRequire;

const resolve = require.resolve;

export function clearRequireCache(
    id: string,
    map: Map<string, boolean> | undefined = new Map()
): void {
    const module = require.cache[id];
    if (module) {
        map.set(id, true);

        module.children.forEach(child => {
            if (!map.get(child.id)) {
                clearRequireCache(child.id, map);
            }
        });

        delete require.cache[id];
    }
}

export function resolveModule(request: string, context: string): string {
    let resolvedPath;
    try {
        resolvedPath = createRequire(
            path.resolve(context, 'package.json')
        ).resolve(request);
    } catch (e) {
        resolvedPath = resolve(request, {paths: [context]});
    }

    return resolvedPath;
}

function importDefault(mod) {
    return mod && mod.__esModule ? mod.default : mod;
}

export function loadModule(
    request: string,
    context: string,
    force: boolean = false
): any {
    try {
        const mod = createRequire(path.resolve(context, 'package.json'))(
            request
        );
        return importDefault(mod);
    } catch (e) {
        const resolvedPath = resolveModule(request, context);
        if (resolvedPath) {
            if (force) {
                clearRequireCache(resolvedPath);
            }

            const mod = require(resolvedPath);

            return importDefault(mod);
        }
    }
}

export function clearModule(request: string, context: string): void {
    const resolvedPath = resolveModule(request, context);
    if (resolvedPath) {
        clearRequireCache(resolvedPath);
    }
}
