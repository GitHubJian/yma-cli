class VCosnoleWebpackPlugin {
    constructor() {}

    apply(compiler) {
        compiler.hooks.entryOption.tap('EntryOptionPlugin', (context, entry) => {
            for (const name of Object.keys(entry)) {
                const desc = entry[name];
                desc.import = [require.resolve('../public/vconsole.js'), ...desc.import];
            }
        });
    }
}

export default VCosnoleWebpackPlugin;
