'use strict';
import { workspace, window, ExtensionContext, Uri, ViewColumn, Disposable, TextDocument, TextLine, TextEdit, WorkspaceEdit } from 'vscode';
import BaseDesigner from './baseDesigner';
//var Base64 = require('js-base64').Base64;

export default class YvanUIDesigner extends BaseDesigner {
    
    private _pendingEdits = 0;
    private _langId: string | null;

    constructor(context: ExtensionContext, uri: Uri, viewColumn: ViewColumn) {
        super(context, uri, "yvanui-designer", viewColumn);
        this.handleEvents();
        this.doUpdate();
    }

    private handleEvents() {
        let self = this;
        this.webview.onDidReceiveMessage((e) => {
            if (e.event === "rowEditEnded") {
                
            }
        }, null, this._disposables);
    }

    public getOptions(): any {
        return {
            uri: this.designerUri.toString(),
            state: this.state
        };        
    }

    private async doUpdate(): Promise<void> {
        try {
            const document = await workspace.openTextDocument(this.uri);
            this._langId = document ? document.languageId.toLowerCase() : null;
            let text = document.getText();
            let base64 = "";//Base64.encode(text);
            let options = this.getOptions();
            this.update(text, options);
        } catch (error) {
            window.showInformationMessage(error.message);
        }
    }
    
    refresh(): void {
        if (this._pendingEdits > 0) { return; }
        let self = this;
        workspace.openTextDocument(this.uri).then(document => {
            let text = document.getText();
            let base64 = "";//Base64.encode(text);
            let options = this.getOptions();
            this.update(text, options);
            self.webview.postMessage({
                refresh: true
            });
        });
    }

    html(content:string): string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            
        </head>
       
        <body style="padding:0px; overflow:hidden">
            <div id="flex"><input  id="inp"  value="${content}"><button onclick="save()">save</button>
            </div>
        </body>
        <script type="text/javascript">
            const vscode = acquireVsCodeApi();

            function save() {
                var t = document.getElementById("inp");
                vscode.postMessage({
                    command: 'save',
                    text: t.value
                })
            }
        </script>
        </html>`;
    }

}
