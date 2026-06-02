/* ============================================================
   XAPI.JS — xAPI (Tin Can) Stub
   Set XAPI_ENABLED = true and configure ENDPOINT/AUTH to activate.
   All statements are logged to console when disabled.
   ============================================================ */

const XAPI_ENABLED = false;

const xAPI = (function () {
    const ENDPOINT = ''; // e.g. 'https://lrs.example.com/xapi/'
    const AUTH     = ''; // e.g. 'Basic base64(key:secret)'

    const MODULE_ID = 'https://learning.corp/ai-tokenomics-module/v1';

    const ACTOR = {
        objectType: 'Agent',
        name: 'Learner',
        mbox: 'mailto:learner@example.com'
    };

    const VERBS = {
        launched:     { id: 'http://adlnet.gov/expapi/verbs/launched',     display: { 'en-AU': 'launched' } },
        experienced:  { id: 'http://adlnet.gov/expapi/verbs/experienced',  display: { 'en-AU': 'experienced' } },
        answered:     { id: 'http://adlnet.gov/expapi/verbs/answered',     display: { 'en-AU': 'answered' } },
        passed:       { id: 'http://adlnet.gov/expapi/verbs/passed',       display: { 'en-AU': 'passed' } },
        failed:       { id: 'http://adlnet.gov/expapi/verbs/failed',       display: { 'en-AU': 'failed' } },
        completed:    { id: 'http://adlnet.gov/expapi/verbs/completed',    display: { 'en-AU': 'completed' } },
        progressed:   { id: 'http://adlnet.gov/expapi/verbs/progressed',   display: { 'en-AU': 'progressed' } },
        interacted:   { id: 'http://adlnet.gov/expapi/verbs/interacted',   display: { 'en-AU': 'interacted' } },
        earned:       { id: 'http://www.tincanapi.com/verbs/earned',       display: { 'en-AU': 'earned' } }
    };

    function _build(verbKey, objId, objName, resultObj) {
        const stmt = {
            actor: ACTOR,
            verb: VERBS[verbKey] || VERBS.experienced,
            object: {
                objectType: 'Activity',
                id: `${MODULE_ID}/${objId}`,
                definition: {
                    name: { 'en-AU': objName },
                    type: 'http://adlnet.gov/expapi/activities/module'
                }
            },
            context: {
                contextActivities: {
                    parent: [{ objectType: 'Activity', id: MODULE_ID }]
                }
            },
            timestamp: new Date().toISOString()
        };
        if (resultObj) stmt.result = resultObj;
        return stmt;
    }

    function _send(stmt) {
        if (!XAPI_ENABLED) {
            console.log('[xAPI stub]', stmt.verb.display['en-AU'], stmt.object.id, stmt.result || '');
            return;
        }

        try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', ENDPOINT + 'statements', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', AUTH);
            xhr.setRequestHeader('X-Experience-API-Version', '1.0.3');
            xhr.send(JSON.stringify(stmt));
        } catch (e) {
            console.warn('[xAPI] Send failed:', e.message);
        }
    }

    function sendStatement(verbKey, objectId, objectName, result) {
        _send(_build(verbKey, objectId, objectName, result));
    }

    function sectionCompleted(sectionId, sectionName, durationSeconds) {
        sendStatement('completed', `section/${sectionId}`, sectionName, {
            duration: `PT${Math.floor(durationSeconds)}S`,
            completion: true
        });
    }

    function questionAnswered(questionId, correct, score) {
        sendStatement('answered', `question/${questionId}`, questionId, {
            success: correct,
            score: { scaled: score }
        });
    }

    function assessmentPassed(scoreRaw, scoreMax) {
        sendStatement('passed', 'assessment', 'AI Tokenomics Assessment', {
            success: true,
            score: { raw: scoreRaw, max: scoreMax, scaled: scoreRaw / scoreMax },
            completion: true
        });
    }

    function assessmentFailed(scoreRaw, scoreMax) {
        sendStatement('failed', 'assessment', 'AI Tokenomics Assessment', {
            success: false,
            score: { raw: scoreRaw, max: scoreMax, scaled: scoreRaw / scoreMax },
            completion: false
        });
    }

    function badgeEarned(badgeName) {
        sendStatement('earned', `badge/${badgeName.replace(/\s+/g, '-').toLowerCase()}`, badgeName, {
            completion: true
        });
    }

    function moduleLaunched() {
        sendStatement('launched', 'module', 'AI Tokenomics: Cost, Consumption and Control');
    }

    return {
        sendStatement,
        sectionCompleted,
        questionAnswered,
        assessmentPassed,
        assessmentFailed,
        badgeEarned,
        moduleLaunched,
        VERBS
    };
})();
