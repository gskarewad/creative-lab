/**
 * Ocean Journey - Main Application Controller (Mobile-Optimized)
 * Handles Three.js WebGL pipeline, dynamic responsive scaling for Galaxy S25,
 * touch gestures (single-tap HUD toggle, double-tap seek, thumb scrubbing),
 * live marine companion telemetry, and deterministic timeline rendering.
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
    let canvasContainerEl, cinemaStageEl;
    let titleMainEl, titleSubEl, titleBadgeEl, titleCardEl, fadeOverlayEl;
    let tapSurfaceEl, gestureLeftEl, gestureRightEl;
    let telemetryDepthEl, telemetryTempEl, telemetryPhaseEl, telemetrySubphaseEl, telemetryZoneEl;
    let playBtn, playIcon, pauseIcon, scrubSlider, timeDisplay, speedBtn, audioBtn, fsBtn, controlBar;
    let hideControlsTimeout = null;

    // Gesture tracking state
    let lastTapTime = 0;
    let isTouchDragging = false;
    let touchStartX = 0;
    let touchStartTime = 0;

    function init() {
        cinemaStageEl = document.getElementById('cinema-stage');
        canvasContainerEl = document.getElementById('canvas-container');

        titleCardEl = document.getElementById('title-card');
        titleMainEl = document.getElementById('title-main');
        titleSubEl = document.getElementById('title-sub');
        titleBadgeEl = document.getElementById('title-badge');
        fadeOverlayEl = document.getElementById('fade-overlay');

        tapSurfaceEl = document.getElementById('tap-surface');
        gestureLeftEl = document.getElementById('gesture-left');
        gestureRightEl = document.getElementById('gesture-right');

        telemetryDepthEl = document.getElementById('telemetry-depth');
        telemetryTempEl = document.getElementById('telemetry-temp');
        telemetryPhaseEl = document.getElementById('telemetry-phase');
        telemetrySubphaseEl = document.getElementById('telemetry-subphase');
        telemetryZoneEl = document.getElementById('telemetry-zone');

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
        scene.background = new THREE.Color(0x010c1c);
        scene.fog = new THREE.FogExp2(0x021326, 0.0135);

        // Perspective Camera
        camera = new THREE.PerspectiveCamera(48, 16 / 9, 0.5, 450);
        camera.position.set(18, -8, 22);

        // Mobile-Optimized WebGL Renderer
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true
        });

        // Galaxy S25 / mobile GPU optimization: clamp pixel ratio to 1.5 to guarantee locked 60fps
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        renderer.setPixelRatio(dpr);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        canvasContainerEl.appendChild(renderer.domElement);

        // Initialize Procedural Ocean & Whale Systems
        ocean = OceanEnvironment.createOcean(scene);
        whale = WhaleSystem.createWhale();
        scene.add(whale.group);

        // Expose renderAtTime globally for deterministic inspection
        window.renderAtTime = renderAtTime;

        // Setup Responsive Viewport & Touch Listeners
        setupEventListeners();
        setupTouchGestures();
        handleResize();

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', () => {
            setTimeout(handleResize, 100);
        });

        // Initial render frame
        renderAtTime(0.0);

        // Start animation loop
        requestAnimationFrame(animate);
    }

    /**
     * Deterministically renders the visual state and mobile telemetry at any given timestamp.
     * @param {number} timeSeconds - Target time in seconds [0.0, 20.0]
     */
    function renderAtTime(timeSeconds) {
        currentTime = Math.max(0, Math.min(DURATION, timeSeconds));

        // 1. Update Whale Transform & Swimming Dorsoventral Wave
        const whaleState = CinematicDirector.getWhaleTransformAtTime(currentTime);
        whale.group.position.copy(whaleState.pos);
        whale.group.rotation.set(whaleState.rot.x, whaleState.rot.y, whaleState.rot.z);
        whale.update(currentTime);

        // 2. Update Camera Splines & Underwater Buoyancy
        const camState = CinematicDirector.getCameraTransformAtTime(currentTime, whaleState.pos);
        camera.position.copy(camState.camPos);
        camera.lookAt(camState.camTarget);
        camera.fov = camState.fov;
        camera.updateProjectionMatrix();

        // 3. Update Volumetric Rays, Waves, Particles, Shoal, Bubbles
        ocean.update(currentTime);

        // 4. Update Documentary Overlays & Fade Transition
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

        // 5. Update Mobile Portrait Companion Telemetry Deck
        if (CinematicDirector.getTelemetryAtTime) {
            const telemetry = CinematicDirector.getTelemetryAtTime(currentTime);
            if (telemetryDepthEl) telemetryDepthEl.textContent = `-${telemetry.depth} m`;
            if (telemetryTempEl) telemetryTempEl.textContent = `${telemetry.temp} °C`;
            if (telemetryPhaseEl) telemetryPhaseEl.textContent = telemetry.phase;
            if (telemetrySubphaseEl) telemetrySubphaseEl.textContent = telemetry.subphase;
            if (telemetryZoneEl) {
                telemetryZoneEl.textContent = telemetry.depth > 200 ? 'Bathypelagic Abyss' : 'Sunlit Epipelagic';
            }
        }

        // 6. Update Touch Scrubber & Timecode Readout
        if (scrubSlider && !scrubSlider.matches(':active') && !isTouchDragging) {
            scrubSlider.value = (currentTime / DURATION) * 1000;
        }
        if (timeDisplay) {
            timeDisplay.textContent = formatTime(currentTime) + ' / ' + formatTime(DURATION);
        }

        // 7. Render Three.js Scene
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

    // Dynamic Sizing tailored for Mobile Screens & Desktops
    function handleResize() {
        if (!canvasContainerEl || !renderer || !camera) return;

        const w = canvasContainerEl.clientWidth;
        const h = canvasContainerEl.clientHeight;

        if (w > 0 && h > 0) {
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }

        // Auto-show controls if portrait orientation
        const isPortrait = window.innerHeight > window.innerWidth;
        if (isPortrait && controlBar) {
            controlBar.classList.add('visible');
        }
    }

    // Mobile Touch Gestures & Interactive Controls
    function setupTouchGestures() {
        if (!tapSurfaceEl) return;

        let tapTimeout = null;

        tapSurfaceEl.addEventListener('click', (e) => {
            const now = performance.now();
            const timeSinceLastTap = now - lastTapTime;
            const rect = tapSurfaceEl.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const widthFraction = clickX / rect.width;

            if (timeSinceLastTap < 320) {
                // Double Tap Detected!
                if (tapTimeout) clearTimeout(tapTimeout);

                if (widthFraction < 0.45) {
                    // Double Tap Left: Seek -3 seconds
                    triggerGestureIndicator(gestureLeftEl);
                    currentTime = Math.max(0, currentTime - 3.0);
                    renderAtTime(currentTime);
                } else if (widthFraction > 0.55) {
                    // Double Tap Right: Seek +3 seconds
                    triggerGestureIndicator(gestureRightEl);
                    currentTime = Math.min(DURATION, currentTime + 3.0);
                    renderAtTime(currentTime);
                } else {
                    // Double Tap Center: Toggle Play / Pause
                    togglePlayPause();
                }
                lastTapTime = 0;
            } else {
                // Single Tap Candidate: wait to distinguish from double-tap
                lastTapTime = now;
                tapTimeout = setTimeout(() => {
                    // Toggle Control Bar Visibility
                    toggleControlsVisibility();
                }, 320);
            }
        });

        // Touch Swipe Gestures for fast scrub
        tapSurfaceEl.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartTime = currentTime;
                isTouchDragging = false;
            }
        }, { passive: true });

        tapSurfaceEl.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
                const diffX = e.touches[0].clientX - touchStartX;
                if (Math.abs(diffX) > 15) {
                    isTouchDragging = true;
                    // 200px drag = 5 seconds
                    const seekDelta = (diffX / 200) * 5.0;
                    const targetTime = Math.max(0, Math.min(DURATION, touchStartTime + seekDelta));
                    renderAtTime(targetTime);
                }
            }
        }, { passive: true });

        tapSurfaceEl.addEventListener('touchend', () => {
            if (isTouchDragging) {
                isTouchDragging = false;
            }
        });
    }

    function triggerGestureIndicator(el) {
        if (!el) return;
        el.classList.remove('active');
        void el.offsetWidth; // Force reflow
        el.classList.add('active');
        setTimeout(() => el.classList.remove('active'), 600);
    }

    function togglePlayPause() {
        isPlaying = !isPlaying;
        playIcon.style.display = isPlaying ? 'none' : 'block';
        pauseIcon.style.display = isPlaying ? 'block' : 'none';
        showControlsBriefly();
    }

    function toggleControlsVisibility() {
        const isPortrait = window.innerHeight > window.innerWidth;
        if (isPortrait) return; // Keep visible in portrait for convenience

        if (controlBar.classList.contains('visible')) {
            controlBar.classList.remove('visible');
            if (hideControlsTimeout) clearTimeout(hideControlsTimeout);
        } else {
            showControlsBriefly();
        }
    }

    function showControlsBriefly() {
        controlBar.classList.add('visible');
        if (hideControlsTimeout) clearTimeout(hideControlsTimeout);

        const isPortrait = window.innerHeight > window.innerWidth;
        if (!isPortrait && isPlaying) {
            hideControlsTimeout = setTimeout(() => {
                if (isPlaying) {
                    controlBar.classList.remove('visible');
                }
            }, 3000);
        }
    }

    function setupEventListeners() {
        // Play / Pause Button
        playBtn.addEventListener('click', togglePlayPause);

        // Scrubber Slider
        scrubSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            const targetTime = (val / 1000) * DURATION;
            isPlaying = false;
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            renderAtTime(targetTime);
            showControlsBriefly();
        });

        // Playback Speed Toggle
        const speeds = [1.0, 0.5, 0.25, 2.0];
        let speedIdx = 0;
        speedBtn.addEventListener('click', () => {
            speedIdx = (speedIdx + 1) % speeds.length;
            playbackSpeed = speeds[speedIdx];
            speedBtn.textContent = `${playbackSpeed}x`;
            showControlsBriefly();
        });

        // Ambient Soundscape Synthesizer
        audioBtn.addEventListener('click', () => {
            const active = OceanAudio.toggle();
            audioBtn.classList.toggle('active', active);
            audioBtn.title = active ? 'Soundscape: ON' : 'Soundscape: OFF';
            showControlsBriefly();
        });

        // Fullscreen Toggle
        fsBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
            showControlsBriefly();
        });

        // Keyboard Controls
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                togglePlayPause();
            } else if (e.code === 'ArrowRight') {
                isPlaying = false;
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
                renderAtTime(Math.min(DURATION, currentTime + 0.5));
                showControlsBriefly();
            } else if (e.code === 'ArrowLeft') {
                isPlaying = false;
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
                renderAtTime(Math.max(0, currentTime - 0.5));
                showControlsBriefly();
            }
        });

        // Mouse activity in landscape/desktop
        window.addEventListener('mousemove', () => {
            const isPortrait = window.innerHeight > window.innerWidth;
            if (!isPortrait) showControlsBriefly();
        });

        showControlsBriefly();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
