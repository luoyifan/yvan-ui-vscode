// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { window, workspace, commands, ExtensionContext, Uri, ViewColumn, TextDocument, Webview } from 'vscode';
import { designerManager } from './designerManager';
import YvanUIDesigner from './yvanUIDesigner';
import * as path from 'path';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

	let designerCommand = commands.registerCommand('yvanui.designer', (uri) => {
		let resource = uri;
        let viewColumn = getViewColumn();
        if (!(resource instanceof Uri)) {
            if (window.activeTextEditor) {
                resource = window.activeTextEditor.document.uri;
                viewColumn = window.activeTextEditor.viewColumn;
            } else {
                window.showInformationMessage("Open a view file first to show a designer.");
                return;
            }
        }
        const viewFile = resource.with({
            scheme: 'yvanui-designer'
        });
        let designer = designerManager.find(viewFile);
        if (designer) {
            designer.reveal();
            return;
        }
        designer = new YvanUIDesigner(context, resource, viewColumn);
        return designer.webview;
	});

    context.subscriptions.push(designerCommand);
    
    
    // Refresh 
    workspace.onDidSaveTextDocument(document => {
        if (isViewFile(document)) {
            let resource: any = document.uri;
            const uri = resource.with({
                scheme: 'yvanui-designer'
            });
            let designer = designerManager.find(uri);
            if (designer) {
                designer.refresh();
            }
        }
    });

    // Refresh 
    workspace.onDidChangeTextDocument(args => {
        if (isViewFile(args.document)) {
            let resource: any = args.document.uri;
            let scheme = resource.scheme;
            const uri = resource.with({
                scheme: 'yvanui-designer'
            });
            let designer = designerManager.find(uri);
            if (designer && args.contentChanges.length > 0) {
                designer.refresh();
            }
        }
    });

    // Reset all designers when the configuration changes
    workspace.onDidChangeConfiguration(() => {
        designerManager.configure();
    });

    // Automatically designer content piped from stdin (when VSCode is already open)
    workspace.onDidOpenTextDocument(document => {
        if (isStdinFile(document)) {
            commands.executeCommand('yvanui.designer', document.uri);
        }
    });

    // Automaticlly designer content piped from stdin (when VSCode first starts up)
    if (window.activeTextEditor) {
        let document = window.activeTextEditor.document;
        if (isStdinFile(document)) {
            commands.executeCommand('yvanui.designer', document.uri);
        }
    }
}

function isViewFile(document: TextDocument) {
    if (document) {
        let lang = document.languageId.toLowerCase();
        let allowed = ['view'];
        return allowed.find(a => a === lang) && document.uri.scheme !== 'yvanui-designer';
    }
    return false;
}

function isStdinFile(document: TextDocument) {
    return ( document) ? path.basename(document.fileName).match("code-stdin-[^.]+.txt") : false;
}
// this method is called when your extension is deactivated
export function deactivate() {}

function getViewColumn(): ViewColumn {
    const active = window.activeTextEditor;
    return active ? active.viewColumn : ViewColumn.One;
}
