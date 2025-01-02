import fs from 'fs';
import path from 'path';
import webpack from 'webpack';

const PLUGIN_NAME = 'PreloadWebpackPlugin';

class PreloadWebpackPlugin {
    compiler!: webpack.Compiler;

    constructor(options = {}) {}

    apply(compiler) {
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
        await this.emitAsset(compilation);
    }

    async emitAsset(compilation) {
        const content = fs.readFileSync(path.resolve(__dirname, '../public/preload.js'), 'utf-8');

        compilation.emitAsset('preload.js', new compilation.compiler.webpack.sources.RawSource(content, false), {
            assetsManifest: true,
            generated: true,
            generatedBy: [PLUGIN_NAME],
        });
    }
}

export default PreloadWebpackPlugin;
