import url from 'url';
import {chalk} from 'yma-shared-util';
import address from 'address';
import defaultGateway from 'default-gateway';

export default function (
    protocol: string,
    host: string,
    port: string | number,
    pathname = '/',
): {
    lanUrlForConfig: any;
    lanUrlForTerminal: string;
    localUrlForTerminal: string;
    localUrlForBrowser: string;
} {
    const formatUrl = hostname =>
        url.format({
            protocol,
            hostname,
            port,
            pathname,
        });
    const prettyPrintUrl = hostname =>
        url.format({
            protocol,
            hostname,
            port: chalk.bold(String(port)),
            pathname,
        });

    const isUnspecifiedHost = host === '0.0.0.0' || host === '::';
    let prettyHost;
    let lanUrlForConfig;
    let lanUrlForTerminal = chalk.gray('unavailable');

    if (isUnspecifiedHost) {
        prettyHost = 'localhost';
        try {
            const result = defaultGateway.v4.sync();
            lanUrlForConfig = address.ip(result && result.interface);
            if (lanUrlForConfig) {
                if (/^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(lanUrlForConfig)) {
                    lanUrlForTerminal = prettyPrintUrl(lanUrlForConfig);
                } else {
                    lanUrlForConfig = undefined;
                }
            }
        } catch (e) {
            // ignored
        }
    } else {
        prettyHost = host;
        lanUrlForConfig = host;
        lanUrlForTerminal = prettyPrintUrl(lanUrlForConfig);
    }

    const localUrlForTerminal = prettyPrintUrl(prettyHost);
    const localUrlForBrowser = formatUrl(prettyHost);

    return {
        lanUrlForConfig,
        lanUrlForTerminal,
        localUrlForTerminal,
        localUrlForBrowser,
    };
}
