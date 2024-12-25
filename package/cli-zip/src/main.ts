import zip from 'yma-zip';
import {log} from 'yma-shared-util';

export interface ZipOption {
    cwd: string;
    type: 'zip' | 'tar' | 'tar.gz';
    tag: boolean;
    extnames: string[];
}

export default function (name: string, others: string[], {cwd, type, extnames, tag}: ZipOption) {
    zip(
        {
            foldername: name,
            others: others || [],
            ziptype: type || 'zip',
            includes: extnames || [],
            timestamp: tag !== false,
            cwd: cwd,
        },
        function (err, data) {
            if (!err) {
                log('😃 压缩完成', '[Zip]');
            }
        },
    );
}
