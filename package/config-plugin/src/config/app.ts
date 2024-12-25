import fs from 'fs';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import PluginAPI from '..';
import Chain from '../../chain';
import getAssetPath from '../util/get-asset-path';
import findEntries, {EntryType} from '../util/find-entry';

function ensureRelative(outputDir: string, p: string): string {
    if (path.isAbsolute(p)) {
        return path.relative(outputDir, p);
    }

    return p;
}

type PageEntry = string | string[];

interface PageConfig {
    entry: PageEntry;
    template?: string;
    filename?: string;
    chunks?: string[];

    [key: string]: any;
}

export interface MultiPageConfig {
    [key: string]: PageConfig | string;
}

const isTiled = process.env.YMA_OUTPUT_TILED == 'true';

export default async function (api: PluginAPI) {
    api.chainWebpack((chain: Chain) => {
        const htmlPublicPath = api.projectOptions.htmlPublicPath || api.projectOptions.publicPath;
        const outputDir = api.resolve(api.projectOptions.outputDir);
        let filename;
        if (isTiled) {
            filename = `[name]${api.isProd && api.projectOptions.filenameHashing ? '.[contenthash:8]' : ''}.js`;
        } else {
            filename = getAssetPath(
                `js/[name]${api.isProd && api.projectOptions.filenameHashing ? '.[contenthash:8]' : ''}.js`,
                api.projectOptions.assetsDir,
            );
        }
        chain.output.filename(filename).chunkFilename(filename);

        const htmlOptions: {
            title: string;
            template?: string;
            inject: true | 'head' | 'body' | false;
        } = {
            title: 'YMA CLI',
            inject: 'body',
        };

        const htmlPath = api.resolve('public/index.html');
        const defaultHtmlPath = path.resolve(__dirname, '../../public/default.html');

        let multiPageConfig = api.projectOptions.page!;

        if (!multiPageConfig) {
            let entryType = EntryType.PAGE;
            if (api.cliArgv.entry === 'spa') {
                entryType = EntryType.APP;
            } else if (api.cliArgv.entry === 'mpa') {
                entryType = EntryType.PAGE;
            } else if (api.cliArgv.entry === 'dll') {
                entryType = EntryType.EXPORT;
            }

            multiPageConfig = findEntries(api.context, entryType);
        }

        chain.entryPoints.clear();
        const pages = Object.keys(multiPageConfig);
        const normalizePageConfig = c => (typeof c === 'string' || Array.isArray(c) ? {entry: c} : c);

        pages.forEach(name => {
            const pageConfig = normalizePageConfig(multiPageConfig[name]);
            const {entry, template = `public/${name}.html`, filename = `${name}.html`, chunks = [name]} = pageConfig;

            const customHtmlOptions = {
                publicPath: htmlPublicPath,
            };
            for (const key in pageConfig) {
                if (!['entry', 'template', 'filename', 'chunks'].includes(key)) {
                    customHtmlOptions[key] = pageConfig[key];
                }
            }

            const entries: string[] = Array.isArray(entry) ? entry : [entry];
            if (name === 'vendors') {
                chain.entry(name).merge(entries);
            } else {
                chain.entry(name).merge(
                    entries.map((entry: string) => {
                        return api.resolve(entry);
                    }),
                );
            }

            const hasDedicatedTemplate = fs.existsSync(api.resolve(template));
            const templatePath = hasDedicatedTemplate ? template : fs.existsSync(htmlPath) ? htmlPath : defaultHtmlPath;

            const pageHtmlOptions: {
                chunks?: 'all' | string[];
                filename?: string | ((entryName: string) => string);
                inject?: false | true | 'body' | 'head';
            } = {
                ...htmlOptions,
                ...{
                    chunks,
                    template: templatePath,
                    filename: ensureRelative(outputDir, filename),
                    inject: 'body',
                    minify: {
                        collapseWhitespace: true,
                        keepClosingSlash: true,
                        removeComments: false, // 保留注释
                        removeRedundantAttributes: true,
                        removeScriptTypeAttributes: true,
                        removeStyleLinkTypeAttributes: true,
                        useShortDoctype: true,
                    },
                },
                ...customHtmlOptions,
            };

            chain.plugin(`html-${name}`).use(HtmlWebpackPlugin, [pageHtmlOptions]);
        });
    });
}
