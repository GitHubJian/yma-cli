#!/usr/bin/env node
const semver = require('semver');
const chalk = require('chalk');
const pkg = require('../package.json');

function pleaseUpgradeNode(wanted, id) {
    if (!semver.satisfies(process.version, wanted)) {
        console.log(
            // eslint-disable-line no-console
            chalk.red(
                'You are using Node ' +
                    process.version +
                    ', but this version of ' +
                    id +
                    ' requires Node ' +
                    wanted +
                    '.\nPlease upgrade your Node version.',
            ),
        );
        process.exit(1);
    }
}

// Node version isn't supported, skip
pleaseUpgradeNode(pkg.engines.node, pkg.name);

const cli = require('../dist').default;

cli(process.argv.slice(2));
