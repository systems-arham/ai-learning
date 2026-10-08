# AI Fluency: Master Notes (all three courses merged)

**Sources:** Anthropic AI Fluency course (Dakan, Feller, and Anthropic, CC BY-NC-SA 4.0); "AI Fluency Framework: Capabilities & Limitations"; "AI Fluency for Builders" (76 screenshots).
**Date merged:** 2026-10-06
**Status:** draft, awaiting Muhammad's final pass.

## How the three courses fit together

- **Course 1, AI Fluency:** the **human competencies**, the 4Ds. What *you* do: delegation, description, discernment, diligence. Fluency means working with AI in ways that are effective, efficient, ethical, and safe.
- **Course 2, Capabilities & Limitations:** the **machine properties**. What the *AI* is: next token prediction, knowledge, working memory, steerability, each on a spectrum from capability to limitation. This is the mental model that makes AI behavior predictable instead of surprising.
- **Course 3, AI Fluency for Builders:** the 4Ds **applied to building software**. Same competencies, builder's lens: the toolkit spectrum, the description chain, the five lenses, shipping.

The bridge between them:

| Human competency | Pairs with AI property |
| --- | --- |
| Delegation | Steerability |
| Description | Working memory |
| Discernment | Next token prediction |
| Diligence | Knowledge |

When you understand why the AI behaves the way it does, you delegate more wisely, describe more clearly, discern more accurately, and apply the right level of diligence.

---

# Part 1: The 4Ds (what you do)

## The 4Ds

| D | Means | In plain words |
| --- | --- | --- |
| **Delegation** | Setting goals and deciding whether, when, and how to engage with AI | What should I do, what should AI do, what do we do together? |
| **Description** | Effectively describing goals to prompt useful AI behaviors and outputs | Saying it well enough that the AI can actually help |
| **Discernment** | Accurately assessing the usefulness of AI outputs and behaviors | Checking the work instead of blindly trusting it |
| **Diligence** | Taking responsibility for what we do with AI and how we do it | Owning the result and being honest about AI's role |

The 4Ds are not steps in order. They are collections of skills, knowledge, insights, and values you draw on together.

Kid-friendly version: hiring a helper. Delegation is deciding what jobs to hand them. Description is explaining the job clearly. Discernment is checking their work before it goes out. Diligence is being the boss who owns the result and admits the helper did the work.

## The three modes of working with AI

- **Automation:** AI executes specific tasks based on human instruction. Human defines, AI executes.
- **Augmentation:** humans and AI collaborate as thinking partners. Iterative back-and-forth, both contribute.
- **Agency:** humans configure AI to independently perform future tasks on their behalf, including interacting with other humans or AI. The human sets knowledge and behavior patterns, not exact actions.

Most people are stuck on mode one.

## Delegation (merged: foundations + builder's lens)

**Foundations.** Delegation is making thoughtful decisions about what work is appropriate for you, for AI, or for both together. Three awarenesses come before a single prompt:

1. **Problem awareness** — clearly understanding your goals and the nature of the work before involving AI. "What am I trying to do?" comes first.
2. **Platform awareness** — understanding the capabilities and limitations of different AI systems. "AI" is not one tool.
3. **Task delegation** — thoughtfully distributing work to leverage the strengths of each.

**The builder's rule.** Decide what role AI plays at each stage of a problem. Delegating **implementation** to AI is usually fine. Delegating **judgment** is usually not advised. Give AI the bricks, never the blueprints.

**The builder's toolkit: six capabilities, one spectrum.** AI can help with all six, but it is much stronger at some than others. Weakest at empathy, design, judgment, shipping; strongest at implementation; architecture is the collaboration zone.

1. **Empathy** — defining the user need. The weakest AI use; starts with human understanding.
2. **Design** — what should we build, and why? Weigh trade-offs, make bets, decide what matters. AI can generate options, not make judgment calls.
3. **Architecture** — how should it be structured? AI knows patterns, but not your circumstances. Ideal for human-AI collaboration.
4. **Implementation** — writing the actual code. AI is strongest here. Your job: define clear tests and success checkpoints.
5. **Judgment** — does it work? Is the product good? AI will tell you if the code runs, but not if it feels right. Requires your expertise, standards, and perspectives.
6. **Shipping** — getting the product to real users and learning from what happens. AI can draft release notes, but does not understand user experience.

