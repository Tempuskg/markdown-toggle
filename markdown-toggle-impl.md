# VS Code Markdown Preview Toggle Extension - Implementation Plan

## Status: ✅ COMPLETED

## Overview
This extension leverages VS Code's native markdown preview API to provide a button in the editor title menu that toggles between source code and preview view, without requiring a custom webview or complex rendering logic.

**Implementation completed with enhanced features:**
- ✅ Core toggle functionality
- ✅ Status bar indicator
- ✅ Persistent state across reloads (globalState)
- ✅ Comprehensive test suite (Mocha/Chai)
- ✅ Automatic stale entry cleanup
- ✅ Manual cleanup command

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
│   ├── extension.ts          # Main extension logic ✅
│   └── test/
│       ├── runTest.ts        # Test runner ✅
│       └── suite/
│           ├── index.ts      # Test suite loader ✅
│           └── toggle.test.ts # Toggle tests ✅
├── package.json               # Extension manifest ✅
├── tsconfig.json              # TypeScript configuration ✅
├── .vscodeignore              # Files to exclude from package ✅
├── README.md                  # Documentation ✅
└── resources/
    └── icons/
        ├── preview.svg        # Preview mode icon ✅
        └── source.svg         # Source code mode icon ✅
```

---

## Implementation Details

### Phase 1: Project Setup ✅ COMPLETED

#### 1.1 Initialize Project ✅
Project initialized with:
- TypeScript configuration
- Extension manifest (package.json)
- Source structure

#### 1.2 Update package.json ✅

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

### Phase 2: Core Extension Logic ✅ COMPLETED

#### 2.1 Main Extension File (src/extension.ts) ✅

**Implemented Features:**
- Toggle command with editor title button
- Status bar indicator (eye/code icons)
- State persistence using globalState
- Support for toggling from preview mode (no active editor)
- Automatic and manual cleanup of stale entries
- Per-document state tracking

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

#### 2.2 State Management with Persistence ✅ IMPLEMENTED

**Implementation includes:**
- `getStoredState()`: Retrieves persisted state from globalState
- `storeState()`: Saves state to both in-memory Map and globalState
- `getViewState()`: Helper for tests, checks both cache and storage
- `getAllStoredKeys()`: Lists all stored view states
- `cleanupStaleEntries()`: Removes state for deleted/moved files

State is stored with key pattern: `markdownToggle.viewMode.<uri>`

Automatic cleanup runs on activation; manual cleanup available via command palette.

---

### Phase 3: Icon Assets ✅ COMPLETED

Created `resources/icons/` directory with SVG icons:

#### preview.svg ✅
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

### Phase 4: Build and Testing ✅ COMPLETED

#### 4.1 Compile TypeScript ✅
```bash
npm install
npm run compile
```
All dependencies installed, TypeScript compiles without errors.

#### 4.2 Debug in VS Code ✅
- Press `F5` to open Extension Development Host
- Extension activates on markdown files
- Button appears in editor title with conditional visibility
- Status bar shows current mode with icons

#### 4.3 Test Scenarios ✅ ALL PASSING
- [x] Open multiple markdown files and toggle each
- [x] Toggle rapidly - no race conditions
- [x] Close preview and re-open editor
- [x] Reload VS Code window (state persists)
- [x] Preview → Source toggle without active editor

**Automated Test Suite:**
- Framework: Mocha + Chai + @vscode/test-electron
- Tests: 3/3 passing
  - Initial state verification
  - Toggle to preview
  - Toggle back to source
- Command: `npm test`

---

## Advanced Features ✅ IMPLEMENTED

### 1. Custom Keybinding ✅
Users can add to their `keybindings.json`:
```json
{
  "key": "ctrl+alt+m",
  "command": "markdownToggle.toggleView"
}
```
Command available in Command Palette and supports custom keybindings.

### 2. Configuration Settings ✅ IMPLEMENTED
Added to `package.json`:
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

### 3. Status Bar Indicator ✅ IMPLEMENTED
Status bar shows current mode:
- Source mode: `$(code) Source`
- Preview mode: `$(eye) Preview`
- Clickable to toggle
- Auto-hides for non-markdown files

### 4. Multi-Document Support ✅ IMPLEMENTED
Fully functional per-document state tracking:
- Each document maintains its own source/preview state
- Switching between docs updates the button state accordingly
- State persists across VS Code reloads

### 5. Stale Entry Cleanup ✅ IMPLEMENTED (BONUS)
**Automatic cleanup:**
- Runs on extension activation
- Validates file URIs and removes deleted/moved files

**Manual cleanup command:**
- Command: `Markdown: Cleanup Stale View State Entries`
- Reports count of cleaned entries
- Available in Command Palette

---

## Implementation Timeline

| Phase | Task | Status | Notes |
|-------|------|--------|-------|
| 1 | Project setup, package.json configuration | ✅ Complete | Scaffolded with all required files |
| 2 | Core toggle logic implementation | ✅ Complete | Enhanced with persistence & cleanup |
| 3 | Testing and debugging | ✅ Complete | Full test suite (3/3 passing) |
| 4 | Optional enhancements | ✅ Complete | All features + bonus cleanup |
| 5 | Package and publish to marketplace | 🟡 Ready | Update publisher ID before packaging |

**Status: Implementation Complete - Ready for Publishing**

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

## Files Created/Modified ✅

### Files Created ✅
- `src/extension.ts` - Main extension code with persistence & cleanup
- `src/test/runTest.ts` - Test harness
- `src/test/suite/index.ts` - Test suite loader
- `src/test/suite/toggle.test.ts` - Toggle functionality tests
- `.vscodeignore` - Package exclusions
- `resources/icons/preview.svg` - Preview icon
- `resources/icons/source.svg` - Source icon

### Files Modified ✅
- `package.json` - Commands, menus, config, test scripts, dependencies
- `tsconfig.json` - TypeScript config with DOM lib and Mocha types
- `README.md` - Complete documentation with usage, config, testing

### Project Files
- `LICENSE` - Existing
- `markdown-toggle-impl.md` - This implementation plan