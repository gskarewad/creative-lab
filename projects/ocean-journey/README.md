# Ocean Journey — The Abyssal Giant

A cinematic, nature-documentary-grade 3D underwater visual experience built with Three.js, vanilla JavaScript, and GLSL shaders.

Designed for proportional 1920×1080 display on mobile Chrome (Galaxy S25) and desktop browsers, with an explicit, deterministic 20-second animation timeline.

---

## 🌊 Creative Highlights

- **The Leviathan**: A procedurally modeled 30-meter Pacific Blue Whale (*Balaenoptera musculus*) featuring:
  - Anatomically modeled streamlined body, rostrum, dorsal keel, dorsal fin, and notched caudal flukes.
  - Aerodynamic pectoral flippers with leading-edge hydrodynamic tubercles.
  - Procedural 2048×1024 diffuse texture with authentic blue-slate mottling, baleen plate comb margins, and *Coronula diadema* barnacle colonies.
  - Normal/bump map capturing 72 deep longitudinal ventral pleats (throat grooves) that expand during feeding.
  - Cetacean swimming locomotion vertex shader simulating dorsoventral spine undulation, fluke thrust pitch angling, and hydrodynamic pectoral flex.
- **Atmospheric Underwater Lighting & Volumetrics**:
  - Multi-beam volumetric god rays (light shafts) penetrating the water column with animated wave-shimmer modulation.
  - Depth-dependent underwater caustics dancing across the whale's dorsal skin.
  - Shimmering ocean surface ceiling with wave swell distortion and radiant sunburst disk.
  - Multi-tier particle systems: 2,800 drifting marine snow particles and 140 macro bokeh plankton flecks with shallow depth-of-field blur.
  - School of 180 silver fish moving in synchronized shoal murmurations to provide colossal scale reference.
  - Pearlescent rising bubble trails during the final ascent.
- **Cinematic Director & Camera Path**:
  - **Act I (0.0s – 4.8s)**: *Wide Establishing Twilight* — floating in the deep blue quietude; distant silhouette materializes from the abyssal fog.
  - **Act II (4.8s – 9.5s)**: *Diagonal Crane Reveal* — sweeping descent orbiting into the light shaft as caustics illuminate the textured skin.
  - **Act III (9.5s – 14.8s)**: *Intimate Flank Pass* — close-up tracking shot gliding beside the ancient eye, ventral pleats, and sweeping pectoral fin.
  - **Act IV (14.8s – 20.0s)**: *Hero Ascent to the Light* — low-angle upward perspective into the radiant sunburst ceiling with rising bubble streams, concluding with an atmospheric fade to black.
- **Documentary Typographic System**:
  - BBC Earth / National Geographic style subtitles, category badges, and series watermark (`EARTH ARCHIVES • 4K UHD 60FPS`).
- **Soundscape Synthesizer**:
  - Optional procedural underwater audio synthesizer (Web Audio API) generating low-frequency sub-bass ocean drone swell and haunting cetacean vocalization harmonics—100% local, zero external audio assets.

---

## 🎬 Project Specifications

| Property | Value |
|---|---|
| **Target Composition** | 1920 × 1080 (16:9 Landscape) |
| **Duration** | 20.0 Seconds |
| **Frame Rate** | 60 FPS (Hardware accelerated WebGL) |
| **Animation Paradigm** | 100% Deterministic & Seekable |
| **External APIs** | None (Zero external dependencies) |
| **Bundled Assets** | Three.js r128 (`js/three.min.js`), procedural textures, procedural audio |
| **Target Platform** | Samsung Galaxy S25 (Mobile Chrome) & Modern Desktop Browsers |

---

## ⏱ Deterministic Timeline API

The animation is fully reproducible and decoupled from wall-clock frame deltas:

```javascript
// Render any frame deterministically (seconds 0.0 to 20.0)
window.renderAtTime(12.5);
```

Every spatial position, spine undulation wave, camera matrix, lighting shimmer, particle drift, and overlay opacity is derived purely from absolute timestamp $t \in [0.0, 20.0]$.

---

## 🚀 Local Preview Instructions

### On Galaxy S25 / Android (Termux):

1. **Quick Launch**:
   ```bash
   bash scripts/preview.sh
   ```
2. **Or start server manually**:
   ```bash
   python3 -m http.server 8080
   ```
   Then open in Chrome:
   ```text
   http://localhost:8080/projects/ocean-journey/
   ```

### Interactive Controls:
- **Play / Pause**: Tap play/pause button or press `Space`.
- **Scrubber Bar**: Drag to seek instantaneously to any point in the 20-second timeline.
- **Speed**: Toggle between 1×, 0.5× (slow motion), 0.25×, and 2×.
- **Soundscape**: Tap the speaker icon to toggle the synthesized procedural ocean soundscape.
- **Fullscreen**: Tap the fullscreen icon for an immersive edge-to-edge experience.
- **Controls Auto-Hide**: Controls automatically fade after 2.5 seconds of inactivity and reappear on tap/mouse movement.

---

## 📁 Project Structure

```text
projects/ocean-journey/
├── index.html                  # 1920x1080 proportional stage, UI overlays, control bar
├── README.md                   # Project documentation & preview instructions
├── css/
│   └── style.css               # Responsive stage scaling, documentary typography, letterbox scope
└── js/
    ├── three.min.js            # Bundled Three.js r128 library
    ├── whale-model.js          # Procedural 3D mesh, canvas textures, swimming vertex shader
    ├── ocean-environment.js    # Volumetric god rays, caustics, marine snow, fish shoal, bubbles
    ├── cinematic-director.js   # 20s camera splines, whale keyframes, documentary title cues
    ├── audio.js                # Procedural Web Audio API underwater soundscape synthesizer
    └── main.js                 # Scene pipeline, renderAtTime(t), responsive scaler, controls
```
