import * as vscode from "vscode";
import { fetchJson } from "./net";

export class SymbiLedgerProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private ctx: vscode.ExtensionContext) {}
  refresh(){ this._onDidChangeTreeData.fire(); }

  async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
    if (!element) {
      try {
        const res = await fetchJson("/api/sessions/recent?limit=50", this.ctx);
        const ids: string[] = res.items || [];
        return ids.map(id => {
          const item = new vscode.TreeItem(id, vscode.TreeItemCollapsibleState.None);
          item.contextValue = "session";
          item.tooltip = "Use 'SYMBI: Verify Ledger' to check integrity";
          return item;
        });
      } catch {
        return [new vscode.TreeItem("No sessions or server offline")];
      }
    }
    return [];
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem { return element; }
}

