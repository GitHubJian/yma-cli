import path from 'path';

export default function resolveLocal(...args: string[]): string {
    return path.resolve(__dirname, '../../', ...args);
}
