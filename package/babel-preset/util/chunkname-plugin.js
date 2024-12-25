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

function tryReplace(p) {
    // TODO relative path
    if (p.startsWith('@/')) {
        p = p.replace('@/', '');
    }

    p = p.replace(/\//g, '_');

    return p;
}

function createWebpackChunkName(filename) {
    const normalizedPath = tryNormalizePath(filename);
    const chunkname = tryReplace(normalizedPath);

    return chunkname;
}

module.exports = function ({types: t}) {
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

                    t.addComment(arg, 'leading', 'webpackPrefetch: true');

                    // TODO 输出文件路径
                    console.warn(
                        `[babel-webpack-chunkname-plugin]: 对 import("${arg.value}") 新增注释 webpackChunkName: ${webpackChunkName} & webpackPrefetch: true`,
                    );
                }
            },
        },
    };
};
