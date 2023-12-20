const vscode = require('vscode');

module.exports = function (context) {
    const disposable = vscode.commands.registerCommand('yma.env', uri => {
        const selectedWorkspaceFolder = vscode.workspace.getWorkspaceFolder(uri);

        let nodeVersion;
        try {
            const pkg = require(selectedWorkspaceFolder.uri.path + '/package.json');
            nodeVersion = pkg.engines.node;
        } catch (e) {
            console.error('Not Found [pkg.engines.node]');
        }

        const terminal = vscode.window.createTerminal();
        terminal.show(true);
        // terminal.sendText(`nvm install ${nodeVersion}`);
        terminal.sendText(`nvm use ${nodeVersion}`);

        // 新建终端时进行 node 版本更新
        vscode.window.onDidOpenTerminal(function (terminal) {
            terminal.sendText(`nvm use ${nodeVersion}`);
        });
    });

    context.subscriptions.push(disposable);
};
