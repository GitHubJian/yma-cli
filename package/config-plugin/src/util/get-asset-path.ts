import path from 'path';

export default function getAssetPath(filePath: string, assetsDir?: string): string {
    return assetsDir ? path.posix.join(assetsDir, filePath) : filePath;
}
