/* ============================================================
   SCORM.JS — SCORM 2004 4th Edition API Wrapper
   Full implementation: completion, success, score, suspend_data,
   session_time. Debug panel support via ?debug=true
   ============================================================ */

const SCORM = (function () {
    let _api = null;
    let _initialized = false;
    let _debugMode = false;
    const _log = [];
    window._scormStartTime = Date.now();

    function _entry(msg) {
        const ts = new Date().toISOString().substr(11, 12);
        const line = `[${ts}] ${msg}`;
        _log.push(line);
        if (_debugMode) {
            console.log('[SCORM]', msg);
            _updatePanel();
        }
    }

    function _updatePanel() {
        const el = document.getElementById('debug-log');
        if (el) {
            el.textContent = _log.slice(-80).join('\n');
            el.scrollTop = el.scrollHeight;
        }
    }

    function _findAPI(win) {
        let attempts = 0;
        while (!win.API_1484_11 && win.parent && win.parent !== win && attempts < 10) {
            attempts++;
            win = win.parent;
        }
        if (win.API_1484_11) return win.API_1484_11;
        // Also check opener for some LMS popup patterns
        if (window.opener && window.opener.API_1484_11) return window.opener.API_1484_11;
        return null;
    }

    function initialize() {
        _debugMode = window.location.search.indexOf('debug=true') > -1;

        if (_debugMode) {
            const panel = document.getElementById('debug-panel');
            if (panel) panel.classList.remove('hidden');
        }

        _api = _findAPI(window);

        if (!_api) {
            _entry('No SCORM 2004 API found — standalone / preview mode');
            return false;
        }

        const result = _api.Initialize('');
        _entry(`Initialize() → ${result}`);

        if (result === 'true' || result === true) {
            _initialized = true;
            const errCode = _api.GetLastError();
            _entry(`GetLastError() after init → ${errCode}`);
            return true;
        }

        _entry(`Initialize failed. Error: ${_api.GetLastError()}`);
        return false;
    }

    function terminate() {
        if (!_api || !_initialized) return false;
        // Persist session time before closing
        _setSessionTime(Math.floor((Date.now() - window._scormStartTime) / 1000));
        setValue('cmi.exit', 'suspend');
        const result = _api.Terminate('');
        _entry(`Terminate() → ${result}`);
        _initialized = false;
        return result === 'true' || result === true;
    }

    function getValue(element) {
        if (!_api || !_initialized) return '';
        const val = _api.GetValue(element);
        const err = _api.GetLastError();
        const preview = typeof val === 'string' ? val.substring(0, 60) : String(val);
        _entry(`GetValue(${element}) → "${preview}" err=${err}`);
        return val;
    }

    function setValue(element, value) {
        if (!_api || !_initialized) return false;
        const result = _api.SetValue(element, String(value));
        const err = _api.GetLastError();
        const preview = String(value).substring(0, 60);
        _entry(`SetValue(${element}, "${preview}") → ${result} err=${err}`);
        return result === 'true' || result === true;
    }

    function commit() {
        if (!_api || !_initialized) return false;
        const result = _api.Commit('');
        _entry(`Commit() → ${result}`);
        return result === 'true' || result === true;
    }

    function setCompletion(status) {
        // 'completed' | 'incomplete' | 'not attempted'
        setValue('cmi.completion_status', status);
        commit();
        _entry(`Completion status set to: ${status}`);
    }

    function setSuccess(status) {
        // 'passed' | 'failed' | 'unknown'
        setValue('cmi.success_status', status);
        commit();
        _entry(`Success status set to: ${status}`);
    }

    function setScore(raw, min, max) {
        setValue('cmi.score.raw', raw);
        setValue('cmi.score.min', min || 0);
        setValue('cmi.score.max', max || 100);
        const scaled = max > 0 ? (raw / max) : 0;
        setValue('cmi.score.scaled', scaled.toFixed(4));
        commit();
        _entry(`Score set: raw=${raw}, scaled=${scaled.toFixed(2)}`);
    }

    function _setSessionTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        const iso = `PT${h}H${m}M${s}S`;
        setValue('cmi.session_time', iso);
        _entry(`Session time: ${iso} (${seconds}s)`);
    }

    function saveSuspendData(obj) {
        let json;
        try {
            json = JSON.stringify(obj);
        } catch (e) {
            _entry('saveSuspendData: JSON.stringify error — ' + e.message);
            return false;
        }
        // SCORM 2004 suspend_data max is 64KB for most LMSes; SuccessFactors is 64000 chars
        if (json.length > 63000) {
            _entry(`WARN: suspend_data ${json.length} chars — approaching limit`);
        }
        setValue('cmi.suspend_data', json);
        commit();
        _entry(`suspend_data saved (${json.length} chars)`);
        return true;
    }

    function loadSuspendData() {
        const raw = getValue('cmi.suspend_data');
        if (!raw || raw === '' || raw === 'undefined') return null;
        try {
            return JSON.parse(raw);
        } catch (e) {
            _entry('loadSuspendData: parse error — ' + e.message);
            return null;
        }
    }

    function getLearnerName() {
        if (!_api || !_initialized) return '';
        return getValue('cmi.learner_name') || '';
    }

    function getLogs() {
        return _log.slice();
    }

    // Auto-terminate on page unload
    window.addEventListener('unload', function () {
        terminate();
    });

    // Also handle beforeunload to maximise data persistence
    window.addEventListener('beforeunload', function () {
        if (_api && _initialized) {
            _setSessionTime(Math.floor((Date.now() - window._scormStartTime) / 1000));
            _api.Commit('');
        }
    });

    return {
        initialize,
        terminate,
        getValue,
        setValue,
        commit,
        setCompletion,
        setSuccess,
        setScore,
        saveSuspendData,
        loadSuspendData,
        getLearnerName,
        getLogs,
        isInitialized: function () { return _initialized; }
    };
})();