**You are the team lead.** A great team lead frames the problem so it's clear what needs solving, sets goals to measure what good looks like, decides what to tackle first, and knows which decisions to make themselves. That is your job description when building with AI. The division of labor: **humans provide** critical thinking, judgment, creativity, ethical oversight; **AI provides** speed, scale, pattern recognition, processing abilities.

Kid-friendly version: a movie director and a film crew. The director frames the story, sets the vision, decides the shooting order, makes the final calls. The crew moves fast and handles scale. Nobody confuses the two jobs.

Script angles: "Before you prompt, answer three questions" (problem, platform, task). "AI is strongest at exactly one of the six things builders do." "You are not an AI user, you are a team lead."

## Description (merged: foundations + prompting + builder's chain)

**Foundations.** Description is communicating with AI so the collaboration is productive. Three levels:

1. **Product description** — the *what*: outputs, format, audience, style.
2. **Process description** — the *how*: step-by-step instructions to follow.
3. **Performance description** — the *behavior*: concise or detailed, challenging or supportive. The tone of the working relationship.

Most people are stuck on level one while the how and the behavior matter just as much.

**Before you write a prompt, be clear about three things:** what problem you are solving and for whom; what done looks like; what a success test measures.

**The 6 prompting techniques (+ the secret weapon):**

1. **Provide context** — scope, geography, timeframe. "Tell me about climate change" becomes "three major impacts on agriculture in tropical regions, past decade."
2. **Show examples of what good looks like** — few-shot. Examples teach the pattern better than descriptions.
3. **Specify output constraints** — format, length, structure, sections, style. Constraints are the difference between "a website" and "my website."
4. **Break complex tasks into steps** — guide the reasoning, keep it methodical.
5. **Ask it to think first** — "think through this carefully before answering." Space to think, better answers.
6. **Define the AI's role** — "explain rainbows as an experienced science teacher to a bright 10-year-old." Role shapes approach.
7. **The secret weapon:** ask the AI to help craft the prompt. "I'm trying to get you to help me with [goal]. How should I phrase this?" Perhaps the most powerful technique of all.

**Prompt structure in three parts:** set stage (who you are, the situation), define task (the concrete deliverable), specify rules (constraints and format). Most prompts only have the middle.

**The builder's description chain.** Good description is a translation chain: **user voice → product requirement → technical spec → AI instruction.** Each step translates the previous one into something more buildable. Skipping steps is how you get output that is technically correct and completely wrong.

- **User voice** is what a real person actually says. Notice tone, emotion, and context not said out loud; use empathy to define the real need. Raw and not yet buildable.
- **Product requirement** takes raw need and scopes it into measurable requirements, using judgment and empathy work. If you cannot measure it, AI cannot aim at it. This step is not delegable.
- **Technical spec** gives clear instructions on what and how to build. The more specific the better. Assumptions (stack, error handling) must be called out, because AI fills gaps from probability. Unstated assumptions become invented behavior.
- **AI instruction** has four ingredients: specific contextualized instructions, clearly defined edge cases, all assumptions stated, tests and success checkpoints that must be passed.

The chain produces four artifacts: requirements, specs, tests, prompts. Not one clever prompt, four documents.

**Diagnosing a description failure.** When the output is wrong, walk the chain backwards: was it a user-understanding failure, a requirement failure, a spec failure, or a prompt failure? The signature symptom: **code works, but the product doesn't.** Tests pass but don't solve the real problem. The failure usually lives **upstream of the prompt**, which is why rewriting the prompt rarely fixes it. The two demo questions: "did the test pass?" and "is the user satisfied?" A yes then a no is the fingerprint.

**The description-discernment loop.** Description and discernment are not steps, they are a loop: describe, discern what came back, sharpen the next description. Iteration is the method, not the failure. The data backs it: **iterates and refines is the top fluent behavior at 85.7%**, and description dominates the behavioral chart.

Kid-friendly version: the genie who takes everything literally. Context is describing the exact wish. Examples are showing a picture. Constraints draw a box around it. Steps wish in stages. Think-first is "take a breath before you grant it." The role tells the genie who to be. And the secret weapon is asking the genie how to wish.

Script angles: "Your prompt is step four of four." "Stop writing prompts, write these four things instead." "Your prompt is not the problem" (upstream diagnosis). "The best prompting trick is asking AI how to prompt."

## Discernment (merged: foundations + five lenses + code + UX)

