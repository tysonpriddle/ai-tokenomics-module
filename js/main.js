/* ============================================================
   MAIN.JS — App init, routing, state management, rendering
   Orchestrates all other modules. Runs after all other scripts.
   ============================================================ */

// ---- Global STATE (referenced by game.js and interactions.js) ----

var STATE = {
    currentSection: 0,
    tc: 1000,
    tier: 2, // Token Analyst (starting at 1000 TC)
    badges: {},
    streak: 0,
    streakMultiplier: 1,
    assessmentAttempts: 0,
    assessmentScore: 0,
    assessmentPassed: false,
    assessmentAnswers: [],
    completedSections: [],
    answers: {},
    easterEggs: [],
    optionalActivities: [],
    startTime: Date.now(),
    totalTime: 0,
    secretSectionUnlocked: false
};

// ---- App init ----

(function () {
    var scormOk = SCORM.initialize();

    // Load saved state
    var saved = SCORM.loadSuspendData();
    if (saved) {
        // Merge saved state into STATE, preserving startTime logic
        var savedStart = saved.startTime || Date.now();
        Object.assign(STATE, saved);
        STATE.startTime = Date.now() - (saved.totalTime || 0) * 1000;
    }

    // xAPI launch
    xAPI.moduleLaunched();

    // Set initial completion if first launch
    if (!saved) {
        SCORM.setCompletion('incomplete');
    }

    // Build UI shell
    buildShell();

    // Apply saved theme before first render
    initTheme();

    // Render current section
    navigateTo(STATE.currentSection, true);

    // Wire logo click for easter egg
    document.getElementById('logo-click').addEventListener('click', function () {
        GAME.onLogoClick();
    });

    // Debug panel
    if (window.location.search.indexOf('debug=true') > -1) {
        document.getElementById('debug-panel').classList.remove('hidden');
    }

    // Update header on load
    GAME.updateHeader();

    // Session timer — save every 60s
    setInterval(function () {
        STATE.totalTime = Math.floor((Date.now() - STATE.startTime) / 1000);
        SCORM.setSessionTime(STATE.totalTime);
        INTERACTIONS.saveStateToScorm();
    }, 60000);
})();

// ---- Theme ----

function initTheme() {
    var saved = localStorage.getItem('tokenomics-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeButton();
}

function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    var next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('tokenomics-theme', next);
    updateThemeButton();
}

function updateThemeButton() {
    var btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    var isLight = document.documentElement.getAttribute('data-theme') === 'light';
    btn.textContent = isLight ? '☾' : '☀';
    btn.title = isLight ? 'Switch to dark theme' : 'Switch to light theme';
}

// ---- Shell builder ----

function buildShell() {
    var header = document.getElementById('app-header');
    header.innerHTML = '';

    // Logo
    var logo = document.createElement('div');
    logo.className = 'header-logo';
    logo.id = 'logo-click';
    logo.setAttribute('title', 'AI Tokenomics');
    var logoIcon = document.createElement('span');
    logoIcon.className = 'header-logo-icon';
    logoIcon.textContent = '◈';
    var logoText = document.createElement('span');
    logoText.className = 'header-logo-text';
    logoText.innerHTML = 'TOKEN<span class="accent">OMICS</span>';
    logo.appendChild(logoIcon);
    logo.appendChild(logoText);
    header.appendChild(logo);

    // Progress wrap
    var progressWrap = document.createElement('div');
    progressWrap.className = 'header-progress-wrap';

    var sectionLabel = document.createElement('div');
    sectionLabel.className = 'header-section-label';
    sectionLabel.id = 'section-label';
    sectionLabel.textContent = 'Introduction';

    var progressTrack = document.createElement('div');
    progressTrack.className = 'progress-track';
    var progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    progressFill.id = 'progress-fill';
    progressFill.style.width = '0%';
    progressTrack.appendChild(progressFill);

    progressWrap.appendChild(sectionLabel);
    progressWrap.appendChild(progressTrack);
    header.appendChild(progressWrap);

    // Right: streak, tier, TC
    var right = document.createElement('div');
    right.className = 'header-right';

    // Streak
    var streakDisplay = document.createElement('div');
    streakDisplay.className = 'streak-display';
    streakDisplay.id = 'streak-display';
    var streakFlame = document.createElement('span');
    streakFlame.className = 'streak-flame';
    streakFlame.id = 'streak-flame';
    var streakCount = document.createElement('span');
    streakCount.className = 'streak-count';
    streakCount.id = 'streak-count';
    streakCount.textContent = '0';
    streakDisplay.appendChild(streakFlame);
    streakDisplay.appendChild(streakCount);
    right.appendChild(streakDisplay);

    // Tier badge
    var tierBadge = document.createElement('div');
    tierBadge.className = 'tier-badge';
    tierBadge.id = 'tier-badge';
    tierBadge.textContent = '◆ Token Analyst';
    tierBadge.setAttribute('aria-label', 'Current tier: Token Analyst');
    right.appendChild(tierBadge);

    // Theme toggle
    var themeBtn = document.createElement('button');
    themeBtn.className = 'theme-toggle-btn';
    themeBtn.id = 'theme-toggle-btn';
    themeBtn.title = 'Switch theme';
    themeBtn.onclick = toggleTheme;
    right.appendChild(themeBtn);

    // TC display — aria-live so screen readers announce balance changes
    var tcDisplay = document.createElement('div');
    tcDisplay.className = 'tc-display';
    tcDisplay.setAttribute('aria-label', 'Token Credits balance');
    var tcLabel = document.createElement('span');
    tcLabel.className = 'tc-label';
    tcLabel.setAttribute('aria-hidden', 'true');
    tcLabel.textContent = 'TC';
    var tcValue = document.createElement('span');
    tcValue.className = 'tc-value';
    tcValue.id = 'tc-value';
    tcValue.setAttribute('aria-live', 'polite');
    tcValue.setAttribute('aria-atomic', 'true');
    tcValue.textContent = STATE.tc.toLocaleString();
    tcDisplay.appendChild(tcLabel);
    tcDisplay.appendChild(tcValue);
    right.appendChild(tcDisplay);

    header.appendChild(right);
}

// ---- Navigation ----

function navigateTo(sectionIdx, skipAnimation) {
    var sections = CONTENT.sections;
    if (sectionIdx < 0 || sectionIdx >= sections.length) return;

    STATE.currentSection = sectionIdx;
    window.scrollTo({ top: 0, behavior: 'instant' });
    var section = sections[sectionIdx];

    // Update header
    var labelEl = document.getElementById('section-label');
    if (labelEl) labelEl.textContent = section.isIntro ? 'Introduction' : 'Section ' + section.number + ': ' + section.title;

    // Progress
    updateProgressBar();

    // Render
    var main = document.getElementById('app-main');
    if (!skipAnimation) {
        main.style.animation = 'fadeOut 0.2s ease forwards';
        setTimeout(function () {
            main.style.animation = '';
            renderSection(section, main);
            moveFocusToSection(main);
        }, 200);
    } else {
        renderSection(section, main);
        if (!skipAnimation) moveFocusToSection(main);
    }

    INTERACTIONS.saveStateToScorm();
}

function moveFocusToSection(container) {
    // Give the DOM time to paint, then move focus to the first heading
    setTimeout(function () {
        var target = container.querySelector('h1, h2, [data-focus-target]');
        if (target) {
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
        }
    }, 350);
}

function updateProgressBar() {
    var total = CONTENT.sections.length - 1; // exclude intro
    var done = STATE.completedSections.length;
    var pct = Math.round((done / total) * 100);
    var fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = pct + '%';
}

// ---- Section renderers ----

function renderSection(section, container) {
    container.innerHTML = '';

    var wrap = document.createElement('div');
    wrap.className = 'section-wrapper ' + (section.theme || '');
    wrap.style.animation = 'fadeSlideUp 0.45s cubic-bezier(0.16,1,0.3,1) both';

    if (section.isIntro) {
        renderIntro(wrap);
    } else if (section.isAssessment) {
        renderAssessment(wrap);
    } else {
        switch (section.id) {
            case 'hook':        renderHookSection(section, wrap); break;
            case 'tokens':      renderTokensSection(section, wrap); break;
            case 'consumption': renderConsumptionSection(section, wrap); break;
            case 'licences':    renderLicencesSection(section, wrap); break;
            case 'governance':  renderGovernanceSection(section, wrap); break;
            case 'optimise':    renderOptimiseSection(section, wrap); break;
            case 'vendors':     renderVendorsSection(section, wrap); break;
            default:            renderGenericSection(section, wrap);
        }
    }

    container.appendChild(wrap);

    // Gate Continue button — unlock only after user has scrolled through content
    if (!section.isIntro && !section.isAssessment) {
        initScrollUnlock(wrap);
    }
}

// ---- INTRO ----

