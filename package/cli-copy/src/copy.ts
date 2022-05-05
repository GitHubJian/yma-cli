import {PackageManager} from 'yma-package-manager';
import {chalk, error, info, log, done} from 'yma-shared-util';

export default async function (
    context: string = process.cwd(),
    forcePackageManager: string = 'npm'
) {
    log('尝试复制 NPMRC 中 Auth Token...', 'COPY');
    log();

    context = context || process.cwd();

    const pm = new PackageManager({
        context: context,
        forcePackageManager: forcePackageManager,
    });

    const registry = await pm.getRegistry();
    const auth = await pm.getAuthConfig('');

    if (auth.token) {
        info('当前 Auth Token: ', 'COPY');
        info(auth.token, 'COPY');

        let copied = '';
        try {
            require('clipboardy').writeSync(auth.token);
            copied = chalk.dim('(copied to clipboard)');
        } catch (e) {
            console.log(e);
        }

        log();
        if (copied) {
            done(`复制 Auth Token 成功。${copied}`, 'COPY');
        } else {
            error('复制 Auth Token 失败，请手动复制。', 'COPY');
        }
    } else {
        error(`未找到该域 (${registry}) 的 Token。`, 'COPY');
    }
}
