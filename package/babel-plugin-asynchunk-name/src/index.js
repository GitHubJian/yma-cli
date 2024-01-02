function hasComment(comment) {
    return comment && comment.value.replace(/\*+/g, '').trim().startsWith('webpackChunkName');
}

function tryNormalizePath(p) {
    // TODO merge .ts
    const tryExts = ['.js', '.jsx', '.vue', '.ts', '.tsx'];
    // 目前项目中只有这三种导出文件名
    const tryNames = ['index', 'main', 'App'];

    const tryFilenames = tryNames
        .map(function (name) {
            return tryExts.map(function (ext) {
                return `${name}${ext}`;
            });
        })
        .reduce(function (prev, cur) {
            prev = prev.concat(cur);

            return prev;
        }, []);

    for (let i = 0; i < tryFilenames.length; i++) {
        const currentTryFilename = tryFilenames[i];
        if (p.endsWith(currentTryFilename)) {
            const pairs = p.split('/');
            pairs.pop();
            return pairs.join('/');
        }
    }

    return p;
}

module.exports = function ({types: t}, options = {}) {
    const replace =
        options.replace ||
        function tryReplace(p) {
            // TODO relative path
            if (p.startsWith('@/')) {
                p = p.replace('@/', '');
            }

            p = p.replace(/\//g, '_');

            return p;
        };

    function createWebpackChunkName(filename) {
        const normalizedPath = tryNormalizePath(filename);
        const chunkname = replace(normalizedPath);

        return chunkname;
    }

    return {
        visitor: {
            CallExpression(path) {
                if (path.node.callee.type !== 'Import') {
                    return;
                }

                const [arg] = path.node.arguments;
                const [comment] = arg.leadingComments || [];

                if (!hasComment(comment)) {
                    const webpackChunkName = createWebpackChunkName(arg.value);

                    t.addComment(arg, 'leading', `webpackChunkName: '${webpackChunkName}'`);

                    // TODO 输出文件路径
                    console.warn(
                        `[babel-webpack-chunkname-plugin]: 通过 [${arg.value}] 生成 WebpackChunkName [${webpackChunkName}]，建议手动调整更好的应用 HTTP Cache`,
                    );
                }
            },
        },
    };
};
