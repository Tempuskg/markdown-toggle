# VS Code Markdown Preview Toggle Extension - Implementation Plan

## Overview
This extension leverages VS Code's native markdown preview API to provide a button in the editor title menu that toggles between source code and preview view, without requiring a custom webview or complex rendering logic.

## Architecture

### Core Approach
- Use native `markdown.showPreview` and `markdown.showPreviewToSide` commands
- Maintain state to track current view mode (source vs. preview)
- Intercept editor focus to manage toggle behavior
- Display button in editor title menu bar with conditional visibility

### Why This Works
VS Code's built-in markdown preview already handles rendering, synchronization, and all markdown features. This extension adds only the toggle UI layer and state management, making it lightweight and maintainable.

---

## Project Structure

```
markdown-toggle-extension/
├── src/
│   └── extension.ts          # Main extension logic
├── package.json               # Extension manifest
├── tsconfig.json              # TypeScript configuration
├── .vscodeignore               # Files to exclude from package
└── resources/
    └── icons/
        ├── preview.svg        # Preview mode icon
        └── source.svg         # Source code mode icon
```

---

## Implementation Details

### Phase 1: Project Setup

#### 1.1 Initialize Project
```bash
npm install -g yo generator-code
yo code --insiders
# Select TypeScript
# Name: markdown-toggle-preview
```

#### 1.2 Update package.json

Key sections to configure:

```json
{
  "name": "markdown-toggle-preview",
  "displayName": "Markdown Toggle Preview",
  "description": "Toggle between markdown source and preview with a button",
  "version": "0.0.1",
  "engines": {
    "vscode": "^1.75.0"
  },
  "categories": ["Other"],
  "activationEvents": [
    "onLanguage:markdown"
  ],
  "contributes": {
    "commands": [
      {
        "command": "markdownToggle.toggleView",
        "title": "Toggle Markdown Preview",
        "icon": "$(eye)",
        "category": "Markdown"
      }
    ],
    "menus": {
      "editor/title": [
        {
          "when": "editorLangId == markdown",
          "command": "markdownToggle.toggleView",
          "group": "navigation"
        }
      ]
    }
  }
}
```

**Key Points:**
- `activationEvents`: Extension activates only when a markdown file is opened
- `editorLangId == markdown`: Button only appears for markdown files
- `group: "navigation"`: Places button in the editor title toolbar
- Icon: Uses built-in VS Code icon ($(eye) for preview toggle)

---

### Phase 2: Core Extension Logic

#### 2.1 Main Extension File (src/extension.ts)

```typescript
import * as vscode from 'vscode';

// Track view state for each document
const viewStates = new Map<string, 'source' | 'preview'>();

export function activate(context: vscode.ExtensionContext) {
  console.log('Markdown Toggle Preview activated');

  // Register the toggle command
  const toggleCommand = vscode.commands.registerCommand(
    'markdownToggle.toggleView',
    async () => {
      await toggleMarkdownView();
    }
  );

  context.subscriptions.push(toggleCommand);

  // Track editor changes to update state
  const editorChangeDisposable = vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      updateButtonState(editor);
    }
  );

  context.subscriptions.push(editorChangeDisposable);

  // Initial button state
  updateButtonState(vscode.window.activeTextEditor);
}

async function toggleMarkdownView(): Promise<void> {
  const editor = vscode.window.activeTextEditor;

  if (!editor || editor.document.languageId !== 'markdown') {
    vscode.window.showWarningMessage('Not a markdown file');
    return;
  }

  const docUri = editor.document.uri;
  const docKey = docUri.toString();
  const currentState = viewStates.get(docKey) || 'source';

  try {
    if (currentState === 'source') {
      // Switch to preview - open in current column
      await vscode.commands.executeCommand(
        'markdown.showPreview',
        docUri
      );
      viewStates.set(docKey, 'preview');
    } else {
      // Switch back to source - show text editor
      await vscode.window.showTextDocument(
        editor.document,
        editor.viewColumn
      );
      viewStates.set(docKey, 'source');
    }
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to toggle markdown view: ${error}`
    );
  }
}

function updateButtonState(editor: vscode.TextEditor | undefined): void {
  if (!editor || editor.document.languageId !== 'markdown') {
    return;
  }

  const docKey = editor.document.uri.toString();
  const state = viewStates.get(docKey) || 'source';

  // Optional: Update button appearance based on state
  // This would require additional VS Code API calls or settings
}

