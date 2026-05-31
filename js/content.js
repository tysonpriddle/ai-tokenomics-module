/* ============================================================
   CONTENT.JS — All module content as structured data
   Section text, case studies, assessment questions, vendor data.
   Australian/UK English throughout.
   ============================================================ */

const CONTENT = (function () {

    const module = {
        title: 'AI Tokenomics: Cost, Consumption and Control',
        subtitle: 'Understanding, Managing, and Optimising AI Consumption Costs',
        version: '1.0.0',
        duration: '25–30 minutes',
        audience: 'All staff, graduate to partner',
        passThreshold: 0.8
    };

    // ---- Case Studies (factual, sourced) ----

    const caseStudies = {
        uber: {
            id: 'uber',
            source: 'The Information / Fortune / Business Insider',
            date: 'April–May 2026',
            headline: 'Uber Burned Its Entire 2026 AI Budget. By April.',
            stat: '$3.4B',
            statLabel: 'Budget exhausted: 4 months',
            body: [
                'Uber deployed Anthropic\'s Claude Code to its 5,000-strong engineering team in December 2025. By March 2026, 84% of engineers were classified as agentic users, with 95% using AI tools every month.',
                'Token consumption per engineer ran between $500 and $2,000 per month. The company burned through its entire 2026 AI budget by April. Four months into the year.',
                'The trigger? An internal leaderboard ranking engineers by AI usage volume. It incentivised maximum consumption with zero cost awareness.',
                'Uber\'s CTO Praveen Neppalli Naga told The Information: "I\'m back to the drawing board, because the budget I thought I would need is blown away already." The COO later admitted the company still could not draw a clear connection between rising token spend and additional consumer features actually shipped.'
            ],
            lesson: 'Usage-based pricing without governance is a budget time bomb. Incentive structures that reward consumption without cost visibility will always produce runaway spend.',
            sections: ['hook', 'governance']
        },

        microsoft: {
            id: 'microsoft',
            source: 'The Verge / TechRadar / Windows Central',
            date: 'May 2026',
            headline: 'Microsoft Cancelled Its Own AI Tool. Because It Was Too Popular.',
            stat: 'Cancelled',
            statLabel: 'After 80% productivity gains reported',
            body: [
                'Microsoft rolled out Claude Code internally to its Experiences and Devices division in December 2025, the team building Windows, Microsoft 365, Outlook, Teams, and Surface. Adoption was rapid. The tool became, in The Verge\'s words, "perhaps a little too popular."',
                'By May 2026, Microsoft cancelled most internal Claude Code licences, effective 30 June 2026, the last day of its financial year. Engineers were redirected to GitHub Copilot CLI, Microsoft\'s own first-party tool. The driver was cost containment, not capability.',
                'The contradiction is stark: Microsoft simultaneously published an internal report citing 80% productivity gains from AI tools while cancelling access to the tool delivering them.'
            ],
            lesson: 'Token-based billing does not fit traditional enterprise procurement logic. Finance teams budget on fixed per-user assumptions. AI tools charge more the more useful they become. Those two models are fundamentally incompatible without active cost management.',
            sections: ['licences']
        },

        nvidia: {
            id: 'nvidia',
            source: 'Axios / Fortune / Entrepreneur',
            date: 'April 2026',
            headline: 'At Nvidia, AI Costs More Than the Employees Using It',
            stat: '>Salaries',
            statLabel: 'AI compute cost vs employee cost',
            body: [
                'In April 2026, Bryan Catanzaro, Nvidia\'s Vice President of Applied Deep Learning, made a striking admission: for his team, the cost of AI compute now far exceeds the cost of the employees using it. Not marginally. Far beyond.',
                'This is the company that manufactures the chips powering the AI revolution, publicly acknowledging that token costs have eclipsed human labour costs in its own operations.',
                'Nvidia\'s CEO Jensen Huang had previously stated he would be concerned if engineers earning $500,000 annually were not consuming at least $250,000 in AI tokens each year. That framing (token consumption as a performance indicator) is precisely the mindset that drives cost blowouts when applied without governance.',
                'Meanwhile, AI software prices across the US climbed 20–37% in the preceding year (Tropic, 2026), and a 2024 MIT study found AI automation is only economically viable for approximately 23% of jobs.'
            ],
            lesson: 'Token spend is not inherently productive spend. Volume without governance and ROI visibility is just waste at scale.',
            sections: ['governance']
        },

        developer: {
            id: 'developer',
            source: 'DEV Community',
            date: '2025',
            headline: 'A Simple Chatbot. A $12,000 Monthly Bill.',
            stat: '$12,000/mo',
            statLabel: 'From a "simple" chatbot prototype',
            body: [
                'A developer built what they described as a "simple customer service chatbot." The initial prototype took four hours and cost virtually nothing. Six weeks later, they were facing a $12,000 monthly bill and infrastructure complexity they never anticipated.',
                'The DEV Community report noted that most teams building on AI APIs are tracking only one of the six variables that drive actual cost: input tokens, output tokens, model tier, call frequency, context window size, and caching behaviour. Ignoring the other five guarantees surprise bills.',
                'A 2025 Mavvrik survey found 85% of companies missed AI cost forecasts by more than 10%, with 84% reporting gross margin erosion of more than six percentage points as a result.'
            ],
            lesson: 'Prototype cost is not production cost. Every deployment needs cost modelling across all consumption variables before go-live, not after the first bill arrives.',
            sections: ['hook', 'consumption']
        }
    };

    // ---- Sections ----

    const sections = [
        {
            id: 'intro',
            number: 0,
            title: 'Welcome',
            theme: 'intro',
            isIntro: true
        },
        {
            id: 'hook',
            number: 1,
            title: 'The $47,000 Prompt',
            theme: 'theme-hook',
            estimatedMinutes: 3,
            objective: 'Understand why AI tokenomics matters and what the stakes are.',
            whyItMatters: 'You\'ve probably signed off on, approved, or actively used AI tools. If you can\'t explain how they\'re billed, you\'re flying blind when costs land on your desk. This section shows you what that looks like when it goes wrong. So you\'re not the one explaining it to a CFO.',
            content: {
                eyebrow: 'Section 01: The Stakes',
                headline: 'Someone just spent $47,000 on a prompt.',
                standfirst: 'AI costs are real. They accumulate fast. And most organisations have no idea where the spend is going.',
                paragraphs: [
                    'When AI tools became mainstream in corporate environments, most organisations focused on what they could do: draft a document, analyse data, generate code. The question of what they cost was treated as someone else\'s problem.',
                    'That approach has now produced some spectacular budget surprises. Uber burned through its entire annual AI spend in four months. A developer\'s "simple chatbot" generated a $12,000 monthly bill. At Nvidia (the company that makes the chips) AI compute costs now exceed employee salaries.',
                    'These are not edge cases. They are early signals of what happens when powerful consumption-based technology meets procurement processes designed for fixed-cost software licences.',
                    'If you touch AI tools, approve budgets, or advise on AI strategy, tokenomics is now part of the job. Here is the framework to understand it, monitor it, and govern it, at whatever level of technical detail you need.'
                ],
                keyPoints: [
                    'AI API costs are consumption-based, scaling with every request',
                    'Most organisations have no real-time visibility over token spend',
                    'Incentive structures that reward AI usage without cost awareness cause blowouts',
                    'The gap between prototype cost and production cost is routinely underestimated'
                ]
            },
            quizQuestions: ['q_hook_1']
        },
        {
            id: 'tokens',
            number: 2,
            title: 'What Are Tokens?',
            theme: 'theme-tokens',
            estimatedMinutes: 5,
            objective: 'Explain what tokens are and how LLMs process them.',
            whyItMatters: 'You can\'t cut costs you can\'t measure. Once you see how tokenization actually works, you\'ll spot inefficiencies in your own prompts that are costing real money every day, and you\'ll know exactly where to start cutting.',
            content: {
                eyebrow: 'Section 02: Fundamentals',
                headline: 'What the model actually reads.',
                standfirst: 'Tokens are what you\'re actually paying for. Not words. Not characters. Tokens. Here\'s the difference, and why it matters every time you hit send.',
                paragraphs: [
                    'A token is the smallest unit of text that a large language model processes. Not a word. Not a character. A token is typically three to four characters, a chunk of language that the model has learned to recognise as a meaningful piece of text.',
                    'When you type "The quarterly results were below expectations," an LLM doesn\'t read those six words. It converts the text into approximately eight to twelve tokens, depending on the model\'s tokenisation approach. Punctuation, spaces, common prefixes and suffixes all become their own tokens.',
                    'Why does this matter? Because you pay per token, and the number of tokens in any given piece of text is unpredictable if you\'re thinking in words.',
                    'Code is particularly token-intensive. A ten-line Python function might tokenise into 80 to 150 tokens. Technical jargon, acronyms, and non-English text often tokenise less efficiently than plain English prose.',
                    'Different models use different tokenisers. OpenAI\'s GPT-4 uses tiktoken. Anthropic\'s Claude uses a similar byte-pair encoding approach. Google\'s Gemini uses SentencePiece. The same text will produce different token counts across these systems. This matters when comparing costs.'
                ],
                tokenExamples: [
                    { text: 'The',                  tokens: 1 },
                    { text: 'quarterly',             tokens: 2 },
                    { text: 'results',               tokens: 2 },
                    { text: 'were below',            tokens: 3 },
                    { text: 'expectations.',         tokens: 3 },
                    { text: 'def calculate_roi():', tokens: 7 },
                    { text: '{"key": "value"}',      tokens: 6 }
                ],
                keyPoints: [
                    'Tokens ≈ 3–4 characters on average in English',
                    'Code and technical text typically tokenise less efficiently than prose',
                    'Different models use different tokenisers, so costs vary accordingly',
                    'Punctuation, spaces, and special characters each consume tokens'
                ]
            },
            interaction: 'tokenCalculator',
            quizQuestions: ['q_tokens_1']
        },
        {
            id: 'consumption',
            number: 3,
            title: 'How Consumption Works',
            theme: 'theme-consumption',
            estimatedMinutes: 5,
            objective: 'Describe how token consumption accrues across prompt, context window, and completion.',
            whyItMatters: 'Your next AI project, client recommendation, or budget conversation will involve one of these six cost variables. Most people in the room won\'t know them. You will.',
            content: {
                eyebrow: 'Section 03: The Cost Machine',
                headline: 'Every character costs. Here\'s where they add up.',
                standfirst: 'Token costs don\'t come from one place. They accumulate across three distinct zones. Most organisations only see one.',
                paragraphs: [
                    'When you send a request to an AI model, three things happen that all consume tokens: the model reads your prompt (input tokens), it reads all prior context in your conversation (context tokens), and it generates a response (output tokens). Each of these is priced differently.',
                    'Input tokens (your prompt) are typically the cheapest. Output tokens (what the model writes back) cost more, because generating text requires more compute than reading it. Context tokens are input tokens at heart, but they\'re the silent cost driver: every message in a long conversation adds to the context window, and every subsequent request re-reads the entire history.',
                    'This is why a short daily conversation that runs for a week can produce dramatically higher costs in its final sessions than its first. By day five, each request is dragging thousands of tokens of prior conversation along for the ride.',
                    'The six variables that determine your actual bill are: (1) input token volume, (2) output token volume, (3) model tier selected, (4) request frequency, (5) context window size, and (6) caching configuration. Missing any of these in your cost model guarantees a budget surprise.',
                    'Context window caching is a cost-reduction mechanism available in some models. Rather than re-tokenising the same system prompt or document on every request, the model caches the encoded representation. Prompt caching on Claude Sonnet, for example, reduces cached input costs by 90%. For use cases with large, stable system prompts (document review, legal analysis, code review) this is significant.'
                ],
                flowNodes: [
                    { label: 'Your Prompt',    value: 'Input tokens',   colour: 'amber' },
                    { label: 'Prior Context',  value: 'Context tokens', colour: 'cyan'  },
                    { label: 'Model Response', value: 'Output tokens',  colour: 'green' }
                ],
                costVars: [
                    { name: 'Input volume',        impact: 'Medium',   icon: '↑' },
                    { name: 'Output volume',        impact: 'High',     icon: '↑↑' },
                    { name: 'Model tier',           impact: 'High',     icon: '↑↑' },
                    { name: 'Request frequency',    impact: 'Medium',   icon: '↑' },
                    { name: 'Context window size',  impact: 'High',     icon: '↑↑' },
                    { name: 'Caching config',       impact: 'Savings',  icon: '↓' }
                ],
                keyPoints: [
                    'Output tokens cost more than input tokens, typically 3–5× more',
                    'Long conversations accumulate context silently. Costs compound.',
                    'Prompt caching can cut input costs by up to 90% for stable prompts',
                    'Six variables determine actual cost, not just message length'
                ]
            },
            interaction: null,
            quizQuestions: ['q_consumption_1', 'q_consumption_2']
        },
        {
            id: 'licences',
            number: 4,
            title: 'Licences vs Usage Models',
            theme: 'theme-licences',
            estimatedMinutes: 5,
            objective: 'Distinguish licence-based from usage/consumption-based commercial models.',
            whyItMatters: 'Whether you\'re renewing contracts, advising a client on procurement, or challenging a cost line in a meeting, knowing the difference between these models puts you in the right conversation, asking the right questions.',
            content: {
                eyebrow: 'Section 04: Commercial Models',
                headline: 'Fixed price. Variable price. Know the difference.',
                standfirst: 'The most common AI cost surprises come from applying fixed-licence procurement logic to consumption-based products.',
                paragraphs: [
                    'Enterprise software has operated on a predictable model for decades: negotiate a licence, pay per seat, budget annually. Finance teams, procurement functions, and CFOs are built around this model. It produces stable, forecastable costs.',
                    'AI APIs break this model entirely. There is no per-seat price. There is no fixed monthly fee. You pay for what you consume, and what you consume is determined by how intensively your people use the tool, how long their prompts are, how much context they carry, and which model tier they select. All of these variables are dynamic and user-driven.',
                    'The Microsoft case is instructive. Their engineering team adopted Claude Code with enthusiasm, achieving strong productivity outcomes. But the consumption model meant the cost scaled directly with adoption success. The more useful the tool, the higher the bill. By financial year end, the cost was untenable under their budget assumptions, even though the tool was working.',
                    'Hybrid models are emerging. Microsoft Copilot is primarily licence-based, bundled with Microsoft 365 E3 and E5. This gives finance teams the predictability they need, but often at the cost of flexibility: the underlying model choices, context windows, and customisation options are constrained by Microsoft\'s infrastructure decisions.',
                    'Choosing the right commercial model requires matching the model structure to your usage pattern. High-volume, predictable workloads (document review, standard report drafting) may benefit from licence models. Variable, exploratory, or code-heavy workloads (software development, research, client analysis) typically run more efficiently on consumption models. And more expensively, without governance.'
                ],
                comparison: [
                    {
                        model: 'Licence / Per-Seat',
                        pros: ['Predictable cost', 'Simple budgeting', 'No usage surprises', 'Finance-team friendly'],
                        cons: ['Less flexible', 'May limit model choice', 'Pay for unused capacity', 'Hard to scale dynamically'],
                        examples: ['Microsoft Copilot M365', 'Google Workspace Gemini', 'Some OpenAI Enterprise tiers']
                    },
                    {
                        model: 'Consumption / Usage',
                        pros: ['Pay for what you use', 'Model flexibility', 'Scales with demand', 'Innovation-friendly'],
                        cons: ['Unpredictable costs', 'Requires active monitoring', 'Budget overruns likely without governance', 'Complex forecasting'],
                        examples: ['Anthropic API', 'OpenAI API', 'Azure OpenAI', 'Google Cloud Vertex AI']
                    }
                ],
                keyPoints: [
                    'Licence models give predictability at the cost of flexibility',
                    'Consumption models scale with usage, up and down',
                    'The Microsoft case: productivity success drove cost blowout',
                    'Match the commercial model to the usage pattern, not to procurement habit'
                ]
            },
            interaction: 'budgetSimulator',
            quizQuestions: ['q_licences_1']
        },
        {
            id: 'governance',
            number: 5,
            title: 'Monitoring and Governance',
            theme: 'theme-governance',
            estimatedMinutes: 4,
            objective: 'Identify where token waste occurs and how to monitor and govern it.',
            whyItMatters: 'If you manage a team, advise clients on AI strategy, or sit in any budget review, governance is your problem now. This section gives you a language, a framework, and three controls you can implement the same week.',
            content: {
                eyebrow: 'Section 05: Governance',
                headline: 'You can\'t manage what you can\'t see.',
                standfirst: 'Uber didn\'t overspend because their AI was bad. They overspent because no one was watching the incentives. That\'s a governance failure, and it\'s entirely fixable.',
                paragraphs: [
                    'Uber\'s engineering team didn\'t set out to burn $3.4 billion. They followed the incentive structure they were given: a leaderboard that ranked engineers by AI usage volume. The system rewarded consumption. Consumption is what it got.',
                    'At Nvidia, the CEO explicitly framed high token consumption as a performance signal. Engineers who weren\'t spending heavily on AI weren\'t working hard enough. That framing, without governance guardrails, produces the same outcome: volume for its own sake.',
                    'Effective AI governance requires three things: visibility (who is using what, at what cost), thresholds (alerts and controls when consumption exceeds norms), and accountability (connecting spend to outcomes, not just activity).',
                    'Most LMS and enterprise AI platforms now provide usage dashboards. The question is whether anyone is looking at them, and whether the data is connected to budget owners who can act on it.',
                    'Governance frameworks worth knowing: (1) Per-user cost monitoring with anomaly alerts. (2) Team-level monthly budgets with automated throttling. (3) Model tier access controls: not all staff need access to the most expensive models. (4) Prompt logging and review for high-cost users. (5) ROI tracking: what outputs were produced per dollar of AI spend?'
                ],
                governanceControls: [
                    { name: 'Per-user dashboards',    description: 'Real-time visibility into individual consumption', priority: 'High' },
                    { name: 'Anomaly alerts',          description: 'Flag users consuming >3× team average', priority: 'High' },
                    { name: 'Team budget caps',        description: 'Monthly limits with automated throttle or approval gate', priority: 'High' },
                    { name: 'Model tier controls',     description: 'Role-based access to model tiers', priority: 'Medium' },
                    { name: 'Prompt logging',          description: 'Audit trail for high-cost requests', priority: 'Medium' },
                    { name: 'ROI measurement',         description: 'Output quality vs cost tracking', priority: 'High' }
                ],
                keyPoints: [
                    'Uber\'s blowout was an incentive design failure. The leaderboard rewarded volume',
                    'Governance requires visibility, thresholds, and outcome accountability',
                    'Model tier access controls are the fastest lever to reduce spend',
                    'Per-user anomaly monitoring catches runaway consumption early'
                ]
            },
            interaction: 'governanceAudit',
            quizQuestions: ['q_governance_1', 'q_governance_2']
        },
        {
            id: 'optimise',
            number: 6,
            title: 'Optimization Tips and Tricks',
            theme: 'theme-optimise',
            estimatedMinutes: 6,
            objective: 'Apply optimization strategies across real professional services use cases.',
            whyItMatters: 'Every prompt you write costs money. This section cuts that cost by 40 to 70 percent with no loss in quality, on tasks you\'re already doing today. Most of these take less than a minute to apply.',
            content: {
                eyebrow: 'Section 06: Optimization',
                headline: 'The same output. Fewer tokens.',
                standfirst: 'The gap between an average prompt and a good one isn\'t just quality. It\'s cost. Here\'s how to close both at once.',
                paragraphs: [
                    'The gap between an unoptimized prompt and an efficient one is often 40–70% in token count, without any loss in output quality. For a team generating thousands of AI requests per day, that gap is significant.',
                    'The foundation of token-efficient prompting is specificity. Vague prompts produce verbose responses. A prompt that specifies role, task, constraints, and output format will consistently outperform a prompt that relies on the model to infer any of those elements.',
                    'Context hygiene is the second major lever. Most AI chat tools append prior conversation history to every new request. In a long session, this context can dwarf the actual question in token volume. Starting a new session for a new task, rather than continuing an existing chat, is one of the simplest and most underused optimizations.',
                    'Model selection is the most impactful single decision. A task that can be completed by a smaller model (GPT-4o Mini, Claude Haiku, Gemini Flash) at 95% of the quality of the flagship model at 10% of the cost is not a compromise. It\'s a correct engineering decision.',
                    'For repeating use cases (daily report templates, standard client email formats, recurring document reviews), structured prompts with caching-compatible system prompts can reduce costs dramatically. The system prompt is tokenised once and cached; subsequent requests pay only for the variable input.',
                    'Document review is a particularly common professional services use case. Rather than sending the full document on every query, extract only the relevant sections. A 200-page report contains perhaps 10 pages relevant to any given question. Sending 10 pages instead of 200 is a 95% reduction in context tokens for that request.'
                ],
                tips: [
                    {
                        title: 'Lead with role, task, format',
                        body: 'Every high-quality prompt starts with: who the AI should be, what it needs to do, and what the output should look like. This eliminates verbose AI hedging and produces more targeted outputs.',
                        saving: '20–35% fewer output tokens'
                    },
                    {
                        title: 'Start a new session for a new task',
                        body: 'Continuing a long conversation for a new topic drags the entire prior context along. A fresh session starts with zero context tokens. Simple and highly effective.',
                        saving: 'Up to 60% fewer input tokens per request'
                    },
                    {
                        title: 'Right-size your model',
                        body: 'Not every task requires the most capable model. Document summarisation, email drafting, and data extraction often perform at near-identical quality on smaller, cheaper model tiers.',
                        saving: '70–90% cost reduction per request'
                    },
                    {
                        title: 'Extract before you send',
                        body: 'For document analysis, identify the relevant sections before calling the API. Send only what\'s necessary. A well-structured chunked approach often outperforms full-document submission on both cost and accuracy.',
                        saving: '50–90% fewer context tokens'
                    },
                    {
                        title: 'Use caching for stable prompts',
                        body: 'System prompts used across many requests are excellent caching candidates. Anthropic\'s prompt caching reduces cached input costs by 90%. For daily workflows with standard templates, this adds up quickly.',
                        saving: 'Up to 90% on cached input tokens'
                    },
                    {
                        title: 'Set output length constraints',
                        body: 'AI models will write as much as you let them. Specify maximum lengths in your prompt: "Three bullet points maximum," "One paragraph," "Under 200 words." Brevity instructions are respected and directly reduce output token cost.',
                        saving: '30–50% fewer output tokens'
                    },
                    {
                        title: 'Convert documents to Markdown before sending',
                        body: 'PDF, DOCX, and HTML files carry hidden formatting weight: XML wrappers, style metadata, and structural tags all tokenize. Converting to plain Markdown strips this overhead before the API ever sees it. Microsoft\'s open-source markitdown tool (github.com/microsoft/markitdown) converts PDF, Word, PowerPoint, Excel, images, and web pages to clean Markdown in a single command. A 50-page DOCX converted to Markdown often drops 30–40% in token count with no loss of content.',
                        saving: '20–40% fewer input tokens on formatted documents'
                    },
                    {
                        title: 'Build a model routing habit',
                        body: 'Most daily AI usage mixes task types that warrant different model tiers. A practical routing rule: use frontier models (GPT-4o, Claude Sonnet) only for drafting, complex reasoning, and synthesis. Use mid-tier models (GPT-4o Mini, Claude Haiku, Gemini Flash) for summarization, Q&A, extraction, and classification. The quality difference on routine tasks is minimal. The cost difference is not.',
                        saving: '70–90% cost reduction on routed routine tasks'
                    },
                    {
                        title: 'Prefer structured formats for data inputs',
                        body: 'When sending data to an AI model, format matters. A prose description of a dataset ("We have 12 clients, the first is Acme Corp with revenue of $4.2m and a contract renewal in March...") tokenizes far less efficiently than the same data as a Markdown table or JSON object. For any data-heavy task, convert to structured format first. The model reads it faster, the response is more accurate, and you pay less.',
                        saving: '25–45% fewer input tokens vs prose descriptions'
                    }
                ],
                beforeAfterExamples: [
                    {
                        label: 'Verbose corporate request',
                        before: 'I am working on a project for my company and I need some assistance. We have been looking at various options for improving our processes and I believe that artificial intelligence might be helpful in this regard. Could you please provide me with some comprehensive information about how AI tools might be useful for a professional services firm like ours? We work in consulting and have various types of clients across different industries. Please make sure to include examples and be thorough in your response as this is important for our decision-making process.',
                        after: 'You are an AI strategy advisor. Task: Identify 5 specific AI use cases for a professional services firm. For each: use case name, estimated time saved per week, and top implementation risk. Format: structured table. Max 400 words.',
                        tokensBefore: 107,
                        tokensAfter: 52,
                        saving: '51%'
                    },
                    {
                        label: 'Multi-question dump',
                        before: 'What is better Claude or ChatGPT? Also tell me about tokens what are they and how do they cost money and is there a way to save money on them because we have a big team and the costs are going up a lot and our manager is asking questions. Also can you help me write an email?',
                        after: 'You are an AI procurement advisor. Task: Compare Claude and ChatGPT on three criteria: pricing model, context window size, and best fit for a 200-person consulting team. Format: comparison table, max 300 words.',
                        tokensBefore: 75,
                        tokensAfter: 47,
                        saving: '37%'
                    },
                    {
                        label: 'Full-document summary request',
                        before: '[200-page document pasted as context]\n\nSummarise?',
                        after: '[Executive summary and recommendations sections only, 8 pages]\n\nSummarise in 3 sentences: key finding, recommended action, biggest risk.',
                        tokensBefore: 60000,
                        tokensAfter: 2400,
                        saving: '96%'
                    }
                ],
                keyPoints: [
                    'Role + task + format in every prompt reduces output verbosity by 20–35%',
                    'New session for a new task: eliminates accumulated context cost',
                    'Model right-sizing: 70–90% cost reduction with minimal quality trade-off',
                    'Prompt caching: up to 90% off input costs for stable system prompts',
                    'Convert documents to Markdown before sending: markitdown strips 20–40% of input tokens',
                    'Structured data (tables, JSON) tokenizes far more efficiently than prose descriptions'
                ]
            },
            interaction: 'promptSandbox',
            quizQuestions: ['q_optimise_1']
        },
        {
            id: 'vendors',
            number: 7,
            title: 'Vendor Landscape',
            theme: 'theme-vendors',
            estimatedMinutes: 4,
            objective: 'Navigate commercial arrangements with Microsoft, OpenAI, Anthropic, and Google.',
            whyItMatters: 'You\'ll be asked which vendor to recommend, or need to explain why the current one is over budget. Four vendors, four different commercial bets. Clear enough to walk into any meeting with.',
            content: {
                eyebrow: 'Section 07: Vendors',
                headline: 'Four vendors. Four different commercial bets.',
                standfirst: 'The AI vendor landscape is consolidating fast, but the commercial structures remain meaningfully different. Understanding each vendor\'s model helps you advise clients and manage internal procurement.',
                vendors: [
                    {
                        id: 'microsoft',
                        name: 'Microsoft Copilot',
                        icon: '⊞',
                        cssClass: 'vendor-card-ms',
                        model: 'Licence (M365)',
                        contextWindow: '128K (GPT-4o)',
                        pricing: 'Bundled with M365 E3/E5; standalone Copilot licences from ~$30/user/month',
                        strengths: ['Deepest Office 365 integration', 'Predictable cost for finance teams', 'Broad enterprise compliance coverage', 'No separate procurement required'],
                        gotchas: ['Underlying model fixed by Microsoft', 'Limited customisation', 'Copilot Studio adds significant cost', 'Not suitable for code-heavy workloads'],
                        bestFor: 'Organisations deep in M365 needing predictable AI spend on productivity tasks'
                    },
                    {
                        id: 'openai',
                        name: 'OpenAI / GPT-4',
                        icon: '◌',
                        cssClass: 'vendor-card-oai',
                        model: 'Consumption (API) / Licence (Enterprise)',
                        contextWindow: 'Up to 128K (GPT-4o)',
                        pricing: 'API: $5–$15 per 1M tokens (GPT-4o); ChatGPT Enterprise: per-seat negotiated',
                        strengths: ['Widest model range', 'Largest ecosystem of integrations', 'Strong coding and reasoning', 'First mover with enterprise adoption'],
                        gotchas: ['API costs accumulate rapidly at scale', 'Enterprise pricing opaque', 'Frequent model deprecation', 'No built-in prompt caching on all tiers'],
                        bestFor: 'Teams needing flexibility across model tiers and broad integration options'
                    },
                    {
                        id: 'anthropic',
                        name: 'Anthropic (Claude)',
                        icon: '▲',
                        cssClass: 'vendor-card-ant',
                        id2: 'anthropic-vendor-icon',
                        model: 'Consumption (API) / Subscription (Pro/Team)',
                        contextWindow: 'Up to 200K (Claude Sonnet/Opus)',
                        pricing: 'API: $3–$15 per 1M tokens; Claude.ai Team from $30/user/month',
                        strengths: ['Largest context window in class', 'Strong long-document reasoning', 'Built-in prompt caching (90% cost reduction)', 'Research-grade safety standards'],
                        gotchas: ['Less enterprise tooling than Microsoft', 'Newer enterprise offering', 'API pricing at scale requires active governance', 'Fewer native integrations than OpenAI'],
                        bestFor: 'Long-document analysis, legal and compliance review, code generation at scale'
                    },
                    {
                        id: 'google',
                        name: 'Google (Gemini)',
                        icon: '◉',
                        cssClass: 'vendor-card-goog',
                        model: 'Licence (Workspace) / Consumption (Cloud API)',
                        contextWindow: 'Up to 1M (Gemini 1.5 Pro)',
                        pricing: 'Google Workspace Gemini: from $24/user/month; API: $3.50 per 1M input tokens',
                        strengths: ['Largest context window available', 'Native multimodal (text, image, video, audio)', 'Tight Google Workspace integration', 'Strong performance on code and long documents'],
                        gotchas: ['Enterprise maturity still developing vs Microsoft', 'Gemini 1.5 Pro API not cheap at high volume', 'Workspace Gemini feature set more limited than Copilot', 'Regulatory concerns in some regions'],
                        bestFor: 'Google Workspace-native organisations, multimodal use cases, very long document processing'
                    }
                ],
                matchingStatements: [
                    { id: 'ms1',   text: 'Primarily bundled with M365 E3/E5 enterprise licences',           vendor: 'microsoft' },
                    { id: 'ms2',   text: 'Best fit for organisations already deep in the Microsoft 365 ecosystem', vendor: 'microsoft' },
                    { id: 'oai1',  text: 'Pay-per-token API; Enterprise tier available at negotiated per-seat pricing', vendor: 'openai' },
                    { id: 'oai2',  text: 'Widest model range, from cost-optimized to frontier reasoning models', vendor: 'openai' },
                    { id: 'ant1',  text: 'Known for the largest context windows (up to 200K) and built-in prompt caching', vendor: 'anthropic' },
                    { id: 'ant2',  text: 'Strong on long-document reasoning; research-grade safety approach', vendor: 'anthropic' },
                    { id: 'goog1', text: 'Deepest integration with Google Workspace; Gemini for Workspace per-seat model', vendor: 'google' },
                    { id: 'goog2', text: 'Multimodal native: text, image, audio, and video in the same model', vendor: 'google' }
                ],
                keyPoints: [
                    'Microsoft: most predictable cost, least flexible. Ideal for M365-heavy orgs',
                    'OpenAI: broadest ecosystem, widest model range, needs active API governance',
                    'Anthropic: largest context window, best for long-document and code workloads',
                    'Google: multimodal native, tightest Workspace integration, largest context available'
                ]
            },
            interaction: 'vendorMatch',
            quizQuestions: ['q_vendors_1']
        },
        {
            id: 'assessment',
            number: 8,
            title: 'Assessment',
            theme: 'theme-assessment',
            estimatedMinutes: 5,
            isAssessment: true
        }
    ];

    // ---- Assessment Questions ----

    const questions = [
        {
            id: 'q1',
            type: 'mcq',
            section: 'tokens',
            text: 'What is a token in the context of large language models?',
            options: [
                { id: 'a', text: 'A unit of cryptocurrency used to pay for AI access' },
                { id: 'b', text: 'The smallest unit of text processed by an LLM, roughly 3–4 characters', correct: true },
                { id: 'c', text: 'An access credential or API key' },
                { id: 'd', text: 'A measure of AI model accuracy' }
            ],
            feedback: {
                correct: 'Exactly right. A token is approximately 3–4 characters in English text. Not a word, not a sentence. The model converts your text into tokens before processing it.',
                incorrect: 'A token is the smallest unit of text processed by an LLM, roughly 3–4 characters in English. It\'s not a word, character, or currency. See Section 2.'
            },
            tags: ['tokens', 'fundamentals']
        },
        {
            id: 'q2',
            type: 'mcq',
            section: 'governance',
            text: 'An executive sends the same 50-page report to an AI tool every day for context. Which cost component does this primarily drive up?',
            options: [
                { id: 'a', text: 'Output token costs: the AI response gets longer each day' },
                { id: 'b', text: 'Input token costs: the 50-page document is re-tokenised on every request', correct: true },
                { id: 'c', text: 'Model licence fees: repeated usage triggers a surcharge' },
                { id: 'd', text: 'Storage costs: document retention is billed separately' }
            ],
            feedback: {
                correct: 'Correct. A 50-page document is enormous in token terms, potentially 40,000–80,000 tokens. Sending it daily means re-paying that input cost every time. Context management is a key optimization opportunity.',
                incorrect: 'The main driver here is input tokens. The 50-page document must be tokenised and processed on every request. That document alone could represent 40,000–80,000 input tokens per day. See Sections 2 and 6.'
            },
            tags: ['consumption', 'governance']
        },
        {
            id: 'q3',
            type: 'truefalse',
            section: 'licences',
            text: 'True or False: Usage-based AI pricing always costs less than licence-based pricing for enterprise teams.',
            options: [
                { id: 'a', text: 'True, consumption models only charge for what you use, so they\'re always cheaper' },
                { id: 'b', text: 'False: actual cost depends on usage volume, patterns, and governance quality', correct: true }
            ],
            feedback: {
                correct: 'Correct. Usage-based pricing is cheaper when consumption is low or well-managed. It becomes expensive, sometimes dramatically so, when usage scales without governance. The Microsoft case study is a clear example.',
                incorrect: 'False. Usage-based pricing scales with consumption. For teams with high or unmanaged usage, it can far exceed what a licence model would cost. The right choice depends on your usage pattern and governance maturity.'
            },
            tags: ['licences', 'commercial']
        },
        {
            id: 'q4',
            type: 'scenario',
            section: 'optimise',
            text: 'Your colleague needs to summarize a client\'s 80-page market entry report. Which approach is most token-efficient while maintaining output quality?',
            options: [
                { id: 'a', text: 'Paste the full 80-page document and ask: "Summarise this"' },
                { id: 'b', text: 'Extract the executive summary and recommendations (8 pages), then ask: "Summarise in 5 bullet points covering finding, recommendation, and top risk"', correct: true },
                { id: 'c', text: 'Ask the AI to request the specific sections it needs, then send the full document' },
                { id: 'd', text: 'Send the full document with a detailed prompt explaining the context and what a good summary looks like' }
            ],
            feedback: {
                correct: 'Excellent. Extracting relevant sections before sending reduces context tokens by up to 90%. A specific output instruction (5 bullet points, defined structure) also constrains output length. This is the most token-efficient approach.',
                incorrect: 'The most efficient approach is to extract only the relevant sections (executive summary, recommendations) and include a specific output format in the prompt. Sending the full 80-page document incurs enormous input token cost for most questions. See Section 6.'
            },
            tags: ['optimisation', 'practical']
        },
        {
            id: 'q5',
            type: 'mcq',
            section: 'consumption',
            text: 'What does the context window primarily determine for AI usage costs?',
            options: [
                { id: 'a', text: 'How quickly the AI generates a response' },
                { id: 'b', text: 'The visual quality of AI-generated images' },
                { id: 'c', text: 'How much prior conversation and document content the AI can process per request, directly affecting input costs', correct: true },
                { id: 'd', text: 'The number of concurrent users on the platform' }
            ],
            feedback: {
                correct: 'Correct. The context window determines how much text the model can "hold in mind" at once, including your prompt, prior conversation history, and any documents you\'ve attached. More context means more input tokens and higher cost.',
                incorrect: 'The context window determines how much prior text the model can process in one request: your prompt, conversation history, and attached documents. A large context window enables longer conversations but also drives up input token costs. See Section 3.'
            },
            tags: ['consumption', 'context']
        },
        {
            id: 'q6',
            type: 'mcq',
            section: 'hook',
            text: 'According to the Uber case study, what was the primary driver of their AI budget overrun?',
            options: [
                { id: 'a', text: 'Choosing an expensive AI provider without competitive tendering' },
                { id: 'b', text: 'An internal leaderboard incentivising maximum AI usage volume without any cost awareness', correct: true },
                { id: 'c', text: 'A technical error causing duplicate API calls across all engineering teams' },
                { id: 'd', text: 'Poor contract negotiation with their AI vendor' }
            ],
            feedback: {
                correct: 'Right. Uber\'s leaderboard rewarded volume. Engineers consumed as much as they could. There was no cost visibility, no output accountability, and no governance threshold. The incentive design caused the blowout, not the technology.',
                incorrect: 'The primary driver was Uber\'s internal leaderboard, which ranked engineers by AI usage volume. This incentivised maximum consumption with zero cost awareness or output accountability. See Section 1 and Section 5.'
            },
            tags: ['governance', 'case-study']
        },
        {
            id: 'q7',
            type: 'mcq',
            section: 'tokens',
            text: 'Which of the following is NOT typically a variable in AI API consumption costs?',
            options: [
                { id: 'a', text: 'Number of input tokens in the prompt' },
                { id: 'b', text: 'Number of output tokens in the response' },
                { id: 'c', text: 'The seniority level of the person making the request', correct: true },
                { id: 'd', text: 'The AI model tier selected (e.g. flagship vs cost-optimized)' }
            ],
            feedback: {
                correct: 'Correct. AI APIs charge based on token volume, model tier, and sometimes frequency. Not on who is making the request. A graduate and a partner pay the same token rate. That\'s why governance can\'t rely on user seniority as a proxy for appropriate usage.',
                incorrect: 'User seniority is not a billing variable in any major AI API. Costs are determined by: input tokens, output tokens, model tier, request frequency, context window size, and caching configuration. See Section 3.'
            },
            tags: ['consumption', 'billing']
        },
        {
            id: 'q8',
            type: 'truefalse',
            section: 'licences',
            text: 'True or False: Microsoft cancelled Claude Code access for its engineering team primarily because the tool was underperforming.',
            options: [
                { id: 'a', text: 'True: Microsoft found the productivity gains were insufficient to justify the cost' },
                { id: 'b', text: 'False: Microsoft simultaneously reported 80% productivity gains while cancelling access due to cost containment', correct: true }
            ],
            feedback: {
                correct: 'Correct. The contradiction is stark: Microsoft\'s internal reports cited 80% productivity gains from the tool at the same time as the cancellation. The driver was cost containment, not performance. This illustrates the structural tension between consumption pricing and enterprise budgeting.',
                incorrect: 'False. Microsoft explicitly cited cost containment as the reason. Not underperformance. The company\'s own internal report documented 80% productivity gains from the tool. The issue was that consumption-based pricing didn\'t fit enterprise financial planning assumptions.'
            },
            tags: ['licences', 'case-study']
        },
        {
            id: 'q9',
            type: 'scenario',
            section: 'governance',
            text: 'A governance dashboard shows one team member consuming 10× the daily average. What is the most appropriate initial response?',
            options: [
                { id: 'a', text: 'Immediately revoke that user\'s AI access to prevent further spend' },
                { id: 'b', text: 'Investigate the usage pattern to determine whether the consumption is producing valuable output before taking action', correct: true },
                { id: 'c', text: 'Increase the team\'s overall monthly budget to accommodate the usage pattern' },
                { id: 'd', text: 'Set an automatic cap at the team average for all users to equalise consumption' }
            ],
            feedback: {
                correct: 'Correct approach. High consumption is not automatically wasteful. A senior associate running an AI-powered document review sprint might legitimately consume 10× the average for a day. Investigate first; act on evidence, not on the number alone.',
                incorrect: 'The correct first step is investigation. Anomalous consumption may be legitimate (a complex project, a document review sprint) or it may be wasteful (repeated large documents, no usable output). Act on evidence, not on the consumption number alone. See Section 5.'
            },
            tags: ['governance', 'practical']
        },
        {
            id: 'q10',
            type: 'mcq',
            section: 'optimise',
            text: 'Effective prompts for professional service tasks typically include which three structural elements?',
            options: [
                { id: 'a', text: 'Length, complexity, and formal language to match the professional context' },
                { id: 'b', text: 'Role definition, clear task description, and specified output format', correct: true },
                { id: 'c', text: 'Keywords, synonyms, and repeated context so that the model understands' },
                { id: 'd', text: 'Question marks, bullet lists, and numbered steps to structure the conversation' }
            ],
            feedback: {
                correct: 'Exactly right. Role (who the AI should be), task (what it needs to do), and format (what the output should look like) are the three structural elements of a high-quality, token-efficient prompt. This structure reduces hedging, reduces verbosity, and produces more useful outputs.',
                incorrect: 'The three elements are: role (who the AI should be), task (what it must do), and output format (what the response should look like). This structure consistently produces more focused outputs with fewer unnecessary tokens. See Section 6.'
            },
            tags: ['optimisation', 'prompting']
        }
    ];

    // ---- Advanced tips (secret section, 90%+ assessment) ----

    const advancedTips = [
        {
            title: 'Structured Output Schemas',
            body: 'Request JSON or XML output with a defined schema. Models constrained to structured output produce shorter, more parseable responses. This also eliminates the cost of parsing natural language in downstream code.'
        },
        {
            title: 'Prefix Caching Window Management',
            body: 'Anthropic\'s prompt caching requires the cached portion to appear at the start of the prompt and remain identical across requests. Design system prompts to put stable instructions first and variable user input last.'
        },
        {
            title: 'Batch API for Non-Urgent Tasks',
            body: 'OpenAI and Anthropic offer batch API endpoints for non-time-sensitive workloads. Batch processing delivers 50% cost reduction in exchange for up to 24-hour turnaround. Ideal for overnight document processing.'
        },
        {
            title: 'Model Routing by Task Complexity',
            body: 'Build a routing layer that assesses query complexity before selecting a model. Simple queries (lookup, format, extract) route to cheap models; complex reasoning routes to premium tiers. 80% of enterprise AI requests can typically be handled by cost-optimized models.'
        },
        {
            title: 'Speculative Decoding Awareness',
            body: 'Some providers implement speculative decoding to reduce latency. This can affect token counting in subtle ways. For cost-sensitive workloads, benchmark actual token usage rather than relying on estimates from tokeniser libraries.'
        },
        {
            title: 'Automate format conversion with markitdown',
            body: 'Microsoft\'s open-source markitdown library (github.com/microsoft/markitdown) converts PDF, DOCX, PPTX, XLSX, HTML, images, and audio to clean Markdown via a single Python call or CLI command. For teams processing documents at scale, integrating markitdown as a pre-processing step before any API call is one of the highest-leverage engineering decisions available. A pipeline that converts, chunks, and caches before sending can reduce input token costs by 40–60% compared to naive full-document submission.'
        },
        {
            title: 'Token counting before you commit',
            body: 'Every major provider exposes a token counting endpoint separate from the inference API. Calling it costs nothing and returns exact token counts before you pay for the request. For large or expensive workloads, build a count-then-decide step: if the input exceeds a threshold, trigger chunking or summarization before proceeding. OpenAI\'s tiktoken library and Anthropic\'s count_tokens endpoint both support this pattern.'
        }
    ];

    // ---- Quiz questions by section (inline, for section practice) ----

    const sectionQuizzes = {
        q_hook_1: {
            id: 'q_hook_1',
            text: 'Which of the following best describes why the Uber AI budget overrun happened?',
            options: [
                { id: 'a', text: 'They chose the most expensive AI vendor on the market' },
                { id: 'b', text: 'They rewarded AI usage volume without connecting it to cost or outcomes', correct: true },
                { id: 'c', text: 'Their engineers were unqualified to use AI tools effectively' },
                { id: 'd', text: 'The AI APIs experienced unexpected price increases mid-contract' }
            ],
            feedback: {
                correct: 'Exactly right. The leaderboard created perverse incentives. Maximum volume regardless of value. That\'s the governance failure at the heart of most AI cost blowouts. +50 TC.',
                incorrect: 'The core issue was incentive design: a leaderboard rewarding usage volume with no connection to cost or outcomes. Governance, not vendor selection, is the fix.'
            },
            tcReward: 50
        },
        q_tokens_1: {
            id: 'q_tokens_1',
            text: 'Approximately how many tokens would the phrase "quarterly financial results" contain?',
            options: [
                { id: 'a', text: '3 tokens (one per word)' },
                { id: 'b', text: '5–7 tokens', correct: true },
                { id: 'c', text: '12–15 tokens (one per character)' },
                { id: 'd', text: '1 token (it\'s a common phrase)' }
            ],
            feedback: {
                correct: 'Right. Three words at roughly 2 tokens each gives 5–7 tokens. Tokens ≈ 3–4 characters, not words. "Quarterly" alone is likely 2–3 tokens.',
                incorrect: 'Tokens are not words. At roughly 3–4 characters per token, "quarterly financial results" (27 characters + spaces) is approximately 5–7 tokens. See the Token Lab above.'
            },
            tcReward: 50
        },
        q_consumption_1: {
            id: 'q_consumption_1',
            text: 'Which type of tokens typically costs MORE to produce?',
            options: [
                { id: 'a', text: 'Input tokens: reading is computationally expensive' },
                { id: 'b', text: 'Output tokens: generating text requires more compute than reading it', correct: true },
                { id: 'c', text: 'Context tokens: they\'re charged at a premium rate' },
                { id: 'd', text: 'They\'re all priced identically' }
            ],
            feedback: {
                correct: 'Correct. Generating tokens (output) requires substantially more compute than processing existing tokens (input). Most providers price output at 3–5× the input rate.',
                incorrect: 'Output tokens are more expensive because generating text is computationally more intensive than reading it. Most providers charge 3–5× more for output than input.'
            },
            tcReward: 50
        },
        q_consumption_2: {
            id: 'q_consumption_2',
            text: 'What is "prompt caching" and what cost benefit does it provide?',
            options: [
                { id: 'a', text: 'Storing prompt templates locally to avoid typing them again. No direct cost benefit' },
                { id: 'b', text: 'The model caches the encoded representation of a stable prompt, avoiding re-tokenisation, with up to 90% reduction in cached input costs', correct: true },
                { id: 'c', text: 'A rate-limiting mechanism that caches requests to avoid API overload' },
                { id: 'd', text: 'Saving output responses for reuse, reducing the need for new API calls' }
            ],
            feedback: {
                correct: 'Exactly right. Prompt caching means the model encodes a stable system prompt once and reuses that encoding. Subsequent requests pay only for new variable input. Anthropic\'s implementation delivers up to 90% reduction in cached input costs.',
                incorrect: 'Prompt caching is a model-level mechanism where the encoded representation of a stable prompt is stored and reused across requests. This avoids re-tokenising the same system prompt on every call. Anthropic\'s implementation cuts cached input costs by up to 90%.'
            },
            tcReward: 50
        },
        q_licences_1: {
            id: 'q_licences_1',
            text: 'A client\'s 200-person team primarily uses AI for standard email drafting, meeting summaries, and slide formatting. Which commercial model is most appropriate?',
            options: [
                { id: 'a', text: 'Consumption/API: they should only pay for what they use' },
                { id: 'b', text: 'Licence/per-seat: predictable cost for predictable, high-frequency tasks', correct: true },
                { id: 'c', text: 'Hybrid: split high-volume users onto API and low-volume onto licence' },
                { id: 'd', text: 'Neither: these tasks don\'t justify AI spend at all' }
            ],
            feedback: {
                correct: 'Good reasoning. Standard productivity tasks (emails, summaries, slides) have predictable frequency and volume. A per-seat licence gives finance the cost certainty they need without the monitoring overhead of an API billing model.',
                incorrect: 'For predictable, high-frequency, standardised tasks, a licence model typically wins. It gives cost certainty without the monitoring infrastructure needed to manage API billing at scale. API models shine for variable, complex, or experimental workloads.'
            },
            tcReward: 50
        },
        q_governance_1: {
            id: 'q_governance_1',
            text: 'Which governance control has the highest immediate impact on reducing AI spend?',
            options: [
                { id: 'a', text: 'Publishing a usage policy document for all staff' },
                { id: 'b', text: 'Implementing model tier access controls based on role and use case', correct: true },
                { id: 'c', text: 'Holding a training session on prompt efficiency' },
                { id: 'd', text: 'Requesting weekly usage reports from the AI vendor' }
            ],
            feedback: {
                correct: 'Correct. Model tier access control is the fastest lever. Preventing junior staff from accessing flagship models when a cost-optimized tier performs adequately for their tasks directly cuts the per-token rate across a large user base.',
                incorrect: 'Model tier access control has the highest immediate impact. Restricting access to expensive flagship models for users who don\'t need them cuts the per-token rate across your entire user base immediately. Policies and training change behaviour slowly; access controls change costs overnight.'
            },
            tcReward: 50
        },
        q_governance_2: {
            id: 'q_governance_2',
            text: 'Effective AI governance connects token spend to what?',
            options: [
                { id: 'a', text: 'Employee performance reviews: high usage should be rewarded' },
                { id: 'b', text: 'Visible outcomes and ROI: what was produced per dollar of AI spend', correct: true },
                { id: 'c', text: 'IT asset registers: AI usage should be tracked like software licences' },
                { id: 'd', text: 'Training completion rates: certified users should have higher limits' }
            ],
            feedback: {
                correct: 'Exactly right. Spend without outcome accountability is Uber\'s mistake repeated. The question isn\'t "how much did we spend?" It\'s "what did that spend produce?" Connect TC to outputs, not just activity.',
                incorrect: 'Governance connects spend to outcomes. Uber\'s failure was rewarding activity (usage volume) instead of output (useful features shipped). Effective governance asks: what did this AI spend actually produce?'
            },
            tcReward: 50
        },
        q_optimise_1: {
            id: 'q_optimise_1',
            text: 'Starting a new AI conversation for each new task rather than continuing existing chats primarily reduces which cost?',
            options: [
                { id: 'a', text: 'Output token costs: the AI produces shorter responses' },
                { id: 'b', text: 'Context token costs: prior conversation history is not re-sent with each new request', correct: true },
                { id: 'c', text: 'Model selection costs: new sessions default to cheaper models' },
                { id: 'd', text: 'API connection fees: fewer sessions reduce platform overhead' }
            ],
            feedback: {
                correct: 'Correct. Every message in an existing conversation is appended to the context window of every new request. Starting fresh eliminates that accumulated context cost. For a week-long conversation, the final sessions may carry 10× the context of the first.',
                incorrect: 'Starting fresh eliminates accumulated context tokens. In a long conversation, every prior message is re-sent with each new request. By the end of a week, that context can dwarf the actual question in token volume. See Section 6.'
            },
            tcReward: 50
        },
        q_vendors_1: {
            id: 'q_vendors_1',
            text: 'A law firm needs to review 500-page contracts, processing the entire document in a single AI session. Which vendor\'s infrastructure is most technically suited to this task?',
            options: [
                { id: 'a', text: 'Microsoft Copilot: best enterprise compliance coverage' },
                { id: 'b', text: 'OpenAI GPT-4: widest ecosystem and most integrations' },
                { id: 'c', text: 'Google Gemini 1.5 Pro: context window up to 1 million tokens', correct: true },
                { id: 'd', text: 'Anthropic Claude: strongest reasoning on structured documents' }
            ],
            feedback: {
                correct: 'Correct. Gemini 1.5 Pro\'s 1 million token context window is purpose-built for exactly this: processing an entire 500-page contract in one session without chunking. Claude (200K) and GPT-4o (128K) would require multi-pass approaches for a document this large.',
                incorrect: 'For processing a 500-page document (potentially 300,000–500,000 tokens) in a single session, Google Gemini 1.5 Pro\'s 1 million token context window is uniquely capable. Claude handles 200K; GPT-4o handles 128K. Both would require document chunking for this workload.'
            },
            tcReward: 50
        }
    };

    return {
        module,
        caseStudies,
        sections,
        questions,
        sectionQuizzes,
        advancedTips
    };
})();
