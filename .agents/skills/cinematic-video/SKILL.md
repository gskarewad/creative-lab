---
name: cinematic-video
description: Create visually compelling, cinematic HTML/CSS/JavaScript animations and self-contained projects designed for mobile Chrome development and later video rendering on EC2. Use when creating or improving visual experiences, animations, explainers, and documentary scenes.
---

# Cinematic Creative Project Skill

## Environment Separation — Mandatory

### Galaxy S25: Creation Only
- Use Antigravity to generate, edit, and improve HTML, CSS, and JavaScript.
- Preview and test the project in Chrome on the S25.
- Do not install, invoke, inspect, or troubleshoot HyperFrames on the S25.
- Do not attempt video rendering on the S25.
- Do not waste tokens checking EC2, video-rendering tools, or HyperFrames documentation during ordinary project creation.
- Focus on producing an excellent, complete, portable HTML/JS project.

### EC2: Rendering Only
- HyperFrames rendering, video export, render validation, and rendering troubleshooting belong to the EC2 workflow.
- The project must be portable to EC2 and support deterministic animation.
- Do not assume HyperFrames is available in the S25 environment.
- Only investigate HyperFrames integration when explicitly asked to prepare or troubleshoot the EC2 rendering workflow.

## 1. Visual Quality
- Create premium, cinematic visual experiences rather than generic websites or static slides.
- Prioritize compelling composition, depth, lighting, atmosphere, camera movement, meaningful motion, and smooth transitions.
- Use Three.js for valuable 3D effects; otherwise prefer efficient CSS, Canvas, and vanilla JavaScript.
- Avoid generic gradients, repetitive animations, excessive text, unnecessary UI panels, and placeholder visuals.
- Establish a strong opening, progressive visual reveals, varied pacing, and a memorable ending.
- Choose techniques that suit the subject instead of forcing 3D into every project.
- Inspect the actual Chrome preview and improve weak visuals before declaring the project complete.

## 2. Video Composition
- Default composition: 1920x1080 landscape at 30 FPS.
- Support 1080x1920 portrait when explicitly requested.
- Keep composition dimensions independent of the S25 viewport; scale proportionally for mobile preview.
- Maintain safe margins for titles and captions.
- Use a consistent visual language, typography, colour palette, and transitions.

## 3. Deterministic Animation
- Make animation state reproducible from an explicit timeline timestamp.
- Where appropriate, expose a function such as renderAtTime(timeSeconds).
- Derive positions, camera transforms, lighting, effects, captions, and transitions from absolute time.
- Avoid accumulated frame-delta dependence, uncontrolled wall-clock timing, and unseeded randomness in video-critical animation.
- Ensure seeking directly to a timestamp produces the correct visual state.
- Keep interactive preview controls separate from the animation timeline.
- Avoid mandatory external APIs, remote runtime assets, and unpredictable network dependencies.
- Deterministic animation is a portability requirement, not permission to run video rendering on the phone.

## 4. Project Structure
- Create each project under projects/<project-name>/.
- Keep HTML, CSS, JavaScript, and essential assets together.
- Use modular files when that improves maintainability; avoid unnecessary build systems and dependencies.
- Bundle important fonts, images, textures, and other assets locally where practical.
- Include a concise README describing the project, its entry point, local preview instructions, assets, duration, aspect ratio, and timeline behavior.
- Keep the project self-contained and Git-friendly.

## 5. S25 Preview and Performance
- Ensure the project opens and works in Chrome on Android.
- Keep rendering and memory use reasonable for the Galaxy S25.
- Handle viewport scaling and device pixel ratio carefully.
- Provide a clear preview entry point.
- Fix JavaScript errors, missing assets, layout clipping, and obvious performance problems.
- Do not claim browser compatibility has been verified unless the project was actually tested.

## 6. Required Workflow
1. Read this skill and inspect the existing workspace and reusable templates.
2. Understand the creative objective and choose sensible defaults.
3. Build the complete working HTML/JS experience.
4. Preview it in Chrome on the S25 and inspect the actual visuals.
5. Improve composition, motion, pacing, and visual quality.
6. Ensure video-critical animation is deterministic and the project is portable.
7. Document the project and report what was actually tested.

## 7. Token and Tool Discipline
- Do not repeat setup investigations for tools that belong to the other environment.
- Do not add unnecessary dependencies, infrastructure, or implementation steps.
- Do not invent APIs or claim tests passed without evidence.
- Make reasonable creative decisions and proceed without asking unnecessary questions.
- Prioritize a working, visually excellent result over long explanations.
