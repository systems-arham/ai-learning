# Workflow Mapper API

Process documentation. Written 2026-10-08. Keep this file next to the
code and update it when the prompt, model, or limits change.

## Deployment status

LIVE since 2026-10-08 on systems-mrktrsmedia.netlify.app/systems
("02 / Workflow mapper"). `ANTHROPIC_API_KEY` is set in the Netlify
dashboard (Site settings > Environment variables). The function reads it
at build time.

## What it does

The "02 / Workflow mapper" section lets a visitor pick a business
function, a volume band, and describe a repetitive bottleneck. Clicking
"Map the workflow" sends those three inputs to a Netlify Function, which
calls the Anthropic API and returns a customized first-pass system
design: a title, five architecture stages (Capture, Context, AI reasoning,
Control, System record), and one "Decide before building" line. The page
then shows a static "Book an AI assessment call" card linking to the
Calendly.

No agentic loop, no tools. One model call per mapping. Three short inputs
go in, one JSON design comes out, so a loop would only add latency, cost,
and ways to fail.

## Architecture

```
Browser (systems.html + js/site.js)
  → POST /.netlify/functions/map-workflow      { function, volume, bottleneck }
  → netlify/functions/map-workflow.js          (validates, throttles, prompts)
  → Anthropic Messages API                     (model claude-haiku-5-5)
  → 200 { title, stages[5], decide }  → rendered into #demo-result
  → any failure → curated fallback copy, so the demo never looks broken
```

## Files

- `netlify/functions/map-workflow.js`: the API endpoint. Holds the prompt
  template, validates input, throttles per IP, calls Anthropic with an 8s
  timeout, retries once on retryable errors, and checks the JSON shape.
- `netlify.toml`: tells Netlify where the functions live and pins Node 20.
- `js/site.js`: the mapper form now calls the endpoint with `fetch`
  instead of the old `setTimeout` mock. It keeps the loading skeleton,
  renders the design, appends the static booking CTA, and falls back to
  curated copy on any error. Empty or example-matching input skips the API
  and serves the curated copy directly.
- `css/styles.css`: small addition with styles for the booking CTA card.
  Flat and on-palette, per ANTI-AI-RULES.md.
- `WORKFLOW-MAPPER-API.md`: this file.

## Model, limits, cost

- Model: `claude-haiku-5-5` (Haiku 5.5, released 2026-10-07). The cheapest
  Claude model right now: $0.10 per million input tokens, $0.50 per
  million output tokens. Our prompts stay under 1k tokens, well inside the
  cheaper tier.
- `max_tokens`: 500. The prompt also caps the design at about 220 words.
- Temperature is intentionally omitted. Haiku 5.5 rejects non-default
  temperature/top_p/top_k, so consistency comes from the prompt and the
  strict JSON contract instead.
- A typical call is around 450 input tokens plus 350 output tokens, about
  **$0.0002**. 1,000 mappings cost about $0.22. 10,000 cost about $2.20.

## The prompt

The system prompt lives as the `SYSTEM_PROMPT` constant at the top of
`netlify/functions/map-workflow.js`, so the copy can be iterated without
touching the request logic. It encodes the site's voice rules from
ANTI-AI-RULES.md: plain human sentences, no AI-slop vocabulary, no
statistics, no timelines, no prices, no promises, no fabricated proof, no
em dashes. It demands ONLY valid JSON in this shape:

```json
{
  "title": "short title naming the workflow, max 8 words",
  "stages": [
    {"label": "Capture", "text": "one or two sentences"},
    {"label": "Context", "text": "one or two sentences"},
    {"label": "AI reasoning", "text": "one or two sentences"},
    {"label": "Control", "text": "one or two sentences"},
    {"label": "System record", "text": "one or two sentences"}
  ],
  "decide": "one sentence starting with 'Decide before building:' ..."
}
```

The user message is built as:

```
Business function: {function}
Current volume: {volume}
Bottleneck: {bottleneck}
```

The function checks the returned JSON: 5 stages, exact labels, non-empty
strings. Malformed output triggers the one retry, then the curated
fallback.

## Setup (done 2026-10-08)

1. `ANTHROPIC_API_KEY` added in the Netlify dashboard: Site settings >
   Environment variables. Never committed to the repo.
2. Site deployed. Netlify picked up `netlify/functions/map-workflow.js`
   automatically via `netlify.toml`.
3. Monthly spend limit in the Anthropic console as the real cost guardrail.
   (Set one if it is not set yet.)
4. Verified live: submitted the mapper, got a customized 200 design, and
   the booking CTA links to the Calendly.

Lesson learned during setup: Netlify injects environment variables at
build time. Setting the key after a deploy leaves the running function
blind to it (503 `not_configured`). Fix: Deploys > Trigger deploy >
Deploy site, then retest. Set env vars before deploying, or redeploy
after.

## Abuse and cost guards

- POST only. `function` is capped at 60 chars, `bottleneck` at 600 chars,
  and HTML is stripped server-side.
- Per-IP throttle in memory: 12 requests a minute. Best effort, it resets
  on cold starts, which is why the Anthropic spend limit matters.
- 8s upstream timeout. One retry on 429/5xx/malformed output, then a
  clean 502 that the frontend turns into the curated fallback.
- Sample or empty input never calls the API.
- The function logs only the business function, the volume, and an 80-char
  preview of the bottleneck: enough to see what prospects describe,
  nothing more.

## Testing

Local, no API key needed for the plumbing:

```bash
netlify dev   # or: npx netlify-cli dev
curl -X POST http://localhost:8888/.netlify/functions/map-workflow \
  -H 'content-type: application/json' \
  -d '{"function":"Research","volume":"50 to 250 tasks per week","bottleneck":"account managers manually gather customer context from five systems before every weekly review."}'
```

- Without `ANTHROPIC_API_KEY` set: expect 503 `not_configured`, and the
  page shows the curated fallback.
- With the key set: expect 200 with the JSON design.
- 13 rapid requests from one IP: the 13th returns 429 `rate_limited`.
- Stop the function or use a bad key: the page still renders the curated
  fallback copy.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| 503 `not_configured` | env var missing at build time | Add `ANTHROPIC_API_KEY` in the Netlify dashboard, then **redeploy**. Env vars are injected at build time, so setting the key after a deploy is the most common cause. |
| 502 `generation_failed`, fallback shows | API error, timeout, or malformed output | Check the Netlify function logs. Verify the key and the Anthropic status page. |
| 429 `rate_limited` | per-IP throttle tripped | Wait a minute. Legitimate users rarely hit 12 requests a minute. |
| 405 `method_not_allowed` | non-POST request | The frontend only sends POST. Ignore stray hits. |
| Design renders but sounds off-brand | prompt drift | Edit `SYSTEM_PROMPT` and redeploy. No logic change needed. |

## Privacy note

The mapper sends the visitor's bottleneck text to Anthropic's API.
`privacy.html` (updated 2026-10-08) names the actual providers: Netlify
for hosting, FormSubmit for inquiry email delivery, Anthropic for mapper
processing, and Calendly for scheduling.

## Future ideas (not built)

- Prompt caching on the system prompt. Trivial cost at current volumes.
- Tune the `effort` parameter on Haiku 5.5 once its behavior is documented.
- v2: the mapper asks one clarifying question before generating, when the
  bottleneck description is too vague to design around.