function renderIntro(wrap) {
    var div = document.createElement('div');
    div.className = 'intro-wrap';

    // Two-column layout
    var cols = document.createElement('div');
    cols.className = 'intro-cols';

    // Left: text content + CTA
    var left = document.createElement('div');
    left.className = 'intro-col-left';
    appendIntroContent(left);

    var startBtn = document.createElement('button');
    startBtn.className = 'btn btn-primary btn-lg intro-start-btn';
    startBtn.innerHTML = 'Begin Module <span style="font-size:1.1em;">→</span>';
    startBtn.onclick = function () { navigateTo(1); };

    var continueBtn = null;
    if (STATE.completedSections.length > 0) {
        continueBtn = document.createElement('button');
        continueBtn.className = 'btn btn-secondary btn-lg';
        continueBtn.textContent = 'Resume (Section ' + (STATE.currentSection || 1) + ')';
        continueBtn.onclick = function () { navigateTo(STATE.currentSection || 1); };
    }

    var ctaRow = document.createElement('div');
    ctaRow.className = 'intro-cta-row';
    ctaRow.appendChild(startBtn);
    if (continueBtn) ctaRow.appendChild(continueBtn);
    left.appendChild(ctaRow);

    // 3 concise outcomes below CTA
    var outcomes = [
        { icon: '◆', text: 'Know exactly what you\'re paying every time you use AI' },
        { icon: '◆', text: 'Spot cost blowouts and put the right controls in place' },
        { icon: '◆', text: 'Walk into any vendor or budget conversation knowing the numbers' }
    ];
    var outcomeList = document.createElement('div');
    outcomeList.className = 'intro-outcomes';
    outcomes.forEach(function (o) {
        var item = document.createElement('div');
        item.className = 'intro-outcome-item';
        var icon = document.createElement('span');
        icon.className = 'intro-outcome-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = o.icon;
        var text = document.createElement('span');
        text.textContent = o.text;
        item.appendChild(icon);
        item.appendChild(text);
        outcomeList.appendChild(item);
    });
    left.appendChild(outcomeList);

    // Right: decorative stats dashboard
    var right = document.createElement('div');
    right.className = 'intro-col-right';
    right.innerHTML = [
        '<div class="intro-dash">',
        '  <div class="intro-dash-header">',
        '    <span class="intro-dash-label">MODULE OVERVIEW</span>',
        '    <span class="intro-dash-live"><span class="live-dot"></span> LIVE</span>',
        '  </div>',
        '  <div class="intro-dash-stat-grid">',
        '    <div class="intro-stat-block amber">',
        '      <div class="intro-stat-val">1,000</div>',
        '      <div class="intro-stat-lbl">Starting TC</div>',
        '    </div>',
        '    <div class="intro-stat-block cyan">',
        '      <div class="intro-stat-val">7</div>',
        '      <div class="intro-stat-lbl">Sections</div>',
        '    </div>',
        '    <div class="intro-stat-block amber">',
        '      <div class="intro-stat-val">12</div>',
        '      <div class="intro-stat-lbl">Badges</div>',
        '    </div>',
        '    <div class="intro-stat-block cyan">',
        '      <div class="intro-stat-val">80%</div>',
        '      <div class="intro-stat-lbl">Pass Mark</div>',
        '    </div>',
        '  </div>',
        '  <div class="intro-dash-divider"></div>',
        '  <div class="intro-tier-row">',
        '    <div class="intro-tier-label">Token Tiers</div>',
        '    <div class="intro-tier-track">',
        '      <div class="intro-tier-pip active" title="Prompt Rookie"></div>',
        '      <div class="intro-tier-pip active" title="Token Analyst"></div>',
        '      <div class="intro-tier-pip" title="Prompt Engineer"></div>',
        '      <div class="intro-tier-pip" title="Cost Architect"></div>',
        '      <div class="intro-tier-pip" title="Tokenomics Architect"></div>',
        '    </div>',
        '    <div class="intro-tier-current">TOKEN ANALYST</div>',
        '  </div>',
        '  <div class="intro-dash-divider"></div>',
        '  <div class="intro-case-preview">',
        '    <div class="intro-case-label">Real Case Studies</div>',
        '    <div class="intro-case-list">',
        '      <div class="intro-case-item"><span class="case-tag">UBER</span><span>$3.4B burned in 4 months</span></div>',
        '      <div class="intro-case-item"><span class="case-tag">MSFT</span><span>80% productivity, cancelled</span></div>',
        '      <div class="intro-case-item"><span class="case-tag">NVDA</span><span>AI compute &gt; salaries</span></div>',
        '      <div class="intro-case-item"><span class="case-tag">DEV</span><span>$12K/mo chatbot shock</span></div>',
        '    </div>',
        '  </div>',
        '</div>'
    ].join('');

    cols.appendChild(left);
    cols.appendChild(right);
    div.appendChild(cols);
    wrap.appendChild(div);
}

function appendIntroContent(div) {
    var eyebrow = document.createElement('div');
    eyebrow.className = 'intro-eyebrow';
    eyebrow.textContent = 'AI Capability · Enterprise Learning';

    var title = document.createElement('h1');
    title.className = 'intro-title';
    title.innerHTML = 'AI <span class="amber">Tokenomics</span><br>Cost, Consumption and Control';

    var subtitle = document.createElement('p');
    subtitle.className = 'intro-subtitle';
    subtitle.textContent = 'AI costs are landing on real budgets right now. This module shows you where they come from, how to control them, and how to cut them, without slowing down your work.';

    var metaRow = document.createElement('div');
    metaRow.className = 'intro-meta-row';

    [
        { icon: '◷', label: '25–30 minutes' },
        { icon: '◆', label: 'Start: 1,000 TC' },
        { icon: '⚡', label: '12 badges to earn' },
        { icon: '⬡', label: '5 interactive activities' }
    ].forEach(function (item) {
        var meta = document.createElement('div');
        meta.className = 'intro-meta-item';
        var icon = document.createElement('span');
        icon.className = 'intro-meta-icon';
        icon.textContent = item.icon;
        var lbl = document.createElement('span');
        lbl.textContent = item.label;
        meta.appendChild(icon);
        meta.appendChild(lbl);
        metaRow.appendChild(meta);
    });

    [eyebrow, title, subtitle, metaRow].forEach(function (el) {
        div.appendChild(el);
    });
}

// ---- HOOK (Section 1) ----

function renderHookSection(section, wrap) {
    var c = section.content;

    // Hero
    var hero = document.createElement('div');
    hero.className = 'hook-hero';

    var eyebrow = document.createElement('div');
    eyebrow.className = 'hook-eyebrow';
    eyebrow.textContent = c.eyebrow;

    var headline = document.createElement('h1');
    headline.className = 'hook-headline';
    headline.innerHTML = 'Someone just spent<br><span class="highlight">$47,000</span><br>on a prompt.';

    var standfirst = document.createElement('p');
    standfirst.className = 'hook-standfirst';
    standfirst.textContent = c.standfirst;

    // Wrap text content so flex hero stacks it as a column block at the bottom
    var heroText = document.createElement('div');
    heroText.className = 'hook-hero-text';
    heroText.appendChild(eyebrow);
    heroText.appendChild(headline);
    heroText.appendChild(standfirst);
    hero.appendChild(heroText);

    wrap.appendChild(hero);

    // Scroll indicator — between hero and content so it's never covered
    var scrollHint = document.createElement('div');
    scrollHint.className = 'scroll-indicator';
    var scrollLabel = document.createElement('span');
    scrollLabel.className = 'scroll-indicator-label';
    scrollLabel.textContent = 'scroll to explore';
    var scrollArrow = document.createElement('span');
    scrollArrow.className = 'scroll-indicator-arrow';
    scrollArrow.textContent = '↓';
    scrollHint.appendChild(scrollLabel);
    scrollHint.appendChild(scrollArrow);
    wrap.appendChild(scrollHint);

    // Content area
    var content = document.createElement('div');
    content.className = 'hook-content';

    // WIIFM — inside content, not the flex hero
    if (section.whyItMatters) content.appendChild(buildWIIFMCallout(section.whyItMatters));

    // Cost explosion SVG
    content.appendChild(buildCostExplosionSVG());

    // Stat row
    var statRow = document.createElement('div');
    statRow.className = 'hook-stat-row';
    var stats = [
        { value: '$3.4B', label: 'Uber\'s 2026 AI budget, exhausted in 4 months' },
        { value: '$12K/mo', label: 'Monthly bill for a "simple" chatbot prototype' },
        { value: '10×', label: 'Max user consumption vs team average, spotted too late' },
        { value: '85%', label: 'Orgs that missed AI cost forecasts by >10% (Mavvrik 2025)' }
    ];
    stats.forEach(function (s) {
        var stat = document.createElement('div');
        stat.className = 'hook-stat anim-fade-up';
        var val = document.createElement('div');
        val.className = 'hook-stat-value';
        val.textContent = s.value;
        var lbl = document.createElement('div');
        lbl.className = 'hook-stat-label';
        lbl.textContent = s.label;
        stat.appendChild(val);
        stat.appendChild(lbl);
        statRow.appendChild(stat);
    });
    content.appendChild(statRow);

    // Body text — show the 2 most impactful paragraphs; case studies carry the rest
    [c.paragraphs[1], c.paragraphs[3]].forEach(function (para) {
        var p = document.createElement('p');
        p.className = 'hook-body-para';
        p.textContent = para;
        content.appendChild(p);
    });

    // Case study: Developer $12K
    content.appendChild(buildCaseStudyCard(CONTENT.caseStudies.developer));

    // Case study: Uber (summary)
    content.appendChild(buildCaseStudyCard(CONTENT.caseStudies.uber));

    // Key points
    content.appendChild(buildKeyPoints(c.keyPoints));

    // Section quiz
    var quizContainer = document.createElement('div');
    INTERACTIONS.renderQuiz('q_hook_1', quizContainer, function (correct) {
        if (correct) checkSectionComplete(section);
    });
    content.appendChild(quizContainer);

    wrap.appendChild(content);
    wrap.appendChild(buildSectionFooter(section));
}

// ---- TOKENS (Section 2) ----

