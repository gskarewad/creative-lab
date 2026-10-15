---
name: cinematic-video
description: Creates visually exceptional, cinematic HTML/CSS/JavaScript experiences designed for deterministic HyperFrames video rendering. Use when creating, improving, or preparing animations, visual explainers, documentaries, and video projects for the S25 and EC2 workflow.
---

# Cinematic Video Production Skill

## Objective
Create polished, visually engaging animated experiences that work in mobile Chrome and can be rendered reliably into MP4 videos using HyperFrames on Ubuntu EC2.

## 1. Visual Quality
- Prioritize cinematic storytelling and visual spectacle over generic UI layouts.
- Use deliberate composition, depth, lighting, shadows, atmosphere, camera movement, particles, and smooth transitions where appropriate.
- Use Three.js for meaningful 3D scenes; use CSS and Canvas when they are more efficient.
- Avoid static slides, generic gradient backgrounds, repetitive effects, excessive text, and unnecessary interface panels.
- Every scene must have a clear visual focal point and purposeful motion.
- Use strong opening imagery, progressive reveals, visual variation, and a satisfying ending.
- Choose visual techniques appropriate to the subject; do not force 3D into every project.

## 2. Video Format
- Default output: 1920x1080, 30 FPS.
- Support portrait 1080x1920 when explicitly requested.
- Keep the video composition fixed-resolution and scale it proportionally for mobile preview.
- Design safe margins for titles and captions.
- Keep scene timing, transitions, typography, and audio synchronized.

## 3. Deterministic Animation
- Make every video frame reproducible from its timeline timestamp.
- Centralize animation in explicit functions such as renderAtTime(timeSeconds).
- Derive camera transforms, object positions, lighting, captions, and transitions from absolute time.
- Do not depend on accumulated frame deltas, uncontrolled wall-clock time, user input, or unseeded randomness.
- Seed procedural randomness or precompute it.
- Ensure seeking directly to any timestamp produces the correct state.
- Wait for required fonts, images, textures, models, and audio metadata before rendering.
- Never assume requestAnimationFrame timing alone is sufficient for deterministic video output.

## 4. HyperFrames Compatibility
- Inspect the installed HyperFrames version, project conventions, and official/local CLI help before choosing integration APIs.
- Do not invent HyperFrames components, timeline schemas, commands, or configuration fields.
- Separate interactive preview controls from deterministic video playback.
- Ensure scenes can render in headless Chromium without manual interaction.
- Keep assets local where practical and avoid runtime dependencies on external APIs.
- Validate the project and render a short draft before a full export.
- Check frame timing, missing assets, browser errors, blank frames, clipping, and audio synchronization.
- Do not claim successful rendering unless an actual render has completed.

## 5. S25 Compatibility
- Prefer HTML, CSS, vanilla JavaScript, and Three.js where appropriate.
- Keep dependencies and asset sizes reasonable for an Android phone.
- Support local Chrome preview without a backend.
- Ensure controls do not obstruct the composition.
- Provide a clear way to preview the animation and its timeline.

## 6. Project Structure
- Keep each project self-contained under projects/<project-name>/.
- Separate scene logic, animation/timeline logic, styles, and assets when useful.
- Keep code simple enough to maintain and reuse.
- Include a README with preview instructions, timeline details, dependencies, and verified rendering commands.
- Reuse shared templates and helpers when available rather than duplicating infrastructure.

## 7. Required Workflow
1. Inspect the existing workspace and installed HyperFrames setup before coding.
2. Establish the story, visual direction, duration, aspect ratio, and scene sequence.
3. Implement a complete working experience, not a static mockup.
4. Preview in Chrome and inspect the actual visuals.
5. Validate deterministic seeking and rendering compatibility.
6. Render a draft and inspect representative frames and the complete playback.
7. Fix visual defects and timing issues before final delivery.
8. Report what was tested and what remains unverified.

## 8. Implementation Principles
- Prefer a few exceptional scenes over many weak scenes.
- Animate with intention; avoid motion that does not improve storytelling.
- Use realistic scale, lighting, and spatial relationships when relevant.
- Keep narration and on-screen text concise.
- Avoid unnecessary dependencies, build systems, and infrastructure.
- Do not rebuild or reinstall working tools without a clear reason.
- When requirements are ambiguous, choose sensible creative defaults and proceed.
