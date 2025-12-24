# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Obsidian community plugin built with TypeScript and bundled with esbuild. The plugin demonstrates core Obsidian API functionality including ribbon icons, commands, modals, settings, and event registration.

## Development Commands

```bash
# Install dependencies
npm install

# Development mode (watch + auto-rebuild)
npm run dev

# Production build (type-check + minified)
npm run build

# Lint code
npm run lint

# Version bump (updates manifest.json, package.json, versions.json)
npm version patch|minor|major
```

## Architecture

**Entry point**: `src/main.ts` → compiles to `main.js` via esbuild

**Current structure**:
- `src/main.ts` - Plugin class with lifecycle methods (onload/onunload), command registration, ribbon icons, DOM events
- `src/settings.ts` - Settings interface, defaults, and settings tab UI

**Key patterns**:
- Settings persistence: `loadSettings()` uses `loadData()` + `Object.assign()` with defaults, `saveSettings()` uses `saveData()`
- Safe cleanup: All DOM events and intervals registered via `registerDomEvent()` and `registerInterval()` for automatic cleanup on unload
- Commands: Registered in `onload()` with stable IDs (`open-modal-simple`, `replace-selected`, `open-modal-complex`)

## Build System

**esbuild configuration** (`esbuild.config.mjs`):
- Entry: `src/main.ts` → Output: `main.js` (root level)
- Format: CommonJS (CJS)
- Target: ES2018
- External: `obsidian`, `electron`, `@codemirror/*`, `@lezer/*`, Node.js builtins
- Dev mode: inline sourcemaps, watch mode enabled
- Production: minified, no sourcemaps, tree-shaking enabled

## File Organization Guidelines

**Important**: See `AGENTS.md` for comprehensive coding conventions, file structure recommendations, and code organization patterns.

Key points:
- Keep `main.ts` focused on lifecycle only - split features into separate modules
- Use directories for grouping: `commands/`, `ui/`, `utils/`
- Never commit `node_modules/` or `main.js`

## Release Artifacts

Required files in plugin folder (`<Vault>/.obsidian/plugins/sample-plugin/`):
- `main.js` (bundled output)
- `manifest.json`
- `styles.css` (optional)

## Current Plugin Features

The sample plugin demonstrates:
- Ribbon icon that shows a Notice on click
- Status bar item (desktop only)
- Three commands: simple modal, editor text replacement, conditional modal
- Settings tab with single text input
- Global click event listener (shows Notice on any click)
- Interval logging to console every 5 minutes

## Manifest Details

- **ID**: `sample-plugin` (must match folder name for local dev)
- **Desktop only**: `false` (mobile compatible - no Node.js/Electron APIs used)
- **Min Obsidian version**: 0.15.0

## Testing

1. Run `npm run dev` to start watch mode
2. Copy `main.js`, `manifest.json`, `styles.css` to `<Vault>/.obsidian/plugins/sample-plugin/`
3. Reload Obsidian
4. Enable plugin in **Settings → Community plugins**

Changes to `.ts` files auto-recompile; reload Obsidian to see updates.