function renderTokensSection(section, wrap) {
    var c = section.content;

    var hero = buildSectionHero(c.eyebrow, c.headline, c.standfirst, 'tokens-hero', section.whyItMatters);
    wrap.appendChild(hero);

    var content = document.createElement('div');
    content.style.cssText = 'padding:var(--s8);display:flex;flex-direction:column;gap:var(--s8);';

    // Lead with 2 most impactful paragraphs — table + SVG + calculator carry the rest
    [c.paragraphs[0], c.paragraphs[2]].forEach(function (para, i) {
        var p = document.createElement('p');
        p.textContent = para;
        p.className = 'anim-fade-up stagger-' + (i + 1);
        content.appendChild(p);
    });

    // Token Calculator first — the most engaging element, put it up front
    var calcContainer = document.createElement('div');
    INTERACTIONS.buildTokenCalculator(calcContainer);
    content.appendChild(calcContainer);

    // Tokenization visual
    content.appendChild(buildTokenizationSVG());

    // Token example table — reference after interaction
    var exCard = document.createElement('div');
    exCard.className = 'card card-cyan';

    var exTitle = document.createElement('div');
    exTitle.className = 'label label-cyan';
    exTitle.style.marginBottom = '12px';
    exTitle.textContent = 'TOKEN EXAMPLES: APPROXIMATE COUNTS';
    exCard.appendChild(exTitle);

    var table = document.createElement('table');
    table.className = 'data-table';
    var thead = document.createElement('thead');
    var theadRow = document.createElement('tr');
    ['Text', 'Est. Tokens', 'Characters'].forEach(function (h) {
        var th = document.createElement('th');
        th.textContent = h;
        theadRow.appendChild(th);
    });
    thead.appendChild(theadRow);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    c.tokenExamples.forEach(function (ex) {
        var tr = document.createElement('tr');
        var tdText = document.createElement('td');
        tdText.style.cssText = 'font-family:var(--font-mono);color:var(--cyan-light);';
        tdText.textContent = ex.text;
        var tdTok = document.createElement('td');
        tdTok.style.color = 'var(--amber)';
        tdTok.style.fontFamily = 'var(--font-mono)';
        tdTok.textContent = '~' + ex.tokens;
        var tdChar = document.createElement('td');
        tdChar.style.fontFamily = 'var(--font-mono)';
        tdChar.textContent = ex.text.length;
        tr.appendChild(tdText); tr.appendChild(tdTok); tr.appendChild(tdChar);
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    exCard.appendChild(table);
    content.appendChild(exCard);

    // Key points
    content.appendChild(buildKeyPoints(c.keyPoints));

    // Quiz
    var quizContainer = document.createElement('div');
    INTERACTIONS.renderQuiz('q_tokens_1', quizContainer, function (correct) {
        if (correct) checkSectionComplete(section);
    });
    content.appendChild(quizContainer);

    wrap.appendChild(content);
    wrap.appendChild(buildSectionFooter(section));
}

// ---- CONSUMPTION (Section 3) ----

function renderConsumptionSection(section, wrap) {
    var c = section.content;

    var hero = buildSectionHero(c.eyebrow, c.headline, c.standfirst, 'consumption-hero', section.whyItMatters);
    wrap.appendChild(hero);

    var content = document.createElement('div');
    content.style.cssText = 'padding:var(--s8);display:flex;flex-direction:column;gap:var(--s6);';

    // Flow diagram
    var flowCard = document.createElement('div');
    flowCard.className = 'card';
    var flowTitle = document.createElement('div');
    flowTitle.className = 'label label-amber';
    flowTitle.style.marginBottom = '16px';
    flowTitle.textContent = 'WHERE TOKENS ACCUMULATE';
    flowCard.appendChild(flowTitle);

    var flowDiagram = document.createElement('div');
    flowDiagram.className = 'flow-diagram';

    c.flowNodes.forEach(function (node, i) {
        var flowNode = document.createElement('div');
        flowNode.className = 'flow-node ' + node.colour;
        var nodeLbl = document.createElement('div');
        nodeLbl.className = 'flow-node-label';
        nodeLbl.textContent = node.label;
        var nodeVal = document.createElement('div');
        nodeVal.className = 'flow-node-value';
        nodeVal.textContent = node.value;
        flowNode.appendChild(nodeLbl);
        flowNode.appendChild(nodeVal);
        flowDiagram.appendChild(flowNode);

        if (i < c.flowNodes.length - 1) {
            var arrow = document.createElement('div');
            arrow.className = 'flow-arrow';
            arrow.textContent = '→';
            flowDiagram.appendChild(arrow);
        }
    });
    flowCard.appendChild(flowDiagram);
    content.appendChild(flowCard);

    // 2 paragraphs — six-variable grid + case study carry the detail
    [c.paragraphs[0], c.paragraphs[2]].forEach(function (para) {
        var p = document.createElement('p');
        p.textContent = para;
        content.appendChild(p);
    });

    // Cost variables grid
    var varCard = document.createElement('div');
    varCard.className = 'card card-amber';
    var varTitle = document.createElement('div');
    varTitle.className = 'label label-amber';
    varTitle.style.marginBottom = '12px';
    varTitle.textContent = 'THE SIX COST VARIABLES';
    varCard.appendChild(varTitle);
    var varGrid = document.createElement('div');
    varGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:var(--s3);';
    c.costVars.forEach(function (v) {
        var cell = document.createElement('div');
        cell.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px;background:var(--surface-3);border-radius:var(--r3);border:1px solid var(--border);';
        var icon = document.createElement('span');
        icon.style.cssText = 'font-family:var(--font-mono);font-size:0.85rem;color:' + (v.impact === 'Savings' ? 'var(--green)' : v.impact === 'High' ? 'var(--red)' : 'var(--amber)') + ';width:24px;text-align:center;';
        icon.textContent = v.icon;
        var label = document.createElement('div');
        var name = document.createElement('div');
        name.style.cssText = 'font-size:0.8rem;color:var(--text);font-weight:500;';
        name.textContent = v.name;
        var impact = document.createElement('div');
        impact.style.cssText = 'font-family:var(--font-mono);font-size:0.6rem;color:var(--text-3);';
        impact.textContent = v.impact + ' impact';
        label.appendChild(name); label.appendChild(impact);
        cell.appendChild(icon); cell.appendChild(label);
        varGrid.appendChild(cell);
    });
    varCard.appendChild(varGrid);
    content.appendChild(varCard);

    // Case study: Developer
    content.appendChild(buildCaseStudyCard(CONTENT.caseStudies.developer));

    // Key points
    content.appendChild(buildKeyPoints(c.keyPoints));

    // Quizzes
    var quizContainer1 = document.createElement('div');
    INTERACTIONS.renderQuiz('q_consumption_1', quizContainer1, null);
    content.appendChild(quizContainer1);

    var quizContainer2 = document.createElement('div');
    INTERACTIONS.renderQuiz('q_consumption_2', quizContainer2, function (correct) {
        if (correct) checkSectionComplete(section);
    });
    content.appendChild(quizContainer2);

    wrap.appendChild(content);
    wrap.appendChild(buildSectionFooter(section));
}

// ---- LICENCES (Section 4) ----

function renderLicencesSection(section, wrap) {
    var c = section.content;

    var hero = buildSectionHero(c.eyebrow, c.headline, c.standfirst, 'licences-hero', section.whyItMatters);
    wrap.appendChild(hero);

    var content = document.createElement('div');
    content.style.cssText = 'padding:var(--s8);display:flex;flex-direction:column;gap:var(--s8);';

    // Lead with the visual comparison — text below for those who want detail
    var compGrid = document.createElement('div');
    compGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:var(--s4);';
    c.comparison.forEach(function (model) {
        var card = document.createElement('div');
        card.className = model.model.includes('Licence') ? 'card card-cyan' : 'card card-amber';

        var badge = document.createElement('div');
        badge.className = 'licence-type-badge ' + (model.model.includes('Licence') ? 'fixed' : 'usage');
        badge.textContent = model.model;
        card.appendChild(badge);

        var proTitle = document.createElement('div');
        proTitle.className = 'label';
        proTitle.style.cssText = 'color:var(--green);margin-bottom:6px;';
        proTitle.textContent = 'PROS';
        card.appendChild(proTitle);

        model.pros.forEach(function (pro) {
            var row = document.createElement('div');
            row.style.cssText = 'display:flex;gap:6px;font-size:0.8rem;color:var(--text-2);margin-bottom:4px;';
            var icon = document.createElement('span');
            icon.style.color = 'var(--green)';
            icon.textContent = '✓';
            var text = document.createElement('span');
            text.textContent = pro;
            row.appendChild(icon); row.appendChild(text);
            card.appendChild(row);
        });

        var conTitle = document.createElement('div');
        conTitle.className = 'label';
        conTitle.style.cssText = 'color:var(--red);margin:10px 0 6px;';
        conTitle.textContent = 'CONS';
        card.appendChild(conTitle);

        model.cons.forEach(function (con) {
            var row = document.createElement('div');
            row.style.cssText = 'display:flex;gap:6px;font-size:0.8rem;color:var(--text-2);margin-bottom:4px;';
            var icon = document.createElement('span');
            icon.style.color = 'var(--red)';
            icon.textContent = '✗';
            var text = document.createElement('span');
            text.textContent = con;
            row.appendChild(icon); row.appendChild(text);
            card.appendChild(row);
        });

        var exTitle = document.createElement('div');
        exTitle.className = 'label';
        exTitle.style.cssText = 'color:var(--text-3);margin:10px 0 6px;';
        exTitle.textContent = 'EXAMPLES';
        card.appendChild(exTitle);
        var exList = document.createElement('div');
        exList.style.cssText = 'font-family:var(--font-mono);font-size:0.7rem;color:var(--text-3);';
        exList.textContent = model.examples.join(', ');
        card.appendChild(exList);

        compGrid.appendChild(card);
    });
    content.appendChild(compGrid);

    // 2 paragraphs after the visual — sets context for the simulator
    [c.paragraphs[1], c.paragraphs[3]].forEach(function (para) {
        if (!para) return;
        var p = document.createElement('p');
        p.textContent = para;
        content.appendChild(p);
    });

    // Case study: Microsoft
    content.appendChild(buildCaseStudyCard(CONTENT.caseStudies.microsoft));

    // Budget Simulator
    var simContainer = document.createElement('div');
    INTERACTIONS.buildBudgetSimulator(simContainer);
    content.appendChild(simContainer);

    // Key points
    content.appendChild(buildKeyPoints(c.keyPoints));

    // Quiz
    var quizContainer = document.createElement('div');
    INTERACTIONS.renderQuiz('q_licences_1', quizContainer, function (correct) {
        if (correct) checkSectionComplete(section);
    });
    content.appendChild(quizContainer);

    wrap.appendChild(content);
    wrap.appendChild(buildSectionFooter(section));
}

// ---- GOVERNANCE (Section 5) ----

function renderGovernanceSection(section, wrap) {
    var c = section.content;

    var hero = buildSectionHero(c.eyebrow, c.headline, c.standfirst, 'governance-hero', section.whyItMatters);
    wrap.appendChild(hero);

    var content = document.createElement('div');
    content.style.cssText = 'padding:var(--s8);display:flex;flex-direction:column;gap:var(--s8);';

    // Case studies
    content.appendChild(buildCaseStudyCard(CONTENT.caseStudies.uber));
    content.appendChild(buildCaseStudyCard(CONTENT.caseStudies.nvidia));

    // Usage anomaly SVG
    content.appendChild(buildUsageAnomalySVG());

    // One paragraph — case studies + controls table carry the content
    var govP = document.createElement('p');
    govP.textContent = c.paragraphs[1];
    content.appendChild(govP);

    // Governance controls table
    var govCard = document.createElement('div');
    govCard.className = 'card card-amber';
    var govTitle = document.createElement('div');
    govTitle.className = 'label label-amber';
    govTitle.style.marginBottom = '12px';
    govTitle.textContent = 'GOVERNANCE CONTROLS: PRIORITY ORDER';
    govCard.appendChild(govTitle);

    var govTable = document.createElement('table');
    govTable.className = 'data-table';
    var govThead = document.createElement('thead');
    var govTheadRow = document.createElement('tr');
    ['Control', 'Description', 'Priority'].forEach(function (h) {
        var th = document.createElement('th');
        th.textContent = h;
        govTheadRow.appendChild(th);
    });
    govThead.appendChild(govTheadRow);
    govTable.appendChild(govThead);

    var govTbody = document.createElement('tbody');
    c.governanceControls.forEach(function (ctrl) {
        var tr = document.createElement('tr');
        var tdName = document.createElement('td');
        tdName.style.fontWeight = '600';
        tdName.style.color = 'var(--text)';
        tdName.textContent = ctrl.name;
        var tdDesc = document.createElement('td');
        tdDesc.textContent = ctrl.description;
        var tdPriority = document.createElement('td');
        tdPriority.style.fontFamily = 'var(--font-mono)';
        tdPriority.style.fontSize = '0.7rem';
        tdPriority.style.color = ctrl.priority === 'High' ? 'var(--amber)' : 'var(--cyan)';
        tdPriority.textContent = ctrl.priority;
        tr.appendChild(tdName); tr.appendChild(tdDesc); tr.appendChild(tdPriority);
        govTbody.appendChild(tr);
    });
    govTable.appendChild(govTbody);
    govCard.appendChild(govTable);
    content.appendChild(govCard);

    // Governance Audit
    var auditContainer = document.createElement('div');
    INTERACTIONS.buildGovernanceAudit(auditContainer);
    content.appendChild(auditContainer);

    // Key points
    content.appendChild(buildKeyPoints(c.keyPoints));

    // Quizzes
    var q1 = document.createElement('div');
    INTERACTIONS.renderQuiz('q_governance_1', q1, null);
    content.appendChild(q1);

    var q2 = document.createElement('div');
    INTERACTIONS.renderQuiz('q_governance_2', q2, function (correct) {
        if (correct) checkSectionComplete(section);
    });
    content.appendChild(q2);

    wrap.appendChild(content);
    wrap.appendChild(buildSectionFooter(section));
}

// ---- OPTIMISE (Section 6) ----

function renderOptimiseSection(section, wrap) {
    var c = section.content;

    var hero = buildSectionHero(c.eyebrow, c.headline, c.standfirst, 'optimise-hero', section.whyItMatters);
    wrap.appendChild(hero);

    var content = document.createElement('div');
    content.style.cssText = 'padding:var(--s8);display:flex;flex-direction:column;gap:var(--s6);';

    // Tips accordion leads — one sentence of context above it is enough
    var introP = document.createElement('p');
    introP.textContent = c.paragraphs[0];
    content.appendChild(introP);

    var tipsTitle = document.createElement('div');
    tipsTitle.className = 'label label-amber';
    tipsTitle.style.cssText = 'margin:var(--s2) 0 var(--s3);';
    tipsTitle.textContent = 'NINE OPTIMIZATION LEVERS';
    content.appendChild(tipsTitle);

    c.tips.forEach(function (tip) {
        var item = document.createElement('div');
        item.className = 'accordion-item';

        var trigger = document.createElement('button');
        trigger.className = 'accordion-trigger';
        var triggerLeft = document.createElement('span');
        triggerLeft.textContent = tip.title;
        var triggerIcon = document.createElement('span');
        triggerIcon.className = 'accordion-trigger-icon';
        triggerIcon.textContent = '▶';
        var savingChip = document.createElement('span');
        savingChip.style.cssText = 'font-family:var(--font-mono);font-size:0.65rem;color:var(--green);margin-left:auto;margin-right:8px;';
        savingChip.textContent = tip.saving;
        trigger.appendChild(triggerLeft);
        trigger.appendChild(savingChip);
        trigger.appendChild(triggerIcon);

        var body = document.createElement('div');
        body.className = 'accordion-body';
        var bodyContent = document.createElement('div');
        bodyContent.className = 'accordion-content';
        var bodyP = document.createElement('p');
        bodyP.textContent = tip.body;
        bodyContent.appendChild(bodyP);
        body.appendChild(bodyContent);

        trigger.onclick = function () {
            item.classList.toggle('open');
            if (item.classList.contains('open')) GAME.awardTC(5, 'tip explored');
        };

        item.appendChild(trigger);
        item.appendChild(body);
        content.appendChild(item);
    });

    // Prompt Optimisation Sandbox
    var sandboxContainer = document.createElement('div');
    INTERACTIONS.buildPromptSandbox(sandboxContainer);
    content.appendChild(sandboxContainer);

    // Key points
    content.appendChild(buildKeyPoints(c.keyPoints));

    // Quiz
    var quizContainer = document.createElement('div');
    INTERACTIONS.renderQuiz('q_optimise_1', quizContainer, function (correct) {
        if (correct) checkSectionComplete(section);
    });
    content.appendChild(quizContainer);

    wrap.appendChild(content);
    wrap.appendChild(buildSectionFooter(section));
}

// ---- VENDORS (Section 7) ----

function renderVendorsSection(section, wrap) {
    var c = section.content;

    var hero = buildSectionHero(c.eyebrow, c.headline, c.standfirst, 'vendors-hero', section.whyItMatters);
    wrap.appendChild(hero);

    var content = document.createElement('div');
    content.style.cssText = 'padding:var(--s8);display:flex;flex-direction:column;gap:var(--s8);';

    // Vendor cards grid
    var vendorGrid = document.createElement('div');
    vendorGrid.className = 'vendors-grid';
    vendorGrid.style.cssText = 'padding:0;';

    c.vendors.forEach(function (v) {
        var card = document.createElement('div');
        card.className = 'vendor-card ' + v.cssClass;

        var iconEl = document.createElement('span');
        iconEl.className = 'vendor-icon';
        iconEl.textContent = v.icon;

        var nameEl = document.createElement('h4');
        nameEl.textContent = v.name;

        var pill = document.createElement('div');
        pill.className = 'vendor-pill';
        pill.textContent = v.model;

        var details = [
            { key: 'Context', val: v.contextWindow },
            { key: 'Pricing', val: v.pricing },
            { key: 'Best for', val: v.bestFor }
        ];

        card.appendChild(iconEl);
        card.appendChild(nameEl);
        card.appendChild(pill);

        details.forEach(function (d) {
            var row = document.createElement('div');
            row.className = 'vendor-detail-row';
            var key = document.createElement('span');
            key.className = 'vendor-detail-key';
            key.textContent = d.key;
            var val = document.createElement('span');
            val.className = 'vendor-detail-val';
            val.textContent = d.val;
            row.appendChild(key);
            row.appendChild(val);
            card.appendChild(row);
        });

        // Anthropic: easter egg hover wired in vendor match
        if (v.id === 'anthropic') {
            card.id = 'anthropic-vendor-card';
        }

        vendorGrid.appendChild(card);
    });
    content.appendChild(vendorGrid);

    // Vendor Matching Challenge
    var matchContainer = document.createElement('div');
    INTERACTIONS.buildVendorMatch(matchContainer);
    content.appendChild(matchContainer);

    // Key points
    content.appendChild(buildKeyPoints(c.keyPoints));

    // Quiz
    var quizContainer = document.createElement('div');
    INTERACTIONS.renderQuiz('q_vendors_1', quizContainer, function (correct) {
        if (correct) checkSectionComplete(section);
    });
    content.appendChild(quizContainer);

    wrap.appendChild(content);
    wrap.appendChild(buildSectionFooter(section));
}

// ---- ASSESSMENT (Section 8) ----

function renderAssessment(wrap) {
    var questions = CONTENT.questions;
    var currentQ = 0;
    var score = 0;
    var answers = [];

    if (STATE.assessmentPassed) {
        renderCertificate(wrap, STATE.assessmentScore, questions.length);
        return;
    }

    if (STATE.assessmentAttempts >= 2) {
        renderAssessmentLocked(wrap);
        return;
    }

    // Assessment header
    var header = document.createElement('div');
    header.className = 'assessment-header';

    var metaDiv = document.createElement('div');
    metaDiv.className = 'assessment-meta';
    var metaTitle = document.createElement('div');
    metaTitle.className = 'label label-amber';
    metaTitle.textContent = 'FINAL ASSESSMENT';
    var metaSubtitle = document.createElement('p');
    metaSubtitle.style.cssText = 'font-size:0.85rem;color:var(--text-3);max-width:none;margin-top:4px;';
    metaSubtitle.textContent = (STATE.assessmentAttempts === 0 ? 'Attempt 1 of 2' : 'Attempt 2 of 2, Final') + ' · Pass mark: 80% (' + Math.ceil(questions.length * 0.8) + '/' + questions.length + ' correct)';
    metaDiv.appendChild(metaTitle);
    metaDiv.appendChild(metaSubtitle);
    header.appendChild(metaDiv);

    var dotsContainer = document.createElement('div');
    dotsContainer.className = 'assessment-progress-dots';
    dotsContainer.id = 'assessment-dots';
    questions.forEach(function (q, i) {
        var dot = document.createElement('div');
        dot.className = 'assessment-q-dot' + (i === 0 ? ' active' : '');
        dot.id = 'q-dot-' + i;
        dotsContainer.appendChild(dot);
    });
    header.appendChild(dotsContainer);
    wrap.appendChild(header);

    // Body
    var body = document.createElement('div');
    body.className = 'assessment-body';

    var qNumber = document.createElement('div');
    qNumber.className = 'assessment-q-number';
    qNumber.id = 'q-number';
    qNumber.textContent = 'Question 1 of ' + questions.length;

    var qText = document.createElement('div');
    qText.className = 'assessment-q-text';
    qText.id = 'q-text';
    qText.textContent = questions[0].text;

    var qOptions = document.createElement('div');
    qOptions.id = 'q-options';
    body.appendChild(qNumber);
    body.appendChild(qText);
    body.appendChild(qOptions);

    // Fill dead space below options with a motivational callout
    var motivator = document.createElement('div');
    motivator.className = 'assessment-motivator';
    var motIcon = document.createElement('span');
    motIcon.setAttribute('aria-hidden', 'true');
    motIcon.textContent = '◆';
    var motText = document.createElement('span');
    motText.textContent = 'Answer 8 of 10 correctly to earn your certificate and unlock Advanced Mode.';
    motivator.appendChild(motIcon);
    motivator.appendChild(motText);
    body.appendChild(motivator);

    wrap.appendChild(body);

    // Footer
    var footer = document.createElement('div');
    footer.className = 'assessment-footer';
    var footerLeft = document.createElement('div');
    footerLeft.className = 'assessment-timer';
    footerLeft.id = 'assessment-timer';
    footerLeft.textContent = '0 of ' + questions.length + ' answered';
    var nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-primary';
    nextBtn.id = 'assessment-next';
    nextBtn.textContent = 'Next Question';
    nextBtn.disabled = true;
    nextBtn.style.display = 'none';
    footer.appendChild(footerLeft);
    footer.appendChild(nextBtn);
    wrap.appendChild(footer);

    function showQuestion(idx) {
        var q = questions[idx];
        var qNumEl = qNumber;
        var qTextEl = qText;
        var qOpts = qOptions;
        var nextBtnEl = nextBtn;
        var timerEl = footerLeft;

        if (qNumEl) qNumEl.textContent = 'Question ' + (idx + 1) + ' of ' + questions.length;
        if (qTextEl) qTextEl.textContent = q.text;

        // Update dot
        var dots = document.querySelectorAll('.assessment-q-dot');
        dots.forEach(function (d, i) {
            d.classList.remove('active');
            if (i === idx) d.classList.add('active');
        });

        if (nextBtnEl) {
            nextBtnEl.disabled = true;
            nextBtnEl.style.display = 'none';
        }

        INTERACTIONS.renderAssessmentQuestion(q, qOpts, function (correct) {
            answers.push(correct);
            if (correct) score++;

            var dot = document.getElementById('q-dot-' + idx);
            if (dot) dot.classList.add(correct ? 'answered-correct' : 'answered-wrong');

            if (timerEl) timerEl.textContent = (idx + 1) + ' of ' + questions.length + ' answered · ' + score + ' correct';

            if (nextBtnEl) {
                if (idx < questions.length - 1) {
                    nextBtnEl.style.display = 'block';
                    nextBtnEl.textContent = 'Next Question';
                    nextBtnEl.disabled = false;
                    nextBtnEl.onclick = function () {
                        currentQ++;
                        showQuestion(currentQ);
                    };
                } else {
                    nextBtnEl.style.display = 'block';
                    nextBtnEl.textContent = 'See Results';
                    nextBtnEl.disabled = false;
                    nextBtnEl.onclick = function () {
                        finishAssessment(score, questions.length, answers, wrap);
                    };
                }
            }
        });
    }

    showQuestion(0);
}

function finishAssessment(score, total, answers, wrap) {
    STATE.assessmentAttempts++;
    STATE.assessmentScore = score;
    STATE.assessmentAnswers = answers;

    var passed = score / total >= CONTENT.module.passThreshold;
    STATE.assessmentPassed = passed;

    if (passed) {
        SCORM.setScore(score, 0, total);
        SCORM.setSuccess('passed');
        SCORM.setCompletion('completed');
        GAME.awardTC(GAME.TC_AWARDS.moduleComplete, 'module complete!');

        if (score === total && STATE.assessmentAttempts === 1) GAME.awardBadge('perfectionist');
        if (STATE.assessmentAttempts === 2) GAME.awardBadge('comebackKid');
        if (score / total >= 0.9) {
            STATE.secretSectionUnlocked = true;
            GAME.discoverEasterEgg('secretSection');
        }

        xAPI.assessmentPassed(score, total);
    } else {
        SCORM.setScore(score, 0, total);
        SCORM.setSuccess('failed');
        xAPI.assessmentFailed(score, total);
    }

    INTERACTIONS.saveStateToScorm();

    // Re-render as results
    var main = document.getElementById('app-main');
    if (main) {
        main.innerHTML = '';
        var wrap2 = document.createElement('div');
        wrap2.className = 'section-wrapper theme-assessment';
        wrap2.style.animation = 'fadeSlideUp 0.4s ease both';

        if (passed) {
            renderCertificate(wrap2, score, total);
        } else {
            renderAssessmentResults(wrap2, score, total, false);
        }
        main.appendChild(wrap2);
    }
}

function renderAssessmentResults(wrap, score, total, passed) {
    var layout = document.createElement('div');
    layout.className = 'results-layout';

    var header = document.createElement('div');
    header.className = 'results-header';

    // Score ring
    var ring = buildScoreRing(score, total);
    header.appendChild(ring);

    var verdictDiv = document.createElement('div');
    var verdict = document.createElement('div');
    verdict.className = 'results-verdict ' + (passed ? 'passed' : 'failed');
    verdict.textContent = passed ? 'Passed' : 'Not Yet';
    var verdictSub = document.createElement('p');
    verdictSub.style.maxWidth = 'none';
    verdictSub.textContent = passed
        ? 'You demonstrated solid understanding of AI tokenomics.'
        : 'You scored ' + score + '/' + total + '. You need ' + Math.ceil(total * 0.8) + ' correct to pass. One more attempt available.';
    verdictDiv.appendChild(verdict);
    verdictDiv.appendChild(verdictSub);
    header.appendChild(verdictDiv);
    layout.appendChild(header);

    if (!passed && STATE.assessmentAttempts < 2) {
        var retryBtn = document.createElement('button');
        retryBtn.className = 'btn btn-primary btn-lg';
        retryBtn.textContent = 'Retry Assessment';
        retryBtn.onclick = function () {
            var main = document.getElementById('app-main');
            if (main) { main.innerHTML = ''; var w = document.createElement('div'); w.className = 'section-wrapper theme-assessment'; renderAssessment(w); main.appendChild(w); }
        };
        layout.appendChild(retryBtn);
    }

    // Review links per wrong answer
    var reviewCard = document.createElement('div');
    reviewCard.className = 'card';
    var reviewTitle = document.createElement('div');
    reviewTitle.className = 'label label-amber';
    reviewTitle.style.marginBottom = '12px';
    reviewTitle.textContent = 'REVIEW AREAS';
    reviewCard.appendChild(reviewTitle);

    CONTENT.questions.forEach(function (q, i) {
        if (!STATE.assessmentAnswers[i]) {
            var row = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:0.85rem;';
            var qLabel = document.createElement('span');
            qLabel.style.color = 'var(--text-2)';
            qLabel.textContent = 'Q' + (i + 1) + ': ' + q.text.substring(0, 60) + '...';
            var sectionLink = document.createElement('button');
            sectionLink.className = 'btn btn-ghost btn-sm';
            var sectionIdx = CONTENT.sections.findIndex(function (s) { return s.id === q.section; });
            sectionLink.textContent = 'Review →';
            sectionLink.onclick = function () { navigateTo(sectionIdx); };
            row.appendChild(qLabel); row.appendChild(sectionLink);
            reviewCard.appendChild(row);
        }
    });
    layout.appendChild(reviewCard);

    wrap.appendChild(layout);
}

function renderCertificate(wrap, score, total) {
    GAME.completeSection('assessment');

    var layout = document.createElement('div');
    layout.style.cssText = 'padding:var(--s12) var(--s8);display:flex;flex-direction:column;gap:var(--s8);align-items:center;';

    // Ring
    var ring = buildScoreRing(score, total);
    ring.style.marginBottom = 'var(--s4)';
    layout.appendChild(ring);

    var congrats = document.createElement('h2');
    congrats.style.cssText = 'text-align:center;color:var(--amber);font-family:var(--font-display);';
    congrats.textContent = 'Module Complete';
    layout.appendChild(congrats);

    // Certificate
    var cert = document.createElement('div');
    cert.className = 'certificate-wrap';
    cert.style.animation = 'fadeSlideUp 0.6s ease both';

    // Background decorative glyph
    var certBg = document.createElement('div');
    certBg.className = 'cert-bg-glyph';
    certBg.textContent = '◆';
    cert.appendChild(certBg);

    // Seal
    var certSeal = document.createElement('div');
    certSeal.className = 'certificate-seal';
    certSeal.textContent = '◈';
    cert.appendChild(certSeal);

    // Title with decorative bars
    var certTitleBar = document.createElement('div');
    certTitleBar.className = 'certificate-title-bar';
    var certTitleText = document.createElement('span');
    certTitleText.className = 'certificate-title';
    certTitleText.textContent = 'Certificate of Completion';
    certTitleBar.appendChild(certTitleText);
    cert.appendChild(certTitleBar);

    var certName = document.createElement('div');
    certName.className = 'certificate-name';
    certName.textContent = 'AI TOKENOMICS';
    cert.appendChild(certName);

    var certFor = document.createElement('div');
    certFor.className = 'certificate-for';
    certFor.textContent = 'Cost, Consumption and Control';
    cert.appendChild(certFor);

    // Learner name from LMS — no manual input field
    var learnerName = (typeof SCORM !== 'undefined' && SCORM.getLearnerName) ? SCORM.getLearnerName() : '';
    if (learnerName) {
        var certAwardedTo = document.createElement('div');
        certAwardedTo.className = 'certificate-awarded-to';
        certAwardedTo.textContent = 'awarded to';
        cert.appendChild(certAwardedTo);

        var certRecipient = document.createElement('div');
        certRecipient.className = 'certificate-recipient';
        certRecipient.textContent = learnerName;
        cert.appendChild(certRecipient);
    }

    var certCred = document.createElement('div');
    certCred.className = 'certificate-credential';
    certCred.textContent = 'Has demonstrated proficiency in understanding, monitoring, and optimizing AI token consumption costs.';
    cert.appendChild(certCred);

    // Divider
    var certDiv = document.createElement('div');
    certDiv.className = 'certificate-divider';
    certDiv.textContent = '◆ AI CAPABILITY PROGRAMME ◆';
    cert.appendChild(certDiv);

    var certMeta = document.createElement('div');
    certMeta.className = 'certificate-meta';

    var tierName = GAME.TIERS[STATE.tier] ? GAME.TIERS[STATE.tier].name : 'Token Analyst';
    var dateStr = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

    [
        { label: 'Score', value: Math.round((score/total)*100) + '%' },
        { label: 'Tier', value: tierName.split(' ')[0] },
        { label: 'TC', value: STATE.tc.toLocaleString() },
        { label: 'Badges', value: Object.keys(STATE.badges).length + '/12' }
    ].forEach(function (item) {
        var metaItem = document.createElement('div');
        metaItem.className = 'certificate-meta-item';
        var itemVal = document.createElement('span');
        itemVal.textContent = item.value;
        var itemLabel = document.createTextNode(item.label);
        metaItem.appendChild(itemVal);
        metaItem.appendChild(itemLabel);
        certMeta.appendChild(metaItem);
    });
    cert.appendChild(certMeta);

    var certIssued = document.createElement('div');
    certIssued.className = 'certificate-issued';
    certIssued.textContent = 'Issued: ' + dateStr + ' · AI Capability Programme';
    cert.appendChild(certIssued);

    layout.appendChild(cert);

    // Badges earned
    var earnedBadgeIds = Object.keys(STATE.badges);
    if (earnedBadgeIds.length > 0) {
        var badgeTitle = document.createElement('div');
        badgeTitle.className = 'label label-amber';
        badgeTitle.textContent = 'BADGES EARNED';
        layout.appendChild(badgeTitle);

        var badgeGrid = document.createElement('div');
        badgeGrid.className = 'badges-grid';
        badgeGrid.style.maxWidth = '600px';

        earnedBadgeIds.forEach(function (id) {
            var def = GAME.BADGE_DEF[id];
            if (!def) return;
            var item = document.createElement('div');
            item.className = 'badge-item earned';
            var icon = document.createElement('div');
            icon.className = 'badge-icon';
            icon.textContent = def.icon;
            var name = document.createElement('div');
            name.className = 'badge-name';
            name.textContent = def.name;
            item.appendChild(icon); item.appendChild(name);
            badgeGrid.appendChild(item);
        });
        layout.appendChild(badgeGrid);
    }

    // Secret section (if unlocked)
    if (STATE.secretSectionUnlocked) {
        var secret = document.createElement('div');
        secret.className = 'secret-section';
        secret.style.maxWidth = '600px';
        secret.style.width = '100%';

        var secTitle = document.createElement('h3');
        secTitle.style.cssText = 'color:var(--cyan);margin-bottom:var(--s4);';
        secTitle.textContent = 'Advanced Mode';
        secret.appendChild(secTitle);

        var secIntro = document.createElement('p');
        secIntro.textContent = 'You scored 90%+. Here are seven advanced optimisation strategies not covered in the main module.';
        secIntro.style.marginBottom = 'var(--s5)';
        secret.appendChild(secIntro);

        CONTENT.advancedTips.forEach(function (tip) {
            var item = document.createElement('div');
            item.className = 'accordion-item';
            var trigger = document.createElement('button');
            trigger.className = 'accordion-trigger';
            var lbl = document.createElement('span');
            lbl.textContent = tip.title;
            var icon = document.createElement('span');
            icon.className = 'accordion-trigger-icon';
            icon.textContent = '▶';
            trigger.appendChild(lbl); trigger.appendChild(icon);
            trigger.onclick = function () { item.classList.toggle('open'); };
            var body = document.createElement('div');
            body.className = 'accordion-body';
            var bodyContent = document.createElement('div');
            bodyContent.className = 'accordion-content';
            var p = document.createElement('p');
            p.textContent = tip.body;
            bodyContent.appendChild(p); body.appendChild(bodyContent);
            item.appendChild(trigger); item.appendChild(body);
            secret.appendChild(item);
        });
        layout.appendChild(secret);
    }

    // Print button (visual only)
    var printBtn = document.createElement('button');
    printBtn.className = 'btn btn-ghost';
    printBtn.textContent = '↓ Save Certificate (PDF)';
    printBtn.onclick = function () {
        GAME.showToast('PDF export available via your LMS portal.', 'amber');
    };
    layout.appendChild(printBtn);

    wrap.appendChild(layout);
}

function renderAssessmentLocked(wrap) {
    var div = document.createElement('div');
    div.style.cssText = 'padding:var(--s12) var(--s8);text-align:center;';

    var title = document.createElement('h2');
    title.style.color = 'var(--red)';
    title.textContent = 'Assessment Locked';

    var p = document.createElement('p');
    p.style.cssText = 'margin-top:var(--s4);text-align:center;max-width:none;';
    p.textContent = 'You have used both attempts. Your best score was ' + STATE.assessmentScore + '/' + CONTENT.questions.length + '. Please contact your L&D administrator to discuss a reset.';

    var revBtn = document.createElement('button');
    revBtn.className = 'btn btn-ghost';
    revBtn.style.marginTop = 'var(--s6)';
    revBtn.textContent = 'Review Module Content';
    revBtn.onclick = function () { navigateTo(1); };

    div.appendChild(title); div.appendChild(p); div.appendChild(revBtn);
    wrap.appendChild(div);
}

// ---- Generic section (fallback) ----

function renderGenericSection(section, wrap) {
    var c = section.content || {};
    var content = document.createElement('div');
    content.style.cssText = 'padding:var(--s8);';
    var title = document.createElement('h2');
    title.textContent = section.title;
    content.appendChild(title);
    wrap.appendChild(content);
    wrap.appendChild(buildSectionFooter(section));
}

// ---- Scroll unlock ----

function initScrollUnlock(wrap) {
    var footer = wrap.querySelector('.section-footer');
    var continueBtn = footer ? footer.querySelector('.btn-primary') : null;
    if (!continueBtn || !footer) return;

    // Lock the button until user has scrolled through the content
    continueBtn.classList.add('btn-locked');
    continueBtn.disabled = true;

    // Insert "keep reading" hint next to the button
    var hint = document.createElement('span');
    hint.className = 'scroll-unlock-hint';
    hint.textContent = '↓ Keep reading';
    var rightDiv = footer.querySelector('.section-footer-right');
    if (rightDiv) rightDiv.insertBefore(hint, continueBtn);

    var unlocked = false;

    function unlock() {
        if (unlocked) return;
        unlocked = true;
        continueBtn.classList.remove('btn-locked');
        continueBtn.classList.add('btn-unlock-anim');
        continueBtn.disabled = false;
        if (hint.parentNode) hint.parentNode.removeChild(hint);
        window.removeEventListener('scroll', onScroll);
    }

    // Capture the absolute bottom of content (wrap bottom minus sticky footer height)
    // Must be calculated after wrap is in the DOM
    var footerH = footer.offsetHeight || 60;
    var wrapRect = wrap.getBoundingClientRect();
    var scrollNow = document.documentElement.scrollTop;
    var contentAbsBottom = wrapRect.bottom + scrollNow - footerH;

    function onScroll() {
        var scrolled = document.documentElement.scrollTop;
        var windowH = window.innerHeight;
        // 80px buffer — don't need to hit the very last pixel
        if (scrolled + windowH >= contentAbsBottom - 80) {
            unlock();
        }
    }

    // Short timeout to ensure layout has settled, then check immediately
    setTimeout(function() {
        onScroll();
        if (!unlocked) {
            window.addEventListener('scroll', onScroll);
        }
    }, 150);
}

// ---- Shared UI builders ----

// ---- SVG Infographics ----

function buildCostExplosionSVG() {
    var wrap = document.createElement('div');
    wrap.className = 'svg-infographic';
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', 'Chart: Uber AI spend in 2026. An exponential curve shows spend accelerating from January through April, crossing the annual budget line 8 months early. $3.4 billion exhausted in 4 months.');
    wrap.innerHTML = [
        '<div class="svg-infographic-label" aria-hidden="true">UBER AI SPEND · 2026</div>',
        '<svg viewBox="0 0 480 210" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
        '  <rect width="480" height="210" fill="none"/>',
        '  <!-- Grid lines -->',
        '  <line x1="60" y1="170" x2="450" y2="170" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>',
        '  <line x1="60" y1="135" x2="450" y2="135" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>',
        '  <line x1="60" y1="100" x2="450" y2="100" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>',
        '  <line x1="60" y1="65" x2="450" y2="65" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>',
        '  <line x1="60" y1="30" x2="450" y2="30" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>',
        '  <!-- Budget line -->',
        '  <line x1="60" y1="115" x2="450" y2="115" stroke="rgba(239,68,68,0.45)" stroke-width="1.5" stroke-dasharray="6,4"/>',
        '  <text x="453" y="119" fill="rgba(239,68,68,0.7)" font-size="8" font-family="monospace">BUDGET</text>',
        '  <!-- Area fill -->',
        '  <defs>',
        '    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">',
        '      <stop offset="0%" stop-color="#f5a623" stop-opacity="0.25"/>',
        '      <stop offset="100%" stop-color="#f5a623" stop-opacity="0"/>',
        '    </linearGradient>',
        '  </defs>',
        '  <polygon points="80,165 150,157 220,147 290,128 350,100 400,64 435,28 435,170 80,170" fill="url(#lineGrad)"/>',
        '  <!-- Cost line -->',
        '  <polyline points="80,165 150,157 220,147 290,128 350,100 400,64 435,28" fill="none" stroke="#f5a623" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
        '  <!-- Glow -->',
        '  <polyline points="80,165 150,157 220,147 290,128 350,100 400,64 435,28" fill="none" stroke="#f5a623" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity="0.1"/>',
        '  <!-- Terminal data point -->',
        '  <circle cx="435" cy="28" r="5" fill="#f5a623"/>',
        '  <circle cx="435" cy="28" r="11" fill="#f5a623" opacity="0.18"/>',
        '  <!-- Budget-exceeded zone label -->',
        '  <rect x="340" y="118" width="96" height="42" rx="3" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" stroke-width="1"/>',
        '  <text x="388" y="133" fill="rgba(239,68,68,0.8)" font-size="8" font-family="monospace" text-anchor="middle">BUDGET</text>',
        '  <text x="388" y="145" fill="rgba(239,68,68,0.8)" font-size="8" font-family="monospace" text-anchor="middle">EXCEEDED</text>',
        '  <text x="388" y="155" fill="rgba(239,68,68,0.5)" font-size="7" font-family="monospace" text-anchor="middle">8 months early</text>',
        '  <!-- Month labels -->',
        '  <text x="77" y="190" fill="rgba(255,255,255,0.25)" font-size="9" font-family="monospace">JAN</text>',
        '  <text x="217" y="190" fill="rgba(255,255,255,0.25)" font-size="9" font-family="monospace">FEB</text>',
        '  <text x="347" y="190" fill="rgba(255,255,255,0.25)" font-size="9" font-family="monospace">MAR</text>',
        '  <text x="427" y="190" fill="rgba(255,255,255,0.25)" font-size="9" font-family="monospace">APR</text>',
        '  <!-- Final stat -->',
        '  <text x="18" y="28" fill="#f5a623" font-size="14" font-family="monospace" font-weight="bold">$3.4B</text>',
        '  <text x="18" y="42" fill="rgba(255,255,255,0.35)" font-size="8" font-family="monospace">gone in 4 months</text>',
        '</svg>'
    ].join('\n');
    return wrap;
}

function buildTokenizationSVG() {
    var wrap = document.createElement('div');
    wrap.className = 'svg-infographic';
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', 'Diagram: Tokenization in action. The phrase "The quarterly results" is broken into coloured chunks showing each token boundary. Demonstrates that a single sentence becomes 8 to 12 tokens, not 4 words.');
    wrap.innerHTML = [
        '<div class="svg-infographic-label" aria-hidden="true">TOKENIZATION IN ACTION</div>',
        '<svg viewBox="0 0 480 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
        '  <rect width="480" height="140" fill="none"/>',
        '  <!-- Input phrase -->',
        '  <text x="24" y="35" fill="rgba(255,255,255,0.5)" font-size="10" font-family="monospace" letter-spacing="0.08em">INPUT TEXT</text>',
        '  <text x="24" y="58" fill="rgba(255,255,255,0.85)" font-size="15" font-family="monospace">"quarterly financial results"</text>',
        '  <!-- Arrow -->',
        '  <line x1="240" y1="72" x2="240" y2="88" stroke="rgba(245,158,11,0.5)" stroke-width="2"/>',
        '  <polygon points="234,86 246,86 240,96" fill="rgba(245,158,11,0.6)"/>',
        '  <!-- Token blocks row -->',
        '  <text x="24" y="112" fill="rgba(255,255,255,0.5)" font-size="10" font-family="monospace" letter-spacing="0.08em">TOKENS (~7)</text>',
        '  <!-- Token: "qu" -->',
        '  <rect x="110" y="100" width="30" height="22" rx="4" fill="rgba(245,158,11,0.2)" stroke="rgba(245,158,11,0.5)" stroke-width="1"/>',
        '  <text x="125" y="115" fill="#f5a623" font-size="10" font-family="monospace" text-anchor="middle">qu</text>',
        '  <!-- Token: "art" -->',
        '  <rect x="143" y="100" width="30" height="22" rx="4" fill="rgba(6,182,212,0.2)" stroke="rgba(6,182,212,0.5)" stroke-width="1"/>',
        '  <text x="158" y="115" fill="#06b6d4" font-size="10" font-family="monospace" text-anchor="middle">art</text>',
        '  <!-- Token: "erly" -->',
        '  <rect x="176" y="100" width="36" height="22" rx="4" fill="rgba(245,158,11,0.2)" stroke="rgba(245,158,11,0.5)" stroke-width="1"/>',
        '  <text x="194" y="115" fill="#f5a623" font-size="10" font-family="monospace" text-anchor="middle">erly</text>',
        '  <!-- Token: "fin" -->',
        '  <rect x="215" y="100" width="30" height="22" rx="4" fill="rgba(6,182,212,0.2)" stroke="rgba(6,182,212,0.5)" stroke-width="1"/>',
        '  <text x="230" y="115" fill="#06b6d4" font-size="10" font-family="monospace" text-anchor="middle">fin</text>',
        '  <!-- Token: "anc" -->',
        '  <rect x="248" y="100" width="32" height="22" rx="4" fill="rgba(245,158,11,0.2)" stroke="rgba(245,158,11,0.5)" stroke-width="1"/>',
        '  <text x="264" y="115" fill="#f5a623" font-size="10" font-family="monospace" text-anchor="middle">anc</text>',
        '  <!-- Token: "ial" -->',
        '  <rect x="283" y="100" width="28" height="22" rx="4" fill="rgba(6,182,212,0.2)" stroke="rgba(6,182,212,0.5)" stroke-width="1"/>',
        '  <text x="297" y="115" fill="#06b6d4" font-size="10" font-family="monospace" text-anchor="middle">ial</text>',
        '  <!-- Token: "results" -->',
        '  <rect x="314" y="100" width="50" height="22" rx="4" fill="rgba(245,158,11,0.2)" stroke="rgba(245,158,11,0.5)" stroke-width="1"/>',
        '  <text x="339" y="115" fill="#f5a623" font-size="10" font-family="monospace" text-anchor="middle">results</text>',
        '  <!-- Note -->',
        '  <text x="380" y="112" fill="rgba(255,255,255,0.3)" font-size="9" font-family="monospace">≠ 3 words</text>',
        '</svg>'
    ].join('\n');
    return wrap;
}

function buildUsageAnomalySVG() {
    var wrap = document.createElement('div');
    wrap.className = 'svg-infographic';
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', 'Bar chart: Daily token consumption by user. Four team members (Alex, Sam, Taylor, Casey) cluster near the team average. One user (Jordan) consumes 10 times the team average, flagged with a red alert indicator. A callout notes: Investigate first. High spend does not equal waste.');
    wrap.innerHTML = [
        '<div class="svg-infographic-label" aria-hidden="true">TOKEN CONSUMPTION BY USER · DAILY</div>',
        '<svg viewBox="0 0 480 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
        '  <rect width="480" height="190" fill="none"/>',
        '  <!-- Grid -->',
        '  <line x1="60" y1="150" x2="440" y2="150" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>',
        '  <line x1="60" y1="120" x2="440" y2="120" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>',
        '  <line x1="60" y1="90" x2="440" y2="90" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>',
        '  <line x1="60" y1="60" x2="440" y2="60" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>',
        '  <!-- Team average line -->',
        '  <line x1="60" y1="130" x2="440" y2="130" stroke="rgba(6,182,212,0.4)" stroke-width="1.5" stroke-dasharray="5,3"/>',
        '  <text x="444" y="134" fill="rgba(6,182,212,0.6)" font-size="8" font-family="monospace">AVG</text>',
        '  <!-- Normal bars (cyan) -->',
        '  <rect x="80" y="120" width="42" height="30" rx="3" fill="rgba(6,182,212,0.25)" stroke="rgba(6,182,212,0.4)" stroke-width="1"/>',
        '  <rect x="148" y="115" width="42" height="35" rx="3" fill="rgba(6,182,212,0.25)" stroke="rgba(6,182,212,0.4)" stroke-width="1"/>',
        '  <rect x="286" y="122" width="42" height="28" rx="3" fill="rgba(6,182,212,0.25)" stroke="rgba(6,182,212,0.4)" stroke-width="1"/>',
        '  <rect x="354" y="117" width="42" height="33" rx="3" fill="rgba(6,182,212,0.25)" stroke="rgba(6,182,212,0.4)" stroke-width="1"/>',
        '  <!-- Anomalous bar (amber -> red gradient, very tall) -->',
        '  <defs>',
        '    <linearGradient id="anomGrad" x1="0" y1="0" x2="0" y2="1">',
        '      <stop offset="0%" stop-color="#ef4444" stop-opacity="0.9"/>',
        '      <stop offset="100%" stop-color="#f5a623" stop-opacity="0.7"/>',
        '    </linearGradient>',
        '  </defs>',
        '  <rect x="217" y="20" width="42" height="130" rx="3" fill="url(#anomGrad)"/>',
        '  <!-- Pulse ring on anomalous bar -->',
        '  <circle cx="238" cy="14" r="11" fill="rgba(239,68,68,0.2)" stroke="rgba(239,68,68,0.7)" stroke-width="1.5"/>',
        '  <text x="238" y="19" fill="white" font-size="13" font-family="sans-serif" text-anchor="middle" font-weight="bold">!</text>',
        '  <!-- Annotation callout -->',
        '  <rect x="268" y="22" width="120" height="46" rx="4" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.3)" stroke-width="1"/>',
        '  <line x1="260" y1="38" x2="268" y2="38" stroke="rgba(239,68,68,0.4)" stroke-width="1"/>',
        '  <text x="278" y="38" fill="#ef4444" font-size="9" font-family="monospace" font-weight="bold">10× team average</text>',
        '  <text x="278" y="52" fill="rgba(255,255,255,0.45)" font-size="8" font-family="monospace">Investigate first.</text>',
        '  <text x="278" y="63" fill="rgba(255,255,255,0.35)" font-size="8" font-family="monospace">High spend ≠ waste.</text>',
        '  <!-- User labels -->',
        '  <text x="101" y="170" fill="rgba(255,255,255,0.3)" font-size="9" font-family="monospace" text-anchor="middle">Alex</text>',
        '  <text x="169" y="170" fill="rgba(255,255,255,0.3)" font-size="9" font-family="monospace" text-anchor="middle">Sam</text>',
        '  <text x="238" y="170" fill="#ef4444" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Jordan</text>',
        '  <text x="307" y="170" fill="rgba(255,255,255,0.3)" font-size="9" font-family="monospace" text-anchor="middle">Taylor</text>',
        '  <text x="375" y="170" fill="rgba(255,255,255,0.3)" font-size="9" font-family="monospace" text-anchor="middle">Casey</text>',
        '</svg>'
    ].join('\n');
    return wrap;
}

function buildWIIFMCallout(text) {
    var callout = document.createElement('div');
    callout.className = 'wiifm-callout';

    var label = document.createElement('div');
    label.className = 'wiifm-callout-label';
    label.textContent = 'Why this matters to you';

    var p = document.createElement('p');
    p.textContent = text;

    callout.appendChild(label);
    callout.appendChild(p);
    return callout;
}

function buildSectionHero(eyebrow, headline, standfirst, className, whyItMatters) {
    var hero = document.createElement('div');
    if (className) hero.className = className;

    var eyebrowEl = document.createElement('div');
    eyebrowEl.className = 'hook-eyebrow';
    eyebrowEl.textContent = eyebrow;

    var headlineEl = document.createElement('h2');
    headlineEl.className = 'hook-headline';
    headlineEl.style.fontSize = 'clamp(1.75rem,4vw,3rem)';
    headlineEl.textContent = headline;

    var standfirstEl = document.createElement('p');
    standfirstEl.className = 'hook-standfirst';
    standfirstEl.textContent = standfirst;

    hero.appendChild(eyebrowEl);
    hero.appendChild(headlineEl);
    hero.appendChild(standfirstEl);

    if (whyItMatters) {
        hero.appendChild(buildWIIFMCallout(whyItMatters));
    }

    return hero;
}

function buildCaseStudyCard(cs) {
    var card = document.createElement('div');
    card.className = 'news-card';

    var hdr = document.createElement('div');
    hdr.className = 'news-card-header';

    var sourceEl = document.createElement('span');
    sourceEl.className = 'news-card-source';
    sourceEl.textContent = cs.source;

    var dateEl = document.createElement('span');
    dateEl.className = 'news-card-date';
    dateEl.textContent = cs.date;

    var statEl = document.createElement('div');
    statEl.style.textAlign = 'right';
    var statVal = document.createElement('div');
    statVal.className = 'news-card-stat';
    statVal.textContent = cs.stat;
    var statLbl = document.createElement('div');
    statLbl.style.cssText = 'font-family:var(--font-mono);font-size:0.6rem;color:var(--text-3);letter-spacing:0.08em;';
    statLbl.textContent = cs.statLabel;
    statEl.appendChild(statVal);
    statEl.appendChild(statLbl);

    hdr.appendChild(sourceEl);
    hdr.appendChild(dateEl);
    hdr.appendChild(statEl);
    card.appendChild(hdr);

    var body = document.createElement('div');
    body.className = 'news-card-body';

    var headline = document.createElement('div');
    headline.className = 'news-card-headline';
    headline.textContent = cs.headline;
    body.appendChild(headline);

    cs.body.forEach(function (para) {
        var p = document.createElement('p');
        p.textContent = para;
        body.appendChild(p);
    });

    var lessonBox = document.createElement('div');
    lessonBox.className = 'news-card-lesson';
    var lessonLabel = document.createElement('span');
    lessonLabel.className = 'news-card-lesson-label';
    lessonLabel.textContent = 'The lesson';
    var lessonText = document.createElement('p');
    lessonText.textContent = cs.lesson;
    lessonBox.appendChild(lessonLabel);
    lessonBox.appendChild(lessonText);
    body.appendChild(lessonBox);

    card.appendChild(body);
    return card;
}

function buildKeyPoints(points) {
    var card = document.createElement('div');
    card.className = 'card card-amber';
    card.style.cssText += 'margin-top:var(--s4);';

    var title = document.createElement('div');
    title.className = 'label label-amber';
    title.style.marginBottom = '12px';
    title.textContent = 'KEY POINTS';
    card.appendChild(title);

    var list = document.createElement('ul');
    list.className = 'objective-list';
    points.forEach(function (pt) {
        var li = document.createElement('li');
        li.className = 'objective-item';
        li.textContent = pt;
        list.appendChild(li);
    });
    card.appendChild(list);
    return card;
}

function buildScoreRing(score, total) {
    var wrap = document.createElement('div');
    wrap.className = 'score-ring';

    var pct = Math.round((score / total) * 100);
    var r = 52;
    var circ = 2 * Math.PI * r;
    var offset = circ * (1 - score / total);
    var passed = score / total >= CONTENT.module.passThreshold;

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '120');
    svg.setAttribute('height', '120');
    svg.setAttribute('viewBox', '0 0 120 120');

    var trackCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    trackCircle.setAttribute('cx', '60'); trackCircle.setAttribute('cy', '60');
    trackCircle.setAttribute('r', r); trackCircle.setAttribute('fill', 'none');
    trackCircle.setAttribute('stroke', 'var(--surface-3)'); trackCircle.setAttribute('stroke-width', '8');

    var fillCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    fillCircle.setAttribute('cx', '60'); fillCircle.setAttribute('cy', '60');
    fillCircle.setAttribute('r', r); fillCircle.setAttribute('fill', 'none');
    fillCircle.setAttribute('stroke', passed ? 'var(--green)' : 'var(--red)');
    fillCircle.setAttribute('stroke-width', '8');
    fillCircle.setAttribute('stroke-dasharray', circ);
    fillCircle.setAttribute('stroke-dashoffset', offset);
    fillCircle.setAttribute('stroke-linecap', 'round');

    svg.appendChild(trackCircle);
    svg.appendChild(fillCircle);
    wrap.appendChild(svg);

    var text = document.createElement('div');
    text.className = 'score-ring-text';
    var pctEl = document.createElement('div');
    pctEl.className = 'score-ring-pct';
    pctEl.style.color = passed ? 'var(--green)' : 'var(--red)';
    pctEl.textContent = pct + '%';
    var labelEl = document.createElement('div');
    labelEl.className = 'score-ring-label';
    labelEl.textContent = score + '/' + total;
    text.appendChild(pctEl);
    text.appendChild(labelEl);
    wrap.appendChild(text);

    return wrap;
}

function buildSectionFooter(section) {
    var footer = document.createElement('footer');
    footer.className = 'section-footer';
    footer.setAttribute('aria-label', 'Section navigation');

    var left = document.createElement('div');
    left.className = 'section-footer-left';

    var totalSections = CONTENT.sections.length - 2; // exclude intro + assessment
    var sectionNum = document.createElement('span');
    sectionNum.setAttribute('aria-live', 'polite');
    sectionNum.textContent = 'Section ' + section.number + ' of ' + totalSections;
    left.appendChild(sectionNum);

    var right = document.createElement('div');
    right.className = 'section-footer-right';

    if (section.number > 1) {
        var prevSection = CONTENT.sections[section.number - 1];
        var backBtn = document.createElement('button');
        backBtn.className = 'btn btn-ghost';
        backBtn.textContent = '← Back';
        backBtn.setAttribute('aria-label', 'Go back to previous section');
        backBtn.onclick = function () { navigateTo(section.number - 1); };
        right.appendChild(backBtn);
    }

    var sectionIdx = CONTENT.sections.findIndex(function (s) { return s.id === section.id; });
    var isLast = sectionIdx === CONTENT.sections.length - 2; // before assessment

    var nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-primary btn-lg';
    nextBtn.textContent = isLast ? 'Take Assessment →' : 'Continue →';
    nextBtn.setAttribute('aria-label', isLast ? 'Proceed to knowledge assessment' : 'Continue to next section');
    nextBtn.onclick = function () {
        checkSectionComplete(section);
        navigateTo(sectionIdx + 1);
    };
    right.appendChild(nextBtn);

    footer.appendChild(left);
    footer.appendChild(right);
    return footer;
}

function checkSectionComplete(section) {
    var sectionIdx = CONTENT.sections.findIndex(function (s) { return s.id === section.id; });
    if (STATE.completedSections.indexOf(section.id) === -1) {
        STATE.completedSections.push(section.id);
        GAME.completeSection(section.id);
        xAPI.sectionCompleted(section.id, section.title, 0);
    }
    updateProgressBar();

    // Check full module completion
    if (STATE.completedSections.length >= CONTENT.sections.length - 2) {
        SCORM.setCompletion('completed');
    }
}
