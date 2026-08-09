# qa-mode

A [Pi](https://github.com/badlogic/pi) extension that toggles between **Q&A Mode** (bias toward inaction and information gathering) and **Action Mode** (bias toward taking action).

## Install

Add to `~/.pi/agent/extensions/`:

```bash
git clone https://github.com/jtrim/qa-mode.git ~/.pi/agent/extensions/qa-mode
```

Then `/reload` in Pi.

## Usage

- `/qa` — toggles between Q&A Mode and Action Mode
- Status indicator appears in the footer when Q&A Mode is active

## What it does

- **Q&A Mode** blocks mutating tool calls (`write`, `edit`, `bash`) and injects a persistent reminder message into every turn
- **Action Mode** removes all restrictions
- State persists across sessions via `pi.appendEntry`