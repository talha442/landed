#!/usr/bin/env node
// 8x agent capture: turns a Claude Code session transcript into
// .agent-logs/YYYY-MM-DD_HH-MM-SS_<session-id>.md (prompt + final response per turn).
//
// Wired to the UserPromptSubmit and Stop hooks in .claude/settings.json, so it runs on
// its own every turn. Claude Code passes {session_id, transcript_path, ...} on stdin.
//
// The log is rebuilt from the transcript every time. The transcript is append-only, so
// earlier entries come out byte-identical on every run; only the frontmatter counters
// (total_exchanges, last_prompt_time, model) change as the session grows.
//
// Manual use (backfill): node .claude/hooks/capture.mjs --transcript <path-to.jsonl>

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const LOG_DIR = path.join(ROOT, ".agent-logs");
const ERR_LOG = path.join(ROOT, ".claude", "hooks", "capture-errors.log");
const CONFIG = readJson(path.join(ROOT, ".claude", "hooks", "capture.config.json")) ?? {};

main().catch((err) => {
  try {
    fs.appendFileSync(ERR_LOG, `${new Date().toISOString()} ${err?.stack ?? err}\n`);
  } catch {}
  process.exit(0); // never block the session
});

async function main() {
  const input = await readHookInput();
  const transcriptPath = input.transcript_path;
  if (!transcriptPath || !fs.existsSync(transcriptPath)) return;

  let turns = parseTranscript(transcriptPath);

  // The Stop hook can fire a beat before the final message is flushed to disk.
  if (input.hook_event_name === "Stop") {
    for (let i = 0; i < 10 && needsFinalText(turns); i++) {
      await sleep(200);
      turns = parseTranscript(transcriptPath);
    }
    const last = turns.at(-1);
    if (last && !last.response && input.last_assistant_message) {
      last.response = { text: input.last_assistant_message, timestamp: new Date().toISOString(), model: last.model };
    }
  }

  if (turns.length === 0) return;
  const sessionId = input.session_id || turns[0].sessionId || path.basename(transcriptPath, ".jsonl");
  writeLog(sessionId, turns);
}

function needsFinalText(turns) {
  const last = turns.at(-1);
  return last && !last.response;
}

// ---------------------------------------------------------------- transcript parsing

function parseTranscript(file) {
  const turns = [];
  let current = null;
  let lastModel = null;

  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    if (!line.trim()) continue;
    let e;
    try {
      e = JSON.parse(line);
    } catch {
      continue; // partially written last line
    }
    if (e.isSidechain) continue; // subagent traffic is not the user's prompt/response

    if (e.type === "user") {
      const content = e.message?.content;
      const blocks = Array.isArray(content) ? content : [{ type: "text", text: String(content ?? "") }];

      if (blocks.some((b) => b.type === "tool_result")) continue; // tool plumbing
      if (e.isCompactSummary) continue; // auto-generated summary after /compact

      if (e.isMeta) {
        // "[Image: source: ...]" note that follows a pasted image; name the image in the prompt.
        const t = blocks.map((b) => b.text ?? "").join("");
        const m = t.match(/^\[Image: source: (.+)\]$/);
        if (m && current) current.imageNames.push(path.basename(m[1].trim()));
        continue;
      }

      const text = blocks.filter((b) => b.type === "text").map((b) => b.text).join("\n\n");
      if (/^\[Request interrupted/.test(text) || /^<local-command-(stdout|stderr|caveat)>/.test(text)) continue;
      const imageCount = blocks.filter((b) => b.type === "image").length;
      if (!text.trim() && imageCount === 0) continue;

      current = {
        sessionId: e.sessionId,
        prompt: text,
        imageCount,
        imageNames: [],
        timestamp: e.timestamp,
        model: null,
        blocks: [], // assistant content blocks, in order
        response: null,
      };
      turns.push(current);
      continue;
    }

    if (e.type === "assistant" && current) {
      const model = e.message?.model;
      if (!model || model === "<synthetic>") continue;
      lastModel = model;
      current.model = model;
      for (const b of e.message?.content ?? []) {
        if (b.type === "text" || b.type === "tool_use") current.blocks.push({ ...b, timestamp: e.timestamp, model });
      }
      current.response = finalResponse(current.blocks);
    }
  }

  for (const t of turns) t.model ??= lastModel ?? "unknown";
  return turns;
}

