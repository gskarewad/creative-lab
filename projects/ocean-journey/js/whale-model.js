/**
 * Ocean Journey - Procedural Whale Model & Shader System
 * Generates a high-fidelity Blue Whale (Balaenoptera musculus) 3D mesh,
 * procedural canvas textures (mottled skin, ventral pleats, eye, scars),
 * and dynamic swimming vertex shader deformation.
 */

window.WhaleSystem = (function() {
    'use strict';

    // Procedural Skin Texture Generation on Canvas
    function generateWhaleTextures() {
        // 1. Diffuse / Color Texture (2048x1024)
        const diffCanvas = document.createElement('canvas');
        diffCanvas.width = 2048;
        diffCanvas.height = 1024;
        const ctx = diffCanvas.getContext('2d');

        // Background: Deep oceanic slate-blue gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 1024);
        bgGrad.addColorStop(0.0, '#0d1822'); // Dorsal top: dark midnight slate
        bgGrad.addColorStop(0.3, '#182b3a'); // Upper flank
        bgGrad.addColorStop(0.5, '#253d50'); // Lateral line
        bgGrad.addColorStop(0.7, '#6b899e'); // Lower flank
        bgGrad.addColorStop(0.9, '#b8ccd6'); // Ventral throat/belly: pale silver-blue
        bgGrad.addColorStop(1.0, '#9bb0bd'); // Deepest ventral
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 2048, 1024);

        // Procedural mottled patches (Blue Whale signature mottled camouflage)
        // Deterministic PRNG for repeatability
        let seed = 42;
        function rnd() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        }

        ctx.save();
        for (let i = 0; i < 900; i++) {
            const x = rnd() * 2048;
            const y = rnd() * 600 + 50; // Concentrated on back and flanks
            const rx = 10 + rnd() * 35;
            const ry = 5 + rnd() * 18;
            const rot = (rnd() - 0.5) * 0.4;
            const opacity = 0.08 + rnd() * 0.15;
            const isLight = rnd() > 0.4;

            ctx.fillStyle = isLight ? `rgba(135, 175, 198, ${opacity})` : `rgba(10, 20, 30, ${opacity * 1.2})`;
            ctx.beginPath();
            ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // Ventral Pleats (Ventral Grooves / Throat Ridges)
        // These run from the chin through the belly (Y: 550 to 980, X: 300 to 1400)
        ctx.save();
        const pleatCount = 72;
        for (let i = 0; i < pleatCount; i++) {
            const py = 550 + (i / pleatCount) * 420;
            const pleatGrad = ctx.createLinearGradient(340, py, 1460, py);
            pleatGrad.addColorStop(0.0, 'rgba(15, 28, 38, 0)');
            pleatGrad.addColorStop(0.08, 'rgba(15, 28, 38, 0.75)');
            pleatGrad.addColorStop(0.5, 'rgba(18, 32, 44, 0.9)');
            pleatGrad.addColorStop(0.88, 'rgba(15, 28, 38, 0.75)');
            pleatGrad.addColorStop(1.0, 'rgba(15, 28, 38, 0)');

            // Shadow groove
            ctx.strokeStyle = pleatGrad;
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(320, py);
            ctx.quadraticCurveTo(890, py + Math.sin(i * 0.22) * 3.5, 1470, py);
            ctx.stroke();

            // Highlight crest adjacent to groove
            ctx.strokeStyle = 'rgba(215, 235, 245, 0.48)';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(330, py - 2.5);
            ctx.quadraticCurveTo(890, py - 2.5 + Math.sin(i * 0.22) * 3.5, 1460, py - 2.5);
            ctx.stroke();
        }
        ctx.restore();

        // Baleen Plates (Comb-like keratin plates inside jaw margin)
        ctx.save();
        ctx.strokeStyle = '#080d12';
        ctx.lineWidth = 1.2;
        for (let b = 0; b < 90; b++) {
            const bx = 340 + b * 2.2;
            ctx.beginPath();
            ctx.moveTo(bx, 495);
            ctx.lineTo(bx + 1, 518);
            ctx.stroke();
        }
        ctx.restore();

        // Ancient Barnacle Clusters (Coronula diadema colonies on rostrum and chin)
        ctx.save();
        const barnacleSpots = [
            { x: 120, y: 480, r: 9 }, { x: 135, y: 490, r: 6 }, { x: 115, y: 505, r: 7 },
            { x: 170, y: 470, r: 8 }, { x: 185, y: 485, r: 11 }, { x: 165, y: 510, r: 7 },
            { x: 230, y: 460, r: 8 }, { x: 245, y: 475, r: 10 }, { x: 220, y: 520, r: 6 },
            { x: 300, y: 540, r: 7 }, { x: 320, y: 555, r: 9 }
        ];
        barnacleSpots.forEach(b => {
            // Chalky outer shell ring
            ctx.fillStyle = '#c5d5dc';
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();

            // Mid ring
            ctx.fillStyle = '#899fa8';
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r * 0.7, 0, Math.PI * 2);
            ctx.fill();

            // Dark crater aperture
            ctx.fillStyle = '#101a22';
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r * 0.35, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();

        // Rostrum ridges and subtle scarring (evidence of longevity)
        ctx.save();
        ctx.strokeStyle = 'rgba(175, 205, 220, 0.4)';
        ctx.lineWidth = 1.6;
        for (let s = 0; s < 45; s++) {
            const sx = 90 + rnd() * 420;
            const sy = 240 + rnd() * 220;
            const len = 20 + rnd() * 45;
            const angle = (rnd() - 0.5) * 0.85;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
            ctx.stroke();
        }

        // Eyes (drawn on both left and right UV hemispheres)
        const eyePositions = [{x: 460, y: 440}, {x: 460, y: 584}];
        eyePositions.forEach(ep => {
            // Dark eye socket
            ctx.fillStyle = '#070d13';
            ctx.beginPath();
            ctx.ellipse(ep.x, ep.y, 17, 12, 0, 0, Math.PI * 2);
            ctx.fill();

            // Deep cetacean iris with warm depth
            ctx.fillStyle = '#162e3d';
            ctx.beginPath();
            ctx.arc(ep.x, ep.y, 8.5, 0, Math.PI * 2);
            ctx.fill();

            // Pupil
            ctx.fillStyle = '#010406';
            ctx.beginPath();
            ctx.arc(ep.x, ep.y, 5.2, 0, Math.PI * 2);
            ctx.fill();

            // Lens specular glint
            ctx.fillStyle = 'rgba(235, 250, 255, 0.95)';
            ctx.beginPath();
            ctx.arc(ep.x - 2.2, ep.y - 2.2, 2.2, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();

        const diffTexture = new THREE.CanvasTexture(diffCanvas);
        diffTexture.wrapS = THREE.RepeatWrapping;
        diffTexture.wrapT = THREE.ClampToEdgeWrapping;

        // 2. Normal / Bump Texture (1024x512)
        const normCanvas = document.createElement('canvas');
        normCanvas.width = 1024;
        normCanvas.height = 512;
        const nctx = normCanvas.getContext('2d');
        nctx.fillStyle = '#8080ff'; // Flat tangent space normal
        nctx.fillRect(0, 0, 1024, 512);

        // Draw horizontal normal gradients for ventral grooves
        for (let i = 0; i < pleatCount; i++) {
            const py = 275 + (i / pleatCount) * 210;
            nctx.fillStyle = '#6f6fff';
            nctx.fillRect(160, py - 1, 580, 2);
            nctx.fillStyle = '#9191ff';
            nctx.fillRect(160, py + 1, 580, 2);
        }

        // Add 3D barnacle relief in normal map
        barnacleSpots.forEach(b => {
            const nx = b.x * 0.5;
            const ny = b.y * 0.5;
            const nr = b.r * 0.5;
            nctx.fillStyle = '#9c9cff';
            nctx.beginPath();
            nctx.arc(nx - 1, ny - 1, nr, 0, Math.PI * 2);
            nctx.fill();
            nctx.fillStyle = '#6464ff';
            nctx.beginPath();
            nctx.arc(nx + 1, ny + 1, nr, 0, Math.PI * 2);
            nctx.fill();
        });

        const normTexture = new THREE.CanvasTexture(normCanvas);
        normTexture.wrapS = THREE.RepeatWrapping;
        normTexture.wrapT = THREE.ClampToEdgeWrapping;

        return { diffTexture, normTexture };
    }

    // Build the high-resolution streamlined Cetacean 3D geometry
    function createWhaleGeometry() {
        const geom = new THREE.BufferGeometry();

        // Longitudinal spine stations along Z axis (from rostrum +26 to fluke notch -26)
        // Each station defines Z position, horizontal radius Rx, dorsal height Yd, ventral depth Yv, and pleat factor
        const stations = [
            { z:  26.0, rx: 0.15, yd: 0.15, yv: -0.15, pleat: 0.0 }, // Snout tip
            { z:  24.5, rx: 1.20, yd: 0.65, yv: -0.70, pleat: 0.1 }, // Rostrum tip
            { z:  22.0, rx: 2.30, yd: 1.15, yv: -1.35, pleat: 0.3 }, // Rostrum mid
            { z:  18.0, rx: 3.45, yd: 1.85, yv: -2.20, pleat: 0.7 }, // Rostrum base / upper jaw
            { z:  14.0, rx: 4.10, yd: 2.50, yv: -3.00, pleat: 1.0 }, // Blowhole / eyes / jaw corner
            { z:  10.0, rx: 4.40, yd: 2.90, yv: -3.65, pleat: 1.0 }, // Chest / pectoral fin base
            { z:   5.0, rx: 4.50, yd: 3.10, yv: -3.90, pleat: 1.0 }, // Deepest chest & ventral pouch
            { z:   0.0, rx: 4.30, yd: 3.15, yv: -3.75, pleat: 0.9 }, // Midbody
            { z:  -5.0, rx: 3.85, yd: 3.00, yv: -3.35, pleat: 0.5 }, // Abdomen
            { z: -10.0, rx: 3.10, yd: 2.65, yv: -2.75, pleat: 0.2 }, // Tapering body
            { z: -14.0, rx: 2.30, yd: 2.25, yv: -2.15, pleat: 0.0 }, // Anterior to dorsal fin
            { z: -17.0, rx: 1.65, yd: 1.95, yv: -1.65, pleat: 0.0 }, // Dorsal fin base
            { z: -20.0, rx: 1.05, yd: 1.65, yv: -1.30, pleat: 0.0 }, // Peduncle start
            { z: -23.0, rx: 0.60, yd: 1.35, yv: -1.05, pleat: 0.0 }, // Narrow peduncle keel
            { z: -25.2, rx: 0.35, yd: 0.85, yv: -0.65, pleat: 0.0 }, // Fluke insertion
            { z: -26.0, rx: 0.20, yd: 0.25, yv: -0.20, pleat: 0.0 }  // Caudal notch
        ];

        const numStations = stations.length;
        const radialSegments = 40; // High radial resolution for smooth hydrodynamic contour

        const positions = [];
        const normals = [];
        const uvs = [];
        const indices = [];

        // Generate body vertex rings
        for (let i = 0; i < numStations; i++) {
            const st = stations[i];
            const v = i / (numStations - 1);

            for (let j = 0; j <= radialSegments; j++) {
                const u = j / radialSegments;
                const angle = u * Math.PI * 2;

                const cosA = Math.cos(angle); // Horizontal (lateral)
                const sinA = Math.sin(angle); // Vertical (dorsal / ventral)

                // Oval cross section with distinct dorsal vs ventral profiles
                const x = cosA * st.rx;
                let y = sinA >= 0 ? sinA * st.yd : sinA * Math.abs(st.yv);

                // Add subtle dorsal ridge at the top
                if (sinA > 0.85 && st.z < 18.0 && st.z > -16.0) {
                    y += Math.pow((sinA - 0.85) / 0.15, 2) * 0.35;
                }

                // Add realistic dorsal fin extrusion at z ~ -17
                if (st.z <= -16.0 && st.z >= -18.5 && sinA > 0.92) {
                    const finZFactor = 1.0 - Math.abs(st.z - (-17.2)) / 1.3;
                    const finPeak = Math.max(0, finZFactor) * 1.65;
                    y += finPeak;
                }

                positions.push(x, y, st.z);
                uvs.push(u, v);
            }
        }

        // Generate body indices
        const ringStride = radialSegments + 1;
        for (let i = 0; i < numStations - 1; i++) {
            for (let j = 0; j < radialSegments; j++) {
                const a = i * ringStride + j;
                const b = (i + 1) * ringStride + j;
                const c = (i + 1) * ringStride + (j + 1);
                const d = i * ringStride + (j + 1);

                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }

        // Attach Flukes (Tail fins) - Realistic broad cetacean tail
        // Flukes span horizontally from -24.5 to -27.5 Z, expanding laterally to X = +/- 8.5
        const flukeRows = 8;
        const flukeCols = 16;
        const flukeVertexOffset = positions.length / 3;

        for (let r = 0; r <= flukeRows; r++) {
            const fv = r / flukeRows; // 0 (leading edge) to 1 (trailing edge)
            const z = -24.8 - fv * 2.4;

            for (let c = 0; c <= flukeCols; c++) {
                const fu = (c / flukeCols) * 2 - 1; // -1 (left tip) to 0 (notch) to 1 (right tip)
                const span = Math.abs(fu);

                // Fluke profile curve
                const maxSpan = 8.8 * Math.sin(fv * Math.PI * 0.95);
                const x = fu * 8.8;

                // Hydrofoil thickness: thicker at center and leading edge, razor thin at tips & trailing edge
                const thickness = Math.max(0.04, (1.0 - fv * 0.85) * (1.0 - span * 0.85) * 0.55);
                const y = Math.sin(fv * Math.PI) * thickness * 0.4;

                positions.push(x, y, z);
                uvs.push((fu + 1) * 0.5, 0.9 + fv * 0.1);
            }
        }

        for (let r = 0; r < flukeRows; r++) {
            for (let c = 0; c < flukeCols; c++) {
                const a = flukeVertexOffset + r * (flukeCols + 1) + c;
                const b = flukeVertexOffset + (r + 1) * (flukeCols + 1) + c;
                const c_idx = flukeVertexOffset + (r + 1) * (flukeCols + 1) + (c + 1);
                const d = flukeVertexOffset + r * (flukeCols + 1) + (c + 1);

                indices.push(a, b, d);
                indices.push(b, c_idx, d);
                // Double-sided faces for flukes
                indices.push(d, b, a);
                indices.push(d, c_idx, b);
            }
        }

        // Attach Pectoral Fins (Left & Right)
        function addPectoralFin(side) {
            const finRows = 8;
            const finCols = 8;
            const startIdx = positions.length / 3;
            const rootX = side * 4.2;
            const rootY = -2.2;
            const rootZ = 10.0;

            for (let r = 0; r <= finRows; r++) {
                const fv = r / finRows; // Along fin length (0 at root to 1 at tip)
                for (let c = 0; c <= finCols; c++) {
                    const fu = c / finCols; // Fin chord (0 leading to 1 trailing edge)

                    // Swept wing trajectory
                    const finLength = 9.5;
                    let sweepZ = -fv * 5.2 - fu * 2.2;
                    // Leading-edge tubercles (hydrodynamic bumps along anterior fin margin)
                    if (fu < 0.18) {
                        const tub = Math.sin(fv * 24.0) * 0.16 * (1.0 - fu / 0.18);
                        sweepZ += tub;
                    }
                    const finX = rootX + side * (fv * finLength * 0.88);
                    const finY = rootY - fv * 3.5 - Math.sin(fu * Math.PI) * 0.25;
                    const finZ = rootZ + sweepZ;

                    positions.push(finX, finY, finZ);
                    uvs.push(0.3 + fv * 0.3, 0.4 + fu * 0.2);
                }
            }

            for (let r = 0; r < finRows; r++) {
                for (let c = 0; c < finCols; c++) {
                    const a = startIdx + r * (finCols + 1) + c;
                    const b = startIdx + (r + 1) * (finCols + 1) + c;
                    const c_idx = startIdx + (r + 1) * (finCols + 1) + (c + 1);
                    const d = startIdx + r * (finCols + 1) + (c + 1);

                    indices.push(a, b, d);
                    indices.push(b, c_idx, d);
                    indices.push(d, b, a);
                    indices.push(d, c_idx, b);
                }
            }
        }

        addPectoralFin(1);  // Right fin
        addPectoralFin(-1); // Left fin

        geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geom.setIndex(indices);
        geom.computeVertexNormals();

        return geom;
    }

    // Custom Cinematic Underwater Whale Shader
    function createWhaleMaterial(textures) {
        return new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0.0 },
                uDiffMap: { value: textures.diffTexture },
                uNormMap: { value: textures.normTexture },
                uCausticMap: { value: null }, // Injected from ocean environment
                uDeepColor: { value: new THREE.Color(0x02162e) },
                uSunColor: { value: new THREE.Color(0xa5f3eb) },
                uSunDirection: { value: new THREE.Vector3(0.35, 0.85, 0.38).normalize() },
                uFogDensity: { value: 0.014 }
            },
            vertexShader: `
                precision highp float;
                uniform float uTime;
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vWorldPos;
                varying vec3 vViewPos;

                void main() {
                    vUv = uv;
                    vec3 pos = position;

                    // Cetacean swimming locomotion physics:
                    // Dorsoventral spine wave traveling from head (+26) to tail (-26)
                    float zNorm = (pos.z + 26.0) / 52.0; // 1.0 at snout, 0.0 at fluke notch
                    float wavePhase = (1.0 - zNorm) * 5.2 - uTime * 1.85;

                    // Envelope function: head remains remarkably stable (<0.04), tail has large sweeping strokes (1.0)
                    float spineEnvelope = pow(clamp(1.0 - zNorm, 0.0, 1.0), 2.2);
                    float waveAmp = 2.8 * spineEnvelope;

                    // Primary vertical thrust wave
                    float dy = sin(wavePhase) * waveAmp;

                    // Fluke pitch angle of attack compensation (propulsive phase lead)
                    if (pos.z < -23.0) {
                        float flukeLead = cos(wavePhase) * 1.2 * spineEnvelope;
                        dy += flukeLead;
                    }

                    // Pectoral fin dynamic hydrodynamic flex
                    if (abs(pos.x) > 4.5 && pos.z > 2.0 && pos.z < 12.0) {
                        float finDist = (abs(pos.x) - 4.5) / 5.0;
                        dy += sin(uTime * 1.85 - 1.2) * finDist * 0.65;
                    }

                    pos.y += dy;

                    // Spine slope curvature for normal recalculation approximation
                    float slope = cos(wavePhase) * waveAmp * 0.12;
                    vec3 deformedNormal = normal;
                    deformedNormal.y += slope * normal.z;
                    deformedNormal.z -= slope * normal.y;
                    deformedNormal = normalize(deformedNormal);

                    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
                    vWorldPos = worldPosition.xyz;

                    vec4 mvPosition = viewMatrix * worldPosition;
                    vViewPos = -mvPosition.xyz;
                    vNormal = normalize(normalMatrix * deformedNormal);

                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                precision highp float;
                uniform sampler2D uDiffMap;
                uniform sampler2D uNormMap;
                uniform sampler2D uCausticMap;
                uniform float uTime;
                uniform vec3 uDeepColor;
                uniform vec3 uSunColor;
                uniform vec3 uSunDirection;
                uniform float uFogDensity;

                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vWorldPos;
                varying vec3 vViewPos;

                void main() {
                    vec4 baseColor = texture2D(uDiffMap, vUv);
                    vec3 normal = normalize(vNormal);
                    vec3 viewDir = normalize(vViewPos);

                    // Diffuse lighting from sunlit upper ocean
                    float NdotL = max(dot(normal, uSunDirection), 0.0);
                    vec3 diffuse = baseColor.rgb * (uDeepColor * 0.8 + uSunColor * NdotL * 0.95);

                    // Under-belly ambient bounce from the abyssal blue
                    float bounce = max(-normal.y, 0.0) * 0.25;
                    diffuse += uDeepColor * bounce;

                    // Fresnel rim lighting (essential for underwater cinematic depth & silhouette reading)
                    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.2);
                    vec3 rimLight = mix(uDeepColor * 1.5, uSunColor, 0.5) * fresnel * 0.75;

                    // Specular wet skin sheen
                    vec3 halfVector = normalize(uSunDirection + viewDir);
                    float NdotH = max(dot(normal, halfVector), 0.0);
                    float spec = pow(NdotH, 28.0) * 0.35;

                    // Caustics projection on dorsal surface (intensifies when closer to surface Y > -5.0)
                    vec2 causticUV1 = vWorldPos.xz * 0.045 + vec2(uTime * 0.02, uTime * 0.015);
                    vec2 causticUV2 = vWorldPos.xz * 0.075 - vec2(uTime * 0.025, uTime * 0.03);
                    float caustics = (sin(causticUV1.x * 20.0 + causticUV1.y * 15.0) * 0.5 + 0.5) *
                                     (cos(causticUV2.x * 25.0 - causticUV2.y * 18.0) * 0.5 + 0.5);
                    caustics = pow(caustics, 2.5);

                    // Caustics only penetrate upper water column and face upward
                    float depthFade = clamp((vWorldPos.y + 25.0) / 40.0, 0.0, 1.0);
                    float upFacing = max(normal.y, 0.0);
                    vec3 causticColor = uSunColor * caustics * 1.4 * depthFade * upFacing;

                    vec3 finalColor = diffuse + rimLight + spec * uSunColor + causticColor;

                    // Underwater Exponential Fog
                    float dist = length(vViewPos);
                    float fogFactor = 1.0 - exp(-dist * uFogDensity);
                    fogFactor = clamp(fogFactor, 0.0, 1.0);

                    // Deep ocean fog color with subtle sun-shaft forward scatter
                    vec3 fogColor = mix(uDeepColor, uSunColor * 0.5, clamp(dot(viewDir, -uSunDirection) * 0.5 + 0.5, 0.0, 1.0) * 0.3);

                    gl_FragColor = vec4(mix(finalColor, fogColor, fogFactor), 1.0);
                }
            `,
            side: THREE.DoubleSide
        });
    }

    // Instantiates the complete Whale object
    function createWhale() {
        const textures = generateWhaleTextures();
        const geometry = createWhaleGeometry();
        const material = createWhaleMaterial(textures);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const container = new THREE.Group();
        container.add(mesh);

        return {
            group: container,
            mesh: mesh,
            material: material,
            update: function(timeSeconds) {
                material.uniforms.uTime.value = timeSeconds;
            }
        };
    }

    return {
        createWhale: createWhale
    };
})();
