# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tampermonkey userscript that enhances Google search results with keyboard navigation. The entire functionality is contained in a single JavaScript file (`gss.user.js`) that runs as a browser userscript.

## Architecture

The codebase follows a modular JavaScript architecture within a single file:

- **CONFIG**: Central configuration object containing CSS selectors, styles, and scroll behavior
- **DOMCache**: Caches frequently accessed DOM elements and provides refresh functionality
- **Utils**: Utility functions for text input detection, cursor manipulation, and debouncing
- **NavigationController**: Main navigation logic handling result highlighting and keyboard navigation
- **PaginationHandler**: Handles next/previous page navigation
- **SearchInputHandler**: Manages focus/blur of Google's search input
- **KeyboardHandler**: Event handlers for keyup/keydown events with different behaviors
- **DOMObserver**: MutationObserver to handle dynamic content changes in Google's SPA

## Key Features

The userscript provides keyboard shortcuts for Google search:
- `j`/`↓`: Next result
- `k`/`↑`: Previous result  
- `Enter`: Open link (normal navigation)
- `Shift+Enter`/`Cmd+Enter`: Open in new tab
- `/`: Focus search input
- `l`/`→`: Next page (respects Cmd+L for address bar)
- `h`/`←`: Previous page
- `Esc`: Blur search input and refocus results

## Development Notes

- No build process - this is a standalone userscript
- No package.json, tests, or dependencies
- Version is manually updated in the userscript header (line 6)
- Installation is through Tampermonkey browser extension
- Targets Google search result pages (*.google.*/search*)

## Code Structure

- **Selectors**: Uses CSS selectors to target Google's search result elements (`.MjjYud`, `.A6K0A`)
- **Event Handling**: Separates keyup (escape) and keydown (navigation) for proper functionality
- **DOM Observation**: Uses MutationObserver with debouncing to handle Google's dynamic content loading
- **State Management**: Simple index-based navigation state in NavigationController

## Testing

Manual testing required on Google search pages with Tampermonkey installed. No automated test suite exists.