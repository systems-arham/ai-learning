# Claude Platform: Final Notes

**Course:** Anthropic Academy, Claude Platform 101
**Completed:** 2026-10-08

## 1. Built-in tools

Some capabilities are so common that Anthropic ships them pre-built: declare, don't code. Two categories. Server tools are declared by you and run on Anthropic's infrastructure: web search (internet search with citations), code execution (Python in a sandbox), web fetch (full content from URLs). Client tools run where your code runs, but the SDK ships the schema and a runner: memory, bash, text editor, computer use. The docs table marks each tool's side and maturity, and supported models vary by tool and version.

**The code, in blocks.** One file, two `messages.create` calls. Python.

Block 1, the declaration. Each call's `tools` list holds one dictionary:
```python
tools=[{"type": "web_search_20260209", "name": "web_search"}],
```
When you see a `{"type": ..., "name": ...}` dictionary inside a tools list, you are looking at a server tool declaration. The `type` names the exact dated version; the `name` is the label it answers to. No schema writing, no function to host.

Block 2, the request. The familiar `client.messages.create({...})` shape with the model, the token cap, the tools list, and the messages. The only thing that changed from a first API call is one dictionary in the tools list.

Block 3, reading the answer. This is where server tools reveal themselves:
```python
for block in search_response.content:
    if block.type == "server_tool_use":
        print(f"Tool call: {block.name}: {block.input}")
    elif block.type == "text":
        print(block.text)
```
`elif` means "otherwise, if this instead," chaining the checks. The f-string pastes the tool name and input into the printed line. New block types: `server_tool_use` (Claude's record of the tool it called) instead of the `tool_use` from custom tools. The code execution call adds `bash_code_execution_tool_result`, whose `block.content.stdout` reaches two levels deep for the sandbox's printed output:
```python
for block in code_response.content:
    if block.type == "server_tool_use":
        print(f"Tool call: {block.name}: {block.input}")
    elif block.type == "bash_code_execution_tool_result":
        print(f"stdout: {block.content.stdout}")
    elif block.type == "text":
        print(block.text)
```
Now notice what is missing, because the absence is the lesson: no `while` loop, no switching on `stop_reason`, no pushing tool results back. Anthropic ran the tool server-side, so the result is already in the response. When you read a script and find the reading block but no loop around it, you are looking at server tools.

In production this is the shortest path to features that would take weeks: a proposal app's fact-check panel running 39 web searches to verify every claim with a verdict. The caution stands: validated on the internet is not the same as true. And the hosted idea scales up to managed agents, which apply it to the entire agent.


## 2. What is the Claude Platform?

Anthropic's infrastructure for building with Claude programmatically: instead of chatting in a browser, your code sends structured requests and gets structured responses back, with control over the model, token spend, tools, and system instructions. The pieces: a REST API callable from any language, SDKs, CLIs, and a console for API keys, usage monitoring, managed agents, and prompt testing.

Picture three layers. **Primitives** are the API building blocks you call from your code: Messages API, tool use, files, web search, code execution, MCP servers, skills. **Infrastructure** scales an agentic system past a prototype: managed agents, retries, queues, observability, prompt caching, memory. **Controls** are the production dials: dashboards, evaluations, workspaces, usage and spend limits, request logs. The shorthand: build with primitives, scale on infrastructure, run with control.

**The code.** A help-desk app's "Draft reply with Claude" button, turning a ticket ("charged twice for order #8842") into a drafted refund reply in the team's tone. Python:
```python
client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-haiku-4-5",   # Haiku: a good fit for a simple drafting task
    max_tokens=1024,
    system=TONE_AND_GUIDELINES,
    messages=[
        {"role": "user", "content": ticket_content}
    ],
)

draft = response.content
```
Block by block: the first line builds the client, your program's connection to Anthropic's servers. The `messages.create({...})` block is the request, and its slots are the whole lesson: `model` picks which brain answers (Haiku, the fast economical one, right for simple drafting), `max_tokens` caps the reply length, `system` carries the standing instructions (the role, the tone, the guidelines), `messages` carries the conversation (one user message holding the ticket text). The last line pulls Claude's reply text out of the response, ready to render under the button. When you see this block shape in any file, this is the moment the program talks to Claude.

The core shift: you are not building a chatbot from scratch, you are adding Claude into a product that already exists, and the API is the wiring. From "ask Claude a question" to "Claude is part of my product." And with managed agents, the platform runs your agents for you.


## 3. Your first API call

Under 20 lines of code takes you from saying hi to Claude to getting structured insight back. Setup: an API key from platform.claude.com (buy credits first; the Console shows it once and never again), stored in a `.env.local` file, never hardcoded in source, plus the SDK via `npm install @anthropic-ai/sdk`. Every call goes through `messages.create` with three things: a model, a max tokens cap, and a messages list.

**The code, with the language basics.** TypeScript, which is JavaScript with type labels. The basic form:
```ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const msg = await client.messages.create({
  model: "claude-opus-4-7",
  max_tokens: 1024,
  messages: [{
    role: "user",
    content: "Hello, Claude",
  }],
});
```
`import ... from "..."` borrows a toolbox someone else built: the quoted name is the package npm installed. `const` declares a labeled box whose contents never change. `new Anthropic()` builds a fresh client object; it quietly reads your API key from the environment. `await` means "pause here until the answer comes back," because the request travels over the internet. The curly braces hold one settings object of named options; square brackets hold a list; each list item is an object with named fields. Quoted text is a string.

The real example points the call at buggy code and asks for a review, one file, about 20 lines:
```ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const buggyCode = `
function add(a, b) {
  return a - b;
}
`;

const response = await client.messages.create({
  model: "claude-opus-4-8",
  max_tokens: 1024,
  system: "You are a terse senior code reviewer. Give feedback in one paragraph.",
  messages: [
    { role: "user", content: `Review this code:\n${buggyCode}` },
  ],
});

for (const block of response.content) {
  if (block.type === "text") {
    console.log(block.text);
  }
}
```
The new pieces: backticks mark a template literal, a string that spans lines and pastes variables with `${...}`, so `${buggyCode}` drops the code sample into the message (`\n` is a newline). `system` is the system prompt, where the persona lives: "terse senior code reviewer" instead of a chatty one. The `for (const block of response.content)` loop walks the response's content blocks one by one, because the content is an array of blocks, not a string: Claude can return text, tool calls, thinking. The `if (block.type === "text")` check keeps only text (`===` means "exactly equals"). `console.log(...)` prints to the terminal. Run it with `npx tsx` ("execute this TypeScript file right now") and Claude spots that `add` is subtracting: "Bug: the function is named 'add' but uses subtraction ('a - b'). Change 'return a - b' to 'return a + b'."

From script to product: the same `messages.create` shape powers a meetings dashboard's "Generate summary" button. Pull the transcript from the database, hand it to Claude with an "extract insights and risks" system prompt, save the result back on the row, return it to the UI. Same call, wrapped in a route handler.


## 4. Choosing the right model

Default to the smartest model and your API bill surprises you; pick the cheapest and the output may not hold up. The tiers: Opus (most capable of the core families, slowest, highest cost: deep reasoning, complex analysis, multi-step coding, nuanced writing), Sonnet (the sweet spot for most production work), Haiku (fastest, lowest cost: classification, extraction, routing), and Fable (a new tier above Opus for the toughest challenges, not generally available at the time of writing).

Before production code, build a small eval: 20 or 30 representative examples from your real workload. Run Haiku first; if quality holds, you are done. Step up to Sonnet only on failure, Opus only when the task needs it.

**The code.** The side-by-side comparison, Python:
```python
models = ["claude-haiku-4-5", "claude-sonnet-4-6", "claude-opus-4-7"]

for model in models:
    response = client.messages.create(
        model=model,
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}],
    )
    print(model, response.usage)
```
Square brackets hold a list of the three model names. `for model in models:` walks the list one item at a time; in Python, indentation is the grammar, so everything indented belongs to the loop. Inside, the familiar request block has one trick: `model=model` fills the API's model slot with the loop's current value (left side is the parameter name, right side is the variable). `print(...)` writes to the terminal. `response.usage` reaches inside the response for the input and output token counts, which is what your bill is calculated on.

Running a short definition task against each model gives: Opus 2511ms (25 in, 105 out), Sonnet 1764ms (16 in, 55 out), Haiku 1070ms (16 in, 53 out). Opus is the most polished, wasted on a two-sentence definition; Haiku answers in about a second and is perfect for it. The rule: the right model is the cheapest one whose output you would actually ship. In production, route per task inside the same endpoint: classify with Haiku, draft with Sonnet, RFP responses with Opus.


## 5. The agent loop explained

One API call returns one response. An agent is Claude running both sides of the messaging loop without a human in the middle: send a message with tools, Claude answers or requests a tool, your code runs it, you send the result back, repeat until the stop reason is `end_turn`. Observe, decide, act, repeat.

**The code, in three pieces.** Python. First, the tools menu:
```python
tools = [
    {
        "name": "get_weather",
        "description": "Get the current weather for a city.",
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "The city to get weather for",
                }
            },
            "required": ["city"],
        },
    }
]
```
A list holding one dictionary with three lines: `name` (what Claude calls), `description` (the only thing Claude reads when choosing, so vague descriptions make agents misfire), and `input_schema` (a JSON contract: an object with a required string `city`). Lines starting with `#` are comments, notes for humans.

Second, the legwork:
```python
def run_tool(name, tool_input):
    if name == "get_weather":
        return f"Weather in {tool_input['city']}: 95F, sunny"
    raise ValueError(f"Unknown tool: {name}")
```
`def` defines a function, a named recipe with parameters. `==` compares (a single `=` would assign). The f-string pastes `tool_input['city']` into the answer; square brackets reach into the dictionary for the city. `return` hands the answer back. `raise ValueError(...)` is the honest "no such tool." Hardcoded here; a database or API in production.

Third, the loop:
```python
messages = [
    {"role": "user", "content": "What should I wear in Austin today?"}
]

while True:
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        tools=tools,
        messages=messages,
    )

    if response.stop_reason == "end_turn":
        for block in response.content:
            if block.type == "text":
                print(block.text)
        break

    if response.stop_reason == "tool_use":
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = run_tool(block.name, block.input)
                tool_results.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result,
                    }
                )

        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})
```
`while True:` loops until something inside stops it. Each round sends the conversation plus the tools menu, then switches on `response.stop_reason`. On `end_turn`, print the text blocks and `break` exits. On `tool_use`, collect results: start an empty list, find every tool-use block, run it (`block.name`, `block.input` via dot notation), `.append(...)` grows the list. Each result is an envelope: `type` marking it a tool result, `tool_use_id` matching the request (`block.id`), the `content`. Then the role dance: Claude's own response goes back as the assistant turn, the results as the user turn, keeping the alternation, and the loop repeats.

The run plays out like this: turn 1 stops with `tool_use`, Claude requests `get_weather({"city":"Austin"})`, the code returns 88F and sunny. Turn 2 stops with `end_turn` and prints clothing recommendations. Two API calls, one tool execution, one final answer. In production the same shape powers a compliance agent: "Run auto-review" on structural reports, dozens of tool calls searching the building-code library (33 sections cited), findings written to a risk table. Only the tools and plumbing change. The ownership split: you own the loop and the tools, Claude owns the reasoning. And managed agents run this exact loop for you when you do not want to own it.


## 6. What is tool use?

Tools give Claude access to your systems: a tool is a function you define and expose, Claude decides when to call it, and your code executes it. The key thing to internalize: Claude does not execute the tool, your code does. Tools are JSON schemas with a name, a description, and an input schema, passed as a `tools` array. The description is what Claude reads when choosing, so vague descriptions are the number one reason agents misfire.

**The code.** The compliance example as a menu card:
```json
{
  "name": "lookup_building_code",
  "description": "Look up a specific building code section by its identifier. Returns the full text of that code section.",
  "input_schema": {
    "type": "object",
    "properties": {
      "section": {
        "type": "string",
        "description": "The building code section to look up"
      }
    },
    "required": ["section"]
  }
}
```
Send a compliance report, and on the first turn Claude comes back with `stop_reason: "tool_use"`, your signal, naming the tool and the input it wants. Your loop runs the lookup and feeds the result back as a `tool_result` block tied to the call's id. The findings cite exact code sections (ACI 318-25 Section 25.5).

Multiple tools in TypeScript, packing for Denver with `get_weather` and `get_forecast`:
```ts
function runTool(name, input) {
  switch (name) {
    case "get_weather":
      return getWeather(input.city);
    case "get_forecast":
      return getForecast(input.city);
  }
}
```
`switch (name)` is a dispatch board matching `name` against each `case`. `input.city` reaches into the input with dot notation. Then the loop:
```ts
while (true) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages,
    tools,
  });

  if (response.stop_reason !== "tool_use") {
    // Claude is done, this is the final answer
    break;
  }

  messages.push({ role: "assistant", content: response.content });

  const toolResults = response.content
    .filter((block) => block.type === "tool_use")
    .map((block) => ({
      type: "tool_result",
      tool_use_id: block.id,
      content: runTool(block.name, block.input),
    }));

  messages.push({ role: "user", content: toolResults });
}
```
`!==` means "not exactly equal." `.push(...)` grows the messages list. `(block) => block.type === "tool_use"` is an arrow function, a tiny unnamed function; `.filter(...)` keeps blocks passing the test, `.map(...)` transforms each survivor into a result envelope (the parens around `({...})` stop JavaScript reading the braces as a code block). Claude calls `get_weather` then `get_forecast`, sometimes in the same turn, then answers: pack layers, snow flurries today, warming through the week. It chose by reading the descriptions. Want a third tool? Add it to the array, add a case to the switch, done.

The SDK's tool runner removes the boilerplate. Pass your actual functions and it reads their type labels to build the schemas and runs the whole loop:
```ts
function getWeather(city: string) {
  // ...existing lookup
}

function getForecast(city: string) {
  // ...existing lookup
}

const runner = client.beta.messages.toolRunner({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  messages: [
    {
      role: "user",
      content:
        "I'm packing for a three-day trip to Denver. What's the weather today and over the next few days?",
    },
  ],
  tools: [getWeather, getForecast],
});

const finalMessage = await runner.untilDone();
```
`(city: string)` is a type label the runner reads to build the schema. `tools: [getWeather, getForecast]` passes the functions themselves, not schemas. `await runner.untilDone()` waits until the tool ping-pong settles and returns the final message. Real tools wrap existing code, like the compliance agent's thin wrappers around `lookup_building_code` and `search_building_code`. The spectrum: you execute, you delegate the loop to the runner, or managed agents delegate the whole agent to Anthropic.


## 7. What is thinking?

Let a model answer a multi-step question immediately and it can confidently get it wrong ("You'd have 6.5 apples"). Extended thinking makes Claude reason step by step first, generating internal reasoning tokens, a chain of thought, and the reasoning stays visible in the response next to the final text. On Opus 4.7 thinking is adaptive: turn it on with `thinking={"type": "adaptive"}`, no token budget, Claude decides when and how much. The depth dial is `effort` (low, medium, high by default, xhigh, max), and it lives inside `output_config`, not next to the thinking block. Use thinking for math, multi-step logic, code debugging, regulatory analysis, and trade-off-heavy comparisons; skip it for classification, extraction, and boilerplate, where it only adds latency and cost.

**The code, as blocks.** Take a script that asks Claude to plan a two-stop road trip out of San Francisco, weighing weather against drive time. Python:
```python
import anthropic

client = anthropic.Anthropic()

weather_tool = {
    "name": "get_weather",
    "description": "Get the current weather for a city.",
    "input_schema": {
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "City name"}
        },
        "required": ["city"],
    },
}

response = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=16000,
    thinking={"type": "adaptive"},
    output_config={"effort": "high"},  # low | medium | high | xhigh | max
    tools=[weather_tool],
    messages=[
        {
            "role": "user",
            "content": "Plan a road trip out of San Francisco with two stops, "
                       "weighing weather and drive time.",
        }
    ],
)
```
Four recognizable blocks. The connection: `client = anthropic.Anthropic()`, once near the top of every script. The menu card: `weather_tool = {...}`, name plus description plus input schema. The request: `client.messages.create({...})`, the shape to recognize on sight, with its slots: the model, the token cap, the `thinking` switch (adaptive: Claude decides how much), the `effort` dial nested inside `output_config` (not beside thinking), the tools list, the messages. Two adjacent quoted strings join into one, so the long prompt is just split for readability. The answer comes back richer than usual: thinking blocks working through the trade-offs, tool calls checking each city, then the recommendation text. The thinking is visible, and that visibility is the whole point.

In production, the compliance app's "Thorough review" checkbox toggles adaptive thinking on the auto-review call, so the agent reasons across sections and catches cross-section conflicts like a wind-load spec contradicting the material spec.


## 8. Skills

Skills are folders of instructions, scripts, and resources that Claude loads dynamically for specialized tasks. At the core is a SKILL.md file: a packaged set of instructions you upload once and attach to any `messages.create` call, teaching Claude how you do something (your report format, your review checklist). The distinction: tools connect Claude to data and actions, what it can do; skills teach a procedure, how you want it done. Skills load progressively: only name and description at startup, the full skill when the agent decides it is relevant, keeping context lean.

**The code, in two blocks.** Take a status report generator: the report rules live in the skill, the activity log is just a string at request time. Python. Block 1, the registration (run once, keep the id):
```python
skill = client.beta.skills.create(
    display_title="Status Report Generator",
    files=files_from_dir("status-report-skill"),  # folder containing SKILL.md
)

print(skill.id)  # reference this ID in future requests
```
`client.beta.skills.create({...})` takes a display title and the skill folder (a helper bundles the directory holding SKILL.md) and returns a skill object; `skill.id` reaches in for the handle you reuse.

Block 2, the request with the skill attached:
```python
response = client.beta.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=4096,
    betas=["skills-2025-10-02", "code-execution-2025-08-25"],
    container={
        "skills": [
            {
                "type": "custom",
                "skill_id": skill.id,
                "version": "latest",
            }
        ]
    },
    tools=[
        {
            "type": "code_execution_20250825",
            "name": "code_execution",
        }
    ],
    messages=[
        {
            "role": "user",
            "content": f"Generate the daily status report from this activity log:\n\n{activity_log}",
        }
    ],
)
```
Three new slots to recognize: `betas` holds dated feature flags opting into skills and code execution (skills are still beta); `container` is the attachment block, holding a `skills` list of type/skill_id/version entries (a list, so you can layer multiple skills); `tools` holds the familiar server-tool declaration for code execution, because skill procedures often do real work. The prompt is one line; the procedure lives in the skill. Claude reads the skill file first, then generates a house-format daily status report, and in production every PM gets the same structure with a one-click Generate report button. Reach for a skill when the how matters as much as the what.


## 9. MCP

MCP exists to answer who maintains the integration code. With custom tools you write the Asana, Calendar, and Slack wrappers and then maintain them forever as their APIs change. MCP shifts that to the service provider: each publishes an MCP server exposing its tools through a standard protocol, and when their API changes they update their server while you change nothing. The trilogy: tools connect Claude to your internal systems (you own the code and the maintenance), skills teach a procedure (instructions, not integrations), MCP connects Claude to third-party services (provider maintained). Short version: tools are for your stuff, skills for your process, MCP for everyone else's stuff.

**The code, in three blocks.** Python. Pointing Claude at Linear's MCP server; connection details and the auth token live in a `.env` file.

Block 1, the connection, an address-book entry inside the request:
```python
mcp_servers=[
    {
        "type": "url",
        "url": "https://mcp.linear.app/mcp",
        "name": "linear",
        "authorization_token": os.environ["LINEAR_MCP_TOKEN"],
    }
],
```
`type` says how to connect, `url` says where the server lives, `name` is the label you refer to it by, `authorization_token` is the key. `os.environ["LINEAR_MCP_TOKEN"]` reaches into the environment for the secret by name. When you see an `mcp_servers` block in any request, an external service is being plugged in.

Block 2, the grant, a permission slip in the tools list:
```python
tools=[
    {
        "type": "mcp_toolset",
        "mcp_server_name": "linear",
    }
],
```
`type: "mcp_toolset"` marks it as a grant rather than a hand-written tool; `mcp_server_name` points at the connection. Default: all of the server's tools. Notice what you never wrote: a single tool schema. Claude introspects the server, gets the tools and schemas back, and picks. Claude introspects the server and lists 30 discovered Linear tools before choosing. The `betas=["mcp-client-2025-11-20"]` line is the beta opt-in header, since the connector is still in beta.

Block 3, the filter, a bouncer pattern for servers that expose too much:
```python
tools=[
    {
        "type": "mcp_toolset",
        "mcp_server_name": "slack",
        "default_config": {
            "enabled": False,
        },
        "configs": {
            "search_messages": {"enabled": True},
            "list_channels": {"enabled": True},
        },
    }
]
```
`default_config` with `enabled: False` locks every tool; `configs` re-enables two by name. Read-only by design: search Slack and list channels, but no post or delete. It also keeps unused tool definitions out of your context.


## 10. Context management

Every request has a context window: a million tokens sounds like a lot until a real agent is running. Context is everything Claude sees on a turn (system prompt, message history, tool definitions and results, files and skills, thinking blocks); you pay for it both ways, and a full window fails the request. The goal is fitting the right things in, not everything.

Four patterns. Just-in-time context: load what is needed now, pull the rest via tools (a design pattern, no API surface). Server-side compaction: a housekeeping block in the request:
```python
response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    context_management={
        "edits": [
            {"type": "compact"}
        ]
    },
    messages=messages,
)
```
`context_management` holds an `edits` list, each edit a small dictionary with a `type`, here `compact`. It is a list because you can stack multiple housekeeping instructions. When you see this block in any request, the program is telling the API to tidy up old turns on its own: the API auto-summarizes once the input crosses the trigger threshold, and you never track conversation length yourself. Prompt caching: mark the stable parts (system prompt, tool definitions, a long document) and reuse them across calls at a fraction of the cost; a 4,000-token system prompt at 100 calls an hour is a finance phone call without it. The memory tool: Claude reads and writes a memory directory via tool calls, you own the storage backend (file system, database, encrypted store), Anthropic auto-injects the check-memory-first instruction, so context survives across sessions. Layer the patterns per failure mode: cost, window size, statelessness. Managed agents ship with caching and compaction on by default.


## 11. Managed agents

A suite of APIs for building and deploying agents at scale, in its own Console section. You define agents (tools, personas, capabilities), configure sandbox environments (packages, network controls), and fire off sessions from your app; Claude works inside an isolated container with filesystem access, bash, and web search. It is the agent loop from section 5, hosted on Anthropic's infrastructure instead of yours.

Three examples show the range. A Kanban board where dragging a ticket to In Progress fires a session: the environment has Lighthouse and Puppeteer, the repo is mounted, a rubric defines done (Lighthouse above 90, no render-blocking, lazy-loaded images), tool calls stream back live, and a separate grader in its own context window sends Claude back until the score hits 96; a second ticket runs in parallel in its own container. A recurring pricing research agent: web searches for plan changes, Python cost analysis in the sandbox, an Excel skill plus executive summary, Slack and Asana delivery via MCP, and a memory store so each week's report builds on the last ("compute costs are 15% lower since last week"). An incident response flow: a P1 latency alert becomes a tool result, a coordinator delegates to three specialists in separate context windows on a shared filesystem, the permissions policy holds the Slack draft for human approval, and memory flags the pattern ("the DNS issue from two weeks ago"). The building blocks: agents, sessions, environments, tools, MCP, memory, outcomes (rubrics and graders), multi-agent coordination. You define what done looks like; Claude works until it gets there.


## 12. Building your first managed agent

Delegate the loop when it runs too long, does too much, or must survive a hiccup: a managed agent is the agent loop on Anthropic's infrastructure, enabled by default. Four primitives in order: agent (persona: model, system prompt, toolset; reusable), environment (cloud or local, networking), session (one run, the unit of work), events (everything flowing in and out). The shift: no while loop, you send events and read events.

**The code, in five blocks.** Python. The smallest useful managed agent: create a file in the temp drive, count its lines, report back. The tools come from the agent toolset, Anthropic's bundled file, bash, and web tools.

Block 1, the job description, `client.beta.agents.create({...})`:
```python
agent = client.beta.agents.create(
    name="Line Counter",
    model="claude-opus-4-8",
    system="You are a helpful agent that completes small file tasks.",
    tools=[
        {"type": "agent_toolset_20260401", "default_config": {"enabled": True}}
    ],
)
```
A name, the model, the system prompt (the persona), and the tools list holding the bundled toolset declaration with its dated type. When you see `agents.create` in any file, someone is defining a reusable worker. The returned object carries an id you reuse.

Block 2, the workplace, `client.beta.environments.create({...})`:
```python
environment = client.beta.environments.create(
    name="line-counter-env",
    config={
        "type": "cloud",
        "networking": {"type": "unrestricted"},
    },
)
```
A name and a config naming the sandbox type (cloud) and its network rules. This is the container template where the file actually gets written.

Block 3, the assignment, `client.beta.sessions.create({...})`:
```python
session = client.beta.sessions.create(
    agent=agent.id,
    environment_id=environment.id,
    title="Count lines demo",
)
```
`agent.id` and `environment.id` reach into the earlier objects for their ids, wiring this agent to this workplace. The optional title labels the run. When you see `sessions.create`, a single run is starting.

Block 4, the walkie-talkie. Open the channel, then speak:
```python
with client.beta.sessions.events.stream(session_id=session.id) as stream:
    # Stream is open, now send the kickoff
    client.beta.sessions.events.send(
        session_id=session.id,
        events=[
            {
                "type": "user.message",
                "content": [
                    {
                        "type": "text",
                        "text": "Create a file in the temp directory, "
                                "count its lines, and report back.",
                    }
                ],
            }
        ],
    )
```
`with ... as stream:` opens the event stream and holds it as `stream`. Order matters: the stream only delivers events that occur after it opens, so you always open it before sending the kickoff. `events.send` pushes a list of events (plural, because you can send several at once). Each event is a dictionary with a `type` (`user.message`) and structured `content`. Two adjacent strings join into one.

Block 5, the listening:
```python
    for event in stream:
        if event.type == "agent.message":
            for block in event.content:
                if block.type == "text":
                    print(block.text, end="", flush=True)
        elif event.type == "agent.tool_use":
            print(f"\n[tool] {event.name}")
        elif event.type == "session.status_idle":
            print("\n--- Agent done ---")
            break
```
Three event types run the demo: `agent.message` (Claude's text, printed with `end=""` so chunks join without newlines and `flush=True` so they appear immediately), `agent.tool_use` (which tool Claude picked, via `event.name`), and `session.status_idle` (done, break out). End to end: the three ids, `[tool] write`, `[tool] bash`, the file created with three lines, "The file contains 3 lines," done. All inside Anthropic's container, not yours.

The trade, stated once: with a manual loop you control everything; with managed agents you delegate the loop, the sandbox, and the resumability, and just consume the event stream. In production this is the shape for long-running, file-touching, "go organize this for me" work: a fileshare cleanup agent reading a target-structure spec, walking a messy incoming folder, moving files into project folders, archiving duplicates and zero-byte garbage with md5sum checks, flagging what it cannot place, all streaming live to a dashboard. Manual loop for full control; managed agents when the work is long, heavy, or must survive.


## 13. Building with Claude Code

The faster path: have Claude write the API integration. Claude Code fills in a stubbed TypeScript file (a `getWeather` stub and a `run` stub) using the same primitives described in these notes. Its built-in Claude API skill loads automatically on detecting the TypeScript SDK, or via `/claude-api`; the marketplace install is `/plugin marketplace add AnthropicsSkills`, trailing s included. One prompt with three slots (the file, the pattern, the end state) gets Claude Code to implement both stubs against the types, append a `run()` call, execute with `npx tsx`, and patch any errors in place.

**The code, as blocks.** The generated weather code. The imports block:
```ts
import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
```
Three imports: the SDK itself, the `betaZodTool` helper from the SDK's beta helpers, and `z` from the zod library (a schema library the runner uses to understand the tool's inputs).

The data block, a lookup table:
```ts
const WEATHER: Record<string, { temp_f: number; conditions: string }> = {
  austin: { temp_f: 92, conditions: "sunny and humid" },
  denver: { temp_f: 58, conditions: "partly cloudy" },
  ...
}
```
`Record<string, {...}>` is TypeScript's way of saying "a dictionary: city name in, an object out," where each value holds a `temp_f` number and a `conditions` string. When you see `Record<A, B>` in any file, you are looking at a lookup table from A-shaped keys to B-shaped values.

Then the familiar shape, the pattern to remember for all Claude API code: define a tool (a Zod tool parsing the input and returning the output for the city), hand it to a runner (`client.beta.messages.toolRunner` with the tool passed in), return the result (the final text from `runner.untilDone()`). The verify loop closes it: Claude Code appends the `run()` call, executes the file, reports the output, and on error reads the message and patches the code in place. The workflow: stub it, delegate it, review the diff.

