import fs from 'fs';
import path from 'path';
import uglify from 'uglify-js';

const FLEXIBLE_FILE_PATH = path.resolve(__dirname, '../public', 'flexible.js');

export default function createScriptTag(isUglify: boolean): string {
    let content = fs.readFileSync(FLEXIBLE_FILE_PATH, 'utf-8');

    if (isUglify) {
        content = uglify.minify(content).code;
    }

    return `<script>${content}</script>`;
}
