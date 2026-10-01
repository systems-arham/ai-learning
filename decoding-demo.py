#!/usr/bin/env python3
"""
Next-token prediction playground.

A tiny trigram language model trained on a small built-in corpus.
Same prompt, same model, six different decoding rules, so you can
see exactly what each rule does to the output.

The model only remembers 2 previous words (a real LLM remembers
thousands), but the decoding math -- greedy, temperature, top-p --
is identical to what production models use.

Run:  python3 decoding-demo.py
"""

import math
import random
import re
from collections import Counter, defaultdict

CORPUS = """
The keeper climbed the tower at dusk. He lit the lamp and the lamp burned bright.
Ships far out at sea saw the light. The ships steered clear of the rocks.
The keeper watched the ships until dawn. At dawn he climbed down and cleaned the lamp.
The lamp was ready for the night. Every night the same work. Every night the same light.

In the workshop below the tower there was a brass panel.
Turn the knob to change the scale. Take a sample every hour and write it down.
The needle would rise and fall with the wind.
When the storm came the keeper crossed the bridge to the tower.
The bridge swayed in the wind. He held the rail and did not look down.

The keeper kept a log of every night. The log said the lamp burned bright.
The log said the ships passed safe. The log said the wind rose at midnight.
Some nights the fog came in thick and the light barely reached the rocks.
On those nights the keeper rang the bell. The bell rang deep and slow.
The ships heard the bell through the fog.

One winter the oil ran low. The keeper burned the lamp dim to save the oil.
The ships still saw the dim light. A supply boat came in spring.
It crossed the bridge of waves to the dock. The keeper loaded the oil and thanked the crew.
That night the lamp burned bright again. The keeper smiled at the bright light.

He taught his son the work. Turn the knob to change the scale, he said.
Take a sample every hour, he said. Watch the ships and keep the log.
The son learned the tower and the lamp and the bell.
The keeper grew old and the son took the watch. The light never went out.
"""

N = 3  # trigram: predict the next word from the previous 2


def tokenize(text):
    return re.findall(r"[a-z]+|[.!?]", text.lower())


def build_model(tokens):
    tri = defaultdict(Counter)
    bi = defaultdict(Counter)
    uni = Counter(tokens)
    for i in range(len(tokens) - 2):
        tri[(tokens[i], tokens[i + 1])][tokens[i + 2]] += 1
    for i in range(len(tokens) - 1):
        bi[(tokens[i],)][tokens[i + 1]] += 1
    return tri, bi, uni


def distribution(tri, bi, uni, context):
    """Next-token distribution, backing off trigram -> bigram -> unigram."""
    for ctx in (context, context[1:], ()):
        counts = uni if not ctx else (tri if len(ctx) == 2 else bi).get(ctx)
        if counts:
            words = sorted(counts)
            total = sum(counts.values())
            return words, [counts[w] / total for w in words]
    raise RuntimeError("empty model")


def with_temperature(words, probs, t):
    logits = [math.log(p) for p in probs]
    m = max(logits)
    exps = [math.exp((l - m) / t) for l in logits]
    s = sum(exps)
    return words, [e / s for e in exps]


def with_top_p(words, probs, p):
    order = sorted(range(len(words)), key=lambda i: probs[i], reverse=True)
    kept, cum = [], 0.0
    for i in order:
        kept.append(i)
        cum += probs[i]
        if cum >= p:
            break
    kw = [words[i] for i in kept]
    kp = [probs[i] for i in kept]
    s = sum(kp)
    return kw, [x / s for x in kp]


def with_top_k(words, probs, k):
    order = sorted(range(len(words)), key=lambda i: probs[i], reverse=True)[:k]
    kw = [words[i] for i in order]
    kp = [probs[i] for i in order]
    s = sum(kp)
    return kw, [x / s for x in kp]


def greedy_pick(words, probs):
    return words[max(range(len(words)), key=lambda i: probs[i])]


def sample_pick(words, probs, rng):
    r = rng.random()
    cum = 0.0
    for w, p in zip(words, probs):
        cum += p
        if r < cum:
            return w
    return words[-1]


def generate(tri, bi, uni, prompt, steps, rule, seed):
    rng = random.Random(seed)
    out = list(prompt)
    for _ in range(steps):
        context = tuple(out[-(N - 1):])
        words, probs = distribution(tri, bi, uni, context)
        if rule["name"] == "greedy":
            nxt = greedy_pick(words, probs)
        else:
            if rule.get("top_p"):
                words, probs = with_top_p(words, probs, rule["top_p"])
            if rule.get("top_k"):
                words, probs = with_top_k(words, probs, rule["top_k"])
            if rule.get("temp"):
                words, probs = with_temperature(words, probs, rule["temp"])
            nxt = sample_pick(words, probs, rng)
        out.append(nxt)
    return detokenize(out)


def detokenize(tokens):
    text = " ".join(tokens)
    text = re.sub(r"\s+([.!?])", r"\1", text)
    text = re.sub(r"(^|[.!?]\s+)([a-z])",
                 lambda m: m.group(1) + m.group(2).upper(), text)
    return text


def main():
    tokens = tokenize(CORPUS)
    tri, bi, uni = build_model(tokens)
    print(f"Corpus: {len(tokens)} tokens, {len(tri)} trigram contexts.\n")

    prompt = ["the", "keeper"]
    rules = [
        {"name": "greedy",
         "label": "1. GREEDY (always picks the single most likely word)"},
        {"name": "sample", "temp": 1.0,
         "label": "2. PURE SAMPLING, temp=1.0 (every word in the vocabulary stays in play)"},
        {"name": "sample", "temp": 0.6,
         "label": "3. LOW TEMPERATURE, temp=0.6 (sharpens the distribution, no top-p)"},
        {"name": "sample", "temp": 0.9, "top_p": 0.9,
         "label": "4. TOP-P 0.9 + temp=0.9 (the recommended rule)"},
        {"name": "sample", "temp": 1.6, "top_p": 0.9,
         "label": "5. TOP-P 0.9 + HIGH temp=1.6 (too much chaos)"},
        {"name": "sample", "temp": 0.9, "top_k": 10,
         "label": "6. TOP-K 10 + temp=0.9 (fixed-size shortlist)"},
    ]
    for rule in rules:
        text = generate(tri, bi, uni, prompt, 60, rule, seed=7)
        print(rule["label"])
        print("-" * len(rule["label"]))
        print(text + "\n")


if __name__ == "__main__":
    main()
