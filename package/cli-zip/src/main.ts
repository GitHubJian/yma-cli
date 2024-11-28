import fs from 'fs';
import path from 'path';
import fse from 'fs-extra';
import archiver from 'archiver';
import {log, error, warn} from 'yma-shared-util';
import dayjs from 'dayjs';
import glob from 'glob';
import filesize from './filesize';

function slash(path) {
    const isExtendedLengthPath = path.startsWith('\\\\?\\');

    if (isExtendedLengthPath) {
        return path;
    }

    return path.replace(/\\/g, '/');
}

export interface ZipOption {
    cwd: string;
    type: 'zip' | 'tar' | 'tar.gz';
    tag: boolean;
    extnames: string[];
}

export default function (name: string, others: string[], {cwd, type, extnames}: ZipOption) {
    log('正在压缩...\n', '[Zip]');

    const tempfolder = 'output';

    // 移除 output-*.{zip} 文件
    const zips = glob.sync(path.resolve(cwd, `${tempfolder}-*.*`), {
        nodir: true,
        windowsPathsNoEscape: true,
    });
    for (let i = 0; i < zips.length; i++) {
        const z = zips[i];
        fse.removeSync(z);
    }

    // 创建临时文件夹
    const dest = path.resolve(cwd, tempfolder);
    const src = path.resolve(cwd, name);
    fse.ensureDirSync(dest);
    fse.emptyDirSync(dest);

    const filelist = glob
        .sync(path.resolve(src, '**'), {
            nodir: true,
            windowsPathsNoEscape: true,
        })
        .filter(function (filepath) {
            const extname = path.extname(filepath);

            if (extnames.includes(extname)) {
                return true;
            }
            return false;
        });
    for (let i = 0; i < filelist.length; i++) {
        const srcFilepath = filelist[i];
        const relative = srcFilepath.replace(slash(src) + '/', '');
        const destFilepath = path.resolve(dest, relative);

        fse.copySync(srcFilepath, destFilepath);
    }

    // 复制其他文件
    const doneFilepath: string[] = [];
    const notdoneFilepath: string[] = [];
    for (let i = 0; i < others.length; i++) {
        const other = others[i];
        const srcFilepath = path.resolve(cwd, other);
        const relative = path.basename(srcFilepath);
        const destFilepath = path.resolve(dest, relative);
        if (fs.existsSync(srcFilepath)) {
            fse.copySync(srcFilepath, destFilepath);
            doneFilepath.push(slash(srcFilepath));
        } else {
            notdoneFilepath.push(slash(srcFilepath));
        }
    }

    log('复制文件：', '[Zip]');
    log(filelist.concat(doneFilepath).join('\n'));

    log();
    if (notdoneFilepath.length > 0) {
        log('未发现文件：', '[Zip]');
        log(notdoneFilepath.join('\n'));
    }

    //  创建临时文件夹
    const timestamp = dayjs().format('MMDDHHmm');
    const zipfilepath = dest + '-' + timestamp + '.' + type;
    fse.ensureFileSync(zipfilepath);
    const zipfilename = path.basename(zipfilepath);

    const output = fs.createWriteStream(zipfilepath);
    const archive = archiver(type, {
        zlib: {
            level: 9,
        },
    });

    output.on('close', function () {
        fse.removeSync(dest);

        const fz = filesize(archive.pointer(), {
            bits: true,
        });
        log('压缩完成', '[Zip]');
        log(`文件 ${zipfilename} (${slash(cwd)}) 共 ${fz}`, '[Zip]');
    });

    output.on('end', function () {
        fse.removeSync(dest);

        const fz = filesize(archive.pointer(), {
            bits: true,
        });
        log('压缩完成', '[Zip]');
        log(`文件 ${zipfilename} (${slash(cwd)}) 共 ${fz}`, '[Zip]');
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

    archive.directory(dest, false);

    archive.finalize();
}

function remove(folderpath: string, extnames: string[]) {
    const filepaths = glob
        .sync(path.resolve(folderpath, '**'), {
            nodir: true,
            windowsPathsNoEscape: true,
        })
        .map(function (p) {
            return path.normalize(p);
        });

    log('移除文件如下：', '[Zip]');
    for (let i = 0; i < filepaths.length; i++) {
        const filepath = filepaths[i];
        const extname = path.extname(filepath);

        if (!extnames.includes(extname)) {
            log(path.posix.normalize(filepath.replace(folderpath, '')));

            fse.removeSync(filepath);
        }
    }

    log();
}
