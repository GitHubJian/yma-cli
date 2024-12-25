import webpack from 'webpack';
import zip from 'yma-zip';

export type ZipWebpackPluginOptions = Partial<{
    foldername: string;
    others: string[];
    ziptype: 'zip' | 'tar' | 'tar.gz';
    includes: string[];
    timestamp: boolean;
}>;

class ZipWebpackPlugin {
    options: ZipWebpackPluginOptions;
    constructor(options: ZipWebpackPluginOptions) {
        this.options = options;
    }

    apply(compiler) {
        const that = this;
        const output = compiler.options.output.path;
        const cwd = process.cwd();

        compiler.hooks.done.tapAsync('ZipWebpackPlugin', function (compilation, callback) {
            zip(
                {
                    foldername: that.options.foldername || output,
                    others: that.options.others || [],
                    ziptype: that.options.ziptype || 'zip',
                    includes: that.options.includes || [],
                    timestamp: that.options.timestamp !== false,
                    cwd: cwd,
                },
                function (err, data) {
                    callback(null);
                },
            );
        });
    }
}

export default ZipWebpackPlugin;
