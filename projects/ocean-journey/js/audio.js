/**
 * Ocean Journey - Procedural Underwater Soundscape Synthesizer
 * Uses Web Audio API to synthesize a deep oceanic ambient sub-drone,
 * water swell resonance, and distant haunting whale vocalization harmonics.
 * Completely local, zero external audio assets.
 */

window.OceanAudio = (function() {
    'use strict';

    let audioCtx = null;
    let isPlaying = false;
    let masterGain = null;
    let whaleInterval = null;

    function init() {
        if (audioCtx) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        audioCtx = new AudioContextClass();
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.45, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);

        // 1. Deep Ocean Sub-Drone (Low-frequency noise through steep resonant filter)
        const bufferSize = audioCtx.sampleRate * 2;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99 * b0 + white * 0.05;
            b1 = 0.96 * b1 + white * 0.11;
            b2 = 0.86 * b2 + white * 0.25;
            output[i] = (b0 + b1 + b2) * 0.35;
        }

        const noiseNode = audioCtx.createBufferSource();
        noiseNode.buffer = noiseBuffer;
        noiseNode.loop = true;

        const subFilter = audioCtx.createBiquadFilter();
        subFilter.type = 'lowpass';
        subFilter.frequency.setValueAtTime(75, audioCtx.currentTime);
        subFilter.Q.setValueAtTime(4.0, audioCtx.currentTime);

        // LFO for slow ocean swell modulation
        const lfo = audioCtx.createOscillator();
        lfo.frequency.setValueAtTime(0.08, audioCtx.currentTime); // ~12s wave swell
        const lfoGain = audioCtx.createGain();
        lfoGain.gain.setValueAtTime(25, audioCtx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(subFilter.frequency);

        noiseNode.connect(subFilter);
        subFilter.connect(masterGain);

        noiseNode.start();
        lfo.start();

        // 2. Schedule procedural distant whale vocalizations
        scheduleWhaleCalls();
    }

    function triggerWhaleCall() {
        if (!audioCtx || audioCtx.state !== 'running') return;

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();
        const callFilter = audioCtx.createBiquadFilter();

        // Cetacean frequency modulation
        const baseFreq = 95 + Math.random() * 60;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * (1.4 + Math.random() * 0.5), now + 1.8);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, now + 3.8);

        // Gentle envelope
        oscGain.gain.setValueAtTime(0.0001, now);
        oscGain.gain.linearRampToValueAtTime(0.12, now + 0.8);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);

        // Underwater acoustic chamber filter
        callFilter.type = 'bandpass';
        callFilter.frequency.setValueAtTime(220, now);
        callFilter.Q.setValueAtTime(3.5, now);

        osc.connect(callFilter);
        callFilter.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 4.5);
    }

    function scheduleWhaleCalls() {
        triggerWhaleCall();
        whaleInterval = setInterval(() => {
            if (isPlaying && audioCtx && audioCtx.state === 'running') {
                triggerWhaleCall();
            }
        }, 6500);
    }

    function toggle() {
        if (!audioCtx) {
            init();
            isPlaying = true;
            return true;
        }

        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
            isPlaying = true;
            return true;
        } else if (audioCtx.state === 'running') {
            audioCtx.suspend();
            isPlaying = false;
            return false;
        }
        return false;
    }

    return {
        init,
        toggle,
        isPlaying: () => isPlaying
    };
})();
