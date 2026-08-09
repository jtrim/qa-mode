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

## Use Case

LLMs tend to bias toward action, and the more action they take, the more momentum they build toward further action. Once a model is in a flow of writing files and running commands, it becomes increasingly likely to keep acting - even when the user just wanted to pause and think.

`qa-mode` exists to break that momentum. Sometimes you need to slow a model down: to ask clarifying questions, to review what's been done, or to plan the next step before committing to it. Toggling into Q&A Mode blocks mutating tools and reminds the model on every turn that it's in conversation mode, not execution mode. Toggle back when you're ready to act.

## What it does

- **Q&A Mode** blocks mutating tool calls (`write`, `edit`, `bash`) and injects a persistent reminder message into every turn
- **Action Mode** removes all restrictions
- State persists across sessions via `pi.appendEntry`