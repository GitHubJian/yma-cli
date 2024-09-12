import fs from 'fs';
import path from 'path';

const INJECT_FILE_PATH = path.resolve(__dirname, '../public', 'inject.js');
const InjectFileContent = fs.readFileSync(INJECT_FILE_PATH, 'utf-8');

export default function createScriptTag(ns, isMock): string {
    let content = `<script>window.__js_bridge_ns__ = "${ns}";</script>`;

    if (isMock) {
        content += `<script>${InjectFileContent}</script>`;
    }

    return content;
}
