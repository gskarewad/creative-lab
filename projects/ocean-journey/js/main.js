/**
 * Ocean Journey - Main Application Controller
 * Handles Three.js rendering pipeline, deterministic timeline orchestration,
 * responsive 1920x1080 stage scaling, interactive scrubber controls,
 * and exposes window.renderAtTime(timeSeconds) for deterministic frame rendering.
 */

(function() {
    'use strict';

    // Application State
    let scene, camera, renderer;
    let whale, ocean;
    let isPlaying = true;
    let currentTime = 0.0;
    const DURATION = 20.0;
    let lastTimestamp = performance.now();
    let playbackSpeed = 1.0;

    // DOM Elements
    let containerEl, canvasContainerEl, letterboxTopEl, letterboxBottomEl;
    let titleMainEl, titleSubEl, titleBadgeEl, titleCardEl, fadeOverlayEl;
    let playBtn, playIcon, pauseIcon, scrubSlider, timeDisplay, speedBtn, audioBtn, fsBtn, controlBar;
    let hideControlsTimeout = null;

    function init() {
        containerEl = document.getElementById('cinema-stage');
        canvasContainerEl = document.getElementById('canvas-container');
        letterboxTopEl = document.querySelector('.letterbox-bar.top');
        letterboxBottomEl = document.querySelector('.letterbox-bar.bottom');

        titleCardEl = document.getElementById('title-card');
        titleMainEl = document.getElementById('title-main');
        titleSubEl = document.getElementById('title-sub');
        titleBadgeEl = document.getElementById('title-badge');
        fadeOverlayEl = document.getElementById('fade-overlay');

        playBtn = document.getElementById('play-btn');
        playIcon = document.getElementById('play-icon');
        pauseIcon = document.getElementById('pause-icon');
        scrubSlider = document.getElementById('scrub-slider');
        timeDisplay = document.getElementById('time-display');
        speedBtn = document.getElementById('speed-btn');
        audioBtn = document.getElementById('audio-btn');
        fsBtn = document.getElementById('fs-btn');
        controlBar = document.getElementById('control-bar');

        // Setup Three.js Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x020d1c);
        scene.fog = new THREE.FogExp2(0x021326, 0.0135);

        // Camera setup (Base 16:9 aspect)
        camera = new THREE.PerspectiveCamera(48, 1920 / 1080, 0.5, 450);
        camera.position.set(18, -8, 22);

        // Renderer with High Dynamic Range & Mobile Optimization
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true
        });
        renderer.setSize(1920, 1080);
        // Galaxy S25 has high DPR screen; cap at 1.5 to guarantee solid 60fps
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        renderer.setPixelRatio(dpr);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        canvasContainerEl.appendChild(renderer.domElement);

        // Initialize Systems
        ocean = OceanEnvironment.createOcean(scene);
        whale = WhaleSystem.createWhale();
        scene.add(whale.group);

        // Expose renderAtTime globally
        window.renderAtTime = renderAtTime;

        // Setup Events & UI Listeners
        setupEventListeners();
        handleResize();
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        // Render initial frame
        renderAtTime(0.0);

        // Start requestAnimationFrame loop
        requestAnimationFrame(animate);
    }

    /**
     * Deterministically renders the scene and overlays at a specific timestamp.
     * @param {number} timeSeconds - Target time in seconds [0.0, 20.0]
     */
    function renderAtTime(timeSeconds) {
        currentTime = Math.max(0, Math.min(DURATION, timeSeconds));

        // 1. Update Whale Transform & Swimming Deformation
        const whaleState = CinematicDirector.getWhaleTransformAtTime(currentTime);
        whale.group.position.copy(whaleState.pos);
        whale.group.rotation.set(whaleState.rot.x, whaleState.rot.y, whaleState.rot.z);
        whale.update(currentTime);

        // 2. Update Camera Choreography
        const camState = CinematicDirector.getCameraTransformAtTime(currentTime, whaleState.pos);
        camera.position.copy(camState.camPos);
        camera.lookAt(camState.camTarget);
        camera.fov = camState.fov;
        camera.updateProjectionMatrix();

        // 3. Update Ocean Atmospheric Elements
        ocean.update(currentTime);

        // 4. Update Documentary Typographic Overlays & Fade-to-Black
        const overlayState = CinematicDirector.getOverlayState(currentTime);
        if (overlayState.cue && overlayState.opacity > 0.01) {
            titleCardEl.style.display = 'block';
            titleCardEl.style.opacity = overlayState.opacity.toFixed(3);
            titleMainEl.textContent = overlayState.cue.main;
            titleSubEl.textContent = overlayState.cue.sub;
            titleBadgeEl.textContent = overlayState.cue.category;
        } else {
            titleCardEl.style.opacity = '0';
        }

        if (fadeOverlayEl) {
            fadeOverlayEl.style.opacity = overlayState.fadeToBlack.toFixed(3);
        }

        // 5. Update UI Scrubber & Timer Display
        if (scrubSlider && !scrubSlider.matches(':active')) {
            scrubSlider.value = (currentTime / DURATION) * 1000;
        }
        if (timeDisplay) {
            timeDisplay.textContent = formatTime(currentTime) + ' / ' + formatTime(DURATION);
        }

        // 6. Execute Render
        renderer.render(scene, camera);
    }

    function formatTime(seconds) {
        const s = Math.floor(seconds);
        const ms = Math.floor((seconds - s) * 10);
        const mm = String(Math.floor(s / 60)).padStart(2, '0');
        const ss = String(s % 60).padStart(2, '0');
        return `${mm}:${ss}.${ms}`;
    }

    function animate(timestamp) {
        const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
        lastTimestamp = timestamp;

        if (isPlaying) {
            currentTime += delta * playbackSpeed;
            if (currentTime >= DURATION) {
                currentTime = 0.0; // Loop playback
            }
            renderAtTime(currentTime);
        }

        requestAnimationFrame(animate);
    }

    // Proportional 1920x1080 Stage Resizing for Mobile Chrome
    function handleResize() {
        const windowW = window.innerWidth;
        const windowH = window.innerHeight;

        const targetAspect = 1920 / 1080;
        const screenAspect = windowW / windowH;

        let scale;
        if (screenAspect > targetAspect) {
            scale = windowH / 1080;
        } else {
            scale = windowW / 1920;
        }

        containerEl.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }

    function setupEventListeners() {
        // Play / Pause Toggle
        playBtn.addEventListener('click', () => {
            isPlaying = !isPlaying;
            playIcon.style.display = isPlaying ? 'none' : 'block';
            pauseIcon.style.display = isPlaying ? 'block' : 'none';
        });

        // Scrub Slider
        scrubSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            const targetTime = (val / 1000) * DURATION;
            isPlaying = false;
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            renderAtTime(targetTime);
        });

        // Playback Speed Toggle
        const speeds = [1.0, 0.5, 0.25, 2.0];
        let speedIdx = 0;
        speedBtn.addEventListener('click', () => {
            speedIdx = (speedIdx + 1) % speeds.length;
            playbackSpeed = speeds[speedIdx];
            speedBtn.textContent = `${playbackSpeed}x`;
        });

        // Soundscape Synthesizer Toggle
        audioBtn.addEventListener('click', () => {
            const active = OceanAudio.toggle();
            audioBtn.classList.toggle('active', active);
            audioBtn.title = active ? 'Soundscape: ON' : 'Soundscape: OFF';
        });

        // Fullscreen Toggle
        fsBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        });

        // Keyboard Controls (Space to Play/Pause, Left/Right Arrow to seek)
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                playBtn.click();
            } else if (e.code === 'ArrowRight') {
                isPlaying = false;
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
                renderAtTime(Math.min(DURATION, currentTime + 0.5));
            } else if (e.code === 'ArrowLeft') {
                isPlaying = false;
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
                renderAtTime(Math.max(0, currentTime - 0.5));
            }
        });

        // Auto-hiding control bar for uninterrupted cinematic viewing
        function showControls() {
            controlBar.classList.add('visible');
            if (hideControlsTimeout) clearTimeout(hideControlsTimeout);
            hideControlsTimeout = setTimeout(() => {
                if (isPlaying) {
                    controlBar.classList.remove('visible');
                }
            }, 2800);
        }

        window.addEventListener('mousemove', showControls);
        window.addEventListener('touchstart', showControls, { passive: true });
        showControls();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
