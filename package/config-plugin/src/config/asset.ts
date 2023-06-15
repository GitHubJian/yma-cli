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
    sourceMap: false;
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

export default function (api: PluginAPI) {
    api.chainWebpack((chain: Chain) => {
        const inlineLimit = 4096;

        const genAssetSubPath = (dir: string): string => {
            return getAssetPath(
                `${dir}/[name]${api.projectOptions.filenameHashing ? '.[hash:8]' : ''}.[ext]`,
                api.projectOptions.assetsDir,
            );
        };

        const genUrlLoaderOption = (dir: string): CSSLoaderOptions => {
            return {
                url: false,
                import: false,
                modules: false,
                sourceMap: false,
                limit: inlineLimit,
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
            .type('javascript/auto')
            .use('url-loader')
            .loader(require.resolve('url-loader'))
            .options(genUrlLoaderOption('img'));

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
