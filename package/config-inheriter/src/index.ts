import Module from 'module';
import path from 'path';

const createRequire = Module.createRequire;
const resolve = require.resolve;

function clearRequireCache(
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

function resolveModule(request: string, context: string): string {
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

function importDefault<T>(mod): T {
    return mod && mod.__esModule ? mod.default : mod;
}

function loadModule<T>(
    request: string,
    context: string,
    force: boolean = false
): T {
    try {
        const mod = createRequire(path.resolve(context, 'package.json'))(
            request
        );
        return importDefault<T>(mod);
    } catch (e) {
        const resolvedPath = resolveModule(request, context);
        if (resolvedPath) {
            if (force) {
                clearRequireCache(resolvedPath);
            }

            const mod = require(resolvedPath); // eslint-disable-line @typescript-eslint/no-require-imports

            return importDefault<T>(mod);
        }

        throw new Error(
            `not found module path(${request}) at context(${context})`
        );
    }
}

function isNonNullObject(x) {
    return typeof x === 'object' && x !== null;
}

type Presets = string[];
type Plugins = string[] | [string, Record<string, any>?][];
type ConfigData = Partial<{
    presets: Presets;
    plugins: Plugins;
}>;

type PluginObject = {
    request: string;
    resourcePath: string;
    options?: Record<string, any>;
};

type FlatData = {
    plugins?: {
        [key: string]: PluginObject;
    };

    [key: string]: any;
};

export type ConfigureResult = {
    plugins?: PluginObject[];

    [key: string]: any;
};

export class Configure {
    props: string[];
    context: string;

    constructor(props, context) {
        this.props = props;
        this.context = context;
    }

    load(filename: string, context: string): ConfigureResult {
        this.context = context || this.context;
        const filepath = path.resolve(this.context, filename);
        const configData = loadModule<ConfigData>(filepath, this.context);

        const configDatas = this.create(configData, this.context);

        const flatDatas: FlatData[] = [];
        configDatas.forEach(configData => {
            flatDatas.push(...this.translate(configData));
        });

        const data = this.createData(flatDatas);

        const plugins: PluginObject[] = Object.entries(data.plugins).map(
            function ([key, value]) {
                return value;
            }
        );

        const result: ConfigureResult = {
            ...data,
            plugins,
        };

        if (result.plugins?.length === 0) {
            delete result.plugins;
        }

        return result;
    }

    private createData(flatDatas: FlatData[]) {
        const data: {
            plugins: {[key: string]: PluginObject};
        } = {
            plugins: {},
        };

        for (const flatData of flatDatas) {
            this.mergeProps(data, flatData);
            this.mergePlugins(data.plugins, flatData.plugins);
        }

        return data;
    }

    private mergeProps(target, source) {
        for (const prop of this.props) {
            if (prop === '__proto__') {
                continue;
            }

            if (source[prop] !== undefined) {
                target[prop] = source[prop];
            }
        }
    }

    private mergePlugins(target, source) {
        if (!isNonNullObject(source)) {
            return;
        }

        for (const key of Object.keys(source)) {
            if (key === '__proto__') {
                continue;
            }

            const sourceValue = source[key];

            target[key] = sourceValue;
        }
    }

    private create(configData: ConfigData, context: string) {
        const elements = this.normalize(configData, context);

        return [...elements];
    }

    private normalize(configData: ConfigData, context: string) {
        return this.normalizeData(configData, context);
    }

    private *normalizeData(configData: ConfigData, context: string) {
        const preset = configData.presets || [];
        const presetList = Array.isArray(preset) ? preset : [preset];
        for (const presetName of presetList.filter(Boolean)) {
            yield* this.loadPreset(presetName, context);
        }

        const pluginList = configData.plugins;
        const plugins = pluginList && this.loadPlugins(pluginList, context);

        const config: {
            plugins?: {
                [key: string]: PluginObject;
            };
        } = {};

        this.mergeProps(config, configData);

        config.plugins = plugins;
        yield config;
    }

    private loadPreset(name: string, context: string) {
        try {
            const filepath = resolveModule(name, context);

            return this.loadData(filepath, context);
        } catch (e) {
            console.error(`[Config Inheriter]: Not Found Module (${name})`);
            console.error(e);

            throw e;
        }
    }

    private loadPlugins(
        pairs,
        context: string
    ): {
        [key: string]: PluginObject;
    } {
        return pairs.reduce((map, pair) => {
            const plugin = this.loadPlugin(pair, context);

            map[plugin.resourcePath] = plugin;

            return map;
        }, {});
    }

    private loadPlugin(pair, context): PluginObject {
        let name;
        let options;
        let value = pair;
        if (Array.isArray(value)) {
            if (value.length === 3) {
                [value, options, name] = value;
            } else {
                [value, options] = value;
            }
        }

        let filepath: string | null = null;
        const request = value;

        try {
            filepath = resolveModule(request, context);

            return {
                request: request,
                resourcePath: filepath,
                options: options,
            };
        } catch (e) {
            throw e;
        }
    }

    private loadData(filepath: string, context: string) {
        const ctx = path.dirname(filepath);

        return this.normalize(loadModule(filepath, context), ctx);
    }

    private translate(data: {
        plugins: {[key: string]: PluginObject};
    }): FlatData[] {
        const configs: FlatData[] = [];
        const flatData: FlatData = {};

        for (const prop of this.props) {
            if (prop in data && typeof data[prop] !== 'undefined') {
                flatData[prop] = data[prop];
            }
        }

        if (data.plugins && typeof data.plugins === 'object') {
            flatData.plugins = {};

            for (const pluginName of Object.keys(data.plugins)) {
                (flatData.plugins as Record<string, any>)[pluginName] =
                    data.plugins[pluginName];
            }
        }

        if (Object.keys(flatData).length > 0) {
            configs.push(flatData);
        }

        return configs;
    }
}

export default function inherite<T>(
    filename: string,
    options: Partial<{
        context: string;
        props: string[];
    }> = {}
): T {
    const context = options.context || process.cwd();
    const props = options.props || [];

    const configure = new Configure(props, context);
    const data = configure.load(filename, context);

    return data as T;
}
