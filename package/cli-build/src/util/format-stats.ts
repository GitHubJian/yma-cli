import webpack from 'webpack';

import {chalk} from 'yma-shared-util';
import path from 'path';
import cliui from 'cliui';

const ui = cliui({width: 80});

export default function formatStats(stats: webpack.Stats, dir: string): string {
    const json = stats.toJson({
        hash: false,
        modules: false,
        chunks: false,
    });

    let assets = json.assets
        ? json.assets
        : (json.children as []).reduce(
              (acc, child: Record<string, any>) =>
                  acc.concat(child.assets as []),
              []
          );

    const seenNames = new Map();
    const isJS = val => val.endsWith('.js');
    const isCSS = val => val.endsWith('.css');
    const isMinJS = val => val.endsWith('.min.js');
    assets = assets
        .map(a => {
            a.name = a.name.split('?')[0];
            return a;
        })
        .filter(a => {
            if (seenNames.has(a.name)) {
                return false;
            }
            seenNames.set(a.name, true);
            return isJS(a.name) || isCSS(a.name);
        })
        .sort((a, b) => {
            if (isJS(a.name) && isCSS(b.name)) {
                return -1;
            }
            if (isCSS(a.name) && isJS(b.name)) {
                return 1;
            }
            if (isMinJS(a.name) && !isMinJS(b.name)) {
                return -1;
            }
            if (!isMinJS(a.name) && isMinJS(b.name)) {
                return 1;
            }
            return b.size - a.size;
        });

    function formatSize(size) {
        return (size / 1024).toFixed(2) + ' KiB';
    }

    function makeRow(a, b) {
        return `  ${a}\t    ${b}`;
    }

    ui.div(
        makeRow(chalk.cyan.bold('File'), chalk.cyan.bold('Size')) +
            '\n\n' +
            assets
                .map(asset =>
                    makeRow(
                        asset.name.endsWith('js')
                            ? chalk.green(path.join(dir, asset.name))
                            : chalk.blue(path.join(dir, asset.name)),
                        formatSize(asset.size)
                    )
                )
                .join('\n')
    );

    return `${ui.toString()}\n\n  ${chalk.gray(
        'Images and other types of assets omitted.'
    )}\n`;
}
