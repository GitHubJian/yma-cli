function toArray(list, start) {
    start = start || 0;
    let i = list.length - start;
    let ret = new Array(i);
    while (i--) {
        ret[i] = list[i + start];
    }
    return ret;
}

type CtorPluginApplier = (...args: any[]) => void;

type CtorPlugin = CtorPluginApplier & {
    install: CtorPluginApplier;
};

class Ctor {
    static _installedPlugins = [];

    static use(plugin: CtorPlugin) {
        let installedPlugins: CtorPlugin[] = this._installedPlugins || (this._installedPlugins = []);
        if (installedPlugins.includes(plugin)) {
            return this;
        }

        // additional parameters
        let args = toArray(arguments, 1);
        args.unshift(this);
        if (typeof plugin.install === 'function') {
            plugin.install.apply(plugin, args);
        } else if (typeof plugin === 'function') {
            plugin.apply(null, args);
        }

        installedPlugins.push(plugin);
        return this;
    }
}

export default Ctor;
