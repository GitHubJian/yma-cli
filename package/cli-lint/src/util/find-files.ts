import glob from 'glob';

export default function findFiles(dir: string): string[] {
    const pattern = '**/**';

    const files = glob.sync(pattern, {
        cwd: dir,
        absolute: true,
        nodir: true,
        ignore: ['**/node_modules/**', '**/output/**', '**/dist/**', '**/*.d.ts'],
    });

    return files;
}
