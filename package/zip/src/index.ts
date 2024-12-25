import fs from 'fs';
import path from 'path';
import fse from 'fs-extra';
import archiver from 'archiver';
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
    foldername: string;
    others: string[];
    ziptype: 'zip' | 'tar' | 'tar.gz';
    includes: string[];
    timestamp: boolean;
    cwd: string;
}

export default function zip(
    {foldername, others, ziptype, includes, timestamp, cwd}: ZipOption,
    callback: (error: Error | null, data: any) => void,
) {
    console.log();
    console.log('[Zip] 正在压缩...\n');

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
    const src = path.resolve(cwd, foldername);
    fse.ensureDirSync(dest);
    fse.emptyDirSync(dest);

    const filelist = glob
        .sync(path.resolve(src, '**'), {
            nodir: true,
            windowsPathsNoEscape: true,
        })
        .filter(function (filepath) {
            const extname = path.extname(filepath);

            if (includes.length == 0 || includes.includes(extname)) {
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
        // TODO src is folder
        const relative = path.basename(srcFilepath);
        const destFilepath = path.resolve(dest, relative);
        if (fs.existsSync(srcFilepath)) {
            fse.copySync(srcFilepath, destFilepath);
            doneFilepath.push(slash(srcFilepath));
        } else {
            notdoneFilepath.push(slash(srcFilepath));
        }
    }

    console.log('[Zip] 复制文件：');
    console.log(filelist.concat(doneFilepath).join('\n'));
    console.log();

    if (notdoneFilepath.length > 0) {
        console.warn('[Zip] 未发现文件：');
        console.warn(notdoneFilepath.join('\n'));
    }

    //  创建临时文件夹
    const t = dayjs().format('MMDDHHmm');
    const zipfilepath = dest + (timestamp ? '-' + t : '') + '.' + ziptype;
    fse.ensureFileSync(zipfilepath);
    const zipfilename = path.basename(zipfilepath);

    const output = fs.createWriteStream(zipfilepath);
    const archive = archiver(ziptype, {
        zlib: {
            level: 9,
        },
    });

    output.on('close', function () {
        fse.removeSync(dest);

        const pointer = archive.pointer();
        const fz = filesize(pointer, {
            bits: true,
        });

        console.log('[Zip] 压缩完成：');
        console.log(`文件 ${zipfilename} (${slash(cwd)}) 共 ${fz}`);
        console.log();

        callback(null, {
            filesize: fz,
            pointer: pointer,
            filename: zipfilename,
        });
    });

    output.on('end', function () {});

    archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
            console.error(err);
        }

        callback(err, null);
    });

    archive.on('error', function (err) {
        callback(err, null);
    });

    archive.pipe(output);

    archive.directory(dest, false);

    archive.finalize();
}
