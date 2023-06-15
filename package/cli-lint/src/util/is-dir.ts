import fs from 'fs';

export default function isDir(filepath) {
    try {
        return fs.statSync(filepath).isDirectory();
    } catch (error) {
        return false;
    }
}
