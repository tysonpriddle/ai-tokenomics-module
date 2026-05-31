/* ============================================================
   GAME.JS — Gamification Engine
   Token Credits, tiers, badges, streaks, easter eggs.
   All functions read/write STATE (defined in main.js, set before
   game functions are called at runtime).
   ============================================================ */

const GAME = (function () {

    // ---- Constants ----

    const TIERS = [
        { name: 'Prompt Rookie',         icon: '◉', min: 0,    max: 499  },
        { name: 'Context Consumer',      icon: '◈', min: 500,  max: 999  },
        { name: 'Token Analyst',         icon: '◆', min: 1000, max: 1999 },
        { name: 'Prompt Engineer',       icon: '◇', min: 2000, max: 3499 },
        { name: 'Tokenomics Architect',  icon: '⬡', min: 3500, max: Infinity }
    ];

    const BADGE_DEF = {
        firstBlood:      { name: 'First Blood',             icon: '⚡', desc: 'First correct answer' },
        pennyPincher:    { name: 'Penny Pincher',           icon: '🪙', desc: 'Completed Section 6 with no wrong answers' },
        contextWarrior:  { name: 'Context Window Warrior',  icon: '📐', desc: 'All context questions answered correctly' },
        budgetGuardian:  { name: 'Budget Guardian',         icon: '🛡', desc: 'Found all 5 anomalies in the governance audit' },
        speedDemon:      { name: 'Speed Demon',             icon: '⚡', desc: '3 correct answers in under 8 seconds each' },
        perfectionist:   { name: 'Perfectionist',           icon: '✦', desc: '100% on assessment, first attempt' },
        comebackKid:     { name: 'Comeback Kid',            icon: '↩', desc: 'Failed the assessment once, passed on retry' },
        loreHunter:      { name: 'Lore Hunter',             icon: '🔍', desc: 'Discovered 3 or more easter eggs' },
        deepDiver:       { name: 'Deep Diver',              icon: '🌊', desc: 'Completed all optional activities' },
        vendorWhisperer: { name: 'Vendor Whisperer',        icon: '🤝', desc: 'Correctly matched all vendors first attempt' },
        tokenHoarder:    { name: 'Token Hoarder',           icon: '🏦', desc: 'Accumulated 3,000 TC' },
        theArchitect:    { name: 'The Architect',           icon: '⬡', desc: 'Achieved Tokenomics Architect tier' }
    };

    const EASTER_EGG_DEF = {
        konami:         { name: 'Konami Code',       tc: 50  },
        fortyTwo:       { name: 'The Answer',        tc: 42  },
        rageClick:      { name: 'Rage Quitter',      tc: 15  },
        idle:           { name: 'Context Cold',      tc: 25  },
        secretSection:  { name: 'Advanced Mode',     tc: 100 },
        logoRain:       { name: 'Token Rain',        tc: 30  },
        anthropicHover: { name: 'The Claude Secret', tc: 25  }
    };

    const TC_AWARDS = {
        correctFirst:    50,
        correctSecond:   25,
        interactionDone: 10,
        sectionComplete: 100,
        moduleComplete:  200,
        wrongAnswer:    -10,
        skipOptional:   -25
    };

    // ---- Speed tracking ----
    let _questionOpenTime = 0;
    let _speedCorrectCount = 0;

    // ---- Internal helpers ----

    function _getTierIndex(tc) {
        for (let i = TIERS.length - 1; i >= 0; i--) {
            if (tc >= TIERS[i].min) return i;
        }
        return 0;
    }

    function _animateTCCounter(delta) {
        const el = document.getElementById('tc-value');
        if (!el) return;
        el.classList.remove('tick-up', 'tick-down');
        void el.offsetWidth; // reflow
        if (delta > 0) el.classList.add('tick-up');
        else if (delta < 0) el.classList.add('tick-down');
        el.style.animation = 'tcBump 0.35s ease';
        setTimeout(() => {
            el.style.animation = '';
            el.classList.remove('tick-up', 'tick-down');
        }, 700);
    }

    function _animateCountTo(el, from, to, duration) {
        const start = performance.now();
        function step(now) {
            const p = Math.min((now - start) / duration, 1);
            const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
            el.textContent = Math.round(from + (to - from) * eased).toLocaleString();
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    function _updateHeader() {
        const tc = STATE.tc;
        const tierIdx = _getTierIndex(tc);
        const tier = TIERS[tierIdx];

        const tcEl = document.getElementById('tc-value');
        const badgeEl = document.getElementById('tier-badge');

        if (tcEl) tcEl.textContent = tc.toLocaleString();
        if (badgeEl) {
            badgeEl.textContent = `${tier.icon} ${tier.name}`;
        }
    }

    // ---- Public API ----

    function awardTC(amount, reason) {
        const multiplier = STATE.streakMultiplier || 1;
        const actual = amount > 0 ? Math.round(amount * multiplier) : amount;
        const prev = STATE.tc;
        STATE.tc = Math.max(0, STATE.tc + actual);

        _animateTCCounter(actual);

        const tcEl = document.getElementById('tc-value');
        if (tcEl) _animateCountTo(tcEl, prev, STATE.tc, 400);

        if (reason) showToast((actual > 0 ? '+' : '') + actual + ' TC: ' + reason, actual > 0 ? 'amber' : 'red');

        checkTierUp(prev);
        checkBadgeTokenHoarder();
    }

    function checkTierUp(prevTC) {
        if (prevTC === undefined) prevTC = STATE.tc;
        const prevTier = _getTierIndex(prevTC);
        const newTier  = _getTierIndex(STATE.tc);

        if (newTier > prevTier) {
            STATE.tier = newTier;
            _updateHeader();
            showTierUpOverlay(TIERS[newTier]);
            if (newTier === 4) awardBadge('theArchitect');
        } else {
            STATE.tier = newTier;
            _updateHeader();
        }
    }

    function checkBadgeTokenHoarder() {
        if (STATE.tc >= 3000 && !STATE.badges.tokenHoarder) {
            awardBadge('tokenHoarder');
        }
    }

    function recordCorrectAnswer(isFirstAttempt) {
        const now = Date.now();

        // First Blood
        if (!STATE.badges.firstBlood) {
            awardBadge('firstBlood');
        }

        // Streak
        STATE.streak = (STATE.streak || 0) + 1;
        _updateStreak();

        // Speed Demon
        if (_questionOpenTime > 0) {
            const elapsed = (now - _questionOpenTime) / 1000;
            if (elapsed < 8) {
                _speedCorrectCount++;
                if (_speedCorrectCount >= 3 && !STATE.badges.speedDemon) {
                    awardBadge('speedDemon');
                }
            } else {
                _speedCorrectCount = 0;
            }
        }
        _questionOpenTime = 0;

        const amount = isFirstAttempt ? TC_AWARDS.correctFirst : TC_AWARDS.correctSecond;
        awardTC(amount, 'correct answer');
    }

    function recordWrongAnswer() {
        STATE.streak = 0;
        _speedCorrectCount = 0;
        _updateStreak();
        awardTC(TC_AWARDS.wrongAnswer, 'wrong answer');
    }

    function markQuestionOpen() {
        _questionOpenTime = Date.now();
    }

    function _updateStreak() {
        const count = STATE.streak || 0;
        const flameEl = document.getElementById('streak-flame');
        const countEl = document.getElementById('streak-count');

        if (countEl) countEl.textContent = count;

        if (count >= 5) {
            STATE.streakMultiplier = 2;
            if (flameEl) { flameEl.textContent = '🔥'; flameEl.classList.add('flame-active'); }
            showToast('ON FIRE! 2× multiplier active', 'amber');
        } else if (count >= 3) {
            STATE.streakMultiplier = 1.5;
            if (flameEl) { flameEl.textContent = '🔥'; flameEl.classList.add('flame-active'); }
        } else {
            STATE.streakMultiplier = 1;
            if (flameEl) { flameEl.textContent = ''; flameEl.classList.remove('flame-active'); }
        }
    }

    function awardBadge(badgeId) {
        if (STATE.badges[badgeId]) return;
        STATE.badges[badgeId] = Date.now();
        const def = BADGE_DEF[badgeId];
        if (!def) return;

        showBadgeOverlay(def);
        xAPI.badgeEarned(def.name);

        // Update badge display if visible
        const el = document.querySelector(`[data-badge="${badgeId}"]`);
        if (el) el.classList.add('earned');
    }

    function discoverEasterEgg(eggId) {
        if (STATE.easterEggs.indexOf(eggId) > -1) return;
        STATE.easterEggs.push(eggId);

        const def = EASTER_EGG_DEF[eggId];
        if (!def) return;

        awardTC(def.tc, `Easter egg: ${def.name}`);

        // Lore Hunter: 3+ eggs
        if (STATE.easterEggs.length >= 3 && !STATE.badges.loreHunter) {
            awardBadge('loreHunter');
        }
    }

    function completeOptionalActivity(activityId) {
        if (!STATE.optionalActivities) STATE.optionalActivities = [];
        if (STATE.optionalActivities.indexOf(activityId) > -1) return;
        STATE.optionalActivities.push(activityId);
        awardTC(TC_AWARDS.interactionDone, 'optional activity');

        // Deep Diver: all 5 optional activities
        const REQUIRED = ['tokenCalc', 'promptSandbox', 'budgetSim', 'govAudit', 'vendorMatch'];
        const allDone = REQUIRED.every(function (id) {
            return STATE.optionalActivities.indexOf(id) > -1;
        });
        if (allDone && !STATE.badges.deepDiver) {
            awardBadge('deepDiver');
        }
    }

    function completeSection(sectionId) {
        if (!STATE.completedSections) STATE.completedSections = [];
        if (STATE.completedSections.indexOf(sectionId) > -1) return;
        STATE.completedSections.push(sectionId);
        awardTC(TC_AWARDS.sectionComplete, 'section complete');
    }

    function getProgressPercent() {
        const total = 8; // sections 0-7 (intro + 7 content sections)
        const done = (STATE.completedSections || []).length;
        return Math.round((done / total) * 100);
    }

    // ---- Overlay / UI ----

    function showBadgeOverlay(def) {
        const overlay = document.getElementById('overlay');
        if (!overlay) return;

        overlay.innerHTML = `
            <div class="overlay-card" id="badge-overlay-card">
                <div id="burst-container" style="position:absolute;inset:0;pointer-events:none;overflow:hidden;"></div>
                <span class="overlay-icon">${def.icon}</span>
                <div class="overlay-title">Badge Unlocked!</div>
                <div class="label label-amber" style="margin-bottom:8px;letter-spacing:0.1em;">${def.name.toUpperCase()}</div>
                <p class="overlay-subtitle">${def.desc}</p>
                <button class="btn btn-primary" onclick="closeOverlay()">Continue</button>
            </div>`;

        overlay.classList.remove('hidden');
        overlay.style.animation = 'fadeIn 0.2s ease both';

        // Particle burst
        _spawnParticles(document.getElementById('burst-container'), 20);
    }

    function showTierUpOverlay(tier) {
        const overlay = document.getElementById('overlay');
        if (!overlay) return;

        overlay.innerHTML = `
            <div class="overlay-card" style="animation:tierGlow 1.5s ease infinite;">
                <span class="overlay-icon" style="font-size:4rem;">${tier.icon}</span>
                <div class="overlay-title" style="font-size:2rem;">Tier Up!</div>
                <div class="label label-amber" style="font-size:0.9rem;letter-spacing:0.12em;margin-bottom:8px;">${tier.name.toUpperCase()}</div>
                <p class="overlay-subtitle" style="margin-bottom:24px;">Your Token Credit balance has unlocked a new tier.</p>
                <button class="btn btn-primary btn-lg" onclick="closeOverlay()">Keep Going</button>
            </div>`;

        overlay.classList.remove('hidden');
    }

    function _spawnParticles(container, count) {
        if (!container) return;
        const colours = ['#F59E0B', '#06B6D4', '#10B981', '#FCD34D'];
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'burst-particle';
            const angle = (i / count) * 360;
            const dist = 60 + Math.random() * 80;
            const dx = Math.cos(angle * Math.PI / 180) * dist;
            const dy = Math.sin(angle * Math.PI / 180) * dist;
            p.style.cssText = `
                left:50%; top:50%;
                --tx:translateX(${dx}px);
                --ty:translateY(${dy}px);
                background:${colours[i % colours.length]};
                animation-delay:${i * 15}ms;
                animation-duration:${400 + Math.random() * 200}ms;
            `;
            container.appendChild(p);
        }
    }

    function showToast(msg, type) {
        const existing = document.getElementById('toast-el');
        if (existing) existing.remove();

        const t = document.createElement('div');
        t.id = 'toast-el';
        t.className = 'toast' + (type === 'amber' ? ' toast-amber' : type === 'green' ? ' toast-green' : '');

        const dot = document.createElement('span');
        dot.style.color = type === 'red' ? 'var(--red)' : type === 'green' ? 'var(--green)' : 'var(--amber)';
        dot.textContent = '●';

        const text = document.createElement('span');
        text.textContent = msg;

        t.appendChild(dot);
        t.appendChild(text);

        const container = document.getElementById('toast-container') || document.body;
        container.appendChild(t);

        setTimeout(function () {
            t.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(function () { if (t.parentNode) t.remove(); }, 300);
        }, 2500);
    }

    // ---- Easter egg: Konami Code ----

    const KONAMI = [38,38,40,40,37,39,37,39,66,65];
    let _konamiIdx = 0;

    document.addEventListener('keydown', function (e) {
        if (e.keyCode === KONAMI[_konamiIdx]) {
            _konamiIdx++;
            if (_konamiIdx === KONAMI.length) {
                _konamiIdx = 0;
                discoverEasterEgg('konami');
                _showKonamiEgg();
            }
        } else {
            _konamiIdx = e.keyCode === KONAMI[0] ? 1 : 0;
        }
    });

    function _showKonamiEgg() {
        const overlay = document.getElementById('overlay');
        if (!overlay) return;
        overlay.innerHTML = `
            <div class="overlay-card" style="animation:konamiSpin 0.6s ease both;">
                <span class="overlay-icon" style="animation:konamiSpin 1s ease;">🎮</span>
                <div class="overlay-title">Nice Try</div>
                <p class="overlay-subtitle">No free tokens. You know better.<br>But here's 50 TC for style.</p>
                <div class="label label-amber" style="margin:12px 0;font-size:1.2rem;">+50 TC</div>
                <button class="btn btn-primary" onclick="closeOverlay()">Fair enough</button>
            </div>`;
        overlay.classList.remove('hidden');
    }

    // ---- Easter egg: Logo click (5 times fast) ----
    let _logoClicks = 0;
    let _logoClickTimer = null;

    function onLogoClick() {
        _logoClicks++;
        clearTimeout(_logoClickTimer);
        _logoClickTimer = setTimeout(function () { _logoClicks = 0; }, 1500);
        if (_logoClicks >= 5) {
            _logoClicks = 0;
            discoverEasterEgg('logoRain');
            _spawnTokenRain();
        }
    }

    function _spawnTokenRain() {
        showToast('You found the token rain! +30 TC', 'amber');
        for (let i = 0; i < 25; i++) {
            setTimeout(function () {
                const p = document.createElement('div');
                p.className = 'token-rain-particle';
                p.textContent = ['◆', '◈', '⬡', '◉', '▲'][Math.floor(Math.random() * 5)];
                p.style.left = (5 + Math.random() * 90) + '%';
                p.style.animationDuration = (1.5 + Math.random() * 2) + 's';
                p.style.fontSize = (0.8 + Math.random() * 0.8) + 'rem';
                document.body.appendChild(p);
                setTimeout(function () { p.remove(); }, 4000);
            }, i * 80);
        }
    }

    // ---- Easter egg: Idle detection ----
    let _idleTimer = null;
    const IDLE_MS = 3 * 60 * 1000; // 3 minutes

    function _resetIdle() {
        clearTimeout(_idleTimer);
        _idleTimer = setTimeout(_onIdle, IDLE_MS);
    }

    function _onIdle() {
        if (STATE.easterEggs.indexOf('idle') > -1) return;
        const toast = document.createElement('div');
        toast.className = 'toast toast-amber';
        toast.style.cssText = 'bottom:80px;animation:idleNudge 1s ease infinite;cursor:pointer;';
        toast.innerHTML = '⏳ Still there? Your context window is getting cold. <strong>Click for TC.</strong>';
        toast.id = 'idle-toast';
        toast.onclick = function () {
            discoverEasterEgg('idle');
            toast.remove();
            clearTimeout(_idleTimer);
        };
        document.body.appendChild(toast);
        setTimeout(function () { if (document.getElementById('idle-toast')) toast.remove(); }, 30000);
    }

    ['click', 'mousemove', 'keydown', 'scroll'].forEach(function (evt) {
        document.addEventListener(evt, _resetIdle, { passive: true });
    });
    _resetIdle();

    // ---- Easter egg: Rage click detection ----
    const _clickTimes = {};

    function trackClick(btnId) {
        const now = Date.now();
        if (!_clickTimes[btnId]) _clickTimes[btnId] = [];
        _clickTimes[btnId].push(now);
        // Keep last 3 clicks
        _clickTimes[btnId] = _clickTimes[btnId].slice(-3);
        const times = _clickTimes[btnId];
        if (times.length === 3 && (times[2] - times[0]) < 1500) {
            discoverEasterEgg('rageClick');
            showToast('Okay, okay. Rage clicking noted. Here\'s 15 TC.', 'amber');
            _clickTimes[btnId] = [];
        }
    }

    // ---- Expose ----

    return {
        TIERS,
        BADGE_DEF,
        EASTER_EGG_DEF,
        TC_AWARDS,
        awardTC,
        awardBadge,
        recordCorrectAnswer,
        recordWrongAnswer,
        markQuestionOpen,
        discoverEasterEgg,
        completeOptionalActivity,
        completeSection,
        getProgressPercent,
        showToast,
        showBadgeOverlay,
        onLogoClick,
        trackClick,
        updateHeader: _updateHeader
    };
})();

// Global close overlay handler
function closeOverlay() {
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.2s ease forwards';
        setTimeout(function () {
            overlay.classList.add('hidden');
            overlay.style.animation = '';
        }, 200);
    }
}
