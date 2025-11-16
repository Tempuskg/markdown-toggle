# Markdown Toggle Preview

Toggle between a Markdown document's source and the built‑in VS Code preview using a single toolbar button or status bar entry.

## Features
- Editor title button (eye / code icon) for Markdown files
- Status bar indicator showing current mode (Preview / Source)
- Remembers per‑document state during a session
- Configurable default view (`markdownToggle.defaultView`)
 - Persisted view state across reloads (stored per document URI)

## Usage
1. Open any `.md` file.
2. Click the eye / code button in the editor title OR use the status bar item on the right.
3. (Optional) Add a custom keybinding:
```jsonc
// keybindings.json
{
	"key": "ctrl+alt+m",
	"command": "markdownToggle.toggleView"
}
```

## Configuration
```jsonc
// settings.json
{
	"markdownToggle.defaultView": "source" // or "preview"
}
```

**Persisted state:** The last view (source/preview) per markdown document is stored using VS Code's `globalState`. When you reopen a file, the toolbar/status bar reflects this stored mode; toggling resumes from that state.

**Cleanup stale entries:** Over time, state entries for deleted/moved files may accumulate. The extension automatically cleans these up on activation. You can also manually trigger cleanup via the command palette:
- Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
- Run: `Markdown: Cleanup Stale View State Entries`

## Development
```powershell
cd e:\markdown-toggle\markdown-toggle
npm install
npm run compile
# Press F5 in VS Code to launch Extension Development Host
```

## Testing
```powershell
# Run the full test suite (compiles then launches VS Code test runner)
npm test
```
This runs `npm run compile` and then executes `dist/test/runTest.js` using `@vscode/test-electron`, which spins up an Extension Development Host and runs Mocha tests from `dist/test/suite/**/*.test.js`.

Tips:
- Fast iteration: keep a terminal running `npm run watch` in one pane, then re-run `npm test` after changes.
- Debugging: set breakpoints in the TypeScript files; use the built-in "Run Extension" launch config (F5). Once the host opens, use "Developer: Toggle Developer Tools" for console output.
- Single test focus: temporarily add `.only` to a `describe` or `it` block in the test file.

## Packaging / Publishing
```powershell
npm install @vscode/vsce -D
npx vsce package
npx vsce publish   # requires publisher setup & token
```

## Folder Structure
```
├── src/extension.ts        # Core logic
├── package.json            # Manifest & scripts
├── tsconfig.json           # TypeScript config
├── resources/icons/*.svg   # Optional icons
```

## License
Refer to `LICENSE` in repository.

