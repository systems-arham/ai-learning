// netlify/functions/map-workflow.js
//
// Workflow mapper API for the MRKTRS Systems /systems page.
// POST /.netlify/functions/map-workflow
//   Body: { function: string, volume: string, bottleneck: string }
//   200:  { title, stages: [{label, text} x5], decide }   (JSON design)
//   4xx/5xx: { error: 'method_not_allowed' | 'not_configured' | 'bad_request'
//                     | 'rate_limited' | 'generation_failed' }
//
// The Anthropic API key lives ONLY in the Netlify environment variable
// ANTHROPIC_API_KEY (Site settings > Environment variables). It never
// appears in this repo, in the browser, or in any delivered file.

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-5-5'; // Haiku 5.5: cheapest current Claude model
const MAX_TOKENS = 500;
const UPSTREAM_TIMEOUT_MS = 8000;
const MAX_ATTEMPTS = 2; // one try + one retry on retryable failures

// ---------------------------------------------------------------------------
// Prompt template. Versioned here so copy can be iterated without touching
// the request/response logic below. Follows ANTI-AI-RULES.md: plain human
// sentences, no AI-slop vocabulary, no fabricated proof, no em dashes.
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = [
  'You are the workflow mapper inside the MRKTRS Systems website. MRKTRS Systems designs AI operating layers for companies: chains of inputs, company context, Claude reasoning, tools, human control points, and recorded outputs. Custom builds start from $7,500.',
  '',
  'A visitor describes a repetitive bottleneck in their business. Turn it into a first-pass system design: an illustrative architecture sequence, customized to what they described. This is a thinking aid, not a technical estimate.',
  '',
  'Rules for your output:',
  '- Plain, human sentences. Short. Concrete nouns.',
  '- Never use these words: delve, unlock, elevate, seamless, cutting-edge, game-changer, supercharge, revolutionize.',
  '- No em dashes. No exclamation marks.',
  '- No statistics, no timelines, no prices, no promises of ROI. No fabricated proof of any kind.',
  '- Stay under 220 words total.',
  '',
  'Return ONLY valid JSON with exactly this shape:',
  '{',
  '  "title": "short title naming the workflow, max 8 words",',
  '  "stages": [',
  '    {"label": "Capture", "text": "one or two sentences"},',
  '    {"label": "Context", "text": "one or two sentences"},',
  '    {"label": "AI reasoning", "text": "one or two sentences"},',
  '    {"label": "Control", "text": "one or two sentences"},',
  '    {"label": "System record", "text": "one or two sentences"}',
  '  ],',
  '  "decide": "one sentence starting with \'Decide before building:\' naming the single most important thing to clarify before this becomes a real project"',
  '}',
  '',
  "Each stage must reference the visitor's actual bottleneck. If the bottleneck description is vague or empty, design around the business function they chose and say so in the 'decide' line.",
].join('\n');

const STAGE_LABELS = ['Capture', 'Context', 'AI reasoning', 'Control', 'System record'];

// ---------------------------------------------------------------------------
// Tiny in-memory per-IP throttle. Best effort: it resets on cold starts, so
// the real cost guardrail is a monthly spend limit in the Anthropic console.
// ---------------------------------------------------------------------------
const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 12;
const hits = new Map(); // ip -> timestamps[]

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function sanitize(value, max) {
  return String(value == null ? '' : value)
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, max);
}

function extractJson(text) {
  const cleaned = String(text || '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  try {
    return JSON.parse(cleaned);
  } catch {
    // fall through to brace matching
  }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return null;
    }
  }
  return null;
}

function isValidDesign(d) {
  if (!d || typeof d !== 'object') return false;
  if (typeof d.title !== 'string' || !d.title.trim()) return false;
  if (!Array.isArray(d.stages) || d.stages.length !== 5) return false;
  for (const s of d.stages) {
    if (!s || typeof s !== 'object') return false;
    if (!STAGE_LABELS.includes(s.label)) return false;
    if (typeof s.text !== 'string' || !s.text.trim()) return false;
  }
  if (typeof d.decide !== 'string' || !d.decide.trim()) return false;
  return true;
}

async function callAnthropic(userContent, apiKey) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        // Temperature intentionally omitted: Haiku 5.5 rejects non-default
        // temperature/top_p/top_k. Consistency is enforced through the prompt
        // and the JSON contract instead.
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }],
      }),
    });
    if (!res.ok) {
      const err = new Error('Anthropic API responded with status ' + res.status);
      err.retryable = res.status === 429 || res.status >= 500;
      throw err;
    }
    const data = await res.json();
    return (data.content || [])
      .filter((block) => block && block.type === 'text')
      .map((block) => block.text)
      .join('');
  } finally {
    clearTimeout(timer);
  }
}

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(obj),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'method_not_allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json(503, { error: 'not_configured' });
  }

  const headers = event.headers || {};
  const forwarded = headers['x-forwarded-for'] || headers['X-Forwarded-For'] || '';
  const ip = String(forwarded).split(',')[0].trim() || 'unknown';
  if (isRateLimited(ip)) {
    return json(429, { error: 'rate_limited' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'bad_request' });
  }

  const businessFunction = sanitize(body.function, 60);
  const volume = sanitize(body.volume, 60);
  const bottleneck = sanitize(body.bottleneck, 600);

  if (!businessFunction || !bottleneck) {
    return json(400, { error: 'bad_request' });
  }

  // Anonymized log: shows what bottlenecks prospects describe (sales insight).
  // Only a short preview is logged, never more than needed.
  console.log(
    JSON.stringify({
      type: 'workflow_mapper_request',
      function: businessFunction,
      volume,
      bottleneck_preview: bottleneck.slice(0, 80),
    })
  );

  const userContent =
    'Business function: ' + businessFunction + '\n' +
    'Current volume: ' + volume + '\n' +
    'Bottleneck: ' + bottleneck;

  let lastError = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const text = await callAnthropic(userContent, apiKey);
      const design = extractJson(text);
      if (isValidDesign(design)) {
        return json(200, design);
      }
      lastError = new Error('Model returned malformed output');
      lastError.retryable = true;
    } catch (err) {
      lastError = err;
      if (!err.retryable) break;
    }
  }

  console.error(
    JSON.stringify({
      type: 'workflow_mapper_failure',
      message: lastError && lastError.message,
    })
  );
  return json(502, { error: 'generation_failed' });
};
