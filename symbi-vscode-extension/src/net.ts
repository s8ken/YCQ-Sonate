import * as vscode from "vscode";

export function getApiBase(): string | undefined {
  return vscode.workspace.getConfiguration("symbi").get<string>("apiBase") || (process.env as any).NEXT_PUBLIC_API_BASE;
}

export async function fetchJson(path: string, ctx: vscode.ExtensionContext, init: RequestInit = {}) {
  const base = getApiBase();
  if (!base) throw new Error("API base not configured (symbi.apiBase)");
  const headers: Record<string, string> = { ...(init.headers as any) };
  const token = await ctx.secrets.get("SYMBI_API_KEY");
  if (token) headers.Authorization = `Bearer ${token}`;
  headers["Content-Type"] = headers["Content-Type"] || "application/json";
  const res = await fetch(base + path, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${text}`.trim());
  }
  return res.json();
}

export async function saveToken(ctx: vscode.ExtensionContext) {
  const val = await vscode.window.showInputBox({
    prompt: "Enter SYMBI_API_KEY (stored securely in VS Code Secret Storage)",
    password: true, ignoreFocusOut: true
  });
  if (!val) return;
  await ctx.secrets.store("SYMBI_API_KEY", val);
  vscode.window.showInformationMessage("SYMBI_API_KEY saved to Secret Storage.");
}

