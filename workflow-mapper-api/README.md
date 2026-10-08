# Workflow Mapper API

Built 2026-10-08. Live on the systems page of my site
(systems-mrktrsmedia.netlify.app/systems, section "02 / Workflow mapper").

A visitor describes a repetitive bottleneck in their business. One API
call to Claude turns it into a first-pass system design: a title, five
stages (Capture, Context, AI reasoning, Control, System record), and one
"Decide before building" line. Then the page shows a booking CTA.

## What I learned building this

- **No agentic loop.** Three short inputs go in, one JSON design comes
  out. One model call does the job, no tools needed. A loop would just add
  latency, cost, and ways to fail.
- **Cheapest Claude model right now:** Haiku 5.5 (`claude-haiku-5-5`).
  $0.10 per million input tokens, $0.50 per million output tokens. With
  `max_tokens` set to 500, one mapping costs about $0.0002.
- **Haiku 5.5 rejects non-default temperature settings.** So the output
  stays consistent through a strict prompt and a JSON contract the server
  checks. One retry, then a hand-written fallback.
- **Netlify injects env vars at build time.** I set the API key after
  deploying and the function couldn't see it (503). Redeploying fixed it.
- **Never break the demo in front of a prospect.** Bad key, timeout, bad
  JSON, rate limit: every failure path falls back to curated copy, so the
  widget always shows something useful.

## Files

- `map-workflow.js`: the Netlify Function. Validates input, throttles per
  IP, holds the versioned system prompt, calls the Anthropic API with an
  8s timeout and one retry, and checks the JSON shape. The API key lives
  only in the `ANTHROPIC_API_KEY` environment variable, never in code.
- `WORKFLOW-MAPPER-API.md`: the full process documentation. Architecture,
  the prompt, setup, cost math, testing, troubleshooting, privacy note.

## Run it

Needs `ANTHROPIC_API_KEY` in the environment:

```bash
curl -X POST http://localhost:8888/.netlify/functions/map-workflow \
  -H 'content-type: application/json' \
  -d '{"function":"Research","volume":"50 to 250 tasks per week","bottleneck":"account managers manually gather customer context from five systems before every weekly review."}'
```