export function deactivate() {}
```

**Design Decisions:**

1. **State Tracking**: Uses a `Map` to track whether each document is being viewed in source or preview mode. This persists across editor focus changes.

2. **Command Implementation**: 
   - `markdown.showPreview` replaces the editor with preview (full-screen equivalent)
   - `vscode.window.showTextDocument()` returns to source view
   - Both use the same `viewColumn` to maintain window position

3. **Error Handling**: Includes guard clauses and try-catch for robustness

4. **Active Events**: Only activates on markdown files to reduce performance impact

#### 2.2 Alternative: More Robust State Management

If you want to persist state across sessions:

```typescript
async function toggleMarkdownView(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== 'markdown') return;

  const docUri = editor.document.uri;
  const docKey = docUri.toString();
  
  // Store state in extension global state
  const stateKey = `markdown.viewMode.${docKey}`;
  const currentState = await context.globalState.get(stateKey, 'source');

  if (currentState === 'source') {
    await vscode.commands.executeCommand('markdown.showPreview', docUri);
    await context.globalState.update(stateKey, 'preview');
  } else {
    await vscode.window.showTextDocument(editor.document, editor.viewColumn);
    await context.globalState.update(stateKey, 'source');
  }
}
```

---

### Phase 3: Icon Assets (Optional Enhancement)

Create `resources/icons/` directory with SVG icons:

#### preview.svg
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
  <path d="M12 5c-4 0-7.5 2.5-9 5 1.5 2.5 5 5 9 5s7.5-2.5 9-5c-1.5-2.5-5-5-9-5z"/>
  <circle cx="12" cy="12" r="2"/>
</svg>
```

Update `package.json`:
```json
{
  "command": "markdownToggle.toggleView",
  "icon": {
    "light": "resources/icons/preview.svg",
    "dark": "resources/icons/preview.svg"
  }
}
```

Note: Built-in icons like `$(eye)` work without creating files.

---

### Phase 4: Build and Testing

#### 4.1 Compile TypeScript
```bash
npm install
npm run compile
```

#### 4.2 Debug in VS Code
- Press `F5` to open Extension Development Host
- Create a test markdown file
- Verify button appears in editor title
- Click button to toggle between source and preview

#### 4.3 Test Scenarios
- [ ] Open multiple markdown files and toggle each
- [ ] Toggle rapidly - ensure no race conditions
- [ ] Close preview and re-open editor
- [ ] Reload VS Code window
- [ ] Markdown file with complex syntax (code blocks, links, images)

---

## Advanced Features (Optional Enhancements)

### 1. Custom Keybinding
Users can add to their `keybindings.json`:
```json
{
  "key": "ctrl+alt+m",
  "command": "markdownToggle.toggleView"
}
```

### 2. Configuration Settings
Add to `package.json`:
```json
"configuration": {
  "title": "Markdown Toggle Preview",
  "properties": {
    "markdownToggle.defaultView": {
      "type": "string",
      "enum": ["source", "preview"],
      "default": "source",
      "description": "Default view when opening markdown files"
    }
  }
}
```

### 3. Status Bar Indicator
Show current mode in status bar:
```typescript
const statusBar = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Right,
  100
);
statusBar.text = `$(eye) Preview`;
statusBar.command = 'markdownToggle.toggleView';
statusBar.show();
```

### 4. Multi-Document Support
Track state per document (already implemented in core logic):
- Each document maintains its own source/preview state
- Switching between docs updates the button state accordingly

---

## Implementation Timeline

| Phase | Task | Time |
|-------|------|------|
| 1 | Project setup, package.json configuration | 30 min |
| 2 | Core toggle logic implementation | 1 hour |
| 3 | Testing and debugging | 1 hour |
| 4 | Optional enhancements (keybindings, settings) | 1 hour |
| 5 | Package and publish to marketplace | 30 min |

**Total: 4-5 hours for full implementation**

---

## Key Advantages of Middle Ground Approach

1. **Minimal Code**: ~100-150 lines vs. 1000+ for a custom implementation
2. **Leverages VS Code Features**: Uses tested, stable native APIs
3. **Zero Configuration**: Works out-of-box once installed
4. **Performance**: No custom rendering overhead
5. **Maintenance**: No need to track VS Code API changes for rendering
6. **User Familiarity**: Native preview behavior users already know

---

## Potential Issues & Solutions

| Issue | Solution |
|-------|----------|
| Preview doesn't update in real-time | Native behavior - use side-by-side view as fallback |
| Button doesn't appear | Verify `editorLangId == markdown` and file has `.md` extension |
| Command fails | Check activation events and ensure markdown language is recognized |
| State persists incorrectly | Use `context.globalState` instead of in-memory `Map` |

---

## Publishing to Marketplace

Once complete:

```bash
npm install -g vsce
vsce package
vsce publish
```

Requires:
- Personal Access Token from Azure DevOps
- Publisher account setup
- README and CHANGELOG

---

## Files to Create/Modify

### Files to Create
- `src/extension.ts` - Main extension code
- `.vscodeignore` - Exclude unnecessary files from package
- `resources/icons/` - Optional icon assets

### Files to Modify
- `package.json` - Add commands, menus, activation events
- `tsconfig.json` - Ensure `"target": "ES2020"` or later

### Files Generated by Yo Code
- `README.md` - Extension documentation
- `CHANGELOG.md` - Version history
- `.gitignore` - Git exclusions
- `vsc-extension-quickstart.md` - Setup guide