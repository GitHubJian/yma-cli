const path = require('path');
const fs = require('fs');

const OUTLET_MAPS = {
    js: '<!-- dll-ssr-js-outlet -->',
    css: '<!-- dll-ssr-css-outlet -->',
};

const CREATE_TAG_MAPS = {
    js: function (src) {
        return `<script defer src="${src}">`;
    },
    css: function (link) {
        return `<link href="${link}" rel="stylesheet">`;
    },
};

function throwUnknownError(type) {
    const unknownOptErr = new Error(`Unknown option: ${type}`);

    throw unknownOptErr;
}

export function renderToString(
    manifestPath: string,
    templatePath: string
): string {
    const manifest: {
        [key: string]: {
            [key: string]: string;
        };
    } = require(manifestPath);

    const dependencies = Object.entries(manifest).reduce(function (
        prev,
        [key, value]
    ) {
        Object.entries(value).forEach(function ([type, path]) {
            prev[type] = prev[type] || [];
            prev[type].push(path);
        });

        return prev;
    },
    {} as {[key: string]: string[]});

    const tags = Object.entries(dependencies).reduce(
        function (prev, [key, value]) {
            const fn = CREATE_TAG_MAPS[key] || throwUnknownError;

            const str = value
                .map(function (v) {
                    return fn(v);
                })
                .join('\n');
            prev[key] = str;

            return prev;
        },
        {} as {
            [key: string]: string;
        }
    );

    let content: string = fs.readFileSync(templatePath, 'utf-8');

    Object.entries(tags).forEach(function ([key, value]) {
        const outlet = OUTLET_MAPS[key];
        content = content.replace(outlet, value);
    });

    return content;
}

// renderToString('./dll/assets-for-dll.json', './dist/home.html');
