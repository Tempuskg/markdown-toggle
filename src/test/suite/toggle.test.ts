import * as vscode from 'vscode';
import { expect } from 'chai';
import { getViewState } from '../../extension';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Markdown Toggle Preview', () => {
  let doc: vscode.TextDocument;

  before(async () => {
    doc = await vscode.workspace.openTextDocument({ content: '# Heading\n', language: 'markdown' });
    await vscode.window.showTextDocument(doc);
    // Activation occurs on opening markdown file
    await delay(500);
  });

  it('initial state should be source (or default config)', () => {
    const state = getViewState(doc.uri) || 'source';
    expect(state).to.equal('source');
  });

  it('should toggle to preview', async () => {
    await vscode.commands.executeCommand('markdownToggle.toggleView');
    await delay(800); // allow preview to render
    const state = getViewState(doc.uri);
    expect(state).to.equal('preview');
  });

  it('should toggle back to source', async () => {
    await vscode.commands.executeCommand('markdownToggle.toggleView');
    await delay(800);
    const state = getViewState(doc.uri);
    expect(state).to.equal('source');
  });
});
