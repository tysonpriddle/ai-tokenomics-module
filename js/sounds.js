/* ============================================================
   SOUNDS.JS — Synthesised audio feedback via Web Audio API
   No external files. All tones generated programmatically.
   Respects user mute preference stored in localStorage.
   ============================================================ */

const SOUND = (function () {

    let _ctx = null;
    let _muted = localStorage.getItem('tokenomics-mute') === 'true';

    function ctx() {
        if (!_ctx) {
            try {
                _ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) { return null; }
        }
        if (_ctx.state === 'suspended') _ctx.resume();
        return _ctx;
    }

    function tone(freq, type, duration, vol, delay) {
        if (_muted) return;
        var c = ctx();
        if (!c) return;
        try {
            var osc  = c.createOscillator();
            var gain = c.createGain();
            osc.connect(gain);
            gain.connect(c.destination);
            osc.type = type || 'sine';
            var t = c.currentTime + (delay || 0);
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(vol || 0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
            osc.start(t);
            osc.stop(t + duration + 0.01);
        } catch (e) {}
    }

    function noise(duration, vol, delay) {
        if (_muted) return;
        var c = ctx();
        if (!c) return;
        try {
            var bufSize = Math.ceil(c.sampleRate * duration);
            var buf  = c.createBuffer(1, bufSize, c.sampleRate);
            var data = buf.getChannelData(0);
            for (var i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
            var src  = c.createBufferSource();
            src.buffer = buf;
            var gain = c.createGain();
            src.connect(gain);
            gain.connect(c.destination);
            var t = c.currentTime + (delay || 0);
            gain.gain.setValueAtTime(vol || 0.06, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
            src.start(t);
        } catch (e) {}
    }

    // ---- Sound definitions ----

    var SOUNDS = {

        // Bright ascending double-ding for correct answers
        correct: function () {
            tone(880,  'sine', 0.08, 0.10);
            tone(1320, 'sine', 0.14, 0.08, 0.07);
            tone(1760, 'sine', 0.22, 0.06, 0.14);
        },

        // Low descending buzz for wrong answers
        incorrect: function () {
            tone(220, 'sawtooth', 0.10, 0.07);
            tone(175, 'sawtooth', 0.14, 0.05, 0.09);
        },

        // Soft pop for scroll-unlock
        unlock: function () {
            noise(0.03, 0.05);
            tone(680, 'sine', 0.07, 0.05, 0.02);
            tone(900, 'sine', 0.05, 0.03, 0.05);
        },

        // Ascending sparkle arpeggio for badge awards
        badge: function () {
            tone(523,  'sine', 0.12, 0.10);           // C5
            tone(659,  'sine', 0.12, 0.09, 0.10);     // E5
            tone(784,  'sine', 0.12, 0.08, 0.20);     // G5
            tone(1047, 'sine', 0.22, 0.07, 0.30);     // C6
        },

        // Full triumph fanfare for tier-up
        tierUp: function () {
            tone(392,  'sine', 0.16, 0.10);           // G4
            tone(523,  'sine', 0.16, 0.09, 0.14);     // C5
            tone(659,  'sine', 0.16, 0.08, 0.28);     // E5
            tone(784,  'sine', 0.16, 0.08, 0.42);     // G5
            tone(1047, 'sine', 0.35, 0.07, 0.56);     // C6
            // Harmony on last note
            tone(1319, 'sine', 0.20, 0.04, 0.56);     // E6
        },

        // Ultra-subtle click for navigation
        navigate: function () {
            noise(0.015, 0.03);
            tone(500, 'sine', 0.03, 0.03, 0.01);
        },

        // Soft blip for UI interactions (pill selector etc.)
        click: function () {
            tone(440, 'sine', 0.04, 0.05);
        },

        // Warm two-note resolution — section complete
        sectionComplete: function () {
            tone(523, 'sine', 0.14, 0.08);           // C5
            tone(659, 'sine', 0.22, 0.07, 0.16);     // E5
        }
    };

    // ---- Public API ----

    function play(name) {
        if (_muted) return;
        if (SOUNDS[name]) {
            try { SOUNDS[name](); } catch (e) {}
        }
    }

    function toggleMute() {
        _muted = !_muted;
        localStorage.setItem('tokenomics-mute', _muted);
        return _muted;
    }

    function isMuted() { return _muted; }

    return { play: play, toggleMute: toggleMute, isMuted: isMuted };

}());
