import path from 'path';
import fs from 'fs-extra';
import webpack, {Configuration} from 'webpack';
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer';
import {done, log, logWithSpinner, stopSpinner, chalk} from 'yma-shared-util';
import WebpackAPI, {ProjectOptions} from 'yma-config-plugin';
import formatStats from './util/format-stats';

const modifyConfig = (config: Configuration, fn: (config: Configuration) => void): void => {
    if (Array.isArray(config)) {
        config.forEach(c => fn(c));
    } else {
        fn(config);
    }
};

export interface BuildOptions {
    report: boolean;
}

export default async function build(options: BuildOptions, api: WebpackAPI): Promise<void> {
    log();
    logWithSpinner('Building App for production...');

    const webpackConfig = await api.toConfig();

    const projectOptions: ProjectOptions = api.projectOptions;
    const targetDir = api.resolve(projectOptions.outputDir);

    if (options.report) {
        modifyConfig(webpackConfig, config => {
            const bundleName = (config.output!.filename as string).replace(/\.js$/, '-');
            config.plugins!.push(
                new BundleAnalyzerPlugin({
                    logLevel: 'warn',
                    openAnalyzer: false,
                    analyzerMode: options.report ? 'static' : 'disabled',
                    reportFilename: `${bundleName}report.html`,
                    statsFilename: `${bundleName}report.json`,
                    generateStatsFile: !!options['report-json'],
                }),
            );
        });
    }

    await fs.emptyDirSync(targetDir);

    return new Promise((resolve, reject) => {
        webpack(webpackConfig, (err, stats) => {
            stopSpinner(false);
            if (err) {
                return reject(err);
            }

            if (stats!.hasErrors()) {
                return reject(new Error('Build failed with errors.'));
            }

            const targetDirShort = path.relative(api.context, targetDir);
            log(formatStats(stats!, targetDirShort));
            const cost = stats!.endTime - stats!.startTime;
            done(
                `Cost ${chalk.red(cost + ' ms')} Build complete. The ${chalk.cyan(
                    targetDirShort,
                )} directory is ready to be deployed.`,
            );

            resolve(void 0);
        });
    });
}
