import path from 'path';
import webpack from 'webpack';

const PLUGIN_NAME = 'AssetsWebpackPlugin';

function findMapKeysByValue(map) {
    const entries = [...map.entries()];
    return searchValue => entries.filter(([, value]) => value === searchValue).map(([name]) => name);
}

function maybeArrayWrap(data) {
    return Array.isArray(data) ? data : [data];
}

class AssetsWebpackPlugin {
    assetNames!: Map<string, string>;
    assets!: Record<string, string>;
    compiler!: webpack.Compiler;

    constructor(options = {}) {
        this.assetNames = new Map();
        this.assets = Object.create(null);
    }

    apply(compiler: webpack.Compiler) {
        this.compiler = compiler;

        compiler.hooks.thisCompilation.tap(PLUGIN_NAME, this.handleThisCompilation.bind(this));
    }

    handleThisCompilation(compilation) {
        compilation.hooks.processAssets.tapPromise(
            {
                name: PLUGIN_NAME,
                stage: compilation.compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
            },
            this.handleProcessAssetsReport.bind(this, compilation),
        );
    }

    async handleProcessAssetsReport(compilation) {
        const stats = compilation.getStats().toJson({
            all: false,
            assets: true,
            cachedAssets: true,
            cachedModules: true,
            chunkGroups: false,
            chunkGroupChildren: false,
        });

        const {assets} = this.getCompilationAssets(compilation);
        this.processStatsAssets(stats.assets);

        this.processAssetsByChunkName(stats.assetsByChunkName);

        const findAssetKeys = findMapKeysByValue(this.assetNames);
        for (const asset of assets) {
            const sourceFilenames = findAssetKeys(asset.name);
            if (!sourceFilenames.length) {
                const {sourceFilename} = asset.info;
                const name = sourceFilename ? path.basename(sourceFilename) : asset.name;
                sourceFilenames.push(name);
            }
            sourceFilenames.forEach(key => {
                this.set(key, asset.name);
            });
        }

        await this.emitAssetsManifest(compilation);
    }

    processAssetsByChunkName(assets) {
        Object.keys(assets).forEach(chunkName => {
            maybeArrayWrap(assets[chunkName]).forEach(filename => {
                this.assetNames.set(chunkName + this.getExtension(filename), filename);
            });
        });

        return this.assetNames;
    }

    getExtension(filename) {
        if (!filename || typeof filename !== 'string') {
            return '';
        }

        filename = filename.split(/[?#]/)[0];

        return path.extname(filename);
    }

    set(key, value) {
        this.assets[key] = value;
        return this;
    }

    async emitAssetsManifest(compilation) {
        compilation.emitAsset(
            'assets-manifest.json',
            new compilation.compiler.webpack.sources.RawSource(this.toString(), false),
            {
                assetsManifest: true,
                generated: true,
                generatedBy: [PLUGIN_NAME],
            },
        );
    }

    getCompilationAssets(compilation) {
        const assets = compilation.getAssets().filter(asset => {
            return !asset.info.assetsManifest;
        });

        return {
            assets,
        };
    }

    processStatsAssets(assets) {
        assets.forEach(asset => {
            if (asset.name && asset.info.sourceFilename) {
                this.assetNames.set(
                    path.join(path.dirname(asset.name), path.basename(asset.info.sourceFilename)),
                    asset.name,
                );
            }
        });
    }

    toString() {
        return JSON.stringify(this, null, 2) || '{}';
    }

    toJSON() {
        return this.assets;
    }
}

export default AssetsWebpackPlugin;
