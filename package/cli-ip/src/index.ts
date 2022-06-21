import {chalk, error, info, done, log} from 'yma-shared-util';

import getLocalIp from './ip';

export = {
    command: 'ip',
    describe: '获取本机 IP',
    builder: function builder(yargs) {
        return yargs;
    },
    handler: async function (argv) {
        const localIp = getLocalIp();

        if (localIp) {
            info(`本机 IP: ${localIp}`, 'IP');

            let copied = '';
            try {
                require('clipboardy').writeSync(localIp);
                copied = chalk.dim('(copied to clipboard)');
            } catch (e) {}

            log();
            if (copied) {
                done(`复制 IP 成功。${copied}`, 'IP');
            } else {
                error('复制 IP 失败，请手动复制。', 'IP');
            }
        } else {
            error('未找到本机 IP', 'IP');
        }
    },
};
