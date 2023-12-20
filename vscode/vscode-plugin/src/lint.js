const vscode = require('vscode');

function lint(p) {
    const terminal = vscode.window.createTerminal();
    terminal.show(true);

    const cmd = `yma lint --paths ${p}`;
    terminal.sendText('nvm use 14.17.0');

    terminal.sendText(cmd);
}

module.exports = function (context) {
    const disposable = vscode.commands.registerCommand('yma.lint', uri => {
        lint(uri.path);
    });

    context.subscriptions.push(disposable);
};
