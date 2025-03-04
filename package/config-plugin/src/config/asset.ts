import PluginAPI from '..';
import Chain from '../../chain';
import getAssetPath from '../util/get-asset-path';

interface CSSLoaderOptions {
    url:
        | boolean
        | {
              url: (url: string, resourcePath: string) => boolean;
          };
    import:
        | boolean
        | {
              filter: (url: string, media: string, resourcePath: string) => boolean;
          };
    modules: boolean;
    sourceMap: boolean;
    limit: number;
    esModule: boolean;
    fallback: {
        loader: string;
        options: {
            name: string;
            esModule: boolean;
        };
    };
}

const isTiled = process.env.YMA_OUTPUT_TILED == 'true';

export default function (api: PluginAPI) {
    api.chainWebpack((chain: Chain) => {
        const inlineLimit = 4096;

        const genAssetSubPath = (dir: string): string => {
            if (isTiled) {
                return `[name]${api.projectOptions.filenameHashing ? '.[contenthash:8]' : ''}.[ext]`;
            }

            return getAssetPath(
                `${dir}/[name]${api.projectOptions.filenameHashing ? '.[contenthash:8]' : ''}.[ext]`,
                api.projectOptions.assetsDir,
            );
        };

        const genUrlLoaderOption = (dir: string, limit: number = inlineLimit): CSSLoaderOptions => {
            return {
                url: false,
                import: false,
                modules: false,
                sourceMap: false,
                limit: limit,
                esModule: false,
                fallback: {
                    loader: require.resolve('file-loader'),
                    options: {
                        name: genAssetSubPath(dir),
                        esModule: false,
                    },
                },
            };
        };

        chain.module
            .rule('images')
            .test(/\.(png|jpe?g|gif|webp)(\?.*)?$/)
            .exclude.add(filepath => {
                if (!filepath) {
                    return true;
                }

                if (/\.unpack\.(png|jpe?g|gif|webp)$/.test(filepath)) {
                    return true;
                }

                return false
            })
            .end()
            .type('javascript/auto')
            .use('url-loader')
            .loader(require.resolve('url-loader'))
            .options(genUrlLoaderOption('img'));

        chain.module
            .rule('unpack-images')
            .test(/\.unpack\.(png|jpe?g|gif|webp)$/)
            .type('javascript/auto')
            .use('url-loader')
            .loader(require.resolve('url-loader'))
            .options(genUrlLoaderOption('img', 1));

        let customSvgPaths: string[] = [];
        if (api.projectOptions.svgPaths && Array.isArray(api.projectOptions.svgPaths)) {
            customSvgPaths = api.projectOptions.svgPaths.map(p => {
                return api.resolve(p);
            });
        }

        chain.module
            .rule('svg')
            .test(/\.svg$/)
            .type('javascript/auto')
            .use('svg-sprite-loader')
            .loader(require.resolve('svg-sprite-loader'))
            .options({
                symbolId: '[name]',
                include: [api.resolve('src/asset/svg')].concat(customSvgPaths),
                extract: false,
            });

        chain.module
            .rule('media')
            .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
            .type('javascript/auto')
            .use('url-loader')
            .loader(require.resolve('url-loader'))
            .options(genUrlLoaderOption('media'));

        chain.module
            .rule('fonts')
            .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
            .type('javascript/auto')
            .use('url-loader')
            .loader(require.resolve('url-loader'))
            .options(genUrlLoaderOption('fonts'));
    });
}
