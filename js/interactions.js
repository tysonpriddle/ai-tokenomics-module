/* ============================================================
   INTERACTIONS.JS — All interactive component logic
   Token Calculator, Prompt Sandbox, Budget Simulator,
   Governance Audit, Vendor Matching Challenge.

   Security note: user text input is always inserted via
   textContent or createElement — never innerHTML.
   ============================================================ */

const INTERACTIONS = (function () {

    // ---- 1. TOKEN CALCULATOR ----

    const TOKEN_PRICES = {
        'GPT-4o':             { input: 5.00,  output: 15.00  },
        'Claude Sonnet 3.7':  { input: 3.00,  output: 15.00  },
        'Gemini 1.5 Pro':     { input: 3.50,  output: 10.50  },
        'GPT-4o Mini':        { input: 0.15,  output: 0.60   },
        'Claude Haiku 3':     { input: 0.25,  output: 1.25   },
        'Gemini Flash':       { input: 0.075, output: 0.30   }
    };

    function estimateTokens(text) {
        if (!text) return 0;
        // Heuristic: 1 token per ~3.8 characters (English prose average)
        // Code and symbols tokenise at ~2.5 chars/token
        const codePatterns = /[{}\[\]();=<>!@#$%^&*]/g;
        const codeChars = (text.match(codePatterns) || []).length;
        const regularChars = text.length - codeChars;
        return Math.ceil(regularChars / 3.8 + codeChars / 2.5);
    }

    function estimateOutputTokens(inputTokens) {
        // Typical completion is 40–60% of prompt length for professional tasks
        return Math.ceil(inputTokens * 0.5);
    }

    function buildTokenCalculator(container) {
        container.innerHTML = '';

        const wrap = document.createElement('div');
        wrap.className = 'card card-cyan';
        wrap.style.cssText = 'margin-top:var(--s8);';

        // Header
        const hdr = document.createElement('div');
        hdr.className = 'token-demo-header';
        hdr.style.cssText = 'margin:-24px -24px 20px;border-radius:var(--r6) var(--r6) 0 0;border-bottom:1px solid var(--border);padding:10px 16px;';
        const dots = document.createElement('div');
        dots.className = 'token-demo-dots';
        ['#EF4444','#F59E0B','#10B981'].forEach(function (c) {
            const s = document.createElement('span');
            s.style.cssText = `width:8px;height:8px;border-radius:50%;background:${c};display:inline-block;`;
            dots.appendChild(s);
        });
        const lbl = document.createElement('span');
        lbl.textContent = 'TOKEN CALCULATOR';
        lbl.style.cssText = 'font-family:var(--font-mono);font-size:0.65rem;letter-spacing:0.1em;color:var(--cyan);margin-left:8px;';
        hdr.appendChild(dots);
        hdr.appendChild(lbl);
        wrap.appendChild(hdr);

        // Example prompt selector label
        const exLabel = document.createElement('div');
        exLabel.className = 'label label-cyan';
        exLabel.style.marginBottom = '10px';
        exLabel.textContent = 'Compare these prompts';
        wrap.appendChild(exLabel);

        // Four example prompts showing the spectrum
        const examples = [
            {
                label: 'Vague',
                tag: 'Too short to be useful',
                text: 'Summarise the report.',
                note: 'Cheapest prompt, but the AI guesses everything: which report, what format, who the audience is. Expect a generic, unusable response.'
            },
            {
                label: 'Typical',
                tag: 'How most people prompt',
                text: 'Please review this quarterly client report and provide a comprehensive analysis of the key financial metrics, risk factors, and strategic recommendations for our partner briefing next week.',
                note: 'Moderate token cost. Describes the task but leaves format, length, and audience entirely to the AI.'
            },
            {
                label: 'Padded',
                tag: 'Common expensive mistake',
                text: 'I was wondering if you could perhaps help me out with something I\'ve been thinking about. I have a quarterly client report prepared by our finance team and I\'d really appreciate it if you could go through it and highlight the key financial metrics, the main risk factors, and anything else you feel is relevant to our upcoming partner briefing next week, which is quite an important meeting for us.',
                note: 'Higher token cost for no extra value. That filler adds up across thousands of team requests, and the AI ignores most of it anyway.'
            },
            {
                label: 'Structured',
                tag: 'Token-efficient',
                text: 'Role: Financial analyst. Task: Review the Q3 client report. Output: 5 bullets covering top metric, key risks, one recommendation. Audience: executive briefing.',
                note: 'Fewer tokens than "Typical" and half the cost of "Padded", yet the AI knows exactly what to produce. Role + Task + Output format is the trifecta.'
            }
        ];

        // Selector pill row
        const pillRow = document.createElement('div');
        pillRow.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;';
        wrap.appendChild(pillRow);

        // Prompt display box (read-only)
        const promptDisplay = document.createElement('div');
        promptDisplay.style.cssText = 'font-family:var(--font-mono);font-size:0.78rem;line-height:1.65;color:var(--text-2);background:var(--surface-3);border:1px solid var(--border);border-radius:var(--r4);padding:14px 16px;min-height:64px;margin-bottom:8px;white-space:pre-wrap;word-break:break-word;';
        wrap.appendChild(promptDisplay);

        // Context note beneath the prompt
        const promptNote = document.createElement('div');
        promptNote.style.cssText = 'font-size:0.78rem;color:var(--text-3);margin-bottom:var(--s5);font-style:italic;min-height:2.4em;';
        wrap.appendChild(promptNote);

        // Results area
        const resultsDiv = document.createElement('div');
        resultsDiv.id = 'calc-results';
        resultsDiv.style.cssText = 'margin-top:var(--s5);';
        wrap.appendChild(resultsDiv);

        container.appendChild(wrap);

        // Build pills and wire up selection
        var activePill = null;

        examples.forEach(function (ex, i) {
            const pill = document.createElement('button');
            pill.type = 'button';
            pill.style.cssText = 'font-family:var(--font-mono);font-size:0.65rem;letter-spacing:0.08em;text-transform:uppercase;padding:5px 14px;border-radius:20px;border:1px solid var(--border-2);background:var(--surface-3);color:var(--text-3);cursor:pointer;transition:all var(--t-base);white-space:nowrap;';
            pill.textContent = ex.label;

            function selectExample() {
                if (typeof SOUND !== 'undefined') SOUND.play('click');
                if (activePill) {
                    activePill.style.background = 'var(--surface-3)';
                    activePill.style.color = 'var(--text-3)';
                    activePill.style.borderColor = 'var(--border-2)';
                }
                pill.style.background = 'var(--cyan-dark)';
                pill.style.color = '#fff';
                pill.style.borderColor = 'var(--cyan)';
                activePill = pill;
                promptDisplay.textContent = ex.text;
                promptNote.textContent = ex.tag + ' · ' + ex.note;
                updateCalculator(ex.text, resultsDiv);
            }

            pill.addEventListener('click', selectExample);
            pill.addEventListener('mouseenter', function () {
                if (pill !== activePill) {
                    pill.style.borderColor = 'var(--cyan)';
                    pill.style.color = 'var(--text)';
                }
            });
            pill.addEventListener('mouseleave', function () {
                if (pill !== activePill) {
                    pill.style.borderColor = 'var(--border-2)';
                    pill.style.color = 'var(--text-3)';
                }
            });

            pillRow.appendChild(pill);

            // Default to "Typical" on load
            if (i === 1) { selectExample(); }
        });
    }

    function updateCalculator(text, resultsDiv) {
        const inputTok = estimateTokens(text);
        const outputTok = estimateOutputTokens(inputTok);
        const total = inputTok + outputTok;

        resultsDiv.innerHTML = '';

        if (inputTok === 0) return;

        // Token count display
        const countRow = document.createElement('div');
        countRow.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:var(--s3);margin-bottom:var(--s5);';

        [
            { label: 'Input Tokens',  value: inputTok.toLocaleString(),  color: 'var(--amber)' },
            { label: 'Est. Output',   value: outputTok.toLocaleString(), color: 'var(--cyan)' },
            { label: 'Total',         value: total.toLocaleString(),      color: 'var(--text)' }
        ].forEach(function (item) {
            const cell = document.createElement('div');
            cell.className = 'cost-meter';
            const val = document.createElement('div');
            val.className = 'cost-meter-value';
            val.style.color = item.color;
            val.textContent = item.value;
            const lbl = document.createElement('div');
            lbl.className = 'cost-meter-label';
            lbl.textContent = item.label;
            cell.appendChild(val);
            cell.appendChild(lbl);
            countRow.appendChild(cell);
        });
        resultsDiv.appendChild(countRow);

        // Token breakdown bar (input vs output proportion)
        const barWrap = document.createElement('div');
        barWrap.style.cssText = 'margin-bottom:var(--s5);';

        const barLabel = document.createElement('div');
        barLabel.style.cssText = 'font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-3);margin-bottom:6px;display:flex;justify-content:space-between;';
        const barLabelL = document.createElement('span');
        barLabelL.textContent = 'Token composition';
        const barLabelR = document.createElement('span');
        var inputPct = Math.round((inputTok / total) * 100);
        barLabelR.textContent = inputPct + '% input / ' + (100 - inputPct) + '% output';
        barLabel.appendChild(barLabelL);
        barLabel.appendChild(barLabelR);
        barWrap.appendChild(barLabel);

        const barTrack = document.createElement('div');
        barTrack.style.cssText = 'height:10px;border-radius:5px;background:var(--surface-3);overflow:hidden;display:flex;';
        const barInput = document.createElement('div');
        barInput.style.cssText = 'height:100%;background:linear-gradient(90deg,var(--amber-dark),var(--amber));border-radius:5px 0 0 5px;transition:width 0.5s ease;';
        barInput.style.width = inputPct + '%';
        const barOutput = document.createElement('div');
        barOutput.style.cssText = 'height:100%;flex:1;background:linear-gradient(90deg,var(--cyan-dark),var(--cyan));';
        barTrack.appendChild(barInput);
        barTrack.appendChild(barOutput);
        barWrap.appendChild(barTrack);
        resultsDiv.appendChild(barWrap);

        // Cost breakdown by model
        const tableWrap = document.createElement('div');
        tableWrap.style.cssText = 'background:var(--surface-3);border:1px solid var(--border);border-radius:var(--r4);overflow:hidden;';

        const tableHdr = document.createElement('div');
        tableHdr.style.cssText = 'padding:8px 16px;border-bottom:1px solid var(--border);font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--cyan);';
        tableHdr.textContent = 'Cost Breakdown: Per Request';
        tableWrap.appendChild(tableHdr);

        const table = document.createElement('table');
        table.className = 'data-table';
        const thead = document.createElement('thead');
        const theadRow = document.createElement('tr');
        ['Model', 'Input cost', 'Output cost', 'Total / request'].forEach(function (h) {
            const th = document.createElement('th');
            th.textContent = h;
            theadRow.appendChild(th);
        });
        thead.appendChild(theadRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        Object.keys(TOKEN_PRICES).forEach(function (model) {
            const p = TOKEN_PRICES[model];
            const inCost  = (inputTok  / 1e6) * p.input;
            const outCost = (outputTok / 1e6) * p.output;
            const total   = inCost + outCost;

            const tr = document.createElement('tr');

            const tdModel = document.createElement('td');
            tdModel.style.fontWeight = '600';
            tdModel.style.color = 'var(--text)';
            tdModel.textContent = model;

            const tdIn  = document.createElement('td');
            tdIn.textContent = '$' + inCost.toFixed(4);

            const tdOut = document.createElement('td');
            tdOut.textContent = '$' + outCost.toFixed(4);

            const tdTot = document.createElement('td');
            tdTot.style.color = 'var(--amber)';
            tdTot.style.fontWeight = '700';
            tdTot.textContent = '$' + total.toFixed(4);

            tr.appendChild(tdModel); tr.appendChild(tdIn);
            tr.appendChild(tdOut); tr.appendChild(tdTot);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        tableWrap.appendChild(table);
        resultsDiv.appendChild(tableWrap);

        // Model cost comparison bars
        var modelCosts = {};
        var maxCost = 0;
        Object.keys(TOKEN_PRICES).forEach(function (model) {
            var p = TOKEN_PRICES[model];
            var c = (inputTok / 1e6) * p.input + (outputTok / 1e6) * p.output;
            modelCosts[model] = c;
            if (c > maxCost) maxCost = c;
        });

        var chartWrap = document.createElement('div');
        chartWrap.style.cssText = 'margin-top:var(--s4);background:var(--surface-3);border:1px solid var(--border);border-radius:var(--r4);padding:var(--s4) var(--s5);';
        var chartHdr = document.createElement('div');
        chartHdr.style.cssText = 'font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--text-3);margin-bottom:var(--s4);';
        chartHdr.textContent = 'Relative cost per request';
        chartWrap.appendChild(chartHdr);

        var modelColors = { 'GPT-4o': 'var(--red)', 'GPT-4o Mini': 'var(--amber)', 'Claude Sonnet': '#CC785C', 'Claude Haiku': 'var(--cyan)', 'Gemini Flash': 'var(--green)' };
        Object.keys(modelCosts).forEach(function (model) {
            var cost = modelCosts[model];
            var pct = maxCost > 0 ? (cost / maxCost) * 100 : 0;
            var row = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:center;gap:var(--s3);margin-bottom:6px;';
            var rowLabel = document.createElement('div');
            rowLabel.style.cssText = 'font-family:var(--font-mono);font-size:0.65rem;color:var(--text-3);min-width:110px;white-space:nowrap;';
            rowLabel.textContent = model;
            var rowTrack = document.createElement('div');
            rowTrack.style.cssText = 'flex:1;height:6px;background:var(--surface-4);border-radius:3px;overflow:hidden;';
            var rowBar = document.createElement('div');
            var barColor = modelColors[model] || 'var(--text-3)';
            rowBar.style.cssText = 'height:100%;border-radius:3px;transition:width 0.6s ease;background:' + barColor + ';';
            rowBar.style.width = pct + '%';
            rowTrack.appendChild(rowBar);
            var rowCost = document.createElement('div');
            rowCost.style.cssText = 'font-family:var(--font-mono);font-size:0.65rem;color:var(--text-2);min-width:56px;text-align:right;';
            rowCost.textContent = '$' + cost.toFixed(4);
            row.appendChild(rowLabel);
            row.appendChild(rowTrack);
            row.appendChild(rowCost);
            chartWrap.appendChild(row);
        });
        resultsDiv.appendChild(chartWrap);

        // Scale note
        const note = document.createElement('div');
        note.className = 'tip-box';
        note.style.marginTop = 'var(--s4)';
        const noteTxt = document.createElement('p');
        noteTxt.innerHTML = `At 1,000 requests/day, GPT-4o costs ≈ <strong style="color:var(--amber);">$${((total * 1000 * 365) / 1e3).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} annually</strong>. Claude Haiku costs ≈ <strong style="color:var(--cyan);">$${(((inputTok / 1e6) * 0.25 + (outputTok / 1e6) * 1.25) * 1000 * 365).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} annually</strong>. Model selection matters.`;
        note.appendChild(noteTxt);
        resultsDiv.appendChild(note);

        GAME.completeOptionalActivity('tokenCalc');
    }

    // ---- 2. PROMPT OPTIMISATION SANDBOX ----

    function buildPromptSandbox(container) {
        const examples = CONTENT.sections.find(function (s) { return s.id === 'optimise'; }).content.beforeAfterExamples;
        let currentIdx = 0;
        let section6Errors = 0;

        container.innerHTML = '';

        const wrap = document.createElement('div');
        wrap.style.marginTop = 'var(--s8)';

        // Selector
        const selectorRow = document.createElement('div');
        selectorRow.style.cssText = 'display:flex;gap:var(--s3);margin-bottom:var(--s5);flex-wrap:wrap;';

        examples.forEach(function (ex, i) {
            const btn = document.createElement('button');
            btn.className = 'btn btn-ghost btn-sm';
            btn.textContent = 'Example ' + (i + 1);
            btn.dataset.idx = i;
            if (i === 0) btn.classList.add('btn-secondary');
            btn.onclick = function () {
                currentIdx = i;
                selectorRow.querySelectorAll('.btn').forEach(function (b) { b.classList.remove('btn-secondary'); });
                btn.classList.add('btn-secondary');
                loadExample(examples[i]);
            };
            selectorRow.appendChild(btn);
        });
        wrap.appendChild(selectorRow);

        // Editor layout
        const layout = document.createElement('div');
        layout.className = 'editor-layout';
        layout.style.cssText = 'border:1px solid var(--border);border-radius:var(--r6);overflow:hidden;';

        // Before pane
        const beforePane = document.createElement('div');
        beforePane.className = 'editor-pane editor-pane-left';

        const beforeHdr = document.createElement('div');
        beforeHdr.className = 'editor-pane-header';
        const beforeLabel = document.createElement('span');
        beforeLabel.textContent = '✗ BEFORE (wasteful)';
        beforeLabel.style.color = 'var(--red)';
        beforeHdr.appendChild(beforeLabel);
        const beforeTok = document.createElement('span');
        beforeTok.id = 'before-tokens';
        beforeTok.style.cssText = 'font-family:var(--font-mono);font-size:0.65rem;color:var(--text-3);';
        beforeHdr.appendChild(beforeTok);
        beforePane.appendChild(beforeHdr);

        const beforeBody = document.createElement('div');
        beforeBody.className = 'editor-pane-body';
        beforeBody.id = 'before-body';
        beforeBody.style.cssText = 'padding:var(--s5);font-family:var(--font-mono);font-size:0.8rem;color:var(--text-2);line-height:1.7;white-space:pre-wrap;word-break:break-word;';
        beforePane.appendChild(beforeBody);
        layout.appendChild(beforePane);

        // After pane (editable)
        const afterPane = document.createElement('div');
        afterPane.className = 'editor-pane editor-pane-right';

        const afterHdr = document.createElement('div');
        afterHdr.className = 'editor-pane-header';
        const afterLabel = document.createElement('span');
        afterLabel.textContent = '+ YOUR OPTIMIZED VERSION';
        afterLabel.style.color = 'var(--green)';
        afterHdr.appendChild(afterLabel);
        const afterTok = document.createElement('span');
        afterTok.id = 'after-tokens';
        afterTok.style.cssText = 'font-family:var(--font-mono);font-size:0.65rem;color:var(--text-3);';
        afterHdr.appendChild(afterTok);
        afterPane.appendChild(afterHdr);

        const userTextarea = document.createElement('textarea');
        userTextarea.className = 'prompt-textarea';
        userTextarea.id = 'sandbox-user-input';
        userTextarea.style.cssText = 'border:none;border-radius:0;flex:1;min-height:160px;resize:none;background:rgba(16,185,129,0.03);';
        userTextarea.placeholder = 'Rewrite the prompt to be more token-efficient while retaining the intended outcome...';
        afterPane.appendChild(userTextarea);
        layout.appendChild(afterPane);
        wrap.appendChild(layout);

        // Score / submit
        const scoreRow = document.createElement('div');
        scoreRow.style.cssText = 'display:flex;gap:var(--s4);align-items:center;margin-top:var(--s4);flex-wrap:wrap;';

        const submitBtn = document.createElement('button');
        submitBtn.className = 'btn btn-primary';
        submitBtn.textContent = 'Score My Prompt';
        submitBtn.onclick = function () {
            scoreSandbox(examples[currentIdx], userTextarea.value, scoreDiv, section6Errors);
        };
        scoreRow.appendChild(submitBtn);

        const showModelBtn = document.createElement('button');
        showModelBtn.className = 'btn btn-ghost btn-sm';
        showModelBtn.textContent = 'Show model answer';
        showModelBtn.onclick = function () {
            showModelAnswer(examples[currentIdx], scoreDiv);
        };
        scoreRow.appendChild(showModelBtn);
        wrap.appendChild(scoreRow);

        const scoreDiv = document.createElement('div');
        scoreDiv.id = 'sandbox-score';
        scoreDiv.style.marginTop = 'var(--s4)';
        wrap.appendChild(scoreDiv);

        container.appendChild(wrap);

        // Wire textarea to token counter
        userTextarea.addEventListener('input', function () {
            const t = estimateTokens(userTextarea.value);
            afterTok.textContent = t + ' tokens';
        });

        loadExample(examples[0]);

        function loadExample(ex) {
            // Use textContent to prevent XSS
            beforeBody.textContent = ex.before;
            beforeTok.textContent = estimateTokens(ex.before) + ' tokens';
            userTextarea.value = '';
            afterTok.textContent = '0 tokens';
            scoreDiv.innerHTML = '';
        }
    }

    function scoreSandbox(example, userText, scoreDiv, section6Errors) {
        if (!userText || userText.trim().length < 10) {
            GAME.showToast('Write your optimised prompt before scoring.', 'red');
            return;
        }

        const beforeTokens = estimateTokens(example.before);
        const userTokens   = estimateTokens(userText);
        const reduction    = Math.round(((beforeTokens - userTokens) / beforeTokens) * 100);

        const hasRole   = /you are|act as|as a|as an/i.test(userText);
        const hasTask   = /summaris|summariz|analys|analyz|identify|list|write|compare|extract|review/i.test(userText);
        const hasFormat = /bullet|table|paragraph|words|sentence|format|structure/i.test(userText);

        const structureScore = (hasRole ? 33 : 0) + (hasTask ? 33 : 0) + (hasFormat ? 34 : 0);
        const reductionScore = Math.min(100, Math.max(0, reduction * 1.5));
        const overall = Math.round((structureScore * 0.5) + (reductionScore * 0.5));

        scoreDiv.innerHTML = '';

        const resultCard = document.createElement('div');
        resultCard.className = overall >= 60 ? 'card card-cyan' : 'card card-amber';

        // Score header
        const scoreHeader = document.createElement('div');
        scoreHeader.style.cssText = 'display:flex;align-items:center;gap:var(--s6);margin-bottom:var(--s5);';

        const scoreNum = document.createElement('div');
        scoreNum.className = 'stat-value';
        scoreNum.style.fontSize = '2.5rem';
        scoreNum.textContent = overall + '/100';
        scoreHeader.appendChild(scoreNum);

        const scoreSummary = document.createElement('div');
        const scoreGrade = document.createElement('div');
        scoreGrade.style.cssText = 'font-weight:700;font-size:1.1rem;color:var(--text);margin-bottom:4px;';
        scoreGrade.textContent = overall >= 80 ? 'Excellent optimisation!' : overall >= 60 ? 'Good work. Room to improve.' : 'Needs work.';
        const scoreReduction = document.createElement('div');
        scoreReduction.style.cssText = 'font-family:var(--font-mono);font-size:0.75rem;color:var(--text-3);';
        scoreReduction.textContent = `Token reduction: ${reduction}% (${beforeTokens} → ${userTokens} tokens)`;
        scoreSummary.appendChild(scoreGrade);
        scoreSummary.appendChild(scoreReduction);
        scoreHeader.appendChild(scoreSummary);
        resultCard.appendChild(scoreHeader);

        // Structure checklist
        const checkItems = [
            { label: 'Role defined (you are / as a...)', pass: hasRole },
            { label: 'Clear task specified',              pass: hasTask },
            { label: 'Output format indicated',           pass: hasFormat }
        ];
        checkItems.forEach(function (item) {
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:6px;font-size:0.875rem;';
            const icon = document.createElement('span');
            icon.textContent = item.pass ? '✓' : '✗';
            icon.style.color = item.pass ? 'var(--green)' : 'var(--red)';
            icon.style.fontWeight = '700';
            const lbl = document.createElement('span');
            lbl.textContent = item.label;
            lbl.style.color = item.pass ? 'var(--text)' : 'var(--text-3)';
            row.appendChild(icon);
            row.appendChild(lbl);
            resultCard.appendChild(row);
        });

        scoreDiv.appendChild(resultCard);

        if (overall >= 60) {
            GAME.awardTC(30, 'prompt optimisation');
            GAME.completeOptionalActivity('promptSandbox');
        }
        if (section6Errors === 0 && !STATE.badges.pennyPincher) {
            GAME.awardBadge('pennyPincher');
        }
    }

    function showModelAnswer(example, scoreDiv) {
        scoreDiv.innerHTML = '';
        const card = document.createElement('div');
        card.className = 'card card-cyan';

        const title = document.createElement('div');
        title.className = 'label label-cyan';
        title.style.marginBottom = '12px';
        title.textContent = 'MODEL ANSWER';
        card.appendChild(title);

        const text = document.createElement('pre');
        text.style.cssText = 'font-family:var(--font-mono);font-size:0.85rem;color:var(--green);white-space:pre-wrap;word-break:break-word;background:rgba(16,185,129,0.05);padding:var(--s4);border-radius:var(--r3);';
        text.textContent = example.after; // textContent — safe
        card.appendChild(text);

        const meta = document.createElement('div');
        meta.style.cssText = 'margin-top:12px;font-family:var(--font-mono);font-size:0.7rem;color:var(--text-3);';
        meta.textContent = `Token saving vs original: ${example.saving}  (${example.tokensBefore.toLocaleString()} → ${example.tokensAfter.toLocaleString()} tokens)`;
        card.appendChild(meta);

        scoreDiv.appendChild(card);
        GAME.awardTC(10, 'viewed model answer');
    }

    // ---- 3. BUDGET SCENARIO SIMULATOR ----

    function buildBudgetSimulator(container) {
        container.innerHTML = '';

        const wrap = document.createElement('div');
        wrap.style.marginTop = 'var(--s8)';

        const title = document.createElement('div');
        title.className = 'label label-amber';
        title.style.marginBottom = '12px';
        title.textContent = 'BUDGET SCENARIO SIMULATOR';
        wrap.appendChild(title);

        const scenario = document.createElement('div');
        scenario.className = 'warn-box';
        scenario.style.marginBottom = 'var(--s6)';
        const scenarioP = document.createElement('p');
        scenarioP.innerHTML = '<strong>Scenario:</strong> Your team of 40 analysts will use AI for document review and report drafting. Usage will be 3–4 hours per day per analyst. Choose a commercial model and configure the assumptions below.';
        scenario.appendChild(scenarioP);
        wrap.appendChild(scenario);

        // Sliders
        const sliderWrap = document.createElement('div');
        sliderWrap.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:var(--s5);margin-bottom:var(--s6);';

        const sliders = [
            { id: 'slider-requests', label: 'Daily requests per user', min: 10, max: 200, value: 80, unit: 'requests/day' },
            { id: 'slider-tokens', label: 'Avg tokens per request', min: 500, max: 8000, value: 2000, unit: 'tokens' },
            { id: 'slider-users', label: 'Team size', min: 10, max: 100, value: 40, unit: 'users' },
            { id: 'slider-tier', label: 'Model tier factor', min: 1, max: 10, value: 3, unit: '× base rate' }
        ];

        const sliderInputs = {};

        sliders.forEach(function (s) {
            const rangeWrap = document.createElement('div');
            rangeWrap.className = 'range-wrap';

            const labelRow = document.createElement('div');
            labelRow.className = 'range-label-row';
            const labelSpan = document.createElement('span');
            labelSpan.textContent = s.label;
            const valSpan = document.createElement('span');
            valSpan.className = 'range-value';
            valSpan.id = s.id + '-val';
            valSpan.textContent = s.value.toLocaleString() + ' ' + s.unit;
            labelRow.appendChild(labelSpan);
            labelRow.appendChild(valSpan);
            rangeWrap.appendChild(labelRow);

            const input = document.createElement('input');
            input.type = 'range';
            input.id = s.id;
            input.min = s.min;
            input.max = s.max;
            input.value = s.value;
            sliderInputs[s.id] = input;
            input.addEventListener('input', function () {
                valSpan.textContent = parseInt(input.value).toLocaleString() + ' ' + s.unit;
                updateBudgetResult(resultDiv);
            });
            rangeWrap.appendChild(input);

            sliderWrap.appendChild(rangeWrap);
        });
        wrap.appendChild(sliderWrap);

        // Result
        const resultDiv = document.createElement('div');
        resultDiv.id = 'budget-result';
        wrap.appendChild(resultDiv);

        function updateBudgetResult(resultDiv) {
        const requests = parseInt(sliderInputs['slider-requests'] ? sliderInputs['slider-requests'].value : 80) || 80;
        const tokens   = parseInt(sliderInputs['slider-tokens']   ? sliderInputs['slider-tokens'].value   : 2000) || 2000;
        const users    = parseInt(sliderInputs['slider-users']    ? sliderInputs['slider-users'].value    : 40) || 40;
        const tier     = parseInt(sliderInputs['slider-tier']     ? sliderInputs['slider-tier'].value     : 3) || 3;

        // Base rate: Claude Sonnet input at $3/1M input tokens, $15/1M output
        const BASE_INPUT  = 3.0;
        const BASE_OUTPUT = 15.0;
        const tierFactor  = tier / 3; // normalise: tier=3 = Sonnet (baseline)

        const inputTokens  = tokens * 0.6;
        const outputTokens = tokens * 0.4;

        const costPerRequest = ((inputTokens / 1e6) * BASE_INPUT + (outputTokens / 1e6) * BASE_OUTPUT) * tierFactor;
        const dailyCost      = costPerRequest * requests * users;
        const monthlyCost    = dailyCost * 22; // working days
        const annualCost     = dailyCost * 260;

        // Licence equivalent: $30/user/month (Copilot-style)
        const licenceMonthly = users * 30;
        const licenceAnnual  = licenceMonthly * 12;

        resultDiv.innerHTML = '';

        const grid = document.createElement('div');
        grid.className = 'dashboard-grid';
        grid.style.marginBottom = 'var(--s5)';

        [
            { label: 'Daily consumption cost',    value: '$' + dailyCost.toFixed(0),    delta: '', colour: 'var(--amber)' },
            { label: 'Monthly consumption cost',  value: '$' + monthlyCost.toFixed(0),  delta: '', colour: 'var(--amber)' },
            { label: 'Annual consumption cost',   value: '$' + Math.round(annualCost).toLocaleString(), delta: '', colour: 'var(--red)' },
            { label: 'Licence model annual cost', value: '$' + licenceAnnual.toLocaleString(), delta: '', colour: 'var(--cyan)' }
        ].forEach(function (item) {
            const widget = document.createElement('div');
            widget.className = 'dashboard-widget';
            const wLabel = document.createElement('div');
            wLabel.className = 'dashboard-widget-label';
            wLabel.textContent = item.label;
            const wVal = document.createElement('div');
            wVal.className = 'dashboard-widget-value';
            wVal.style.color = item.colour;
            wVal.textContent = item.value;
            widget.appendChild(wLabel);
            widget.appendChild(wVal);
            grid.appendChild(widget);
        });
        resultDiv.appendChild(grid);

        // Recommendation
        const recCard = document.createElement('div');
        recCard.className = annualCost > licenceAnnual ? 'warn-box' : 'tip-box';
        const recP = document.createElement('p');
        if (annualCost > licenceAnnual) {
            const ratio = (annualCost / licenceAnnual).toFixed(1);
            recP.innerHTML = `<strong>Recommendation: Consider a licence model.</strong> At these usage levels, consumption pricing costs ${ratio}× more than a comparable per-seat licence. Unless you need flexibility to vary model tiers, a licence model provides better cost predictability.`;
        } else {
            const saving = Math.round(licenceAnnual - annualCost).toLocaleString();
            recP.innerHTML = `<strong>Recommendation: Consumption model is cost-effective.</strong> At these usage levels, you save approximately $${saving}/year vs a per-seat licence. Monitor closely. Increased usage will change this calculation.`;
        }
        recCard.appendChild(recP);
        resultDiv.appendChild(recCard);

        GAME.completeOptionalActivity('budgetSim');
        }

        container.appendChild(wrap);
        updateBudgetResult(resultDiv);
    }

    // ---- 4. GOVERNANCE AUDIT ----

    const AUDIT_DATA = {
        teamAvgDaily: 2340,
        period: 'May 2026',
        anomalies: ['user-04', 'date-12', 'dept-legal', 'model-gpt4', 'user-11'],
        rows: [
            { user: 'A. Chen',      dept: 'Advisory',   daily: 2100, model: 'Sonnet',    anomaly: false },
            { user: 'B. Patel',     dept: 'Audit',      daily: 1850, model: 'Sonnet',    anomaly: false },
            { user: 'C. Muller',    dept: 'Tax',        daily: 2680, model: 'Haiku',     anomaly: false },
            { user: 'D. Torres',    dept: 'Advisory',   daily: 22400, model: 'GPT-4o',   anomaly: 'user-04', anomalyNote: '10x average, GPT-4o + high volume' },
            { user: 'E. Wilson',    dept: 'Audit',      daily: 1920, model: 'Sonnet',    anomaly: false },
            { user: 'F. Okafor',    dept: 'Advisory',   daily: 3100, model: 'Sonnet',    anomaly: false },
            { user: 'G. Park',      dept: 'Tax',        daily: 2200, model: 'Haiku',     anomaly: false },
            { user: 'H. Davies',    dept: 'Advisory',   daily: 1760, model: 'Sonnet',    anomaly: false },
            { user: 'I. Nguyen',    dept: 'Legal',      daily: 8900, model: 'Claude Pro', anomaly: 'dept-legal', anomalyNote: 'Legal spike vs baseline (dept avg 1,200)' },
            { user: 'J. Ramirez',   dept: 'Audit',      daily: 2050, model: 'Sonnet',    anomaly: false },
            { user: 'K. Singh',     dept: 'Tax',        daily: 2440, model: 'Sonnet',    anomaly: false },
            { user: 'L. Thompson',  dept: 'Advisory',   daily: 18700, model: 'GPT-4o',   anomaly: 'user-11', anomalyNote: '8x average, investigate promptly' }
        ],
        dateSpike: { date: '12 May', tokens: 94000, avgTokens: 28000, anomalyId: 'date-12', note: 'Spike on 12 May: 3.4x daily average. Batch job or misconfiguration?' },
        modelBreakdown: [
            { model: 'GPT-4o',    pct: 38, cost: 4820, anomaly: 'model-gpt4', note: '38% of requests on most expensive tier. Can most be rerouted to Sonnet?' },
            { model: 'Claude Sonnet', pct: 41, cost: 1230, anomaly: false },
            { model: 'Claude Haiku',  pct: 12, cost: 120, anomaly: false },
            { model: 'Claude Pro',    pct: 9,  cost: 800, anomaly: false }
        ]
    };

    function buildGovernanceAudit(container) {
        container.innerHTML = '';

        const wrap = document.createElement('div');
        wrap.style.marginTop = 'var(--s8)';

        const found = [];
        const total = AUDIT_DATA.anomalies.length;

        // Instructions
        const instr = document.createElement('div');
        instr.className = 'tip-box';
        instr.style.marginBottom = 'var(--s5)';
        const instrP = document.createElement('p');
        instrP.innerHTML = '<strong>Governance Audit:</strong> Review the mock usage dashboard below. Identify and click on the 5 anomalies hidden in the data. Click a row, spike, or model to flag it.';
        instr.appendChild(instrP);
        wrap.appendChild(instr);

        // Score display
        const scoreBar = document.createElement('div');
        scoreBar.style.cssText = 'display:flex;align-items:center;gap:var(--s4);margin-bottom:var(--s5);font-family:var(--font-mono);font-size:0.8rem;color:var(--text-3);';
        const scoreNum = document.createElement('span');
        scoreNum.id = 'audit-score';
        scoreNum.textContent = '0/' + total + ' anomalies found';
        scoreNum.style.color = 'var(--amber)';
        scoreBar.appendChild(scoreNum);
        wrap.appendChild(scoreBar);

        // Dashboard terminal
        const terminal = document.createElement('div');
        terminal.className = 'governance-terminal';

        const termBar = document.createElement('div');
        termBar.className = 'terminal-bar';
        const termTitle = document.createElement('span');
        termTitle.className = 'terminal-title';
        termTitle.textContent = 'AI USAGE MONITOR: ' + AUDIT_DATA.period;
        const termStatus = document.createElement('div');
        termStatus.className = 'terminal-status';
        termBar.appendChild(termTitle);
        termBar.appendChild(termStatus);
        terminal.appendChild(termBar);

        const termBody = document.createElement('div');
        termBody.className = 'terminal-body';

        // Metric: date spike
        const spikeLine = document.createElement('div');
        spikeLine.style.cssText = 'padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer;';
        spikeLine.innerHTML = '';
        const spikeInner = document.createElement('div');
        spikeInner.style.cssText = 'display:flex;justify-content:space-between;';
        const spikeLabel = document.createElement('span');
        spikeLabel.className = 'terminal-prompt';
        spikeLabel.textContent = '$ DAILY TOTAL: ' + AUDIT_DATA.dateSpike.date + ': ';
        const spikeVal = document.createElement('span');
        spikeVal.style.color = 'var(--amber)';
        spikeVal.textContent = AUDIT_DATA.dateSpike.tokens.toLocaleString() + ' tokens';
        const spikeAvg = document.createElement('span');
        spikeAvg.className = 'terminal-output';
        spikeAvg.textContent = '(avg: ' + AUDIT_DATA.dateSpike.avgTokens.toLocaleString() + ')';
        spikeInner.appendChild(spikeLabel);
        spikeInner.appendChild(spikeVal);
        spikeInner.appendChild(spikeAvg);
        spikeLine.appendChild(spikeInner);

        const flagSpike = _buildFlagBtn(AUDIT_DATA.dateSpike.anomalyId, AUDIT_DATA.dateSpike.note, found, total, scoreNum);
        spikeLine.appendChild(flagSpike);
        termBody.appendChild(spikeLine);

        // Model breakdown
        const modelLabel = document.createElement('div');
        modelLabel.className = 'terminal-prompt';
        modelLabel.style.cssText = 'padding:8px 0 4px;';
        modelLabel.textContent = '$ MODEL TIER BREAKDOWN';
        termBody.appendChild(modelLabel);

        AUDIT_DATA.modelBreakdown.forEach(function (m) {
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:4px 0;cursor:' + (m.anomaly ? 'pointer' : 'default') + ';';

            const modelName = document.createElement('span');
            modelName.style.cssText = 'width:140px;color:var(--text-2);font-size:0.8rem;';
            modelName.textContent = m.model;

            const pctBar = document.createElement('div');
            pctBar.style.cssText = `flex:1;height:6px;background:var(--surface-4);border-radius:3px;overflow:hidden;`;
            const pctFill = document.createElement('div');
            pctFill.style.cssText = `height:100%;width:${m.pct}%;background:${m.anomaly ? 'var(--amber)' : 'var(--cyan)'};border-radius:3px;`;
            pctBar.appendChild(pctFill);

            const pctNum = document.createElement('span');
            pctNum.style.cssText = 'width:40px;text-align:right;font-family:var(--font-mono);font-size:0.75rem;color:var(--text-3);';
            pctNum.textContent = m.pct + '%';

            const costNum = document.createElement('span');
            costNum.style.cssText = 'width:60px;text-align:right;font-family:var(--font-mono);font-size:0.75rem;';
            costNum.style.color = m.anomaly ? 'var(--amber)' : 'var(--text-3)';
            costNum.textContent = '$' + m.cost;

            row.appendChild(modelName); row.appendChild(pctBar);
            row.appendChild(pctNum); row.appendChild(costNum);

            if (m.anomaly) {
                const flagBtn = _buildFlagBtn(m.anomaly, m.note, found, total, scoreNum);
                row.appendChild(flagBtn);
            }
            termBody.appendChild(row);
        });

        // User table
        const userLabel = document.createElement('div');
        userLabel.className = 'terminal-prompt';
        userLabel.style.cssText = 'padding:12px 0 6px;';
        userLabel.textContent = '$ USER CONSUMPTION (tokens/day)';
        termBody.appendChild(userLabel);

        AUDIT_DATA.rows.forEach(function (r) {
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:3px 0;cursor:' + (r.anomaly ? 'pointer' : 'default') + ';';

            const userName = document.createElement('span');
            userName.style.cssText = 'width:120px;font-size:0.8rem;';
            userName.style.color = r.anomaly ? 'var(--amber)' : 'var(--text-2)';
            userName.textContent = r.user;

            const dept = document.createElement('span');
            dept.style.cssText = 'width:80px;font-size:0.7rem;color:var(--text-3);';
            dept.textContent = r.dept;

            const daily = document.createElement('span');
            daily.style.cssText = 'width:80px;text-align:right;font-family:var(--font-mono);font-size:0.8rem;';
            daily.style.color = r.daily > AUDIT_DATA.teamAvgDaily * 3 ? 'var(--amber)' : 'var(--text-2)';
            daily.textContent = r.daily.toLocaleString();

            const model = document.createElement('span');
            model.style.cssText = 'width:90px;font-family:var(--font-mono);font-size:0.7rem;color:var(--text-3);';
            model.textContent = r.model;

            row.appendChild(userName); row.appendChild(dept);
            row.appendChild(daily); row.appendChild(model);

            if (r.anomaly) {
                const flagBtn = _buildFlagBtn(r.anomaly, r.anomalyNote, found, total, scoreNum);
                row.appendChild(flagBtn);
            }
            termBody.appendChild(row);
        });

        terminal.appendChild(termBody);
        wrap.appendChild(terminal);

        // Results div
        const auditResultDiv = document.createElement('div');
        auditResultDiv.id = 'audit-result';
        auditResultDiv.style.marginTop = 'var(--s5)';
        wrap.appendChild(auditResultDiv);

        container.appendChild(wrap);
    }

    function _buildFlagBtn(anomalyId, note, found, total, scoreNum) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary btn-sm';
        btn.style.cssText = 'margin-left:8px;flex-shrink:0;font-size:0.65rem;padding:2px 8px;';
        btn.textContent = '⚑ Flag';
        btn.dataset.anomaly = anomalyId;
        btn.onclick = function () {
            if (found.indexOf(anomalyId) > -1) {
                GAME.showToast('Already flagged.', 'amber');
                return;
            }
            found.push(anomalyId);
            btn.textContent = '✓ Flagged';
            btn.disabled = true;
            btn.style.borderColor = 'var(--green)';
            btn.style.color = 'var(--green)';

            GAME.showToast('Anomaly flagged: ' + note, 'amber');
            GAME.awardTC(20, 'anomaly found');
            scoreNum.textContent = found.length + '/' + total + ' anomalies found';

            if (found.length === total) {
                GAME.awardBadge('budgetGuardian');
                GAME.completeOptionalActivity('govAudit');
                const result = document.getElementById('audit-result');
                if (result) {
                    result.className = 'card card-cyan';
                    const p = document.createElement('p');
                    p.style.cssText = 'color:var(--green);font-weight:600;max-width:none;';
                    p.textContent = 'All 5 anomalies found! Budget Guardian badge earned. You identified: high-volume users, a date spike, a department anomaly, and a model tier governance issue. This is exactly what a governance dashboard should surface.';
                    result.appendChild(p);
                }
            }
        };
        return btn;
    }

    // ---- 5. VENDOR MATCHING CHALLENGE ----

    function buildVendorMatch(container) {
        container.innerHTML = '';

        const statements = CONTENT.sections.find(function (s) { return s.id === 'vendors'; }).content.matchingStatements;
        const vendors = ['microsoft', 'openai', 'anthropic', 'google'];
        const vendorLabels = { microsoft: 'Microsoft', openai: 'OpenAI', anthropic: 'Anthropic', google: 'Google' };

        let correctCount = 0;
        let firstAttempt = true;

        const wrap = document.createElement('div');
        wrap.style.marginTop = 'var(--s8)';

        const instr = document.createElement('div');
        instr.className = 'tip-box';
        instr.style.marginBottom = 'var(--s5)';
        const instrP = document.createElement('p');
        instrP.innerHTML = '<strong>Vendor Matching:</strong> Drag each statement to the correct vendor. Or click a statement, then click the target vendor. Immediate feedback on each match.';
        instr.appendChild(instrP);
        wrap.appendChild(instr);

        const scoreDisplay = document.createElement('div');
        scoreDisplay.style.cssText = 'font-family:var(--font-mono);font-size:0.8rem;color:var(--amber);margin-bottom:var(--s4);';
        scoreDisplay.id = 'vendor-score';
        scoreDisplay.textContent = '0/' + statements.length + ' matched';
        wrap.appendChild(scoreDisplay);

        const layout = document.createElement('div');
        layout.className = 'match-container';

        // Statements column
        const stmtCol = document.createElement('div');
        stmtCol.className = 'match-statements';

        const stmtLabel = document.createElement('div');
        stmtLabel.className = 'label label-amber';
        stmtLabel.style.marginBottom = '8px';
        stmtLabel.textContent = 'STATEMENTS: drag to vendor';
        stmtCol.appendChild(stmtLabel);

        let selectedStmt = null;

        statements.forEach(function (s) {
            const el = document.createElement('div');
            el.className = 'draggable-statement';
            el.dataset.id = s.id;
            el.dataset.vendor = s.vendor;
            el.setAttribute('draggable', 'true');
            el.textContent = s.text; // textContent — safe

            el.addEventListener('click', function () {
                if (el.classList.contains('matched')) return;
                if (selectedStmt) selectedStmt.classList.remove('dragging');
                selectedStmt = el;
                el.classList.add('dragging');
            });

            el.addEventListener('dragstart', function (e) {
                e.dataTransfer.setData('text/plain', s.id + '|' + s.vendor);
                selectedStmt = el;
                el.classList.add('dragging');
            });

            el.addEventListener('dragend', function () {
                el.classList.remove('dragging');
            });

            stmtCol.appendChild(el);
        });
        layout.appendChild(stmtCol);

        // Targets column
        const targetCol = document.createElement('div');
        targetCol.className = 'match-targets';

        const targetLabel = document.createElement('div');
        targetLabel.className = 'label label-cyan';
        targetLabel.style.marginBottom = '8px';
        targetLabel.textContent = 'DROP TARGETS';
        targetCol.appendChild(targetLabel);

        vendors.forEach(function (v) {
            const target = document.createElement('div');
            target.className = 'drop-target';
            target.dataset.vendor = v;

            const targetLbl = document.createElement('div');
            targetLbl.className = 'drop-target-label';
            targetLbl.textContent = vendorLabels[v];

            const targetHint = document.createElement('div');
            targetHint.className = 'drop-target-hint';
            targetHint.textContent = 'Drop statements here';

            target.appendChild(targetLbl);
            target.appendChild(targetHint);

            // Click to assign selected statement
            target.addEventListener('click', function () {
                if (selectedStmt && !selectedStmt.classList.contains('matched')) {
                    handleDrop(selectedStmt.dataset.id, selectedStmt.dataset.vendor, v, selectedStmt, target, statements, correctCount, scoreDisplay, firstAttempt, function (c) { correctCount = c; });
                    selectedStmt = null;
                }
            });

            // Drag and drop
            target.addEventListener('dragover', function (e) {
                e.preventDefault();
                target.classList.add('drag-over');
            });
            target.addEventListener('dragleave', function () {
                target.classList.remove('drag-over');
            });
            target.addEventListener('drop', function (e) {
                e.preventDefault();
                target.classList.remove('drag-over');
                const data = e.dataTransfer.getData('text/plain').split('|');
                const stmtId = data[0];
                const stmtVendor = data[1];
                const stmtEl = stmtCol.querySelector('[data-id="' + stmtId + '"]');
                if (stmtEl) {
                    handleDrop(stmtId, stmtVendor, v, stmtEl, target, statements, correctCount, scoreDisplay, firstAttempt, function (c) { correctCount = c; });
                }
            });

            // Easter egg: Anthropic hover for 5 seconds
            if (v === 'anthropic') {
                let hoverStart = null;
                let hoverTimer = null;
                target.addEventListener('mouseenter', function () {
                    hoverStart = Date.now();
                    hoverTimer = setTimeout(function () {
                        GAME.discoverEasterEgg('anthropicHover');
                        const tip = document.createElement('div');
                        tip.className = 'tip-box';
                        tip.style.cssText = 'margin-top:6px;font-size:0.75rem;animation:fadeIn 0.3s ease;';
                        const tipP = document.createElement('p');
                        tipP.textContent = 'Fun fact: Claude helped build this module. +25 TC for noticing.';
                        tip.appendChild(tipP);
                        target.appendChild(tip);
                        setTimeout(function () { if (tip.parentNode) tip.remove(); }, 5000);
                    }, 5000);
                });
                target.addEventListener('mouseleave', function () {
                    clearTimeout(hoverTimer);
                });
            }

            targetCol.appendChild(target);
        });
        layout.appendChild(targetCol);
        wrap.appendChild(layout);

        container.appendChild(wrap);

        function handleDrop(stmtId, stmtVendor, targetVendor, stmtEl, targetEl, statements, correctCount, scoreDisplay, firstAttempt, updateCount) {
            if (stmtEl.classList.contains('matched')) return;

            if (stmtVendor === targetVendor) {
                stmtEl.classList.add('matched');
                stmtEl.setAttribute('draggable', 'false');
                targetEl.appendChild(stmtEl);
                const hint = targetEl.querySelector('.drop-target-hint');
                if (hint) hint.style.display = 'none';
                targetEl.classList.add('has-match');
                targetEl.style.animation = 'dropSuccess 0.3s ease';

                correctCount++;
                updateCount(correctCount);
                scoreDisplay.textContent = correctCount + '/' + statements.length + ' matched';
                GAME.awardTC(25, 'correct vendor match');

                if (correctCount === statements.length) {
                    if (firstAttempt && !STATE.badges.vendorWhisperer) {
                        GAME.awardBadge('vendorWhisperer');
                    }
                    GAME.completeOptionalActivity('vendorMatch');
                    GAME.showToast('All vendors matched correctly!', 'amber');
                }
            } else {
                stmtEl.classList.add('wrong-match');
                firstAttempt = false;
                GAME.awardTC(-5, 'wrong vendor match');
                setTimeout(function () {
                    stmtEl.classList.remove('wrong-match');
                }, 600);
                GAME.showToast('Not quite. Try a different vendor.', 'red');
                GAME.trackClick('vendor-wrong');
            }
        }
    }

    // ---- Quiz renderer ----

    function renderQuiz(questionId, container, onComplete) {
        const q = CONTENT.sectionQuizzes[questionId];
        if (!q || !container) return;

        if (STATE.answers && STATE.answers[questionId]) {
            renderAnsweredQuiz(q, STATE.answers[questionId], container);
            return;
        }

        GAME.markQuestionOpen();

        container.innerHTML = '';

        const wrap = document.createElement('div');
        wrap.className = 'quiz-wrap';
        wrap.style.marginTop = 'var(--s8)';

        const qHdr = document.createElement('div');
        qHdr.className = 'quiz-header';
        const qHdrLabel = document.createElement('span');
        qHdrLabel.className = 'quiz-header-label';
        qHdrLabel.textContent = 'Knowledge Check';
        const qHdrTC = document.createElement('span');
        qHdrTC.className = 'quiz-tc-reward';
        qHdrTC.innerHTML = 'Earn up to <span>+' + q.tcReward + ' TC</span>';
        qHdr.appendChild(qHdrLabel);
        qHdr.appendChild(qHdrTC);
        wrap.appendChild(qHdr);

        const qBody = document.createElement('div');
        qBody.className = 'quiz-body';

        const qText = document.createElement('div');
        qText.className = 'quiz-question';
        qText.textContent = q.text;
        qBody.appendChild(qText);

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'quiz-options';
        optionsDiv.setAttribute('role', 'radiogroup');
        optionsDiv.setAttribute('aria-label', q.text);

        // Live region so screen readers announce feedback without page reload
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'quiz-live-' + questionId;
        qBody.appendChild(liveRegion);

        const keys = ['A', 'B', 'C', 'D'];
        let answered = false;
        let firstAttempt = true;

        q.options.forEach(function (opt, i) {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.dataset.optId = opt.id;
            btn.setAttribute('role', 'radio');
            btn.setAttribute('aria-checked', 'false');
            btn.setAttribute('aria-label', (keys[i] || opt.id.toUpperCase()) + ': ' + opt.text);

            const keyEl = document.createElement('span');
            keyEl.className = 'quiz-option-key';
            keyEl.setAttribute('aria-hidden', 'true');
            keyEl.textContent = keys[i] || opt.id.toUpperCase();

            const textEl = document.createElement('span');
            textEl.textContent = opt.text; // textContent — safe

            btn.appendChild(keyEl);
            btn.appendChild(textEl);

            btn.onclick = function () {
                if (answered) return;
                GAME.trackClick('quiz-option-' + opt.id);

                btn.setAttribute('aria-checked', 'true');

                if (opt.correct) {
                    answered = true;
                    btn.classList.add('correct');
                    optionsDiv.querySelectorAll('.quiz-option').forEach(function (b) {
                        if (b !== btn) b.classList.add('disabled-option');
                        b.disabled = true;
                    });

                    GAME.recordCorrectAnswer(firstAttempt);

                    const feedback = document.createElement('div');
                    feedback.className = 'quiz-feedback correct';
                    const icon = document.createElement('span');
                    icon.className = 'quiz-feedback-icon';
                    icon.setAttribute('aria-hidden', 'true');
                    icon.textContent = '✓';
                    const msg = document.createElement('span');
                    msg.textContent = q.feedback.correct;
                    feedback.appendChild(icon);
                    feedback.appendChild(msg);
                    qBody.appendChild(feedback);

                    // Announce to screen readers
                    var live = document.getElementById('quiz-live-' + questionId);
                    if (live) live.textContent = 'Correct. ' + q.feedback.correct;

                    if (!STATE.answers) STATE.answers = {};
                    STATE.answers[questionId] = { correct: true, firstAttempt };

                    if (onComplete) onComplete(true);
                    saveStateToScorm();

                } else {
                    btn.classList.add('incorrect');
                    firstAttempt = false;
                    GAME.recordWrongAnswer();

                    // Announce incorrect to screen readers
                    var live = document.getElementById('quiz-live-' + questionId);
                    if (live) live.textContent = 'Incorrect. Try another option.';

                    setTimeout(function () {
                        btn.classList.remove('incorrect');
                        btn.setAttribute('aria-checked', 'false');
                        btn.disabled = true;
                        btn.classList.add('disabled-option');
                    }, 800);
                }
            };

            optionsDiv.appendChild(btn);
        });

        qBody.appendChild(optionsDiv);
        wrap.appendChild(qBody);
        container.appendChild(wrap);
    }

    function renderAnsweredQuiz(q, savedAnswer, container) {
        container.innerHTML = '';
        const wrap = document.createElement('div');
        wrap.className = 'quiz-wrap';
        wrap.style.cssText = 'margin-top:var(--s8);opacity:0.8;';

        const note = document.createElement('div');
        note.className = 'quiz-header';
        const noteLbl = document.createElement('span');
        noteLbl.className = 'quiz-header-label';
        noteLbl.textContent = 'Knowledge Check: Already completed';
        const noteIcon = document.createElement('span');
        noteIcon.textContent = savedAnswer.correct ? '✓ Correct' : '✗ Missed';
        noteIcon.style.color = savedAnswer.correct ? 'var(--green)' : 'var(--red)';
        noteIcon.style.fontFamily = 'var(--font-mono)';
        noteIcon.style.fontSize = '0.75rem';
        note.appendChild(noteLbl);
        note.appendChild(noteIcon);
        wrap.appendChild(note);

        const qText = document.createElement('div');
        qText.className = 'quiz-body';
        const qt = document.createElement('div');
        qt.className = 'quiz-question';
        qt.style.marginBottom = '0';
        qt.textContent = q.text;
        qText.appendChild(qt);
        wrap.appendChild(qText);

        container.appendChild(wrap);
    }

    // ---- Assessment quiz renderer ----

    function renderAssessmentQuestion(q, container, onAnswer) {
        container.innerHTML = '';

        GAME.markQuestionOpen();

        const keys = ['A', 'B', 'C', 'D'];
        let answered = false;

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'quiz-options';

        q.options.forEach(function (opt, i) {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';

            const keyEl = document.createElement('span');
            keyEl.className = 'quiz-option-key';
            keyEl.textContent = keys[i] || opt.id.toUpperCase();

            const textEl = document.createElement('span');
            textEl.textContent = opt.text;

            btn.appendChild(keyEl);
            btn.appendChild(textEl);

            btn.onclick = function () {
                if (answered) return;
                answered = true;
                GAME.trackClick('assessment-opt-' + opt.id);

                optionsDiv.querySelectorAll('.quiz-option').forEach(function (b) {
                    b.disabled = true;
                });

                if (opt.correct) {
                    btn.classList.add('correct');
                    GAME.recordCorrectAnswer(true);
                } else {
                    btn.classList.add('incorrect');
                    GAME.recordWrongAnswer();
                    // Show which was correct
                    optionsDiv.querySelectorAll('.quiz-option').forEach(function (b, bi) {
                        if (q.options[bi] && q.options[bi].correct) b.classList.add('correct');
                    });
                }

                const feedback = document.createElement('div');
                feedback.className = 'quiz-feedback ' + (opt.correct ? 'correct' : 'incorrect');
                const icon = document.createElement('span');
                icon.className = 'quiz-feedback-icon';
                icon.textContent = opt.correct ? '✓' : '✗';
                const msg = document.createElement('span');
                msg.textContent = opt.correct ? q.feedback.correct : q.feedback.incorrect;
                feedback.appendChild(icon);
                feedback.appendChild(msg);
                container.appendChild(feedback);

                setTimeout(function () {
                    if (onAnswer) onAnswer(opt.correct ? 1 : 0);
                }, 1200);
            };

            optionsDiv.appendChild(btn);
        });

        container.appendChild(optionsDiv);
    }

    function saveStateToScorm() {
        if (typeof STATE !== 'undefined') {
            STATE.totalTime = Math.floor((Date.now() - STATE.startTime) / 1000);
            SCORM.saveSuspendData(STATE);
        }
    }

    return {
        buildTokenCalculator,
        buildPromptSandbox,
        buildBudgetSimulator,
        buildGovernanceAudit,
        buildVendorMatch,
        renderQuiz,
        renderAssessmentQuestion,
        estimateTokens,
        saveStateToScorm
    };
})();
