# Introducing Markdown Toggle Preview: Streamline Your Markdown Workflow in VS Code

If you work with Markdown files in Visual Studio Code, you've probably found yourself switching between the source code and preview views countless times. Opening the preview, closing it, reopening it—it's a small friction point that adds up over the course of a day. That's why I built **Markdown Toggle Preview**, a lightweight VS Code extension that makes toggling between source and preview as simple as clicking a button.

## The Problem

VS Code has excellent built-in Markdown preview support, but switching between source and preview requires either:
- Using the command palette (`Ctrl+Shift+P` → "Markdown: Open Preview")
- Clicking the preview icon in the top right which then shows both preview and source at the same time
- Clicking the preview icon in the top right while remembering to hold down the `alt` key

While these methods work, they don't provide a clear, persistent visual indicator of which mode you're in, and the preview state doesn't persist across sessions. For documentation writers, technical bloggers, and anyone working extensively with Markdown, this can become tedious.

## The Solution

**Markdown Toggle Preview** adds a simple, intuitive toggle button directly in your editor toolbar whenever you're working with a Markdown file. One click switches between source and preview mode—that's it.

### Key Features

**🎯 One-Click Toggle**  
A dedicated button appears in the editor title bar for all Markdown files. Click it to instantly switch between editing source and viewing the rendered preview.

**👁️ Visual Feedback**  
The button icon dynamically changes (eye icon for preview mode, code icon for source mode), and a status bar indicator shows your current view state at a glance.

**💾 Persistent State**  
The extension remembers your view preference for each document. Close VS Code, come back tomorrow, and your files will open in the same mode you left them—no need to toggle back to your preferred view.

**🧹 Smart Cleanup**  
Over time, view state for deleted or moved files could accumulate. The extension automatically cleans up stale entries on activation, and you can manually trigger cleanup via the command palette.

**⚙️ Configurable Defaults**  
Prefer to always start in preview mode? Just set `markdownToggle.defaultView` to `"preview"` in your settings. The extension respects your workflow.

## How It Works

The extension leverages VS Code's native Markdown preview API—meaning you get all the features you already love (GitHub-flavored Markdown, syntax highlighting in code blocks, math rendering, etc.) without any custom rendering logic or additional dependencies.

When you toggle to preview mode, the extension uses VS Code's built-in `markdown.showPreview` command. Toggle back, and you're editing source. Simple, reliable, and lightweight.

## Getting Started

### Installation

1. Open VS Code
2. Go to the Extensions view (`Ctrl+Shift+X`)
3. Search for "Markdown Toggle Preview"
4. Click Install

### Usage

1. Open any `.md` file
2. Look for the eye/code button in the editor title bar
3. Click to toggle between source and preview
4. (Optional) Check the status bar on the right to see your current mode

### Optional: Add a Keyboard Shortcut

Keyboard junkie? Add a custom keybinding:

```json
// keybindings.json
{
  "key": "ctrl+alt+m",
  "command": "markdownToggle.toggleView"
}
```

### Configuration

```json
// settings.json
{
  "markdownToggle.defaultView": "source" // or "preview"
}
```

## Why I Built This

As a developer who reads a lot of documentation and technical content, a lot of times I just wanted to view a markdown file. It irked me that there was no button to preview, the default behaviour of the existing preview button was split screen view which I don't like if I just want to read the markdown file. You had to rememeber hold `alt` key to achieve what I wanted. Also I wanted my preview state to persist across sessions. This extension scratches that itch—and I hope it helps you too.

## What's Next?

I currently don't have any further plans.

If you have feature requests or find any issues, please open an issue on the [GitHub repository](https://github.com/Tempuskg/markdown-toggle).

## Try It Out

If you work with Markdown files in VS Code, give **Markdown Toggle Preview** a try. It's a small improvement that makes a real difference in daily workflow. Download it from the VS Code Marketplace or check out the source code on GitHub.

Happy writing!

---

**Links:**
- [GitHub Repository](https://github.com/Tempuskg/markdown-toggle)
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=DarrenJMcLeod.markdown-toggle-preview)
- [Report Issues](https://github.com/Tempuskg/markdown-toggle/issues)

