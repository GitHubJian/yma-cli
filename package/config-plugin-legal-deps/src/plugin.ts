import path from 'path';
import fs from 'fs';
import uniqby from 'lodash.uniqby';
import compact from 'lodash.compact';
import {Stats, StatsCompilation, StatsModule, WebpackError} from 'webpack';
import validate from './validate';

// Reference: https://github.com/sindresorhus/type-fest/blob/main/source/package-json.d.ts
interface PackageJSON {
    [key: string]: unknown;
    readonly name: string;
    readonly version: string;
}

function resolvePkg(context: string): PackageJSON | null {
    if (fs.existsSync(path.join(context, 'package.json'))) {
        const content = fs.readFileSync(path.join(context, 'package.json'), 'utf-8');
        const json = JSON.parse(content);
        return json;
    }

    return null;
}

function extractUniqueModules(compilation: StatsCompilation): string[] {
    const modules = compilation.modules || [];

    const names = modules.map((m: StatsModule) => m?.nameForCondition);

    return uniqby(compact(names));
}

function parseName(name: string): {name: string; path: string} | null {
    const lastIndex = name.lastIndexOf('node_modules/');

    if (lastIndex < 0) {
        return null;
    }

    const pathPrefix = name.slice(0, lastIndex + 'node_modules/'.length);
    const segments = name.slice(pathPrefix.length).split('/');
    const packageName = segments[0].startsWith('@') ? `${segments[0]}/${segments[1]}` : segments[0];

    return {
        name: packageName,
        path: pathPrefix + packageName,
    };
}

function versionOfPackage(location: string): string {
    try {
        const packageConfig = resolvePkg(location);
        return packageConfig!.version;
    } catch {
        return 'unknown';
    }
}

function importDefault<T>(mod): T {
    return mod && mod.__esModule ? mod.default : mod;
}

type DependencyErrors = Array<[string, string]>;

type PackageName = string; // 全局解耦第三方依赖配置

type Config = Array<{
    name: string;
    version: string;
}>;
export type LegalDepsWebpackPluginConfig = Config | PackageName;

export default class LegalDepsWebpackPlugin {
    config: Config;
    // TODO 支持 url
    constructor(config: LegalDepsWebpackPluginConfig) {
        if (typeof config === 'string') {
            config = importDefault<Config>(require(config));
        }
        validate(config);

        this.config = config;
    }

    apply(compiler) {
        const config = this.config;

        compiler.hooks.afterCompile.tap('LegalDepsWebpackPlugin', compilation => {
            const stats = new Stats(compilation);
            const names = extractUniqueModules(stats.toJson());
            const errors: DependencyErrors = [];

            const occurrences = names.reduce((occurrences: Map<string, any>, current: string) => {
                const info = parseName(current);

                if (!info) {
                    return occurrences;
                }

                if (occurrences.has(info.name)) {
                    occurrences.get(info.name).add(info.path);
                } else {
                    occurrences.set(info.name, new Set([info.path]));
                }

                return occurrences;
            }, new Map());

            for (const [name, paths] of occurrences.entries()) {
                const currentConfig = config.find(function (c) {
                    return c.name === name;
                });
                const expectedVersion = currentConfig?.version;

                if (expectedVersion && paths.size > 0) {
                    if (paths.size > 1) {
                        const locations = [...paths].map(location => {
                            const version = versionOfPackage(location);

                            return `     at ${location} (v${version})`;
                        });
                        errors.push([
                            `Found duplicate package ${name}\n${locations.join('\n')}`,
                            '[Duplicate Package]',
                        ]);
                    } else {
                        const location = [...paths][0];

                        const version = versionOfPackage(location);
                        if (version !== expectedVersion) {
                            errors.push([
                                `Found invalid package ${name}@${version}(expected ${expectedVersion}) ${location}`,
                                '[Version Control]',
                            ]);
                        }
                    }
                }
            }

            if (errors.length > 0) {
                errors.forEach(function ([msg]) {
                    compilation.errors.push(new WebpackError(msg));
                });
            }
        });
    }
}