**Foundations.** Discernment is how you evaluate what AI gives you. It means understanding that AI has blind spots, and catching gaps in AI outputs before users do. Three checks:

1. **Product discernment** — is the answer actually good? Accuracy, appropriateness, coherence, relevance.
2. **Process discernment** — did it get there the right way? Logical errors, lapses in attention, bad reasoning steps.
3. **Performance discernment** — is the interaction itself working? Communication style, the conversation.

**The five lenses.** Five questions, each catching what the previous one lets through. Lens 1 is easy to test, run it and see; by lens 5 you are making judgment calls AI can't make for you.

1. **Functional Integrity** — does it work? Test: correct output for real inputs, not just test data. Common AI failure: passes unit tests, breaks on real data the prompt never covered. Note: technical code review is necessary but not sufficient.
2. **Production Readiness** — does it work well? Test: handles concurrent users without race conditions. Common AI failure: smooth in dev, broken under load or behind real infrastructure.
3. **Problem Fit** — is it the right thing? Test: solves the user's actual need, not just the literal spec. Common AI failure: technically complete feature that misses the underlying need. The user's stated problem and the actual problem can differ.
4. **Experience Quality** — is it good? Test: users complete the core task without help or instruction. Common AI failure: generic UI that technically works but feels uninvested. Note: AI doesn't have taste, it replicates patterns.
5. **Responsible Impact** — is it responsible? Test: transparent about AI's role, never presenting generated content as verified fact. Common AI failure: generated content presented as authoritative, or a demographic left out by default. Territory: bias, privacy, unintended consequences; make sure code doesn't propagate harmful assumptions.

**Discernment for code: three common AI mistakes.**

1. Deprecated APIs used confidently.
2. Locally clean code, inconsistent with the codebase.
3. Invented behavior for cases you never specified.

**Three deeper truths:** code that runs can still fail; AI has predictable blind spots in concurrency, security, and anything that only breaks at scale; **taste is a builder skill**, AI delivers functional, making it worth using is on you.

**The counter-move: make AI show its work.** Ask "how'd you come up with that code?" A good answer reads what was already there rather than inventing patterns: it names the repo conventions it followed (the /web-api/ prefix, because /api/ handlers get intercepted by the load balancer), the existing endpoints it patterned the access-control shape off (filter in the query, resolve token before loading, 404 over 403), the primitives it leaned on (Zustand, CDS components, semantic tokens), and the gap it caught only because you asked it to double-check. Case in point: asked to verify access paths, the AI found a real privilege gap (a revoke handler that checked the token but not ownership) and fixed it with a test. Two habits: point AI at the risky part on purpose, and ask for assumptions, tradeoffs, and risks explicitly. The tradeoffs it named when asked: Zustand over Context (faster, one more store to reason about), MIME allow-list over deny-list (safer, occasional legitimate rejections). The risks it flagged: share tokens in URLs leak via history, referrers, and Slack unfurls; no rate limiting on token validation yet; unsigned blob-store URLs worth gating behind the token check.

**Verifying product readiness: three moves.** Ask AI to test its own outputs. Generate production scenarios and check how the code handles them. Ask explicitly, "what production assumptions does the code make?"

**Evaluating your AI collaborator: three questions.** Is it accurate? Does the language resonate? How did AI get there?

**Discernment for user experience: four principles** AI gets wrong by default.

1. **Clarity** — every element instantly communicates its purpose. Before: a screen titled "App", unlabeled back arrow, a grey button that just says "Submit". After: "Order review", "Back to menu", "Place Order — $16.50".
2. **Hierarchy** — visual weight matches information priority: the most important thing should look the most important. Before: total, arrival time, order number all the same weight. After: "$16.50" and "Arriving by 1:10 PM" dominate.
3. **Accessibility** — screen reader compatibility, color contrast, keyboard navigation. AI generates for the median user; about 1 in 5 people has a disability. Before: a red dot as the only status signal, "qty", "Cancellation per T&C". After: checkmark plus "Order confirmed", full words, plain language. Specify it, then audit what you get back.
4. **Feedback** — when the user acts, acknowledge it. When something breaks, say what happened, what to do next, how to get help. Before: bare "Error 503". After: "We couldn't place your order. Our payment system hit a snag. Your cart is saved, try again in a moment," plus retry and support.

