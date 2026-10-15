/**
 * Ocean Journey - Cinematic Director
 * Orchestrates camera choreography, whale 3D trajectory, lighting transitions,
 * and documentary on-screen typographic titles across the 20-second timeline.
 * 100% deterministic and seekable from any timestamp.
 */

window.CinematicDirector = (function() {
    'use strict';

    // Cubic Hermite / Smoothstep helper
    function smoothstep(edge0, edge1, x) {
        const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * t);
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function lerpVec3(out, v1, v2, t) {
        out.x = lerp(v1.x, v2.x, t);
        out.y = lerp(v1.y, v2.y, t);
        out.z = lerp(v1.z, v2.z, t);
        return out;
    }

    // Whale Keyframe Splines (Position and Rotation)
    const whaleKeyframes = [
        { t:  0.0, pos: new THREE.Vector3(-14.0, -22.0, -95.0), rot: new THREE.Vector3(0.18,  0.15, -0.05) },
        { t:  4.5, pos: new THREE.Vector3( -7.5, -14.0, -50.0), rot: new THREE.Vector3(0.20,  0.12, -0.04) },
        { t:  9.5, pos: new THREE.Vector3(  0.0,  -4.5,   0.0), rot: new THREE.Vector3(0.22,  0.08,  0.02) },
        { t: 14.5, pos: new THREE.Vector3(  8.5,   6.5,  48.0), rot: new THREE.Vector3(0.35, -0.05,  0.08) },
        { t: 20.0, pos: new THREE.Vector3( 15.0,  26.0,  98.0), rot: new THREE.Vector3(0.42, -0.08,  0.05) }
    ];

    function getWhaleTransformAtTime(timeSeconds) {
        const t = Math.max(0, Math.min(20, timeSeconds));
        let idx = 0;
        for (let i = 0; i < whaleKeyframes.length - 1; i++) {
            if (t >= whaleKeyframes[i].t && t <= whaleKeyframes[i + 1].t) {
                idx = i;
                break;
            }
        }
        const kf1 = whaleKeyframes[idx];
        const kf2 = whaleKeyframes[idx + 1];
        const segProgress = (t - kf1.t) / (kf2.t - kf1.t);
        const smoothT = smoothstep(0, 1, segProgress);

        const pos = new THREE.Vector3();
        lerpVec3(pos, kf1.pos, kf2.pos, smoothT);

        const rot = new THREE.Vector3();
        lerpVec3(rot, kf1.rot, kf2.rot, smoothT);

        return { pos, rot };
    }

    // Cinematic Camera Shots
    // Shot 1: Wide Deep Twilight Establishing (0s - 4.8s)
    // Shot 2: Diagonal Crane Swoop Reveal (4.8s - 9.5s)
    // Shot 3: Intimate Flank & Eye Close Pass (9.5s - 14.8s)
    // Shot 4: Low-angle Hero Ascent & Sunburst Ceiling (14.8s - 20.0s)
    function getCameraTransformAtTime(timeSeconds, whalePos) {
        const t = Math.max(0, Math.min(20, timeSeconds));
        const camPos = new THREE.Vector3();
        const camTarget = new THREE.Vector3();
        let fov = 48.0;

        if (t < 4.8) {
            // Shot 1: Wide deep ocean twilight
            const p = t / 4.8;
            const sp = smoothstep(0, 1, p);
            camPos.set(
                lerp(18.0, 14.0, sp),
                lerp(-8.0, -9.5, sp),
                lerp(22.0, 15.0, sp)
            );
            // Look slightly ahead of the distant rising whale
            camTarget.set(
                lerp(whalePos.x * 0.7, whalePos.x, sp),
                lerp(whalePos.y + 3.0, whalePos.y + 1.0, sp),
                whalePos.z + 5.0
            );
            fov = 52.0 - p * 3.0;
        } else if (t < 9.5) {
            // Shot 2: Diagonal sweeping crane
            const p = (t - 4.8) / (9.5 - 4.8);
            const sp = smoothstep(0, 1, p);
            camPos.set(
                lerp(14.0, -10.5, sp),
                lerp(-9.5, -4.0, sp),
                lerp(15.0, 6.0, sp)
            );
            camTarget.set(
                whalePos.x,
                whalePos.y + 1.5,
                whalePos.z + 12.0 // Look at rostrum and eye entering sunbeam
            );
            fov = 49.0 - p * 4.0;
        } else if (t < 14.8) {
            // Shot 3: Intimate Close Pass (Eye, Throat Pleats, Pectoral Fin)
            const p = (t - 9.5) / (14.8 - 9.5);
            const sp = smoothstep(0, 1, p);

            // Gliding right along the starboard flank
            camPos.set(
                whalePos.x + lerp(7.8, 9.8, sp),
                whalePos.y + lerp(-1.2, 2.5, sp),
                whalePos.z + lerp(10.0, -14.0, sp) // Camera drifts from head to tail
            );
            camTarget.set(
                whalePos.x + 0.8,
                whalePos.y - 0.5,
                whalePos.z + lerp(4.0, -12.0, sp)
            );
            fov = 44.0 + sp * 3.0;
        } else {
            // Shot 4: Low-Angle Epic Ascent into the Blinding Sunburst
            const p = (t - 14.8) / (20.0 - 14.8);
            const sp = smoothstep(0, 1, p);

            camPos.set(
                lerp(4.0, 2.0, sp),
                lerp(-18.0, -22.0, sp),
                lerp(35.0, 50.0, sp)
            );
            // Looking straight up through the water column into the sunburst
            camTarget.set(
                whalePos.x * 0.8,
                whalePos.y + 12.0,
                whalePos.z + 8.0
            );
            fov = 55.0 + sp * 5.0;
        }

        // Add subtle underwater camera buoyancy float
        camPos.x += Math.sin(t * 0.75) * 0.35;
        camPos.y += Math.cos(t * 0.65) * 0.25;

        return { camPos, camTarget, fov };
    }

    // Documentary Subtitles & Titles Keyframing
    const titleCues = [
        {
            start: 0.6,
            end: 4.6,
            main: "OCEAN JOURNEY",
            sub: "THE ABYSSAL GIANT",
            category: "SERIES PROLOGUE"
        },
        {
            start: 5.4,
            end: 9.2,
            main: "PACIFIC BLUE WHALE",
            sub: "Balaenoptera musculus  •  Length: 30 Metres",
            category: "SPECIES IDENTIFICATION"
        },
        {
            start: 10.0,
            end: 14.2,
            main: "LEVIATHAN OF THE DEEP",
            sub: "Ventral pleats expand to engulf tons of krill-laden seawater",
            category: "ANATOMICAL ADAPTATION"
        },
        {
            start: 15.2,
            end: 19.2,
            main: "ASCENT TO THE LIGHT",
            sub: "A quiet giant returning to the sunlit ceiling of the world",
            category: "BEHAVIORAL OBSERVATION"
        }
    ];

    function getOverlayState(timeSeconds) {
        const t = Math.max(0, Math.min(20, timeSeconds));
        let activeCue = null;
        let cueOpacity = 0.0;

        for (const cue of titleCues) {
            if (t >= cue.start && t <= cue.end) {
                activeCue = cue;
                const fadeIn = smoothstep(cue.start, cue.start + 0.8, t);
                const fadeOut = 1.0 - smoothstep(cue.end - 0.8, cue.end, t);
                cueOpacity = fadeIn * fadeOut;
                break;
            }
        }

        // Final scene fade-to-black transition at 19.2s - 20.0s
        let fadeToBlack = 0.0;
        if (t >= 19.2) {
            fadeToBlack = smoothstep(19.2, 20.0, t);
        }

        return {
            cue: activeCue,
            opacity: cueOpacity,
            fadeToBlack: fadeToBlack
        };
    }

    function getTelemetryAtTime(timeSeconds) {
        const t = Math.max(0, Math.min(20, timeSeconds));
        const wt = getWhaleTransformAtTime(t);
        // Vertical translation maps from abyssal bathypelagic depth (-420m) to epipelagic surface (-14m)
        const depthFraction = Math.max(0, Math.min(1, (wt.pos.y + 22.0) / 48.0));
        const depthMeters = Math.round(lerp(420, 14, depthFraction));
        const tempCelsius = (lerp(3.2, 19.8, depthFraction)).toFixed(1);

        let phase = "Abyssal Twilight";
        let subphase = "Stationary listening in deep bathypelagic waters";
        if (t > 4.8 && t <= 9.5) {
            phase = "Sunlight Reveal";
            subphase = "Entering downwelling surface god rays";
        } else if (t > 9.5 && t <= 14.8) {
            phase = "Intimate Flank Pass";
            subphase = "Ventral pleats & 5-meter pectoral foil";
        } else if (t > 14.8) {
            phase = "Surface Ascent";
            subphase = "Powering toward the sunburst boundary";
        }

        return {
            depth: depthMeters,
            temp: tempCelsius,
            phase: phase,
            subphase: subphase
        };
    }

    return {
        getWhaleTransformAtTime,
        getCameraTransformAtTime,
        getOverlayState,
        getTelemetryAtTime
    };
})();
