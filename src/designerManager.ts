'use strict';
import { Uri } from 'vscode';
import BaseDesigner from './baseDesigner';

export class DesignerManager {
    
    private static _instance: DesignerManager;
    private _designers: BaseDesigner[] = [];

    private constructor() {
    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    public add(designer: BaseDesigner): void {
        this._designers.push(designer!);
    }

    public remove(designer: BaseDesigner): void {
        let found = this._designers.indexOf(designer!);
        if (found >= 0) {
            this._designers.splice(found, 1);
        }
    }

    public find(uri: Uri): BaseDesigner {        
        return this._designers.find(p => p.designerUri.toString() === uri.toString());
    }

    public active(): BaseDesigner {
        return this._designers.find(p => p.visible);
    }
    
    public configure(): void {
        this._designers.forEach(p => p.configure());
    }
}

export const designerManager = DesignerManager.Instance;
