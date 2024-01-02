import {Configuration} from 'webpack';
import Config from '../chain';
import {MultiPageConfig} from './config/app';

type PluginConfig<T> =
    | string
    | [string, T?]
    | {
          request: string;
          resourcePath: string;
          options: T;
      };

export declare interface DevServer {
    [index: string]: any;
}

export interface ProjectOptions {
    publicPath: string;
    outputDir: string;
    assetsDir: string;
    filenameHashing: boolean;
    svgPaths?: string[];
    page?: MultiPageConfig;
    css?: {
        publicPath?: string;
        extract?: boolean;
        sourceMap?: boolean;
        loaderOptions?: Record<string, any>;
    };
    transpileDependencies?: boolean | Array<string | RegExp>;
    chainWebpack?: (chain: Config) => void;
    configureWebpack?: (config: Configuration) => Configuration;
    plugins?: Array<PluginConfig<any>>;
    presets?: string[];
    devServer?: DevServer;
}

export function defaults(): ProjectOptions {
    return {
        publicPath: '/',
        outputDir: 'dist',
        assetsDir: 'static',
        filenameHashing: true,
    };
}
