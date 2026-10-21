# Changelog — Whiskay RPG Next.js update

- Rebuilt the companion as a Next.js App Router project so `/dungeon` and `/inventory` are real routes, not rewrite targets to potentially missing HTML files.
- Added responsive landing and focused navigation tabs.
- Added procedural cel/toon-shaded hero and guardian in React Three Fiber, Three.js scene lighting, particles, shadows, and Rapier physics colliders.
- Added mobile landscape prompt, best-effort fullscreen/orientation lock, optional device-orientation steering, and touch joystick.
- Added distinct synthesized Web Audio cues for attack, skill, buff, guard, dodge, potion, hit, and victory.
- Preserved the canonical 10-floor JSON data from the bot project.
- Added `/api/floors`, read-only `/api/player`, and authenticated `/api/sync` routes for optional Supabase snapshot integration.
- Added seed/template/spirit-sheet specification and SVG sprite-sheet layout template.
- Added visual concept art; it is reference art and is not misrepresented as a rigged model or production sprite atlas.
