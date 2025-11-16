# Markdown Toggle Preview

Toggle between a Markdown document's source and the built‑in VS Code preview using a single toolbar button or status bar entry.

## Features
- Editor title button (eye / code icon) for Markdown files
- Status bar indicator showing current mode (Preview / Source)
- Remembers per‑document state during a session
- Configurable default view (`markdownToggle.defaultView`)

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

## Development
```powershell
cd e:\markdown-toggle\markdown-toggle
npm install
npm run compile
# Press F5 in VS Code to launch Extension Development Host
```

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

