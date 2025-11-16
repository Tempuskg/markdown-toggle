import * as vscode from 'vscode';

// Track view state per document (in-memory). Could be persisted with globalState if desired.
const viewStates: Map<string, 'source' | 'preview'> = new Map();

export function activate(context: vscode.ExtensionContext): void {
  const toggleCommand = vscode.commands.registerCommand('markdownToggle.toggleView', async () => {
    await toggleMarkdownView();
  });
  context.subscriptions.push(toggleCommand);

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
  if (!editor || editor.document.languageId !== 'markdown') {
    vscode.window.showWarningMessage('Current file is not markdown.');
    return;
  }

  const docUri = editor.document.uri;
  const key = docUri.toString();
  const configDefault = vscode.workspace.getConfiguration().get<string>('markdownToggle.defaultView', 'source');
  const currentState = viewStates.get(key) || configDefault;

  try {
    if (currentState === 'source') {
      await vscode.commands.executeCommand('markdown.showPreview', docUri);
      viewStates.set(key, 'preview');
    } else {
      await vscode.window.showTextDocument(editor.document, editor.viewColumn);
      viewStates.set(key, 'source');
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
  const state = viewStates.get(key) || configDefault;

  if (statusBar) {
    statusBar.text = state === 'source' ? '$(eye) Preview' : '$(code) Source';
    statusBar.tooltip = state === 'source' ? 'Switch to Markdown Preview' : 'Switch to Source';
    statusBar.show();
  }
}

export function deactivate(): void {}
