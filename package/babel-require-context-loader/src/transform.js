const path = require('path');
const glob = require('glob');

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

const FUNCTION_NAME = '__require_context__';

module.exports = function (filename, source) {
    const ast = parser.parse(source, {
        sourceType: 'module',
    });

    traverse(ast, {
        enter(p) {
            if (p.isCallExpression()) {
                if (
                    t.isIdentifier(p.node.callee) &&
                    p.node.callee.name === FUNCTION_NAME
                ) {
                    const args = p.node.arguments;
                    let directory, includeSubdirectories, regularExpression;
                    if (t.isStringLiteral(args[0])) {
                        directory = args[0].value;
                    }

                    if (t.isBooleanLiteral(args[1])) {
                        includeSubdirectories = args[1].value;
                    }

                    if (t.isRegExpLiteral(args[2])) {
                        regularExpression = args[2].pattern;
                    }

                    const baseDir = path.dirname(filename);
                    const folderDir = path.resolve(
                        path.dirname(filename),
                        directory
                    );

                    const relativeFilepaths = glob
                        .sync(includeSubdirectories ? '**' : '*', {
                            dot: false,
                            nodir: true,
                            cwd: folderDir,
                        })
                        .filter(function (p) {
                            return new RegExp(regularExpression).test(p);
                        });

                    const absoulteFilepaths = relativeFilepaths.map(function (
                        p
                    ) {
                        return path.resolve(folderDir, p);
                    });

                    const nodes = absoulteFilepaths.map(function (p) {
                        return t.importDeclaration([], t.stringLiteral(p));
                        // return t.expressionStatement(
                        //     t.callExpression(t.identifier('require'), [
                        //         t.stringLiteral(p),
                        //     ])
                        // );
                    });

                    p.parentPath.replaceWithMultiple(nodes);
                }
            }
        },
    });

    const ret = generate(ast, {
        sourceMaps: true,
    });

    return [ret.code, ret.map];
};