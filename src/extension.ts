import * as vscode from 'vscode';

// Track view state per document (cache). Persisted in globalState.
const viewStates: Map<string, 'source' | 'preview'> = new Map();
let lastToggledUri: vscode.Uri | undefined;
let extCtx: vscode.ExtensionContext | undefined;

function getStoredState(key: string): 'source' | 'preview' | undefined {
  if (!extCtx) return undefined;
  return extCtx.globalState.get<'source' | 'preview'>(`markdownToggle.viewMode.${key}`);
}

function storeState(key: string, state: 'source' | 'preview'): void {
  viewStates.set(key, state);
  if (extCtx) {
    extCtx.globalState.update(`markdownToggle.viewMode.${key}`, state);
  }
}

async function getAllStoredKeys(): Promise<string[]> {
  if (!extCtx) return [];
  const keys = extCtx.globalState.keys();
  return keys.filter(k => k.startsWith('markdownToggle.viewMode.'));
}

async function cleanupStaleEntries(): Promise<number> {
  if (!extCtx) return 0;
  const storedKeys = await getAllStoredKeys();
  let cleanedCount = 0;

  for (const fullKey of storedKeys) {
    const uriString = fullKey.replace('markdownToggle.viewMode.', '');
    try {
      const uri = vscode.Uri.parse(uriString);
      // Check if the file exists (for file:// URIs)
      if (uri.scheme === 'file') {
        try {
          await vscode.workspace.fs.stat(uri);
        } catch {
          // File doesn't exist, remove stale entry
          await extCtx.globalState.update(fullKey, undefined);
          viewStates.delete(uriString);
          cleanedCount++;
        }
      }
      // For non-file URIs (untitled, etc.), keep them
    } catch {
      // Invalid URI, remove stale entry
      await extCtx.globalState.update(fullKey, undefined);
      cleanedCount++;
    }
  }

  return cleanedCount;
}

export function getViewState(uri: vscode.Uri): 'source' | 'preview' | undefined {
  const key = uri.toString();
  return viewStates.get(key) || getStoredState(key);
}

export function activate(context: vscode.ExtensionContext): void {
  extCtx = context;
  
  const toggleCommand = vscode.commands.registerCommand('markdownToggle.toggleView', async () => {
    await toggleMarkdownView();
  });
  context.subscriptions.push(toggleCommand);

  const cleanupCommand = vscode.commands.registerCommand('markdownToggle.cleanupStaleEntries', async () => {
    const count = await cleanupStaleEntries();
    vscode.window.showInformationMessage(`Cleaned up ${count} stale markdown view state(s).`);
  });
  context.subscriptions.push(cleanupCommand);

  // Automatic cleanup on activation (runs in background)
  cleanupStaleEntries().catch(err => {
    console.error('Failed to cleanup stale entries:', err);
  });

  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.command = 'markdownToggle.toggleView';
  context.subscriptions.push(statusBar);

  const editorChangeDisposable = vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor | undefined) => {
    updateUI(editor, statusBar);
  });
  context.subscriptions.push(editorChangeDisposable);

  updateUI(vscode.window.activeTextEditor, statusBar);
}

async function toggleMarkdownView(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  let docUri: vscode.Uri | undefined;

  if (editor && editor.document.languageId === 'markdown') {
    docUri = editor.document.uri;
  } else if (!editor && lastToggledUri) {
    // We are likely in preview mode; use last toggled markdown document
    docUri = lastToggledUri;
  }

  if (!docUri) {
    vscode.window.showWarningMessage('No markdown document to toggle.');
    return;
  }

  const key = docUri.toString();
  const configDefault = vscode.workspace.getConfiguration().get<string>('markdownToggle.defaultView', 'source');
  const currentState = viewStates.get(key) || getStoredState(key) || configDefault;

  try {
    if (currentState === 'source') {
      await vscode.commands.executeCommand('markdown.showPreview', docUri);
      storeState(key, 'preview');
      lastToggledUri = docUri;
    } else {
      // editor might be undefined (in preview); reopen source document
      const textDoc = await vscode.workspace.openTextDocument(docUri);
      await vscode.window.showTextDocument(textDoc, editor?.viewColumn);
      storeState(key, 'source');
      lastToggledUri = docUri;
    }
  } catch (err) {
    vscode.window.showErrorMessage(`Failed to toggle markdown view: ${err}`);
  }

  updateUI(vscode.window.activeTextEditor);
}

function updateUI(editor: vscode.TextEditor | undefined, statusBar?: vscode.StatusBarItem): void {
  if (!editor || editor.document.languageId !== 'markdown') {
    if (statusBar) {
      statusBar.hide();
    }
    return;
  }

  const key = editor.document.uri.toString();
  const configDefault = vscode.workspace.getConfiguration().get<string>('markdownToggle.defaultView', 'source');
  const state = viewStates.get(key) || getStoredState(key) || configDefault;

  if (statusBar) {
    statusBar.text = state === 'source' ? '$(eye) Preview' : '$(code) Source';
    statusBar.tooltip = state === 'source' ? 'Switch to Markdown Preview' : 'Switch to Source';
    statusBar.show();
  }
}

export function deactivate(): void {}
