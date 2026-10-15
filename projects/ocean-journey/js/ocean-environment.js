/**
 * Ocean Journey - Ocean Environment & Atmospheric Visuals
 * Manages volumetric god rays, marine snow particles, schooling fish,
 * rising bubble trails, ocean surface ceiling, and depth lighting.
 */

window.OceanEnvironment = (function() {
    'use strict';

    function createOcean(scene) {
        const group = new THREE.Group();
        scene.add(group);

        // 1. Underwater Lighting
        const ambientLight = new THREE.AmbientLight(0x03182e, 1.2);
        group.add(ambientLight);

        const sunDirectional = new THREE.DirectionalLight(0xaef6ee, 2.2);
        sunDirectional.position.set(40, 90, 45);
        group.add(sunDirectional);

        const abyssalBounce = new THREE.DirectionalLight(0x010b18, 0.8);
        abyssalBounce.position.set(-20, -70, -20);
        group.add(abyssalBounce);

        // 2. Volumetric God Rays (Light Shafts)
        const godRayUniforms = {
            uTime: { value: 0.0 },
            uColor: { value: new THREE.Color(0x86e7df) },
            uBaseColor: { value: new THREE.Color(0x02162e) }
        };

        const godRayMaterial = new THREE.ShaderMaterial({
            uniforms: godRayUniforms,
            vertexShader: `
                precision highp float;
                varying vec2 vUv;
                varying vec3 vWorldPos;

                void main() {
                    vUv = uv;
                    vec4 worldPos = modelMatrix * vec4(position, 1.0);
                    vWorldPos = worldPos.xyz;
                    gl_Position = projectionMatrix * viewMatrix * worldPos;
                }
            `,
            fragmentShader: `
                precision highp float;
                uniform float uTime;
                uniform vec3 uColor;
                uniform vec3 uBaseColor;
                varying vec2 vUv;
                varying vec3 vWorldPos;

                void main() {
                    // Soft horizontal cone falloff
                    float xDist = abs(vUv.x - 0.5) * 2.0;
                    float beamShape = smoothstep(1.0, 0.05, xDist);

                    // Depth fade: brightest near ocean surface (top, vUv.y = 1.0), dissolving into deep abyss
                    float verticalFade = pow(vUv.y, 1.35);

                    // Multi-frequency wave shimmer modulation
                    float shimmer1 = sin(vUv.x * 24.0 + uTime * 0.95 + vUv.y * 12.0) * 0.5 + 0.5;
                    float shimmer2 = cos(vUv.x * 38.0 - uTime * 1.35 + vUv.y * 18.0) * 0.5 + 0.5;
                    float shimmer = mix(shimmer1, shimmer2, 0.45);

                    float alpha = beamShape * verticalFade * (0.45 + 0.55 * shimmer) * 0.38;

                    gl_FragColor = vec4(uColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        const godRaysGroup = new THREE.Group();
        // Create 8 intersecting angled light shaft fans
        const rayConfigs = [
            { pos: [ 10, 15,   5], rot: [-0.22, 0.35, -0.15], scale: [38, 110, 1] },
            { pos: [-12, 18, -10], rot: [-0.28, 0.15,  0.22], scale: [45, 125, 1] },
            { pos: [  2, 20, -25], rot: [-0.15, -0.3, -0.08], scale: [50, 130, 1] },
            { pos: [ 25, 12,  20], rot: [-0.35, 0.45, -0.28], scale: [42, 105, 1] },
            { pos: [-20, 14,  15], rot: [-0.18, 0.20,  0.18], scale: [35, 115, 1] },
            { pos: [  0, 22,   0], rot: [-0.25, 0.10, -0.12], scale: [55, 140, 1] },
            { pos: [-30, 16, -30], rot: [-0.30, -0.2,  0.25], scale: [40, 120, 1] },
            { pos: [ 18, 20, -15], rot: [-0.20, 0.25, -0.10], scale: [48, 125, 1] }
        ];

        rayConfigs.forEach(cfg => {
            const geom = new THREE.PlaneGeometry(1, 1, 16, 32);
            const mesh = new THREE.Mesh(geom, godRayMaterial);
            mesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
            mesh.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);
            mesh.scale.set(cfg.scale[0], cfg.scale[1], cfg.scale[2]);
            godRaysGroup.add(mesh);
        });
        group.add(godRaysGroup);

        // 3. Shimmering Ocean Surface Ceiling (Water-Air Boundary)
        const surfaceGeom = new THREE.PlaneGeometry(350, 350, 64, 64);
        surfaceGeom.rotateX(-Math.PI / 2);
        const surfaceUniforms = {
            uTime: { value: 0.0 },
            uSurfaceColor: { value: new THREE.Color(0xb2fcf5) },
            uDeepColor: { value: new THREE.Color(0x032845) }
        };
        const surfaceMaterial = new THREE.ShaderMaterial({
            uniforms: surfaceUniforms,
            vertexShader: `
                precision highp float;
                uniform float uTime;
                varying vec2 vUv;
                varying vec3 vWorldPos;

                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    // Realistic ocean swell waves
                    float wave1 = sin(pos.x * 0.05 + uTime * 0.8 + pos.z * 0.03) * 1.2;
                    float wave2 = cos(pos.x * 0.08 - uTime * 1.1 + pos.z * 0.06) * 0.8;
                    pos.y += wave1 + wave2;

                    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
                    vWorldPos = worldPos.xyz;
                    gl_Position = projectionMatrix * viewMatrix * worldPos;
                }
            `,
            fragmentShader: `
                precision highp float;
                uniform float uTime;
                uniform vec3 uSurfaceColor;
                uniform vec3 uDeepColor;
                varying vec2 vUv;
                varying vec3 vWorldPos;

                void main() {
                    // Central blinding sunburst disk visible looking up through the water
                    vec2 sunPos = vec2(30.0, 30.0);
                    float sunDist = length(vWorldPos.xz - sunPos);
                    float sunGlow = exp(-sunDist * 0.028) * 1.4;

                    // Rippling water caustics pattern
                    float rip = sin(vWorldPos.x * 0.2 + uTime * 0.6) * cos(vWorldPos.z * 0.2 + uTime * 0.8);
                    rip = pow(rip * 0.5 + 0.5, 3.0);

                    vec3 col = mix(uDeepColor, uSurfaceColor, clamp(sunGlow * 0.65 + rip * 0.35, 0.0, 1.0));
                    col += vec3(1.0, 1.0, 0.95) * pow(clamp(sunGlow - 0.3, 0.0, 2.0), 2.5);

                    gl_FragColor = vec4(col, 0.88);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });
        const surfaceMesh = new THREE.Mesh(surfaceGeom, surfaceMaterial);
        surfaceMesh.position.y = 48;
        group.add(surfaceMesh);

        // 4. Marine Snow & Plankton Particles
        const particleCount = 2800;
        const particleGeom = new THREE.BufferGeometry();
        const basePositions = new Float32Array(particleCount * 3);
        const particleScales = new Float32Array(particleCount);
        const particleSpeeds = new Float32Array(particleCount * 3);

        // Deterministic seeding for exact frame reproduction
        let pSeed = 1337;
        function pRnd() {
            pSeed = (pSeed * 16807) % 2147483647;
            return (pSeed - 1) / 2147483646;
        }

        for (let i = 0; i < particleCount; i++) {
            // Distribute in a cylinder / volume around camera action paths
            const theta = pRnd() * Math.PI * 2;
            const radius = 5 + pRnd() * 85;
            basePositions[i * 3 + 0] = Math.cos(theta) * radius;
            basePositions[i * 3 + 1] = -45 + pRnd() * 85;
            basePositions[i * 3 + 2] = Math.sin(theta) * radius - 15;

            particleScales[i] = 1.0 + pRnd() * 3.5;

            // Slow drift velocities
            particleSpeeds[i * 3 + 0] = (pRnd() - 0.5) * 0.4;
            particleSpeeds[i * 3 + 1] = 0.15 + pRnd() * 0.35; // Gentle upward/downward buoyancy
            particleSpeeds[i * 3 + 2] = (pRnd() - 0.5) * 0.4;
        }

        particleGeom.setAttribute('position', new THREE.BufferAttribute(basePositions.slice(), 3));
        particleGeom.setAttribute('scale', new THREE.BufferAttribute(particleScales, 1));

        const particleUniforms = {
            uTime: { value: 0.0 },
            uColor: { value: new THREE.Color(0xb8f0e8) }
        };

        const particleMaterial = new THREE.ShaderMaterial({
            uniforms: particleUniforms,
            vertexShader: `
                precision highp float;
                uniform float uTime;
                attribute float scale;
                varying float vAlpha;

                void main() {
                    vec3 pos = position;
                    // Deterministic drift with wrapping boundaries
                    pos.y += mod(uTime * 1.5, 90.0);
                    if (pos.y > 45.0) pos.y -= 90.0;

                    pos.x += sin(uTime * 0.35 + position.z * 0.1) * 2.0;
                    pos.z += cos(uTime * 0.28 + position.x * 0.1) * 2.0;

                    vec4 mvPosition = viewMatrix * modelMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;

                    // Size attenuation with camera distance (clamped for mobile WebGL)
                    float pointSz = scale * (180.0 / max(0.1, -mvPosition.z));
                    gl_PointSize = clamp(pointSz, 1.0, 64.0);

                    // Soft alpha fade at near and far planes
                    float dist = -mvPosition.z;
                    vAlpha = smoothstep(2.0, 12.0, dist) * smoothstep(110.0, 60.0, dist);
                }
            `,
            fragmentShader: `
                precision highp float;
                uniform vec3 uColor;
                varying float vAlpha;

                void main() {
                    // Soft circular bokeh particle
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    float dist = length(coord);
                    if (dist > 0.5) discard;

                    float glow = pow(1.0 - dist * 2.0, 1.8);
                    gl_FragColor = vec4(uColor, glow * vAlpha * 0.75);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const particles = new THREE.Points(particleGeom, particleMaterial);
        group.add(particles);

        // 4b. Macro Bokeh Plankton Flecks (Near-field optical bokeh circles)
        const macroCount = 140;
        const macroGeom = new THREE.BufferGeometry();
        const macroPositions = new Float32Array(macroCount * 3);
        const macroScales = new Float32Array(macroCount);
        for (let i = 0; i < macroCount; i++) {
            macroPositions[i * 3 + 0] = (pRnd() - 0.5) * 50;
            macroPositions[i * 3 + 1] = -35 + pRnd() * 70;
            macroPositions[i * 3 + 2] = -40 + pRnd() * 80;
            macroScales[i] = 18.0 + pRnd() * 26.0;
        }
        macroGeom.setAttribute('position', new THREE.BufferAttribute(macroPositions, 3));
        macroGeom.setAttribute('scale', new THREE.BufferAttribute(macroScales, 1));

        const macroUniforms = {
            uTime: { value: 0.0 },
            uColor: { value: new THREE.Color(0xaaf5ee) }
        };
        const macroMaterial = new THREE.ShaderMaterial({
            uniforms: macroUniforms,
            vertexShader: `
                precision highp float;
                uniform float uTime;
                attribute float scale;
                varying float vAlpha;

                void main() {
                    vec3 pos = position;
                    pos.y += mod(uTime * 0.8, 70.0);
                    if (pos.y > 35.0) pos.y -= 70.0;
                    pos.x += sin(uTime * 0.25 + position.z) * 1.5;

                    vec4 mvPos = viewMatrix * modelMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPos;

                    float ptSize = scale * (140.0 / max(0.1, -mvPos.z));
                    gl_PointSize = clamp(ptSize, 2.0, 96.0);

                    float dist = -mvPos.z;
                    // Visible when close to lens for cinematic shallow depth of field bokeh
                    vAlpha = smoothstep(1.5, 8.0, dist) * smoothstep(55.0, 20.0, dist);
                }
            `,
            fragmentShader: `
                precision highp float;
                uniform vec3 uColor;
                uniform float uTime;
                varying float vAlpha;

                void main() {
                    vec2 c = gl_PointCoord - vec2(0.5);
                    float d = length(c);
                    if (d > 0.5) discard;
                    // Soft optical bokeh aperture ring
                    float halo = smoothstep(0.5, 0.2, d);
                    float pulse = 0.85 + 0.15 * sin(uTime * 2.0 + d * 10.0);
                    gl_FragColor = vec4(uColor, halo * vAlpha * 0.35 * pulse);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const macroPoints = new THREE.Points(macroGeom, macroMaterial);
        group.add(macroPoints);

        // 5. School of Silver Fish (Colossal Scale Reference)
        const fishCount = 180;
        const fishGroup = new THREE.Group();
        const fishGeom = new THREE.ConeGeometry(0.35, 1.8, 4);
        fishGeom.rotateX(Math.PI / 2); // Point forward along Z
        const fishMat = new THREE.MeshStandardMaterial({
            color: 0xbedee8,
            roughness: 0.25,
            metalness: 0.85,
            emissive: 0x05202e
        });

        const fishInstances = [];
        for (let i = 0; i < fishCount; i++) {
            const fish = new THREE.Mesh(fishGeom, fishMat);
            const fTheta = (i / fishCount) * Math.PI * 2;
            const fRad = 8 + (i % 7) * 2.0;
            fish.position.set(
                Math.cos(fTheta) * fRad,
                -8 + Math.sin(i * 1.5) * 4.0,
                Math.sin(fTheta) * fRad - 10
            );
            fishGroup.add(fish);
            fishInstances.push({
                mesh: fish,
                orbitRadius: fRad,
                orbitSpeed: 0.18 + (i % 5) * 0.02,
                phase: fTheta,
                baseY: fish.position.y
            });
        }
        group.add(fishGroup);

        // 6. Rising Pearl Bubbles (Particularly prominent during whale ascent)
        const bubbleCount = 350;
        const bubbleGeom = new THREE.BufferGeometry();
        const bubblePos = new Float32Array(bubbleCount * 3);
        const bubbleData = [];

        for (let i = 0; i < bubbleCount; i++) {
            bubblePos[i * 3 + 0] = (pRnd() - 0.5) * 60;
            bubblePos[i * 3 + 1] = -50 + pRnd() * 80;
            bubblePos[i * 3 + 2] = (pRnd() - 0.5) * 60;
            bubbleData.push({
                origX: bubblePos[i * 3 + 0],
                origY: bubblePos[i * 3 + 1],
                origZ: bubblePos[i * 3 + 2],
                speed: 4.5 + pRnd() * 5.0,
                wobbleSpeed: 2.0 + pRnd() * 3.0,
                wobbleAmp: 0.4 + pRnd() * 0.6
            });
        }
        bubbleGeom.setAttribute('position', new THREE.BufferAttribute(bubblePos, 3));

        const bubbleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0.0 }
            },
            vertexShader: `
                precision highp float;
                uniform float uTime;
                varying float vGlow;

                void main() {
                    vec4 mvPosition = viewMatrix * modelMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    float bSize = (110.0 / max(0.1, -mvPosition.z));
                    gl_PointSize = clamp(bSize, 1.0, 48.0);
                    vGlow = smoothstep(120.0, 20.0, -mvPosition.z);
                }
            `,
            fragmentShader: `
                precision highp float;
                varying float vGlow;
                void main() {
                    vec2 c = gl_PointCoord - vec2(0.5);
                    float d = length(c);
                    if (d > 0.5) discard;
                    // Hollow iridescent soap-bubble appearance
                    float rim = smoothstep(0.3, 0.48, d) * (1.0 - smoothstep(0.48, 0.5, d));
                    float centerGlint = exp(-length(c - vec2(-0.15, -0.15)) * 12.0) * 0.8;
                    float alpha = (rim * 0.85 + centerGlint) * vGlow;
                    gl_FragColor = vec4(0.85, 0.98, 1.0, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const bubblePoints = new THREE.Points(bubbleGeom, bubbleMaterial);
        group.add(bubblePoints);

        // Update loop driven deterministically by absolute timeSeconds
        function update(timeSeconds) {
            godRayUniforms.uTime.value = timeSeconds;
            surfaceUniforms.uTime.value = timeSeconds;
            particleUniforms.uTime.value = timeSeconds;
            macroUniforms.uTime.value = timeSeconds;
            bubbleMaterial.uniforms.uTime.value = timeSeconds;

            // Update schooling fish positions along synchronized swirling shoals
            for (let i = 0; i < fishCount; i++) {
                const f = fishInstances[i];
                const angle = f.phase + timeSeconds * f.orbitSpeed;
                const fx = Math.cos(angle) * f.orbitRadius + Math.sin(timeSeconds * 0.4) * 6.0;
                const fz = Math.sin(angle) * f.orbitRadius * 0.8 - 12.0;
                const fy = f.baseY + Math.sin(angle * 2.0 + timeSeconds * 0.8) * 2.5;

                // Tangent vector for swim orientation
                const dx = -Math.sin(angle) * f.orbitRadius;
                const dz = Math.cos(angle) * f.orbitRadius * 0.8;

                f.mesh.position.set(fx, fy, fz);
                f.mesh.rotation.y = Math.atan2(dx, dz);
                // Subtle tail wiggle
                f.mesh.rotation.z = Math.sin(timeSeconds * 12.0 + i) * 0.15;
            }

            // Update rising bubble positions deterministically
            const posAttr = bubbleGeom.attributes.position;
            const posArr = posAttr.array;
            for (let i = 0; i < bubbleCount; i++) {
                const b = bubbleData[i];
                // Loop vertical ascent between -50 and +45
                const yProgress = (b.origY + 50.0 + timeSeconds * b.speed) % 95.0;
                const curY = -50.0 + yProgress;
                const curX = b.origX + Math.sin(timeSeconds * b.wobbleSpeed + i) * b.wobbleAmp;
                const curZ = b.origZ + Math.cos(timeSeconds * b.wobbleSpeed + i * 1.5) * b.wobbleAmp;

                posArr[i * 3 + 0] = curX;
                posArr[i * 3 + 1] = curY;
                posArr[i * 3 + 2] = curZ;
            }
            posAttr.needsUpdate = true;
        }

        return {
            group: group,
            update: update
        };
    }

    return {
        createOcean: createOcean
    };
})();
