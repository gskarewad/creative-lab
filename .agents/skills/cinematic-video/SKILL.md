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

## 2. Mobile-First Composition — Mandatory
- Design for the Galaxy S25 portrait screen FIRST, not for desktop browsers.
- Default creative canvas: portrait 9:16, with a 1080x1920 logical composition for video-oriented projects.
- The initial Chrome preview must feel intentionally designed for a phone, not like a desktop website squeezed into a narrow viewport.
- Use the full available screen height and width. Avoid desktop navigation, wide layouts, tiny controls, and unnecessary side panels.
- Keep the main subject large, prominent, and easy to see on a phone.
- Compose scenes vertically: foreground, subject, background, and light should create depth within the portrait frame.
- Keep titles and captions short, large, high-contrast, and readable without zooming.
- Keep important content away from screen edges and device cutouts.
- Use responsive CSS and a portrait-first layout. Do not simply scale a 16:9 desktop canvas down to fit the phone.
- If using Three.js, adapt the camera frustum, field of view, object placement, and camera movement for portrait composition. Reposition subjects rather than merely cropping landscape framing.
- Keep visual focus near the centre of the portrait composition while allowing deliberate vertical movement.
- Default animation output: portrait 1080x1920 at 30 FPS.
- Landscape 1920x1080 is an explicit alternative only when requested.
- If both mobile interaction and video composition are needed, keep the visual scene responsive while preserving the chosen output aspect ratio.
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

## 5. S25 Mobile Preview and Performance
- Treat the Galaxy S25 in portrait orientation as the primary design and test target.
- Ensure the first screen immediately looks polished and fills the mobile viewport appropriately.
- Use a mobile-first viewport meta tag and CSS sized for narrow screens.
- Handle portrait orientation, changing viewport height, and device pixel ratio carefully.
- For Three.js, cap pixel ratio when needed, limit expensive effects, reuse geometries and materials, and avoid excessive particles or costly real-time shadows.
- Prefer efficient lighting, shaders, and layered visual effects over expensive effects that provide little visible benefit on a phone.
- Avoid hover-only interactions. Use touch-friendly controls with comfortably sized targets.
- Prevent accidental horizontal scrolling, clipped subjects, tiny text, and controls hidden behind browser UI.
- Ensure the animation remains smooth on the S25; reduce complexity when necessary without sacrificing the core visual impact.
- Provide a simple local preview entry point.
- Fix JavaScript errors, missing assets, layout issues, and obvious performance problems.
- Do not claim mobile compatibility has been verified unless the project was actually tested on the phone.
- Before finishing, inspect the actual portrait Chrome preview and refine composition specifically for the phone screen.

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
