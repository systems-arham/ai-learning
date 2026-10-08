# Claude Code: Final Notes

**Course:** Anthropic Academy, Claude Code 101
**Completed:** 2026-10-08

## Course intro: what is Claude Code?

An agentic coding tool: it understands your codebase, edits your files, runs commands, and plugs into your developer tools so you ship faster. It lives where you already work: terminal, VS Code, Claude Desktop app, web, JetBrains IDEs.

What separates it from Claude.ai is direct access. Claude.ai means copying and pasting code back and forth. Claude Code has your files, your terminal, and your whole codebase in front of it, so instead of describing the work, it goes in and does the work itself. The key differentiator: Claude Code works as an AI Agent.

The four things it can do: read and understand your codebase (explain a feature, trace a bug); edit files across your project (refactor once, every reference updated); run terminal commands (build, test, install, then use the output to decide what's next); search the web (documentation, latest API references).

**The code:** from the course terminal screenshot, the entire onboarding is two lines:
```bash
cd ~/sample-project
claude
```
In plain words: the first line walks into the project folder; the second starts Claude Code right there, already knowing which directory it's in. No setup wizard, no config. Walk in, say the word.

## Course intro: what is an agent? (the concept)

An AI Agent is software that interacts with its environment and takes actions to complete a defined goal. At its core: a large language model operating in a loop in real time. Look, decide, act, check the result, go again. It can reach for tools, external services, or even other agents.

The loop is the difference between "ask and answer" and "give it a job." A chatbot waits for your next message; an agent keeps working until the job is done. (Mechanics of the loop: section 1 below.)

## Course intro: using Claude Code effectively (three concepts)

**The context window** is Claude's working memory: big, but not infinite. The agentic part is strategic fetching, locating answers in your codebase without loading all of it. (Capabilities course callback: working memory, the fixed window, the cliff.) When the window fills, Claude Code compacts the conversation itself, deciding what to remove or summarize to get back to a usable size.

**It asks for permission.** By default it asks before running commands or making changes. You stay in control, hands-on or hands-off, your choice.

**It can make mistakes.** Misunderstood intent, introduced bugs, over-engineered solutions. Staying in the loop catches them early. Discernment applied to agents: you are still the team lead.

## 1. The agent loop

A single API call gets one response. To automate a workflow, Claude needs to act, look at the result, decide what is next, and keep going. That is an agentic workflow, and an agent is Claude running both sides of the messaging loop with no human in the middle.

Five beats: send a message with tools available; Claude answers with a final answer or a tool request; your code runs the tool; the result goes back; repeat until stop_reason is end_turn.

Four pieces: the tools array (menu of allowed errands: name, description, JSON input schema); run_tool (the legwork, hardcoded in the demo, real APIs in production); messages (the shared notepad, every turn appended); the two stop reasons (tool_use means "I need to check something first," end_turn means "done").

Demo: get_weather for Austin. Turn one: tool_use, code returns "95F, sunny." Turn two: end_turn, wear something light. Production is the same shape with real tools: a compliance agent reading reports, looking up building codes, writing findings to a database, dozens of rounds.

Keep these: "An agent is Claude in a loop: observe, decide, act, repeat." And "You own the loop and the tools. Claude owns the reasoning." The 3D/2D read: the loop and legwork are 2D machinery (yours or your developers'); the reasoning is directed from 3D. You set the boundaries (allowed errands, a safety cap on rounds); within them she decides how many errands each task needs. Managed agents are Anthropic running the same loop on their computers.

**The same loop at product altitude.** The "How Claude Code Works" lesson teaches the loop again inside the product: your prompt goes in, Claude gathers context (model returns text or a tool call it can execute), it takes action (edits a file, runs a command), then it verifies the results against what your prompt set out to do. Done means it finishes and waits; not done means it loops back until the results are complete and verifiable. The new piece at this altitude is you: throughout the loop you can add context, interrupt, or steer. Autonomous, but not unsupervised, the human stays in the circuit by design.

## 2. What is tool use?

Tools give Claude access to your external data and actions. A tool is a function you define and expose; Claude decides when to call it. She never executes it: she requests, your code runs it, the result goes back.

A tool definition is a menu card with three lines: name, description (what she reads to decide), input schema (the order form). The shape, using the course's Denver weather demo as the example:
```json
{
  "name": "get_weather",
  "description": "Get today's current weather for a city",
  "input_schema": {
    "type": "object",
    "properties": { "city": { "type": "string" } }
  }
}
```
In plain words: the first line is the tool's name, what Claude calls it. The second line is the description, the only thing Claude reads when deciding whether this tool fits your request, which is why vague descriptions are the top reason agents misfire. The rest is the order form: what information the tool needs before it can run (here, a city name). In the Denver demo, sharp descriptions ("today's current weather" versus "forecast for the next few days") let her pick the right card, sometimes both in the same turn. Vague menu, confused assistant; sharp menu, sharp decisions. Writing sharp descriptions is the highest-leverage work here.

Handshake: stop_reason "tool_use" is her raised hand; your code runs the function; the result returns as a tool_result stapled with the tool_use_id receipt. Multiple tools change nothing about the loop: add cards, add a dispatch case. The SDK tool runner (TypeScript, Python, Ruby) removes the boilerplate: plain functions in, schemas built from names/types/docs, the whole loop handled internally, final answer out through untilDone(). Real tools wrap code you already own. The spectrum: run the loop yourself, use the runner, or rent managed agents. Same loop, three levels of ownership.

## 3. Permission modes: staying in control

Three modes, a ladder of trust you climb deliberately. **Default:** Claude asks for explicit permission before editing a file or running a shell command. **Auto-accept:** files are edited without asking, commands still require approval. Writing is safe to automate; running things is not. **Plan mode:** read-only tools compile a plan of action first; you review it, then it executes.

The approval moment, from the course screenshot: asked for a simple Express API in TypeScript, Claude reads one file, sees an empty project, proposes `npm init -y`, in plain words "create a new Node.js project file, accepting every default answer without asking me," and before running it shows the command, a plain-words description ("Initialize npm project"), and "This command requires approval. Do you want to proceed?" Options: 1. Yes. 2. Yes, and don't ask again for `npm init:*` (standing approval for that command pattern). 3. No. Footer: Esc to cancel, Tab to amend, ctrl+e to explain.

All configurable in the settings file. The caution: be careful skipping permissions, because free rein to run commands means a mistake gets harder to catch before it happens. This is the diligence beat for the agent era, and the product-level answer to "stay in the loop."

## 4. The workflow: Explore, Plan, Code, Commit

"If you take one thing away from this course, let it be this workflow." Skipping it means jumping straight to code and paying in course-correction later.

**Explore + Plan:** do these in Plan Mode (Shift+Tab until it appears under the input). Read-only: Claude reads files and searches the web to figure out the approach but changes nothing. Give it the goal plus the open questions; it returns file-by-file findings and a verification checklist. Review and revise. Cheapest place to disagree with your AI: before a single line of code exists. The explore subagent also runs standalone for a no-changes codebase summary.

**Code:** approve the plan and Claude works the list, auto-accepting edits or asking each time, your choice. It troubleshoots before calling the plan done; when you step in, you bring the context of how the results were reached.

**Commit:** test it yourself, then spawn a code-reviewer subagent before committing. Fresh eyes, no session bias. Then Claude writes the commit message in your style. Rinse and repeat.

Four tips: define success criteria in the plan (Claude needs to know what "correct" looks like); add tools that remove back-and-forth (Claude in Chrome, 3M users, beta, paid: drives a browser tab, tests UIs directly); bring a test suite Claude can validate against continuously (it can write the tests; make sure they're trustworthy); feed CLAUDE.md (recurring problem gets saved there so the next session starts smarter).

Worth remembering from the screenshots: the WebP plan's six-step verification checklist (install sharp; uploads convert to .webp; avatar_url ends .webp; served as image/webp; re-upload deletes the old file; corrupt upload → 422, no orphans) and its approval options (yes + clear context and auto-accept, yes + auto-accept, yes + manual approval, or a typed question). Plans save to ~/.claude/plans/ and open in VS Code with ctrl-g. The reviewer run: "spawn the code reviewer subagent" → lists TypeScript files, reads the changed ones, 17+ tool calls, reports "32s · ↓ 799 tokens"; ctrl+b backgrounds it.

## 5. Context management

Context is Claude's working memory: every file read, command run, and message sent takes space, and the space is finite. When the window fills, Claude Code compacts on its own: summarizes the important details, drops unnecessary tool-call results. Honest footnote: compaction can lose details. The compact summary it leaves behind has a shape worth copying: Primary Request and Intent, Key Technical Concepts, Files and Code Sections.

Three commands: `/compact` clears history but keeps a summary (use mid-feature when hitting the limit); `/clear` wipes everything for a fresh start (use when starting a new feature, so the old conversation can't bias the new one); `/context` shows the window's state (size, hungriest categories, free space, autocompact buffer, visual breakdown). From the screenshot: 64k/200k tokens, and system tools (14.6k) cost more than the actual messages (1.3k).

Three space-saving tips: be specific (vague prompts look smaller but cost more, because unguided exploration and reasoning burn more context than a detailed prompt); manage MCP servers (they load all their tools into context by default, even unused ones; turn off unrelated servers; Skills don't load everything upfront); use subagents (separate context window, parallel; hand back just the summary for answer-only tasks).

The persistent layer is CLAUDE.md: things worth remembering across sessions live in the file, not in context. The example's shape: Commands split by area (backend vs web/ frontend), **IMPORTANT** callouts ("Run the test suite EVERY TIME"), an Architecture section. The /agents + /skills list prices each item in tokens (code-reviewer: 335, skills: 29-48 each): small alone, and exactly why unused ones get switched off.

## 6. Code review and the git workflow

Three built-in features that remove friction from the daily git flow:

**Review with a subagent.** Before pushing a PR, have a subagent review the changes. Own context window, fresh eyes, none of the main agent's session bias. Setup rules: restrict it to read-only tools (a reviewer flags, it doesn't edit), and check the configuration into the repo so the whole team uses the same reviewer.

**The /commit-push-pr skill.** Commit, push, and PR creation in one step instead of three manual ones. With a Slack MCP server configured and channels listed in CLAUDE.md, the PR link posts to the team channel automatically.

**Session linking with --from-pr.** When Claude creates a PR via `gh pr create`, the session links to it automatically. Later, for review comments or a failing build, `claude --from-pr <PR_NUMBER>` reopens that exact session where you left off.

## 7. The CLAUDE.md file: persistent memory

One of the most useful features in the product. Without it, every session starts blank: Claude re-explores the codebase, re-derives dependencies, re-learns what's built, and makes steering-harder assumptions along the way. CLAUDE.md is a Markdown file in the project root, read automatically every session, appended to your prompt. An onboarding script for your codebase.

The shape, verbatim from the course example:
```markdown
# Project

This is a Next.js 15 app using the App Router, Tailwind, and Drizzle ORM.

# Commands
- Dev server: `pnpm dev`
- Run tests: `pnpm test`
- Lint: `pnpm lint`

# Code Style
- Use 2-space indentation
- Prefer named exports
- All API routes go in app/api/
- Use server actions instead of API routes where possible
```
In plain words, section by section: the Project lines tell Claude the stack (Next.js 15, App Router for pages, Tailwind for styling, Drizzle ORM for the database), so it never guesses. The Commands lines are the project's vocabulary: `pnpm dev` starts the development server, `pnpm test` runs the test suite, `pnpm lint` checks the code for style errors. The Code Style lines are standing orders: indent with two spaces, use named exports, put every API route in the app/api/ folder, and prefer server actions over API routes wherever possible. Start with your stack, your preferences, your commands; build from there as you go. Once this file exists, asking for a React component just works: it already knows Tailwind and your conventions.

Two levels: project-level in the root, shared with the team, commit it to version control; user-level in your config folder, just for you, applies across all projects.

Three tips: save corrections to memory (correcting "use server actions instead of API routes" once, explicitly asked, becomes permanent behavior); reference docs with @filepath (`@README.md` means "read this when you need more"); start without one (watch where you course-correct, those friction points are the only lines the file needs; then run `/init` to generate it).

## 8. Subagents: parallel workers with clean counters

Claude delegates to subagents that break work down and run it in parallel, each in its own isolated context window. A context feature as much as a productivity one.

The mechanism: exploration is expensive, and most of what tool crawls and web searches turn up isn't relevant to the feature at hand. So Claude spawns a subagent ("explore this codebase for me"), it works in parallel in its own window, and returns a summary. You get the answer without the journey cluttering your main context.

Creating your own: subagents are Markdown files with YAML frontmatter (a settings block at the top). Easiest path is `/agents` ("open the subagent manager") → "Create new agent" → scope, purpose, tools, even display color. Claude generates name, description, and prompt; the description is what tells Claude when to call it. Customization highlights: persistent memory (the agent retains memory across conversations, pays off on repeat projects) and preloaded skills (listed by name under the skill key; here the entire skill loads into context, unlike the main conversation).

## 9. MCP: the Model Context Protocol

An open standard connecting Claude Code to external tools and data sources; Claude decides on its own when to reach for them. The gap it bridges: your context lives outside the codebase, in databases, productivity apps, public repos.

The "tools" concept: tools let agents act, not just answer. Two demo-grade examples: the Linear server (user: "make a plan off of the linear ticket MEN-12" → `get_issue(id: "MEN-12", includeRelations: true)`, described as "Retrieve detailed information about an issue by ID, including attachments and git branch name"; every tool's plain-language description is how Claude decides when to use it) and the Context7 docs server (checking a shadcn/ui implementation against the newest standards: `resolve-library-id` matches the library, then local package.json gets compared).

Adding servers with `claude mcp add`: HTTP for remote services (`claude mcp add --transport http linear-server https://mcp.linear.app/mcp`, "register a server named linear-server reaching Linear's hosted endpoint over the network"); stdio for local processes (`claude mcp add --transport stdio dev-utils -- python C:/Users/lewis/mcp-server/server.py`, "register a local server Claude starts by running this Python script, talking over standard input/output"). Manage with `/mcp`: status, tool list, reconnect, disable; the detail view shows the start command, config location (here `.claude.json` scoped to the project), and tool count.

Scoping: Local (this project, just you), User (all your projects), Project (`.mcp.json` in version control, the whole team gets identical servers).

Context costs: tool definitions occupy context even when unused. Mitigations in order: audit with `/mcp` and disable the idle ones; prefer a CLI equivalent (`gh`, `aws`) since CLI calls add nothing persistent; consider a Skill (name + description loaded, full contents on demand). Backstop: past 10% of the window, Claude Code auto-switches to tool search mode, on-demand discovery, less reliable.

## 10. Hooks: deterministic control

Hooks run commands at specific points in Claude Code's lifecycle. The difference from everything else in the course: they're deterministic, they always run. CLAUDE.md's "run Prettier after every edit" works most of the time; a hook makes it every time, no exceptions. Uses: auto-formatting after edits, compliance logging of commands, blocking dangerous operations, notifications when Claude finishes.

Configured in `.claude/settings.json`: pick an event, optional tool matcher, command to run. Five events: PreToolUse (before a tool call), PostToolUse (after it completes), UserPromptSubmit (on prompt submit, before processing), Stop (when Claude finishes responding), Notification (when Claude sends one). Set up via `/hooks` ("open the hooks manager") or by editing the file directly.

The canonical example: PostToolUse with matcher `"Edit|MultiEdit|Write"` auto-formats by extension (Prettier for TypeScript, gofmt for Go).

Blocking with PreToolUse: the hook gets tool name + input as JSON on stdin; exit code decides. 0: proceed. 2: block, and stderr feeds back to Claude as feedback so it adjusts. Anything else: non-blocking error shown to you. Hard rules, guaranteed: block writes to prod config, block `rm -rf`, block commits to main.

The screenshot's config, as written in `.claude/settings.json`:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-dangerous-commands.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        ...
      }
    ]
  }
}
```
In plain words, line by line: the outer `"hooks"` opens the hooks section. `"PreToolUse"` says "run this before a tool call." `"matcher": "Bash"` narrows it to Bash tool calls only. The inner `"command"` is what runs: take the project root (`$CLAUDE_PROJECT_DIR`, an environment variable holding the project's folder, so the path works no matter where Claude's current directory is), go into `.claude/hooks/`, and execute `block-dangerous-commands.sh`, a script whose whole job is judging whether the command is dangerous. Then `"PostToolUse"` with matcher `"Edit|Write"` catches every file modification after it happens (the rest of that entry, cut off in the screenshot, points at the formatter). `.claude/settings.json` is project-level: check it in, the team gets identical hooks.

