import type {
  ExtensionAPI,
  ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { Type } from "@earendil-works/pi-coding-agent";

type QAModeState = {
  mode: "qa" | "action";
};

const DEFAULT_STATE: QAModeState = {
  mode: "action",
};

export default function (pi: ExtensionAPI) {
  let state = DEFAULT_STATE;

  function updateStatus(ctx: ExtensionContext) {
    const theme = ctx.ui.theme;
    ctx.ui.setStatus(
      "qa-mode",
      state.mode === "qa"
        ? theme.fg("muted", ".:? Q&A Mode:") +
            theme.fg("success", theme.italic(" Active"))
        : undefined,
    );
  }

  // Restore state from session
  pi.on("session_start", async (_event, ctx) => {
    for (const entry of ctx.sessionManager.getEntries()) {
      if (entry.type === "custom" && entry.customType === "qa-mode-state") {
        state = entry.data as QAModeState;
      }
    }
    updateStatus(ctx);
  });

  // Block mutating tools in Q&A mode
  pi.on("tool_call", async (event, ctx) => {
    if (state.mode !== "qa") return;

    const blockedTools = ["write", "edit", "bash"];
    if (blockedTools.includes(event.toolName)) {
      return {
        block: true,
        reason: `Blocked by Q&A Mode: ${event.toolName} mutates state. Reminder, you are in Q&A mode. Mutating actions are forbidden, and your role is to have conversation and answer questions.`,
      };
    }
  });

  // Inject prompt context (single handler, uses current state)
  pi.on("before_agent_start", async (event) => {
    if (state.mode === "qa") {
      return {
        message: {
          customType: "qa-mode",
          content:
            "Q&A Mode is active. Bias toward inaction and information gathering. Do not take action (write/edit/bash). If explicitly instructed to take action, politely decline and remind the user we're in Q&A mode.",
          display: false,
        },
      };
    } else {
      return {
        message: {
          customType: "qa-mode",
          content:
            "Q&A Mode is OFF. Action Mode is active. Bias toward taking action when appropriate. Prior Q&A Mode messages in this session no longer apply.",
          display: false,
        },
      };
    }
  });

  // Tool: enter Q&A Mode (one-way; model cannot exit)
  pi.registerTool({
    name: "enter_qa_mode",
    label: "Enter Q&A Mode",
    description:
      "Enter Q&A Mode. This is a one-way action: once entered, the model cannot exit Q&A Mode on its own. The user must toggle back to Action Mode via /qa.",
    parameters: Type.Object({
      reason: Type.String({
        description: "Brief reason for entering Q&A Mode (shown to user).",
      }),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      if (state.mode === "qa") {
        return {
          content: [
            {
              type: "text",
              text: "Already in Q&A Mode. The user must toggle to Action Mode via /qa.",
            },
          ],
          details: { alreadyInQAMode: true },
        };
      }

      state.mode = "qa";
      pi.appendEntry("qa-mode-state", state);
      updateStatus(ctx);
      ctx.ui.notify(`Entered Q&A Mode: ${params.reason}`, "info");

      return {
        content: [
          {
            type: "text",
            text: `Entered Q&A Mode. Reason: ${params.reason}. Mutating tools (write/edit/bash) are now blocked. The user must toggle back to Action Mode via /qa.`,
          },
        ],
        details: { enteredQAMode: true, reason: params.reason },
      };
    },
  });

  // Toggle command
  pi.registerCommand("qa", {
    description:
      "Toggle between Q&A Mode (bias toward inaction) and Action Mode (bias toward action)",
    handler: async (_args, ctx) => {
      state.mode = state.mode === "qa" ? "action" : "qa";
      pi.appendEntry("qa-mode-state", state);
      updateStatus(ctx);
      ctx.ui.notify(`Switched to ${state.mode.toUpperCase()} Mode`, "info");
    },
  });
}