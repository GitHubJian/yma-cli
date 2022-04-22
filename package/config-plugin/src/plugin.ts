import {loadModule} from 'yma-shared-util';
import PluginAPI from '.';

type PluginImpl<T> = (api: PluginAPI, options?: T) => Promise<void>;

export default class<T> {
    request: string;
    options?: T;

    constructor(request: string, options?: T) {
        this.request = request;
        this.options = options;
    }

    async apply(api: PluginAPI) {
        const mod: PluginImpl<T> = loadModule(this.request, process.cwd());
        await mod(api, this.options);
    }
}