**UX takeaways:** when implementation is fast, experience is the differentiator; "make it look good" is a wish, not a spec; a good critique and an actionable AI description are different artifacts, learn to translate.

Kid-friendly version: the food critic. Product: does the dish taste good? Process: did the chef follow the recipe? Performance: was the service good?

Script angles: "Three ways AI-written code lies to you." "AI is a brilliant intern who sometimes lies with confidence." "Stop telling AI to make it look good." The five lenses as a screenshot-able checklist.

## Diligence (merged: foundations + habits + shipping)

**Foundations.** Diligence is taking responsibility for what we do with AI and how we do it. Three parts:

1. **Creation diligence** — thoughtful about which AI systems you use and how you interact with them.
2. **Transparency diligence** — honest about AI's role with everyone who needs to know.
3. **Deployment diligence** — verifying and vouching for the outputs you use or share. If you publish it, you checked it.

**Habits of diligence:** verification (seek out edge cases and assumptions), transparency (tell people AI wrote it), understanding (consciously understand how the code works; never ship code you cannot explain). Plus the underrated skill: deprecating your own work, being willing to scrap something you built when it isn't right.

**Diligence expanded: five responsibilities.** Be transparent about your AI use. Take ownership of AI outputs. Verify work before shipping. Consider the impact of what you built on others. Honor policies, privacy, and professional standards.

**The shipping takeaways.**

- **You own the outcome, not the output.** "AI wrote it" explains nothing and excuses nothing.
- **Shipping has its own technical vocabulary** (migrations, versioning, rate limits, feature flags) that AI will not surface unless you ask.
- **Tests make post-launch iteration safe.** The test-first habit is why you can keep changing things confidently.
- **Prototype freely, ship selectively.** Cheap code creates value only when paired with honest evaluation.
- **Access is a design decision.** Check who your assumptions exclude before you call something shipped.
- **The engineering safety net:** tests, observability, feature flags.
- **Shipping software in four lines:** writing code is only part of the job; decide what problem is actually worth solving; make decisions about how it should work; ship it and learn from what happens.

**Building responsible code: three practices.** Build guardrails. Ask AI to name its biases. Question all assumptions in the code.

Kid-friendly version: the science project. Creation is choosing good equipment. Transparency is crediting your partner's help. Deployment is double-checking the numbers before the poster goes on the wall, because your name is on it.

Script angles: "AI did the work, but your name is on it." "You own the outcome, not the output" as the standalone punch reel. "Ask the AI what it is biased about."

---

# Part 2: How AI works (what the AI is)

## The mental model: a capable but very literal collaborator

Fast, knowledgeable, doesn't get tired. Needs clear tasks, context, and feedback. Needs to be managed well. "Literal" is the operative word: it does what you said, not what you meant. Every weird AI output is a literal reading of a vague instruction.

## Generative AI and the three pillars

**Generative AI** creates new content rather than just analyzing existing data. Traditional AI classifies the email as spam; generative AI writes a new email for you. Three developments made modern LLMs possible:

1. **Algorithms** — neural networks, then the transformer architecture (2017), which processes long passages in parallel.
2. **Data** — the explosion of digital text: websites, articles, code repositories, multimodal content.
3. **Computation** — massive compute: GPUs, TPUs, computing clusters.

**The scaling laws:** as compute and data go up, model intelligence goes up. Entirely new capabilities can emerge at scale thresholds, never explicitly programmed.

## How it works: three stages

1. **Pre-training** — the model reads billions of text examples and learns one thing: predict what comes next. It becomes a powerful document completer with no concept of helping you. Ask it a question and it continues the document in whatever direction seems statistically likely.
2. **Fine-tuning** — human preferences shape the completer into an assistant: curated examples of good behavior, then reward signals. It learns to treat input as a request, answer helpfully, say "I'm not sure" when it isn't, and decline harmful asks. The target traits: **helpful, honest, harmless**.
3. **Deployment** — users prompt, the model generates from the prompt and its learned patterns.

The fingerprint: assistant behavior is a trained overlay on the document completer. When the overlay slips, you see the completer underneath: rambling, continuing instead of answering, agreeing with whatever frame you gave it. That is also where sycophancy comes from.

Kid-friendly version: a parrot that went to finishing school. Still a parrot underneath, but school taught it manners. When it is tired, the manners slip.

## Current strengths and limits