// The final response is the text after the last tool call in the turn. Narration
// between tool calls is intermediate and deliberately left out.
function finalResponse(blocks) {
  let lastTool = -1;
  blocks.forEach((b, i) => {
    if (b.type === "tool_use") lastTool = i;
  });
  const tail = blocks.slice(lastTool + 1).filter((b) => b.type === "text" && b.text.trim());
  if (tail.length === 0) return null;
  return {
    text: tail.map((b) => b.text).join("\n\n"),
    timestamp: tail.at(-1).timestamp,
    model: tail.at(-1).model,
  };
}

// ---------------------------------------------------------------- output

function writeLog(sessionId, turns) {
  const short = sessionId.slice(0, 8);
  const first = turns[0].timestamp;
  const last = turns.at(-1).timestamp;
  const date = first.slice(0, 10);
  const models = [...new Set(turns.map((t) => t.model))].join(", ");
  const author = CONFIG.author ?? "unknown";
  const project = CONFIG.project ?? path.basename(ROOT);

  const out = [];
  out.push(
    "---",
    `session_id: ${sessionId}`,
    `date: ${date}`,
    `author: ${author}`,
    `model: ${models}`,
    `tool: claude-code`,
    `project: ${project}`,
    `total_exchanges: ${turns.length}`,
    `first_prompt_time: ${first}`,
    `last_prompt_time: ${last}`,
    "---",
    "",
    `# Session Log - ${date}`,
    "",
    `Session: \`${short}\` | Project: \`${project}\` | Author: \`${author}\``,
    "",
    "---",
    "",
  );

  turns.forEach((t, i) => {
    const num = i + 1;
    let prompt = t.prompt;
    if (t.imageCount) {
      const names = t.imageNames.length ? t.imageNames : Array.from({ length: t.imageCount }, (_, k) => `#${k + 1}`);
      const note = names.map((n) => `[image attached: ${n}]`).join("\n");
      prompt = prompt ? `${note}\n\n${prompt}` : note;
    }
    out.push(`[LOG_ENTRY type=PROMPT num=${num} session=${short}]`, `timestamp: ${t.timestamp}`, `model: ${t.model}`, "", prompt, "", "");

    const isLast = i === turns.length - 1;
    if (t.response) {
      out.push(
        `[LOG_ENTRY type=RESPONSE num=${num} session=${short}]`,
        `timestamp: ${t.response.timestamp}`,
        `model: ${t.response.model}`,
        "",
        t.response.text,
        "",
        "",
      );
    } else if (!isLast) {
      // A later prompt exists, so this turn is over and it never produced closing text.
      out.push(
        `[LOG_ENTRY type=RESPONSE num=${num} session=${short}]`,
        `timestamp: ${lastBlockTime(t) ?? t.timestamp}`,
        `model: ${t.model}`,
        "",
        "[no final text response: the turn was interrupted or ended on a tool call]",
        "",
        "",
      );
    }
    // Last turn with no text yet: still running. The next hook run fills it in.
  });

  const stamp = first.replace(/\.\d+Z$/, "").replace("T", "_").replace(/:/g, "-");
  const file = path.join(LOG_DIR, `${stamp}_${sessionId}.md`);
  const body = out.join("\n").replace(/\n+$/, "\n");

  fs.mkdirSync(LOG_DIR, { recursive: true });
  if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === body) return;
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, body);
  fs.renameSync(tmp, file);
}

function lastBlockTime(t) {
  return t.blocks.at(-1)?.timestamp;
}

// ---------------------------------------------------------------- io helpers

async function readHookInput() {
  const argIdx = process.argv.indexOf("--transcript");
  if (argIdx !== -1) return { transcript_path: process.argv[argIdx + 1], hook_event_name: "manual" };
  if (process.stdin.isTTY) return {};
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    return {};
  }
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
