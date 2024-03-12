import fse from 'fs-extra';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import {log, error} from 'yma-shared-util';
import dayjs from 'dayjs';

export interface ZipOption {
    cwd: string;
    type: 'zip' | 'tar' | 'tar.gz';
    tag: boolean;
}

export default function (name: string, {cwd, type, tag}: ZipOption) {
    log('正在压缩...', '[Zip]');

    const filepath = path.resolve(
        cwd,
        `${name}${tag ? '-' + dayjs().format('MMDDHHmm') : ''}.${type}`
    );
    fse.ensureFileSync(filepath);

    const output = fs.createWriteStream(filepath);
    const archive = archiver(type, {
        zlib: {
            level: 9,
        },
    });

    output.on('end', function () {
        log(`压缩完成，共 ${archive.pointer()} Bytes`, '[Zip]');
    });

    archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
            error('压缩异常，错误如下', '[Zip]');
            console.error(err);
        } else {
            throw err;
        }
    });

    archive.on('error', function (err) {
        throw err;
    });

    archive.pipe(output);

    archive.directory(name, false);

    archive.finalize();
}