Strengths: versatility across tasks, conversational fluency, tool use, learning from examples. Limits: knowledge cutoffs, hallucinations, unreliable complex reasoning, context window constraints. The rule for applications: **the best applications pair your judgment, creativity, and oversight with AI's speed and scale.**

## The four properties (each a spectrum, not a switch)

Modern AI is not uniformly capable or unreliable. It is strong and weak along specific, predictable axes, and the strength and the weakness come from the same property. The mechanism never changes; your position on the line does. The skill is learning where the edges are.

### 1. Next Token Prediction: where do AI answers come from?

One operation at massive scale: given everything written so far, predict what comes next, one fragment at a time, sampling from a probability distribution. Closer to a vastly sophisticated autocomplete than a search engine. It is not looking up an answer; it is writing one, word by word, based on what tends to follow what.

- **Capability zone:** well-worn paths. Summarize this, reformat that, explain a common concept.
- **Limitation zone:** novel territory, sparse patterns, anything needing "true vs. sounds true" judgment.
- Pairs with **Discernment**: this property is what discernment is checking.

Kid-friendly version: a student who memorized a million essays. Common topic, the essay flows. Unwritten topic, the student invents, confidently.

### 2. Knowledge: what does AI actually know?

Learned from enormous quantities of text, fixed at the end of training: the knowledge cutoff. No real-time browsing (unless given tools), no experiences.

- **Capability zone:** frequent, recent-in-training, consistent topics. Mainstream science, popular languages, widely-discussed history.
- **Limitation zone:** rare, post-cutoff, niche, local, or contested topics.
- The question is not "does the AI know this?" but **"how well-represented was this in what it read?"**
- Pairs with **Diligence**: this property is what diligence is verifying.

### 3. Working Memory: what is the AI paying attention to right now?

Everything relevant sits inside a fixed-size **context window**: instructions, uploads, prior responses, the dialogue. The model attends to what is in the window and nothing outside it. By default the window empties between sessions; the model does not learn from your corrections, it only responds to what is currently in context.

- **Capability zone:** material fits comfortably, session is current, you supply relevant context.
- **Limitation zone:** very long documents, expecting cross-session continuity, burying critical info mid-input.
- Unlike the others, this one has a **cliff, not a gradient**. Silent truncation, no warning.
- Four tips: put the most important material near the top; chunk long work into passes; use features that save context; start fresh when the conversation drifts.
- Pairs with **Description**: this property is what description acts on.

Kid-friendly version: a desk that fits exactly ten papers. The eleventh pushes one off the back, silently. Every morning the desk is empty again.

### 4. Steerability: how much am I in control?

Fine-tuning makes the model remarkably steerable: role, tone, format, length, rules. But steerability is not understanding; it follows instructions by continuing a pattern. There is always a **gap between what you intended to direct and what actually landed**, and the interesting failures live in that gap.

- **Capability zone:** short, concrete, verifiable instructions. "Respond as a table." "Under 100 words."
- **Limitation zone:** long reasoning chains, abstract asks, native precision (arithmetic, formal logic).
- The question is not "did I give good directions?" but **"how much room is there between my words and my intent?"**
- Pairs with **Delegation**: this property is what delegation navigates.

Kid-friendly version: a brilliant actor who takes stage directions literally. "Walk to the door sadly" is perfect. "Be more authentic" gets a confused stare.

## When properties meet: how real failures happen

Properties interact constantly; most real failures are two properties meeting:

1. **A hallucinated citation** = next token prediction (plausible generation) meeting knowledge (a gap it doesn't know is there).
2. **Drift over a long conversation** = working memory (early context fading) meeting steerability (later instructions overwriting earlier ones).
3. **Confidently wrong math** = next token prediction (fluency decoupled from truth) meeting steerability (no native sense of quantity).
4. **Agreeing with a bad premise** = the trained disposition (keep the user happy) meeting next token prediction (continuing your frame instead of challenging it).

Kid-friendly version: a car crash is never one thing. Rain meeting bald tires. AI failures are two weaknesses arriving at the same moment.

Script angles: "AI is not smart or dumb, it is strong and weak in predictable places." "The reason AI writes so well is the exact reason it lies to you." "Your AI assistant used to be a document completer that did not know you exist." "AI does not forget gradually, it falls off a cliff."

---

# Part 3: Building with AI (applied)

## The task check: where does this sit on each continuum?

Before delegating, ask four questions (a 5-minute exercise):

1. Is this well-worn territory or sparse? (next token prediction)
2. Is this topic recent or stable? (knowledge)
3. Is my context comfortably inside the window? (working memory)
4. Are my instructions concrete, or is there room between my words and my intent? (steerability)

## Connectors and MCP: the informed collaborator

Connectors transform AI from an assistant into an informed collaborator by giving it access to the same tools, data, and context you use every day: searching files, retrieving documents, analyzing data, updating records, executing tasks across connected apps. The engine is the **Model Context Protocol (MCP)**: "USB-C for AI", a universal standard for connecting to many applications through one consistent interface. It is an open standard, so developers can build connectors for any tool, and those connectors work seamlessly with Claude. Two types: **web connectors** (Google Drive, Notion, Slack, Asana) and **desktop extensions** (local files and native apps).

Kid-friendly version: the brilliant intern finally gets a key to the office. MCP is the standard key shape that fits every lock.

Script angles: "Stop pasting context into AI. Connect it instead."

## The behavioral data: what fluent builders actually do

Measured prevalence of behaviors in real AI collaborations. The headline: **description dominates**, and iteration wins by a landslide.

- Iterates and refines: **85.7%** (description)
- Clarifies goal before asking for help: 51.1% (delegation)
- Provides examples of what good looks like: 41.1% (description)
- Specifies format and structure needed: 30% (description)
- Sets interaction mode: 30% (description)
- Communicates tone and style preferences: 22.7% (description)
- Identifies when AI might be missing context: 20.3% (discernment)
- Defines audience for the output: 17.6% (description)
- Questions when AI reasoning doesn't hold up: 15.8% (discernment)
- Consults AI on approach before execution: 10.1% (delegation)
- Checks facts and claims that matter: 8.7% (discernment)

The read: the most common fluent behavior is iterating and refining, by a huge margin. Discernment behaviors are rarer, which is exactly why they are the edge.

Script angles: "The data on what actually works with AI." The 85.7% stat as the hook: fluency is iteration, not prompting genius.

## Putting fluency to work: the capstone

Pick one real thing and apply the 4Ds to it:

1. A feature users have been requesting.
2. A prototype you've been meaning to realize.
3. User feedback you haven't synthesized.

## The closing line

"AI needs your oversight to produce a product that matters. When something's not good enough, how you address it tells you something about how you work with AI."

---

# Part 4: Reference

## Vocabulary

**AI Fluency** — working with AI in ways that are effective, efficient, ethical, and safe. **The 4Ds** — delegation, description, discernment, diligence. **Automation** — human defines, AI executes. **Augmentation** — thinking partners, back-and-forth. **Agency** — AI configured to act independently on your behalf. **Generative AI** — creates new content rather than analyzing existing data. **LLM** — generative AI trained on vast text. **Parameters** — the values inside a model; modern LLMs have billions. **Neural networks** — layered nodes learning patterns from training. **Transformer** — the 2017 architecture processing text in parallel with attention. **Scaling laws** — more size, data, and compute bring consistent gains, sometimes emergent capabilities. **Pre-training** — learning patterns from vast text. **Fine-tuning** — learning to follow instructions and be helpful, honest, harmless. **Context window** — what the AI can attend to at once; fixed size. **Hallucination** — plausible but incorrect, stated confidently. **Knowledge cutoff** — the date the model's world ended. **RAG** — connecting AI to external knowledge to cut hallucinations. **Bias** — systematic unfair patterns from training data. **Temperature** — randomness dial: boiling water vs ice crystals. **Reasoning models** — built to think step-by-step. **Prompt** — instructions plus shared documents. **Prompt engineering** — designing effective prompts. **Chain-of-thought** — step-by-step reasoning prompts. **Few-shot** — teaching by input-output examples. **Role/persona** — the character the AI adopts. **Output constraints** — format, length, structure specified. **Think-first** — reason before answering. **MCP** — USB-C for AI, the universal connector standard.


## Course roadmaps

- **AI Fluency:** the 4D framework; delegation; description; discernment; diligence; generative AI overview; prompting techniques; vocabulary.
- **Capabilities & Limitations:** the framework; next token prediction; knowledge; working memory; steerability; how AI gets its character; when properties meet.
- **Builders:** 4D framework; AI capabilities and limitations; delegation and the builder's toolkit; discernment for code and UX; shipping and next steps.
